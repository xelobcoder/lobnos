'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { roleAllowed } from '../Auth/roles';

export type RecollectionSample = {
     id: number; sample_uid: string; status: string; version?: number;
     rejection_reason?: string; replaces_sample_id?: number | null;
     tests?: Array<{ ascensionId: number; testName: string }>;
};
type Props = { billingid: number; ascensionId?: number; samples?: RecollectionSample[]; onChanged?: () => void | Promise<void>; compact?: boolean };
type Scope = Pick<Props, 'billingid' | 'ascensionId'> & { suppliedSamples?: RecollectionSample[] };

function requestKey(): string {
     if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
     if (typeof globalThis.crypto?.getRandomValues !== 'function') throw new Error('Secure request identifiers are unavailable in this browser.');
     return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join('');
}
const label = (value: unknown) => String(value || 'Not recorded').replace(/_/g, ' ');
const when = (value: string) => value ? new Date(value).toLocaleString() : 'Not recorded';
const channels = (value: unknown) => {
     if (Array.isArray(value)) return value.join(', ') || 'None';
     try { return JSON.parse(String(value || '[]')).join(', ') || 'None'; } catch { return 'Not recorded'; }
};

export default function SpecimenRecollectionPanel({ billingid, ascensionId, samples: suppliedSamples, onChanged, compact = false }: Props) {
     const { applicationsettings } = useApplicationSettings();
     const canCollect = roleAllowed(applicationsettings?.user?.role, ['admin', 'manager', 'scientist', 'phelobotomist', 'phlebotomist']);
     const [samples, setSamples] = useState<RecollectionSample[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [busyId, setBusyId] = useState<number | null>(null);
     const [history, setHistory] = useState<any>(null);
     const [historyLoading, setHistoryLoading] = useState(false);
     const scopeRef = useRef<Scope | null>(null);
     const historyRequest = useRef(0);
     if (!scopeRef.current || scopeRef.current.billingid !== billingid || scopeRef.current.ascensionId !== ascensionId || scopeRef.current.suppliedSamples !== suppliedSamples) {
          scopeRef.current = { billingid, ascensionId, suppliedSamples };
     }
     const scope = scopeRef.current;
     const [loadedScope, setLoadedScope] = useState<Scope | null>(null);
     const isCurrent = () => scopeRef.current === scope;
     useEffect(() => () => { scopeRef.current = null; historyRequest.current++; }, []);

     const load = useCallback(async () => {
          if (!isCurrent()) return;
          if (suppliedSamples) { setSamples(suppliedSamples); setError(''); setLoadedScope(scope); return; }
          if (!Number.isInteger(billingid) || billingid <= 0) return;
          setLoading(true); setError('');
          try {
               const response = await customFetch(`physical-samples/candidates?billingid=${billingid}`);
               if (!isCurrent()) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to load specimen history.');
               setSamples(response.data?.samples || []);
          } catch (requestError: any) { if (isCurrent()) setError(requestError?.message || 'Unable to load specimen history.'); }
          finally { if (isCurrent()) { setLoading(false); setLoadedScope(scope); } }
     }, [scope]);
     useEffect(() => { historyRequest.current++; setHistory(null); setHistoryLoading(false); setBusyId(null); load(); }, [load]);

     const related = samples.filter(sample => !ascensionId || sample.tests?.some(test => Number(test.ascensionId) === Number(ascensionId)));
     const chain = related.filter(sample => ['rejected', 'recollection_required'].includes(sample.status) || sample.replaces_sample_id);
     const openHistory = async (sampleId: number) => {
          const requestId = ++historyRequest.current;
          const currentRequest = () => isCurrent() && historyRequest.current === requestId;
          setHistory(null);
          setHistoryLoading(true);
          try {
               const response = await customFetch(`physical-samples/worklists/samples/${sampleId}`);
               if (!currentRequest()) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to load specimen history.');
               setHistory(response.data);
          } catch (requestError: any) { if (currentRequest()) toast.error(requestError?.message || 'Unable to load specimen history.'); }
          finally { if (currentRequest()) setHistoryLoading(false); }
     };
     const change = async (sample: RecollectionSample, action: 'recollect' | 'complete') => {
          if (!isCurrent() || !Number.isInteger(billingid) || billingid <= 0) return;
          historyRequest.current++; setHistory(null); setHistoryLoading(false);
          setBusyId(sample.id);
          try {
               const response = await customFetchMutation(`physical-samples/${sample.id}/${action === 'recollect' ? 'recollect' : 'status'}`, action === 'recollect' ? 'POST' : 'PATCH', action === 'recollect' ? {} : { status: 'collected', expectedVersion: sample.version, idempotencyKey: requestKey() });
               if (!isCurrent()) return;
               if (!response?.success) throw new Error(response?.message || 'Unable to record recollection.');
               toast.success(action === 'recollect' ? `Replacement ${response.data.sample_uid} started. Complete collection when the sample has been taken.` : `${sample.sample_uid} collected. Reception and validation are still required.`);
               setHistory(null);
               await onChanged?.();
               if (!isCurrent()) return;
               // Keep the local view current even when its parent supplied the old list.
               const fresh = await customFetch(`physical-samples/candidates?billingid=${billingid}`);
               if (!isCurrent()) return;
               if (fresh?.success) setSamples(fresh.data?.samples || []); else await load();
          } catch (requestError: any) { if (isCurrent()) toast.error(requestError?.message || 'Unable to record recollection.'); }
          finally { if (isCurrent()) setBusyId(null); }
     };

     if (!Number.isInteger(billingid) || billingid <= 0) return null;
     if (loading || loadedScope !== scope) return <p className="small text-muted" role="status">Loading specimen history...</p>;
     if (error) return <div className="alert alert-danger py-2">{error}<button className="btn btn-sm btn-outline-danger ms-2" onClick={load}>Retry</button></div>;
     if (!chain.length) return null;
     return <section className="border border-warning rounded p-3 mb-3" aria-label="Rejected specimens and recollection">
          <h2 className={compact ? 'h6' : 'h5'}>Rejected specimens &amp; recollection</h2>
          <p className="small text-muted">Each replacement has its own sample ID. Processing stays blocked until the replacement meets the laboratory workflow requirements.</p>
          <div className="d-flex flex-column gap-2">{chain.map(sample => {
               const replacement = related.find(item => Number(item.replaces_sample_id) === Number(sample.id));
               const original = related.find(item => Number(item.id) === Number(sample.replaces_sample_id));
               const rejected = ['rejected', 'recollection_required'].includes(sample.status);
               return <article className="border rounded p-2 bg-body" key={sample.id}>
                    <div className="d-flex flex-wrap justify-content-between gap-2"><strong>{sample.sample_uid}</strong><span className={`text-capitalize fw-semibold ${rejected ? 'text-danger' : 'text-primary'}`}>{label(sample.status)}</span></div>
                    {sample.rejection_reason && <p className="small text-danger mb-1">Rejection reason: {sample.rejection_reason}</p>}
                    {original && <div className="small text-muted">Replaces {original.sample_uid}</div>}
                    {replacement && <div className="small">Replacement: {replacement.sample_uid} ({label(replacement.status)})</div>}
                    <div className="d-flex flex-wrap gap-2 mt-2">
                         {canCollect && rejected && !replacement && <button className="btn btn-sm btn-warning" disabled={busyId !== null} onClick={() => change(sample, 'recollect')}>{busyId === sample.id ? 'Starting...' : 'Recollect sample'}</button>}
                         {canCollect && sample.replaces_sample_id && sample.status === 'collection_started' && <button className="btn btn-sm btn-success" disabled={busyId !== null} onClick={() => change(sample, 'complete')}>{busyId === sample.id ? 'Saving...' : 'Complete recollection'}</button>}
                         <button className="btn btn-sm btn-outline-secondary" disabled={historyLoading} onClick={() => openHistory(sample.id)}>History &amp; notifications</button>
                    </div>
               </article>;
          })}</div>
          {history && <div className="border-top mt-3 pt-3" aria-label="Recollection history">
               <div className="d-flex justify-content-between gap-2"><h3 className="h6">Complete specimen history</h3><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { historyRequest.current++; setHistory(null); setHistoryLoading(false); }}>Hide history</button></div>
               {(history.lineage || [history]).map((item: any) => <div className="small mb-2" key={item.id}><strong>{item.sample_uid}</strong>: <span className="text-capitalize">{label(item.status)}</span>{item.rejection_reason ? ` — ${item.rejection_reason}` : ''}</div>)}
               <ol className="small ps-3">{history.events?.map((event: any) => <li className="mb-2" key={event.id}><strong>{event.sample_uid || history.sample_uid}</strong> · <span className="text-capitalize">{label(event.event_type)}</span><div className="text-muted">{when(event.created_at)} · {event.actor_name || `Employee ${event.actor_employeeid}`}</div>{event.reason && <div>{event.reason}</div>}</li>)}</ol>
               <h3 className="h6 mt-3">Patient notifications</h3>
               {history.communications?.length ? history.communications.map((communication: any) => <div className="border rounded p-2 small mb-2" key={communication.id}><strong>{communication.sample_uid || history.sample_uid}</strong><div>Requested: <span className="text-capitalize">{channels(communication.requested_channels)}</span> · <span className="text-capitalize">{label(communication.status)}</span></div><div>{communication.message}</div>{communication.attempts?.map((attempt: any) => <div key={attempt.id} className="text-capitalize">{attempt.channel}: {label(attempt.status)} {attempt.recipient_masked || ''}{attempt.failure_reason && <span className="text-danger"> — {attempt.failure_reason}</span>}</div>)}</div>) : <p className="small text-muted">No patient notification was requested.</p>}
          </div>}
     </section>;
}
