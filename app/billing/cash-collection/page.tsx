"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import { customFetch, customPost, fetchPatientPersonalInfo } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import BillingPagePatientInformation from '../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { useSearchParams } from 'next/navigation';
import { plsDecryption, plsEncryption } from '../../../lib/encryption';
import { useApplication } from '../../../components/Auth/useApplicationContext';

interface ServiceDetail {
     totalpayable: string; totalcost: string; serviceid: number; service_name: string;
     paymentstatus: string; paidamount: string; outstanding: string; discount: string;
     amountIncurredDueTax: string; isRefunded: boolean; amountRefunded: number;
}
interface BillingRecord {
     billingid: number; patientid: number; totalTransactionCost: string; totalcost: string;
     paid: string; payable: string; totalrefunded: string; discount: string; outstanding: string;
     balance: string; billedon: string; clientstatus: string; year: number; month: number;
     day: number; amountIncurredDueTax: string; lastupdated: string; branchid: number;
     isPromo: number; promoValue: string; promoMethod: string; promoCodeId: number; status: string;
     relatedBillingId: number | null; isAdjustment: number; adjustedBy: number | null;
     adjustmentReason: string | null; adjustmentType: string | null; islocked: number;
     adjustmentdate: string | null; adjustmentamount: string | null; additionalinformation: string | null;
     writeoff: string; serviceDetails: ServiceDetail[];
}
interface BulkOutstandingResponse { success: boolean; data: { outstandingAmount: string; records: BillingRecord[] }; }
interface PaymentMode { KeyID: number; PaymentMode: string; }
interface StagedService { payment: string; waiveOff: string; error: boolean; }
interface OutstandingRow {
     billingid: number; patientid: number; billedon: string; payable: string; paid: string; outstanding: string;
     fullpatientid: string | null; mobile_number: string | null; patient_name: string | null; age_days: number;
}
interface OutstandingList {
     records: OutstandingRow[]; page: number; count: number;
     summary: { bills: number; patients: number; totalOutstanding: number; totalPaid: number };
}

const SkeletonRow = () => (
     <div className="rounded p-2 mb-2 border" style={{ background: '#f5f5f5' }}>
          <div style={{ height: 12, background: '#e0e0e0', borderRadius: 4, width: '60%', marginBottom: 6 }} />
          <div style={{ height: 10, background: '#e0e0e0', borderRadius: 4, width: '80%' }} />
     </div>
);

