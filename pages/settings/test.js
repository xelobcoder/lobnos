import Widal from '../../components/LabTestForms/widal';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
// import {Link, Outlet} from 'react-router-dom';
import Urinalysis from '../../components/LabTestForms/urinalysis';
export default function TestPanels() {
  return (
    <>
      <Urinalysis/>
    </>
  )
}






TestPanels.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main">
          {page}
        </div>
      </div>
    </>
  )
}
