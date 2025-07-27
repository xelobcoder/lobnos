import React, { useEffect, useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import { fetchTestTemplate } from "../../inventory/LimsConnection/lib";
import InventoryStockFiltering from "../../inventory/LimsConnection/InventoryStockFiltering";
import { RiAddLine } from '@remixicon/react';
import PreviewTestInformation from "./PreviewTestInformation";

const DocumentModal = ({ selectedDoc, showModal, handleCloseModal }) => {
     const [templates, setTemplates] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [isTemplateNull, setIsTemplateNull] = useState(false);

     const getTemplates = async () => {
          try {
               setIsLoading(true);
               const { template } = await fetchTestTemplate(selectedDoc.id);
               if (!template) return setIsTemplateNull(true);
               setTemplates(template);
          } catch (error) {
               console.error("Error fetching templates:", error);
          } finally {
               setIsLoading(false);
          }
     };

     useEffect(() => {
          if (selectedDoc?.id) getTemplates();
     }, [selectedDoc?.id]);

     const handleSelectedStock = (value) => {
          if (typeof value === "object" && value?.value) {
               const stockExists = templates.some(template => template.stockid === value.value);

               if (!stockExists) {
                    const newTemplate = [...templates, { ...value, stockid: value.value, quantity: 0 }];
                    setTemplates(newTemplate);
               } else {
                    console.warn("This stock is already in the template list.");
               }
          }
     };

     const handleQuantityChange = (stockid, quantity) => {
          setTemplates(templates.map(item =>
               item.stockid === stockid ? { ...item, quantity: Number(quantity) } : item
          ));
     };

     const handleRemoveStock = (stockid) => {
          setTemplates(templates.filter(item => item.stockid !== stockid));
     };

     const handleSave = () => {
          console.log("Save action triggered", templates);
     };

     return (
          <Modal show={showModal} onHide={handleCloseModal} size="lg" backdrop={false}>
               <Modal.Header closeButton className="fw-bold bg-secondary-subtle">
                    <Modal.Title>{selectedDoc.fullname} ({selectedDoc.patientid}) [AscensionId: {selectedDoc.ascensionid}]</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    <PreviewTestInformation testId={selectedDoc.id} />

                    <div className="my-3 col-lg-6 col-xl-6 col-sm-12 col-md-12">
                         <InventoryStockFiltering
                              selectedWarehouse={'all'}
                              page={1}
                              count={100}
                              isDisabled={templates.length === 0}
                              onSelectStock={handleSelectedStock}
                         />
                    </div>

                    {isTemplateNull ? (
                         <p>No template data available.</p>
                    ) : isLoading ? (
                         <p>Loading...</p>
                    ) : (
                         <ListGroup className="p-0">
                              <ListGroup.Item className="grid-30-30-30 bg-secondary-subtle fw-bold text-capitalize">
                                   <span>Stock Name</span>
                                   <span>Quantity</span>
                                   <span>Action</span>
                              </ListGroup.Item>
                              {templates.map((item, index) => (
                                   <ListGroup.Item key={item.stockid}>
                                        <div className="grid-30-30-30 pls-color">
                                             <span>{item.label}</span>
                                             <span>
                                                  <input
                                                       type="number"
                                                       className="custom-input col-lg-6 col-sm-12 col-md-6"
                                                       value={item.quantity || 1}
                                                       onChange={(e) => handleQuantityChange(item.stockid, e.target.value)}
                                                       tabIndex={index + 1} // Set sequential tabIndex for each input
                                                  />
                                             </span>
                                             <span>
                                                  <button
                                                       className="btn btn-outline-danger btn-sm text-capitalize"
                                                       onClick={() => handleRemoveStock(item.stockid)}
                                                  >
                                                       Remove
                                                  </button>
                                             </span>
                                        </div>
                                   </ListGroup.Item>
                              ))}
                         </ListGroup>
                    )}
               </Modal.Body>
               <Modal.Footer>
                    <Button
                         className="btn-sm"
                         variant="primary"
                         onClick={handleSave}
                         tabIndex={templates.length + 1}
                    >
                         Save Data
                    </Button>
                    <Button
                         className="btn-sm"
                         variant="secondary"
                         onClick={handleCloseModal}
                         tabIndex={templates.length + 2}
                    >
                         Close
                    </Button>
               </Modal.Footer>
          </Modal>
     );
};

export default DocumentModal;
