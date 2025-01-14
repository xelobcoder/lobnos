"use client"
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, ListGroup, Card } from "react-bootstrap";

interface FormData {
     complaints: string;
     hpc: string;
     pmh: string;
     sh: string;
     odq: string;
     dhx: string;
     se: string;
     fh: string;
     obsGynecHistory: string;
     oe: string;
}

const DynamicForm = () => {
     const [fieldRequirements, setFieldRequirements] = useState({
          complaints: true,
          hpc: false,
          pmh: false,
          sh: true,
          odq: false,
          dhx: false,
          se: false,
          fh: false,
          obsGynecHistory: false,
          oe: false,
     });

     const handleToggleRequired = (field: keyof FormData) => {
          setFieldRequirements((prev) => ({
               ...prev,
               [field]: !prev[field],
          }));
     };

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          alert("Form Submitted Successfully!");
     };

     return (
          <Container fluid>
               <Row className="mt-3 pls-color">
                    <Col md={12}>
                         <ListGroup>
                              <ListGroup.Item className=" bg-secondary-subtle pls-color fw-bold p-3">
                                   Medical Consultation Fields
                              </ListGroup.Item>
                              <ListGroup.Item>
                                   <Form onSubmit={handleSubmit}>
                                        <ol >

                                             {[
                                                  ["Complaints", "complaints"],
                                                  ["History of Presenting Complaint (HPC)", "hpc"],
                                                  ["Past Medical History (PMH)", "pmh"],
                                                  ["Social History (SH)", "sh"],
                                                  ["On Direct Questions (ODQ)", "odq"],
                                                  ["Drug History (DHx)", "dhx"],
                                                  ["Systemic Enquiries (SE)", "se"],
                                                  ["Family History (FH)", "fh"],
                                                  ["Obs./Gynecological History", "obsGynecHistory"],
                                                  ["On Examination (OE)", "oe"],
                                             ].map(([label, field]) => (
                                                  <li key={field} className="py-4 d-flex justify-content-between" style={{ borderBottom: '1px solid lightgray' }}>
                                                       <label className="pls-label pls-color">
                                                            {label}
                                                       </label>
                                                       <Form.Check
                                                            type="switch"
                                                            label={fieldRequirements[field as keyof FormData] ? "Required" : "Optional"}
                                                            checked={fieldRequirements[field as keyof FormData]}
                                                            onChange={() => handleToggleRequired(field as keyof FormData)}
                                                       />
                                                  </li>
                                             ))}

                                        </ol>
                                        <Button type="submit" className="my-3 btn-sm" variant="primary">
                                             Submit
                                        </Button>
                                   </Form>
                              </ListGroup.Item>
                         </ListGroup>
                    </Col>
               </Row>
          </Container>
     );
};

export default DynamicForm;
