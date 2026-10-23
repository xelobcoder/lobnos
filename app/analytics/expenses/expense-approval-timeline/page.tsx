"use client";

import React, { useEffect, useState, ReactElement } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiPieChartLine } from "@remixicon/react";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb';
const COLOR_TERTIARY = '#ea580c';

interface ApprovalTimelineData {
     avg_approval_hours: string;
     avg_approval_days: string;
     total_expenses: number;
     approved_within_1_day: number;
     approved_within_1_week: number;
     approved_after_1_week: number;
}

export default function ExpenseApprovalTimeline() {
     const [data, setData] = useState<ApprovalTimelineData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const userBranchid = parseInt(useApplication()?.branchid) || null;
     const [selectedBranchid, setSelectedBranchid] = useState<number | null>(userBranchid || null);
     const [startDate, setStartDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
     });
     const [endDate, setEndDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
     });
     const [branches, setBranches] = useState<any[]>([]);
     const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

     const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/approval-timeline?&startDate=${startDate}&endDate=${endDate}&branchid=${selectedBranchid}`;
               const response = await customFetch(endpoint);
               const responseData = response?.data;
               if (response && Array.isArray(responseData)) {
                    setData(responseData);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err) {
               setError("Failed to fetch expense approval timeline data");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          const fetchBranches = async () => {
               try {
                    const response = await customFetch('branches');
                    if (response && response?.result && Array.isArray(response.result)) {
                         const branchList = response.result;
                         setBranches(branchList);

                    }
               } catch (error) {
                    console.error('Error fetching branches:', error);
               }
          };
          fetchBranches();
     }, []);

     useEffect(() => {
          fetchData();
     }, []);

     const chartData = data.map(item => ({
          ...item,
          avg_approval_hours: parseFloat(item.avg_approval_hours),
          avg_approval_days: parseFloat(item.avg_approval_days),
          approved_within_1_day_percentage: item.total_expenses > 0 ? (item.approved_within_1_day / item.total_expenses) * 100 : 0,
          approved_within_1_week_percentage: item.total_expenses > 0 ? (item.approved_within_1_week / item.total_expenses) * 100 : 0,
          approved_after_1_week_percentage: item.total_expenses > 0 ? (item.approved_after_1_week / item.total_expenses) * 100 : 0
     }));

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Approval Timeline</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>Expense Approvals</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color }}>
                                        {item.dataKey.includes('percentage') ? `${item.value.toFixed(1)}%` :
                                             item.dataKey.includes('hours') ? `${item.value.toFixed(2)} hours` :
                                                  item.dataKey.includes('days') ? `${item.value.toFixed(2)} days` :
                                                       item.value}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderControls = () => {
          const viewButtons = [
               { type: 'bar' as const, label: 'Bar', icon: RiBarChartBoxLine },
               { type: 'pie' as const, label: 'Pie', icon: RiPieChartLine }
          ];

          return (
               <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                    <select
                         className="form-select  form-select-sm"
                         value={selectedBranchid || ''}
                         onChange={(e) => setSelectedBranchid(Number(e.target.value))}
                         style={{ borderColor: COLOR_BORDER }}
                    >
                         {Array.isArray(branches) && branches.length > 0 && branches.map(branch => (
                              <option key={branch.branchid} value={branch.branchid}>
                                   {branch.name}
                              </option>
                         ))}
                    </select>
                    <div className="d-flex align-items-center gap-2">
                         <input type="date" className="form-control form-control-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ borderColor: COLOR_BORDER }} />
                         <input type="date" className="form-control form-control-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} style={{ borderColor: COLOR_BORDER }} />
                         <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                              {viewButtons.map(btn => (
                                   <button
                                        key={btn.type}
                                        type="button"
                                        className={`btn ${chartType === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                        onClick={() => setChartType(btn.type)}
                                        style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                   >
                                        {btn.label}
                                   </button>
                              ))}
                         </div>
                    </div>
                    <button onClick={fetchData} className="btn btn-sm btn-primary ">
                         Load
                    </button>
               </div>
          );
     };

     const renderChart = () => {
          const COLORS = [COLOR_ACCENT, COLOR_SECONDARY, COLOR_TERTIARY];

          if (chartType === 'pie') {
               const pieData = data.length > 0 ? [
                    { name: 'Within 1 Day', value: data[0].approved_within_1_day, percentage: data[0].total_expenses > 0 ? (data[0].approved_within_1_day / data[0].total_expenses) * 100 : 0 },
                    { name: 'Within 1 Week', value: data[0].approved_within_1_week, percentage: data[0].total_expenses > 0 ? (data[0].approved_within_1_week / data[0].total_expenses) * 100 : 0 },
                    { name: 'After 1 Week', value: data[0].approved_after_1_week, percentage: data[0].total_expenses > 0 ? (data[0].approved_after_1_week / data[0].total_expenses) * 100 : 0 }
               ] : [];

               const CustomPieTooltip = ({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                         const data = payload[0].payload;
                         return (
                              <div className="rounded-lg border p-2 shadow-sm"
                                   style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '200px', fontSize: '0.8rem' }}>
                                   <div className="mb-2">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Approval Timeline</span>
                                        <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{data.name}</span>
                                   </div>
                                   <div className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Count</span>
                                        <span className="fw-bold d-block" style={{ color: payload[0].color }}>
                                             {data.value}
                                        </span>
                                   </div>
                                   <div>
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Percentage</span>
                                        <span className="fw-bold d-block" style={{ color: payload[0].color }}>
                                             {data.percentage.toFixed(1)}%
                                        </span>
                                   </div>
                              </div>
                         );
                    }
                    return null;
               };

               return (
                    <PieChart width={400} height={350}>
                         <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                              outerRadius={120}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                         >
                              {pieData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                         </Pie>
                         <Tooltip content={<CustomPieTooltip />} />
                         <Legend
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                              iconSize={8}
                              wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingTop: '15px' }}
                         />
                    </PieChart>
               );
          }

          if (chartType === 'bar') {
               const barData = data.length > 0 ? [
                    { name: 'Within 1 Day', value: data[0].approved_within_1_day, percentage: data[0].total_expenses > 0 ? (data[0].approved_within_1_day / data[0].total_expenses) * 100 : 0 },
                    { name: 'Within 1 Week', value: data[0].approved_within_1_week, percentage: data[0].total_expenses > 0 ? (data[0].approved_within_1_week / data[0].total_expenses) * 100 : 0 },
                    { name: 'After 1 Week', value: data[0].approved_after_1_week, percentage: data[0].total_expenses > 0 ? (data[0].approved_after_1_week / data[0].total_expenses) * 100 : 0 }
               ] : [];

               const commonProps = {
                    data: barData,
                    margin: { top: 5, right: 5, left: 20, bottom: 45 },
               };

               const xAxisProps = {
                    dataKey: "name",
                    tickFormatter: (value: string) => value,
                    angle: -45,
                    textAnchor: "end" as const,
                    height: 60,
                    interval: "preserveStartEnd" as const,
                    tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
                    axisLine: { stroke: COLOR_BORDER },
                    tickLine: { stroke: COLOR_BORDER },
               };

               const yAxisProps = {
                    tickFormatter: (value: number) => value.toString(),
                    tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
                    axisLine: false,
                    tickLine: false,
                    width: 95,
               };

               const legendProps = {
                    verticalAlign: "top" as const,
                    align: "right" as const,
                    iconType: "circle" as const,
                    iconSize: 8,
                    wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
               };

               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="value" name="Count" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }

          return null; // Fallback for TypeScript
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Expense Approval Timeline Analytics
                                   </h2>
                                   {renderControls()}
                              </div>
                         </div>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading expense approval timeline data...</p>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Expense Approval Timeline Analytics
                                   </h2>
                                   {renderControls()}
                              </div>
                         </div>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error}</p>
                         <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                    </div>
               </div>
          );
     }

     if (!data || data.length === 0) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Expense Approval Timeline Analytics
                                   </h2>
                                   {renderControls()}
                              </div>
                         </div>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Data Available</h5>
                         <p className="text-muted px-3">No expense approval timeline data found for the selected period.</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Expense Approval Timeline Analytics
                              </h2>
                              {renderControls()}
                         </div>
                    </div>
                    <div className="card-body p-4">
                         {loading ? (
                              <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                                   <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                                   <p className="text-muted">Loading expense approval timeline data...</p>
                              </div>
                         ) : error ? (
                              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                                   <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                                   <h5 className="fw-medium mb-1">Error Loading Data</h5>
                                   <p className="text-muted px-3">{error}</p>
                                   <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                              </div>
                         ) : !data || data.length === 0 ? (
                              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                                   <RiInbox2Line size={48} className="mb-3 text-muted" />
                                   <h5 className="fw-medium mb-1">No Data Available</h5>
                                   <p className="text-muted px-3">No expense approval timeline data found for the selected period.</p>
                              </div>
                         ) : (
                              <ResponsiveContainer width="100%" height={350}>
                                   {renderChart() as ReactElement<any>}
                              </ResponsiveContainer>
                         )}
                    </div>
                    {!loading && !error && data && data.length > 0 && (
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Report Period: {startDate} - {endDate}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Approval Timeline Summary</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th scope="col" className="py-2 text-start">#</th>
                                                  <th scope="col" className="py-2 text-start">Avg Approval Hours</th>
                                                  <th scope="col" className="py-2 text-start">Avg Approval Days</th>
                                                  <th scope="col" className="py-2 text-start">Total Expenses</th>
                                                  <th scope="col" className="py-2 text-start">Within 1 Day</th>
                                                  <th scope="col" className="py-2 text-start">Within 1 Week</th>
                                                  <th scope="col" className="py-2 text-start">After 1 Week</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {data.map((entry, idx) => (
                                                  <tr key={idx}>
                                                       <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                       <td className="py-2 text-start fw-medium">{parseFloat(entry.avg_approval_hours).toFixed(2)}</td>
                                                       <td className="py-2 text-start fw-medium">{parseFloat(entry.avg_approval_days).toFixed(2)}</td>
                                                       <td className="py-2 text-start fw-medium">{entry.total_expenses}</td>
                                                       <td className="py-2 text-start">{entry.approved_within_1_day}</td>
                                                       <td className="py-2 text-start">{entry.approved_within_1_week}</td>
                                                       <td className="py-2 text-start">{entry.approved_after_1_week}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    )}
               </div>
               <style jsx global>{`
                @media print {
                    .printable-table-with-borders tbody tr {
                        border: none !important;
                        border-bottom: 2px solid #000 !important;
                    }
                    .printable-table-with-borders tbody tr:nth-child(odd) {
                        background-color: #f8f9fa !important;
                    }
                    .printable-table-with-borders th:nth-child(n),
                    .printable-table-with-borders td:nth-child(n) {
                        display: table-cell !important;
                    }
                    .printable-table-with-borders th,
                    .printable-table-with-borders td {
                        padding: 0.25rem 0.5rem !important;
                    }
                }
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
