'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

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
                         <Link href="/inventory/analytics" className="text-decoration-none">
                              <span className="text-muted">← Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">💰 Payment Analytics</h2>
                         <p className="text-muted mb-0">Supplier payment tracking and analysis</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadPaymentAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Payment Status Overview */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{analytics.total_payments.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Total Payments</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-warning">{analytics.pending_payments.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Pending Payments</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{analytics.completed_payments.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Completed Payments</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-danger">{analytics.failed_payments.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Failed Payments</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payment Value Metrics */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-6">
                              <div className="card">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{currencyFormatter.format(analytics.total_payment_value)}</h4>
                                        <p className="text-muted mb-0">Total Payment Value</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-6">
                              <div className="card">
                                   <div className="card-body text-center">
                                        <h4 className="text-secondary">{currencyFormatter.format(analytics.average_payment_value)}</h4>
                                        <p className="text-muted mb-0">Average Payment Value</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payment Methods and Supplier Summary */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Payments by Method</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && Object.keys(analytics.payments_by_method).length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {Object.entries(analytics.payments_by_method).map(([method, count]) => (
                                                  <div key={method} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <span className="badge bg-primary me-2">{method.toUpperCase()}</span>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold">{count.toLocaleString()}</div>
                                                            <small className="text-muted">payments</small>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No payment method data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Supplier Payment Summary</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.supplier_payment_summary.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Total Paid</th>
                                                            <th>Pending</th>
                                                            <th>Payments</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.supplier_payment_summary.slice(0, 10).map((supplier) => (
                                                            <tr key={supplier.supplier_id}>
                                                                 <td>
                                                                      <div className="fw-bold">{supplier.supplier_name}</div>
                                                                 </td>
                                                                 <td className="text-success">{currencyFormatter.format(supplier.total_paid)}</td>
                                                                 <td className="text-warning">{currencyFormatter.format(supplier.pending_amount)}</td>
                                                                 <td>{supplier.payment_count.toLocaleString()}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
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