"use client";

import { type CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiMailSendLine, RiSettings4Line, RiShieldCrossFill, RiArrowGoBackLine, RiUserHeartLine, RiMenuLine, RiCloseLine } from '@remixicon/react';
import { ApplicationProvider } from '../Auth/useApplicationContext';
import { PatientPortalLinks } from '../Layout/links/categories/PatientPortalLinks';
import { handleLogout } from '../Auth/customFetch';
import { signOutPatient } from './signOutPatient';
import styles from './PortalShell.module.css';
import { workspaceFontFamily } from '../../lib/themes';

const adminLinks = [
    { title: 'Pending invitations', link: '/patient-portal-admin', icon: <RiMailSendLine /> },
    { title: 'Test requests', link: '/patient-portal-admin/requests', icon: <RiUserHeartLine /> },
    { title: 'Patient access', link: '/patient-portal-admin/access', icon: <RiUserHeartLine /> },
    { title: 'Settings & activity', link: '/patient-portal-admin/settings', icon: <RiSettings4Line /> },
];

export default function PortalShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
    const pathname = usePathname();
    const [signingOut, setSigningOut] = useState(false);
    const [context, setContext] = useState<any>(null);
    const [error, setError] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);
    useEffect(() => { setDrawerOpen(false); }, [pathname]);
    useEffect(() => {
        if (!drawerOpen) return;
        sidebar.current?.querySelector<HTMLElement>('a, button')?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setDrawerOpen(false);
            menuButton.current?.focus();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [drawerOpen]);
    useEffect(() => {
        let current = true;
        fetch('/api/auth/context-retrieval', { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(10000) })
            .then(async response => {
                const data = await response.json();
                if (!response.ok || !data.user) throw new Error('Your session could not be loaded. Sign in again.');
                if (current) {
                    const normalized = { ...data, user: data.user?.user || data.user };
                    try { localStorage.setItem('applicationsettings', JSON.stringify(normalized)); } catch { /* Cookies remain the source of truth. */ }
                    setContext(normalized);
                }
            })
            .catch(() => { if (current) setError('Your session could not be loaded. Please sign in again.'); });
        return () => { current = false; };
    }, []);
    const links = admin ? adminLinks : PatientPortalLinks;
    const title = admin ? 'Patient Portal Administration' : 'Patient Portal';
    const homeLink = admin ? '/patient-portal-admin' : '/patientportal';
    const user = context?.user;
    const identity = user ? [user.fullname || [user.firstname, user.lastname].filter(Boolean).join(' ') || user.username, user.email].filter(Boolean).join(' · ') : '';
    return (
        <div className={`${styles.scope} ${styles.shell} ${admin ? '' : styles.patientShell} ${drawerOpen ? styles.drawerOpen : ''}`} data-portal={admin ? 'admin' : 'patient'} style={context ? {
            '--theme-font-family': workspaceFontFamily(context.settings),
        } as CSSProperties : undefined}>
            <a className={styles.skipLink} href="#portal-content">Skip to content</a>
            {!admin && (
                <div className={styles.mobileBar}>
                    <Link href={homeLink} className={styles.mobileBrand}>
                        <span className={styles.brandMark}><RiShieldCrossFill size={18} aria-hidden="true" /></span>
                        <span>{title}</span>
                    </Link>
                    <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={drawerOpen} aria-controls="portal-navigation"
                        aria-label={drawerOpen ? 'Close menu' : 'Open menu'} onClick={() => setDrawerOpen(open => !open)}>
                        {drawerOpen ? <RiCloseLine size={22} aria-hidden="true" /> : <RiMenuLine size={22} aria-hidden="true" />}
                    </button>
                </div>
            )}
            {!admin && drawerOpen && <button type="button" className={styles.drawerBackdrop} aria-label="Close menu" tabIndex={-1} onClick={() => setDrawerOpen(false)} />}
            <aside ref={sidebar} id="portal-navigation" className={styles.sidebar} aria-label={title}>
                <div className={styles.brand}>
                    <span className={styles.brandMark}><RiShieldCrossFill size={20} aria-hidden="true" /></span>
                    <div><strong>Prime Laboratory Software</strong><small>{title}</small></div>
                </div>
                <div className={styles.sectionLabel}>{admin ? 'Patient management' : 'Your care'}</div>
                <nav className={styles.nav} aria-label={`${title} navigation`}>
                    {links.map(link => <Link key={link.link} href={link.link} aria-current={(link.link === homeLink ? pathname === link.link : pathname?.startsWith(link.link)) ? 'page' : undefined}>{link.icon}{link.title}</Link>)}
                    {admin && <Link href="/"><RiArrowGoBackLine aria-hidden="true" />Return to staff workspace</Link>}
                </nav>
                <div className={styles.footer}>
                    {identity && <span className={styles.identity}>{identity}</span>}
                    <button disabled={signingOut} onClick={async () => { setSigningOut(true); await (admin ? handleLogout() : signOutPatient()); }}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
                </div>
            </aside>
            <div className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <strong>{title}</strong>
                        <div className="muted">{admin ? 'Manage patient invitations, portal access and result release' : 'Your released results, appointments and bills'}</div>
                    </div>
                    {context && <span className={`${styles.status} ${styles.statusOk}`}>Signed in</span>}
                </header>
                <div id="portal-content" className={`${styles.main} ${admin ? '' : styles.patientContent}`}>
                    {error ? <div role="alert" className="alert alert-danger">{error} <Link href={admin ? '/authentications/login' : '/patient-access/login'}>Sign in</Link></div>
                        : context ? <ApplicationProvider initialSettings={context} key={`${context.tenantId}-${context.user?.role}`}>{children}</ApplicationProvider>
                            : <p role="status">Loading your session…</p>}
                </div>
            </div>
        </div>
    );
}
