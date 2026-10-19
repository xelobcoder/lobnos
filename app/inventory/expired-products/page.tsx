'use client';

import React, { useState, useEffect } from 'react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import { RiAlertLine, RiBox3Line, RiMoneyDollarCircleLine, RiBarChartLine } from '@remixicon/react';

interface ExpiredBatch {
     item_id: string;
     item_name: string;
     item_sku: string;
     batch_number: string;
     expiry_date: string;
     unit_price: number;
     total_received: number;
     total_consumed: number;
     available_quantity: number;
     total_value: number;
     days_to_expiry: number;
}

export default function ExpiredProductsPage() {
     const [expiredBatches, setExpiredBatches] = useState<ExpiredBatch[]>([]);
     const [loading, setLoading] = useState(false);
     const [selectedBatch, setSelectedBatch] = useState<ExpiredBatch | null>(null);
     const [itemDetails, setItemDetails] = useState<any>(null);
     const [loadingDetails, setLoadingDetails] = useState(false);
     const [summary, setSummary] = useState<any>(null);
     const employeeid = useApplication()?.user?.employeeid;

     // Load expired batches on component mount
     useEffect(() => {
          loadExpiredBatches();
     }, []);

     const loadExpiredBatches = async () => {
          try {
               setLoading(true);
               const response = await customFetch('inventory/transactions/expired-batches');
               if (response.success) {
                    setExpiredBatches(response.data.expired_batches || []);
                    setSummary(response.data.summary);
               } else {
                    toast.error('Failed to load expired batches');
               }
          } catch (error) {
               console.error('Error loading expired batches:', error);
               toast.error('Failed to load expired batches');
          } finally {
               setLoading(false);
          }
     };

     const loadItemDetails = async (itemId: string) => {
          try {
               setLoadingDetails(true);
               const response = await customFetch(`inventory/transactions/expired-batches/${itemId}/items`);
               if (response.success) {
                    setItemDetails(response.data?.expired_batches || []);
               } else {
                    toast.error('Failed to load item details');
               }
          } catch (error) {
               console.error('Error loading item details:', error);
               toast.error('Failed to load item details');
          } finally {
               setLoadingDetails(false);
          }
     };

     const consumeExpiredBatch = async (batch: any) => {
          if (!employeeid) {
               toast.error('Employee ID not found. Please log in again.');
               return;
          }

          const confirmMessage = `Are you sure you want to quarantine ${batch.available_quantity} units of "${batch.item_name}" (Batch: ${batch.batch_number})? This will mark the batch as quarantined and remove it from active inventory.`;

          if (!window.confirm(confirmMessage)) {
               return;
          }

          try {
               setLoadingDetails(true);

               const consumptionData = {
                    consumptions: [{
                         item_id: batch.item_id,
                         quantity: batch.available_quantity,
                         performed_by: employeeid,
                         reason: 'Near expiry quarantine',
                         transaction_type: 'quarantine',
                         wastage_type: 'near_expiry',
                         batch_number: batch.batch_number,
                         notes: `Near expiry quarantine - Expiry date: ${new Date(batch.expiry_date).toLocaleDateString()} (${batch.days_to_expiry} days remaining)`
                    }]
               };

               const response = await customPost('inventory/transactions/consume', 'POST', consumptionData);

               if (response.success) {
                    toast.success(`Successfully quarantined ${batch.available_quantity} units of "${batch.item_name}"`);
                    await loadExpiredBatches();
                    await loadItemDetails(batch.item_id);
               } else {
                    toast.error(`Failed to quarantine: ${response.error?.message || response.message || 'Unknown error'}`);
               }
          } catch (error) {
               toast.error('Failed to quarantine');
          } finally {
               setLoadingDetails(false);
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

               const endpoint = `inventory/transactions/expired-batches?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data.expired_batches || [];
                    return {
                         result: records,
                         error: false,
                         totalRecords: response.data.total
                    };
               } else {
                    return { result: [], error: true, totalRecords: 0 };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true, totalRecords: 0 };
          }
     };

     const expiredBatchesColumns = [
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
               Header: 'Batch Number',
               accessor: 'batch_number',
               Cell: ({ value }) => (
                    <span className="fw-bold">{value}</span>
               )
          },
          {
               Header: 'Unit Price',
               accessor: 'unit_price',
               Cell: ({ value }) => (
                    <span>{value}</span>
               )
          },
          {
               Header: 'Available Quantity',
               accessor: 'available_quantity',
               Cell: ({ value }) => (
                    <span className="fw-bold">{value}</span>
               )
          },
          {
               Header: 'Total Value',
               accessor: 'total_value',
               Cell: ({ value }) => (
                    <span>{value}</span>
               )
          },
          {
               Header: 'Expiry Date',
               accessor: 'expiry_date',
               Cell: ({ row }) => {
                    const expiryDate = new Date(row.original.expiry_date);
                    const daysToExpiry = row.original.days_to_expiry;

                    return (
                         <div>
                              <div className="fw-bold">
                                   {expiryDate.toLocaleDateString()}
                              </div>
                              <small className="fw-bold">
                                   {daysToExpiry <= 0 ? `${Math.abs(daysToExpiry)} days expired` : `Expires in ${daysToExpiry} days`}
                              </small>
                         </div>
                    );
               }
          },
          {
               Header: 'Actions',
               accessor: 'item_id',
               Cell: ({ row }) => (
                    <button
                         className="btn btn-sm btn-outline-info"
                         title="View Details"
                         onClick={() => {
                              setSelectedBatch(row.original);
                              loadItemDetails(row.original.item_id);
                         }}
                    >
                         Details
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
                              <RiAlertLine size={28} className="me-2" />
                              EXPIRING PRODUCTS
                         </h2>
                         <p className="text-muted mb-0">Monitor and manage inventory batches nearing expiry</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={loadExpiredBatches}
                              disabled={loading}
                         >
                              {loading ? 'Loading...' : 'Refresh'}
                         </button>
                         <button className="btn btn-outline-primary btn-sm">
                              Export Report
                         </button>
                    </div>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-3 col-md-6 col-sm-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiAlertLine size={24} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">EXPIRING BATCHES</span>
                              </div>
                              <div className="fs-4 fw-bold text-warning">{summary?.total_expired_batches || 0}</div>
                              <div className="small text-muted">Batches nearing expiry</div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiBox3Line size={24} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">EXPIRING UNITS</span>
                              </div>
                              <div className="fs-4 fw-bold text-info">{summary?.total_expired_quantity || 0}</div>
                              <div className="small text-muted">Units affected</div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiBarChartLine size={24} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">AFFECTED ITEMS</span>
                              </div>
                              <div className="fs-4 fw-bold text-primary">{summary?.unique_items_affected || 0}</div>
                              <div className="small text-muted">Unique items</div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={24} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">TOTAL VALUE</span>
                              </div>
                              <div className="fs-4 fw-bold text-success">{summary?.total_expired_value || 0}</div>
                              <div className="small text-muted">Current value</div>
                         </div>
                    </div>
               </div>

               {/* Expired Batches Table */}
               <PrimeTable pdfExport pdfTitle="Expired Products"
                    column={expiredBatchesColumns}
                    data={expiredBatches}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Batch Details Modal */}
               {selectedBatch && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header bg-light py-2">
                                        <h5 className="modal-title fw-bold" style={{ fontSize: '1.25rem' }}>
                                             EXPIRING ITEM DETAILS
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setSelectedBatch(null);
                                                  setItemDetails(null);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body" style={{ fontSize: '1rem' }}>
                                        {loadingDetails ? (
                                             <div className="text-center py-4">
                                                  <div className="spinner-border spinner-border-sm" role="status">
                                                       <span className="visually-hidden">Loading...</span>
                                                  </div>
                                                  <p className="mt-2 mb-0 small">Loading item details...</p>
                                             </div>
                                        ) : itemDetails && Array.isArray(itemDetails) && itemDetails.length > 0 ? (
                                             <div>
                                                  <div className="border rounded p-3 mb-3 bg-light">
                                                       <div className="row g-3">
                                                            <div className="col-md-6">
                                                                 <h6 className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>EXPIRING PRODUCT ALERT</h6>
                                                                 <p className="mb-1 small"><strong>Item:</strong> {itemDetails[0].item_name}</p>
                                                                 <p className="mb-1 small"><strong>SKU:</strong> {itemDetails[0].item_sku}</p>
                                                                 <p className="mb-1 small"><strong>Total Expiring Batches:</strong>
                                                                      <span className="fw-bold ms-1">{itemDetails.length}</span>
                                                                 </p>
                                                                 <p className="mb-1 small"><strong>Total Expiring Quantity:</strong>
                                                                      <span className="fw-bold ms-1">{itemDetails.reduce((sum, batch) => sum + batch.available_quantity, 0)}</span>
                                                                 </p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                 <p className="mb-1 small"><strong>Earliest Expiry Date:</strong>
                                                                      <span className="fw-bold ms-1">
                                                                           {itemDetails.length > 0 ? new Date(Math.min(...itemDetails.map(batch => new Date(batch.expiry_date).getTime()))).toLocaleDateString() : 'N/A'}
                                                                      </span>
                                                                 </p>
                                                                 <p className="mb-1 small"><strong>Status:</strong>
                                                                      <span className="badge bg-warning ms-1" style={{ fontSize: '0.75rem' }}>EXPIRING SOON</span>
                                                                 </p>
                                                                 <p className="mb-1 small"><strong>Min Days to Expiry:</strong>
                                                                      <span className="fw-bold ms-1">
                                                                           {itemDetails.length > 0 ? Math.min(...itemDetails.map(batch => batch.days_to_expiry)) : 0} days
                                                                      </span>
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="mt-3">
                                                       <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>Expiring Batches:</h6>
                                                       <div className="table-responsive">
                                                            <table className="table table-sm" style={{ fontSize: '0.95rem' }}>
                                                                 <thead className="table-light">
                                                                      <tr>
                                                                           <th className="py-2">Batch</th>
                                                                           <th className="py-2">Unit Price</th>
                                                                           <th className="py-2">Quantity</th>
                                                                           <th className="py-2">Total Value</th>
                                                                           <th className="py-2">Expiry Date</th>
                                                                           <th className="py-2">Days to Expiry</th>
                                                                           <th className="py-2">Actions</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {itemDetails.map((batch: any, index: number) => (
                                                                           <tr key={index}>
                                                                                <td className="fw-bold py-1">{batch.batch_number}</td>
                                                                                <td className="py-1">{batch.unit_price}</td>
                                                                                <td className="fw-bold py-1">{batch.available_quantity}</td>
                                                                                <td className="py-1">{batch.total_value}</td>
                                                                                <td className="fw-bold py-1">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                                                                <td className="fw-bold py-1">{batch.days_to_expiry} days</td>
                                                                                <td className="py-1">
                                                                                     <button
                                                                                          className="btn btn-sm btn-outline-warning px-2 py-1"
                                                                                          style={{ fontSize: '0.85rem' }}
                                                                                          onClick={() => consumeExpiredBatch(batch)}
                                                                                          disabled={loadingDetails}
                                                                                     >
                                                                                          Quarantine
                                                                                     </button>
                                                                                </td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>

                                                  <div className="alert alert-warning mt-3 border border-dark p-2" style={{ fontSize: '0.95rem' }}>
                                                       <strong>WARNING:</strong> This item has {itemDetails.length} batch(es) expiring soon totaling {itemDetails.reduce((sum, batch) => sum + batch.available_quantity, 0)} units.
                                                       Please review inventory usage and consider quarantining or prioritizing these batches for use before expiry.
                                                  </div>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="mb-0 small">Failed to load item details. Please try again.</p>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer py-2">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setSelectedBatch(null);
                                                  setItemDetails(null);
                                             }}
                                        >
                                             Close
                                        </button>
                                        <button className="btn btn-outline-dark border border-dark btn-sm">
                                             Report Issue
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}