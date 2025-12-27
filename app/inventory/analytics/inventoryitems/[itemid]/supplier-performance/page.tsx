'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { RiArrowLeftLine, RiRefreshLine, RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiCalendarEventLine, RiBuildingLine, RiCheckboxCircleLine, RiCloseCircleLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb'; // Blue
const COLOR_SUCCESS = '#10b981'; // Green
const COLOR_WARNING = '#f59e0b'; // Orange
const COLOR_DANGER = '#ef4444'; // Red

interface SupplierPerformanceMetrics {
     supplier_id: string;
     supplier_name: string;
     total_deliveries: number;
     total_quantity_received: number;
     total_amount: number;
     avg_lead_time_days: number;
     min_lead_time_days: number;
     max_lead_time_days: number;
     on_time_delivery_rate_percent: number;
     rejection_rate_percent: number;
     failed_qc_count: number;
     price_stability_stddev: number;
     dependency_risk_percent: number;
     is_single_source: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
     if (active && payload && payload.length) {
          return (
               <div className="rounded-lg border p-2 shadow-sm"
                    style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                    <div className="mb-2">
                         <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Supplier</span>
                         <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                    </div>
                    {payload.map((item: any, index: number) => (
                         <div key={index} className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                              <span className="fw-bold d-block" style={{ color: item.color }}>
                                   {item.dataKey?.includes('percent') ? `${item.value}%` : item.dataKey?.includes('amount') ? currencyFormatter.format(item.value) : item.value?.toLocaleString()}
                              </span>
                         </div>
                    ))}
               </div>
          );
     }
     return null;
};

