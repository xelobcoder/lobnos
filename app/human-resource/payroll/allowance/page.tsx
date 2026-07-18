'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
     RiArrowLeftLine,
     RiBankCardLine,
     RiEditLine,
     RiLoader4Line,
     RiSaveLine,
     RiDeleteBinLine,
     RiUserLine
} from '@remixicon/react';
import { customPost ,customFetch} from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

interface Employee {
     employeeid: number;
     username: string;
     role: string;
}

interface Allowance {
     id: number;
     employeeid: number;
     allowance_type: string;
     amount: number | string;
     calculation_method: 'fixed' | 'percentage_of_basic' | 'variable';
     percentage?: number | string | null;
     is_recurring: boolean | number;
     frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
     is_taxable: boolean | number;
     effective_from: string;
     effective_to?: string | null;
     is_active: boolean | number;
     approved_by?: number | null;
}

type AllowanceFormState = {
     employeeid: string;
     allowance_type: string;
     amount: string;
     calculation_method: 'fixed' | 'percentage_of_basic' | 'variable';
     percentage: string;
     is_recurring: boolean;
     frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
     is_taxable: boolean;
     effective_from: string;
     effective_to: string;
     is_active: boolean;
};

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

const toNumber = (value: number | string | null | undefined): number => {
     const parsed = Number(value ?? 0);
     return Number.isFinite(parsed) ? parsed : 0;
};

const toBoolean = (value: boolean | number | null | undefined): boolean => value === true || value === 1;

const toInputDate = (value?: string | null): string => {
     if (!value) {
          return '';
     }
     const parsed = new Date(value);
     if (Number.isNaN(parsed.getTime())) {
          return value.slice(0, 10);
     }
     return parsed.toISOString().split('T')[0];
};

const defaultForm = (employeeid = ''): AllowanceFormState => ({
     employeeid,
     allowance_type: 'transport',
     amount: '',
     calculation_method: 'fixed',
     percentage: '',
     is_recurring: true,
     frequency: 'monthly',
     is_taxable: true,
     effective_from: new Date().toISOString().split('T')[0],
     effective_to: '',
     is_active: true,
});

