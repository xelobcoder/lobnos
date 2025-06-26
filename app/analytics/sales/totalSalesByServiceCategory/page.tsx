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

const IconChart = () => <span style={{ fontSize: '1.2rem', color: "#3B82F6", marginRight: '0.5rem' }}>🏷️</span>;
const IconPie = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🥧</span>;
const IconBar = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>📊</span>;
const IconCalendar = () => <span style={{ fontSize: '1rem', color: "#64748B" }}>📅</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: "#3B82F6" }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;
const IconRefresh = () => <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>🔄</span>;

const SHADCN_PRIMARY = "#3B82F6";
const SHADCN_SECONDARY = "#60A5FA";
const SHADCN_ACCENT_GREEN = "#10B981";
const SHADCN_ACCENT_YELLOW = "#F59E0B";
const SHADCN_ACCENT_RED = "#EF4444";
const SHADCN_FOREGROUND = "#0F172A";
const SHADCN_MUTED_FOREGROUND = "#64748B";
const SHADCN_BORDER = "#E2E8F0";
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC";
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A";

const PIE_CHART_COLORS = [
    SHADCN_PRIMARY, SHADCN_ACCENT_GREEN, SHADCN_ACCENT_YELLOW, SHADCN_SECONDARY,
    SHADCN_ACCENT_RED, '#A855F7', '#EC4899', '#78716C', '#F97316', '#D946EF'
];

interface ServiceCategoryAPIEntry {
    serviceCategory: string;
    totalSales: string;
}

interface ChartDataEntry {
    name: string;
    totalSales: number;
}

const getInitialDates = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
        startDate: firstDayOfMonth.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
    };
};

export default function TotalSalesByServiceCategory() {
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
            setData([]); setLoading(false); return;
        }
        if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
            setError("Start date cannot be after end date.");
            setData([]); setLoading(false); return;
        }

        setLoading(true); setError(null);
        try {
            const url = `financials/billing/summary?key=totalSalesByBranchAndCategory&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
            const response: ServiceCategoryAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const groupedData: { [key: string]: number } = {};
                response.forEach(item => {
                    const categoryName = item.serviceCategory || "Uncategorized";
                    groupedData[categoryName] = (groupedData[categoryName] || 0) + (parseFloat(item.totalSales) || 0);
                });
                
                const formattedData = Object.entries(groupedData)
                    .map(([name, totalSales]) => ({ name, totalSales }))
                    .sort((a, b) => b.totalSales - a.totalSales);
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
    }, [startDate, endDate, fetchData]);

    const handleToggleView = () => setView((prevView) => (prevView === "pie" ? "bar" : "pie"));
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate); setEndDate(defaultEndDate);
    };

    const totalSalesOverall = data.reduce((sum, entry) => sum + entry.totalSales, 0);

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentData = payload[0].payload;
            const name = view === 'pie' ? payload[0].name : label;
            const value = payload[0].value;

            return (
                <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: SHADCN_TOOLTIP_BG, borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, minWidth: '180px', fontSize: '0.8rem' }}>
                    <div className="mb-1 fw-medium" style={{color: SHADCN_FOREGROUND}}>{name}</div>
                    <div style={{ color: payload[0].fill || SHADCN_PRIMARY }}>Sales: {currencyFormatter.format(value)}</div>
                    {totalSalesOverall > 0 && (<div className="text-xs" style={{color: SHADCN_MUTED_FOREGROUND}}>{((value / totalSalesOverall) * 100).toFixed(1)}% of total</div>)}
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
            return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}><IconLoader /><p className="mt-3" style={{ color: SHADCN_MUTED_FOREGROUND }}>Loading service category sales...</p></div>);
        }
        if (error && data.length === 0) {
            return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><IconError /><h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>Error Loading Data</h5><p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>{error}</p></div>);
        }
        if (data.length === 0) {
            return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><IconEmpty /><h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>No Data Available</h5><p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>No sales data found for service categories in the selected period.</p></div>);
        }

        const chartHeight = 400;

        if (view === "pie") {
            return (
                <div style={{ width: '100%', height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} dataKey="totalSales" nameKey="name" cx="50%" cy="50%" outerRadius={Math.min(window.innerWidth / 4.5, 140)} labelLine={false} label={renderCustomizedPieLabel} >
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />))}
                            </Pie>
                            <Tooltip content={<CustomTooltipContent />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: SHADCN_FOREGROUND, paddingLeft: '15px', maxHeight: chartHeight - 40, overflowY: 'auto' }} formatter={(value) => <span style={{color: SHADCN_MUTED_FOREGROUND}}>{value.length > 20 ? value.substring(0,18)+'...' : value}</span>}/>
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
                            <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} vertical={false} />
                            <XAxis dataKey="name" angle={angleXAxis ? -45 : 0} textAnchor={angleXAxis ? "end" : "middle"} height={angleXAxis ? 100 : 60} interval={0} tick={{ fontSize: 10, fill: SHADCN_MUTED_FOREGROUND }} axisLine={{ stroke: SHADCN_BORDER }} tickLine={{ stroke: SHADCN_BORDER }} />
                            <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip content={<CustomTooltipContent />} cursor={{ fill: `${SHADCN_PRIMARY}1A` }} />
                            <Bar dataKey="totalSales" fill={SHADCN_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center"><IconChart /> Total Sales by Service Category</h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group">
                            <button type="button" className={`btn ${view === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('bar')} style={view === 'bar' ? {backgroundColor: SHADCN_PRIMARY, borderColor: SHADCN_PRIMARY} : {}}><IconBar /> Bar</button>
                            <button type="button" className={`btn ${view === 'pie' ? 'btn-primary active' : 'btn-outline-secondary'}`} onClick={() => setView('pie')} style={view === 'pie' ? {backgroundColor: SHADCN_PRIMARY, borderColor: SHADCN_PRIMARY} : {}}><IconPie /> Pie</button>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: SHADCN_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}><IconCalendar/></span>
                            <input id="startDateTSSC" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: SHADCN_BORDER, paddingLeft: '0.3rem' }}/>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: SHADCN_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}><IconCalendar/></span>
                            <input id="endDateTSSC" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: SHADCN_BORDER, paddingLeft: '0.3rem' }}/>
                        </div>
                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}><IconRefresh /> Reset</button>
                    </div>
                </div>
            </div>

            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (<div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert"><IconError/> <span className="ms-2">{error}</span><button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button></div>)}
                {renderChartArea()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${SHADCN_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Service Category Sales Breakdown</h4>
                    <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Service Category</th>
                                    <th scope="col" className="py-2 text-end">Total Sales</th>
                                    <th scope="col" className="py-2 text-end">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => (<tr key={entry.name + index}><td className="py-2">{entry.name}</td><td className="py-2 text-end">{currencyFormatter.format(entry.totalSales)}</td><td className="py-2 text-end text-muted">{totalSalesOverall > 0 ? ((entry.totalSales / totalSalesOverall) * 100).toFixed(1) : '0.0'}%</td></tr>))}
                            </tbody>
                            <tfoot className="fw-bold border-top"><tr><td className="py-2">Total</td><td className="py-2 text-end">{currencyFormatter.format(totalSalesOverall)}</td><td className="py-2 text-end">100.0%</td></tr></tfoot>
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