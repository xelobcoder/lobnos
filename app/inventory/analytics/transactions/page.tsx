'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

interface TransactionAnalytics {
     executive_summary: {
          total_inventory_value: number;
          monthly_transaction_volume: number;
          inventory_turnover_ratio: number;
          stockout_risk_level: string;
          supplier_performance_score: number;
          cost_efficiency_rating: string;
     };
     financial_impact: {
          total_transaction_value: number;
          average_transaction_value: number;
          cost_savings_opportunities: number;
          budget_impact_alerts: string;
          profitability_indicators: {
               high_value_transactions: number;
               cost_per_unit_trend: number;
               volume_vs_cost_efficiency: number;
          };
     };
     operational_efficiency: {
          transaction_processing_speed: number;
          inventory_accuracy_score: number;
          process_bottlenecks: string;
          automation_opportunities: number;
          efficiency_trends: {
               transaction_volume_trend: string;
               error_rate: number;
               processing_time_efficiency: string;
          };
     };
     risk_management: {
          critical_alerts: string[];
          stockout_prevention_score: string;
          supplier_reliability_score: number;
          compliance_risks: number;
          financial_risks: string;
          operational_risks: string;
     };
     business_insights: {
          top_opportunities: string[];
          immediate_actions_needed: string[];
          strategic_recommendations: string[];
          cost_optimization_targets: Array<{
               reason: string;
               potential_savings: number;
               priority: string;
          }>;
     };
     key_performance_indicators: {
          transactions_per_day: number;
          inventory_turnover_days: number;
          supplier_performance_rating: string;
          process_efficiency_score: number;
          cost_effectiveness_rating: string;
     };
     detailed_analytics: {
          core_metrics: {
               transaction_volume: {
                    total_transactions: number;
                    total_quantity_moved: number;
                    avg_quantity_per_transaction: number;
                    total_transaction_value: number;
               };
               transaction_type_distribution: {
                    consumption: number;
                    addition: number;
                    wastage: number;
                    adjustment: number;
                    transfer: number;
               };
               cost_analysis: {
                    addition_cost: number;
                    avg_addition_unit_cost: number;
               };
          };
          time_pattern_analysis: {
               daily_patterns: Array<{
                    date: string;
                    transaction_count: number;
                    total_quantity: number;
               }>;
               peak_hours: Array<{
                    hour: number;
                    transaction_count: number;
               }>;
          };
          high_volume_transactions: Array<{
               date: string;
               transaction_count: number;
               total_quantity: number;
               total_cost: number;
               unique_items_affected: number;
               volume_category: string;
               cost_category: string;
               transaction_breakdown: {
                    wastage: number;
                    consumption: number;
                    addition: number;
                    adjustment: number;
               };
               quantity_breakdown: {
                    wastage_quantity: number;
                    consumption_quantity: number;
                    addition_quantity: number;
               };
               notable_wastage: string[];
          }>;
     };
}

