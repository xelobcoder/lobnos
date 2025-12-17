"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { customFetch } from "../../../components/Auth/customFetch";
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     Cell,
     LineChart,
     Line,
     PieChart,
     Pie,
     Area,
     AreaChart,
} from "recharts";

import {
     RiUserAddLine,
     RiErrorWarningLine,
     RiCalendarEventLine,
     RiInbox2Line,
     RiLoader4Line,
     RiRefreshLine,
     RiFileList3Line,
     RiMoneyDollarCircleLine,
     RiCheckboxCircleLine,
     RiLineChartLine,
     RiPercentLine,
     RiAlertLine,
     RiUserLine,
     RiBuildingLine,
     RiPhoneLine,
     RiMailLine,
     RiTimeLine,
     RiBarChartLine,
     RiPieChartLine,
     RiCalendarLine
} from "@remixicon/react";

interface LeadAnalyticsData {
     totalLeads: number;
     newLeads: number;
     qualifiedLeads: number;
     convertedLeads: number;
     lostLeads: number;
     conversionRate: string | number;
     averageLeadValue: number;
     leadsByStatus: Array<{
          status: string;
          count: number;
          percentage: string | number;
     }>;
     leadsBySource: Array<{
          source: string;
          count: number;
          conversionRate: string | number;
     }>;
     leadsByIndustry: Array<{
          industry: string;
          count: number;
          value?: number;
     }>;
     monthlyTrend: Array<{
          month: string;
          leads: number;
          conversions: string | number;
          value?: number;
     }>;
     topPerformingSources: Array<{
          source: string;
          leads: number;
          conversions: string | number;
          rate: string | number;
     }>;
     totalFollowups: number;
     followupsByStatus: Array<{
          status: string;
          count: number;
          percentage: string | number;
     }>;
     followupsByType: Array<{
          type: string;
          count: number;
     }>;
     upcomingFollowups: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const CHART_COLORS = [
     'oklch(0.646 0.222 41.116)', // Primary
     'oklch(0.6 0.118 184.704)',  // Blue
     'oklch(0.828 0.189 84.429)', // Green
     'oklch(0.769 0.188 70.08)',   // Orange
     'oklch(0.398 0.07 227.392)',  // Purple
     'oklch(0.7 0.2 20)',          // Red
     'oklch(0.5 0.15 280)',        // Pink
     'oklch(0.8 0.1 120)',         // Teal
];

const STATUS_COLORS = {
     new: 'oklch(0.6 0.118 184.704)',
     contacted: 'oklch(0.769 0.188 70.08)',
     qualified: 'oklch(0.828 0.189 84.429)',
     proposal: 'oklch(0.5 0.15 280)',
     negotiation: 'oklch(0.398 0.07 227.392)',
     closed_won: 'oklch(0.646 0.222 41.116)',
     closed_lost: 'oklch(0.7 0.2 20)',
};

export default function LeadsAnalytics() {
     const [data, setData] = useState<LeadAnalyticsData | null>(null);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

     const getInitialDates = () => {
          const currentYear = new Date().getFullYear();
          return {
               startDate: `${currentYear}-01-01`,
               endDate: `${currentYear}-12-31`,
          };
     };

     const initialDates = getInitialDates();
     const [startDate, setStartDate] = useState<string>(initialDates.startDate);
     const [endDate, setEndDate] = useState<string>(initialDates.endDate);
     const [followupsView, setFollowupsView] = useState<"bar" | "line" | "area">("bar");

     const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string) => {
          if (!fetchStartDate || !fetchEndDate) {
               setError("Please select valid start and end dates.");
               setData(null);
               setLoading(false);
               return;
          }
          if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
               setError("Start date cannot be after end date.");
               setData(null);
               setLoading(false);
               return;
          }

