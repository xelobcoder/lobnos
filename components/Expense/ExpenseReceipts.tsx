'use client';
import { useEffect, useState } from 'react';
import { customFetch, customFetchMutation, customFile } from '../Auth/customFetch';

export async function uploadExpenseReceipts(expenseId:number, files:File[]) {
 const data=new FormData();files.forEach(file=>data.append('images',file));
 const result=await customFile(`expenses/receipt/upload?id=${expenseId}`,data);
 if(result?.status!=='success')throw new Error(result?.message||'Unable to upload receipts');
}
export function validateReceiptFiles(files:File[]) {
 if(files.length>10)return 'Select at most 10 receipts.';
 if(files.some(file=>file.size>5*1024*1024||!file.size))return 'Each receipt must be between 1 byte and 5 MB.';
 if(files.some(file=>!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type)))return 'Choose PDF, JPEG, PNG or WebP files.';
 return '';
}
export default function ExpenseReceipts({expenseId,editable=false}:{expenseId:number;editable?:boolean}) {
 const [canDelete,setCanDelete]=useState(false);
 const [names,setNames]=useState<string[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[files,setFiles]=useState<File[]>([]),[preview,setPreview]=useState<{url:string;mime:string}|null>(null);
 const load=async()=>{setLoading(true);setError('');try{const [result,actions]=await Promise.all([customFetch(`expenses/receipt/uploaded/images/list?expenseid=${expenseId}`),customFetch(`expenses/${expenseId}/next-actions`)]);setCanDelete(!!actions?.canDeleteReceipts);if(!Array.isArray(result))throw new Error(result?.message||'Unable to load receipts');setNames(result);}catch(e:any){setError(e.message);}finally{setLoading(false);}};
 useEffect(()=>{void load();},[expenseId]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview.url);},[preview]);
 const view=async(name:string)=>{setBusy(true);setError('');try{const result=await customFetch(`expenses/receipt/upload/images?imageid=${encodeURIComponent(name)}&encoding=base64`);if(!result?.success)throw new Error(result?.message||'Unable to open receipt');const bytes=Uint8Array.from(atob(result.base64),char=>char.charCodeAt(0));setPreview({url:URL.createObjectURL(new Blob([bytes],{type:result.mime})),mime:result.mime});}catch(e:any){setError(e.message);}finally{setBusy(false);}};
 return <section className="border rounded p-3 mt-3"><h3 className="h6">Supporting documents</h3><p className="small text-muted">PDF, JPEG, PNG or WebP · Up to 10 files per upload · 5 MB each</p>{error&&<div role="alert" className="alert alert-danger">{error}<button type="button" className="btn btn-link" onClick={load}>Retry</button></div>}{loading?<p role="status">Loading receipts…</p>:<>{!names.length&&<p className="text-muted">No supporting documents uploaded.</p>}<ul className="list-group mb-3">{names.map((name,index)=><li className="list-group-item d-flex justify-content-between gap-2" key={name}><button type="button" disabled={busy} className="btn btn-link p-0" onClick={()=>view(name)}>Receipt {index+1} · {name.split('.').pop()?.toUpperCase()}</button>{editable&&canDelete&&<button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={async()=>{if(!window.confirm('Delete this receipt?'))return;setBusy(true);try{const result=await customFetchMutation('expenses/receipt/uploaded/images','DELETE',{data:[name]});if(result?.status!=='success')throw new Error(result?.message||'Unable to delete receipt');await load();}catch(e:any){setError(e.message);}finally{setBusy(false);}}}>Delete</button>}</li>)}</ul></>}{preview&&<div className="mb-3"><a href={preview.url} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">Open document</a>{preview.mime!=='application/pdf'&&<img src={preview.url} alt="Selected expense receipt" style={{display:'block',maxWidth:'100%',maxHeight:420,objectFit:'contain',marginTop:12}}/>}</div>}<label className="form-label" htmlFor={`expense-files-${expenseId}`}>Attach receipts</label><input id={`expense-files-${expenseId}`} className="form-control" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{setFiles(Array.from(e.target.files||[]));setError('');}}/><button type="button" className="btn btn-outline-primary mt-2" disabled={busy||!files.length} onClick={async()=>{const validation=validateReceiptFiles(files);if(validation){setError(validation);return;}setBusy(true);try{await uploadExpenseReceipts(expenseId,files);setFiles([]);await load();}catch(e:any){setError(e.message);}finally{setBusy(false);}}}>{busy?'Working…':'Upload receipts'}</button></section>;
}
