"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
     conversionRate: number;
     averageLeadValue: number;
     leadsByStatus: Array<{
          status: string;
          count: number;
          percentage: number;
     }>;
     leadsBySource: Array<{
          source: string;
          count: number;
          conversionRate: number;
     }>;
     leadsByIndustry: Array<{
          industry: string;
          count: number;
          value: number;
     }>;
     monthlyTrend: Array<{
          month: string;
          leads: number;
          conversions: number;
          value: number;
     }>;
     topPerformingSources: Array<{
          source: string;
          leads: number;
          conversions: number;
          rate: number;
     }>;
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
          const today = new Date();
          const endDate = today.toISOString().split("T")[0];
          const startDateObj = new Date(today);
          startDateObj.setDate(today.getDate() - 29);
          const startDate = startDateObj.toISOString().split("T")[0];
          return { startDate, endDate };
     };

     const initialDates = getInitialDates();
     const [startDate, setStartDate] = useState<string>(initialDates.startDate);
     const [endDate, setEndDate] = useState<string>(initialDates.endDate);

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
               // Simulate API call - replace with actual endpoint
               const mockData: LeadAnalyticsData = {
                    totalLeads: 245,
                    newLeads: 45,
                    qualifiedLeads: 89,
                    convertedLeads: 67,
                    lostLeads: 23,
                    conversionRate: 27.3,
                    averageLeadValue: 12500,
                    leadsByStatus: [
                         { status: 'new', count: 45, percentage: 18.4 },
                         { status: 'contacted', count: 52, percentage: 21.2 },
                         { status: 'qualified', count: 89, percentage: 36.3 },
                         { status: 'proposal', count: 34, percentage: 13.9 },
                         { status: 'negotiation', count: 15, percentage: 6.1 },
                         { status: 'closed_won', count: 67, percentage: 27.3 },
                         { status: 'closed_lost', count: 23, percentage: 9.4 },
                    ],
                    leadsBySource: [
                         { source: 'website', count: 85, conversionRate: 32.9 },
                         { source: 'referral', count: 62, conversionRate: 41.9 },
                         { source: 'trade_show', count: 38, conversionRate: 18.4 },
                         { source: 'social_media', count: 29, conversionRate: 13.8 },
                         { source: 'cold_call', count: 31, conversionRate: 9.7 },
                    ],
                    leadsByIndustry: [
                         { industry: 'healthcare', count: 78, value: 975000 },
                         { industry: 'biotech', count: 45, value: 562500 },
                         { industry: 'pharmaceutical', count: 52, value: 650000 },
                         { industry: 'medical_devices', count: 34, value: 425000 },
                         { industry: 'research', count: 36, value: 450000 },
                    ],
                    monthlyTrend: [
                         { month: 'Jan', leads: 18, conversions: 5, value: 62500 },
                         { month: 'Feb', leads: 22, conversions: 6, value: 75000 },
                         { month: 'Mar', leads: 25, conversions: 8, value: 100000 },
                         { month: 'Apr', leads: 28, conversions: 9, value: 112500 },
                         { month: 'May', leads: 32, conversions: 11, value: 137500 },
                         { month: 'Jun', leads: 35, conversions: 12, value: 150000 },
                         { month: 'Jul', leads: 38, conversions: 13, value: 162500 },
                         { month: 'Aug', leads: 47, conversions: 16, value: 200000 },
                    ],
                    topPerformingSources: [
                         { source: 'referral', leads: 62, conversions: 26, rate: 41.9 },
                         { source: 'website', leads: 85, conversions: 28, rate: 32.9 },
                         { source: 'trade_show', leads: 38, conversions: 7, rate: 18.4 },
                         { source: 'social_media', leads: 29, conversions: 4, rate: 13.8 },
                         { source: 'cold_call', leads: 31, conversions: 3, rate: 9.7 },
                    ],
               };

               // Simulate API delay
               await new Promise(resolve => setTimeout(resolve, 1000));
               setData(mockData);
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
                                        {entry.name.includes('Rate') || entry.name.includes('%') ? '%' : ''}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
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
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
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
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Conversion Rate</p>
                                             <h3 className="mb-0">{data.conversionRate}%</h3>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded">
                                             {/* <RiTrendingUp size={24} className="text-success" /> */}
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
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
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
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

               {/* Charts Row */}
               <div className="row g-4 mb-4">
                    {/* Lead Status Distribution */}
                    <div className="col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiPieChartLine size={18} className="me-2 text-primary" />
                                        Lead Status Distribution
                                   </h6>
                              </div>
                              <div className="card-body">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                             <Pie
                                                  data={data.leadsByStatus}
                                                  cx="50%"
                                                  cy="50%"
                                                  outerRadius={80}
                                                  dataKey="count"
                                                  label={({ status, percentage }) => `${status.replace('_', ' ')} (${percentage}%)`}
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
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiLineChartLine size={18} className="me-2 text-success" />
                                        Monthly Lead Trend
                                   </h6>
                              </div>
                              <div className="card-body">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={data.monthlyTrend}>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis dataKey="month" />
                                             <YAxis />
                                             <Tooltip content={<CustomTooltip />} />
                                             <Area
                                                  type="monotone"
                                                  dataKey="leads"
                                                  stackId="1"
                                                  stroke={CHART_COLORS[0]}
                                                  fill={CHART_COLORS[0]}
                                                  fillOpacity={0.6}
                                                  name="New Leads"
                                             />
                                             <Area
                                                  type="monotone"
                                                  dataKey="conversions"
                                                  stackId="2"
                                                  stroke={CHART_COLORS[2]}
                                                  fill={CHART_COLORS[2]}
                                                  fillOpacity={0.6}
                                                  name="Conversions"
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
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        <RiBarChartLine size={18} className="me-2 text-info" />
                                        Leads by Source
                                   </h6>
                              </div>
                              <div className="card-body">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={data.leadsBySource} layout="horizontal">
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis type="number" />
                                             <YAxis dataKey="source" type="category" width={100} />
                                             <Tooltip content={<CustomTooltip />} />
                                             <Bar dataKey="count" fill={CHART_COLORS[1]} name="Leads" />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-light">
                                   <h6 className="mb-0 d-flex align-items-center">
                                        {/* <RiTrendingUp size={18} className="me-2 text-warning" /> */}
                                        Source Conversion Rates
                                   </h6>
                              </div>
                              <div className="card-body">
                                   <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={data.topPerformingSources}>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis dataKey="source" />
                                             <YAxis />
                                             <Tooltip content={<CustomTooltip />} />
                                             <Bar dataKey="rate" fill={CHART_COLORS[3]} name="Conversion Rate %" />
                                        </BarChart>
                                   </ResponsiveContainer>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Industry Analysis */}
               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light">
                         <h6 className="mb-0 d-flex align-items-center">
                              <RiBuildingLine size={18} className="me-2 text-secondary" />
                              Leads by Industry & Value
                         </h6>
                    </div>
                    <div className="card-body">
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
                                                  <td className="text-center">{formatCurrency(industry.value)}</td>
                                                  <td className="text-center">{formatCurrency(industry.value / industry.count)}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
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