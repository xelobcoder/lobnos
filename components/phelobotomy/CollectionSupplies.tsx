'use client';

import { useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { toast } from 'react-toastify';

type Item = { id: string; name: string; current_stock: number; consumption_unit: string; cost_price: number };
type Intent = { idempotency_key: string; reason: string; lines: Array<{ item_id: string; quantity: number }> };

export default function CollectionSupplies({ sampleId }: { sampleId: number }) {
     const [open, setOpen] = useState(false);
     const [items, setItems] = useState<Item[]>([]);
     const [selected, setSelected] = useState<Record<string, { item: Item; quantity: string }>>({});
     const [records, setRecords] = useState<any[]>([]);
     const [search, setSearch] = useState('');
     const [reason, setReason] = useState('');
     const [busy, setBusy] = useState(false);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [pending, setPending] = useState<Intent | null>(null);
     const submitting = useRef(false);
     const generation = useRef(0);
     const [storageKey, setStorageKey] = useState<string | null>(null);
     const load = async () => {
          const request = ++generation.current;
          setLoading(true); setError('');
          try {
               const response = await customFetch(`operations/phlebotomy/supplies/${sampleId}?search=${encodeURIComponent(search)}`);
               if (!response?.success) throw new Error(response?.message || 'Unable to load supplies.');
               if (request !== generation.current) return;
               const key = `phlebotomy-supply-intent:${response.data.tenantId}:${sampleId}`;
               setStorageKey(key);
               try { const saved = sessionStorage.getItem(key); setPending(saved ? JSON.parse(saved) : null); } catch { setPending(null); }
               setItems(response.data.items || []); setRecords(response.data.records || []);
          } catch (e: any) { if (request === generation.current) setError(e.message); }
          finally { if (request === generation.current) setLoading(false); }
     };
     useEffect(() => { if (open) void load(); return () => { generation.current++; }; }, [open, sampleId]);
     const save = async () => {
          if (submitting.current || !storageKey) return;
          const lines = Object.values(selected).map(({ item, quantity }) => ({ item_id: item.id, quantity: Number(quantity) }));
          if (!pending && (!reason.trim() || !lines.length || lines.some(line => !Number.isFinite(line.quantity) || line.quantity <= 0))) return toast.error('Select supplies, enter positive quantities and add a usage note.');
          submitting.current = true; setBusy(true);
          try {
               const intent = pending || { idempotency_key: crypto.randomUUID(), lines, reason: reason.trim() };
               // Retain the identical request across network retries and closing this collection.
               sessionStorage.setItem(storageKey, JSON.stringify(intent)); setPending(intent);
               const response = await customFetchMutation(`operations/phlebotomy/supplies/${sampleId}`, 'POST', intent);
               if (!response?.success) {
                    // Explicit business failures roll back; uncertain failures retain the identical intent.
                    if (response.statusCode >= 400 && response.statusCode < 500 && !String(response.message).includes('retry key was used')) {
                         sessionStorage.removeItem(storageKey); setPending(null);
                    }
                    throw new Error(response?.message || 'Unable to confirm usage. Retry the same record.');
               }
               sessionStorage.removeItem(storageKey); setPending(null); setSelected({}); setReason('');
               toast.success(response.data.retried ? 'This usage was already recorded; stock was not deducted again.' : 'Supplies recorded and stock deducted.');
               await load();
          } catch (e: any) { toast.error(e.message || 'Unable to confirm usage. Retry the same record.'); }
          finally { submitting.current = false; setBusy(false); }
     };
     return <div className="border-top mt-3 pt-3">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setOpen(!open)}>{open ? 'Hide supplies' : 'Record supplies used'}</button>
          {open && <div className="mt-3">
               <p className="small text-muted">Record actual collection supplies once for this physical sample, including extra supplies used. Shared tests do not require separate deductions. Laboratory processing materials are recorded separately.</p>
               {error && <div role="alert" className="alert alert-danger">{error}</div>}
               {pending && <div className="alert alert-warning">A usage request awaits confirmation. Retry it to check whether stock was already deducted.<ul className="mb-0">{pending.lines.map(line => <li key={line.item_id}>{line.item_id}: {line.quantity}</li>)}</ul><div>{pending.reason}</div></div>}
               <div className="d-flex gap-2 mb-2"><input aria-label="Search collection supplies" className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory: tubes, needles, gloves..." /><button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={load}>{loading ? 'Loading...' : 'Search / refresh'}</button></div>
               <div style={{ maxHeight: 190, overflowY: 'auto' }}>{items.map(item => <label key={item.id} className="d-flex align-items-center gap-2 py-1"><input type="checkbox" disabled={busy || !!pending} checked={!!selected[item.id]} onChange={e => setSelected(previous => { const next = { ...previous }; if (e.target.checked) next[item.id] = { item, quantity: '1' }; else delete next[item.id]; return next; })} /><span>{item.name}</span><small className="text-muted ms-auto">Stock: {item.current_stock} {item.consumption_unit}</small></label>)}{!loading && !items.length && <p className="small">No active supplies match this search.</p>}</div>
               {Object.values(selected).map(({ item, quantity }) => <label className="d-flex align-items-center gap-2 mt-2" key={item.id}><span className="flex-grow-1">{item.name} ({item.consumption_unit})</span><input aria-label={`Quantity used: ${item.name}`} className="form-control" style={{ width: 100 }} type="number" min="0" step="any" value={quantity} disabled={busy || !!pending} onChange={e => setSelected(previous => ({ ...previous, [item.id]: { item, quantity: e.target.value } }))} />{Number(item.cost_price) === 0 && <small className="text-warning">No inventory cost configured</small>}</label>)}
               <textarea aria-label="Supply usage note" className="form-control mt-2" maxLength={1000} placeholder="Usage note, e.g. initial collection or extra needle for redraw" value={reason} disabled={busy || !!pending} onChange={e => setReason(e.target.value)} />
               <button type="button" className="btn btn-primary mt-2" disabled={busy || (!pending && !Object.keys(selected).length)} onClick={save}>{busy ? 'Recording...' : pending ? 'Retry same usage record' : 'Confirm usage and deduct stock'}</button>
               <div className="small text-muted mt-2">Available, unexpired batches are checked when you confirm. Enter quantities in the displayed consumption unit.</div>
               {!!records.length && <div className="mt-3"><strong className="small">Recorded usage for this sample</strong>{records.map(record => { let transactions: any[] = []; try { transactions = typeof record.transactions === 'string' ? JSON.parse(record.transactions) : record.transactions || []; } catch { /* Preserve record header. */ } return <div key={record.id} className="small border-top py-2"><div>{new Date(record.created_at).toLocaleString()}  -  Staff #{record.employeeid}</div>{transactions.map((transaction, index) => <div key={transaction.id || index}>{transaction.item_name || transaction.item_id}: {transaction.quantity}  -  Batch {transaction.batch_number || 'unspecified'}{transaction.notes && <span className="d-block text-muted">{transaction.notes}</span>}</div>)}</div>; })}</div>}
          </div>}
     </div>;
}
