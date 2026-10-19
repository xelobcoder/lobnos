'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { RiFileListLine, RiCheckLine, RiBox3Line, RiBarChartLine, RiFileTextLine, RiTimeLine } from '@remixicon/react';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface PurchaseOrderAnalytics {
     volume_analysis: Array<{
          period: string;
          status: string;
          order_count: number;
          total_value: number;
          avg_order_value: number;
     }>;
     supplier_performance: Array<{
          supplier_id: string;
          supplier_name: string;
          total_orders: number;
          total_spend: number;
          avg_order_value: number;
          completion_rate: number;
          cancellation_rate: number;
     }>;
     lead_time_analysis: Array<{
          order_id: string;
          order_number: string;
          supplier_name: string;
          total_lead_time: number;
          delivery_delay: number;
          delivery_status: string;
          on_time: boolean;
     }>;
     efficiency_metrics: {
          total_orders_analyzed: number;
          avg_line_items_per_order: number;
          avg_quantity_per_order: number;
          overall_fulfillment_rate: number;
          orders_with_partial_receipts: number;
          orders_fully_pending: number;
     };
     monthly_trends: Array<{
          period: string;
          order_count: number;
          total_value: number;
          avg_order_value: number;
          completion_rate: number;
          pending_rate: number;
     }>;
     open_orders: Array<{
          order_id: string;
          order_number: string;
          supplier_name: string;
          days_since_order: number;
          days_past_expected: number;
          pending_quantity: number;
          total_value: number;
          delivery_status: string;
     }>;
     communication_analysis: Array<{
          method: string;
          order_count: number;
          total_value: number;
          avg_order_value: number;
          completion_rate: number;
     }>;
}

