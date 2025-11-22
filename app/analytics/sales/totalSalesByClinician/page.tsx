"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { RiCalendarEventLine, RiRefreshLine, RiPlayLine } from "@remixicon/react";

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
    totalCost: string;
    totalPaid: string;
    totalPayable: string;
    totalDiscount: string;
    totalRefunded: string;
}

interface ChartDataEntry {
    name: string;
    totalPayable: number;
    totalCost: number;
    totalPaid: number;
    profit: number;
    collectionRate: number;
}

export default function TotalSalesByClinician() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getInitialDates = () => {
        const today = new Date();
        const endDate = today.toISOString().split("T")[0];
        const startDateObj = new Date(today);
        startDateObj.setDate(today.getDate() - 29);
        const startDate = startDateObj.toISOString().split("T")[0];
        return { startDate, endDate };
    };

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
        const url = `financials/billing/summary?key=totalSalesByClinician&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
        try {
            const fetchedData: ClinicianSalesAPIEntry[] = await customFetch(url);

            if (!fetchedData || !Array.isArray(fetchedData)) {
                throw new Error("Invalid data format received from the API.");
            }

            const formattedData = fetchedData.map((item) => {
                const totalPayable = parseFloat(item.totalPayable) || 0;
                const totalCost = parseFloat(item.totalCost) || 0;
                const totalPaid = parseFloat(item.totalPaid) || 0;
                const profit = totalPayable - totalCost;
                const collectionRate = totalPayable > 0 ? (totalPaid / totalPayable) * 100 : 0;

                return {
                    name: item.name === "Unknown" ? "Lab Direct Cases" : item.name,
                    totalPayable,
                    totalCost,
                    totalPaid,
                    profit,
                    collectionRate,
                };
            });

            setData(formattedData);

        } catch (err) {
            setData([]);
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
            console.error("Error fetching TotalSalesByClinician:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial load with default dates
        fetchData(startDate, endDate);
    }, []); // Only run once on mount

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        // Load data with default dates
        fetchData(defaultStartDate, defaultEndDate);
    };

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
                        No sales data found for clinicians in the selected period.
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
                            formatter={(value: number, name: string) => {
                                if (name === 'totalPayable') return [currencyFormatter.format(value), 'Total Payable'];
                                return [value, name];
                            }}
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
                            dataKey="totalPayable"
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
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-md-0 d-flex align-items-center">
                        <IconChart />
                        Total Sales by Clinician
                    </h2>
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: SHADCN_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{ color: SHADCN_MUTED_FOREGROUND }} />
                            </span>
                            <input id="startDateTSC" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: SHADCN_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: SHADCN_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{ color: SHADCN_MUTED_FOREGROUND }} />
                            </span>
                            <input id="endDateTSC" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: SHADCN_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <button onClick={() => fetchData(startDate, endDate)} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                            <RiPlayLine size={16} className="me-1" /> Load
                        </button>
                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                            <RiRefreshLine size={16} className="me-1" /> Reset
                        </button>
                    </div>
                </div>
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