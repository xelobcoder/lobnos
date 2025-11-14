'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface InventoryMovementAnalytics {
     movement_by_type: {
          total_received: number;
          total_issued: number;
          total_returned: number;
          internal_transfers_in: number;
          internal_transfers_out: number;
          write_offs: number;
          expired_quantity: number;
          wastage_quantity: number;
     };
     velocity_metrics: {
          item_turnover_rate: Array<{
               item_id: string;
               item_name: string;
               turnover_ratio: number;
               turnover_category: 'fast' | 'medium' | 'slow';
          }>;
          average_inventory_age: Array<{
               item_id: string;
               item_name: string;
               average_days_in_stock: number;
               last_movement_date: string;
          }>;
          fast_moving_items: Array<{
               item_id: string;
               item_name: string;
               monthly_movement: number;
               ranking: number;
          }>;
          slow_moving_items: Array<{
               item_id: string;
               item_name: string;
               days_since_last_movement: number;
               total_stock_value: number;
          }>;
     };
     movement_trends: Array<{
          month: string;
          received: number;
          issued: number;
          transfers: number;
          adjustments: number;
          net_movement: number;
     }>;
}

export default function InventoryMovementAnalyticsPage() {
     const [analytics, setAnalytics] = useState<InventoryMovementAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadInventoryMovementAnalytics();
     }, []);

     const loadInventoryMovementAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/movement');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load inventory movement analytics');
               }
          } catch (error) {
               console.error('Error loading inventory movement analytics:', error);
               toast.error('Error loading inventory movement analytics');
          } finally {
               setLoading(false);
          }
     };

     const getTurnoverCategoryColor = (category: string) => {
          switch (category) {
               case 'fast': return 'success';
               case 'medium': return 'warning';
               case 'slow': return 'danger';
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
                         <h2 className="mb-1">🚚 Inventory Movement Analytics</h2>
                         <p className="text-muted mb-0">Track inventory movement patterns and velocity</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadInventoryMovementAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Movement by Type Overview */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100 border-success">
                                   <div className="card-body text-center">
                                        <h4 className="text-success">{analytics.movement_by_type.total_received.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Total Received</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-primary">
                                   <div className="card-body text-center">
                                        <h4 className="text-primary">{analytics.movement_by_type.total_issued.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Total Issued</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-info">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{analytics.movement_by_type.internal_transfers_in.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Internal Transfers</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-warning">
                                   <div className="card-body text-center">
                                        <h4 className="text-warning">{analytics.movement_by_type.write_offs.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Write-offs</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Movement Trends */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📈 Movement Trends by Month</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.movement_trends.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Month</th>
                                                            <th>Received</th>
                                                            <th>Issued</th>
                                                            <th>Transfers</th>
                                                            <th>Adjustments</th>
                                                            <th>Net Movement</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.movement_trends.map((trend, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{trend.month}</td>
                                                                 <td className="text-success">{trend.received.toLocaleString()}</td>
                                                                 <td className="text-primary">{trend.issued.toLocaleString()}</td>
                                                                 <td className="text-info">{trend.transfers.toLocaleString()}</td>
                                                                 <td className="text-warning">{trend.adjustments.toLocaleString()}</td>
                                                                 <td className={`fw-bold ${trend.net_movement >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                      {trend.net_movement >= 0 ? '+' : ''}{trend.net_movement.toLocaleString()}
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No movement trend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Velocity Metrics */}
               <div className="row g-3">
                    {/* Item Turnover Rate */}
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🔄 Item Turnover Rate</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.velocity_metrics.item_turnover_rate.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Turnover Ratio</th>
                                                            <th>Category</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.velocity_metrics.item_turnover_rate.slice(0, 10).map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{item.item_name}</td>
                                                                 <td className="text-center fw-bold">{item.turnover_ratio.toFixed(2)}</td>
                                                                 <td>
                                                                      <span className={`badge bg-${getTurnoverCategoryColor(item.turnover_category)}`}>
                                                                           {item.turnover_category}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No turnover rate data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Fast Moving Items */}
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">⚡ Fast Moving Items</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.velocity_metrics.fast_moving_items.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {analytics.velocity_metrics.fast_moving_items.slice(0, 10).map((item, index) => (
                                                  <div key={item.item_id} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <div className="fw-bold">#{item.ranking} {item.item_name}</div>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold text-success">{item.monthly_movement.toLocaleString()}</div>
                                                            <small className="text-muted">monthly movement</small>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No fast moving items data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Slow Moving Items and Inventory Age */}
               <div className="row g-3 mt-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🐌 Slow Moving Items</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.velocity_metrics.slow_moving_items.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Days Since Movement</th>
                                                            <th>Stock Value</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.velocity_metrics.slow_moving_items.slice(0, 10).map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{item.item_name}</td>
                                                                 <td className={`fw-bold ${item.days_since_last_movement > 90 ? 'text-danger' : item.days_since_last_movement > 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {item.days_since_last_movement} days
                                                                 </td>
                                                                 <td className="text-primary">{currencyFormatter.format(item.total_stock_value)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No slow moving items data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📅 Average Inventory Age</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.velocity_metrics.average_inventory_age.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Avg Days in Stock</th>
                                                            <th>Last Movement</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.velocity_metrics.average_inventory_age.slice(0, 10).map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{item.item_name}</td>
                                                                 <td className={`fw-bold ${item.average_days_in_stock > 90 ? 'text-danger' : item.average_days_in_stock > 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {item.average_days_in_stock.toFixed(1)} days
                                                                 </td>
                                                                 <td>
                                                                      <small>{new Date(item.last_movement_date).toLocaleDateString()}</small>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No inventory age data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}