'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { plsDecryption, plsEncryption } from '../../lib/encryption';
import { useUnsavedClinicalChanges } from './clinicalDraft';
import { clinicalApi, recorded, observedTime } from './clinicalApi';
import VitalSigns from './VitalSigns';
import ClinicalOrders from './ClinicalOrders';
import s from './Practitioner.module.css';
export default function ConsultationWorkbench({ clientid }: {
    clientid: string;
}) {
    const router = useRouter(), params = useSearchParams(), initial = params.get('consultationid');
    let patientid = 0;
    try {
        patientid = Number(/^\d+$/.test(clientid) ? clientid : plsDecryption(clientid));
    }
    catch { }
    const [discard, setDiscard] = useState(false);
    const [labDirty, setLabDirty] = useState(false), [rxDirty, setRxDirty] = useState(false);
    const [patient, setPatient] = useState<any>(null), [caps, setCaps] = useState<any>(null), [encounter, setEncounter] = useState<any>(null), [notes, setNotes] = useState(''), [type, setType] = useState('OPD New Cases'), [reason, setReason] = useState(''), [dirty, setDirty] = useState(false), [tab, setTab] = useState('notes'), [latest, setLatest] = useState<any>(null), [history, setHistory] = useState<any[]>([]), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState(''), [reload, setReload] = useState(0), [confirmSign, setConfirmSign] = useState(false), [legacyPractitioner, setLegacyPractitioner] = useState(''), [legacyReason, setLegacyReason] = useState(''), [practitioners, setPractitioners] = useState<any[]>([]);
    const lock = useRef(false), key = useRef(''), dirtyRef = useRef(false);
    dirtyRef.current = dirty;
    useEffect(() => { key.current = crypto.randomUUID(); }, []);
    function hydrate(row: any) { setEncounter(row); setNotes(row.consultation_notes ?? row.progress_report ?? ''); setType(row.record_type); setDirty(false); setReason(''); setConfirmSign(false); }
    useEffect(() => { let live = true; if (!patient || !encounter || Number(initial) !== Number(encounter.id) || reload > 0)
        setLoading(true); if (!Number.isSafeInteger(patientid) || patientid <= 0) {
        setError('This patient link is invalid. Return to the consultation workspace.');
        setLoading(false);
        return;
    } clinicalApi('capabilities').then(c => Promise.all([clinicalApi(`patients/${patientid}`), Promise.resolve(c), clinicalApi(`patients/${patientid}/vitals?count=1&page=1`), c.consultationsEnabled ? clinicalApi(`encounters?patientid=${patientid}&page=1`) : Promise.resolve({ data: [] }), initial && c.consultationsEnabled ? clinicalApi(`encounters/${initial}`) : Promise.resolve(null)])).then(([p, c, v, h, e]) => { if (!live)
        return; if (e && Number(e.patientid) !== patientid)
        throw Error('This consultation does not belong to the selected patient'); setPatient(p); setCaps(c); if (!c.consultationsEnabled)
        setTab(c.canLab ? 'lab' : c.canPrescribe ? 'prescription' : 'vitals'); setLatest(v.data[0] || null); setHistory(h.data); if (e && (!dirtyRef.current || (window as any).__clinicalDiscardApproved)) {
        (window as any).__clinicalDiscardApproved = false;
        hydrate(e);
    } setError(''); if (c.canManage)
        clinicalApi('practitioners').then(rows => { if (live)
            setPractitioners(rows); }).catch(() => { }); }).catch(e => { if (live)
        setError(e.message); }).finally(() => { if (live)
        setLoading(false); }); return () => { live = false; }; }, [patientid, initial, reload]);
    const hasPending = dirty || labDirty || rxDirty;
    useUnsavedClinicalChanges(hasPending);
    async function start() { if (lock.current)
        return; lock.current = true; setBusy(true); setError(''); try {
        const row = await clinicalApi('encounters', 'POST', { patientid, requestKey: key.current, associatedTransactionid: params.get('serviceid') ? Number(params.get('serviceid')) : null });
        hydrate(row);
        router.replace(`/doctor/consultation/${clientid}?consultationid=${row.id}`);
        setMessage('Draft started. Save your notes, then sign when complete.');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    async function save(action: string) { if (lock.current || !encounter)
        return; lock.current = true; setBusy(true); setError(''); setMessage(''); try {
        const row = await clinicalApi(`encounters/${encounter.id}`, 'PUT', { consultation_notes: notes, record_type: type, revision: encounter.revision, action, reason });
        hydrate({ ...encounter, ...row });
        setMessage(action === 'save' ? 'Draft saved.' : action === 'sign' ? 'Consultation signed. Future changes require an amendment.' : 'Amendment saved with its reason and previous version.');
    }
    catch (e: any) {
        setError(e.message);
        setConfirmSign(false);
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    const tabs = [...(caps?.consultationsEnabled ? [['notes', 'Consultation']] : []), ['vitals', 'Vital signs'], ...(caps?.canLab ? [['lab', 'Lab referral']] : []), ...(caps?.canPrescribe ? [['prescription', 'Prescription']] : []), ...(caps?.consultationsEnabled ? [['history', 'History']] : [])];
    const canEdit = !!caps?.canConsult && (encounter?.canEdit ?? !!encounter);
    const changeTab = (next: string) => { setTab(next); setConfirmSign(false); };
    useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && canEdit && encounter) {
        event.preventDefault();
        if (encounter.encounter_status === 'signed') {
            if (dirty && reason.trim().length >= 3)
                void save('amend');
            else if (dirty)
                setError('Add an amendment reason before saving a signed note.');
        }
        else if (dirty)
            void save('save');
    } }; document.addEventListener('keydown', shortcut); return () => document.removeEventListener('keydown', shortcut); }, [encounter, notes, type, reason, dirty, busy, canEdit]);
    return <main className={s.page}><header className={s.heading}><div><span className={s.eyebrow}>PATIENT CARE</span><h1>{patient ? [patient.firstname, patient.middlename, patient.lastname].filter(Boolean).join(' ') : 'Patient workbench'}</h1><p>{patient?.fullpatientid} {patient?.gender ? `· ${patient.gender}` : ''} {patient?.dob ? `· DOB ${new Date(patient.dob).toLocaleDateString('en-GB')}` : ''}</p></div><Link className={s.secondary} href="/doctor/consultation">All consultations</Link></header>{error && <div role="alert" className={s.error}>{error}<button className={s.secondary} onClick={() => { if (!(window as any).__clinicalUnsaved || window.confirm('Discard unsaved clinical changes and reload the saved record?')) {
        setDirty(false);
        setReload(reload + 1);
    } }}>Reload saved record</button></div>}{message && <p role="status" className={s.success}>{message}</p>}
 {loading ? <p role="status">Loading the patient record…</p> : patient && <><section className={s.vitalStrip} aria-label="Latest vital signs"><div><strong>Latest observations</strong><small>{latest ? observedTime(latest) : 'No observations recorded'}</small></div>{[['BP', latest?.bp, 'mmHg'], ['Temperature', latest?.temperature, '°C'], ['Pulse', latest?.pulse, 'bpm'], ['SpO₂', latest?.spo2, '%']].map(([label, value, unit]) => <div key={label}><span>{label}</span><strong>{recorded(value)} {value != null ? unit : ''}</strong></div>)}<button className={s.secondary} onClick={() => changeTab('vitals')}>Record / review vitals</button></section>
 <div className={s.encounterBar}><span>{encounter ? <><strong>Consultation #{encounter.id}</strong> · {encounter.encounter_status} · Revision {encounter.revision}{dirty ? ' · Unsaved changes' : ''}</> : 'No consultation started'}</span>{!encounter && caps?.canConsult && <button className={s.primary} disabled={busy} onClick={() => void start()}>{busy ? 'Starting…' : 'Start consultation'}</button>}</div><nav className={s.tabs} aria-label="Patient workspace">{tabs.map(([key, label]) => <button key={key} aria-pressed={tab === key} onClick={() => changeTab(key)}>{label}</button>)}</nav>
 <section className={s.panel} hidden={tab !== 'notes'}><div className={s.sectionHeader}><div><h2>Consultation note</h2><p>Document the history, examination, assessment and care plan.</p></div>{encounter?.signed_at && <span className={s.badge}>Signed {new Date(encounter.signed_at).toLocaleString('en-GB')}</span>}</div>{!encounter ? <p className={s.empty}>{caps?.canConsult ? 'Choose “Start consultation” to begin a draft. Opening this page does not create a record.' : 'Your account can review this patient but cannot sign consultations.'}</p> : <><fieldset disabled={busy || !canEdit}><label className={s.field}>Encounter type<select aria-label="Encounter type" value={type} onChange={e => { setType(e.target.value); setDirty(true); }}>{['OPD New Cases', 'In-Process (Today)', 'IPD Review', 'Old Record'].map(v => <option key={v}>{v}</option>)}</select></label><label className={s.field}>Clinical notes<textarea aria-label="Clinical notes" className={s.noteEditor} value={notes} placeholder={'Presenting complaint & history\n\nExamination\n\nAssessment\n\nPlan & follow-up'} onChange={e => { setNotes(e.target.value); setDirty(true); setMessage(''); }}/></label>{encounter.encounter_status === 'signed' && <label className={s.field}>Amendment reason *<textarea aria-label="Amendment reason *" minLength={3} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></label>}</fieldset>{canEdit && <div className={s.saveBar}><span role="status">{dirty ? 'Unsaved changes' : 'Saved version loaded'} · Ctrl/⌘+S saves notes</span>{encounter.encounter_status === 'signed' ? <button className={s.primary} disabled={busy || !dirty || reason.trim().length < 3} onClick={() => void save('amend')}>Save amendment</button> : <><button className={s.secondary} disabled={busy} onClick={() => setDiscard(true)}>Discard draft</button><button className={s.secondary} disabled={busy || !dirty} onClick={() => void save('save')}>Save draft</button><button className={s.primary} disabled={busy || !notes.trim()} onClick={() => setConfirmSign(true)}>Review & sign</button></>}</div>}{discard && <div className={s.notice}><p>Discard this unsigned consultation draft? The discard is recorded. Drafts with saved orders must be retained.</p><div className={s.actions}><button className={s.secondary} disabled={busy} onClick={() => setDiscard(false)}>Keep draft</button><button className={s.primary} disabled={busy} onClick={async () => { if (lock.current)
                return; lock.current = true; setBusy(true); try {
                await clinicalApi(`encounters/${encounter.id}`, 'DELETE', { revision: encounter.revision });
                setDirty(false);
                router.push('/doctor/consultation');
            }
            catch (e: any) {
                setError(e.message);
            }
            finally {
                lock.current = false;
                setBusy(false);
            } }}>Confirm discard</button></div></div>}{confirmSign && <div className={s.notice}><p>Sign this consultation? The saved note will require an amendment reason for further changes.</p><div className={s.actions}><button className={s.secondary} disabled={busy} onClick={() => setConfirmSign(false)}>Keep editing</button><button className={s.primary} disabled={busy} onClick={() => void save('sign')}>Confirm signature</button></div></div>}
 {encounter.author_type === 'legacy' && caps?.canManage && <section className={s.notice}><h3>Historical author review</h3><p>The original author’s account type is unknown. Confirm the practitioner against the source record before assigning ownership.</p><label className={s.field}>Verified practitioner<select value={legacyPractitioner} onChange={e => setLegacyPractitioner(e.target.value)}><option value="">Select practitioner</option>{practitioners.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label><label className={s.field}>Evidence / reason<textarea value={legacyReason} onChange={e => setLegacyReason(e.target.value)}/></label><button className={s.primary} disabled={busy || !legacyPractitioner || legacyReason.trim().length < 10} onClick={async () => { setBusy(true); try {
                await clinicalApi(`encounters/${encounter.id}/reconcile`, 'POST', { clinicianid: Number(legacyPractitioner), revision: encounter.revision, reason: legacyReason });
                setReload(reload + 1);
            }
            catch (e: any) {
                setError(e.message);
            }
            finally {
                setBusy(false);
            } }}>Confirm historical ownership</button></section>}</>}</section>
 <section className={s.panel} hidden={tab !== 'vitals'}><VitalSigns readOnly={!caps?.canRecordVitals} patientid={patientid} encounterId={encounter?.id} onRecorded={() => { clinicalApi(`patients/${patientid}/vitals?count=1&page=1`).then(v => setLatest(v.data[0] || null)).catch(e => setError(e.message)); }}/></section>
 {['lab', 'prescription'].map(kind => (kind === 'lab' ? caps?.canLab : caps?.canPrescribe) && <section key={kind} className={s.panel} hidden={tab !== kind}>{(!encounter || canEdit) ? <ClinicalOrders key={kind} onDirtyChange={kind === 'lab' ? setLabDirty : setRxDirty} patientid={patientid} encounterId={encounter?.id} kind={kind as 'lab' | 'prescription'}/> : <p className={s.empty}>Start your own consultation before placing linked requests.</p>}</section>)}
 <section className={s.panel} hidden={tab !== 'history'}><h2>Previous consultations</h2><p>History is limited to the records your account may access.</p>{history.map(row => <div className={s.historyRow} key={row.id}><div><strong>{row.record_type} · #{row.id}</strong><span>{new Date(row.created_at).toLocaleString('en-GB')} · {row.encounter_status}</span></div><Link className={s.secondary} href={`/doctor/consultation/${clientid}?consultationid=${row.id}`}>Open record</Link></div>)}{!history.length && <p>No previous consultations in your scope.</p>}{encounter?.history?.length > 0 && <><h3>Record activity</h3>{encounter.history.map((row: any) => <p key={row.id}>{row.action} · {new Date(row.created_at).toLocaleString('en-GB')} · {row.actor_type} #{row.actor_id}</p>)}</>}</section></>}
 </main>;
}
