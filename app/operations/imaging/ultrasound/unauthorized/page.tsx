'use client';

import React from 'react';
import { RiErrorWarningLine, RiArrowLeftLine, RiShieldLine, RiMailSendLine, RiPrinterLine } from '@remixicon/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function UnauthorizedAccess() {
     const searchParams = useSearchParams();
     const ascensionid = searchParams?.get('ascensionid') ?? null;
     const patientid = searchParams?.get('patientid') ?? null;
     const multiple = searchParams?.get('multiple') ?? null;
     const isMultiple = multiple === 'true';
     return (
          <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
               <div className="container py-4">
                    {/* Header bar following project pattern */}
                    <div className="d-flex justify-content-between bg-secondary-subtle br-5 my-2 p-2">
                         <div>
                              <h5 className="d-flex my-2 mx-4 text-uppercase fs-6">Unauthorized Access</h5>
                         </div>
                    </div>

                    {/* Content box following project pattern */}
                    <div className="border br-5 p-3 mb-3" style={{ border: '1px solid #dee2e6' }}>
                         <div className="row align-items-center">
                              <div className="col-auto pe-4">
                                   <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                                        <RiErrorWarningLine size={28} className="text-danger" />
                                   </div>
                              </div>

                              <div className="col">
                                   <h5 className="pls-label mb-1 fs-6">
                                        {isMultiple ? 'Partial Access Restriction — 403' : 'Access Denied — 403'}
                                   </h5>
                                   <div className="bg-light rounded p-2 mb-2 d-inline-block">
                                        <RiShieldLine size={20} className="text-warning me-2" />
                                        <span className="fw-medium text-sm">
                                             {isMultiple ? 'Bulk Print Restriction' : 'Security Restriction'}
                                        </span>
                                   </div>

                                   <p className="mb-2 text-muted text-sm">
                                        {isMultiple ? (
                                             <>
                                                  Some ultrasound results have expired access windows. You can print results that are still accessible, or request access for individual expired results. Once all required access is granted, you will be able to print everything in bulk.
                                             </>
                                        ) : (
                                             <>
                                                  The access window for this report has expired. If you need continued access, request it and provide a brief reason.
                                             </>
                                        )}
                                   </p>

                                   <div className="d-flex flex-wrap gap-2 mt-3">
                                        <button
                                             onClick={() => window.history.back()}
                                             className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 text-sm"
                                        >
                                             <RiArrowLeftLine size={14} />
                                             Go Back
                                        </button>

                                        {isMultiple && (
                                             <button
                                                  onClick={() => {
                                                       // Redirect back to bulk print with parameter to print only accessible results
                                                       const url = new URL(window.location.href);
                                                       url.pathname = url.pathname.replace('/unauthorized', '');
                                                       url.searchParams.set('printAccessibleOnly', 'true');
                                                       window.location.href = url.toString();
                                                  }}
                                                  className="btn btn-success btn-sm d-inline-flex align-items-center gap-2 text-sm"
                                             >
                                                  <RiPrinterLine size={14} />
                                                  Print Accessible Results
                                             </button>
                                        )}

                                        {!isMultiple && (
                                             <Link
                                                  href={`/operations/imaging/ultrasound/access-request${ascensionid ? `?ascensionid=${ascensionid}` : ''}${patientid ? `&patientid=${patientid}` : ''}`}
                                                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 text-sm"
                                             >
                                                  <RiMailSendLine size={14} />
                                                  Request Access
                                             </Link>
                                        )}
                                   </div>

                                   <div className="mt-3">
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                             {isMultiple ? (
                                                  <>
                                                       Print accessible results now, or navigate to individual result pages to request access for expired ones. Reference ID: <code style={{ fontSize: '0.7rem' }}>ACC-{Date.now()}</code>
                                                  </>
                                             ) : (
                                                  <>
                                                       If you believe this is an error, contact support with reference ID: <code style={{ fontSize: '0.7rem' }}>ACC-{Date.now()}</code>
                                                  </>
                                             )}
                                        </small>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}