export default function TransactionAnalyticsPage() {
     const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [showFilters, setShowFilters] = useState(false);
     const [modalVisible, setModalVisible] = useState(false);
     const [modalContent, setModalContent] = useState<{ title: string, content: string } | null>(null);
     const [chartView, setChartView] = useState<"line" | "bar" | "area">("line");
     const [filters, setFilters] = useState({
          start_date: '',
          end_date: ''
     });

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (branchid && employeeid) {
               loadTransactionAnalytics();
          }
     }, [branchid, employeeid, filters]);

     const loadTransactionAnalytics = async () => {
          try {
               const queryParams = new URLSearchParams();

               // Add filters to query params
               Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                         queryParams.append(key, value);
                    }
               });

               // Add required parameters
               queryParams.append('branchid', branchid);
               queryParams.append('employeeid', employeeid);

               const response = await customFetch(`inventory/analytics/transactions?${queryParams.toString()}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load transaction analytics');
               }
          } catch (error) {
               console.error('Error loading transaction analytics:', error);
               toast.error('Error loading transaction analytics');
          } finally {
               setLoading(false);
          }
     };

     const openModal = (title: string, content: string) => {
          setModalVisible(true);
          setModalContent({ title, content });
     };

     const closeModal = () => {
          setModalVisible(false);
          setModalContent(null);
     };

     const getTransactionTypeColor = (type: string) => {
          switch (type) {
               case 'additions': return 'success';
               case 'consumptions': return 'warning';
               case 'adjustments': return 'info';
               default: return 'primary';
          }
     };

     const getTransactionTypeLabel = (type: string) => {
          switch (type) {
               case 'additions': return 'Additions';
               case 'consumptions': return 'Consumptions';
               case 'adjustments': return 'Adjustments';
               default: return type;
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
               {/* Header - Intelligence Style */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none">
                              <span className="text-muted">← Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">🔄 Transaction Analytics</h2>
                         <p className="text-muted mb-0">Comprehensive inventory transaction patterns and trends</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setShowFilters(true)}
                         >
                              🔍 Filters
                         </button>
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={loadTransactionAnalytics}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Transaction Summary - Intelligence Style */}
               {analytics && (
                    <div className="mb-3 bg-light p-2">
                         {/* Header */}
                         <div className="bg-light py-1 px-2 mb-2">
                              <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                   TRANSACTION SUMMARY | ANALYTICS OVERVIEW
                              </h6>
                         </div>

                         {/* Classification Header */}
                         <div className="mb-2 pb-1 border-bottom border-light">
                              <div className="d-flex justify-content-between align-items-center">
                                   <div>
                                        <span className="fw-bold me-2" style={{ fontSize: '0.9rem' }}>PERIOD: All Time</span>
                                        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>TOTAL: {analytics.detailed_analytics.core_metrics.transaction_volume.total_transactions.toLocaleString()}</span>
                                   </div>
                              </div>
                         </div>

                         {/* Summary Cards Row */}
                         <div className="row g-2">
                              <div className="col-md-2">
                                   <div className="border border-light bg-white p-2 text-center">
                                        <div className="fw-bold" style={{ fontSize: '1.2rem' }}>{analytics.detailed_analytics.core_metrics.transaction_volume.total_transactions.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>TOTAL TRANSACTIONS</small>
                                   </div>
                              </div>
                              <div className="col-md-2">
                                   <div className="border border-light bg-white p-2 text-center">
                                        <div className="fw-bold text-success" style={{ fontSize: '1.2rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.addition.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>ADDITIONS</small>
                                   </div>
                              </div>
                              <div className="col-md-2">
                                   <div className="border border-light bg-white p-2 text-center">
                                        <div className="fw-bold text-warning" style={{ fontSize: '1.2rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.consumption.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>CONSUMPTIONS</small>
                                   </div>
                              </div>
                              <div className="col-md-2">
                                   <div className="border border-light bg-white p-2 text-center">
                                        <div className="fw-bold text-danger" style={{ fontSize: '1.2rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.wastage.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>WASTAGE</small>
                                   </div>
                              </div>
                              <div className="col-md-2">
                                   <div className="border border-light bg-white p-2 text-center">
                                        <div className="fw-bold text-info" style={{ fontSize: '1.2rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.adjustment.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>ADJUSTMENTS</small>
                                   </div>
                              </div>
                              <div className="col-md-2">
                                   <div className="border border-light bg-white p-2 text-center">
                                        <div className="fw-bold text-secondary" style={{ fontSize: '1.2rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.transfer.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>TRANSFERS</small>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Core Metrics - Intelligence Style */}
               {analytics && analytics.detailed_analytics.core_metrics && (
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="mb-3 bg-light p-2">
                                   {/* Header */}
                                   <div className="bg-light py-1 px-2 mb-3">
                                        <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                             📊 CORE METRICS | TRANSACTION VOLUME ANALYSIS
                                        </h6>
                                   </div>

                                   {/* Classification Header */}
                                   <div className="mb-3 pb-1 border-bottom border-light">
                                        <div className="d-flex justify-content-between align-items-center">
                                             <div>
                                                  <span className="fw-bold me-2" style={{ fontSize: '0.9rem' }}>PERIOD: All Time</span>
                                                  <span className="fw-bold" style={{ fontSize: '0.9rem' }}>ACTIVE DAYS: N/A</span>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="row g-3">
                                        {/* Transaction Volume */}
                                        <div className="col-md-6">
                                             <div className="border border-light bg-white p-3">
                                                  <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                       📈 Transaction Volume
                                                  </h6>
                                                  <div className="row g-2">
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_volume.total_transactions.toLocaleString()}</div>
                                                                 <small className="text-muted">Total Transactions</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_volume.total_quantity_moved.toLocaleString()}</div>
                                                                 <small className="text-muted">Total Quantity</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-info" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_volume.avg_quantity_per_transaction.toFixed(1)}</div>
                                                                 <small className="text-muted">Avg Qty/Transaction</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-warning" style={{ fontSize: '1.1rem' }}>{currencyFormatter.format(analytics.detailed_analytics.core_metrics.transaction_volume.total_transaction_value)}</div>
                                                                 <small className="text-muted">Total Value</small>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Transaction Type Distribution */}
                                        <div className="col-md-6">
                                             <div className="border border-light bg-white p-3">
                                                  <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                       🎯 Transaction Types
                                                  </h6>
                                                  <div className="row g-2">
                                                       <div className="col-4">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-success" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.addition}</div>
                                                                 <small className="text-muted">Additions</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-4">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-warning" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.consumption}</div>
                                                                 <small className="text-muted">Consumptions</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-4">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.wastage}</div>
                                                                 <small className="text-muted">Wastage</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-info" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.adjustment}</div>
                                                                 <small className="text-muted">Adjustments</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-secondary" style={{ fontSize: '1.1rem' }}>{analytics.detailed_analytics.core_metrics.transaction_type_distribution.transfer}</div>
                                                                 <small className="text-muted">Transfers</small>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Operational Efficiency - Intelligence Style */}
               {analytics && analytics.operational_efficiency && (
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="mb-3 bg-light p-2">
                                   {/* Header */}
                                   <div className="bg-light py-1 px-2 mb-3">
                                        <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                             ⚡ OPERATIONAL EFFICIENCY | PROCESS METRICS
                                        </h6>
                                   </div>

                                   <div className="row g-3">
                                        {/* Processing Speed */}
                                        <div className="col-md-6">
                                             <div className="border border-light bg-white p-3">
                                                  <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                       📅 Processing Metrics
                                                  </h6>
                                                  <div className="row g-2">
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-primary" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.transaction_processing_speed.toFixed(1)}</div>
                                                                 <small className="text-muted">Avg Processing Speed</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-success" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.inventory_accuracy_score}%</div>
                                                                 <small className="text-muted">Accuracy Score</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-warning" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.automation_opportunities}</div>
                                                                 <small className="text-muted">Automation Opportunities</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-info" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.efficiency_trends.error_rate}%</div>
                                                                 <small className="text-muted">Error Rate</small>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Efficiency Trends */}
                                        <div className="col-md-6">
                                             <div className="border border-light bg-white p-3">
                                                  <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                       📦 Efficiency Trends
                                                  </h6>
                                                  <div className="row g-2">
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-primary" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.efficiency_trends.transaction_volume_trend}</div>
                                                                 <small className="text-muted">Volume Trend</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-success" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.efficiency_trends.processing_time_efficiency}</div>
                                                                 <small className="text-muted">Processing Efficiency</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-warning" style={{ fontSize: '1rem' }}>{analytics.operational_efficiency.process_bottlenecks}</div>
                                                                 <small className="text-muted">Bottlenecks</small>
                                                            </div>
                                                       </div>
                                                       <div className="col-6">
                                                            <div className="text-center p-2 bg-light rounded">
                                                                 <div className="fw-bold text-info" style={{ fontSize: '1rem' }}>{analytics.key_performance_indicators.process_efficiency_score}%</div>
                                                                 <small className="text-muted">Efficiency Score</small>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}



               {/* Time Pattern Analysis - Intelligence Style */}
               {analytics && analytics.detailed_analytics.time_pattern_analysis && (
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="mb-3 bg-light p-2">
                                   {/* Header */}
                                   <div className="bg-light py-1 px-2 mb-3">
                                        <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                             🕐 TIME PATTERN ANALYSIS | ACTIVITY TIMING
                                        </h6>
                                   </div>

                                   <div className="row g-3" style={{ minHeight: '400px' }}>
                                        {/* Peak Hours */}
                                        <div className="col-md-6">
                                             <div className="card h-100">
                                                  <div className="card-header d-flex justify-content-between align-items-center">
                                                       <h6 className="card-title mb-0">🕐 Peak Hours of Transactions</h6>
                                                       <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => openModal('Peak Hours Chart', 'peak_hours_chart')}
                                                            title="View Chart"
                                                       >
                                                            📊
                                                       </button>
                                                  </div>
                                                  <div className="card-body" style={{ overflowY: 'auto', maxHeight: '400px' }}>
                                                       <div className="table-responsive">
                                                            <table className="table table-striped">
                                                                 <thead>
                                                                      <tr>
                                                                           <th>Hour</th>
                                                                           <th className="text-center">Transactions</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {analytics.detailed_analytics.time_pattern_analysis.peak_hours
                                                                           .sort((a, b) => b.transaction_count - a.transaction_count)
                                                                           .map((pattern, index) => (
                                                                                <tr key={index}>
                                                                                     <td>{pattern.hour}:00</td>
                                                                                     <td className="text-center fw-bold">{pattern.transaction_count}</td>
                                                                                </tr>
                                                                           ))}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Daily Patterns */}
                                        <div className="col-md-6">
                                             <div className="card h-100">
                                                  <div className="card-header d-flex justify-content-between align-items-center">
                                                       <h6 className="card-title mb-0">📅 Daily Activity</h6>
                                                       <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => openModal('Daily Activity Chart', 'daily_activity_chart')}
                                                            title="View Chart"
                                                       >
                                                            📊
                                                       </button>
                                                  </div>
                                                  <div className="card-body" style={{ overflowY: 'auto', maxHeight: '400px' }}>
                                                       <div className="table-responsive">
                                                            <table className="table table-striped">
                                                                 <thead>
                                                                      <tr>
                                                                           <th>Day</th>
                                                                           <th className="text-center">Transactions</th>
                                                                           <th className="text-end">Quantity</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {analytics.detailed_analytics.time_pattern_analysis.daily_patterns.map((pattern, index) => (
                                                                           <tr key={index}>
                                                                                <td>{new Date(pattern.date).toLocaleDateString()}</td>
                                                                                <td className="text-center fw-bold">{pattern.transaction_count}</td>
                                                                                <td className="text-end">{pattern.total_quantity.toLocaleString()}</td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}







               {/* High Volume Transactions - Intelligence Style */}
               {analytics && analytics.detailed_analytics.high_volume_transactions && analytics.detailed_analytics.high_volume_transactions.length > 0 && (
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="mb-3 bg-light p-2">
                                   {/* Header */}
                                   <div className="bg-light py-1 px-2 mb-3">
                                        <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                             🚀 HIGH VOLUME TRANSACTIONS | MAJOR ACTIVITY LOG
                                        </h6>
                                   </div>

                                   <div className="card">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                             <h6 className="card-title mb-0">🚀 High Volume Transactions | Major Activity Log</h6>
                                             <button
                                                  className="btn btn-outline-primary btn-sm"
                                                  onClick={() => openModal('High Volume Transactions Chart', 'high_volume_transactions_chart')}
                                                  title="View Chart"
                                             >
                                                  📊
                                             </button>
                                        </div>
                                        <div className="card-body">
                                             <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                  <table className="table table-striped">
                                                       <thead className="sticky-top">
                                                            <tr>
                                                                 <th>Date</th>
                                                                 <th className="text-center">Transactions</th>
                                                                 <th className="text-end">Total Quantity</th>
                                                                 <th className="text-end">Total Cost</th>
                                                                 <th className="text-center">Volume Category</th>
                                                                 <th className="text-center">Cost Category</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.detailed_analytics.high_volume_transactions.map((transaction, index) => (
                                                                 <tr key={index}>
                                                                      <td>
                                                                           {new Date(transaction.date).toLocaleDateString()}
                                                                      </td>
                                                                      <td className="text-center">
                                                                           {transaction.transaction_count}
                                                                      </td>
                                                                      <td className="text-end">
                                                                           {transaction.total_quantity.toLocaleString()}
                                                                      </td>
                                                                      <td className="text-end">
                                                                           {currencyFormatter.format(transaction.total_cost)}
                                                                      </td>
                                                                      <td className="text-center">
                                                                           {transaction.volume_category}
                                                                      </td>
                                                                      <td className="text-center">
                                                                           {transaction.cost_category}
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                        <div className="card-footer text-center">
                                             <small className="text-muted">
                                                  🚀 HIGH VOLUME ANALYSIS COMPLETE | {analytics.detailed_analytics.high_volume_transactions.length} MAJOR TRANSACTIONS TRACKED
                                             </small>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}







               {/* Filters Offcanvas - Intelligence Style */}
               <Offcanvas
                    show={showFilters}
                    onHide={() => setShowFilters(false)}
                    placement="end"
               >
                    <Offcanvas.Header closeButton className="bg-light border-bottom">
                         <Offcanvas.Title className="text-uppercase fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                              🔍 Transaction Filters | Analysis Parameters
                         </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="bg-light">
                         <div className="mb-3 pb-1 border-bottom border-light">
                              <div className="d-flex justify-content-between align-items-center">
                                   <div>
                                        <span className="fw-bold" style={{ fontSize: '0.8rem' }}>CONFIGURATION</span>
                                   </div>
                                   <small className="text-muted" style={{ fontSize: '0.8rem' }}>FILTER SETTINGS</small>
                              </div>
                         </div>

                         <div className="row g-3">
                              <div className="col-12">
                                   <div className="border border-light bg-white p-3 rounded">
                                        <label className="form-label fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Start Date</label>
                                        <input
                                             type="date"
                                             className="form-control"
                                             value={filters.start_date}
                                             onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                        />
                                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>Analysis period start</small>
                                   </div>
                              </div>
                              <div className="col-12">
                                   <div className="border border-light bg-white p-3 rounded">
                                        <label className="form-label fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>End Date</label>
                                        <input
                                             type="date"
                                             className="form-control"
                                             value={filters.end_date}
                                             onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                        />
                                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>Analysis period end</small>
                                   </div>
                              </div>
                         </div>
                    </Offcanvas.Body>
                    <div className="offcanvas-footer p-3 border-top bg-light">
                         <div className="d-flex gap-2 w-100">
                              <button
                                   className="btn btn-primary flex-fill fw-bold"
                                   onClick={() => {
                                        loadTransactionAnalytics();
                                        setShowFilters(false);
                                   }}
                              >
                                   Apply Filters
                              </button>
                              <button
                                   className="btn btn-outline-secondary flex-fill fw-bold"
                                   onClick={() => {
                                        setFilters({
                                             start_date: '',
                                             end_date: ''
                                        });
                                        loadTransactionAnalytics();
                                        setShowFilters(false);
                                   }}
                              >
                                   Clear All
                              </button>
                         </div>
                         <div className="text-center mt-2">
                              <small className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>
                                   🔍 FILTERS WILL REFRESH ANALYTICS DATA
                              </small>
                         </div>
                    </div>
               </Offcanvas>

               {/* Modal for Charts */}
               {modalVisible && modalContent && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
                         <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header bg-light">
                                        <h5 className="modal-title">{modalContent.title}</h5>
                                        <button type="button" className="btn-close" onClick={closeModal}></button>
                                   </div>
                                   <div className="modal-body">
                                        {modalContent.content === 'transaction_trends_chart' && analytics?.detailed_analytics ? (
                                             <div>
                                                  <div className="mb-4">
                                                       <div className="bg-light p-3 rounded">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                 <h6 className="mb-0 text-primary fw-bold">📊 Transaction Analytics Overview</h6>
                                                                 <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('line')}
                                                                      >
                                                                           Line
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('bar')}
                                                                      >
                                                                           Bar
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'area' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('area')}
                                                                      >
                                                                           Area
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                            <ResponsiveContainer width="100%" height={400}>
                                                                 {chartView === 'line' ? (
                                                                      <LineChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.daily_patterns}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="transaction_count"
                                                                                stroke="#28a745"
                                                                                strokeWidth={3}
                                                                                name="Transactions"
                                                                                dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#28a745', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="total_quantity"
                                                                                stroke="#dc3545"
                                                                                strokeWidth={3}
                                                                                name="Total Quantity"
                                                                                dot={{ fill: '#dc3545', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#dc3545', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                      </LineChart>
                                                                 ) : chartView === 'bar' ? (
                                                                      <BarChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.daily_patterns}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="rect"
                                                                           />
                                                                           <Bar dataKey="transaction_count" fill="#28a745" name="Transactions" radius={[4, 4, 0, 0]} />
                                                                           <Bar dataKey="total_quantity" fill="#dc3545" name="Total Quantity" radius={[4, 4, 0, 0]} />
                                                                      </BarChart>
                                                                 ) : (
                                                                      <AreaChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.daily_patterns}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <defs>
                                                                                <linearGradient id="transactionsGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#28a745" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#28a745" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                                <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#dc3545" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#dc3545" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                           </defs>
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Area type="monotone" dataKey="transaction_count" stroke="#28a745" fill="url(#transactionsGradient)" name="Transactions" strokeWidth={2} />
                                                                           <Area type="monotone" dataKey="total_quantity" stroke="#dc3545" fill="url(#quantityGradient)" name="Total Quantity" strokeWidth={2} />
                                                                      </AreaChart>
                                                                 )}
                                                            </ResponsiveContainer>
                                                       </div>
                                                  </div>

                                                  {/* Summary Statistics */}
                                                  {analytics.detailed_analytics.core_metrics && (
                                                       <div className="row g-3">
                                                            <div className="col-md-6">
                                                                 <div className="bg-light p-3 rounded">
                                                                      <h6 className="mb-3 text-success fw-bold">📈 Summary Statistics</h6>
                                                                      <div className="row g-2">
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-primary">{analytics.detailed_analytics.core_metrics.transaction_volume.total_transactions}</div>
                                                                                     <small className="text-muted">Total Txs</small>
                                                                                </div>
                                                                           </div>
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-success">{analytics.detailed_analytics.core_metrics.transaction_volume.total_quantity_moved.toLocaleString()}</div>
                                                                                     <small className="text-muted">Total Qty</small>
                                                                                </div>
                                                                           </div>
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-info">{analytics.detailed_analytics.core_metrics.transaction_type_distribution.addition + analytics.detailed_analytics.core_metrics.transaction_type_distribution.consumption + analytics.detailed_analytics.core_metrics.transaction_type_distribution.wastage + analytics.detailed_analytics.core_metrics.transaction_type_distribution.adjustment + analytics.detailed_analytics.core_metrics.transaction_type_distribution.transfer}</div>
                                                                                     <small className="text-muted">Types</small>
                                                                                </div>
                                                                           </div>
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-warning">{currencyFormatter.format(analytics.detailed_analytics.core_metrics.transaction_volume.total_transaction_value)}</div>
                                                                                     <small className="text-muted">Total Value</small>
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                 <div className="bg-light p-3 rounded">
                                                                      <h6 className="mb-3 text-info fw-bold">⚡ Operational Efficiency</h6>
                                                                      <div className="row g-2">
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-primary">{analytics.operational_efficiency.transaction_processing_speed.toFixed(1)}</div>
                                                                                     <small className="text-muted">Processing Speed</small>
                                                                                </div>
                                                                           </div>
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-success">{analytics.operational_efficiency.inventory_accuracy_score}%</div>
                                                                                     <small className="text-muted">Accuracy</small>
                                                                                </div>
                                                                           </div>
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-info">{analytics.operational_efficiency.automation_opportunities}</div>
                                                                                     <small className="text-muted">Automation Ops</small>
                                                                                </div>
                                                                           </div>
                                                                           <div className="col-6">
                                                                                <div className="text-center p-2 bg-white rounded">
                                                                                     <div className="fw-bold text-warning">{analytics.operational_efficiency.efficiency_trends.error_rate}%</div>
                                                                                     <small className="text-muted">Error Rate</small>
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  )}
                                             </div>
                                        ) : modalContent.content === 'peak_hours_chart' && analytics?.detailed_analytics.time_pattern_analysis.peak_hours ? (
                                             <div>
                                                  <div className="mb-4">
                                                       <div className="bg-light p-3 rounded">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                 <h6 className="mb-0 fw-bold">🕐 Peak Hours Analysis</h6>
                                                                 <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('line')}
                                                                      >
                                                                           Line
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('bar')}
                                                                      >
                                                                           Bar
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'area' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('area')}
                                                                      >
                                                                           Area
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                            <ResponsiveContainer width="100%" height={400}>
                                                                 {chartView === 'line' ? (
                                                                      <LineChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.peak_hours}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="hour"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => `${value}:00`}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => `${value}:00`}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="transaction_count"
                                                                                stroke="#17a2b8"
                                                                                strokeWidth={3}
                                                                                name="Transactions"
                                                                                dot={{ fill: '#17a2b8', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#17a2b8', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                      </LineChart>
                                                                 ) : chartView === 'bar' ? (
                                                                      <BarChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.peak_hours}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="hour"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => `${value}:00`}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => `${value}:00`}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="rect"
                                                                           />
                                                                           <Bar dataKey="transaction_count" fill="#17a2b8" name="Transactions" radius={[4, 4, 0, 0]} />
                                                                      </BarChart>
                                                                 ) : (
                                                                      <AreaChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.peak_hours}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <defs>
                                                                                <linearGradient id="peakHoursGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#17a2b8" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#17a2b8" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                           </defs>
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="hour"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => `${value}:00`}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => `${value}:00`}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Area type="monotone" dataKey="transaction_count" stroke="#17a2b8" fill="url(#peakHoursGradient)" name="Transactions" strokeWidth={2} />
                                                                      </AreaChart>
                                                                 )}
                                                            </ResponsiveContainer>
                                                       </div>
                                                  </div>

                                                  {/* Peak Hours Summary Statistics */}
                                                  <div className="row g-3">
                                                       <div className="col-md-6">
                                                            <div className="bg-light p-3 rounded">
                                                                 <h6 className="mb-3 fw-bold">🕐 Peak Hours Summary</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.peak_hours.length}</div>
                                                                                <small className="text-muted">Total Hours</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.peak_hours.reduce((sum, h) => sum + h.transaction_count, 0)}</div>
                                                                                <small className="text-muted">Total Transactions</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{Math.max(...analytics.detailed_analytics.time_pattern_analysis.peak_hours.map(h => h.transaction_count))}</div>
                                                                                <small className="text-muted">Peak Transactions</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.peak_hours.find(h => h.transaction_count === Math.max(...analytics.detailed_analytics.time_pattern_analysis.peak_hours.map(h => h.transaction_count)))?.hour}:00</div>
                                                                                <small className="text-muted">Busiest Hour</small>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <div className="bg-light p-3 rounded">
                                                                 <h6 className="mb-3 fw-bold">📊 Activity Distribution</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{(analytics.detailed_analytics.time_pattern_analysis.peak_hours.reduce((sum, h) => sum + h.transaction_count, 0) / analytics.detailed_analytics.time_pattern_analysis.peak_hours.length).toFixed(1)}</div>
                                                                                <small className="text-muted">Avg per Hour</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.peak_hours.filter(h => h.transaction_count > 0).length}</div>
                                                                                <small className="text-muted">Active Hours</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{((Math.max(...analytics.detailed_analytics.time_pattern_analysis.peak_hours.map(h => h.transaction_count)) / analytics.detailed_analytics.time_pattern_analysis.peak_hours.reduce((sum, h) => sum + h.transaction_count, 0)) * 100).toFixed(1)}%</div>
                                                                                <small className="text-muted">Peak % of Total</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.peak_hours.filter(h => h.transaction_count >= analytics.detailed_analytics.time_pattern_analysis.peak_hours.reduce((sum, h) => sum + h.transaction_count, 0) * 0.1).length}</div>
                                                                                <small className="text-muted">High Activity Hours</small>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : modalContent.content === 'daily_activity_chart' && analytics?.detailed_analytics.time_pattern_analysis.daily_patterns ? (
                                             <div>
                                                  <div className="mb-4">
                                                       <div className="bg-light p-3 rounded">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                 <h6 className="mb-0 fw-bold">📅 Daily Activity Analysis</h6>
                                                                 <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('line')}
                                                                      >
                                                                           Line
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('bar')}
                                                                      >
                                                                           Bar
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'area' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('area')}
                                                                      >
                                                                           Area
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                            <ResponsiveContainer width="100%" height={400}>
                                                                 {chartView === 'line' ? (
                                                                      <LineChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.daily_patterns}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="transaction_count"
                                                                                stroke="#28a745"
                                                                                strokeWidth={3}
                                                                                name="Transactions"
                                                                                dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#28a745', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="total_quantity"
                                                                                stroke="#dc3545"
                                                                                strokeWidth={3}
                                                                                name="Total Quantity"
                                                                                dot={{ fill: '#dc3545', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#dc3545', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                      </LineChart>
                                                                 ) : chartView === 'bar' ? (
                                                                      <BarChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.daily_patterns}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="rect"
                                                                           />
                                                                           <Bar dataKey="transaction_count" fill="#28a745" name="Transactions" radius={[4, 4, 0, 0]} />
                                                                           <Bar dataKey="total_quantity" fill="#dc3545" name="Total Quantity" radius={[4, 4, 0, 0]} />
                                                                      </BarChart>
                                                                 ) : (
                                                                      <AreaChart
                                                                           data={analytics.detailed_analytics.time_pattern_analysis.daily_patterns}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <defs>
                                                                                <linearGradient id="dailyTransactionsGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#28a745" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#28a745" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                                <linearGradient id="dailyQuantityGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#dc3545" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#dc3545" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                           </defs>
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Area type="monotone" dataKey="transaction_count" stroke="#28a745" fill="url(#dailyTransactionsGradient)" name="Transactions" strokeWidth={2} />
                                                                           <Area type="monotone" dataKey="total_quantity" stroke="#dc3545" fill="url(#dailyQuantityGradient)" name="Total Quantity" strokeWidth={2} />
                                                                      </AreaChart>
                                                                 )}
                                                            </ResponsiveContainer>
                                                       </div>
                                                  </div>

                                                  {/* Daily Activity Summary Statistics */}
                                                  <div className="row g-3">
                                                       <div className="col-md-6">
                                                            <div className="bg-light p-3 rounded">
                                                                 <h6 className="mb-3 fw-bold">📊 Daily Activity Summary</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.daily_patterns.length}</div>
                                                                                <small className="text-muted">Total Days</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.daily_patterns.reduce((sum, d) => sum + d.transaction_count, 0)}</div>
                                                                                <small className="text-muted">Total Transactions</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.daily_patterns.reduce((sum, d) => sum + d.total_quantity, 0).toLocaleString()}</div>
                                                                                <small className="text-muted">Total Quantity</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{Math.max(...analytics.detailed_analytics.time_pattern_analysis.daily_patterns.map(d => d.transaction_count))}</div>
                                                                                <small className="text-muted">Peak Transactions</small>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <div className="bg-light p-3 rounded">
                                                                 <h6 className="mb-3 fw-bold">📈 Activity Trends</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{(analytics.detailed_analytics.time_pattern_analysis.daily_patterns.reduce((sum, d) => sum + d.transaction_count, 0) / analytics.detailed_analytics.time_pattern_analysis.daily_patterns.length).toFixed(1)}</div>
                                                                                <small className="text-muted">Avg Daily Txs</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{(analytics.detailed_analytics.time_pattern_analysis.daily_patterns.reduce((sum, d) => sum + d.total_quantity, 0) / analytics.detailed_analytics.time_pattern_analysis.daily_patterns.length).toLocaleString()}</div>
                                                                                <small className="text-muted">Avg Daily Qty</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{new Date(analytics.detailed_analytics.time_pattern_analysis.daily_patterns.reduce((prev, current) => (prev.transaction_count > current.transaction_count) ? prev : current).date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                                                <small className="text-muted">Busiest Day</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.time_pattern_analysis.daily_patterns.filter(d => d.transaction_count > 0).length}</div>
                                                                                <small className="text-muted">Active Days</small>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : modalContent.content === 'high_volume_transactions_chart' && analytics?.detailed_analytics.high_volume_transactions ? (
                                             <div>
                                                  <div className="mb-4">
                                                       <div className="bg-light p-3 rounded">
                                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                                 <h6 className="mb-0 fw-bold">🚀 High Volume Transactions Analysis</h6>
                                                                 <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('line')}
                                                                      >
                                                                           Line
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('bar')}
                                                                      >
                                                                           Bar
                                                                      </button>
                                                                      <button
                                                                           type="button"
                                                                           className={`btn ${chartView === 'area' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                           onClick={() => setChartView('area')}
                                                                      >
                                                                           Area
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                            <ResponsiveContainer width="100%" height={400}>
                                                                 {chartView === 'line' ? (
                                                                      <LineChart
                                                                           data={analytics.detailed_analytics.high_volume_transactions.slice(0, 20)}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="total_quantity"
                                                                                stroke="#dc3545"
                                                                                strokeWidth={3}
                                                                                name="Total Quantity"
                                                                                dot={{ fill: '#dc3545', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#dc3545', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                           <Line
                                                                                type="monotone"
                                                                                dataKey="total_cost"
                                                                                stroke="#28a745"
                                                                                strokeWidth={3}
                                                                                name="Total Cost"
                                                                                dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
                                                                                activeDot={{ r: 6, stroke: '#28a745', strokeWidth: 2, fill: '#fff' }}
                                                                           />
                                                                      </LineChart>
                                                                 ) : chartView === 'bar' ? (
                                                                      <BarChart
                                                                           data={analytics.detailed_analytics.high_volume_transactions.slice(0, 20)}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="rect"
                                                                           />
                                                                           <Bar dataKey="total_quantity" fill="#dc3545" name="Total Quantity" radius={[4, 4, 0, 0]} />
                                                                           <Bar dataKey="total_cost" fill="#28a745" name="Total Cost" radius={[4, 4, 0, 0]} />
                                                                      </BarChart>
                                                                 ) : (
                                                                      <AreaChart
                                                                           data={analytics.detailed_analytics.high_volume_transactions.slice(0, 20)}
                                                                           margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                      >
                                                                           <defs>
                                                                                <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#dc3545" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#dc3545" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                     <stop offset="5%" stopColor="#28a745" stopOpacity={0.3} />
                                                                                     <stop offset="95%" stopColor="#28a745" stopOpacity={0.1} />
                                                                                </linearGradient>
                                                                           </defs>
                                                                           <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                           <XAxis
                                                                                dataKey="date"
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                           />
                                                                           <YAxis
                                                                                tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                                axisLine={{ stroke: '#dee2e6' }}
                                                                           />
                                                                           <Tooltip
                                                                                contentStyle={{
                                                                                     backgroundColor: '#fff',
                                                                                     border: '1px solid #dee2e6',
                                                                                     borderRadius: '8px',
                                                                                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                                }}
                                                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                                                labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                           />
                                                                           <Legend
                                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                                iconType="circle"
                                                                           />
                                                                           <Area type="monotone" dataKey="total_quantity" stroke="#dc3545" fill="url(#quantityGradient)" name="Total Quantity" strokeWidth={2} />
                                                                           <Area type="monotone" dataKey="total_cost" stroke="#28a745" fill="url(#costGradient)" name="Total Cost" strokeWidth={2} />
                                                                      </AreaChart>
                                                                 )}
                                                            </ResponsiveContainer>
                                                       </div>
                                                  </div>

                                                  {/* High Volume Summary Statistics */}
                                                  <div className="row g-3">
                                                       <div className="col-md-6">
                                                            <div className="bg-light p-3 rounded">
                                                                 <h6 className="mb-3 fw-bold">📊 High Volume Summary</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.high_volume_transactions.length}</div>
                                                                                <small className="text-muted">Total Transactions</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.high_volume_transactions.reduce((sum, t) => sum + t.total_quantity, 0).toLocaleString()}</div>
                                                                                <small className="text-muted">Total Quantity</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{currencyFormatter.format(analytics.detailed_analytics.high_volume_transactions.reduce((sum, t) => sum + t.total_cost, 0))}</div>
                                                                                <small className="text-muted">Total Value</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{Math.max(...analytics.detailed_analytics.high_volume_transactions.map(t => t.total_quantity)).toLocaleString()}</div>
                                                                                <small className="text-muted">Max Quantity</small>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <div className="bg-light p-3 rounded">
                                                                 <h6 className="mb-3 fw-bold">🏷️ Category Breakdown</h6>
                                                                 <div className="row g-2">
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.high_volume_transactions.filter(t => t.volume_category === 'Very High').length}</div>
                                                                                <small className="text-muted">Very High</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.high_volume_transactions.filter(t => t.volume_category === 'High').length}</div>
                                                                                <small className="text-muted">High</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.high_volume_transactions.reduce((sum, t) => sum + t.transaction_breakdown.addition, 0)}</div>
                                                                                <small className="text-muted">Additions</small>
                                                                           </div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="text-center p-2 bg-white rounded">
                                                                                <div className="fw-bold">{analytics.detailed_analytics.high_volume_transactions.reduce((sum, t) => sum + t.transaction_breakdown.consumption, 0)}</div>
                                                                                <small className="text-muted">Consumptions</small>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : (
                                             <p>{modalContent.content}</p>
                                        )}
                                        <div className="modal-footer">
                                             <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
