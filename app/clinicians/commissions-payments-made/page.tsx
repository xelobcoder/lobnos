"use client";
import React, { useState, useEffect } from "react";
import dayjs from 'dayjs';
import { RiUserLine, RiFileList3Line } from '@remixicon/react';
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import { Modal, Button } from 'react-bootstrap';
import CommissionLineChart from '../commision-information/CommissionLineChart';

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

async function getPaidCommissions({ startDate, endDate, clinicianId, organizationId }: { startDate: string, endDate: string, clinicianId?: number, organizationId?: number }) {
     try {
          let url = `commission-payments/commission/batch/information?&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
          if (clinicianId) {
               url += `&recipient_id=${clinicianId}`;
          } else if (organizationId) {
               url += `&recipient_id=${organizationId}&recipient_type=organization`;
          }
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


export interface Clinician {
     id: number;
     name: string;
}

export async function getClinicians(): Promise<Clinician[]> {
     const url = 'clinicians';
     const response = await customFetch(url);
     if (!response || !response.result) return [];
     return Array.isArray(response.result) ? response.result : [];
}

export interface Organization {
     id: number;
     name: string;
}

export async function getOrganizations(): Promise<Organization[]> {
     const url = 'organizations/details';
     const response = await customFetch(url);
     if (!response || !response.result) return [];
     return Array.isArray(response.result) ? response.result : [];
}


export default function PaidCommissionsPaymentMadePage() {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [chartView, setChartView] = useState<'bar' | 'line'>('bar');
     const [showChart, setShowChart] = useState(false);
     const [showChartModal, setShowChartModal] = useState(false);
     const [clinicians, setClinicians] = useState<Clinician[]>([]);
     const [selectedClinician, setSelectedClinician] = useState<number | null>(null);
     const [cliniciansLoading, setCliniciansLoading] = useState(false);
     const [organizations, setOrganizations] = useState<Organization[]>([]);
     const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);
     const [organizationsLoading, setOrganizationsLoading] = useState(false);

     useEffect(() => {
          loadData();
     }, []);

     const loadClinicians = async () => {
          setCliniciansLoading(true);
          const result = await getClinicians();
          setClinicians(result);
          setCliniciansLoading(false);
     };

     const loadOrganizations = async () => {
          setOrganizationsLoading(true);
          const result = await getOrganizations();
          setOrganizations(result);
          setOrganizationsLoading(false);
     };

     const loadData = async (overrideStart?: string, overrideEnd?: string, overrideClinician?: number | null, overrideOrg?: number | null) => {
          setLoading(true);
          setError(null);
          try {
               const res = await getPaidCommissions({
                    startDate: overrideStart || startDate,
                    endDate: overrideEnd || endDate,
                    clinicianId: overrideClinician !== undefined ? overrideClinician || undefined : selectedClinician || undefined,
                    organizationId: overrideOrg !== undefined ? overrideOrg || undefined : selectedOrganization || undefined
               });
               if ((res as any).error) {
                    setError((res as any).error);
                    setPaidCommissions([]);
               } else {
                    setPaidCommissions(res as PaidCommissionData[]);
               }
          } catch (e: any) {
               setError(e.message || 'An unknown error occurred');
               setPaidCommissions([]);
          } finally {
               setLoading(false);
          }
     };

     const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setStartDate(e.target.value);
     };
     const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setEndDate(e.target.value);
     };
     const handleResetFilters = async () => {
          setStartDate(defaultStart);
          setEndDate(today);
          setSelectedClinician(null);
          setSelectedOrganization(null);
          await loadData(defaultStart, today, null, null);
     };

     // Prepare chart data from paidCommissions
     const chartData = paidCommissions.map(item => ({
          service_date: item.payment_date,
          commission_earned_by_paid_amount: item.payment_amount,
     }));

     useEffect(() => {
          if (showChart) setShowChartModal(true);
          else setShowChartModal(false);
     }, [showChart]);

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

     return (
          <div className="py-4">
               {/* All filters and inputs in one row only */}
               <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={loadClinicians} disabled={cliniciansLoading}>
                         {cliniciansLoading ? 'Loading...' : 'Load Clinicians'}
                    </button>
                    <select className="form-select form-select-sm" style={{ width: '180px' }} value={selectedClinician ?? ''} onChange={e => { setSelectedClinician(Number(e.target.value) || null); setSelectedOrganization(null); }} disabled={clinicians.length === 0}>
                         <option value="">Select Clinician</option>
                         {clinicians.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                    </select>
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={loadOrganizations} disabled={organizationsLoading}>
                         {organizationsLoading ? 'Loading...' : 'Load Orgs'}
                    </button>
                    <select className="form-select form-select-sm" style={{ width: '180px' }} value={selectedOrganization ?? ''} onChange={e => { setSelectedOrganization(Number(e.target.value) || null); setSelectedClinician(null); }} disabled={organizations.length === 0}>
                         <option value="">Select Organization</option>
                         {organizations.map(o => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                         ))}
                    </select>
                    <div className="input-group input-group-sm" style={{ width: '140px' }}>
                         <span className="input-group-text">Start</span>
                         <input type="date" className="form-control" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" />
                    </div>
                    <div className="input-group input-group-sm" style={{ width: '140px' }}>
                         <span className="input-group-text">End</span>
                         <input type="date" className="form-control" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" />
                    </div>
                    <button onClick={() => loadData()} className="btn btn-sm btn-primary" type="button" aria-label="Load commission data" disabled={loading}>
                         {loading ? 'Loading...' : 'Load'}
                    </button>
                    <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary" type="button" aria-label="Reset date filters">
                         Reset
                    </button>
                    <div className="form-check form-switch ms-2">
                         <input
                              className="form-check-input"
                              type="checkbox"
                              id="showChartToggle"
                              checked={showChart}
                              onChange={e => setShowChart(e.target.checked)}
                         />
                         <label className="form-check-label" htmlFor="showChartToggle">Chart</label>
                    </div>
               </div>
               {/* Table card */}
               <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                         <h2 className="h6 fw-semibold text-dark mb-0 d-flex align-items-center ccol-2">
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
               {/* Chart Modal */}
               <Modal show={showChartModal} onHide={() => setShowChart(false)} size="lg" backdrop="static">
                    <Modal.Header closeButton>
                         <Modal.Title>Commission Payments Trend</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <div className="d-flex justify-content-end mb-3">
                              <div className="btn-group btn-group-sm" role="group" aria-label="Chart view toggle">
                                   <button type="button" className={`btn ${chartView === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setChartView('bar')}>
                                        Bar
                                   </button>
                                   <button type="button" className={`btn ${chartView === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setChartView('line')}>
                                        Line
                                   </button>
                              </div>
                         </div>
                         <CommissionLineChart data={chartData} view={chartView} />
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="outline-secondary" size="sm" onClick={() => setShowChart(false)}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>
               {!loading && paidCommissions.length === 0 ? (
                    <main className="container py-4">
                         <div className="alert alert-info d-flex align-items-center" role="alert">
                              <RiUserLine size={28} className="me-2" style={{ opacity: 0.5 }} />
                              <div>
                                   <strong>No Paid Commissions Found</strong>
                                   <div>No paid commission records found for this clinician.</div>
                              </div>
                         </div>
                    </main>)
                    : null
               }
          </div>
     );
}
