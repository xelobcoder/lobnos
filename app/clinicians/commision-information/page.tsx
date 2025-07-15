"use client";
import React, { useState } from 'react';
import type { Metadata } from 'next';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
import DateFilter from './DateFilter';
import dayjs from 'dayjs';
import styles from './CommissionReport.module.css';
import {
     RiUserLine,
     RiCalendarLine,
     RiMoneyDollarCircleLine,
     RiServiceLine,
     RiPercentLine,
     RiPhoneLine,
     RiBriefcaseLine,
     RiAlertLine,
     RiFileList3Line,
} from '@remixicon/react';

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

interface ApiResponse {
     success: boolean;
     data: CommissionData[];
}



const formatDate = (dateString: string) => {
     try {
          return new Date(dateString).toLocaleDateString('en-US', {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
          });
     } catch (e) {
          return 'Invalid Date';
     }
};

const Card = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
     <section className={styles.card}>
          <h2 className={styles.cardTitle}>
               {icon}
               {title}
          </h2>
          <div className={styles.cardContent}>
               {children}
          </div>
     </section>
);

const Stat = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
     <div className={styles.statItem}>
          <div className={styles.statIcon}>{icon}</div>
          <div className={styles.statInfo}>
               <span className={styles.statValue}>{value}</span>
               <span className={styles.statLabel}>{label}</span>
          </div>
     </div>
);


async function getCommissionData(startDate: string, endDate: string) {
     try {
          const response = await customFetch(`clinician/anal/commissions/range?startDate=${startDate}&endDate=${endDate}`);
          if (!response || !response.success) {
               throw new Error("API returned no data or failed.");
          }
          return response;
     } catch (error: any) {
          return { error: error.message || 'An unknown error occurred' };
     }
}


