'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { RiInformationLine } from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';



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
               <div className="container-fluid p-4">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                         <div>
                              <Link href="/inventory/analytics" className="text-decoration-none">
                                   <span className="text-muted">← Back to Analytics Dashboard</span>
                              </Link>
                              <h2 className="mb-1">📈 Stock Level Analytics</h2>
                              <p className="text-muted mb-0">Comprehensive stock monitoring with AI-powered predictive analytics and optimization insights</p>
                         </div>
                         <div className="d-flex gap-2">
                              <button
                                   className="btn btn-outline-secondary"
                                   onClick={() => openModal('Key Terms & Definitions', 'inventory_terms')}
                              >
                                   📚 Key Terms
                              </button>
                              <button
                                   className="btn btn-outline-primary"
                                   onClick={loadStockLevelAnalytics}
                              >
                                   ↻ Refresh
                              </button>
                         </div>
                    </div>

                    {/* Stock Overview Cards */}
                    {analytics && (
                         <div className="row g-3 mb-4">
                              <div className="col-md-3">
                                   <div className="card h-100">
                                        <div className="card-body text-center">
                                             <h3 className="text-primary">{analytics.current_stock_on_hand.toLocaleString()}</h3>
                                             <p className="text-muted mb-0">Current Stock on Hand</p>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="card h-100">
                                        <div className="card-body text-center">
                                             <h3 className="text-success">{analytics.stock_available_for_use.toLocaleString()}</h3>
                                             <p className="text-muted mb-0">Available for Use</p>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="card h-100">
                                        <div className="card-body text-center">
                                             <h3 className="text-info">{analytics.stock_on_order.toLocaleString()}</h3>
                                             <p className="text-muted mb-0">On Order</p>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="card h-100">
                                        <div className="card-body text-center">
                                             <h3 className="text-warning">{analytics.allocated_stock.toLocaleString()}</h3>
                                             <p className="text-muted mb-0">Allocated Stock</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Stock Alerts and Inventory Days Row */}
                    <div className="row g-3 mb-4">
                         {/* Stock Threshold Alerts */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">🚨 Stock Threshold Alerts</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.stock_threshold_alerts.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Current Stock</th>
                                                                 <th>Min/Max Levels</th>
                                                                 <th>Status</th>
                                                                 <th>Alert Type</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.stock_threshold_alerts.map((alert, index) => (
                                                                 <tr key={index}>
                                                                      <td className="fw-bold">{alert.item_name}</td>
                                                                      <td className="text-center">{alert.current_stock.toLocaleString()}</td>
                                                                      <td>
                                                                           Min: {alert.min_stock} | Max: {alert.max_stock}
                                                                      </td>
                                                                      <td>
                                                                           <span className={`badge bg-${getStatusColor(alert.status)}`}>
                                                                                {alert.status}
                                                                           </span>
                                                                      </td>
                                                                      <td>
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
                                             <div className="alert alert-success">
                                                  <strong>✅ All Clear!</strong> No stock threshold alerts at this time.
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* Days of Inventory Remaining */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">📅 Days of Inventory Remaining</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.days_of_inventory_remaining.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Current Stock</th>
                                                                 <th>Daily Usage</th>
                                                                 <th>Days Remaining</th>
                                                                 <th>Status</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.days_of_inventory_remaining.slice(0, 10).map((item, index) => (
                                                                 <tr key={index}>
                                                                      <td className="fw-bold">{item.item_name}</td>
                                                                      <td>{item.current_stock.toLocaleString()}</td>
                                                                      <td>{item.daily_consumption_rate.toFixed(2)}</td>
                                                                      <td className={`fw-bold ${item.days_remaining < 7 ? 'text-danger' : item.days_remaining < 30 ? 'text-warning' : 'text-success'}`}>
                                                                           {item.days_remaining.toFixed(1)}
                                                                      </td>
                                                                      <td>
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
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No inventory days data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics - Row 1 */}
                    <div className="row g-3 mb-4">
                         {/* Stock Out Predictions Card */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">⚠️ Stock Out Predictions</h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.predictive_analytics.stock_out_predictions.length > 0 ? (
                                             <div>
                                                  {analytics.predictive_analytics.stock_out_predictions.slice(0, 5).map((prediction, index) => (
                                                       <div key={index} className="alert alert-danger py-2 mb-2">
                                                            <strong>Item #{index + 1}</strong><br />
                                                            {prediction.predicted_stock_out_date ?
                                                                 `Predicted stock out: ${new Date(prediction.predicted_stock_out_date).toLocaleDateString()} (${prediction.days_until_stock_out} days)` :
                                                                 `No prediction available (${prediction.days_until_stock_out} days)`}
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="alert alert-success py-2">
                                                  No stock out predictions
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* Overstock Predictions Card */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">
                                             📦 Overstock Predictions
                                             <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => openModal('Overstock Predictions', 'Items with excess inventory that may be costing you money in carrying costs.')}>
                                                  <RiInformationLine size={14} />
                                             </button>
                                        </h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.predictive_analytics.overstock_predictions.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Excess Quantity</th>
                                                                 <th>Carrying Cost Impact</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.predictive_analytics.overstock_predictions.slice(0, 5).map((prediction, index) => (
                                                                 <tr key={index}>
                                                                      <td className="fw-bold">{prediction.item_name}</td>
                                                                      <td>{prediction.excess_quantity.toLocaleString()}</td>
                                                                      <td>{currencyFormatter.format(prediction.carrying_cost_impact)}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="alert alert-success py-2">
                                                  No overstock predictions
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics - Row 2 */}
                    <div className="row g-3 mb-4">
                         {/* Safety Stock Recommendations Card */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">
                                             📊 Safety Stock Recommendations
                                             <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => openModal('Safety Stock Recommendations', 'Click on any row to view detailed interpretation for each recommendation.')}>
                                                  <RiInformationLine size={14} />
                                             </button>
                                        </h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.predictive_analytics.safety_stock_recommendations.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Current</th>
                                                                 <th>Recommended</th>
                                                                 <th>Reasoning</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.predictive_analytics.safety_stock_recommendations.slice(0, 5).map((rec, index) => (
                                                                 <tr key={index}
                                                                      style={{ cursor: 'pointer' }}
                                                                      onClick={() => openModal(`${rec.item_name} - Safety Stock`, rec.interpretation)}
                                                                      title="Click to view detailed interpretation">
                                                                      <td className="fw-bold">{rec.item_name}</td>
                                                                      <td>{rec.current_safety_stock}</td>
                                                                      <td>{rec.recommended_safety_stock}</td>
                                                                      <td>{rec.reasoning.replace('_', ' ')}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="alert alert-secondary py-2">
                                                  No safety stock recommendations
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* Demand Forecasting Card */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">
                                             📈 Demand Forecasting
                                             <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => openModal('Demand Forecasting', 'Click on any row to view detailed interpretation for each forecast.')}>
                                                  <RiInformationLine size={14} />
                                             </button>
                                        </h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.predictive_analytics.demand_forecasting.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Avg Monthly</th>
                                                                 <th>Trend</th>
                                                                 <th>Confidence</th>
                                                                 <th>Next Month</th>
                                                                 <th>Stock Cover</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.predictive_analytics.demand_forecasting.slice(0, 5).map((forecast, index) => (
                                                                 <tr key={index}
                                                                      style={{ cursor: 'pointer' }}
                                                                      onClick={() => openModal(`${forecast.item_name} - Demand Forecast`, forecast.interpretation)}
                                                                      title="Click to view detailed interpretation">
                                                                      <td className="fw-bold">{forecast.item_name}</td>
                                                                      <td>{forecast.avg_monthly_demand.toLocaleString()}</td>
                                                                      <td>{forecast.trend_direction}</td>
                                                                      <td>{forecast.forecast_confidence}</td>
                                                                      <td>{forecast.next_month_forecast.toLocaleString()}</td>
                                                                      <td>{forecast.months_of_stock_cover.toFixed(1)} months</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="alert alert-secondary py-2">
                                                  No demand forecasting data
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Predictive Analytics - Row 3 */}
                    <div className="row g-3 mb-4">
                         {/* Reorder Point Optimization Card */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">
                                             🔄 Reorder Point Optimization
                                             <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => openModal('Reorder Point Optimization', 'Click on any row to view detailed interpretation for each optimization.')}>
                                                  <RiInformationLine size={14} />
                                             </button>
                                        </h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.predictive_analytics.reorder_point_optimization.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Reorder Point</th>
                                                                 <th>EOQ</th>
                                                                 <th>Service Level</th>
                                                                 <th>Status</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.predictive_analytics.reorder_point_optimization.slice(0, 5).map((optimization, index) => (
                                                                 <tr key={index}
                                                                      style={{ cursor: 'pointer' }}
                                                                      onClick={() => openModal(`${optimization.item_name} - Reorder Optimization`, optimization.interpretation)}
                                                                      title="Click to view detailed interpretation">
                                                                      <td className="fw-bold">{optimization.item_name}</td>
                                                                      <td>{optimization.optimized_reorder_point.toLocaleString()}</td>
                                                                      <td>{optimization.economic_order_quantity.toLocaleString()}</td>
                                                                      <td>{optimization.target_service_level.toFixed(1)}%</td>
                                                                      <td>
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
                                             <div className="alert alert-secondary py-2">
                                                  No reorder point optimization data
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* Data Quality Alerts Card */}
                         <div className="col-lg-6">
                              <div className="card">
                                   <div className="card-header py-2">
                                        <h5 className="mb-0">
                                             🔍 Data Quality Alerts
                                             <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => openModal('Data Quality Alerts', 'Click on any row to view detailed interpretation for each alert.')}>
                                                  <RiInformationLine size={14} />
                                             </button>
                                        </h5>
                                   </div>
                                   <div className="card-body">
                                        {analytics && analytics.predictive_analytics.data_quality_alerts.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Anomaly Type</th>
                                                                 <th>Description</th>
                                                                 <th>Recommended Action</th>
                                                                 <th>Severity</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.predictive_analytics.data_quality_alerts.slice(0, 5).map((alert, index) => (
                                                                 <tr key={index}
                                                                      style={{ cursor: 'pointer' }}
                                                                      onClick={() => openModal(`${alert.item_name} - Data Quality Alert`, alert.interpretation)}
                                                                      title="Click to view detailed interpretation">
                                                                      <td className="fw-bold">{alert.item_name}</td>
                                                                      <td>{alert.anomaly_type.replace('_', ' ')}</td>
                                                                      <td>{alert.description}</td>
                                                                      <td>{alert.recommended_action.replace('_', ' ')}</td>
                                                                      <td>
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
                                             <div className="alert alert-success py-2">
                                                  No data quality alerts
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Modal for interpretation details */}
               {modalVisible && modalContent && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
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
                                                            <h6 className="mb-3">Core Inventory Concepts</h6>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Safety Stock:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.safety_stock}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Reorder Point:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.reorder_point}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Economic Order Quantity:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.economic_order_quantity}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Service Level:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.service_level}</p>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Analytics & Forecasting</h6>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Demand Forecasting:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.demand_forecasting}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Trend Direction:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.trend_direction}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Forecast Confidence:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.forecast_confidence}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Carrying Cost:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.carrying_cost}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <div className="row mt-3">
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Predictions & Alerts</h6>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Stock Out Prediction:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.stock_out_prediction}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Overstock Prediction:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.overstock_prediction}</p>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Data Quality & Metrics</h6>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Data Quality Alerts:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.data_quality_alerts}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Anomaly Types:</strong>
                                                                 <p className="text-muted mb-2">{analytics.key_terms_explanation.anomaly_types}</p>
                                                            </div>
                                                            <div className="mb-3 border border-secondary rounded p-3">
                                                                 <strong>Lead Time:</strong>
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