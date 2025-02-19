"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import moment from 'moment';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, Pagination, Form } from 'react-bootstrap';
import styles from '../../../styles/SmsTemplateList.module.css';

interface DailyCaseChange {
    date: string;
    clinician_cases: number;
    previous_day_cases: number | null;
    percentage_change: string;
}

interface ClinicianAnalyticsDailyCaseChangeProps {
    clinicianId: number;
}

interface PaginationParams {
    page: number;
    count: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const percentageChange = parseFloat(data.percentage_change);

    return (
        <div className="bg-white p-3 shadow-sm rounded border" style={{ fontSize: '0.875rem' }}>
            <p className="fw-bold mb-2">{moment(label).format('MMMM D, YYYY')}</p>
            <div className="d-flex flex-column gap-1">
                <div>Cases: <span className="fw-semibold">{data.clinician_cases}</span></div>
                <div>Previous: <span className="fw-semibold">{data.previous_day_cases ?? '-'}</span></div>
                <div className={`fw-semibold ${percentageChange > 0 ? 'text-success' : percentageChange < 0 ? 'text-danger' : 'text-muted'}`}>
                    Change: {percentageChange === 0 ? '-' : `${percentageChange.toFixed(1)}%`}
                </div>
            </div>
        </div>
    );
};

const CARD_HEIGHT = '600px';
const COUNT_OPTIONS = [10, 20, 30, 50];

const ClinicianAnalyticsDailyCaseChange: React.FC<ClinicianAnalyticsDailyCaseChangeProps> = ({ clinicianId }) => {
    const [dailyData, setDailyData] = useState<DailyCaseChange[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationParams>({
        page: 1,
        count: 10
    });
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchDailyData = async () => {
            setLoading(true);
            try {
                const response = await customFetch(
                    `clinician/anal/case-change/daily/${clinicianId}?page=${pagination.page}&count=${pagination.count}`
                );
                if (response?.success) {
                    const sortedData = response.data.sort((a: DailyCaseChange, b: DailyCaseChange) =>
                        moment(a.date).valueOf() - moment(b.date).valueOf()
                    );
                    setDailyData(sortedData);
                    if (response.total) {
                        setTotalPages(Math.ceil(response.total / pagination.count));
                    }
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
    }, [clinicianId, pagination.page, pagination.count]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleCountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCount = parseInt(event.target.value);
        setPagination({ page: 1, count: newCount });
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger" role="alert">{error}</div>
    );

    return (
        <div className="container-fluid p-4">
            <div className="row mb-3">
                <div className="col-12 d-flex justify-content-end">
                    <Form.Select
                        style={{ width: 'auto' }}
                        value={pagination.count}
                        onChange={handleCountChange}
                        className="me-2"
                    >
                        {COUNT_OPTIONS.map(option => (
                            <option key={option} value={option}>
                                {option} records per page
                            </option>
                        ))}
                    </Form.Select>
                </div>
            </div>
            <div className="row g-4">
                <div className="col-12">
                    <div className="row g-4">
                        {/* Chart Column */}
                        <div className="col-12 col-xl-6">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="mb-0">Case Trend Analysis</h5>
                                    </div>
                                    <div style={{ height: CARD_HEIGHT, flex: 1 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={dailyData}>
                                                <defs>
                                                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(date) => moment(date).format('MMM DD')}
                                                    fontSize={12}
                                                    tick={{ fill: '#6c757d' }}
                                                />
                                                <YAxis fontSize={12} tick={{ fill: '#6c757d' }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="clinician_cases"
                                                    stroke="#0d6efd"
                                                    fillOpacity={1}
                                                    fill="url(#colorCases)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        {/* Table Column */}
                        <div className="col-12 col-xl-6">
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="mb-0">Detailed Case Analysis</h5>
                                    </div>
                                    <div className="table-responsive" style={{ height: CARD_HEIGHT, flex: 1 }}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th className="text-end">Cases</th>
                                                    <th className="text-end">Previous Day</th>
                                                    <th className="text-end">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dailyData.map((item, index) => {
                                                    const percentageChange = parseFloat(item.percentage_change);
                                                    return (
                                                        <tr key={index}>
                                                            <td>{moment(item.date).format('MMM DD, YYYY')}</td>
                                                            <td className="text-end fw-semibold">{item.clinician_cases}</td>
                                                            <td className="text-end text-muted">{item.previous_day_cases ?? '-'}</td>
                                                            <td className="text-end">
                                                                <span className={`badge ${percentageChange > 0 ? 'bg-success' :
                                                                        percentageChange < 0 ? 'bg-danger' :
                                                                            'bg-secondary'
                                                                    }`}>
                                                                    {percentageChange === 0 ? '-' : `${percentageChange.toFixed(1)}%`}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-12 d-flex justify-content-center">
                    <Pagination>
                        <Pagination.Prev
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                        />
                        <Pagination.Item active>{pagination.page}</Pagination.Item>
                        <Pagination.Next
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === totalPages}
                        />
                    </Pagination>
                </div>
            </div>
        </div>
    );
};

export default ClinicianAnalyticsDailyCaseChange;