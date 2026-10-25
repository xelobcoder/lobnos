'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiSearchLine, RiDeleteBinLine, RiPauseCircleLine, RiPrinterLine } from '@remixicon/react';
import { MultiBillingContext } from '../Multi/MultiBillingContext';
import ModernPayment from './ModernPayment';
import ModernReceipt from './ModernReceipt';
import { customFetch, customPost, currencyFormatter } from '../../Auth/customFetch';
import { useApplication } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';
import { saveSuspendedBilling } from '../../../lib/Multi/suspendedBilling';
import type { MultiBillingData } from '../../../lib/Multi/MultiTypes';
import { catalogueKey, draftFromBilling, filterCatalogue, itemId, itemKey, itemName, mergePreview, previewRequest, reviewKey, selectionIssue, type ModernDraft, type SelectedItem, type SelectionKind } from './modernBilling';
import styles from './ModernWorkflow.module.css';

type Props = {
    controls: React.ReactNode; source: React.ReactNode; history: React.ReactNode;
    loading: boolean; ready: boolean; saved?: string | number; promptActive?:boolean;
    draft: ModernDraft | null; setDraft: React.Dispatch<React.SetStateAction<ModernDraft | null>>;
    layoutGuardRef: React.MutableRefObject<(() => Promise<boolean>) | null>;
    onContinue: () => void; onSubmit: (data: MultiBillingData) => Promise<any>;
};

