import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { currencyFormatter, customFetch } from '../../Auth/customFetch';
import styles from './LifetimeAnalytics.module.css';

interface LifetimeData {
  total_transactions: number;
  total_amount: string;
  total_payable: string;
  total_paid: string;
  total_outstanding: string;
  first_transaction: string;
  total_discount: string;
  last_transaction: string;
  duration: {
    start: string;
    end: string;
  };
}

interface LifetimeAnalyticsProps {
  patientid: number;
}

export default function LifetimeAnalytics({ patientid }: LifetimeAnalyticsProps) {
  const [data, setData] = useState<LifetimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLifetimeData = async () => {
    try {
      setIsLoading(true);
      const response = await customFetch(
        `patient/individual/analytics/lifetime?year=2025&&months=12&&patientid=${patientid}`
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (response.status && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch lifetime data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLifetimeData();
  }, [patientid]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No transactions yet";
    try {
      return new Date(dateString).toLocaleDateString('default', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <div className="mb-4">
          <h6 className="mb-1">Lifetime Statistics</h6>
          <small className="text-muted">Overall transaction history</small>
        </div>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingBar}></div>
            <p className={styles.loadingText}>Loading statistics...</p>
          </div>
        ) : data && (
          <>
            <div className={styles.dateBox}>
              <div className={styles.dateItem}>
                <div className={styles.dateLabel}>First Transaction</div>
                <div className={styles.dateValue}>{formatDate(data?.first_transaction)}</div>
              </div>
              <div className={styles.dateItem}>
                <div className={styles.dateLabel}>Last Transaction</div>
                <div className={styles.dateValue}>{formatDate(data?.last_transaction)}</div>
              </div>
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total Transactions</div>
                <div className={styles.statValue}>{data.total_transactions}</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total Amount</div>
                <div className={styles.statValue}>
                  {currencyFormatter.format(parseFloat(data.total_amount))}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total Payable</div>
                <div className={styles.statValue}>
                  {currencyFormatter.format(parseFloat(data.total_payable))}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total Paid</div>
                <div className={styles.statValue}>
                  {currencyFormatter.format(parseFloat(data.total_paid))}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Total Discount</div>
                <div className={styles.statValue}>
                  {currencyFormatter.format(parseFloat(data.total_discount))}
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statLabel}>Outstanding Balance</div>
                <div className={styles.statValue}>
                  {currencyFormatter.format(parseFloat(data.total_outstanding))}
                </div>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}