'use client';

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
     standard_exemption: z.number().min(0, 'Standard exemption cannot be negative'),
     dependent_relief: z.number().min(0, 'Dependent relief cannot be negative'),
     disability_exemption: z.number().min(0, 'Disability exemption cannot be negative'),
     employee_ssnit_rate: z.number().min(0, 'Employee SSNIT rate cannot be negative').max(100, 'Employee SSNIT rate cannot exceed 100%'),
     employer_ssnit_rate: z.number().min(0, 'Employer SSNIT rate cannot be negative').max(100, 'Employer SSNIT rate cannot exceed 100%'),
     tier3_employee_rate: z.number().min(0, 'Tier 3 employee rate cannot be negative').max(100, 'Tier 3 employee rate cannot exceed 100%'),
     tier3_employer_rate: z.number().min(0, 'Tier 3 employer rate cannot be negative').max(100, 'Tier 3 employer rate cannot exceed 100%'),
     ssnit_ceiling: z.number().min(0, 'SSNIT ceiling cannot be negative').optional(),
     pension_ceiling: z.number().min(0, 'Pension ceiling cannot be negative').optional(),
     is_active: z.boolean(),
     created_by: z.number().positive('Created by must be a positive number').optional()
});

interface TaxBand {
     min: string;
     max: string;
     rate: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function CreateTaxConfigurationPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const [formData, setFormData] = useState({
          tax_year: new Date().getFullYear().toString(),
          country: 'Ghana',
          standard_exemption: '',
          dependent_relief: '',
          disability_exemption: '',
          employee_ssnit_rate: '',
          employer_ssnit_rate: '',
          tier3_employee_rate: '',
          tier3_employer_rate: '',
          ssnit_ceiling: '',
          pension_ceiling: '',
          is_active: true
     });

     const [taxBands, setTaxBands] = useState<TaxBand[]>([
          { min: '0', max: '', rate: '0' }
     ]);

     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;

          setFormData(prev => ({
               ...prev,
               [name]: type === 'checkbox' ? checked : value
          }));

