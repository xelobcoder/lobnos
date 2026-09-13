"use client";
import React, { useState } from 'react';
import dayjs from 'dayjs';
import styles from './CommissionReport.module.css';
import {
     RiUserLine,
     RiMoneyDollarCircleLine,
     RiServiceLine,
     RiAlertLine,
     RiFileList3Line,
     RiArrowDownSLine,
     RiArrowUpSLine,
} from '@remixicon/react';

import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { exportClinicianCommissionDataToPDF } from '../../../../lib/commission/exportClinicianCommissionPdf';


interface CommissionData {
     service_date: string;
     clinician_id: number;
     clinician_name: string;
     clinician_phone: string;
     organization: number;
     total_services: number;
     earned_revenue: string;
     cash_collected: string;
     commission_earned_total: string;
}

interface ApiResponse {
     success: boolean;
     data: CommissionData[];
}



const SHIMMER_STYLES = `
     @keyframes clinician-commission-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
     }
`;

const SkeletonBlock = ({ height, width = '100%', className = '' }: { height: number; width?: number | string; className?: string }) => (
     <div
          className={className}
          style={{
               height,
               width,
               borderRadius: '0.5rem',
               background: 'linear-gradient(90deg, var(--bs-tertiary-bg) 25%, var(--bs-secondary-bg) 50%, var(--bs-tertiary-bg) 75%)',
               backgroundSize: '200% 100%',
               animation: 'clinician-commission-shimmer 1.4s linear infinite',
          }}
     />
);

