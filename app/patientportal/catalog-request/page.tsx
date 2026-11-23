"use client";

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { requestBackendJson } from '../../../components/serverActions/backendRequest';
import SlotPicker from '../../../components/PatientPortal/SlotPicker';
import styles from '../../../components/PatientPortal/portal.module.css';
import { marketplaceRequest } from '../../../website/components/marketplace/client';
import { availabilitySchema, createdAppointmentSchema, plusCalendarDays, pricesMatch, selectedLiveCatalog, todayInZone } from '../../../lib/catalogAppointmentData';
import { CatalogSelection, clearCatalogSelection, readCatalogSelection, scheduleCatalogSelectionExpiry } from '../../../lib/catalogAppointmentSelection';

type Catalog = ReturnType<typeof selectedLiveCatalog>;
type Availability = ReturnType<typeof availabilitySchema.parse>;

async function loadCatalog(selection: CatalogSelection): Promise<Catalog> {
    const result = await marketplaceRequest<unknown>(`facilities/${encodeURIComponent(selection.slug)}/catalog`, 'GET');
    return selectedLiveCatalog(result, selection);
}

async function loadAvailability(slug: string, date: string): Promise<Availability> {
    const response = await requestBackendJson(`patient-portal/facilities/${encodeURIComponent(slug)}/appointments/availability?date=${encodeURIComponent(date)}`);
    if (response?.status !== 'success') {
        if (response?.statusCode === 404) throw new Error('This patient account may belong to a different facility, or the selected facility is no longer available. Sign in with an account at the selected facility or contact it.');
        if (response?.statusCode === 401) throw new Error('Your patient session has expired. Sign in again at the selected facility.');
        throw new Error(typeof response?.message === 'string' ? response.message : 'Appointment availability is temporarily unavailable.');
    }
    const result = availabilitySchema.safeParse(response.data);
    if (!result.success || result.data.date !== date) throw new Error('Appointment availability could not be verified.');
    try { todayInZone(result.data.timeZone); } catch { throw new Error('The facility timezone could not be verified. Please contact the facility.'); }
    return result.data;
}

