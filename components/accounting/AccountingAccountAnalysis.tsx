"use client";
import React,{useState} from 'react';
import Link from 'next/link';
import AccountingBalanceChart from './AccountingBalanceChart';
import type {FinancialOverview} from '../../lib/accounting/accountingApi';
import styles from './AccountingAccountAnalysis.module.css';
const types=[['asset','Assets'],['liability','Liabilities'],['equity','Equity'],['revenue','Income'],['expense','Expenses']];
export default function AccountingAccountAnalysis({overview}:{overview:FinancialOverview}){
 const [type,setType]=useState('asset'),[all,setAll]=useState(false);
 const rows=(overview.accountSnapshot||[]).filter(row=>row.type===type&&row.balance!==0).sort((a,b)=>Math.abs(b.balance)-Math.abs(a.balance));
 const period=['revenue','expense'].includes(type)?`Year to date · ${overview.period.from} to ${overview.asOf}`:`Balances as at ${overview.asOf}`;
 return <section className={styles.panel} aria-labelledby="account-analysis-title"><div className={styles.heading}><div><h2 id="account-analysis-title">Account balances at a glance</h2><p>{period}</p></div><Link href="/accounting/chart-of-accounts">Chart of Accounts →</Link></div><div className={styles.tabs} role="group" aria-label="Account category">{types.map(([value,label])=><button key={value} aria-pressed={type===value} onClick={()=>{setType(value);setAll(false);}}>{label}</button>)}</div>{!rows.length?<p className={styles.empty}>No non-zero posted balances in this category.</p>:<AccountingBalanceChart label={`${types.find(row=>row[0]===type)?.[1]} account balances chart`} available rows={(all?rows:rows.slice(0,6)).map(row=>({label:row.name,value:row.balance,color:'var(--accounting-accent,var(--theme-accent,#18866a))',href:`/accounting/general-ledger?accountCode=${row.accountCode}&${['revenue','expense'].includes(type)?`from=${overview.period.from}`:'view=summary'}&to=${overview.asOf}`}))}/>}<div className={styles.foot}><span>{rows.length} non-zero balances · Assets include contra-account effects · Select a bar to review postings</span>{rows.length>6&&<button onClick={()=>setAll(!all)}>{all?'Show leading accounts':'Show all accounts'}</button>}</div></section>;
}
