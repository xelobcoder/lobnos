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
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line, RiRefreshLine, RiArrowUpSFill, RiArrowDownSFill } from "@remixicon/react";

interface SalesDataEntry {
    date: string;
    totalCost: number;
    actual_revenue: number;
    accrued_revenue: number;
    total_discount: number;
    totalRefunded: number;
    total_expenses: number;
    net_revenue: number;
    outstanding_debt: number;
    changeFromPreviousDay: number | null; // Calculated field
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue for actual_revenue
const COLOR_TERTIARY = '#ea580c'; // Orange for total_discount
const COLOR_EXPENSES = '#dc2626'; // Red for total_expenses


export default function DailySalesTrend() {
    const [data, setData] = useState<SalesDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"line" | "bar" | "area">("line");

    const { branchid } = useApplicationSettings().applicationsettings || {};

    const getInitialDates = () => {
        const endDateObj = new Date();
        const startDateObj = new Date();
        startDateObj.setDate(endDateObj.getDate() - 29);
        return {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };
    };

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);

    const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string, currentBranchId?: string) => {
        if (!currentBranchId) {
            setError("Branch ID is not available. Please select a branch.");
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
            const url = `financials/billing/summary?key=dailySalesTrend&startDate=${fetchStartDate}&endDate=${fetchEndDate}&branchid=${currentBranchId}`;
            const response = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item: any) => {
                    const formatted = {
                        date: item.date,
                        totalCost: parseFloat(item.totalCost) || 0,
                        actual_revenue: parseFloat(item.actual_revenue) || 0,
                        accrued_revenue: parseFloat(item.accrued_revenue) || 0,
                        total_discount: parseFloat(item.total_discount) || 0,
                        totalRefunded: parseFloat(item.totalRefunded) || 0,
                        total_expenses: parseFloat(item.total_expenses) || 0,
                        net_revenue: parseFloat(item.net_revenue) || 0,
                        outstanding_debt: parseFloat(item.outstanding_debt) || 0,
                        changeFromPreviousDay: null, // Will be calculated below
                    };
                    return formatted;
                }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                for (let i = 1; i < formattedData.length; i++) {
                    const current = formattedData[i].net_revenue;
                    const previous = formattedData[i - 1].net_revenue;
                    (formattedData[i] as any).changeFromPreviousDay = current - previous;
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
        if (branchid) {
            fetchData(startDate, endDate, branchid);
        } else {
            setLoading(false);
            setError("Branch information is not loaded yet.");
        }
    }, [fetchData, startDate, endDate, branchid]);

    const handleViewToggle = (newView: "line" | "bar" | "area") => {
        setView(newView);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);

    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
    };

    const totalPositiveRevenue = useMemo(() => data.reduce((sum, entry) => entry.net_revenue > 0 ? sum + entry.net_revenue : sum, 0), [data]);

    const formatDateForDisplay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const formatDateForTable = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' });
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
                    <Bar dataKey="actual_revenue" name="Actual Revenue" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="accrued_revenue" name="Accrued Revenue" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="total_discount" name="Total Discount" fill={COLOR_TERTIARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="total_expenses" name="Total Expenses" fill={COLOR_EXPENSES} radius={[4, 4, 0, 0]} maxBarSize={30} />
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
                    <Line type="monotone" dataKey="actual_revenue" name="Actual Revenue" stroke={COLOR_SECONDARY} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    <Line type="monotone" dataKey="accrued_revenue" name="Accrued Revenue" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    <Line type="monotone" dataKey="total_discount" name="Total Discount" stroke={COLOR_TERTIARY} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_TERTIARY }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }} />
                    <Line type="monotone" dataKey="total_expenses" name="Total Expenses" stroke={COLOR_EXPENSES} strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_EXPENSES }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_EXPENSES, stroke: COLOR_TOOLTIP_BG }} />
                </LineChart>
            );
        }

        return (
            <AreaChart {...commonProps}>
                <defs>
                    <linearGradient id="colorTotalPaidFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorTotalPayableFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorTotalDiscountFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorTotalExpensesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                <Legend {...legendProps} />
                <Area type="monotone" dataKey="actual_revenue" name="Actual Revenue" stroke={COLOR_SECONDARY} fill="url(#colorTotalPaidFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                <Area type="monotone" dataKey="accrued_revenue" name="Accrued Revenue" stroke={COLOR_ACCENT} fill="url(#colorTotalPayableFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                <Area type="monotone" dataKey="total_discount" name="Total Discount" stroke={COLOR_TERTIARY} fill="url(#colorTotalDiscountFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_TERTIARY }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }} />
                <Area type="monotone" dataKey="total_expenses" name="Total Expenses" stroke={COLOR_EXPENSES} fill="url(#colorTotalExpensesFill)" strokeWidth={2} dot={{ r: 3, strokeWidth: 1, fill: COLOR_EXPENSES }} activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_EXPENSES, stroke: COLOR_TOOLTIP_BG }} />
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
            <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
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
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="startDateDST" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                            </div>
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="endDateDST" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                            </div>
                            <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                <RiRefreshLine size={16} className="me-1" /> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                    <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
                        {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartContainerContent()}
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
                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Date</th>
                                    <th scope="col" className="py-2">Total Cost</th>
                                    <th scope="col" className="py-2">Accrued <span className="d-print-none">Revenue</span></th>
                                    <th scope="col" className="py-2">Actual <span className="d-print-none">Revenue</span></th>
                                    <th scope="col" className="py-2">Expenses</th>
                                    <th scope="col" className="py-2">Discount</th>
                                    <th scope="col" className="py-2">Net Revenue</th>
                                    <th scope="col" className="py-2">Outstanding</th>
                                    <th scope="col" className="py-2">Refunded</th>
                                    <th scope="col" className="py-2">Change</th>
                                    <th scope="col" className="py-2" title="it represent % of net revenue for that period sales">% </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry) => {
                                    const change = entry.changeFromPreviousDay; // Use the provided value
                                    const percentageOfTotal = entry.net_revenue > 0 && totalPositiveRevenue > 0 ? ((entry.net_revenue / totalPositiveRevenue) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={entry.date}>
                                            <td className="py-2">{formatDateForTable(entry.date)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.totalCost)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.accrued_revenue)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.actual_revenue)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.total_expenses)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.total_discount)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.net_revenue)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.outstanding_debt)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.totalRefunded)}</td>
                                            <td className={`py-2 ${change !== null ? (change >= 0 ? 'text-success' : 'text-danger') : 'text-muted'}`}>
                                                {change !== null ? (
                                                    <>
                                                        {change >= 0 ? <RiArrowUpSFill className="align-text-bottom" /> : <RiArrowDownSFill className="align-text-bottom" />}
                                                        {currencyFormatter.format(change)}
                                                    </>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td className="py-2 text-muted">{percentageOfTotal}%</td>
                                        </tr>
                                    );
                                })}
                                <tr className="fw-bold border-top">
                                    <td className="py-2">Total</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalCost, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.accrued_revenue, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.actual_revenue, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.total_expenses, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.total_discount, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.net_revenue, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.outstanding_debt, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalRefunded, 0))}</td>
                                    <td className="py-2"></td>
                                    <td className="py-2">100.0%</td>
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
                    .printable-table-with-borders th:nth-child(11),
                    .printable-table-with-borders td:nth-child(11) {
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