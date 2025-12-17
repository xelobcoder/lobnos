'use client';

import React from 'react';
import { RiErrorWarningLine, RiArrowLeftLine, RiShieldLine, RiMailSendLine, RiPrinterLine } from '@remixicon/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function UnauthorizedAccess() {
     const searchParams = useSearchParams();
     const ascensionid = searchParams?.get('ascensionid') ?? null;
     const patientid = searchParams?.get('patientid') ?? null;
     const multiple = searchParams?.get('multiple') ?? null; // Fixed typo from 'mutiple'
     const isMultiple = multiple === 'true';
     return (
          <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
               <div className="container py-4">
                    {/* Header bar following project pattern */}
                    <div className="d-flex justify-content-between bg-secondary-subtle br-5 my-2 p-2">
                         <div>
                              <h5 className="d-flex my-2 mx-4 text-uppercase">Unauthorized Access</h5>
                         </div>
                    </div>

                    {/* Content box following project pattern */}
                    <div className="border br-5 p-3 mb-3" style={{ border: '1px solid #dee2e6' }}>
                         <div className="row align-items-center">
                              <div className="col-auto pe-4">
                                   <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '72px', height: '72px' }}>
                                        <RiErrorWarningLine size={34} className="text-danger" />
                                   </div>
                              </div>

                              <div className="col">
                                   <h5 className="pls-label mb-1">
                                        {isMultiple ? 'Partial Access Restriction — 403' : 'Access Denied — 403'}
                                   </h5>
                                   <div className="bg-light rounded p-2 mb-2 d-inline-block">
                                        <RiShieldLine size={20} className="text-warning me-2" />
                                        <span className="fw-medium">
                                             {isMultiple ? 'Bulk Print Restriction' : 'Security Restriction'}
                                        </span>
                                   </div>

                                   <p className="mb-2 text-muted text-sm">
                                        {isMultiple ? (
                                             <>
                                                  Some lab results have expired access windows. However, results that are completed and granted access or within the access period can be printed in bulk. You can print accessible results individually or bulk, or request access for individual expired results. Once all or some  required access is granted, you will be able to print everything in bulk.
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
                                             className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                                        >
                                             <RiArrowLeftLine size={16} />
                                             Go Back
                                        </button>

                                        {!isMultiple && (
                                             <Link
                                                  href={`/operations/laboratory/access-request${ascensionid ? `?ascensionid=${ascensionid}` : ''}${patientid ? `&patientid=${patientid}` : ''}`}
                                                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2"
                                             >
                                                  <RiMailSendLine size={16} />
                                                  Request Access
                                             </Link>
                                        )}
                                   </div>

                                   <div className="mt-3">
                                        <small className="text-muted">
                                             {isMultiple ? (
                                                  <>
                                                       Results with completed and granted access or within access period can be printed in bulk. For expired results, navigate to individual pages to request access. Reference ID: <code style={{ fontSize: '0.7rem' }}>ACC-{Date.now()}</code>
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