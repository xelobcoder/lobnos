"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Form, Button, Badge } from 'react-bootstrap';
import {
    RiStethoscopeLine,
    RiImageLine,
    RiTeamLine,
    RiRefreshLine,
    RiArrowLeftRightLine,
    RiBarChartLine,
    RiPieChartLine
} from '@remixicon/react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
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
import { toast } from 'react-toastify';
import { customFetch } from '../../../components/Auth/customFetch';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../components/isLoading';

// UI Constants to match existing analytics (Commissions/Compliance)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const SHADCN_BORDER = "var(--bs-border-color)";
const SHADCN_MUTED_FG = "var(--bs-secondary-color)";
const TOOLTIP_STYLE = {
    borderRadius: '8px',
    border: `1px solid ${SHADCN_BORDER}`,
    backgroundColor: 'var(--bs-body-bg)',
    color: 'var(--bs-body-color)'
};

interface ImagingAnalytics {
    totalCasesWithResults: number;
    totalUltrasoundCases: number;
    casesByUser: Array<{ employeeid: number | null; employeeName: string | null; role: string | null; casesWorked: number; ultrasoundCases: number }>;
    casesByModality?: Array<{ modality: string; cases: number }>;
    casesByDay?: Array<{ day: string; cases: number; ultrasoundCases: number }>;
}

