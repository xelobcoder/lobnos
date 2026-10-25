'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiArrowLeftLine, RiCheckLine, RiSave3Line } from '@remixicon/react';
import { customFetch, customPost, currencyFormatter } from '../../Auth/customFetch';
import { Mode, Pricing, StrategyRecord, StrategyTest, allTests, flag, finalPrice, priceTest, strategyRoot } from './strategyUi';
import s from './StrategyWorkspace.module.css';
import TestPricingEditor from './TestPricingEditor';

interface FormState { name: string; description: string; all: boolean; nhis: boolean; mode: Mode; type: Pricing; value: string; from: string; until: string }
const initial: FormState = { name: '', description: '', all: true, nhis: false, mode: 'absolute', type: 'discount', value: '', from: '', until: '' };

export default function StrategyEditor({ strategyId }: { strategyId?: string | null }) {
    const router = useRouter();
    const [form, setForm] = useState<FormState>(initial), [tests, setTests] = useState<StrategyTest[]>([]);
    const [loading, setLoading] = useState(!!strategyId), [saving, setSaving] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
    const [dirty, setDirty] = useState(false), [leaving, setLeaving] = useState(false), [retry, setRetry] = useState(0);
    const [loaded, setLoaded] = useState(!strategyId);
    const lock = useRef(false), alert = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let live = true;
        if (!strategyId) { setForm(initial); setTests([]); setLoading(false); setLoaded(true); setDirty(false); setError(''); return; }
        setLoading(true); setLoaded(false); setError('');
        if (!/^\d+$/.test(strategyId) || Number(strategyId) <= 0) { setError('This strategy ID is invalid. Return to the strategy list.'); setLoading(false); return; }
        customFetch(`billing/strategies/${strategyId}`).then((row: StrategyRecord) => {
            if (!live) return;
            if (!row?.strategyid || !row.name) throw new Error((row as any)?.message || 'This billing strategy could not be loaded.');
            setForm({ name: row.name, description: row.description || '', all: allTests(row), nhis: flag(row.isNHIS), mode: row.concessionMode || 'absolute', type: row.price_type || 'discount', value: String(row.concessionValue ?? ''), from: row.valid_from?.slice(0, 10) || '', until: row.valid_until?.slice(0, 10) || '' });
            setTests((row.applicableTest || []).map(test => ({ ...test, originalPrice: Number(test.originalPrice), actualPrice: Number(test.actualPrice), concessionValue: Number(test.concessionValue), discountedValue: Number(test.discountedValue) })));
            setDirty(false); setLoaded(true);
        }).catch((err: unknown) => { if (live) setError(err instanceof Error ? err.message : 'Unable to load this strategy.'); })
          .finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [strategyId, retry]);
    useEffect(() => { if (error) alert.current?.focus(); }, [error]);
    useEffect(() => {
        if (!dirty) return;
        const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', prevent);
        return () => window.removeEventListener('beforeunload', prevent);
    }, [dirty]);
    function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm(previous => ({ ...previous, [key]: value })); setDirty(true); setSuccess(''); }
    async function save() {
        if (lock.current || loading) return;
        setError(''); setSuccess('');
        const value = Number(form.value || 0), name = form.name.trim();
        if (!name || name.length > 100) { setError('Enter a strategy name of 1–100 characters.'); return; }
        if (!Number.isFinite(value) || value < 0 || value > 9999.99 || form.all && value === 0) { setError('For all tests, enter an adjustment greater than zero and no more than 9,999.99.'); return; }
        if (form.all && form.mode === 'percentage' && form.type === 'discount' && value > 100) { setError('A percentage discount cannot exceed 100%.'); return; }
        if (form.from && form.until && form.from >= form.until) { setError('The end date must be after the start date.'); return; }
        if (!form.all && !tests.length) { setError('Add at least one test before saving individual pricing.'); return; }
        const invalid = !form.all && tests.find(test => !Number.isFinite(test.concessionValue) || test.concessionValue < 0 || test.pricingType === 'discount' && (test.concessionMode === 'percentage' ? test.concessionValue > 100 : test.concessionValue > test.originalPrice) || !Number.isFinite(test.discountedValue) || test.discountedValue > 9999.99);
        if (invalid) { setError(`Check the pricing for ${invalid.name}. Discounts cannot exceed the test price; the final price must be no more than 9,999.99.`); return; }
        const payload = { name, description: form.description, allconcessionApplied: form.all, isNHIS: form.nhis, concessionMode: form.mode, concessionValue: value, price_type: form.type, valid_from: form.from || null, valid_until: form.until || null, applicableTest: form.all ? [] : tests.map(priceTest) };
        lock.current = true; setSaving(true);
        try {
            const result = await customPost(strategyId ? `billing/strategies/${strategyId}` : 'billing/strategies', strategyId ? 'PUT' : 'POST', payload);
            if (result?.status === false || result?.error || !(result?.status === true || Number(result?.strategyId) > 0 || result?.strategyId === -1)) throw new Error(result?.message || result?.error || 'Unable to save this billing strategy.');
            setDirty(false); setSuccess(result.message || 'Billing strategy saved successfully.');
            if (!strategyId && Number(result.strategyId) > 0) router.replace(`${strategyRoot}/strategies/create?id=${result.strategyId}`);
        } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save this strategy. Your changes are still here.'); }
        finally { lock.current = false; setSaving(false); }
    }
    const value = Number(form.value || 0), example = finalPrice(100, form.mode, form.type, Number.isFinite(value) ? value : 0);
    return <div className={s.workspace}>
        <header className={s.header}><div><span className={s.eyebrow}>Billing configuration / {strategyId ? `Strategy #${strategyId}` : 'New strategy'}</span><h1>{strategyId ? 'Edit billing strategy' : 'Create billing strategy'}</h1><p>Define the pricing rule, choose test coverage and review before saving.</p></div><Link className={s.secondary} href={`${strategyRoot}/strategies`} onClick={event => { if (saving) { event.preventDefault(); return; } if (dirty) { event.preventDefault(); setLeaving(true); } }}><RiArrowLeftLine size={18}/>All strategies</Link></header>
        {leaving && <div className={s.notice}><div><strong>You have unsaved changes.</strong><p>Save this strategy or discard your changes before leaving.</p></div><div className={s.actions}><button className={s.secondary} onClick={() => setLeaving(false)}>Keep editing</button><button className={s.danger} onClick={() => { setDirty(false); router.push(`${strategyRoot}/strategies`); }}>Discard & leave</button></div></div>}
        {error && <div className={s.error} role="alert" tabIndex={-1} ref={alert}>{error}{strategyId && !form.name && <button className={s.secondary} onClick={() => setRetry(retry + 1)}>Retry loading</button>}</div>}
        {success && <div className={s.success} role="status"><span><RiCheckLine size={18}/> {success}</span>{strategyId && <Link className={s.textButton} href={`${strategyRoot}/details/${strategyId}`}>View strategy</Link>}</div>}
        {loading ? <section className={`${s.panel} ${s.empty}`} role="status">Loading strategy settings…</section> : <form onSubmit={event => { event.preventDefault(); void save(); }}>
            <fieldset disabled={saving || !loaded}>
                <div className={s.editorGrid}><div className={s.formSections}>
                    <section className={s.panel}><div className={s.sectionTitle}><h2>1. Strategy details</h2><span className={s.muted}>* Required</span></div><div className={s.fields}><div className={`${s.field} ${s.spanAll}`}><label htmlFor="strategy-name">Strategy name *</label><input id="strategy-name" required maxLength={100} placeholder="e.g. Corporate partner pricing" autoComplete="off" value={form.name} onChange={event => update('name', event.target.value)}/></div><div className={`${s.field} ${s.spanAll}`}><label htmlFor="strategy-description">Description <span className={s.muted}>(optional)</span></label><textarea id="strategy-description" rows={2} placeholder="Describe who this pricing is for." value={form.description} onChange={event => update('description', event.target.value)}/></div></div><div className={s.choices} role="radiogroup" aria-label="Test coverage"><label className={s.choice}><input type="radio" name="coverage" checked={form.all} onChange={() => update('all', true)}/><div><strong>All tests</strong><span>Apply one adjustment across the test catalogue.</span></div></label><label className={s.choice}><input type="radio" name="coverage" checked={!form.all} onChange={() => update('all', false)}/><div><strong>Selected tests</strong><span>Set and review a price for each selected test.</span></div></label></div><label className={s.check}><input type="checkbox" checked={form.nhis} onChange={event => update('nhis', event.target.checked)}/><div><strong>Use as the NHIS strategy</strong><p className={s.help}>Only one NHIS strategy can be configured. Review your approved tariffs before saving.</p></div></label></section>
                    <section className={s.panel}><h2>2. {form.all ? 'Pricing rule' : 'Individual test pricing'}</h2><p className={s.help} style={{marginBottom:16}}>{form.all ? 'The rule applies to every test covered by this strategy.' : 'Set a default adjustment, select multiple tests, then edit any row. Existing row prices stay unchanged when the defaults change.'}</p><div className={s.fields} style={{gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))'}}><div className={s.field}><label htmlFor="strategy-price-type">Adjustment</label><select id="strategy-price-type" value={form.type} onChange={event => update('type', event.target.value as Pricing)}><option value="discount">Discount</option><option value="surcharge">Surcharge</option></select></div><div className={s.field}><label htmlFor="strategy-price-mode">Calculate as</label><select id="strategy-price-mode" value={form.mode} onChange={event => update('mode', event.target.value as Mode)}><option value="absolute">Fixed amount (GHS)</option><option value="percentage">Percentage (%)</option></select></div><div className={s.field}><label htmlFor="strategy-value">{form.mode === 'percentage' ? 'Percentage (%)' : 'Amount (GHS)'}</label><input id="strategy-value" type="number" min={form.all ? '0.01' : '0'} step="0.01" max={form.type === 'discount' && form.mode === 'percentage' ? 100 : 9999.99} required={form.all} value={form.value} onChange={event => update('value', event.target.value)} placeholder="0.00"/></div></div>
                    {!form.all && <TestPricingEditor tests={tests} onChange={next => { setTests(next); setDirty(true); setSuccess(''); }} defaults={{mode:form.mode,type:form.type,value:form.value}}/>}
                    </section>
                    <section className={s.panel}><h2>3. Validity period</h2><p className={s.help} style={{marginBottom:16}}>Leave either date empty to keep that side of the period unrestricted.</p><div className={s.fields}><div className={s.field}><label htmlFor="strategy-from">Start date</label><input id="strategy-from" type="date" value={form.from} onChange={event => update('from', event.target.value)}/></div><div className={s.field}><label htmlFor="strategy-until">End date</label><input id="strategy-until" type="date" value={form.until} min={form.from || undefined} onChange={event => update('until', event.target.value)}/></div></div></section>
                    <footer className={s.saveBar}><span className={s.muted} role="status">{saving ? 'Saving your strategy…' : dirty ? 'You have unsaved changes' : 'No unsaved changes'}</span><div className={s.actions}><button type="submit" className={s.primary} disabled={saving}><RiSave3Line size={18}/>{saving ? 'Saving…' : strategyId ? 'Save changes' : 'Create strategy'}</button></div></footer>
                </div><aside className={`${s.panel} ${s.summary}`} aria-label="Strategy review"><h2>Review your strategy</h2><dl><div><dt>Name</dt><dd>{form.name || 'Not named yet'}</dd></div><div><dt>Scheme</dt><dd>{form.nhis ? 'NHIS' : 'Standard pricing'}</dd></div><div><dt>Coverage</dt><dd>{form.all ? 'All tests' : `${tests.length} selected tests`}</dd></div><div><dt>Starts</dt><dd>{form.from || 'No start limit'}</dd></div><div><dt>Ends</dt><dd>{form.until || 'No end date'}</dd></div></dl>{form.all ? <div className={s.notice}><div className={s.definition}><span>Example on a GHS 100 test</span><strong>{currencyFormatter.format(example)}</strong><span className={s.help}>{form.value || '0'}{form.mode === 'percentage' ? '%' : ' GHS'} {form.type}. Illustrative price before other billing adjustments.</span></div></div> : <p className={s.help}>Review each final price in the selected tests table. Unselected tests keep their existing billing behaviour.</p>}<p className={s.help}>Saving updates the pricing configuration. Account assignments are managed separately.</p><button type="submit" className={`${s.primary} ${s.reviewSave}`} disabled={saving} aria-label="Save strategy from review"><RiSave3Line size={18}/>{saving ? 'Saving…' : 'Save strategy'}</button></aside></div>
            </fieldset>
        </form>}
    </div>;
}
