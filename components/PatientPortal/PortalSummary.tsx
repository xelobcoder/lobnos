import type { ReactNode } from 'react';
import styles from './PortalShell.module.css';
import AnalyticSummaryCard, { type SummaryVariant } from '../Billing/AnalyticSummaryCard';

export default function PortalSummary({ items, title = 'Summary' }: {
    items: { label: string; value: ReactNode; detail?: string; icon?: ReactNode; variant?: SummaryVariant }[];
    title?: string;
}) {
    return <section className={styles.summaryPanel} aria-label={title}>
        <h2 className={styles.summaryTitle}>{title}</h2>
        <div className={styles.summaryGrid}>{items.map(item => <AnalyticSummaryCard key={item.label}
            className={styles.summaryCard} title={item.label} value={item.value}
            detail={item.detail} icon={item.icon} variant={item.variant} />)}</div>
    </section>;
}
