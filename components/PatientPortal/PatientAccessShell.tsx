"use client";

import { ReactNode } from 'react';
import { RiLockLine, RiShieldCrossFill } from '@remixicon/react';
import Link from 'next/link';
import styles from './PortalShell.module.css';

/** Login-page split layout for the public patient account activation pages. */
export default function PatientAccessShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
     return (
          <div className={`${styles.scope} ${styles.loginLayout}`}>
               <aside className={styles.loginBrand} aria-label="Prime Laboratory Software">
                    <div className={styles.loginBrandOverlay} />
                    <div className={styles.loginBrandContent}>
                         <div className={styles.loginLogo}><RiShieldCrossFill size={48} aria-hidden="true" /><strong>Prime Laboratory Software</strong></div>
                         <h2>Patient Portal</h2>
                         <p>Securely view the results your facility has released, along with your appointments and bills.</p>
                    </div>
               </aside>
               <main className={styles.loginFormSide}>
                    <div className={styles.loginCard}>
                         <div className={styles.loginCompactLogo}><RiShieldCrossFill size={32} aria-hidden="true" /><strong>Prime Laboratory Software</strong></div>
                         <h1>{title}</h1>
                         <p className={styles.loginSubtitle}>{subtitle}</p>
                         <div className={styles.loginMode}>Patient Portal</div>
                         {children}
                         <nav className={styles.loginLinks} aria-label="Patient account"><Link href="/patient-access/login">Patient sign in</Link><Link href="/patient-access/register">Activate account</Link><Link href="/authentications/login?returnTo=%2Fpatient-portal-admin">Staff sign in</Link></nav>
                         <p className={styles.loginFooter}>© {new Date().getFullYear()} Prime Laboratory Software</p>
                    </div>
               </main>
          </div>
     );
}

export function PasswordInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
     return (
          <div className={styles.formGroup}>
               <label htmlFor={id} className={styles.formLabel}>{label}</label>
               <div className={styles.inputWrapper}>
                    <RiLockLine size={20} className={styles.inputIcon} />
                    <input id={id} type="password" className={styles.formInput} autoComplete="new-password" maxLength={128}
                         placeholder="At least 8 characters with a letter and a number" value={value} onChange={(e) => onChange(e.target.value)} required />
               </div>
          </div>
     );
}

export { styles as accessStyles };
