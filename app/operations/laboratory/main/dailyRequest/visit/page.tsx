
"use client";
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation'
import { customFetch, PrepareResultEntryHeader } from '../../../../../../components/Auth/customFetch'
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext'
import { RiPlayCircleLine, RiStopCircleLine } from '@remixicon/react';

// Formats a date string as "10th May, 2026 [Sat] @10:00 PM"
function formatFullDate(dateString?: string) {
     if (!dateString) return "N/A";
     const date = new Date(dateString);
     const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "short" });
     const day = date.getDate();
     const month = date.toLocaleDateString(undefined, { month: "short" });
     const year = date.getFullYear();
     const hours = date.getHours();
     const minutes = date.getMinutes();
     const ampm = hours >= 12 ? "PM" : "AM";
     const hour12 = hours % 12 === 0 ? 12 : hours % 12;
     const pad = (n: number) => n < 10 ? `0${n}` : n;
     // Add ordinal suffix
     const ordinal = (n: number) => {
          if (n > 3 && n < 21) return "th";
          switch (n % 10) {
               case 1: return "st";
               case 2: return "nd";
               case 3: return "rd";
               default: return "th";
          }
     };
     return `${day}${ordinal(day)} ${month}, ${year} [${dayOfWeek}] @${hour12}:${pad(minutes)} ${ampm}`;
}

interface TestAscension {
     ascension_id: number;
     testid: number;
     test_name: string;
     serviceid: number;
     billingid: number;
     ascension_date: string;
     collectionStartDate?: string;
     collectionEndDate?: string;
     processingStartDate?: string;
     processingEndDate?: string;
     resultEntryStart?: string;
     resultEntryEnd?: string;
     collected_by_name?: string;
     processed_by_name?: string;
     result_entered_by_name?: string;
     keyid?: number;
     sample_status_date?: string;
     approvalstatus?: number;
     rejectionmessage?: string | null;
     isRedraw?: number;
     samplevalidatedon?: string;
     sample_validation_stage?: string;
     result_approval_id?: number;
     isapproved?: number;
     approvedBy?: string;
     printCount?: number;
     minvalidation?: number;
     maxvalidation?: number;
     lastupdatedon?: string;
     result_validation_stage?: string;
     current_stage?: string;
}

const getStageBadgeClass = (stage?: string) => {
     const normalized = (stage || '').trim().toLowerCase();
     if (normalized.includes('pending')) return 'badge bg-warning text-dark';
     if (normalized.includes('completed') || normalized.includes('paid') || normalized.includes('done')) return 'badge bg-success';
     if (normalized.includes('partial')) return 'badge bg-info text-dark';
     if (normalized.includes('cancel') || normalized.includes('rejected') || normalized.includes('failed')) return 'badge bg-danger';
     return 'badge bg-secondary';
};

