"use client";

import Link from 'next/link';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { RiFileList3Line } from '@remixicon/react';
import styles from '../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { PortalTest, formatDate, groupTestsByVisit, resultStatus, stageLabel } from '../../../lib/patientPortal';

export default function PatientResultsPage() {
     const { data, loading, error, reload } = usePortalResource<PortalTest[]>('patient-portal/results');
     const visits = groupTestsByVisit(data || []);

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>My Results</h1>
                         <p className={styles.subtitle}>Reports appear here once the laboratory has verified and released them.</p>
                    </div>
               </div>

               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading your results...</div>}
               {!loading && !error && visits.length === 0 && <div className={`${styles.card} ${styles.empty}`}>You have no laboratory tests yet.</div>}

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
