'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Offcanvas, Spinner } from 'react-bootstrap';
import { RiArrowRightLine, RiCheckLine, RiErrorWarningLine, RiFileListLine, RiHistoryLine, RiRefreshLine, RiSearchLine, RiTestTubeLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { roleAllowed } from '../Auth/roles';
import CollectionSampleModal from '../phelobotomy/CollectionSampleModal';
import styles from './RejectedSamplesWorkspace.module.css';
import { sampleEventTone } from '../../lib/sampleEventTone';

type Sample = { id: number; sample_uid: string; patientid: number; patient_name?: string; fullpatientid?: string; billingid: number; sample_type_name?: string; container_type_name?: string; status: string; rejection_reason?: string; rejected_at?: string; collected_at?: string; created_at?: string; collected_by_name?: string; validated_by_name?: string; test_names?: string; latest_review_status?: string; replacement_sample_uid?: string; replacement_status?: string; [key: string]: any };
type Worklist = { items: Sample[]; summary: Record<string, number>; pagination: { page: number; count: number; total: number; totalPages: number } };
const empty = (): Worklist => ({ items: [], summary: {}, pagination: { page: 1, count: 15, total: 0, totalPages: 0 } });
const words = (value?: string) => String(value || 'Not recorded').replace(/_/g, ' ');
const date = (value?: string) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not recorded';
const stateLabel = (sample: Sample) => sample.replacement_sample_uid ? `Replacement ${words(sample.replacement_status)}` : sample.latest_review_status === 'pending' ? 'Review pending' : sample.status === 'recollection_required' ? 'Recollection required' : 'Rejected';

export default function RejectedSamplesWorkspace() {
     const { applicationsettings } = useApplicationSettings();
     const user = applicationsettings?.user;
     const canDecide = roleAllowed(user?.role, ['admin', 'manager', 'scientist']);
     const canCollect = roleAllowed(user?.role, ['admin', 'manager', 'scientist', 'phlebotomist', 'phelobotomist']);
     const [data, setData] = useState<Worklist>(empty);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [query, setQuery] = useState('');
     const [filters, setFilters] = useState({ search: '', status: 'rejected_or_recollection', startDate: '', endDate: '', page: 1, count: 15 });
     const [selected, setSelected] = useState<Sample | null>(null);
     const [detail, setDetail] = useState<any>(null);
     const [detailLoading, setDetailLoading] = useState(false);
     const [detailError, setDetailError] = useState('');
     const [tab, setTab] = useState<'action' | 'history' | 'notifications'>('action');
     const [reviewReason, setReviewReason] = useState('');
     const [reviewNotes, setReviewNotes] = useState('');
     const [confirmation, setConfirmation] = useState<'usable' | 'rejection_upheld' | 'recollect' | null>(null);
     const [busy, setBusy] = useState(false);
     const [collect, setCollect] = useState<Sample | null>(null);
     const request = useRef(0), detailRequest = useRef(0), mutation = useRef(false);
     const load = useCallback(async () => {
          const generation = ++request.current;
          setLoading(true); setError('');
          try {
               const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])));
               const response = await customFetch(`physical-samples/worklists/samples?${params}`);
               if (generation !== request.current) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to load rejected samples.');
               const next = response.data as Worklist;
               if (filters.page > 1 && filters.page > Math.max(1, next.pagination.totalPages)) { setFilters(previous => ({ ...previous, page: Math.max(1, next.pagination.totalPages) })); return; }
               setData(next);
          } catch (e: any) { if (generation === request.current) setError(e.message || 'Unable to load rejected samples.'); }
          finally { if (generation === request.current) setLoading(false); }
     }, [filters]);
     useEffect(() => { void load(); return () => { request.current++; }; }, [load]);
     useEffect(() => () => { detailRequest.current++; }, []);
     const loadDetail = async (sample: Sample) => {
          const generation = ++detailRequest.current;
          setDetailLoading(true); setDetailError('');
          try {
               const response = await customFetch(`physical-samples/worklists/samples/${sample.id}`);
               if (generation !== detailRequest.current) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to load this container.');
               setDetail(response.data);
          } catch (e: any) { if (generation === detailRequest.current) setDetailError(e.message || 'Unable to load this container.'); }
          finally { if (generation === detailRequest.current) setDetailLoading(false); }
     };
     const open = (sample: Sample, nextTab: typeof tab = 'action') => { setSelected(sample); setDetail(null); setTab(nextTab); setReviewReason(''); setReviewNotes(''); setConfirmation(null); void loadDetail(sample); };
     const close = () => { if (mutation.current) return; detailRequest.current++; setSelected(null); setDetail(null); setDetailError(''); };
     const latestReview = detail?.reviews?.filter((review: any) => Number(review.sample_id) === Number(detail.id)).slice(-1)[0];
     const replacement = detail?.lineage?.filter((sample: Sample) => Number(sample.replaces_sample_id) === Number(detail.id)).slice(-1)[0];
     const independent = canDecide && latestReview?.status === 'pending' && Number(latestReview.requested_by) !== Number(user?.employeeid);
     const act = async (action: 'request' | 'usable' | 'rejection_upheld' | 'recollect') => {
          if (!detail || !selected || mutation.current) return;
          mutation.current = true; setBusy(true); setDetailError('');
          try {
               const endpoint = action === 'request' ? `physical-samples/${detail.id}/reviews` : action === 'recollect' ? `physical-samples/${detail.id}/recollect` : `physical-samples/${detail.id}/reviews/${latestReview.id}/decision`;
               const body = action === 'request' ? { reason: reviewReason.trim() } : action === 'recollect' ? {} : { decision: action, notes: reviewNotes.trim() };
               const response = await customFetchMutation(endpoint, 'POST', body);
               if (!response?.success) throw new Error(response?.message || 'Unable to save this action.');
               toast.success(action === 'request' ? 'Independent review requested.' : action === 'usable' ? 'Sample marked usable.' : action === 'rejection_upheld' ? 'Rejection upheld. Recollection is required.' : `Replacement ${response.data.sample_uid} started.`);
               setConfirmation(null); setReviewReason(''); setReviewNotes('');
               await Promise.all([load(), loadDetail(selected)]);
               if (action === 'recollect') setCollect(selected);
          } catch (e: any) { setDetailError(e.message || 'Unable to save this action.'); }
          finally { mutation.current = false; setBusy(false); }
     };
     const search = (event: FormEvent) => { event.preventDefault(); setFilters(previous => ({ ...previous, search: query.trim(), page: 1 })); };
     const hasFilters = !!filters.search || !!filters.startDate || !!filters.endDate || filters.status !== 'rejected_or_recollection';
     const reset = () => { setQuery(''); setFilters(previous => ({ ...previous, search: '', status: 'rejected_or_recollection', startDate: '', endDate: '', page: 1 })); };

     return <main className={styles.workspace}>
          <header className={styles.header}><div><div className={styles.eyebrow}>PHLEBOTOMY / SAMPLE EXCEPTIONS</div><h1>Rejected samples</h1><p>Resolve rejected containers, arrange independent review, and follow recollection through to completion.</p></div><div className={styles.headerActions}><Link href="/operations/phelobotomy/review-requests" className="btn btn-outline-secondary"><RiFileListLine size={17} /> Review requests</Link><button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={load}><RiRefreshLine size={17} className={loading ? styles.spin : ''} /> Refresh</button></div></header>
          <section className={styles.metrics} aria-label="Results in current filter"><article><span className={styles.metricIcon}><RiTestTubeLine size={21} /></span><div><span>Matching containers</span><strong>{loading ? '—' : data.pagination.total.toLocaleString()}</strong></div></article><article><span className={`${styles.metricIcon} ${styles.danger}`}><RiErrorWarningLine size={21} /></span><div><span>Rejected</span><strong>{loading ? '—' : (data.summary.rejected || 0).toLocaleString()}</strong></div></article><article><span className={`${styles.metricIcon} ${styles.warning}`}><RiRefreshLine size={21} /></span><div><span>Recollection required</span><strong>{loading ? '—' : (data.summary.recollection_required || 0).toLocaleString()}</strong></div></article></section>
          <section className={styles.panel} aria-label="Rejected sample worklist">
               <div className={styles.toolbar}><div><h2>Container worklist</h2><p>One row per physical container. Counts follow the current filters.</p></div><div className={styles.tabs} role="group" aria-label="Filter by sample status">{[['rejected_or_recollection', 'All rejected'], ['rejected', 'Rejected'], ['recollection_required', 'Recollection required']].map(([value, label]) => <button type="button" key={value} aria-pressed={filters.status === value} className={filters.status === value ? styles.active : ''} onClick={() => setFilters(previous => ({ ...previous, status: value, page: 1 }))}>{label}</button>)}</div></div>
               <div className={styles.filters}><form onSubmit={search} className={styles.search}><RiSearchLine size={19} /><input aria-label="Search patient, sample or billing order" placeholder="Patient name, patient ID, sample ID or billing number" value={query} onChange={e => setQuery(e.target.value)} /><button className="btn btn-sm btn-primary" type="submit">Search</button></form><label>Created from<input className="form-control form-control-sm" type="date" value={filters.startDate} max={filters.endDate || undefined} onChange={e => setFilters(previous => ({ ...previous, startDate: e.target.value, page: 1 }))} /></label><label>Created to<input className="form-control form-control-sm" type="date" value={filters.endDate} min={filters.startDate || undefined} onChange={e => setFilters(previous => ({ ...previous, endDate: e.target.value, page: 1 }))} /></label>{hasFilters && <button className="btn btn-sm btn-link" type="button" onClick={reset}>Clear filters</button>}</div>
               {error && <div className="alert alert-danger m-3 d-flex justify-content-between align-items-center gap-3" role="alert"><span>{error}</span><button className="btn btn-sm btn-outline-danger" onClick={load}>Retry</button></div>}
               <div className={styles.tableWrap} aria-busy={loading}>{loading ? <div className={styles.empty} role="status"><Spinner animation="border" size="sm" /><strong>Loading rejected samples</strong><span>Checking containers and their latest status.</span></div> : error ? null : !data.items.length ? <div className={styles.empty}><span className={styles.emptyIcon}><RiCheckLine size={30} /></span><h3>{hasFilters ? 'No samples match these filters' : 'No rejected samples'}</h3><p>{hasFilters ? 'Try another patient, date range or status.' : 'Rejected containers will appear here when they need review or recollection.'}</p>{hasFilters && <button className="btn btn-outline-primary" onClick={reset}>Clear filters</button>}</div> : <table className={styles.table}><thead><tr><th>Patient &amp; order</th><th>Container &amp; tests</th><th>Rejection details</th><th>Next step</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{data.items.map(sample => <tr key={sample.id}><td><strong>{sample.patient_name || `Patient ${sample.patientid}`}</strong><span>{sample.fullpatientid || `Patient #${sample.patientid}`}</span><small>Billing #{sample.billingid}</small></td><td><strong className={styles.sampleId}>{sample.sample_uid}</strong><span>{sample.sample_type_name || 'Unspecified specimen'} / {sample.container_type_name || 'Unspecified container'}</span><small>{sample.test_names || 'No test names recorded'}</small></td><td><div className={styles.reason}>{sample.rejection_reason || 'Rejection reason not recorded'}</div><small>{date(sample.rejected_at)}</small><small>{sample.validated_by_name ? `By ${sample.validated_by_name}` : 'Reviewer not recorded'}</small></td><td><span className={`${styles.badge} ${sample.replacement_sample_uid ? styles.neutralBadge : sample.latest_review_status === 'pending' ? styles.reviewBadge : sample.status === 'recollection_required' ? styles.warningBadge : styles.dangerBadge}`}>{stateLabel(sample)}</span>{sample.replacement_sample_uid && <small className="mt-2">{sample.replacement_sample_uid}</small>}</td><td className={styles.rowActions}><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => open(sample)}>Open case <RiArrowRightLine size={15} /></button><button type="button" className="btn btn-sm btn-link" onClick={() => open(sample, 'history')}><RiHistoryLine size={15} /> History</button></td></tr>)}</tbody></table>}</div>
               <footer className={styles.pagination}><span>{loading ? 'Loading results…' : data.pagination.total ? `${(filters.page - 1) * filters.count + 1}–${Math.min(filters.page * filters.count, data.pagination.total)} of ${data.pagination.total} containers` : '0 containers'}</span><div><label>Rows <select value={filters.count} onChange={e => setFilters(previous => ({ ...previous, count: Number(e.target.value), page: 1 }))}>{[15, 30, 50].map(count => <option key={count}>{count}</option>)}</select></label><button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || filters.page <= 1} onClick={() => setFilters(previous => ({ ...previous, page: previous.page - 1 }))}>Previous</button><span>{filters.page} / {Math.max(1, data.pagination.totalPages)}</span><button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || filters.page >= data.pagination.totalPages} onClick={() => setFilters(previous => ({ ...previous, page: previous.page + 1 }))}>Next</button></div></footer>
          </section>
          <Offcanvas show={!!selected} onHide={close} placement="end" backdrop="static" style={{ width: 'min(640px, 100vw)' }}><Offcanvas.Header closeButton={!busy}><div className={styles.drawerHeading}><span>REJECTED SAMPLE CASE</span><Offcanvas.Title>{selected?.sample_uid}</Offcanvas.Title><small>{selected?.patient_name || `Patient ${selected?.patientid}`} · Billing #{selected?.billingid}</small></div></Offcanvas.Header><Offcanvas.Body className={styles.drawerBody}>
               {detailLoading ? <div className={styles.empty} role="status"><Spinner animation="border" size="sm" /><span>Loading container history…</span></div> : <>
                    {detailError && <div className="alert alert-danger" role="alert">{detailError}{!detail && <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => selected && loadDetail(selected)}>Retry</button>}</div>}
                    {detail && <><div className={styles.caseSummary}><div><strong>{detail.sample_type_name || 'Specimen'} / {detail.container_type_name || 'Container'}</strong><span className={styles.badge}>{words(detail.status)}</span></div><p>{detail.tests?.map((test: any) => test.testName).join(', ') || 'No linked tests recorded'}</p><div className={styles.reason}><strong>Rejection reason</strong><p className="mb-0 mt-1">{detail.rejection_reason || 'No reason recorded'}</p></div></div><div className={`${styles.tabs} ${styles.drawerTabs}`} role="group" aria-label="Case sections">{[['action', 'Next action'], ['history', 'History'], ['notifications', 'Patient notifications']].map(([value, label]) => <button key={value} type="button" aria-pressed={tab === value} className={tab === value ? styles.active : ''} onClick={() => setTab(value as typeof tab)}>{label}</button>)}</div>
                    {tab === 'action' && <section className={styles.actionSection}>
                         {replacement ? <><h3>Replacement already started</h3><p>{replacement.sample_uid} is <strong>{words(replacement.status)}</strong>. Continue the existing recollection instead of creating another container.</p><button className="btn btn-primary" onClick={() => selected && setCollect(selected)}>Open collection</button></> : ['accepted', 'received'].includes(detail.status) ? <div className="alert alert-success"><strong>Case resolved</strong><p className="mb-0">This container is now {words(detail.status)}. The worklist has been refreshed.</p></div> : <>
                         {detail.status === 'rejected' && latestReview?.status !== 'pending' && <><h3>Request an independent review</h3><p>Ask another scientist to assess whether the existing sample can be used.</p><label className="form-label" htmlFor="rejection-review-reason">Reason for review</label><textarea id="rejection-review-reason" className="form-control" rows={3} maxLength={1000} disabled={busy} value={reviewReason} onChange={e => setReviewReason(e.target.value)} placeholder="Explain why this rejection needs another assessment" /><button type="button" className="btn btn-primary mt-3" disabled={busy || !canCollect || reviewReason.trim().length < 3} onClick={() => act('request')}>Request review</button></>}
                         {latestReview?.status === 'pending' && <><h3>Independent review pending</h3><p>Requested by {latestReview.requested_by_name || `Employee ${latestReview.requested_by}`} on {date(latestReview.requested_at)}.</p>{latestReview.request_reason && <blockquote className={styles.quote}>{latestReview.request_reason}</blockquote>}{independent ? <><label className="form-label" htmlFor="rejection-review-notes">Review findings</label><textarea id="rejection-review-notes" className="form-control" rows={3} maxLength={2000} disabled={busy} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Record your findings before making a decision" /><div className="d-flex flex-wrap gap-2 mt-3"><button className="btn btn-outline-danger" disabled={busy || !reviewNotes.trim()} onClick={() => setConfirmation('rejection_upheld')}>Uphold rejection</button><button className="btn btn-success" disabled={busy || !reviewNotes.trim()} onClick={() => setConfirmation('usable')}>Mark sample usable</button></div></> : <div className="alert alert-info">{Number(latestReview.requested_by) === Number(user?.employeeid) ? 'A different scientist must make this decision. You cannot approve your own review request.' : 'An authorized scientist must make the review decision.'}<Link className="d-block mt-2" href="/operations/phelobotomy/review-requests">View review requests</Link></div>}</>}
                         {canCollect && ['rejected', 'recollection_required'].includes(detail.status) && <div className={styles.recollectSection}><h3>{detail.status === 'recollection_required' ? 'Collect a replacement sample' : 'Recollect instead'}</h3><p>A replacement receives a new sample ID. The rejected container and its history are preserved.</p><button className="btn btn-outline-primary" disabled={busy} onClick={() => setConfirmation('recollect')}><RiRefreshLine size={16} /> Start recollection</button></div>}
                         </>}
                         {confirmation && <div className={styles.confirmation} role="alert"><strong>{confirmation === 'usable' ? 'Mark this sample as usable?' : confirmation === 'rejection_upheld' ? 'Confirm that recollection is required?' : 'Create a replacement container?'}</strong><p>{confirmation === 'usable' ? 'Your decision restores the sample for the laboratory workflow and is recorded in its history.' : confirmation === 'rejection_upheld' ? 'The current sample remains rejected and a new sample will be needed.' : 'This starts recollection. Complete collection only after the replacement sample has been taken.'}</p><div className="d-flex gap-2"><button className="btn btn-primary" disabled={busy} onClick={() => act(confirmation)}>{busy ? 'Saving…' : 'Confirm'}</button><button className="btn btn-outline-secondary" disabled={busy} onClick={() => setConfirmation(null)}>Cancel</button></div></div>}
                    </section>}
                    {tab === 'history' && <section className={styles.actionSection}><h3>Specimen history</h3><p>Rejection, review and replacement events are retained together.</p><ol className={styles.timeline}>{detail.events?.map((event: any) => <li key={event.id} data-tone={sampleEventTone(event.event_type)}><strong>{words(event.event_type)}</strong><small>{event.sample_uid} · {date(event.created_at)}</small><span>{event.actor_name || `Employee ${event.actor_employeeid}`}</span>{event.reason && <p>{event.reason}</p>}</li>)}</ol>{!detail.events?.length && <p>No history recorded.</p>}</section>}
                    {tab === 'notifications' && <section className={styles.actionSection}><h3>Patient notifications</h3><p>Track communication associated with this rejection and its replacements.</p>{detail.communications?.length ? detail.communications.map((message: any) => <article className={styles.communication} key={message.id}><div><strong>{message.sample_uid || detail.sample_uid}</strong><span className={styles.badge}>{words(message.status)}</span></div><p>{message.message}</p><small>{date(message.created_at)}</small>{message.attempts?.map((attempt: any) => <div className={styles.attempt} key={attempt.id}><strong>{words(attempt.channel)}: {words(attempt.status)}</strong><span>{attempt.recipient_masked}</span>{attempt.failure_reason && <span className="text-danger">{attempt.failure_reason}</span>}</div>)}</article>) : <div className={styles.emptyInline}><RiFileListLine size={25} /><strong>No notifications requested</strong><span>No patient message has been requested for this specimen chain.</span></div>}</section>}
                    </>}
               </>}
          </Offcanvas.Body><div className={styles.drawerFooter}><span>All review and recollection actions are audited.</span><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={close}>Close case</button></div></Offcanvas>
          {collect && <CollectionSampleModal show hide={() => { setCollect(null); void load(); if (selected) void loadDetail(selected); }} collection={{ billingid: collect.billingid, patientid: collect.patientid, fullname: collect.patient_name }} employeeid={Number(user?.employeeid)} removeCollectedSample={() => { void load(); if (selected) void loadDetail(selected); }} />}
     </main>;
}