export default function CatalogAppointmentRequestPage() {
    const router = useRouter();
    const [selection, setSelection] = useState<CatalogSelection | null>(null);
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [zone, setZone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState<'laboratory' | 'ultrasound'>('laboratory');
    const [reason, setReason] = useState('');
    const [consent, setConsent] = useState(false);
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [error, setError] = useState('');
    const [slotError, setSlotError] = useState('');
    const [uncertain, setUncertain] = useState(false);
    const [storageWarning, setStorageWarning] = useState(false);
    const [created, setCreated] = useState<{ refid: number; timeZone: string } | null>(null);
    const catalogReady = Boolean(catalog);

    useEffect(() => {
        let current = true;
        let expired = false;
        let cancelTimer: (() => void) | undefined;
        const initialize = async () => {
            let saved: CatalogSelection | null = null;
            try { saved = readCatalogSelection(sessionStorage); } catch { /* Storage is unavailable. */ }
            if (!saved) {
                if (current) { setError('Your selection is missing or expired. Return to the facility catalog and select your tests again.'); setLoading(false); }
                return;
            }
            if (current) setSelection(saved);
            try {
                cancelTimer = scheduleCatalogSelectionExpiry(sessionStorage, saved, () => {
                    expired = true;
                    if (current) {
                        setCatalog(null); setAvailability(null); setError('Your selection expired. Return to the facility catalog and select your tests again.');
                    }
                });
            } catch { /* Storage is unavailable. */ }
            try {
                // Two days ahead in UTC is inside the booking window for all server timezones.
                const probeDate = plusCalendarDays(new Date().toISOString().slice(0, 10), 2);
                const [fresh, probe] = await Promise.all([loadCatalog(saved), loadAvailability(saved.slug, probeDate)]);
                if (current && !expired) { setCatalog(fresh); setZone(probe.timeZone); }
            } catch (failure) {
                if (current && !expired) setError(failure instanceof Error ? failure.message : 'Unable to load the appointment request.');
            } finally { if (current) setLoading(false); }
        };
        void initialize();
        return () => { current = false; cancelTimer?.(); };
    }, []);

    useEffect(() => {
        if (!selection || !catalogReady || !zone || !date) return;
        let current = true;
        void loadAvailability(selection.slug, date).then(result => {
            if (!current) return;
            if (result.timeZone !== zone) { setSlotError('The facility timezone changed. Reload this page before requesting a time.'); return; }
            setAvailability(result);
        }).catch(failure => {
            if (current) setSlotError(failure instanceof Error ? failure.message : 'Unable to check availability.');
        }).finally(() => { if (current) setSlotsLoading(false); });
        return () => { current = false; };
    }, [selection, catalogReady, date, zone]);

    const cancel = () => {
        try {
            if (!clearCatalogSelection(sessionStorage)) throw new Error('Storage unavailable');
        } catch {
            setError('Your selection could not be cleared. Close this browser tab to remove it.');
            return;
        }
        router.push('/patientportal/appointments');
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!selection || !catalog || busy || uncertain) return;
        let saved: CatalogSelection | null = null;
        try { saved = readCatalogSelection(sessionStorage); } catch { /* Storage is unavailable. */ }
        if (!saved || JSON.stringify(saved) !== JSON.stringify(selection)) {
            setError('Your selection expired or changed. Return to the catalog and select your tests again.');
            return;
        }
        if (!consent || reason.trim().length < 3 || reason.trim().length > 500 || !date ||
            availability?.date !== date || availability.timeZone !== zone || !availability.slots.some(slot => slot.time === time && slot.available)) {
            setError('Choose an available time, provide a reason of 3–500 characters, and consent to sending this request.');
            return;
        }
        setBusy(true);
        setError('');
        let sent = false;
        try {
            const fresh = await loadCatalog(selection);
            if (!pricesMatch(catalog, fresh)) {
                setCatalog(fresh);
                setConsent(false);
                setError('The selected services or prices changed. Review them and consent again before sending.');
                return;
            }
            if (JSON.stringify(readCatalogSelection(sessionStorage)) !== JSON.stringify(selection)) {
                setError('Your selection expired or changed. Return to the catalog and select your tests again.');
                return;
            }
            sent = true;
            const response = await requestBackendJson(`patient-portal/facilities/${encodeURIComponent(selection.slug)}/appointments`, 'POST', {
                date, time, type, reason: reason.trim(), itemIds: selection.itemIds, consent: true,
            });
            if (response?.status !== 'success') {
                if (response?.statusCode === 404) { setError('This patient account may belong to a different facility, or the facility is no longer available. Sign in at the selected facility.'); return; }
                if (response?.statusCode >= 500) { setUncertain(true); throw new Error('The request outcome is uncertain. Check your appointments before attempting another request.'); }
                setError(typeof response?.message === 'string' ? response.message : 'The request could not be sent.');
                return;
            }
            const result = createdAppointmentSchema.safeParse(response.data);
            if (!result.success) { setUncertain(true); throw new Error('The request outcome is uncertain. Check your appointments before attempting another request.'); }
            try { setStorageWarning(!clearCatalogSelection(sessionStorage)); }
            catch { setStorageWarning(true); }
            setReason('');
            setConsent(false);
            setCreated(result.data);
        } catch (failure) {
            if (sent) {
                setUncertain(true);
                setError('The request outcome is uncertain. Check your appointments before attempting another request.');
            } else setError(failure instanceof Error ? failure.message : 'Unable to complete the request.');
        } finally { setBusy(false); }
    };

    if (created) return <main className={styles.page}><section className={styles.card}>
        <h1 className={styles.title}>Request sent — pending review</h1>
        <p>Your requested time is not confirmed. The facility must review it.</p>
        <p>Requested: {date} at {time} ({created.timeZone})</p>
        {created.timeZone !== zone && <p role="alert">The server timezone changed during submission. Contact the facility to verify your requested time.</p>}
        <p>Request reference: {created.refid} · Timezone: {created.timeZone}</p>
        {storageWarning && <p role="alert">Your selection could not be cleared. Close this browser tab to remove it.</p>}
        <Link href="/patientportal/appointments">View your appointments</Link>
    </section></main>;

    let today = '';
    try { if (zone) today = todayInZone(zone); } catch { /* Validated when loaded. */ }
    return <main className={styles.page}>
        <h1 className={styles.title}>Request an appointment</h1>
        <p className={styles.subtitle}>This is a request, not a confirmed appointment.</p>
        {loading && <p role="status"><Spinner size="sm" animation="border" /> Checking the facility and your selection…</p>}
        {error && <Alert variant="danger" role="alert">{error} <Link href="/patient-access/login">Sign in to the selected facility</Link></Alert>}
        {catalog && selection && zone && <section className={styles.card}>
            <h2 className={styles.cardTitle}>{catalog.facility.name}</h2>
            <p>Current published list prices; the facility will confirm the final price. No payment or order is created by this request.</p>
            <ul>{catalog.items.map(item => <li key={item.id}>{item.name} — {new Intl.NumberFormat('en', { style: 'currency', currency: catalog.currency }).format(item.price)}</li>)}</ul>
            <p>All times are in <strong>{zone}</strong>, not necessarily your device’s timezone.</p>
            <Form onSubmit={submit}>
                <fieldset disabled={busy || uncertain}>
                <Form.Label htmlFor="catalog-appointment-type">Appointment type</Form.Label>
                <Form.Select id="catalog-appointment-type" value={type} onChange={event => setType(event.target.value as 'laboratory' | 'ultrasound')} disabled={busy || uncertain}>
                    <option value="laboratory">Laboratory</option><option value="ultrasound">Ultrasound</option>
                </Form.Select>
                <Form.Label htmlFor="catalog-appointment-date" className="mt-3">Requested date</Form.Label>
                <Form.Control id="catalog-appointment-date" type="date" min={today} max={today ? plusCalendarDays(today, 60) : undefined} value={date}
                    onChange={event => {
                        const nextDate = event.target.value;
                        setDate(nextDate); setTime(''); setAvailability(null); setSlotError(''); setSlotsLoading(Boolean(nextDate));
                    }} required disabled={busy || uncertain} />
                <div className="mt-3"><span className="form-label d-block">Requested time ({zone})</span>
                    <SlotPicker label={`Requested time in ${zone}`} slots={availability?.date === date ? availability.slots : null} value={time}
                        loading={slotsLoading} error={slotError} onChange={setTime} />
                </div>
                <Form.Label htmlFor="catalog-appointment-reason" className="mt-3">Reason</Form.Label>
                <Form.Control id="catalog-appointment-reason" as="textarea" rows={2} minLength={3} maxLength={500}
                    value={reason} onChange={event => setReason(event.target.value)} required disabled={busy || uncertain} />
                <p className="small text-muted">Only include information needed to arrange your visit.</p>
                <Form.Check id="catalog-appointment-consent" type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}
                    disabled={busy || uncertain} label={`I consent to send this request and selected tests to ${catalog.facility.name}.`} />
                </fieldset>
                <Button type="submit" className={`${styles.primaryButton} mt-3 me-2`} disabled={busy || uncertain || slotsLoading || !consent}>
                    {busy ? 'Sending…' : 'Send appointment request'}
                </Button>
                <Button type="button" className="mt-3" variant="outline-secondary" onClick={cancel} disabled={busy}>Cancel and clear selection</Button>
            </Form>
            {uncertain && <p className="mt-3"><Link href="/patientportal/appointments">Check your appointments before retrying</Link></p>}
        </section>}
        {!loading && !catalog && <p><Link href="/facilities">Return to laboratories</Link> · <button type="button" onClick={cancel}>Cancel and clear selection</button></p>}
    </main>;
}
