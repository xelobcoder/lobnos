import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { currencyFormatter, customFetch } from '../../Auth/customFetch';
import styles from './AnalyticsSummaryCards.module.css';

interface TrendData {
  month: string;
  total_transactions: number;
  average_transaction_amount: string;
  total_amount: string;
}

interface TrendsAnalyticsProps {
  patientid: number;
}

export default function TrendsAnalytics({ patientid }: TrendsAnalyticsProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrendsData = async () => {
    try {
      setIsLoading(true);
      const response = await customFetch(
        `patient/individual/analytics/trends?year=2025&&months=12&&patientid=${patientid}`
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (response.status && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch trends data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, [patientid]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`${styles.tooltip} pls-label`}>
          <p className="mb-1">Month: {new Date(data.month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</p>
          <p className="mb-1">Transactions: {data.total_transactions}</p>
          <p className="mb-1">Average Amount: {currencyFormatter.format(parseFloat(data.average_transaction_amount))}</p>
          <p className="mb-0">Total Amount: {currencyFormatter.format(parseFloat(data.total_amount))}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <div className="mb-4">
          <h6 className="mb-1">Yearly Trends</h6>
          <small className="text-muted">Monthly transaction analysis</small>
        </div>

        <div className={styles.chartContainer}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingBar}></div>
              <p className={styles.loadingText}>Loading trends...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                <XAxis 
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('default', { month: 'short' })}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total_amount"
                  fill="hsl(217, 91%, 60%)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}