function ItemOptions({ item, canAdjust, onChange }: { item: SelectedItem; canAdjust: boolean; onChange: (changes: any) => void }) {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const outsourced = item.kind === 'test' && Number(item.row.isoutsourced) === 1;
    const organizationId = item.row.organization?.outsourceid || item.row.outsourceid || '';
    useEffect(() => {
        if (!outsourced) return;
        let active = true;
        setLoading(true); setError('');
        customFetch(`outsourcing/organization/testpanel/outsourceinfo?testid=${item.id}`).then((response: any) => {
            if (!active) return;
            if (!Array.isArray(response)) throw new Error('Unable to load organizations');
            setOrganizations(response);
            if (response.length === 1 && !organizationId) onChange({ organization: response[0], outsourceid: response[0].outsourceid });
        }).catch(() => { if (active) setError('Organizations could not be loaded. Billing can continue without an assignment.'); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [item.id, outsourced, attempt]);
    const fieldId = 'modern-option-' + itemKey(item);
    return <div className={styles.itemOptions}>
        {outsourced && <div className={styles.organizationField}>
            <label htmlFor={fieldId + '-organization'}>Outsourcing organization <span>Optional</span></label>
            {error ? <div role="alert">{error} <button type="button" onClick={() => setAttempt(attempt + 1)}>Retry</button></div> : <select id={fieldId + '-organization'} disabled={loading} value={organizationId} onChange={event => {
                const organization = organizations.find(row => String(row.outsourceid) === event.target.value);
                onChange({ organization: organization || undefined, outsourceid: organization?.outsourceid || null });
            }}><option value="">{loading ? 'Loading organizations…' : 'No organization selected'}</option>{organizationId && !loading && !organizations.some(row => String(row.outsourceid) === String(organizationId)) && <option value={organizationId} disabled>Previous organization unavailable</option>}{organizations.map(row => <option key={row.outsourceid} value={row.outsourceid}>{row.name}</option>)}</select>}
            {!loading&&!error&&!organizations.length&&<p className={styles.helper}>No organizations configured. Billing can continue without an assignment.</p>}
            <button type="button" className={styles.backLink} disabled={loading} onClick={()=>setAttempt(value=>value+1)}>Refresh organizations</button>
        </div>}
        <details className={styles.optionsDisclosure}><summary>Item options{item.row.userAdjustmentType ? ' · ' + item.row.userAdjustmentType : ''}{item.row.prioritised ? ' · Urgent' : ''}</summary>
            <div className={styles.optionsGrid}>
                <label htmlFor={fieldId + '-adjustment'}>Price adjustment<select id={fieldId + '-adjustment'} disabled={!canAdjust} value={item.row.userAdjustmentType || ''} onChange={event => onChange({ userAdjustmentType: event.target.value || null, userAdjustedValue: 0 })}><option value="">Normal pricing</option><option value="discount">Discount</option><option value="surcharge">Surcharge</option></select></label>
                {item.row.userAdjustmentType && <label htmlFor={fieldId + '-value'}>Adjustment value<input id={fieldId + '-value'} type="number" min="0" step="0.01" value={item.row.userAdjustedValue ?? 0} disabled={!canAdjust} onChange={event => onChange({ userAdjustedValue: Math.max(0, Number(event.target.value) || 0) })}/></label>}
                <label className={styles.check}><input type="checkbox" checked={Boolean(item.row.prioritised)} onChange={event => onChange({ prioritised: event.target.checked })}/> Urgent</label>
            </div>
        </details>
    </div>;
}

export default function ModernBillingWorkspace({ controls, source, history, loading, ready, saved, promptActive=false, draft: suppliedDraft, setDraft, layoutGuardRef, onContinue, onSubmit }: Props) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error('Billing context is required');
    const { billingdata: data, setBillingData } = context;
    const application = useApplication();
    const canAdjust = roleAllowed(application?.user?.role, ['admin', 'manager']) || Number(application?.settings?.AllowCrmToGiveDisocunt) === 1;
    const router = useRouter();
    const draft = suppliedDraft || draftFromBilling(data);
    const [step, setStep] = useState<1 | 2 | 3 | 4>(ready && data.testList?.length ? 2 : 1);
    const [query, setQuery] = useState('');
    const [kind, setKind] = useState<'all' | SelectionKind>('all');
    const [active, setActive] = useState(0);
    const [limit, setLimit] = useState(40);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [confirmClear,setConfirmClear]=useState(false);
    const [suspendNote, setSuspendNote] = useState(data.suspendNote || '');
    const searchRef = useRef<HTMLInputElement>(null);
    const reviewButton = useRef<HTMLButtonElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    const inFlight = useRef(false);
    const mounted = useRef(true);
    const catalogueStamp=useRef({tests:data.testList,services:data.servicesList,key:catalogueKey(data)});
    if(catalogueStamp.current.tests!==data.testList||catalogueStamp.current.services!==data.servicesList) catalogueStamp.current={tests:data.testList,services:data.servicesList,key:catalogueKey(data)};
    const catalogueCurrent=catalogueStamp.current.key===catalogueKey(data);
    const currentKey = reviewKey(data, draft);
    const latestKey = useRef(currentKey); latestKey.current = currentKey;
    const reviewed = Boolean(draft.reviewedKey && draft.reviewedKey === currentKey);
    const selected = new Set(draft.items.map(itemKey));
    const catalog: SelectedItem[] = [
        ...(!data.isPackageUsed ? (data.testList || []).map(row => ({ kind: 'test' as const, id: itemId('test', row), row })) : []),
        ...(data.includeServices ? (data.servicesList || []).map(row => ({ kind: 'service' as const, id: itemId('service', row), row })) : []),
    ];
    const filtered = filterCatalogue(catalog, query, kind);
    const visible = filtered.slice(0, limit);
    const payer = ({ 1: 'General / private', 2: 'Organization', 3: 'Insurance', 4: 'NHIS', 6: 'Clinician referral' } as Record<number, string>)[Number(data.billingSource)] || 'Choose payer';
    const isPrevious = (item: SelectedItem) => !data.billingid && (data.previousRecords || []).some((row: any) => Number(row.trackId) === item.id && Number(row.categoryTrackId) === (item.kind === 'test' ? 1 : 5));

    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    useEffect(() => { if (step === 2 && !suspendOpen && !busy) searchRef.current?.focus(); }, [step, suspendOpen, busy]);
    useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
    useEffect(() => { setActive(0); setLimit(40); }, [query, kind]);
    useEffect(() => { document.getElementById('modern-result-' + active)?.scrollIntoView({ block: 'nearest' }); }, [active]);
    const change = (items: SelectedItem[]) => { setDraft({ items }); setError(''); };
    const toggle = (item: SelectedItem) => {
        if (busy || isPrevious(item)) return;
        const exists = selected.has(itemKey(item));
        if (exists && data.isPackageUsed && item.kind === 'test') return;
        change(exists ? draft.items.filter(row => itemKey(row) !== itemKey(item)) : [...draft.items, { ...item, row: { ...item.row } }]);
        setNotice(itemName(item) + (exists ? ' removed.' : ' selected.'));
    };
    const updateOptions = (item: SelectedItem, changes: any) => { setDraft(previous => ({ items: (previous || draftFromBilling(data)).items.map(row => itemKey(row) === itemKey(item) ? { ...row, row: { ...row.row, ...changes } } : row) })); setError(''); };
    const review = async (): Promise<boolean> => {
        if (inFlight.current) return false;
        if (!ready || !catalogueCurrent) { setStep(1); setError('Complete billing setup and load the current catalogue first.'); return false; }
        const issue = selectionIssue(data, draft);
        if (issue) { setStep(2); setError(issue); return false; }
        if (reviewed) { setStep(3); return true; }
        const snapshot = currentKey;
        inFlight.current = true; setBusy(true); setError('');
        try {
            const response = await customPost('billing/modern/preview', 'POST', previewRequest(data, draft));
            if (!response?.success || !response.data) throw new Error(response?.message || 'The bill could not be reviewed. Your selections have been kept.');
            if (!mounted.current || latestKey.current !== snapshot) return false;
            const merged = mergePreview(data, response.data);
            const next = draftFromBilling(merged);
            next.reviewedKey = reviewKey(merged, next); next.reviewedAt = response.data.reviewedAt;
            setBillingData(merged); setDraft(next); setStep(3);
            setNotice('Charges reviewed. Ready for payment.');
            return true;
        } catch (failure) {
            if (mounted.current) setError(failure instanceof Error ? failure.message : 'Unable to review this bill. Please retry.');
            return false;
        } finally { inFlight.current = false; if (mounted.current) setBusy(false); }
    };
    useEffect(() => {
        layoutGuardRef.current = async () => {
            if (inFlight.current) return false;
            if (!suppliedDraft || reviewed || !draft.items.length) return true;
            setNotice('Reviewing your selections before switching layouts…');
            return review();
        };
        return () => { layoutGuardRef.current = null; };
    });
    useEffect(() => {
        const shortcut = (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey || suspendOpen || promptActive || document.querySelector('.modal.show,[role="dialog"][aria-modal="true"]')) return;
            if (event.key === 'F2') { event.preventDefault(); if (!busy) { setStep(2); searchRef.current?.focus(); } }
            if (event.key === 'F4') { event.preventDefault(); if (step === 2) void review(); else if (step === 3) reviewButton.current?.focus(); }
        };
        document.addEventListener('keydown', shortcut); return () => document.removeEventListener('keydown', shortcut);
    });
    const suspend = async () => {
        if (inFlight.current) return;
        inFlight.current = true; setBusy(true); setError('');
        try {
            await saveSuspendedBilling({ ...data, cart: draft.items.filter(item => item.kind === 'test').map(item => item.row), servicesProvided: draft.items.filter(item => item.kind === 'service').map(item => item.row) }, suspendNote);
            router.push('/billing/suspended-transactions');
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to suspend this bill'); }
        finally { inFlight.current = false; if (mounted.current) setBusy(false); }
    };
    const nextFromSetup = () => {
        if (!ready || !catalogueCurrent || (!data.testList?.length && !data.servicesList?.length)) { setError('Complete payer details and load the catalogue to continue.'); return; }
        setStep(2); setError('');
    };
    const beginPayment = () => { if (reviewed && !busy) { setStep(4); setError(''); } };
    const countLabel = draft.items.length + ' item' + (draft.items.length === 1 ? '' : 's');

    if (saved) return <div className={styles.workspace}>
        <header className={styles.savedHeader}><span className={styles.completeIcon}><RiCheckLine size={24}/></span><div><h1>Bill #{saved} is saved</h1><p>Receipt and printing are available below.</p></div><button type="button" className={styles.secondary} onClick={()=>router.push('/crm/customers')}>Return to patients</button></header>
        <div id="modern-workflow-prompts" hidden={!promptActive} className={styles.promptHost}/>
        {!promptActive&&<div className={styles.savedContent}><ModernReceipt billingId={Number(saved)}/></div>}
    </div>;

    return <div className={styles.workspace}>
        <section className={styles.transactionOptions} aria-label="Transaction options"><strong>Transaction options</strong><fieldset className={styles.fieldset} disabled={busy||promptActive||step===4}>{controls}</fieldset></section>
        <header className={styles.heading}><div><p className={styles.eyebrow}>MULTI-LAYOUT-TWO</p><h1>{data.ispricingcheckout ? 'Build a quotation' : data.isAdjustment ? 'Review a billing adjustment' : 'Create a patient bill'}</h1><p>{payer}{data.entityname ? ' · ' + data.entityname : ''}{data.suspendedDraftId ? ' · Resumed draft #' + data.suspendedDraftId : ''}</p></div><button type="button" className={styles.secondary} disabled={busy || !draft.items.length || Boolean(data.isAdjustment)} onClick={() => setSuspendOpen(true)}><RiPauseCircleLine size={17}/> Suspend</button></header>
        <nav className={styles.steps} aria-label="Billing progress">{(['Billing setup', 'Select items', 'Review charges', 'Payment'] as const).map((label, index) => <button key={label} type="button" aria-current={step === index + 1 ? 'step' : undefined} disabled={busy || index >= 2 && !draft.items.length || index === 3 && !reviewed} onClick={() => index === 2 ? void review() : index === 3 ? beginPayment() : (setError(''), setStep((index + 1) as 1 | 2))}><span>{step > index + 1 ? <RiCheckLine size={15}/> : index + 1}</span>{label}</button>)}</nav>
        {error && <div className={styles.error} role="alert" tabIndex={-1} ref={errorRef}>{error}<button type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
        <span className="visually-hidden" role="status" aria-live="polite">{notice}</span>

        <main className={styles.stepArea}>
        <div id="modern-workflow-prompts" hidden={!promptActive} className={styles.promptHost}/>
        {suspendOpen&&<section className={styles.suspendPanel} aria-labelledby="modern-suspend-title"><h2 id="modern-suspend-title">{data.ispricingcheckout?'Save quotation':'Suspend this bill'}</h2><p>Your selected items and options will be kept for later. No payment is recorded.</p><label htmlFor="modern-suspend-note">Note (optional)<textarea autoFocus id="modern-suspend-note" rows={3} value={suspendNote} onChange={event=>setSuspendNote(event.target.value)}/></label><div className={styles.completeActions}><button type="button" className={styles.secondary} disabled={busy} onClick={()=>setSuspendOpen(false)}>Cancel</button><button type="button" className={styles.primary} disabled={busy} onClick={()=>void suspend()}>{busy?'Saving…':data.ispricingcheckout?'Save quotation':'Suspend bill'}</button></div></section>}
        <div hidden={promptActive||suspendOpen} className={styles.stepPages}>
        {step === 1 && <section className={styles.setup}>
            <div className={styles.sectionHeading}><span className={styles.stepLabel}>01 / BILLING SETUP</span><h2>Confirm who is paying</h2><p>Set the payer, referrals and any package before selecting the requested items.</p></div>
            <div className={styles.setupFields}>{source}</div>
            <div className={styles.sectionFooter}><span>{ready && data.testList?.length ? 'Catalogue loaded for this payer' : 'Complete the required details, then start the transaction'}</span><button type="button" className={styles.primary} disabled={loading} onClick={nextFromSetup}>Choose tests & services <RiArrowRightLine size={17}/></button></div>
        </section>}

        {step === 2 && <div className={styles.selectionGrid}>
            <section className={styles.catalogue} aria-label="Test and service catalogue"><div className={styles.sectionHeading}><span className={styles.stepLabel}>02 / SELECT ITEMS</span><h2>{data.isPackageUsed ? 'Add services to your package' : 'Find the requested tests'}</h2><p>Select multiple items. Charges are confirmed together when you review.</p></div>
                <div className={styles.search}><RiSearchLine size={20}/><input id="modern-catalogue-search" ref={searchRef} type="search" value={query} placeholder="Search by name or code" aria-label="Search tests and services" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="modern-catalogue-results" aria-activedescendant={visible[active] ? 'modern-result-' + active : undefined} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
                    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(Math.min(active + 1, visible.length - 1)); }
                    if (event.key === 'ArrowUp') { event.preventDefault(); setActive(Math.max(active - 1, 0)); }
                    if (event.key === 'Enter') { event.preventDefault(); if (event.ctrlKey) void review(); else if (visible[active]) toggle(visible[active]); }
                    if (event.key === 'Escape') setQuery('');
                }}/><kbd>F2</kbd></div>
                <div className={styles.catalogueTools}><div role="group" aria-label="Catalogue type">{(['all', 'test', 'service'] as const).map(value => <button type="button" key={value} aria-pressed={kind === value} onClick={() => setKind(value)}>{value === 'all' ? 'All items' : value === 'test' ? 'Tests' : 'Services'}</button>)}</div><span>{filtered.length} available</span></div>
                <fieldset disabled={busy} className={styles.fieldset}><div className={styles.results} id="modern-catalogue-results" role="listbox" aria-label="Available items" aria-multiselectable="true">{visible.map((item, index) => {
                    const checked = selected.has(itemKey(item)); const previouslyBilled = isPrevious(item);
                    return <button type="button" id={'modern-result-' + index} key={itemKey(item)} role="option" aria-selected={checked} aria-disabled={previouslyBilled} className={[styles.result, checked ? styles.selected : '', index === active ? styles.active : ''].join(' ')} onClick={() => { setActive(index); toggle(item); }}><span className={styles.selectionMark}>{checked && <RiCheckLine size={15}/>}</span><span className={styles.resultName}><strong>{itemName(item)}</strong><small>{previouslyBilled ? 'Already billed' : item.kind === 'service' ? 'Additional service' : Number(item.row.isoutsourced) === 1 ? 'Outsourced test · Organization optional' : 'Laboratory test'}</small></span><span className={styles.cataloguePrice}><strong>{currencyFormatter.format(Number(item.row.discountedValue ?? item.row.servicePrice ?? item.row.price ?? 0))}</strong><small>Catalogue price</small></span></button>;
                })}{!visible.length && <div className={styles.empty}><RiSearchLine size={28}/><h3>{query ? 'No matching items' : data.isPackageUsed ? 'Package tests are already selected' : 'No items available'}</h3><p>{query ? 'Try a shorter name, a different spelling or change the item filter.' : 'Check your billing setup and catalogue configuration.'}</p>{query && <button type="button" className={styles.secondary} onClick={() => setQuery('')}>Clear search</button>}</div>}</div></fieldset>
                {filtered.length > limit && <button className={styles.showMore} type="button" onClick={() => setLimit(limit + 40)}>Show more items ({filtered.length - limit} remaining)</button>}
                <p className={styles.keyboardHelp}>↑ ↓ Move · Enter Select / remove · Ctrl+Enter Review · F4 Review</p>
            </section>
            <aside className={styles.basket} aria-label="Selected items"><div className={styles.basketHeader}><div><h2>Your selection</h2><span>{countLabel}</span></div>{draft.items.length > 0 && !data.isPackageUsed && <button type="button" disabled={busy} onClick={()=>setConfirmClear(true)}>Clear all</button>}</div>
                {confirmClear&&<div className={styles.inlineConfirmation} role="group" aria-label="Clear selected items"><span>Remove all selected items?</span><button type="button" className={styles.secondary} onClick={()=>setConfirmClear(false)}>Keep items</button><button type="button" className={styles.primary} onClick={()=>{change([]);setConfirmClear(false);}}>Clear items</button></div>}
                <fieldset disabled={busy} className={styles.fieldset}><div className={styles.selectedItems}>{draft.items.map(item => <article className={styles.selectedItem} key={itemKey(item)}><div className={styles.selectedItemTitle}><strong>{itemName(item)}</strong>{!(data.isPackageUsed && item.kind === 'test') && <button type="button" aria-label={'Remove ' + itemName(item)} onClick={() => toggle(item)}><RiDeleteBinLine size={16}/></button>}</div><ItemOptions item={item} canAdjust={canAdjust} onChange={changes => updateOptions(item, changes)}/></article>)}{!draft.items.length && <div className={styles.basketEmpty}><span>Nothing selected yet</span><p>Choose items from the catalogue. You can search and add several before reviewing.</p></div>}</div></fieldset>
                <div className={styles.basketFooter}><p>Final charges include applicable pricing, taxes and adjustments.</p><button type="button" className={styles.primary} disabled={busy || !draft.items.length} onClick={() => void review()}>{busy ? 'Checking charges…' : 'Review ' + countLabel}<RiArrowRightLine size={17}/></button></div>
            </aside>
        </div>}

        {step === 3 && <div className={styles.reviewGrid}><section className={styles.reviewItems}><div className={styles.sectionHeading}><span className={styles.stepLabel}>03 / REVIEW CHARGES</span><h2>Confirm the bill before payment</h2><p>{payer}{data.entityname ? ' · ' + data.entityname : ''} · {countLabel}</p></div>
            {!reviewed ? <div className={styles.empty}><h3>Your selection needs a fresh review</h3><p>Charges must be confirmed after items or billing details change.</p><button type="button" className={styles.primary} disabled={busy} onClick={() => void review()}>{busy ? 'Checking charges…' : 'Review charges'}</button></div> : <><ul className={styles.reviewList}>{draft.items.map(item => <li key={itemKey(item)}><span><strong>{itemName(item)}</strong><small>{item.row.organization?.name || (item.kind === 'test' ? Number(item.row.isoutsourced)===1?'Outsourced · Organization not assigned':'Laboratory test' : 'Additional service')}{item.row.prioritised ? ' · Urgent' : ''}{item.row.userAdjustmentType ? ' · ' + item.row.userAdjustmentType + ' ' + currencyFormatter.format(Number(item.row.userAdjustedValue || 0)) : ''}</small></span><strong>{currencyFormatter.format(Number(item.row.totalpayable ?? item.row.discountedValue ?? item.row.servicePrice ?? 0))}</strong></li>)}</ul><button type="button" className={styles.backLink} disabled={busy} onClick={() => setStep(2)}><RiArrowLeftLine size={16}/> Edit selection</button></>}
            <details className={styles.history}><summary>Previous transactions & account history</summary><div>{history}</div></details>
        </section><aside className={styles.paymentCard} aria-label="Bill totals"><p className={styles.stepLabel}>TOTAL TO PAY</p><strong className={styles.payable}>{reviewed ? currencyFormatter.format(Number(data.amountPayable || 0)) : 'Review required'}</strong><span className={styles.verified}>{reviewed ? 'Current charges confirmed by the billing system' : 'Charges have changed'}</span>
            {reviewed && <dl className={styles.breakdown}><div><dt>Subtotal</dt><dd>{currencyFormatter.format(Number(data.subtotal ?? 0))}</dd></div><div><dt>Discount</dt><dd>{currencyFormatter.format(Number(data.totaldiscount || 0))}</dd></div><div><dt>Surcharge</dt><dd>{currencyFormatter.format(Number((data as any).totalsurcharge || 0))}</dd></div><div><dt>Tax</dt><dd>{currencyFormatter.format(Number(data.totalAmountIncurredDueTax || 0))}</dd></div></dl>}
            <label className={styles.noteLabel} htmlFor="modern-billing-note">Billing note <span>Optional</span><textarea id="modern-billing-note" rows={2} value={data.additionalInfo || ''} onChange={event => setBillingData(prev => ({ ...prev, additionalInfo: event.target.value }))}/></label>
            <button type="button" ref={reviewButton} className={styles.primary} disabled={busy || !reviewed} onClick={() => data.ispricingcheckout ? setSuspendOpen(true) : beginPayment()}>{data.ispricingcheckout ? 'Save quotation' : 'Continue to payment'}<RiArrowRightLine size={17}/></button><p className={styles.paymentHelp}>Payment methods, partial payments and approvals follow your facility’s billing rules.</p>
        </aside></div>}
        {step === 4 && <section className={styles.paymentStep} id="modern-payment-step" aria-label="Payment step">
            <div className={styles.sectionHeading}><span className={styles.stepLabel}>04 / PAYMENT</span><h2>Complete payment</h2><p>{payer} · {countLabel} · {currencyFormatter.format(Number(data.amountPayable || 0))}</p></div>
            {!reviewed ? <div className={styles.empty}><p>The billing details have changed. Review the charges again before payment.</p><button type="button" className={styles.primary} onClick={()=>void review()}>Review charges</button></div> : Number(data.outstanding) <= 0 ? <div className={styles.zeroPayment}><p>No further payment is required. Confirm to complete the bill using the existing settlement rules.</p><button type="button" className={styles.primary} onClick={onContinue}>Complete bill</button></div> : <ModernPayment onSubmit={onSubmit}/>}
        </section>}
        </div></main>
        {step !== 1 && !promptActive && !suspendOpen && <footer className={styles.bottomBar}><button type="button" className={styles.backLink} disabled={busy} onClick={() => setStep(step === 4 ? 3 : step === 3 ? 2 : 1)}><RiArrowLeftLine size={16}/>{step === 4 ? 'Back to review' : step === 3 ? 'Back to selection' : 'Billing setup'}</button><span>{countLabel}</span>{step === 2 && <button type="button" className={styles.primary} disabled={busy || !draft.items.length} onClick={() => void review()}>{busy ? 'Checking…' : 'Review bill'}<RiArrowRightLine size={16}/></button>}{step === 3 && <button type="button" className={styles.primary} disabled={busy || !reviewed} onClick={() => data.ispricingcheckout ? setSuspendOpen(true) : beginPayment()}>{data.ispricingcheckout ? 'Save quotation' : 'Payment'}</button>}{step === 4 && <button type="button" className={styles.secondary} onClick={()=>document.getElementById('modern-payment-step')?.scrollIntoView({block:'start'})}>Payment options</button>}</footer>}

    </div>;
}
