"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiRefreshLine, RiCalendarEventLine, RiPieChartLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb';
const COLOR_TERTIARY = '#ea580c';

interface ExpensePaymentStatus {
     payment_status: string;
     total_amount: string;
     expense_count: number;
     avg_amount: string;
}

export default function ExpensePaymentStatus() {
     const [data, setData] = useState<ExpensePaymentStatus[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [selectedBranchid, setBranchid] = useState<number | null>(null);
     const branchid = useApplication()?.branchid
     const [startDate, setStartDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
     });
     const [endDate, setEndDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
     });
     const [branches, setBranches] = useState<any[]>([]);
     const [chartType, setChartType] = useState<"bar" | "pie" | "area">("bar");
     const { user, applicationsettings } = useApplication();

     const viewButtons = [
          { type: "bar" as const, label: "Bar", icon: RiBarChartBoxLine },
          { type: "pie" as const, label: "Doughnut", icon: RiPieChartLine },
          { type: "area" as const, label: "Area", icon: RiBubbleChartLine }
     ];

     const fetchData = async () => {
          if (!branchid) return;
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/payment-status?startDate=${startDate}&endDate=${endDate}&&branchid=${selectedBranchid ?? branchid}`;
               const response = await customFetch(endpoint);
               const responseData = response?.data;
               if (response && Array.isArray(responseData)) {
                    setData(responseData);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err) {
               setError("Failed to fetch expense payment status data");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          const fetchBranches = async () => {
               try {
                    const response = await customFetch('branches');
                    if (response?.status === 'success' && response?.statusCode === 200) {
                         const branchList = response.result;
                         setBranches(branchList);
                         if (branchList.length > 0) {
                              setBranchid(branchList[0].branchid);
                         }
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
          total_amount: parseFloat(item.total_amount),
          average_amount: parseFloat(item.avg_amount),
          status: item.payment_status
     }));

     const totalAmountSum = chartData.reduce((sum, entry) => sum + entry.total_amount, 0);
     const totalExpensesSum = chartData.reduce((sum, entry) => sum + entry.expense_count, 0);

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Status</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color }}>
                                        {item.dataKey === 'total_amount' ? currencyFormatter.format(item.value) : item.value}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderChart = (): React.ReactElement => {
          const commonProps = {
               data: chartData,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "status",
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
               tickFormatter: (value: number) => currencyFormatter.format(value),
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

          if (chartType === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={50} />
                         <Bar dataKey="expense_count" name="Expense Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
               );
          }
          if (chartType === "pie") {
               const COLORS = [COLOR_ACCENT, COLOR_SECONDARY, COLOR_TERTIARY, '#10b981', '#f59e0b'];

               const CustomPieTooltip = ({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                         const data = payload[0].payload;
                         return (
                              <div className="rounded-lg border p-2 shadow-sm"
                                   style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '200px', fontSize: '0.8rem' }}>
                                   <div className="mb-2">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Status</span>
                                        <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{data.status}</span>
                                   </div>
                                   <div className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Amount</span>
                                        <span className="fw-bold d-block" style={{ color: payload[0].color }}>
                                             {currencyFormatter.format(data.total_amount)}
                                        </span>
                                   </div>
                                   <div className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expense Count</span>
                                        <span className="fw-bold d-block" style={{ color: payload[0].color }}>
                                             {data.expense_count}
                                        </span>
                                   </div>
                                   <div>
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Average Amount</span>
                                        <span className="fw-bold d-block" style={{ color: payload[0].color }}>
                                             {currencyFormatter.format(data.average_amount)}
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
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              innerRadius={70}
                              fill="#8884d8"
                              dataKey="total_amount"
                              nameKey="status"
                         >
                              {chartData.map((entry, index) => (
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
          if (chartType === "area") {
               return (
                    <AreaChart {...commonProps}>
                         <defs>
                              <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id="colorFillSecondary" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                              </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorFill)" strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Area type="monotone" dataKey="expense_count" name="Expense Count" stroke={COLOR_SECONDARY} fill="url(#colorFillSecondary)" strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </AreaChart>
               );
          }
          // Default fallback
          return (
               <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="expense_count" name="Expense Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={50} />
               </BarChart>
          );
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    {/* Always visible header with filters */}
                    <div className="card mb-3" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Expense Payment Status Analytics
                                   </h2>
                                   <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                             <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                       <RiCalendarEventLine size={16} className="text-muted" />
                                                  </span>
                                                  <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                             </div>
                                             <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                       <RiCalendarEventLine size={16} className="text-muted" />
                                                  </span>
                                                  <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                             </div>
                                        </div>
                                        <button onClick={fetchData} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                                             <RiRefreshLine size={16} className="me-1" /> Refresh
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading expense payment status data...</p>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    {/* Always visible header with filters */}
                    <div className="card mb-3" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Expense Payment Status Analytics
                                   </h2>
                                   <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                             <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                       <RiCalendarEventLine size={16} className="text-muted" />
                                                  </span>
                                                  <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                             </div>
                                             <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                       <RiCalendarEventLine size={16} className="text-muted" />
                                                  </span>
                                                  <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                             </div>
                                        </div>
                                        <button onClick={fetchData} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                                             <RiRefreshLine size={16} className="me-1" /> Refresh
                                        </button>
                                   </div>
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
                    {/* Always visible header with filters */}
                    <div className="card mb-3" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Expense Payment Status Analytics
                                   </h2>
                                   <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                             <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                       <RiCalendarEventLine size={16} className="text-muted" />
                                                  </span>
                                                  <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                             </div>
                                             <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                       <RiCalendarEventLine size={16} className="text-muted" />
                                                  </span>
                                                  <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                             </div>
                                        </div>
                                        <button onClick={fetchData} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                                             <RiRefreshLine size={16} className="me-1" /> Refresh
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Data Available</h5>
                         <p className="text-muted px-3">No expense payment status data found for the selected period.</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Always visible header with filters */}
               <div className="card mb-3" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Expense Payment Status Analytics
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                  <RiCalendarEventLine size={16} className="text-muted" />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                  <RiCalendarEventLine size={16} className="text-muted" />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                        </div>
                                   </div>
                                   <button onClick={fetchData} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                                        <RiRefreshLine size={16} className="me-1" /> Refresh
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Data card */}
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                   {viewButtons.map(btn => (
                                        <button
                                             key={btn.type}
                                             type="button"
                                             className={`btn ${chartType === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                             onClick={() => setChartType(btn.type)}
                                             style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                        </button>
                                   ))}
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-4">
                         <ResponsiveContainer width="100%" height={350}>
                              {renderChart()}
                         </ResponsiveContainer>
                    </div>
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="print-date-range" style={{ display: 'none' }}>
                              Report Period: {startDate} - {endDate}
                         </div>
                         <div className="d-flex justify-content-between mb-2">
                              <h4 className="fs-6 fw-medium mb-3">Payment Status Breakdown</h4>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2 text-start">#</th>
                                             <th scope="col" className="py-2 text-start">Payment Status</th>
                                             <th scope="col" className="py-2 text-start">Total Amount</th>
                                             <th scope="col" className="py-2 text-start">Expense Count</th>
                                             <th scope="col" className="py-2 text-start">Average Amount</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {chartData.map((entry, idx) => (
                                             <tr key={idx}>
                                                  <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                  <td className="py-2 text-start fw-medium">{entry.status}</td>
                                                  <td className="py-2 text-start fw-medium">{currencyFormatter.format(entry.total_amount)}</td>
                                                  <td className="py-2 text-start">{entry.expense_count}</td>
                                                  <td className="py-2 text-start">{currencyFormatter.format(entry.average_amount)}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                                   <tfoot>
                                        <tr className="fw-bold border-top">
                                             <td className="py-2 text-start" colSpan={2}>Total</td>
                                             <td className="py-2 text-start">{currencyFormatter.format(totalAmountSum)}</td>
                                             <td className="py-2 text-start">{totalExpensesSum}</td>
                                             <td className="py-2 text-start">-</td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>
                    </div>
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