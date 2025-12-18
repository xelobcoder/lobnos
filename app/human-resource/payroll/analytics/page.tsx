'use client';

import { useState, useEffect } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import Loader from '../../../../components/isLoading';
import {
     RiMoneyDollarCircleLine,
     RiTeamLine,
     RiCalendarEventLine,
     RiRefreshLine,
     RiBarChartBoxLine,
     RiLineChartLine
} from '@remixicon/react';
import dayjs from 'dayjs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb';
const COLOR_TERTIARY = '#ea580c';

const currencyFormatter = new Intl.NumberFormat('en-GH', {
     style: 'currency',
     currency: 'GHS',
     minimumFractionDigits: 2,
});

export default function PayrollAnalyticsPage() {
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [analyticsData, setAnalyticsData] = useState<any>(null);
     const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

     const [compensationLoading, setCompensationLoading] = useState(false);
     const [compensationData, setCompensationData] = useState<any[]>([]);

     const [startDate, setStartDate] = useState(dayjs().subtract(3, 'month').format('YYYY-MM-DD'));
     const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

     useEffect(() => {
          fetchAnalytics();
     }, []);

     const fetchAnalytics = async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch(
                    `payroll/analytics?startDate=${startDate}&endDate=${endDate}&topEarnersLimit=10`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAnalyticsData(response.result);
               } else {
                    setError('Failed to load analytics data');
               }
          } catch (err) {
               setError('Error fetching analytics data');
               console.error(err);
          } finally {
               setLoading(false);
          }
     };

     const handleResetFilters = () => {
          setStartDate(dayjs().subtract(3, 'month').format('YYYY-MM-DD'));
          setEndDate(dayjs().format('YYYY-MM-DD'));
     };

     const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setStartDate(e.target.value);
     };

     const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setEndDate(e.target.value);
     };

     const fetchCompensationAnalytics = async () => {
          setCompensationLoading(true);
          try {
               const response = await customFetch(
                    `payroll/analytics/compensation?startDate=${startDate}&endDate=${endDate}`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setCompensationData(response.result);
               }
          } catch (err) {
               console.error('Error fetching compensation analytics:', err);
               setCompensationData([]);
          } finally {
               setCompensationLoading(false);
          }
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Period</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color }}>
                                        {currencyFormatter.format(item.value)}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     if (loading) return <Loader />;

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="alert alert-danger">{error}</div>
               </div>
          );
     }

     if (!analyticsData) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="alert alert-info">No analytics data available</div>
               </div>
          );
     }

     const {
          payroll_period_metrics: payrollPeriods,
          compensation_distribution: compensation,
          attendance_summary: attendance,
          leave_statistics: leave,
          allowance_breakdown: allowanceBonus,
          bonus_statistics: bonuses,
          statutory_deductions: statutoryDeductions,
          other_deductions: otherDeductions,
          payment_methods: paymentMethods,
          overtime_metrics: overtimeMetrics,
          payroll_trend: payrollTrend,
          top_earners: topEarners,
          cost_centers: costCenters,
          compliance,
          earnings_distribution: earningsDistribution
     } = analyticsData;

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="row mb-4">
                    <div className="col-12">
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <div>
                                   <h1 className="h4 fw-bold mb-2">Payroll Analytics</h1>
                                   <p className="text-muted mb-3 mb-lg-0">
                                        Comprehensive insights into payroll periods, compensation, attendance, and more
                                   </p>
                              </div>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                             <RiCalendarEventLine size={16} className="text-muted" />
                                        </span>
                                        <input
                                             type="date"
                                             className="form-control shadow-none border-start-0"
                                             value={startDate}
                                             onChange={handleStartDateChange}
                                        />
                                   </div>
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                             <RiCalendarEventLine size={16} className="text-muted" />
                                        </span>
                                        <input
                                             type="date"
                                             className="form-control shadow-none border-start-0"
                                             value={endDate}
                                             onChange={handleEndDateChange}
                                             min={startDate}
                                        />
                                   </div>
                                   <button
                                        onClick={fetchAnalytics}
                                        className="btn btn-sm btn-primary d-flex align-items-center"
                                        disabled={loading}
                                   >
                                        <RiRefreshLine size={16} className="me-1" /> Load Data
                                   </button>
                                   <button
                                        onClick={handleResetFilters}
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                   >
                                        <RiRefreshLine size={16} className="me-1" /> Reset
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3">
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   <span className="text-muted small">Total Basic Salary</span>
                              </div>
                              <h4 className="h5 fw-bold mb-0">
                                   {currencyFormatter.format(
                                        compensation?.reduce((sum: number, c: any) => sum + parseFloat(c.total_basic_salary || 0), 0) || 0
                                   )}
                              </h4>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3">
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} style={{ color: COLOR_SECONDARY }} className="me-2" />
                                   <span className="text-muted small">Total Overtime Hours</span>
                              </div>
                              <h4 className="h5 fw-bold mb-0">
                                   {overtimeMetrics?.reduce((sum: number, o: any) => sum + parseFloat(o.total_overtime_hours || 0), 0) || 0}
                              </h4>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3">
                              <div className="d-flex align-items-center mb-2">
                                   <RiTeamLine size={20} style={{ color: COLOR_TERTIARY }} className="me-2" />
                                   <span className="text-muted small">Total Employees</span>
                              </div>
                              <h4 className="h5 fw-bold mb-0">
                                   {compensation?.reduce((sum: number, c: any) => sum + parseInt(c.employee_count || 0), 0) || 0}
                              </h4>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3">
                              <div className="d-flex align-items-center mb-2">
                                   {/* <RiTrendingUpLine size={20} style={{ color: 'var(--bs-success)' }} className="me-2" /> */}
                                   <span className="text-muted small">Attendance Records</span>
                              </div>
                              <h4 className="h5 fw-bold mb-0">{attendance?.reduce((sum: number, a: any) => sum + parseInt(a.record_count || 0), 0) || 0}</h4>
                         </div>
                    </div>
               </div>

               {/* Compensation Distribution Chart */}
               {compensation && compensation.length > 0 && (
                    <div className="row mb-4">
                         <div className="col-12">
                              <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                                   <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                             <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                                  {/* <RiTrendingUpLine size={22} style={{ color: COLOR_ACCENT }} className="me-2" /> */}
                                                  Compensation Distribution by Type
                                             </h2>
                                             <div className="btn-group btn-group-sm" role="group">
                                                  <button
                                                       type="button"
                                                       className={`btn ${chartType === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                       onClick={() => setChartType('bar')}
                                                       style={chartType === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                  >
                                                       <RiBarChartBoxLine size={16} className="me-1 align-text-bottom" /> Bar
                                                  </button>
                                                  <button
                                                       type="button"
                                                       className={`btn ${chartType === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                       onClick={() => setChartType('line')}
                                                       style={chartType === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                  >
                                                       <RiLineChartLine size={16} className="me-1 align-text-bottom" /> Line
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="card-body">
                                        <div style={{ width: '100%', height: 350 }}>
                                             <ResponsiveContainer>
                                                  {chartType === 'bar' ? (
                                                       <BarChart
                                                            data={compensation}
                                                            margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                                       >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                            <XAxis
                                                                 dataKey="compensation_type"
                                                                 angle={-45}
                                                                 textAnchor="end"
                                                                 height={60}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={{ stroke: COLOR_BORDER }}
                                                                 tickLine={{ stroke: COLOR_BORDER }}
                                                            />
                                                            <YAxis
                                                                 tickFormatter={(value) => currencyFormatter.format(value)}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={false}
                                                                 tickLine={false}
                                                                 width={95}
                                                            />
                                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                            <Legend
                                                                 verticalAlign="top"
                                                                 align="right"
                                                                 iconType="circle"
                                                                 iconSize={8}
                                                                 wrapperStyle={{ fontSize: '13px', paddingBottom: '15px' }}
                                                            />
                                                            <Bar dataKey="total_basic_salary" name="Total Basic Salary" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                                            <Bar dataKey="avg_basic_salary" name="Avg Basic Salary" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                                            <Bar dataKey="employee_count" name="Employee Count" fill={COLOR_TERTIARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                                       </BarChart>
                                                  ) : (
                                                       <LineChart
                                                            data={compensation}
                                                            margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                                       >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                            <XAxis
                                                                 dataKey="compensation_type"
                                                                 angle={-45}
                                                                 textAnchor="end"
                                                                 height={60}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={{ stroke: COLOR_BORDER }}
                                                                 tickLine={{ stroke: COLOR_BORDER }}
                                                            />
                                                            <YAxis
                                                                 tickFormatter={(value) => currencyFormatter.format(value)}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={false}
                                                                 tickLine={false}
                                                                 width={95}
                                                            />
                                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                            <Legend
                                                                 verticalAlign="top"
                                                                 align="right"
                                                                 iconType="circle"
                                                                 iconSize={8}
                                                                 wrapperStyle={{ fontSize: '13px', paddingBottom: '15px' }}
                                                            />
                                                            <Line
                                                                 type="monotone"
                                                                 dataKey="total_basic_salary"
                                                                 name="Total Basic Salary"
                                                                 stroke={COLOR_ACCENT}
                                                                 strokeWidth={2}
                                                                 dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                                                                 activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
                                                            />
                                                            <Line
                                                                 type="monotone"
                                                                 dataKey="avg_basic_salary"
                                                                 name="Avg Basic Salary"
                                                                 stroke={COLOR_SECONDARY}
                                                                 strokeWidth={2}
                                                                 dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                                                                 activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }}
                                                            />
                                                            <Line
                                                                 type="monotone"
                                                                 dataKey="employee_count"
                                                                 name="Employee Count"
                                                                 stroke={COLOR_TERTIARY}
                                                                 strokeWidth={2}
                                                                 dot={{ r: 3, strokeWidth: 1, fill: COLOR_TERTIARY }}
                                                                 activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }}
                                                            />
                                                       </LineChart>
                                                  )}
                                             </ResponsiveContainer>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Additional sections: Payment Methods, Compliance */}
               <div className="row g-3 mb-4">
                    {/* Payment Methods */}
                    {paymentMethods && paymentMethods.length > 0 && (
                         <div className="col-md-6">
                              <div className="border rounded p-3 h-100">
                                   <h6 className="fw-bold mb-3">Payment Methods</h6>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Method</th>
                                                       <th className="text-end">Employees</th>
                                                       <th className="text-end">Percentage</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {paymentMethods.map((method: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start text-capitalize">{method.payment_method.replace('_', ' ')}</td>
                                                            <td className="text-end">{method.employee_count}</td>
                                                            <td className="text-end">{method.percentage}%</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Statutory Deductions */}
                    {statutoryDeductions && (
                         <div className="col-md-6">
                              <div className="border rounded p-3 h-100">
                                   <h6 className="fw-bold mb-3">Statutory Deductions</h6>
                                   <div className="row g-3">
                                        <div className="col-6">
                                             <div className="small text-muted">SSNIT Enrolled</div>
                                             <div className="fw-semibold">{statutoryDeductions.ssnit_enrolled || 0}</div>
                                        </div>
                                        <div className="col-6">
                                             <div className="small text-muted">Tier 3 Enrolled</div>
                                             <div className="fw-semibold">{statutoryDeductions.tier3_enrolled || 0}</div>
                                        </div>
                                        <div className="col-6">
                                             <div className="small text-muted">NHIS Active</div>
                                             <div className="fw-semibold">{statutoryDeductions.nhis_active_count || 0}</div>
                                        </div>
                                        <div className="col-6">
                                             <div className="small text-muted">Tax Exempt</div>
                                             <div className="fw-semibold">{statutoryDeductions.tax_exempt_count || 0}</div>
                                        </div>
                                        <div className="col-12 mt-3">
                                             <div className="small text-muted">Avg SSNIT Rate</div>
                                             <div className="fw-semibold text-success">{parseFloat(statutoryDeductions.avg_ssnit_rate || 0).toFixed(2)}%</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>

               {/* Detailed Compensation Analytics */}
               <div className="row mb-4">
                    <div className="col-12">
                         <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                              <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                   <div className="d-flex justify-content-between align-items-center">
                                        <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                             <RiMoneyDollarCircleLine size={22} style={{ color: COLOR_ACCENT }} className="me-2" />
                                             Detailed Compensation Breakdown
                                        </h2>
                                        <button
                                             onClick={fetchCompensationAnalytics}
                                             className="btn btn-sm btn-primary d-flex align-items-center"
                                             disabled={compensationLoading}
                                        >
                                             <RiRefreshLine size={16} className="me-1" />
                                             {compensationLoading ? 'Loading...' : 'Load Compensation Data'}
                                        </button>
                                   </div>
                              </div>
                              <div className="card-body">
                                   {compensationLoading ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                                             <div className="spinner-border text-primary" role="status">
                                                  <span className="visually-hidden">Loading...</span>
                                             </div>
                                        </div>
                                   ) : compensationData.length === 0 ? (
                                        <div className="text-center text-muted py-5">
                                             <RiMoneyDollarCircleLine size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                             <p>Click &ldquo;Load Compensation Data&rdquo; to view detailed breakdown</p>
                                        </div>
                                   ) : (
                                        <div className="table-responsive">
                                             <table className="table table-hover text-start">
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th className="text-start">Compensation Type</th>
                                                            <th className="text-start">Payment Frequency</th>
                                                            <th className="text-end">Employee Count</th>
                                                            <th className="text-end">Avg Basic Salary</th>
                                                            <th className="text-end">Total Basic Salary</th>
                                                            <th className="text-end">Avg Hourly Rate</th>
                                                            <th className="text-end">Avg Commission %</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {compensationData.map((comp: any, idx: number) => (
                                                            <tr key={idx}>
                                                                 <td className="text-start text-capitalize fw-medium">{comp.compensation_type}</td>
                                                                 <td className="text-start text-capitalize">{comp.payment_frequency}</td>
                                                                 <td className="text-end">{comp.employee_count}</td>
                                                                 <td className="text-end">{currencyFormatter.format(comp.avg_basic_salary)}</td>
                                                                 <td className="text-end fw-semibold">{currencyFormatter.format(comp.total_basic_salary)}</td>
                                                                 <td className="text-end">{currencyFormatter.format(comp.avg_hourly_rate)}</td>
                                                                 <td className="text-end">{comp.avg_commission_pct}%</td>
                                                            </tr>
                                                       ))}
                                                       <tr className="fw-bold border-top">
                                                            <td colSpan={2} className="text-start">Total</td>
                                                            <td className="text-end">
                                                                 {compensationData.reduce((sum: number, c: any) => sum + parseInt(c.employee_count || 0), 0)}
                                                            </td>
                                                            <td className="text-end">-</td>
                                                            <td className="text-end">
                                                                 {currencyFormatter.format(
                                                                      compensationData.reduce((sum: number, c: any) => sum + parseFloat(c.total_basic_salary || 0), 0)
                                                                 )}
                                                            </td>
                                                            <td className="text-end">-</td>
                                                            <td className="text-end">-</td>
                                                       </tr>
                                                  </tbody>
                                             </table>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Attendance & Leave Summary */}
               <div className="row g-3">
                    {attendance && attendance.length > 0 && (
                         <div className="col-md-6">
                              <div className="border rounded p-3">
                                   <h6 className="fw-bold mb-3">Attendance Summary</h6>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Status</th>
                                                       <th className="text-end">Records</th>
                                                       <th className="text-end">Hours Worked</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {attendance.map((att: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start text-capitalize">{att.status || 'N/A'}</td>
                                                            <td className="text-end">{att.record_count}</td>
                                                            <td className="text-end">{parseFloat(att.total_overtime || 0).toFixed(1)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    )}

                    {leave && leave.length > 0 && (
                         <div className="col-md-6">
                              <div className="border rounded p-3">
                                   <h6 className="fw-bold mb-3">Leave Statistics</h6>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Type</th>
                                                       <th className="text-end">Count</th>
                                                       <th className="text-end">Total Days</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {leave.map((lv: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start text-capitalize">{lv.leave_type}</td>
                                                            <td className="text-end">{lv.leave_count}</td>
                                                            <td className="text-end">{lv.total_days_taken}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
}
