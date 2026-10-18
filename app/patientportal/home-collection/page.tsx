"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Badge, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { RiHomeHeartLine, RiMapPinLine } from '@remixicon/react';
import { customFetchMutation } from '../../../components/Auth/customFetch';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import SlotPicker from '../../../components/PatientPortal/SlotPicker';
import {
    BookingSlot, HomeCollection, HomeCollectionOptions, bookingMaxDate, errorMessage, formatDate, formatMoney,
    homeCollectionProblem, homeCollectionVariant, todayIso, unwrap,
} from '../../../lib/patientPortal';
import type { RequestedTest } from '../../../lib/patientBillingRequests';
import styles from '../../../components/PatientPortal/portal.module.css';
import shell from '../../../components/PatientPortal/PortalShell.module.css';

const emptyForm = { areaId: '', date: '', time: '', address: '', landmark: '', contactPhone: '', note: '' };

function preselectedTests(value: string | null): number[] {
    return Array.from(new Set(String(value || '').split(',').map(Number).filter(id => Number.isSafeInteger(id) && id > 0))).slice(0, 30);
}

export default function PatientHomeCollectionPage() {
    const options = usePortalResource<HomeCollectionOptions>('patient-portal/home-collections/options');
    const bookings = usePortalResource<HomeCollection[]>(options.data ? 'patient-portal/home-collections' : null);
    const catalog = usePortalResource<RequestedTest[]>(options.data?.testsAvailable ? 'patient-portal/billing-requests/catalog' : null);
    const [form, setForm] = useState(emptyForm);
    const [testIds, setTestIds] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const inFlight = useRef(false);
    const availability = usePortalResource<{ date: string; slots: BookingSlot[] }>(
        form.date ? `patient-portal/home-collections/availability?date=${encodeURIComponent(form.date)}` : null);

    useEffect(() => {
        setTestIds(preselectedTests(new URLSearchParams(window.location.search).get('tests')));
    }, []);

    const defaultPhone = options.data?.defaultPhone;
    useEffect(() => {
        if (defaultPhone) setForm(current => current.contactPhone ? current : { ...current, contactPhone: defaultPhone });
    }, [defaultPhone]);

    const tests = useMemo(() => catalog.data || [], [catalog.data]);
    const selectedTests = testIds.map(id => tests.find(test => test.testid === id)).filter((test): test is RequestedTest => Boolean(test));
    const area = options.data?.areas.find(item => String(item.id) === form.areaId);
    const estimate = (Math.round(Number(area?.fee || 0) * 100) + selectedTests.reduce((sum, test) => sum + Math.round(Number(test.estimatedPrice || 0) * 100), 0)) / 100;

    function shareLocation() {
        if (!navigator.geolocation) return setError('Your browser cannot share its location. Describe the address and a landmark instead.');
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            position => {
                setLocation({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) });
                setLocating(false);
            },
            () => {
                setError('We could not get your location. Describe the address and a landmark instead.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000 },
        );
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (inFlight.current) return;
        const problem = homeCollectionProblem(form);
        if (problem) return setError(problem);
        inFlight.current = true;
        setSaving(true);
        setError('');
        setNotice('');
        try {
            const booking = unwrap<HomeCollection>(await customFetchMutation('patient-portal/home-collections', 'POST', {
                areaId: Number(form.areaId), date: form.date, time: form.time,
                address: form.address.trim(), landmark: form.landmark.trim(), contactPhone: form.contactPhone.trim(), note: form.note.trim(),
                ...(location || {}),
                ...(selectedTests.length ? { testIds: selectedTests.map(test => test.testid) } : {}),
            }));
            setNotice(`Home collection ${booking?.reference || ''} requested for ${formatDate(form.date)} at ${form.time}. The lab will confirm it and you can track it below.`);
            setForm({ ...emptyForm, contactPhone: form.contactPhone });
            setTestIds([]);
            setLocation(null);
            bookings.reload();
        } catch (reason) {
            const message = errorMessage(reason, 'Unable to book the collection. Please try again.');
            setError(message);
            if (/no longer available/i.test(message)) {
                setForm(current => ({ ...current, time: '' }));
                availability.reload();
            }
        } finally {
            inFlight.current = false;
            setSaving(false);
        }
    }

    async function cancel(booking: HomeCollection) {
        if (!window.confirm(`Cancel home collection ${booking.reference} on ${formatDate(booking.date)}?`)) return;
        setCancelling(booking.id);
        setError('');
        setNotice('');
        try {
            unwrap(await customFetchMutation(`patient-portal/home-collections/${booking.id}/cancel`, 'POST', {}));
            setNotice(`Home collection ${booking.reference} was cancelled.`);
            bookings.reload();
        } catch (reason) {
            setError(errorMessage(reason, 'Unable to cancel the collection. Please call the facility.'));
        } finally {
            setCancelling(null);
        }
    }

    if (options.loading) return <main className={styles.page}><p role="status"><Spinner size="sm" animation="border" /> Loading home collection…</p></main>;
    if (options.code === 'HOME_COLLECTION_DISABLED') {
        return <main className={styles.page}>
            <header className={styles.header}><div><h1 className={styles.title}>Home collection</h1></div></header>
            <Alert variant="info">Home sample collection is not offered online by this facility. Please contact the lab to arrange a visit.</Alert>
        </main>;
    }

    return <main className={styles.page}>
        <header className={styles.header}><div>
            <h1 className={styles.title}>Home collection</h1>
            <p className={styles.subtitle}>Book a sample collector to visit you, then follow every step until your sample reaches the lab.</p>
        </div></header>
        {options.error && <Alert variant="danger">{options.error} <Button size="sm" onClick={options.reload}>Retry</Button></Alert>}
        {notice && <Alert variant="success" role="status">{notice}</Alert>}
        {error && <Alert variant="danger" role="alert">{error}</Alert>}

        {options.data && <Form onSubmit={submit} noValidate className={styles.card}>
            <h2 className={styles.cardTitle}><RiHomeHeartLine size={18} />Book a visit</h2>
            {options.data.note && <Alert variant="light" className="border">{options.data.note}</Alert>}
            {!options.data.areas.length ? <Alert variant="warning" className="mb-0">No collection areas are available yet. Please contact the lab.</Alert> :
                <fieldset disabled={saving}>
                    <legend className="visually-hidden">Collection details</legend>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label htmlFor="hc-area">Area</Form.Label>
                            <Form.Select id="hc-area" value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })} required>
                                <option value="">Choose your area</option>
                                {options.data.areas.map(item => <option key={item.id} value={item.id}>{item.name}{Number(item.fee) > 0 ? ` — fee ${formatMoney(item.fee)}` : ' — no fee'}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label htmlFor="hc-date">Date</Form.Label>
                            <Form.Control id="hc-date" type="date" min={todayIso()} max={bookingMaxDate(options.data.maxDaysAhead)} value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value, time: '' })} required />
                        </Col>
                        <Col xs={12}>
                            <span className="form-label d-block">Time</span>
                            <SlotPicker label="Collection time" slots={form.date ? availability.data?.slots : null} value={form.time}
                                loading={availability.loading} error={availability.error || undefined} onChange={time => setForm({ ...form, time })} />
                        </Col>
                        <Col xs={12}>
                            <Form.Label htmlFor="hc-address">Collection address</Form.Label>
                            <Form.Control id="hc-address" as="textarea" rows={2} maxLength={500} value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House number, street, area" required />
                        </Col>
                        <Col md={6}>
                            <Form.Label htmlFor="hc-landmark">Landmark (optional)</Form.Label>
                            <Form.Control id="hc-landmark" maxLength={200} value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} placeholder="Near…" />
                        </Col>
                        <Col md={6}>
                            <Form.Label htmlFor="hc-phone">Contact phone</Form.Label>
                            <Form.Control id="hc-phone" type="tel" autoComplete="tel" maxLength={30} value={form.contactPhone}
                                onChange={e => setForm({ ...form, contactPhone: e.target.value })} required />
                        </Col>
                        <Col xs={12} className="d-flex flex-wrap align-items-center gap-2">
                            <Button variant="outline-secondary" type="button" onClick={shareLocation} disabled={locating}>
                                <RiMapPinLine size={16} className="me-1" />{locating ? 'Getting location…' : location ? 'Update my location' : 'Share my location'}
                            </Button>
                            {location && <>
                                <span className="small text-muted">Location shared ({location.latitude}, {location.longitude})</span>
                                <Button variant="link" size="sm" type="button" onClick={() => setLocation(null)}>Remove</Button>
                            </>}
                        </Col>
                        {options.data.testsAvailable && <Col xs={12}>
                            <Form.Label htmlFor="hc-test-search">Tests to collect (optional)</Form.Label>
                            {catalog.loading && <p className="small"><Spinner size="sm" animation="border" /> Loading tests…</p>}
                            {catalog.error && <p className="text-danger small">{catalog.error}</p>}
                            {!!tests.length && <>
                                <Form.Control id="hc-test-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search test names" className="mb-2" />
                                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                    {tests.filter(test => test.name.toLowerCase().includes(search.toLowerCase())).map(test =>
                                        <Form.Check key={test.testid} id={`hc-test-${test.testid}`} className="py-1"
                                            label={`${test.name} — estimated ${formatMoney(test.estimatedPrice)}`}
                                            checked={testIds.includes(test.testid)}
                                            disabled={!testIds.includes(test.testid) && testIds.length >= 30}
                                            onChange={e => setTestIds(ids => e.target.checked ? [...ids, test.testid] : ids.filter(id => id !== test.testid))} />)}
                                </div>
                            </>}
                        </Col>}
                        <Col xs={12}>
                            <Form.Label htmlFor="hc-note">Note for the collector (optional)</Form.Label>
                            <Form.Control id="hc-note" as="textarea" rows={2} maxLength={500} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                                placeholder={options.data.testsAvailable ? 'Fasting, access instructions…' : 'Tests you need, fasting, access instructions…'} />
                        </Col>
                    </Row>
                    <div className={shell.basket} aria-live="polite">
                        <div style={{ minWidth: 0 }}>
                            <strong>{area ? `Estimated ${formatMoney(estimate)}` : 'Choose an area to see the fee'}</strong>
                            <div className="small text-muted">
                                {[area ? `Collection fee ${formatMoney(area.fee)}` : '', selectedTests.length ? `${selectedTests.length} test${selectedTests.length === 1 ? '' : 's'}` : '', 'The lab confirms final prices.'].filter(Boolean).join(' · ')}
                            </div>
                        </div>
                        <Button type="submit" disabled={saving}>{saving ? 'Booking…' : 'Request home collection'}</Button>
                    </div>
                </fieldset>}
        </Form>}

        {options.data && <section className={`${styles.card} mt-4`} aria-labelledby="hc-bookings-title">
            <h2 id="hc-bookings-title" className={styles.cardTitle}>My home collections</h2>
            {bookings.loading && <Spinner size="sm" animation="border" />}
            {bookings.error && <Alert variant="danger">{bookings.error} <Button size="sm" onClick={bookings.reload}>Retry</Button></Alert>}
            {bookings.data?.length === 0 && <p className="mb-0">You have not booked a home collection yet.</p>}
            {bookings.data?.map(booking => <article key={booking.id} className="border-bottom py-3">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                    <div style={{ minWidth: 0 }}>
                        <h3 className="h6 mb-1">{booking.reference} · {formatDate(booking.date)} at {booking.time}</h3>
                        <p className="small text-muted mb-1">{booking.area} · {booking.address}{booking.landmark ? ` · Landmark: ${booking.landmark}` : ''}</p>
                        {!!booking.tests.length && <p className="small mb-1">Tests: {booking.tests.map(test => test.name).join(', ')}</p>}
                        <p className="small mb-0">Estimated {formatMoney(booking.estimatedTotal)} (fee {formatMoney(booking.fee)})</p>
                    </div>
                    <div className="text-end">
                        <Badge bg={homeCollectionVariant(booking.status)}>{booking.statusLabel}</Badge>
                        {booking.collectorAssigned && !['Cancelled', 'Assigned'].includes(booking.status) && <div className="small text-muted mt-1">Collector assigned</div>}
                    </div>
                </div>
                {booking.status !== 'Cancelled' && <ol className={shell.timeline} aria-label={`Progress of ${booking.reference}`}>
                    {booking.timeline.map(step => <li key={step.status} className={`${step.done ? shell.timelineDone : ''} ${step.current ? shell.timelineCurrent : ''}`}
                        aria-current={step.current ? 'step' : undefined}>
                        <span className={shell.timelineDot} aria-hidden="true" />
                        <span>{step.label}{step.at && <small>{formatDate(step.at, true)}</small>}</span>
                    </li>)}
                </ol>}
                {booking.status === 'Cancelled' && <p className="small text-muted mt-2 mb-0">Cancelled{booking.cancelledAt ? ` on ${formatDate(booking.cancelledAt, true)}` : ''}.</p>}
                {booking.billingid && <a className="small" href={`/patientportal/billing/${booking.billingid}`}>View bill #{booking.billingid}</a>}
                {booking.cancellable && <div className="mt-2">
                    <Button size="sm" variant="outline-danger" disabled={cancelling === booking.id} onClick={() => cancel(booking)}>
                        {cancelling === booking.id ? 'Cancelling…' : 'Cancel collection'}
                    </Button>
                </div>}
            </article>)}
        </section>}
    </main>;
}
