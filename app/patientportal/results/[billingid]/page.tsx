"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Button, Spinner, Table } from 'react-bootstrap';
import { RiArrowLeftLine, RiPrinterLine } from '@remixicon/react';
import styles from '../../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../../components/PatientPortal/usePortalResource';
import { flagVariant, formatDate, fullName } from '../../../../lib/patientPortal';

interface ResultReport {
     billingid: number;
     patient: { fullpatientid: string; designation?: string; firstname: string; middlename?: string; lastname: string; gender?: string; age?: number; agetype?: string; dob?: string };
     company: { name?: string; address?: string; phonenumber?: string; email?: string; website?: string; motto?: string } | null;
     tests: {
          ascensionid: number;
          testname: string;
          completedOn: string | null;
          records: { name: string; value: string; unit?: string; lowerlimit?: string; upperlimit?: string; flag?: string }[];
          drugs: { name: string; sensitivity: string }[];
          comments?: string | null;
     }[];
     generatedAt: string;
}

const PRINT_ONLY_REPORT = `
@media print {
     body * { visibility: hidden !important; }
     #pls-portal-report, #pls-portal-report * { visibility: visible !important; }
     #pls-portal-report { position: absolute; left: 0; top: 0; width: 100%; }
}`;

export default function PatientResultReportPage() {
     const params = useParams<{ billingid: string }>();
     const billingid = Number(params?.billingid);
     const valid = Number.isSafeInteger(billingid) && billingid > 0;
     const { data, loading, error, reload } = usePortalResource<ResultReport>(valid ? `patient-portal/results/${billingid}/report` : null);

     const range = (record: ResultReport['tests'][number]['records'][number]) =>
          record.lowerlimit || record.upperlimit ? `${record.lowerlimit ?? ''} - ${record.upperlimit ?? ''}` : '';

     return (
          <main className={styles.page}>
               <style>{PRINT_ONLY_REPORT}</style>
               <div className={`${styles.header} ${styles.noPrint}`}>
                    <Link href="/patientportal/results" className="d-inline-flex align-items-center gap-1"><RiArrowLeftLine size={16} />Back to results</Link>
                    {data && <Button className={styles.primaryButton} onClick={() => window.print()}><RiPrinterLine size={16} className="me-1" />Print or save as PDF</Button>}
               </div>

               {!valid && <Alert variant="danger">This report link is not valid.</Alert>}
               {error && <Alert variant="danger" className={`d-flex justify-content-between align-items-center ${styles.noPrint}`}>{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading report...</div>}

               {data && (
                    <article id="pls-portal-report" className={styles.report}>
                         <header className={styles.reportHeader}>
                              <div>
                                   <p className={styles.reportCompany}>{data.company?.name || 'Laboratory Report'}</p>
                                   {data.company?.motto && <div className="text-muted small">{data.company.motto}</div>}
                                   <div className="small">{[data.company?.address, data.company?.phonenumber, data.company?.email].filter(Boolean).join(' · ')}</div>
                              </div>
                              <div className="text-end small">
                                   <div><strong>Laboratory Report</strong></div>
                                   <div>Visit #{data.billingid}</div>
                                   <div>Generated {formatDate(data.generatedAt, true)}</div>
                              </div>
                         </header>

                         <div className={styles.reportMeta}>
                              <div><strong>Patient:</strong> {[data.patient.designation, fullName(data.patient)].filter(Boolean).join(' ')}</div>
                              <div><strong>Patient ID:</strong> {data.patient.fullpatientid}</div>
                              <div><strong>Gender:</strong> {data.patient.gender || '-'}</div>
                              <div><strong>Age:</strong> {data.patient.age ? `${data.patient.age} ${data.patient.agetype || ''}` : '-'}</div>
                         </div>

                         {data.tests.map((test) => (
                              <section key={test.ascensionid} className={styles.reportTest}>
                                   <div className={styles.reportTestName}>{test.testname} <span className="text-muted small fw-normal">· {formatDate(test.completedOn)}</span></div>
                                   {test.records.length > 0 ? (
                                        <Table size="sm" bordered className={`${styles.table} mb-2`}>
                                             <thead><tr><th>Parameter</th><th>Result</th><th>Unit</th><th>Reference range</th><th>Flag</th></tr></thead>
                                             <tbody>
                                                  {test.records.map((record, index) => (
                                                       <tr key={`${record.name}-${index}`}>
                                                            <td>{record.name}</td>
                                                            <td className={flagVariant(record.flag) ? `text-${flagVariant(record.flag)} fw-semibold` : ''}>{record.value}</td>
                                                            <td>{record.unit || ''}</td>
                                                            <td>{range(record)}</td>
                                                            <td>{record.flag || ''}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </Table>
                                   ) : <p className="text-muted small">No result parameters recorded.</p>}
                                   {test.drugs.length > 0 && (
                                        <Table size="sm" bordered className={`${styles.table} mb-2`}>
                                             <thead><tr><th>Antibiotic</th><th>Sensitivity</th></tr></thead>
                                             <tbody>{test.drugs.map((drug, index) => <tr key={`${drug.name}-${index}`}><td>{drug.name}</td><td>{drug.sensitivity}</td></tr>)}</tbody>
                                        </Table>
                                   )}
                                   {test.comments && <p className="small mb-0"><strong>Comments:</strong> {test.comments}</p>}
                              </section>
                         ))}

                         <p className="text-muted small mt-4 mb-0">
                              This report contains confidential medical information. Discuss your results with your clinician.
                         </p>
                    </article>
               )}
          </main>
     );
}
