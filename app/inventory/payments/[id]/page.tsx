'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';

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

export default function PaymentDetailsPage() {
     const params = useParams();
     const paymentId = params?.id as string;

     const [payment, setPayment] = useState<Payment | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          if (paymentId) {
               loadPaymentDetails();
          }
     }, [paymentId]);

     const loadPaymentDetails = async () => {
          try {
               setLoading(true);
               setError(null);

               const response = await customFetch(`inventory/supplier-payments/payments/${paymentId}`);

               if (response.success) {
                    setPayment(response.data || response.payment);
               } else {
                    setError(response.message || 'Failed to load payment details');
                    toast.error(response.message || 'Failed to load payment details');
               }
          } catch (err) {
               console.error('Error loading payment details:', err);
               setError('Failed to load payment details');
               toast.error('Failed to load payment details');
          } finally {
               setLoading(false);
          }
     };

     const formatDate = (dateString: string) => {
          if (!dateString) return 'N/A';
          return new Date(dateString).toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               </div>
          );
     }

     if (error || !payment) {
          return (
               <div className="container-fluid p-4">
                    <div className="alert alert-danger">
                         <h5 className="alert-heading">Error Loading Payment</h5>
                         <p>{error || 'Payment not found'}</p>
                         <Link href="/inventory/payments" className="btn btn-primary">
                              ← Back to Payments
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4" data-pdf-root>
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h3 className="mb-1" style={{ fontSize: '1.25rem' }}>
                              💰 Payment Details
                         </h3>
                         <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Detailed information for payment {payment.payment_id}</p>
                    </div>
                    <div className="btn-group">
                         <Link href="/inventory/payments" className="btn btn-outline-secondary">
                              ← Back to Payments
                         </Link>
                         <ExportPdfButton
                              title="Payment Details"
                              subtitle={`Payment ${payment.payment_id}`}
                              filters={[`Supplier: ${payment.supplier_name}`]}
                         />
                         <button
                              className="btn btn-outline-primary"
                              onClick={loadPaymentDetails}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Payment Details Section */}
               <div className="border rounded p-3">
                    <div className="border-bottom pb-2 mb-3">
                         <h6 className="mb-0" style={{ fontSize: '1rem' }}>
                              Payment Information
                              <span>
                                   {STATUS_BADGES[payment.payment_status as keyof typeof STATUS_BADGES]?.label || payment.payment_status}
                              </span>
                         </h6>
                    </div>
                    <div>
                         <div className="row">
                              <div className="col-md-6">
                                   <h6 className="text-primary mb-3" style={{ fontSize: '0.9rem' }}>Payment Details</h6>
                                   <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
                                        <tbody>
                                             <tr>
                                                  <td className="fw-bold">Payment ID:</td>
                                                  <td>{payment.payment_id}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Amount:</td>
                                                  <td className="fw-bold text-success">{currencyFormatter.format(payment.payment_amount)}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Payment Date:</td>
                                                  <td>{formatDate(payment.payment_date)}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Payment Method:</td>
                                                  <td>{payment.payment_method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Status:</td>
                                                  <td>
                                                       <span>
                                                            {STATUS_BADGES[payment.payment_status as keyof typeof STATUS_BADGES]?.label || payment.payment_status}
                                                       </span>
                                                  </td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Reference Number:</td>
                                                  <td>{payment.reference_number || 'N/A'}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Total Allocated:</td>
                                                  <td>{currencyFormatter.format(payment.total_allocated || 0)}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                              <div className="col-md-6">
                                   <h6 className="text-primary mb-3" style={{ fontSize: '0.9rem' }}>Related Information</h6>
                                   <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
                                        <tbody>
                                             <tr>
                                                  <td className="fw-bold">Supplier:</td>
                                                  <td>
                                                       <div>
                                                            <div className="fw-bold">{payment.supplier_name}</div>
                                                            <small className="text-muted">ID: {payment.supplier_id}</small>
                                                       </div>
                                                  </td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Purchase Order:</td>
                                                  <td>
                                                       <div>
                                                            <div className="fw-bold">{payment.po_order_number}</div>
                                                            <small className="text-muted">ID: {payment.purchase_order_id}</small>
                                                       </div>
                                                  </td>
                                             </tr>
                                        </tbody>
                                   </table>

                                   <h6 className="text-primary mb-3" style={{ fontSize: '0.9rem' }}>Processing Information</h6>
                                   <table className="table table-sm" style={{ fontSize: '0.85rem' }}>
                                        <tbody>
                                             <tr>
                                                  <td className="fw-bold">Created By:</td>
                                                  <td>{payment.created_by || 'N/A'}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Approved By:</td>
                                                  <td>{payment.approved_by || 'N/A'}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Created:</td>
                                                  <td>{formatDate(payment.created_at)}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Updated:</td>
                                                  <td>{formatDate(payment.updated_at)}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Approved At:</td>
                                                  <td>{payment.approved_at ? formatDate(payment.approved_at) : 'N/A'}</td>
                                             </tr>
                                             <tr>
                                                  <td className="fw-bold">Processed At:</td>
                                                  <td>{payment.processed_at ? formatDate(payment.processed_at) : 'N/A'}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         {payment.payment_notes && (
                              <div className="mt-3">
                                   <h6 className="text-primary mb-2" style={{ fontSize: '0.9rem' }}>Payment Notes</h6>
                                   <div className="alert alert-light">
                                        <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                                             {payment.payment_notes}
                                        </pre>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}
