"use client";
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// PDF export function
function exportCommissionDataToPDF(commissionData, startDate, endDate) {
     const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
     // Use Times New Roman if available
     if (doc.getFontList && doc.getFontList()['Times New Roman']) {
          doc.setFont('Times New Roman', 'bold');
     } else {
          doc.setFont('times', 'bold');
     }
     doc.setFontSize(22);
     doc.text('Clinicians Commission Report', 14, 18);
     doc.setFontSize(14);
     doc.setFont('times', 'normal');
     doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
     autoTable(doc, {
          startY: 36,
          head: [[
               'Clinician Name',
               'Phone',
               'Services',
               'Total Payable',
               'Total Paid',
               'Commission Earned',
          ]],
          body: commissionData.map(record => [
               record.clinician_name,
               record.clinician_phone,
               record.total_services,
               (typeof currencyFormatter !== 'undefined' ? currencyFormatter.format(Number(record.total_payable)) : record.total_payable),
               (typeof currencyFormatter !== 'undefined' ? currencyFormatter.format(Number(record.total_paid)) : record.total_paid),
               (typeof currencyFormatter !== 'undefined' ? currencyFormatter.format(Number(record.commission_earned_total)) : record.commission_earned_total),
          ]),
          styles: { fontSize: 12, font: 'times', fontStyle: 'bold' },
          headStyles: { fillColor: [22, 160, 133], fontSize: 13, font: 'times', fontStyle: 'bold' },
          bodyStyles: { font: 'times', fontStyle: 'bold' },
     });
     doc.save(`commission-report-${startDate}-to-${endDate}.pdf`);
}

import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
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
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

interface CommissionData {
     service_date: string;
     clinician_id: number;
     clinician_name: string;
     clinician_phone: string;
     occupation: string;
     organization: number;
     total_services: number;
     total_payable: string;
     total_paid: string;
     commission_percent: number;
     commission_earned_by_amount_payable: string;
     commission_earned_by_paid_amount: string;
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
     const [dateFilter, setDateFilter] = useState('Today');

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