          setLoading(true);
          setError(null);
          try {
               const url = `leads/analytics?startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
               const response: LeadAnalyticsData = await customFetch(url);
               setData(response);
          } catch (err) {
               setData(null);
               setError(err instanceof Error ? err.message : "An unknown error occurred");
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          fetchData(startDate, endDate);
     }, [fetchData, startDate, endDate]);

     const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
     const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
     const handleResetFilters = () => {
          const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
          setStartDate(defaultStartDate);
          setEndDate(defaultEndDate);
     };

     const handleFollowupsViewToggle = (view: "bar" | "line" | "area") => {
          setFollowupsView(view);
     };

     const formatCurrency = (value: number) => {
          return new Intl.NumberFormat('en-US', {
               style: 'currency',
               currency: 'USD',
               minimumFractionDigits: 0,
               maximumFractionDigits: 0,
          }).format(value);
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div
                         className="rounded-lg border p-2 shadow-sm"
                         style={{
                              backgroundColor: COLOR_TOOLTIP_BG,
                              borderColor: COLOR_BORDER,
                              minWidth: '150px',
                              fontSize: '0.8rem'
                         }}
                    >
                         <div className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{label}</span>
                         </div>
                         {payload.map((entry: any, index: number) => (
                              <div key={index}>
                                   <span className="text-xs uppercase fw-medium" style={{ color: entry.color }}>
                                        {entry.name}: {entry.value}
                                        {typeof entry.name === 'string' && (entry.name.includes('Rate') || entry.name.includes('%')) ? '%' : ''}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderFollowupsChart = () => {
          const commonProps = {
               data: data!.followupsByType,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          if (followupsView === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis
                              dataKey="type"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                              axisLine={{ stroke: COLOR_BORDER }}
                              tickLine={{ stroke: COLOR_BORDER }}
                         />
                         <YAxis
                              tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                              axisLine={false}
                              tickLine={false}
                         />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Bar dataKey="count" fill={CHART_COLORS[2]} name="Count" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }

          if (followupsView === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis
                              dataKey="type"
                              angle={-45}
                              textAnchor="end"
                              height={60}
                              tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                              axisLine={{ stroke: COLOR_BORDER }}
                              tickLine={{ stroke: COLOR_BORDER }}
                         />
                         <YAxis
                              tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                              axisLine={false}
                              tickLine={false}
                         />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Line
                              type="monotone"
                              dataKey="count"
                              name="Count"
                              stroke={CHART_COLORS[2]}
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: CHART_COLORS[2] }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: CHART_COLORS[2], stroke: COLOR_TOOLTIP_BG }}
                         />
                    </LineChart>
               );
          }

          // Area chart
          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="followupsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis
                         dataKey="type"
                         angle={-45}
                         textAnchor="end"
                         height={60}
                         tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                         axisLine={{ stroke: COLOR_BORDER }}
                         tickLine={{ stroke: COLOR_BORDER }}
                    />
                    <YAxis
                         tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                         axisLine={false}
                         tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Area
                         type="monotone"
                         dataKey="count"
                         name="Count"
                         stroke={CHART_COLORS[2]}
                         fill="url(#followupsGradient)"
                         strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: CHART_COLORS[2] }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: CHART_COLORS[2], stroke: COLOR_TOOLTIP_BG }}
                    />
               </AreaChart>
          );
     };

     const renderLoadingState = () => (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
               <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
               <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading leads analytics...</p>
          </div>
     );

     const renderErrorState = () => (
          <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
               <RiErrorWarningLine size={48} className="mb-3 text-danger" />
               <h5 className="fw-medium mb-1">Error Loading Data</h5>
               <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
          </div>
     );

     const renderEmptyState = () => (
          <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
               <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
               <h5 className="fw-medium mb-1">No Data Available</h5>
               <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                    No leads data found for the selected period.
               </p>
          </div>
     );

     if (loading) return renderLoadingState();
     if (error && !data) return renderErrorState();
     if (!data) return renderEmptyState();

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="text-dark fw-medium mb-0">Leads Analytics Dashboard</h2>
                         <small className="text-muted">Comprehensive insights into lead generation and conversion performance</small>
                    </div>
                    <div className="d-flex gap-2">
                         <div className="input-group input-group-sm" style={{ width: '140px' }}>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={startDate}
                                   onChange={handleStartDateChange}
                              />
                         </div>
                         <div className="input-group input-group-sm" style={{ width: '140px' }}>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={endDate}
                                   onChange={handleEndDateChange}
                                   min={startDate}
                              />
                         </div>
                         <button
                              onClick={handleResetFilters}
                              className="btn btn-sm btn-outline-secondary"
                         >
                              <RiRefreshLine size={16} className="me-1" /> Reset
                         </button>
                    </div>
               </div>

               {/* Key Metrics Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Total Leads</p>
                                             <h3 className="mb-0">{data.totalLeads}</h3>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 p-3 rounded">
                                             <RiUserLine size={24} className="text-primary" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Conversion Rate</p>
                                             <h3 className="mb-0">{typeof data.conversionRate === 'string' ? parseFloat(data.conversionRate).toFixed(1) : data.conversionRate.toFixed(1)}%</h3>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded">
                                             {/* <RiTrendingUp size={24} className="text-success" /> */}
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Qualified Leads</p>
                                             <h3 className="mb-0">{data.qualifiedLeads}</h3>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 p-3 rounded">
                                             <RiUserAddLine size={24} className="text-warning" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Avg Lead Value</p>
                                             <h3 className="mb-0">{formatCurrency(data.averageLeadValue)}</h3>
                                        </div>
                                        <div className="bg-info bg-opacity-10 p-3 rounded">
                                             <RiMoneyDollarCircleLine size={24} className="text-info" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Followups Metrics */}
               <div className="row g-3 mb-4">
                    <div className="col-md-12">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Total Follow-ups</p>
                                             <h3 className="mb-0">{data.totalFollowups}</h3>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 p-3 rounded">
                                             <RiCalendarEventLine size={24} className="text-primary" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Upcoming Follow-ups</p>
                                             <h3 className="mb-0">{data.upcomingFollowups}</h3>
                                        </div>
                                        <div className="bg-warning bg-opacity-10 p-3 rounded">
                                             <RiTimeLine size={24} className="text-warning" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Completed Follow-ups</p>
                                             <h3 className="mb-0">{data.followupsByStatus.find(f => f.status === 'completed')?.count || 0}</h3>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded">
                                             <RiCheckboxCircleLine size={24} className="text-success" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Charts Row */}
               <div className="row g-4 mb-4">
                    {/* Lead Status Distribution */}
                    <div className="col-lg-6">
                         <div className="border rounded h-100">
                              <div className="bg-light p-3 rounded-top">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiPieChartLine size={18} className="me-2 text-primary" />
                                        Lead Status Distribution
                                   </h6>
                              </div>
                              <div className="p-3">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                             <Pie
                                                  data={data.leadsByStatus}
                                                  cx="50%"
                                                  cy="50%"
                                                  outerRadius={80}
                                                  dataKey="count"
                                                  label={({ status, percentage }) => {
                                                       const pct = typeof percentage === 'string' ? parseFloat(percentage).toFixed(1) : percentage.toFixed(1);
                                                       return `${status.replace('_', ' ')} (${pct}%)`;
                                                  }}
                                             >
                                                  {data.leadsByStatus.map((entry, index) => (
                                                       <Cell
                                                            key={`cell-${index}`}
                                                            fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || CHART_COLORS[index % CHART_COLORS.length]}
                                                       />
                                                  ))}
                                             </Pie>
                                             <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="col-lg-6">
                         <div className="border rounded h-100">
                              <div className="bg-light p-3 rounded-top">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiLineChartLine size={18} className="me-2 text-success" />
                                        Monthly Lead Trend
                                   </h6>
                              </div>
                              <div className="p-3">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart
                                             data={data.monthlyTrend}
                                             margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                        >
                                             <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                             <XAxis
                                                  dataKey="month"
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={{ stroke: COLOR_BORDER }}
                                                  tickLine={{ stroke: COLOR_BORDER }}
                                             />
                                             <YAxis
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={false}
                                                  tickLine={false}
                                             />
                                             <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                             <Legend
                                                  verticalAlign="top"
                                                  align="right"
                                                  iconType="circle"
                                                  iconSize={8}
                                                  wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
                                             />
                                             <Area
                                                  type="monotone"
                                                  dataKey="leads"
                                                  stackId="1"
                                                  stroke={CHART_COLORS[0]}
                                                  fill={CHART_COLORS[0]}
                                                  fillOpacity={0.6}
                                                  name="New Leads"
                                                  strokeWidth={2}
                                             />
                                             <Area
                                                  type="monotone"
                                                  dataKey="conversions"
                                                  stackId="2"
                                                  stroke={CHART_COLORS[2]}
                                                  fill={CHART_COLORS[2]}
                                                  fillOpacity={0.6}
                                                  name="Conversions"
                                                  strokeWidth={2}
                                             />
                                        </AreaChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Source Performance */}
               <div className="row g-4 mb-4">
                    <div className="col-lg-6">
                         <div className="border rounded h-100">
                              <div className="bg-light p-3 rounded-top">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiBarChartLine size={18} className="me-2 text-info" />
                                        Leads by Source
                                   </h6>
                              </div>
                              <div className="p-3">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                             data={data.leadsBySource}
                                             layout="horizontal"
                                             margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                        >
                                             <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                             <XAxis
                                                  type="number"
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={false}
                                                  tickLine={false}
                                             />
                                             <YAxis
                                                  dataKey="source"
                                                  type="category"
                                                  width={100}
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={{ stroke: COLOR_BORDER }}
                                                  tickLine={{ stroke: COLOR_BORDER }}
                                             />
                                             <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                             <Bar dataKey="count" fill={CHART_COLORS[1]} name="Leads" radius={[0, 4, 4, 0]} maxBarSize={30} />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="border rounded h-100">
                              <div className="bg-light p-3 rounded-top">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        {/* <RiTrendingUp size={18} className="me-2 text-warning" /> */}
                                        Source Conversion Rates
                                   </h6>
                              </div>
                              <div className="p-3">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                             data={data.topPerformingSources}
                                             margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                        >
                                             <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                             <XAxis
                                                  dataKey="source"
                                                  angle={-45}
                                                  textAnchor="end"
                                                  height={60}
                                                  interval="preserveStartEnd"
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={{ stroke: COLOR_BORDER }}
                                                  tickLine={{ stroke: COLOR_BORDER }}
                                             />
                                             <YAxis
                                                  tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                  axisLine={false}
                                                  tickLine={false}
                                             />
                                             <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                             <Bar dataKey="rate" fill={CHART_COLORS[3]} name="Conversion Rate %" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Industry Analysis */}
               <div className="border rounded mb-4">
                    <div className="bg-light p-3 rounded-top">
                         <h6 className="mb-0 d-flex align-items-center">
                              <RiBuildingLine size={18} className="me-2 text-secondary" />
                              Leads by Industry & Value
                         </h6>
                    </div>
                    <div className="p-3">
                         <div className="table-responsive">
                              <table className="table table-hover">
                                   <thead>
                                        <tr>
                                             <th>Industry</th>
                                             <th className="text-center">Lead Count</th>
                                             <th className="text-center">Total Value</th>
                                             <th className="text-center">Avg Value per Lead</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.leadsByIndustry.map((industry, index) => (
                                             <tr key={index}>
                                                  <td className="fw-medium">{industry.industry.replace('_', ' ')}</td>
                                                  <td className="text-center">{industry.count}</td>
                                                  <td className="text-center">{industry.value ? formatCurrency(industry.value) : 'N/A'}</td>
                                                  <td className="text-center">{industry.value ? formatCurrency(industry.value / industry.count) : 'N/A'}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>

               {/* Followups Charts */}
               <div className="row g-4">
                    <div className="col-lg-6">
                         <div className="border rounded h-100">
                              <div className="bg-light border-bottom p-3 rounded-top">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiPieChartLine size={18} className="me-2 text-primary" />
                                        Follow-ups by Status
                                   </h6>
                              </div>
                              <div className="p-3">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                             <Pie
                                                  data={data.followupsByStatus}
                                                  cx="50%"
                                                  cy="50%"
                                                  outerRadius={90}
                                                  innerRadius={40}
                                                  dataKey="count"
                                                  label={({ status, percentage }) => {
                                                       const pct = typeof percentage === 'string' ? parseFloat(percentage).toFixed(1) : percentage.toFixed(1);
                                                       return `${status.replace('_', ' ')} (${pct}%)`;
                                                  }}
                                                  labelLine={false}
                                             >
                                                  {data.followupsByStatus.map((entry, index) => (
                                                       <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                  ))}
                                             </Pie>
                                             <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="border rounded h-100">
                              <div className="bg-light border-bottom p-3 rounded-top d-flex justify-content-between align-items-center">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiBarChartLine size={18} className="me-2 text-info" />
                                        Follow-ups by Type
                                   </h6>
                                   <div className="btn-group btn-group-sm" role="group">
                                        <button
                                             type="button"
                                             className={`btn ${followupsView === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                             onClick={() => handleFollowupsViewToggle('bar')}
                                             style={followupsView === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             <RiBarChartLine size={14} />
                                        </button>
                                        <button
                                             type="button"
                                             className={`btn ${followupsView === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                             onClick={() => handleFollowupsViewToggle('line')}
                                             style={followupsView === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             <RiLineChartLine size={14} />
                                        </button>
                                        <button
                                             type="button"
                                             className={`btn ${followupsView === 'area' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                             onClick={() => handleFollowupsViewToggle('area')}
                                             style={followupsView === 'area' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             <RiPieChartLine size={14} />
                                        </button>
                                   </div>
                              </div>
                              <div className="p-3">
                                   <ResponsiveContainer width="100%" height={300}>
                                        {renderFollowupsChart()}
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>
               </div>

               <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
          </div>
     );
}