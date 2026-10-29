'use client';
import { usePathname } from 'next/navigation';
import styles from './SmsWorkspace.module.css';

export default function SmsWorkspace({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 // The composer uses the same workspace typography and spacing as the billing editor.
 if (pathname === '/communications/sms/jobs') return <>{children}</>;
 return <section className={styles.workspace} aria-label="SMS workspace"><div className={styles.content}>{children}</div></section>;
}
