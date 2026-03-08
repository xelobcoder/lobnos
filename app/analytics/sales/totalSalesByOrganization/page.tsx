"use client";

import React, { useEffect, useState, useCallback } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: COLOR_ACCENT, marginRight: '0.5rem' }}>🏢</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: COLOR_ACCENT }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📅</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconLine = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📈</span>;
const IconArea = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📉</span>;
const IconView = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>👁️</span>;

// --- Color Palette ---
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const getInitialDates = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString().split("T")[0]; // January 1st
    const endDate = new Date(currentYear, 11, 31).toISOString().split("T")[0]; // December 31st
    return { startDate, endDate };
};

interface OrganizationSalesAPIEntry {
    organizationId: number;
    status: string;
    totalCost: string;
    name: string;
    actual_revenue: string;
    accrued_revenue: string;
    total_discount: string;
    total_amount_refunded: string;
}

interface ChartDataEntry {
    organizationId: number;
    status: string;
    name: string;
    totalCost: number;
    actual_revenue: number;
    accrued_revenue: number;
    total_discount: number;
    total_amount_refunded: number;
}

export default function TotalSalesByOrganization() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"bar" | "line" | "area">("bar");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [queryParams, setQueryParams] = useState<{ _dateFrom: string; _dateEnd: string }>({ _dateFrom: "", _dateEnd: "" });

    const { user } = useApplicationSettings().applicationsettings || {};
    const employeeid = user?.employeeid;

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);

    const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string, currentEmployeeId?: number) => {
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
            const url = `financials/billing/summary?key=totalSalesByOrganization&startDate=${fetchStartDate}&endDate=${fetchEndDate}&employeeid=${currentEmployeeId}`;
            const response: OrganizationSalesAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item) => ({
                    organizationId: item.organizationId,
                    status: item.status,
                    name: item.name || "Unknown Organization",
                    totalCost: parseFloat(item.totalCost) || 0,
                    actual_revenue: parseFloat(item.actual_revenue) || 0,
                    accrued_revenue: parseFloat(item.accrued_revenue) || 0,
                    total_discount: parseFloat(item.total_discount) || 0,
                    total_amount_refunded: parseFloat(item.total_amount_refunded) || 0,
                })).sort((a, b) => b.accrued_revenue - a.accrued_revenue);
                setData(formattedData);
            } else {
                setData([]);
                setError((response as any)?.message || "Failed to fetch data or data is in an unexpected format.");
            }
        } catch (err) {
            setData([]);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            console.error("Error fetching TotalSalesByOrganization:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (employeeid) {
            fetchData(startDate, endDate, employeeid);
        } else {
            setLoading(false);
            setError("Employee information is not loaded yet.");
        }
    }, [employeeid]);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
    };
    const handleLoadData = () => {
        if (employeeid) {
            fetchData(startDate, endDate, employeeid);
        }
    };
    const handleViewToggle = (newView: "bar" | "line" | "area") => {
        setView(newView);
    };

    const handleViewBreakdown = (organization: ChartDataEntry) => {
        // Open organization details in a new tab
        window.open(`/analytics/sales/organizations/${organization.organizationId}`, '_blank');
    };

    const totalPayableOverall = data.reduce((sum, entry) => sum + entry.accrued_revenue, 0);

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentData = payload[0].payload;
            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: COLOR_TOOLTIP_BG,
                        borderColor: COLOR_BORDER,
                        color: COLOR_TOOLTIP_FG,
                        minWidth: '220px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-2 fw-medium" style={{ color: COLOR_TOOLTIP_FG }}>{label}</div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Actual Revenue</span>
                        <span className="fw-bold d-block" style={{ color: 'oklch(0.6 0.15 142)' }}>
                            {currencyFormatter.format(currentData.actual_revenue)}
                        </span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Accrued Revenue</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                            {currencyFormatter.format(currentData.accrued_revenue)}
                        </span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Total Cost</span>
                        <span className="fw-bold d-block">
                            {currencyFormatter.format(currentData.totalCost)}
                        </span>
                    </div>
                    {totalPayableOverall > 0 && (
                        <div className="mt-2 pt-1 border-top" style={{ borderColor: COLOR_BORDER }}>
                            <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Revenue Share</span>
                            <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                {((currentData.accrued_revenue / totalPayableOverall) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderChartArea = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                    <IconLoader />
                    <p className="mt-3" style={{ color: COLOR_TEXT_MUTED }}>Loading organization sales...</p>
                </div>
            );
        }
        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <IconError />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>Error Loading Data</h5>
                    <p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>{error}</p>
                </div>
            );
        }
        if (data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <IconEmpty />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>No Data Available</h5>
                    <p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>
                        No sales data found for organizations in the current period.
                    </p>
                </div>
            );
        }

        const numDataPoints = data.length;
        const angleXAxis = numDataPoints > 5;
        const bottomMargin = angleXAxis ? 80 : 40;

        const commonProps = {
            data: data,
            margin: { top: 5, right: 10, left: 5, bottom: bottomMargin },
        };

        const xAxisProps = {
            dataKey: "name",
            angle: angleXAxis ? -45 : 0,
            textAnchor: angleXAxis ? "end" as const : "middle" as const,
            height: angleXAxis ? 90 : 50,
            interval: 0,
            tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
            axisLine: { stroke: COLOR_BORDER },
            tickLine: { stroke: COLOR_BORDER },
        };

        const yAxisProps = {
            tickFormatter: (value: number) => currencyFormatter.format(value),
            tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
            axisLine: false,
            tickLine: false,
            width: 90,
        };

        const tooltipProps = {
            content: <CustomTooltipContent />,
            cursor: { fill: 'var(--bs-tertiary-bg)' },
        };

        if (view === "bar") {
            return (
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart {...commonProps} barGap={10}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip {...tooltipProps} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="rect"
                                iconSize={12}
                                wrapperStyle={{ fontSize: '12px', color: COLOR_TEXT_MUTED, paddingBottom: '10px' }}
                            />
                            <Bar
                                dataKey="actual_revenue"
                                fill="oklch(0.6 0.15 142)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                                name="Actual Revenue"
                            />
                            <Bar
                                dataKey="accrued_revenue"
                                fill={COLOR_ACCENT}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                                name="Accrued Revenue"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        } else if (view === "line") {
            return (
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip {...tooltipProps} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="line"
                                iconSize={12}
                                wrapperStyle={{ fontSize: '12px', color: COLOR_TEXT_MUTED, paddingBottom: '10px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="totalCost"
                                name="Total Cost"
                                stroke="oklch(0.6 0.15 142)"
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 1, fill: "oklch(0.6 0.15 142)" }}
                                activeDot={{ r: 5, strokeWidth: 2, fill: "oklch(0.6 0.15 142)" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual_revenue"
                                name="Actual Revenue"
                                stroke="oklch(0.7 0.2 20)"
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 1, fill: "oklch(0.7 0.2 20)" }}
                                activeDot={{ r: 5, strokeWidth: 2, fill: "oklch(0.7 0.2 20)" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="accrued_revenue"
                                name="Net Payable"
                                stroke={COLOR_ACCENT}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }}
                                activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_ACCENT }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total_discount"
                                name="Discount"
                                stroke="oklch(0.5 0.1 25)"
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 1, fill: "oklch(0.5 0.1 25)" }}
                                activeDot={{ r: 5, strokeWidth: 2, fill: "oklch(0.5 0.1 25)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
        } else if (view === "area") {
            return (
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <AreaChart {...commonProps}>
                            <defs>
                                <linearGradient id="colorTotalCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.6 0.15 142)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="oklch(0.6 0.15 142)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorTotalPaid" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.7 0.2 20)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="oklch(0.7 0.2 20)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorTotalPayable" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorTotalDiscount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.5 0.1 25)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="oklch(0.5 0.1 25)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                            <XAxis {...xAxisProps} />
                            <YAxis {...yAxisProps} />
                            <Tooltip {...tooltipProps} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="rect"
                                iconSize={12}
                                wrapperStyle={{ fontSize: '12px', color: COLOR_TEXT_MUTED, paddingBottom: '10px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalCost"
                                name="Total Cost"
                                stroke="oklch(0.6 0.15 142)"
                                fill="url(#colorTotalCost)"
                                strokeWidth={2}
                                stackId="1"
                            />
                            <Area
                                type="monotone"
                                dataKey="actual_revenue"
                                name="Actual Revenue"
                                stroke="oklch(0.7 0.2 20)"
                                fill="url(#colorTotalPaid)"
                                strokeWidth={2}
                                stackId="1"
                            />
                            <Area
                                type="monotone"
                                dataKey="accrued_revenue"
                                name="Net Payable"
                                stroke={COLOR_ACCENT}
                                fill="url(#colorTotalPayable)"
                                strokeWidth={2}
                                stackId="1"
                            />
                            <Area
                                type="monotone"
                                dataKey="total_discount"
                                name="Discount"
                                stroke="oklch(0.5 0.1 25)"
                                fill="url(#colorTotalDiscount)"
                                strokeWidth={2}
                                stackId="1"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_TOOLTIP_BG }}>
            <div className="card-header  px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                <div className=" d-flex justify-content-between  flex-md-row align-items-md-center gap-2">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                        <IconChart /> Total Sales by Organization
                    </h2>
                    <div className="d-flex flex-row align-items-center gap-2 flex-nowrap" style={{ overflowX: 'auto', minWidth: 0 }}>
                        <div className="btn-group btn-group-sm d-flex flex-nowrap" role="group" aria-label="Chart type">
                            <button
                                type="button"
                                className={`btn ${view === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                onClick={() => handleViewToggle('bar')}
                                style={view === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}
                            >
                                <IconBar /> Bar
                            </button>
                            <button
                                type="button"
                                className={`btn ${view === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                onClick={() => handleViewToggle('line')}
                                style={view === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}
                            >
                                <IconLine /> Line
                            </button>
                            <button
                                type="button"
                                className={`btn ${view === 'area' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                onClick={() => handleViewToggle('area')}
                                style={view === 'area' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT, whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}
                            >
                                <IconArea /> Area
                            </button>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <IconCalendar />
                            </span>
                            <input id="startDateTSO" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <IconCalendar />
                            </span>
                            <input id="endDateTSO" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <DateFilterReusable
                            value={dateFilter}
                            onChange={setDateFilter}
                            onDateRangeChange={(startDate, endDate) => {
                                setQueryParams((prev) => ({
                                    ...prev,
                                    _dateFrom: startDate,
                                    _dateEnd: endDate
                                }));
                                fetchData(startDate, endDate, employeeid);
                            }}
                            label="Filter by"
                            className="w-auto"
                        />
                        <button onClick={handleLoadData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                            <IconRefresh /> Load
                        </button>
                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                            <IconRefresh /> Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                    <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                        <IconError /> <span className="ms-2">{error}</span>
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartArea()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <h4 className="fs-6 fw-medium mb-3">Organization Sales Breakdown</h4>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Organization Name</th>
                                    <th scope="col" className="py-2">Total Cost</th>
                                    <th scope="col" className="py-2">Actual Revenue</th>
                                    <th scope="col" className="py-2">Accrued Revenue</th>
                                    <th scope="col" className="py-2">Discount</th>
                                    <th scope="col" className="py-2">Refunded</th>
                                    <th scope="col" className="py-2">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => (
                                    <tr key={entry.organizationId + index}>
                                        <td className="py-2">
                                            {entry.name}
                                            <button
                                                className="btn btn-sm btn-link p-0 ms-2 d-print-none"
                                                onClick={() => handleViewBreakdown(entry)}
                                                title={`View breakdown for ${entry.name}`}
                                                style={{ fontSize: '0.8rem', verticalAlign: 'baseline' }}
                                            >
                                                <IconView />
                                            </button>
                                        </td>
                                        <td className="py-2">{currencyFormatter.format(entry.totalCost)}</td>
                                        <td className="py-2">{entry.actual_revenue ? currencyFormatter.format(entry.actual_revenue) : '-'}</td>
                                        <td className="py-2 fw-medium">{currencyFormatter.format(entry.accrued_revenue)}</td>
                                        <td className="py-2">{currencyFormatter.format(entry.total_discount)}</td>
                                        <td className="py-2">{currencyFormatter.format(entry.total_amount_refunded)}</td>
                                        <td className="py-2 text-muted">
                                            {totalPayableOverall > 0 ? ((entry.accrued_revenue / totalPayableOverall) * 100).toFixed(1) : '0.0'}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="fw-bold border-top">
                                <tr>
                                    <td className="py-2">Total</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalCost, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.actual_revenue, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(totalPayableOverall)}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.total_discount, 0))}</td>
                                    <td className="py-2">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.total_amount_refunded, 0))}</td>
                                    <td className="py-2">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .table-responsive thead.sticky-top th {
                    background-color: var(--bs-tertiary-bg) !important;
                    border-bottom: 2px solid var(--bs-border-color); 
                }
            `}</style>
        </div>
    );
}