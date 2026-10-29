"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RiArrowRightLine, RiCalendarLine, RiCheckDoubleLine, RiCloseCircleLine, RiErrorWarningLine, RiFilter3Line, RiHistoryLine, RiMailSendLine, RiRefreshLine, RiTimeLine } from '@remixicon/react';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import DateFilterReusable from '../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import { smsCapabilities, smsStatusLabels, smsError } from '../../../../../lib/sms';
import ui from '../../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './history.module.css';

type Campaign = { jobid: number; category: string; recipientscope: string; createdbyusername?: string; createdat: string; sendtype: string; scheduledat?: string; status: string; sandbox?:boolean; blockreason?:string; dispatchstate?: string; progress?: Record<string, number> };
const PAGE_SIZE = 15;
const statuses = ['sandbox','blocked','pending', 'scheduled', 'processing', 'submitted', 'delivered', 'partialfailed', 'failed', 'unknown', 'cancelled', 'sent'];
const categories: Record<string, string> = { patient: 'Patients', clinician: 'Practitioners', organization: 'Organizations' };
const scopes: Record<string, string> = { single: 'Single recipient', multiple: 'Selected recipients', all: 'All recipients' };
const colors: Record<string, string> = {sandbox:'#6787a4', delivered: '#278b78', submitted: '#3c78a8', failed: '#bd5b55', unknown: '#b57c24', queued: '#81908c', processing: '#7776a3', cancelled: '#a6aaa8' };
const date = (value?: string) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not available';
const time = (value?: string) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
const count = (value: number) => value.toLocaleString();

function MessageProgress({ progress = {} }: { progress?: Record<string, number> }) {
 const parts = [
  { key: 'sandbox', label: 'sandbox test', value: Number(progress.sandbox || 0) },
  { key: 'delivered', label: 'delivered', value: Number(progress.delivered || 0) },
  { key: 'submitted', label: 'submitted', value: Number(progress.submitted || 0) + Number(progress.sent || 0) },
  { key: 'queued', label: 'queued', value: Number(progress.queued || 0) },
  { key: 'processing', label: 'submitting', value: Number(progress.submitting || 0) + Number(progress.retrying || 0) },
  { key: 'failed', label: 'failed', value: Number(progress.failed || 0) },
  { key: 'unknown', label: 'need review', value: Number(progress.unknown || 0) },
  { key: 'cancelled', label: 'cancelled', value: Number(progress.cancelled || 0) },
 ];
 const total = Object.values(progress).reduce((sum, n) => sum + Number(n), 0);
 if (!total) return <span className={styles.muted}>No recipient progress recorded</span>;
 return <div className={styles.progress}><div className={styles.progressHeading}><RiCheckDoubleLine size={15} aria-hidden="true" /><strong>{count(Number(progress.delivered||0))} / {count(total)}</strong><span>delivered</span></div><div className={styles.progressTrack} aria-hidden="true">{parts.filter(part => part.value > 0).map(part => <span key={part.key} style={{ width: `${part.value / total * 100}%`, background: colors[part.key] }} />)}</div><div className={styles.progressLabels}>{parts.filter(part => part.value > 0).map(part => <span data-state={part.key} key={part.key}><i style={{ background: colors[part.key] }} />{count(part.value)} {part.label}</span>)}</div></div>;
}

