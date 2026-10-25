'use client';
import React, { useContext, useState } from 'react';
import { MultiBillingContext } from '../Multi/MultiBillingContext';
import { customFetch } from '../../Auth/customFetch';
import type { MultiBillingData } from '../../../lib/Multi/MultiTypes';
import styles from './ModernWorkflow.module.css';

type Props = {
    ready: boolean; loading: boolean; specialCodeError: string;
    onReload: (data?: MultiBillingData) => void; onPackageChange: (value: boolean) => void;
    onServicesChange: (value: boolean) => void; onReferenceChange: (event: any) => void;
    onReset: () => void; onChangePayer: () => void;
};
export default function ModernBillingSetup({ ready, loading, specialCodeError, onReload, onPackageChange, onServicesChange, onReferenceChange, onReset, onChangePayer }: Props) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error('Billing context is required');
    const { billingdata: data, setBillingData } = context;
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const update = (patch: Partial<MultiBillingData>) => setBillingData(previous => ({ ...previous, ...patch }));
    const verifyRelated = async () => {
        setVerifying(true); setError('');
        try {
            const response = await customFetch(`billing/previous/transaction/data?billingid=${Number(data.billingid)}`);
            const bill = response?.result?.[0];
            if (!bill || Number(bill.patientid) !== Number(data.patientid)) throw new Error('The bill was not found for this patient.');
            const next = { ...data, previousRecordsSummary: bill, billingIdVerified: true };
            setBillingData(next); onReload(next);
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to verify this bill'); }
        finally { setVerifying(false); }
    };
    return <div className={styles.configuration}>
        <div className={styles.optionCards}>
            <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.isPackageUsed)} onChange={event => onPackageChange(event.target.checked)}/><span><strong>Use a test package</strong><small>Select a predefined group of tests and its package pricing.</small></span></label>
            <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.includeServices)} onChange={event => onServicesChange(event.target.checked)}/><span><strong>Include additional services</strong><small>Add collection, consultation or other configured services.</small></span></label>
        </div>
        <details className={styles.configurationDetails} open={Boolean(data.useSpecialCode || data.isPromo || data.isBilledAgaintsDate || data.showRelatedBilling)}><summary>Referral codes, promotions & other options</summary>
            <label className={styles.optionCard}><input type="checkbox" disabled={Number(data.billingSource) === 1} checked={Boolean(data.useSpecialCode)} onChange={event => update({ useSpecialCode: event.target.checked })}/><span><strong>Use a referral code</strong><small>Apply the pricing associated with a valid referral.</small></span></label>
            {data.useSpecialCode && <label className={styles.configField}>Referral code<input value={data.specialCode || ''} onChange={onReferenceChange} aria-invalid={Boolean(specialCodeError)}/>{specialCodeError && <small role="alert">{specialCodeError}</small>}</label>}
            <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.isPromo)} onChange={event => update({ isPromo: event.target.checked, showPromoCode: event.target.checked, promoCode: event.target.checked ? data.promoCode : null })}/><span><strong>Apply a promotion</strong><small>The promotion is validated when the complete bill is reviewed.</small></span></label>
            {data.isPromo && <label className={styles.configField}>Promotion code<input value={String(data.promoCode || '')} onChange={event => update({ promoCode: event.target.value as any })}/></label>}
            <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.isBilledAgaintsDate)} onChange={event => update({ isBilledAgaintsDate: event.target.checked, billedagaints: event.target.checked ? data.billedagaints : null })}/><span><strong>Use a different billing date</strong><small>Record this bill against the selected date.</small></span></label>
            {data.isBilledAgaintsDate && <label className={styles.configField}>Billing date<input type="date" max={new Date().toISOString().slice(0, 10)} value={data.billedagaints ? new Date(data.billedagaints).toISOString().slice(0, 10) : ''} onChange={event => update({ billedagaints: event.target.value as any })}/></label>}
            <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.showRelatedBilling)} onChange={event => update({ showRelatedBilling: event.target.checked, billingIdVerified: false, billingid: event.target.checked ? data.billingid : undefined })}/><span><strong>Link an existing bill</strong><small>Verify a bill belonging to this patient before loading its details.</small></span></label>
            {data.showRelatedBilling && <div className={styles.relatedBill}><label className={styles.configField}>Existing bill number<input type="number" min="1" value={data.billingid || ''} onChange={event => update({ billingid: Number(event.target.value) || undefined, billingIdVerified: false })}/></label><button type="button" className={styles.secondary} disabled={verifying || !data.billingid} onClick={() => void verifyRelated()}>{verifying ? 'Verifying…' : 'Verify & load'}</button></div>}
        </details>
        {error && <p role="alert" className={styles.configError}>{error}</p>}
        <div className={styles.configurationActions}><button type="button" className={styles.primary} disabled={loading || !ready || Boolean(specialCodeError) || Boolean(data.showRelatedBilling && !data.billingIdVerified)} onClick={() => onReload()}>{loading ? 'Loading…' : 'Load current catalogue'}</button><button type="button" className={styles.backLink} onClick={() => { if (window.confirm('Clear the current selections and reload billing setup?')) onReset(); }}>Reset transaction</button><button type="button" className={styles.backLink} onClick={() => { if (window.confirm('Return to payer selection? Unsaved selections on this page will be cleared.')) onChangePayer(); }}>Change payer</button></div>
    </div>;
}
