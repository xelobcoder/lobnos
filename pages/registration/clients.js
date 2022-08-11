import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import React, { useEffect, useRef, useState } from 'react'
// import Table from '../../components/tab'

export function Clients({ data }) {
  const [clients, setClients] = useState([])

  return (
    <>
      <h1>Restructuring to meet end user UI demands</h1>
    </>
  )
}

export default Clients

export async function getServerSideProps() {
  const res = await fetch('http://localhost:3000/api/hello')
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
        <div className="main">{page}</div>
      </div>
    </>
  )
}
