"use client";

import React, { useEffect, useState } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiBarChartBoxLine } from "@remixicon/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLOR_APPROVED = "#4caf50";
const COLOR_REJECTED = "#f44336";
const COLOR_PENDING = "#ff9800";
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface ExpenseCountByStatus {
    approved_count: string;
    rejected_count: string;
    pending_count: string;
}

interface Branch {
    branchid: number;
    name: string;
}

export default function ExpenseCountByStatus() {
    const [data, setData] = useState<ExpenseCountByStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchid, setBranchid] = useState<number | null>(null);

    const { user } = useApplication();
    const employeeid = user?.employeeid;

    // Fetch branches on mount
    useEffect(() => {
        async function fetchBranches() {
            try {
                const response = await customFetch("branches");
                if (response && Array.isArray(response.result)) {
                    setBranches(response.result);
                    if (response.result.length > 0) setBranchid(response.result[0].branchid);
                }
            } catch {}
        }
        fetchBranches();
    }, []);

    // Only fetch data when branchid is set
    const fetchData = async () => {
        if (!branchid) return;
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses-analytics/expense-count-by-status?branchid=${branchid}`;
            const response = await customFetch(endpoint);
            if (response && Array.isArray(response) && response.length > 0) {
                setData(response[0]);
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

    // Pie chart colors
    const PIE_COLORS = ["#4caf50", "#f44336", "#ff9800"];

    // Pie chart data
    const pieData = data ? [
        { name: "Approved", value: Number(data.approved_count) },
        { name: "Rejected", value: Number(data.rejected_count) },
        { name: "Pending", value: Number(data.pending_count) }
    ] : [];

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, maxWidth: 420, margin: '0 auto' }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                    Expense Count By Status
                </h2>
                <div className="mt-3 d-flex flex-wrap gap-3">
                    <div>
                        <label className="me-2">Branch:</label>
                        <select
                            className="form-select"
                            value={branchid ?? ''}
                            onChange={e => setBranchid(Number(e.target.value))}
                            style={{ minWidth: 180 }}
                        >
                            {branches.map(branch => (
                                <option key={branch.branchid} value={branch.branchid}>{branch.name}</option>
                            ))}
                        </select>
                    </div>
                  
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '180px' }}>
                        <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                        <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '180px' }}>
                        <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                        <h5 className="fw-medium mb-1">Error Loading Data</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
                ) : !data ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '180px' }}>
                        <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                        <h5 className="fw-medium mb-1">No Data Available</h5>
                        <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                            No expense status data for the selected period or branch.
                        </p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3 align-items-center justify-content-center" style={{ minHeight: '180px' }}>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        paddingAngle={3}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
