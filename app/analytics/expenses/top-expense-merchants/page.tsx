"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     LineChart,
     Line,
     AreaChart,
     Area,
} from "recharts";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiShoppingBagLine, RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiCalendarEventLine, RiRefreshLine, RiPrinterLine } from "@remixicon/react";

// Color variables to match sales chart
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue
const COLOR_TERTIARY = '#ea580c'; // Orange
const COLOR_EXPENSES = '#dc2626'; // Red

interface TopExpenseMerchant {
     merchant_name: string;
     expense_date: string;
     total_amount: string;
     expense_count: number;
}

export default function TopExpenseMerchants() {
     const [data, setData] = useState<TopExpenseMerchant[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [startDate, setStartDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
     });
     const [endDate, setEndDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
     });
     const [branches, setBranches] = useState<any[]>([]);
     const [branchid, setBranchid] = useState<number | null>(null);
     const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
     const { user } = useApplication();

     const fetchData = async () => {
          if (!branchid) return;
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/trends/merchant?branchid=${branchid}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
               const response = await customFetch(endpoint);
               const { data } = response;
               if (response && data && Array.isArray(data)) {
                    setData(data);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err: any) {
               setError(err.message || "Failed to fetch data");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          async function fetchBranches() {
               try {
                    const response = await customFetch("branches");
                    if (response && Array.isArray(response.result)) {
                         setBranches(response.result);
                         if (response.result.length > 0) setBranchid(response.result[0].branchid);
                    }
               } catch { }
          }
          fetchBranches();
     }, []);

     useEffect(() => {
          if (branchid) {
               fetchData();
          }
     }, [branchid]);

     const totalAmountSum = data.reduce((sum, entry) => sum + parseFloat(entry.total_amount), 0);
     const totalExpenseCount = data.reduce((sum, entry) => sum + entry.expense_count, 0);

     // Prepare data for the chart
     const chartData = useMemo(() =>
          data.map(item => ({
               ...item,
               total_amount: parseFloat(item.total_amount),
               merchant_name: item.merchant_name
          })), [data]);

     const totalChartAmountSum = useMemo(() => chartData.reduce((sum, entry) => sum + entry.total_amount, 0), [chartData]);

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               const entry = payload[0].payload;
               const percentageOfTotal = totalChartAmountSum > 0 ? ((entry.total_amount / totalChartAmountSum) * 100).toFixed(1) : '0.0';
               return (
                    <div
                         className="rounded-lg border p-2 shadow-sm"
                         style={{
                              backgroundColor: COLOR_TOOLTIP_BG,
                              borderColor: COLOR_BORDER,
                              minWidth: '200px',
                              fontSize: '0.8rem'
                         }}
                    >
                         <div className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Merchant</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.merchant_name}</span>
                         </div>
                         <div className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Amount</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                   {currencyFormatter.format(entry.total_amount)} ({percentageOfTotal}%)
                              </span>
                         </div>
                         <div>
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expense Count</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{entry.expense_count}</span>
                         </div>
                    </div>
               );
          }
          return null;
     };

     const renderChart = () => {
          const commonProps = {
               data: chartData,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };
          const xAxisProps = {
               dataKey: "merchant_name",
               tickFormatter: (value: string) => value.length > 15 ? `${value.substring(0, 15)}...` : value,
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
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
               );
          }
          if (chartType === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }
          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorTotalSpentFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorTotalSpentFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const viewButtons = [
          { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
          { type: "line" as const, icon: RiLineChartLine, label: "Line" },
          { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
     ];

     const handleResetFilters = () => {
          const now = new Date();
          setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
          setEndDate(new Date().toISOString().slice(0, 10));
     };

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiShoppingBagLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Top Expense Merchants
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
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
                              <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                             <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                        </span>
                                        <input id="startDateTEM" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={e => setStartDate(e.target.value)} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                                   </div>
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                             <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                        </span>
                                        <input id="endDateTEM" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={e => setEndDate(e.target.value)} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} min={startDate} />
                                   </div>
                                   <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        <RiRefreshLine size={16} className="me-1" /> Reset
                                   </button>
                                   <button onClick={fetchData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        <RiLoader4Line size={16} className="me-1" /> Load Data
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>
               <div className="card-body p-3 p-md-4">
                    {loading ? (
                         <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading merchant data...</p>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                         </div>
                    ) : data.length === 0 ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                              <h5 className="fw-medium mb-1">No Data Available</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                                   No merchant expense data for the selected period.
                              </p>
                         </div>
                    ) : (
                         <div>
                              <div style={{ width: "100%", height: 350 }} className="mb-4">
                                   <ResponsiveContainer>
                                        {renderChart()}
                                   </ResponsiveContainer>
                              </div>
                              <div>
                                   <div className="d-flex justify-content-between mb-2">
                                        <h4 className="fs-6 fw-medium mb-3">
                                             Top Expense Merchants Data
                                        </h4>
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                             Print
                                        </button>
                                   </div>
                                   <div className="print-date-range" style={{ display: 'none' }}>
                                        Expense Report Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                   </div>
                                   <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th scope="col" className="py-2 text-start">#</th>
                                                       <th scope="col" className="py-2 text-start">Merchant Name</th>
                                                       <th scope="col" className="py-2 text-start">Total Amount</th>
                                                       <th scope="col" className="py-2 text-start">Expense Count</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {data.map((merchant, idx) => (
                                                       <tr key={`${merchant.merchant_name}-${idx}`}>
                                                            <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                            <td className="py-2 text-start fw-medium">{merchant.merchant_name}</td>
                                                            <td className="py-2 text-start fw-medium">{currencyFormatter.format(parseFloat(merchant.total_amount))}</td>
                                                            <td className="py-2 text-start">{merchant.expense_count}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                             <tfoot>
                                                  <tr className="fw-bold border-top">
                                                       <td className="py-2 text-start" colSpan={2}>Total</td>
                                                       <td className="py-2 text-start">{currencyFormatter.format(totalAmountSum)}</td>
                                                       <td className="py-2 text-start">{totalExpenseCount}</td>
                                                  </tr>
                                             </tfoot>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
               {data.length > 0 && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="row g-3">
                              <div className="col-md-4">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-primary">{data.length}</div>
                                        <div className="text-muted small">Top Merchants</div>
                                   </div>
                              </div>
                              <div className="col-md-4">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-success">{currencyFormatter.format(totalAmountSum)}</div>
                                        <div className="text-muted small">Total Expenses</div>
                                   </div>
                              </div>
                              <div className="col-md-4">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-info">{totalExpenseCount}</div>
                                        <div className="text-muted small">Total Transactions</div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
               <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media print {
          .printable-table-with-borders tbody tr {
            border: none !important;
            border-bottom: 2px solid #000 !important;
          }
          .printable-table-with-borders tbody tr:nth-child(odd) {
            background-color: #f8f9fa !important;
          }
          .printable-table-with-borders th,
          .printable-table-with-borders td {
            padding: 0.25rem 0.5rem !important;
          }
        }
      `}</style>
          </div>
     );
}