"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import { format } from 'date-fns';

interface DailyCaseSummary {
    date: string;
    clinician_cases: number;
    total_cases: number;
    percentage_clinician_cases: string;
}

interface ClinicianAnalyticsCaseSummaryDailyProps {
    clinicianId: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const ClinicianAnalyticsCaseSummaryDaily: React.FC<ClinicianAnalyticsCaseSummaryDailyProps> = ({ clinicianId }) => {
    const [dailyData, setDailyData] = useState<DailyCaseSummary[]>([]);
    const [selectedYear, setSelectedYear] = useState({ value: new Date().getFullYear(), label: new Date().getFullYear().toString() });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString()
    }));

    useEffect(() => {
        const fetchDailyData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(
                    `clinician/anal/case-summary/daily/${clinicianId}?year=${selectedYear.value}`
                );
                if (response?.success) {
                    const sortedData = response.data.sort((a: DailyCaseSummary, b: DailyCaseSummary) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                    setDailyData(sortedData);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDailyData();
    }, [clinicianId, selectedYear.value]);

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

    const chartData = dailyData.map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        clinicianCases: item.clinician_cases,
        otherCases: item.total_cases - item.clinician_cases,
        totalCases: item.total_cases,
        percentage: parseFloat(item.percentage_clinician_cases)
    }));

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const clinicianCases = payload[0].value;
        const otherCases = payload[1]?.value || 0;
        const totalCases = payload[2]?.value || clinicianCases + otherCases;
        const percentage = ((clinicianCases / totalCases) * 100).toFixed(1);

        return (
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '0.75rem'
            }}>
                <div style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '4px',
                    marginBottom: '4px',
                    fontWeight: 600
                }}>
                    {label}
                </div>
                <div style={{ color: '#36A2EB' }}>Clinician Cases: {clinicianCases}</div>
                <div style={{ color: '#FF6384' }}>Other Cases: {otherCases}</div>
                <div style={{
                    borderTop: '1px solid #eee',
                    marginTop: '4px',
                    paddingTop: '4px'
                }}>
                    <div>Total Cases: {totalCases}</div>
                    <div style={{ color: '#2196F3', fontWeight: 500 }}>
                        Contribution: {percentage}%
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                    <h2 className="fs-4 fw-bold mb-0 pls-label">Daily Case Trends ({selectedYear.value})</h2>
                </div>
                <div style={{ width: '150px' }}>
                    <Select
                        options={yearOptions}
                        value={selectedYear}
                        onChange={(option) => setSelectedYear(option as { value: number; label: string })}
                        isSearchable={false}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                </div>
            </div>

            <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            fontSize={11}
                            tickSize={5}
                            tick={{ fill: '#666' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            fontSize={11}
                            width={45}
                            tick={{ fill: '#666' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                marginTop: '10px'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="clinicianCases"
                            name="Clinician Cases"
                            stroke="#36A2EB"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="otherCases"
                            name="Other Cases"
                            stroke="#FF6384"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalCases"
                            name="Total Cases"
                            stroke="#4BC0C0"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ClinicianAnalyticsCaseSummaryDaily;