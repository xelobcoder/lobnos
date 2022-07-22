import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";

function Clients () {
    return (
        <>
           <h1>Clients</h1>
        </>
    )
}


export default Clients;


Clients.getLayout = function(page) {
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