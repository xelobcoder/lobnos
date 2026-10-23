'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';

type Account={id:number;name:string;can_reconcile:boolean|number};
type Report={todaySales:number;completedSales:number;paymentTotals:Record<string,number>;collections:Array<{amount:number|string}>;refunds:Array<{amount:number|string}>;sales:Array<{id:string;receiptNumber:string;customerName:string;total:number;status:string}>;reconciliations:Array<{id:number;payment_account_id:number;expected_amount:number;counted_amount:number;difference:number;recorded_at:string}>};
const currency=new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'});
export default function PharmacyCashierPage(){
     const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10)),[report,setReport]=useState<Report|null>(null),[accounts,setAccounts]=useState<Account[]>([]);
     const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[saving,setSaving]=useState(false);
     const [accountId,setAccountId]=useState(''),[counted,setCounted]=useState(''),[notes,setNotes]=useState('');
     const load=useCallback(async()=>{
          setLoading(true);setError('');
          try{const [response,accountResponse]=await Promise.all([customFetch('pharmacy/cashier?date='+date),customFetch('pharmacy/collection-accounts')]);
               if(!response?.success)throw new Error(response?.error?.message||'Unable to load cashier report');setReport(response.data);if(accountResponse?.success)setAccounts(accountResponse.data||[]);
          }catch(error){setReport(null);setError(error instanceof Error?error.message:'Unable to load cashier report');}finally{setLoading(false);}
     },[date]);
     useEffect(()=>{load();},[load]);
     const reconcile=async(event:FormEvent)=>{
          event.preventDefault();if(saving)return;setSaving(true);setError('');setNotice('');
          try{const response=await customFetchMutation('pharmacy/cashier/reconcile','POST',{date,paymentAccountId:Number(accountId),countedAmount:Number(counted),notes});if(!response?.success)throw new Error(response?.error?.message||'Unable to save count');setNotice('Count recorded. Difference: '+currency.format(Number(response.data.difference)));setCounted('');setNotes('');await load();}catch(error){setError(error instanceof Error?error.message:'Unable to save count');}finally{setSaving(false);}
     };
     const collectionTotal=(report?.collections||[]).reduce((sum,row)=>sum+Number(row.amount),0),refundTotal=(report?.refunds||[]).reduce((sum,row)=>sum+Number(row.amount),0);
     const reconcilable=accounts.filter(account=>!!account.can_reconcile);
     return <main className="container-fluid px-4 py-4">
          <div className="d-flex flex-wrap justify-content-between gap-3 mb-4"><div><h1 className="h3">Pharmacy cashier</h1><p className="text-muted mb-0">Your collections and refunds in the current branch, for the selected day.</p></div><Link href="/pharmacy/sell" className="btn btn-primary align-self-start">Open checkout</Link></div>
          <div className="d-flex gap-3 align-items-end mb-4"><label className="form-label mb-0">Financial date<input className="form-control" type="date" required value={date} onChange={event=>{if(event.target.value)setDate(event.target.value);}}/></label><button className="btn btn-outline-secondary" disabled={loading} onClick={load}>Refresh</button></div>
          {error&&<div className="alert alert-danger" role="alert">{error}</div>}{notice&&<div className="alert alert-success" role="status">{notice}</div>}
          {loading?<p role="status">Loading cashier activity…</p>:report&&<>
               <div className="row g-3 mb-4">{[['Collected',collectionTotal],['Refunded',refundTotal],['Net collected',report.todaySales]].map(([label,value])=><div className="col-md-4" key={String(label)}><div className="card h-100"><div className="card-body"><p className="text-muted mb-2">{label}</p><strong className="fs-4">{currency.format(Number(value))}</strong></div></div></div>)}</div>
               <section className="card mb-4"><div className="card-body"><h2 className="h5">Net collections by method</h2><p className="small text-muted">All ledger collections recorded by you, less refunds issued by you on this date. Totals include every transaction; the receipt list below shows up to 100. Historical sales without collection entries are excluded.</p><div className="row g-3">{Object.entries(report.paymentTotals).map(([method,total])=><div className="col-md-4" key={method}><span className="text-capitalize">{method.replaceAll('_',' ')}</span><strong className="d-block fs-5">{currency.format(total)}</strong></div>)}</div></div></section>
               <section className="card mb-4"><div className="card-body"><h2 className="h5">Record an account count</h2><p className="small text-muted">Record the amount attributable to your pharmacy activity in this account. This saves a count snapshot and variance; subsequent transactions remain open.</p>{reconcilable.length?<form onSubmit={reconcile}><div className="row g-3"><div className="col-md-4"><label className="form-label w-100">Account<select className="form-select" required value={accountId} onChange={event=>setAccountId(event.target.value)}><option value="">Select account</option>{reconcilable.map(account=><option key={account.id} value={account.id}>{account.name}</option>)}</select></label></div><div className="col-md-3"><label className="form-label w-100">Counted amount<input className="form-control" type="number" min="0" step="0.01" required value={counted} onChange={event=>setCounted(event.target.value)}/></label></div><div className="col-md-5"><label className="form-label w-100">Count notes<input className="form-control" required minLength={3} maxLength={500} value={notes} onChange={event=>setNotes(event.target.value)}/></label></div></div><button className="btn btn-primary mt-2" disabled={saving}>{saving?'Saving…':'Record count'}</button></form>:<p className="text-muted">Account reconciliation access is required to record a count.</p>}</div></section>
               {!!report.reconciliations.length&&<section className="card mb-4"><div className="card-body"><h2 className="h5">Recorded counts</h2><div className="table-responsive"><table className="table"><thead><tr><th>Account</th><th>Expected</th><th>Counted</th><th>Difference</th><th>Recorded</th></tr></thead><tbody>{report.reconciliations.map(row=><tr key={row.id}><td>{accounts.find(account=>account.id===row.payment_account_id)?.name||'#'+row.payment_account_id}</td><td>{currency.format(Number(row.expected_amount))}</td><td>{currency.format(Number(row.counted_amount))}</td><td>{currency.format(Number(row.difference))}</td><td>{new Date(row.recorded_at).toLocaleString()}</td></tr>)}</tbody></table></div></div></section>}
               <section className="card"><div className="card-body"><h2 className="h5">Your receipts on this date</h2><div className="table-responsive"><table className="table"><thead><tr><th>Receipt</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{report.sales.map(sale=><tr key={sale.id}><td>{sale.receiptNumber}</td><td>{sale.customerName}</td><td>{currency.format(sale.total)}</td><td>{sale.status}</td></tr>)}</tbody></table>{!report.sales.length&&<p className="text-muted">No receipts recorded by you on this date.</p>}</div></div></section>
          </>}
     </main>;
}
