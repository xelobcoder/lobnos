"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { RiFileList3Line } from '@remixicon/react';
import styles from '../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { PortalTest, formatDate, groupTestsByVisit, resultStatus, stageLabel } from '../../../lib/patientPortal';
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

export default function PatientResultsPage() {
     const [dateFilter, setDateFilter] = useState('');
     const [range, setRange] = useState({ from: '', to: '' });
     const rangeError = dateFilter && dateFilter !== 'All' &&
          (!range.from || !range.to || range.from > range.to) ? 'Select a valid start and end date.' : '';
     const query = dateFilter && dateFilter !== 'All' && !rangeError
          ? `?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}` : '';
     const { data, loading, error, reload } = usePortalResource<PortalTest[]>(rangeError ? null : `patient-portal/results${query}`);
     const visits = groupTestsByVisit(rangeError ? [] : data || []);

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>My Results</h1>
                         <p className={styles.subtitle}>Reports appear here once the laboratory has verified and released them.</p>
                    </div>
               </div>

               <section className={`${styles.card} ${styles.resultFilters}`} aria-label="Filter results by request date">
                    <div className={styles.dateFilter}>
                         <label className="form-label fw-semibold" htmlFor="patient-result-dates">Request date</label>
                         <DateFilterReusable
                              id="patient-result-dates"
                              value={dateFilter}
                              onChange={setDateFilter}
                              onDateRangeChange={(from, to) => setRange({ from, to })}
                              label="All request dates"
                              className="w-100"
                         />
                    </div>
                    <Button variant="outline-secondary" onClick={() => { setDateFilter(''); setRange({ from: '', to: '' }); }}>Clear dates</Button>
                    <Link href="/patientportal/trends" className="btn btn-outline-primary">Test trends</Link>
                    <p className="text-muted small mb-0 w-100">Filter by the date your tests were requested. Up to 500 tests are shown per date range.</p>
               </section>
               {rangeError && <Alert variant="warning">{rangeError}</Alert>}
               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading your results...</div>}
               {!loading && !error && !rangeError && visits.length === 0 && <div className={`${styles.card} ${styles.empty}`}>{dateFilter ? 'No laboratory tests match these request dates.' : 'You have no laboratory tests yet.'}</div>}

               {visits.map((visit) => (
                    <section key={visit.billingid} className={styles.card}>
                         <div className={styles.visitHeader}>
                              <h2 className={`${styles.cardTitle} mb-0`}>
                                   <RiFileList3Line size={18} />Visit #{visit.billingid} · {formatDate(visit.requestedOn)}
                              </h2>
                              {visit.released > 0 && (
                                   <Link href={`/patientportal/results/${visit.billingid}`} className={`btn btn-sm btn-success ${styles.primaryButton}`}>
                                        View report ({visit.released} of {visit.tests.length})
                                   </Link>
                              )}
                         </div>
                         <Table responsive hover className={`${styles.table} align-middle mb-0`}>
                              <thead><tr><th>Test</th><th>Progress</th><th>Status</th><th>Completed</th></tr></thead>
                              <tbody>
                                   {visit.tests.map((test) => {
                                        const status = resultStatus(test);
                                        return (
                                             <tr key={test.ascensionid}>
                                                  <td>{test.testname}</td>
                                                  <td>{stageLabel(test.stage)}</td>
                                                  <td><Badge bg={status.variant}>{status.label}</Badge></td>
                                                  <td>{test.released ? formatDate(test.completedOn) : '-'}</td>
                                             </tr>
                                        );
                                   })}
                              </tbody>
                         </Table>
                         {visit.tests.some((test) => test.pending === 'awaiting_payment') && (
                              <p className="text-muted small mt-2 mb-0">Some results will be released once the outstanding balance for this visit is settled.</p>
                         )}
                    </section>
               ))}
          </main>
     );
}
