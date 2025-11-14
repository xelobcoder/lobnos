'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface CostValuationAnalytics {
     current_valuation: {
          total_stock_value_fifo: number;
          total_stock_value_lifo: number;
          total_stock_value_weighted_avg: number;
          slow_moving_value: number;
          expired_stock_value: number;
          near_expiry_value: number;
     };
     cost_trends: Array<{
          month: string;
          additions_cost: number;
          consumption_cost: number;
          write_off_cost: number;
          net_cost_change: number;
     }>;
     profitability_impact: {
          cost_of_goods_issued: number;
          average_cost_per_unit: number;
          cost_variance_analysis: Array<{
               item_id: string;
               item_name: string;
               standard_cost: number;
               actual_cost: number;
               variance_percentage: number;
               variance_type: 'favorable' | 'unfavorable';
          }>;
          procurement_savings: Array<{
               period: string;
               baseline_cost: number;
               actual_cost: number;
               savings_amount: number;
               savings_percentage: number;
          }>;
     };
}

export default function CostValuationAnalyticsPage() {
     const [analytics, setAnalytics] = useState<CostValuationAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadCostValuationAnalytics();
     }, []);

     const loadCostValuationAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/cost-valuation');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load cost valuation analytics');
               }
          } catch (error) {
               console.error('Error loading cost valuation analytics:', error);
               toast.error('Error loading cost valuation analytics');
          } finally {
               setLoading(false);
          }
     };

     const getVarianceColor = (varianceType: string) => {
          return varianceType === 'favorable' ? 'success' : 'danger';
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
                         <h2 className="mb-1">📊 Cost Valuation Analytics</h2>
                         <p className="text-muted mb-0">Inventory valuation using different costing methods</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadCostValuationAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Current Valuation Methods Comparison */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-4">
                              <div className="card h-100 border-primary">
                                   <div className="card-body text-center">
                                        <h4 className="text-primary">{currencyFormatter.format(analytics.current_valuation.total_stock_value_fifo)}</h4>
                                        <p className="text-muted mb-0">FIFO Valuation</p>
                                        <small className="text-primary">First In, First Out</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="card h-100 border-info">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{currencyFormatter.format(analytics.current_valuation.total_stock_value_lifo)}</h4>
                                        <p className="text-muted mb-0">LIFO Valuation</p>
                                        <small className="text-info">Last In, First Out</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="card h-100 border-success">
                                   <div className="card-body text-center">
                                        <h4 className="text-success">{currencyFormatter.format(analytics.current_valuation.total_stock_value_weighted_avg)}</h4>
                                        <p className="text-muted mb-0">Weighted Average</p>
                                        <small className="text-success">Average Cost Method</small>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Special Categories Valuation */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-4">
                              <div className="card h-100 border-warning">
                                   <div className="card-body text-center">
                                        <h4 className="text-warning">{currencyFormatter.format(analytics.current_valuation.slow_moving_value)}</h4>
                                        <p className="text-muted mb-0">Slow Moving Stock</p>
                                        <small className="text-warning">Value at Risk</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="card h-100 border-danger">
                                   <div className="card-body text-center">
                                        <h4 className="text-danger">{currencyFormatter.format(analytics.current_valuation.expired_stock_value)}</h4>
                                        <p className="text-muted mb-0">Expired Stock</p>
                                        <small className="text-danger">Write-off Required</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="card h-100 border-secondary">
                                   <div className="card-body text-center">
                                        <h4 className="text-secondary">{currencyFormatter.format(analytics.current_valuation.near_expiry_value)}</h4>
                                        <p className="text-muted mb-0">Near Expiry Stock</p>
                                        <small className="text-secondary">Monitor Closely</small>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Cost Trends */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📈 Monthly Cost Trends</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.cost_trends.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Month</th>
                                                            <th>Additions Cost</th>
                                                            <th>Consumption Cost</th>
                                                            <th>Write-off Cost</th>
                                                            <th>Net Cost Change</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.cost_trends.map((trend, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{trend.month}</td>
                                                                 <td className="text-success">{currencyFormatter.format(trend.additions_cost)}</td>
                                                                 <td className="text-primary">{currencyFormatter.format(trend.consumption_cost)}</td>
                                                                 <td className="text-danger">{currencyFormatter.format(trend.write_off_cost)}</td>
                                                                 <td className={`fw-bold ${trend.net_cost_change >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                      {trend.net_cost_change >= 0 ? '+' : ''}{currencyFormatter.format(trend.net_cost_change)}
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No cost trend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Profitability Impact */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">💰 Profitability Metrics</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && (
                                        <div className="d-flex flex-column gap-3">
                                             <div className="d-flex justify-content-between align-items-center">
                                                  <span className="fw-bold">Cost of Goods Issued:</span>
                                                  <span className="text-primary fw-bold">{currencyFormatter.format(analytics.profitability_impact.cost_of_goods_issued)}</span>
                                             </div>
                                             <div className="d-flex justify-content-between align-items-center">
                                                  <span className="fw-bold">Average Cost per Unit:</span>
                                                  <span className="text-info fw-bold">{currencyFormatter.format(analytics.profitability_impact.average_cost_per_unit)}</span>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Procurement Savings */}
                         <div className="card mt-3">
                              <div className="card-header">
                                   <h5 className="mb-0">💸 Procurement Savings</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.profitability_impact.procurement_savings.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Period</th>
                                                            <th>Savings Amount</th>
                                                            <th>Savings %</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.profitability_impact.procurement_savings.map((saving, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{saving.period}</td>
                                                                 <td className="text-success fw-bold">{currencyFormatter.format(saving.savings_amount)}</td>
                                                                 <td className="text-success fw-bold">{saving.savings_percentage.toFixed(1)}%</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No procurement savings data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📊 Cost Variance Analysis</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.profitability_impact.cost_variance_analysis.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Standard Cost</th>
                                                            <th>Actual Cost</th>
                                                            <th>Variance</th>
                                                            <th>Type</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.profitability_impact.cost_variance_analysis.slice(0, 10).map((variance, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{variance.item_name}</td>
                                                                 <td className="text-muted">{currencyFormatter.format(variance.standard_cost)}</td>
                                                                 <td className="text-primary">{currencyFormatter.format(variance.actual_cost)}</td>
                                                                 <td className={`fw-bold ${getVarianceColor(variance.variance_type)}-text`}>
                                                                      {variance.variance_percentage >= 0 ? '+' : ''}{variance.variance_percentage.toFixed(2)}%
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getVarianceColor(variance.variance_type)}`}>
                                                                           {variance.variance_type}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No cost variance data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Valuation Method Comparison Insights */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">💡 Valuation Insights</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && (
                                        <div className="row g-3">
                                             <div className="col-md-4">
                                                  <div className="alert alert-info">
                                                       <strong>FIFO vs LIFO Impact:</strong><br />
                                                       Difference of {currencyFormatter.format(Math.abs(analytics.current_valuation.total_stock_value_fifo - analytics.current_valuation.total_stock_value_lifo))}
                                                       <br />
                                                       <small>
                                                            {analytics.current_valuation.total_stock_value_fifo > analytics.current_valuation.total_stock_value_lifo ? 'FIFO' : 'LIFO'} shows higher valuation
                                                       </small>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="alert alert-warning">
                                                       <strong>Risk Exposure:</strong><br />
                                                       {currencyFormatter.format(analytics.current_valuation.slow_moving_value + analytics.current_valuation.expired_stock_value + analytics.current_valuation.near_expiry_value)}
                                                       <br />
                                                       <small>Potential write-offs and slow-moving inventory</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="alert alert-success">
                                                       <strong>Cost Management:</strong><br />
                                                       {analytics.profitability_impact.procurement_savings.length > 0 ?
                                                            `${analytics.profitability_impact.procurement_savings.reduce((sum, s) => sum + s.savings_percentage, 0) / analytics.profitability_impact.procurement_savings.length}% avg savings` :
                                                            'No savings data'
                                                       }
                                                       <br />
                                                       <small>Procurement efficiency impact</small>
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