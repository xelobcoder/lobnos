'use client';

import { useCallback, useRef, useState } from 'react';
import { publicQueueRequest, QueueBoard, queueFailure, queueProgress, queueStatusLabels } from '../../lib/walkInQueue';
import useVisiblePolling from './useVisiblePolling';

export default function QueueDisplay({ slug }: { slug: string }) {
    const [board, setBoard] = useState<QueueBoard | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const request = useRef(0);
    const refresh = useCallback(async () => {
        const current = ++request.current;
        try {
            const result = await publicQueueRequest<QueueBoard>(slug, 'display');
            if (current === request.current) { setBoard(result); setError(''); }
        } catch (failure) {
            if (current === request.current) { setError(queueFailure(failure)); setBoard(null); }
        } finally { if (current === request.current) setLoading(false); }
    }, [slug]);
    useVisiblePolling(refresh);
    const priority = { called: 0, serving: 1, waiting: 2 };
    const liveTickets = (board?.tickets || []).filter(ticket => ['called', 'serving', 'waiting'].includes(ticket.status))
        .sort((left, right) => priority[left.status as keyof typeof priority] - priority[right.status as keyof typeof priority]);
    const recentlyFinished = (board?.tickets || []).filter(ticket => ticket.status === 'completed').slice(-12).reverse();
    return <main className="min-vh-100 p-3 p-lg-5" style={{ background: '#101c30', color: '#fff' }}>
        <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div><h1 className="h2 mb-1">{board?.facility.name || 'Client queue'}</h1><p className="mb-0 opacity-75">Please watch for your ticket number.</p></div>
            <div className="text-end"><button type="button" className="btn btn-outline-light btn-sm" onClick={() => void refresh()}>Refresh display</button>{board ? <div className="small opacity-75 mt-2">Updated {new Date(board.updatedAt).toLocaleTimeString()}</div> : null}</div>
        </header>
        {loading ? <p role="status">Loading the queue…</p> : null}
        {error ? <div className="alert alert-warning" role="alert">{error}</div> : null}
        {board ? <>
            <div className="row g-3 mb-4">{[['Waiting', board.summary.waiting], ['Called', board.summary.called], ['In service', board.summary.serving], ['Finished', board.summary.completed]].map(([label, value]) => <div className="col-6 col-lg-3" key={label}><div className="rounded p-3" style={{ background: '#20324d' }}><div className="small opacity-75">{label}</div><div className="display-5 fw-semibold">{value}</div></div></div>)}</div>
            <h2 className="h4 mb-3">Called, in service & waiting</h2>
            <div className="row g-3">{liveTickets.map(ticket => {
                const progress = queueProgress(ticket);
                const active = ticket.status === 'called' || ticket.status === 'serving';
                return <article key={ticket.ticketNumber} className="col-6 col-md-4 col-xl-3">
                    <div className={`rounded border h-100 p-3 p-lg-4 ${active ? 'border-info' : 'border-secondary'}`} style={{ background: active ? '#183d56' : '#1a2940' }}>
                        <div className="display-5 fw-bold mb-2">{ticket.ticketNumber}</div>
                        <div className={`fw-semibold ${active ? 'text-info' : ''}`}>{queueStatusLabels[ticket.status]}</div>
                        {ticket.counter && active ? <div className="h4 mt-2 mb-0">{ticket.counter}</div> : null}
                        {progress.total ? <div className="mt-3"><span className="small">Tests complete: {progress.completed} / {progress.total}</span><div className="progress mt-2" role="progressbar" aria-label={`Ticket ${ticket.ticketNumber}: tests complete`} aria-valuenow={progress.completed} aria-valuemin={0} aria-valuemax={progress.total} style={{ height: 7 }}><div className="progress-bar bg-info" style={{ width: `${progress.percent}%` }} /></div></div> : null}
                    </div>
                </article>;
            })}</div>
            {!liveTickets.length ? <p className="text-center fs-4 py-4">No clients are currently waiting or in service.</p> : null}
            {recentlyFinished.length ? <section className="mt-4 pt-3 border-top border-secondary" aria-labelledby="queue-display-finished-title"><h2 id="queue-display-finished-title" className="h5 opacity-75">Recently finished</h2><div className="d-flex flex-wrap gap-2">{recentlyFinished.map(ticket => <div key={ticket.ticketNumber} className="rounded px-3 py-2" style={{ background: '#20324d' }}><span className="fw-semibold">{ticket.ticketNumber}</span> <span className="small opacity-75">Finished</span></div>)}</div></section> : null}
        </> : null}
    </main>;
}
