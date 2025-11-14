'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface UsageAnalytics {
     consumption_patterns: {
          department_usage: Array<{
               department_id: string;
               department_name: string;
               total_consumed: number;
               percentage_of_total: number;
               top_items: Array<{
                    item_id: string;
                    item_name: string;
                    quantity_consumed: number;
               }>;
          }>;
          consumption_trends: Array<{
               date: string;
               total_consumed: number;
               unique_items_used: number;
               consumption_value: number;
          }>;
          predictive_usage: Array<{
               item_id: string;
               item_name: string;
               predicted_monthly_usage: number;
               confidence_level: number;
               based_on_history_months: number;
          }>;
     };
     anomalies_red_flags: {
          unusual_usage_spikes: Array<{
               item_id: string;
               item_name: string;
               date: string;
               actual_usage: number;
               expected_usage: number;
               deviation_percentage: number;
               potential_cause: string;
          }>;
          potential_theft_indicators: Array<{
               item_id: string;
               item_name: string;
               unusual_pattern: string;
               risk_level: 'low' | 'medium' | 'high';
               last_incident_date: string;
          }>;
          misallocation_trends: Array<{
               item_id: string;
               item_name: string;
               allocated_quantity: number;
               actual_usage: number;
               variance_percentage: number;
               department: string;
          }>;
     };
     usage_efficiency: {
          stock_utilization_rate: number;
          average_usage_per_department: number;
          wastage_rate: number;
          optimal_ordering_patterns: Array<{
               item_id: string;
               item_name: string;
               recommended_order_quantity: number;
               recommended_order_frequency_days: number;
               reasoning: string;
          }>;
     };
}

