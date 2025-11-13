'use client';

import React, { useState, useEffect } from 'react';
import { RiSubtractLine, RiEyeLine, RiAddLine, RiDownloadLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
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
     sku: string;
     description: string;
     category_id: string;
     unit: string;
     current_stock: number;
     min_stock: number;
     max_stock: number;
     location_id: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
     is_active: number;
     last_updated: string;
     created_at: string;
     updated_at: string;
     category_name: string;
     location_name: string;
     // Optional fields that might not always be present
     category?: string;
     brand?: string;
     supplier?: string;
     batches?: Batch[];
     unitPrice?: number;
     totalValue?: number;
     location?: string;
     expiryDate?: string;
}

interface TransactionItem {
     id?: string;
     inventoryItemId: string;
     itemName: string;
     sku: string;
     batchId?: string;
     batchNumber?: string;
     brandName?: string;
     quantity: number;
     unitPrice: number;
     unit: string;
     expiryDate?: string;
     notes?: string;
}

interface ConsumptionRecord {
     id: string;
     item_id: string;
     item_name: string;
     item_sku: string;
     consumption_type: 'manual';
     quantity: number;
     reason: string;
     batch_number?: string;
     performed_by: number;
     transaction_date: string;
     notes?: string;
}

interface AvailableBatch {
     batch_number: string;
     brand_name: string | null;
     total_received: number;
     total_consumed: number;
     available_quantity: number;
     expiry_date: string;
     last_received: string;
}

interface FifoBatch {
     batch_number: string;
     brand_name: string | null;
     available_quantity: number;
     expiry_date: string;
}

interface AvailableStockDetail {
     item: {
          id: string;
          name: string;
          sku: string;
          current_stock: number;
          unit: string;
     };
     available_batches: AvailableBatch[];
     fifo_batch: FifoBatch;
}

const CONSUMPTION_TYPES = {
     manual: { label: 'Manual Consumption', color: 'primary' },
     wastage: { label: 'Wastage', color: 'warning' }
};

const WASTAGE_REASONS = [
     'damaged',
     'broken',
     'contamination'
];

