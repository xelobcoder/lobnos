"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, Row, Col, Form, Button, Badge, Table, Alert } from 'react-bootstrap';
import { 
    RiMoneyDollarCircleLine, 
    RiUserSharedLine, 
    RiBuilding4Line, 
    RiRefreshLine,
    RiArrowLeftLine,
    RiPieChartLine,
    RiInformationLine,
    RiCalendarLine,
    RiArrowLeftRightLine
} from '@remixicon/react';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend
} from 'recharts';
import dayjs from 'dayjs';
import Loader from '../../../../../components/accessories/Loader';
import { currencyFormatter ,customFetch} from '../../../../../components/Auth/customFetch';


// UI Constants to match existing analytics (Compliance/Sales)
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const SHADCN_BORDER = "var(--bs-border-color)";
const SHADCN_MUTED_FG = "var(--bs-secondary-color)";

export default function RecipientCommissionDetails() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const recipientId = params.id;
    
    // Initial state from URL or defaults
    const [startDate, setStartDate] = useState(searchParams.get('startDate') || dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || dayjs().format('YYYY-MM-DD'));
    const [recipientType, setRecipientType] = useState(searchParams.get('recipientType') || 'clinician');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<any>(null);
    const [recipientInfo, setRecipientInfo] = useState<any>(null);

    const calculatePeriod = () => {
        const diffInDays = dayjs(endDate).diff(dayjs(startDate), 'day');
        return diffInDays > 31 ? 'monthly' : 'daily';
    };

    const fetchRecipientDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const period = calculatePeriod();
        const url = `commission/analytics/recipient/${recipientId}?startDate=${startDate}&endDate=${endDate}&period=${period}&recipientType=${recipientType}`;
        
        try {
            if (!recipientInfo) {
                const infoUrl = recipientType === 'clinician' 
                    ? `clinicians/getclinician?id=${recipientId}`
                    : `organization/basic?id=${recipientId}`;
                
                const infoResponse = await customFetch(infoUrl);
                if (infoResponse.status === 'success' && infoResponse.result?.[0]) {
                    setRecipientInfo(infoResponse.result[0]);
                }
            }

            const response = await customFetch(url);
            if (response.status === 'success' && response.result) {
                setDetails(response.result);
            } else {
                throw new Error(response.message || 'Failed to fetch recipient details');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [recipientId, startDate, endDate, recipientType, recipientInfo]);

    useEffect(() => {
        fetchRecipientDetails();
    }, [fetchRecipientDetails]);

    if (isLoading && !details) {
        return <Loader />;
    }

    const chartData = details?.data || [];
    const periodType = calculatePeriod();
    
    // Calculate summary from the detailed data
    const summary = chartData.reduce((acc: any, curr: any) => ({
        totalPaid: acc.totalPaid + parseFloat(curr.total_paid),
        totalDue: acc.totalDue + parseFloat(curr.total_due),
        totalWaived: acc.totalWaived + parseFloat(curr.total_waived),
        batchCount: acc.batchCount + curr.batch_count
    }), { totalPaid: 0, totalDue: 0, totalWaived: 0, batchCount: 0 });

    const efficiency = summary.totalDue > 0 ? ((summary.totalPaid / summary.totalDue) * 100).toFixed(2) : "0";

    return (
        <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
            {/* Header consistent with Compliance Analytics */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="me-3 rounded-circle p-2 border-0"
                        onClick={() => router.back()}
                    >
                        <RiArrowLeftLine size={20} />
                    </Button>
                    <div>
                        <h2 className="mb-1">
                            {recipientType === 'clinician' ? <RiUserSharedLine className="me-2 text-primary" /> : <RiBuilding4Line className="me-2 text-info" />}
                            {recipientInfo?.name || `Recipient #${recipientId}`}
                        </h2>
                        <p className="text-muted mb-0 text-capitalize">{recipientType} performance analysis • Showing {periodType} breakdown</p>
                    </div>
                </div>
                
                <div className="d-flex gap-2 align-items-center">
                    <Form.Group className="mb-0">
                        <Form.Control 
                            type="date" 
                            size="sm" 
                            className="border-0 bg-light"
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                        />
                    </Form.Group>
                    <RiArrowLeftRightLine size={16} className="text-muted mx-1" />
                    <Form.Group className="mb-0">
                        <Form.Control 
                            type="date" 
                            size="sm" 
                            className="border-0 bg-light"
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                        />
                    </Form.Group>
                    <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="ms-2 border-0"
                        onClick={fetchRecipientDetails} 
                        disabled={isLoading}
                    >
                        <RiRefreshLine size={18} />
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            {/* Key Metrics Cards - Consistent with Compliance Page */}
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                            <span className="fw-medium text-muted small">Total Paid</span>
                        </div>
                        <div className="fs-4 fw-bold text-primary">{currencyFormatter.format(summary.totalPaid)}</div>
                        <div className="small text-muted">Actual payouts</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiInformationLine size={20} className="me-2 text-warning" />
                            <span className="fw-medium text-muted small">Total Due</span>
                        </div>
                        <div className="fs-4 fw-bold text-warning">{currencyFormatter.format(summary.totalDue)}</div>
                        <div className="small text-muted">Calculated commissions</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiPieChartLine size={20} className="me-2 text-info" />
                            <span className="fw-medium text-muted small">Efficiency</span>
                        </div>
                        <div className="fs-4 fw-bold text-info">{efficiency}%</div>
                        <div className="small text-muted">Paid vs Due ratio</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiCalendarLine size={20} className="me-2 text-danger" />
                            <span className="fw-medium text-muted small">Total Batches</span>
                        </div>
                        <div className="fs-4 fw-bold text-danger">{summary.batchCount}</div>
                        <div className="small text-muted">Payment cycles</div>
                    </div>
                </Col>
            </Row>

            {/* Charts Section - Using consistent styling */}
            <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <h5 className="mb-4 d-flex align-items-center fw-bold">
                    <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                    {periodType.charAt(0).toUpperCase() + periodType.slice(1)} Performance Trends
                </h5>
                <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={SHADCN_BORDER} />
                            <XAxis 
                                dataKey="period" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }}
                                tickFormatter={(val) => `GHS ${val}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: `1px solid ${SHADCN_BORDER}`,
                                    backgroundColor: 'var(--bs-body-bg)',
                                    color: 'var(--bs-body-color)'
                                }}
                                formatter={(value: any) => currencyFormatter.format(value)}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            <Line 
                                type="monotone" 
                                dataKey="total_paid" 
                                name="Paid Amount" 
                                stroke={COLOR_ACCENT} 
                                strokeWidth={3} 
                                dot={{ r: 5, fill: COLOR_ACCENT }} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="total_due" 
                                name="Due Amount" 
                                stroke="var(--bs-primary)" 
                                strokeWidth={2} 
                                strokeDasharray="5 5"
                                dot={{ r: 4, fill: "var(--bs-primary)" }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Data Table - Consistent with standard analytics tables */}
            <div className="border rounded overflow-hidden">
                <div className="bg-light px-4 py-3 border-bottom">
                    <h6 className="fw-bold mb-0">Detailed Payment Records</h6>
                </div>
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr className="border-bottom">
                            <th className="px-4 py-3 border-0 text-muted small fw-bold">PERIOD</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-end">TOTAL DUE</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-end">TOTAL PAID</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-end">WAIVED</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-center">BATCHES</th>
                            <th className="px-4 py-3 border-0 text-muted small fw-bold text-end">AVG. PAYMENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((item: any, index: number) => (
                            <tr key={index} className="align-middle border-bottom">
                                <td className="px-4 py-3 fw-medium text-capitalize">{item.period}</td>
                                <td className="text-end">{currencyFormatter.format(item.total_due)}</td>
                                <td className="text-end fw-bold text-success">{currencyFormatter.format(item.total_paid)}</td>
                                <td className="text-end text-warning">{currencyFormatter.format(item.total_waived)}</td>
                                <td className="text-center">{item.batch_count}</td>
                                <td className="px-4 text-end">{currencyFormatter.format(item.average_paid)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}
