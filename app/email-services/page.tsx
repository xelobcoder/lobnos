'use client';

import Link from 'next/link';
import EmailOverview from './_components/EmailOverview';
import ui from '../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './email-standard.module.css';

export default function EmailServicesHubPage() {
    return <main className={`${ui.workspace} ${styles.pageRoot}`}>
        <EmailOverview/>
        <section className={ui.panel}>
            <h2>Template libraries</h2>
            <p className={ui.help}>Reusable templates support manually composed emails. Event templates control automatic messages such as password resets, receipts and results.</p>
            <div className={ui.actions}>
                <Link className={ui.secondary} href="/email-services/templates">Reusable email templates</Link>
                <Link className={ui.secondary} href="/email-services/notifications/templates">Automatic notification templates</Link>
                <Link className={ui.secondary} href="/email-services/logs">Delivery logs</Link>
            </div>
        </section>
    </main>;
}