     // Handler for DateFilterReusable
     const handleDateRangeChange = (start: string, end: string) => {
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
     // Use commission_earned_by_paid_amount as the total commission earned field
     const totalCommissionEarned = commissionData.reduce((sum, item) => sum + Number(item.commission_earned_by_paid_amount), 0);
     const totalServiceValue = commissionData.reduce((sum, item) => sum + Number(item.total_payable), 0);
     const totalPaidAmount = commissionData.reduce((sum, item) => sum + Number(item.total_paid), 0);
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
                    total_commission_earned_by_paid_amount: 0,
                    total_value: 0,
                    total_services: 0,
                    records: 0
               };
          }
          acc[key].total_commission_earned_by_paid_amount += Number(item.commission_earned_by_paid_amount);
          acc[key].total_value += Number(item.total_payable);
          acc[key].total_services += item.total_services;
          acc[key].records += 1;
          return acc;
     }, {} as Record<number, any>);


     return (
          <main className={styles.container}>
               {/* Header with Title and Filter on same level */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
                    <h1 className={styles.title} style={{ margin: 0 }}>
                         <RiFileList3Line />
                         Clinicians Commission Analytics Report
                    </h1>

                    <div style={{ flexShrink: 0, minWidth: '240px' }}>
                         <DateFilterReusable
                              value={dateFilter}
                              onChange={setDateFilter}
                              onDateRangeChange={handleDateRangeChange}
                              label="Filter by"
                              className="w-100"
                         />
                    </div>
               </div>

               <hr />

               {/* Summary Stats */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
                    <div className="row g-3">
                         <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                              <Stat label="Total Commission Earned" value={currencyFormatter.format(totalCommissionEarned)} icon={<RiMoneyDollarCircleLine />} />
                         </div>
                         <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                              <Stat label="Total Payable Amount" value={currencyFormatter.format(totalServiceValue)} icon={<RiServiceLine />} />
                         </div>
                         <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                              <Stat label="Total Paid Amount" value={currencyFormatter.format(totalPaidAmount)} icon={<RiMoneyDollarCircleLine />} />
                         </div>
                         <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                              <Stat label="Total Services Rendered" value={totalServices.toLocaleString()} icon={<RiServiceLine />} />
                         </div>
                         <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                              <Stat label="Active Clinicians" value={uniqueClinicians} icon={<RiUserLine />} />
                         </div>
                         <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                              <Stat label="Total Records" value={commissionData.length.toLocaleString()} icon={<RiFileList3Line />} />
                         </div>
                    </div>
               </div>

               <div className={styles.sectionDivider}></div>



               <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)', margin: '2rem 0 1.5rem 0', background: 'var(--theme-card-bg)' }}>
                    <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--bs-border-color)', background: 'var(--bs-tertiary-bg)' }}>
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center" style={{ color: 'inherit' }}>
                              <RiFileList3Line className="me-2" />
                              Detailed Commission Records
                         </h2>
                         <button
                              type="button"
                              className={styles.exportButton || 'btn btn-primary btn-sm'}
                              onClick={() => exportCommissionDataToPDF(commissionData, startDate, endDate)}
                              disabled={!commissionData || commissionData.length === 0}
                         >
                              Export PDF
                         </button>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {Array.isArray(commissionData) && commissionData.length > 0 ? (
                              <div className="table-responsive table-small">
                                   {/* PrimeTable integration */}
                                   {(() => {
                                        // Define columns for PrimeTable
                                        const columns = [
                                             {
                                                  Header: 'Clinician Name',
                                                  accessor: 'clinician_name',
                                             },
                                             {
                                                  Header: 'Phone',
                                                  accessor: 'clinician_phone',
                                             },
                                             {
                                                  Header: 'Services',
                                                  accessor: 'total_services',
                                                  Cell: ({ value }) => value?.toLocaleString?.() ?? value,
                                             },
                                             {
                                                  Header: 'Total Payable for services',
                                                  accessor: 'total_payable',
                                                  Cell: ({ value }) => currencyFormatter.format(Number(value)),
                                             },
                                             {
                                                  Header: 'Total Paid for services',
                                                  accessor: 'total_paid',
                                                  Cell: ({ value }) => currencyFormatter.format(Number(value)),
                                             },
                                             {
                                                  Header: 'Commission Earned',
                                                  accessor: 'commission_earned_total',
                                                  Cell: ({ value }) => currencyFormatter.format(Number(value)),
                                             },
                                             {
                                                  Header: 'Actions',
                                                  id: 'actions',
                                                  disableSortBy: true,
                                                  Cell: ({ row }) => (
                                                       <a
                                                            href={`/clinicians/commision-information/${row.original.clinician_id}`}
                                                            className='btn btn-primary btn-sm'
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                       >
                                                            View
                                                       </a>
                                                  ),
                                             },
                                        ];
                                        // Dynamically import PrimeTable to avoid SSR issues
                                        const PrimeTable = require('../../../components/accessories/Datatables/PrimeTable.js').default;
                                        const handleSeverSideProcessing = async ({ page, count, sortby = 'ASC', startDate, endDate }) => {
                                             try {
                                                  const url = `clinician/anal/commissions/range?startDate=${startDate}&endDate=${endDate}&page=${page}&count=${count}${sortby ? `&sortby=${sortby}` : ''}`;
                                                  const response = await customFetch(url);
                                                  if (response && response.success && Array.isArray(response.data)) {
                                                       return { result: response.data, error: false };
                                                  } else {
                                                       return { result: [], error: false };
                                                  }
                                             } catch (error) {
                                                  return { result: [], error: true };
                                             }
                                        };
                                        return (
                                             <PrimeTable
                                                  column={columns}
                                                  data={commissionData}
                                                  filtering={true}
                                                  urlparams={{ startDate, endDate }}
                                                  serverSideFiltering={true}
                                                  handleSeverSideProcessing={handleSeverSideProcessing}
                                             />
                                        );
                                   })()}
                              </div>
                         ) : (
                              <div className={styles.emptyState}>
                                   <RiFileList3Line size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                   <p>No commission records available for the selected period.</p>
                              </div>
                         )}
                    </div>
               </div>
          </main>
     );
}