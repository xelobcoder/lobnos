import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";

function Registration() {
  return (
    <>

    </>
  )
}


export default Registration;


Registration.getLayout = function (page) {
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