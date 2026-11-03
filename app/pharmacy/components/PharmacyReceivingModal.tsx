'use client';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Select, { type SelectInstance } from 'react-select';
import { customFetchMutation, reactSelectCustomStyles } from '../../../components/Auth/customFetch';
import { heldQuantity, lastCost, priceDraftChoices, priceMethods, quickPriceModes, receivingItem, type PriceDraft, type ReceivingLine } from '../../../lib/pharmacyReceiving';
import { accountingReference } from '../../../lib/pharmacyAccounting';
import { usePharmacyDocument } from './PharmacyPaymentFields';
import { styles, money, Modal, Message, usePharmacyAccess, usePharmacyResource } from './PharmacyWorkspace';
import Loader from '../../../components/isLoading';
import layout from './PharmacyReceivingModal.module.css';

type BasketLine = { key: string; itemId: string; name: string; orderLineId?: string; quantity: number; unitCost?: number; unitType: string; unitsPerPurchaseUnit: number; batchNumber: string; expiryDate?: string; condition: string; discountAmount: number; nonRecoverableTaxAmount: number };
type Choice = { method: string; value: string; price?: number; cost?: number; margin?: number };
type PriceDialog = { itemId: string; enabled: boolean; draft: PriceDraft; retail: Choice; wholesale: Choice };
type Props = { initialItems?: any[]; initialItemId?: string; initialOrderId?: string; initialDelivery?: any; presentation?: 'page' | 'modal'; backLabel?: string; onClose: () => void; onCompleted: () => void | Promise<void>; onPaySupplier?: () => void };
export default function PharmacyReceivingModal({ initialItems = [], initialItemId = '', initialOrderId = '', initialDelivery, presentation = 'modal', backLabel = 'Back to deliveries', onClose, onCompleted, onPaySupplier }: Props) {
  const access = usePharmacyAccess(), setup = usePharmacyResource(`pharmacy/receiving/setup${initialOrderId ? `?orderId=${encodeURIComponent(initialOrderId)}` : ''}`);
  const physical = usePharmacyDocument('delivery-record'), acceptance = usePharmacyDocument('delivery-accept'), returns = usePharmacyDocument('delivery-return');
  const [delivery, setDelivery] = useState<any>(initialDelivery || null), [basket, setBasket] = useState<BasketLine[]>([]);
  const [supplier, setSupplier] = useState(''), [orderId, setOrderId] = useState(initialOrderId), [reference, setReference] = useState(''), [reason, setReason] = useState(''), [additionalCost, setAdditionalCost] = useState('0');
  const [medicine, setMedicine] = useState<any>(initialItems[0] ? receivingItem(initialItems[0]) : null);
  const [quantity, setQuantity] = useState(''), [cost, setCost] = useState(''), [unitType, setUnitType] = useState('consumption'), [factor, setFactor] = useState(String(initialItems[0] ? receivingItem(initialItems[0]).factor : 1));
  const [batch, setBatch] = useState(''), [expiry, setExpiry] = useState(''), [condition, setCondition] = useState('good'), [discount, setDiscount] = useState('0'), [tax, setTax] = useState('0');
  const [counts, setCounts] = useState<Record<string, string>>({}), [costs, setCosts] = useState<Record<string, string>>({}), [returnCounts, setReturnCounts] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, Choice>>({}), [wholesale, setWholesale] = useState<Record<string, Choice>>({});
  const [changePrices, setChangePrices] = useState<Record<string, boolean>>({}), [priceDrafts, setPriceDrafts] = useState<Record<string, PriceDraft>>({});
  const [priceDialog, setPriceDialog] = useState<PriceDialog | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]), [bulkMethod, setBulkMethod] = useState('margin'), [bulkValue, setBulkValue] = useState(''), [previewing, setPreviewing] = useState(false);
  const [excessApproved, setExcessApproved] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const guided = !!initialOrderId;
  const [includeInvoice, setIncludeInvoice] = useState(false), [invoiceReference, setInvoiceReference] = useState(''), [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10)), [invoiceDue, setInvoiceDue] = useState('');
  const [savedBill, setSavedBill] = useState<{ reference: string; amount: string } | null>(null);
  const picker = useRef<SelectInstance<any, false>>(null), pickerId = useId();
  const preloadedOrder = useRef(''), preloadedItem = useRef('');
  const items = (setup.data?.items || []).map(receivingItem), orders = setup.data?.orders || [];
  const order = orders.find((row: any) => row.id === orderId), lines: ReceivingLine[] = delivery?.details?.lines || [];
  const locked = busy || !!physical.pending, actionLocked = busy || !!acceptance.pending || !!returns.pending;
  const priceItemIds = [...new Set(delivery ? lines.filter(line => Number(counts[line.id]) > 0).map(line => line.itemId) : basket.filter(line => line.condition === 'good').map(line => line.itemId))];
  const today = new Date().toISOString().slice(0, 10);
  const missingCosts = basket.filter(line => line.condition === 'good' && line.unitCost === undefined);
  const unsafeBatches = basket.filter(line => line.condition === 'good' && ((items.find((item: any) => item.id === line.itemId)?.batchTracking && !line.expiryDate) || (line.expiryDate && line.expiryDate < today)));
  const incompleteBatches = new Set([...missingCosts, ...unsafeBatches].map(line => line.key)).size;
  const costedLines = basket.filter(line => line.condition === 'good' && line.unitCost !== undefined);
  const estimatedCost = costedLines.reduce((sum, line) => sum + line.quantity * (line.unitCost || 0) - (line.discountAmount || 0) + (line.nonRecoverableTaxAmount || 0), 0) + (Number(additionalCost) || 0);
  const baseUnitsReceived = basket.reduce((sum, line) => sum + line.quantity * line.unitsPerPurchaseUnit, 0);
  const changedPriceCount = priceItemIds.filter(id => [prices[id], wholesale[id]].some(choice => choice && choice.method !== 'keep')).length;
  const receiptInput = { supplierId: supplier, orderId: orderId || undefined, reference: reference.trim() || undefined, reason: reason.trim() || undefined,
    additionalCost: Number(additionalCost), lines: basket.map(({ key, name, ...line }) => line) };
  const previewPrices = priceDialog ? { ...prices, [priceDialog.itemId]: priceDialog.retail } : prices;
  const previewWholesale = priceDialog ? { ...wholesale, [priceDialog.itemId]: priceDialog.wholesale } : wholesale;
  const priceSignature = JSON.stringify({ choices: priceItemIds.map(id => [id, previewPrices[id]?.method, previewPrices[id]?.value, previewWholesale[id]?.method, previewWholesale[id]?.value]), counts, costs, receipt: delivery ? undefined : receiptInput });
  useEffect(() => {
    let active = true;
    const choices = priceItemIds.flatMap(itemId => [false, true].flatMap(trade => {
      const choice = (trade ? previewWholesale : previewPrices)[itemId];
      return choice && choice.method !== 'keep' && choice.value.trim() !== '' ? [{ itemId, trade, choice }] : [];
    }));
    setPreviewing(choices.length > 0);
    const timer = setTimeout(async () => {
      if (!choices.length) { setPreviewing(false); return; }
      setError('');
      try {
        const results = await Promise.all(choices.map(async ({ itemId, trade, choice }) => {
          const accepted = lines.filter(line => line.itemId === itemId && Number(counts[line.id]) > 0);
          if (delivery && accepted.some(line => line.unitCost == null && !costs[line.id]?.trim())) throw new Error('Confirm actual costs before previewing prices.');
          const result = await customFetchMutation('pharmacy/receiving/prices/preview', 'POST', { itemId, wholesale: trade, method: choice.method, value: Number(choice.value),
            ...(delivery ? { deliveryId: delivery.id, lines: accepted.map(line => ({ lineId: line.id, quantity: Number(counts[line.id]), ...(line.unitCost == null ? { unitCost: Number(costs[line.id]) } : {}) })) } : { receipt: receiptInput }) });
          if (!result?.success) throw new Error(result?.error?.message || 'Unable to preview selling price.');
          return { itemId, trade, choice: { ...choice, price: result.data.price, cost: result.data.cost, margin: result.data.margin } };
        }));
        if (active) for (const result of results) {
          if (priceDialog?.itemId === result.itemId) setPriceDialog(current => current && ({ ...current, [result.trade ? 'wholesale' : 'retail']: result.choice }));
          else (result.trade ? setWholesale : setPrices)(current => ({ ...current, [result.itemId]: result.choice }));
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Unable to preview selling price.');
          for (const { itemId, trade, choice } of choices) {
            const cleared = { method: choice.method, value: choice.value };
            if (priceDialog?.itemId === itemId) setPriceDialog(current => current && ({ ...current, [trade ? 'wholesale' : 'retail']: cleared }));
            else (trade ? setWholesale : setPrices)(current => ({ ...current, [itemId]: cleared }));
          }
        }
      } finally { if (active) setPreviewing(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [priceSignature, priceDialog?.itemId, delivery?.id, delivery?.version]);
  useEffect(() => { if (order) setSupplier(order.supplier_id ?? order.supplierId); }, [order?.id]);
  useEffect(() => {
    if (!initialItemId || initialOrderId || delivery || !setup.data || preloadedItem.current === initialItemId) return;
    preloadedItem.current = initialItemId;
    const item = items.find((row: any) => row.id === initialItemId);
    if (!item) { setError('This medicine is unavailable for receiving in your branch. Choose an active medicine below.'); return; }
    setMedicine(item); setFactor(String(item.factor));
  }, [initialItemId, initialOrderId, delivery, setup.data]);
  useEffect(() => {
    if (!initialOrderId || !order || delivery || preloadedOrder.current === order.id) return;
    preloadedOrder.current = order.id;
    setMedicine(null);
    setBasket(order.lines.filter((line: any) => Number(line.quantity_ordered) > Number(line.quantity_received)).map((line: any) => ({
      key: crypto.randomUUID(), itemId: String(line.item_id), name: line.name || items.find((item: any) => item.id === line.item_id)?.name || 'Medicine',
      orderLineId: line.id, quantity: Number((Number(line.quantity_ordered) - Number(line.quantity_received)).toFixed(3)),
      unitCost: line.unit_cost != null ? Number(line.unit_cost) : (prefill => prefill === '' ? undefined : Number(prefill))(lastCost(items.find((item: any) => item.id === String(line.item_id)))),
      unitType: 'consumption', unitsPerPurchaseUnit: 1, batchNumber: '', condition: 'good', discountAmount: 0, nonRecoverableTaxAmount: 0,
    })));
  }, [initialOrderId, order, delivery]);
  useEffect(() => {
    if (!delivery) return;
    setCounts(Object.fromEntries(lines.map(line => [line.id, String(Math.min(heldQuantity(line), Math.max(0, Number(line.suggestedAcceptance ?? 0))))])));
    setCosts({}); setReturnCounts({}); setPrices({}); setWholesale({}); setChangePrices({}); setPriceDrafts({}); setExcessApproved(false);
  }, [delivery?.id, delivery?.version]);
  const chooseMedicine = (selected: any) => {
    setMedicine(selected); setQuantity(''); setCost(lastCost(selected)); setUnitType('consumption'); setFactor(String(selected?.factor || 1));
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
      if (response.data?.invoice) setSavedBill(response.data.invoice);
      setNotice(response.data?.invoice ? `Stock saved. Supplier invoice ${response.data.invoice.reference}: ${money(response.data.invoice.amount)} is unpaid. Pay now or leave it in supplier bills.${response.data.heldQuantity ? ` ${response.data.heldQuantity} base units remain held and cannot be sold.` : ''}`
        : response.data?.acceptedQuantity !== undefined ? `Stock saved: ${response.data.acceptedQuantity} base units added.${response.data.heldQuantity ? ` ${response.data.heldQuantity} base units remain held and cannot be sold.` : ''} Record the supplier invoice before paying.` : success);
      await onCompleted();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); }
    finally { setBusy(false); }
  };
  const savePhysical = (retry = false) => {
    if (!retry && (medicine || !basket.length)) { setError(medicine ? 'Add this batch before saving the delivery.' : 'Add at least one delivered batch.'); return; }
    return run(() => physical.execute('pharmacy/receiving/deliveries', receiptInput), 'Physical delivery saved. No stock has been added. Review and accept eligible goods below; held goods can be returned.');
  };
  const pricingInput = (ids: string[]) => ids.map(itemId => {
    const retail = prices[itemId] || { method: 'keep', value: '' }, trade = wholesale[itemId] || { method: 'keep', value: '' };
    return { itemId, method: retail.method, ...(retail.method !== 'keep' ? { value: Number(retail.value), expectedPrice: retail.price } : {}),
      wholesale: { method: trade.method, ...(trade.method !== 'keep' ? { value: Number(trade.value), expectedPrice: trade.price } : {}) } };
  }).filter(choice => choice.method !== 'keep' || choice.wholesale.method !== 'keep');
  const saveStock = () => {
    if (medicine || !basket.length) { setError(medicine ? 'Add this medicine before saving stock.' : 'Add at least one medicine.'); return; }
    const missing = missingCosts[0];
    if (missing) { setError(`Enter the purchase cost for ${missing.name}, or save the physical delivery only until it is known.`); return; }
    const unsafe = unsafeBatches[0];
    if (unsafe) { setError(`Enter a valid unexpired expiry date for ${unsafe.name}, or save the physical delivery only to hold it aside.`); return; }
    if (priceItemIds.some(id => [prices[id], wholesale[id]].some(choice => choice && choice.method !== 'keep' && (choice.value.trim() === '' || choice.price === undefined)))) {
      setError('Enter a value for each changed price and wait for its preview.'); return;
    }
    if (includeInvoice && (!invoiceReference.trim() || !invoiceDate)) { setError('Enter the supplier invoice reference and date, or choose invoice not available yet.'); return; }
    return run(() => physical.execute('pharmacy/receiving/receive', { ...receiptInput, pricing: pricingInput(priceItemIds),
      ...(includeInvoice ? { invoice: { reference: invoiceReference.trim(), invoiceDate, ...(invoiceDue ? { dueDate: invoiceDue } : {}) } } : {}) }), 'Stock saved.');
  };
  const accept = (retry = false) => {
    const selected = lines.filter(line => Number(counts[line.id]) > 0);
    if (!retry && !selected.length) { setError('Enter the quantity to accept on at least one eligible line.'); return; }
    const ids = [...new Set(selected.map(line => line.itemId))];
    if (!retry && ids.some(id => [prices[id], wholesale[id]].some(choice => choice && choice.method !== 'keep' && choice.price === undefined))) {
      setError('Preview each changed selling price before confirming acceptance.'); return;
    }
    if (!retry && guided && includeInvoice && (!invoiceReference.trim() || !invoiceDate)) { setError('Enter the supplier invoice reference and date, or choose invoice not available yet.'); return; }
    return run(() => acceptance.execute(`pharmacy/receiving/deliveries/${delivery.id}/${guided ? 'finish' : 'accept'}`, {
      expectedVersion: delivery.version, reason: reason.trim() || undefined, excessApproved: excessApproved || undefined,
      lines: selected.map(line => ({ lineId: line.id, quantity: Number(counts[line.id]), ...(line.unitCost == null && costs[line.id]?.trim() !== '' && costs[line.id] !== undefined ? { unitCost: Number(costs[line.id]) } : {}) })),
      pricing: pricingInput(ids),
      ...(guided && includeInvoice ? { invoice: { reference: invoiceReference.trim(), invoiceDate, ...(invoiceDue ? { dueDate: invoiceDue } : {}) } } : {}),
    }), guided ? 'Stock saved. Supplier invoice not recorded yet. Record it before paying; held goods are not available for sale.' : 'Accepted goods added to stock. Unaccepted quantities remain held. Record the supplier invoice separately.');
  };
  const returnHeld = (retry = false) => {
    const selected = lines.filter(line => Number(returnCounts[line.id]) > 0);
    if (!retry && (!selected.length || !reason.trim())) { setError('Enter held quantities to return and a return reason.'); return; }
    return run(() => returns.execute(`pharmacy/receiving/deliveries/${delivery.id}/return`, { expectedVersion: delivery.version, reason: reason.trim(), lines: selected.map(line => ({ lineId: line.id, quantity: Number(returnCounts[line.id]) })) }), 'Held goods returned. Accepted stock was not changed.');
  };
  const updatePriceDraft = (itemId: string, patch: Partial<PriceDraft>) => {
    const item = items.find((row: any) => row.id === itemId);
    setPriceDialog(current => {
      if (!current) return current;
      const draft = { ...current.draft, ...patch };
      return { ...current, draft, ...priceDraftChoices(draft, { retail: Number(item?.retail) || 0, wholesale: Number(item?.wholesale) || 0 }) };
    });
  };
  const shown = (choice: Choice | undefined, existing: number) => choice && choice.method !== 'keep' ? choice.price === undefined ? 'calculating...' : money(choice.price) : `${money(existing)} (unchanged)`;
  const sellingPrices = (itemId: string) => {
    const item = items.find((row: any) => row.id === itemId), enabled = !!changePrices[itemId];
    const name = item?.name || itemId;
    return <div className={layout.priceChoice}>
      <div className={layout.priceInputs}><small>Retail<strong className="d-block">{shown(prices[itemId], Number(item?.retail) || 0)}</strong></small><small>Wholesale<strong className="d-block">{shown(wholesale[itemId], Number(item?.wholesale) || 0)}</strong></small></div>
      {access.manager ? <button type="button" className={`btn btn-sm ${enabled ? 'btn-primary' : 'btn-outline-primary'}`} aria-label={`${enabled ? 'Edit price change' : 'Change price'} for ${name}`} onClick={() => {
        setError('');
        setPriceDialog({ itemId, enabled: true, draft: priceDrafts[itemId] || { mode: 'increase_percentage', value: '', retail: item?.retail > 0 ? String(item.retail) : '', wholesale: item?.wholesale > 0 ? String(item.wholesale) : '' }, retail: prices[itemId] || { method: 'keep', value: '' }, wholesale: wholesale[itemId] || { method: 'keep', value: '' } });
      }}>{enabled ? 'Edit price change' : 'Change price'}</button> : <small className="d-block">Prices stay unchanged. A manager can change them.</small>}
    </div>;
  };
  const dialogItem = items.find((row: any) => row.id === priceDialog?.itemId);
  const dialogPending = !!priceDialog && [priceDialog.retail, priceDialog.wholesale].some(choice => choice.method !== 'keep' && (choice.price === undefined || !Number.isFinite(choice.price) || choice.price <= 0));
  const supplierBill = access.manager && !savedBill && <details className={layout.batch}><summary>Supplier bill (optional)</summary>
    <label className="form-label d-block">Invoice availability<select className="form-select" value={includeInvoice ? 'now' : 'later'} onChange={e => setIncludeInvoice(e.target.value === 'now')}><option value="now">Invoice is here: record it with stock</option><option value="later">Invoice not available yet</option></select></label>
    {includeInvoice ? <><p>Record the supplier invoice with accepted stock. Unpaid amounts remain in supplier bills.</p><div className={layout.grid}>
      <label className="form-label">Supplier invoice reference<input className="form-control" maxLength={128} value={invoiceReference} onChange={e => setInvoiceReference(e.target.value)}/></label>
      <label className="form-label">Supplier invoice date<input className="form-control" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}/></label>
      <label className="form-label">Invoice due date (optional)<input className="form-control" type="date" min={invoiceDate} value={invoiceDue} onChange={e => setInvoiceDue(e.target.value)}/></label>
    </div></> : <p>Save stock now. Record the supplier invoice later before paying.</p>}
  </details>;
  const applyBulkRule = () => {
    const ids = bulkSelected.filter(id => priceItemIds.includes(id));
    setPrices(current => ({ ...current, ...Object.fromEntries(ids.map(id => [id, { method: bulkMethod, value: bulkValue }])) }));
    setChangePrices(current => ({ ...current, ...Object.fromEntries(ids.map(id => [id, true])) }));
    setPriceDrafts(current => Object.fromEntries(Object.entries(current).filter(([id]) => !ids.includes(id))));
  };
  const hasHeldGoods = lines.some(line => heldQuantity(line) > 0);
  const selectable = order ? items.filter((item: any) => order.lines?.some((line: any) => String(line.item_id ?? line.itemId) === item.id)) : items;
  return <ReceivingFrame title={delivery ? `Delivery: ${delivery.details.reference}` : 'Receive stock'} presentation={presentation} backLabel={backLabel} onClose={onClose} busy={busy}>
    <Message error={error || setup.error || (!delivery && initialOrderId && setup.data && !order ? 'This purchase order is unavailable for receiving. Return to the purchase order and check its status.' : '')} notice={notice}/>
    {setup.loading && <div className={layout.loading} role="status" aria-busy="true"><Loader/><span>Loading receiving options...</span></div>}
    {setup.error && <button type="button" className="btn btn-outline-primary" disabled={setup.loading} onClick={setup.refresh}>Retry loading receiving options</button>}
    {!delivery ? <form onSubmit={e => { e.preventDefault(); saveStock(); }}>
      {physical.pending && <div className="alert alert-warning">A delivery save needs confirmation. Do not record a replacement.<button type="button" className="btn btn-warning ms-2" disabled={busy} onClick={() => savePhysical(true)}>Retry original delivery</button></div>}
      <fieldset disabled={locked || setup.loading || !!setup.error || (!!initialOrderId && !order)} className="border-0 p-0">
        <section className={layout.panel} aria-labelledby={`${pickerId}-delivery-heading`}>
          <div className={layout.sectionHeading}>
            <span className={layout.sectionIndex} aria-hidden="true">1</span>
            <div><h2 id={`${pickerId}-delivery-heading`}>Delivery details</h2><p>Confirm the supplier and the order these goods belong to.</p></div>
            {order && <span className={layout.orderBadge}>{order.reference || order.order_number || accountingReference(order.id, 'id', 'order')}</span>}
          </div>
        <div className={`${layout.grid} ${layout.contextGrid}`}>
          <label className="form-label">Supplier<select required className="form-select" value={supplier} disabled={(!!basket.length && !!supplier) || !!initialOrderId} onChange={e => { setSupplier(e.target.value); setOrderId(''); chooseMedicine(null); }}><option value="">Choose supplier</option>{setup.data?.suppliers?.map((row: any) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
          <label className="form-label">Supplier order<select className="form-select" value={orderId} disabled={!!basket.length || !!initialOrderId} onChange={e => { setOrderId(e.target.value); chooseMedicine(null); }}><option value="">Without an order</option>{orders.filter((row: any) => !supplier || (row.supplier_id ?? row.supplierId) === supplier).map((row: any) => <option key={row.id} value={row.id}>{row.reference || row.order_number || accountingReference(row.id, 'id', 'order')} · {row.status}</option>)}</select></label>
        </div>
        </section>
        <section className={layout.panel} aria-labelledby={`${pickerId}-medicines-heading`}>
          <div className={layout.sectionHeading}>
            <span className={layout.sectionIndex} aria-hidden="true">2</span>
            <div><h2 id={`${pickerId}-medicines-heading`}>Medicines received</h2><p>{initialOrderId ? 'Outstanding order quantities are prefilled. Match each line to the goods that arrived.' : 'Add each medicine and batch from this delivery.'}</p></div>
            <span className={layout.orderBadge}>{basket.length} {basket.length === 1 ? 'batch' : 'batches'}</span>
          </div>
        <details className={`${layout.batch} ${layout.addBatch}`} aria-label="Add delivered batch" open={!initialOrderId}>
          <summary>{initialOrderId ? 'Add another medicine or batch' : 'Add delivered medicines'}</summary>
          <label className="form-label d-block" htmlFor={pickerId}>Medicine</label><Select ref={picker} inputId={pickerId} instanceId={pickerId} styles={reactSelectCustomStyles} options={selectable} value={medicine} getOptionLabel={item => `${item.name} · ${item.sku || item.id}`} getOptionValue={item => item.id} onChange={chooseMedicine} placeholder="Find medicine by name or SKU" blurInputOnSelect={false} isClearable/>
          {medicine && <div className={`${layout.grid} mt-3`}>
            <label className="form-label">Counted unit<select className="form-select" value={unitType} onChange={e => { setUnitType(e.target.value); setCost(lastCost(medicine, e.target.value === 'purchase' ? Number(factor) || 1 : 1)); }}><option value="consumption">{medicine.unit}</option>{medicine.purchaseUnit && <option value="purchase">{medicine.purchaseUnit}</option>}</select></label>
            <label className="form-label">Actual count<input name="quantity" className="form-control" type="number" min=".001" step=".001" value={quantity} onChange={e => setQuantity(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBatch(); } }}/></label>
            <label className="form-label">Cost per counted unit (GHS)<input className="form-control" type="number" min="0" step="any" placeholder="Unknown — leave blank" title="Prefilled with the last purchase cost; change it if the supplier charged differently." value={cost} onChange={e => setCost(e.target.value)}/></label>
            {unitType === 'purchase' && <label className="form-label">Base units per pack<input className="form-control" type="number" min=".001" step=".001" value={factor} onChange={e => setFactor(e.target.value)}/></label>}
            <label className="form-label">Batch number (optional)<input className="form-control" maxLength={100} placeholder="Leave blank to generate automatically" value={batch} onChange={e => setBatch(e.target.value)}/></label>
            <label className="form-label">Expiry date {medicine.batchTracking ? '(required for stock)' : '(optional)'}<input className="form-control" type="date" value={expiry} onChange={e => setExpiry(e.target.value)}/></label>
            <details className={layout.wide}><summary>Condition, discount or tax (optional)</summary><div className={layout.grid}>
              <label className="form-label">Condition<select className="form-select" value={condition} onChange={e => setCondition(e.target.value)}><option value="good">Good</option><option value="damaged">Damaged — hold</option><option value="expired">Expired — hold</option></select></label>
              <label className="form-label">Line discount (GHS)<input className="form-control" type="number" min="0" step=".01" value={discount} onChange={e => setDiscount(e.target.value)}/></label>
              <label className="form-label">Tax that cannot be reclaimed (GHS)<input className="form-control" type="number" min="0" step=".01" value={tax} onChange={e => setTax(e.target.value)}/></label>
            </div></details>
            <div className={layout.wide}><button type="button" className="btn btn-outline-primary" onClick={addBatch}>Add medicine</button><small className="ms-2">Add the same medicine again if a different batch arrived. Blank batch numbers are generated when saved; use the manufacturer's number when available.</small></div>
          </div>}
        </details>
        {initialOrderId && <p className={layout.lineMeta}>Enter actual counts, costs and expiry dates. Remove undelivered lines. Blank batch numbers are generated automatically.</p>}
        <p className={layout.tableHint}>Scroll sideways to review every column.</p>
        <div className={`${layout.basket} table-responsive`} tabIndex={0} role="region" aria-label="Delivered medicine batches"><table className={styles.table}><thead><tr><th scope="col">Medicine / batch</th><th scope="col">Actual count / base units</th><th scope="col">Purchase cost per counted unit</th><th scope="col">Condition / expiry</th><th scope="col">Pricing</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{basket.map(line => {
          const patch = (change: Partial<BasketLine>) => setBasket(rows => rows.map(row => row.key === line.key ? { ...row, ...change } : row));
          const orderedLine = order?.lines?.find((row: any) => row.id === line.orderLineId);
          return <tr key={line.key}>
            <td><strong className={layout.medicineName}>{line.name}</strong>{orderedLine && <small className={layout.lineMeta}>Ordered {orderedLine.quantity_ordered} · accepted {orderedLine.quantity_received} · remaining {Math.max(0, orderedLine.quantity_ordered - orderedLine.quantity_received)}</small>}
              <input aria-label={`Batch ${line.name} (optional)`} placeholder="Auto-generated when blank" maxLength={100} className="form-control" value={line.batchNumber} onChange={e => patch({ batchNumber: e.target.value })}/>
            </td>
            <td><input aria-label={`Delivered ${line.name}`} required className={`form-control ${layout.quantity}`} type="number" min=".001" step=".001" value={line.quantity} onChange={e => patch({ quantity: Number(e.target.value) })}/>
              <small className={layout.lineMeta}>{line.unitType === 'purchase' ? 'packs' : 'base units'} / {Number((line.quantity * line.unitsPerPurchaseUnit).toFixed(3))} base units</small>
              {orderedLine && line.quantity * line.unitsPerPurchaseUnit > Math.max(0, orderedLine.quantity_ordered - orderedLine.quantity_received) && <small role="status" className="d-block text-warning">Excess quantities stay held for manager review.</small>}
            </td>
            <td><input aria-label={`Purchase cost ${line.name}`} aria-invalid={line.condition === 'good' && line.unitCost === undefined} className={`form-control ${layout.quantity} ${line.condition === 'good' && line.unitCost === undefined ? 'is-invalid' : ''}`} type="number" min="0" step=".01" placeholder="Unknown" value={line.unitCost ?? ''} onChange={e => patch({ unitCost: e.target.value === '' ? undefined : Number(e.target.value) })}/>
              {line.condition === 'good' && line.unitCost === undefined ? <small className={layout.attention}>Purchase cost needed for stock</small> : line.unitCost !== undefined && <small className={layout.lineMeta}>Line cost {money(line.quantity * line.unitCost)}</small>}
            </td>
            <td><select aria-label={`Condition ${line.name}`} className="form-select" value={line.condition} onChange={e => patch({ condition: e.target.value })}><option value="good">Good</option><option value="damaged">Damaged — hold</option><option value="expired">Expired — hold</option></select>
              <input aria-label={`Expiry ${line.name}`} aria-required={line.condition === 'good' && !!items.find((item: any) => item.id === line.itemId)?.batchTracking} aria-invalid={unsafeBatches.includes(line)} className={`form-control ${unsafeBatches.includes(line) ? 'is-invalid' : ''}`} type="date" value={line.expiryDate || ''} onChange={e => patch({ expiryDate: e.target.value || undefined })}/>
              <small className={unsafeBatches.includes(line) ? layout.attention : layout.lineMeta}>{unsafeBatches.includes(line) ? 'Add a valid expiry date for stock' : items.find((item: any) => item.id === line.itemId)?.batchTracking ? 'Expiry required for usable stock' : 'Expiry optional'}</small>
            </td>
            <td>{line.condition === 'good' ? sellingPrices(line.itemId) : <small>Held goods do not change prices.</small>}</td>
            <td><button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Remove ${line.name} batch`} onClick={() => setBasket(rows => rows.filter(row => row.key !== line.key))}>Remove</button></td>
          </tr>;
        })}</tbody></table>{!basket.length && <div className={layout.empty}><strong>No batches added yet.</strong><p>Choose a medicine above, enter the delivered quantity and add it to this receipt.</p></div>}</div>
        </section>
        <section className={layout.panel} aria-labelledby={`${pickerId}-review-heading`}>
          <div className={layout.sectionHeading}><span className={layout.sectionIndex} aria-hidden="true">3</span><div><h2 id={`${pickerId}-review-heading`}>Review &amp; save</h2><p>Selling prices stay unchanged unless you apply a price change. Supplier billing and payment can be completed later.</p></div></div>
          <dl className={layout.reviewSummary}>
            <div><dt>Batch lines</dt><dd>{basket.length}<small>{Number(baseUnitsReceived.toFixed(3))} base units</small></dd></div>
            <div><dt>Estimated stock cost</dt><dd>{money(estimatedCost)}{missingCosts.length > 0 && <small>{missingCosts.length} without a cost</small>}</dd></div>
            <div><dt>Selling prices</dt><dd>{changedPriceCount ? `Changes for ${changedPriceCount} ${changedPriceCount === 1 ? 'medicine' : 'medicines'}` : 'Unchanged'}</dd></div>
            <div><dt>Supplier invoice</dt><dd>{includeInvoice ? 'Included with stock' : 'Record later'}</dd></div>
          </dl>
          <p className={`${layout.readiness} ${incompleteBatches ? layout.notReady : basket.length ? layout.ready : ''}`} role="status">{incompleteBatches ? `${incompleteBatches} ${incompleteBatches === 1 ? 'batch needs' : 'batches need'} a purchase cost or valid expiry date before saving usable stock.` : basket.length ? 'Check actual counts against the delivery before saving. Only eligible goods become usable stock.' : 'Add at least one delivered batch to continue.'}</p>
          <div className={layout.options}>
            <h3>Optional</h3>
            <details><summary>Optional delivery costs or reason</summary><div className={layout.grid}><label className="form-label">Delivery reference (optional)<input className="form-control" placeholder="Auto-generated when blank" maxLength={120} value={reference} onChange={e => setReference(e.target.value)}/></label><label className="form-label">Additional delivery cost (GHS)<input className="form-control" type="number" min="0" step=".01" value={additionalCost} onChange={e => setAdditionalCost(e.target.value)}/></label><ProcurementReason value={reason} onChange={setReason} label="Delivery note (optional)"/></div></details>
            {supplierBill}
            <details><summary>Hold the whole delivery for later instead</summary><p>Use this only for an incomplete delivery or goods that must remain held. No usable stock, selling-price changes or supplier bill will be saved.</p><button type="button" className="btn btn-outline-secondary" disabled={!basket.length || !!medicine || busy} onClick={() => savePhysical()}>Save physical delivery only</button></details>
          </div>
        </section>
        <footer className={`${styles.footer} ${layout.saveBar}`}>
          <div className={layout.saveSummary}><strong>{basket.length} {basket.length === 1 ? 'batch' : 'batches'} on this receipt</strong><small>{medicine ? 'Add the selected medicine before saving.' : previewing ? 'Wait for selling-price previews to finish.' : incompleteBatches ? `${incompleteBatches} ${incompleteBatches === 1 ? 'batch' : 'batches'} still ${incompleteBatches === 1 ? 'needs' : 'need'} attention.` : `Estimated cost ${money(estimatedCost)}. Stock is updated only when you save.`}</small></div>
          <div className={layout.actions}><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!basket.length || !!medicine || busy || previewing || setup.loading}>{busy ? 'Saving stock...' : previewing ? 'Calculating prices...' : includeInvoice ? 'Save stock & supplier bill' : 'Save stock'}</button></div>
        </footer>
      </fieldset>
    </form> : <>
      <div className={layout.summary}><strong title={delivery.id}>{hasHeldGoods ? 'Review held delivery goods' : 'Receiving complete'} · {accountingReference(delivery.id, 'id', 'delivery')}</strong>
        <p className="mb-0">{hasHeldGoods ? 'Only accepted quantities are available for sale. Review remaining goods below; excess acceptance and returns need manager approval.' : 'Accepted goods are in stock. Selling prices and any supplier bill were saved with this receipt. Do not receive these goods again.'}</p>
        {!lines.some(line => Number(line.suggestedAcceptance) > 0) && hasHeldGoods && <p className="mb-0 mt-2">No quantity is suggested for acceptance. Review cost, batch safety and order limits, or return held goods.</p>}
      </div>
      {acceptance.pending && <div className="alert alert-warning">Acceptance needs confirmation.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => accept(true)}>Retry original acceptance</button></div>}
      {access.manager && returns.pending && <div className="alert alert-warning">Return needs confirmation.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => returnHeld(true)}>Retry original return</button></div>}
      <fieldset disabled={actionLocked} className="border-0 p-0">
        <div className={`table-responsive ${layout.acceptance}`} tabIndex={0} role="region" aria-label="Delivered quantities and acceptance"><table className={styles.table}><thead><tr><th>Medicine / batch / expiry</th><th>Delivered / accepted / held</th><th>Base-unit cost</th><th>Accept now</th><th>Return held</th></tr></thead><tbody>{lines.map(line => <tr key={line.id}><td><strong>{line.name}</strong><small className="d-block">{line.batchNumber || 'No batch'} / {line.expiryDate?.slice(0, 10) || 'No expiry'} · {line.condition}</small></td><td>{line.quantityDelivered} / {line.acceptedQuantity} / {heldQuantity(line)}<small className="d-block">Returned: {line.returnedQuantity}</small></td><td>{line.unitCost == null ? <input aria-label={`Confirmed base-unit cost ${line.name}`} className={`form-control ${layout.quantity}`} type="number" min="0" step="any" placeholder="Unknown" value={costs[line.id] || ''} onChange={e => setCosts(current => ({ ...current, [line.id]: e.target.value }))}/> : money(line.unitCost)}</td><td><input aria-label={`Accept ${line.name} ${line.batchNumber || line.id}`} className={`form-control ${layout.quantity}`} type="number" min="0" max={heldQuantity(line)} step=".001" disabled={!heldQuantity(line) || line.condition !== 'good'} value={counts[line.id] || '0'} onChange={e => setCounts(current => ({ ...current, [line.id]: e.target.value }))}/></td><td><input aria-label={`Return ${line.name} ${line.batchNumber || line.id}`} className={`form-control ${layout.quantity}`} type="number" min="0" max={heldQuantity(line)} step=".001" disabled={!heldQuantity(line)} value={returnCounts[line.id] || '0'} onChange={e => setReturnCounts(current => ({ ...current, [line.id]: e.target.value }))}/></td></tr>)}</tbody></table></div>
        {access.manager && priceItemIds.length > 1 && <details className={layout.batch}><summary>Apply a retail pricing rule to selected medicines</summary><p>Choose medicines explicitly. Individual rules remain editable. Confirming acceptance applies only previewed prices.</p>{priceItemIds.map(itemId => <label key={itemId} className="d-block"><input type="checkbox" checked={bulkSelected.includes(itemId)} onChange={e => setBulkSelected(current => e.target.checked ? [...current, itemId] : current.filter(id => id !== itemId))}/> {lines.find(line => line.itemId === itemId)?.name}</label>)}<label className="form-label d-block">Retail rule<select className="form-select" value={bulkMethod} onChange={e => setBulkMethod(e.target.value)}>{priceMethods.filter(([id]) => id !== 'keep').map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="form-label d-block">Rule value<input className="form-control" type="number" min="0" step="any" value={bulkValue} onChange={e => setBulkValue(e.target.value)}/></label><button type="button" className="btn btn-outline-primary" disabled={!bulkSelected.some(id => priceItemIds.includes(id)) || !bulkValue.trim()} onClick={applyBulkRule}>Apply rule to selected medicines</button></details>}
        {priceItemIds.map(itemId => <section key={itemId} className={layout.batch}><h3 className="h6">{lines.find(line => line.itemId === itemId)?.name} · selling prices</h3>{sellingPrices(itemId)}</section>)}
        {hasHeldGoods && <details className={layout.batch}><summary>Delivery differences, excess or returns</summary>
        <ProcurementReason value={reason} onChange={setReason} label="Acceptance / return reason (required for exceptions)"/>
        {access.manager && (delivery.details.policy?.mode ?? setup.data?.policy?.mode) !== 'prohibit' && <label className="d-block my-3"><input type="checkbox" checked={excessApproved} onChange={e => setExcessApproved(e.target.checked)}/> As manager, approve acceptance above the outstanding order limit (reason required).</label>}
        {(delivery.details.policy || setup.data?.policy) && <p className={styles.muted}>Delivery excess policy: {delivery.details.policy?.mode ?? setup.data.policy.mode}{(delivery.details.policy?.mode ?? setup.data.policy.mode) === 'tolerance' ? ` (${delivery.details.policy?.tolerancePercent ?? setup.data.policy.tolerancePercent}%)` : ''}. Damaged, expired or unsafe batches cannot be accepted.</p>}
        </details>}
        {guided && priceItemIds.length > 0 && supplierBill}
        {hasHeldGoods && <div className={layout.actions}><button type="button" className="btn btn-primary" disabled={previewing || !lines.some(line => Number(counts[line.id]) > 0) || !!savedBill} onClick={() => accept()}>{guided ? includeInvoice ? 'Save stock & supplier bill' : 'Save stock' : 'Accept selected goods'}</button>{access.manager ? <button type="button" className="btn btn-outline-danger" disabled={!lines.some(line => Number(returnCounts[line.id]) > 0) || !reason.trim()} onClick={() => returnHeld()}>Return selected held goods</button> : <p className={styles.muted}>A manager or administrator must authorize returning held goods.</p>}</div>}
        {savedBill && <div className={layout.summary} role="status"><p>{savedBill.reference}: {money(savedBill.amount)} unpaid. Leave it unpaid to keep it in supplier bills.</p>{onPaySupplier && <button type="button" className="btn btn-primary" onClick={onPaySupplier}>Continue to payment</button>}<button type="button" className="btn btn-outline-secondary ms-2" onClick={onClose}>Pay later</button></div>}
      </fieldset>
      <footer className={styles.footer}><Link href="/pharmacy/inventory/deliveries" className="btn btn-outline-primary">Deliveries &amp; invoices</Link><button className="btn btn-secondary" disabled={busy} onClick={onClose}>Done</button></footer>
    </>}
    {priceDialog && <div onKeyDown={e => e.stopPropagation()}><Modal title={`Change selling prices · ${dialogItem?.name || priceDialog.itemId}`} onClose={() => setPriceDialog(null)}>
      <div className={layout.priceEditor}>
        <p className="mb-0">Current price: retail {money(dialogItem?.retail)} · wholesale {money(dialogItem?.wholesale)}</p>
        <p className={styles.muted}>Prices are per base unit. Changes are saved only when this stock is received, and apply to all batches of this medicine.</p>
        <Message error={error}/>
        <label className="form-check-label"><input type="checkbox" className="form-check-input me-2" checked={priceDialog.enabled} onChange={e => {
          const enabled = e.target.checked;
          setPriceDialog(current => current && ({ ...current, enabled, ...(enabled ? priceDraftChoices(current.draft, { retail: Number(dialogItem?.retail) || 0, wholesale: Number(dialogItem?.wholesale) || 0 }) : { retail: { method: 'keep', value: '' }, wholesale: { method: 'keep', value: '' } }) }));
        }}/>Change prices when this stock is received</label>
        {priceDialog.enabled && <>
          <label className="form-label">How should prices change?<select aria-label={`How should ${dialogItem?.name} prices change?`} className="form-select" value={priceDialog.draft.mode} onChange={e => updatePriceDraft(priceDialog.itemId, { mode: e.target.value })}>{quickPriceModes.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
          {priceDialog.draft.mode === 'manual' ? <div className={layout.priceInputs}>
            <label className="form-label">New retail<input aria-label={`New retail price ${dialogItem?.name}`} className="form-control" type="number" min="0.01" step="0.01" value={priceDialog.draft.retail} onChange={e => updatePriceDraft(priceDialog.itemId, { retail: e.target.value })}/></label>
            <label className="form-label">New wholesale<input aria-label={`New wholesale price ${dialogItem?.name}`} className="form-control" type="number" min="0.01" step="0.01" placeholder="Unchanged" value={priceDialog.draft.wholesale} onChange={e => updatePriceDraft(priceDialog.itemId, { wholesale: e.target.value })}/></label>
          </div> : <label className="form-label">{priceDialog.draft.mode === 'increase_percentage' ? 'Percentage increase' : 'Fixed increase amount (GHS)'}<input aria-label={`${priceDialog.draft.mode === 'increase_percentage' ? 'Percentage increase' : 'Fixed increase amount'} ${dialogItem?.name}`} className="form-control" type="number" min="0" step={priceDialog.draft.mode === 'increase_percentage' ? 'any' : '0.01'} value={priceDialog.draft.value} onChange={e => updatePriceDraft(priceDialog.itemId, { value: e.target.value })}/></label>}
        </>}
        <output className={layout.preview} aria-live="polite">New retail: {shown(priceDialog.retail, Number(dialogItem?.retail) || 0)} · New wholesale: {shown(priceDialog.wholesale, Number(dialogItem?.wholesale) || 0)}{priceDialog.retail.price !== undefined && priceDialog.retail.cost !== undefined && <small className="d-block fw-normal">Profit per unit: {money(priceDialog.retail.price - priceDialog.retail.cost)} ({priceDialog.retail.margin}% margin)</small>}</output>
        <div className={layout.actions}>
          <button type="button" className="btn btn-outline-secondary" onClick={() => setPriceDialog(null)}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={previewing || dialogPending} onClick={() => {
            if (previewing || dialogPending) return;
            const { itemId, draft, retail, wholesale: trade } = priceDialog;
            setPrices(current => ({ ...current, [itemId]: retail }));
            setWholesale(current => ({ ...current, [itemId]: trade }));
            setPriceDrafts(current => ({ ...current, [itemId]: draft }));
            setChangePrices(current => ({ ...current, [itemId]: retail.method !== 'keep' || trade.method !== 'keep' }));
            setPriceDialog(null);
          }}>{previewing ? 'Calculating...' : 'Apply prices'}</button>
        </div>
      </div>
    </Modal></div>}
  </ReceivingFrame>;
}
function ReceivingFrame({ title, presentation, backLabel, onClose, busy, children }: { title: string; presentation: 'page' | 'modal'; backLabel: string; onClose: () => void; busy: boolean; children: ReactNode }) {
  if (presentation === 'modal') return <Modal title={title} size="wide" onClose={onClose} busy={busy}>{children}</Modal>;
  return <main className={`${styles.page} ${layout.page}`}><header className={`${styles.header} ${layout.pageHeader}`}><div><span className={layout.eyebrow}>Inventory / Receiving</span><h1>{title}</h1><p>Check delivered medicines and save them to stock.</p></div><button type="button" className={`btn btn-outline-secondary ${layout.backButton}`} disabled={busy} onClick={onClose}><span aria-hidden="true">&larr;</span>{backLabel}</button></header>{children}</main>;
}
function ProcurementReason({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const options = ['Supplier quantity difference', 'Supplier price difference', 'Damaged goods returned to supplier', 'Expired goods returned to supplier', 'Emergency stock replenishment'];
  const [custom, setCustom] = useState(!!value && !options.includes(value));
  return <div className="mt-3"><label className="form-label d-block">{label}<select className="form-select" value={custom ? 'other' : value} onChange={e => { setCustom(e.target.value === 'other'); onChange(e.target.value === 'other' ? '' : e.target.value); }}><option value="">No exception / routine delivery</option>{options.map(reason => <option key={reason}>{reason}</option>)}<option value="other">Other</option></select></label>{custom && <label className="form-label d-block">Custom audit reason<input required className="form-control" maxLength={1000} value={value} onChange={e => onChange(e.target.value)}/></label>}</div>;
}
