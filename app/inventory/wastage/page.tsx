'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiEyeLine, RiSearchLine, RiFilterLine, RiCalendarLine, RiDeleteBinLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, currencyFormatter } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

interface TransactionItem {
     id?: string;
     item_id: string;
     item_name: string;
     item_sku: string;
     batch_number?: string;
     brand_name?: string;
     expiry_date?: string;
     quantity_wasted: number;
     wastage_type: string;
     reason: string;
     performed_by: {
          employee_id: number;
          username: string;
          email: string;
          role_name: string;
          full_name: string;
     };
     transaction_date: string;
     notes?: string;
}

interface WastageRecord {
     id: string;
     item_id: string;
     item_name: string;
     item_sku: string;
     batch_number?: string;
     brand_name?: string;
     expiry_date?: string;
     quantity_wasted: number;
     wastage_type: 'damaged' | 'broken' | 'contamination' | 'other';
     reason: string;
     performed_by: {
          employee_id: number;
          username: string;
          email: string;
          role_name: string;
          full_name: string;
     };
     transaction_date: string;
     notes?: string;
}

const WASTAGE_REASONS = {
     expired: { label: 'Expired', color: 'danger' },
     damaged: { label: 'Damaged', color: 'warning' },
     broken: { label: 'Broken', color: 'secondary' },
     contamination: { label: 'Contamination', color: 'info' },
     other: { label: 'Other', color: 'dark' }
};

