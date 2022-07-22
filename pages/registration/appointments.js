import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";

function Appointment () {
    return (
        <>
           <h1>Appointment</h1>
        </>
    )
}


export default Appointment


Appointment.getLayout = function(page) {
    return (
       <>
         <Header/>
         <div className="wrapper">
            <div className="side">
                <SidebarFrontPage/>
            </div>
            <div className="main">
                {page}
            </div>
         </div>
       </>
    )
  }