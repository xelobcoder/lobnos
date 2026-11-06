'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    RiComputerLine, RiExternalLinkLine, RiGroupLine,
    RiMapPinLine, RiRefreshLine, RiSearchLine, RiSettings3Line, RiTimeLine,
    RiUserAddLine, RiUserLine,
} from '@remixicon/react';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import AsyncPatientFiltering from '../accessories/SectorFileringComponents/AsyncCustomerFiltering';
import {
    localQueueDate, nextQueueStatuses, queueData, queueFailure, queueMatchesSearch,
    queueProgress, queueStatusLabels, queueUpdate, QueueBoard, QueueFacility,
    QueueSettings, QueueStatus, QueueTicket,
} from '../../lib/walkInQueue';
import useVisiblePolling from './useVisiblePolling';
import { withQueueHandoff } from '../../lib/queueHandoff';
import { plsEncryption } from '../../lib/encryption';
import styles from './WalkInQueueWorkspace.module.css';

const actionLabel: Record<QueueStatus, string> = {
    waiting: 'Return to waiting',
    called: 'Call client',
    serving: 'Start service',
    completed: 'Finish visit',
    cancelled: 'Cancel ticket',
};
type SettingsData = { settings: QueueSettings; facility: QueueFacility | null };
type QueueFilter = 'active' | 'all' | QueueStatus;

const filterOptions: { value: QueueFilter; label: string }[] = [
    { value: 'active', label: 'Waiting, called & in service' },
    { value: 'all', label: 'All clients' },
    ...(['waiting', 'called', 'serving', 'completed', 'cancelled'] as const).map(value => ({
        value,
        label: queueStatusLabels[value],
    })),
];

async function fetchQueueSettings(): Promise<SettingsData> {
    return queueData<SettingsData>(await customFetch('queue/settings'));
}