export default function StockConsumptionPage() {
     const { applicationsettings } = useApplicationSettings();
     const employeeid = applicationsettings?.user?.employeeid;
     const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [availableStockDetails, setAvailableStockDetails] = useState<AvailableStockDetail | null>(null);
     const [loading, setLoading] = useState(false);
     const [showConsumptionModal, setShowConsumptionModal] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState<ConsumptionRecord | null>(null);

     // Consumption form state
     const [wastageForm, setWastageForm] = useState({
          type: 'manual' as 'manual' | 'wastage',
          wastageReason: '' as string,
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
               const response = await customFetch('inventory/transactions/consumption/report');
               if (response.success) {
                    const records = response.data?.consumptions || response.data?.data || [];
                    setConsumptionRecords(records);
               }
          } catch (error) {
               console.error('Error loading consumption records:', error);
               toast.error('Failed to load consumption records');
          } finally {
               setLoading(false);
          }
     };

     const loadAvailableStockDetails = async (itemId: string) => {
          try {
               const response = await customFetch(`inventory/transactions/available-stock/${itemId}`);
               if (response.success) {
                    setAvailableStockDetails(response.data);
               } else {
                    setAvailableStockDetails(null);
               }
          } catch (error) {
               console.error('Error loading available stock details:', error);
               setAvailableStockDetails(null);
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

               const endpoint = `inventory/transactions/consumption/report?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data?.consumptions || response.data?.data || [];
                    return {
                         result: records,
                         error: false,
                         totalRecords: response.data?.total || response.data?.pagination?.total || records.length
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
          if (wastageForm.items.length === 0) {
               toast.error('Please add at least one item to consume');
               return;
          }

          // Validate wastage reason if type is wastage
          if (wastageForm.type === 'wastage' && !wastageForm.wastageReason) {
               toast.error('Please select a wastage reason');
               return;
          }

          // Validate quantities and check for out-of-stock items
          const invalidItems = wastageForm.items.filter(item => {
               const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItemId);
               if (!inventoryItem) return true;

               // Check if item is out of stock
               const availableStock = inventoryItem.current_stock ||
                    (inventoryItem as any).stock ||
                    (inventoryItem as any).quantity ||
                    (inventoryItem.batches ? inventoryItem.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0) : 0);

               if (availableStock === 0) return true; // Out of stock items are invalid

               // Find the selected batch if one is chosen
               const selectedBatch = availableStockDetails?.available_batches.find(b => b.batch_number === item.batchId);

               // Use batch-specific quantity if batch is selected, otherwise use total available stock
               const maxAllowedQuantity = selectedBatch ? selectedBatch.available_quantity : availableStock;

               return item.quantity > maxAllowedQuantity || item.quantity <= 0;
          });

          if (invalidItems.length > 0) {
               toast.error('Some items are out of stock or have insufficient stock for the selected batch or invalid quantities');
               return;
          }

          try {
               setLoading(true);

               // Prepare consumption data according to new unified API spec
               const consumptions = wastageForm.items.map(item => {
                    const selectedBatch = availableStockDetails?.available_batches.find(b => b.batch_number === item.batchId);

                    const consumptionData: any = {
                         item_id: item.inventoryItemId,
                         quantity: item.quantity,
                         performed_by: employeeid,
                         consumption_type: wastageForm.type,
                         transaction_type: 'consumption',
                         reason: wastageForm.type === 'wastage' ? wastageForm.wastageReason : 'Manual consumption'
                    };

                    // Add wastage_type if consumption type is wastage
                    if (wastageForm.type === 'wastage') {
                         consumptionData.wastage_type = wastageForm.wastageReason;
                         consumptionData.transaction_type = 'wastage';
                    }

                    // Add batch information if a specific batch is selected (manual consumption)
                    if (item.batchId) {
                         consumptionData.batch_number = item.batchNumber;
                         consumptionData.brand_name = item.brandName;
                    }
                    // If no batch selected, API will use FIFO automatically

                    // Add general notes if provided
                    if (wastageForm.notes) {
                         consumptionData.notes = wastageForm.notes;
                    }

                    return consumptionData;
               });

               const consumptionData = { consumptions };
               const response = await customPost('inventory/transactions/consume', 'POST', consumptionData);

               if (response.success) {
                    toast.success('Consumption recorded successfully!');
                    await loadConsumptionRecords();
                    setShowConsumptionModal(false);
                    resetWastageForm();
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

     const resetWastageForm = () => {
          setWastageForm({
               type: 'manual',
               wastageReason: '',
               items: [],
               notes: ''
          });
          setAvailableStockDetails(null);
     };

     const addConsumptionItem = () => {
          setWastageForm(prev => ({
               ...prev,
               items: [...prev.items, {
                    inventoryItemId: '',
                    itemName: '',
                    sku: '',
                    quantity: 1,
                    unitPrice: 0,
                    unit: 'units',
                    brandName: ''
               }]
          }));
     };

     const updateConsumptionItem = (index: number, field: string, value: any) => {
          setWastageForm(prev => {
               const updatedItems = [...prev.items];
               updatedItems[index] = { ...updatedItems[index], [field]: value };

               // Auto-populate item details when inventory item is selected
               if (field === 'inventoryItemId' && value) {
                    const selectedItem = inventoryItems.find(item => item.id === value);
                    if (selectedItem) {
                         const itemStock = selectedItem.current_stock || (selectedItem as any).stock || (selectedItem as any).quantity ||
                              (selectedItem.batches ? selectedItem.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0) : 0);

                         if (itemStock === 0) {
                              toast.warning(`"${selectedItem.name}" is out of stock and cannot be consumed`);
                              // Reset the item selection for out-of-stock items
                              updatedItems[index] = {
                                   ...updatedItems[index],
                                   inventoryItemId: '',
                                   itemName: '',
                                   sku: '',
                                   unit: 'units',
                                   batchId: undefined,
                                   batchNumber: undefined,
                                   brandName: ''
                              };
                              return { ...prev, items: updatedItems };
                         }

                         updatedItems[index] = {
                              ...updatedItems[index],
                              itemName: selectedItem.name,
                              sku: selectedItem.sku,
                              unit: selectedItem.unit,
                              unitPrice: selectedItem.unitPrice || 0,
                              quantity: updatedItems[index].quantity || 1 // Ensure quantity is at least 1
                         };
                         // Load available stock details for this item
                         loadAvailableStockDetails(value);
                    }
               }

               return { ...prev, items: updatedItems };
          });
     };

     const removeConsumptionItem = (index: number) => {
          setWastageForm(prev => ({
               ...prev,
               items: prev.items.filter((_, i) => i !== index)
          }));
     };

     const consumptionColumns = [
          {
               Header: 'Date & Time',
               accessor: 'transaction_date',
               Cell: ({ value }) => new Date(value).toLocaleString()
          },
          {
               Header: 'Type',
               accessor: 'consumption_type',
               Cell: ({ value }) => {
                    const typeInfo = CONSUMPTION_TYPES[value as keyof typeof CONSUMPTION_TYPES] || CONSUMPTION_TYPES.manual;
                    return (
                         <span className={`badge bg-${typeInfo.color}`}>
                              {typeInfo.label}
                         </span>
                    );
               }
          },
          {
               Header: 'Item',
               accessor: 'item_name',
               Cell: ({ row }) => (
                    <div>
                         <div className="fw-bold">{row.original.item_name}</div>
                         <small className="text-muted">{row.original.item_sku}</small>
                    </div>
               )
          },
          {
               Header: 'Quantity',
               accessor: 'quantity',
               Cell: ({ value }) => (
                    <span className="text-danger fw-bold">-{value}</span>
               )
          },
          {
               Header: 'Reason',
               accessor: 'reason',
               Cell: ({ value }) => value || 'N/A'
          },
          {
               Header: 'Batch',
               accessor: 'batch_number',
               Cell: ({ value }) => value || 'N/A'
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
                    <div className="modal show d-block">
                         <div className="modal-dialog modal-fullscreen">
                              <div className="modal-content" >
                                   <div className="modal-header">
                                        <h5 className="modal-title">Record Stock Consumption</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowConsumptionModal(false);
                                                  resetWastageForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row mb-3">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Consumption Type *</label>
                                                       <select
                                                            className="form-select"
                                                            value={wastageForm.type}
                                                            onChange={(e) => setWastageForm(prev => ({
                                                                 ...prev,
                                                                 type: e.target.value as 'manual' | 'wastage',
                                                                 wastageReason: e.target.value === 'manual' ? '' : prev.wastageReason
                                                            }))}
                                                       >
                                                            <option value="manual">Manual Consumption</option>
                                                            <option value="wastage">Wastage</option>
                                                       </select>
                                                  </div>
                                             </div>
                                             {wastageForm.type === 'wastage' && (
                                                  <div className="col-md-6">
                                                       <div className="mb-3">
                                                            <label className="form-label">Wastage Reason *</label>
                                                            <select
                                                                 className="form-select"
                                                                 value={wastageForm.wastageReason}
                                                                 onChange={(e) => setWastageForm(prev => ({ ...prev, wastageReason: e.target.value }))}
                                                            >
                                                                 <option value="">Select reason</option>
                                                                 {WASTAGE_REASONS.map(reason => (
                                                                      <option key={reason} value={reason}>
                                                                           {reason.charAt(0).toUpperCase() + reason.slice(1)}
                                                                      </option>
                                                                 ))}
                                                            </select>
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                        <div className="row">
                                             <div className="col-md-12">
                                                  <div className="mb-3">
                                                       <label className="form-label">Items to Consume</label>
                                                       <div className="border rounded p-3">
                                                            <table className="table table-hover">
                                                                 <thead className="table-light">
                                                                      <tr>
                                                                           <th style={{ width: '35%' }}>Item</th>
                                                                           <th style={{ width: '10%' }}>Quantity</th>
                                                                           <th style={{ width: '8%' }}>Unit</th>
                                                                           <th style={{ width: '25%' }}>Batch (Optional)</th>
                                                                           <th style={{ width: '15%' }}>Stock Info</th>
                                                                           <th style={{ width: '7%' }}>Actions</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {wastageForm.items.map((item, index) => {
                                                                           const selectedItem = inventoryItems.find(inv => inv.id === item.inventoryItemId);
                                                                           const availableStock = selectedItem ?
                                                                                (selectedItem.current_stock ||
                                                                                     (selectedItem as any).stock ||
                                                                                     (selectedItem as any).quantity ||
                                                                                     (selectedItem.batches ? selectedItem.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0) : 0)) : 0;

                                                                           // Calculate max quantity based on batch selection
                                                                           const selectedBatch = availableStockDetails?.available_batches.find(b => b.batch_number === item.batchId);
                                                                           const maxQuantity = selectedBatch ? selectedBatch.available_quantity : availableStock;

                                                                           // Check if selected item has zero stock
                                                                           const isOutOfStock = selectedItem && availableStock === 0;

                                                                           return (
                                                                                <tr key={index} className={isOutOfStock ? 'table-secondary' : ''}>
                                                                                     <td>
                                                                                          <select
                                                                                               className="form-select form-select-sm"
                                                                                               value={item.inventoryItemId}
                                                                                               onChange={(e) => updateConsumptionItem(index, 'inventoryItemId', e.target.value)}
                                                                                               disabled={isOutOfStock}
                                                                                          >
                                                                                               <option value="">Select item</option>
                                                                                               {inventoryItems.map(invItem => {
                                                                                                    const itemStock = invItem.current_stock || (invItem as any).stock || (invItem as any).quantity ||
                                                                                                         (invItem.batches ? invItem.batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0) : 0);
                                                                                                    const itemOutOfStock = itemStock === 0;
                                                                                                    return (
                                                                                                         <option key={invItem.id} value={invItem.id} disabled={itemOutOfStock}>
                                                                                                              {invItem.name} ({invItem.sku}) - {itemStock} {invItem.unit || 'units'} available
                                                                                                              {itemOutOfStock && ' (OUT OF STOCK)'}
                                                                                                         </option>
                                                                                                    );
                                                                                               })}
                                                                                          </select>
                                                                                     </td>
                                                                                     <td>
                                                                                          <input
                                                                                               type="number"
                                                                                               className="form-control form-control-sm"
                                                                                               placeholder="Qty"
                                                                                               value={item.quantity}
                                                                                               onChange={(e) => updateConsumptionItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                                                               min="1"
                                                                                               max={maxQuantity || undefined}
                                                                                               disabled={isOutOfStock}
                                                                                          />
                                                                                     </td>
                                                                                     <td>
                                                                                          <span className="text-muted small">{item.unit || 'units'}</span>
                                                                                     </td>
                                                                                     <td>
                                                                                          {availableStockDetails && availableStockDetails.available_batches.length > 0 ? (
                                                                                               <select
                                                                                                    className="form-select form-select-sm"
                                                                                                    value={item.batchId || ''}
                                                                                                    onChange={(e) => {
                                                                                                         const batchNumber = e.target.value;
                                                                                                         const selectedBatch = availableStockDetails.available_batches.find(b => b.batch_number === batchNumber);
                                                                                                         updateConsumptionItem(index, 'batchId', batchNumber);
                                                                                                         updateConsumptionItem(index, 'batchNumber', batchNumber);
                                                                                                         updateConsumptionItem(index, 'brandName', selectedBatch?.brand_name || '');
                                                                                                    }}
                                                                                                    disabled={isOutOfStock}
                                                                                               >
                                                                                                    <option value="">Any available batch (FIFO)</option>
                                                                                                    {availableStockDetails.available_batches.map(batch => (
                                                                                                         <option key={batch.batch_number} value={batch.batch_number}>
                                                                                                              {batch.batch_number} - {batch.available_quantity} {availableStockDetails.item.unit}
                                                                                                              (Exp: {new Date(batch.expiry_date).toLocaleDateString()})
                                                                                                              {batch.brand_name && ` - ${batch.brand_name}`}
                                                                                                         </option>
                                                                                                    ))}
                                                                                               </select>
                                                                                          ) : (
                                                                                               <span className="text-muted small">No batches available</span>
                                                                                          )}
                                                                                     </td>
                                                                                     <td>
                                                                                          {selectedItem && (
                                                                                               <div className="small">
                                                                                                    <div className={`fw-bold ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
                                                                                                         Available: {selectedBatch ? selectedBatch.available_quantity : availableStock} {selectedItem.unit || 'units'}
                                                                                                         {selectedBatch && <span className="text-muted"> (Batch: {selectedBatch.batch_number})</span>}
                                                                                                         {isOutOfStock && <div className="text-danger fw-bold">OUT OF STOCK</div>}
                                                                                                    </div>
                                                                                                    {availableStockDetails && (
                                                                                                         <div className="text-info">
                                                                                                              {availableStockDetails.available_batches.length} batches
                                                                                                              {availableStockDetails.fifo_batch && !selectedBatch && (
                                                                                                                   <div className="badge bg-primary mt-1">
                                                                                                                        FIFO: {availableStockDetails.fifo_batch.batch_number}
                                                                                                                   </div>
                                                                                                              )}
                                                                                                         </div>
                                                                                                    )}
                                                                                               </div>
                                                                                          )}
                                                                                     </td>
                                                                                     <td>
                                                                                          <button
                                                                                               className="btn btn-sm btn-outline-danger"
                                                                                               onClick={() => removeConsumptionItem(index)}
                                                                                               title="Remove item"
                                                                                               disabled={isOutOfStock}
                                                                                          >
                                                                                               <RiSubtractLine size={14} />
                                                                                          </button>
                                                                                     </td>
                                                                                </tr>
                                                                           );
                                                                      })}
                                                                 </tbody>
                                                            </table>
                                                            <div className="mt-3">
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
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Notes</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={wastageForm.notes}
                                                  onChange={(e) => setWastageForm(prev => ({ ...prev, notes: e.target.value }))}
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
                                                  resetWastageForm();
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
                                             Consumption Details - {new Date(selectedRecord.transaction_date).toLocaleString()}
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
                                                            const typeInfo = CONSUMPTION_TYPES[selectedRecord.consumption_type as keyof typeof CONSUMPTION_TYPES] || CONSUMPTION_TYPES.manual;
                                                            return (
                                                                 <span className={`badge bg-${typeInfo.color} ms-2`}>
                                                                      {typeInfo.label}
                                                                 </span>
                                                            );
                                                       })()}
                                                  </p>
                                                  <p><strong>Item:</strong> {selectedRecord.item_name}</p>
                                                  <p><strong>SKU:</strong> {selectedRecord.item_sku}</p>
                                                  <p><strong>Performed By:</strong> {selectedRecord.performed_by}</p>
                                                  <p><strong>Transaction Date:</strong> {new Date(selectedRecord.transaction_date).toLocaleString()}</p>
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Quantity:</strong>
                                                       <span className="text-danger fw-bold ms-2">
                                                            -{selectedRecord.quantity}
                                                       </span>
                                                  </p>
                                                  <p><strong>Reason:</strong> {selectedRecord.reason}</p>
                                                  {selectedRecord.batch_number && <p><strong>Batch:</strong> {selectedRecord.batch_number}</p>}
                                                  {selectedRecord.notes && <p><strong>Notes:</strong> {selectedRecord.notes}</p>}
                                             </div>
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