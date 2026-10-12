"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiFileList3Line, RiMoneyDollarCircleLine } from "@remixicon/react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import Loader from "../../../components/accessories/Loader";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import styles from "./organizations.module.css";

export type TableCell<T> = { row: { original: T } };
export type Pagination = { page: number; count: number; sortby?: string };
export type ListResult<T> = { result: T[]; error: string | false };
type RowStyling<T> = { type: "custom"; getRowClassName: (record: T, index: number) => string };

// A failed response must never become a successful empty report.
export function reportRecords<T>(response: {
    status?: boolean | string; success?: boolean; message?: string;
    result?: T[]; data?: T[];
} | null, field: "data" | "result"): T[] {
    if (!response || response.status === false || response.success === false ||
        (typeof response.status === "string" && response.status !== "success") ||
        !Array.isArray(response[field])) {
        throw new Error(response?.message || "Unable to load commission records.");
    }
    return response[field]!;
}

export function useOrganizationReport<T>(retrieve: () => Promise<T[]>) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const request = useRef(0);
    const invalidate = useCallback(() => { request.current++; }, []);
    const refresh = useCallback(async () => {
        const id = ++request.current;
        setLoading(true);
        setError(null);
        try {
            const records = await retrieve();
            if (id !== request.current) return;
            setData(records);
            setRevision(value => value + 1);
        } catch (failure) {
            if (id !== request.current) return;
            setData([]);
            setError(failure instanceof Error ? failure.message : "Unable to load commission records.");
        } finally {
            if (id === request.current) setLoading(false);
        }
    }, [retrieve]);
    useEffect(() => {
        void refresh();
        return invalidate;
    }, [refresh, invalidate]);
    return { data, loading, error, refresh, revision };
}

export function SummaryMetric({ title, value, subtitle, variant, financial = false }: {
    title: string; value: number | null; subtitle: string;
    variant: "primary" | "success" | "secondary" | "info"; financial?: boolean;
}) {
    const Icon = financial ? RiMoneyDollarCircleLine : RiFileList3Line;
    const formattedValue = value === null ? "—" : financial
        ? currencyFormatter.format(value) : value.toLocaleString();
    return <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
        <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                <Icon size={22} className="opacity-75" aria-hidden="true" />
            </div>
            <h3 className="fw-bold mb-0">{formattedValue}</h3>
            <span className="text-xs opacity-75">{subtitle}</span>
        </div>
    </div>;
}

export function ReportState({ loading, error, retry }: {
    loading: boolean; error: string | null; retry: () => void;
}) {
    if (error) return <div className="alert alert-danger d-flex flex-wrap align-items-center gap-2 mb-3" role="alert">
        <span className="flex-grow-1">{error}</span>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={retry}>Try again</button>
    </div>;
    if (loading) return <div className="d-flex align-items-center gap-2 py-3" role="status">
        <span aria-hidden="true"><Loader color="var(--bs-primary)" /></span>
        Loading commission records…
    </div>;
    return null;
}

export function DateToolbar({ value, onChange, onDateRangeChange, disabled, children }: {
    value: string; onChange: (value: string) => void;
    onDateRangeChange: (start: string, end: string) => void;
    disabled: boolean; children?: React.ReactNode;
}) {
    const filter = useRef<HTMLDivElement>(null);
    // The shared filter does not expose an ID/aria-label prop for its preset select.
    useEffect(() => {
        filter.current?.querySelector("select")?.setAttribute("aria-label", "Commission date range");
    }, []);
    return <div className="row g-2 align-items-end mb-3">
        <div className={`col-12 col-md-6 col-xl-4 ${styles.dateFilter}`} ref={filter}>
            <div className="small fw-semibold mb-1">Commission date range</div>
            <DateFilterReusable value={value} onChange={onChange}
                onDateRangeChange={onDateRangeChange} disabled={disabled} className="w-100" />
        </div>
        <div className={`col-12 col-md-auto d-flex gap-2 flex-wrap ${styles.actions}`}>{children}</div>
    </div>;
}

// Keep v1 and its backend page/count semantics. Its error field is otherwise
// ignored; retain the last successful rows and announce failure locally.
export function OrganizationTable<T>({ data, column, handleSeverSideProcessing, ...props }: {
    data: T[]; column: React.ComponentProps<typeof PrimeTable>["column"];
    handleSeverSideProcessing?: (pagination: Pagination) => Promise<ListResult<T>>;
    filtering?: boolean; urlparams?: Record<string, unknown>;
    rowStyling?: RowStyling<T>;
}) {
    // v1 supports this at runtime, but JS inference narrows its null default.
    const TypedPrimeTable = PrimeTable as unknown as React.ComponentType<
        Omit<React.ComponentProps<typeof PrimeTable>, "rowStyling"> & { rowStyling?: RowStyling<T> }
    >;
    const [error, setError] = useState<string | null>(null);
    const previous = useRef(data);
    const guardedHandler = async (pagination: Pagination) => {
        const response = await handleSeverSideProcessing!(pagination);
        if (response.error) {
            setError(response.error);
            return { result: previous.current, error: response.error };
        }
        setError(null);
        previous.current = response.result;
        return response;
    };
    return <>
        {error && <p className="alert alert-danger" role="alert">
            {error} The last successfully loaded rows remain visible. Retry using the table controls.
        </p>}
        {handleSeverSideProcessing && <p className="small text-muted mb-2">
            Search and column sorting apply to the loaded page only.
        </p>}
        <TypedPrimeTable {...props} data={data} column={column}
            serverSideFiltering={Boolean(handleSeverSideProcessing)}
            handleSeverSideProcessing={handleSeverSideProcessing ? guardedHandler : undefined} />
    </>;
}
