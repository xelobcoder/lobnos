'use client';
import React,{useContext} from 'react';
import {MultiBillingContext} from '../Multi/MultiBillingContext';
import OrganizationSearch from '../BillingContextComponents/BillingSourceComponents/OrganizationBillingSearch';
import InsuranceSearch from '../../accessories/SectorFileringComponents/InsuranceOrganizationFiltering';
import ClinicianSearch from '../../accessories/SectorFileringComponents/ClinicianFiltering';
import ClinicianReferralOrganizations from '../Multi/ClinicianReferralOrganizations';
import MultiPACKAGESELECT from '../Multi/MultiPACKAGESELECT';
import {urgencyOptions} from '../../../lib/billingLib';
import styles from './ModernWorkflow.module.css';
type Props={onOrganization:(value:any)=>void;onInsurance:(value:any)=>void;onClinician:(value:any)=>void};
export default function ModernPayerSetup({onOrganization,onInsurance,onClinician}:Props){
 const context=useContext(MultiBillingContext);if(!context)throw Error('Billing context required');const {billingdata:data,setBillingData}=context;
 const source=Number(data.billingSource);
 const referrer=(kind:'clinician'|'organization',value:any)=>setBillingData(previous=>({...previous,...(kind==='clinician'?{clinicianId:value?.id||null,clinicianname:value?.name||null}:{organizationId:value?.id||null,organizationname:value?.name||null})}));
 return <div className={styles.payerGrid}>
  <section className={styles.payerCard}><h3>Paying account</h3><p className={styles.helper}>Confirm the account or membership responsible for this bill.</p>
   {source===1&&<div className={styles.payerSummary}><strong>General / private patient</strong><p>The patient is responsible for the bill.</p></div>}
   {source===2&&<div className={styles.lookupField}><span>Organization</span><OrganizationSearch updatefunction={onOrganization}/>{data.entityname&&<p className={styles.chosenAccount}>Selected: <strong>{data.entityname}</strong></p>}</div>}
   {source===3&&<div className={styles.lookupField}><span>Insurance provider</span><InsuranceSearch onSelect={onInsurance}/>{data.entityname&&<p className={styles.chosenAccount}>Selected: <strong>{data.entityname}</strong></p>}</div>}
   {source===6&&<div className={styles.lookupField}><span>Clinician billing account</span><ClinicianSearch isAutoLoadAll isBulk onSelect={onClinician}/>{data.entityname&&<p className={styles.chosenAccount}>Selected: <strong>{data.entityname}</strong></p>}</div>}
   {source===4&&<div className={styles.formColumns}><label>NHIS membership number<input inputMode="numeric" type="number" min="1" value={data.nhismembershipid||''} onChange={event=>setBillingData(previous=>({...previous,nhismembershipid:Number(event.target.value)||undefined}))}/></label><label>Claim check code<input inputMode="numeric" type="number" min="1" value={data.claimscheckcode||''} onChange={event=>setBillingData(previous=>({...previous,claimscheckcode:Number(event.target.value)||undefined}))}/></label></div>}
   <label className={styles.urgencyField}>Urgency<select value={data.status||''} onChange={event=>setBillingData(previous=>({...previous,status:event.target.value}))}>{urgencyOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
  </section>
  <section className={styles.payerCard}><h3>Referral details <span className={styles.optional}>Optional</span></h3><p className={styles.helper}>Record who referred the patient. This does not change the paying account.</p>
   <div className={styles.formColumns}><div className={styles.lookupField}><span>Referring organization</span>{data.organizationId?<div className={styles.chosenAccount}><strong>{data.organizationname}</strong><button type="button" className={styles.backLink} onClick={()=>referrer('organization',null)}>Change</button></div>:<OrganizationSearch updatefunction={(value:any)=>referrer('organization',value)}/>}</div><div className={styles.lookupField}><span>Referring clinician</span>{data.clinicianId?<div className={styles.chosenAccount}><strong>{data.clinicianname}</strong><button type="button" className={styles.backLink} onClick={()=>referrer('clinician',null)}>Change</button></div>:<ClinicianSearch isAutoLoadAll isBulk onSelect={(value:any)=>referrer('clinician',value)}/>}</div></div>
   {data.clinicianId&&<ClinicianReferralOrganizations clinicianId={Number(data.clinicianId)} clinicianName={data.clinicianname||'Selected clinician'} selectedOrganization={data.organizationId?{id:Number(data.organizationId),name:data.organizationname||'Selected organization'}:null} onSelectOrganization={(value:any)=>referrer('organization',value)}/>}
  </section>
  {data.isPackageUsed&&<section className={styles.payerCard}><h3>Test package</h3><MultiPACKAGESELECT/></section>}
  {data.isAdjustment&&data.adjustmentReason&&<section className={styles.payerCard}><h3>Adjustment reason</h3><p>{data.adjustmentReason}</p></section>}
 </div>;
}
