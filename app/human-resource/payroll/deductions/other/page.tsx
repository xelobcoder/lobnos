'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import {
     RiArrowLeftLine,
     RiBankCardLine,
     RiCheckboxCircleLine,
     RiLoader4Line,
     RiSaveLine,
     RiShieldCheckLine,
     RiUserLine
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

interface OtherDeduction {
     id: number;
     employeeid: number;
     employee_name?: string;
     deduction_type: string;
     deduction_name: string;
     amount: number;
     is_recurring: boolean;
     frequency: string;
     total_amount?: number | null;
     remaining_balance?: number | null;
     deduction_priority: number;
     start_date: string;
     end_date?: string | null;
     is_active: boolean;
     approved_by?: number | null;
     approved_date?: string | null;
     remarks?: string | null;
     attachments?: string | null;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const DEDUCTION_TYPES = ['loan', 'advance', 'garnishment', 'union_dues', 'insurance', 'cooperative', 'welfare', 'savings', 'disciplinary', 'other'];
const FREQUENCIES = ['monthly', 'bi-weekly', 'weekly', 'one-time'];

export default function OtherDeductionsPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
     const [employeeDeductions, setEmployeeDeductions] = useState<OtherDeduction[]>([]);
     const [activeDeductions, setActiveDeductions] = useState<OtherDeduction[]>([]);
     const [pendingApprovals, setPendingApprovals] = useState<OtherDeduction[]>([]);
     const [loading, setLoading] = useState(false);
     const [submitting, setSubmitting] = useState(false);
     const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [formData, setFormData] = useState({
          employeeid: '',
          deduction_type: 'loan',
          deduction_name: '',
          amount: '',
          is_recurring: true,
          frequency: 'monthly',
          total_amount: '',
          remaining_balance: '',
          deduction_priority: '1',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          is_active: true,
          remarks: '',
          attachments: ''
     });

