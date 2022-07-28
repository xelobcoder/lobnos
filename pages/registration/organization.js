import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { useState, useRef, useEffect } from 'react'
import { createTable } from '../../components/table'
import AddOrganization from '../../components/Addorganization'

function Organization({ data }) {
  const [organization, setOrganization] = useState([])
  const hasMounted = useRef(false)
  const columns = [
    'id',
    'name',
    'phone',
    'email',
    'website',
    'location',
    'contact person',
    'contact person contact',
    'address',
  ]

  useEffect(() => {
    if (hasMounted.current === false) {
      setOrganization(data)
      createTable('--table', 'tablequery', columns,data)
      hasMounted.current = true
    }
  }, [organization])




  return (
    <div >
      <div className="--lobnos-card" style={{ display: 'none' }}>
        <div className="--lobnos-header">Organization information</div>
        <div className="--lobnos-body">
          <AddOrganization />
        </div>
      </div>
      <div className='--table-wrapper'>
        <div id="tablequery"></div>
        <table id="--table" className="table display p-3 mt-5 no-footer dataTable" width='100%'>
            
        </table>
        <div className="meme"></div>
      </div>
    </div>
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
