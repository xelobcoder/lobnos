'use client';

import { RiMoneyDollarCircleLine, RiDownloadLine, RiAddLine, RiSearchLine, RiEyeLine, RiEditLine, RiDeleteBinLine } from "@remixicon/react";
import Link from "next/link";
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

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function CompensationListPage() {
     const [compensations, setCompensations] = useState<Compensation[]>([]);
     const [filteredCompensations, setFilteredCompensations] = useState<Compensation[]>([]);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeeMap, setEmployeeMap] = useState<Map<number, Employee>>(new Map());
     const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([]);
     const [salaryGradeMap, setSalaryGradeMap] = useState<Map<number, SalaryGrade>>(new Map());
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState<string>('all');
     const [typeFilter, setTypeFilter] = useState<string>('all');
     const [sortBy, setSortBy] = useState<'employee' | 'salary' | 'date'>('date');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

     useEffect(() => {
          fetchCompensations();
     }, []);

     useEffect(() => {
          applyFilters();
     }, [compensations, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

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
               }
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
               filtered = filtered.filter(comp => comp.is_active === isActiveFilter);
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
                    alert('Compensation deleted successfully');
                    fetchCompensations();
               }
          } catch (err) {
               alert('Error deleting compensation');
          }
     };

     const getCompensationValue = (comp: Compensation): string => {
          if (comp.compensation_type === 'salary') {
               return `${comp.currency} ${currencyFormatter.format(comp.basic_salary || 0)}`;
          } else if (comp.compensation_type === 'hourly') {
               return `${comp.currency} ${currencyFormatter.format(comp.hourly_rate || 0)}/hr`;
          } else if (comp.compensation_type === 'commission') {
               return `${(Number(comp.commission_percentage) || 0).toFixed(1)}%`;
          } else if (comp.compensation_type === 'hybrid') {
               return `${comp.currency} ${currencyFormatter.format(comp.basic_salary || 0)} + ${(Number(comp.commission_percentage) || 0).toFixed(1)}%`;
          }
          return 'N/A';
     };

     const handleExport = () => {
          // Placeholder for CSV export functionality
          alert('Export functionality will be implemented');
     };

     if (loading) return <Loader />;

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                         <RiMoneyDollarCircleLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Compensation Management</h1>
                              <p className="text-muted mb-0 small">
                                   {filteredCompensations.length} of {compensations.length} records
                              </p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
                              <RiDownloadLine size={18} className="me-1" />
                              Export
                         </button>
                         <Link href="/human-resource/payroll/compensation/create" className="btn btn-primary btn-sm" style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                              <RiAddLine size={18} className="me-1" />
                              Add Compensation
                         </Link>
                    </div>
               </div>

               {/* Filters */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="row g-3">
                         <div className="col-md-4">
                              <div className="input-group input-group-sm">
                                   <span className="input-group-text bg-transparent">
                                        <RiSearchLine size={16} />
                                   </span>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by employee, salary grade, bank, account..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                              </div>
                         </div>
                         <div className="col-md-2">
                              <select
                                   className="form-select form-select-sm"
                                   value={statusFilter}
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
                                   value={typeFilter}
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
                                   value={sortBy}
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
                    <div className="table-responsive">
                         <table className="table table-hover align-middle">
                              <thead className="table-light">
                                   <tr>
                                        <th>Employee ID</th>
                                        <th>Employee Name</th>
                                        <th>Type</th>
                                        <th>Salary Grade</th>
                                        <th>Value</th>
                                        <th>Frequency</th>
                                        <th>Payment Method</th>
                                        <th>Bank Details</th>
                                        <th>Status</th>
                                        <th>Effective From</th>
                                        <th className="text-end">Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {filteredCompensations.map((comp) => (
                                        <tr key={comp.id}>
                                             <td className="fw-medium">{comp.employeeid}</td>
                                             <td>{comp.employee_name || 'N/A'}</td>
                                             <td>
                                                  <CompensationTypeBadge type={comp.compensation_type} />
                                             </td>
                                             <td>
                                                  {comp.salary_grade ? (
                                                       <span className="badge bg-info-subtle text-info">
                                                            {comp.salary_grade}
                                                       </span>
                                                  ) : (
                                                       <span className="text-muted">—</span>
                                                  )}
                                             </td>
                                             <td className="fw-bold">{getCompensationValue(comp)}</td>
                                             <td>{getPaymentFrequencyLabel(comp.payment_frequency)}</td>
                                             <td>{getPaymentMethodLabel(comp.payment_method)}</td>
                                             <td>
                                                  {comp.payment_method === 'bank_transfer' ? (
                                                       <div className="small">
                                                            <div className="fw-medium">{comp.bank_name || 'N/A'}</div>
                                                            <div className="text-muted">{comp.bank_account_number || 'N/A'}</div>
                                                       </div>
                                                  ) : comp.payment_method === 'mobile_money' ? (
                                                       <div className="small">
                                                            <div className="fw-medium">{comp.mobile_money_network || 'N/A'}</div>
                                                            <div className="text-muted">{comp.mobile_money_number || 'N/A'}</div>
                                                       </div>
                                                  ) : (
                                                       <span className="text-muted">—</span>
                                                  )}
                                             </td>
                                             <td>
                                                  <CompensationStatusBadge isActive={comp.is_active} />
                                             </td>
                                             <td>{formatDate(comp.effective_from)}</td>
                                             <td>
                                                  <div className="d-flex gap-1 justify-content-end">
                                                       <Link
                                                            href={`/human-resource/payroll/compensation/${comp.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="View Details"
                                                       >
                                                            <RiEyeLine size={16} />
                                                       </Link>
                                                       <Link
                                                            href={`/human-resource/payroll/compensation/${comp.id}/edit`}
                                                            className="btn btn-sm btn-outline-secondary"
                                                            title="Edit"
                                                       >
                                                            <RiEditLine size={16} />
                                                       </Link>
                                                       <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(comp.id)}
                                                            title="Delete"
                                                       >
                                                            <RiDeleteBinLine size={16} />
                                                       </button>
                                                  </div>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               )}
          </div>
     );
}
