'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiSubtractLine, RiEyeLine, RiAddLine, RiSearchLine, RiFilterLine, RiDownloadLine, RiCalendarLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost, currencyFormatter } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface Batch {
     id: string;
     batchNumber: string;
     quantity: number;
     unitPrice: number;
     totalValue: number;
     expiryDate: string;
     supplierId: string;
     supplierName: string;
     receivedDate: string;
     purchaseOrderNumber: string;
     invoiceNumber: string;
}

interface InventoryItem {
     id: string;
     name: string;
     category: string;
     brand?: string;
     supplier: string;
     sku: string;
     description: string;
     unit: string;
     batches: Batch[];
     currentStock: number;
     minStock: number;
     maxStock: number;
     unitPrice: number;
     totalValue: number;
     location: string;
     expiryDate?: string;
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface TransactionItem {
     id?: string;
     inventoryItemId: string;
     itemName: string;
     sku: string;
     batchId?: string;
     batchNumber?: string;
     quantity: number;
     unitPrice: number;
     totalValue: number;
     unit: string;
     expiryDate?: string;
     notes?: string;
}

interface ConsumptionRecord {
     id: string;
     testId?: string;
     testName?: string;
     patientId?: string;
     patientName?: string;
     items: TransactionItem[];
     performedBy: string;
     performedByName: string;
     timestamp: string;
     notes?: string;
     totalValue: number;
}

const CONSUMPTION_TYPES = {
     test: { label: 'Laboratory Test', color: 'primary' },
     manual: { label: 'Manual Consumption', color: 'warning' },
     waste: { label: 'Waste/Expired', color: 'danger' },
     other: { label: 'Other', color: 'secondary' }
};

export default function StockConsumptionPage() {
     const { applicationsettings } = useApplicationSettings();
     const employeeid = applicationsettings?.user?.employeeid;
     const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [loading, setLoading] = useState(false);
     const [showConsumptionModal, setShowConsumptionModal] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState<ConsumptionRecord | null>(null);

     // Consumption form state
     const [consumptionForm, setConsumptionForm] = useState({
          type: 'manual' as 'test' | 'manual' | 'waste' | 'other',
          testId: '',
          testName: '',
          patientId: '',
          patientName: '',
          items: [] as TransactionItem[],
          notes: ''
     });

     // Load data on component mount
     useEffect(() => {
          loadInventoryItems();
          loadConsumptionRecords();
     }, []);

     const loadInventoryItems = async () => {
          try {
               const response = await customFetch('inventory/items');
               if (response.success) {
                    setInventoryItems(response.data || []);
               }
          } catch (error) {
               console.error('Error loading inventory items:', error);
          }
     };

     const loadConsumptionRecords = async () => {
          try {
               setLoading(true);
               const response = await customFetch('inventory/consumption');
               if (response.success) {
                    const records = response.data || [];
                    setConsumptionRecords(records);
               }
          } catch (error) {
               console.error('Error loading consumption records:', error);
               toast.error('Failed to load consumption records');
          } finally {
               setLoading(false);
          }
     };

     const handleServerSideProcessing = async (params: { page: number; count: number; sortby?: string; filters?: any }) => {
          try {
               const { page, count, sortby = 'DESC', filters = {} } = params;

               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    sortby: sortby
               });

               Object.keys(filters).forEach(key => {
                    if (filters[key] && filters[key] !== '') {
                         queryParams.append(key, filters[key]);
                    }
               });

               const endpoint = `inventory/consumption?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data?.data || response.data || [];
                    return {
                         result: records,
                         error: false,
                         totalRecords: response.data?.total || response.data?.totalRecords || records.length
                    };
               } else {
                    return { result: [], error: true, totalRecords: 0 };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true, totalRecords: 0 };
          }
     };

     const handleRecordConsumption = async () => {
          if (consumptionForm.items.length === 0) {
               toast.error('Please add at least one item to consume');
               return;
          }

          // Validate quantities
          const invalidItems = consumptionForm.items.filter(item => {
               const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItemId);
               return !inventoryItem || item.quantity > inventoryItem.currentStock;
          });

          if (invalidItems.length > 0) {
               toast.error('Some items have insufficient stock or invalid quantities');
               return;
          }

          try {
               setLoading(true);
               const consumptionData = {
                    type: consumptionForm.type,
                    testId: consumptionForm.testId || null,
                    testName: consumptionForm.testName || null,
                    patientId: consumptionForm.patientId || null,
                    patientName: consumptionForm.patientName || null,
                    items: consumptionForm.items.map(item => ({
                         inventory_item_id: item.inventoryItemId,
                         batch_id: item.batchId || null,
                         quantity: item.quantity,
                         unit_price: item.unitPrice,
                         notes: item.notes
                    })),
                    performed_by: employeeid,
                    notes: consumptionForm.notes
               };

               const response = await customPost('inventory/consumption', 'POST', consumptionData);

               if (response.success) {
                    toast.success('Consumption recorded successfully!');
                    await loadConsumptionRecords();
                    setShowConsumptionModal(false);
                    resetConsumptionForm();
               } else {
                    toast.error(`Failed to record consumption: ${response.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Error recording consumption:', error);
               toast.error('Failed to record consumption');
          } finally {
               setLoading(false);
          }
     };

