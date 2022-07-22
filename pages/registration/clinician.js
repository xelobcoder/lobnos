import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";

function Clinicians () {
    return (
        <>
           <h1>Clinicians</h1>
        </>
    )
}


export default Clinicians;



Clinicians.getLayout = function(page) {
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