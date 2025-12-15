'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiLoader4Line, RiErrorWarningLine, RiArrowLeftLine, RiMoneyDollarCircleLine, RiEditLine, RiFileTextLine, RiCheckboxCircleLine, RiCloseCircleLine, RiCalendarLine, RiPlayCircleLine, RiPauseCircleLine, RiDeleteBinLine } from '@remixicon/react';
import { currencyFormatter, customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';

interface TaxBand {
     min: number;
     max: number | null;
     rate: number;
}

interface TaxConfiguration {
     id: number;
     tax_year: string;
     country: string;
     tax_bands: TaxBand[];
     standard_exemption: number;
     dependent_relief: number;
     disability_exemption: number;
     employee_ssnit_rate: number;
     employer_ssnit_rate: number;
     tier3_employee_rate: number;
     tier3_employer_rate: number;
     ssnit_ceiling?: number | null;
     pension_ceiling?: number | null;
     is_active: boolean;
     created_at: string;
     updated_at: string;
     created_by: number;
     created_by_name?: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
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

     useEffect(() => {
          if (configId) {
               fetchTaxConfiguration();
          }
     }, [configId]);

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
               <div className="container-fluid px-4 py-3">
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
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                         <Link href="/human-resource/payroll/tax-configurations" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <h1 className="h4 mb-0 fw-bold d-flex align-items-center">
                                   <RiMoneyDollarCircleLine size={24} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   Tax Configuration {config.tax_year}
                              </h1>
                              <p className="text-muted mb-0 small">{config.country}</p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <span className={`badge fs-6 ${config.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {config.is_active ? 'Active' : 'Inactive'}
                         </span>
                         <button
                              onClick={toggleStatus}
                              disabled={togglingStatus}
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
                              href={`/human-resource/payroll/tax-configurations/${config.id}/edit`}
                              className="btn btn-primary btn-sm d-flex align-items-center"
                         >
                              <RiEditLine size={16} className="me-1" />
                              Edit
                         </Link>
                         <button
                              onClick={deleteConfiguration}
                              disabled={deleting || config.is_active}
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

               <div className="row g-4">
                    {/* Basic Information */}
                    <div className="col-lg-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4 d-flex align-items-center">
                                   <RiFileTextLine size={20} className="me-2" />
                                   Basic Information
                              </h5>

                              <div className="row g-3">
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tax Year</div>
                                             <div className="fw-bold">{config.tax_year}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Country</div>
                                             <div className="fw-bold">{config.country}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
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
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tax Bands</div>
                                             <div className="fw-bold">{config.tax_bands.length} bands</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Exemptions */}
                    <div className="col-lg-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4">Exemptions & Reliefs</h5>

                              <div className="row g-3">
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Standard Exemption</div>
                                             <div className="fw-bold">{currencyFormatter.format(config.standard_exemption)}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Dependent Relief</div>
                                             <div className="fw-bold">{currencyFormatter.format(config.dependent_relief)}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Disability Exemption</div>
                                             <div className="fw-bold">{currencyFormatter.format(config.disability_exemption)}</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">SSNIT Ceiling</div>
                                             <div className="fw-bold">
                                                  {config.ssnit_ceiling ? currencyFormatter.format(config.ssnit_ceiling) : 'No ceiling'}
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Pension Ceiling</div>
                                             <div className="fw-bold">
                                                  {config.pension_ceiling ? currencyFormatter.format(config.pension_ceiling) : 'No ceiling'}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Statutory Rates */}
                    <div className="col-lg-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4">Statutory Rates</h5>

                              <div className="row g-3">
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Employee SSNIT</div>
                                             <div className="fw-bold">{config.employee_ssnit_rate}%</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Employer SSNIT</div>
                                             <div className="fw-bold">{config.employer_ssnit_rate}%</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tier 3 Employee</div>
                                             <div className="fw-bold">{config.tier3_employee_rate}%</div>
                                        </div>
                                   </div>
                                   <div className="col-sm-6">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Tier 3 Employer</div>
                                             <div className="fw-bold">{config.tier3_employer_rate}%</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Audit Information */}
                    <div className="col-lg-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4 d-flex align-items-center">
                                   <RiCalendarLine size={20} className="me-2" />
                                   Audit Information
                              </h5>

                              <div className="row g-3">
                                   <div className="col-12">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Created</div>
                                             <div className="fw-bold">{formatDate(config.created_at)}</div>
                                             <div className="text-muted small">by {config.created_by_name || `User ID: ${config.created_by}`}</div>
                                        </div>
                                   </div>
                                   <div className="col-12">
                                        <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                             <div className="text-muted small mb-1">Last Updated</div>
                                             <div className="fw-bold">{formatDate(config.updated_at)}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Tax Bands Table */}
                    <div className="col-12">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-4">Tax Bands</h5>

                              <div className="table-responsive">
                                   <table className="table table-hover table-sm">
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
               </div>
          </div>
     );
}