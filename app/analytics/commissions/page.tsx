"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card, Row, Col, Form, Button, Badge, Spinner, Table } from 'react-bootstrap';
import {
    RiMoneyDollarCircleLine,
    RiTimeLine,
    RiUserSharedLine,
    RiBuilding4Line,
    RiCalendarLine,
    RiRefreshLine,
    RiArrowRightUpLine,
    RiArrowLeftRightLine,
    RiPieChartLine,
    RiInformationLine
} from '@remixicon/react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import dayjs from 'dayjs';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import Loader from '../../../components/isLoading';

// UI Constants to match existing analytics (Compliance/Sales)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const SHADCN_BORDER = "var(--bs-border-color)";
const SHADCN_MUTED_FG = "var(--bs-secondary-color)";

export default function CommissionAnalytics() {
    const app = useApplication();
    const [recipientPage, setRecipientPage] = useState(1);
    const requestRevision = useRef(0);

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);

    // Filters
    const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [period, setPeriod] = useState('monthly');
    const [recipientType, setRecipientType] = useState('all');

    const fetchDashboard = useCallback(async () => {
        const revision = ++requestRevision.current;
        setRecipientPage(1);
        setIsLoading(true);
        setError(null);
        setDashboardData(null);
        if (!startDate || !endDate || startDate > endDate) { setError("Select a valid date range."); setIsLoading(false); return; }

        // Build URL based on filters
        let url = `commission/analytics/dashboard?startDate=${startDate}&endDate=${endDate}&period=${period}`;
        if (recipientType !== 'all') {
            url += `&recipientType=${recipientType}`;
        }

        try {
            const response = await customFetch(url);
            if (revision !== requestRevision.current) return;
            if (response.status === 'success') {
                setDashboardData(response.result);
            } else {
                throw new Error(response.message || 'Failed to fetch analytics data');
            }
        } catch (err: any) {
            if (revision === requestRevision.current) setError(err.message);
        } finally {
            if (revision === requestRevision.current) setIsLoading(false);
        }
    }, [startDate, endDate, period, recipientType]);

    const handleResetFilters = () => {
        setStartDate(dayjs().subtract(1, 'month').format('YYYY-MM-DD'));
        setEndDate(dayjs().format('YYYY-MM-DD'));
        setPeriod('monthly');
        setRecipientType('all');
    };

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const summary = dashboardData?.summary || {};
    const byPeriod = dashboardData?.byPeriod?.data || [];
    const byStatus = dashboardData?.byStatus || [];
    const efficiency = dashboardData?.recipientEfficiency || [];

    // Parse numeric strings to numbers
    const parsedSummary = {
        ...summary,
        totalPaid: parseFloat(summary.totalPaid || 0),
        totalDue: parseFloat(summary.totalDue || 0),
        totalWaived: parseFloat(summary.totalWaived || 0),
        averagePaid: parseFloat(summary.averagePaid || 0),
        paymentPercentage: parseFloat(summary.paymentPercentage || 0),
    };

    const parsedByPeriod = byPeriod.map((item: any) => ({
        ...item,
        total_paid: parseFloat(item.total_paid || 0),
        average_paid: parseFloat(item.average_paid || 0),
        total_waived: parseFloat(item.total_waived || 0),
        total_due: parseFloat(item.total_due || 0),
    }));

    const parsedByStatus = byStatus.map((item: any) => ({
        ...item,
        totalPaid: parseFloat(item.totalPaid || 0),
        averagePaid: parseFloat(item.averagePaid || 0),
    }));

    const parsedEfficiency = efficiency.map((item: any) => ({
        ...item,
        totalPaid: parseFloat(item.totalPaid || 0),
        totalDue: parseFloat(item.totalDue || 0),
        paymentPercentage: parseFloat(item.paymentPercentage || 0),
        recipientName: item.recipient_name || '',
    }));

    return (
        <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
            {/* Header consistent with Compliance Analytics */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <RiMoneyDollarCircleLine className="me-2" />
                        Commission Analytics Dashboard
                    </h2>
                    <p className="text-muted mb-0">Reporting and analysis of paid commissions across time periods</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <Form.Group className="mb-0">
                        <Form.Control
                            type="date"
                            aria-label="Report date"
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
                    <Form.Select
                        size="sm"
                        className="w-auto border-0 bg-light"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </Form.Select>
                    <Form.Select
                        size="sm"
                        className="w-auto border-0 bg-light"
                        value={recipientType}
                        onChange={(e) => setRecipientType(e.target.value)}
                    >
                        <option value="all">All Recipients</option>
                        <option value="clinician">Clinicians</option>
                        <option value="organization">Organizations</option>
                    </Form.Select>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="ms-2 border-0"
                        onClick={fetchDashboard}
                    >
                        <RiRefreshLine size={18} /><span className="visually-hidden">Refresh report</span>
                    </Button>                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="ms-2 border-0"
                        onClick={handleResetFilters}
                    >
                        <RiRefreshLine size={16} className="me-1" /> Clear Filters
                    </Button>                </div>
            </div>

            {error && <div role="alert" className="alert alert-danger mb-4">{error}</div>}
            {isLoading && <div role="status" className="py-4">Loading commission analytics...</div>}
            <div hidden={isLoading || !!error}>

            {/* Key Metrics Cards - Consistent with Compliance Page */}
            <Row className="g-3 mb-4">
                <Col md={3}><div className="border rounded p-3 h-100"><span className="text-muted small">Outstanding at end date</span><div className="fs-4 fw-bold">{currencyFormatter.format(Number(summary.totalOutstanding || 0))}</div><small>Earned less payments and waivers through {endDate}</small></div></Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                            <span className="fw-medium text-muted small">Total Paid</span>
                        </div>
                        <div className="fs-4 fw-bold text-primary">{currencyFormatter.format(parsedSummary.totalPaid)}</div>
                        <div className="small text-muted">{parsedSummary.paymentPercentage.toFixed(2)}% payments / period earnings</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiInformationLine size={20} className="me-2 text-warning" />
                            <span className="fw-medium text-muted small">Commission Earned</span>
                        </div>
                        <div className="fs-4 fw-bold text-warning">{currencyFormatter.format(parsedSummary.totalDue)}</div>
                        <div className="small text-muted">Earned in the selected period</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiPieChartLine size={20} className="me-2 text-info" />
                            <span className="fw-medium text-muted small">Total Waived</span>
                        </div>
                        <div className="fs-4 fw-bold text-info">{currencyFormatter.format(parsedSummary.totalWaived)}</div>
                        <div className="small text-muted">Waived portions</div>
                    </div>
                </Col>
                <Col md={3}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiUserSharedLine size={20} className="me-2 text-danger" />
                            <span className="fw-medium text-muted small">Recipients</span>
                        </div>
                        <div className="fs-4 fw-bold text-danger">{parsedSummary.uniqueRecipients}</div>
                        <div className="small text-muted">{parsedSummary.batchCount} batches processed</div>
                    </div>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                {/* Period Trend Chart */}
                <Col lg={8}>
                    <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                        <h6 className="fw-bold mb-4 d-flex align-items-center">
                            <RiMoneyDollarCircleLine size={20} className="me-2 text-primary" />
                            Payment Trends by {period.charAt(0).toUpperCase() + period.slice(1)}
                        </h6>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={parsedByPeriod} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                        cursor={{ fill: 'var(--bs-light)' }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: `1px solid ${SHADCN_BORDER}`,
                                            backgroundColor: 'var(--bs-body-bg)',
                                            color: 'var(--bs-body-color)'
                                        }}
                                        formatter={(value: any, name: any) => [currencyFormatter.format(value), name]}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="total_paid" name="Total Paid" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="total_due" name="Commission Earned" fill="var(--bs-secondary-bg)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Col>

                {/* Status Breakdown */}
                <Col lg={4}>
                    <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                        <h6 className="fw-bold mb-4 d-flex align-items-center">
                            <RiPieChartLine size={20} className="me-2 text-warning" />
                            Batch Status
                        </h6>
                        <div style={{ height: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={parsedByStatus}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {parsedByStatus.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: `1px solid ${SHADCN_BORDER}`,
                                            backgroundColor: 'var(--bs-body-bg)',
                                            color: 'var(--bs-body-color)'
                                        }}
                                        formatter={(value: any) => [Number(value), 'Batches']}
                                    />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4">
                            {parsedByStatus.map((item: any, index: number) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2 small border-bottom pb-2">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-capitalize">{item.status}</span>
                                    </div>
                                    <span className="fw-bold">{currencyFormatter.format(item.totalPaid)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Recipient Efficiency Table */}
            <div className="border rounded overflow-hidden">
                <div className="bg-light px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">Recipient Commission Activity</h6>
                    <Badge bg="secondary" className="fw-normal">Recipients ranked by payments</Badge>
                </div>
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr className="border-bottom">
                            <th className="px-4 py-3 border-0 text-muted small fw-bold">RECIPIENT</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-center">TYPE</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-end">TOTAL DUE</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-end">TOTAL PAID</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-center">PAYMENTS / EARNINGS</th>
                            <th className="py-3 border-0 text-muted small fw-bold text-center">BATCHES</th>
                            <th className="px-4 py-3 border-0 text-muted small fw-bold text-end">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsedEfficiency.slice((recipientPage - 1) * 20, recipientPage * 20).map((item: any, index: number) => (
                            <tr key={index} className="align-middle border-bottom">
                                <td className="px-4 py-3 fw-medium">
                                    {item.recipientType === 'clinician' ? <RiUserSharedLine size={16} className="me-2 text-primary" /> : <RiBuilding4Line size={16} className="me-2 text-info" />}
                                    {item.recipientName || `Recipient #${item.recipientId}`}
                                </td>
                                <td className="text-center">
                                    <Badge bg={item.recipientType === 'clinician' ? 'primary' : 'info'} className="text-capitalize fw-normal bg-opacity-10 text-dark border">
                                        {item.recipientType}
                                    </Badge>
                                </td>
                                <td className="text-end">{currencyFormatter.format(item.totalDue)}</td>
                                <td className="text-end fw-bold text-success">{currencyFormatter.format(item.totalPaid)}</td>
                                <td className="text-center">
                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                        <div className="progress flex-grow-1" style={{ height: 6, minWidth: 60, backgroundColor: 'var(--bs-secondary-bg)' }}>
                                            <div
                                                className={`progress-bar bg-${item.paymentPercentage >= 90 ? 'success' : item.paymentPercentage >= 50 ? 'warning' : 'danger'}`}
                                                style={{ width: `${item.paymentPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="small fw-bold">{item.paymentPercentage.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td className="text-center">{item.paymentBatches}</td>
                                <td className="px-4 text-end">
                                    <Link
                                        href={`/analytics/commissions/recipient/${item.recipientId}?startDate=${startDate}&endDate=${endDate}&period=${period}&recipientType=${item.recipientType}`}
                                        className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                                    >
                                        Details <RiArrowRightUpLine size={16} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {parsedEfficiency.length > 20 && <div className="d-flex gap-3 align-items-center p-3"><button className="btn btn-outline-secondary btn-sm" disabled={recipientPage === 1} onClick={() => setRecipientPage(page => page - 1)}>Previous</button><span>Page {recipientPage} of {Math.ceil(parsedEfficiency.length / 20)} · {parsedEfficiency.length} recipients</span><button className="btn btn-outline-secondary btn-sm" disabled={recipientPage * 20 >= parsedEfficiency.length} onClick={() => setRecipientPage(page => page + 1)}>Next</button></div>}
                {parsedEfficiency.length === 0 && (
                    <div className="text-center py-5 text-muted bg-white">
                        <RiMoneyDollarCircleLine size={48} className="mb-3 opacity-25" />
                        <p>No recipient efficiency data available for this period.</p>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
