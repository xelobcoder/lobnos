'use client';
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import Select, { type SelectInstance } from 'react-select';
import { reactSelectCustomStyles } from '../../../components/Auth/customFetch';
import { Message, money, styles, usePharmacyResource } from './PharmacyWorkspace';
import layout from './PharmacyPurchaseRequestForm.module.css';
import purchasing from './PharmacyPurchasing.module.css';

type Medicine = { inventoryItemId: string; name: string; unit: string; sku?: string; costPrice?: number };
type Line = Medicine & { quantity: string; unitCost: string };
export type PurchaseRequestInput = {
  schemaVersion: 2; notes: string;
  lines: { itemId: string; quantity: number; unitCost?: number }[];
};
function validLine(quantity: string, cost: string) {
  const count = Number(quantity), price = Number(cost);
  return quantity.trim() !== '' && Number.isFinite(count) && count >= 0.001 && count <= 99999999999.999
    && Number(count.toFixed(3)) === count && (cost.trim() === '' || (Number.isFinite(price) && price >= 0 && Number(price.toFixed(2)) === price));
}
export default function PharmacyPurchaseRequestForm({ locked, onSubmit, onCancel }: {
  suppliers?: { id: string; name: string }[]; locked: boolean;
  onSubmit: (input: PurchaseRequestInput) => Promise<void>; onCancel: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([]), [medicine, setMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState('1'), [cost, setCost] = useState(''), [error, setError] = useState('');
  const [query, setQuery] = useState(''), [search, setSearch] = useState('');
  const picker = useRef<SelectInstance<Medicine, false>>(null), pickerId = useId();
  useEffect(() => { const timer = setTimeout(() => setSearch(query), 200); return () => clearTimeout(timer); }, [query]);
  const catalogue = usePharmacyResource(`pharmacy/catalogue?count=20&search=${encodeURIComponent(search)}`);
  const chooseMedicine = (selected: Medicine | null) => {
    if (!selected) { setMedicine(null); setQuantity('1'); setCost(''); return; }
    const existing = lines.find(line => line.inventoryItemId === selected.inventoryItemId);
    setMedicine(selected); setQuantity(existing?.quantity ?? '1'); setCost(existing?.unitCost ?? ''); setQuery(''); setError('');
  };
  const addItem = () => {
    if (locked) return;
    if (!medicine || !validLine(quantity, cost)) { setError('Choose a medicine and a positive quantity (up to 3 decimal places). An optional estimate must be a non-negative cost (up to 2 decimal places).'); return; }
    const existing = lines.some(line => line.inventoryItemId === medicine.inventoryItemId);
    if (!existing && lines.length >= 100) { setError('A request can contain up to 100 distinct medicines.'); return; }
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
    if (!lines.length || lines.some(line => !validLine(line.quantity, line.unitCost))) { setError('Add at least one medicine and check every quantity and optional estimate.'); return; }
    const form = new FormData(event.currentTarget);
    setError('');
    await onSubmit({ schemaVersion: 2, notes: String(form.get('notes') || ''),
      lines: lines.map(line => ({ itemId: line.inventoryItemId, quantity: Number(line.quantity),
        ...(line.unitCost.trim() === '' ? {} : { unitCost: Number(line.unitCost) }) })) });
  };
  const updating = medicine && lines.some(line => line.inventoryItemId === medicine.inventoryItemId);
  const total = lines.reduce((sum, line) => sum + Math.round(Number(line.quantity) * Number(line.unitCost) * 100) / 100, 0);
  const lineTotal = (line: Line) => line.unitCost.trim() !== '' && validLine(line.quantity, line.unitCost) ? money(Math.round(Number(line.quantity) * Number(line.unitCost) * 100) / 100) : 'Not estimated';
  const step = (number: number, title: string, help: string) => <div className={purchasing.stepHead}><span className={purchasing.stepNumber} aria-hidden="true">{number}</span><div><h3>{title}</h3><p>{help}</p></div></div>;
  return <form className={purchasing.form} onSubmit={submit} aria-label="Purchase request">
    <Message error={error}/>
    <fieldset disabled={locked}>
      <section className={`${purchasing.step} ${layout.entry}`} aria-label="Add medicine to request">
        {step(1, 'Add medicines', 'Search a medicine, enter the quantity needed, then add it. Supplier and agreed prices come after approval.')}
        <Message error={catalogue.error}/>
        <div className={layout.entryRow}>
          <div className={layout.medicine}><label htmlFor={pickerId} className="form-label">Medicine</label><Select<Medicine, false>
            ref={picker} inputId={pickerId} aria-label="Medicine" instanceId={pickerId} styles={reactSelectCustomStyles}
            options={catalogue.data?.items || []} value={medicine} inputValue={query}
            getOptionValue={item => item.inventoryItemId} getOptionLabel={item => `${item.name}${item.sku ? ` - ${item.sku}` : ''}`}
            onChange={chooseMedicine} onInputChange={(value, meta) => { if (meta.action === 'input-change') setQuery(value); }}
            filterOption={null} isLoading={catalogue.loading} isDisabled={locked} isClearable blurInputOnSelect={false}
            noOptionsMessage={() => catalogue.error ? 'Unable to load medicines. Search again to retry.' : 'No matching medicines'}
            placeholder="Search medicine name or SKU"
          /></div>
          <label className="form-label">Quantity{medicine ? ` (${medicine.unit})` : ''}<input className="form-control" aria-label="Quantity to add" type="number" min="0.001" step="0.001" value={quantity} onChange={event => setQuantity(event.target.value)} onKeyDown={addOnEnter}/></label>
          <label className="form-label">Estimate per {medicine?.unit || 'base unit'} (GHS, optional)<input className="form-control" aria-label="Optional estimated unit cost" placeholder="Unknown" type="number" min="0" step="0.01" value={cost} onChange={event => setCost(event.target.value)} onKeyDown={addOnEnter}/></label>
          <button type="button" className="btn btn-primary" disabled={!medicine} onClick={addItem}>{updating ? 'Update item' : 'Add item'}</button>
        </div>
        <p className={styles.muted}>{updating ? 'Already in your request. Update this item without adding a duplicate.' : 'Use base units: 2 boxes of 20 tablets means 40 tablets. Press Add item or Enter to continue.'}</p>
      </section>
      <div className={purchasing.step}>
        <section aria-label="Medicines in request">
          <div className={purchasing.stepHead}><span className={purchasing.stepNumber} aria-hidden="true">2</span><div><h3>Your request ({lines.length} {lines.length === 1 ? 'medicine' : 'medicines'})</h3><p>Check quantities before sending this internal requisition for approval.</p></div></div>
          {!lines.length && <p className={purchasing.emptyBasket}>No medicines added yet. Start with one medicine above.</p>}
          <div className={layout.basket}>{lines.map(line => <div className={layout.requestLine} key={line.inventoryItemId}>
            <div className={layout.medicine}><strong>{line.name}</strong><small className="d-block text-muted">{line.unit}</small></div>
            <label className="form-label">Quantity ({line.unit})<input className="form-control" type="number" min="0.001" step="0.001" required value={line.quantity} onChange={event => editLine(line.inventoryItemId, { quantity: event.target.value })}/></label>
            <label className="form-label">Estimate per {line.unit} (GHS, optional)<input className="form-control" type="number" min="0" step="0.01" placeholder="Unknown" value={line.unitCost} onChange={event => editLine(line.inventoryItemId, { unitCost: event.target.value })}/></label>
            <div className={purchasing.lineTotal}><span>Line total</span><strong>{lineTotal(line)}</strong></div>
            <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Remove ${line.name}`} onClick={() => {
              setLines(current => current.filter(row => row.inventoryItemId !== line.inventoryItemId));
              if (medicine?.inventoryItemId === line.inventoryItemId) setMedicine(null);
            }}>Remove</button>
          </div>)}</div>
          <div className={purchasing.totalBar} role="status"><strong>Estimated total: {lines.length && lines.every(line => line.unitCost.trim() !== '' && validLine(line.quantity, line.unitCost)) && Number.isFinite(total) ? money(total) : 'Not fully estimated'}</strong><span>Blank means unknown, not free. Approval authorizes quantities, not a supplier purchase.</span></div>
        </section>
        <label className="form-label d-block mt-3 mb-0">Reason / notes<input className="form-control mt-1" name="notes" minLength={3} maxLength={500} required placeholder="e.g. Restock for the coming month"/></label>
      </div>
    </fieldset>
    <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary" disabled={locked || !lines.length}>Submit purchase request</button></footer>
  </form>;
}
