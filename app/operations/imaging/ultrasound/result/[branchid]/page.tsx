"use client";

import { useEffect, useState, useRef } from 'react';
import { createResultSaveSession } from '../../../../../../lib/resultSaveSession';
import { customPost, customFetch, validatePin, generateRandomTextAndNumbers } from '../../../../../../components/Auth/customFetch';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Loader from '../../../../../../components/accessories/Loader';
import { toast } from 'react-toastify';
import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';
import { isSuperAdminRole } from '../../../../../../components/Auth/roles';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../../../../components/Auth/customFetch';
import { RiFileTextLine, RiImageLine, RiHistoryLine, RiFileList2Line } from '@remixicon/react';
import AccessHistoryTab from './AccessHistoryTab';
import AccessRequestForm from './AccessRequestForm';
import ImageUploadTab from './ImageUploadTab';
import ImagingResultActions from '../../../../../../components/operations/Ultrasound/ImagingResultActions';

const ResultValidationModal = dynamic(() => import('../../../../../../components/operations/Laboratory/ValidationModal'), { ssr: false });

const MARKDOWN_EDITOR = dynamic(() => import('../../../../../../components/accessories/markdownEditor'), { ssr: false });

interface Field {
     name: string;
     value: string;
     fieldid?: number;
     id?: number;
     field?: string;
     plan?: string;
     units?: string;
     ordering?: number | string;
     employeeid?: number;
}

interface UltrasoundTemplateOption {
     value: number;
     label: string;
     details: Record<string, any>;
}

interface ClinicalHistoryResponse {
     clinical_history: string;
     ascensionid: string;
}

function mapFieldsToRules(fields: any[], rules: any[]): Field[] {
     return fields.map((field) => {
          const fieldId = Number(field.fieldid || field.id || 0);
          const rule = rules.find((item) => Number(item.id || item.fieldid) === fieldId)
               || rules.find((item) => String(item.name || item.field).trim().toLowerCase() === String(field.field || field.name).trim().toLowerCase());

          return {
               ...rule,
               ...field,
               name: field.field || field.name || rule?.name || '',
               fieldid: fieldId || Number(rule?.id || rule?.fieldid || 0) || undefined,
               value: field.value || '',
          };
     }).sort((first, second) => Number(first.ordering || 0) - Number(second.ordering || 0));
}

