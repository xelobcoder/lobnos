import type { ReactNode } from 'react';
import styles from './AnalyticSummaryCard.module.css';

export type SummaryVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

export default function AnalyticSummaryCard({ title, value, icon, detail, variant = 'primary', className = '' }: {
    title: string;
    value: ReactNode;
    icon?: ReactNode;
    detail?: string;
    variant?: SummaryVariant;
    className?: string;
}) {
    return <dl className={`${styles.card} bg-${variant} bg-gradient text-white border-0 shadow-sm rounded-3 h-100 ${className}`}>
        <dt className={styles.label}><span>{title}</span><span aria-hidden="true">{icon}</span></dt>
        <dd className={styles.value}>{value}</dd>
        {detail && <dd className={styles.detail}>{detail}</dd>}
    </dl>;
}
