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
} from "recharts";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: "#3B82F6", marginRight: '0.5rem' }}>🏢</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: "#3B82F6" }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;

const SHADCN_PRIMARY = "#3B82F6";
const SHADCN_FOREGROUND = "#0F172A";
const SHADCN_MUTED_FOREGROUND = "#64748B";
const SHADCN_BORDER = "#E2E8F0";
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC";
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A";

interface OrganizationSalesAPIEntry {
    name: string;
    totalSales: string;
}

interface ChartDataEntry {
    name: string;
    totalSales: number;
}

export default function TotalSalesByOrganization() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const url = `financials/billing/summary?key=totalSalesByOrganization`;
            try {
                const response: OrganizationSalesAPIEntry[] = await customFetch(url);

                if (response && Array.isArray(response)) {
                    const formattedData = response.map((item) => ({
                        name: item.name || "Unknown Organization",
                        totalSales: parseFloat(item.totalSales) || 0,
                    })).sort((a,b) => b.totalSales - a.totalSales);
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
        };

        fetchData();
    }, []);

    const totalSalesOverall = data.reduce((sum, entry) => sum + entry.totalSales, 0);

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: SHADCN_TOOLTIP_BG,
                        borderColor: SHADCN_BORDER,
                        color: SHADCN_TOOLTIP_FG,
                        minWidth: '200px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-1 fw-medium" style={{color: SHADCN_FOREGROUND}}>{label}</div>
                    <div style={{ color: SHADCN_PRIMARY }}>
                        Sales: {currencyFormatter.format(value)}
                    </div>
                    {totalSalesOverall > 0 && (
                        <div className="text-xs" style={{color: SHADCN_MUTED_FOREGROUND}}>
                            {((value / totalSalesOverall) * 100).toFixed(1)}% of total
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
                    <p className="mt-3" style={{ color: SHADCN_MUTED_FOREGROUND }}>Loading organization sales...</p>
                </div>
            );
        }
        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <IconError />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>Error Loading Data</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>{error}</p>
                </div>
            );
        }
        if (data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <IconEmpty />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>No Data Available</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>
                        No sales data found for organizations in the current period.
                    </p>
                </div>
            );
        }
        
        const numDataPoints = data.length;
        const angleXAxis = numDataPoints > 5;
        const bottomMargin = angleXAxis ? 80 : 40;

        return (
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: bottomMargin }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} vertical={false} />
                        <XAxis
                            dataKey="name"
                            angle={angleXAxis ? -45 : 0}
                            textAnchor={angleXAxis ? "end" : "middle"}
                            height={angleXAxis ? 90 : 50}
                            interval={0}
                            tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }}
                            axisLine={{ stroke: SHADCN_BORDER }}
                            tickLine={{ stroke: SHADCN_BORDER }}
                        />
                        <YAxis
                            tickFormatter={(value) => currencyFormatter.format(value)}
                            tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
                        />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ fill: `${SHADCN_PRIMARY}1A` }} />
                        <Bar
                            dataKey="totalSales"
                            fill={SHADCN_PRIMARY}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                            name="Total Sales"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <IconChart /> Total Sales by Organization
                </h2>
            </div>

            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                     <div className="alert alert-warning border-warning border-opacity-50 d-flex align-items-center small p-2 mb-3" role="alert">
                        <IconError/> <span className="ms-2">{error}</span>
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartArea()}
            </div>

            {data.length > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${SHADCN_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Organization Sales Breakdown</h4>
                    <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Organization Name</th>
                                    <th scope="col" className="py-2 text-end">Total Sales</th>
                                    <th scope="col" className="py-2 text-end">% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => (
                                    <tr key={entry.name + index}>
                                        <td className="py-2">{entry.name}</td>
                                        <td className="py-2 text-end">{currencyFormatter.format(entry.totalSales)}</td>
                                        <td className="py-2 text-end text-muted">
                                            {totalSalesOverall > 0 ? ((entry.totalSales / totalSalesOverall) * 100).toFixed(1) : '0.0'}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="fw-bold border-top">
                                <tr>
                                    <td className="py-2">Total</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(totalSalesOverall)}</td>
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