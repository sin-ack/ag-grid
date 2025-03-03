import { Grid, GridOptions } from "@ag-grid-community/core"

///// left table
interface LeftData {
  function: string;
  value: string;
}

const rowDataLeft: LeftData[] = [
  { function: 'Number Squared', value: '=ctx.theNumber * ctx.theNumber' },
  { function: 'Number x 2', value: '=ctx.theNumber * 2' },
  { function: "Today's Date", value: '=new Date().toLocaleDateString()' },
  { function: 'Sum A', value: '=ctx.sum("a")' },
  { function: 'Sum B', value: '=ctx.sum("b")' },
]

const gridOptionsLeft: GridOptions<LeftData> = {
  columnDefs: [
    { headerName: 'Function', field: 'function', minWidth: 150 },
    { headerName: 'Value', field: 'value' },
    { headerName: 'Times 10', valueGetter: 'getValue("value") * 10' },
  ],
  defaultColDef: {
    flex: 1,
  },
  enableCellExpressions: true,
  rowData: rowDataLeft,
  context: {
    theNumber: 4,
  },
  enableCellChangeFlash: true,
}

///// Right table
interface RightData {
  a: number;
  b: number;
}
const rowDataRight: RightData[] = [
  { a: 1, b: 22 },
  { a: 2, b: 33 },
  { a: 3, b: 44 },
  { a: 4, b: 55 },
  { a: 5, b: 66 },
  { a: 6, b: 77 },
  { a: 7, b: 88 },
]

const gridOptionsRight: GridOptions<RightData> = {
  columnDefs: [
    { field: 'a' },
    { field: 'b' },
  ],
  defaultColDef: {
    flex: 1,
    width: 150,
    editable: true,
    onCellValueChanged: cellValueChanged,
  },
  rowData: rowDataRight,
}

gridOptionsLeft.context.sum = function (field: keyof RightData) {
  var result = 0
  rowDataRight.forEach(function (item) {
    result += item[field]
  })
  return result
}

// tell Left grid to refresh when number changes
function onNewNumber(value: string) {
  gridOptionsLeft.context.theNumber = new Number(value)
  gridOptionsLeft.api!.refreshCells()
}

// we want to tell the Left grid to refresh when the Right grid values change
function cellValueChanged() {
  gridOptionsLeft.api!.refreshCells()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDivLeft = document.querySelector<HTMLElement>('#myGridLeft')!
  new Grid(gridDivLeft, gridOptionsLeft)
  var gridDivRight = document.querySelector<HTMLElement>('#myGridRight')!
  new Grid(gridDivRight, gridOptionsRight)
})
