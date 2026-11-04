"use client"
import React, { useEffect, useState } from 'react';
import { currencyFormatter, customFetch, reactSelectCustomStyles } from '../../Auth/customFetch';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface YearlyData {
    year: number;
    total_rows: number;
    total_cost: string;
    total_payable: string;
    total_tax: string;
}

interface ClinicianAnalyticsYearlyComparisonProps {
    clinicianId: number;
}

type MetricOption = {
    value: keyof YearlyData;
    label: string;
    isCurrency: boolean;
};

const ClinicianAnalyticsYearlyComparison: React.FC<ClinicianAnalyticsYearlyComparisonProps> = ({ clinicianId }: {clinicianId: string | number}) => {
    const router = useRouter();
    const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<MetricOption>({
        value: 'total_cost',
        label: 'Total Cost',
        isCurrency: true
    });

    const metricOptions: MetricOption[] = [
        { value: 'total_rows', label: 'Total Cases', isCurrency: false },
        { value: 'total_cost', label: 'Total Cost', isCurrency: true },
        { value: 'total_payable', label: 'Total Payable', isCurrency: true },
        { value: 'total_tax', label: 'Total Tax', isCurrency: true },
    ];

    const COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];

    useEffect(() => {
        const fetchYearlyData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(`clinician/anal/yearly/${clinicianId}`);
                if (response?.success) {
                    const sortedData = response.data.sort((a: YearlyData, b: YearlyData) => a.year - b.year);
                    setYearlyData(sortedData);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchYearlyData();
    }, [clinicianId]);

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

    const chartData = yearlyData.map(item => ({
        name: item.year.toString(),
        value: selectedMetric.isCurrency
            ? parseFloat(item[selectedMetric.value as keyof YearlyData] as string)
            : item[selectedMetric.value as keyof YearlyData] as number
    }));

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                {/* <div className="d-flex align-items-center gap-3">
                    <h2 className="fs-4 fw-bold mb-0 pls-label">Yearly Comparison</h2>
                    <button
                        onClick={() => router.push(`/clinician/analytics/detailed/${clinicianId}`)}
                        className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                        style={{
                            backgroundColor: '#36A2EB',
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
                </div> */}
                <div style={{ width: '200px' }}>
                    <Select
                        options={metricOptions}
                        value={selectedMetric}
                        onChange={(option) => setSelectedMetric(option as MetricOption)}
                        styles={reactSelectCustomStyles}
                        isSearchable={false}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
            </div>

            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) =>
                                selectedMetric.isCurrency
                                    ? currencyFormatter.format(value)
                                    : value
                            }
                        />
                        <Legend
                            formatter={(value, entry: any) => {
                                const { payload } = entry;
                                return `${value}: ${selectedMetric.isCurrency
                                        ? currencyFormatter.format(payload.value)
                                        : payload.value
                                    }`;
                            }}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ClinicianAnalyticsYearlyComparison;