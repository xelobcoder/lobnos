"use client";

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Alert, Badge, Button, Spinner, Table } from 'react-bootstrap';
import {
     RiCalendarLine, RiCheckboxCircleLine, RiFileList3Line, RiHomeHeartLine, RiMoneyDollarCircleLine, RiTimeLine,
} from '@remixicon/react';
import styles from '../../components/PatientPortal/portal.module.css';
import shell from '../../components/PatientPortal/PortalShell.module.css';
import { usePortalResource } from '../../components/PatientPortal/usePortalResource';
import {
     BillingSummary, FacilityContact, PortalAppointment, PortalTest, formatDate, formatMoney, formatTime, fullName, resultStatus,
} from '../../lib/patientPortal';
import PortalSummary from '../../components/PatientPortal/PortalSummary';
import FacilityContactCard from '../../components/PatientPortal/FacilityContactCard';
import PaymentInstructions from '../../components/PatientPortal/PaymentInstructions';

interface Dashboard {
     results: { available: number; inProgress: number; awaitingPayment: number; recent: PortalTest[] };
     appointments: { upcoming: PortalAppointment[]; upcomingCount: number };
     billing: BillingSummary | null;
     homeCollections: { active: number } | null;
     facility: FacilityContact | null;
     features: { billing: boolean; appointmentRequests: boolean; homeCollection: boolean };
}

interface Step { key: string; icon: ReactNode; title: string; detail: string; href: string; action: string; tone?: 'warning' | 'info' }

/** The few things a patient may need to act on, most urgent first. */
function dashboardSteps(data: Dashboard): Step[] {
     const steps: Step[] = [];
     const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
     if (data.results.available > 0) {
          steps.push({ key: 'results', icon: <RiFileList3Line size={22} />, title: `${plural(data.results.available, 'result')} ready`,
               detail: 'View or download your released laboratory reports.', href: '/patientportal/results', action: 'View results' });
     }
     if (data.billing && data.billing.outstanding > 0) {
          steps.push({ key: 'pay', icon: <RiMoneyDollarCircleLine size={22} />, tone: 'warning',
               title: `${formatMoney(data.billing.outstanding)} to pay`,
               detail: data.results.awaitingPayment > 0
                    ? `${plural(data.results.awaitingPayment, 'result')} will be released after payment.`
                    : `${plural(data.billing.unpaidBills, 'bill')} with an outstanding balance.`,
               href: '/patientportal/billing', action: 'How to pay' });
     }
     const next = data.appointments.upcoming[0];
     if (next) {
          steps.push({ key: 'appointment', icon: <RiCalendarLine size={22} />, tone: 'info',
               title: `Appointment on ${formatDate(next.appointment_date)}`,
               detail: `${next.appointment_time ? `At ${formatTime(next.appointment_time)} · ` : ''}${next.title || next.purpose || 'Appointment'} (${next.status || 'requested'})`,
               href: '/patientportal/appointments', action: 'View appointments' });
     }
     if (data.homeCollections && data.homeCollections.active > 0) {
          steps.push({ key: 'collection', icon: <RiHomeHeartLine size={22} />, tone: 'info',
               title: `${plural(data.homeCollections.active, 'home collection')} in progress`,
               detail: 'Track each step from booking to arrival at the laboratory.', href: '/patientportal/home-collection', action: 'Track collection' });
     }
     if (data.results.inProgress > 0 && steps.length < 4) {
          steps.push({ key: 'progress', icon: <RiTimeLine size={22} />, tone: 'info', title: `${plural(data.results.inProgress, 'test')} in progress`,
               detail: 'We will notify you when results are released.', href: '/patientportal/results', action: 'See progress' });
     }
     return steps;
}

