'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { customPost, customFetch, currencyFormatter } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import {
     RiMoneyDollarCircleLine,
     RiArrowLeftLine,
     RiSaveLine,
     RiLoader4Line
} from '@remixicon/react';

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

export interface ICompensation {
     id?: number;
     employeeid: number;
     compensation_type: 'salary' | 'hourly' | 'commission' | 'hybrid';
     basic_salary?: number;
     salary_grade?: string;
     salary_grade_id?: number;
     currency?: string;
     hourly_rate?: number;
     overtime_rate_multiplier?: number;
     commission_percentage?: number;
     commission_target?: number;
     payment_frequency: 'monthly' | 'bi-weekly' | 'weekly';
     payment_method: 'bank_transfer' | 'cash' | 'cheque' | 'mobile_money';
     bank_account_number?: string;
     bank_name?: string;
     bank_branch?: string;
     mobile_money_number?: string;
     effective_from: string;
     effective_to?: string;
     is_active: boolean;
     created_by?: number;
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

// Zod validation schema
const compensationSchema = z.object({
     employeeid: z.number().positive('Employee ID must be a positive number'),
     compensation_type: z.enum(['salary', 'hourly', 'commission', 'hybrid']),
     basic_salary: z.number().positive().optional(),
     salary_grade: z.string().max(50, 'Salary grade cannot exceed 50 characters').optional(),
     currency: z.string().max(3, 'Currency code cannot exceed 3 characters').optional(),
     hourly_rate: z.number().positive().optional(),
     overtime_rate_multiplier: z.number().min(1, 'Overtime rate multiplier must be at least 1').max(5, 'Overtime rate multiplier cannot exceed 5').optional(),
     commission_percentage: z.number().min(0, 'Commission percentage cannot be negative').max(100, 'Commission percentage cannot exceed 100%').optional(),
     commission_target: z.number().positive().optional(),
     payment_frequency: z.enum(['monthly', 'bi-weekly', 'weekly']),
     payment_method: z.enum(['bank_transfer', 'cash', 'cheque', 'mobile_money']),
     bank_account_number: z.string().optional(),
     bank_name: z.string().optional(),
     bank_branch: z.string().optional(),
     mobile_money_number: z.string().optional(),
     effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective from date must be in YYYY-MM-DD format'),
     effective_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective to date must be in YYYY-MM-DD format').optional(),
     is_active: z.boolean(),
     created_by: z.number().positive('Created by must be a positive number').optional()
}).refine((data) => {
     if (['salary', 'hybrid'].includes(data.compensation_type)) {
          return data.basic_salary !== undefined && data.basic_salary > 0;
     }
     return true;
}, {
     message: 'Basic salary is required for salary/hybrid compensation',
     path: ['basic_salary']
}).refine((data) => {
     if (['hourly', 'hybrid'].includes(data.compensation_type)) {
          return data.hourly_rate !== undefined && data.hourly_rate > 0;
     }
     return true;
}, {
     message: 'Hourly rate is required for hourly/hybrid compensation',
     path: ['hourly_rate']
}).refine((data) => {
     if (['commission', 'hybrid'].includes(data.compensation_type)) {
          return data.commission_percentage !== undefined && data.commission_percentage >= 0 && data.commission_percentage <= 100;
     }
     return true;
}, {
     message: 'Commission percentage is required for commission/hybrid compensation',
     path: ['commission_percentage']
}).refine((data) => {
     if (data.payment_method === 'bank_transfer') {
          return data.bank_account_number && data.bank_account_number.trim() !== '' &&
               data.bank_name && data.bank_name.trim() !== '' &&
               data.bank_branch && data.bank_branch.trim() !== '';
     }
     return true;
}, {
     message: 'Bank details are required for bank transfer payment method',
     path: ['bank_account_number']
}).refine((data) => {
     if (data.payment_method === 'mobile_money') {
          return data.mobile_money_number && data.mobile_money_number.trim() !== '';
     }
     return true;
}, {
     message: 'Mobile money number is required for mobile money payment method',
     path: ['mobile_money_number']
}).refine((data) => {
     if (data.effective_to && data.effective_from) {
          const from = new Date(data.effective_from);
          const to = new Date(data.effective_to);
          return to > from;
     }
     return true;
}, {
     message: 'Effective to date must be after effective from date',
     path: ['effective_to']
});

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function CreateCompensationPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([]);
     const [salaryGradesLoading, setSalaryGradesLoading] = useState(true);
     const [formData, setFormData] = useState({
          employeeid: '',
          compensation_type: 'salary',
          basic_salary: '',
          salary_grade: '',
          salary_grade_id: '',
          currency: 'GHS',
          hourly_rate: '',
          overtime_rate_multiplier: '1.5',
          commission_percentage: '',
          commission_target: '',
          payment_frequency: 'monthly',
          payment_method: 'bank_transfer',
          bank_account_number: '',
          bank_name: '',
          bank_branch: '',
          mobile_money_number: '',
          mobile_money_network: '',
          is_active: true,
          effective_from: new Date().toISOString().split('T')[0],
          effective_to: '',
          notes: ''
     });

