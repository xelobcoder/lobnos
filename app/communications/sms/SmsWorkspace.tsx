import styles from './SmsWorkspace.module.css';

export default function SmsWorkspace({ children }: { children: React.ReactNode }) {
 return <section className={styles.workspace} aria-label="SMS workspace"><div className={styles.content}>{children}</div></section>;
}
