import { useState } from "react";
import { Navbar, Nav, Button, Offcanvas } from "react-bootstrap";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { handleLogout } from "../Auth/customFetch";

export default function MainLayout({ children, sideLinks }) {
     const { applicationsettings } = useApplicationSettings();
     const { user, company, daysToExpiration } = applicationsettings;
     const { role } = user;
     const [showSidebar, setShowSidebar] = useState(false);

     const toggleSidebar = () => setShowSidebar(!showSidebar);

     const isProductExpired = () => {
          if (daysToExpiration === 0 || daysToExpiration < 0) {
               return <div className="text-white br-5 p-2 fw-bold text-uppercase bg-danger">License expired</div>;
          } else if (daysToExpiration > 0 && daysToExpiration <= 30) {
               return <div className="text-white br-5 p-2 fw-bold text-uppercase bg-danger">{daysToExpiration} days to license expiration</div>;
          }
     };

     if (!["scientist", "manager", "admin"].includes(role)) {
          return <Authorization />;
     }

     
     const updatedSideLinks = [
          {
               link: "/",
               title: "Home",
               icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                         <path fill="none" d="M0 0h24v24H0z"></path>
                         <path d="M12.5812 2.68627C12.2335 2.43791 11.7664 2.43791 11.4187 2.68627L1.9187 9.47198L3.08118 11.0994L11.9999 4.7289L20.9187 11.0994L22.0812 9.47198L12.5812 2.68627ZM19.5812 12.6863L12.5812 7.68627C12.2335 7.43791 11.7664 7.43791 11.4187 7.68627L4.4187 12.6863C4.15591 12.874 3.99994 13.177 3.99994 13.5V20C3.99994 20.5523 4.44765 21 4.99994 21H18.9999C19.5522 21 19.9999 20.5523 19.9999 20V13.5C19.9999 13.177 19.844 12.874 19.5812 12.6863ZM5.99994 19V14.0146L11.9999 9.7289L17.9999 14.0146V19H5.99994Z"></path>
                    </svg>
               )
          },
          ...sideLinks
     ];

     return (
          <>
               {/* Navbar */}
               <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
                    <Button variant="outline-light" onClick={toggleSidebar} className="me-2">
                         <MenuIcon />
                    </Button>
                    <Navbar.Brand href="/" className="fw-bold d-none d-md-block">{company}</Navbar.Brand>
                    <div className="d-flex ms-auto align-items-center gap-3">
                         {isProductExpired()}
                         <NotificationsIcon className="text-white" />
                         <PersonIcon className="text-white" />
                         <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                    </div>
               </Navbar>

               {/* Offcanvas Sidebar for smaller devices */}
               <Offcanvas show={showSidebar} onHide={toggleSidebar} className="bg-primary text-white" placement="start">
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title className="fw-bold">{company}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <Nav className="flex-column">
                              {updatedSideLinks.map((item, index) => (
                                   <Nav.Link href={item.link} key={index} className="d-flex align-items-center text-white mb-2">
                                        {item.icon}
                                        <span className="ms-2">{item.title}</span>
                                   </Nav.Link>
                              ))}
                              <div className="mt-auto pt-3 border-top">
                                   <div className="d-flex align-items-center">
                                        <PersonIcon />
                                        <span className="ms-2">Profile</span>
                                   </div>
                                   <Button variant="outline-light" onClick={handleLogout} className="w-100 mt-2">Logout</Button>
                                   <div className="mt-3 text-center text-white-50">v0.03</div>
                              </div>
                         </Nav>
                    </Offcanvas.Body>
               </Offcanvas>

               {/* Main Content */}
               <main>
                    <div className="bg-white container-fluid">
                         {children}
                    </div>
               </main>
          </>
     );
}
