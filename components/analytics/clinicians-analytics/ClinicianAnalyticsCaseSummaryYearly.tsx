"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import Select from 'react-select';

interface YearlyCaseSummary {
    year: number;
    clinician_cases: number;
    total_cases: number;
    percentage_clinician_cases: string;
}

interface ClinicianAnalyticsCaseSummaryYearlyProps {
    clinicianId: number;
}

const ClinicianAnalyticsCaseSummaryYearly: React.FC<ClinicianAnalyticsCaseSummaryYearlyProps> = ({ clinicianId }) => {
    const [yearlyData, setYearlyData] = useState<YearlyCaseSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchYearlyData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(`clinician/anal/case-summary/yearly/${clinicianId}`);
                if (response?.success) {
                    setYearlyData(response.data);
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
        year: item.year,
        clinicianCases: item.clinician_cases,
        otherCases: item.total_cases - item.clinician_cases,
        percentage: parseFloat(item.percentage_clinician_cases)
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const clinicianCases = payload[0].value;
            const otherCases = payload[1]?.value || 0;
            const totalCases = clinicianCases + otherCases;
            const percentage = (clinicianCases / totalCases * 100).toFixed(1);

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
                        Year: {label}
                    </div>
                    <div style={{ color: '#36A2EB' }}>Clinician Cases: {clinicianCases}</div>
                    <div style={{ color: '#FF6384' }}>Other Cases: {otherCases}</div>
                    <div style={{ borderTop: '1px solid #eee', marginTop: '4px', paddingTop: '4px' }}>
                        <div>Total Cases: {totalCases}</div>
                        <div style={{ color: '#2196F3', fontWeight: 500 }}>
                            Contribution: {percentage}%
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-bold mb-0 pls-label">Yearly Case Distribution</h2>
            </div>

            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        barSize={30}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                        <XAxis
                            dataKey="year"
                            fontSize={11}
                            tickSize={5}
                            tick={{ fill: '#666' }}
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
                                style={{
                                    fontSize: '10px',
                                    fill: '#666',
                                    fontWeight: 500
                                }}
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

export default ClinicianAnalyticsCaseSummaryYearly;