     const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-GH', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
     }), []);

     const selectedEmployee = employees.find((employee) => employee.employeeid.toString() === selectedEmployeeId);
     const totalEmployeeDeductions = employeeDeductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
     const monthlyRecurringTotal = employeeDeductions.filter((item) => item.is_recurring).reduce((sum, item) => sum + Number(item.amount || 0), 0);

     useEffect(() => {
          fetchEmployees();
          fetchGlobalDeductions();
     }, []);

     useEffect(() => {
          if (!selectedEmployeeId && user?.employeeid) {
               setSelectedEmployeeId(String(user.employeeid));
               setFormData((previous) => ({ ...previous, employeeid: String(user.employeeid) }));
          }
     }, [user, selectedEmployeeId]);

     useEffect(() => {
          if (selectedEmployeeId) {
               setFormData((previous) => ({ ...previous, employeeid: selectedEmployeeId }));
               fetchEmployeeDeductions(selectedEmployeeId);
          } else {
               setEmployeeDeductions([]);
          }
     }, [selectedEmployeeId]);

     const fetchEmployees = async () => {
          setEmployeesLoading(true);
          try {
               const response = await customFetch('logins');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployees(response.result || []);
               } else {
                    setEmployees([]);
               }
          } catch {
               setEmployees([]);
          } finally {
               setEmployeesLoading(false);
          }
     };

     const fetchEmployeeDeductions = async (employeeId: string) => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch(`payroll/deductions/other/employee/${employeeId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployeeDeductions(response.result || []);
               } else {
                    setEmployeeDeductions([]);
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to load employee deductions');
               setEmployeeDeductions([]);
          } finally {
               setLoading(false);
          }
     };

     const fetchGlobalDeductions = async () => {
          try {
               const [activeResponse, pendingResponse] = await Promise.all([
                    customFetch('payroll/deductions/other/active'),
                    customFetch('payroll/deductions/other/pending-approvals')
               ]);

               if (activeResponse?.status === 'success' && activeResponse?.statusCode === 200) {
                    setActiveDeductions(activeResponse.result || []);
               }

               if (pendingResponse?.status === 'success' && pendingResponse?.statusCode === 200) {
                    setPendingApprovals(pendingResponse.result || []);
               }
          } catch {
               setActiveDeductions([]);
               setPendingApprovals([]);
          }
     };

     const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;

          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               const totalAmount = Number(formData.total_amount || formData.amount || 0);
               const payload = {
                    employeeid: Number(formData.employeeid),
                    deduction_type: formData.deduction_type,
                    deduction_name: formData.deduction_name,
                    amount: Number(formData.amount),
                    is_recurring: formData.is_recurring,
                    frequency: formData.frequency,
                    total_amount: formData.is_recurring && formData.frequency !== 'one-time' ? (formData.total_amount ? Number(formData.total_amount) : null) : totalAmount,
                    remaining_balance: formData.remaining_balance ? Number(formData.remaining_balance) : totalAmount,
                    deduction_priority: Number(formData.deduction_priority),
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    is_active: formData.is_active,
                    remarks: formData.remarks || null,
                    attachments: formData.attachments || null
               };

               const response = await customPost('payroll/deductions/other', 'POST', payload);

               if (response?.status === 'success') {
                    setFormData((previous) => ({
                         ...previous,
                         deduction_name: '',
                         amount: '',
                         total_amount: '',
                         remaining_balance: '',
                         deduction_priority: '1',
                         end_date: '',
                         remarks: '',
                         attachments: ''
                    }));
                    if (selectedEmployeeId) {
                         await fetchEmployeeDeductions(selectedEmployeeId);
                    }
                    await fetchGlobalDeductions();
               } else {
                    setError(response?.message || 'Failed to create other deduction');
               }
          } catch (err: any) {
               setError(err?.message || 'Error creating deduction');
          } finally {
               setSubmitting(false);
          }
     };

     const handleApprove = async (deductionId: number) => {
          setActionLoadingId(deductionId);
          setError(null);
          try {
               const response = await customPost(`payroll/deductions/other/${deductionId}/approve`, 'POST', {
                    approved_by: user?.employeeid
               });

               if (response?.status === 'success') {
                    await fetchGlobalDeductions();
                    if (selectedEmployeeId) {
                         await fetchEmployeeDeductions(selectedEmployeeId);
                    }
               } else {
                    setError(response?.message || 'Failed to approve deduction');
               }
          } catch (err: any) {
               setError(err?.message || 'Error approving deduction');
          } finally {
               setActionLoadingId(null);
          }
     };

     const handleDeactivate = async (deductionId: number) => {
          setActionLoadingId(deductionId);
          setError(null);
          try {
               const response = await customPost(`payroll/deductions/other/${deductionId}/deactivate`, 'PATCH', {});

               if (response?.status === 'success') {
                    await fetchGlobalDeductions();
                    if (selectedEmployeeId) {
                         await fetchEmployeeDeductions(selectedEmployeeId);
                    }
               } else {
                    setError(response?.message || 'Failed to deactivate deduction');
               }
          } catch (err: any) {
               setError(err?.message || 'Error deactivating deduction');
          } finally {
               setActionLoadingId(null);
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex align-items-center mb-4">
                    <button type="button" onClick={() => router.push('/human-resource/payroll')} className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </button>
                    <div className="d-flex align-items-center">
                         <RiBankCardLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Other Deductions</h1>
                              <p className="text-muted mb-0 small">Manage loans, advances, and other employee deductions</p>
                         </div>
                    </div>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiUserLine size={18} className="me-2 text-primary" />
                                   <span className="small text-muted fw-medium">Selected Employee</span>
                              </div>
                              <div className="fw-bold">{selectedEmployee?.username || 'No employee selected'}</div>
                              <div className="small text-muted">{selectedEmployee?.role || 'Choose an employee'}</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={18} className="me-2 text-success" />
                                   <span className="small text-muted fw-medium">Employee Deductions</span>
                              </div>
                              <div className="fw-bold">{loading ? '...' : employeeDeductions.length}</div>
                              <div className="small text-muted">Loaded for the selected employee</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiShieldCheckLine size={18} className="me-2 text-warning" />
                                   <span className="small text-muted fw-medium">Recurring Monthly Total</span>
                              </div>
                              <div className="fw-bold">{currencyFormatter.format(monthlyRecurringTotal)}</div>
                              <div className="small text-muted">Recurring deductions only</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={18} className="me-2 text-info" />
                                   <span className="small text-muted fw-medium">Pending Approvals</span>
                              </div>
                              <div className="fw-bold">{pendingApprovals.length}</div>
                              <div className="small text-muted">Awaiting review</div>
                         </div>
                    </div>
               </div>

               {error && <div className="alert alert-danger">{error}</div>}

               <div className="row g-4">
                    <div className="col-xl-5">
                         <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">Create Other Deduction</h5>
                              <form onSubmit={handleSubmit}>
                                   <div className="mb-3">
                                        <label className="form-label fw-medium">Employee</label>
                                        <select className="form-select" value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)} disabled={employeesLoading} required>
                                             <option value="">Select employee</option>
                                             {employees.map((employee) => (
                                                  <option key={employee.employeeid} value={employee.employeeid}>
                                                       {employee.username} - {employee.role}
                                                  </option>
                                             ))}
                                        </select>
                                   </div>

                                   <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Deduction Type</label>
                                             <select name="deduction_type" className="form-select" value={formData.deduction_type} onChange={handleChange} required>
                                                  {DEDUCTION_TYPES.map((type) => (
                                                       <option key={type} value={type}>
                                                            {type.replace('_', ' ')}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Deduction Name</label>
                                             <input name="deduction_name" type="text" className="form-control" value={formData.deduction_name} onChange={handleChange} placeholder="Staff Loan" required />
                                        </div>
                                   </div>

                                   <div className="row g-3 mb-3">
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium">Amount</label>
                                             <input name="amount" type="number" step="0.01" min="0" className="form-control" value={formData.amount} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium">Priority</label>
                                             <input name="deduction_priority" type="number" step="1" min="1" className="form-control" value={formData.deduction_priority} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium">Start Date</label>
                                             <input name="start_date" type="date" className="form-control" value={formData.start_date} onChange={handleChange} required />
                                        </div>
                                   </div>

                                   <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Frequency</label>
                                             <select name="frequency" className="form-select" value={formData.frequency} onChange={handleChange}>
                                                  {FREQUENCIES.map((frequency) => (
                                                       <option key={frequency} value={frequency}>
                                                            {frequency}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="col-md-6 form-check d-flex align-items-end mb-0">
                                             <input className="form-check-input me-2" type="checkbox" id="is_recurring" name="is_recurring" checked={formData.is_recurring} onChange={handleChange} />
                                             <label className="form-check-label" htmlFor="is_recurring">
                                                  Recurring deduction
                                             </label>
                                        </div>
                                   </div>

                                   <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Total Amount</label>
                                             <input name="total_amount" type="number" step="0.01" min="0" className="form-control" value={formData.total_amount} onChange={handleChange} placeholder="Required for one-time deductions" />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Remaining Balance</label>
                                             <input name="remaining_balance" type="number" step="0.01" min="0" className="form-control" value={formData.remaining_balance} onChange={handleChange} placeholder="Optional; defaults to total amount" />
                                        </div>
                                   </div>

                                   <div className="mb-3">
                                        <label className="form-label fw-medium">End Date</label>
                                        <input name="end_date" type="date" className="form-control" value={formData.end_date} onChange={handleChange} min={formData.start_date} />
                                   </div>

                                   <div className="mb-3 form-check">
                                        <input className="form-check-input" type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                        <label className="form-check-label" htmlFor="is_active">
                                             Mark as active
                                        </label>
                                   </div>

                                   <div className="mb-3">
                                        <label className="form-label fw-medium">Remarks</label>
                                        <textarea name="remarks" className="form-control" rows={3} value={formData.remarks} onChange={handleChange} placeholder="Optional notes for payroll" />
                                   </div>

                                   <div className="mb-4">
                                        <label className="form-label fw-medium">Attachments</label>
                                        <input name="attachments" type="text" className="form-control" value={formData.attachments} onChange={handleChange} placeholder="Optional file path or upload reference" />
                                   </div>

                                   <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={submitting || loading} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                        {submitting ? (
                                             <>
                                                  <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                  Saving...
                                             </>
                                        ) : (
                                             <>
                                                  <RiSaveLine size={18} className="me-1" />
                                                  Create Deduction
                                             </>
                                        )}
                                   </button>
                              </form>
                         </div>
                    </div>

                    <div className="col-xl-7">
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">Employee Deduction Breakdown</h5>
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                                   <div>
                                        <div className="fw-medium">{selectedEmployee?.username || 'No employee selected'}</div>
                                        <div className="small text-muted">Total deductions: {currencyFormatter.format(totalEmployeeDeductions)}</div>
                                   </div>
                                   <Link href="/human-resource/payroll/employee/history" className="btn btn-outline-primary btn-sm">
                                        View payroll history
                                   </Link>
                              </div>

                              <div className="table-responsive">
                                   <table className="table table-sm table-hover text-start mb-0">
                                        <thead>
                                             <tr>
                                                  <th className="text-start">Name</th>
                                                  <th className="text-start">Type</th>
                                                  <th className="text-end">Amount</th>
                                                  <th className="text-end">Balance</th>
                                                  <th className="text-start">Frequency</th>
                                                  <th className="text-start">Status</th>
                                                  <th className="text-start">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {loading ? (
                                                  <tr>
                                                       <td colSpan={7} className="text-center py-4 text-muted">Loading employee deductions...</td>
                                                  </tr>
                                             ) : employeeDeductions.length > 0 ? employeeDeductions.map((deduction) => (
                                                  <tr key={deduction.id}>
                                                       <td className="text-start small">{deduction.deduction_name}</td>
                                                       <td className="text-start text-capitalize small">{deduction.deduction_type.replace('_', ' ')}</td>
                                                       <td className="text-end small">{currencyFormatter.format(Number(deduction.amount || 0))}</td>
                                                       <td className="text-end small">{currencyFormatter.format(Number(deduction.remaining_balance ?? deduction.total_amount ?? deduction.amount ?? 0))}</td>
                                                       <td className="text-start small text-capitalize">{deduction.frequency.replace('_', ' ')}</td>
                                                       <td className="text-start small text-capitalize">{deduction.is_active ? 'active' : 'inactive'}</td>
                                                       <td className="text-start">
                                                            <div className="d-flex gap-2 flex-wrap">
                                                                 {deduction.approved_by === null || deduction.approved_by === undefined ? (
                                                                      <button type="button" className="btn btn-outline-success btn-sm" onClick={() => handleApprove(deduction.id)} disabled={actionLoadingId === deduction.id}>
                                                                           {actionLoadingId === deduction.id ? '...' : 'Approve'}
                                                                      </button>
                                                                 ) : null}
                                                                 {deduction.is_active ? (
                                                                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleDeactivate(deduction.id)} disabled={actionLoadingId === deduction.id}>
                                                                           {actionLoadingId === deduction.id ? '...' : 'Deactivate'}
                                                                      </button>
                                                                 ) : null}
                                                            </div>
                                                       </td>
                                                  </tr>
                                             )) : (
                                                  <tr>
                                                       <td colSpan={7} className="text-center py-4 text-muted">No deductions found for the selected employee.</td>
                                                  </tr>
                                             )}
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         <div className="row g-4">
                              <div className="col-lg-6">
                                   <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h5 className="fw-semibold mb-3">Pending Approvals</h5>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Employee</th>
                                                            <th className="text-start">Deduction</th>
                                                            <th className="text-end">Amount</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {pendingApprovals.length > 0 ? pendingApprovals.slice(0, 5).map((deduction) => (
                                                            <tr key={deduction.id}>
                                                                 <td className="text-start small">{deduction.employee_name || deduction.employeeid}</td>
                                                                 <td className="text-start small">{deduction.deduction_name}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(Number(deduction.amount || 0))}</td>
                                                            </tr>
                                                       )) : (
                                                            <tr>
                                                                 <td colSpan={3} className="text-center py-4 text-muted">No pending approvals.</td>
                                                            </tr>
                                                       )}
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-lg-6">
                                   <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h5 className="fw-semibold mb-3">Active Deductions</h5>
                                        <div className="table-responsive">
                                             <table className="table table-sm table-hover text-start mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="text-start">Employee</th>
                                                            <th className="text-start">Deduction</th>
                                                            <th className="text-end">Balance</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {activeDeductions.length > 0 ? activeDeductions.slice(0, 5).map((deduction) => (
                                                            <tr key={deduction.id}>
                                                                 <td className="text-start small">{deduction.employee_name || deduction.employeeid}</td>
                                                                 <td className="text-start small">{deduction.deduction_name}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(Number(deduction.remaining_balance ?? deduction.amount ?? 0))}</td>
                                                            </tr>
                                                       )) : (
                                                            <tr>
                                                                 <td colSpan={3} className="text-center py-4 text-muted">No active deductions found.</td>
                                                            </tr>
                                                       )}
                                                  </tbody>
                                             </table>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               <style jsx global>{`
                    .animate-spin {
                         animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                         from {
                              transform: rotate(0deg);
                         }

                         to {
                              transform: rotate(360deg);
                         }
                    }
               `}</style>
          </div>
     );
}