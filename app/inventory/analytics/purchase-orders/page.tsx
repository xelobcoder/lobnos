'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface PurchaseOrderAnalytics {
     total_orders: number;
     pending_orders: number;
     received_orders: number;
     cancelled_orders: number;
     total_order_value: number;
     average_order_value: number;
     orders_by_month: Array<{
          month: string;
          count: number;
          value: number;
     }>;
     top_suppliers: Array<{
          supplier_id: string;
          supplier_name: string;
          order_count: number;
          total_value: number;
     }>;
}

export default function PurchaseOrderAnalyticsPage() {
     const [analytics, setAnalytics] = useState<PurchaseOrderAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadPurchaseOrderAnalytics();
     }, []);

     const loadPurchaseOrderAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/purchase-orders');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load purchase order analytics');
               }
          } catch (error) {
               console.error('Error loading purchase order analytics:', error);
               toast.error('Error loading purchase order analytics');
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
                         <h2 className="mb-1">📋 Purchase Order Analytics</h2>
                         <p className="text-muted mb-0">Purchase order performance and trends</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadPurchaseOrderAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Order Status Overview */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{analytics.total_orders.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Total Orders</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-warning">{analytics.pending_orders.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Pending Orders</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{analytics.received_orders.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Received Orders</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-danger">{analytics.cancelled_orders.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Cancelled Orders</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Order Value Metrics */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-6">
                              <div className="card">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{currencyFormatter.format(analytics.total_order_value)}</h4>
                                        <p className="text-muted mb-0">Total Order Value</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-6">
                              <div className="card">
                                   <div className="card-body text-center">
                                        <h4 className="text-secondary">{currencyFormatter.format(analytics.average_order_value)}</h4>
                                        <p className="text-muted mb-0">Average Order Value</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Monthly Trends and Top Suppliers */}
               <div className="row g-3">
                    <div className="col-lg-8">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Orders by Month</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.orders_by_month.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Month</th>
                                                            <th>Order Count</th>
                                                            <th>Total Value</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.orders_by_month.map((month, index) => (
                                                            <tr key={index}>
                                                                 <td>{month.month}</td>
                                                                 <td>{month.count.toLocaleString()}</td>
                                                                 <td>{currencyFormatter.format(month.value)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No monthly data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-4">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Top Suppliers</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.top_suppliers.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {analytics.top_suppliers.slice(0, 5).map((supplier, index) => (
                                                  <div key={supplier.supplier_id} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <div className="fw-bold">{supplier.supplier_name}</div>
                                                            <small className="text-muted">{supplier.order_count} orders</small>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold text-primary">{currencyFormatter.format(supplier.total_value)}</div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No supplier data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}