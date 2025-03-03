import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
 columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true },
    { field: 'athlete' },
    { field: 'year', pivot: true, enablePivot: true },
    { field: 'sport', pivot: true, enablePivot: true },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
  ],
  defaultColDef: {
    maxWidth: 140,
    resizable: true,
  },
  pivotMode: true,
  pivotPanelShow: 'always',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