     const getSelectedEmployee = () => {
          return employees.find(emp => emp.employeeid.toString() === formData.employeeid);
     };

     const selectedEmployee = getSelectedEmployee();

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value } = e.target;
          setFormData(prev => ({
               ...prev,
               [name]: value
          }));
     };

     useEffect(() => {
          fetchEmployees();
          fetchSalaryGrades();
     }, []);

     const fetchEmployees = async () => {
          setEmployeesLoading(true);
          try {
               const response = await customFetch('logins');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployees(response.result || []);
               }
          } catch (error) {
               console.error('Error fetching employees:', error);
               setEmployees([]);
          } finally {
               setEmployeesLoading(false);
          }
     };

     const fetchSalaryGrades = async () => {
          setSalaryGradesLoading(true);
          try {
               const response = await customFetch('payroll/salary-grades?activeOnly=true');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setSalaryGrades(response.result || []);
               }
          } catch (error) {
               console.error('Error fetching salary grades:', error);
               setSalaryGrades([]);
          } finally {
               setSalaryGradesLoading(false);
          }
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          // Prepare data for validation
          const validationData = {
               ...formData,
               employeeid: parseInt(formData.employeeid),
               basic_salary: formData.basic_salary ? parseFloat(formData.basic_salary) : undefined,
               hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
               overtime_rate_multiplier: formData.overtime_rate_multiplier ? parseFloat(formData.overtime_rate_multiplier) : undefined,
               commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : undefined,
               commission_target: formData.commission_target ? parseFloat(formData.commission_target) : undefined,
               salary_grade_id: formData.salary_grade_id ? parseInt(formData.salary_grade_id) : undefined,
               created_by: user?.employeeid
          };

          // Validate with Zod schema
          let validatedData: ICompensation;
          try {
               validatedData = compensationSchema.parse(validationData);
          } catch (error) {
               if (error instanceof z.ZodError) {
                    const firstError = error.errors[0];
                    alert(`${firstError.path.join('.')}: ${firstError.message}`);
                    return;
               }
               alert('Validation failed');
               return;
          }

          if (!user?.employeeid) {
               alert('User information not available');
               return;
          }

          setLoading(true);

          try {
               // Use the validated data as payload (remove undefined values)
               const payload = Object.fromEntries(
                    Object.entries(validatedData).filter(([_, value]) => value !== undefined && value !== '')
               );

               const response = await customPost('payroll/compensation', 'POST', payload);

               if (response?.status === 'success') {
                    alert('Compensation created successfully');
                    router.push('/human-resource/payroll/compensation');
               } else {
                    alert(response?.message || 'Failed to create compensation');
               }
          } catch (err: any) {
               alert(err?.message || 'Error creating compensation');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center mb-4">
                    <Link href="/human-resource/payroll/compensation" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="d-flex align-items-center">
                         <RiMoneyDollarCircleLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Create Compensation</h1>
                              <p className="text-muted mb-0 small">Set up employee compensation</p>
                         </div>
                    </div>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit}>
                    <div className="row">
                         <div className="col-lg-8">
                              {/* Employee Information */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3">Employee Information</h5>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Employee <span className="text-danger">*</span></label>
                                             <select
                                                  className="form-select"
                                                  name="employeeid"
                                                  value={formData.employeeid}
                                                  onChange={handleChange}
                                                  required
                                                  disabled={employeesLoading}
                                             >
                                                  <option value="">
                                                       {employeesLoading ? 'Loading employees...' : 'Select an employee'}
                                                  </option>
                                                  {employees.map((employee) => (
                                                       <option key={employee.employeeid} value={employee.employeeid}>
                                                            {employee.username} (ID: {employee.employeeid}) - {employee.role}
                                                       </option>
                                                  ))}
                                             </select>
                                             <small className="text-muted">Select the employee for this compensation</small>
                                        </div>
                                   </div>
                              </div>

                              {/* Compensation Details */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3">Compensation Details</h5>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Compensation Type <span className="text-danger">*</span></label>
                                             <select
                                                  className="form-select"
                                                  name="compensation_type"
                                                  value={formData.compensation_type}
                                                  onChange={handleChange}
                                                  required
                                             >
                                                  <option value="salary">Salary</option>
                                                  <option value="hourly">Hourly</option>
                                                  <option value="commission">Commission</option>
                                                  <option value="hybrid">Hybrid (Salary + Commission)</option>
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Payment Frequency <span className="text-danger">*</span></label>
                                             <select
                                                  className="form-select"
                                                  name="payment_frequency"
                                                  value={formData.payment_frequency}
                                                  onChange={handleChange}
                                                  required
                                             >
                                                  <option value="weekly">Weekly</option>
                                                  <option value="biweekly">Biweekly</option>
                                                  <option value="monthly">Monthly</option>
                                             </select>
                                        </div>

                                        {/* Conditional Fields Based on Compensation Type */}
                                        {(formData.compensation_type === 'salary' || formData.compensation_type === 'hybrid') && (
                                             <>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Salary Amount (GHS) <span className="text-danger">*</span></label>
                                                       <input
                                                            type="number"
                                                            step="0.01"
                                                            className="form-control"
                                                            name="basic_salary"
                                                            value={formData.basic_salary}
                                                            onChange={handleChange}
                                                            required
                                                       />
                                                  </div>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Salary Grade</label>
                                                       <select
                                                            className="form-select"
                                                            name="salary_grade_id"
                                                            value={formData.salary_grade_id}
                                                            onChange={handleChange}
                                                       >
                                                            <option value="">Select Salary Grade (Optional)</option>
                                                            {salaryGrades.map((grade) => (
                                                                 <option key={grade.id} value={grade.id}>
                                                                      {grade.grade_name} ({grade.grade_level})
                                                                      {grade.min_salary && grade.max_salary &&
                                                                           ` - ${grade.currency} ${currencyFormatter.format(grade.min_salary)} - ${currencyFormatter.format(grade.max_salary)}`
                                                                      }
                                                                 </option>
                                                            ))}
                                                       </select>
                                                       {salaryGradesLoading && (
                                                            <small className="text-muted">Loading salary grades...</small>
                                                       )}
                                                  </div>
                                             </>
                                        )}

                                        {formData.compensation_type === 'hourly' && (
                                             <div className="col-md-6">
                                                  <label className="form-label">Hourly Rate (GHS) <span className="text-danger">*</span></label>
                                                  <input
                                                       type="number"
                                                       step="0.01"
                                                       className="form-control"
                                                       name="hourly_rate"
                                                       value={formData.hourly_rate}
                                                       onChange={handleChange}
                                                       required
                                                  />
                                             </div>
                                        )}

                                        {(formData.compensation_type === 'commission' || formData.compensation_type === 'hybrid') && (
                                             <>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Commission Percentage (%) <span className="text-danger">*</span></label>
                                                       <input
                                                            type="number"
                                                            step="0.1"
                                                            className="form-control"
                                                            name="commission_percentage"
                                                            value={formData.commission_percentage}
                                                            onChange={handleChange}
                                                            required
                                                       />
                                                  </div>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Commission Target ({formData.currency})</label>
                                                       <input
                                                            type="number"
                                                            step="0.01"
                                                            className="form-control"
                                                            name="commission_target"
                                                            value={formData.commission_target}
                                                            onChange={handleChange}
                                                            placeholder="Optional target amount"
                                                       />
                                                  </div>
                                             </>
                                        )}
                                   </div>
                              </div>

                              {/* Payment Details */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3">Payment Details</h5>
                                   <div className="row g-3">
                                        <div className="col-12">
                                             <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                                             <select
                                                  className="form-select"
                                                  name="payment_method"
                                                  value={formData.payment_method}
                                                  onChange={handleChange}
                                                  required
                                             >
                                                  <option value="bank_transfer">Bank Transfer</option>
                                                  <option value="mobile_money">Mobile Money</option>
                                                  <option value="cash">Cash</option>
                                                  <option value="cheque">Cheque</option>
                                             </select>
                                        </div>

                                        {/* Bank Transfer Fields */}
                                        {formData.payment_method === 'bank_transfer' && (
                                             <>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Bank Name <span className="text-danger">*</span></label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            name="bank_name"
                                                            value={formData.bank_name}
                                                            onChange={handleChange}
                                                            required
                                                       />
                                                  </div>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Account Number <span className="text-danger">*</span></label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            name="bank_account_number"
                                                            value={formData.bank_account_number}
                                                            onChange={handleChange}
                                                            required
                                                       />
                                                  </div>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Bank Branch</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            name="bank_branch"
                                                            value={formData.bank_branch}
                                                            onChange={handleChange}
                                                            placeholder="Optional"
                                                       />
                                                  </div>
                                             </>
                                        )}

                                        {/* Mobile Money Fields */}
                                        {formData.payment_method === 'mobile_money' && (
                                             <>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Mobile Money Number <span className="text-danger">*</span></label>
                                                       <input
                                                            type="tel"
                                                            className="form-control"
                                                            name="mobile_money_number"
                                                            value={formData.mobile_money_number}
                                                            onChange={handleChange}
                                                            placeholder="0XXXXXXXXX"
                                                            required
                                                       />
                                                  </div>
                                                  <div className="col-md-6">
                                                       <label className="form-label">Mobile Money Network</label>
                                                       <select
                                                            className="form-select"
                                                            name="mobile_money_network"
                                                            value={formData.mobile_money_network}
                                                            onChange={handleChange}
                                                       >
                                                            <option value="">Select Network</option>
                                                            <option value="MTN">MTN Mobile Money</option>
                                                            <option value="Vodafone">Vodafone Cash</option>
                                                            <option value="AirtelTigo">AirtelTigo Money</option>
                                                       </select>
                                                  </div>
                                             </>
                                        )}
                                   </div>
                              </div>

                              {/* Effective Dates */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3">Effective Dates</h5>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Effective From <span className="text-danger">*</span></label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  name="effective_from"
                                                  value={formData.effective_from}
                                                  onChange={handleChange}
                                                  required
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Effective To</label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  name="effective_to"
                                                  value={formData.effective_to}
                                                  onChange={handleChange}
                                                  min={formData.effective_from}
                                             />
                                             <small className="text-muted">Leave blank if no end date</small>
                                        </div>
                                   </div>
                              </div>

                              {/* Notes */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3">Additional Information</h5>
                                   <div>
                                        <label className="form-label">Notes (Optional)</label>
                                        <textarea
                                             className="form-control"
                                             name="notes"
                                             rows={4}
                                             value={formData.notes}
                                             onChange={handleChange}
                                             placeholder="Any additional notes or comments..."
                                        ></textarea>
                                   </div>
                              </div>
                         </div>

                         {/* Summary Sidebar */}
                         <div className="col-lg-4">
                              <div className="border rounded p-4 sticky-top" style={{ backgroundColor: 'var(--bs-tertiary-bg)', top: '20px' }}>
                                   <h5 className="fw-semibold mb-3">Summary</h5>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Employee</div>
                                        <div className="fw-medium">
                                             {selectedEmployee ? `${selectedEmployee.username} (ID: ${selectedEmployee.employeeid})` : 'Not selected'}
                                        </div>
                                        {selectedEmployee && (
                                             <div className="small text-muted mt-1">
                                                  Role: {selectedEmployee.role} | Branch: {selectedEmployee.branchname}
                                             </div>
                                        )}
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Compensation Type</div>
                                        <div className="fw-medium text-capitalize">{formData.compensation_type}</div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Payment Frequency</div>
                                        <div className="fw-medium text-capitalize">{formData.payment_frequency}</div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Payment Method</div>
                                        <div className="fw-medium text-capitalize">{formData.payment_method.replace('_', ' ')}</div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Active Status</div>
                                        <div className="fw-medium">{formData.is_active ? 'Active' : 'Inactive'}</div>
                                   </div>
                                   {(formData.compensation_type === 'salary' || formData.compensation_type === 'hybrid') && formData.basic_salary && (
                                        <div className="mb-3">
                                             <div className="small text-muted mb-1">Basic Salary</div>
                                             <div className="fw-medium">{formData.currency} {parseFloat(formData.basic_salary).toLocaleString()}</div>
                                        </div>
                                   )}
                                   {formData.compensation_type === 'hourly' && formData.hourly_rate && (
                                        <div className="mb-3">
                                             <div className="small text-muted mb-1">Hourly Rate</div>
                                             <div className="fw-medium">{formData.currency} {parseFloat(formData.hourly_rate).toLocaleString()}</div>
                                        </div>
                                   )}
                                   {(formData.compensation_type === 'commission' || formData.compensation_type === 'hybrid') && formData.commission_percentage && (
                                        <div className="mb-3">
                                             <div className="small text-muted mb-1">Commission</div>
                                             <div className="fw-medium">{formData.commission_percentage}% {formData.commission_target ? `(Target: ${formData.currency} ${parseFloat(formData.commission_target).toLocaleString()})` : ''}</div>
                                        </div>
                                   )}
                                   <hr />
                                   <div className="d-grid gap-2">
                                        <button
                                             type="submit"
                                             className="btn btn-primary"
                                             disabled={loading}
                                             style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                        >
                                             {loading ? (
                                                  <>
                                                       <RiLoader4Line size={18} className="me-2 animate-spin" />
                                                       Creating...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiSaveLine size={18} className="me-2" />
                                                       Create Compensation
                                                  </>
                                             )}
                                        </button>
                                        <Link href="/human-resource/payroll/compensation" className="btn btn-outline-secondary">
                                             Cancel
                                        </Link>
                                   </div>
                              </div>
                         </div>
                    </div>
               </form>

               <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
          </div>
     );
}
