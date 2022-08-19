import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header'
import React, { useEffect, useRef, useState, useMemo } from 'react'
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
// // import Table from '../../components/tab'

export function Clients({ data }) {
  const [clients, setClients] = useState([])


  // useEffect(() => {
  //   // make call to server every 10s
  //   const interval = setInterval(() => {
  //     fetch('/api/register')
  //       .then((res) => res.json())
  //       .then((data) => {
  //         setClients(data)
  //       }).catch((err) => {
  //         console.log(err)
  //       }
  //       )
  //   })
  // },[])

  const coloumnDef = [
    // field for check boz
    {
      headerName: '',
      field: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 30,
      headerCheckboxSelectionFilteredOnly: true,
      suppressMenu: true,
      suppressSorting: true,
      suppressMovable: true,
      suppressFilter: true,
      suppressSizeToFit: true,
      suppressResize: true,
      suppressCellFlash: true,
      suppressMenu: true,
      suppressMiddleClickScrolls: true,
      suppressCellSelection: true,
      pinned: 'left',
    },
    { field: 'ID', headerName: 'ID' },
    { field: 'PATIENTID', headerName: 'PATIENTID', pinned: 'right' },
    {
      field: 'FULLNAME',
      headerName: 'Full Name',
      pinned: true,
      sortable: false,
      tooltipValueGetter: function (g) {
        let value = g.data.ACTIVATION_STATUS
        return value == 'TRUE' ? 'Activated' : 'Not Activated'
      },
    },
    { field: 'EMAIL', headerName: 'Email' },
    { field: 'DOB', headerName: 'DOB' },
    { field: 'ORGANIZATION', headerName: 'Organization' },
    { field: 'ACTIVATION_STATUS', headerName: 'Activation Status',
     
  },
    { field: 'DATE', headerName: 'Date' },
    { field: 'GENDER', headerName: 'gender' },
    { field: 'MARITAL_STATUS', headerName: 'Marital Status' },
    { field: 'RELATIONSHIP', headerName: 'Relationship' },
    { field: 'EMMERGENCY_CONTACT', headerName: 'Emergency Contact' },
    { field: 'EMMERGENCY_CONTACT_NAME', headerName: 'Emergency Contact Name' },
    { field: 'MOBILE_NUMBER', headerName: 'Mobile Number' },
    { field: 'PATIENTORGANIZATION', headerName: 'Patient Organization' },
    { field: 'OCCUPATION', headerName: 'Patient Occupation' },
    { field: 'PATIENTTYPE', headerName: 'Patient Type' },
  ]

  const [columns, setColumns] = useState(coloumnDef)

  const defaultColumnDef = useMemo(
    () => ({
      resizable: true,
      filter: true,
      sortable: true,
      flexGrow: 1,
      minWidth: 100,
      maxWidth: 500,
      editable: true,
      cellStyle: {
        textAlign: 'left',
        color: 'black',
        textTransform: 'capitalize',
      },
    }),
    [],
  )

  return (
    <>
      <div
        className=" ag-theme-alpine" style={{backgroundColor: 'whitesmoke',height:'90vh'}}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columns}
          headerHeight={50}
          defaultColDef={defaultColumnDef}
          animateRows={true}
          rowSelection="multiple"
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
