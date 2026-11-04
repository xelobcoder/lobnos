'use client';
import OutsourceAssignment from '../../../../../../../components/operations/OutsourceAssignment';

import React, { useEffect, useState } from 'react';
import { LaboratoryWorkflow, workflowFor } from '../../../../../../../lib/laboratoryWorkflow';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../../components/Auth/useApplicationContext';
import ResultEntryComponent from '../../../../../../../components/operations/ViewTwoResultEntry/ResultEntryComponent';
import { RiCheckLine, RiMailLine, RiPrinterLine, RiSendPlaneLine, RiTruckLine } from '@remixicon/react';
import {
     BulkResultValidationWorkflowModal,
     SingleTestProcessingWorkflowModal,
     SingleTestResultValidationWorkflowModal
} from '../../../../../../../components/operations/Laboratory/SingleTestWorkflowModals';
import CollectionSampleModal from '../../../../../../../components/phelobotomy/CollectionSampleModal';
import SpecimenRecollectionPanel from '../../../../../../../components/phelobotomy/SpecimenRecollectionPanel';
import SampleAssessmentModal from '../../../../../../../components/accessories/SampleAssessmentModal/SampleAssessmentModal';
import SingleWorkFlowResultDeliveryModal from '../../../../../../../components/operations/Laboratory/singleWorkFlowDeliveryResult';
import BulkWorkFlowResultDeliveryModal from '../../../../../../../components/operations/Laboratory/bulkWorkFlowDeliveryResult';

interface SelectedPatient {
     patientid: number;
     billingid: number;
     patient_details?: string;
}

interface TestAscension {
     workflow?: LaboratoryWorkflow;
     ascension_id: number;
     testid: number;
     test_name: string;
     billingid: number;
     ascension_date?: string;
     collectionStartDate?: string;
     collectionEndDate?: string;
     resultEntryStart?: string;
     resultEntryEnd?: string;
     samplevalidatedon?: string;
     processingStartDate?: string;
     processingEndDate?: string;
     isapproved?: number;
     result_validation_stage?: string;
     lastupdatedon?: string;
     requested_mode?: string | null;
     delivered_mode?: string | null;
     current_stage?: string;
     department?: string;
}

interface PatientTests {
     patient: SelectedPatient;
     tests: TestAscension[];
     loading: boolean;
     error?: string;
}

