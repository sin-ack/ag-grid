import {
    IClientSideRowModel,
    Column,
    SetFilterParams,
    AgPromise,
    SetFilterValues,
    SetFilterValuesFunc,
    SetFilterValuesFuncParams,
    TextFilter,
    TextFormatter,
    ValueFormatterService,
    IEventEmitter,
    EventService,
    RowNode,
    _,
    SetFilterModelValue,
    ValueFormatterParams,
    GridOptionsService,
    ColumnModel,
    ValueService
} from '@ag-grid-community/core';
import { ISetFilterLocaleText } from './localeText';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
import { FlatSetDisplayValueModel } from './flatSetDisplayValueModel';
import { ISetDisplayValueModel, SetFilterModelTreeItem } from './iSetDisplayValueModel';
import { TreeSetDisplayValueModel } from './treeSetDisplayValueModel';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CALLBACK, TAKEN_FROM_GRID_VALUES
}

export interface SetValueModelParams<V> {
    valueFormatterService: ValueFormatterService,
    gridOptionsService: GridOptionsService,
    columnModel: ColumnModel,
    valueService: ValueService,
    filterParams: SetFilterParams<any, V>,
    setIsLoading: (loading: boolean) => void,
    translate: (key: keyof ISetFilterLocaleText) => string,
    caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat,
    createKey: (value: V | null, node?: RowNode) => string | null,
    valueFormatter?: (params: ValueFormatterParams) => string,
    usingComplexObjects?: boolean,
    treeDataTreeList?: boolean,
    groupingTreeList?: boolean
}

/** @param V type of value in the Set Filter */
export class SetValueModel<V> implements IEventEmitter {
    public static EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

    private readonly localEventService = new EventService();
    private readonly formatter: TextFormatter;
    private readonly clientSideValuesExtractor: ClientSideValuesExtractor<V>;
    private readonly doesRowPassOtherFilters: (node: RowNode) => boolean;
    private readonly suppressSorting: boolean;
    private readonly keyComparator: (a: string | null, b: string | null) => number;
    private readonly entryComparator: (a: [string | null, V | null], b: [string | null, V | null]) => number;
    private readonly compareByValue: boolean;
    private readonly convertValuesToStrings: boolean;
    private readonly caseSensitive: boolean;
    private readonly displayValueModel: ISetDisplayValueModel<V>;
    private readonly filterParams: SetFilterParams<any, V>;
    private readonly setIsLoading: (loading: boolean) => void;
    private readonly translate: (key: keyof ISetFilterLocaleText) => string;
    private readonly caseFormat: <T extends string | null>(valueToFormat: T) => typeof valueToFormat;
    private readonly createKey: (value: V | null, node?: RowNode) => string | null;
    private readonly usingComplexObjects: boolean;

    private valuesType: SetFilterModelValuesType;
    private miniFilterText: string | null = null;

    /** Values provided to the filter for use. */
    private providedValues: SetFilterValues<any, V> | null = null;

    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    private allValuesPromise: AgPromise<(string | null)[]>;

    /** All possible values for the filter, sorted if required. */
    private allValues: Map<string | null, V | null> = new Map();

    /** Remaining keys when filters from other columns have been applied. */
    private availableKeys = new Set<string | null>();

    /** Keys that have been selected for this filter. */
    private selectedKeys = new Set<string | null>();

    private initialised: boolean = false;

