"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import { RiPrinterLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiUserLine, RiPhoneLine } from "@remixicon/react";

interface ContactCompletenessData {
     total: number;
     complete_contact: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_SUCCESS = '#198754'; // Green for complete
const COLOR_WARNING = '#fd7e14'; // Orange for incomplete
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const ContactCompleteness: React.FC = () => {
     const [data, setData] = useState<ContactCompletenessData | null>(null);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

     const fetchContactCompleteness = async () => {
          setLoading(true);
          setError(null);
          try {
               const result = await customFetch('patient-analytics/contact-completeness');
               if (Array.isArray(result) && result.length > 0) {
                    setData(result[0]);
               } else {
                    setError('No contact completeness data available.');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching contact completeness data');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchContactCompleteness();
     }, []);

     const calculateMetrics = (data: ContactCompletenessData) => {
          const total = data.total;
          const complete = parseInt(data.complete_contact);
          const incomplete = total - complete;
          const completionRate = total > 0 ? ((complete / total) * 100) : 0;

          return {
               total,
               complete,
               incomplete,
               completionRate: Math.round(completionRate * 10) / 10 // Round to 1 decimal place
          };
     };

     const metrics = data ? calculateMetrics(data) : null;

     return (
          <div className="card" style={{
               borderRadius: '0.75rem',
               borderColor: COLOR_BORDER,
               boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
               background: 'var(--bs-body-bg)'
          }}>
               <div className="card-header py-3 px-4" style={{
                    backgroundColor: 'var(--bs-tertiary-bg)',
                    borderColor: COLOR_BORDER
               }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                              <RiPhoneLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Patient Contact Information Completeness
                         </h2>
                         <div className="d-flex gap-2">
                              <button
                                   className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                   onClick={() => window.print()}
                                   title="Print this report"
                              >
                                   <RiPrinterLine size={16} />
                                   Print
                              </button>
                         </div>
                    </div>
               </div>

               <div className="card-body p-3 p-md-4">
                    {loading ? (
                         <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                              <p className="text-muted">Loading contact completeness data...</p>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted px-3">{error}</p>
                         </div>
                    ) : !data ? (
                         <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                              <RiInbox2Line size={48} className="mb-3 text-muted" />
                              <h5 className="fw-medium mb-1">No Data Available</h5>
                              <p className="text-muted px-3">No contact completeness data found.</p>
                         </div>
                    ) : (
                         <div className="row g-4">
                              {/* Summary Cards */}
                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiUserLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                             <span className="fw-medium text-muted small">Total Patients</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-body-emphasis">{metrics?.total.toLocaleString()}</div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                           
                                             <span className="fw-medium text-muted small">Complete Contact</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-success">{metrics?.complete.toLocaleString()}</div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                            
                                             <span className="fw-medium text-muted small">Incomplete Contact</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-warning">{metrics?.incomplete.toLocaleString()}</div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiPhoneLine size={20} className="me-2" style={{ color: COLOR_ACCENT }} />
                                             <span className="fw-medium text-muted small">Completion Rate</span>
                                        </div>
                                        <div className="fs-4 fw-bold" style={{ color: COLOR_ACCENT }}>{metrics?.completionRate}%</div>
                                   </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="col-12">
                                   <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                             <h5 className="mb-0 fw-medium">Contact Information Completion</h5>
                                             <span className="badge fs-6" style={{
                                                  backgroundColor: metrics && metrics.completionRate >= 95 ? COLOR_SUCCESS :
                                                       metrics && metrics.completionRate >= 80 ? COLOR_WARNING : '#dc3545',
                                                  color: 'white'
                                             }}>
                                                  {metrics?.completionRate}% Complete
                                             </span>
                                        </div>

                                        <div className="progress mb-3" style={{ height: '24px' }}>
                                             <div
                                                  className="progress-bar"
                                                  role="progressbar"
                                                  style={{
                                                       width: `${metrics?.completionRate}%`,
                                                       backgroundColor: metrics && metrics.completionRate >= 95 ? COLOR_SUCCESS :
                                                            metrics && metrics.completionRate >= 80 ? COLOR_WARNING : '#dc3545'
                                                  }}
                                                  aria-valuenow={metrics?.completionRate}
                                                  aria-valuemin={0}
                                                  aria-valuemax={100}
                                             >
                                                  <span className="fw-medium">{metrics?.completionRate}%</span>
                                             </div>
                                        </div>

                                        <div className="row text-center">
                                             <div className="col-6">
                                                  <div className="d-flex align-items-center justify-content-center mb-1">
                                                       <div
                                                            className="rounded-circle me-2"
                                                            style={{
                                                                 width: '12px',
                                                                 height: '12px',
                                                                 backgroundColor: COLOR_SUCCESS
                                                            }}
                                                       ></div>
                                                       <span className="small fw-medium text-success">Complete</span>
                                                  </div>
                                                  <div className="fs-5 fw-bold text-success">{metrics?.complete.toLocaleString()}</div>
                                             </div>
                                             <div className="col-6">
                                                  <div className="d-flex align-items-center justify-content-center mb-1">
                                                       <div
                                                            className="rounded-circle me-2"
                                                            style={{
                                                                 width: '12px',
                                                                 height: '12px',
                                                                 backgroundColor: COLOR_WARNING
                                                            }}
                                                       ></div>
                                                       <span className="small fw-medium text-warning">Incomplete</span>
                                                  </div>
                                                  <div className="fs-5 fw-bold text-warning">{metrics?.incomplete.toLocaleString()}</div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>

               <style jsx global>{`
				.animate-spin {
					animation: spin 1s linear infinite;
				}
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}

				@media print {
					.card-header {
						background-color: white !important;
						-webkit-print-color-adjust: exact;
						color-adjust: exact;
					}
					.btn {
						display: none !important;
					}
					.progress {
						-webkit-print-color-adjust: exact;
						color-adjust: exact;
					}
				}
			`}</style>
          </div>
     );
};

export default ContactCompleteness;
    