'use client';
import PayrollHistoryDetails from '../../../PayrollHistoryDetails';
import screens from '../../../PayrollScreens.module.css';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApplication } from '../../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../../components/Auth/customFetch';


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
     const [historySearch, setHistorySearch] = useState('');
     const [showCustomCount, setShowCustomCount] = useState(false);
     const [transactions, setTransactions] = useState<PayrollTransaction[]>([]);
     const [selectedTransaction, setSelectedTransaction] = useState<PayrollTransaction | null>(null);
     const [showModal, setShowModal] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
     const [pageSize, setPageSize] = useState(10);
     const [customPageSize, setCustomPageSize] = useState('');
     const [totalRecords, setTotalRecords] = useState(0);
     const [loading, setLoading] = useState(false);
     const [loadError, setLoadError] = useState<string | null>(null);

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
          setLoadError(null);
          try {
               const response = await customFetch(
                    `payroll/employee/${employeeId}/history?page=${currentPage}&count=${pageSize}`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setTransactions(response.result || []);
                    setTotalRecords(Number(response.pagination?.total ?? response.result?.length ?? 0));
               } else {
                    setLoadError(response?.message || 'Unable to load payroll history.');
               }
          } catch (err) {
               setLoadError('Unable to load payroll history. Check your connection and retry.');
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

     };

     const currencyFormatter = new Intl.NumberFormat('en-GH', {
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

     const visibleTransactions = transactions.filter(transaction => [transaction.employeename, transaction.employeeid, transaction.payroll_period_id, transaction.status].join(" ").toLowerCase().includes(historySearch.trim().toLowerCase()));
     if (loadError) return <div className={screens.page}><div role="alert" className="alert alert-danger"><p>{loadError}</p><button type="button" className="btn btn-outline-danger" onClick={fetchEmployeeHistory}>Retry loading</button></div></div>;
     return (
          <div className={screens.page}>
               {/* Header */}
               <div className={screens.header}>
                    <div>
                         <span className={screens.eyebrow}>Payroll / Employee reports</span><h1 className={screens.title}>Employee Payroll History</h1>
                         <p className="text-muted mb-0">View and manage employee payroll transactions</p>
                    </div>
               </div>

               {/* Card Table Section */}
               <section className={screens.historyPanel} aria-label="Payroll transactions" aria-busy={loading}><div className={screens.toolbar}><div><h2 className="h6 mb-1">Payroll transactions</h2><p className="small text-muted mb-0">{totalRecords} records</p></div><input className="form-control" type="search" aria-label="Filter loaded payroll records" placeholder="Filter this page by employee, period or status" value={historySearch} onChange={e=>setHistorySearch(e.target.value)} style={{width:320,maxWidth:'100%'}}/></div>
 <div className={screens.tableWrap}><table className={screens.table}><thead><tr><th>Employee</th><th>Period / payment date</th><th className="text-end">Gross salary</th><th className="text-end">Deductions</th><th className="text-end">Net salary</th><th>Status / method</th><th className="text-end">Actions</th></tr></thead><tbody>
 {loading?<tr><td colSpan={7} className="text-center py-4" role="status">Loading payroll history…</td></tr>:visibleTransactions.length===0?<tr><td colSpan={7} className="text-center py-4">{historySearch?'No loaded records match this filter.':'No payroll records found.'}</td></tr>:visibleTransactions.map(transaction=><tr key={transaction.id}><td><strong>{transaction.employeename || 'Employee'}</strong><small className="d-block text-muted">Employee #{transaction.employeeid}</small></td><td><strong>Period #{transaction.payroll_period_id}</strong><small className="d-block text-muted">{transaction.payment_date ? new Date(transaction.payment_date).toLocaleDateString('en-GB') : 'Not paid'}</small></td><td className="text-end text-nowrap">{currencyFormatter.format(Number(transaction.gross_salary)||0)}</td><td className="text-end text-nowrap">{currencyFormatter.format(Number(transaction.total_deductions)||0)}</td><td className="text-end text-nowrap"><strong>{currencyFormatter.format(Number(transaction.net_salary)||0)}</strong></td><td><span className={screens.paymentStatus} data-status={transaction.status}>{transaction.status}</span><small className="d-block text-muted mt-1">{transaction.payment_method?.replaceAll('_',' ') || 'Not recorded'}</small></td><td><div className="d-flex gap-2 justify-content-end"><button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>openBreakdownModal(transaction)}>Breakdown</button><a className="btn btn-sm btn-outline-secondary" href={`/human-resource/payroll/employee/history/${transaction.employeeid}`} target="_blank" rel="noopener noreferrer">History</a></div></td></tr>)}
 </tbody></table></div>
 <footer className={screens.historyFooter}><span>{historySearch?`${visibleTransactions.length} matching rows on this page`:`Showing ${totalRecords===0?0:(currentPage-1)*pageSize+1}–${Math.min(currentPage*pageSize,totalRecords)} of ${totalRecords}`}</span><div className="d-flex align-items-center gap-2 flex-wrap"><label className="small">Rows <select aria-label="Payroll history rows per page" disabled={loading} className="form-select form-select-sm d-inline-block w-auto ms-2" value={showCustomCount?'custom':pageSize} onChange={e=>{if(e.target.value==='custom'){setShowCustomCount(true);setCustomPageSize(String(pageSize));}else{setShowCustomCount(false);handlePageSizeChange(Number(e.target.value));}}}>{[5,10,25,50,100,250,500,1000].map(size=><option key={size} value={size}>{size}</option>)}<option value="custom">Custom</option></select></label>{showCustomCount&&<><input aria-label="Custom payroll history row count" className="form-control form-control-sm" type="number" min={1} max={1000} value={customPageSize} onChange={e=>setCustomPageSize(e.target.value)} style={{width:85}}/><button className="btn btn-sm btn-outline-primary" type="button" disabled={!Number.isInteger(Number(customPageSize))||Number(customPageSize)<1||Number(customPageSize)>1000} onClick={()=>handlePageSizeChange(Number(customPageSize))}>Apply</button></>}<button className="btn btn-sm btn-outline-secondary" type="button" disabled={loading||currentPage<=1} onClick={()=>handlePageChange(currentPage-1)}>Previous</button><span className="small">Page {currentPage}</span><button className="btn btn-sm btn-outline-secondary" type="button" disabled={loading||currentPage*pageSize>=totalRecords} onClick={()=>handlePageChange(currentPage+1)}>Next</button></div></footer></section>
               <PayrollHistoryDetails show={showModal} transaction={selectedTransaction} onHide={closeModal}/>
          </div>
     );
}
