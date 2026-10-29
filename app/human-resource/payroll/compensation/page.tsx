'use client';
import { usePayrollFeedback } from '../../../../components/HR/Payroll/usePayrollFeedback';

import { RiMoneyDollarCircleLine, RiDownloadLine, RiAddLine, RiSearchLine, RiEyeLine, RiEditLine, RiDeleteBinLine } from "@remixicon/react";
import Link from "next/link";
import ui from '../PayrollDashboard.module.css';
import { useState, useEffect } from "react";
import Loader from "../../../../components/accessories/Loader";
import { customPost, currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { CompensationTypeBadge, CompensationStatusBadge } from "../../../../components/HR/Payroll/StatusBadges";
import { getPaymentFrequencyLabel, getPaymentMethodLabel } from "../../../../components/HR/Payroll/utils";
import { formatDate } from "../../../../components/operations/Laboratory/Lib";


interface Employee {
     employeeid: number;
     username: string;
     role: string;
     email: string;
     branch: number;
     branchname: string;
     emailAuthenticated: string;
     activation: number;
}

interface CompensationStatusBadgeProps {
     status: string;
}

interface SalaryGrade {
     id: number;
     grade_name: string;
     grade_level: string;
     min_salary: number | null;
     max_salary: number | null;
     description: string | null;
     currency: string;
     is_active: boolean;
}

interface Compensation {
     id: number;
     employeeid: number;
     employee_name?: string;
     compensation_type: 'salary' | 'hourly' | 'commission' | 'hybrid';
     basic_salary?: number;
     salary_grade?: string;
     salary_grade_id?: number;
     currency: string;
     hourly_rate?: number;
     overtime_rate_multiplier?: number;
     commission_percentage?: number;
     commission_target?: number;
     payment_frequency: string;
     payment_method: string;
     bank_name?: string;
     bank_account_number?: string;
     bank_branch?: string;
     mobile_money_number?: string;
     mobile_money_network?: string;
     is_active: boolean;
     effective_from: string;
     effective_to?: string;
     created_at: string;
     notes?: string;
}

const COLOR_ACCENT = 'var(--bs-primary)';

export default function CompensationListPage() {
     const { notify, feedback } = usePayrollFeedback();
     const [compensations, setCompensations] = useState<Compensation[]>([]);
     const [filteredCompensations, setFilteredCompensations] = useState<Compensation[]>([]);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeeMap, setEmployeeMap] = useState<Map<number, Employee>>(new Map());
     const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([]);
     const [salaryGradeMap, setSalaryGradeMap] = useState<Map<number, SalaryGrade>>(new Map());
     const [loading, setLoading] = useState(true);
     const [loadError, setLoadError] = useState<string | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState<string>('all');
     const [typeFilter, setTypeFilter] = useState<string>('all');
     const [sortBy, setSortBy] = useState<'employee' | 'salary' | 'date'>('date');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
     const [currentPage, setCurrentPage] = useState(1);
     const itemsPerPage = 10;

     useEffect(() => {
          fetchCompensations();
     }, []);

     useEffect(() => {
          applyFilters();
     }, [compensations, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

     useEffect(() => {
          setCurrentPage(1);
     }, [searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

     useEffect(() => {
          const totalPages = Math.max(1, Math.ceil(filteredCompensations.length / itemsPerPage));
          if (currentPage > totalPages) {
               setCurrentPage(totalPages);
          }
     }, [currentPage, filteredCompensations.length]);

     const fetchEmployees = async () => {
          try {
               const response = await customFetch('logins');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const employeeData = response.result || [];
                    setEmployees(employeeData);

                    // Create employee map for quick lookup
                    const empMap = new Map<number, Employee>();
                    employeeData.forEach((emp: Employee) => {
                         empMap.set(emp.employeeid, emp);
                    });
                    setEmployeeMap(empMap);

                    return empMap; // Return the map for immediate use
               }
               return new Map<number, Employee>();
          } catch (error) {
               console.error('Error fetching employees:', error);
               return new Map<number, Employee>();
          }
     };

     const fetchSalaryGrades = async () => {
          try {
               const response = await customFetch('payroll/salary-grades?activeOnly=true');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const gradeData = response.result || [];
                    setSalaryGrades(gradeData);

                    // Create salary grade map for quick lookup
                    const gradeMap = new Map<number, SalaryGrade>();
                    gradeData.forEach((grade: SalaryGrade) => {
                         gradeMap.set(grade.id, grade);
                    });
                    setSalaryGradeMap(gradeMap);

                    return gradeMap; // Return the map for immediate use
               }
               return new Map<number, SalaryGrade>();
          } catch (error) {
               console.error('Error fetching salary grades:', error);
               return new Map<number, SalaryGrade>();
          }
     };

     const fetchCompensations = async () => {
          setLoading(true);
          setLoadError(null);
          try {
               // Fetch employees and salary grades first
               const [empMap, gradeMap] = await Promise.all([
                    fetchEmployees(),
                    fetchSalaryGrades()
               ]);

               // Then fetch compensations
               const response = await customFetch('payroll/compensation');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const compData = response.result || [];

                    // Add employee names and salary grade info to compensations
                    const compsWithDetails = compData.map((comp: Compensation) => ({
                         ...comp,
                         employee_name: empMap.get(comp.employeeid)?.username || 'Unknown',
                         salary_grade: comp.salary_grade_id ? gradeMap.get(comp.salary_grade_id)?.grade_name : comp.salary_grade
                    }));

                    setCompensations(compsWithDetails);
               } else {
                    setLoadError(response?.message || 'Unable to load compensation records.');
               }
          } catch {
               setLoadError('Unable to load compensation records. Check your connection and retry.');
          } finally {
               setLoading(false);
          }
     };

     const applyFilters = () => {
          let filtered = [...compensations];

          // Search filter
          if (searchTerm) {
               filtered = filtered.filter(comp =>
                    comp.employeeid.toString().includes(searchTerm) ||
                    comp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    comp.salary_grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    comp.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    comp.bank_account_number?.includes(searchTerm) ||
                    comp.mobile_money_number?.includes(searchTerm)
               );
          }

          // Status filter
          if (statusFilter !== 'all') {
               const isActiveFilter = statusFilter === 'active';
               filtered = filtered.filter(comp => Boolean(comp.is_active) === isActiveFilter);
          }

          // Type filter
          if (typeFilter !== 'all') {
               filtered = filtered.filter(comp => comp.compensation_type === typeFilter);
          }

          // Sorting
          filtered.sort((a, b) => {
               let comparison = 0;

               if (sortBy === 'employee') {
                    comparison = (a.employee_name || '').localeCompare(b.employee_name || '');
               } else if (sortBy === 'salary') {
                    const valueA = a.basic_salary || a.hourly_rate || a.commission_percentage || 0;
                    const valueB = b.basic_salary || b.hourly_rate || b.commission_percentage || 0;
                    comparison = valueA - valueB;
               } else if (sortBy === 'date') {
                    comparison = new Date(a.effective_from).getTime() - new Date(b.effective_from).getTime();
               }

               return sortOrder === 'asc' ? comparison : -comparison;
          });

          setFilteredCompensations(filtered);
     };

     const handleDelete = async (id: number) => {
          if (!confirm('Are you sure you want to delete this compensation record?')) {
               return;
          }

          try {
               const response = await customPost(`payroll/compensation/${id}`, 'DELETE', {});
               if (response?.status === 'success') {
                    notify('Compensation deleted successfully', 'success');
                    fetchCompensations();
               } else {
                    notify(response?.message || 'Unable to delete compensation.');
               }
          } catch (err) {
               notify('Error deleting compensation');
          }
     };

     const getCompensationValue = (comp: Compensation): string => {
          const amount = (value: number) => {
               try { return new Intl.NumberFormat('en-GH', { style: 'currency', currency: comp.currency || 'GHS' }).format(Number(value) || 0); }
               catch { return `${comp.currency || ''} ${(Number(value) || 0).toFixed(2)}`; }
          };
          if (comp.compensation_type === 'salary') return amount(comp.basic_salary || 0);
          if (comp.compensation_type === 'hourly') return `${amount(comp.hourly_rate || 0)}/hr`;
          if (comp.compensation_type === 'commission') return `${(Number(comp.commission_percentage) || 0).toFixed(1)}%`;
          if (comp.compensation_type === 'hybrid') return `${amount(comp.basic_salary || 0)} + ${(Number(comp.commission_percentage) || 0).toFixed(1)}%`;
          return 'N/A';
     };

     const handleExport = () => {
          const cell = (value: unknown) => {
               const text = String(value ?? '');
               const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
               return '"' + safe.replace(/"/g, '""') + '"';
          };
          const rows = [['Employee ID', 'Employee', 'Type', 'Salary level', 'Currency', 'Basic salary', 'Hourly rate', 'Commission %', 'Frequency', 'Status', 'Effective from', 'Effective to'],
               ...filteredCompensations.map(comp => [comp.employeeid, comp.employee_name, comp.compensation_type, comp.salary_grade, comp.currency, comp.basic_salary, comp.hourly_rate, comp.commission_percentage, comp.payment_frequency, comp.is_active ? 'Active' : 'Inactive', comp.effective_from, comp.effective_to])];
          const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
          const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'payroll-compensation.csv'; anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          notify(`Exported ${filteredCompensations.length} filtered compensation records.`, 'success');
     };

     const totalPages = Math.max(1, Math.ceil(filteredCompensations.length / itemsPerPage));
     const safeCurrentPage = Math.min(currentPage, totalPages);
     const startIndex = (safeCurrentPage - 1) * itemsPerPage;
     const paginatedCompensations = filteredCompensations.slice(startIndex, startIndex + itemsPerPage);

     if (loading) return <Loader />;

     return (
          <div className={ui.page}>
               {feedback}
               {loadError && <div role="alert" className="alert alert-danger d-flex justify-content-between gap-3"><span>{loadError}</span><button type="button" className="btn btn-outline-danger" onClick={fetchCompensations}>Retry records</button></div>}
               {/* Header */}
               <div className={ui.header}>
                    <div className="d-flex align-items-center">
                         
                         <div>
                              <span className={ui.eyebrow}>People & payroll</span><h1>Compensation Management</h1>
                              <p className="text-muted mb-0 small">
                                   {filteredCompensations.length} of {compensations.length} records
                              </p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <button className={ui.button} disabled={!!loadError || filteredCompensations.length === 0} onClick={handleExport}>
                              <RiDownloadLine size={18} className="me-1" />
                              Export
                         </button>
                         <Link href="/human-resource/payroll/compensation/create" className={ui.primary}>
                              <RiAddLine size={18} className="me-1" />
                              Add Compensation
                         </Link>
                    </div>
               </div>

               {/* Filters */}
               <div className={ui.panel}>
                    <div className="row g-3 p-3">
                         <div className="col-md-4">
                              <div className="input-group input-group-sm">
                                   <span className="input-group-text bg-transparent">
                                        <RiSearchLine size={16} />
                                   </span>
                                   <input
                                        type="text"
                                        className="form-control"
                                        aria-label="Search compensation records" placeholder="Search by employee, salary grade, bank, account..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                              </div>
                         </div>
                         <div className="col-md-2">
                              <select
                                   className="form-select form-select-sm"
                                   aria-label="Compensation status" value={statusFilter}
                                   onChange={(e) => setStatusFilter(e.target.value)}
                              >
                                   <option value="all">All Status</option>
                                   <option value="active">Active</option>
                                   <option value="inactive">Inactive</option>
                              </select>
                         </div>
                         <div className="col-md-2">
                              <select
                                   className="form-select form-select-sm"
                                   aria-label="Compensation type" value={typeFilter}
                                   onChange={(e) => setTypeFilter(e.target.value)}
                              >
                                   <option value="all">All Types</option>
                                   <option value="salary">Salary</option>
                                   <option value="hourly">Hourly</option>
                                   <option value="commission">Commission</option>
                                   <option value="hybrid">Hybrid</option>
                              </select>
                         </div>
                         <div className="col-md-2">
                              <select
                                   className="form-select form-select-sm"
                                   aria-label="Sort compensation records" value={sortBy}
                                   onChange={(e) => setSortBy(e.target.value as any)}
                              >
                                   <option value="date">Sort by Date</option>
                                   <option value="employee">Sort by Employee</option>
                                   <option value="salary">Sort by Value</option>
                              </select>
                         </div>
                         <div className="col-md-2">
                              <button
                                   className="btn btn-outline-secondary btn-sm w-100"
                                   onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                              >
                                   {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                              </button>
                         </div>
                    </div>
               </div>

               {/* Compensation List */}
               {filteredCompensations.length === 0 ? (
                    <div className="text-center py-5">
                         <RiMoneyDollarCircleLine size={48} className="text-muted mb-3" />
                         <h5 className="fw-medium mb-2">No Compensation Records Found</h5>
                         <p className="text-muted mb-3">
                              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                   ? 'Try adjusting your filters'
                                   : 'Start by adding your first compensation record'}
                         </p>
                         <Link href="/human-resource/payroll/compensation/create" className="btn btn-primary" style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                              <RiAddLine size={18} className="me-2" />
                              Add Compensation
                         </Link>
                    </div>
               ) : (
                    <>
                    <div className={ui.panel}><div className={ui.tableWrap}>
                         <table className={ui.table}>
                              <thead><tr><th>Employee</th><th>Pay structure</th><th className={ui.number}>Compensation</th><th>Payment method</th><th>Effective dates</th><th>Status</th><th className={ui.number}>Actions</th></tr></thead>
                              <tbody>{paginatedCompensations.map(comp=><tr key={comp.id}>
                                   <td><strong>{comp.employee_name || 'Employee'}</strong><small>Employee #{comp.employeeid}</small></td>
                                   <td><CompensationTypeBadge type={comp.compensation_type}/><small>{comp.salary_grade || 'No salary level'}</small></td>
                                   <td className={ui.number}><strong>{getCompensationValue(comp)}</strong><small>{getPaymentFrequencyLabel(comp.payment_frequency)}</small></td>
                                   <td>{getPaymentMethodLabel(comp.payment_method)}<small>{comp.payment_method==='bank_transfer' ? `${comp.bank_name || 'Bank'}${comp.bank_account_number ? ' · ending '+comp.bank_account_number.slice(-4) : ''}` : comp.payment_method==='mobile_money' ? `${comp.mobile_money_network || 'Mobile money'}${comp.mobile_money_number ? ' · ending '+comp.mobile_money_number.slice(-4) : ''}` : 'Paid directly'}</small></td>
                                   <td>{formatDate(comp.effective_from)}<small>{comp.effective_to ? `Until ${formatDate(comp.effective_to)}` : 'No end date'}</small></td>
                                   <td><span className={ui.status} data-status={comp.is_active?'approved':'inactive'}>{comp.is_active?'Active':'Inactive'}</span></td>
                                   <td><div className={ui.rowActions}><Link className={ui.button} href={`/human-resource/payroll/compensation/${comp.id}`} aria-label={`View compensation for ${comp.employee_name}`}>View</Link><Link className={ui.button} href={`/human-resource/payroll/compensation/${comp.id}/edit`} aria-label={`Edit compensation for ${comp.employee_name}`}>Edit</Link><button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Delete compensation for ${comp.employee_name}`} onClick={()=>handleDelete(comp.id)}><RiDeleteBinLine size={16}/></button></div></td>
                              </tr>)}</tbody>
                         </table>
                    </div></div>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mt-3">
                         <div className="text-muted small">
                              Showing {Math.min(startIndex + 1, filteredCompensations.length)}-
                              {Math.min(startIndex + itemsPerPage, filteredCompensations.length)} of {filteredCompensations.length} records
                         </div>
                         <nav aria-label="Compensation table pagination">
                              <ul className="pagination pagination-sm mb-0">
                                   <li className={`page-item ${safeCurrentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                             type="button"
                                             className="page-link"
                                             onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                             disabled={safeCurrentPage === 1}
                                        >
                                             Previous
                                        </button>
                                   </li>
                                   {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <li key={page} className={`page-item ${safeCurrentPage === page ? 'active' : ''}`}>
                                             <button
                                                  type="button"
                                                  className="page-link"
                                                  onClick={() => setCurrentPage(page)}
                                             >
                                                  {page}
                                             </button>
                                        </li>
                                   ))}
                                   <li className={`page-item ${safeCurrentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                             type="button"
                                             className="page-link"
                                             onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                             disabled={safeCurrentPage === totalPages}
                                        >
                                             Next
                                        </button>
                                   </li>
                              </ul>
                         </nav>
                    </div>
                    </>
               )}
          </div>
     );
}
