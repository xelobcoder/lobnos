'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../../../components/reports/ExportPdfButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { RiArrowLeftLine, RiRefreshLine, RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiCalendarEventLine, RiRecycleLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb'; // Blue

interface WastageAnalytics {
     period: string;
     period_type: 'daily' | 'monthly' | 'yearly';
     quantity: number;
     amount: number;
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
                                   {item.dataKey?.includes('amount') ? currencyFormatter.format(item.value) : item.value?.toLocaleString()}
                              </span>
                         </div>
                    ))}
               </div>
          );
     }
     return null;
};

export default function ItemWastageAnalyticsPage() {
     const params = useParams();
     const itemId = params?.itemid as string;

     const [dailyData, setDailyData] = useState<WastageAnalytics[]>([]);
     const [monthlyData, setMonthlyData] = useState<WastageAnalytics[]>([]);
     const [yearlyData, setYearlyData] = useState<WastageAnalytics[]>([]);
     const [loading, setLoading] = useState(true);
     const [activePeriod, setActivePeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
     const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
     const [startDate, setStartDate] = useState(() => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
     });
     const [endDate, setEndDate] = useState(() => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
     });
     const [loadedPeriods, setLoadedPeriods] = useState<Set<'daily' | 'monthly' | 'yearly'>>(new Set());

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (itemId && branchid && employeeid) {
               loadWastageAnalytics('daily');
          }
     }, [itemId, branchid, employeeid]);

     const loadWastageAnalytics = async (period?: 'daily' | 'monthly' | 'yearly', forceReload = false) => {
          const targetPeriod = period || activePeriod;
          if (!forceReload && loadedPeriods.has(targetPeriod)) return; // Already loaded

          try {
               setLoading(true);
               const url = targetPeriod === 'daily' && startDate && endDate
                    ? `inventory/analytics/items/${itemId}/wastage/${targetPeriod}?branchid=${branchid}&employeeid=${employeeid}&startDate=${startDate}&endDate=${endDate}`
                    : `inventory/analytics/items/${itemId}/wastage/${targetPeriod}?branchid=${branchid}&employeeid=${employeeid}`;

               const response = await customFetch(url);

               if (response.success) {
                    switch (targetPeriod) {
                         case 'daily':
                              setDailyData(response.data);
                              break;
                         case 'monthly':
                              setMonthlyData(response.data);
                              break;
                         case 'yearly':
                              setYearlyData(response.data);
                              break;
                    }
                    setLoadedPeriods(prev => new Set([...prev, targetPeriod]));
               } else {
                    toast.error(`Failed to load ${targetPeriod} wastage analytics`);
               }
          } catch (error) {
               console.error(`Error loading ${targetPeriod} wastage analytics:`, error);
               toast.error(`Error loading ${targetPeriod} wastage analytics`);
          } finally {
               setLoading(false);
          }
     };

     const getCurrentData = () => {
          switch (activePeriod) {
               case 'daily': return dailyData;
               case 'monthly': return monthlyData;
               case 'yearly': return yearlyData;
               default: return monthlyData;
          }
     };

     const formatPeriod = (periodValue: string) => {
          if (activePeriod === 'daily' && periodValue.includes('-')) {
               const date = new Date(periodValue);
               return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          }
          if (activePeriod === 'monthly' && periodValue.includes('-')) {
               const date = new Date(periodValue + '-01');
               return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
          }
          return periodValue;
     };

     const renderChart = () => {
          const data = getCurrentData();
          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "period",
               tickFormatter: (value: string) => {
                    if (activePeriod === 'daily' && value.includes('-')) {
                         const date = new Date(value);
                         return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }
                    if (activePeriod === 'monthly' && value.includes('-')) {
                         const date = new Date(value + '-01');
                         return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                    }
                    return value;
               },
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
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
                         <YAxis yAxisId="left" orientation="left" tickFormatter={(value: number) => value.toLocaleString()} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} domain={([dataMin, dataMax]: [number, number]) => [0, dataMax]} />
                         <YAxis yAxisId="right" orientation="right" tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} domain={([dataMin, dataMax]: [number, number]) => [0, dataMax]} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar yAxisId="left" dataKey="quantity" name="Wastage Quantity" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar yAxisId="right" dataKey="amount" name="Wastage Amount" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          } else if (chartType === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis yAxisId="left" orientation="left" tickFormatter={(value: number) => value.toLocaleString()} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} domain={([dataMin, dataMax]: [number, number]) => [0, dataMax]} />
                         <YAxis yAxisId="right" orientation="right" tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} domain={([dataMin, dataMax]: [number, number]) => [0, dataMax]} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line yAxisId="left" type="monotone" dataKey="quantity" name="Wastage Quantity" stroke={COLOR_ACCENT} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Line yAxisId="right" type="monotone" dataKey="amount" name="Wastage Amount" stroke={COLOR_SECONDARY} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          } else if (chartType === "area") {
               return (
                    <AreaChart {...commonProps}>
                         <defs>
                              <linearGradient id="quantityFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="amountFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                              </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis yAxisId="left" orientation="left" tickFormatter={(value: number) => value.toLocaleString()} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} domain={([dataMin, dataMax]: [number, number]) => [0, dataMax]} />
                         <YAxis yAxisId="right" orientation="right" tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} domain={([dataMin, dataMax]: [number, number]) => [0, dataMax]} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Area yAxisId="left" type="monotone" dataKey="quantity" name="Wastage Quantity" stroke={COLOR_ACCENT} fill="url(#quantityFill)" strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Area yAxisId="right" type="monotone" dataKey="amount" name="Wastage Amount" stroke={COLOR_SECONDARY} fill="url(#amountFill)" strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
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
                              <h5 className="text-muted">Loading Wastage Analytics...</h5>
                         </div>
                    </div>
               </div>
          );
     }

     const currentData = getCurrentData();

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }} data-pdf-root>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <Link href={`/inventory/analytics/inventoryitems/${itemId}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                              <RiArrowLeftLine size={16} className="me-1" />
                              Back to Inventory Item
                         </Link>
                         <ExportPdfButton
                              title="Item Wastage Analytics"
                              period={activePeriod === 'daily' && startDate && endDate ? `${startDate} to ${endDate}` : undefined}
                              filters={[`Period: ${activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)}`]}
                         />
                    </div>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiRecycleLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Item Wastage Analytics
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
                                   <div className="btn-group btn-group-sm" role="group" aria-label="Period">
                                        <button
                                             type="button"
                                             className={`btn ${activePeriod === 'daily' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                             onClick={() => {
                                                  setActivePeriod('daily');
                                                  loadWastageAnalytics('daily', true);
                                             }}
                                             style={activePeriod === 'daily' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             Daily
                                        </button>
                                        <button
                                             type="button"
                                             className={`btn ${activePeriod === 'monthly' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                             onClick={() => {
                                                  setActivePeriod('monthly');
                                                  loadWastageAnalytics('monthly', true);
                                             }}
                                             style={activePeriod === 'monthly' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             Monthly
                                        </button>
                                        <button
                                             type="button"
                                             className={`btn ${activePeriod === 'yearly' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                             onClick={() => {
                                                  setActivePeriod('yearly');
                                                  loadWastageAnalytics('yearly', true);
                                             }}
                                             style={activePeriod === 'yearly' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             Yearly
                                        </button>
                                   </div>
                                   {activePeriod === 'daily' && (
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
                                                       const now = new Date();
                                                       setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                                                       setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
                                                  }}
                                                  className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                                  type="button"
                                                  style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                                             >
                                                  <RiRefreshLine size={14} className="me-1" /> Reset to Current Month
                                             </button>
                                        </div>
                                   )}
                                   <button onClick={() => loadWastageAnalytics(activePeriod, true)} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" disabled={loading} style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        <RiRefreshLine size={16} className="me-1" /> Load Data
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
               <div className="card-body p-3 p-md-4">
                    <div style={{ width: "100%", height: 350 }}>
                         <ResponsiveContainer>
                              {currentData.length > 0 ? renderChart() : (
                                   <div className="d-flex justify-content-center align-items-center h-100">
                                        <div className="text-center">
                                             <RiRecycleLine size={48} className="text-muted mb-3" />
                                             <h6 className="text-muted">No {activePeriod} wastage data available</h6>
                                        </div>
                                   </div>
                              )}
                         </ResponsiveContainer>
                    </div>
               </div>

               {currentData.length > 0 && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="print-date-range" style={{ display: 'none' }}>
                              Item Wastage Analytics Report - {activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Period
                         </div>
                         <div className="d-flex justify-content-between mb-2">
                              <h4 className="fs-6 fw-medium mb-3">
                                   Wastage Data Table
                              </h4>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                   Print
                              </button>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">Period</th>
                                             <th scope="col" className="py-2">Quantity</th>
                                             <th scope="col" className="py-2">Amount</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {currentData.map((entry, index) => (
                                             <tr key={index}>
                                                  <td className="py-2">{formatPeriod(entry.period)}</td>
                                                  <td className="py-2">{entry.quantity.toLocaleString()}</td>
                                                  <td className="py-2">{currencyFormatter.format(entry.amount)}</td>
                                             </tr>
                                        ))}
                                        <tr className="fw-bold border-top">
                                             <td>Total</td>
                                             <td>{currentData.reduce((sum, entry) => sum + Number(entry.quantity), 0).toLocaleString()}</td>
                                             <td>{currencyFormatter.format(currentData.reduce((sum, entry) => sum + Number(entry.amount), 0))}</td>
                                        </tr>
                                   </tbody>
                              </table>
                         </div>
                    </div>
               )}
          </div>
     );
}