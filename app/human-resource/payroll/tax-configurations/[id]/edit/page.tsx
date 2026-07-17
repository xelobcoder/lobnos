'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import {
     RiMoneyDollarCircleLine,
     RiArrowLeftLine,
     RiSaveLine,
     RiLoader4Line,
     RiFileTextLine,
     RiErrorWarningLine,
     RiAddLine,
     RiDeleteBinLine,
     RiCheckboxCircleLine,
     RiUserLine,
     RiCalendarLine
} from '@remixicon/react';
import { customFetch, customPost } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';

const taxConfigurationSchema = z.object({
     tax_year: z.string().regex(/^\d{4}$/, 'Tax year must be a 4-digit year'),
     country: z.string().min(1, 'Country cannot be empty').max(100, 'Country cannot exceed 100 characters'),
     tax_bands: z.array(z.object({
          min: z.number().min(0, 'Min amount cannot be negative'),
          max: z.union([z.number().min(0, 'Max amount cannot be negative'), z.null()]),
          rate: z.number().min(0, 'Rate cannot be negative').max(100, 'Rate cannot exceed 100%')
     })).min(1, 'At least one tax band is required'),
     is_active: z.boolean(),
     created_by: z.number().positive('Created by must be a positive number').optional()
});

interface TaxBand {
     min: string;
     max: string;
     rate: string;
}