export default function ImagingAnalyticsPage() {
    const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showModality, setShowModality] = useState(true);
    const [showDay, setShowDay] = useState(false);
    const [data, setData] = useState<ImagingAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const breakdown = [showModality && 'modality', showDay && 'day'].filter(Boolean).join(',');
        try {
            const response = await customFetch(`operations/imaging/analytics?startDate=${startDate}&endDate=${endDate}${breakdown ? `&breakdown=${breakdown}` : ''}`);
            if (response?.error || response?.totalCasesWithResults === undefined) {
                throw new Error(response?.error || response?.message || 'Unable to load imaging analytics');
            }
            setData(response);
        } catch (err: any) {
            setData(null);
            setError(err.message);
            toast.error(err.message || 'Error connecting to server', { position: 'top-right', autoClose: 2000 });
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, showModality, showDay]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleResetFilters = () => {
        setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setEndDate(dayjs().format('YYYY-MM-DD'));
        setShowModality(true);
        setShowDay(false);
    };

    const casesByUser = (data?.casesByUser || []).map((u) => ({
        ...u,
        userLabel: u.employeeName || (u.employeeid ? `Employee #${u.employeeid}` : 'Unassigned'),
    }));
    const casesByModality = data?.casesByModality || [];
    const casesByDay = data?.casesByDay || [];

    const userColumns = [
        { Header: 'User', accessor: 'userLabel' },
        {
            Header: 'Role',
            accessor: 'role',
            Cell: ({ row }) => <Badge bg="light" text="dark" className="text-capitalize">{row.original.role || '-'}</Badge>,
        },
        { Header: 'Cases', accessor: 'casesWorked' },
        { Header: 'Ultrasound', accessor: 'ultrasoundCases' },
    ];

    return (
        <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <RiImageLine className="me-2" />
                        Imaging Analytics Dashboard
                    </h2>
                    <p className="text-muted mb-0">Cases with results entered, ultrasound volume and work per user</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <Form.Group className="mb-0">
                        <Form.Control
                            type="date"
                            size="sm"
                            className="border-0 bg-light"
                            value={startDate}
                            max={endDate}
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
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Check
                        id="bd-modality"
                        type="checkbox"
                        label="By modality"
                        className="small ms-2"
                        checked={showModality}
                        onChange={(e) => setShowModality(e.target.checked)}
                    />
                    <Form.Check
                        id="bd-day"
                        type="checkbox"
                        label="By day"
                        className="small"
                        checked={showDay}
                        onChange={(e) => setShowDay(e.target.checked)}
                    />
                    <Button variant="outline-secondary" size="sm" className="ms-2 border-0" onClick={fetchAnalytics}>
                        <RiRefreshLine size={18} />
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="ms-2 border-0" onClick={handleResetFilters}>
                        <RiRefreshLine size={16} className="me-1" /> Clear Filters
                    </Button>
                </div>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {isLoading ? <Loader /> : data && (
                <>
                    <Row className="g-3 mb-4">
                        <Col md={4}>
                            <div className="border rounded p-3 h-100 shadow-none">
                                <div className="d-flex align-items-center mb-2">
                                    <RiImageLine size={20} className="me-2 text-primary" />
                                    <span className="fw-medium text-muted small">Cases with Results</span>
                                </div>
                                <div className="fs-4 fw-bold text-primary">{data.totalCasesWithResults.toLocaleString()}</div>
                                <div className="small text-muted">All imaging modalities</div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="border rounded p-3 h-100 shadow-none">
                                <div className="d-flex align-items-center mb-2">
                                    <RiStethoscopeLine size={20} className="me-2 text-success" />
                                    <span className="fw-medium text-muted small">Ultrasound Cases</span>
                                </div>
                                <div className="fs-4 fw-bold text-success">{data.totalUltrasoundCases.toLocaleString()}</div>
                                <div className="small text-muted">Subset of the total</div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="border rounded p-3 h-100 shadow-none">
                                <div className="d-flex align-items-center mb-2">
                                    <RiTeamLine size={20} className="me-2 text-warning" />
                                    <span className="fw-medium text-muted small">Staff Involved</span>
                                </div>
                                <div className="fs-4 fw-bold text-warning">{casesByUser.length.toLocaleString()}</div>
                                <div className="small text-muted">Distinct result-entry users</div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-4 mb-4">
                        <Col lg={showModality && casesByModality.length > 0 ? 8 : 12}>
                            <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                <h6 className="fw-bold mb-4 d-flex align-items-center">
                                    <RiBarChartLine size={20} className="me-2 text-primary" />
                                    Cases Worked per User
                                </h6>
                                {casesByUser.length === 0 ? (
                                    <p className="text-muted text-center my-5">No cases in this period</p>
                                ) : (
                                    <div style={{ height: '350px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={casesByUser} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={SHADCN_BORDER} />
                                                <XAxis dataKey="userLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                                <Tooltip cursor={{ fill: 'var(--bs-light)' }} contentStyle={TOOLTIP_STYLE} />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                                <Bar dataKey="casesWorked" name="Cases" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="ultrasoundCases" name="Ultrasound" fill="var(--bs-secondary-bg)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </Col>

                        {showModality && casesByModality.length > 0 && (
                            <Col lg={4}>
                                <div className="border rounded p-4 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                    <h6 className="fw-bold mb-4 d-flex align-items-center">
                                        <RiPieChartLine size={20} className="me-2 text-warning" />
                                        Cases per Modality
                                    </h6>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={casesByModality} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="cases" nameKey="modality">
                                                    {casesByModality.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4">
                                        {casesByModality.map((item, index) => (
                                            <div key={item.modality} className="d-flex justify-content-between align-items-center mb-2 small border-bottom pb-2">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                    {item.modality}
                                                </div>
                                                <span className="fw-bold">{item.cases}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>

                    {showDay && casesByDay.length > 0 && (
                        <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                            <h6 className="fw-bold mb-4 d-flex align-items-center">
                                <RiBarChartLine size={20} className="me-2 text-success" />
                                Cases per Day
                            </h6>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={casesByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={SHADCN_BORDER} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                        <Tooltip cursor={{ fill: 'var(--bs-light)' }} contentStyle={TOOLTIP_STYLE} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="cases" name="Cases" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="ultrasoundCases" name="Ultrasound" fill="var(--bs-secondary-bg)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                        <h6 className="fw-bold mb-4 d-flex align-items-center">
                            <RiTeamLine size={20} className="me-2 text-primary" />
                            Work per User
                        </h6>
                        <PrimeTable
                            column={userColumns}
                            data={casesByUser}
                            filtering={false}
                            serverSideFiltering={false}
                            handleSeverSideProcessing={null}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
