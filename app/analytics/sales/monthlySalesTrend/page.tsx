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
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { RiLineChartLine, RiBarChartBoxLine, RiBubbleChartLine, RiPieChartLine, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line, RiRefreshLine, RiFileList3Line, RiMoneyDollarCircleLine, RiPercentLine, RiDiscountPercentLine } from "@remixicon/react";

interface MonthlySalesAPIEntry {
    month: string;
    totalSales: string;
    totaldiscount: string;
    totalpayableAmount: string;
}

interface ChartDataEntry {
    month: string; // This will be the month name like "March"
    totalSales: number;
    totalDiscount: number;
    totalPayableAmount: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_DISCOUNT = 'oklch(0.769 0.188 70.08)';
const COLOR_PAYABLE = 'oklch(0.6 0.118 184.704)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const PIE_CHART_COLORS = [
    COLOR_ACCENT,
    COLOR_PAYABLE,
    COLOR_DISCOUNT,
    'oklch(0.828 0.189 84.429)',
    'oklch(0.398 0.07 227.392)',
    'oklch(0.7 0.2 20)',
    'oklch(0.5 0.15 280)',
    'oklch(0.8 0.1 120)',
];

const monthOrder: { [key: string]: number } = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

export default function MonthlySalesTrend() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"pie" | "bar" | "line" | "area">("bar");

    const { branchid } = useApplicationSettings().applicationsettings || {};

    const getInitialDatesForMonthly = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];
        return { startDate, endDate };
    };

    const initialDates = getInitialDatesForMonthly();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);

    const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string, currentBranchId?: string) => {
        if (!currentBranchId) {
            setError("Branch ID is not available.");
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
            const url = `financials/billing/summary?key=monthlySalesTrend&startDate=${fetchStartDate}&endDate=${fetchEndDate}&branchid=${currentBranchId}`;
            const response: MonthlySalesAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item: MonthlySalesAPIEntry) => ({
                    month: item.month,
                    totalSales: parseFloat(item.totalSales) || 0,
                    totalDiscount: parseFloat(item.totaldiscount) || 0,
                    totalPayableAmount: parseFloat(item.totalpayableAmount) || 0,
                })).sort((a, b) => (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0));
                setData(formattedData);
                if (formattedData.length === 0) {
                    setError(null);
                }
            } else {
                setData([]);
                setError((response as any)?.message || "Failed to fetch data or data is in an unexpected format.");
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

    const handleViewToggle = (newView: "pie" | "bar" | "line" | "area") => {
        setView(newView);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);

    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDatesForMonthly();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
    };

    const overallSummary = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.totalSales += curr.totalSales;
            acc.totalDiscount += curr.totalDiscount;
            acc.totalPayableAmount += curr.totalPayableAmount;
            return acc;
        }, { totalSales: 0, totalDiscount: 0, totalPayableAmount: 0 });
    }, [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const entry = view === 'pie' ? payload[0].payload.payload : payload[0].payload as ChartDataEntry;
            const monthLabel = view === 'pie' ? payload[0].name : entry.month;

            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: COLOR_TOOLTIP_BG,
                        borderColor: COLOR_BORDER,
                        minWidth: '200px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Month</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{monthLabel}</span>
                    </div>
                    {payload.map((pld: any, index: number) => (
                        <div key={index} className="mt-1">
                            <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{pld.name}</span>
                            <span className="fw-bold d-block" style={{ color: pld.color || pld.payload?.fill || COLOR_ACCENT }}>
                                {currencyFormatter.format(pld.value)}
                                {overallSummary.totalSales > 0 && pld.dataKey === "totalSales" && ` (${((pld.value / overallSummary.totalSales) * 100).toFixed(1)}%)`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent * 100 < 3) return null;

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="500">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderChart = () => {
        const commonProps = {
            data: data,
            margin: { top: 5, right: 5, left: 20, bottom: 5 },
        };
        const xAxisProps = {
            dataKey: "month",
            angle: view === "bar" ? -45 : 0,
            textAnchor: view === "bar" ? "end" as const : "middle" as const,
            height: view === "bar" ? 60 : 30,
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

        if (view === "pie") {
            const pieDataKey = "totalPayableAmount"; // Or totalSales, depending on what you want to show in pie
            return (
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={120}
                        dataKey={pieDataKey}
                        nameKey="month"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend {...legendProps} formatter={(value) => value} />
                </PieChart>
            );
        }

        const ChartComponent = view === "bar" ? BarChart : view === "line" ? LineChart : AreaChart;

        const elements = [
            { dataKey: "totalSales", name: "Total Sales", color: COLOR_ACCENT, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalSales)" : undefined },
            { dataKey: "totalDiscount", name: "Discount", color: COLOR_DISCOUNT, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalDiscount)" : undefined },
            { dataKey: "totalPayableAmount", name: "Net Sales", color: COLOR_PAYABLE, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalPayable)" : undefined },
        ];

        return (
            <ChartComponent {...commonProps} barGap={view === "bar" ? 4 : undefined} barCategoryGap={view === "bar" ? "20%" : undefined}>
                {view === "area" && (
                    <defs>
                        <linearGradient id="colorTotalSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorTotalDiscount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLOR_DISCOUNT} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_DISCOUNT} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorTotalPayable" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLOR_PAYABLE} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_PAYABLE} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                )}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                <Legend {...legendProps} />
                {elements.map(el => {
                    if (view === "bar") {
                        return (
                            <Bar
                                key={el.dataKey}
                                dataKey={el.dataKey}
                                name={el.name}
                                fill={el.color}
                                radius={4}
                                maxBarSize={100}
                                stackId="a"
                            />
                        );
                    } else if (view === "line") {
                        return (
                            <Line
                                key={el.dataKey}
                                type="monotone"
                                dataKey={el.dataKey}
                                name={el.name}
                                stroke={el.color}
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 1, fill: el.color }}
                                activeDot={{ r: 6, strokeWidth: 1.5, fill: el.color, stroke: COLOR_TOOLTIP_BG }}
                            />
                        );
                    } else if (view === "area") {
                        return (
                            <Area
                                key={el.dataKey}
                                type="monotone"
                                dataKey={el.dataKey}
                                name={el.name}
                                stroke={el.color}
                                fill={el.fillUrl || el.color}
                                fillOpacity={1}
                                strokeWidth={2}
                                stackId="a"
                            />
                        );
                    }
                    return null;
                })}
            </ChartComponent>
        );
    };

    const renderChartContainerContent = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading monthly sales...</p>
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
        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
        { type: "pie" as const, icon: RiPieChartLine, label: "Pie" },
    ];

    const generateReport = () => {
        if (data.length === 0) return null;

        const peakSalesMonth = data.reduce((prev, current) => (prev.totalSales > current.totalSales) ? prev : current, data[0]);
        const lowestSalesMonth = data.reduce((prev, current) => (prev.totalSales < current.totalSales) ? prev : current, data[0]);

        const averageSales = overallSummary.totalSales / data.length;
        const discountImpact = (overallSummary.totalDiscount / overallSummary.totalSales) * 100;

        // Calculate year-over-year growth if possible
        const currentYearData = data.filter(d => new Date(d.month).getFullYear() === new Date().getFullYear());
        const previousYearData = data.filter(d => new Date(d.month).getFullYear() === new Date().getFullYear() - 1);

        const yoyGrowth = currentYearData.length > 0 && previousYearData.length > 0
            ? ((currentYearData.reduce((sum, curr) => sum + curr.totalPayableAmount, 0) /
                previousYearData.reduce((sum, curr) => sum + curr.totalPayableAmount, 0)) - 1) * 100
            : null;

        return (
            <div className="mt-4">
                <div className="card border-0 bg-body-tertiary">
                    <div className="card-body p-4">
                        <h5 className="d-flex align-items-center gap-2 mb-4">
                            <RiFileList3Line size={24} style={{ color: COLOR_ACCENT }} />
                            <span>Sales Analysis Report</span>
                        </h5>

                        {/* Key Metrics Grid */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                                    <div className="text-muted small mb-1">Total Revenue</div>
                                    <div className="h5 mb-0" style={{ color: COLOR_ACCENT }}>
                                        {currencyFormatter.format(overallSummary.totalPayableAmount)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                                    <div className="text-muted small mb-1">Average Monthly Sales</div>
                                    <div className="h5 mb-0" style={{ color: COLOR_ACCENT }}>
                                        {currencyFormatter.format(averageSales)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                                    <div className="text-muted small mb-1">Total Discounts</div>
                                    <div className="h5 mb-0 text-warning">
                                        {currencyFormatter.format(overallSummary.totalDiscount)}
                                    </div>
                                    <div className="small text-muted">
                                        {discountImpact.toFixed(1)}% of sales
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                                    <div className="text-muted small mb-1">YoY Growth</div>
                                    <div className={`h5 mb-0 ${yoyGrowth != null ? (yoyGrowth > 0 ? 'text-success' : 'text-danger') : ''}`}>
                                        {yoyGrowth != null ? `${yoyGrowth.toFixed(1)}%` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Performance */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="bg-white rounded-3 shadow-sm p-3">
                                    <h6 className="mb-3">Peak Performance</h6>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted small">Highest Sales Month</span>
                                        <span className="fw-medium">{peakSalesMonth.month}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Amount</span>
                                        <span className="fw-medium text-success">
                                            {currencyFormatter.format(peakSalesMonth.totalPayableAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="bg-white rounded-3 shadow-sm p-3">
                                    <h6 className="mb-3">Lowest Performance</h6>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted small">Lowest Sales Month</span>
                                        <span className="fw-medium">{lowestSalesMonth.month}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small">Amount</span>
                                        <span className="fw-medium text-danger">
                                            {currencyFormatter.format(lowestSalesMonth.totalPayableAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Insights Panel */}
                        <div className="bg-white rounded-3 shadow-sm p-3 mt-4">
                            <h6 className="mb-3">Key Insights</h6>
                            <ul className="list-unstyled mb-0">
                                {discountImpact > 20 && (
                                    <li className="d-flex align-items-center gap-2 mb-2 text-warning">
                                        <RiErrorWarningLine size={18} />
                                        <small>High discount rate may be affecting profitability</small>
                                    </li>
                                )}
                                {peakSalesMonth.totalPayableAmount > averageSales * 1.5 && (
                                    <li className="d-flex align-items-center gap-2 mb-2 text-success">
                                        <RiLineChartLine size={18} />
                                        <small>Significant peak in {peakSalesMonth.month} - analyze success factors</small>
                                    </li>
                                )}
                                {lowestSalesMonth.totalPayableAmount < averageSales * 0.5 && (
                                    <li className="d-flex align-items-center gap-2 mb-2 text-danger">
                                        <RiErrorWarningLine size={18} />
                                        <small>Notable dip in {lowestSalesMonth.month} - investigate causes</small>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiLineChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        Monthly Sales Trend
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
                                <input id="startDateMST" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                            </div>
                            <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                    <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                                </span>
                                <input id="endDateMST" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
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
                    <h4 className="fs-6 fw-medium mb-3">Monthly Sales Data</h4>
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Month</th>
                                    <th scope="col" className="py-2 text-end">Total Sales</th>
                                    <th scope="col" className="py-2 text-end">Discount</th>
                                    <th scope="col" className="py-2 text-end">Net Sales</th>
                                    <th scope="col" className="py-2 text-end">% of Total Net Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry) => {
                                    const percentageOfTotal = overallSummary.totalPayableAmount > 0 ? ((entry.totalPayableAmount / overallSummary.totalPayableAmount) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={entry.month}>
                                            <td className="py-2">{entry.month}</td>
                                            <td className="py-2 text-end">{currencyFormatter.format(entry.totalSales)}</td>
                                            <td className="py-2 text-end">{currencyFormatter.format(entry.totalDiscount)}</td>
                                            <td className="py-2 text-end fw-medium">{currencyFormatter.format(entry.totalPayableAmount)}</td>
                                            <td className="py-2 text-end text-muted">{percentageOfTotal}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="fw-bold border-top">
                                    <td className="py-2">Total</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalSales)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalDiscount)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalPayableAmount)}</td>
                                    <td className="py-2 text-end">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {generateReport()}
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