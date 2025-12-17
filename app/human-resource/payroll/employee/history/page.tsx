'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { PayrollStatusBadge } from '../../../../../components/HR/Payroll/StatusBadges';
import { currencyFormatter, formatDate } from '../../../../../components/HR/Payroll/utils';
import Loader from '../../../../../components/isLoading';
import {
     RiUserLine,
     RiHistoryLine,
     RiSearchLine,
     RiEyeLine,
     RiDownloadLine,
     RiCalendarLine
} from '@remixicon/react';

interface PayrollTransaction {
     id: number;
     period_id: number;
     period_name: string;
     period_start_date: string;
     period_end_date: string;
     gross_salary: number;
     tax_amount: number;
     ssnit_employee: number;
     ssnit_employer: number;
     other_deductions: number;
     net_salary: number;
     payment_status: string;
     created_at: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function EmployeeHistoryPage() {
     const searchParams = useSearchParams();
     const router = useRouter();
     const employeeId = searchParams?.get('employeeId');

     const [transactions, setTransactions] = useState<PayrollTransaction[]>([]);
     const [filteredTransactions, setFilteredTransactions] = useState<PayrollTransaction[]>([]);
     const [loading, setLoading] = useState(true);
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');
     const [statusFilter, setStatusFilter] = useState('all');

     useEffect(() => {
          if (employeeId) {
               fetchEmployeeHistory();
          } else {
               setLoading(false);
          }
     }, [employeeId]);

     useEffect(() => {
          applyFilters();
     }, [transactions, startDate, endDate, statusFilter]);

     const fetchEmployeeHistory = async () => {
          setLoading(true);
          try {
               const response = await customFetch(`payroll/employee/${employeeId}/history`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setTransactions(response.result || []);
               }
          } finally {
               setLoading(false);
          }
     };

     const applyFilters = () => {
          let filtered = [...transactions];

          // Date filter
          if (startDate) {
               filtered = filtered.filter(t => new Date(t.period_start_date) >= new Date(startDate));
          }
          if (endDate) {
               filtered = filtered.filter(t => new Date(t.period_end_date) <= new Date(endDate));
          }

          // Status filter
          if (statusFilter !== 'all') {
               filtered = filtered.filter(t => t.payment_status === statusFilter);
          }

          setFilteredTransactions(filtered);
     };

     const handleResetFilters = () => {
          setStartDate('');
          setEndDate('');
          setStatusFilter('all');
     };

     // Calculate totals
     const totalGross = filteredTransactions.reduce((sum, t) => sum + (t.gross_salary || 0), 0);
     const totalNet = filteredTransactions.reduce((sum, t) => sum + (t.net_salary || 0), 0);
     const totalTax = filteredTransactions.reduce((sum, t) => sum + (t.tax_amount || 0), 0);
     const totalSSNIT = filteredTransactions.reduce((sum, t) => sum + ((t.ssnit_employee || 0) + (t.ssnit_employer || 0)), 0);

     if (!employeeId) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <RiUserLine size={48} className="text-muted mb-3" />
                         <h5 className="fw-medium mb-2">No Employee Selected</h5>
                         <p className="text-muted">Please provide an employee ID to view payroll history</p>
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
                                                  router.push(`/human-resource/payroll/employee/history?employeeId=${value}`);
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

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                         <RiHistoryLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Employee Payroll History</h1>
                              <p className="text-muted mb-0 small">
                                   Employee ID: {employeeId} | {filteredTransactions.length} of {transactions.length} records
                              </p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <Link href={`/human-resource/payroll/employee/ytd?employeeId=${employeeId}`} className="btn btn-outline-secondary btn-sm">
                              View YTD Report
                         </Link>
                         <button className="btn btn-outline-primary btn-sm" onClick={() => window.print()}>
                              <RiDownloadLine size={18} className="me-1" />
                              Print
                         </button>
                    </div>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="small text-muted mb-1">Total Periods</div>
                              <div className="fs-4 fw-bold">{filteredTransactions.length}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="small text-muted mb-1">Total Gross Salary</div>
                              <div className="fs-5 fw-bold text-success">{currencyFormatter.format(totalGross)}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="small text-muted mb-1">Total Net Salary</div>
                              <div className="fs-5 fw-bold" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(totalNet)}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="small text-muted mb-1">Total Deductions</div>
                              <div className="fs-5 fw-bold text-danger">{currencyFormatter.format(totalGross - totalNet)}</div>
                         </div>
                    </div>
               </div>

