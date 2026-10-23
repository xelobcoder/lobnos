"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../../../components/Auth/customFetch';
import styles from '../../../components/common/DirectoryWorkspace.module.css';

export default function ClinicianView() {
  const clinicianid = useSearchParams()?.get('clinicianid');
  const [clinician, setClinician] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setClinician(null); setError('');
    if (!clinicianid || !/^[1-9]\d*$/.test(clinicianid)) { setError('Choose a valid clinician from the directory.'); setLoading(false); return; }
    setLoading(true);
    customFetch(`clinicians/getclinician?id=${encodeURIComponent(clinicianid)}`).then(response => {
      if (!active) return;
      if (!Array.isArray(response?.result) || !response.result.length) throw new Error(response?.message || 'This clinician could not be found.');
      setClinician(response.result[0]);
    }).catch(error => { if (active) setError(error?.message || 'Unable to load this clinician.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [clinicianid, attempt]);
  return <main className={styles.workspace}>
    <Link href="/clinicians" className={styles.back}>← Clinicians</Link>
    <header className={styles.header}><div><span className={styles.eyebrow}>CLINICIAN PROFILE</span><h1>{clinician?.name || 'Clinician details'}</h1><p>{clinician?.occupation || 'Contact information and referral management'}</p></div>
      {clinician && <div className={styles.actions}><Link href={`/clinicians/add-new?clinicianid=${clinicianid}`} className="btn btn-primary">Edit profile</Link><Link href={`/clinicians-analytics/${clinicianid}/overall`} className="btn btn-outline-secondary">View referral activity</Link></div>}
    </header>
    {loading ? <p role="status">Loading clinician profile…</p> : error ? <div className="alert alert-danger" role="alert"><p>{error}</p><button type="button" className="btn btn-outline-danger" onClick={() => setAttempt(value => value + 1)}>Try again</button></div> : clinician && <>
      <section className={styles.panel}><h2>Contact & professional details</h2><div className={`${styles.grid} mt-4`}>
        <dl><dt>Phone number</dt><dd>{clinician.phone ? <a href={`tel:${clinician.phone}`}>{clinician.phone}</a> : 'Not recorded'}</dd></dl>
        <dl><dt>Email address</dt><dd>{clinician.email ? <a href={`mailto:${clinician.email}`}>{clinician.email}</a> : 'Not recorded'}</dd></dl>
        <dl><dt>Occupation</dt><dd>{clinician.occupation || 'Not recorded'}</dd></dl>
        <dl><dt>Identifier</dt><dd>{clinician.identifier || 'Not recorded'}</dd></dl>
        <dl><dt>Location</dt><dd>{clinician.location || 'Not recorded'}</dd></dl>
        <dl><dt>Address</dt><dd>{clinician.address || 'Not recorded'}</dd></dl>
      </div></section>
      <section className={styles.panel}><h2>Billing & payments</h2><p className="small text-muted">Review payment information or the billing arrangements linked to this clinician.</p><div className={styles.actions}>
        <Link href={`/clinicians/payment-information/${clinicianid}`} className="btn btn-outline-primary">Payment information</Link>
        <Link href={`/billing/billing-strategy/clinician/${clinicianid}/check`} className="btn btn-outline-secondary">Billing arrangements</Link>
      </div></section>
    </>}
  </main>;
}
