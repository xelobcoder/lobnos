'use client';
import { useEffect, useRef, useState } from 'react';
import { useUnsavedClinicalChanges } from './clinicalDraft';
import { clinicalApi, observationFields, recorded, observedTime } from './clinicalApi';
import s from './Practitioner.module.css';
const blank = () => Object.fromEntries(observationFields.map(([key]) => [key, '']));
export default function VitalSigns({ patientid, encounterId, onRecorded, readOnly = false }: {
    patientid: number;
    encounterId?: number | null;
    onRecorded?: () => void;
    readOnly?: boolean;
}) {
    const [audit, setAudit] = useState<any>(null);
    const auditRequest = useRef(0);
    const [from, setFrom] = useState(''), [to, setTo] = useState(''), [metric, setMetric] = useState('temperature');
    const [rows, setRows] = useState<any[]>([]), [form, setForm] = useState<any>(blank), [missing, setMissing] = useState(''), [observed, setObserved] = useState(''), [reason, setReason] = useState(''), [editing, setEditing] = useState<any>(null), [page, setPage] = useState(1), [total, setTotal] = useState(0), [error, setError] = useState(''), [success, setSuccess] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [retry, setRetry] = useState(0);
    const lock = useRef(false);
    useUnsavedClinicalChanges(!readOnly && (Object.values(form).some(value => value !== '' && value != null) || !!missing || !!observed || !!reason));
    useEffect(() => { let live = true; setLoading(true); clinicalApi(`patients/${patientid}/vitals?page=${page}&count=10&filterFrom=${from}&filterTo=${to}`).then(result => { if (live) {
        setRows(result.data);
        setTotal(result.total);
        setError('');
    } }).catch(e => { if (live)
        setError(e.message); }).finally(() => { if (live)
        setLoading(false); }); return () => { live = false; }; }, [patientid, page, retry, from, to]);
    async function submit() { if (lock.current)
        return; lock.current = true; setBusy(true); setError(''); setSuccess(''); try {
        await clinicalApi(`patients/${patientid}/vitals${editing ? `/${editing.vitalsignid}` : ''}`, editing ? 'PUT' : 'POST', { ...form, missing_reason: missing, encounter_id: editing ? editing.encounter_id ?? null : encounterId || null, observed_at: !editing && observed ? new Date(observed).toISOString() : undefined, revision: editing?.revision, reason });
        setForm(blank());
        setMissing('');
        setReason('');
        setEditing(null);
        setObserved('');
        setSuccess('Observation saved in the patient record.');
        setRetry(retry + 1);
        onRecorded?.();
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    function correct(row: any) { const bp = String(row.bp || '').split('/'); setForm({ ...blank(), blood_pressure_upperLimit: bp[0] || '', blood_pressure_lowerLimit: bp[1] || '', ...Object.fromEntries(observationFields.filter(([k]) => !k.startsWith('blood_')).map(([k]) => [k, row[k] ?? ''])) }); setMissing(row.missing_reason || ''); setEditing(row); setReason(''); setError(''); setSuccess(''); }
    return <section><header className={s.sectionHeader}><div><h2>Vital signs & measurements</h2><p>Units are shown for every observation. Blank values remain “Not recorded”.</p></div><button className={s.secondary} onClick={() => setRetry(retry + 1)}>Refresh observations</button></header>{error && <div role="alert" className={s.error}>{error}</div>}{success && <p role="status" className={s.success}>{success}</p>}
 {!readOnly && <form onSubmit={e => { e.preventDefault(); void submit(); }}><fieldset disabled={busy}><h3>{editing ? 'Correct an observation' : 'Record observations'}</h3><div className={s.vitalGrid}>{observationFields.map(([key, label, unit]) => <label className={s.field} key={key}>{label} ({unit})<input aria-label={`${label} (${unit})`} type="number" step={["pulse", "respiration", "spo2"].includes(key) ? "1" : "0.01"} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}/></label>)}</div><div className={s.twoColumns}>{!editing && <label className={s.field}>Observation date & time<input type="datetime-local" value={observed} onChange={e => setObserved(e.target.value)}/><small>Leave blank to use the current time.</small></label>}<label className={s.field}>Reason for measurements not recorded<input maxLength={500} value={missing} onChange={e => setMissing(e.target.value)} placeholder="Required when any core observation is missing"/></label></div>{editing && <label className={s.field}>Correction reason *<textarea required minLength={3} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></label>}<div className={s.actions}><button className={s.primary} type="submit">{busy ? 'Saving…' : editing ? 'Save audited correction' : 'Save observations'}</button>{editing && <button className={s.secondary} type="button" onClick={() => { setEditing(null); setForm(blank()); setMissing(''); setReason(''); }}>Cancel correction</button>}</div></fieldset></form>}
 <h3>Observation history</h3><div className={s.twoColumns}><label className={s.field}>Observed from<input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}/></label><label className={s.field}>Observed to<input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}/></label></div><p className={s.help}>Measurements are displayed without automatic clinical interpretation. Use the patient’s age and clinical context when reviewing them.</p>{loading ? <p role="status">Loading observations…</p> : <><VitalTrend rows={rows} metric={metric} setMetric={setMetric}/><div className={s.tableWrap}><table><thead><tr><th>Observed</th><th>BP (mmHg)</th><th>Temp (°C)</th><th>Pulse (bpm)</th><th>Resp (/min)</th><th>SpO₂ (%)</th><th>Weight / height</th><th /></tr></thead><tbody>{rows.map(row => <tr key={row.vitalsignid}><td>{observedTime(row)}<small>{row.observer_name || `${row.observer_type || 'Historical observer'} #${row.employeeid || 'unknown'}`}</small><small>{row.corrected_at ? `Corrected ${new Date(row.corrected_at).toLocaleString('en-GB')}` : ''}</small>{row.missing_reason && <small>Not recorded: {row.missing_reason}</small>}</td><td>{recorded(row.bp)}</td><td>{recorded(row.temperature)}</td><td>{recorded(row.pulse)}</td><td>{recorded(row.respiration)}</td><td>{recorded(row.spo2)}</td><td>{recorded(row.weight_kg)} kg / {recorded(row.height_cm)} cm</td><td><button className={s.textButton} onClick={async () => { const request = ++auditRequest.current; try {
        const events = await clinicalApi(`patients/${patientid}/vitals/${row.vitalsignid}/history`);
        if (request === auditRequest.current)
            setAudit({ id: row.vitalsignid, events: Array.isArray(events) ? events : [] });
    }
    catch (e: any) {
        setError(e.message);
    } }}>View history</button>{!readOnly && row.canCorrect && <button className={s.secondary} onClick={() => correct(row)}>Correct</button>}</td></tr>)}</tbody></table></div>{!rows.length && <p className={s.empty}>No observations recorded.</p>}<div className={s.actions}><span>{total} observations</span><button className={s.secondary} disabled={page === 1} onClick={() => setPage(page - 1)}>Previous observations</button><button className={s.secondary} disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>Next observations</button></div></>}{audit && <section className={s.notice} aria-label="Observation correction history"><div className={s.sectionHeader}><h3>Observation #{audit.id} · History</h3><button className={s.secondary} onClick={() => setAudit(null)}>Close observation history</button></div>{audit.events.map((event: any) => { let details: any = {}; try {
        details = typeof event.details === 'string' ? JSON.parse(event.details) : event.details || {};
    }
    catch { } return <div key={event.id} className={s.historyRow}><div><strong>{event.action} · {new Date(event.created_at).toLocaleString('en-GB')}</strong><span>{event.actor_type} #{event.actor_id}{details.reason ? ' · ' + details.reason : ''}</span>{details.before && <small>Previous values: {['bp', 'temperature', 'pulse', 'respiration', 'spo2', 'weight_kg', 'height_cm'].map(key => key + ': ' + recorded(details.before[key])).join(' · ')}</small>}</div></div>; })}{!audit.events.length && <p>No electronic correction history exists for this historical observation.</p>}</section>}</section>;
}
function VitalTrend({ rows, metric, setMetric }: {
    rows: any[];
    metric: string;
    setMetric: (value: string) => void;
}) { const label = observationFields.find(([key]) => key === metric); const ordered = [...rows].reverse(); const values = ordered.map(row => row[metric] == null || row[metric] === '' ? null : Number(row[metric])); const measured = values.filter((v): v is number => v !== null && Number.isFinite(v)); if (!measured.length)
    return null; const min = Math.min(...measured), max = Math.max(...measured), span = max - min || 1; const point = (i: number, v: number) => ({ x: 45 + i * 510 / Math.max(1, values.length - 1), y: 150 - (v - min) * 110 / span }); return <figure className={s.trend}><label className={s.field}>Trend measurement<select value={metric} onChange={e => setMetric(e.target.value)}>{observationFields.filter(([key]) => !key.startsWith('blood_')).map(([key, name, unit]) => <option key={key} value={key}>{name} ({unit})</option>)}</select></label><svg viewBox="0 0 600 190" role="img" aria-label={`${label?.[1]} observations on this page`}><title>{label?.[1]} observations on this page</title><line x1="40" x2="570" y1="155" y2="155" stroke="currentColor" opacity=".2"/><text x="5" y="40" fontSize="12">{max}</text><text x="5" y="155" fontSize="12">{min}</text>{values.map((v, i) => { if (v === null || !Number.isFinite(v))
    return null; const p = point(i, v), previous = values[i - 1], a = previous != null ? point(i - 1, previous) : null; return <g key={i}>{a && <line x1={a.x} y1={a.y} x2={p.x} y2={p.y} stroke="var(--care-primary,#2e7d32)" strokeWidth="2"/>}<circle cx={p.x} cy={p.y} r="4" fill="var(--care-primary,#2e7d32)"><title>{observedTime(ordered[i])}: {v} {label?.[2]}</title></circle></g>; })}<text x="45" y="180" fontSize="12">Earlier</text><text x="530" y="180" fontSize="12">Later</text></svg><figcaption className={s.help}>This page’s observations. The vertical scale follows the recorded values; gaps indicate missing measurements.</figcaption></figure>; }
