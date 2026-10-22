'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { formatDate } from '../../../lib/patientPortal';
import styles from '../../../components/PatientPortal/portal.module.css';

interface Sample {
    id: number; sampleUid: string; barcode: string; billingid: number; status: string; sampleType: string; containerType: string;
    replacesSampleId: number | null; createdAt: string; collectedAt: string | null; rejectedAt: string | null; rejectionReason: string | null;
    replacement?: { id: number; sampleUid: string; status: string } | null;
}
interface History {
    sample: Sample; lineage: Sample[];
    events: Array<{ id: number; sampleId: number; sampleUid: string; type: string; status: string; createdAt: string; reason: string | null }>;
    communications: Array<{ sampleUid: string; message: string; status: string; createdAt: string }>;
}
const words = (value: string) => value.replace(/_/g, ' ');
const rejected = (sample: Sample) => ['rejected', 'recollection_required'].includes(sample.status);

export default function PatientSamplesPage() {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<number | null>(null);
    const list = usePortalResource<{ items: Sample[]; page: number; total: number; totalPages: number }>(`patient-portal/samples?page=${page}`);
    const history = usePortalResource<History>(selected ? `patient-portal/samples/${selected}` : null);
    return <main className={styles.page}>
        <div className={styles.header}><div><h1 className={styles.title}>Samples & recollection</h1><p className={styles.subtitle}>See collection, rejection and replacement history for your samples.</p></div><button className="btn btn-outline-primary" type="button" onClick={() => { list.reload(); if (selected) history.reload(); }}>Refresh</button></div>
        {list.loading && <p role="status">Loading your samples...</p>}
        {list.error && <div role="alert" className="alert alert-danger">{list.error}<button className="btn btn-link" onClick={list.reload}>Retry</button></div>}
        {list.data && <>
            <div className="d-flex flex-column gap-3">{list.data.items.map(sample => {
                const replacement = sample.replacement || list.data!.items.find(item => item.replacesSampleId === sample.id);
                return <article key={sample.id} className={`border rounded p-3 ${rejected(sample) ? 'border-danger' : ''}`}>
                <div className="d-flex justify-content-between gap-3 flex-wrap"><div><strong>{sample.sampleUid}</strong><div>{sample.sampleType} / {sample.containerType}</div><small className="text-muted">Visit #{sample.billingid} · Collected {formatDate(sample.collectedAt, true)}</small></div><strong className={`text-capitalize ${rejected(sample) ? 'text-danger' : ''}`}>{words(sample.status)}</strong></div>
                {sample.replacesSampleId && <p className="small mt-2 mb-0">Replacement for sample #{sample.replacesSampleId}. Its earlier collection and rejection remain in the history.</p>}
                {rejected(sample) && <div className={`alert ${replacement ? 'alert-info' : 'alert-warning'} mt-3`}><strong>{replacement ? `Replacement ${replacement.sampleUid}: ${words(replacement.status)}` : 'A new sample may be needed.'}</strong>{sample.rejectionReason && <p className="mb-1">Reason: {sample.rejectionReason}</p>}{!replacement && <><p className="mb-2">Contact the laboratory to arrange recollection. Staff record the replacement when they collect it.</p><Link href="/patientportal/appointments" className="btn btn-sm btn-outline-primary">Arrange recollection</Link></>}</div>}
                <button className="btn btn-sm btn-outline-secondary mt-2" type="button" onClick={() => setSelected(sample.id)}>View sample history</button>
            </article>; })}</div>
            {!list.data.items.length && <p className="text-muted py-4">No physical samples have been recorded for you yet.</p>}
            <div className="d-flex justify-content-between align-items-center mt-3"><button type="button" className="btn btn-outline-secondary" disabled={page <= 1 || list.loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {Math.max(1, list.data.totalPages)}</span><button type="button" className="btn btn-outline-secondary" disabled={page >= list.data.totalPages || list.loading} onClick={() => setPage(value => value + 1)}>Next</button></div>
        </>}
        {selected && <section aria-labelledby="sample-history-title" className="border rounded p-3 mt-4">
            <div className="d-flex justify-content-between"><h2 id="sample-history-title" className="h5">Collection and replacement history</h2><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>Close history</button></div>
            {history.loading && <p role="status">Loading sample history...</p>}
            {history.error && <div role="alert" className="alert alert-danger">{history.error}<button type="button" className="btn btn-link" onClick={history.reload}>Retry</button></div>}
            {history.data && <>
                <ol>{history.data.lineage.map(sample => <li key={sample.id} className="mb-2"><strong>{sample.sampleUid}</strong> — <span className="text-capitalize">{words(sample.status)}</span>{sample.replacesSampleId ? ` (replaces sample #${sample.replacesSampleId})` : ' (original container)'}{sample.rejectionReason && <div className="text-danger">{sample.rejectionReason}</div>}</li>)}</ol>
                <h3 className="h6">Timeline</h3><ol>{history.data.events.map(event => <li key={event.id} className="mb-2"><strong>{event.sampleUid}</strong> · <span className="text-capitalize">{words(event.type)}</span><div className="small text-muted">{formatDate(event.createdAt, true)}</div>{event.reason && <p>{event.reason}</p>}</li>)}</ol>
                {!!history.data.communications.length && <><h3 className="h6">Recollection messages</h3>{history.data.communications.map((message, index) => <div key={index} className="border-top py-2"><p className="mb-1">{message.message}</p><small>{message.sampleUid} · {formatDate(message.createdAt, true)} · {words(message.status)}</small></div>)}</>}
            </>}
        </section>}
    </main>;
}