export default function EnterResultUltrasound() {
     const saveSession = useRef<ReturnType<typeof createResultSaveSession> | null>(null);
     if (!saveSession.current) saveSession.current = createResultSaveSession();
     const { user } = useApplicationSettings().applicationsettings;
     const employeeid = user?.employeeid;
     const searchParams = useSearchParams();
     const scan = searchParams?.get('scan') ?? null;
     const testid = searchParams?.get('testid') ?? null;
     const update = searchParams?.get('update') ?? null;
     const urlpatientid = searchParams?.get('ptid') ?? null;
     const patientid = urlpatientid ? urlpatientid.slice(50) : urlpatientid;
     const urlbillingid = searchParams?.get('csvid') ?? null;
     const billingid = urlbillingid ? urlbillingid.slice(70) : urlbillingid;
     const ascensionid = searchParams?.get('ascensionid') ?? null;

     const [fields, setFields] = useState<Field[]>([]);
     const [impression, setImpression] = useState('');
     const [clinicalHistory, setClinicalHistory] = useState('');
     const [testname, setTestName] = useState('');
     const [templateOptions, setTemplateOptions] = useState<UltrasoundTemplateOption[]>([]);
     const [selectedTemplate, setSelectedTemplate] = useState<UltrasoundTemplateOption | null>(null);
     const [isLoading, setLoading] = useState(true);
     const [submitting, setSubmitting] = useState(false);
     const [viewAllTemplates, setViewAllTemplates] = useState(false);
     const [entered, setEnteredResult] = useState(false);
     const [showResultValidation, setShowResultValidation] = useState(false);
     const [requiresRevalidation, setRequiresRevalidation] = useState(false);
     const [activeSection, setActiveSection] = useState<'result' | 'clinical' | 'images' | 'access' | 'access-history'>('result');
     // entryMode removed; always use freeform editor
     const [isPinUsed] = useState(true);
     const [pin, setPin] = useState('');
     const [isTemplateLoading, setIsTemplateLoading] = useState(false);
     const [hydrationError,setHydrationError]=useState(''),[hydrationRevision,setHydrationRevision]=useState(0),[loadedResultKey,setLoadedResultKey]=useState('');
     const resultKey=`${ascensionid}:${urlpatientid}:${urlbillingid}:${testid}`;
     const templateGeneration=useRef(0);
     const [templateUndo,setTemplateUndo]=useState<{fields:any[];impression:string;template:UltrasoundTemplateOption|null}|null>(null);


     const fetchTemplates = async () => {
          try {
               const url = viewAllTemplates
                    ? `result/entry/ultrasound/templates/list?page=1&count=1000&employeeid=${employeeid}`
                    : `result/entry/ultrasound/templates/list?page=1&count=100&employeeid=${employeeid}&&testid=${testid}`;
               const response = await customFetch(url);
               setTemplateOptions(Array.isArray(response) ? response.map((item) => ({
                    value: item.keyid,
                    label: `${item.associatedbodypart || 'Ultrasound'} · ${item.name}`,
                    details: item,
               })) : []);
          } catch (error) {
               console.error('Failed to fetch templates:', error);
               setTemplateOptions([]);
          }
     };

     useEffect(() => {
          void fetchTemplates();
     }, [employeeid, testid, viewAllTemplates]);

     const handleTemplateChange = async (selectedOption: UltrasoundTemplateOption | null) => {
          if(loadedResultKey!==resultKey||submitting)return;
          if((fields.some(field=>String(field.value||'').trim())||impression.trim())&&!window.confirm('Replace the current findings with this template? You can undo the replacement before saving.'))return;
          const generation=++templateGeneration.current;
          const previous={fields:fields.map(field=>({...field})),impression,template:selectedTemplate};
          setIsTemplateLoading(true);
          if (!selectedOption) {
               setTemplateUndo(previous);setSelectedTemplate(null);
               setFields([]);
               setImpression('');
               setIsTemplateLoading(false);
               return;
          }

          try {
               const response = await customFetch(`testpanel/list/ultrasound/get/template?templateid=${selectedOption.value}`);
               if (!response || !Array.isArray(response.fields)) {
                    throw new Error(response?.message || "This ultrasound template is no longer available.");
               }
               const responseTestId = response.testid || selectedOption.details?.testid || testid;
               const rulesResponse = await customFetch(`testpanel/list/customtestrule?testid=${responseTestId}`);
               const rules = Array.isArray(rulesResponse) ? rulesResponse : rulesResponse?.data || [];
               if(generation!==templateGeneration.current)return;
               const updatedFields = mapFieldsToRules(Array.isArray(response.fields) ? response.fields : [], rules);
               setTemplateUndo(previous);setSelectedTemplate(selectedOption);
               setFields(updatedFields);
               const impressionField = updatedFields.find((field) => field.name.toLowerCase() === 'impression');
               setImpression(impressionField?.value || '');
          } catch (error) {
               console.error('Failed to fetch template details:', error);
               toast.error(error instanceof Error ? error.message : 'Failed to load template');
          } finally {
               if(generation===templateGeneration.current)setIsTemplateLoading(false);
          }
     };

     useEffect(() => {
          let cancelled = false;
          templateGeneration.current++;setIsTemplateLoading(false);setLoading(true);setHydrationError('');setLoadedResultKey('');setTemplateUndo(null);
          const loadExistingResult = async () => {
               try {
                    const [commentsResponse, resultResponse, clinicalHistoryResponse, rulesResponse] = await Promise.all([
                         customFetch(`testpanel/list/customtestrule/previous/comments?testid=${testid}&&csvid=${urlbillingid}&&ptid=${urlpatientid}`),
                         customFetch(`testpanel/list/customtestrule/previous?testid=${testid}&&ptid=${urlpatientid}&&csvid=${urlbillingid}`),
                         customFetch(`ultrasound/chx/ascension/${ascensionid}`),
                         customFetch(`testpanel/list/customtestrule?testid=${testid}`),
                    ]);
                    if (cancelled) return;
                    if([commentsResponse,resultResponse,clinicalHistoryResponse,rulesResponse].some(value=>!value||value.error||value.status===false||value.status==='error')||!Array.isArray(resultResponse?.result))throw new Error('Unable to load the existing report completely. Retry before editing.');

                    const rules = Array.isArray(rulesResponse) ? rulesResponse : rulesResponse?.data || [];
                    if (Array.isArray(resultResponse?.result)) {
                         const mappedFields = mapFieldsToRules(resultResponse.result, rules);
                         setFields(mappedFields);
                         setEnteredResult(mappedFields.some((field) => Boolean(field.value)));
                    }
                    if (resultResponse?.testname) setTestName(resultResponse.testname);
                    setImpression(commentsResponse?.comments || '');
                    setClinicalHistory(clinicalHistoryResponse?.clinical_history||'');
                    setLoadedResultKey(resultKey);
               } catch (error) {
                    console.error('Failed to load existing ultrasound result:', error);
                    if (!cancelled) {
                         setHydrationError(error instanceof Error?error.message:'Unable to load the existing report. Please retry.');
                    }
               } finally {
                    if (!cancelled) setLoading(false);
               }
          };

          if (urlbillingid && urlpatientid && ascensionid) void loadExistingResult();
          else {setHydrationError('The report identity is incomplete. Reopen it from the worklist.');setLoading(false);}
          return () => { cancelled = true; };
     }, [urlbillingid, urlpatientid, ascensionid, scan, testid, hydrationRevision]);

     const handleFieldChange = (value: string, index: number) => {
          setFields((current) => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, value } : field));
          if (fields[index]?.name.trim().toLowerCase() === 'impression') setImpression(value);
     };

     const handleImpressionChange = (_event: unknown, value: string) => setImpression(value);

     // structured generation removed — keep impression/fields editable only via freeform editor or templates

     const handleResult = async () => {
          if(loadedResultKey!==resultKey||hydrationError||isTemplateLoading)return;
          if (!saveSession.current!.start()) return;
          setSubmitting(true);
          try {
               if (update === 'true' && fields.length > 0) {
                    const firstResult = fields[0];
                    if (firstResult.employeeid !== user?.employeeid && user?.role !== 'admin' && !isSuperAdminRole(user?.role)) {
                         toast.error('You are not authorized to update this result.');
                         return;
                    }
               }

               if (isPinUsed) {
                    const validation = await validatePin(user?.employeeid, pin);
                    if (validation?.status !== true) {
                         toast.error(validation?.message || 'Invalid PIN');
                         return;
                    }
               }

               const resultFields = fields.map((item) => {
                    const fieldid = item.fieldid || item.id;
                    const value = item.name.trim().toLowerCase() === 'impression' ? impression : item.value;
                    return { field: item.name, value, fieldid, originalvalue: value };
               });
               const response = await customPost('result/entry/customtest', 'POST', saveSession.current!.identify({
                    csvid: urlbillingid,
                    testid,
                    patientid: parseInt(patientid as string),
                    test: scan,
                    ptid: urlpatientid,
                    comments: impression,
                    fields: resultFields,
                    ascensionid,
                    employeeid: user?.employeeid,
                    isScan: true,
                    target: '70,50',
                    ...(isPinUsed ? { pin } : {}),
               }));

               if (response?.status === 'success' && response.statusCode === 200) {
                    setEnteredResult(true);
                    setRequiresRevalidation(response.requires_revalidation === true);
                    toast.success(response.message, { autoClose: 3000 });
               } else {
                    toast.error(response?.message || 'Unable to save ultrasound result', { autoClose: 3000 });
                    if (response?.statusCode === 500 && response.message === 'Edit window period has elapsed, you can no longer edit this result') {
                         if (window.confirm('Your edit window has elapsed. Do you want to request access to edit this result?')) {
                              window.open(`/operations/imaging/ultrasound/access-request?ascensionid=${ascensionid}${patientid ? `&patientid=${generateRandomTextAndNumbers(50) + patientid}` : ''}`, '_blank');
                         }
                    }
               }
          } catch (error) {
               console.error(error);
               toast.error('An error occurred. Please try again.');
          } finally {
               saveSession.current!.finish();
               setSubmitting(false);
          }
     };

     const handleSaveClinicalHistory = async () => {
          if(loadedResultKey!==resultKey||hydrationError)return;
          if (!clinicalHistory.trim() || clinicalHistory.trim().length < 5) {
               toast.error('Please enter at least 5 characters for clinical history');
               return;
          }
          const response = await customPost('ultrasound/chx', 'POST', { ascensionid, clinical_history: clinicalHistory, employeeid: user?.employeeid });
          return response?.status ? toast.success(response.message) : toast.error(response?.message || 'Unable to save clinical history');
     };

     if (isLoading) return <Loader />;
     if(hydrationError)return <div className="alert alert-danger" role="alert"><p>{hydrationError}</p><button className="btn btn-outline-danger" onClick={()=>setHydrationRevision(value=>value+1)}>Retry loading report</button></div>;

     return (
          <div>
               {templateUndo&&<button type="button" className="btn btn-outline-secondary mb-3" disabled={submitting||isTemplateLoading} onClick={()=>{templateGeneration.current++;setFields(templateUndo.fields);setImpression(templateUndo.impression);setSelectedTemplate(templateUndo.template);setTemplateUndo(null);}}>Undo template replacement</button>}
               <PreviewPatientInformation patientid={patientid} compact />
               <div className="mt-3 card">
                    <div className="card-header bg-body d-flex flex-wrap align-items-center justify-content-between gap-3">
                         <div>
                              <div className="fw-semibold text-uppercase">{testname || scan || 'Ultrasound'}</div>
                              <div className="small text-muted">Ascension: {ascensionid || 'N/A'} · Test ID: {testid || 'N/A'} · Billing ID: {billingid || 'N/A'}</div>
                         </div>
                         <div className="d-flex flex-wrap gap-2 align-items-center">
                              {entered && <button className="btn btn-sm btn-outline-primary" onClick={() => setShowResultValidation(true)}>Review / validate current result</button>}
                              {entered && testid && patientid && billingid && ascensionid && <ImagingResultActions
                                   key={`${billingid}:${ascensionid}`}
                                   item={{ testid, patientid, billingid, ascensionid, name: testname || scan || 'Ultrasound' }} />}
                              <span className={`badge ${entered ? 'bg-success' : 'bg-secondary'}`}>{requiresRevalidation ? 'Changed - revalidation required' : entered ? 'Saved' : 'Draft'}</span>
                         </div>
                    </div>
                    <div className="card-body">
                         <nav className="nav nav-tabs mb-4" aria-label="Ultrasound result sections">
                              {[
                                   { key: 'result', label: 'Result Entry', icon: <RiFileTextLine /> },
                                   { key: 'clinical', label: 'Clinical History', icon: <RiFileList2Line /> },
                                   { key: 'images', label: 'Image Upload', icon: <RiImageLine /> },
                                   { key: 'access', label: 'Access Request', icon: <RiFileTextLine /> },
                                   { key: 'access-history', label: 'Access History', icon: <RiHistoryLine /> },
                              ].map((section) => (
                                   <button
                                        key={section.key}
                                        type="button"
                                        className={`nav-link d-inline-flex align-items-center gap-2 ${activeSection === section.key ? 'active' : ''}`}
                                        aria-current={activeSection === section.key ? 'page' : undefined}
                                        onClick={() => setActiveSection(section.key as typeof activeSection)}
                                   >
                                        {section.icon}{section.label}
                                   </button>
                              ))}
                         </nav>

                         {activeSection === 'clinical' ? (
                              <div className="border rounded-1 p-3">
                                   <label className="form-label fw-semibold" htmlFor="ultrasound-clinical-history">Clinical History</label>
                                   <textarea id="ultrasound-clinical-history" className="form-control" rows={8} value={clinicalHistory} onChange={(event) => setClinicalHistory(event.target.value)} placeholder="Enter clinical history here" />
                                   <div className="d-flex justify-content-end mt-3">
                                        <button onClick={handleSaveClinicalHistory} className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Saving...' : 'Save Clinical History'}</button>
                                   </div>
                              </div>
                         ) : activeSection === 'images' ? (
                              <ImageUploadTab ascensionid={ascensionid} testid={testid} patientid={patientid} />
                         ) : activeSection === 'access' ? (
                              <AccessRequestForm ascensionid={ascensionid as string} testid={testid as string} patientid={patientid as string} employeeid={employeeid} />
                         ) : activeSection === 'access-history' ? (
                              <AccessHistoryTab employeeid={employeeid} ascensionid={ascensionid} shouldLoad={activeSection === 'access-history'} />
                         ) : (
                              <>
                                   <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
                                        <div>
                                             <h2 className="h6 mb-1">Ultrasound result entry</h2>
                                             <p className="small text-muted mb-0">Use the existing full-width report editor (structured forms were removed).</p>
                                        </div>
                                   </div>

                                   {
                                        <section className="w-100">
                                             <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
                                                  <div className="flex-grow-1" style={{ minWidth: 280, maxWidth: 620 }}>
                                                       <label className="form-label fw-semibold" htmlFor="ultrasound-profile">Existing report template</label>
                                                       <Select inputId="ultrasound-profile" options={templateOptions} onChange={handleTemplateChange} styles={reactSelectCustomStyles} placeholder="Select an existing template" value={selectedTemplate || ''} isClearable isDisabled={isTemplateLoading} />
                                                  </div>
                                                  <div className="d-flex align-items-center gap-3">
                                                       <label className="form-check d-flex align-items-center gap-2 mb-0">
                                                            <input type="checkbox" className="form-check-input mt-0" checked={viewAllTemplates} onChange={(event) => setViewAllTemplates(event.target.checked)} />
                                                            <span className="small">View all templates</span>
                                                       </label>
                                                       <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fetchTemplates} disabled={isTemplateLoading}>Refresh</button>
                                                  </div>
                                             </div>
                                             {isTemplateLoading && <div className="small text-muted mb-3">Loading template fields…</div>}
                                             {fields.length > 0 ? fields.map((field, index) => (
                                                  <div className="mb-4 w-100" key={`${field.fieldid || field.name}-${index}`}>
                                                       <label className="form-label fw-semibold">{field.name}</label>
                                                       <div className="w-100"><MARKDOWN_EDITOR updatedata={(_event, value) => handleFieldChange(value, index)} initialData={field.value || ''} /></div>
                                                  </div>
                                             )) : (
                                                  <div className="mb-4 w-100">
                                                       <label className="form-label fw-semibold">Report</label>
                                                       <MARKDOWN_EDITOR updatedata={handleImpressionChange} initialData={impression} />
                                                  </div>
                                             )}
                                             {/* Clinical Notes / Impression editor removed per request */}
                                        </section>
                                   }

                                   <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mt-4 pt-3 border-top">
                                        {isPinUsed && (
                                             <div style={{ width: 260, maxWidth: '100%' }}>
                                                  <label className="form-label fw-semibold" htmlFor="ultrasound-result-pin">Authorization PIN</label>
                                                  <input id="ultrasound-result-pin" className="form-control" type="password" placeholder="Enter PIN" value={pin} autoComplete="off" autoCorrect="off" onChange={(event) => setPin(event.target.value)} />
                                             </div>
                                        )}
                                        <div className="d-flex flex-wrap gap-2 ms-auto">
                                             <button type="button" onClick={handleResult} className="btn btn-primary" disabled={submitting || isTemplateLoading || loadedResultKey!==resultKey}>{submitting ? 'Saving…' : 'Save Result'}</button>
                                             <button type="button" className="btn btn-outline-primary" onClick={() => {
                                                  const billing_id = `${generateRandomTextAndNumbers(70)}${billingid}`;
                                                  const patientid_id = `${generateRandomTextAndNumbers(50)}${patientid}`;
                                                  window.open(`/result/labreport/4?isScan=true&&csvid=${billing_id}&&ptid=${patientid_id}&&target=70,50&&ascensionId=${ascensionid}&&testname=${testname}&&testid=${testid}&&isUltrasound=true&&isMultiple=false&&password&&is_password_encrypted=false&isOpenSideBarShow=false`, '_blank');
                                             }}>Print Report</button>
                                        </div>
                                   </div>
                              </>
                         )}
                    </div>
               </div>
               {showResultValidation && <ResultValidationModal show={showResultValidation} isBulk={false} selectedAscension={{ id: Number(testid), testid: Number(testid), ascensionid: Number(ascensionid), billingid: Number(billingid), patientid: Number(patientid), test: scan, name: testname }} onClose={() => setShowResultValidation(false)} />}
          </div>
     );
}
