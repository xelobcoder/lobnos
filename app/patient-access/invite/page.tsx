"use client";

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Spinner } from 'react-bootstrap';
import PatientAccessShell, { PasswordInput, accessStyles as styles } from '../../../components/PatientPortal/PatientAccessShell';
import { customPost } from '../../../components/Auth/customFetch';
import { errorMessage, formatDate, isInvitationToken, passwordProblem, unwrap } from '../../../lib/patientPortal';

interface Invitation {
     firstname?: string;
     loginUsername: string;
     expiresAt: string;
}

const INVALID = 'This invitation is invalid or has expired. Please ask the facility for a new one.';

function InviteForm() {
     const token = String(useSearchParams()?.get('token') || '').trim();
     const [invitation, setInvitation] = useState<Invitation | null>(null);
     const [checking, setChecking] = useState(true);
     const [password, setPassword] = useState('');
     const [confirmation, setConfirmation] = useState('');
     const [error, setError] = useState('');
     const [submitting, setSubmitting] = useState(false);
     const [activatedUsername, setActivatedUsername] = useState('');

     useEffect(() => {
          let current = true;
          if (!isInvitationToken(token)) {
               setError(INVALID);
               setChecking(false);
               return;
          }
          customPost('patient-portal/public/invitations/verify', 'POST', { token }, false, true)
               .then((response: any) => { if (current) setInvitation(unwrap<Invitation>(response, INVALID)); })
               .catch((reason: unknown) => { if (current) setError(errorMessage(reason, INVALID)); })
               .finally(() => { if (current) setChecking(false); });
          return () => { current = false; };
     }, [token]);

     const submit = async (event: FormEvent) => {
          event.preventDefault();
          const problem = passwordProblem(password, confirmation);
          if (problem) return setError(problem);
          setError('');
          setSubmitting(true);
          try {
               const response = await customPost('patient-portal/public/invitations/accept', 'POST', { token, password }, false, true);
               const result = unwrap<{ loginUsername: string }>(response, INVALID);
               setActivatedUsername(result.loginUsername);
               setPassword('');
               setConfirmation('');
          } catch (reason) {
               setError(errorMessage(reason));
          } finally {
               setSubmitting(false);
          }
     };

     if (checking) {
          return <div className="text-center py-4"><Spinner animation="border" size="sm" className="me-2" />Checking your invitation...</div>;
     }

     if (activatedUsername) {
          return (
               <>
                    <Alert variant="success" className="border-0 shadow-sm">
                         Your portal account is active. Sign in on the <strong>Patient Login</strong> tab with username <strong>{activatedUsername}</strong>.
                    </Alert>
                    <Link href="/authentications/login" className={`${styles.signInButton} text-decoration-none`}>Go to sign in</Link>
               </>
          );
     }

     if (!invitation) {
          return (
               <>
                    <Alert variant="danger" className="border-0 shadow-sm">{error || INVALID}</Alert>
                    <Link href="/authentications/login" className={`${styles.secondaryButton} text-decoration-none`}>Back to sign in</Link>
               </>
          );
     }

     return (
          <form className={styles.loginForm} onSubmit={submit} noValidate>
               <p className={styles.recoveryInstructions}>
                    {invitation.firstname ? `Hello ${invitation.firstname}. ` : ''}Your username is <strong>{invitation.loginUsername}</strong>.
                    Choose a password to activate your account. This invitation expires {formatDate(invitation.expiresAt, true)}.
               </p>
               {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
               <PasswordInput id="invite-password" label="New password" value={password} onChange={setPassword} />
               <PasswordInput id="invite-confirm" label="Confirm password" value={confirmation} onChange={setConfirmation} />
               <button type="submit" className={styles.signInButton} disabled={submitting}>
                    {submitting && <Spinner size="sm" animation="border" className="me-2" />}Activate account
               </button>
          </form>
     );
}

export default function PatientInvitePage() {
     return (
          <PatientAccessShell title="Activate your portal account" subtitle="Set a password using the invitation from your facility">
               <Suspense fallback={<div className="text-center py-4"><Spinner animation="border" size="sm" /></div>}>
                    <InviteForm />
               </Suspense>
          </PatientAccessShell>
     );
}
