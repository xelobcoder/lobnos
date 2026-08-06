'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
     RiAddLine,
     RiArrowLeftLine,
     RiCheckboxCircleLine,
     RiCloseCircleLine,
     RiCloseLine,
     RiEditLine,
     RiErrorWarningLine,
     RiLoader4Line,
     RiSaveLine,
     RiShieldCheckLine,
     RiStackLine
} from '@remixicon/react';

interface DeductionDefinition {
     id: number;
     deduction_code: string;
     deduction_name: string;
     default_calculation_method: 'fixed_amount' | 'percentage_of_gross';
     default_amount: number | null;
     application_scope: 'all_employees' | 'specific_employees' | 'specific_roles';
     is_statutory: boolean;
     is_active: boolean;
     created_by?: number | null;
     updated_by?: number | null;
}

type DefinitionFormState = {
     deduction_code: string;
     deduction_name: string;
     default_calculation_method: 'fixed_amount' | 'percentage_of_gross';
     default_amount: string;
     is_statutory: boolean;
     is_active: boolean;
     application_scope: 'all_employees' | 'specific_employees' | 'specific_roles';
};

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const CALCULATION_METHODS: DefinitionFormState['default_calculation_method'][] = ['fixed_amount', 'percentage_of_gross'];

const defaultFormState = (): DefinitionFormState => ({
     deduction_code: '',
     deduction_name: '',
     default_calculation_method: 'fixed_amount',
     default_amount: '',
     is_statutory: false,
     is_active: true,
     application_scope: 'all_employees',
});

