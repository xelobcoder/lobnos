"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import {
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     ResponsiveContainer,
     Cell,
     LineChart,
     Line,
     AreaChart,
     Area,
     PieChart,
     Pie
} from 'recharts';
import { RiPrinterLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiBarChart2Line, RiCalendarEventLine, RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiPieChartLine, RiRefreshLine } from "@remixicon/react";

interface RegistrationByDayData {
     day: string;
     registrations: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_SECONDARY = '#2563eb'; // Blue for weekdays
const COLOR_WEEKEND = '#dc2626'; // Red for weekends
const COLOR_PEAK = '#16a34a'; // Green for peak days
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const RegistrationByDayOfWeek: React.FC = () => {
     const [data, setData] = useState<RegistrationByDayData[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const [view, setView] = useState<"line" | "bar" | "area" | "pie">("bar");

     const fetchRegistrationByDay = async () => {
          setLoading(true);
          setError(null);
          try {
               const result = await customFetch('patient-analytics/registration-by-day-of-week');
               if (Array.isArray(result)) {
                    setData(result);
               } else {
                    setError('Unexpected data format received.');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching registration by day data');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchRegistrationByDay();
     }, []);

     const handleViewToggle = (newView: "line" | "bar" | "area" | "pie") => {
          setView(newView);
     };

     const getDayColor = (day: string, registrations: number) => {
          // Weekend days
          if (day === 'Saturday' || day === 'Sunday') {
               return COLOR_WEEKEND;
          }
          // Peak weekday (Wednesday has highest registrations)
          if (registrations >= 450) {
               return COLOR_PEAK;
          }
          // Regular weekdays
          return COLOR_SECONDARY;
     };

     const calculateTotals = (data: RegistrationByDayData[]) => {
          const totalRegistrations = data.reduce((sum, item) => sum + item.registrations, 0);
          const avgRegistrations = data.length > 0 ? Math.round(totalRegistrations / data.length) : 0;
          const maxRegistrations = Math.max(...data.map(item => item.registrations));
          const minRegistrations = Math.min(...data.map(item => item.registrations));

          return {
               totalRegistrations,
               avgRegistrations,
               maxRegistrations,
               minRegistrations,
               peakDay: data.find(item => item.registrations === maxRegistrations)?.day || 'N/A'
          };
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               const entry = payload[0].payload;
               const { totalRegistrations } = calculateTotals(data);
               const percentage = totalRegistrations > 0 ? ((entry.registrations / totalRegistrations) * 100).toFixed(1) : '0.0';

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
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Day</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Registrations</span>
                              <span className="fw-bold d-block" style={{ color: payload[0].color }}>{entry.registrations.toLocaleString()}</span>
                         </div>
                         <div className="mb-1">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Percentage</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{percentage}%</span>
                         </div>
                    </div>
               );
          }
          return null;
     };

     const totals = calculateTotals(data);

     const renderChart = () => {
          const commonProps = {
               data: data,
               margin: { top: 20, right: 30, left: 20, bottom: 60 },
          };
          const xAxisProps = {
               dataKey: "day",
               tickFormatter: (value: string) => value.substring(0, 3), // Show first 3 letters
               angle: 0,
               textAnchor: "middle" as const,
               height: 60,
               interval: 0,
               tick: { fontSize: 12, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };
          const yAxisProps = {
               tickFormatter: (value: number) => value.toLocaleString(),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 80,
          };
          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar
                              dataKey="registrations"
                              name="Registrations"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={50}
                         >
                              {data.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={getDayColor(entry.day, entry.registrations)} />
                              ))}
                         </Bar>
                    </BarChart>
               );
          }

          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line
                              type="monotone"
                              dataKey="registrations"
                              name="Registrations"
                              stroke={COLOR_ACCENT}
                              strokeWidth={3}
                              dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
                         />
                    </LineChart>
               );
          }

          if (view === "area") {
               return (
                    <AreaChart {...commonProps}>
                         <defs>
                              <linearGradient id="colorRegistrationsFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                                   <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                              </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Area
                              type="monotone"
                              dataKey="registrations"
                              name="Registrations"
                              stroke={COLOR_ACCENT}
                              fill="url(#colorRegistrationsFill)"
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
                         />
                    </AreaChart>
               );
          }

          if (view === "pie") {
               // For pie chart, we'll show the distribution of registrations by day
               const pieData = data.map(entry => ({
                    name: entry.day,
                    value: entry.registrations,
                    color: getDayColor(entry.day, entry.registrations)
               }));

               const CustomPieTooltip = ({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                         const data = payload[0];
                         const percentage = totals.totalRegistrations > 0 ? ((data.value / totals.totalRegistrations) * 100).toFixed(1) : '0.0';

                         return (
                              <div
                                   className="rounded-lg border p-2 shadow-sm"
                                   style={{
                                        backgroundColor: COLOR_TOOLTIP_BG,
                                        borderColor: COLOR_BORDER,
                                        minWidth: '180px',
                                        fontSize: '0.8rem'
                                   }}
                              >
                                   <div className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Day</span>
                                        <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{data.name}</span>
                                   </div>
                                   <div className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Registrations</span>
                                        <span className="fw-bold d-block" style={{ color: data.color }}>{data.value.toLocaleString()}</span>
                                   </div>
                                   <div>
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Percentage</span>
                                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{percentage}%</span>
                                   </div>
                              </div>
                         );
                    }
                    return null;
               };

               return (
                    <PieChart>
                         <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={2}
                              dataKey="value"
                         >
                              {pieData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
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

          // Default fallback - should never reach here due to type constraints
          return (
               <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Bar
                         dataKey="registrations"
                         name="Registrations"
                         radius={[4, 4, 0, 0]}
                         maxBarSize={50}
                    >
                         {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getDayColor(entry.day, entry.registrations)} />
                         ))}
                    </Bar>
               </BarChart>
          );
     };

     return (
          <div className="card" style={{
               borderRadius: '0.75rem',
               borderColor: COLOR_BORDER,
               boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
               background: 'var(--bs-body-bg)'
          }}>
               <div className="card-header py-3 px-4" style={{
                    backgroundColor: 'var(--bs-tertiary-bg)',
                    borderColor: COLOR_BORDER
               }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiCalendarEventLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Patient Registration by Day of Week
                         </h2>
                         <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                              <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                   {[
                                        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
                                        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
                                        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
                                        { type: "pie" as const, icon: RiPieChartLine, label: "Pie" },
                                   ].map(btn => (
                                        <button
                                             key={btn.type}
                                             type="button"
                                             className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                             onClick={() => handleViewToggle(btn.type)}
                                             style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                        </button>
                                   ))}
                              </div>
                              <button
                                   className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 mt-2 mt-sm-0"
                                   onClick={() => window.print()}
                                   title="Print this report"
                              >
                                   <RiPrinterLine size={16} />
                                   Print
                              </button>
                         </div>
                    </div>
               </div>

               <div className="card-body p-3 p-md-4">
                    {loading ? (
                         <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <p className="text-muted">Loading registration data...</p>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted px-3">{error}</p>
                         </div>
                    ) : data.length === 0 ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiInbox2Line size={48} className="mb-3 text-muted" />
                              <h5 className="fw-medium mb-1">No Data Available</h5>
                              <p className="text-muted px-3">No registration data for the selected period.</p>
                         </div>
                    ) : (
                         <div className="row g-4">
                              {/* Summary Cards */}
                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiBarChart2Line size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                             <span className="fw-medium text-muted small">Total Registrations</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-body-emphasis">{totals.totalRegistrations.toLocaleString()}</div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiCalendarEventLine size={20} className="me-2" style={{ color: COLOR_PEAK }} />
                                             <span className="fw-medium text-muted small">Peak Day</span>
                                        </div>
                                        <div className="fs-4 fw-bold" style={{ color: COLOR_PEAK }}>{totals.peakDay}</div>
                                        <div className="small text-muted">{totals.maxRegistrations} registrations</div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiBarChart2Line size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                             <span className="fw-medium text-muted small">Average per Day</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-body-emphasis">{totals.avgRegistrations}</div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiBarChart2Line size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                             <span className="fw-medium text-muted small">Range</span>
                                        </div>
                                        <div className="fs-6 fw-bold text-body-emphasis">
                                             {totals.minRegistrations} - {totals.maxRegistrations}
                                        </div>
                                   </div>
                              </div>

                              {/* Chart */}
                              <div className="col-12">
                                   <div style={{ width: "100%", height: 400 }}>
                                        <ResponsiveContainer>
                                             {renderChart()}
                                        </ResponsiveContainer>
                                   </div>
                              </div>

                              {/* Data Table */}
                              <div className="col-12">
                                   <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                             <h5 className="mb-0 fw-medium">Detailed Breakdown</h5>
                                        </div>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover table-striped small">
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th className="py-2 text-start">Day</th>
                                                            <th className="py-2 text-start">Registrations</th>
                                                            <th className="py-2 text-start">Percentage</th>
                                                            <th className="py-2 text-start">vs Average</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {data.map((item, idx) => {
                                                            const percentage = totals.totalRegistrations > 0 ? ((item.registrations / totals.totalRegistrations) * 100).toFixed(1) : '0.0';
                                                            const vsAverage = item.registrations - totals.avgRegistrations;
                                                            const isAboveAverage = vsAverage > 0;

                                                            return (
                                                                 <tr key={idx}>
                                                                      <td className="py-2 fw-medium text-start">{item.day}</td>
                                                                      <td className="py-2 fw-medium text-start">{item.registrations.toLocaleString()}</td>
                                                                      <td className="py-2 text-start">{percentage}%</td>
                                                                      <td className={`py-2 text-start ${isAboveAverage ? 'text-success' : 'text-danger'}`}>
                                                                           {isAboveAverage ? '+' : ''}{vsAverage}
                                                                      </td>
                                                                 </tr>
                                                            );
                                                       })}
                                                       <tr className="table-light fw-bold">
                                                            <td className="py-2">Total</td>
                                                            <td className="py-2">{totals.totalRegistrations.toLocaleString()}</td>
                                                            <td className="py-2">100.0%</td>
                                                            <td className="py-2">-</td>
                                                       </tr>
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>

               <style jsx global>{`
				.animate-spin {
					animation: spin 1s linear infinite;
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}

				@media print {
					.card-header {
						background-color: white !important;
						-webkit-print-color-adjust: exact;
						color-adjust: exact;
					}
					.btn {
						display: none !important;
					}
				}
			`}</style>
          </div>
     );
};

export default RegistrationByDayOfWeek;
