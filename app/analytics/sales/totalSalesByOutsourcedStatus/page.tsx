"use client";

import React, { useEffect, useState } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: "#3B82F6", marginRight: '0.5rem' }}>🔄</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: "#3B82F6" }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: "#64748B" }}>📦</span>;

const SHADCN_PRIMARY = "#3B82F6";
const SHADCN_SECONDARY = "#FF8042"; 
const SHADCN_FOREGROUND = "#0F172A";
const SHADCN_MUTED_FOREGROUND = "#64748B";
const SHADCN_BORDER = "#E2E8F0";
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC";
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A";

const PIE_CHART_COLORS = [SHADCN_PRIMARY, SHADCN_SECONDARY];

interface OutsourcedStatusAPIEntry {
    isoutsourced: 0 | 1;
    totalSales: string;
}

interface ChartDataEntry {
    name: string;
    totalSales: number;
    isoutsourced: 0 | 1; 
}

export default function TotalSalesByOutsourcedStatus() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const url = `financials/billing/summary?key=totalSalesByOutsourcedStatus`;
            try {
                const response: OutsourcedStatusAPIEntry[] = await customFetch(url);

                if (response && Array.isArray(response)) {
                    const notOutsourcedEntry = response.find(item => item.isoutsourced === 0);
                    const outsourcedEntry = response.find(item => item.isoutsourced === 1);

                    const mappedData: ChartDataEntry[] = [
                        {
                            name: "Not Outsourced",
                            totalSales: parseFloat(notOutsourcedEntry?.totalSales || "0") || 0,
                            isoutsourced: 0,
                        },
                        {
                            name: "Outsourced",
                            totalSales: parseFloat(outsourcedEntry?.totalSales || "0") || 0,
                            isoutsourced: 1,
                        },
                    ];
                    setData(mappedData.filter(d => d.totalSales > 0)); // Only show if sales > 0
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

        fetchData();
    }, []);

    const totalSalesOverall = data.reduce((sum, entry) => sum + entry.totalSales, 0);
    
    const CustomTooltipContent = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const currentEntry = payload[0].payload;
            const value = currentEntry.totalSales;
            const name = currentEntry.name;

            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: SHADCN_TOOLTIP_BG,
                        borderColor: SHADCN_BORDER,
                        color: SHADCN_TOOLTIP_FG,
                        minWidth: '180px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-1 fw-medium" style={{color: SHADCN_FOREGROUND}}>{name}</div>
                    <div style={{ color: payload[0].payload.fill || (currentEntry.isoutsourced === 0 ? SHADCN_PRIMARY : SHADCN_SECONDARY) }}>
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

    const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
        if (percent * 100 < 5) return null; 
    
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="600">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderChartArea = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <IconLoader />
                    <p className="mt-3" style={{ color: SHADCN_MUTED_FOREGROUND }}>Loading outsourced status sales...</p>
                </div>
            );
        }
        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconError />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>Error Loading Data</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>{error}</p>
                </div>
            );
        }
        if (data.length === 0 || totalSalesOverall === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconEmpty />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>No Data Available</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>
                        No sales data found for outsourced status.
                    </p>
                </div>
            );
        }

        const chartHeight = 320; 

        return (
            <div style={{ width: '100%', height: chartHeight }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="totalSales"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={data.length > 1 ? 2 : 0}
                            labelLine={false}
                            label={renderCustomizedPieLabel}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.isoutsourced]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltipContent />} />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center" 
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{ fontSize: '0.875rem', color: SHADCN_MUTED_FOREGROUND, paddingTop: '15px' }}
                            formatter={(value, entry: any) => {
                                const item = entry.payload.payload; 
                                const percentage = totalSalesOverall > 0 ? ((item.totalSales / totalSalesOverall) * 100).toFixed(1) : "0.0";
                                return <span style={{color: SHADCN_MUTED_FOREGROUND}}>{value} ({percentage}%)</span>;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <IconChart /> Total Sales by Outsourced Status
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

            {data.length > 0 && totalSalesOverall > 0 && !loading && !error && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${SHADCN_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Outsourced Status Sales Breakdown</h4>
                    <div className="table-responsive">
                        <table className="table table-sm table-hover small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Status</th>
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