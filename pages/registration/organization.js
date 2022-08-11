import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { DataGrid } from '@mui/x-data-grid'
import { Table, Button, Box } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import AddOrganization from '../../components/Addorganization'
import Opay from '../../components/payment'

const Group = () => {
  const [show, setShow] = useState(true)
  const [showOpay, setShowOpay] = useState(false)

  return (
    <>
      {show ? <AddOrganization /> : null}
      {showOpay ? <Opay /> : null}
      <div className="org-button-wrapper">
        {
          show ? (<Button variant="contained"
            onClick={(e) => { setShowOpay(true); setShow(false) }}>
            Next
          </Button>) : null
        }
        {
          showOpay ? (<Button variant="contained"
            onClick={(e) => { setShowOpay(false); setShow(true) }}>
            previous</Button>) : null
        }
        {showOpay ? <Button variant="contained">save</Button> : null}
      </div>
    </>
  )
}

function Organization({ data }) {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 200 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'contact person', headerName: 'Contact Person', width: 200 },
    {
      field: 'contact person contact',
      headerName: 'Contact Person contact',
      width: 200,
    },
  ]

  const [show, setShow] = useState(true)

  return (
    <>
      <Box sx={{ height: 500, width: '100%' }}>
        {show ? (
          <Group />
        ) : (
          <DataGrid
            rows={data}
            columns={columns}
            rowHeight={50}
            pageSize={3}
            filterMode="client"
            rowsPerPageOptions={[4]}
            checkboxSelection
            onSelectionChange={(e) => {
              console.log(e.target)
            }}
          />
        )}
      </Box>
    </>
  )
}

export default Organization

export async function getServerSideProps() {
  const res = await fetch('http://localhost:3000/api/org')
  const data = await res.json()
  return { props: { data } }
}

Organization.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main">{page}</div>
      </div>
    </>
  )
}