export default function StockWastagePage() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>([]);
     const [loading, setLoading] = useState(false);
     const [selectedRecord, setSelectedRecord] = useState<WastageRecord | null>(null);
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');
     const [filteredRecords, setFilteredRecords] = useState<WastageRecord[]>([]);
     const [showOffcanvas, setShowOffcanvas] = useState(false);
     const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);

     // Load data on component mount
     useEffect(() => {
          if (branchid && employeeid) {
               loadWastageRecords();
          }
     }, [branchid, employeeid]);

     const loadWastageRecords = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`inventory/transactions/non-expired-wastage-history?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    const records = response.data?.non_expired_wastages || [];
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
                    sortby: sortby,
                    branchid: branchid?.toString() || '',
                    employeeid: employeeid?.toString() || ''
               });

               Object.keys(filters).forEach(key => {
                    if (filters[key] && filters[key] !== '') {
                         queryParams.append(key, filters[key]);
                    }
               });

               const endpoint = `inventory/transactions/non-expired-wastage-history?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data?.non_expired_wastages || [];
                    return {
                         result: records,
                         error: false,
                         totalRecords: response.data?.total || records.length
                    };
               } else {
                    return { result: [], error: true, totalRecords: 0 };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true, totalRecords: 0 };
          }
     };

     const applyDateFilter = async () => {
          if (!startDate || !endDate) {
               alert('Please select both start and end dates');
               return;
          }

          try {
               setLoading(true);
               const queryParams = new URLSearchParams({
                    startDate: startDate,
                    endDate: endDate,
                    page: '1',
                    count: '1000', // Get more records for canvas visualization
                    sortby: 'ASC',
                    branchid: branchid?.toString() || '',
                    employeeid: employeeid?.toString() || ''
               });

               const endpoint = `inventory/transactions/non-expired-wastage-history?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data?.non_expired_wastages || [];
                    setFilteredRecords(records);
                    setShowOffcanvas(true);
               }
          } catch (error) {
               console.error('Error filtering wastage records:', error);
          } finally {
               setLoading(false);
          }
     };

     const clearFilter = () => {
          setStartDate('');
          setEndDate('');
          setFilteredRecords([]);
          setShowOffcanvas(false);
          setShowFilterOffcanvas(false);
          loadWastageRecords();
     };

     const wastageColumns = [
          {
               Header: 'Date & Time',
               accessor: 'transaction_date',
               Cell: ({ value }) => new Date(value).toLocaleString()
          },
          {
               Header: 'Reason',
               accessor: 'wastage_type',
               Cell: ({ value }) => {
                    const reasonInfo = WASTAGE_REASONS[value as keyof typeof WASTAGE_REASONS] || WASTAGE_REASONS.other;
                    return (
                         <span>
                              {reasonInfo.label}
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
                         <small className="text-muted">SKU: {row.original.item_sku}</small>
                         {row.original.batch_number && (
                              <div><small className="text-muted">Batch: {row.original.batch_number}</small></div>
                         )}
                    </div>
               )
          },
          {
               Header: 'Quantity Wasted',
               accessor: 'quantity_wasted',
               Cell: ({ value }) => (
                    <span className="text-danger fw-bold">
                         -{value}
                    </span>
               )
          },
          {
               Header: 'Performed By',
               accessor: 'performed_by',
               Cell: ({ value }) => value?.full_name || 'Unknown'
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
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setShowFilterOffcanvas(true)}
                         >
                              <RiFilterLine className="me-1" />
                              Filter by Date
                         </button>
                    </div>
               </div>

               {/* Wastage Records Table */}
               {!showOffcanvas && (
                    <PrimeTable
                         column={wastageColumns}
                         data={wastageRecords}
                         filtering={true}
                         handleSeverSideProcessing={handleServerSideProcessing}
                         serverSideFiltering={true}
                    />
               )}

               {/* Filter Offcanvas */}
               <div className={`offcanvas offcanvas-end ${showFilterOffcanvas ? 'show' : ''}`} style={{ visibility: showFilterOffcanvas ? 'visible' : 'hidden' }} tabIndex={-1}>
                    <div className="offcanvas-header">
                         <h5 className="offcanvas-title">
                              <RiFilterLine className="me-2" />
                              Filter Wastage Records
                         </h5>
                         <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowFilterOffcanvas(false)}
                         ></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="mb-4">
                              <p className="text-muted">Select a date range to filter wastage records</p>
                         </div>

                         <div className="mb-3">
                              <label className="form-label fw-bold">Start Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={startDate}
                                   onChange={(e) => setStartDate(e.target.value)}
                              />
                         </div>

                         <div className="mb-4">
                              <label className="form-label fw-bold">End Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={endDate}
                                   onChange={(e) => setEndDate(e.target.value)}
                              />
                         </div>

                         <div className="d-grid gap-2">
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={() => {
                                        applyDateFilter();
                                        setShowFilterOffcanvas(false);
                                   }}
                                   disabled={loading || !startDate || !endDate}
                              >
                                   <RiFilterLine className="me-1" />
                                   Apply Filter
                              </button>
                              <button
                                   className="btn btn-outline-secondary"
                                   onClick={() => {
                                        clearFilter();
                                        setShowFilterOffcanvas(false);
                                   }}
                                   disabled={loading}
                              >
                                   Clear Filter
                              </button>
                         </div>
                    </div>
               </div>

               {/* Filtered Results Offcanvas */}
               <div className={`offcanvas offcanvas-end ${showOffcanvas ? 'show' : ''}`} style={{ visibility: showOffcanvas ? 'visible' : 'hidden' }} tabIndex={-1}>
                    <div className="offcanvas-header">
                         <h5 className="offcanvas-title">
                              <RiFilterLine className="me-2" />
                              Filtered Wastage Results
                         </h5>
                         <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowOffcanvas(false)}
                         ></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="mb-3">
                              <div className="alert alert-info">
                                   <strong>Filter Applied:</strong> {startDate} to {endDate}<br />
                                   <strong>Total Records:</strong> {filteredRecords.length}
                              </div>
                         </div>

                         {filteredRecords.length > 0 ? (
                              <div className="table-responsive">
                                   <table className="table table-sm">
                                        <thead>
                                             <tr>
                                                  <th>Date & Time</th>
                                                  <th>Item</th>
                                                  <th>Reason</th>
                                                  <th>Quantity</th>
                                                  <th>Performed By</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {filteredRecords.map((record) => (
                                                  <tr key={record.id}>
                                                       <td>{new Date(record.transaction_date).toLocaleString()}</td>
                                                       <td>
                                                            <div>
                                                                 <div className="fw-bold">{record.item_name}</div>
                                                                 <small className="text-muted">{record.item_sku}</small>
                                                                 {record.batch_number && (
                                                                      <div><small className="text-muted">Batch: {record.batch_number}</small></div>
                                                                 )}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            {(() => {
                                                                 const reasonInfo = WASTAGE_REASONS[record.wastage_type as keyof typeof WASTAGE_REASONS] || WASTAGE_REASONS.other;
                                                                 return (
                                                                      <span>
                                                                           {reasonInfo.label}
                                                                      </span>
                                                                 );
                                                            })()}
                                                       </td>
                                                       <td className="text-danger fw-bold">-{record.quantity_wasted}</td>
                                                       <td>{record.performed_by?.full_name}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         ) : (
                              <div className="text-center text-muted">
                                   <p>No wastage records found for the selected date range.</p>
                              </div>
                         )}
                    </div>
               </div>

               {/* Offcanvas Backdrop */}
               {(showOffcanvas || showFilterOffcanvas) && (
                    <div
                         className="offcanvas-backdrop show"
                         onClick={() => {
                              setShowOffcanvas(false);
                              setShowFilterOffcanvas(false);
                         }}
                    ></div>
               )}

               {/* Wastage Details Modal */}
               {selectedRecord && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Wastage Details - {new Date(selectedRecord.transaction_date).toLocaleString()}
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
                                                  <p><strong>Item:</strong> {selectedRecord.item_name}</p>
                                                  <p><strong>SKU:</strong> {selectedRecord.item_sku}</p>
                                                  {selectedRecord.batch_number && <p><strong>Batch:</strong> {selectedRecord.batch_number}</p>}
                                                  <p><strong>Reason:</strong>
                                                       {(() => {
                                                            const reasonInfo = WASTAGE_REASONS[selectedRecord.wastage_type as keyof typeof WASTAGE_REASONS] || WASTAGE_REASONS.other;
                                                            return (
                                                                 <span>
                                                                      {reasonInfo.label}
                                                                 </span>
                                                            );
                                                       })()}
                                                  </p>
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Quantity Wasted:</strong>
                                                       <span className="text-danger fw-bold ms-2">
                                                            -{selectedRecord.quantity_wasted}
                                                       </span>
                                                  </p>
                                                  <p><strong>Performed By:</strong> {selectedRecord.performed_by?.full_name}</p>
                                                  <p><strong>Transaction Date:</strong> {new Date(selectedRecord.transaction_date).toLocaleString()}</p>
                                                  {selectedRecord.expiry_date && <p><strong>Expiry Date:</strong> {new Date(selectedRecord.expiry_date).toLocaleString()}</p>}
                                             </div>
                                        </div>
                                        {selectedRecord.notes && (
                                             <div className="mt-3">
                                                  <p><strong>Notes:</strong> {selectedRecord.notes}</p>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-outline-secondary btn-sm"
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