'use client';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import { currencyFormatter, customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import styles from './PharmacyWorkspace.module.css';
export { styles };
export const money = (value: unknown) => value==null||value===''||!Number.isFinite(Number(value))?'—':currencyFormatter.format(Number(value));
export const dateLabel = (value: string) => value ? new Date(value).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Accra' }) : 'Not recorded';
export function usePharmacyAccess() {
     const app = useApplication() as any;
     const role = String(app?.user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
     const manager = ['admin', 'superadmin', 'pharmacymanager'].includes(role);
     return { app, manager, administrator: ['admin', 'superadmin'].includes(role), finance: manager || role === 'pharmacyaccountant', stock: manager || role === 'pharmacystorekeeper', selling: manager || ['pharmacycashier', 'pharmacydispensaryofficer', 'pharmacist'].includes(role) };
}
export function usePharmacyResource(endpoint: string) {
     const [data, setData] = useState<any>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
     const generation = useRef(0);
     const refresh = useCallback(async () => {
          const request = ++generation.current; setLoading(true); setError('');
          try { const response = await customFetch(endpoint); if (!response?.success) throw new Error(response?.error?.message || 'Unable to load this pharmacy page.'); if (request === generation.current) setData(response.data); }
          catch (e) { if (request === generation.current) setError(e instanceof Error ? e.message : 'Unable to load this page.'); }
          finally { if (request === generation.current) setLoading(false); }
     }, [endpoint]);
     useEffect(() => { refresh(); return () => { generation.current++; }; }, [refresh]);
     return { data, loading, error, refresh };
}
export function Message({ error, notice }: { error?: string; notice?: string }) {
     return <>{error && <div className="alert alert-danger" role="alert">{error}</div>}{notice && <div className="alert alert-success" role="status">{notice}</div>}</>;
}
export function Empty({ children }: { children: React.ReactNode }) { return <div className={styles.empty}>{children}</div>; }
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
     return <nav className={styles.tabs} aria-label="Pharmacy tasks">{tabs.map(tab => <button type="button" key={tab.id} aria-current={active === tab.id ? 'page' : undefined} className={`${styles.tab} ${active === tab.id ? styles.activeTab : ''}`} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</nav>;
}
export function Modal({ title, onClose, children, busy = false }: { title: string; onClose: () => void; children: React.ReactNode; busy?: boolean }) {
     const dialog = useRef<HTMLDivElement>(null), titleId = useId();
     useEffect(() => {
          const previous = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          dialog.current?.querySelector<HTMLElement>('input,select,button,textarea')?.focus();
          return () => { document.body.style.overflow = overflow; previous?.focus(); };
     }, []);
     return <div className={styles.overlay} onKeyDown={event => {
          if (event.key === 'Escape' && !busy) onClose();
          if (event.key === 'Tab') {
               const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]') || []);
               const first = controls[0], last = controls[controls.length - 1];
               if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
               else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
     }}><div ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}><div className={styles.dialogHeader}><h2 id={titleId}>{title}</h2><button type="button" className="btn-close" disabled={busy} aria-label="Close dialog" onClick={onClose} /></div>{children}</div></div>;
}
export function MedicinePicker({ onSelect }: { onSelect: (medicine: any) => void }) {
     const [query, setQuery] = useState(''), [search, setSearch] = useState('');
     useEffect(() => { const timer = setTimeout(() => setSearch(query), 200); return () => clearTimeout(timer); }, [query]);
     const resource = usePharmacyResource(`pharmacy/catalogue?count=20&search=${encodeURIComponent(search)}`);
     return <div><label className="form-label d-block">Find medicine<input className="form-control" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by medicine name or SKU" /></label><Message error={resource.error} />{resource.loading ? <p className={styles.muted}>Searching medicines...</p> : <div className="list-group mb-3" style={{ maxHeight: 220, overflow: 'auto' }}>{resource.data?.items?.map((m: any) => <button type="button" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" key={m.inventoryItemId} onClick={() => onSelect(m)}><span>{m.name}<small className="d-block text-muted">{m.sku}</small></span><small>{m.availableStock} {m.unit}</small></button>)}{!resource.data?.items?.length && <Empty>No matching medicines. Add the medicine first.</Empty>}</div>}</div>;
}
export function FinancialDayPanel({ setup, canManage, onChange, onReviewPrevious, onReviewBeforeClose, closeBlockedReason }: { setup: any; canManage: boolean; onChange: () => Promise<unknown>; onReviewPrevious?: () => void; onReviewBeforeClose?: () => void; closeBlockedReason?: string }) {
     const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [note, setNote] = useState('');
     const day = setup?.day, open = day?.status === 'open', previous = setup?.previousDay || setup?.previousShift;
     const act = async () => {
          if (busy || (!open && previous) || (open && closeBlockedReason)) return;
          if (open && !window.confirm('Close this pharmacy financial day? Cashier shifts must be closed and reviewed.')) return;
          setBusy(true); setError(''); setNotice('');
          try {
               const r = await customFetchMutation(open ? 'pharmacy/management/close-day' : 'pharmacy/management/open-day', 'POST', { date: setup.financialDate, note });
               if (!r?.success) throw new Error(r?.error?.message || 'Unable to change the financial day.');
               setNotice(open ? 'Financial day closed.' : 'Financial day opened. Cashiers can now open their shifts.'); await onChange();
          } catch (e) { setError(e instanceof Error ? e.message : 'Unable to change the financial day.'); await onChange(); } finally { setBusy(false); }
     };
     if (!setup) return null;
     return <section className={styles.card}><Message error={error} notice={notice} />{previous && <div className="alert alert-warning"><strong>Finish the previous financial day: {dateLabel(previous.financial_date)}</strong><p className="mb-2">Close its cashier shifts with the physical cash count, have another authorized manager review the handovers, then close the day before opening today.</p>{canManage ? onReviewPrevious ? <button type="button" className="btn btn-outline-dark" onClick={onReviewPrevious}>Review previous day &amp; shifts</button> : <Link className="btn btn-outline-dark" href="/pharmacy/finance#days">Review previous day &amp; shifts</Link> : <span>Ask a pharmacy manager or accountant to review the previous day.</span>}</div>}<div className={styles.day}><div><h2>Financial day <span className={`fw-semibold ${open ? 'text-success' : day ? 'text-secondary' : 'text-warning'}`}>{open ? 'Open' : day ? 'Closed' : 'Not opened'}</span></h2><div>{dateLabel(setup.financialDate)}</div><div className={styles.muted}>{open ? 'Open a cashier shift before making sales. Stock receipts and payments post to this day.' : day ? 'This date is closed. Open the next financial day, or have a pharmacy manager or administrator reopen this date with a recorded reason from Pharmacy Cash & Financial Days.' : 'A pharmacy manager or accountant must open the day before stock receipts, payments or sales.'}</div></div>{canManage && day?.status !== 'closed' && <div className={styles.actions}>{!open && <input aria-label="Opening note" className="form-control" style={{ width: 230 }} maxLength={500} placeholder="Opening note (optional)" value={note} onChange={e => setNote(e.target.value)} />}<button className={`btn ${open ? 'btn-outline-secondary' : 'btn-primary'}`} disabled={busy || (!open && !!previous) || (open && !onReviewBeforeClose && !!closeBlockedReason)} onClick={open && onReviewBeforeClose ? onReviewBeforeClose : act}>{busy ? 'Saving...' : open ? onReviewBeforeClose ? 'Review before closing' : 'Close financial day' : 'Open financial day'}</button></div>}</div>{canManage && open && closeBlockedReason && <p className="mt-2 mb-0">{closeBlockedReason}</p>}{canManage && open && !onReviewBeforeClose && <div className="mt-2">{onReviewPrevious ? <button type="button" className="btn btn-link p-0" onClick={onReviewPrevious}>Review shifts and financial-day history</button> : <Link href="/pharmacy/finance#days">Review shifts and financial-day history</Link>}</div>}</section>;
}
