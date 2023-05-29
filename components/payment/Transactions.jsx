import React from 'react';
import styles from '../../styles/payment.module.css';

export default function Transactions({ transactions }) {
  return (
    <>
      <div>
        <table className={styles.transactionTable}>
          <thead>
            <tr className={styles.tableRow}>
              <th className={styles.tableHeader}>Date</th>
              <th className={styles.tableHeader}>Billing ID</th>
              <th className={styles.tableHeader}>Type</th>
              <th className={styles.tableHeader}>Amount Due</th>
              <th className={styles.tableHeader}>Amount Paid</th>
              <th className={styles.tableHeader}>Balance</th>
              <th className={styles.tableHeader}>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className={`${styles.tableRow} ${index % 2 === 0 ? styles.evenRow : styles.oddRow}`}
              >
                <td className={styles.tableCell}>{transaction.date}</td>
                <td className={styles.tableCell}>{transaction.billingId}</td>
                <td className={styles.tableCell}>{transaction.type}</td>
                <td className={styles.tableCell}>{transaction.payable}</td>
                <td className={styles.tableCell}>{transaction.paid}</td>
                <td className={styles.tableCell}>{transaction.balance}</td>
                <td className={styles.tableCell}>{transaction.outstanding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
