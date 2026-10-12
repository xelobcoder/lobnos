"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { RiMoneyDollarCircleLine, RiServiceLine, RiFileList3Line } from "@remixicon/react";
import { customFetch, customPost, currencyFormatter } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import { ErrorState, LoadingState, PeriodFilter, SummaryMetric, TableCell } from "../ClinicianUi";
import CommissionLineChart from "../CommissionLineChart";
import CommissionDetailsModal from "./components/CommissionDetailsModal";
import styles from "../CommissionReport.module.css";

interface CommissionData {
    service_date: string;
    clinician_id: number;
    clinician_name: string;
    clinician_phone: string;
    occupation: string | null;
    organization: number | null;
    total_services: number;
    earned_revenue?: string;
    cash_collected?: string;
    total_payable?: string;
    total_paid?: string;
    serviceid: number;
    commission_earned: string;
}
interface ClinicianInfo { clinician_name?: string; name?: string; clinician_phone?: string; phone?: string; occupation?: string | null }
interface CommissionPayment {
    id: number; batch_payment_id: number; serviceid: number; commission_due: string;
    amount_allocated: string; waived_amount: string; status: string; created_at: string;
    commission_percentage: string; type: string; recipient_id: number;
}

export default function ClinicianCommissionPage({ params }: { params: { clinicianid: string } }) {
    const employeeid = useApplication()?.user?.employeeid;
    const branchid = useApplication()?.branchid;
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [reloadKey, setReloadKey] = useState(0);
    const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
    const [clinicianInfo, setClinicianInfo] = useState<ClinicianInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
    const [selectedRecord, setSelectedRecord] = useState<CommissionData | null>(null);
    const [commissionPayments, setCommissionPayments] = useState<CommissionPayment[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [paymentModes, setPaymentModes] = useState<{ KeyID: number; PaymentMode: string }[]>([]);
    const [paymentModesError, setPaymentModesError] = useState<string | null>(null);
    const [showBulkPayModal, setShowBulkPayModal] = useState(false);
    const [bulkPayAmount, setBulkPayAmount] = useState("");
    const [bulkPayMethod, setBulkPayMethod] = useState<number | null>(null);
    const [bulkPayLoading, setBulkPayLoading] = useState(false);
    const [bulkPayError, setBulkPayError] = useState<string | null>(null);
    const submittingRef = useRef(false);
    const historyRequest = useRef(0);

    useEffect(() => {
        let active = true;
        setLoading(true); setError(null); setSelectedRecords(new Set());
        setCommissionData([]); setClinicianInfo(null);
        customFetch(`clinician/anal/commissions/range/single?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&clinicianId=${encodeURIComponent(params.clinicianid)}`)
            .then(async response => {
                if (!response?.success || !Array.isArray(response.data)) throw new Error("Unable to load clinician commissions.");
                if (!active) return;
                setCommissionData(response.data);
                if (!response.data.length) {
                    const lookup = await customFetch(`clinicians/getclinician?id=${encodeURIComponent(params.clinicianid)}`);
                    if (active) setClinicianInfo(Array.isArray(lookup?.result) ? lookup.result[0] || null : null);
                }
            }).catch((err: Error) => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [params.clinicianid, startDate, endDate, reloadKey]);

    const loadPaymentModes = useCallback(async () => {
        setPaymentModesError(null);
        try {
            const response = await customFetch("paymentmodes");
            if (!(response?.status === true || response?.status === "success") || !Array.isArray(response.data) || !response.data.length) throw new Error("Payment methods are unavailable. Reload methods before paying.");
            setPaymentModes(response.data);
        } catch (err) {
            setPaymentModes([]);
            setPaymentModesError(err instanceof Error ? err.message : "Unable to load payment methods.");
        }
    }, []);
    useEffect(() => { loadPaymentModes(); }, [loadPaymentModes]);

    const handleViewDetails = useCallback(async (record: CommissionData) => {
        const id = ++historyRequest.current;
        setSelectedRecord(record); setCommissionPayments([]); setDetailsError(null);
        setDetailsLoading(true); setShowDetailsModal(true);
        try {
            const response = await customFetch(`commission-payments/service/${record.serviceid}/commission/payment/history`);
            if (!(response?.status === true || response?.status === "success") || !Array.isArray(response.data)) throw new Error("Unable to load commission payment history.");
            if (id === historyRequest.current) setCommissionPayments(response.data);
        } catch (err) {
            if (id === historyRequest.current) setDetailsError(err instanceof Error ? err.message : "Unable to load payment history.");
        } finally { if (id === historyRequest.current) setDetailsLoading(false); }
    }, []);

    const selectedCommissionDue = Array.from(selectedRecords).reduce((sum, index) => sum + Number(commissionData[index]?.commission_earned || 0), 0);
    const handleBulkPay = async () => {
        if (submittingRef.current) return;
        const amount = Number(bulkPayAmount);
        if (!bulkPayAmount || !Number.isFinite(amount) || amount < 0 || amount > selectedCommissionDue) {
            setBulkPayError("Enter an amount from zero up to the selected commission due."); return;
        }
        if (!bulkPayMethod || !paymentModes.some(mode => mode.KeyID === bulkPayMethod) || !selectedRecords.size) {
            setBulkPayError("Select records and an available payment method."); return;
        }
        submittingRef.current = true;
        setBulkPayLoading(true); setBulkPayError(null);
        try {
            const payload = {
                startDate, endDate, commissionDue: selectedCommissionDue, amountPaid: amount,
                commissionType: "paid", paymentMethod: bulkPayMethod, employeeid,
                recipient_type: "clinician", branchid, recipientid: params.clinicianid,
                services: Array.from(selectedRecords).map(index => commissionData[index].serviceid),
            };
            const response = await customPost("commission-payments/commission/batch/process-services?employeeid=" + employeeid + "&branchid=" + branchid, "POST", payload);
            if (response?.status !== true) throw new Error(response?.message || "Failed to process payment.");
            setShowBulkPayModal(false); setBulkPayAmount(""); setBulkPayMethod(null); setSelectedRecords(new Set());
            setReloadKey(key => key + 1);
            toast.success("Commission payment processed successfully!");
        } catch (err) {
            setBulkPayError(err instanceof Error ? err.message : "Failed to process payment.");
        } finally { submittingRef.current = false; setBulkPayLoading(false); }
    };

    const columns = useMemo(() => [
        { id: "selection", disableSortBy: true, Header: () => (
            <input type="checkbox" className="form-check-input" aria-label="Select all returned commission records" checked={!!commissionData.length && selectedRecords.size === commissionData.length} disabled={loading} onChange={() => setSelectedRecords(selectedRecords.size === commissionData.length ? new Set() : new Set(commissionData.map((_, index) => index)))} />
        ), Cell: ({ row }: TableCell<CommissionData>) => (
            <input type="checkbox" className="form-check-input" aria-label={`Select service ${row.original.serviceid} on ${dayjs(row.original.service_date).format("DD/MM/YYYY")}`} checked={selectedRecords.has(row.index)} disabled={loading} onChange={() => setSelectedRecords(previous => {
                const next = new Set(previous); if (next.has(row.index)) next.delete(row.index); else next.add(row.index); return next;
            })} />
        ) },
        { Header: "Service date", accessor: "service_date", Cell: ({ value }: TableCell<CommissionData>) => dayjs(value).format("DD/MM/YYYY") },
        { Header: "Services", accessor: "total_services", Cell: ({ value }: TableCell<CommissionData, number>) => value.toLocaleString() },
        { Header: "Total payable", id: "total_payable", accessor: (row: CommissionData) => Number(row.earned_revenue ?? row.total_payable ?? 0), Cell: ({ value }: TableCell<CommissionData, number>) => currencyFormatter.format(value) },
        { Header: "Commission earned", accessor: "commission_earned", Cell: ({ value }: TableCell<CommissionData>) => currencyFormatter.format(Number(value)) },
        { Header: "Payment", id: "payment", disableSortBy: true, Cell: ({ row }: TableCell<CommissionData>) => <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleViewDetails(row.original)}>View Details</button> },
    ], [commissionData, selectedRecords, loading, handleViewDetails]);

    const known = !loading && !error;
    const name = commissionData[0]?.clinician_name || clinicianInfo?.clinician_name || clinicianInfo?.name || `Clinician ${params.clinicianid}`;
    return (
        <div className={styles.container} aria-busy={loading}>
            <header className="mb-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <h1 className={styles.title}>{name} — commissions</h1>
                    <div className="d-flex flex-wrap gap-2">
                        <Link href={`/commissions/clinicians/commissions-information/${params.clinicianid}/commission-update`} className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">Update Commission Records</Link>
                        <Link href={`/commissions/clinicians/commissions-information/${params.clinicianid}/paid-commissions`} className="btn btn-outline-success btn-sm" target="_blank" rel="noopener noreferrer">View Paid Commissions</Link>
                    </div>
                </div>
                <p className="small text-muted mb-0">Phone: {commissionData[0]?.clinician_phone || clinicianInfo?.clinician_phone || clinicianInfo?.phone || "N/A"} · Occupation: {commissionData[0]?.occupation || clinicianInfo?.occupation || "N/A"}</p>
            </header>
            {error && <ErrorState message={error} onRetry={() => setReloadKey(key => key + 1)} />}
            <div className="row g-3 mb-3">
                <div className="col-12 col-md-4"><SummaryMetric title="Commission earned" value={known ? currencyFormatter.format(commissionData.reduce((sum, row) => sum + Number(row.commission_earned), 0)) : "—"} subtitle="Due in returned records" Icon={RiMoneyDollarCircleLine} variant="success" /></div>
                <div className="col-12 col-md-4"><SummaryMetric title="Service value" value={known ? currencyFormatter.format(commissionData.reduce((sum, row) => sum + Number(row.earned_revenue ?? row.total_payable ?? 0), 0)) : "—"} subtitle="In returned records" Icon={RiServiceLine} variant="primary" /></div>
                <div className="col-12 col-md-4"><SummaryMetric title="Services" value={known ? commissionData.reduce((sum, row) => sum + row.total_services, 0).toLocaleString() : "—"} subtitle="In returned records" Icon={RiFileList3Line} variant="info" /></div>
            </div>
            <div className={styles.toolbar}>
                <PeriodFilter value={dateFilter} onChange={setDateFilter} disabled={loading || showBulkPayModal} onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={loading || showBulkPayModal} onClick={() => setReloadKey(key => key + 1)}>Refresh</button>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={loading || showBulkPayModal} onClick={() => { setDateFilter("This Year"); setStartDate(dayjs().startOf("year").format("YYYY-MM-DD")); setEndDate(dayjs().format("YYYY-MM-DD")); }}>Reset</button>
                {!!selectedRecords.size && <Button variant="success" size="sm" onClick={() => { setBulkPayError(null); setShowBulkPayModal(true); }}>Pay Commission for Selected ({selectedRecords.size.toLocaleString()})</Button>}
            </div>
            {loading ? <LoadingState /> : !error && <>
                <h2 className="h6">Commission trend</h2>
                <CommissionLineChart data={commissionData} view="line" />
                <h2 className="h6 mt-3">Commission records</h2>
                <details className="mb-2 small">
                    <summary>What do these columns mean?</summary>
                    <p className="text-muted mt-2 mb-0">Total payable is the value of referred services. Commission earned is due based on the amount actually paid for those services. Search and selection apply to the returned records.</p>
                </details>
                {commissionData.length ? <PrimeTable column={columns} data={commissionData} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={undefined} /> : <p className={styles.emptyState}>No commission records found for this clinician in the selected period.</p>}
            </>}
            <CommissionDetailsModal show={showDetailsModal} onHide={() => { historyRequest.current++; setShowDetailsModal(false); }} commissionPayments={commissionPayments} selectedRecord={selectedRecord} loading={detailsLoading} error={detailsError} onRetry={() => { if (selectedRecord) handleViewDetails(selectedRecord); }} clinicianId={params.clinicianid} paymentModes={paymentModes} onPaymentSuccess={() => setReloadKey(key => key + 1)} />
            <Modal show={showBulkPayModal} backdrop="static" keyboard={!bulkPayLoading} onHide={() => { if (!bulkPayLoading) setShowBulkPayModal(false); }} aria-labelledby="bulk-commission-title">
                <Modal.Header closeButton={!bulkPayLoading}><Modal.Title id="bulk-commission-title" className="h6">Pay commission for selected records</Modal.Title></Modal.Header>
                <Modal.Body aria-busy={bulkPayLoading}>
                    <p className="small">Period: {startDate} – {endDate}<br />Selected records: {selectedRecords.size.toLocaleString()} · Commission due: {currencyFormatter.format(selectedCommissionDue)}</p>
                    {paymentModesError && <ErrorState message={paymentModesError} onRetry={loadPaymentModes} />}
                    <Form id="bulk-commission-form" onSubmit={event => { event.preventDefault(); handleBulkPay(); }}>
                        <Form.Group controlId="bulk-payment-method" className="mb-3">
                            <Form.Label className="small">Payment method</Form.Label>
                            <Form.Select size="sm" required disabled={bulkPayLoading || !paymentModes.length} value={bulkPayMethod ?? ""} onChange={e => setBulkPayMethod(Number(e.target.value) || null)}>
                                <option value="">Select payment method</option>{paymentModes.map(mode => <option key={mode.KeyID} value={mode.KeyID}>{mode.PaymentMode}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="bulk-payment-amount" className="mb-3">
                            <Form.Label className="small">Amount to pay</Form.Label>
                            <Form.Control type="number" size="sm" required min="0" max={selectedCommissionDue} step="0.01" disabled={bulkPayLoading} value={bulkPayAmount} onChange={e => setBulkPayAmount(e.target.value)} aria-describedby="bulk-amount-help" />
                            <Form.Text id="bulk-amount-help">Amount must not exceed the selected commission due.</Form.Text>
                        </Form.Group>
                    </Form>
                    {bulkPayError && <ErrorState message={bulkPayError} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" size="sm" disabled={bulkPayLoading} onClick={() => setShowBulkPayModal(false)}>Cancel</Button>
                    <Button type="submit" form="bulk-commission-form" variant="primary" size="sm" disabled={bulkPayLoading || !bulkPayAmount || !bulkPayMethod || !paymentModes.length}>{bulkPayLoading ? "Processing…" : "Pay Commission"}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
