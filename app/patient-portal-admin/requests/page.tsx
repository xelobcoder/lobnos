"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { customFetchMutation } from '../../../components/Auth/customFetch';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { errorMessage, formatDate, unwrap } from '../../../lib/patientPortal';
import { plsEncryption } from '../../../lib/encryption';
import { PatientBillingRequest, requestReviewUrl } from '../../../lib/patientBillingRequests';

export default function StaffTestRequestsPage() {
    const [page, setPage] = useState(1);
    const requests = usePortalResource<PatientBillingRequest[]>(`patient-portal/admin/billing-requests?page=${page}`);
    const [rejecting, setRejecting] = useState<PatientBillingRequest | null>(null);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    async function reject() {
        if (!rejecting || busy) return;
        setBusy(true);
        setError('');
        try {
            unwrap(await customFetchMutation(`patient-portal/admin/billing-requests/${rejecting.id}/reject`, 'POST', { note }));
            setRejecting(null);
            setNotice('Request declined. The patient can see your review note.');
            requests.reload();
        } catch (reason) { setError(errorMessage(reason, 'Unable to decline request.')); }
        finally { setBusy(false); }
    }

    return <main className="container-fluid py-4">
        <h1 className="h3">Patient test requests</h1>
        <p>Review patient selections in the existing General billing composer. Opening a request does not accept it or create a bill. Saving the bill converts the request atomically.</p>
        <Alert variant="info">Tests only. Confirm availability and explain current prices to the patient. Save without payment to create the reviewed bill, then use the normal staff payment workflow if needed.</Alert>
        {notice && <Alert variant="success" role="status">{notice}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {requests.error && <Alert variant="danger">{requests.error}</Alert>}
        <Button variant="outline-secondary" className="mb-3" disabled={requests.loading} onClick={requests.reload}>Refresh requests</Button>
        {requests.loading ? <Spinner animation="border" /> : <Table responsive striped>
            <thead><tr><th>Request</th><th>Patient</th><th>Tests / note</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{requests.data?.map(request => <tr key={request.id}>
                <td>#{request.id}<br /><small>{formatDate(request.created_at, true)}</small></td>
                <td>{request.firstname} {request.lastname}<br /><small>{request.fullpatientid || `Patient #${request.patientid}`}</small></td>
                <td>{request.testIds.length} test(s): {(request.tests?.map(test => test.name) || request.testIds.map(id => `Test #${id}`)).join(', ')}<br />{request.note}
                    {request.review_note && <p>Review: {request.review_note}</p>}</td>
                <td>{request.status === 'submitted' ? 'Awaiting review' : request.status}
                    {request.billingid && <p>Bill #{request.billingid}</p>}</td>
                <td>{request.status === 'submitted' && <div className="d-flex gap-2 flex-wrap">
                    <Link className="btn btn-primary btn-sm" href={requestReviewUrl(plsEncryption(String(request.patientid)), request.id)}>Review / create General bill</Link>
                    <Button size="sm" variant="outline-danger" onClick={() => { setRejecting(request); setNote(''); setError(''); }}>Decline</Button>
                </div>}</td>
            </tr>)}</tbody>
        </Table>}
        {requests.data?.length === 0 && <p>No requests on this page.</p>}
        <div className="d-flex gap-2 mt-3">
            <Button variant="outline-secondary" disabled={page === 1 || requests.loading} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="align-self-center">Page {page}</span>
            <Button variant="outline-secondary" disabled={requests.loading || (requests.data?.length || 0) < 50} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
        <Modal show={Boolean(rejecting)} onHide={() => !busy && setRejecting(null)}>
            <Modal.Header closeButton><Modal.Title>Decline request #{rejecting?.id}?</Modal.Title></Modal.Header>
            <Modal.Body><Form.Group controlId="request-review-note">
                <Form.Label>Reason / note for the patient</Form.Label>
                <Form.Control as="textarea" maxLength={1000} value={note} onChange={e => setNote(e.target.value)} disabled={busy} />
            </Form.Group></Modal.Body>
            <Modal.Footer><Button variant="secondary" disabled={busy} onClick={() => setRejecting(null)}>Cancel</Button>
                <Button variant="danger" disabled={busy} onClick={() => void reject()}>{busy ? 'Saving…' : 'Decline request'}</Button></Modal.Footer>
        </Modal>
    </main>;
}
