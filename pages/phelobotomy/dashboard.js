import Header from '../../components/header'
import { Box } from '@mui/material'
import SidebarFrontPage from '../../components/frontpagesidebar'
import Phelobotomy_USER_LIST from '../../components/phelobotomy/list'
export default function Phelobotomy({ data }) {
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
          <Phelobotomy_USER_LIST data={data} />
        </div>
      </div>
    </div>
  )
}

// getserverside props

export async function getServerSideProps(context) {
  // get phelobotomy data from database table ---- performing test
  const res = await fetch('http://localhost:3000/api/phelobotomy')
  const data = await res.json()
  return {
    props: {
      data,
    },
  }
}

Phelobotomy.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main" style={{ backgroundColor: 'white' }}>
          {page}
        </div>
      </div>
    </>
  )
}
