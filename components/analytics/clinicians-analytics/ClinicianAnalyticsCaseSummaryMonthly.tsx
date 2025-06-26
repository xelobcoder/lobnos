'use client'
import React, { useEffect, useState } from 'react';
import { customFetch, reactSelectCustomStyles } from '../../Auth/customFetch';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import Select from 'react-select';
import { RiBarChartGroupedLine, RiErrorWarningLine, RiInboxLine } from '@remixicon/react';

interface MonthlyCaseSummary {
    year: number;
    month: number;
    clinician_cases: number;
    total_cases: number;
    percentage_clinician_cases: string;
}

interface ChartDataPoint {
    month: string;
    clinicianCases: number;
    otherCases: number;
    totalCases: number;
    percentage: number;
}

interface ClinicianAnalyticsCaseSummaryMonthlyProps {
    clinicianId: number;
}

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Direct oklch color values
const COLOR_CLINICIAN = 'oklch(0.646 0.222 41.116)';
const COLOR_OTHER = 'oklch(0.6 0.118 184.704)';
const COLOR_LABEL_ON_BAR = 'oklch(0.98 0.01 0)'; // A very light color for text on dark bars

const ClinicianAnalyticsCaseSummaryMonthly: React.FC<ClinicianAnalyticsCaseSummaryMonthlyProps> = ({ clinicianId }) => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [selectedYear, setSelectedYear] = useState({ value: new Date().getFullYear(), label: new Date().getFullYear().toString() });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString()
    }));

    useEffect(() => {
        const fetchMonthlyData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await customFetch(
                    `clinician/anal/case-summary/monthly/${clinicianId}?year=${selectedYear.value}`
                );
                if (response?.success && Array.isArray(response.data)) {
                    const sortedData = response.data.sort((a: MonthlyCaseSummary, b: MonthlyCaseSummary) => a.month - b.month);
                    const formattedData = sortedData.map((item: MonthlyCaseSummary) => ({
                        month: monthNames[item.month - 1],
                        clinicianCases: item.clinician_cases,
                        otherCases: item.total_cases - item.clinician_cases,
                        totalCases: item.total_cases,
                        percentage: parseFloat(item.percentage_clinician_cases) || 0
                    }));
                    setChartData(formattedData);
                } else {
                    setChartData([]);
                    setError(response?.message || 'Failed to fetch monthly case summary data.');
                }
            } catch (err) {
                setChartData([]);
                setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyData();
    }, [clinicianId, selectedYear.value]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as ChartDataPoint;
            return (
                <div className="bg-body-tertiary p-2 border rounded shadow-sm">
                    <p className="mb-1 fw-bold text-body-emphasis">{label} ({selectedYear.label})</p>
                    <p className="mb-1" style={{ color: COLOR_CLINICIAN }}>Clinician Cases: {dataPoint.clinicianCases}</p>
                    <p className="mb-1" style={{ color: COLOR_OTHER }}>Other Cases: {dataPoint.otherCases}</p>
                    <hr className="my-1" />
                    <p className="mb-1 text-body-secondary">Total Cases: {dataPoint.totalCases}</p>
                    <p className="mb-0 fw-medium" style={{ color: COLOR_CLINICIAN }}>
                        Clinician Contribution: {dataPoint.percentage.toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLabel = (props: any) => {
        const { x, y, width, value } = props;
        if (value === 0 || !value) return null;

        return (
            <text
                x={x + width / 2}
                y={y}
                dy={-6}
                fontSize="11"
                fontWeight="600"
                fill={COLOR_LABEL_ON_BAR}
                textAnchor="middle"
            >
                {`${value.toFixed(1)}%`}
            </text>
        );
    };


    const renderContent = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                    <div className="spinner-border" style={{color: COLOR_CLINICIAN}} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-danger-emphasis bg-danger-subtle p-4 rounded" style={{ height: '350px' }}>
                    <RiErrorWarningLine size={48} className="mb-2" />
                    <h5 className="fw-medium">Error Loading Data</h5>
                    <p className="text-center mb-0">{error}</p>
                </div>
            );
        }

        if (chartData.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-body-secondary bg-body-tertiary p-4 rounded" style={{ height: '350px' }}>
                    <RiInboxLine size={48} className="mb-2" />
                    <h5 className="fw-medium">No Data Available</h5>
                    <p className="text-center mb-0">There is no monthly case data for the selected year ({selectedYear.label}).</p>
                </div>
            );
        }

        return (
            <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 30, right: 5, left: -20, bottom: 5 }}
                        barCategoryGap="25%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
                            axisLine={{ stroke: 'var(--bs-border-color)' }}
                            tickLine={{ stroke: 'var(--bs-border-color)' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: 'var(--bs-secondary-color)' }}
                            axisLine={{ stroke: 'var(--bs-border-color)' }}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                        <Legend
                            wrapperStyle={{ fontSize: '13px', color: 'var(--bs-body-color)', paddingTop: '10px' }}
                            iconType="circle"
                            iconSize={10}
                        />
                        <Bar
                            dataKey="clinicianCases"
                            name="Clinician Cases"
                            stackId="a"
                            fill={COLOR_CLINICIAN}
                            radius={[8, 8, 0, 0]}
                            maxBarSize={65}
                        >
                            <LabelList dataKey="percentage" content={renderLabel} />
                        </Bar>
                        <Bar
                            dataKey="otherCases"
                            name="Other Cases"
                            stackId="a"
                            fill={COLOR_OTHER}
                            radius={[8, 8, 0, 0]}
                            maxBarSize={65}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div style={{borderRadius: '0.75rem'}}>
            <div className="card-header bg-body-tertiary d-flex flex-column flex-md-row justify-content-between align-items-md-center py-3 px-3 px-md-4">
                <div className="d-flex align-items-center mb-2 mb-md-0">
                     <RiBarChartGroupedLine size={24} style={{color: COLOR_CLINICIAN}} className="me-2" />
                    <h2 className="fs-5 fw-semibold text-body-emphasis mb-0">
                        Monthly Case Distribution <span className="fw-normal text-body-secondary">({selectedYear.label})</span>
                    </h2>
                </div>
                <div style={{ minWidth: '180px' }}>
                    <Select
                        options={yearOptions}
                        value={selectedYear}
                        onChange={(option) => setSelectedYear(option as { value: number; label: string })}
                        isSearchable={false}
                        styles={reactSelectCustomStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        aria-label="Select year for monthly case summary"
                    />
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default ClinicianAnalyticsCaseSummaryMonthly;