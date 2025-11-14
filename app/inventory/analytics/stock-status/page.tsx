'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface StockStatusAnalytics {
     in_stock: number;
     low_stock: number;
     out_of_stock: number;
     expired: number;
     stock_value_by_status: {
          in_stock: number;
          low_stock: number;
          out_of_stock: number;
          expired: number;
     };
}

export default function StockStatusAnalyticsPage() {
     const [analytics, setAnalytics] = useState<StockStatusAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadStockStatusAnalytics();
     }, []);

     const loadStockStatusAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/stock-status');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load stock status analytics');
               }
          } catch (error) {
               console.error('Error loading stock status analytics:', error);
               toast.error('Error loading stock status analytics');
          } finally {
               setLoading(false);
          }
     };

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'in_stock': return 'success';
               case 'low_stock': return 'warning';
               case 'out_of_stock': return 'danger';
               case 'expired': return 'secondary';
               default: return 'primary';
          }
     };

     const getStatusLabel = (status: string) => {
          switch (status) {
               case 'in_stock': return 'In Stock';
               case 'low_stock': return 'Low Stock';
               case 'out_of_stock': return 'Out of Stock';
               case 'expired': return 'Expired';
               default: return status;
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
                         <h2 className="mb-1">📊 Stock Status Analytics</h2>
                         <p className="text-muted mb-0">Current stock distribution by status</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadStockStatusAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Status Overview Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100 border-success">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{analytics.in_stock.toLocaleString()}</h3>
                                        <p className="text-muted mb-1">In Stock</p>
                                        <small className="text-success">
                                             {currencyFormatter.format(analytics.stock_value_by_status.in_stock)}
                                        </small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-warning">
                                   <div className="card-body text-center">
                                        <h3 className="text-warning">{analytics.low_stock.toLocaleString()}</h3>
                                        <p className="text-muted mb-1">Low Stock</p>
                                        <small className="text-warning">
                                             {currencyFormatter.format(analytics.stock_value_by_status.low_stock)}
                                        </small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-danger">
                                   <div className="card-body text-center">
                                        <h3 className="text-danger">{analytics.out_of_stock.toLocaleString()}</h3>
                                        <p className="text-muted mb-1">Out of Stock</p>
                                        <small className="text-danger">
                                             {currencyFormatter.format(analytics.stock_value_by_status.out_of_stock)}
                                        </small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-secondary">
                                   <div className="card-body text-center">
                                        <h3 className="text-secondary">{analytics.expired.toLocaleString()}</h3>
                                        <p className="text-muted mb-1">Expired</p>
                                        <small className="text-secondary">
                                             {currencyFormatter.format(analytics.stock_value_by_status.expired)}
                                        </small>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Stock Distribution Chart Placeholder */}
               <div className="row g-3">
                    <div className="col-lg-8">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Stock Distribution</h5>
                              </div>
                              <div className="card-body">
                                   <div className="text-center py-5">
                                        <div style={{ fontSize: '4rem', opacity: 0.3 }}>📊</div>
                                        <p className="text-muted mt-3">Chart visualization would be implemented here</p>
                                        <small className="text-muted">Using Chart.js or similar library</small>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-4">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Status Breakdown</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && (
                                        <div className="d-flex flex-column gap-3">
                                             {Object.entries(analytics.stock_value_by_status).map(([status, value]) => (
                                                  <div key={status} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <span className={`badge bg-${getStatusColor(status)} me-2`}>
                                                                 {getStatusLabel(status)}
                                                            </span>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold">{currencyFormatter.format(value)}</div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Alerts Section */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">⚠️ Stock Alerts</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.low_stock > 0 && (
                                        <div className="alert alert-warning">
                                             <strong>Low Stock Alert:</strong> {analytics.low_stock} items are running low on stock
                                        </div>
                                   )}
                                   {analytics && analytics.out_of_stock > 0 && (
                                        <div className="alert alert-danger">
                                             <strong>Out of Stock Alert:</strong> {analytics.out_of_stock} items are completely out of stock
                                        </div>
                                   )}
                                   {analytics && analytics.expired > 0 && (
                                        <div className="alert alert-secondary">
                                             <strong>Expired Stock:</strong> {analytics.expired} items have expired stock
                                        </div>
                                   )}
                                   {analytics && analytics.low_stock === 0 && analytics.out_of_stock === 0 && analytics.expired === 0 && (
                                        <div className="alert alert-success">
                                             <strong>Great!</strong> All items are in good stock condition
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}