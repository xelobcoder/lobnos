import { Offcanvas, Nav } from "react-bootstrap";

export default function SidebarComponent({ showSidebar, onHide, company, sideLinks, expandedLinks, toggleSubLinks }) {
     return (
          <Offcanvas show={showSidebar} onHide={onHide} className="bg-primary text-white" placement="start">
               <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fw-bold">{company}</Offcanvas.Title>
               </Offcanvas.Header>
               <Offcanvas.Body>
                    <Nav className="flex-column">
                         {sideLinks.map((item, index) => (
                              <div key={index}>
                                   <Nav.Link
                                        href={item.subLinks ? "#" : item.link}
                                        className="d-flex align-items-center text-white mb-2"
                                        onClick={() => item.subLinks && toggleSubLinks(index)}
                                        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                   >
                                        {item.icon}
                                        <span className="ms-2">{item.title}</span>
                                   </Nav.Link>

                                   {/* Render subLinks if they exist and are expanded */}
                                   {item.subLinks && expandedLinks[index] && (
                                        <div className="ms-4">
                                             {item.subLinks.map((subItem, subIndex) => (
                                                  <div key={subIndex}>
                                                       <Nav.Link
                                                            href={subItem.subLinks ? "#" : subItem.link}
                                                            className="d-flex align-items-center text-white mb-2"
                                                            onClick={() => subItem.subLinks && toggleSubLinks(`${index}-${subIndex}`)}
                                                            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                                                       >
                                                            {subItem.icon}
                                                            <span className="ms-2">{subItem.title}</span>
                                                       </Nav.Link>

                                                       {/* Render nested subLinks if they exist and are expanded */}
                                                       {subItem.subLinks && expandedLinks[`${index}-${subIndex}`] && (
                                                            <div className="ms-4">
                                                                 {subItem.subLinks.map((nestedSubItem, nestedIndex) => (
                                                                      <Nav.Link
                                                                           href={nestedSubItem.link}
                                                                           key={nestedIndex}
                                                                           className="d-flex align-items-center text-white mb-2"
                                                                           style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                                                                      >
                                                                           {nestedSubItem.icon}
                                                                           <span className="ms-2">{nestedSubItem.title}</span>
                                                                      </Nav.Link>
                                                                 ))}
                                                            </div>
                                                       )}
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         ))}
                    </Nav>
               </Offcanvas.Body>
          </Offcanvas>
     );
}
