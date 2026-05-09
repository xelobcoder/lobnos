
"use client";
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation'
import { customFetch } from '../../../../../../components/Auth/customFetch'
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext'
import ResultEntryComponent from '../../../../../../components/operations/ViewTwoResultEntry/ResultEntryComponent'
import { RiCheckLine, RiInformationLine, RiMailLine, RiPhoneLine, RiPrinterLine, RiRefreshLine, RiTruckLine, RiWhatsappLine, RiFileTextLine } from '@remixicon/react';
import {
     BulkResultValidationWorkflowModal,
     SingleTestCollectionWorkflowModal,
     SingleTestProcessingWorkflowModal,
     SingleTestResultValidationWorkflowModal,
     SingleTestSampleValidationWorkflowModal
} from '../../../../../../components/operations/Laboratory/SingleTestWorkflowModals'
import SingleWorkFlowResultDeliveryModal from '../../../../../../components/operations/Laboratory/singleWorkFlowDeliveryResult';

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
     delivered_mode: string | null;
     requested_mode: string | null;
     delivery_notes: string | null;
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
     const employeeid = applicationsettings?.user?.employeeid || '';
     const [testAscensions, setTestAscensions] = useState<TestAscension[]>([]);
     const [loading, setLoading] = useState<boolean>(false);
     const [error, setError] = useState<string>('');
     const [selectedAscensionId, setSelectedAscensionId] = useState<number | null>(null);
     const [testFilter, setTestFilter] = useState('');
     const [entryTokensByAscensionId, setEntryTokensByAscensionId] = useState<Record<number, { csvid: string; ptid: string }>>({});
     const [workflow, setWorkflow] = useState<null | 'collection' | 'sampleValidation' | 'processing' | 'resultDelivery' | 'resultValidation' | 'bulkResultValidation'>(null);

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

     const generateRandomTextAndNumbers = (length: number) => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < length; i++) {
               result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
     };

     const buildResultEntryTokens = (rawBillingId: number, rawPatientId: string) => {
          const csvid = `${generateRandomTextAndNumbers(70)}${rawBillingId}`.trim();
          const ptid = `${csvid.slice(25, 50)}${csvid.slice(0, 25)}${rawPatientId}`.trim();
          return { csvid, ptid };
     };

     const buildPrintMultipleTokens = (rawBillingId: number, rawPatientId: string) => {
          const csvid = `${generateRandomTextAndNumbers(70)}${rawBillingId}`.trim();
          const ptid = `${generateRandomTextAndNumbers(50)}${rawPatientId}`.trim();
          return { csvid, ptid, target: '70,50' };
     };

     const handlePrintAllResults = () => {
          if (!patientid || !billingid) return;
          const baseItem = selectedItem || testAscensions[0];
          if (!baseItem) return;
          const { csvid, ptid, target } = buildPrintMultipleTokens(baseItem.billingid, patientid);
          const testname = encodeURIComponent(baseItem.test_name || '');
          const url =
               `/result/lab-report-multiple?csvid=${csvid}` +
               `&&testid=${baseItem.testid}` +
               `&&testname=${testname}` +
               `&&ptid=${ptid}` +
               `&&target=${target}` +
               `&&ascensionId=${baseItem.ascension_id}` +
               `&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=false&&multiple`;
          window.open(url, "_blank", "noopener,noreferrer");
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

     const selectedItem =
          selectedAscensionId === null
               ? null
               : testAscensions.find(t => t.ascension_id === selectedAscensionId) || null;

     useEffect(() => {
          if (!selectedItem) return;
          if (!patientid) return;
          setEntryTokensByAscensionId(prev => {
               if (prev[selectedItem.ascension_id]) return prev;
               return {
                    ...prev,
                    [selectedItem.ascension_id]: buildResultEntryTokens(selectedItem.billingid, patientid),
               };
          });
     }, [selectedItem, patientid]);

     const selectedTokens = selectedItem ? entryTokensByAscensionId[selectedItem.ascension_id] : undefined;

     const canEnterOrUpdateResult =
          Boolean(selectedItem?.resultEntryStart) ||
          (Boolean(selectedItem?.samplevalidatedon) && Boolean(selectedItem?.processingEndDate));

     const filteredAscensions = testFilter.trim()
          ? testAscensions.filter(t =>
               t.test_name?.toLowerCase().includes(testFilter.trim().toLowerCase()) ||
               String(t.ascension_id).includes(testFilter.trim()) ||
               String(t.testid).includes(testFilter.trim())
          )
          : testAscensions;

     const getTimelineDotClass = (status: 'done' | 'current' | 'blocked' | 'pending') => {
          if (status === 'done') return 'visitTimelineDotDone';
          if (status === 'current') return 'visitTimelineDotCurrent';
          if (status === 'blocked') return 'visitTimelineDotBlocked';
          return 'visitTimelineDotPending';
     };

     const formatDeliveryModeLabel = (mode: any) => {
          const v = (mode ?? '').toString().trim();
          if (!v) return null;
          return v;
     };

     const DeliveryModeIcon = ({ mode }: { mode: any }) => {
          const normalized = (mode ?? '').toString().trim().toLowerCase();
          if (normalized.includes('whatsapp')) return <RiWhatsappLine size={16} />;
          if (normalized.includes('email')) return <RiMailLine size={16} />;
          if (normalized.includes('phone')) return <RiPhoneLine size={16} />;
          if (normalized.includes('hard')) return <RiFileTextLine size={16} />;
          return <RiInformationLine size={16} />;
     };

     return (
          <div>
               <PreviewPatientInformation patientid={patientid} compact />

               <div className="mt-4">
                    {billingid ? (
                         <div className="card border-0 shadow-sm mb-3">
                              <div className="card-body py-2">
                                   <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between">
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                             <button
                                                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                  disabled={!patientid || testAscensions.length === 0}
                                                  onClick={handlePrintAllResults}
                                                  title="Print all results for this billing"
                                             >
                                                  <RiPrinterLine size={16} />
                                                  <span>Print all results</span>
                                             </button>
                                             {allResultsCompleted && (
                                                  <button
                                                       className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                                       onClick={() => setWorkflow('bulkResultValidation')}
                                                       title="Validate all entered results"
                                                  >
                                                       <RiCheckLine size={16} />
                                                       <span>Validate all</span>
                                                  </button>
                                             )}
                                             {allResultsValidated && validatedAscensionIds ? (
                                                  <button
                                                       className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                       onClick={() => window.open(`/operations/laboratory/validated?ascensionid=${validatedAscensionIds}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                       title="Print validated results"
                                                  >
                                                       <RiPrinterLine size={16} />
                                                       <span>Print validated</span>
                                                  </button>
                                             ) : null}
                                        </div>
                                        <button
                                             className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                             onClick={loadTestTransactions}
                                             title="Refresh test transactions"
                                        >
                                             <RiRefreshLine size={16} />
                                             <span>Refresh</span>
                                        </button>
                                   </div>

                                   <div className="mt-2 d-flex flex-wrap align-items-center gap-2 small">
                                        <span className="text-muted d-inline-flex align-items-center gap-1">
                                             <RiTruckLine size={16} />
                                             <span>Result delivery</span>
                                        </span>
                                        {!selectedItem ? (
                                             <span className="text-muted">Select a test to view delivery status.</span>
                                        ) : (
                                             <>
                                                  <span className="badge text-bg-light border d-inline-flex align-items-center gap-1">
                                                       <DeliveryModeIcon mode={selectedItem.requested_mode} />
                                                       <span>Requested:</span>
                                                       <span className="fw-semibold">{formatDeliveryModeLabel(selectedItem.requested_mode) || 'Not set'}</span>
                                                  </span>
                                                  <span className="badge text-bg-light border d-inline-flex align-items-center gap-1">
                                                       <DeliveryModeIcon mode={selectedItem.delivered_mode} />
                                                       <span>Delivered:</span>
                                                       <span className="fw-semibold">{formatDeliveryModeLabel(selectedItem.delivered_mode) || 'Not delivered'}</span>
                                                  </span>
                                             </>
                                        )}
                                   </div>
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
                         <div className="card">
                              <div className="card-body p-0">
                                   <div className="row g-0">
                                        <div className="col-12 col-lg-3 border-end">
                                             <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between bg-body-tertiary">
                                                  <div className="fw-semibold">Tests</div>
                                                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                       {filteredAscensions.length}/{testAscensions.length}
                                                  </div>
                                             </div>
                                             <div className="p-3">
                                                  <input
                                                       type="text"
                                                       name="testFilterSearch"
                                                       autoComplete="off"
                                                       className="form-control form-control-sm mb-2"
                                                       placeholder="Search test / ascension / id"
                                                       value={testFilter}
                                                       onChange={(e) => setTestFilter(e.target.value)}
                                                  />
                                                  <div className="list-group visitTestList">
                                                       {filteredAscensions.map((item) => {
                                                            const isSelected = item.ascension_id === selectedAscensionId;
                                                            const isCompleted = Boolean(item.resultEntryStart && item.resultEntryEnd);
                                                            const isValidated = item.isapproved === 1 || (item.result_validation_stage || '').toLowerCase().includes('validated') || (item.result_validation_stage || '').toLowerCase().includes('approved');
                                                            const isLocked = !item.samplevalidatedon || !item.processingEndDate;
                                                            const badgeClass = isValidated ? 'bg-success' : isCompleted ? 'bg-primary' : item.samplevalidatedon ? 'bg-warning text-dark' : 'bg-secondary';
                                                            const requestedMode = item.requested_mode;
                                                            const deliveredMode = item.delivered_mode;
                                                            const deliveryNotes = item.delivery_notes;
                                                            return (
                                                                 <button
                                                                      key={item.ascension_id}
                                                                      type="button"
                                                                      className={`list-group-item list-group-item-action d-flex align-items-start justify-content-between ${isSelected ? 'active' : ''}`}
                                                                      onClick={() => setSelectedAscensionId(item.ascension_id)}
                                                                 >
                                                                      <div style={{ minWidth: 0 }}>
                                                                           <div className="fw-semibold text-truncate">{item.test_name}</div>
                                                                           <div style={{ fontSize: '0.85rem' }} className={`${isSelected ? 'text-white-50' : 'text-muted'}`}>
                                                                                Asc: {item.ascension_id} • Test: {item.testid}
                                                                           </div>
                                                                           {!isSelected && isLocked && (
                                                                                <div style={{ fontSize: '0.8rem' }} className="text-muted">
                                                                                     Locked
                                                                                </div>
                                                                           )}
                                                                      </div>
                                                                      <span className={`badge ${badgeClass}`} style={{ height: 'fit-content' }}>
                                                                           {isValidated ? 'Validated' : isCompleted ? 'Entered' : item.samplevalidatedon ? 'In Lab' : 'Pending'}
                                                                      </span>

                                                                 </button>
                                                            );
                                                       })}
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="col-12 col-lg-6 border-end">
                                             <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between bg-body-tertiary">
                                                  <div className="fw-semibold">Result Entry</div>
                                                  {selectedItem && (
                                                       <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                            Ascension: {selectedItem.ascension_id}

                                                       </div>
                                                  )}
                                             </div>
                                             <div className="p-3">
                                                  {!selectedItem ? (
                                                       <div className="alert alert-secondary mb-0" role="alert">
                                                            Click a test on the left to load the result entry form.
                                                       </div>
                                                  ) : !patientid ? (
                                                       <div className="alert alert-danger mb-0" role="alert">
                                                            Missing patient id.
                                                       </div>
                                                  ) : !selectedTokens ? (
                                                       <div className="alert alert-secondary mb-0" role="alert">
                                                            Preparing result entry...
                                                       </div>
                                                  ) : !canEnterOrUpdateResult ? (
                                                       <div className="alert alert-warning mb-0" role="alert">
                                                            Result entry is locked until sample validation and processing are completed.
                                                       </div>
                                                  ) : (
                                                       <div style={{ minWidth: 0 }}>
                                                            <ResultEntryComponent
                                                                 operations={{
                                                                      uiLayout: 3,
                                                                      testid: selectedItem.testid,
                                                                      test: selectedItem.test_name,
                                                                      billingid: selectedTokens.csvid,
                                                                      patientid: selectedTokens.ptid,
                                                                      employeeid,
                                                                      ascensionid: selectedItem.ascension_id,
                                                                      resultEntryStart: selectedItem.resultEntryStart,
                                                                      resultEntryEnd: selectedItem.resultEntryEnd,
                                                                 }}
                                                                 onSaved={loadTestTransactions}
                                                                 onNavigate={(url: string) => {
                                                                      if (url.includes('billingid=')) return setWorkflow('bulkResultValidation');
                                                                      return setWorkflow('resultValidation');
                                                                 }}
                                                                 key={selectedItem.ascension_id}
                                                            />
                                                       </div>
                                                  )}
                                             </div>
                                        </div>

                                        <div className="col-12 col-lg-3">
                                             <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between bg-body-tertiary">
                                                  <div className="fw-semibold">Timeline</div>
                                                  {selectedItem ? (
                                                       <span className={getStageBadgeClass(selectedItem.current_stage)}>
                                                            {selectedItem.current_stage || 'Unknown'}
                                                       </span>
                                                  ) : null}
                                             </div>
                                             <div className="p-3">
                                                  {!selectedItem ? (
                                                       <div className="text-muted">Select a test to view its timeline.</div>
                                                  ) : (
                                                       <>
                                                            <div className="fw-semibold mb-2">{selectedItem.test_name}</div>

                                                            <div className="visitTimeline mb-3">
                                                                 {(() => {
                                                                      const steps = [
                                                                           {
                                                                                label: 'Ascension',
                                                                                when: selectedItem.ascension_date ? formatFullDate(selectedItem.ascension_date) : 'N/A',
                                                                                status: selectedItem.ascension_date ? 'done' : 'pending',
                                                                           },
                                                                           {
                                                                                label: 'Collection',
                                                                                when: selectedItem.collectionStartDate ? `Start: ${formatFullDate(selectedItem.collectionStartDate)}` : 'Not collected',
                                                                                extra: selectedItem.collectionEndDate ? `End: ${formatFullDate(selectedItem.collectionEndDate)}` : null,
                                                                                status: selectedItem.collectionStartDate ? (selectedItem.collectionEndDate ? 'done' : 'current') : 'pending',
                                                                           },
                                                                           {
                                                                                label: 'Sample Validation',
                                                                                when: selectedItem.samplevalidatedon ? formatFullDate(selectedItem.samplevalidatedon) : 'Not validated',
                                                                                status: selectedItem.samplevalidatedon ? 'done' : (selectedItem.collectionStartDate ? 'current' : 'blocked'),
                                                                           },
                                                                           {
                                                                                label: 'Processing',
                                                                                when: selectedItem.processingStartDate ? `Start: ${formatFullDate(selectedItem.processingStartDate)}` : 'Not started',
                                                                                extra: selectedItem.processingEndDate ? `End: ${formatFullDate(selectedItem.processingEndDate)}` : null,
                                                                                status: selectedItem.processingEndDate ? 'done' : (selectedItem.samplevalidatedon ? 'current' : 'blocked'),
                                                                           },
                                                                           {
                                                                                label: 'Result Entry',
                                                                                when: selectedItem.resultEntryStart ? `Start: ${formatFullDate(selectedItem.resultEntryStart)}` : 'Not started',
                                                                                extra: selectedItem.resultEntryEnd ? `End: ${formatFullDate(selectedItem.resultEntryEnd)}` : null,
                                                                                status: selectedItem.resultEntryEnd ? 'done' : (selectedItem.processingEndDate ? 'current' : 'blocked'),
                                                                           },
                                                                           {
                                                                                label: 'Result Validation',
                                                                                when: selectedItem.result_validation_stage ?? 'N/A',
                                                                                extra: selectedItem.lastupdatedon ? `Last Updated: ${formatFullDate(selectedItem.lastupdatedon)}` : null,
                                                                                status: selectedItem.isapproved === 1 ? 'done' : (selectedItem.resultEntryEnd ? 'current' : 'blocked'),
                                                                           },

                                                                      ] as Array<{ label: string; when: string; extra?: string | null; status: 'done' | 'current' | 'blocked' | 'pending' }>;

                                                                      return steps.map((s) => (
                                                                           <div className="visitTimelineItem" key={s.label}>
                                                                                <div className={`visitTimelineDot ${getTimelineDotClass(s.status)}`} />
                                                                                <div className="visitTimelineContent">
                                                                                     <div className="fw-semibold">{s.label}</div>
                                                                                     <div className="text-muted" style={{ fontSize: '0.85rem' }}>{s.when}</div>
                                                                                     {s.extra ? (
                                                                                          <div className="text-muted" style={{ fontSize: '0.85rem' }}>{s.extra}</div>
                                                                                     ) : null}
                                                                                </div>
                                                                           </div>
                                                                      ));
                                                                 })()}
                                                            </div>

                                                            <div className="d-grid gap-2">
                                                                 <button
                                                                      className={`btn btn-sm ${selectedItem.collectionEndDate ? 'btn-outline-secondary' : selectedItem.collectionStartDate ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                                                      disabled={Boolean(selectedItem.collectionEndDate)}
                                                                      onClick={() => setWorkflow('collection')}
                                                                 >
                                                                      {!selectedItem.collectionStartDate
                                                                           ? 'Collect Sample'
                                                                           : !selectedItem.collectionEndDate
                                                                                ? 'Complete Collection'
                                                                                : 'Collection Completed'}
                                                                 </button>

                                                                 {!selectedItem.samplevalidatedon ? (
                                                                      <button
                                                                           className="btn btn-sm btn-outline-warning"
                                                                           disabled={!selectedItem.collectionStartDate}
                                                                           onClick={() => setWorkflow('sampleValidation')}
                                                                      >
                                                                           Validate Sample
                                                                      </button>
                                                                 ) : (
                                                                      <button className="btn btn-sm btn-outline-secondary" disabled>
                                                                           Sample Validated
                                                                      </button>
                                                                 )}

                                                                 <button
                                                                      className={`btn btn-sm ${selectedItem.processingEndDate ? 'btn-outline-secondary' : selectedItem.processingStartDate ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                                                      disabled={Boolean(selectedItem.processingEndDate) || (!selectedItem.samplevalidatedon && !selectedItem.processingStartDate)}
                                                                      onClick={() => setWorkflow('processing')}
                                                                 >
                                                                      {!selectedItem.processingStartDate
                                                                           ? 'Start Processing'
                                                                           : !selectedItem.processingEndDate
                                                                                ? 'Complete Processing'
                                                                                : 'Processing Completed'}
                                                                 </button>

                                                                 {selectedItem.isapproved !== 1 ? (
                                                                      <button
                                                                           className="btn btn-sm btn-outline-success"
                                                                           disabled={!(selectedItem.collectionStartDate && selectedItem.samplevalidatedon && selectedItem.resultEntryStart && selectedItem.resultEntryEnd)}
                                                                           onClick={() => setWorkflow('resultValidation')}
                                                                      >
                                                                           Validate Result
                                                                      </button>
                                                                 ) : (
                                                                      <button className="btn btn-sm btn-outline-secondary" disabled>
                                                                           Result Validated
                                                                      </button>
                                                                 )}

                                                                 {
                                                                      selectedItem.isapproved == 1 ? (
                                                                           <button
                                                                                className="btn btn-sm btn-outline-primary"
                                                                                onClick={() => setWorkflow('resultDelivery')}
                                                                           >
                                                                                Record Result Delivery
                                                                           </button>
                                                                      ) : (
                                                                           <button className="btn btn-sm btn-outline-secondary" disabled>
                                                                                Record Result Delivery
                                                                           </button>
                                                                      )
                                                                 }
                                                            </div>
                                                       </>
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
               {selectedItem && patientid ? (
                    <>
                         <SingleTestCollectionWorkflowModal
                              show={workflow === 'collection'}
                              onHide={() => { setWorkflow(null); loadTestTransactions(); }}
                              onSuccess={loadTestTransactions}
                              test={{
                                   billingid: selectedItem.billingid,
                                   patientid,
                                   ascensionid: selectedItem.ascension_id,
                                   testid: selectedItem.testid,
                                   testname: selectedItem.test_name,
                                   ascensionDate: selectedItem.ascension_date,
                                   collectionStartDate: selectedItem.collectionStartDate,
                                   collectionEndDate: selectedItem.collectionEndDate,
                              }}
                         />
                         <SingleTestSampleValidationWorkflowModal
                              show={workflow === 'sampleValidation'}
                              onHide={() => { setWorkflow(null); loadTestTransactions(); }}
                              onSuccess={loadTestTransactions}
                              test={{
                                   billingid: selectedItem.billingid,
                                   patientid,
                                   ascensionid: selectedItem.ascension_id,
                                   testid: selectedItem.testid,
                                   testname: selectedItem.test_name,
                                   ascensionDate: selectedItem.ascension_date,
                                   samplevalidatedon: selectedItem.samplevalidatedon,
                                   collectionStartDate: selectedItem.collectionStartDate,
                                   collectionEndDate: selectedItem.collectionEndDate,
                              }}
                         />
                         <SingleTestProcessingWorkflowModal
                              show={workflow === 'processing'}
                              onHide={() => { setWorkflow(null); loadTestTransactions(); }}
                              onSuccess={loadTestTransactions}
                              test={{
                                   billingid: selectedItem.billingid,
                                   patientid,
                                   ascensionid: selectedItem.ascension_id,
                                   testid: selectedItem.testid,
                                   testname: selectedItem.test_name,
                                   ascensionDate: selectedItem.ascension_date,
                                   processingStartDate: selectedItem.processingStartDate,
                                   processingEndDate: selectedItem.processingEndDate,
                              }}
                         />
                         <SingleTestResultValidationWorkflowModal
                              show={workflow === 'resultValidation'}
                              onHide={() => { setWorkflow(null); loadTestTransactions(); }}
                              onSuccess={loadTestTransactions}
                              test={{
                                   billingid: selectedItem.billingid,
                                   patientid,
                                   ascensionid: selectedItem.ascension_id,
                                   testid: selectedItem.testid,
                                   testname: selectedItem.test_name,
                                   ascensionDate: selectedItem.ascension_date,
                                   resultEntryStart: selectedItem.resultEntryStart,
                                   resultEntryEnd: selectedItem.resultEntryEnd,
                                   isapproved: selectedItem.isapproved,
                              }}
                         />

                         <SingleWorkFlowResultDeliveryModal
                              item={selectedItem}
                              employeeid={employeeid}
                              workflow={'resultDelivery'}
                              show={workflow === 'resultDelivery'}
                              onHide={() => { setWorkflow(null); loadTestTransactions(); }}
                              onSuccess={loadTestTransactions}

                         />
                         <BulkResultValidationWorkflowModal
                              show={workflow === 'bulkResultValidation'}
                              onHide={() => { setWorkflow(null); loadTestTransactions(); }}
                              onSuccess={loadTestTransactions}
                              billingid={selectedItem.billingid}
                              patientid={patientid}
                              tests={testAscensions
                                   .filter(t => Boolean(t.resultEntryStart && t.resultEntryEnd) && t.isapproved !== 1)
                                   .map(t => ({ ascensionid: t.ascension_id, testid: t.testid, testname: t.test_name }))}
                         />
                    </>
               ) : null}
               <style jsx>{`
                    .visitTestList {
                         max-height: 70vh;
                         overflow-y: auto;
                    }
                    .visitTimeline {
                         position: relative;
                         padding-left: 18px;
                    }
                    .visitTimeline::before {
                         content: '';
                         position: absolute;
                         left: 7px;
                         top: 4px;
                         bottom: 4px;
                         width: 2px;
                         background: var(--bs-border-color);
                    }
                    .visitTimelineItem {
                         position: relative;
                         padding-left: 12px;
                         margin-bottom: 14px;
                    }
                    .visitTimelineDot {
                         position: absolute;
                         left: -18px;
                         top: 4px;
                         width: 10px;
                         height: 10px;
                         border-radius: 999px;
                         border: 2px solid var(--bs-body-bg);
                         background: var(--bs-secondary);
                    }
                    .visitTimelineDotDone {
                         background: var(--bs-success);
                    }
                    .visitTimelineDotCurrent {
                         background: var(--bs-primary);
                    }
                    .visitTimelineDotBlocked {
                         background: var(--bs-danger);
                    }
                    .visitTimelineDotPending {
                         background: var(--bs-secondary);
                    }
                    .visitTimelineContent {
                         min-width: 0;
                    }
               `}</style>
          </div>
     )
}
