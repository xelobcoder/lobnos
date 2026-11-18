'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { controlApi } from '../../../../../../components/operations/OperationalControlsWorkspace';
import ReportAmendmentNotice, { ReportChangesReview, ReportChangesTable, type ReportChange, type ReportVersion } from '../../../../../../components/ResultView/ReportAmendmentNotice';
import { ReportContent, containsReportMarkup, containsReportMarkdown } from '../../../../../../components/ResultView/ReportRichText';
import styles from './page.module.css';

type Amendment = { revision: number; reviewHash: string; changes: ReportChange[]; isUltrasound?: boolean };
type Archived = ReportVersion & { report: any };

export default function ReportHistory() {
     const { ascensionid } = useParams<{ ascensionid: string }>();
     const base = `reports/${Number(ascensionid)}`;
     const [versions, setVersions] = useState<ReportVersion[]>([]);
     const [selected, setSelected] = useState<Archived | null>(null);
     const [canSign, setCanSign] = useState(false);
     const [draft, setDraft] = useState<Amendment | null>(null);
     const [reason, setReason] = useState('');
     const [confirmed, setConfirmed] = useState(false);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState('');
     const [notice, setNotice] = useState('');
     const [isUltrasound, setIsUltrasound] = useState(false);
     const [requireAmendmentSignoff, setRequireAmendmentSignoff] = useState(true);
     const lock = useRef(false);
     async function load() {
          const data = await controlApi(`${base}/versions`);
          setVersions(data.versions);
          setCanSign(data.canSign);
          setIsUltrasound(Boolean(data.isUltrasound));
          setRequireAmendmentSignoff(data.requireAmendmentSignoff !== false);
          if (data.versions.length) {
               setSelected(await controlApi(`${base}/versions/${data.versions[0].version}`));
          } else {
               setSelected(null);
          }
     }
     async function run(action: () => Promise<void>) {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          setError('');
          try { await action(); }
          catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to load report history'); }
          finally { setBusy(false); lock.current = false; }
     }
     useEffect(() => { void run(load); }, [base]);
     const currentVersion = versions[0]?.version;
     const records = selected?.report.records || [];
     const hasRichTextReport = records.some((row: any) => containsReportMarkup(row.value));
     const isUltrasoundReport = Boolean(draft?.isUltrasound || selected?.isUltrasound || isUltrasound ||
          /(?:ultrasound|\busg\b)/i.test(selected?.report.testname || ''));
     return <main className={styles.page}>
          <header className={styles.pageHeader}>
               <div>
                    <p className={styles.eyebrow}>LABORATORY OPERATIONS</p>
                    <h1>Report history</h1>
                    <p className={styles.subtitle}>Review archived results and manage report amendments.</p>
               </div>
               <div className={styles.testBadge}>Ordered test <strong>#{ascensionid}</strong></div>
          </header>
          {error && <div role="alert" className={styles.error}>{error}</div>}
          {notice && <div role="status" className={styles.success}>{notice}</div>}
          <div className={styles.workspace}>
               <aside className={styles.sidebar}>
                    <section className={styles.panel}>
                         <div className={styles.panelHeading}>
                              <div>
                                   <h2>Archived versions</h2>
                                   <p>{versions.length ? `${versions.length} saved ${versions.length === 1 ? 'version' : 'versions'}` : 'Version timeline'}</p>
                              </div>
                         </div>
                         {!busy && !versions.length && <p className={styles.empty}>There are no saved releases for this result. Earlier reports only appear here if they were archived at release.</p>}
                         {busy && !versions.length && <p className={styles.loading} role="status">Loading report history…</p>}
                         <div className={styles.versionList}>
                              {versions.map((item, index) => <button type="button" key={item.version}
                                   className={styles.versionButton}
                                   aria-pressed={selected?.version === item.version}
                                   data-selected={selected?.version === item.version}
                                   disabled={busy} onClick={() => run(async () => setSelected(await controlApi(`${base}/versions/${item.version}`)))}>
                                   <span className={styles.versionMarker} aria-hidden="true" />
                                   <span className={styles.versionText}>
                                        <strong>Version {item.version}</strong>
                                        <span>{item.version === 1 ? 'Original report' : 'Amended report'}</span>
                                   </span>
                                   {index === 0 && <span className={styles.latestBadge}>Latest</span>}
                              </button>)}
                         </div>
                         {canSign && <button type="button" className={styles.reviewButton} disabled={busy}
                              onClick={() => run(async () => { setDraft(await controlApi(`${base}/amendment`)); setReason(''); setConfirmed(false); })}>Review pending amendment</button>}
                         {!requireAmendmentSignoff && <p className={styles.signoffOff} role="status">Facility policy does not require amendment sign-off. After revalidation, the amended report can be printed without a separate signature.</p>}
                    </section>
               </aside>
               <div className={styles.content}>
                    {draft && <section className={`${styles.panel} ${styles.reviewPanel}`}>
                         <div className={styles.panelHeading}>
                              <div>
                                   <p className={styles.eyebrow}>PENDING ACTION</p>
                                   <h2>Review and sign amendment</h2>
                              </div>
                              <span className={styles.reviewBadge}>Review required</span>
                         </div>
                         {draft.isUltrasound ? <ReportChangesReview changes={draft.changes} /> : <ReportChangesTable changes={draft.changes} />}
                         <form onSubmit={event => { event.preventDefault(); void run(async () => {
                              const signed = await controlApi(`${base}/amendment`, 'POST', { revision: draft.revision, reviewHash: draft.reviewHash, reason, confirmed });
                              setDraft(null);
                              setNotice(`Amended report version ${signed.version} signed.`);
                              await load();
                         }); }}>
                              <label className={styles.formLabel}>Reason for amendment
                                   <textarea required minLength={3} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} />
                              </label>
                              <label className={styles.confirmLabel}><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> <span>I reviewed these changes and sign this amendment under my staff account.</span></label>
                              <button className={styles.primaryButton} type="submit" disabled={busy || !confirmed || reason.trim().length < 3}>Sign amendment</button>
                         </form>
                    </section>}
                    {selected && <section className={`${styles.panel} ${styles.reportPanel}`}>
                         <header className={styles.reportHeader}>
                              <div>
                                   <p className={styles.eyebrow}>ARCHIVED RESULT</p>
                                   <h2>{selected.report.testname}</h2>
                              </div>
                              <div className={styles.reportVersion}>
                                   <strong>Version {selected.version}</strong>
                                   <span>{selected.version === currentVersion ? 'Latest report' : 'Superseded · retained for reference'}</span>
                              </div>
                         </header>
                         <div className={styles.patientMeta}>
                              <div><span>Patient ID</span><strong>{selected.report.patientInformation?.fullpatientid || '—'}</strong></div>
                              <div><span>Billing reference</span><strong>#{selected.report.billingid || '—'}</strong></div>
                         </div>
                         <ReportAmendmentNotice version={selected} showChanges={!isUltrasoundReport} />
                         {hasRichTextReport || isUltrasoundReport ? <div className={`${styles.reportDocument} archived-report-content`}>
                              {records.map((row: any, index: number) => <div key={index} className={styles.reportRecord}>
                                   {row.field && <strong className={styles.reportField}>{row.field}</strong>}
                                   <ReportContent value={row.value} />
                                   {!containsReportMarkup(row.value) && !containsReportMarkdown(row.value) && row.units && <span className={styles.reportUnits}>{row.units}</span>}
                              </div>)}
                         </div> : <table className="table table-sm">
                              <thead><tr><th scope="col">Result field</th><th scope="col">Value</th><th scope="col">Unit</th></tr></thead>
                              <tbody>{records.map((row: any, index: number) => <tr key={index}>
                                   <th scope="row">{row.field}</th><td>{row.value}</td><td>{row.units}</td>
                              </tr>)}</tbody>
                         </table>}
                         {selected.report.comments && <section className={styles.additionalSection}>
                              <h3>Report comments</h3>
                              <ReportContent value={selected.report.comments} />
                         </section>}
                         {!!selected.report.drugList?.length && <section className={styles.additionalSection}>
                              <h3>Drug sensitivities</h3>
                              <ul>{selected.report.drugList.map((row: any, index: number) => <li key={index}>{row.drug} · {row.sensitivity}</li>)}</ul>
                         </section>}
                         {selected.report.literatureReview && <details className={styles.interpretation}>
                              <summary>Interpretation</summary>
                              <ReportContent value={selected.report.literatureReview} />
                         </details>}
                    </section>}
                    {!selected && !busy && versions.length > 0 && <section className={`${styles.panel} ${styles.emptyDetail}`}>
                         <h2>Select a report version</h2>
                         <p>Choose an archived version from the timeline to review its contents.</p>
                    </section>}
               </div>
          </div>
     </main>;
}
