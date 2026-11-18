import styles from './layout.module.css';

export default function PatientAnalyticsLayout({ children }: { children: React.ReactNode }) {
	return <div className={styles.shell}>{children}</div>;
}
