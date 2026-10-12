"use client";
import React, { useCallback, useState } from "react";
import dayjs from "dayjs";
import { RiRefreshLine } from "@remixicon/react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { exportCommissionDataToPDF } from "../../../../lib/commission/exportCommissionPdf";
import { DateToolbar, OrganizationTable, Pagination, ReportState, SummaryMetric, TableCell, reportRecords, useOrganizationReport } from "../OrganizationUi";
import styles from "../organizations.module.css";

interface CommissionData {
    organization_id: number;
    organization_name: string;
    organization_phone: string;
    service_date: string;
    total_services: number;
    total_payable: string;
    total_paid: string;
    commission_earned_total: string;
}

export default function OrganizationPendingCommission() {
    const today = dayjs().format("YYYY-MM-DD");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [dateFilter, setDateFilter] = useState("Today");
    const [showOrgSummary, setShowOrgSummary] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const retrieve = useCallback(async () => reportRecords<CommissionData>(
        await customFetch(`organization/commission/summary?startDate=${startDate}&endDate=${endDate}`), "result"
    ), [startDate, endDate]);
    const { data, loading, error, refresh, revision } = useOrganizationReport(retrieve);
    const known = !loading && !error;
    const summary = data.reduce((acc, item) => ({
        earned: acc.earned + Number(item.commission_earned_total),
        payable: acc.payable + Number(item.total_payable),
        paid: acc.paid + Number(item.total_paid),
        services: acc.services + Number(item.total_services),
    }), { earned: 0, payable: 0, paid: 0, services: 0 });
    const organizationSummary = Object.values(data.reduce((acc, item) => {
        const current = acc[item.organization_id] || {
            ...item, records: 0, services: 0, payable: 0, earned: 0,
        };
        current.records++;
        current.services += Number(item.total_services);
        current.payable += Number(item.total_payable);
        current.earned += Number(item.commission_earned_total);
        acc[item.organization_id] = current;
        return acc;
    }, {} as Record<number, CommissionData & { records: number; services: number; payable: number; earned: number }>));
    const columns = [
        { Header: "Organization", accessor: "organization_name" },
        { Header: "Phone", accessor: "organization_phone" },
        { Header: "Services", accessor: "total_services", Cell: ({ row }: TableCell<CommissionData>) => Number(row.original.total_services).toLocaleString() },
        ...(["total_payable", "total_paid", "commission_earned_total"] as const).map((accessor, index) => ({
            Header: ["Service payable", "Service paid", "Commission earned"][index], accessor,
            Cell: ({ row }: TableCell<CommissionData>) => currencyFormatter.format(Number(row.original[accessor])),
        })),
        { Header: "Actions", id: "actions", disableSortBy: true,
            Cell: ({ row }: TableCell<CommissionData>) => <a
                href={`/commissions/organizations/commission-details/${row.original.organization_id}`}
                className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">View</a>,
        },
    ];
    const handleSeverSideProcessing = async ({ page, count, sortby }: Pagination) => {
        try {
            const response = await customFetch(`organization/commission/summary?startDate=${startDate}&endDate=${endDate}&page=${page}&count=${count}${sortby ? `&sortby=${sortby}` : ""}`);
            return { result: reportRecords<CommissionData>(response, "result"), error: false as const };
        } catch (failure) {
            return { result: [], error: failure instanceof Error ? failure.message : "Unable to load organization commissions." };
        }
    };
    const exportReport = async () => {
        if (exporting || !known || !data.length) return;
        setExporting(true);
        setExportError(null);
        try { await exportCommissionDataToPDF(data, startDate, endDate); }
        catch { setExportError("Unable to export the commission report. Please try again."); }
        finally { setExporting(false); }
    };

    return <section className={`container-fluid p-2 ${styles.page}`} aria-busy={loading}>
        <header className="mb-3">
            <h1 className="h5 fw-bold mb-1">Organization commissions</h1>
            <p className="small text-muted mb-0">Commission earned for services · {startDate} – {endDate}</p>
        </header>
        <ReportState loading={loading} error={error} retry={refresh} />
        <div className="row g-3 mb-3">
            {([
                ["Commission earned", summary.earned, "primary", true],
                ["Service payable", summary.payable, "secondary", true],
                ["Service paid", summary.paid, "success", true],
                ["Services", summary.services, "info", false],
            ] as const).map(([title, value, variant, financial]) => <div className="col-12 col-sm-6 col-xl-3" key={title}>
                <SummaryMetric title={title} value={known ? value : null} variant={variant}
                    financial={financial} subtitle="In the returned summary records" />
            </div>)}
        </div>
        <DateToolbar value={dateFilter} onChange={setDateFilter} disabled={loading}
            onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }}>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={refresh} disabled={loading}>
                <RiRefreshLine size={16} className="me-1" aria-hidden="true" />Refresh
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={exportReport}
                disabled={!known || !data.length || exporting}>{exporting ? "Exporting…" : "Export PDF"}</button>
        </DateToolbar>
        {exportError && <p className="text-danger small" role="alert">{exportError}</p>}
        {known && <>
            <p className="small text-muted mb-2">
                {data.length.toLocaleString()} returned summary records · {organizationSummary.length.toLocaleString()} organizations.
                Metrics, organization breakdown and PDF reflect this initial response, not subsequent table pages.
            </p>
            {data.length > 0 && <section className="mb-3">
                <button type="button" className="btn btn-sm btn-outline-secondary" aria-expanded={showOrgSummary}
                    aria-controls="organization-summary" onClick={() => setShowOrgSummary(value => !value)}>
                    {showOrgSummary ? "Hide" : "Show"} organization breakdown
                </button>
                {showOrgSummary && <div id="organization-summary" className="mt-2">
                    <OrganizationTable data={organizationSummary} column={[
                        { Header: "Organization", accessor: "organization_name" },
                        { Header: "Phone", accessor: "organization_phone" },
                        { Header: "Records", accessor: "records" },
                        { Header: "Services", accessor: "services" },
                        { Header: "Service payable", accessor: "payable", Cell: ({ value }: { value: number }) => currencyFormatter.format(value) },
                        { Header: "Commission earned", accessor: "earned", Cell: ({ value }: { value: number }) => currencyFormatter.format(value) },
                    ]} />
                </div>}
            </section>}
            {data.length ? <OrganizationTable key={`${startDate}-${endDate}-${revision}`} data={data} column={columns}
                filtering handleSeverSideProcessing={handleSeverSideProcessing} />
                : <p className="text-muted py-3">No organization commission records for this period.</p>}
        </>}
    </section>;
}
