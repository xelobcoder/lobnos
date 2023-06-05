import React, { useMemo, useState } from 'react';
import styles from '../../styles/payment.module.css';
import { customFetch } from '../Auth/customFetch';

export default function AccountSummary({ data }) {
  const [billingHx, setBillingHx] = useState([]);

  useMemo(() => {
    const active = data.billingid;
    const InitData = async function () {
      const response = await customFetch(`billing/client/transactionhx?billingid=${active}`)
      setBillingHx(response)
    }
    InitData()
  }, [data.billingid])


  return (
    <div>
      <div className={parseInt(data.outstanding) != 0 ? `${styles.alert} ${styles.alertPrimary}`: `${styles.alert} ${styles.alertSuccess}`}>
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
              <li>cost incurred </li>
              <li> GHC {data?.payable}</li>
            </div>
            <div>
              <li>discount  </li>
              <li>GHC {data?.discount}</li>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>Billing History</div>
          <div className={styles.cardBody}>
            {
              billingHx.length > 0 &&
              billingHx.map((item, index) => {
                return (
                  <>
                    <div>
                      <li key={index}>Date: {item.Date.slice(0, 10)}</li>
                      <li> Amount: {item.Amount}</li>
                    </div>
                  </>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
