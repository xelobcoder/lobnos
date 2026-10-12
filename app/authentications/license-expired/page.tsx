'use client'
import styles from '../login/login.module.css';
import { RiShieldCrossFill, RiErrorWarningLine, RiBankCardLine } from '@remixicon/react';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

export default function LicenseExpiredPage() {
     const { applicationsettings } = useApplicationSettings();
     const company = applicationsettings?.company || "Your Company";

     return (
          <div className={styles.splitLayout}>
               {/* Left side - Branding */}
               <div className={styles.brandingSide}>
                    <div className={styles.brandOverlay}>
                         <div className={styles.brandContent}>
                              <div className={styles.brandLogo}>
                                   <RiShieldCrossFill size={48} className={styles.logoIcon} />
                                   <span className={styles.brandTitle}>Prime Laboratory Software (PLS)</span>
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
                                        Your license has expired or is invalid. Please renew your license to continue using the system.
                                   </p>
                              </div>
                         </div>

                         {/* Payment Instructions */}
                         <div className="card border-warning mb-4">
                              <div className="card-body text-center">
                                   <RiBankCardLine size={48} className="text-warning mb-3" />
                                   <h5 className="card-title text-warning">Renew Your License</h5>
                                   <p className="card-text mb-3">
                                        Make payment to renew your license and continue using Prime Laboratory Software.
                                   </p>
                                   <div className="bg-light p-3 rounded mb-3">
                                        <div className="mb-2">
                                             <strong>Mobile Money Number:</strong>
                                             <div className="h4 text-primary mb-0">059 596 4565</div>
                                        </div>
                                        <div>
                                             <strong>Reference:</strong>
                                             <div className="h5 text-success mb-0">{company} License Renewal </div>
                                        </div>
                                   </div>
                                   <p className="text-muted small mb-0">
                                        After payment, contact support for license activation.
                                   </p>
                              </div>
                         </div>

                         <div className="text-center">
                              <p className="text-muted">
                                   For assistance, please reach out to support at support@primelabsystem.com
                              </p>
                         </div>

                         <div className={styles.footer}>
                              <p>© {new Date().getFullYear()} Prime Laboratory Software. All rights reserved.</p>
                         </div>
                    </div>
               </div>
          </div>
     );
}