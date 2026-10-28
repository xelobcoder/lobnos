"use client";
import React,{useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import PatientFiltered from '../../../../components/accessories/SectorFileringComponents/CustomerFiltering';
import ClinicianFiltering from '../../../../components/accessories/SectorFileringComponents/ClinicianFiltering';
import OrganizationFiltering from '../../../../components/accessories/SectorFileringComponents/OrganizationFiltering';
import {customFetch,customPost} from '../../../../components/Auth/customFetch';
import {useApplication} from '../../../../components/Auth/useApplicationContext';
import {smsCapabilities,smsError} from '../../../../lib/sms';
import styles from '../SmsWorkspace.module.css';
type Recipient={id:number;name:string;phone:string};
type Review={fingerprint:string;recipientCount:number;excluded:number;duplicates:number;segmentCount:number;sample:Array<{phone:string;message:string;segments:number;encoding:string}>};
export default function SmsJobPage(){
 const {user}=useApplication();const allowed=smsCapabilities(user?.role);
 const [category,setCategory]=useState('patient'),[scope,setScope]=useState('single'),[mode,setMode]=useState('custom');
 const [body,setBody]=useState(''),[template,setTemplate]=useState(''),[templates,setTemplates]=useState<any[]>([]),[templateError,setTemplateError]=useState('');
 const [recipients,setRecipients]=useState<Recipient[]>([]),[sendType,setSendType]=useState('immediate'),[scheduledAt,setScheduledAt]=useState('');
 const [review,setReview]=useState<Review|null>(null),[acknowledged,setAcknowledged]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[created,setCreated]=useState<number|null>(null),[showAll,setShowAll]=useState(false);
 const requestKey=useRef(''),revision=useRef(0),submission=useRef(false);
 function invalidate(){revision.current++;setReview(null);setAcknowledged(false);setError('');setCreated(null);}
 async function loadTemplates(){try{setTemplateError('');const rows=await customFetch('prime/sms-templates');if(!Array.isArray(rows))throw new Error('Unable to load templates');setTemplates(rows);}catch{setTemplateError('Templates are unavailable. Retry, or write a custom message.');}}
 useEffect(()=>{if(allowed.read)void loadTemplates();},[allowed.read]);
 function select(value:any){const rows=Array.isArray(value)?value:value?[value]:[];const mapped=rows.map(row=>({id:Number(row.patientid??row.id),name:row.name||row.fullname||[row.firstname,row.middlename,row.lastname].filter(Boolean).join(' '),phone:String(row.phone??row.mobile??row.mobile_number??row.telephone??'')})).filter(row=>Number.isSafeInteger(row.id)&&row.id>0);invalidate();setRecipients(previous=>scope==='single'?mapped.slice(0,1):[...new Map([...previous,...mapped].map(row=>[row.id,row])).values()]);}
 function payload(){return {category,recipientScope:scope,sendType,...(mode==='template'?{templateId:Number(template)}:{customBody:body}),...(scope==='all'?{}:{targetIds:recipients.map(row=>({id:row.id,phone:row.phone}))}),...(sendType==='scheduled'?{scheduledAt:new Date(scheduledAt).toISOString()}:{}),createdBy:user?.employeeid};}
 async function reviewCampaign(event:React.FormEvent){event.preventDefault();if(submission.current)return;submission.current=true;setBusy('review');setError('');const version=revision.current;
  try{if(scope!=='all'&&!recipients.length)throw new Error('Select at least one recipient.');if(mode==='template'&&!template)throw new Error('Choose a template.');if(sendType==='scheduled'&&(!scheduledAt||new Date(scheduledAt).getTime()<=Date.now()))throw new Error('Choose a future date and time.');const result=await customPost('prime/sms-jobs/preview','POST',payload());if(!result?.fingerprint)throw new Error(smsError(result,'Unable to review this campaign'));if(version===revision.current){setReview(result);setAcknowledged(false);}}
  catch(e){setError(smsError(e,'Unable to review this campaign.'));}finally{submission.current=false;setBusy('');}
 }
 async function queueCampaign(){if(submission.current||!review||!acknowledged)return;submission.current=true;setBusy('save');setError('');if(!requestKey.current)requestKey.current=crypto.randomUUID();
  try{const result=await customPost('prime/sms-jobs','POST',{...payload(),requestKey:requestKey.current,reviewFingerprint:review.fingerprint});if(!Number.isSafeInteger(Number(result?.jobId))||Number(result.jobId)<=0)throw new Error(smsError(result,'Campaign creation could not be confirmed. Retry this request before changing it.'));setCreated(Number(result.jobId));setReview(null);setRecipients([]);setBody('');setTemplate('');setAcknowledged(false);requestKey.current='';}
  catch(e){setError(smsError(e,'Creation could not be confirmed. Retry this request before editing it.'));}finally{submission.current=false;setBusy('');}
 }
 if(!allowed.send)return <div role="alert" className="alert alert-info">You do not have permission to create SMS campaigns.</div>;
 const selectedTemplate=templates.find(row=>String(row.templateid)===template),display=showAll?recipients:recipients.slice(0,8);
 return <div>
  <header className={styles.pageHeader}><div><h2>Compose SMS campaign</h2><p>Choose recipients, prepare the message, then review before sending.</p></div><Link className="btn btn-outline-secondary" href="/communications/sms/jobs/list">Campaign history</Link></header>
  {error&&<div role="alert" className="alert alert-danger">{error}</div>}
  {created&&<div role="status" className="alert alert-success">Campaign #{created} saved. {sendType==='scheduled'?'It will be processed at the scheduled time.':'It is queued for processing.'} <Link href={`/communications/sms/jobs/recipients/${created}`}>View progress</Link></div>}
  <div className={styles.composerGrid}><form onSubmit={reviewCampaign}>
   <fieldset disabled={!!busy}>
    <section className={styles.section}><h3>1. Recipients</h3><div className="row g-3">
     <label className="col-sm-6 form-label">Recipient category<select aria-label="Recipient category" className="form-select mt-1" value={category} onChange={e=>{invalidate();setCategory(e.target.value);setRecipients([]);setTemplate('');}}><option value="patient">Patients</option><option value="clinician">Practitioners</option><option value="organization">Organizations</option></select></label>
     <label className="col-sm-6 form-label">Audience<select aria-label="Audience" className="form-select mt-1" value={scope} onChange={e=>{invalidate();setScope(e.target.value);setRecipients([]);}}><option value="single">One recipient</option><option value="multiple">Selected recipients</option><option value="all">All in this category</option></select></label>
    </div>
    {scope==='all'?<p className="mb-0 text-muted">The review will show the valid audience count and exclude invalid or duplicate contact numbers.</p>:<div className="mt-2" key={category+scope}>{category==='patient'?<PatientFiltered getSelectedPatient={select} isDisabled={!!busy}/>:category==='clinician'?<ClinicianFiltering onSelect={select} isBulk={scope==='multiple'} isDisabled={!!busy}/>:<OrganizationFiltering onSelect={select} showbulk={scope==='multiple'}/>}</div>}
    {!!recipients.length&&<div className="mt-3"><div className="d-flex justify-content-between"><strong>{recipients.length} selected</strong><button type="button" className="btn btn-sm btn-link text-danger" onClick={()=>{invalidate();setRecipients([]);}}>Clear selection</button></div><ul className={styles.recipientList}>{display.map(row=><li key={row.id}><span><strong>{row.name||`Recipient #${row.id}`}</strong><small>{row.phone||'Contact number will be checked'}</small></span><button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Remove ${row.name}`} onClick={()=>{invalidate();setRecipients(old=>old.filter(item=>item.id!==row.id));}}>Remove</button></li>)}</ul>{recipients.length>8&&<button type="button" className="btn btn-sm btn-link" onClick={()=>setShowAll(!showAll)}>{showAll?'Show fewer':`Show all ${recipients.length}`}</button>}</div>}
    </section>
    <section className={styles.section}><h3>2. Message & timing</h3>
     <label className="form-label w-100">Message source<select aria-label="Message source" className="form-select mt-1" value={mode} onChange={e=>{invalidate();setMode(e.target.value);}}><option value="custom">Write a message</option><option value="template">Use a saved template</option></select></label>
     {templateError&&<div role="alert" className="alert alert-warning">{templateError}<button type="button" className="btn btn-sm btn-outline-secondary ms-2" onClick={loadTemplates}>Retry templates</button></div>}
     {mode==='template'?<label className="form-label w-100">Template<select aria-label="Template" className="form-select mt-1" required value={template} onChange={e=>{invalidate();setTemplate(e.target.value);}}><option value="">Choose a template</option>{templates.filter(row=>row.category===category).map(row=><option key={row.templateid} value={row.templateid}>{row.name}</option>)}</select></label>:<label className="form-label w-100">Message<textarea aria-label="Message" className="form-control mt-1" rows={5} required maxLength={5000} value={body} onChange={e=>{invalidate();setBody(e.target.value);}}/><small className="text-muted">{body.length} characters. SMS segments are calculated in the review.</small></label>}
     <div className="row g-3 mt-1"><label className="col-sm-6 form-label">Delivery time<select aria-label="Delivery time" className="form-select mt-1" value={sendType} onChange={e=>{invalidate();setSendType(e.target.value);}}><option value="immediate">Send when queued</option><option value="scheduled">Schedule for later</option></select></label>{sendType==='scheduled'&&<label className="col-sm-6 form-label">Date & time<input aria-label="Date and time" type="datetime-local" className="form-control mt-1" required value={scheduledAt} onChange={e=>{invalidate();setScheduledAt(e.target.value);}}/><small className="text-muted">{Intl.DateTimeFormat().resolvedOptions().timeZone}</small></label>}</div>
    </section>
    <button className="btn btn-primary" type="submit">{busy==='review'?'Preparing review…':'Review campaign'}</button>
   </fieldset>
  </form>
  <aside className={styles.reviewPanel} aria-label="Campaign review"><h3>3. Review & confirm</h3>{review?<>
   <dl className={styles.reviewNumbers}><div><dt>Valid recipients</dt><dd>{review.recipientCount}</dd></div><div><dt>Total SMS segments</dt><dd>{review.segmentCount}</dd></div><div><dt>Invalid contacts excluded</dt><dd>{review.excluded}</dd></div><div><dt>Duplicate contacts excluded</dt><dd>{review.duplicates}</dd></div></dl>
   <p className="small text-muted">{sendType==='scheduled'?`Scheduled: ${new Date(scheduledAt).toLocaleString()}`:'Queued for immediate processing after confirmation.'}</p>
   {review.sample.map((sample,index)=><div key={index} className={styles.messagePreview}><small>{sample.phone} · {sample.encoding} · {sample.segments} segment(s)</small><p>{sample.message}</p></div>)}
   <label className="d-flex gap-2 align-items-start my-3"><input className="form-check-input" type="checkbox" checked={acknowledged} disabled={!!busy} onChange={e=>setAcknowledged(e.target.checked)}/><span>I have reviewed the audience and message.</span></label>
   <button type="button" className="btn btn-primary w-100" disabled={!!busy||!acknowledged||!review.recipientCount} onClick={queueCampaign}>{busy==='save'?'Saving campaign…':sendType==='scheduled'?'Confirm schedule':'Confirm & queue SMS'}</button>
  </>:<><p className="text-muted">Review the campaign to see valid recipients, personalized messages and the number of SMS segments.</p>{(body||selectedTemplate?.body)&&<div className={styles.messagePreview}><small>Draft preview</small><p>{mode==='custom'?body:selectedTemplate?.body}</p></div>}</>}
  </aside></div>
 </div>;
}
