'use client'
import styles from '../login/login.module.css';
import { RiShieldCrossFill, RiErrorWarningLine } from '@remixicon/react';

export default function LicenseExpiredPage() {
     return (
          <div className={styles.splitLayout}>
               {/* Left side - Branding */}
               <div className={styles.brandingSide}>
                    <div className={styles.brandOverlay}>
                         <div className={styles.brandContent}>
                              <div className={styles.brandLogo}>
                                   <RiShieldCrossFill size={48} className={styles.logoIcon} />
                                   <span className={styles.brandTitle}>Prime Lab System (PLS)</span>
                              </div>
                              <div className={styles.brandText}>
                                   <h1 className={styles.heroTitle}>Advanced Laboratory Management System</h1>
                                   <p className={styles.heroSubtitle}>
                                        Streamline your laboratory operations, enhance patient care, and drive efficiency with our comprehensive LIMS solution.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Right side - License Expired Message */}
               <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                         <div className={styles.loginHeader}>
                              <div className="text-center mb-4">
                                   <RiErrorWarningLine size={64} className="text-danger mb-3" />
                                   <h2 className={styles.welcomeTitle}>License Expired</h2>
                                   <p className={styles.welcomeSubtitle}>
                                        Your license has expired or is invalid. Please contact your administrator to renew the license.
                                   </p>
                              </div>
                         </div>

                         <div className="text-center">
                              <p className="text-muted">
                                   For assistance, please reach out to support at support@primelabsystem.com
                              </p>
                         </div>

                         <div className={styles.footer}>
                              <p>© {new Date().getFullYear()} Prime Laboratory System. All rights reserved.</p>
                         </div>
                    </div>
               </div>
          </div>
     );
}