"use client";
import React, { useEffect, useState, ReactElement } from "react";
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

interface ExpenseBucket {
     bucket: string;
     expense_count: number;
     total_amount: string;
     avg_amount: string;
}

export default function ExpenseBuckets() {
     const [data, setData] = useState<ExpenseBucket[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [selectedBranchid, setSelectedBranchid] = useState<number | null>(null);
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
     const { user, applicationsettings } = useApplication();

     const viewButtons = [
          { type: 'bar' as const, label: 'Bar', icon: RiBarChartBoxLine },
          { type: 'pie' as const, label: 'Doughnut', icon: RiPieChartLine }
     ];

     const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses/analytics/buckets?branchid=${selectedBranchid}&startDate=${startDate}&endDate=${endDate}`;
               const response = await customFetch(endpoint);
               const responseData = response?.data;
               if (response && Array.isArray(responseData)) {
                    setData(responseData);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err) {
               setError("Failed to fetch expense buckets data");
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
          total_amount: parseFloat(item.total_amount),
          average_amount: parseFloat(item.avg_amount),
          bucket_name: item.bucket
     }));

     const totalAmountSum = chartData.reduce((sum, entry) => sum + entry.total_amount, 0);
     const totalExpensesSum = chartData.reduce((sum, entry) => sum + entry.expense_count, 0);

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Bucket</span>
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

     const renderChart = (): ReactElement => {
          const commonProps = {
               data: chartData,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "bucket_name",
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

          switch (chartType) {
               case "bar":
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
               case "pie":
                    const COLORS = [COLOR_ACCENT, COLOR_SECONDARY, COLOR_TERTIARY, '#10b981', '#f59e0b'];

                    const CustomPieTooltip = ({ active, payload }: any) => {
                         if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                   <div className="rounded-lg border p-2 shadow-sm"
                                        style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '200px', fontSize: '0.8rem' }}>
                                        <div className="mb-2">
                                             <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Bucket</span>
                                             <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{data.bucket_name}</span>
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
                                   label={({ bucket_name, percent }) => `${bucket_name} ${(percent * 100).toFixed(0)}%`}
                                   outerRadius={120}
                                   innerRadius={70}
                                   fill="#8884d8"
                                   dataKey="total_amount"
                                   nameKey="bucket_name"
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
                                   Expense Buckets Analytics
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <select
                                        className="form-select form-select-sm"
                                        value={selectedBranchid || ''}
                                        onChange={(e) => setSelectedBranchid(Number(e.target.value))}
                                        style={{ flexBasis: '200px', minWidth: '180px' }}
                                   >
                                        <option value="">Select Branch</option>
                                        {branches.map((branch) => (
                                             <option key={branch.branchid} value={branch.branchid}>
                                                  {branch.name}
                                             </option>
                                        ))}
                                   </select>
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
                                   <button onClick={fetchData} className="btn btn-sm btn-outline-secondary d-flex align-items-center" disabled={!selectedBranchid}>
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
                                   <p className="text-muted">Loading expense buckets data...</p>
                              </div>
                         )}
                         {error && (
                              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                                   <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                                   <h5 className="fw-medium mb-1">Error Loading Data</h5>
                                   <p className="text-muted px-3">{error}</p>
                                   <button className="btn btn-primary" onClick={fetchData} disabled={!selectedBranchid}>Retry</button>
                              </div>
                         )}
                         {!loading && !error && data.length === 0 && (
                              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                                   <RiInbox2Line size={48} className="mb-3 text-muted" />
                                   <h5 className="fw-medium mb-1">No Data Available</h5>
                                   <p className="text-muted px-3">No expense buckets data found for the selected period.</p>
                              </div>
                         )}
                         {!loading && !error && data.length > 0 && (
                              <ResponsiveContainer width="100%" height={350}>
                                   {renderChart()}
                              </ResponsiveContainer>
                         )}
                    </div>
                    {!loading && !error && data.length > 0 && (
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Report Period: {startDate} - {endDate}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Expense Buckets Breakdown</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th scope="col" className="py-2 text-start">#</th>
                                                  <th scope="col" className="py-2 text-start">Bucket</th>
                                                  <th scope="col" className="py-2 text-start">Total Amount</th>
                                                  <th scope="col" className="py-2 text-start">Expense Count</th>
                                                  <th scope="col" className="py-2 text-start">Average Amount</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {chartData.map((entry, idx) => (
                                                  <tr key={idx}>
                                                       <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                                       <td className="py-2 text-start fw-medium">{entry.bucket_name}</td>
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
                    )}
               </div>
          </div>
     );
}