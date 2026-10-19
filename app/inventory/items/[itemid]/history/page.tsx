'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RiHistoryLine, RiArrowLeftLine, RiDownloadLine, RiFilterLine } from '@remixicon/react';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface Transaction {
     id: string;
     item_id: string;
     transaction_type: 'addition' | 'consumption';
     quantity: number;
     unit_type?: 'consumption' | 'purchase';
     purchase_unit?: string;
     units_per_purchase_unit?: number;
     previous_stock: number;
     new_stock: number;
     batch_number?: string;
     expiry_date?: string;
     unit_cost?: number;
     total_cost?: number;
     performed_by: string | null;
     transaction_date: string;
     notes?: string;
     reason?: string;
     brand_name?: string;
     reference_id?: string;
     wastage_type?: string;
     created_at: string;
     item_name: string;
     item_sku: string;
     employee_username?: string;
     employee_email?: string;
     employee_role?: string;
     employee_name?: string;
}

interface InventoryItem {
     id: string;
     name: string;
     sku: string;
     consumption_unit: string;
     current_stock: number;
}

export default function ItemHistoryPage() {
     const params = useParams();
     const itemId = params?.itemid as string;
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;

     const [transactions, setTransactions] = useState<Transaction[]>([]);
     const [item, setItem] = useState<InventoryItem | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [showFilters, setShowFilters] = useState(false);
     const [filters, setFilters] = useState({
          startDate: '',
          endDate: '',
          transactionType: '',
          performedBy: ''
     });

     const loadTransactions = async () => {
          try {
               const startDateParam = filters.startDate ? `&startDate=${filters.startDate}` : '';
               const endDateParam = filters.endDate ? `&endDate=${filters.endDate}` : '';
               const type = filters.transactionType ? `&type=${filters.transactionType}` : '';

               const transactionsResponse = await customFetch(`inventory/transactions/item/${itemId}?branchid=${branchid}&employeeid=${employeeid}${startDateParam}${endDateParam}${type}`);
               if (transactionsResponse.success) {
                    const transactionData = transactionsResponse.data?.transactions || [];
                    setTransactions(transactionData);
                    return transactionData;
               } else {
                    setError(transactionsResponse.error?.message || 'Failed to load transaction history');
                    return [];
               }
          } catch (err) {
               setError('Failed to load transaction history');
               console.error('Error loading transactions:', err);
               setTransactions([]);
               return [];
          }
     }
     const loadData = async () => {
          try {
               setLoading(true);
               setError(null);

               const itemResponse = await customFetch(`inventory/items/${itemId}?branchid=${branchid}&employeeid=${employeeid}`);
               if (itemResponse.success) {
                    setItem(itemResponse.data);
               }

               await loadTransactions();

          } catch (err) {
               setError('Failed to load data');
               console.error('Error loading data:', err);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (itemId && branchid && employeeid) {
               loadData();
          }
     }, [itemId, branchid, employeeid]);

     const handleServerSideProcessing = async ({ page, count, sortby = 'DESC' }: { page: number; count: number; sortby?: string }) => {
          try {
               const params = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    branchid: branchid?.toString() || '',
                    employeeid: employeeid?.toString() || '',
                    sortby: sortby,
               });

               if (filters.startDate) params.append('startDate', filters.startDate);
               if (filters.endDate) params.append('endDate', filters.endDate);
               if (filters.transactionType) params.append('type', filters.transactionType);
               if (filters.performedBy) params.append('performedBy', filters.performedBy);

               const endpoint = `inventory/transactions/item/${itemId}?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    return {
                         result: response.data?.transactions || [],
                         error: false,
                         pagination: response.data?.pagination
                    };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     const transactionColumns = [
          {
               Header: 'Date',
               accessor: 'transaction_date',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Type',
               accessor: 'transaction_type',
               Cell: ({ value }) => (
                    <span className={value === 'addition' ? 'text-success fw-medium' : 'text-danger fw-medium'}>
                         {value === 'addition' ? 'Addition' : 'Consumption'}
                    </span>
               )
          },
          {
               Header: 'Quantity',
               accessor: 'quantity',
               Cell: ({ row }) => {
                    const { quantity, unit_type, purchase_unit, units_per_purchase_unit } = row.original;
                    if (unit_type === 'purchase' && purchase_unit) {
                         return `${quantity} ${purchase_unit} (${quantity * (units_per_purchase_unit || 1)} ${item?.consumption_unit})`;
                    }
                    return `${quantity} ${item?.consumption_unit}`;
               }
          },
          {
               Header: 'Stock Change',
               accessor: 'previous_stock',
               Cell: ({ row }) => {
                    const { previous_stock, new_stock } = row.original;
                    const change = new_stock - previous_stock;
                    return (
                         <div>
                              <span className="fw-bold">{previous_stock} → {new_stock}</span>
                              <br />
                              <small className={`text-${change > 0 ? 'success' : 'danger'}`}>
                                   {change > 0 ? '+' : ''}{change}
                              </small>
                         </div>
                    );
               }
          },
          {
               Header: 'Batch',
               accessor: 'batch_number',
               Cell: ({ value }) => value || 'N/A'
          },
          {
               Header: 'Performed By',
               accessor: 'employee_username',
               Cell: ({ value, row }) => {
                    if (value) return value.trim();
                    if (row.original.employee_name) return row.original.employee_name;
                    if (row.original.performed_by === null) return 'System';
                    return 'Unknown';
               }
          },
          {
               Header: 'Role',
               accessor: 'employee_role',
               Cell: ({ value }) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
          },
          {
               Header: 'Reason',
               accessor: 'reason',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '150px' }} className="text-truncate" title={value}>
                         {value || '-'}
                    </div>
               )
          },
          {
               Header: 'Notes',
               accessor: 'notes',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '200px' }} className="text-truncate" title={value}>
                         {value || '-'}
                    </div>
               )
          },
     ];

     const handleFilterChange = (field: string, value: string) => {
          setFilters(prev => ({ ...prev, [field]: value }));
     };

     const handleApplyFilters = async () => {
          await loadTransactions();
     };

     const handleClearFilters = () => {
          setFilters({
               startDate: '',
               endDate: '',
               transactionType: '',
               performedBy: ''
          });
          loadData();
     };

     if (loading && !item) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="alert alert-danger">
                         <h5>Error Loading Data</h5>
                         <p>{error}</p>
                         <button className="btn btn-primary btn-sm" onClick={loadData}>
                              Retry
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiHistoryLine size={22} style={{ color: 'oklch(0.646 0.222 41.116)' }} className="me-2 flex-shrink-0" />
                              Transaction History
                              <small className="text-muted ms-2">
                                   {item ? `${item.name} (${item.sku})` : 'Loading item details...'}
                              </small>
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={() => setShowFilters(!showFilters)}
                              >
                                   <RiFilterLine size={16} className="me-1 align-text-bottom" />
                                   {showFilters ? 'Hide Filters' : 'Show Filters'}
                              </button>
                              <button
                                   className="btn btn-outline-secondary btn-sm"
                                   onClick={() => window.history.back()}
                              >
                                   <RiArrowLeftLine size={16} className="me-1 align-text-bottom" />
                                   Back
                              </button>
                         </div>
                    </div>
               </div>

               {item && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                             <h6 className="fw-medium mb-1 text-body-emphasis">Current Stock</h6>
                                             <p className="mb-0 fs-5 fw-bold text-primary">{item.current_stock} {item.consumption_unit}</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                             <h6 className="fw-medium mb-1 text-body-emphasis">Total Transactions</h6>
                                             <p className="mb-0 fs-5 fw-bold">{transactions.length}</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                             <h6 className="fw-medium mb-1 text-body-emphasis">Additions</h6>
                                             <p className="mb-0 fs-5 fw-bold text-success">
                                                  {transactions.filter(t => t.transaction_type === 'addition').length}
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                             <h6 className="fw-medium mb-1 text-body-emphasis">Consumptions</h6>
                                             <p className="mb-0 fs-5 fw-bold text-danger">
                                                  {transactions.filter(t => t.transaction_type === 'consumption').length}
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Filters */}
               {showFilters && (
                    <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="d-flex align-items-center mb-3">
                              <RiFilterLine size={20} style={{ color: 'oklch(0.646 0.222 41.116)' }} className="me-2" />
                              <h6 className="fw-medium mb-0 text-body-emphasis">Filters</h6>
                         </div>
                         <div className="row g-3">
                              <div className="col-md-3">
                                   <label className="form-label fw-medium">Start Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                   />
                              </div>
                              <div className="col-md-3">
                                   <label className="form-label fw-medium">End Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                   />
                              </div>
                              <div className="col-md-3">
                                   <label className="form-label fw-medium">Transaction Type</label>
                                   <select
                                        className="form-select"
                                        value={filters.transactionType}
                                        onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                                   >
                                        <option value="">All Types</option>
                                        <option value="addition">Addition</option>
                                        <option value="consumption">Consumption</option>
                                   </select>
                              </div>
                              <div className="col-md-3">
                                   <label className="form-label">&nbsp;</label>
                                   <div className="d-flex gap-2">
                                        <button className="btn btn-primary btn-sm" onClick={handleApplyFilters}>
                                             Apply Filters
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}>
                                             Clear
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               <PrimeTable pdfExport pdfTitle="Item Transaction History"
                    column={transactionColumns}
                    data={transactions}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />
          </div>
     );
}