'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import Select, { type SelectInstance } from 'react-select';
import { customFetchMutation, reactSelectCustomStyles } from '../../../components/Auth/customFetch';
import { heldQuantity, priceMethods, receivingItem, type ReceivingLine } from '../../../lib/pharmacyReceiving';
import { usePharmacyDocument } from './PharmacyPaymentFields';
import { styles, money, Modal, Message, usePharmacyAccess, usePharmacyResource } from './PharmacyWorkspace';
import layout from './PharmacyReceivingModal.module.css';

type BasketLine = { key: string; itemId: string; name: string; orderLineId?: string; quantity: number; unitCost?: number; unitType: string; unitsPerPurchaseUnit: number; batchNumber: string; expiryDate?: string; condition: string; discountAmount: number; nonRecoverableTaxAmount: number };
type Choice = { method: string; value: string; price?: number; cost?: number; margin?: number };
type Props = { initialItems?: any[]; initialOrderId?: string; initialDelivery?: any; onClose: () => void; onCompleted: () => void | Promise<void> };
export default function PharmacyReceivingModal({ initialItems = [], initialOrderId = '', initialDelivery, onClose, onCompleted }: Props) {
  const access = usePharmacyAccess(), setup = usePharmacyResource('pharmacy/receiving/setup');
  const physical = usePharmacyDocument('delivery-record'), acceptance = usePharmacyDocument('delivery-accept'), returns = usePharmacyDocument('delivery-return');
  const [delivery, setDelivery] = useState<any>(initialDelivery || null), [basket, setBasket] = useState<BasketLine[]>([]);
  const [supplier, setSupplier] = useState(''), [orderId, setOrderId] = useState(initialOrderId), [reference, setReference] = useState(''), [reason, setReason] = useState(''), [additionalCost, setAdditionalCost] = useState('0');
  const [medicine, setMedicine] = useState<any>(initialItems[0] ? receivingItem(initialItems[0]) : null);
  const [quantity, setQuantity] = useState(''), [cost, setCost] = useState(''), [unitType, setUnitType] = useState('consumption'), [factor, setFactor] = useState(String(initialItems[0] ? receivingItem(initialItems[0]).factor : 1));
  const [batch, setBatch] = useState(''), [expiry, setExpiry] = useState(''), [condition, setCondition] = useState('good'), [discount, setDiscount] = useState('0'), [tax, setTax] = useState('0');
  const [counts, setCounts] = useState<Record<string, string>>({}), [costs, setCosts] = useState<Record<string, string>>({}), [returnCounts, setReturnCounts] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, Choice>>({}), [wholesale, setWholesale] = useState<Record<string, Choice>>({});
  const [excessApproved, setExcessApproved] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const picker = useRef<SelectInstance<any, false>>(null), pickerId = useId();
  const items = (setup.data?.items || []).map(receivingItem), orders = setup.data?.orders || [];
  const order = orders.find((row: any) => row.id === orderId), lines: ReceivingLine[] = delivery?.details?.lines || [];
  const locked = busy || !!physical.pending, actionLocked = busy || !!acceptance.pending || !!returns.pending;
  useEffect(() => { if (order) setSupplier(order.supplier_id ?? order.supplierId); }, [order?.id]);
  useEffect(() => {
    if (!delivery) return;
    setCounts(Object.fromEntries(lines.map(line => [line.id, String(Math.min(heldQuantity(line), Math.max(0, Number(line.suggestedAcceptance ?? 0))))])));
    setCosts({}); setReturnCounts({}); setPrices({}); setWholesale({}); setExcessApproved(false);
  }, [delivery?.id, delivery?.version]);
  const chooseMedicine = (selected: any) => {
    setMedicine(selected); setQuantity(''); setCost(''); setUnitType('consumption'); setFactor(String(selected?.factor || 1));
    setBatch(''); setExpiry(''); setCondition('good'); setDiscount('0'); setTax('0'); setError('');
  };
  const addBatch = () => {
    if (locked) return;
    const q = Number(quantity), c = cost.trim() === '' ? undefined : Number(cost), conversion = unitType === 'purchase' ? Number(factor) : 1;
    if (!medicine || quantity === '' || !Number.isFinite(q) || q <= 0 || Number(q.toFixed(3)) !== q || !Number.isFinite(conversion) || conversion <= 0 ||
      (c !== undefined && (!Number.isFinite(c) || c < 0 || Number(c.toFixed(2)) !== c)) || [discount, tax].some(n => !Number.isFinite(Number(n)) || Number(n) < 0 || Number(Number(n).toFixed(2)) !== Number(n))) {
      setError('Choose a medicine, a positive count (up to 3 decimals), and non-negative costs. Leave unknown cost blank.'); return;
    }
    if (basket.length >= 100) { setError('A delivery can contain up to 100 batch lines.'); return; }
    const orderLine = order?.lines?.find((line: any) => String(line.item_id ?? line.itemId) === medicine.id);
    if (order && !orderLine) { setError('Choose a medicine on this supplier order, or record a separate unordered delivery.'); return; }
    setBasket(current => [...current, { key: crypto.randomUUID(), itemId: medicine.id, name: medicine.name, orderLineId: orderLine?.id, quantity: q, unitCost: c, unitType, unitsPerPurchaseUnit: conversion, batchNumber: batch.trim(), expiryDate: expiry || undefined, condition, discountAmount: Number(discount), nonRecoverableTaxAmount: Number(tax) }]);
    chooseMedicine(null); picker.current?.focus();
  };
  const run = async (operation: () => Promise<any>, success: string) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await operation();
      if (!response?.success) throw new Error(response?.error?.message || 'Unable to confirm this operation. Retry the original operation.');
      if (response.data?.id && response.data?.details?.lines) setDelivery(response.data);
      setNotice(success);
      await onCompleted();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); }
    finally { setBusy(false); }
  };
  const savePhysical = (retry = false) => {
    if (!retry && (medicine || !basket.length)) { setError(medicine ? 'Add this batch before saving the delivery.' : 'Add at least one delivered batch.'); return; }
    return run(() => physical.execute('pharmacy/receiving/deliveries', { supplierId: supplier, orderId: orderId || undefined, reference: reference.trim(), reason: reason.trim() || undefined,
      additionalCost: Number(additionalCost), lines: basket.map(({ key, name, ...line }) => line) }), 'Physical delivery saved. No stock has been added. Review and accept eligible goods below; held goods can be returned.');
  };
  const accept = (retry = false) => {
    const selected = lines.filter(line => Number(counts[line.id]) > 0);
    if (!retry && !selected.length) { setError('Enter the quantity to accept on at least one eligible line.'); return; }
    const ids = [...new Set(selected.map(line => line.itemId))];
    if (!retry && ids.some(id => [prices[id], wholesale[id]].some(choice => choice && choice.method !== 'keep' && choice.price === undefined))) {
      setError('Preview each changed selling price before confirming acceptance.'); return;
    }
    return run(() => acceptance.execute(`pharmacy/receiving/deliveries/${delivery.id}/accept`, {
      expectedVersion: delivery.version, reason: reason.trim() || undefined, excessApproved: excessApproved || undefined,
      lines: selected.map(line => ({ lineId: line.id, quantity: Number(counts[line.id]), ...(line.unitCost == null && costs[line.id]?.trim() !== '' && costs[line.id] !== undefined ? { unitCost: Number(costs[line.id]) } : {}) })),
      pricing: ids.map(itemId => { const retail = prices[itemId] || { method: 'keep', value: '' }, trade = wholesale[itemId] || { method: 'keep', value: '' }; return { itemId, method: retail.method, ...(retail.method !== 'keep' ? { value: Number(retail.value), expectedPrice: retail.price } : {}), wholesale: { method: trade.method, ...(trade.method !== 'keep' ? { value: Number(trade.value), expectedPrice: trade.price } : {}) } }; }),
    }), 'Accepted goods added to stock. Unaccepted quantities remain held. Record the supplier invoice separately.');
  };
  const returnHeld = (retry = false) => {
    const selected = lines.filter(line => Number(returnCounts[line.id]) > 0);
    if (!retry && (!selected.length || !reason.trim())) { setError('Enter held quantities to return and a return reason.'); return; }
    return run(() => returns.execute(`pharmacy/receiving/deliveries/${delivery.id}/return`, { expectedVersion: delivery.version, reason: reason.trim(), lines: selected.map(line => ({ lineId: line.id, quantity: Number(returnCounts[line.id]) })) }), 'Held goods returned. Accepted stock was not changed.');
  };
  const preview = async (itemId: string, trade = false) => {
    const choice = (trade ? wholesale : prices)[itemId];
    const accepted = lines.filter(line => line.itemId === itemId && Number(counts[line.id]) > 0);
    const total = accepted.reduce((sum, line) => sum + Number(counts[line.id]), 0);
    if (!choice || choice.method === 'keep') return;
    if (!total || accepted.some(line => line.unitCost == null && !costs[line.id]?.trim())) { setError('Enter acceptance quantity and confirmed base-unit cost before previewing.'); return; }
    setBusy(true); setError('');
    try {
      const result = await customFetchMutation('pharmacy/receiving/prices/preview', 'POST', { deliveryId: delivery.id, itemId, method: choice.method, value: Number(choice.value),
        lines: accepted.map(line => ({ lineId: line.id, quantity: Number(counts[line.id]), ...(line.unitCost == null ? { unitCost: Number(costs[line.id]) } : {}) })) });
      if (!result?.success) throw new Error(result?.error?.message || 'Unable to preview price.');
      (trade ? setWholesale : setPrices)(current => ({ ...current, [itemId]: { ...choice, price: result.data.price, cost: result.data.cost, margin: result.data.margin } }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to preview price.'); } finally { setBusy(false); }
  };
  const priceControl = (itemId: string, trade = false) => {
    const state = trade ? wholesale : prices, update = trade ? setWholesale : setPrices, choice = state[itemId] || { method: 'keep', value: '' };
    const item = items.find((row: any) => row.id === itemId);
    if (!access.manager) return <p className={styles.muted}>{trade ? 'Wholesale' : 'Retail'}: keep current price ({money(trade ? item?.wholesale : item?.retail)}). Only a manager or administrator can change prices.</p>;
    return <div><label className="form-label d-block">{trade ? 'Wholesale' : 'Retail'} per base unit<select className="form-select" value={choice.method} onChange={e => update(current => ({ ...current, [itemId]: { method: e.target.value, value: '' } }))}>{priceMethods.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      {choice.method === 'keep' ? <small>Current: {money(trade ? item?.wholesale : item?.retail)}</small> : <div className={layout.actions}><input aria-label={`${trade ? 'Wholesale' : 'Retail'} ${item?.name || itemId} price value`} className="form-control" style={{ maxWidth: 160 }} type="number" min="0" max={choice.method === 'margin' ? 99.999 : undefined} step="any" value={choice.value} onChange={e => update(current => ({ ...current, [itemId]: { method: choice.method, value: e.target.value } }))}/><button type="button" className="btn btn-outline-secondary" disabled={!choice.value || busy} onClick={() => preview(itemId, trade)}>Preview</button></div>}
      {choice.price !== undefined && <output className={layout.preview}>Proposed: {money(choice.price)}<small className="d-block fw-normal">Current: {money(trade ? item?.wholesale : item?.retail)} · Cost basis: {money(choice.cost)} · Gross margin: {choice.margin}%</small></output>}
    </div>;
  };
  const selectable = order ? items.filter((item: any) => order.lines?.some((line: any) => String(line.item_id ?? line.itemId) === item.id)) : items;
  return <Modal title={delivery ? `Delivery: ${delivery.details.reference}` : 'Receive a delivery'} size="wide" onClose={onClose} busy={busy}>
    <Message error={error || setup.error} notice={notice}/>
    {!delivery ? <form onSubmit={e => { e.preventDefault(); savePhysical(); }}>
      <p className={styles.muted}>Record what arrived first. Acceptance adds usable goods to stock; invoicing and payment are separate.</p>
      {physical.pending && <div className="alert alert-warning">A delivery save needs confirmation. Do not record a replacement.<button type="button" className="btn btn-warning ms-2" disabled={busy} onClick={() => savePhysical(true)}>Retry original delivery</button></div>}
      <fieldset disabled={locked || setup.loading || !!setup.error} className="border-0 p-0">
        <div className={layout.grid}>
          <label className="form-label">Supplier<select required className="form-select" value={supplier} disabled={!!basket.length} onChange={e => { setSupplier(e.target.value); setOrderId(''); chooseMedicine(null); }}><option value="">Choose supplier</option>{setup.data?.suppliers?.map((row: any) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
          <label className="form-label">Supplier order<select className="form-select" value={orderId} disabled={!!basket.length} onChange={e => { setOrderId(e.target.value); chooseMedicine(null); }}><option value="">Without an order</option>{orders.filter((row: any) => !supplier || (row.supplier_id ?? row.supplierId) === supplier).map((row: any) => <option key={row.id} value={row.id}>{row.reference || row.order_number || row.id} · {row.status}</option>)}</select></label>
          <label className="form-label">Delivery reference<input className="form-control" required maxLength={120} value={reference} onChange={e => setReference(e.target.value)}/></label>
        </div>
        <section className={layout.batch} aria-label="Add delivered batch">
          <label className="form-label d-block" htmlFor={pickerId}>Medicine</label><Select ref={picker} inputId={pickerId} instanceId={pickerId} styles={reactSelectCustomStyles} options={selectable} value={medicine} getOptionLabel={item => `${item.name} · ${item.sku || item.id}`} getOptionValue={item => item.id} onChange={chooseMedicine} placeholder="Find medicine by name or SKU" blurInputOnSelect={false} isClearable/>
          {medicine && <div className={`${layout.grid} mt-3`}>
            <label className="form-label">Counted unit<select className="form-select" value={unitType} onChange={e => { setUnitType(e.target.value); setCost(''); }}><option value="consumption">{medicine.unit}</option>{medicine.purchaseUnit && <option value="purchase">{medicine.purchaseUnit}</option>}</select></label>
            <label className="form-label">Actual count<input className="form-control" type="number" min=".001" step=".001" value={quantity} onChange={e => setQuantity(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBatch(); } }}/></label>
            <label className="form-label">Cost per counted unit (GHS)<input className="form-control" type="number" min="0" step="any" placeholder="Unknown — leave blank" value={cost} onChange={e => setCost(e.target.value)}/></label>
            {unitType === 'purchase' && <label className="form-label">Base units per pack<input className="form-control" type="number" min=".001" step=".001" value={factor} onChange={e => setFactor(e.target.value)}/></label>}
            <label className="form-label">Batch number<input className="form-control" maxLength={100} value={batch} onChange={e => setBatch(e.target.value)}/></label>
            <label className="form-label">Expiry date<input className="form-control" type="date" value={expiry} onChange={e => setExpiry(e.target.value)}/></label>
            <label className="form-label">Condition<select className="form-select" value={condition} onChange={e => setCondition(e.target.value)}><option value="good">Good</option><option value="damaged">Damaged — hold</option><option value="expired">Expired — hold</option></select></label>
            <label className="form-label">Line discount (GHS)<input className="form-control" type="number" min="0" step=".01" value={discount} onChange={e => setDiscount(e.target.value)}/></label>
            <label className="form-label">Non-recoverable tax (GHS)<input className="form-control" type="number" min="0" step=".01" value={tax} onChange={e => setTax(e.target.value)}/></label>
            <div className={layout.wide}><button type="button" className="btn btn-outline-primary" onClick={addBatch}>Add batch</button><small className="ms-2">Add the same medicine again for another batch. Missing safety details can be recorded, but prevent acceptance.</small></div>
          </div>}
        </section>
        <div className={`${layout.basket} table-responsive`}><table className={styles.table}><thead><tr><th>Medicine / batch</th><th>Count / base units</th><th>Cost per counted unit</th><th>Condition / expiry</th><th/></tr></thead><tbody>{basket.map(line => <tr key={line.key}><td>{line.name}<small className="d-block">{line.batchNumber || 'No batch'}</small></td><td>{line.quantity} {line.unitType === 'purchase' ? 'packs' : 'units'} / {Number((line.quantity * line.unitsPerPurchaseUnit).toFixed(3))}</td><td>{line.unitCost === undefined ? 'Unknown' : money(line.unitCost)}</td><td>{line.condition} / {line.expiryDate || 'No expiry'}</td><td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setBasket(rows => rows.filter(row => row.key !== line.key))}>Remove</button></td></tr>)}</tbody></table>{!basket.length && <p className="p-3 mb-0">No batches added yet.</p>}</div>
        <div className={layout.grid}><label className="form-label">Additional delivery cost (GHS)<input className="form-control" type="number" min="0" step=".01" required value={additionalCost} onChange={e => setAdditionalCost(e.target.value)}/></label><label className={`${layout.wide} form-label`}>Reason / delivery differences<input className="form-control" maxLength={1000} placeholder="Required for actual cost or quantity differences from an order" value={reason} onChange={e => setReason(e.target.value)}/></label></div>
        <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!basket.length || !!medicine || busy}>Save physical delivery</button></footer>
      </fieldset>
    </form> : <>
      <div className={layout.summary}><strong>Physical delivery saved · {delivery.id}</strong><p className="mb-0">Status: {String(delivery.status).replaceAll('_', ' ')}. Delivered is not accepted. Only accepted quantities enter stock; held goods are not available for sale.</p>{!lines.some(line => Number(line.suggestedAcceptance) > 0) && lines.some(line => heldQuantity(line) > 0) && <p className="mb-0 mt-2">No quantity is suggested for acceptance. Review cost, batch safety and order limits, or return held goods.</p>}</div>
      {acceptance.pending && <div className="alert alert-warning">Acceptance needs confirmation.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => accept(true)}>Retry original acceptance</button></div>}
      {access.manager && returns.pending && <div className="alert alert-warning">Return needs confirmation.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => returnHeld(true)}>Retry original return</button></div>}
      <fieldset disabled={actionLocked} className="border-0 p-0">
        <div className="table-responsive"><table className={styles.table}><thead><tr><th>Medicine / batch / expiry</th><th>Delivered / accepted / held</th><th>Base-unit cost</th><th>Accept now</th><th>Return held</th></tr></thead><tbody>{lines.map(line => <tr key={line.id}><td><strong>{line.name}</strong><small className="d-block">{line.batchNumber || 'No batch'} / {line.expiryDate?.slice(0, 10) || 'No expiry'} · {line.condition}</small></td><td>{line.quantityDelivered} / {line.acceptedQuantity} / {heldQuantity(line)}<small className="d-block">Returned: {line.returnedQuantity}</small></td><td>{line.unitCost == null ? <input aria-label={`Confirmed base-unit cost ${line.name}`} className={`form-control ${layout.quantity}`} type="number" min="0" step="any" placeholder="Unknown" value={costs[line.id] || ''} onChange={e => setCosts(current => ({ ...current, [line.id]: e.target.value }))}/> : money(line.unitCost)}</td><td><input aria-label={`Accept ${line.name} ${line.batchNumber || line.id}`} className={`form-control ${layout.quantity}`} type="number" min="0" max={heldQuantity(line)} step=".001" disabled={!heldQuantity(line) || line.condition !== 'good'} value={counts[line.id] || '0'} onChange={e => setCounts(current => ({ ...current, [line.id]: e.target.value }))}/></td><td><input aria-label={`Return ${line.name} ${line.batchNumber || line.id}`} className={`form-control ${layout.quantity}`} type="number" min="0" max={heldQuantity(line)} step=".001" disabled={!heldQuantity(line)} value={returnCounts[line.id] || '0'} onChange={e => setReturnCounts(current => ({ ...current, [line.id]: e.target.value }))}/></td></tr>)}</tbody></table></div>
        {[...new Set(lines.filter(line => Number(counts[line.id]) > 0).map(line => line.itemId))].map(itemId => <section key={itemId} className={layout.batch}><h3 className="h6">{lines.find(line => line.itemId === itemId)?.name} · selling prices</h3><div className={layout.prices}>{priceControl(itemId)}{priceControl(itemId, true)}</div></section>)}
        <label className="form-label d-block mt-3">Acceptance / return reason<input className="form-control" maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} placeholder="Required for returns, excess approval or order differences"/></label>
        {access.manager && (delivery.details.policy?.mode ?? setup.data?.policy?.mode) !== 'prohibit' && <label className="d-block my-3"><input type="checkbox" checked={excessApproved} onChange={e => setExcessApproved(e.target.checked)}/> As manager, approve acceptance above the outstanding order limit (reason required).</label>}
        {(delivery.details.policy || setup.data?.policy) && <p className={styles.muted}>Delivery excess policy: {delivery.details.policy?.mode ?? setup.data.policy.mode}{(delivery.details.policy?.mode ?? setup.data.policy.mode) === 'tolerance' ? ` (${delivery.details.policy?.tolerancePercent ?? setup.data.policy.tolerancePercent}%)` : ''}. Damaged, expired or unsafe batches cannot be accepted.</p>}
        <div className={layout.actions}><button type="button" className="btn btn-primary" disabled={!lines.some(line => Number(counts[line.id]) > 0)} onClick={() => accept()}>Accept selected goods</button>{access.manager ? <button type="button" className="btn btn-outline-danger" disabled={!lines.some(line => Number(returnCounts[line.id]) > 0) || !reason.trim()} onClick={() => returnHeld()}>Return selected held goods</button> : <p className={styles.muted}>A manager or administrator must authorize returning held goods.</p>}</div>
      </fieldset>
      <footer className={styles.footer}><Link href="/pharmacy/inventory/deliveries" className="btn btn-outline-primary">Deliveries &amp; invoices</Link><button className="btn btn-secondary" disabled={busy} onClick={onClose}>Done</button></footer>
    </>}
  </Modal>;
}
