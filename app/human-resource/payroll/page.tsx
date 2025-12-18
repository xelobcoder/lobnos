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
          compensation_distribution: compensation,
          attendance_summary: attendance,
          payment_methods: paymentMethods,
          overtime_metrics: overtimeMetrics,
     } = analyticsData || {};

     const totalBasicSalary = compensation?.reduce((sum: number, c: any) => sum + parseFloat(c.total_basic_salary || 0), 0) || 0;
     const totalEmployees = compensation?.reduce((sum: number, c: any) => sum + parseInt(c.employee_count || 0), 0) || 0;
     const totalOvertimeHours = overtimeMetrics?.reduce((sum: number, o: any) => sum + parseFloat(o.total_overtime_hours || 0), 0) || 0;
     const totalAttendanceRecords = attendance?.reduce((sum: number, a: any) => sum + parseInt(a.record_count || 0), 0) || 0;

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
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">Total Basic Salary</span>
                              </div>
                              <div className="fs-5 fw-bold">
                                   {loading ? '...' : currencyFormatter.format(totalBasicSalary)}
                              </div>
                              <div className="small text-muted">Last 3 months</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiUserLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Total Employees</span>
                              </div>
                              <div className="fs-5 fw-bold">{loading ? '...' : totalEmployees}</div>
                              <div className="small text-muted">With compensation</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiTimeLine size={20} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">Total Overtime Hours</span>
                              </div>
                              <div className="fs-5 fw-bold">{loading ? '...' : totalOvertimeHours.toFixed(1)}</div>
                              <div className="small text-muted">Last 3 months</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Attendance Records</span>
                              </div>
                              <div className="fs-5 fw-bold">{loading ? '...' : totalAttendanceRecords}</div>
                              <div className="small text-muted">Last 3 months</div>
                         </div>
                    </div>
               </div>

               {/* Analytics Summary */}
               {!loading && analyticsData && (
                    <div className="row g-3 mb-4">
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
