"use client";

import { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { RiHistoryLine, RiSettings4Line } from '@remixicon/react';
import styles from './portal.module.css';
import { usePortalResource } from './usePortalResource';
import { customFetchMutation, getInstitutionUsers } from '../Auth/customFetch';
import { PortalSettings, auditActionLabel, errorMessage, formatDate, unwrap } from '../../lib/patientPortal';

interface AuditEntry {
     id: number;
     patientid: number | null;
     actor_type: string;
     actor_id: number | null;
     action: string;
     resource: string | null;
     resource_id: string | null;
     ip_address: string | null;
     created_at: string;
}

const SWITCHES: { key: keyof PortalSettings; label: string; help: string }[] = [
     { key: 'portal_enabled', label: 'Enable the patient portal', help: 'When off, patients cannot sign in or activate accounts.' },
     { key: 'staff_invitations_enabled', label: 'Staff can invite patients', help: 'Send single-use activation links from the patient record in CRM.' },
     { key: 'self_registration_enabled', label: 'Patients can register online', help: 'Patients verify their patient ID, date of birth and email with an emailed code.' },
     { key: 'require_payment_for_results', label: 'Require full payment before results are visible', help: 'Unpaid tests show "Awaiting payment" in the portal.' },
     { key: 'billing_enabled', label: 'Show bills and receipts', help: 'Patients can view their bills, payments and outstanding balance.' },
     { key: 'appointment_requests_enabled', label: 'Allow appointment requests', help: 'Requests arrive as pending appointments for the selected staff member.' },
     { key: 'email_notifications_enabled', label: 'Email notifications', help: 'Invitations, verification codes and result-ready messages by email.' },
     { key: 'sms_notifications_enabled', label: 'SMS notifications', help: 'Result-ready messages by SMS for patients who opt in.' },
     { key: 'result_notifications_enabled', label: 'Tell patients when results are ready', help: 'Sends an email/SMS (per the channels above) once a result is released to the portal.' },
     { key: 'home_collection_enabled', label: 'Allow home collection booking', help: 'Patients book an hourly slot in an active collection area and track the visit. Staff manage bookings in Home Collection.' },
];

export default function PatientPortalSettingsManager() {
     const { data, loading, error, reload } = usePortalResource<PortalSettings>('patient-portal/admin/settings');
     const [form, setForm] = useState<PortalSettings | null>(null);
     const [staff, setStaff] = useState<{ employeeid: number; username: string }[]>([]);
     const [saving, setSaving] = useState(false);
     const [notice, setNotice] = useState<{ variant: string; text: string } | null>(null);
     const [auditPage, setAuditPage] = useState(1);
     const [auditPatient, setAuditPatient] = useState('');
     const [auditFilter, setAuditFilter] = useState('');
     const audit = usePortalResource<AuditEntry[]>(`patient-portal/admin/audit?page=${auditPage}${auditFilter ? `&patientid=${auditFilter}` : ''}`);

     useEffect(() => { if (data) setForm(data); }, [data]);
     useEffect(() => { getInstitutionUsers(setStaff, 'logins'); }, []);

     const save = async (event: FormEvent) => {
          event.preventDefault();
          if (!form) return;
          if (form.appointment_requests_enabled && !form.appointment_request_practitioner) {
               return setNotice({ variant: 'danger', text: 'Choose the staff member who receives appointment requests before enabling them.' });
          }
          if (!(form.booking_start_hour < form.booking_end_hour)) {
               return setNotice({ variant: 'danger', text: 'Booking opening hour must be earlier than the closing hour.' });
          }
          setSaving(true);
          setNotice(null);
          try {
               const response = await customFetchMutation('patient-portal/admin/settings', 'PUT', form);
               setForm(unwrap<PortalSettings>(response));
               setNotice({ variant: 'success', text: response.message || 'Patient portal settings saved' });
               audit.reload();
          } catch (reason) {
               setNotice({ variant: 'danger', text: errorMessage(reason) });
          } finally {
               setSaving(false);
          }
     };

     const applyAuditFilter = (event: FormEvent) => {
          event.preventDefault();
          const value = auditPatient.trim();
          if (value && !/^\d+$/.test(value)) return;
          setAuditPage(1);
          setAuditFilter(value);
     };

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>Patient Portal</h1>
                         <p className={styles.subtitle}>Control what patients can do online and review portal activity.</p>
                    </div>
               </div>

               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading settings...</div>}

               {form && (
                    <section className="border-bottom pb-4 mb-4">
                         <h2 className={styles.cardTitle}><RiSettings4Line size={18} />Settings</h2>
                         {notice && <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}
                         <Form onSubmit={save}>
                              <Row className="g-3">
                                   {SWITCHES.map((item) => (
                                        <Col md={6} key={item.key}>
                                             <Form.Check type="switch" id={`portal-${item.key}`} label={item.label}
                                                  checked={Boolean(form[item.key])}
                                                  disabled={item.key !== 'portal_enabled' && !form.portal_enabled}
                                                  onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })} />
                                             <Form.Text className="d-block ms-4">{item.help}</Form.Text>
                                        </Col>
                                   ))}
                                   <Col md={6}>
                                        <Form.Label htmlFor="portal-release-policy">Result release</Form.Label>
                                        <Form.Select id="portal-release-policy" value={form.result_release_policy} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, result_release_policy: e.target.value as PortalSettings['result_release_policy'] })}>
                                             <option value="approved">Automatically when results are approved</option>
                                             <option value="manual">Only when staff release each result</option>
                                        </Form.Select>
                                   </Col>
                                   <Col md={3}>
                                        <Form.Label htmlFor="portal-expiry">Invitation expiry (hours)</Form.Label>
                                        <Form.Control id="portal-expiry" type="number" min={1} max={720} value={form.invitation_expiry_hours} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, invitation_expiry_hours: Number(e.target.value) })} />
                                   </Col>
                                   <Col md={6}>
                                        <Form.Label htmlFor="portal-practitioner">Staff member who receives appointment requests</Form.Label>
                                        <Form.Select id="portal-practitioner" value={form.appointment_request_practitioner ?? ''} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, appointment_request_practitioner: e.target.value ? Number(e.target.value) : null })}>
                                             <option value="">Not selected</option>
                                             {staff.map((user) => <option key={user.employeeid} value={user.employeeid}>{String(user.username || user.employeeid).toUpperCase()}</option>)}
                                        </Form.Select>
                                   </Col>
                                   <Col xs={12}><h3 className="h6 mt-2 mb-0">Online booking</h3></Col>
                                   <Col sm={4} md={2}>
                                        <Form.Label htmlFor="portal-start-hour">Opens (hour)</Form.Label>
                                        <Form.Control id="portal-start-hour" type="number" min={0} max={23} value={form.booking_start_hour} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, booking_start_hour: Number(e.target.value) })} />
                                   </Col>
                                   <Col sm={4} md={2}>
                                        <Form.Label htmlFor="portal-end-hour">Closes (hour)</Form.Label>
                                        <Form.Control id="portal-end-hour" type="number" min={1} max={24} value={form.booking_end_hour} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, booking_end_hour: Number(e.target.value) })} />
                                   </Col>
                                   <Col sm={4} md={3}>
                                        <Form.Label htmlFor="portal-appointment-capacity">Appointments per hour</Form.Label>
                                        <Form.Control id="portal-appointment-capacity" type="number" min={1} max={50} value={form.appointment_slot_capacity} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, appointment_slot_capacity: Number(e.target.value) })} />
                                   </Col>
                                   <Col sm={4} md={3}>
                                        <Form.Label htmlFor="portal-collection-capacity">Home collections per hour</Form.Label>
                                        <Form.Control id="portal-collection-capacity" type="number" min={1} max={50} value={form.home_collection_slot_capacity} disabled={!form.portal_enabled}
                                             onChange={(e) => setForm({ ...form, home_collection_slot_capacity: Number(e.target.value) })} />
                                   </Col>
                                   <Col xs={12}><Form.Text>Patients pick hourly slots between these hours, up to 60 days ahead. Full slots are shown as unavailable.</Form.Text></Col>
                                   <Col md={6}>
                                        <Form.Label htmlFor="portal-collection-note">Home collection note for patients</Form.Label>
                                        <Form.Control id="portal-collection-note" as="textarea" rows={3} maxLength={500} value={form.home_collection_note} disabled={!form.portal_enabled}
                                             placeholder="e.g. Collectors call 30 minutes before arrival. Fasting tests: book before 9am."
                                             onChange={(e) => setForm({ ...form, home_collection_note: e.target.value })} />
                                   </Col>
                                   <Col md={6}>
                                        <Form.Label htmlFor="portal-payment-instructions">Payment instructions</Form.Label>
                                        <Form.Control id="portal-payment-instructions" as="textarea" rows={3} maxLength={1000} value={form.payment_instructions} disabled={!form.portal_enabled}
                                             placeholder="e.g. Pay at reception or by mobile money to 024 000 0000 (reference: your patient ID)."
                                             onChange={(e) => setForm({ ...form, payment_instructions: e.target.value })} />
                                   </Col>
                                   <Col md={6}>
                                        <Form.Label htmlFor="portal-help-contact">Patient help contact</Form.Label>
                                        <Form.Control id="portal-help-contact" maxLength={300} value={form.help_contact} disabled={!form.portal_enabled}
                                             placeholder="e.g. WhatsApp 024 000 0000, Mon–Sat 7am–6pm"
                                             onChange={(e) => setForm({ ...form, help_contact: e.target.value })} />
                                   </Col>
                              </Row>
                              <Button type="submit" className={`${styles.primaryButton} mt-4`} disabled={saving}>
                                   {saving && <Spinner size="sm" animation="border" className="me-2" />}Save settings
                              </Button>
                         </Form>
                    </section>
               )}

               <section>
                    <div className={styles.visitHeader}>
                         <h2 className={`${styles.cardTitle} mb-0`}><RiHistoryLine size={18} />Portal audit log</h2>
                         <Form className="d-flex gap-2" onSubmit={applyAuditFilter}>
                              <Form.Control size="sm" placeholder="Patient number (internal ID)" inputMode="numeric" value={auditPatient}
                                   onChange={(e) => setAuditPatient(e.target.value.replace(/\D/g, ''))} aria-label="Filter by patient internal ID" />
                              <Button size="sm" type="submit" variant="outline-secondary">Filter</Button>
                         </Form>
                    </div>
                    {audit.error && <Alert variant="danger">{audit.error}</Alert>}
                    {audit.loading ? <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading activity...</div> : !audit.error && (
                         (audit.data || []).length === 0 ? <p className={styles.empty}>No portal activity recorded.</p> : (
                              <Table responsive hover size="sm" className={`${styles.table} align-middle`}>
                                   <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Patient</th><th>Reference</th><th>IP address</th></tr></thead>
                                   <tbody>
                                        {(audit.data || []).map((entry) => (
                                             <tr key={entry.id}>
                                                  <td className="text-nowrap">{formatDate(entry.created_at, true)}</td>
                                                  <td><span className="fw-semibold text-capitalize">{entry.actor_type}</span>{entry.actor_id ? ` #${entry.actor_id}` : ''}</td>
                                                  <td>{auditActionLabel(entry.action)}</td>
                                                  <td>{entry.patientid ?? '-'}</td>
                                                  <td>{entry.resource ? `${entry.resource}${entry.resource_id ? ` ${entry.resource_id}` : ''}` : '-'}</td>
                                                  <td>{entry.ip_address || '-'}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </Table>
                         )
                    )}
                    <div className="d-flex justify-content-between align-items-center">
                         <Button size="sm" variant="outline-secondary" disabled={auditPage <= 1 || audit.loading} onClick={() => setAuditPage(auditPage - 1)}>Previous</Button>
                         <span className="small text-muted">Page {auditPage}</span>
                         <Button size="sm" variant="outline-secondary" disabled={(audit.data || []).length < 50 || audit.loading} onClick={() => setAuditPage(auditPage + 1)}>Next</Button>
                    </div>
               </section>
          </main>
     );
}
