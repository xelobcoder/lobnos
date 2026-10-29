'use client';
import PayrollSummaryStrip from '../../PayrollSummaryStrip';
import screens from '../../PayrollScreens.module.css';
import PayrollEmployeeFinder from '../../../../../components/HR/Payroll/PayrollEmployeeFinder';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../../../components/Auth/roles';

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

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function EmployeeYTDPage() {
     const searchParams = useSearchParams();
     const router = useRouter();
     const user = useApplication()?.user;
     const employeeId = searchParams?.get('employeeId') || (user?.employeeid && !roleAllowed(user.role, ['admin', 'accountant']) ? String(user.employeeid) : null);
     const yearParam = searchParams?.get('year');

     const [ytdData, setYtdData] = useState<YTDReport | null>(null);
     const [loading, setLoading] = useState(true);
     const [loadError, setLoadError] = useState<string | null>(null);
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
          setLoadError(null);
          try {
               const response = await customFetch(`payroll/employee/${employeeId}/ytd?year=${selectedYear}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setYtdData(response.result);
               } else {
                    setYtdData(null);
                    setLoadError(response?.message || 'Unable to load year-to-date payroll.');
               }
          } catch {
               setYtdData(null);
               setLoadError('Unable to load year-to-date payroll. Check your connection and retry.');
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
          return <main className={screens.page}>
               <header className={screens.header}><div><span className={screens.eyebrow}>Payroll / Employee reports</span><h1 className={screens.title}>Year-to-date payroll</h1><p>Find an employee to review their paid earnings, deductions and pension contributions.</p></div></header>
               <section className={screens.panel} aria-label="Select employee for payroll report"><h2 className="h6 mb-3">Choose an employee</h2><PayrollEmployeeFinder onSelect={id => router.push(`/human-resource/payroll/employee/ytd?employeeId=${id}&year=${selectedYear}`)}/></section>
          </main>;
     }

     if (loading) return <Loader />;
     if (loadError) return <div className={screens.page}><div role="alert" className="alert alert-danger"><p>{loadError}</p><button type="button" className="btn btn-outline-danger" onClick={fetchYTDReport}>Retry loading</button></div></div>;


     if (!ytdData) {
          return (
               <div className={screens.page}>
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
          <div className={screens.page}>
               {/* Header */}
               <div className={screens.header}>
                    <div className="d-flex align-items-center">
                         <Link href={`/human-resource/payroll/employee/history?employeeId=${employeeId}`} className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <div className="d-flex align-items-center mb-1">
                                   <RiLineChartLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   <span className={screens.eyebrow}>Payroll / Employee reports</span>
<h1 className={screens.title}>Year-to-Date Report</h1>
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

               <PayrollSummaryStrip label="Year-to-date payroll summary" items={[
                    {label:`Pay periods in ${selectedYear}`,value:ytdData.number_of_periods},
                    {label:'Gross earnings',value:currencyFormatter.format(ytdData.total_gross_salary)},
                    {label:'Net earnings',value:currencyFormatter.format(ytdData.total_net_salary),tone:'success'},
                    {label:'Average net per period',value:currencyFormatter.format(averageMonthly)}
               ]}/>

               <div className="row">
                    {/* Deductions Breakdown */}
                    <div className="col-lg-6 mb-4">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-4">Total Deductions Breakdown</h5>
                              <div className="mb-4">
                                   <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tax (Income Tax)</span>
                                        <span className="fw-bold">{currencyFormatter.format(ytdData.total_tax)}</span>
                                   </div>
                                   <div className="progress" style={{ height: '8px' }}>
                                        <div
                                             className="progress-bar bg-danger"
                                             style={{ width: `${(ytdData.total_tax / Math.max(ytdData.total_gross_salary, 0.01) * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_tax / Math.max(ytdData.total_gross_salary, 0.01)) * 100).toFixed(1)}% of gross
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
                                             style={{ width: `${(ytdData.total_ssnit_employee / Math.max(ytdData.total_gross_salary, 0.01) * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_ssnit_employee / Math.max(ytdData.total_gross_salary, 0.01)) * 100).toFixed(1)}% of gross
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
                                             style={{ width: `${(ytdData.total_ssnit_employer / Math.max(ytdData.total_gross_salary, 0.01) * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_ssnit_employer / Math.max(ytdData.total_gross_salary, 0.01)) * 100).toFixed(1)}% of gross
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
                                             style={{ width: `${(ytdData.total_other_deductions / Math.max(ytdData.total_gross_salary, 0.01) * 100)}%` }}
                                        ></div>
                                   </div>
                                   <div className="small text-muted mt-1">
                                        {((ytdData.total_other_deductions / Math.max(ytdData.total_gross_salary, 0.01)) * 100).toFixed(1)}% of gross
                                   </div>
                              </div>

                              <hr className="my-4" />

                              <div className="d-flex justify-content-between align-items-center">
                                   <span className="fw-bold fs-5">Total Deductions</span>
                                   <span className="fw-bold fs-5 text-danger">
                                        {currencyFormatter.format(
                                             ytdData.total_tax +
                                             ytdData.total_ssnit_employee +
                                             ytdData.total_other_deductions
                                        )}
                                   </span>
                              </div>
                         </div>
                    </div>

                    {/* Period-by-Period Breakdown */}
                    <div className="col-lg-6 mb-4">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">Period-by-Period Breakdown</h5>
                              <div className={screens.tableWrap} style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                   <table className={screens.table}>
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
               <div className={screens.panel} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
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
