"use client";
import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";
import { RiFileList3Line, RiMoneyDollarCircleLine } from "@remixicon/react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currencyFormatter } from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { ErrorState, LoadingState, SummaryMetric, TableCell } from "./ClinicianUi";
import styles from "./CommissionReport.module.css";

export interface PaidCommissionData {
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

export interface BreakdownData {
    id: number;
    batch_payment_id?: number;
    serviceid: number;
    commission_due: string;
    amount_allocated: string;
    waived_amount: string;
    final_commission?: string;
    percentage_rate_applied?: number | null;
    commission_percentage?: string;
    status: string;
    created_at: string;
    recipient_name?: string;
    recipient_id?: number;
    commission_type?: string;
}

const money = (value: string | number) => currencyFormatter.format(Number(value));
const date = (value: string) => value ? dayjs(value).format("DD/MM/YYYY") : "N/A";

export function PaymentSummary({ data, loading, error }: { data: PaidCommissionData[]; loading: boolean; error: string | null }) {
    const value = (key: "total_commission_amount" | "payment_amount" | "waived_amount") =>
        loading || error ? "—" : money(data.reduce((sum, row) => sum + Number(row[key]), 0));
    return (
        <div className="row g-3 mb-3">
            <div className="col-12 col-md-4"><SummaryMetric title="Commission" value={value("total_commission_amount")} subtitle="In returned batches" Icon={RiFileList3Line} variant="primary" /></div>
            <div className="col-12 col-md-4"><SummaryMetric title="Paid" value={value("payment_amount")} subtitle="In returned batches" Icon={RiMoneyDollarCircleLine} variant="success" /></div>
            <div className="col-12 col-md-4"><SummaryMetric title="Waived" value={value("waived_amount")} subtitle="In returned batches" Icon={RiMoneyDollarCircleLine} variant="secondary" /></div>
        </div>
    );
}

export function PaymentReport({ data, startDate, endDate, loading, error, onBreakdown, reportRef, actions }: {
    data: PaidCommissionData[];
    startDate: string;
    endDate: string;
    loading: boolean;
    error: string | null;
    onBreakdown: (record: PaidCommissionData) => void;
    reportRef?: React.Ref<HTMLDivElement>;
    actions?: React.ReactNode;
}) {
    const chartData = useMemo(() => {
        const grouped = new Map<string, { date: string; commission: number; paid: number; waived: number }>();
        for (const record of data) {
            const key = dayjs(record.payment_date).format("YYYY-MM-DD");
            const point = grouped.get(key) || { date: key, commission: 0, paid: 0, waived: 0 };
            point.commission += Number(record.total_commission_amount);
            point.paid += Number(record.payment_amount);
            point.waived += Number(record.waived_amount);
            grouped.set(key, point);
        }
        return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);
    const columns = useMemo(() => [
        { Header: "Batch reference", accessor: "batch_reference" },
        { Header: "Start date", accessor: "start_date", Cell: ({ value }: TableCell<PaidCommissionData>) => date(value) },
        { Header: "End date", accessor: "end_date", Cell: ({ value }: TableCell<PaidCommissionData>) => date(value) },
        { Header: "Commission", accessor: "total_commission_amount", Cell: ({ value }: TableCell<PaidCommissionData>) => money(value) },
        { Header: "Paid", accessor: "payment_amount", Cell: ({ value }: TableCell<PaidCommissionData>) => money(value) },
        { Header: "Waived", accessor: "waived_amount", Cell: ({ value }: TableCell<PaidCommissionData>) => money(value) },
        { Header: "Status", accessor: "status", Cell: ({ value }: TableCell<PaidCommissionData>) => <span className="text-capitalize">{value || "N/A"}</span> },
        { Header: "Payment date", accessor: "payment_date", Cell: ({ value }: TableCell<PaidCommissionData>) => date(value) },
        { Header: "Payment mode", accessor: "payment_mode" },
        { Header: "Created by", accessor: "created_by_username" },
        { Header: "Recipient", accessor: "recipient_name" },
        { Header: "Actions", id: "actions", disableSortBy: true, Cell: ({ row }: TableCell<PaidCommissionData>) => (
            <button type="button" className="btn btn-outline-primary btn-sm no-print" onClick={() => onBreakdown(row.original)}>Breakdown</button>
        ) },
    ], [onBreakdown]);

    if (loading) return <LoadingState>Loading commission payments…</LoadingState>;
    if (error) return null;
    return (
        <div className={styles.report} ref={reportRef}>
            <p className="small text-muted">Report period: {date(startDate)} – {date(endDate)}. {data.length.toLocaleString()} returned batches.</p>
            {!!data.length && <section aria-labelledby="payment-trend-heading" className="mb-3 no-print">
                <h2 id="payment-trend-heading" className="h6">Commission payments trend</h2>
                <div role="img" aria-label="Daily commission, paid and waived amounts. Exact values are in the batches table below.">
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                            <CartesianGrid stroke="var(--bs-border-color)" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={value => dayjs(value).format("D MMM")} tick={{ fill: "var(--bs-secondary-color)", fontSize: 12 }} />
                            <YAxis width={95} tickFormatter={money} tick={{ fill: "var(--bs-secondary-color)", fontSize: 12 }} />
                            <Tooltip labelFormatter={value => date(String(value))} formatter={(value: number) => money(value)} contentStyle={{ background: "var(--bs-body-bg)", color: "var(--bs-body-color)", borderColor: "var(--bs-border-color)" }} />
                            <Legend verticalAlign="top" align="right" />
                            <Line name="Commission" dataKey="commission" stroke="var(--bs-primary)" strokeWidth={2} isAnimationActive={false} />
                            <Line name="Paid" dataKey="paid" stroke="var(--bs-success)" strokeDasharray="5 3" strokeWidth={2} isAnimationActive={false} />
                            <Line name="Waived" dataKey="waived" stroke="var(--bs-secondary-color)" strokeDasharray="2 3" strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <h2 className="h6 mb-0">Paid commission batches</h2>
                <div className="d-flex flex-wrap gap-2 no-print">{actions}</div>
            </div>
            {data.length ? <>
                <p className="small text-muted no-print">Search and sorting apply to the returned batches.</p>
                <PrimeTable column={columns} data={data} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={undefined} />
            </> : <p className={styles.emptyState}>No commission payments found for the selected period and recipient.</p>}
        </div>
    );
}

export function BreakdownModal({ selected, onHide, data, loading, error, onRetry, reportRef, actions, extended = false }: {
    selected: PaidCommissionData | null;
    onHide: () => void;
    data: BreakdownData[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    reportRef?: React.Ref<HTMLDivElement>;
    actions?: React.ReactNode;
    extended?: boolean;
}) {
    const columns = useMemo(() => [
        ...(extended ? [
            { Header: "Recipient", accessor: "recipient_name" },
            { Header: "Recipient ID", accessor: "recipient_id" },
        ] : []),
        { Header: "Service ID", accessor: "serviceid" },
        { Header: "Commission due", accessor: "commission_due", Cell: ({ value }: TableCell<BreakdownData>) => money(value) },
        { Header: "Allocated", accessor: "amount_allocated", Cell: ({ value }: TableCell<BreakdownData>) => money(value) },
        { Header: "Waived", accessor: "waived_amount", Cell: ({ value }: TableCell<BreakdownData>) => money(value) },
        ...(extended ? [{ Header: "Final commission", accessor: "final_commission", Cell: ({ row }: TableCell<BreakdownData>) => money(row.original.final_commission ?? row.original.commission_due) }] : []),
        { Header: "Commission rate", id: "rate", accessor: (row: BreakdownData) => row.percentage_rate_applied ?? row.commission_percentage, Cell: ({ value }: TableCell<BreakdownData, number | string | undefined>) => value == null ? "N/A" : `${value}%` },
        { Header: "Status", accessor: "status" },
        ...(extended ? [{ Header: "Commission type", accessor: "commission_type" }] : []),
        { Header: "Date", accessor: "created_at", Cell: ({ value }: TableCell<BreakdownData>) => date(value) },
    ], [extended]);
    return (
        <Modal show={!!selected} onHide={onHide} size="xl" aria-labelledby="clinician-breakdown-title">
            <Modal.Header closeButton><Modal.Title id="clinician-breakdown-title" className="h6">Commission breakdown — {selected?.batch_reference}</Modal.Title></Modal.Header>
            <Modal.Body aria-busy={loading}>
                <div className={styles.report} ref={reportRef}>
                    {selected && <section className="mb-3">
                        <h2 className="h6">Batch details</h2>
                        <dl className="row small mb-2">
                            <dt className="col-sm-3">Recipient</dt><dd className="col-sm-9">{selected.recipient_name || "N/A"}</dd>
                            <dt className="col-sm-3">Batch reference</dt><dd className="col-sm-9 text-break">{selected.batch_reference}</dd>
                            <dt className="col-sm-3">Period</dt><dd className="col-sm-9">{date(selected.start_date)} – {date(selected.end_date)}</dd>
                            <dt className="col-sm-3">Status</dt><dd className="col-sm-9 text-capitalize">{selected.status}</dd>
                            <dt className="col-sm-3">Payment date</dt><dd className="col-sm-9">{date(selected.payment_date)}</dd>
                            <dt className="col-sm-3">Payment mode</dt><dd className="col-sm-9">{selected.payment_mode}</dd>
                            <dt className="col-sm-3">Created by</dt><dd className="col-sm-9">{selected.created_by_username}</dd>
                            <dt className="col-sm-3">Commission</dt><dd className="col-sm-9">{money(selected.total_commission_amount)}</dd>
                            <dt className="col-sm-3">Paid</dt><dd className="col-sm-9">{money(selected.payment_amount)}</dd>
                            <dt className="col-sm-3">Waived</dt><dd className="col-sm-9">{money(selected.waived_amount)}</dd>
                            <dt className="col-sm-3">Net amount (paid − waived)</dt><dd className="col-sm-9">{money(Number(selected.payment_amount) - Number(selected.waived_amount))}</dd>
                        </dl>
                        {selected.notes && <p className="small"><strong>Notes:</strong> {selected.notes}</p>}
                    </section>}
                    {loading ? <LoadingState>Loading commission breakdown…</LoadingState> : error ? <ErrorState message={error} onRetry={onRetry} /> : data.length ? <>
                        <h2 className="h6">Service allocations</h2>
                        <PrimeTable column={columns} data={data} filtering={false} serverSideFiltering={false} handleSeverSideProcessing={undefined} />
                        <p className="small mt-2 mb-0">
                            Allocation totals — Due: {money(data.reduce((sum, row) => sum + Number(row.commission_due), 0))};
                            {" "}Allocated: {money(data.reduce((sum, row) => sum + Number(row.amount_allocated), 0))};
                            {" "}Waived: {money(data.reduce((sum, row) => sum + Number(row.waived_amount), 0))}
                        </p>
                    </> : <p className="text-muted mb-0">No service allocations returned for this batch.</p>}
                </div>
            </Modal.Body>
            <Modal.Footer>{!loading && !error && actions}<button type="button" className="btn btn-outline-secondary btn-sm" onClick={onHide}>Close</button></Modal.Footer>
        </Modal>
    );
}
