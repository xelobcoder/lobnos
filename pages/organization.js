import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header'
import { Button, Box } from '@mui/material'
import { useState,useEffect } from 'react'
import AddOrganization from '../components/Addorganization'
import Opay from '../components/payment';
import SendIcon from '@mui/icons-material/Send';
import { customFetch } from '../components/Auth/customFetch'

const Group = () => {
  const [show, setShow] = useState(true)
  const [showOpay, setShowOpay] = useState(false)

  return (
    <>
      <AddOrganization />
      <Opay />
      <div className="org-button-wrapper">
        <Button type="submit" variant="contained" endIcon={<SendIcon />} >
          save
        </Button>
      </div>
    </>
  )
}

function Organization() {
  const [data, setData] = useState([])
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

  const [show, setShow] = useState(true);


  useEffect(() => {
    const getInitData = async () => {
      let data = await customFetch('organization')
      setData(data)
    }
    getInitData()
  }, [])

  return (
    <div className='container'>
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
    </div>
  )
}

export default Organization


// Organization.getLayout = function (page) {
//   return (
//     <>
//       <Header />
//       <div className="wrapper">
//         <div className="side">
//           <SidebarFrontPage />
//         </div>
//         <div className="main">{page}</div>
//       </div>
//     </>
//   )
// }
