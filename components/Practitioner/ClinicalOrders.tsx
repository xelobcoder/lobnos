'use client';
import { useEffect, useRef, useState } from 'react';
import { useUnsavedClinicalChanges } from './clinicalDraft';
import { clinicalApi } from './clinicalApi';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import s from './Practitioner.module.css';
export default function ClinicalOrders({ patientid, encounterId, kind, onDirtyChange }: {
    patientid: number;
    encounterId?: number | null;
    kind: 'lab' | 'prescription';
    onDirtyChange?: (dirty: boolean) => void;
}) {
    const [catalogue, setCatalogue] = useState<any[]>([]), [query, setQuery] = useState(''), [lines, setLines] = useState<any[]>([]), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [created, setCreated] = useState<any>(null);
    const lock = useRef(false), requestKey = useRef('');
    useEffect(() => { requestKey.current = crypto.randomUUID(); }, [lines]);
    useUnsavedClinicalChanges(lines.length > 0 && !message);
    const lab = kind === 'lab';
    useEffect(() => { onDirtyChange?.(lines.length > 0 && !message); }, [lines, message, onDirtyChange]);
    useEffect(() => { let live = true; setLoading(true); const timer = setTimeout(() => { (lab ? clinicalApi('catalogue') : customFetch(`pharmacy/catalogue?count=30&search=${encodeURIComponent(query)}`)).then(r => { if (!lab && r?.success !== true)
        throw Error(r?.message || r?.error?.message || 'Unable to load medicines'); if (live) {
        setCatalogue(lab ? r.items : r?.data?.items || []);
        setError('');
    } }).catch(e => { if (live)
        setError(e.message); }).finally(() => { if (live)
        setLoading(false); }); }, lab ? 0 : 250); return () => { live = false; clearTimeout(timer); }; }, [kind, lab ? null : query]);
    function add(row: any) { const key = String(row.testid || row.inventoryItemId || row.id); if (lines.some(r => r.key === key))
        return; setLines([...lines, { key, testId: Number(row.testid), inventoryItemId: row.inventoryItemId || row.id, drugName: row.name, name: row.name, price: row.price, dose: '', frequency: 'Once daily (OD)', route: 'Oral', duration: '5 days', dosageInstructions: '' }]); setMessage(''); }
    async function submit() { if (lock.current || !lines.length)
        return; if (!lab && lines.some(row => !row.dose.trim())) {
        setError('Enter a dose for every medicine before sending the prescription.');
        return;
    } lock.current = true; setBusy(true); setError(''); try {
        let result = created;
        if (!result) {
            const response = await customFetchMutation(lab ? 'entityorders' : 'prescriptions', 'POST', lab ? { requestKey: requestKey.current, practitionerContext: true, patientId: patientid, consultationId: encounterId, lines: lines.map(r => ({ testId: r.testId, quantity: 1 })) } : { requestKey: requestKey.current, patientId: patientid, consultationId: encounterId, items: lines.map(({ inventoryItemId, drugName, dose, frequency, route, duration, dosageInstructions }) => ({ inventoryItemId, drugName, dose, frequency, route, duration, dosageInstructions })) });
            if (lab ? response?.status !== 'success' : response?.success !== true)
                throw Error(response?.message || response?.error?.message || 'Unable to save request');
            result = response.data;
            setCreated(result);
        }
        if (lab) {
            const response = await customFetchMutation(`entityorders/${result.id}/submit`, 'POST', {});
            if (response?.status !== 'success')
                throw Error(response?.message || 'Draft saved, but referral submission failed. Retry to submit the same draft.');
        }
        setMessage(lab ? 'Laboratory referral submitted to the facility.' : 'Prescription sent to the pharmacy. The dispenser will set the supply quantity.');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    const matches = Array.isArray(catalogue) ? catalogue.filter(r => r.name?.toLowerCase().includes(query.toLowerCase()) && !lines.some(l => l.key === String(r.testid || r.inventoryItemId || r.id))) : [];
    return <section><h2>{lab ? 'Laboratory referral' : 'Prescription'}</h2><p>{lab ? 'Select the tests to refer. The facility reviews the request before billing and processing.' : 'Add medicines and prescribing directions. Supply quantities are set during dispensing.'}</p>{error && <div role="alert" className={s.error}>{error}</div>}{message ? <div role="status" className={s.success}>{message}<button className={s.secondary} onClick={() => { setCreated(null); setLines([]); setMessage(''); }}>Create another {lab ? 'referral' : 'prescription'}</button></div> : <><label className={s.field}>Find {lab ? 'tests' : 'medicines'}<input type="search" disabled={busy || !!created} value={query} onChange={e => setQuery(e.target.value)}/></label><div className={s.catalogue}>{loading ? <p role="status">Loading catalogue…</p> : matches.slice(0, lab ? 100 : 30).map(row => <button key={row.testid || row.inventoryItemId || row.id} className={s.catalogueItem} disabled={busy || !!created} onClick={() => add(row)}><span>{row.name}</span><span>Add +</span></button>)}</div><p className={s.help}>{matches.length} matches{lab && matches.length > 100 ? ' · Refine your search to find other tests' : ''}</p><fieldset disabled={busy || !!created}><div className={s.tableWrap}><table><thead><tr><th>{lab ? 'Test' : 'Medicine'}</th>{!lab && <><th>Dose</th><th>Frequency</th><th>Route</th><th>Duration</th><th>Instructions (optional)</th></>}<th /></tr></thead><tbody>{lines.map((line, index) => <tr key={line.key}><td>{line.name}</td>{!lab && <>{['dose', 'frequency', 'route', 'duration', 'dosageInstructions'].map(field => <td key={field}>{field === 'dose' || field === 'dosageInstructions' ? <input aria-label={`${field} for ${line.name}`} value={line[field]} onChange={e => setLines(lines.map((r, i) => i === index ? { ...r, [field]: e.target.value } : r))}/> : <select aria-label={`${field} for ${line.name}`} value={line[field]} onChange={e => setLines(lines.map((r, i) => i === index ? { ...r, [field]: e.target.value } : r))}>{(field === 'frequency' ? ['Once daily (OD)', 'Twice daily (BD)', 'Three times daily (TDS)', 'Four times daily (QID)', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'At night (Nocte)', 'When required (PRN)', 'Stat (once)'] : field === 'route' ? ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Rectal', 'Inhalation', 'Sublingual', 'Other'] : ['1 day', '3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '28 days', '30 days', 'As directed']).map(v => <option key={v}>{v}</option>)}</select>}</td>)}</>}<td><button className={s.textButton} onClick={() => setLines(lines.filter((_, i) => i !== index))}>Remove</button></td></tr>)}</tbody></table></div></fieldset><div className={s.actions}><span>{lines.length} selected</span><button className={s.primary} disabled={busy || !lines.length} onClick={() => void submit()}>{busy ? 'Submitting…' : lab ? created ? 'Retry referral submission' : 'Submit laboratory referral' : 'Send prescription'}</button></div></>}</section>;
}
