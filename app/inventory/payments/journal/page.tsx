'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

interface JournalEntry {
     id: string;
     account_id: string;
     account_name: string;
     debit_amount: number;
     credit_amount: number;
     line_description: string;
     reference_id: string;
     reference_type: string;
     entry_date: string;
     source_module: string;
     entry_status: 'draft' | 'posted' | 'cancelled';
     posted_by: string | null;
     posted_at: string | null;
     created_at: string;
     updated_at: string;
}

interface PaymentSummary {
     total_payments: number;
     total_amount: number;
     pending_payments: number;
     completed_payments: number;
     failed_payments: number;
     payment_methods_breakdown: {
          [key: string]: number;
     };
     period_start: string;
     period_end: string;
}

const STATUS_BADGES = {
     draft: { label: 'Draft', color: 'secondary' },
     posted: { label: 'Posted', color: 'success' },
     cancelled: { label: 'Cancelled', color: 'danger' }
};

export default function JournalPage() {
     const [entries, setEntries] = useState<JournalEntry[]>([]);
     const [summary, setSummary] = useState<PaymentSummary | null>(null);
     const [loading, setLoading] = useState(true);
     const [showFilters, setShowFilters] = useState(false);
     const [filters, setFilters] = useState({
          reference_type: '',
          entry_status: '',
          source_module: '',
          account_id: '',
          start_date: '',
          end_date: '',
          search: ''
     });

     useEffect(() => {
          loadData();
     }, []);

     const loadPaymentSummary = async () => {
          try {
               const response = await customFetch('inventory/supplier-payments/payments/information/summary');
               if (response.success) {
                    setSummary(response.data);
               } else {
                    console.error('Error loading payment summary:', response.message);
               }
          } catch (error) {
               console.error('Error loading payment summary:', error);
          }
     };

     const loadData = async () => {
          await Promise.all([loadPaymentSummary(), loadJournalEntries()]);
     };

     const loadJournalEntries = async () => {
          try {
               const queryParams = new URLSearchParams();

               // Add filters to query params
               Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                         queryParams.append(key, value);
                    }
               });

               const response = await customFetch(`inventory/journal?${queryParams.toString()}`);
               if (response.success) {
                    setEntries(response.data?.entries || []);
               } else {
                    console.error('Error loading journal entries:', response.message);
               }
          } catch (error) {
               console.error('Error loading journal entries:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleServerSideProcessing = async (params: any) => {
          try {
               const { count, page, sortby = "DESC", reference_type, entry_status, source_module, account_id, start_date, end_date, search } = params;
               const endpoint = `inventory/journal?count=${count}&page=${page}&sortby=${sortby}&reference_type=${reference_type || ''}&entry_status=${entry_status || ''}&source_module=${source_module || ''}&account_id=${account_id || ''}&start_date=${start_date || ''}&end_date=${end_date || ''}&search=${search || ''}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.data?.entries || [];
                    return {
                         result: records,
                         error: false,
                         totalRecords: response.data?.total || 0
                    };
               } else {
                    return { result: [], error: true, totalRecords: 0 };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true, totalRecords: 0 };
          }
     };

     const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     const journalColumns = [
          {
               Header: 'Entry ID',
               accessor: 'id',
               Cell: ({ value }) => (
                    <span className="text-monospace fw-bold">{value}</span>
               )
          },
          {
               Header: 'Account',
               accessor: 'account_id',
               Cell: ({ value, row }) => (
                    <div>
                         <div className="fw-bold">{row.original.account_name}</div>
                         <small className="text-muted text-monospace">{value}</small>
                    </div>
               )
          },
          {
               Header: 'Debit',
               accessor: 'debit_amount',
               Cell: ({ value }) => value > 0 ? (
                    <span className="text-success fw-bold">{currencyFormatter.format(value)}</span>
               ) : (
                    <span className="text-muted">-</span>
               )
          },
          {
               Header: 'Credit',
               accessor: 'credit_amount',
               Cell: ({ value }) => value > 0 ? (
                    <span className="text-danger fw-bold">{currencyFormatter.format(value)}</span>
               ) : (
                    <span className="text-muted">-</span>
               )
          },
          {
               Header: 'Description',
               accessor: 'line_description',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '300px' }} className="text-truncate" title={value}>
                         {value}
                    </div>
               )
          },
          {
               Header: 'Reference',
               accessor: 'reference_id',
               Cell: ({ value, row }) => (
                    <div>
                         <div className="fw-bold">{value}</div>
                         <small className="text-muted">{row.original.reference_type?.replace('_', ' ')}</small>
                    </div>
               )
          },
          {
               Header: 'Entry Date',
               accessor: 'entry_date',
               Cell: ({ value }) => formatDate(value)
          },
          {
               Header: 'Status',
               accessor: 'entry_status',
               Cell: ({ value }) => {
                    const badge = STATUS_BADGES[value as keyof typeof STATUS_BADGES] || STATUS_BADGES.draft;
                    return (
                         <span className={`badge bg-${badge.color}`}>
                              {badge.label}
                         </span>
                    );
               }
          },
          {
               Header: 'Posted',
               accessor: 'posted_at',
               Cell: ({ value }) => value ? formatDate(value) : 'N/A'
          }
     ];

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <p className="text-muted mb-0">View and manage accounting journal entries</p>
                    </div>
                    <div className="btn-group">
                         <button
                              className="btn btn-outline-secondary"
                              onClick={() => setShowFilters(true)}
                         >
                              🔍 Filters
                         </button>
                         <button
                              className="btn btn-outline-primary"
                              onClick={loadData}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Payment Summary */}
               {summary && (
                    <div className="mb-4 p-3 bg-light rounded">
                         <div className="text-muted small d-flex justify-content-between">
                              <div className='text-decoration-underline'>Total payments: {summary.total_payments}</div>
                              <div className='text-decoration-underline'>Total Amount: {currencyFormatter.format(summary.total_amount)}</div>
                              <div className='text-decoration-underline'>Pending: {summary.pending_payments}</div>
                              <div className='text-decoration-underline'>Completed: {summary.completed_payments}</div>
                         </div>
                    </div>
               )}

               {/* Filters Offcanvas */}
               <Offcanvas
                    show={showFilters}
                    onHide={() => setShowFilters(false)}
                    placement="end"
               >
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title>
                              🔍 Journal Filters
                         </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <div className="row g-3">
                              <div className="col-12">
                                   <label className="form-label">Reference Type</label>
                                   <select
                                        className="form-select"
                                        value={filters.reference_type}
                                        onChange={(e) => setFilters({ ...filters, reference_type: e.target.value })}
                                   >
                                        <option value="">All Types</option>
                                        <option value="supplier_payment">Supplier Payment</option>
                                        <option value="customer_invoice">Customer Invoice</option>
                                        <option value="expense">Expense</option>
                                        <option value="revenue">Revenue</option>
                                   </select>
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Entry Status</label>
                                   <select
                                        className="form-select"
                                        value={filters.entry_status}
                                        onChange={(e) => setFilters({ ...filters, entry_status: e.target.value })}
                                   >
                                        <option value="">All Statuses</option>
                                        <option value="draft">Draft</option>
                                        <option value="posted">Posted</option>
                                        <option value="cancelled">Cancelled</option>
                                   </select>
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Source Module</label>
                                   <select
                                        className="form-select"
                                        value={filters.source_module}
                                        onChange={(e) => setFilters({ ...filters, source_module: e.target.value })}
                                   >
                                        <option value="">All Modules</option>
                                        <option value="inventory">Inventory</option>
                                        <option value="billing">Billing</option>
                                        <option value="accounting">Accounting</option>
                                   </select>
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Account</label>
                                   <select
                                        className="form-select"
                                        value={filters.account_id}
                                        onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}
                                   >
                                        <option value="">All Accounts</option>
                                        <option value="acc-1000">Cash</option>
                                        <option value="acc-2000">Accounts Payable</option>
                                   </select>
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Search</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Entry ID, description, reference..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                   />
                              </div>
                         </div>
                    </Offcanvas.Body>
                    <div className="offcanvas-footer p-3 border-top">
                         <div className="d-flex gap-2 w-100">
                              <button
                                   className="btn btn-primary flex-fill"
                                   onClick={() => {
                                        loadJournalEntries();
                                        setShowFilters(false);
                                   }}
                              >
                                   Apply Filters
                              </button>
                              <button
                                   className="btn btn-outline-secondary flex-fill"
                                   onClick={() => {
                                        setFilters({
                                             reference_type: '',
                                             entry_status: '',
                                             source_module: '',
                                             account_id: '',
                                             start_date: '',
                                             end_date: '',
                                             search: ''
                                        });
                                        loadJournalEntries();
                                        setShowFilters(false);
                                   }}
                              >
                                   Clear
                              </button>
                         </div>
                    </div>
               </Offcanvas>

               {/* Journal Entries Table */}
               <PrimeTable
                    column={journalColumns}
                    data={entries || []}
                    filtering={true}
                    urlparams={filters}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />
          </div>
     );
}
