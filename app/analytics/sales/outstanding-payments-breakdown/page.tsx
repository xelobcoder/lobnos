"use client";

import Link from 'next/link';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { RiArrowLeftLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './outstanding.module.css';

interface OutstandingResponse {
     allOutstandings: Array<{ total_outstanding: string | null }>;
     byPatient: Array<{
          patientid: number;
          patient_name: string;
          invoices: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byBillingOrTransaction: Array<{
          billingid: number;
          patientid: number;
          billing_status: string;
          billing_date: string;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byServiceCategory: Array<{
          serviceCategory: string;
          services: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byBranch: Array<{
          branchid: number;
          name: string;
          invoices: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byOrganization: Array<{
          organizationId: number;
          name: string;
          invoices: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byAgingRange: Array<{
          aging_bucket: string;
          services: number;
          total_outstanding: string;
     }>;
     reconciliation: Array<{
          billingid: number;
          billing_outstanding: string;
          services_outstanding: string;
          difference: string;
     }>;
     top20Debtors: Array<{
          patientid: number;
          total_outstanding: string;
          patient_name: string;
     }>;
}


type ReportView = 'byPatient' | 'byServiceCategory' | 'byAgingRange' | 'byBranch' | 'byOrganization' | 'byBillingOrTransaction' | 'reconciliation' | 'top20Debtors';
type Column = { key: string; label: string; format?: 'money' | 'date' };
const financialColumns: Column[] = [
    { key: 'total_billed', label: 'Billed', format: 'money' },
    { key: 'total_paid', label: 'Paid', format: 'money' },
    { key: 'total_outstanding', label: 'Outstanding', format: 'money' },
];
const reports: Record<ReportView, { label: string; columns: Column[] }> = {
    byPatient: { label: 'Patients', columns: [{ key: 'patient_name', label: 'Patient' }, { key: 'invoices', label: 'Bills' }, ...financialColumns] },
    byServiceCategory: { label: 'Service categories', columns: [{ key: 'serviceCategory', label: 'Category' }, { key: 'services', label: 'Services' }, ...financialColumns] },
    byAgingRange: { label: 'Aging', columns: [{ key: 'aging_bucket', label: 'Age of balance' }, { key: 'services', label: 'Services' }, financialColumns[2]] },
    byBranch: { label: 'Branches', columns: [{ key: 'name', label: 'Branch' }, { key: 'invoices', label: 'Bills' }, ...financialColumns] },
    byOrganization: { label: 'Organizations', columns: [{ key: 'name', label: 'Organization' }, { key: 'invoices', label: 'Bills' }, ...financialColumns] },
    byBillingOrTransaction: { label: 'Bills', columns: [{ key: 'billingid', label: 'Bill #' }, { key: 'billing_date', label: 'Service date', format: 'date' }, { key: 'billing_status', label: 'Status' }, ...financialColumns] },
    reconciliation: { label: 'Reconciliation', columns: [{ key: 'billingid', label: 'Bill #' }, { key: 'billing_outstanding', label: 'Bill balance', format: 'money' }, { key: 'services_outstanding', label: 'Service balance', format: 'money' }, { key: 'difference', label: 'Difference', format: 'money' }] },
    top20Debtors: { label: 'Top 20 debtors', columns: [{ key: 'patient_name', label: 'Patient' }, financialColumns[2]] },
};

export default function OutstandingPaymentsBreakDown() {
    const initial = { startDate: dayjs().startOf('month').format('YYYY-MM-DD'), endDate: dayjs().format('YYYY-MM-DD') };
    const [range, setRange] = useState(initial);
    const [applied, setApplied] = useState(initial);
    const [data, setData] = useState<OutstandingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState<ReportView>('byPatient');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [includeSettled, setIncludeSettled] = useState(false);
    const [updated, setUpdated] = useState('');
    const revision = useRef(0);
    const { user } = useApplicationSettings().applicationsettings || {};

    async function loadReport(next = range) {
        if (!user?.employeeid) return;
        if (!next.startDate || !next.endDate || next.startDate > next.endDate) {
            setError('Choose a start date on or before the end date.');
            return;
        }
        const request = ++revision.current;
        setLoading(true);
        setError('');
        try {
            const query = new URLSearchParams({ startdate: next.startDate, enddate: next.endDate, employeeid: String(user.employeeid) });
            const response = await customFetch('outstanding/report/combined?' + query);
            if (!response?.result || !Array.isArray(response.result.allOutstandings)) throw new Error(response?.message || 'Unable to load outstanding balances.');
            if (request !== revision.current) return;
            setData(response.result);
            setApplied(next);
            setPage(1);
            setUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (failure) {
            if (request === revision.current) setError(failure instanceof Error ? failure.message : 'Unable to load outstanding balances.');
        } finally {
            if (request === revision.current) setLoading(false);
        }
    }

    useEffect(() => {
        void loadReport(initial);
        return () => { revision.current++; };
    }, [user?.employeeid, user?.tenantid]);

    const definition = reports[view];
    const rows = ((data?.[view] || []) as unknown as Record<string, unknown>[]).filter(row => {
        if (!includeSettled && 'total_outstanding' in row && Number(row.total_outstanding) <= 0) return false;
        if (view === 'reconciliation' && Math.abs(Number(row.difference)) < 0.005) return false;
        return Object.values(row).some(value => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase()));
    });
    const lastPage = Math.max(1, Math.ceil(rows.length / 20));
    const currentPage = Math.min(page, lastPage);
    const visible = rows.slice((currentPage - 1) * 20, currentPage * 20);
    const balance = Number(data?.allOutstandings?.[0]?.total_outstanding || 0);
    const patients = data?.byPatient?.filter(row => Number(row.total_outstanding) > 0).length || 0;
    const overdue = data?.byAgingRange?.filter(row => row.aging_bucket.includes('>90')).reduce((sum, row) => sum + Number(row.total_outstanding || 0), 0) || 0;
    const differences = data?.reconciliation?.filter(row => Math.abs(Number(row.difference)) >= 0.005).length || 0;
    const dirty = range.startDate !== applied.startDate || range.endDate !== applied.endDate;

    return <div className={ui.workspace}>
        <header className={ui.header}>
            <div><span className={ui.eyebrow}>Analytics / Receivables</span><h1>Outstanding payments</h1><p>Find unpaid balances and the patients, bills and services behind them.</p></div>
            <Link href="/analytics/sales" className={ui.secondary}><RiArrowLeftLine size={18} aria-hidden="true"/>Sales analytics</Link>
        </header>
        <form className={ui.panel} onSubmit={event => { event.preventDefault(); void loadReport(); }}>
            <div className={styles.filters}>
                <div className={ui.field}><label htmlFor="outstanding-from">Services from</label><input id="outstanding-from" type="date" required value={range.startDate} onChange={event => setRange({ ...range, startDate: event.target.value })}/></div>
                <div className={ui.field}><label htmlFor="outstanding-to">Services to</label><input id="outstanding-to" type="date" required min={range.startDate} value={range.endDate} onChange={event => setRange({ ...range, endDate: event.target.value })}/></div>
                <button className={ui.primary} type="submit" disabled={loading}>{loading ? 'Loading...' : 'Apply dates'}</button>
                <button className={ui.secondary} type="button" disabled={loading} onClick={() => { const next = {startDate: dayjs().startOf('month').format('YYYY-MM-DD'), endDate: dayjs().format('YYYY-MM-DD')}; setRange(next); void loadReport(next); }}>This month</button>
            </div>
            <p className={styles.context}>Closed patient collection balances for services created in the selected period. Aging is measured today. NHIS and mixed bills are handled separately using accounting settlements. Legacy databases without closure infrastructure retain their existing records.</p>
            <Link href={`/accounting/nhis?${new URLSearchParams({from: applied.startDate, to: applied.endDate})}`} className={ui.secondary}>View NHIS receivables</Link>
            {dirty && <p className={ui.help}>Date changes are ready to apply. The report below uses the last applied dates.</p>}
        </form>
        {error && <div className={ui.error} role="alert"><span>{error}</span><button className={ui.secondary} onClick={() => void loadReport()}>Retry</button></div>}
        {loading ? <section className={ui.empty} role="status">Loading outstanding balances...</section> : !error && data && <>
            <div className={styles.metrics}>
                {[['Outstanding balance', currencyFormatter.format(balance)], ['Patients with a balance', patients.toLocaleString()], ['Over 90 days', currencyFormatter.format(overdue)], ['Balance differences', differences.toLocaleString()]].map(([label, value]) => <div className={ui.stat} key={label}><div><span>{label}</span><strong>{value}</strong></div></div>)}
            </div>
            <section className={ui.panel}>
                <div className={ui.sectionTitle}><div><h2>Balance breakdown</h2><p className={ui.help}>{dayjs(applied.startDate).format('D MMM YYYY')} – {dayjs(applied.endDate).format('D MMM YYYY')} · Updated {updated}</p></div><button className={ui.secondary} onClick={() => void loadReport(applied)} aria-label="Refresh applied report"><RiRefreshLine size={18} aria-hidden="true"/>Refresh</button></div>
                <nav className={styles.tabs} aria-label="Balance breakdown views">
                    {(Object.keys(reports) as ReportView[]).map(key => <button key={key} className={view === key ? styles.selectedTab : styles.tab} aria-current={view === key ? 'page' : undefined} onClick={() => {setView(key); setPage(1); setSearch('');}}>{reports[key].label}</button>)}
                </nav>
                <div className={styles.tableTools}>
                    <label className={styles.search}><RiSearchLine size={18} aria-hidden="true"/><input aria-label={'Search ' + definition.label.toLowerCase()} placeholder={'Search ' + definition.label.toLowerCase()} value={search} onChange={event => {setSearch(event.target.value); setPage(1);}}/></label>
                    {view !== 'reconciliation' && <label className={ui.check}><input type="checkbox" checked={includeSettled} onChange={event => {setIncludeSettled(event.target.checked); setPage(1);}}/>Include settled balances</label>}
                    <span className={ui.muted}>{rows.length} records</span>
                </div>
                {!rows.length ? <div className={ui.empty}><h3>{view === 'reconciliation' ? 'No balance differences found' : 'No matching balances'}</h3><p>{search ? 'Try another search or clear the search field.' : 'Choose another view or service period to explore balances.'}</p>{search && <button className={ui.secondary} onClick={() => setSearch('')}>Clear search</button>}</div> : <>
                    <div className={ui.tableWrap} tabIndex={0} role="region" aria-label={definition.label + ' balances'}>
                        <table className={ui.table}><caption className="visually-hidden">{definition.label} balances for the applied service period</caption><thead><tr>{definition.columns.map(column => <th key={column.key} scope="col" className={column.format === 'money' ? styles.amount : undefined}>{column.label}</th>)}{view === 'byServiceCategory' && <th scope="col">Details</th>}</tr></thead>
                            <tbody>{visible.map(row => <tr key={String(row.patientid ?? row.billingid ?? row.serviceCategory ?? row.aging_bucket ?? row.branchid ?? row.organizationId ?? row.name)}>{definition.columns.map(column => <td key={column.key} className={column.format === 'money' ? styles.amount : undefined}>{column.format === 'money' ? currencyFormatter.format(Number(row[column.key] || 0)) : column.format === 'date' ? dayjs(String(row[column.key])).format('D MMM YYYY') : String(row[column.key] ?? 'Not recorded')}</td>)}{view === 'byServiceCategory' && <td><Link className={ui.textButton} href={'/analytics/sales/outstanding-payments-breakdown/category-details?' + new URLSearchParams({category: String(row.serviceCategory), startdate: applied.startDate, enddate: applied.endDate})}>View services</Link></td>}</tr>)}</tbody>
                        </table>
                    </div>
                    <footer className={ui.footer}><span className={ui.muted}>Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, rows.length)} of {rows.length}</span><div className={ui.actions}><button className={ui.secondary} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {lastPage}</span><button className={ui.secondary} disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>Next</button></div></footer>
                </>}
            </section>
        </>}
    </div>;
}
