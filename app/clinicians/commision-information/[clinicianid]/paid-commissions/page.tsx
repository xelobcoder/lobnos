"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { customFetch, currencyFormatter } from '../../../../../components/Auth/customFetch';
import dayjs from 'dayjs';
import { RiUserLine, RiFileList3Line } from '@remixicon/react';

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
     status: string;
     payment_date: string;
     created_by: number;
     notes: string | null;
     created_at: string;
     updated_at: string;
     payment_method: number;
     created_by_username: string;
     payment_mode: string;
     recipient_name: string;
}

async function getPaidCommissions({ clinicianid, startDate, endDate }: { clinicianid: string, startDate: string, endDate: string }) {
     try {
          const url = `commission-payments/commission/batch/information?recipient_type=clinician&recipient_id=${encodeURIComponent(clinicianid)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
          const response = await customFetch(url);
          if (!response || !(response.success || response.status === true || response.status === 'success')) {
               throw new Error('API returned no data or failed.');
          }
          const records = Array.isArray(response.data) ? response.data : [];
          return records as PaidCommissionData[];
     } catch (error: any) {
          return { error: error.message || 'An unknown error occurred' };
     }
}

export default function PaidCommissionsPage({ params }: { params: { clinicianid: string } }) {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          setLoading(true);
          setError(null);
          getPaidCommissions({ clinicianid: params.clinicianid, startDate, endDate })
               .then((res) => {
                    if ((res as any).error) {
                         setError((res as any).error);
                         setPaidCommissions([]);
                    } else {
                         setPaidCommissions(res as PaidCommissionData[]);
                    }
               })
               .catch(e => {
                    setError(e.message || 'An unknown error occurred');
                    setPaidCommissions([]);
               })
               .finally(() => setLoading(false));
     }, [params.clinicianid, startDate, endDate]);

     const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setStartDate(e.target.value);
     };
     const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setEndDate(e.target.value);
     };
     const handleResetFilters = () => {
          setStartDate(defaultStart);
          setEndDate(today);
     };

     if (error) {
          return (
               <main className="container py-4">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                         <RiUserLine size={32} className="me-2" />
                         <div>
                              <strong>Could Not Load Paid Commissions</strong>
                              <div>There was a problem connecting to the API.</div>
                              <div>{error}</div>
                         </div>
                    </div>
               </main>
          );
     }
     if (!paidCommissions.length) {
          return (
               <main className="container py-4">
                    <div className="alert alert-info d-flex align-items-center" role="alert">
                         <RiUserLine size={28} className="me-2" style={{ opacity: 0.5 }} />
                         <div>
                              <strong>No Paid Commissions Found</strong>
                              <div>No paid commission records found for this clinician.</div>
                         </div>
                    </div>
               </main>
          );
     }
     return (
          <div className="py-4">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="h4 fw-bold text-primary d-flex align-items-center"><RiUserLine className="me-2" /> Paid Commissions</h1>
                    <Link
                         href={`/clinicians/commision-information/${params.clinicianid}`}
                         className="btn btn-outline-primary btn-sm"
                         target="_blank"
                         rel="noopener noreferrer"
                    >
                         Update Commission Records
                    </Link>
               </div>
               <hr />
               <div className="row mb-3">
                    <div className="col-auto">
                         <div className="input-group input-group-sm">
                              <span className="input-group-text">Start</span>
                              <input type="date" className="form-control" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" />
                         </div>
                    </div>
                    <div className="col-auto">
                         <div className="input-group input-group-sm">
                              <span className="input-group-text">End</span>
                              <input type="date" className="form-control" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" />
                         </div>
                    </div>
                    <div className="col-auto">
                         <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary" type="button" aria-label="Reset date filters">
                              Reset
                         </button>
                    </div>
               </div>
               <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                         <h2 className="h6 fw-semibold text-dark mb-0 d-flex align-items-center">
                              <RiFileList3Line className="me-2" />
                              Paid Commission Batches
                         </h2>
                    </div>
                    <div className="card-body">
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped">
                                   <thead className="table-light">
                                        <tr>
                                             <th>Batch Reference</th>
                                             <th>Start Date</th>
                                             <th>End Date</th>
                                             <th>Total Commission</th>
                                             <th>Payment Amount</th>
                                             <th>Waived Amount</th>
                                             <th>Status</th>
                                             <th>Payment Date</th>
                                             <th>Payment Mode</th>
                                             <th>Created By</th>
                                             <th>Recipient Name</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {paidCommissions.map((record, idx) => (
                                             <tr key={idx}>
                                                  <td>{record.batch_reference}</td>
                                                  <td>{dayjs(record.start_date).format('DD/MM/YYYY')}</td>
                                                  <td>{dayjs(record.end_date).format('DD/MM/YYYY')}</td>
                                                  <td>{currencyFormatter.format(Number(record.total_commission_amount))}</td>
                                                  <td>{currencyFormatter.format(Number(record.payment_amount))}</td>
                                                  <td>{currencyFormatter.format(Number(record.waived_amount))}</td>
                                                  <td>{record.status}</td>
                                                  <td>{dayjs(record.payment_date).format('DD/MM/YYYY')}</td>
                                                  <td>{record.payment_mode}</td>
                                                  <td>{record.created_by_username}</td>
                                                  <td>{record.recipient_name}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>
          </div>
     );
}
