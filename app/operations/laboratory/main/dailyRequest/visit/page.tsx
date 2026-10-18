
"use client";
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { LaboratoryWorkflow, workflowFor } from '../../../../../../lib/laboratoryWorkflow';

import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation'
import { customFetch } from '../../../../../../components/Auth/customFetch'
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext'
import ResultEntryComponent from '../../../../../../components/operations/ViewTwoResultEntry/ResultEntryComponent'
import { RiCheckLine, RiInformationLine, RiMailLine, RiPhoneLine, RiPrinterLine, RiRefreshLine, RiTruckLine, RiWhatsappLine, RiFileTextLine, RiSendPlaneLine } from '@remixicon/react';
import {
     BulkResultValidationWorkflowModal,
     SingleTestProcessingWorkflowModal,
     SingleTestResultValidationWorkflowModal,
} from '../../../../../../components/operations/Laboratory/SingleTestWorkflowModals'
import CollectionSampleModal from '../../../../../../components/phelobotomy/CollectionSampleModal';
import SampleAssessmentModal from '../../../../../../components/accessories/SampleAssessmentModal/SampleAssessmentModal';
import SingleWorkFlowResultDeliveryModal from '../../../../../../components/operations/Laboratory/singleWorkFlowDeliveryResult';
import BulkWorkFlowResultDeliveryModal from '../../../../../../components/operations/Laboratory/bulkWorkFlowDeliveryResult';

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
     workflow?: LaboratoryWorkflow;
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
     const [refreshing, setRefreshing] = useState<boolean>(false);
     const [error, setError] = useState<string>('');
     const [selectedAscensionId, setSelectedAscensionId] = useState<number | null>(null);
     const [selectedAscensionIds, setSelectedAscensionIds] = useState<number[]>([]);
     const [testFilter, setTestFilter] = useState('');
     const [globalPin, setGlobalPin] = useState('');
     const [entryTokensByAscensionId, setEntryTokensByAscensionId] = useState<Record<number, { csvid: string; ptid: string }>>({});
     const [workflow, setWorkflow] = useState<null | 'collection' | 'sampleValidation' | 'processing' | 'resultDelivery' | 'bulkResultDelivery' | 'resultValidation' | 'bulkResultValidation'>(null);
     const pinOnResultEntry =
          applicationsettings?.settings?.pinOnResultEntry == 1 ||
          applicationsettings?.result?.isPinOnResultEntry == 1;

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

     const handleSendSMS = (item: TestAscension) => {
          if (!patientid) return;
          const { testid, ascension_id, billingid } = item;
          const url = `/communications/sms/laboratory-lifecycle-events/sends?testid=${encodeURIComponent(testid)}&patientid=${encodeURIComponent(patientid)}&ascensionid=${encodeURIComponent(ascension_id)}&billingid=${encodeURIComponent(billingid)}`;
          window.open(url, "_blank", "noopener,noreferrer");
     };


     const loadTestTransactions = async (silent = false) => {
          if (!billingid) return;

          if (silent || testAscensions.length > 0) {
               setRefreshing(true);
          } else {
               setLoading(true);
          }
          setError('');

          try {
               const response = await customFetch(`operations/overview/folder/open/transaction?billingid=${billingid}`);
               const { statusCode, result, message } = response;
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
               setRefreshing(false);
          }
     }


     useEffect(() => {
          if (billingid) loadTestTransactions();
     }, [billingid]);

     const selectedItem =
          selectedAscensionId === null
               ? null
               : testAscensions.find(t => t.ascension_id === selectedAscensionId) || null;

     const selectedAscensions = testAscensions.filter(item =>
          selectedAscensionIds.includes(item.ascension_id)
     );

     useEffect(() => {
          if (!patientid) return;
          setEntryTokensByAscensionId(prev => {
               const next = { ...prev };
               let changed = false;
               selectedAscensions.forEach(item => {
                    if (!next[item.ascension_id]) {
                         next[item.ascension_id] = buildResultEntryTokens(item.billingid, patientid);
                         changed = true;
                    }
               });
               return changed ? next : prev;
          });
     }, [selectedAscensionIds, testAscensions, patientid]);

     const selectSingleTest = (ascensionId: number) => {
          setSelectedAscensionId(ascensionId);
          setSelectedAscensionIds([ascensionId]);
     };

     const toggleTestSelection = (ascensionId: number) => {
          setSelectedAscensionIds(previous => {
               if (previous.includes(ascensionId)) {
                    const next = previous.filter(id => id !== ascensionId);
                    if (selectedAscensionId === ascensionId) {
                         setSelectedAscensionId(next[0] ?? null);
                    }
                    return next;
               }
               setSelectedAscensionId(ascensionId);
               return [...previous, ascensionId];
          });
     };

     const toggleSelectAllTests = () => {
          if (selectedAscensionIds.length === testAscensions.length) {
               setSelectedAscensionIds([]);
               setSelectedAscensionId(null);
               return;
          }
          setSelectedAscensionIds(testAscensions.map(item => item.ascension_id));
          setSelectedAscensionId(testAscensions[0]?.ascension_id ?? null);
     };

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
                                                  <>
                                                       <button
                                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                            onClick={() => window.open(`/operations/laboratory/validated?ascensionid=${validatedAscensionIds}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')}
                                                            title="Print validated results"
                                                       >
                                                            <RiPrinterLine size={16} />
                                                            <span>Print validated</span>
                                                       </button>
                                                       <button
                                                            className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
                                                            onClick={() => {
                                                                 const item = selectedItem || testAscensions[0];
                                                                 if (item) handleSendSMS(item);
                                                            }}
                                                            title="Send completed SMS for this billing"
                                                       >
                                                            <RiSendPlaneLine size={16} />
                                                            <span>Send SMS</span>
                                                       </button>
                                                       <button
                                                            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                                                            onClick={() => setWorkflow('bulkResultDelivery')}
                                                            title="Record bulk delivery for all validated tests"
                                                       >
                                                            <RiTruckLine size={16} />
                                                            <span>Bulk Delivery</span>
                                                       </button>
                                                  </>
                                             ) : null}
                                        </div>
                                        <button
                                             className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                             onClick={() => loadTestTransactions()}
                                             title="Refresh test transactions"
                                             disabled={refreshing}
                                        >
                                             <RiRefreshLine size={16} className={refreshing ? 'animate-spin' : ''} />
                                             <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
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
                                                  <div>
                                                       <div className="fw-semibold">Tests</div>
                                                       <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                            {selectedAscensionIds.length} selected
                                                       </div>
                                                  </div>
                                                  <button
                                                       type="button"
                                                       className="btn btn-sm btn-outline-primary"
                                                       onClick={toggleSelectAllTests}
                                                  >
                                                       {selectedAscensionIds.length === testAscensions.length ? 'Clear' : 'Select all'}
                                                  </button>
                                             </div>
                                             <div className="p-3">
                                                  <input
                                                       type="text"
                                                       autoCapitalize="off"
                                                       spellCheck={false}
                                                       autoComplete="off"
                                                       name={`testFilterSearch_${new Date()}`}
                                                       className="form-control form-control-sm mb-2"
                                                       placeholder="Search test / ascension / id"
                                                       value={testFilter}
                                                       onChange={(e) => setTestFilter(e.target.value)}
                                                  />
                                                  <div className="list-group visitTestList">
                                                       {filteredAscensions.map((item) => {
                                                            const isSelected = item.ascension_id === selectedAscensionId;
                                                            const isChecked = selectedAscensionIds.includes(item.ascension_id);
                                                            const isCompleted = Boolean(item.resultEntryStart && item.resultEntryEnd);
                                                            const isValidated = item.isapproved === 1 || (item.result_validation_stage || '').toLowerCase().includes('validated') || (item.result_validation_stage || '').toLowerCase().includes('approved');
                                                            const isLocked = !workflowFor(item).canEnterResults;
                                                            const badgeClass = isValidated ? 'bg-success' : isCompleted ? 'bg-primary' : item.samplevalidatedon ? 'bg-warning text-dark' : 'bg-secondary';
                                                            return (
                                                                 <button
                                                                      key={item.ascension_id}
                                                                      type="button"
                                                                      className={`list-group-item list-group-item-action d-flex align-items-start justify-content-between ${isSelected ? 'active' : ''}`}
                                                                      onClick={() => selectSingleTest(item.ascension_id)}
                                                                 >
                                                                      <input
                                                                           type="checkbox"
                                                                           className="form-check-input flex-shrink-0 me-2"
                                                                           checked={isChecked}
                                                                           aria-label={`Select ${item.test_name}`}
                                                                           onClick={(event) => event.stopPropagation()}
                                                                           onChange={() => toggleTestSelection(item.ascension_id)}
                                                                      />
                                                                      <div className="text-start flex-grow-1" style={{ minWidth: 0 }}>
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
                                                  {selectedAscensions.length > 0 && (
                                                       <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                            {selectedAscensions.length} test{selectedAscensions.length === 1 ? '' : 's'} loaded
                                                       </div>
                                                  )}
                                             </div>
                                             <div className="p-3">
                                                  {selectedAscensions.length === 0 ? (
                                                       <div className="alert alert-secondary mb-0" role="alert">
                                                            Click a test to load one form, or use the checkboxes to load several.
                                                       </div>
                                                  ) : !patientid ? (
                                                       <div className="alert alert-danger mb-0" role="alert">
                                                            Missing patient id.
                                                       </div>
                                                  ) : (
                                                       <div style={{ minWidth: 0 }}>
                                                            {pinOnResultEntry && (
                                                                 <div className="border rounded p-3 mb-3 bg-body-tertiary">
                                                                      <label className="form-label fw-semibold mb-1" htmlFor="shared-result-entry-pin">Result entry PIN</label>
                                                                      <input
                                                                           id="shared-result-entry-pin"
                                                                           type="password"
                                                                           className="form-control form-control-sm"
                                                                           placeholder="Enter once for all selected tests"
                                                                           value={globalPin}
                                                                           onChange={(event) => setGlobalPin(event.target.value)}
                                                                           autoComplete="off"
                                                                           style={{ maxWidth: 260 }}
                                                                      />
                                                                 </div>
                                                            )}
                                                            {selectedAscensions.map(item => {
                                                                 const tokens = entryTokensByAscensionId[item.ascension_id];
                                                                 const canEnterOrUpdateResult = workflowFor(item).canEnterResults;

                                                                 if (!tokens) {
                                                                      return <div key={item.ascension_id} className="alert alert-secondary">Preparing {item.test_name}...</div>;
                                                                 }
                                                                 if (!canEnterOrUpdateResult) {
                                                                      return (
                                                                           <div key={item.ascension_id} className="alert alert-warning">
                                                                                <strong>{item.test_name}:</strong> {workflowFor(item).blockedReason}
                                                                           </div>
                                                                      );
                                                                 }

                                                                 return (
                                                                      <ResultEntryComponent
                                                                           operations={{
                                                                                uiLayout: 3,
                                                                                testid: item.testid,
                                                                                test: item.test_name,
                                                                                billingid: tokens.csvid,
                                                                                patientid: tokens.ptid,
                                                                                employeeid,
                                                                                ascensionid: item.ascension_id,
                                                                                resultEntryStart: item.resultEntryStart,
                                                                                resultEntryEnd: item.resultEntryEnd,
                                                                                globalPin,
                                                                           }}
                                                                           onSaved={() => loadTestTransactions(true)}
                                                                           onNavigate={(url: string) => {
                                                                                setSelectedAscensionId(item.ascension_id);
                                                                                if (url.includes('billingid=')) return setWorkflow('bulkResultValidation');
                                                                                return setWorkflow('resultValidation');
                                                                           }}
                                                                           key={item.ascension_id}
                                                                      />
                                                                 );
                                                            })}
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
                                                                                when: workflowFor(selectedItem).collection === 'bypassed' ? 'Bypassed by configuration' : selectedItem.collectionStartDate ? `Start: ${formatFullDate(selectedItem.collectionStartDate)}` : 'Not collected',
                                                                                extra: selectedItem.collectionEndDate ? `End: ${formatFullDate(selectedItem.collectionEndDate)}` : null,
                                                                                status: workflowFor(selectedItem).collection !== 'pending' ? 'done' : 'pending',
                                                                           },
                                                                           {
                                                                                label: 'Sample Validation',
                                                                                when: workflowFor(selectedItem).sampleValidation === 'bypassed' ? 'Bypassed by configuration' : selectedItem.samplevalidatedon ? formatFullDate(selectedItem.samplevalidatedon) : 'Not validated',
                                                                                status: workflowFor(selectedItem).sampleValidation !== 'pending' ? 'done' : (workflowFor(selectedItem).canValidateSample ? 'current' : 'blocked'),
                                                                           },
                                                                           {
                                                                                label: 'Processing',
                                                                                when: workflowFor(selectedItem).processing === 'bypassed' ? 'Bypassed by configuration' : selectedItem.processingStartDate ? `Start: ${formatFullDate(selectedItem.processingStartDate)}` : 'Not started',
                                                                                extra: selectedItem.processingEndDate ? `End: ${formatFullDate(selectedItem.processingEndDate)}` : null,
                                                                                status: workflowFor(selectedItem).processing !== 'pending' ? 'done' : (workflowFor(selectedItem).canProcess ? 'current' : 'blocked'),
                                                                           },
                                                                           {
                                                                                label: 'Result Entry',
                                                                                when: selectedItem.resultEntryStart ? `Start: ${formatFullDate(selectedItem.resultEntryStart)}` : 'Not started',
                                                                                extra: selectedItem.resultEntryEnd ? `End: ${formatFullDate(selectedItem.resultEntryEnd)}` : null,
                                                                                status: selectedItem.resultEntryEnd ? 'done' : (workflowFor(selectedItem).canEnterResults ? 'current' : 'blocked'),
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
                                                                 {workflowFor(selectedItem).blockedReason && <div className="alert alert-warning py-2">{workflowFor(selectedItem).blockedReason}</div>}
                                                                 <button
                                                                      className={`btn btn-sm ${selectedItem.collectionEndDate ? 'btn-outline-secondary' : selectedItem.collectionStartDate ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                                                      disabled={!workflowFor(selectedItem).canCollect}
                                                                      onClick={() => setWorkflow('collection')}
                                                                 >
                                                                      {workflowFor(selectedItem).collection === 'bypassed' && !workflowFor(selectedItem).canCollect ? 'Collection Bypassed' : !selectedItem.collectionStartDate
                                                                           ? 'Collect Sample'
                                                                           : !selectedItem.collectionEndDate
                                                                                ? 'Complete Collection'
                                                                                : 'Collection Completed'}
                                                                 </button>

                                                                 {workflowFor(selectedItem).sampleValidation === 'pending' ? (
                                                                      <button
                                                                           className="btn btn-sm btn-outline-warning"
                                                                           disabled={!workflowFor(selectedItem).canValidateSample}
                                                                           onClick={() => setWorkflow('sampleValidation')}
                                                                      >
                                                                           Validate Sample
                                                                      </button>
                                                                 ) : (
                                                                      <button className="btn btn-sm btn-outline-secondary" disabled>
                                                                           {workflowFor(selectedItem).sampleValidation === 'bypassed' ? 'Sample Validation Bypassed' : 'Sample Validated'}
                                                                      </button>
                                                                 )}

                                                                 <button
                                                                      className={`btn btn-sm ${selectedItem.processingEndDate ? 'btn-outline-secondary' : selectedItem.processingStartDate ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                                                      disabled={!workflowFor(selectedItem).canProcess}
                                                                      onClick={() => setWorkflow('processing')}
                                                                 >
                                                                      {workflowFor(selectedItem).processing === 'bypassed' ? 'Processing Bypassed' : !selectedItem.processingStartDate
                                                                           ? 'Start Processing'
                                                                           : !selectedItem.processingEndDate
                                                                                ? 'Complete Processing'
                                                                                : 'Processing Completed'}
                                                                 </button>

                                                                 {selectedItem.isapproved !== 1 ? (
                                                                      <button
                                                                           className="btn btn-sm btn-outline-success"
                                                                           disabled={!(workflowFor(selectedItem).canEnterResults && selectedItem.resultEntryStart && selectedItem.resultEntryEnd)}
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
                                                                           <>
                                                                                <button
                                                                                     className="btn btn-sm btn-outline-primary"
                                                                                     onClick={() => setWorkflow('resultDelivery')}
                                                                                >
                                                                                     Record Result Delivery
                                                                                </button>
                                                                                <button
                                                                                     className="btn btn-sm btn-outline-info d-flex align-items-center justify-content-center gap-1"
                                                                                     onClick={() => handleSendSMS(selectedItem)}
                                                                                >
                                                                                     <RiSendPlaneLine size={16} />
                                                                                     Send Completed SMS
                                                                                </button>
                                                                           </>
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
                         <CollectionSampleModal
                              show={workflow === 'collection'}
                              hide={() => { setWorkflow(null); loadTestTransactions(true); }}
                              collection={{ billingid: selectedItem.billingid, patientid: Number(patientid) }}
                              employeeid={Number(employeeid)}
                         />
                         <SampleAssessmentModal
                              show={workflow === 'sampleValidation'}
                              hide={() => { setWorkflow(null); loadTestTransactions(true); }}
                              billingid={selectedItem.billingid}
                         />
                         <SingleTestProcessingWorkflowModal
                              show={workflow === 'processing'}
                              onHide={() => { setWorkflow(null); }}
                              onSuccess={(shouldClose = true) => {
                                   loadTestTransactions(true); if (shouldClose) {
                                        setWorkflow(null);
                                   }
                              }}
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
                              onHide={() => { setWorkflow(null); }}
                              onSuccess={(shouldClose = true) => { loadTestTransactions(true); if (shouldClose) setWorkflow(null); }}
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
                              onHide={() => { setWorkflow(null); }}
                              onSuccess={(shouldClose = true) => { loadTestTransactions(true); if (shouldClose) setWorkflow(null); }}

                         />
                    </>
               ) : null}
               <BulkWorkFlowResultDeliveryModal
                    show={workflow === 'bulkResultDelivery'}
                    onHide={() => { setWorkflow(null); }}
                    onSuccess={() => { loadTestTransactions(true); setWorkflow(null); }}
                    employeeid={Number(employeeid)}
                    items={testAscensions.filter(t => t.isapproved === 1 || (t.result_validation_stage || '').toLowerCase().includes('validated'))}
               />
               <BulkResultValidationWorkflowModal
                    show={workflow === 'bulkResultValidation'}
                    onHide={() => { setWorkflow(null); }}
                    onSuccess={(shouldClose = true) => { loadTestTransactions(true); if (shouldClose) setWorkflow(null); }}
                    billingid={Number(billingid)}
                    patientid={patientid || ''}
                    tests={testAscensions
                         .filter(t => Boolean(t.resultEntryStart && t.resultEntryEnd) && t.isapproved !== 1)
                         .map(t => ({ ascensionid: t.ascension_id, testid: t.testid, testname: t.test_name }))}
               />
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
