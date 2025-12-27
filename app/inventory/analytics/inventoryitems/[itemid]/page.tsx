'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { RiArrowLeftLine, RiRefreshLine, RiBox3Line, RiTestTubeLine, RiRecycleLine, RiTruckLine, RiTimeLine, RiStarLine, RiErrorWarningLine, RiLoader4Line, RiShoppingCartLine, RiBarChartBoxLine, RiBuildingLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb';
const COLOR_TERTIARY = '#ea580c';
const COLOR_EXPENSES = '#dc2626';

interface ItemSummary {
     total_orders_received: number;
     total_quantity_received: number;
     total_amount_received: number;
     total_consumed_quantity: number;
     total_consumed_amount: number;
     total_wasted_quantity: number;
     total_wasted_amount: number;
     average_daily_consumption_quantity: number;
     average_daily_consumption_amount: number;
     supplier_count: number;
     test_consumption_variance_percent: number;
}

interface ItemAnalytics {
     total_orders_received: number;
     total_quantity_received: number;
     total_amount_received: number;
     total_consumed_quantity: number;
     total_consumed_amount: number;
     total_wasted_quantity: number;
     total_wasted_amount: number;
     average_daily_consumption_quantity: number;
     average_daily_consumption_amount: number;
     supplier_count: number;
     test_consumption_variance_percent: number;
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
                                   {item.dataKey?.includes('amount') || item.dataKey?.includes('price') || item.dataKey?.includes('spend')
                                        ? currencyFormatter.format(item.value)
                                        : item.value?.toLocaleString()}
                              </span>
                         </div>
                    ))}
               </div>
          );
     }
     return null;
};

