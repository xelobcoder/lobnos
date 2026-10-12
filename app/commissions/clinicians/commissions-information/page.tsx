"use client";
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { RiUserLine, RiMoneyDollarCircleLine, RiServiceLine } from "@remixicon/react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { exportClinicianCommissionDataToPDF } from "../../../../lib/commission/exportClinicianCommissionPdf";
import { ErrorState, LoadingState, PeriodFilter, SummaryMetric, TableCell } from "./ClinicianUi";
import styles from "./CommissionReport.module.css";

interface CommissionData {
    service_date: string;
    clinician_id: number;
    clinician_name: string;
    clinician_phone: string;
    organization: number;
    total_services: number;
    earned_revenue: string;
    cash_collected: string;
    commission_earned_total: string;
}

export default function CliniciansCommission() {
    const today = dayjs().format("YYYY-MM-DD");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState("Today");
    const [reloadKey, setReloadKey] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        setExportError(null);
        customFetch(`clinician/anal/commissions/range?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                if (!response?.success || !Array.isArray(response.data)) throw new Error("Unable to load commission records.");
                if (active) setCommissionData(response.data);
            })
            .catch((err: Error) => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [startDate, endDate, reloadKey]);

    const columns = useMemo(() => [
        { Header: "Clinician", accessor: "clinician_name", Cell: ({ value }: TableCell<CommissionData>) => <span className="fw-semibold">{value || "N/A"}</span> },
        { Header: "Phone", accessor: "clinician_phone" },
        { Header: "Services", accessor: "total_services", Cell: ({ value }: TableCell<CommissionData, number>) => value.toLocaleString() },
        { Header: "Service value", accessor: "earned_revenue", Cell: ({ value }: TableCell<CommissionData>) => currencyFormatter.format(Number(value)) },
        { Header: "Collected", accessor: "cash_collected", Cell: ({ value }: TableCell<CommissionData>) => currencyFormatter.format(Number(value)) },
        { Header: "Commission earned", accessor: "commission_earned_total", Cell: ({ value }: TableCell<CommissionData>) => currencyFormatter.format(Number(value)) },
        { Header: "Actions", id: "actions", disableSortBy: true, Cell: ({ row }: TableCell<CommissionData>) => (
            <a href={`/commissions/clinicians/commissions-information/${row.original.clinician_id}`} className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">View</a>
        ) },
    ], []);

    const handleSeverSideProcessing = async ({ page, count, sortby = "ASC", startDate, endDate }: {
        page: number; count: number; sortby?: string; startDate: string; endDate: string;
    }) => {
        try {
            const response = await customFetch(`clinician/anal/commissions/range?startDate=${startDate}&endDate=${endDate}&page=${page}&count=${count}${sortby ? `&sortby=${sortby}` : ""}`);
            if (!response?.success || !Array.isArray(response.data)) return { result: [], error: true };
            return { result: response.data, error: false };
        } catch {
            return { result: [], error: true };
        }
    };

    const clinicians = useMemo(() => {
        const grouped = new Map<number, CommissionData>();
        for (const record of commissionData) {
            const previous = grouped.get(record.clinician_id);
            grouped.set(record.clinician_id, previous ? {
                ...previous,
                total_services: previous.total_services + record.total_services,
                earned_revenue: String(Number(previous.earned_revenue) + Number(record.earned_revenue)),
                cash_collected: String(Number(previous.cash_collected) + Number(record.cash_collected)),
                commission_earned_total: String(Number(previous.commission_earned_total) + Number(record.commission_earned_total)),
            } : { ...record });
        }
        return Array.from(grouped.values());
    }, [commissionData]);

    const known = !loading && !error;
    const amount = (key: "earned_revenue" | "cash_collected" | "commission_earned_total") =>
        known ? currencyFormatter.format(commissionData.reduce((sum, row) => sum + Number(row[key]), 0)) : "—";

    return (
        <div className={styles.container} aria-busy={loading}>
            <header className="mb-3">
                <h1 className={styles.title}>Clinician commissions</h1>
                <p className="small text-muted mb-0">{dayjs(startDate).format("D MMM YYYY")} – {dayjs(endDate).format("D MMM YYYY")}</p>
            </header>
            {error && <ErrorState message={error} onRetry={() => setReloadKey(key => key + 1)} />}
            {exportError && <ErrorState message={exportError} />}
            <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6 col-xl-3"><SummaryMetric title="Commission earned" value={amount("commission_earned_total")} subtitle="In initially loaded records" Icon={RiMoneyDollarCircleLine} variant="primary" /></div>
                <div className="col-12 col-sm-6 col-xl-3"><SummaryMetric title="Service value" value={amount("earned_revenue")} subtitle="In initially loaded records" Icon={RiServiceLine} variant="info" /></div>
                <div className="col-12 col-sm-6 col-xl-3"><SummaryMetric title="Collected" value={amount("cash_collected")} subtitle="Service payments in loaded records" Icon={RiMoneyDollarCircleLine} variant="success" /></div>
                <div className="col-12 col-sm-6 col-xl-3"><SummaryMetric title="Clinicians" value={known ? clinicians.length.toLocaleString() : "—"} subtitle="With initially loaded commissions" Icon={RiUserLine} variant="secondary" /></div>
            </div>
            <div className={styles.toolbar}>
                <PeriodFilter value={dateFilter} onChange={setDateFilter} disabled={loading} onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={loading} onClick={() => setReloadKey(key => key + 1)}>Refresh</button>
                <button type="button" className="btn btn-outline-primary btn-sm" disabled={!known || !commissionData.length || exporting} onClick={async () => {
                    setExporting(true);
                    setExportError(null);
                    try { await exportClinicianCommissionDataToPDF(commissionData, startDate, endDate); }
                    catch { setExportError("Unable to export the commission report. Please try again."); }
                    finally { setExporting(false); }
                }}>{exporting ? "Exporting…" : "Export loaded records PDF"}</button>
            </div>
            {loading ? <LoadingState /> : !error && (
                <>
                    <p className="small text-muted">Summary and export cover {commissionData.length.toLocaleString()} initially loaded records. Table search covers the displayed page.</p>
                    {!!clinicians.length && <details className="mb-3">
                        <summary className="fw-semibold mb-2">By clinician ({clinicians.length.toLocaleString()})</summary>
                        <PrimeTable column={columns} data={clinicians} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={undefined} />
                    </details>}
                    <h2 className="h6 mb-2">Commission records</h2>
                    <PrimeTable key={`${startDate}-${endDate}-${reloadKey}`} column={columns} data={commissionData} filtering={true} urlparams={{ startDate, endDate }} serverSideFiltering={true} handleSeverSideProcessing={handleSeverSideProcessing} />
                </>
            )}
        </div>
    );
}
