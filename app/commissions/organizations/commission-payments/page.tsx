"use client";
import { RiHospitalLine } from '@remixicon/react';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { currencyFormatter ,customFetch} from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

interface PaidCommissionData {
     id: number;
     batch_reference: string;
     recipient_type: string;
     recipient_id: number;
     start_date: string;
     end_date: string;
     total_commission_amount: string;
     payment_amount: string;
     waived_amount: string;
     payment_date: string;
     created_by: number;
     notes: string | null;
     created_at: string;
     updated_at: string;
     payment_method: number;
     expense_synced: number;
     expense_id: number;
     expense_invoice_id: number;
     expense_payment_id: number;
     status: string;
     created_by_username: string;
     payment_mode: string;
     recipient_name: string;
}

export default function OrganizationPaidCommissionsPageCombined({ params }: { params: { organization: string } }) {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [dateFilter, setDateFilter] = useState('This Year');
     const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const employeeid = useApplication()?.user?.employeeid;

     const totalSummary = paidCommissions.reduce(
          (acc, item) => {
               acc.totalCommission += Number(item.total_commission_amount);
               acc.totalPaid += Number(item.payment_amount);
               acc.totalWaived += Number(item.waived_amount);
               return acc;
          },
          {
               totalCommission: 0,
               totalPaid: 0,
               totalWaived: 0,
          }
     );

     const fetchPaidCommissions = async () => {
          setLoading(true);
          setError(null);
          try {
               const url = `commission-payments/commission/batch/information?recipient_type=organization&recipient_id=${encodeURIComponent(params.organization)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&&employeeid=${encodeURIComponent(employeeid || '')}`;
               const response = await customFetch(url);
               if (response && (response.success || response.status === true || response.status === 'success')) {
                    setPaidCommissions(Array.isArray(response.data) ? response.data : []);
               } else {
                    setPaidCommissions([]);
               }
          } catch (err: any) {
               setError(err.message || 'Unable to load paid commissions');
               setPaidCommissions([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchPaidCommissions();
     }, [params.organization, startDate, endDate]);

     const handleResetFilters = () => {
          setStartDate(defaultStart);
          setEndDate(today);
          setDateFilter('This Year');
     };

     const handleSeverSideProcessing = async (pagination: { page: number; count: number, sortby: "ASC" | "DESC" }) => {
          try {
               const url = `commission-payments/commission/batch/information?recipient_type=organization&recipient_id=${encodeURIComponent(params.organization)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&&employeeid=${encodeURIComponent(employeeid || '')}&page=${pagination.page}&count=${pagination.count}${pagination.sortby ? `&sortby=${pagination.sortby || 'DESC'}` : ''}`;
               const response = await customFetch(url);
               if (response && (response.success || response.status === true || response.status === 'success') && Array.isArray(response.data)) {
                    return { result: response.data, error: false };
               } else {
                    return { result: [], error: true };
               };
          } catch (err: any) {
               return { result: [], error: true };
          }
     }

     return (
          <div className="container-fluid px-4 py-3">
               <div className="card rounded mb-4" style={{ borderColor: 'var(--bs-border-color)' }}>
                    <div className="card-body py-3 px-4">
                         <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                              <div>
                                   <h1 className="h5 mb-1 d-flex align-items-center"><RiHospitalLine className="me-2" />Organization Paid Commissions</h1>
                              </div>
                              <div className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-center">
                                   <DateFilterReusable
                                        value={dateFilter}
                                        onChange={setDateFilter}
                                        onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }}
                                        label="Filter by"
                                        className="col-12 col-sm-auto"
                                   />
                                   <button className="btn btn-sm btn-outline-secondary" type="button" onClick={handleResetFilters}>
                                        Reset
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {loading ? (
                    <div className="text-center py-5">
                         <div className="spinner-border text-primary" role="status" />
                         <p className="mt-3 mb-0">Loading paid commissions...</p>
                    </div>
               ) : error ? (
                    <div className="alert alert-danger">{error}</div>
               ) : paidCommissions.length === 0 ? (
                    <div className="alert alert-info">No paid commission records found for this organization.</div>
               ) : (
                    <>
                         <div className="row g-3 mb-4">
                              <div className="col-12 col-sm-4">
                                   <div className="border rounded p-3 h-100 bg-light">
                                        <div className="text-muted small mb-2">Batch Count</div>
                                        <div className="fw-semibold fs-4">{paidCommissions.length}</div>
                                   </div>
                              </div>
                              <div className="col-12 col-sm-4">
                                   <div className="border rounded p-3 h-100 bg-light">
                                        <div className="text-muted small mb-2">Total Commission</div>
                                        <div className="fw-semibold fs-4">{currencyFormatter.format(totalSummary.totalCommission)}</div>
                                   </div>
                              </div>
                              <div className="col-12 col-sm-4">
                                   <div className="border rounded p-3 h-100 bg-light">
                                        <div className="text-muted small mb-2">Total Paid</div>
                                        <div className="fw-semibold fs-4">{currencyFormatter.format(totalSummary.totalPaid)}</div>
                                   </div>
                              </div>
                         </div>

                         <div className="card border rounded mb-4">
                              <div className="card-body p-3 p-md-4">
                                   <PrimeTable
                                        column={[
                                             { Header: 'Batch Reference', accessor: 'batch_reference' },
                                             { Header: 'Recipient', accessor: 'recipient_name' },
                                             {
                                                  Header: 'Payment Date',
                                                  accessor: 'payment_date',
                                                  Cell: ({ value }: any) => dayjs(value).format('DD MMM YYYY'),
                                             },
                                             {
                                                  Header: 'Total Commission',
                                                  accessor: 'total_commission_amount',
                                                  Cell: ({ value }: any) => currencyFormatter.format(Number(value)),
                                             },
                                             {
                                                  Header: 'Payment Amount',
                                                  accessor: 'payment_amount',
                                                  Cell: ({ value }: any) => currencyFormatter.format(Number(value)),
                                             },
                                             {
                                                  Header: 'Waived',
                                                  accessor: 'waived_amount',
                                                  Cell: ({ value }: any) => currencyFormatter.format(Number(value)),
                                             },
                                             {
                                                  Header: 'Status',
                                                  accessor: 'status',
                                                  Cell: ({ value }: any) => (
                                                       <span className={value === 'completed' ? 'text-success' : 'text-warning'}>{value}</span>
                                                  ),
                                             },
                                             { Header: 'Payment Mode', accessor: 'payment_mode' },
                                             { Header: 'Created By', accessor: 'created_by_username' },
                                        ]}
                                        data={paidCommissions}
                                        filtering={true}
                                        serverSideFiltering={true}
                                        handleSeverSideProcessing={handleSeverSideProcessing}
                                   />
                              </div>
                         </div>
                    </>
               )}
          </div>
     );
}
