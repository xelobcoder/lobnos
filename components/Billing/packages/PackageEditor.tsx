'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customFetch, customPost, currencyFormatter } from '../../Auth/customFetch';
import TestPricingEditor, { pricingError } from '../billing-strategy/TestPricingEditor';
import OrganizationPicker, { SelectedOrganization } from '../billing-strategy/OrganizationPicker';
import { Mode, StrategyTest, priceTest } from '../billing-strategy/strategyUi';
import { usePackageManager } from './packageAccess';
import ApplicableClinicians from './ApplicableClinicians';
import s from '../billing-strategy/StrategyWorkspace.module.css';

export default function PackageEditor({ packageId }: { packageId?: string | null }) {
    const manager = usePackageManager();
    const router = useRouter(), lock = useRef(false), alert = useRef<HTMLDivElement>(null);
    const [savedId, setSavedId] = useState<number | null>(null), [name, setName] = useState(''), [tests, setTests] = useState<StrategyTest[]>([]), [organizations, setOrganizations] = useState<SelectedOrganization[]>([]), [revision, setRevision] = useState('');
    const [mode, setMode] = useState<Mode>('absolute'), [value, setValue] = useState('0');
    const [loading, setLoading] = useState(!!packageId), [loaded, setLoaded] = useState(!packageId), [saving, setSaving] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState(''), [dirty, setDirty] = useState(false), [leave, setLeave] = useState(false), [reload, setReload] = useState(false), [retry, setRetry] = useState(0), [clinicians, setClinicians] = useState(false);
    const id = packageId || savedId;
    function hydrate(data: any) {
        setName(data.package_name); setRevision(data.revision); setSavedId(Number(data.id)); setOrganizations(data.organizations || []);
        setTests((data.tests || []).map((row: any) => priceTest({ testid: Number(row.test_id), name: row.name, originalPrice: Number(row.price), actualPrice: Number(row.price), concessionMode: row.concession_mode === 'percentage' ? 'percentage' : 'absolute', concessionValue: Number(row.concession_value || 0), pricingType: 'discount', discountedValue: 0 })));
        setDirty(false); setLoaded(true);
    }
    useEffect(() => {
        if (!manager || !packageId) return;
        let live = true; setLoading(true); setLoaded(false); setError('');
        customFetch(`packages/${packageId}/configuration`).then(result => { if (result?.status !== true || !result.data?.id) throw new Error(result?.message || 'Unable to load this package.'); if (live) hydrate(result.data); })
            .catch((err: unknown) => { if (live) setError(err instanceof Error ? err.message : 'Unable to load package.'); }).finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [manager, packageId, retry]);
    useEffect(() => { if (error) alert.current?.focus(); }, [error]);
    useEffect(() => { if (!dirty) return; const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; }; window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard); }, [dirty]);
    function changed() { setDirty(true); setSuccess(''); }
    async function save() {
        if (!manager || lock.current || !loaded) return;
        setError(''); setSuccess('');
        if (!name.trim() || name.trim().length > 100) { setError('Enter a package name of 1–100 characters.'); return; }
        if (!tests.length) { setError('Select at least one test for this package.'); return; }
        const invalid = tests.find(row => pricingError(row, true, Infinity));
        if (invalid) { setError(`${invalid.name}: ${pricingError(invalid, true, Infinity)}`); return; }
        lock.current = true; setSaving(true);
        const payload = { package_name: name.trim(), expectedRevision: revision || undefined, organizationIds: organizations.map(row => row.id), tests: tests.map(row => ({ test_id: row.testid, concession_mode: row.concessionMode === 'absolute' && row.concessionValue === 0 ? 'none' : row.concessionMode, concession_value: row.concessionValue })) };
        try {
            const result = await customPost(id ? `packages/${id}/configuration` : 'packages/configuration', id ? 'PUT' : 'POST', payload);
            if (result?.status !== true || !result.data?.revision) throw new Error(result?.message || result?.error || 'Unable to save this package.');
            hydrate(result.data); setSuccess('Package name, test prices and organization assignments saved together.');
            if (!packageId) router.replace(`/billing/packages/create-new-package?id=${result.data.id}`);
        } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save this package. Your draft is kept.'); }
        finally { lock.current = false; setSaving(false); }
    }
    if (!manager) return <div className={s.workspace}><h1>Package configuration is restricted</h1><p>Administrators and managers can change packages.</p><Link href={packageId ? `/billing/packages/${packageId}` : "/billing/packages"}>View packages</Link></div>;
    return <div className={`${s.workspace} ${s.packageWorkspace}`}><header className={s.header}><div><span className={s.eyebrow}>Billing configuration / Packages</span><h1>{id ? 'Edit package' : 'Create package'}</h1><p>Select the tests, set their prices and link organizations in one workspace.</p></div><Link className={s.secondary} href="/billing/packages" onClick={event => { if (saving || dirty) { event.preventDefault(); if (!saving) setLeave(true); } }}>All packages</Link></header>
        {error && <div ref={alert} tabIndex={-1} role="alert" className={s.error}>{error}{packageId && <button type="button" className={s.secondary} onClick={() => dirty ? setReload(true) : setRetry(retry + 1)}>Reload saved package</button>}</div>}
        {success && <div role="status" className={s.success}>{success}</div>}
        {(leave || reload) && <div className={s.notice}><p>{reload ? 'Reloading discards this draft and loads the latest saved configuration.' : 'You have unsaved changes. Keep editing or discard this draft.'}</p><div className={s.actions}><button type="button" className={s.secondary} onClick={() => { setLeave(false); setReload(false); }}>Keep editing</button><button type="button" className={s.danger} onClick={() => { setDirty(false); if (reload) { setReload(false); setRetry(retry + 1); } else router.push('/billing/packages'); }}>{reload ? 'Discard draft & reload' : 'Discard & leave'}</button></div></div>}
        {loading ? <div role="status" className={`${s.panel} ${s.empty}`}>Loading package configuration…</div> : <form noValidate onSubmit={event => { event.preventDefault(); void save(); }}><fieldset disabled={saving || !loaded}><div className={s.editorGrid}><div className={s.formSections}>
            <section className={s.panel}><h2>1. Package name</h2><div className={s.field}><label htmlFor="package-name">Package name *</label><input id="package-name" required maxLength={100} value={name} placeholder="e.g. Executive wellness screening" onChange={event => { setName(event.target.value); changed(); }}/></div></section>
            <section className={s.panel}><h2>2. Tests & prices</h2><p className={s.help}>Package pricing supports a discount or the original test price. Set defaults for newly added tests, then adjust individual or marked rows.</p><div className={s.fields} style={{marginTop:16}}><div className={s.field}><label htmlFor="package-discount-mode">Default discount calculation</label><select id="package-discount-mode" value={mode} onChange={event => setMode(event.target.value as Mode)}><option value="absolute">Fixed amount (GHS)</option><option value="percentage">Percentage (%)</option></select></div><div className={s.field}><label htmlFor="package-discount-value">Default discount value</label><input id="package-discount-value" type="number" min="0" step="0.01" max={mode === 'percentage' ? 100 : undefined} value={value} onChange={event => setValue(event.target.value)}/></div></div><TestPricingEditor key={revision} tests={tests} onChange={rows => { setTests(rows); changed(); }} defaults={{mode,type:'discount',value}} discountOnly maxPrice={Infinity}/></section>
            <section className={s.panel}><h2>3. Organizations</h2><p className={s.help} style={{marginBottom:16}}>Select the organizations that can bill this package. Saving replaces this package’s organization links with the selection below. With no links, the package remains available to self-paying clients through the existing billing rules.</p><OrganizationPicker selected={organizations} onChange={rows => { setOrganizations(rows); changed(); }}/></section>
            <footer className={s.saveBar}><span className={s.muted} role="status">{dirty ? 'You have unsaved changes' : 'No unsaved changes'}</span><button className={s.primary} type="submit" disabled={saving}>{saving ? 'Saving…' : id ? 'Save package changes' : 'Create package'}</button></footer>
        </div><aside className={`${s.panel} ${s.summary}`} aria-label="Package review"><h2>Review package</h2><dl><div><dt>Name</dt><dd>{name || 'Not named yet'}</dd></div><div><dt>Tests</dt><dd>{tests.length}</dd></div><div><dt>Combined test price</dt><dd>{tests.some(row => pricingError(row, true, Infinity)) ? 'Fix pricing errors' : currencyFormatter.format(tests.reduce((sum, row) => sum + row.discountedValue, 0))}</dd></div><div><dt>Organizations</dt><dd>{organizations.length} selected</dd></div></dl><p className={s.help}>The displayed total is before other billing adjustments. Changes are saved together; clinician links stay unchanged.</p><button className={`${s.primary} ${s.reviewSave}`} type="submit" disabled={saving}>Save package from review</button></aside></div></fieldset></form>}
        {id && <section className={s.panel}><button type="button" className={s.secondary} onClick={() => setClinicians(!clinicians)}>{clinicians ? 'Hide' : 'Manage'} clinician assignments</button>{clinicians && <div style={{marginTop:16}}><ApplicableClinicians packageid={Number(id)}/></div>}</section>}
    </div>;
}
