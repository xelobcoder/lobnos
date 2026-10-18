"use client";

import { FormEvent, useState } from 'react';
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { RiFileCopyLine, RiMailSendLine, RiUserHeartLine } from '@remixicon/react';
import styles from './portal.module.css';
import { usePortalResource } from './usePortalResource';
import { customFetchMutation } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { roleAllowed } from '../Auth/roles';
import {
     PortalTest, accountStateLabel, errorMessage, formatDate, resultStatus, staffReleaseAction, unwrap,
} from '../../lib/patientPortal';

interface AccessSummary {
     patientid: number;
     loginUsername: string;
     hasEmail: boolean;
     email: string | null;
     account: { status: string; activation_method?: string; activated_at?: string; last_login_at?: string; locked_until?: string; disabled_at?: string } | null;
     invitations: { id: number; state: 'pending' | 'used' | 'revoked' | 'expired'; expires_at: string; created_at: string }[];
     portalEnabled: boolean;
     invitationsEnabled: boolean;
}

const INVITATION_VARIANT: Record<string, string> = { pending: 'warning', used: 'success', revoked: 'secondary', expired: 'secondary' };

/** Staff controls for one patient's portal account: invitations, access and per-test result release. */
export default function PatientPortalAccessPanel({ patientid }: { patientid: number }) {
     const { applicationsettings } = useApplicationSettings();
     const role = String(applicationsettings?.user?.role || '');
     // Mirrors PORTAL_SETTINGS_ROLES and RELEASE_ROLES in the backend portal router.
     const canManageAccess = roleAllowed(role, ['admin', 'manager']);
     const canRelease = roleAllowed(role, ['admin', 'manager', 'scientist']);
     const access = usePortalResource<AccessSummary>(`patient-portal/admin/patients/${patientid}/access`);
     const results = usePortalResource<PortalTest[]>(`patient-portal/admin/patients/${patientid}/results`);
     const [busy, setBusy] = useState('');
     const [notice, setNotice] = useState<{ variant: string; text: string } | null>(null);
     const [sendEmail, setSendEmail] = useState(true);
     const [inviteLink, setInviteLink] = useState('');
     const [withdrawing, setWithdrawing] = useState<PortalTest | null>(null);
     const [withdrawReason, setWithdrawReason] = useState('');

     const run = async (key: string, action: () => Promise<{ message?: string } | void>, after?: () => void) => {
          setBusy(key);
          setNotice(null);
          try {
               const result = await action();
               if (result && result.message) setNotice({ variant: 'success', text: result.message });
               after?.();
          } catch (reason) {
               setNotice({ variant: 'danger', text: errorMessage(reason) });
          } finally {
               setBusy('');
          }
     };

     const invite = () => run('invite', async () => {
          const response = await customFetchMutation(`patient-portal/admin/patients/${patientid}/invitations`, 'POST', { sendEmail: sendEmail && !!access.data?.hasEmail });
          const invitation = unwrap<{ link: string }>(response);
          setInviteLink(invitation.link);
          return response;
     }, access.reload);

     const revoke = (id: number) => run(`revoke-${id}`, async () => {
          const response = await customFetchMutation(`patient-portal/admin/invitations/${id}/revoke`, 'POST');
          unwrap(response);
          return response;
     }, access.reload);

     const setEnabled = (enabled: boolean) => run('access', async () => {
          const response = await customFetchMutation(`patient-portal/admin/patients/${patientid}/access`, 'PUT', { enabled });
          unwrap(response);
          return response;
     }, access.reload);

     const release = (test: PortalTest) => run(`release-${test.ascensionid}`, async () => {
          const response = await customFetchMutation(`patient-portal/admin/results/${test.ascensionid}/release`, 'POST');
          unwrap(response);
          return response;
     }, results.reload);

     const withdraw = (event: FormEvent) => {
          event.preventDefault();
          if (!withdrawing) return;
          if (withdrawReason.trim().length < 3) return setNotice({ variant: 'danger', text: 'A reason of at least 3 characters is required to withdraw a result.' });
          const test = withdrawing;
          return run(`withdraw-${test.ascensionid}`, async () => {
               const response = await customFetchMutation(`patient-portal/admin/results/${test.ascensionid}/withdraw`, 'POST', { reason: withdrawReason.trim() });
               unwrap(response);
               setWithdrawing(null);
               setWithdrawReason('');
               return response;
          }, results.reload);
     };

     const copyLink = async () => {
          try {
               await navigator.clipboard.writeText(inviteLink);
               setNotice({ variant: 'success', text: 'Invitation link copied.' });
          } catch {
               setNotice({ variant: 'warning', text: 'Copy the link manually from the box below.' });
          }
     };

     const data = access.data;
     const state = accountStateLabel(data?.account);

     return (
          <section id="patient-portal-access" className={`${styles.card} m-3`} aria-labelledby="patient-portal-access-title">
               <h2 id="patient-portal-access-title" className={styles.cardTitle}><RiUserHeartLine size={18} />Patient portal access</h2>
               {access.loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading portal access...</div>}
               {access.error && <Alert variant="danger" className="d-flex justify-content-between align-items-center">{access.error}<Button size="sm" variant="outline-danger" onClick={access.reload}>Retry</Button></Alert>}
               {notice && <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}

               {data && (
                    <>
                         {!data.portalEnabled && <Alert variant="info">The patient portal is turned off. An administrator can enable it in Application Settings › Patient Portal.</Alert>}
                         <div className={styles.reportMeta}>
                              <div><span className="text-muted small">Portal username</span><div className="fw-semibold">{data.loginUsername}</div></div>
                              <div><span className="text-muted small">Account</span><div><Badge bg={state.variant}>{state.label}</Badge></div></div>
                              <div><span className="text-muted small">Email on record</span><div>{data.hasEmail ? data.email : 'None — invitations cannot be emailed'}</div></div>
                              <div><span className="text-muted small">Last sign-in</span><div>{formatDate(data.account?.last_login_at, true)}</div></div>
                         </div>

                         <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                              {data.portalEnabled && data.invitationsEnabled && data.account?.status !== 'active' && (
                                   <>
                                        <Form.Check type="checkbox" id={`invite-email-${patientid}`} label="Email the invitation" checked={sendEmail && data.hasEmail}
                                             disabled={!data.hasEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                                        <Button className={styles.primaryButton} onClick={invite} disabled={!!busy}>
                                             {busy === 'invite' ? <Spinner size="sm" animation="border" className="me-2" /> : <RiMailSendLine size={16} className="me-1" />}Create invitation
                                        </Button>
                                   </>
                              )}
                              {canManageAccess && data.account && (data.account.status === 'disabled' ? (
                                   <Button variant="outline-success" onClick={() => setEnabled(true)} disabled={!!busy}>Enable portal access</Button>
                              ) : (
                                   <Button variant="outline-danger" onClick={() => setEnabled(false)} disabled={!!busy}>Disable access and sign out</Button>
                              ))}
                         </div>

                         {inviteLink && (
                              <Alert variant="success">
                                   <div className="mb-2">Share this single-use link with the patient. It is shown only once.</div>
                                   <div className="d-flex gap-2">
                                        <Form.Control size="sm" readOnly value={inviteLink} onFocus={(e) => e.target.select()} aria-label="Invitation link" />
                                        <Button size="sm" variant="outline-secondary" onClick={copyLink}><RiFileCopyLine size={16} /></Button>
                                   </div>
                              </Alert>
                         )}

                         {data.invitations.length > 0 && (
                              <Table responsive size="sm" className={`${styles.table} align-middle mb-4`}>
                                   <thead><tr><th>Invitation</th><th>Created</th><th>Expires</th><th>Status</th><th /></tr></thead>
                                   <tbody>
                                        {data.invitations.map((invitation) => (
                                             <tr key={invitation.id}>
                                                  <td>#{invitation.id}</td>
                                                  <td>{formatDate(invitation.created_at, true)}</td>
                                                  <td>{formatDate(invitation.expires_at, true)}</td>
                                                  <td><Badge bg={INVITATION_VARIANT[invitation.state] || 'secondary'} className="text-capitalize">{invitation.state}</Badge></td>
                                                  <td className="text-end">
                                                       {invitation.state === 'pending' && (
                                                            <Button size="sm" variant="outline-danger" onClick={() => revoke(invitation.id)} disabled={!!busy}>Revoke</Button>
                                                       )}
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </Table>
                         )}
                    </>
               )}

               <h3 className={`${styles.cardTitle} mt-2`}>Results visible in the portal</h3>
               {results.loading && <div className={styles.empty}><Spinner animation="border" size="sm" className="me-2" />Loading results...</div>}
               {results.error && <Alert variant="danger">{results.error}</Alert>}
               {results.data && (results.data.length === 0 ? <p className={styles.empty}>This patient has no tests.</p> : (
                    <Table responsive hover size="sm" className={`${styles.table} align-middle mb-0`}>
                         <thead><tr><th>Test</th><th>Bill #</th><th>Requested</th><th>Portal status</th><th /></tr></thead>
                         <tbody>
                              {results.data.map((test) => {
                                   const status = resultStatus(test);
                                   const action = canRelease ? staffReleaseAction(test) : null;
                                   return (
                                        <tr key={test.ascensionid}>
                                             <td>{test.testname}</td>
                                             <td>{test.billingid}</td>
                                             <td>{formatDate(test.requestedOn)}</td>
                                             <td><Badge bg={status.variant}>{status.label}</Badge></td>
                                             <td className="text-end">
                                                  {action === 'release' && (
                                                       <Button size="sm" className={styles.primaryButton} onClick={() => release(test)} disabled={!!busy}>
                                                            {busy === `release-${test.ascensionid}` && <Spinner size="sm" animation="border" className="me-1" />}Release
                                                       </Button>
                                                  )}
                                                  {action === 'withdraw' && (
                                                       <Button size="sm" variant="outline-danger" onClick={() => { setWithdrawReason(''); setWithdrawing(test); }} disabled={!!busy}>Withdraw</Button>
                                                  )}
                                             </td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </Table>
               ))}

               <Modal show={!!withdrawing} onHide={() => !busy && setWithdrawing(null)} centered>
                    <Form onSubmit={withdraw}>
                         <Modal.Header closeButton><Modal.Title as="h5">Withdraw result from the portal</Modal.Title></Modal.Header>
                         <Modal.Body>
                              <p className="small text-muted">{withdrawing?.testname} will be hidden from the patient until it is released again.</p>
                              <Form.Label htmlFor="withdraw-reason">Reason</Form.Label>
                              <Form.Control id="withdraw-reason" as="textarea" rows={3} maxLength={500} value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} required />
                         </Modal.Body>
                         <Modal.Footer>
                              <Button variant="outline-secondary" onClick={() => setWithdrawing(null)} disabled={!!busy}>Cancel</Button>
                              <Button type="submit" variant="danger" disabled={!!busy}>
                                   {busy.startsWith('withdraw') && <Spinner size="sm" animation="border" className="me-2" />}Withdraw
                              </Button>
                         </Modal.Footer>
                    </Form>
               </Modal>
          </section>
     );
}
