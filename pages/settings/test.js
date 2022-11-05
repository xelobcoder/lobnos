import Widal from '../../components/LabTestForms/widal';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import Urinalysis from '../../components/LabTestForms/urinalysis';
import FullBloodCountSetup from '../../components/setup/biochemistry/Hematology/fullbloodcount';
import FBCLISTPARAMETERS from '../../components/setup/biochemistry/Hematology/fullcountsetuplist';
import Fbcsetupindex from '../../components/setup/biochemistry/Hematology/fbcsetupindex';
import AIDS from '../../components/LabTestForms/aids';
import HEPATITISBPROFILE from '../../components/LabTestForms/hepatitisBprofile';
import BloodGroup from '../../components/LabTestForms/bloodgroup';
import BloodGroupTableList from '../../components/TESTTABLES/bloodgroup';
export default function TestPanels() {
 return (
  <>
  <FullBloodCountSetup/>
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