function createResultEntryTokens(billingid: number, patientid: number) {
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     let random = '';
     for (let index = 0; index < 70; index += 1) {
          random += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     const csvid = `${random}${billingid}`;
     const ptid = `${csvid.slice(25, 50)}${csvid.slice(0, 25)}${patientid}`;
     return { csvid, ptid };
}

function patientDetails(patient: SelectedPatient) {
     const parts = (patient.patient_details || '').split('|').map((part) => part.trim());
     return {
          number: parts[0] || String(patient.patientid),
          name: parts[1] || `Patient ${patient.patientid}`,
          gender: parts[2] || 'N/A',
          age: parts[3] || 'N/A'
     };
}

export default function MultipleClientVisit() {
     const searchParams = useSearchParams();
     const { applicationsettings } = useApplicationSettings();
     const employeeid = applicationsettings?.user?.employeeid || '';
     const [patients, setPatients] = useState<PatientTests[]>([]);
     const [activePatientIndex, setActivePatientIndex] = useState(0);
     const [activeTestId, setActiveTestId] = useState<number | null>(null);
     const [tokens, setTokens] = useState<Record<number, { csvid: string; ptid: string }>>({});
     const [expandedPatients, setExpandedPatients] = useState<Set<number>>(new Set());
     const [error, setError] = useState('');
     const [workflow, setWorkflow] = useState<null | 'collection' | 'sampleValidation' | 'processing' | 'resultValidation' | 'resultDelivery' | 'bulkResultValidation' | 'bulkResultDelivery'>(null);

     useEffect(() => {
          const rawSelected = searchParams.get('selected');
          if (!rawSelected) {
               setError('No patients were selected.');
               return;
          }

          try {
               const selectedPatients = JSON.parse(rawSelected) as SelectedPatient[];
               if (!Array.isArray(selectedPatients) || selectedPatients.length === 0) {
                    setError('No patients were selected.');
                    return;
               }
               setPatients(selectedPatients.map((patient) => ({ patient, tests: [], loading: true })));
               setExpandedPatients(new Set([selectedPatients[0].billingid]));
               selectedPatients.forEach((patient) => {
                    loadTests(patient);
               });
          } catch {
               setError('The selected patient list is invalid.');
          }
     }, [searchParams]);

     const loadTests = async (patient: SelectedPatient) => {
          try {
               const response = await customFetch(`operations/overview/folder/open/transaction?billingid=${patient.billingid}`);
               const tests = Array.isArray(response?.result)
                    ? response.result.filter((test: TestAscension) => test && test.ascension_id && test.test_name)
                    : [];
               setPatients((current) => current.map((item) => item.patient.billingid === patient.billingid
                    ? { ...item, tests, loading: false, error: Array.isArray(response?.result) ? undefined : 'Unable to load tests.' }
                    : item));
          } catch {
               setPatients((current) => current.map((item) => item.patient.billingid === patient.billingid
                    ? { ...item, loading: false, error: 'Failed to load tests.' }
                    : item));
          }
     };

     const activePatient = patients[activePatientIndex];
     const activeTest = activePatient?.tests.find((test) => test.ascension_id === activeTestId);
     const activeTokens = activeTest && activePatient ? tokens[activeTest.ascension_id] : undefined;

     const activatePatient = (index: number) => {
          setActivePatientIndex(index);
          setActiveTestId(null);
          const billingid = patients[index]?.patient.billingid;
          setExpandedPatients((current) => new Set(current).add(billingid));
     };

     const togglePatient = (index: number) => {
          const billingid = patients[index]?.patient.billingid;
          setActivePatientIndex(index);
          setActiveTestId(null);
          setExpandedPatients((current) => {
               if (current.has(billingid)) return new Set();
               return new Set([billingid]);
          });
     };

     const selectTest = (test: TestAscension, patient: SelectedPatient) => {
          setActiveTestId(test.ascension_id);
          setTokens((current) => current[test.ascension_id] ? current : {
               ...current,
               [test.ascension_id]: createResultEntryTokens(test.billingid, patient.patientid)
          });
     };

     const formatWhen = (value?: string) => {
          if (!value) return 'N/A';
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return 'N/A';
          const day = date.getDate();
          const ordinal = day > 3 && day < 21 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] || 'th';
          const hours = date.getHours();
          const hour = hours % 12 || 12;
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${day}${ordinal} ${date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} [${date.toLocaleDateString(undefined, { weekday: 'short' })}] @${hour}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
     };
     const timelineStatus = (done: boolean, current: boolean) => done ? 'done' : current ? 'current' : 'blocked';
     const departmentClass = (department?: string) => {
          const value = (department || '').toLowerCase();
          if (value.includes('hemat')) return 'text-bg-danger';
          if (value.includes('chem')) return 'text-bg-warning';
          if (value.includes('micro')) return 'text-bg-success';
          if (value.includes('immun')) return 'text-bg-info';
          return 'text-bg-secondary';
     };
     const testStatus = (test: TestAscension) => test.isapproved === 1 ? 'Validated' : test.resultEntryEnd ? 'Entered' : test.samplevalidatedon ? 'In Lab' : 'Pending';
     const handleSendSMS = () => {
          if (!activeTest || !activePatient) return;
          window.open(`/communications/sms/laboratory-lifecycle-events/sends?testid=${activeTest.testid}&patientid=${activePatient.patient.patientid}&ascensionid=${activeTest.ascension_id}&billingid=${activeTest.billingid}`, '_blank', 'noopener,noreferrer');
     };

     const workflowSuccess = (shouldClose = true) => {
          if (activePatient) loadTests(activePatient.patient);
          if (shouldClose) setWorkflow(null);
     };

     const buildPrintTokens = (billingid: number, patientid: number) => {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let random = '';
          for (let index = 0; index < 70; index += 1) random += characters.charAt(Math.floor(Math.random() * characters.length));
          return { csvid: `${random}${billingid}`, ptid: `${random.slice(25, 50)}${random.slice(0, 25)}${patientid}` };
     };

     const handlePrintAllResults = () => {
          if (!activePatient || activePatient.tests.length === 0) return;
          const item = activeTest || activePatient.tests[0];
          const { csvid, ptid } = buildPrintTokens(item.billingid, activePatient.patient.patientid);
          const url = `/result/lab-report-multiple?csvid=${csvid}&testid=${item.testid}&testname=${encodeURIComponent(item.test_name || '')}&ptid=${ptid}&target=70,50&ascensionId=${item.ascension_id}&isMultiple=false&isUltrasound=false&is_password_encrypted=false&password=false&multiple`;
          window.open(url, '_blank', 'noopener,noreferrer');
     };

     const validatedTests = activePatient?.tests.filter((test) => test.isapproved === 1 || (test.result_validation_stage || '').toLowerCase().includes('validated')) || [];
     const completedTests = activePatient?.tests.filter((test) => Boolean(test.resultEntryEnd)) || [];

     return (
          <div className="container-fluid py-2">
               {error ? <div className="alert alert-danger">{error}</div> : null}
               <div className="card border-0 shadow-sm" style={{ minHeight: 'calc(100vh - 1rem)' }}>
                    <div className="p-3 border-bottom">
                         <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between">
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                   <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" disabled={!activePatient || activePatient.tests.length === 0} onClick={handlePrintAllResults} title="Print all results for this patient"><RiPrinterLine size={16} /> Print all results</button>
                                   <button className="btn btn-sm btn-success d-inline-flex align-items-center gap-1" disabled={completedTests.length === 0} onClick={() => setWorkflow('bulkResultValidation')} title="Validate all entered results"><RiCheckLine size={16} /> Validate all</button>
                                   <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" disabled={validatedTests.length === 0} onClick={() => activeTest && window.open(`/operations/laboratory/validated?ascensionid=${validatedTests.map((test) => test.ascension_id).join(',')}&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer')} title="Print validated results"><RiPrinterLine size={16} /> Print validated</button>
                                   <button className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1" disabled={!activeTest} onClick={handleSendSMS} title="Send completed SMS"><RiMailLine size={16} /> Send SMS</button>
                                   <button className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1" disabled={validatedTests.length === 0} onClick={() => setWorkflow('bulkResultDelivery')} title="Record delivery for validated results"><RiTruckLine size={16} /> Bulk delivery</button>
                              </div>
                              <div className="small text-muted text-uppercase fw-bold">{activePatient ? `${patientDetails(activePatient.patient).name} · ${activePatient.tests.length} TESTS` : 'SELECT A PATIENT'}</div>
                         </div>
                    </div>
                    <div className="row g-0">
                         <aside className="col-12 col-lg-3 border-end" style={{ maxHeight: 'calc(100vh - 1rem)', overflowY: 'auto' }}>
                              <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between bg-body-tertiary">
                                   <div className="fw-bold">PATIENTS</div>
                                   <div className="text-muted" style={{ fontSize: '0.85rem' }}>{patients.length}</div>
                              </div>
                              <div className="p-3 fw-bold">
                                   <div className="list-group visitPatientList text-uppercase">
                                        {patients.map((item, index) => {
                                             const expanded = expandedPatients.has(item.patient.billingid);
                                             const details = patientDetails(item.patient);
                                             return (
                                                  <React.Fragment key={item.patient.billingid}>
                                                       <button type="button" className={`list-group-item list-group-item-action py-2 ${index === activePatientIndex ? 'active' : ''}`} onClick={() => togglePatient(index)}>
                                                            <div className="d-flex gap-2 align-items-start">
                                                                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}&background=random&size=64`} alt="" className="rounded-circle border" style={{ width: 30, height: 30, flex: '0 0 auto' }} />
                                                                 <div className="text-start text-truncate flex-grow-1">
                                                                      <div className="fw-bold text-truncate">{details.name}</div>
                                                                      <div className="small opacity-75 fw-bold">{details.number} · {details.age} · {details.gender}</div>
                                                                 </div>
                                                                 <span aria-hidden="true" className="small">{expanded ? '−' : '+'}</span>
                                                            </div>
                                                            <div className={`d-flex justify-content-between gap-2 mt-1 small fw-bold ${index === activePatientIndex ? 'text-white-50' : 'text-muted'}`}>
                                                                 <span>BILLING ID: {item.patient.billingid}</span>
                                                                 <span>{item.tests.length} TESTS</span>
                                                            </div>
                                                       </button>
                                                       {expanded && (
                                                            <div className="list-group list-group-flush bg-body-tertiary border-start border-3 border-primary ms-3 mb-2" style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                                                                 {item.loading ? <div className="p-2 small text-muted">Loading tests...</div> : null}
                                                                 {item.error ? <div className="p-2 small text-danger">{item.error}</div> : null}
                                                                 {item.tests.map((test) => (
                                                                      <button key={test.ascension_id} type="button" className={`list-group-item list-group-item-action px-3 py-2 ${test.ascension_id === activeTestId ? 'active' : ''}`} onClick={() => { activatePatient(index); selectTest(test, item.patient); }}>
                                                                           <div className="d-flex align-items-center gap-1">
                                                                                <div className="small fw-bold text-truncate flex-grow-1" style={{ fontWeight: 800 }}>{test.test_name}</div>
                                                                                <span className={`badge fw-bold ${test.isapproved === 1 ? 'text-bg-success' : test.resultEntryEnd ? 'text-bg-primary' : test.samplevalidatedon ? 'text-bg-warning' : 'text-bg-secondary'}`} style={{ fontSize: '0.65rem' }}>{testStatus(test)}</span>
                                                                           </div>
                                                                           {test.department ? <small className="fw-bold"><span className={`badge fw-bold ${departmentClass(test.department)}`} style={{ fontSize: '0.62rem' }}>{test.department}</span></small> : null}
                                                                      </button>
                                                                 ))}
                                                                 {!item.loading && !item.error && item.tests.length === 0 ? <div className="p-2 small text-muted">No tests found.</div> : null}
                                                            </div>
                                                       )}
                                                  </React.Fragment>
                                             );
                                        })}
                                   </div>
                              </div>
                         </aside>

                         <main className="col-12 col-lg-6 border-end">
                              <div className="p-3 border-bottom fw-semibold">Result Entry</div>
                              <div className="p-3">
                                   {!activeTest || !activePatient ? <div className="alert alert-secondary">Select a patient and test to load the result form.</div> : null}
                                   {activeTest && activePatient && !activeTokens ? <div className="alert alert-secondary">Preparing result entry...</div> : null}
                                   {activeTest && activePatient && activeTokens && !workflowFor(activeTest, applicationsettings?.settings).canEnterResults ? (
                                        <div className="alert alert-warning">{workflowFor(activeTest, applicationsettings?.settings).blockedReason}</div>
                                   ) : null}
                                   {activeTest && activePatient && activeTokens && workflowFor(activeTest, applicationsettings?.settings).canEnterResults ? (
                                        <ResultEntryComponent
                                             key={activeTest.ascension_id}
                                             operations={{ uiLayout: 3, testid: activeTest.testid, test: activeTest.test_name, billingid: activeTokens.csvid, patientid: activeTokens.ptid, employeeid, ascensionid: activeTest.ascension_id, resultEntryStart: activeTest.resultEntryStart, resultEntryEnd: activeTest.resultEntryEnd }}
                                             onSaved={() => loadTests(activePatient.patient)}
                                             onNavigate={(url: string) => {
                                                  if (url.includes('billingid=')) {
                                                       setWorkflow('bulkResultValidation');
                                                  } else {
                                                       setWorkflow('resultValidation');
                                                  }
                                             }}
                                        />
                                   ) : null}
                              </div>
                         </main>

                         <aside className="col-12 col-lg-3">
                              <div className="p-3 border-bottom fw-semibold">Workflow</div>
                              <div className="p-3">
                                   {!activeTest || !activePatient ? <div className="text-muted small">Select a test to view its workflow.</div> : (
                                        <>
                                             <div className="mb-3">
                                                  <div className="fw-semibold">{activeTest.test_name}</div>
                                                  <div className="text-muted small">Ascension #{activeTest.ascension_id}</div>
                                             </div>
                                             <div className="visitTimeline mb-3">
                                                  {[
                                                       { label: 'Ascension', when: activeTest.ascension_date ? formatWhen(activeTest.ascension_date) : 'N/A', status: activeTest.ascension_date ? 'done' : 'pending' },
                                                       { label: 'Collection', when: workflowFor(activeTest, applicationsettings?.settings).collection === 'bypassed' ? 'Bypassed by configuration' : activeTest.collectionStartDate ? `Start: ${formatWhen(activeTest.collectionStartDate)}` : 'Not collected', extra: activeTest.collectionEndDate ? `End: ${formatWhen(activeTest.collectionEndDate)}` : null, status: workflowFor(activeTest, applicationsettings?.settings).collection !== 'pending' ? 'done' : 'pending' },
                                                       { label: 'Sample Validation', when: workflowFor(activeTest, applicationsettings?.settings).sampleValidation === 'bypassed' ? 'Bypassed by configuration' : activeTest.samplevalidatedon ? formatWhen(activeTest.samplevalidatedon) : 'Not validated', status: workflowFor(activeTest, applicationsettings?.settings).sampleValidation !== 'pending' ? 'done' : workflowFor(activeTest, applicationsettings?.settings).canValidateSample ? 'current' : 'blocked' },
                                                       { label: 'Processing', when: workflowFor(activeTest, applicationsettings?.settings).processing === 'bypassed' ? 'Bypassed by configuration' : activeTest.processingStartDate ? `Start: ${formatWhen(activeTest.processingStartDate)}` : 'Not started', extra: activeTest.processingEndDate ? `End: ${formatWhen(activeTest.processingEndDate)}` : null, status: workflowFor(activeTest, applicationsettings?.settings).processing !== 'pending' ? 'done' : workflowFor(activeTest, applicationsettings?.settings).canProcess ? 'current' : 'blocked' },
                                                       { label: 'Result Entry', when: activeTest.resultEntryStart ? `Start: ${formatWhen(activeTest.resultEntryStart)}` : 'Not started', extra: activeTest.resultEntryEnd ? `End: ${formatWhen(activeTest.resultEntryEnd)}` : null, status: activeTest.resultEntryEnd ? 'done' : workflowFor(activeTest, applicationsettings?.settings).canEnterResults ? 'current' : 'blocked' },
                                                       { label: 'Result Validation', when: activeTest.result_validation_stage || 'Not validated', extra: activeTest.lastupdatedon ? `Last Updated: ${formatWhen(activeTest.lastupdatedon)}` : null, status: activeTest.isapproved === 1 ? 'done' : activeTest.resultEntryEnd ? 'current' : 'blocked' }
                                                  ].map((step) => (
                                                       <div className="visitTimelineItem" key={step.label}>
                                                            <div className={`visitTimelineDot visitTimelineDot${step.status.charAt(0).toUpperCase()}${step.status.slice(1)}`} />
                                                            <div className="visitTimelineContent">
                                                                 <div className="fw-bold">{step.label}</div>
                                                                 <div className="text-muted" style={{ fontSize: '0.85rem' }}>{step.when}</div>
                                                                 {step.extra ? <div className="text-muted" style={{ fontSize: '0.85rem' }}>{step.extra}</div> : null}
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                             <div className="d-grid gap-2">
                                                  <OutsourceAssignment ascensionId={Number(activeTest.ascension_id)}/>
                                                                 <SpecimenRecollectionPanel billingid={activeTest.billingid} ascensionId={activeTest.ascension_id} compact onChanged={() => loadTests(activePatient.patient)} />
                                                  {workflowFor(activeTest, applicationsettings?.settings).blockedReason && <div className="alert alert-warning py-2">{workflowFor(activeTest, applicationsettings?.settings).blockedReason}</div>}
                                                  <button className="btn btn-sm btn-outline-primary" disabled={!workflowFor(activeTest, applicationsettings?.settings).canCollect} onClick={() => setWorkflow('collection')}>
                                                       {workflowFor(activeTest, applicationsettings?.settings).collection === 'bypassed' && !workflowFor(activeTest, applicationsettings?.settings).canCollect ? 'Collection Bypassed' : workflowFor(activeTest, applicationsettings?.settings).collection === 'completed' ? 'Collection Completed' : !activeTest.collectionStartDate ? 'Collect Sample' : 'Complete Collection'}
                                                  </button>
                                                  <button className="btn btn-sm btn-outline-warning" disabled={!workflowFor(activeTest, applicationsettings?.settings).canValidateSample} onClick={() => setWorkflow('sampleValidation')}>
                                                       {workflowFor(activeTest, applicationsettings?.settings).sampleValidation === 'bypassed' ? 'Sample Validation Bypassed' : workflowFor(activeTest, applicationsettings?.settings).sampleValidation === 'completed' ? 'Sample Validated' : 'Validate Sample'}
                                                  </button>
                                                  <button className="btn btn-sm btn-outline-primary" disabled={!workflowFor(activeTest, applicationsettings?.settings).canProcess} onClick={() => setWorkflow('processing')}>
                                                       {workflowFor(activeTest, applicationsettings?.settings).processing === 'bypassed' ? 'Processing Bypassed' : !activeTest.processingStartDate ? 'Start Processing' : activeTest.processingEndDate ? 'Processing Completed' : 'Complete Processing'}
                                                  </button>
                                                  <button className="btn btn-sm btn-outline-success" disabled={activeTest.isapproved === 1 || !activeTest.resultEntryEnd} onClick={() => setWorkflow('resultValidation')}>
                                                       {activeTest.isapproved === 1 ? 'Result Validated' : 'Validate Result'}
                                                  </button>
                                                  <button className="btn btn-sm btn-outline-primary" disabled={activeTest.isapproved !== 1} onClick={() => setWorkflow('resultDelivery')}>Record Result Delivery</button>
                                                  <button className="btn btn-sm btn-outline-info" disabled={activeTest.isapproved !== 1} onClick={handleSendSMS}><RiSendPlaneLine size={16} /> Send Completed SMS</button>
                                             </div>
                                        </>
                                   )}
                              </div>
                         </aside>
                    </div>
               </div>
               {activeTest && activePatient ? (
                    <>
                         <CollectionSampleModal
                              show={workflow === 'collection'}
                              hide={() => { setWorkflow(null); loadTests(activePatient.patient); }}
                              collection={{ billingid: activeTest.billingid, patientid: activePatient.patient.patientid, fullname: patientDetails(activePatient.patient).name }}
                              employeeid={Number(employeeid)}
                         />
                         <SampleAssessmentModal
                              show={workflow === 'sampleValidation'}
                              hide={() => { setWorkflow(null); loadTests(activePatient.patient); }}
                              billingid={activeTest.billingid}
                         />
                         <SingleTestProcessingWorkflowModal show={workflow === 'processing'} onHide={() => setWorkflow(null)} onSuccess={workflowSuccess} test={{ billingid: activeTest.billingid, patientid: String(activePatient.patient.patientid), ascensionid: activeTest.ascension_id, testid: activeTest.testid, testname: activeTest.test_name, ascensionDate: activeTest.ascension_date, processingStartDate: activeTest.processingStartDate, processingEndDate: activeTest.processingEndDate }} />
                         <SingleTestResultValidationWorkflowModal show={workflow === 'resultValidation'} onHide={() => setWorkflow(null)} onSuccess={workflowSuccess} test={{ billingid: activeTest.billingid, patientid: String(activePatient.patient.patientid), ascensionid: activeTest.ascension_id, testid: activeTest.testid, testname: activeTest.test_name, ascensionDate: activeTest.ascension_date, resultEntryStart: activeTest.resultEntryStart, resultEntryEnd: activeTest.resultEntryEnd, isapproved: activeTest.isapproved }} />
                         <SingleWorkFlowResultDeliveryModal item={activeTest} employeeid={employeeid} workflow="resultDelivery" show={workflow === 'resultDelivery'} onHide={() => setWorkflow(null)} onSuccess={workflowSuccess} />
                         <BulkResultValidationWorkflowModal show={workflow === 'bulkResultValidation'} onHide={() => setWorkflow(null)} onSuccess={workflowSuccess} billingid={Number(activePatient.patient.billingid)} patientid={String(activePatient.patient.patientid)} tests={completedTests.filter((test) => test.isapproved !== 1).map((test) => ({ ascensionid: test.ascension_id, testid: test.testid, testname: test.test_name }))} />
                         <BulkWorkFlowResultDeliveryModal show={workflow === 'bulkResultDelivery'} onHide={() => setWorkflow(null)} onSuccess={workflowSuccess} employeeid={Number(employeeid)} items={validatedTests} />
                    </>
               ) : null}
               <style jsx>{`
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
                    .visitTimelineDotDone { background: var(--bs-success); }
                    .visitTimelineDotCurrent { background: var(--bs-primary); }
                    .visitTimelineDotBlocked { background: var(--bs-danger); }
                    .visitTimelineDotPending { background: var(--bs-secondary); }
                    .visitTimelineContent { min-width: 0; }
               `}</style>
          </div>
     );
}