'use client';
import { useEffect, useState } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import s from '../QualityControlWorkspace.module.css';
type Reading={id:string;parameter_name:string;value:string|number;parameter_unit?:string;status:string;control_material_name:string;createdAt?:string};
type Metrics={totalDevices?:number;activeDevices?:number;devicesInMaintenance?:number;qcTestsToday?:number;pendingReviews?:number;critical?:number;warning?:number};
const count=(value:unknown)=>Math.max(0,Number(value)||0);
const date=(value?:string)=>value&&!Number.isNaN(new Date(value).getTime())?new Date(value).toLocaleString():'Not recorded';
function Readings({title,rows,loading,error,empty,onRetry}:{title:string;rows:Reading[];loading:boolean;error:string;empty:string;onRetry:()=>void}) {
 return <section className={s.panel} aria-label={title}><div className={s.panelHeading}><h3>{title}</h3><span>{loading?'Loading…':error?'Unavailable':`${rows.length} ${rows.length===1?'reading':'readings'}`}</span></div>
 {loading?<div role="status" className={s.empty}>Loading {title.toLowerCase()}…</div>:error?<div className={s.empty} role="alert">{error} <button type="button" className="btn btn-outline-primary ms-2" onClick={onRetry}>Retry</button></div>:!rows.length?<div className={s.empty}>{empty}</div>:<div className={s.tableWrap} role="region" aria-label={`${title} table`} tabIndex={0}><table className={s.table}><thead><tr><th>Parameter / control material</th><th>Reading</th><th>Status</th><th>Recorded</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><div className={s.record}><strong>{row.parameter_name||'Unnamed parameter'}</strong><small>{row.control_material_name||'Control material not recorded'}</small></div></td><td>{row.value??'—'} {row.parameter_unit}</td><td><span className={s.status} data-tone={row.status}>{row.status||'Not recorded'}</span></td><td>{date(row.createdAt)}</td></tr>)}</tbody></table></div>}</section>
}
export function QCDashboard() {
 const [metrics,setMetrics]=useState<Metrics|null>(null),[readings,setReadings]=useState<Reading[]>([]),[alerts,setAlerts]=useState<Reading[]>([]);
 const [errors,setErrors]=useState({metrics:'',readings:'',alerts:''}),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{let live=true;setLoading(true);setErrors({metrics:'',readings:'',alerts:''});
 Promise.allSettled([customFetch('qc/dashboard'),customFetch('qc/recent-readings'),customFetch('qc/recent-alert-readings')]).then(results=>{if(!live)return;const next={metrics:'',readings:'',alerts:''};const [m,r,a]=results;
 if(m.status==='fulfilled'&&m.value&&typeof m.value==='object'&&!Array.isArray(m.value)&&m.value.status!==false&&!m.value.error&&('activeDevices' in m.value||'totalDevices' in m.value||'qcTestsToday' in m.value)){setMetrics(m.value)}else{setMetrics(null);next.metrics='Dashboard metrics could not be loaded.'}
 if(r.status==='fulfilled'&&Array.isArray(r.value))setReadings(r.value);else{setReadings([]);next.readings='Recent readings could not be loaded.'}
 if(a.status==='fulfilled'&&Array.isArray(a.value))setAlerts(a.value);else{setAlerts([]);next.alerts='QC alerts could not be loaded.'}setErrors(next);setLoading(false);
 });return()=>{live=false}},[revision]);
 const refresh=()=>setRevision(value=>value+1);
 const value=(number:unknown)=>loading?'…':metrics?count(number).toLocaleString():'—';
 return <div><div className={s.dashboardToolbar}><p>Current instrument and control activity.</p><button type="button" className="btn btn-outline-primary" disabled={loading} onClick={refresh}>Refresh overview</button></div>
 {errors.metrics&&<div role="alert" className={s.error}>{errors.metrics}<button type="button" className="btn btn-outline-danger" onClick={refresh}>Retry metrics</button></div>}
 <div className={s.metrics} aria-label="Quality control summary" aria-busy={loading}>
 <div className={s.metric}><span>Active devices</span><strong>{value(metrics?.activeDevices)}</strong><small>{metrics&&!loading?`${count(metrics.totalDevices)} total · ${count(metrics.devicesInMaintenance)} in maintenance`:'Device availability'}</small></div>
 <div className={s.metric}><span>QC tests today</span><strong>{value(metrics?.qcTestsToday)}</strong><small>Recorded today</small></div>
 <div className={s.metric} data-tone="danger"><span>Out-of-range readings</span><strong>{value(count(metrics?.critical)+count(metrics?.warning))}</strong><small>{metrics&&!loading?`${count(metrics.critical)} critical · ${count(metrics.warning)} warning`:'Critical and warning readings'}</small></div>
 <div className={s.metric}><span>Pending reviews</span><strong>{value(metrics?.pendingReviews)}</strong><small>Awaiting review</small></div>
 </div><Readings title="QC alerts" rows={alerts} loading={loading} error={errors.alerts} empty="No recent QC alerts returned." onRetry={refresh}/><Readings title="Recent QC activity" rows={readings} loading={loading} error={errors.readings} empty="No QC readings yet. Create a session to begin recording control results." onRetry={refresh}/></div>
}
