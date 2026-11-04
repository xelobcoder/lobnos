'use client';

import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { hasPendingSms, responseData, smsStatusTone, validHistory, smsErrorMessage, type ResultSmsHistory } from "../../../../../lib/resultSmsWorkspace";
import styles from "./ResultSms.module.css";

type Props = {
    billingid: string;
    refreshRevision: number;
    sending: boolean;
    uncertain: boolean;
    onHistoryReviewed: () => void;
};

function timestamp(value: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function SentMessagesTable({ billingid, refreshRevision, sending, uncertain, onHistoryReviewed }: Props) {
    const [history, setHistory] = useState<ResultSmsHistory | null>(null);
    const [page, setPage] = useState(1);
    const [revision, setRevision] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reviewAvailable, setReviewAvailable] = useState(false);

    useEffect(() => {
        // Show the newest records after a send attempt (including uncertain outcomes).
        setPage(1);
        setReviewAvailable(false);
    }, [billingid, refreshRevision]);

    useEffect(() => {
        if (!/^[1-9]\d*$/.test(billingid)) return;
        let cancelled = false;
        setLoading(true);
        setReviewAvailable(false);
        void (async () => {
            try {
                const data = responseData<ResultSmsHistory>(await customFetch(
                    `sms/events/result-ready/history?${new URLSearchParams({ billingid, page: String(page), count: "10" })}`,
                ));
                if (!validHistory(data) || data.page !== page) throw new Error("Invalid message history response.");
                if (cancelled) return;
                const lastPage = Math.max(1, Math.ceil(data.total / data.count));
                if (page > lastPage) {
                    setPage(lastPage);
                    return;
                }
                setHistory(data);
                setError("");
                setReviewAvailable(true);
            } catch (failure) {
                if (!cancelled) setError(smsErrorMessage(failure, "Unable to refresh message history."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [billingid, page, revision, refreshRevision]);

    useEffect(() => {
        // One bounded timer after a successful fetch. Failures stop automatic polling.
        if (loading || error || !history || !hasPendingSms(history.items)) return;
        const timer = setTimeout(() => setRevision(value => value + 1), 15000);
        return () => clearTimeout(timer);
    }, [history, loading, error]);

    const lastPage = Math.max(1, Math.ceil((history?.total || 0) / 10));
    return <aside className={styles.panel} aria-label="SMS notification history">
        <div className={styles.sectionHeader}>
            <h2>Message history</h2>
            <Button size="sm" variant="outline-secondary" disabled={loading || sending || !billingid}
                onClick={() => { setReviewAvailable(false); setRevision(value => value + 1); }}>Refresh history</Button>
        </div>
        <p className={styles.hint}>Provider status is shown as reported. Sent does not mean delivered.</p>
        {loading && <p role="status"><Spinner as="span" size="sm" animation="border" /> Refreshing history…</p>}
        {error && <p className="alert alert-danger" role="alert">{error} Previous records, if shown, may be out of date. Use Refresh history.</p>}
        <div className={styles.historyList} aria-busy={loading}>
            {history?.items.map(item => <article key={item.id} className={styles.historyItem}>
                <div className={styles.sectionHeader}>
                    <strong>Notification #{item.jobid}</strong>
                    <span className={`badge text-bg-${smsStatusTone(item.status)}`}>{item.status || "unknown"}</span>
                </div>
                <p className={styles.message}>{item.message}</p>
                <dl className={styles.times}>
                    <dt>Queued</dt><dd>{timestamp(item.queuedAt)}</dd>
                    <dt>Sent</dt><dd>{timestamp(item.sentAt)}</dd>
                    <dt>Last checked</dt><dd>{timestamp(item.lastCheckedAt)}</dd>
                </dl>
                {item.error && <p className={styles.failure}>Reason: {item.error}</p>}
            </article>)}
            {history && !history.items.length && !error && <p>No notifications recorded for this bill.</p>}
        </div>
        <nav className={styles.pagination} aria-label="Message history pages">
            <Button size="sm" variant="outline-secondary" disabled={loading || sending || page <= 1}
                onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button>
            <span>Page {page} of {lastPage}{history ? ` · ${history.total} total` : ""}</span>
            <Button size="sm" variant="outline-secondary" disabled={loading || sending || page >= lastPage}
                onClick={() => setPage(value => Math.min(lastPage, value + 1))}>Next</Button>
        </nav>
        {uncertain && <Button className="mt-3" size="sm" variant="outline-primary" disabled={!reviewAvailable || loading || Boolean(error) || sending}
            onClick={onHistoryReviewed}>I reviewed refreshed history</Button>}
    </aside>;
}
