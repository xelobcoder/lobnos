'use client';

import { useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import styles from './security.module.css';
import workspace from '../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';

type Account = { account_type: string; account_id: number; account_name?: string; account_username?: string; locked_until: number; level: number };
type Event = Account & { id: number; action: string; actor_id: number | null; actor_name?: string; actor_username?: string; reason: string | null; created_at: string };
type Activity = { events: Event[]; cooldowns: Account[]; total: number; activeTotal: number };
const date = (value: string | number) => new Date(value).toLocaleString();
const labels: Record<string, string> = {
    staff: 'Staff', patient: 'Patient', clinician: 'Practitioner',
    login_failed: 'Incorrect password', login_locked: 'Cooldown started',
    login_blocked: 'Blocked during cooldown', login_success: 'Password accepted', admin_unlock: 'Administrator unlock',
};
const label = (value: string) => labels[value] || value.replaceAll('_', ' ');

function AccountIdentity({ name, username, type, id }: { name?: string; username?: string; type: string; id: number }) {
    return <div className={styles.identity}>
        <strong>{name || username || `Unavailable ${label(type).toLowerCase()} account`}</strong>
        <span>{label(type)}{username && username !== name ? ` · ${username}` : ''} · ID {id}</span>
    </div>;
}

export default function SecurityActivityPage() {
    const app = useApplication();
    const allowed = ['admin', 'superadmin'].includes(String(app?.user?.role || '').toLowerCase().replace(/[\s_-]/g, ''));
    const [type, setType] = useState('');
    const [accountId, setAccountId] = useState('');
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [selected, setSelected] = useState<Account | null>(null);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const [revision, setRevision] = useState(0);
    const submitting = useRef(false);

    useEffect(() => {
        if (!allowed) return;
        let current = true;
        setLoading(true);
        setData(null);
        setError('');
        customFetch(`security/activity?page=${page}${filter}`).then(response => {
            if (!response?.success) throw Error(response?.error?.message || 'Unable to load security activity');
            if (current) setData(response.data);
        }).catch(error => { if (current) setError(error instanceof Error ? error.message : 'Unable to load security activity'); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [allowed, filter, page, revision]);

    async function clearCooldown(event: React.FormEvent) {
        event.preventDefault();
        if (!selected || submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const response = await customFetchMutation('security/cooldowns/clear', 'POST', {
                accountType: selected.account_type, accountId: selected.account_id, reason,
            });
            if (!response?.success) throw Error(response?.error?.message || 'Unable to clear cooldown');
            setNotice(response.data.cleared ? 'Login cooldown cleared. The account can try signing in again.' : 'This account already has no login cooldown.');
            setSelected(null);
            setReason('');
            setRevision(value => value + 1);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to clear cooldown');
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    if (!allowed) return <main className={`${workspace.workspace} ${styles.page}`}><h1>Security activity</h1><p role="alert">Administrator access is required.</p></main>;
    return <main className={`${workspace.workspace} ${styles.page}`}>
        <header className={workspace.header}><div><p className={workspace.eyebrow}>Settings / Access security</p><h1>Security activity</h1><p>Review login attempts and help verified account holders regain access in this facility.</p></div>
            <button className={workspace.secondary} disabled={loading || busy} onClick={() => setRevision(value => value + 1)}>Refresh activity</button></header>
        <form className={styles.filters} onSubmit={event => {
            event.preventDefault();
            setPage(1);
            setSelected(null);
            setFilter(`${type ? `&accountType=${encodeURIComponent(type)}` : ''}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}${action ? `&action=${encodeURIComponent(action)}` : ''}${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ''}`);
        }}>
            <label>Find account<input className="form-control" type="search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or login username" /></label>
            <label>Account type<select className="form-select" value={type} onChange={event => setType(event.target.value)}><option value="">All account types</option><option value="staff">Staff</option><option value="patient">Patient</option><option value="clinician">Practitioner</option></select></label>
            <label>Account ID (optional)<input className="form-control" type="number" min="1" step="1" value={accountId} onChange={event => setAccountId(event.target.value)} placeholder="All accounts" /></label>
            <label>History activity<select className="form-select" value={action} onChange={event => setAction(event.target.value)}><option value="">All activities</option><option value="login_failed">Incorrect password</option><option value="login_locked">Cooldown started</option><option value="login_blocked">Blocked during cooldown</option><option value="login_success">Password accepted</option><option value="admin_unlock">Administrator unlock</option></select></label>
            <button className={workspace.primary} disabled={busy}>Apply filters</button>
        </form>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {notice && <p className="alert alert-success" role="status">{notice}</p>}
        {selected && <form className={styles.confirm} onSubmit={clearCooldown}>
            <h2>Clear login cooldown</h2><AccountIdentity name={selected.account_name} username={selected.account_username} type={selected.account_type} id={selected.account_id}/><p>Verify this account holder’s identity before confirming the unlock.</p>
            <label>Reason for clearing<textarea autoFocus className="form-control" required maxLength={1000} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
            <div className={styles.buttons}><button className={workspace.primary} disabled={busy || !reason.trim()}>{busy ? 'Clearing…' : 'Confirm clear cooldown'}</button><button type="button" className={workspace.secondary} disabled={busy} onClick={() => setSelected(null)}>Cancel</button></div>
        </form>}
        {loading && <p role="status">Loading security activity…</p>}
        {data && <>
            <section><h2>Active login cooldowns <span className={styles.count}>{data.activeTotal}</span></h2><p>Times reflect the last refresh. Refresh before reviewing another account.</p>
                <div className={workspace.tableWrap}><table className={workspace.table}><thead><tr><th>Account</th><th>Cooldown ends</th><th>Cooldown stage</th><th>Action</th></tr></thead><tbody>{data.cooldowns.map(account => <tr key={`${account.account_type}-${account.account_id}`}><td><AccountIdentity name={account.account_name} username={account.account_username} type={account.account_type} id={account.account_id}/></td><td>{date(Number(account.locked_until))}</td><td>{account.level}</td><td><button className={workspace.secondary} disabled={busy} onClick={() => { setSelected(account); setReason(''); setNotice(''); }}>Clear cooldown</button></td></tr>)}</tbody></table></div>
                {!data.cooldowns.length && <p>No active cooldowns on this page.</p>}
            </section>
            <section><h2>Login and unlock history <span className={styles.count}>{data.total}</span></h2><p>Review password checks and administrator unlocks. Records begin when security logging is enabled.</p>
                <div className={workspace.tableWrap}><table className={workspace.table}><thead><tr><th>Time</th><th>Account</th><th>Activity</th><th>Administrator</th><th>Reason</th></tr></thead><tbody>{data.events.map(event => <tr key={event.id}><td>{date(event.created_at)}</td><td><AccountIdentity name={event.account_name} username={event.account_username} type={event.account_type} id={event.account_id}/></td><td>{label(event.action)}</td><td>{event.actor_id ? <AccountIdentity name={event.actor_name} username={event.actor_username} type="staff" id={event.actor_id}/> : '—'}</td><td>{event.reason || '—'}</td></tr>)}</tbody></table></div>
                {!data.events.length && <p>No security activity matches these filters.</p>}
            </section>
            <nav className={styles.buttons} aria-label="Security activity pages"><button className={workspace.secondary} disabled={page === 1 || busy} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} · 50 records per table</span><button className={workspace.secondary} disabled={Math.max(data.total, data.activeTotal) <= page * 50 || busy} onClick={() => setPage(value => value + 1)}>Next</button></nav>
        </>}
    </main>;
}
