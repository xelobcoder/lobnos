"use client";
import React,{useState} from 'react';
import dayjs from 'dayjs';
import {currencyFormatter} from '../Auth/customFetch';
import styles from './AccountingTrendChart.module.css';
type Trend={periods:string[];revenue:number[];expenses:number[];profit:number[]};
export default function AccountingTrendChart({trend}: {trend:Trend}) {
 const [mode,setMode]=useState<'comparison'|'profit'>('comparison'),[selected,setSelected]=useState<number|null>(null);
 const periods=trend.periods;const series=mode==='profit'?[trend.profit]:[trend.revenue,trend.expenses];
 const values=series.flat();const min=Math.min(0,...values),max=Math.max(1,...values),span=max-min;
 const low=min<0?min-span*.08:0,high=max+span*.12,range=high-low;
 const y=(v:number)=>250-(v-low)/range*210,step=620/Math.max(1,periods.length),x=(i:number)=>64+step*(i+.5);
 const compact=(v:number)=>new Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(v);
 const money=(v:number)=>currencyFormatter.format(v||0);
 const active=selected===null?periods.length-1:selected;
 return <div className={styles.chart}><div className={styles.toolbar}><div role="group" aria-label="Chart view"><button aria-pressed={mode==='comparison'} className={mode==='comparison'?styles.active:''} onClick={()=>{setMode('comparison');setSelected(null);}}>Revenue & expenses</button><button aria-pressed={mode==='profit'} className={mode==='profit'?styles.active:''} onClick={()=>{setMode('profit');setSelected(null);}}>Net profit</button></div><span>{dayjs(periods[0]+'-01').format('MMM YYYY')} – {dayjs(periods[periods.length-1]+'-01').format('MMM YYYY')}</span></div>
 <div className={styles.legend}>{mode==='comparison'?<><span><i style={{background:'var(--accounting-accent,var(--theme-accent,#18866a))'}}/>Revenue</span><span><i style={{background:'#d29625'}}/>Expenses</span></>:<span><i style={{background:'#276eb7'}}/>Net profit</span>}<span className={styles.currency}>{currencyFormatter.resolvedOptions().currency} · Accrual basis</span></div>
 <svg viewBox="0 0 720 300" role="img" aria-label={mode==='comparison'?'Monthly revenue and expense comparison':'Monthly net profit, including losses'}>
 <title>{mode==='comparison'?'Revenue and expenses by month':'Net profit by month'}</title>
 {[0,1,2,3,4].map(i=>{const value=low+range*i/4;return <g key={i}><line x1="64" x2="684" y1={y(value)} y2={y(value)} stroke="var(--bs-border-color,#dce3e8)"/><text x="54" y={y(value)+4} textAnchor="end">{compact(value)}</text></g>})}
 <line x1="64" x2="684" y1={y(0)} y2={y(0)} stroke="var(--bs-secondary-color,#64748b)"/>
 {mode==='profit'&&<polyline fill="none" stroke="#276eb7" strokeWidth="3" points={periods.map((_,i)=>`${x(i)},${y(trend.profit[i]||0)}`).join(' ')}/>}
 {periods.map((p,i)=><g key={p} tabIndex={0} role="button" aria-label={`${dayjs(p+'-01').format('MMMM YYYY')}, revenue ${money(trend.revenue[i])}, expenses ${money(trend.expenses[i])}, profit ${money(trend.profit[i])}`} onFocus={()=>setSelected(i)} onMouseEnter={()=>setSelected(i)} onClick={()=>setSelected(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(i);}}}>
 <rect x={64+i*step} y="30" width={step} height="230" fill={selected===i?'var(--bs-tertiary-bg,#f1f5f9)':'transparent'} opacity=".45"/>
 {mode==='comparison'?[trend.revenue[i]||0,trend.expenses[i]||0].map((v,j)=><rect key={j} x={x(i)+(j===0?-step*.3:step*.02)} y={Math.min(y(0),y(v))} width={step*.27} height={Math.max(v===0?0:1,Math.abs(y(v)-y(0)))} fill={j===0?'var(--accounting-accent,var(--theme-accent,#18866a))':'#d29625'} rx="0"/>):<circle cx={x(i)} cy={y(trend.profit[i]||0)} r="4" fill={(trend.profit[i]||0)<0?'#b54747':'#276eb7'}/>}
 <text x={x(i)} y="281" textAnchor="middle">{dayjs(p+'-01').format('MMM')}</text><title>{p}: revenue {money(trend.revenue[i])}, expenses {money(trend.expenses[i])}, profit {money(trend.profit[i])}</title></g>)}
 </svg>
 {active>=0&&<div className={styles.readout} aria-live="polite"><strong>{dayjs(periods[active]+'-01').format('MMMM YYYY')}</strong><span>Revenue <b>{money(trend.revenue[active])}</b></span><span>Expenses <b>{money(trend.expenses[active])}</b></span><span>Net profit <b>{money(trend.profit[active])}</b></span><a href={`/accounting/income-statement?from=${periods[active]}-01&to=${dayjs(periods[active]+'-01').endOf('month').format('YYYY-MM-DD')}`}>View report →</a></div>}
 <details className={styles.data}><summary>View monthly figures</summary><div className="table-responsive"><table className="table table-sm"><thead><tr><th>Month</th><th className="text-end">Revenue</th><th className="text-end">Expenses</th><th className="text-end">Net profit</th></tr></thead><tbody>{periods.map((p,i)=><tr key={p}><th>{dayjs(p+'-01').format('MMM YYYY')}</th>{[trend.revenue[i],trend.expenses[i],trend.profit[i]].map((v,j)=><td className="text-end" key={j}>{money(v)}</td>)}</tr>)}</tbody></table></div></details></div>;
}
