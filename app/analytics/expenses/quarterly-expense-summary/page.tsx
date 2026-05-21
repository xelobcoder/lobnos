"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiCalendarEventLine, RiRefreshLine, RiPrinterLine, RiLineChartLine, RiBubbleChartLine } from "@remixicon/react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface QuarterlyExpenseData {
     expense_quarter: number;
     expenses_paid: string;
     expense_count: number;
     avg_expense_amount: string;
     unique_employees: number;
}function getQuarterLabel(year: number, quarter: number) {
     return `Q${quarter} - ${year}`;
}

export default function QuarterlyExpenseSummary() {
     const [data, setData] = useState<QuarterlyExpenseData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [year, setYear] = useState<number>(() => new Date().getFullYear());
     const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");

     const { branchid, user } = useApplication();
     const employeeid = user?.employeeid;

     const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/quarterly?branchid=${branchid}&year=${year}&&employeeid=${employeeid}`;
               const response = await customFetch(endpoint);
               if (response && response.status === 'success' && response.data && Array.isArray(response.data)) {
                    setData(response.data);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err: any) {
               setError(err.message || "Failed to fetch data");
          } finally {
               setLoading(false);
          }
     };

     const handleResetFilters = () => {
          setYear(new Date().getFullYear());
     };

     useEffect(() => {
          if (branchid) {
               fetchData();
          }
          // eslint-disable-next-line
     }, [branchid]);

     const chartData = data.map(item => ({
          ...item,
          total_amount: parseFloat(item.expenses_paid),
          average_amount: parseFloat(item.avg_expense_amount),
          quarterLabel: getQuarterLabel(year, item.expense_quarter),
          unique_employees: item.unique_employees
     }));

     const totalAmountSum = chartData.reduce((sum, entry) => sum + entry.total_amount, 0);
     const totalExpensesSum = chartData.reduce((sum, entry) => sum + entry.expense_count, 0);

     const CustomTooltip = ({ active, payload }: any) => {
          if (active && payload && payload.length) {
               const entry = payload[0].payload;
               return (
                    <div
                         className="rounded-lg border p-2 shadow-sm"
                         style={{
                              backgroundColor: 'var(--bs-body-bg)',
                              borderColor: COLOR_BORDER,
                              minWidth: '180px',
                              fontSize: '0.85rem',
                              color: 'var(--bs-body-color)'
                         }}
                    >
                         <div className="mb-1">
                              <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Quarter</span>
                              <span className="fw-bold d-block">{entry.quarterLabel}</span>
                         </div>
                         <div className="mb-1">
                              <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expenses Paid</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(entry.total_amount)}</span>
                         </div>
                         <div className="mb-1">
                              <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expense Count</span>
                              <span className="fw-bold d-block">{entry.expense_count}</span>
                         </div>
                         <div className="mb-1">
                              <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Average Amount</span>
                              <span className="fw-bold d-block">{currencyFormatter.format(entry.average_amount)}</span>
                         </div>
                         <div>
                              <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Unique Employees</span>
                              <span className="fw-bold d-block">{entry.unique_employees}</span>
                         </div>
                    </div>
               );
          }
          return null;
     };

     const viewButtons = [
          { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
          { type: "line" as const, icon: RiLineChartLine, label: "Line" },
          { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
     ];

     const renderChart = () => {
          const commonProps = {
               data: chartData,
               margin: { top: 20, right: 30, left: 20, bottom: 45 },
          };
          const xAxisProps = {
               dataKey: "quarterLabel",
               tick: { fontSize: 12 },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };
          const yAxisProps = {
               allowDecimals: false,
               tick: { fontSize: 12 },
               axisLine: false,
               tickLine: false,
               width: 95,
               tickFormatter: (value: number) => currencyFormatter.format(value),
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
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[8, 8, 0, 0]} maxBarSize={40} />
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
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: 'var(--bs-body-bg)' }} />
                    </LineChart>
               );
          }
          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorTotalAmountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorTotalAmountFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: 'var(--bs-body-bg)' }} />
               </AreaChart>
          );
     };

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Quarterly Expense Summary
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
                                   <div className="input-group input-group-sm" style={{ flexBasis: '120px', minWidth: '110px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                             <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                        </span>
                                        <input id="yearQES" type="number" className="form-control shadow-none border-start-0" value={year} onChange={e => setYear(parseInt(e.target.value))} aria-label="Year" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} min="2020" max="2030" />
                                   </div>
                                   <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset year filter" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
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
                              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading data...</p>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                         </div>
                    ) : chartData.length === 0 ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                              <h5 className="fw-medium mb-1">No Data Available</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                                   No quarterly expense data for the selected year or branch.
                              </p>
                         </div>
                    ) : (
                         <div style={{ width: "100%", height: 350 }}>
                              <ResponsiveContainer>
                                   {renderChart()}
                              </ResponsiveContainer>
                         </div>
                    )}
               </div>
               {chartData.length > 0 && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="d-flex justify-content-between mb-2">
                              <h4 className="fs-6 fw-medium mb-3">Quarterly Expense Table</h4>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                                   Print
                              </button>
                         </div>
                         <div className="print-date-range" style={{ display: 'none' }}>
                              Report Period: {year}
                         </div>
                         <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2 text-start">#</th>
                                             <th scope="col" className="py-2 text-start">Quarter</th>
                                             <th scope="col" className="py-2 text-start">Total Amount</th>
                                             <th scope="col" className="py-2 text-start">Expense Count</th>
                                             <th scope="col" className="py-2 text-start">Average Amount</th>
                                             <th scope="col" className="py-2 text-start">Unique Employees</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {chartData.map((entry, idx) => (
                                             <tr key={idx}>
                                                  <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                  <td className="py-2 text-start fw-medium">{entry.quarterLabel}</td>
                                                  <td className="py-2 text-start fw-medium">{currencyFormatter.format(entry.total_amount)}</td>
                                                  <td className="py-2 text-start">{entry.expense_count}</td>
                                                  <td className="py-2 text-start">{currencyFormatter.format(entry.average_amount)}</td>
                                                  <td className="py-2 text-start">{entry.unique_employees}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                                   <tfoot>
                                        <tr className="fw-bold border-top">
                                             <td className="py-2 text-start" colSpan={2}>Total</td>
                                             <td className="py-2 text-start">{currencyFormatter.format(totalAmountSum)}</td>
                                             <td className="py-2 text-start">{totalExpensesSum}</td>
                                             <td className="py-2 text-start">-</td>
                                             <td className="py-2 text-start">-</td>
                                        </tr>
                                   </tfoot>
                              </table>
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
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color);
                }
                
                @media print {
                    .card-header {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    .print-date-range {
                        display: block !important;
                    }
                    .btn {
                        display: none !important;
                    }
                    .table-responsive {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    .printable-table-with-borders {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
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