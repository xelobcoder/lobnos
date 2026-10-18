"use client";

import Link from 'next/link';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import { RiCalendarLine, RiFileList3Line, RiMoneyDollarCircleLine } from '@remixicon/react';
import styles from '../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../components/PatientPortal/usePortalResource';
import { PortalAppointment, PortalTest, formatDate, formatMoney, fullName, resultStatus } from '../../lib/patientPortal';
import PortalSummary from '../../components/PatientPortal/PortalSummary';

interface Dashboard {
     results: { available: number; inProgress: number; recent: PortalTest[] };
     appointments: { upcoming: PortalAppointment[] };
     billing: { outstanding: number; bills: number } | null;
     features: { billing: boolean; appointmentRequests: boolean };
}

export default function PatientPortalHome() {
     const { data, loading, error, reload } = usePortalResource<Dashboard>('patient-portal/dashboard');
     const { data: me } = usePortalResource<{ firstname?: string; middlename?: string; lastname?: string; fullpatientid?: string }>('patient-portal/me');

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>Welcome{me?.firstname ? `, ${fullName(me)}` : ''}</h1>
                         <p className={styles.subtitle}>
                              {me?.fullpatientid ? `Patient ID ${me.fullpatientid} · ` : ''}Your results, appointments and bills in one place.
                         </p>
                    </div>
               </div>

               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading your dashboard...</div>}

               {data && (
                    <>
                         <PortalSummary items={[
                              { label: 'Results ready', value: data.results.available, icon: <RiFileList3Line /> },
                              { label: 'Tests in progress', value: data.results.inProgress, detail: 'We will show results once your facility releases them.' },
                              { label: 'Upcoming appointments', value: data.appointments.upcoming.length, icon: <RiCalendarLine /> },
                              ...(data.billing ? [{ label: 'Outstanding balance', value: formatMoney(data.billing.outstanding), icon: <RiMoneyDollarCircleLine /> }] : []),
                         ]} />

                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiFileList3Line size={18} />Recent tests</h2>
                              {data.results.recent.length === 0 ? (
                                   <p className={styles.empty}>You have no laboratory tests yet.</p>
                              ) : (
                                   <Table responsive hover className={`${styles.table} align-middle mb-2`}>
                                        <thead><tr><th>Test</th><th>Requested</th><th>Status</th><th /></tr></thead>
                                        <tbody>
                                             {data.results.recent.map((test) => {
                                                  const status = resultStatus(test);
                                                  return (
                                                       <tr key={test.ascensionid}>
                                                            <td>{test.testname}</td>
                                                            <td>{formatDate(test.requestedOn)}</td>
                                                            <td><Badge bg={status.variant}>{status.label}</Badge></td>
                                                            <td className="text-end">
                                                                 {test.released && <Link href={`/patientportal/results/${test.billingid}`}>View report</Link>}
                                                            </td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </Table>
                              )}
                              <Link href="/patientportal/results">See all results</Link>
                         </section>

                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiCalendarLine size={18} />Upcoming appointments</h2>
                              {data.appointments.upcoming.length === 0 ? (
                                   <p className={styles.empty}>No upcoming appointments.</p>
                              ) : (
                                   <ul className="list-unstyled mb-2">
                                        {data.appointments.upcoming.map((item) => (
                                             <li key={item.refid} className="mb-2">
                                                  <strong>{formatDate(item.appointment_date)}</strong> {item.appointment_time ? `at ${String(item.appointment_time).slice(0, 5)}` : ''}
                                                  {' · '}{item.title || item.purpose || 'Appointment'} <Badge bg="light" text="dark" className="text-capitalize">{item.status}</Badge>
                                             </li>
                                        ))}
                                   </ul>
                              )}
                              <Link href="/patientportal/appointments">
                                   {data.features.appointmentRequests ? 'View or request appointments' : 'View appointments'}
                              </Link>
                         </section>

                         {data.billing && (
                              <section className={styles.card}>
                                   <h2 className={styles.cardTitle}><RiMoneyDollarCircleLine size={18} />Billing</h2>
                                   <p className="mb-2">{data.billing.bills} bill{data.billing.bills === 1 ? '' : 's'} · Outstanding {formatMoney(data.billing.outstanding)}</p>
                                   <Link href="/patientportal/billing">View bills and receipts</Link>
                              </section>
                         )}
                    </>
               )}
          </main>
     );
}
