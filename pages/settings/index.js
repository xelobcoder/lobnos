import Header from '../../components/header';
import LiverPanel from '../../components/setup/liver';
import Sidebar from '../../components/sidebar';


function Settings() {
    return(
       <>
         <h1>Settings</h1>
       </>
    )
}

export default Settings;



Settings.getLayout = function PageLayout(page) {
     return(
        <>
           <Header/>
           <Sidebar/>
           {page}
        </>
     )
}