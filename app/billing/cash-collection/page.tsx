"use client";
import React, { useState, useEffect, useRef } from 'react';
import { allocateWaiver } from '../../../lib/billing/allocateWaiver';
import styles from './CashCollection.module.css';
import {RiPrinterLine} from '@remixicon/react';
import Link from 'next/link';
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import { customFetch, customPost, fetchPatientPersonalInfo } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import { plsDecryption, plsEncryption } from '../../../lib/encryption';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import { fetchSaleClosures } from '../../../lib/billing/financialControls';
import { requiresNhisWorkspace } from '../../../lib/accounting/nhis';

interface ServiceDetail {
     totalpayable: string; totalcost: string; serviceid: number; service_name: string;
     paymentstatus: string; paidamount: string; outstanding: string; discount: string;
     amountIncurredDueTax: string; isRefunded: boolean; amountRefunded: number;
}
interface BillingRecord {
     source?: number | string; billingsource?: number | string; billingSource?: number | string;
     entityType?: string; partyType?: string; classification?: string;
     closed_status?: "OPEN" | "CLOSED";
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
interface BulkOutstandingResponse { success: boolean; message?: string; data: { outstandingAmount: string; records: BillingRecord[] }; }
interface PaymentMode { KeyID: number; PaymentMode: string; }
interface StagedService { payment: string; waiveOff: string; error: boolean; }
interface OutstandingRow {
     closed_status?: "OPEN" | "CLOSED";
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

export default function CashCollection() {
     const paymentAttempt = useRef<{ fingerprint: string; key: string } | null>(null);
     const searchGeneration = useRef(0);
     const [searchError, setSearchError] = useState('');
     const [nhisExcluded, setNhisExcluded] = useState(0);
     const [listError, setListError] = useState('');
     const [searchPatientId, setSearchPatientId]       = useState<string>('');
     const [cashierCode, setCashierCode] = useState('');
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
               setListError('');
               setOutstandingList(null);
               try {
                    let url = `billing/client/outstanding-list?page=${listPage}&count=25`;
                    if (listRange.start && listRange.end) url += `&startDate=${listRange.start}&endDate=${listRange.end}`;
                    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
                    const r: any = await customFetch(url);
                    if (!r?.success || !r.data) throw new Error(r?.message || 'Could not load outstanding bills');
                    const records: OutstandingRow[] = r.data.records;
                    const closures = await fetchSaleClosures(records.map(row => Number(row.billingid)));
                    if (!cancelled) setOutstandingList({ ...r.data, records: records.map(row => ({ ...row, closed_status: closures.get(Number(row.billingid))?.closed_status })) });
               } catch (error) {
                    if (!cancelled) setListError(error instanceof Error ? error.message : 'Could not load outstanding bills');
               } finally {
                    if (!cancelled) setListLoading(false);
               }
          })();
          return () => { cancelled = true; };
     }, [hasSearched, listRange, debouncedSearch, listPage, listReload]);

     const collectFor = (row: OutstandingRow) => {
          if (row.closed_status !== "OPEN") { toast.error("This sale is closed or unverified. Historical financial changes are unavailable."); return; }
          preselectBilling.current = row.billingid;
          setSearchPatientId(String(row.patientid));
          setSearchBillingId('');
          doSearch(String(row.patientid), '');
     };

     const backToList = () => {
          searchGeneration.current++;
          setSearchError('');
          setNhisExcluded(0);
          setIsLoading(false);
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
          let pId = pid !== undefined ? pid : searchPatientId;
          let bId = bid !== undefined ? bid : searchBillingId;
          let searchStatus = statusFilter;
          let cashierLookup = false;
          
          if (!pId.trim() && !bId.trim()) return;
          const generation = ++searchGeneration.current;
          setSearchError('');
          setBillingRecords([]);
          setSelectedBillingId(null);
          setPatientInfo(null);
          setPatientId(null);
          setStagedData({});
          setGlobalWaiveOff('');
          
          setIsLoading(true);
          setHasSearched(true);
          if (/^[A-Za-z][A-Za-z2-9]{3}$/.test(bId.trim())) {
               cashierLookup = true;
               setBillingRecords([]); setSelectedBillingId(null); setPatientInfo(null); setPatientId(null);
               setStagedData({}); setGlobalPaymentMode(''); setTendered(''); setPaidBills([]);
               try {
                    const match: any = await customFetch(`billing/lab-counter/lookup?code=${encodeURIComponent(bId.trim())}`);
                    if (generation !== searchGeneration.current) return;
                    if (match?.status !== true || !match.data) throw new Error(match?.message || 'Cashier code not found');
                    bId = String(match.data.billingid); pId = String(match.data.patientid); searchStatus = 'all';
                    setSearchBillingId(bId); setSearchPatientId(pId); setStatusFilter('all');
               } catch (error) { if (generation === searchGeneration.current) { setSearchError(error instanceof Error ? error.message : 'Unable to find this cashier code'); setIsLoading(false); } return; }
          }

          try {
               let url = `billing/client/bulk/outstanding?${new URLSearchParams({status: searchStatus})}`;
               if (pId.trim()) url += `&patientid=${encodeURIComponent(pId)}`;
               if (bId.trim()) url += `&billingid=${encodeURIComponent(bId)}`;
               
               const response = await customFetch(url) as BulkOutstandingResponse;
               if (generation !== searchGeneration.current) return;
               const records = response?.data?.records;
               const nhisCount = Array.isArray(records) ? records.filter(requiresNhisWorkspace).length : 0;
               setNhisExcluded(nhisCount);
               const r = response?.data && Array.isArray(records) ? { ...response, data: { ...response.data, records: records.filter(record => !requiresNhisWorkspace(record)) } } : response;
               if (!r?.success || !Array.isArray(r.data?.records)) throw new Error(r?.message || 'Outstanding bills could not be loaded. No balance has been verified.');
               
               if (r?.success && r?.data?.records?.length > 0) {
                    const closures = await fetchSaleClosures(r.data.records.map(row => Number(row.billingid)));
                    if (generation !== searchGeneration.current) return;
                    setBillingRecords(r.data.records.map(row => ({ ...row, closed_status: closures.get(Number(row.billingid))?.closed_status })));
                    if (cashierLookup) setPaidBills(r.data.records.filter(rec => Number(rec.paid) > 0).map(rec => rec.billingid));
                    
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
                    
                    if (actualPatientId) {
                         setPatientId(actualPatientId);
                         setPatientInfo(null);
                         try {
                              const info = await fetchPatientPersonalInfo(actualPatientId) as any;
                              if (generation !== searchGeneration.current) return;
                              if (!info?.result) throw new Error('Patient information is unavailable');
                              setPatientInfo(info.result);
                         } catch { if (generation === searchGeneration.current) toast.error('Bills loaded, but patient information is unavailable. Verify the patient before collecting.'); }
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
          } catch (error) {
               if (generation !== searchGeneration.current) return;
               setSearchError(error instanceof Error ? error.message : 'Outstanding bills could not be loaded. No balance has been verified.');
               setBillingRecords([]); 
               if (pId.trim()) setPatientId(pId);
               if (bId.trim()) setSelectedBillingId(bId);
               setStagedData({});
               setGlobalWaiveOff('');
          } finally { 
               if (generation === searchGeneration.current) setIsLoading(false);
          }
     };

     const payAllOutstanding = () => {
          const newData: { [key: number]: StagedService } = {};
          billingRecords.filter(r => r.closed_status === "OPEN").forEach(r => r.serviceDetails.forEach(s => {
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
          if (record.closed_status !== "OPEN") { toast.error("This sale is closed or unverified."); return; }
          
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

          const outstandingServices = billingRecords.filter(r => r.closed_status === "OPEN").flatMap(r =>
               r.serviceDetails.filter(s => s.paymentstatus !== 'paid' && (parseFloat(s.totalpayable) - parseFloat(s.paidamount)) > 0)
          );
          
          const totalOutstanding = outstandingServices.reduce((sum, s) => sum + (parseFloat(s.totalpayable) - parseFloat(s.paidamount)), 0);
          if (totalOutstanding === 0) return;

          const balances = outstandingServices.map(s => Math.max(0, Math.round(parseFloat(s.totalpayable) * 100) - Math.round(parseFloat(s.paidamount) * 100)));
          const allocations = allocateWaiver(balances, Math.round(totalWaive * 100));
          setStagedData(prev => {
               const newData = { ...prev };
               outstandingServices.forEach((s, index) => {
                    const bal = balances[index] / 100;
                    const serviceWaive = allocations[index] / 100;
                    
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
          if (!billingRecords.some(record => record.closed_status === "OPEN" && record.serviceDetails.some(service => service.serviceid === serviceId))) {
               toast.error("This sale is closed or unverified. Its historical amounts cannot be changed.");
               return;
          }
          setStagedData(prev => {
               const current = prev[serviceId] || { payment: '', waiveOff: '', error: false };
               let updated = { ...current, [type]: value };
               
               let p = parseFloat(updated.payment || '0');
               let w = parseFloat(updated.waiveOff || '0');
               
               const safeP = isNaN(p) ? 0 : p;
               const safeW = isNaN(w) ? 0 : w;

               if (type !== 'payment' && (Math.round(safeP * 100) + Math.round(safeW * 100)) > Math.round(balance * 100)) {
                    const remaining = Math.max(0, balance - safeW);
                    updated.payment = remaining > 0 ? remaining.toFixed(2) : '';
                    p = remaining;
               }
               
               const finalTotal = (isNaN(p) ? 0 : p) + safeW;
               updated.error = !Number.isFinite(p) || !Number.isFinite(w) || !/^\d*(?:\.\d{0,2})?$/.test(updated.payment) || !/^\d*(?:\.\d{0,2})?$/.test(updated.waiveOff) || safeP < 0 || safeW < 0 || Math.round(finalTotal * 100) > Math.round(balance * 100);
               
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
          return s + (isNaN(val) ? 0 : Math.round(val * 100));
     }, 0) / 100;
     const totalWaiveOff  = stagedEntries.reduce((s, [_, v]) => {
          const val = parseFloat(v.waiveOff);
          return s + (isNaN(val) ? 0 : Math.round(val * 100));
     }, 0) / 100;
     
     const hasErrors      = stagedEntries.some(([_, v]) => v.error);
     const canSubmit      = stagedEntries.length > 0 && !!globalPaymentMode && !hasErrors;

     const getStagedForBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return 0;
          return record.serviceDetails.reduce((s, svc) => s + parseFloat(stagedData[svc.serviceid]?.payment || '0'), 0);
     };

     const handleSubmit = async () => {
          if (!canSubmit) return;
          if (stagedEntries.some(([serviceId]) => !billingRecords.some(record => record.closed_status === "OPEN" && record.serviceDetails.some(service => service.serviceid === Number(serviceId))))) {
               toast.error("A staged sale is closed or unverified. Reload its current status before collecting.");
               return;
          }
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

          const fingerprint = JSON.stringify({ employeeid, allPayments });
          if (paymentAttempt.current?.fingerprint !== fingerprint) {
               let saved: { fingerprint: string; key: string } | null = null;
               try { saved = JSON.parse(sessionStorage.getItem('cash-collection-payment-attempt') || 'null'); } catch { /* Storage may be unavailable. */ }
               paymentAttempt.current = saved?.fingerprint === fingerprint && typeof saved.key === 'string' ? saved : { fingerprint, key: crypto.randomUUID() };
               try { sessionStorage.setItem('cash-collection-payment-attempt', JSON.stringify(paymentAttempt.current)); } catch { /* In-memory retries remain safe. */ }
          }
          setIsLoading(true);
          try {
               const r = await customPost('billing/multi-service/payment', 'POST', {
                    request_key: paymentAttempt.current.key,
                    service_payments: allPayments, employeeid,
                    total_amount: totalReady,
                    total_waive_off: totalWaiveOff,
                    description: `Cash collection for ${stagedEntries.length} service(s). Waive-off: ${totalWaiveOff.toFixed(2)}`
               });
               if (r?.success == true) {
                    paymentAttempt.current = null;
                    try { sessionStorage.removeItem('cash-collection-payment-attempt'); } catch { /* Storage may be unavailable. */ }
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
          <main className={styles.workspace}>
          <header className={styles.header}><div><span className={styles.eyebrow}>PAYMENTS & RECEIPTS</span><h1>Cash Collection</h1><p>Find a patient bill, review the balance, then collect payment and print the receipt.</p></div><div className="d-flex flex-wrap gap-2"><Link href="/accounting/nhis" className="btn btn-outline-primary">NHIS remittances</Link><Link href="/billing/receipts" className="btn btn-outline-secondary">Receipt history</Link></div></header>
          {nhisExcluded > 0 && <div className="alert alert-warning" role="alert">{nhisExcluded} NHIS / mixed bill(s) excluded from patient cash collection. <Link href="/accounting/nhis">Use the NHIS workspace for remittances; mixed bills require review.</Link></div>}
          <form className={styles.searchBar} aria-label="Find a bill" onSubmit={event=>{event.preventDefault();void(cashierCode.trim()?doSearch('',cashierCode):doSearch());}}>
               <label htmlFor="lab-cashier-code">Cashier code<input id="lab-cashier-code" className="form-control" value={cashierCode} onChange={event=>{setCashierCode(event.target.value.toUpperCase());setSearchBillingId('');setSearchPatientId('');}} maxLength={4} placeholder="e.g. DC29" autoComplete="off"/></label>
               <label htmlFor="collection-patient">Patient ID<input id="collection-patient" className="form-control" value={searchPatientId} onChange={event=>{setSearchPatientId(event.target.value);setCashierCode('');}} placeholder="Patient ID"/></label>
               <label htmlFor="collection-bill">Bill ID<input id="collection-bill" className="form-control" value={searchBillingId} onChange={event=>{setSearchBillingId(event.target.value);setCashierCode('');}} placeholder="Bill ID"/></label>
               <label htmlFor="collection-status">Payment status<select id="collection-status" className="form-select" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="all">All</option><option value="pending">Pending</option><option value="completed">Completed</option></select></label>
               <button className="btn btn-primary" type="submit" disabled={isLoading||(!cashierCode.trim()&&!searchPatientId.trim()&&!searchBillingId.trim())}>{isLoading?'Finding bill…':'Find bill'}</button>
          </form>
          {!hasSearched && listError && <div role="alert" className="alert alert-danger">{listError}<button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => setListReload(n => n + 1)}>Retry outstanding bills</button></div>}
          <ol className={styles.steps}><li><span>1</span> Find the patient’s bill</li><li><span>2</span> Review services and amounts</li><li><span>3</span> Collect payment & print</li></ol>
          <div>
               <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-4">
                         

                    </div>
               </div>

               <div className="card shadow-sm" style={{ fontSize: 'inherit' }}>

                    <div className="card-header bg-white border-bottom py-2 px-3">
                         {patientInfo && (
                              <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                                   <div className="d-flex align-items-center gap-2 rounded-circle bg-primary-subtle text-primary fw-bold justify-content-center" style={{ width: 36, height: 36 }}>
                                        {String(patientInfo?.fullname ?? patientInfo?.firstname ?? '?').trim().charAt(0).toUpperCase()}
                                   </div>
                                   <div className={styles.patientSummary}><strong>{patientInfo.fullname || [patientInfo.firstname,patientInfo.middlename,patientInfo.lastname].filter(Boolean).join(' ')}</strong><div className={styles.patientMeta}><span>Patient ID: {patientInfo.fullpatientid || patientInfo.patientid || patientId}</span>{patientInfo.gender&&<span>{patientInfo.gender}</span>}{patientInfo.age&&<span>{patientInfo.age} {patientInfo.ageType || patientInfo.agetype || ''}</span>}{patientInfo.mobile_number&&<span>{patientInfo.mobile_number}</span>}{patientInfo.email&&<span>{patientInfo.email}</span>}</div></div>
                                   <div className="d-flex gap-2 ms-auto">
                                        
                                        {selectedBillingId && <span className={styles.billBadge}>Bill #{selectedBillingId}</span>}
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
                         <section className={styles.summary} aria-labelledby="collection-summary-heading">
                              <div className={styles.summaryHeading}><h2 id="collection-summary-heading">Payment overview</h2><span>Across {billingRecords.length} loaded {billingRecords.length===1?'bill':'bills'}</span></div>
                              <dl className={styles.summaryGrid}>
                                   <div className={styles.balanceCard}><dt>Current balance</dt><dd className={styles.summaryValue} data-long={money(totalOutstanding).length>12}>{money(totalOutstanding)}</dd><dd className={styles.summaryHelp}>Outstanding before this payment</dd></div>
                                   <div className={styles.collectCard} data-error={hasErrors}><dt>Collecting now <span className={styles.previewBadge}>Not yet recorded</span></dt><dd className={styles.summaryValue} data-long={money(totalReady).length>12}>{money(totalReady)}</dd><dd className={styles.summaryHelp}>{hasErrors?'Check the entered amounts':totalReady>0?`${stagedEntries.length} ${stagedEntries.length===1?'service':'services'} entered`:'Enter an amount in the services below'}</dd></div>
                                   <div className={styles.remainingCard}><dt>Remaining after payment</dt><dd className={styles.summaryValue} data-long={money(remainingAfter).length>12}>{money(remainingAfter)}</dd><dd className={styles.summaryHelp}>{totalOutstanding===0?'No outstanding balance':remainingAfter===0?'No balance after this entry':totalWaiveOff>0?'Includes the entered waive-off':'Balance left after the entered payment'}</dd></div>
                              </dl>
                              <div className={styles.summaryFooter}><div className={styles.summaryMeta}><span>Already paid <strong>{money(totalPaidSoFar)}</strong></span>{totalWaiveOff>0&&<span className={styles.waiverChip}>Waive-off entered <strong>{money(totalWaiveOff)}</strong></span>}</div><span className={styles.summaryHint}>Confirm with Collect Payment below.</span></div>
                         </section>
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
                                   <section className={styles.directoryOverview} aria-labelledby="outstanding-overview-heading">
                                        <div className={styles.summaryHeading}><h2 id="outstanding-overview-heading">Outstanding overview</h2><span>Across the current filters</span></div>
                                        <dl className={styles.directoryTotals}>
                                             <div className={styles.overviewTotal}><dt>Amount outstanding</dt><dd data-long={money(outstandingList.summary.totalOutstanding).length>12}>{money(outstandingList.summary.totalOutstanding)}</dd></div>
                                             <div><dt>Patients with a balance</dt><dd>{outstandingList.summary.patients.toLocaleString()}</dd></div>
                                             <div><dt>Unsettled bills</dt><dd>{outstandingList.summary.bills.toLocaleString()}</dd></div>
                                             <div><dt>Already paid on these bills</dt><dd>{money(outstandingList.summary.totalPaid)}</dd></div>
                                        </dl>
                                   </section>
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
                                                                 <button className="btn btn-sm btn-success" disabled={r.closed_status !== "OPEN"} onClick={e => { e.stopPropagation(); collectFor(r); }}>{r.closed_status === "CLOSED" ? "Closed" : "Collect"}</button>
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
                         ) : searchError ? (
                              <div role="alert" className="alert alert-danger m-3">{searchError}<button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => void doSearch()}>Retry bill search</button></div>
                         ) : billingRecords.length === 0 ? (
                              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 320 }}>
                                   <div style={{ fontSize: '3.5rem', opacity: 0.2 }}>📭</div>
                                   <h6 className="text-muted mt-3 mb-1">No billing records found</h6>
                                   <p className="text-muted small mb-0">This patient has no outstanding billing records matching the selected filter</p>
                              </div>
                         ) : (
                              <div className={styles.collectionGrid}>

                                   <aside className={styles.billList} aria-label="Patient bills">
                                        <div className="p-2">
                                             <div className="mb-2">
                                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                                       <span className="text-uppercase fw-semibold text-body-secondary" style={{ fontSize: 'inherit', letterSpacing: '0.6px' }}>
                                                            Open bills <span className="text-body-tertiary">({billingRecords.length})</span>
                                                       </span>
                                                       <button className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold" style={{ fontSize: 'inherit' }} onClick={payAllOutstanding}>
                                                            Use all balances
                                                       </button>
                                                  </div>
                                                  <div className="input-group input-group-sm">
                                                       <span className="input-group-text bg-white text-body-secondary" style={{ fontSize: 'inherit' }}>Waive-off all</span>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            placeholder="0.00"
                                                                                                    aria-label="Total waive-off"
                                                            value={globalWaiveOff}
                                                            onChange={e => applyGlobalWaiveOff(e.target.value)}
                                                            style={{ fontSize: 'inherit', textAlign: 'right' }}
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
                                                                 {record.closed_status === "CLOSED" && <span className="text-secondary fw-semibold">Closed - read-only</span>}
                                                                 <span className={`fw-bold text-${outstanding > 0 ? 'danger' : 'secondary'}`} style={{ fontVariantNumeric: 'tabular-nums', textDecoration: hasAdjustment ? 'line-through' : 'none', opacity: hasAdjustment ? 0.6 : 1 }}>
                                                                      ₵{outstanding.toFixed(2)}
                                                                 </span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center text-body-secondary" style={{ fontSize: 'inherit' }}>
                                                                 <span>
                                                                      {new Date(record.billedon).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                                      <span className={`ms-2 text-${statusTone}-emphasis fw-semibold`}>{status}</span>
                                                                 </span>
                                                                 <span style={{ fontVariantNumeric: 'tabular-nums' }}>Paid ₵{parseFloat(record.paid).toFixed(2)}</span>
                                                            </div>
                                                            {(hasAdjustment || staged > 0 || record.isAdjustment === 1) && (
                                                                 <div className="d-flex flex-wrap gap-1 mt-1">
                                                                      {record.isAdjustment === 1 && <span className="badge bg-warning text-dark" style={{ fontSize: 'inherit' }}>ADJ</span>}
                                                                      {hasAdjustment && <span className="badge bg-primary-subtle text-primary" style={{ fontSize: 'inherit' }}>Net ₵{netOutstanding.toFixed(2)}</span>}
                                                                      {staged > 0 && <span className="badge bg-success" style={{ fontSize: 'inherit' }}>₵{staged.toFixed(2)} entered</span>}
                                                                 </div>
                                                            )}
                                                            {((netOutstanding > 0 && isSelected) || Number(record.paid) > 0) && <div className={styles.billActions}>
                                                                 {netOutstanding > 0 && isSelected && <button type="button" className="btn btn-primary" disabled={record.closed_status !== "OPEN"} onClick={event=>{event.stopPropagation();payBillingRecord(record.billingid);}}>Use full balance</button>}
                                                                 {Number(record.paid)>0 && <Link className="btn btn-outline-secondary" href={`/billing/cash-collection/pos-receipt-test?billingid=${record.billingid}&is_pos=true`} target="_blank" rel="noopener noreferrer" prefetch={false} aria-label={`Reprint receipt for bill ${record.billingid}`} onClick={event=>event.stopPropagation()}><RiPrinterLine size={16} aria-hidden="true"/>Reprint receipt</Link>}
                                                            </div>}
                                                       </div>
                                                  );
                                             })}
                                        </div>
                                   </aside>

                                   <div className={styles.detailPanel}>

                                        {selectedRecord ? (
                                             <>
                                                  <div className={styles.serviceArea}>
                                                       <div className="p-3">
                                                            <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                                                 <div>
                                                                      <h5 className="mb-0 fw-bold fs-6">Services</h5>
                                                                      <span className="text-muted" style={{ fontSize: 'inherit' }}>Billing #{selectedRecord.billingid}</span>
                                                                 </div>
                                                                 <div className="d-flex align-items-center gap-3">
                                                                      <div className="form-check form-switch mb-0">
                                                                           <input className="form-check-input" type="checkbox" role="switch" id="hide-paid" checked={hidePaid} onChange={e => setHidePaid(e.target.checked)} />
                                                                           <label className="form-check-label small text-muted" htmlFor="hide-paid">Hide fully paid</label>
                                                                      </div>
                                                                      <span className="badge bg-secondary" style={{ fontSize: 'inherit' }}>{selectedRecord.serviceDetails.length} service(s)</span>
                                                                 </div>
                                                            </div>

                                                            {selectedRecord.adjustmentReason && (
                                                                 <div className="border-start border-3 border-warning bg-body-tertiary py-1 px-3 mb-2 small text-body-secondary">
                                                                      <span className="fw-semibold">Adjustment:</span> {selectedRecord.adjustmentReason}
                                                                 </div>
                                                            )}

                                                            <table className="table table-hover align-middle mb-0" style={{ fontSize: 'inherit', fontVariantNumeric: 'tabular-nums' }}>
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
                                                                                          {isPaid && <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: 'inherit' }}>PAID</span>}
                                                                                          {!isPaid && (staged > 0 || waive > 0) && !hasError && <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: 'inherit' }}>ENTERED</span>}
                                                                                     </td>
                                                                                     <td className="text-end">₵{payable.toFixed(2)}</td>
                                                                                     <td className="text-end text-success fw-medium">₵{paid.toFixed(2)}</td>
                                                                                     <td className="text-end">
                                                                                          <div className={`fw-bold ${balance > 0 ? 'text-danger' : 'text-muted'}`} style={{ fontSize: 'inherit', textDecoration: (waive > 0) ? 'line-through' : 'none', opacity: (waive > 0) ? 0.6 : 1 }}>₵{balance.toFixed(2)}</div>
                                                                                          {!isPaid && (waive > 0) && (
                                                                                               <div className="text-primary fw-bold" style={{ fontSize: 'inherit' }}>
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
                                                                                                    aria-label={`Waive-off for ${service.service_name}`} value={stagedSvc.waiveOff}
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
                                                                                                              style={{ width: 110, fontSize: 'inherit' }}
                                                                                                              placeholder="0.00"
                                                                                                              min={0}
                                                                                                              max={balance}
                                                                                                              step="0.01"
                                                                                                              aria-label={`Amount for ${service.service_name}`} value={stagedSvc.payment}
                                                                                                              onChange={e => handleValueChange(service.serviceid, 'payment', e.target.value, balance)}
                                                                                                         />
                                                                                                         <button
                                                                                                              className="btn btn-outline-primary"
                                                                                                              style={{ fontSize: 'inherit', whiteSpace: 'nowrap' }}
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
                                                                                                              Use balance
                                                                                                         </button>
                                                                                                    </div>
                                                                                                    {hasError && (
                                                                                                         <div className="text-danger mt-1" style={{ fontSize: 'inherit' }}>
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
                                                       <div className={styles.paymentDock}>
                                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                                 <div className="me-auto">
                                                                      <div className="fw-bold text-success lh-1" style={{ fontSize: "1.6rem" }}>
                                                                           {money(totalReady)}
                                                                      </div>
                                                                      <div className="d-flex gap-2 mt-1">
                                                                           {totalWaiveOff > 0 && <span className="badge bg-warning text-dark" style={{ fontSize: 'inherit' }}>Waive-off: ₵{totalWaiveOff.toFixed(2)}</span>}
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
                                                                           <small className="text-warning fw-medium d-block mt-1" style={{ fontSize: 'inherit' }}>
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

     </main>
     );
}
