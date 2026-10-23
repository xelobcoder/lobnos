"use client";
import React, { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import { customFetch } from "../../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../../components/Auth/useApplicationContext";
import { ErrorState, PeriodFilter } from "../../ClinicianUi";
import { BreakdownData, BreakdownModal, PaidCommissionData, PaymentReport, PaymentSummary } from "../../PaymentReport";
import styles from "../../CommissionReport.module.css";

export default function PaidCommissionsPage(props: { params: Promise<{ clinicianid: string }> }) {
    const params = use(props.params);
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedCommission, setSelectedCommission] = useState<PaidCommissionData | null>(null);
    const [breakdownData, setBreakdownData] = useState<BreakdownData[]>([]);
    const [breakdownLoading, setBreakdownLoading] = useState(true);
    const [breakdownError, setBreakdownError] = useState<string | null>(null);
    const [breakdownKey, setBreakdownKey] = useState(0);
    const [exporting, setExporting] = useState(false);
    const employeeid = useApplication()?.user?.employeeid;
    const generalPdfRef = useRef<HTMLDivElement>(null);
    const breakdownPdfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        const url = `commission-payments/commission/batch/information?recipient_type=clinician&recipient_id=${encodeURIComponent(params.clinicianid)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&&employeeid=${encodeURIComponent(employeeid || "")}`;
        customFetch(url).then(response => {
            if (!(response?.success || response?.status === true || response?.status === "success") || !Array.isArray(response.data)) throw new Error("Unable to load paid commissions.");
            if (active) setPaidCommissions(response.data);
        }).catch((err: Error) => { if (active) setError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [params.clinicianid, startDate, endDate, employeeid, reloadKey]);

    useEffect(() => {
        if (!selectedCommission) return;
        let active = true;
        setBreakdownLoading(true);
        setBreakdownError(null);
        setBreakdownData([]);
        customFetch(`commission-payments/commission/batch/information/${selectedCommission.id}/batch?employeeid=${employeeid}`)
            .then(response => {
                if (response?.status !== true || !Array.isArray(response.data)) throw new Error("Unable to load commission breakdown.");
                if (active) setBreakdownData(response.data);
            }).catch((err: Error) => { if (active) setBreakdownError(err.message); })
            .finally(() => { if (active) setBreakdownLoading(false); });
        return () => { active = false; };
    }, [selectedCommission, employeeid, breakdownKey]);

    const exportPdf = async (element: HTMLElement | null, fileName: string) => {
        if (!element || exporting) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2, useCORS: true, backgroundColor: null,
                ignoreElements: node => node.classList.contains("no-print") || node.className?.toString().includes("controlBar"),
                onclone: (_document, clonedElement) => {
                    clonedElement.querySelectorAll<HTMLElement>("div").forEach(node => {
                        node.style.overflow = "visible";
                        node.style.minHeight = "0";
                    });
                    clonedElement.style.width = `${Math.max(element.scrollWidth, ...Array.from(element.querySelectorAll<HTMLElement>("table")).map(table => table.scrollWidth))}px`;
                },
            });
            const pdf = new jsPDF("p", "mm", "a4");
            const img = canvas.toDataURL("image/png");
            const width = pdf.internal.pageSize.getWidth() - 20;
            const pageHeight = pdf.internal.pageSize.getHeight() - 20;
            const height = canvas.height * width / canvas.width;
            for (let offset = 0; offset < height; offset += pageHeight) {
                if (offset) pdf.addPage();
                pdf.addImage(img, "PNG", 10, 10 - offset, width, height);
            }
            pdf.save(fileName);
        } catch {
            toast.error("Unable to generate PDF. Please try again.");
        } finally { setExporting(false); }
    };

    return (
        <div className={styles.container} aria-busy={loading}>
            <header className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className={styles.title}>Paid clinician commissions</h1>
                <Link href={`/commissions/clinicians/commissions-information/${params.clinicianid}`} className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">Update Commission Records</Link>
            </header>
            {error && <ErrorState message={error} onRetry={() => setReloadKey(key => key + 1)} />}
            <PaymentSummary data={paidCommissions} loading={loading} error={error} />
            <div className={styles.toolbar}>
                <PeriodFilter value={dateFilter} onChange={setDateFilter} disabled={loading} onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                <button className="btn btn-outline-secondary btn-sm" type="button" disabled={loading} onClick={() => setReloadKey(key => key + 1)}>Refresh</button>
                <button className="btn btn-outline-secondary btn-sm" type="button" disabled={loading} onClick={() => { setDateFilter("This Year"); setStartDate(dayjs().startOf("year").format("YYYY-MM-DD")); setEndDate(dayjs().format("YYYY-MM-DD")); }}>Reset</button>
            </div>
            <PaymentReport data={paidCommissions} startDate={startDate} endDate={endDate} loading={loading} error={error} onBreakdown={record => { setBreakdownLoading(true); setSelectedCommission(record); }} reportRef={generalPdfRef} actions={<>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={exporting || !paidCommissions.length} onClick={() => exportPdf(generalPdfRef.current, `commission-payments-${params.clinicianid}-${startDate}-${endDate}.pdf`)}>{exporting ? "Exporting…" : "Download PDF"}</button>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => window.print()}>Print</button>
            </>} />
            <BreakdownModal selected={selectedCommission} onHide={() => setSelectedCommission(null)} data={breakdownData} loading={breakdownLoading} error={breakdownError} onRetry={() => setBreakdownKey(key => key + 1)} reportRef={breakdownPdfRef} actions={
                <button type="button" className="btn btn-outline-primary btn-sm" disabled={exporting} onClick={() => exportPdf(breakdownPdfRef.current, `commission-breakdown-${selectedCommission?.batch_reference || "details"}.pdf`)}>{exporting ? "Exporting…" : "Download Breakdown PDF"}</button>
            } />
        </div>
    );
}
