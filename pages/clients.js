import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'
// import ag-grid material
import 'ag-grid-community/dist/styles/ag-theme-bootstrap.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import 'ag-grid-community/dist/styles/ag-theme-dark.css'
import 'ag-grid-community/dist/styles/ag-theme-blue.css'
import { Button, Input } from '@mui/material'

export function Clients({ data }) {
 const [clients, setClients] = useState(data)


 const formatActivationStatus = useCallback((status) => {
  if (status === 'active') {
   return 'Active'
  } else {
   return 'Inactive'
  }
 }, [])

 const formatActionStatusRenderer = useCallback((params) => {
  console.log(params.value)
  if (params.value == 'TRUE') {
   return (
    <Button>
     <span style={{ width: '100px' }} className="activated">
      Active
     </span>
    </Button>
   )
  } else {
   return (
    <Button variant="text" color="error">
     <span style={{ width: '100px' }} className="deactivated">
      Inactive
     </span>
    </Button>
   )
  }
 }, [])

 const formatDate = useCallback((date) => {
  return date.slice(0, 10)
 }, [])

 const formatDateRenderer = useCallback((params) => {
  return (
   <div>
    <span>{formatDate(params.value)}</span>
   </div>
  )
 }, [])

 const filterTable = (e) => {
  console.log(e.target.value);
 }

 const coloumnDef = [
  // field for check box
  {
   headerName: '',
   field: '',
   checkboxSelection: true,
   headerCheckboxSelection: true,
   width: 30,
   pinned: 'left',
  },
  { field: 'ID', headerName: 'ID' },
  {
   field: 'PATIENTID',
   cellStyle: function (params) {
    return { backgroundColor: 'whitesmoke', color: 'grey' }
   },
   headerName: 'PATIENTID',
   pinned: 'right',
  },
  {
   field: 'FULLNAME',
   headerName: 'Full Name',
   pinned: true,
   sortable: true,
   tooltipValueGetter: function (g) {
    let value = g.data.ACTIVATION_STATUS
    return value == 'TRUE' ? 'Activated' : 'Not Activated'
   },
  },
  { field: 'EMAIL', headerName: 'Email' },
  { field: 'DOB', headerName: 'DOB', cellRenderer: formatDateRenderer },
  { field: 'ORGANIZATION', headerName: 'Organization' },
  {
   field: 'ACTIVATION_STATUS',
   headerName: 'Activation Status',
   cellStyle: function (params) {
    if (params.value == 'TRUE') {
     return { color: 'green' }
    } else {
     return { color: 'red' }
    }
   },
   valueFormatter: formatActivationStatus,
   cellRenderer: formatActionStatusRenderer,
  },
  {
   field: 'DATE',
   headerName: 'Date',
   cellRenderer: formatDateRenderer,
  },
  { field: 'GENDER', headerName: 'gender' },
  { field: 'MARITAL_STATUS', headerName: 'Marital Status' },
  { field: 'RELATIONSHIP', headerName: 'Relationship' },
  { field: 'EMMERGENCY_CONTACT', headerName: 'Emergency Contact' },
  { field: 'EMMERGENCY_CONTACT_NAME', headerName: 'Emergency Contact Name' },
  { field: 'MOBILE_NUMBER', headerName: 'Mobile Number' },
  { field: 'PATIENTORGANIZATION', headerName: 'Patient Organization' },
  { field: 'OCCUPATION', headerName: 'Patient Occupation' },
  {
   field: 'PATIENTTYPE',
   headerName: 'Patient Type',
  },
 ]

 const [columns, setColumns] = useState(coloumnDef)

 const defaultColumnDef = useMemo(
  () => ({
   resizable: true,
   filter: true,
  //  sortable: true,
   filter: true,
   flexGrow: 1,
   minWidth: 100,
   maxWidth: 500,
   editable: true,
   cellRenderer: 'agAnimateShowChangeCellRenderer',
   filter: 'agTextColumnFilter',
   cellStyle: {
    textAlign: 'left',
    color: 'black',
    textTransform: 'capitalize',
   },
  }),
  [],
 )

 const callRowId = useCallback((options) => {
  console.log(options.data.id)
 }, [])

 return (
  <>
   <div>
    <Button>exclude</Button>
    <Input variant='standard' placeholder='filter' onChange={(e) => { filterTable(e) }} />
   </div>
   <div
    className=" ag-theme-alpine"
    style={{ backgroundColor: 'whitesmoke', height: '900%' }}
   >
    <AgGridReact
     getRowId={callRowId}
     headerHeight={40}
     pivotHeaderHeight={40}
     rowData={clients}
     columnDefs={columns}
     defaultColDef={defaultColumnDef}
    //  animateRows={true}
    //  rowSelection="multiple"
     getRowStyle={(params) => {
      return {
       backgroundColor:
        params.node.rowIndex % 2 === 0 ? '#f5f5f5' : 'white',
      }
     }}
    ></AgGridReact>
   </div>
  </>
 )
}

export default Clients

export async function getServerSideProps() {
 const res = await fetch('http://localhost:3000/api/register')
 const data = await res.json()
 return { props: { data } }
}

Clients.getLayout = function (page) {
 return (
  <>
   <Header />
   <div className="wrapper">
    <div className="side">
     <SidebarFrontPage />
    </div>
    <div className="main" style={{ backgroundColor: 'whitesmoke' }}>
     {page}
    </div>
   </div>
  </>
 )
}
