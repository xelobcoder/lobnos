"use client";

import React, { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: COLOR_ACCENT, marginRight: '0.5rem' }}>🔄</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: COLOR_ACCENT }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconPie = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🥧</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📅</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;

// --- Color Palette ---
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)'; const getInitialDates = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString().split("T")[0]; // January 1st
    const endDate = new Date(currentYear, 11, 31).toISOString().split("T")[0]; // December 31st
    return { startDate, endDate };
};

interface OutsourcedStatusAPIEntry {
    isoutsourced: 0 | 1;
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
    isoutsourced: 0 | 1;
}

export default function TotalSalesByOutsourcedStatus() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

    useEffect(() => {
        // Initial load with default dates
        fetchData(startDate, endDate);
    }, []);

    const fetchData = async (fetchStartDate: string, fetchEndDate: string) => {
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
            const url = `financials/billing/summary?key=totalSalesByOutsourcedStatus&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
            const response: OutsourcedStatusAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const notOutsourcedEntry = response.find(item => item.isoutsourced === 0);
                const outsourcedEntry = response.find(item => item.isoutsourced === 1);

                const mappedData: ChartDataEntry[] = [
                    {
                        name: "Not Outsourced",
                        totalCost: parseFloat(notOutsourcedEntry?.totalCost || "0") || 0,
                        totalPaid: parseFloat(notOutsourcedEntry?.totalPaid || "0") || 0,
                        totalPayable: parseFloat(notOutsourcedEntry?.totalPayable || "0") || 0,
                        totalDiscount: parseFloat(notOutsourcedEntry?.totalDiscount || "0") || 0,
                        totalRefunded: parseFloat(notOutsourcedEntry?.totalRefunded || "0") || 0,
                        isoutsourced: 0,
                    },
                    {
                        name: "Outsourced",
                        totalCost: parseFloat(outsourcedEntry?.totalCost || "0") || 0,
                        totalPaid: parseFloat(outsourcedEntry?.totalPaid || "0") || 0,
                        totalPayable: parseFloat(outsourcedEntry?.totalPayable || "0") || 0,
                        totalDiscount: parseFloat(outsourcedEntry?.totalDiscount || "0") || 0,
                        totalRefunded: parseFloat(outsourcedEntry?.totalRefunded || "0") || 0,
                        isoutsourced: 1,
                    },
                ];
                setData(mappedData.filter(d => d.totalPayable > 0)); // Only show if payable > 0
            } else {
                setData([]);
                setError((response as any)?.message || "Failed to fetch data or data is in an unexpected format.");
            }
        } catch (err) {
            setData([]);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            console.error("Error fetching TotalSalesByOutsourcedStatus:", err);
        } finally {
            setLoading(false);
        }
    };

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



    const renderChartArea = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <IconLoader />
                    <p className="mt-3" style={{ color: COLOR_TEXT_MUTED }}>Loading outsourced status sales...</p>
                </div>
            );
        }
        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconError />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>Error Loading Data</h5>
                    <p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>{error}</p>
                </div>
            );
        }
        if (data.length === 0 || totalPayableOverall === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconEmpty />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: COLOR_TOOLTIP_FG }}>No Data Available</h5>
                    <p className="px-3" style={{ color: COLOR_TEXT_MUTED, fontSize: '0.9rem' }}>
                        No sales data found for outsourced status.
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

        // Pie chart colors
        const pieColors = [COLOR_ACCENT, 'oklch(0.6 0.15 142)'];

        if (chartType === 'pie') {
            return (
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="totalPayable"
                                nameKey="name"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [currencyFormatter.format(value), 'Total Payable']}
                                labelFormatter={(label) => `${label}`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return (
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} vertical={false} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip {...tooltipProps} />
                        <Bar
                            dataKey="totalPayable"
                            fill={COLOR_ACCENT}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={80}
                            name="Total Payable"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER, backgroundColor: COLOR_TOOLTIP_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderBottom: `1px solid ${COLOR_BORDER}` }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <IconChart /> Total Sales by Outsourced Status
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type toggle">
                            <button
                                type="button"
                                className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setChartType('bar')}
                                style={chartType === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                            >
                                <IconBar /> Bar
                            </button>
                            <button
                                type="button"
                                className={`btn ${chartType === 'pie' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setChartType('pie')}
                                style={chartType === 'pie' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                            >
                                <IconPie /> Pie
                            </button>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <IconCalendar />
                            </span>
                            <input id="startDateTSOS" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <IconCalendar />
                            </span>
                            <input id="endDateTSOS" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
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
                {error && data.length > 0 && (
                    <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                        <IconError /> <span className="ms-2">{error}</span>
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartArea()}
            </div>

            {data.length > 0 && totalPayableOverall > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                    <h4 className="fs-6 fw-medium mb-3">Outsourced Status Sales Breakdown</h4>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Status</th>
                                    <th scope="col" className="py-2 text-end">Total Cost</th>
                                    <th scope="col" className="py-2 text-end">Amount Paid</th>
                                    <th scope="col" className="py-2 text-end">Net Payable</th>
                                    <th scope="col" className="py-2 text-end">Discount</th>
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
                                    <td className="py-2 text-end">100.0%</td>
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