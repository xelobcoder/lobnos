'use client';
import { useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';

type Account = {id:number;name:string;account_type:string};
type Pending = {endpoint:string;payload:Record<string,unknown>};
export function usePharmacyPayment(scope: string) {
     const application=useApplication();
     const user=application?.user as any;
     const storageKey=`pharmacy-checkout:${scope}:${user?.tenantId||(application as any)?.tenantId||''}:${user?.employeeid||''}:${user?.branch||''}`;
     const [accounts,setAccounts]=useState<Account[]>([]),[accountId,setAccountId]=useState(''),[reference,setReference]=useState(''),[error,setError]=useState('');
     const [pending,setPending]=useState<Pending|null>(null);
     const current=useRef<Pending|null>(null),busy=useRef(false);
     useEffect(()=>{
          try {const saved=sessionStorage.getItem(storageKey);current.current=saved?JSON.parse(saved):null;setPending(current.current);}catch{setError('Unable to restore checkout. Check sales history before starting a new payment.');}
          customFetch('pharmacy/collection-accounts').then(response=>{if(response?.success)setAccounts(response.data||[]);else setError(response?.error?.message||'Unable to load collection accounts');}).catch(()=>setError('Unable to load collection accounts'));
     },[storageKey]);
     const execute=async(endpoint:string,payload:Record<string,unknown>)=>{
          if(busy.current)throw new Error('A checkout is already running');
          busy.current=true;
          try {
               const request=current.current||{endpoint,payload:{...payload,idempotencyKey:crypto.randomUUID(),paymentAccountId:Number(accountId),paymentReference:reference.trim()}};
               // Keep the original request after a lost response, including across page reloads.
               sessionStorage.setItem(storageKey,JSON.stringify(request));current.current=request;setPending(request);
               const response=await customFetchMutation(request.endpoint,'POST',request.payload);
               if(response?.success||['SALE_REJECTED','HELD_SALE_COMPLETION_REJECTED','FULFILLMENT_REJECTED'].includes(response?.error?.code)) {
                    sessionStorage.removeItem(storageKey);current.current=null;setPending(null);
               }
               return response;
          } finally {busy.current=false;}
     };
     return {accounts,accountId,setAccountId,reference,setReference,error,pending,execute};
}
export default function PharmacyPaymentFields({payment,method,disabled=false}:{payment:ReturnType<typeof usePharmacyPayment>;method:string;disabled?:boolean}) {
     const eligible=payment.accounts.filter(account=>account.account_type===(method==='card'?'bank':method));
     return <div className="my-3">
          {payment.error&&<p className="text-danger" role="alert">{payment.error}</p>}
          {payment.pending&&<div className="alert alert-warning" role="status">A checkout is awaiting confirmation. Retry to resolve the original request before starting another sale. Its original items and payment details will be used.</div>}
          <label className="form-label">Collection account<select className="form-select" value={payment.accountId} disabled={disabled||!!payment.pending} onChange={event=>payment.setAccountId(event.target.value)} required={!payment.pending}>
               <option value="">Select an authorized account</option>{eligible.map(account=><option key={account.id} value={account.id}>{account.name}</option>)}
          </select></label>
          {!eligible.length&&<p className="small text-muted">No authorized account is available for this payment method. Ask an administrator to configure account access.</p>}
          <label className="form-label d-block">Payment reference {method==='cash'?'(optional)':''}<input className="form-control" maxLength={128} value={payment.reference} required={method!=='cash'&&!payment.pending} disabled={disabled||!!payment.pending} onChange={event=>payment.setReference(event.target.value)}/></label>
          <p className="small text-muted mb-0">Confirm the money has been received in this account before completing checkout.</p>
     </div>;
}
