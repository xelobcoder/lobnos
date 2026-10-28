"use client";
import React from 'react';
import {currencyFormatter} from '../Auth/customFetch';
import styles from './ForecastMovements.module.css';
function weekKey(date:string){const day=new Date(date+'T00:00:00Z');day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);return day.toISOString().slice(0,10);}
export default function ForecastMovements({report}:{report:any}){
 const monthly=(Number(report.days)||Math.round((Date.parse(report.to)-Date.parse(report.asOf))/86400000))>45;
 const key=(date:string)=>monthly?date.slice(0,7):weekKey(date);
 const buckets=new Map<string,{key:string;incoming:number;outgoing:number}>();
 const get=(date:string)=>{const group=key(date);if(!buckets.has(group))buckets.set(group,{key:group,incoming:0,outgoing:0});return buckets.get(group)!;};
 for(const point of report.points||[]){const bucket=get(point.date);bucket.incoming+=Math.round(Number(point.incoming||0)*100);bucket.outgoing+=Math.round(Number(point.outgoing||0)*100);}
 const rows=[...buckets.values()].sort((a,b)=>a.key.localeCompare(b.key)),maximum=Math.max(100,...rows.flatMap(row=>[row.incoming,row.outgoing])),step=500/Math.max(1,rows.length);
 const y=(amount:number)=>185-amount/maximum*150;
 const label=(date:string)=>new Date((monthly?date+'-01':date)+'T00:00:00Z').toLocaleDateString('en-GB',{month:'short',...(monthly?{year:'2-digit'}:{day:'numeric'}),timeZone:'UTC'});
 const compact=(amount:number)=>new Intl.NumberFormat('en-GH',{notation:'compact',maximumFractionDigits:1}).format(amount/100);
 return <div className={styles.chart}><div className={styles.legend}><span><i/>Money in</span><span><i/>Money out</span><span>{monthly?'Monthly':'Weekly'} · {currencyFormatter.resolvedOptions().currency}</span></div><svg viewBox="0 0 600 235" role="img" aria-label="Projected cash receipts and payments by period">{[0,1,2,3].map(index=>{const amount=maximum*index/3;return <g key={index}><line x1="70" x2="570" y1={y(amount)} y2={y(amount)} stroke="var(--bs-border-color)"/><text x="58" y={y(amount)+4} textAnchor="end">{compact(amount)}</text></g>;})}{rows.map((row,index)=>{const center=70+(index+.5)*step;return <g key={row.key}><rect x={center-step*.3} y={y(row.incoming)} width={step*.27} height={185-y(row.incoming)} fill="var(--accounting-accent,var(--theme-accent,#18866a))"/><rect x={center+step*.02} y={y(row.outgoing)} width={step*.27} height={185-y(row.outgoing)} fill="#d29625"/><text x={center} y="216" textAnchor="middle">{label(row.key)}</text><title>{label(row.key)}: money in {currencyFormatter.format(row.incoming/100)}, money out {currencyFormatter.format(row.outgoing/100)}</title></g>;})}</svg><details><summary>View period totals</summary><div className="table-responsive"><table className="table table-sm"><thead><tr><th>{monthly?'Month':'Week starting'}</th><th className="text-end">Money in</th><th className="text-end">Money out</th><th className="text-end">Net movement</th></tr></thead><tbody>{rows.map(row=><tr key={row.key}><th>{row.key}</th><td className="text-end">{currencyFormatter.format(row.incoming/100)}</td><td className="text-end">{currencyFormatter.format(row.outgoing/100)}</td><td className="text-end">{currencyFormatter.format((row.incoming-row.outgoing)/100)}</td></tr>)}</tbody></table></div></details></div>;
}
