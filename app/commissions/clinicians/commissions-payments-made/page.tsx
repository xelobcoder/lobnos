"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { RiArrowLeftLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { currencyFormatter } from '../../../../components/Auth/customFetch';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import pageStyles from './payments.module.css';
import dayjs from "dayjs";
import { customFetch } from "../../../../components/Auth/customFetch";
import { ErrorState } from "../commissions-information/ClinicianUi";
import { BreakdownData, BreakdownModal, PaidCommissionData } from "../commissions-information/PaymentReport";


interface Recipient { id: number; name: string }

export default function PaidCommissionsPaymentMadePage() {
    const requestRevision = useRef(0);
    const [recipientKind, setRecipientKind] = useState('all');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [loadedPage, setLoadedPage] = useState(1);
    const [appliedSelection, setAppliedSelection] = useState({clinician: null as number | null, organization: null as number | null});
    const [startDate, setStartDate] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateFilter, setDateFilter] = useState("This Year");
    const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clinicians, setClinicians] = useState<Recipient[]>([]);
    const [organizations, setOrganizations] = useState<Recipient[]>([]);
    const [selectedClinician, setSelectedClinician] = useState<number | null>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);
    const [cliniciansLoading, setCliniciansLoading] = useState(false);
    const [organizationsLoading, setOrganizationsLoading] = useState(false);
    const [recipientError, setRecipientError] = useState<string | null>(null);
    const [selectedCommission, setSelectedCommission] = useState<PaidCommissionData | null>(null);
    const [breakdownData, setBreakdownData] = useState<BreakdownData[]>([]);
    const [breakdownLoading, setBreakdownLoading] = useState(true);
    const [breakdownError, setBreakdownError] = useState<string | null>(null);
    const [breakdownKey, setBreakdownKey] = useState(0);
    // Draft controls must not relabel a report until Load succeeds.
    const [appliedPeriod, setAppliedPeriod] = useState({ startDate, endDate });

    const loadData = useCallback(async (start: string, end: string, clinician: number | null, organization: number | null, page = 1) => {
        if (!start || !end || start > end) { setError("Choose a valid date range."); return; }
        const revision = ++requestRevision.current;
        setLoading(true);
        setError(null);
        try {
            let url = `commission-payments/commission/batch/information?&startDate=${dayjs(start).format("YYYY-MM-DD")}&endDate=${dayjs(end).format("YYYY-MM-DD")}&page=${page}&count=50`;
            if (clinician) url += `&recipient_id=${clinician}&recipient_type=clinician`;
            else if (organization) url += `&recipient_id=${organization}&recipient_type=organization`;
            const response = await customFetch(url);
            if (!(response?.success || response?.status === true || response?.status === "success") || !Array.isArray(response.data)) throw new Error("Unable to load commission payments.");
            if (revision !== requestRevision.current) return;
            setPaidCommissions(response.data);
            setLoadedPage(page);
            setAppliedSelection({clinician, organization});
            setAppliedPeriod({ startDate: start, endDate: end });
        } catch (err) {
            if (revision === requestRevision.current) setError(err instanceof Error ? err.message : "Unable to load commission payments.");
        } finally { if (revision === requestRevision.current) setLoading(false); }
    }, []);

    useEffect(() => {
        loadData(dayjs().startOf("year").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD"), null, null);
    }, [loadData]);

    const loadRecipients = async (kind: "clinician" | "organization") => {
        const setPending = kind === "clinician" ? setCliniciansLoading : setOrganizationsLoading;
        if (kind === "clinician" ? cliniciansLoading : organizationsLoading) return;
        setPending(true);
        setRecipientError(null);
        try {
            const response = await customFetch(kind === "clinician" ? "clinicians?count=100&page=1" : "organizations/details?count=100&page=1");
            if (!Array.isArray(response?.result)) throw new Error(`Unable to load ${kind} options.`);
            (kind === "clinician" ? setClinicians : setOrganizations)(Array.from(new Map<number, Recipient>(response.result.map((record: any) => { const id = Number(record.id ?? record.clinician_id ?? record.clinicianid); return [id, {id, name: record.name || `Recipient #${id}`}]; })).values()).filter(record => Number.isSafeInteger(record.id) && record.id > 0));
            if (!response.result.length) setRecipientError(`No ${kind} options were returned.`);
        } catch (err) {
            setRecipientError(err instanceof Error ? err.message : "Unable to load recipients.");
        } finally { setPending(false); }
    };

    useEffect(() => {
        if (!selectedCommission) return;
        let active = true;
        setBreakdownLoading(true);
        setBreakdownError(null);
        setBreakdownData([]);
        const { id, recipient_id, recipient_type, start_date, end_date } = selectedCommission;
        const url = `commission-payments/commission/batch/information/${id}/batch?startDate=${dayjs(start_date).format("YYYY-MM-DD")}&endDate=${dayjs(end_date).format("YYYY-MM-DD")}&recipient_id=${recipient_id}&recipient_type=${recipient_type}`;
        customFetch(url).then(response => {
            if (response?.status !== true || !Array.isArray(response.data)) throw new Error("Unable to load commission breakdown.");
            if (active) setBreakdownData(response.data);
        }).catch((err: Error) => { if (active) setBreakdownError(err.message); })
            .finally(() => { if (active) setBreakdownLoading(false); });
        return () => { active = false; };
    }, [selectedCommission, breakdownKey]);

    const options = recipientKind === 'clinician' ? clinicians : organizations;
    const pendingOptions = recipientKind === 'clinician' ? cliniciansLoading : organizationsLoading;
    const filtered = paidCommissions.filter(record => (status === 'all' || record.status === status) &&
        [record.batch_reference, record.recipient_name, record.recipient_type].some(value => String(value || '').toLowerCase().includes(search.trim().toLowerCase())));
    const total = (key: 'total_commission_amount' | 'payment_amount' | 'waived_amount') => paidCommissions.reduce((sum, row) => sum + Number(row[key] || 0), 0);
    const outstanding = paidCommissions.reduce((sum, row) => sum + Math.max(0, Number(row.total_commission_amount || 0) - Number(row.payment_amount || 0) - Number(row.waived_amount || 0)), 0);
    const dirty = (recipientKind !== 'all' && !selectedClinician && !selectedOrganization) || startDate !== appliedPeriod.startDate || endDate !== appliedPeriod.endDate || selectedClinician !== appliedSelection.clinician || selectedOrganization !== appliedSelection.organization;
    const formatDate = (value: string) => value && dayjs(value).isValid() ? dayjs(value).format('D MMM YYYY') : 'Not recorded';

    return <div className={`${ui.workspace} ${pageStyles.workspace}`} aria-busy={loading}>
        <header className={ui.header}><div><span className={ui.eyebrow}>Commissions / Payment history</span><h1>Commission payments</h1><p>Review recipient balances, payment batches and service allocations.</p></div><Link className={ui.secondary} href="/commissions/clinicians/commissions-information"><RiArrowLeftLine size={18} aria-hidden="true"/>Clinician commissions</Link></header>
        <form className={ui.panel} onSubmit={event => {event.preventDefault(); void loadData(startDate, endDate, selectedClinician, selectedOrganization);}}>
            <div className={pageStyles.filters}>
                <div className={ui.field}><label htmlFor="payments-from">From</label><input id="payments-from" type="date" required value={startDate} onChange={event => setStartDate(event.target.value)}/></div>
                <div className={ui.field}><label htmlFor="payments-to">To</label><input id="payments-to" type="date" required min={startDate} value={endDate} onChange={event => setEndDate(event.target.value)}/></div>
                <div className={ui.field}><label htmlFor="payment-recipient-type">Recipient type</label><select id="payment-recipient-type" value={recipientKind} onChange={event => {const kind = event.target.value; setRecipientKind(kind); setSelectedClinician(null); setSelectedOrganization(null); if (kind !== 'all') void loadRecipients(kind as 'clinician' | 'organization');}}><option value="all">All recipients</option><option value="clinician">Clinicians</option><option value="organization">Organizations</option></select></div>
                {recipientKind !== 'all' && <div className={ui.field}><label htmlFor="payment-recipient">{recipientKind === 'clinician' ? 'Clinician' : 'Organization'}</label><select id="payment-recipient" required disabled={pendingOptions} value={selectedClinician ?? selectedOrganization ?? ''} onChange={event => {const id = Number(event.target.value) || null; if (recipientKind === 'clinician') setSelectedClinician(id); else setSelectedOrganization(id);}}><option value="">{pendingOptions ? 'Loading recipients...' : 'Choose a recipient'}</option>{options.map(record => <option key={record.id} value={record.id}>{record.name}</option>)}</select></div>}
            </div>
            <div className={pageStyles.filterActions}><span className={ui.help}>{dirty ? 'Filter changes are ready to apply.' : 'Amounts below describe the loaded batches.'}</span><div className={ui.actions}><button type="button" className={ui.secondary} disabled={loading} onClick={() => { const start = dayjs().startOf('year').format('YYYY-MM-DD'), end = dayjs().format('YYYY-MM-DD'); setStartDate(start); setEndDate(end); setRecipientKind('all'); setSelectedClinician(null); setSelectedOrganization(null); void loadData(start,end,null,null); }}>This year</button><button type="submit" className={ui.primary} disabled={loading || (recipientKind !== 'all' && pendingOptions)}>{loading ? 'Loading...' : 'Apply filters'}</button></div></div>
            {recipientError && <div className={ui.error} role="alert"><span>{recipientError}</span><button type="button" className={ui.secondary} onClick={() => void loadRecipients(recipientKind as 'clinician' | 'organization')}>Retry recipients</button></div>}
        </form>
        {error && <ErrorState message={error} onRetry={() => loadData(startDate,endDate,selectedClinician,selectedOrganization)}/>}
        {loading ? <div className={ui.empty} role="status">Loading commission batches...</div> : !error && <>
            <div className={pageStyles.metrics}>{[['Commission in loaded batches',total('total_commission_amount')],['Paid',total('payment_amount')],['Waived',total('waived_amount')],['Remaining balance',outstanding]].map(([label,value]) => <div className={ui.stat} key={String(label)}><div><span>{label}</span><strong>{currencyFormatter.format(Number(value))}</strong></div></div>)}</div>
            <section className={ui.panel}>
                <div className={ui.sectionTitle}><div><h2>Payment batches</h2><p className={ui.help}>{formatDate(appliedPeriod.startDate)} – {formatDate(appliedPeriod.endDate)} · {appliedSelection.clinician || appliedSelection.organization ? (appliedSelection.clinician ? clinicians.find(row => row.id === appliedSelection.clinician)?.name : organizations.find(row => row.id === appliedSelection.organization)?.name) || paidCommissions[0]?.recipient_name || 'Selected recipient' : 'All recipients'} · Page {loadedPage}</p></div><div className={ui.actions}><button className={ui.secondary} type="button" onClick={() => window.print()}>Print loaded batches</button><button className={ui.secondary} onClick={() => void loadData(appliedPeriod.startDate,appliedPeriod.endDate,appliedSelection.clinician,appliedSelection.organization,loadedPage)}><RiRefreshLine size={18} aria-hidden="true"/>Refresh</button></div></div>
                <div className={pageStyles.tableTools}><label className={pageStyles.search}><RiSearchLine size={18} aria-hidden="true"/><input aria-label="Search loaded payment batches" placeholder="Search reference or recipient" value={search} onChange={event => setSearch(event.target.value)}/></label><label className={ui.field}>Status<select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></select></label><span className={ui.muted}>Search and status apply to this page.</span></div>
                {!filtered.length ? <div className={ui.empty}><h3>No matching payment batches</h3><p>{search || status !== 'all' ? 'Clear the search or choose another status.' : 'Choose another period or recipient.'}</p>{(search || status !== 'all') && <button className={ui.secondary} onClick={() => {setSearch(''); setStatus('all');}}>Clear table filters</button>}</div> : <div className={ui.tableWrap} role="region" aria-label="Commission payment batches" tabIndex={0}><table className={ui.table}><thead><tr><th scope="col">Batch / recipient</th><th scope="col">Service period</th><th scope="col" className={pageStyles.amount}>Commission</th><th scope="col" className={pageStyles.amount}>Paid / waived</th><th scope="col">Status</th><th scope="col">Details</th></tr></thead><tbody>{filtered.map(record => <tr key={record.id}><td><strong>{record.batch_reference}</strong><p>{record.recipient_name || 'Recipient #' + record.recipient_id}</p><small className={ui.muted}>{record.recipient_type}</small></td><td>{formatDate(record.start_date)}<p>to {formatDate(record.end_date)}</p></td><td className={pageStyles.amount}>{currencyFormatter.format(Number(record.total_commission_amount || 0))}</td><td className={pageStyles.amount}><strong>{currencyFormatter.format(Number(record.payment_amount || 0))}</strong><p>{currencyFormatter.format(Number(record.waived_amount || 0))} waived</p></td><td><span className={pageStyles.status}>{record.status}</span><p>{formatDate(record.payment_date)}</p></td><td><button className={ui.textButton} onClick={() => {setBreakdownLoading(true); setSelectedCommission(record);}}>View allocations</button></td></tr>)}</tbody></table></div>}
                <footer className={ui.footer}><span className={ui.muted}>{paidCommissions.length} loaded batches · up to 50 per page</span><div className={ui.actions}><button className={ui.secondary} disabled={loadedPage === 1} onClick={() => void loadData(appliedPeriod.startDate,appliedPeriod.endDate,appliedSelection.clinician,appliedSelection.organization,loadedPage - 1)}>Previous</button><span>Page {loadedPage}</span><button className={ui.secondary} disabled={paidCommissions.length < 50} onClick={() => void loadData(appliedPeriod.startDate,appliedPeriod.endDate,appliedSelection.clinician,appliedSelection.organization,loadedPage + 1)}>Next</button></div></footer>
            </section>
        </>}
        <BreakdownModal selected={selectedCommission} onHide={() => setSelectedCommission(null)} data={breakdownData} loading={breakdownLoading} error={breakdownError} onRetry={() => setBreakdownKey(key => key + 1)} />
    </div>;
}
