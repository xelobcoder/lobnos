import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { TextField, Button, Typography, Box, Container } from '@mui/material'
import axios from 'axios'
import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/router'
import { handleActivation } from '../../components/Auth/registerclient'
import TableIsLoading from '../../components/accessories/TableIsLoading'

export default function Activator({ data }) {
  const [activationData, setActivationData] = React.useState(data)
  const [id, setId] = React.useState('')
  const billing = useRouter()

  let patientid = useRouter().query.patientid
  const handleNameFilter = (e) => {
    let filtered = e.target.value
    setId(filtered)
    // filtered client first , if absence , go to server and get the appropriate response
    if (data.length != 0) {
      let f = data.filter((item, index) => {
        return (
          new String(item.FULLNAME)
            .toLowerCase()
            .startsWith(filtered.toLowerCase()) ||
          new String(item.PATIENTID)
            .toLowerCase()
            .startsWith(filtered.toLowerCase())
        )
      })

      setActivationData(f)
    }
  }

  //   handle Billing

  const handleBilling = (e, patientid) => {
    billing.push(`/registration/billing?patientid=${patientid}`)
  }

  // prefill the search field with the patient id after registration
  // registration is done -> patient id is available ? prefill the search field with the patient id

  React.useEffect(() => {
    if (patientid) {
      setActivationData(data.filter((item) => item.PATIENTID == patientid))
      setId(patientid)
    }
  }, [])
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '30% 20% 20% auto',
          gridGap: '20px 20px',
          margin: '20px',
        }}
      >
        <TextField
          label="Enter patient id or fullname"
          value={id}
          size="small"
          onChange={(e) => handleNameFilter(e)}
        />
        <TextField type="date" size="small" />
        <TextField type="date" size="small" />
        <Button type="button" variant="contained" color="primary">
          search
        </Button>
      </div>
      <div style={{ height: '70vh', overflowY: 'auto', margin: '10px' }}>
        <table className="activation-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>patient id</th>
              <th>fullname</th>
              <th>date</th>
              <th>status</th>
              <th>action</th>
              <th>options</th>
            </tr>
          </thead>
          <tbody>
           {activationData.length == 0 && <TableIsLoading col={8}/>}
           {activationData.map((item, index) => {
              return (
                <tr key={item.ID}>
                  <td>{item.ID}</td>
                  <td>{item.PATIENTID}</td>
                  <td>{item.FULLNAME}</td>
                  <td>{item.DATE.slice(0, 10)}</td>
                  <td>
                    <div
                      className={
                        item.ACTIVATION_STATUS == 'TRUE'
                          ? 'activated'
                          : 'deactivated'
                      }
                    >
                      {item.ACTIVATION_STATUS == 'TRUE'
                        ? 'activated'
                        : 'deactivated'}
                    </div>
                  </td>
                  <td className="activation-cell">
                    <Button
                      variant="outlined"
                      color={
                        item.ACTIVATION_STATUS == 'TRUE' ? 'error' : 'success'
                      }
                      onClick={(e) => {
                        handleActivation(
                          e,
                          item.ID,
                          item.ACTIVATION_STATUS,
                          item.PATIENTID,
                        )
                      }}
                    >
                      {item.ACTIVATION_STATUS == 'FALSE'
                        ? 'activate'
                        : 'deactivate'}
                    </Button>
                  </td>
                  <td>
                    {item.ACTIVATION_STATUS == 'TRUE' ? (
                      <Button
                        sx={{ width: '100px' }}
                        color="success"
                        onClick={(e) => {
                          handleBilling(e, item.PATIENTID)
                        }}
                      >
                        billing
                      </Button>
                    ) : (
                      <Button variant="teal" sx={{ width: '120px' }}>
                        <Link
                          href={`/registration/?patientid=${item.PATIENTID}`}
                        >
                          <a> edit info</a>
                        </Link>
                      </Button>
                    )}
                    {/* <Button>
                      <Link href={'/clientinfo/'}><a>view info</a></Link>
                    </Button> */}
                  </td>
                </tr>
              )
            })}

          </tbody>
          {activationData.length == 0 && (
            <tr>
              <td colSpan="7">
                <Typography variant="h5">No data found</Typography>
              </td>
            </tr>
          )}
        </table>
      </div>
    </>
  )
}

Activator.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div
          className="main"
          style={{
            maxHeight: '80vh !important',
            backgroundColor: 'whitesmoke',
          }}
        >
          {page}
        </div>
      </div>
    </>
  )
}

// get server side props
export async function getServerSideProps(context) {
  let endpoint = 'http://localhost:5000/api/v1/activation'
  let res = await axios.get(endpoint)
  let data = res.data
  return {
    props: {
      data,
    },
  }
}