     const resetConsumptionForm = () => {
          setConsumptionForm({
               type: 'manual',
               testId: '',
               testName: '',
               patientId: '',
               patientName: '',
               items: [],
               notes: ''
          });
     };

     const addConsumptionItem = () => {
          setConsumptionForm(prev => ({
               ...prev,
               items: [...prev.items, {
                    inventoryItemId: '',
                    itemName: '',
                    sku: '',
                    quantity: 1,
                    unitPrice: 0,
                    totalValue: 0,
                    unit: 'units'
               }]
          }));
     };

     const updateConsumptionItem = (index: number, field: string, value: any) => {
          setConsumptionForm(prev => {
               const updatedItems = [...prev.items];
               updatedItems[index] = { ...updatedItems[index], [field]: value };

               // Auto-populate item details when inventory item is selected
               if (field === 'inventoryItemId' && value) {
                    const selectedItem = inventoryItems.find(item => item.id === value);
                    if (selectedItem) {
                         updatedItems[index] = {
                              ...updatedItems[index],
                              itemName: selectedItem.name,
                              sku: selectedItem.sku,
                              unit: selectedItem.unit,
                              unitPrice: selectedItem.unitPrice,
                              totalValue: updatedItems[index].quantity * selectedItem.unitPrice
                         };
                    }
               }

               // Recalculate total value when quantity changes
               if (field === 'quantity') {
                    updatedItems[index].totalValue = value * updatedItems[index].unitPrice;
               }

               return { ...prev, items: updatedItems };
          });
     };

     const removeConsumptionItem = (index: number) => {
          setConsumptionForm(prev => ({
               ...prev,
               items: prev.items.filter((_, i) => i !== index)
          }));
     };

