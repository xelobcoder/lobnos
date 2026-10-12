"use client";

import React, { useEffect, useRef, useState } from "react";
import { RiFileList3Line, RiMoneyDollarCircleLine } from "@remixicon/react";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import DateFilterReusable from "../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import Loader from "../../components/accessories/Loader";
import { currencyFormatter } from "../../components/Auth/customFetch";

export type Pagination = { page: number; count: number; sortby?: string };
export type TableCell<T> = { row: { original: T } };

export function commissionRecords<T>(response: {
    status?: boolean | string; success?: boolean; data?: T[]; message?: string;
} | null): T[] {
    if (!response || !(response.status === true || response.status === "success" || response.success === true) ||
        !Array.isArray(response.data)) {
        throw new Error(response?.message || "Unable to load commission records.");
    }
    return response.data;
}

export function SummaryMetric({ title, value, financial = false, variant }: {
    title: string; value: number | null; financial?: boolean; variant: "primary" | "success" | "secondary";
}) {
    const Icon = financial ? RiMoneyDollarCircleLine : RiFileList3Line;
    return <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
        <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                <Icon size={22} className="opacity-75" aria-hidden="true" />
            </div>
            <h3 className="fw-bold mb-0">{value === null ? "—" : financial ? currencyFormatter.format(value) : value.toLocaleString()}</h3>
            <span className="text-xs opacity-75">Initial response only · not period totals</span>
        </div>
    </div>;
}

export function PeriodFilter(props: React.ComponentProps<typeof DateFilterReusable>) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        ref.current?.querySelector("select")?.setAttribute("aria-label", "Commission date range");
    }, []);
    return <div ref={ref} className="col-12 col-md-6 col-xl-4">
        <div className="small fw-semibold mb-1">Commission date range</div>
        <DateFilterReusable {...props} className="w-100" />
    </div>;
}

export function ReportState({ loading, error, retry }: {
    loading: boolean; error: string | null; retry: () => void;
}) {
    if (error) return <div className="alert alert-danger d-flex gap-2 flex-wrap align-items-center" role="alert">
        <span className="flex-grow-1">{error}</span>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={retry}>Try again</button>
    </div>;
    if (loading) return <div className="d-flex align-items-center gap-2 py-3" role="status">
        <span aria-hidden="true"><Loader color="var(--bs-primary)" /></span> Loading commission records…
    </div>;
    return null;
}

// Keep v1's pagination contract and last good rows on a failed page request.
// Search and column sorting remain limited to the loaded page.
export function CommissionTable<T>({ data, column, handleSeverSideProcessing }: {
    data: T[]; column: React.ComponentProps<typeof PrimeTable>["column"];
    handleSeverSideProcessing: (pagination: Pagination) => Promise<{ result: T[]; error: string | false }>;
}) {
    const [error, setError] = useState<string | null>(null);
    const lastRows = useRef(data);
    const handler = async (pagination: Pagination) => {
        const response = await handleSeverSideProcessing(pagination);
        if (response.error) {
            setError(response.error);
            return { result: lastRows.current, error: response.error };
        }
        lastRows.current = response.result;
        setError(null);
        return response;
    };
    return <>
        {error && <p className="alert alert-danger" role="alert">
            {error} The last successful rows remain visible. Retry using the table controls.
        </p>}
        <p className="small text-body-secondary mb-2">Search and column sorting apply to the loaded page only.</p>
        <PrimeTable column={column} data={data} filtering serverSideFiltering handleSeverSideProcessing={handler} />
    </>;
}
