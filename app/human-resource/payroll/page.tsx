'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
     RiMoneyDollarCircleLine,
     RiCalendarLine,
     RiUserLine,
     RiBankCardLine,
     RiArrowRightLine,
     RiFileListLine,
     RiCheckboxCircleLine,
     RiHistoryLine,
     RiTimeLine
} from '@remixicon/react';
import { customFetch } from '../../../components/Auth/customFetch';
import dayjs from 'dayjs';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

const currencyFormatter = new Intl.NumberFormat('en-GH', {
     style: 'currency',
     currency: 'GHS',
     minimumFractionDigits: 2,
});

interface QuickAccessCard {
     title: string;
     description: string;
     link: string;
     icon: React.ReactNode;
     color: string;
}

const PayrollSummaryCard = ({
     title,
     value,
     detail,
     Icon,
     variant,
}: {
     title: string;
     value: string | number;
     detail: string;
     Icon: React.ElementType;
     variant: string;
}) => (
     <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
          <div className="card-body p-3">
               <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                    <Icon size={22} className="opacity-75" />
               </div>
               <h3 className="fw-bold mb-0">{value}</h3>
               <span className="text-xs opacity-75">{detail}</span>
          </div>
     </div>
);

const quickAccessCards: QuickAccessCard[] = [
     {
          title: "Payroll Periods",
          description: "Manage monthly payroll cycles",
          link: "/human-resource/payroll/periods",
          icon: <RiCalendarLine size={32} />,
          color: "#2563eb"
     },
     {
          title: "Process Payroll",
          description: "Calculate and approve payroll",
          link: "/human-resource/payroll/periods/process",
          icon: <RiCheckboxCircleLine size={32} />,
          color: "#16a34a"
     },
     {
          title: "Compensation",
          description: "Employee salary & benefits",
          link: "/human-resource/payroll/compensation",
          icon: <RiBankCardLine size={32} />,
          color: "#ea580c"
     },
     {
          title: "Payroll History",
          description: "View employee payment records",
          link: "/human-resource/payroll/employee/history",
          icon: <RiHistoryLine size={32} />,
          color: "#8b5cf6"
     },
     {
          title: "Leave Management",
          description: "Submit and review leave requests",
          link: "/human-resource/payroll/leave",
          icon: <RiCalendarLine size={32} />,
          color: "#0f766e"
     },
     {
          title: "Other Deductions",
          description: "Track employee loan and extra deductions",
          link: "/human-resource/payroll/deductions/other",
          icon: <RiFileListLine size={32} />,
          color: "#b45309"
     },
     {
          title: "Allowances",
          description: "Manage recurring and one-time allowances",
          link: "/human-resource/payroll/allowance",
          icon: <RiBankCardLine size={32} />,
          color: "#0d9488"
     }
];

