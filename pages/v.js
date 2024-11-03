import { useState } from "react";
import { Navbar, Nav, Button, Offcanvas, Container } from "react-bootstrap";
import { useApplicationSettings } from "../components/Auth/useApplicationContext";
import { handleLogout } from "../components/Auth/customFetch";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";

export default function LaboratoryDashboard({ children }) {
     const { applicationsettings } = useApplicationSettings();
     const { user, company, daysToExpiration } = applicationsettings;
     const { role } = user;
     const [showSidebar, setShowSidebar] = useState(false);

     const toggleSidebar = () => setShowSidebar(!showSidebar);

     // Sidebar links
     const sidebarLinks = [
          { title: "Sample Validation", link: "/sample", icon: <HomeIcon /> },
          { title: "Operations", link: "/operations/laboratory", icon: <HomeIcon /> },
          { title: "Processing stage", link: "/operations/laboratory/processing", icon: <HomeIcon /> },
          { title: "Completed stage", link: "/operations/laboratory/completed", icon: <HomeIcon /> },
          { title: "Validation stage", link: "/operations/laboratory/validation", icon: <HomeIcon /> },
          { title: "Critical Values Alert", link: "/operations/laboratory/criticalvaluesAlert", icon: <HomeIcon /> },
          { title: "Turn around Time", link: "/operations/laboratory/turnaroundtime", icon: <HomeIcon /> },
          { title: "Archive Results", link: "/operations/laboratory/patientarchives", icon: <HomeIcon /> },
          { title: "Phelobotomy", link: "/phelobotomy", icon: <HomeIcon /> },
          { title: "Rejected Samples", link: "/sample/rejected", icon: <HomeIcon /> },
     ];

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

               {/* Sidebar */}
               <div className={`sidebar bg-secondary text-white d-none d-lg-flex flex-column p-3`} style={{ height: "100vh", width: "250px", position: "fixed" }}>
                    <Nav className="flex-column">
                         {sidebarLinks.map((item, index) => (
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
               </div>

               {/* Offcanvas Sidebar for smaller devices */}
               <Offcanvas show={showSidebar} onHide={toggleSidebar} className="bg-secondary text-white" placement="start">
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title className="fw-bold">{company}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <Nav className="flex-column">
                              {sidebarLinks.map((item, index) => (
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
               <Container fluid className="mt-3" style={{ marginLeft: "250px" }}>
                    <div className="p-3">
                         {children}
                    </div>
               </Container>
          </>
     );
}
