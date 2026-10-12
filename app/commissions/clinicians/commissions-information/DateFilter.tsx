"use client";
import React, { useEffect, useId, useState } from "react";
import styles from "./CommissionReport.module.css";

interface DateFilterProps {
    startDate: string;
    endDate: string;
    onFilter: (start: string, end: string) => void;
    loading?: boolean;
}

export default function DateFilter({ startDate, endDate, onFilter, loading }: DateFilterProps) {
    const id = useId();
    const [start, setStart] = useState(startDate);
    const [end, setEnd] = useState(endDate);
    useEffect(() => { setStart(startDate); setEnd(endDate); }, [startDate, endDate]);

    return (
        <form className={styles.toolbar} aria-busy={loading} onSubmit={event => {
            event.preventDefault();
            if (!loading && start && end && start <= end) onFilter(start, end);
        }}>
            <div>
                <label htmlFor={`${id}-start`} className="form-label small">Start date</label>
                <input id={`${id}-start`} type="date" className="form-control form-control-sm" required value={start} onChange={e => setStart(e.target.value)} disabled={loading} />
            </div>
            <div>
                <label htmlFor={`${id}-end`} className="form-label small">End date</label>
                <input id={`${id}-end`} type="date" className="form-control form-control-sm" required min={start} value={end} onChange={e => setEnd(e.target.value)} disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>{loading ? "Filtering…" : "Filter"}</button>
        </form>
    );
}
