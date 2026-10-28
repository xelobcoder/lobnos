"use client";
import React,{useEffect,useMemo,useState} from 'react';
import ReportShell from '../../../components/accounting/ReportShell';
import AccountingTable from '../../../components/accounting/AccountingTable';
import {accountingApi} from '../../../lib/accounting/accountingApi';
import {checked} from '../../../components/accounting/usePlanningAccess';
import {currencyFormatter} from '../../../components/Auth/customFetch';
import styles from '../../../components/accounting/Planning.module.css';
export default function ChartOfAccounts(){
 const [asOf,setAsOf]=useState(new Date().toISOString().slice(0,10)),[type,setType]=useState('all'),[status,setStatus]=useState('all');
 const [accounts,setAccounts]=useState<any[]|null>(null),[error,setError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{let active=true;setAccounts(null);setError('');Promise.all([accountingApi.accounts(),accountingApi.generalLedgerSummary({to:asOf})]).then(([catalogue,ledger])=>{const rows=checked(catalogue),balances=new Map(checked(ledger).rows.map((row:any)=>[row.accountCode,row.closingBalance]));if(active)setAccounts(rows.map((row:any)=>({...row,balance:balances.get(row.account_code)||0})));}).catch(error=>{if(active)setError(error.message||'Unable to load chart of accounts');});return()=>{active=false;};},[asOf,reload]);
 const rows=useMemo(()=>(accounts||[]).filter(row=>(type==='all'||row.type===type)&&(status==='all'||(Number(row.is_active)!==0&&row.is_active!==false)===(status==='active'))),[accounts,type,status]);
 const columns=useMemo(()=>[
  {Header:'Account',accessor:'name',Cell:({row}:any)=><a href={`/accounting/general-ledger?view=summary&accountCode=${row.original.account_code}&to=${asOf}`}>{row.original.name}</a>},
  {Header:'Code',accessor:'account_code'},
  {Header:'Category',accessor:'type'},
  {Header:'Normal side',accessor:'normal_balance'},
  {Header:'Status',accessor:'is_active',Cell:({value}:any)=>Number(value)!==0&&value!==false?'Active':'Inactive'},
  {Header:'Ledger balance',accessor:'balance',Cell:({value}:any)=><span className={value<0?'text-danger':undefined}>{currencyFormatter.format(value)}</span>},
 ],[asOf]);
 return <ReportShell title="Chart of Accounts" subtitle="Read-only company ledger catalogue. Review account categories, normal balances and posted balances without changing the accounting setup." basis="accrual" range={`As at ${asOf}`} filters={<><div className="col-12 col-md-4"><label className="form-label" htmlFor="accounts-cutoff">Balance date</label><input id="accounts-cutoff" type="date" className="form-control" value={asOf} required onChange={e=>{if(e.target.value)setAsOf(e.target.value);}}/></div><div className="col-6 col-md-4"><label className="form-label" htmlFor="accounts-category">Category</label><select id="accounts-category" className="form-select" value={type} onChange={e=>setType(e.target.value)}><option value="all">All categories</option>{['asset','liability','equity','revenue','expense'].map(value=><option key={value} value={value}>{value}</option>)}</select></div><div className="col-6 col-md-4"><label className="form-label" htmlFor="accounts-status">Status</label><select id="accounts-status" className="form-select" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></>}>
 {error?<div className="alert alert-danger" role="alert">{error}<button className="btn btn-sm btn-outline-danger ms-3" onClick={()=>setReload(reload+1)}>Retry accounts</button></div>:!accounts?<p role="status">Loading chart of accounts…</p>:<><div className={styles.legend}>{['asset','liability','equity','revenue','expense'].map(category=><span key={category}>{category}: {accounts.filter(row=>row.type===category).length}</span>)}</div><p className={styles.note}>Balances follow the normal side of each account and include all posted entries through the balance date. Income and expense balances here are ledger balances; use Profit & Loss for period performance.</p><AccountingTable column={columns} data={rows} filtering isExpoerted handleSeverSideProcessing={undefined}/></>}
 </ReportShell>;
}
