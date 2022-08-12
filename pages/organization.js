import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header'
import { DataGrid } from '@mui/x-data-grid'
import {  Button, Box } from '@mui/material'
import { useState } from 'react'
import AddOrganization from '../components/Addorganization'
import Opay from '../components/payment';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

const Group = () => {
  const [show, setShow] = useState(true)
  const [showOpay, setShowOpay] = useState(false)

  return (
    <>
      <AddOrganization />
      <Opay />
      <div className="org-button-wrapper">
        <Button type="submit" variant="contained" endIcon={<SendIcon/>} >
          save
        </Button>
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
      <Box sx={{ height: 50, width: '100%' }}>
        <div className="org-button-wrapper">
          {!show ? (
            <Button
              type="button"
              onClick={() => {
                setShow(!show)
              }}
            >
              + add an organization
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setShow(!show)
              }}
            >
              organizations
            </Button>
          )}
        </div>
      </Box>
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