export default function PayrollOverviewPage() {
     const [analyticsData, setAnalyticsData] = useState<any>(null);
     const [loading, setLoading] = useState(true);

     const startDate = dayjs().subtract(3, 'month').format('YYYY-MM-DD');
     const endDate = dayjs().format('YYYY-MM-DD');

     useEffect(() => {
          fetchAnalytics();
     }, []);

     const fetchAnalytics = async () => {
          setLoading(true);
          try {
               const response = await customFetch(
                    `payroll/analytics?startDate=${startDate}&endDate=${endDate}&topEarnersLimit=5`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAnalyticsData(response.result);
               }
          } catch (err) {
               console.error(err);
          } finally {
               setLoading(false);
          }
     };

     const {
          financial_kpis,
          compensation_distribution: compensation,
          attendance_summary: attendance,
          payment_methods: paymentMethods,
          overtime_metrics: overtimeMetrics,
          payroll_trend: trend,
          top_earners: topEarners,
          attendance_compliance: attendanceCompliance,
     } = analyticsData || {};

     const totalBasicSalary = financial_kpis?.total_gross_payroll || 0;
     const totalNetPayroll = financial_kpis?.total_net_payroll || 0;
     const totalEmployees = financial_kpis?.total_employees || 0;
     const totalOvertimeHours = overtimeMetrics?.reduce((sum: number, o: any) => sum + parseFloat(o.total_overtime_hours || 0), 0) || 0;
     const totalAttendanceRecords = attendance?.reduce((sum: number, a: any) => sum + parseInt(a.record_count || 0), 0) || 0;
     const summaryMetrics = [
          { title: 'Gross Payroll', value: loading ? '...' : currencyFormatter.format(totalBasicSalary), detail: 'Last 3 months', Icon: RiMoneyDollarCircleLine, variant: 'primary' },
          { title: 'Net Payroll', value: loading ? '...' : currencyFormatter.format(totalNetPayroll), detail: 'After deductions', Icon: RiCheckboxCircleLine, variant: 'success' },
          { title: 'Total Employees', value: loading ? '...' : totalEmployees.toLocaleString(), detail: 'Active in period', Icon: RiUserLine, variant: 'info' },
          { title: 'Overtime Hours', value: loading ? '...' : totalOvertimeHours.toFixed(1), detail: 'Last 3 months', Icon: RiTimeLine, variant: 'warning' },
     ];

     return (
          <div className="container-fluid px-4 py-3">
               {/* Page Header */}
               <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                         <RiMoneyDollarCircleLine size={32} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h3 mb-0 fw-bold">Payroll Management</h1>
                              <p className="text-muted mb-0">Manage employee compensation and payroll processing</p>
                         </div>
                    </div>
               </div>

               {/* Quick Stats */}
               <div className="row g-3 mb-4">
                    {summaryMetrics.map((metric) => (
                         <div className="col-12 col-sm-6 col-xl-3" key={metric.title}>
                              <PayrollSummaryCard {...metric} />
                         </div>
                    ))}
               </div>

               {/* Analytics Summary */}
               {!loading && analyticsData && (
                    <div className="row g-3 mb-4">
                         {/* Attendance Summary */}
                         {attendance && attendance.length > 0 && (
                              <div className="col-md-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h6 className="fw-bold mb-3">Attendance Summary</h6>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Status</th>
                                                            <th className="text-end">Records</th>
                                                            <th className="text-end">Employees</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {attendance.map((att: any, idx: number) => (
                                                            <tr key={idx}>
                                                                 <td className="text-start text-capitalize">{att.status}</td>
                                                                 <td className="text-end">{att.record_count}</td>
                                                                 <td className="text-end">{att.unique_employees}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                        {attendanceCompliance && (
                                             <div className="mt-3 pt-3 border-top small">
                                                  <div className="d-flex justify-content-between mb-2">
                                                       <span className="text-muted">Attendance Rate:</span>
                                                       <span className="fw-bold text-success">{attendanceCompliance.attendance_rate?.toFixed(1)}%</span>
                                                  </div>
                                                  <div className="d-flex justify-content-between">
                                                       <span className="text-muted">Lateness Rate:</span>
                                                       <span className="fw-bold text-warning">{attendanceCompliance.lateness_rate?.toFixed(1)}%</span>
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}

                         {/* Payroll Trend */}
                         {trend && trend.length > 0 && (
                              <div className="col-md-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h6 className="fw-bold mb-3">Payroll Trend</h6>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Period</th>
                                                            <th className="text-end">Gross</th>
                                                            <th className="text-end">Net</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {trend.map((t: any, idx: number) => (
                                                            <tr key={idx}>
                                                                 <td className="text-start small">{t.period_name}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(t.gross_salary)}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(t.net_salary)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* Payment Methods */}
                         {paymentMethods && paymentMethods.length > 0 && (
                              <div className="col-md-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h6 className="fw-bold mb-3">Payment Methods Distribution</h6>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
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

                         {/* Compensation Types */}
                         {compensation && compensation.length > 0 && (
                              <div className="col-md-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h6 className="fw-bold mb-3">Compensation Types</h6>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Type</th>
                                                            <th className="text-end">Employees</th>
                                                            <th className="text-end">Total</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {compensation.map((comp: any, idx: number) => (
                                                            <tr key={idx}>
                                                                 <td className="text-start text-capitalize">{comp.compensation_type}</td>
                                                                 <td className="text-end">{comp.employee_count}</td>
                                                                 <td className="text-end">{currencyFormatter.format(comp.total_basic_salary)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* Top Earners */}
                         {topEarners && topEarners.length > 0 && (
                              <div className="col-md-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h6 className="fw-bold mb-3">Top Earners</h6>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Employee</th>
                                                            <th className="text-end">Gross Salary</th>
                                                            <th className="text-end">Net Salary</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {topEarners.map((earner: any, idx: number) => (
                                                            <tr key={idx}>
                                                                 <td className="text-start small">{earner.username}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(earner.total_gross_salary)}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(earner.total_net_salary)}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         )}
                    </div>
               )}

               {/* View Full Analytics Link */}
               <div className="mb-4">
                    <Link href="/human-resource/payroll/analytics" className="btn btn-outline-primary btn-sm">
                         View Full Analytics →
                    </Link>
               </div>

               {/* Quick Access Cards */}
               <div className="mb-4">
                    <h5 className="mb-3 fw-semibold">Quick Access</h5>
                    <div className="row g-3">
                         {quickAccessCards.map((card, index) => (
                              <div key={index} className="col-md-6 col-lg-3">
                                   <Link href={card.link} className="text-decoration-none">
                                        <div
                                             className="border rounded p-4 h-100 position-relative overflow-hidden"
                                             style={{
                                                  backgroundColor: 'var(--bs-body-bg)',
                                                  transition: 'all 0.2s',
                                                  cursor: 'pointer'
                                             }}
                                             onMouseEnter={(e) => {
                                                  e.currentTarget.style.borderColor = card.color;
                                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                             }}
                                             onMouseLeave={(e) => {
                                                  e.currentTarget.style.borderColor = COLOR_BORDER;
                                                  e.currentTarget.style.transform = 'translateY(0)';
                                                  e.currentTarget.style.boxShadow = 'none';
                                             }}
                                        >
                                             <div className="mb-3" style={{ color: card.color }}>
                                                  {card.icon}
                                             </div>
                                             <h6 className="fw-bold mb-2 text-body-emphasis">{card.title}</h6>
                                             <p className="small text-muted mb-3">{card.description}</p>
                                             <div className="d-flex align-items-center small" style={{ color: card.color }}>
                                                  <span className="me-1">Access</span>
                                                  <RiArrowRightLine size={16} />
                                             </div>
                                        </div>
                                   </Link>
                              </div>
                         ))}
                    </div>
               </div>

               {/* Recent Activity */}
               <div className="row g-4">
                    <div className="col-12">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">Getting Started</h5>
                              <div className="row g-3">
                                   <div className="col-md-4">
                                        <div className="d-flex align-items-start">
                                             <div className="me-3 mt-1">
                                                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                       1
                                                  </div>
                                             </div>
                                             <div>
                                                  <h6 className="mb-1">Set Up Compensation</h6>
                                                  <p className="small text-muted mb-2">Add employee salary and payment details</p>
                                                  <Link href="/human-resource/payroll/compensation/create" className="small">
                                                       Add Compensation →
                                                  </Link>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-md-4">
                                        <div className="d-flex align-items-start">
                                             <div className="me-3 mt-1">
                                                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                       2
                                                  </div>
                                             </div>
                                             <div>
                                                  <h6 className="mb-1">Create Payroll Period</h6>
                                                  <p className="small text-muted mb-2">Define monthly payroll cycle</p>
                                                  <Link href="/human-resource/payroll/periods/create" className="small">
                                                       Create Period →
                                                  </Link>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-md-4">
                                        <div className="d-flex align-items-start">
                                             <div className="me-3 mt-1">
                                                  <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                       3
                                                  </div>
                                             </div>
                                             <div>
                                                  <h6 className="mb-1">Process Payroll</h6>
                                                  <p className="small text-muted mb-2">Calculate and approve payments</p>
                                                  <Link href="/human-resource/payroll/periods/process" className="small">
                                                       Process Now →
                                                  </Link>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
