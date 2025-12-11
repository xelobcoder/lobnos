"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiArrowUpLine, RiArrowDownLine, RiCalendarEventLine, RiRefreshLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_CURRENT = 'oklch(0.646 0.222 41.116)';
const COLOR_PREVIOUS = 'oklch(0.553 0.196 25.59)';

interface PeriodComparison {
    period_type: string;
    expense_count: number;
    total_amount: number;
    average_amount: number;
    min_amount: number;
    max_amount: number;
    branch_name: string;
}

export default function ExpenseComparisonByPeriod() {
    const [data, setData] = useState<PeriodComparison[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentStartDate, setCurrentStartDate] = useState<string>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    });
    const [currentEndDate, setCurrentEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

    const [previousStartDate, setPreviousStartDate] = useState<string>(() => {
        const now = new Date();
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return prevMonth.toISOString().slice(0, 10);
    });
    const [previousEndDate, setPreviousEndDate] = useState<string>(() => {
        const now = new Date();
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        const lastDayPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
        return lastDayPrevMonth.toISOString().slice(0, 10);
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [branchid, setBranchid] = useState<number | null>(null);
    useApplication();

    const fetchData = async () => {
        if (!branchid) return;
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses-analytics/comparison-by-period?currentStartDate=${currentStartDate}&currentEndDate=${currentEndDate}&previousStartDate=${previousStartDate}&previousEndDate=${previousEndDate}&branchid=${branchid}`;
            const response = await customFetch(endpoint);
            if (response && Array.isArray(response)) {
                setData(response);
            } else {
                setError("Invalid data format received");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        const now = new Date();
        setCurrentStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
        setCurrentEndDate(new Date().toISOString().slice(0, 10));

        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        setPreviousStartDate(prevMonth.toISOString().slice(0, 10));
        const lastDayPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
        setPreviousEndDate(lastDayPrevMonth.toISOString().slice(0, 10));
    };

    useEffect(() => {
        async function fetchBranches() {
            try {
                const response = await customFetch("branches");
                if (response && Array.isArray(response.result)) {
                    setBranches(response.result);
                    if (response.result.length > 0) setBranchid(response.result[0].branchid);
                }
            } catch { }
        }
        fetchBranches();
    }, []);

    useEffect(() => {
        if (branchid) {
            fetchData();
        }
    }, [branchid]);

    const currentPeriod = data.find(item => item.period_type === 'current_period');
    const previousPeriod = data.find(item => item.period_type === 'previous_period');

    const chartData = [
        {
            metric: 'Total Amount',
            current: currentPeriod?.total_amount || 0,
            previous: previousPeriod?.total_amount || 0,
            change: currentPeriod && previousPeriod ?
                ((currentPeriod.total_amount - previousPeriod.total_amount) / previousPeriod.total_amount * 100) : 0
        },
        {
            metric: 'Expense Count',
            current: currentPeriod?.expense_count || 0,
            previous: previousPeriod?.expense_count || 0,
            change: currentPeriod && previousPeriod ?
                ((currentPeriod.expense_count - previousPeriod.expense_count) / previousPeriod.expense_count * 100) : 0
        },
        {
            metric: 'Average Amount',
            current: currentPeriod?.average_amount || 0,
            previous: previousPeriod?.average_amount || 0,
            change: currentPeriod && previousPeriod ?
                ((currentPeriod.average_amount - previousPeriod.average_amount) / previousPeriod.average_amount * 100) : 0
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const changePercent = data.change.toFixed(1);
            const isPositive = data.change >= 0;

            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        borderColor: COLOR_BORDER,
                        minWidth: '200px',
                        fontSize: '0.85rem',
                        color: 'var(--bs-body-color)'
                    }}
                >
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Metric</span>
                        <span className="fw-bold d-block">{label}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Current Period</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_CURRENT }}>
                            {label === 'Expense Count' ? data.current : currencyFormatter.format(data.current)}
                        </span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Previous Period</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_PREVIOUS }}>
                            {label === 'Expense Count' ? data.previous : currencyFormatter.format(data.previous)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Change</span>
                        <span className={`fw-bold d-block ${isPositive ? 'text-success' : 'text-danger'}`}>
                            {isPositive ? <RiArrowUpLine size={12} className="me-1" /> : <RiArrowDownLine size={12} className="me-1" />}
                            {changePercent}%
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        Expense Comparison by Period
                    </h2>
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-1 px-3 py-2 btn-sm"
                        style={{ borderColor: COLOR_BORDER, color: COLOR_TEXT_MUTED, fontWeight: 500, fontSize: '0.85rem' }}
                        onClick={handleResetFilters}
                        title="Reset filters to default"
                    >
                        <RiRefreshLine size={16} />
                        Reset
                    </button>
                </div>
                <div className="row g-3">
                    <div className="col-lg-2 col-md-3">
                        <label className="form-label fw-medium mb-2" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.85rem' }}>Branch</label>
                        <select
                            className="form-select"
                            value={branchid ?? ''}
                            onChange={e => setBranchid(Number(e.target.value))}
                        >
                            {branches.map(branch => (
                                <option key={branch.branchid} value={branch.branchid}>{branch.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-lg-2 col-md-3">
                        <label className="form-label fw-medium mb-2" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.85rem' }}>Current Start</label>
                        <div className="input-group">
                            <input
                                type="date"
                                className="form-control"
                                value={currentStartDate}
                                onChange={e => setCurrentStartDate(e.target.value)}
                            />
                            <span className="input-group-text" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                <RiCalendarEventLine size={16} style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-3">
                        <label className="form-label fw-medium mb-2" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.85rem' }}>Current End</label>
                        <div className="input-group">
                            <input
                                type="date"
                                className="form-control"
                                value={currentEndDate}
                                onChange={e => setCurrentEndDate(e.target.value)}
                            />
                            <span className="input-group-text" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                <RiCalendarEventLine size={16} style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-3">
                        <label className="form-label fw-medium mb-2" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.85rem' }}>Previous Start</label>
                        <div className="input-group">
                            <input
                                type="date"
                                className="form-control"
                                value={previousStartDate}
                                onChange={e => setPreviousStartDate(e.target.value)}
                            />
                            <span className="input-group-text" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                <RiCalendarEventLine size={16} style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-3">
                        <label className="form-label fw-medium mb-2" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.85rem' }}>Previous End</label>
                        <div className="input-group">
                            <input
                                type="date"
                                className="form-control"
                                value={previousEndDate}
                                onChange={e => setPreviousEndDate(e.target.value)}
                            />
                            <span className="input-group-text" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                <RiCalendarEventLine size={16} style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-3 d-flex align-items-end">
                        <button
                            className="btn btn-primary d-flex align-items-center gap-1 px-4 py-2 w-100"
                            style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, fontWeight: 500, fontSize: '0.85rem', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)' }}
                            onClick={fetchData}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RiLoader4Line size={16} className="animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <RiBarChartBoxLine size={16} />
                                    Compare
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                        <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                        <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading comparison data...</p>
                    </div>
                ) : error ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                        <h5 className="fw-medium mb-1">Error Loading Data</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                        <h5 className="fw-medium mb-1">No Data Available</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                            No expense data for the selected periods.
                        </p>
                    </div>
                ) : (
                    <div style={{ width: "100%", height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 45 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => value >= 1000 ? currencyFormatter.format(value) : value} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                <Legend />
                                <Bar dataKey="current" name="Current Period" fill={COLOR_CURRENT} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="previous" name="Previous Period" fill={COLOR_PREVIOUS} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            {data.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fs-6 fw-medium mb-0">Period Comparison Details</h4>
                        <button
                            className="btn btn-outline-primary d-flex align-items-center gap-1 px-3 py-2 btn-sm"
                            style={{ borderColor: COLOR_ACCENT, color: COLOR_ACCENT, fontWeight: 500, fontSize: '0.85rem' }}
                            onClick={() => window.print()}
                            title="Print this report"
                        >

                            Print
                        </button>
                    </div>
                    <div className="print-date-range mb-3" style={{ display: 'none' }}>
                        <p className="mb-1 fw-medium">Report Period:</p>
                        <p className="mb-0 text-muted">
                            Current Period: {currentStartDate} to {currentEndDate} |
                            Previous Period: {previousStartDate} to {previousEndDate}
                        </p>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Period</th>
                                    <th scope="col" className="py-2">Branch</th>
                                    <th scope="col" className="py-2 text-end">Total Amount</th>
                                    <th scope="col" className="py-2 text-end">Expense Count</th>
                                    <th scope="col" className="py-2 text-end">Average Amount</th>
                                    <th scope="col" className="py-2 text-end">Min Amount</th>
                                    <th scope="col" className="py-2 text-end">Max Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((period, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 fw-medium">
                                            {period.period_type === 'current_period' ? 'Current Period' : 'Previous Period'}
                                        </td>
                                        <td className="py-2">{period.branch_name}</td>
                                        <td className="py-2 text-end fw-medium">{currencyFormatter.format(period.total_amount)}</td>
                                        <td className="py-2 text-end">{period.expense_count}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(period.average_amount)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(period.min_amount)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(period.max_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color);
                }
                
                @media print {
                    .card-header {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    .print-date-range {
                        display: block !important;
                    }
                    .btn {
                        display: none !important;
                    }
                    .table-responsive {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    .printable-table-with-borders {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    .printable-table-with-borders th,
                    .printable-table-with-borders td {
                        border: 1px solid #dee2e6 !important;
                        padding: 0.5rem !important;
                        font-size: 12px !important;
                    }
                    .printable-table-with-borders thead th {
                        background-color: #f8f9fa !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                        font-weight: 600 !important;
                    }
                    .printable-table-with-borders tbody tr:nth-child(even) {
                        background-color: #f8f9fa !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    .printable-table-with-borders tbody tr:nth-child(odd) {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}