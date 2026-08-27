"use client";

import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { RiErrorWarningLine, RiLoader4Line, RiInbox2Line, RiRefreshLine, RiCloseCircleLine, RiMoneyDollarCircleLine, RiHashtag, RiBarChartBoxLine, RiEyeLine, RiLineChartLine, RiBubbleChartLine } from "@remixicon/react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface RejectedExpenseData {
    expense_year: number;
    expense_month: number;
    rejected_count: number;
    rejected_total_amount: number;
    rejected_avg_amount: number;
}

interface RejectedExpenseDetail {
    expense_id: number;
    expense_name: string;
    expense_amount: number;
    expense_date: string;
    expense_description: string;
    category_name: string;
    merchant_name: string;
    employee_name: string;
    branch_name: string;
    approved_date: string | null;
    approved_by_username: string | null;
}

export default function RejectedExpensesAnalytics() {
    const [data, setData] = useState<RejectedExpenseData[]>([]);
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
    const [selectedMonth, setSelectedMonth] = useState<(RejectedExpenseData & { monthLabel: string }) | null>(null);
    const [monthDetails, setMonthDetails] = useState<RejectedExpenseDetail[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
    const [detailChartType, setDetailChartType] = useState<'bar' | 'line' | 'area'>('bar');

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

    const handleViewDetails = async (month: RejectedExpenseData & { monthLabel: string }) => {
        setSelectedMonth(month);
        setMonthDetails([]);
        setDetailsError(null);
        setDetailsLoading(true);

        try {
            const endpoint = `expenses/analytics/rejected/monthly/details?branchid=${branchid}&month=${month.expense_month}&year=${month.expense_year}`;
            const response = await customFetch(endpoint);

            if (response && response.status === 'success' && Array.isArray(response.data)) {
                setMonthDetails(response.data.map((item: any) => ({
                    expense_id: Number(item.expense_id) || 0,
                    expense_name: item.expense_name || 'N/A',
                    expense_amount: Number(item.expense_amount) || 0,
                    expense_date: item.expense_date || '',
                    expense_description: item.expense_description || 'N/A',
                    category_name: item.category_name || 'N/A',
                    merchant_name: item.merchant_name || 'N/A',
                    employee_name: item.employee_name || 'N/A',
                    branch_name: item.branch_name || 'N/A',
                    approved_date: item.approved_date || null,
                    approved_by_username: item.approved_by_username || null,
                })));
            } else {
                setDetailsError(response?.message || 'Unable to load expense details.');
            }
        } catch (err: any) {
            setDetailsError(err.message || 'Unable to load expense details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = `expenses/analytics/rejected/monthly?branchid=${branchid}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}&tenantId=3`;
            const response = await customFetch(endpoint);

            if (response && response.status === 'success' && Array.isArray(response.data)) {
                setData(response.data.map((item: any) => ({
                    expense_year: Number(item.expense_year),
                    expense_month: Number(item.expense_month),
                    rejected_count: Number(item.rejected_count) || 0,
                    rejected_total_amount: parseFloat(item.rejected_total_amount) || 0,
                    rejected_avg_amount: parseFloat(item.rejected_avg_amount) || 0,
                })));
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

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedMonth(null);
            }
        };

        if (selectedMonth) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [selectedMonth]);

    const chartData = data.map((item) => ({
        ...item,
        monthLabel: new Date(item.expense_year, item.expense_month - 1).toLocaleString('default', {
            month: 'short',
            year: 'numeric',
        }),
    }));
    const totalCount = data.reduce((sum, item) => sum + item.rejected_count, 0);
    const totalAmount = data.reduce((sum, item) => sum + item.rejected_total_amount, 0);
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    const detailChartData = monthDetails.map((expense) => ({
        expenseName: expense.expense_name,
        dateLabel: expense.expense_date
            ? new Date(expense.expense_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
            : 'Unknown date',
        amount: expense.expense_amount,
    }));

    const renderChart = () => (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                        <XAxis
                            dataKey="monthLabel"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                            tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                            axisLine={{ stroke: COLOR_BORDER }}
                            tickLine={{ stroke: COLOR_BORDER }}
                        />
                        <YAxis
                            tickFormatter={(value: number) => currencyFormatter.format(value)}
                            tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                            axisLine={false}
                            tickLine={false}
                            width={95}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--bs-tertiary-bg)' }}
                            content={({ active, payload }: any) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0].payload as RejectedExpenseData & { monthLabel: string };
                                return (
                                    <div className="rounded border p-2 shadow-sm" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: COLOR_BORDER, minWidth: 190 }}>
                                        <strong className="d-block mb-1">{item.monthLabel}</strong>
                                        <div>Rejected amount: {currencyFormatter.format(item.rejected_total_amount)}</div>
                                        <div>Rejected count: {item.rejected_count}</div>
                                        <div>Average amount: {currencyFormatter.format(item.rejected_avg_amount)}</div>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="rejected_total_amount" name="Rejected Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={45} />
                    </BarChart>
                ) : chartType === 'line' ? (
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 45 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                        <XAxis dataKey="monthLabel" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                        <YAxis tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} />
                        <Tooltip cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                        <Line type="monotone" dataKey="rejected_total_amount" name="Rejected Amount" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ r: 4, fill: COLOR_ACCENT }} activeDot={{ r: 6 }} />
                    </LineChart>
                ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 45 }}>
                        <defs>
                            <linearGradient id="rejectedAmountFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                                <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                        <XAxis dataKey="monthLabel" angle={-45} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                        <YAxis tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} />
                        <Tooltip cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                        <Area type="monotone" dataKey="rejected_total_amount" name="Rejected Amount" stroke={COLOR_ACCENT} fill="url(#rejectedAmountFill)" strokeWidth={3} />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="container-fluid px-2 px-md-3 px-xl-4 py-3">
            <div className="card shadow-sm border-0 mb-4 w-100" style={{ borderRadius: '0.75rem', minHeight: 'calc(100vh - 2rem)' }}>
                <div className="card-header bg-body-tertiary text-body py-3 px-4 border-bottom">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center">
                            <div className="bg-danger-subtle p-2 rounded-3 me-3">
                                <RiCloseCircleLine size={24} className="text-danger" />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold text-body">Rejected Expenses</h4>
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

                <div className="card-body p-3 p-md-4 p-xl-5">
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
                    ) : data.length === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                            <RiInbox2Line size={48} className="mb-3 text-muted" />
                            <h5 className="fw-bold text-dark">No Rejected Expenses</h5>
                            <p className="text-muted">No rejected expense data found for the selected period.</p>
                        </div>
                    ) : (
                        <>
                            <div className="row g-4 mb-4">
                                <div className="col-md-4">
                                    <div className="card h-100 border-0 bg-light-subtle shadow-sm" style={{ borderRadius: '1rem' }}>
                                        <div className="card-body p-5">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="bg-primary-subtle p-2 rounded-3 me-3">
                                                    <RiHashtag size={20} className="text-primary" />
                                                </div>
                                                <span className="text-muted fw-medium">Total Count</span>
                                            </div>
                                            <h2 className="mb-1 fw-bold display-3">{totalCount}</h2>
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
                                                <hr />
                                            </div>
                                            <h2 className="mb-1 fw-bold text-danger display-3">
                                                {currencyFormatter.format(totalAmount)}
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
                                            <h2 className="mb-1 fw-bold display-3">
                                                {currencyFormatter.format(averageAmount)}
                                            </h2>
                                            <p className="text-muted small mb-0">Average per rejected claim</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border rounded p-3 p-md-4">
                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
                                    <h5 className="fw-semibold d-flex align-items-center mb-0">
                                        <RiBarChartBoxLine size={21} className="me-2 text-danger" />
                                        Monthly Rejected Expenses
                                    </h5>
                                    <div className="btn-group btn-group-sm" role="group" aria-label="Monthly chart type">
                                        {[
                                            { type: 'bar' as const, label: 'Bar', icon: RiBarChartBoxLine },
                                            { type: 'line' as const, label: 'Line', icon: RiLineChartLine },
                                            { type: 'area' as const, label: 'Area', icon: RiBubbleChartLine },
                                        ].map((option) => (
                                            <button
                                                key={option.type}
                                                type="button"
                                                className={`btn ${chartType === option.type ? 'btn-danger' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                                                onClick={() => setChartType(option.type)}
                                                aria-pressed={chartType === option.type}
                                                title={`${option.label} chart`}
                                            >
                                                <option.icon size={16} />
                                                <span>{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {renderChart()}
                                <div className="table-responsive mt-3">
                                    <table className="table table-sm table-hover text-start mb-0">
                                        <thead>
                                            <tr>
                                                <th>Month</th>
                                                <th>Rejected Count</th>
                                                <th>Rejected Amount</th>
                                                <th>Average Amount</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData.map((item) => (
                                                <tr key={`${item.expense_year}-${item.expense_month}`}>
                                                    <td>{item.monthLabel}</td>
                                                    <td>{item.rejected_count}</td>
                                                    <td>{currencyFormatter.format(item.rejected_total_amount)}</td>
                                                    <td>{currencyFormatter.format(item.rejected_avg_amount)}</td>
                                                    <td className="text-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                            onClick={() => handleViewDetails(item)}
                                                            aria-label={`View details for ${item.monthLabel}`}
                                                        >
                                                            <RiEyeLine size={16} />
                                                            <span>View details</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedMonth && (
                <div
                    className="modal d-block"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="rejected-month-details-title"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedMonth(null);
                    }}
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
                >
                    <div className="modal-dialog modal-fullscreen modal-dialog-scrollable">
                        <div className="modal-content shadow bg-body text-body">
                            <div className="modal-header">
                                <h5 id="rejected-month-details-title" className="modal-title">
                                    Rejected Expenses: {selectedMonth.monthLabel}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close month details"
                                    onClick={() => setSelectedMonth(null)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="border rounded p-4 h-100 bg-body-tertiary text-body">
                                            <div className="fw-semibold text-uppercase">Rejected count</div>
                                            <hr />
                                            <div className="display-4 fw-bold">{selectedMonth.rejected_count}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="border rounded p-4 h-100 bg-body-tertiary text-body">
                                            <div className="fw-semibold text-uppercase">Rejected amount</div>
                                            <hr />
                                            <div className="display-4 fw-bold text-danger">{currencyFormatter.format(selectedMonth.rejected_total_amount)}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="border rounded p-4 h-100 bg-body-tertiary text-body">
                                            <div className="fw-semibold text-uppercase">Average amount</div>
                                            <hr />
                                            <div className="display-4 fw-bold">{currencyFormatter.format(selectedMonth.rejected_avg_amount)}</div>
                                        </div>
                                    </div>
                                </div>
                                {!detailsLoading && !detailsError && monthDetails.length > 0 && (
                                    <div className="border rounded p-3 mb-4">
                                        <h6 className="fw-semibold d-flex align-items-center mb-3">
                                            <RiBarChartBoxLine size={19} className="me-2 text-danger" />
                                            Expense Amounts for {selectedMonth.monthLabel}
                                        </h6>
                                        <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Expense details chart type">
                                            {[
                                                { type: 'bar' as const, label: 'Bar', icon: RiBarChartBoxLine },
                                                { type: 'line' as const, label: 'Line', icon: RiLineChartLine },
                                                { type: 'area' as const, label: 'Area', icon: RiBubbleChartLine },
                                            ].map((option) => (
                                                <button
                                                    key={option.type}
                                                    type="button"
                                                    className={`btn ${detailChartType === option.type ? 'btn-danger' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                                                    onClick={() => setDetailChartType(option.type)}
                                                    aria-pressed={detailChartType === option.type}
                                                    title={`${option.label} chart`}
                                                >
                                                    <option.icon size={16} />
                                                    <span>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ width: '100%', height: 420 }}>
                                            <ResponsiveContainer>
                                                {detailChartType === 'bar' ? (
                                                    <BarChart data={detailChartData} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                        <XAxis
                                                            dataKey="dateLabel"
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={85}
                                                            interval={0}
                                                            tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                            axisLine={{ stroke: COLOR_BORDER }}
                                                            tickLine={{ stroke: COLOR_BORDER }}
                                                        />
                                                        <YAxis
                                                            tickFormatter={(value: number) => currencyFormatter.format(value)}
                                                            tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            width={95}
                                                        />
                                                        <Tooltip
                                                            formatter={(value: number) => [currencyFormatter.format(value), 'Expense Amount']}
                                                            cursor={{ fill: 'var(--bs-tertiary-bg)' }}
                                                        />
                                                        <Bar dataKey="amount" name="Expense Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={45} />
                                                    </BarChart>
                                                ) : detailChartType === 'line' ? (
                                                    <LineChart data={detailChartData} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                        <XAxis dataKey="dateLabel" angle={-45} textAnchor="end" height={85} interval={0} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                                        <YAxis tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} />
                                                        <Tooltip formatter={(value: number) => [currencyFormatter.format(value), 'Expense Amount']} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                        <Line type="monotone" dataKey="amount" name="Expense Amount" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ r: 4, fill: COLOR_ACCENT }} activeDot={{ r: 6 }} />
                                                    </LineChart>
                                                ) : (
                                                    <AreaChart data={detailChartData} margin={{ top: 10, right: 20, left: 20, bottom: 70 }}>
                                                        <defs>
                                                            <linearGradient id="detailAmountFill" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                                                                <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                        <XAxis dataKey="dateLabel" angle={-45} textAnchor="end" height={85} interval={0} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                                        <YAxis tickFormatter={(value: number) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={95} />
                                                        <Tooltip formatter={(value: number) => [currencyFormatter.format(value), 'Expense Amount']} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                        <Area type="monotone" dataKey="amount" name="Expense Amount" stroke={COLOR_ACCENT} fill="url(#detailAmountFill)" strokeWidth={3} />
                                                    </AreaChart>
                                                )}
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                                {detailsLoading ? (
                                    <div className="d-flex flex-column align-items-center py-4">
                                        <RiLoader4Line size={36} className="animate-spin mb-2 text-primary" />
                                        <span className="text-muted">Loading expense details...</span>
                                    </div>
                                ) : detailsError ? (
                                    <div className="text-center py-4">
                                        <RiErrorWarningLine size={36} className="mb-2 text-danger" />
                                        <p className="text-danger mb-0">{detailsError}</p>
                                    </div>
                                ) : monthDetails.length === 0 ? (
                                    <p className="text-muted text-center mb-0">No expense details found for this month.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped text-start mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Expense</th>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                    <th>Date</th>
                                                    <th>Category</th>
                                                    <th>Merchant</th>
                                                    <th>Employee</th>
                                                    <th>Approved by</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthDetails.map((expense) => (
                                                    <tr key={expense.expense_id}>
                                                        <td>{expense.expense_name}</td>
                                                        <td>{expense.expense_description}</td>
                                                        <td className="bg-danger-subtle fw-bold">{currencyFormatter.format(expense.expense_amount)}</td>
                                                        <td>{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A'}</td>
                                                        <td>{expense.category_name}</td>
                                                        <td>{expense.merchant_name}</td>
                                                        <td>{expense.employee_name}</td>
                                                        <td>{expense.approved_by_username || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedMonth(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
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
            `}</style>
        </div>
    );
}
