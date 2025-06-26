"use client";

import React, { useEffect, useState, useCallback } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    // Legend, // Often not needed for single-series bar charts
} from "recharts";
import { RiBarChartBoxLine, RiErrorWarningLine, RiInbox2Line, RiLoader4Line } from "@remixicon/react"; // Assuming you use Remixicon

// --- Color Palette (Using SHADCN_ constants for consistency) ---
const SHADCN_PRIMARY = "#3B82F6"; // blue-500
const SHADCN_FOREGROUND = "#0F172A"; // slate-900
const SHADCN_MUTED_FOREGROUND = "#64748B"; // slate-500
const SHADCN_BORDER = "#E2E8F0"; // slate-200
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC"; // slate-50 (for subtle backgrounds like card header)
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A"; // slate-900
const SHADCN_SPINNER = "#3B82F6";


interface YearlySalesAPIEntry {
    year: string | number; // API might send as string or number
    totalSales: string; // API might send as string
}

interface ChartDataEntry {
    year: string;
    totalSales: number;
}

export default function YearlySalesTrend() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `financials/billing/summary?key=yearlySalesTrend`;
            const response: YearlySalesAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item) => ({
                    year: String(item.year || "N/A"),
                    totalSales: parseFloat(item.totalSales) || 0,
                })).sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort by year ascending
                setData(formattedData);
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
        fetchData();
    }, [fetchData]);

    const totalSalesOverall = data.reduce((sum, entry) => sum + entry.totalSales, 0);

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percentage = totalSalesOverall > 0 ? ((value / totalSalesOverall) * 100).toFixed(1) : '0.0';
            return (
                <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: SHADCN_TOOLTIP_BG, borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, minWidth: '180px', fontSize: '0.8rem' }}>
                    <div className="mb-1 fw-medium" style={{color: SHADCN_FOREGROUND}}>{label}</div>
                    <div style={{ color: SHADCN_PRIMARY }}>Sales: {currencyFormatter.format(value)}</div>
                    {totalSalesOverall > 0 && (<div className="text-xs" style={{color: SHADCN_MUTED_FOREGROUND}}>{percentage}% of period total</div>)}
                </div>
            );
        }
        return null;
    };

    const renderChartArea = () => {
        if (loading) {
            return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}><RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: SHADCN_SPINNER }} /><p className="text-muted" style={{color: SHADCN_MUTED_FOREGROUND}}>Loading yearly sales...</p></div>);
        }
        if (error && data.length === 0) {
            return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><RiErrorWarningLine size={48} className="mb-3 text-danger" /><h5 className="fw-medium mb-1" style={{color: SHADCN_FOREGROUND}}>Error Loading Data</h5><p className="px-3" style={{color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem'}}>{error}</p></div>);
        }
        if (data.length === 0) {
             return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><RiInbox2Line size={48} className="mb-3 text-muted" style={{color: SHADCN_MUTED_FOREGROUND}}/><h5 className="fw-medium mb-1" style={{color: SHADCN_FOREGROUND}}>No Data Available</h5><p className="px-3" style={{color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem'}}>No yearly sales data found.</p></div>);
        }
        
        const chartHeight = 350;
        const numDataPoints = data.length;
        // Angle X-axis labels if more than a few years to prevent overlap, though years are usually short enough.
        const angleXAxis = numDataPoints > 8; 
        const bottomMargin = angleXAxis ? 60 : 30;

        return (
            <div style={{ width: '100%', height: chartHeight }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: bottomMargin }} barGap={4} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} vertical={false} />
                        <XAxis dataKey="year" angle={angleXAxis ? -30 : 0} textAnchor={angleXAxis ? "end" : "middle"} height={angleXAxis ? 70 : 40} interval={0} tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }} axisLine={{ stroke: SHADCN_BORDER }} tickLine={{ stroke: SHADCN_BORDER }} />
                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }} axisLine={false} tickLine={false} width={90} />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ fill: `${SHADCN_PRIMARY}1A` }} />
                        <Bar dataKey="totalSales" fill={SHADCN_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={60} name="Total Sales" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <RiBarChartBoxLine size={22} style={{ color: SHADCN_PRIMARY }} className="me-2 flex-shrink-0" />
                    Yearly Sales Trend
                </h2>
            </div>

            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                     <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0 text-warning" /> <span className="ms-1">{error}</span>
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartArea()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${SHADCN_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Yearly Sales Data</h4>
                    <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Year</th>
                                    <th scope="col" className="py-2 text-end">Total Sales</th>
                                    <th scope="col" className="py-2 text-end">% of Period Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry) => (
                                    <tr key={entry.year}>
                                        <td className="py-2">{entry.year}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(entry.totalSales)}</td>
                                        <td className="py-2 text-end text-muted">
                                            {totalSalesOverall > 0 ? ((entry.totalSales / totalSalesOverall) * 100).toFixed(1) : '0.0'}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                             <tfoot className="fw-bold border-top">
                                <tr>
                                    <td className="py-2">Total for Period</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(totalSalesOverall)}</td>
                                    <td className="py-2 text-end">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
             <style jsx global>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .table-responsive thead.sticky-top th { background-color: var(--bs-tertiary-bg) !important; border-bottom: 2px solid var(--bs-border-color); }
            `}</style>
        </div>
    );
}