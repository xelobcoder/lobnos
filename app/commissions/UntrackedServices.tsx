"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { RiRefreshLine } from "@remixicon/react";
import { toast } from "react-toastify";
import { customFetch, customPost, currencyFormatter } from "../../components/Auth/customFetch";
import { CommissionTable, Pagination, PeriodFilter, ReportState, SummaryMetric, TableCell, commissionRecords } from "./PortalUi";

interface UntrackedService {
    serviceid: number; totalpayable: string; paidamount: string; status: string;
    paymentstatus: string; serviceAddedOn: string; serviceCategory: string;
    clinicianId: number | null; organizationId: number | null;
    test_name: string; clinician_name: string | null; organization_name: string | null;
}
type Recipient = { recipient_type: string; recipient_id: string };

export default function UntrackedServices({ recipient }: { recipient?: Recipient }) {
    const [dateFilter, setDateFilter] = useState("This Year");
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [data, setData] = useState<UntrackedService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [tracking, setTracking] = useState<number | null>(null);
    const trackingLock = useRef(false);
    const request = useRef(0);
    const recipientType = recipient?.recipient_type;
    const recipientId = recipient?.recipient_id;
    const filterKey = `${startDate}:${endDate}:${recipientType || ""}:${recipientId || ""}`;
    const currentKey = useRef(filterKey);
    currentKey.current = filterKey;
    const buildUrl = useCallback(({ page, count, sortby }: Pagination) => {
        const scope = recipientType && recipientId
            ? `&recipient_type=${encodeURIComponent(recipientType)}&recipient_id=${encodeURIComponent(recipientId)}` : "";
        return `commission-payments/untracked/services?page=${page}&count=${count}${scope}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}${sortby ? `&sortby=${encodeURIComponent(sortby)}` : ""}`;
    }, [startDate, endDate, recipientType, recipientId]);

    const refresh = useCallback(async () => {
        const version = ++request.current;
        setLoading(true);
        setError(null);
        try {
            if (!startDate || !endDate || startDate > endDate) throw new Error("Select a valid commission date range.");
            const records = commissionRecords<UntrackedService>(await customFetch(buildUrl({ page: 1, count: 10 })));
            if (version !== request.current) return;
            setData(records);
            setRevision(value => value + 1);
        } catch (failure) {
            if (version !== request.current) return;
            setData([]);
            setError(failure instanceof Error ? failure.message : "Unable to load untracked services.");
        } finally {
            if (version === request.current) setLoading(false);
        }
    }, [buildUrl, startDate, endDate]);
    const invalidate = useCallback(() => { request.current++; }, []);
    useEffect(() => {
        void refresh();
        return invalidate;
    }, [refresh, invalidate]);

    const handleServerSideProcessing = async (pagination: Pagination) => {
        try {
            const result = commissionRecords<UntrackedService>(await customFetch(buildUrl(pagination)));
            if (currentKey.current !== filterKey) return { result: [], error: "Filters changed; reload the selected period." };
            return { result, error: false as const };
        } catch (failure) {
            return { result: [], error: failure instanceof Error ? failure.message : "Unable to load untracked services." };
        }
    };
    const handleTrackRecord = async (service: UntrackedService) => {
        if (trackingLock.current) return;
        const type = recipientType || (service.clinicianId ? "clinician" : "organization");
        const id = recipientId ? Number(recipientId) : service.clinicianId || service.organizationId;
        if (!id) { toast.error("No recipient found for this service"); return; }
        trackingLock.current = true;
        setTracking(service.serviceid);
        try {
            const response = await customPost("commission-payments/untracked/services", "POST", {
                serviceid: service.serviceid, recipient_type: type, recipient_id: id,
            });
            if (!(response?.status === true || response?.status === "success" || response?.success === true)) {
                throw new Error(response?.message || "Failed to track service");
            }
            const message = response.message || "Service tracked successfully";
            const trackingId = response.data?.tracking_id;
            toast.success(trackingId ? `${message} (Tracking ID: ${trackingId})` : message);
            await refresh();
        } catch (failure) {
            toast.error(failure instanceof Error ? failure.message : "Unable to track service.");
        } finally {
            trackingLock.current = false;
            setTracking(null);
        }
    };
    const columns = [
        { Header: "Service ID", accessor: "serviceid" },
        { Header: "Test / category", accessor: "test_name", Cell: ({ row }: TableCell<UntrackedService>) =>
            <div>{row.original.test_name}<div className="small text-body-secondary">{row.original.serviceCategory}</div></div> },
        { Header: "Total payable", accessor: "totalpayable", Cell: ({ row }: TableCell<UntrackedService>) => currencyFormatter.format(Number(row.original.totalpayable)) },
        { Header: "Paid amount", accessor: "paidamount", Cell: ({ row }: TableCell<UntrackedService>) => currencyFormatter.format(Number(row.original.paidamount)) },
        { Header: "Status", accessor: "status", Cell: ({ row }: TableCell<UntrackedService>) =>
            <span className={row.original.status === "active" ? "text-success" : "text-body-secondary"}>{row.original.status}</span> },
        { Header: "Payment status", accessor: "paymentstatus", Cell: ({ row }: TableCell<UntrackedService>) =>
            <span className={row.original.paymentstatus === "paid" ? "text-success" : "text-body-emphasis"}>{row.original.paymentstatus}</span> },
        { Header: "Added on", accessor: "serviceAddedOn", Cell: ({ row }: TableCell<UntrackedService>) => dayjs(row.original.serviceAddedOn).format("YYYY-MM-DD HH:mm") },
        ...(!recipient ? [
            { Header: "Recipient", accessor: "clinician_name", Cell: ({ row }: TableCell<UntrackedService>) => row.original.clinician_name || row.original.organization_name || "N/A" },
            { Header: "View", id: "view", disableSortBy: true, Cell: ({ row }: TableCell<UntrackedService>) => {
                const type = row.original.clinicianId ? "clinician" : "organization";
                const id = row.original.clinicianId || row.original.organizationId;
                return id ? <Link className="btn btn-sm btn-outline-primary" href={`/commissions/untracked-commission-records/recipient/${type}/${id}`}>View {type}</Link> : "N/A";
            } },
        ] : []),
        { Header: "Actions", id: "actions", disableSortBy: true, Cell: ({ row }: TableCell<UntrackedService>) =>
            <button type="button" className="btn btn-sm btn-primary" disabled={tracking !== null}
                aria-label={`Track service ${row.original.serviceid}`} onClick={() => handleTrackRecord(row.original)}>
                {tracking === row.original.serviceid ? "Tracking…" : "Track record"}
            </button> },
    ];
    const summary = data.reduce((acc, item) => ({
        payable: acc.payable + Number(item.totalpayable), paid: acc.paid + Number(item.paidamount),
    }), { payable: 0, paid: 0 });
    const known = !loading && !error;
    const recipientName = data[0]?.clinician_name || data[0]?.organization_name;
    return <div className="container-fluid px-3 px-md-4 py-3" aria-busy={loading || tracking !== null}>
        {recipient && <nav aria-label="breadcrumb" className="mb-2">
            <Link href="/commissions/untracked-commission-records">Untracked commission services</Link>
            <span className="text-body-secondary ms-2">/ {recipientType} {recipientId}</span>
        </nav>}
        <header className="mb-3">
            <h1 className="fs-4 fw-bold mb-1">Untracked commission services</h1>
            <p className="text-body-secondary mb-0">{recipient
                ? `Services for ${recipientName || `${recipientType} ID: ${recipientId}`}.`
                : "Review services not yet tracked for commission processing."}</p>
        </header>
        <ReportState loading={loading} error={error} retry={refresh} />
        <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Services" value={known ? data.length : null} variant="primary" /></div>
            <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Payable" value={known ? summary.payable : null} financial variant="secondary" /></div>
            <div className="col-12 col-sm-6 col-xl-4"><SummaryMetric title="Paid" value={known ? summary.paid : null} financial variant="success" /></div>
        </div>
        <div className="row g-2 align-items-end mb-3">
            <PeriodFilter value={dateFilter} onChange={setDateFilter} disabled={loading || tracking !== null}
                onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
            <div className="col-12 col-md-auto">
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || tracking !== null} onClick={refresh}>
                    <RiRefreshLine size={16} className="me-1" aria-hidden="true" />{loading ? "Refreshing…" : "Refresh"}
                </button>
            </div>
        </div>
        {known && <CommissionTable key={`${filterKey}:${revision}`} column={columns} data={data} handleSeverSideProcessing={handleServerSideProcessing} />}
    </div>;
}
