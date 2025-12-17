'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SupplierInfo {
     supplier_id: string;
     supplier_name: string;
     contact_info: {
          contact_person: string;
          email: string;
          phone: string;
          address: string | null;
     };
     status: string;
     relationship_timeline: {
          first_order_date: string;
          last_order_date: string;
          days_since_first_order: number;
          days_since_last_order: number;
          active_months: number;
     };
}

interface PerformanceScorecard {
     overall_performance: {
          performance_score: number;
          risk_category: string;
          strategic_importance: string;
     };
     volume_metrics: {
          total_orders: number;
          total_spend: number;
          avg_order_value: number;
          largest_order: number;
          smallest_order: number;
     };
     order_status_breakdown: {
          completed_orders: number;
          pending_orders: number;
          cancelled_orders: number;
          partially_received_orders: number;
          completion_rate: number;
          cancellation_rate: number;
     };
     operational_metrics: {
          unique_items_supplied: number;
          avg_lead_time: number;
          lead_time_consistency: number;
          avg_delivery_delay: number;
          quality_performance: number;
     };
}

interface MonthlyTrend {
     period: string;
     year: number;
     month: number;
     metrics: {
          monthly_orders: number;
          monthly_spend: number;
          avg_monthly_order_value: number;
          monthly_received_value: number;
          monthly_cancelled_value: number;
          three_month_avg_spend: number;
     };
     order_status: {
          completed_orders: number;
          pending_orders: number;
          cancelled_orders: number;
     };
}

interface DeliveryPerformance {
     summary: {
          total_deliveries: number;
          on_time_deliveries: number;
          late_deliveries: number;
          on_time_rate: number;
          reliability_rating: string;
     };
     lead_time_analysis: {
          avg_actual_lead_time: number;
          avg_promised_lead_time: number;
          avg_lead_time_variance: number;
          lead_time_consistency: number;
          min_lead_time: number;
          max_lead_time: number;
     };
     delay_analysis: {
          avg_delay_days: number;
          max_delay_days: number;
          severe_delays: number;
     };
}

interface QualityMetrics {
     quality_scores: {
          condition_quality_score: number;
          quality_check_score: number;
          overall_quality_rating: string;
     };
     condition_breakdown: {
          total_receipts: number;
          good_condition_count: number;
          acceptable_condition_count: number;
          poor_condition_count: number;
     };
     quality_check_results: {
          passed_quality_checks: number;
          failed_quality_checks: number;
     };
     shelf_life_analysis: {
          avg_shelf_life_on_arrival: number;
          expired_on_arrival: number;
          short_shelf_life_items: number;
     };
}

interface ProductPortfolio {
     item_id: string;
     item_name: string;
     sku: string;
     category_name: string;
     order_metrics: {
          times_ordered: number;
          total_quantity_ordered: number;
          total_quantity_received: number;
          avg_fulfillment_rate: number;
     };
     pricing_metrics: {
          avg_unit_price: number;
          min_unit_price: number;
          max_unit_price: number;
          price_volatility: number;
          total_spend_on_item: number;
     };
     recent_activity: {
          last_ordered_date: string;
          days_since_last_order: number;
     };
}

interface RecentOrder {
     order_id: string;
     order_number: string;
     order_date: string;
     expected_delivery_date: string;
     status: string;
     delivery_status: string;
     total_amount: number;
     line_item_count: number;
     quantity_metrics: {
          total_ordered: number;
          total_received: number;
          pending: number;
     };
     timeline: {
          days_since_order: number;
          days_past_due: number;
     };
}

interface RecentPayment {
     payment_id: string;
     payment_reference: string;
     payment_amount: number;
     payment_date: string;
     payment_method: string;
     payment_status: string;
     reference_number: string | null;
     order_number: string;
     order_total: number;
     approval_info: {
          approved_by: string;
          approved_at: string;
          processed_at: string;
     };
}

interface RecentActivity {
     orders: RecentOrder[];
     payments: RecentPayment[];
}

interface KeyTermsExplanation {
     performance_score: string;
     risk_category: string;
     strategic_importance: string;
     lead_time: string;
     on_time_delivery_rate: string;
     quality_performance: string;
     fulfillment_rate: string;
     price_volatility: string;
     shelf_life_analysis: string;
     delivery_reliability_rating: string;
     order_completion_rate: string;
     supplier_relationship_timeline: string;
     product_portfolio_diversity: string;
     payment_terms_analysis: string;
}

interface SupplierAnalytics {
     supplier_info: SupplierInfo;
     performance_scorecard: PerformanceScorecard;
     monthly_trends: MonthlyTrend[];
     delivery_performance: DeliveryPerformance;
     quality_metrics: QualityMetrics;
     product_portfolio: ProductPortfolio[];
     recent_activity: RecentActivity;
     key_terms_explanation: KeyTermsExplanation;
}

