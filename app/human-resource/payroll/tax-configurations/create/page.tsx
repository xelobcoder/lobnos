'use client';
import PayrollFormSummary from '../../PayrollFormSummary';
import PayrollFormFrame from '../../PayrollFormFrame';
import screens from '../../PayrollScreens.module.css';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
     RiDeleteBinLine
} from '@remixicon/react';
import { customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';

const taxConfigurationSchema = z.object({
     tax_year: z.string().regex(/^\d{4}$/, 'Tax year must be a 4-digit year'),
     country: z.string().min(1, 'Country cannot be empty').max(100, 'Country cannot exceed 100 characters'),
     tax_bands: z.array(z.object({
          min: z.number().min(0, 'Min amount cannot be negative'),
          max: z.union([z.number().min(0, 'Max amount cannot be negative'), z.null()]),
          rate: z.number().min(0, 'Rate cannot be negative').max(100, 'Rate cannot exceed 100%')
     })).min(1, 'At least one tax band is required'),
     created_by: z.number().positive('Created by must be a positive number').optional()
});

interface TaxBand {
     min: string;
     max: string;
     rate: string;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function CreateTaxConfigurationPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [formData] = useState({
          tax_year: new Date().getFullYear().toString(),
          country: 'Ghana'
     });
     const [taxBands, setTaxBands] = useState<TaxBand[]>([
          { min: '0', max: '', rate: '0' }
     ]);
     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

     const handleBandChange = (index: number, field: keyof TaxBand, value: string) => {
          const newBands = [...taxBands];
          newBands[index][field] = value;
          setTaxBands(newBands);
     };

     const addTaxBand = () => {
          setTaxBands([...taxBands, { min: '', max: '', rate: '' }]);
     };

     const removeTaxBand = (index: number) => {
          if (taxBands.length > 1) {
               setTaxBands(taxBands.filter((_, i) => i !== index));
          }
     };

     const validateForm = (): boolean => {
          try {
               taxConfigurationSchema.parse({
                    tax_year: formData.tax_year,
                    country: formData.country,
                    tax_bands: taxBands.map((band) => ({
                         min: Number(band.min),
                         max: band.max ? Number(band.max) : null,
                         rate: Number(band.rate)
                    })),
                    created_by: user?.employeeid
               });

               setValidationErrors({});
               return true;
          } catch (error) {
               if (error instanceof z.ZodError) {
                    const errors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                         const path = err.path.join('.');
                         if (path.startsWith('tax_bands.')) {
                              const parts = path.split('.');
                              const bandIndex = parseInt(parts[1]);
                              const field = parts[2];
                              errors[`band_${bandIndex}_${field}`] = err.message;
                         } else {
                              errors[path] = err.message;
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
                    created_by: user?.employeeid
               };

               const response = await customPost('payroll/tax-configurations', 'POST', payload);

               if (response?.status === 'success') {
                    router.push('/human-resource/payroll/tax-configurations');
               } else {
                    setError(response?.message || 'Failed to create tax configuration');
               }
          } catch (err: any) {
               setError(err?.message || 'Error creating tax configuration');
          } finally {
               setLoading(false);
          }
     };

     return (
          <PayrollFormFrame busy={loading} className={screens.page}>
               <div className={screens.header}>
                    <Link href="/human-resource/payroll/tax-configurations" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="flex-grow-1">
                         <span className={screens.eyebrow}>Payroll / Statutory configuration</span>
<h1 className={screens.title}>
                              <RiMoneyDollarCircleLine size={24} style={{ color: COLOR_ACCENT }} className="me-2" />
                              Create Tax Configuration
                         </h1>
                         <p className="text-muted mb-0 small">Set up tax year, country, and tax bands</p>
                    </div>
               </div>

               {error && (
                    <div role="alert" className="alert alert-danger d-flex align-items-center mb-4">
                         <RiErrorWarningLine size={18} className="me-2" />
                         {error}
                    </div>
               )}

               <form onSubmit={handleSubmit}>
<fieldset disabled={loading} className={screens.formFields}><p className={screens.formHint}>Fields marked * are required. Review the details before saving.</p>
                    <div className={screens.editorGrid}><div className={screens.editorMain}>
                         <div>
                              <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-4 d-flex align-items-center">
                                        <RiFileTextLine size={20} className="me-2" />
                                        Basic Information
                                   </h5>

                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Tax Year *</label>
                                             <input aria-label="Tax Year"
                                                  type="number"
                                                  className={`form-control ${validationErrors.tax_year ? 'is-invalid' : ''}`}
                                                  name="tax_year"
                                                  value={formData.tax_year}
                                                  disabled
                                             />
                                             {validationErrors.tax_year && <div className="invalid-feedback">{validationErrors.tax_year}</div>}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Country *</label>
                                             <input aria-label="Country"
                                                  type="text"
                                                  className={`form-control ${validationErrors.country ? 'is-invalid' : ''}`}
                                                  name="country"
                                                  value={formData.country}
                                                  disabled
                                             />
                                             {validationErrors.country && <div className="invalid-feedback">{validationErrors.country}</div>}
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className="col-12">
                              <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
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

                                   <div className={screens.tableWrap}>
                                        <table className={`${screens.table} ${screens.taxBandTable}`}>
                                             <thead className="table-light">
                                                  <tr>
                                                       <th className="text-start">Lower bound</th>
                                                       <th className="text-start">Upper bound</th>
                                                       <th className="text-start">Rate (%)</th>
                                                       <th className="text-start">Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {taxBands.map((band, index) => (
                                                       <tr key={index}>
                                                            <td data-label="Lower bound">
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_min`] ? 'is-invalid' : ''}`}
                                                                      aria-label={`Band ${index + 1} lower bound`} value={band.min}
                                                                      onChange={(event) => handleBandChange(index, 'min', event.target.value)}
                                                                      min="0"
                                                                      step="0.01"
                                                                 />
                                                                 {validationErrors[`band_${index}_min`] && <div className="invalid-feedback">{validationErrors[`band_${index}_min`]}</div>}
                                                            </td>
                                                            <td data-label="Upper bound">
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_max`] ? 'is-invalid' : ''}`}
                                                                      aria-label={`Band ${index + 1} upper bound (optional)`} value={band.max}
                                                                      onChange={(event) => handleBandChange(index, 'max', event.target.value)}
                                                                      min="0"
                                                                      step="0.01"
                                                                      placeholder="No maximum"
                                                                 />
                                                                 {validationErrors[`band_${index}_max`] && <div className="invalid-feedback">{validationErrors[`band_${index}_max`]}</div>}
                                                            </td>
                                                            <td data-label="Rate (%)">
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_rate`] ? 'is-invalid' : ''}`}
                                                                      aria-label={`Band ${index + 1} tax rate percent`} value={band.rate}
                                                                      onChange={(event) => handleBandChange(index, 'rate', event.target.value)}
                                                                      min="0"
                                                                      max="100"
                                                                      step="0.01"
                                                                 />
                                                                 {validationErrors[`band_${index}_rate`] && <div className="invalid-feedback">{validationErrors[`band_${index}_rate`]}</div>}
                                                            </td>
                                                            <td data-label="Actions">
                                                                 <button type="button" className="btn btn-outline-danger btn-sm" aria-label={`Remove tax band ${index + 1}`} onClick={() => removeTaxBand(index)} disabled={taxBands.length === 1}>
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
                    </div><PayrollFormSummary title="Review tax configuration" items={[
                         {label:'Country',value:formData.country},
                         {label:'Tax year',value:String(formData.tax_year)},
                         {label:'Progressive bands',value:String(taxBands.length)},
                         {label:'Highest band rate',value:`${Math.max(0,...taxBands.map(band=>Number(band.rate)||0))}%`}
                    ]} help="Review cumulative lower and upper bounds. Leave only the final upper bound empty for an unlimited band. Published Ghana presets are managed through Ghana payroll setup." /></div>

                    <div className={screens.saveBar}>
                         <Link href="/human-resource/payroll/tax-configurations" className="btn btn-outline-secondary">
                              Cancel
                         </Link>
                         <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={loading}>
                              {loading ? (
                                   <>
                                        <RiLoader4Line size={16} className="animate-spin me-2" />
                                        Creating...
                                   </>
                              ) : (
                                   <>
                                        <RiSaveLine size={16} className="me-2" />
                                        Create Configuration
                                   </>
                              )}
                         </button>
                    </div>
               </fieldset>
</form>
          </PayrollFormFrame>
     );
}