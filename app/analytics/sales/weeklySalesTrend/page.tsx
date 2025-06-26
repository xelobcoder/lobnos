"use client";

import React, { useEffect, useState, useCallback } from "react";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
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
import { RiLineChartLine, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line, RiRefreshLine } from "@remixicon/react";

interface SalesDataEntry {
    week: string;
    totalSales: number;
}

const COLOR_PRIMARY_LINE = 'oklch(0.646 0.222 41.116)';
const COLOR_SPINNER = 'oklch(0.646 0.222 41.116)';
const SHADCN_BORDER = 'var(--bs-border-color)'; // Assuming Bootstrap variables are available
const SHADCN_MUTED_BG = 'var(--bs-tertiary-bg)';
const SHADCN_CARD_BG = 'var(--bs-body-bg)'; // Default card background

export default function WeeklySalesTrend() {
    const [data, setData] = useState<SalesDataEntry[]>([]);
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
            setData([]); setLoading(false); return;
        }
        if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
            setError("Start date cannot be after end date.");
            setData([]); setLoading(false); return;
        }

        setLoading(true); setError(null);
        try {
            const url = `financials/billing/summary?key=weeklySalesTrend&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
            const response: Array<{week: string; totalSales: string}> = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item) => ({
                    week: item.week || "N/A",
                    totalSales: parseFloat(item.totalSales) || 0,
                }));
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
    }, [fetchData, startDate, endDate]);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate); setEndDate(defaultEndDate);
    };
    
    const totalSalesSum = data.reduce((sum, entry) => sum + entry.totalSales, 0);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percentage = totalSalesSum > 0 ? ((value / totalSalesSum) * 100).toFixed(1) : '0.0';
            return (
                <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)', minWidth: '180px', fontSize: '0.8rem'}}>
                    <div className="mb-1"><span className="text-xs uppercase fw-medium" style={{color: 'var(--bs-secondary-color)'}}>Week</span><span className="fw-bold d-block" style={{color: 'var(--bs-body-color)'}}>{label}</span></div>
                    <div><span className="text-xs uppercase fw-medium" style={{color: 'var(--bs-secondary-color)'}}>Sales</span><span className="fw-bold d-block" style={{ color: COLOR_PRIMARY_LINE }}>{currencyFormatter.format(value)} ({percentage}%)</span></div>
                </div>
            );
        }
        return null;
    };

    const renderChartContent = () => {
        if (loading) {
            return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}><RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_SPINNER }} /><p className="text-muted" style={{color: 'var(--bs-secondary-color)'}}>Loading weekly sales...</p></div>);
        }
        if (error && data.length === 0) {
            return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><RiErrorWarningLine size={48} className="mb-3 text-danger" /><h5 className="fw-medium mb-1">Error Loading Data</h5><p className="text-muted px-3" style={{color: 'var(--bs-secondary-color)'}}>{error}</p></div>);
        }
        if (data.length === 0) {
             return (<div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}><RiInbox2Line size={48} className="mb-3 text-muted" style={{color: 'var(--bs-secondary-color)'}}/><h5 className="fw-medium mb-1">No Data Available</h5><p className="text-muted px-3" style={{color: 'var(--bs-secondary-color)'}}>No sales data for the selected period. Try adjusting the dates.</p></div>);
        }
        
        return (
            <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false}/>
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }} axisLine={{ stroke: 'var(--bs-border-color)' }} tickLine={{ stroke: 'var(--bs-border-color)' }} dy={5} interval="preserveStartEnd" />
                        <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: 'var(--bs-secondary-color)' }} axisLine={false} tickLine={false} width={95} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }}/>
                        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }}/>
                        <Line type="monotone" dataKey="totalSales" name="Weekly Sales" stroke={COLOR_PRIMARY_LINE} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5, fill: COLOR_PRIMARY_LINE }} activeDot={{ r: 7, strokeWidth: 2, fill: COLOR_PRIMARY_LINE, stroke: 'var(--bs-body-bg)' }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}`}}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <div className="d-flex align-items-center mb-3 mb-lg-0">
                        <RiLineChartLine size={22} style={{ color: COLOR_PRIMARY_LINE }} className="me-2 flex-shrink-0" />
                        <h2 className="fs-6 fw-semibold text-body-emphasis mb-0">
                            Weekly Sales Trend
                        </h2>
                    </div>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                             <span className="input-group-text bg-transparent border-end-0" style={{borderColor: SHADCN_BORDER, paddingLeft: '0.5rem', paddingRight:'0.3rem'}}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{color: 'var(--bs-secondary-color)'}}/>
                            </span>
                            <input id="startDateWSTV3" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{fontSize: '0.875rem', borderColor: SHADCN_BORDER, paddingLeft:'0.3rem'}}/>
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{borderColor: SHADCN_BORDER, paddingLeft: '0.5rem', paddingRight:'0.3rem'}}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{color: 'var(--bs-secondary-color)'}}/>
                            </span>
                            <input id="endDateWSTV3" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{fontSize: '0.875rem', borderColor: SHADCN_BORDER, paddingLeft:'0.3rem'}}/>
                        </div>
                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{fontSize: '0.875rem', padding: '0.25rem 0.5rem'}}>
                            <RiRefreshLine size={16} className="me-1" /> Reset
                        </button>
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
            {data.length > 0 && !loading && !error && (
                 <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${SHADCN_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Weekly Sales Data</h4>
                     <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Week</th>
                                    <th scope="col" className="py-2 text-end">Total Sales</th>
                                    <th scope="col" className="py-2 text-end">% of Period Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry) => {
                                    const percentageOfTotal = totalSalesSum > 0 ? ((entry.totalSales / totalSalesSum) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={entry.week}>
                                            <td className="py-2">{entry.week}</td>
                                            <td className="py-2 text-end">{currencyFormatter.format(entry.totalSales)}</td>
                                            <td className="py-2 text-end text-muted">{percentageOfTotal}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                             <tfoot className="fw-bold border-top">
                                <tr >
                                    <td className="py-2">Total for Period</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(totalSalesSum)}</td>
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