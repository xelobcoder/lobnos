import Header from '../../components/header'
import { Box } from '@mui/material'
import SidebarFrontPage from '../../components/frontpagesidebar'
import Phelobotomy_USER_LIST from '../../components/phelobotomy/list'
import React, { useEffect, useState } from 'react'
import TEST_DETAILS from '../../components/phelobotomy/details'
export default function Phelobotomy() {
  const [data, setData] = useState([])
  const [status, setStatus] = useState(false)
  const [timer, setTimer] = useState(60000)

  // get data from database
  useEffect(() => {
    let getdata = async () => {
      let data = await fetch('http://localhost:3000/api/phelobotomy')
      let datajson = await data.json()
      setData(datajson)
    }
    getdata()

    setInterval(() => {
      getdata()
    }, timer)
  }, [timer])
  return (
    <div>
      <div className="phelobotomy-table">
        <ul>
          <li>
            <div className="heap">id</div>
            <div className="heap">patientid</div>
            <div className="heap">test</div>
            <div className="heap">date</div>
            <div className="heap">time elapsed</div>
            <div className="heap">view details</div>
          </li>
        </ul>
        <div className="phelobotomy-body">
          {
            data.map((item, index) => {
             return   <Phelobotomy_USER_LIST key={index} item={item} index={index} />
            })
          }
        </div>
      </div>
    </div>
  )
}


Phelobotomy.getLayout = function (page) {
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
