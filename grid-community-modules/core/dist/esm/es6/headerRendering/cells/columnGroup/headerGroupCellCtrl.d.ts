// Type definitions for @ag-grid-community/core v30.0.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { DragItem } from "../../../dragAndDrop/dragAndDropService";
import { ColumnEventType } from "../../../events";
import { ColumnGroup } from "../../../entities/columnGroup";
import { ITooltipFeatureComp } from "../../../widgets/tooltipFeature";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp, ITooltipFeatureComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setResizableDisplayed(displayed: boolean): void;
    setWidth(width: string): void;
    setColId(id: string): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
}
export declare class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {
    private readonly columnModel;
    private readonly dragAndDropService;
    private readonly gridApi;
    private columnApi;
    private columnGroup;
    private comp;
    private expandable;
    private displayName;
    private groupResizeFeature;
    constructor(columnGroup: ColumnGroup, parentRowCtrl: HeaderRowCtrl);
    setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void;
    resizeLeafColumnsToFit(source: ColumnEventType): void;
    private setupUserComp;
    private setupTooltip;
    private setupExpandable;
    private refreshExpanded;
    private addAttributes;
    private addClasses;
    private setupMovingCss;
    private onFocusIn;
    protected handleKeyDown(e: KeyboardEvent): void;
    setDragSource(eHeaderGroup: HTMLElement): void;
    getDragItemForGroup(): DragItem;
    private isSuppressMoving;
}
