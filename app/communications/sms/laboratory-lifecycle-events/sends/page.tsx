'use client';

import { useSearchParams } from "next/navigation";
import { Button, Spinner } from "react-bootstrap";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { readinessLabels, smsStatusTone } from "../../../../../lib/resultSmsWorkspace";
import SentMessagesTable from "./SentMessagesTable";
import { useResultSmsWorkspace } from "./useResultSmsWorkspace";
import styles from "./ResultSms.module.css";

export default function SendLabLifecycleSMS() {
    const params = useSearchParams();
    const application = useApplication();
    const billingid = params?.get("billingid") || "";
    const patientid = params?.get("patientid") || "";
    const linkedId = params?.get("ascensionid") || "";
    const imaging = params?.get("service") === "imaging";
    // A new context gets a new component instance: no preview or request crosses
    // branch/tenant/user boundaries, including nested application identity changes.
    const identity = JSON.stringify([application, billingid, patientid, linkedId, imaging]);
    return <ResultSmsWorkspaceView key={identity} billingid={billingid} patientid={patientid} linkedId={linkedId} imaging={imaging} />;
}

export function ResultSmsWorkspaceView({ billingid, patientid, linkedId, imaging }: {
    billingid: string; patientid: string; linkedId: string; imaging: boolean;
}) {
    const sms = useResultSmsWorkspace(billingid, patientid, linkedId);
    const ready = sms.workspace?.tests.filter(test => test.status === "ready") || [];
    const selectedTests = sms.workspace?.tests.filter(test => sms.selected.includes(test.ascensionid)) || [];
    const linked = sms.workspace?.tests.find(test => String(test.ascensionid) === linkedId);
    return (
        <main className={styles.workspace}>
            <header className={styles.header}>
                <div>
                    <h1>{imaging ? "Imaging result SMS" : "Result-ready SMS"}</h1>
                    <p>Notify about selected ready tests now. Other tests can remain pending.</p>
                </div>
                <span className={styles.bill}>Bill #{billingid || "—"}</span>
            </header>
            <div className={styles.grid}>
                <section className={styles.panel} aria-label="Result SMS composer" aria-busy={sms.loading || sms.sending}>
                    <div className={styles.sectionHeader}>
                        <h2>Recipient &amp; results</h2>
                        <Button size="sm" variant="outline-secondary" disabled={sms.sending || sms.loading} onClick={sms.refreshWorkspace}>Refresh results</Button>
                    </div>
                    {sms.loading && <p role="status"><Spinner as="span" animation="border" size="sm" /> Loading results…</p>}
                    {sms.loadError && <p className="alert alert-danger" role="alert">{sms.loadError}</p>}
                    {sms.workspace && <>
                        <div className={styles.summary}>
                            <strong>{sms.workspace.patient.name}</strong>
                            <span>Saved phone: {sms.workspace.patient.phone || "Not available"}</span>
                            <span>{ready.length} ready · {sms.workspace.tests.length - ready.length} not ready</span>
                        </div>
                        {(!sms.workspace.smsAvailable || !sms.workspace.patient.phone) && <p className="alert alert-warning" role="alert">
                            {sms.workspace.smsUnavailableReason || "SMS is unavailable: no saved patient phone."}
                        </p>}
                        {linkedId && <p className={styles.context}>
                            {linked ? <>Opened for: <strong>{linked.name}</strong> · {readinessLabels[linked.status] || linked.status}.
                                {linked.status !== "ready" && " This test was not selected. Choose other ready tests explicitly if appropriate."}</>
                                : "The linked test is not in this bill. No other tests were automatically selected."}
                        </p>}
                        <fieldset disabled={sms.sending} className={styles.fieldset}>
                            <legend>Select ready tests</legend>
                            <div className={styles.actions}>
                                <Button size="sm" variant="outline-primary" disabled={!ready.length} onClick={() => sms.changeSelection(ready.map(test => test.ascensionid))}>Select all ready</Button>
                                <Button size="sm" variant="outline-secondary" disabled={!sms.selected.length} onClick={() => sms.changeSelection([])}>Clear selection</Button>
                                <span>{sms.selected.length} selected</span>
                            </div>
                            <ul className={styles.testList}>
                                {sms.workspace.tests.map(test => <li key={test.ascensionid} className={String(test.ascensionid) === linkedId ? styles.linked : undefined}>
                                    <label className={styles.testRow}>
                                        <input type="checkbox" disabled={test.status !== "ready" || sms.sending}
                                            checked={sms.selected.includes(test.ascensionid)}
                                            onChange={event => sms.changeSelection(event.target.checked ? [...sms.selected, test.ascensionid] : sms.selected.filter(id => id !== test.ascensionid))} />
                                        <span><strong>{test.name}</strong>
                                            <small>{readinessLabels[test.status] || test.status}{test.reason ? ` · ${test.reason}` : ""}</small>
                                        </span>
                                        <span className={`badge text-bg-${test.status === "ready" ? "success" : "secondary"}`}>{test.status === "ready" ? "Ready" : "Not ready"}</span>
                                    </label>
                                </li>)}
                            </ul>
                            {!sms.workspace.tests.length && <p>No ordered tests found for this bill.</p>}
                            <label htmlFor="result-sms-note" className={styles.noteLabel}>Optional custom note</label>
                            <textarea id="result-sms-note" className="form-control" rows={3} maxLength={1000} value={sms.note}
                                onChange={event => sms.changeNote(event.target.value)} aria-describedby="result-sms-note-help" />
                            <p id="result-sms-note-help" className={styles.hint}>
                                Appended after the mandatory ready-test names; not a full message override. Leave blank for default collection/contact instructions. {sms.note.length}/1000
                            </p>
                        </fieldset>
                        <div className={styles.scope}>
                            <strong>SMS scope</strong>
                            <p>To {sms.workspace.patient.name} · {sms.preview?.phone || sms.workspace.patient.phone || "No saved phone"}</p>
                            <p>{selectedTests.length ? selectedTests.map(test => test.name).join(", ") : "No tests selected."}</p>
                            <small>Only selected ready tests are included; this bill may contain other services.</small>
                        </div>
                        <Button variant="outline-primary" disabled={!sms.eligible || sms.previewing || sms.sending || sms.uncertain}
                            onClick={sms.requestPreview}>
                            {sms.previewing ? <><Spinner as="span" animation="border" size="sm" /> Preparing preview…</> : "Preview SMS"}
                        </Button>
                        {sms.preview && <section className={styles.preview} aria-label="Message preview">
                            <h2>Review the exact SMS</h2>
                            <p className={styles.message}>{sms.preview.message}</p>
                            <p className={styles.hint}>
                                {sms.preview.encoding} · {sms.preview.segments} segment(s)
                                {typeof sms.preview.units === "number" && Number.isFinite(sms.preview.units) ? ` · ${sms.preview.units} unit(s)` : ""}
                                {" · "}{sms.preview.pendingCount} other test(s) awaiting completion/release
                            </p>
                            <label className={styles.confirm}>
                                <input type="checkbox" checked={sms.confirmed} disabled={sms.sending} onChange={event => sms.confirm(event.target.checked)} />
                                I confirm the recipient, selected tests and message above.
                            </label>
                            <Button disabled={!sms.confirmed || sms.sending || sms.uncertain} onClick={sms.send}>
                                {sms.sending ? <><Spinner as="span" animation="border" size="sm" /> Sending request…</> : "Send confirmed SMS"}
                            </Button>
                        </section>}
                    </>}
                    {sms.actionError && <p className="alert alert-danger mt-3" role="alert">{sms.actionError}</p>}
                    {sms.uncertain && <p className={styles.hint}>Sending is paused. Refresh and review history, then acknowledge that review before preparing another preview.</p>}
                    {sms.confirmation && <div className={styles.receipt} role="status">
                        <strong>Notification #{sms.confirmation.jobid}</strong>{" "}
                        <span className={`badge text-bg-${smsStatusTone(sms.confirmation.status)}`}>{sms.confirmation.status || "unknown"}</span>
                        <p>This may reuse an existing notification for the same selection and approved revisions. Status is not a guarantee of delivery.</p>
                    </div>}
                </section>
                <SentMessagesTable billingid={billingid} refreshRevision={sms.historyRevision} sending={sms.sending}
                    uncertain={sms.uncertain} onHistoryReviewed={sms.acknowledgeHistoryReview} />
            </div>
        </main>
    );
}
