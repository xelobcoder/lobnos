'use client';
import { useEffect, useRef, useState } from 'react';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import s from '../../../../../components/accessories/DirectoryWorkspace.module.css';
interface Panel {
    id: number;
    name: string;
    price: string;
    cost: string;
    shorttext: string;
    category: string;
}
const validAmount = (value: string) => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;
export default function TestPanelPricing() {
    const [rows, setRows] = useState<Panel[]>([]), [original, setOriginal] = useState<Panel[]>([]), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [query, setQuery] = useState(''), [changedOnly, setChangedOnly] = useState(false), [page, setPage] = useState(1), [linkCost, setLinkCost] = useState(false), [revision, setRevision] = useState(0);
    const lock = useRef(false);
    useEffect(() => { let live = true; setLoading(true); setError(''); customFetch('testpanel/list/bulk').then(response => { if (!live)
        return; if (!Array.isArray(response?.data))
        throw Error(response?.message || 'Test panel pricing could not be loaded'); const data: Panel[] = response.data.map((row: any) => ({ id: Number(row.id), name: row.name || '', shorttext: row.shorttext || '', category: row.category || '', price: String(row.testprice ?? 0), cost: String(row.testcost ?? 0) })); setRows(data); setOriginal(data); }).catch(e => { if (live)
        setError(e.message || 'Pricing could not be loaded'); }).finally(() => { if (live)
        setLoading(false); }); return () => { live = false; }; }, [revision]);
    const originals = new Map(original.map(row => [row.id, row]));
    const isChanged = (row: Panel) => { const previous = originals.get(row.id); return !!previous && (!validAmount(row.price) || !validAmount(row.cost) || Number(row.price) !== Number(previous.price) || Number(row.cost) !== Number(previous.cost)); };
    const changed = rows.filter(isChanged), filtered = rows.filter(row => (!changedOnly || isChanged(row)) && [row.name, row.shorttext, row.category, row.id].join(' ').toLowerCase().includes(query.trim().toLowerCase())), last = Math.max(1, Math.ceil(filtered.length / 20)), current = Math.min(page, last);
    function update(id: number, field: 'price' | 'cost', value: string) { setNotice(''); setRows(all => all.map(row => row.id === id ? { ...row, [field]: value, ...(field === 'price' && linkCost ? { cost: value } : {}) } : row)); }
    function reload() { if (changed.length && !window.confirm('Discard unsaved pricing changes and reload?'))
        return; setNotice(''); setRevision(v => v + 1); }
    async function save(e: React.FormEvent) { e.preventDefault(); if (lock.current || !changed.length)
        return; setError(''); setNotice(''); const invalid = changed.find(row => !validAmount(row.price) || !validAmount(row.cost)); if (invalid) {
        setError(`Enter non-negative prices and costs for ${invalid.name}. Blank amounts cannot be saved.`);
        return;
    } const snapshot = rows.map(row => ({ ...row })); lock.current = true; setSaving(true); try {
        const response = await customPost('testpanel/bulkpricing', 'PUT', { tests: changed.map(row => ({ testid: row.id, price: Number(row.price), cost: Number(row.cost) })) });
        if (response?.status !== 'success' || response?.statusCode !== 200)
            throw Error(response?.message || 'Pricing changes were not saved');
        setOriginal(snapshot);
        setNotice(`${changed.length} test panel${changed.length === 1 ? '' : 's'} updated.`);
    }
    catch (e: any) {
        setError(e.message || 'Pricing was not saved. Your edits have been kept.');
    }
    finally {
        lock.current = false;
        setSaving(false);
    } }
    return <main className={s.workspace}><header className={s.header}><div><span className={s.eyebrow}>TEST PANELS / CATALOGUE PRICING</span><h1>Test panel pricing</h1><p>Review selling prices and costs. Only changed tests are submitted.</p></div><div className={s.actions}><button className={s.secondary} type="button" disabled={loading || saving} onClick={reload}>Reload prices</button><button className={s.primary} type="submit" form="panel-pricing" disabled={loading || saving || !changed.length}>{saving ? 'Saving…' : `Save changes (${changed.length})`}</button></div></header>{error && <div role="alert" className={s.error}>{error}{!rows.length && <button className={s.secondary} onClick={() => setRevision(v => v + 1)}>Retry pricing</button>}</div>}{notice && <div className={s.success} role="status">{notice}</div>}<form id="panel-pricing" onSubmit={save}><fieldset disabled={loading || saving} style={{ border: 0, padding: 0, minWidth: 0 }}><section className={s.panel} aria-label="Test panel price editor"><div className={s.toolbar}><div><h2>Catalogue prices</h2><p className={s.help}>{filtered.length} matching · {changed.length} unsaved changes</p></div><div className={s.tools}><input className={s.search} type="search" aria-label="Search test panels" placeholder="Test, code or category" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}/><label><input type="checkbox" checked={changedOnly} onChange={e => { setChangedOnly(e.target.checked); setPage(1); }}/>Changed only</label></div></div><div className={s.toolbar}><label className={s.help}><input type="checkbox" checked={linkCost} onChange={e => setLinkCost(e.target.checked)}/> Match cost when I edit a selling price</label><div className={s.actions}><button type="button" className={s.secondary} disabled={!rows.length} onClick={() => { if (window.confirm(`Set costs equal to selling prices for all ${rows.length} tests, including hidden rows?`)) {
        setRows(all => all.map(row => ({ ...row, cost: row.price })));
        setNotice('Costs copied from selling prices. Review and save to apply.');
    } }}>Copy all prices to costs</button><button type="button" className={s.secondary} disabled={!changed.length} onClick={() => { if (window.confirm('Discard all unsaved pricing changes?')) {
        setRows(original.map(row => ({ ...row })));
        setNotice('');
        setError('');
    } }}>Reset changes</button></div></div>{loading ? <div className={s.empty} role="status">Loading prices…</div> : !filtered.length ? <div className={s.empty}>{rows.length ? 'No tests match the current filters.' : 'No test panels available.'}</div> : <><div className={s.tableWrap} tabIndex={0} role="region" aria-label="Editable prices"><table className={s.table} style={{ minWidth: 650 }}><thead><tr><th>Test panel</th><th>Cost (GHS)</th><th>Selling price (GHS)</th><th>Change</th></tr></thead><tbody>{filtered.slice((current - 1) * 20, current * 20).map(row => <tr key={row.id}><td><div className={s.record}><strong>{row.name}</strong><small>#{row.id}{row.shorttext ? ` · ${row.shorttext}` : ''}{row.category ? ` · ${row.category}` : ''}</small></div></td>{(['cost', 'price'] as const).map(field => <td key={field}><input aria-label={`${field === 'cost' ? 'Cost' : 'Price'} for ${row.name}`} aria-invalid={!validAmount(row[field])} type="number" min="0" step="any" value={row[field]} onChange={e => update(row.id, field, e.target.value)} style={{ width: 135 }}/><small className="d-block text-muted mt-1">Saved: {originals.get(row.id)?.[field]}</small></td>)}<td>{isChanged(row) ? <span className={s.badge}>Unsaved</span> : <span className={s.help}>Unchanged</span>}</td></tr>)}</tbody></table></div><footer className={s.footer}><span>Page {current} of {last} · {filtered.length} tests</span><div className={s.actions}><button type="button" className={s.secondary} disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button><button type="button" className={s.secondary} disabled={current === last} onClick={() => setPage(current + 1)}>Next</button></div></footer></>}</section></fieldset></form></main>;
}
