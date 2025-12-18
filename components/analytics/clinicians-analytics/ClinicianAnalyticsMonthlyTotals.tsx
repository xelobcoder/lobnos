"use client"
import React, { useEffect, useState } from 'react';
import { currencyFormatter, customFetch, reactSelectCustomStyles } from '../../Auth/customFetch';
import { useRouter } from 'next/navigation';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
} from 'recharts';
import Select from 'react-select';
import { RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiErrorWarningLine, RiCalendarEventLine, RiRefreshLine } from "@remixicon/react";

interface MonthlyData {
    month: number;
    total_rows: number;
    total_cost: string;
}

interface ClinicianAnalyticsMonthlyTotalsProps {
    clinicianId: number;
}

const ClinicianAnalyticsMonthlyTotals: React.FC<ClinicianAnalyticsMonthlyTotalsProps> = ({ clinicianId }) => {
    const router = useRouter();
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [selectedYear, setSelectedYear] = useState({ value: new Date().getFullYear(), label: new Date().getFullYear().toString() });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartView, setChartView] = useState<'bar' | 'line' | 'area'>('bar');

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString()
    }));

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const viewButtons = [
        { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
        { type: "line" as const, icon: RiLineChartLine, label: "Line" },
        { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
    ];

    const handleViewToggle = (newView: 'bar' | 'line' | 'area') => {
        setChartView(newView);
    };

    useEffect(() => {
        const fetchMonthlyData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(`clinician/anal/monthly/${clinicianId}?year=${selectedYear.value}`);
                if (response?.success) {
                    const sortedData = response.data.sort((a: MonthlyData, b: MonthlyData) => a.month - b.month);
                    setMonthlyData(sortedData);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyData();
    }, [clinicianId, selectedYear]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
            <div className="spinner">
                <style jsx>{`
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: radial-gradient(farthest-side,#474bff 94%,#0000) top/9px 9px no-repeat,
                                conic-gradient(#0000 30%,#474bff);
                        -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 9px),#000 0);
                        animation: spinner-c7wet2 1s infinite linear;
                    }

                    @keyframes spinner-c7wet2 {
                        100% {
                            transform: rotate(1turn);
                        }
                    }
                `}</style>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-3 bg-danger-subtle text-danger rounded">
            Error: {error}
        </div>
    );

    const chartData = monthlyData.map(item => ({
        month: monthNames[item.month - 1],
        cost: parseFloat(item.total_cost),
        cases: item.total_rows,
    }));

    // Calculate summary statistics
    const totalCases = monthlyData.reduce((sum, item) => sum + item.total_rows, 0);
    const totalCost = monthlyData.reduce((sum, item) => sum + parseFloat(item.total_cost), 0);
    const averageCostPerCase = totalCases > 0 ? totalCost / totalCases : 0;
    const peakMonth = monthlyData.reduce((max, item) =>
        parseFloat(item.total_cost) > parseFloat(max.total_cost) ? item : max,
        monthlyData[0] || { month: 0, total_cost: '0', total_rows: 0 }
    );
    const peakMonthName = peakMonth ? monthNames[peakMonth.month - 1] : 'N/A';

    return (
        <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
            <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                        <RiBarChartBoxLine size={22} style={{ color: 'oklch(0.646 0.222 41.116)' }} className="me-2 flex-shrink-0" />
                        Monthly Cases and Cost Analysis
                    </h2>
                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                            {viewButtons.map(btn => (
                                <button
                                    key={btn.type}
                                    type="button"
                                    className={`btn ${chartView === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                    onClick={() => handleViewToggle(btn.type)}
                                    style={chartView === btn.type ? { backgroundColor: 'oklch(0.646 0.222 41.116)', borderColor: 'oklch(0.646 0.222 41.116)' } : {}}
                                >
                                    <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                            <div style={{ width: '150px' }}>
                                <Select
                                    options={yearOptions}
                                    value={selectedYear}
                                    onChange={(option) => setSelectedYear(option as { value: number; label: string })}
                                    isSearchable={false}
                                    styles={reactSelectCustomStyles}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>
                            <button
                                onClick={() => router.push(`/clinician/analytics/insights/${clinicianId}?year=${selectedYear.value}`)}
                                className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                                style={{
                                    backgroundColor: 'oklch(0.646 0.222 41.116)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.875rem'
                                }}
                            >
                                More Insights
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {error && (
                    <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                        <RiErrorWarningLine size={18} className="me-2 flex-shrink-0" />
                        {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                            <div className="text-muted small mb-1">Total Cases</div>
                            <div className="h5 mb-0 text-primary">{totalCases.toLocaleString()}</div>
                            <div className="small text-muted">This year</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                            <div className="text-muted small mb-1">Total Revenue</div>
                            <div className="h5 mb-0 text-success">{currencyFormatter.format(totalCost)}</div>
                            <div className="small text-muted">This year</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                            <div className="text-muted small mb-1">Avg Cost per Case</div>
                            <div className="h5 mb-0 text-info">{currencyFormatter.format(averageCostPerCase)}</div>
                            <div className="small text-muted">This year</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
                            <div className="text-muted small mb-1">Peak Month</div>
                            <div className="h5 mb-0 text-warning">{peakMonthName}</div>
                            <div className="small text-muted">{currencyFormatter.format(parseFloat(peakMonth?.total_cost || '0'))}</div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height={350}>
                        {chartView === 'bar' ? (
                            <BarChart
                                data={chartData}
                                barSize={30}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color)" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    fontSize={11}
                                    tickSize={8}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    interval={0}
                                />
                                <YAxis
                                    yAxisId="left"
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `₵${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `₵${(value / 1000).toFixed(0)}K`;
                                        return currencyFormatter.format(value);
                                    }}
                                    fontSize={11}
                                    width={85}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    label={{
                                        value: 'Total Cost (₵)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: {
                                            textAnchor: 'middle',
                                            fill: 'var(--bs-body-color)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                        return value.toString();
                                    }}
                                    fontSize={11}
                                    width={60}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    label={{
                                        value: 'Cases',
                                        angle: 90,
                                        position: 'insideRight',
                                        style: {
                                            textAnchor: 'middle',
                                            fill: 'var(--bs-body-color)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }
                                    }}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'cost'
                                            ? currencyFormatter.format(value)
                                            : value,
                                        name === 'cost' ? 'Total Cost' : 'Cases'
                                    ]}
                                    labelStyle={{ color: 'black', fontSize: '12px' }}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px' }}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="cost"
                                    name="Total Cost"
                                    fill="oklch(0.646 0.222 41.116)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="cases"
                                    name="Cases"
                                    fill="oklch(0.769 0.188 70.08)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        ) : chartView === 'line' ? (
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color)" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    fontSize={11}
                                    tickSize={8}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    interval={0}
                                />
                                <YAxis
                                    yAxisId="left"
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `₵${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `₵${(value / 1000).toFixed(0)}K`;
                                        return currencyFormatter.format(value);
                                    }}
                                    fontSize={11}
                                    width={85}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    label={{
                                        value: 'Total Cost (₵)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: {
                                            textAnchor: 'middle',
                                            fill: 'var(--bs-body-color)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                        return value.toString();
                                    }}
                                    fontSize={11}
                                    width={60}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    label={{
                                        value: 'Cases',
                                        angle: 90,
                                        position: 'insideRight',
                                        style: {
                                            textAnchor: 'middle',
                                            fill: 'var(--bs-body-color)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }
                                    }}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'cost'
                                            ? currencyFormatter.format(value)
                                            : value,
                                        name === 'cost' ? 'Total Cost' : 'Cases'
                                    ]}
                                    labelStyle={{ color: 'black', fontSize: '12px' }}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px' }}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="cost"
                                    name="Total Cost"
                                    stroke="oklch(0.646 0.222 41.116)"
                                    strokeWidth={3}
                                    dot={{ fill: 'oklch(0.646 0.222 41.116)', strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="cases"
                                    name="Cases"
                                    stroke="oklch(0.769 0.188 70.08)"
                                    strokeWidth={3}
                                    dot={{ fill: 'oklch(0.769 0.188 70.08)', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        ) : (
                            <AreaChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color)" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    fontSize={11}
                                    tickSize={8}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    interval={0}
                                />
                                <YAxis
                                    yAxisId="left"
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `₵${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `₵${(value / 1000).toFixed(0)}K`;
                                        return currencyFormatter.format(value);
                                    }}
                                    fontSize={11}
                                    width={85}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    label={{
                                        value: 'Total Cost (₵)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: {
                                            textAnchor: 'middle',
                                            fill: 'var(--bs-body-color)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                        return value.toString();
                                    }}
                                    fontSize={11}
                                    width={60}
                                    axisLine={{ stroke: 'var(--bs-border-color)' }}
                                    tickLine={{ stroke: 'var(--bs-border-color)' }}
                                    tick={{ fill: 'var(--bs-body-color)', fontWeight: 500 }}
                                    label={{
                                        value: 'Cases',
                                        angle: 90,
                                        position: 'insideRight',
                                        style: {
                                            textAnchor: 'middle',
                                            fill: 'var(--bs-body-color)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }
                                    }}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'cost'
                                            ? currencyFormatter.format(value)
                                            : value,
                                        name === 'cost' ? 'Total Cost' : 'Cases'
                                    ]}
                                    labelStyle={{ color: 'black', fontSize: '12px' }}
                                    contentStyle={{ fontSize: '12px' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="cost"
                                    name="Total Cost"
                                    stackId="1"
                                    stroke="oklch(0.646 0.222 41.116)"
                                    fill="oklch(0.646 0.222 41.116)"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="cases"
                                    name="Cases"
                                    stackId="2"
                                    stroke="oklch(0.769 0.188 70.08)"
                                    fill="oklch(0.769 0.188 70.08)"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ClinicianAnalyticsMonthlyTotals;