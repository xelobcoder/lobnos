'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { currencyFormatter } from '../../../../../components/HR/Payroll/utils';
import Loader from '../../../../../components/isLoading';
import {
     RiUserLine,
     RiCalendarLine,
     RiDownloadLine,
     RiArrowLeftLine,
     RiLineChartLine
} from '@remixicon/react';

interface YTDReport {
     employee_id: number;
     year: number;
     total_gross_salary: number;
     total_tax: number;
     total_ssnit_employee: number;
     total_ssnit_employer: number;
     total_other_deductions: number;
     total_net_salary: number;
     number_of_periods: number;
     periods: Array<{
          period_name: string;
          gross_salary: number;
          tax_amount: number;
          ssnit_employee: number;
          net_salary: number;
     }>;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function EmployeeYTDPage() {
     const searchParams = useSearchParams();
     const router = useRouter();
     const employeeId = searchParams.get('employeeId');
     const yearParam = searchParams.get('year');

     const [ytdData, setYtdData] = useState<YTDReport | null>(null);
     const [loading, setLoading] = useState(true);
     const [selectedYear, setSelectedYear] = useState(yearParam || new Date().getFullYear().toString());

     useEffect(() => {
          if (employeeId) {
               fetchYTDReport();
          } else {
               setLoading(false);
          }
     }, [employeeId, selectedYear]);

     const fetchYTDReport = async () => {
          setLoading(true);
          try {
               const response = await customFetch(`payroll/employee/${employeeId}/ytd?year=${selectedYear}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setYtdData(response.result);
               }
          } finally {
               setLoading(false);
          }
     };

     const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const year = e.target.value;
          setSelectedYear(year);
          router.push(`/human-resource/payroll/employee/ytd?employeeId=${employeeId}&year=${year}`);
     };

     const currentYear = new Date().getFullYear();
     const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

     if (!employeeId) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <RiUserLine size={48} className="text-muted mb-3" />
                         <h5 className="fw-medium mb-2">No Employee Selected</h5>
                         <p className="text-muted">Please provide an employee ID to view YTD report</p>
                         <div className="mt-3">
                              <input
                                   type="number"
                                   className="form-control d-inline-block"
                                   placeholder="Enter Employee ID"
                                   style={{ width: '200px' }}
                                   onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                             const value = (e.target as HTMLInputElement).value;
                                             if (value) {
                                                  router.push(`/human-resource/payroll/employee/ytd?employeeId=${value}`);
                                             }
                                        }
                                   }}
                              />
                         </div>
                    </div>
               </div>
          );
     }

     if (loading) return <Loader />;

     if (!ytdData) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <RiLineChartLine size={48} className="text-muted mb-3" />
                         <h5 className="fw-medium mb-2">No YTD Data Available</h5>
                         <p className="text-muted">No payroll data found for this employee in {selectedYear}</p>
                         <Link href={`/human-resource/payroll/employee/history?employeeId=${employeeId}`} className="btn btn-primary mt-2">
                              View History
                         </Link>
                    </div>
               </div>
          );
     }

     const averageMonthly = ytdData.number_of_periods > 0 ? ytdData.total_net_salary / ytdData.number_of_periods : 0;

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center">
                         <Link href={`/human-resource/payroll/employee/history?employeeId=${employeeId}`} className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <div className="d-flex align-items-center mb-1">
                                   <RiLineChartLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   <h1 className="h4 mb-0 fw-bold">Year-to-Date Report</h1>
                              </div>
                              <p className="text-muted mb-0 small">
                                   Employee ID: {employeeId} | Year: {selectedYear}
                              </p>
                         </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                         <select
                              className="form-select form-select-sm"
                              value={selectedYear}
                              onChange={handleYearChange}
                              style={{ width: '120px' }}
                         >
                              {years.map(year => (
                                   <option key={year} value={year}>{year}</option>
                              ))}
                         </select>
                         <button className="btn btn-outline-primary btn-sm" onClick={() => window.print()}>
                              <RiDownloadLine size={18} className="me-1" />
                              Print Report
                         </button>
                    </div>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCalendarLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Pay Periods</span>
                              </div>
                              <div className="fs-3 fw-bold">{ytdData.number_of_periods}</div>
                              <div className="small text-muted mt-1">in {selectedYear}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiLineChartLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Total Gross</span>
                              </div>
                              <div className="fs-4 fw-bold text-success">{currencyFormatter.format(ytdData.total_gross_salary)}</div>
                              <div className="small text-muted mt-1">Before deductions</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiLineChartLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                   <span className="fw-medium text-muted small">Total Net</span>
                              </div>
                              <div className="fs-4 fw-bold" style={{ color: COLOR_ACCENT }}>
                                   {currencyFormatter.format(ytdData.total_net_salary)}
                              </div>
                              <div className="small text-muted mt-1">After deductions</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiLineChartLine size={20} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">Avg Monthly Net</span>
                              </div>
                              <div className="fs-4 fw-bold text-warning">{currencyFormatter.format(averageMonthly)}</div>
                              <div className="small text-muted mt-1">Average per period</div>
                         </div>
                    </div>
               </div>

               <div className="row">
                    {/* Deductions Breakdown */}
                    <div className="col-lg-6 mb-4">
                         <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-4">Total Deductions Breakdown</h5>
                              <div className="mb-4">
                                   <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tax (Income Tax)</span>
                                        <span className="fw-bold">{currencyFormatter.format(ytdData.total_tax)}</span>
                                   </div>
                                   <div className="progress" style={{ height: '8px' }}>
                                        <div
                                             className="progress-bar bg-danger"
                                             style={{ width: `${(ytdData.total_tax / ytdData.total_gross_salary * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_tax / ytdData.total_gross_salary) * 100).toFixed(1)}% of gross
                                   </div>
                              </div>

                              <div className="mb-4">
                                   <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">SSNIT (Employee Contribution)</span>
                                        <span className="fw-bold">{currencyFormatter.format(ytdData.total_ssnit_employee)}</span>
                                   </div>
                                   <div className="progress" style={{ height: '8px' }}>
                                        <div
                                             className="progress-bar bg-warning"
                                             style={{ width: `${(ytdData.total_ssnit_employee / ytdData.total_gross_salary * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_ssnit_employee / ytdData.total_gross_salary) * 100).toFixed(1)}% of gross
                                   </div>
                              </div>

                              <div className="mb-4">
                                   <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">SSNIT (Employer Contribution)</span>
                                        <span className="fw-bold">{currencyFormatter.format(ytdData.total_ssnit_employer)}</span>
                                   </div>
                                   <div className="progress" style={{ height: '8px' }}>
                                        <div
                                             className="progress-bar bg-info"
                                             style={{ width: `${(ytdData.total_ssnit_employer / ytdData.total_gross_salary * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_ssnit_employer / ytdData.total_gross_salary) * 100).toFixed(1)}% of gross
                                   </div>
                              </div>

                              <div className="mb-0">
                                   <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Other Deductions</span>
                                        <span className="fw-bold">{currencyFormatter.format(ytdData.total_other_deductions)}</span>
                                   </div>
                                   <div className="progress" style={{ height: '8px' }}>
                                        <div
                                             className="progress-bar bg-secondary"
                                             style={{ width: `${(ytdData.total_other_deductions / ytdData.total_gross_salary * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_other_deductions / ytdData.total_gross_salary) * 100).toFixed(1)}% of gross
                                   </div>
                              </div>

                              <hr className="my-4" />

                              <div className="d-flex justify-content-between align-items-center">
                                   <span className="fw-bold fs-5">Total Deductions</span>
                                   <span className="fw-bold fs-5 text-danger">
                                        {currencyFormatter.format(
                                             ytdData.total_tax +
                                             ytdData.total_ssnit_employee +
                                             ytdData.total_ssnit_employer +
                                             ytdData.total_other_deductions
                                        )}
                                   </span>
                              </div>
                         </div>
                    </div>

                    {/* Period-by-Period Breakdown */}
                    <div className="col-lg-6 mb-4">
                         <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">Period-by-Period Breakdown</h5>
                              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                   <table className="table table-sm table-hover">
                                        <thead className="sticky-top bg-light">
                                             <tr>
                                                  <th>Period</th>
                                                  <th className="text-end">Gross</th>
                                                  <th className="text-end">Tax</th>
                                                  <th className="text-end">SSNIT</th>
                                                  <th className="text-end">Net</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {ytdData.periods && ytdData.periods.length > 0 ? (
                                                  ytdData.periods.map((period, index) => (
                                                       <tr key={index}>
                                                            <td className="fw-medium small">{period.period_name}</td>
                                                            <td className="text-end small text-success">
                                                                 {currencyFormatter.format(period.gross_salary)}
                                                            </td>
                                                            <td className="text-end small">
                                                                 {currencyFormatter.format(period.tax_amount)}
                                                            </td>
                                                            <td className="text-end small">
                                                                 {currencyFormatter.format(period.ssnit_employee)}
                                                            </td>
                                                            <td className="text-end small fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                 {currencyFormatter.format(period.net_salary)}
                                                            </td>
                                                       </tr>
                                                  ))
                                             ) : (
                                                  <tr>
                                                       <td colSpan={5} className="text-center text-muted py-3">
                                                            No period details available
                                                       </td>
                                                  </tr>
                                             )}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Summary Stats */}
               <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                    <h5 className="fw-semibold mb-3">Summary</h5>
                    <div className="row g-3">
                         <div className="col-md-6">
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Total Gross Salary</span>
                                   <span className="fw-bold">{currencyFormatter.format(ytdData.total_gross_salary)}</span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Less: Total Tax</span>
                                   <span className="fw-bold text-danger">-{currencyFormatter.format(ytdData.total_tax)}</span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Less: Total SSNIT (Employee)</span>
                                   <span className="fw-bold text-danger">-{currencyFormatter.format(ytdData.total_ssnit_employee)}</span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Less: Other Deductions</span>
                                   <span className="fw-bold text-danger">-{currencyFormatter.format(ytdData.total_other_deductions)}</span>
                              </div>
                              <div className="d-flex justify-content-between py-3 mt-2">
                                   <span className="fw-bold fs-5">Total Net Salary</span>
                                   <span className="fw-bold fs-5" style={{ color: COLOR_ACCENT }}>
                                        {currencyFormatter.format(ytdData.total_net_salary)}
                                   </span>
                              </div>
                         </div>
                         <div className="col-md-6">
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Employer SSNIT Contribution</span>
                                   <span className="fw-bold">{currencyFormatter.format(ytdData.total_ssnit_employer)}</span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Total Company Cost</span>
                                   <span className="fw-bold">
                                        {currencyFormatter.format(ytdData.total_gross_salary + ytdData.total_ssnit_employer)}
                                   </span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Average Monthly Net</span>
                                   <span className="fw-bold">{currencyFormatter.format(averageMonthly)}</span>
                              </div>
                              <div className="d-flex justify-content-between py-2 border-bottom">
                                   <span className="text-muted">Periods Processed</span>
                                   <span className="fw-bold">{ytdData.number_of_periods}</span>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
