"use client";

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { customFetch, customFetchMutation } from '../../components/Auth/customFetch';
import { errorMessage, formatDate, unwrap } from '../../lib/patientPortal';
import { InvitationPage, InvitationResult, PortalInvitation, canReplaceInvitation, channelReason, invitationDeliveryNotice, invitationEndpoint, validateInvitationPage } from '../../lib/portalInvitations';
import styles from '../../components/PatientPortal/PortalShell.module.css';

export default function PortalInvitationsPage() {
    const [status, setStatus] = useState('pending');
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [data, setData] = useState<InvitationPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0);
    const [confirmation, setConfirmation] = useState<{ invitation: PortalInvitation; action: 'revoke' | 'resend'; channel?: 'email' | 'sms' } | null>(null);
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const [notice, setNotice] = useState<{ variant: string; text: string } | null>(null);
    const [link, setLink] = useState('');
    useEffect(() => {
        let current = true;
        setLoading(true);
        setError('');
        setData(null);
        customFetch(invitationEndpoint(status, search, page, pageSize))
            .then((response: any) => {
                const result = validateInvitationPage(unwrap<InvitationPage>(response));
                if (!current) return;
                const lastPage = Math.max(1, Math.ceil(result.total / pageSize));
                if (page > lastPage) { setPage(lastPage); return; }
                setData(result);
            })
            .catch((reason: unknown) => { if (current) setError(errorMessage(reason)); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [status, search, page, pageSize, version]);
    const submitSearch = (event: FormEvent) => { event.preventDefault(); setPage(1); setSearch(query.trim()); };
    const execute = async () => {
        if (!confirmation || pending.current) return;
        pending.current = true;
        setBusy(true);
        setNotice(null);
        setLink('');
        try {
            const { invitation, action, channel } = confirmation;
            const response = await customFetchMutation(`patient-portal/admin/invitations/${invitation.id}/${action}`, 'POST', action === 'resend' ? { channel } : undefined);
            const result = unwrap<InvitationResult>(response);
            if (action === 'resend') {
                setNotice(invitationDeliveryNotice(result));
                setLink(result.link || '');
            } else { setNotice({ variant: 'success', text: `Invitation for ${invitation.patientName} revoked. Its link can no longer activate an account.` }); }
            setConfirmation(null);
            setVersion(value => value + 1);
        } catch (reason) { setNotice({ variant: 'danger', text: errorMessage(reason) }); }
        finally { pending.current = false; setBusy(false); }
    };
    const copy = async () => {
        try { await navigator.clipboard.writeText(link); setNotice({ variant: 'success', text: 'Invitation link copied. Share it only with the intended patient.' }); }
        catch { setNotice({ variant: 'warning', text: 'Clipboard unavailable. Select and copy the link below manually.' }); }
    };
    const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
    return (
        <main aria-labelledby="invitations-title">
            <div className={styles.toolbar}><div><h1 id="invitations-title">{status === 'pending' ? 'Pending invitations' : 'Patient invitations'}</h1><p className="text-muted mb-0">Patients who were invited but have not yet activated their portal account. Use the status filter to review accepted, expired or revoked invitations.</p></div><Link className="btn btn-primary align-self-start" href="/patient-portal-admin/access">Invite a patient</Link></div>
            {notice && <Alert variant={notice.variant} role={notice.variant === 'danger' ? 'alert' : 'status'} onClose={() => setNotice(null)} dismissible>{notice.text}</Alert>}
            {link && <section className="mb-3 border-bottom pb-3" aria-label="New invitation link"><label htmlFor="replacement-link" className="form-label">New single-use invitation link</label><div className="d-flex flex-wrap gap-2"><input id="replacement-link" className="form-control" style={{ flex: '1 1 320px' }} readOnly value={link} onFocus={e => e.target.select()} /><Button variant="outline-secondary" onClick={copy}>Copy link</Button><Button variant="link" onClick={() => setLink('')}>Hide link</Button></div><p className="small text-muted mt-1 mb-0">Treat this link as a credential. Do not share it in public messages.</p></section>}
            <Form onSubmit={submitSearch} role="search" className={`${styles.panel} ${styles.filters}`}>
                <div className="flex-grow-1"><Form.Label htmlFor="invitation-search">Patient name or number</Form.Label><Form.Control id="invitation-search" value={query} maxLength={150} onChange={e => setQuery(e.target.value)} placeholder="Search all matching invitations" /></div>
                <Button type="submit">Search</Button>
                <div><Form.Label htmlFor="invitation-status">Status</Form.Label><Form.Select id="invitation-status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['pending', 'accepted', 'expired', 'revoked', 'all'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</Form.Select></div>
                <div><Form.Label htmlFor="invitation-size">Rows per page</Form.Label><Form.Select id="invitation-size" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>{[20, 50, 100].map(value => <option key={value}>{value}</option>)}</Form.Select></div>
                <Button variant="outline-secondary" disabled={loading} onClick={() => setVersion(value => value + 1)}>Refresh</Button>
            </Form>
            <div aria-busy={loading}>
                {loading && <p role="status"><Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />Loading invitations…</p>}
                {error && <Alert variant="danger" role="alert">{error} <Button variant="outline-danger" size="sm" onClick={() => setVersion(value => value + 1)}>Retry</Button></Alert>}
                {!loading && !error && data && <>
                    <p className="small text-muted">{data.total.toLocaleString()} matching invitations · Page {data.page} of {pages}</p>
                    {data.invitations.length === 0 ? <p className="py-4 text-muted">No {status === 'all' ? '' : `${status} `}invitations{search ? ' match your search' : ' to display'}. Use Patient access to create an invitation.</p> : <Table responsive hover>
                        <thead><tr><th scope="col">Patient</th><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Expires</th><th scope="col">Accepted / revoked</th><th scope="col">Actions</th></tr></thead>
                        <tbody>{data.invitations.map(invitation => <tr key={invitation.id}>
                            <td><strong>{invitation.patientName || 'Patient'}</strong><div className="small">{invitation.patientNumber || invitation.patientid}</div></td>
                            <td>{invitation.email || 'No email on record'}</td>
                            <td><span className={`${styles.status} ${styles[`status${invitation.status[0].toUpperCase()}${invitation.status.slice(1)}`] || ''}`}>{invitation.status[0].toUpperCase() + invitation.status.slice(1)}</span></td>
                            <td>{formatDate(invitation.created_at, true)}<div className="small text-muted">By {invitation.invitedBy || (invitation.created_by ? `Staff #${invitation.created_by}` : 'Unknown staff')}</div></td><td>{formatDate(invitation.expires_at, true)}</td><td>{formatDate(invitation.accepted_at || invitation.revoked_at, true)}</td>
                            <td><div className="d-flex gap-2 flex-wrap">{canReplaceInvitation(invitation.status) && (['email', 'sms'] as const).map(channel => <div key={channel}><Button size="sm" variant="outline-primary" disabled={busy || !!channelReason(invitation.channels, channel)} title={channelReason(invitation.channels, channel) || undefined} onClick={() => { setLink(''); setNotice(null); setConfirmation({ invitation, action: 'resend', channel }); }}>Resend {channel === 'email' ? 'email' : 'SMS'}</Button>{channelReason(invitation.channels, channel) && <div className="small text-muted">{channelReason(invitation.channels, channel)}</div>}</div>)}{invitation.status === 'pending' && <Button size="sm" variant="outline-danger" disabled={busy} onClick={() => setConfirmation({ invitation, action: 'revoke' })}>Revoke</Button>}{!canReplaceInvitation(invitation.status) && <span className="text-muted">No actions available</span>}</div></td>
                        </tr>)}</tbody>
                    </Table>}
                    <nav aria-label="Invitation pagination" className="d-flex align-items-center gap-3"><Button variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {data.page} of {pages}</span><Button variant="outline-secondary" disabled={page >= pages} onClick={() => setPage(value => value + 1)}>Next</Button></nav>
                </>}
            </div>
            <Modal show={!!confirmation} onHide={() => { if (!busy) setConfirmation(null); }} backdrop="static" centered>
                <Modal.Header closeButton={!busy}><Modal.Title className="h5">{confirmation?.action === 'revoke' ? 'Revoke invitation' : 'Replace invitation'}</Modal.Title></Modal.Header>
                <Modal.Body><p>Patient: <strong>{confirmation?.invitation.patientName}</strong> ({confirmation?.invitation.patientNumber})</p><p>{confirmation?.action === 'revoke' ? 'This permanently invalidates this activation link. A new invitation will be needed if the patient still needs access.' : `This invalidates the previous link and creates a new single-use invitation sent by ${confirmation?.channel?.toUpperCase()}. Provider acceptance does not confirm delivery. If sending fails, copy and share the new link securely. Wait at least 60 seconds before another send.`}</p><p className="small text-muted mb-0">This action is recorded in portal activity.</p>{notice?.variant === 'danger' && <Alert variant="danger" className="mt-3">{notice.text}</Alert>}</Modal.Body>
                <Modal.Footer><Button variant="outline-secondary" disabled={busy} onClick={() => setConfirmation(null)}>Cancel</Button><Button variant={confirmation?.action === 'revoke' ? 'danger' : 'primary'} disabled={busy} onClick={execute}>{busy ? 'Working…' : confirmation?.action === 'revoke' ? 'Revoke invitation' : 'Create replacement'}</Button></Modal.Footer>
            </Modal>
        </main>
    );
}
