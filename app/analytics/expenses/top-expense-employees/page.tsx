"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiUserLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface TopExpenseEmployee {
     employee_name: string;
     employeeid: number;
     expense_count: number;
     total_amount: number;
     average_amount: number;
     min_amount: number;
     max_amount: number;
     branch_name: string;
}

export default function TopExpenseEmployees() {
     const [data, setData] = useState<TopExpenseEmployee[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [startDate, setStartDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
     });
     const [endDate, setEndDate] = useState<string>(() => {
          const now = new Date();
          return new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
     });
     const [limitCount, setLimitCount] = useState<number>(10);
     const [branches, setBranches] = useState<any[]>([]);
     const [branchid, setBranchid] = useState<number | null>(null);
     const { user } = useApplication();

     const fetchData = async () => {
          if (!branchid) return;
          setLoading(true);
          setError(null);
          try {
               const endpoint = `expenses-analytics/top-employees?branchid=${branchid}&limitCount=${limitCount}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
               const response = await customFetch(endpoint);
               if (response && Array.isArray(response)) {
                    setData(response);
               } else {
                    setError("Invalid data format received");
               }
          } catch (err: any) {
               setError(err.message || "Failed to fetch data");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          async function fetchBranches() {
               try {
                    const response = await customFetch("branches");
                    if (response && Array.isArray(response.result)) {
                         setBranches(response.result);
                         if (response.result.length > 0) setBranchid(response.result[0].branchid);
                    }
               } catch { }
          }
          fetchBranches();
     }, []);

     useEffect(() => {
          if (branchid) {
               fetchData();
          }
     }, [branchid]);

     const totalAmountSum = data.reduce((sum, entry) => sum + entry.total_amount, 0);
     const totalExpenseCount = data.reduce((sum, entry) => sum + entry.expense_count, 0);

     return (
          <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                         <RiUserLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                         Top Expense Employees
                    </h2>
                    <div className="mt-3 d-flex flex-wrap gap-3">
                         <div>
                              <label className="me-2">Branch:</label>
                              <select
                                   className="form-select"
                                   value={branchid ?? ''}
                                   onChange={e => setBranchid(Number(e.target.value))}
                                   style={{ minWidth: 180 }}
                              >
                                   {branches.map(branch => (
                                        <option key={branch.branchid} value={branch.branchid}>{branch.name}</option>
                                   ))}
                              </select>
                         </div>
                         <div>
                              <label className="me-2">Start Date:</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={startDate}
                                   onChange={e => setStartDate(e.target.value)}
                                   style={{ minWidth: 140 }}
                              />
                         </div>
                         <div>
                              <label className="me-2">End Date:</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={endDate}
                                   onChange={e => setEndDate(e.target.value)}
                                   style={{ minWidth: 140 }}
                              />
                         </div>
                         <div>
                              <label className="me-2">Limit:</label>
                              <input
                                   type="number"
                                   className="form-control"
                                   value={limitCount}
                                   min={1}
                                   max={100}
                                   onChange={e => setLimitCount(Number(e.target.value))}
                                   style={{ minWidth: 80 }}
                              />
                         </div>
                         <button
                              className="btn btn-primary d-flex align-items-center gap-1 px-2 py-2 btn-sm mt-4"
                              style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, minWidth: 70, fontWeight: 500, fontSize: '0.85rem', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)' }}
                              onClick={fetchData}
                              disabled={loading}
                         >
                              {loading ? (
                                   <>
                                        <RiLoader4Line size={16} className="animate-spin" />
                                        Loading...
                                   </>
                              ) : (
                                   <>
                                        <RiUserLine size={15} />
                                        Load Data
                                   </>
                              )}
                         </button>
                    </div>
               </div>
               <div className="card-body p-3 p-md-4">
                    {loading ? (
                         <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading employee data...</p>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                         </div>
                    ) : data.length === 0 ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                              <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                              <h5 className="fw-medium mb-1">No Data Available</h5>
                              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                                   No employee expense data for the selected period.
                              </p>
                         </div>
                    ) : (
                         <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                              <table className="table table-sm table-hover table-striped small">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">#</th>
                                             <th scope="col" className="py-2">Employee Name</th>
                                             <th scope="col" className="py-2">Employee ID</th>
                                             <th scope="col" className="py-2">Branch</th>
                                             <th scope="col" className="py-2 text-end">Total Amount</th>
                                             <th scope="col" className="py-2 text-end">Expense Count</th>
                                             <th scope="col" className="py-2 text-end">Average Amount</th>
                                             <th scope="col" className="py-2 text-end">Min Amount</th>
                                             <th scope="col" className="py-2 text-end">Max Amount</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {data.map((employee, idx) => (
                                             <tr key={employee.employeeid}>
                                                  <td className="py-2 fw-medium">{idx + 1}</td>
                                                  <td className="py-2 fw-medium">{employee.employee_name}</td>
                                                  <td className="py-2 text-muted">{employee.employeeid}</td>
                                                  <td className="py-2">{employee.branch_name}</td>
                                                  <td className="py-2 text-end fw-medium">{currencyFormatter.format(employee.total_amount)}</td>
                                                  <td className="py-2 text-end">{employee.expense_count}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(employee.average_amount)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(employee.min_amount)}</td>
                                                  <td className="py-2 text-end">{currencyFormatter.format(employee.max_amount)}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                                   <tfoot>
                                        <tr className="fw-bold border-top">
                                             <td className="py-2" colSpan={4}>Total</td>
                                             <td className="py-2 text-end">{currencyFormatter.format(totalAmountSum)}</td>
                                             <td className="py-2 text-end">{totalExpenseCount}</td>
                                             <td className="py-2 text-end">-</td>
                                             <td className="py-2 text-end">-</td>
                                             <td className="py-2 text-end">-</td>
                                        </tr>
                                   </tfoot>
                              </table>
                         </div>
                    )}
               </div>
               {data.length > 0 && (
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="row g-3">
                              <div className="col-md-3">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-primary">{data.length}</div>
                                        <div className="text-muted small">Top Employees</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-success">{currencyFormatter.format(totalAmountSum)}</div>
                                        <div className="text-muted small">Total Expenses</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-info">{totalExpenseCount}</div>
                                        <div className="text-muted small">Total Transactions</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-warning">{currencyFormatter.format(totalAmountSum / data.length)}</div>
                                        <div className="text-muted small">Avg per Employee</div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
               <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color);
                }
            `}</style>
          </div>
     );
}