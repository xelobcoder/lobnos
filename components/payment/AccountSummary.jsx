import React from 'react';
import styles from '../../styles/payment.module.css';

export default function AccountSummary({data}) {
  return (
    <div>
      <div className={`${styles.alert} ${styles.alertPrimary}`}>
        <span className={styles.balanceLabel}>Debt:</span>
        <span className={styles.balanceAmount}>GHC  {data?.outstanding}</span>
      </div>

      <div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            Account summary
          </div>
          <div className={styles.cardBody}>
            <div>
              <li>account name</li>
              <li>{data?.fullname}</li>
            </div>
            <div>
              <li>last billing date</li>
              <li>{data?.date.slice(0,19).split('T').join(' ')}</li>
            </div>
            <div>
              <li>cost incurred </li>
              <li> GHC {data?.payable}</li>
            </div>
            <div>
              <li>payment made </li>
              <li>GHC {data?.paid_amount}</li>
            </div>
            <div>
              <li>discount  </li>
              <li>GHC {data?.discount}</li>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
