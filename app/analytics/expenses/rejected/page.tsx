"use client";

import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiErrorWarningLine, RiLoader4Line, RiInbox2Line, RiRefreshLine, RiCloseCircleLine, RiMoneyDollarCircleLine, RiHashtag } from "@remixicon/react";
import { useState, useEffect } from "react";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface RejectedExpenseData {
    rejected_count: number;
    rejected_total_amount: string | null;
    rejected_avg_amount: string | null;
}

export default function RejectedExpensesAnalytics() {
    const [data, setData] = useState<RejectedExpenseData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(() => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-01-01`;
    });
    const [endDate, setEndDate] = useState(() => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-12-31`;
    });
    const [dateFilter, setDateFilter] = useState<string>('This Year');

    const { branchid } = useApplication();

    const handleResetFilters = () => {
        const currentYear = new Date().getFullYear();
        setStartDate(`${currentYear}-01-01`);
        setEndDate(`${currentYear}-12-31`);
        setDateFilter('This Year');
    };

    const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses/analytics/rejected?branchid=${branchid}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
            const response = await customFetch(endpoint);
            
            if (response && response.status === 'success') {
                setData(response.data);
            } else {
                setError(response?.message || "Invalid data format received");
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
    }, [branchid, startDate, endDate]);

    return (
        <div className="container-fluid p-0">
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '0.75rem' }}>
                <div className="card-header bg-white py-3 px-4 border-bottom">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center">
                            <div className="bg-danger-subtle p-2 rounded-3 me-3">
                                <RiCloseCircleLine size={24} className="text-danger" />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold text-dark">Rejected Expenses</h4>
                                <p className="text-muted small mb-0">Overview of rejected expense claims and amounts</p>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <DateFilterReusable
                                value={dateFilter}
                                onChange={setDateFilter}
                                onDateRangeChange={handleDateRangeChange}
                                label="Period"
                                className="w-100"
                            />
                            <button 
                                onClick={handleResetFilters} 
                                className="btn btn-light border d-flex align-items-center gap-2"
                                style={{ borderRadius: '0.5rem' }}
                            >
                                <RiRefreshLine size={18} />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-4">
                    {loading ? (
                        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <RiLoader4Line size={48} className="animate-spin mb-3 text-primary" />
                            <p className="text-muted">Loading rejected expenses...</p>
                        </div>
                    ) : error ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                            <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                            <h5 className="fw-bold text-dark">Error Loading Data</h5>
                            <p className="text-muted">{error}</p>
                            <button onClick={fetchData} className="btn btn-primary mt-3">Try Again</button>
                        </div>
                    ) : !data || data.rejected_count === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                            <RiInbox2Line size={48} className="mb-3 text-muted" />
                            <h5 className="fw-bold text-dark">No Rejected Expenses</h5>
                            <p className="text-muted">No rejected expense data found for the selected period.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            <div className="col-md-4">
                                <div className="card h-100 border-0 bg-light-subtle shadow-sm" style={{ borderRadius: '1rem' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-primary-subtle p-2 rounded-3 me-3">
                                                <RiHashtag size={20} className="text-primary" />
                                            </div>
                                            <span className="text-muted fw-medium">Total Count</span>
                                        </div>
                                        <h2 className="mb-1 fw-bold">{data.rejected_count}</h2>
                                        <p className="text-muted small mb-0">Rejected expense requests</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card h-100 border-0 bg-light-subtle shadow-sm" style={{ borderRadius: '1rem' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-danger-subtle p-2 rounded-3 me-3">
                                                <RiMoneyDollarCircleLine size={20} className="text-danger" />
                                            </div>
                                            <span className="text-muted fw-medium">Rejected Amount</span>
                                        </div>
                                        <h2 className="mb-1 fw-bold text-danger">
                                            {currencyFormatter.format(parseFloat(data.rejected_total_amount || '0'))}
                                        </h2>
                                        <p className="text-muted small mb-0">Sum of all rejected expenses</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card h-100 border-0 bg-light-subtle shadow-sm" style={{ borderRadius: '1rem' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-warning-subtle p-2 rounded-3 me-3">
                                                <RiMoneyDollarCircleLine size={20} className="text-warning" />
                                            </div>
                                            <span className="text-muted fw-medium">Avg Rejected Amount</span>
                                        </div>
                                        <h2 className="mb-1 fw-bold">
                                            {currencyFormatter.format(parseFloat(data.rejected_avg_amount || '0'))}
                                        </h2>
                                        <p className="text-muted small mb-0">Average per rejected claim</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
