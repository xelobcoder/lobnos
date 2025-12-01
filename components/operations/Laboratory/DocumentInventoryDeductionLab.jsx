import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { fetchTestTemplate } from "../../inventory/LimsConnection/lib";
import { customPost } from "../../Auth/customFetch";
import { toast } from "react-toastify";
import { useApplication } from "../../Auth/useApplicationContext";

const DocumentModal = ({ selectedDoc, showModal, handleCloseModal }) => {
     const [templates, setTemplates] = useState([]);
     const [templateData, setTemplateData] = useState(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isTemplateNull, setIsTemplateNull] = useState(false);
     const performed_by = useApplication()?.user.employeeid;

     const getTemplates = async () => {
          try {
               setIsLoading(true);
               const result = await fetchTestTemplate(selectedDoc.id);
               setTemplateData(result);
               setTemplates(result.items || []);
          } catch (error) {
               setIsTemplateNull(true);
          } finally {
               setIsLoading(false);
          }
     };

     const handleApplyDeduction = async () => {
          if (!templateData || !templates || templates.length === 0) {
               toast.error('No template data available for deduction');
               return;
          }

          // Validate required fields
          if (!selectedDoc.patientid || !selectedDoc.ascensionid) {
               toast.error('Patient information is missing (patientid or ascensionid)');
               return;
          }

          try {
               setIsLoading(true);

               // Prepare consumption data for each item in the template
               const consumptions = templates.map(item => {
                    // Ensure all required fields are present
                    console.log('Preparing consumption for item:', item);
                    const consumptionData = {
                         test_id: selectedDoc.id?.toString() || '',
                         item_id: item.itemId,
                         quantity_used: parseInt(item.quantity) || 0,
                         test_type: templateData.name?.toString() || '',
                         patient_id: parseInt(selectedDoc.patientid) || 0,
                         ascension_id: parseInt(selectedDoc.ascensionid) || 0,
                         testid: parseInt(selectedDoc.testid) || parseInt(selectedDoc.id) || 0,
                         performed_by,
                         batch_number: item.batch_number?.toString() || null,
                         test_type_id: templateData.testId?.toString() || '',
                         notes: `Test consumption for ${selectedDoc.fullname || 'Unknown'} (${selectedDoc.patientid || 'N/A'})`
                    };

                    // Validate required fields are not empty
                    const requiredFields = ['test_id', 'item_id', 'quantity_used', 'test_type', 'patient_id', 'ascension_id', 'performed_by'];
                    const missingFields = requiredFields.filter(field => !consumptionData[field] && consumptionData[field] !== 0);

                    if (missingFields.length > 0) {
                         throw new Error(`Missing required fields for item ${item.item_name || item.item_sku}: ${missingFields.join(', ')}`);
                    }

                    return consumptionData;
               });

               console.log('Consumption data to send:', consumptions);

               const consumptionData = { consumptions };
               const response = await customPost('inventory/transactions/consume/test', 'POST', consumptionData);

               if (response.success) {
                    toast.success(`Stock deduction applied successfully! ${templates.length} item(s) consumed.`);
                    handleCloseModal();
               } else {
                    toast.error(`Failed to apply deduction: ${response.error?.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Error applying deduction:', error);
               toast.error(`Failed to apply stock deduction: ${error.message}`);
          } finally {
               setIsLoading(false);
          }
     };

     useEffect(() => {
          getTemplates();
     }, []);


     console.log('Fetched Templates:', templates);


     return (
          <Modal show={showModal} onHide={handleCloseModal} size="lg" backdrop="static">
               <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
                         <span >Inventory Deduction Template</span>
                    </Modal.Title>
               </Modal.Header>

               <Modal.Body>
                    {isLoading ? (
                         <div className="text-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-3 text-muted">Loading template data...</p>
                         </div>
                    ) : isTemplateNull ? (
                         <div className="alert alert-warning m-4">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              <strong>No Template Found!</strong> No inventory template is configured for this test.
                         </div>
                    ) : templateData ? (
                         <>
                              {/* Patient Information Card */}
                              <div className="mb-3 p-3 bg-light rounded">
                                   <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Patient Information</h6>
                                   <div className="d-flex flex-wrap align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                        <div>
                                             <small className="text-muted">Name:</small>{' '}
                                             <span className="fw-bold">{selectedDoc.fullname}</span>
                                        </div>
                                        <span className="text-muted">||</span>
                                        <div>
                                             <small className="text-muted">Patient ID:</small>{' '}
                                             <span className="fw-bold">{selectedDoc.patientid}</span>
                                        </div>
                                        <span className="text-muted">||</span>
                                        <div>
                                             <small className="text-muted">Ascension ID:</small>{' '}
                                             <span className="fw-bold">{selectedDoc.ascensionid}</span>
                                        </div>
                                   </div>
                              </div>

                              <hr className="my-3" />

                              {/* Template Information */}
                              <div className="mb-3">
                                   <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>Template Information</h6>
                                   <div className="p-3 bg-light rounded">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                             <div>
                                                  <h6 className="mb-1 fw-bold" style={{ fontSize: '1rem' }}>{templateData.name}</h6>
                                                  <small className="text-muted">Test ID: <code className="bg-white px-2 py-1 rounded">{templateData.testId}</code></small>
                                             </div>
                                             <span className="badge bg-primary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                                                  {templateData.items_count} Items
                                             </span>
                                        </div>
                                        {templateData.description && (
                                             <p className="mb-2 text-muted" style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                                                  {templateData.description}
                                             </p>
                                        )}
                                        <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '0.8rem' }}>
                                             <div>
                                                  <small>Created by:</small> <strong>{templateData.creator_name}</strong>
                                             </div>
                                             <span>||</span>
                                             <div>
                                                  <small>Updated:</small> {new Date(templateData.updated_at).toLocaleDateString()}
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              <hr className="my-3" />

                              {/* Required Items */}
                              <div>
                                   <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>Required Inventory Items</h6>
                                   {templates.length === 0 ? (
                                        <div className="alert alert-info" style={{ fontSize: '0.88rem' }}>
                                             No items configured in this template.
                                        </div>
                                   ) : (
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover mb-0" style={{ fontSize: '0.88rem' }}>
                                                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                       <tr>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Item Name</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>SKU</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Quantity</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Unit</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {templates.map((item, index) => (
                                                            <tr key={item.id}>
                                                                 <td style={{ padding: '10px 12px', fontWeight: '500' }}>{item.item_name}</td>
                                                                 <td style={{ padding: '10px 12px' }}>
                                                                      <code style={{ backgroundColor: '#e7f3ff', color: '#0066cc', padding: '2px 7px', borderRadius: '4px', fontSize: '0.82rem' }}>
                                                                           {item.item_sku}
                                                                      </code>
                                                                 </td>
                                                                 <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#198754' }}>
                                                                      {item.quantity}
                                                                 </td>
                                                                 <td style={{ padding: '10px 12px', color: '#6c757d' }}>{item.unit}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   )}
                              </div>
                         </>
                    ) : null}
               </Modal.Body>

               <Modal.Footer>
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={handleApplyDeduction} disabled={isLoading}>
                         {isLoading ? 'Applying...' : 'Apply Deduction'}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleCloseModal}>
                         Close
                    </button>
               </Modal.Footer>
          </Modal>
     );
};

export default DocumentModal;
