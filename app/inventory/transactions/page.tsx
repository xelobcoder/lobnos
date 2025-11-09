'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiHistoryLine, RiEyeLine, RiSubtractLine, RiCameraLine, RiAddLine, RiDeleteBinLine, RiSearchLine, RiFilterLine, RiDownloadLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';

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
     currentStock: number; // Calculated from batches
     minStock: number;
     maxStock: number;
     unitPrice: number; // Average price
     totalValue: number; // Calculated from batches
     location: string;
     expiryDate?: string; // Earliest expiry from batches
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface InventoryTransaction {
     id: string;
     type: 'consumption' | 'addition' | 'adjustment' | 'return';
     testId?: string;
     testName?: string;
     items: TransactionItem[];
     performedBy: string;
     timestamp: string;
     notes?: string;
     cameraImage?: string;
     // Procurement fields for addition transactions
     supplier?: string;
     purchaseOrderNumber?: string;
     orderDate?: string;
     receivedDate?: string;
     invoiceNumber?: string;
     batchNumber?: string;
     expiryDate?: string;
}

interface TransactionItem {
     itemId: string;
     itemName: string;
     quantity: number;
     unit: string;
     unitPrice: number;
     totalValue: number;
     batchId?: string; // For batch-specific consumption
     batchNumber?: string;
}

