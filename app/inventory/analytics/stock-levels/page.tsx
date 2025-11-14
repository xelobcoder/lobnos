'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface StockLevelAnalytics {
     current_stock_on_hand: number;
     stock_available_for_use: number;
     stock_on_order: number;
     allocated_stock: number;
     stock_threshold_alerts: Array<{
          item_id: string;
          item_name: string;
          current_stock: number;
          min_stock: number;
          max_stock: number;
          status: string;
          alert_type: 'low_stock' | 'over_stock' | 'out_of_stock';
     }>;
     days_of_inventory_remaining: Array<{
          item_id: string;
          item_name: string;
          current_stock: number;
          daily_consumption_rate: number;
          days_remaining: number;
          status: 'critical' | 'warning' | 'normal';
     }>;
     predictive_analytics: {
          stock_out_predictions: Array<{
               item_id: string;
               item_name: string;
               predicted_stock_out_date: string;
               days_until_stock_out: number;
          }>;
          overstock_predictions: Array<{
               item_id: string;
               item_name: string;
               excess_quantity: number;
               carrying_cost_impact: number;
          }>;
          safety_stock_recommendations: Array<{
               item_id: string;
               item_name: string;
               current_safety_stock: number;
               recommended_safety_stock: number;
               reasoning: string;
          }>;
     };
}

export default function StockLevelAnalyticsPage() {
     const [analytics, setAnalytics] = useState<StockLevelAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadStockLevelAnalytics();
     }, []);

     const loadStockLevelAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/stock-levels');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load stock level analytics');
               }
          } catch (error) {
               console.error('Error loading stock level analytics:', error);
               toast.error('Error loading stock level analytics');
          } finally {
               setLoading(false);
          }
     };

     const getAlertTypeColor = (alertType: string) => {
          switch (alertType) {
               case 'low_stock': return 'warning';
               case 'over_stock': return 'info';
               case 'out_of_stock': return 'danger';
               default: return 'secondary';
          }
     };

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'critical': return 'danger';
               case 'warning': return 'warning';
               case 'normal': return 'success';
               default: return 'secondary';
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
                         <h2 className="mb-1">📈 Stock Level Analytics</h2>
                         <p className="text-muted mb-0">Detailed stock monitoring with alerts and predictions</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadStockLevelAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Stock Overview Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{analytics.current_stock_on_hand.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Current Stock on Hand</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{analytics.stock_available_for_use.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Available for Use</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-info">{analytics.stock_on_order.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">On Order</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-warning">{analytics.allocated_stock.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Allocated Stock</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Stock Alerts */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🚨 Stock Threshold Alerts</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.stock_threshold_alerts.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Current Stock</th>
                                                            <th>Min/Max Levels</th>
                                                            <th>Status</th>
                                                            <th>Alert Type</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.stock_threshold_alerts.map((alert, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{alert.item_name}</td>
                                                                 <td className="text-center">{alert.current_stock.toLocaleString()}</td>
                                                                 <td>
                                                                      <small>
                                                                           Min: {alert.min_stock} | Max: {alert.max_stock}
                                                                      </small>
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getStatusColor(alert.status)}`}>
                                                                           {alert.status}
                                                                      </span>
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getAlertTypeColor(alert.alert_type)}`}>
                                                                           {alert.alert_type.replace('_', ' ')}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="alert alert-success">
                                             <strong>✅ All Clear!</strong> No stock threshold alerts at this time.
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Days of Inventory Remaining */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📅 Days of Inventory Remaining</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.days_of_inventory_remaining.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Current Stock</th>
                                                            <th>Daily Usage</th>
                                                            <th>Days Remaining</th>
                                                            <th>Status</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.days_of_inventory_remaining.slice(0, 10).map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{item.item_name}</td>
                                                                 <td>{item.current_stock.toLocaleString()}</td>
                                                                 <td>{item.daily_consumption_rate.toFixed(2)}</td>
                                                                 <td className={`fw-bold ${item.days_remaining < 7 ? 'text-danger' : item.days_remaining < 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {item.days_remaining.toFixed(1)}
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getStatusColor(item.status)}`}>
                                                                           {item.status}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No inventory days data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics */}
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🔮 Predictive Analytics</h5>
                              </div>
                              <div className="card-body">
                                   {/* Stock Out Predictions */}
                                   <h6 className="text-danger mb-3">⚠️ Stock Out Predictions</h6>
                                   {analytics && analytics.predictive_analytics.stock_out_predictions.length > 0 ? (
                                        <div className="mb-4">
                                             {analytics.predictive_analytics.stock_out_predictions.slice(0, 5).map((prediction, index) => (
                                                  <div key={index} className="alert alert-danger py-2 mb-2">
                                                       <strong>{prediction.item_name}</strong><br />
                                                       <small>
                                                            Predicted stock out: {new Date(prediction.predicted_stock_out_date).toLocaleDateString()}
                                                            ({prediction.days_until_stock_out} days)
                                                       </small>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="alert alert-success py-2 mb-4">
                                             <small>No stock out predictions</small>
                                        </div>
                                   )}

                                   {/* Safety Stock Recommendations */}
                                   <h6 className="text-info mb-3">📊 Safety Stock Recommendations</h6>
                                   {analytics && analytics.predictive_analytics.safety_stock_recommendations.length > 0 ? (
                                        <div>
                                             {analytics.predictive_analytics.safety_stock_recommendations.slice(0, 5).map((rec, index) => (
                                                  <div key={index} className="alert alert-info py-2 mb-2">
                                                       <strong>{rec.item_name}</strong><br />
                                                       <small>
                                                            Current: {rec.current_safety_stock} |
                                                            Recommended: {rec.recommended_safety_stock}<br />
                                                            <em>{rec.reasoning}</em>
                                                       </small>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="alert alert-secondary py-2">
                                             <small>No safety stock recommendations</small>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}