               {/* Filters */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="row g-3 align-items-end">
                         <div className="col-md-3">
                              <label className="form-label small mb-1">Start Date</label>
                              <input
                                   type="date"
                                   className="form-control form-control-sm"
                                   value={startDate}
                                   onChange={(e) => setStartDate(e.target.value)}
                              />
                         </div>
                         <div className="col-md-3">
                              <label className="form-label small mb-1">End Date</label>
                              <input
                                   type="date"
                                   className="form-control form-control-sm"
                                   value={endDate}
                                   onChange={(e) => setEndDate(e.target.value)}
                                   min={startDate}
                              />
                         </div>
                         <div className="col-md-3">
                              <label className="form-label small mb-1">Payment Status</label>
                              <select
                                   className="form-select form-select-sm"
                                   value={statusFilter}
                                   onChange={(e) => setStatusFilter(e.target.value)}
                              >
                                   <option value="all">All Status</option>
                                   <option value="paid">Paid</option>
                                   <option value="pending">Pending</option>
                              </select>
                         </div>
                         <div className="col-md-3">
                              <button className="btn btn-outline-secondary btn-sm w-100" onClick={handleResetFilters}>
                                   Reset Filters
                              </button>
                         </div>
                    </div>
               </div>

               {/* Transactions Table */}
               {filteredTransactions.length === 0 ? (
                    <div className="text-center py-5">
                         <RiHistoryLine size={48} className="text-muted mb-3" />
                         <h5 className="fw-medium mb-2">No Payroll History Found</h5>
                         <p className="text-muted">
                              {startDate || endDate || statusFilter !== 'all'
                                   ? 'Try adjusting your filters'
                                   : 'This employee has no payroll records yet'}
                         </p>
                    </div>
               ) : (
                    <div className="border rounded" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <div className="table-responsive">
                              <table className="table table-hover mb-0 align-middle">
                                   <thead className="table-light">
                                        <tr>
                                             <th>Period</th>
                                             <th>Period Dates</th>
                                             <th className="text-end">Gross Salary</th>
                                             <th className="text-end">Tax</th>
                                             <th className="text-end">SSNIT (Total)</th>
                                             <th className="text-end">Other Deductions</th>
                                             <th className="text-end">Net Salary</th>
                                             <th>Status</th>
                                             <th className="text-end">Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredTransactions.map((transaction) => (
                                             <tr key={transaction.id}>
                                                  <td className="fw-medium">{transaction.period_name}</td>
                                                  <td className="small">
                                                       {formatDate(transaction.period_start_date)} - {formatDate(transaction.period_end_date)}
                                                  </td>
                                                  <td className="text-end fw-bold text-success">
                                                       {currencyFormatter.format(transaction.gross_salary)}
                                                  </td>
                                                  <td className="text-end">{currencyFormatter.format(transaction.tax_amount)}</td>
                                                  <td className="text-end">
                                                       {currencyFormatter.format((transaction.ssnit_employee || 0) + (transaction.ssnit_employer || 0))}
                                                  </td>
                                                  <td className="text-end">{currencyFormatter.format(transaction.other_deductions)}</td>
                                                  <td className="text-end fw-bold" style={{ color: COLOR_ACCENT }}>
                                                       {currencyFormatter.format(transaction.net_salary)}
                                                  </td>
                                                  <td>
                                                       <PayrollStatusBadge status={transaction.payment_status as any} />
                                                  </td>
                                                  <td>
                                                       <div className="d-flex gap-1 justify-content-end">
                                                            <Link
                                                                 href={`/human-resource/payroll/periods/${transaction.period_id}`}
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 title="View Period Details"
                                                            >
                                                                 <RiEyeLine size={16} />
                                                            </Link>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                                   <tfoot className="table-light fw-bold">
                                        <tr>
                                             <td colSpan={2}>Total</td>
                                             <td className="text-end text-success">{currencyFormatter.format(totalGross)}</td>
                                             <td className="text-end">{currencyFormatter.format(totalTax)}</td>
                                             <td className="text-end">{currencyFormatter.format(totalSSNIT)}</td>
                                             <td className="text-end">
                                                  {currencyFormatter.format(
                                                       filteredTransactions.reduce((sum, t) => sum + (t.other_deductions || 0), 0)
                                                  )}
                                             </td>
                                             <td className="text-end" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(totalNet)}</td>
                                             <td colSpan={2}></td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>
                    </div>
               )}
          </div>
     );
}
