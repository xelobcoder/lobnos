"use client";
import React, { useCallback, useRef, useState } from "react";
import dayjs from "dayjs";
import { RiRefreshLine } from "@remixicon/react";
import { toast } from "react-toastify";
import { customPost, currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import { DateToolbar, OrganizationTable, Pagination, ReportState, SummaryMetric, TableCell, reportRecords, useOrganizationReport } from "./OrganizationUi";
import styles from "./organizations.module.css";

interface UntrackedService {
    serviceid: number;
    totalpayable: string;
    paidamount: string;
    status: string;
    paymentstatus: string;
    serviceAddedOn: string;
    serviceCategory: string;
    clinicianId: number | null;
    organizationId: number | null;
    test_name: string;
    clinician_name: string | null;
    organization_name: string | null;
}

export default function UntrackedServices({ recipientType, recipientId }: {
    recipientType?: string; recipientId?: string;
}) {
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [trackingId, setTrackingId] = useState<number | null>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const [trackingSuccess, setTrackingSuccess] = useState<string | null>(null);
    const pending = useRef(false);
    const recipientQuery = recipientType && recipientId
        ? `&recipient_type=${encodeURIComponent(recipientType)}&recipient_id=${encodeURIComponent(recipientId)}` : "";
    const fetchPage = useCallback(async ({ page, count, sortby }: Pagination) => {
        const response = await customFetch(
            `commission-payments/untracked/services?page=${page}&count=${count}${recipientQuery}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}${sortby ? `&sortby=${encodeURIComponent(sortby)}` : ""}`
        );
        return reportRecords<UntrackedService>(response, "data");
    }, [recipientQuery, startDate, endDate]);
    const retrieve = useCallback(() => fetchPage({ page: 1, count: 10 }), [fetchPage]);
    const { data, loading, error, refresh, revision } = useOrganizationReport(retrieve);
    const handleServerSideProcessing = async (pagination: Pagination) => {
        try { return { result: await fetchPage(pagination), error: false as const }; }
        catch (failure) { return { result: [], error: failure instanceof Error ? failure.message : "Unable to load untracked services." }; }
    };
    const recipientFor = (service: UntrackedService) => ({
        type: recipientType || (service.clinicianId ? "clinician" : "organization"),
        id: recipientId ? Number(recipientId) : service.clinicianId || service.organizationId,
    });
    const handleTrackRecord = async (service: UntrackedService) => {
        if (pending.current) return;
        const recipient = recipientFor(service);
        if (!recipient.id || !Number.isFinite(recipient.id)) {
            setTrackingError("No recipient found for this service.");
            return;
        }
        pending.current = true;
        setTrackingId(service.serviceid);
        setTrackingError(null);
        setTrackingSuccess(null);
        try {
            const response = await customPost("commission-payments/untracked/services", "POST", {
                serviceid: service.serviceid, recipient_type: recipient.type, recipient_id: recipient.id,
            });
            if (response && (response.status === true || response.status === "success" || response.success === true)) {
                const message = response.message || "Service tracked successfully.";
                const id = response.data?.tracking_id;
                const confirmation = id ? `${message} (Tracking ID: ${id})` : message;
                setTrackingSuccess(confirmation);
                toast.success(confirmation);
                await refresh();
            } else setTrackingError(response?.message || "Failed to track service.");
        } catch (failure) {
            setTrackingError(failure instanceof Error ? failure.message : "Unable to track service.");
        } finally {
            pending.current = false;
            setTrackingId(null);
        }
    };
    const summary = data.reduce((acc, item) => ({
        payable: acc.payable + Number(item.totalpayable),
        paid: acc.paid + Number(item.paidamount),
    }), { payable: 0, paid: 0 });
    const known = !loading && !error;
    const recipientName = recipientType === "organization" ? data[0]?.organization_name : data[0]?.clinician_name;
    const columns = [
        { Header: "Service ID", accessor: "serviceid" },
        { Header: "Test / category", accessor: "test_name",
            Cell: ({ row }: TableCell<UntrackedService>) => <div>{row.original.test_name}<div className="small text-muted">{row.original.serviceCategory}</div></div> },
        ...(["totalpayable", "paidamount"] as const).map((accessor, index) => ({
            Header: ["Service payable", "Service paid"][index], accessor,
            Cell: ({ row }: TableCell<UntrackedService>) => currencyFormatter.format(Number(row.original[accessor])),
        })),
        { Header: "Status", accessor: "status", Cell: ({ row }: TableCell<UntrackedService>) =>
            <span className={row.original.status === "active" ? "text-success" : "text-body"}>{row.original.status}</span> },
        { Header: "Payment status", accessor: "paymentstatus", Cell: ({ row }: TableCell<UntrackedService>) =>
            <span className={row.original.paymentstatus === "paid" ? "text-success" : "text-body"}>{row.original.paymentstatus}</span> },
        { Header: "Added on", accessor: "serviceAddedOn", Cell: ({ row }: TableCell<UntrackedService>) => dayjs(row.original.serviceAddedOn).format("YYYY-MM-DD HH:mm") },
        ...(!recipientType ? [
            { Header: "Recipient", accessor: "clinician_name", Cell: ({ row }: TableCell<UntrackedService>) => row.original.clinician_name || row.original.organization_name || "Not provided" },
            { Header: "View", id: "view", disableSortBy: true, Cell: ({ row }: TableCell<UntrackedService>) => {
                const recipient = recipientFor(row.original);
                return recipient.id ? <a href={`/commissions/organizations/untracked-commission-records/recipient/${recipient.type}/${recipient.id}`}
                    className="btn btn-sm btn-outline-primary">View {recipient.type}</a> : "No recipient";
            } },
        ] : []),
        { Header: "Actions", id: "actions", disableSortBy: true,
            Cell: ({ row }: TableCell<UntrackedService>) => <button type="button" className="btn btn-sm btn-outline-primary"
                disabled={trackingId !== null || loading || !recipientFor(row.original).id}
                onClick={() => handleTrackRecord(row.original)}>
                {trackingId === row.original.serviceid ? "Tracking…" : "Track record"}
            </button> },
    ];

    return <section className={`container-fluid p-2 ${styles.page}`} aria-busy={loading || trackingId !== null}>
        {recipientType && <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb small mb-0">
                <li className="breadcrumb-item"><a href="/commissions/organizations/untracked-commission-records">Untracked services</a></li>
                <li className="breadcrumb-item active" aria-current="page">{recipientType} {recipientId}</li>
            </ol>
        </nav>}
        <header className="mb-3">
            <h1 className="h5 fw-bold mb-1">{recipientType ? "Recipient untracked services" : "Untracked commission services"}</h1>
            <p className="small text-muted mb-0">
                {recipientType ? `${recipientName || recipientType} · Recipient ID: ${recipientId}` : "Services not yet tracked by the commission module"} · {startDate} – {endDate}
            </p>
        </header>
        <ReportState loading={loading} error={error} retry={refresh} />
        {trackingError && <p className="alert alert-danger mb-3" role="alert">{trackingError}</p>}
        {trackingSuccess && <p className="text-success small mb-3" role="status">{trackingSuccess}</p>}
        {trackingId !== null && <p className="small mb-3" role="status">Tracking service {trackingId}…</p>}
        <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-xl-4">
                <SummaryMetric title="Untracked services" value={known ? data.length : null} variant="primary" subtitle="Initial loaded records (up to 10)" />
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
                <SummaryMetric title="Service payable" value={known ? summary.payable : null} financial variant="secondary" subtitle="Initial loaded records (up to 10)" />
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
                <SummaryMetric title="Service paid" value={known ? summary.paid : null} financial variant="success" subtitle="Initial loaded records (up to 10)" />
            </div>
        </div>
        <DateToolbar value={dateFilter} onChange={setDateFilter} disabled={loading || trackingId !== null}
            onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); setTrackingSuccess(null); }}>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={refresh} disabled={loading || trackingId !== null}>
                <RiRefreshLine size={16} className="me-1" aria-hidden="true" />Refresh
            </button>
        </DateToolbar>
        {known && <>
            <p className="small text-muted mb-2">Metrics summarize the initial response only, not subsequent table pages or all untracked services.</p>
            {data.length ? <OrganizationTable key={`${recipientType}-${recipientId}-${startDate}-${endDate}-${revision}`} data={data} column={columns}
                filtering handleSeverSideProcessing={handleServerSideProcessing} />
                : <p className="text-muted py-3">No untracked services for this recipient scope and period.</p>}
        </>}
    </section>;
}
