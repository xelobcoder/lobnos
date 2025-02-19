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
} from 'recharts';
import Select from 'react-select';

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

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString()
    }));

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                    <h2 className="fs-4 fw-bold mb-0 pls-label">Monthly Cases and Cost Analysis</h2>
                    <button
                        onClick={() => router.push(`/clinician/analytics/insights/${clinicianId}?year=${selectedYear.value}`)}
                        className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                        style={{
                            backgroundColor: '#1f77b4',
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
            </div>

            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        barSize={30}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            fontSize={12}
                            tickSize={5}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(value) => currencyFormatter.format(value)}
                            fontSize={12}
                            width={80}
                            label={{
                                value: 'Total Cost',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            fontSize={12}
                            width={50}
                            label={{
                                value: 'Cases',
                                angle: 90,
                                position: 'insideRight',
                                style: { textAnchor: 'middle' }
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
                            fill="#1f77b4"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="cases"
                            name="Cases"
                            fill="#ff7f0e"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ClinicianAnalyticsMonthlyTotals;