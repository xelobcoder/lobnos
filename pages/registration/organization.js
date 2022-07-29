import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import { useState, useRef, useEffect } from 'react'
import { createTable } from '../../components/table'
import AddOrganization from '../../components/Addorganization'

function Organization({ data }) {
  const [organization, setOrganization] = useState([])
  const [entries, setEntries] = useState(10)
  const hasMounted = useRef(false)
  const columns = [
    'id',
    'name',
    'phone',
    'email',
    'website',
    'location',
    'contact person',
    'contact person contact contact person contact',
    'address',
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
      createTable('--table',columns,data)
      hasMounted.current = true
    }
  }, [organization])

  useEffect( () => {
  
  }, [entries])


  return (
    <div>
      <div className='panel-top-pane'>
         <ul>
            <li>edit</li>
            <li>delete</li>
            <li>export csv</li>
            <li>export excel</li>
            <li>view</li>
            <li>refresh</li>
            <li>add organization</li>
            <li>
               <input type='text' placeholder='filter'></input>
            </li>
            <li>show  <input type='number'></input>entries</li>
         </ul>
      </div>
      <table id='--table'>

      </table>
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