     const consumptionColumns = [
          {
               Header: 'Date & Time',
               accessor: 'timestamp',
               Cell: ({ value }) => new Date(value).toLocaleString()
          },
          {
               Header: 'Type',
               accessor: 'type',
               Cell: ({ value }) => {
                    const typeInfo = CONSUMPTION_TYPES[value as keyof typeof CONSUMPTION_TYPES] || CONSUMPTION_TYPES.other;
                    return (
                         <span className={`badge bg-${typeInfo.color}`}>
                              {typeInfo.label}
                         </span>
                    );
               }
          },
          {
               Header: 'Test/Patient',
               accessor: 'testName',
               Cell: ({ row }) => (
                    <div>
                         {row.original.testName && (
                              <div>
                                   <RiTestTubeLine size={14} className="me-1" />
                                   {row.original.testName}
                              </div>
                         )}
                         {row.original.patientName && (
                              <div>
                                   <RiUserLine size={14} className="me-1" />
                                   {row.original.patientName}
                              </div>
                         )}
                         {!row.original.testName && !row.original.patientName && (
                              <span className="text-muted">Manual Entry</span>
                         )}
                    </div>
               )
          },
          {
               Header: 'Items Consumed',
               accessor: 'items',
               Cell: ({ value }) => (
                    <div>
                         <div>{value?.length || 0} item(s)</div>
                         {value && value.length > 0 && (
                              <small className="text-muted">
                                   {value.slice(0, 2).map((item: any) => `${item.itemName} (${item.quantity})`).join(', ')}
                                   {value.length > 2 && ` +${value.length - 2} more`}
                              </small>
                         )}
                    </div>
               )
          },
          {
               Header: 'Total Value',
               accessor: 'totalValue',
               Cell: ({ value }) => (
                    <span className="text-danger fw-bold">
                         -{currencyFormatter.format(value || 0)}
                    </span>
               )
          },
          {
               Header: 'Performed By',
               accessor: 'performedByName',
               Cell: ({ value }) => value || 'Unknown'
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <button
                         className="btn btn-sm btn-outline-info"
                         title="View Details"
                         onClick={() => setSelectedRecord(row.original)}
                    >
                         <RiEyeLine size={14} />
                    </button>
               )
          }
     ];

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiSubtractLine className="me-2" />
                              Stock Consumption
                         </h2>
                         <p className="text-muted mb-0">Track and manage inventory consumption for tests and operations</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Records
                         </button>
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowConsumptionModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Record Consumption
                         </button>
                    </div>
               </div>

               {/* Consumption Records Table */}
               <PrimeTable
                    column={consumptionColumns}
                    data={consumptionRecords}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Record Consumption Modal */}
               {showConsumptionModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Record Stock Consumption</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowConsumptionModal(false);
                                                  resetConsumptionForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Consumption Type *</label>
                                                       <select
                                                            className="form-select"
                                                            value={consumptionForm.type}
                                                            onChange={(e) => setConsumptionForm(prev => ({
                                                                 ...prev,
                                                                 type: e.target.value as 'test' | 'manual' | 'waste' | 'other'
                                                            }))}
                                                       >
                                                            <option value="manual">Manual Consumption</option>
                                                            <option value="test">Laboratory Test</option>
                                                            <option value="waste">Waste/Expired</option>
                                                            <option value="other">Other</option>
                                                       </select>
                                                  </div>

                                                  {consumptionForm.type === 'test' && (
                                                       <>
                                                            <div className="mb-3">
                                                                 <label className="form-label">Test ID</label>
                                                                 <input
                                                                      type="text"
                                                                      className="form-control"
                                                                      value={consumptionForm.testId}
                                                                      onChange={(e) => setConsumptionForm(prev => ({ ...prev, testId: e.target.value }))}
                                                                      placeholder="Enter test ID"
                                                                 />
                                                            </div>
                                                            <div className="mb-3">
                                                                 <label className="form-label">Test Name</label>
                                                                 <input
                                                                      type="text"
                                                                      className="form-control"
                                                                      value={consumptionForm.testName}
                                                                      onChange={(e) => setConsumptionForm(prev => ({ ...prev, testName: e.target.value }))}
                                                                      placeholder="Enter test name"
                                                                 />
                                                            </div>
                                                            <div className="mb-3">
                                                                 <label className="form-label">Patient ID</label>
                                                                 <input
                                                                      type="text"
                                                                      className="form-control"
                                                                      value={consumptionForm.patientId}
                                                                      onChange={(e) => setConsumptionForm(prev => ({ ...prev, patientId: e.target.value }))}
                                                                      placeholder="Enter patient ID"
                                                                 />
                                                            </div>
                                                            <div className="mb-3">
                                                                 <label className="form-label">Patient Name</label>
                                                                 <input
                                                                      type="text"
                                                                      className="form-control"
                                                                      value={consumptionForm.patientName}
                                                                      onChange={(e) => setConsumptionForm(prev => ({ ...prev, patientName: e.target.value }))}
                                                                      placeholder="Enter patient name"
                                                                 />
                                                            </div>
                                                       </>
                                                  )}
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Items to Consume</label>
                                                       <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                            {consumptionForm.items.map((item, index) => (
                                                                 <div key={index} className="d-flex gap-2 mb-2 align-items-center">
                                                                      <select
                                                                           className="form-select form-select-sm"
                                                                           value={item.inventoryItemId}
                                                                           onChange={(e) => updateConsumptionItem(index, 'inventoryItemId', e.target.value)}
                                                                      >
                                                                           <option value="">Select item</option>
                                                                           {inventoryItems.map(invItem => (
                                                                                <option key={invItem.id} value={invItem.id}>
                                                                                     {invItem.name} ({invItem.sku}) - {invItem.currentStock} {invItem.unit} available
                                                                                </option>
                                                                           ))}
                                                                      </select>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           style={{ width: '80px' }}
                                                                           placeholder="Qty"
                                                                           value={item.quantity}
                                                                           onChange={(e) => updateConsumptionItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                                           min="1"
                                                                      />
                                                                      <span className="text-muted small">{item.unit}</span>
                                                                      <span className="fw-bold text-danger">
                                                                           {currencyFormatter.format(item.totalValue)}
                                                                      </span>
                                                                      <button
                                                                           className="btn btn-sm btn-outline-danger"
                                                                           onClick={() => removeConsumptionItem(index)}
                                                                      >
                                                                           <RiSubtractLine size={12} />
                                                                      </button>
                                                                 </div>
                                                            ))}
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 onClick={addConsumptionItem}
                                                            >
                                                                 <RiAddLine size={14} className="me-1" />
                                                                 Add Item
                                                            </button>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Notes</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={consumptionForm.notes}
                                                  onChange={(e) => setConsumptionForm(prev => ({ ...prev, notes: e.target.value }))}
                                                  placeholder="Additional notes about this consumption..."
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowConsumptionModal(false);
                                                  resetConsumptionForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={handleRecordConsumption}
                                             disabled={loading}
                                        >
                                             {loading ? 'Recording...' : 'Record Consumption'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Consumption Details Modal */}
               {selectedRecord && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Consumption Details - {new Date(selectedRecord.timestamp).toLocaleString()}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedRecord(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <p><strong>Type:</strong>
                                                       {(() => {
                                                            const typeInfo = CONSUMPTION_TYPES[selectedRecord.type as keyof typeof CONSUMPTION_TYPES] || CONSUMPTION_TYPES.other;
                                                            return (
                                                                 <span className={`badge bg-${typeInfo.color} ms-2`}>
                                                                      {typeInfo.label}
                                                                 </span>
                                                            );
                                                       })()}
                                                  </p>
                                                  {selectedRecord.testName && <p><strong>Test:</strong> {selectedRecord.testName}</p>}
                                                  {selectedRecord.patientName && <p><strong>Patient:</strong> {selectedRecord.patientName}</p>}
                                                  <p><strong>Performed By:</strong> {selectedRecord.performedByName}</p>
                                                  <p><strong>Timestamp:</strong> {new Date(selectedRecord.timestamp).toLocaleString()}</p>
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Total Value:</strong>
                                                       <span className="text-danger fw-bold ms-2">
                                                            -{currencyFormatter.format(selectedRecord.totalValue || 0)}
                                                       </span>
                                                  </p>
                                                  {selectedRecord.notes && <p><strong>Notes:</strong> {selectedRecord.notes}</p>}
                                             </div>
                                        </div>
                                        <div className="mt-3">
                                             <h6>Consumed Items:</h6>
                                             {selectedRecord.items && selectedRecord.items.length > 0 ? (
                                                  <div className="table-responsive">
                                                       <table className="table table-sm">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Item Name</th>
                                                                      <th>SKU</th>
                                                                      <th>Batch</th>
                                                                      <th>Quantity</th>
                                                                      <th>Unit Price</th>
                                                                      <th>Total Value</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {selectedRecord.items.map((item: any, index) => (
                                                                      <tr key={index}>
                                                                           <td>{item.itemName}</td>
                                                                           <td>{item.sku}</td>
                                                                           <td>{item.batchNumber || 'N/A'}</td>
                                                                           <td className="text-danger">-{item.quantity} {item.unit}</td>
                                                                           <td>{currencyFormatter.format(item.unitPrice)}</td>
                                                                           <td className="text-danger fw-bold">
                                                                                -{currencyFormatter.format(item.totalValue)}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             ) : (
                                                  <div className="alert alert-info">
                                                       <small>No items found in this consumption record.</small>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedRecord(null)}
                                        >
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}