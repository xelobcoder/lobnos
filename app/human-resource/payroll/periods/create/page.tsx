'use client';
import PayrollFormFrame from '../../PayrollFormFrame';
import screens from '../../PayrollScreens.module.css';
import PayrollFormSummary from '../../PayrollFormSummary';

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

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

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
          <PayrollFormFrame busy={loading} className={screens.page}>
               <div className={screens.header}>
                    <button
                         data-payroll-back aria-label="Back to payroll periods" onClick={handleGoBack}
                         className="btn btn-outline-secondary btn-sm me-3 d-flex align-items-center"
                         type="button"
                    >
                         <RiArrowLeftLine size={18} />
                    </button>
                    <div className="d-flex align-items-center">
                         <RiCalendarLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <span className={screens.eyebrow}>Payroll / Payroll operations</span>
<h1 className={screens.title}>Create Payroll Period</h1>
                              <p className="text-muted mb-0 small">Define a new payroll cycle</p>
                         </div>
                    </div>
               </div>

               <div className={screens.editorGrid}>
                    <div className={screens.editorMain}>
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              {error && (
                                   <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        {error}
                                        <button type="button" className="btn-close" aria-label="Dismiss message" onClick={() => setError(null)}></button>
                                   </div>
                              )}

                              <form onSubmit={handleSubmit}>
<fieldset disabled={loading} className={screens.formFields}><p className={screens.formHint}>Fields marked * are required. Review the details before saving.</p>
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
                              </fieldset>
</form>
                         </div>
                    </div>

                    <PayrollFormSummary title="Review payroll period" items={[
                         {label:'Period name',value:formData.period_name},
                         {label:'Start date',value:formData.start_date},
                         {label:'End date',value:formData.end_date},
                         {label:'Initial status',value:'Draft'}
                    ]} help="Creating a period does not calculate or pay salaries. Prepare employee compensation for the full date range, then calculate and review payroll."/>

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
          </PayrollFormFrame>
     );
}
