'use client';
import screens from '../../PayrollScreens.module.css';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiLoader4Line, RiErrorWarningLine, RiArrowLeftLine, RiMoneyDollarCircleLine, RiEditLine, RiFileTextLine, RiCheckboxCircleLine, RiCloseCircleLine, RiCalendarLine, RiPlayCircleLine, RiPauseCircleLine, RiDeleteBinLine, RiHistoryLine, RiAddLine, RiCloseLine, RiSaveLine, RiShieldCheckLine } from '@remixicon/react';
import { currencyFormatter, customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';

interface TaxRelief {
     id: number;
     tax_configuration_id: number | null;
     relief_code: string | null;
     relief_name: string;
     calculation_method: 'fixed' | 'per_dependent' | 'percentage_of_gross';
     amount: number;
     is_active: boolean;
     requires_disability: boolean;
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

const defaultReliefFormState = (): ReliefFormState => ({
     relief_code: '',
     relief_name: '',
     calculation_method: 'fixed',
     amount: '',
     is_active: true,
     requires_disability: false,
});

interface TaxBand {
     min: number;
     max: number | null;
     rate: number;
}

interface TaxConfiguration {
     managed_by?:string;rule_version?:string;effective_from?:string;effective_to?:string;
     id: number;
     tax_year: string;
     country: string;
     tax_bands: TaxBand[];
     is_active: boolean;
     created_at: string;
     updated_at: string;
     created_by: number;
     created_by_name?: string;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';

export default function TaxConfigurationDetailPage() {
     const params = useParams();
     const router = useRouter();
     const configId = params?.id as string;
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(true);
     const [config, setConfig] = useState<TaxConfiguration | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [togglingStatus, setTogglingStatus] = useState(false);
     const [deleting, setDeleting] = useState(false);

     const [reliefs, setReliefs] = useState<TaxRelief[]>([]);
     const [reliefsLoading, setReliefsLoading] = useState(true);
     const [showReliefModal, setShowReliefModal] = useState(false);
     const [editingReliefId, setEditingReliefId] = useState<number | null>(null);
     const [reliefSubmitting, setReliefSubmitting] = useState(false);
     const [reliefActionId, setReliefActionId] = useState<number | null>(null);
     const [reliefError, setReliefError] = useState<string | null>(null);
     const [reliefFormData, setReliefFormData] = useState<ReliefFormState>(defaultReliefFormState());

     useEffect(() => {
          if (configId) {
               fetchTaxConfiguration();
               fetchReliefs();
          }
     }, [configId]);

     const fetchReliefs = async () => {
          setReliefsLoading(true);
          setReliefError(null);
          try {
               const response = await customFetch(`payroll/tax-reliefs?activeOnly=false`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const allReliefs: TaxRelief[] = response.result || [];
                    setReliefs(allReliefs.filter((relief) => String(relief.tax_configuration_id) === String(configId)));
               } else {
                    setReliefs([]);
               }
          } catch (err: any) {
               setReliefError(err?.message || 'Failed to load tax reliefs');
               setReliefs([]);
          } finally {
               setReliefsLoading(false);
          }
     };

     const handleReliefChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;
          setReliefFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value,
          }));
     };

     const openCreateReliefModal = () => {
          setReliefFormData(defaultReliefFormState());
          setEditingReliefId(null);
          setShowReliefModal(true);
     };

     const openEditReliefModal = (relief: TaxRelief) => {
          setReliefFormData({
               relief_code: relief.relief_code || '',
               relief_name: relief.relief_name,
               calculation_method: relief.calculation_method,
               amount: String(relief.amount),
               is_active: Boolean(relief.is_active),
               requires_disability: Boolean(relief.requires_disability),
          });
          setEditingReliefId(relief.id);
          setShowReliefModal(true);
     };

     const closeReliefModal = () => {
          setShowReliefModal(false);
          setEditingReliefId(null);
          setReliefFormData(defaultReliefFormState());
     };

     const handleReliefSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setReliefSubmitting(true);
          setReliefError(null);

          try {
               if (!reliefFormData.relief_name.trim()) {
                    throw new Error('Relief name is required');
               }

               const amount = Number(reliefFormData.amount);
               if (!Number.isFinite(amount) || amount < 0) {
                    throw new Error('Amount must be a valid non-negative number');
               }

               const payload: Record<string, unknown> = {
                    relief_name: reliefFormData.relief_name.trim(),
                    calculation_method: reliefFormData.calculation_method,
                    amount,
                    is_active: reliefFormData.is_active,
                    requires_disability: reliefFormData.requires_disability,
               };

               if (reliefFormData.relief_code.trim()) {
                    payload.relief_code = reliefFormData.relief_code.trim();
               }

               let response;
               if (editingReliefId) {
                    payload.updated_by = user?.employeeid;
                    response = await customPost(`payroll/tax-reliefs/${editingReliefId}`, 'PUT', payload);
               } else {
                    payload.tax_configuration_id = Number(configId);
                    payload.created_by = user?.employeeid;
                    response = await customPost('payroll/tax-reliefs', 'POST', payload);
               }

               if (response?.status === 'success') {
                    closeReliefModal();
                    await fetchReliefs();
               } else {
                    setReliefError(response?.message || 'Failed to save tax relief');
               }
          } catch (err: any) {
               setReliefError(err?.message || 'Error saving tax relief');
          } finally {
               setReliefSubmitting(false);
          }
     };

     const handleDeactivateRelief = async (reliefId: number) => {
          setReliefActionId(reliefId);
          setReliefError(null);
          try {
               const response = await customPost(`payroll/tax-reliefs/${reliefId}`, 'DELETE', {});
               if (response?.status === 'success') {
                    await fetchReliefs();
               } else {
                    setReliefError(response?.message || 'Failed to deactivate tax relief');
               }
          } catch (err: any) {
               setReliefError(err?.message || 'Error deactivating tax relief');
          } finally {
               setReliefActionId(null);
          }
     };

     const fetchTaxConfiguration = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`payroll/tax-configurations/${configId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setConfig(response.result);
               } else {
                    setError('Failed to load tax configuration');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching tax configuration');
          } finally {
               setLoading(false);
          }
     };

     const toggleStatus = async () => {
          if (!config) return;

          try {
               setTogglingStatus(true);
               const response = await customPost(`payroll/tax-configurations/${config.id}/status`, 'PATCH', {
                    is_active: !config.is_active
               });

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setConfig(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
                    // Refresh the page to update any cached data
                    await fetchTaxConfiguration();
               } else {
                    setError('Failed to update configuration status');
               }
          } catch (err: any) {
               setError(err?.message || 'Error updating configuration status');
          } finally {
               setTogglingStatus(false);
          }
     };

     const deleteConfiguration = async () => {
          if (!config) return;

          if (!confirm(`Are you sure you want to delete the tax configuration for ${config.tax_year}? This action cannot be undone.`)) {
               return;
          }

          try {
               setDeleting(true);
               const response = await customPost(`payroll/tax-configurations/${config.id}`, 'DELETE', {});

               if (response?.status === 'success' && response?.statusCode === 200) {
                    router.push('/human-resource/payroll/tax-configurations');
               } else {
                    setError('Failed to delete configuration');
               }
          } catch (err: any) {
               setError(err?.message || 'Error deleting configuration');
          } finally {
               setDeleting(false);
          }
     };

     const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'long',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     if (loading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted">Loading tax configuration...</p>
               </div>
          );
     }

     if (error || !config) {
          return (
               <div className={screens.page}>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error || 'Configuration not found'}</p>
                         <Link href="/human-resource/payroll/tax-configurations" className="btn btn-primary mt-3">
                              Back to Configurations
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className={screens.page}>
               {/* Header */}
               <div className={screens.header}>
                    <div className="d-flex align-items-center">
                         <Link href="/human-resource/payroll/tax-configurations" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <span className={screens.eyebrow}>Payroll / Statutory configuration</span>
<h1 className={screens.title}>
                                   <RiMoneyDollarCircleLine size={24} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   Tax Configuration {config.tax_year}
                              </h1>
                              <p className="text-muted mb-0 small">{config.country}</p>
                              <p className="text-muted mb-0 small">Created by {config.created_by_name || `User ID: ${config.created_by}`}</p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <span className={`badge fs-6 ${config.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {config.is_active ? 'Active' : 'Inactive'}
                         </span>
                         <button
                              onClick={toggleStatus}
                              disabled={togglingStatus||config.managed_by==='ghana_setup'}
                              className={`btn btn-sm d-flex align-items-center ${config.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              title={config.is_active ? 'Deactivate Configuration' : 'Activate Configuration'}
                         >
                              {togglingStatus ? (
                                   <RiLoader4Line size={16} className="animate-spin me-1" />
                              ) : config.is_active ? (
                                   <RiPauseCircleLine size={16} className="me-1" />
                              ) : (
                                   <RiPlayCircleLine size={16} className="me-1" />
                              )}
                              {config.is_active ? 'Deactivate' : 'Activate'}
                         </button>
                         <Link
                              href={config.managed_by==='ghana_setup'?'/human-resource/payroll/ghana-setup':`/human-resource/payroll/tax-configurations/${config.id}/edit`}
                              className="btn btn-primary btn-sm d-flex align-items-center"
                         >
                              <RiEditLine size={16} className="me-1" />
                              {config.managed_by==='ghana_setup'?'Ghana setup':'Edit'}
                         </Link>
                         <Link
                              href={`/human-resource/payroll/tax-configurations/${config.id}/audit`}
                              className="btn btn-outline-info btn-sm d-flex align-items-center"
                         >
                              <RiHistoryLine size={16} className="me-1" />
                              Audit History
                         </Link>
                         <button
                              onClick={deleteConfiguration}
                              disabled={deleting || config.is_active||config.managed_by==='ghana_setup'}
                              className="btn btn-outline-danger btn-sm d-flex align-items-center"
                              title={config.is_active ? 'Cannot delete active configuration' : 'Delete Configuration'}
                         >
                              {deleting ? (
                                   <RiLoader4Line size={16} className="animate-spin me-1" />
                              ) : (
                                   <RiDeleteBinLine size={16} className="me-1" />
                              )}
                              Delete
                         </button>
                    </div>
               </div>

               {config.managed_by==='ghana_setup'&&<div className="alert alert-info"><strong>GRA PAYE preset · {config.rule_version}</strong><p className="mb-0">Effective {config.effective_from} to {config.effective_to}. Ghana payroll reads these progressive bands. Employee exemptions and approved reliefs are managed in Ghana payroll setup. This published preset is versioned to preserve historical calculations.</p></div>}
               <div className="row g-4">
                    {/* Basic Information */}
                    <div className="col-lg-6">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4 d-flex align-items-center">
                                   <RiFileTextLine size={20} className="me-2" />
                                   Basic Information
                              </h5>

                              <div className="row g-3">
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tax Year</div>
                                             <div className="fw-bold">{config.tax_year}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Country</div>
                                             <div className="fw-bold">{config.country}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className={screens.panel} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Status</div>
                                             <div className="d-flex align-items-center">
                                                  {config.is_active ? (
                                                       <RiCheckboxCircleLine size={16} className="text-success me-1" />
                                                  ) : (
                                                       <RiCloseCircleLine size={16} className="text-secondary me-1" />
                                                  )}
                                                  <span className={`fw-bold ${config.is_active ? 'text-success' : 'text-secondary'}`}>
                                                       {config.is_active ? 'Active' : 'Inactive'}
                                                  </span>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tax Bands</div>
                                             <div className="fw-bold">{config.tax_bands.length} bands</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4">Configuration Metadata</h5>

                              <div className="row g-3">
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Created By</div>
                                             <div className="fw-bold">{config.created_by_name || `User ID: ${config.created_by}`}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Created At</div>
                                             <div className="fw-bold">{formatDate(config.created_at)}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Last Updated</div>
                                             <div className="fw-bold">{formatDate(config.updated_at)}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tax Bands</div>
                                             <div className="fw-bold">{config.tax_bands.length} bands</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Audit Information */}
                    <div className="col-lg-6">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4 d-flex align-items-center">
                                   <RiCalendarLine size={20} className="me-2" />
                                   Audit Information
                              </h5>

                              <div className="row g-3">
                                   <div className="col-12">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Created</div>
                                             <div className="fw-bold">{formatDate(config.created_at)}</div>
                                             <div className="text-muted small">by {config.created_by_name || `User ID: ${config.created_by}`}</div>
                                        </div>
                                   </div>
                                   <div className="col-12">
                                        <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Last Updated</div>
                                             <div className="fw-bold">{formatDate(config.updated_at)}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Tax Bands Table */}
                    <div className="col-12">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4">Tax Bands</h5>

                              <div className={screens.tableWrap}>
                                   <table className={screens.table}>
                                        <thead className="table-light">
                                             <tr>
                                                  <th className="text-start">Min Amount</th>
                                                  <th className="text-start">Max Amount</th>
                                                  <th className="text-start">Tax Rate</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {config.tax_bands.map((band, index) => (
                                                  <tr key={index}>
                                                       <td className="fw-medium">{currencyFormatter.format(band.min)}</td>
                                                       <td>{band.max ? currencyFormatter.format(band.max) : 'No maximum'}</td>
                                                       <td>
                                                            <span className="badge bg-primary">{band.rate}%</span>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>

                    {/* Tax Reliefs */}
                    <div className="col-12">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
                                   <h5 className="mb-0 d-flex align-items-center">
                                        <RiShieldCheckLine size={20} className="me-2" />
                                        Dynamic Tax Reliefs
                                   </h5>
                                   <div className="d-flex flex-wrap gap-2">
                                        <Link
                                             href={`/human-resource/payroll/tax-configurations/${configId}/reliefs/create`}
                                             className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                        >
                                             <RiAddLine size={16} className="me-1" /> Add Relief Page
                                        </Link>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm d-flex align-items-center"
                                             disabled={config.managed_by==='ghana_setup'} onClick={openCreateReliefModal}
                                             style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                        >
                                             <RiAddLine size={16} className="me-1" /> Quick Add
                                        </button>
                                   </div>
                              </div>

                              <p className="text-muted small">
                                   When active relief rows exist for this configuration, they take precedence over the default tax calculation settings for this year.
                              </p>

                              {reliefError && <div role="alert" className="alert alert-danger">{reliefError}</div>}

                              <div className={screens.tableWrap}>
                                   <table className={screens.table}>
                                        <thead className="table-light">
                                             <tr>
                                                  <th>Code</th>
                                                  <th>Name</th>
                                                  <th>Method</th>
                                                  <th className="text-end">Amount</th>
                                                  <th>Requires Disability</th>
                                                  <th>Status</th>
                                                  <th>Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {reliefs.map((relief) => (
                                                  <tr key={relief.id}>
                                                       <td className="fw-medium">{relief.relief_code || 'N/A'}</td>
                                                       <td>{relief.relief_name}</td>
                                                       <td className="text-capitalize">{relief.calculation_method.replace(/_/g, ' ')}</td>
                                                       <td className="text-end">{relief.calculation_method === 'percentage_of_gross' ? `${relief.amount}%` : currencyFormatter.format(relief.amount)}</td>
                                                       <td>{relief.requires_disability ? 'Yes' : 'No'}</td>
                                                       <td>
                                                            {relief.is_active ? (
                                                                 <span className="badge bg-success-subtle text-success border border-success-subtle">Active</span>
                                                            ) : (
                                                                 <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Inactive</span>
                                                            )}
                                                       </td>
                                                       <td>
                                                            <div className="d-flex gap-2">
                                                                 <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openEditReliefModal(relief)}>
                                                                      <RiEditLine size={14} />
                                                                 </button>
                                                                 {relief.is_active && (
                                                                      <button
                                                                           type="button"
                                                                           className="btn btn-outline-danger btn-sm"
                                                                           onClick={() => handleDeactivateRelief(relief.id)}
                                                                           disabled={reliefActionId === relief.id}
                                                                      >
                                                                           {reliefActionId === relief.id ? '...' : 'Deactivate'}
                                                                      </button>
                                                                 )}
                                                            </div>
                                                       </td>
                                                  </tr>
                                             ))}
                                             {!reliefsLoading && reliefs.length === 0 && (
                                                  <tr>
                                                       <td colSpan={7} className="text-center text-muted py-4">
                                                            {config.managed_by==='ghana_setup'?'Employee-approved reliefs are managed in Ghana payroll setup.':'No dynamic tax reliefs configured for this tax year. The fixed exemption fields above will be used.'}
                                                       </td>
                                                  </tr>
                                             )}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               </div>

               {showReliefModal && (
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1060 }}>
                         <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" onClick={closeReliefModal} />
                         <div className="position-relative h-100 d-flex align-items-center justify-content-center p-3">
                              <div className="border rounded shadow-lg w-100" style={{ maxWidth: '560px', backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                                        <div>
                                             <h5 className="fw-semibold mb-1">{editingReliefId ? 'Update Tax Relief' : 'New Tax Relief'}</h5>
                                             <p className="text-muted mb-0 small">Applies to tax year {config.tax_year}</p>
                                        </div>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeReliefModal}>
                                             <RiCloseLine size={16} />
                                        </button>
                                   </div>

                                   <form onSubmit={handleReliefSubmit} className="p-4">
                                        <div className="mb-3">
                                             <label className="form-label fw-medium">Relief Code</label>
                                             <input aria-label="Relief Code" type="text" name="relief_code" className="form-control" value={reliefFormData.relief_code} onChange={handleReliefChange} placeholder="DEPENDENT_RELIEF (optional)" />
                                        </div>

                                        <div className="mb-3">
                                             <label className="form-label fw-medium">Relief Name <span className="text-danger" aria-hidden="true">*</span></label>
                                             <input aria-label="Relief Name" type="text" name="relief_name" className="form-control" value={reliefFormData.relief_name} onChange={handleReliefChange} placeholder="Dependent Relief" required />
                                        </div>

                                        <div className="row g-3 mb-3">
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Calculation Method <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <select aria-label="Calculation Method" name="calculation_method" className="form-select" value={reliefFormData.calculation_method} onChange={handleReliefChange} required>
                                                       {RELIEF_CALCULATION_METHODS.map((method) => (
                                                            <option key={method} value={method}>
                                                                 {method.replace(/_/g, ' ')}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Amount <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="Amount" type="number" min="0" step="0.01" name="amount" className="form-control" value={reliefFormData.amount} onChange={handleReliefChange} required />
                                             </div>
                                        </div>

                                        <div className="d-flex gap-4 mb-4">
                                             <div className="form-check">
                                                  <input className="form-check-input" type="checkbox" id="requires_disability" name="requires_disability" checked={reliefFormData.requires_disability} onChange={handleReliefChange} />
                                                  <label className="form-check-label" htmlFor="requires_disability">
                                                       Requires disability
                                                  </label>
                                             </div>
                                             <div className="form-check">
                                                  <input className="form-check-input" type="checkbox" id="relief_is_active" name="is_active" checked={reliefFormData.is_active} onChange={handleReliefChange} />
                                                  <label className="form-check-label" htmlFor="relief_is_active">
                                                       Active
                                                  </label>
                                             </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                             <button type="button" className="btn btn-outline-secondary" onClick={closeReliefModal}>
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={reliefSubmitting} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                                  {reliefSubmitting ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                            Saving...
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-1" />
                                                            {editingReliefId ? 'Update' : 'Create'}
                                                       </>
                                                  )}
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}