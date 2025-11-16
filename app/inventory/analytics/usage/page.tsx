'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface UsageAnalytics {
     consumption_patterns: {
          consumption_trends: Array<{
               date: string;
               total_consumed: number;
               unique_items_used: number;
               unit_price: number;
          }>;
          hourly_usage_patterns: Array<{
               hour: number;
               item_name: string;
               transaction_count: number;
               total_units_used: number;
               avg_units_per_transaction: number;
          }>;
          department_consumption: Array<{
               performed_by: string;
               username: string;
               role: string;
               total_consumed: number;
               unique_items_used: number;
               consumption_value: number;
               transaction_count: number;
          }>;
          category_consumption: Array<{
               category_name: string;
               total_consumed: number;
               unique_items_used: number;
               consumption_value: number;
               transaction_count: number;
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
               actual_usage: number | null;
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
               performed_by: string;
               username: string;
               role: string;
          }>;
          fifo_compliance_issues: Array<any>;
          critical_alerts: Array<{
               alert_type: string;
               item_id: string;
               item_name: string;
               severity: 'low' | 'medium' | 'high' | 'critical';
               message: string;
               value: number;
               threshold: number;
          }>;
     };
     usage_efficiency: {
          stock_utilization_rate: number;
          wastage_rate: number;
          detailed_wastage_analysis: Array<{
               item_name: string;
               wastage_type: string;
               wastage_events: number;
               total_wasted_units: number;
               avg_wastage_per_event: number;
               wastage_percentage: number;
          }>;
          batch_utilization_analysis: Array<{
               item_name: string;
               batch_number: string;
               expiry_date: string;
               total_received: number;
               total_consumed: number;
               total_wasted: number;
               utilization_rate: number;
               days_to_expiry: number;
               utilization_status: string;
          }>;
          stock_turnover_rates: Array<{
               item_name: string;
               total_added: number;
               total_consumed: number;
               total_wasted: number;
               consumption_rate: number;
               wastage_rate: number;
               turnover_efficiency: string;
          }>;
          comprehensive_usage_summary: Array<{
               item_name: string;
               total_transactions: number;
               total_added: number;
               total_consumed: number;
               total_wasted: number;
               consumption_percentage: number;
               wastage_percentage: number;
               avg_daily_consumption: number;
               efficiency_score: number;
          }>;
          optimal_ordering_patterns: Array<any>;
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
               case 'critical':
               case 'high':
                    return 'danger';
               case 'medium':
                    return 'warning';
               case 'low':
                    return 'info';
               default:
                    return 'secondary';
          }
     };

     if (loading) {
          return (
               <div className="container-fluid py-4" style={{ backgroundColor: '#f5f6fa', minHeight: '100vh' }}>
                    <div className="mx-auto" style={{ maxWidth: '1400px' }}>
                         <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                              <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid py-4" style={{ backgroundColor: '#f5f6fa', minHeight: '100vh' }}>
               <div className="mx-auto" style={{ maxWidth: '1400px' }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                         <div>
                              <Link href="/inventory/analytics" className="text-decoration-none">
                                   <span className="text-muted small d-inline-flex align-items-center">
                                        <span className="me-1">←</span> Back to Analytics Dashboard
                                   </span>
                              </Link>
                              <h2 className="mb-1 mt-2">📊 Usage Analytics</h2>
                              <p className="text-muted mb-0 small">
                                   Understand consumption patterns, anomalies, and efficiency across your inventory.
                              </p>
                         </div>
                         <button
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                              onClick={loadUsageAnalytics}
                         >
                              <span className="me-1">↻</span> Refresh
                         </button>
                    </div>

                    {/* Usage Efficiency Metrics */}
                    {analytics && (
                         <div className="row g-3 mb-4">
                              <div className="col-md-3">
                                   <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body text-center">
                                             <div className="text-muted text-uppercase small mb-1">Stock Utilization</div>
                                             <h4 className="mb-0 text-dark">{typeof analytics.usage_efficiency?.stock_utilization_rate === 'number' ? `${(analytics.usage_efficiency.stock_utilization_rate * 100).toFixed(1)}%` : '0.0%'}</h4>
                                             <div className="text-muted small mt-1">How much of stock is actually used</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body text-center">
                                             <div className="text-muted text-uppercase small mb-1">Wastage Rate</div>
                                             <h4 className="mb-0 text-dark">{(analytics.usage_efficiency?.wastage_rate ?? 0).toFixed(1)}%</h4>
                                             <div className="text-muted small mt-1">Proportion of units lost or expired</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body text-center">
                                             <div className="text-muted text-uppercase small mb-1">Predictive Models</div>
                                             <h4 className="mb-0 text-dark">{((analytics.consumption_patterns?.predictive_usage || []).length).toLocaleString()}</h4>
                                             <div className="text-muted small mt-1">Items with forecasted usage</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body text-center">
                                             <div className="text-muted text-uppercase small mb-1">Critical Alerts</div>
                                             <h4 className="mb-0 text-dark">{((analytics.anomalies_red_flags?.critical_alerts || []).length).toLocaleString()}</h4>
                                             <div className="text-muted small mt-1">High-risk items needing attention</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Consumption Trends and Predictive Usage */}
                    <div className="row g-3 mb-4">
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">📈 Consumption Trends</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && (analytics.consumption_patterns?.consumption_trends || []).length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Date</th>
                                                                 <th>Total Consumed</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {(analytics.consumption_patterns?.consumption_trends || []).slice(0, 10).map((trend, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-dark">{new Date(trend.date).toLocaleDateString()}</td>
                                                                      <td className="text-dark fw-bold">{trend.total_consumed.toLocaleString()}</td>
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
                                                            {(analytics.consumption_patterns?.predictive_usage || []).slice(0, 10).map((prediction, index) => {
                                                                 const raw = typeof prediction.confidence_level === 'number' ? prediction.confidence_level : 0;
                                                                 const confPct = raw > 1 ? raw : raw * 100;
                                                                 const clamped = Math.max(0, Math.min(100, confPct));
                                                                 const barClass = clamped > 80 ? 'bg-success' : clamped > 60 ? 'bg-warning' : 'bg-danger';

                                                                 return (
                                                                      <tr key={index}>
                                                                           <td className="text-dark fw-bold">{prediction.item_name}</td>
                                                                           <td className="text-dark fw-bold">{prediction.predicted_monthly_usage.toFixed(1)}</td>
                                                                           <td>
                                                                                <div className="progress" style={{ height: '20px' }}>
                                                                                     <div
                                                                                          className={`progress-bar ${barClass}`}
                                                                                          style={{ width: `${clamped}%` }}
                                                                                     >
                                                                                          {clamped.toFixed(0)}%
                                                                                     </div>
                                                                                </div>
                                                                           </td>
                                                                           <td className="text-dark text-center">{prediction.based_on_history_months}</td>
                                                                      </tr>
                                                                 );
                                                            })}
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

                    {/* Employee Consumption */}
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">👥 Employee Consumption</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && (analytics.consumption_patterns?.department_consumption || []).length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>User</th>
                                                                 <th>Role</th>
                                                                 <th>Total Consumed</th>
                                                                 <th>Unique Items</th>
                                                                 <th>Transactions</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {(analytics.consumption_patterns?.department_consumption || []).slice(0, 10).map((dept, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-dark fw-bold">{dept.username}</td>
                                                                      <td className="text-dark">{dept.role}</td>
                                                                      <td className="text-dark">{dept.total_consumed.toLocaleString()}</td>
                                                                      <td className="text-dark">{dept.unique_items_used}</td>
                                                                      <td className="text-dark">{dept.transaction_count}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No employee consumption data available</p>
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
                                        {analytics && (analytics.anomalies_red_flags?.unusual_usage_spikes || []).length > 0 && (
                                             <div className="mb-4">
                                                  <h6 className="text-dark mb-3">⚡ Unusual Usage Spikes</h6>
                                                  <div className="table-responsive">
                                                       <table className="table table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Actual Usage</th>
                                                                      <th>Expected Usage</th>
                                                                      <th>Deviation</th>
                                                                      <th>Potential Cause</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {(analytics.anomalies_red_flags?.unusual_usage_spikes || []).map((spike, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-dark fw-bold">{spike.actual_usage ? spike.actual_usage.toLocaleString() : 'N/A'}</td>
                                                                           <td className="text-dark">{spike.expected_usage.toLocaleString()}</td>
                                                                           <td className="text-dark fw-bold">{spike.deviation_percentage.toFixed(1)}%</td>
                                                                           <td className="text-dark">{spike.potential_cause}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        )}

                                        {/* Potential Theft Indicators */}
                                        {analytics && (analytics.anomalies_red_flags?.potential_theft_indicators || []).length > 0 && (
                                             <div className="mb-4">
                                                  <h6 className="text-dark mb-3">🕵️ Potential Theft Indicators</h6>
                                                  <div className="table-responsive">
                                                       <table className="table table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Item</th>
                                                                      <th>Unusual Pattern</th>
                                                                      <th>Risk Level</th>
                                                                      <th>Last Incident</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {(analytics.anomalies_red_flags?.potential_theft_indicators || []).map((indicator, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-dark fw-bold">{indicator.item_name}</td>
                                                                           <td className="text-dark">{indicator.unusual_pattern}</td>
                                                                           <td>
                                                                                <span className={`badge bg-${getRiskLevelColor(indicator.risk_level)}`}>
                                                                                     {indicator.risk_level.toUpperCase()}
                                                                                </span>
                                                                           </td>
                                                                           <td className="text-dark">{new Date(indicator.last_incident_date).toLocaleDateString()}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        )}

                                        {/* Misallocation Trends */}
                                        {analytics && (analytics.anomalies_red_flags?.misallocation_trends || []).length > 0 && (
                                             <div className="mb-4">
                                                  <h6 className="text-dark mb-3">📊 Misallocation Trends</h6>
                                                  <div className="table-responsive">
                                                       <table className="table table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Item</th>
                                                                      <th>User</th>
                                                                      <th>Allocated vs Used</th>
                                                                      <th>Variance</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {(analytics.anomalies_red_flags?.misallocation_trends || []).map((trend, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-dark fw-bold">{trend.item_name}</td>
                                                                           <td className="text-dark">{trend.username} ({trend.role})</td>
                                                                           <td className="text-dark">
                                                                                <small>
                                                                                     {trend.allocated_quantity.toLocaleString()} vs {trend.actual_usage.toLocaleString()}
                                                                                </small>
                                                                           </td>
                                                                           <td className={`text-dark fw-bold ${trend.variance_percentage > 20 ? 'text-danger' : trend.variance_percentage > 10 ? 'text-warning' : 'text-success'}`}>
                                                                                {trend.variance_percentage >= 0 ? '+' : ''}{trend.variance_percentage.toFixed(1)}%
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        )}

                                        {/* Critical Alerts */}
                                        {analytics && (analytics.anomalies_red_flags?.critical_alerts || []).length > 0 && (
                                             <div className="mb-4">
                                                  <h6 className="text-dark mb-3">🚨 Critical Alerts</h6>
                                                  <div className="table-responsive">
                                                       <table className="table table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Item</th>
                                                                      <th>Message</th>
                                                                      <th>Value</th>
                                                                      <th>Threshold</th>
                                                                      <th>Severity</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {(analytics.anomalies_red_flags?.critical_alerts || []).map((alert, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-dark fw-bold">{alert.item_name}</td>
                                                                           <td className="text-dark">{alert.message}</td>
                                                                           <td className="text-dark">{alert.value}</td>
                                                                           <td className="text-dark">{alert.threshold}</td>
                                                                           <td>
                                                                                <span className={`badge bg-${getRiskLevelColor(alert.severity)}`}>
                                                                                     {alert.severity.toUpperCase()}
                                                                                </span>
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
                                             (analytics.anomalies_red_flags?.unusual_usage_spikes || []).length === 0 &&
                                             (analytics.anomalies_red_flags?.potential_theft_indicators || []).length === 0 &&
                                             (analytics.anomalies_red_flags?.misallocation_trends || []).length === 0 &&
                                             (analytics.anomalies_red_flags?.critical_alerts || []).length === 0 && (
                                                  <div className="alert alert-success">
                                                       <strong>✅ No Anomalies Detected!</strong> All usage patterns appear normal.
                                                  </div>
                                             )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Usage Efficiency Analysis */}
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">📊 Detailed Wastage Analysis</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && (analytics.usage_efficiency?.detailed_wastage_analysis || []).length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Wastage Type</th>
                                                                 <th>Events</th>
                                                                 <th>Total Wasted</th>
                                                                 <th>Avg per Event</th>
                                                                 <th>Wastage %</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {(analytics.usage_efficiency?.detailed_wastage_analysis || []).map((wastage, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-dark fw-bold">{wastage.item_name}</td>
                                                                      <td className="text-dark">{wastage.wastage_type}</td>
                                                                      <td className="text-dark">{wastage.wastage_events}</td>
                                                                      <td className="text-dark">{wastage.total_wasted_units.toLocaleString()}</td>
                                                                      <td className="text-dark">{wastage.avg_wastage_per_event.toFixed(2)}</td>
                                                                      <td className="text-dark fw-bold">{wastage.wastage_percentage.toFixed(2)}%</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No wastage analysis data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Batch Utilization and Stock Turnover */}
                    <div className="row g-3 mb-4">
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">📦 Batch Utilization Analysis</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && (analytics.usage_efficiency?.batch_utilization_analysis || []).length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Batch</th>
                                                                 <th>Utilization Rate</th>
                                                                 <th>Status</th>
                                                                 <th>Days to Expiry</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {(analytics.usage_efficiency?.batch_utilization_analysis || []).slice(0, 10).map((batch, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-dark fw-bold">{batch.item_name}</td>
                                                                      <td className="text-dark">{batch.batch_number}</td>
                                                                      <td className="text-dark fw-bold">{batch.utilization_rate.toFixed(2)}%</td>
                                                                      <td>
                                                                           <span className={`badge ${batch.utilization_status === 'excellent' ? 'bg-success' : batch.utilization_status === 'good' ? 'bg-info' : 'bg-danger'}`}>
                                                                                {batch.utilization_status === 'excellent' ? '✅' : batch.utilization_status === 'good' ? '⚠️' : '🚨'} {batch.utilization_status}
                                                                           </span>
                                                                      </td>
                                                                      <td className="text-dark">{batch.days_to_expiry}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No batch utilization data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">🔄 Stock Turnover Rates</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && (analytics.usage_efficiency?.stock_turnover_rates || []).length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Consumption Rate</th>
                                                                 <th>Wastage Rate</th>
                                                                 <th>Efficiency</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {(analytics.usage_efficiency?.stock_turnover_rates || []).map((turnover, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-dark fw-bold">{turnover.item_name}</td>
                                                                      <td className="text-dark">{turnover.consumption_rate.toFixed(2)}</td>
                                                                      <td className="text-dark">{turnover.wastage_rate.toFixed(2)}%</td>
                                                                      <td>
                                                                           <span className={`badge ${turnover.turnover_efficiency === 'excellent' ? 'bg-success' : turnover.turnover_efficiency === 'good' ? 'bg-info' : 'bg-warning'}`}>
                                                                                {turnover.turnover_efficiency === 'excellent' ? '✅' : turnover.turnover_efficiency === 'good' ? '⚠️' : '🚨'} {turnover.turnover_efficiency}
                                                                           </span>
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No stock turnover data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Comprehensive Usage Summary */}
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">📋 Comprehensive Usage Summary</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && (analytics.usage_efficiency?.comprehensive_usage_summary || []).length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Transactions</th>
                                                                 <th>Total Added</th>
                                                                 <th>Total Consumed</th>
                                                                 <th>Total Wasted</th>
                                                                 <th>Consumption %</th>
                                                                 <th>Wastage %</th>
                                                                 <th>Efficiency Score</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {(analytics.usage_efficiency?.comprehensive_usage_summary || []).map((summary, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-dark fw-bold">{summary.item_name}</td>
                                                                      <td className="text-dark">{summary.total_transactions}</td>
                                                                      <td className="text-dark">{summary.total_added.toLocaleString()}</td>
                                                                      <td className="text-dark">{summary.total_consumed.toLocaleString()}</td>
                                                                      <td className="text-dark">{summary.total_wasted.toLocaleString()}</td>
                                                                      <td className="text-dark fw-bold">{summary.consumption_percentage.toFixed(2)}%</td>
                                                                      <td className="text-dark fw-bold">{summary.wastage_percentage.toFixed(2)}%</td>
                                                                      <td className={`text-dark fw-bold ${summary.efficiency_score > 0 ? 'text-success' : 'text-danger'}`}>
                                                                           {summary.efficiency_score > 0 ? '✅' : '🚨'} {summary.efficiency_score.toFixed(2)}
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No comprehensive usage summary available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}