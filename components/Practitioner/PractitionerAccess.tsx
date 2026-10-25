'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUnsavedClinicalChanges } from './clinicalDraft';
import { clinicalApi } from './clinicalApi';
import PatientFiltered from '../accessories/SectorFileringComponents/CustomerFiltering';
import s from './Practitioner.module.css';
export default function PractitionerAccess() {
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    useEffect(() => { let live = true; clinicalApi('capabilities').then(c => { if (live)
        setAuthorized(!!c.canManage); }).catch(e => { if (live) {
        setAuthorized(false);
        setError(e.message);
    } }); return () => { live = false; }; }, []);
    const params = useSearchParams();
    const [branches, setBranches] = useState<any[]>([]);
    const [search, setSearch] = useState(''), [rows, setRows] = useState<any[]>([]), [selected, setSelected] = useState<number | null>(null), [detail, setDetail] = useState<any>(null), [form, setForm] = useState<any>(null), [staff, setStaff] = useState<any[]>([]), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [channel, setChannel] = useState('link'), [link, setLink] = useState(''), [retry, setRetry] = useState(0);
    useEffect(() => { if (authorized !== true)
        return; let live = true; const timer = setTimeout(() => { clinicalApi(`practitioners?search=${encodeURIComponent(search)}`).then(v => { if (live)
        setRows(v); }).catch(e => { if (live)
        setError(e.message); }); }, 250); return () => { live = false; clearTimeout(timer); }; }, [authorized, search, retry]);
    useEffect(() => { if (authorized !== true)
        return; Promise.all([clinicalApi('staff-options'), clinicalApi('branch-options')]).then(([staff, branches]) => { setStaff(staff); setBranches(branches); }).catch(e => setError(e.message)); const initial = Number(params.get('clinicianid')); if (initial)
        void load(initial); }, [authorized]);
    async function load(id: number) { setBusy(true); setError(''); setDetail(null); setLink(''); try {
        const value = await clinicalApi(`practitioners/${id}`);
        setSelected(id);
        setDetail(value);
        setForm(value.access);
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function action(operation: () => Promise<any>, success: string) { if (busy)
        return; setBusy(true); setError(''); setMessage(''); try {
        const result = await operation();
        setMessage(success);
        const value = await clinicalApi(`practitioners/${selected}`);
        setDetail(value);
        setForm(value.access);
        setRetry(retry + 1);
        return result;
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    const dirty = !!detail && JSON.stringify(form) !== JSON.stringify(detail.access);
    useUnsavedClinicalChanges(dirty);
    if (authorized !== true)
        return <main className={s.page}><h1>Practitioner access</h1><p role={authorized === null ? 'status' : 'alert'}>{authorized === null ? 'Checking access…' : error || 'Only administrators and managers can configure practitioner access.'}</p><a className={s.secondary} href="/doctor">Return to your workspace</a></main>;
    return <main className={s.page}><header className={s.heading}><div><span className={s.eyebrow}>ACCESS MANAGEMENT</span><h1>Practitioner access</h1><p>Configure permissions, link staff accounts and invite referring practitioners.</p></div></header>{error && <div role="alert" className={s.error}>{error}</div>}{message && <p role="status" className={s.success}>{message}</p>}<div className={s.accessGrid}><section className={s.panel}><h2>Choose a practitioner</h2><label className={s.field}>Search practitioners<input type="search" value={search} onChange={e => setSearch(e.target.value)}/></label><div className={s.catalogue}>{rows.map(row => <button className={s.catalogueItem} disabled={busy} key={row.id} aria-pressed={selected === row.id} onClick={() => { if (!dirty || window.confirm('Discard unsaved permission changes?'))
        void load(row.id); }}><span><strong>{row.name}</strong><small>{row.email || row.phone || 'No contact details'}</small></span><span>{row.enabled ? 'Active' : 'Not active'}</span></button>)}</div><p className={s.help}>Up to 50 matches. Refine the search for another practitioner.</p></section>
 <section className={s.panel}>{detail && form ? <><div className={s.sectionHeader}><h2>{detail.clinician.name}</h2><a className={s.textButton} href={`/clinicians/add-new?clinicianid=${selected}`}>Edit contact details</a></div><p>{detail.clinician.email || 'No email'} · {detail.clinician.phone || 'No mobile'}</p><p>Portal username: <strong>{detail.username}</strong></p><form onSubmit={e => { e.preventDefault(); void action(() => clinicalApi(`practitioners/${selected}`, 'PUT', form), 'Practitioner permissions saved.'); }}><fieldset disabled={busy}><div className={s.twoColumns}><label className={s.field}>Practitioner type<select aria-label="Practitioner type" value={form.practice_type} onChange={e => setForm({ ...form, practice_type: e.target.value, staff_employeeid: e.target.value === 'external' ? null : form.staff_employeeid })}><option value="external">External referring practitioner</option><option value="facility">Facility practitioner</option><option value="pharmacy">Pharmacy practitioner</option></select></label>{form.practice_type !== 'external' && <label className={s.field}>Staff login<select aria-label="Staff login" required value={form.staff_employeeid || ''} onChange={e => { const person = staff.find(row => row.employeeid === Number(e.target.value)); setForm({ ...form, staff_employeeid: Number(e.target.value) || null, branchid: person?.branch ?? null }); }}><option value="">Choose active staff account</option>{staff.map(row => <option key={row.employeeid} value={row.employeeid}>{row.username} · {row.role}</option>)}</select></label>}</div><label className={s.field}>Operating branch<select aria-label="Operating branch" value={form.branchid || ''} onChange={e => setForm({ ...form, branchid: e.target.value ? Number(e.target.value) : null })}><option value="">Facility-wide / no branch</option>{branches.map(row => <option key={row.branchid} value={row.branchid}>{row.name}</option>)}</select><small>For internal staff, this follows the linked account’s branch.</small></label><div className={s.permissionGrid}>{[['enabled', 'Access enabled'], ['can_consult', 'Consult and sign notes'], ['can_lab', 'Refer laboratory tests'], ['can_prescribe', 'Prescribe medication']].map(([key, label]) => <label className={s.check} key={key}><input type="checkbox" checked={!!form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })}/>{label}</label>)}</div><p className={s.help}>Disabling access revokes external sessions and unused invitations. Clinical permissions remain subject to enabled facility modules.</p><button className={s.primary} type="submit" disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save permissions'}</button></fieldset></form>
 {form.staff_employeeid ? <section className={s.notice}><h3>Staff account linked</h3><p>This practitioner uses their existing staff login. A separate portal password is unnecessary.</p></section> : <section className={s.notice}><h3>Invite practitioner</h3><p>The practitioner sets their own password using a single-use link valid for 24 hours. Save permissions before inviting.</p><label className={s.field}>Invitation channel<select aria-label="Invitation channel" value={channel} onChange={e => setChannel(e.target.value)}><option value="link">Create secure activation link</option>{['email', 'sms'].map(k => <option key={k} value={k} disabled={!detail.channels[k].available}>{k === 'email' ? 'Email' : 'SMS'}{!detail.channels[k].available ? ' · unavailable' : ''}</option>)}</select></label>{['email', 'sms'].map(k => !detail.channels[k].available && <p className={s.help} key={k}>{detail.channels[k].reason}</p>)}<button className={s.primary} disabled={busy || dirty || !form.version} onClick={async () => { const result = await action(() => clinicalApi(`practitioners/${selected}/invitations`, 'POST', { channel }), 'Invitation created.'); if (result) {
                setLink(result.link);
                setMessage(result.delivery.status === 'accepted' ? 'Provider accepted the invitation for sending.' : result.delivery.status === 'failed' ? result.delivery.reason : 'Activation link created. Share it securely with this practitioner.');
            } }}>{busy ? 'Creating…' : 'Create / resend invitation'}</button>{link && <div><label className={s.field}>Single-use activation link<input readOnly value={link}/></label><button className={s.secondary} onClick={() => { navigator.clipboard.writeText(link).then(() => setMessage('Activation link copied.')).catch(() => setError('Select and copy the link above.')); }}>Copy activation link</button></div>}
 <div className={s.tableWrap}><table><thead><tr><th>Created</th><th>Status</th><th>Delivery</th><th /></tr></thead><tbody>{detail.invitations.map((row: any) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString('en-GB')}</td><td>{row.used_at ? 'Accepted' : row.revoked_at ? 'Revoked' : new Date(row.expires_at) < new Date() ? 'Expired' : 'Pending'}</td><td>{row.channel} · {row.delivery_status === 'accepted' ? 'Provider accepted' : row.delivery_status}</td><td>{!row.used_at && !row.revoked_at && <button className={s.textButton} disabled={busy} onClick={() => void action(() => clinicalApi(`practitioners/${selected}/invitations/${row.id}`, 'DELETE', {}), 'Invitation revoked.')}>Revoke</button>}</td></tr>)}</tbody></table></div></section>}
 <section><h3>Patients assigned to this practitioner</h3><p className={s.help}>Existing live referrals also provide access to their patient. Removing a manual grant does not remove a valid referral relationship.</p><PatientFiltered isDisabled={busy || dirty} getSelectedPatient={(patient: any) => { if (patient?.patientid)
            void action(() => clinicalApi(`practitioners/${selected}/patients/${patient.patientid}`, 'PUT', { enabled: true }), 'Patient assigned.'); }}/>{detail.patients.map((patient: any) => <div className={s.historyRow} key={patient.patientid}><span>{patient.firstname} {patient.lastname} · {patient.fullpatientid}</span><button className={s.textButton} disabled={busy} onClick={() => void action(() => clinicalApi(`practitioners/${selected}/patients/${patient.patientid}`, 'PUT', { enabled: false }), 'Manual patient assignment removed.')}>Remove assignment</button></div>)}</section></> : <p className={s.empty}>{busy ? 'Loading practitioner…' : 'Select a practitioner to manage their access.'}</p>}</section></div></main>;
}
