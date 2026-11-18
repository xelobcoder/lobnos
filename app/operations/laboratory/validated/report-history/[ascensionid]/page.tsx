'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { controlApi } from '../../../../../../components/operations/OperationalControlsWorkspace';
import ReportAmendmentNotice, { ReportChangesTable, type ReportChange, type ReportVersion } from '../../../../../../components/ResultView/ReportAmendmentNotice';
import ReportRichText, { containsReportMarkup } from '../../../../../../components/ResultView/ReportRichText';

type Amendment = { revision: number; reviewHash: string; changes: ReportChange[] };
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
     const lock = useRef(false);
     async function load() {
          const data = await controlApi(`${base}/versions`);
          setVersions(data.versions);
          setCanSign(data.canSign);
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
     const isUltrasoundReport = /ultrasound/i.test(selected?.report.testname || '');
     return <main className="container py-4">
          <h1 className="h3">Laboratory report history</h1>
          <p className="text-muted">Ordered test #{ascensionid}</p>
          {error && <div role="alert" className="alert alert-danger">{error}</div>}
          {notice && <div role="status" className="alert alert-success">{notice}</div>}
          <div className="row g-3">
               <section className="col-md-4">
                    <h2 className="h5">Archived versions</h2>
                    {!busy && !versions.length && <p>There are no saved releases for this result. Earlier reports can only appear here if they were archived at release.</p>}
                    <div className="list-group">
                         {versions.map(item => <button type="button" key={item.version}
                              className={`list-group-item list-group-item-action ${selected?.version === item.version ? 'active' : ''}`}
                              disabled={busy} onClick={() => run(async () => setSelected(await controlApi(`${base}/versions/${item.version}`)))}>
                              Version {item.version} · {item.version === 1 ? 'Original' : 'Amended'}
                         </button>)}
                    </div>
                    {canSign && <button type="button" className="btn btn-primary mt-3" disabled={busy}
                         onClick={() => run(async () => { setDraft(await controlApi(`${base}/amendment`)); setReason(''); setConfirmed(false); })}>Review amendment</button>}
               </section>
               <div className="col-md-8">
                    {draft && <section className="border rounded p-3 mb-3">
                         <h2 className="h5">Review and sign amendment</h2>
                         <ReportChangesTable changes={draft.changes} />
                         <form onSubmit={event => { event.preventDefault(); void run(async () => {
                              const signed = await controlApi(`${base}/amendment`, 'POST', { revision: draft.revision, reviewHash: draft.reviewHash, reason, confirmed });
                              setDraft(null);
                              setNotice(`Amended report version ${signed.version} signed.`);
                              await load();
                              setSelected(await controlApi(`${base}/versions/${signed.version}`));
                         }); }}>
                              <label className="form-label d-block mt-3">Reason for amendment
                                   <textarea className="form-control" required minLength={3} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} />
                              </label>
                              <label className="d-block mb-3"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> I reviewed these changes and sign this amendment under my staff account.</label>
                              <button className="btn btn-primary" type="submit" disabled={busy || !confirmed || reason.trim().length < 3}>Sign amendment</button>
                         </form>
                    </section>}
                    {selected && <section className="border rounded p-3">
                         <h2 className="h5">{selected.report.testname} · Version {selected.version}</h2>
                         <p>{selected.version !== currentVersion ? 'Superseded report · retained for reference' : 'Latest archived report'}</p>
                         <p>{selected.report.patientInformation?.fullpatientid} · Billing #{selected.report.billingid}</p>
                         <ReportAmendmentNotice version={selected} />
                         {hasRichTextReport || isUltrasoundReport ? <div className="archived-report-content">
                              {records.map((row: any, index: number) => <div key={index} className="mb-3">
                                   {row.field && <strong>{row.field}</strong>}
                                   {containsReportMarkup(row.value)
                                        ? <ReportRichText html={row.value} />
                                        : <div>{row.value}{row.units ? ` ${row.units}` : ''}</div>}
                              </div>)}
                         </div> : <table className="table table-sm">
                              <thead><tr><th scope="col">Result field</th><th scope="col">Value</th><th scope="col">Unit</th></tr></thead>
                              <tbody>{records.map((row: any, index: number) => <tr key={index}>
                                   <th scope="row">{row.field}</th><td>{row.value}</td><td>{row.units}</td>
                              </tr>)}</tbody>
                         </table>}
                         {selected.report.comments && <div className="mb-3">
                              <strong>Report comments</strong>
                              {containsReportMarkup(selected.report.comments)
                                   ? <ReportRichText html={selected.report.comments} />
                                   : <p style={{ whiteSpace: 'pre-wrap' }}>{selected.report.comments}</p>}
                         </div>}
                         {!!selected.report.drugList?.length && <ul>{selected.report.drugList.map((row: any, index: number) => <li key={index}>{row.drug} · {row.sensitivity}</li>)}</ul>}
                         {selected.report.literatureReview && <details><summary>Interpretation</summary>
                              {containsReportMarkup(selected.report.literatureReview)
                                   ? <ReportRichText html={selected.report.literatureReview} />
                                   : <p>{selected.report.literatureReview}</p>}
                         </details>}
                    </section>}
               </div>
          </div>
     </main>;
}
