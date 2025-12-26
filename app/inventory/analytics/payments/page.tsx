'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { RiMoneyDollarCircleLine, RiTimeLine, RiCheckLine, RiCloseLine, RiRefreshLine, RiArrowLeftLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface PaymentAnalytics {
     total_payments: number;
     pending_payments: number;
     completed_payments: number;
     failed_payments: number;
     total_payment_value: number;
     average_payment_value: number;
     payments_by_method: Record<string, number>;
     supplier_payment_summary: Array<{
          supplier_id: string;
          supplier_name: string;
          total_paid: number;
          pending_amount: number;
          payment_count: number;
     }>;
}

export default function PaymentAnalyticsPage() {
     const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (branchid && employeeid) {
               loadPaymentAnalytics();
          }
     }, [branchid, employeeid]);

     const loadPaymentAnalytics = async () => {
          try {
               const response = await customFetch(`inventory/analytics/payments?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load payment analytics');
               }
          } catch (error) {
               console.error('Error loading payment analytics:', error);
               toast.error('Error loading payment analytics');
          } finally {
               setLoading(false);
          }
     };

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none d-block mb-2">
                              <RiArrowLeftLine size={16} className="me-1" />
                              <span className="text-muted">Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">
                              <RiMoneyDollarCircleLine className="me-2" />
                              Payment Analytics
                         </h2>
                         <p className="text-muted mb-0">Supplier payment tracking and analysis</p>
                    </div>
                    <button
                         className="btn btn-outline-primary btn-sm"
                         onClick={loadPaymentAnalytics}
                    >
                         <RiRefreshLine size={16} className="me-1" />
                         Refresh
                    </button>
               </div>

               {/* Payment Status Overview */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                                        <span className="fw-medium text-muted small">Total Payments</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-primary">{analytics.total_payments.toLocaleString()}</div>
                                   <div className="small text-muted">All payment records</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiTimeLine size={20} className="me-2 text-warning" />
                                        <span className="fw-medium text-muted small">Pending Payments</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-warning">{analytics.pending_payments.toLocaleString()}</div>
                                   <div className="small text-muted">Awaiting processing</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiCheckLine size={20} className="me-2 text-success" />
                                        <span className="fw-medium text-muted small">Completed Payments</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-success">{analytics.completed_payments.toLocaleString()}</div>
                                   <div className="small text-muted">Successfully processed</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiCloseLine size={20} className="me-2 text-danger" />
                                        <span className="fw-medium text-muted small">Failed Payments</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-danger">{analytics.failed_payments.toLocaleString()}</div>
                                   <div className="small text-muted">Payment errors</div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payment Value Metrics */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiMoneyDollarCircleLine size={20} className="me-2 text-info" />
                                        <span className="fw-medium text-muted small">Total Payment Value</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-info">{currencyFormatter.format(analytics.total_payment_value)}</div>
                                   <div className="small text-muted">Cumulative payment amount</div>
                              </div>
                         </div>
                         <div className="col-md-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiMoneyDollarCircleLine size={20} className="me-2 text-secondary" />
                                        <span className="fw-medium text-muted small">Average Payment Value</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-secondary">{currencyFormatter.format(analytics.average_payment_value)}</div>
                                   <div className="small text-muted">Mean payment amount</div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payment Methods and Supplier Summary */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3">Payments by Method</h6>
                              <div className="p-2">
                                   {analytics && Object.keys(analytics.payments_by_method).length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {Object.entries(analytics.payments_by_method).map(([method, count]) => (
                                                  <div key={method} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <span className="fw-medium">{method.toUpperCase()}</span>
                                                       </div>
                                                       <div className="text-start">
                                                            <div className="fw-bold">{count.toLocaleString()}</div>
                                                            <small className="text-muted">payments</small>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No payment method data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3">Supplier Payment Summary</h6>
                              <div className="p-2">
                                   {analytics && analytics.supplier_payment_summary.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Supplier</th>
                                                            <th className="text-start">Total Paid</th>
                                                            <th className="text-start">Pending</th>
                                                            <th className="text-start">Payments</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.supplier_payment_summary.slice(0, 10).map((supplier) => (
                                                            <tr key={supplier.supplier_id}>
                                                                 <td className="text-start">
                                                                      <div className="fw-bold">{supplier.supplier_name}</div>
                                                                 </td>
                                                                 <td className="text-start text-success">{currencyFormatter.format(supplier.total_paid)}</td>
                                                                 <td className="text-start text-warning">{currencyFormatter.format(supplier.pending_amount)}</td>
                                                                 <td className="text-start">{supplier.payment_count.toLocaleString()}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No supplier payment data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}