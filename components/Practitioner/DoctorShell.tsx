'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiDashboardLine, RiStethoscopeLine, RiTestTubeLine, RiFileCheckLine, RiCapsuleLine, RiShieldUserLine, RiUserSettingsLine, RiMenuLine, RiCloseLine, RiLogoutBoxRLine, RiArrowGoBackLine, RiShieldCrossFill } from '@remixicon/react';
import { ApplicationProvider, useApplicationSettings } from '../Auth/useApplicationContext';
import { clinicalApi } from './clinicalApi';
import { handleLogout } from '../Auth/customFetch';
import s from './DoctorShell.module.css';
export function DoctorShellContent({ children }: { children: React.ReactNode }) {
    const path = usePathname(), { applicationsettings } = useApplicationSettings();
    const user = applicationsettings?.user?.user || applicationsettings?.user;
    const [loggingOut, setLoggingOut] = useState(false), [drawerOpen, setDrawerOpen] = useState(false);
    const [caps, setCaps] = useState<any>(null), [error, setError] = useState('');
    const menuButton = useRef<HTMLButtonElement>(null), sidebar = useRef<HTMLElement>(null);
    useEffect(() => { let live = true; clinicalApi('capabilities').then(value => { if (live) setCaps(value); }).catch(e => { if (live) setError(e.message); }); return () => { live = false; }; }, []);
    useEffect(() => { setDrawerOpen(false); }, [path]);
    useEffect(() => {
        if (!drawerOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        sidebar.current?.querySelector<HTMLElement>('a, button')?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { setDrawerOpen(false); menuButton.current?.focus(); }
            if (event.key === 'Tab') {
                const nodes = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)') || []);
                const first = nodes[0], last = nodes[nodes.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }
        };
        const resized = () => { if (window.innerWidth > 800) setDrawerOpen(false); };
        document.addEventListener('keydown', onKey); window.addEventListener('resize', resized);
        return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', resized); };
    }, [drawerOpen]);
    const roleLabel = ({ external: 'Referring practitioner', facility: 'Facility practitioner', pharmacy: 'Pharmacy practitioner', oversight: 'Clinical oversight', triage: 'Vital signs & triage' } as Record<string,string>)[caps?.practiceType] || 'Practitioner';
    const clinicalLinks = [
        { href:'/doctor', label:'Overview', icon:RiDashboardLine },
        { href:'/doctor/consultation', label:caps?.practiceType === 'triage' ? 'Patients & vital signs' : 'Consultations', icon:RiStethoscopeLine },
        ...(caps?.canLab ? [{href:'/doctor/orders',label:'Lab referrals',icon:RiTestTubeLine}] : []),
        ...(caps?.canReadResults ? [{href:'/doctor/validated-test-results',label:'Released results',icon:RiFileCheckLine}] : []),
        ...(caps?.canPrescribe ? [{href:'/doctor/drug-orders',label:'Prescriptions',icon:RiCapsuleLine}] : []),
    ];
    const accessLinks = [{href:'/doctor/permissions',label:'My access',icon:RiShieldUserLine},...(caps?.canManage ? [{href:'/doctor/access',label:'Practitioner access',icon:RiUserSettingsLine}] : [])];
    const active = (href:string) => path === href || href !== '/doctor' && path.startsWith(href + '/');
    const current = [...clinicalLinks,...accessLinks].find(link => active(link.href))?.label || 'Doctor portal';
    const username = user?.username || 'Practitioner';
    const initials = username.split(/\s+/).filter(Boolean).slice(0,2).map((part:string)=>part[0]).join('').toUpperCase();
    const nav = (links:typeof clinicalLinks) => links.map(({href,label,icon:Icon}) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} onClick={()=>{ if (!(window as any).__clinicalUnsaved) setDrawerOpen(false); }}><Icon size={19} aria-hidden="true"/><span>{label}</span></Link>);
    const closeMenu = () => { setDrawerOpen(false); menuButton.current?.focus(); };
    return <div className={[s.shell,drawerOpen ? s.drawerOpen : ''].join(' ')}>
        <a className={s.skipLink} href="#doctor-content">Skip to content</a>
        {drawerOpen && <button type="button" className={s.backdrop} aria-label="Close navigation" tabIndex={-1} onClick={closeMenu}/>}
        <aside ref={sidebar} id="doctor-navigation" className={s.sidebar} aria-label="Doctor portal">
            <div className={s.brand}><Link href="/doctor"><span className={s.brandMark}><RiShieldCrossFill size={22} aria-hidden="true"/></span><span><strong>{caps?.companyName || 'Prime Laboratory Software'}</strong><small>Doctor portal</small></span></Link><button type="button" className={s.drawerClose} aria-label="Close menu" onClick={closeMenu}><RiCloseLine size={22}/></button></div>
            <div className={s.sectionLabel}>Clinical workspace</div>
            <nav className={s.nav} aria-label="Practitioner navigation">{nav(clinicalLinks)}</nav>
            <div className={s.sectionLabel}>Account & access</div>
            <nav className={s.nav} aria-label="Practitioner account">{nav(accessLinks)}{caps?.canManage && <Link href="/"><RiArrowGoBackLine size={19} aria-hidden="true"/><span>Application home</span></Link>}</nav>
            <footer className={s.footer}><span>{roleLabel}</span><button type="button" disabled={loggingOut} onClick={() => { if (!(window as any).__clinicalUnsaved || window.confirm('Discard unsaved clinical changes and sign out?')) void handleLogout(setLoggingOut); }}><RiLogoutBoxRLine size={18} aria-hidden="true"/>{loggingOut ? 'Signing out…' : 'Sign out'}</button><small>Prime Laboratory Software</small></footer>
        </aside>
        <div className={s.content}><header className={s.header}>
            <button ref={menuButton} type="button" className={s.menuButton} aria-label="Open menu" aria-expanded={drawerOpen} aria-controls="doctor-navigation" onClick={()=>setDrawerOpen(open=>!open)}><RiMenuLine size={22}/></button>
            <div className={s.headerTitle}><small>Doctor portal</small><strong>{current}</strong></div>
            <div className={s.headerRight}><span className={s.date}>{new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span><span className={s.avatar} aria-hidden="true">{initials}</span><div className={s.profile}><strong>{username}</strong><small>{roleLabel}</small></div><span className={caps ? s.status : s.statusPending}>{caps ? 'Signed in' : error ? 'Check access' : 'Checking access'}</span></div>
        </header><div id="doctor-content" className={s.main}>{error && <div role="alert" className={s.error}>{error}</div>}{children}</div></div>
    </div>;
}
export default function DoctorShell({ children }: { children: React.ReactNode }) { return <ApplicationProvider><DoctorShellContent>{children}</DoctorShellContent></ApplicationProvider>; }
