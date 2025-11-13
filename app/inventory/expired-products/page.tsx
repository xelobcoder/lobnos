'use client';

import React, { useState, useEffect } from 'react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplication } from '../../../components/Auth/useApplicationContext';

interface ExpiredBatch {
     item_id: string;
     item_name: string;
     item_sku: string;
     batch_number: string;
     brand_name: string;
     expiry_date: string;
     available_quantity: number;
     last_received: string;
}

export default function ExpiredProductsPage() {
     const [expiredBatches, setExpiredBatches] = useState<ExpiredBatch[]>([]);
     const [loading, setLoading] = useState(false);
     const [selectedBatch, setSelectedBatch] = useState<ExpiredBatch | null>(null);
     const [itemDetails, setItemDetails] = useState<any>(null);
     const [loadingDetails, setLoadingDetails] = useState(false);
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
                    setExpiredBatches(response.data || []);
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
                    setItemDetails(response.data);
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

          const confirmMessage = `Are you sure you want to consume ${batch.available_quantity} units of "${batch.item_name}" (Batch: ${batch.batch_number}) as wastage? This action cannot be undone.`;

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
                         reason: 'Expired product wastage',
                         transaction_type: 'wastage',
                         wastage_type: 'expired',
                         batch_number: batch.batch_number,
                         brand_name: batch.brand_name,
                         notes: `Expired batch consumption - Expiry date: ${new Date(batch.expiry_date).toLocaleDateString()}`
                    }]
               };

               const response = await customPost('inventory/transactions/consume', 'POST', consumptionData);

               if (response.success) {
                    toast.success(`Successfully consumed ${batch.available_quantity} units of "${batch.item_name}" as wastage`);
                    await loadExpiredBatches();
                    await loadItemDetails(batch.item_id);
               } else {
                    toast.error(`Failed to consume as wastage: ${response.error?.message || response.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Error consuming as wastage:', error);
               toast.error('Failed to consume as wastage');
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
                    const records = response.data || [];
                    return {
                         result: records,
                         error: false,
                         totalRecords: records.length
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
               Header: 'Brand',
               accessor: 'brand_name',
               Cell: ({ value }) => value || 'N/A'
          },
          {
               Header: 'Available Quantity',
               accessor: 'available_quantity',
               Cell: ({ value }) => (
                    <span className="fw-bold">{value}</span>
               )
          },
          {
               Header: 'Expiry Date',
               accessor: 'expiry_date',
               Cell: ({ value }) => {
                    const expiryDate = new Date(value);
                    const today = new Date();
                    const daysExpired = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                         <div>
                              <div className="fw-bold">
                                   {expiryDate.toLocaleDateString()}
                              </div>
                              <small className="fw-bold">
                                   {daysExpired > 0 ? `${daysExpired} days expired` : 'Expired today'}
                              </small>
                         </div>
                    );
               }
          },
          {
               Header: 'Last Received',
               accessor: 'last_received',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
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
                              <span className="fw-bold">EXPIRED PRODUCTS</span>
                         </h2>
                         <p className="text-muted mb-0">Monitor and manage expired inventory batches</p>
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
               <div className="row mb-4">
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-danger h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">{expiredBatches.length}</h4>
                                   <p className="card-text fw-bold small mb-0">EXPIRED BATCHES</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-danger h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">
                                        {expiredBatches.reduce((sum, batch) => sum + batch.available_quantity, 0)}
                                   </h4>
                                   <p className="card-text fw-bold small mb-0">EXPIRED UNITS</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-danger h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">
                                        {new Set(expiredBatches.map(batch => batch.item_id)).size}
                                   </h4>
                                   <p className="card-text fw-bold small mb-0">AFFECTED ITEMS</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-danger h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">
                                        {expiredBatches.length > 0 ?
                                             Math.max(...expiredBatches.map(batch => {
                                                  const expiryDate = new Date(batch.expiry_date);
                                                  const today = new Date();
                                                  return Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
                                             })) : 0
                                        }
                                   </h4>
                                   <p className="card-text fw-bold small mb-0">MAX DAYS EXPIRED</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Expired Batches Table */}
               <PrimeTable
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
                                             EXPIRED ITEM DETAILS
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
                                                                 <h6 className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>EXPIRED PRODUCT ALERT</h6>
                                                                 <p className="mb-1 small"><strong>Item:</strong> {itemDetails[0].item_name}</p>
                                                                 <p className="mb-1 small"><strong>SKU:</strong> {itemDetails[0].item_sku}</p>
                                                                 <p className="mb-1 small"><strong>Total Expired Batches:</strong>
                                                                      <span className="fw-bold ms-1">{itemDetails.length}</span>
                                                                 </p>
                                                                 <p className="mb-1 small"><strong>Total Expired Quantity:</strong>
                                                                      <span className="fw-bold ms-1">{itemDetails.reduce((sum, batch) => sum + batch.available_quantity, 0)}</span>
                                                                 </p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                 <p className="mb-1 small"><strong>Last Expiry Date:</strong>
                                                                      <span className="fw-bold ms-1">
                                                                           {itemDetails.length > 0 ? new Date(Math.max(...itemDetails.map(batch => new Date(batch.expiry_date).getTime()))).toLocaleDateString() : 'N/A'}
                                                                      </span>
                                                                 </p>
                                                                 <p className="mb-1 small"><strong>Status:</strong>
                                                                      <span className="badge bg-danger ms-1" style={{ fontSize: '0.75rem' }}>EXPIRED</span>
                                                                 </p>
                                                                 <p className="mb-1 small"><strong>Max Days Expired:</strong>
                                                                      <span className="fw-bold ms-1">
                                                                           {itemDetails.length > 0 ? Math.max(...itemDetails.map(batch => Math.floor((new Date().getTime() - new Date(batch.expiry_date).getTime()) / (1000 * 60 * 60 * 24)))) : 0} days
                                                                      </span>
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="mt-3">
                                                       <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>Expired Batches:</h6>
                                                       <div className="table-responsive">
                                                            <table className="table table-sm" style={{ fontSize: '0.95rem' }}>
                                                                 <thead className="table-light">
                                                                      <tr>
                                                                           <th className="py-2">Batch</th>
                                                                           <th className="py-2">Brand</th>
                                                                           <th className="py-2">Quantity</th>
                                                                           <th className="py-2">Expiry Date</th>
                                                                           <th className="py-2">Days Expired</th>
                                                                           <th className="py-2">Last Received</th>
                                                                           <th className="py-2">Actions</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {itemDetails.map((batch: any, index: number) => {
                                                                           const daysExpired = Math.floor((new Date().getTime() - new Date(batch.expiry_date).getTime()) / (1000 * 60 * 60 * 24));
                                                                           return (
                                                                                <tr key={index}>
                                                                                     <td className="fw-bold py-1">{batch.batch_number}</td>
                                                                                     <td className="py-1">{batch.brand_name || 'N/A'}</td>
                                                                                     <td className="fw-bold py-1">{batch.available_quantity}</td>
                                                                                     <td className="fw-bold py-1">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                                                                     <td className="fw-bold py-1">{daysExpired} days</td>
                                                                                     <td className="py-1">{new Date(batch.last_received).toLocaleDateString()}</td>
                                                                                     <td className="py-1">
                                                                                          <button
                                                                                               className="btn btn-sm btn-outline-danger px-2 py-1"
                                                                                               style={{ fontSize: '0.85rem' }}
                                                                                               onClick={() => consumeExpiredBatch(batch)}
                                                                                               disabled={loadingDetails}
                                                                                          >
                                                                                               Consume
                                                                                          </button>
                                                                                     </td>
                                                                                </tr>
                                                                           );
                                                                      })}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>

                                                  <div className="alert alert-warning mt-3 border border-dark p-2" style={{ fontSize: '0.95rem' }}>
                                                       <strong>WARNING:</strong> This item has {itemDetails.length} expired batch(es) totaling {itemDetails.reduce((sum, batch) => sum + batch.available_quantity, 0)} units and should not be used for patient care or testing.
                                                       Please quarantine this inventory and follow your organization's expired product disposal procedures.
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