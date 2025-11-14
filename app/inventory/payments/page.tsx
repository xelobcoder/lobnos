'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { RiMoneyDollarCircleLine, RiEyeLine, RiFilterLine, RiSearchLine, RiCheckboxCircleLine, RiTimeLine, RiCloseCircleLine, RiDeleteBinLine } from '@remixicon/react';
import { currencyFormatter, customFetch, customPost } from '../../../components/Auth/customFetch';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { useApplication } from '../../../components/Auth/useApplicationContext';

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
     const employeeid = useApplication()?.user?.employeeid;
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

     useEffect(() => {
          loadPayments();
     }, []);

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
               Cell: ({ value }) => (
                    <Link href={`/inventory/orders/${value}`} className="text-decoration-none">
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
                         <span className={`badge bg-${badge.color}`}>
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
                    <div className="d-flex gap-1">
                         {row.original.payment_status === 'pending' && (
                              <>
                                   <button
                                        className="btn btn-sm btn-success"
                                        title="Approve Payment"
                                        onClick={() => handleApprovePayment(row.original.id)}
                                   >
                                        <RiCheckboxCircleLine size={14} className="me-1" />
                                        Approve
                                   </button>
                                   <button
                                        className="btn btn-sm btn-warning"
                                        title="Cancel Payment"
                                        onClick={() => handleCancelPayment(row.original)}
                                   >
                                        <RiDeleteBinLine size={14} className="me-1" />
                                        Cancel
                                   </button>
                                   <button
                                        className="btn btn-sm btn-danger"
                                        title="Reject Payment"
                                        onClick={() => handleRejectPayment(row.original)}
                                   >
                                        <RiCloseCircleLine size={14} className="me-1" />
                                        Reject
                                   </button>
                              </>
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
                              <RiMoneyDollarCircleLine className="me-2" />
                              Supplier Payments
                         </h2>
                         <p className="text-muted mb-0">Manage supplier payments and transactions</p>
                    </div>
                    <div className="btn-group">
                         <button
                              className="btn btn-outline-secondary"
                              onClick={() => setShowFilters(!showFilters)}
                         >
                              <RiFilterLine className="me-1" />
                              Filters
                         </button>
                         <button
                              className="btn btn-outline-primary"
                              onClick={loadPayments}
                         >
                              <RiSearchLine className="me-1" />
                              Refresh
                         </button>
                    </div>
               </div>

               {/* Filters Panel */}
               {showFilters && (
                    <div className="card mb-4">
                         <div className="card-header">
                              <h6 className="mb-0">
                                   <RiFilterLine className="me-1" />
                                   Filters
                              </h6>
                         </div>
                         <div className="card-body">
                              <div className="row">
                                   <div className="col-md-3">
                                        <label className="form-label">Status</label>
                                        <select
                                             className="form-select form-select-sm"
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
                                   <div className="col-md-3">
                                        <label className="form-label">Payment Method</label>
                                        <select
                                             className="form-select form-select-sm"
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
                                   <div className="col-md-3">
                                        <label className="form-label">Search</label>
                                        <input
                                             type="text"
                                             className="form-control form-control-sm"
                                             placeholder="Payment ID, supplier..."
                                             value={filters.search}
                                             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        />
                                   </div>
                                   <div className="col-md-3 d-flex align-items-end">
                                        <button
                                             className="btn btn-primary btn-sm me-2"
                                             onClick={loadPayments}
                                        >
                                             Apply Filters
                                        </button>
                                        <button
                                             className="btn btn-outline-secondary btn-sm"
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
                                             }}
                                        >
                                             Clear
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payments Table */}
               <PrimeTable
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
                                             <RiCloseCircleLine className="me-2 text-danger" />
                                             Reject Payment
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
                                             <RiDeleteBinLine className="me-2 text-warning" />
                                             Cancel Payment
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

          </div>
     );
}