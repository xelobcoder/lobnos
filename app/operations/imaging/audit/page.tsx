"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { RiHistoryLine, RiFileListLine, RiRefreshLine } from '@remixicon/react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { customFetch } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../../components/isLoading';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../../components/Auth/roles';
import Authorization from '../../../../components/accessories/authorization';
import AnalyticSummaryCard from '../../../../components/Billing/AnalyticSummaryCard';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from '../../../../components/operations/ImagingReports.module.css';

interface AuditRow {
    id: number;
    ascensionid: number;
    entityType: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'FINALIZE';
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    employeeid: number | null;
    employeeName: string | null;
    createdAt: string;
}

type AuditCell = { row: { original: AuditRow } };

const PAGE_SIZE = 25;

const ACTION_VARIANTS: Record<AuditRow['action'], string> = {
    CREATE: 'success',
    UPDATE: 'primary',
    DELETE: 'danger',
    FINALIZE: 'warning',
};

function describeChange(row: AuditRow): string {
    if (row.action === 'CREATE') return `${row.fieldName} set to "${row.newValue ?? ''}"`;
    if (row.action === 'DELETE') return `${row.fieldName} "${row.oldValue ?? ''}" deleted`;
    if (row.action === 'FINALIZE') return `${row.fieldName} finalized: changed from "${row.oldValue ?? ''}" to "${row.newValue ?? ''}"`;
    return `${row.fieldName} changed from "${row.oldValue ?? ''}" to "${row.newValue ?? ''}"`;
}

const defaultStart = () => dayjs().subtract(30, 'day').format('YYYY-MM-DD');
const defaultEnd = () => dayjs().format('YYYY-MM-DD');

