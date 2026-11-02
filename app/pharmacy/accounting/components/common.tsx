'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { RiScalesLine } from '@remixicon/react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../../components/accessories/Loader';
import { currencyFormatter } from '../../../../components/Auth/customFetch';
import { accountingDateLabel, accountingReference, record, text, type RecordData } from '../../../../lib/pharmacyAccounting';
import sharedStyles from '../../components/PharmacyWorkspace.module.css';
import layout from './AccountingWorkspace.module.css';
// Compatibility for existing sections: this is unboxed page flow, NOT the shared decorative card.
export const styles:Record<string,string> = {...sharedStyles,card:layout.section,section:layout.section,actions:layout.actions,field:layout.field,grid:layout.grid,number:layout.number,table:layout.table};
export const label = (key: string) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
export function Feedback({ error, notice }: { error?: string; notice?: string }) {
  return <>{error && <div role="alert" className="alert alert-danger">{error}</div>}{notice && <div role="status" className="alert alert-success">{notice}</div>}</>;
}
export function ResourceState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  return <>{loading && <div role="status" aria-busy="true" className="d-flex align-items-center gap-2 py-3"><Loader/> Loading accounting records…</div>}{error && <><Feedback error={error}/><button type="button" className="btn btn-outline-primary" onClick={retry}>Retry</button></>}</>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="d-flex flex-column gap-1 mb-3">{label}{children}</label>;
}
/** Legacy financial tasks now expand in normal flow, with no decorative/modal card around their forms. */
export function FormSection({title,onClose,children,busy=false}:{title:string;onClose:()=>void;children:ReactNode;busy?:boolean}) {
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    heading.current?.focus();heading.current?.scrollIntoView({block:'start'});
    return ()=>{if(previous?.isConnected)previous.focus();};
  },[title]);
  return <section className={layout.section} aria-label={title} aria-busy={busy}><div className="border-bottom pb-2 mb-3 d-flex flex-wrap justify-content-between gap-2"><h2 ref={heading} tabIndex={-1} className="h5 mb-0">{title}</h2><button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={onClose}>Close task</button></div>{children}</section>;
}
export function ReferenceText({value,field='source_document',kind}:{value:unknown;field?:string;kind?:unknown}) {
  const full=text(value),short=accountingReference(value,field,kind);
  return short===full?<>{full}</>:<abbr tabIndex={0} title={full} aria-label={`${short}; full reference: ${full}`}>{short}</abbr>;
}
export function money(value:unknown):string {
  return value==null||value===''||!['number','string'].includes(typeof value)||!Number.isFinite(Number(value))?'—':currencyFormatter.format(Number(value));
}
export function Money({value}:{value:unknown}) {return <>{money(value)}</>;}
export function DateText({value}:{value:unknown}) {
  return <time dateTime={typeof value==='string'?value:undefined} title={typeof value==='string'?value:undefined}>{accountingDateLabel(value)}</time>;
}
export function SummaryMetrics({metrics}:{metrics:{title:string;value:unknown;subtitle:string;variant?:'primary'|'success'|'warning'|'danger'|'info'|'secondary';count?:boolean}[]}) {
  return <div className="row g-3 mb-3">{metrics.map(metric=><div key={metric.title} className={metrics.length===4?'col-12 col-sm-6 col-xl-3':metrics.length===3?'col-12 col-md-4':'col-12 col-sm-6'}>
    <div className={`card border-0 shadow-sm bg-${metric.variant||'primary'} bg-gradient text-white rounded-3 h-100`}><div className="card-body p-3">
      <div className="d-flex justify-content-between align-items-center mb-1"><span className="text-xs text-uppercase fw-semibold opacity-75">{metric.title}</span><RiScalesLine size={22} className="opacity-75" aria-hidden="true"/></div>
      <h3 className="fw-bold mb-0">{metric.value==null?'Not available':metric.count?Number(metric.value).toLocaleString():money(metric.value)}</h3><span className="text-xs opacity-75">{metric.subtitle}</span>
    </div></div>
  </div>)}</div>;
}
function AccountingValue({value,field,kind}:{value:unknown;field:string;kind?:unknown}) {
  if(/(^date$|_date$|_at$|^financialDate$|^asOf$|^period_start$|^period_end$)/.test(field))return <DateText value={value}/>;
  if(/(^id$|_id$|Id$|account_code|local_account|^code$)/.test(field))return <ReferenceText value={value} field={field} kind={kind}/>;
  if(field==='is_active')return <>{value==null?'—':value?'Active':'Inactive'}</>;
  if(field==='matched')return <>{value?'Matched':'Unmatched'}</>;
  const numeric=value!==null&&value!==undefined&&value!==''&&['number','string'].includes(typeof value)&&Number.isFinite(Number(value));
  if(numeric&&/^(rate|tax_rate)$/i.test(field))return <>{Number(value).toLocaleString(undefined,{maximumFractionDigits:4})}%</>;
  if(numeric&&/(amount|balance|debit|credit|cost|profit|revenue|cash.?flow|expense|payables?$|receivables?$|value$|difference|sales|stockValue|inventoryControl|^gross$|^net$|^tax$|^total$|^paid$|^outstanding$|^opening$|^closing$|^current$|^overdue|^unknown_due_date$|^days_?\d|refunded|netPaid|^cogs$)/i.test(field))return <Money value={value}/>;
  if(numeric&&/(count|quantity|days|^version$)/i.test(field))return <>{Number(value).toLocaleString()}</>;
  return <ReferenceText value={value} field={field} kind={kind}/>;
}
const businessFields=['date','financial_date','created_at','completed_at','id','reference','receipt_number','name','filename','mime_type','byte_length','sha256','malware_scan','customer_name','supplier_name','description','kind','status','version','count','account_code','account','account_name','type','normal_balance','period_code','period_start','period_end','start_date','end_date','due_date','aging_bucket','bucket','quantity','unitCost','value','total_amount','paid_amount','adjusted_amount','outstanding_amount','outstanding','amount','total','debit','credit','running_balance','journal_id','journal_line_id','documentRef','document_ref','source_document','business_unit','balance','supplier_id','sale_id','billId','bill_id','matched','localDebit','localCredit','sharedDebit','sharedCredit','debitDifference','creditDifference','source_ref','shared_entry_id','source_table','is_active'];
export function DataTable({ rows, columns, labels = {}, caption, actions, cell, inlineActions=false, pageSlice=false }: { rows: RecordData[]; columns?: string[]; labels?: Record<string, string>; caption?: string; actions?: (row: RecordData) => ReactNode; cell?: (row: RecordData, key: string) => ReactNode; inlineActions?:boolean; pageSlice?:boolean }) {
  const [selected,setSelected]=useState<string|null>(null);
  const keys = columns?.length ? columns : businessFields.filter(key=>rows.some(row=>Object.prototype.hasOwnProperty.call(row,key)));
  const review=selected==null?undefined:rows.find((row,index)=>String(row.id??index)===selected);
  if (!rows.length) return <p className={styles.empty}>No records returned for this selection.</p>;
  const tableColumns=keys.map(key=>({Header:labels[key]||label(key),accessor:key,id:key,Cell:({row}:{row:{original:RecordData}})=>cell?.(row.original,key)??<AccountingValue value={row.original[key]} field={key==='value'&&row.original.measure?String(row.original.measure):key} kind={row.original.kind}/>}));
  const actionColumn=actions?[{Header:'Actions',id:'accounting-actions',disableSortBy:true,Cell:({row}:{row:{original:RecordData;index:number}})=>inlineActions?actions(row.original):<button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>setSelected(String(row.original.id??row.index))}>Review / manage</button>}]:[];
  return <>{caption&&<h3 className="h6 mb-2">{caption}</h3>}{pageSlice&&<p className="small text-muted mb-2">Showing loaded rows on this page. Table sorting applies to these rows; exports retrieve the complete filtered register.</p>}<div className={layout.dataTable}><PrimeTable column={[...tableColumns,...actionColumn]} data={rows} filtering={false} isExpoerted={false} serverSideFiltering={pageSlice} handleSeverSideProcessing={undefined}/></div>
    {review&&actions&&!inlineActions&&<section className="mt-3 pt-3 border-top" aria-label="Selected document review"><div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><h3 className="h6 mb-0">Review <ReferenceText value={review.id??review.sourceRef??review.source_ref} field="id" kind={review.kind||review.sourceKind}/></h3><button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>setSelected(null)}>Close review</button></div>{actions(review)}</section>}
  </>;
}
export function Facts({ data, idField = 'id' }: { data: unknown; idField?: string }) {
  const rows = Object.entries(record(data)).filter(([, value]) => value !== null && typeof value !== 'object');
  return <dl className="row">{rows.map(([key, value]) => <div key={key} className="col-sm-6 mb-2"><dt>{label(key)}</dt><dd><AccountingValue value={value} field={key==='id'?idField:key} kind={record(data).kind}/></dd></div>)}</dl>;
}
export function WorkflowLinks() {
  return <div className={styles.actions}><Link className="btn btn-outline-primary" href="/pharmacy/finance">Cash & financial days</Link><Link className="btn btn-outline-primary" href="/pharmacy/accounts">Customer credit & collections</Link></div>;
}
