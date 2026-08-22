"use client";
import React, { useState } from 'react';
import styles from '../../../commissions/clinicians/commissions-information/CommissionReport.module.css';
import { RiAlertLine, RiArrowDownSLine, RiArrowUpSLine, RiFileList3Line, RiMoneyDollarCircleLine, RiServiceLine, RiUserLine } from '@remixicon/react';
import dayjs from 'dayjs';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { exportCommissionDataToPDF } from '../../../../lib/commission/exportCommissionPdf';

interface CommissionData {
     organization_id: number;
     organization_name: string;
     organization_phone: string;
     service_date: string;
     total_services: number;
     total_payable: string;
     total_paid: string;
     commission_earned_total: string;
}

interface ApiResponse {
     success: boolean;
     data: CommissionData[];
}



const SHIMMER_STYLES = `
     @keyframes commission-shimmer {
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
               animation: 'commission-shimmer 1.4s linear infinite',
          }}
     />
);

const Stat = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
     <div className="border rounded p-3 h-100 d-flex align-items-center gap-3">
          <span className="text-muted">{icon}</span>
          <div>
               <div className="fw-bold">{value}</div>
               <div className="text-muted small">{label}</div>
          </div>
     </div>
);


async function getCommissionData(startDate: string, endDate: string) {
     try {
          const response = await customFetch(`organization/commission/summary?startDate=${startDate}&endDate=${endDate}`);
          return response && response?.result && Array.isArray(response.result) ? response.result : []
     } catch (error: any) {
          return { error: error.message || 'An unknown error occurred' };
     }
}


export default function OrganizationPendingCommission() {
     const today = dayjs().format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(today);
     const [endDate, setEndDate] = useState(today);
     const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [dateFilter, setDateFilter] = useState('Today');
     const [showOrgSummary, setShowOrgSummary] = useState(false);
     const [reloadKey, setReloadKey] = useState(0);

     React.useEffect(() => {
          setLoading(true);
          setError(null);
          getCommissionData(startDate, endDate)
               .then(res => {
                    if (res && res.error || !Array.isArray(res)) {
                         setError(res.error);
                         setCommissionData([]);
                    } else {
                         setCommissionData(res || []);
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
     const totalServiceValue = commissionData.reduce((sum, item) => sum + Number(item.total_payable), 0);
     const totalPaidAmount = commissionData.reduce((sum, item) => sum + Number(item.total_paid), 0);
     const totalServices = commissionData.reduce((sum, item) => sum + item.total_services, 0);
     const uniqueOrganizations = new Set(commissionData.map(item => item.organization_id)).size;

     const organizationSummary = commissionData.reduce((acc, item) => {
          const key = item.organization_id;
          if (!acc[key]) {
               acc[key] = {
                    organization_name: item.organization_name,
                    organization_phone: item.organization_phone,
                    total_commission_earned_total: 0,
                    total_value: 0,
                    total_services: 0,
                    records: 0
               };
          }
          acc[key].total_commission_earned_total += Number(item.commission_earned_total);
          acc[key].total_value += Number(item.total_payable);
          acc[key].total_services += item.total_services;
          acc[key].records += 1;
          return acc;
     }, {} as Record<number, any>);


     const columns = [
          {
               Header: 'Organization Name',
               accessor: 'organization_name',
          },
          {
               Header: 'Phone',
               accessor: 'organization_phone',
          },
          {
               Header: 'Services',
               accessor: 'total_services',
               Cell: ({ value }: any) => value?.toLocaleString?.() ?? value,
          },
          {
               Header: 'Total Payable for services',
               accessor: 'total_payable',
               Cell: ({ value }: any) => currencyFormatter.format(Number(value)),
          },
          {
               Header: 'Total Paid for services',
               accessor: 'total_paid',
               Cell: ({ value }: any) => currencyFormatter.format(Number(value)),
          },
          {
               Header: 'Commission Earned',
               accessor: 'commission_earned_total',
               Cell: ({ value }: any) => currencyFormatter.format(Number(value)),
          },
          {
               Header: 'Actions',
               id: 'actions',
               disableSortBy: true,
               Cell: ({ row }: any) => (
                    <a
                         href={`/commissions/organizations/commission-details/${row.original.organization_id}`}
                         className='btn btn-primary btn-sm'
                         target="_blank"
                         rel="noopener noreferrer"
                    >
                         View
                    </a>
               ),
          },
     ];

     const handleSeverSideProcessing = async ({ page, count, sortby = 'ASC', startDate, endDate }: any) => {
          try {
               const url = `organization/commission/summary?startDate=${startDate}&endDate=${endDate}&page=${page}&count=${count}${sortby ? `&sortby=${sortby}` : ''}`;
               const response = await customFetch(url);
               if (response && response?.result && Array.isArray(response.result)) {
                    return { result: response.result, error: false };
               } else {
                    return { result: [], error: false };
               }
          } catch (error) {
               return { result: [], error: true };
          }
     };

     return (
          <main className={styles.container}>
               <style>{SHIMMER_STYLES}</style>

               {/* Header */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
                    <h1 className={styles.title} style={{ margin: 0 }}>
                         <RiFileList3Line />
                         Organizations Commission Report
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

               {/* Hero stat: the number this page exists for */}
               <div className="border rounded p-4 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style={{ background: 'var(--bs-tertiary-bg)' }}>
                    <div>
                         <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                              Total Commission Earned
                         </span>
                         <div className="d-flex align-items-center gap-2 mt-1">
                              <RiMoneyDollarCircleLine size={32} style={{ color: 'var(--bs-success)' }} />
                              <span style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.1 }}>
                                   {currencyFormatter.format(totalCommissionEarned)}
                              </span>
                         </div>
                    </div>
                    <span className="text-muted small">
                         {dayjs(startDate).format('MMM D, YYYY')} – {dayjs(endDate).format('MMM D, YYYY')}
                    </span>
               </div>

               {/* Secondary stats */}
               <div className="row g-3 mb-4">
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Total Payable" value={currencyFormatter.format(totalServiceValue)} icon={<RiServiceLine />} />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Total Paid" value={currencyFormatter.format(totalPaidAmount)} icon={<RiMoneyDollarCircleLine />} />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Services Rendered" value={totalServices.toLocaleString()} icon={<RiServiceLine />} />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Active Organizations" value={uniqueOrganizations} icon={<RiUserLine />} />
                    </div>
                    <div className="col-6 col-md-4 col-lg">
                         <Stat label="Total Records" value={commissionData.length.toLocaleString()} icon={<RiFileList3Line />} />
                    </div>
               </div>



               {/* By organization summary */}
               {commissionData.length > 0 && (
                    <div className="border rounded mb-4">
                         <button
                              type="button"
                              className="w-100 d-flex justify-content-between align-items-center p-3 bg-transparent border-0"
                              onClick={() => setShowOrgSummary(v => !v)}
                              aria-expanded={showOrgSummary}
                         >
                              <span className="fw-semibold d-flex align-items-center gap-2">
                                   <RiUserLine size={18} className="text-muted" />
                                   By organization
                                   <span className="badge text-bg-secondary">{uniqueOrganizations}</span>
                              </span>
                              {showOrgSummary
                                   ? <RiArrowUpSLine size={18} className="text-muted" />
                                   : <RiArrowDownSLine size={18} className="text-muted" />}
                         </button>
                         {showOrgSummary && (
                              <div className="table-responsive" style={{ borderTop: '1px solid var(--bs-border-color)' }}>
                                   <table className="table table-sm table-hover table-striped mb-0 text-start">
                                        <thead className="bg-body-tertiary">
                                             <tr>
                                                  <th>Organization</th>
                                                  <th>Phone</th>
                                                  <th>Records</th>
                                                  <th>Services</th>
                                                  <th>Total Payable</th>
                                                  <th>Commission Earned</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {Object.values(organizationSummary).map((org: any) => (
                                                  <tr key={org.organization_name}>
                                                       <td className="fw-semibold">{org.organization_name}</td>
                                                       <td>{org.organization_phone}</td>
                                                       <td>{org.records}</td>
                                                       <td>{org.total_services.toLocaleString()}</td>
                                                       <td>{currencyFormatter.format(org.total_value)}</td>
                                                       <td className="fw-semibold">{currencyFormatter.format(org.total_commission_earned_total)}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
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
                         onClick={() => exportCommissionDataToPDF(commissionData, startDate, endDate)}
                         disabled={!commissionData || commissionData.length === 0}
                    >
                         Export PDF
                    </button>
               </div>

               {Array.isArray(commissionData) && commissionData.length > 0 ? (
                    <div className="table-responsive table-small">
                         <PrimeTable
                              column={columns}
                              data={commissionData}
                              filtering={true}
                              urlparams={{ startDate, endDate }}
                              serverSideFiltering={true}
                              handleSeverSideProcessing={handleSeverSideProcessing}
                         />
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