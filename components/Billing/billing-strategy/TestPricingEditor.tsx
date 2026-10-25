'use client';
import { useEffect, useMemo, useState } from 'react';
import { customFetch, currencyFormatter } from '../../Auth/customFetch';
import { Mode, Pricing, StrategyTest, priceTest } from './strategyUi';
import s from './StrategyWorkspace.module.css';

export function pricingError(test: StrategyTest, discountOnly = false, maxPrice = 9999.99) {
    if (!Number.isFinite(test.concessionValue) || test.concessionValue < 0) return 'Enter a valid adjustment of zero or more.';
    if (discountOnly && test.pricingType !== 'discount') return 'Packages support discounts only.';
    if (test.pricingType === 'discount' && test.concessionValue > (test.concessionMode === 'percentage' ? 100 : test.originalPrice)) return 'The discount exceeds the test price.';
    if (!Number.isFinite(test.discountedValue) || test.discountedValue < 0 || test.discountedValue > maxPrice) return 'Enter a valid final price within the allowed range.';
    return '';
}
interface Props {
    tests: StrategyTest[]; onChange: (rows: StrategyTest[]) => void;
    defaults: { mode: Mode; type: Pricing; value: string }; discountOnly?: boolean; maxPrice?: number;
}
export default function TestPricingEditor({ tests, onChange, defaults, discountOnly = false, maxPrice = 9999.99 }: Props) {
    const [catalogue, setCatalogue] = useState<{ id: number; name: string; price: number }[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
    const [query, setQuery] = useState(''), [chosen, setChosen] = useState<number[]>([]), [page, setPage] = useState(1);
    const [rowQuery, setRowQuery] = useState(''), [rowPage, setRowPage] = useState(1), [marked, setMarked] = useState<number[]>([]);
    const [bulk, setBulk] = useState<'defaults' | 'final'>('defaults'), [bulkPrice, setBulkPrice] = useState(''), [confirm, setConfirm] = useState(false), [undo, setUndo] = useState<StrategyTest[] | null>(null), [notice, setNotice] = useState('');
    useEffect(() => {
        let live = true; setLoading(true); setError('');
        customFetch('testpanel/list/bulk').then(result => {
            if (result?.status !== 'success' || !Array.isArray(result.data)) throw new Error(result?.message || 'Unable to load tests.');
            if (live) setCatalogue(result.data.map((row: any) => ({ id: Number(row.id), name: row.name, price: Number(row.price || 0) })));
        }).catch((err: unknown) => { if (live) setError(err instanceof Error ? err.message : 'Unable to load tests.'); }).finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [retry]);
    const existing = useMemo(() => new Set(tests.map(row => row.testid)), [tests]);
    const matches = catalogue.filter(row => !existing.has(row.id) && `${row.id} ${row.name}`.toLowerCase().includes(query.trim().toLowerCase()));
    const current = Math.min(page, Math.max(1, Math.ceil(matches.length / 20))), visible = matches.slice((current - 1) * 20, current * 20);
    const filtered = tests.filter(row => `${row.testid} ${row.name}`.toLowerCase().includes(rowQuery.trim().toLowerCase()));
    const currentRowPage = Math.min(rowPage, Math.max(1, Math.ceil(filtered.length / 20))), shown = filtered.slice((currentRowPage - 1) * 20, currentRowPage * 20);
    const activeMarked = marked.filter(id => existing.has(id));
    const errors = tests.filter(test => pricingError(test, discountOnly, maxPrice));
    function commit(next: StrategyTest[], message: string) { setUndo(tests); onChange(next); setNotice(message); setConfirm(false); }
    function add() {
        const value = Number(defaults.value || 0);
        const added = catalogue.filter(row => chosen.includes(row.id) && !existing.has(row.id)).map(row => priceTest({ testid: row.id, name: row.name, originalPrice: row.price, actualPrice: row.price, concessionMode: defaults.mode, pricingType: discountOnly ? 'discount' : defaults.type, concessionValue: value, discountedValue: 0 }));
        const invalid = added.find(row => pricingError(row, discountOnly, maxPrice));
        if (invalid) { setError(`${invalid.name}: ${pricingError(invalid, discountOnly, maxPrice)} Change the default adjustment before adding these tests.`); return; }
        if (!added.length) return;
        setError(''); commit([...tests, ...added], `${added.length} tests added. Existing prices were kept.`); setChosen([]);
        document.getElementById('strategy-test-search')?.focus();
    }
    function edit(id: number, patch: Partial<StrategyTest>) { onChange(tests.map(row => row.testid === id ? priceTest({ ...row, ...patch }) : row)); setConfirm(false); setUndo(null); setNotice(''); }
    function applyBulk() {
        const next = tests.map(row => !activeMarked.includes(row.testid) ? row : bulk === 'final'
            ? priceTest({ ...row, concessionMode: 'absolute', pricingType: Number(bulkPrice) > row.originalPrice ? 'surcharge' : 'discount', concessionValue: bulkPrice === '' ? NaN : Math.abs(Number(bulkPrice) - row.originalPrice) })
            : priceTest({ ...row, concessionMode: defaults.mode, pricingType: discountOnly ? 'discount' : defaults.type, concessionValue: Number(defaults.value || 0) }));
        const invalid = next.find(row => activeMarked.includes(row.testid) && pricingError(row, discountOnly, maxPrice));
        if (invalid) { setError(`${invalid.name}: ${pricingError(invalid, discountOnly, maxPrice)} No prices were changed.`); setConfirm(false); return; }
        setError(''); commit(next, `Prices updated for ${activeMarked.length} selected tests.`);
    }
    return <div>
        {error && <div role="alert" className={s.error}>{error}<button type="button" className={s.secondary} onClick={() => setRetry(retry + 1)}>Reload catalogue</button></div>}
        {notice && <div role="status" className={s.notice}>{notice}{undo && <button type="button" className={s.textButton} onClick={() => { onChange(undo); setUndo(null); setNotice('Previous test selection and prices restored.'); }}>Undo last change</button>}</div>}
        <div className={s.testTools}><div className={s.field}><label htmlFor="strategy-test-search">Find tests to add</label><input id="strategy-test-search" type="search" placeholder="Search the full catalogue by name or ID" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}/></div><button type="button" className={s.primary} disabled={!chosen.length || loading} onClick={add}>Add {chosen.length || ''} selected tests</button></div>
        <div className={s.actions} style={{justifyContent:'flex-start'}}><button type="button" className={s.secondary} disabled={!matches.length || loading} onClick={() => setChosen(previous => [...new Set([...previous, ...matches.map(row => row.id)])])}>Select all {matches.length} matching tests</button><button type="button" className={s.textButton} disabled={!chosen.length} onClick={() => setChosen([])}>Clear selection ({chosen.length})</button></div>
        <div className={s.catalogue} role="region" aria-label="Available tests">{loading ? <p role="status">Loading the test catalogue…</p> : visible.length ? visible.map(row => <label key={row.id}><input type="checkbox" checked={chosen.includes(row.id)} onChange={event => setChosen(previous => event.target.checked ? [...previous, row.id] : previous.filter(id => id !== row.id))}/><strong>{row.name}</strong><span>{currencyFormatter.format(row.price)}</span></label>) : <p>No matching tests available to add.</p>}</div>
        <div className={s.footer}><span className={s.help}>{matches.length} matches · {chosen.length} selected across searches</span><div className={s.pager}><button type="button" className={s.secondary} disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous tests</button><span>{current} / {Math.max(1, Math.ceil(matches.length / 20))}</span><button type="button" className={s.secondary} disabled={current * 20 >= matches.length} onClick={() => setPage(current + 1)}>Next tests</button></div></div>
        <div className={s.sectionTitle}><h3>Selected tests ({tests.length})</h3><span className={s.help}>{errors.length ? `${errors.length} pricing errors to fix` : `Combined test price: ${currencyFormatter.format(tests.reduce((sum, row) => sum + row.discountedValue, 0))}`}</span></div>
        {tests.length > 0 && <>
            <div className={s.testTools}><div className={s.field}><label htmlFor="selected-test-search">Filter selected tests</label><input id="selected-test-search" type="search" value={rowQuery} onChange={event => { setRowQuery(event.target.value); setRowPage(1); }}/></div><button type="button" className={s.secondary} onClick={() => { setMarked(previous => [...new Set([...previous, ...filtered.map(row => row.testid)])]); setConfirm(false); }}>Mark all {filtered.length} matching rows</button><button type="button" className={s.textButton} onClick={() => { setMarked([]); setConfirm(false); }}>Clear marked ({activeMarked.length})</button></div>
            <div className={s.bulkBar}><div className={s.field}><label htmlFor="test-bulk-action">Bulk pricing for marked rows</label><select id="test-bulk-action" value={bulk} onChange={event => { setBulk(event.target.value as 'defaults' | 'final'); setConfirm(false); }}><option value="defaults">Use default adjustment above</option><option value="final">Set the same final price</option></select></div>{bulk === 'final' && <div className={s.field}><label htmlFor="test-bulk-price">Bulk final price (GHS)</label><input id="test-bulk-price" type="number" min="0" step="0.01" value={bulkPrice} onChange={event => { setBulkPrice(event.target.value); setConfirm(false); }}/></div>}<button type="button" className={s.secondary} disabled={!activeMarked.length} onClick={() => setConfirm(true)}>Review bulk change ({activeMarked.length})</button><button type="button" className={s.textButton} disabled={!activeMarked.length} onClick={() => { commit(tests.filter(row => !activeMarked.includes(row.testid)), `${activeMarked.length} tests removed from the draft.`); setMarked([]); }}>Remove marked rows</button></div>
            {confirm && <div className={s.notice}><p>Update <strong>{activeMarked.length}</strong> marked tests{bulk === 'final' ? ` to a final price of ${bulkPrice || '—'} GHS each` : ` using ${defaults.value || 0}${defaults.mode === 'percentage' ? '%' : ' GHS'} ${discountOnly ? 'discount' : defaults.type}`}? Unmarked prices stay unchanged.</p><div className={s.actions}><button type="button" className={s.secondary} onClick={() => setConfirm(false)}>Cancel bulk change</button><button type="button" className={s.primary} onClick={applyBulk}>Apply to marked tests</button></div></div>}
            <p className={s.help} style={{margin:'12px 0'}}>Enter moves to the next visible final-price field. Scroll the table sideways on smaller screens.</p>
            <div className={s.tableWrap} tabIndex={0} role="region" aria-label="Selected test pricing"><table className={`${s.table} ${s.testTable}`}><thead><tr><th>Test / base price</th><th>Adjustment</th><th>Calculate as</th><th>Value</th><th>Final price (GHS)</th><th>Action</th></tr></thead><tbody>{shown.map((row, index) => { const message = pricingError(row, discountOnly, maxPrice); return <tr key={row.testid}><td><label className={s.check}><input type="checkbox" aria-label={`Mark ${row.name}`} checked={activeMarked.includes(row.testid)} onChange={event => { setMarked(previous => event.target.checked ? [...previous, row.testid] : previous.filter(id => id !== row.testid)); setConfirm(false); }}/><div><span className={s.testName}>{row.name}</span><span className={s.testId}>#{row.testid} · {currencyFormatter.format(row.originalPrice)}</span></div></label>{message && <p className={s.rowError} id={`price-error-${row.testid}`}>{message}</p>}</td><td>{discountOnly ? 'Discount' : <select aria-label={`Adjustment for ${row.name}`} value={row.pricingType} onChange={event => edit(row.testid, { pricingType: event.target.value as Pricing })}><option value="discount">Discount</option><option value="surcharge">Surcharge</option></select>}</td><td><select aria-label={`Calculation for ${row.name}`} value={row.concessionMode} onChange={event => edit(row.testid, { concessionMode: event.target.value as Mode })}><option value="absolute">GHS</option><option value="percentage">%</option></select></td><td><input aria-label={`Adjustment value for ${row.name}`} aria-invalid={!!message} aria-describedby={message ? `price-error-${row.testid}` : undefined} type="number" min="0" step="0.01" value={Number.isFinite(row.concessionValue) ? row.concessionValue : ''} onChange={event => edit(row.testid, { concessionValue: event.target.value === '' ? NaN : Number(event.target.value) })}/></td><td><input id={`final-price-${row.testid}`} aria-label={`Final price for ${row.name}`} aria-invalid={!!message} aria-describedby={message ? `price-error-${row.testid}` : undefined} type="number" min="0" max={Number.isFinite(maxPrice) ? maxPrice : undefined} step="0.01" value={Number.isFinite(row.discountedValue) ? row.discountedValue : ''} onChange={event => { const value = event.target.value === '' ? NaN : Number(event.target.value); edit(row.testid, { concessionMode: 'absolute', pricingType: value > row.originalPrice ? 'surcharge' : 'discount', concessionValue: Math.abs(value - row.originalPrice) }); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); document.getElementById(`final-price-${shown[index + 1]?.testid}`)?.focus(); } }}/></td><td><button type="button" className={s.textButton} aria-label={`Remove ${row.name}`} onClick={() => commit(tests.filter(test => test.testid !== row.testid), `${row.name} removed from the draft.`)}>Remove</button></td></tr>; })}</tbody></table></div>
            <div className={s.footer}><span className={s.help}>{filtered.length} selected tests match · {activeMarked.length} marked</span><div className={s.pager}><button type="button" className={s.secondary} disabled={currentRowPage <= 1} onClick={() => setRowPage(currentRowPage - 1)}>Previous rows</button><span>{currentRowPage} / {Math.max(1, Math.ceil(filtered.length / 20))}</span><button type="button" className={s.secondary} disabled={currentRowPage * 20 >= filtered.length} onClick={() => setRowPage(currentRowPage + 1)}>Next rows</button></div></div>
        </>}
    </div>;
}
