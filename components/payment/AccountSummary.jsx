import React from 'react';
import styles from '../../styles/payment.module.css';

export default function AccountSummary() {
  return (
    <div>
      <div className={`${styles.alert} ${styles.alertPrimary}`}>
        <span className={styles.balanceLabel}>Debt:</span>
        <span className={styles.balanceAmount}>GHC  200</span>
      </div>

      <div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            Account summary
          </div>
          <div className={styles.cardBody}>
            <div>
              <li>account name</li>
              <li>Tiifu Hamza Kojo Boronson</li>
            </div>
            <div>
              <li>last billing date</li>
              <li>12/05/2023</li>
            </div>
            <div>
              <li>cost incurred </li>
              <li>GHC 340</li>
            </div>
            <div>
              <li>payment made </li>
              <li>GHC 0</li>
            </div>
            <div>
              <li>discount  </li>
              <li>GHC 10</li>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
