'use client';
import {useEffect,useState} from 'react';
import {customFetch} from '../Auth/customFetch';
import {useApplication} from '../Auth/useApplicationContext';
const escapeHtml=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export default function LabCashierHandoff({code}:{code:string}) {
    const app=useApplication();const [ticket,setTicket]=useState<any>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
    useEffect(()=>{let active=true;setError('');setTicket(null);customFetch(`billing/lab-counter/lookup?code=${encodeURIComponent(code)}`).then((r:any)=>{if(!r?.status)throw Error(r?.message||'Unable to load payment slip');if(active)setTicket(r.data)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[code,attempt]);
    const print=()=>{
        if(!ticket)return;const page=window.open('','_blank','width=420,height=650');if(!page){setError('Allow popups to print the payment slip.');return;}
        page.document.write(`<!doctype html><html><head><title>Cashier code ${escapeHtml(code)}</title><style>@page{size:80mm auto;margin:3mm}body{font:13px Arial,sans-serif;width:72mm;margin:0 auto;color:#111}h1{font-size:17px;text-align:center}h2{text-align:center;font-size:32px;letter-spacing:5px;margin:12px 0}p{margin:6px 0}.row{display:flex;justify-content:space-between;gap:12px}hr{border:0;border-top:1px dashed #777}</style></head><body><h1>${escapeHtml(app?.company||'Laboratory')}</h1><p style="text-align:center">PAY AT CASHIER</p><h2>${escapeHtml(code)}</h2><div class="row"><span>Bill</span><strong>#${escapeHtml(ticket.billingid)}</strong></div><p>${escapeHtml(ticket.patientName||'Patient #'+ticket.patientid)}</p><hr><div class="row"><span>Outstanding</span><strong>GHS ${Number(ticket.outstanding).toFixed(2)}</strong></div><hr><p>Present this code to the cashier for payment and your receipt.</p><p style="text-align:center">This is not a payment receipt.</p></body></html>`);
        page.document.close();page.focus();page.print();
    };
    return <section className="border rounded p-3 mb-3" aria-label="Cashier payment code"><div className="d-flex justify-content-between align-items-center flex-wrap gap-3"><div><span className="text-muted">Cashier code</span><h2 style={{letterSpacing:4,margin:'4px 0'}}>{code}</h2><p className="mb-0">Give this code to the patient to pay at the cashier.</p></div><button type="button" className="btn btn-outline-secondary" disabled={!ticket} onClick={print}>Print payment slip</button></div>{ticket&&<p className="text-muted mt-2 mb-0">{ticket.patientName} · Bill #{ticket.billingid} · Outstanding: GHS {Number(ticket.outstanding).toFixed(2)}</p>}{error&&<p className="text-danger mt-2" role="alert">{error} <button type="button" className="btn btn-link btn-sm" onClick={()=>setAttempt(x=>x+1)}>Retry</button></p>}</section>;
}
