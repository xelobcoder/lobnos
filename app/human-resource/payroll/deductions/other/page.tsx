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
     RiEditLine,
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
     deduction_definition_id?: number | null;
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

interface DeductionDefinition {
     id: number;
     deduction_code: string;
     deduction_name: string;
     default_calculation_method: 'fixed_amount' | 'percentage_of_gross';
     default_amount: number | null;
     is_statutory: boolean;
     is_active: boolean;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const DEDUCTION_TYPES = ['loan', 'advance', 'garnishment', 'union_dues', 'insurance', 'cooperative', 'welfare', 'savings', 'disciplinary', 'other'];
const FREQUENCIES = ['monthly', 'bi-weekly', 'weekly', 'one-time'];

const toNumber = (value: unknown): number => {
     const parsed = Number(value ?? 0);
     return Number.isFinite(parsed) ? parsed : 0;
};

const toOptionalNumber = (value: unknown): number | null => {
     if (value === null || value === undefined || value === '') {
          return null;
     }
     const parsed = Number(value);
     return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value: unknown): boolean => value === true || value === 1 || value === '1';

const formatApiDate = (value?: string | null): string => {
     if (!value) {
          return 'N/A';
     }
     const parsed = new Date(value);
     if (Number.isNaN(parsed.getTime())) {
          return value;
     }
     return parsed.toLocaleDateString();
};

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

const normalizeDeduction = (item: any): OtherDeduction => ({
     ...item,
     amount: toNumber(item?.amount),
     is_recurring: toBoolean(item?.is_recurring),
     total_amount: toOptionalNumber(item?.total_amount),
     remaining_balance: toOptionalNumber(item?.remaining_balance),
     deduction_priority: toNumber(item?.deduction_priority),
     is_active: toBoolean(item?.is_active),
     approved_by: toOptionalNumber(item?.approved_by)
});

const getDeductionList = (response: any): OtherDeduction[] => {
     const rows = Array.isArray(response?.result)
          ? response.result
          : Array.isArray(response?.result?.data)
               ? response.result.data
               : [];
     return rows.map(normalizeDeduction);
};

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
     const [definitions, setDefinitions] = useState<DeductionDefinition[]>([]);
     const [loading, setLoading] = useState(false);
     const [submitting, setSubmitting] = useState(false);
     const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [editingDeductionId, setEditingDeductionId] = useState<number | null>(null);
     const [editingDeduction, setEditingDeduction] = useState<OtherDeduction | null>(null);
     const [showDeductionFormModal, setShowDeductionFormModal] = useState(false);
     const [showLoanAdjustmentModal, setShowLoanAdjustmentModal] = useState(false);
     const [loanAdjustmentSubmitting, setLoanAdjustmentSubmitting] = useState(false);
     const [loanAdjustmentSuggestion, setLoanAdjustmentSuggestion] = useState<{ deductionId: number; deductionName: string } | null>(null);
     const [loanAdjustmentForm, setLoanAdjustmentForm] = useState({
          adjustment_action: 'decrease_balance',
          adjustment_amount: '',
          reason: ''
     });
     const [formData, setFormData] = useState({
          employeeid: '',
          deduction_definition_id: '',
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
     const getEmployeeDisplayName = (deduction: OtherDeduction) => deduction.employee_name || employees.find((employee) => employee.employeeid === deduction.employeeid)?.username || String(deduction.employeeid);
     const isRepaymentHistoryConflict = (message?: string) => {
          if (!message) return false;
          return /repayment|history|cannot.*balance|manual[_\s-]?adjustment|loan adjustment/i.test(message);
     };

     useEffect(() => {
          fetchEmployees();
          fetchGlobalDeductions();
          fetchDefinitions();
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
                    setEmployeeDeductions(getDeductionList(response));
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

     const fetchDefinitions = async () => {
          try {
               const response = await customFetch('payroll/deduction-definitions?activeOnly=true');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setDefinitions(response.result || []);
               } else {
                    setDefinitions([]);
               }
          } catch {
               setDefinitions([]);
          }
     };

     const fetchGlobalDeductions = async () => {
          try {
               const activeResponse = await customFetch('payroll/deductions/other/active');
               const normalizedActive = activeResponse?.status === 'success' && activeResponse?.statusCode === 200
                    ? getDeductionList(activeResponse)
                    : [];

               setActiveDeductions(normalizedActive);

               try {
                    const pendingResponse = await customFetch('payroll/deductions/other/pending-approvals');
                    if (pendingResponse?.status === 'success' && pendingResponse?.statusCode === 200) {
                         setPendingApprovals(getDeductionList(pendingResponse));
                    } else {
                         setPendingApprovals(normalizedActive.filter((item) => item.approved_by === null || item.approved_by === undefined));
                    }
               } catch {
                    // Fallback when pending-approvals endpoint requires extra params or returns 400.
                    setPendingApprovals(normalizedActive.filter((item) => item.approved_by === null || item.approved_by === undefined));
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

     const handleDefinitionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
          const definitionId = event.target.value;
          const definition = definitions.find((item) => String(item.id) === definitionId);

          setFormData((previous) => ({
               ...previous,
               deduction_definition_id: definitionId,
               deduction_type: definition ? definition.deduction_code : previous.deduction_type,
               deduction_name: definition ? definition.deduction_name : previous.deduction_name,
               amount: definition?.default_amount !== null && definition?.default_amount !== undefined ? String(definition.default_amount) : previous.amount,
          }));
     };

     const resetForm = () => {
          setEditingDeductionId(null);
          setEditingDeduction(null);
          setLoanAdjustmentSuggestion(null);
          setFormData((previous) => ({
               ...previous,
               deduction_definition_id: '',
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
          }));
     };

     const handleEdit = (deduction: OtherDeduction) => {
          setEditingDeductionId(deduction.id);
          setEditingDeduction(deduction);
          setLoanAdjustmentSuggestion(null);
          setShowDeductionFormModal(true);
          setSelectedEmployeeId(String(deduction.employeeid));
          setFormData((previous) => ({
               ...previous,
               employeeid: String(deduction.employeeid),
               deduction_definition_id: deduction.deduction_definition_id ? String(deduction.deduction_definition_id) : '',
               deduction_type: deduction.deduction_type || 'loan',
               deduction_name: deduction.deduction_name || '',
               amount: String(deduction.amount ?? ''),
               is_recurring: Boolean(deduction.is_recurring),
               frequency: deduction.frequency || 'monthly',
               total_amount: deduction.total_amount !== null && deduction.total_amount !== undefined ? String(deduction.total_amount) : '',
               remaining_balance: deduction.remaining_balance !== null && deduction.remaining_balance !== undefined ? String(deduction.remaining_balance) : '',
               deduction_priority: String(deduction.deduction_priority ?? 1),
               start_date: toInputDate(deduction.start_date),
               end_date: toInputDate(deduction.end_date),
               is_active: Boolean(deduction.is_active),
               remarks: deduction.remarks || '',
               attachments: deduction.attachments || ''
          }));
     };

     const openCreateDeductionModal = () => {
          resetForm();
          if (selectedEmployeeId) {
               setFormData((previous) => ({ ...previous, employeeid: selectedEmployeeId }));
          }
          setShowDeductionFormModal(true);
     };

     const openLoanAdjustmentModal = () => {
          setLoanAdjustmentForm({
               adjustment_action: 'decrease_balance',
               adjustment_amount: '',
               reason: ''
          });
          setShowLoanAdjustmentModal(true);
     };

     const handleLoanAdjustmentChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value } = event.target;
          setLoanAdjustmentForm((previous) => ({ ...previous, [name]: value }));
     };

     const handleLoanAdjustmentSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          if (!loanAdjustmentSuggestion) return;

          const adjustmentAmount = Number(loanAdjustmentForm.adjustment_amount);
          if (!Number.isFinite(adjustmentAmount) || adjustmentAmount <= 0) {
               setError('Loan adjustment amount must be a positive number');
               return;
          }
          if (!loanAdjustmentForm.reason.trim()) {
               setError('Loan adjustment reason is required');
               return;
          }
          if (!user?.employeeid) {
               setError('Unable to identify adjusting employee');
               return;
          }

          setLoanAdjustmentSubmitting(true);
          setError(null);
          try {
               const response = await customPost(
                    `payroll/deductions/other/${loanAdjustmentSuggestion.deductionId}/loan-adjustment`,
                    'POST',
                    {
                         adjustment_amount: adjustmentAmount,
                         adjustment_action: loanAdjustmentForm.adjustment_action,
                         adjusted_by: user.employeeid,
                         reason: loanAdjustmentForm.reason.trim()
                    }
               );

               if (response?.status === 'success' && response?.statusCode === 201) {
                    const oldBalance = toNumber(response?.result?.old_balance);
                    const newBalance = toNumber(response?.result?.new_balance);
                    await fetchGlobalDeductions();
                    if (selectedEmployeeId) {
                         await fetchEmployeeDeductions(selectedEmployeeId);
                    }
                    setShowLoanAdjustmentModal(false);
                    setLoanAdjustmentSuggestion(null);
                    alert(`${loanAdjustmentSuggestion.deductionName}: ${currencyFormatter.format(oldBalance)} -> ${currencyFormatter.format(newBalance)}`);
               } else {
                    setError(response?.message || 'Failed to create loan adjustment');
               }
          } catch (err: any) {
               setError(err?.message || 'Error creating loan adjustment');
          } finally {
               setLoanAdjustmentSubmitting(false);
          }
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               const totalAmount = Number(formData.total_amount || formData.amount || 0);
               const usingDefinition = Boolean(formData.deduction_definition_id);

               if (!usingDefinition && !formData.deduction_name.trim()) {
                    throw new Error('Deduction name is required when not using a deduction definition');
               }

               const payload: Record<string, unknown> = {
                    employeeid: Number(formData.employeeid),
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

               if (usingDefinition) {
                    payload.deduction_definition_id = Number(formData.deduction_definition_id);
               } else {
                    payload.deduction_type = formData.deduction_type;
                    payload.deduction_name = formData.deduction_name;
               }

               const response = editingDeductionId
                    ? await customPost(`payroll/deductions/other/${editingDeductionId}`, 'PUT', payload)
                    : await customPost('payroll/deductions/other', 'POST', payload);

               if (response?.status === 'success') {
                    resetForm();
                    setShowDeductionFormModal(false);
                    if (selectedEmployeeId) {
                         await fetchEmployeeDeductions(selectedEmployeeId);
                    }
                    await fetchGlobalDeductions();
               } else {
                    const message = response?.message || `Failed to ${editingDeductionId ? 'update' : 'create'} other deduction`;
                    setError(message);

                    if (editingDeductionId && (editingDeduction?.deduction_type === 'loan' || formData.deduction_type === 'loan') && isRepaymentHistoryConflict(message)) {
                         setLoanAdjustmentSuggestion({
                              deductionId: editingDeductionId,
                              deductionName: editingDeduction?.deduction_name || formData.deduction_name || 'Loan Deduction'
                         });
                    } else {
                         setLoanAdjustmentSuggestion(null);
                    }
               }
          } catch (err: any) {
               const message = err?.message || `Error trying to ${editingDeductionId ? 'update' : 'create'} deduction`;
               setError(message);

               if (editingDeductionId && (editingDeduction?.deduction_type === 'loan' || formData.deduction_type === 'loan') && isRepaymentHistoryConflict(message)) {
                    setLoanAdjustmentSuggestion({
                         deductionId: editingDeductionId,
                         deductionName: editingDeduction?.deduction_name || formData.deduction_name || 'Loan Deduction'
                    });
               } else {
                    setLoanAdjustmentSuggestion(null);
               }
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
               const response = await customFetch(`payroll/deductions/other/${deductionId}/deactivate`);

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
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
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
                    <button
                         type="button"
                         className="btn btn-primary"
                         style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                         onClick={openCreateDeductionModal}
                    >
                         Create Deduction
                    </button>
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

               {error && (
                    <div className="alert alert-danger d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                         <span>{error}</span>
                         {loanAdjustmentSuggestion && (
                              <button
                                   type="button"
                                   className="btn btn-sm btn-outline-danger"
                                   onClick={openLoanAdjustmentModal}
                              >
                                   Create Loan Adjustment
                              </button>
                         )}
                    </div>
               )}

               <div className="row g-4">
                    <div className="col-12">
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
                                                  <th className="text-start">Start Date</th>
                                                  <th className="text-start">End Date</th>
                                                  <th className="text-start">Approved Date</th>
                                                  <th className="text-start">Approved By</th>
                                                  <th className="text-start">Status</th>
                                                  <th className="text-start">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {loading ? (
                                                  <tr>
                                                       <td colSpan={11} className="text-center py-4 text-muted">Loading employee deductions...</td>
                                                  </tr>
                                             ) : employeeDeductions.length > 0 ? employeeDeductions.map((deduction) => (
                                                  <tr key={deduction.id}>
                                                       <td className="text-start small">{deduction.deduction_name}</td>
                                                       <td className="text-start text-capitalize small">{deduction.deduction_type.replace('_', ' ')}</td>
                                                       <td className="text-end small">{currencyFormatter.format(Number(deduction.amount || 0))}</td>
                                                       <td className="text-end small">{currencyFormatter.format(Number(deduction.remaining_balance ?? deduction.total_amount ?? deduction.amount ?? 0))}</td>
                                                       <td className="text-start small text-capitalize">{deduction.frequency.replace('_', ' ')}</td>
                                                       <td className="text-start small">{formatApiDate(deduction.start_date)}</td>
                                                       <td className="text-start small">{formatApiDate(deduction.end_date)}</td>
                                                       <td className="text-start small">{formatApiDate(deduction.approved_date)}</td>
                                                       <td className="text-start small">{deduction.approved_by ?? 'N/A'}</td>
                                                       <td className="text-start small text-capitalize">{deduction.is_active ? 'active' : 'inactive'}</td>
                                                       <td className="text-start">
                                                            <div className="d-flex gap-2 flex-wrap">
                                                                 {deduction.approved_by === null || deduction.approved_by === undefined ? (
                                                                      <button type="button" className="btn btn-outline-success btn-sm" onClick={() => handleApprove(deduction.id)} disabled={actionLoadingId === deduction.id}>
                                                                           {actionLoadingId === deduction.id ? '...' : 'Approve'}
                                                                      </button>
                                                                 ) : null}
                                                                 <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(deduction)}>
                                                                      <RiEditLine size={14} />
                                                                 </button>
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
                                                       <td colSpan={11} className="text-center py-4 text-muted">No deductions found for the selected employee.</td>
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
                                                            <th className="text-start">Start Date</th>
                                                            <th className="text-start">End Date</th>
                                                            <th className="text-start">Approved Date</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {pendingApprovals.length > 0 ? pendingApprovals.slice(0, 5).map((deduction) => (
                                                            <tr key={deduction.id} className="pending-approval-row">
                                                                 <td className="text-start small">{getEmployeeDisplayName(deduction)}</td>
                                                                 <td className="text-start small">{deduction.deduction_name}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(Number(deduction.amount || 0))}</td>
                                                                 <td className="text-start small">{formatApiDate(deduction.start_date)}</td>
                                                                 <td className="text-start small">{formatApiDate(deduction.end_date)}</td>
                                                                 <td className="text-start small">{formatApiDate(deduction.approved_date)}</td>
                                                            </tr>
                                                       )) : (
                                                            <tr>
                                                                 <td colSpan={6} className="text-center py-4 text-muted">No pending approvals.</td>
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
                                                            <th className="text-start">Start Date</th>
                                                            <th className="text-start">End Date</th>
                                                            <th className="text-start">Approved Date</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {activeDeductions.length > 0 ? activeDeductions.slice(0, 5).map((deduction) => (
                                                            <tr key={deduction.id}>
                                                                 <td className="text-start small">{getEmployeeDisplayName(deduction)}</td>
                                                                 <td className="text-start small">{deduction.deduction_name}</td>
                                                                 <td className="text-end small">{currencyFormatter.format(Number(deduction.remaining_balance ?? deduction.amount ?? 0))}</td>
                                                                 <td className="text-start small">{formatApiDate(deduction.start_date)}</td>
                                                                 <td className="text-start small">{formatApiDate(deduction.end_date)}</td>
                                                                 <td className="text-start small">{formatApiDate(deduction.approved_date)}</td>
                                                            </tr>
                                                       )) : (
                                                            <tr>
                                                                 <td colSpan={6} className="text-center py-4 text-muted">No active deductions found.</td>
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

               {showDeductionFormModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => !submitting && setShowDeductionFormModal(false)}>
                         <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title fw-bold">{editingDeductionId ? 'Update Other Deduction' : 'Create Other Deduction'}</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowDeductionFormModal(false)} disabled={submitting}></button>
                                   </div>
                                   <form onSubmit={handleSubmit}>
                                        <div className="modal-body">
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

                                             <div className="mb-3">
                                                  <label className="form-label fw-medium">Deduction Definition</label>
                                                  <select name="deduction_definition_id" className="form-select" value={formData.deduction_definition_id} onChange={handleDefinitionSelect}>
                                                       <option value="">Use a custom deduction instead</option>
                                                       {definitions.map((definition) => (
                                                            <option key={definition.id} value={definition.id}>
                                                                 {definition.deduction_name} ({definition.deduction_code})
                                                            </option>
                                                       ))}
                                                  </select>
                                                  <div className="form-text">
                                                       Pick a reusable definition to auto-fill the type and name, or leave blank to enter a custom deduction.
                                                  </div>
                                             </div>

                                             {!formData.deduction_definition_id && (
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
                                             )}

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

                                             <div className="mb-1">
                                                  <label className="form-label fw-medium">Attachments</label>
                                                  <input name="attachments" type="text" className="form-control" value={formData.attachments} onChange={handleChange} placeholder="Optional file path or upload reference" />
                                             </div>
                                        </div>
                                        <div className="modal-footer">
                                             <button
                                                  type="button"
                                                  className="btn btn-outline-secondary"
                                                  onClick={() => {
                                                       setShowDeductionFormModal(false);
                                                       if (!editingDeductionId) {
                                                            resetForm();
                                                       }
                                                  }}
                                                  disabled={submitting}
                                             >
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={submitting || loading} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                                  {submitting ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                            Saving...
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-1" />
                                                            {editingDeductionId ? 'Update Deduction' : 'Create Deduction'}
                                                       </>
                                                  )}
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                    </div>
               )}

               {showLoanAdjustmentModal && loanAdjustmentSuggestion && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => !loanAdjustmentSubmitting && setShowLoanAdjustmentModal(false)}>
                         <div className="modal-dialog modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title fw-bold">Create Loan Adjustment</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowLoanAdjustmentModal(false)} disabled={loanAdjustmentSubmitting}></button>
                                   </div>
                                   <form onSubmit={handleLoanAdjustmentSubmit}>
                                        <div className="modal-body">
                                             <div className="small text-muted mb-3">
                                                  {loanAdjustmentSuggestion.deductionName}
                                             </div>

                                             <div className="mb-3">
                                                  <label className="form-label fw-medium">Adjustment Action</label>
                                                  <select
                                                       className="form-select"
                                                       name="adjustment_action"
                                                       value={loanAdjustmentForm.adjustment_action}
                                                       onChange={handleLoanAdjustmentChange}
                                                       required
                                                  >
                                                       <option value="increase_balance">Increase Balance</option>
                                                       <option value="decrease_balance">Decrease Balance</option>
                                                  </select>
                                             </div>

                                             <div className="mb-3">
                                                  <label className="form-label fw-medium">Adjustment Amount</label>
                                                  <input
                                                       type="number"
                                                       step="0.01"
                                                       min="0.01"
                                                       className="form-control"
                                                       name="adjustment_amount"
                                                       value={loanAdjustmentForm.adjustment_amount}
                                                       onChange={handleLoanAdjustmentChange}
                                                       required
                                                  />
                                             </div>

                                             <div>
                                                  <label className="form-label fw-medium">Reason</label>
                                                  <textarea
                                                       className="form-control"
                                                       rows={3}
                                                       name="reason"
                                                       value={loanAdjustmentForm.reason}
                                                       onChange={handleLoanAdjustmentChange}
                                                       placeholder="Reason for the loan balance adjustment"
                                                       required
                                                  />
                                             </div>
                                        </div>
                                        <div className="modal-footer">
                                             <button type="button" className="btn btn-secondary" onClick={() => setShowLoanAdjustmentModal(false)} disabled={loanAdjustmentSubmitting}>
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-danger" disabled={loanAdjustmentSubmitting}>
                                                  {loanAdjustmentSubmitting ? 'Submitting...' : 'Submit Adjustment'}
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                    </div>
               )}

               <style jsx global>{`
                    .animate-spin {
                         animation: spin 1s linear infinite;
                    }

                    .pending-approval-row > td {
                         background-color: var(--bs-danger-bg-subtle) !important;
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