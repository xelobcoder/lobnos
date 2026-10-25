'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RiArrowLeftLine, RiEditLine, RiPriceTag3Line } from '@remixicon/react';
import { customFetch, customPost, currencyFormatter } from '../../Auth/customFetch';
import { StrategyRecord, allTests, dateLabel, flag, statusOf, strategyRoot } from './strategyUi';
import s from './StrategyWorkspace.module.css';

type Assignment = NonNullable<StrategyRecord['applicableEntities']>[number];
export default function StrategyDetails({ strategyId }: { strategyId: string }) {
    const [record, setRecord] = useState<StrategyRecord | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
    const [tab, setTab] = useState('tests'), [query, setQuery] = useState(''), [pending, setPending] = useState<Assignment | null>(null), [removing, setRemoving] = useState(false), [notice, setNotice] = useState('');
    useEffect(() => {
        let live = true; setLoading(true); setError(''); setRecord(null);
        customFetch(`billing/strategies/${strategyId}`).then((result: StrategyRecord) => {
            if (!result?.strategyid) throw new Error((result as any)?.message || 'This billing strategy could not be found.');
            if (live) setRecord(result);
        }).catch((err: unknown) => { if (live) setError(err instanceof Error ? err.message : 'Unable to load this strategy.'); })
          .finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [strategyId, retry]);
    async function removeAssignment() {
        if (!pending || removing) return;
        setRemoving(true); setError('');
        try {
            const result = await customPost(`billing/strategies/remove/entity/${strategyId}`, 'DELETE', { associatedid: pending.id, category: pending.entity_type });
            if (!result?.result) throw new Error(result?.message || 'Unable to remove this assignment.');
            setRecord(previous => previous ? { ...previous, applicableEntities: previous.applicableEntities?.filter(row => !(row.id === pending.id && row.entity_type === pending.entity_type)) } : previous);
            setNotice('Account assignment removed.'); setPending(null);
        } catch (err) { setError(err instanceof Error ? err.message : 'Unable to remove this assignment.'); }
        finally { setRemoving(false); }
    }
    const tests = record?.applicableTest || [], accounts = record?.applicableEntities || [];
    const matching = tests.filter(test => `${test.name} ${test.testid}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    return <div className={s.workspace}>
        <header className={s.header}><div className={s.heading}><span className={s.icon}><RiPriceTag3Line size={24}/></span><div><span className={s.eyebrow}>Billing configuration / Strategy #{strategyId}</span><h1>{record?.name || 'Strategy details'}</h1><p>{record?.description || 'Review pricing, validity and assigned accounts.'}</p></div></div><div className={s.actions}><Link className={s.secondary} href={`${strategyRoot}/strategies`}><RiArrowLeftLine size={18}/>All strategies</Link>{record && <Link className={s.primary} href={`${strategyRoot}/strategies/create?id=${strategyId}`}><RiEditLine size={18}/>Edit strategy</Link>}</div></header>
        {error && <div className={s.error} role="alert">{error}{!record && <button className={s.secondary} onClick={() => setRetry(retry + 1)}>Retry loading</button>}</div>}
        {notice && <div className={s.success} role="status">{notice}</div>}
        {loading ? <div className={`${s.panel} ${s.empty}`} role="status">Loading strategy details…</div> : record && <>
            <section className={s.panel} aria-label="Pricing overview"><div className={s.sectionTitle}><h2>Pricing overview</h2><div className={s.actions}><span className={`${s.badge} ${s[statusOf(record).toLowerCase()]}`}>{statusOf(record)}</span><span className={s.badge}>{flag(record.isNHIS) ? 'NHIS' : 'Non-NHIS'}</span></div></div><dl className={s.details}><div><dt>Pricing rule</dt><dd>{allTests(record) ? `${record.concessionMode === 'percentage' ? `${record.concessionValue}%` : currencyFormatter.format(Number(record.concessionValue))} ${record.price_type}` : 'Individual test prices'}</dd></div><div><dt>Test coverage</dt><dd>{allTests(record) ? 'All tests' : `${tests.length} selected tests`}</dd></div><div><dt>Assigned accounts</dt><dd>{accounts.filter(account => account.entity_type !== 'general').length}</dd></div><div><dt>Start date</dt><dd>{record.valid_from ? dateLabel(record.valid_from) : 'No start limit'}</dd></div><div><dt>End date</dt><dd>{record.valid_until ? dateLabel(record.valid_until) : 'No end date'}</dd></div><div><dt>Strategy ID</dt><dd>#{record.strategyid}</dd></div></dl></section>
            <section className={s.panel} style={{padding:0}}><div className={s.footer} role="tablist" aria-label="Strategy information"><div className={s.actions}>{[['tests', 'Test pricing'], ['accounts', 'Assigned accounts']].map(([key, label]) => <button key={key} id={`strategy-tab-${key}`} type="button" role="tab" tabIndex={tab === key ? 0 : -1} aria-selected={tab === key} aria-controls={`strategy-panel-${key}`} className={tab === key ? s.primary : s.secondary} onClick={() => setTab(key)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'tests' : event.key === 'End' ? 'accounts' : key === 'tests' ? 'accounts' : 'tests'; setTab(next); document.getElementById(`strategy-tab-${next}`)?.focus(); } }}>{label}{key === 'tests' ? ` (${allTests(record) ? 'all' : tests.length})` : ` (${accounts.filter(account => account.entity_type !== 'general').length})`}</button>)}</div></div>
            {tab === 'tests' ? <div role="tabpanel" id="strategy-panel-tests" aria-labelledby="strategy-tab-tests">{allTests(record) ? <div className={s.empty}><h2>One rule for every test</h2><p>This strategy applies a {record.concessionMode === 'percentage' ? `${record.concessionValue}%` : currencyFormatter.format(Number(record.concessionValue))} {record.price_type} to all tests. Test prices are calculated during billing.</p><Link className={s.secondary} href={`${strategyRoot}/strategies/create?id=${strategyId}`}>Change pricing rule</Link></div> : <><div className={s.footer}><div className={s.field} style={{width:'min(100%,420px)'}}><label htmlFor="strategy-detail-search">Search selected tests</label><input id="strategy-detail-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Test name or ID"/></div><span className={s.muted}>{matching.length} of {tests.length} tests</span></div>{matching.length ? <div className={s.tableWrap} role="region" aria-label="Saved test prices" tabIndex={0}><table className={s.table}><thead><tr><th scope="col">Test</th><th scope="col">Base price</th><th scope="col">Adjustment</th><th scope="col">Final price</th></tr></thead><tbody>{matching.map(test => <tr key={test.testid}><td><strong>{test.name}</strong><p>#{test.testid}</p></td><td>{currencyFormatter.format(Number(test.originalPrice))}</td><td>{test.concessionMode === 'percentage' ? `${test.concessionValue}%` : currencyFormatter.format(Number(test.concessionValue))} {test.pricingType}</td><td><strong>{currencyFormatter.format(Number(test.discountedValue))}</strong></td></tr>)}</tbody></table></div> : <div className={s.empty}><p>{tests.length ? 'No selected tests match your search.' : 'No individual test prices are configured.'}</p></div>}</>}</div> : <div role="tabpanel" id="strategy-panel-accounts" aria-labelledby="strategy-tab-accounts">
                <div className={s.footer}><p className={s.help}>Manage strategy assignments from the organization, insurance or clinician account.</p></div>
                {pending && <div className={s.notice} style={{margin:16}}><div><strong>Remove {pending.name || pending.insuranceName || 'this account'}?</strong><p>This account will no longer be linked to this strategy.</p></div><div className={s.actions}><button className={s.secondary} disabled={removing} onClick={() => setPending(null)}>Keep assignment</button><button className={s.danger} disabled={removing} onClick={() => void removeAssignment()}>{removing ? 'Removing…' : 'Remove assignment'}</button></div></div>}
                {accounts.some(account => account.entity_type !== 'general') ? <div className={s.tableWrap} role="region" aria-label="Assigned accounts" tabIndex={0}><table className={s.table}><thead><tr><th scope="col">Account</th><th scope="col">Category</th><th scope="col">Actions</th></tr></thead><tbody>{accounts.filter(account => account.entity_type !== 'general').map(account => <tr key={`${account.entity_type}-${account.id}`}><td><strong>{account.name || account.insuranceName || `Account #${account.id}`}</strong></td><td style={{textTransform:'capitalize'}}>{account.entity_type}</td><td><div className={s.actions}><Link className={s.textButton} href={`${strategyRoot}/${account.entity_type}/${account.id}/check`}>Manage assignment</Link><button className={s.textButton} disabled={removing} onClick={() => setPending(account)}>Remove</button></div></td></tr>)}</tbody></table></div> : <div className={s.empty}><h2>No accounts assigned</h2><p>Assign this strategy from an organization, insurance or clinician account. NHIS strategies are selected through the existing NHIS billing rules.</p></div>}
            </div>}</section>
        </>}
    </div>;
}
