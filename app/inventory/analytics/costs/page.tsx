'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface CostAnalytics {
     total_inventory_value: number;
     average_item_cost: number;
     cost_by_category: Array<{
          category_id: string;
          category_name: string;
          total_value: number;
          item_count: number;
     }>;
     monthly_cost_trends: Array<{
          month: string;
          additions_cost: number;
          consumption_cost: number;
     }>;
}

export default function CostAnalyticsPage() {
     const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadCostAnalytics();
     }, []);

     const loadCostAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/costs');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load cost analytics');
               }
          } catch (error) {
               console.error('Error loading cost analytics:', error);
               toast.error('Error loading cost analytics');
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
                         <h2 className="mb-1">💵 Cost Analytics</h2>
                         <p className="text-muted mb-0">Inventory cost analysis by category and trends</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadCostAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Cost Overview Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-6">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{currencyFormatter.format(analytics.total_inventory_value)}</h3>
                                        <p className="text-muted mb-0">Total Inventory Value</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-6">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-info">{currencyFormatter.format(analytics.average_item_cost)}</h3>
                                        <p className="text-muted mb-0">Average Item Cost</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Cost by Category and Monthly Trends */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Cost by Category</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.cost_by_category.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Category</th>
                                                            <th>Items</th>
                                                            <th>Total Value</th>
                                                            <th>Avg per Item</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.cost_by_category.map((category) => (
                                                            <tr key={category.category_id}>
                                                                 <td className="fw-bold">{category.category_name}</td>
                                                                 <td>{category.item_count.toLocaleString()}</td>
                                                                 <td className="text-primary">{currencyFormatter.format(category.total_value)}</td>
                                                                 <td className="text-info">
                                                                      {currencyFormatter.format(category.total_value / category.item_count)}
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No category cost data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Monthly Cost Trends</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.monthly_cost_trends.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Month</th>
                                                            <th>Additions Cost</th>
                                                            <th>Consumption Cost</th>
                                                            <th>Net Cost</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.monthly_cost_trends.map((trend, index) => (
                                                            <tr key={index}>
                                                                 <td>{trend.month}</td>
                                                                 <td className="text-success">{currencyFormatter.format(trend.additions_cost)}</td>
                                                                 <td className="text-danger">{currencyFormatter.format(trend.consumption_cost)}</td>
                                                                 <td className={`fw-bold ${trend.additions_cost - trend.consumption_cost >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                      {currencyFormatter.format(trend.additions_cost - trend.consumption_cost)}
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No monthly cost trend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Cost Analysis Insights */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">💡 Cost Analysis Insights</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.cost_by_category.length > 0 && (
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <div className="alert alert-info">
                                                       <strong>Highest Value Category:</strong> {
                                                            analytics.cost_by_category.reduce((max, category) =>
                                                                 category.total_value > max.total_value ? category : max
                                                            ).category_name
                                                       }
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="alert alert-warning">
                                                       <strong>Most Items Category:</strong> {
                                                            analytics.cost_by_category.reduce((max, category) =>
                                                                 category.item_count > max.item_count ? category : max
                                                            ).category_name
                                                       }
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