'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface SupplierAnalytics {
     total_suppliers: number;
     active_suppliers: number;
     supplier_performance: Array<{
          supplier_id: string;
          supplier_name: string;
          total_orders: number;
          total_value: number;
          on_time_delivery_rate: number;
          average_delivery_days: number;
          payment_terms: string;
     }>;
}

export default function SupplierAnalyticsPage() {
     const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadSupplierAnalytics();
     }, []);

     const loadSupplierAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/suppliers');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load supplier analytics');
               }
          } catch (error) {
               console.error('Error loading supplier analytics:', error);
               toast.error('Error loading supplier analytics');
          } finally {
               setLoading(false);
          }
     };

     const getDeliveryRateColor = (rate: number) => {
          if (rate >= 95) return 'success';
          if (rate >= 80) return 'warning';
          return 'danger';
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
                         <h2 className="mb-1">🏢 Supplier Analytics</h2>
                         <p className="text-muted mb-0">Supplier performance metrics</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadSupplierAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Supplier Overview Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-6">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{analytics.total_suppliers.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Total Suppliers</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-6">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{analytics.active_suppliers.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Active Suppliers</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Supplier Performance Table */}
               <div className="row g-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Supplier Performance Metrics</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.supplier_performance.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Total Orders</th>
                                                            <th>Total Value</th>
                                                            <th>On-Time Delivery</th>
                                                            <th>Avg Delivery Days</th>
                                                            <th>Payment Terms</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.supplier_performance.map((supplier) => (
                                                            <tr key={supplier.supplier_id}>
                                                                 <td>
                                                                      <div className="fw-bold">{supplier.supplier_name}</div>
                                                                 </td>
                                                                 <td className="text-center">{supplier.total_orders.toLocaleString()}</td>
                                                                 <td className="text-primary fw-bold">
                                                                      {currencyFormatter.format(supplier.total_value)}
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getDeliveryRateColor(supplier.on_time_delivery_rate)}`}>
                                                                           {supplier.on_time_delivery_rate.toFixed(1)}%
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-center">{supplier.average_delivery_days.toFixed(1)} days</td>
                                                                 <td>
                                                                      <small className="text-muted">{supplier.payment_terms}</small>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No supplier performance data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Performance Insights */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📊 Performance Insights</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.supplier_performance.length > 0 && (
                                        <div className="row g-3">
                                             <div className="col-md-4">
                                                  <div className="alert alert-success">
                                                       <strong>Best Delivery Performance:</strong><br />
                                                       {analytics.supplier_performance.reduce((best, supplier) =>
                                                            supplier.on_time_delivery_rate > best.on_time_delivery_rate ? supplier : best
                                                       ).supplier_name}
                                                       <br />
                                                       <small>
                                                            {analytics.supplier_performance.reduce((best, supplier) =>
                                                                 supplier.on_time_delivery_rate > best.on_time_delivery_rate ? supplier : best
                                                            ).on_time_delivery_rate.toFixed(1)}% on-time
                                                       </small>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="alert alert-info">
                                                       <strong>Highest Order Volume:</strong><br />
                                                       {analytics.supplier_performance.reduce((max, supplier) =>
                                                            supplier.total_orders > max.total_orders ? supplier : max
                                                       ).supplier_name}
                                                       <br />
                                                       <small>
                                                            {analytics.supplier_performance.reduce((max, supplier) =>
                                                                 supplier.total_orders > max.total_orders ? supplier : max
                                                            ).total_orders} orders
                                                       </small>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="alert alert-primary">
                                                       <strong>Highest Value Supplier:</strong><br />
                                                       {analytics.supplier_performance.reduce((max, supplier) =>
                                                            supplier.total_value > max.total_value ? supplier : max
                                                       ).supplier_name}
                                                       <br />
                                                       <small>
                                                            {currencyFormatter.format(analytics.supplier_performance.reduce((max, supplier) =>
                                                                 supplier.total_value > max.total_value ? supplier : max
                                                            ).total_value)}
                                                       </small>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}