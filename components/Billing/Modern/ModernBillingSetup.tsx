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
    const [confirmation,setConfirmation]=useState<'reset'|'payer'|null>(null);
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
        <div className={styles.configurationRow}>
            <div className={styles.optionCards} aria-label="Transaction switches">
                <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.isPackageUsed)} onChange={event=>onPackageChange(event.target.checked)}/> Package</label>
                <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.includeServices)} onChange={event=>onServicesChange(event.target.checked)}/> Services</label>
                <label className={styles.optionCard} title={Number(data.billingSource)===1?'Referral pricing codes apply to non-General billing sources':undefined}><input type="checkbox" disabled={Number(data.billingSource)===1} checked={Boolean(data.useSpecialCode)} onChange={event=>update({useSpecialCode:event.target.checked})}/> Referral code</label>
                <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.isPromo)} onChange={event=>update({isPromo:event.target.checked,promoCode:event.target.checked?data.promoCode:null})}/> Promotion</label>
                <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.isBilledAgaintsDate)} onChange={event=>update({isBilledAgaintsDate:event.target.checked,billedagaints:event.target.checked?data.billedagaints:null})}/> Billing date</label>
                <label className={styles.optionCard}><input type="checkbox" checked={Boolean(data.showRelatedBilling)} onChange={event=>update({showRelatedBilling:event.target.checked,billingIdVerified:false,billingid:event.target.checked?data.billingid:undefined})}/> Related bill</label>
            </div>
            <div className={styles.configurationActions}><button type="button" className={styles.primary} disabled={loading||!ready||Boolean(specialCodeError)||Boolean(data.showRelatedBilling&&!data.billingIdVerified)} onClick={()=>onReload()}>{loading?'Loading…':'Load catalogue'}</button><button type="button" className={styles.secondary} onClick={()=>setConfirmation('reset')}>Reset</button><button type="button" className={styles.secondary} onClick={()=>setConfirmation('payer')}>Change payer</button></div>
        </div>
        {(data.useSpecialCode||data.isPromo||data.isBilledAgaintsDate||data.showRelatedBilling)&&<div className={styles.configInputs}>
            {data.useSpecialCode&&<label className={styles.configField}>Referral code<input value={data.specialCode||''} onChange={onReferenceChange} aria-invalid={Boolean(specialCodeError)}/>{specialCodeError&&<span role="alert">{specialCodeError}</span>}</label>}
            {data.isPromo&&<label className={styles.configField}>Promotion code<input value={String(data.promoCode||'')} onChange={event=>update({promoCode:event.target.value as any})}/></label>}
            {data.isBilledAgaintsDate&&<label className={styles.configField}>Billing date<input type="date" max={new Date().toISOString().slice(0,10)} value={data.billedagaints?new Date(data.billedagaints).toISOString().slice(0,10):''} onChange={event=>update({billedagaints:event.target.value as any})}/></label>}
            {data.showRelatedBilling&&<div className={styles.relatedBill}><label className={styles.configField}>Existing bill number<input type="number" min="1" value={data.billingid||''} onChange={event=>update({billingid:Number(event.target.value)||undefined,billingIdVerified:false})}/></label><button type="button" className={styles.secondary} disabled={verifying||!data.billingid} onClick={()=>void verifyRelated()}>{verifying?'Verifying…':'Verify & load'}</button></div>}
        </div>}
        {confirmation&&<div className={styles.inlineConfirmation} role="group" aria-label="Confirm transaction action"><span>{confirmation==='reset'?'Clear selections and reset this transaction?':'Return to payer selection and clear unsaved selections?'}</span><button type="button" className={styles.secondary} onClick={()=>setConfirmation(null)}>Keep editing</button><button type="button" className={styles.primary} onClick={()=>{const action=confirmation;setConfirmation(null);if(action==='reset')onReset();else onChangePayer();}}>Confirm</button></div>}
        {error&&<p role="alert" className={styles.configError}>{error}</p>}
    </div>;
}
