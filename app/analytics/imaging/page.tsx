"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
    RiStethoscopeLine,
    RiImageLine,
    RiTeamLine,
    RiRefreshLine,
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
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import AnalyticSummaryCard from '../../../components/Billing/AnalyticSummaryCard';
import ui from '../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from '../../../components/operations/ImagingReports.module.css';

const COLORS = ['var(--bs-primary)', 'var(--bs-success)', 'var(--bs-warning)', 'var(--bs-danger)', 'var(--bs-info)', 'var(--bs-secondary)'];
const COLOR_ACCENT = 'var(--pls-primary, var(--bs-success))';
const SHADCN_BORDER = "var(--bs-border-color)";
const SHADCN_MUTED_FG = "var(--bs-secondary-color)";
const TOOLTIP_STYLE = {
    borderRadius: '6px',
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
    const [dateFilter, setDateFilter] = useState('This Month');
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
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to load imaging analytics';
            setData(null);
            setError(message);
            toast.error(message, { position: 'top-right', autoClose: 2000 });
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
        setDateFilter('This Month');
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
            Cell: ({ row }: { row: { original: ImagingAnalytics['casesByUser'][number] } }) => <span className="text-capitalize">{row.original.role || '-'}</span>,
        },
        { Header: 'Cases', accessor: 'casesWorked' },
        { Header: 'Ultrasound', accessor: 'ultrasoundCases' },
    ];

    return (
        <div className={ui.workspace}>
            <header className={ui.header}>
                <div className={ui.heading}>
                    <RiImageLine size={24} style={{ color: COLOR_ACCENT }} aria-hidden="true" />
                    <div>
                        <span className={ui.eyebrow}>Imaging performance</span>
                        <h1>Imaging Analytics</h1>
                        <p>Cases with results entered, ultrasound volume and work per user for {dayjs(startDate).format('DD MMM YYYY')} to {dayjs(endDate).format('DD MMM YYYY')}.</p>
                    </div>
                </div>
                <div className={ui.actions}>
                    <button type="button" className={ui.secondary} disabled={isLoading} onClick={fetchAnalytics}>
                        <RiRefreshLine size={18} aria-hidden="true" /> Refresh
                    </button>
                </div>
            </header>

            {error && <div className={ui.error} role="alert">{error}<button type="button" className={ui.secondary} disabled={isLoading} onClick={fetchAnalytics}>Retry loading</button></div>}

            {data && !isLoading && (
                <div className="row g-3">
                    <div className="col-12 col-md-4">
                        <AnalyticSummaryCard title="Cases with Results" value={data.totalCasesWithResults.toLocaleString()} detail="All imaging modalities" variant="primary" icon={<RiImageLine size={22} />} />
                    </div>
                    <div className="col-12 col-md-4">
                        <AnalyticSummaryCard title="Ultrasound Cases" value={data.totalUltrasoundCases.toLocaleString()} detail="Subset of the total" variant="success" icon={<RiStethoscopeLine size={22} />} />
                    </div>
                    <div className="col-12 col-md-4">
                        <AnalyticSummaryCard title="Staff Involved" value={casesByUser.length.toLocaleString()} detail="Distinct result-entry users" variant="info" icon={<RiTeamLine size={22} />} />
                    </div>
                </div>
            )}

            <section className={styles.analyticsFilters} aria-label="Imaging analytics filters">
                <DateFilterReusable
                    value={dateFilter}
                    onChange={setDateFilter}
                    onDateRangeChange={(newStart, newEnd) => {
                        setStartDate(newStart);
                        setEndDate(newEnd);
                    }}
                    label="Filter by"
                    className="w-auto"
                />
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="bd-modality" checked={showModality} onChange={(e) => setShowModality(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="bd-modality">By modality</label>
                </div>
                <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="bd-day" checked={showDay} onChange={(e) => setShowDay(e.target.checked)} />
                    <label className="form-check-label small" htmlFor="bd-day">By day</label>
                </div>
                <button type="button" className={ui.primary} disabled={isLoading} onClick={fetchAnalytics}>
                    <RiRefreshLine size={16} aria-hidden="true" /> {isLoading ? 'Loading…' : 'Load data'}
                </button>
                <button type="button" className={ui.secondary} onClick={handleResetFilters}>
                    <RiRefreshLine size={16} aria-hidden="true" /> Reset
                </button>
            </section>

            {isLoading ? <Loader /> : data && (
                <>

                    <div className="row g-3 mb-3">
                        <div className={showModality && casesByModality.length > 0 ? 'col-12 col-lg-8' : 'col-12'}>
                            <div className={`${ui.panel} ${styles.chart}`}>
                                <div className={styles.chartHeader}>
                                    <h3 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                        <RiBarChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" aria-hidden="true" />
                                        Cases Worked per User
                                    </h3>
                                </div>
                                <div className={styles.chartBody}>
                                {casesByUser.length === 0 ? (
                                    <p className="text-muted text-center my-5">No cases in this period</p>
                                ) : (
                                    <div style={{ height: '350px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={casesByUser} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={SHADCN_BORDER} />
                                                <XAxis dataKey="userLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                                <Tooltip cursor={{ fill: 'var(--bs-tertiary-bg)' }} contentStyle={TOOLTIP_STYLE} />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                                <Bar dataKey="casesWorked" name="Cases" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="ultrasoundCases" name="Ultrasound" fill="var(--bs-primary)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>

                        {showModality && casesByModality.length > 0 && (
                            <div className="col-12 col-lg-4">
                                <div className={`${ui.panel} ${styles.chart}`}>
                                    <div className={styles.chartHeader}>
                                        <h3 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                            <RiPieChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" aria-hidden="true" />
                                            Cases per Modality
                                        </h3>
                                    </div>
                                    <div className={styles.chartBody}>
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
                                </div>
                            </div>
                        )}
                    </div>

                    {showDay && casesByDay.length > 0 && (
                        <div className={`${ui.panel} ${styles.chart}`}>
                            <div className={styles.chartHeader}>
                                <h3 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                    <RiBarChartLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" aria-hidden="true" />
                                    Cases per Day
                                </h3>
                            </div>
                            <div className={styles.chartBody}>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={casesByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={SHADCN_BORDER} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: SHADCN_MUTED_FG }} />
                                        <Tooltip cursor={{ fill: 'var(--bs-tertiary-bg)' }} contentStyle={TOOLTIP_STYLE} />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="cases" name="Cases" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="ultrasoundCases" name="Ultrasound" fill="var(--bs-primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            </div>
                        </div>
                    )}

                    <section className={styles.table} aria-label="Work per User">
                    <h2 className={ui.sectionTitle}>
                        <RiTeamLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" aria-hidden="true" />
                        Work per User
                    </h2>
                    <PrimeTable
                        column={userColumns}
                        data={casesByUser}
                        filtering={false}
                        serverSideFiltering={false}
                        handleSeverSideProcessing={null}
                    />
                    </section>
                </>
            )}
        </div>
    );
}
