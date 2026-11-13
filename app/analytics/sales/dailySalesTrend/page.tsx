"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line, RiRefreshLine, RiArrowUpSFill, RiArrowDownSFill } from "@remixicon/react";
import { randomBytes } from "crypto";
import { plsEncryption } from "../../../../lib/encryption";
import dayjs from "dayjs";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

interface SalesDataEntry {
    date: string;
    gross_revenue: number;
    cash_collected: number;
    earned_revenue: number;
    discount: number;
    total_refunded: number;
    expenses_paid: number;
    net_operating_cash: number;
    outstanding: number;
    changeFromPreviousDay: number | null; // Calculated field
    expenseChangeFromPrevious: number | null;
    salesChangeFromPrevious: number | null;
    netRevenueChangeFromPrevious: number | null;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue for cash_collected
const COLOR_TERTIARY = '#7c3aed'; // Purple for discount
const COLOR_EXPENSES = '#dc2626'; // Red for expenses_paid
const COLOR_NET_REVENUE = '#198754'; // Green for net_operating_cash

const METRICS_CONFIG = [
    { key: "cash_collected", name: "Cash Collected", color: COLOR_SECONDARY },
    { key: "earned_revenue", name: "Earned Revenue", color: COLOR_ACCENT },
    { key: "discount", name: "Discount", color: COLOR_TERTIARY },
    { key: "expenses_paid", name: "Expenses Paid", color: COLOR_EXPENSES },
    { key: "net_operating_cash", name: "Net Operating Cash", color: COLOR_NET_REVENUE },
];


export default function DailySalesTrend() {
    const [data, setData] = useState<SalesDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"line" | "bar" | "area">("line");
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [enabledMetrics, setEnabledMetrics] = useState<Set<string>>(new Set([
        "cash_collected",
        "earned_revenue",
        "discount",
        "expenses_paid",
        "net_operating_cash"
    ]));

    const { branchid, user } = useApplicationSettings().applicationsettings || {};
    const employeeid = user?.employeeid;

    const getInitialDates = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        return {
            startDate,
            endDate,
        };
    };

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);
    const [dateFilter, setDateFilter] = useState<string>("This Month");

    const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string, currentBranchId?: string, currentEmployeeId?: number) => {
        if (!currentBranchId) {
            setError("Branch ID is not available. Please select a branch.");
            setData([]);
            setLoading(false);
            return;
        }
        if (!currentEmployeeId) {
            setError("Employee ID is not available. Please log in again.");
            setData([]);
            setLoading(false);
            return;
        }
        if (!fetchStartDate || !fetchEndDate) {
            setError("Please select valid start and end dates.");
            setData([]);
            setLoading(false);
            return;
        }
        if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
            setError("Start date cannot be after end date.");
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `financials/billing/summary?key=dailySalesTrend&startDate=${fetchStartDate}&endDate=${fetchEndDate}&branchid=${currentBranchId}&employeeid=${currentEmployeeId}`;
            const response = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item: any) => {
                    const formatted = {
                        date: item.date,
                        gross_revenue: parseFloat(item.gross_revenue) || 0,
                        cash_collected: parseFloat(item.cash_collected) || 0,
                        earned_revenue: parseFloat(item.earned_revenue) || 0,
                        discount: parseFloat(item.discount) || 0,
                        total_refunded: parseFloat(item.total_refunded) || 0,
                        expenses_paid: parseFloat(item.expenses_paid) || 0,
                        net_operating_cash: parseFloat(item.net_operating_cash) || 0,
                        outstanding: parseFloat(item.outstanding) || 0,
                        changeFromPreviousDay: null,
                        expenseChangeFromPrevious: null,
                        salesChangeFromPrevious: null,
                        netRevenueChangeFromPrevious: null,
                    };
                    return formatted;
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                for (let i = 0; i < formattedData.length - 1; i++) {
                    const current = formattedData[i];
                    const previous = formattedData[i + 1];
                    (formattedData[i] as any).changeFromPreviousDay = current.net_operating_cash - previous.net_operating_cash;
                    (formattedData[i] as any).expenseChangeFromPrevious = current.expenses_paid - previous.expenses_paid;
                    (formattedData[i] as any).salesChangeFromPrevious = current.earned_revenue - previous.earned_revenue;
                    (formattedData[i] as any).netRevenueChangeFromPrevious = current.net_operating_cash - previous.net_operating_cash;
                }

                setData(formattedData);
                if (formattedData.length === 0) {
                    setError(null);
                }
            } else {
                setData([]);
                setError(response?.message || "Failed to fetch data or data is in an unexpected format.");
            }
        } catch (err) {
            setData([]);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (branchid && employeeid && isInitialLoad) {
            fetchData(startDate, endDate, branchid, employeeid);
            setIsInitialLoad(false);
        } else if (!branchid || !employeeid) {
            setLoading(false);
            setError("Branch and employee information is not loaded yet.");
        }
    }, [fetchData, startDate, endDate, branchid, employeeid, isInitialLoad]);

    const handleViewToggle = (newView: "line" | "bar" | "area") => {
        setView(newView);
    };

    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        setDateFilter("This Month");
    };

    const handleMetricToggle = (metricKey: string) => {
        setEnabledMetrics(prev => {
            const newSet = new Set(prev);
            if (newSet.has(metricKey)) {
                newSet.delete(metricKey);
            } else {
                newSet.add(metricKey);
            }
            return newSet;
        });
    };

    const handleBreakdownClick = (entry: SalesDataEntry) => {
        const dateParam = dayjs(entry.date).format('YYYY-MM-DD');
        const link = `/billing/sales/branches/${plsEncryption(branchid.toString())}/day-transaction-break-down?date=${dateParam}&from=${dateParam}&end=${dateParam}&branchid=${branchid}`;
        window.open(link, "_blank");
    };

    const totalPositiveRevenue = useMemo(() => data.reduce((sum, entry) => entry.net_operating_cash > 0 ? sum + entry.net_operating_cash : sum, 0), [data]);

    const formatDateForDisplay = (dateString: string) => {
        return dayjs(dateString).format('MMM D');
    };

    const formatDateForTable = (dateString: string) => {
        return dayjs(dateString).format('DD-MM-YYYY');
    };


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload as SalesDataEntry;

            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: COLOR_TOOLTIP_BG,
                        borderColor: COLOR_BORDER,
                        minWidth: '220px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-2">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{formatDateForTable(label)}</span>
                    </div>
                    {payload.map((item: any, index: number) => {
                        const value = item.value;
                        const name = item.name;
                        const color = item.color;
                        return (
                            <div key={index} className="mb-1">
                                <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{name}</span>
                                <span className="fw-bold d-block" style={{ color }}>
                                    {currencyFormatter.format(value)}
                                </span>
                            </div>
                        );
                    })}
                    {entry.changeFromPreviousDay !== null && (
                        <div className="mt-2 pt-1 border-top">
                            <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Change from Previous</span>
                            <span className={`fw-bold d-block`} style={{ color: entry.changeFromPreviousDay >= 0 ? COLOR_GREEN_TEXT : COLOR_RED_TEXT }}>
                                {entry.changeFromPreviousDay >= 0 ? <RiArrowUpSFill className="align-text-bottom" /> : <RiArrowDownSFill className="align-text-bottom" />}
                                {currencyFormatter.format(entry.changeFromPreviousDay)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };



    const renderChart = () => {
        const commonProps = {
            data: data,
            margin: { top: 5, right: 5, left: 20, bottom: 45 },
        };
        const xAxisProps = {
            dataKey: "date",
            tickFormatter: formatDateForDisplay,
            angle: -45,
            textAnchor: "end" as const,
            height: 60,
            interval: "preserveStartEnd" as const,
            tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
            axisLine: { stroke: COLOR_BORDER },
            tickLine: { stroke: COLOR_BORDER },
        };
        const yAxisProps = {
            tickFormatter: (value: number) => currencyFormatter.format(value),
            tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
            axisLine: false,
            tickLine: false,
            width: 95,
        };
        const legendProps = {
            verticalAlign: "top" as const,
            align: "right" as const,
            iconType: "circle" as const,
            iconSize: 8,
            wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
        };

        if (view === "bar") {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    {METRICS_CONFIG.filter(metric => enabledMetrics.has(metric.key)).map(metric => (
                        <Bar
                            key={metric.key}
                            dataKey={metric.key}
                            name={metric.name}
                            fill={metric.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={30}
                        />
                    ))}
                </BarChart>
            );
        }
        if (view === "line") {
            return (
                <LineChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    {METRICS_CONFIG.filter(metric => enabledMetrics.has(metric.key)).map(metric => (
                        <Line
                            key={metric.key}
                            type="monotone"
                            dataKey={metric.key}
                            name={metric.name}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 1, fill: metric.color }}
                            activeDot={{ r: 6, strokeWidth: 1.5, fill: metric.color, stroke: COLOR_TOOLTIP_BG }}
                        />
                    ))}
                </LineChart>
            );
        }

        return (
            <AreaChart {...commonProps}>
                <defs>
                    {METRICS_CONFIG.filter(metric => enabledMetrics.has(metric.key)).map(metric => (
                        <linearGradient key={metric.key} id={`color${metric.key.replace('_', '').replace(/^\w/, c => c.toUpperCase())}Fill`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.5} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0.05} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                <Legend {...legendProps} />
                {METRICS_CONFIG.filter(metric => enabledMetrics.has(metric.key)).map(metric => (
                    <Area
                        key={metric.key}
                        type="monotone"
                        dataKey={metric.key}
                        name={metric.name}
                        stroke={metric.color}
                        fill={`url(#color${metric.key.replace('_', '').replace(/^\w/, c => c.toUpperCase())}Fill)`}
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1, fill: metric.color }}
                        activeDot={{ r: 6, strokeWidth: 1.5, fill: metric.color, stroke: COLOR_TOOLTIP_BG }}
                    />
                ))}
            </AreaChart>
        );
    };


    const renderChartContainerContent = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading daily sales...</p>
                </div>
            );
        }

        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                    <h5 className="fw-medium mb-1">Error Loading Data</h5>
                    <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                    <h5 className="fw-medium mb-1">No Data Available</h5>
                    <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                        No sales data for the selected period or branch.
                    </p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={350}>
                {renderChart()}
            </ResponsiveContainer>
        );
    };

    const viewButtons = [
        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" }, // Changed icon
    ];

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        Daily Sales Trend
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                            {viewButtons.map(btn => (
                                <button
                                    key={btn.type}
                                    type="button"
                                    className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                    onClick={() => handleViewToggle(btn.type)}
                                    style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                >
                                    <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                            <DateFilterReusable
                                value={dateFilter}
                                onChange={setDateFilter}
                                onDateRangeChange={(newStartDate, newEndDate) => {
                                    setStartDate(newStartDate);
                                    setEndDate(newEndDate);
                                }}
                                label="Filter by"
                                className="w-auto"
                            />
                            <button onClick={() => fetchData(startDate, endDate, branchid, employeeid)} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}>
                                <RiRefreshLine size={16} className="me-1" /> Load Data
                            </button>
                            <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                <RiRefreshLine size={16} className="me-1" /> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <p className="small text-muted px-4 pt-3 mb-0">Sales include closed bills. Legacy facilities use available billing records. Receipts and expenses use payment dates.</p>
            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                    <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
                        {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartContainerContent()}
                <div className="mt-3 pt-3 border-top">
                    <h6 className="fs-6 fw-medium mb-3" style={{ color: COLOR_TEXT_MUTED }}>Select Metrics to Display</h6>
                    <div className="row g-2">
                        {METRICS_CONFIG.map(metric => (
                            <div key={metric.key} className="col-auto">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`metric-${metric.key}`}
                                        checked={enabledMetrics.has(metric.key)}
                                        onChange={() => handleMetricToggle(metric.key)}
                                        style={{ borderColor: COLOR_BORDER }}
                                    />
                                    <label
                                        className="form-check-label small fw-medium"
                                        htmlFor={`metric-${metric.key}`}
                                        style={{ color: COLOR_TEXT_MUTED }}
                                    >
                                        <span
                                            className="d-inline-block me-1"
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: metric.color,
                                                borderRadius: '2px'
                                            }}
                                        ></span>
                                        {metric.name}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {data.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <div className="print-date-range" style={{ display: 'none' }}>
                        Sales Report Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <h4 className="fs-6 fw-medium mb-3">
                            Sales Data Table
                        </h4>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>
                            Print
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover table-striped small printable-table-with-borders" >
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Date</th>
                                    <th scope="col" className="py-2">Gross Revenue</th>
                                    <th scope="col" className="py-2">Discount</th>
                                    <th scope="col" className="py-2">Outstanding</th>
                                    <th scope="col" className="py-2">Refunded</th>
                                    <th scope="col" className="py-2">Earned Revenue</th>
                                    <th scope="col" className="py-2">Cash Collected</th>
                                    <th scope="col" className="py-2 fw-bold text-dark" style={{ backgroundColor: '#f8d7da' }}>Expenses Paid</th>
                                    <th scope="col" className="py-2 fw-bold text-dark" style={{ backgroundColor: '#d4edda' }}>Net Operating Cash</th>
                                    <th scope="col" className="py-2">Expense Change</th>
                                    <th scope="col" className="py-2">Sales Change</th>
                                    <th scope="col" className="py-2">Net Cash Change</th>
                                    <th scope="col" className="py-2" title="it represent % of net cash surplus for that period sales">% </th>
                                    <th scope="col" className="py-2 d-print-none">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(data) && data.length > 0 && data.map((entry) => {
                                    const expenseChange = entry.expenseChangeFromPrevious;
                                    const salesChange = entry.salesChangeFromPrevious;
                                    const netRevenueChange = entry.netRevenueChangeFromPrevious;
                                    const percentageOfTotal = entry.net_operating_cash > 0 && totalPositiveRevenue > 0 ? ((entry.net_operating_cash / totalPositiveRevenue) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={entry.date}>
                                            <td className="py-2">{formatDateForTable(entry.date)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.gross_revenue)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.discount)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.outstanding)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.total_refunded)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.earned_revenue)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.cash_collected)}</td>
                                            <td className="py-2 fw-bold text-dark" style={{ backgroundColor: '#f8d7da' }}>{currencyFormatter.format(entry.expenses_paid)}</td>
                                            <td className="py-2 fw-bold text-dark" style={{ backgroundColor: '#d4edda' }}>{currencyFormatter.format(entry.net_operating_cash)}</td>
                                            <td className={`py-2 ${expenseChange !== null ? (expenseChange >= 0 ? 'text-danger' : 'text-success') : 'text-muted'}`}>
                                                {expenseChange !== null ? (
                                                    <>
                                                        {expenseChange >= 0 ? <RiArrowUpSFill className="align-text-bottom" /> : <RiArrowDownSFill className="align-text-bottom" />}
                                                        {currencyFormatter.format(expenseChange)}
                                                    </>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td className={`py-2 ${salesChange !== null ? (salesChange >= 0 ? 'text-success' : 'text-danger') : 'text-muted'}`}>
                                                {salesChange !== null ? (
                                                    <>
                                                        {salesChange >= 0 ? <RiArrowUpSFill className="align-text-bottom" /> : <RiArrowDownSFill className="align-text-bottom" />}
                                                        {currencyFormatter.format(salesChange)}
                                                    </>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td className={`py-2 ${netRevenueChange !== null ? (netRevenueChange >= 0 ? 'text-success' : 'text-danger') : 'text-muted'}`}>
                                                {netRevenueChange !== null ? (
                                                    <>
                                                        {netRevenueChange >= 0 ? <RiArrowUpSFill className="align-text-bottom" /> : <RiArrowDownSFill className="align-text-bottom" />}
                                                        {currencyFormatter.format(netRevenueChange)}
                                                    </>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td className="py-2 text-muted">{percentageOfTotal}%</td>
                                            <td className="py-2 d-print-none">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleBreakdownClick(entry)}
                                                    title="View detailed breakdown"
                                                >
                                                    <RiBarChartBoxLine size={16} className="me-1" />
                                                    Breakdown
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="fw-bold border-top">
                                    <td className="py-2">Total</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.gross_revenue, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.discount, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.outstanding, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.total_refunded, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.earned_revenue, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.cash_collected, 0))}</td>
                                    <td className="py-2 fw-bold text-dark" style={{ backgroundColor: '#f8d7da' }}>{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.expenses_paid, 0))}</td>
                                    <td className="py-2 fw-bold text-dark" style={{ backgroundColor: '#d4edda' }}>{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.net_operating_cash, 0))}</td>
                                    <td className="py-2 text-muted">-</td>
                                    <td className="py-2 text-muted">-</td>
                                    <td className="py-2 text-muted">-</td>
                                    <td className="py-2 text-muted">100.0%</td>
                                    <td className="py-2"></td>
                                </tr>
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
                .table-responsive thead th {
                    font-weight: bold !important;
                    color: #000 !important;
                }
                @media print {
                    .printable-table-with-borders tbody tr {
                        border: none !important;
                        border-bottom: 2px solid #000 !important;
                    }
                    .printable-table-with-borders tbody tr:nth-child(odd) {
                        background-color: #f8f9fa !important;
                    }
                    .printable-table-with-borders th:nth-child(14),
                    .printable-table-with-borders td:nth-child(14) {
                        display: none !important;
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