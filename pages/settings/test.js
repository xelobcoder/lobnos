import Widal from '../../components/LabTestForms/widal';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
// import {Link, Outlet} from 'react-router-dom';
import RenalResults from '../../components/LabTestForms/renal';
import LipidProfile from '../../components/LabTestForms/lipidprofile';
import RandomBloodSugar from '../../components/LabTestForms/randomsugar';
export default function TestPanels() {
  return (
    <>
      {/* <LipidProfile/> */}
      <RandomBloodSugar/>
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