          // Clear validation error when user starts typing
          if (validationErrors[name]) {
               setValidationErrors(prev => ({
                    ...prev,
                    [name]: ''
               }));
          }
     };

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
               // Prepare the data for validation
               const validationData = {
                    tax_year: formData.tax_year,
                    country: formData.country,
                    tax_bands: taxBands.map(band => ({
                         min: Number(band.min),
                         max: band.max ? Number(band.max) : null,
                         rate: Number(band.rate)
                    })),
                    standard_exemption: Number(formData.standard_exemption) || 0,
                    dependent_relief: Number(formData.dependent_relief) || 0,
                    disability_exemption: Number(formData.disability_exemption) || 0,
                    employee_ssnit_rate: Number(formData.employee_ssnit_rate) || 0,
                    employer_ssnit_rate: Number(formData.employer_ssnit_rate) || 0,
                    tier3_employee_rate: Number(formData.tier3_employee_rate) || 0,
                    tier3_employer_rate: Number(formData.tier3_employer_rate) || 0,
                    ssnit_ceiling: formData.ssnit_ceiling ? Number(formData.ssnit_ceiling) : undefined,
                    pension_ceiling: formData.pension_ceiling ? Number(formData.pension_ceiling) : undefined,
                    is_active: formData.is_active,
                    created_by: user?.employeeid
               };

               // Validate with Zod
               taxConfigurationSchema.parse(validationData);
               setValidationErrors({});
               return true;
          } catch (error) {
               if (error instanceof z.ZodError) {
                    const errors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                         const path = err.path.join('.');
                         if (path.startsWith('tax_bands.')) {
                              // Handle tax bands validation errors
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
                    tax_bands: taxBands.map(band => ({
                         min: Number(band.min),
                         max: band.max ? Number(band.max) : null,
                         rate: Number(band.rate)
                    })),
                    standard_exemption: Number(formData.standard_exemption) || 0,
                    dependent_relief: Number(formData.dependent_relief) || 0,
                    disability_exemption: Number(formData.disability_exemption) || 0,
                    employee_ssnit_rate: Number(formData.employee_ssnit_rate) || 0,
                    employer_ssnit_rate: Number(formData.employer_ssnit_rate) || 0,
                    tier3_employee_rate: Number(formData.tier3_employee_rate) || 0,
                    tier3_employer_rate: Number(formData.tier3_employer_rate) || 0,
                    ssnit_ceiling: formData.ssnit_ceiling ? Number(formData.ssnit_ceiling) : null,
                    pension_ceiling: formData.pension_ceiling ? Number(formData.pension_ceiling) : null,
                    is_active: formData.is_active,
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
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center mb-4">
                    <Link href="/human-resource/payroll/tax-configurations" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="flex-grow-1">
                         <h1 className="h4 mb-0 fw-bold d-flex align-items-center">
                              <RiMoneyDollarCircleLine size={24} style={{ color: COLOR_ACCENT }} className="me-2" />
                              Create Tax Configuration
                         </h1>
                         <p className="text-muted mb-0 small">Set up tax rates, brackets, and statutory deductions</p>
                    </div>
               </div>

               {/* Error Message */}
               {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                         <RiErrorWarningLine size={18} className="me-2" />
                         {error}
                    </div>
               )}

               {/* Form */}
               <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                         {/* Basic Information */}
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
                                                  placeholder="e.g., 2025"
                                             />
                                             {validationErrors.tax_year && (
                                                  <div className="invalid-feedback">{validationErrors.tax_year}</div>
                                             )}
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
                                             {validationErrors.country && (
                                                  <div className="invalid-feedback">{validationErrors.country}</div>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Tax Bands */}
                         <div className="col-lg-12">
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
                                        <table className="table table-sm">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th style={{ width: '25%' }}>Min Amount</th>
                                                       <th style={{ width: '25%' }}>Max Amount</th>
                                                       <th style={{ width: '25%' }}>Rate (%)</th>
                                                       <th style={{ width: '25%' }}>Actions</th>
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
                                                                      onChange={(e) => handleBandChange(index, 'min', e.target.value)}
                                                                      placeholder="0"
                                                                 />
                                                                 {validationErrors[`band_${index}_min`] && (
                                                                      <div className="invalid-feedback d-block">{validationErrors[`band_${index}_min`]}</div>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="number"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_max`] ? 'is-invalid' : ''}`}
                                                                      value={band.max}
                                                                      onChange={(e) => handleBandChange(index, 'max', e.target.value)}
                                                                      placeholder="Leave empty for no max"
                                                                 />
                                                                 {validationErrors[`band_${index}_max`] && (
                                                                      <div className="invalid-feedback d-block">{validationErrors[`band_${index}_max`]}</div>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="number"
                                                                      step="0.01"
                                                                      className={`form-control form-control-sm ${validationErrors[`band_${index}_rate`] ? 'is-invalid' : ''}`}
                                                                      value={band.rate}
                                                                      onChange={(e) => handleBandChange(index, 'rate', e.target.value)}
                                                                      placeholder="0.00"
                                                                 />
                                                                 {validationErrors[`band_${index}_rate`] && (
                                                                      <div className="invalid-feedback d-block">{validationErrors[`band_${index}_rate`]}</div>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <button
                                                                      type="button"
                                                                      className="btn btn-sm btn-outline-danger"
                                                                      onClick={() => removeTaxBand(index)}
                                                                      disabled={taxBands.length === 1}
                                                                 >
                                                                      <RiDeleteBinLine size={16} />
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>

                         {/* Statutory Rates */}
                         <div className="col-lg-6">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-4">Statutory Rates (%)</h5>

                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Employee SSNIT Rate</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.employee_ssnit_rate ? 'is-invalid' : ''}`}
                                                  name="employee_ssnit_rate"
                                                  value={formData.employee_ssnit_rate}
                                                  onChange={handleChange}
                                                  placeholder="5.5"
                                             />
                                             {validationErrors.employee_ssnit_rate && (
                                                  <div className="invalid-feedback">{validationErrors.employee_ssnit_rate}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">Employer SSNIT Rate</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.employer_ssnit_rate ? 'is-invalid' : ''}`}
                                                  name="employer_ssnit_rate"
                                                  value={formData.employer_ssnit_rate}
                                                  onChange={handleChange}
                                                  placeholder="13.0"
                                             />
                                             {validationErrors.employer_ssnit_rate && (
                                                  <div className="invalid-feedback">{validationErrors.employer_ssnit_rate}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">Tier 3 Employee Rate</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.tier3_employee_rate ? 'is-invalid' : ''}`}
                                                  name="tier3_employee_rate"
                                                  value={formData.tier3_employee_rate}
                                                  onChange={handleChange}
                                                  placeholder="5.5"
                                             />
                                             {validationErrors.tier3_employee_rate && (
                                                  <div className="invalid-feedback">{validationErrors.tier3_employee_rate}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">Tier 3 Employer Rate</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.tier3_employer_rate ? 'is-invalid' : ''}`}
                                                  name="tier3_employer_rate"
                                                  value={formData.tier3_employer_rate}
                                                  onChange={handleChange}
                                                  placeholder="13.0"
                                             />
                                             {validationErrors.tier3_employer_rate && (
                                                  <div className="invalid-feedback">{validationErrors.tier3_employer_rate}</div>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Exemptions and Ceilings */}
                         <div className="col-lg-6">
                              <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="mb-4">Exemptions & Ceilings</h5>

                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Standard Exemption</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.standard_exemption ? 'is-invalid' : ''}`}
                                                  name="standard_exemption"
                                                  value={formData.standard_exemption}
                                                  onChange={handleChange}
                                                  placeholder="4908.00"
                                             />
                                             {validationErrors.standard_exemption && (
                                                  <div className="invalid-feedback">{validationErrors.standard_exemption}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">Dependent Relief</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.dependent_relief ? 'is-invalid' : ''}`}
                                                  name="dependent_relief"
                                                  value={formData.dependent_relief}
                                                  onChange={handleChange}
                                                  placeholder="300.00"
                                             />
                                             {validationErrors.dependent_relief && (
                                                  <div className="invalid-feedback">{validationErrors.dependent_relief}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">Disability Exemption</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.disability_exemption ? 'is-invalid' : ''}`}
                                                  name="disability_exemption"
                                                  value={formData.disability_exemption}
                                                  onChange={handleChange}
                                                  placeholder="300.00"
                                             />
                                             {validationErrors.disability_exemption && (
                                                  <div className="invalid-feedback">{validationErrors.disability_exemption}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">SSNIT Ceiling</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.ssnit_ceiling ? 'is-invalid' : ''}`}
                                                  name="ssnit_ceiling"
                                                  value={formData.ssnit_ceiling}
                                                  onChange={handleChange}
                                                  placeholder="Leave empty for no ceiling"
                                             />
                                             {validationErrors.ssnit_ceiling && (
                                                  <div className="invalid-feedback">{validationErrors.ssnit_ceiling}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6">
                                             <label className="form-label">Pension Ceiling</label>
                                             <input
                                                  type="number"
                                                  step="0.01"
                                                  className={`form-control ${validationErrors.pension_ceiling ? 'is-invalid' : ''}`}
                                                  name="pension_ceiling"
                                                  value={formData.pension_ceiling}
                                                  onChange={handleChange}
                                                  placeholder="Leave empty for no ceiling"
                                             />
                                             {validationErrors.pension_ceiling && (
                                                  <div className="invalid-feedback">{validationErrors.pension_ceiling}</div>
                                             )}
                                        </div>

                                        <div className="col-md-6 d-flex align-items-center">
                                             <div className="form-check">
                                                  <input
                                                       className="form-check-input"
                                                       type="checkbox"
                                                       name="is_active"
                                                       checked={formData.is_active}
                                                       onChange={handleChange}
                                                       id="is_active"
                                                  />
                                                  <label className="form-check-label" htmlFor="is_active">
                                                       Active Configuration
                                                  </label>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="d-flex justify-content-end gap-2 mt-4">
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
               </form>
          </div>
     );
}