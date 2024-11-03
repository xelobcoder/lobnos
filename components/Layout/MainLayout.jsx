import { useState } from "react";
import { Navbar, Nav, Button, Offcanvas, Container } from "react-bootstrap";
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
                              {sideLinks.map((item, index) => (
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
                    <div className="bg-white container-fluid ">
                         {children}
                    </div>
               </main>
          </>
     );
}
