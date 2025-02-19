"use client"
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { customFetch } from '../../Auth/customFetch';

interface CaseSummaryData {
    clinician_cases: number;
    total_cases: number;
    percentage_clinician_cases: string;
}

interface ClinicianCasesVerseTotalCasesProps {
    clinicianId: number;
}

const ClinicianCasesVerseTotalCases: React.FC<ClinicianCasesVerseTotalCasesProps> = ({ clinicianId }) => {
    const [summaryData, setSummaryData] = useState<CaseSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(`clinician/anal/case-summary/overall/${clinicianId}`);
                if (response?.success) {
                    setSummaryData(response.data[0]);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryData();
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

    if (!summaryData) return null;

    const COLORS = ['#36A2EB', '#FF6384'];

    const chartData = [
        {
            name: "Clinician's Cases",
            value: summaryData.clinician_cases
        },
        {
            name: "Other Cases",
            value: summaryData.total_cases - summaryData.clinician_cases
        }
    ];

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fs-4 fw-bold mb-0 pls-label">Case Distribution </h2>
                <div className="bg-light px-3 py-2 rounded">
                    <span className="fw-bold">Contribution: </span>
                    <span>{parseFloat(summaryData.percentage_clinician_cases).toFixed(1)}%</span>
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
                                `${name} (${(percent * 100).toFixed(1)}%)`
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
                            formatter={(value: number) => [value, 'Cases']}
                            contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend
                            formatter={(value, entry: any) => `${value}: ${entry.payload.value} cases`}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ClinicianCasesVerseTotalCases;