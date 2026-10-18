"use client";

import Link from 'next/link';
import { FormEvent, ReactElement, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Spinner } from 'react-bootstrap';
import { RiBuildingLine, RiCalendarLine, RiKeyLine, RiMailLine, RiUserHeartLine } from '@remixicon/react';
import PatientAccessShell, { PasswordInput, accessStyles as styles } from '../../../components/PatientPortal/PatientAccessShell';
import { customPost } from '../../../components/Auth/customFetch';
import { errorMessage, passwordProblem, registrationProblem, unwrap } from '../../../lib/patientPortal';

const FIELD = (id: string, label: string, Icon: typeof RiUserHeartLine, input: ReactElement, hint?: string) => (
     <div className={styles.formGroup}>
          <label htmlFor={id} className={styles.formLabel}>{label}</label>
          <div className={styles.inputWrapper}>
               <Icon size={20} className={styles.inputIcon} />
               {input}
          </div>
          {hint && <small className="text-muted">{hint}</small>}
     </div>
);

function RegisterForm() {
     const params = useSearchParams();
     const [details, setDetails] = useState({
          facility: String(params?.get('facility') || '').trim().toUpperCase(),
          patientNumber: '',
          dateOfBirth: '',
          email: '',
     });
     const [step, setStep] = useState<'details' | 'verify' | 'done'>('details');
     const [code, setCode] = useState('');
     const [password, setPassword] = useState('');
     const [confirmation, setConfirmation] = useState('');
     const [error, setError] = useState('');
     const [info, setInfo] = useState('');
     const [submitting, setSubmitting] = useState(false);
     const [loginUsername, setLoginUsername] = useState('');

     const payload = () => ({ ...details, facility: details.facility.trim().toUpperCase(), patientNumber: details.patientNumber.trim(), email: details.email.trim() });

     const start = async (event: FormEvent) => {
          event.preventDefault();
          const problem = registrationProblem(payload());
          if (problem) return setError(problem);
          setError('');
          setSubmitting(true);
          try {
               const response = await customPost('patient-portal/public/register/start', 'POST', payload(), false, true);
               unwrap(response);
               setInfo(response?.message || 'If your details match our records, a verification code has been sent to your registered email address.');
               setStep('verify');
          } catch (reason) {
               setError(errorMessage(reason));
          } finally {
               setSubmitting(false);
          }
     };

     const complete = async (event: FormEvent) => {
          event.preventDefault();
          if (!/^\d{6}$/.test(code.trim())) return setError('Enter the six-digit code from your email.');
          const problem = passwordProblem(password, confirmation);
          if (problem) return setError(problem);
          setError('');
          setSubmitting(true);
          try {
               const response = await customPost('patient-portal/public/register/complete', 'POST', { ...payload(), code: code.trim(), password }, false, true);
               const result = unwrap<{ loginUsername: string }>(response);
               setLoginUsername(result.loginUsername);
               setPassword('');
               setConfirmation('');
               setStep('done');
          } catch (reason) {
               setError(errorMessage(reason));
          } finally {
               setSubmitting(false);
          }
     };

     if (step === 'done') {
          return (
               <>
                    <Alert variant="success" className="border-0 shadow-sm">
                         Your portal account is active. Sign in on the <strong>Patient Login</strong> tab with username <strong>{loginUsername}</strong>.
                    </Alert>
                    <Link href="/patient-access/login" className={`${styles.signInButton} text-decoration-none`}>Go to sign in</Link>
               </>
          );
     }

     return (
          <>
               {info && step === 'verify' && <Alert variant="info" className="border-0 shadow-sm">{info}</Alert>}
               {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
               {step === 'details' ? (
                    <form className={styles.loginForm} onSubmit={start} noValidate>
                         <p className={styles.recoveryInstructions}>
                              Enter the details your facility holds for you. We will email a verification code to the address on your record.
                         </p>
                         {FIELD('facility', 'Facility code', RiBuildingLine,
                              <input id="facility" className={styles.formInput} value={details.facility} maxLength={32} placeholder="e.g. PLS20154"
                                   onChange={(e) => setDetails({ ...details, facility: e.target.value })} required />,
                              'The code at the start of usernames issued by your facility.')}
                         {FIELD('patient-number', 'Patient ID', RiUserHeartLine,
                              <input id="patient-number" className={styles.formInput} value={details.patientNumber} maxLength={64} placeholder="As printed on your receipt or report"
                                   onChange={(e) => setDetails({ ...details, patientNumber: e.target.value })} required />)}
                         {FIELD('dob', 'Date of birth', RiCalendarLine,
                              <input id="dob" type="date" className={styles.formInput} value={details.dateOfBirth}
                                   onChange={(e) => setDetails({ ...details, dateOfBirth: e.target.value })} required />)}
                         {FIELD('email', 'Registered email', RiMailLine,
                              <input id="email" type="email" autoComplete="email" className={styles.formInput} value={details.email} maxLength={254} placeholder="The email the facility has on record"
                                   onChange={(e) => setDetails({ ...details, email: e.target.value })} required />)}
                         <button type="submit" className={styles.signInButton} disabled={submitting}>
                              {submitting && <Spinner size="sm" animation="border" className="me-2" />}Send verification code
                         </button>
                    </form>
               ) : (
                    <form className={styles.loginForm} onSubmit={complete} noValidate>
                         {FIELD('code', 'Verification code', RiKeyLine,
                              <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={styles.formInput} value={code} placeholder="Six-digit code"
                                   onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />)}
                         <PasswordInput id="register-password" label="New password" value={password} onChange={setPassword} />
                         <PasswordInput id="register-confirm" label="Confirm password" value={confirmation} onChange={setConfirmation} />
                         <button type="submit" className={styles.signInButton} disabled={submitting}>
                              {submitting && <Spinner size="sm" animation="border" className="me-2" />}Activate account
                         </button>
                         <button type="button" className={styles.secondaryButton} disabled={submitting} onClick={() => { setStep('details'); setError(''); setCode(''); }}>
                              Change my details
                         </button>
                    </form>
               )}
               <p className="text-center small mt-3 mb-0">
                    Have an invitation link? Open it from your email. <Link href="/patient-access/login">Back to sign in</Link>
               </p>
          </>
     );
}

export default function PatientRegisterPage() {
     return (
          <PatientAccessShell title="Create your portal account" subtitle="For patients who have visited the facility">
               <Suspense fallback={<div className="text-center py-4"><Spinner animation="border" size="sm" /></div>}>
                    <RegisterForm />
               </Suspense>
          </PatientAccessShell>
     );
}