export default function WalkInQueueWorkspace() {
    const { applicationsettings } = useApplicationSettings();
    const role = String(applicationsettings?.user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    const canConfigure = ['admin', 'manager', 'superadmin'].includes(role);
    const [board, setBoard] = useState<QueueBoard | null>(null);
    const [config, setConfig] = useState<SettingsData | null>(null);
    const [settingsDraft, setSettingsDraft] = useState<QueueSettings | null>(null);
    const [date, setDate] = useState(localQueueDate);
    const [filter, setFilter] = useState<QueueFilter>('active');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [mutationError, setMutationError] = useState('');
    const [settingsError, setSettingsError] = useState('');
    const [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [settingsBusy, setSettingsBusy] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsDirty = useRef(false);
    const settingsRequest = useRef(0);
    const busy = useRef(false);
    const request = useRef(0);

    const refresh = useCallback(async () => {
        if (busy.current) return;
        const current = ++request.current;
        try {
            const result = queueData<QueueBoard>(await customFetch(`queue/tickets?date=${encodeURIComponent(date)}`));
            if (current === request.current) { setBoard(result); setError(''); }
        } catch (failure) {
            if (current === request.current) setError(queueFailure(failure));
        } finally {
            if (current === request.current) setLoading(false);
        }
    }, [date]);
    useVisiblePolling(refresh);

    const changeDate = (value: string) => {
        ++request.current;
        setDate(value);
        setBoard(null);
        setLoading(true);
    };
    const applySettings = useCallback((result: SettingsData) => {
        setConfig(result);
        if (!settingsDirty.current) setSettingsDraft({ ...result.settings });
        setSettingsError('');
    }, []);
    const loadSettings = useCallback(async () => {
        const current = ++settingsRequest.current;
        try {
            const result = await fetchQueueSettings();
            if (current === settingsRequest.current) applySettings(result);
        } catch (failure) {
            if (current === settingsRequest.current) setSettingsError(queueFailure(failure));
        }
    }, [applySettings]);
    useEffect(() => {
        const current = ++settingsRequest.current;
        let mounted = true;
        void fetchQueueSettings().then(
            result => { if (mounted && current === settingsRequest.current) applySettings(result); },
            failure => { if (mounted && current === settingsRequest.current) setSettingsError(queueFailure(failure)); },
        );
        return () => { mounted = false; };
    }, [applySettings]);

    const updateTicket = async (ticket: QueueTicket, values: Parameters<typeof queueUpdate>[1]) => {
        if (busy.current) return;
        setMutationError('');
        setNotice('');
        busy.current = true;
        setBusyId(ticket.id);
        ++request.current;
        try {
            const body = queueUpdate(ticket, values);
            const result = queueData<{ ticket: QueueTicket }>(await customFetchMutation(`queue/tickets/${ticket.id}`, 'PATCH', body));
            if (!result.ticket?.id) throw new Error('The updated ticket was not confirmed. Refresh before trying again.');
            setNotice(`Ticket ${ticket.ticketNumber} updated.`);
        } catch (failure) {
            setMutationError(queueFailure(failure));
        } finally {
            busy.current = false;
            setBusyId(null);
            void refresh();
        }
    };

    const saveSettings = async (event: FormEvent) => {
        event.preventDefault();
        if (!canConfigure || !settingsDraft || settingsBusy) return;
        setSettingsBusy(true);
        setSettingsError('');
        setNotice('');
        ++settingsRequest.current;
        try {
            const result = queueData<SettingsData>(await customFetchMutation('queue/settings', 'PUT', {
                publicEnabled: settingsDraft.publicEnabled,
                displayEnabled: settingsDraft.displayEnabled,
                ticketPrefix: settingsDraft.ticketPrefix.trim(),
                expectedVersion: settingsDraft.version,
            }));
            settingsDirty.current = false;
            setConfig(result);
            setSettingsDraft({ ...result.settings });
            setNotice('Queue settings saved.');
        } catch (failure) {
            setSettingsError(queueFailure(failure));
        } finally {
            setSettingsBusy(false);
        }
    };
    const changeSetting = <K extends keyof QueueSettings>(key: K, value: QueueSettings[K]) => {
        settingsDirty.current = true;
        setSettingsDraft(current => current ? { ...current, [key]: value } : current);
    };
    const discardSettings = () => {
        settingsDirty.current = false;
        setSettingsDraft(config ? { ...config.settings } : null);
        setSettingsOpen(false);
    };

    const tickets = (board?.tickets || []).filter(ticket => (
        (filter === 'all' || (filter === 'active' ? ['waiting', 'called', 'serving'].includes(ticket.status) : ticket.status === filter))
        && queueMatchesSearch(ticket, search)
    ));
    const facility = config ? config.facility : board?.facility;
    const settingsChanged = Boolean(config && settingsDraft && (
        config.settings.publicEnabled !== settingsDraft.publicEnabled
        || config.settings.displayEnabled !== settingsDraft.displayEnabled
        || config.settings.ticketPrefix !== settingsDraft.ticketPrefix
    ));
    const metrics = [
        { label: 'Total clients', caption: 'All check-ins', value: board?.summary.total, filter: 'all' },
        { label: 'Waiting', caption: 'Waiting to be called', value: board?.summary.waiting, filter: 'waiting' },
        { label: 'Called', caption: 'Called to a desk', value: board?.summary.called, filter: 'called' },
        { label: 'In service', caption: 'Being assisted', value: board?.summary.serving, filter: 'serving' },
        { label: 'Finished', caption: 'Visits completed', value: board?.summary.completed, filter: 'completed' },
    ] as const;
    const clearFilters = () => { setSearch(''); setFilter('active'); };

    return <section className={styles.workspace} aria-labelledby="walk-in-queue-title">
        <header className={styles.hero}>
            <div className={styles.heroCopy}>
                <div className={styles.eyebrow}>FRONT DESK <span aria-hidden="true">/</span> OPERATIONS</div>
                <h1 id="walk-in-queue-title">Walk-in queue</h1>
                <p>Keep every arrival moving, from check-in and registration to service and test tracking.</p>
                <div className={styles.heroMeta}>
                    <span><span className={styles.liveDot} aria-hidden="true" /> Auto-refreshes every 15 seconds</span>
                    {facility ? <span><RiMapPinLine size={15} aria-hidden="true" /> {facility.name}</span> : null}
                </div>
            </div>
            <div className={styles.heroActions}>
                {canConfigure ? <button type="button" className={styles.heroButton} disabled={!config} onClick={() => setSettingsOpen(value => !value)} aria-expanded={settingsOpen} aria-controls="queue-settings-panel">
                    <RiSettings3Line size={16} aria-hidden="true" /><span>Queue settings</span>
                </button> : null}
                <button type="button" className={styles.heroPrimaryButton} disabled={loading || busyId !== null || settingsBusy} onClick={() => { void refresh(); void loadSettings(); }}>
                    <RiRefreshLine size={16} aria-hidden="true" /><span>Refresh</span>
                </button>
            </div>
        </header>

        <div className={styles.messages}>
            {error ? <div className="alert alert-danger" role="alert">{error}{board ? ' Showing the last successfully loaded queue.' : ''}</div> : null}
            {mutationError ? <div className="alert alert-danger" role="alert">{mutationError}</div> : null}
            {notice ? <div className="alert alert-success" role="status">{notice}</div> : null}
            {settingsError ? <div className="alert alert-warning" role="alert">Queue settings: {settingsError}</div> : null}
            {config && !config.facility ? <div className="alert alert-info">No active facility is available for public queue links. An administrator can review <Link href="/settings/facilities">Facility settings</Link>.</div> : null}
        </div>

        {settingsOpen && canConfigure && settingsDraft ? <form id="queue-settings-panel" className={styles.settingsPanel} onSubmit={saveSettings} aria-busy={settingsBusy}>
            <div className={styles.panelHeading}>
                <div><h2>Queue settings</h2><p>Changes take effect only after you save them.</p></div>
                {settingsChanged ? <span className={styles.unsaved}>Unsaved changes</span> : null}
            </div>
            <div className={styles.settingsFields}>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="queue-public-enabled" checked={Boolean(settingsDraft.publicEnabled)} onChange={event => changeSetting('publicEnabled', event.target.checked)} disabled={settingsBusy} />
                    <label className="form-check-label" htmlFor="queue-public-enabled">Allow public walk-in check-in</label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="queue-display-enabled" checked={Boolean(settingsDraft.displayEnabled)} onChange={event => changeSetting('displayEnabled', event.target.checked)} disabled={settingsBusy} />
                    <label className="form-check-label" htmlFor="queue-display-enabled">Enable waiting-room screen display</label>
                </div>
                <div className={styles.prefixField}>
                    <label htmlFor="queue-ticket-prefix" className="form-label">Ticket prefix</label>
                    <input id="queue-ticket-prefix" className="form-control" value={settingsDraft.ticketPrefix} maxLength={6} required pattern="[A-Z]{1,6}" onChange={event => changeSetting('ticketPrefix', event.target.value.toUpperCase())} disabled={settingsBusy} />
                    <small>1–6 letters, for example Q or LAB.</small>
                </div>
            </div>
            <div className={styles.settingsActions}>
                <button type="submit" className={styles.primaryButton} disabled={settingsBusy}>{settingsBusy ? 'Saving…' : 'Save queue settings'}</button>
                <button type="button" className={styles.secondaryButton} disabled={settingsBusy} onClick={discardSettings}>Discard changes</button>
            </div>
        </form> : null}

        <section className={styles.overview} aria-labelledby="queue-overview-title">
            <h2 id="queue-overview-title" className="visually-hidden">Queue overview</h2>
            <div className={styles.metrics} role="group" aria-label="Queue summary filters">
                {metrics.map(({ label, caption, value, filter: metricFilter }) => <button
                    key={label}
                    type="button"
                    className={styles.metric}
                    aria-label={`Filter: ${label} (${value ?? 'not loaded'})`}
                    aria-pressed={filter === metricFilter}
                    disabled={!board}
                    onClick={() => setFilter(metricFilter)}
                >
                    <span className={styles.metricTop}>{label}</span>
                    <strong>{value ?? '—'}</strong>
                    <small>{caption}</small>
                </button>)}
            </div>
        </section>

        {facility ? <section className={styles.channels} aria-label="Check-in and waiting-room display">
            <div className={styles.channelIntro}>
                <span className={styles.channelIcon}><RiComputerLine size={20} aria-hidden="true" /></span>
                <div><h2>Check-in & display</h2><p>Open these on a reception tablet or waiting-room screen.</p></div>
            </div>
            <div className={styles.channelItem}>
                <div><strong>Public check-in</strong><small>{config ? (config.settings.publicEnabled ? 'Available to clients' : 'Public check-in closed') : 'Settings unavailable'}</small></div>
                {config?.settings.publicEnabled ? <a href={`/queue/${encodeURIComponent(facility.slug)}`} target="_blank" rel="noreferrer">Open walk-in check-in <RiExternalLinkLine size={14} aria-hidden="true" /></a> : null}
            </div>
            <div className={styles.channelItem}>
                <div><strong>Waiting-room display</strong><small>{config ? (config.settings.displayEnabled ? 'Ready to display' : 'Screen display off') : 'Settings unavailable'}</small></div>
                {config?.settings.displayEnabled ? <a href={`/queue/${encodeURIComponent(facility.slug)}/display`} target="_blank" rel="noreferrer">Open screen display <RiExternalLinkLine size={14} aria-hidden="true" /></a> : null}
            </div>
        </section> : null}

        <section className={styles.worklist} aria-labelledby="queue-worklist-title">
            <div className={styles.worklistHeading}>
                <div><h2 id="queue-worklist-title">Client worklist</h2><p>Find a client and continue their visit.</p></div>
                <div className={styles.updated}>{board ? `Updated ${new Date(board.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Updates every 15 seconds'}</div>
            </div>
            <div className={styles.filters}>
                <div className={styles.searchField}>
                    <label htmlFor="queue-search">Search clients</label>
                    <div className={styles.searchInput}>
                        <RiSearchLine size={18} aria-hidden="true" />
                        <input id="queue-search" className="form-control" type="search" autoComplete="off" placeholder="Name, ticket, phone or ID" value={search} onChange={event => setSearch(event.target.value)} />
                    </div>
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="queue-date">Arrival date</label>
                    <input id="queue-date" className="form-control" type="date" value={date} onChange={event => { if (event.target.value) changeDate(event.target.value); }} disabled={busyId !== null} />
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="queue-status-filter">Status</label>
                    <select id="queue-status-filter" className="form-select" value={filter} onChange={event => {
                        const selected = filterOptions.find(option => option.value === event.target.value);
                        if (selected) setFilter(selected.value);
                    }}>
                        {filterOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </div>
                <button type="button" className={styles.clearButton} disabled={filter === 'active' && !search} onClick={clearFilters}>Clear filters</button>
            </div>
            <div className={styles.resultsBar} aria-live="polite">
                <span>{board ? `Showing ${tickets.length} of ${board.tickets.length} ${board.tickets.length === 1 ? 'client' : 'clients'}` : 'Clients for the selected date'}</span>
                <span>Search applies to this date&apos;s queue</span>
            </div>
            {loading ? <div className={styles.emptyState} role="status"><span className={styles.emptyIcon}><RiTimeLine size={23} aria-hidden="true" /></span><strong>Loading clients…</strong><p>Getting the latest queue for this date.</p></div> : null}
            {!loading && board && !tickets.length && !error ? <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><RiUserAddLine size={23} aria-hidden="true" /></span>
                <strong>{board.tickets.length ? (search.trim() ? 'No matching clients' : 'No clients in this view') : 'No check-ins for this date'}</strong>
                <p>{board.tickets.length ? 'Try another search or status to see more clients.' : 'Clients will appear here when they check in.'}</p>
                {board.tickets.length ? <div className={styles.emptyActions}>
                    {search ? <button type="button" className={styles.secondaryButton} onClick={() => setSearch('')}>Clear search</button> : null}
                    {filter !== 'all' ? <button type="button" className={styles.secondaryButton} onClick={() => setFilter('all')}>Show all clients</button> : null}
                </div> : null}
            </div> : null}
            <div className={styles.ticketGrid} aria-label="Client tickets">
                {tickets.map(ticket => <TicketCard key={`${ticket.id}-${ticket.version}`} ticket={ticket} disabled={busyId !== null} busy={busyId === ticket.id} onUpdate={values => updateTicket(ticket, values)} />)}
            </div>
        </section>
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

    return <article className={styles.ticket} data-status={ticket.status} aria-label={`Ticket ${ticket.ticketNumber}`} aria-busy={busy}>
        <div className={styles.ticketHeader}>
            <div><span className={styles.ticketLabel}>TICKET</span><div className={styles.ticketNumber}>{ticket.ticketNumber}</div></div>
            <span className={styles.statusBadge} data-status={ticket.status}><span aria-hidden="true" />{queueStatusLabels[ticket.status]}</span>
        </div>
        <div className={styles.identity}>
            <span className={styles.avatar}><RiUserLine size={20} aria-hidden="true" /></span>
            <div><h3>{ticket.name || 'Name not provided'}</h3><div className={styles.identityMeta}>{ticket.phone || 'Phone not provided'} <span aria-hidden="true">·</span> Arrived {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>
        </div>
        <div className={styles.desk}><RiMapPinLine size={15} aria-hidden="true" /><span>Desk / counter:</span> <strong>{ticket.counter || 'Not assigned'}</strong></div>
        <div className={styles.progressPanel}>
            <div className={styles.progressHeading}><span>Test progress</span><strong>{progress.completed} / {progress.total}</strong></div>
            <div className={styles.progressTrack} role="progressbar" aria-label={`Ticket ${ticket.ticketNumber}: tests complete`} aria-valuemin={0} aria-valuemax={progress.total || 1} aria-valuenow={progress.completed} aria-valuetext={`${progress.completed} of ${progress.total} tests complete`}>
                <div style={{ width: `${progress.percent}%` }} />
            </div>
            <div className={styles.progressDetails}><span>Completed {progress.completed} · Pending {progress.pending}</span><span>Validated {progress.validated}</span></div>
            {!ticket.billingid ? <p>Link a bill to track this visit&apos;s tests.</p> : null}
        </div>
        {ticket.notes ? <div className={styles.staffNote}><strong>Staff note:</strong> {ticket.notes}</div> : null}
        {active ? <>
            <div className={styles.callControls} role="group" aria-label={`Queue actions for ticket ${ticket.ticketNumber}`}>
                <label htmlFor={`queue-call-desk-${ticket.id}`}>Call to desk / counter</label>
                <input id={`queue-call-desk-${ticket.id}`} className="form-control" value={counter} maxLength={80} placeholder="e.g. Reception" onChange={event => setCounter(event.target.value)} disabled={disabled} />
                <div className={styles.statusActions}>{nextQueueStatuses(ticket.status).map(status => <button
                    key={status}
                    type="button"
                    className={status === 'cancelled' ? styles.dangerButton : status === 'waiting' ? styles.secondaryButton : styles.primaryButton}
                    disabled={disabled}
                    onClick={() => void onUpdate({ status, counter })}
                >{actionLabel[status]}</button>)}</div>
            </div>
            <div className={styles.ticketLinks}>
                <Link className={styles.linkButton} href={withQueueHandoff(registrationUrl, handoff)} target="_blank" rel="noreferrer">{ticket.patientid ? 'Patient record' : 'Registration'} <RiExternalLinkLine size={13} aria-hidden="true" /></Link>
                <Link className={styles.linkButton} href={withQueueHandoff(billingUrl, handoff)} target="_blank" rel="noreferrer">{ticket.billingid ? 'View bill' : 'Billing'} <RiExternalLinkLine size={13} aria-hidden="true" /></Link>
                <button className={styles.linkButton} type="button" disabled={disabled} onClick={() => setEditing(value => !value)} aria-expanded={editing} aria-controls={`queue-link-form-${ticket.id}`}>Link patient / bill &amp; desk</button>
            </div>
        </> : null}
        {editing && active ? <form id={`queue-link-form-${ticket.id}`} className={styles.linkForm} onSubmit={save}>
            <h4>Link patient &amp; visit</h4>
            <label htmlFor={`queue-patient-search-${ticket.id}`}>Find an existing patient</label>
            <AsyncPatientFiltering inputId={`queue-patient-search-${ticket.id}`} getSelectedPatient={(patient: { patientid?: number } | null) => setPatientId(patient?.patientid ? String(patient.patientid) : '')} isDisabled={disabled} placeholder="Search patient name, phone or ID" />
            <div className={styles.idFields}>
                <div><label htmlFor={`queue-patient-${ticket.id}`}>Patient ID</label><input id={`queue-patient-${ticket.id}`} className="form-control" inputMode="numeric" value={patientid} onChange={event => setPatientId(event.target.value)} disabled={disabled} /></div>
                <div><label htmlFor={`queue-bill-${ticket.id}`}>Billing ID</label><input id={`queue-bill-${ticket.id}`} className="form-control" inputMode="numeric" value={billingid} onChange={event => setBillingId(event.target.value)} disabled={disabled} /></div>
            </div>
            <p>Select the registered patient and enter this visit&apos;s billing ID. Ownership is verified before saving.</p>
            <label htmlFor={`queue-counter-${ticket.id}`}>Desk / counter shown on screen</label>
            <input id={`queue-counter-${ticket.id}`} className="form-control" value={counter} maxLength={80} onChange={event => setCounter(event.target.value)} disabled={disabled} />
            <label htmlFor={`queue-note-${ticket.id}`}>Staff note</label>
            <input id={`queue-note-${ticket.id}`} className="form-control" value={note} maxLength={500} onChange={event => setNote(event.target.value)} disabled={disabled} />
            <button className={styles.primaryButton} type="submit" disabled={disabled}>{busy ? 'Saving…' : 'Save links & desk'}</button>
        </form> : null}
    </article>;
}
