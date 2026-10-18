"use client";

import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { customFetchMutation } from '../../../components/Auth/customFetch';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { errorMessage, formatDate, formatMoney, unwrap } from '../../../lib/patientPortal';
import type { PatientBillingRequest, RequestedTest } from '../../../lib/patientBillingRequests';
import styles from '../../../components/PatientPortal/portal.module.css';
import shell from '../../../components/PatientPortal/PortalShell.module.css';

export default function PatientTestRequestsPage() {
    const catalog = usePortalResource<RequestedTest[]>('patient-portal/billing-requests/catalog');
    const [page, setPage] = useState(1);
    const history = usePortalResource<PatientBillingRequest[]>(`patient-portal/billing-requests?page=${page}`);
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const submissionKey = useRef('');
    const inFlight = useRef(false);
    const tests = catalog.data || [];
    const basket = selected.map(id => tests.find(test => test.testid === id)).filter((test): test is RequestedTest => Boolean(test));
    const estimate = basket.reduce((sum, test) => sum + Math.round(Number(test.estimatedPrice || 0) * 100), 0) / 100;

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (inFlight.current || !selected.length) return;
        inFlight.current = true;
        setSaving(true);
        setError('');
        setNotice('');
        if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
        try {
            const request = unwrap<PatientBillingRequest>(await customFetchMutation('patient-portal/billing-requests', 'POST', {
                testIds: selected, note, submissionKey: submissionKey.current,
            }));
            setNotice(`Request #${request.id} sent to the lab for review. No bill or payment has been created.`);
            submissionKey.current = '';
            setSelected([]);
            setNote('');
            setPage(1);
            history.reload();
        } catch (reason) {
            setError(errorMessage(reason, 'Unable to send the request. Retry to safely check the same submission.'));
        } finally {
            inFlight.current = false;
            setSaving(false);
        }
    }

    return <main className={styles.page}>
        <header className={styles.header}><div>
            <h1 className={styles.title}>Request tests</h1>
            <p className={styles.subtitle}>Select tests and send them to your lab. Staff review your request before creating a General bill.</p>
        </div></header>
        <Alert variant="info">This is a request, not a booking, medical recommendation or payable bill. Prices below are estimates; the lab confirms current prices, tax and availability. No online payment is taken.</Alert>
        {notice && <Alert variant="success" role="status">{notice}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {catalog.error && <Alert variant="danger">{catalog.error} <Button size="sm" onClick={catalog.reload}>Retry catalog</Button></Alert>}
        {catalog.loading && <p><Spinner size="sm" animation="border" /> Loading tests…</p>}
        {catalog.data && <Form onSubmit={submit} className={styles.card}>
            <h2 className={styles.cardTitle}>Available tests</h2>
            <Form.Group className="mb-3" controlId="request-test-search">
                <Form.Label>Find a test</Form.Label>
                <Form.Control type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search test names" />
            </Form.Group>
            <fieldset disabled={saving}>
                <legend className="visually-hidden">Select tests</legend>
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {tests.filter(test => test.name.toLowerCase().includes(search.toLowerCase())).map(test =>
                        <Form.Check key={test.testid} id={`requested-test-${test.testid}`} className="py-2"
                            label={`${test.name} — estimated ${formatMoney(test.estimatedPrice)}`}
                            checked={selected.includes(test.testid)}
                            onChange={e => setSelected(ids => e.target.checked ? [...ids, test.testid] : ids.filter(id => id !== test.testid))} />)}
                    {!tests.length && <p>No tests are currently available. Please contact the lab.</p>}
                </div>
                <Form.Group className="my-3" controlId="request-test-note">
                    <Form.Label>Note for the lab (optional)</Form.Label>
                    <Form.Control as="textarea" rows={2} maxLength={1000} value={note} onChange={e => setNote(e.target.value)} />
                </Form.Group>
                <div className={shell.basket} aria-live="polite">
                    <div style={{ minWidth: 0 }}>
                        <strong>{basket.length ? `${basket.length} test${basket.length === 1 ? '' : 's'} · estimated ${formatMoney(estimate)}` : 'No tests selected yet'}</strong>
                        {!!basket.length && <ul className={shell.basketItems} aria-label="Selected tests">
                            {basket.map(test => <li key={test.testid}>
                                <button type="button" onClick={() => setSelected(ids => ids.filter(id => id !== test.testid))} aria-label={`Remove ${test.name}`}>{test.name} ✕</button>
                            </li>)}
                        </ul>}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {!!basket.length && basket.length <= 30 && <Link className="btn btn-outline-primary" href={`/patientportal/home-collection?tests=${selected.join(',')}`}>Book home collection</Link>}
                        <Button type="submit" disabled={saving || !selected.length || selected.length > 50}>
                            {saving ? 'Sending…' : `Send request (${selected.length} selected)`}
                        </Button>
                    </div>
                </div>
                {selected.length > 50 && <p className="text-danger">Select at most 50 tests per request.</p>}
            </fieldset>
        </Form>}
        <section className={`${styles.card} mt-4`}>
            <h2 className={styles.cardTitle}>My requests</h2>
            {history.loading && <Spinner size="sm" animation="border" />}
            {history.error && <Alert variant="danger">{history.error} <Button size="sm" onClick={history.reload}>Retry</Button></Alert>}
            {history.data?.length === 0 && <p>You have no requests on this page.</p>}
            {history.data?.map(request => <article key={request.id} className="border-bottom py-3">
                <h3 className="h6">Request #{request.id} · {request.status === 'submitted' ? 'Awaiting lab review' : request.status === 'converted' ? 'Bill created' : 'Declined'}</h3>
                <p className="small text-muted">{formatDate(request.created_at, true)}</p>
                <p>{request.testIds.map(id => request.tests?.find(test => test.testid === id)?.name || tests.find(test => test.testid === id)?.name || `Test #${id}`).join(', ')}</p>
                {request.note && <p>Your note: {request.note}</p>}
                {request.review_note && <p>Lab note: {request.review_note}</p>}
                {request.billingid && <Link href={`/patientportal/billing/${request.billingid}`}>View bill #{request.billingid}</Link>}
            </article>)}
            <div className="d-flex gap-2 mt-3">
                <Button variant="outline-secondary" disabled={page === 1 || history.loading} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="align-self-center">Page {page}</span>
                <Button variant="outline-secondary" disabled={history.loading || (history.data?.length || 0) < 50} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
        </section>
    </main>;
}
