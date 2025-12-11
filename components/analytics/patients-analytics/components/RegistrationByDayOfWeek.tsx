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
     Cell
} from 'recharts';
import { RiPrinterLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiBarChart2Line, RiCalendarEventLine } from "@remixicon/react";

interface RegistrationByDayData {
     day: string;
     registrations: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_WEEKEND = '#e74c3c'; // Red for weekends
const COLOR_WEEKDAY = '#3498db'; // Blue for weekdays
const COLOR_PEAK = '#27ae60'; // Green for peak days
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const RegistrationByDayOfWeek: React.FC = () => {
     const [data, setData] = useState<RegistrationByDayData[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

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
          return COLOR_WEEKDAY;
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
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiCalendarEventLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Patient Registration by Day of Week
                         </h2>
                         <div className="d-flex gap-2">
                              <button
                                   className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
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
                                   <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                             <h5 className="mb-0 fw-medium">Weekly Registration Pattern</h5>
                                             <div className="d-flex gap-3 small">
                                                  <div className="d-flex align-items-center">
                                                       <div className="rounded me-2" style={{ width: '12px', height: '12px', backgroundColor: COLOR_WEEKDAY }}></div>
                                                       <span>Weekdays</span>
                                                  </div>
                                                  <div className="d-flex align-items-center">
                                                       <div className="rounded me-2" style={{ width: '12px', height: '12px', backgroundColor: COLOR_WEEKEND }}></div>
                                                       <span>Weekends</span>
                                                  </div>
                                                  <div className="d-flex align-items-center">
                                                       <div className="rounded me-2" style={{ width: '12px', height: '12px', backgroundColor: COLOR_PEAK }}></div>
                                                       <span>Peak Day</span>
                                                  </div>
                                             </div>
                                        </div>

                                        <div style={{ width: "100%", height: 400 }}>
                                             <ResponsiveContainer>
                                                  <BarChart
                                                       data={data}
                                                       margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                                  >
                                                       <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                       <XAxis
                                                            dataKey="day"
                                                            tickFormatter={(value: string) => value.substring(0, 3)} // Show first 3 letters
                                                            angle={0}
                                                            textAnchor="middle"
                                                            height={60}
                                                            interval={0}
                                                            tick={{ fontSize: 12, fill: COLOR_TEXT_MUTED }}
                                                            axisLine={{ stroke: COLOR_BORDER }}
                                                            tickLine={{ stroke: COLOR_BORDER }}
                                                       />
                                                       <YAxis
                                                            tickFormatter={(value: number) => value.toLocaleString()}
                                                            tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            width={80}
                                                       />
                                                       <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                       <Legend
                                                            verticalAlign="top"
                                                            align="right"
                                                            iconType="circle"
                                                            iconSize={8}
                                                            wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
                                                       />
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
                                             </ResponsiveContainer>
                                        </div>
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
