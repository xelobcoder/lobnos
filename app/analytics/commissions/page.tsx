"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { RiArrowLeftLine, RiRefreshLine } from '@remixicon/react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import ui from '../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './CommissionAnalytics.module.css';

type Amount = number | string;
type RecipientType = 'clinician' | 'organization';
interface ReportFilters {
    startDate: string;
    endDate: string;
    period: string;
    recipientType: RecipientType | 'all';
}
interface RecipientActivity {
    recipientId: number;
    recipientType: RecipientType;
    recipient_name: string;
    totalDue: Amount;
    totalPaid: Amount;
    paymentPercentage: Amount;
    paymentBatches: number;
}
interface Dashboard {
    summary: {
        totalDue: Amount;
        totalPaid: Amount;
        totalWaived: Amount;
        totalOutstanding: Amount;
        uniqueRecipients: number;
        batchCount: number;
    };
    byPeriod: { data: Array<{ period: string; total_due: Amount; total_paid: Amount }> };
    byStatus: Array<{ status: string; count: number; totalPaid: Amount }>;
    recipientEfficiency: RecipientActivity[];
}
const initialFilters = (): ReportFilters => ({
    startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    period: 'monthly',
    recipientType: 'all',
});

export default function CommissionAnalytics() {
    const [filters, setFilters] = useState(initialFilters);
    const [applied, setApplied] = useState(initialFilters);
    const [dateFilter, setDateFilter] = useState('Custom Range');
    const [data, setData] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const revision = useRef(0);

    const loadReport = useCallback(async (next: ReportFilters) => {
        const request = ++revision.current;
        setError('');
        if (!next.startDate || !next.endDate || next.startDate > next.endDate) {
            setError('Choose a start date on or before the end date.');
            setLoading(false);
            return;
        }
        setLoading(true);
        const params = new URLSearchParams({ startDate: next.startDate, endDate: next.endDate, period: next.period });
        if (next.recipientType !== 'all') params.set('recipientType', next.recipientType);
        try {
            const response = await customFetch(`commission/analytics/dashboard?${params}`);
            if (request !== revision.current) return;
            if (response.status !== 'success' || !response.result) throw new Error(response.message || 'Unable to load commission analytics.');
            setData(response.result);
            setApplied(next);
            setFilters(next);
            setPage(1);
        } catch (err) {
            if (request === revision.current) setError(err instanceof Error ? err.message : 'Unable to load commission analytics.');
        } finally {
            if (request === revision.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const next = initialFilters();
        next.startDate = query.get('startDate') || next.startDate;
        next.endDate = query.get('endDate') || next.endDate;
        const period = query.get('period');
        if (period && ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)) next.period = period;
        const recipientType = query.get('recipientType');
        if (recipientType === 'clinician' || recipientType === 'organization') next.recipientType = recipientType;
        let active = true;
        // Allow cleanup to cancel a superseded initial request before it starts.
        void Promise.resolve().then(() => { if (active) return loadReport(next); });
        return () => { active = false; revision.current += 1; };
    }, [loadReport]);

    const recipients = (data?.recipientEfficiency || []).filter(item => (item.recipient_name || '').toLowerCase().includes(search.trim().toLowerCase()));
    const pages = Math.max(1, Math.ceil(recipients.length / 20));
    const visiblePage = Math.min(page, pages);
    const trends = (data?.byPeriod.data || []).map(item => ({ ...item, total_due: Number(item.total_due), total_paid: Number(item.total_paid) }));
    const summary = data?.summary;
    const reset = () => {
        const next = initialFilters();
        setFilters(next);
        setDateFilter('Custom Range');
        setSearch('');
        void loadReport(next);
    };

    return (
        <main className={`${ui.workspace} ${styles.workspace}`}>
            <header className={ui.header}>
                <div>
                    <Link href="/analytics" className={ui.textButton}><RiArrowLeftLine size={16} /> Analytics</Link>
                    <h1>Commission analytics</h1>
                    <p>Track commission earnings, payments and balances by recipient.</p>
                </div>
                <Link href="/commissions" className={ui.primary}>Manage commissions</Link>
            </header>

            <form className={ui.panel} onSubmit={event => { event.preventDefault(); void loadReport(filters); }}>
                <div className={styles.filters}>
                    <div className={ui.field}>
                        <label htmlFor="commission-date-range">Date range</label>
                        <DateFilterReusable id="commission-date-range" className={styles.dateFilter} label="Commission date range" value={dateFilter}
                            onChange={setDateFilter} startDate={filters.startDate} endDate={filters.endDate} disabled={loading}
                            onDateRangeChange={(startDate, endDate) => setFilters(current => ({ ...current, startDate, endDate }))} />
                    </div>
                    <div className={ui.field}>
                        <label htmlFor="commission-period">Group by</label>
                        <select id="commission-period" value={filters.period} disabled={loading} onChange={event => setFilters(current => ({ ...current, period: event.target.value }))}>
                            <option value="daily">Day</option><option value="weekly">Week</option><option value="monthly">Month</option><option value="quarterly">Quarter</option><option value="yearly">Year</option>
                        </select>
                    </div>
                    <div className={ui.field}>
                        <label htmlFor="commission-recipient-type">Recipient type</label>
                        <select id="commission-recipient-type" value={filters.recipientType} disabled={loading} onChange={event => setFilters(current => ({ ...current, recipientType: event.target.value as ReportFilters['recipientType'] }))}>
                            <option value="all">All recipients</option><option value="clinician">Clinicians</option><option value="organization">Organizations</option>
                        </select>
                    </div>
                    <div className={ui.actions}>
                        <button type="submit" className={ui.primary} disabled={loading}><RiRefreshLine size={16} /> {loading ? 'Loading…' : 'Apply filters'}</button>
                        <button type="button" className={ui.secondary} onClick={reset} disabled={loading}>Reset</button>
                    </div>
                </div>
            </form>

            {error && <div role="alert" className={ui.error}>{error}<button type="button" className={ui.secondary} onClick={() => void loadReport(filters)}>Retry</button></div>}
            {loading && <div role="status" className={ui.notice}>Loading commission analytics…</div>}
            {!loading && !error && summary && <>
                <p className={ui.help}>Showing {dayjs(applied.startDate).format('D MMM YYYY')} – {dayjs(applied.endDate).format('D MMM YYYY')}. Earnings and payments use their recorded dates. Outstanding includes activity through the end date.</p>
                <section className={styles.metrics} aria-label="Commission summary">
                    {[
                        ['Commission earned', currencyFormatter.format(Number(summary.totalDue))],
                        ['Paid', currencyFormatter.format(Number(summary.totalPaid))],
                        ['Outstanding at end date', currencyFormatter.format(Number(summary.totalOutstanding))],
                        ['Waived', currencyFormatter.format(Number(summary.totalWaived))],
                        ['Recipients', Number(summary.uniqueRecipients).toLocaleString()],
                    ].map(([label, value]) => <div className={ui.stat} key={label}><div><span>{label}</span><strong>{value}</strong></div></div>)}
                </section>

                <section className={ui.panel} aria-labelledby="recipient-activity-title">
                    <div className={ui.sectionTitle}>
                        <div><h2 id="recipient-activity-title">Recipient activity</h2><p className={ui.help}>Commission belongs to the recipient saved in commission tracking.</p></div>
                        <div className={styles.search}><label className="visually-hidden" htmlFor="commission-recipient-search">Search recipients</label><input id="commission-recipient-search" type="search" placeholder="Search recipients" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></div>
                    </div>
                    <div className={ui.tableWrap}>
                        <table className={ui.table}>
                            <thead><tr><th>Recipient</th><th>Type</th><th className={styles.amount}>Earned</th><th className={styles.amount}>Paid</th><th className={styles.amount}>Payments / earnings</th><th className={styles.amount}>Payment batches</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                            <tbody>{recipients.slice((visiblePage - 1) * 20, visiblePage * 20).map(item => <tr key={`${item.recipientType}-${item.recipientId}`}>
                                <td>{item.recipient_name || `Recipient ${item.recipientId}`}</td>
                                <td><span className={ui.badge}>{item.recipientType === 'clinician' ? 'Clinician' : 'Organization'}</span></td>
                                <td className={styles.amount}>{currencyFormatter.format(Number(item.totalDue))}</td>
                                <td className={styles.amount}>{currencyFormatter.format(Number(item.totalPaid))}</td>
                                <td className={styles.amount}>{Number(item.paymentPercentage).toFixed(1)}%</td>
                                <td className={styles.amount}>{item.paymentBatches}</td>
                                <td><Link className={ui.textButton} href={`/analytics/commissions/recipient/${item.recipientId}?${new URLSearchParams({ startDate: applied.startDate, endDate: applied.endDate, period: applied.period, recipientType: item.recipientType })}`} aria-label={`View analytics for ${item.recipient_name}`}>View report</Link></td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                    {!recipients.length && <div className={ui.empty}><h3>{search ? 'No matching recipients' : 'No commission activity'}</h3><p>{search ? 'Try another recipient name.' : 'Choose a different date range or recipient type.'}</p></div>}
                    <footer className={ui.footer}>
                        <span className={ui.help}>{recipients.length} recipients · Page {visiblePage} of {pages}</span>
                        <nav aria-label="Recipient pages" className={ui.actions}><button type="button" className={ui.secondary} disabled={visiblePage === 1} onClick={() => setPage(visiblePage - 1)}>Previous</button><button type="button" className={ui.secondary} disabled={visiblePage === pages} onClick={() => setPage(visiblePage + 1)}>Next</button></nav>
                    </footer>
                </section>

                <div className={styles.charts}>
                    <section className={ui.panel} aria-labelledby="commission-trend-title">
                        <h2 id="commission-trend-title">Earnings and payments over time</h2>
                        {trends.length ? <div className={styles.chart}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends} margin={{ top: 20, right: 12, left: 4, bottom: 0 }}>
                                    <CartesianGrid stroke="var(--bs-border-color)" vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="period" tick={{ fill: 'var(--bs-secondary-color)', fontSize: 12 }} tickLine={false} />
                                    <YAxis width={66} tick={{ fill: 'var(--bs-secondary-color)', fontSize: 12 }} tickFormatter={value => `GHS ${value}`} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={value => currencyFormatter.format(Number(value))} contentStyle={{ background: 'var(--theme-card-bg, var(--bs-body-bg))', borderColor: 'var(--bs-border-color)', color: 'var(--bs-body-color)' }} />
                                    <Legend />
                                    <Bar dataKey="total_due" name="Earned" fill="var(--bs-secondary-color)" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="total_paid" name="Paid" fill="var(--accounting-accent)" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div> : <div className={ui.empty}>No activity in this date range.</div>}
                    </section>
                    <section className={ui.panel} aria-labelledby="commission-batches-title">
                        <h2 id="commission-batches-title">Payment batches</h2>
                        <div className={ui.tableWrap}><table className={ui.table}><thead><tr><th>Status</th><th className={styles.amount}>Batches</th><th className={styles.amount}>Paid</th></tr></thead>
                            <tbody>{(data?.byStatus || []).filter(item => Number(item.count) > 0).map(item => <tr key={item.status}><td><span className={`badge ${item.status === 'completed' ? 'text-bg-success' : item.status === 'cancelled' ? 'text-bg-danger' : 'text-bg-warning'}`}>{item.status}</span></td><td className={styles.amount}>{item.count}</td><td className={styles.amount}>{currencyFormatter.format(Number(item.totalPaid))}</td></tr>)}</tbody>
                        </table></div>
                        {!Number(summary.batchCount) && <p className={ui.help}>No payment batches in this date range.</p>}
                        <Link href="/commissions/commission-payments" className={ui.textButton}>View commission payments</Link>
                    </section>
                </div>
            </>}
        </main>
    );
}
