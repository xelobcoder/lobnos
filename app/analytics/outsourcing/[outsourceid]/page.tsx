"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import {
     ResponsiveContainer,
     PieChart,
     Pie,
     Cell,
     Tooltip,
     Legend,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     LineChart,
     Line,
     Area,
     AreaChart,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { formatDate } from "../../../../components/operations/Laboratory/Lib";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { useParams } from "next/navigation";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: "#3B82F6", marginRight: '0.5rem' }}>🚀</span>;
const IconPie = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🥧</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconLine = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📈</span>;
const IconArea = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📈</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', color: "#64748B" }}>📅</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: "#3B82F6" }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;
const IconBuilding = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🏢</span>;

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_HOVER = 'oklch(0.646 0.222 41.116 / 0.1)';

const PIE_CHART_COLORS = [
     COLOR_ACCENT, 'oklch(0.6 0.15 142)', 'oklch(0.7 0.2 85)', 'oklch(0.5 0.25 25)',
     'oklch(0.55 0.2 15)', '#A855F7', '#EC4899', '#78716C', '#F97316', '#D946EF'
];

export default function SpecificOutsourceAnalytics() {
     const params = useParams();
     const outsourceid = params?.outsourceid ? parseInt(params.outsourceid as string) : undefined;
     const [data, setData] = useState<any[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const [view, setView] = useState<"bar" | "pie" | "line" | "area">("bar");
     const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
     const [branches, setBranches] = useState<any[]>([]);
     const [branchesLoading, setBranchesLoading] = useState<boolean>(false);
     const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
     const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
     const [useCustomDateRange, setUseCustomDateRange] = useState<boolean>(false);
     const [startDate, setStartDate] = useState<string>(() => {
          const date = new Date();
          date.setDate(date.getDate() - 30);
          return date.toISOString().split('T')[0];
     });
     const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
     const [selectedOutsource, setSelectedOutsource] = useState<number | undefined>(undefined);
     const [timePeriod, setTimePeriod] = useState<"hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly");

     const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

     const fetchBranches = useCallback(async () => {
          setBranchesLoading(true);
          try {
               const response = await customFetch('branches');
               if (response && response.result && Array.isArray(response.result)) {
                    setBranches(response.result);
                    if (response.result.length > 0 && selectedBranch === undefined) {
                         setSelectedBranch(response.result[0].branchid);
                    }
               } else if (response && Array.isArray(response)) {
                    setBranches(response);
                    if (response.length > 0 && selectedBranch === undefined) {
                         setSelectedBranch(response[0].branchid);
                    }
               } else {
                    setBranches([]);
               }
          } catch (err) {
               setBranches([]);
          } finally {
               setBranchesLoading(false);
          }
     }, []);

     const fetchData = useCallback(async () => {
          if (!outsourceid) return;

          setLoading(true);
          setError(null);
          try {
               const branchParam = selectedBranch ? `&branchid=${selectedBranch}` : '';
               let url = '';

               switch (timePeriod) {
                    case 'hourly':
                         url = `financials/billing/summary?key=hourlyOutsourcingPattern${branchParam}&outsourceId=${outsourceid}&targetDate=${selectedDate}`;
                         break;
                    case 'daily':
                         if (useCustomDateRange) {
                              url = `financials/billing/summary?key=dailyOutsourcedAmount&startDate=${startDate}&endDate=${endDate}${branchParam}&outsourceId=${outsourceid}`;
                         } else {
                              url = `financials/billing/summary?key=dailyOutsourcedAmountLast30Days${branchParam}&outsourceId=${outsourceid}`;
                         }
                         break;
                    case 'weekly':
                         url = `financials/billing/summary?key=weeklyOutsourcedTrend${branchParam}&outsourceId=${outsourceid}&year=${selectedYear}`;
                         break;
                    case 'monthly':
                         url = `financials/billing/summary?key=monthlyOutsourcedAmountLast12Months${branchParam}&outsourceId=${outsourceid}&year=${selectedYear}`;
                         break;
                    case 'quarterly':
                         url = `financials/billing/summary?key=quarterlyOutsourcedTrend${branchParam}&outsourceId=${outsourceid}&year=${selectedYear}`;
                         break;
                    case 'yearly':
                         url = `financials/billing/summary?key=yearlySummaryByFacility${branchParam}&outsourceId=${outsourceid}`;
                         break;
                    default:
                         url = `financials/billing/summary?key=monthlyOutsourcedAmountLast12Months${branchParam}&outsourceId=${outsourceid}&year=${selectedYear}`;
               }

               const response = await customFetch(url);
               if (response && Array.isArray(response)) {
                    setData(response);
               } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                    setData([response]);
               } else {
                    setData([]);
                    setError((response as any)?.message || "Failed to fetch data or data is in an unexpected format.");
               }
          } catch (err) {
               setData([]);
               setError(err instanceof Error ? err.message : "An unknown error occurred");
          } finally {
               setLoading(false);
          }
     }, [selectedBranch, outsourceid, selectedYear, selectedDate, timePeriod, useCustomDateRange, startDate, endDate]);

     useEffect(() => {
          fetchBranches();
     }, [fetchBranches]);

     useEffect(() => {
          if (selectedBranch !== undefined && outsourceid !== undefined) {
               fetchData();
          }
     }, [selectedBranch, outsourceid, fetchData]);

     // Set selectedOutsource from URL parameter when available
     useEffect(() => {
          if (outsourceid) {
               setSelectedOutsource(outsourceid);
          }
     }, [outsourceid]);

     const calculateTotals = () => {
          if (!data.length) return { totalAmount: 0, totalServices: 0 };

          return data.reduce((acc, item) => {
               let amount = 0;
               let services = 0;

               switch (timePeriod) {
                    case 'hourly':
                         amount = parseFloat(item.total_amount || item.total_amount_outsourced || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.services_count || item.total_services || item.total_outsourced_services || '0') || 0;
                         break;
                    case 'daily':
                         amount = parseFloat(item.daily_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.services_count || item.total_services || item.total_outsourced_services || '0') || 0;
                         break;
                    case 'weekly':
                         amount = parseFloat(item.weekly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.services_count || item.total_services || item.total_outsourced_services || '0') || 0;
                         break;
                    case 'monthly':
                         amount = parseFloat(item.monthly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.total_services || item.services_count || item.total_outsourced_services || '0') || 0;
                         break;
                    case 'quarterly':
                         amount = parseFloat(item.quarterly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.services_count || item.total_services || item.total_outsourced_services || '0') || 0;
                         break;
                    case 'yearly':
                         amount = parseFloat(item.yearly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.services_count || item.total_services || item.total_outsourced_services || '0') || 0;
                         break;
                    default:
                         amount = parseFloat(item.monthly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         services = parseInt(item.total_services || item.services_count || item.total_outsourced_services || '0') || 0;
               }

               return {
                    totalAmount: acc.totalAmount + amount,
                    totalServices: acc.totalServices + services
               };
          }, { totalAmount: 0, totalServices: 0 });
     };

     const { totalAmount, totalServices } = calculateTotals();

     const selectedOrg = { facility_name: `Organization ${outsourceid}`, outsourceid };

     const CustomTooltipContent = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               const currentData = payload[0].payload;
               const name = label || (currentData.month ? `Month ${currentData.month}` : '');

               return (
                    <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, color: COLOR_TOOLTIP_FG, minWidth: '200px', fontSize: '0.8rem' }}>
                         <div className="mb-2 fw-medium" style={{ color: COLOR_TOOLTIP_FG }}>{name}</div>

                         {currentData.monthly_amount && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Monthly Amount</span>
                                   <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                        {currencyFormatter.format(currentData.monthly_amount)}
                                   </span>
                              </div>
                         )}

                         {(currentData.total_services || currentData.services_count || currentData.total_outsourced_services) && (
                              <div className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Services</span>
                                   <span className="fw-bold d-block">
                                        {currentData.total_services || currentData.services_count || currentData.total_outsourced_services}
                                   </span>
                              </div>
                         )}

                         {totalAmount > 0 && currentData.monthly_amount && (
                              <div className="mt-2 pt-1 border-top" style={{ borderColor: COLOR_BORDER }}>
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Share of Total</span>
                                   <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                        {((currentData.monthly_amount / totalAmount) * 100).toFixed(1)}%
                                   </span>
                              </div>
                         )}
                    </div>
               );
          }
          return null;
     };

     const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
          const RADIAN = Math.PI / 180;
          const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          if (percent * 100 < 3) return null;
          return (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="500">{`${(percent * 100).toFixed(0)}%`}</text>);
     };

     const renderChartArea = () => {
          if (loading) {
               return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}><IconLoader /><p className="mt-3" style={{ color: COLOR_TEXT_MUTED }}>Loading {timePeriod} analytics for {selectedOrg?.facility_name || 'selected organization'}...</p></div>);
          }
          if (error && data.length === 0) {
               return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}><IconError /><h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>Error Loading Data</h5><p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>{error}</p></div>);
          }
          if (data.length === 0) {
               return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}><IconEmpty /><h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>No Data Available</h5><p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>No {timePeriod} data found for {selectedOrg?.facility_name || 'selected organization'} {timePeriod === 'daily' && useCustomDateRange ? `(${formatDate(startDate)} to ${formatDate(endDate)})` : timePeriod === 'hourly' ? `on ${formatDate(selectedDate)}` : timePeriod === 'daily' ? '(last 30 days)' : ''}.</p></div>);
          }

          const chartHeight = 450;

          const chartData = data.map(item => {
               let name = '';
               let value = 0;

               switch (timePeriod) {
                    case 'hourly':
                         name = item.hour_of_day !== undefined ? `Hour ${item.hour_of_day}` : 'Unknown';
                         value = parseFloat(item.total_amount || item.total_amount_outsourced || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         break;
                    case 'daily':
                         name = item.service_date ? formatDate(item.service_date) : 'Unknown';
                         value = parseFloat(item.daily_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         break;
                    case 'weekly':
                         name = item.week ? `Week ${item.week}` : 'Unknown';
                         value = parseFloat(item.weekly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         break;
                    case 'monthly':
                         name = item.month ? `Month ${item.month}` : 'Unknown';
                         value = parseFloat(item.monthly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         break;
                    case 'quarterly':
                         name = item.quarter ? `Q${item.quarter}` : 'Unknown';
                         value = parseFloat(item.quarterly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         break;
                    case 'yearly':
                         name = item.year ? `Year ${item.year}` : 'Unknown';
                         value = parseFloat(item.yearly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
                         break;
                    default:
                         name = item.month ? `Month ${item.month}` : 'Unknown';
                         value = parseFloat(item.monthly_amount || item.total_amount_outsourced || item.total_amount || item.grand_total_outsourced || item.total_outsourced_amount || '0') || 0;
               }

               return {
                    ...item,
                    name,
                    value
               };
          });

          if (view === "pie") {
               return (
                    <div style={{ width: '100%', height: chartHeight }}>
                         <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                   <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={Math.min(window.innerWidth / 4.5, 160)}
                                        labelLine={false}
                                        label={renderCustomizedPieLabel}
                                   >
                                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />))}
                                   </Pie>
                                   <Tooltip content={<CustomTooltipContent />} />
                                   <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{
                                             fontSize: '12px',
                                             color: COLOR_TOOLTIP_FG,
                                             paddingLeft: '15px',
                                             maxHeight: chartHeight - 40,
                                             overflowY: 'auto'
                                        }}
                                        formatter={(value) => <span style={{ color: COLOR_TEXT_MUTED }}>{value.length > 20 ? value.substring(0, 18) + '...' : value}</span>}
                                   />
                              </PieChart>
                         </ResponsiveContainer>
                    </div>
               );
          }

          if (view === "line") {
               return (
                    <div style={{ width: '100%', height: chartHeight }}>
                         <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                   <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                                   <Tooltip content={<CustomTooltipContent />} />
                                   <Line type="monotone" dataKey="value" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ fill: COLOR_ACCENT, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: COLOR_ACCENT, strokeWidth: 2 }} />
                              </LineChart>
                         </ResponsiveContainer>
                    </div>
               );
          }

          if (view === "area") {
               return (
                    <div style={{ width: '100%', height: chartHeight }}>
                         <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                   <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                                   <Tooltip content={<CustomTooltipContent />} />
                                   <Area type="monotone" dataKey="value" stroke={COLOR_ACCENT} fill={COLOR_HOVER} strokeWidth={2} />
                              </AreaChart>
                         </ResponsiveContainer>
                    </div>
               );
          }

          const numDataPoints = chartData.length;
          const angleXAxis = numDataPoints > 7;
          const bottomMargin = angleXAxis ? 100 : 60;

          return (
               <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: bottomMargin }} barGap={4} barCategoryGap="20%">
                              <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                              <XAxis dataKey="name" angle={angleXAxis ? -45 : 0} textAnchor={angleXAxis ? "end" : "middle"} height={angleXAxis ? 110 : 70} interval={0} tick={{ fontSize: 10, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                              <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                              <Tooltip content={<CustomTooltipContent />} cursor={{ fill: COLOR_HOVER }} />
                              <Bar dataKey="value" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={50} />
                         </BarChart>
                    </ResponsiveContainer>
               </div>
          );
     };

     return (
          <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_TOOLTIP_BG }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <IconBuilding /> {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Analytics: {selectedOrg?.facility_name || 'Select Organization'}
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                              <Dropdown>
                                   <Dropdown.Toggle variant="outline-secondary" id="timePeriodDropdown" className="d-flex align-items-center" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', flexBasis: '140px', minWidth: '130px' }}>
                                        📊 {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
                                   </Dropdown.Toggle>
                                   <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => setTimePeriod('hourly')} style={{ fontSize: '0.875rem' }}>
                                             Hourly
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => setTimePeriod('daily')} style={{ fontSize: '0.875rem' }}>
                                             Daily
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => setTimePeriod('weekly')} style={{ fontSize: '0.875rem' }}>
                                             Weekly
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => setTimePeriod('monthly')} style={{ fontSize: '0.875rem' }}>
                                             Monthly
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => setTimePeriod('quarterly')} style={{ fontSize: '0.875rem' }}>
                                             Quarterly
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => setTimePeriod('yearly')} style={{ fontSize: '0.875rem' }}>
                                             Yearly
                                        </Dropdown.Item>
                                   </Dropdown.Menu>
                              </Dropdown>

                              <Dropdown>
                                   <Dropdown.Toggle variant="outline-secondary" id="branchDropdown" className="d-flex align-items-center" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', flexBasis: '140px', minWidth: '130px' }}>
                                        🏢 {branchesLoading ? 'Loading...' : (branches.find(b => b.branchid === selectedBranch)?.name || `Select Branch (${branches.length} available)`)}
                                   </Dropdown.Toggle>
                                   <Dropdown.Menu>
                                        {branches.length === 0 && !branchesLoading && (
                                             <Dropdown.Item disabled style={{ fontSize: '0.875rem' }}>
                                                  No branches available
                                             </Dropdown.Item>
                                        )}
                                        {branches.map(branch => (
                                             <Dropdown.Item key={branch.branchid} onClick={() => setSelectedBranch(branch.branchid)} style={{ fontSize: '0.875rem' }}>
                                                  {branch.name}
                                             </Dropdown.Item>
                                        ))}
                                   </Dropdown.Menu>
                              </Dropdown>

                              {(timePeriod === 'hourly') && (
                                   <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                             <IconCalendar />
                                        </span>
                                        <input
                                             id="targetDateHourly"
                                             type="date"
                                             className="form-control shadow-none border-start-0"
                                             value={selectedDate}
                                             onChange={(e) => setSelectedDate(e.target.value)}
                                             aria-label="Target Date"
                                             style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }}
                                        />
                                   </div>
                              )}

                              {(timePeriod === 'daily') && (
                                   <>
                                        {/* Custom Date Range Switch */}
                                        <div className="form-check form-switch d-flex align-items-center" style={{ minWidth: '120px' }}>
                                             <input
                                                  className="form-check-input me-2"
                                                  type="checkbox"
                                                  id="customDateRangeSwitch"
                                                  checked={useCustomDateRange}
                                                  onChange={(e) => setUseCustomDateRange(e.target.checked)}
                                                  style={{ transform: 'scale(0.8)' }}
                                             />
                                             <label className="form-check-label small fw-medium" htmlFor="customDateRangeSwitch" style={{ fontSize: '0.75rem', color: COLOR_TEXT_MUTED }}>
                                                  Custom Range
                                             </label>
                                        </div>

                                        {/* Date Range Inputs - Only show when custom range is enabled */}
                                        {useCustomDateRange && (
                                             <>
                                                  <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                                       <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                                            <IconCalendar />
                                                       </span>
                                                       <input
                                                            id="startDateDaily"
                                                            type="date"
                                                            className="form-control shadow-none border-start-0"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                            aria-label="Start Date"
                                                            style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }}
                                                       />
                                                  </div>
                                                  <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                                       <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                                            <IconCalendar />
                                                       </span>
                                                       <input
                                                            id="endDateDaily"
                                                            type="date"
                                                            className="form-control shadow-none border-start-0"
                                                            value={endDate}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                            min={startDate}
                                                            aria-label="End Date"
                                                            style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }}
                                                       />
                                                  </div>
                                             </>
                                        )}
                                   </>
                              )}

                              {(timePeriod === 'weekly' || timePeriod === 'monthly' || timePeriod === 'quarterly' || timePeriod === 'yearly') && (
                                   <Dropdown>
                                        <Dropdown.Toggle variant="outline-secondary" id="yearDropdown" className="d-flex align-items-center" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                                             📅 {selectedYear}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                             {years.map(year => (
                                                  <Dropdown.Item key={year} onClick={() => setSelectedYear(year)} style={{ fontSize: '0.875rem' }}>
                                                       {year}
                                                  </Dropdown.Item>
                                             ))}
                                        </Dropdown.Menu>
                                   </Dropdown>
                              )}

                              <div className="btn-group btn-group-sm" role="group">
                                   <button type="button" className={`btn ${view === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('bar')} style={view === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}>
                                        <IconBar /> Bar
                                   </button>
                                   <button type="button" className={`btn ${view === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('line')} style={view === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}>
                                        <IconLine /> Line
                                   </button>
                                   <button type="button" className={`btn ${view === 'area' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('area')} style={view === 'area' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}>
                                        <IconArea /> Area
                                   </button>
                              </div>

                              <button onClick={fetchData} className="btn btn-sm btn-success d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', backgroundColor: '#198754', borderColor: '#198754' }} disabled={!outsourceid || loading}>
                                   <IconRefresh /> {loading ? 'Loading...' : 'Load Data'}
                              </button>
                         </div>
                    </div>
               </div>

               <div className="card-body p-3 p-md-4">
                    {error && data.length > 0 && (
                         <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                              <IconError /> <span className="ms-2">{error}</span>
                              <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                         </div>
                    )}
                    {renderChartArea()}
               </div>

               {data.length > 0 && !loading && !error && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="row g-3 mb-3">
                              <div className="col-md-6">
                                   <div className="card h-100 border-0 bg-primary bg-opacity-10">
                                        <div className="card-body text-center">
                                             <h6 className="card-title text-primary mb-2">Total Amount</h6>
                                             <h4 className="card-text mb-0 text-primary fw-bold">
                                                  {currencyFormatter.format(totalAmount)}
                                             </h4>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-6">
                                   <div className="card h-100 border-0 bg-success bg-opacity-10">
                                        <div className="card-body text-center">
                                             <h6 className="card-title text-success mb-2">Total Services</h6>
                                             <h4 className="card-text mb-0 text-success fw-bold">
                                                  {totalServices.toLocaleString()}
                                             </h4>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <h4 className="fs-6 fw-medium mb-3">{timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Analytics for {selectedOrg?.facility_name || 'Selected Organization'} {(timePeriod === 'weekly' || timePeriod === 'monthly' || timePeriod === 'quarterly' || timePeriod === 'yearly') ? `(${selectedYear})` : timePeriod === 'hourly' ? `(${formatDate(selectedDate)})` : timePeriod === 'daily' && useCustomDateRange ? `(${formatDate(startDate)} to ${formatDate(endDate)})` : timePeriod === 'daily' ? '(Last 30 Days)' : ''}</h4>
                         <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              <table className="table table-sm table-hover table-striped small">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">
                                                  {timePeriod === 'hourly' ? 'Hour' :
                                                       timePeriod === 'daily' ? 'Date' :
                                                            timePeriod === 'weekly' ? 'Week' :
                                                                 timePeriod === 'monthly' ? 'Month' :
                                                                      timePeriod === 'quarterly' ? 'Quarter' :
                                                                           timePeriod === 'yearly' ? 'Year' : 'Period'}
                                             </th>
                                             <th scope="col" className="py-2">Amount</th>
                                             <th scope="col" className="py-2">Services</th>
                                             <th scope="col" className="py-2">% of Total</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.map((entry, index) => {
                                             let displayValue = '';
                                             let amount = 0;
                                             let services = 0;

                                             switch (timePeriod) {
                                                  case 'hourly':
                                                       displayValue = entry.hour_of_day !== undefined ? `${entry.hour_of_day}:00` : 'Unknown';
                                                       amount = parseFloat(entry.total_amount || entry.total_amount_outsourced || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.services_count || entry.total_services || entry.total_outsourced_services || '0') || 0;
                                                       break;
                                                  case 'daily':
                                                       displayValue = entry.service_date ? formatDate(entry.service_date) : 'Unknown';
                                                       amount = parseFloat(entry.daily_amount || entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.services_count || entry.total_services || entry.total_outsourced_services || '0') || 0;
                                                       break;
                                                  case 'weekly':
                                                       displayValue = entry.week ? `Week ${entry.week}` : 'Unknown';
                                                       amount = parseFloat(entry.weekly_amount || entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.services_count || entry.total_services || entry.total_outsourced_services || '0') || 0;
                                                       break;
                                                  case 'monthly':
                                                       displayValue = entry.month || 'Unknown';
                                                       amount = parseFloat(entry.monthly_amount || entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.total_services || entry.services_count || entry.total_outsourced_services || '0') || 0;
                                                       break;
                                                  case 'quarterly':
                                                       displayValue = entry.quarter ? `Q${entry.quarter}` : 'Unknown';
                                                       amount = parseFloat(entry.quarterly_amount || entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.services_count || entry.total_services || entry.total_outsourced_services || '0') || 0;
                                                       break;
                                                  case 'yearly':
                                                       displayValue = entry.year ? `Year ${entry.year}` : 'Unknown';
                                                       amount = parseFloat(entry.yearly_amount || entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.services_count || entry.total_services || entry.total_outsourced_services || '0') || 0;
                                                       break;
                                                  default:
                                                       displayValue = entry.month || 'Unknown';
                                                       amount = parseFloat(entry.monthly_amount || entry.total_amount_outsourced || entry.total_amount || entry.grand_total_outsourced || entry.total_outsourced_amount || '0') || 0;
                                                       services = parseInt(entry.total_services || entry.services_count || entry.total_outsourced_services || '0') || 0;
                                             }

                                             return (
                                                  <tr key={`${entry.hour_of_day || entry.service_date || entry.week || entry.month || entry.quarter || entry.year || entry.facility_name || entry.outsourced_facility}-${index}`}>
                                                       <td className="py-2">
                                                            {displayValue}
                                                       </td>
                                                       <td className="py-2">
                                                            {currencyFormatter.format(amount)}
                                                       </td>
                                                       <td className="py-2">
                                                            {services > 0 ? services.toLocaleString() : '-'}
                                                       </td>
                                                       <td className="py-2">
                                                            {totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0.0'}%
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                                   <tfoot className="fw-bold border-top">
                                        <tr>
                                             <td className="py-2">Total</td>
                                             <td className="py-2">{currencyFormatter.format(totalAmount)}</td>
                                             <td className="py-2">{totalServices.toLocaleString()}</td>
                                             <td className="py-2">100.0%</td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>
                    </div>
               )}
               <style jsx global>{`
                .recharts-default-legend { margin-left: 15px !important; }
                .table-responsive thead.sticky-top th { background-color: var(--bs-tertiary-bg) !important; border-bottom: 2px solid var(--bs-border-color); }
            `}</style>
          </div>
     );
}