export default function PatientPortalHome() {
     const { data, loading, error, reload } = usePortalResource<Dashboard>('patient-portal/dashboard');
     const { data: me } = usePortalResource<{ firstname?: string; middlename?: string; lastname?: string; fullpatientid?: string }>('patient-portal/me');
     const steps = data ? dashboardSteps(data) : [];

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>Welcome{me?.firstname ? `, ${fullName(me)}` : ''}</h1>
                         <p className={styles.subtitle}>
                              {me?.fullpatientid ? `Patient ID ${me.fullpatientid} · ` : ''}Your results, appointments and bills in one place.
                         </p>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                         <Link href="/patientportal/requests" className="btn btn-primary">Request tests</Link>
                         <Link href="/patientportal/samples" className="btn btn-outline-primary">Samples & recollection</Link>
                         {data?.features.homeCollection && <Link href="/patientportal/home-collection" className="btn btn-outline-primary">Book home collection</Link>}
                    </div>
               </div>

               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading your dashboard...</div>}

               {data && (
                    <>
                         <section aria-labelledby="next-steps-title">
                              <h2 id="next-steps-title" className={shell.panelTitle}>What needs your attention</h2>
                              {steps.length === 0 ? (
                                   <div className={shell.step}><RiCheckboxCircleLine size={22} aria-hidden="true" /><div><strong>You are all caught up</strong><p className="mb-0">There is nothing waiting for you right now.</p></div></div>
                              ) : (
                                   <div className={shell.nextSteps}>
                                        {steps.map(step => (
                                             <div key={step.key} className={`${shell.step} ${step.tone === 'warning' ? shell.stepWarning : step.tone === 'info' ? shell.stepInfo : ''}`}>
                                                  <span aria-hidden="true">{step.icon}</span>
                                                  <div style={{ minWidth: 0 }}>
                                                       <strong>{step.title}</strong>
                                                       <p>{step.detail}</p>
                                                       <Link href={step.href}>{step.action}</Link>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </section>

                         <PortalSummary title="Your care summary" items={[
                              { label: 'Results ready', value: data.results.available, icon: <RiFileList3Line />, variant: 'success' },
                              { label: 'Tests in progress', value: data.results.inProgress, detail: 'Results appear after your facility releases them.', icon: <RiTimeLine />, variant: 'primary' },
                              { label: 'Upcoming appointments', value: data.appointments.upcomingCount, icon: <RiCalendarLine />, variant: 'info' },
                              ...(data.billing ? [{ label: 'Outstanding balance', value: formatMoney(data.billing.outstanding), detail: `${data.billing.unpaidBills} unpaid of ${data.billing.bills} bill${data.billing.bills === 1 ? '' : 's'}`, icon: <RiMoneyDollarCircleLine />, variant: 'warning' as const }] : []),
                         ]} />

                         {data.billing && data.billing.outstanding > 0 && (
                              <PaymentInstructions instructions={data.billing.paymentInstructions} outstanding={data.billing.outstanding} />
                         )}

                         <div className={shell.homeColumns}>
                              <div style={{ minWidth: 0 }}>
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
                                                                           {!test.released && test.pending === 'awaiting_payment' && <Link href="/patientportal/billing">Pay to unlock</Link>}
                                                                      </td>
                                                                 </tr>
                                                            );
                                                       })}
                                                  </tbody>
                                             </Table>
                                        )}
                                        <div className="d-flex flex-wrap gap-3">
                                             <Link href="/patientportal/results">See all results</Link>
                                             <Link href="/patientportal/trends">View test trends</Link>
                                        </div>
                                   </section>

                                   <section className={styles.card}>
                                        <h2 className={styles.cardTitle}><RiCalendarLine size={18} />Upcoming appointments</h2>
                                        {data.appointments.upcoming.length === 0 ? (
                                             <p className={styles.empty}>No upcoming appointments.</p>
                                        ) : (
                                             <ul className="list-unstyled mb-2">
                                                  {data.appointments.upcoming.map((item) => (
                                                       <li key={item.refid} className="mb-2">
                                                            <strong>{formatDate(item.appointment_date)}</strong> {item.appointment_time ? `at ${formatTime(item.appointment_time)}` : ''}
                                                            {' · '}{item.title || item.purpose || 'Appointment'} <Badge bg="light" text="dark" className="text-capitalize">{item.status}</Badge>
                                                       </li>
                                                  ))}
                                             </ul>
                                        )}
                                        <Link href="/patientportal/appointments">
                                             {data.features.appointmentRequests ? 'View or request appointments' : 'View appointments'}
                                        </Link>
                                   </section>
                              </div>
                              <div style={{ minWidth: 0 }}>
                                   <FacilityContactCard facility={data.facility} />
                                   {data.features.homeCollection && (
                                        <section className={shell.panel}>
                                             <h2 className={shell.panelTitle}><RiHomeHeartLine size={18} aria-hidden="true" />Sample collection at home</h2>
                                             <p className="mb-2">Book a collector to take your sample at home or work, and follow each step online.</p>
                                             <Link href="/patientportal/home-collection">Book or track a collection</Link>
                                        </section>
                                   )}
                              </div>
                         </div>
                         <p className={shell.poweredBy}>Powered by Prime Laboratory Software</p>
                    </>
               )}
          </main>
     );
}
