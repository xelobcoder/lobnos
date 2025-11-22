"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";

// --- Icons (Placeholders - use your icon library e.g., Remixicon, Lucide) ---
// import { RiPieChartLine, RiBarChartBoxLine, RiCalendarEventLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiRefreshLine } from "@remixicon/react";
const IconChart = () => <span style={{ fontSize: '1.2rem', color: COLOR_ACCENT, marginRight: '0.5rem' }}>📈</span>;
const IconPie = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🥧</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', color: COLOR_TEXT_MUTED }}>📅</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: COLOR_ACCENT }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: COLOR_TEXT_MUTED }}>📦</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;


// --- Color Palette ---
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb'; // Blue for totalPaid
const COLOR_TERTIARY = '#ea580c'; // Orange for totalDiscount

const PIE_CHART_COLORS = [
    COLOR_ACCENT,
    COLOR_SECONDARY,
    COLOR_TERTIARY,
    'oklch(0.769 0.188 70.08)',
    'oklch(0.6 0.118 184.704)',
    'oklch(0.828 0.189 84.429)',
    'oklch(0.398 0.07 227.392)',
];

interface EmployeeSalesAPIEntry {
    employeeid: number;
    totalCost: string;
    totalPaid: string;
    totalPayable: string;
    totalDiscount: string;
    totalRefunded: string;
    username: string;
}

interface ChartDataEntry {
    username: string;
    totalPayable: number;
    totalCost: number;
    totalPaid: number;
    totalDiscount: number;
    profit: number;
    collectionRate: number;
}

const getInitialDates = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString().split("T")[0]; // January 1st
    const endDate = new Date(currentYear, 11, 31).toISOString().split("T")[0]; // December 31st
    return {
        startDate,
        endDate,
    };
};

