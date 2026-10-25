'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customFetch, currencyFormatter } from '../../Auth/customFetch';
import { priceTest, dateLabel } from '../billing-strategy/strategyUi';
import { usePackageManager } from './packageAccess';
import s from '../billing-strategy/StrategyWorkspace.module.css';
export default function PackageDetails({ packageId }: { packageId: string }) {
    const manager = usePackageManager();
    const [data, setData] = useState<any>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [retry, setRetry] = useState(0), [query, setQuery] = useState('');
    useEffect(() => {
        let live = true; setLoading(true); setError('');
        customFetch(`packages/${encodeURIComponent(packageId)}/configuration`).then(result => {
            if (result?.status !== true || !result.data?.id) throw Error(result?.message || 'Unable to load this package.');
            if (live) setData(result.data);
        }).catch(err => { if (live) setError(err.message || 'Unable to load package.'); }).finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [packageId, retry]);
    const tests = (data?.tests || []).map((row: any) => priceTest({ testid: row.test_id, name: row.name, originalPrice: Number(row.price), actualPrice: Number(row.price), pricingType: 'discount', concessionMode: row.concession_mode === 'percentage' ? 'percentage' : 'absolute', concessionValue: Number(row.concession_value || 0), discountedValue: 0 }));
    const matches = tests.filter((row: any) => `${row.name} ${row.testid}`.toLowerCase().includes(query.trim().toLowerCase()));
    return <div className={`${s.workspace} ${s.packageWorkspace}`}><header className={s.header}><div><span className={s.eyebrow}>Billing / Packages / View only</span><h1>{loading ? 'Package details' : data?.package_name || 'Package details'}</h1><p>Review test panels, prices and applicability.</p></div><div className={s.actions}><Link className={s.secondary} href="/billing/packages">All packages</Link>{manager && data && <Link className={s.primary} href={`/billing/packages/create-new-package?id=${data.id}`}>Configure package</Link>}</div></header>
    {error && <div role="alert" className={s.error}>{error}<button type="button" className={s.secondary} onClick={() => setRetry(retry + 1)}>Retry</button></div>}
    {loading ? <p role="status">Loading package…</p> : !error && data && <>
        <section className={s.panel}><h2>Package summary</h2><p>{tests.length} tests · Combined test price: <strong>{currencyFormatter.format(tests.reduce((sum: number, row: any) => sum + row.discountedValue, 0))}</strong></p><p className={s.help}>Before other billing adjustments. Updated {data.updated_at ? dateLabel(data.updated_at) : 'date unavailable'}.</p></section>
        <section className={s.panel}><h2>Test panels & prices</h2><div className={s.field}><label htmlFor="package-view-search">Find a test in this package</label><input id="package-view-search" type="search" value={query} onChange={event => setQuery(event.target.value)}/></div><div className={s.tableWrap} role="region" aria-label="Package test panels" tabIndex={0}><table className={s.table}><thead><tr><th>Test panel</th><th>Base price</th><th>Discount</th><th>Package price</th></tr></thead><tbody>{matches.map((row: any) => <tr key={row.testid}><td>{row.name}<span className={s.testId}> #{row.testid}</span></td><td>{currencyFormatter.format(row.originalPrice)}</td><td>{row.concessionMode === 'percentage' ? `${row.concessionValue}%` : currencyFormatter.format(row.concessionValue)}</td><td>{currencyFormatter.format(row.discountedValue)}</td></tr>)}</tbody></table>{!matches.length && <p className={s.empty}>No matching tests.</p>}</div></section>
        <section className={s.panel}><h2>Who can use this package?</h2><p className={s.help}>Available to self-paying clients through the current billing rules. Organization and clinician eligibility follows the assignments below.</p>{(['organizations', 'clinicians'] as const).map(kind => <div key={kind} style={{marginTop:20}}><h3>{kind === 'organizations' ? 'Organizations' : 'Clinicians'} ({(data[kind] || []).length})</h3>{data[kind]?.length ? <ul>{data[kind].map((row: any) => <li key={row.id}>{row.name}{row.location ? ` — ${row.location}` : ''}</li>)}</ul> : <p className={s.help}>No {kind} assigned.</p>}</div>)}</section>
    </> }</div>;
}