const money = (n: number) =>
     '₵' + (Number.isFinite(n) ? n : 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SummaryTile = ({ label, value, tone, active }: { label: string; value: string; tone: string; active?: boolean }) => (
     <div className={`flex-fill px-3 py-2 border rounded ${active ? `bg-${tone}-subtle border-${tone}` : 'bg-white'}`} style={{ minWidth: 150, transition: 'background .2s, border-color .2s' }}>
          <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.6px' }}>{label}</div>
          <div className={`fw-bold text-${tone}`} style={{ fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
     </div>
);

export default function CashCollection() {
     const [searchPatientId, setSearchPatientId]       = useState<string>('');
     const [searchBillingId, setSearchBillingId]       = useState<string>('');
     const [statusFilter, setStatusFilter]             = useState<string>(useSearchParams()?.get('paymentstatus') || 'pending');
     const [billingRecords, setBillingRecords]         = useState<BillingRecord[]>([]);
     const [selectedBillingId, setSelectedBillingId]  = useState<number | string | null>(null);
     const [patientId, setPatientId]                  = useState<number | string | null>(null);
     const [patientInfo, setPatientInfo]               = useState<any>(null);
     const [isLoading, setIsLoading]                  = useState<boolean>(false);
     const [hasSearched, setHasSearched]              = useState<boolean>(false);
     
     const [stagedData, setStagedData]                = useState<{ [serviceId: number]: StagedService }>({});
     const [globalWaiveOff, setGlobalWaiveOff]        = useState<string>('');
     const [globalPaymentMode, setGlobalPaymentMode]  = useState<number | ''>('');
     const [paymentModes, setPaymentModes]            = useState<PaymentMode[]>([]);
     const [tendered, setTendered]                    = useState<string>('');
     const [hidePaid, setHidePaid]                    = useState<boolean>(true);
     const [paidBills, setPaidBills]                  = useState<number[]>([]);
     const [dateFilter, setDateFilter]                = useState<string>('All');
     const [listRange, setListRange]                  = useState<{ start: string; end: string }>({ start: '', end: '' });
     const [listSearch, setListSearch]                = useState<string>('');
     const [debouncedSearch, setDebouncedSearch]      = useState<string>('');
     const [listPage, setListPage]                    = useState<number>(1);
     const [listReload, setListReload]                = useState<number>(0);
     const [listLoading, setListLoading]              = useState<boolean>(false);
     const [outstandingList, setOutstandingList]      = useState<OutstandingList | null>(null);
     const preselectBilling = useRef<number | null>(null);

     useEffect(() => {
          const t = setTimeout(() => setDebouncedSearch(listSearch.trim()), 300);
          return () => clearTimeout(t);
     }, [listSearch]);

     useEffect(() => {
          if (hasSearched) return;
          let cancelled = false;
          (async () => {
               setListLoading(true);
               try {
                    let url = `billing/client/outstanding-list?page=${listPage}&count=25`;
                    if (listRange.start && listRange.end) url += `&startDate=${listRange.start}&endDate=${listRange.end}`;
                    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
                    const r: any = await customFetch(url);
                    if (!cancelled && r?.success) setOutstandingList(r.data);
                    else if (!cancelled) toast.error('Could not load outstanding bills');
               } catch {
                    if (!cancelled) toast.error('Could not load outstanding bills');
               } finally {
                    if (!cancelled) setListLoading(false);
               }
          })();
          return () => { cancelled = true; };
     }, [hasSearched, listRange, debouncedSearch, listPage, listReload]);

     const collectFor = (row: OutstandingRow) => {
          preselectBilling.current = row.billingid;
          setSearchPatientId(String(row.patientid));
          setSearchBillingId('');
          doSearch(String(row.patientid), '');
     };

     const backToList = () => {
          setPaidBills([]);
          setHasSearched(false);
          setBillingRecords([]);
          setSelectedBillingId(null);
          setPatientId(null);
          setPatientInfo(null);
          setSearchPatientId('');
          setSearchBillingId('');
          setStagedData({});
          setGlobalPaymentMode('');
          setTendered('');
          setListReload(n => n + 1);
     };
     const urlPatientid = useSearchParams()?.get('patientid') || '';
     const urlBillingid = useSearchParams()?.get('billingid') || '';
     const employeeid   = useApplication()?.user?.employeeid;

     useEffect(() => { fetchPaymentModes(); }, []);
     useEffect(() => {
          if (urlPatientid || urlBillingid) {
               const decodedPid = urlPatientid ? plsDecryption(urlPatientid) : '';
               if (decodedPid) setSearchPatientId(decodedPid);
               if (urlBillingid) setSearchBillingId(urlBillingid);
               
               doSearch(decodedPid, urlBillingid);
          }
     }, [urlPatientid, urlBillingid]);

     const fetchPaymentModes = async () => {
          try {
               const r = await customFetch('paymentmodes');
               if (r?.status === 'success') setPaymentModes(r.data || []);
          } catch { }
     };

     const doSearch = async (pid?: string, bid?: string) => {
          const pId = pid !== undefined ? pid : searchPatientId;
          const bId = bid !== undefined ? bid : searchBillingId;
          
          if (!pId.trim() && !bId.trim()) return;
          
          setIsLoading(true);
          setHasSearched(true);

          if (pId.trim() && !isNaN(parseInt(pId))) {
               try {
                    const info = await fetchPatientPersonalInfo(parseInt(pId)) as any;
                    if (info?.result) {
                         setPatientInfo(info.result);
                         setPatientId(parseInt(pId));
                    }
               } catch (e) {
                    console.error("Initial patient info fetch failed", e);
               }
          }

          try {
               let url = `billing/client/bulk/outstanding?status=${statusFilter}`;
               if (pId.trim()) url += `&patientid=${pId}`;
               if (bId.trim()) url += `&billingid=${bId}`;
               
               const r = await customFetch(url) as BulkOutstandingResponse;
               
               if (r?.success && r?.data?.records?.length > 0) {
                    setBillingRecords(r.data.records);
                    
                    const recordIds = r.data.records.map(rec => rec.billingid);
                    if (preselectBilling.current && recordIds.includes(preselectBilling.current)) {
                         setSelectedBillingId(preselectBilling.current);
                         preselectBilling.current = null;
                    } else if (bId.trim()) {
                         const firstBid = bId.split(',')[0].trim();
                         if (recordIds.includes(parseInt(firstBid))) {
                              setSelectedBillingId(parseInt(firstBid));
                         } else {
                              setSelectedBillingId(r.data.records[0].billingid);
                         }
                    } else {
                         setSelectedBillingId(r.data.records[0].billingid);
                    }

                    const actualPatientId = r.data.records[0].patientid;
                    
                    if (actualPatientId !== patientId) {
                         setPatientId(actualPatientId);
                         try {
                              const info = await fetchPatientPersonalInfo(actualPatientId) as any;
                              if (info?.result) setPatientInfo(info.result);
                         } catch { }
                    }
                    
                    setStagedData({});
                    setGlobalWaiveOff('');
               } else {
                    setBillingRecords([]);
                    if (pId.trim()) setPatientId(pId);
                    if (bId.trim()) setSelectedBillingId(bId);

                    if (!pId.trim() && !bId.trim()) {
                         setPatientId(null);
                         setPatientInfo(null);
                    }
                    setStagedData({});
                    setGlobalWaiveOff('');
               }
          } catch { 
               setBillingRecords([]); 
               if (pId.trim()) setPatientId(pId);
               if (bId.trim()) setSelectedBillingId(bId);
               setStagedData({});
               setGlobalWaiveOff('');
          } finally { 
               setIsLoading(false); 
          }
     };

     const payAllOutstanding = () => {
          const newData: { [key: number]: StagedService } = {};
          billingRecords.forEach(r => r.serviceDetails.forEach(s => {
               const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
               if (s.paymentstatus !== 'paid' && bal > 0) {
                    newData[s.serviceid] = { payment: bal.toFixed(2), waiveOff: '', error: false };
               }
          }));
          setStagedData(newData);
          setGlobalWaiveOff('');
     };

     const payBillingRecord = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return;
          
          const newData: { [key: number]: StagedService } = {};
          record.serviceDetails.forEach(s => {
               const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
               if (s.paymentstatus !== 'paid' && bal > 0) {
                    newData[s.serviceid] = { payment: bal.toFixed(2), waiveOff: '', error: false };
               }
          });
          setStagedData(newData);
          setGlobalWaiveOff('');
          setSelectedBillingId(billingId);
     };

     const applyGlobalWaiveOff = (value: string) => {
          setGlobalWaiveOff(value);
          const totalWaive = parseFloat(value);
          
          if (isNaN(totalWaive) || totalWaive <= 0) {
               setStagedData(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(id => {
                         const svcId = parseInt(id);
                         updated[svcId] = { ...updated[svcId], waiveOff: '' };
                    });
                    return updated;
               });
               return;
          }

          const outstandingServices = billingRecords.flatMap(r => 
               r.serviceDetails.filter(s => s.paymentstatus !== 'paid' && (parseFloat(s.totalpayable) - parseFloat(s.paidamount)) > 0)
          );
          
          const totalOutstanding = outstandingServices.reduce((sum, s) => sum + (parseFloat(s.totalpayable) - parseFloat(s.paidamount)), 0);
          if (totalOutstanding === 0) return;

          setStagedData(prev => {
               const newData = { ...prev };
               outstandingServices.forEach(s => {
                    const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
                    const proportion = bal / totalOutstanding;
                    const serviceWaive = Math.min(bal, totalWaive * proportion);
                    
                    newData[s.serviceid] = {
                         payment: (bal - serviceWaive).toFixed(2),
                         waiveOff: serviceWaive.toFixed(2),
                         error: false
                    };
               });
               return newData;
          });
     };

     const handleValueChange = (serviceId: number, type: 'payment' | 'waiveOff', value: string, balance: number) => {
          setStagedData(prev => {
               const current = prev[serviceId] || { payment: '', waiveOff: '', error: false };
               let updated = { ...current, [type]: value };
               
               let p = parseFloat(updated.payment || '0');
               let w = parseFloat(updated.waiveOff || '0');
               
               const safeP = isNaN(p) ? 0 : p;
               const safeW = isNaN(w) ? 0 : w;

               if (type !== 'payment' && (safeP + safeW) > balance + 0.01) {
                    const remaining = Math.max(0, balance - safeW);
                    updated.payment = remaining > 0 ? remaining.toFixed(2) : '';
                    p = remaining;
               }
               
               const finalTotal = (isNaN(p) ? 0 : p) + safeW;
               updated.error = finalTotal > (balance + 0.05);
               
               return { ...prev, [serviceId]: updated };
          });
     };

     const getNetOutstandingForBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return 0;
          const originalBal = parseFloat(record.outstanding);
          const adjustments = record.serviceDetails.reduce((s, svc) => {
               const stagedSvc = stagedData[svc.serviceid];
               if (!stagedSvc) return s;
               const w = parseFloat(stagedSvc.waiveOff || '0');
               return s + (isNaN(w) ? 0 : w);
          }, 0);
          return Math.max(0, originalBal - adjustments);
     };

     const stagedEntries = Object.entries(stagedData).filter(([_, v]) => {
          const p = parseFloat(v.payment || '0');
          const w = parseFloat(v.waiveOff || '0');
          return (p > 0 || w > 0);
     });
     
     const totalReady     = stagedEntries.reduce((s, [_, v]) => {
          const val = parseFloat(v.payment);
          return s + (isNaN(val) ? 0 : val);
     }, 0);
     const totalWaiveOff  = stagedEntries.reduce((s, [_, v]) => {
          const val = parseFloat(v.waiveOff);
          return s + (isNaN(val) ? 0 : val);
     }, 0);
     
     const hasErrors      = stagedEntries.some(([_, v]) => v.error);
     const canSubmit      = stagedEntries.length > 0 && !!globalPaymentMode && !hasErrors;

     const getStagedForBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return 0;
          return record.serviceDetails.reduce((s, svc) => s + parseFloat(stagedData[svc.serviceid]?.payment || '0'), 0);
     };

     const handleSubmit = async () => {
          if (!canSubmit) return;
          const allPayments: any[] = [];
          
          stagedEntries.forEach(([svcId, data]) => {
               const serviceId = parseInt(svcId);
               const record = billingRecords.find(r => r.serviceDetails.some(s => s.serviceid === serviceId));
               if (record) {
                    allPayments.push({
                         service_id: serviceId,
                         amount: parseFloat(data.payment || '0'),
                         waive_off: parseFloat(data.waiveOff || '0'),
                         payment_mode_id: globalPaymentMode,
                         billing_id: record.billingid
                    });
               }
          });

          setIsLoading(true);
          try {
               const r = await customPost('billing/multi-service/payment', 'POST', {
                    service_payments: allPayments, employeeid,
                    total_amount: totalReady,
                    total_waive_off: totalWaiveOff,
                    description: `Cash collection for ${stagedEntries.length} service(s). Waive-off: ${totalWaiveOff.toFixed(2)}`
               });
               if (r?.success == true) {
                    toast.success(r.message || 'Payment recorded successfully');
                    setStagedData({}); setGlobalPaymentMode(''); setTendered('');
                    setPaidBills(Array.from(new Set(allPayments.map(p => p.billing_id))));
                    doSearch();
               } else { toast.error(r?.message || 'Failed to record payment'); }
          } catch { toast.error('An error occurred. Please try again.'); } finally { setIsLoading(false); }
     };

     const selectedRecord = billingRecords.find(r => r.billingid === selectedBillingId);
     const panelHeight    = 'calc(100vh - 370px)';
     const totalOutstanding = billingRecords.reduce((s, r) => s + (parseFloat(r.outstanding) || 0), 0);
     const totalPaidSoFar   = billingRecords.reduce((s, r) => s + (parseFloat(r.paid) || 0), 0);
     const remainingAfter   = Math.max(0, totalOutstanding - totalReady - totalWaiveOff);
     const selectedModeName = paymentModes.find(m => m.KeyID === globalPaymentMode)?.PaymentMode || '';
     const isCashMode       = /cash/i.test(selectedModeName);
     const tenderedAmount   = parseFloat(tendered);
     const changeDue        = Number.isFinite(tenderedAmount) ? tenderedAmount - totalReady : null;

     return (
          <div>
               <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-4">
                         <div>
                              <h4 className="mb-0 fw-bold fs-5">Cash Collection</h4>
                              <p className="text-body-secondary mb-0 small">Collect outstanding patient balances</p>
                         </div>

                    </div>
               </div>

               <div className="card shadow-sm" style={{ fontSize: '0.85rem' }}>

                    <div className="card-header bg-white border-bottom py-2 px-3">
                         {patientInfo && (
                              <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                                   <div className="d-flex align-items-center gap-2 rounded-circle bg-primary-subtle text-primary fw-bold justify-content-center" style={{ width: 36, height: 36 }}>
                                        {String(patientInfo?.fullname ?? patientInfo?.firstname ?? '?').trim().charAt(0).toUpperCase()}
                                   </div>
                                   <div style={{ fontSize: '0.8rem' }}><BillingPagePatientInformation data={patientInfo} loadingststate={false} /></div>
                                   <div className="d-flex gap-2 ms-auto">
                                        {patientId && <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">Patient #{patientId}</span>}
                                        {selectedBillingId && <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-semibold">Billing #{selectedBillingId}</span>}
                                   </div>
                              </div>
                         )}
                         <div className="d-flex flex-wrap align-items-center gap-2">
                              {hasSearched && (
                                   <button className="btn btn-sm btn-outline-secondary" onClick={backToList}>&larr; Outstanding list</button>
                              )}
                              {patientId && (
                                   <Link href={`/billing/patientid/${plsEncryption(patientId.toString())}/multi`} className="btn btn-sm btn-outline-secondary">&larr; Back to Billing</Link>
                              )}
                              <div className="d-flex gap-2 align-items-center ms-auto">
                                   {hasSearched && (<>
                                   <small className="text-muted me-1">Switch to</small>
                                   <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Patient ID…"
                                        style={{ width: 130, fontSize: '0.8rem' }}
                                        value={searchPatientId}
                                        onChange={e => setSearchPatientId(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doSearch()}
                                   />
                                   <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Billing ID…"
                                        style={{ width: 130, fontSize: '0.8rem' }}
                                        value={searchBillingId}
                                        onChange={e => setSearchBillingId(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doSearch()}
                                   />
                                   <select className="form-select form-select-sm" style={{ width: 110, fontSize: '0.8rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                   </select>
                                   <button className="btn btn-sm btn-primary px-3" style={{ fontSize: '0.8rem' }} onClick={() => doSearch()} disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-1" />Searching…</> : 'Search'}
                                   </button>
                                   </>)}
                              </div>
                         </div>
                    </div>

                    {hasSearched && paidBills.length > 0 && (
                         <div className="d-flex flex-wrap align-items-center gap-2 px-3 py-2 bg-success-subtle border-bottom border-success-subtle">
                              <span className="fw-semibold text-success-emphasis me-2">✓ Payment recorded</span>
                              {paidBills.map(id => (
                                   <div key={id} className="d-flex align-items-center gap-1 bg-white border rounded px-2 py-1">
                                        <span className="fw-semibold me-1">Bill #{id}</span>
                                        <a className="btn btn-sm btn-success py-0" target="_blank" rel="noreferrer" href={`/billing/cash-collection/pos-receipt-test?billingid=${id}&is_pos=false`}>Print receipt</a>
                                        <a className="btn btn-sm btn-outline-secondary py-0" target="_blank" rel="noreferrer" href={`/billing/cash-collection/pos-receipt-test?billingid=${id}&is_pos=true`}>POS</a>
                                        <a className="btn btn-sm btn-outline-primary py-0" target="_blank" rel="noreferrer" href={`/billing/cash-collection/invoice?billingid=${id}`}>Generate invoice</a>
                                   </div>
                              ))}
                              <button className="btn-close ms-auto" aria-label="Dismiss" onClick={() => setPaidBills([])} />
                         </div>
                    )}

                    {hasSearched && billingRecords.length > 0 && (
                         <div className="d-flex flex-wrap gap-2 p-3 bg-light border-bottom">
                              <SummaryTile label="Outstanding" value={money(totalOutstanding)} tone="danger" />
                              <SummaryTile label="Already paid" value={money(totalPaidSoFar)} tone="secondary" />
                              <SummaryTile label="Collecting now" value={money(totalReady)} tone="success" active={totalReady > 0} />
                                                            <SummaryTile label="Waive-off" value={money(totalWaiveOff)} tone="warning" active={totalWaiveOff > 0} />
                              <SummaryTile label="Remaining after" value={money(remainingAfter)} tone="primary" />
                         </div>
                    )}

                    <div className="card-body p-0">
                         {!hasSearched ? (
                         <div>
                              <div className="d-flex flex-wrap align-items-center gap-2 p-3 border-bottom">
                                   <div className="input-group" style={{ maxWidth: 340 }}>
                                        <span className="input-group-text bg-white">🔍</span>
                                        <input
                                             type="search"
                                             className="form-control"
                                             placeholder="Search name, patient ID, phone or bill #"
                                             aria-label="Search outstanding bills"
                                             value={listSearch}
                                             onChange={e => { setListSearch(e.target.value); setListPage(1); }}
                                        />
                                   </div>
                                   <DateFilterReusable
                                        id="outstanding-date-filter"
                                        className=""
                                        label="Billed date"
                                        value={dateFilter}
                                        onChange={v => { setDateFilter(v || 'All'); setListPage(1); }}
                                        onDateRangeChange={(s, e) => { setListRange(dateFilter === 'All' && !s ? { start: '', end: '' } : { start: s, end: e }); setListPage(1); }}
                                   />
                                   <button className="btn btn-outline-secondary ms-auto" onClick={() => setListReload(n => n + 1)} disabled={listLoading}>
                                        {listLoading ? <span className="spinner-border spinner-border-sm" /> : '↻ Refresh'}
                                   </button>
                              </div>

                              {outstandingList && (
                                   <div className="d-flex flex-wrap gap-2 p-3 bg-light border-bottom">
                                        <SummaryTile label="Patients owing" value={String(outstandingList.summary.patients)} tone="primary" />
                                        <SummaryTile label="Unsettled bills" value={String(outstandingList.summary.bills)} tone="secondary" />
                                        <SummaryTile label="Total outstanding" value={money(outstandingList.summary.totalOutstanding)} tone="danger" />
                                        <SummaryTile label="Already paid on these" value={money(outstandingList.summary.totalPaid)} tone="success" />
                                   </div>
                              )}

                              <div style={{ maxHeight: 'calc(100vh - 430px)', minHeight: 240, overflowY: 'auto' }}>
                                   <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light sticky-top">
                                             <tr>
                                                  <th>Patient</th>
                                                  <th>Bill #</th>
                                                  <th>Billed on</th>
                                                  <th className="text-end">Payable</th>
                                                  <th className="text-end">Paid</th>
                                                  <th className="text-end">Outstanding</th>
                                                  <th>Age</th>
                                                  <th style={{ width: 110 }}></th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {listLoading && !outstandingList && [1, 2, 3, 4].map(i => (
                                                  <tr key={i}><td colSpan={8}><SkeletonRow /></td></tr>
                                             ))}
                                             {outstandingList && outstandingList.records.length === 0 && (
                                                  <tr><td colSpan={8} className="text-center text-muted py-5">
                                                       <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>🎉</div>
                                                       No outstanding bills match these filters
                                                  </td></tr>
                                             )}
                                             {outstandingList?.records.map(r => {
                                                  const days = Number(r.age_days) || 0;
                                                  const ageTone = days > 30 ? 'danger' : days > 7 ? 'warning' : 'secondary';
                                                  return (
                                                       <tr key={r.billingid} style={{ cursor: 'pointer' }} onClick={() => collectFor(r)}>
                                                            <td>
                                                                 <div className="fw-semibold">{r.patient_name || `Patient #${r.patientid}`}</div>
                                                                 <small className="text-muted">{r.fullpatientid}{r.mobile_number ? ` · ${r.mobile_number}` : ''}</small>
                                                            </td>
                                                            <td>#{r.billingid}</td>
                                                            <td>{new Date(r.billedon).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                            <td className="text-end">{money(Number(r.payable))}</td>
                                                            <td className="text-end text-success">{money(Number(r.paid))}</td>
                                                            <td className="text-end fw-bold text-danger">{money(Number(r.outstanding))}</td>
                                                            <td><span className={`badge bg-${ageTone}-subtle text-${ageTone}-emphasis`}>{days === 0 ? 'Today' : `${days}d`}</span></td>
                                                            <td className="text-end">
                                                                 <button className="btn btn-sm btn-success" onClick={e => { e.stopPropagation(); collectFor(r); }}>Collect</button>
                                                            </td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </table>
                              </div>

                              {outstandingList && (
                                   <div className="d-flex align-items-center justify-content-between p-3 border-top">
                                        <small className="text-muted">Page {outstandingList.page} · showing {outstandingList.records.length} of {outstandingList.summary.bills}</small>
                                        <div className="btn-group">
                                             <button className="btn btn-sm btn-outline-secondary" disabled={listPage <= 1 || listLoading} onClick={() => setListPage(p => p - 1)}>← Prev</button>
                                             <button className="btn btn-sm btn-outline-secondary" disabled={listPage * outstandingList.count >= outstandingList.summary.bills || listLoading} onClick={() => setListPage(p => p + 1)}>Next →</button>
                                        </div>
                                   </div>
                              )}
                         </div>
                         ) : isLoading && billingRecords.length === 0 ? (
                              <div className="p-3" style={{ minHeight: 320 }}>
                                   {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                              </div>
                         ) : billingRecords.length === 0 ? (
                              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 320 }}>
                                   <div style={{ fontSize: '3.5rem', opacity: 0.2 }}>📭</div>
                                   <h6 className="text-muted mt-3 mb-1">No billing records found</h6>
                                   <p className="text-muted small mb-0">This patient has no outstanding billing records matching the selected filter</p>
                              </div>
                         ) : (
                              <div className="row g-0">

                                   <div className="                                   col-12 col-md-5 col-xl-4 border-end bg-body-tertiary" style={{ height: panelHeight, overflowY: 'auto' }}>
                                        <div className="p-2">
                                             <div className="mb-2">
                                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                                       <span className="text-uppercase fw-semibold text-body-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.6px' }}>
                                                            Open bills <span className="text-body-tertiary">({billingRecords.length})</span>
                                                       </span>
                                                       <button className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold" style={{ fontSize: '0.72rem' }} onClick={payAllOutstanding}>
                                                            Stage all
                                                       </button>
                                                  </div>
                                                  <div className="input-group input-group-sm">
                                                       <span className="input-group-text bg-white text-body-secondary" style={{ fontSize: '0.7rem' }}>Waive-off all</span>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            placeholder="0.00"
                                                            value={globalWaiveOff}
                                                            onChange={e => applyGlobalWaiveOff(e.target.value)}
                                                            style={{ fontSize: '0.75rem', textAlign: 'right' }}
                                                       />
                                                  </div>
                                             </div>

                                             {billingRecords.map(record => {
                                                  const outstanding = parseFloat(record.outstanding);
                                                  const netOutstanding = getNetOutstandingForBilling(record.billingid);
                                                  const staged      = getStagedForBilling(record.billingid);
                                                  const isSelected  = selectedBillingId === record.billingid;
                                                  const hasAdjustment = netOutstanding !== outstanding;
                                                  
                                                  const status = outstanding <= 0 ? 'SETTLED' : parseFloat(record.paid) > 0 ? 'PART-PAID' : 'UNPAID';
                                                  const statusTone = outstanding <= 0 ? 'success' : parseFloat(record.paid) > 0 ? 'warning' : 'danger';

                                                  return (
                                                       <div
                                                            key={record.billingid}
                                                            onClick={() => setSelectedBillingId(record.billingid)}
                                                            className={`rounded mb-2 border ${isSelected ? 'border-primary shadow-sm' : ''}`}
                                                            style={{
                                                                 cursor: 'pointer',
                                                                 borderLeft: `3px solid var(--bs-${statusTone})`,
                                                                 background: isSelected ? '#f0f6ff' : '#fff',
                                                                 padding: '12px 14px',
                                                                 fontSize: '1rem'
                                                            }}
                                                       >
                                                            <div className="d-flex justify-content-between align-items-baseline">
                                                                 <span className="fw-semibold">#{record.billingid}</span>
                                                                 <span className={`fw-bold text-${outstanding > 0 ? 'danger' : 'secondary'}`} style={{ fontVariantNumeric: 'tabular-nums', textDecoration: hasAdjustment ? 'line-through' : 'none', opacity: hasAdjustment ? 0.6 : 1 }}>
                                                                      ₵{outstanding.toFixed(2)}
                                                                 </span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center text-body-secondary" style={{ fontSize: '0.9rem' }}>
                                                                 <span>
                                                                      {new Date(record.billedon).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                                      <span className={`ms-2 text-${statusTone}-emphasis fw-semibold`}>{status}</span>
                                                                 </span>
                                                                 <span style={{ fontVariantNumeric: 'tabular-nums' }}>Paid ₵{parseFloat(record.paid).toFixed(2)}</span>
                                                            </div>
                                                            {(hasAdjustment || staged > 0 || record.isAdjustment === 1) && (
                                                                 <div className="d-flex flex-wrap gap-1 mt-1">
                                                                      {record.isAdjustment === 1 && <span className="badge bg-warning text-dark" style={{ fontSize: '0.75rem' }}>ADJ</span>}
                                                                      {hasAdjustment && <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.75rem' }}>Net ₵{netOutstanding.toFixed(2)}</span>}
                                                                      {staged > 0 && <span className="badge bg-success" style={{ fontSize: '0.75rem' }}>₵{staged.toFixed(2)} staged</span>}
                                                                 </div>
                                                            )}
                                                            {netOutstanding > 0 && isSelected && (
                                                                 <button
                                                                      className="                                                                      btn btn-primary w-100 fw-semibold mt-2"
                                                                                                                                            style={{ fontSize: '0.95rem', padding: '8px 0' }}
                                                                      onClick={e => { e.stopPropagation(); payBillingRecord(record.billingid); }}
                                                                 >
                                                                      Stage full balance
                                                                 </button>
                                                            )}
                                                       </div>
                                                  );
                                             })}
                                        </div>
                                   </div>

                                   <div className="col-12 col-md-7 col-xl-8 d-flex flex-column" style={{ height: panelHeight }}>

                                        {selectedRecord ? (
                                             <>
                                                  <div style={{ flex: 1, overflowY: 'auto' }}>
                                                       <div className="p-3">
                                                            <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                                                 <div>
                                                                      <h5 className="mb-0 fw-bold fs-6">Services</h5>
                                                                      <span className="text-muted" style={{ fontSize: "0.9rem" }}>Billing #{selectedRecord.billingid}</span>
                                                                 </div>
                                                                 <div className="d-flex align-items-center gap-3">
                                                                      <div className="form-check form-switch mb-0">
                                                                           <input className="form-check-input" type="checkbox" role="switch" id="hide-paid" checked={hidePaid} onChange={e => setHidePaid(e.target.checked)} />
                                                                           <label className="form-check-label small text-muted" htmlFor="hide-paid">Hide fully paid</label>
                                                                      </div>
                                                                      <span className="badge bg-secondary" style={{ fontSize: "0.85rem" }}>{selectedRecord.serviceDetails.length} service(s)</span>
                                                                 </div>
                                                            </div>

                                                            {selectedRecord.adjustmentReason && (
                                                                 <div className="border-start border-3 border-warning bg-body-tertiary py-1 px-3 mb-2 small text-body-secondary">
                                                                      <span className="fw-semibold">Adjustment:</span> {selectedRecord.adjustmentReason}
                                                                 </div>
                                                            )}

                                                            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
                                                                 <thead className="table-light sticky-top" style={{ top: 0, zIndex: 10 }}>
                                                                      <tr>
                                                                           <th>Service</th>
                                                                           <th className="text-end">Payable</th>
                                                                           <th className="text-end">Paid</th>
                                                                           <th className="text-end">Balance</th>
                                                                           <th className="text-end" style={{ width: 120 }}>Waive-off</th>
                                                                           <th className="text-end" style={{ width: 200 }}>Payment</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {selectedRecord.serviceDetails.filter(s => !(hidePaid && s.paymentstatus === 'paid' && selectedRecord.serviceDetails.some(o => o.paymentstatus !== 'paid'))).map(service => {
                                                                           const paid    = parseFloat(service.paidamount);
                                                                           const payable = parseFloat(service.totalpayable);
                                                                           const balance = payable - paid;
                                                                           const isPaid  = service.paymentstatus === 'paid';
                                                                           const stagedSvc = stagedData[service.serviceid] || { payment: '', waiveOff: '', error: false };
                                                                           const staged  = parseFloat(stagedSvc.payment || '0');
                                                                           const waive   = parseFloat(stagedSvc.waiveOff || '0');
                                                                           const netBalance = balance - (isNaN(waive) ? 0 : waive);
                                                                           const hasError = stagedSvc.error;

                                                                           let rowBg = 'transparent';
                                                                           if (isPaid) rowBg = '#f8fff8';
                                                                           else if ((staged > 0 || waive > 0) && !hasError) rowBg = '#fffbe6';
                                                                           else if (hasError) rowBg = '#fff0f0';

                                                                           return (
                                                                                <tr key={service.serviceid} style={{ background: rowBg }}>
                                                                                     <td>
                                                                                          <div className="fw-medium">{service.service_name}</div>
                                                                                          {isPaid && <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.65rem' }}>PAID</span>}
                                                                                          {!isPaid && (staged > 0 || waive > 0) && !hasError && <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: '0.65rem' }}>STAGED</span>}
                                                                                     </td>
                                                                                     <td className="text-end">₵{payable.toFixed(2)}</td>
                                                                                     <td className="text-end text-success fw-medium">₵{paid.toFixed(2)}</td>
                                                                                     <td className="text-end">
                                                                                          <div className={`fw-bold ${balance > 0 ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.9rem', textDecoration: (waive > 0) ? 'line-through' : 'none', opacity: (waive > 0) ? 0.6 : 1 }}>₵{balance.toFixed(2)}</div>
                                                                                          {!isPaid && (waive > 0) && (
                                                                                               <div className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                                                                                                    Net: {netBalance.toFixed(2)}
                                                                                               </div>
                                                                                          )}
                                                                                     </td>
                                                                                     <td>
                                                                                          {!isPaid && balance > 0 ? (
                                                                                               <input
                                                                                                    type="number"
                                                                                                    className="form-control form-control-sm"
                                                                                                    style={{ width: 100 }}
                                                                                                    placeholder="0.00"
                                                                                                    min={0}
                                                                                                    max={balance}
                                                                                                    step="0.01"
                                                                                                    value={stagedSvc.waiveOff}
                                                                                                    onChange={e => handleValueChange(service.serviceid, 'waiveOff', e.target.value, balance)}
                                                                                               />
                                                                                          ) : <small className="text-muted">—</small>}
                                                                                     </td>
                                                                                     <td>
                                                                                          {!isPaid && balance > 0 ? (
                                                                                               <div>
                                                                                                    <div className="d-flex align-items-center justify-content-end gap-2">
                                                                                                         <input
                                                                                                              type="number"
                                                                                                              className={`form-control ${hasError ? 'border-danger' : staged > 0 ? 'border-warning' : ''}`}
                                                                                                              style={{ width: 110, fontSize: '0.95rem' }}
                                                                                                              placeholder="0.00"
                                                                                                              min={0}
                                                                                                              max={balance}
                                                                                                              step="0.01"
                                                                                                              value={stagedSvc.payment}
                                                                                                              onChange={e => handleValueChange(service.serviceid, 'payment', e.target.value, balance)}
                                                                                                         />
                                                                                                         <button
                                                                                                              className="btn btn-outline-primary"
                                                                                                              style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                                                                                                              disabled={Math.abs(staged - balance) < 0.005 && waive === 0}
                                                                                                              onClick={() => {
                                                                                                                   setStagedData(prev => ({
                                                                                                                        ...prev,
                                                                                                                        [service.serviceid]: {
                                                                                                                             payment: balance.toFixed(2),
                                                                                                                             waiveOff: '',
                                                                                                                             error: false
                                                                                                                        }
                                                                                                                   }));
                                                                                                              }}
                                                                                                         >
                                                                                                              Pay Full
                                                                                                         </button>
                                                                                                    </div>
                                                                                                    {hasError && (
                                                                                                         <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>
                                                                                                              ⚠ Total exceeds balance of ₵{balance.toFixed(2)}
                                                                                                         </div>
                                                                                                    )}
                                                                                               </div>
                                                                                          ) : isPaid && service.amountRefunded > 0 ? (
                                                                                               <small className="text-muted">Refunded ₵{service.amountRefunded.toFixed(2)}</small>
                                                                                          ) : (
                                                                                               <small className="text-muted">—</small>
                                                                                          )}
                                                                                     </td>
                                                                                </tr>
                                                                           );
                                                                      })}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>

                                                  {stagedEntries.length > 0 && (
                                                       <div className="border-top bg-light p-3" style={{ flexShrink: 0 }}>
                                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                                 <div className="me-auto">
                                                                      <div className="fw-bold text-success lh-1" style={{ fontSize: "1.6rem" }}>
                                                                           {money(totalReady)}
                                                                      </div>
                                                                      <div className="d-flex gap-2 mt-1">
                                                                           {totalWaiveOff > 0 && <span className="badge bg-warning text-dark" style={{ fontSize: '0.75rem' }}>Waive-off: ₵{totalWaiveOff.toFixed(2)}</span>}
                                                                      </div>
                                                                      <small className="text-muted">{stagedEntries.length} service(s) ready</small>
                                                                 </div>

                                                                 <div style={{ maxWidth: 380 }}>
                                                                      <div className="d-flex flex-wrap gap-1" role="radiogroup" aria-label="Payment method">
                                                                           {paymentModes.map(m => (
                                                                                <button
                                                                                     key={m.KeyID}
                                                                                     type="button"
                                                                                     role="radio"
                                                                                     aria-checked={globalPaymentMode === m.KeyID}
                                                                                     className={`btn btn-sm ${globalPaymentMode === m.KeyID ? 'btn-success' : 'btn-outline-secondary'}`}
                                                                                     onClick={() => setGlobalPaymentMode(m.KeyID)}
                                                                                >
                                                                                     {m.PaymentMode}
                                                                                </button>
                                                                           ))}
                                                                      </div>
                                                                      {!globalPaymentMode && (
                                                                           <small className="text-warning fw-medium d-block mt-1" style={{ fontSize: '0.72rem' }}>
                                                                                Select a payment method to proceed
                                                                           </small>
                                                                      )}
                                                                 </div>

                                                                 {isCashMode && (
                                                                      <div style={{ width: 170 }}>
                                                                           <input
                                                                                type="number"
                                                                                min={0}
                                                                                step="0.01"
                                                                                className="form-control form-control-sm"
                                                                                placeholder="Cash received"
                                                                                aria-label="Cash received"
                                                                                value={tendered}
                                                                                onChange={e => setTendered(e.target.value)}
                                                                           />
                                                                           {changeDue !== null && (
                                                                                <small className={`d-block fw-semibold ${changeDue < 0 ? 'text-danger' : 'text-success'}`}>
                                                                                     {changeDue < 0 ? `Short by ${money(-changeDue)}` : `Change: ${money(changeDue)}`}
                                                                                </small>
                                                                           )}
                                                                      </div>
                                                                 )}

                                                                 <button className="btn btn-sm btn-outline-secondary" onClick={() => { setStagedData({}); setGlobalWaiveOff(''); setTendered(''); }}>
                                                                      Clear
                                                                 </button>
                                                                 <button
                                                                      className="btn btn-success px-4"
                                                                      onClick={handleSubmit}
                                                                      disabled={!canSubmit || isLoading}
                                                                      title={!globalPaymentMode ? 'Select a payment method first' : hasErrors ? 'Fix amount errors first' : ''}
                                                                 >
                                                                      {isLoading
                                                                           ? <><span className="spinner-border spinner-border-sm me-1" />Processing…</>
                                                                           : '✓ Collect Payment'}
                                                                 </button>
                                                            </div>
                                                       </div>
                                                       
                                                  )}
                                       </>   
                                        ) : (
                                             <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5">
                                                  <div style={{ fontSize: '3rem', opacity: 0.2 }}>📋</div>
                                                  <p className="text-muted small mt-2 mb-0">Select a billing record from the left to view its services</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>

     );
}