export default function CampaignHistory() {
 const caps = smsCapabilities(useApplication()?.user?.role);
 const [jobs, setJobs] = useState<Campaign[]>([]), [total, setTotal] = useState(0), [page, setPage] = useState(1);
 const [status, setStatus] = useState(''), [category, setCategory] = useState(''), [from, setFrom] = useState(''), [to, setTo] = useState(''), [period, setPeriod] = useState('All');
 const [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0);
 const [cancel, setCancel] = useState<Campaign | null>(null), [cancelling, setCancelling] = useState(false), [cancelError, setCancelError] = useState(''), [notice, setNotice] = useState('');
 const periodChoice = useRef('All'), cancelLock = useRef(false), keepButton = useRef<HTMLButtonElement>(null);
 const rangeError = from && to && from > to ? 'Choose an end date on or after the start date.' : '';
 useEffect(() => {
  if (!caps.read || rangeError) { setLoading(false); return; }
  let current = true; setLoading(true); setError('');
  const query = new URLSearchParams({ page: String(page), count: String(PAGE_SIZE), status, category, from, to });
  customFetch('prime/sms-jobs-paginated?' + query).then(result => {
   if (!current) return;
   if (!Array.isArray(result?.jobs)) throw new Error(smsError(result, 'Unable to load campaigns'));
   const size = Number(result.total) || 0, lastPage = Math.max(1, Math.ceil(size / PAGE_SIZE));
   setJobs(result.jobs); setTotal(size);
   if (page > lastPage) setPage(lastPage);
  }).catch(e => { if (current) setError(smsError(e, 'Unable to load campaigns')); }).finally(() => { if (current) setLoading(false); });
  return () => { current = false; };
 }, [page, status, category, from, to, revision, caps.read, rangeError]);
 useEffect(() => { if (cancel) keepButton.current?.focus(); }, [cancel]);
 async function cancelCampaign() {
  if (cancelLock.current || !cancel) return;
  cancelLock.current = true; setCancelling(true); setCancelError('');
  try {
   const result = await customPost(`prime/sms-jobs/${cancel.jobid}/cancel`, 'POST', {});
   if (result?.status !== 'cancelled') throw new Error(smsError(result, 'Unable to cancel campaign'));
   setNotice(`Unsent messages in campaign #${cancel.jobid} were cancelled. Campaign history is retained.`);
   setCancel(null); setRevision(value => value + 1);
  } catch (e) { setCancelError(smsError(e, 'Unable to cancel campaign')); }
  finally { cancelLock.current = false; setCancelling(false); }
 }
 function clearFilters() { setStatus(''); setCategory(''); setFrom(''); setTo(''); setPeriod('All'); periodChoice.current = 'All'; setPage(1); }
 const change = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLSelectElement>) => { setter(event.target.value); setPage(1); };
 if (!caps.read) return <div role="alert" className="alert alert-info">You do not have access to SMS campaign history.</div>;
 const filtersActive = !!(status || category || from || to), unavailable = loading || !!error || !!rangeError;
 const active = jobs.filter(job => ['queued', 'processing', 'blocked'].includes(job.dispatchstate || '')).length;
 const attention = jobs.filter(job => Number(job.progress?.failed || 0) + Number(job.progress?.unknown || 0) > 0).length;
 const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
 return <div className={`${ui.workspace} ${styles.history}`}>
  <header className={ui.header}><div className={`${ui.heading} ${styles.heading}`}><span className={ui.icon}><RiHistoryLine size={24} aria-hidden="true" /></span><div><span className={ui.eyebrow}>Communications</span><h1>SMS campaigns</h1><p>Review your campaigns, delivery progress and messages that need attention.</p></div></div><div className={`${ui.actions} ${styles.headerActions}`}><Link className={ui.secondary} href="/communications/sms/dashboard">SMS overview</Link><button className={ui.secondary} disabled={loading || cancelling} onClick={() => setRevision(value => value + 1)}><RiRefreshLine size={17} aria-hidden="true" />Refresh</button>{caps.send && <Link className={ui.primary} href="/communications/sms/jobs"><RiMailSendLine size={17} aria-hidden="true" />Compose message</Link>}</div></header>
  <div className={`${ui.stats} ${styles.stats}`} aria-label="Campaign overview">{[
   { label: 'Matching campaigns', value: total, detail: filtersActive ? 'Across the selected filters' : 'All accessible campaign history', Icon: RiHistoryLine },
   { label: 'Awaiting / processing', value: active, detail: 'Campaigns on this page', Icon: RiTimeLine },
   { label: 'Needs attention', value: attention, detail: 'Campaigns on this page with failed or uncertain messages', Icon: RiErrorWarningLine },
  ].map(({ label, value, detail, Icon }) => <div className={ui.stat} key={label}><span className={ui.icon}><Icon size={21} aria-hidden="true" /></span><div><span className={styles.statLabel}>{label}</span><strong>{unavailable ? '—' : count(value)}</strong><small>{detail}</small></div></div>)}</div>
  {notice && <div className={ui.success} role="status"><span>{notice}</span><button className={ui.textButton} onClick={() => setNotice('')}>Dismiss</button></div>}
  {cancel && <section className={styles.confirmation} role="region" aria-label={`Cancel campaign #${cancel.jobid}`}><div><h2>Cancel unsent messages in campaign #{cancel.jobid}?</h2><p>Messages already submitted to the provider cannot be recalled. The campaign and its delivery history will remain available.</p>{cancelError && <p className={styles.cancelError} role="alert">{cancelError}</p>}</div><div className={ui.actions}><button ref={keepButton} className={ui.secondary} disabled={cancelling} onClick={() => { setCancel(null); setCancelError(''); }}>Keep campaign</button><button className={ui.danger} disabled={cancelling} onClick={cancelCampaign}>{cancelling ? 'Cancelling…' : 'Confirm cancellation'}</button></div></section>}
  <section className={`${ui.panel} ${styles.catalogue}`} aria-label="Campaign history" aria-busy={loading}>
   <div className={styles.filters}>
    <div className={ui.field}><label htmlFor="sms-campaign-period"><RiCalendarLine size={15} aria-hidden="true" /> Created date</label><DateFilterReusable id="sms-campaign-period" className="" label="Campaign date period" value={period} disabled={cancelling} onChange={value => { periodChoice.current = value || 'All'; setPeriod(value || 'All'); }} onDateRangeChange={(start, end) => { setFrom(periodChoice.current === 'All' ? '' : start); setTo(periodChoice.current === 'All' ? '' : end); setPage(1); }} /></div>
    <div className={ui.field}><label htmlFor="sms-campaign-status">Status</label><select id="sms-campaign-status" aria-label="Campaign status" value={status} onChange={change(setStatus)} disabled={cancelling}><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{smsStatusLabels[value]}</option>)}</select></div>
    <div className={ui.field}><label htmlFor="sms-campaign-category">Recipient category</label><select id="sms-campaign-category" aria-label="Campaign category" value={category} onChange={change(setCategory)} disabled={cancelling}><option value="">All categories</option>{Object.entries(categories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
    <button className={ui.secondary} disabled={cancelling || !filtersActive} onClick={clearFilters}><RiFilter3Line size={16} aria-hidden="true" />Clear filters</button>
   </div>
   <div className={styles.resultBar}><span>{loading ? 'Updating campaigns…' : unavailable ? 'Campaigns unavailable' : `${count(total)} campaign${total === 1 ? '' : 's'}${filtersActive ? ' match these filters' : ' in your history'}`}{from && to && !rangeError && <small>{date(from + 'T12:00:00')} – {date(to + 'T12:00:00')}</small>}</span><span>Submitted ≠ delivered. Delivery requires provider confirmation.</span></div>
   {rangeError ? <div className={styles.loadError} role="alert">{rangeError}</div> : error ? <div className={styles.loadError} role="alert"><RiErrorWarningLine size={22} aria-hidden="true" /><div><strong>Campaign history could not be loaded</strong><p>{error}</p></div><button className={ui.secondary} onClick={() => setRevision(value => value + 1)}>Retry</button></div> : loading ? <div className={ui.empty} role="status">Loading campaigns…</div> : !jobs.length ? <div className={ui.empty}><span className={ui.icon}><RiHistoryLine size={26} aria-hidden="true" /></span><h2>{filtersActive ? 'No matching campaigns' : 'Your campaign history starts here'}</h2><p>{filtersActive ? 'Try a different status, recipient category or date period.' : 'Create your first SMS campaign to track submission and delivery here.'}</p>{filtersActive ? <button className={ui.secondary} onClick={clearFilters}>Clear filters</button> : caps.send && <Link className={ui.primary} href="/communications/sms/jobs">Compose message</Link>}</div> : <>
    <div className={styles.scrollHint}>On smaller screens, scroll the table sideways to see every detail.</div>
    <div className={ui.tableWrap} tabIndex={0} role="region" aria-label="Campaign results"><table className={`${ui.table} ${styles.table}`}><caption className="visually-hidden">SMS campaign creation, timing, processing status and recipient delivery progress.</caption><thead><tr>{['Campaign', 'Created by', 'Delivery timing', 'Status', 'Recipient progress', 'Actions'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{jobs.map(job => <tr key={job.jobid}>
     <td><Link className={ui.name} href={`/communications/sms/jobs/recipients/${job.jobid}`}>Campaign #{job.jobid}</Link><p>{categories[job.category] || job.category}{job.sandbox&&<strong> · TEST</strong>}</p><small className={styles.muted}>{scopes[job.recipientscope] || job.recipientscope}</small></td>
     <td><span className={styles.author}>{job.createdbyusername || 'System'}</span><p>{date(job.createdat)} · {time(job.createdat)}</p></td>
     <td><span className={styles.timing}><RiTimeLine size={14} aria-hidden="true" />{job.sendtype === 'scheduled' ? 'Scheduled' : 'Immediate'}</span>{job.sendtype === 'scheduled' && <p>{date(job.scheduledat)}<br />{time(job.scheduledat)}</p>}</td>
     <td><span className={styles.status} data-state={job.status}><i aria-hidden="true" />{smsStatusLabels[job.status] || job.status}</span>{job.blockreason&&<p>{job.blockreason}</p>}</td>
     <td><MessageProgress progress={job.progress} /></td>
     <td><div className={styles.rowActions}><Link className={ui.textButton} href={`/communications/sms/jobs/recipients/${job.jobid}`}>View messages<RiArrowRightLine size={15} aria-hidden="true" /></Link>{caps.manage && ['queued', 'processing', 'blocked'].includes(job.dispatchstate || '') && <button className={styles.cancelButton} disabled={cancelling} onClick={() => { setCancel(job); setCancelError(''); setNotice(''); }}><RiCloseCircleLine size={15} aria-hidden="true" />Cancel unsent</button>}</div></td>
    </tr>)}</tbody></table></div>
   </>}
   {!error && !rangeError && <footer className={ui.footer}><span className={styles.muted} aria-live="polite">{loading ? 'Loading results…' : jobs.length ? `Showing ${count((page - 1) * PAGE_SIZE + 1)}–${count((page - 1) * PAGE_SIZE + jobs.length)} of ${count(total)}` : '0 campaigns'}</span><nav className={ui.pager} aria-label="Campaign pages"><button className={ui.secondary} disabled={loading || cancelling || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span className={styles.muted}>Page {page} of {pages}</span><button className={ui.secondary} disabled={loading || cancelling || page >= pages} onClick={() => setPage(value => value + 1)}>Next</button></nav></footer>}
  </section>
 </div>;
}
