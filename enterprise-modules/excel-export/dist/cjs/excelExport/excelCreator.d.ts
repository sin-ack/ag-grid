import { ExcelExportParams, ExcelFactoryMode, ExcelExportMultipleSheetParams, GridOptionsWrapper, IExcelCreator } from '@ag-grid-community/core';
import { ExcelCell } from '@ag-grid-community/core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
import { BaseCreator } from "@ag-grid-community/csv-export";
declare type SerializingSession = ExcelXlsxSerializingSession | ExcelXmlSerializingSession;
export declare const getMultipleSheetsAsExcel: (params: import("@ag-grid-community/core").PackageFileParams<ExcelExportParams>) => Blob;
export declare const exportMultipleSheetsAsExcel: (properties: import("@ag-grid-community/core").PackageFileParams<ExcelExportParams>) => void;
export declare class ExcelCreator extends BaseCreator<ExcelCell[][], SerializingSession, ExcelExportParams> implements IExcelCreator {
    private columnController;
    private valueService;
    private gridOptions;
    private stylingService;
    private gridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    private exportMode;
    postConstruct(): void;
    export(userParams?: ExcelExportParams): string;
    exportDataAsExcel(params?: ExcelExportParams): string;
    getDataAsExcel(params?: ExcelExportParams): Blob | string;
    setFactoryMode(factoryMode: ExcelFactoryMode, exportMode?: 'xml' | 'xlsx'): void;
    getFactoryMode(exportMode: 'xml' | 'xlsx'): ExcelFactoryMode;
    getGridRawDataForExcel(params: ExcelExportParams): string;
    getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob;
    exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void;
    getMimeType(): string;
    getDefaultFileName(): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params: ExcelExportParams): SerializingSession;
    private styleLinker;
    isExportSuppressed(): boolean;
    private setExportMode;
    private getExportMode;
    protected packageFile(params: ExcelExportMultipleSheetParams): Blob;
}
export {};
