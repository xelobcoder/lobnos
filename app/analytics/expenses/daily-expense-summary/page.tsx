"use client";

import React, { useEffect, useState } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface DailyExpenseSummary {
    branch_name: string;
    day: string;
    total_spent: string;
    total_records: number;
}

const currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: "GHS", maximumFractionDigits: 2 });

export default function DailyExpenseSummary() {
    const [data, setData] = useState<DailyExpenseSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("2021-10-01");
    const [endDate, setEndDate] = useState("2025-10-09");

    const { branchid, user } = useApplication();
    const employeeid = user?.employeeid;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses-analytics/daily-expense-summary?branchid=${branchid}&&employeeid=${employeeid}&&tenantId=3&&startDate=${startDate}&&endDate=${endDate}`;
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

    useEffect(() => {
        if (branchid && employeeid) {
            fetchData();
        }
        // eslint-disable-next-line
    }, [branchid, employeeid]);

    const chartData = data.map(item => ({
        ...item,
        total_spent: parseFloat(item.total_spent),
        dayLabel: new Date(item.day).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    }));

    const totalSpentSum = chartData.reduce((sum, entry) => sum + entry.total_spent, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload;
            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        borderColor: COLOR_BORDER,
                        minWidth: '180px',
                        fontSize: '0.85rem',
                        color: 'var(--bs-body-color)'
                    }}
                >
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
                        <span className="fw-bold d-block">{entry.dayLabel}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Spent</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(entry.total_spent)}</span>
                    </div>
                    <div>
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Records</span>
                        <span className="fw-bold d-block">{entry.total_records}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                    Daily Expense Summary
                </h2>
                <div className="mt-3 d-flex flex-wrap gap-3">
                    <div>
                        <label className="me-2">Start Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{ minWidth: 140 }}
                        />
                    </div>
                    <div>
                        <label className="me-2">End Date:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            style={{ minWidth: 140 }}
                        />
                    </div>
                    <button
                        className="btn btn-primary ms-2 d-flex align-items-center gap-2 px-3 py-1 btn-sm"
                        style={{backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, minWidth: 90, fontWeight: 500, fontSize: '0.95rem', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)'}}
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
                                <RiBarChartBoxLine size={15} />
                                Load Data
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                        <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                        <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                        <h5 className="fw-medium mb-1">Error Loading Data</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                        <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                        <h5 className="fw-medium mb-1">No Data Available</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                            No daily expense data for the selected period or branch.
                        </p>
                    </div>
                ) : (
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 45 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                <XAxis dataKey="dayLabel" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                <Legend />
                                <Bar dataKey="total_spent" name="Total Spent" fill={COLOR_ACCENT} radius={[8,8,0,0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            {chartData.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${COLOR_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Daily Expense Table</h4>
                    <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Date</th>
                                    <th scope="col" className="py-2">Branch</th>
                                    <th scope="col" className="py-2 text-end">Total Spent</th>
                                    <th scope="col" className="py-2 text-end">Records</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2">{entry.dayLabel}</td>
                                        <td className="py-2">{entry.branch_name}</td>
                                        <td className="py-2 text-end fw-medium">{currencyFormatter.format(entry.total_spent)}</td>
                                        <td className="py-2 text-end">{entry.total_records}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="fw-bold border-top">
                                    <td className="py-2">Total</td>
                                    <td className="py-2"></td>
                                    <td className="py-2 text-end">{currencyFormatter.format(totalSpentSum)}</td>
                                    <td className="py-2 text-end">{chartData.reduce((sum, entry) => sum + entry.total_records, 0)}</td>
                                </tr>
                            </tfoot>
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
            `}</style>
        </div>
    );
}
