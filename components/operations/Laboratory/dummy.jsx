import { useState } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import Link from 'next/link';

export default function Navigation() {
       const [showSidebar, setShowSidebar] = useState(false);

       const sidebarLinks = [
              { title: "Sample Validation", link: "/sample" },
              { title: "Operations", link: "/operations/laboratory" },
              { title: "Processing stage", link: "/operations/laboratory/processing" },
              { title: "Completed stage", link: "/operations/laboratory/completed" },
              { title: "Validation stage", link: "/operations/laboratory/validation" },
              { title: "Archive Results", link: "/operations/laboratory/patientarchives" },
              { title: "Phelobotomy", link: "/phelobotomy" },
              { title: "Rejected Samples", link: "/sample/rejected" },
       ];

       const handleSidebarToggle = () => setShowSidebar(!showSidebar);

       return (
              <>
                     {/* Navbar */}
                     <Navbar bg="primary" variant="dark" expand="lg">
                            <Container>
                                   <Navbar.Brand as={Link} href="/">Lab Dashboard</Navbar.Brand>
                                   <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                   <Navbar.Collapse id="basic-navbar-nav">
                                          <Nav className="me-auto">
                                                 <Link href="/" passHref legacyBehavior>
                                                        <Nav.Link>Home</Nav.Link>
                                                 </Link>
                                                 <Link href="/about" passHref legacyBehavior>
                                                        <Nav.Link>About</Nav.Link>
                                                 </Link>
                                                 <Link href="/contact" passHref legacyBehavior>
                                                        <Nav.Link>Contact</Nav.Link>
                                                 </Link>
                                          </Nav>
                                          <Button variant="outline-light" onClick={handleSidebarToggle}>
                                                 Menu
                                          </Button>
                                   </Navbar.Collapse>
                            </Container>
                     </Navbar>

                     {/* Sidebar */}
                     <Offcanvas show={showSidebar} onHide={handleSidebarToggle} placement="start">
                            <Offcanvas.Header closeButton>
                                   <Offcanvas.Title>Sidebar</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                   <Nav className="flex-column">
                                          {sidebarLinks.map((item, index) => (
                                                 <Link key={index} href={item.link} passHref legacyBehavior>
                                                        <Nav.Link>{item.title}</Nav.Link>
                                                 </Link>
                                          ))}
                                   </Nav>
                            </Offcanvas.Body>
                     </Offcanvas>
              </>
       );
}
