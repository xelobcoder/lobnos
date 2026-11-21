"use client";
import {useEffect,useRef,useState} from 'react';
import {customFetch} from '../Auth/customFetch';
export type CollectionConsentState={blocked:boolean;payload?:any};
export default function CollectionConsent({billingid,active,onReady}:{billingid:number;active:boolean;onReady:(state:CollectionConsentState)=>void}){
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[confirmed,setConfirmed]=useState(false),[role,setRole]=useState('patient'),[guardian,setGuardian]=useState(''),[relationship,setRelationship]=useState('Parent / guardian');const key=useRef('');
 useEffect(()=>{if(!active)return;let current=true;onReady({blocked:true});setData(null);setError('');setLoading(true);setConfirmed(false);setRole('patient');setGuardian('');key.current=crypto.randomUUID();customFetch(`patient-consents/collection?billingid=${billingid}`).then(r=>{if(!r?.success)throw new Error(r?.message||'Unable to check consent');if(current){setData(r.data);setRole(r.data.isMinor?'guardian':'patient');setGuardian(r.data.guardianName||'');}}).catch(e=>{if(current)setError(e.message);}).finally(()=>{if(current)setLoading(false);});return()=>{current=false;};},[billingid,active]);
 useEffect(()=>{const blocked=loading||!!error||!!data?.needsConfiguration||(data?.mode==='required'&&!data?.canProceed&&!confirmed)||(confirmed&&role==='guardian'&&!guardian.trim());onReady({blocked,payload:confirmed?{patientid:data?.patientid,billingid,confirmed:true,signer_role:role,guardian_name:guardian.trim(),relationship,capture_key:key.current,template_ids:data?.templates?.map((t:any)=>t.id)||[]}:undefined});},[loading,error,data,confirmed,role,guardian,relationship,onReady]);
 if(!active||data?.mode==='off')return null;
 return <section className="border rounded bg-body-tertiary p-3 mb-3" aria-label="Collection consent">
 <div className="d-flex align-items-center justify-content-between"><strong>Consent at collection</strong><small>{data?.mode==='required'?'Required':'Optional'}</small></div>
 {loading?<p role="status" className="mb-0">Checking consent...</p>:error?<p role="alert" className="text-danger mb-0">{error}</p>:<>
 {data.needsConfiguration?<p role="alert" className="text-danger mb-0">Publish required consent wording in the facility settings before collection.</p>:!data.templates.length?<p className="small text-muted mb-0">No consent wording is configured. Collection is optional for this facility.</p>:<>
 {data.canProceed&&data.mode==='required'?<p className="text-success small mb-0">Required consent is already on file.</p>:<>
 <div className="d-flex flex-wrap gap-2 mt-2 align-items-center"><label>Confirming with<select aria-label="Consent signer" className="form-select form-select-sm" value={role} onChange={e=>{setRole(e.target.value);setConfirmed(false);key.current=crypto.randomUUID();}}><option value="patient">Patient — {data.patientName}</option><option value="guardian">Parent / guardian</option></select></label>{role==='guardian'&&<><label>Guardian’s name<input aria-label="Collection guardian name" className="form-control form-control-sm" value={guardian} onChange={e=>{setGuardian(e.target.value);setConfirmed(false);key.current=crypto.randomUUID();}}/></label><label>Relationship<select className="form-select form-select-sm" value={relationship} onChange={e=>{setRelationship(e.target.value);setConfirmed(false);}}>{['Parent / guardian','Mother','Father','Guardian','Carer'].map(item=><option key={item}>{item}</option>)}</select></label></>}</div>
 <label className="d-flex gap-2 mt-3 align-items-start"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} aria-label="Verbal consent confirmed"/><span>I checked the patient or guardian’s identity and confirmed their verbal agreement to the consent wording. Record this with collection.</span></label>
 </>}
 <details className="mt-2"><summary className="small">View consent wording ({data.templates.length})</summary>{data.templates.map((form:any)=><article key={form.id} className="small border-top pt-2 mt-2"><strong>{form.title} · v{form.version}</strong><p style={{whiteSpace:'pre-wrap'}}>{form.body}</p></article>)}</details>
 </>}
 <a className="small d-inline-block mt-2" href={`/crm/registration/${data.patientid}/consent`} target="_blank" rel="noreferrer">History, refusal or withdrawal</a>
 </>}
 </section>;
}