const Stat = ({
     label,
     value,
     detail,
     Icon,
     variant,
}: {
     label: string;
     value: string | number;
     detail: string;
     Icon: React.ElementType;
     variant: string;
}) => (
     <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
          <div className="card-body p-3">
               <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-xs text-uppercase fw-semibold opacity-75">{label}</span>
                    <Icon size={22} className="opacity-75" />
               </div>
               <h3 className="fw-bold mb-0">{value}</h3>
               <span className="text-xs opacity-75">{detail}</span>
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
     const [showClinicianSummary, setShowClinicianSummary] = useState(false);
     const [reloadKey, setReloadKey] = useState(0);

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
     }, [startDate, endDate, reloadKey]);


     // Handler for DateFilterReusable
     const handleDateRangeChange = (start: string, end: string) => {
          setStartDate(start);
          setEndDate(end);
     };

     if (loading && commissionData.length === 0) {
          return (
               <main className={styles.container}>
                    <style>{SHIMMER_STYLES}</style>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
                         <SkeletonBlock height={34} width={300} />
                         <SkeletonBlock height={38} width={240} />
                    </div>
                    <SkeletonBlock height={110} className="mb-3" />
                    <div className="row g-3 mb-4">
                         {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="col-6 col-md-4 col-lg">
                                   <SkeletonBlock height={64} />
                              </div>
                         ))}
                    </div>
                    <SkeletonBlock height={48} className="mb-4" />
                    <SkeletonBlock height={320} />
               </main>
          );
     }

     if (error) {
          return (
               <main className={styles.container}>
                    <div className="border rounded p-4" style={{ borderColor: 'var(--bs-danger-border-subtle)', background: 'var(--bs-danger-bg-subtle)' }}>
                         <div className="d-flex align-items-center gap-2 mb-1" style={{ color: 'var(--bs-danger-text-emphasis)' }}>
                              <RiAlertLine size={20} />
                              <strong>We couldn&rsquo;t load commission data</strong>
                         </div>
                         <p className="mb-3 small" style={{ color: 'var(--bs-danger-text-emphasis)' }}>
                              Check your connection and make sure the API server is running, then try again.
                         </p>
                         <div className="d-flex align-items-center gap-3 flex-wrap">
                              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setReloadKey(k => k + 1)}>
                                   Try again
                              </button>
                              <details className="small">
                                   <summary className="text-muted" style={{ cursor: 'pointer' }}>Technical details</summary>
                                   <pre className="mt-2 mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
                              </details>
                         </div>
                    </div>
               </main>
          );
     }


     // Calculate summary statistics
     // Use commission_earned_total as the total commission earned field
     const totalCommissionEarned = commissionData.reduce((sum, item) => sum + Number(item.commission_earned_total), 0);
     const totalServiceValue = commissionData.reduce((sum, item) => sum + Number(item.earned_revenue), 0);
     const totalPaidAmount = commissionData.reduce((sum, item) => sum + Number(item.cash_collected), 0);
     const totalServices = commissionData.reduce((sum, item) => sum + item.total_services, 0);
     const uniqueClinicians = new Set(commissionData.map(item => item.clinician_id)).size;

     // Group data by clinician for summary
     const clinicianSummary = commissionData.reduce((acc, item) => {
          const key = item.clinician_id;
          if (!acc[key]) {
               acc[key] = {
                    clinician_name: item.clinician_name,
                    clinician_phone: item.clinician_phone,
                    total_commission_earned_total: 0,
                    total_value: 0,
                    total_services: 0,
                    records: 0
               };
          }
          acc[key].total_commission_earned_total += Number(item.commission_earned_total);
          acc[key].total_value += Number(item.earned_revenue);
          acc[key].total_services += item.total_services;
          acc[key].records += 1;
          return acc;
     }, {} as Record<number, any>);


     return (
          <main className={styles.container}>
               <style>{SHIMMER_STYLES}</style>

               {/* Header */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
                    <h1 className={styles.title} style={{ margin: 0 }}>
                         <RiFileList3Line />
                         Clinicians Commission Report
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

               <div className="card border-0 shadow-sm bg-primary bg-gradient text-white rounded-3 mb-3">
                    <div className="card-body p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                         <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                   <span className="text-xs text-uppercase fw-semibold opacity-75">Total Commission Earned</span>
                                   <RiMoneyDollarCircleLine size={22} className="opacity-75" />
                              </div>
                              <h2 className="fw-bold mb-0">{currencyFormatter.format(totalCommissionEarned)}</h2>
                              <span className="text-xs opacity-75">Commission payable in this period</span>
                         </div>
                         <span className="small opacity-75">{dayjs(startDate).format('MMM D, YYYY')} - {dayjs(endDate).format('MMM D, YYYY')}</span>
                    </div>
               </div>

               {/* Secondary stats */}
               <div className="row g-3 mb-4">
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Total Payable" value={currencyFormatter.format(totalServiceValue)} detail="Value of services rendered" Icon={RiServiceLine} variant="info" />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Total Paid" value={currencyFormatter.format(totalPaidAmount)} detail="Payments collected" Icon={RiMoneyDollarCircleLine} variant="success" />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Services Rendered" value={totalServices.toLocaleString()} detail="Completed service entries" Icon={RiServiceLine} variant="primary" />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Active Clinicians" value={uniqueClinicians} detail="Clinicians with commission" Icon={RiUserLine} variant="secondary" />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Total Records" value={commissionData.length.toLocaleString()} detail="Commission records found" Icon={RiFileList3Line} variant="warning" />
                    </div>
               </div>

               {/* By clinician summary */}
               {commissionData.length > 0 && (
                    <div className="border rounded mb-4">
                         <button
                              type="button"
                              className="w-100 d-flex justify-content-between align-items-center p-3 bg-transparent border-0"
                              onClick={() => setShowClinicianSummary(v => !v)}
                              aria-expanded={showClinicianSummary}
                         >
                              <span className="fw-semibold d-flex align-items-center gap-2">
                                   <RiUserLine size={18} className="text-muted" />
                                   By clinician
                                   <span className="badge text-bg-secondary">{uniqueClinicians}</span>
                              </span>
                              {showClinicianSummary
                                   ? <RiArrowUpSLine size={18} className="text-muted" />
                                   : <RiArrowDownSLine size={18} className="text-muted" />}
                         </button>
                         {/* {showClinicianSummary && (
                              <div className="table-responsive" style={{ borderTop: '1px solid var(--bs-border-color)' }}>
                                   <table className="table table-sm table-hover table-striped mb-0 text-start">
                                        <thead className="bg-body-tertiary">
                                             <tr>
                                                  <th>Clinician</th>
                                                  <th>Phone</th>
                                                  <th>Records</th>
                                                  <th>Services</th>
                                                  <th>Total Payable</th>
                                                  <th>Commission Earned</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {Object.values(clinicianSummary).map((clinician: any) => (
                                                  <tr key={clinician.clinician_name}>
                                                       <td className="fw-semibold">{clinician.clinician_name}</td>
                                                       <td>{clinician.clinician_phone}</td>
                                                       <td>{clinician.records}</td>
                                                       <td>{clinician.total_services.toLocaleString()}</td>
                                                       <td>{currencyFormatter.format(clinician.total_value)}</td>
                                                       <td className="fw-semibold">{currencyFormatter.format(clinician.total_commission_earned_total)}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )} */}
                    </div>
               )}

               {/* Detailed records */}
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="fs-6 fw-semibold mb-0 d-flex align-items-center">
                         <RiFileList3Line className="me-2" />
                         Detailed Commission Records
                    </h2>
                    <button
                         type="button"
                         className="btn btn-outline-primary btn-sm"
                         onClick={() => exportClinicianCommissionDataToPDF(commissionData, startDate, endDate)}
                         disabled={!commissionData || commissionData.length === 0}
                    >
                         Export PDF
                    </button>
               </div>

               {Array.isArray(commissionData) && commissionData.length > 0 ? (
                    <div className="table-responsive table-small">
                         {(() => {
                              const columns = [
                                   {
                                        Header: 'Clinician Name',
                                        accessor: 'clinician_name',
                                        Cell: ({ value }) => <div className="fw-bold">{value || 'N/A'}</div>,
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
                                        accessor: 'earned_revenue',
                                        Cell: ({ value }) => currencyFormatter.format(Number(value)),
                                   },
                                   {
                                        Header: 'Total Paid for services',
                                        accessor: 'cash_collected',
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
                                                  href={`/commissions/clinicians/commissions-information/${row.original.clinician_id}`}
                                                  className='btn btn-primary btn-sm'
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                             >
                                                  View
                                             </a>
                                        ),
                                   },
                              ];

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
          </main>
     );
}