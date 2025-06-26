"use client";

import React, { useEffect, useState } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: SHADCN_PRIMARY, marginRight: '0.5rem' }}>📊</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: SHADCN_PRIMARY }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: SHADCN_MUTED_FOREGROUND }}>📦</span>;

const SHADCN_PRIMARY = "#3B82F6";
const SHADCN_FOREGROUND = "#0F172A";
const SHADCN_MUTED_FOREGROUND = "#64748B";
const SHADCN_BORDER = "#E2E8F0";
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC";
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A";

interface ClinicianSalesAPIEntry {
    clinicianId: number;
    name: string;
    totalSales: string;
}

interface ChartDataEntry {
    name: string;
    totalSales: number;
}

export default function TotalSalesByClinician() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const url = `financials/billing/summary?key=totalSalesByClinician`;
            try {
                const fetchedData: ClinicianSalesAPIEntry[] = await customFetch(url);

                if (!fetchedData || !Array.isArray(fetchedData)) {
                    throw new Error("Invalid data format received from the API.");
                }

                const formattedData = fetchedData.map((item) => ({
                    name: item.name === "Unknown" ? "Lab Direct Cases" : item.name,
                    totalSales: parseFloat(item.totalSales) || 0,
                }));

                setData(formattedData);

            } catch (err) {
                setData([]);
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
                console.error("Error fetching TotalSalesByClinician:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderChartContent = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <IconLoader />
                    <p className="mt-3" style={{ color: SHADCN_MUTED_FOREGROUND }}>Loading clinician sales data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconError />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>Error Loading Data</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconEmpty />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>No Data Available</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>
                        No sales data found for the current period.
                    </p>
                </div>
            );
        }

        const numDataPoints = data.length;
        const angleXAxis = numDataPoints > 6;
        const bottomMargin = angleXAxis ? 70 : 30;

        return (
            <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 15, left: 10, bottom: bottomMargin }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} vertical={false} />
                        <XAxis
                            dataKey="name"
                            angle={angleXAxis ? -40 : 0}
                            textAnchor={angleXAxis ? "end" : "middle"}
                            height={angleXAxis ? 80 : 40}
                            interval={0}
                            tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }}
                            axisLine={{ stroke: SHADCN_BORDER }}
                            tickLine={{ stroke: SHADCN_BORDER }}
                        />
                        <YAxis
                            tickFormatter={(value: number) => currencyFormatter.format(value)}
                            tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
                        />
                        <Tooltip
                            formatter={(value: number) => [currencyFormatter.format(value), 'Total Sales']}
                            cursor={{ fill: `${SHADCN_PRIMARY}20` }}
                            contentStyle={{
                                backgroundColor: SHADCN_TOOLTIP_BG,
                                color: SHADCN_TOOLTIP_FG,
                                borderRadius: '0.375rem',
                                border: `1px solid ${SHADCN_BORDER}`,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '0.8rem',
                                padding: '0.5rem 0.75rem'
                            }}
                            labelStyle={{ marginBottom: '0.25rem', fontWeight: '500' }}
                        />
                        <Bar
                            dataKey="totalSales"
                            fill={SHADCN_PRIMARY}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card shadow-sm" style={{ 
            borderRadius: '0.75rem',
            borderColor: SHADCN_BORDER, 
            backgroundColor: SHADCN_CARD_BG 
        }}>
            <div 
                className="card-header py-3 px-4"
                style={{ 
                    backgroundColor: SHADCN_MUTED_BG, 
                    borderBottom: `1px solid ${SHADCN_BORDER}`
                }}
            >
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <IconChart />
                    Total Sales by Clinician
                </h2>
            </div>
            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                     <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                        <span>⚠️</span> {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartContent()}
            </div>
        </div>
    );
}