    constructor(params: SetValueModelParams<V>) {
        const {
            usingComplexObjects,
            columnModel,
            valueService,
            treeDataTreeList,
            groupingTreeList,
            filterParams,
            gridOptionsService,
            valueFormatterService,
            valueFormatter
        } = params;
        const {
            column,
            colDef,
            textFormatter,
            doesRowPassOtherFilter,
            suppressSorting,
            comparator,
            rowModel,
            values,
            caseSensitive,
            convertValuesToStrings,
            treeList,
            treeListPathGetter,
            treeListFormatter
        } = filterParams;

        this.filterParams = filterParams;
        this.setIsLoading = params.setIsLoading;
        this.translate = params.translate;
        this.caseFormat = params.caseFormat;
        this.createKey = params.createKey;
        this.usingComplexObjects = !!params.usingComplexObjects;
        this.formatter = textFormatter || TextFilter.DEFAULT_FORMATTER;
        this.doesRowPassOtherFilters = doesRowPassOtherFilter;
        this.suppressSorting = suppressSorting || false;
        this.convertValuesToStrings = !!convertValuesToStrings;
        const keyComparator = comparator ?? colDef.comparator as (a: any, b: any) => number;
        const treeDataOrGrouping = !!treeDataTreeList || !!groupingTreeList;
        // If using complex objects and a comparator is provided, sort by values, otherwise need to sort by the string keys.
        // Also if tree data, grouping, or date with tree list, then need to do value sort
        this.compareByValue = !!((usingComplexObjects && keyComparator) || treeDataOrGrouping || (treeList && !treeListPathGetter));
        if (treeDataOrGrouping && !keyComparator) {
            this.entryComparator = this.createTreeDataOrGroupingComparator() as any;
        } else if (treeList && !treeListPathGetter && !keyComparator) {
            this.entryComparator = ([_aKey, aValue]: [string | null, V | null], [_bKey, bValue]: [string | null, V | null]) => _.defaultComparator(aValue, bValue);
        } else {
            this.entryComparator = ([_aKey, aValue]: [string | null, V | null], [_bKey, bValue]: [string | null, V | null]) => keyComparator(aValue, bValue);
        }
        this.keyComparator = keyComparator as any ?? _.defaultComparator;
        this.caseSensitive = !!caseSensitive
        const getDataPath = gridOptionsService.get('getDataPath');

        if (rowModel.getType() === 'clientSide') {
            this.clientSideValuesExtractor = new ClientSideValuesExtractor(
                rowModel as IClientSideRowModel,
                this.filterParams,
                this.createKey,
                this.caseFormat,
                columnModel,
                valueService,
                treeDataOrGrouping,
                !!treeDataTreeList,
                getDataPath
            );
        }

        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;

            this.providedValues = values;
        }

        this.displayValueModel = treeList ? new TreeSetDisplayValueModel(
            this.formatter,
            treeListPathGetter,
            treeListFormatter,
            treeDataTreeList || groupingTreeList
        ) : new FlatSetDisplayValueModel<V>(
            valueFormatterService,
            valueFormatter,
            this.formatter,
            column
        ) as any;

