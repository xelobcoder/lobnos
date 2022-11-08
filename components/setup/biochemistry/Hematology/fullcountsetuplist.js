import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import parameter from "./countparameter";

export default function FBCLISTPARAMETERS({ data }) {


 const mappedData = parameter.map((parameter, index) => {
  return {
   id: index + 1,
   name: parameter.name,
   upper: parameter.upper,
   lower: parameter.lower,
   unit: parameter.unit,
  }
 })

 const [reference, setReference] = useState(data || mappedData)
 const columnDefs = [
  {headerName:'#', field:'id'},
  { headerName: "parameter", field: "name" },
  { headerName: "lower limit", field: "lower" },
  { headerName: "upper limit", field: "upper" },
  { headerName: "units", field: "unit" },
 ]

 const defineAllrows = useMemo(() => ({
  onRowClicked: (e) => {
   console.log(e.data)
  },
  pivotMode: true,
 }),[])

 // define grid columns options for all
 const onAllColumns = useMemo(() => ({
  sortable: true,
  filter: true,
  checkbox: true,
 }))

 

 return (
  <>
   <div className="ag-theme-alpine" style={{ height: '100%', width: '30vw',overflowX:'hidden !important' }}>
    <AgGridReact columnDefs={columnDefs}  rowHeight={50} onGridReady={defineAllrows}
    rowData={reference} defaultColDef={onAllColumns} >

    </AgGridReact>
   </div>
  </>
 )
}