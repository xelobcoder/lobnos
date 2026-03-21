'use client'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation'
import { customFetch, PrepareResultEntryHeader } from '../../../../../../components/Auth/customFetch'
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext'

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
     }, [billingid]);

     return (
          <div>
               <PreviewPatientInformation patientid={patientid} />

               <div className="mt-4">
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
                                        {testAscensions.map((item) => (
                                             <tr key={item.ascension_id}>
                                                  <td>
                                                       <div><strong>{item.test_name}</strong></div>
                                                       <div>Ascension ID: {item.ascension_id}</div>
                                                       <div>Test ID: {item.testid}</div>
                                                       <div><small>Key ID: {item.keyid ?? 'N/A'}</small></div>
                                                  </td>
                                                  <td>
                                                       <div>{item.ascension_date ? new Date(item.ascension_date).toLocaleString() : 'N/A'}</div>
                                                       <div><small>Sample status: {item.sample_status_date ? new Date(item.sample_status_date).toLocaleString() : 'N/A'}</small></div>
                                                       <div><small>Validated on: {item.samplevalidatedon ? new Date(item.samplevalidatedon).toLocaleString() : 'N/A'}</small></div>
                                                       <div><small>Validation stage: {item.sample_validation_stage ?? 'N/A'}</small></div>
                                                       <div><small>Approval status: {item.approvalstatus === 1 ? 'Approved' : item.approvalstatus === 0 ? 'Not approved' : 'Unknown'}</small></div>
                                                       <div><small>Redraw: {item.isRedraw ? 'Yes' : 'No'}</small></div>
                                                  </td>
                                                  <td>
                                                       {item.collectionStartDate ? (
                                                            <>
                                                                 <div>{new Date(item.collectionStartDate).toLocaleString()}</div>
                                                                 <div><small>By: {item.collected_by_name ?? 'N/A'}</small></div>
                                                                 <div><small>End: {item.collectionEndDate ? new Date(item.collectionEndDate).toLocaleString() : 'N/A'}</small></div>
                                                            </>
                                                       ) : (
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 onClick={() => window.open(`/operations/phelobotomy/pending-samples-collection?billing=${item.billingid}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                 Collect
                                                            </button>
                                                       )}
                                                  </td>
                                                  <td>
                                                       {item.samplevalidatedon ? (
                                                            <>
                                                                 <div>{new Date(item.samplevalidatedon).toLocaleString()}</div>
                                                                 <div><small>Stage: {item.sample_validation_stage ?? 'N/A'}</small></div>
                                                            </>
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
                                                            <>
                                                                 <div>{new Date(item.processingStartDate).toLocaleString()}</div>
                                                                 <div><small>By: {item.processed_by_name ?? 'N/A'}</small></div>
                                                                 <div><small>End: {item.processingEndDate ? new Date(item.processingEndDate).toLocaleString() : 'N/A'}</small></div>
                                                            </>
                                                       ) : !item.samplevalidatedon ? (
                                                            <button className="btn btn-sm btn-secondary" disabled>
                                                                 Process (validate first)
                                                            </button>
                                                       ) : item.collectionStartDate ? (
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 onClick={() => window.open(`/operations/laboratory/processing?billingid=${item.billingid}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                 Process
                                                            </button>
                                                       ) : (
                                                            'Waiting collection'
                                                       )}
                                                  </td>
                                                  <td>
                                                       {item.resultEntryStart ? (
                                                            <>
                                                                 <div>{new Date(item.resultEntryStart).toLocaleString()}</div>
                                                                 <div><small>By: {item.result_entered_by_name ?? 'N/A'}</small></div>
                                                                 <div>
                                                                      <small>
                                                                           {item.resultEntryEnd
                                                                                ? `End: ${new Date(item.resultEntryEnd).toLocaleString()}`
                                                                                : 'In result entry'
                                                                           }
                                                                      </small>
                                                                 </div>
                                                                 <button
                                                                      className="btn btn-sm btn-outline-warning mt-1"
                                                                      onClick={() => openUpdateResult(item)}
                                                                 >
                                                                      Update Result
                                                                 </button>
                                                            </>
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
                                                       <div><small>By: {item.approvedBy ?? 'N/A'}</small></div>
                                                       <div><small>Print Count: {item.printCount ?? 0}</small></div>
                                                       <div><small>Last Updated: {item.lastupdatedon ? new Date(item.lastupdatedon).toLocaleString() : 'N/A'}</small></div>
                                                       {item.isapproved !== 1 && (
                                                            <button
                                                                 className="btn btn-sm btn-outline-success mt-1"
                                                                 onClick={() => window.open(`/operations/laboratory/validation?billingid=${item.billingid}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                            >
                                                                 Validate Result
                                                            </button>
                                                       )}
                                                  </td>
                                                  <td>
                                                       <span className={getStageBadgeClass(item.current_stage)}>{item.current_stage || 'Unknown'}</span>
                                                       {item.current_stage && item.current_stage.trim().toLowerCase() === 'completed' && (
                                                            <button
                                                                 className="btn btn-sm btn-outline-success ms-2"
                                                                 onClick={() => alert(`Print result for ascension ${item.ascension_id}`)}
                                                            >
                                                                 Print
                                                            </button>
                                                       )}
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>
          </div>
     )
}
