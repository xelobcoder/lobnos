'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { RiRefreshLine, RiSendPlane2Line, RiSearchLine, RiTimeLine } from '@remixicon/react';
import PrimeToast from '../../../../components/accessories/PrimeToast';
import { NotificationQueue, loadQueue, callMutate } from '../_lib';
import s from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './QueueWorkspace.module.css';

function dateLabel(value?: string) {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function NotificationQueuePage() {
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);
    const [rows, setRows] = useState<NotificationQueue[]>([]);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [priority, setPriority] = useState('all');
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('updated');
    const [pending, setPending] = useState<{ id: number; action: 'retry' | 'cancel' } | null>(null);
    const [busy, setBusy] = useState(false);
    const requestId = useRef(0);
    const actionLock = useRef(false);

    async function refresh() {
        const id = ++requestId.current;
        setLoading(true); setError('');
        try {
            const records = await loadQueue(limit);
            if (id === requestId.current) setRows(records);
        } catch (err) {
            if (id === requestId.current) setError(err instanceof Error ? err.message : 'Unable to load the notification queue.');
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }
    useEffect(() => {
        void refresh();
        return () => { requestId.current++; };
    }, [limit]);

    async function performAction() {
        if (!pending || actionLock.current) return;
        actionLock.current = true; setBusy(true); setError(''); setNotice('');
        try {
            await callMutate(`notifications/queue/${pending.id}/${pending.action}`, 'POST', {});
            setNotice(`Notification #${pending.id} ${pending.action === 'retry' ? 'submitted for retry' : 'cancelled'}.`);
            setPending(null);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to update the notification.');
        } finally {
            actionLock.current = false; setBusy(false);
        }
    }
    const statuses = useMemo(() => Array.from(new Set(rows.map(row => row.status || 'unknown'))).sort(), [rows]);
    const filtered = useMemo(() => {
        const search = query.trim().toLowerCase();
        return rows.filter(row => (!search || [row.id, row.event_code, row.status, row.priority, row.error_message].some(value => String(value || '').toLowerCase().includes(search))) && (status === 'all' || (row.status || 'unknown') === status) && (priority === 'all' || row.priority?.toLowerCase() === priority))
            .sort((a, b) => sort === 'id' ? b.id - a.id : (Date.parse(b.updated_at || b.created_at || '') || 0) - (Date.parse(a.updated_at || a.created_at || '') || 0));
    }, [rows, query, status, priority, sort]);
    const maxPage = Math.max(1, Math.ceil(filtered.length / 10));
    const currentPage = Math.min(page, maxPage);
    const displayed = filtered.slice((currentPage - 1) * 10, currentPage * 10);
    const failed = rows.filter(row => ['failed', 'error'].includes(row.status?.toLowerCase() || '')).length;
    const waiting = rows.filter(row => ['pending', 'queued', 'processing', 'retrying'].includes(row.status?.toLowerCase() || '')).length;
    function clearFilters() { setQuery(''); setStatus('all'); setPriority('all'); setPage(1); }

    return <main className={`${s.workspace} ${styles.workspace}`}>
        <PrimeToast />
        <header className={s.header}>
            <div className={s.heading}><span className={s.icon}><RiTimeLine size={24} aria-hidden="true" /></span><div><span className={s.eyebrow}>Notifications</span><h1>Notification queue</h1><p>Track notification delivery, retry jobs, and manage queued notifications.</p></div></div>
            <div className={s.actions}><button className={s.secondary} onClick={() => void refresh()} disabled={loading || busy}><RiRefreshLine size={18} aria-hidden="true" />Refresh</button><Link className={s.primary} href="/email-services/notifications/trigger"><RiSendPlane2Line size={18} aria-hidden="true" />Trigger notification</Link></div>
        </header>
        <div className={s.stats} aria-label="Loaded queue overview">
            {[['Loaded notifications', rows.length], ['Awaiting delivery', waiting], ['Failed notifications', failed]].map(([label, count]) => <div className={s.stat} key={label}><span className={s.icon}><RiTimeLine size={21} aria-hidden="true" /></span><div><strong>{loading ? '-' : count}</strong><span>{label}</span></div></div>)}
        </div>
        {error && <div className={s.error} role="alert"><span>{error}</span><button className={s.secondary} disabled={loading || busy} onClick={() => void refresh()}>Retry loading</button></div>}
        {notice && <div className={s.success} role="status">{notice}<button className={s.textButton} onClick={() => setNotice('')}>Dismiss</button></div>}
        {pending && <div className={s.notice} role="region" aria-label="Confirm queue action"><div><strong>{pending.action === 'cancel' ? 'Cancel' : 'Retry'} notification #{pending.id}?</strong><p>{pending.action === 'cancel' ? 'Request cancellation of this notification.' : 'Submit this notification for another delivery attempt.'}</p></div><div className={s.actions}><button autoFocus className={s.secondary} disabled={busy} onClick={() => setPending(null)}>Go back</button><button className={pending.action === 'cancel' ? s.danger : s.primary} disabled={busy} onClick={() => void performAction()}>{busy ? 'Updating...' : pending.action === 'cancel' ? 'Cancel notification' : 'Retry notification'}</button></div></div>}
        <section className={`${s.panel} ${styles.queuePanel}`} aria-label="Notification queue results" aria-busy={loading}>
            <div className={s.toolbar}>
                <div className={s.field}><label htmlFor="queue-search"><RiSearchLine size={16} aria-hidden="true" /> Search notifications</label><input id="queue-search" type="search" placeholder="Queue ID, event or error message" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div>
                <div className={s.field}><label htmlFor="queue-status">Status</label><select id="queue-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option>{Array.from(new Set([...statuses, ...(status !== 'all' ? [status] : [])])).map(value => <option key={value} value={value}>{value}</option>)}</select></div>
                <div className={s.field}><label htmlFor="queue-priority">Priority</label><select id="queue-priority" value={priority} onChange={event => { setPriority(event.target.value); setPage(1); }}><option value="all">All priorities</option><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></div>
                <div className={s.field}><label htmlFor="queue-limit">Load limit</label><select id="queue-limit" value={limit} disabled={busy} onChange={event => { setLimit(Number(event.target.value)); setPage(1); }}>{[20, 50, 100].map(value => <option key={value} value={value}>{value} notifications</option>)}</select></div>
            </div>
            <div className={styles.resultsBar}><p className={s.help}>Search, filters and counts apply to the loaded notifications.</p><div className={s.actions}><label htmlFor="queue-sort" className={s.help}>Sort by</label><select id="queue-sort" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="updated">Recently updated</option><option value="id">Newest queue ID</option></select></div></div>
            {loading ? <div className={s.empty} role="status">Loading notification queue...</div> : !filtered.length ? <div className={s.empty}><RiTimeLine size={32} aria-hidden="true" /><h2>{rows.length ? 'No matching notifications' : error ? 'Queue unavailable' : 'No notifications in the queue'}</h2><p>{rows.length ? 'Try another search or clear the filters.' : error ? 'Retry loading to view notification delivery statuses.' : 'Queued notifications will appear here after an event is triggered.'}</p>{rows.length > 0 && <button className={s.secondary} onClick={clearFilters}>Clear filters</button>}</div> : <>
                <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Notification delivery table"><table className={s.table}><thead><tr><th scope="col">Notification</th><th scope="col">Status</th><th scope="col">Priority</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody>{displayed.map(row => {
                    const state = row.status?.toLowerCase() || 'unknown';
                    const tone = ['failed', 'error'].includes(state) ? s.expired : ['sent', 'delivered', 'completed'].includes(state) ? s.active : s.scheduled;
                    return <tr key={row.id}><td><strong>{row.event_code || 'Unknown event'}</strong><p>Queue #{row.id}</p>{row.error_message && <details className={styles.errorDetails}><summary>Delivery error</summary><div>{row.error_message}</div></details>}</td><td><span className={`${s.badge} ${tone} ${styles.capitalize}`}>{row.status || 'Unknown'}</span></td><td className={styles.capitalize}>{row.priority || '-'}</td><td>{dateLabel(row.updated_at)}</td><td><div className={s.actions}><button className={s.textButton} disabled={busy || loading} aria-label={`Retry notification ${row.id}`} onClick={() => { setPending({ id: row.id, action: 'retry' }); setNotice(''); }}>Retry</button><button className={`${s.textButton} ${styles.cancel}`} disabled={busy || loading} aria-label={`Cancel notification ${row.id}`} onClick={() => { setPending({ id: row.id, action: 'cancel' }); setNotice(''); }}>Cancel</button></div></td></tr>;
                })}</tbody></table></div>
                <footer className={s.footer}><span className={s.muted} aria-live="polite">{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filtered.length)} of {filtered.length} notifications</span><nav className={s.pager} aria-label="Queue pages"><button className={s.secondary} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {maxPage}</span><button className={s.secondary} disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></nav></footer>
            </>}
        </section>
    </main>;
}
