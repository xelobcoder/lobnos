"use client"
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

interface MonthlyCaseSummary {
    year: number;
    month: number;
    clinician_cases: number;
    total_cases: number;
    percentage_clinician_cases: string;
}

interface ClinicianAnalyticsCaseSummaryMonthlyProps {
    clinicianId: number;
}

const ClinicianAnalyticsCaseSummaryMonthly: React.FC<ClinicianAnalyticsCaseSummaryMonthlyProps> = ({ clinicianId }) => {
    const [monthlyData, setMonthlyData] = useState<MonthlyCaseSummary[]>([]);
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
                const response = await customFetch(
                    `clinician/anal/case-summary/monthly/${clinicianId}?year=${selectedYear.value}`
                );
                if (response?.success) {
                    const sortedData = response.data.sort((a: MonthlyCaseSummary, b: MonthlyCaseSummary) => a.month - b.month);
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

    const chartData = monthlyData.map(item => ({
        month: monthNames[item.month - 1],
        clinicianCases: item.clinician_cases,
        otherCases: item.total_cases - item.clinician_cases,
        totalCases: item.total_cases,
        percentage: parseFloat(item.percentage_clinician_cases)
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const clinicianCases = payload[0].value;
            const otherCases = payload[1]?.value || 0;
            const totalCases = clinicianCases + otherCases;
            const percentage = (clinicianCases / totalCases * 100).toFixed(1);

            return (
                <div className="bg-white p-2 border rounded shadow-sm pls-color">
                    <p className="mb-1 fw-bold">{label}</p>
                    <p className="mb-1">Clinician Cases: {clinicianCases}</p>
                    <p className="mb-1">Other Cases: {otherCases}</p>
                    <p className="mb-1">Total Cases: {totalCases}</p>
                    <p className="mb-0 text-primary">Contribution: {percentage}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                    <h2 className="fs-4 fw-bold mb-0 pls-label">Monthly Case Distribution ({selectedYear.value})</h2>
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
                            fontSize={12}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Bar
                            dataKey="clinicianCases"
                            name="Clinician Cases"
                            stackId="a"
                            fill="#36A2EB"
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList
                                dataKey="percentage"
                                position="top"
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                                style={{ fontSize: '11px' }}
                            />
                        </Bar>
                        <Bar
                            dataKey="otherCases"
                            name="Other Cases"
                            stackId="a"
                            fill="#FF6384"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ClinicianAnalyticsCaseSummaryMonthly;