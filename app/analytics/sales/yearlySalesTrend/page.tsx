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

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_DISCOUNT = '#7c3aed'; // Purple for total_discount
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

interface YearlySalesAPIEntry {
    year: number;
    totalCost: string;
    actual_revenue: string;
    accrued_revenue: string;
    total_discount: string;
    totalRefunded: string;
    total_expenses: string;
    net_revenue: string;
    outstanding_debt: string;
}

interface ChartDataEntry {
    year: string;
    totalCost: number;
    actual_revenue: number;
    accrued_revenue: number;
    total_discount: number;
    totalRefunded: number;
    total_expenses: number;
    net_revenue: number;
    outstanding_debt: number;
}

export default function YearlySalesTrend() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"pie" | "bar" | "line" | "area">("bar");
    const [pieMetric, setPieMetric] = useState<"totalCost" | "accrued_revenue" | "actual_revenue" | "total_expenses" | "net_revenue" | "outstanding_debt" | "total_discount" | "totalRefunded">("accrued_revenue");

    const { branchid, user } = useApplicationSettings().applicationsettings || {};
    const employeeid = user?.employeeid;

    const fetchData = useCallback(async (currentBranchId?: string, currentEmployeeId?: number) => {
        if (!currentBranchId) {
            setError("Branch ID is not available.");
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
        setLoading(true);
        setError(null);
        try {
            const url = `financials/billing/summary?key=yearlySalesTrend&branchid=${currentBranchId}&employeeid=${currentEmployeeId}`;
            const response: YearlySalesAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item) => ({
                    year: String(item.year || "N/A"),
                    totalCost: parseFloat(item.totalCost) || 0,
                    actual_revenue: parseFloat(item.actual_revenue) || 0,
                    accrued_revenue: parseFloat(item.accrued_revenue) || 0,
                    total_discount: parseFloat(item.total_discount) || 0,
                    totalRefunded: parseFloat(item.totalRefunded) || 0, total_expenses: parseFloat(item.total_expenses) || 0, net_revenue: parseFloat(item.net_revenue) || 0,
                    outstanding_debt: parseFloat(item.outstanding_debt) || 0,
                })).sort((a, b) => parseInt(b.year) - parseInt(a.year));
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
            console.error("Error fetching YearlySalesTrend:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (branchid && employeeid) {
            fetchData(branchid, employeeid);
        } else {
            setLoading(false);
            setError("Branch and employee information is not loaded yet.");
        }
    }, [fetchData, branchid, employeeid]);

    const handleViewToggle = (newView: "pie" | "bar" | "line" | "area") => {
        setView(newView);
    };

    const handleResetFilters = () => {
        // No filters to reset
    };

    const overallSummary = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.totalCost += curr.totalCost;
            acc.actual_revenue += curr.actual_revenue;
            acc.accrued_revenue += curr.accrued_revenue;
            acc.total_discount += curr.total_discount;
            acc.totalRefunded += curr.totalRefunded;
            acc.total_expenses += curr.total_expenses;
            acc.net_revenue += curr.net_revenue;
            acc.outstanding_debt += curr.outstanding_debt;
            return acc;
        }, { totalCost: 0, actual_revenue: 0, accrued_revenue: 0, total_discount: 0, totalRefunded: 0, total_expenses: 0, net_revenue: 0, outstanding_debt: 0 });
    }, [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const entry = view === 'pie' ? payload[0].payload.payload : payload[0].payload as ChartDataEntry;
            const yearLabel = view === 'pie' ? payload[0].name : entry.year;

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
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Year</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{yearLabel}</span>
                    </div>
                    {payload.map((pld: any, index: number) => {
                        const actualDataKey = view === 'pie' ? pieMetric : pld.dataKey;
                        const totalForMetric = overallSummary[actualDataKey as keyof typeof overallSummary] || 0;
                        const showPercentage = totalForMetric > 0 && (view === 'pie' || pld.dataKey === "totalCost");

                        return (
                            <div key={index} className="mt-1">
                                <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>
                                    {view === 'pie' ? pieMetricOptions.find(opt => opt.value === pieMetric)?.label || pld.name : pld.name}
                                </span>
                                <span className="fw-bold d-block" style={{ color: pld.color || pld.payload?.fill || COLOR_ACCENT }}>
                                    {currencyFormatter.format(pld.value)}
                                    {showPercentage && ` (${((pld.value / totalForMetric) * 100).toFixed(1)}%)`}
                                </span>
                            </div>
                        );
                    })}
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
            dataKey: "year",
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
            const pieDataKey = pieMetric;
            return (
                <PieChart key={`pie-${pieMetric}`} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={120}
                        dataKey={pieDataKey}
                        nameKey="year"
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
            { dataKey: "totalCost", name: "Total Cost", color: COLOR_ACCENT, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalCost)" : undefined },
            { dataKey: "actual_revenue", name: "Actual Revenue", color: 'oklch(0.6 0.15 142)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalPaid)" : undefined },
            { dataKey: "accrued_revenue", name: "Accrued Revenue", color: COLOR_PAYABLE, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalPayable)" : undefined },
            { dataKey: "total_discount", name: "Total Discount", color: COLOR_DISCOUNT, fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalDiscount)" : undefined },
            { dataKey: "totalRefunded", name: "Refunded", color: 'oklch(0.7 0.2 20)', fillOpacity: view === "area" ? 1 : undefined, fillUrl: view === "area" ? "url(#colorTotalRefunded)" : undefined },
        ];

        return (
            <ChartComponent {...commonProps} barGap={view === "bar" ? 4 : undefined} barCategoryGap={view === "bar" ? "20%" : undefined}>
                {view === "area" && (
                    <defs>
                        <linearGradient id="colorTotalCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorTotalPaid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor='oklch(0.6 0.15 142)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.6 0.15 142)' stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorTotalPayable" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLOR_PAYABLE} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_PAYABLE} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorTotalDiscount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLOR_DISCOUNT} stopOpacity={0.5} /><stop offset="95%" stopColor={COLOR_DISCOUNT} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorTotalRefunded" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor='oklch(0.7 0.2 20)' stopOpacity={0.5} /><stop offset="95%" stopColor='oklch(0.7 0.2 20)' stopOpacity={0.05} />
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
                    <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading yearly sales...</p>
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
        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
        { type: "pie" as const, icon: RiPieChartLine, label: "Pie" },
    ];

    const pieMetricOptions = [
        { value: "totalCost" as const, label: "Total Cost" },
        { value: "accrued_revenue" as const, label: "Accrued Revenue" },
        { value: "actual_revenue" as const, label: "Actual Revenue" },
        { value: "total_expenses" as const, label: "Total Expenses" },
        { value: "net_revenue" as const, label: "Net Revenue" },
        { value: "outstanding_debt" as const, label: "Outstanding Debt" },
        { value: "total_discount" as const, label: "Total Discount" },
        { value: "totalRefunded" as const, label: "Refunded" },
    ];

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        {view === "pie" ? `${pieMetricOptions.find(opt => opt.value === pieMetric)?.label || 'Yearly'} Distribution` : 'Yearly Sales Trend'}
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                            {viewButtons.map(btn => (
                                <button
                                    key={btn.type}
                                    type="button"
                                    className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center`}
                                    onClick={() => handleViewToggle(btn.type)}
                                    style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                >
                                    <btn.icon size={16} className="me-1 flex-shrink-0" /> {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '180px', minWidth: '170px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <RiMoneyDollarCircleLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                            <select
                                className="form-select shadow-none border-start-0"
                                value={pieMetric}
                                onChange={(e) => setPieMetric(e.target.value as typeof pieMetric)}
                                disabled={view !== "pie"}
                                title={view === "pie" ? "Select metric for pie chart" : "Switch to pie view to select metric"}
                                style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem', opacity: view === "pie" ? 1 : 0.5 }}
                            >
                                {pieMetricOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                    <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0 text-warning" /> <span className="ms-1">{error}</span>
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartContainerContent()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <div className="print-date-range" style={{ display: 'none' }}>
                        Sales Report - All Years
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
                                    <th scope="col" className="py-2">Year</th>
                                    <th scope="col" className="py-2 text-start">Total Cost</th>
                                    <th scope="col" className="py-2 text-start">Total Discount</th>
                                    <th scope="col" className="py-2 text-start">Outstanding Debt</th>
                                    <th scope="col" className="py-2 text-start">Refunded</th>
                                    <th scope="col" className="py-2 text-start">Accrued Revenue</th>
                                    <th scope="col" className="py-2 text-start">Actual Revenue</th>
                                    <th scope="col" className="py-2 text-start fw-bold text-dark" style={{ backgroundColor: '#f8d7da' }}>Total Expenses</th>
                                    <th scope="col" className="py-2 text-start fw-bold text-dark" style={{ backgroundColor: '#d4edda' }}>Net Revenue</th>
                                    <th scope="col" className="py-2 text-start">Expense Change</th>
                                    <th scope="col" className="py-2 text-start">Sales Change</th>
                                    <th scope="col" className="py-2 text-start">Net Revenue Change</th>
                                    <th scope="col" className="py-2 text-start">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => {
                                    const percentageOfTotal = overallSummary.accrued_revenue > 0 ? ((entry.accrued_revenue / overallSummary.accrued_revenue) * 100).toFixed(1) : '0.0';

                                    // Calculate changes from previous year
                                    let salesChange = '-';
                                    let netRevenueChange = '-';
                                    let expenseChange = '-';

                                    if (index > 0) {
                                        const prevEntry = data[index - 1];

                                        // Sales change (accrued_revenue)
                                        if (prevEntry.accrued_revenue === 0 && entry.accrued_revenue > 0) {
                                            salesChange = 'New';
                                        } else if (prevEntry.accrued_revenue > 0) {
                                            const change = ((entry.accrued_revenue - prevEntry.accrued_revenue) / prevEntry.accrued_revenue) * 100;
                                            salesChange = change.toFixed(1) + '%';
                                        }

                                        // Net revenue change
                                        if (prevEntry.net_revenue === 0 && entry.net_revenue > 0) {
                                            netRevenueChange = 'New';
                                        } else if (prevEntry.net_revenue > 0) {
                                            const change = ((entry.net_revenue - prevEntry.net_revenue) / prevEntry.net_revenue) * 100;
                                            netRevenueChange = change.toFixed(1) + '%';
                                        }

                                        // Expense change
                                        if (prevEntry.total_expenses === 0 && entry.total_expenses > 0) {
                                            expenseChange = 'New';
                                        } else if (prevEntry.total_expenses > 0) {
                                            const change = ((entry.total_expenses - prevEntry.total_expenses) / prevEntry.total_expenses) * 100;
                                            expenseChange = change.toFixed(1) + '%';
                                        }
                                    }

                                    return (
                                        <tr key={entry.year}>
                                            <td className="py-2 fw-medium">{entry.year}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.totalCost)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.total_discount)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.outstanding_debt)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.totalRefunded)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.accrued_revenue)}</td>
                                            <td className="py-2 fw-medium">{currencyFormatter.format(entry.actual_revenue)}</td>
                                            <td className="py-2 fw-medium fw-bold text-dark" style={{ backgroundColor: '#f8d7da' }}>{currencyFormatter.format(entry.total_expenses)}</td>
                                            <td className="py-2 fw-medium fw-bold text-dark" style={{ backgroundColor: '#d4edda' }}>{currencyFormatter.format(entry.net_revenue)}</td>
                                            <td className={`py-2 fw-medium ${expenseChange !== '-' && expenseChange !== 'New' && parseFloat(expenseChange) >= 0 ? 'text-success' : expenseChange !== '-' && expenseChange !== 'New' ? 'text-danger' : ''}`}>
                                                {expenseChange}
                                            </td>
                                            <td className={`py-2 fw-medium ${salesChange !== '-' && salesChange !== 'New' && parseFloat(salesChange) >= 0 ? 'text-success' : salesChange !== '-' && salesChange !== 'New' ? 'text-danger' : ''}`}>
                                                {salesChange}
                                            </td>
                                            <td className={`py-2 fw-medium ${netRevenueChange !== '-' && netRevenueChange !== 'New' && parseFloat(netRevenueChange) >= 0 ? 'text-success' : netRevenueChange !== '-' && netRevenueChange !== 'New' ? 'text-danger' : ''}`}>
                                                {netRevenueChange}
                                            </td>
                                            <td className="py-2 fw-medium">{percentageOfTotal}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="fw-bold border-top">
                                <tr>
                                    <td className="py-2 fw-medium">Total</td>
                                    <td className="py-2 fw-medium">{currencyFormatter.format(overallSummary.totalCost)}</td>
                                    <td className="py-2 fw-medium">{currencyFormatter.format(overallSummary.total_discount)}</td>
                                    <td className="py-2 fw-medium">{currencyFormatter.format(overallSummary.outstanding_debt)}</td>
                                    <td className="py-2 fw-medium">{currencyFormatter.format(overallSummary.totalRefunded)}</td>
                                    <td className="py-2 fw-medium">{currencyFormatter.format(overallSummary.accrued_revenue)}</td>
                                    <td className="py-2 fw-medium">{currencyFormatter.format(overallSummary.actual_revenue)}</td>
                                    <td className="py-2 fw-medium fw-bold text-dark" style={{ backgroundColor: '#f8d7da' }}>{currencyFormatter.format(overallSummary.total_expenses)}</td>
                                    <td className="py-2 fw-medium fw-bold text-dark" style={{ backgroundColor: '#d4edda' }}>{currencyFormatter.format(overallSummary.net_revenue)}</td>
                                    <td className="py-2 fw-medium text-muted">-</td>
                                    <td className="py-2 fw-medium text-muted">-</td>
                                    <td className="py-2 fw-medium text-muted">-</td>
                                    <td className="py-2 fw-medium text-muted">100.0%</td>
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
                    .printable-table-with-borders th:nth-child(9),
                    .printable-table-with-borders td:nth-child(9) {
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