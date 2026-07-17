'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
     RiMoneyDollarCircleLine,
     RiSearchLine,
     RiFilterLine,
     RiAddLine,
     RiEyeLine,
     RiEditLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiCheckboxCircleLine,
     RiCloseCircleLine,
     RiEyeOffLine
} from '@remixicon/react';

interface SalaryGrade {
     id: number;
     grade_name: string;
     grade_level: string;
     role_name: string | null;
     min_salary: number | null;
     max_salary: number | null;
     description: string | null;
     currency: string;
     is_active: boolean;
     created_at: string;
     updated_at: string;
     created_by: number | null;
     updated_by: number | null;
}

interface SalaryGradeSummary {
     total_grades: number;
     active_grades: number;
     inactive_grades: number;
     average_min_salary: number;
     average_max_salary: number;
}

export default function SalaryGradesPage() {
     const [grades, setGrades] = useState<SalaryGrade[]>([]);
     const [filteredGrades, setFilteredGrades] = useState<SalaryGrade[]>([]);
     const [summary, setSummary] = useState<SalaryGradeSummary | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
     const { applicationsettings } = useApplicationSettings();
     const { user, company } = applicationsettings;

     useEffect(() => {
          fetchSalaryGrades();
     }, []);

     useEffect(() => {
          filterGrades();
     }, [grades, searchTerm, statusFilter]);

     const fetchSalaryGrades = async () => {
          try {
               setLoading(true);
               setError(null);

               // Fetch salary grades
               const response = await customFetch('payroll/salary-grades?activeOnly=false');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setGrades(response.result || []);
               } else {
                    setError('Failed to load salary grades');
               }

               // Calculate summary
               calculateSummary(response.result || []);

          } catch (err) {
               setError('An error occurred while loading salary grades');
               console.error('Error fetching salary grades:', err);
          } finally {
               setLoading(false);
          }
     };

     const calculateSummary = (gradesData: SalaryGrade[]) => {
          const total_grades = gradesData.length;
          const active_grades = gradesData.filter(g => g.is_active).length;
          const inactive_grades = total_grades - active_grades;

          const activeGrades = gradesData.filter(g => g.is_active && g.min_salary && g.max_salary);
          const average_min_salary = activeGrades.length > 0
               ? activeGrades.reduce((sum, g) => sum + (g.min_salary || 0), 0) / activeGrades.length
               : 0;
          const average_max_salary = activeGrades.length > 0
               ? activeGrades.reduce((sum, g) => sum + (g.max_salary || 0), 0) / activeGrades.length
               : 0;

          setSummary({
               total_grades,
               active_grades,
               inactive_grades,
               average_min_salary,
               average_max_salary
          });
     };

     const filterGrades = () => {
          let filtered = grades;

          // Search filter
          if (searchTerm) {
               filtered = filtered.filter(grade =>
                    grade.grade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    grade.grade_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (grade.role_name && grade.role_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (grade.description && grade.description.toLowerCase().includes(searchTerm.toLowerCase()))
               );
          }

          // Status filter
          if (statusFilter === 'active') {
               filtered = filtered.filter(grade => grade.is_active);
          } else if (statusFilter === 'inactive') {
               filtered = filtered.filter(grade => !grade.is_active);
          }

          setFilteredGrades(filtered);
     };

     const formatCurrency = (amount: number | null) => {
          if (!amount) return 'N/A';
          return new Intl.NumberFormat('en-GH', {
               style: 'currency',
               currency: 'GHS'
          }).format(amount);
     };

     const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-GB', {
               day: '2-digit',
               month: '2-digit',
               year: 'numeric'
          });
     };

     const getStatusBadge = (isActive: boolean) => {
          return isActive ? (
               <span className="badge bg-success-subtle text-success border border-success-subtle">
                    <RiCheckboxCircleLine size={14} className="me-1" />
                    Active
               </span>
          ) : (
               <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                    <RiCloseCircleLine size={14} className="me-1" />
                    Inactive
               </span>
          );
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: 'var(--bs-primary)' }} />
                         <p className="text-muted">Loading salary grades...</p>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error}</p>
                         <button className="btn btn-primary" onClick={fetchSalaryGrades}>
                              Try Again
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4">
                    <div>
                         <h1 className="h3 mb-1">Salary Grades</h1>
                         <p className="text-muted mb-0">Manage organizational salary grade structure</p>
                    </div>
                    <Link href="/human-resource/payroll/salary-grades/create" className="btn btn-primary d-flex align-items-center">
                         <RiAddLine size={18} className="me-2" />
                         Create Grade
                    </Link>
               </div>

               {/* Summary Cards */}
               {summary && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded h-100">
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <RiMoneyDollarCircleLine size={20} className="text-primary me-2" />
                                             <span className="fw-medium text-muted">Total Grades</span>
                                        </div>
                                        <h3 className="mb-0">{summary.total_grades}</h3>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded h-100">
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <RiCheckboxCircleLine size={20} className="text-success me-2" />
                                             <span className="fw-medium text-muted">Active Grades</span>
                                        </div>
                                        <h3 className="mb-0">{summary.active_grades}</h3>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded h-100">
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <RiEyeOffLine size={20} className="text-warning me-2" />
                                             <span className="fw-medium text-muted">Inactive Grades</span>
                                        </div>
                                        <h3 className="mb-0">{summary.inactive_grades}</h3>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded h-100">
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <RiMoneyDollarCircleLine size={20} className="text-info me-2" />
                                             <span className="fw-medium text-muted">Avg. Max Salary</span>
                                        </div>
                                        <h3 className="mb-0">{formatCurrency(summary.average_max_salary)}</h3>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Filters */}
               <div className="card mb-4">
                    <div className="card-body">
                         <div className="row g-3">
                              <div className="col-md-6">
                                   <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                             <RiSearchLine size={18} className="text-muted" />
                                        </span>
                                        <input
                                             type="text"
                                             className="form-control border-start-0 shadow-none"
                                             placeholder="Search grades by name, level, or description..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <select
                                        className="form-select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                   >
                                        <option value="all">All Status</option>
                                        <option value="active">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                   </select>
                              </div>
                              <div className="col-md-3">
                                   <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={() => {
                                             setSearchTerm('');
                                             setStatusFilter('all');
                                        }}
                                   >
                                        <RiFilterLine size={18} className="me-2" />
                                        Clear Filters
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Grades Table */}
               <div className="card">
                    <div className="card-header bg-light">
                         <h5 className="mb-0">Salary Grades ({filteredGrades.length})</h5>
                    </div>
                    <div className="card-body p-0">
                         {filteredGrades.length === 0 ? (
                              <div className="text-center py-5">
                                   <RiMoneyDollarCircleLine size={48} className="text-muted mb-3" />
                                   <h5 className="text-muted">No salary grades found</h5>
                                   <p className="text-muted mb-3">
                                        {searchTerm || statusFilter !== 'all'
                                             ? 'Try adjusting your search or filter criteria.'
                                             : 'Get started by creating your first salary grade.'
                                        }
                                   </p>
                                   {!searchTerm && statusFilter === 'all' && (
                                        <Link href="/human-resource/payroll/salary-grades/create" className="btn btn-primary">
                                             <RiAddLine size={18} className="me-2" />
                                             Create First Grade
                                        </Link>
                                   )}
                              </div>
                         ) : (
                              <div className="table-responsive">
                                   <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="border-0 fw-medium">Grade Name</th>
                                                  <th className="border-0 fw-medium">Level</th>
                                                  <th className="border-0 fw-medium">Role</th>
                                                  <th className="border-0 fw-medium">Salary Range</th>
                                                  <th className="border-0 fw-medium">Currency</th>
                                                  <th className="border-0 fw-medium">Status</th>
                                                  <th className="border-0 fw-medium">Created</th>
                                                  <th className="border-0 fw-medium text-center">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {filteredGrades.map((grade) => (
                                                  <tr key={grade.id}>
                                                       <td>
                                                            <div>
                                                                 <div className="fw-medium">{grade.grade_name}</div>
                                                                 {grade.description && (
                                                                      <small className="text-muted">{grade.description}</small>
                                                                 )}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            <span className="badge bg-secondary-subtle text-secondary">
                                                                 {grade.grade_level}
                                                            </span>
                                                       </td>
                                                       <td>
                                                            {grade.role_name ? (
                                                                 <span className="badge bg-primary-subtle text-primary">{grade.role_name}</span>
                                                            ) : (
                                                                 <span className="text-muted small">Unmapped</span>
                                                            )}
                                                       </td>
                                                       <td>
                                                            {grade.min_salary && grade.max_salary ? (
                                                                 <span>
                                                                      {formatCurrency(grade.min_salary)} - {formatCurrency(grade.max_salary)}
                                                                 </span>
                                                            ) : grade.min_salary ? (
                                                                 <span>From {formatCurrency(grade.min_salary)}</span>
                                                            ) : grade.max_salary ? (
                                                                 <span>Up to {formatCurrency(grade.max_salary)}</span>
                                                            ) : (
                                                                 <span className="text-muted">Not specified</span>
                                                            )}
                                                       </td>
                                                       <td>
                                                            <span className="badge bg-info-subtle text-info">
                                                                 {grade.currency}
                                                            </span>
                                                       </td>
                                                       <td>{getStatusBadge(grade.is_active)}</td>
                                                       <td>
                                                            <small className="text-muted">
                                                                 {formatDate(grade.created_at)}
                                                            </small>
                                                       </td>
                                                       <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                 <Link
                                                                      href={`/human-resource/payroll/salary-grades/${grade.id}`}
                                                                      className="btn btn-sm btn-outline-primary"
                                                                      title="View Details"
                                                                 >
                                                                      <RiEyeLine size={16} />
                                                                 </Link>
                                                                 <Link
                                                                      href={`/human-resource/payroll/salary-grades/${grade.id}/edit`}
                                                                      className="btn btn-sm btn-outline-secondary"
                                                                      title="Edit Grade"
                                                                 >
                                                                      <RiEditLine size={16} />
                                                                 </Link>
                                                            </div>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}