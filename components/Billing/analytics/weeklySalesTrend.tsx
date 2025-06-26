"use client";

import React, { useEffect, useState, useCallback } from "react";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { RiLineChartLine, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line } from "@remixicon/react";

interface SalesData {
    week: string;
    totalSales: number;
}

const COLOR_PRIMARY_LINE = 'oklch(0.646 0.222 41.116)';
const COLOR_SPINNER = 'oklch(0.646 0.222 41.116)'; // Same as line for consistency

const WeeklySalesTrend: React.FC = () => {
    const [data, setData] = useState<SalesData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getInitialDates = () => {
        const endDateObj = new Date();
        const startDateObj = new Date();
        startDateObj.setDate(endDateObj.getDate() - 28);
        return {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };
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
        try {
            const url = `financials/billing/summary?key=weeklySalesTrend&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
            const response = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item: any) => ({
                    week: item.week,
                    totalSales: parseFloat(item.totalSales) || 0,
                })).sort((a, b) => a.week.localeCompare(b.week));
                setData(formattedData);
                if (formattedData.length === 0) {
                    setError(null); // Clear previous errors if new fetch yields no data
                }
            } else {
                setData([]);
                setError(response?.message || "Failed to fetch data or data is in an unexpected format.");
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
    }, [fetchData, startDate, endDate]);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="rounded-lg border bg-background p-2 shadow-sm"
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        borderColor: 'var(--bs-border-color)',
                    }}
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase fw-medium" style={{color: 'var(--bs-secondary-color)'}}>Week</span>
                            <span className="fw-bold text-body-emphasis">{label}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase fw-medium" style={{color: 'var(--bs-secondary-color)'}}>Sales</span>
                            <span className="fw-bold" style={{ color: COLOR_PRIMARY_LINE }}>
                                {currencyFormatter.format(payload[0].value)}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChartContent = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '350px', minHeight: '350px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_SPINNER }} />
                    <p className="text-muted" style={{color: 'var(--bs-secondary-color)'}}>Loading sales data...</p>
                </div>
            );
        }

        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ height: '350px', minHeight: '350px' }}>
                    <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                    <h5 className="fw-medium mb-1">Error Loading Data</h5>
                    <p className="text-muted px-3" style={{color: 'var(--bs-secondary-color)'}}>{error}</p>
                </div>
            );
        }
        
        if (data.length === 0) {
             return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ height: '350px', minHeight: '350px' }}>
                    <RiInbox2Line size={48} className="mb-3 text-muted" style={{color: 'var(--bs-secondary-color)'}}/>
                    <h5 className="fw-medium mb-1">No Data Available</h5>
                    <p className="text-muted px-3" style={{color: 'var(--bs-secondary-color)'}}>
                        There is no weekly sales data for the selected period. Try adjusting the dates.
                    </p>
                </div>
            );
        }
        
        return (
            <div style={{ height: "350px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }}
                            axisLine={{ stroke: 'var(--bs-border-color)' }}
                            tickLine={{ stroke: 'var(--bs-border-color)' }}
                            dy={5}
                        />
                        <YAxis
                            tickFormatter={(value: number) => currencyFormatter.format(value)}
                            tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }}
                            axisLine={false}
                            tickLine={false}
                            width={95}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalSales"
                            name="Weekly Sales"
                            stroke={COLOR_PRIMARY_LINE}
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 1, fill: COLOR_PRIMARY_LINE }}
                            activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_PRIMARY_LINE, stroke: 'var(--bs-body-bg)' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)'}}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center">
                    <div className="d-flex align-items-center mb-2 mb-sm-0">
                        <RiLineChartLine size={22} style={{ color: COLOR_PRIMARY_LINE }} className="me-2 flex-shrink-0" />
                        <h2 className="fs-6 fw-semibold text-body-emphasis mb-0">
                            Weekly Sales Trend
                        </h2>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{maxWidth: '160px'}}>
                             <span className="input-group-text bg-transparent border-end-0" style={{borderColor: 'var(--bs-border-color)'}}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{color: 'var(--bs-secondary-color)'}}/>
                            </span>
                            <input
                                id="startDateWSTV2"
                                type="date"
                                className="form-control shadow-none border-start-0"
                                value={startDate}
                                onChange={handleStartDateChange}
                                aria-label="Start Date"
                                style={{fontSize: '0.875rem', borderColor: 'var(--bs-border-color)'}}
                            />
                        </div>
                         <span className="text-muted d-none d-sm-inline" style={{color: 'var(--bs-secondary-color)'}}>–</span>
                        <div className="input-group input-group-sm" style={{maxWidth: '160px'}}>
                             <span className="input-group-text bg-transparent border-end-0" style={{borderColor: 'var(--bs-border-color)'}}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{color: 'var(--bs-secondary-color)'}}/>
                            </span>
                            <input
                                id="endDateWSTV2"
                                type="date"
                                className="form-control shadow-none border-start-0"
                                value={endDate}
                                onChange={handleEndDateChange}
                                min={startDate}
                                aria-label="End Date"
                                style={{fontSize: '0.875rem', borderColor: 'var(--bs-border-color)'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                     <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{borderTopWidth: '3px'}}>
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
                        {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{fontSize: '0.7rem'}}></button>
                    </div>
                )}
                {renderChartContent()}
            </div>
            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                .input-group-text {
                    padding-left: 0.5rem;
                    padding-right: 0.3rem;
                }
                .form-control.border-start-0 {
                    padding-left: 0.3rem;
                }
            `}</style>
        </div>
    );
};

export default WeeklySalesTrend;