'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface ProcurementAnalytics {
     data: ProcurementData;
}

interface ProcurementData {
     actual_items_received: ActualItemReceived[];
     supplier_actual_spend: SupplierActualSpend[];
     item_actual_spend: ItemActualSpend[];
     supplier_fill_rate: SupplierFillRate[];
     delivery_timeliness: DeliveryTimeliness[];
     procurement_rejection_rate: ProcurementRejectionRate[];
     inventory_additions: InventoryAddition[];
     batch_expiry_analytics: BatchExpiryAnalytics[];
     monthly_procurement_cost: MonthlyProcurementCost[];
     supplier_reliability_score: SupplierReliabilityScore[];
     summary: Summary;
}

interface ActualItemReceived {
     receipt_item_id: string;
     receipt_id: string;
     receipt_number: string;
     receipt_date: string;
     order_id: string;
     supplier_id: string;
     supplier_name: string;
     order_item_id: string;
     inventory_item_id: string;
     item_name: string;
     quantity_received: number;
     quantity_rejected: number;
     unit_price: string;
     batch_number: string | null;
     expiry_date: string | null;
     total_value: string;
}

interface SupplierActualSpend {
     supplier_id: string;
     supplier_name: string;
     actual_spend: string;
     total_items_received: string;
     avg_unit_price: string;
     total_receipts: number;
}

interface ItemActualSpend {
     inventory_item_id: string;
     item_name: string;
     category: string;
     item_spend: string;
     total_received: string;
     avg_unit_price: string;
     supplier_count: number;
}

interface SupplierFillRate {
     supplier_id: string;
     supplier_name: string;
     inventory_item_id: string;
     item_name: string;
     total_received: string;
     total_ordered: string;
     fill_rate_pct: string;
}

interface DeliveryTimeliness {
     supplier_id: string;
     supplier_name: string;
     total_deliveries: number;
     on_time_deliveries: string;
     on_time_pct: string;
     avg_days_variance: string;
}

interface ProcurementRejectionRate {
     supplier_id: string;
     supplier_name: string;
     inventory_item_id: string;
     item_name: string;
     received: string;
     rejected: string;
     rejection_rate_pct: string;
}

interface InventoryAddition {
     transaction_id: string;
     transaction_date: string;
     item_id: string;
     item_name: string;
     category: string;
     quantity: number;
     unit_cost: string;
     total_value: string;
     batch_number: string;
     expiry_date: string;
     reference_id: string;
     performed_by: string;
}

interface BatchExpiryAnalytics {
     batch_number: string;
     expiry_date: string;
     total_received: string;
     inventory_item_id: string;
     item_name: string;
     days_to_expiry: number;
     expiry_status: string;
}

interface MonthlyProcurementCost {
     month: string;
     month_name: string;
     monthly_cost: string;
     total_items: string;
     supplier_count: number;
     receipt_count: number;
}

interface SupplierReliabilityScore {
     supplier_id: string;
     supplier_name: string;
     avg_on_time_score: string;
     avg_fill_rate: string;
     avg_rejection_rate: string;
     supplier_reliability_score: string;
     total_orders: number;
     total_spend: string;
}

interface Summary {
     total_procurement_spend: string;
     total_items_received: string;
     total_items_rejected: string;
     active_suppliers: number;
     total_receipts: number;
     total_orders: number;
     avg_unit_price: string;
     overall_rejection_rate: string;
}

