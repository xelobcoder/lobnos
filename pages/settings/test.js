import Widal from '../../components/LabTestForms/widal';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import Fbcsetupindex from '../../components/setup/biochemistry/Hematology/fbcsetupindex';

export default function TestPanels() {
 return (
  <>
  {/* <FullBloodCountSetup/> */}
  <Fbcsetupindex/>
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