export default function TotalSalesByEmployee() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"bar" | "pie">("bar");

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);

    const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string) => {
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
            const url = `financials/billing/summary?key=totalSalesByEmployee&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
            const response: EmployeeSalesAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item) => {
                    const totalPayable = parseFloat(item.totalPayable) || 0;
                    const totalCost = parseFloat(item.totalCost) || 0;
                    const totalPaid = parseFloat(item.totalPaid) || 0;
                    const totalDiscount = parseFloat(item.totalDiscount) || 0;
                    const profit = totalPayable - totalCost;
                    const collectionRate = totalPayable > 0 ? (totalPaid / totalPayable) * 100 : 0;

                    return {
                        username: item.username || "Unknown Employee",
                        totalPayable,
                        totalCost,
                        totalPaid,
                        totalDiscount,
                        profit,
                        collectionRate,
                    };
                }).sort((a, b) => b.totalPayable - a.totalPayable);
                setData(formattedData);
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
        fetchData(startDate, endDate);
    }, [fetchData]);

    const handleToggleView = () => setView((prevView) => (prevView === "pie" ? "bar" : "pie"));
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
    };
    const handleLoadData = () => {
        fetchData(startDate, endDate);
    };

    const totalPayableOverall = data.reduce((sum, entry) => sum + entry.totalPayable, 0);

    const processedData = data.map((entry) => ({
        employeeName: entry.username,
        totalPayable: entry.totalPayable,
        totalPaid: entry.totalPaid,
        totalCost: entry.totalCost,
        totalDiscount: entry.totalDiscount,
        collectionRate: entry.totalPayable > 0 ? (entry.totalPaid / entry.totalPayable) * 100 : 0,
        percentageOfTotal: totalPayableOverall > 0 ? (entry.totalPayable / totalPayableOverall) * 100 : 0,
    }));

    const overallSummary = processedData.reduce(
        (acc, employee) => ({
            totalPayable: acc.totalPayable + employee.totalPayable,
            totalPaid: acc.totalPaid + employee.totalPaid,
            totalCost: acc.totalCost + employee.totalCost,
            totalDiscount: acc.totalDiscount + employee.totalDiscount,
            collectionRate: processedData.length > 0 ? (acc.totalPaid + employee.totalPaid) / (acc.totalPayable + employee.totalPayable) * 100 : 0,
        }),
        { totalPayable: 0, totalPaid: 0, totalCost: 0, totalDiscount: 0, collectionRate: 0 }
    );

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentData = payload[0].payload;
            const name = view === 'pie' ? payload[0].name : label;
            const value = payload[0].value;

            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: COLOR_TOOLTIP_BG,
                        borderColor: COLOR_BORDER,
                        color: COLOR_TOOLTIP_FG,
                        minWidth: '180px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-1 fw-medium" style={{ color: COLOR_TOOLTIP_FG }}>{name}</div>
                    <div style={{ color: payload[0].fill || COLOR_ACCENT }}>
                        {currencyFormatter.format(value)}
                    </div>
                    {totalPayableOverall > 0 && (
                        <div className="text-xs" style={{ color: COLOR_TEXT_MUTED }}>
                            {((value / totalPayableOverall) * 100).toFixed(1)}% of total
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent * 100 < 3) return null; // Don't render label for very small slices

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="500">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    const renderChartArea = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                    <IconLoader />
                    <p className="mt-3" style={{ color: COLOR_TEXT_MUTED }}>Loading employee sales...</p>
                </div>
            );
        }
        if (error && data.length === 0) { // Only show full page error if no data could be shown at all
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
                        No employee sales data found for the selected period.
                    </p>
                </div>
            );
        }

        const chartHeight = 400;

        if (view === "pie") {
            return (
                <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="totalPayable"
                                nameKey="username"
                                cx="50%"
                                cy="50%"
                                outerRadius={Math.min(window.innerWidth / 4, 150)} // Responsive radius
                                labelLine={false}
                                label={renderCustomizedPieLabel}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltipContent />} />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '13px', color: COLOR_TOOLTIP_FG, paddingLeft: '20px', maxHeight: chartHeight - 40, overflowY: 'auto' }}
                                formatter={(value, entry) => <span style={{ color: COLOR_TEXT_MUTED }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        } else { // Bar Chart
            const numDataPoints = data.length;
            const angleXAxis = numDataPoints > 6;
            const bottomMargin = angleXAxis ? 80 : 40;

            return (
                <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: bottomMargin }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                            <XAxis
                                dataKey="username"
                                angle={angleXAxis ? -45 : 0}
                                textAnchor={angleXAxis ? "end" : "middle"}
                                height={angleXAxis ? 90 : 50}
                                interval={0}
                                tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                axisLine={{ stroke: COLOR_BORDER }}
                                tickLine={{ stroke: COLOR_BORDER }}
                            />
                            <YAxis
                                tickFormatter={(value) => currencyFormatter.format(value)}
                                tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                axisLine={false}
                                tickLine={false}
                                width={90}
                            />
                            <Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                            <Bar
                                dataKey="totalPayable"
                                fill={COLOR_ACCENT}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_TOOLTIP_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <IconChart /> Total Sales by Employee
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                type="button"
                                className={`btn ${view === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                onClick={() => setView('bar')}
                                style={view === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                            >
                                <IconBar /> Bar
                            </button>
                            <button
                                type="button"
                                className={`btn ${view === 'pie' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                onClick={() => setView('pie')}
                                style={view === 'pie' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                            >
                                <IconPie /> Pie
                            </button>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <IconCalendar />
                            </span>
                            <input id="startDateTSE" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <IconCalendar />
                            </span>
                            <input id="endDateTSE" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
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
                {error && data.length > 0 && ( // Show dismissible error if data is also present
                    <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                        <IconError /> <span className="ms-2">{error}</span>
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartArea()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <h4 className="fs-6 fw-medium mb-3">Employee Sales Breakdown</h4>
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Employee Name</th>
                                    <th scope="col" className="py-2 text-end">Total Payable</th>
                                    <th scope="col" className="py-2 text-end">Total Paid</th>
                                    <th scope="col" className="py-2 text-end">Total Cost</th>
                                    <th scope="col" className="py-2 text-end">Total Discount</th>
                                    <th scope="col" className="py-2 text-end">Collection Rate</th>
                                    <th scope="col" className="py-2 text-end">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.map((employee, index) => (
                                    <tr key={employee.employeeName + index}>
                                        <td className="py-2">{employee.employeeName}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(employee.totalPayable)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(employee.totalPaid)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(employee.totalCost)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(employee.totalDiscount)}</td>
                                        <td className="py-2 text-end">{employee.collectionRate.toFixed(1)}%</td>
                                        <td className="py-2 text-end">{employee.percentageOfTotal.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="fw-bold border-top">
                                <tr>
                                    <td className="py-2">Total</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalPayable)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalPaid)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalCost)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalDiscount)}</td>
                                    <td className="py-2 text-end">{overallSummary.collectionRate.toFixed(1)}%</td>
                                    <td className="py-2 text-end">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .recharts-default-legend { margin-left: 20px !important; }
                .table-responsive thead.sticky-top th {
                    background-color: var(--bs-tertiary-bg) !important; /* Ensure sticky header bg */
                    border-bottom: 2px solid var(--bs-border-color); 
                }
            `}</style>
        </div>
    );
}