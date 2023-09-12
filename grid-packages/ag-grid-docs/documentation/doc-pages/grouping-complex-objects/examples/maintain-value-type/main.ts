import { Grid, GridOptions, ValueFormatterParams, ValueGetterParams, KeyCreatorParams } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
    { field: 'age' },
    {
      field: 'country',
      rowGroup: true,
      hide: true,
      keyCreator: countryKeyCreator,
      valueGetter: countryValueGetter,
      valueFormatter: countryValueFormatter,
    },
    { field: 'year', rowGroup: true },
    { field: 'date' },
    { field: 'sport', minWidth: 200 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 300,
  },
  groupMaintainValueType: true,
}

function countryValueFormatter(params: ValueFormatterParams) {
  return `[${params.value.code}] ${params.value.name}`;
}

function countryKeyCreator(params: KeyCreatorParams) {
  var countryObject = params.value;
  return countryObject.code
}

function countryValueGetter(params: ValueGetterParams) {
  // hack the data  - replace the country with an object of country name and code
  var countryName = params.data.country
  var countryCode = countryName.substring(0, 2).toUpperCase()
  return {
    name: countryName,
    code: countryCode,
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
