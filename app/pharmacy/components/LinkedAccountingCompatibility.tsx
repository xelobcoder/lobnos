'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';
import { decodeSettings, errorMessage, record } from '../../../lib/pharmacyAccounting';
import { usePharmacyAccess } from './PharmacyWorkspace';

type Mode = 'loading' | 'enabled' | 'legacy' | 'unavailable' | 'not-finance';
export interface LinkedAccountingPolicy { mode: Mode; error: string; refresh: () => void }
export function isLegacyAccountingPost(endpoint: string): boolean {
  return ['pharmacy/management/journals','pharmacy/management/expenses','pharmacy/management/supplier-payments'].includes(endpoint);
}
/** Non-finance users retain collections/credit access without querying protected settings. */
export function useLinkedAccounting(): LinkedAccountingPolicy {
  const {finance,app}=usePharmacyAccess();
  const user=record(record(app).user);
  const scope=JSON.stringify([user.tenantId,record(app).tenantId,user.branch,user.employeeid,user.role]);
  const [revision,setRevision]=useState(0),[state,setState]=useState<{scope:string;mode:Mode;error:string}>({scope:'',mode:'loading',error:''});
  useEffect(()=>{
    if(!finance)return;
    let active=true;
    setState({scope,mode:'loading',error:''});
    async function check() {
      try{
        const response:unknown=await customFetch('pharmacy/accounting/settings'),envelope=record(response);
        if(envelope.success!==true)throw Error(errorMessage(response));
        const settings=decodeSettings(envelope.data);
        if(active)setState({scope,mode:settings.enabled?'enabled':'legacy',error:''});
      }catch(e){if(active)setState({scope,mode:'unavailable',error:e instanceof Error?e.message:'Accounting configuration could not be verified.'});}
    }
    void check();
    return ()=>{active=false;};
  },[finance,scope,revision]);
  return {mode:!finance?'not-finance':state.scope===scope?state.mode:'loading',error:state.scope===scope?state.error:'',refresh:()=>setRevision(value=>value+1)};
}
export function LinkedAccountingNotice({policy}:{policy:LinkedAccountingPolicy}) {
  if(policy.mode==='legacy'||policy.mode==='not-finance')return null;
  const links:ReactNode=<div className="d-flex flex-wrap gap-2 mt-2"><Link className="btn btn-outline-primary" href="/pharmacy/accounting/journals">Controlled journals</Link><Link className="btn btn-outline-primary" href="/pharmacy/accounting/expenses">Approved expenses</Link><Link className="btn btn-outline-primary" href="/pharmacy/accounting/payables">Allocated supplier settlements</Link></div>;
  return <section className={`alert ${policy.mode==='enabled'?'alert-info':'alert-warning'}`} role={policy.mode==='unavailable'?'alert':'status'}>
    {policy.mode==='enabled'?<><strong>Linked Pharmacy Accounting is enabled.</strong> Immediate legacy journal, expense and supplier-payment posting is disabled. Use the controlled workflows below.</>:policy.mode==='loading'?'Checking linked accounting configuration. Immediate legacy posting stays disabled until disabled accounting is confirmed.':<>Accounting configuration could not be verified: {policy.error}. Immediate legacy posting remains disabled; do not assume legacy mode.<button type="button" className="btn btn-link" onClick={policy.refresh}>Retry configuration check</button></>}
    {links}<p className="mb-0 mt-2">Financial days, cashier shifts, customer collections and payment routing remain available here.</p>
  </section>;
}
