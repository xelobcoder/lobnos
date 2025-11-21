"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface YearlyExpenseData {
    year: number;
    total_expenses: number;
    total_amount: string;
    average_amount: string;
    min_amount: number;
    max_amount: number;
    unique_categories: number;
    unique_employees: number;
    unique_merchants: number;
    active_months: number;
    employee_usernames: string;
    employee_roles: string;
    branch_name: string;
}

export default function YearlyExpenseSummary() {
    const [data, setData] = useState<YearlyExpenseData[]>([]);
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
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - 2; // Default to last 3 years
            const endYear = currentYear;
            const endpoint = `expenses-analytics/yearly?branchid=${branchid}&startYear=${startYear}&endYear=${endYear}`;
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
        if (branchid) {
            fetchData();
        }
        // eslint-disable-next-line
    }, [branchid]);

    const chartData = data.map(item => ({
        ...item,
        total_amount: parseFloat(item.total_amount),
        average_amount: parseFloat(item.average_amount),
        yearLabel: item.year.toString()
    }));

    const totalAmountSum = chartData.reduce((sum, entry) => sum + entry.total_amount, 0);
    const totalExpensesSum = chartData.reduce((sum, entry) => sum + entry.total_expenses, 0);

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
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Year</span>
                        <span className="fw-bold d-block">{entry.yearLabel}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Amount</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(entry.total_amount)}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Expenses</span>
                        <span className="fw-bold d-block">{entry.total_expenses}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Active Months</span>
                        <span className="fw-bold d-block">{entry.active_months}</span>
                    </div>
                    <div>
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Employee</span>
                        <span className="fw-bold d-block">{entry.employee_usernames} ({entry.employee_roles})</span>
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
                    Yearly Expense Summary
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
                        className="btn btn-primary ms-2 d-flex align-items-center gap-1 px-2 py-1 btn-sm"
                        style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, minWidth: 70, fontWeight: 500, fontSize: '0.85rem', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)' }}
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
                            No yearly expense data for the selected period or branch.
                        </p>
                    </div>
                ) : (
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 45 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                <XAxis dataKey="yearLabel" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                <Legend />
                                <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[8, 8, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            {chartData.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <h4 className="fs-6 fw-medium mb-3">Yearly Expense Table</h4>
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Year</th>
                                    <th scope="col" className="py-2">Branch</th>
                                    <th scope="col" className="py-2 text-end">Total Amount</th>
                                    <th scope="col" className="py-2 text-end">Total Expenses</th>
                                    <th scope="col" className="py-2 text-end">Active Months</th>
                                    <th scope="col" className="py-2 text-end">Categories</th>
                                    <th scope="col" className="py-2">Employee Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((entry, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2">{entry.yearLabel}</td>
                                        <td className="py-2">{entry.branch_name}</td>
                                        <td className="py-2 text-end fw-medium">{currencyFormatter.format(entry.total_amount)}</td>
                                        <td className="py-2 text-end">{entry.total_expenses}</td>
                                        <td className="py-2 text-end">{entry.active_months}</td>
                                        <td className="py-2 text-end">{entry.unique_categories}</td>
                                        <td className="py-2">{entry.employee_usernames} ({entry.employee_roles})</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="fw-bold border-top">
                                    <td className="py-2">Total</td>
                                    <td className="py-2"></td>
                                    <td className="py-2 text-end">{currencyFormatter.format(totalAmountSum)}</td>
                                    <td className="py-2 text-end">{totalExpensesSum}</td>
                                    <td className="py-2 text-end">-</td>
                                    <td className="py-2 text-end">-</td>
                                    <td className="py-2">-</td>
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
