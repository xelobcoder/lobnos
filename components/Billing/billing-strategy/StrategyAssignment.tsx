'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customFetch, customPost, currencyFormatter } from '../../Auth/customFetch';
import { StrategyRecord, allTests, dateLabel, statusOf, strategyRoot } from './strategyUi';
import s from './StrategyWorkspace.module.css';

export default function StrategyAssignment({ entityType, entityId }: { entityType: string; entityId: string }) {
    const [rows, setRows] = useState<StrategyRecord[]>([]), [account, setAccount] = useState<any>(null), [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [retry, setRetry] = useState(0), [query, setQuery] = useState('');
    useEffect(() => {
        let live = true; setLoading(true); setError('');
        if (!['clinician', 'insurance', 'organization', 'general'].includes(entityType) || !/^\d+$/.test(entityId)) { setError('This account link is invalid.'); setLoading(false); return; }
        customFetch(`billing/strategies/all?entitytype=${encodeURIComponent(entityType)}&entityid=${encodeURIComponent(entityId)}`).then(result => {
            if (!live) return;
            if (!Array.isArray(result?.strategies)) {
                if (result?.message === 'No billing strategies found.') { setRows([]); return; }
                throw new Error(result?.message || result?.error || 'Unable to load strategies for this account.');
            }
            setRows(result.strategies);
            setAccount(Array.isArray(result.entityInformation) ? result.entityInformation[0] : result.entityInformation);
        }).catch((err: unknown) => { if (live) setError(err instanceof Error ? err.message : 'Unable to load strategies.'); })
          .finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [entityType, entityId, retry]);
    const assigned = (row: StrategyRecord) => row.applicableEntities?.some(entity => entity.entity_type === entityType && Number(entity.id) === Number(entityId));
    const current = rows.filter(assigned), chosen = rows.find(row => String(row.strategyid) === selected);
    const available = rows.filter(row => `${row.name} ${row.description || ''} ${row.strategyid}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    async function apply() {
        if (!chosen || saving || statusOf(chosen) === 'Expired' || assigned(chosen)) return;
        setSaving(true); setError(''); setNotice('');
        try {
            const result = await customPost(`billing/strategies/apply/strategy/entity/${chosen.strategyid}`, 'POST', { category: entityType, associatedid: Number(entityId) });
            if (!result?.result) throw new Error(result?.message || 'Unable to assign this strategy.');
            setRows(previous => previous.map(row => row.strategyid === chosen.strategyid ? { ...row, applicableEntities: [...(row.applicableEntities || []), { id: Number(entityId), entity_type: entityType, name: account?.name || account?.insuranceName }] } : row));
            setNotice(`“${chosen.name}” is now assigned to this account.`);
        } catch (err) { setError(err instanceof Error ? err.message : 'Unable to assign this strategy. Your selection has been kept.'); }
        finally { setSaving(false); }
    }
    return <div className={s.workspace}>
        <header className={s.header}><div><span className={s.eyebrow}>Billing configuration / Account pricing</span><h1>Assign a billing strategy</h1><p>{account?.name || account?.insuranceName || `Account #${entityId}`} · <span style={{textTransform:'capitalize'}}>{entityType}</span></p></div><Link className={s.secondary} href={`${strategyRoot}/strategies`}>All strategies</Link></header>
        {error && <div role="alert" className={s.error}>{error}<button className={s.secondary} disabled={loading || saving} onClick={() => setRetry(retry + 1)}>Retry loading</button></div>}
        {notice && <div role="status" className={s.success}>{notice}<Link className={s.textButton} href={`${strategyRoot}/details/${selected}`}>View strategy</Link></div>}
        {loading ? <div role="status" className={`${s.panel} ${s.empty}`}>Loading account pricing…</div> : <>
            {current.length > 0 && <section className={s.panel}><h2>Currently assigned</h2><div className={s.actions} style={{justifyContent:'flex-start'}}>{current.map(row => <Link key={row.strategyid} className={s.secondary} href={`${strategyRoot}/details/${row.strategyid}`}>{row.name}</Link>)}</div><p className={s.help} style={{marginTop:12}}>Existing assignments stay in place. Open a strategy to review or remove its account link.</p></section>}
            <div className={s.editorGrid}><section className={s.panel}><h2>1. Choose a strategy</h2><div className={s.field}><label htmlFor="assignment-search">Search available strategies</label><input id="assignment-search" type="search" placeholder="Name, description or ID" value={query} disabled={saving} onChange={event => setQuery(event.target.value)}/></div><div className={s.catalogue} role="radiogroup" aria-label="Available billing strategies">{available.length ? available.map(row => <label key={row.strategyid}><input type="radio" name="account-strategy" disabled={saving || statusOf(row) === 'Expired'} checked={selected === String(row.strategyid)} onChange={() => { setSelected(String(row.strategyid)); setNotice(''); }}/><strong>{row.name}</strong><span className={s.badge}>{assigned(row) ? 'Assigned' : statusOf(row)}</span></label>) : <p>No strategies match. {rows.length ? 'Try a different search.' : 'Create a strategy to configure account pricing.'}</p>}</div>{!rows.length && <Link className={s.primary} style={{marginTop:16}} href={`${strategyRoot}/strategies/create`}>Create strategy</Link>}</section>
            <aside className={`${s.panel} ${s.summary}`} aria-label="Assignment review"><h2>2. Review & assign</h2>{chosen ? <><h3>{chosen.name}</h3>{chosen.description && <p className={s.help}>{chosen.description}</p>}<dl><div><dt>Coverage</dt><dd>{allTests(chosen) ? 'All tests' : `${chosen.applicableTest?.length || 0} selected tests`}</dd></div><div><dt>Pricing</dt><dd>{allTests(chosen) ? `${chosen.concessionMode === 'percentage' ? `${chosen.concessionValue}%` : currencyFormatter.format(Number(chosen.concessionValue))} ${chosen.price_type}` : 'Individual test prices'}</dd></div><div><dt>Starts</dt><dd>{chosen.valid_from ? dateLabel(chosen.valid_from) : 'No start limit'}</dd></div><div><dt>Ends</dt><dd>{chosen.valid_until ? dateLabel(chosen.valid_until) : 'No end date'}</dd></div></dl><Link className={s.textButton} href={`${strategyRoot}/details/${chosen.strategyid}`}>View full pricing details</Link></> : <p className={s.help}>Choose a strategy to review its pricing and validity before assigning it to this account.</p>}<button className={s.primary} disabled={!chosen || saving || !!chosen && (statusOf(chosen) === 'Expired' || !!assigned(chosen))} onClick={() => void apply()}>{saving ? 'Assigning…' : chosen && assigned(chosen) ? 'Already assigned' : 'Assign strategy'}</button></aside></div>
        </>}
    </div>;
}
