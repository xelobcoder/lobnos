"use client";

import React from "react";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import Loader from "../../../../components/accessories/Loader";
import styles from "./CommissionReport.module.css";

export function SummaryMetric({ title, value, subtitle, Icon, variant }: {
    title: string;
    value: string;
    subtitle: string;
    Icon: React.ElementType;
    variant: "primary" | "success" | "info" | "secondary";
}) {
    return (
        <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-xs text-uppercase fw-semibold opacity-75">{title}</span>
                    <Icon size={22} className="opacity-75" aria-hidden="true" />
                </div>
                <h3 className="fw-bold mb-0">{value}</h3>
                <span className="text-xs opacity-75">{subtitle}</span>
            </div>
        </div>
    );
}

// Keep this compatibility adapter local until the shared filter accepts an id.
// Custom date inputs already have their own accessible names.
export function PeriodFilter(props: React.ComponentProps<typeof DateFilterReusable>) {
    const id = React.useId();
    return (
        <div className={styles.dateFilter} ref={element => {
            const select = element?.querySelector("select");
            if (select) select.id = id;
        }}>
            <label htmlFor={id} className="small fw-semibold d-block mb-1">Period</label>
            <DateFilterReusable {...props} className="w-100" />
        </div>
    );
}

export function LoadingState({ children = "Loading commission records…" }: { children?: React.ReactNode }) {
    return (
        <div className="d-flex align-items-center gap-2 py-3" role="status">
            <Loader color="var(--bs-primary)" />
            <span>{children}</span>
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className={styles.errorBox} role="alert">
            <p className="mb-2">{message}</p>
            {onRetry && <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>Try again</button>}
        </div>
    );
}

export type TableCell<T, V = string> = { value: V; row: { original: T; index: number } };
