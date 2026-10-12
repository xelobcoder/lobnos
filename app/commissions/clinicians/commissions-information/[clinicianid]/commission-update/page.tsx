"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { Form, Modal } from "react-bootstrap";
import { RiMoneyDollarCircleLine } from "@remixicon/react";
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import { customFetch, customPost, currencyFormatter } from "../../../../../../components/Auth/customFetch";
import { ErrorState, LoadingState, PeriodFilter, SummaryMetric, TableCell } from "../../ClinicianUi";
import styles from "../../CommissionReport.module.css";

interface CommissionRecord {
    id: number; service_id: number; service_amount: string; commission_type: string;
    percentage_rate_applied: number | null; fixed_amount_applied: number | null;
    commission_due: string; final_commission: string; recipient_type: string; recipient_id: number;
    status: string; serviceCategory: string; test_name: string; recipient_name?: string;
}
interface Pagination { page: number; count: number; startDate: string; endDate: string }

export default function CommissionUpdatePage() {
    const params = useParams();
    const clinicianid = String(params?.clinicianid || "");
    const [data, setData] = useState<CommissionRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<CommissionRecord | null>(null);
    const [newRate, setNewRate] = useState("0");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [appliedDates, setAppliedDates] = useState({ startDate, endDate });
    const [error, setError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const submitting = useRef(false);

    const handleServerSideProcessing = useCallback(async ({ page, count, startDate, endDate }: Pagination) => {
        try {
            const response = await customFetch(`commission-payments/detailed/list?page=${page}&&count=${count}&&recipientType=clinician&&recipient_id=${encodeURIComponent(clinicianid)}&&startDate=${encodeURIComponent(startDate)}&&endDate=${encodeURIComponent(endDate)}`);
            if (!(response?.status === true || response?.status === "success") || !Array.isArray(response.data)) return { result: [], error: "Failed to load commission records." };
            return { result: response.data as CommissionRecord[], error: false };
        } catch (err) {
            return { result: [], error: err instanceof Error ? err.message : "Failed to load commission records." };
        }
    }, [clinicianid]);

    useEffect(() => {
        let active = true;
        setLoading(true); setError(null);
        handleServerSideProcessing({ page: 1, count: 10, ...appliedDates }).then(response => {
            if (!active) return;
            if (response.error) setError(String(response.error));
            else setData(response.result);
            setLoading(false);
        });
        return () => { active = false; };
    }, [handleServerSideProcessing, appliedDates, reloadKey]);

    const handleUpdateRate = async () => {
        if (!selectedRecord || submitting.current) return;
        const rate = Number(newRate);
        if (!newRate || !Number.isFinite(rate) || rate < 0 || rate > 100) { setUpdateError("Enter a commission rate between 0 and 100."); return; }
        submitting.current = true; setUpdating(true); setUpdateError(null);
        try {
            const response = await customPost(`commission-payments/commission/recipient/update-rates/${selectedRecord.id}`, "PUT", {
                recipientType: selectedRecord.recipient_type, recipientId: selectedRecord.recipient_id,
                commissionRate: rate, serviceid: selectedRecord.service_id,
            });
            if (!(response?.status === true || response?.status === "success")) throw new Error(response?.message || "Failed to update commission rate.");
            setSelectedRecord(null); setSuccess("Commission rate updated."); setReloadKey(key => key + 1);
        } catch (err) {
            setUpdateError(err instanceof Error ? err.message : "Failed to update commission rate.");
        } finally { submitting.current = false; setUpdating(false); }
    };

    const columns = useMemo(() => [
        { Header: "Test", accessor: "test_name", Cell: ({ row }: TableCell<CommissionRecord>) => <div><span className="fw-semibold">{row.original.test_name} ({row.original.service_id})</span><small className="d-block text-muted">{row.original.serviceCategory?.replace(/_/g, " ")}</small></div> },
        { Header: "Service amount", accessor: "service_amount", Cell: ({ value }: TableCell<CommissionRecord>) => currencyFormatter.format(Number(value)) },
        { Header: "Commission type", accessor: "commission_type", Cell: ({ row }: TableCell<CommissionRecord>) => row.original.commission_type === "percentage" ? `Percentage (${row.original.percentage_rate_applied ?? "N/A"}%)` : "Fixed Amount" },
        { Header: "Fixed amount", accessor: "fixed_amount_applied", Cell: ({ value }: TableCell<CommissionRecord, number | null>) => value == null ? "N/A" : currencyFormatter.format(value) },
        { Header: "Commission", accessor: "commission_due", Cell: ({ value }: TableCell<CommissionRecord>) => currencyFormatter.format(Number(value)) },
        { Header: "Final commission", accessor: "final_commission", Cell: ({ value }: TableCell<CommissionRecord>) => currencyFormatter.format(Number(value)) },
        { Header: "Status", accessor: "status" },
        { Header: "Recipient type", accessor: "recipient_type" },
        { Header: "Recipient", accessor: "recipient_name" },
        { Header: "Actions", id: "actions", disableSortBy: true, Cell: ({ row }: TableCell<CommissionRecord>) => <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { setSelectedRecord(row.original); setNewRate(String(row.original.percentage_rate_applied ?? 0)); setUpdateError(null); setSuccess(null); }}>Update</button> },
    ], []);

    return (
        <div className={styles.container} aria-busy={loading}>
            <h1 className={`${styles.title} mb-3`}>Commission update</h1>
            {error && <ErrorState message={error} onRetry={() => setReloadKey(key => key + 1)} />}
            {success && <p role="status" className="text-success">{success}</p>}
            <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Commission due" value={loading || error ? "—" : currencyFormatter.format(data.reduce((sum, row) => sum + Number(row.commission_due), 0))} subtitle="In the initially loaded page only" Icon={RiMoneyDollarCircleLine} variant="primary" /></div>
            </div>
            <div className={styles.toolbar}>
                <PeriodFilter value={dateFilter} onChange={setDateFilter} disabled={loading} onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                <button type="button" className="btn btn-primary btn-sm" disabled={loading} onClick={() => setAppliedDates({ startDate, endDate })}>{loading ? "Loading…" : "Filter records"}</button>
            </div>
            {loading ? <LoadingState /> : !error && <>
                <p className="small text-muted">Loaded period: {appliedDates.startDate} – {appliedDates.endDate}. Table search covers the displayed page.</p>
                <PrimeTable key={`${appliedDates.startDate}-${appliedDates.endDate}-${reloadKey}`} data={data} column={columns} serverSideFiltering={true} urlparams={appliedDates} filtering={true} handleSeverSideProcessing={handleServerSideProcessing} />
            </>}
            <Modal show={!!selectedRecord} backdrop="static" keyboard={!updating} onHide={() => { if (!updating) setSelectedRecord(null); }} aria-labelledby="commission-rate-title">
                <Modal.Header closeButton={!updating}><Modal.Title id="commission-rate-title" className="h6">Update commission rate</Modal.Title></Modal.Header>
                <Modal.Body aria-busy={updating}>
                    <p className="small"><strong>Recipient:</strong> {selectedRecord?.recipient_name || "N/A"} ({selectedRecord?.recipient_type})<br /><strong>Service:</strong> {selectedRecord?.test_name}</p>
                    <Form id="commission-rate-form" onSubmit={event => { event.preventDefault(); handleUpdateRate(); }}>
                        <Form.Group controlId="commission-rate" className="mb-3">
                            <Form.Label className="small">New commission rate (%)</Form.Label>
                            <Form.Control type="number" value={newRate} onChange={e => setNewRate(e.target.value)} required min="0" max="100" step="0.1" size="sm" disabled={updating} />
                        </Form.Group>
                    </Form>
                    {updateError && <ErrorState message={updateError} />}
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary btn-sm" disabled={updating} onClick={() => setSelectedRecord(null)}>Cancel</button>
                    <button type="submit" form="commission-rate-form" className="btn btn-primary btn-sm" disabled={updating}>{updating ? "Updating…" : "Update Rate"}</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