export default function SupplierAnalyticsPage() {
     const params = useParams();
     const supplierId = params?.supplierid as string;

     const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [modalVisible, setModalVisible] = useState(false);
     const [modalContent, setModalContent] = useState<{ title: string, content: string } | null>(null);

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (supplierId && branchid && employeeid) {
               loadSupplierAnalytics();
          }
     }, [supplierId, branchid, employeeid]);

     const loadSupplierAnalytics = async () => {
          try {
               const url = `inventory/analytics/suppliers?tenantId=3&supplierId=${supplierId}&branchid=${branchid}&employeeid=${employeeid}`;
               const response = await customFetch(url);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load supplier analytics');
               }
          } catch (error) {
               console.error('Error loading supplier analytics:', error);
               toast.error('Error loading supplier analytics');
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

     if (!analytics) {
          return (
               <div className="container-fluid p-4">
                    <div className="text-center py-5">
                         <h4 className="text-muted">Supplier analytics not found</h4>
                         <Link href="/inventory/analytics" className="btn btn-primary mt-3">
                              Back to Analytics Dashboard
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics/suppliers" className="text-decoration-none">
                              <span className="text-muted">← Back to Suppliers Analytics</span>
                         </Link>
                         <h2 className="mb-1">🏢 {analytics.supplier_info.supplier_name}</h2>
                         <p className="text-muted mb-0">Comprehensive supplier performance analytics</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => openModal('Key Terms & Definitions', 'key_terms')}
                         >
                              📚 Key Terms
                         </button>
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={loadSupplierAnalytics}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Supplier Info - Intelligence Style */}
               <div className="mb-3 bg-light p-2">
                    {/* Header */}
                    <div className="bg-light py-1 px-2 mb-2">
                         <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                              SUPPLIER PROFILE | CONFIDENTIAL
                         </h6>
                    </div>

                    {/* Classification Header */}
                    <div className="mb-2 pb-1 border-bottom border-light">
                         <div className="d-flex justify-content-between align-items-center">
                              <div>
                                   <span className="badge bg-dark me-2" style={{ fontSize: '0.9rem' }}>ID: {analytics.supplier_info.supplier_id}</span>
                                   <span className={`badge ${analytics.supplier_info.status.toLowerCase() === 'active' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.9rem' }}>
                                        {analytics.supplier_info.status.toUpperCase()}
                                   </span>
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.9rem' }}>INTERNAL USE ONLY</small>
                         </div>
                    </div>

                    {/* Two Sections Side by Side */}
                    <div className="row g-2">
                         {/* Contact Intelligence */}
                         <div className="col-md-6">
                              <div className="border border-light bg-white p-2">
                                   <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                        CONTACT information
                                   </h6>
                                   <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                        <tbody>
                                             <tr>
                                                  <td className="text-muted py-1" style={{ width: '140px' }}>PRIMARY CONTACT:</td>
                                                  <td className="fw-bold py-1">{analytics.supplier_info.contact_info.contact_person}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">EMAIL:</td>
                                                  <td className="fw-bold py-1">{analytics.supplier_info.contact_info.email}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">PHONE:</td>
                                                  <td className="fw-bold py-1">{analytics.supplier_info.contact_info.phone}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">ADDRESS:</td>
                                                  <td className="fw-bold py-1">{analytics.supplier_info.contact_info.address || 'NOT ON FILE'}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         {/* Relationship Timeline */}
                         <div className="col-md-6">
                              <div className="border border-light bg-white p-2">
                                   <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                        RELATIONSHIP TIMELINE
                                   </h6>
                                   <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                        <tbody>
                                             <tr>
                                                  <td className="text-muted py-1" style={{ width: '140px' }}>FIRST ORDER:</td>
                                                  <td className="fw-bold py-1">
                                                       {new Date(analytics.supplier_info.relationship_timeline.first_order_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: '2-digit'
                                                       }).toUpperCase()}
                                                       <span className="badge bg-secondary ms-2" style={{ fontSize: '0.75rem' }}>{analytics.supplier_info.relationship_timeline.days_since_first_order} DAYS</span>
                                                  </td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">LAST ORDER:</td>
                                                  <td className="fw-bold py-1">
                                                       {new Date(analytics.supplier_info.relationship_timeline.last_order_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: '2-digit'
                                                       }).toUpperCase()}
                                                       <span className={`badge ms-2 ${analytics.supplier_info.relationship_timeline.days_since_last_order <= 30 ? 'bg-success' : analytics.supplier_info.relationship_timeline.days_since_last_order <= 90 ? 'bg-warning' : 'bg-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                            {analytics.supplier_info.relationship_timeline.days_since_last_order} DAYS AGO
                                                       </span>
                                                  </td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">ACTIVE:</td>
                                                  <td className="fw-bold py-1">
                                                       {analytics.supplier_info.relationship_timeline.active_months} MONTHS
                                                  </td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Performance Scorecard - Intelligence Style */}
               <div className="mb-3 bg-light p-2">
                    {/* Header */}
                    <div className="bg-light py-1 px-2 mb-2">
                         <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                              PERFORMANCE SCORECARD | ANALYSIS
                         </h6>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="row g-2 mb-2">
                         <div className="col-md-3">
                              <div className="border border-light bg-white p-2 text-center">
                                   <div className="text-primary fw-bold" style={{ fontSize: '1.5rem' }}>{analytics.performance_scorecard.overall_performance.performance_score}/100</div>
                                   <small className="text-muted" style={{ fontSize: '0.9rem' }}>PERFORMANCE SCORE</small>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border border-light bg-white p-2 text-center">
                                   <div className={`fw-bold ${analytics.performance_scorecard.overall_performance.risk_category === 'Low' ? 'text-success' : analytics.performance_scorecard.overall_performance.risk_category === 'Medium' ? 'text-warning' : 'text-danger'}`} style={{ fontSize: '1.5rem' }}>
                                        {analytics.performance_scorecard.overall_performance.risk_category}
                                   </div>
                                   <small className="text-muted" style={{ fontSize: '0.9rem' }}>RISK CATEGORY</small>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border border-light bg-white p-2 text-center">
                                   <div className="text-info fw-bold" style={{ fontSize: '1.5rem' }}>{analytics.performance_scorecard.overall_performance.strategic_importance}</div>
                                   <small className="text-muted" style={{ fontSize: '0.9rem' }}>STRATEGIC IMPORTANCE</small>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border border-light bg-white p-2 text-center">
                                   <div className="text-secondary fw-bold" style={{ fontSize: '1.5rem' }}>{(analytics.performance_scorecard.operational_metrics.quality_performance * 100).toFixed(1)}%</div>
                                   <small className="text-muted" style={{ fontSize: '0.9rem' }}>QUALITY PERFORMANCE</small>
                              </div>
                         </div>
                    </div>

                    {/* Volume & Status Metrics */}
                    <div className="row g-2">
                         {/* Volume Metrics */}
                         <div className="col-md-6">
                              <div className="border border-light bg-white p-2">
                                   <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                        VOLUME METRICS
                                   </h6>
                                   <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                        <tbody>
                                             <tr>
                                                  <td className="text-muted py-1" style={{ width: '120px' }}>TOTAL ORDERS:</td>
                                                  <td className="fw-bold py-1">{analytics.performance_scorecard.volume_metrics.total_orders}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">TOTAL SPEND:</td>
                                                  <td className="fw-bold py-1">{currencyFormatter.format(analytics.performance_scorecard.volume_metrics.total_spend)}</td>
                                             </tr>
                                             <tr>
                                                  <td className="text-muted py-1">AVG ORDER VALUE:</td>
                                                  <td className="fw-bold py-1">{currencyFormatter.format(analytics.performance_scorecard.volume_metrics.avg_order_value)}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         {/* Order Status Breakdown */}
                         <div className="col-md-6">
                              <div className="border border-light bg-white p-2">
                                   <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                        ORDER STATUS BREAKDOWN
                                   </h6>
                                   <div className="row g-1 mb-2">
                                        <div className="col-4 text-center">
                                             <span className="badge bg-success d-block" style={{ fontSize: '0.8rem' }}>{analytics.performance_scorecard.order_status_breakdown.completed_orders}</span>
                                             <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>COMPLETED</small>
                                        </div>
                                        <div className="col-4 text-center">
                                             <span className="badge bg-warning d-block" style={{ fontSize: '0.8rem' }}>{analytics.performance_scorecard.order_status_breakdown.pending_orders}</span>
                                             <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>PENDING</small>
                                        </div>
                                        <div className="col-4 text-center">
                                             <span className="badge bg-info d-block" style={{ fontSize: '0.8rem' }}>{analytics.performance_scorecard.order_status_breakdown.partially_received_orders}</span>
                                             <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>PARTIAL</small>
                                        </div>
                                   </div>
                                   <div className="row g-1">
                                        <div className="col-6 text-center">
                                             <span className="badge bg-primary d-block" style={{ fontSize: '0.8rem' }}>{(analytics.performance_scorecard.order_status_breakdown.completion_rate * 100).toFixed(1)}%</span>
                                             <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>COMPLETION RATE</small>
                                        </div>
                                        <div className="col-6 text-center">
                                             <span className="badge bg-danger d-block" style={{ fontSize: '0.8rem' }}>{(analytics.performance_scorecard.order_status_breakdown.cancellation_rate * 100).toFixed(1)}%</span>
                                             <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>CANCELLATION RATE</small>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Delivery Performance & Quality Metrics - Intelligence Style */}
               <div className="row g-3 mb-4">
                    {/* Delivery Performance */}
                    <div className="col-lg-6">
                         <div className="mb-3 bg-light p-2">
                              {/* Header */}
                              <div className="bg-light py-1 px-2 mb-2">
                                   <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                        DELIVERY PERFORMANCE | ANALYSIS
                                   </h6>
                              </div>

                              {/* Key Metrics Row */}
                              <div className="row g-2 mb-2">
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2 text-center">
                                             <div className="text-success fw-bold" style={{ fontSize: '1.5rem' }}>{(analytics.delivery_performance.summary.on_time_rate * 100).toFixed(1)}%</div>
                                             <small className="text-muted" style={{ fontSize: '0.9rem' }}>ON-TIME RATE</small>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2 text-center">
                                             <div className="text-info fw-bold" style={{ fontSize: '1.5rem' }}>{analytics.delivery_performance.lead_time_analysis.avg_actual_lead_time.toFixed(1)}</div>
                                             <small className="text-muted" style={{ fontSize: '0.9rem' }}>AVG LEAD TIME (DAYS)</small>
                                        </div>
                                   </div>
                              </div>

                              {/* Delivery Metrics */}
                              <div className="row g-2">
                                   {/* Summary Metrics */}
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2">
                                             <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                  DELIVERY SUMMARY
                                             </h6>
                                             <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <tbody>
                                                       <tr>
                                                            <td className="text-muted py-1" style={{ width: '120px' }}>TOTAL:</td>
                                                            <td className="fw-bold py-1">{analytics.delivery_performance.summary.total_deliveries}</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">ON-TIME:</td>
                                                            <td className="fw-bold py-1">{analytics.delivery_performance.summary.on_time_deliveries}</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">LATE:</td>
                                                            <td className="fw-bold py-1">{analytics.delivery_performance.summary.late_deliveries}</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">RELIABILITY:</td>
                                                            <td className="fw-bold py-1">{analytics.delivery_performance.summary.reliability_rating}</td>
                                                       </tr>
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>

                                   {/* Performance Analysis */}
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2">
                                             <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                  PERFORMANCE ANALYSIS
                                             </h6>
                                             <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <tbody>
                                                       <tr>
                                                            <td className="text-muted py-1" style={{ width: '120px' }}>AVG DELAY:</td>
                                                            <td className="fw-bold py-1">{analytics.delivery_performance.delay_analysis.avg_delay_days.toFixed(2)} DAYS</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">LEAD VARIANCE:</td>
                                                            <td className="fw-bold py-1">{analytics.delivery_performance.lead_time_analysis.avg_lead_time_variance.toFixed(2)} DAYS</td>
                                                       </tr>
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="col-lg-6">
                         <div className="mb-3 bg-light p-2">
                              {/* Header */}
                              <div className="bg-light py-1 px-2 mb-2">
                                   <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                        QUALITY METRICS | ANALYSIS
                                   </h6>
                              </div>

                              {/* Key Metrics Row */}
                              <div className="row g-2 mb-2">
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2 text-center">
                                             <div className="text-success fw-bold" style={{ fontSize: '1.5rem' }}>{analytics.quality_metrics.quality_scores.overall_quality_rating}</div>
                                             <small className="text-muted" style={{ fontSize: '0.9rem' }}>QUALITY RATING</small>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2 text-center">
                                             <div className="text-info fw-bold" style={{ fontSize: '1.5rem' }}>{analytics.quality_metrics.condition_breakdown.total_receipts}</div>
                                             <small className="text-muted" style={{ fontSize: '0.9rem' }}>TOTAL RECEIPTS</small>
                                        </div>
                                   </div>
                              </div>

                              {/* Quality Breakdown */}
                              <div className="row g-2">
                                   {/* Condition Breakdown */}
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2">
                                             <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                  CONDITION BREAKDOWN
                                             </h6>
                                             <div className="row g-1">
                                                  <div className="col-4 text-center">
                                                       <span className="badge bg-success d-block" style={{ fontSize: '0.8rem' }}>{analytics.quality_metrics.condition_breakdown.good_condition_count}</span>
                                                       <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>GOOD</small>
                                                  </div>
                                                  <div className="col-4 text-center">
                                                       <span className="badge bg-warning d-block" style={{ fontSize: '0.8rem' }}>{analytics.quality_metrics.condition_breakdown.acceptable_condition_count}</span>
                                                       <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>ACCEPTABLE</small>
                                                  </div>
                                                  <div className="col-4 text-center">
                                                       <span className="badge bg-danger d-block" style={{ fontSize: '0.8rem' }}>{analytics.quality_metrics.condition_breakdown.poor_condition_count}</span>
                                                       <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>POOR</small>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Quality Checks */}
                                   <div className="col-md-6">
                                        <div className="border border-light bg-white p-2">
                                             <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                                  QUALITY CHECKS
                                             </h6>
                                             <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <tbody>
                                                       <tr>
                                                            <td className="text-muted py-1" style={{ width: '100px' }}>PASSED:</td>
                                                            <td className="fw-bold py-1">{analytics.quality_metrics.quality_check_results.passed_quality_checks}</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">FAILED:</td>
                                                            <td className="fw-bold py-1">{analytics.quality_metrics.quality_check_results.failed_quality_checks}</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">SHELF LIFE:</td>
                                                            <td className="fw-bold py-1">{analytics.quality_metrics.shelf_life_analysis.avg_shelf_life_on_arrival.toFixed(1)} DAYS</td>
                                                       </tr>
                                                       <tr>
                                                            <td className="text-muted py-1">EXPIRED:</td>
                                                            <td className="fw-bold py-1">{analytics.quality_metrics.shelf_life_analysis.expired_on_arrival}</td>
                                                       </tr>
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Monthly Trends - Intelligence Style */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="mb-3 bg-light p-2">
                              {/* Header */}
                              <div className="bg-light py-1 px-2 mb-3">
                                   <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                             📈 MONTHLY TRENDS | ANALYTICS REPORT
                                        </h6>
                                        <button
                                             className="btn btn-outline-primary btn-sm"
                                             onClick={() => openModal('Monthly Trends Chart', 'monthly_trends_chart')}
                                             title="View Chart"
                                        >
                                             📊
                                        </button>
                                   </div>
                              </div>

                              {/* Classification Header */}
                              <div className="mb-3 pb-1 border-bottom border-light">
                                   <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                             <span className="badge bg-dark me-2" style={{ fontSize: '0.9rem' }}>PERIOD: {analytics.monthly_trends.length > 0 ? `${analytics.monthly_trends[0].period} - ${analytics.monthly_trends[analytics.monthly_trends.length - 1].period}` : 'N/A'}</span>
                                             <span className="badge bg-secondary" style={{ fontSize: '0.9rem' }}>RECORDS: {analytics.monthly_trends.length}</span>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>CONFIDENTIAL - INTERNAL USE ONLY</small>
                                   </div>
                              </div>

                              {analytics.monthly_trends.length > 0 ? (
                                   <div className="border border-light bg-white">
                                        <div className="table-responsive">
                                             <table className="table table-sm mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <thead className="bg-light">
                                                       <tr>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>PERIOD</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>ORDERS</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>MONTHLY SPEND</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>AVG ORDER VALUE</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>COMPLETED</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>PENDING</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>CANCELLED</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.monthly_trends.map((trend, index) => (
                                                            <tr key={index} className="border-bottom border-light">
                                                                 <td className="py-2 px-3 fw-bold text-dark">{trend.period}</td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className="badge bg-primary" style={{ fontSize: '0.9rem' }}>{trend.metrics.monthly_orders}</span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-end fw-bold text-success">{currencyFormatter.format(trend.metrics.monthly_spend)}</td>
                                                                 <td className="py-2 px-3 text-end fw-semibold text-info">{currencyFormatter.format(trend.metrics.avg_monthly_order_value)}</td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className="badge bg-success" style={{ fontSize: '0.9rem' }}>{trend.order_status.completed_orders}</span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className="badge bg-warning" style={{ fontSize: '0.9rem' }}>{trend.order_status.pending_orders}</span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className="badge bg-danger" style={{ fontSize: '0.9rem' }}>{trend.order_status.cancelled_orders}</span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                        <div className="bg-light border-top border-light p-2">
                                             <div className="text-center">
                                                  <small className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                       📊 TOTAL RECORDS: {analytics.monthly_trends.length} | CONFIDENTIAL ANALYTICS REPORT
                                                  </small>
                                             </div>
                                        </div>
                                   </div>
                              ) : (
                                   <div className="border border-light bg-white p-4 text-center">
                                        <div className="mb-3">
                                             <span className="text-muted" style={{ fontSize: '3rem' }}>📈</span>
                                        </div>
                                        <h6 className="text-muted mb-2">NO MONTHLY TRENDS DATA</h6>
                                        <p className="text-muted small mb-0">Monthly analytics will be displayed here when available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Product Portfolio - Intelligence Style */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="mb-3 bg-light p-2">
                              {/* Header */}
                              <div className="bg-light py-1 px-2 mb-3">
                                   <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                        📦 PRODUCT PORTFOLIO | INVENTORY ANALYSIS
                                   </h6>
                              </div>

                              {/* Classification Header */}
                              <div className="mb-3 pb-1 border-bottom border-light">
                                   <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                             <span className="badge bg-dark me-2" style={{ fontSize: '0.9rem' }}>SUPPLIER: {analytics.supplier_info.supplier_name.substring(0, 20).toUpperCase()}</span>
                                             <span className="badge bg-secondary" style={{ fontSize: '0.9rem' }}>PRODUCTS: {analytics.product_portfolio.length}</span>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>STRATEGIC INVENTORY ASSESSMENT</small>
                                   </div>
                              </div>

                              {analytics.product_portfolio.length > 0 ? (
                                   <div className="border border-light bg-white">
                                        <div className="table-responsive">
                                             <table className="table table-sm mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <thead className="bg-light">
                                                       <tr>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>ITEM NAME</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>SKU</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>CATEGORY</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>ORDERS</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>TOTAL QTY</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>FULFILLMENT</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>AVG PRICE</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>TOTAL SPEND</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>LAST ORDER</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.product_portfolio.map((item) => (
                                                            <tr key={item.item_id} className="border-bottom border-light">
                                                                 <td className="py-2 px-3">
                                                                      <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{item.item_name}</div>
                                                                 </td>
                                                                 <td className="py-2 px-3">
                                                                      <code className="text-muted small" style={{ fontSize: '0.9rem' }}>{item.sku}</code>
                                                                 </td>
                                                                 <td className="py-2 px-3">
                                                                      <span className="badge bg-secondary" style={{ fontSize: '0.9rem' }}>{item.category_name}</span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className="badge bg-info" style={{ fontSize: '0.9rem' }}>{item.order_metrics.times_ordered}</span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-end fw-semibold text-primary" style={{ fontSize: '0.9rem' }}>
                                                                      {item.order_metrics.total_quantity_ordered.toLocaleString()}
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className={`badge ${(item.order_metrics.avg_fulfillment_rate * 100) >= 80 ? 'bg-success' : (item.order_metrics.avg_fulfillment_rate * 100) >= 60 ? 'bg-warning' : 'bg-danger'}`} style={{ fontSize: '0.9rem' }}>
                                                                           {(item.order_metrics.avg_fulfillment_rate * 100).toFixed(1)}%
                                                                      </span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-end fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                                                                      {currencyFormatter.format(item.pricing_metrics.avg_unit_price)}
                                                                 </td>
                                                                 <td className="py-2 px-3 text-end fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                                                                      {currencyFormatter.format(item.pricing_metrics.total_spend_on_item)}
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                                           {item.recent_activity.days_since_last_order} days ago
                                                                      </small>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                        <div className="bg-light border-top border-light p-2">
                                             <div className="text-center">
                                                  <small className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                       📦 PORTFOLIO ANALYSIS COMPLETE | {analytics.product_portfolio.length} PRODUCTS ASSESSED
                                                  </small>
                                             </div>
                                        </div>
                                   </div>
                              ) : (
                                   <div className="border border-light bg-white p-4 text-center">
                                        <div className="mb-3">
                                             <span className="text-muted" style={{ fontSize: '3rem' }}>📦</span>
                                        </div>
                                        <h6 className="text-muted mb-2">NO PRODUCT PORTFOLIO DATA</h6>
                                        <p className="text-muted small mb-0">Product information will appear here when available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Recent Activity - Intelligence Style */}
               <div className="row g-3">
                    {/* Recent Orders */}
                    <div className="col-12">
                         <div className="mb-3 bg-light p-2">
                              {/* Header */}
                              <div className="bg-light py-1 px-2 mb-3">
                                   <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                        📋 RECENT ORDERS | ACTIVITY LOG
                                   </h6>
                              </div>

                              {/* Classification Header */}
                              <div className="mb-3 pb-1 border-bottom border-light">
                                   <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                             <span className="badge bg-dark me-2" style={{ fontSize: '0.9rem' }}>SUPPLIER: {analytics.supplier_info.supplier_name.substring(0, 15).toUpperCase()}</span>
                                             <span className="badge bg-secondary" style={{ fontSize: '0.9rem' }}>ORDERS: {analytics.recent_activity.orders.length}</span>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>OPERATIONAL MONITORING</small>
                                   </div>
                              </div>

                              {analytics.recent_activity.orders.length > 0 ? (
                                   <div className="border border-light bg-white">
                                        <div className="table-responsive">
                                             <table className="table table-sm mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <thead className="bg-light">
                                                       <tr>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>ORDER #</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>DATE</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>STATUS</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>VALUE</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>ITEMS</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.recent_activity.orders.slice(0, 10).map((order) => (
                                                            <tr key={order.order_id} className="border-bottom border-light">
                                                                 <td className="py-2 px-3">
                                                                      <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{order.order_number}</div>
                                                                 </td>
                                                                 <td className="py-2 px-3">
                                                                      <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                                           {new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                      </small>
                                                                 </td>
                                                                 <td className="py-2 px-3">
                                                                      <span className={`badge ${order.status === 'received' ? 'bg-success' : order.status === 'pending' ? 'bg-warning' : order.status === 'partially_received' ? 'bg-info' : 'bg-secondary'}`} style={{ fontSize: '0.9rem' }}>
                                                                           {order.status.replace('_', ' ').toUpperCase()}
                                                                      </span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-end fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                                                                      {currencyFormatter.format(order.total_amount)}
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className="badge bg-primary" style={{ fontSize: '0.9rem' }}>{order.line_item_count}</span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                        <div className="bg-light border-top border-light p-2">
                                             <div className="text-center">
                                                  <small className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                       📋 ORDER LOG UPDATED | {Math.min(10, analytics.recent_activity.orders.length)} RECENT ENTRIES DISPLAYED
                                                  </small>
                                             </div>
                                        </div>
                                   </div>
                              ) : (
                                   <div className="border border-light bg-white p-4 text-center">
                                        <div className="mb-3">
                                             <span className="text-muted" style={{ fontSize: '3rem' }}>📋</span>
                                        </div>
                                        <h6 className="text-muted mb-2">NO RECENT ORDERS</h6>
                                        <p className="text-muted small mb-0">Order activity will be displayed here when available</p>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="col-12">
                         <div className="mb-3 bg-light p-2">
                              {/* Header */}
                              <div className="bg-light py-1 px-2 mb-3">
                                   <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                        💰 RECENT PAYMENTS | FINANCIAL LOG
                                   </h6>
                              </div>

                              {/* Classification Header */}
                              <div className="mb-3 pb-1 border-bottom border-light">
                                   <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                             <span className="badge bg-dark me-2" style={{ fontSize: '0.9rem' }}>SUPPLIER: {analytics.supplier_info.supplier_name.substring(0, 15).toUpperCase()}</span>
                                             <span className="badge bg-secondary" style={{ fontSize: '0.9rem' }}>PAYMENTS: {analytics.recent_activity.payments.length}</span>
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>FINANCIAL TRACKING</small>
                                   </div>
                              </div>

                              {analytics.recent_activity.payments.length > 0 ? (
                                   <div className="border border-light bg-white">
                                        <div className="table-responsive">
                                             <table className="table table-sm mb-0" style={{ fontSize: '0.9rem' }}>
                                                  <thead className="bg-light">
                                                       <tr>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>REFERENCE</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-end" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>AMOUNT</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>DATE</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>METHOD</th>
                                                            <th className="border-0 fw-bold text-uppercase py-2 px-3 text-center" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>STATUS</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.recent_activity.payments.slice(0, 10).map((payment) => (
                                                            <tr key={payment.payment_id} className="border-bottom border-light">
                                                                 <td className="py-2 px-3">
                                                                      <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{payment.payment_reference}</div>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-end fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                                                                      {currencyFormatter.format(payment.payment_amount)}
                                                                 </td>
                                                                 <td className="py-2 px-3">
                                                                      <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                                           {new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                      </small>
                                                                 </td>
                                                                 <td className="py-2 px-3">
                                                                      <span className="badge bg-info" style={{ fontSize: '0.9rem' }}>
                                                                           {payment.payment_method.replace('_', ' ').toUpperCase()}
                                                                      </span>
                                                                 </td>
                                                                 <td className="py-2 px-3 text-center">
                                                                      <span className={`badge ${payment.payment_status === 'completed' ? 'bg-success' : payment.payment_status === 'pending' ? 'bg-warning' : 'bg-secondary'}`} style={{ fontSize: '0.9rem' }}>
                                                                           {payment.payment_status.toUpperCase()}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                        <div className="bg-light border-top border-light p-2">
                                             <div className="text-center">
                                                  <small className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                       💰 PAYMENT LOG UPDATED | {Math.min(10, analytics.recent_activity.payments.length)} RECENT TRANSACTIONS
                                                  </small>
                                             </div>
                                        </div>
                                   </div>
                              ) : (
                                   <div className="border border-light bg-white p-4 text-center">
                                        <div className="mb-3">
                                             <span className="text-muted" style={{ fontSize: '3rem' }}>💰</span>
                                        </div>
                                        <h6 className="text-muted mb-2">NO RECENT PAYMENTS</h6>
                                        <p className="text-muted small mb-0">Payment activity will be displayed here when available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Modal for Key Terms */}
               {modalVisible && modalContent && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
                         <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">{modalContent.title}</h5>
                                        <button type="button" className="btn-close" onClick={closeModal}></button>
                                   </div>
                                   <div className="modal-body">
                                        {modalContent.content === 'key_terms' && analytics?.key_terms_explanation ? (
                                             <div>
                                                  <div className="row">
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Performance Metrics</h6>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Performance Score:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.performance_score}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Risk Category:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.risk_category}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Strategic Importance:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.strategic_importance}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Order Completion Rate:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.order_completion_rate}</p>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Delivery & Quality</h6>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Lead Time:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.lead_time}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>On-Time Delivery Rate:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.on_time_delivery_rate}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Delivery Reliability Rating:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.delivery_reliability_rating}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Quality Performance:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.quality_performance}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <div className="row mt-3">
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Product & Pricing</h6>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Fulfillment Rate:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.fulfillment_rate}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Price Volatility:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.price_volatility}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Shelf Life Analysis:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.shelf_life_analysis}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Product Portfolio Diversity:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.product_portfolio_diversity}</p>
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <h6 className="mb-3">Relationship & Payments</h6>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Supplier Relationship Timeline:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.supplier_relationship_timeline}</p>
                                                            </div>
                                                            <div className="mb-3 border border-light rounded p-3">
                                                                 <strong>Payment Terms Analysis:</strong>
                                                                 <p className="text-muted mb-0 mt-2">{analytics.key_terms_explanation.payment_terms_analysis}</p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : modalContent.content === 'monthly_trends_chart' && analytics?.monthly_trends ? (
                                             <div>
                                                  <div className="mb-4">
                                                       <div className="bg-light p-3 rounded">
                                                            <h6 className="mb-3 text-primary fw-bold">📊 Monthly Order Trends</h6>
                                                            <ResponsiveContainer width="100%" height={350}>
                                                                 <LineChart
                                                                      data={analytics.monthly_trends}
                                                                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                 >
                                                                      <defs>
                                                                           <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                                                                                <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                                                                           </linearGradient>
                                                                           <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="5%" stopColor="#764ba2" stopOpacity={0.3} />
                                                                                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
                                                                           </linearGradient>
                                                                      </defs>
                                                                      <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                      <XAxis
                                                                           dataKey="period"
                                                                           tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                           axisLine={{ stroke: '#dee2e6' }}
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
                                                                           formatter={(value, name) => [
                                                                                name === 'Orders' ? value : (typeof value === 'number' ? currencyFormatter.format(value) : value),
                                                                                name
                                                                           ]}
                                                                           labelStyle={{ color: '#495057', fontWeight: 'bold' }}
                                                                      />
                                                                      <Legend
                                                                           wrapperStyle={{ paddingTop: '20px' }}
                                                                           iconType="circle"
                                                                      />
                                                                      <Line
                                                                           type="monotone"
                                                                           dataKey="metrics.monthly_orders"
                                                                           stroke="#667eea"
                                                                           strokeWidth={3}
                                                                           name="Orders"
                                                                           dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                                                                           activeDot={{ r: 8, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
                                                                      />
                                                                      <Line
                                                                           type="monotone"
                                                                           dataKey="metrics.monthly_spend"
                                                                           stroke="#764ba2"
                                                                           strokeWidth={3}
                                                                           name="Monthly Spend"
                                                                           dot={{ fill: '#764ba2', strokeWidth: 2, r: 6 }}
                                                                           activeDot={{ r: 8, stroke: '#764ba2', strokeWidth: 2, fill: '#fff' }}
                                                                      />
                                                                 </LineChart>
                                                            </ResponsiveContainer>
                                                       </div>
                                                  </div>
                                                  <div className="mb-4">
                                                       <div className="bg-light p-3 rounded">
                                                            <h6 className="mb-3 text-success fw-bold">📈 Order Status Breakdown</h6>
                                                            <ResponsiveContainer width="100%" height={350}>
                                                                 <BarChart
                                                                      data={analytics.monthly_trends}
                                                                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                                                 >
                                                                      <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                                                      <XAxis
                                                                           dataKey="period"
                                                                           tick={{ fontSize: 12, fill: '#6c757d' }}
                                                                           axisLine={{ stroke: '#dee2e6' }}
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
                                                                           cursor={{ fill: 'rgba(0, 123, 255, 0.1)' }}
                                                                      />
                                                                      <Legend
                                                                           wrapperStyle={{ paddingTop: '20px' }}
                                                                           iconType="rect"
                                                                      />
                                                                      <Bar
                                                                           dataKey="order_status.completed_orders"
                                                                           fill="#28a745"
                                                                           name="Completed"
                                                                           radius={[4, 4, 0, 0]}
                                                                      />
                                                                      <Bar
                                                                           dataKey="order_status.pending_orders"
                                                                           fill="#ffc107"
                                                                           name="Pending"
                                                                           radius={[4, 4, 0, 0]}
                                                                      />
                                                                      <Bar
                                                                           dataKey="order_status.cancelled_orders"
                                                                           fill="#dc3545"
                                                                           name="Cancelled"
                                                                           radius={[4, 4, 0, 0]}
                                                                      />
                                                                 </BarChart>
                                                            </ResponsiveContainer>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : (
                                             <p>{modalContent.content}</p>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
};