export default function CliniciansCommission() {
     const today = dayjs().format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(today);
     const [endDate, setEndDate] = useState(today);
     const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     React.useEffect(() => {
          setLoading(true);
          setError(null);
          getCommissionData(startDate, endDate)
               .then(res => {
                    if (res.error) {
                         setError(res.error);
                         setCommissionData([]);
                    } else {
                         setCommissionData(res.data || []);
                    }
               })
               .catch(e => {
                    setError(e.message || 'An unknown error occurred');
                    setCommissionData([]);
               })
               .finally(() => setLoading(false));
     }, [startDate, endDate]);

     const handleFilter = (start: string, end: string) => {
          setStartDate(start);
          setEndDate(end);
     };

     if (error) {
          return (
               <main className={styles.container}>
                    <div className={styles.header}>
                         <h1 className={styles.title}>Could Not Load Commission Data</h1>
                    </div>
                    <div className={styles.errorBox}>
                         <RiAlertLine size={40} />
                         <div>
                              <p><strong>There was a problem connecting to the API.</strong></p>
                              <p>Please check the console for more details or ensure your API server is running.</p>
                         </div>
                    </div>
                    <pre className={styles.pre}>{error}</pre>
               </main>
          );
     }


     // Calculate summary statistics
     const totalCommissionEarned = commissionData.reduce((sum, item) => sum + Number(item.commission_earned), 0);
     const totalServiceValue = commissionData.reduce((sum, item) => sum + Number(item.total_value), 0);
     const totalServices = commissionData.reduce((sum, item) => sum + item.total_services, 0);
     const uniqueClinicians = new Set(commissionData.map(item => item.clinician_id)).size;

     // Group data by clinician for summary
     const clinicianSummary = commissionData.reduce((acc, item) => {
          const key = item.clinician_id;
          if (!acc[key]) {
               acc[key] = {
                    clinician_name: item.clinician_name,
                    clinician_phone: item.clinician_phone,
                    occupation: item.occupation,
                    total_commission: 0,
                    total_value: 0,
                    total_services: 0,
                    records: 0
               };
          }
          acc[key].total_commission += Number(item.commission_earned);
          acc[key].total_value += Number(item.total_value);
          acc[key].total_services += item.total_services;
          acc[key].records += 1;
          return acc;
     }, {} as Record<number, any>);


     return (
          <main className={styles.container}>
               <header className={styles.header}>
                    <h1 className={styles.title}>
                         <RiFileList3Line />
                         Clinicians Commission Analytics Report
                    </h1>
                    <p className={styles.subtitle}>
                         <RiCalendarLine />
                         Report Period: <span className={styles.dateRange}>{dayjs(startDate).format('MMM D, YYYY')} - {dayjs(endDate).format('MMM D, YYYY')}</span>
                    </p>
               </header>

               <DateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onFilter={handleFilter}
                    loading={loading}
               />


               <Card title="Commission Summary Overview" icon={<RiMoneyDollarCircleLine />}>
                    <div className={styles.statsGrid}>
                         <Stat label="Total Commission Earned" value={currencyFormatter.format(totalCommissionEarned)} icon={<RiMoneyDollarCircleLine />} />
                         <Stat label="Total Service Value" value={currencyFormatter.format(totalServiceValue)} icon={<RiServiceLine />} />
                         <Stat label="Total Services Rendered" value={totalServices.toLocaleString()} icon={<RiServiceLine />} />
                         <Stat label="Active Clinicians" value={uniqueClinicians} icon={<RiUserLine />} />
                         <Stat label="Total Records" value={commissionData.length.toLocaleString()} icon={<RiFileList3Line />} />
                    </div>
               </Card>

               <div className={styles.sectionDivider}></div>

               <Card title="Clinician Performance Summary" icon={<RiUserLine />}>
                    {Object.keys(clinicianSummary).length > 0 ? (
                         <div className={styles.tableContainer}>
                              <table className={styles.table}>
                                   <thead>
                                        <tr>
                                             <th className={styles.th}>Clinician Name</th>
                                             <th className={styles.th}>Phone</th>
                                             <th className={styles.th}>Occupation</th>
                                             <th className={styles.th}>Total Services</th>
                                             <th className={styles.th}>Total Value</th>
                                             <th className={styles.th}>Commission Earned</th>
                                             <th className={styles.th}></th>
                                             <th className={styles.th}>Records</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {Array.isArray(clinicianSummary) && clinicianSummary.length > 0 &&  Object.values(clinicianSummary)
                                             .sort((a: any, b: any) => b.total_commission - a.total_commission)
                                             .map((clinician: any, index: number) => (
                                                  <tr key={index}>
                                                       <td className={styles.td}>{clinician.clinician_name}</td>
                                                       <td className={styles.td}>{clinician.clinician_phone}</td>
                                                       <td className={styles.td}>{clinician.occupation}</td>
                                                       <td className={`${styles.td} ${styles.numberCell}`}>{clinician.total_services}</td>
                                                       <td className={`${styles.td} ${styles.currencyCell}`}>
                                                            {currencyFormatter.format(clinician.total_value)}
                                                       </td>
                                                       <td className={`${styles.td} ${styles.currencyCell}`}>
                                                            {currencyFormatter.format(clinician.total_commission)}
                                                       </td>
                                                       <td className={`${styles.td} ${styles.numberCell}`}>{clinician.records}</td>
                                                  </tr>
                                             ))}
                                   </tbody>
                              </table>
                         </div>
                    ) : (
                         <div className={styles.emptyState}>
                              <RiUserLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                              <p>No clinician data available for the selected period.</p>
                         </div>
                    )}
               </Card>

               <div className={styles.sectionDivider}></div>

               <Card title="Detailed Commission Records" icon={<RiFileList3Line />}>
                    {Array.isArray(commissionData) && commissionData.length > 0 ? (
                         <div className={styles.tableContainer}>
                              <table className={styles.table}>
                                   <thead>
                                        <tr>
                                             <th className={styles.th}>Service Date</th>
                                             <th className={styles.th}>Clinician Name</th>
                                             <th className={styles.th}>Phone</th>
                                             <th className={styles.th}>Occupation</th>
                                             <th className={styles.th}>Services</th>
                                             <th className={styles.th}>Total Value</th>
                                             <th className={styles.th}>Commission %</th>
                                             <th className={styles.th}>Commission Earned</th>
                                             <th className={styles.th}>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {commissionData
                                             .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
                                             .map((record, index) => (
                                                  <tr key={`${record.clinician_id}-${record.service_date}-${index}`}>
                                                       <td className={`${styles.td} ${styles.dateCell}`}>
                                                            {formatDate(record.service_date)}
                                                       </td>
                                                       <td className={styles.td}>{record.clinician_name}</td>
                                                       <td className={styles.td}>{record.clinician_phone}</td>
                                                       <td className={styles.td}>{record.occupation}</td>
                                                       <td className={`${styles.td} ${styles.numberCell}`}>
                                                            <span className={styles.metricHighlight}>{record.total_services}</span>
                                                       </td>
                                                       <td className={`${styles.td} ${styles.currencyCell}`}>
                                                            {currencyFormatter.format(Number(record.total_value))}
                                                       </td>
                                                       <td className={`${styles.td} ${styles.numberCell}`}>
                                                            {record.commission_percent}%
                                                       </td>
                                                       <td className={`${styles.td} ${styles.currencyCell}`}>
                                                            {currencyFormatter.format(Number(record.commission_earned))}
                                                       </td>
                                                       <td className={styles.td}>
                                                            <a
                                                                 href={`/clinicians/commision-information/${record.clinician_id}`}
                                                                 className={styles.viewButton}
                                                                 target="_blank"
                                                                 rel="noopener noreferrer"
                                                            >
                                                                 View
                                                            </a>
                                                       </td>
                                                  </tr>
                                             ))}
                                   </tbody>
                              </table>
                         </div>
                    ) : (
                         <div className={styles.emptyState}>
                              <RiFileList3Line size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                              <p>No commission records available for the selected period.</p>
                         </div>
                    )}
               </Card>
          </main>
     );
}