export default function ClientVisit() {
     const billingid = useSearchParams().get('billingid')
     const patientid = useSearchParams().get('patientid')
     const { applicationsettings } = useApplicationSettings();
     const branchid = applicationsettings?.branchid || 0;
     const [testAscensions, setTestAscensions] = useState<TestAscension[]>([]);
     const [loading, setLoading] = useState<boolean>(false);
     const [error, setError] = useState<string>('');

     const allResultsCompleted =
          Array.isArray(testAscensions) &&
          testAscensions.length > 0 &&
          testAscensions.every((item) => item.resultEntryStart && item.resultEntryEnd);

     const allResultsValidated =
          Array.isArray(testAscensions) &&
          testAscensions.length > 0 &&
          testAscensions.every((item) =>
               item.isapproved === 1 ||
               (item.result_validation_stage || '').toLowerCase().includes('validated') ||
               (item.result_validation_stage || '').toLowerCase().includes('approved')
          );

     const validatedAscensionIds =
          allResultsValidated ? testAscensions.map((item) => item.ascension_id).join(',') : '';

     const openResultEntry = (item: TestAscension) => {
          PrepareResultEntryHeader(
               {
                    id: item.testid,
                    name: item.test_name,
                    billingid: item.billingid,
                    patientid: patientid || '',
                    ascensionid: item.ascension_id,
               },
               false,
               branchid,
               false
          );
     };

     const openUpdateResult = (item: TestAscension) => {
          PrepareResultEntryHeader(
               {
                    id: item.testid,
                    name: item.test_name,
                    billingid: item.billingid,
                    patientid: patientid || '',
                    ascensionid: item.ascension_id,
                    category: 'ungrouped'
               },
               false,
               branchid,
               false
          );
     };


     const loadTestTransactions = async () => {
          if (!billingid) return;
          setLoading(true);
          setError('');

          try {
               const response = await customFetch(`operations/overview/folder/open/transaction?billingid=${billingid}`);
               const { statusCode, result, message } = await response;
               if (statusCode === 200 && Array.isArray(result)) {
                    setTestAscensions(result);
               } else {
                    setTestAscensions([]);
                    setError(message || 'No transactions available.');
               }
          } catch (err) {
               console.error('loadTestTransactions error:', err);
               setError('Failed to load test transactions.');
          } finally {
               setLoading(false);
          }
     }


     useEffect(() => {
          if (billingid) loadTestTransactions();

          const intervalId = setInterval(() => {
               if (billingid) {
                    loadTestTransactions();
               }
          }, 60000); // 60 seconds

          return () => {
               clearInterval(intervalId);
          };
     }, [billingid]);

     return (
          <div>
               <PreviewPatientInformation patientid={patientid} />

               <div className="mt-4">
                    {(allResultsCompleted && billingid) || (allResultsValidated && validatedAscensionIds) ? (
                         <div className="row mb-3 g-2 align-items-center">
                              {allResultsCompleted && billingid && (
                                   <div className="col-auto">
                                        <button
                                             className="btn btn-sm btn-outline-success w-100"
                                             onClick={() => window.open(`/operations/laboratory/validation?billingid=${billingid}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                        >
                                             Validate all results
                                        </button>
                                   </div>
                              )}
                              {allResultsValidated && validatedAscensionIds && (
                                   <div className="col-auto">
                                        <button
                                             className="btn btn-sm btn-outline-primary w-100"
                                             onClick={() => window.open(`/operations/laboratory/validated?ascensionid=${validatedAscensionIds}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                        >
                                             Print validated results
                                        </button>
                                   </div>
                              )}
                              <div className="col-auto">
                                   <button
                                        className="btn btn-sm btn-outline-secondary w-100"
                                        onClick={loadTestTransactions}
                                   >
                                        Refresh Data
                                   </button>
                              </div>
                         </div>
                    ) : null}
                    {loading ? (
                         <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    ) : error ? (
                         <div className="alert alert-danger" role="alert">{error}</div>
                    ) : testAscensions.length === 0 ? (
                         <div className="alert alert-secondary" role="alert">No test transactions found for this billing ID.</div>
                    ) : (
                         <div className="table-responsive">
                              <table className="table table-bordered table-striped align-middle">
                                   <thead className="table-light">
                                        <tr>
                                             <th>Test</th>
                                             <th>Ascension Date</th>
                                             <th>Collection</th>
                                             <th>Sample Validation</th>
                                             <th>Processing</th>
                                             <th>Result Entry</th>
                                             <th>Result Validation</th>
                                             <th>Stage</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {Array.isArray(testAscensions) && testAscensions.map((item) => {
                                             // Row is success if completed and validated
                                             const isCompleted = item.resultEntryStart && item.resultEntryEnd;
                                             const isValidated = item.isapproved === 1 || (item.result_validation_stage || '').toLowerCase().includes('validated') || (item.result_validation_stage || '').toLowerCase().includes('approved');
                                             const rowClass = isCompleted && isValidated ? 'table-success' : '';
                                             return (
                                                  <tr key={item.ascension_id} className={rowClass}>
                                                       <td>
                                                            <div><strong>{item.test_name}</strong></div>
                                                            <div>Ascension ID: {item.ascension_id}</div>
                                                            <div>Test ID: {item.testid}</div>
                                                            <div><small>Key ID: {item.keyid ?? 'N/A'}</small></div>
                                                       </td>
                                                       <td>
                                                            <div>{item.ascension_date ? formatFullDate(item.ascension_date) : 'N/A'}</div>
                                                       </td>
                                                       <td>
                                                            {item.collectionStartDate ? (
                                                                 <div style={{ fontSize: '0.98rem' }}>
                                                                      <div>start: {formatFullDate(item.collectionStartDate)}</div>
                                                                      {item.collectionEndDate && <div>end: {formatFullDate(item.collectionEndDate)}</div>}
                                                                      <div>by: {item.collected_by_name ?? 'N/A'}</div>
                                                                 </div>
                                                            ) : (
                                                                 <button
                                                                      className="btn btn-sm btn-outline-primary"
                                                                      onClick={() => window.open(`/operations/phelobotomy/pending-samples-collection?billingid=${item.billingid}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                                 >
                                                                      Collect
                                                                 </button>
                                                            )}
                                                       </td>
                                                       <td>
                                                            {item.samplevalidatedon ? (
                                                                 <div>{formatFullDate(item.samplevalidatedon)}</div>
                                                            ) : !item.collectionStartDate ? (
                                                                 <button className="btn btn-sm btn-secondary" disabled>
                                                                      Validate Sample (awaiting collection)
                                                                 </button>
                                                            ) : (
                                                                 <button
                                                                      className="btn btn-sm btn-outline-warning"
                                                                      onClick={() => window.open(`/operations/laboratory/sample/validation?billingid=${item.billingid}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                                 >
                                                                      Validate Sample
                                                                 </button>
                                                            )}
                                                       </td>
                                                       <td>
                                                            {item.processingStartDate ? (
                                                                 <div style={{ fontSize: '0.98rem' }}>
                                                                      <div>start: {formatFullDate(item.processingStartDate)}</div>
                                                                      {item.processingEndDate && <div>end: {formatFullDate(item.processingEndDate)}</div>}
                                                                      <div>by: {item.processed_by_name ?? 'N/A'}</div>
                                                                 </div>
                                                            ) : !item.samplevalidatedon ? (
                                                                 <button className="btn btn-sm btn-secondary" disabled>
                                                                      Process (validate first)
                                                                 </button>
                                                            ) : item.collectionStartDate ? (
                                                                 <button
                                                                      className="btn btn-sm btn-outline-primary"
                                                                      onClick={() => window.open(`/operations/laboratory/processing?billingid=${item.billingid}&isOpenSideBarShow=false&&category=ungrouped`, '_blank', 'noopener,noreferrer')}
                                                                 >
                                                                      Process
                                                                 </button>
                                                            ) : (
                                                                 'Waiting collection'
                                                            )}
                                                       </td>
                                                       <td>
                                                            {item.resultEntryStart ? (
                                                                 <div style={{ fontSize: '0.98rem' }}>
                                                                      <div>start: {formatFullDate(item.resultEntryStart)}</div>
                                                                      {item.resultEntryEnd && <div>end: {formatFullDate(item.resultEntryEnd)}</div>}
                                                                      <div>by: {item.result_entered_by_name ?? 'N/A'}</div>
                                                                      <button
                                                                           className="btn btn-sm btn-outline-primary mt-1"
                                                                           onClick={() => openUpdateResult(item)}
                                                                      >
                                                                           Update Result
                                                                      </button>
                                                                 </div>
                                                            ) : !item.samplevalidatedon ? (
                                                                 <div className="text-muted">Locked until validation</div>
                                                            ) : item.processingEndDate ? (
                                                                 <button
                                                                      className="btn btn-sm btn-outline-primary"
                                                                      onClick={() => openResultEntry(item)}
                                                                 >
                                                                      Result Entry
                                                                 </button>
                                                            ) : (
                                                                 'Pending'
                                                            )}
                                                       </td>
                                                       <td>
                                                            <div>{item.result_validation_stage ?? 'N/A'}</div>
                                                            <div><small>Approved: {item.isapproved === 1 ? 'Yes' : 'No'}</small></div>


                                                            <div><small>Last Updated: {item.lastupdatedon ? formatFullDate(item.lastupdatedon) : 'N/A'}</small></div>
                                                            {item.isapproved !== 1 && (
                                                                 item.collectionStartDate && item.samplevalidatedon && item.resultEntryStart && item.resultEntryEnd ? (
                                                                      <button
                                                                           className="btn btn-sm btn-outline-success mt-1"
                                                                           onClick={() => window.open(`/operations/laboratory/validation?ascensionid=${item.ascension_id}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                                      >
                                                                           Validate Result
                                                                      </button>
                                                                 ) : (
                                                                      <button className="btn btn-sm btn-secondary mt-1" disabled>
                                                                           Validate Result (awaiting collection/validation/result entry)
                                                                      </button>
                                                                 )
                                                            )}
                                                       </td>
                                                       <td>
                                                            {/* Remove completed badge, just show stage text */}
                                                            <span>{item.current_stage || 'Unknown'}</span>
                                                            {isCompleted && isValidated && (
                                                                 <button
                                                                      className="btn btn-sm btn-outline-success ms-2"
                                                                      onClick={() => window.open(`/operations/laboratory/validated?ascensionid=${item.ascension_id}&isOpenSideBarShow=false&&category=ungrouped`, '_blank', 'noopener,noreferrer')}
                                                                 >
                                                                      Print
                                                                 </button>
                                                            )}
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>
          </div>
     )
}
