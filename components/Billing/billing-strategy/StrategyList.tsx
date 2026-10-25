'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { RiAddLine, RiPriceTag3Line, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { customFetch, customPost, currencyFormatter } from '../../Auth/customFetch';
import { StrategyRecord, allTests, flag, filterStrategies, statusOf, dateLabel, strategyRoot } from './strategyUi';
import s from './StrategyWorkspace.module.css';

export default function StrategyList() {
    const [rows, setRows] = useState<StrategyRecord[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
    const [query, setQuery] = useState(''), [scheme, setScheme] = useState('all'), [scope, setScope] = useState('all'), [status, setStatus] = useState('all');
    const [page, setPage] = useState(1), [pending, setPending] = useState<StrategyRecord | null>(null), [deleting, setDeleting] = useState(false), [notice, setNotice] = useState('');
    const requestId = useRef(0);
    async function load() {
        const id = ++requestId.current; setLoading(true); setError('');
        try {
            // Fetch lightweight headers, without hydrating every test/account mapping.
            const records: StrategyRecord[] = [];
            for (let page = 1; ; page++) {
                const result = await customFetch(`billing/strategies/all/mini?page=${page}&count=100&sortby=DESC`);
                if (id !== requestId.current) return;
                const batch = Array.isArray(result) ? result : result?.message === 'No billing strategies found.' ? [] : null;
                if (!batch) throw new Error(result?.message || result?.error || 'Unable to load billing strategies.');
                records.push(...batch.filter(Boolean));
                if (batch.length < 100) break;
            }
            if (id === requestId.current) setRows([...new Map(records.map(row => [row.strategyid, row])).values()].sort((a, b) => Number(b.strategyid) - Number(a.strategyid)));
        } catch (err) { if (id === requestId.current) setError(err instanceof Error ? err.message : 'Unable to load billing strategies.'); }
        finally { if (id === requestId.current) setLoading(false); }
    }
    useEffect(() => { void load(); return () => { requestId.current++; }; }, []);
    const filtered = useMemo(() => filterStrategies(rows, query, scheme, scope, status), [rows, query, scheme, scope, status]);
    const maxPage = Math.max(1, Math.ceil(filtered.length / 10)), currentPage = Math.min(page, maxPage);
    const displayed = filtered.slice((currentPage - 1) * 10, currentPage * 10);
    function change(set: (value: string) => void, value: string) { set(value); setPage(1); }
    async function remove() {
        if (!pending || deleting) return;
        setDeleting(true); setError('');
        try {
            const result = await customPost(`billing/strategies/${pending.strategyid}`, 'DELETE', {});
            if (result?.status !== true) throw new Error(result?.message || 'Unable to delete this strategy.');
            setRows(previous => previous.filter(row => row.strategyid !== pending.strategyid)); setNotice(`“${pending.name}” was deleted.`); setPending(null);
        } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete this strategy.'); }
        finally { setDeleting(false); }
    }
    return <div className={s.workspace}>
        <header className={s.header}><div className={s.heading}><span className={s.icon}><RiPriceTag3Line size={24}/></span><div><span className={s.eyebrow}>Billing configuration</span><h1>Billing strategies</h1><p>Manage pricing rules, test coverage and NHIS tariffs.</p></div></div><div className={s.actions}><button className={s.secondary} onClick={() => void load()} disabled={loading || deleting}><RiRefreshLine size={18}/>Refresh</button><Link className={s.primary} href={`${strategyRoot}/strategies/create`}><RiAddLine size={19}/>New strategy</Link></div></header>
        <div className={s.stats} aria-label="Strategy overview">{[['Total strategies', rows.length], ['Active now', rows.filter(row => statusOf(row) === 'Active').length], ['NHIS strategies', rows.filter(row => flag(row.isNHIS)).length]].map(([label, count]) => <div className={s.stat} key={label}><span className={s.icon}><RiPriceTag3Line size={21}/></span><div><strong>{loading ? '—' : count}</strong><span>{label}</span></div></div>)}</div>
        {error && <div role="alert" className={s.error}><span>{error}</span><button className={s.secondary} onClick={() => void load()} disabled={loading || deleting}>Retry loading</button></div>}
        {notice && <div className={s.success} role="status">{notice}<button className={s.textButton} onClick={() => setNotice('')}>Dismiss</button></div>}
        {pending && <div className={s.notice} role="region" aria-label="Confirm strategy deletion"><div><strong>Delete “{pending.name}”?</strong><p>This removes the strategy and its linked pricing configuration.</p></div><div className={s.actions}><button autoFocus className={s.secondary} disabled={deleting} onClick={() => setPending(null)}>Keep strategy</button><button className={s.danger} disabled={deleting} onClick={() => void remove()}>{deleting ? 'Deleting…' : 'Delete strategy'}</button></div></div>}
        <section className={s.panel} style={{padding:0}} aria-label="Billing strategy catalogue" aria-busy={loading}>
            <div className={s.toolbar}><div className={s.field}><label htmlFor="strategy-search"><RiSearchLine size={16}/> Search strategies</label><input id="strategy-search" type="search" placeholder="Name, description or strategy ID" value={query} onChange={e => change(setQuery, e.target.value)}/></div><div className={s.field}><label htmlFor="strategy-scheme">Scheme</label><select id="strategy-scheme" value={scheme} onChange={e => change(setScheme, e.target.value)}><option value="all">All schemes</option><option value="nhis">NHIS</option><option value="standard">Non-NHIS</option></select></div><div className={s.field}><label htmlFor="strategy-scope">Test coverage</label><select id="strategy-scope" value={scope} onChange={e => change(setScope, e.target.value)}><option value="all">All coverage</option><option value="all-tests">All tests</option><option value="selected">Selected tests</option></select></div><div className={s.field}><label htmlFor="strategy-status">Status</label><select id="strategy-status" value={status} onChange={e => change(setStatus, e.target.value)}><option value="all">Any status</option><option>Active</option><option>Scheduled</option><option>Expired</option></select></div></div>
            {loading ? <div className={s.empty} role="status">Loading billing strategies…</div> : !filtered.length ? <div className={s.empty}><RiPriceTag3Line size={32}/><h2>{rows.length ? 'No matching strategies' : error ? 'Strategies are unavailable' : 'Create your first strategy'}</h2><p>{rows.length ? 'Try a different search or clear the filters.' : error ? 'Retry loading to see your saved strategies.' : 'Set up a pricing rule for all tests or choose individual test prices.'}</p>{rows.length > 0 && <button className={s.secondary} onClick={() => { setQuery(''); setScheme('all'); setScope('all'); setStatus('all'); setPage(1); }}>Clear filters</button>}</div> : <>
                <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Strategy results"><table className={s.table}><thead><tr><th scope="col">Strategy</th><th scope="col">Pricing rule</th><th scope="col">Coverage</th><th scope="col">Validity</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody>{displayed.map(row => <tr key={row.strategyid}><td><Link href={`${strategyRoot}/details/${row.strategyid}`} className={s.name}>{row.name}</Link><p>#{row.strategyid}{flag(row.isNHIS) ? ' · NHIS' : ''}{row.description ? ` · ${row.description}` : ''}</p></td><td>{allTests(row) ? <><strong>{row.concessionMode === 'percentage' ? `${row.concessionValue}%` : currencyFormatter.format(Number(row.concessionValue))}</strong><p>{row.price_type === 'surcharge' ? 'Surcharge' : 'Discount'} per test</p></> : <><strong>Individual pricing</strong><p>Configured per test</p></>}</td><td>{allTests(row) ? 'All tests' : row.applicableTest ? `${row.applicableTest.length} selected tests` : 'Selected tests'}</td><td>{row.valid_from ? dateLabel(row.valid_from) : 'No start limit'}<p>{row.valid_until ? `Until ${dateLabel(row.valid_until)}` : 'No end date'}</p></td><td><span className={`${s.badge} ${s[statusOf(row).toLowerCase()]}`}>{statusOf(row)}</span></td><td><div className={s.actions}><Link className={s.textButton} aria-label={`View ${row.name}`} href={`${strategyRoot}/details/${row.strategyid}`}>View</Link><Link className={s.textButton} aria-label={`Edit ${row.name}`} href={`${strategyRoot}/strategies/create?id=${row.strategyid}`}>Edit</Link><button className={s.textButton} disabled={deleting} onClick={() => { setPending(row); setNotice(''); }} aria-label={`Delete ${row.name}`}>Delete</button></div></td></tr>)}</tbody></table></div>
                <footer className={s.footer}><span className={s.muted} aria-live="polite">{(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, filtered.length)} of {filtered.length} strategies</span><nav className={s.pager} aria-label="Strategy pages"><button className={s.secondary} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {maxPage}</span><button className={s.secondary} disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></nav></footer>
            </>}
        </section>
    </div>;
}
