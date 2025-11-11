'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiEyeLine, RiSearchLine, RiFilterLine, RiDownloadLine, RiCalendarLine, RiDeleteBinLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, currencyFormatter } from '../../../components/Auth/customFetch';

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

interface WastageRecord {
     id: string;
     reason: 'expired' | 'damaged' | 'contamination' | 'other';
     items: TransactionItem[];
     performedBy: string;
     performedByName: string;
     timestamp: string;
     notes?: string;
     totalValue: number;
}

const WASTAGE_REASONS = {
     expired: { label: 'Expired', color: 'danger' },
     damaged: { label: 'Damaged', color: 'warning' },
     contamination: { label: 'Contamination', color: 'secondary' },
     other: { label: 'Other', color: 'dark' }
};

export default function StockWastagePage() {
     const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>([]);
     const [loading, setLoading] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState<WastageRecord | null>(null);

     // Load data on component mount
     useEffect(() => {
          loadWastageRecords();
     }, []);

     const loadWastageRecords = async () => {
          try {
               setLoading(true);
               const response = await customFetch('inventory/wastage');
               if (response.success) {
                    const records = response.data || [];
                    setWastageRecords(records);
               }
          } catch (error) {
               console.error('Error loading wastage records:', error);
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

               const endpoint = `inventory/wastage?${queryParams.toString()}`;
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

     const wastageColumns = [
          {
               Header: 'Date & Time',
               accessor: 'timestamp',
               Cell: ({ value }) => new Date(value).toLocaleString()
          },
          {
               Header: 'Reason',
               accessor: 'reason',
               Cell: ({ value }) => {
                    const reasonInfo = WASTAGE_REASONS[value as keyof typeof WASTAGE_REASONS] || WASTAGE_REASONS.other;
                    return (
                         <span className={`badge bg-${reasonInfo.color}`}>
                              {reasonInfo.label}
                         </span>
                    );
               }
          },
          {
               Header: 'Items Wasted',
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
                              <RiDeleteBinLine className="me-2" />
                              Stock Wastage
                         </h2>
                         <p className="text-muted mb-0">Track and manage inventory wastage for expired, damaged, or contaminated items</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Records
                         </button>
                    </div>
               </div>

               {/* Wastage Records Table */}
               <PrimeTable
                    column={wastageColumns}
                    data={wastageRecords}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Wastage Details Modal */}
               {selectedRecord && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Wastage Details - {new Date(selectedRecord.timestamp).toLocaleString()}
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
                                                  <p><strong>Reason:</strong>
                                                       {(() => {
                                                            const reasonInfo = WASTAGE_REASONS[selectedRecord.reason as keyof typeof WASTAGE_REASONS] || WASTAGE_REASONS.other;
                                                            return (
                                                                 <span className={`badge bg-${reasonInfo.color} ms-2`}>
                                                                      {reasonInfo.label}
                                                                 </span>
                                                            );
                                                       })()}
                                                  </p>
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
                                             <h6>Wasted Items:</h6>
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
                                                       <small>No items found in this wastage record.</small>
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