export default function PayrollAllowancesPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [employees, setEmployees] = useState<Employee[]>([]);
     const [allowanceTypes, setAllowanceTypes] = useState<string[]>([]);
     const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
     const [employeeAllowances, setEmployeeAllowances] = useState<Allowance[]>([]);
     const [loading, setLoading] = useState(false);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [submitting, setSubmitting] = useState(false);
     const [rowActionId, setRowActionId] = useState<number | null>(null);
     const [editingAllowanceId, setEditingAllowanceId] = useState<number | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [formData, setFormData] = useState<AllowanceFormState>(defaultForm());

     const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-GH', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
     }), []);

     const selectedEmployee = employees.find((employee) => String(employee.employeeid) === selectedEmployeeId);

     useEffect(() => {
          fetchEmployees();
          fetchAllowanceTypes();
     }, []);

     useEffect(() => {
          if (!selectedEmployeeId && user?.employeeid) {
               const employeeId = String(user.employeeid);
               setSelectedEmployeeId(employeeId);
               setFormData(defaultForm(employeeId));
          }
     }, [selectedEmployeeId, user]);

     useEffect(() => {
          if (selectedEmployeeId) {
               setFormData((previous) => ({ ...previous, employeeid: selectedEmployeeId }));
               fetchEmployeeAllowances(selectedEmployeeId);
          } else {
               setEmployeeAllowances([]);
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

     const fetchAllowanceTypes = async () => {
          try {
               const response = await customFetch('payroll/allowances/types');
               if (response?.status === 'success' && response?.statusCode === 200 && Array.isArray(response.result)) {
                    setAllowanceTypes(response.result);
               } else {
                    setAllowanceTypes(['housing', 'transport', 'meal', 'medical', 'education', 'uniform', 'mobile', 'hazard', 'shift_allowance', 'professional_development']);
               }
          } catch {
               setAllowanceTypes(['housing', 'transport', 'meal', 'medical', 'education', 'uniform', 'mobile', 'hazard', 'shift_allowance', 'professional_development']);
          }
     };

     const fetchEmployeeAllowances = async (employeeId: string) => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch(`payroll/allowances/employee/${employeeId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployeeAllowances(Array.isArray(response.result) ? response.result : []);
               } else {
                    setEmployeeAllowances([]);
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to load employee allowances');
               setEmployeeAllowances([]);
          } finally {
               setLoading(false);
          }
     };

     const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;

          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     const resetForm = () => {
          setEditingAllowanceId(null);
          setFormData(defaultForm(selectedEmployeeId));
     };

     const handleEdit = (allowance: Allowance) => {
          setEditingAllowanceId(allowance.id);
          setSelectedEmployeeId(String(allowance.employeeid));
          setFormData({
               employeeid: String(allowance.employeeid),
               allowance_type: allowance.allowance_type,
               amount: String(allowance.amount ?? ''),
               calculation_method: allowance.calculation_method,
               percentage: allowance.percentage !== null && allowance.percentage !== undefined ? String(allowance.percentage) : '',
               is_recurring: toBoolean(allowance.is_recurring),
               frequency: allowance.frequency,
               is_taxable: toBoolean(allowance.is_taxable),
               effective_from: toInputDate(allowance.effective_from),
               effective_to: toInputDate(allowance.effective_to),
               is_active: toBoolean(allowance.is_active),
          });
     };

     const handleDeactivate = async (allowanceId: number) => {
          setRowActionId(allowanceId);
          setError(null);
          try {
               const response = await customPost(`payroll/allowances/${allowanceId}`, 'DELETE', {});
               if (response?.status === 'success') {
                    await fetchEmployeeAllowances(selectedEmployeeId);
               } else {
                    setError(response?.message || 'Failed to deactivate allowance');
               }
          } catch (err: any) {
               setError(err?.message || 'Error deactivating allowance');
          } finally {
               setRowActionId(null);
          }
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               const amount = Number(formData.amount);
               if (!Number.isFinite(amount) || amount <= 0) {
                    throw new Error('Amount must be greater than 0');
               }

               const payload: Record<string, unknown> = {
                    employeeid: Number(formData.employeeid),
                    allowance_type: formData.allowance_type,
                    amount,
                    calculation_method: formData.calculation_method,
                    is_recurring: formData.is_recurring,
                    frequency: formData.frequency,
                    is_taxable: formData.is_taxable,
                    effective_from: formData.effective_from,
                    effective_to: formData.effective_to || null,
                    is_active: formData.is_active,
                    approved_by: user?.employeeid || null,
               };

               if (formData.calculation_method === 'percentage_of_basic') {
                    const percentage = Number(formData.percentage);
                    if (!Number.isFinite(percentage) || percentage <= 0) {
                         throw new Error('Percentage is required for percentage_of_basic');
                    }
                    payload.percentage = percentage;
               }

               const response = editingAllowanceId
                    ? await customPost(`payroll/allowances/${editingAllowanceId}`, 'PUT', payload)
                    : await customPost('payroll/allowances', 'POST', payload);

               if (response?.status === 'success') {
                    resetForm();
                    await fetchEmployeeAllowances(selectedEmployeeId);
               } else {
                    setError(response?.message || `Failed to ${editingAllowanceId ? 'update' : 'create'} allowance`);
               }
          } catch (err: any) {
               setError(err?.message || `Error trying to ${editingAllowanceId ? 'update' : 'create'} allowance`);
          } finally {
               setSubmitting(false);
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
                              <h1 className="h4 mb-0 fw-bold">Allowances</h1>
                              <p className="text-muted mb-0 small">Create, update and deactivate employee allowances</p>
                         </div>
                    </div>
               </div>

               {error && <div className="alert alert-danger">{error}</div>}

               <div className="row g-4">
                    <div className="col-xl-5">
                         <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">{editingAllowanceId ? 'Update Allowance' : 'Create Allowance'}</h5>

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
                                             <label className="form-label fw-medium">Allowance Type</label>
                                             <select name="allowance_type" className="form-select" value={formData.allowance_type} onChange={handleChange} required>
                                                  {allowanceTypes.map((type) => (
                                                       <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Amount</label>
                                             <input name="amount" type="number" min="0" step="0.01" className="form-control" value={formData.amount} onChange={handleChange} required />
                                        </div>
                                   </div>

                                   <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Calculation Method</label>
                                             <select name="calculation_method" className="form-select" value={formData.calculation_method} onChange={handleChange}>
                                                  <option value="fixed">fixed</option>
                                                  <option value="percentage_of_basic">percentage_of_basic</option>
                                                  <option value="variable">variable</option>
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Frequency</label>
                                             <select name="frequency" className="form-select" value={formData.frequency} onChange={handleChange}>
                                                  <option value="monthly">monthly</option>
                                                  <option value="quarterly">quarterly</option>
                                                  <option value="annually">annually</option>
                                                  <option value="one-time">one-time</option>
                                             </select>
                                        </div>
                                   </div>

                                   {formData.calculation_method === 'percentage_of_basic' && (
                                        <div className="mb-3">
                                             <label className="form-label fw-medium">Percentage</label>
                                             <input name="percentage" type="number" min="0" step="0.01" className="form-control" value={formData.percentage} onChange={handleChange} required />
                                        </div>
                                   )}

                                   <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Effective From</label>
                                             <input name="effective_from" type="date" className="form-control" value={formData.effective_from} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Effective To</label>
                                             <input name="effective_to" type="date" className="form-control" value={formData.effective_to} onChange={handleChange} min={formData.effective_from} />
                                        </div>
                                   </div>

                                   <div className="d-flex flex-wrap gap-3 mb-4">
                                        <div className="form-check">
                                             <input className="form-check-input" type="checkbox" id="is_recurring" name="is_recurring" checked={formData.is_recurring} onChange={handleChange} />
                                             <label className="form-check-label" htmlFor="is_recurring">Recurring</label>
                                        </div>
                                        <div className="form-check">
                                             <input className="form-check-input" type="checkbox" id="is_taxable" name="is_taxable" checked={formData.is_taxable} onChange={handleChange} />
                                             <label className="form-check-label" htmlFor="is_taxable">Taxable</label>
                                        </div>
                                        <div className="form-check">
                                             <input className="form-check-input" type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                             <label className="form-check-label" htmlFor="is_active">Active</label>
                                        </div>
                                   </div>

                                   <div className="d-flex gap-2 align-items-center">
                                        <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={submitting || loading} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                             {submitting ? (
                                                  <>
                                                       <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                       Saving...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiSaveLine size={18} className="me-1" />
                                                       {editingAllowanceId ? 'Update Allowance' : 'Create Allowance'}
                                                  </>
                                             )}
                                        </button>
                                        {editingAllowanceId && (
                                             <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                                  Cancel Edit
                                             </button>
                                        )}
                                   </div>
                              </form>
                         </div>
                    </div>

                    <div className="col-xl-7">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                   <h5 className="fw-semibold mb-0">Employee Allowances</h5>
                                   <div className="small text-muted d-flex align-items-center">
                                        <RiUserLine size={14} className="me-1" />
                                        {selectedEmployee ? `${selectedEmployee.username}'s allowances` : 'Select employee'}
                                   </div>
                              </div>

                              <div className="table-responsive">
                                   <table className="table table-sm table-hover text-start mb-0">
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="text-start">Type</th>
                                                  <th className="text-end">Amount</th>
                                                  <th className="text-start">Method</th>
                                                  <th className="text-start">Frequency</th>
                                                  <th className="text-start">Effective</th>
                                                  <th className="text-start">Status</th>
                                                  <th className="text-start">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {loading ? (
                                                  <tr>
                                                       <td colSpan={7} className="text-center py-4 text-muted">Loading allowances...</td>
                                                  </tr>
                                             ) : employeeAllowances.length > 0 ? employeeAllowances.map((allowance) => (
                                                  <tr key={allowance.id}>
                                                       <td className="text-start small text-capitalize">{allowance.allowance_type.replace(/_/g, ' ')}</td>
                                                       <td className="text-end small">{currencyFormatter.format(toNumber(allowance.amount))}</td>
                                                       <td className="text-start small text-capitalize">{allowance.calculation_method.replace(/_/g, ' ')}</td>
                                                       <td className="text-start small text-capitalize">{allowance.frequency}</td>
                                                       <td className="text-start small">{toInputDate(allowance.effective_from)} to {toInputDate(allowance.effective_to) || 'open'}</td>
                                                       <td className="text-start small">{toBoolean(allowance.is_active) ? 'active' : 'inactive'}</td>
                                                       <td className="text-start">
                                                            <div className="d-flex gap-2 flex-wrap">
                                                                 <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(allowance)}>
                                                                      <RiEditLine size={14} />
                                                                 </button>
                                                                 {toBoolean(allowance.is_active) && (
                                                                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeactivate(allowance.id)} disabled={rowActionId === allowance.id}>
                                                                           {rowActionId === allowance.id ? '...' : <RiDeleteBinLine size={14} />}
                                                                      </button>
                                                                 )}
                                                            </div>
                                                       </td>
                                                  </tr>
                                             )) : (
                                                  <tr>
                                                       <td colSpan={7} className="text-center py-4 text-muted">No allowances found for selected employee.</td>
                                                  </tr>
                                             )}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               </div>

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
