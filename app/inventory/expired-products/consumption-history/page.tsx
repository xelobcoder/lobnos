'use client';

import React, { useState, useEffect } from 'react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';

interface ConsumptionHistory {
     id: string;
     item_id: string;
     item_name: string;
     item_sku: string;
     batch_number: string;
     brand_name: string | null;
     expiry_date: string;
     quantity_consumed: number;
     wastage_type: string | null;
     reason: string;
     performed_by: {
          employee_id: number;
          username: string;
          email: string;
          role_name: string;
          full_name: string;
     };
     transaction_date: string;
     notes: string;
}

export default function ExpiredConsumptionHistoryPage() {
     const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionHistory[]>([]);
     const [loading, setLoading] = useState(false);
     const [showFilters, setShowFilters] = useState(false);
     const [filters, setFilters] = useState({
          item_id: '',
          startDate: '',
          endDate: ''
     });

     // Load consumption history on component mount
     useEffect(() => {
          loadConsumptionHistory();
     }, []);

     const loadConsumptionHistory = async () => {
          try {
               setLoading(true);

               const queryParams = new URLSearchParams();
               if (filters.item_id) queryParams.append('item_id', filters.item_id);
               if (filters.startDate) queryParams.append('startDate', filters.startDate);
               if (filters.endDate) queryParams.append('endDate', filters.endDate);

               const endpoint = `inventory/transactions/expired-consumption-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    setConsumptionHistory(response.data?.expired_consumptions || []);
               } else {
                    toast.error('Failed to load consumption history');
               }
          } catch (error) {
               console.error('Error loading consumption history:', error);
               toast.error('Failed to load consumption history');
          } finally {
               setLoading(false);
          }
     };

     const handleFilterChange = (field: string, value: string) => {
          setFilters(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const handleServerSideProcessing = async (params: { page: number; count: number; sortby?: string; filters?: any }) => {
          try {
               const { page, count, sortby = 'DESC', filters: tableFilters = {} } = params;

               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    sortby: sortby
               });

               // Add main filters
               if (filters.item_id) queryParams.append('item_id', filters.item_id);
               if (filters.startDate) queryParams.append('startDate', filters.startDate);
               if (filters.endDate) queryParams.append('endDate', filters.endDate);

               // Add table filters
               Object.keys(tableFilters).forEach(key => {
                    if (tableFilters[key] && tableFilters[key] !== '') {
                         queryParams.append(key, tableFilters[key]);
                    }
               });

               const endpoint = `inventory/transactions/expired-consumption-history?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data?.expired_consumptions || [];
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

     const consumptionHistoryColumns = [
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
               Header: 'Expiry Date',
               accessor: 'expiry_date',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Quantity',
               accessor: 'quantity_consumed',
               Cell: ({ value }) => (
                    <span className="fw-bold">{value}</span>
               )
          },
          {
               Header: 'Consumption Date',
               accessor: 'transaction_date',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Performed By',
               accessor: 'performed_by',
               Cell: ({ value }) => value?.full_name || 'Unknown'
          },
          {
               Header: 'Reason',
               accessor: 'reason',
               Cell: ({ value }) => value || 'N/A'
          },
          {
               Header: 'Wastage Type',
               accessor: 'wastage_type',
               Cell: ({ value }) => (
                    <span className={`badge ${value === 'expired' ? 'bg-danger' : 'bg-secondary'}`}>
                         {value?.toUpperCase() || 'N/A'}
                    </span>
               )
          },
          {
               Header: 'Notes',
               accessor: 'notes',
               Cell: ({ value }) => (
                    <small className="text-muted">{value || 'N/A'}</small>
               )
          }
     ];

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <span className="fw-bold">EXPIRED PRODUCTS CONSUMPTION HISTORY</span>
                         </h2>
                         <p className="text-muted mb-0">Track expired product wastage and consumption records</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setShowFilters(true)}
                         >
                              <span className="fas fa-filter me-1"></span>
                              Filters
                         </button>
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={loadConsumptionHistory}
                              disabled={loading}
                         >
                              {loading ? 'Loading...' : 'Refresh'}
                         </button>
                         <button className="btn btn-outline-primary btn-sm">
                              Export Report
                         </button>
                    </div>
               </div>

               {/* Filters Offcanvas */}
               <div className={`offcanvas offcanvas-end ${showFilters ? 'show' : ''}`}
                    style={{ visibility: showFilters ? 'visible' : 'hidden' }}
                    tabIndex={-1}
                    id="filtersOffcanvas">
                    <div className="offcanvas-header bg-light">
                         <h5 className="offcanvas-title fw-bold">Filter Consumption History</h5>
                         <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowFilters(false)}
                         ></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="row g-3">
                              <div className="col-12">
                                   <label className="form-label fw-bold">Item ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter item ID (optional)"
                                        value={filters.item_id}
                                        onChange={(e) => handleFilterChange('item_id', e.target.value)}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label fw-bold">Start Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label fw-bold">End Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                   />
                              </div>
                         </div>
                    </div>
                    <div className="offcanvas-footer bg-light p-3">
                         <button
                              className="btn btn-primary me-2"
                              onClick={() => {
                                   loadConsumptionHistory();
                                   setShowFilters(false);
                              }}
                              disabled={loading}
                         >
                              Apply Filters
                         </button>
                         <button
                              className="btn btn-outline-secondary me-2"
                              onClick={() => {
                                   setFilters({ item_id: '', startDate: '', endDate: '' });
                                   loadConsumptionHistory();
                                   setShowFilters(false);
                              }}
                         >
                              Clear Filters
                         </button>
                         <button
                              className="btn btn-outline-dark"
                              onClick={() => setShowFilters(false)}
                         >
                              Close
                         </button>
                    </div>
               </div>

               {/* Offcanvas Backdrop */}
               {showFilters && (
                    <div
                         className="offcanvas-backdrop show"
                         onClick={() => setShowFilters(false)}
                    ></div>
               )}

               {/* Summary Cards */}
               <div className="row mb-4">
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-info h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">{consumptionHistory.length}</h4>
                                   <p className="card-text fw-bold small mb-0">TOTAL CONSUMPTIONS</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-info h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">
                                        {consumptionHistory.reduce((sum, record) => sum + record.quantity_consumed, 0)}
                                   </h4>
                                   <p className="card-text fw-bold small mb-0">TOTAL UNITS CONSUMED</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-info h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">
                                        {new Set(consumptionHistory.map(record => record.item_id)).size}
                                   </h4>
                                   <p className="card-text fw-bold small mb-0">AFFECTED ITEMS</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                         <div className="card border-info h-100">
                              <div className="card-body text-center p-3">
                                   <h4 className="fw-bold mb-1">
                                        {consumptionHistory.filter(record => record.wastage_type === 'expired').length}
                                   </h4>
                                   <p className="card-text fw-bold small mb-0">EXPIRED WASTAGE</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Consumption History Table */}
               <PrimeTable pdfExport
                    column={consumptionHistoryColumns}
                    data={consumptionHistory}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />
          </div>
     );
}