'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';


interface PayrollTransaction {
     id: number;
     payroll_period_id: number;
     employeeid: number;
     basic_salary: number;
     hourly_earnings: number;
     overtime_earnings: number;
     commission_earnings: number;
     total_allowances: number;
     total_bonuses: number;
     gross_salary: number;
     income_tax: number;
     employee_ssnit: number;
     employer_ssnit: number;
     employee_tier3: number;
     employer_tier3: number;
     nhis: number;
     total_other_deductions: number;
     total_deductions: number;
     net_salary: number;
     employer_cost: number;
     days_worked: number;
     hours_worked: number;
     overtime_hours: number;
     days_absent: number;
     days_leave: number;
     status: string;
     payment_date: string;
     payment_method: string;
     allowances_detail: any[];
     bonuses_detail: any[];
     other_deductions_detail: any[];
     employeename: string;
     employeerole: string;
}

export default function EmployeeHistoryPage() {
     const searchParams = useSearchParams();
     const employeeId = useApplication()?.user?.employeeid;
     const [transactions, setTransactions] = useState<PayrollTransaction[]>([]);
     const [selectedTransaction, setSelectedTransaction] = useState<PayrollTransaction | null>(null);
     const [showModal, setShowModal] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
     const [pageSize, setPageSize] = useState(10);
     const [customPageSize, setCustomPageSize] = useState('');
     const [totalRecords, setTotalRecords] = useState(0);
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          fetchEmployeeHistory();
     }, [currentPage, pageSize]);

     useEffect(() => {
          // Sync customPageSize with pageSize when it changes
          if (![5, 10, 25, 50, 100, 250, 500, 1000].includes(pageSize)) {
               setCustomPageSize(pageSize.toString());
          } else {
               setCustomPageSize('');
          }
     }, [pageSize]);

     const fetchEmployeeHistory = async () => {
          setLoading(true);
          try {
               const response = await customFetch(
                    `payroll/employee/all/history?page=${currentPage}&count=${pageSize}`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setTransactions(response.result || []);
                    setTotalRecords(response.result?.length || 0);
               }
          } catch (err) {
               setTransactions([]);
               setTotalRecords(0);
          } finally {
               setLoading(false);
          }
     };

     const openBreakdownModal = (transaction: PayrollTransaction) => {
          setSelectedTransaction(transaction);
          setShowModal(true);
     };

     const closeModal = () => {
          setShowModal(false);
          setSelectedTransaction(null);
     };

     const currencyFormatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
     });

     const handlePageChange = (page: number) => {
          setCurrentPage(page);
     };

     const handlePageSizeChange = (size: number) => {
          const cappedSize = Math.min(Math.max(size, 1), 1000); // Ensure size is between 1 and 1000
          setPageSize(cappedSize);
          setCurrentPage(1); // Reset to first page when changing page size
     };




     const handleSeverSideProcessing = async (params: { page: number, count: number }) => {
          setLoading(true);
          try {
               const { page, count } = params;
               const response = await customFetch(
                    `payroll/history?employeeId=${employeeId}&page=${page}&count=${count}`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    return { result: response?.result?.data, error: false }
               } else {
                    return { result: [], error: false }
               }
          } catch (err) {
               return { result: [], error: true }
          } finally {
               setLoading(false);
          }
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              Employee Payroll History
                         </h2>
                         <p className="text-muted mb-0">View and manage employee payroll transactions</p>
                    </div>
               </div>

               {/* Card Table Section */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                         <div className="d-flex align-items-center gap-2">
                              <label className="form-label mb-0">Show:</label>
                              <select
                                   className="form-select form-select-sm"
                                   value={[5, 10, 25, 50, 100, 250, 500, 1000].includes(pageSize) ? pageSize : ''}
                                   onChange={(e) => {
                                        const value = Number(e.target.value);
                                        handlePageSizeChange(value);
                                        setCustomPageSize(''); // Clear custom input when selecting from dropdown
                                   }}
                                   style={{ width: 'auto' }}
                              >
                                   <option value={5}>5</option>
                                   <option value={10}>10</option>
                                   <option value={25}>25</option>
                                   <option value={50}>50</option>
                                   <option value={100}>100</option>
                                   <option value={250}>250</option>
                                   <option value={500}>500</option>
                                   <option value={1000}>1000</option>
                              </select>
                              <span>entries</span>
                              <span className="text-muted mx-2">or</span>
                              <input
                                   type="number"
                                   className="form-control form-control-sm"
                                   placeholder="Custom"
                                   min="1"
                                   max="1000"
                                   value={customPageSize}
                                   onChange={(e) => {
                                        const value = e.target.value;
                                        setCustomPageSize(value);
                                        const numValue = Number(value);
                                        if (numValue >= 1 && numValue <= 1000) {
                                             handlePageSizeChange(numValue);
                                        }
                                   }}
                                   onBlur={() => {
                                        // Clear custom input if it's not a valid number or out of range
                                        const numValue = Number(customPageSize);
                                        if (isNaN(numValue) || numValue < 1 || numValue > 1000) {
                                             setCustomPageSize('');
                                        }
                                   }}
                                   style={{ width: '80px' }}
                              />
                         </div>
                    </div>
                    <div className="table-responsive">
                         <table className="table table-striped">
                              <thead>
                                   <tr>
                                        <th className="text-start">Employee Name</th>
                                        <th className="text-start">Payment Period</th>
                                        <th className="text-start">Payment Date</th>
                                        <th className="text-start">Gross Salary</th>
                                        <th className="text-start">Total Deductions</th>
                                        <th className="text-start">Net Salary</th>
                                        <th className="text-start">Days Worked</th>
                                        <th className="text-start">Hours Worked</th>
                                        <th className="text-start">Status</th>
                                        <th className="text-start">Payment Method</th>
                                        <th className="text-start">Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {loading ? (
                                        <tr>
                                             <td colSpan={11} className="text-center py-4">
                                                  <div className="spinner-border spinner-border-sm" role="status">
                                                       <span className="visually-hidden">Loading...</span>
                                                  </div>
                                                  <span className="ms-2">Loading...</span>
                                             </td>
                                        </tr>
                                   ) : transactions.length === 0 ? (
                                        <tr>
                                             <td colSpan={11} className="text-start py-4">
                                                  No payroll records found.
                                             </td>
                                        </tr>
                                   ) : (
                                        Array.isArray(transactions) && transactions.map((transaction) => (
                                             <tr key={transaction.id}>
                                                  <td className="text-start">{transaction.employeename}</td>
                                                  <td className="text-start">Period {transaction.payroll_period_id}</td>
                                                  <td className="text-start">{new Date(transaction.payment_date).toLocaleDateString()}</td>
                                                  <td className="text-start fw-bold">{currencyFormatter.format(transaction.gross_salary)}</td>
                                                  <td className="text-start text-danger">{currencyFormatter.format(transaction.total_deductions)}</td>
                                                  <td className="text-start fw-bold text-success">{currencyFormatter.format(transaction.net_salary)}</td>
                                                  <td className="text-start">{transaction.days_worked}</td>
                                                  <td className="text-start">{transaction.hours_worked}</td>
                                                  <td className="text-start">
                                                       <span className={`badge ${transaction.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                                                            {transaction.status}
                                                       </span>
                                                  </td>
                                                  <td className="text-start">
                                                       {transaction.payment_method}
                                                  </td>
                                                  <td className="text-start">
                                                       <button
                                                            className="btn btn-sm btn-primary me-2"
                                                            onClick={() => openBreakdownModal(transaction)}
                                                       >
                                                            View Breakdown
                                                       </button>
                                                       <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => window.open(`/human-resource/payroll/employee/history/${transaction.employeeid}`, '_blank')}
                                                       >
                                                            View History
                                                       </button>
                                                  </td>
                                             </tr>
                                        ))
                                   )}
                              </tbody>
                         </table>
                    </div>
                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                         <div>
                              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
                         </div>
                         <nav>
                              <ul className="pagination pagination-sm mb-0">
                                   <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                             className="page-link"
                                             onClick={() => handlePageChange(currentPage - 1)}
                                             disabled={currentPage === 1}
                                        >
                                             Previous
                                        </button>
                                   </li>
                                   {Array.from({ length: Math.ceil(totalRecords / pageSize) }, (_, i) => i + 1)
                                        .filter(page => {
                                             const totalPages = Math.ceil(totalRecords / pageSize);
                                             if (totalPages <= 7) return true;
                                             if (page === 1 || page === totalPages) return true;
                                             if (Math.abs(page - currentPage) <= 1) return true;
                                             return false;
                                        })
                                        .map((page, index, array) => (
                                             <React.Fragment key={page}>
                                                  {index > 0 && array[index - 1] !== page - 1 && (
                                                       <li className="page-item disabled">
                                                            <span className="page-link">...</span>
                                                       </li>
                                                  )}
                                                  <li className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                                       <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(page)}
                                                       >
                                                            {page}
                                                       </button>
                                                  </li>
                                             </React.Fragment>
                                        ))}
                                   <li className={`page-item ${currentPage === Math.ceil(totalRecords / pageSize) ? 'disabled' : ''}`}>
                                        <button
                                             className="page-link"
                                             onClick={() => handlePageChange(currentPage + 1)}
                                             disabled={currentPage === Math.ceil(totalRecords / pageSize)}
                                        >
                                             Next
                                        </button>
                                   </li>
                              </ul>
                         </nav>
                    </div>
               </div>
               {showModal && selectedTransaction && (
                    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Payroll Breakdown - {selectedTransaction.employeename}</h5>
                                        <button type="button" className="btn-close" onClick={closeModal}></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <h6 className="text-primary">Earnings</h6>
                                                  <div className="mb-2 text-start"><strong>Basic Salary:</strong> {currencyFormatter.format(selectedTransaction.basic_salary)}</div>
                                                  <div className="mb-2 text-start"><strong>Hourly Earnings:</strong> {currencyFormatter.format(selectedTransaction.hourly_earnings)}</div>
                                                  <div className="mb-2 text-start"><strong>Overtime Earnings:</strong> {currencyFormatter.format(selectedTransaction.overtime_earnings)}</div>
                                                  <div className="mb-2 text-start"><strong>Commission:</strong> {currencyFormatter.format(selectedTransaction.commission_earnings)}</div>
                                                  <div className="mb-2 text-start"><strong>Total Allowances:</strong> {currencyFormatter.format(selectedTransaction.total_allowances)}</div>
                                                  <div className="mb-2 text-start"><strong>Total Bonuses:</strong> {currencyFormatter.format(selectedTransaction.total_bonuses)}</div>
                                                  <div className="mb-2 fw-bold text-start"><strong>Gross Salary:</strong> {currencyFormatter.format(selectedTransaction.gross_salary)}</div>
                                             </div>
                                             <div className="col-md-6">
                                                  <h6 className="text-danger">Deductions</h6>
                                                  <div className="mb-2 text-start"><strong>Income Tax:</strong> {currencyFormatter.format(selectedTransaction.income_tax)}</div>
                                                  <div className="mb-2 text-start"><strong>Employee SSNIT:</strong> {currencyFormatter.format(selectedTransaction.employee_ssnit)}</div>
                                                  <div className="mb-2 text-start"><strong>Employee Tier 3:</strong> {currencyFormatter.format(selectedTransaction.employee_tier3)}</div>
                                                  <div className="mb-2 text-start"><strong>NHIS:</strong> {currencyFormatter.format(selectedTransaction.nhis)}</div>
                                                  <div className="mb-2 text-start"><strong>Other Deductions:</strong> {currencyFormatter.format(selectedTransaction.total_other_deductions)}</div>
                                                  <div className="mb-2 fw-bold text-start"><strong>Total Deductions:</strong> {currencyFormatter.format(selectedTransaction.total_deductions)}</div>
                                                  <div className="mb-2 fw-bold text-success text-start"><strong>Net Salary:</strong> {currencyFormatter.format(selectedTransaction.net_salary)}</div>
                                             </div>
                                        </div>
                                        <hr />
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <h6 className="text-info">Work Details</h6>
                                                  <div className="mb-2 text-start"><strong>Days Worked:</strong> {selectedTransaction.days_worked}</div>
                                                  <div className="mb-2 text-start"><strong>Hours Worked:</strong> {selectedTransaction.hours_worked}</div>
                                                  <div className="mb-2 text-start"><strong>Overtime Hours:</strong> {selectedTransaction.overtime_hours}</div>
                                                  <div className="mb-2 text-start"><strong>Days Absent:</strong> {selectedTransaction.days_absent}</div>
                                                  <div className="mb-2 text-start"><strong>Days Leave:</strong> {selectedTransaction.days_leave}</div>
                                             </div>
                                             <div className="col-md-6">
                                                  <h6 className="text-secondary">Payment Details</h6>
                                                  <div className="mb-2 text-start"><strong>Payroll Period:</strong> Period {selectedTransaction.payroll_period_id}</div>
                                                  <div className="mb-2 text-start"><strong>Payment Date:</strong> {new Date(selectedTransaction.payment_date).toLocaleDateString()}</div>
                                                  <div className="mb-2 text-start"><strong>Payment Method:</strong> {selectedTransaction.payment_method}</div>
                                                  <div className="mb-2 text-start"><strong>Status:</strong> <span className={`badge ${selectedTransaction.status === 'paid' ? 'bg-success' : 'bg-warning'}`}>{selectedTransaction.status}</span></div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>Close</button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
