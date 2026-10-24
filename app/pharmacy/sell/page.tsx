'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import PharmacyPaymentFields, { usePharmacyPayment } from '../components/PharmacyPaymentFields';

type Medicine = { inventoryItemId: string; name: string; sku: string; salePrice: number; availableStock: number; dispensableStock?: number; requiresPrescription?: boolean };
type Line = Medicine & { quantity: number };
const money = (n: number) => `GHS ${Number(n).toFixed(2)}`;
export default function PharmacySellPage() {
     const payment = usePharmacyPayment('pos');
     const [search, setSearch] = useState(''), [items, setItems] = useState<Medicine[]>([]), [cart, setCart] = useState<Line[]>([]);
     const [customer, setCustomer] = useState(''), [method, setMethod] = useState('cash'), [error, setError] = useState(''), [busy, setBusy] = useState(false);
     const [receipt, setReceipt] = useState<any>(null), [held, setHeld] = useState<any[]>([]), [heldId, setHeldId] = useState<string | null>(null);
     const [loading, setLoading] = useState(false); const request = useRef(0);
     const total = cart.reduce((cents, line) => cents + Math.round(Math.round(line.salePrice * 100) * line.quantity), 0) / 100;
     const locked = busy || !!payment.pending;
     const load = useCallback(async () => {
          const id = ++request.current; setLoading(true);
          try { const response = await customFetch(`pharmacy/catalogue?sellableOnly=true&count=30&search=${encodeURIComponent(search)}`); if (!response?.success) throw new Error(response?.error?.message || 'Unable to load medicines'); if (id === request.current) setItems(response.data.items || []); }
          catch (e) { if (id === request.current) setError(e instanceof Error ? e.message : 'Unable to load medicines'); }
          finally { if (id === request.current) setLoading(false); }
     }, [search]);
     useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [load]);
     const loadHeld = useCallback(async () => { const r = await customFetch('pharmacy/sales/held?count=100'); if (r?.success) setHeld(r.data.sales || []); }, []);
     useEffect(() => { loadHeld(); }, [loadHeld]);
     const add = (item: Medicine) => {
          if (locked) return;
          if (item.requiresPrescription) { setError('Use the prescription queue to dispense this medicine.'); return; }
          const available = item.dispensableStock ?? item.availableStock;
          setCart(lines => {
               const existing = lines.find(l => l.inventoryItemId === item.inventoryItemId);
               if ((existing?.quantity || 0) + 1 > available) { setError('Insufficient unexpired stock.'); return lines; }
               return existing ? lines.map(l => l.inventoryItemId === item.inventoryItemId ? { ...l, quantity: l.quantity + 1 } : l) : [...lines, { ...item, quantity: 1 }];
          });
          setReceipt(null);
     };
     const checkout = async (event?: FormEvent) => {
          event?.preventDefault(); if (busy || (!cart.length && !payment.pending)) return;
          setBusy(true); setError('');
          try {
               const r = await payment.execute(heldId ? `pharmacy/sales/held/${heldId}/complete` : 'pharmacy/sales', { customerName: customer || 'Walk-in customer', paymentMethod: method, expectedTotal: total, lines: cart.map(l => ({ inventoryItemId: l.inventoryItemId, quantity: l.quantity })) });
               if (!r?.success) throw new Error(r?.error?.message || 'Checkout could not be confirmed. Retry the original checkout.');
               setReceipt(r.data); setCart([]); setCustomer(''); setHeldId(null); await Promise.all([load(), loadHeld()]);
          } catch (e) { setError(e instanceof Error ? e.message : 'Checkout failed'); } finally { setBusy(false); }
     };
     const hold = async () => {
          if (locked || !cart.length || heldId) return; setBusy(true); setError('');
          try { const r = await customFetchMutation('pharmacy/sales/held', 'POST', { customerName: customer || 'Walk-in customer', lines: cart.map(l => ({ inventoryItemId: l.inventoryItemId, quantity: l.quantity })) }); if (!r?.success) throw new Error(r?.error?.message || 'Unable to hold sale'); setCart([]); setCustomer(''); await loadHeld(); }
          catch (e) { setError(e instanceof Error ? e.message : 'Unable to hold sale'); } finally { setBusy(false); }
     };
     const recall = async (id: string) => {
          if (locked) return; if (cart.length && !window.confirm('Replace the current unsaved basket with this held sale?')) return;
          setBusy(true); setError('');
          try { const r = await customFetch(`pharmacy/sales/held/${id}`); if (!r?.success) throw new Error(r?.error?.message || 'Unable to recall sale'); setCart(r.data.lines.map((l: any) => ({ ...l, salePrice: l.unitPrice, availableStock: Number.MAX_SAFE_INTEGER }))); setCustomer(r.data.customerName); setHeldId(id); }
          catch (e) { setError(e instanceof Error ? e.message : 'Unable to recall sale'); } finally { setBusy(false); }
     };
     return <main className="container-fluid p-3 p-md-4">
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-3"><div><h1 className="h3">Pharmacy POS</h1><p className="text-muted mb-0">Select medicines, review the basket and collect payment.</p></div><div className="d-flex gap-3"><Link href="/pharmacy/cashier">Cashier / shift</Link><Link href="/pharmacy/prescriptions">Prescriptions</Link></div></div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {payment.pending && <div className="alert alert-warning">A checkout needs confirmation. Its original items and payment details will be used. <button type="button" className="btn btn-warning" disabled={busy} onClick={() => checkout()}>Retry original checkout</button></div>}
          <form onSubmit={checkout}><div className="row g-4">
               <section className="col-lg-8">
                    <div className="card mb-3"><div className="card-body"><label className="form-label fw-bold" htmlFor="medicine-search">Search or scan a medicine</label><input id="medicine-search" className="form-control form-control-lg" value={search} disabled={locked} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (items.length === 1) add(items[0]); } }} placeholder="Medicine name or SKU" autoFocus />
                         <div className="table-responsive mt-3" style={{ maxHeight: 280, overflowY: 'auto' }}><table className="table align-middle"><thead><tr><th>Medicine</th><th>Available</th><th>Price</th><th /></tr></thead><tbody>{items.map(item => <tr key={item.inventoryItemId}><td>{item.name}<small className="d-block text-muted">{item.sku}{item.requiresPrescription ? ' · Prescription required' : ''}</small></td><td>{item.dispensableStock ?? item.availableStock}</td><td>{money(item.salePrice)}</td><td><button type="button" className="btn btn-outline-primary btn-sm" disabled={locked || (item.dispensableStock ?? item.availableStock) < 1} onClick={() => add(item)}>Add</button></td></tr>)}</tbody></table>{loading ? <p role="status">Loading medicines…</p> : !items.length && <p>No matching medicines with sellable stock.</p>}</div>
                    </div></div>
                    <div className="card"><div className="card-body"><div className="d-flex justify-content-between"><h2 className="h5">Selected items</h2><span>{cart.length} item(s)</span></div>
                         <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Medicine</th><th>Quantity</th><th>Unit price</th><th>Total</th><th /></tr></thead><tbody>{cart.map(line => <tr key={line.inventoryItemId}><td>{line.name}</td><td><input aria-label={`Quantity for ${line.name}`} className="form-control" style={{ width: 100 }} type="number" min="0.001" step="0.001" required value={line.quantity} disabled={locked} onChange={e => { const count = Number(e.target.value); setCart(lines => lines.map(l => l.inventoryItemId === line.inventoryItemId ? { ...l, quantity: count } : l)); }} /></td><td>{money(line.salePrice)}</td><td>{money(Math.round(Math.round(line.salePrice * 100) * line.quantity) / 100)}</td><td><button type="button" className="btn btn-outline-danger btn-sm" disabled={locked} onClick={() => setCart(lines => lines.filter(l => l.inventoryItemId !== line.inventoryItemId))}>Remove</button></td></tr>)}</tbody></table></div>
                         {!cart.length && <p className="text-muted">Added medicines appear here, directly below the selection area.</p>}
                         <div className="d-flex gap-2"><button type="button" className="btn btn-outline-secondary" disabled={locked || !cart.length || !!heldId} onClick={hold}>Hold sale</button><button type="button" className="btn btn-outline-secondary" disabled={locked || !cart.length} onClick={() => { if (window.confirm('Clear this basket?')) { setCart([]); setHeldId(null); } }}>Clear basket</button></div>
                    </div></div>
                    {!!held.length && <div className="card mt-3"><div className="card-body"><h2 className="h5">Held sales</h2><div className="d-flex flex-wrap gap-2">{held.map(sale => <button type="button" className="btn btn-outline-secondary" disabled={locked} key={sale.id} onClick={() => recall(sale.id)}>{sale.customerName} · {money(sale.total)}</button>)}</div></div></div>}
               </section>
               <aside className="col-lg-4"><div className="card"><div className="card-body"><h2 className="h5">Payment</h2><label className="form-label d-block">Customer (optional)<input className="form-control" maxLength={255} value={customer} disabled={locked} onChange={e => setCustomer(e.target.value)} /></label><div className="d-flex justify-content-between fs-3 fw-bold my-4"><span>Total</span><span>{money(total)}</span></div><label className="form-label d-block">Payment method<select className="form-select" value={method} disabled={locked} onChange={e => { setMethod(e.target.value); payment.setAmount(''); }}><option value="cash">Cash</option><option value="mobile_money">Mobile money</option><option value="card">Card</option></select></label><PharmacyPaymentFields payment={payment} method={method} total={total} disabled={busy} /><button className="btn btn-success btn-lg w-100" type="submit" disabled={locked || !cart.length || !payment.setup?.shift || payment.setup?.day?.status!=='open' || !payment.setup?.routes?.some((r: any) => r.method === method)}>{busy ? 'Processing…' : 'Complete sale'}</button></div></div></aside>
          </div></form>
          {receipt && <section className="card mt-4 receipt" aria-live="polite"><div className="card-body"><h2 className="h4">Pharmacy receipt</h2><p>{receipt.receiptNumber}<br />{receipt.customerName} · {new Date(receipt.completedAt).toLocaleString()}</p><table className="table"><thead><tr><th>Medicine</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{receipt.lines?.map((l: any) => <tr key={l.id}><td>{l.name}</td><td>{l.quantity}</td><td>{money(l.unitPrice)}</td><td>{money(l.lineTotal)}</td></tr>)}</tbody></table><p className="fs-5">Total: {money(receipt.total)}<br />Received: {money(receipt.amountTendered)}<br /><strong>Change: {money(receipt.change)}</strong></p><p>{receipt.paymentMethod.replace('_', ' ')} {receipt.paymentReference || ''}</p><button type="button" className="btn btn-primary" onClick={() => window.print()}>Print receipt</button></div></section>}
          <style jsx global>{`@media print { body * { visibility: hidden; } .receipt, .receipt * { visibility: visible; } .receipt { position: absolute; left: 0; top: 0; width: 100%; border: 0; } .receipt button { display: none; } }`}</style>
     </main>;
}
