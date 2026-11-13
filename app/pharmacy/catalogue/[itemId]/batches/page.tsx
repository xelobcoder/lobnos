'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {usePharmacyDocument} from '../../../components/PharmacyPaymentFields';
import {styles, dateLabel, usePharmacyAccess, usePharmacyResource, Message, Empty, Modal} from '../../../components/PharmacyWorkspace';

import records from '../../../components/PharmacyRecords.module.css';

type Batch = {batch_number: string | null; expiry_date: string | null; available: number};

export default function MedicineBatchesPage() {
     const {itemId} = useParams<{itemId: string}>();
     const access = usePharmacyAccess();
     const [query, setQuery] = useState(''), [search, setSearch] = useState('');
     const [status, setStatus] = useState('remaining'), [page, setPage] = useState(1);
     const [selected, setSelected] = useState<Batch | null>(null);
     const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
     const request = usePharmacyDocument('purchasing');
     const [medicine, setMedicine] = useState<{id: string; name: string; sku: string; unit: string; currentStock: number} | null>(null);
     useEffect(() => {
          const timer = setTimeout(() => {setSearch(query); setPage(1);}, 250);
          return () => clearTimeout(timer);
     }, [query]);
     const resource = usePharmacyResource(`pharmacy/items/${encodeURIComponent(itemId)}/batch-balances?page=${page}&status=${status}&search=${encodeURIComponent(search)}`);
     useEffect(() => {if (resource.data?.item) setMedicine(resource.data.item);}, [resource.data]);
     useEffect(() => {if (resource.data?.page) setPage(resource.data.page);}, [resource.data]);
     const item = resource.data?.item || (medicine?.id === itemId ? medicine : null);
     const writeOff = async (payload: Record<string, unknown>) => {
          if (busy) return;
          setBusy(true); setError(''); setNotice('');
          try {
               const response = await request.execute(`pharmacy/items/${encodeURIComponent(itemId)}/write-off`, payload);
               if (!response?.success) throw new Error(response?.error?.message || 'Unable to confirm stock write-off.');
               setSelected(null); setNotice('Stock write-off recorded. Batch balances have been updated.');
               await resource.refresh();
          } catch (e) {setError(e instanceof Error ? e.message : 'Unable to record stock write-off.');}
          finally {setBusy(false);}
     };
     const today = new Date().toISOString().slice(0, 10);
     return <main className={styles.page}>
          <Link href="/pharmacy/catalogue">← Medicine catalogue</Link>
          <header className={styles.header}>
               <div><h1>{item?.name || 'Medicine batch balances'}</h1><p>{item ? `${item.sku} · Physical stock ${Number(item.currentStock).toLocaleString()} ${item.unit}` : 'Batch quantities and expiry dates for this medicine.'}</p></div>
               <button className="btn btn-outline-secondary" disabled={resource.loading || busy} onClick={resource.refresh}>Refresh balances</button>
          </header>
          <Message error={error || resource.error} notice={notice}/>
          {request.pending && <div className="alert alert-warning">A stock write-off needs confirmation. <button className="btn btn-warning" disabled={busy} onClick={() => writeOff({})}>Retry original write-off</button></div>}
          <section className={styles.card} aria-labelledby="batch-heading">
               <h2 id="batch-heading">Batch balances</h2>
               <p className={styles.muted}>Balances include expired stock. Use the expiry date when checking which batches can be sold.</p>
               <div className={`${styles.toolbar} ${records.filters}`}>
                    <label>Find a batch<input type="search" className="form-control" placeholder="Batch number" value={query} onChange={e => setQuery(e.target.value)}/></label>
                    <label>Show<select className="form-select" value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}><option value="remaining">Batches with stock</option><option value="expired">Expired with stock</option><option value="depleted">Depleted batches</option><option value="all">All batches</option></select></label>
               </div>
               {resource.loading ? <Empty>Loading batch balances…</Empty> : resource.error ? <button className="btn btn-outline-primary" onClick={resource.refresh}>Retry</button> : resource.data?.items?.length ? <div className="table-responsive"><table className={`${styles.table} ${records.table}`}>
                    <thead><tr><th>Batch number</th><th>Expiry date</th><th>Status</th><th className={styles.number}>Balance ({item?.unit})</th>{access.manager && <th>Action</th>}</tr></thead>
                    <tbody>{resource.data.items.map((batch: Batch) => {
                         const expired = !!batch.expiry_date && String(batch.expiry_date).slice(0,10) < today;
                         return <tr key={batch.batch_number ?? '__unbatched'}><td>{batch.batch_number || 'Unbatched'}</td><td data-label="Expiry date">{batch.expiry_date ? dateLabel(batch.expiry_date) : 'Not recorded'}</td><td data-label="Status">{Number(batch.available) <= 0 ? 'Depleted' : expired ? <span className="text-danger">Expired</span> : batch.expiry_date ? 'Within expiry' : 'Expiry not recorded'}</td><td data-label={`Balance (${item?.unit || 'units'})`} className={styles.number}>{Number(batch.available).toLocaleString()}</td>{access.manager && <td data-record-actions>{Number(batch.available) > 0 && <button className="btn btn-sm btn-outline-danger" disabled={busy || !!request.pending} onClick={() => {setError(''); setSelected(batch);}}>Write off stock</button>}</td>}</tr>;
                    })}</tbody>
               </table></div> : <Empty>No batches match these filters. {(query || status !== 'remaining') && <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => {setQuery(''); setStatus('remaining'); setPage(1);}}>Clear filters</button>}</Empty>}
               <div className={styles.toolbar}><span>{resource.data ? `${resource.data.total} ${resource.data.total === 1 ? 'batch' : 'batches'} · Page ${page} of ${resource.data.totalPages}` : ''}</span><div className={styles.actions}><button className="btn btn-sm btn-outline-secondary" disabled={resource.loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><button className="btn btn-sm btn-outline-secondary" disabled={resource.loading || !resource.data || page >= resource.data.totalPages} onClick={() => setPage(value => value + 1)}>Next</button></div></div>
          </section>
          {selected && <Modal title="Write off damaged or expired stock" busy={busy} onClose={() => setSelected(null)}>
               <Message error={error}/><p>{item?.name} · Batch {selected.batch_number || 'Unbatched'} · {Number(selected.available).toLocaleString()} {item?.unit} remaining</p>
               <form onSubmit={e => {
                    e.preventDefault(); const form = new FormData(e.currentTarget);
                    if (window.confirm('Remove this quantity from pharmacy stock and record its cost?')) void writeOff({batchNumber: selected.batch_number || undefined, quantity: Number(form.get('quantity')), reason: form.get('reason')});
               }}>
                    <label className="form-label d-block">Quantity ({item?.unit})<input className="form-control" name="quantity" type="number" min="0.001" step="0.001" max={selected.available} required/></label>
                    <label className="form-label d-block">Reason<textarea className="form-control" name="reason" required maxLength={500}/></label>
                    <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => setSelected(null)}>Cancel</button><button className="btn btn-danger" disabled={busy || !!request.pending}>{busy ? 'Recording…' : 'Record write-off'}</button></footer>
               </form>
          </Modal>}
     </main>;
}
