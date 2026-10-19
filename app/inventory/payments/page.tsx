'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import { currencyFormatter, customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';

interface Payment {
     id: string;
     payment_id: string;
     supplier_id: string;
     supplier_name: string;
     purchase_order_id: string;
     po_order_number: string;
     payment_amount: number;
     payment_date: string;
     payment_method: string;
     payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'reject';
     reference_number: string | null;
     payment_notes: string;
     total_allocated: number;
     created_by: string | null;
     approved_by: string | null;
     approved_at: string | null;
     processed_at: string | null;
     created_at: string;
     updated_at: string;
}

const STATUS_BADGES = {
     pending: { label: 'Pending', color: 'warning' },
     completed: { label: 'Completed', color: 'success' },
     failed: { label: 'Failed', color: 'danger' },
     cancelled: { label: 'Cancelled', color: 'secondary' },
     refunded: { label: 'Refunded', color: 'info' },
     reject: { label: 'Rejected', color: 'danger' }
};

export default function PaymentsPage() {
     const [payments, setPayments] = useState<Payment[]>([]);
     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;
     const [loading, setLoading] = useState(true);
     const [showFilters, setShowFilters] = useState(false);
     const [filters, setFilters] = useState({
          supplier_id: '',
          payment_status: '',
          payment_method: '',
          start_date: '',
          end_date: '',
          search: ''
     });
     const [showRejectionModal, setShowRejectionModal] = useState(false);
     const [selectedPaymentForRejection, setSelectedPaymentForRejection] = useState<Payment | null>(null);
     const [rejectionReason, setRejectionReason] = useState('');
     const [showCancelModal, setShowCancelModal] = useState(false);
     const [selectedPaymentForCancel, setSelectedPaymentForCancel] = useState<Payment | null>(null);
     const [cancelReason, setCancelReason] = useState('');
     const [showDetailsModal, setShowDetailsModal] = useState(false);
     const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any>(null);
     const [loadingDetails, setLoadingDetails] = useState(false);

     useEffect(() => {
          if (branchid && employeeid) {
               loadPayments();
          }
     }, [branchid, employeeid]);

     const loadPayments = async () => {
          try {
               setLoading(true);
               const queryParams = new URLSearchParams();

               // Add filters to query params
               Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                         queryParams.append(key, value);
                    }
               });

               // Add required parameters
               queryParams.append('branchid', branchid);
               queryParams.append('employeeid', employeeid);

               const response = await customFetch(`inventory/supplier-payments/payments?${queryParams.toString()}`);
               if (response.success) {
                    setPayments(response.payments || []);
               } else {
                    console.error('Error loading payments:', response.message);
               }
          } catch (error) {
               console.error('Error loading payments:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleApprovePayment = async (paymentId: string) => {
          if (!confirm('Are you sure you want to approve this payment?')) {
               return;
          }

          try {
               setLoading(true);
               const response = await customPost(`inventory/supplier-payments/payments/${paymentId}/approve`, 'PUT', {
                    payment_id: paymentId,
                    approved_by: employeeid
               });

               if (response.success) {
                    toast.success('Payment approved successfully');
                    loadPayments();
               } else {
                    toast.error(response.message || 'Failed to approve payment');
               }
          } catch (error) {
               console.error('Error approving payment:', error);
               toast.error('Failed to approve payment');
          } finally {
               setLoading(false);
          }
     };

     const handleRejectPayment = (payment: Payment) => {
          setSelectedPaymentForRejection(payment);
          setRejectionReason('');
          setShowRejectionModal(true);
     };

     const handleConfirmRejectPayment = async () => {
          if (!selectedPaymentForRejection || !rejectionReason.trim()) {
               toast.error('Please provide a rejection reason');
               return;
          }

          try {
               setLoading(true);
               const response = await customPost(`inventory/supplier-payments/payments/${selectedPaymentForRejection.id}/reject`, 'PUT', {
                    payment_id: selectedPaymentForRejection.payment_id,
                    rejected_by: employeeid,
                    rejection_reason: rejectionReason.trim()
               });

               if (response.success) {
                    toast.success('Payment rejected successfully');
                    loadPayments();
                    setShowRejectionModal(false);
                    setSelectedPaymentForRejection(null);
                    setRejectionReason('');
               } else {
                    toast.error(response.message || 'Failed to reject payment');
               }
          } catch (error) {
               console.error('Error rejecting payment:', error);
               toast.error('Failed to reject payment');
          } finally {
               setLoading(false);
          }
     };

     const handleCancelPayment = (payment: Payment) => {
          setSelectedPaymentForCancel(payment);
          setCancelReason('');
          setShowCancelModal(true);
     };

     const handleConfirmCancelPayment = async () => {
          if (!selectedPaymentForCancel || !cancelReason.trim()) {
               toast.error('Please provide a cancellation reason');
               return;
          }

          try {
               setLoading(true);
               const response = await customPost(`inventory/supplier-payments/payments/${selectedPaymentForCancel.id}/cancel`, 'PUT', {
                    payment_id: selectedPaymentForCancel.payment_id,
                    cancelled_by: employeeid,
                    cancellation_reason: cancelReason.trim()
               });

               if (response.success) {
                    toast.success('Payment cancelled successfully');
                    loadPayments();
                    setShowCancelModal(false);
                    setSelectedPaymentForCancel(null);
                    setCancelReason('');
               } else {
                    toast.error(response.message || 'Failed to cancel payment');
               }
          } catch (error) {
               console.error('Error cancelling payment:', error);
               toast.error('Failed to cancel payment');
          } finally {
               setLoading(false);
          }
     };

     const handleMakeAsExpense = async (paymentId: string) => {
          if (!confirm('Are you sure you want to convert this payment to an expense?')) {
               return;
          }

          try {
               setLoading(true);
               const response = await customPost(`supplier-payments/mark-expense`, 'POST', {
                    paymentId: paymentId,
                    employeeid: employeeid,
                    branchid: branchid
               });

               if (response.status?.success) {
                    toast.success(response.status.message || 'Payment converted to expense successfully');
                    loadPayments();
               } else {
                    toast.error(response.status?.message || response.message || 'Failed to convert payment to expense');
               }
          } catch (error) {
               console.error('Error converting payment to expense:', error);
               toast.error('Failed to convert payment to expense');
          } finally {
               setLoading(false);
          }
     };

     const handleViewPaymentDetails = async (paymentId: string) => {
          try {
               setLoadingDetails(true);
               const response = await customFetch(`inventory/supplier-payments/payments/${paymentId}?branchid=${branchid}&employeeid=${employeeid}`);

               if (response.success) {
                    setSelectedPaymentDetails(response.data);
                    setShowDetailsModal(true);
               } else {
                    toast.error(response.message || 'Failed to load payment details');
               }
          } catch (error) {
               console.error('Error loading payment details:', error);
               toast.error('Failed to load payment details');
          } finally {
               setLoadingDetails(false);
          }
     };

     const handleServerSideProcessing = async (params: any) => {
          try {
               const { count, page, sortby = "DESC", supplier_id, payment_status, payment_method, start_date, end_date, search } = params;
               const endpoint = `inventory/supplier-payments/payments?count=${count}&page=${page}&sortby=${sortby}&&supplier_id=${supplier_id || ''}&payment_status=${payment_status || ''}&payment_method=${payment_method || ''}&start_date=${start_date || ''}&end_date=${end_date || ''}&search=${search || ''}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const records = response.payments || [];
                    return {
                         result: records,
                         error: false,
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
               day: 'numeric'
          });
     };

     const paymentColumns = [
          {
               Header: 'Payment ID',
               accessor: 'payment_id',
               Cell: ({ value }) => (
                    <Link href={`/inventory/payments/${value}`} className="text-decoration-none fw-bold">
                         {value}
                    </Link>
               )
          },
          {
               Header: 'Supplier',
               accessor: 'supplier_name'
          },
          {
               Header: 'Order #',
               accessor: 'po_order_number',
               Cell: ({ value, row }) => (
                    <Link href={`/inventory/payments/${row.original.id}`} className="text-decoration-none">
                         {value}
                    </Link>
               )
          },
          {
               Header: 'Amount',
               accessor: 'payment_amount',
               Cell: ({ value }) => currencyFormatter.format(value)
          },
          {
               Header: 'Date',
               accessor: 'payment_date',
               Cell: ({ value }) => formatDate(value)
          },
          {
               Header: 'Method',
               accessor: 'payment_method',
               Cell: ({ value }) => value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          },
          {
               Header: 'Status',
               accessor: 'payment_status',
               Cell: ({ value }) => {
                    const badge = STATUS_BADGES[value as keyof typeof STATUS_BADGES] || STATUS_BADGES.pending;
                    return (
                         <span>
                              {badge.label}
                         </span>
                    );
               }
          },
          {
               Header: 'Reference',
               accessor: 'reference_number'
          },
          {
               Header: 'Allocated',
               accessor: 'total_allocated',
               Cell: ({ value }) => currencyFormatter.format(value || 0)
          },
          {
               Header: 'Actions',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1 flex-wrap">
                         {row.original.payment_status === 'pending' && (
                              <>
                                   <button
                                        className="btn btn-sm btn-success"
                                        title="Approve Payment"
                                        onClick={() => handleApprovePayment(row.original.id)}
                                   >
                                        ✓ Approve
                                   </button>
                                   <button
                                        className="btn btn-sm btn-warning"
                                        title="Cancel Payment"
                                        onClick={() => handleCancelPayment(row.original)}
                                   >
                                        ✕ Cancel
                                   </button>
                                   <button
                                        className="btn btn-sm btn-danger"
                                        title="Reject Payment"
                                        onClick={() => handleRejectPayment(row.original)}
                                   >
                                        ✗ Reject
                                   </button>
                              </>
                         )}
                         {row.original.payment_status !== 'pending' && (
                              <button
                                   className="btn btn-sm btn-info"
                                   title="View Payment Details"
                                   onClick={() => handleViewPaymentDetails(row.original.id)}
                                   disabled={loadingDetails}
                              >
                                   👁 {loadingDetails ? 'Loading...' : 'View Details'}
                              </button>
                         )}
                         {!row.original.expense_synced && (
                              <button
                                   className="btn btn-sm btn-secondary"
                                   title="Convert to Expense"
                                   onClick={() => handleMakeAsExpense(row.original.id)}
                                   disabled={loading}
                              >
                                   💰 Make Expense
                              </button>
                         )}
                    </div>
               )
          }
     ];

     const getPaymentStats = () => {
          const totalPayments = payments.length;
          const pendingPayments = payments.filter(p => p.payment_status === 'pending').length;
          const completedPayments = payments.filter(p => p.payment_status === 'completed').length;
          const totalAmount = payments.reduce((sum, payment) => sum + payment.payment_amount, 0);

          return { totalPayments, pendingPayments, completedPayments, totalAmount };
     };

     const stats = getPaymentStats();

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              💰 Supplier Payments
                         </h2>
                         <p className="text-muted mb-0">Manage supplier payments and transactions</p>
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
                              onClick={loadPayments}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <span className="me-2 text-primary">💰</span>
                                   <span className="fw-medium text-muted small">Total Payments</span>
                              </div>
                              <div className="fs-4 fw-bold text-primary">{stats.totalPayments}</div>
                              <div className="small text-muted">All payment records</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <span className="me-2 text-warning">⏳</span>
                                   <span className="fw-medium text-muted small">Pending Payments</span>
                              </div>
                              <div className="fs-4 fw-bold text-warning">{stats.pendingPayments}</div>
                              <div className="small text-muted">Awaiting approval</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <span className="me-2 text-success">✅</span>
                                   <span className="fw-medium text-muted small">Completed Payments</span>
                              </div>
                              <div className="fs-4 fw-bold text-success">{stats.completedPayments}</div>
                              <div className="small text-muted">Successfully processed</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <span className="me-2 text-info">💵</span>
                                   <span className="fw-medium text-muted small">Total Amount</span>
                              </div>
                              <div className="fs-4 fw-bold text-info">{currencyFormatter.format(stats.totalAmount)}</div>
                              <div className="small text-muted">Total payment value</div>
                         </div>
                    </div>
               </div>

               {/* Filters Offcanvas */}
               <Offcanvas
                    show={showFilters}
                    onHide={() => setShowFilters(false)}
                    placement="end"
               >
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title>
                              🔍 Payment Filters
                         </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <div className="row g-3">
                              <div className="col-12">
                                   <label className="form-label">Status</label>
                                   <select
                                        className="form-select"
                                        value={filters.payment_status}
                                        onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                                   >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                        <option value="reject">Rejected</option>
                                   </select>
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Payment Method</label>
                                   <select
                                        className="form-select"
                                        value={filters.payment_method}
                                        onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                                   >
                                        <option value="">All Methods</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                        <option value="credit_card">Credit Card</option>
                                        <option value="wire_transfer">Wire Transfer</option>
                                   </select>
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Search</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Payment ID, supplier..."
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
                                        loadPayments();
                                        setShowFilters(false);
                                   }}
                              >
                                   Apply Filters
                              </button>
                              <button
                                   className="btn btn-outline-secondary flex-fill"
                                   onClick={() => {
                                        setFilters({
                                             supplier_id: '',
                                             payment_status: '',
                                             payment_method: '',
                                             start_date: '',
                                             end_date: '',
                                             search: ''
                                        });
                                        loadPayments();
                                        setShowFilters(false);
                                   }}
                              >
                                   Clear
                              </button>
                         </div>
                    </div>
               </Offcanvas>

               {/* Payments Table */}
               <PrimeTable pdfExport pdfTitle="Supplier Payments"
                    column={paymentColumns}
                    data={payments || []}
                    filtering={true}
                    urlparams={filters}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Rejection Modal */}
               {showRejectionModal && selectedPaymentForRejection && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             ✗ Reject Payment
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowRejectionModal(false);
                                                  setSelectedPaymentForRejection(null);
                                                  setRejectionReason('');
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="alert alert-warning">
                                             <strong>Payment Details:</strong><br />
                                             Payment ID: {selectedPaymentForRejection.payment_id}<br />
                                             Supplier: {selectedPaymentForRejection.supplier_name}<br />
                                             Amount: {currencyFormatter.format(selectedPaymentForRejection.payment_amount)}
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Rejection Reason <span className="text-danger">*</span></label>
                                             <textarea
                                                  className="form-control"
                                                  rows={4}
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  placeholder="Please provide a detailed reason for rejecting this payment..."
                                                  required
                                             />
                                             <small className="text-muted">This reason will be recorded and may be visible to the payment submitter.</small>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowRejectionModal(false);
                                                  setSelectedPaymentForRejection(null);
                                                  setRejectionReason('');
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-danger btn-sm"
                                             onClick={handleConfirmRejectPayment}
                                             disabled={loading || !rejectionReason.trim()}
                                        >
                                             {loading ? 'Rejecting...' : 'Reject Payment'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Cancel Modal */}
               {showCancelModal && selectedPaymentForCancel && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             ✕ Cancel Payment
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowCancelModal(false);
                                                  setSelectedPaymentForCancel(null);
                                                  setCancelReason('');
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="alert alert-info">
                                             <strong>Payment Details:</strong><br />
                                             Payment ID: {selectedPaymentForCancel.payment_id}<br />
                                             Supplier: {selectedPaymentForCancel.supplier_name}<br />
                                             Amount: {currencyFormatter.format(selectedPaymentForCancel.payment_amount)}
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Cancellation Reason <span className="text-danger">*</span></label>
                                             <textarea
                                                  className="form-control"
                                                  rows={4}
                                                  value={cancelReason}
                                                  onChange={(e) => setCancelReason(e.target.value)}
                                                  placeholder="Please provide a detailed reason for cancelling this payment..."
                                                  required
                                             />
                                             <small className="text-muted">This reason will be recorded for audit purposes.</small>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowCancelModal(false);
                                                  setSelectedPaymentForCancel(null);
                                                  setCancelReason('');
                                             }}
                                        >
                                             Close
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-warning btn-sm"
                                             onClick={handleConfirmCancelPayment}
                                             disabled={loading || !cancelReason.trim()}
                                        >
                                             {loading ? 'Cancelling...' : 'Cancel Payment'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payment Details Modal */}
               {showDetailsModal && selectedPaymentDetails && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             👁 Payment Details - {selectedPaymentDetails.payment_id}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowDetailsModal(false);
                                                  setSelectedPaymentDetails(null);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <h6 className="text-primary mb-3">Payment Information</h6>
                                                  <table className="table table-sm">
                                                       <tbody>
                                                            <tr>
                                                                 <td className="fw-bold">Payment ID:</td>
                                                                 <td>{selectedPaymentDetails.payment_id}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Amount:</td>
                                                                 <td className="fw-bold text-success">{currencyFormatter.format(selectedPaymentDetails.payment_amount)}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Payment Date:</td>
                                                                 <td>{formatDate(selectedPaymentDetails.payment_date)}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Payment Method:</td>
                                                                 <td>{selectedPaymentDetails.payment_method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Status:</td>
                                                                 <td>
                                                                      <span className={`badge bg-${STATUS_BADGES[selectedPaymentDetails.payment_status as keyof typeof STATUS_BADGES]?.color || 'secondary'}`}>
                                                                           {STATUS_BADGES[selectedPaymentDetails.payment_status as keyof typeof STATUS_BADGES]?.label || selectedPaymentDetails.payment_status}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Reference Number:</td>
                                                                 <td>{selectedPaymentDetails.reference_number || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Total Allocated:</td>
                                                                 <td>{currencyFormatter.format(selectedPaymentDetails.total_allocated || 0)}</td>
                                                            </tr>
                                                       </tbody>
                                                  </table>
                                             </div>
                                             <div className="col-md-6">
                                                  <h6 className="text-primary mb-3">Related Information</h6>
                                                  <table className="table table-sm">
                                                       <tbody>
                                                            <tr>
                                                                 <td className="fw-bold">Supplier:</td>
                                                                 <td>
                                                                      <div>
                                                                           <div className="fw-bold">{selectedPaymentDetails.supplier?.name}</div>
                                                                           <small className="text-muted">{selectedPaymentDetails.supplier?.contact}</small><br />
                                                                           <small className="text-muted">{selectedPaymentDetails.supplier?.email}</small>
                                                                      </div>
                                                                 </td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Purchase Order:</td>
                                                                 <td>
                                                                      <div>
                                                                           <div className="fw-bold">{selectedPaymentDetails.purchase_order?.order_number}</div>
                                                                           <small className="text-muted">Total: {currencyFormatter.format(selectedPaymentDetails.purchase_order?.total_amount || 0)}</small><br />
                                                                           <small className="text-muted">Status: {selectedPaymentDetails.purchase_order?.status}</small>
                                                                      </div>
                                                                 </td>
                                                            </tr>
                                                       </tbody>
                                                  </table>

                                                  <h6 className="text-primary mb-3">Timestamps</h6>
                                                  <table className="table table-sm">
                                                       <tbody>
                                                            <tr>
                                                                 <td className="fw-bold">Created:</td>
                                                                 <td>{selectedPaymentDetails.created_at ? formatDate(selectedPaymentDetails.created_at) : 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Updated:</td>
                                                                 <td>{selectedPaymentDetails.updated_at ? formatDate(selectedPaymentDetails.updated_at) : 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Approved:</td>
                                                                 <td>{selectedPaymentDetails.approved_at ? formatDate(selectedPaymentDetails.approved_at) : 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                 <td className="fw-bold">Processed:</td>
                                                                 <td>{selectedPaymentDetails.processed_at ? formatDate(selectedPaymentDetails.processed_at) : 'N/A'}</td>
                                                            </tr>
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>

                                        {selectedPaymentDetails.payment_notes && (
                                             <div className="mt-3">
                                                  <h6 className="text-primary mb-2">Payment Notes</h6>
                                                  <div className="alert alert-light">
                                                       <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                                                            {selectedPaymentDetails.payment_notes}
                                                       </pre>
                                                  </div>
                                             </div>
                                        )}

                                        {selectedPaymentDetails.allocations && selectedPaymentDetails.allocations.length > 0 && (
                                             <div className="mt-3">
                                                  <h6 className="text-primary mb-2">Allocations</h6>
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Allocation ID</th>
                                                                      <th>Amount</th>
                                                                      <th>Status</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {selectedPaymentDetails.allocations.map((allocation: any, index: number) => (
                                                                      <tr key={index}>
                                                                           <td>{allocation.id || `Allocation ${index + 1}`}</td>
                                                                           <td>{currencyFormatter.format(allocation.amount || 0)}</td>
                                                                           <td>{allocation.status || 'N/A'}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowDetailsModal(false);
                                                  setSelectedPaymentDetails(null);
                                             }}
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