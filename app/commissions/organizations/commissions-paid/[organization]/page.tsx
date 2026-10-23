"use client";
import React, { useCallback, useState, use } from "react";
import { RiRefreshLine } from "@remixicon/react";
import dayjs from "dayjs";
import { currencyFormatter, customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { DateToolbar, OrganizationTable, Pagination, ReportState, SummaryMetric, TableCell, reportRecords, useOrganizationReport } from "../../OrganizationUi";
import styles from "../../organizations.module.css";

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
    payment_mode: string;
    recipient_name: string;
    created_by_username: string;
}

export default function OrganizationPaidCommissionsPage(props: { params: Promise<{ organization: string }> }) {
    const params = use(props.params);
    const today = dayjs().format("YYYY-MM-DD");
    const defaultStart = dayjs().startOf("year").format("YYYY-MM-DD");
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(today);
    const [dateFilter, setDateFilter] = useState("This Year");
    const employeeid = useApplication()?.user?.employeeid;
    const fetchPage = useCallback(async (pagination?: Pagination) => {
        const url = `commission-payments/commission/batch/information?recipient_type=organization&recipient_id=${encodeURIComponent(params.organization)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&&employeeid=${encodeURIComponent(employeeid || "")}${pagination ? `&page=${pagination.page}&count=${pagination.count}${pagination.sortby ? `&sortby=${pagination.sortby}` : ""}` : ""}`;
        return reportRecords<PaidCommissionData>(await customFetch(url), "data");
    }, [params.organization, startDate, endDate, employeeid]);
    const retrieve = useCallback(() => fetchPage(), [fetchPage]);
    const { data, loading, error, refresh, revision } = useOrganizationReport(retrieve);
    const handleSeverSideProcessing = async (pagination: Pagination) => {
        try { return { result: await fetchPage(pagination), error: false as const }; }
        catch (failure) { return { result: [], error: failure instanceof Error ? failure.message : "Unable to load paid commissions." }; }
    };
    const summary = data.reduce((acc, item) => ({
        commission: acc.commission + Number(item.total_commission_amount),
        paid: acc.paid + Number(item.payment_amount),
        waived: acc.waived + Number(item.waived_amount),
    }), { commission: 0, paid: 0, waived: 0 });
    const known = !loading && !error;
    const columns = [
        { Header: "Batch reference", accessor: "batch_reference" },
        { Header: "Payment date", accessor: "payment_date", Cell: ({ row }: TableCell<PaidCommissionData>) => dayjs(row.original.payment_date).format("DD MMM YYYY") },
        ...(["total_commission_amount", "payment_amount", "waived_amount"] as const).map((accessor, index) => ({
            Header: ["Commission", "Payment amount", "Waived"][index], accessor,
            Cell: ({ row }: TableCell<PaidCommissionData>) => currencyFormatter.format(Number(row.original[accessor])),
        })),
        { Header: "Status", accessor: "status", Cell: ({ row }: TableCell<PaidCommissionData>) =>
            <span className={row.original.status === "paid" ? "text-success" : "text-body"}>{row.original.status}</span> },
        { Header: "Payment mode", accessor: "payment_mode" },
        { Header: "Created by", accessor: "created_by_username" },
    ];
    return <section className={`container-fluid p-2 ${styles.page}`} aria-busy={loading}>
        <header className="mb-3">
            <h1 className="h5 fw-bold mb-1">Organization paid commissions</h1>
            <p className="small text-muted mb-0">Organization ID: {params.organization} · {startDate} – {endDate}</p>
        </header>
        <ReportState loading={loading} error={error} retry={refresh} />
        <div className="row g-3 mb-3">
            {([
                ["Commission", summary.commission, "primary"],
                ["Paid", summary.paid, "success"],
                ["Waived", summary.waived, "secondary"],
            ] as const).map(([title, value, variant]) => <div className="col-12 col-sm-6 col-xl-4" key={title}>
                <SummaryMetric title={title} value={known ? value : null} financial variant={variant} subtitle="In the initially returned batches" />
            </div>)}
        </div>
        <DateToolbar value={dateFilter} onChange={setDateFilter} disabled={loading}
            onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }}>
            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={refresh} disabled={loading}>
                <RiRefreshLine size={16} className="me-1" aria-hidden="true" />Refresh
            </button>
            <button className="btn btn-sm btn-outline-secondary" type="button" disabled={loading}
                onClick={() => { setStartDate(defaultStart); setEndDate(today); setDateFilter("This Year"); }}>Reset</button>
        </DateToolbar>
        {known && <>
            <p className="small text-muted mb-2">{data.length.toLocaleString()} initially returned batches. Metrics reflect these batches, not subsequent table pages.</p>
            {data.length ? <OrganizationTable key={`${startDate}-${endDate}-${revision}`} column={columns} data={data} filtering
                handleSeverSideProcessing={handleSeverSideProcessing} />
                : <p className="text-muted py-3">No paid commission records for this organization in the selected period.</p>}
        </>}
    </section>;
}