        this.updateAllValues().then(updatedKeys => this.resetSelectionState(updatedKeys || []));
    }

    public addEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.addEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.removeEventListener(eventType, listener, async);
    }

    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public refreshValues(): AgPromise<void> {
        const currentModel = this.getModel();

        this.updateAllValues();

        // ensure model is updated for new values
        return this.setModel(currentModel);
    }

    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public overrideValues(valuesToUse: (V | null)[]): AgPromise<void> {
        return new AgPromise<void>(resolve => {
            // wait for any existing values to be populated before overriding
            this.allValuesPromise.then(() => {
                this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                this.providedValues = valuesToUse;
                this.refreshValues().then(() => resolve());
            });
        });
    }

    /** @return has anything been updated */
    public refreshAfterAnyFilterChanged(): AgPromise<boolean> {
        if (this.showAvailableOnly()) {
            return this.allValuesPromise.then(keys => {
                this.updateAvailableKeys(keys ?? [], 'otherFilter');
                return true;
            });
        }
        return AgPromise.resolve(false);
    }

    public isInitialised(): boolean {
        return this.initialised;
    }

    private updateAllValues(): AgPromise<(string | null)[]> {
        this.allValuesPromise = new AgPromise<(string | null)[]>(resolve => {
            switch (this.valuesType) {
                case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
                case SetFilterModelValuesType.PROVIDED_LIST: {
                    resolve(this.processAllKeys(this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES, this.providedValues as (V | null)[]));

                    break;
                }

                case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                    this.setIsLoading(true);

                    const callback = this.providedValues as SetFilterValuesFunc<any, V>;
                    const { columnApi, api, context, column, colDef } = this.filterParams;
                    const params: SetFilterValuesFuncParams<any, V> = {
                        success: values => {
                            this.setIsLoading(false);

                            resolve(this.processAllKeys(false, values));
                        },
                        colDef,
                        column,
                        columnApi,
                        api,
                        context,

                    };

                    window.setTimeout(() => callback(params), 0);

                    break;
                }

                default:
                    throw new Error('Unrecognised valuesType');
            }
        });

        this.allValuesPromise.then(values => this.updateAvailableKeys(values || [], 'reload')).then(() => this.initialised = true);

        return this.allValuesPromise;
    }

    private processAllKeys(getFromRows: boolean, providedValues: (V | null)[] | null): (string | null)[] {
        const values = getFromRows ? this.getValuesFromRows(false) : this.uniqueValues(this.validateProvidedValues(providedValues!));

        const sortedKeys = this.sortKeys(values);

        this.allValues = values ?? new Map();
        
        return sortedKeys;
    }

    private validateProvidedValues(values: (V | null)[]): (V | null)[]{
        if (this.usingComplexObjects && values?.length) {
            const firstValue = values[0];
            if (firstValue && typeof firstValue !== 'object' && typeof firstValue !== 'function') {
                const firstKey = this.createKey(firstValue);
                if  (firstKey == null) {
                    _.doOnce(() => console.warn(
                            'Set Filter Key Creator is returning null for provided values and provided values are primitives. Please provide complex objects or set convertValuesToStrings=true in the filterParams. See https://www.ag-grid.com/javascript-data-grid/filter-set-filter-list/#filter-value-types'
                        ), 'setFilterComplexObjectsProvidedNull'
                    );
                } else {
                    _.doOnce(() => console.warn(
                            'AG Grid: Set Filter has a Key Creator, but provided values are primitives. Did you mean to provide complex objects or enable convertValuesToStrings?'
                        ), 'setFilterComplexObjectsProvidedPrimitive'
                    );
                }
            }
        }
        return values;
    }

    public setValuesType(value: SetFilterModelValuesType) {
        this.valuesType = value;
    }

    public getValuesType(): SetFilterModelValuesType {
        return this.valuesType;
    }

    public isKeyAvailable(key: string | null): boolean {
        return this.availableKeys.has(key);
    }

    private showAvailableOnly(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
    }

    private updateAvailableKeys(allKeys: (string | null)[], source: 'reload' | 'otherFilter'): void {
        const availableKeys = this.showAvailableOnly() ? this.sortKeys(this.getValuesFromRows(true)) : allKeys;

        this.availableKeys = new Set(availableKeys);
        this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });

        this.updateDisplayedValues(source, allKeys);
    }

    public sortKeys(nullableValues: Map<string | null, V | null> | null): (string | null)[] {
        const values = nullableValues ?? new Map();

        if (this.suppressSorting) { return Array.from(values.keys()); }

        let sortedKeys;
        if (this.compareByValue) {
            sortedKeys = Array.from(values.entries()).sort(this.entryComparator).map(([key]) => key);
        } else {
            sortedKeys = Array.from(values.keys()).sort(this.keyComparator);
        }

        if (this.filterParams.excelMode && values.has(null)) {
            // ensure the blank value always appears last
            sortedKeys = sortedKeys.filter(v => v != null);
            sortedKeys.push(null);
        }

        return sortedKeys;
    }

    private getValuesFromRows(removeUnavailableValues = false): Map<string | null, V | null> | null {
        if (!this.clientSideValuesExtractor) {
            console.error('AG Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return null;
        }

        const predicate = (node: RowNode) => (!removeUnavailableValues || this.doesRowPassOtherFilters(node));

        return this.clientSideValuesExtractor.extractUniqueValues(predicate, removeUnavailableValues && !this.caseSensitive ? this.allValues : undefined);
    }

    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    public setMiniFilter(value?: string | null): boolean {
        value = _.makeNull(value);

        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }

        this.miniFilterText = value;
        this.updateDisplayedValues('miniFilter');

        return true;
    }

    public getMiniFilter(): string | null {
        return this.miniFilterText;
    }

    public updateDisplayedValues(source: 'reload' | 'otherFilter' | 'miniFilter' | 'expansion', allKeys?: (string | null)[]): void {
        if (source === 'expansion') {
            this.displayValueModel.refresh();
            return;
        }

        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayValueModel.updateDisplayedValuesToAllAvailable((key: string | null) => this.getValue(key), allKeys, this.availableKeys, source);
            return;
        }

        // if filter present, we filter down the list
        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = this.caseFormat(this.formatter(this.miniFilterText) || '');

        const matchesFilter = (valueToCheck: string | null): boolean =>
            valueToCheck != null && this.caseFormat(valueToCheck).indexOf(formattedFilterText) >= 0;

        const nullMatchesFilter = !!this.filterParams.excelMode && matchesFilter(this.translate('blanks'));

        this.displayValueModel.updateDisplayedValuesToMatchMiniFilter(
            (key: string | null) => this.getValue(key),
            allKeys,
            this.availableKeys,
            matchesFilter,
            nullMatchesFilter,
            source);
    }

    public getDisplayedValueCount(): number {
        return this.displayValueModel.getDisplayedValueCount();
    }

    public getDisplayedItem(index: number): string | SetFilterModelTreeItem | null {
        return this.displayValueModel.getDisplayedItem(index);
    }

    public getSelectAllItem(): string | SetFilterModelTreeItem  {
        return this.displayValueModel.getSelectAllItem();
    }

    public hasSelections(): boolean {
        return this.filterParams.defaultToNothingSelected ?
            this.selectedKeys.size > 0 :
            this.allValues.size !== this.selectedKeys.size;
    }

    public getKeys(): SetFilterModelValue {
        return Array.from(this.allValues.keys());
    }

    public getValues(): (V | null)[] {
        return Array.from(this.allValues.values());
    }

    public getValue(key: string | null): V | null {
        return this.allValues.get(key)!;
    }

    public selectAllMatchingMiniFilter(clearExistingSelection = false): void {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedKeys = new Set(this.allValues.keys());
        } else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) { this.selectedKeys.clear(); }

            this.displayValueModel.forEachDisplayedKey(key => this.selectedKeys.add(key));
        }
    }

    public deselectAllMatchingMiniFilter(): void {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedKeys.clear();
        } else {
            // ensure everything that matches the mini filter is deselected
            this.displayValueModel.forEachDisplayedKey(key => this.selectedKeys.delete(key));
        }
    }

    public selectKey(key: string | null): void {
        this.selectedKeys.add(key);
    }

    public deselectKey(key: string | null): void {
        if (this.filterParams.excelMode && this.isEverythingVisibleSelected()) {
            // ensure we're starting from the correct "everything selected" state
            this.resetSelectionState(this.displayValueModel.getDisplayedKeys());
        }

        this.selectedKeys.delete(key);
    }

    public isKeySelected(key: string | null): boolean {
        return this.selectedKeys.has(key);
    }

    public isEverythingVisibleSelected(): boolean {
        return !this.displayValueModel.someDisplayedKey(it => !this.isKeySelected(it));
    }

    public isNothingVisibleSelected(): boolean {
        return !this.displayValueModel.someDisplayedKey(it => this.isKeySelected(it));
    }

    public getModel(): SetFilterModelValue | null {
        return this.hasSelections() ? Array.from(this.selectedKeys) : null;
    }

    public setModel(model: SetFilterModelValue | null): AgPromise<void> {
        return this.allValuesPromise.then(keys => {
            if (model == null) {
                this.resetSelectionState(keys ?? []);
            } else {
                // select all values from the model that exist in the filter
                this.selectedKeys.clear();

                const existingFormattedKeys: Map<string | null, string | null> = new Map();
                this.allValues.forEach((_value, key) => {
                    existingFormattedKeys.set(this.caseFormat(key), key);
                });

                model.forEach(unformattedKey => {
                    const formattedKey = this.caseFormat(_.makeNull(unformattedKey));
                    const existingUnformattedKey = existingFormattedKeys.get(formattedKey);
                    if (existingUnformattedKey !== undefined) {
                        this.selectKey(existingUnformattedKey);
                    }
                });
            }
        });
    }

    private uniqueValues(values: (V | null)[] | null): Map<string | null, V | null> {
        const uniqueValues: Map<string | null, V | null> = new Map();
        const formattedKeys: Set<string | null> = new Set();
        (values ?? []).forEach(value => {
            const valueToUse = _.makeNull(value);
            const unformattedKey = this.convertAndGetKey(valueToUse);
            const formattedKey = this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                uniqueValues.set(unformattedKey, valueToUse);
            }
        });

        return uniqueValues;
    }

    private convertAndGetKey(value: V | null): string | null {
        return this.convertValuesToStrings ? value as any : this.createKey(value);
    }

    private resetSelectionState(keys: (string | null)[]): void {
        if (this.filterParams.defaultToNothingSelected) {
            this.selectedKeys.clear();
        } else {
            this.selectedKeys = new Set(keys);
        }
    }

    public hasGroups(): boolean {
        return this.displayValueModel.hasGroups();
    }

    private createTreeDataOrGroupingComparator(): (a: [string | null, string[] | null], b: [string | null, string[] | null]) => number {
        return ([_aKey, aValue]: [string | null, string[] | null], [_bKey, bValue]: [string | null, string[] | null]) => {
            if (aValue == null) {
                return bValue == null ? 0 : -1;
            } else if (bValue == null) {
                return 1;
            }
            for (let i = 0; i < aValue.length; i++) {
                if (i >= bValue.length) {
                    return 1;
                }
                const diff = _.defaultComparator(aValue[i], bValue[i]);
                if (diff !== 0) {
                    return diff;
                }
            }
            return 0;
        };
    }
}
