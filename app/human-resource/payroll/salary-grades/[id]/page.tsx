'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
     RiMoneyDollarCircleLine,
     RiArrowLeftLine,
     RiEditLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiCloseCircleLine,
     RiFileTextLine,
     RiCalendarLine,
     RiUserLine
} from '@remixicon/react';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../components/Auth/customFetch';
interface SalaryGrade {
     id: number;
     grade_name: string;
     grade_level: string;
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

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function SalaryGradeDetailPage() {
     const params = useParams();
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [grade, setGrade] = useState<SalaryGrade | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const gradeId = params?.id as string;

     useEffect(() => {
          fetchSalaryGrade();
     }, [gradeId]);

     const fetchSalaryGrade = async () => {
          setLoading(true);
          setError(null);

          try {
               const response = await customFetch(`payroll/salary-grades/${gradeId}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setGrade(response.result);
               } else {
                    setError(response?.message || 'Failed to load salary grade');
               }
          } catch (err) {
               setError('An error occurred while loading the salary grade');
               console.error('Error fetching salary grade:', err);
          } finally {
               setLoading(false);
          }
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
               month: 'short',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     const getStatusBadge = (isActive: boolean) => {
          return isActive ? (
               <span className="badge bg-success d-flex align-items-center gap-1 fs-6 px-3 py-2">
                    Active
               </span>
          ) : (
               <span className="badge bg-danger d-flex align-items-center gap-1 fs-6 px-3 py-2">
                    <RiCloseCircleLine size={16} />
                    Inactive
               </span>
          );
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading salary grade...</p>
                    </div>
               </div>
          );
     }

     if (error || !grade) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Salary Grade</h5>
                         <p className="text-muted px-3">{error}</p>
                         <div className="d-flex gap-2">
                              <button className="btn btn-primary" onClick={fetchSalaryGrade}>
                                   Try Again
                              </button>
                              <Link href="/human-resource/payroll/salary-grades" className="btn btn-outline-secondary">
                                   Back to Grades
                              </Link>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4">
                    <div className="d-flex align-items-center mb-3 mb-lg-0">
                         <Link
                              href="/human-resource/payroll/salary-grades"
                              className="btn btn-outline-secondary me-3 d-flex align-items-center"
                         >
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <h1 className="h3 mb-1">{grade.grade_name}</h1>
                              <p className="text-muted mb-0">Grade Level: {grade.grade_level}</p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <Link
                              href={`/human-resource/payroll/salary-grades/${grade.id}/edit`}
                              className="btn btn-primary d-flex align-items-center"
                              style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                         >
                              <RiEditLine size={18} className="me-2" />
                              Edit Grade
                         </Link>
                    </div>
               </div>

               {/* Status Badge */}
               <div className="mb-4">
                    {getStatusBadge(grade.is_active)}
               </div>

               {/* Grade Information */}
               <div className="row g-4">
                    {/* Basic Information */}
                    <div className="col-lg-8">
                         <div className="card">
                              <div className="card-header bg-light">
                                   <h5 className="mb-0 d-flex align-items-center">
                                        <RiMoneyDollarCircleLine size={20} className="me-2" />
                                        Grade Information
                                   </h5>
                              </div>
                              <div className="card-body">
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiFileTextLine size={18} className="text-primary me-2" />
                                                       <span className="fw-medium text-muted">Grade Name</span>
                                                  </div>
                                                  <h6 className="mb-0">{grade.grade_name}</h6>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiMoneyDollarCircleLine size={18} className="text-success me-2" />
                                                       <span className="fw-medium text-muted">Grade Level</span>
                                                  </div>
                                                  <h6 className="mb-0">{grade.grade_level}</h6>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiMoneyDollarCircleLine size={18} className="text-info me-2" />
                                                       <span className="fw-medium text-muted">Minimum Salary</span>
                                                  </div>
                                                  <h6 className="mb-0">{formatCurrency(grade.min_salary)}</h6>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiMoneyDollarCircleLine size={18} className="text-warning me-2" />
                                                       <span className="fw-medium text-muted">Maximum Salary</span>
                                                  </div>
                                                  <h6 className="mb-0">{formatCurrency(grade.max_salary)}</h6>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiMoneyDollarCircleLine size={18} className="text-secondary me-2" />
                                                       <span className="fw-medium text-muted">Currency</span>
                                                  </div>
                                                  <h6 className="mb-0">{grade.currency}</h6>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <span className="fw-medium text-muted">Status</span>
                                                  </div>
                                                  <h6 className="mb-0">{grade.is_active ? 'Active' : 'Inactive'}</h6>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Description */}
                                   {grade.description && (
                                        <div className="mt-4">
                                             <h6 className="fw-medium mb-3 d-flex align-items-center">
                                                  <RiFileTextLine size={18} className="me-2" />
                                                  Description
                                             </h6>
                                             <div className="border rounded p-3 bg-light">
                                                  <p className="mb-0">{grade.description}</p>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Audit Information */}
                    <div className="col-lg-4">
                         <div className="card">
                              <div className="card-header bg-light">
                                   <h5 className="mb-0 d-flex align-items-center">
                                        <RiCalendarLine size={20} className="me-2" />
                                        Audit Information
                                   </h5>
                              </div>
                              <div className="card-body">
                                   <div className="d-flex flex-column gap-3">
                                        <div>
                                             <div className="d-flex align-items-center mb-2">
                                                  <RiCalendarLine size={16} className="text-muted me-2" />
                                                  <span className="fw-medium text-muted small">Created</span>
                                             </div>
                                             <p className="mb-0 small">{formatDate(grade.created_at)}</p>
                                        </div>

                                        <div>
                                             <div className="d-flex align-items-center mb-2">
                                                  <RiCalendarLine size={16} className="text-muted me-2" />
                                                  <span className="fw-medium text-muted small">Last Updated</span>
                                             </div>
                                             <p className="mb-0 small">{formatDate(grade.updated_at)}</p>
                                        </div>

                                        {grade.created_by && (
                                             <div>
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiUserLine size={16} className="text-muted me-2" />
                                                       <span className="fw-medium text-muted small">Created By</span>
                                                  </div>
                                                  <p className="mb-0 small">Employee ID: {grade.created_by}</p>
                                             </div>
                                        )}

                                        {grade.updated_by && (
                                             <div>
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiUserLine size={16} className="text-muted me-2" />
                                                       <span className="fw-medium text-muted small">Updated By</span>
                                                  </div>
                                                  <p className="mb-0 small">Employee ID: {grade.updated_by}</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}