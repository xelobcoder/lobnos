'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
     BarChart,
     Bar,
     LineChart,
     Line,
     PieChart,
     Pie,
     Cell,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     ResponsiveContainer
} from 'recharts';
import { RiBarChartBoxLine, RiLineChartLine, RiLoader4Line, RiCalendarEventLine, RiDownloadLine, RiUserLine, RiCloseCircleLine, RiTimeLine, RiPieChartLine } from '@remixicon/react';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../components/Auth/customFetch';

interface AttendanceSummary {
     month: number;
     year: number;
     total_employees: number;
     present_days: number;
     absent_days: number;
     late_days: number;
     half_days: number;
     total_overtime_hours: number;
     average_attendance: number;
}

interface MonthlyTrend {
     month: string;
     present: number;
     absent: number;
     late: number;
     average_attendance: number;
}

interface DepartmentStats {
     department: string;
     present_percentage: number;
     absent_percentage: number;
     late_percentage: number;
     total_employees: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_SUCCESS = '#198754';
const COLOR_DANGER = '#dc3545';
const COLOR_WARNING = '#ffc107';
const COLOR_INFO = '#0dcaf0';

const CHART_COLORS = [COLOR_ACCENT, COLOR_SUCCESS, COLOR_WARNING, COLOR_DANGER, COLOR_INFO];

export default function AttendanceSummaryPage() {
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [summary, setSummary] = useState<AttendanceSummary | null>(null);
     const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
     const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     // Filters
     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
     const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

     const viewButtons = [
          { type: 'bar' as const, label: 'Bar Chart', icon: RiBarChartBoxLine },
          { type: 'line' as const, label: 'Line Chart', icon: RiLineChartLine }
     ];

     useEffect(() => {
          fetchAttendanceData();
     }, [selectedMonth, selectedYear]);

     const fetchAttendanceData = async () => {
          setLoading(true);
          setError(null);

          try {
               // Fetch summary
               const summaryResponse = await customFetch(`payroll/attendance/summary?month=${selectedMonth}&year=${selectedYear}`);
               if (summaryResponse?.status === 'success') {
                    setSummary(summaryResponse.result);
               }

               // Fetch monthly trend (mock data for now - would need backend endpoint)
               const mockTrend: MonthlyTrend[] = [
                    { month: 'Jan', present: 450, absent: 25, late: 15, average_attendance: 94.5 },
                    { month: 'Feb', present: 420, absent: 30, late: 20, average_attendance: 92.8 },
                    { month: 'Mar', present: 480, absent: 15, late: 10, average_attendance: 96.2 },
                    { month: 'Apr', present: 460, absent: 20, late: 18, average_attendance: 95.1 },
                    { month: 'May', present: 440, absent: 35, late: 12, average_attendance: 91.8 },
                    { month: 'Jun', present: 470, absent: 18, late: 8, average_attendance: 95.9 }
               ];
               setMonthlyTrend(mockTrend);

               // Fetch department stats (mock data for now)
               const mockDeptStats: DepartmentStats[] = [
                    { department: 'Laboratory', present_percentage: 96.5, absent_percentage: 2.1, late_percentage: 1.4, total_employees: 25 },
                    { department: 'Imaging', present_percentage: 94.2, absent_percentage: 3.5, late_percentage: 2.3, total_employees: 15 },
                    { department: 'Administration', present_percentage: 97.8, absent_percentage: 1.2, late_percentage: 1.0, total_employees: 10 },
                    { department: 'Phlebotomy', present_percentage: 93.1, absent_percentage: 4.2, late_percentage: 2.7, total_employees: 12 }
               ];
               setDepartmentStats(mockDeptStats);

          } catch (err: any) {
               setError(err?.message || 'Error fetching attendance data');
          } finally {
               setLoading(false);
          }
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER, minWidth: '200px' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Month</span>
                              <span className="fw-bold d-block">{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color }}>
                                        {item.name === 'Average Attendance' ? `${item.value}%` : item.value}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     const renderChart = () => {
          const commonProps = {
               data: monthlyTrend,
               margin: { top: 5, right: 5, left: 20, bottom: 45 }
          };

          const xAxisProps = {
               dataKey: "month",
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER }
          };

          const yAxisProps = {
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false
          };

          const legendProps = {
               verticalAlign: "top",
               align: "right",
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (chartType === 'bar') {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="present" name="Present Days" fill={COLOR_SUCCESS} radius={[4, 4, 0, 0]} />
                         <Bar dataKey="absent" name="Absent Days" fill={COLOR_DANGER} radius={[4, 4, 0, 0]} />
                         <Bar dataKey="late" name="Late Days" fill={COLOR_WARNING} radius={[4, 4, 0, 0]} />
                    </BarChart>
               );
          }

          return (
               <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Line type="monotone" dataKey="average_attendance" name="Average Attendance" stroke={COLOR_ACCENT} strokeWidth={3}
                         dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }} />
               </LineChart>
          );
     };

     const pieData = summary ? [
          { name: 'Present', value: summary.present_days, color: COLOR_SUCCESS },
          { name: 'Absent', value: summary.absent_days, color: COLOR_DANGER },
          { name: 'Late', value: summary.late_days, color: COLOR_WARNING },
          { name: 'Half Day', value: summary.half_days, color: COLOR_INFO }
     ] : [];

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin me-3" style={{ color: COLOR_ACCENT }} />
                         <span>Loading attendance summary...</span>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                         <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Attendance Summary</h1>
                              <p className="text-muted mb-0 small">Monthly attendance analytics and trends</p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-secondary d-flex align-items-center">
                              <RiDownloadLine size={18} className="me-2" />
                              Export Report
                         </button>
                         <Link href="/human-resource/payroll/attendance" className="btn btn-primary">
                              View All Records
                         </Link>
                    </div>
               </div>

               {/* Filters */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="row g-3 align-items-end">
                         <div className="col-md-3">
                              <label className="form-label">Month</label>
                              <select
                                   className="form-select"
                                   value={selectedMonth}
                                   onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                              >
                                   {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                             {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                   ))}
                              </select>
                         </div>
                         <div className="col-md-3">
                              <label className="form-label">Year</label>
                              <select
                                   className="form-select"
                                   value={selectedYear}
                                   onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                              >
                                   {Array.from({ length: 5 }, (_, i) => (
                                        <option key={2024 - i} value={2024 - i}>{2024 - i}</option>
                                   ))}
                              </select>
                         </div>
                         <div className="col-md-6">
                              <div className="d-flex gap-2">
                                   {viewButtons.map(btn => (
                                        <button
                                             key={btn.type}
                                             type="button"
                                             className={`btn ${chartType === btn.type ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center`}
                                             onClick={() => setChartType(btn.type)}
                                             style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                        >
                                             <btn.icon size={16} className="me-2" /> {btn.label}
                                        </button>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Summary Cards */}
               {summary && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiUserLine size={24} style={{ color: COLOR_ACCENT }} className="me-3" />
                                        <div>
                                             <div className="fw-semibold fs-4">{summary.total_employees}</div>
                                             <div className="small text-muted">Total Employees</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiCheckCircleLine size={24} className="text-success me-3" />
                                        <div>
                                             <div className="fw-semibold fs-4">{summary.present_days}</div>
                                             <div className="small text-muted">Present Days</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiCloseCircleLine size={24} className="text-danger me-3" />
                                        <div>
                                             <div className="fw-semibold fs-4">{summary.absent_days}</div>
                                             <div className="small text-muted">Absent Days</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiTimeLine size={24} className="text-info me-3" />
                                        <div>
                                             <div className="fw-semibold fs-4">{summary.average_attendance.toFixed(1)}%</div>
                                             <div className="small text-muted">Avg Attendance</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Charts Row */}
               <div className="row g-4 mb-4">
                    {/* Monthly Trend Chart */}
                    <div className="col-lg-8">
                         <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                              <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Monthly Attendance Trend
                                   </h2>
                              </div>
                              <div className="card-body">
                                   <div style={{ width: "100%", height: 350 }}>
                                        <ResponsiveContainer>
                                             {renderChart()}
                                        </ResponsiveContainer>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Attendance Distribution Pie Chart */}
                    <div className="col-lg-4">
                         <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                              <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                   <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                        <RiPieChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                        Attendance Distribution
                                   </h2>
                              </div>
                              <div className="card-body">
                                   <div style={{ width: "100%", height: 350 }}>
                                        <ResponsiveContainer>
                                             <PieChart>
                                                  <Pie
                                                       data={pieData}
                                                       cx="50%"
                                                       cy="50%"
                                                       outerRadius={100}
                                                       dataKey="value"
                                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                  >
                                                       {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                       ))}
                                                  </Pie>
                                                  <Tooltip />
                                             </PieChart>
                                        </ResponsiveContainer>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Department Statistics Table */}
               <div className="border rounded" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="p-3 border-bottom">
                         <h5 className="mb-0 fw-semibold">Department-wise Attendance</h5>
                         <small className="text-muted">Attendance statistics by department</small>
                    </div>
                    <div className="table-responsive">
                         <table className="table table-hover table-striped mb-0">
                              <thead className="table-light">
                                   <tr>
                                        <th className="border-0">Department</th>
                                        <th className="border-0">Employees</th>
                                        <th className="border-0">Present %</th>
                                        <th className="border-0">Absent %</th>
                                        <th className="border-0">Late %</th>
                                        <th className="border-0">Status</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {departmentStats.map((dept, index) => (
                                        <tr key={index}>
                                             <td>
                                                  <div className="fw-semibold">{dept.department}</div>
                                             </td>
                                             <td>{dept.total_employees}</td>
                                             <td>
                                                  <span className="text-success fw-semibold">{dept.present_percentage.toFixed(1)}%</span>
                                             </td>
                                             <td>
                                                  <span className="text-danger fw-semibold">{dept.absent_percentage.toFixed(1)}%</span>
                                             </td>
                                             <td>
                                                  <span className="text-warning fw-semibold">{dept.late_percentage.toFixed(1)}%</span>
                                             </td>
                                             <td>
                                                  <span className={`badge ${dept.present_percentage >= 95 ? 'bg-success' : dept.present_percentage >= 90 ? 'bg-warning' : 'bg-danger'}`}>
                                                       {dept.present_percentage >= 95 ? 'Excellent' : dept.present_percentage >= 90 ? 'Good' : 'Needs Attention'}
                                                  </span>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}