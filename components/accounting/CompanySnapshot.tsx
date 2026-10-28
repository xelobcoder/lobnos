"use client";
import React from 'react';
import Link from 'next/link';
import {currencyFormatter} from '../Auth/customFetch';
import type {FinancialOverview} from '../../lib/accounting/accountingApi';
import styles from './CompanySnapshot.module.css';
export default function CompanySnapshot({overview,loading}:{overview:FinancialOverview|null;loading:boolean}){
 const p=overview?.position,profit=overview?.performance.yearToDate;
 const margin=profit&&profit.revenue>0?profit.profit/profit.revenue*100:null;
 const debt=p&&p.totalAssets>0?p.totalLiabilities/p.totalAssets*100:null;
 const money=(value?:number)=>loading?'…':overview?currencyFormatter.format(value||0):'—';
 const percent=(value:number|null)=>loading?'…':value===null?'—':`${value.toFixed(1)}%`;
 const indicators=[{label:'Cash available',value:money(p?.cashAndBank),note:'Posted cash + bank',href:'/accounting/cash-flow',negative:!!p&&p.cashAndBank<0},{label:'Net worth',value:money(p?.netAssets),note:'Assets less liabilities',href:'/accounting/balance-sheet',negative:!!p&&p.netAssets<0},{label:'Net profit margin',value:percent(margin),note:'Year-to-date profit ÷ revenue',href:'/accounting/income-statement',negative:margin!==null&&margin<0},{label:'Liabilities to assets',value:percent(debt),note:'Liabilities ÷ total assets',href:'/accounting/balance-sheet',negative:debt!==null&&debt>100}];
 return <section className={styles.snapshot} aria-labelledby="company-snapshot-title"><div className={styles.heading}><h2 id="company-snapshot-title">Company snapshot</h2><span>{overview?`Posted balances · ${overview.asOf}`:'Posted financial position'}</span></div><div className={styles.metrics}>{indicators.map(item=><Link href={item.href} key={item.label}><span>{item.label}</span><strong className={item.negative?styles.negative:undefined}>{item.value}</strong><small>{item.note}</small></Link>)}</div>{overview&&<div className={styles.interpretation}>{p!.cashAndBank<0&&<span className={styles.negative}>Cash and bank are negative; review funding and cash postings.</span>}{p!.netAssets<0&&<span className={styles.negative}>Liabilities exceed assets.</span>}{p!.balanceDifference!==0&&<span className={styles.negative}>The balance sheet has a reconciliation difference.</span>}<Link href="/accounting/chart-of-accounts">Explore Chart of Accounts →</Link></div>}</section>;
}
