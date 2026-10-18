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
