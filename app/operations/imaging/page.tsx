'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { filterRoleSidebar, roleSidebarSource } from '../../../components/Layout/links/RoleSidebars';
import { ImagingLinks } from '../../../components/Layout/links/categories/imaginglinks';
import ui from '../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from '../../../components/operations/ClinicalWorkspace.module.css';

const iconColors = ['#E53935', '#1E88E5', '#8E24AA', '#43A047', '#FB8C00', '#00ACC1', '#5D4037'];

const isReportLink = (path: string) => path.startsWith('/analytics/') || path.endsWith('/audit') || path.startsWith('/compliance/');

const descriptions: Record<string, string> = {
    '/operations/imaging/ultrasound/requisitions': 'Request supplies, receive stock and record usage with branch-specific permission.',
    '/operations/imaging/ultrasound': 'Review patients waiting for imaging and start their reports.',
    '/operations/imaging/ultrasound/processedlist': 'Find completed imaging examinations and reports.',
    '/operations/imaging/ultrasound/templates': 'Create reusable templates for imaging reports.',
    '/operations/imaging/ultrasound/templates/list': 'Browse and manage your ultrasound report templates.',
    '/analytics/imaging': 'Explore imaging activity and reporting analytics.',
    '/operations/imaging/audit': 'Review the history of changes to imaging results.',
    '/compliance/incident-reporting': 'Report and follow up on clinical and operational incidents.',
};

export default function ImagingWorkspace() {
    const { user, settings } = useApplicationSettings().applicationsettings;
    const permissionRequired = useSearchParams().get('stockAccess') === 'required';
    const links = filterRoleSidebar(roleSidebarSource(user?.role, ImagingLinks), user?.role, settings || {})
        .filter(item => item.link !== '/operations/imaging');
    const groups = [
        { id: 'imaging-daily', title: 'Daily workflows', description: 'Open worklists, manage templates and track departmental supplies.', reports: false },
        { id: 'imaging-reports', title: 'Reports & oversight', description: 'Review activity, investigate changes and follow up on incidents.', reports: true },
    ];

    return (
        <section className={`${ui.workspace} ${styles.dashboard}`}>
            <header className={`${ui.header} ${styles.dashboardHeader}`}>
                <span className={ui.eyebrow}>Clinical workspace</span>
                <h1 style={{ color: '#1E88E5' }}>Imaging Operations</h1>
                <p>Manage imaging requests, reports, templates and departmental supplies.</p>
            </header>
            {permissionRequired && (
                <div className={styles.stockNotice} role="alert">
                    <h2>Stock permission required</h2>
                    <p>Imaging stock access has not been granted for your current branch.
                        Ask an administrator to enable imaging request, receive or consume permission.</p>
                    <p className={styles.permissionPath}>Inventory → Department stock → Imaging → Staff permissions</p>
                </div>
            )}
            <nav className={styles.workflowGroups} aria-label="Imaging workflows">
                {groups.map(group => {
                    const groupLinks = links.filter(item => isReportLink(item.link) === group.reports);
                    if (!groupLinks.length) return null;
                    return <section key={group.id} aria-labelledby={group.id}>
                        <div className={styles.groupHeader}>
                            <h2 id={group.id}>{group.title}</h2>
                            <p className={ui.muted}>{group.description}</p>
                        </div>
                        <div className={styles.cards}>
                            {groupLinks.map(item => {
                                const index = links.indexOf(item);
                                return (
                                    <Link href={item.link} className={`${ui.panel} ${styles.card}`} key={item.link}>
                                        <div className={styles.cardHeading}>
                                            <span className={styles.cardIcon} style={{ color: iconColors[index % iconColors.length] }} aria-hidden="true">{item.icon}</span>
                                            <h3>{item.title}</h3>
                                        </div>
                                        {descriptions[item.link] && <p className={ui.muted}>{descriptions[item.link]}</p>}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>;
                })}
            </nav>
        </section>
    );
}