export default function ItemAnalyticsPage() {
     const params = useParams();
     const itemId = params?.itemid as string;

     const [analytics, setAnalytics] = useState<ItemAnalytics | null>(null);
     const [loading, setLoading] = useState(true);

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (itemId && branchid && employeeid) {
               loadItemAnalytics();
          }
     }, [itemId, branchid, employeeid]);

     const loadItemAnalytics = async () => {
          try {
               setLoading(true);
               const summaryResponse = await customFetch(`inventory/analytics/items/${itemId}/summary?tenantId=3&branchid=${branchid}&employeeid=${employeeid}`);

               if (summaryResponse.success) {
                    setAnalytics(summaryResponse.data);
               } else {
                    toast.error('Failed to load item analytics');
               }
          } catch (error) {
               console.error('Error loading item analytics:', error);
               toast.error('Error loading item analytics');
          } finally {
               setLoading(false);
          }
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <div className="text-center">
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <h5 className="text-muted">Loading Item Analytics...</h5>
                         </div>
                    </div>
               </div>
          );
     }

     if (!analytics) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <div className="text-center">
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="text-danger mb-2">Failed to Load Analytics</h5>
                              <p className="text-muted">Unable to load analytics data for this item.</p>
                              <button className="btn btn-primary" onClick={loadItemAnalytics}>
                                   <RiRefreshLine size={16} className="me-2" />
                                   Retry
                              </button>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                         <Link href="/inventory/analytics" className="btn btn-outline-secondary me-3">
                              <RiArrowLeftLine size={16} className="me-2" />
                              Back to Inventory Analytics
                         </Link>
                         <div>
                              <h4 className="mb-1 fw-bold">Item Analytics</h4>
                              <p className="text-muted mb-0">Item ID: {itemId}</p>
                         </div>
                    </div>
                    <button className="btn btn-primary" onClick={loadItemAnalytics}>
                         <RiRefreshLine size={16} className="me-2" />
                         Refresh
                    </button>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#10b981' }}>
                                        <RiBox3Line size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Total Orders</h6>
                                        <p className="small text-muted mb-0">Orders received</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-success mb-1">{analytics.total_orders_received}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#06b6d4' }}>
                                        <RiTestTubeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Total Consumed</h6>
                                        <p className="small text-muted mb-0">Quantity used</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-info mb-1">{analytics.total_consumed_quantity.toLocaleString()}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3 col-lg-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#ef4444' }}>
                                        <RiRecycleLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Total Wasted</h6>
                                        <p className="small text-muted mb-0">Quantity wasted</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-danger mb-1">{analytics.total_wasted_quantity.toLocaleString()}</div>
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
                                        <h6 className="fw-bold mb-1">Suppliers</h6>
                                        <p className="small text-muted mb-0">Active suppliers</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-primary mb-1">{analytics.supplier_count}</div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Average Consumption */}
               <div className="row g-3 mb-4 mt-2">
                    <div className="col-md-6">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#f59e0b' }}>
                                        <RiTimeLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Avg Daily Consumption</h6>
                                        <p className="small text-muted mb-0">Average quantity consumed per day</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-warning mb-1">{analytics.average_daily_consumption_quantity.toFixed(2)}</div>
                                   <div className="text-muted small">{currencyFormatter.format(analytics.average_daily_consumption_amount)} per day</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex align-items-center mb-3">
                                   <div style={{ color: '#8b5cf6' }}>
                                        <RiStarLine size={32} />
                                   </div>
                                   <div className="ms-3">
                                        <h6 className="fw-bold mb-1">Test Consumption Variance</h6>
                                        <p className="small text-muted mb-0">Variance from expected usage</p>
                                   </div>
                              </div>
                              <div className="mb-3">
                                   <div className="fs-3 fw-bold text-purple mb-1">{analytics.test_consumption_variance_percent.toFixed(1)}%</div>
                              </div>
                         </div>
                    </div>
               </div>
               {/* Item Analytics Modules */}
               <div className="mb-4">
                    <h5 className="mb-3 fw-semibold">Detailed Analytics</h5>
                    <div className="row g-3 mt-2">
                         <div className="col-md-6 col-lg-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-3">
                                        <div style={{ color: '#16a34a' }}>
                                             <RiShoppingCartLine size={32} />
                                        </div>
                                        <div className="ms-3">
                                             <h6 className="fw-bold mb-1">Orders Analytics</h6>
                                             <p className="small text-muted mb-0">Purchase order trends and performance</p>
                                        </div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">
                                             • Order history and patterns
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Supplier performance
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Order fulfillment metrics
                                        </div>
                                   </div>
                                   <Link href={`/inventory/analytics/inventoryitems/${itemId}/orders`} className="btn btn-sm w-100" style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}>
                                        View Orders Analytics
                                   </Link>
                              </div>
                         </div>
                         <div className="col-md-6 col-lg-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-3">
                                        <div style={{ color: '#06b6d4' }}>
                                             <RiTestTubeLine size={32} />
                                        </div>
                                        <div className="ms-3">
                                             <h6 className="fw-bold mb-1">Usage Analytics</h6>
                                             <p className="small text-muted mb-0">Consumption patterns and trends</p>
                                        </div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">
                                             • Daily/monthly/yearly usage
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Consumption forecasting
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Usage efficiency metrics
                                        </div>
                                   </div>
                                   <Link href={`/inventory/analytics/inventoryitems/${itemId}/usage`} className="btn btn-sm w-100" style={{ backgroundColor: '#06b6d4', borderColor: '#06b6d4' }}>
                                        View Usage Analytics
                                   </Link>
                              </div>
                         </div>
                         <div className="col-md-6 col-lg-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-3">
                                        <div style={{ color: '#ef4444' }}>
                                             <RiRecycleLine size={32} />
                                        </div>
                                        <div className="ms-3">
                                             <h6 className="fw-bold mb-1">Wastage Analytics</h6>
                                             <p className="small text-muted mb-0">Waste tracking and reduction insights</p>
                                        </div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">
                                             • Waste quantity and cost
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Waste reduction opportunities
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Efficiency improvement metrics
                                        </div>
                                   </div>
                                   <Link href={`/inventory/analytics/inventoryitems/${itemId}/wastage`} className="btn btn-sm w-100" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                        View Wastage Analytics
                                   </Link>
                              </div>
                         </div>
                    </div>
                    <div className="row g-3 mb-4 mt-2">
                         <div className="col-md-6 col-lg-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-3">
                                        <div style={{ color: '#8b5cf6' }}>
                                             <RiTestTubeLine size={32} />
                                        </div>
                                        <div className="ms-3">
                                             <h6 className="fw-bold mb-1">Test Consumption Analytics</h6>
                                             <p className="small text-muted mb-0">Laboratory test usage vs expectations</p>
                                        </div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">
                                             • Expected vs actual consumption
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Test efficiency metrics
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Consumption variance analysis
                                        </div>
                                   </div>
                                   <Link href={`/inventory/analytics/inventoryitems/${itemId}/test-consumption`} className="btn btn-sm w-100" style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}>
                                        View Test Consumption Analytics
                                   </Link>
                              </div>
                         </div>
                         <div className="col-md-6 col-lg-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-3">
                                        <div style={{ color: '#f59e0b' }}>
                                             <RiBuildingLine size={32} />
                                        </div>
                                        <div className="ms-3">
                                             <h6 className="fw-bold mb-1">Supplier Performance</h6>
                                             <p className="small text-muted mb-0">Supplier reliability and performance metrics</p>
                                        </div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">
                                             • Delivery performance ratings
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Quality control metrics
                                        </div>
                                        <div className="small text-muted mb-1">
                                             • Supplier risk assessment
                                        </div>
                                   </div>
                                   <Link href={`/inventory/analytics/inventoryitems/${itemId}/supplier-performance`} className="btn btn-sm w-100" style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                                        View Supplier Performance
                                   </Link>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}