import Widal from '../../components/LabTestForms/widal';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import Urinalysis from '../../components/LabTestForms/urinalysis';
import FullBloodCountSetup from '../../components/setup/biochemistry/Hematology/fullbloodcount';
import FBCLISTPARAMETERS from '../../components/setup/biochemistry/Hematology/fullcountsetuplist';
import Fbcsetupindex from '../../components/setup/biochemistry/Hematology/fbcsetupindex';
import AIDS from '../../components/setup/biochemistry/Hematology/aids';
export default function TestPanels() {
 return (
  <>
   {/* <Fbcsetupindex/> */}
   <AIDS/>
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
