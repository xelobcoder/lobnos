'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { checkInBody, createQueueRetryKey, publicQueueRequest, PublicQueueConfig, QueueTicket, queueFailure } from '../../lib/walkInQueue';

export default function PublicQueueCheckIn({ slug }: { slug: string }) {
    const [config, setConfig] = useState<PublicQueueConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [busy, setBusy] = useState(false);
    const [ticket, setTicket] = useState<QueueTicket | null>(null);
    const retry = useRef<{ fingerprint: string; key: string } | null>(null);
    const submitLock = useRef(false);
    const [reload, setReload] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        setConfig(null);
        void publicQueueRequest<PublicQueueConfig>(slug, 'config')
            .then(result => { if (active) setConfig(result); })
            .catch(failure => { if (active) setError(queueFailure(failure)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [slug, reload]);
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (submitLock.current || !config?.settings.publicEnabled) return;
        setError('');
        submitLock.current = true;
        setBusy(true);
        try {
            const fingerprint = JSON.stringify([name.trim(), phone.trim()]);
            if (retry.current?.fingerprint !== fingerprint) retry.current = { fingerprint, key: createQueueRetryKey() };
            const body = checkInBody(name, phone, retry.current.key);
            const result = await publicQueueRequest<{ ticket: QueueTicket }>(slug, 'tickets', body);
            if (!result.ticket?.ticketNumber) throw new Error('Your ticket could not be confirmed. Please retry with the same details.');
            setTicket(result.ticket);
        } catch (failure) { setError(queueFailure(failure)); }
        finally { submitLock.current = false; setBusy(false); }
    };
    const next = () => { setTicket(null); setName(''); setPhone(''); setError(''); retry.current = null; };
    return <main className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'var(--bs-tertiary-bg)' }}>
        <section className="card border-0 shadow-sm w-100" style={{ maxWidth: 520 }} aria-labelledby="queue-checkin-title">
            <div className="card-body p-4 p-md-5">
                <div className="small text-uppercase text-primary fw-semibold mb-2">Welcome · Walk-in check-in</div>
                <h1 id="queue-checkin-title" className="h3">{config?.facility.name || 'Facility queue'}</h1>
                {loading ? <p role="status">Loading check-in…</p> : null}
                {error ? <div className="alert alert-danger" role="alert">{error}{!config ? <button type="button" className="btn btn-sm btn-outline-danger d-block mt-2" onClick={() => setReload(value => value + 1)}>Try again</button> : null}</div> : null}
                {ticket ? <div className="text-center" role="status">
                    <p className="mt-4 mb-1">You are checked in. Your ticket is</p>
                    <p className="display-2 fw-bold text-primary mb-2">{ticket.ticketNumber}</p>
                    <p className="text-muted">Arrived {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please wait for your ticket number to be called.</p>
                    <p className="small">Keep this number or take a screenshot.</p>
                    <button type="button" className="btn btn-outline-secondary mt-3" onClick={next}>Check in another person</button>
                </div> : config?.settings.publicEnabled ? <form onSubmit={submit} className="mt-4" aria-busy={busy}>
                    <p className="text-muted">Enter your name and phone number to join today’s queue.</p>
                    <label htmlFor="queue-visitor-name" className="form-label">Your name</label>
                    <input id="queue-visitor-name" className="form-control mb-3" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required maxLength={160} disabled={busy} />
                    <label htmlFor="queue-visitor-phone" className="form-label">Phone number</label>
                    <input id="queue-visitor-phone" className="form-control mb-4" type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} required minLength={7} maxLength={30} disabled={busy} />
                    <button type="submit" className="btn btn-primary w-100 py-2" disabled={busy}>{busy ? 'Confirming your ticket…' : 'Join the queue'}</button>
                </form> : config ? <div className="alert alert-info mt-4" role="status">Online check-in is currently closed. Please speak to reception.</div> : null}
            </div>
        </section>
    </main>;
}
