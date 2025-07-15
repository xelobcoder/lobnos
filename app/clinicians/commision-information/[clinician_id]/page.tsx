import React from "react";
import { customFetch, currencyFormatter } from '../../../../components/Auth/customFetch';
import styles from '../CommissionReport.module.css';
import { RiUserLine, RiPhoneLine, RiBriefcaseLine, RiMoneyDollarCircleLine, RiServiceLine, RiFileList3Line } from '@remixicon/react';

interface CommissionData {
  service_date: string;
  clinician_id: number;
  clinician_name: string;
  clinician_phone: string;
  occupation: string;
  organization: number;
  total_services: number;
  total_value: string;
  commission_percent: number;
  commission_earned: string;
}

async function getClinicianCommission(clinician_id: string) {
  try {
    const response = await customFetch(`clinician/anal/commissions/range?clinicianId=${clinician_id}`);
    if (!response || !response.success) {
      throw new Error('API returned no data or failed.');
    }
    return response.data as CommissionData[];
  } catch (error: any) {
    return { error: error.message || 'An unknown error occurred' };
  }
}

export default async function ClinicianCommissionPage({ params }: { params: { clinician_id: string } }) {
  const data = await getClinicianCommission(params.clinician_id);
  if ((data as any).error) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>Could Not Load Clinician Commission Data</h1>
        <div className={styles.errorBox}>
          <RiUserLine size={40} />
          <div>
            <p><strong>There was a problem connecting to the API.</strong></p>
            <p>{(data as any).error}</p>
          </div>
        </div>
      </main>
    );
  }
  const commissionData = data as CommissionData[];
  if (!commissionData.length) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>No Commission Data Found</h1>
        <div className={styles.emptyState}>
          <RiUserLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <p>No commission records found for this clinician.</p>
        </div>
      </main>
    );
  }
  const summary = commissionData.reduce((acc, item) => {
    acc.total_commission += Number(item.commission_earned);
    acc.total_value += Number(item.total_value);
    acc.total_services += item.total_services;
    return acc;
  }, { total_commission: 0, total_value: 0, total_services: 0 });
  const { clinician_name, clinician_phone, occupation } = commissionData[0];
  return (
    <main className={styles.container}>
      <h1 className={styles.title}><RiUserLine /> {clinician_name} - Commission Details</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}><div className={styles.statIcon}><RiPhoneLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{clinician_phone}</span><span className={styles.statLabel}>Phone</span></div></div>
        <div className={styles.statItem}><div className={styles.statIcon}><RiBriefcaseLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{occupation}</span><span className={styles.statLabel}>Occupation</span></div></div>
        <div className={styles.statItem}><div className={styles.statIcon}><RiMoneyDollarCircleLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{currencyFormatter.format(summary.total_commission)}</span><span className={styles.statLabel}>Total Commission</span></div></div>
        <div className={styles.statItem}><div className={styles.statIcon}><RiServiceLine /></div><div className={styles.statInfo}><span className={styles.statValue}>{summary.total_services}</span><span className={styles.statLabel}>Total Services</span></div></div>
        <div className={styles.statItem}><div className={styles.statIcon}><RiFileList3Line /></div><div className={styles.statInfo}><span className={styles.statValue}>{commissionData.length}</span><span className={styles.statLabel}>Records</span></div></div>
      </div>
      <div className={styles.sectionDivider}></div>
      <h2 className={styles.cardTitle}>Detailed Records</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Service Date</th>
              <th className={styles.th}>Services</th>
              <th className={styles.th}>Total Value</th>
              <th className={styles.th}>Commission %</th>
              <th className={styles.th}>Commission Earned</th>
            </tr>
          </thead>
          <tbody>
            {commissionData.map((record, idx) => (
              <tr key={idx}>
                <td className={`${styles.td} ${styles.dateCell}`}>{new Date(record.service_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td className={`${styles.td} ${styles.numberCell}`}>{record.total_services}</td>
                <td className={`${styles.td} ${styles.currencyCell}`}>{currencyFormatter.format(Number(record.total_value))}</td>
                <td className={`${styles.td} ${styles.numberCell}`}>{record.commission_percent}%</td>
                <td className={`${styles.td} ${styles.currencyCell}`}>{currencyFormatter.format(Number(record.commission_earned))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
