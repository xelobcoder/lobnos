"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { RiBarChartBoxLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiCalendarEventLine, RiRefreshLine, RiPrinterLine, RiLineChartLine, RiBubbleChartLine, RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface YearlyExpenseData {
    expense_year: number;
    expenses_paid: string;
    expense_count: number;
    avg_expense_amount: string;
    unique_employees: number;
    unique_merchants: number;
}

interface MonthlyExpenseData {
    expense_month: number;
    expenses_paid: string;
    expense_count: number;
    avg_expense_amount: string;
    unique_employees: number;
}

interface DailyExpenseData {
    expense_date: string;
    expenses_paid: string;
    expense_count: number;
    avg_expense_amount: string;
    unique_employees: number;
}

interface PaymentData {
    expense_id: number;
    expense_date: string;
    expense_name: string;
    expense_amount: number;
    expense_category: number;
    expense_description: string;
    is_approved: number;
    approved_date: string;
    approved_by_id: number;
    approved_by_username: string;
    employeeid: number;
    employee_name: string;
    branchid: number;
    merchant_id: string;
    merchant_name: string;
    merchant_email: string;
    merchant_phone: string;
    merchant_address: string;
    payment_id: number;
    payment_date: string;
    payment_amount: string;
    payment_method: string;
    payment_status: string;
    category_name: string;
    payment_created_by: number;
    payment_created_by_username: string;
    payment_created_on: string;
    invoice_id: number;
    branch_name: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    invoice_status: string;
    invoice_total: string;
    invoice_tax: string;
}

