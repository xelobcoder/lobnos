'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface ProcurementAnalytics {
     supplier_performance: Array<{
          supplier_id: string;
          supplier_name: string;
          lead_time_days: number;
          on_time_delivery_rate: number;
          delivery_discrepancy_rate: number;
          defect_rate: number;
          reliability_score: number;
          total_orders: number;
          total_order_value: number;
     }>;
     pricing_analytics: {
          price_history: Array<{
               item_id: string;
               item_name: string;
               supplier_id: string;
               supplier_name: string;
               purchase_date: string;
               unit_price: number;
               trend: 'increasing' | 'decreasing' | 'stable';
          }>;
          average_cost_per_supplier: Array<{
               supplier_id: string;
               supplier_name: string;
               average_unit_cost: number;
               last_purchase_price: number;
               standard_cost_variance: number;
          }>;
          best_suppliers: Array<{
               supplier_id: string;
               supplier_name: string;
               cost_score: number;
               quality_score: number;
               overall_score: number;
               ranking: number;
          }>;
     };
     procurement_efficiency: {
          average_po_processing_time_days: number;
          average_payment_cycle_days: number;
          emergency_purchases_count: number;
          emergency_purchase_percentage: number;
          order_accuracy_rate: number;
          supplier_response_time_avg: number;
     };
}

export default function ProcurementAnalyticsPage() {
     const [analytics, setAnalytics] = useState<ProcurementAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadProcurementAnalytics();
     }, []);

     const loadProcurementAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/procurement');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load procurement analytics');
               }
          } catch (error) {
               console.error('Error loading procurement analytics:', error);
               toast.error('Error loading procurement analytics');
          } finally {
               setLoading(false);
          }
     };

     const getDeliveryRateColor = (rate: number) => {
          if (rate >= 95) return 'success';
          if (rate >= 80) return 'warning';
          return 'danger';
     };

     const getTrendColor = (trend: string) => {
          switch (trend) {
               case 'decreasing': return 'success';
               case 'increasing': return 'danger';
               case 'stable': return 'info';
               default: return 'secondary';
          }
     };

     const getScoreColor = (score: number) => {
          if (score >= 80) return 'success';
          if (score >= 60) return 'warning';
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
                         <h2 className="mb-1">🛒 Procurement Analytics</h2>
                         <p className="text-muted mb-0">Comprehensive procurement performance analysis</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadProcurementAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Procurement Efficiency Metrics */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-primary">{analytics.procurement_efficiency.average_po_processing_time_days.toFixed(1)}</h4>
                                        <p className="text-muted mb-0">Avg PO Processing (Days)</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{analytics.procurement_efficiency.average_payment_cycle_days.toFixed(1)}</h4>
                                        <p className="text-muted mb-0">Avg Payment Cycle (Days)</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-warning">{analytics.procurement_efficiency.emergency_purchases_count.toLocaleString()}</h4>
                                        <p className="text-muted mb-1">Emergency Purchases</p>
                                        <small className="text-warning">
                                             {analytics.procurement_efficiency.emergency_purchase_percentage.toFixed(1)}%
                                        </small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-success">{analytics.procurement_efficiency.order_accuracy_rate.toFixed(1)}%</h4>
                                        <p className="text-muted mb-0">Order Accuracy Rate</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Supplier Performance */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🏢 Supplier Performance Metrics</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.supplier_performance.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Orders</th>
                                                            <th>Total Value</th>
                                                            <th>Lead Time</th>
                                                            <th>On-Time Delivery</th>
                                                            <th>Defect Rate</th>
                                                            <th>Reliability Score</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.supplier_performance.map((supplier, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{supplier.supplier_name}</td>
                                                                 <td className="text-center">{supplier.total_orders.toLocaleString()}</td>
                                                                 <td className="text-primary fw-bold">
                                                                      {currencyFormatter.format(supplier.total_order_value)}
                                                                 </td>
                                                                 <td className="text-info">{supplier.lead_time_days.toFixed(1)} days</td>
                                                                 <td>
                                                                      <span className={`badge bg-${getDeliveryRateColor(supplier.on_time_delivery_rate)}`}>
                                                                           {supplier.on_time_delivery_rate.toFixed(1)}%
                                                                      </span>
                                                                 </td>
                                                                 <td className={`fw-bold ${supplier.defect_rate > 5 ? 'text-danger' : supplier.defect_rate > 2 ? 'text-warning' : 'text-success'}`}>
                                                                      {supplier.defect_rate.toFixed(2)}%
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getScoreColor(supplier.reliability_score)}`}>
                                                                           {supplier.reliability_score.toFixed(1)}
                                                                      </span>
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

               {/* Best Suppliers and Pricing Analytics */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🏆 Best Suppliers</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.pricing_analytics.best_suppliers.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {analytics.pricing_analytics.best_suppliers.slice(0, 10).map((supplier, index) => (
                                                  <div key={supplier.supplier_id} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <div className="fw-bold">#{supplier.ranking} {supplier.supplier_name}</div>
                                                            <small className="text-muted">
                                                                 Cost: {supplier.cost_score.toFixed(1)} | Quality: {supplier.quality_score.toFixed(1)}
                                                            </small>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold text-success">{supplier.overall_score.toFixed(1)}</div>
                                                            <small className="text-muted">overall score</small>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No supplier ranking data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">💰 Average Cost per Supplier</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.pricing_analytics.average_cost_per_supplier.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Avg Unit Cost</th>
                                                            <th>Last Purchase</th>
                                                            <th>Variance</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.pricing_analytics.average_cost_per_supplier.slice(0, 10).map((supplier, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{supplier.supplier_name}</td>
                                                                 <td className="text-primary">{currencyFormatter.format(supplier.average_unit_cost)}</td>
                                                                 <td className="text-info">{currencyFormatter.format(supplier.last_purchase_price)}</td>
                                                                 <td className={`fw-bold ${supplier.standard_cost_variance >= 0 ? 'text-danger' : 'text-success'}`}>
                                                                      {supplier.standard_cost_variance >= 0 ? '+' : ''}{supplier.standard_cost_variance.toFixed(2)}%
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No cost analytics data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Price History Trends */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📈 Price History Trends</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.pricing_analytics.price_history.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Supplier</th>
                                                            <th>Purchase Date</th>
                                                            <th>Unit Price</th>
                                                            <th>Trend</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.pricing_analytics.price_history.slice(0, 20).map((price, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{price.item_name}</td>
                                                                 <td>{price.supplier_name}</td>
                                                                 <td>{new Date(price.purchase_date).toLocaleDateString()}</td>
                                                                 <td className="text-primary fw-bold">{currencyFormatter.format(price.unit_price)}</td>
                                                                 <td>
                                                                      <span className={`badge bg-${getTrendColor(price.trend)}`}>
                                                                           {price.trend}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No price history data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}