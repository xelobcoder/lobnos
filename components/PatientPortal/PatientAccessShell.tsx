"use client";

import { ReactNode } from 'react';
import { RiLockLine, RiShieldCrossFill } from '@remixicon/react';
import styles from '../../app/authentications/login/login.module.css';

/** Login-page split layout for the public patient account activation pages. */
export default function PatientAccessShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
     return (
          <div className={styles.splitLayout}>
               <div className={styles.brandingSide}>
                    <div className={styles.brandOverlay}>
                         <div className={styles.brandContent}>
                              <div className={styles.brandLogo}>
                                   <RiShieldCrossFill size={48} className={styles.logoIcon} />
                                   <span className={styles.brandTitle}>Prime Laboratory Software (PLS)</span>
                              </div>
                              <div className={styles.brandText}>
                                   <h1 className={styles.heroTitle}>Your laboratory results, securely online</h1>
                                   <p className={styles.heroSubtitle}>
                                        Activate your patient portal account to view released results, appointments and bills from your facility.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
               <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                         <div className={styles.loginHeader}>
                              <h2 className={styles.welcomeTitle}>{title}</h2>
                              <p className={styles.welcomeSubtitle}>{subtitle}</p>
                         </div>
                         {children}
                         <div className={styles.footer}>
                              <p>© {new Date().getFullYear()} Prime Laboratory Software. All rights reserved.</p>
                         </div>
                    </div>
               </div>
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
