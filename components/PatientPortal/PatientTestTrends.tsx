"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePortalResource } from './usePortalResource';
import { formatDate } from '../../lib/patientPortal';
import { PortalTrendHistory, PortalTrendTest, groupTrendRows, trendReference } from '../../lib/patientPortalTrends';
import TrendChart from './TrendChart';
import styles from './trends.module.css';

export default function PatientTestTrends() {
     const tests = usePortalResource<PortalTrendTest[]>('patient-portal/trends/tests');
     const [selected, setSelected] = useState('');
     useEffect(() => {
          if (tests.data && !tests.data.some(test => String(test.testid) === selected)) {
               setSelected(tests.data[0] ? String(tests.data[0].testid) : '');
          }
     }, [tests.data, selected]);
     return (
          <main className={styles.page}>
               <header className={styles.header}>
                    <div><p className={styles.eyebrow}>My health record</p><h1>My Test Trends</h1>
                         <p>Compare your released laboratory results over time.</p></div>
                    <Link href="/patientportal/results" className={styles.link}>View my reports</Link>
               </header>
               <p className={styles.notice}>Only results currently available to you in the patient portal appear here. Trends do not replace advice from your clinician.</p>
               {tests.loading && <p role="status" aria-live="polite">Loading your available tests…</p>}
               {tests.error && <div role="alert" className={styles.error}>{tests.error} <button type="button" onClick={tests.reload}>Retry tests</button></div>}
               {!tests.loading && !tests.error && tests.data?.length === 0 && <section className={styles.card}><h2>No released results yet</h2><p>When the laboratory verifies and releases your results, you can compare them here.</p></section>}
               {!tests.loading && !tests.error && !!tests.data?.length && (
                    <>
                         <section className={styles.card}>
                              <label htmlFor="trend-test" className={styles.label}>Choose a laboratory test</label>
                              <select id="trend-test" value={selected} onChange={event => setSelected(event.target.value)} className={styles.select}>
                                   {!selected && <option value="">Select a test</option>}
                                   {tests.data.map(test => <option key={test.testid} value={test.testid}>{test.testname} ({test.resultCount} released result{test.resultCount === 1 ? '' : 's'})</option>)}
                              </select>
                         </section>
                         {selected && <TestHistory key={selected} testid={Number(selected)} />}
                    </>
               )}
          </main>
     );
}

function TestHistory({ testid }: { testid: number }) {
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(25);
     const history = usePortalResource<PortalTrendHistory>(`patient-portal/trends/${testid}?page=${page}&count=${count}`);
     // Do not display the previous page while a changed endpoint is being fetched.
     const data = history.data?.testid === testid && history.data.page === page && history.data.count === count ? history.data : null;
     const groups = groupTrendRows(data?.rows || []);
     return (
          <section aria-label="Test result history" aria-busy={history.loading}>
               <div className={styles.controls}>
                    <label htmlFor="trend-count">Results per page{' '}
                         <select id="trend-count" value={count} onChange={event => { setCount(Number(event.target.value)); setPage(1); }} className={styles.select}>
                              {[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
                         </select>
                    </label>
                    <button type="button" onClick={history.reload} disabled={history.loading}>Refresh history</button>
               </div>
               {history.error && <div role="alert" className={styles.error}>{history.error} <button type="button" onClick={history.reload}>Retry history</button></div>}
               {(history.loading || !data) && !history.error && <p role="status" aria-live="polite">Loading test history…</p>}
               {!history.loading && !history.error && data && (
                    <>
                         <p className={styles.notice}>{data.referenceNote}</p>
                         <p role="status">Page {data.page} of {data.totalPages || 1} · {data.total} released result{data.total === 1 ? '' : 's'}. Charts show this page only, oldest to newest.</p>
                         {data.rows.length === 0 && <div className={styles.card}><h2>No result values to show</h2><p>No released values are available on this page. Results may have been withdrawn or may use a report format without trend values.</p></div>}
                         {groups.map(group => (
                              <section className={styles.card} key={group.key}>
                                   <h2>{group.field}{group.units ? ` · ${group.units}` : ''}</h2>
                                   <TrendChart rows={group.rows} field={group.field} units={group.units} />
                                   <div className={styles.tableWrap} role="region" aria-label={`${group.field} result data`} tabIndex={0}>
                                        <table className={styles.table}>
                                             <caption>{group.field} — recorded results for this page, oldest to newest</caption>
                                             <thead><tr><th scope="col">Recorded</th><th scope="col">Completed</th><th scope="col">Value</th><th scope="col">Units</th><th scope="col">Reference range</th><th scope="col">Report</th></tr></thead>
                                             <tbody>{group.rows.map((row, index) => (
                                                  <tr key={`${row.ascensionid}-${index}`}>
                                                       <th scope="row">{formatDate(row.recordedOn)}</th>
                                                       <td>{formatDate(row.completedOn)}</td>
                                                       <td>{row.value === '' ? 'Not recorded' : row.value}</td>
                                                       <td>{row.units || 'Not provided'}</td>
                                                       <td>{trendReference(row)}</td>
                                                       <td><Link href={`/patientportal/results/${row.billingid}`} aria-label={`View report for ${group.field}, ${formatDate(row.recordedOn)}`}>View report</Link></td>
                                                  </tr>
                                             ))}</tbody>
                                        </table>
                                   </div>
                              </section>
                         ))}
                         <nav aria-label="Trend history pages" className={styles.controls}>
                              <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Newer results</button>
                              <span>Page {page} of {data.totalPages || 1}</span>
                              <button type="button" disabled={page >= data.totalPages} onClick={() => setPage(value => value + 1)}>Older results</button>
                         </nav>
                    </>
               )}
          </section>
     );
}
