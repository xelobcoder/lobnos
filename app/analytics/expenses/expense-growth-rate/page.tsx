"use client";

import React, { useEffect, useState, ReactElement } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiRefreshLine, RiCalendarEventLine, RiPieChartLine } from "@remixicon/react";


const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb';
const COLOR_TERTIARY = '#ea580c';
const COLOR_POSITIVE = '#10b981'; // Green for positive growth
const COLOR_NEGATIVE = '#ef4444'; // Red for negative growth

interface GrowthRateData {
     month: number;
     current_amount: string;
     previous_amount: string | null;
     growth_percentage: string | null;
}

export default function ExpenseGrowthRate() {
     const [data, setData] = useState<GrowthRateData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
     const [selectedBranchid, setSelectedBranchid] = useState<number | null>(null);
     const [branches, setBranches] = useState<any[]>([]);
     const [chartType, setChartType] = useState<'bar' | 'line'>('line');


     const viewButtons = [
          { type: 'bar' as const, label: 'Bar', icon: RiBarChartBoxLine },
          { type: 'line' as const, label: 'Line', icon: RiLineChartLine }
     ];

     const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/growth-rate?year=${selectedYear}${selectedBranchid ? `&branchid=${selectedBranchid}` : ''}`;
               const response = await customFetch(endpoint);
               const responseData = response?.data;
               if (response && Array.isArray(responseData)) {
                    setData(responseData);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err) {
               setError("Failed to fetch expense growth rate data");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          const fetchBranches = async () => {
               try {
                    const response = await customFetch('branches');
                    if (response && Array.isArray(response.result)) {
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
          current_amount: parseFloat(item.current_amount),
          previous_amount: item.previous_amount ? parseFloat(item.previous_amount) : null,
          growth_percentage: item.growth_percentage ? parseFloat(item.growth_percentage) : null,
          month_name: new Date(selectedYear, item.month - 1, 1).toLocaleDateString('en-US', { month: 'short' })
     }));

     const totalCurrentAmount = chartData.reduce((sum, entry) => sum + entry.current_amount, 0);
     const avgGrowthRate = chartData
          .filter(entry => entry.growth_percentage !== null)
          .reduce((sum, entry, _, arr) => sum + (entry.growth_percentage || 0) / arr.length, 0);

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               const data = payload[0].payload;
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Month</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color }}>
                                        {item.dataKey === 'current_amount' ? currencyFormatter.format(item.value) :
                                             item.dataKey === 'growth_percentage' ? `${item.value?.toFixed(2)}%` : item.value}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderChart = (): ReactElement => {
          const commonProps = {
               data: chartData,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "month_name",
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

          const growthYAxisProps = {
               tickFormatter: (value: number) => `${value.toFixed(1)}%`,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 60,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          switch (chartType) {
               case "bar":
                    return (
                         <BarChart {...commonProps}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                              <XAxis {...xAxisProps} />
                              <YAxis {...yAxisProps} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                              <Legend {...legendProps} />
                              <Bar dataKey="current_amount" name="Current Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={50} />
                         </BarChart>
                    );
               case "line":
                    return (
                         <LineChart {...commonProps}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                              <XAxis {...xAxisProps} />
                              <YAxis {...yAxisProps} />
                              <YAxis {...growthYAxisProps} orientation="right" yAxisId="growth" />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                              <Legend {...legendProps} />
                              <Line
                                   type="monotone"
                                   dataKey="current_amount"
                                   name="Current Amount"
                                   stroke={COLOR_ACCENT}
                                   strokeWidth={2}
                                   dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                                   activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
                              />
                              <Line
                                   type="monotone"
                                   dataKey="growth_percentage"
                                   name="Growth Rate (%)"
                                   stroke={COLOR_SECONDARY}
                                   strokeWidth={2}
                                   dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                                   activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }}
                                   yAxisId="growth"
                              />
                         </LineChart>
                    );
               default:
                    return <div>Invalid chart type</div>;
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Expense Growth Rate Analytics
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <select
                                        className="form-select form-select-sm"
                                        value={selectedBranchid || ''}
                                        onChange={(e) => setSelectedBranchid(Number(e.target.value) || null)}
                                        style={{ flexBasis: '200px', minWidth: '180px' }}
                                   >
                                        <option value="">All Branches</option>
                                        {branches.map((branch) => (
                                             <option key={branch.branchid} value={branch.branchid}>
                                                  {branch.name}
                                             </option>
                                        ))}
                                   </select>
                                   <select
                                        className="form-select form-select-sm"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        style={{ flexBasis: '120px', minWidth: '100px' }}
                                   >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                             <option key={year} value={year}>
                                                  {year}
                                             </option>
                                        ))}
                                   </select>
                                   <button onClick={fetchData} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                                        <RiLoader4Line size={16} className="me-1" /> Load
                                   </button>
                                   {data.length > 0 && (
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
                                   )}
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-4">
                         {loading && (
                              <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                                   <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                                   <p className="text-muted">Loading expense growth rate data...</p>
                              </div>
                         )}
                         {error && (
                              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                                   <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                                   <h5 className="fw-medium mb-1">Error Loading Data</h5>
                                   <p className="text-muted px-3">{error}</p>
                                   <button className="btn btn-primary" onClick={fetchData}>Retry</button>
                              </div>
                         )}
                         {!loading && !error && data.length === 0 && (
                              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                                   <RiInbox2Line size={48} className="mb-3 text-muted" />
                                   <h5 className="fw-medium mb-1">No Data Available</h5>
                                   <p className="text-muted px-3">No expense growth rate data found for the selected year and branch.</p>
                              </div>
                         )}
                         {!loading && !error && data.length > 0 && (
                              <div style={{ width: "100%", height: 350 }}>
                                   <ResponsiveContainer>
                                        {renderChart()}
                                   </ResponsiveContainer>
                              </div>
                         )}
                    </div>
                    {!loading && !error && data.length > 0 && (
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Report Year: {selectedYear}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Expense Growth Rate Breakdown</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th scope="col" className="py-2 text-start">#</th>
                                                  <th scope="col" className="py-2 text-start">Month</th>
                                                  <th scope="col" className="py-2 text-start">Current Amount</th>
                                                  <th scope="col" className="py-2 text-start">Previous Amount</th>
                                                  <th scope="col" className="py-2 text-start">Growth Rate</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {chartData.map((entry, idx) => (
                                                  <tr key={idx}>
                                                       <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                       <td className="py-2 text-start fw-medium">{entry.month_name}</td>
                                                       <td className="py-2 text-start fw-medium">{currencyFormatter.format(entry.current_amount)}</td>
                                                       <td className="py-2 text-start">
                                                            {entry.previous_amount ? currencyFormatter.format(entry.previous_amount) : '-'}
                                                       </td>
                                                       <td className="py-2 text-start" style={{ color: (entry.growth_percentage || 0) >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE }}>
                                                            {entry.growth_percentage !== null ? `${entry.growth_percentage.toFixed(2)}%` : '-'}
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                        <tfoot>
                                             <tr className="fw-bold border-top">
                                                  <td className="py-2 text-start" colSpan={2}>Total/Average</td>
                                                  <td className="py-2 text-start">{currencyFormatter.format(totalCurrentAmount)}</td>
                                                  <td className="py-2 text-start">-</td>
                                                  <td className="py-2 text-start" style={{ color: avgGrowthRate >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE }}>
                                                       {avgGrowthRate.toFixed(2)}%
                                                  </td>
                                             </tr>
                                        </tfoot>
                                   </table>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
}