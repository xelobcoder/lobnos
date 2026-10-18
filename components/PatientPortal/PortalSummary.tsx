import type { ReactNode } from 'react';
import styles from './PortalShell.module.css';

export default function PortalSummary({ items }: { items: { label: string; value: ReactNode; detail?: string; icon?: ReactNode }[] }) {
    return <dl className={styles.summaryGrid}>{items.map(item => <div className={styles.summaryCard} key={item.label}>
        <dt className={styles.summaryLabel}>{item.icon}<span>{item.label}</span></dt>
        <dd className={styles.summaryValue}>{item.value}</dd>
        {item.detail && <dd className={styles.summaryDetail}>{item.detail}</dd>}
    </div>)}</dl>;
}