export default function TransactionsPage() {
     const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [showTransactionModal, setShowTransactionModal] = useState(false);
     const [showCameraModal, setShowCameraModal] = useState(false);
     const [selectedTransaction, setSelectedTransaction] = useState<InventoryTransaction | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [filterType, setFilterType] = useState<string>('all');
     const videoRef = useRef<HTMLVideoElement>(null);
     const canvasRef = useRef<HTMLCanvasElement>(null);

     // Form states
     const [transactionForm, setTransactionForm] = useState({
          type: 'consumption' as 'consumption' | 'adjustment' | 'return',
          testId: '',
          testName: '',
          items: [] as TransactionItem[],
          performedBy: 'Current User',
          notes: '',
          cameraImage: ''
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockItems: InventoryItem[] = [
               {
                    id: '1',
                    name: 'Blood Collection Tubes (EDTA)',
                    category: 'Consumables',
                    supplier: 'LabCorp Supplies',
                    sku: 'BCT-001-EDTA',
                    description: '10mL EDTA blood collection tubes',
                    unit: 'boxes',
                    batches: [
                         {
                              id: 'batch-1',
                              batchNumber: 'BCT-EDTA-001',
                              quantity: 15,
                              unitPrice: 45.50,
                              totalValue: 682.50,
                              expiryDate: '2026-06-15',
                              supplierId: '1',
                              supplierName: 'LabCorp Supplies',
                              receivedDate: '2025-10-15T10:00:00Z',
                              purchaseOrderNumber: 'PO-2025-001',
                              invoiceNumber: 'INV-2025-001'
                         },
                         {
                              id: 'batch-2',
                              batchNumber: 'BCT-EDTA-002',
                              quantity: 10,
                              unitPrice: 46.00,
                              totalValue: 460.00,
                              expiryDate: '2026-08-20',
                              supplierId: '2',
                              supplierName: 'MediTech Inc',
                              receivedDate: '2025-11-01T14:30:00Z',
                              purchaseOrderNumber: 'PO-2025-003',
                              invoiceNumber: 'INV-2025-003'
                         }
                    ],
                    currentStock: 25, // Calculated from batches
                    minStock: 10,
                    maxStock: 100,
                    unitPrice: 45.75, // Average price
                    totalValue: 1142.50, // Calculated from batches
                    location: 'Storage Room A',
                    expiryDate: '2026-06-15', // Earliest expiry
                    lastUpdated: '2025-11-09T10:00:00Z',
                    status: 'in_stock'
               },
               {
                    id: '2',
                    name: 'Glucose Test Strips',
                    category: 'Consumables',
                    supplier: 'MediTech Inc',
                    sku: 'GTS-050',
                    description: 'Glucose test strips - 50 count',
                    unit: 'boxes',
                    batches: [
                         {
                              id: 'batch-3',
                              batchNumber: 'GTS-050-A1',
                              quantity: 5,
                              unitPrice: 25.00,
                              totalValue: 125.00,
                              expiryDate: '2025-12-01',
                              supplierId: '2',
                              supplierName: 'MediTech Inc',
                              receivedDate: '2025-10-20T09:15:00Z',
                              purchaseOrderNumber: 'PO-2025-002',
                              invoiceNumber: 'INV-2025-002'
                         }
                    ],
                    currentStock: 5, // Calculated from batches
                    minStock: 15,
                    maxStock: 50,
                    unitPrice: 25.00,
                    totalValue: 125.00,
                    location: 'Storage Room B',
                    expiryDate: '2025-12-01',
                    lastUpdated: '2025-11-08T14:30:00Z',
                    status: 'low_stock'
               },
               {
                    id: '3',
                    name: 'Sodium Chloride 0.9%',
                    category: 'Reagents & Chemicals',
                    supplier: 'ChemSolutions Ltd',
                    sku: 'NaCl-09-500',
                    description: '500mL bottles of 0.9% NaCl solution',
                    unit: 'bottles',
                    batches: [], // No stock
                    currentStock: 0,
                    minStock: 20,
                    maxStock: 200,
                    unitPrice: 8.75,
                    totalValue: 0,
                    location: 'Chemical Storage',
                    expiryDate: '2026-03-20',
                    lastUpdated: '2025-11-07T09:15:00Z',
                    status: 'out_of_stock'
               },
               {
                    id: '4',
                    name: 'Microcentrifuge Tubes',
                    category: 'Consumables',
                    supplier: 'LabEssentials',
                    sku: 'MCT-15-500',
                    description: '1.5mL microcentrifuge tubes, 500 pack',
                    unit: 'packs',
                    batches: [
                         {
                              id: 'batch-4',
                              batchNumber: 'MCT-15-001',
                              quantity: 8,
                              unitPrice: 12.50,
                              totalValue: 100.00,
                              expiryDate: '2026-12-15',
                              supplierId: '4',
                              supplierName: 'LabEssentials',
                              receivedDate: '2025-11-05T11:20:00Z',
                              purchaseOrderNumber: 'PO-2025-004',
                              invoiceNumber: 'INV-2025-004'
                         }
                    ],
                    currentStock: 8,
                    minStock: 5,
                    maxStock: 30,
                    unitPrice: 12.50,
                    totalValue: 100.00,
                    location: 'Storage Room A',
                    lastUpdated: '2025-11-06T16:45:00Z',
                    status: 'in_stock'
               }
          ];

          const mockTransactions: InventoryTransaction[] = [
               {
                    id: '1',
                    type: 'consumption',
                    items: [
                         { itemId: '1', itemName: 'Blood Collection Tubes (EDTA)', quantity: 1, unit: 'tubes', unitPrice: 45.50, totalValue: 45.50 },
                         { itemId: '4', itemName: 'Microcentrifuge Tubes', quantity: 2, unit: 'tubes', unitPrice: 12.50, totalValue: 25.00 }
                    ],
                    performedBy: 'Dr. Smith',
                    timestamp: '2025-11-08T10:30:00Z',
                    notes: 'Patient ID: P001'
               },
               {
                    id: '3',
                    type: 'adjustment',
                    items: [
                         { itemId: '2', itemName: 'Glucose Test Strips', quantity: -2, unit: 'boxes', unitPrice: 25.00, totalValue: -50.00 }
                    ],
                    performedBy: 'Inventory Clerk',
                    timestamp: '2025-11-06T11:15:00Z',
                    notes: 'Physical count discrepancy'
               },
               {
                    id: '4',
                    type: 'return',
                    items: [
                         { itemId: '3', itemName: 'Sodium Chloride 0.9%', quantity: 5, unit: 'bottles', unitPrice: 8.75, totalValue: 43.75 }
                    ],
                    performedBy: 'Quality Control',
                    timestamp: '2025-11-05T09:45:00Z',
                    notes: 'Expired batch return to supplier'
               }
          ];

          setInventoryItems(mockItems);
          setTransactions(mockTransactions);
     }, []);

     const handleAddTransaction = () => {
          if (transactionForm.items.length === 0) {
               alert('Please add at least one item to the transaction');
               return;
          }

          const newTransaction: InventoryTransaction = {
               id: Date.now().toString(),
               type: transactionForm.type,
               testId: transactionForm.testId || undefined,
               testName: transactionForm.testName || undefined,
               items: transactionForm.items,
               performedBy: transactionForm.performedBy,
               timestamp: new Date().toISOString(),
               notes: transactionForm.notes,
               cameraImage: transactionForm.cameraImage
          };

          // Process inventory changes for consumption transactions
          if (transactionForm.type === 'consumption') {
               setInventoryItems(prev => prev.map(item => {
                    const transactionItem = transactionForm.items.find(ti => ti.itemId === item.id);
                    if (transactionItem) {
                         let updatedBatches = [...item.batches];
                         let remainingQuantity = transactionItem.quantity;

                         // If batch is specified, consume from that specific batch
                         if (transactionItem.batchId) {
                              updatedBatches = updatedBatches.map(batch => {
                                   if (batch.id === transactionItem.batchId && remainingQuantity > 0) {
                                        const consumeQuantity = Math.min(batch.quantity, remainingQuantity);
                                        remainingQuantity -= consumeQuantity;
                                        return {
                                             ...batch,
                                             quantity: batch.quantity - consumeQuantity,
                                             totalValue: (batch.quantity - consumeQuantity) * batch.unitPrice
                                        };
                                   }
                                   return batch;
                              });
                         } else {
                              // FIFO: consume from oldest batches first
                              updatedBatches = updatedBatches
                                   .sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime())
                                   .map(batch => {
                                        if (remainingQuantity > 0) {
                                             const consumeQuantity = Math.min(batch.quantity, remainingQuantity);
                                             remainingQuantity -= consumeQuantity;
                                             return {
                                                  ...batch,
                                                  quantity: batch.quantity - consumeQuantity,
                                                  totalValue: (batch.quantity - consumeQuantity) * batch.unitPrice
                                             };
                                        }
                                        return batch;
                                   });
                         }

                         // Remove empty batches
                         updatedBatches = updatedBatches.filter(batch => batch.quantity > 0);

                         // Calculate totals from remaining batches
                         const totalStock = updatedBatches.reduce((sum, batch) => sum + batch.quantity, 0);
                         const totalValue = updatedBatches.reduce((sum, batch) => sum + batch.totalValue, 0);
                         const avgPrice = totalStock > 0 ? totalValue / totalStock : 0;

                         // Find earliest expiry date
                         const earliestExpiry = updatedBatches.length > 0 ?
                              updatedBatches
                                   .filter(batch => batch.expiryDate)
                                   .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0]?.expiryDate
                              : undefined;

                         return {
                              ...item,
                              batches: updatedBatches,
                              currentStock: totalStock,
                              unitPrice: avgPrice,
                              totalValue: totalValue,
                              expiryDate: earliestExpiry,
                              lastUpdated: new Date().toISOString(),
                              status: totalStock === 0 ? 'out_of_stock' :
                                   totalStock <= item.minStock ? 'low_stock' : 'in_stock'
                         };
                    }
                    return item;
               }));
          }

          setTransactions(prev => [newTransaction, ...prev]);
          setShowTransactionModal(false);
          setTransactionForm({
               type: 'consumption',
               testId: '',
               testName: '',
               items: [],
               performedBy: 'Current User',
               notes: '',
               cameraImage: ''
          });
     };

     const handleCameraCapture = async () => {
          try {
               const stream = await navigator.mediaDevices.getUserMedia({ video: true });
               if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setShowCameraModal(true);
               }
          } catch (error) {
               alert('Camera access denied or not available');
          }
     };

     const captureImage = () => {
          if (videoRef.current && canvasRef.current) {
               const context = canvasRef.current.getContext('2d');
               if (context) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0);
                    const imageData = canvasRef.current.toDataURL('image/png');
                    setTransactionForm(prev => ({ ...prev, cameraImage: imageData }));
                    setShowCameraModal(false);

                    // Stop camera stream
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
               }
          }
     };

     const filteredTransactions = transactions.filter(transaction => {
          const matchesSearch = transaction.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               transaction.testId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               transaction.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesFilter = filterType === 'all' || transaction.type === filterType;
          return matchesSearch && matchesFilter;
     });

     const transactionColumns = [
          {
               Header: 'Type',
               accessor: 'type',
               Cell: ({ value }) => (
                    <span className={`badge bg-${value === 'consumption' ? 'danger' :
                         value === 'adjustment' ? 'warning' : 'info'
                         }`}>
                         {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
               )
          },
          {
               Header: 'Items',
               accessor: 'items',
               Cell: ({ value }) => (
                    <div>
                         <div>{value.length} item(s)</div>
                         <small className="text-muted">
                              {value.map((item: TransactionItem) => `${item.itemName} (${item.quantity})`).join(', ')}
                         </small>
                    </div>
               )
          },
          {
               Header: 'Performed By',
               accessor: 'performedBy',
          },
          {
               Header: 'Timestamp',
               accessor: 'timestamp',
               Cell: ({ value }) => new Date(value).toLocaleString()
          },
          {
               Header: 'Value',
               accessor: 'totalValue',
               Cell: ({ row }) => {
                    const totalValue = row.original.items.reduce((sum: number, item: TransactionItem) => sum + Math.abs(item.totalValue), 0);
                    const isNegative = row.original.type === 'consumption' || row.original.type === 'return';
                    return (
                         <strong className={isNegative ? 'text-danger' : 'text-success'}>
                              {isNegative ? '-' : '+'}${totalValue.toFixed(2)}
                         </strong>
                    );
               }
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <button
                         className="btn btn-sm btn-outline-info"
                         title="View Details"
                         onClick={() => setSelectedTransaction(row.original)}
                    >
                         <RiEyeLine size={14} />
                    </button>
               )
          }
     ];

     const getTransactionStats = () => {
          const consumptionCount = transactions.filter(t => t.type === 'consumption').length;
          const adjustmentCount = transactions.filter(t => t.type === 'adjustment').length;
          const returnCount = transactions.filter(t => t.type === 'return').length;
          const totalValue = transactions.reduce((sum, t) =>
               sum + t.items.reduce((itemSum, item) => itemSum + Math.abs(item.totalValue), 0), 0);

          return { consumptionCount, adjustmentCount, returnCount, totalValue };
     };

     const stats = getTransactionStats();

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiHistoryLine className="me-2" />
                              Manual Transactions
                         </h2>
                         <p className="text-muted mb-0">Record consumption, adjustments, and returns (additions come from receiving)</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-secondary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export
                         </button>
                         <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={handleCameraCapture}
                         >
                              <RiCameraLine className="me-1" />
                              Camera
                         </button>
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowTransactionModal(true)}
                         >
                              <RiSubtractLine className="me-1" />
                              Record Transaction
                         </button>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <RiHistoryLine size={32} className="text-primary mb-2" />
                                   <h5 className="card-title">{stats.consumptionCount}</h5>
                                   <p className="card-text text-muted small">Consumption</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <RiFilterLine size={32} className="text-warning mb-2" />
                                   <h5 className="card-title">{stats.adjustmentCount}</h5>
                                   <p className="card-text text-muted small">Adjustment</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <RiDeleteBinLine size={32} className="text-info mb-2" />
                                   <h5 className="card-title">{stats.returnCount}</h5>
                                   <p className="card-text text-muted small">Returns</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Filters */}
               <div className="card mb-4">
                    <div className="card-body">
                         <div className="row">
                              <div className="col-md-6">
                                   <div className="input-group">
                                        <span className="input-group-text">
                                             <RiSearchLine />
                                        </span>
                                        <input
                                             type="text"
                                             className="form-control"
                                             placeholder="Search transactions..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                   </div>
                              </div>
                              <div className="col-md-6">
                                   <select
                                        className="form-select"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                   >
                                        <option value="all">All Types</option>
                                        <option value="consumption">Consumption</option>
                                        <option value="adjustment">Adjustment</option>
                                        <option value="return">Return</option>
                                   </select>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Transactions Table */}
               <PrimeTable
                    column={transactionColumns}
                    data={filteredTransactions}
                    filtering={true}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
               />

               {/* Transaction Details Modal */}
               {selectedTransaction && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Transaction Details</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedTransaction(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <p><strong>Type:</strong>
                                                       <span className={`badge bg-${selectedTransaction.type === 'consumption' ? 'danger' :
                                                            selectedTransaction.type === 'adjustment' ? 'warning' : 'info'
                                                            } ms-2`}>
                                                            {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                                                       </span>
                                                  </p>
                                                  <p><strong>Performed By:</strong> {selectedTransaction.performedBy}</p>
                                                  <p><strong>Timestamp:</strong> {new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Total Value:</strong>
                                                       <span className={selectedTransaction.type === 'consumption' || selectedTransaction.type === 'return' ? 'text-danger' : 'text-success'}>
                                                            {selectedTransaction.type === 'consumption' || selectedTransaction.type === 'return' ? '-' : '+'}
                                                            ${selectedTransaction.items.reduce((sum, item) => sum + Math.abs(item.totalValue), 0).toFixed(2)}
                                                       </span>
                                                  </p>
                                                  <p><strong>Items Count:</strong> {selectedTransaction.items.length}</p>
                                                  {selectedTransaction.notes && <p><strong>Notes:</strong> {selectedTransaction.notes}</p>}
                                             </div>
                                        </div>
                                        <div className="mt-3">
                                             <h6>Items Involved:</h6>
                                             <div className="table-responsive">
                                                  <table className="table table-sm">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item Name</th>
                                                                 <th>Brand</th>
                                                                 <th>Batch</th>
                                                                 <th>Quantity</th>
                                                                 <th>Unit Price</th>
                                                                 <th>Total Value</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {selectedTransaction.items.map((item, index) => {
                                                                 const inventoryItem = inventoryItems.find(i => i.id === item.itemId);
                                                                 return (
                                                                      <tr key={index}>
                                                                           <td>{item.itemName}</td>
                                                                           <td>{inventoryItem?.brand || 'Not specified'}</td>
                                                                           <td>
                                                                                {item.batchNumber ? (
                                                                                     <span className="badge bg-info">{item.batchNumber}</span>
                                                                                ) : (
                                                                                     <span className="text-muted">Auto-selected</span>
                                                                                )}
                                                                           </td>
                                                                           <td>{item.quantity} {item.unit}</td>
                                                                           <td>${item.unitPrice.toFixed(2)}</td>
                                                                           <td className={selectedTransaction.type === 'consumption' || selectedTransaction.type === 'return' ? 'text-danger' : 'text-success'}>
                                                                                {selectedTransaction.type === 'consumption' || selectedTransaction.type === 'return' ? '-' : '+'}
                                                                                ${Math.abs(item.totalValue).toFixed(2)}
                                                                           </td>
                                                                      </tr>
                                                                 );
                                                            })}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                        {selectedTransaction.cameraImage && (
                                             <div className="mt-3">
                                                  <h6>Captured Image:</h6>
                                                  <img
                                                       src={selectedTransaction.cameraImage}
                                                       alt="Transaction"
                                                       className="img-fluid rounded"
                                                       style={{ maxHeight: '200px' }}
                                                  />
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedTransaction(null)}
                                        >
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Record Transaction Modal */}
               {showTransactionModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Record Inventory Transaction</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowTransactionModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Transaction Type</label>
                                                       <select
                                                            className="form-select"
                                                            value={transactionForm.type}
                                                            onChange={(e) => setTransactionForm(prev => ({
                                                                 ...prev,
                                                                 type: e.target.value as 'consumption' | 'adjustment' | 'return'
                                                            }))}
                                                       >
                                                            <option value="consumption">Consumption</option>
                                                            <option value="adjustment">Adjustment (Manual)</option>
                                                            <option value="return">Return (Supplier)</option>
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Performed By</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={transactionForm.performedBy}
                                                            onChange={(e) => setTransactionForm(prev => ({ ...prev, performedBy: e.target.value }))}
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Notes</label>
                                                       <textarea
                                                            className="form-control"
                                                            rows={3}
                                                            value={transactionForm.notes}
                                                            onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                                                            placeholder="Additional notes..."
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Items</label>
                                                       <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                            {transactionForm.items.map((item, index) => {
                                                                 const selectedItem = inventoryItems.find(i => i.id === item.itemId);
                                                                 const availableBatches = selectedItem?.batches.filter(b => b.quantity > 0) || [];

                                                                 return (
                                                                      <div key={index} className="border rounded p-2 mb-2">
                                                                           <div className="d-flex gap-2 mb-2 align-items-center">
                                                                                <select
                                                                                     className="form-select form-select-sm"
                                                                                     value={item.itemId}
                                                                                     onChange={(e) => {
                                                                                          const selectedItem = inventoryItems.find(i => i.id === e.target.value);
                                                                                          if (selectedItem) {
                                                                                               const updatedItems = [...transactionForm.items];
                                                                                               updatedItems[index] = {
                                                                                                    ...updatedItems[index],
                                                                                                    itemId: selectedItem.id,
                                                                                                    itemName: selectedItem.name,
                                                                                                    unit: selectedItem.unit,
                                                                                                    unitPrice: selectedItem.unitPrice,
                                                                                                    batchId: '', // Reset batch selection
                                                                                                    batchNumber: '',
                                                                                                    totalValue: selectedItem.unitPrice * updatedItems[index].quantity
                                                                                               };
                                                                                               setTransactionForm(prev => ({ ...prev, items: updatedItems }));
                                                                                          }
                                                                                     }}
                                                                                >
                                                                                     <option value="">Select item</option>
                                                                                     {inventoryItems.map(invItem => (
                                                                                          <option key={invItem.id} value={invItem.id}>
                                                                                               {invItem.name}{invItem.brand ? ` (${invItem.brand})` : ''} ({invItem.sku}) - {invItem.currentStock} {invItem.unit} available
                                                                                          </option>
                                                                                     ))}
                                                                                </select>
                                                                                <input
                                                                                     type="number"
                                                                                     className="form-control form-control-sm"
                                                                                     style={{ width: '80px' }}
                                                                                     placeholder="Qty"
                                                                                     value={item.quantity}
                                                                                     onChange={(e) => {
                                                                                          const updatedItems = [...transactionForm.items];
                                                                                          updatedItems[index].quantity = parseInt(e.target.value) || 0;
                                                                                          updatedItems[index].totalValue = updatedItems[index].unitPrice * updatedItems[index].quantity;
                                                                                          setTransactionForm(prev => ({ ...prev, items: updatedItems }));
                                                                                     }}
                                                                                     min="1"
                                                                                />
                                                                                <span className="text-muted small">{item.unit}</span>
                                                                                <span className="text-muted small">${item.totalValue.toFixed(2)}</span>
                                                                                <button
                                                                                     className="btn btn-sm btn-outline-danger"
                                                                                     onClick={() => {
                                                                                          const updatedItems = transactionForm.items.filter((_, i) => i !== index);
                                                                                          setTransactionForm(prev => ({ ...prev, items: updatedItems }));
                                                                                     }}
                                                                                >
                                                                                     <RiDeleteBinLine size={12} />
                                                                                </button>
                                                                           </div>

                                                                           {/* Batch Selection for Consumption */}
                                                                           {transactionForm.type === 'consumption' && selectedItem && availableBatches.length > 0 && (
                                                                                <div className="ms-3">
                                                                                     <label className="form-label small mb-1">Select Batch (Optional - FIFO if not selected):</label>
                                                                                     <select
                                                                                          className="form-select form-select-sm"
                                                                                          value={item.batchId || ''}
                                                                                          onChange={(e) => {
                                                                                               const selectedBatch = availableBatches.find(b => b.id === e.target.value);
                                                                                               const updatedItems = [...transactionForm.items];
                                                                                               updatedItems[index] = {
                                                                                                    ...updatedItems[index],
                                                                                                    batchId: e.target.value || undefined,
                                                                                                    batchNumber: selectedBatch?.batchNumber || '',
                                                                                                    unitPrice: selectedBatch?.unitPrice || selectedItem.unitPrice
                                                                                               };
                                                                                               updatedItems[index].totalValue = updatedItems[index].unitPrice * updatedItems[index].quantity;
                                                                                               setTransactionForm(prev => ({ ...prev, items: updatedItems }));
                                                                                          }}
                                                                                     >
                                                                                          <option value="">Auto-select (FIFO)</option>
                                                                                          {availableBatches
                                                                                               .sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime())
                                                                                               .map(batch => (
                                                                                                    <option key={batch.id} value={batch.id}>
                                                                                                         {batch.batchNumber} - {batch.quantity} {selectedItem.unit}
                                                                                                         (Exp: {new Date(batch.expiryDate).toLocaleDateString()})
                                                                                                         {selectedItem.brand ? ` - ${selectedItem.brand}` : ''}
                                                                                                    </option>
                                                                                               ))}
                                                                                     </select>
                                                                                </div>
                                                                           )}
                                                                      </div>
                                                                 );
                                                            })}
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 onClick={() => {
                                                                      setTransactionForm(prev => ({
                                                                           ...prev,
                                                                           items: [...prev.items, {
                                                                                itemId: '',
                                                                                itemName: '',
                                                                                quantity: 1,
                                                                                unit: 'pieces',
                                                                                unitPrice: 0,
                                                                                totalValue: 0
                                                                           }]
                                                                      }));
                                                                 }}
                                                            >
                                                                 <RiAddLine size={14} className="me-1" />
                                                                 Add Item
                                                            </button>
                                                       </div>
                                                  </div>
                                                  {transactionForm.cameraImage && (
                                                       <div className="mb-3">
                                                            <label className="form-label">Captured Image</label>
                                                            <div className="border rounded p-2">
                                                                 <img
                                                                      src={transactionForm.cameraImage}
                                                                      alt="Captured"
                                                                      className="img-fluid rounded"
                                                                      style={{ maxHeight: '150px' }}
                                                                 />
                                                            </div>
                                                       </div>
                                                  )}
                                                  <div className="mb-3">
                                                       <strong>Total Value: ${transactionForm.items.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}</strong>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setShowTransactionModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={handleAddTransaction}
                                        >
                                             Record Transaction
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Camera Modal */}
               {showCameraModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Capture Image</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowCameraModal(false);
                                                  const stream = videoRef.current?.srcObject as MediaStream;
                                                  stream?.getTracks().forEach(track => track.stop());
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body text-center">
                                        <video
                                             ref={videoRef}
                                             autoPlay
                                             className="w-100 rounded"
                                             style={{ maxHeight: '400px' }}
                                        />
                                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary"
                                             onClick={() => {
                                                  setShowCameraModal(false);
                                                  const stream = videoRef.current?.srcObject as MediaStream;
                                                  stream?.getTracks().forEach(track => track.stop());
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={captureImage}
                                        >
                                             <RiCameraLine className="me-1" />
                                             Capture
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}