interface TaxConfiguration {
     id: number;
     tax_year: string;
     country: string;
     tax_bands: Array<{ min: number; max: number | null; rate: number }>;
     is_active: boolean;
     created_by: number;
     created_by_name?: string | null;
     created_at: string;
     updated_at: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function EditTaxConfigurationPage() {
     const params = useParams();
     const router = useRouter();
     const configId = params?.id as string;
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [fetchLoading, setFetchLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [taxConfiguration, setTaxConfiguration] = useState<TaxConfiguration | null>(null);
     const [formData, setFormData] = useState({
          tax_year: '',
          country: '',
          is_active: true
     });
     const [taxBands, setTaxBands] = useState<TaxBand[]>([{ min: '', max: '', rate: '' }]);
     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

     useEffect(() => {
          if (configId) {
               fetchTaxConfiguration();
          }
     }, [configId]);

     const fetchTaxConfiguration = async () => {
          try {
               setFetchLoading(true);
               const response = await customFetch(`payroll/tax-configurations/${configId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const config: TaxConfiguration = response.result;
                    setTaxConfiguration(config);
                    setFormData({
                         tax_year: config.tax_year || '',
                         country: config.country || '',
                         is_active: Boolean(config.is_active)
                    });
                    setTaxBands((config.tax_bands || []).map((band) => ({
                         min: band.min !== null && band.min !== undefined ? String(band.min) : '',
                         max: band.max !== null && band.max !== undefined ? String(band.max) : '',
                         rate: band.rate !== null && band.rate !== undefined ? String(band.rate) : ''
                    })));
               } else {
                    setError('Failed to load tax configuration');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching tax configuration');
          } finally {
               setFetchLoading(false);
          }
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;

          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value
          }));

          if (validationErrors[name]) {
               setValidationErrors((previous) => ({
                    ...previous,
                    [name]: ''
               }));
          }
     };

     const handleBandChange = (index: number, field: keyof TaxBand, value: string) => {
          const nextBands = [...taxBands];
          nextBands[index][field] = value;
          setTaxBands(nextBands);
     };

     const addTaxBand = () => {
          setTaxBands((previous) => [...previous, { min: '', max: '', rate: '' }]);
     };

     const removeTaxBand = (index: number) => {
          if (taxBands.length > 1) {
               setTaxBands((previous) => previous.filter((_, bandIndex) => bandIndex !== index));
          }
     };

     const validateForm = (): boolean => {
          try {
               const validationData = {
                    tax_year: formData.tax_year,
                    country: formData.country,
                    tax_bands: taxBands.map((band) => ({
                         min: Number(band.min),
                         max: band.max ? Number(band.max) : null,
                         rate: Number(band.rate)
                    })),
                    is_active: formData.is_active,
                    created_by: user?.employeeid
               };

               taxConfigurationSchema.parse(validationData);
               setValidationErrors({});
               return true;
          } catch (validationError) {
               if (validationError instanceof z.ZodError) {
                    const errors: Record<string, string> = {};
                    validationError.errors.forEach((issue) => {
                         const path = issue.path.join('.');
                         if (path.startsWith('tax_bands.')) {
                              const parts = path.split('.');
                              const bandIndex = parseInt(parts[1], 10);
                              const field = parts[2];
                              errors[`band_${bandIndex}_${field}`] = issue.message;
                         } else {
                              errors[path] = issue.message;
                         }
                    });
                    setValidationErrors(errors);
               }
               return false;
          }
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
                    tax_year: formData.tax_year,
                    country: formData.country,
                    tax_bands: taxBands.map((band) => ({
                         min: Number(band.min),
                         max: band.max ? Number(band.max) : null,
                         rate: Number(band.rate)
                    })),
                    is_active: formData.is_active,
                    created_by: user?.employeeid
               };

               const response = await customPost(`payroll/tax-configurations/${configId}`, 'PUT', payload);

               if (response?.status === 'success') {
                    router.push(`/human-resource/payroll/tax-configurations/${configId}`);
               } else {
                    setError(response?.message || 'Failed to update tax configuration');
               }
          } catch (err: any) {
               setError(err?.message || 'Error updating tax configuration');
          } finally {
               setLoading(false);
          }
     };

     if (fetchLoading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted">Loading tax configuration...</p>
               </div>
          );
     }

     if (error && !taxConfiguration) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error}</p>
                         <Link href="/human-resource/payroll/tax-configurations" className="btn btn-primary mt-3">
                              Back to Configurations
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex align-items-center mb-4">
                    <Link href={`/human-resource/payroll/tax-configurations/${configId}`} className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="flex-grow-1">
                         <h1 className="h4 mb-0 fw-bold d-flex align-items-center">
                              <RiMoneyDollarCircleLine size={24} style={{ color: COLOR_ACCENT }} className="me-2" />
                              Edit Tax Configuration
                         </h1>
                         <p className="text-muted mb-0 small">Update tax year, country, and tax bands</p>
                    </div>
               </div>

               {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                         <RiErrorWarningLine size={18} className="me-2" />
                         {error}
                    </div>
               )}

               <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                         <div className="col-lg-8">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-4 d-flex align-items-center">
                                        <RiFileTextLine size={20} className="me-2" />
                                        Basic Information
                                   </h5>

                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Tax Year *</label>
                                             <input
                                                  type="number"
                                                  className={`form-control ${validationErrors.tax_year ? 'is-invalid' : ''}`}
                                                  name="tax_year"
                                                  value={formData.tax_year}
                                                  onChange={handleChange}
                                                  placeholder="e.g., 2026"
                                             />
                                             {validationErrors.tax_year && <div className="invalid-feedback">{validationErrors.tax_year}</div>}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Country *</label>
                                             <select
                                                  className={`form-select ${validationErrors.country ? 'is-invalid' : ''}`}
                                                  name="country"
                                                  value={formData.country}
                                                  onChange={handleChange}
                                             >
                                                  <option value="Ghana">Ghana</option>
                                                  <option value="Nigeria">Nigeria</option>
                                                  <option value="Kenya">Kenya</option>
                                             </select>
                                             {validationErrors.country && <div className="invalid-feedback">{validationErrors.country}</div>}
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className="col-12">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="mb-0 d-flex align-items-center">
                                             <RiMoneyDollarCircleLine size={20} className="me-2" />
                                             Tax Bands
                                        </h5>
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addTaxBand}>
                                             <RiAddLine size={16} className="me-1" />
                                             Add Band
                                        </button>
                                   </div>

                                   <div className="table-responsive">
                                        <table className="table table-sm text-start">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th className="text-start">Min</th>
                                                       <th className="text-start">Max</th>
                                                       <th className="text-start">Rate (%)</th>
                                                       <th className="text-start">Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {taxBands.map((band, index) => (
                                                       <tr key={index}>
                                                            <td>
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_min`] ? 'is-invalid' : ''}`}
                                                                      value={band.min}
                                                                      onChange={(event) => handleBandChange(index, 'min', event.target.value)}
                                                                      min="0"
                                                                      step="0.01"
                                                                 />
                                                                 {validationErrors[`band_${index}_min`] && <div className="invalid-feedback">{validationErrors[`band_${index}_min`]}</div>}
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_max`] ? 'is-invalid' : ''}`}
                                                                      value={band.max}
                                                                      onChange={(event) => handleBandChange(index, 'max', event.target.value)}
                                                                      min="0"
                                                                      step="0.01"
                                                                      placeholder="No maximum"
                                                                 />
                                                                 {validationErrors[`band_${index}_max`] && <div className="invalid-feedback">{validationErrors[`band_${index}_max`]}</div>}
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_rate`] ? 'is-invalid' : ''}`}
                                                                      value={band.rate}
                                                                      onChange={(event) => handleBandChange(index, 'rate', event.target.value)}
                                                                      min="0"
                                                                      max="100"
                                                                      step="0.01"
                                                                 />
                                                                 {validationErrors[`band_${index}_rate`] && <div className="invalid-feedback">{validationErrors[`band_${index}_rate`]}</div>}
                                                            </td>
                                                            <td>
                                                                 <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeTaxBand(index)} disabled={taxBands.length === 1}>
                                                                      <RiDeleteBinLine size={14} />
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>

                         <div className="col-lg-6">
                              <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-4 d-flex align-items-center">
                                        <RiCheckboxCircleLine size={20} className="me-2" />
                                        Status
                                   </h5>
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
                                             {formData.is_active ? 'Active configuration' : 'Inactive configuration'}
                                        </label>
                                   </div>
                              </div>
                         </div>

                         <div className="col-lg-6">
                              <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-4 d-flex align-items-center">
                                        <RiUserLine size={20} className="me-2" />
                                        Audit Info
                                   </h5>
                                   <div className="d-flex flex-column gap-3 small text-muted">
                                        <div>
                                             <div className="fw-medium text-body">Created By</div>
                                             <div>{taxConfiguration?.created_by_name || `User ID: ${taxConfiguration?.created_by ?? 'N/A'}`}</div>
                                        </div>
                                        <div>
                                             <div className="fw-medium text-body">Created At</div>
                                             <div>{taxConfiguration?.created_at ? new Date(taxConfiguration.created_at).toLocaleString() : 'N/A'}</div>
                                        </div>
                                        <div>
                                             <div className="fw-medium text-body">Last Updated</div>
                                             <div>{taxConfiguration?.updated_at ? new Date(taxConfiguration.updated_at).toLocaleString() : 'N/A'}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                         <Link href={`/human-resource/payroll/tax-configurations/${configId}`} className="btn btn-outline-secondary">
                              Cancel
                         </Link>
                         <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={loading} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                              {loading ? (
                                   <>
                                        <RiLoader4Line size={16} className="animate-spin me-2" />
                                        Updating...
                                   </>
                              ) : (
                                   <>
                                        <RiSaveLine size={16} className="me-2" />
                                        Update Configuration
                                   </>
                              )}
                         </button>
                    </div>
               </form>
          </div>
     );
}
