import styles from './PayrollScreens.module.css';
export default function PayrollSummaryStrip({ label, items }: { label: string; items: Array<{ label: string; value: string | number; tone?: string }> }) {
 return <section className={styles.summaryStrip} aria-label={label}>{items.map(item=><div key={item.label}><span>{item.label}</span><strong data-tone={item.tone}>{item.value}</strong></div>)}</section>;
}
