'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ApplicationProvider, useApplicationSettings } from '../Auth/useApplicationContext';
import { clinicalApi } from './clinicalApi';
import { handleLogout } from '../Auth/customFetch';
import s from './Practitioner.module.css';
export function DoctorShellContent({ children }: {
    children: React.ReactNode;
}) {
    const path = usePathname(), { applicationsettings } = useApplicationSettings();
    const user = applicationsettings?.user?.user || applicationsettings?.user;
    const [loggingOut, setLoggingOut] = useState(false);
    const [caps, setCaps] = useState<any>(null), [error, setError] = useState('');
    useEffect(() => { let live = true; clinicalApi('capabilities').then(value => { if (live)
        setCaps(value); }).catch(e => { if (live)
        setError(e.message); }); return () => { live = false; }; }, []);
    const links = [['/doctor', 'Overview'], ['/doctor/consultation', caps?.practiceType === 'triage' ? 'Patients & vital signs' : 'Consultations'], ...(caps?.canLab ? [['/doctor/orders', 'Lab referrals']] : []), ...(caps?.canReadResults ? [['/doctor/validated-test-results', 'Released results']] : []), ...(caps?.canPrescribe ? [['/doctor/drug-orders', 'Prescriptions']] : []), ['/doctor/permissions', 'My access'], ...(caps?.canManage ? [['/doctor/access', 'Practitioner access']] : [])];
    return <div className={s.shell}><aside className={s.sidebar}><Link href="/doctor" className={s.brand}>{caps?.companyName || 'Practitioner portal'}<span>Practitioner workspace</span></Link><nav aria-label="Practitioner navigation">{links.map(([href, label]) => <Link key={href} href={href} aria-current={(path === href || (href !== '/doctor' && path.startsWith(href + '/'))) ? 'page' : undefined}>{label}</Link>)}</nav><div className={s.identity}><strong>{user?.username || 'Practitioner'}</strong><span>{caps?.practiceType === 'oversight' ? 'Clinical oversight' : caps?.practiceType || 'Checking access'}</span>{caps?.canManage && <Link href="/">Application home</Link>}</div></aside><div className={s.main}><div className={s.topbar}><span>Care · Consult · Refer</span><span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span><button className={s.textButton} disabled={loggingOut} onClick={() => { if (!(window as any).__clinicalUnsaved || window.confirm('Discard unsaved clinical changes and sign out?'))
        void handleLogout(setLoggingOut); }}>{loggingOut ? 'Signing out…' : 'Sign out'}</button></div>{error && <div role="alert" className={s.error}>{error}</div>}{children}</div></div>;
}
export default function DoctorShell({ children }: {
    children: React.ReactNode;
}) { return <ApplicationProvider><DoctorShellContent>{children}</DoctorShellContent></ApplicationProvider>; }
