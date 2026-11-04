"use client";
import { RiRefreshLine } from '@remixicon/react';
import dayjs from 'dayjs';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import { CommissionTable, PeriodFilter, ReportState, SummaryMetric, TableCell } from '../PortalUi';

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

export default function CommissionPaymentsPage() {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [dateFilter, setDateFilter] = useState('This Year');
     const [recipientType, setRecipientType] = useState<'all' | 'organization' | 'clinician'>('all');
     const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [revision, setRevision] = useState(0);
     const employeeid = useApplication()?.user?.employeeid;
     const requestVersion = useRef(0);
     const filterKey = `${startDate}:${endDate}:${recipientType}:${employeeid || ''}`;
     const currentFilterKey = useRef(filterKey);
     currentFilterKey.current = filterKey;

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

     const buildCommissionUrl = useCallback((pageParams = '') => {
          let url = `commission-payments/commission/batch/information?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&employeeid=${encodeURIComponent(employeeid || '')}`;
          if (recipientType !== 'all') {
               url += `&recipient_type=${encodeURIComponent(recipientType)}`;
          }
          return `${url}${pageParams}`;
     }, [startDate, endDate, recipientType, employeeid]);

     const fetchPaidCommissions = useCallback(async () => {
          const version = ++requestVersion.current;
          setLoading(true);
          setError(null);
          try {
               if (!startDate || !endDate || startDate > endDate) {
                    throw new Error('Select a valid date range with the start date on or before the end date.');
               }
               const url = buildCommissionUrl('&page=1&count=10&sortby=DESC');
               const response = await customFetch(url);
               if (!response || !(response.success || response.status === true || response.status === 'success') || !Array.isArray(response.data)) {
                    throw new Error(response?.message || 'Unable to load paid commissions');
               }
               if (version === requestVersion.current) {
                    setPaidCommissions(response.data);
                    setRevision(value => value + 1);
               }
          } catch (err: unknown) {
               if (version !== requestVersion.current) return;
               setError(err instanceof Error ? err.message : 'Unable to load paid commissions');
               setPaidCommissions([]);
          } finally {
               if (version === requestVersion.current) setLoading(false);
          }
     }, [buildCommissionUrl, startDate, endDate]);
     const invalidate = useCallback(() => { requestVersion.current++; }, []);

     useEffect(() => {
          if (!employeeid) return;
          fetchPaidCommissions();
          return invalidate;
     }, [employeeid, fetchPaidCommissions, invalidate]);

     const handleResetFilters = () => {
          setStartDate(defaultStart);
          setEndDate(today);
          setDateFilter('This Year');
          setRecipientType('all');
     };

     const handleSeverSideProcessing = async (pagination: { page: number; count: number, sortby?: string }) => {
          try {
               const url = buildCommissionUrl(`&page=${pagination.page}&count=${pagination.count}${pagination.sortby ? `&sortby=${pagination.sortby || 'DESC'}` : ''}`);
               const response = await customFetch(url);
               if (currentFilterKey.current !== filterKey) return { result: [], error: 'Filters changed; reload the selected period.' };
               if (response && (response.success || response.status === true || response.status === 'success') && Array.isArray(response.data)) {
                    return { result: response.data, error: false as const };
               } else {
                    throw new Error(response?.message || 'Unable to load paid commissions');
               };
          } catch (err: unknown) {
               return { result: [], error: err instanceof Error ? err.message : 'Unable to load paid commissions' };
          }
     }

     return (
          <div className="container-fluid px-3 px-md-4 py-3" aria-busy={loading}>
               <header className="mb-3">
                    <h1 className="fs-4 fw-bold mb-1">Commission payments</h1>
                    <p className="text-body-secondary mb-0">Review settlement batches. Dates filter the batch commission period, not the payment timestamp.</p>
               </header>
               <ReportState loading={loading} error={error} retry={fetchPaidCommissions} />
               <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Batches" value={loading || error ? null : paidCommissions.length} variant="primary" /></div>
                    <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Commission" value={loading || error ? null : totalSummary.totalCommission} financial variant="secondary" /></div>
                    <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Paid" value={loading || error ? null : totalSummary.totalPaid} financial variant="success" /></div>
               </div>
               <div className="row g-2 align-items-end mb-3">
                              <PeriodFilter
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }}
                                   disabled={loading}
                              />
                         <div className="col-12 col-md-3">
                              <label htmlFor="payment-recipient-type" className="small fw-semibold mb-1">Recipient type</label>
                              <select
                                   id="payment-recipient-type"
                                   className="form-select form-select-sm"
                                   value={recipientType}
                                   disabled={loading}
                                   onChange={e => setRecipientType(e.target.value as 'all' | 'organization' | 'clinician')}
                              >
                                   <option value="all">All Recipients</option>
                                   <option value="organization">Organization</option>
                                   <option value="clinician">Clinician</option>
                              </select>
                         </div>
                         <div className="col-12 col-md-auto d-flex gap-2 flex-wrap">
                              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={handleResetFilters} disabled={loading}>
                                   Reset
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={fetchPaidCommissions} disabled={loading || !employeeid}>
                                   <RiRefreshLine size={16} className="me-1" aria-hidden="true" />{loading ? "Refreshing…" : "Refresh"}
                              </button>
                         </div>
               </div>

               {!loading && !error && (
                              <CommissionTable
                                   key={`${filterKey}:${revision}`}
                                   column={[
                                        { Header: 'Batch Reference', accessor: 'batch_reference' },
                                        { Header: 'Recipient', accessor: 'recipient_name' },
                                        {
                                             Header: 'Payment Date',
                                             accessor: 'payment_date',
                                             Cell: ({ row }: TableCell<PaidCommissionData>) => dayjs(row.original.payment_date).format('DD MMM YYYY'),
                                        },
                                        {
                                             Header: 'Total Commission',
                                             accessor: 'total_commission_amount',
                                             Cell: ({ row }: TableCell<PaidCommissionData>) => currencyFormatter.format(Number(row.original.total_commission_amount)),
                                        },
                                        {
                                             Header: 'Payment Amount',
                                             accessor: 'payment_amount',
                                             Cell: ({ row }: TableCell<PaidCommissionData>) => currencyFormatter.format(Number(row.original.payment_amount)),
                                        },
                                        {
                                             Header: 'Waived',
                                             accessor: 'waived_amount',
                                             Cell: ({ row }: TableCell<PaidCommissionData>) => currencyFormatter.format(Number(row.original.waived_amount)),
                                        },
                                        {
                                             Header: 'Status',
                                             accessor: 'status',
                                             Cell: ({ row }: TableCell<PaidCommissionData>) => (
                                                  <span className={row.original.status === 'completed' ? 'text-success' : 'text-body-emphasis'}>{row.original.status}</span>
                                             ),
                                        },
                                        { Header: 'Payment Mode', accessor: 'payment_mode' },
                                        { Header: 'Created By', accessor: 'created_by_username' },
                                   ]}
                                   data={paidCommissions}
                                   handleSeverSideProcessing={handleSeverSideProcessing}
                              />
               )}
          </div>
     );
}