export default function ProcurementAnalyticsPage() {
     const [analytics, setAnalytics] = useState<ProcurementAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [showFilter, setShowFilter] = useState(false);
     const [filters, setFilters] = useState({
          count: '',
          page: '',
          start_date: '',
          end_date: ''
     });

     useEffect(() => {
          loadProcurementAnalytics();
     }, []);

     const loadProcurementAnalytics = async (filterParams?: any) => {
          try {
               const params = new URLSearchParams();
               if (filterParams?.count) params.append('count', filterParams.count);
               if (filterParams?.page) params.append('page', filterParams.page);
               if (filterParams?.start_date) params.append('start_date', filterParams.start_date);
               if (filterParams?.end_date) params.append('end_date', filterParams.end_date);

               const url = `inventory/analytics/procurement${params.toString() ? '?' + params.toString() : ''}`;
               const response = await customFetch(url);
               if (response.success) {
                    setAnalytics({ data: response.data });
               } else {
                    toast.error('Failed to load procurement analytics');
               }
          } catch (error) {
               console.error('Error loading procurement analytics:', error);
               toast.error('Error loading procurement analytics');
          } finally {
               setLoading(false);
          }
     };

     const getDeliveryRateColor = (rate: number) => {
          if (rate >= 95) return 'success';
          if (rate >= 80) return 'warning';
          return 'danger';
     };

     const getScoreColor = (score: number) => {
          if (score >= 80) return 'success';
          if (score >= 60) return 'warning';
          return 'danger';
     };

     const handleFilterChange = (field: string, value: string) => {
          setFilters(prev => ({
               ...prev,
               [field]: value
          }));
     };

     const applyFilters = () => {
          loadProcurementAnalytics(filters);
          setShowFilter(false);
     };

     const clearFilters = () => {
          setFilters({
               count: '',
               page: '',
               start_date: '',
               end_date: ''
          });
          loadProcurementAnalytics();
          setShowFilter(false);
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
                         <h2 className="mb-1">🛒 Procurement Analytics</h2>
                         <p className="text-muted mb-0">Comprehensive procurement performance analysis</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setShowFilter(true)}
                         >
                              🔍 Filter
                         </button>
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => loadProcurementAnalytics()}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Summary Overview */}
               {analytics && analytics.data.summary && (
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">📊 Procurement Summary</h5>
                                   </div>
                                   <div className="card-body">
                                        <div className="row g-4">
                                             <div className="col-md-3">
                                                  <div className="text-center">
                                                       <h4 className="text-dark fw-bold">{currencyFormatter.format(Number(analytics.data.summary.total_procurement_spend))}</h4>
                                                       <small className="text-muted">💰 Total Procurement Spend</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-3">
                                                  <div className="text-center">
                                                       <h4 className="text-dark fw-bold">{parseInt(analytics.data.summary.total_items_received).toLocaleString()}</h4>
                                                       <small className="text-muted">📦 Total Items Received</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-3">
                                                  <div className="text-center">
                                                       <h4 className="text-dark fw-bold">{analytics.data.summary.active_suppliers}</h4>
                                                       <small className="text-muted">🏢 Active Suppliers</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-3">
                                                  <div className="text-center">
                                                       <h4 className="text-dark fw-bold">{analytics.data.summary.total_receipts}</h4>
                                                       <small className="text-muted">📄 Total Receipts</small>
                                                  </div>
                                             </div>
                                        </div>
                                        <hr className="my-3" />
                                        <div className="row g-4">
                                             <div className="col-md-4">
                                                  <div className="text-center">
                                                       <h6 className="text-dark">{currencyFormatter.format(Number(analytics.data.summary.avg_unit_price))}</h6>
                                                       <small className="text-muted">💵 Avg Unit Price</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="text-center">
                                                       <h6 className="text-dark">{analytics.data.summary.overall_rejection_rate}%</h6>
                                                       <small className="text-muted">❌ Overall Rejection Rate</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <div className="text-center">
                                                       <h6 className="text-dark">{analytics.data.summary.total_orders}</h6>
                                                       <small className="text-muted">📋 Total Orders</small>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Supplier Actual Spend */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">💰 Supplier Actual Spend</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.supplier_actual_spend && analytics.data.supplier_actual_spend.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Actual Spend</th>
                                                            <th>Items Received</th>
                                                            <th>Avg Unit Price</th>
                                                            <th>Total Receipts</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.supplier_actual_spend.map((supplier, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{supplier.supplier_name}</td>
                                                                 <td className="fw-bold text-dark">{currencyFormatter.format(Number(supplier.actual_spend))}</td>
                                                                 <td className="text-dark">{parseInt(supplier.total_items_received).toLocaleString()}</td>
                                                                 <td className="text-dark">{currencyFormatter.format(Number(supplier.avg_unit_price))}</td>
                                                                 <td className="text-dark">{supplier.total_receipts}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No supplier spend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Item Actual Spend */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📦 Item Actual Spend</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.item_actual_spend && analytics.data.item_actual_spend.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Item</th>
                                                            <th>Category</th>
                                                            <th>Item Spend</th>
                                                            <th>Total Received</th>
                                                            <th>Avg Unit Price</th>
                                                            <th>Supplier Count</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.item_actual_spend.map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{item.item_name}</td>
                                                                 <td className="text-muted">{item.category}</td>
                                                                 <td className="fw-bold text-dark">{currencyFormatter.format(Number(item.item_spend))}</td>
                                                                 <td className="text-dark">{parseInt(item.total_received).toLocaleString()}</td>
                                                                 <td className="text-dark">{currencyFormatter.format(Number(item.avg_unit_price))}</td>
                                                                 <td className="text-dark">{item.supplier_count}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No item spend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Supplier Fill Rate & Delivery Timeliness */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📊 Supplier Fill Rate</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.supplier_fill_rate && analytics.data.supplier_fill_rate.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-sm">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Item</th>
                                                            <th>Fill Rate</th>
                                                            <th>Received/Ordered</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.supplier_fill_rate.slice(0, 8).map((rate, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{rate.supplier_name}</td>
                                                                 <td className="text-muted">{rate.item_name}</td>
                                                                 <td>
                                                                      <span className={`badge ${parseFloat(rate.fill_rate_pct) >= 95 ? 'bg-success' : parseFloat(rate.fill_rate_pct) >= 80 ? 'bg-warning' : 'bg-danger'} text-dark`}>
                                                                           {parseFloat(rate.fill_rate_pct) >= 95 ? '✅ ' : parseFloat(rate.fill_rate_pct) >= 80 ? '⚠️ ' : '❌ '}{rate.fill_rate_pct}%
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-dark">{rate.total_received}/{rate.total_ordered}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No fill rate data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🚚 Delivery Timeliness</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.delivery_timeliness && analytics.data.delivery_timeliness.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {analytics.data.delivery_timeliness.map((delivery, index) => (
                                                  <div key={index} className="border-start border-secondary border-3 ps-2">
                                                       <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                 <div className="fw-bold text-dark">{delivery.supplier_name}</div>
                                                                 <small className="text-muted">{delivery.total_deliveries} total deliveries</small>
                                                            </div>
                                                            <div className="text-end">
                                                                 <div className="fw-bold text-dark">{delivery.on_time_pct}% on-time</div>
                                                                 <small className="text-muted">{delivery.on_time_deliveries}/{delivery.total_deliveries} deliveries</small>
                                                                 <div className="small text-muted mt-1">
                                                                      Avg variance: {delivery.avg_days_variance} days
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No delivery timeliness data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Procurement Rejection Rate & Supplier Reliability */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">❌ Procurement Rejection Rate</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.procurement_rejection_rate && analytics.data.procurement_rejection_rate.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-sm">
                                                  <thead>
                                                       <tr>
                                                            <th>Supplier</th>
                                                            <th>Item</th>
                                                            <th>Rejection Rate</th>
                                                            <th>Received/Rejected</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.procurement_rejection_rate.slice(0, 8).map((rejection, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{rejection.supplier_name}</td>
                                                                 <td className="text-muted">{rejection.item_name}</td>
                                                                 <td>
                                                                      <span className={`badge ${parseFloat(rejection.rejection_rate_pct) > 5 ? 'bg-danger' : parseFloat(rejection.rejection_rate_pct) > 2 ? 'bg-warning' : 'bg-success'} text-dark`}>
                                                                           {parseFloat(rejection.rejection_rate_pct) > 5 ? '❌ ' : parseFloat(rejection.rejection_rate_pct) > 2 ? '⚠️ ' : '✅ '}{rejection.rejection_rate_pct}%
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-dark">{rejection.received}/{rejection.rejected}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No rejection rate data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">🏆 Supplier Reliability Score</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.supplier_reliability_score && analytics.data.supplier_reliability_score.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {analytics.data.supplier_reliability_score.map((supplier, index) => (
                                                  <div key={index} className="border-start border-secondary border-3 ps-2">
                                                       <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                 <div className="fw-bold text-dark">{supplier.supplier_name}</div>
                                                                 <small className="text-muted">{supplier.total_orders} orders • {currencyFormatter.format(Number(supplier.total_spend))} spend</small>
                                                            </div>
                                                            <div className="text-end">
                                                                 <div className="fw-bold">
                                                                      <span className={`badge ${parseFloat(supplier.supplier_reliability_score) >= 80 ? 'bg-success' : parseFloat(supplier.supplier_reliability_score) >= 60 ? 'bg-warning' : 'bg-danger'} text-dark`}>
                                                                           {parseFloat(supplier.supplier_reliability_score) >= 80 ? '🏆 ' : parseFloat(supplier.supplier_reliability_score) >= 60 ? '⚠️ ' : '❌ '}{supplier.supplier_reliability_score}%
                                                                      </span>
                                                                 </div>
                                                                 <div className="small text-muted mt-1">
                                                                      On-time: {supplier.avg_on_time_score}% • Fill: {supplier.avg_fill_rate}%
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No supplier reliability data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Monthly Procurement Cost */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📈 Monthly Procurement Cost</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.monthly_procurement_cost && analytics.data.monthly_procurement_cost.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Month</th>
                                                            <th>Monthly Cost</th>
                                                            <th>Total Items</th>
                                                            <th>Supplier Count</th>
                                                            <th>Receipt Count</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.monthly_procurement_cost.map((cost, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{cost.month_name}</td>
                                                                 <td className="fw-bold text-dark">{currencyFormatter.format(Number(cost.monthly_cost))}</td>
                                                                 <td className="text-dark">{parseInt(cost.total_items).toLocaleString()}</td>
                                                                 <td className="text-dark">{cost.supplier_count}</td>
                                                                 <td className="text-dark">{cost.receipt_count}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No monthly cost data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Batch Expiry Analytics */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">⏰ Batch Expiry Analytics</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.batch_expiry_analytics && analytics.data.batch_expiry_analytics.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Batch Number</th>
                                                            <th>Item</th>
                                                            <th>Expiry Date</th>
                                                            <th>Days to Expiry</th>
                                                            <th>Status</th>
                                                            <th>Total Received</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.batch_expiry_analytics.slice(0, 10).map((batch, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{batch.batch_number}</td>
                                                                 <td className="text-muted">{batch.item_name}</td>
                                                                 <td className="text-dark">{new Date(batch.expiry_date).toLocaleDateString()}</td>
                                                                 <td className={`fw-bold ${batch.days_to_expiry <= 0 ? 'text-danger' : batch.days_to_expiry <= 7 ? 'text-warning' : 'text-dark'}`}>
                                                                      {batch.days_to_expiry <= 0 ? '❌ ' : batch.days_to_expiry <= 7 ? '⚠️ ' : '✅ '}{batch.days_to_expiry}
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge ${batch.expiry_status === 'Critical' ? 'bg-danger' : batch.expiry_status === 'Warning' ? 'bg-warning' : 'bg-success'} text-dark`}>
                                                                           {batch.expiry_status === 'Critical' ? '🚨 ' : batch.expiry_status === 'Warning' ? '⚠️ ' : '✅ '}{batch.expiry_status}
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-dark">{parseInt(batch.total_received).toLocaleString()}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No batch expiry data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Recent Inventory Additions */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📥 Recent Inventory Additions</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.inventory_additions && analytics.data.inventory_additions.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Transaction Date</th>
                                                            <th>Item</th>
                                                            <th>Category</th>
                                                            <th>Quantity</th>
                                                            <th>Unit Cost</th>
                                                            <th>Total Value</th>
                                                            <th>Batch</th>
                                                            <th>Expiry</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.inventory_additions.slice(0, 10).map((addition, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{new Date(addition.transaction_date).toLocaleDateString()}</td>
                                                                 <td className="fw-bold text-dark">{addition.item_name}</td>
                                                                 <td className="text-muted">{addition.category}</td>
                                                                 <td className="text-dark">{addition.quantity.toLocaleString()}</td>
                                                                 <td className="text-dark">{currencyFormatter.format(Number(addition.unit_cost))}</td>
                                                                 <td className="fw-bold text-dark">{currencyFormatter.format(Number(addition.total_value))}</td>
                                                                 <td className="text-muted">{addition.batch_number || 'N/A'}</td>
                                                                 <td className="text-muted">{addition.expiry_date ? new Date(addition.expiry_date).toLocaleDateString() : 'N/A'}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No inventory addition data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Recent Actual Items Received */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">📦 Recent Items Received</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.data.actual_items_received && analytics.data.actual_items_received.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Receipt Date</th>
                                                            <th>Receipt Number</th>
                                                            <th>Supplier</th>
                                                            <th>Item</th>
                                                            <th>Qty Received</th>
                                                            <th>Qty Rejected</th>
                                                            <th>Unit Price</th>
                                                            <th>Total Value</th>
                                                            <th>Batch</th>
                                                            <th>Expiry</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.data.actual_items_received.slice(0, 10).map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="fw-bold text-dark">{new Date(item.receipt_date).toLocaleDateString()}</td>
                                                                 <td className="text-dark">{item.receipt_number}</td>
                                                                 <td className="fw-bold text-dark">{item.supplier_name}</td>
                                                                 <td className="text-dark">{item.item_name}</td>
                                                                 <td className="text-dark">{item.quantity_received.toLocaleString()}</td>
                                                                 <td className={`fw-bold ${item.quantity_rejected > 0 ? 'text-danger' : 'text-dark'}`}>
                                                                      {item.quantity_rejected > 0 ? '❌ ' : ''}{item.quantity_rejected}
                                                                 </td>
                                                                 <td className="text-dark">{currencyFormatter.format(Number(item.unit_price))}</td>
                                                                 <td className="fw-bold text-dark">{currencyFormatter.format(Number(item.total_value))}</td>
                                                                 <td className="text-muted">{item.batch_number || 'N/A'}</td>
                                                                 <td className="text-muted">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No items received data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Filter Offcanvas */}
               <div className={`offcanvas offcanvas-end ${showFilter ? 'show' : ''}`} tabIndex={-1} id="filterOffcanvas">
                    <div className="offcanvas-header">
                         <h5 className="offcanvas-title">🔍 Filter Procurement Analytics</h5>
                         <button type="button" className="btn-close" onClick={() => setShowFilter(false)}></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="mb-3">
                              <label className="form-label">Count</label>
                              <div className="d-flex gap-2 mb-2">
                                   {[10, 50, 100, 1000].map((value) => (
                                        <button
                                             key={value}
                                             type="button"
                                             className={`btn btn-sm btn-outline-secondary ${filters.count === value.toString() ? 'active' : ''}`}
                                             onClick={() => handleFilterChange('count', value.toString())}
                                        >
                                             {value}
                                        </button>
                                   ))}
                              </div>
                              <input
                                   type="number"
                                   className="form-control"
                                   placeholder="Custom count"
                                   value={filters.count}
                                   onChange={(e) => handleFilterChange('count', e.target.value)}
                              />
                         </div>
                         <div className="mb-3">
                              <label className="form-label">Page</label>
                              <div className="d-flex align-items-center gap-2">
                                   <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                             const currentPage = parseInt(filters.page) || 1;
                                             if (currentPage > 1) {
                                                  handleFilterChange('page', (currentPage - 1).toString());
                                             }
                                        }}
                                   >
                                        ← Previous
                                   </button>
                                   <span className="fw-bold">Page {filters.page || 1}</span>
                                   <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                             const currentPage = parseInt(filters.page) || 1;
                                             handleFilterChange('page', (currentPage + 1).toString());
                                        }}
                                   >
                                        Next →
                                   </button>
                              </div>
                         </div>
                         <div className="mb-3">
                              <label htmlFor="start_date" className="form-label">Start Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   id="start_date"
                                   value={filters.start_date}
                                   onChange={(e) => handleFilterChange('start_date', e.target.value)}
                              />
                         </div>
                         <div className="mb-3">
                              <label htmlFor="end_date" className="form-label">End Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   id="end_date"
                                   value={filters.end_date}
                                   onChange={(e) => handleFilterChange('end_date', e.target.value)}
                              />
                         </div>
                         <div className="d-grid gap-2 mt-4">
                              <button type="button" className="btn btn-primary" onClick={applyFilters}>
                                   Apply Filters
                              </button>
                              <button type="button" className="btn btn-outline-secondary" onClick={clearFilters}>
                                   Clear Filters
                              </button>
                         </div>
                    </div>
               </div>

               {/* Backdrop */}
               {showFilter && <div className="offcanvas-backdrop show" onClick={() => setShowFilter(false)}></div>}

          </div>
     );
}