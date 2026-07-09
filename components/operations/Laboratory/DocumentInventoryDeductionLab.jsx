import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { fetchTestTemplate } from "../../inventory/limsConnection/lib";
import { customPost, customFetch } from "../../Auth/customFetch";
import { toast } from "react-toastify";
import { useApplication } from "../../Auth/useApplicationContext";
import { RiAddCircleLine, RiDeleteBinLine } from "@remixicon/react";

const DocumentModal = ({ selectedDoc, showModal, handleCloseModal }) => {
     const user = useApplication()?.user;
     const branchid = useApplication()?.branchid;
     const performed_by = user?.employeeid;
     const [allConsumed, setAllConsumed] = useState(false);
     const [quantities, setQuantities] = useState({});
     const [availableItems, setAvailableItems] = useState([]);
     const [selectedItemId, setSelectedItemId] = useState('');
     const [selectedItemQuantity, setSelectedItemQuantity] = useState('1');
     const [showAddItem, setShowAddItem] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [isTemplateNull, setIsTemplateNull] = useState(false);
     const [templateData, setTemplateData] = useState(null);
     const [templates, setTemplates] = useState([]);
     const [availableBatches, setAvailableBatches] = useState([]);
     const [fifoBatch, setFifoBatch] = useState(null);
     const [selectedBatch, setSelectedBatch] = useState('');


     const loadAllInventoryItems = async () => {
          const url = `inventory/items?branchid=${branchid}&employeeid=${performed_by}`;
          try {
               const response = await customFetch(url);
               if (response?.success) {
                    setAvailableItems(response.data || []);
               }
          } catch (error) {
               console.error('Error loading inventory items:', error);
          }
     };

     const loadAvailableStockForItem = async (itemId) => {
          if (!itemId) return;
          try {
               const response = await customFetch(`inventory/transactions/available-stock/${itemId}?branchid=${branchid}&employeeid=${performed_by}`);
               if (response?.success) {
                    const data = response.data || {};
                    setAvailableBatches(data.available_batches || []);
                    setFifoBatch(data.fifo_batch || null);
                    setSelectedBatch((data.fifo_batch && data.fifo_batch.batch_number) || '');
               } else {
                    setAvailableBatches([]);
                    setFifoBatch(null);
                    setSelectedBatch('');
               }
          } catch (error) {
               console.error('Error loading available stock for item:', error);
               setAvailableBatches([]);
               setFifoBatch(null);
               setSelectedBatch('');
          }
     };

     const getTemplates = async () => {
          try {
               setIsLoading(true);
               const result = await fetchTestTemplate(selectedDoc.id, selectedDoc.ascensionid);
               setTemplateData(result);
               setTemplates(result.items || []);
               const consumedStatus = result.items.every(item => item.is_consumed === true);
               setAllConsumed(consumedStatus);

               // Initialize quantities with default values from template
               const initialQuantities = {};
               (result.items || []).forEach(item => {
                    initialQuantities[item.id] = parseInt(item.quantity) || 0;
               });
               setQuantities(initialQuantities);
          } catch (error) {
               setIsTemplateNull(true);
          } finally {
               setIsLoading(false);
          }
     };

     const handleQuantityChange = (itemId, newQuantity) => {
          const quantity = Math.max(0, parseInt(newQuantity) || 0);
          setQuantities(prev => ({
               ...prev,
               [itemId]: quantity
          }));
     };

     const addItemToTemplate = () => {
          if (!selectedItemId) {
               toast.warning('Please select an item');
               return;
          }

          const selectedItem = availableItems.find(item => item.id == selectedItemId);
          if (!selectedItem) {
               toast.error('Selected item not found');
               return;
          }

          // Check if item is already in template
          const exists = templates.some(templateItem => templateItem.itemId == selectedItem.id);
          if (exists) {
               toast.warning('Item is already in the template');
               return;
          }

          const newItem = {
               id: Date.now(), // Temporary ID for new items
               itemId: selectedItem.id,
               item_name: selectedItem.name,
               item_sku: selectedItem.sku,
               quantity: parseFloat(selectedItemQuantity), // Parse as float
               unit: selectedItem.unit || 'unit',
               is_consumed: false,
               batch_number: (selectedBatch || (fifoBatch && fifoBatch.batch_number)) || null
          };

          setTemplates(prev => [...prev, newItem]);
          setQuantities(prev => ({
               ...prev,
               [newItem.id]: parseFloat(selectedItemQuantity)
          }));
          setSelectedItemId('');
          setSelectedItemQuantity('1');
          setAvailableBatches([]);
          setFifoBatch(null);
          setSelectedBatch('');
          setShowAddItem(false);
          toast.success('Item added to template');
     };

     const removeItemFromTemplate = (itemId) => {
          setTemplates(prev => prev.filter(item => item.id !== itemId));
          setQuantities(prev => {
               const newQuantities = { ...prev };
               delete newQuantities[itemId];
               return newQuantities;
          });
          toast.info('Item removed from template');
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

          // Validate that all quantities are greater than 0
          const invalidQuantities = templates.filter(item => !quantities[item.id] || quantities[item.id] <= 0);
          if (invalidQuantities.length > 0) {
               toast.error('All quantities must be greater than 0');
               return;
          }

          try {
               setIsLoading(true);

               // Prepare consumption data for each item in the template
               const consumptions = templates.map(item => {
                    const consumptionData = {
                         test_id: selectedDoc.id?.toString() || '',
                         item_id: item.itemId,
                         quantity_used: quantities[item.id] || 0,
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



               const consumptionData = { consumptions };
               const response = await customPost('inventory/transactions/consume/test', 'POST', consumptionData);

               if (response.success == true) {
                    toast.success(response?.data?.message || `Stock deduction applied successfully`);
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

     // Recompute allConsumed whenever template items change
     useEffect(() => {
          if (!templates || templates.length === 0) {
               setAllConsumed(false);
               return;
          }
          const consumed = templates.every(item => item.is_consumed === true);
          setAllConsumed(consumed);
     }, [templates]);

     useEffect(() => {
          if (showModal) {
               getTemplates();
          }
     }, [showModal]);



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
                         <div className="alert alert-warning m-4 text-sm">
                              No Template Found! No inventory template is configured for this test.
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
                                   <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>Required Inventory Items</h6>
                                        <button
                                             className="btn btn-sm btn-outline-primary"
                                             onClick={async () => {
                                                  if (!showAddItem && availableItems.length === 0) {
                                                       await loadAllInventoryItems();
                                                  }
                                                  setShowAddItem(!showAddItem);
                                             }}
                                        >
                                             <RiAddCircleLine size={16} className="me-1" />
                                             Add Item
                                        </button>
                                   </div>

                                   {/* Add Item Section */}
                                   {showAddItem && (
                                        <div className="mb-3 p-3 border rounded bg-light">
                                             <div className="row g-2 align-items-end">
                                                  <div className="col-md-6">
                                                       <label htmlFor="itemSelect" className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>
                                                            Select Inventory Item
                                                       </label>
                                                       <select
                                                            id="itemSelect"
                                                            className="form-select form-select-sm"
                                                            value={selectedItemId}
                                                            onChange={async (e) => {
                                                                 const id = e.target.value;
                                                                 setSelectedItemId(id);
                                                                 setAvailableBatches([]);
                                                                 setFifoBatch(null);
                                                                 setSelectedBatch('');
                                                                 if (id) {
                                                                      await loadAvailableStockForItem(id);
                                                                 }
                                                            }}
                                                       >
                                                            <option value="">Choose an item...</option>
                                                            {availableItems.map(item => (
                                                                 <option key={item.id} value={item.id}>
                                                                      {item.name} (SKU: {item.sku})
                                                                 </option>
                                                            ))}
                                                       </select>
                                                  </div>
                                                  <div className="col-md-3">
                                                       <label htmlFor="quantityInput" className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>
                                                            Quantity
                                                       </label>
                                                       <input
                                                            id="quantityInput"
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            placeholder="Qty"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={selectedItemQuantity}
                                                            onChange={(e) => setSelectedItemQuantity(e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="col-md-3">
                                                       <button
                                                            className="btn btn-primary btn-sm w-100"
                                                            onClick={addItemToTemplate}
                                                            disabled={!selectedItemId || !selectedItemQuantity || parseFloat(selectedItemQuantity) <= 0}
                                                       >
                                                            <RiAddCircleLine size={16} className="me-1" />
                                                            Add Item
                                                       </button>
                                                  </div>
                                             </div>

                                             {selectedItemId && (
                                                  <div className="row g-2 align-items-end mt-1">
                                                       {fifoBatch && (
                                                            <div className="col-md-6">
                                                                 <div className="small text-muted">
                                                                      Recommended (FIFO): <strong>{fifoBatch.batch_number}</strong>
                                                                      {typeof fifoBatch.available_quantity !== 'undefined' && (
                                                                           <span> • Available: {fifoBatch.available_quantity}</span>
                                                                      )}
                                                                 </div>
                                                            </div>
                                                       )}
                                                       {availableBatches.length > 0 && (
                                                            <div className="col-md-6">
                                                                 <label htmlFor="batchSelect" className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>
                                                                      Select Batch (optional)
                                                                 </label>
                                                                 <select
                                                                      id="batchSelect"
                                                                      className="form-select form-select-sm"
                                                                      value={selectedBatch}
                                                                      onChange={(e) => setSelectedBatch(e.target.value)}
                                                                 >
                                                                      <option value="">Use FIFO recommendation</option>
                                                                      {availableBatches.map((b, idx) => (
                                                                           <option key={`${b.batch_number}-${idx}`} value={b.batch_number}>
                                                                                {b.batch_number} • Avail: {b.available_quantity}
                                                                           </option>
                                                                      ))}
                                                                 </select>
                                                            </div>
                                                       )}
                                                  </div>
                                             )}
                                        </div>
                                   )}

                                   {templates.length === 0 ? (
                                        <div className="alert alert-info" style={{ fontSize: '0.88rem' }}>
                                             No items configured in this template.
                                        </div>
                                   ) : (
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover mb-0" style={{ fontSize: '0.88rem' }}>
                                                  <thead>
                                                       <tr>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Item Name</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>SKU</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>Quantity Used</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Unit</th>
                                                            <th style={{ padding: '10px 12px', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>
                                                                 Consumed
                                                            </th>
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
                                                                 <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           style={{ width: '80px', textAlign: 'right', fontWeight: '600', color: '#198754' }}
                                                                           value={quantities[item.id] || 0}
                                                                           onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                                           min="0"
                                                                           step="1"
                                                                           disabled={item.is_consumed === true || item.quantity_remaining <= 0}
                                                                      />
                                                                 </td>
                                                                 <td style={{ padding: '10px 12px', color: '#6c757d' }}>{item.unit}</td>
                                                                 <td style={{ padding: '10px 12px', color: '#6c757d' }}>{item.is_consumed == true ? 'Yes' : 'No'}</td>
                                                                 <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                      {item.is_consumed === true ? null : (
                                                                           <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => removeItemFromTemplate(item.id)}
                                                                                title="Remove item"
                                                                           >
                                                                                <RiDeleteBinLine size={14} />
                                                                           </button>
                                                                      )}
                                                                 </td>
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
                    <button
                         disabled={isLoading || templates.length === 0 || allConsumed}
                         className="btn btn-outline-primary btn-sm me-2" onClick={handleApplyDeduction}>
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
