"use client";

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Spinner } from 'react-bootstrap';
import PatientAccessShell, { accessStyles as styles } from '../../../components/PatientPortal/PatientAccessShell';
import { customPost } from '../../../components/Auth/customFetch';
import { establishPatientSession } from '../../../lib/patientPortalSession';
import { errorMessage } from '../../../lib/patientPortal';
import { catalogLoginDestination, clearCatalogSelection, readCatalogSelection, scheduleCatalogSelectionExpiry } from '../../../lib/catalogAppointmentSelection';

export default function PatientLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [hasSelection, setHasSelection] = useState(false);
    useEffect(() => {
        let current = true;
        let cancelTimer: (() => void) | undefined;
        Promise.resolve().then(() => {
            try {
                const selection = readCatalogSelection(sessionStorage);
                if (current) {
                    setHasSelection(Boolean(selection));
                    if (selection) cancelTimer = scheduleCatalogSelectionExpiry(sessionStorage, selection, () => setHasSelection(false));
                }
            } catch { /* Storage is unavailable. */ }
        });
        return () => { current = false; cancelTimer?.(); };
    }, []);
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            let deviceId = '';
            try {
                deviceId = localStorage.getItem('pls-device-id') || '';
                if (!deviceId) {
                    deviceId = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
                    localStorage.setItem('pls-device-id', deviceId);
                }
            } catch { /* Storage is optional for authentication. */ }
            const response = await customPost('login/patient', 'POST', { username: username.trim(), password, browserInfo: { deviceId, userAgent: navigator.userAgent, platform: navigator.platform } }, false, true);
            const context = await establishPatientSession(response);
            try { localStorage.setItem('applicationsettings', JSON.stringify(context)); } catch { /* Session remains available from the server. */ }
            let destination = '/patientportal';
            try { destination = catalogLoginDestination(sessionStorage); } catch { /* Continue to the portal. */ }
            window.location.assign(destination);
        } catch (reason) {
            setError(errorMessage(reason));
            setPassword('');
        } finally { setBusy(false); }
    };
    return (
        <PatientAccessShell title="Patient sign in" subtitle="View your released results, appointments and bills securely.">
            {hasSelection && <Alert variant="info">Sign in with your patient account at the selected facility. Your selected tests remain in this tab temporarily.
                {' '}<button type="button" onClick={() => { try { clearCatalogSelection(sessionStorage); } catch { /* Storage is unavailable. */ } setHasSelection(false); }}>Cancel and clear selection</button>
            </Alert>}
            {error && <Alert variant="danger" role="alert">{error}</Alert>}
            <form onSubmit={submit} className={styles.loginForm} aria-busy={busy}>
                <div className={styles.formGroup}><label htmlFor="patient-username" className={styles.formLabel}>Portal username</label><input id="patient-username" className={styles.formInput} style={{ paddingLeft: 10 }} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required maxLength={64} /><small className="text-muted">Use the username provided by your facility, for example PLS20154P004.</small></div>
                <div className={styles.formGroup}><label htmlFor="patient-password" className={styles.formLabel}>Password</label><input id="patient-password" className={styles.formInput} style={{ paddingLeft: 10 }} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} /></div>
                <button className={styles.signInButton} disabled={busy} type="submit">{busy && <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />}{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
            <p className="small text-muted mt-3">Need access? <Link href="/patient-access/register">Activate your account</Link> or open your facility invitation. Forgot your password? <Link href="/patient-access/forgot-password">Reset it</Link>.</p>
        </PatientAccessShell>
    );
}
