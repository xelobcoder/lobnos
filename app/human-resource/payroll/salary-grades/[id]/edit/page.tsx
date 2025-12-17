'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
     RiMoneyDollarCircleLine,
     RiArrowLeftLine,
     RiSaveLine,
     RiLoader4Line,
     RiFileTextLine,
     RiErrorWarningLine
} from '@remixicon/react';
import { customPost, customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';

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

export default function EditSalaryGradePage() {
     const params = useParams();
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [fetchLoading, setFetchLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const [formData, setFormData] = useState({
          grade_name: '',
          grade_level: '',
          min_salary: '',
          max_salary: '',
          description: '',
          currency: 'GHS',
          is_active: true
     });

     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
     const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([]);

     const gradeId = params?.id as string;

     useEffect(() => {
          fetchSalaryGrade();
          fetchSalaryGrades();
     }, [gradeId]);

     const fetchSalaryGrade = async () => {
          setFetchLoading(true);
          setError(null);

          try {
               const response = await customFetch(`payroll/salary-grades/${gradeId}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    const grade: SalaryGrade = response.result;
                    setFormData({
                         grade_name: grade.grade_name,
                         grade_level: grade.grade_level,
                         min_salary: grade.min_salary?.toString() || '',
                         max_salary: grade.max_salary?.toString() || '',
                         description: grade.description || '',
                         currency: grade.currency,
                         is_active: grade.is_active
                    });
               } else {
                    setError(response?.message || 'Failed to load salary grade');
               }
          } catch (err) {
               setError('An error occurred while loading the salary grade');
               console.error('Error fetching salary grade:', err);
          } finally {
               setFetchLoading(false);
          }
     };

     const fetchSalaryGrades = async () => {
          try {
               const response = await customFetch('payroll/salary-grades');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setSalaryGrades(response.result || []);
               }
          } catch (error) {
               console.error('Error fetching salary grades:', error);
          }
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;

          setFormData(prev => ({
               ...prev,
               [name]: type === 'checkbox' ? checked : value
          }));

          // Clear validation error when user starts typing
          if (validationErrors[name]) {
               setValidationErrors(prev => ({
                    ...prev,
                    [name]: ''
               }));
          }
     };

     const validateForm = (): boolean => {
          const errors: Record<string, string> = {};

          if (!formData.grade_name.trim()) {
               errors.grade_name = 'Grade name is required';
          }

          if (!formData.grade_level.trim()) {
               errors.grade_level = 'Grade level is required';
          }

          const minSalary = parseFloat(formData.min_salary);
          const maxSalary = parseFloat(formData.max_salary);

          if (formData.min_salary && isNaN(minSalary)) {
               errors.min_salary = 'Minimum salary must be a valid number';
          }

          if (formData.max_salary && isNaN(maxSalary)) {
               errors.max_salary = 'Maximum salary must be a valid number';
          }

          if (formData.min_salary && formData.max_salary && minSalary >= maxSalary) {
               errors.max_salary = 'Maximum salary must be greater than minimum salary';
          }

          if (!formData.currency) {
               errors.currency = 'Currency is required';
          }

          setValidationErrors(errors);
          return Object.keys(errors).length === 0;
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!validateForm()) {
               return;
          }

          setLoading(true);
          setError(null);

          try {
               const payload = {
                    ...formData,
                    min_salary: formData.min_salary ? parseFloat(formData.min_salary) : null,
                    max_salary: formData.max_salary ? parseFloat(formData.max_salary) : null
               };

               const response = await customPost(`payroll/salary-grades/${gradeId}`, 'PUT', payload);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    router.push(`/human-resource/payroll/salary-grades/${gradeId}`);
               } else {
                    setError(response?.message || 'Failed to update salary grade');
               }
          } catch (err) {
               setError('An error occurred while updating the salary grade');
               console.error('Error updating salary grade:', err);
          } finally {
               setLoading(false);
          }
     };

     if (fetchLoading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading salary grade...</p>
                    </div>
               </div>
          );
     }

     if (error && !formData.grade_name) {
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
               <div className="d-flex align-items-center mb-4">
                    <Link
                         href={`/human-resource/payroll/salary-grades/${gradeId}`}
                         className="btn btn-outline-secondary me-3 d-flex align-items-center"
                    >
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div>
                         <h1 className="h3 mb-1">Edit Salary Grade</h1>
                         <p className="text-muted mb-0">Update salary grade information</p>
                    </div>
               </div>

               {/* Error Message */}
               {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                         <RiErrorWarningLine size={20} className="me-2" />
                         {error}
                    </div>
               )}

               {/* Form */}
               <div className="row ">
                    <div className="">
                         <div className="card">
                              <div className="card-header bg-light">
                                   <h5 className="mb-0 d-flex align-items-center">
                                        <RiMoneyDollarCircleLine size={20} className="me-2" />
                                        Grade Information
                                   </h5>
                              </div>
                              <div className="card-body">
                                   <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                             {/* Grade Name */}
                                             <div className="col-md-6">
                                                  <label htmlFor="grade_name" className="form-label fw-medium">
                                                       Grade Name <span className="text-danger">*</span>
                                                  </label>
                                                  <input
                                                       type="text"
                                                       id="grade_name"
                                                       name="grade_name"
                                                       className={`form-control ${validationErrors.grade_name ? 'is-invalid' : ''}`}
                                                       value={formData.grade_name}
                                                       onChange={handleChange}
                                                       placeholder="e.g., Senior Software Engineer"
                                                       required
                                                  />
                                                  {validationErrors.grade_name && (
                                                       <div className="invalid-feedback">{validationErrors.grade_name}</div>
                                                  )}
                                             </div>

                                             {/* Grade Level */}
                                             <div className="col-md-6">
                                                  <label htmlFor="grade_level" className="form-label fw-medium">
                                                       Grade Level <span className="text-danger">*</span>
                                                  </label>
                                                  <select
                                                       id="grade_level"
                                                       name="grade_level"
                                                       className={`form-select ${validationErrors.grade_level ? 'is-invalid' : ''}`}
                                                       value={formData.grade_level}
                                                       onChange={handleChange}
                                                       required
                                                  >
                                                       <option value="">Select a grade level...</option>
                                                       {/* Get unique grade levels from existing salary grades */}
                                                       {Array.from(new Set(salaryGrades.map(grade => grade.grade_level)))
                                                            .sort()
                                                            .map(level => (
                                                                 <option key={level} value={level}>
                                                                      {level}
                                                                 </option>
                                                            ))}
                                                       {/* Allow custom entry if current value is not in the list */}
                                                       {formData.grade_level && !Array.from(new Set(salaryGrades.map(grade => grade.grade_level))).includes(formData.grade_level) && (
                                                            <option value={formData.grade_level}>
                                                                 {formData.grade_level} (Current)
                                                            </option>
                                                       )}
                                                  </select>
                                                  {validationErrors.grade_level && (
                                                       <div className="invalid-feedback">{validationErrors.grade_level}</div>
                                                  )}
                                             </div>

                                             {/* Minimum Salary */}
                                             <div className="col-md-6">
                                                  <label htmlFor="min_salary" className="form-label fw-medium">
                                                       Minimum Salary
                                                  </label>
                                                  <div className="input-group">
                                                       <span className="input-group-text">₵</span>
                                                       <input
                                                            type="number"
                                                            id="min_salary"
                                                            name="min_salary"
                                                            className={`form-control ${validationErrors.min_salary ? 'is-invalid' : ''}`}
                                                            value={formData.min_salary}
                                                            onChange={handleChange}
                                                            placeholder="0.00"
                                                            min="0"
                                                            step="0.01"
                                                       />
                                                       {validationErrors.min_salary && (
                                                            <div className="invalid-feedback">{validationErrors.min_salary}</div>
                                                       )}
                                                  </div>
                                             </div>

                                             {/* Maximum Salary */}
                                             <div className="col-md-6">
                                                  <label htmlFor="max_salary" className="form-label fw-medium">
                                                       Maximum Salary
                                                  </label>
                                                  <div className="input-group">
                                                       <span className="input-group-text">₵</span>
                                                       <input
                                                            type="number"
                                                            id="max_salary"
                                                            name="max_salary"
                                                            className={`form-control ${validationErrors.max_salary ? 'is-invalid' : ''}`}
                                                            value={formData.max_salary}
                                                            onChange={handleChange}
                                                            placeholder="0.00"
                                                            min="0"
                                                            step="0.01"
                                                       />
                                                       {validationErrors.max_salary && (
                                                            <div className="invalid-feedback">{validationErrors.max_salary}</div>
                                                       )}
                                                  </div>
                                             </div>

                                             {/* Currency */}
                                             <div className="col-md-6">
                                                  <label htmlFor="currency" className="form-label fw-medium">
                                                       Currency <span className="text-danger">*</span>
                                                  </label>
                                                  <select
                                                       id="currency"
                                                       name="currency"
                                                       className={`form-select ${validationErrors.currency ? 'is-invalid' : ''}`}
                                                       value={formData.currency}
                                                       onChange={handleChange}
                                                       required
                                                  >
                                                       <option value="GHS">GHS (Ghanaian Cedi)</option>
                                                       <option value="USD">USD (US Dollar)</option>
                                                       <option value="EUR">EUR (Euro)</option>
                                                       <option value="GBP">GBP (British Pound)</option>
                                                  </select>
                                                  {validationErrors.currency && (
                                                       <div className="invalid-feedback">{validationErrors.currency}</div>
                                                  )}
                                             </div>

                                             {/* Active Status */}
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Status</label>
                                                  <div className="form-check form-switch">
                                                       <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="is_active"
                                                            name="is_active"
                                                            checked={formData.is_active}
                                                            onChange={handleChange}
                                                       />
                                                       <label className="form-check-label" htmlFor="is_active">
                                                            {formData.is_active ? 'Active' : 'Inactive'}
                                                       </label>
                                                  </div>
                                             </div>

                                             {/* Description */}
                                             <div className="col-12">
                                                  <label htmlFor="description" className="form-label fw-medium">
                                                       Description
                                                  </label>
                                                  <textarea
                                                       id="description"
                                                       name="description"
                                                       className="form-control"
                                                       rows={3}
                                                       value={formData.description}
                                                       onChange={handleChange}
                                                       placeholder="Describe the responsibilities, requirements, and expectations for this grade level..."
                                                  />
                                             </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                                             <Link
                                                  href={`/human-resource/payroll/salary-grades/${gradeId}`}
                                                  className="btn btn-outline-secondary"
                                             >
                                                  Cancel
                                             </Link>
                                             <button
                                                  type="submit"
                                                  className="btn btn-primary d-flex align-items-center"
                                                  disabled={loading}
                                                  style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                             >
                                                  {loading ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-2 animate-spin" />
                                                            Updating...
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-2" />
                                                            Update Grade
                                                       </>
                                                  )}
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}