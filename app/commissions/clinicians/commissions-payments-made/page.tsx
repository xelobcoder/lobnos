"use client";
import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { customFetch } from "../../../../components/Auth/customFetch";
import { ErrorState, PeriodFilter } from "../commissions-information/ClinicianUi";
import { BreakdownData, BreakdownModal, PaidCommissionData, PaymentReport, PaymentSummary } from "../commissions-information/PaymentReport";
import styles from "../commissions-information/CommissionReport.module.css";

interface Recipient { id: number; name: string }

export default function PaidCommissionsPaymentMadePage() {
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clinicians, setClinicians] = useState<Recipient[]>([]);
    const [organizations, setOrganizations] = useState<Recipient[]>([]);
    const [selectedClinician, setSelectedClinician] = useState<number | null>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);
    const [cliniciansLoading, setCliniciansLoading] = useState(false);
    const [organizationsLoading, setOrganizationsLoading] = useState(false);
    const [recipientError, setRecipientError] = useState<string | null>(null);
    const [selectedCommission, setSelectedCommission] = useState<PaidCommissionData | null>(null);
    const [breakdownData, setBreakdownData] = useState<BreakdownData[]>([]);
    const [breakdownLoading, setBreakdownLoading] = useState(true);
    const [breakdownError, setBreakdownError] = useState<string | null>(null);
    const [breakdownKey, setBreakdownKey] = useState(0);
    // Draft controls must not relabel a report until Load succeeds.
    const [appliedPeriod, setAppliedPeriod] = useState({ startDate, endDate });

    const loadData = useCallback(async (start: string, end: string, clinician: number | null, organization: number | null) => {
        setLoading(true);
        setError(null);
        try {
            let url = `commission-payments/commission/batch/information?&startDate=${dayjs(start).format("YYYY-MM-DD")}&endDate=${dayjs(end).format("YYYY-MM-DD")}`;
            if (clinician) url += `&recipient_id=${clinician}&recipient_type=clinician`;
            else if (organization) url += `&recipient_id=${organization}&recipient_type=organization`;
            const response = await customFetch(url);
            if (!(response?.success || response?.status === true || response?.status === "success") || !Array.isArray(response.data)) throw new Error("Unable to load commission payments.");
            setPaidCommissions(response.data);
            setAppliedPeriod({ startDate: start, endDate: end });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load commission payments.");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        loadData(dayjs().startOf("year").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD"), null, null);
    }, [loadData]);

    const loadRecipients = async (kind: "clinician" | "organization") => {
        const setPending = kind === "clinician" ? setCliniciansLoading : setOrganizationsLoading;
        if (kind === "clinician" ? cliniciansLoading : organizationsLoading) return;
        setPending(true);
        setRecipientError(null);
        try {
            const response = await customFetch(kind === "clinician" ? "clinicians" : "organizations/details");
            if (!Array.isArray(response?.result)) throw new Error(`Unable to load ${kind} options.`);
            (kind === "clinician" ? setClinicians : setOrganizations)(response.result);
            if (!response.result.length) setRecipientError(`No ${kind} options were returned.`);
        } catch (err) {
            setRecipientError(err instanceof Error ? err.message : "Unable to load recipients.");
        } finally { setPending(false); }
    };

    useEffect(() => {
        if (!selectedCommission) return;
        let active = true;
        setBreakdownLoading(true);
        setBreakdownError(null);
        setBreakdownData([]);
        const { id, recipient_id, recipient_type, start_date, end_date } = selectedCommission;
        const url = `commission-payments/commission/batch/information/${id}/batch?startDate=${dayjs(start_date).format("YYYY-MM-DD")}&endDate=${dayjs(end_date).format("YYYY-MM-DD")}&recipient_id=${recipient_id}&recipient_type=${recipient_type}`;
        customFetch(url).then(response => {
            if (response?.status !== true || !Array.isArray(response.data)) throw new Error("Unable to load commission breakdown.");
            if (active) setBreakdownData(response.data);
        }).catch((err: Error) => { if (active) setBreakdownError(err.message); })
            .finally(() => { if (active) setBreakdownLoading(false); });
        return () => { active = false; };
    }, [selectedCommission, breakdownKey]);

    return (
        <div className={styles.container} aria-busy={loading}>
            <header className="mb-3"><h1 className={styles.title}>Commission payments made</h1><p className="small text-muted mb-0">Review returned payment batches and their service allocations.</p></header>
            {error && <ErrorState message={error} onRetry={() => loadData(startDate, endDate, selectedClinician, selectedOrganization)} />}
            <PaymentSummary data={paidCommissions} loading={loading} error={error} />
            {recipientError && <ErrorState message={recipientError} />}
            <div className="row g-2 align-items-end mb-3">
                <div className="col-12 col-md-6">
                    <label className="form-label small" htmlFor="commission-clinician">Clinician</label>
                    <div className="d-flex gap-2">
                        <select id="commission-clinician" className="form-select form-select-sm" value={selectedClinician ?? ""} disabled={loading || cliniciansLoading || !clinicians.length} onChange={e => { setSelectedClinician(Number(e.target.value) || null); setSelectedOrganization(null); }}>
                            <option value="">All clinicians</option>{clinicians.map(record => <option key={record.id} value={record.id}>{record.name}</option>)}
                        </select>
                        <button type="button" className="btn btn-outline-secondary btn-sm flex-shrink-0" disabled={cliniciansLoading || loading} onClick={() => loadRecipients("clinician")}>{cliniciansLoading ? "Loading…" : "Load clinicians"}</button>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label small" htmlFor="commission-organization">Organization</label>
                    <div className="d-flex gap-2">
                        <select id="commission-organization" className="form-select form-select-sm" value={selectedOrganization ?? ""} disabled={loading || organizationsLoading || !organizations.length} onChange={e => { setSelectedOrganization(Number(e.target.value) || null); setSelectedClinician(null); }}>
                            <option value="">All organizations</option>{organizations.map(record => <option key={record.id} value={record.id}>{record.name}</option>)}
                        </select>
                        <button type="button" className="btn btn-outline-secondary btn-sm flex-shrink-0" disabled={organizationsLoading || loading} onClick={() => loadRecipients("organization")}>{organizationsLoading ? "Loading…" : "Load organizations"}</button>
                    </div>
                </div>
            </div>
            <div className={styles.toolbar}>
                <PeriodFilter value={dateFilter} onChange={setDateFilter} disabled={loading} onDateRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} />
                <button type="button" className="btn btn-primary btn-sm" disabled={loading} onClick={() => loadData(startDate, endDate, selectedClinician, selectedOrganization)}>{loading ? "Loading…" : "Load"}</button>
                <button type="button" className="btn btn-outline-secondary btn-sm" disabled={loading} onClick={() => {
                    const start = dayjs().startOf("year").format("YYYY-MM-DD"), end = dayjs().format("YYYY-MM-DD");
                    setStartDate(start); setEndDate(end); setDateFilter("This Year"); setSelectedClinician(null); setSelectedOrganization(null);
                    loadData(start, end, null, null);
                }}>Reset</button>
            </div>
            <PaymentReport data={paidCommissions} {...appliedPeriod} loading={loading} error={error} onBreakdown={record => { setBreakdownLoading(true); setSelectedCommission(record); }} actions={<button type="button" className="btn btn-outline-primary btn-sm" onClick={() => window.print()}>Print</button>} />
            <BreakdownModal selected={selectedCommission} onHide={() => setSelectedCommission(null)} data={breakdownData} loading={breakdownLoading} error={breakdownError} onRetry={() => setBreakdownKey(key => key + 1)} extended />
        </div>
    );
}
