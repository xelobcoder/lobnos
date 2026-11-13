"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { RiArrowLeftLine, RiRefreshLine } from '@remixicon/react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { currencyFormatter, customFetch } from '../../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import ui from '../../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from '../../CommissionAnalytics.module.css';

interface Range { startDate: string; endDate: string; period: string }
interface PeriodActivity {
    period: string;
    total_due: number | string;
    total_paid: number | string;
    total_waived: number | string;
    average_paid: number | string;
    batch_count: number;
}

export default function RecipientCommissionDetails() {
    const params = useParams();
    const searchParams = useSearchParams();
    const recipientId = Number(params.id);
    const recipientType = searchParams.get('recipientType') === 'organization' ? 'organization' : 'clinician';
    const [range, setRange] = useState<Range>(() => ({
        startDate: searchParams.get('startDate') || dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        endDate: searchParams.get('endDate') || dayjs().format('YYYY-MM-DD'),
        period: searchParams.get('period') || 'monthly',
    }));
    const [applied, setApplied] = useState(range);
    const initialRange = useRef(range);
    const [dateFilter, setDateFilter] = useState('Custom Range');
    const [rows, setRows] = useState<PeriodActivity[]>([]);
    const [recipientName, setRecipientName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const revision = useRef(0);

    const loadReport = useCallback(async (next: Range) => {
        const request = ++revision.current;
        setError('');
        if (!next.startDate || !next.endDate || next.startDate > next.endDate || !Number.isSafeInteger(recipientId) || recipientId <= 0) {
            setError('Choose a valid recipient and date range.');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const query = new URLSearchParams({ ...next, recipientType });
            const infoUrl = recipientType === 'clinician' ? `clinicians/getclinician?id=${recipientId}` : `organization/basic?id=${recipientId}`;
            const [response, info] = await Promise.all([
                customFetch(`commission/analytics/recipient/${recipientId}?${query}`),
                customFetch(infoUrl).catch(() => null),
            ]);
            if (request !== revision.current) return;
            if (response.status !== 'success' || !Array.isArray(response.result?.data)) throw new Error(response.message || 'Unable to load recipient analytics.');
            setRows(response.result.data);
            const records = info?.result || info?.data;
            const recipient = Array.isArray(records) ? records[0] : records;
            setRecipientName(recipient?.name || recipient?.organization_name || recipient?.clinician_name || '');
            setApplied(next);
            setPage(1);
        } catch (err) {
            if (request === revision.current) setError(err instanceof Error ? err.message : 'Unable to load recipient analytics.');
        } finally {
            if (request === revision.current) setLoading(false);
        }
    }, [recipientId, recipientType]);

    useEffect(() => {
        void loadReport(initialRange.current);
        return () => { revision.current += 1; };
    }, [loadReport]);

    const summary = rows.reduce((total, row) => ({
        earned: total.earned + Number(row.total_due || 0),
        paid: total.paid + Number(row.total_paid || 0),
        waived: total.waived + Number(row.total_waived || 0),
        batches: total.batches + Number(row.batch_count || 0),
    }), { earned: 0, paid: 0, waived: 0, batches: 0 });
    const chartData = rows.map(row => ({ ...row, total_due: Number(row.total_due), total_paid: Number(row.total_paid) }));
    const pages = Math.max(1, Math.ceil(rows.length / 20));
    const visiblePage = Math.min(page, pages);
    const reportQuery = new URLSearchParams({ ...applied, recipientType });
    const paymentWorkspace = recipientType === 'organization'
        ? `/commissions/organizations/commission-details/${recipientId}`
        : `/commissions/clinicians/commissions-information/${recipientId}`;

    return (
        <main className={`${ui.workspace} ${styles.workspace}`}>
            <header className={ui.header}>
                <div>
                    <Link className={ui.textButton} href={`/analytics/commissions?${reportQuery}`}><RiArrowLeftLine size={16} /> Commission analytics</Link>
                    <h1>{recipientName || `${recipientType === 'organization' ? 'Organization' : 'Clinician'} #${recipientId}`}</h1>
                    <p>{recipientType === 'organization' ? 'Organization' : 'Clinician'} commission activity</p>
                </div>
                <Link className={ui.primary} href={paymentWorkspace}>Manage recipient commissions</Link>
            </header>

            <form className={ui.panel} onSubmit={event => { event.preventDefault(); void loadReport(range); }}>
                <div className={styles.filters}>
                    <div className={ui.field}>
                        <label htmlFor="recipient-date-range">Date range</label>
                        <DateFilterReusable id="recipient-date-range" className={styles.dateFilter} label="Recipient commission date range" value={dateFilter} onChange={setDateFilter}
                            startDate={range.startDate} endDate={range.endDate} onDateRangeChange={(startDate, endDate) => setRange(current => ({ ...current, startDate, endDate }))} />
                    </div>
                    <div className={ui.field}>
                        <label htmlFor="recipient-period">Group by</label>
                        <select id="recipient-period" value={range.period} onChange={event => setRange(current => ({ ...current, period: event.target.value }))}>
                            <option value="daily">Day</option><option value="weekly">Week</option><option value="monthly">Month</option><option value="quarterly">Quarter</option><option value="yearly">Year</option>
                        </select>
                    </div>
                    <div className={ui.actions}><button className={ui.primary} type="submit" disabled={loading}><RiRefreshLine size={16} /> {loading ? 'Loading…' : 'Apply filters'}</button></div>
                </div>
            </form>

            {error && <div className={ui.error} role="alert">{error}<button type="button" className={ui.secondary} onClick={() => void loadReport(range)}>Retry</button></div>}
            {loading && <div className={ui.notice} role="status">Loading recipient analytics…</div>}
            {!loading && !error && <>
                <p className={ui.help}>Showing {dayjs(applied.startDate).format('D MMM YYYY')} – {dayjs(applied.endDate).format('D MMM YYYY')}. Earnings and payments use their recorded dates.</p>
                <section className={styles.recipientMetrics} aria-label="Recipient commission summary">
                    {[
                        ['Commission earned', currencyFormatter.format(summary.earned)],
                        ['Paid', currencyFormatter.format(summary.paid)],
                        ['Waived', currencyFormatter.format(summary.waived)],
                        ['Payment batches', summary.batches.toLocaleString()],
                    ].map(([label, value]) => <div className={ui.stat} key={label}><div><span>{label}</span><strong>{value}</strong></div></div>)}
                </section>

                <section className={ui.panel} aria-labelledby="recipient-periods-title">
                    <h2 id="recipient-periods-title">Activity by period</h2>
                    <div className={ui.tableWrap}><table className={ui.table}>
                        <thead><tr><th>Period</th><th className={styles.amount}>Earned</th><th className={styles.amount}>Paid</th><th className={styles.amount}>Waived</th><th className={styles.amount}>Payment batches</th><th className={styles.amount}>Average payment</th></tr></thead>
                        <tbody>{rows.slice((visiblePage - 1) * 20, visiblePage * 20).map(row => <tr key={row.period}><td>{row.period}</td><td className={styles.amount}>{currencyFormatter.format(Number(row.total_due))}</td><td className={styles.amount}>{currencyFormatter.format(Number(row.total_paid))}</td><td className={styles.amount}>{currencyFormatter.format(Number(row.total_waived))}</td><td className={styles.amount}>{row.batch_count}</td><td className={styles.amount}>{currencyFormatter.format(Number(row.average_paid || 0))}</td></tr>)}</tbody>
                    </table></div>
                    {!rows.length && <div className={ui.empty}><h3>No commission activity</h3><p>Choose a different date range to view this recipient’s activity.</p></div>}
                    <footer className={ui.footer}><span className={ui.help}>{rows.length} periods · Page {visiblePage} of {pages}</span><nav className={ui.actions} aria-label="Report pages"><button type="button" className={ui.secondary} disabled={visiblePage === 1} onClick={() => setPage(visiblePage - 1)}>Previous</button><button type="button" className={ui.secondary} disabled={visiblePage === pages} onClick={() => setPage(visiblePage + 1)}>Next</button></nav></footer>
                </section>

                {rows.length > 0 && <section className={ui.panel} aria-labelledby="recipient-trend-title">
                    <h2 id="recipient-trend-title">Earnings and payments over time</h2>
                    <div className={styles.chart}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 20, right: 12, left: 4, bottom: 0 }}>
                        <CartesianGrid stroke="var(--bs-border-color)" vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fill: 'var(--bs-secondary-color)', fontSize: 12 }} tickLine={false} />
                        <YAxis width={66} tick={{ fill: 'var(--bs-secondary-color)', fontSize: 12 }} tickFormatter={value => `GHS ${value}`} axisLine={false} tickLine={false} />
                        <Tooltip formatter={value => currencyFormatter.format(Number(value))} contentStyle={{ background: 'var(--theme-card-bg, var(--bs-body-bg))', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} />
                        <Legend /><Bar dataKey="total_due" name="Earned" fill="var(--bs-secondary-color)" radius={[3, 3, 0, 0]} /><Bar dataKey="total_paid" name="Paid" fill="var(--accounting-accent)" radius={[3, 3, 0, 0]} />
                    </BarChart></ResponsiveContainer></div>
                </section>}
            </>}
        </main>
    );
}
