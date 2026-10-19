'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';
import { RiArrowLeftLine, RiTimeLine, RiAlertLine, RiCalendarEventLine, RiBarChartLine, RiFileListLine, RiRefreshLine, RiBuildingLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';

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
     batch_expiry_distribution: Array<{
          expiry_range: string;
          batch_count: number;
          total_quantity: number;
     }>;
     items_with_multiple_batches: Array<{
          item_id: string;
          item_name: string;
          batch_count: number;
          total_quantity: number;
          earliest_expiry: string;
          latest_expiry: string;
     }>;
     batch_utilization: Array<{
          batch_number: string;
          expiry_date: string;
          original_quantity: number;
          item_id: string;
          item_name: string;
          consumed_quantity: number;
          remaining_quantity: number;
          utilization_percentage: number;
     }>;
}

export default function BatchExpiryAnalyticsPage() {
     const [analytics, setAnalytics] = useState<BatchExpiryAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [showSummary, setShowSummary] = useState(true);
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
          <div className="container-fluid p-4" data-pdf-root>
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
                         <ExportPdfButton title="Batch Expiry Analytics" />
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setShowSummary(!showSummary)}
                         >
                              {showSummary ? <RiEyeOffLine size={16} className="me-1" /> : <RiEyeLine size={16} className="me-1" />}
                              {showSummary ? 'Hide Summary' : 'Show Summary'}
                         </button>
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
               {showSummary && analytics && (
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
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
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

               {/* Batch Expiry Distribution and Items with Multiple Batches */}
               <div className="row g-3">
                    <div className="col-lg-6">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0 fw-semibold">
                                        <RiBarChartLine className="me-2" />
                                        Batch Expiry Distribution
                                   </h5>
                                   <small className="text-muted">{analytics?.batch_expiry_distribution.length || 0} ranges</small>
                              </div>
                              {analytics && analytics.batch_expiry_distribution.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th className="text-start">Expiry Range</th>
                                                       <th className="text-center">Batch Count</th>
                                                       <th className="text-center">Total Quantity</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.batch_expiry_distribution.map((distribution, index) => (
                                                       <tr key={index}>
                                                            <td className="text-start">
                                                                 <div className="fw-bold">{distribution.expiry_range.replace('_', ' ').replace('days', 'days')}</div>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className="badge bg-primary fs-6">{distribution.batch_count.toLocaleString()}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className="fw-bold text-info">{distribution.total_quantity.toLocaleString()}</span>
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
                                        <h5 className="text-muted mb-2">No Distribution Data</h5>
                                        <p className="text-muted">Batch expiry distribution data will appear here when available.</p>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0 fw-semibold">
                                        <RiFileListLine className="me-2" />
                                        Items with Multiple Batches
                                   </h5>
                                   <small className="text-muted">{analytics?.items_with_multiple_batches.length || 0} items</small>
                              </div>
                              {analytics && analytics.items_with_multiple_batches.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th className="text-start">Item</th>
                                                       <th className="text-center">Batch Count</th>
                                                       <th className="text-center">Total Qty</th>
                                                       <th className="text-start">Expiry Range</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.items_with_multiple_batches.map((item, index) => (
                                                       <tr key={index}>
                                                            <td className="text-start">
                                                                 <div className="fw-bold">{item.item_name}</div>
                                                                 <small className="text-muted">ID: {item.item_id}</small>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className="badge bg-success fs-6">{item.batch_count.toLocaleString()}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className="fw-bold text-primary">{item.total_quantity.toLocaleString()}</span>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="fw-semibold text-warning">{new Date(item.earliest_expiry).toLocaleDateString()}</div>
                                                                 <small className="text-muted">to {new Date(item.latest_expiry).toLocaleDateString()}</small>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ) : (
                                   <div className="text-center py-5">
                                        <div className="mb-3">
                                             <span style={{ fontSize: '3rem' }}>📦</span>
                                        </div>
                                        <h5 className="text-muted mb-2">No Multi-Batch Items</h5>
                                        <p className="text-muted">Items with multiple batches will appear here when available.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Batch Utilization */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0 fw-semibold">
                                        <RiBarChartLine className="me-2" />
                                        Batch Utilization Details
                                   </h5>
                                   <small className="text-muted">{analytics?.batch_utilization.length || 0} batches</small>
                              </div>
                              {analytics && analytics.batch_utilization.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th className="text-start">Batch</th>
                                                       <th className="text-start">Item</th>
                                                       <th className="text-start">Expiry Date</th>
                                                       <th className="text-center">Original Qty</th>
                                                       <th className="text-center">Consumed</th>
                                                       <th className="text-center">Remaining</th>
                                                       <th className="text-center">Utilization %</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.batch_utilization.map((batch, index) => (
                                                       <tr key={index}>
                                                            <td className="text-start">
                                                                 <div className="fw-bold text-monospace">{batch.batch_number}</div>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="fw-semibold">{batch.item_name}</div>
                                                                 <small className="text-muted">ID: {batch.item_id}</small>
                                                            </td>
                                                            <td className="text-start">
                                                                 <div className="fw-bold">{new Date(batch.expiry_date).toLocaleDateString()}</div>
                                                                 <div className={`fw-semibold ${batch.remaining_quantity < 0 ? 'text-danger' : 'text-success'}`}>
                                                                      {batch.remaining_quantity < 0 ? 'Over-consumed' : 'Available'}
                                                                 </div>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className="fw-bold text-primary">{batch.original_quantity.toLocaleString()}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className="fw-bold text-warning">{batch.consumed_quantity.toLocaleString()}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className={`fw-bold ${batch.remaining_quantity < 0 ? 'text-danger' : 'text-success'}`}>
                                                                      {batch.remaining_quantity.toLocaleString()}
                                                                 </span>
                                                            </td>
                                                            <td className="text-center">
                                                                 <span className={`fw-bold fs-6 ${batch.utilization_percentage > 100 ? 'text-danger' : batch.utilization_percentage > 80 ? 'text-warning' : 'text-success'}`}>
                                                                      {batch.utilization_percentage > 100 ? '🔴' : batch.utilization_percentage > 80 ? '🟡' : '🟢'} {batch.utilization_percentage.toFixed(1)}%
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
                                             <span style={{ fontSize: '3rem' }}>📈</span>
                                        </div>
                                        <h5 className="text-muted mb-2">No Utilization Data</h5>
                                        <p className="text-muted">Batch utilization data will appear here when available.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Critical Alerts */}
               <div className="row g-3 mt-3">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ borderColor: 'var(--bs-warning-border-subtle)' }}>
                              <h5 className="mb-3 fw-semibold d-flex align-items-center">
                                   <span className="me-2">🚨</span>
                                   Critical Alerts & Notifications
                              </h5>
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
                              {analytics && analytics.batch_utilization.filter(batch => batch.utilization_percentage > 100).length > 0 && (
                                   <div className="alert alert-warning border-0 shadow-sm mb-3">
                                        <div className="d-flex align-items-center">
                                             <span className="me-3" style={{ fontSize: '1.5rem' }}>⚡</span>
                                             <div>
                                                  <strong className="fs-6">Over-Consumption Alert</strong>
                                                  <div className="mt-1">{analytics.batch_utilization.filter(batch => batch.utilization_percentage > 100).length} batches have been over-consumed and need investigation</div>
                                             </div>
                                        </div>
                                   </div>
                              )}
                              {analytics && analytics.items_by_batch.filter(batch => batch.days_until_expiry <= 7 && batch.days_until_expiry > 0).length === 0 &&
                                   analytics.expiry_summary.expired_items_count === 0 &&
                                   analytics.batch_utilization.filter(batch => batch.utilization_percentage > 100).length === 0 && (
                                        <div className="alert alert-success border-0 shadow-sm">
                                             <div className="d-flex align-items-center">
                                                  <span className="me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                                                  <div>
                                                       <strong className="fs-6">All Clear!</strong>
                                                       <div className="mt-1">No critical batch expiry or over-consumption issues detected. All systems operational.</div>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                         </div>
                    </div>
               </div>
          </div>
     );
}