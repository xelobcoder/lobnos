'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

interface BatchExpiryAnalytics {
     items_by_batch: Array<{
          batch_number: string;
          item_id: string;
          item_name: string;
          total_received: number;
          total_consumed: number;
          remaining_quantity: number;
          expiry_date: string;
          days_until_expiry: number;
          status: 'fresh' | 'near_expiry' | 'expired';
     }>;
     expiry_summary: {
          expired_stock_value: number;
          near_expiry_7_days: number;
          near_expiry_30_days: number;
          near_expiry_60_days: number;
          expired_items_count: number;
     };
     batch_quality_issues: Array<{
          batch_number: string;
          item_name: string;
          issue_type: 'qc_failure' | 'quarantined' | 'recall';
          quantity_affected: number;
          reported_date: string;
          status: string;
     }>;
     supplier_batch_performance: Array<{
          supplier_id: string;
          supplier_name: string;
          total_batches: number;
          expired_batches: number;
          expiry_rate: number;
          average_batch_lifespan_days: number;
     }>;
}

export default function BatchExpiryAnalyticsPage() {
     const [analytics, setAnalytics] = useState<BatchExpiryAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (branchid && employeeid) {
               loadBatchExpiryAnalytics();
          }
     }, [branchid, employeeid]);

     const loadBatchExpiryAnalytics = async () => {
          try {
               const response = await customFetch(`inventory/analytics/batch-expiry?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load batch expiry analytics');
               }
          } catch (error) {
               console.error('Error loading batch expiry analytics:', error);
               toast.error('Error loading batch expiry analytics');
          } finally {
               setLoading(false);
          }
     };

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'fresh': return 'success';
               case 'near_expiry': return 'warning';
               case 'expired': return 'danger';
               default: return 'secondary';
          }
     };

     const getIssueTypeColor = (issueType: string) => {
          switch (issueType) {
               case 'qc_failure': return 'danger';
               case 'quarantined': return 'warning';
               case 'recall': return 'dark';
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
                         <h2 className="mb-1">⏰ Batch Expiry Analytics</h2>
                         <p className="text-muted mb-0">Monitor batch expiry dates and utilization</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadBatchExpiryAnalytics}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Expiry Summary Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100 border-danger">
                                   <div className="card-body text-center">
                                        <h4 className="text-danger">{analytics.expiry_summary.expired_items_count.toLocaleString()}</h4>
                                        <p className="text-muted mb-1">Expired Items</p>
                                        <small className="text-danger">
                                             {currencyFormatter.format(analytics.expiry_summary.expired_stock_value)}
                                        </small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-warning">
                                   <div className="card-body text-center">
                                        <h4 className="text-warning">{analytics.expiry_summary.near_expiry_7_days.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Expiring in 7 Days</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-info">
                                   <div className="card-body text-center">
                                        <h4 className="text-info">{analytics.expiry_summary.near_expiry_30_days.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Expiring in 30 Days</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100 border-secondary">
                                   <div className="card-body text-center">
                                        <h4 className="text-secondary">{analytics.expiry_summary.near_expiry_60_days.toLocaleString()}</h4>
                                        <p className="text-muted mb-0">Expiring in 60 Days</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Items by Batch */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📦 Items by Batch</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.items_by_batch.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Batch Number</th>
                                                            <th>Item</th>
                                                            <th>Remaining Qty</th>
                                                            <th>Expiry Date</th>
                                                            <th>Days Until Expiry</th>
                                                            <th>Status</th>
                                                            <th>Utilization</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.items_by_batch.slice(0, 20).map((batch, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-monospace">{batch.batch_number}</td>
                                                                 <td>{batch.item_name}</td>
                                                                 <td className="text-center">{batch.remaining_quantity.toLocaleString()}</td>
                                                                 <td>{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                                                 <td className={`fw-bold ${batch.days_until_expiry < 0 ? 'text-danger' : batch.days_until_expiry < 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {batch.days_until_expiry < 0 ? 'Expired' : `${batch.days_until_expiry} days`}
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge bg-${getStatusColor(batch.status)}`}>
                                                                           {batch.status.replace('_', ' ')}
                                                                      </span>
                                                                 </td>
                                                                 <td>
                                                                      <div className="progress" style={{ height: '20px' }}>
                                                                           <div
                                                                                className={`progress-bar ${batch.total_consumed / batch.total_received > 0.8 ? 'bg-success' : batch.total_consumed / batch.total_received > 0.5 ? 'bg-warning' : 'bg-danger'}`}
                                                                                style={{ width: `${(batch.total_consumed / batch.total_received) * 100}%` }}
                                                                           >
                                                                                {((batch.total_consumed / batch.total_received) * 100).toFixed(0)}%
                                                                           </div>
                                                                      </div>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No batch data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Quality Issues and Supplier Performance */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">⚠️ Batch Quality Issues</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.batch_quality_issues.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Batch</th>
                                                            <th>Item</th>
                                                            <th>Issue Type</th>
                                                            <th>Qty Affected</th>
                                                            <th>Status</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.batch_quality_issues.map((issue, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-monospace">{issue.batch_number}</td>
                                                                 <td>{issue.item_name}</td>
                                                                 <td>
                                                                      <span className={`badge bg-${getIssueTypeColor(issue.issue_type)}`}>
                                                                           {issue.issue_type.replace('_', ' ')}
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-danger">{issue.quantity_affected.toLocaleString()}</td>
                                                                 <td>
                                                                      <span className={`badge bg-${issue.status === 'resolved' ? 'success' : 'warning'}`}>
                                                                           {issue.status}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="alert alert-success">
                                             <strong>✅ No Quality Issues!</strong> All batches are in good condition.
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🏢 Supplier Batch Performance</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.supplier_batch_performance.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Total Batches</th>
                                                            <th>Expired</th>
                                                            <th>Expiry Rate</th>
                                                            <th>Avg Lifespan</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.supplier_batch_performance.map((supplier, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold">{supplier.supplier_name}</td>
                                                                 <td className="text-center">{supplier.total_batches.toLocaleString()}</td>
                                                                 <td className="text-danger">{supplier.expired_batches.toLocaleString()}</td>
                                                                 <td className={`fw-bold ${supplier.expiry_rate > 10 ? 'text-danger' : supplier.expiry_rate > 5 ? 'text-warning' : 'text-success'}`}>
                                                                      {supplier.expiry_rate.toFixed(1)}%
                                                                 </td>
                                                                 <td className="text-info">{supplier.average_batch_lifespan_days.toFixed(0)} days</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No supplier batch performance data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Critical Alerts */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🚨 Critical Alerts</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length > 0 && (
                                        <div className="alert alert-danger">
                                             <strong>⚠️ Urgent:</strong> {analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length} batches expire within 7 days!
                                        </div>
                                   )}
                                   {analytics && analytics.expiry_summary.expired_items_count > 0 && (
                                        <div className="alert alert-dark">
                                             <strong>💀 Expired Stock:</strong> {analytics.expiry_summary.expired_items_count} items have expired stock worth {currencyFormatter.format(analytics.expiry_summary.expired_stock_value)}
                                        </div>
                                   )}
                                   {analytics && analytics.batch_quality_issues.filter(issue => issue.status !== 'resolved').length > 0 && (
                                        <div className="alert alert-warning">
                                             <strong>🔍 Quality Issues:</strong> {analytics.batch_quality_issues.filter(issue => issue.status !== 'resolved').length} unresolved batch quality issues
                                        </div>
                                   )}
                                   {analytics && analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length === 0 &&
                                        analytics.expiry_summary.expired_items_count === 0 &&
                                        analytics.batch_quality_issues.filter(issue => issue.status !== 'resolved').length === 0 && (
                                             <div className="alert alert-success">
                                                  <strong>✅ All Clear!</strong> No critical batch expiry or quality issues.
                                             </div>
                                        )}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}