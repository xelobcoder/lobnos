"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiArrowUpLine, RiArrowDownLine, RiCalendarEventLine, RiRefreshLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_CURRENT = 'oklch(0.646 0.222 41.116)';
const COLOR_PREVIOUS = 'oklch(0.553 0.196 25.59)';

interface PeriodComparison {
    period: string;
    total_expenses: string;
    expense_count: number;
    avg_expense_amount: string;
}

export default function ExpenseComparisonByPeriod() {
    const [data, setData] = useState<PeriodComparison[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentStartDate, setCurrentStartDate] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-01-01`;
    });
    const [currentEndDate, setCurrentEndDate] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-06-30`;
    });

    const [previousStartDate, setPreviousStartDate] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-07-01`;
    });
    const [previousEndDate, setPreviousEndDate] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-12-31`;
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [branchid, setBranchid] = useState<number | null>(null);
    useApplication();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses/analytics/comparison?currentStart=${currentStartDate}&currentEnd=${currentEndDate}&previousStart=${previousStartDate}&previousEnd=${previousEndDate}&branchid=${branchid}`;
            const response = await customFetch(endpoint);
            const { data } = response;
            if (response && data && Array.isArray(data)) {
                setData(data);
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
        setCurrentStartDate(`${now.getFullYear()}-01-01`);
        setCurrentEndDate(`${now.getFullYear()}-06-30`);
        setPreviousStartDate(`${now.getFullYear()}-07-01`);
        setPreviousEndDate(`${now.getFullYear()}-12-31`);
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
       fetchData();
    }, []);

    const currentPeriod = data.find(item => item.period === 'current');
    const previousPeriod = data.find(item => item.period === 'previous');

    const chartData = [
        {
            label: 'Current\nTotal',
            value: parseFloat(currentPeriod?.total_expenses || '0'),
            type: 'total',
            color: COLOR_CURRENT
        },
        {
            label: 'Current\nCount',
            value: currentPeriod?.expense_count || 0,
            type: 'count',
            color: COLOR_PREVIOUS
        },
        {
            label: 'Previous\nTotal',
            value: parseFloat(previousPeriod?.total_expenses || '0'),
            type: 'total',
            color: COLOR_CURRENT
        },
        {
            label: 'Previous\nCount',
            value: previousPeriod?.expense_count || 0,
            type: 'count',
            color: COLOR_PREVIOUS
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            return (
                <div className="rounded-lg border p-2 shadow-sm"
                    style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                    <div className="mb-2">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Period & Metric</span>
                        <span className="fw-bold d-block" style={{ color: 'var(--bs-body-color)' }}>{label}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Value</span>
                        <span className="fw-bold d-block" style={{ color: data.color }}>
                            {data.type === 'count' ? data.value : currencyFormatter.format(data.value)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header p-4 bg-white">
                <h4 className="fs-5 fw-medium mb-0">Comparative Expense Analysis By Period</h4>
            </div>
            <div className="card-header py-3 px-4 bg-white d-flex align-items-center" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4">

                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        {/* Branch Selector */}
                        <select
                            className="form-select form-select-sm"
                            value={branchid ?? ''}
                            onChange={e => setBranchid(Number(e.target.value))}
                            style={{ flexBasis: '200px', minWidth: '180px' }}
                        >
                            <option value="" >Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch.branchid} value={branch.branchid}>{branch.name}</option>
                            ))}
                        </select>

                        {/* Current Period */}
                        <div className="d-flex gap-2 align-items-center">
                            <span className="text-muted fw-medium" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Current:</span>
                            <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                    <RiCalendarEventLine size={14} className="text-muted" />
                                </span>
                                <input
                                    type="date"
                                    className="form-control shadow-none border-start-0"
                                    value={currentStartDate}
                                    onChange={e => setCurrentStartDate(e.target.value)}
                                />
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>to</span>
                            <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                    <RiCalendarEventLine size={14} className="text-muted" />
                                </span>
                                <input
                                    type="date"
                                    className="form-control shadow-none border-start-0"
                                    value={currentEndDate}
                                    onChange={e => setCurrentEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Previous Period */}
                        <div className="d-flex gap-2 align-items-center">
                            <span className="text-muted fw-medium" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Previous:</span>
                            <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                    <RiCalendarEventLine size={14} className="text-muted" />
                                </span>
                                <input
                                    type="date"
                                    className="form-control shadow-none border-start-0"
                                    value={previousStartDate}
                                    onChange={e => setPreviousStartDate(e.target.value)}
                                />
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>to</span>
                            <div className="input-group input-group-sm" style={{ flexBasis: '140px', minWidth: '130px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                    <RiCalendarEventLine size={14} className="text-muted" />
                                </span>
                                <input
                                    type="date"
                                    className="form-control shadow-none border-start-0"
                                    value={previousEndDate}
                                    onChange={e => setPreviousEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center gap-1 px-3 py-2 btn-sm"
                            style={{ borderColor: COLOR_BORDER, color: COLOR_TEXT_MUTED, fontWeight: 500, fontSize: '0.85rem' }}
                            onClick={handleResetFilters}
                            title="Reset filters to default"
                        >
                            <RiRefreshLine size={16} />
                            Reset
                        </button>
                        <button
                            className="btn btn-primary d-flex align-items-center gap-1 px-4 py-2 btn-sm"
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
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={chartData}
                                margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tickFormatter={(value: string) => value}
                                    angle={0}
                                    textAnchor="middle"
                                    height={40}
                                    interval={0}
                                    tick={{ fontSize: 10, fill: COLOR_TEXT_MUTED }}
                                    axisLine={{ stroke: COLOR_BORDER }}
                                    tickLine={{ stroke: COLOR_BORDER }}
                                />
                                <YAxis
                                    tickFormatter={(value: number, index: number) => {
                                        const item = chartData[index];
                                        return item?.type === 'count' ? value.toString() : currencyFormatter.format(value);
                                    }}
                                    tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={95}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
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
                                    <th scope="col" className="py-2 text-start">Metric</th>
                                    <th scope="col" className="py-2 text-start">Value</th>
                                    <th scope="col" className="py-2 text-start">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 fw-medium text-start">{item.label.replace('\n', ' ')}</td>
                                        <td className="py-2 fw-medium text-start">
                                            {item.type === 'count' ? item.value : currencyFormatter.format(item.value)}
                                        </td>
                                        <td className="py-2 text-start">{item.type}</td>
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