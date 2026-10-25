'use client';
import { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import s from './StrategyWorkspace.module.css';
export interface SelectedOrganization { id: number; name: string; location?: string }
export default function OrganizationPicker({ selected, onChange }: { selected: SelectedOrganization[]; onChange: (rows: SelectedOrganization[]) => void }) {
    const [query, setQuery] = useState(''), [rows, setRows] = useState<SelectedOrganization[]>([]), [loading, setLoading] = useState(false), [error, setError] = useState(''), [retry, setRetry] = useState(0);
    useEffect(() => {
        let live = true; setRows([]); setError('');
        if (query.trim().length < 2) { setLoading(false); return; }
        setLoading(true);
        const timer = window.setTimeout(() => {
            customFetch(`application/filtering/table/organization?value=${encodeURIComponent(query.trim())}&original=&limit=30`).then(result => {
                if (!Array.isArray(result)) throw new Error(result?.message || result?.error || 'Unable to search organizations.');
                if (live) setRows(result.map(row => ({ id: Number(row.id), name: row.name, location: row.location })));
            }).catch((err: unknown) => { if (live) setError(err instanceof Error ? err.message : 'Unable to load organizations.'); }).finally(() => { if (live) setLoading(false); });
        }, 250);
        return () => { live = false; window.clearTimeout(timer); };
    }, [query, retry]);
    return <div><div className={s.field}><label htmlFor="organization-multi-search">Find organizations</label><input type="search" id="organization-multi-search" value={query} placeholder="Enter at least two characters" onChange={event => setQuery(event.target.value)}/></div>
        {error && <div role="alert" className={s.error}>{error}<button type="button" className={s.secondary} onClick={() => setRetry(retry + 1)}>Retry search</button></div>}
        {query.trim().length >= 2 && <><div className={s.actions} style={{marginTop:12,justifyContent:'flex-start'}}><button type="button" className={s.secondary} disabled={!rows.length || loading} onClick={() => onChange([...selected, ...rows.filter(row => !selected.some(item => item.id === row.id))])}>Select all {rows.length} results</button><span className={s.help}>Up to 30 results. Refine the search for more organizations.</span></div><div className={s.catalogue} aria-label="Organization search results" role="region">{loading ? <p role="status">Searching organizations…</p> : rows.length ? rows.map(row => <label key={row.id}><input type="checkbox" checked={selected.some(item => item.id === row.id)} onChange={event => onChange(event.target.checked ? [...selected, row] : selected.filter(item => item.id !== row.id))}/><strong>{row.name}</strong><span>{row.location || `#${row.id}`}</span></label>) : <p>No matching organizations found.</p>}</div></>}
        <h3 style={{margin:'18px 0 12px'}}>Selected organizations ({selected.length})</h3>{selected.length ? <div className={s.organizationChips}>{selected.map(row => <div key={row.id}><strong>{row.name}</strong><button type="button" className={s.textButton} aria-label={`Remove organization ${row.name}`} onClick={() => onChange(selected.filter(item => item.id !== row.id))}>Remove</button></div>)}</div> : <p className={s.help}>No organizations selected. Search above to select several before saving.</p>}
    </div>;
}