export default function YearlyExpenseSummary() {
    const [data, setData] = useState<YearlyExpenseData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("2021-10-01");
    const [endDate, setEndDate] = useState("2025-10-09");
    const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
    const [monthlyData, setMonthlyData] = useState<Record<number, MonthlyExpenseData[]>>({});
    const [loadingMonthly, setLoadingMonthly] = useState<Set<number>>(new Set());
    const [showBreakdown, setShowBreakdown] = useState<Record<number, boolean>>({});
    const [dailyData, setDailyData] = useState<Record<string, DailyExpenseData[]>>({});
    const [loadingDaily, setLoadingDaily] = useState<Set<string>>(new Set());
    const [showDailyBreakdown, setShowDailyBreakdown] = useState<Record<string, boolean>>({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const { branchid, user } = useApplication();
    const employeeid = user?.employeeid;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - 2; // Default to last 3 years
            const endYear = currentYear;
            const endpoint = `expenses/analytics/yearly?branchid=${branchid}&startYear=${startYear}&endYear=${endYear}`;
            const response = await customFetch(endpoint);
            if (response && response.status === 'success' && response.data && Array.isArray(response.data)) {
                setData(response.data);
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
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 2;
        setStartDate(`${startYear}-01-01`);
        setEndDate(`${currentYear}-12-31`);
    };

    const fetchMonthlyData = async (year: number) => {
        if (monthlyData[year]) return;
        setLoadingMonthly(prev => new Set(prev).add(year));
        try {
            const endpoint = `expenses/analytics/monthly?branchid=${branchid}&year=${year}`;
            const response = await customFetch(endpoint);
            if (response?.status === 'success' && response?.data && Array.isArray(response.data)) {
                setMonthlyData(prev => ({ ...prev, [year]: response.data }));
            }
        } catch (error) {
        } finally {
            setLoadingMonthly(prev => {
                const newSet = new Set(prev);
                newSet.delete(year);
                return newSet;
            });
        }
    };

    const toggleBreakdown = (year: number) => {
        const isShowing = showBreakdown[year];
        setShowBreakdown(prev => ({ ...prev, [year]: !isShowing }));
        if (!isShowing && !monthlyData[year]) {
            fetchMonthlyData(year);
        }
    };

    const fetchDailyData = async (year: number, month: number) => {
        const key = `${year}-${month}`;
        if (dailyData[key]) return;
        setLoadingDaily(prev => new Set(prev).add(key));
        try {
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of month
            const endpoint = `expenses/analytics/daily?branchid=${branchid}&startDate=${startDate}&endDate=${endDate}`;
            const response = await customFetch(endpoint);
            if (response?.status === 'success' && response?.data && Array.isArray(response.data)) {
                setDailyData(prev => ({ ...prev, [key]: response.data }));
            }
        } catch (error) {
            console.error(`Failed to fetch daily data for ${year}-${month}:`, error);
        } finally {
            setLoadingDaily(prev => {
                const newSet = new Set(prev);
                newSet.delete(key);
                return newSet;
            });
        }
    };

    const toggleDailyBreakdown = (year: number, month: number) => {
        const key = `${year}-${month}`;
        const isShowing = showDailyBreakdown[key];
        setShowDailyBreakdown(prev => ({ ...prev, [key]: !isShowing }));
        if (!isShowing && !dailyData[key]) {
            fetchDailyData(year, month);
        }
    };

    const fetchPaymentData = async (date: string) => {
        setLoadingPayments(true);
        setSelectedDate(date);
        try {
            const endpoint = `expenses/analytics/breakdown-admin-level?startDate=${date}&endDate=${date}`;
            const response = await customFetch(endpoint);
            if (response?.status === 'success' && response?.statusCode === 200) {
                setPaymentData(response.data || response.result || []);
            } else {
                setPaymentData([]);
            }
        } catch (error) {
            console.error(`Failed to fetch payment data for ${date}:`, error);
            setPaymentData([]);
        } finally {
            setLoadingPayments(false);
        }
    };

    const openPaymentModal = (date: string) => {
        setShowPaymentModal(true);
        fetchPaymentData(date);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentData([]);
        setSelectedDate('');
    };

    useEffect(() => {
        if (branchid) {
            fetchData();
        }
        // eslint-disable-next-line
    }, [branchid]);

    const chartData = data.map(item => ({
        ...item,
        total_amount: parseFloat(item.expenses_paid),
        average_amount: parseFloat(item.avg_expense_amount),
        yearLabel: item.expense_year.toString()
    }));

    const totalAmountSum = chartData.reduce((sum, entry) => sum + entry.total_amount, 0);
    const totalExpensesSum = chartData.reduce((sum, entry) => sum + entry.expense_count, 0);

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
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expenses Paid</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>{currencyFormatter.format(entry.total_amount)}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Expense Count</span>
                        <span className="fw-bold d-block">{entry.expense_count}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Average Amount</span>
                        <span className="fw-bold d-block">{currencyFormatter.format(entry.average_amount)}</span>
                    </div>
                    <div>
                        <span className="text-xs fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Unique Employees</span>
                        <span className="fw-bold d-block">{entry.unique_employees}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const viewButtons = [
        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
    ];

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 45 },
        };
        const xAxisProps = {
            dataKey: "yearLabel",
            tick: { fontSize: 12 },
            axisLine: { stroke: COLOR_BORDER },
            tickLine: { stroke: COLOR_BORDER },
        };
        const yAxisProps = {
            allowDecimals: false,
            tick: { fontSize: 12 },
            axisLine: false,
            tickLine: false,
            width: 95,
            tickFormatter: (value: number) => currencyFormatter.format(value),
        };
        const legendProps = {
            verticalAlign: "top" as const,
            align: "right" as const,
            iconType: "circle" as const,
            iconSize: 8,
            wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
        };

        if (chartType === "bar") {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Bar dataKey="total_amount" name="Expenses Paid" fill={COLOR_ACCENT} radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
            );
        }
        if (chartType === "line") {
            return (
                <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Line type="monotone" dataKey="total_amount" name="Expenses Paid" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: 'var(--bs-body-bg)' }} />
                </LineChart>
            );
        }
        return (
            <AreaChart {...commonProps}>
                <defs>
                    <linearGradient id="colorTotalAmountFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                <Legend {...legendProps} />
                <Area type="monotone" dataKey="total_amount" name="Expenses Paid" stroke={COLOR_ACCENT} fill="url(#colorTotalAmountFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: 'var(--bs-body-bg)' }} />
            </AreaChart>
        );
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        Yearly Expense Summary
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                            {viewButtons.map(btn => (
                                <button
                                    key={btn.type}
                                    type="button"
                                    className={`btn ${chartType === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                    onClick={() => setChartType(btn.type)}
                                    style={chartType === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                >
                                    <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="startDateYES" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={e => setStartDate(e.target.value)} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                            </div>
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="endDateYES" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={e => setEndDate(e.target.value)} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} min={startDate} />
                            </div>
                               <button onClick={fetchData} className="btn btn-sm btn-primary" type="button" aria-label="Load data">
                             Load
                            </button>
                            <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                <RiRefreshLine size={16} className="me-1" /> Reset
                            </button>
                        </div>
                    </div>
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
                    <ResponsiveContainer width="100%" height={350}>
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </div>
            {chartData.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <div className="d-flex justify-content-between mb-2">
                        <h4 className="fs-6 fw-medium mb-3">Yearly Expense Table</h4>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                            Print
                        </button>
                    </div>
                    <div className="print-date-range" style={{ display: 'none' }}>
                        Report Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover table-striped printable-table-with-borders">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2 text-start fw-bold">#</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Year</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Expenses Paid</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Expense Count</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Average Amount</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Unique Employees</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Unique Merchants</th>
                                    <th scope="col" className="py-2 text-start fw-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((entry, idx) => (
                                    <React.Fragment key={idx}>
                                        <tr>
                                            <td className="py-2 text-start fw-medium">{idx + 1}</td>
                                            <td className="py-2 text-start fw-medium">{entry.yearLabel}</td>
                                            <td className="py-2 text-start fw-medium">{currencyFormatter.format(entry.total_amount)}</td>
                                            <td className="py-2 text-start">{entry.expense_count}</td>
                                            <td className="py-2 text-start">{currencyFormatter.format(entry.average_amount)}</td>
                                            <td className="py-2 text-start">{entry.unique_employees}</td>
                                            <td className="py-2 text-start">{entry.unique_merchants}</td>
                                            <td className="py-2 text-start">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => toggleBreakdown(entry.expense_year)}
                                                    disabled={loadingMonthly.has(entry.expense_year)}
                                                >
                                                    {loadingMonthly.has(entry.expense_year) ? (
                                                        <RiLoader4Line size={14} className="animate-spin" />
                                                    ) : showBreakdown[entry.expense_year] ? (
                                                        <RiArrowUpSLine size={14} />
                                                    ) : (
                                                        <RiArrowDownSLine size={14} />
                                                    )}
                                                    <span className="ms-1">Breakdown</span>
                                                </button>
                                            </td>
                                        </tr>
                                        {showBreakdown[entry.expense_year] && (
                                            <tr>
                                                <td colSpan={8} className="p-0">
                                                    <div className="bg-warning-subtle p-3">
                                                        {loadingMonthly.has(entry.expense_year) ? (
                                                            <div className="d-flex justify-content-center align-items-center py-3">
                                                                <RiLoader4Line size={20} className="animate-spin me-2" />
                                                                Loading monthly data...
                                                            </div>
                                                        ) : monthlyData[entry.expense_year] ? (
                                                            <div className="table-responsive">
                                                                <table className="table table-striped table-borderless mb-0">
                                                                    <thead>
                                                                        <tr className="border-bottom">
                                                                            <th className="py-2 text-start fw-bold">Month</th>
                                                                            <th className="py-2 text-start fw-bold">Expenses Paid</th>
                                                                            <th className="py-2 text-start fw-bold">Expense Count</th>
                                                                            <th className="py-2 text-start fw-bold">Average Amount</th>
                                                                            <th className="py-2 text-start fw-bold">Unique Employees</th>
                                                                            <th className="py-2 text-start fw-bold">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {monthlyData[entry.expense_year].map((monthData, monthIdx) => {
                                                                            const monthKey = `${entry.expense_year}-${monthData.expense_month}`;
                                                                            return (
                                                                                <React.Fragment key={monthIdx}>
                                                                                    <tr>
                                                                                        <td className="py-1 text-start">
                                                                                            {new Date(entry.expense_year, monthData.expense_month - 1).toLocaleString('default', { month: 'long' })}
                                                                                        </td>
                                                                                        <td className="py-1 text-start">{currencyFormatter.format(parseFloat(monthData.expenses_paid))}</td>
                                                                                        <td className="py-1 text-start">{monthData.expense_count}</td>
                                                                                        <td className="py-1 text-start">{currencyFormatter.format(parseFloat(monthData.avg_expense_amount))}</td>
                                                                                        <td className="py-1 text-start">{monthData.unique_employees}</td>
                                                                                        <td className="py-1 text-start">
                                                                                            <button
                                                                                                className="btn btn-sm btn-outline-secondary"
                                                                                                onClick={() => toggleDailyBreakdown(entry.expense_year, monthData.expense_month)}
                                                                                                disabled={loadingDaily.has(monthKey)}
                                                                                            >
                                                                                                {loadingDaily.has(monthKey) ? (
                                                                                                    <RiLoader4Line size={12} className="animate-spin" />
                                                                                                ) : showDailyBreakdown[monthKey] ? (
                                                                                                    <RiArrowUpSLine size={12} />
                                                                                                ) : (
                                                                                                    <RiArrowDownSLine size={12} />
                                                                                                )}
                                                                                                <span className="ms-1">Daily</span>
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                    {showDailyBreakdown[monthKey] && (
                                                                                        <tr>
                                                                                            <td colSpan={7} className="p-0">
                                                                                                <div className="bg-light border ms-4 me-4 mb-2 mt-1">
                                                                                                    {loadingDaily.has(monthKey) ? (
                                                                                                        <div className="d-flex justify-content-center align-items-center py-2">
                                                                                                            <RiLoader4Line size={16} className="animate-spin me-2" />
                                                                                                            Loading daily data...
                                                                                                        </div>
                                                                                                    ) : dailyData[monthKey] ? (
                                                                                                        <div className="table-responsive">
                                                                                                            <table className="table table-striped table-borderless mb-0">
                                                                                                                <thead>
                                                                                                                    <tr className="border-bottom">
                                                                                                                        <th className="py-1 text-start fw-bold">Date</th>
                                                                                                                        <th className="py-1 text-start fw-bold">Expenses Paid</th>
                                                                                                                        <th className="py-1 text-start fw-bold">Expense Count</th>
                                                                                                                        <th className="py-1 text-start fw-bold">Average Amount</th>
                                                                                                                        <th className="py-1 text-start fw-bold">Unique Employees</th>
                                                                                                                        <th className="py-1 text-start fw-bold">Actions</th>
                                                                                                                    </tr>
                                                                                                                </thead>
                                                                                                                <tbody>
                                                                                                                    {dailyData[monthKey].map((dayData, dayIdx) => {
                                                                                                                        const date = new Date(dayData.expense_date);
                                                                                                                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
                                                                                                                        return (
                                                                                                                            <tr key={dayIdx}>
                                                                                                                                <td className="py-1 text-start">
                                                                                                                                    {formattedDate}
                                                                                                                                </td>
                                                                                                                                <td className="py-1 text-start">{currencyFormatter.format(parseFloat(dayData.expenses_paid))}</td>
                                                                                                                                <td className="py-1 text-start">{dayData.expense_count}</td>
                                                                                                                                <td className="py-1 text-start">{currencyFormatter.format(parseFloat(dayData.avg_expense_amount))}</td>
                                                                                                                                <td className="py-1 text-start">{dayData.unique_employees}</td>
                                                                                                                                <td className="py-1 text-start">
                                                                                                                                    <button
                                                                                                                                        className="btn btn-sm btn-outline-secondary"
                                                                                                                                        onClick={() => openPaymentModal(dayData.expense_date)}
                                                                                                                                    >
                                                                                                                                        <RiArrowDownSLine size={12} />
                                                                                                                                        <span className="ms-1">Details</span>
                                                                                                                                    </button>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        );
                                                                                                                    })}
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="text-center py-2 text-muted">
                                                                                                            No daily data available
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-3 text-muted">
                                                                No monthly data available
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="fw-bold border-top">
                                    <td className="py-2 text-start" colSpan={2}>Total</td>
                                    <td className="py-2 text-start">{currencyFormatter.format(totalAmountSum)}</td>
                                    <td className="py-2 text-start">{totalExpensesSum}</td>
                                    <td className="py-2 text-start">-</td>
                                    <td className="py-2 text-start">-</td>
                                    <td className="py-2 text-start">-</td>
                                    <td className="py-2 text-start"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Details Modal */}
            {showPaymentModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Payment Details - {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''} ({paymentData.length} transactions)</h5>
                                <button type="button" className="btn-close" onClick={closePaymentModal}></button>
                            </div>
                            <div className="modal-body">
                                {loadingPayments ? (
                                    <div className="d-flex justify-content-center align-items-center py-4">
                                        <RiLoader4Line size={24} className="animate-spin me-2" />
                                        Loading expense transactions...
                                    </div>
                                ) : paymentData.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th className="py-2 text-start">Expense Date</th>
                                                    <th className="py-2 text-start">Expense Name</th>
                                                    <th className="py-2 text-start">Description</th>
                                                    <th className="py-2 text-start">Amount</th>
                                                    <th className="py-2 text-start">Category Name</th>
                                                    <th className="py-2 text-start">Approved</th>
                                                    <th className="py-2 text-start">Approved Date</th>
                                                    <th className="py-2 text-start">Approved By</th>
                                                    <th className="py-2 text-start">Employee Name</th>
                                                    <th className="py-2 text-start">Merchant Name</th>
                                                    <th className="py-2 text-start">Payment Date</th>
                                                    <th className="py-2 text-start">Payment Amount</th>
                                                    <th className="py-2 text-start">Payment Method</th>
                                                    <th className="py-2 text-start">Payment Status</th>
                                                    <th className="py-2 text-start">Payment Created By</th>
                                                    <th className="py-2 text-start">Payment Created On</th>
                                                    <th className="py-2 text-start">Branch Name</th>
                                                    <th className="py-2 text-start">Invoice Number</th>
                                                    <th className="py-2 text-start">Invoice Date</th>
                                                    <th className="py-2 text-start">Due Date</th>
                                                    <th className="py-2 text-start">Invoice Status</th>
                                                    <th className="py-2 text-start">Invoice Total</th>
                                                    <th className="py-2 text-start">Invoice Tax</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(paymentData) && paymentData.length > 0 && paymentData.map((payment, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-2 text-start">{new Date(payment.expense_date).toLocaleDateString()}</td>
                                                        <td className="py-2 text-start">{payment.expense_name || '-'}</td>
                                                        <td className="py-2 text-start">{payment.expense_description || '-'}</td>
                                                        <td className="py-2 text-start">{currencyFormatter.format(payment.expense_amount)}</td>
                                                        <td className="py-2 text-start">{payment.category_name || '-'}</td>
                                                        <td className="py-2 text-start">{payment.is_approved ? 'Yes' : 'No'}</td>
                                                        <td className="py-2 text-start">{payment.approved_date ? new Date(payment.approved_date).toLocaleDateString() : '-'}</td>
                                                        <td className="py-2 text-start">{payment.approved_by_username || '-'}</td>
                                                        <td className="py-2 text-start">{payment.employee_name || '-'}</td>
                                                        <td className="py-2 text-start">{payment.merchant_name || '-'}</td>
                                                        <td className="py-2 text-start">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</td>
                                                        <td className="py-2 text-start">{payment.payment_amount ? currencyFormatter.format(parseFloat(payment.payment_amount)) : '-'}</td>
                                                        <td className="py-2 text-start">{payment.payment_method || '-'}</td>
                                                        <td className="py-2 text-start">{payment.payment_status || '-'}</td>
                                                        <td className="py-2 text-start">{payment.payment_created_by_username || '-'}</td>
                                                        <td className="py-2 text-start">{payment.payment_created_on ? new Date(payment.payment_created_on).toLocaleDateString() : '-'}</td>
                                                        <td className="py-2 text-start">{payment.branch_name || '-'}</td>
                                                        <td className="py-2 text-start">{payment.invoice_number || '-'}</td>
                                                        <td className="py-2 text-start">{payment.invoice_date ? new Date(payment.invoice_date).toLocaleDateString() : '-'}</td>
                                                        <td className="py-2 text-start">{payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}</td>
                                                        <td className="py-2 text-start">{payment.invoice_status || '-'}</td>
                                                        <td className="py-2 text-start">{payment.invoice_total ? currencyFormatter.format(parseFloat(payment.invoice_total)) : '-'}</td>
                                                        <td className="py-2 text-start">{payment.invoice_tax ? currencyFormatter.format(parseFloat(payment.invoice_tax)) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        No expense transactions available for this date.
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>
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
                    .printable-table-with-borders tbody tr {
                        border: none !important;
                        border-bottom: 2px solid #000 !important;
                    }
                    .printable-table-with-borders tbody tr:nth-child(odd) {
                        background-color: #f8f9fa !important;
                    }
                    .printable-table-with-borders th,
                    .printable-table-with-borders td {
                        padding: 0.25rem 0.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
