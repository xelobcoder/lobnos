'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import AsyncPatientFiltering from '../accessories/SectorFileringComponents/AsyncCustomerFiltering';
import {
    localQueueDate, nextQueueStatuses, queueData, queueFailure, queueProgress, queueStatusLabels,
    queueUpdate, QueueBoard, QueueFacility, QueueSettings, QueueStatus, QueueTicket,
} from '../../lib/walkInQueue';
import useVisiblePolling from './useVisiblePolling';
import { withQueueHandoff } from '../../lib/queueHandoff';
import { plsEncryption } from '../../lib/encryption';

const statusColor: Record<QueueStatus, string> = { waiting: 'secondary', called: 'info', serving: 'primary', completed: 'success', cancelled: 'danger' };
const actionLabel: Record<QueueStatus, string> = { waiting: 'Return to waiting', called: 'Call client', serving: 'Start service', completed: 'Finish visit', cancelled: 'Cancel ticket' };
type SettingsData = { settings: QueueSettings; facility: QueueFacility | null };

export default function WalkInQueueWorkspace() {
    const { applicationsettings } = useApplicationSettings();
    const role = String(applicationsettings?.user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    const canConfigure = ['admin', 'manager', 'superadmin'].includes(role);
    const [board, setBoard] = useState<QueueBoard | null>(null);
    const [config, setConfig] = useState<SettingsData | null>(null);
    const [date, setDate] = useState(localQueueDate);
    const [filter, setFilter] = useState('active');
    const [error, setError] = useState('');
    const [mutationError, setMutationError] = useState('');
    const [settingsError, setSettingsError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [settingsBusy, setSettingsBusy] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const busy = useRef(false);
    const request = useRef(0);
    const refresh = useCallback(async () => {
        if (busy.current) return;
        const current = ++request.current;
        try {
            const result = queueData<QueueBoard>(await customFetch(`queue/tickets?date=${encodeURIComponent(date)}`));
            if (current === request.current) { setBoard(result); setError(''); }
        } catch (failure) { if (current === request.current) setError(queueFailure(failure)); }
        finally { if (current === request.current) setLoading(false); }
    }, [date]);
    useVisiblePolling(refresh);
    // Change the date immediately; periodic refreshes keep the selected worklist current.
    const changeDate = (value: string) => { ++request.current; setDate(value); setBoard(null); setLoading(true); };
    const loadSettings = useCallback(async () => {
        try { setConfig(queueData<SettingsData>(await customFetch('queue/settings'))); setSettingsError(''); }
        catch (failure) { setSettingsError(queueFailure(failure)); }
    }, []);
    useEffect(() => { void loadSettings(); }, [loadSettings]);
    const updateTicket = async (ticket: QueueTicket, values: Parameters<typeof queueUpdate>[1]) => {
        if (busy.current) return;
        setMutationError(''); setNotice('');
        busy.current = true; setBusyId(ticket.id);
        ++request.current;
        try {
            const body = queueUpdate(ticket, values);
            const result = queueData<{ ticket: QueueTicket }>(await customFetchMutation(`queue/tickets/${ticket.id}`, 'PATCH', body));
            if (!result.ticket?.id) throw new Error('The updated ticket was not confirmed. Refresh before trying again.');
            setNotice(`Ticket ${ticket.ticketNumber} updated.`);
        } catch (failure) { setMutationError(queueFailure(failure)); }
        finally { busy.current = false; setBusyId(null); void refresh(); }
    };
    const saveSettings = async (event: FormEvent) => {
        event.preventDefault();
        if (!canConfigure || !config || settingsBusy) return;
        setSettingsBusy(true); setSettingsError(''); setNotice('');
        try {
            const result = queueData<SettingsData>(await customFetchMutation('queue/settings', 'PUT', {
                publicEnabled: config.settings.publicEnabled, displayEnabled: config.settings.displayEnabled,
                ticketPrefix: config.settings.ticketPrefix.trim(), expectedVersion: config.settings.version,
            }));
            setConfig(result); setNotice('Queue settings saved.');
        } catch (failure) { setSettingsError(queueFailure(failure)); }
        finally { setSettingsBusy(false); }
    };
    const changeSetting = <K extends keyof QueueSettings>(key: K, value: QueueSettings[K]) => setConfig(current => current ? { ...current, settings: { ...current.settings, [key]: value } } : current);
    const tickets = (board?.tickets || []).filter(ticket => filter === 'all' || (filter === 'active' ? ['waiting', 'called', 'serving'].includes(ticket.status) : ticket.status === filter));
    const facility = config?.facility || board?.facility;
    return <section className="container-fluid py-3" aria-labelledby="walk-in-queue-title">
        <header className="d-flex flex-wrap justify-content-between gap-3 mb-3">
            <div><h1 id="walk-in-queue-title" className="h4 mb-1">Walk-in queue & client tracking</h1><p className="text-muted small mb-0">Call clients, continue registration and billing, and track their test progress.</p></div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busyId !== null} onClick={() => { void refresh(); void loadSettings(); }}>Refresh</button>
                {canConfigure ? <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSettingsOpen(value => !value)} aria-expanded={settingsOpen}>Queue settings</button> : null}
            </div>
        </header>
        {error ? <div className="alert alert-danger" role="alert">{error}</div> : null}
        {mutationError ? <div className="alert alert-danger" role="alert">{mutationError}</div> : null}
        {notice ? <div className="alert alert-success" role="status">{notice}</div> : null}
        {settingsError ? <div className="alert alert-warning" role="alert">Queue settings: {settingsError}</div> : null}
        {config && !config.facility ? <div className="alert alert-info">No active facility is available for public queue links. An administrator can review <Link href="/settings/facilities">Facility settings</Link>.</div> : null}
        {facility ? <div className="card mb-3"><div className="card-body py-3 d-flex flex-wrap align-items-center gap-3">
            <div className="me-auto"><div className="fw-semibold">Reception check-in & waiting-room screen</div><div className="small text-muted">Share the check-in link or leave it open on a reception tablet.</div></div>
            {config?.settings.publicEnabled ? <a className="btn btn-sm btn-outline-primary" href={`/queue/${encodeURIComponent(facility.slug)}`} target="_blank" rel="noreferrer">Open walk-in check-in</a> : <span className="badge text-bg-secondary">Public check-in closed</span>}
            {config?.settings.displayEnabled ? <a className="btn btn-sm btn-outline-secondary" href={`/queue/${encodeURIComponent(facility.slug)}/display`} target="_blank" rel="noreferrer">Open screen display</a> : <span className="badge text-bg-secondary">Screen display off</span>}
        </div></div> : null}
        {settingsOpen && canConfigure && config ? <form className="card mb-3" onSubmit={saveSettings} aria-busy={settingsBusy}>
            <div className="card-body"><h2 className="h6">Queue settings</h2>
                <div className="form-check mb-2"><input className="form-check-input" type="checkbox" id="queue-public-enabled" checked={Boolean(config.settings.publicEnabled)} onChange={event => changeSetting('publicEnabled', event.target.checked)} disabled={settingsBusy} /><label className="form-check-label" htmlFor="queue-public-enabled">Allow public walk-in check-in</label></div>
                <div className="form-check mb-3"><input className="form-check-input" type="checkbox" id="queue-display-enabled" checked={Boolean(config.settings.displayEnabled)} onChange={event => changeSetting('displayEnabled', event.target.checked)} disabled={settingsBusy} /><label className="form-check-label" htmlFor="queue-display-enabled">Enable waiting-room screen display</label></div>
                <label htmlFor="queue-ticket-prefix" className="form-label">Ticket prefix</label><input id="queue-ticket-prefix" className="form-control mb-3" style={{ maxWidth: 160 }} value={config.settings.ticketPrefix} maxLength={6} required pattern="[A-Z]{1,6}" onChange={event => changeSetting('ticketPrefix', event.target.value.toUpperCase())} disabled={settingsBusy} />
                <button type="submit" className="btn btn-primary btn-sm" disabled={settingsBusy}>{settingsBusy ? 'Saving…' : 'Save queue settings'}</button>
            </div>
        </form> : null}
        <div className="row g-2 mb-3">{[['Total clients', board?.summary.total], ['Waiting', board?.summary.waiting], ['Called', board?.summary.called], ['In service', board?.summary.serving], ['Finished', board?.summary.completed]].map(([label, value]) => <div className="col-6 col-md" key={String(label)}><div className="card h-100"><div className="card-body py-3"><div className="small text-muted">{label}</div><div className="h3 mb-0">{value ?? '—'}</div></div></div></div>)}</div>
        <div className="d-flex flex-wrap align-items-end gap-3 mb-3">
            <div><label htmlFor="queue-date" className="form-label small">Arrival date</label><input id="queue-date" className="form-control form-control-sm" type="date" value={date} onChange={event => { if (event.target.value) changeDate(event.target.value); }} disabled={busyId !== null} /></div>
            <div><label htmlFor="queue-status-filter" className="form-label small">Show clients</label><select id="queue-status-filter" className="form-select form-select-sm" value={filter} onChange={event => setFilter(event.target.value)}><option value="active">Waiting, called & in service</option><option value="all">All clients</option>{Object.entries(queueStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="small text-muted ms-auto">{board ? `Updated ${new Date(board.updatedAt).toLocaleTimeString()} · ${tickets.length} shown` : 'Updates every 15 seconds'}</div>
        </div>
        {loading ? <p role="status">Loading clients…</p> : null}
        {!loading && !tickets.length && !error ? <div className="card"><div className="card-body text-center text-muted py-5">No clients match this date and status.</div></div> : null}
        <div className="row g-3">{tickets.map(ticket => <div key={ticket.id} className="col-12 col-md-6 col-xl-4"><TicketCard key={`${ticket.id}-${ticket.version}`} ticket={ticket} disabled={busyId !== null} busy={busyId === ticket.id} onUpdate={values => updateTicket(ticket, values)} /></div>)}</div>
    </section>;
}

export function TicketCard({ ticket, disabled, busy, onUpdate }: { ticket: QueueTicket; disabled: boolean; busy: boolean; onUpdate: (values: Parameters<typeof queueUpdate>[1]) => Promise<void> }) {
    const [counter, setCounter] = useState(ticket.counter || '');
    const [patientid, setPatientId] = useState(String(ticket.patientid || ''));
    const [billingid, setBillingId] = useState(String(ticket.billingid || ''));
    const [note, setNote] = useState('');
    const [editing, setEditing] = useState(false);
    const progress = queueProgress(ticket);
    const handoff = { ticketId: ticket.id, ...(ticket.queueDate ? { date: String(ticket.queueDate).slice(0, 10) } : {}) };
    const registrationUrl = ticket.patientid ? `/crm/registration/${ticket.patientid}/personal-information` : '/crm/registration';
    const billingUrl = ticket.billingid ? `/billing/transactions/previous-transaction/${ticket.billingid}`
        : ticket.patientid ? `/billing/patientid/${plsEncryption(String(ticket.patientid))}/multi` : '/billing/patientid';
    const active = ticket.status !== 'completed' && ticket.status !== 'cancelled';
    const save = async (event: FormEvent) => { event.preventDefault(); await onUpdate({ counter, patientid, billingid, note }); };
    return <article className="card h-100" aria-label={`Ticket ${ticket.ticketNumber}`} aria-busy={busy}>
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2"><div className="h4 mb-0">{ticket.ticketNumber}</div><span className={`badge text-bg-${statusColor[ticket.status]}`}>{queueStatusLabels[ticket.status]}</span></div>
            <h2 className="h6 mb-1">{ticket.name}</h2><div className="small text-muted">{ticket.phone} · Arrived {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            {ticket.counter ? <div className="small mt-2">Desk / counter: <strong>{ticket.counter}</strong></div> : null}
            <div className="border rounded p-2 mt-3"><div className="d-flex justify-content-between"><span className="small">Tests</span><strong>{progress.total}</strong></div>
                <div className="d-flex justify-content-between small mt-1"><span>Completed {progress.completed} · Pending {progress.pending}</span><span>Validated {progress.validated}</span></div>
                <div className="progress mt-2" role="progressbar" aria-label={`Ticket ${ticket.ticketNumber}: tests complete`} aria-valuemin={0} aria-valuemax={progress.total || 1} aria-valuenow={progress.completed} style={{ height: 7 }}><div className="progress-bar" style={{ width: `${progress.percent}%` }} /></div>
                {!ticket.billingid ? <div className="small text-muted mt-2">Link a bill to track this visit’s tests.</div> : null}
            </div>
            {active ? <div className="d-flex gap-2 flex-wrap mt-3"><Link className="btn btn-sm btn-outline-secondary" href={withQueueHandoff(registrationUrl, handoff)} target="_blank">{ticket.patientid ? 'Patient record' : 'Registration'}</Link><Link className="btn btn-sm btn-outline-secondary" href={withQueueHandoff(billingUrl, handoff)} target="_blank">{ticket.billingid ? 'View bill' : 'Billing'}</Link><button className="btn btn-sm btn-outline-primary" type="button" disabled={disabled} onClick={() => setEditing(value => !value)} aria-expanded={editing}>Link patient / bill & desk</button></div> : null}
            {editing && active ? <form className="border-top pt-3 mt-3" onSubmit={save}>
                <label className="form-label small">Find an existing patient</label><AsyncPatientFiltering getSelectedPatient={(patient: { patientid?: number } | null) => setPatientId(patient?.patientid ? String(patient.patientid) : '')} isDisabled={disabled} placeholder="Search patient name, phone or ID" />
                <div className="row g-2 mt-1"><div className="col-6"><label className="form-label small" htmlFor={`queue-patient-${ticket.id}`}>Patient ID</label><input id={`queue-patient-${ticket.id}`} className="form-control form-control-sm" inputMode="numeric" value={patientid} onChange={event => setPatientId(event.target.value)} disabled={disabled} /></div><div className="col-6"><label className="form-label small" htmlFor={`queue-bill-${ticket.id}`}>Billing ID</label><input id={`queue-bill-${ticket.id}`} className="form-control form-control-sm" inputMode="numeric" value={billingid} onChange={event => setBillingId(event.target.value)} disabled={disabled} /></div></div>
                <p className="small text-muted mt-2 mb-2">Select the registered patient and enter this visit’s billing ID. Ownership is verified before saving.</p>
                <label className="form-label small" htmlFor={`queue-counter-${ticket.id}`}>Desk / counter shown on screen</label><input id={`queue-counter-${ticket.id}`} className="form-control form-control-sm mb-2" value={counter} maxLength={80} onChange={event => setCounter(event.target.value)} disabled={disabled} />
                <label className="form-label small" htmlFor={`queue-note-${ticket.id}`}>Staff note</label><input id={`queue-note-${ticket.id}`} className="form-control form-control-sm mb-2" value={note} maxLength={500} onChange={event => setNote(event.target.value)} disabled={disabled} />
                <button className="btn btn-sm btn-primary" type="submit" disabled={disabled}>{busy ? 'Saving…' : 'Save links & desk'}</button>
            </form> : null}
            {ticket.notes ? <div className="small text-muted mt-2">Staff note: {ticket.notes}</div> : null}
            {active ? <div className="mt-3"><label className="form-label small" htmlFor={`queue-call-desk-${ticket.id}`}>Call to desk / counter</label><input id={`queue-call-desk-${ticket.id}`} className="form-control form-control-sm mb-2" value={counter} maxLength={80} onChange={event => setCounter(event.target.value)} disabled={disabled} /><div className="d-flex flex-wrap gap-2">{nextQueueStatuses(ticket.status).map(status => <button key={status} type="button" className={`btn btn-sm ${status === 'cancelled' ? 'btn-outline-danger' : status === 'waiting' ? 'btn-outline-secondary' : 'btn-primary'}`} disabled={disabled} onClick={() => void onUpdate({ status, counter })}>{actionLabel[status]}</button>)}</div></div> : null}
        </div>
    </article>;
}
