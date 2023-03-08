import Widal from '../../components/LabTestForms/widal';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import Fbcsetupindex from '../../components/setup/biochemistry/hematology/fbcindex';
import FullBloodCountSetup from '../../components/setup/biochemistry/hematology/fbcsetup';
import MainSettings from '../../components/settingsComponents/settings';
import SettingsSidebar from '../../components/settingsComponents/sidebars';

export default function TestPanelsSetup() {
 return (
  <>
   <MainSettings />
  </>
 )
}


TestPanelsSetup.getLayout = function PageLayout(page) {
 return (
  <>
   <div className='s-s-pliter'>
    <div className='sid'>
     <SettingsSidebar />
    </div>
    <div className='main'>
     {page}
    </div>
   </div>
  </>
 )
}