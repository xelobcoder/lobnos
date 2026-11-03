'use client';
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import Select, { type SelectInstance } from 'react-select';
import { reactSelectCustomStyles } from '../../../components/Auth/customFetch';
import { Message, money, styles, usePharmacyResource } from './PharmacyWorkspace';
import layout from './PharmacyPurchaseRequestForm.module.css';
import purchasing from './PharmacyPurchasing.module.css';

type Medicine = { inventoryItemId: string; name: string; unit: string; sku?: string; costPrice?: number; availableStock?: number; minimumStock?: number };
type Line = Medicine & { quantity: string; unitCost: string };
const maxLines = 100;
// Suggest enough to reach twice the reorder level, so the medicine is not low again immediately after delivery.
export function suggestedQuantity(item: Pick<Medicine, 'availableStock' | 'minimumStock'>) {
  const stock = Math.max(0, Number(item.availableStock) || 0), reorder = Math.max(0, Number(item.minimumStock) || 0);
  return Math.max(1, Math.ceil(Math.max(1, reorder * 2) - stock));
}
export type PurchaseRequestInput = {
  schemaVersion: 2; notes: string; supplierId?: string; submit?: boolean;
  lines: { itemId: string; quantity: number; unitCost?: number }[];
};
function validLine(quantity: string, cost: string) {
  const count = Number(quantity), price = Number(cost);
  return quantity.trim() !== '' && Number.isFinite(count) && count >= 0.001 && count <= 99999999999.999
    && Number(count.toFixed(3)) === count && (cost.trim() === '' || (Number.isFinite(price) && price >= 0 && Number(price.toFixed(2)) === price));
}
export default function PharmacyPurchaseRequestForm({ locked, onSubmit, onCancel, suppliers = [], mode = 'request', initialOrder }: {
  suppliers?: { id: string; name: string }[]; locked: boolean; mode?: 'request' | 'order';
  initialOrder?: { supplierId: string; notes: string; lines: { itemId: string; name: string; quantity: number; unitCost?: number | null; unit?: string }[] };
  onSubmit: (input: PurchaseRequestInput) => Promise<void>; onCancel: () => void;
}) {
  const [lines, setLines] = useState<Line[]>(() => initialOrder?.lines.map(line => ({ inventoryItemId: line.itemId, name: line.name, unit: line.unit || 'unit', quantity: String(line.quantity), unitCost: line.unitCost == null ? '' : String(line.unitCost) })) || []), [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState('1'), [cost, setCost] = useState(''), [error, setError] = useState('');
  const [query, setQuery] = useState(''), [search, setSearch] = useState('');
  const picker = useRef<SelectInstance<Medicine, false>>(null), pickerId = useId();
  const intent = useRef(true), isOrder = mode === 'order';
  useEffect(() => { const timer = setTimeout(() => setSearch(query), 200); return () => clearTimeout(timer); }, [query]);
  const catalogue = usePharmacyResource(`pharmacy/catalogue?count=20&search=${encodeURIComponent(search)}`);
  const lowStock = usePharmacyResource('pharmacy/stock?filter=low&count=200');
  const suggestions: Medicine[] = lowStock.data?.items || [];
  const unpicked = suggestions.filter(item => !lines.some(line => line.inventoryItemId === item.inventoryItemId));
  const addSuggested = (items: Medicine[]) => {
    if (locked || !items.length) return;
    const room = Math.max(0, maxLines - lines.length), added = items.slice(0, room);
    setLines(current => [...current, ...added.filter(item => !current.some(line => line.inventoryItemId === item.inventoryItemId))
      .map(item => ({ ...item, quantity: String(suggestedQuantity(item)), unitCost: '' }))]);
    setError(added.length < items.length ? `Only ${added.length} more medicines fit; an order can contain up to ${maxLines} medicines.` : '');
  };
  const chooseMedicine = (selected: Medicine | null) => {
    if (!selected) { setMedicine(null); setQuantity('1'); setCost(''); return; }
    const existing = lines.find(line => line.inventoryItemId === selected.inventoryItemId);
    setMedicine(selected); setQuantity(existing?.quantity ?? '1'); setCost(existing?.unitCost ?? ''); setQuery(''); setError('');
  };
  const addItem = () => {
    if (locked) return;
    if (!medicine || !validLine(quantity, cost)) { setError('Choose a medicine and a positive quantity (up to 3 decimal places). An optional estimate must be a non-negative cost (up to 2 decimal places).'); return; }
    const existing = lines.some(line => line.inventoryItemId === medicine.inventoryItemId);
    if (!existing && lines.length >= maxLines) { setError('A request can contain up to 100 distinct medicines.'); return; }
    const line = { ...medicine, quantity, unitCost: cost };
    setLines(current => existing ? current.map(row => row.inventoryItemId === medicine.inventoryItemId ? line : row) : [...current, line]);
    setMedicine(null); setQuantity('1'); setCost(''); setQuery(''); setError('');
    picker.current?.focus();
  };
  const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); addItem(); }
  };
  const editLine = (id: string, patch: Partial<Pick<Line, 'quantity' | 'unitCost'>>) => {
    setLines(current => current.map(line => line.inventoryItemId === id ? { ...line, ...patch } : line));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked) return;
    if (medicine) { setError('Select Add item (or Update item) before submitting so this medicine is included.'); return; }
    if (!lines.length || lines.some(line => !validLine(line.quantity, line.unitCost))) { setError('Add at least one medicine and check every quantity.'); return; }
    const form = new FormData(event.currentTarget);
    setError('');
    await onSubmit({ schemaVersion: 2, notes: String(form.get('notes') || (isOrder ? '' : form.get('reason') || 'Routine stock replenishment')),
      ...(isOrder ? { supplierId: String(form.get('supplierId') || ''), submit: intent.current } : {}),
      lines: lines.map(line => ({ itemId: line.inventoryItemId, quantity: Number(line.quantity),
        ...(line.unitCost.trim() === '' ? {} : { unitCost: Number(line.unitCost) }) })) });
  };
  const updating = medicine && lines.some(line => line.inventoryItemId === medicine.inventoryItemId);
  const total = lines.reduce((sum, line) => sum + Math.round(Number(line.quantity) * Number(line.unitCost) * 100) / 100, 0);
  const lineTotal = (line: Line) => line.unitCost.trim() !== '' && validLine(line.quantity, line.unitCost) ? money(Math.round(Number(line.quantity) * Number(line.unitCost) * 100) / 100) : 'Not estimated';
  const step = (number: number, title: string, help: string) => <div className={purchasing.stepHead}><span className={purchasing.stepNumber} aria-hidden="true">{number}</span><div><h3>{title}</h3><p>{help}</p></div></div>;
  return <form className={purchasing.form} onSubmit={submit} aria-label={isOrder ? 'Purchase order' : 'Purchase request'}>
    <Message error={error}/>
    <fieldset disabled={locked}>
      {isOrder && <label className="form-label d-block">Supplier<select required name="supplierId" className="form-select" defaultValue={initialOrder?.supplierId || ''}><option value="">Choose one supplier</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>}
      <section className={purchasing.step} aria-label="Medicines needing restock">
        <div className={layout.quickHead}>
          <div><h3>Needs restocking</h3><p className={styles.muted}>Medicines at or below their reorder level. Add them in one tap; you can change any quantity below.</p></div>
          <button type="button" className="btn btn-outline-primary" disabled={locked || !unpicked.length} onClick={() => addSuggested(unpicked)}>{`Add all suggested (${unpicked.length})`}</button>
        </div>
        {lowStock.loading && !lowStock.data ? <p className={styles.muted}>Checking stock levels…</p>
          : lowStock.error ? <p className={styles.muted}>Stock levels are unavailable right now. Search for medicines below.</p>
          : !suggestions.length ? <p className={styles.muted}>No medicine is below its reorder level. Search for medicines below.</p>
          : <ul className={layout.quickList}>{suggestions.map(item => {
            const picked = lines.some(line => line.inventoryItemId === item.inventoryItemId);
            return <li key={item.inventoryItemId} className={layout.quickRow}>
              <span className={layout.medicine}><strong>{item.name}</strong><small className="d-block text-muted">In stock {Number(item.availableStock) || 0} · reorder at {Number(item.minimumStock) || 0} {item.unit}</small></span>
              <span>Suggested <strong>{suggestedQuantity(item)}</strong></span>
              {picked ? <span className={styles.muted}>Added</span>
                : <button type="button" className="btn btn-sm btn-primary" aria-label={`Add ${item.name}`} disabled={locked} onClick={() => addSuggested([item])}>Add</button>}
            </li>;
          })}</ul>}
      </section>
      <section className={`${purchasing.step} ${layout.entry}`} aria-label="Add medicine to request">
        {step(1, 'Add medicines', isOrder ? 'Choose a medicine, enter the quantity needed and add it. Enter actual buying costs only when the goods arrive.' : 'Search a medicine, enter the quantity needed, then add it. Supplier and agreed prices come after approval.')}
        <Message error={catalogue.error}/>
        <div className={`${layout.entryRow} ${isOrder ? layout.quantityOnly : ''}`}>
          <div className={layout.medicine}><label htmlFor={pickerId} className="form-label">Medicine</label><Select<Medicine, false>
            ref={picker} inputId={pickerId} aria-label="Medicine" instanceId={pickerId} styles={reactSelectCustomStyles}
            options={catalogue.data?.items || []} value={medicine} inputValue={query}
            getOptionValue={item => item.inventoryItemId} getOptionLabel={item => `${item.name}${item.sku ? ` - ${item.sku}` : ''}${item.availableStock === undefined ? '' : ` · ${item.availableStock} in stock`}`}
            onChange={chooseMedicine} onInputChange={(value, meta) => { if (meta.action === 'input-change') setQuery(value); }}
            filterOption={null} isLoading={catalogue.loading} isDisabled={locked} isClearable blurInputOnSelect={false}
            noOptionsMessage={() => catalogue.error ? 'Unable to load medicines. Search again to retry.' : 'No matching medicines'}
            placeholder="Search medicine name or SKU"
          /></div>
          <label className="form-label">Quantity{medicine ? ` (${medicine.unit})` : ''}<input className="form-control" aria-label="Quantity to add" type="number" min="0.001" step="0.001" value={quantity} onChange={event => setQuantity(event.target.value)} onKeyDown={addOnEnter}/></label>
          {!isOrder && <label className="form-label">Estimate per {medicine?.unit || 'base unit'} (GHS, optional)<input className="form-control" aria-label="Optional estimated unit cost" placeholder="Unknown" type="number" min="0" step="0.01" value={cost} onChange={event => setCost(event.target.value)} onKeyDown={addOnEnter}/></label>}
          <button type="button" className="btn btn-primary" disabled={!medicine} onClick={addItem}>{updating ? 'Update item' : 'Add item'}</button>
        </div>
        <p className={styles.muted}>{updating ? 'Already in your request. Update this item without adding a duplicate.' : 'Use base units: 2 boxes of 20 tablets means 40 tablets. Press Add item or Enter to continue.'}</p>
      </section>
      <div className={purchasing.step}>
        <section aria-label="Medicines in request">
          <div className={purchasing.stepHead}><span className={purchasing.stepNumber} aria-hidden="true">2</span><div><h3>Your {isOrder ? 'order' : 'request'} ({lines.length} {lines.length === 1 ? 'medicine' : 'medicines'})</h3><p>{isOrder ? 'All medicines belong to one purchase order and supplier.' : 'Check quantities before sending this internal requisition for approval.'}</p></div></div>
          {!lines.length && <p className={purchasing.emptyBasket}>No medicines added yet. Start with one medicine above.</p>}
          <div className={layout.basket}>{lines.map(line => <div className={`${layout.requestLine} ${isOrder ? layout.quantityOnly : ''}`} key={line.inventoryItemId}>
            <div className={layout.medicine}><strong>{line.name}</strong><small className="d-block text-muted">{line.unit}</small></div>
            <label className="form-label">Quantity ({line.unit})<input className="form-control" type="number" min="0.001" step="0.001" required value={line.quantity} onChange={event => editLine(line.inventoryItemId, { quantity: event.target.value })}/></label>
            {!isOrder && <><label className="form-label">Estimate per {line.unit} (GHS, optional)<input className="form-control" type="number" min="0" step="0.01" placeholder="Unknown" value={line.unitCost} onChange={event => editLine(line.inventoryItemId, { unitCost: event.target.value })}/></label>
            <div className={purchasing.lineTotal}><span>Line total</span><strong>{lineTotal(line)}</strong></div></>}
            <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Remove ${line.name}`} onClick={() => {
              setLines(current => current.filter(row => row.inventoryItemId !== line.inventoryItemId));
              if (medicine?.inventoryItemId === line.inventoryItemId) setMedicine(null);
            }}>Remove</button>
          </div>)}</div>
          <div className={purchasing.totalBar} role="status">{!isOrder && <strong>Estimated total: {lines.length && lines.every(line => line.unitCost.trim() !== '' && validLine(line.quantity, line.unitCost)) && Number.isFinite(total) ? money(total) : 'Not fully estimated'}</strong>}<span>{isOrder ? 'No price is required to order. After approval, send the order to your supplier. Buying costs and selling-price decisions belong to receiving.' : 'Blank means unknown, not free. Approval authorizes quantities, not a supplier purchase.'}</span></div>
        </section>
        {!isOrder && <label className="form-label d-block mt-3">Purchase reason<select name="reason" className="form-select"><option>Routine stock replenishment</option><option>Low stock</option><option>Emergency purchase</option><option>Increased demand</option><option>Replacement of expired stock</option></select></label>}
        <label className="form-label d-block mt-3 mb-0">Notes (optional)<input className="form-control mt-1" name="notes" defaultValue={initialOrder?.notes || ''} maxLength={500} placeholder="Additional purchasing information"/></label>
      </div>
    </fieldset>
    <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={onCancel}>Cancel</button>{isOrder && <button type="submit" className="btn btn-outline-primary" disabled={locked || !lines.length} onClick={() => { intent.current = false; }}>Save draft</button>}<button type="submit" className="btn btn-primary" disabled={locked || !lines.length} onClick={() => { intent.current = true; }}>{isOrder ? 'Submit for approval' : 'Submit purchase request'}</button></footer>
  </form>;
}
