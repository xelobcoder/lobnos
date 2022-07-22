import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";

function Organization () {
    return (
        <>
           <h1>Organization</h1>
        </>
    )
}


export default Organization;


Organization.getLayout = function(page) {
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