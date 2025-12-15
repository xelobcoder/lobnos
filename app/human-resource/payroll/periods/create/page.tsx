'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import {
     RiCalendarLine,
     RiSaveLine,
     RiArrowLeftLine,
     RiLoader4Line
} from '@remixicon/react';
import Link from 'next/link';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function CreatePayrollPeriodPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [referrer, setReferrer] = useState<string>('');
     const [formData, setFormData] = useState({
          period_name: '',
          start_date: '',
          end_date: '',
          status: 'draft'
     });

     useEffect(() => {
          if (typeof window !== 'undefined') {
               const ref = document.referrer;
               if (ref && ref.includes(window.location.origin)) {
                    setReferrer(ref);
               }
          }
     }, []);

     const handleGoBack = () => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
               if (referrer && referrer !== window.location.href) {
                    router.back();
               } else {
                    router.push('/human-resource/payroll/periods');
               }
          } else {
               router.push('/human-resource/payroll/periods');
          }
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          try {
               const response = await customPost('payroll/periods', 'POST', formData);

               if (response?.status === 'success' && response?.statusCode === 201) {
                    router.push('/human-resource/payroll/periods');
               } else {
                    setError(response?.message || 'Failed to create payroll period');
               }
          } catch (err: any) {
               setError(err?.message || 'Error creating payroll period');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex align-items-center mb-4">
                    <button
                         onClick={handleGoBack}
                         className="btn btn-outline-secondary btn-sm me-3 d-flex align-items-center"
                         type="button"
                    >
                         <RiArrowLeftLine size={18} />
                    </button>
                    <div className="d-flex align-items-center">
                         <RiCalendarLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Create Payroll Period</h1>
                              <p className="text-muted mb-0 small">Define a new payroll cycle</p>
                         </div>
                    </div>
               </div>

               <div className="row">
                    <div className="col-lg-8 col-xl-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              {error && (
                                   <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        {error}
                                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                                   </div>
                              )}

                              <form onSubmit={handleSubmit}>
                                   <div className="mb-3">
                                        <label htmlFor="period_name" className="form-label fw-medium">
                                             Period Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             className="form-control"
                                             id="period_name"
                                             name="period_name"
                                             value={formData.period_name}
                                             onChange={handleChange}
                                             placeholder="e.g., December 2024"
                                             required
                                        />
                                        <div className="form-text">A descriptive name for this payroll period</div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <label htmlFor="start_date" className="form-label fw-medium">
                                                  Start Date <span className="text-danger">*</span>
                                             </label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  id="start_date"
                                                  name="start_date"
                                                  value={formData.start_date}
                                                  onChange={handleChange}
                                                  required
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label htmlFor="end_date" className="form-label fw-medium">
                                                  End Date <span className="text-danger">*</span>
                                             </label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  id="end_date"
                                                  name="end_date"
                                                  value={formData.end_date}
                                                  onChange={handleChange}
                                                  min={formData.start_date}
                                                  required
                                             />
                                        </div>
                                   </div>

                                   <div className="mb-4">
                                        <label htmlFor="status" className="form-label fw-medium">
                                             Initial Status
                                        </label>
                                        <select
                                             className="form-select"
                                             id="status"
                                             name="status"
                                             value={formData.status}
                                             onChange={handleChange}
                                        >
                                             <option value="draft">Draft</option>
                                        </select>
                                        <div className="form-text">New periods start as drafts</div>
                                   </div>

                                   <div className="d-flex gap-2">
                                        <button
                                             type="submit"
                                             className="btn btn-primary d-flex align-items-center"
                                             disabled={loading}
                                             style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                        >
                                             {loading ? (
                                                  <>
                                                       <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                       Creating...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiSaveLine size={18} className="me-1" />
                                                       Create Period
                                                  </>
                                             )}
                                        </button>
                                        <Link href="/human-resource/payroll/periods" className="btn btn-outline-secondary">
                                             Cancel
                                        </Link>
                                   </div>
                              </form>
                         </div>
                    </div>

                    <div className="col-lg-4 col-xl-6 mt-4 mt-lg-0">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                              <h6 className="fw-bold mb-3">Payroll Period Guidelines</h6>
                              <ul className="small mb-0">
                                   <li className="mb-2">Periods typically span one month</li>
                                   <li className="mb-2">Use clear naming conventions (e.g., "January 2025")</li>
                                   <li className="mb-2">Ensure dates don't overlap with existing periods</li>
                                   <li className="mb-2">Periods start in "draft" status</li>
                                   <li className="mb-2">Process payroll after creating the period</li>
                              </ul>
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