export default function DeductionDefinitionsPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [definitions, setDefinitions] = useState<DeductionDefinition[]>([]);
     const [loading, setLoading] = useState(true);
     const [showActiveOnly, setShowActiveOnly] = useState(false);
     const [showModal, setShowModal] = useState(false);
     const [editingId, setEditingId] = useState<number | null>(null);
     const [submitting, setSubmitting] = useState(false);
     const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [formData, setFormData] = useState<DefinitionFormState>(defaultFormState());

     const summary = useMemo(() => ({
          total: definitions.length,
          active: definitions.filter((item) => item.is_active).length,
          statutory: definitions.filter((item) => item.is_statutory).length,
     }), [definitions]);

     useEffect(() => {
          fetchDefinitions();
     }, [showActiveOnly]);

     const fetchDefinitions = async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch(`payroll/deduction-definitions?activeOnly=${showActiveOnly}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setDefinitions(response.result || []);
               } else {
                    setDefinitions([]);
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to load deduction definitions');
               setDefinitions([]);
          } finally {
               setLoading(false);
          }
     };

     const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;
          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value,
          }));
     };

     const openCreateModal = () => {
          setFormData(defaultFormState());
          setEditingId(null);
          setShowModal(true);
     };

     const openEditModal = (definition: DeductionDefinition) => {
          setFormData({
               deduction_code: definition.deduction_code,
               deduction_name: definition.deduction_name,
               default_calculation_method: definition.default_calculation_method,
               default_amount: definition.default_amount !== null && definition.default_amount !== undefined ? String(definition.default_amount) : '',
               is_statutory: Boolean(definition.is_statutory),
               is_active: Boolean(definition.is_active),
               application_scope: definition.application_scope,
          });
          setEditingId(definition.id);
          setShowModal(true);
     };

     const closeModal = () => {
          setShowModal(false);
          setEditingId(null);
          setFormData(defaultFormState());
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               if (!formData.deduction_code.trim() || !formData.deduction_name.trim()) {
                    throw new Error('Deduction code and name are required');
               }

               const payload: Record<string, unknown> = {
                    deduction_name: formData.deduction_name.trim(),
                    default_calculation_method: formData.default_calculation_method,
                    is_statutory: formData.is_statutory,
                    is_active: formData.is_active,
                    application_scope: formData.application_scope,
               };

               if (formData.default_amount.trim()) {
                    payload.default_amount = Number(formData.default_amount);
               }

               let response;
               if (editingId) {
                    payload.updated_by = user?.employeeid;
                    response = await customPost(`payroll/deduction-definitions/${editingId}`, 'PUT', payload);
               } else {
                    payload.deduction_code = formData.deduction_code.trim();
                    payload.created_by = user?.employeeid;
                    response = await customPost('payroll/deduction-definitions', 'POST', payload);
               }

               if (response?.status === 'success') {
                    closeModal();
                    await fetchDefinitions();
               } else {
                    setError(response?.message || 'Failed to save deduction definition');
               }
          } catch (err: any) {
               setError(err?.message || 'Error saving deduction definition');
          } finally {
               setSubmitting(false);
          }
     };

     const handleDeactivate = async (definitionId: number) => {
          setActionLoadingId(definitionId);
          setError(null);
          try {
               const response = await customPost(`payroll/deduction-definitions/${definitionId}`, 'DELETE', {});
               if (response?.status === 'success') {
                    await fetchDefinitions();
               } else {
                    setError(response?.message || 'Failed to deactivate deduction definition');
               }
          } catch (err: any) {
               setError(err?.message || 'Error deactivating deduction definition');
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
                         <RiStackLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Deduction Definitions</h1>
                              <p className="text-muted mb-0 small">Reusable master records used by employee other deductions</p>
                         </div>
                    </div>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-md-4">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiStackLine size={18} className="me-2 text-primary" />
                                   <span className="small text-muted fw-medium">Total Definitions</span>
                              </div>
                              <div className="fw-bold">{summary.total}</div>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={18} className="me-2 text-success" />
                                   <span className="small text-muted fw-medium">Active</span>
                              </div>
                              <div className="fw-bold">{summary.active}</div>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiShieldCheckLine size={18} className="me-2 text-warning" />
                                   <span className="small text-muted fw-medium">Statutory</span>
                              </div>
                              <div className="fw-bold">{summary.statutory}</div>
                         </div>
                    </div>
               </div>

               {error && <div className="alert alert-danger">{error}</div>}

               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                         <div className="d-flex align-items-center gap-2">
                              <div className="form-check form-switch mb-0">
                                   <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="activeOnly"
                                        checked={showActiveOnly}
                                        onChange={(event) => setShowActiveOnly(event.target.checked)}
                                   />
                                   <label className="form-check-label" htmlFor="activeOnly">
                                        Active only
                                   </label>
                              </div>
                              {loading && <span className="text-muted small">Loading...</span>}
                         </div>

                         <button
                              type="button"
                              className="btn btn-primary d-flex align-items-center"
                              onClick={openCreateModal}
                              style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                         >
                              <RiAddLine size={18} className="me-1" /> New Deduction Definition
                         </button>
                    </div>

                    <div className="table-responsive">
                         <table className="table table-sm table-hover align-middle">
                              <thead>
                                   <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Method</th>
                                        <th className="text-end">Default Amount</th>
                                        <th>Statutory</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {definitions.map((definition) => (
                                        <tr key={definition.id}>
                                             <td className="fw-medium">{definition.deduction_code}</td>
                                             <td>{definition.deduction_name}</td>
                                             <td className="text-capitalize">{definition.default_calculation_method.replace(/_/g, ' ')}</td>
                                             <td className="text-end">{definition.default_amount ?? 'N/A'}</td>
                                             <td>
                                                  {definition.is_statutory ? (
                                                       <span className="badge bg-info-subtle text-info border border-info-subtle">Statutory</span>
                                                  ) : (
                                                       <span className="text-muted small">No</span>
                                                  )}
                                             </td>
                                             <td>
                                                  {definition.is_active ? (
                                                       <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                            <RiCheckboxCircleLine size={14} className="me-1" /> Active
                                                       </span>
                                                  ) : (
                                                       <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                                            <RiCloseCircleLine size={14} className="me-1" /> Inactive
                                                       </span>
                                                  )}
                                             </td>
                                             <td>
                                                  <div className="d-flex gap-2">
                                                       <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openEditModal(definition)}>
                                                            <RiEditLine size={14} />
                                                       </button>
                                                       {definition.is_active && (
                                                            <button
                                                                 type="button"
                                                                 className="btn btn-outline-danger btn-sm"
                                                                 onClick={() => handleDeactivate(definition.id)}
                                                                 disabled={actionLoadingId === definition.id}
                                                            >
                                                                 {actionLoadingId === definition.id ? '...' : 'Deactivate'}
                                                            </button>
                                                       )}
                                                  </div>
                                             </td>
                                        </tr>
                                   ))}
                                   {!loading && definitions.length === 0 && (
                                        <tr>
                                             <td colSpan={7} className="text-center text-muted py-4">
                                                  <RiErrorWarningLine size={24} className="mb-2 d-block mx-auto" />
                                                  No deduction definitions found
                                             </td>
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
                              <div className="border rounded shadow-lg w-100" style={{ maxWidth: '560px', backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                                        <div>
                                             <h5 className="fw-semibold mb-1">{editingId ? 'Update Deduction Definition' : 'New Deduction Definition'}</h5>
                                             <p className="text-muted mb-0 small">Master record for reusable payroll deductions</p>
                                        </div>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>
                                             <RiCloseLine size={16} />
                                        </button>
                                   </div>

                                   <form onSubmit={handleSubmit} className="p-4">
                                        <div className="mb-3">
                                             <label className="form-label fw-medium">Deduction Code</label>
                                             <input
                                                  type="text"
                                                  name="deduction_code"
                                                  className="form-control"
                                                  value={formData.deduction_code}
                                                  onChange={handleChange}
                                                  placeholder="HOUSING_LEVY"
                                                  disabled={Boolean(editingId)}
                                                  required
                                             />
                                             {editingId && <div className="form-text">Code cannot be changed after creation.</div>}
                                        </div>

                                        <div className="mb-3">
                                             <label className="form-label fw-medium">Deduction Name</label>
                                             <input
                                                  type="text"
                                                  name="deduction_name"
                                                  className="form-control"
                                                  value={formData.deduction_name}
                                                  onChange={handleChange}
                                                  placeholder="Housing Levy"
                                                  required
                                             />
                                        </div>

                                        <div className='mb-3'>
                                             <label className="form-label fw-medium">Application Scope</label>
                                             <select name="application_scope" className="form-select" value={formData.application_scope} onChange={handleChange} required>
                                                  <option value="all_employees">All Employees</option>
                                                  <option value="specific_employees">Specific Employees</option>
                                                  <option value="specific_roles">Specific Roles</option>
                                             </select>
                                        </div>
                                        <div className="row g-3 mb-3">
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Calculation Method</label>
                                                  <select name="default_calculation_method" className="form-select" value={formData.default_calculation_method} onChange={handleChange} required>
                                                       {CALCULATION_METHODS.map((method) => (
                                                            <option key={method} value={method}>
                                                                 {method.replace(/_/g, ' ')}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Default Amount</label>
                                                  <input type="number" min="0" step="0.01" name="default_amount" className="form-control" value={formData.default_amount} onChange={handleChange} placeholder="Optional" />
                                             </div>
                                        </div>

                                        <div className="d-flex gap-4 mb-4">
                                             <div className="form-check">
                                                  <input className="form-check-input" type="checkbox" id="is_statutory" name="is_statutory" checked={formData.is_statutory} onChange={handleChange} />
                                                  <label className="form-check-label" htmlFor="is_statutory">
                                                       Statutory deduction
                                                  </label>
                                             </div>
                                             <div className="form-check">
                                                  <input className="form-check-input" type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                                  <label className="form-check-label" htmlFor="is_active">
                                                       Active
                                                  </label>
                                             </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                             <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={submitting} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                                  {submitting ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                            Saving...
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-1" />
                                                            {editingId ? 'Update' : 'Create'}
                                                       </>
                                                  )}
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

                    @keyframes spin {
                         from { transform: rotate(0deg); }
                         to { transform: rotate(360deg); }
                    }
               `}</style>
          </div>
     );
}