export default function ItemSupplierPerformanceAnalyticsPage() {
     const params = useParams();
     const itemId = params?.itemid as string;

     const [supplierData, setSupplierData] = useState<SupplierPerformanceMetrics[]>([]);
     const [loading, setLoading] = useState(true);
     const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (itemId && branchid && employeeid) {
               loadSupplierPerformanceAnalytics();
          }
     }, [itemId, branchid, employeeid, startDate, endDate]);

     const loadSupplierPerformanceAnalytics = async () => {
          try {
               setLoading(true);
               let url = `inventory/analytics/items/${itemId}/supplier-performance?branchid=${branchid}&employeeid=${employeeid}`;

               if (startDate) {
                    url += `&startDate=${startDate}`;
               }
               if (endDate) {
                    url += `&endDate=${endDate}`;
               }

               const response = await customFetch(url);

               if (response.success) {
                    setSupplierData(response.data);
               } else {
                    toast.error('Failed to load supplier performance analytics');
               }
          } catch (error) {
               console.error('Error loading supplier performance analytics:', error);
               toast.error('Error loading supplier performance analytics');
          } finally {
               setLoading(false);
          }
     };

     const renderChart = () => {
          const data = supplierData.map(supplier => ({
               name: supplier.supplier_name.length > 20 ? supplier.supplier_name.substring(0, 20) + '...' : supplier.supplier_name,
               fullName: supplier.supplier_name,
               onTimeDeliveryRate: supplier.on_time_delivery_rate_percent,
               rejectionRate: supplier.rejection_rate_percent,
               totalAmount: supplier.total_amount,
               totalDeliveries: supplier.total_deliveries,
               avgLeadTime: supplier.avg_lead_time_days
          }));

          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 80 },
          };

          const xAxisProps = {
               dataKey: "name",
               angle: -45,
               textAnchor: "end" as const,
               height: 80,
               interval: 0,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          // Calculate the maximum value for proper y-axis scaling
          const maxValue = Math.max(
               ...data.flatMap(d => [
                    Number(d.onTimeDeliveryRate) || 0,
                    Number(d.rejectionRate) || 0
               ])
          );

          const yAxisProps = {
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 60,
               domain: [0, maxValue],
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (chartType === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} tickFormatter={(value) => `${value}%`} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="onTimeDeliveryRate" name="On-Time Delivery %" fill={COLOR_SUCCESS} radius={[4, 4, 0, 0]} maxBarSize={40} />
                         <Bar dataKey="rejectionRate" name="Rejection Rate %" fill={COLOR_DANGER} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
               );
          } else if (chartType === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} tickFormatter={(value) => `${value}%`} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="onTimeDeliveryRate" name="On-Time Delivery %" stroke={COLOR_SUCCESS} strokeWidth={2}
                              dot={{ r: 4, strokeWidth: 1, fill: COLOR_SUCCESS }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SUCCESS, stroke: COLOR_TOOLTIP_BG }} />
                         <Line type="monotone" dataKey="rejectionRate" name="Rejection Rate %" stroke={COLOR_DANGER} strokeWidth={2}
                              dot={{ r: 4, strokeWidth: 1, fill: COLOR_DANGER }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_DANGER, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          } else if (chartType === "area") {
               return (
                    <AreaChart {...commonProps}>
                         <defs>
                              <linearGradient id="onTimeFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_SUCCESS} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_SUCCESS} stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="rejectionFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_DANGER} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_DANGER} stopOpacity={0.05} />
                              </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} tickFormatter={(value) => `${value}%`} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Area type="monotone" dataKey="onTimeDeliveryRate" name="On-Time Delivery %" stroke={COLOR_SUCCESS} fill="url(#onTimeFill)" strokeWidth={2}
                              dot={{ r: 4, strokeWidth: 1, fill: COLOR_SUCCESS }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SUCCESS, stroke: COLOR_TOOLTIP_BG }} />
                         <Area type="monotone" dataKey="rejectionRate" name="Rejection Rate %" stroke={COLOR_DANGER} fill="url(#rejectionFill)" strokeWidth={2}
                              dot={{ r: 4, strokeWidth: 1, fill: COLOR_DANGER }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_DANGER, stroke: COLOR_TOOLTIP_BG }} />
                    </AreaChart>
               );
          } else {
               return <div>Invalid chart type</div>;
          }
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <div className="text-center">
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <h5 className="text-muted">Loading Supplier Performance Analytics...</h5>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <Link href={`/inventory/analytics/inventoryitems/${itemId}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                              <RiArrowLeftLine size={16} className="me-1" />
                              Back to Inventory Item
                         </Link>
                    </div>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiBuildingLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Supplier Performance Analytics
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                              <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                   <button
                                        type="button"
                                        className={`btn ${chartType === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                        onClick={() => setChartType('bar')}
                                        style={chartType === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                   >
                                        <RiBarChartBoxLine size={16} className="me-1 align-text-bottom" /> Bar
                                   </button>
                                   <button
                                        type="button"
                                        className={`btn ${chartType === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                        onClick={() => setChartType('line')}
                                        style={chartType === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                   >
                                        <RiLineChartLine size={16} className="me-1 align-text-bottom" /> Line
                                   </button>
                                   <button
                                        type="button"
                                        className={`btn ${chartType === 'area' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                        onClick={() => setChartType('area')}
                                        style={chartType === 'area' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                   >
                                        <RiBubbleChartLine size={16} className="me-1 align-text-bottom" /> Area
                                   </button>
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                   <div className="d-flex align-items-center gap-2">
                                        <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                  <RiCalendarEventLine size={14} className="text-muted" />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                  <RiCalendarEventLine size={14} className="text-muted" />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                        </div>
                                        <button
                                             onClick={() => {
                                                  setStartDate('');
                                                  setEndDate('');
                                                  loadSupplierPerformanceAnalytics();
                                             }}
                                             className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                             type="button"
                                             style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                                        >
                                             <RiRefreshLine size={14} className="me-1" /> Clear
                                        </button>
                                        <button
                                             onClick={loadSupplierPerformanceAnalytics}
                                             className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                             type="button"
                                             disabled={loading}
                                             style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                                        >
                                             <RiRefreshLine size={16} className="me-1" /> Apply Dates
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
               <div className="card-body p-3 p-md-4">
                    <div style={{ width: "100%", height: 350 }}>
                         <ResponsiveContainer>
                              {supplierData.length > 0 ? renderChart() : (
                                   <div className="d-flex justify-content-center align-items-center h-100">
                                        <div className="text-center">
                                             <RiBuildingLine size={48} className="text-muted mb-3" />
                                             <h6 className="text-muted">No supplier performance data available</h6>
                                        </div>
                                   </div>
                              )}
                         </ResponsiveContainer>
                    </div>
               </div>

               {supplierData.length > 0 && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="print-date-range" style={{ display: 'none' }}>
                              Supplier Performance Analytics Report {startDate && endDate ? `- ${startDate} to ${endDate}` : ''}
                         </div>
                         <div className="d-flex justify-content-between mb-2">
                              <h4 className="fs-6 fw-medium mb-3">
                                   Supplier Performance Data Table
                              </h4>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                   Print
                              </button>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">Supplier Name</th>
                                             <th scope="col" className="py-2">Total Deliveries</th>
                                             <th scope="col" className="py-2">Total Quantity</th>
                                             <th scope="col" className="py-2">Total Amount</th>
                                             <th scope="col" className="py-2">Avg Lead Time (Days)</th>
                                             <th scope="col" className="py-2">On-Time Delivery %</th>
                                             <th scope="col" className="py-2">Rejection Rate %</th>
                                             <th scope="col" className="py-2">Failed QC Count</th>
                                             <th scope="col" className="py-2">Single Source</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {Array.isArray(supplierData) && supplierData.map((supplier, index) => (
                                             <tr key={index}>
                                                  <td className="py-2 fw-medium">{supplier.supplier_name}</td>
                                                  <td className="py-2">{supplier.total_deliveries.toLocaleString()}</td>
                                                  <td className="py-2">{Number(supplier.total_quantity_received).toLocaleString()}</td>
                                                  <td className="py-2">{currencyFormatter.format(supplier.total_amount)}</td>
                                                  <td className="py-2">{Number(supplier.avg_lead_time_days).toFixed(1)}</td>
                                                  <td className="py-2">
                                                       <span className={supplier.on_time_delivery_rate_percent >= 95 ? 'text-success' : supplier.on_time_delivery_rate_percent >= 85 ? 'text-warning' : 'text-danger'}>
                                                            <RiCheckboxCircleLine size={12} className="me-1" />
                                                            {Number(supplier.on_time_delivery_rate_percent).toFixed(1)}%
                                                       </span>
                                                  </td>
                                                  <td className="py-2">
                                                       <span className={supplier.rejection_rate_percent <= 2 ? 'text-success' : supplier.rejection_rate_percent <= 5 ? 'text-warning' : 'text-danger'}>
                                                            <RiCloseCircleLine size={12} className="me-1" />
                                                            {Number(supplier.rejection_rate_percent).toFixed(1)}%
                                                       </span>
                                                  </td>
                                                  <td className="py-2">{supplier.failed_qc_count}</td>
                                                  <td className="py-2">
                                                       {supplier.is_single_source ? (
                                                            <span className="text-danger">Yes</span>
                                                       ) : (
                                                            <span className="text-success">No</span>
                                                       )}
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               )}
          </div>
     );
}