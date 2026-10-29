'use client';
import PayrollFormFrame from '../../../../PayrollFormFrame';
import screens from '../../../../PayrollScreens.module.css';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
     RiAddLine,
     RiArrowLeftLine,
     RiErrorWarningLine,
     RiLoader4Line,
     RiSaveLine,
     RiShieldCheckLine
} from '@remixicon/react';
import { customFetch, customPost } from '../../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../../components/Auth/useApplicationContext';

interface TaxConfigurationSummary {
     id: number;
     tax_year: string;
     country: string;
     is_active: boolean;
}

type ReliefFormState = {
     relief_code: string;
     relief_name: string;
     calculation_method: 'fixed' | 'per_dependent' | 'percentage_of_gross';
     amount: string;
     is_active: boolean;
     requires_disability: boolean;
};

const RELIEF_CALCULATION_METHODS: ReliefFormState['calculation_method'][] = ['fixed', 'per_dependent', 'percentage_of_gross'];
const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

const defaultFormState = (): ReliefFormState => ({
     relief_code: '',
     relief_name: '',
     calculation_method: 'fixed',
     amount: '',
     is_active: true,
     requires_disability: false
});

export default function CreateTaxReliefPage() {
     const params = useParams();
     const router = useRouter();
     const configId = params?.id as string;
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [pageLoading, setPageLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [config, setConfig] = useState<TaxConfigurationSummary | null>(null);
     const [formData, setFormData] = useState<ReliefFormState>(defaultFormState());

     useEffect(() => {
          const loadConfig = async () => {
               setPageLoading(true);
               setError(null);
               try {
                    const response = await customFetch(`payroll/tax-configurations/${configId}`);
                    if (response?.status === 'success' && response?.statusCode === 200) {
                         setConfig(response.result);
                    } else {
                         setError(response?.message || 'Failed to load tax configuration');
                    }
               } catch (fetchError: any) {
                    setError(fetchError?.message || 'Error loading tax configuration');
               } finally {
                    setPageLoading(false);
               }
          };

          if (configId) {
               loadConfig();
          }
     }, [configId]);

     const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;
          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setLoading(true);
          setError(null);

          try {
               if (!formData.relief_name.trim()) {
                    throw new Error('Relief name is required');
               }

               const amount = Number(formData.amount);
               if (!Number.isFinite(amount) || amount < 0) {
                    throw new Error('Amount must be a valid non-negative number');
               }

               const payload: Record<string, unknown> = {
                    tax_configuration_id: Number(configId),
                    relief_name: formData.relief_name.trim(),
                    calculation_method: formData.calculation_method,
                    amount,
                    is_active: formData.is_active,
                    requires_disability: formData.requires_disability,
                    created_by: user?.employeeid
               };

               if (formData.relief_code.trim()) {
                    payload.relief_code = formData.relief_code.trim();
               }

               const response = await customPost('payroll/tax-reliefs', 'POST', payload);
               if (response?.status === 'success') {
                    router.push(`/human-resource/payroll/tax-configurations/${configId}`);
               } else {
                    setError(response?.message || 'Failed to create tax relief');
               }
          } catch (submitError: any) {
               setError(submitError?.message || 'Error creating tax relief');
          } finally {
               setLoading(false);
          }
     };

     if (pageLoading) {
          return (
               <div className={screens.page}>
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading tax relief form...</p>
                    </div>
               </div>
          );
     }

     if (error && !config) {
          return (
               <div className={screens.page}>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Unable to load tax relief page</h5>
                         <p className="text-muted px-3">{error}</p>
                         <div className="d-flex gap-2">
                              <button className="btn btn-primary" onClick={() => router.refresh()}>
                                   Try Again
                              </button>
                              <Link href={`/human-resource/payroll/tax-configurations/${configId}`} className="btn btn-outline-secondary">
                                   Back to Configuration
                              </Link>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <PayrollFormFrame busy={loading} className={screens.page}>
               <div className={screens.header}>
                    <div className="d-flex align-items-center">
                         <Link href={`/human-resource/payroll/tax-configurations/${configId}`} className="btn btn-outline-secondary me-3 d-flex align-items-center">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <span className={screens.eyebrow}>Payroll / Statutory configuration</span>
<h1 className={screens.title}>Add Tax Relief</h1>
                              <p className="text-muted mb-0">
                                   {config ? `${config.country} ${config.tax_year}` : 'Create a relief for this tax configuration'}
                              </p>
                         </div>
                    </div>
                    <div className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                         <RiShieldCheckLine size={16} className="me-2" />
                         Linked to configuration
                    </div>
               </div>

               {error && <div role="alert" className="alert alert-danger">{error}</div>}

               <div className="row justify-content-center">
                    <div className="col-lg-8">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <form onSubmit={handleSubmit}>
<fieldset disabled={loading} className={screens.formFields}><p className={screens.formHint}>Fields marked * are required. Review the details before saving.</p>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Relief Code</label>
                                             <input aria-label="Relief Code"
                                                  type="text"
                                                  name="relief_code"
                                                  className="form-control"
                                                  value={formData.relief_code}
                                                  onChange={handleChange}
                                                  placeholder="REL-001"
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Relief Name <span className="text-danger">*</span></label>
                                             <input aria-label="Relief Name"
                                                  type="text"
                                                  name="relief_name"
                                                  className="form-control"
                                                  value={formData.relief_name}
                                                  onChange={handleChange}
                                                  placeholder="Standard Relief"
                                                  required
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Calculation Method</label>
                                             <select aria-label="Calculation Method" name="calculation_method" className="form-select" value={formData.calculation_method} onChange={handleChange}>
                                                  {RELIEF_CALCULATION_METHODS.map((method) => (
                                                       <option key={method} value={method}>
                                                            {method.replace('_', ' ')}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Amount <span className="text-danger">*</span></label>
                                             <input aria-label="Amount"
                                                  type="number"
                                                  name="amount"
                                                  className="form-control"
                                                  value={formData.amount}
                                                  onChange={handleChange}
                                                  min="0"
                                                  step="0.01"
                                                  placeholder="0.00"
                                                  required
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <div className="form-check form-switch mt-4">
                                                  <input className="form-check-input" type="checkbox" id="requires_disability" name="requires_disability" checked={formData.requires_disability} onChange={handleChange} />
                                                  <label className="form-check-label" htmlFor="requires_disability">
                                                       Requires disability
                                                  </label>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="form-check form-switch mt-4">
                                                  <input className="form-check-input" type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                                  <label className="form-check-label" htmlFor="is_active">
                                                       Active
                                                  </label>
                                             </div>
                                        </div>
                                   </div>

                                   <div className={screens.saveBar}>
                                        <Link href={`/human-resource/payroll/tax-configurations/${configId}`} className="btn btn-outline-secondary">
                                             Cancel
                                        </Link>
                                        <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={loading} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                             {loading ? (
                                                  <>
                                                       <RiLoader4Line size={18} className="me-2 animate-spin" />
                                                       Saving...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiSaveLine size={18} className="me-2" />
                                                       Create Relief
                                                  </>
                                             )}
                                        </button>
                                   </div>
                              </fieldset>
</form>
                         </div>
                    </div>
               </div>
          </PayrollFormFrame>
     );
}
