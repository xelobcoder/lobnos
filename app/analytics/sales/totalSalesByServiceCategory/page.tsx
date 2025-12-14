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
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: "#3B82F6", marginRight: '0.5rem' }}>🏷️</span>;
const IconPie = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🥧</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', color: "#64748B" }}>📅</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: "#3B82F6" }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;

// --- Color Palette ---
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_HOVER = 'oklch(0.646 0.222 41.116 / 0.1)'; // Semi-transparent accent for hover states

const PIE_CHART_COLORS = [
    COLOR_ACCENT, 'oklch(0.6 0.15 142)', 'oklch(0.7 0.2 85)', 'oklch(0.5 0.25 25)',
    'oklch(0.55 0.2 15)', '#A855F7', '#EC4899', '#78716C', '#F97316', '#D946EF'
];

interface ServiceCategoryAPIEntry {
    branchid: number;
    serviceCategory: string;
    totalCost: string;
    totalPaid: string;
    totalPayable: string;
    totalDiscount: string;
    totalRefunded: string;
}

interface ChartDataEntry {
    name: string;
    totalCost: number;
    totalPaid: number;
    totalPayable: number;
    totalDiscount: number;
    totalRefunded: number;
    branchid: number;
}

const getInitialDates = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of current year
    return {
        startDate: firstDayOfYear.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
    };
};

