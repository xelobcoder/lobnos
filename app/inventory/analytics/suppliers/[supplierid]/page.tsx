'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../../components/reports/ExportPdfButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { RiArrowLeftLine, RiBuildingLine, RiRefreshLine, RiBookOpenLine, RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiCalendarEventLine, RiFilterLine, RiTimeLine, RiMoneyDollarCircleLine, RiFileListLine, RiPieChartLine, RiStarLine, RiCheckLine, RiAlertLine, RiBarChartLine, RiTruckLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue
const COLOR_TERTIARY = '#ea580c'; // Orange

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

const CustomTooltip = ({ active, payload, label }: any) => {
     if (active && payload && payload.length) {
          return (
               <div className="rounded-lg border p-2 shadow-sm"
                    style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                    <div className="mb-2">
                         <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Period</span>
                         <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                    </div>
                    {payload.map((item: any, index: number) => (
                         <div key={index} className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                              <span className="fw-bold d-block" style={{ color: item.color }}>
                                   {currencyFormatter.format(item.value)}
                              </span>
                         </div>
                    ))}
               </div>
          );
     }
     return null;
};

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
          <div className="container-fluid px-4 py-3" data-pdf-root>
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics/suppliers" className="text-decoration-none d-block mb-2">
                              <RiArrowLeftLine size={16} className="me-1" />
                              <span className="text-muted">Back to Suppliers Analytics</span>
                         </Link>
                         <h2 className="mb-1">
                              <RiBuildingLine className="me-2" />
                              {analytics.supplier_info.supplier_name}
                         </h2>
                         <p className="text-muted mb-0">Comprehensive supplier performance analytics</p>
                    </div>
                    <div className="d-flex gap-2">
                         <ExportPdfButton
                              title="Supplier Analytics"
                              subtitle={analytics.supplier_info.supplier_name}
                              filters={[`Supplier: ${analytics.supplier_info.supplier_name}`]}
                         />
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => openModal('Key Terms & Definitions', 'key_terms')}
                         >
                              <RiBookOpenLine size={16} className="me-1" />
                              Key Terms
                         </button>
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={loadSupplierAnalytics}
                         >
                              <RiRefreshLine size={16} className="me-1" />
                              Refresh
                         </button>
                    </div>
               </div>

               {/* Supplier Information */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div
                              className="border rounded h-100"
                              style={{
                                   backgroundColor: 'var(--bs-body-bg)',
                                   borderColor: COLOR_BORDER
                              }}
                         >
                              <div className="p-2">
                                   <div className="d-flex align-items-center mb-2">
                                        <RiBuildingLine size={20} className="me-2 text-primary" />
                                        <h6 className="mb-0 fw-bold">Contact Information</h6>
                                   </div>
                                   <div className="row g-1">
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Primary Contact</small>
                                             <span className="fw-medium">{analytics.supplier_info.contact_info.contact_person}</span>
                                        </div>
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Status</small>
                                             <span className={`badge ${analytics.supplier_info.status.toLowerCase() === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                                  {analytics.supplier_info.status}
                                             </span>
                                        </div>
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Email</small>
                                             <span className="fw-medium">{analytics.supplier_info.contact_info.email}</span>
                                        </div>
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Phone</small>
                                             <span className="fw-medium">{analytics.supplier_info.contact_info.phone}</span>
                                        </div>
                                        <div className="col-12">
                                             <small className="text-muted d-block">Address</small>
                                             <span className="fw-medium">{analytics.supplier_info.contact_info.address || 'Not available'}</span>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div
                              className="border rounded h-100"
                              style={{
                                   backgroundColor: 'var(--bs-body-bg)',
                                   borderColor: COLOR_BORDER
                              }}
                         >
                              <div className="p-3">
                                   <div className="d-flex align-items-center mb-3">
                                        <RiTimeLine size={20} className="me-2 text-info" />
                                        <h6 className="mb-0 fw-bold">Relationship Timeline</h6>
                                   </div>
                                   <div className="row g-2">
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">First Order</small>
                                             <span className="fw-medium">
                                                  {new Date(analytics.supplier_info.relationship_timeline.first_order_date).toLocaleDateString()}
                                             </span>
                                             <small className="text-muted d-block">
                                                  {analytics.supplier_info.relationship_timeline.days_since_first_order} days ago
                                             </small>
                                        </div>
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Last Order</small>
                                             <span className="fw-medium">
                                                  {new Date(analytics.supplier_info.relationship_timeline.last_order_date).toLocaleDateString()}
                                             </span>
                                             <small className={`d-block ${analytics.supplier_info.relationship_timeline.days_since_last_order <= 30 ? 'text-success' : analytics.supplier_info.relationship_timeline.days_since_last_order <= 90 ? 'text-warning' : 'text-danger'}`}>
                                                  {analytics.supplier_info.relationship_timeline.days_since_last_order} days ago
                                             </small>
                                        </div>
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Active Months</small>
                                             <span className="fw-medium">{analytics.supplier_info.relationship_timeline.active_months}</span>
                                        </div>
                                        <div className="col-sm-6">
                                             <small className="text-muted d-block">Supplier ID</small>
                                             <span className="fw-medium">{analytics.supplier_info.supplier_id}</span>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Performance Scorecard */}
               <h5 className="mb-3 fw-semibold">Performance Scorecard</h5>
               <div className="row g-3 mb-4">
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#3b82f6' }}>
                                        <RiBarChartLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Performance Score</h6>
                                        <p className="small text-muted mb-0">Comprehensive performance evaluation score out of 100</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-primary mb-1">{analytics.performance_scorecard.overall_performance.performance_score}/100</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#f59e0b' }}>
                                        <RiAlertLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Risk Category</h6>
                                        <p className="small text-muted mb-0">Supplier risk level based on performance metrics</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className={`fs-3 fw-bold mb-1 ${analytics.performance_scorecard.overall_performance.risk_category === 'Low' ? 'text-success' : analytics.performance_scorecard.overall_performance.risk_category === 'Medium' ? 'text-warning' : 'text-danger'}`}>
                                        {analytics.performance_scorecard.overall_performance.risk_category}
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiStarLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Strategic Importance</h6>
                                        <p className="small text-muted mb-0">Criticality level for business operations and supply chain</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{analytics.performance_scorecard.overall_performance.strategic_importance}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiCheckLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Quality Performance</h6>
                                        <p className="small text-muted mb-0">Percentage of quality standards met and maintained</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-secondary mb-1">{(analytics.performance_scorecard.operational_metrics.quality_performance * 100).toFixed(1)}%</div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Volume Metrics */}
               <h5 className="mb-3 fw-semibold">Volume Metrics</h5>
               <div className="row g-3 mb-4">
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiBarChartLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Items Supplied</h6>
                                        <p className="small text-muted mb-0">Total number of distinct products supplied by this vendor</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-success mb-1">{analytics.performance_scorecard.volume_metrics.total_orders}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiMoneyDollarCircleLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Total Spend</h6>
                                        <p className="small text-muted mb-0">Total amount spent with this supplier</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-success mb-1">{currencyFormatter.format(analytics.performance_scorecard.volume_metrics.total_spend)}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiBarChartLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Avg Order Value</h6>
                                        <p className="small text-muted mb-0">Average monetary value per order placed</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-success mb-1">{currencyFormatter.format(analytics.performance_scorecard.volume_metrics.avg_order_value)}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiBarChartLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Largest Order</h6>
                                        <p className="small text-muted mb-0">Highest monetary value of any single order</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-success mb-1">{currencyFormatter.format(analytics.performance_scorecard.volume_metrics.largest_order)}</div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Operational Metrics */}
               <h5 className="mb-3 fw-semibold">Operational Metrics</h5>
               <div className="row g-3 mb-4">
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiTimeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Items Supplied</h6>
                                        <p className="small text-muted mb-0">Total number of distinct products supplied by this vendor</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{analytics.performance_scorecard.operational_metrics.unique_items_supplied}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiTimeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Avg Lead Time</h6>
                                        <p className="small text-muted mb-0">Average time from order placement to delivery completion</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{analytics.performance_scorecard.operational_metrics.avg_lead_time.toFixed(1)} days</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiTimeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Lead Time Consistency</h6>
                                        <p className="small text-muted mb-0">Percentage of deliveries meeting expected timeframes</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{(analytics.performance_scorecard.operational_metrics.lead_time_consistency * 100).toFixed(1)}%</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiTimeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Avg Delivery Delay</h6>
                                        <p className="small text-muted mb-0">Average number of days deliveries are late beyond due date</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{analytics.performance_scorecard.operational_metrics.avg_delivery_delay.toFixed(1)} days</div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Order Status Breakdown */}
               <h5 className="mb-3 fw-semibold">Order Status Breakdown</h5>
               <div className="row g-3 mb-4">
                    <div className="col-md-4 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiCheckLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Completed Orders</h6>
                                        <p className="small text-muted mb-0">Orders that have been fully delivered and accepted</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-success mb-1">{analytics.performance_scorecard.order_status_breakdown.completed_orders}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#f59e0b' }}>
                                        <RiTimeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Pending Orders</h6>
                                        <p className="small text-muted mb-0">Orders that are still in process and not yet completed</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-warning mb-1">{analytics.performance_scorecard.order_status_breakdown.pending_orders}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiFileListLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Partially Received</h6>
                                        <p className="small text-muted mb-0">Orders with some items delivered but not fully complete</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{analytics.performance_scorecard.order_status_breakdown.partially_received_orders}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#ef4444' }}>
                                        <RiAlertLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Cancelled Orders</h6>
                                        <p className="small text-muted mb-0">Orders that were terminated before completion</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-danger mb-1">{analytics.performance_scorecard.order_status_breakdown.cancelled_orders}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#3b82f6' }}>
                                        <RiPieChartLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Completion Rate</h6>
                                        <p className="small text-muted mb-0">Percentage of total orders that were successfully completed</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-primary mb-1">{(analytics.performance_scorecard.order_status_breakdown.completion_rate * 100).toFixed(1)}%</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-4 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#ef4444' }}>
                                        <RiBarChartLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Cancellation Rate</h6>
                                        <p className="small text-muted mb-0">Percentage of orders that were cancelled or terminated</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-danger mb-1">{(analytics.performance_scorecard.order_status_breakdown.cancellation_rate * 100).toFixed(1)}%</div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Delivery Performance & Quality Metrics */}
               <div className="row g-3 mb-4">
                    {/* Delivery Performance */}
                    <div className="col-12 mb-3">
                         <h6 className="mb-3 fw-semibold">Delivery Performance</h6>
                         <div className="row g-3">
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#10b981' }}>
                                                  <RiCheckLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">On-Time Rate</h6>
                                                  <p className="small text-muted mb-0">Percentage of deliveries on time</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-success mb-1">{(analytics.delivery_performance.summary.on_time_rate * 100).toFixed(1)}%</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#06b6d4' }}>
                                                  <RiTimeLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Avg Lead Time</h6>
                                                  <p className="small text-muted mb-0">Average time taken from order to delivery completion</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-info mb-1">{analytics.delivery_performance.lead_time_analysis.avg_actual_lead_time.toFixed(1)} days</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#3b82f6' }}>
                                                  <RiTruckLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Total Deliveries</h6>
                                                  <p className="small text-muted mb-0">Total number of delivery shipments processed</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-primary mb-1">{analytics.delivery_performance.summary.total_deliveries}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#10b981' }}>
                                                  <RiCheckLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">On-Time Deliveries</h6>
                                                  <p className="small text-muted mb-0">Number of deliveries that arrived on or before due date</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-success mb-1">{analytics.delivery_performance.summary.on_time_deliveries}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#ef4444' }}>
                                                  <RiAlertLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Late Deliveries</h6>
                                                  <p className="small text-muted mb-0">Number of deliveries that arrived after their due date</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-danger mb-1">{analytics.delivery_performance.summary.late_deliveries}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#f59e0b' }}>
                                                  <RiStarLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Reliability Rating</h6>
                                                  <p className="small text-muted mb-0">Overall delivery reliability score out of 5 stars</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-warning mb-1">{analytics.delivery_performance.summary.reliability_rating}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#ef4444' }}>
                                                  <RiTimeLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Avg Delay</h6>
                                                  <p className="small text-muted mb-0">Average number of days late for delayed deliveries</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-danger mb-1">{analytics.delivery_performance.delay_analysis.avg_delay_days.toFixed(1)} days</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#06b6d4' }}>
                                                  <RiBarChartLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Lead Time Variance</h6>
                                                  <p className="small text-muted mb-0">Standard deviation in delivery time performance</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-3 fw-bold text-info mb-1">{analytics.delivery_performance.lead_time_analysis.avg_lead_time_variance.toFixed(1)} days</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="col-12 mb-3">
                         <h6 className="mb-3 fw-semibold">Quality Metrics</h6>
                         <div className="row g-3">
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#10b981' }}>
                                                  <RiCheckLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Quality Rating</h6>
                                                  <p className="small text-muted mb-0">Comprehensive quality score based on all inspections</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-success mb-1">{analytics.quality_metrics.quality_scores.overall_quality_rating}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#06b6d4' }}>
                                                  <RiFileListLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Total Receipts</h6>
                                                  <p className="small text-muted mb-0">Total quantity of items received for quality inspection</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-info mb-1">{analytics.quality_metrics.condition_breakdown.total_receipts}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#10b981' }}>
                                                  <RiCheckLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Good Condition</h6>
                                                  <p className="small text-muted mb-0">Items that passed all quality and condition checks</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-success mb-1">{analytics.quality_metrics.condition_breakdown.good_condition_count}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#f59e0b' }}>
                                                  <RiAlertLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Acceptable</h6>
                                                  <p className="small text-muted mb-0">Items with minor issues but still usable</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-warning mb-1">{analytics.quality_metrics.condition_breakdown.acceptable_condition_count}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#ef4444' }}>
                                                  <RiAlertLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Poor Condition</h6>
                                                  <p className="small text-muted mb-0">Items with significant damage or quality issues</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-danger mb-1">{analytics.quality_metrics.condition_breakdown.poor_condition_count}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#10b981' }}>
                                                  <RiCheckLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Passed Checks</h6>
                                                  <p className="small text-muted mb-0">Number of quality inspections that were successful</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-success mb-1">{analytics.quality_metrics.quality_check_results.passed_quality_checks}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#ef4444' }}>
                                                  <RiAlertLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Failed Checks</h6>
                                                  <p className="small text-muted mb-0">Quality checks failed</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-danger mb-1">{analytics.quality_metrics.quality_check_results.failed_quality_checks}</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#06b6d4' }}>
                                                  <RiTimeLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Avg Shelf Life</h6>
                                                  <p className="small text-muted mb-0">Average shelf life on arrival</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-info mb-1">{analytics.quality_metrics.shelf_life_analysis.avg_shelf_life_on_arrival.toFixed(1)} days</div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: '#ef4444' }}>
                                                  <RiAlertLine size={32} />
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">Expired Items</h6>
                                                  <p className="small text-muted mb-0">Items expired on arrival</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="fs-4 fw-bold text-danger mb-1">{analytics.quality_metrics.shelf_life_analysis.expired_on_arrival}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Monthly Trends */}
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Monthly Trends
                              </h2>
                         </div>
                    </div>
                    <div className="card-body p-0">
                         <div style={{ width: "100%", height: 350 }}>
                              <ResponsiveContainer>
                                   <LineChart
                                        data={analytics.monthly_trends}
                                        margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                   >
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                        <XAxis
                                             dataKey="period"
                                             tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                                             angle={-45}
                                             textAnchor="end"
                                             height={60}
                                             interval="preserveStartEnd"
                                             tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                             axisLine={{ stroke: COLOR_BORDER }}
                                             tickLine={{ stroke: COLOR_BORDER }}
                                        />
                                        <YAxis
                                             tickFormatter={(value) => currencyFormatter.format(value)}
                                             tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                             axisLine={false}
                                             tickLine={false}
                                             width={95}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                        <Legend
                                             verticalAlign="top"
                                             align="right"
                                             iconType="circle"
                                             iconSize={8}
                                             wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
                                        />
                                        <Line
                                             type="monotone"
                                             dataKey="metrics.monthly_spend"
                                             name="Monthly Spend"
                                             stroke={COLOR_ACCENT}
                                             strokeWidth={2}
                                             dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                                             activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
                                        />
                                        <Line
                                             type="monotone"
                                             dataKey="metrics.avg_monthly_order_value"
                                             name="Avg Order Value"
                                             stroke={COLOR_SECONDARY}
                                             strokeWidth={2}
                                             dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                                             activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }}
                                        />
                                   </LineChart>
                              </ResponsiveContainer>
                         </div>
                    </div>
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="print-date-range" style={{ display: 'none' }}>
                              Report Period: Monthly Trends
                         </div>
                         <div className="d-flex justify-content-between mb-2">
                              <h4 className="fs-6 fw-medium mb-3">Monthly Data Table</h4>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th className="text-start">Period</th>
                                             <th className="text-center">Orders</th>
                                             <th className="text-end">Monthly Spend</th>
                                             <th className="text-end">Avg Order Value</th>
                                             <th className="text-center">Completed</th>
                                             <th className="text-center">Pending</th>
                                             <th className="text-center">Cancelled</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {analytics.monthly_trends.map((trend, index) => (
                                             <tr key={index}>
                                                  <td className="text-start fw-medium">{trend.period}</td>
                                                  <td className="text-center">
                                                       <span className="badge bg-primary">{trend.metrics.monthly_orders}</span>
                                                  </td>
                                                  <td className="text-end fw-medium text-success">{currencyFormatter.format(trend.metrics.monthly_spend)}</td>
                                                  <td className="text-end text-info">{currencyFormatter.format(trend.metrics.avg_monthly_order_value)}</td>
                                                  <td className="text-center">
                                                       <span className="badge bg-success">{trend.order_status.completed_orders}</span>
                                                  </td>
                                                  <td className="text-center">
                                                       <span className="badge bg-warning">{trend.order_status.pending_orders}</span>
                                                  </td>
                                                  <td className="text-center">
                                                       <span className="badge bg-danger">{trend.order_status.cancelled_orders}</span>
                                                  </td>
                                             </tr>
                                        ))}
                                        {analytics.monthly_trends.length > 0 && (
                                             <tr className="fw-bold border-top">
                                                  <td className="text-start">Total</td>
                                                  <td className="text-center">
                                                       <span className="badge bg-primary">
                                                            {analytics.monthly_trends.reduce((sum, trend) => sum + trend.metrics.monthly_orders, 0)}
                                                       </span>
                                                  </td>
                                                  <td className="text-end text-success">
                                                       {currencyFormatter.format(analytics.monthly_trends.reduce((sum, trend) => sum + trend.metrics.monthly_spend, 0))}
                                                  </td>
                                                  <td className="text-end text-info">
                                                       {currencyFormatter.format(analytics.monthly_trends.reduce((sum, trend) => sum + trend.metrics.monthly_spend, 0) / analytics.monthly_trends.reduce((sum, trend) => sum + trend.metrics.monthly_orders, 0) || 0)}
                                                  </td>
                                                  <td className="text-center">
                                                       <span className="badge bg-success">
                                                            {analytics.monthly_trends.reduce((sum, trend) => sum + trend.order_status.completed_orders, 0)}
                                                       </span>
                                                  </td>
                                                  <td className="text-center">
                                                       <span className="badge bg-warning">
                                                            {analytics.monthly_trends.reduce((sum, trend) => sum + trend.order_status.pending_orders, 0)}
                                                       </span>
                                                  </td>
                                                  <td className="text-center">
                                                       <span className="badge bg-danger">
                                                            {analytics.monthly_trends.reduce((sum, trend) => sum + trend.order_status.cancelled_orders, 0)}
                                                       </span>
                                                  </td>
                                             </tr>
                                        )}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>

               {/* Product Portfolio */}
               <div className="border rounded mb-4" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)' }}>
                    <div className="p-3">
                         <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0 fw-bold">Product Portfolio</h6>
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={() => openModal('Product Portfolio Chart', 'product_portfolio_chart')}
                              >
                                   <RiPieChartLine size={16} className="me-1" />
                                   View Chart
                              </button>
                         </div>

                         {analytics.product_portfolio.length > 0 ? (
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="fw-medium">Item Name</th>
                                                  <th className="fw-medium">SKU</th>
                                                  <th className="fw-medium">Category</th>
                                                  <th className="fw-medium text-center">Orders</th>
                                                  <th className="fw-medium text-end">Total Qty</th>
                                                  <th className="fw-medium text-center">Fulfillment</th>
                                                  <th className="fw-medium text-end">Avg Price</th>
                                                  <th className="fw-medium text-end">Total Spend</th>
                                                  <th className="fw-medium text-center">Last Order</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {analytics.product_portfolio.map((item) => (
                                                  <tr key={item.item_id}>
                                                       <td className="fw-medium">{item.item_name}</td>
                                                       <td>
                                                            <code className="text-muted small">{item.sku}</code>
                                                       </td>
                                                       <td>
                                                            <span className="badge bg-secondary">{item.category_name}</span>
                                                       </td>
                                                       <td className="text-center">
                                                            <span className="badge bg-info">{item.order_metrics.times_ordered}</span>
                                                       </td>
                                                       <td className="text-end fw-medium text-primary">{item.order_metrics.total_quantity_ordered.toLocaleString()}</td>
                                                       <td className="text-center">
                                                            <span className={`badge ${(item.order_metrics.avg_fulfillment_rate * 100) >= 80 ? 'bg-success' : (item.order_metrics.avg_fulfillment_rate * 100) >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                                                 {(item.order_metrics.avg_fulfillment_rate * 100).toFixed(1)}%
                                                            </span>
                                                       </td>
                                                       <td className="text-end fw-medium text-success">{currencyFormatter.format(item.pricing_metrics.avg_unit_price)}</td>
                                                       <td className="text-end fw-medium text-success">{currencyFormatter.format(item.pricing_metrics.total_spend_on_item)}</td>
                                                       <td className="text-center text-muted small">{item.recent_activity.days_since_last_order} days ago</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         ) : (
                              <div className="text-center py-4">
                                   <RiFileListLine size={48} className="text-muted mb-3" />
                                   <h6 className="text-muted mb-2">No Product Portfolio Data</h6>
                                   <p className="text-muted small mb-0">Product information will appear here when available</p>
                              </div>
                         )}
                    </div>
               </div>

               {/* Recent Activity */}
               <div className="row g-3">
                    {/* Recent Orders */}
                    <div className="col-lg-6">
                         <div className="border rounded h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)' }}>
                              <div className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0 fw-bold">Recent Orders</h6>
                                        <RiBookOpenLine size={16} className="text-muted" />
                                   </div>

                                   {analytics.recent_activity.orders.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover mb-0">
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th className="fw-medium">Order #</th>
                                                            <th className="fw-medium">Date</th>
                                                            <th className="fw-medium">Status</th>
                                                            <th className="fw-medium text-end">Value</th>
                                                            <th className="fw-medium text-center">Items</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.recent_activity.orders.slice(0, 5).map((order) => (
                                                            <tr key={order.order_id}>
                                                                 <td className="fw-medium">{order.order_number}</td>
                                                                 <td className="text-muted small">
                                                                      {new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                 </td>
                                                                 <td>
                                                                      <span className={`badge ${order.status === 'received' ? 'bg-success' : order.status === 'pending' ? 'bg-warning' : order.status === 'partially_received' ? 'bg-info' : 'bg-secondary'}`}>
                                                                           {order.status.replace('_', ' ')}
                                                                      </span>
                                                                 </td>
                                                                 <td className="text-end fw-medium text-success">{currencyFormatter.format(order.total_amount)}</td>
                                                                 <td className="text-center">
                                                                      <span className="badge bg-primary">{order.line_item_count}</span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <RiBookOpenLine size={48} className="text-muted mb-3" />
                                             <h6 className="text-muted mb-2">No Recent Orders</h6>
                                             <p className="text-muted small mb-0">Order activity will be displayed here when available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="col-lg-6">
                         <div className="border rounded h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)' }}>
                              <div className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0 fw-bold">Recent Payments</h6>
                                        <RiMoneyDollarCircleLine size={16} className="text-muted" />
                                   </div>

                                   {analytics.recent_activity.payments.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover mb-0">
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th className="fw-medium">Reference</th>
                                                            <th className="fw-medium text-end">Amount</th>
                                                            <th className="fw-medium">Date</th>
                                                            <th className="fw-medium text-center">Status</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.recent_activity.payments.slice(0, 5).map((payment) => (
                                                            <tr key={payment.payment_id}>
                                                                 <td className="fw-medium">{payment.payment_reference}</td>
                                                                 <td className="text-end fw-medium text-success">{currencyFormatter.format(payment.payment_amount)}</td>
                                                                 <td className="text-muted small">
                                                                      {new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                                 </td>
                                                                 <td className="text-center">
                                                                      <span className={`badge ${payment.payment_status === 'completed' ? 'bg-success' : payment.payment_status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                           {payment.payment_status}
                                                                      </span>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <RiMoneyDollarCircleLine size={48} className="text-muted mb-3" />
                                             <h6 className="text-muted mb-2">No Recent Payments</h6>
                                             <p className="text-muted small mb-0">Payment activity will be displayed here when available</p>
                                        </div>
                                   )}
                              </div>
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

