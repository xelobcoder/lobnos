'use client';
import Link from 'next/link';
import { useState } from 'react';
import { accountingReference, record, rowsOf, text, type RecordData } from '../../../../lib/pharmacyAccounting';
import { useMutation, useResource } from './api';
import { DataTable, Facts, Feedback, Field, money, ReferenceText, ResourceState, styles } from './common';
import { DocumentActions } from './Documents';
import { ControlledActions } from './Subledgers';
import { downloadExpenseEvidence } from './evidenceDownload';

const today = () => new Date().toISOString().slice(0,10);
export async function evidenceFile(file: File): Promise<{ filename: string; mimeType: string; contentBase64: string }> {
  if (!file.size || file.size > 5 * 1024 * 1024) throw Error('Choose a non-empty PDF, PNG or JPEG up to 5 MiB.');
  if (!['application/pdf','image/png','image/jpeg'].includes(file.type)) throw Error('Evidence must be a PDF, PNG or JPEG. The server verifies its signature.');
  const contentBase64 = await new Promise<string>((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(Error('The evidence file could not be read.'));
    reader.readAsDataURL(file);
  });
  return { filename: file.name, mimeType: file.type, contentBase64 };
}
export function Attachments({ expenseId }: { expenseId: string }) {
  const resource=useResource<RecordData>(`expenses/${encodeURIComponent(expenseId)}/attachments`),mutation=useMutation();
  const [uploaded,setUploaded]=useState<RecordData|null>(null),[error,setError]=useState(''),[downloading,setDownloading]=useState(false);
  return <section className={styles.card}><h2>Immutable expense evidence</h2><p>Private evidence is authorized by branch and expense. Files are signature-checked PDF/PNG/JPEG, maximum 5 MiB. Malware scanning is <strong>not performed</strong>; these files are not certified safe.</p><ResourceState {...resource} retry={resource.refresh}/><Feedback error={error||mutation.error} notice={mutation.notice}/>
    {resource.data&&<DataTable rows={rowsOf(resource.data)} inlineActions actions={row=><button type="button" className="btn btn-outline-secondary" disabled={downloading} onClick={async()=>{setError('');setDownloading(true);try{await downloadExpenseEvidence(expenseId,text(row.id),text(row.filename));}catch(e){setError(e instanceof Error?e.message:'Download failed.');}finally{setDownloading(false);}}}>Download authorized evidence</button>}/>}
    <form className="mt-3 d-print-none" onSubmit={async e=>{
      e.preventDefault();setError('');const f=new FormData(e.currentTarget),file=f.get('file');
      try{if(!(file instanceof File))throw Error('Choose an evidence file.');const body=await evidenceFile(file);await mutation.mutate('evidence/uploads',body,'POST',false,data=>setUploaded(record(data)));}
      catch(e){setError(e instanceof Error?e.message:'Upload failed.');}
    }}><fieldset disabled={mutation.pending}><Field label="Select private evidence file"><input required type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="form-control"/></Field><button className="btn btn-outline-primary">{mutation.pending?'Uploading…':'Upload immutable evidence object'}</button></fieldset></form>
    {uploaded&&<section className="mt-3"><h3>Uploaded object awaiting binding</h3><Facts data={uploaded}/><p>Only your own authorized object can be bound; an upload cannot be reused across expense documents.</p><button type="button" disabled={mutation.pending} className="btn btn-primary" onClick={async()=>{if(await mutation.mutate(`expenses/${encodeURIComponent(expenseId)}/attachments`,{uploadId:uploaded.id})){setUploaded(null);resource.refresh();}}}>Bind uploaded evidence to this expense</button></section>}
  </section>;
}
export function RefundForm({ expenseId, payments, status, refresh }: { expenseId: string; payments: RecordData[]; status: string; refresh:()=>void }) {
  const mutation=useMutation(),[version,setVersion]=useState(0);
  return <section className={styles.card}><h2>Request original-payment expense refund</h2><p>Refunds require a fully settled expense and an actual original payment. Independent approval precedes receipt; money returns only to the original destination. Partial amounts are bounded by prior refund receipts.</p><Feedback {...mutation}/><form key={version} className="d-print-none" onSubmit={async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);
    if(await mutation.mutate(`expenses/${encodeURIComponent(expenseId)}/refunds`,{paymentId:f.get('paymentId'),date:f.get('date'),amount:f.get('amount'),reason:f.get('reason')})){setVersion(v=>v+1);refresh();}
  }}><fieldset disabled={mutation.pending||!['paid','partially_refunded'].includes(status)}><Field label="Original expense payment"><select required name="paymentId" className="form-select"><option value="">Select original payment evidence</option>{payments.map(p=><option key={text(p.id)} value={text(p.id)} title={`${text(p.id)} · ${text(p.reference)}`}>{accountingReference(p.id,'payment_id','payment')} · {text(p.method)} · {money(p.amount)} · {accountingReference(p.reference,'reference')}</option>)}</select></Field><Field label="Refund financial date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field><Field label="Actual refund amount"><input required type="number" min="0.01" step="0.01" name="amount" className="form-control"/></Field><Field label="Refund evidence / reason"><textarea required name="reason" className="form-control"/></Field><button className="btn btn-primary">Save draft original-payment refund</button></fieldset></form>{!['paid','partially_refunded'].includes(status)&&<p role="status">Refund creation requires a fully settled expense (or a previous partial refund). Pay or resolve the original expense first.</p>}</section>;
}
export default function ExpenseDetail({id}:{id:string}) {
  const expense=useResource<RecordData>(`expenses/${encodeURIComponent(id)}`),refunds=useResource<RecordData>(`expenses/${encodeURIComponent(id)}/refunds`);
  const refresh=()=>{expense.refresh();refunds.refresh();};
  return <><Link href="/pharmacy/accounting/expenses">← Expense register</Link><section className={styles.card}><h2>Expense <ReferenceText value={id} field="id" kind="expense"/></h2><ResourceState {...expense} retry={expense.refresh}/>{expense.data&&<><Facts data={expense.data}/><Facts data={expense.data.details}/><h3>Actual original payments</h3><DataTable rows={rowsOf(expense.data.payments)}/><h3>Posting evidence</h3><DataTable rows={rowsOf(expense.data.journals)}/><DocumentActions row={expense.data} kind="expenses" refresh={refresh}/></>}</section>{expense.data&&<><Attachments expenseId={id}/><RefundForm expenseId={id} payments={rowsOf(expense.data.payments)} status={String(expense.data.status)} refresh={refresh}/></>}<section className={styles.card}><h2>Expense refund register</h2><ResourceState {...refunds} retry={refunds.refresh}/>{refunds.data&&<DataTable rows={rowsOf(refunds.data)} actions={row=><ControlledActions row={row} kind="refund" refresh={refresh}/>}/>}</section></>;
}
