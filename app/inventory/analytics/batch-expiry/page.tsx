'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { RiArrowLeftLine, RiTimeLine, RiAlertLine, RiCalendarEventLine, RiBarChartLine, RiFileListLine, RiRefreshLine, RiBuildingLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

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
                         <Link href="/inventory/analytics" className="text-decoration-none d-block mb-2">
                              <RiArrowLeftLine size={16} className="me-1" />
                              <span className="text-muted">Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">
                              <RiTimeLine className="me-2" />
                              Batch Expiry Analytics
                         </h2>
                         <p className="text-muted mb-0">Monitor batch expiry dates and utilization</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={loadBatchExpiryAnalytics}
                         >
                              <RiRefreshLine size={16} className="me-1" />
                              Refresh
                         </button>
                    </div>
               </div>

               {/* Expiry Summary Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiAlertLine size={20} className="me-2 text-danger" />
                                        <span className="fw-medium text-muted small">Expired Items</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-danger">{analytics.expiry_summary.expired_items_count.toLocaleString()}</div>
                                   <div className="small text-muted">{currencyFormatter.format(analytics.expiry_summary.expired_stock_value)} value</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiTimeLine size={20} className="me-2 text-warning" />
                                        <span className="fw-medium text-muted small">Expiring in 7 Days</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-warning">{analytics.expiry_summary.near_expiry_7_days.toLocaleString()}</div>
                                   <div className="small text-muted">Items nearing expiry</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiCalendarEventLine size={20} className="me-2 text-info" />
                                        <span className="fw-medium text-muted small">Expiring in 30 Days</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-info">{analytics.expiry_summary.near_expiry_30_days.toLocaleString()}</div>
                                   <div className="small text-muted">Items expiring soon</div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiBarChartLine size={20} className="me-2 text-secondary" />
                                        <span className="fw-medium text-muted small">Expiring in 60 Days</span>
                                   </div>
                                   <div className="fs-4 fw-bold text-secondary">{analytics.expiry_summary.near_expiry_60_days.toLocaleString()}</div>
                                   <div className="small text-muted">Items to monitor</div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Items by Batch */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">
                                   <RiFileListLine className="me-2" />
                                   Items by Batch
                              </h5>
                              {analytics && analytics.items_by_batch.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Batch Number</th>
                                                       <th className="text-start">Item Details</th>
                                                       <th className="text-start">Quantities</th>
                                                       <th className="text-start">Expiry Info</th>
                                                       <th className="text-start">Status</th>
                                                       <th className="text-start">Utilization</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.items_by_batch.slice(0, 20).map((batch, index) => (
                                                       <tr key={index}>
                                                            <td className="text-start">
                                                                 <div className="fw-bold text-monospace">{batch.batch_number}</div>
                                                                 <small className="text-muted">ID: {batch.item_id}</small>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="fw-semibold">{batch.item_name}</div>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="mb-1">
                                                                      <strong className="text-primary">{batch.remaining_quantity.toLocaleString()}</strong>
                                                                      <small className="text-muted d-block">remaining</small>
                                                                 </div>
                                                                 <div className="text-muted small">
                                                                      Received: {batch.total_received.toLocaleString()}
                                                                 </div>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="fw-bold">{new Date(batch.expiry_date).toLocaleDateString()}</div>
                                                                 <div className={`fw-semibold ${batch.days_until_expiry < 0 ? 'text-danger' : batch.days_until_expiry <= 7 ? 'text-danger' : batch.days_until_expiry <= 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {batch.days_until_expiry < 0 ? 'Expired' : batch.days_until_expiry <= 7 ? `${batch.days_until_expiry} days` : `${batch.days_until_expiry} days`}
                                                                 </div>
                                                            </td>
                                                            <td className="text-start">
                                                                 <span className={`badge fs-6 px-3 py-2 bg-${getStatusColor(batch.status)}`}>
                                                                      {batch.status === 'expired' ? 'Expired' : batch.status === 'near_expiry' ? 'Near Expiry' : 'Fresh'}
                                                                 </span>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="progress mb-1" style={{ height: '20px' }}>
                                                                      <div
                                                                           className={`progress-bar ${batch.total_consumed / batch.total_received > 0.8 ? 'bg-success' : batch.total_consumed / batch.total_received > 0.5 ? 'bg-warning' : 'bg-danger'}`}
                                                                           style={{ width: `${Math.max((batch.total_consumed / batch.total_received) * 100, 5)}%` }}
                                                                      >
                                                                           {((batch.total_consumed / batch.total_received) * 100).toFixed(0)}%
                                                                      </div>
                                                                 </div>
                                                                 <small className="text-muted">
                                                                      {batch.total_consumed.toLocaleString()} / {batch.total_received.toLocaleString()} used
                                                                 </small>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ) : (
                                   <div className="text-start py-4">
                                        <p className="text-muted">No batch data available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Quality Issues and Supplier Performance */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header d-flex justify-content-between align-items-center">
                                   <h5 className="mb-0">
                                        <RiAlertLine className="me-2" />
                                        Batch Quality Issues
                                   </h5>
                                   <small className="text-muted">{analytics?.batch_quality_issues.length || 0} issues</small>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.batch_quality_issues.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped table-hover">
                                                  <thead className="table-dark">
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
                                                                 <td>
                                                                      <div className="fw-bold text-monospace">{issue.batch_number}</div>
                                                                 </td>
                                                                 <td>
                                                                      <div className="fw-semibold">{issue.item_name}</div>
                                                                      <small className="text-muted">{new Date(issue.reported_date).toLocaleDateString()}</small>
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge fs-6 px-2 py-1 bg-${getIssueTypeColor(issue.issue_type)}`}>
                                                                           {issue.issue_type === 'qc_failure' ? 'QC Failure' : issue.issue_type === 'quarantined' ? 'Quarantined' : 'Recall'}
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-center">
                                                                      <span className="fw-bold text-danger">{issue.quantity_affected.toLocaleString()}</span>
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge fs-6 px-2 py-1 bg-${issue.status === 'resolved' ? 'success' : 'warning'}`}>
                                                                           {issue.status === 'resolved' ? 'Resolved' : 'Pending'}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-5">
                                             <div className="mb-3">
                                                  <span style={{ fontSize: '3rem' }}>✅</span>
                                             </div>
                                             <h5 className="text-success mb-2">No Quality Issues!</h5>
                                             <p className="text-muted">All batches are in good condition and meet quality standards.</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header d-flex justify-content-between align-items-center">
                                   <h5 className="mb-0">
                                        <RiBuildingLine className="me-2" />
                                        Supplier Batch Performance
                                   </h5>
                                   <small className="text-muted">{analytics?.supplier_batch_performance.length || 0} suppliers</small>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.supplier_batch_performance.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped table-hover">
                                                  <thead className="table-dark">
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th className="text-center">Total Batches</th>
                                                            <th className="text-center">Expired</th>
                                                            <th className="text-center">Expiry Rate</th>
                                                            <th className="text-center">Avg Lifespan</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.supplier_batch_performance.map((supplier, index) => (
                                                            <tr key={index}>
                                                                 <td>
                                                                      <div className="fw-bold">{supplier.supplier_name}</div>
                                                                      <small className="text-muted">ID: {supplier.supplier_id}</small>
                                                                 </td>
                                                                 <td className="text-center">
                                                                      <span className="badge bg-primary fs-6">{supplier.total_batches.toLocaleString()}</span>
                                                                 </td>
                                                                 <td className="text-center">
                                                                      <span className="fw-bold text-danger">{supplier.expired_batches.toLocaleString()}</span>
                                                                 </td>
                                                                 <td className="text-center">
                                                                      <span className={`fw-bold fs-6 ${supplier.expiry_rate > 10 ? 'text-danger' : supplier.expiry_rate > 5 ? 'text-warning' : 'text-success'}`}>
                                                                           {supplier.expiry_rate > 10 ? '🔴' : supplier.expiry_rate > 5 ? '🟡' : '🟢'} {supplier.expiry_rate.toFixed(1)}%
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-center">
                                                                      <div className="fw-semibold text-info">{supplier.average_batch_lifespan_days.toFixed(0)}</div>
                                                                      <small className="text-muted">days</small>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-5">
                                             <div className="mb-3">
                                                  <span style={{ fontSize: '3rem' }}>📊</span>
                                             </div>
                                             <h5 className="text-muted mb-2">No Supplier Data</h5>
                                             <p className="text-muted">Supplier batch performance data will appear here when available.</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Critical Alerts */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="card border-warning">
                              <div className="card-header bg-warning bg-opacity-10">
                                   <h5 className="mb-0 d-flex align-items-center">
                                        <span className="me-2">🚨</span>
                                        Critical Alerts & Notifications
                                   </h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length > 0 && (
                                        <div className="alert alert-danger border-0 shadow-sm mb-3">
                                             <div className="d-flex align-items-center">
                                                  <span className="me-3" style={{ fontSize: '1.5rem' }}>⚠️</span>
                                                  <div>
                                                       <strong className="fs-6">Urgent Action Required!</strong>
                                                       <div className="mt-1">{analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length} batches expire within 7 days</div>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                                   {analytics && analytics.expiry_summary.expired_items_count > 0 && (
                                        <div className="alert alert-dark border-0 shadow-sm mb-3">
                                             <div className="d-flex align-items-center">
                                                  <span className="me-3" style={{ fontSize: '1.5rem' }}>💀</span>
                                                  <div>
                                                       <strong className="fs-6">Expired Stock Alert</strong>
                                                       <div className="mt-1">{analytics.expiry_summary.expired_items_count} items have expired stock worth <strong>{currencyFormatter.format(analytics.expiry_summary.expired_stock_value)}</strong></div>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                                   {analytics && analytics.batch_quality_issues.filter(issue => issue.status !== 'resolved').length > 0 && (
                                        <div className="alert alert-warning border-0 shadow-sm mb-3">
                                             <div className="d-flex align-items-center">
                                                  <span className="me-3" style={{ fontSize: '1.5rem' }}>🔍</span>
                                                  <div>
                                                       <strong className="fs-6">Quality Issues Detected</strong>
                                                       <div className="mt-1">{analytics.batch_quality_issues.filter(issue => issue.status !== 'resolved').length} unresolved batch quality issues require attention</div>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                                   {analytics && analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length === 0 &&
                                        analytics.expiry_summary.expired_items_count === 0 &&
                                        analytics.batch_quality_issues.filter(issue => issue.status !== 'resolved').length === 0 && (
                                             <div className="alert alert-success border-0 shadow-sm">
                                                  <div className="d-flex align-items-center">
                                                       <span className="me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                                                       <div>
                                                            <strong className="fs-6">All Clear!</strong>
                                                            <div className="mt-1">No critical batch expiry or quality issues detected. All systems operational.</div>
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