export default function TotalSalesByServiceCategory() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"bar" | "pie">("bar");

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
            setData([]); setLoading(false); return;
        }
        if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
            setError("Start date cannot be after end date.");
            setData([]); setLoading(false); return;
        }

        setLoading(true); setError(null);
        try {
            const url = `financials/billing/summary?key=totalSalesByBranchAndCategory&startDate=${fetchStartDate}&endDate=${fetchEndDate}&employeeid=${currentEmployeeId}`;
            const response: ServiceCategoryAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const groupedData: { [key: string]: { totalCost: number; totalPaid: number; totalPayable: number; totalDiscount: number; totalRefunded: number; branchid: number } } = {};

                response.forEach(item => {
                    const categoryName = item.serviceCategory || "Uncategorized";
                    if (!groupedData[categoryName]) {
                        groupedData[categoryName] = {
                            totalCost: 0,
                            totalPaid: 0,
                            totalPayable: 0,
                            totalDiscount: 0,
                            totalRefunded: 0,
                            branchid: item.branchid
                        };
                    }
                    groupedData[categoryName].totalCost += parseFloat(item.totalCost) || 0;
                    groupedData[categoryName].totalPaid += parseFloat(item.totalPaid) || 0;
                    groupedData[categoryName].totalPayable += parseFloat(item.totalPayable) || 0;
                    groupedData[categoryName].totalDiscount += parseFloat(item.totalDiscount) || 0;
                    groupedData[categoryName].totalRefunded += parseFloat(item.totalRefunded) || 0;
                });

                const formattedData = Object.entries(groupedData)
                    .map(([name, values]) => ({
                        name,
                        totalCost: values.totalCost,
                        totalPaid: values.totalPaid,
                        totalPayable: values.totalPayable,
                        totalDiscount: values.totalDiscount,
                        totalRefunded: values.totalRefunded,
                        branchid: values.branchid
                    }))
                    .sort((a, b) => b.totalPayable - a.totalPayable);
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
        if (employeeid) {
            // Initial load with default dates
            fetchData(startDate, endDate, employeeid);
        } else {
            setLoading(false);
            setError("Employee information is not loaded yet.");
        }
    }, [employeeid]); // Only run when employeeid is available

    const handleToggleView = () => setView((prevView) => (prevView === "pie" ? "bar" : "pie"));
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        // Automatically load data with default dates
        setTimeout(() => fetchData(defaultStartDate, defaultEndDate), 0);
    };
    const handleLoadData = () => {
        fetchData(startDate, endDate);
    };

    const totalPayableOverall = data.reduce((sum, entry) => sum + entry.totalPayable, 0);

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentData = payload[0].payload;
            const name = view === 'pie' ? payload[0].name : label;
            const value = payload[0].value;

            return (
                <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, color: COLOR_TOOLTIP_FG, minWidth: '220px', fontSize: '0.8rem' }}>
                    <div className="mb-2 fw-medium" style={{ color: COLOR_TOOLTIP_FG }}>{name}</div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Net Payable</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                            {currencyFormatter.format(currentData.totalPayable)}
                        </span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Amount Paid</span>
                        <span className="fw-bold d-block" style={{ color: 'oklch(0.6 0.15 142)' }}>
                            {currencyFormatter.format(currentData.totalPaid)}
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
                            <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Share of Total</span>
                            <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                                {((currentData.totalPayable / totalPayableOverall) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (percent * 100 < 3) return null;
        return (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="500">{`${(percent * 100).toFixed(0)}%`}</text>);
    };

    const renderChartArea = () => {
        if (loading) {
            return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}><IconLoader /><p className="mt-3" style={{ color: COLOR_TEXT_MUTED }}>Loading service category sales...</p></div>);
        }
        if (error && data.length === 0) {
            return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><IconError /><h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>Error Loading Data</h5><p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>{error}</p></div>);
        }
        if (data.length === 0) {
            return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><IconEmpty /><h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>No Data Available</h5><p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>No sales data found for service categories in the selected period.</p></div>);
        }

        const chartHeight = 400;

        if (view === "pie") {
            return (
                <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="totalPayable" nameKey="name" cx="50%" cy="50%" outerRadius={Math.min(window.innerWidth / 4.5, 140)} labelLine={false} label={renderCustomizedPieLabel} >
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />))}
                            </Pie>
                            <Tooltip content={<CustomTooltipContent />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: COLOR_TOOLTIP_FG, paddingLeft: '15px', maxHeight: chartHeight - 40, overflowY: 'auto' }} formatter={(value) => <span style={{ color: COLOR_TEXT_MUTED }}>{value.length > 20 ? value.substring(0, 18) + '...' : value}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        } else {
            const numDataPoints = data.length;
            const angleXAxis = numDataPoints > 5;
            const bottomMargin = angleXAxis ? 90 : 50;

            return (
                <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: bottomMargin }} barGap={4} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                            <XAxis dataKey="name" angle={angleXAxis ? -45 : 0} textAnchor={angleXAxis ? "end" : "middle"} height={angleXAxis ? 100 : 60} interval={0} tick={{ fontSize: 10, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                            <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip content={<CustomTooltipContent />} cursor={{ fill: COLOR_HOVER }} />
                            <Bar dataKey="totalPayable" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={40} />
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
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center"><IconChart /> Total Sales by Service Category</h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group">
                            <button type="button" className={`btn ${view === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('bar')} style={view === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}><IconBar /> Bar</button>
                            <button type="button" className={`btn ${view === 'pie' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('pie')} style={view === 'pie' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}><IconPie /> Pie</button>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}><IconCalendar /></span>
                            <input id="startDateTSSC" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}><IconCalendar /></span>
                            <input id="endDateTSSC" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
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
                {error && data.length > 0 && (<div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert"><IconError /> <span className="ms-2">{error}</span><button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button></div>)}
                {renderChartArea()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <h4 className="fs-6 fw-medium mb-3">Service Category Sales Breakdown</h4>
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Service Category</th>
                                    <th scope="col" className="py-2 text-end">Total Cost</th>
                                    <th scope="col" className="py-2 text-end">Amount Paid</th>
                                    <th scope="col" className="py-2 text-end">Net Payable</th>
                                    <th scope="col" className="py-2 text-end">Discount</th>
                                    <th scope="col" className="py-2 text-end">Refunded</th>
                                    <th scope="col" className="py-2 text-end">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => (
                                    <tr key={entry.name + index}>
                                        <td className="py-2">{entry.name}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(entry.totalCost)}</td>
                                        <td className="py-2 text-end">{entry.totalPaid ? currencyFormatter.format(entry.totalPaid) : '-'}</td>
                                        <td className="py-2 text-end fw-medium">{currencyFormatter.format(entry.totalPayable)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(entry.totalDiscount)}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(entry.totalRefunded)}</td>
                                        <td className="py-2 text-end text-muted">
                                            {totalPayableOverall > 0 ? ((entry.totalPayable / totalPayableOverall) * 100).toFixed(1) : '0.0'}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="fw-bold border-top">
                                <tr>
                                    <td className="py-2">Total</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalCost, 0))}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalPaid, 0))}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(totalPayableOverall)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalDiscount, 0))}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(data.reduce((sum, entry) => sum + entry.totalRefunded, 0))}</td>
                                    <td className="py-2 text-end">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .recharts-default-legend { margin-left: 15px !important; }
                .table-responsive thead.sticky-top th { background-color: var(--bs-tertiary-bg) !important; border-bottom: 2px solid var(--bs-border-color); }
            `}</style>
        </div>
    );
}