export default function ImagingAuditPage() {
    const { applicationsettings } = useApplicationSettings();
    const role = applicationsettings?.user?.role;
    const isAdmin = roleAllowed(role, ['admin']);

    const [ascensionid, setAscensionid] = useState('');
    const [userId, setUserId] = useState('');
    const [action, setAction] = useState('');
    const [startDate, setStartDate] = useState(defaultStart());
    const [endDate, setEndDate] = useState(defaultEnd());
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState<AuditRow[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAudit = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(page), count: String(PAGE_SIZE), startDate, endDate });
            if (ascensionid) params.set('ascensionid', ascensionid);
            if (userId) params.set('filterEmployeeid', userId);
            if (action) params.set('action', action);
            const response = await customFetch(`operations/imaging/audit?${params.toString()}`);
            if (!Array.isArray(response?.rows) || !Number.isFinite(Number(response?.total))) {
                throw new Error(response?.error || response?.message || 'Unable to load audit trail');
            }
            setRows(response.rows);
            setTotal(Number(response.total));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to load audit trail';
            setRows([]);
            setTotal(0);
            setError(message);
            toast.error(message, { position: 'top-right', autoClose: 2000 });
        } finally {
            setIsLoading(false);
        }
    }, [page, startDate, endDate, ascensionid, userId, action]);

    useEffect(() => {
        if (isAdmin) fetchAudit();
    }, [isAdmin, fetchAudit]);

    if (!role) return null;
    if (!isAdmin) return <Authorization />;

    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const onFilter = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setter(e.target.value);
        setPage(1);
    };

    const handleResetFilters = () => {
        setAscensionid('');
        setUserId('');
        setAction('');
        setStartDate(defaultStart());
        setEndDate(defaultEnd());
        setPage(1);
    };

    const columns = [
        { Header: 'When', accessor: 'createdAt', Cell: ({ row }: AuditCell) => <span className="text-nowrap">{dayjs(row.original.createdAt).format('DD MMM YYYY HH:mm')}</span> },
        { Header: 'Case', accessor: 'ascensionid' },
        { Header: 'User', accessor: 'employeeName', Cell: ({ row }: AuditCell) => row.original.employeeName || row.original.employeeid || '-' },
        { Header: 'Action', accessor: 'action', Cell: ({ row }: AuditCell) => <span className={`fw-semibold text-${ACTION_VARIANTS[row.original.action] || 'secondary'}`}>{row.original.action}</span> },
        { Header: 'Change', accessor: 'fieldName', Cell: ({ row }: AuditCell) => <span style={{ whiteSpace: 'pre-wrap' }}>{describeChange(row.original)}</span> },
    ];

    return (
        <div className={ui.workspace}>
            <header className={ui.header}>
                <div className={ui.heading}>
                    <RiHistoryLine size={24} className="text-success" aria-hidden="true" />
                    <div>
                        <span className={ui.eyebrow}>Imaging oversight</span>
                        <h1>Imaging Result Audit Trail</h1>
                        <p>Review who changed imaging results and when.</p>
                    </div>
                </div>
                <div className={ui.actions}>
                    <button type="button" className={ui.secondary} disabled={isLoading} onClick={fetchAudit}>
                        <RiRefreshLine size={18} aria-hidden="true" /> Refresh
                    </button>
                    <button type="button" className={ui.secondary} onClick={handleResetFilters}>Clear filters</button>
                </div>
            </header>

            {error && <div className={ui.error} role="alert">{error}<button type="button" className={ui.secondary} disabled={isLoading} onClick={fetchAudit}>Retry loading</button></div>}

            {!isLoading && !error && (
                <div className="row g-3">
                    <div className="col-12 col-sm-6">
                        <AnalyticSummaryCard title="Total entries" value={total.toLocaleString()} detail="Matching the selected filters" variant="primary" icon={<RiFileListLine size={22} />} />
                    </div>
                    <div className="col-12 col-sm-6">
                        <AnalyticSummaryCard title="Page" value={`${page} / ${pages}`} detail={`${PAGE_SIZE} entries per page`} variant="success" icon={<RiHistoryLine size={22} />} />
                    </div>
                </div>
            )}

            <section className={styles.filters} aria-label="Audit filters">
                <div className={ui.field}>
                    <label htmlFor="imaging-audit-case">Case ID</label>
                    <input id="imaging-audit-case" type="text" inputMode="numeric" placeholder="All cases" value={ascensionid} onChange={onFilter(setAscensionid)} />
                </div>
                <div className={ui.field}>
                    <label htmlFor="imaging-audit-employee">Employee ID</label>
                    <input id="imaging-audit-employee" type="text" inputMode="numeric" placeholder="All employees" value={userId} onChange={onFilter(setUserId)} />
                </div>
                <div className={ui.field}>
                    <label htmlFor="imaging-audit-action">Action</label>
                    <select id="imaging-audit-action" value={action} onChange={onFilter(setAction)}>
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="FINALIZE">Finalize</option>
                    </select>
                </div>
                <div className={ui.field}>
                    <label htmlFor="imaging-audit-start">Start date</label>
                    <input id="imaging-audit-start" type="date" value={startDate} max={endDate} onChange={onFilter(setStartDate)} />
                </div>
                <div className={ui.field}>
                    <label htmlFor="imaging-audit-end">End date</label>
                    <input id="imaging-audit-end" type="date" value={endDate} min={startDate} onChange={onFilter(setEndDate)} />
                </div>
            </section>

            <section className={styles.table} aria-label="Imaging audit records" aria-busy={isLoading}>
                {isLoading ? <Loader /> : !error && (
                    <>
                        <PrimeTable
                            column={columns}
                            data={rows}
                            filtering={false}
                            serverSideFiltering={false}
                            handleSeverSideProcessing={null}
                        />
                        <div className={ui.footer}>
                            <span className={ui.muted}>{total.toLocaleString()} total entries</span>
                            <div className={ui.pager}>
                                <button type="button" className={ui.secondary} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                                <span className="small">Page {page} of {pages}</span>
                                <button type="button" className={ui.secondary} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
