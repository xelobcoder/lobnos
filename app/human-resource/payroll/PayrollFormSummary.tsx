import styles from './PayrollScreens.module.css';
export default function PayrollFormSummary({ title, items, help }: { title: string; items: Array<{ label: string; value: string }>; help: string }) {
 return <aside className={styles.reviewSummary} aria-label={title}><h2>{title}</h2><dl>{items.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value || 'Not set yet'}</dd></div>)}</dl><p>{help}</p></aside>;
}
