"use client";

import { FormEvent, useState } from 'react';
import { Alert, Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { RiCalendarLine, RiCalendarScheduleLine } from '@remixicon/react';
import styles from '../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { customFetchMutation } from '../../../components/Auth/customFetch';
import SlotPicker from '../../../components/PatientPortal/SlotPicker';
import {
     APPOINTMENT_TYPES, BookingSlot, PortalAppointment, appointmentRequestProblem, appointmentSlotProblem, bookingMaxDate, errorMessage, formatDate, formatTime, todayIso, unwrap,
} from '../../../lib/patientPortal';

interface AppointmentsResponse {
     appointments: PortalAppointment[];
     requestsEnabled: boolean;
}

type ChangeTarget = { appointment: PortalAppointment; action: 'cancel' | 'reschedule' } | null;

const emptyRequest = { date: '', time: '', type: 'laboratory', reason: '' };

export default function PatientAppointmentsPage() {
     const { data, loading, error, reload } = usePortalResource<AppointmentsResponse>('patient-portal/appointments');
     const [request, setRequest] = useState(emptyRequest);
     const [change, setChange] = useState<ChangeTarget>(null);
     const [changeForm, setChangeForm] = useState({ date: '', time: '', reason: '' });
     const [submitting, setSubmitting] = useState(false);
     const [notice, setNotice] = useState<{ variant: string; text: string } | null>(null);
     const [formError, setFormError] = useState('');
     const availability = usePortalResource<{ date: string; slots: BookingSlot[] }>(request.date ? `patient-portal/appointments/availability?date=${encodeURIComponent(request.date)}` : null);

     const submitRequest = async (event: FormEvent) => {
          event.preventDefault();
          const problem = appointmentRequestProblem(request);
          if (problem) return setFormError(problem);
          setFormError('');
          setSubmitting(true);
          try {
               const response = await customFetchMutation('patient-portal/appointments', 'POST', { ...request, reason: request.reason.trim() });
               unwrap(response);
               setNotice({ variant: 'success', text: response.message || 'Your appointment request has been sent to the facility.' });
               setRequest(emptyRequest);
               reload();
          } catch (reason) {
               setFormError(errorMessage(reason));
               if (/no longer available/i.test(errorMessage(reason))) {
                    setRequest((current) => ({ ...current, time: '' }));
                    availability.reload();
               }
          } finally {
               setSubmitting(false);
          }
     };

     const submitChange = async (event: FormEvent) => {
          event.preventDefault();
          if (!change) return;
          const body = { action: change.action, reason: changeForm.reason.trim(), date: changeForm.date, time: changeForm.time };
          const problem = change.action === 'reschedule' ? appointmentSlotProblem(body.date, body.time) : null;
          if (problem) return setFormError(problem);
          setFormError('');
          setSubmitting(true);
          try {
               const response = await customFetchMutation(`patient-portal/appointments/${change.appointment.refid}/change-request`, 'POST', body);
               unwrap(response);
               setNotice({ variant: 'success', text: response.message || 'Your request has been sent to the facility.' });
               setChange(null);
               reload();
          } catch (reason) {
               setFormError(errorMessage(reason));
          } finally {
               setSubmitting(false);
          }
     };

     const openChange = (appointment: PortalAppointment, action: 'cancel' | 'reschedule') => {
          setFormError('');
          setChangeForm({ date: '', time: '', reason: '' });
          setChange({ appointment, action });
     };

     const appointments = data?.appointments || [];

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>Appointments</h1>
                         <p className={styles.subtitle}>Your visits with the facility{data?.requestsEnabled ? ' and requests for new ones' : ''}.</p>
                    </div>
               </div>

               {notice && <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}
               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading appointments...</div>}

               {data && (
                    <>
                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiCalendarLine size={18} />My appointments</h2>
                              {appointments.length === 0 ? (
                                   <p className={styles.empty}>You have no appointments.</p>
                              ) : (
                                   <Table responsive hover className={`${styles.table} align-middle mb-0`}>
                                        <thead><tr><th>Date</th><th>Time</th><th>Purpose</th><th>Type</th><th>Status</th><th /></tr></thead>
                                        <tbody>
                                             {appointments.map((item) => (
                                                  <tr key={item.refid}>
                                                       <td>{formatDate(item.appointment_date)}</td>
                                                       <td>{formatTime(item.appointment_time)}</td>
                                                       <td>{item.title || item.purpose || 'Appointment'}{item.practitioner ? <div className="small text-muted">{item.practitioner}</div> : null}</td>
                                                       <td className="text-capitalize">{String(item.appointment_type || '-').replace(/_/g, ' ')}</td>
                                                       <td><Badge bg={item.upcoming ? 'success' : 'secondary'} className="text-capitalize">{item.status}</Badge></td>
                                                       <td className="text-end text-nowrap">
                                                            {item.upcoming && data.requestsEnabled && item.status !== 'cancelled' && (
                                                                 <>
                                                                      <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => openChange(item, 'reschedule')}>Reschedule</Button>
                                                                      <Button size="sm" variant="outline-danger" onClick={() => openChange(item, 'cancel')}>Cancel</Button>
                                                                 </>
                                                            )}
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </Table>
                              )}
                         </section>

                         {data.requestsEnabled ? (
                              <section className={styles.card}>
                                   <h2 className={styles.cardTitle}><RiCalendarScheduleLine size={18} />Request an appointment</h2>
                                   <p className="text-muted small">The facility will confirm your requested date and time.</p>
                                   {formError && !change && <Alert variant="danger">{formError}</Alert>}
                                   <Form onSubmit={submitRequest} noValidate>
                                        <Row className="g-3">
                                             <Col md={4}>
                                                  <Form.Label htmlFor="appointment-date">Date</Form.Label>
                                                  <Form.Control id="appointment-date" type="date" min={todayIso()} max={bookingMaxDate(60)} value={request.date} onChange={(e) => setRequest({ ...request, date: e.target.value, time: '' })} required />
                                             </Col>
                                             <Col md={8}>
                                                  <Form.Label htmlFor="appointment-type">Type</Form.Label>
                                                  <Form.Select id="appointment-type" value={request.type} onChange={(e) => setRequest({ ...request, type: e.target.value })}>
                                                       {APPOINTMENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                                                  </Form.Select>
                                             </Col>
                                             <Col xs={12}>
                                                  <span className="form-label d-block" id="appointment-time-label">Time</span>
                                                  <SlotPicker label="Appointment time" slots={request.date ? availability.data?.slots : null} value={request.time}
                                                       loading={availability.loading} error={availability.error || undefined}
                                                       onChange={(time) => setRequest({ ...request, time })} />
                                             </Col>
                                             <Col xs={12}>
                                                  <Form.Label htmlFor="appointment-reason">Reason</Form.Label>
                                                  <Form.Control id="appointment-reason" as="textarea" rows={3} maxLength={500} value={request.reason} onChange={(e) => setRequest({ ...request, reason: e.target.value })} required />
                                             </Col>
                                        </Row>
                                        <Button type="submit" className={`${styles.primaryButton} mt-3`} disabled={submitting}>
                                             {submitting && <Spinner size="sm" animation="border" className="me-2" />}Send request
                                        </Button>
                                   </Form>
                              </section>
                         ) : (
                              <p className="text-muted small">To book or change an appointment, please contact the facility.</p>
                         )}
                    </>
               )}

               <Modal show={!!change} onHide={() => !submitting && setChange(null)} centered>
                    <Form onSubmit={submitChange} noValidate>
                         <Modal.Header closeButton>
                              <Modal.Title as="h5">{change?.action === 'cancel' ? 'Cancel appointment' : 'Request a new time'}</Modal.Title>
                         </Modal.Header>
                         <Modal.Body>
                              {change && <p className="small text-muted">{formatDate(change.appointment.appointment_date)} {formatTime(change.appointment.appointment_time)} · {change.appointment.title || change.appointment.purpose || 'Appointment'}</p>}
                              {formError && change && <Alert variant="danger">{formError}</Alert>}
                              {change?.action === 'reschedule' && (
                                   <Row className="g-3 mb-3">
                                        <Col>
                                             <Form.Label htmlFor="change-date">New date</Form.Label>
                                             <Form.Control id="change-date" type="date" min={todayIso()} value={changeForm.date} onChange={(e) => setChangeForm({ ...changeForm, date: e.target.value })} required />
                                        </Col>
                                        <Col>
                                             <Form.Label htmlFor="change-time">New time</Form.Label>
                                             <Form.Control id="change-time" type="time" value={changeForm.time} onChange={(e) => setChangeForm({ ...changeForm, time: e.target.value })} required />
                                        </Col>
                                   </Row>
                              )}
                              <Form.Label htmlFor="change-reason">Reason (optional)</Form.Label>
                              <Form.Control id="change-reason" as="textarea" rows={3} maxLength={200} value={changeForm.reason} onChange={(e) => setChangeForm({ ...changeForm, reason: e.target.value })} />
                         </Modal.Body>
                         <Modal.Footer>
                              <Button variant="outline-secondary" onClick={() => setChange(null)} disabled={submitting}>Close</Button>
                              <Button type="submit" variant={change?.action === 'cancel' ? 'danger' : undefined} className={change?.action === 'cancel' ? '' : styles.primaryButton} disabled={submitting}>
                                   {submitting && <Spinner size="sm" animation="border" className="me-2" />}
                                   {change?.action === 'cancel' ? 'Cancel appointment' : 'Send request'}
                              </Button>
                         </Modal.Footer>
                    </Form>
               </Modal>
          </main>
     );
}
