import { useEffect, useRef, useState } from 'react';
import { customFetch, customPost } from '../Auth/customFetch';
import s from '../accessories/DirectoryWorkspace.module.css';
import { useApplicationSettings } from '../Auth/useApplicationContext';

export default function DrugsList({ handleEditDrug, refreshTrigger = 0, resetEditDrug }) {
    const { applicationsettings } = useApplicationSettings();
    const employeeid = applicationsettings?.user?.employeeid;
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const [revision, setRevision] = useState(0);
    const [loadedRequest, setLoadedRequest] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState(null);
    const lock = useRef(false);
    const requestKey = `${refreshTrigger}:${revision}`;
    const loading = loadedRequest !== requestKey;

    useEffect(() => {
        let live = true;
        customFetch('drugs')
            .then(response => {
                if (!live) return;
                if (!Array.isArray(response)) throw Error(response?.message || response?.error || 'Drugs could not be loaded');
                setRows(response);
                setError('');
            })
            .catch(failure => {
                if (live) {
                    setError(failure.message);
                    setRows([]);
                }
            })
            .finally(() => {
                if (live) setLoadedRequest(requestKey);
            });
        return () => { live = false; };
    }, [requestKey]);

    const filtered = rows.filter(row =>
        [row.drug, row.categoryName].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
    const last = Math.max(1, Math.ceil(filtered.length / 10));
    const current = Math.min(page, last);
    const visible = filtered.slice((current - 1) * 10, current * 10);

    async function remove(row) {
        if (!employeeid) {
            setError('Reload your signed-in session before deleting a drug.');
            return;
        }
        if (lock.current || !window.confirm(`Delete “${row.drug}”?`)) return;
        lock.current = true;
        setDeleting(row.id);
        setError('');
        try {
            const response = await customPost(`drugs?id=${row.id}&employeeid=${employeeid}`, 'DELETE', {});
            if (response?.status !== true) throw Error(response?.message || response?.error || 'The drug was not deleted');
            setRows(previous => previous.filter(item => item.id !== row.id));
            resetEditDrug?.(row);
        } catch (failure) {
            setError(failure.message);
        } finally {
            lock.current = false;
            setDeleting(null);
        }
    }

    return <section className={s.panel} aria-label="Drug directory">
        <div className={s.toolbar}>
            <div>
                <h2>Drugs</h2>
                <p className={s.help}>{loading ? 'Loading drugs…' : `${filtered.length} matching · ${rows.length} total`}</p>
            </div>
            <div className={s.tools}>
                <input className={s.search} aria-label="Search drugs" type="search"
                    placeholder="Search name or category" value={query}
                    onChange={event => { setQuery(event.target.value); setPage(1); }} />
                <button className={s.secondary} disabled={loading || deleting !== null}
                    onClick={() => { setError(''); setRevision(value => value + 1); }}>Refresh drugs</button>
            </div>
        </div>
        {error && <div className={`${s.error} m-3`} role="alert">
            {error}
            <button className={s.secondary} onClick={() => { setError(''); setRevision(value => value + 1); }}>Retry drugs</button>
        </div>}
        {loading
            ? <div role="status" className={s.empty}>Loading drugs…</div>
            : !visible.length
                ? <div className={s.empty}>
                    <h3>{rows.length ? 'No drugs match' : 'No drugs found'}</h3>
                    <p>{rows.length ? 'Try another name or category.' : 'Add the first drug using the form.'}</p>
                </div>
                : <>
                    <div className={s.tableWrap} role="region" aria-label="Drug records" tabIndex={0}>
                        <table className={s.table} style={{ minWidth: 540 }}>
                            <thead><tr>
                                <th>Drug</th><th>Category</th><th>Created by</th><th>Actions</th>
                            </tr></thead>
                            <tbody>{visible.map(row => <tr key={row.id}>
                                <td><div className={s.record}>
                                    <strong>{row.drug}</strong>
                                    <small>Drug #{row.id}</small>
                                    {row.addedOn && <small>Added {Number.isNaN(new Date(row.addedOn).getTime())
                                        ? String(row.addedOn) : new Date(row.addedOn).toLocaleDateString()}</small>}
                                </div></td>
                                <td>{row.categoryName || 'Uncategorized'}</td>
                                <td>{row.createdBy || 'Not recorded'}</td>
                                <td><div className={s.actions}>
                                    <button className={s.textButton} disabled={deleting !== null}
                                        onClick={() => handleEditDrug(row)}>Edit</button>
                                    <button className={s.danger} disabled={deleting !== null}
                                        onClick={() => void remove(row)}>
                                        {deleting === row.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div></td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                    <footer className={s.footer}>
                        <span>Page {current} of {last}</span>
                        <div className={s.actions}>
                            <button className={s.secondary} disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
                            <button className={s.secondary} disabled={current === last} onClick={() => setPage(current + 1)}>Next</button>
                        </div>
                    </footer>
                </>}
    </section>;
}
