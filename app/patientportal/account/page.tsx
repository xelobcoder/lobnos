"use client";
import NewPasswordInput from '../../../components/Auth/NewPasswordInput';


import { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { RiLockPasswordLine, RiLogoutBoxRLine, RiNotification3Line, RiUserLine } from '@remixicon/react';
import styles from '../../../components/PatientPortal/portal.module.css';
import { usePortalResource } from '../../../components/PatientPortal/usePortalResource';
import { customFetchMutation, handleLogout } from '../../../components/Auth/customFetch';
import { signOutPatient } from '../../../components/PatientPortal/signOutPatient';
import { errorMessage, formatDate, fullName, passwordProblem, unwrap } from '../../../lib/patientPortal';

interface PatientProfile {
     fullpatientid?: string;
     firstname?: string;
     middlename?: string;
     lastname?: string;
     gender?: string;
     dob?: string;
     age?: number;
     agetype?: string;
     email?: string;
     mobile_number?: string;
     mobile_country_code?: string;
     account?: { activated_at?: string | null; last_login_at?: string | null; notify_email?: boolean | number; notify_sms?: boolean | number } | null;
}

export default function PatientAccountPage() {
     const { data, loading, error, reload } = usePortalResource<PatientProfile>('patient-portal/me');
     const [preferences, setPreferences] = useState({ notify_email: false, notify_sms: false });
     const [savingPreferences, setSavingPreferences] = useState(false);
     const [preferenceNotice, setPreferenceNotice] = useState<{ variant: string; text: string } | null>(null);
     const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
     const [passwordNotice, setPasswordNotice] = useState<{ variant: string; text: string } | null>(null);
     const [changingPassword, setChangingPassword] = useState(false);
     const [signingOut, setSigningOut] = useState(false);

     useEffect(() => {
          if (data?.account) {
               setPreferences({ notify_email: Boolean(Number(data.account.notify_email)), notify_sms: Boolean(Number(data.account.notify_sms)) });
          }
     }, [data]);

     const savePreferences = async (event: FormEvent) => {
          event.preventDefault();
          setSavingPreferences(true);
          setPreferenceNotice(null);
          try {
               const response = await customFetchMutation('patient-portal/preferences', 'PUT', preferences);
               unwrap(response);
               setPreferenceNotice({ variant: 'success', text: 'Notification preferences saved.' });
          } catch (reason) {
               setPreferenceNotice({ variant: 'danger', text: errorMessage(reason) });
          } finally {
               setSavingPreferences(false);
          }
     };

     const changePassword = async (event: FormEvent) => {
          event.preventDefault();
          if (!passwords.currentPassword) return setPasswordNotice({ variant: 'danger', text: 'Enter your current password.' });
          const problem = passwordProblem(passwords.newPassword, passwords.confirmation);
          if (problem) return setPasswordNotice({ variant: 'danger', text: problem });
          if (passwords.newPassword === passwords.currentPassword) {
               return setPasswordNotice({ variant: 'danger', text: 'Choose a password different from your current one.' });
          }
          setChangingPassword(true);
          setPasswordNotice(null);
          try {
               const response = await customFetchMutation('patient-portal/password', 'PUT', {
                    currentPassword: passwords.currentPassword, newPassword: passwords.newPassword,
               });
               unwrap(response);
               setPasswords({ currentPassword: '', newPassword: '', confirmation: '' });
               setPasswordNotice({ variant: 'success', text: 'Password changed. Please sign in again with your new password.' });
               // The password change ends every session, so the current one is cleared too.
               await handleLogout();
          } catch (reason) {
               setPasswordNotice({ variant: 'danger', text: errorMessage(reason) });
               setChangingPassword(false);
          }
     };

     const signOut = async () => {
          setSigningOut(true);
          await signOutPatient();
     };

     const account = data?.account;

     return (
          <main className={styles.page}>
               <div className={styles.header}>
                    <div>
                         <h1 className={styles.title}>My Account</h1>
                         <p className={styles.subtitle}>Your details, notifications and sign-in security.</p>
                    </div>
                    <Button variant="outline-danger" onClick={signOut} disabled={signingOut}>
                         {signingOut ? <Spinner size="sm" animation="border" className="me-2" /> : <RiLogoutBoxRLine size={16} className="me-1" />}Sign out
                    </Button>
               </div>

               {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{error}<Button size="sm" variant="outline-danger" onClick={reload}>Retry</Button></Alert>}
               {loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading your account...</div>}

               {data && (
                    <>
                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiUserLine size={18} />Profile</h2>
                              <div className={styles.reportMeta}>
                                   <div><span className="text-muted small">Name</span><div>{fullName(data) || '-'}</div></div>
                                   <div><span className="text-muted small">Patient ID</span><div>{data.fullpatientid || '-'}</div></div>
                                   <div><span className="text-muted small">Gender</span><div className="text-capitalize">{data.gender || '-'}</div></div>
                                   <div><span className="text-muted small">Date of birth</span><div>{formatDate(data.dob)}</div></div>
                                   <div><span className="text-muted small">Email</span><div>{data.email || '-'}</div></div>
                                   <div><span className="text-muted small">Phone</span><div>{data.mobile_number ? `${data.mobile_country_code ? `+${String(data.mobile_country_code).replace(/^\+/, '')} ` : ''}${data.mobile_number}` : '-'}</div></div>
                                   <div><span className="text-muted small">Account activated</span><div>{formatDate(account?.activated_at, true)}</div></div>
                                   <div><span className="text-muted small">Last sign-in</span><div>{formatDate(account?.last_login_at, true)}</div></div>
                              </div>
                              <p className="text-muted small mb-0">To correct your personal details, please contact the facility.</p>
                         </section>

                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiNotification3Line size={18} />Notifications</h2>
                              {preferenceNotice && <Alert variant={preferenceNotice.variant}>{preferenceNotice.text}</Alert>}
                              <Form onSubmit={savePreferences}>
                                   <Form.Check type="switch" id="notify-email" label="Email me when my results are ready" className="mb-2"
                                        checked={preferences.notify_email} onChange={(e) => setPreferences({ ...preferences, notify_email: e.target.checked })} />
                                   <Form.Check type="switch" id="notify-sms" label="Send me an SMS when my results are ready" className="mb-3"
                                        checked={preferences.notify_sms} onChange={(e) => setPreferences({ ...preferences, notify_sms: e.target.checked })} />
                                   <Button type="submit" className={styles.primaryButton} disabled={savingPreferences}>
                                        {savingPreferences && <Spinner size="sm" animation="border" className="me-2" />}Save preferences
                                   </Button>
                              </Form>
                         </section>

                         <section className={styles.card}>
                              <h2 className={styles.cardTitle}><RiLockPasswordLine size={18} />Change password</h2>
                              {passwordNotice && <Alert variant={passwordNotice.variant}>{passwordNotice.text}</Alert>}
                              <Form onSubmit={changePassword} noValidate>
                                   <Row className="g-3">
                                        <Col md={4}>
                                             <Form.Label htmlFor="current-password">Current password</Form.Label>
                                             <Form.Control id="current-password" type="password" autoComplete="current-password" value={passwords.currentPassword}
                                                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                                        </Col>
                                        <Col md={4}>
                                             <Form.Label htmlFor="new-password">New password</Form.Label>
                                             <NewPasswordInput id="new-password" type="password" autoComplete="new-password" maxLength={128} value={passwords.newPassword}
                                                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                                             <Form.Text>At least 8 characters with a letter and a number.</Form.Text>
                                        </Col>
                                        <Col md={4}>
                                             <Form.Label htmlFor="confirm-password">Confirm new password</Form.Label>
                                             <Form.Control id="confirm-password" type="password" autoComplete="new-password" maxLength={128} value={passwords.confirmation}
                                                  onChange={(e) => setPasswords({ ...passwords, confirmation: e.target.value })} required />
                                        </Col>
                                   </Row>
                                   <Button type="submit" className={`${styles.primaryButton} mt-3`} disabled={changingPassword}>
                                        {changingPassword && <Spinner size="sm" animation="border" className="me-2" />}Change password
                                   </Button>
                              </Form>
                         </section>
                    </>
               )}
          </main>
     );
}
