import React from 'react';
import styles from '../../styles/payment.module.css';
import { Card } from '@mui/material';

export default function AccountSummary() {
  return (
    <div>
      <div className={`${styles.alert} ${styles.alertPrimary}`}>
        <span className={styles.balanceLabel}>Payment Balance:</span>
        <span className={styles.balanceAmount}>USD 200</span>
      </div>

      <div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            Account summary
          </div>
        </div>
      </div>
    </div>
  );
}
