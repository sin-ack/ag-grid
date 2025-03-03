import { ColDef,GridApi,GridReadyEvent } from '@ag-grid-community/core';
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { Component } from '@angular/core';
import { getData } from './data';

// Required feature modules are registered in app.module.ts

@Component({
  selector: "my-app",
  template: `
    <div class="test-container">
      <div class="test-header">
        <div style="margin-bottom: 1rem;">
          <input type="checkbox" id="pinFirstColumnOnLoad" />
          <label for="pinFirstColumnOnLoad">Pin first column on load</label>
        </div>
        <div style="margin-bottom: 1rem;">
          <button id="reloadGridButton" (click)="reloadGrid()">
            Reload Grid
          </button>
        </div>
      </div>
      <ag-grid-angular
        *ngIf="isVisible$"
        style="width: 100%; height: 100%;"
        class="ag-theme-alpine"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [rowSelection]="rowSelection"
        (gridReady)="onGridReady($event)"
      ></ag-grid-angular>
    </div>
  `,
})
export class AppComponent {
  private isVisible$ = true
  private gridApi!: GridApi
  public columnDefs: ColDef[] = [
    { field: "name", headerName: "Athlete", width: 250 },
    { field: "person.country", headerName: "Country" },
    { field: "person.age", headerName: "Age" },
    { field: "medals.gold", headerName: "Gold Medals" },
    { field: "medals.silver", headerName: "Silver Medals" },
    { field: "medals.bronze", headerName: "Bronze Medals" },
  ]

  public rowData: any[] | null = getData()
  public rowSelection: "single" | "multiple" = "multiple"

  reloadGrid() {
    this.isVisible$ = false
    setTimeout(() => (this.isVisible$ = true), 1)
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api
    const checkbox = document.querySelector<HTMLInputElement>(
      "#pinFirstColumnOnLoad"
    )!
    const shouldPinFirstColumn = checkbox && checkbox.checked
    if (shouldPinFirstColumn) {
      params.columnApi.applyColumnState({
        state: [{ colId: "name", pinned: "left" }],
      })
    }
  }
}
