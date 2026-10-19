'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';
import { RiBox3Line, RiAlertLine, RiBarChartBoxLine, RiRefreshLine, RiInformationLine, RiArrowLeftLine, RiShieldCheckLine, RiLineChartLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';



interface StockLevelAnalytics {
     current_stock_on_hand: number;
     stock_available_for_use: number;
     stock_on_order: number;
     allocated_stock: number;
     stock_threshold_alerts: Array<{
          item_id: string;
          item_name: string;
          current_stock: number;
          min_stock: number;
          max_stock: number;
          status: string;
          alert_type: 'low_stock' | 'over_stock' | 'out_of_stock';
     }>;
     days_of_inventory_remaining: Array<{
          item_id: string;
          item_name: string;
          current_stock: number;
          daily_consumption_rate: number;
          days_remaining: number;
          status: 'critical' | 'warning' | 'normal';
     }>;
     key_terms_explanation: {
          safety_stock: string;
          reorder_point: string;
          economic_order_quantity: string;
          service_level: string;
          demand_forecasting: string;
          trend_direction: string;
          forecast_confidence: string;
          stock_out_prediction: string;
          overstock_prediction: string;
          data_quality_alerts: string;
          anomaly_types: string;
          carrying_cost: string;
          lead_time: string;
          turnover_ratio: string;
     };
     predictive_analytics: {
          stock_out_predictions: Array<{
               predicted_stock_out_date: string;
               days_until_stock_out: number;
          }>;
          overstock_predictions: Array<{
               item_id: string;
               item_name: string;
               excess_quantity: number;
               carrying_cost_impact: number;
          }>;
          safety_stock_recommendations: Array<{
               item_id: string;
               item_name: string;
               current_safety_stock: number;
               recommended_safety_stock: number;
               reasoning: string;
               interpretation: string;
          }>;
          demand_forecasting: Array<{
               item_id: string;
               item_name: string;
               avg_monthly_demand: number;
               demand_trend: number;
               trend_direction: string;
               next_month_forecast: number;
               month_2_forecast: number;
               month_3_forecast: number;
               forecast_confidence: string;
               months_of_stock_cover: number;
               interpretation: string;
          }>;
          reorder_point_optimization: Array<{
               item_id: string;
               item_name: string;
               optimized_reorder_point: number;
               economic_order_quantity: number;
               target_service_level: number;
               stock_status: string;
               interpretation: string;
          }>;
          data_quality_alerts: Array<{
               item_id: string;
               item_name: string;
               anomaly_type: string;
               description: string;
               recommended_action: string;
               severity: 'low' | 'medium' | 'high';
               interpretation: string;
          }>;
     };
}

export default function StockLevelAnalyticsPage() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [analytics, setAnalytics] = useState<StockLevelAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [modalVisible, setModalVisible] = useState(false);
     const [modalContent, setModalContent] = useState<{ title: string, interpretation: string } | null>(null);

     useEffect(() => {
          if (branchid && employeeid) {
               loadStockLevelAnalytics();
          }
     }, [branchid, employeeid]);

     const loadStockLevelAnalytics = async () => {
          try {
               const response = await customFetch(`inventory/analytics/stock-levels?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load stock level analytics');
               }
          } catch (error) {
               console.error('Error loading stock level analytics:', error);
               toast.error('Error loading stock level analytics');
          } finally {
               setLoading(false);
          }
     };

     const getAlertTypeColor = (alertType: string) => {
          switch (alertType) {
               case 'low_stock': return 'warning';
               case 'over_stock': return 'info';
               case 'out_of_stock': return 'danger';
               default: return 'secondary';
          }
     };

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'critical': return 'danger';
               case 'warning': return 'warning';
               case 'normal': return 'success';
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

     // Modal for interpretation details
     const openModal = (title: string, interpretation: string) => {
          setModalContent({ title, interpretation });
          setModalVisible(true);
     };

     const closeModal = () => {
          setModalVisible(false);
          setModalContent(null);
     };

     return (
          <>
               <div className="container-fluid p-4" data-pdf-root>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                         <div>
                              <Link href="/inventory/analytics" className="text-decoration-none d-flex align-items-center mb-2">
                                   <RiArrowLeftLine size={16} className="me-1 text-primary" />
                                   <span className="text-muted small">Back to Analytics Dashboard</span>
                              </Link>
                              <h2 className="mb-1">
                                   <RiBox3Line className="me-2 text-primary" />
                                   Stock Level Analytics
                              </h2>
                              <p className="text-muted mb-0">Comprehensive stock monitoring with predictive analytics and optimization insights</p>
                         </div>
                         <div className="d-flex gap-2">
                              <ExportPdfButton title="Stock Level Analytics" />
                              <button
                                   className="btn btn-outline-secondary btn-sm"
                                   onClick={() => openModal('Key Terms & Definitions', 'inventory_terms')}
                              >
                                   <RiInformationLine className="me-1 text-info" />
                                   Key Terms
                              </button>
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={loadStockLevelAnalytics}
                                   disabled={loading}
                              >
                                   <RiRefreshLine className="me-1 text-primary" />
                                   Refresh
                              </button>
                         </div>
                    </div>

                    {/* Stock Overview Cards */}
                    {analytics && (
                         <div className="row g-3 mb-4">
                              <div className="col-md-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiBox3Line size={20} className="me-2 text-primary" />
                                             <span className="fw-medium text-muted small">Current Stock on Hand</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-primary">{analytics.current_stock_on_hand.toLocaleString()}</div>
                                        <div className="small text-muted">Total inventory available</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiBarChartBoxLine size={20} className="me-2 text-success" />
                                             <span className="fw-medium text-muted small">Available for Use</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-success">{analytics.stock_available_for_use.toLocaleString()}</div>
                                        <div className="small text-muted">Unallocated stock</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiAlertLine size={20} className="me-2 text-info" />
                                             <span className="fw-medium text-muted small">On Order</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-info">{analytics.stock_on_order.toLocaleString()}</div>
                                        <div className="small text-muted">Pending delivery</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiBox3Line size={20} className="me-2 text-warning" />
                                             <span className="fw-medium text-muted small">Allocated Stock</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-warning">{analytics.allocated_stock.toLocaleString()}</div>
                                        <div className="small text-muted">Reserved for orders</div>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Stock Alerts and Inventory Days Row */}
                    <div className="row g-3 mb-4">
                         {/* Stock Threshold Alerts */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-3 fw-semibold">⚠️ Stock Threshold Alerts</h5>
                                   {analytics && analytics.stock_threshold_alerts.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Current Stock</th>
                                                            <th className="text-start">Min/Max Levels</th>
                                                            <th className="text-start">Status</th>
                                                            <th className="text-start">Alert Type</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.stock_threshold_alerts.map((alert, index) => (
                                                            <tr key={index}>
                                                                 <td className="text-start fw-bold text-dark">{alert.item_name}</td>
                                                                 <td className="text-start text-dark">{alert.current_stock.toLocaleString()}</td>
                                                                 <td className="text-start text-dark">
                                                                      Min: {alert.min_stock} | Max: {alert.max_stock}
                                                                 </td>
                                                                 <td className="text-start">
                                                                      <span className={`badge bg-${getStatusColor(alert.status)}`}>
                                                                           {alert.status}
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-start">
                                                                      <span className={`badge bg-${getAlertTypeColor(alert.alert_type)}`}>
                                                                           {alert.alert_type.replace('_', ' ')}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No stock threshold alerts at this time.</p>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Days of Inventory Remaining */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-3 fw-semibold">📅 Days of Inventory Remaining</h5>
                                   {analytics && analytics.days_of_inventory_remaining.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Current Stock</th>
                                                            <th className="text-start">Daily Usage</th>
                                                            <th className="text-start">Days Remaining</th>
                                                            <th className="text-start">Status</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.days_of_inventory_remaining.slice(0, 10).map((item, index) => (
                                                            <tr key={index}>
                                                                 <td className="text-start fw-bold text-dark">{item.item_name}</td>
                                                                 <td className="text-start text-dark">{item.current_stock.toLocaleString()}</td>
                                                                 <td className="text-start text-dark">{item.daily_consumption_rate.toFixed(2)}</td>
                                                                 <td className={`text-start fw-bold ${item.days_remaining < 7 ? 'text-danger' : item.days_remaining < 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {item.days_remaining.toFixed(1)}
                                                                 </td>
                                                                 <td className="text-start">
                                                                      <span className={`badge bg-${getStatusColor(item.status)}`}>
                                                                           {item.status}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No inventory days data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics - Row 1 */}
                    <div className="row g-3 mb-4">
                         {/* Stock Out Predictions */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-3 fw-semibold">🚨 Stock Out Predictions</h5>
                                   {analytics && analytics.predictive_analytics.stock_out_predictions.length > 0 ? (
                                        <div>
                                             {analytics.predictive_analytics.stock_out_predictions.slice(0, 5).map((prediction, index) => (
                                                  <div key={index} className="border rounded p-3 mb-2" style={{ borderColor: 'var(--bs-danger)', backgroundColor: 'var(--bs-light)' }}>
                                                       <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                 <strong className="text-danger">Item #{index + 1}</strong>
                                                                 <div className="small text-muted mt-1">
                                                                      {prediction.predicted_stock_out_date ?
                                                                           `Predicted stock out: ${new Date(prediction.predicted_stock_out_date).toLocaleDateString()} (${prediction.days_until_stock_out} days)` :
                                                                           `No prediction available (${prediction.days_until_stock_out} days)`}
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No stock out predictions</p>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Overstock Predictions */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-semibold">📦 Overstock Predictions</h5>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('Overstock Predictions', 'Items with excess inventory that may be costing you money in carrying costs.')}>
                                             <RiInformationLine size={14} className="text-info" />
                                        </button>
                                   </div>
                                   {analytics && analytics.predictive_analytics.overstock_predictions.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Excess Quantity</th>
                                                            <th className="text-start">Carrying Cost Impact</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.predictive_analytics.overstock_predictions.slice(0, 5).map((prediction, index) => (
                                                            <tr key={index}>
                                                                 <td className="text-start fw-bold text-dark">{prediction.item_name}</td>
                                                                 <td className="text-start text-dark">{prediction.excess_quantity.toLocaleString()}</td>
                                                                 <td className="text-start fw-bold text-dark">{currencyFormatter.format(prediction.carrying_cost_impact)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No overstock predictions</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics - Row 2 */}
                    <div className="row g-3 mb-4">
                         {/* Safety Stock Recommendations */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-semibold">🛡️ Safety Stock Recommendations</h5>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('Safety Stock Recommendations', 'Click on any row to view detailed interpretation for each recommendation.')}>
                                             <RiInformationLine size={14} className="text-info" />
                                        </button>
                                   </div>
                                   {analytics && analytics.predictive_analytics.safety_stock_recommendations.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Current</th>
                                                            <th className="text-start">Recommended</th>
                                                            <th className="text-start">Reasoning</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.predictive_analytics.safety_stock_recommendations.slice(0, 5).map((rec, index) => (
                                                            <tr key={index}
                                                                 style={{ cursor: 'pointer' }}
                                                                 onClick={() => openModal(`${rec.item_name} - Safety Stock`, rec.interpretation)}
                                                                 title="Click to view detailed interpretation">
                                                                 <td className="text-start fw-bold text-dark">{rec.item_name}</td>
                                                                 <td className="text-start text-dark">{rec.current_safety_stock}</td>
                                                                 <td className="text-start fw-bold text-dark">{rec.recommended_safety_stock}</td>
                                                                 <td className="text-start text-dark">{rec.reasoning.replace('_', ' ')}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No safety stock recommendations</p>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Demand Forecasting */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-semibold">📈 Demand Forecasting</h5>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('Demand Forecasting', 'Click on any row to view detailed interpretation for each forecast.')}>
                                             <RiInformationLine size={14} className="text-info" />
                                        </button>
                                   </div>
                                   {analytics && analytics.predictive_analytics.demand_forecasting.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Avg Monthly</th>
                                                            <th className="text-start">Trend</th>
                                                            <th className="text-start">Confidence</th>
                                                            <th className="text-start">Next Month</th>
                                                            <th className="text-start">Stock Cover</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.predictive_analytics.demand_forecasting.slice(0, 5).map((forecast, index) => (
                                                            <tr key={index}
                                                                 style={{ cursor: 'pointer' }}
                                                                 onClick={() => openModal(`${forecast.item_name} - Demand Forecast`, forecast.interpretation)}
                                                                 title="Click to view detailed interpretation">
                                                                 <td className="text-start fw-bold text-dark">{forecast.item_name}</td>
                                                                 <td className="text-start text-dark">{forecast.avg_monthly_demand.toLocaleString()}</td>
                                                                 <td className="text-start text-dark">{forecast.trend_direction}</td>
                                                                 <td className="text-start text-dark">{forecast.forecast_confidence}</td>
                                                                 <td className="text-start fw-bold text-dark">{forecast.next_month_forecast.toLocaleString()}</td>
                                                                 <td className="text-start text-dark">{forecast.months_of_stock_cover.toFixed(1)} months</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No demand forecasting data</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics - Row 3 */}
                    <div className="row g-3 mb-4">
                         {/* Reorder Point Optimization */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-semibold">🔄 Reorder Point Optimization</h5>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('Reorder Point Optimization', 'Click on any row to view detailed interpretation for each optimization.')}>
                                             <RiInformationLine size={14} className="text-info" />
                                        </button>
                                   </div>
                                   {analytics && analytics.predictive_analytics.reorder_point_optimization.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Reorder Point</th>
                                                            <th className="text-start">EOQ</th>
                                                            <th className="text-start">Service Level</th>
                                                            <th className="text-start">Status</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.predictive_analytics.reorder_point_optimization.slice(0, 5).map((optimization, index) => (
                                                            <tr key={index}
                                                                 style={{ cursor: 'pointer' }}
                                                                 onClick={() => openModal(`${optimization.item_name} - Reorder Optimization`, optimization.interpretation)}
                                                                 title="Click to view detailed interpretation">
                                                                 <td className="text-start fw-bold text-dark">{optimization.item_name}</td>
                                                                 <td className="text-start fw-bold text-dark">{optimization.optimized_reorder_point.toLocaleString()}</td>
                                                                 <td className="text-start text-dark">{optimization.economic_order_quantity.toLocaleString()}</td>
                                                                 <td className="text-start text-dark">{optimization.target_service_level.toFixed(1)}%</td>
                                                                 <td className="text-start">
                                                                      <span className={`badge bg-${getStatusColor(optimization.stock_status)}`}>
                                                                           {optimization.stock_status}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No reorder point optimization data</p>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Data Quality Alerts */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 fw-semibold">⚠️ Data Quality Alerts</h5>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openModal('Data Quality Alerts', 'Click on any row to view detailed interpretation for each alert.')}>
                                             <RiInformationLine size={14} className="text-info" />
                                        </button>
                                   </div>
                                   {analytics && analytics.predictive_analytics.data_quality_alerts.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Item</th>
                                                            <th className="text-start">Anomaly Type</th>
                                                            <th className="text-start">Description</th>
                                                            <th className="text-start">Recommended Action</th>
                                                            <th className="text-start">Severity</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.predictive_analytics.data_quality_alerts.slice(0, 5).map((alert, index) => (
                                                            <tr key={index}
                                                                 style={{ cursor: 'pointer' }}
                                                                 onClick={() => openModal(`${alert.item_name} - Data Quality Alert`, alert.interpretation)}
                                                                 title="Click to view detailed interpretation">
                                                                 <td className="text-start fw-bold text-dark">{alert.item_name}</td>
                                                                 <td className="text-start text-dark">{alert.anomaly_type.replace('_', ' ')}</td>
                                                                 <td className="text-start text-dark">{alert.description}</td>
                                                                 <td className="text-start text-dark">{alert.recommended_action.replace('_', ' ')}</td>
                                                                 <td className="text-start">
                                                                      <span className={`badge ${alert.severity === 'high' ? 'bg-danger' : alert.severity === 'medium' ? 'bg-warning' : 'bg-info'}`}>
                                                                           {alert.severity}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-start py-4">
                                             <p className="text-muted">No data quality alerts</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Modal for interpretation details */}
               {modalVisible && modalContent && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className={`modal-dialog modal-dialog-centered ${modalContent.interpretation === 'inventory_terms' ? 'modal-lg' : ''}`} onClick={(e) => e.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">{modalContent.title}</h5>
                                        <button type="button" className="btn-close" onClick={closeModal}></button>
                                   </div>
                                   <div className="modal-body">
                                        {modalContent.interpretation === 'inventory_terms' && analytics?.key_terms_explanation ? (
                                             <div>
                                                  <div className="row">
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3 d-flex align-items-center">
                                                                 <RiShieldCheckLine size={24} className="me-2 text-success" />
                                                                 Core Inventory Concepts
                                                            </h6>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiShieldCheckLine size={16} className="me-2 text-success" />
                                                                      <strong>Safety Stock:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.safety_stock}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiRefreshLine size={16} className="me-2 text-warning" />
                                                                      <strong>Reorder Point:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.reorder_point}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiBarChartBoxLine size={16} className="me-2 text-info" />
                                                                      <strong>Economic Order Quantity:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.economic_order_quantity}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiInformationLine size={16} className="me-2 text-secondary" />
                                                                      <strong>Service Level:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.service_level}</p>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3 d-flex align-items-center">
                                                                 <RiLineChartLine size={24} className="me-2 text-primary" />
                                                                 Analytics & Forecasting
                                                            </h6>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiLineChartLine size={16} className="me-2 text-primary" />
                                                                      <strong>Demand Forecasting:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.demand_forecasting}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiBarChartBoxLine size={16} className="me-2 text-success" />
                                                                      <strong>Trend Direction:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.trend_direction}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiInformationLine size={16} className="me-2 text-warning" />
                                                                      <strong>Forecast Confidence:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.forecast_confidence}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiBox3Line size={16} className="me-2 text-danger" />
                                                                      <strong>Carrying Cost:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.carrying_cost}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <div className="row mt-3">
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3 d-flex align-items-center">
                                                                 <RiAlertLine size={24} className="me-2 text-warning" />
                                                                 Predictions & Alerts
                                                            </h6>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiAlertLine size={16} className="me-2 text-warning" />
                                                                      <strong>Stock Out Prediction:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.stock_out_prediction}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiBox3Line size={16} className="me-2 text-danger" />
                                                                      <strong>Overstock Prediction:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.overstock_prediction}</p>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3 d-flex align-items-center">
                                                                 <RiBox3Line size={24} className="me-2 text-info" />
                                                                 Data Quality & Metrics
                                                            </h6>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiAlertLine size={16} className="me-2 text-warning" />
                                                                      <strong>Data Quality Alerts:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.data_quality_alerts}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiBarChartBoxLine size={16} className="me-2 text-info" />
                                                                      <strong>Anomaly Types:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.anomaly_types}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary-subtle rounded p-3">
                                                                 <div className="d-flex align-items-center mb-1">
                                                                      <RiRefreshLine size={16} className="me-2 text-secondary" />
                                                                      <strong>Lead Time:</strong>
                                                                 </div>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.lead_time}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : (
                                             <p>{modalContent.interpretation}</p>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </>
     );
}