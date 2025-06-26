"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
} from "recharts";
import { currencyFormatter, customFetch } from "../../../../components/Auth/customFetch";
import { RiStore2Line, RiErrorWarningLine, RiCalendarEventLine, RiInbox2Line, RiLoader4Line, RiRefreshLine, RiFileList3Line, RiMoneyDollarCircleLine, RiCheckboxCircleLine, RiLineChartLine, RiPercentLine, RiAlertLine } from "@remixicon/react";

interface BranchSalesAPIEntry {
    name: string; 
    totalSales: string;
    totaldiscount: string; 
    totalpayableAmount: string; 
    branchid?: number; // Optional, as it's not directly used by the chart but might be in data
}

interface BranchSalesChartEntry {
    name: string;
    totalSales: number;
    totalDiscount: number;
    totalPayableAmount: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';

const BAR_CHART_COLORS = [ 
    'oklch(0.646 0.222 41.116)',
    'oklch(0.6 0.118 184.704)',
    'oklch(0.828 0.189 84.429)',
    'oklch(0.769 0.188 70.08)',
    'oklch(0.398 0.07 227.392)',
    'oklch(0.7 0.2 20)',
    'oklch(0.5 0.15 280)',
    'oklch(0.8 0.1 120)',
];


export default function TotalSalesByBranch() {
    const [data, setData] = useState<BranchSalesChartEntry[]>([]);
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
        try {
            const url = `financials/billing/summary?key=totalSalesByBranch&startDate=${fetchStartDate}&endDate=${fetchEndDate}`;
            const response: BranchSalesAPIEntry[] = await customFetch(url);

            if (response && Array.isArray(response)) {
                const formattedData = response.map((item: BranchSalesAPIEntry) => ({
                    name: item.name,
                    totalSales: parseFloat(item.totalSales) || 0,
                    totalDiscount: parseFloat(item.totaldiscount) || 0,
                    totalPayableAmount: parseFloat(item.totalpayableAmount) || 0,
                })).sort((a,b) => b.totalPayableAmount - a.totalPayableAmount); 
                setData(formattedData);
                 if (formattedData.length === 0) {
                    setError(null);
                }
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
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
    };

    const overallSummary = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.totalSales += curr.totalSales;
            acc.totalDiscount += curr.totalDiscount;
            acc.totalPayableAmount += curr.totalPayableAmount;
            return acc;
        }, { totalSales: 0, totalDiscount: 0, totalPayableAmount: 0 });
    }, [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload as BranchSalesChartEntry;
            const percentageOfTotal = overallSummary.totalPayableAmount > 0 ? ((entry.totalPayableAmount / overallSummary.totalPayableAmount) * 100).toFixed(1) : '0.0';

            return (
                <div
                    className="rounded-lg border p-2 shadow-sm"
                    style={{
                        backgroundColor: COLOR_TOOLTIP_BG,
                        borderColor: COLOR_BORDER,
                        minWidth: '220px',
                        fontSize: '0.8rem'
                    }}
                >
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Branch</span>
                        <span className="fw-bold d-block" style={{color: COLOR_TOOLTIP_FG}}>{label}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Net Sales (Payable)</span>
                        <span className="fw-bold d-block" style={{ color: COLOR_ACCENT }}>
                            {currencyFormatter.format(entry.totalPayableAmount)} ({percentageOfTotal}%)
                        </span>
                    </div>
                    <div>
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Gross Sales</span>
                        <span className="fw-normal d-block" style={{ color: COLOR_TOOLTIP_FG }}>
                            {currencyFormatter.format(entry.totalSales)}
                        </span>
                    </div>
                     <div>
                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Discount</span>
                        <span className="fw-normal d-block" style={{ color: COLOR_TOOLTIP_FG }}>
                            {currencyFormatter.format(entry.totalDiscount)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChartContainerContent = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading branch sales...</p>
                </div>
            );
        }

        if (error && data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                    <h5 className="fw-medium mb-1">Error Loading Data</h5>
                    <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                    <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                    <h5 className="fw-medium mb-1">No Data Available</h5>
                    <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                        No sales data found for branches in the selected period.
                    </p>
                </div>
            );
        }

        return (
            <div style={{ width: "100%", height: Math.max(350, data.length * 40 + 100) }}> {/* Dynamic height */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" horizontal={false} />
                        <XAxis type="number" tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED, width: 120 }} axisLine={false} tickLine={false} width={130} interval={0}/>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }} />
                        <Bar dataKey="totalPayableAmount" name="Net Sales" radius={[0, 4, 4, 0]} barSize={data.length > 10 ? 20 : 30}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={BAR_CHART_COLORS[index % BAR_CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

     const generateReport = () => {
        if (data.length === 0) return null;

        const topBranch = data[0];
        const lowestBranch = data.length > 1 ? data[data.length - 1] : topBranch;
        const averagePayablePerBranch = data.length > 0 ? overallSummary.totalPayableAmount / data.length : 0;
        const branchesAboveAverage = data.filter(b => b.totalPayableAmount > averagePayablePerBranch).length;
        
        // Calculate performance metrics
        const topBranchPerformance = (topBranch.totalPayableAmount / averagePayablePerBranch - 1) * 100;
        const lowestBranchPerformance = (lowestBranch.totalPayableAmount / averagePayablePerBranch - 1) * 100;
        const discountRate = (overallSummary.totalDiscount / overallSummary.totalSales) * 100;

        return (
            <div className="mt-4">
                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="p-3 bg-body rounded-3 border shadow-sm h-100">
                            <div className="d-flex align-items-center mb-2">
                                <RiMoneyDollarCircleLine size={20} className="text-success me-2"/>
                                <h6 className="mb-0 text-body-secondary">Total Revenue</h6>
                            </div>
                            <div className="h5 mb-0">{currencyFormatter.format(overallSummary.totalPayableAmount)}</div>
                            <small className="text-muted">Across {data.length} branches</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 bg-body rounded-3 border shadow-sm h-100">
                            <div className="d-flex align-items-center mb-2">
                                <RiStore2Line size={20} className="text-primary me-2"/>
                                <h6 className="mb-0 text-body-secondary">Average per Branch</h6>
                            </div>
                            <div className="h5 mb-0">{currencyFormatter.format(averagePayablePerBranch)}</div>
                            <small className="text-muted">{branchesAboveAverage} branches above average</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 bg-body rounded-3 border shadow-sm h-100">
                            <div className="d-flex align-items-center mb-2">
                                <RiLineChartLine size={20} className="text-warning me-2"/>
                                <h6 className="mb-0 text-body-secondary">Performance Range</h6>
                            </div>
                            <div className="h5 mb-0">{Math.abs(topBranchPerformance - lowestBranchPerformance).toFixed(1)}%</div>
                            <small className="text-muted">Gap between top and bottom</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 bg-body rounded-3 border shadow-sm h-100">
                            <div className="d-flex align-items-center mb-2">
                                <RiPercentLine size={20} className="text-info me-2"/>
                                <h6 className="mb-0 text-body-secondary">Discount Rate</h6>
                            </div>
                            <div className="h5 mb-0">{discountRate.toFixed(1)}%</div>
                            <small className="text-muted">Of total sales</small>
                        </div>
                    </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-body-tertiary p-4 rounded-3 border">
                    <h6 className="d-flex align-items-center mb-3">
                        <RiFileList3Line className="me-2" style={{color: COLOR_ACCENT}}/>
                        Performance Analysis
                    </h6>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="bg-body p-3 rounded-3 border">
                                <h6 className="text-success mb-2">Top Performer</h6>
                                <p className="mb-1 fw-medium">{topBranch.name}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{currencyFormatter.format(topBranch.totalPayableAmount)}</span>
                                    <span className="badge bg-success-subtle text-success">
                                        +{topBranchPerformance.toFixed(1)}% vs avg
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {data.length > 1 && (
                            <div className="col-md-6">
                                <div className="bg-body p-3 rounded-3 border">
                                    <h6 className="text-danger mb-2">Needs Improvement</h6>
                                    <p className="mb-1 fw-medium">{lowestBranch.name}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{currencyFormatter.format(lowestBranch.totalPayableAmount)}</span>
                                        <span className="badge bg-danger-subtle text-danger">
                                            {lowestBranchPerformance.toFixed(1)}% vs avg
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {data.length > 1 && (
                        <div className="mt-4">
                            <h6 className="text-body-secondary mb-2">Key Recommendations</h6>
                            <ul className="list-unstyled mb-0">
                                {Math.abs(topBranchPerformance) > 50 && (
                                    <li className="d-flex align-items-center text-success mb-2">
                                        <RiCheckboxCircleLine size={18} className="me-2"/>
                                        <small>Study success factors from {topBranch.name} for potential replication</small>
                                    </li>
                                )}
                                {Math.abs(lowestBranchPerformance) > 30 && (
                                    <li className="d-flex align-items-center text-danger mb-2">
                                        <RiErrorWarningLine size={18} className="me-2"/>
                                        <small>Review operations and support needs for {lowestBranch.name}</small>
                                    </li>
                                )}
                                {discountRate > 15 && (
                                    <li className="d-flex align-items-center text-warning mb-2">
                                        <RiAlertLine size={18} className="me-2"/>
                                        <small>Consider reviewing discount policies (current rate: {discountRate.toFixed(1)}%)</small>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-md-0 d-flex align-items-center">
                        <RiStore2Line size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                        Total Sales by Branch
                    </h2>
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                            <input id="startDateTSB" type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={handleStartDateChange} aria-label="Start Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER, paddingLeft: '0.5rem', paddingRight: '0.3rem' }}>
                                <RiCalendarEventLine size={16} className="text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                            </span>
                            <input id="endDateTSB" type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={handleEndDateChange} min={startDate} aria-label="End Date" style={{ fontSize: '0.875rem', borderColor: COLOR_BORDER, paddingLeft: '0.3rem' }} />
                        </div>
                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                            <RiRefreshLine size={16} className="me-1" /> Reset
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                    <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
                        {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartContainerContent()}
            </div>

            {data.length > 0 && (
                <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{borderTop: `1px solid ${COLOR_BORDER}`}}>
                    <h4 className="fs-6 fw-medium mb-3">Branch Sales Data</h4>
                     <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                        <table className="table table-sm table-hover table-striped small">
                            <thead className="sticky-top bg-body-tertiary">
                                <tr>
                                    <th scope="col" className="py-2">Branch Name</th>
                                    <th scope="col" className="py-2 text-end">Net Sales</th>
                                    <th scope="col" className="py-2 text-end">Gross Sales</th>
                                    <th scope="col" className="py-2 text-end">Discount</th>
                                    <th scope="col" className="py-2 text-end">% of Total Net Sales</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry) => {
                                    const percentageOfTotal = overallSummary.totalPayableAmount > 0 ? ((entry.totalPayableAmount / overallSummary.totalPayableAmount) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={entry.name}>
                                            <td className="py-2">{entry.name}</td>
                                            <td className="py-2 text-end fw-medium">{currencyFormatter.format(entry.totalPayableAmount)}</td>
                                            <td className="py-2 text-end">{currencyFormatter.format(entry.totalSales)}</td>
                                            <td className="py-2 text-end">{currencyFormatter.format(entry.totalDiscount)}</td>
                                            <td className="py-2 text-end text-muted">{percentageOfTotal}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                             <tfoot>
                                <tr className="fw-bold border-top">
                                    <td className="py-2">Total</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalPayableAmount)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalSales)}</td>
                                    <td className="py-2 text-end">{currencyFormatter.format(overallSummary.totalDiscount)}</td>
                                    <td className="py-2 text-end">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {generateReport()}
                </div>
            )}

            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .table-responsive thead.sticky-top th {
                    border-bottom: 2px solid var(--bs-border-color); 
                }
            `}</style>
        </div>
    );
}