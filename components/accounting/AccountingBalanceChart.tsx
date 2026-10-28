"use client";
import React from 'react';
import Link from 'next/link';
import {currencyFormatter} from '../Auth/customFetch';
import styles from './AccountingBalanceChart.module.css';
type Row={label:string;value?:number;href:string;color:string};
export default function AccountingBalanceChart({label,rows,available}:{label:string;rows:Row[];available:boolean}){
 const values=rows.map(row=>Number(row.value||0)),min=Math.min(0,...values),max=Math.max(0,...values),range=max-min||1;
 const x=(value:number)=>(value-min)/range*100;
 const ticks=min<0&&max>0?[min,0,max]:[min,(min+max)/2,max];
 const compact=(value:number)=>new Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(value);
 return <figure className={styles.figure} aria-label={label}>
 {rows.map(row=>{const value=Number(row.value||0);return <Link href={row.href} className={styles.row} key={row.label} aria-label={`${row.label}: ${available?currencyFormatter.format(value):'unavailable'}. Open report.`}><div><span>{row.label}</span><strong className={value<0?styles.negative:undefined}>{available?currencyFormatter.format(value):'—'}</strong></div><svg viewBox="0 0 600 25" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="2" width="600" height="21" rx="0" fill="var(--bs-tertiary-bg,#f3f5f6)"/>{available&&value!==0&&<rect x={Math.min(x(0),x(value))*6} y="2" width={Math.abs(x(value)-x(0))*6} height="21" rx="0" fill={value<0?'var(--bs-danger,#b54747)':row.color}/>}<line x1={x(0)*6} x2={x(0)*6} y1="0" y2="25" stroke="var(--bs-secondary-color,#64748b)" strokeWidth="1"/></svg></Link>;})}
 <div className={styles.axis} aria-hidden="true">{available&&max!==min?ticks.map((value,index)=><span key={index} style={{left:`${x(value)}%`,transform:index===0?'none':index===2?'translateX(-100%)':'translateX(-50%)'}}>{compact(value)}</span>):<span>0</span>}</div>
 <figcaption>{currencyFormatter.resolvedOptions().currency} · Shared monetary scale{available&&max===min?' · No activity':''}</figcaption>
 </figure>;
}