export default function UsageAnalyticsPage() {
     const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadUsageAnalytics();
     }, []);

     const loadUsageAnalytics = async () => {
          try {
               const response = await customFetch('inventory/analytics/usage');
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load usage analytics');
               }
          } catch (error) {
               console.error('Error loading usage analytics:', error);
               toast.error('Error loading usage analytics');
          } finally {
               setLoading(false);
          }
     };

     const getRiskLevelColor = (level: string) => {
          switch (level) {
               case 'high': return 'danger';
               case 'medium': return 'warning';
               case 'low': return 'info';
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
                         <h2 className="mb-1">📊 Usage Analytics</h2>
                         <p className="text-muted mb-0">Department-wise usage patterns and anomaly detection</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadUsageAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Usage Efficiency Metrics */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-primary">{analytics.usage_efficiency.stock_utilization_rate.toFixed(1)}%</h4>
                                        <p className="text-muted mb-0">Stock Utilization Rate</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{analytics.usage_efficiency.average_usage_per_department.toFixed(1)}</h4>
                                        <p className="text-muted mb-0">Avg Usage per Dept</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-warning">{analytics.usage_efficiency.wastage_rate.toFixed(1)}%</h4>
                                        <p className="text-muted mb-0">Wastage Rate</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h4 className="text-success">{analytics.consumption_patterns.predictive_usage.length.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Predictive Models</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Department Usage Patterns */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🏥 Department Usage Patterns</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.consumption_patterns.department_usage.length > 0 ? (
                                        <div className="row g-3">
                                             {analytics.consumption_patterns.department_usage.map((dept, index) => (
                                                  <div key={index} className="col-lg-6">
                                                       <div className="card h-100">
                                                            <div className="card-body">
                                                                 <div className="d-flex justify-content-between align-items-center mb-3">
                                                                      <h6 className="mb-0 fw-bold">{dept.department_name}</h6>
                                                                      <span className="badge bg-primary">{dept.percentage_of_total.toFixed(1)}%</span>
                                                                 </div>
                                                                 <p className="text-muted mb-2">Total Consumed: {dept.total_consumed.toLocaleString()}</p>
                                                                 <div>
                                                                      <small className="text-muted">Top Items:</small>
                                                                      <div className="mt-1">
                                                                           {dept.top_items.slice(0, 3).map((item, idx) => (
                                                                                <div key={idx} className="d-flex justify-content-between small">
                                                                                     <span>{item.item_name}</span>
                                                                                     <span className="text-primary">{item.quantity_consumed.toLocaleString()}</span>
                                                                                </div>
                                                                           ))}
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No department usage data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Consumption Trends and Predictive Usage */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📈 Consumption Trends</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.consumption_patterns.consumption_trends.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Date</th>
                                                            <th>Total Consumed</th>
                                                            <th>Unique Items</th>
                                                            <th>Value</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.consumption_patterns.consumption_trends.slice(0, 10).map((trend, index) => (
                                                            <tr key={index}>
                                                                 <td>{new Date(trend.date).toLocaleDateString()}</td>
                                                                 <td className="text-primary fw-bold">{trend.total_consumed.toLocaleString()}</td>
                                                                 <td className="text-info">{trend.unique_items_used.toLocaleString()}</td>
                                                                 <td className="text-success">{currencyFormatter.format(trend.consumption_value)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No consumption trend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🔮 Predictive Usage</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.consumption_patterns.predictive_usage.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Predicted Monthly</th>
                                                            <th>Confidence</th>
                                                            <th>History (Months)</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.consumption_patterns.predictive_usage.slice(0, 10).map((prediction, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{prediction.item_name}</td>
                                                                 <td className="text-primary fw-bold">{prediction.predicted_monthly_usage.toFixed(1)}</td>
                                                                 <td>
                                                                      <div className="progress" style={{ height: '20px' }}>
                                                                           <div
                                                                                className={`progress-bar ${prediction.confidence_level > 80 ? 'bg-success' : prediction.confidence_level > 60 ? 'bg-warning' : 'bg-danger'}`}
                                                                                style={{ width: `${prediction.confidence_level}%` }}
                                                                           >
                                                                                {prediction.confidence_level.toFixed(0)}%
                                                                           </div>
                                                                      </div>
                                                                 </td>
                                                                 <td className="text-center">{prediction.based_on_history_months}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No predictive usage data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Anomalies and Red Flags */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🚨 Anomalies & Red Flags</h5>
                              </div>
                              <div className="card-body">
                                   {/* Unusual Usage Spikes */}
                                   {analytics && analytics.anomalies_red_flags.unusual_usage_spikes.length > 0 && (
                                        <div className="mb-4">
                                             <h6 className="text-danger mb-3">⚡ Unusual Usage Spikes</h6>
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Date</th>
                                                                 <th>Actual vs Expected</th>
                                                                 <th>Deviation</th>
                                                                 <th>Potential Cause</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.anomalies_red_flags.unusual_usage_spikes.map((spike, index) => (
                                                                 <tr key={index}>
                                                                      <td className="fw-bold">{spike.item_name}</td>
                                                                      <td>{new Date(spike.date).toLocaleDateString()}</td>
                                                                      <td>
                                                                           <small>
                                                                                {spike.actual_usage.toLocaleString()} vs {spike.expected_usage.toLocaleString()}
                                                                           </small>
                                                                      </td>
                                                                      <td className="text-danger fw-bold">+{spike.deviation_percentage.toFixed(1)}%</td>
                                                                      <td className="text-warning">{spike.potential_cause}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                   )}

                                   {/* Potential Theft Indicators */}
                                   {analytics && analytics.anomalies_red_flags.potential_theft_indicators.length > 0 && (
                                        <div className="mb-4">
                                             <h6 className="text-dark mb-3">🕵️ Potential Theft Indicators</h6>
                                             <div className="row g-3">
                                                  {analytics.anomalies_red_flags.potential_theft_indicators.map((indicator, index) => (
                                                       <div key={index} className="col-md-6">
                                                            <div className={`alert alert-${getRiskLevelColor(indicator.risk_level)}`}>
                                                                 <strong>{indicator.item_name}</strong><br />
                                                                 <small>{indicator.unusual_pattern}</small><br />
                                                                 <small className="text-muted">
                                                                      Risk: {indicator.risk_level.toUpperCase()} |
                                                                      Last: {new Date(indicator.last_incident_date).toLocaleDateString()}
                                                                 </small>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        </div>
                                   )}

                                   {/* Misallocation Trends */}
                                   {analytics && analytics.anomalies_red_flags.misallocation_trends.length > 0 && (
                                        <div className="mb-4">
                                             <h6 className="text-info mb-3">📊 Misallocation Trends</h6>
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Department</th>
                                                                 <th>Allocated vs Used</th>
                                                                 <th>Variance</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.anomalies_red_flags.misallocation_trends.map((trend, index) => (
                                                                 <tr key={index}>
                                                                      <td className="fw-bold">{trend.item_name}</td>
                                                                      <td>{trend.department}</td>
                                                                      <td>
                                                                           <small>
                                                                                {trend.allocated_quantity.toLocaleString()} vs {trend.actual_usage.toLocaleString()}
                                                                           </small>
                                                                      </td>
                                                                      <td className={`fw-bold ${trend.variance_percentage > 20 ? 'text-danger' : trend.variance_percentage > 10 ? 'text-warning' : 'text-success'}`}>
                                                                           {trend.variance_percentage >= 0 ? '+' : ''}{trend.variance_percentage.toFixed(1)}%
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                   )}

                                   {/* No Anomalies Message */}
                                   {analytics &&
                                        analytics.anomalies_red_flags.unusual_usage_spikes.length === 0 &&
                                        analytics.anomalies_red_flags.potential_theft_indicators.length === 0 &&
                                        analytics.anomalies_red_flags.misallocation_trends.length === 0 && (
                                             <div className="alert alert-success">
                                                  <strong>✅ No Anomalies Detected!</strong> All usage patterns appear normal.
                                             </div>
                                        )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Optimal Ordering Patterns */}
               <div className="row g-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📋 Optimal Ordering Patterns</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.usage_efficiency.optimal_ordering_patterns.length > 0 ? (
                                        <div className="row g-3">
                                             {analytics.usage_efficiency.optimal_ordering_patterns.map((pattern, index) => (
                                                  <div key={index} className="col-md-6">
                                                       <div className="card h-100">
                                                            <div className="card-body">
                                                                 <h6 className="card-title">{pattern.item_name}</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <small className="text-muted">Order Quantity:</small>
                                                                           <div className="fw-bold text-primary">{pattern.recommended_order_quantity.toLocaleString()}</div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <small className="text-muted">Frequency:</small>
                                                                           <div className="fw-bold text-info">{pattern.recommended_order_frequency_days} days</div>
                                                                      </div>
                                                                 </div>
                                                                 <hr />
                                                                 <small className="text-muted">{pattern.reasoning}</small>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No optimal ordering patterns available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}