export default function PurchaseOrderAnalyticsPage() {
     const [analytics, setAnalytics] = useState<PurchaseOrderAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (branchid && employeeid) {
               loadPurchaseOrderAnalytics();
          }
     }, [branchid, employeeid]);

     const loadPurchaseOrderAnalytics = async () => {
          try {
               const response = await customFetch(`inventory/analytics/purchase-orders?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load purchase order analytics');
               }
          } catch (error) {
               console.error('Error loading purchase order analytics:', error);
               toast.error('Error loading purchase order analytics');
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
          <div className="container-fluid p-4" data-pdf-root>
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none">
                              <span className="text-muted">← Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">📋 Purchase Order Analytics</h2>
                         <p className="text-muted mb-0">Comprehensive purchase order performance and trends</p>
                    </div>
                    <div className="d-flex gap-2">
                         <ExportPdfButton title="Purchase Order Analytics" />
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={loadPurchaseOrderAnalytics}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Efficiency Metrics Overview */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-2">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiFileListLine size={28} className="me-2 text-primary fw-bold" />
                                        <span className="fw-bold text-body small">Total Orders</span>
                                   </div>
                                   <div className="fs-3 fw-bold text-primary">{analytics.efficiency_metrics.total_orders_analyzed.toLocaleString()}</div>
                                   <div className="small text-muted fw-medium">Orders analyzed</div>
                              </div>
                         </div>
                         <div className="col-md-2">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiCheckLine size={28} className="me-2 text-success fw-bold" />
                                        <span className="fw-bold text-body small">Fulfillment Rate</span>
                                   </div>
                                   <div className="fs-3 fw-bold text-success">{(analytics.efficiency_metrics.overall_fulfillment_rate * 100).toFixed(1)}%</div>
                                   <div className="small text-muted fw-medium">Orders completed</div>
                              </div>
                         </div>
                         <div className="col-md-2">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiBox3Line size={28} className="me-2 text-info fw-bold" />
                                        <span className="fw-bold text-body small">Avg Items/Order</span>
                                   </div>
                                   <div className="fs-3 fw-bold text-info">{analytics.efficiency_metrics.avg_line_items_per_order.toFixed(2)}</div>
                                   <div className="small text-muted fw-medium">Line items per order</div>
                              </div>
                         </div>
                         <div className="col-md-2">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiBarChartLine size={28} className="me-2 text-warning fw-bold" />
                                        <span className="fw-bold text-body small">Avg Qty/Order</span>
                                   </div>
                                   <div className="fs-3 fw-bold text-warning">{analytics.efficiency_metrics.avg_quantity_per_order.toFixed(0)}</div>
                                   <div className="small text-muted fw-medium">Quantity per order</div>
                              </div>
                         </div>
                         <div className="col-md-2">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiFileTextLine size={28} className="me-2 text-secondary fw-bold" />
                                        <span className="fw-bold text-body small">Partial Receipts</span>
                                   </div>
                                   <div className="fs-3 fw-bold text-secondary">{analytics.efficiency_metrics.orders_with_partial_receipts.toLocaleString()}</div>
                                   <div className="small text-muted fw-medium">Incomplete deliveries</div>
                              </div>
                         </div>
                         <div className="col-md-2">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiTimeLine size={28} className="me-2 text-danger fw-bold" />
                                        <span className="fw-bold text-body small">Fully Pending</span>
                                   </div>
                                   <div className="fs-3 fw-bold text-danger">{analytics.efficiency_metrics.orders_fully_pending.toLocaleString()}</div>
                                   <div className="small text-muted fw-medium">Awaiting delivery</div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Volume Analysis */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">📊 Volume Analysis by Status</h5>
                              {analytics && analytics.volume_analysis.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th>Period</th>
                                                       <th>Status</th>
                                                       <th>Order Count</th>
                                                       <th>Total Value</th>
                                                       <th>Avg Order Value</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.volume_analysis.map((item, index) => (
                                                       <tr key={index}>
                                                            <td>{item.period}</td>
                                                            <td>
                                                                 <span className={`badge ${item.status === 'received' ? 'bg-success' : item.status === 'partially_received' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                      {item.status.replace('_', ' ').toUpperCase()}
                                                                 </span>
                                                            </td>
                                                            <td>{item.order_count.toLocaleString()}</td>
                                                            <td>{currencyFormatter.format(item.total_value)}</td>
                                                            <td>{currencyFormatter.format(item.avg_order_value)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ) : (
                                   <div className="text-center py-4">
                                        <p className="text-muted">No volume analysis data available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Supplier Performance */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">🏢 Supplier Performance</h5>
                              {analytics && analytics.supplier_performance.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th>Supplier Name</th>
                                                       <th>Total Orders</th>
                                                       <th>Total Spend</th>
                                                       <th>Avg Order Value</th>
                                                       <th>Completion Rate</th>
                                                       <th>Cancellation Rate</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.supplier_performance.map((supplier) => (
                                                       <tr key={supplier.supplier_id}>
                                                            <td className="fw-bold">{supplier.supplier_name}</td>
                                                            <td>{supplier.total_orders.toLocaleString()}</td>
                                                            <td>{currencyFormatter.format(supplier.total_spend)}</td>
                                                            <td>{currencyFormatter.format(supplier.avg_order_value)}</td>
                                                            <td>
                                                                 <span className={`badge ${(supplier.completion_rate * 100) >= 80 ? 'bg-success' : (supplier.completion_rate * 100) >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                                                      {(supplier.completion_rate * 100).toFixed(1)}%
                                                                 </span>
                                                            </td>
                                                            <td>
                                                                 <span className={`badge ${supplier.cancellation_rate === 0 ? 'bg-success' : 'bg-warning'}`}>
                                                                      {(supplier.cancellation_rate * 100).toFixed(1)}%
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

               {/* Lead Time Analysis */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">⏱️ Lead Time Analysis</h5>
                              {analytics && analytics.lead_time_analysis.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th>Order Number</th>
                                                       <th>Supplier</th>
                                                       <th>Lead Time (Days)</th>
                                                       <th>Delivery Delay</th>
                                                       <th>Status</th>
                                                       <th>On Time</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.lead_time_analysis.slice(0, 10).map((order) => (
                                                       <tr key={order.order_id}>
                                                            <td className="fw-bold">{order.order_number}</td>
                                                            <td>{order.supplier_name}</td>
                                                            <td>{order.total_lead_time}</td>
                                                            <td>
                                                                 <span className={`badge ${order.delivery_delay > 0 ? 'bg-danger' : order.delivery_delay === 0 ? 'bg-success' : 'bg-info'}`}>
                                                                      {order.delivery_delay > 0 ? `+${order.delivery_delay}` : order.delivery_delay}
                                                                 </span>
                                                            </td>
                                                            <td>
                                                                 <span className={`badge ${order.delivery_status === 'on_time' ? 'bg-success' : order.delivery_status === 'slightly_delayed' ? 'bg-warning' : 'bg-danger'}`}>
                                                                      {order.delivery_status.replace('_', ' ').toUpperCase()}
                                                                 </span>
                                                            </td>
                                                            <td>
                                                                 <span className={`badge ${order.on_time ? 'bg-success' : 'bg-danger'}`}>
                                                                      {order.on_time ? 'YES' : 'NO'}
                                                                 </span>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                        {analytics.lead_time_analysis.length > 10 && (
                                             <div className="text-center mt-3">
                                                  <small className="text-muted">Showing first 10 orders. Total: {analytics.lead_time_analysis.length}</small>
                                             </div>
                                        )}
                                   </div>
                              ) : (
                                   <div className="text-center py-4">
                                        <p className="text-muted">No lead time analysis data available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Monthly Trends and Open Orders */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-6">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">📈 Monthly Trends</h5>
                              {analytics && analytics.monthly_trends.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th>Period</th>
                                                       <th>Orders</th>
                                                       <th>Total Value</th>
                                                       <th>Avg Value</th>
                                                       <th>Completion</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.monthly_trends.map((trend, index) => (
                                                       <tr key={index}>
                                                            <td>{trend.period}</td>
                                                            <td>{trend.order_count.toLocaleString()}</td>
                                                            <td>{currencyFormatter.format(trend.total_value)}</td>
                                                            <td>{currencyFormatter.format(trend.avg_order_value)}</td>
                                                            <td>
                                                                 <span className={`badge ${(trend.completion_rate * 100) >= 80 ? 'bg-success' : 'bg-warning'}`}>
                                                                      {(trend.completion_rate * 100).toFixed(1)}%
                                                                 </span>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ) : (
                                   <div className="text-center py-4">
                                        <p className="text-muted">No monthly trends data available</p>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">📋 Open Orders</h5>
                              {analytics && analytics.open_orders.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th>Order Number</th>
                                                       <th>Supplier</th>
                                                       <th>Days Since Order</th>
                                                       <th>Status</th>
                                                       <th>Value</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.open_orders.slice(0, 5).map((order) => (
                                                       <tr key={order.order_id}>
                                                            <td className="fw-bold">{order.order_number}</td>
                                                            <td>{order.supplier_name}</td>
                                                            <td>{order.days_since_order}</td>
                                                            <td>
                                                                 <span className={`badge ${order.delivery_status === 'on_track' ? 'bg-success' : order.delivery_status === 'delayed' ? 'bg-warning' : 'bg-danger'}`}>
                                                                      {order.delivery_status.replace('_', ' ').toUpperCase()}
                                                                 </span>
                                                            </td>
                                                            <td>{currencyFormatter.format(order.total_value)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                        {analytics.open_orders.length > 5 && (
                                             <div className="text-center mt-3">
                                                  <small className="text-muted">Showing first 5 open orders. Total: {analytics.open_orders.length}</small>
                                             </div>
                                        )}
                                   </div>
                              ) : (
                                   <div className="text-center py-4">
                                        <p className="text-muted">No open orders</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Communication Analysis */}
               <div className="row g-3">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">💬 Communication Analysis</h5>
                              {analytics && analytics.communication_analysis.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-striped">
                                             <thead>
                                                  <tr>
                                                       <th>Method</th>
                                                       <th>Order Count</th>
                                                       <th>Total Value</th>
                                                       <th>Avg Order Value</th>
                                                       <th>Completion Rate</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.communication_analysis.map((comm, index) => (
                                                       <tr key={index}>
                                                            <td className="fw-bold">{comm.method.toUpperCase()}</td>
                                                            <td>{comm.order_count.toLocaleString()}</td>
                                                            <td>{currencyFormatter.format(comm.total_value)}</td>
                                                            <td>{currencyFormatter.format(comm.avg_order_value)}</td>
                                                            <td>
                                                                 <span className={`badge ${(comm.completion_rate * 100) >= 80 ? 'bg-success' : 'bg-warning'}`}>
                                                                      {(comm.completion_rate * 100).toFixed(1)}%
                                                                 </span>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ) : (
                                   <div className="text-center py-4">
                                        <p className="text-muted">No communication analysis data available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}