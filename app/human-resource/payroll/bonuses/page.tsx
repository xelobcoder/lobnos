'use client';
import screens from '../PayrollScreens.module.css';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
     RiAddLine,
     RiArrowLeftLine,
     RiAwardLine,
     RiCloseLine,
     RiDeleteBinLine,
     RiEditLine,
     RiLoader4Line,
     RiSaveLine,
     RiUserLine
} from '@remixicon/react';
import { customPost, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

interface Employee {
     employeeid: number;
     username: string;
     role: string;
}

interface Bonus {
     id: number;
     employeeid: number;
     bonus_type: 'performance' | 'annual' | 'project' | 'retention' | 'holiday' | 'spot';
     amount: number | string;
     is_taxable: boolean | number;
     tax_method: 'aggregate' | 'separate' | 'bonus_rate';
     status: 'pending' | 'approved' | 'rejected' | 'paid';
     approved_by?: number | null;
     approved_date?: string | null;
     reason?: string | null;
     start_date?: string | null;
     end_date?: string | null;
     performance_rating?: number | string | null;
     payment_date?: string | null;
}

type BonusFormState = {
     employeeid: string;
     bonus_type: Bonus['bonus_type'];
     amount: string;
     start_date: string;
     end_date: string;
     is_taxable: boolean;
     tax_method: Bonus['tax_method'];
     status: Bonus['status'];
     approved_date: string;
     reason: string;
     performance_rating: string;
     payment_date: string;
};

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';
const BONUS_TYPES: Bonus['bonus_type'][] = ['performance', 'annual', 'project', 'retention', 'holiday', 'spot'];
const TAX_METHODS: Bonus['tax_method'][] = ['aggregate', 'separate', 'bonus_rate'];
const STATUS_OPTIONS: Bonus['status'][] = ['pending', 'approved', 'rejected', 'paid'];

const toInputDate = (value?: string | null): string => {
     if (!value) {
          return '';
     }

     const parsed = new Date(value);
     if (Number.isNaN(parsed.getTime())) {
          return value.slice(0, 10);
     }

     return parsed.toISOString().slice(0, 10);
};

const defaultFormState = (employeeid = ''): BonusFormState => ({
     employeeid,
     bonus_type: 'performance',
     amount: '',
     start_date: new Date().toISOString().split('T')[0],
     end_date: new Date().toISOString().split('T')[0],
     is_taxable: true,
     tax_method: 'aggregate',
     status: 'pending',
     approved_date: '',
     reason: '',
     performance_rating: '',
     payment_date: ''
});

export default function BonusesPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
     const [bonuses, setBonuses] = useState<Bonus[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [showModal, setShowModal] = useState(false);
     const [editingBonusId, setEditingBonusId] = useState<number | null>(null);
     const [submitting, setSubmitting] = useState(false);
     const [deletingId, setDeletingId] = useState<number | null>(null);
     const [formData, setFormData] = useState<BonusFormState>(defaultFormState());

     const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-GH', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
     }), []);

     const selectedEmployee = employees.find((employee) => String(employee.employeeid) === selectedEmployeeId);
     const requiresApprovalFields = formData.status === 'approved' || formData.status === 'rejected' || formData.status === 'paid';

     const summary = useMemo(() => ({
          total: bonuses.length,
          pending: bonuses.filter((bonus) => bonus.status === 'pending').length,
          approved: bonuses.filter((bonus) => bonus.status === 'approved').length,
          paid: bonuses.filter((bonus) => bonus.status === 'paid').length,
          totalAmount: bonuses.reduce((sum, bonus) => sum + Number(bonus.amount || 0), 0)
     }), [bonuses]);
     useEffect(() => {
          fetchEmployees();
     }, []);

     useEffect(() => {
          if (!selectedEmployeeId && user?.employeeid) {
               const employeeId = String(user.employeeid);
               setSelectedEmployeeId(employeeId);
               setFormData(defaultFormState(employeeId));
          }
     }, [selectedEmployeeId, user]);

     useEffect(() => {
          if (selectedEmployeeId) {
               fetchBonuses(selectedEmployeeId);
               setFormData((previous) => ({ ...previous, employeeid: selectedEmployeeId }));
          } else {
               setBonuses([]);
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

     const fetchBonuses = async (employeeId: string) => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch(`payroll/bonuses/employee/${employeeId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setBonuses(response.result || []);
               } else {
                    setBonuses([]);
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to load employee bonuses');
               setBonuses([]);
          } finally {
               setLoading(false);
          }
     };

     const openCreateModal = () => {
          setEditingBonusId(null);
          setFormData(defaultFormState(selectedEmployeeId));
          setShowModal(true);
     };

     const openEditModal = (bonus: Bonus) => {
          setEditingBonusId(bonus.id);
          setFormData({
               employeeid: String(bonus.employeeid),
               bonus_type: bonus.bonus_type,
               amount: String(bonus.amount ?? ''),
               is_taxable: Boolean(bonus.is_taxable),
               tax_method: bonus.tax_method,
               start_date: toInputDate(bonus.start_date),
               end_date: toInputDate(bonus.end_date),
               status: bonus.status,
               approved_date: toInputDate(bonus.approved_date),
               reason: bonus.reason || '',
               performance_rating: bonus.performance_rating !== null && bonus.performance_rating !== undefined ? String(bonus.performance_rating) : '',
               payment_date: toInputDate(bonus.payment_date)
          });
          setShowModal(true);
     };

     const closeModal = () => {
          setShowModal(false);
          setEditingBonusId(null);
          setFormData(defaultFormState(selectedEmployeeId));
     };

     const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;
          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     const buildPayload = () => {
          if (!formData.employeeid) {
               throw new Error('Employee is required');
          }

          const amount = Number(formData.amount);
          if (!Number.isFinite(amount) || amount <= 0) {
               throw new Error('Amount must be greater than 0');
          }

          if (formData.performance_rating) {
               const rating = Number(formData.performance_rating);
               if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
                    throw new Error('Performance rating must be between 1 and 5');
               }
          }

          if (requiresApprovalFields && !formData.approved_date) {
               throw new Error('Approved date is required for approved, rejected, or paid bonuses');
          }

          if (!formData.start_date || !formData.end_date) {
               throw new Error('Start date and end date are required');
          }

          if (formData.start_date > formData.end_date) {
               throw new Error('Start date cannot be after end date');
          }



          const payload: Record<string, unknown> = {
               employeeid: Number(formData.employeeid),
               bonus_type: formData.bonus_type,
               amount,
               is_taxable: formData.is_taxable,
               tax_method: formData.tax_method,
               status: formData.status,
               start_date: formData.start_date,
               end_date: formData.end_date
          };

          if (formData.reason.trim()) {
               payload.reason = formData.reason.trim();
          }
          if (formData.performance_rating) {
               payload.performance_rating = Number(formData.performance_rating);
          }
          if (requiresApprovalFields) {
               payload.approved_by = user?.employeeid;
               payload.approved_date = formData.approved_date;
          }
          if (formData.status === 'paid' && formData.payment_date) {
               payload.payment_date = formData.payment_date;
          }

          return payload;
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               const payload = buildPayload();
               const response = editingBonusId
                    ? await customPost(`payroll/bonuses/${editingBonusId}`, 'PUT', payload)
                    : await customPost('payroll/bonuses', 'POST', payload);

               if (response?.status === 'success') {
                    closeModal();
                    await fetchBonuses(selectedEmployeeId);
               } else {
                    setError(response?.message || `Failed to ${editingBonusId ? 'update' : 'create'} bonus`);
               }
          } catch (err: any) {
               setError(err?.message || `Error trying to ${editingBonusId ? 'update' : 'create'} bonus`);
          } finally {
               setSubmitting(false);
          }
     };

     const handleDelete = async (bonus: Bonus) => {
          if (bonus.status === 'paid') {
               setError('Paid bonuses cannot be deleted');
               return;
          }

          if (!confirm(`Delete ${bonus.bonus_type} bonus for ${selectedEmployee?.username || 'this employee'}?`)) {
               return;
          }

          setDeletingId(bonus.id);
          setError(null);
          try {
               const response = await customPost(`payroll/bonuses/${bonus.id}`, 'DELETE', {});
               if (response?.status === 'success') {
                    await fetchBonuses(selectedEmployeeId);
               } else {
                    setError(response?.message || 'Failed to delete bonus');
               }
          } catch (err: any) {
               setError(err?.message || 'Error deleting bonus');
          } finally {
               setDeletingId(null);
          }
     };

     return (
          <div className={screens.page}>
               <div className={screens.header}>
                    <div className="d-flex align-items-center">
                         <button type="button" onClick={() => router.push('/human-resource/payroll')} className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </button>
                         <div>
                              <span className={screens.eyebrow}>Payroll / Pay additions & deductions</span>
<h1 className={screens.title}>
                                   <RiAwardLine size={24} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   Employee Bonuses
                              </h1>
                              <p className="text-muted mb-0 small">Create, review, update, and delete employee bonus records</p>
                         </div>
                    </div>
                    <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openCreateModal} disabled={!selectedEmployeeId} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                         <RiAddLine size={18} className="me-1" /> Add Bonus
                    </button>
               </div>

               {error && <div role="alert" className="alert alert-danger">{error}</div>}

               <div className="row g-4 mb-4">
                    <div className="col-lg-4">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">Employee Context</h5>
                              <label className="form-label fw-medium">Employee</label>
                              <select aria-label="Employee" className="form-select mb-3" value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)} disabled={employeesLoading}>
                                   <option value="">Select employee</option>
                                   {employees.map((employee) => (
                                        <option key={employee.employeeid} value={employee.employeeid}>
                                             {employee.username} - {employee.role}
                                        </option>
                                   ))}
                              </select>

                              <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                   <div className="small text-muted mb-1">Selected Employee</div>
                                   <div className="fw-bold">{selectedEmployee?.username || 'None selected'}</div>
                                   <div className="small text-muted">{selectedEmployee?.role || 'Choose an employee to load bonuses'}</div>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-8">
                         <div className="row g-3">
                              <div className="col-md-3">
                                   <div className={screens.metric} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="small text-muted mb-1">Total Bonuses</div>
                                        <div className="fs-4 fw-bold">{summary.total}</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className={screens.metric} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="small text-muted mb-1">Pending</div>
                                        <div className="fs-4 fw-bold">{summary.pending}</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className={screens.metric} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="small text-muted mb-1">Approved</div>
                                        <div className="fs-4 fw-bold">{summary.approved}</div>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="small text-muted mb-1">Total Amount</div>
                                        <div className="fw-bold">{currencyFormatter.format(summary.totalAmount)}</div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                         <h5 className="mb-0">Bonus List</h5>
                         <div className="small text-muted">{selectedEmployee ? `${selectedEmployee.username}'s bonuses` : 'Select an employee to view bonuses'}</div>
                    </div>

                    <div className={screens.tableWrap}>
                         <table className={screens.table}>
                              <thead className="table-light">
                                   <tr>
                                        <th className="text-start">Bonus Type</th>
                                        <th className="text-end">Amount</th>
                                        <th className="text-start">Tax Method</th>
                                        <th className="text-start">Status</th>
                                        <th className="text-start">Rating</th>
                                        <th className="text-start">Approved Date</th>
                                        <th className="text-start">Payment Date</th>
                                        <th className="text-start">Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {loading ? (
                                        <tr>
                                             <td colSpan={8} className="text-center py-4 text-muted">Loading bonuses...</td>
                                        </tr>
                                   ) : bonuses.length > 0 ? bonuses.map((bonus) => (
                                        <tr key={bonus.id}>
                                             <td className="text-capitalize">{bonus.bonus_type}</td>
                                             <td className="text-end">{currencyFormatter.format(Number(bonus.amount || 0))}</td>
                                             <td className="text-capitalize">{bonus.tax_method.replace('_', ' ')}</td>
                                             <td className="text-capitalize">{bonus.status}</td>
                                             <td>{bonus.performance_rating || 'N/A'}</td>
                                             <td>{bonus.approved_date ? new Date(bonus.approved_date).toLocaleDateString() : 'N/A'}</td>
                                             <td>{bonus.payment_date ? new Date(bonus.payment_date).toLocaleDateString() : 'N/A'}</td>
                                             <td>
                                                  <div className="d-flex gap-2 flex-wrap">
                                                       <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openEditModal(bonus)}>
                                                            <RiEditLine size={14} />
                                                       </button>
                                                       {bonus.status !== 'paid' && (
                                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(bonus)} disabled={deletingId === bonus.id}>
                                                                 {deletingId === bonus.id ? '...' : <RiDeleteBinLine size={14} />}
                                                            </button>
                                                       )}
                                                  </div>
                                             </td>
                                        </tr>
                                   )) : (
                                        <tr>
                                             <td colSpan={8} className="text-center py-4 text-muted">No bonuses found for the selected employee.</td>
                                        </tr>
                                   )}
                              </tbody>
                         </table>
                    </div>
               </div>

               {showModal && (
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1060 }}>
                         <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" onClick={closeModal} />
                         <div className="position-relative h-100 d-flex align-items-center justify-content-center p-3">
                              <div className="border rounded shadow-lg w-100" style={{ maxWidth: '760px', backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                                        <div>
                                             <h5 className="fw-semibold mb-1">{editingBonusId ? 'Update Bonus' : 'New Bonus'}</h5>
                                             <p className="text-muted mb-0 small">{selectedEmployee?.username || 'Employee bonus record'}</p>
                                        </div>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>
                                             <RiCloseLine size={16} />
                                        </button>
                                   </div>

                                   <form onSubmit={handleSubmit} className="p-4"><fieldset disabled={submitting} className={screens.formFields}>
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Employee <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <select aria-label="Employee" name="employeeid" className="form-select" value={formData.employeeid} onChange={handleChange} required>
                                                       <option value="">Select employee</option>
                                                       {employees.map((employee) => (
                                                            <option key={employee.employeeid} value={employee.employeeid}>
                                                                 {employee.username} - {employee.role}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Bonus Type</label>
                                                  <select aria-label="Bonus Type" name="bonus_type" className="form-select" value={formData.bonus_type} onChange={handleChange}>
                                                       {BONUS_TYPES.map((type) => (
                                                            <option key={type} value={type}>{type}</option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Amount <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="Amount" type="number" min="0" step="0.01" name="amount" className="form-control" value={formData.amount} onChange={handleChange} required />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Tax Method</label>
                                                  <select aria-label="Tax Method" name="tax_method" className="form-select" value={formData.tax_method} onChange={handleChange}>
                                                       {TAX_METHODS.map((method) => (
                                                            <option key={method} value={method}>{method}</option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Status</label>
                                                  <select aria-label="Status" name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                                       {STATUS_OPTIONS.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="form-check form-switch mt-4 pt-2">
                                                       <input className="form-check-input" type="checkbox" id="is_taxable" name="is_taxable" checked={formData.is_taxable} onChange={handleChange} />
                                                       <label className="form-check-label" htmlFor="is_taxable">Taxable bonus</label>
                                                  </div>
                                             </div>
                                             {/* START DATE */}
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Start Date <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="Start Date" type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange} required />
                                             </div>
                                             {/* END DATE */}
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">End Date <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="End Date" type="date" name="end_date" className="form-control" value={formData.end_date} onChange={handleChange} required />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Performance Rating</label>
                                                  <input aria-label="Performance Rating" type="number" min="1" max="5" name="performance_rating" className="form-control" value={formData.performance_rating} onChange={handleChange} placeholder="1 - 5" />
                                             </div>
                                             {requiresApprovalFields && (
                                                  <div className="col-md-6">
                                                       <label className="form-label fw-medium">Approved Date</label>
                                                       <input aria-label="Approved Date" type="date" name="approved_date" className="form-control" value={formData.approved_date} onChange={handleChange} required={requiresApprovalFields} />
                                                  </div>
                                             )}
                                             {formData.status === 'paid' && (
                                                  <div className="col-md-6">
                                                       <label className="form-label fw-medium">Payment Date</label>
                                                       <input aria-label="Payment Date" type="date" name="payment_date" className="form-control" value={formData.payment_date} onChange={handleChange} />
                                                  </div>
                                             )}
                                             <div className="col-12">
                                                  <label className="form-label fw-medium">Reason</label>
                                                  <textarea aria-label="Reason" name="reason" className="form-control" rows={3} value={formData.reason} onChange={handleChange} placeholder="Reason for the bonus" />
                                             </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                             <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                                             <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={submitting} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                                  {submitting ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                            Saving...
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-1" />
                                                            {editingBonusId ? 'Update' : 'Create'}
                                                       </>
                                                  )}
                                             </button>
                                        </div>
                                   </fieldset></form>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}