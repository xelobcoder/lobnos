"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { customFetch, customPost, currencyFormatter } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import CommissionLineChart from '../../../clinicians/commision-information/CommissionLineChart';
import styles from '../../../clinicians/commision-information/CommissionReport.module.css';
import { RiAlertLine, RiFileList3Line, RiMoneyDollarCircleLine, RiServiceLine, RiPhoneLine, RiMapPinLine, RiHospitalLine } from '@remixicon/react';

interface CommissionData {
     service_date: string;
     organization_id: number;
     organization_name: string;
     serviceid: number;
     organization_phone: string;
     organization_type: string;
     organization_location: string;
     total_services: number;
     total_payable: string;
     total_paid: string;
     commission_earned: string;
}

async function getOrganizationCommission({ organizationid, startDate, endDate }: { organizationid: string; startDate: string; endDate: string; }) {
     try {
          const url = `organization/commission?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&organizationid=${encodeURIComponent(organizationid)}`;
          const response = await customFetch(url);
          const records = Array.isArray(response.result)
               ? response.result
               : Array.isArray(response.data)
                    ? response.data
                    : [];
          return records as CommissionData[];
     } catch (error: any) {
          return { error: error.message || 'An unknown error occurred' };
     }
}

export default function OrganizationCommissionDetails({ params }: { params: { organization: string } }) {
     const today = dayjs().format('YYYY-MM-DD');
     const defaultStart = dayjs().startOf('year').format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [dateFilter, setDateFilter] = useState('This Year');
     const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
     const [paymentModes, setPaymentModes] = useState<{ KeyID: number; PaymentMode: string }[]>([]);
     const [showBulkPayModal, setShowBulkPayModal] = useState(false);
     const [bulkPayAmount, setBulkPayAmount] = useState('');
     const [bulkPayMethod, setBulkPayMethod] = useState<number | null>(null);
     const [bulkPayLoading, setBulkPayLoading] = useState(false);
     const [bulkPayError, setBulkPayError] = useState<string | null>(null);
     const [bulkPayType, setBulkPayType] = useState<'paid' | 'payable'>('paid');
     const [chartView, setChartView] = useState<'bar' | 'line'>('bar');
     const employeeid = useApplication()?.user?.employeeid;
     const branchid = useApplication()?.branchid;
     const [lastRefreshTime, setLastRefreshTime] = useState<string>(dayjs().format('HH:mm:ss'));

     // Auto-reload every 30 seconds
     useEffect(() => {
          const interval = setInterval(() => {
               loadCommissionData();
               setLastRefreshTime(dayjs().format('HH:mm:ss'));
          }, 30000); // 30 seconds
          return () => clearInterval(interval);
     }, [params.organization, startDate, endDate]);

     const loadPaymentModes = async () => {
          try {
               const response = await customFetch('paymentmodes');
               if (!response || !response.status) {
                    return [];
               }
               const modes = Array.isArray(response.data) ? response.data : [];
               return modes;
          } catch (error) {
               console.error('Error loading payment modes:', error);
               return [];
          }
     };

     const loadCommissionData = async () => {
          setLoading(true);
          setError(null);
          try {
               const res = await getOrganizationCommission({ organizationid: params.organization, startDate, endDate });
               if ((res as any).error) {
                    setError((res as any).error);
                    setCommissionData([]);
               } else {
                    setCommissionData(res as CommissionData[]);
               }
               if (paymentModes.length === 0) {
                    const modes = await loadPaymentModes();
                    setPaymentModes(modes);
               }
          } catch (err: any) {
               setError(err.message || 'An unknown error occurred');
               setCommissionData([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadCommissionData();
     }, [params.organization, startDate, endDate]);

     const handleDateRangeChange = (start: string, end: string) => {
          setStartDate(start);
          setEndDate(end);
     };

     const handleResetFilters = () => {
          setStartDate(defaultStart);
          setEndDate(today);
          setDateFilter('This Year');
     };

     const handleSelectRecord = (serviceId: number) => {
          setSelectedRecords((prev) => {
               const next = new Set(prev);
               if (next.has(serviceId)) {
                    next.delete(serviceId);
               } else {
                    next.add(serviceId);
               }
               return next;
          });
     };

     const handleSelectAll = () => {
          setSelectedRecords((prev) => {
               if (prev.size === commissionData.length) {
                    return new Set();
               }
               return new Set(commissionData.map((record) => record.serviceid));
          });
     };

     const selectedCommissionDue = commissionData.reduce((sum, record) => {
          return selectedRecords.has(record.serviceid)
               ? sum + Number(record.commission_earned)
               : sum;
     }, 0);

     const handleBulkPay = async () => {
          setBulkPayLoading(true);
          setBulkPayError(null);
          try {
               if (!bulkPayAmount || Number(bulkPayAmount) <= 0) {
                    setBulkPayError('Please enter an amount to pay.');
                    return;
               }
               if (Number(bulkPayAmount) > selectedCommissionDue) {
                    setBulkPayError('Amount cannot exceed total commission due.');
                    return;
               }
               if (!bulkPayMethod) {
                    setBulkPayError('Please select a payment method.');
                    return;
               }
               const selectedServiceIds = Array.from(selectedRecords);
               const payload = {
                    startDate,
                    endDate,
                    commissionDue: selectedCommissionDue,
                    amountPaid: Number(bulkPayAmount),
                    commissionType: bulkPayType,
                    paymentMethod: bulkPayMethod,
                    employeeid,
                    recipient_type: 'organization',
                    branchid,
                    recipientid: params.organization,
                    services: selectedServiceIds,
               };
               const response = await customPost(
                    `commission-payments/commission/batch/process-services?employeeid=${employeeid || ''}&branchid=${branchid || ''}`,
                    'POST',
                    payload
               );
               if (response && (response.success || response.status === true || response.status === 'success')) {
                    toast.success('Commission payment processed successfully!');
                    setShowBulkPayModal(false);
                    setBulkPayAmount('');
                    setBulkPayMethod(null);
                    setSelectedRecords(new Set());
                    setLastRefreshTime(dayjs().format('HH:mm:ss'));
                    loadCommissionData();
               } else {
                    setBulkPayError(response?.message || 'Failed to process payment.');
               }
          } catch (err: any) {
               setBulkPayError(err.message || 'Unknown error');
          } finally {
               setBulkPayLoading(false);
          }
     };

     const formattedDate = (dateString: string) => {
          try {
               return dayjs(dateString).format('DD MMM YYYY');
          } catch {
               return 'Invalid Date';
          }
     };

     const summary = commissionData.reduce(
          (acc, item) => {
               acc.total_services += item.total_services;
               acc.total_payable += Number(item.total_payable);
               acc.total_paid += Number(item.total_paid);
               acc.total_commission += Number(item.commission_earned);
               return acc;
          },
          {
               total_services: 0,
               total_payable: 0,
               total_paid: 0,
               total_commission: 0,
          }
     );

     const organizationInfo = commissionData.length > 0
          ? commissionData[0]
          : {
               organization_name: 'Unknown Organization',
               organization_phone: 'N/A',
               organization_type: 'N/A',
               organization_location: 'N/A',
          };

     if (error) {
          return (
               <main className={styles.container}>
                    <div className={styles.header}>
                         <h1 className={styles.title}>Could Not Load Organization Commission Data</h1>
                    </div>
                    <div className={styles.errorBox}>
                         <RiAlertLine size={40} />
                         <div>
                              <p><strong>There was a problem connecting to the API.</strong></p>
                              <p>{error}</p>
                         </div>
                    </div>
               </main>
          );
     }

     return (
          <main className={styles.container}>
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className={styles.title} style={{ margin: 0 }}>
                         <RiHospitalLine className="me-2" />
                         {organizationInfo.organization_name.toUpperCase()} - Commission Details
                    </h1>
                    <div className="d-flex gap-2">
                         <Link
                              href={`/organization/commission-update/${params.organization}`}
                              className="btn btn-outline-primary btn-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                         >
                              Update Commission Records
                         </Link>
                         <Link
                              href={`/organization/commissions-paid/${params.organization}`}
                              className="btn btn-outline-success btn-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                         >
                              View Paid Commissions
                         </Link>
                    </div>
               </div>
               <hr />

               <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-md-3">
                         <div className="border rounded p-3 h-100">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                   <RiPhoneLine size={18} className="text-secondary" />
                                   <span className="text-muted small">Phone</span>
                              </div>
                              <div className="fw-bold fs-6">{organizationInfo.organization_phone}</div>
                         </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                         <div className="border rounded p-3 h-100">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                   <RiMapPinLine size={18} className="text-secondary" />
                                   <span className="text-muted small">Location</span>
                              </div>
                              <div className="fw-bold fs-6">{organizationInfo.organization_location}</div>
                         </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                         <div className="border rounded p-3 h-100">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                   <RiHospitalLine size={18} className="text-secondary" />
                                   <span className="text-muted small">Type</span>
                              </div>
                              <div className="fw-bold fs-6">{organizationInfo.organization_type}</div>
                         </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                         <div className="border rounded p-3 h-100">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                   <RiServiceLine size={18} className="text-secondary" />
                                   <span className="text-muted small">Total Services</span>
                              </div>
                              <div className="fw-bold fs-6">{summary.total_services.toLocaleString()}</div>
                         </div>
                    </div>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-md-6 col-lg-4">
                         <div className="border rounded p-4 h-100" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2ff 100%)' }}>
                              <div className="d-flex align-items-center gap-2 mb-3">
                                   <RiMoneyDollarCircleLine size={20} className="text-primary" />
                                   <span className="text-muted small fw-semibold">Total Payable</span>
                              </div>
                              <div className="fw-bold" style={{ fontSize: '1.75rem' }}>{currencyFormatter.format(summary.total_payable)}</div>
                              <small className="text-muted d-block mt-2">{summary.total_services} services</small>
                         </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-6 col-lg-4">
                         <div className="border rounded p-4 h-100" style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e0f9f0 100%)' }}>
                              <div className="d-flex align-items-center gap-2 mb-3">
                                   <RiMoneyDollarCircleLine size={20} className="text-success" />
                                   <span className="text-muted small fw-semibold">Total Paid</span>
                              </div>
                              <div className="fw-bold" style={{ fontSize: '1.75rem' }}>{currencyFormatter.format(summary.total_paid)}</div>
                              <small className="text-muted d-block mt-2">
                                   <span className={summary.total_paid > 0 ? 'text-success' : 'text-danger'}>
                                        {((summary.total_paid / summary.total_payable) * 100 || 0).toFixed(1)}% settled
                                   </span>
                              </small>
                         </div>
                    </div>
                    <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                         <div className="border rounded p-4 h-100" style={{ background: 'linear-gradient(135deg, #fef5f0 0%, #fde9e0 100%)', borderWidth: '2px', borderColor: '#ff7a45' }}>
                              <div className="d-flex align-items-center gap-2 mb-3">
                                   <RiMoneyDollarCircleLine size={20} style={{ color: '#ff7a45' }} />
                                   <span className="text-muted small fw-semibold">Commission Earned</span>
                              </div>
                              <div className="fw-bold" style={{ fontSize: '2rem', color: '#ff7a45' }}>{currencyFormatter.format(summary.total_commission)}</div>
                              <small className="text-muted d-block mt-2">Your earnings this period</small>
                         </div>
                    </div>
               </div>
               <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Last updated: {lastRefreshTime}</small>
                    <button onClick={() => { loadCommissionData(); setLastRefreshTime(dayjs().format('HH:mm:ss')); }} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" type="button" aria-label="Refresh data">🔄 Refresh</button>
               </div>

               {!commissionData.length && (
                    <div className="alert alert-info" style={{ borderRadius: '0.5rem', margin: '1rem 0' }}>
                         <RiHospitalLine size={20} className="me-2" />
                         No commission records found for this organization in the selected date range. Try adjusting the date filters above.
                    </div>
               )}

               <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)', margin: '2rem 0 1.5rem 0', background: 'none' }}>
                    <div className="card-header py-3 px-4" style={{ borderColor: 'var(--bs-border-color)', background: 'none' }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center" style={{ color: 'inherit' }}>
                                   Commission Trend
                              </h2>
                              <div className="d-flex gap-2">
                                   <DateFilterReusable
                                        value={dateFilter}
                                        onChange={setDateFilter}
                                        onDateRangeChange={handleDateRangeChange}
                                        label="Filter by"
                                        className="col-12 col-lg-auto"
                                   />
                                   <button onClick={loadCommissionData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load commission data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        Load Data
                                   </button>
                                   <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        Reset
                                   </button>
                              </div>
                              <div className="btn-group btn-group-sm" role="group" aria-label="Chart view toggle">
                                   <button type="button" className={`btn ${chartView === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} style={chartView === 'bar' ? {} : { fontWeight: 500 }} onClick={() => setChartView('bar')}>
                                        Bar
                                   </button>
                                   <button type="button" className={`btn ${chartView === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`} style={chartView === 'line' ? {} : { fontWeight: 500 }} onClick={() => setChartView('line')}>
                                        Line
                                   </button>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4" style={{ background: 'none' }}>
                         {loading ? (
                              <div className="text-center py-5">
                                   <div className="spinner-border text-primary" role="status" />
                                   <p className="mt-3 mb-0">Loading chart data...</p>
                              </div>
                         ) : commissionData.length > 0 ? (
                              <div style={{ width: '100%', height: 350 }}>
                                   <CommissionLineChart data={commissionData} view={chartView} />
                              </div>
                         ) : (
                              <div className="text-center py-5 text-muted">
                                   <p>No commission data available for chart</p>
                              </div>
                         )}
                    </div>
               </div>
               <div className={styles.sectionDivider}></div>

               <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)', margin: '2rem 0 1.5rem 0', backgroundColor: 'var(--theme-card-bg)' }}>
                    <div className="card-header py-3 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--bs-border-color)', backgroundColor: 'var(--theme-card-bg)' }}>
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center" style={{ color: 'inherit' }}>
                              <RiFileList3Line className="me-2" />
                              Detailed Commission Records
                         </h2>

                         <div className="d-flex flex-row align-items-center gap-2">
                              <button onClick={loadCommissionData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load commission data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                   Load Data
                              </button>
                              <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                   Reset
                              </button>
                         </div>
                    </div>
                    <div className="card-header py-3 px-4 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--bs-border-color)', backgroundColor: 'var(--theme-card-bg)' }}>
                         <div>
                              <small className="text-muted d-block mt-1" style={{ fontSize: '0.85rem' }}>
                                   <div className="row gx-2">
                                        <div className="col-6 mb-1"><strong>Service Date:</strong> <span className="ms-1">date when the service was rendered.</span></div>
                                        <div className="col-6 mb-1"><strong>Total Payable:</strong> <span className="ms-1">amount payable for the services on that date.</span></div>
                                        <div className="col-6"><strong>Total Paid:</strong> <span className="ms-1">amount actually paid for the services.</span></div>
                                        <div className="col-6"><strong>Commission Earned:</strong> <span className="ms-1">commission earned for the services rendered.</span></div>
                                   </div>
                              </small>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4" style={{ backgroundColor: 'var(--theme-card-bg)' }}>

                         {selectedRecords.size > 0 && (
                              <div className="mb-3">
                                   <Button variant="success" size="sm" onClick={() => setShowBulkPayModal(true)}>
                                        Pay Commission for Selected ({selectedRecords.size})
                                   </Button>
                              </div>
                         )}
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small text-start">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th className="py-2 text-center">
                                                  <input
                                                       type="checkbox"
                                                       className="form-check-input"
                                                       checked={selectedRecords.size === commissionData.length && commissionData.length > 0}
                                                       onChange={handleSelectAll}
                                                  />
                                             </th>
                                             <th>Date</th>
                                             <th>Service ID</th>
                                             <th>Services</th>
                                             <th>Total Payable</th>
                                             <th>Total Paid</th>
                                             <th>Commission Earned</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {commissionData.map((record) => (
                                             <tr key={record.serviceid} className={selectedRecords.has(record.serviceid) ? 'table-active' : ''}>
                                                  <td className="py-2 text-center">
                                                       <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selectedRecords.has(record.serviceid)}
                                                            onChange={() => handleSelectRecord(record.serviceid)}
                                                       />
                                                  </td>
                                                  <td>{formattedDate(record.service_date)}</td>
                                                  <td>{record.serviceid}</td>
                                                  <td>{record.total_services.toLocaleString()}</td>
                                                  <td>{currencyFormatter.format(Number(record.total_payable))}</td>
                                                  <td>{currencyFormatter.format(Number(record.total_paid))}</td>
                                                  <td>{currencyFormatter.format(Number(record.commission_earned))}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>

               <Modal show={showBulkPayModal} backdrop="static" onHide={() => setShowBulkPayModal(false)}>
                    <Modal.Header closeButton className="py-2">
                         <Modal.Title className="fs-6 fw-semibold text-body-emphasis">
                              Pay Commission for Selected Records
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="py-2">
                         <div className="mb-2 small">
                              <div className="mb-2">
                                   <strong>Period:</strong> {startDate} &mdash; {endDate}
                              </div>
                              <div className="mb-3">
                                   <strong>Selected Records:</strong> {selectedRecords.size} &nbsp;|&nbsp; <strong>Total Commission Earned:</strong> {currencyFormatter.format(selectedCommissionDue)}
                              </div>
                              <Form.Group className="mb-3">
                                   <Form.Label className="small">Payment Method</Form.Label>
                                   <Form.Select value={bulkPayMethod ?? ''} onChange={e => setBulkPayMethod(Number(e.target.value))} className="form-select form-select-sm">
                                        <option value="">Select payment method</option>
                                        {paymentModes.map(mode => (
                                             <option key={mode.KeyID} value={mode.KeyID}>{mode.PaymentMode}</option>
                                        ))}
                                   </Form.Select>
                              </Form.Group>
                         </div>
                         <Form.Group className="mb-3">
                              <Form.Label className="small">Amount to Pay</Form.Label>
                              <Form.Control
                                   type="number"
                                   min="0"
                                   max={selectedCommissionDue}
                                   value={bulkPayAmount}
                                   onChange={(e) => setBulkPayAmount(e.target.value)}
                                   placeholder="Enter amount to pay"
                                   className="form-control form-control-sm"
                              />
                              <Form.Text className="text-muted small">Amount must be less than or equal to total commission due.</Form.Text>
                         </Form.Group>
                         {bulkPayError && <div className="text-danger small mb-2">{bulkPayError}</div>}
                    </Modal.Body>
                    <Modal.Footer className="py-2">
                         <Button variant="outline-secondary" size="sm" onClick={() => setShowBulkPayModal(false)} disabled={bulkPayLoading} className="small">
                              Cancel
                         </Button>
                         <Button variant="outline-primary" size="sm" onClick={handleBulkPay} disabled={bulkPayLoading || !bulkPayAmount} className="small">
                              {bulkPayLoading ? 'Processing...' : 'Pay Commission'}
                         </Button>
                    </Modal.Footer>
               </Modal>
          </main>
     );
}
