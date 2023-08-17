import SidebarFrontPage from "../components/frontpagesidebar";
import Header from "../components/header";

export default function Appointment() {
  return (
    <>
      <div className="m-2 p-2">
        <code>
          TOD0: fullstack calender framework to be used here. Take note
        </code>
      </div>
    </>
  )
}





Appointment.getLayout = function (page) {
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