"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { RiHistoryLine, RiFileListLine, RiRefreshLine, RiArrowLeftRightLine } from '@remixicon/react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { customFetch } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import Loader from '../../../../components/isLoading';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../../components/Auth/roles';
import Authorization from '../../../../components/accessories/authorization';

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
        } catch (err: any) {
            setRows([]);
            setTotal(0);
            setError(err.message);
            toast.error(err.message || 'Error connecting to server', { position: 'top-right', autoClose: 2000 });
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
    const onFilter = (setter: (v: string) => void) => (e: React.ChangeEvent<any>) => {
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
        { Header: 'When', accessor: 'createdAt', Cell: ({ row }) => <span className="text-nowrap">{dayjs(row.original.createdAt).format('DD MMM YYYY HH:mm')}</span> },
        { Header: 'Case', accessor: 'ascensionid' },
        { Header: 'User', accessor: 'employeeName', Cell: ({ row }) => row.original.employeeName || row.original.employeeid || '-' },
        { Header: 'Action', accessor: 'action', Cell: ({ row }) => <Badge bg={ACTION_VARIANTS[row.original.action] || 'secondary'}>{row.original.action}</Badge> },
        { Header: 'Change', accessor: 'fieldName', Cell: ({ row }) => <span style={{ whiteSpace: 'pre-wrap' }}>{describeChange(row.original)}</span> },
    ];

    return (
        <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <RiHistoryLine className="me-2" />
                        Imaging Result Audit Trail
                    </h2>
                    <p className="text-muted mb-0">Review who changed imaging results and when</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <Form.Control type="text" size="sm" inputMode="numeric" placeholder="Case ID" className="border-0 bg-light w-auto" value={ascensionid} onChange={onFilter(setAscensionid)} />
                    <Form.Control type="text" size="sm" inputMode="numeric" placeholder="Employee ID" className="border-0 bg-light w-auto" value={userId} onChange={onFilter(setUserId)} />
                    <Form.Select size="sm" className="w-auto border-0 bg-light" value={action} onChange={onFilter(setAction)}>
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="FINALIZE">Finalize</option>
                    </Form.Select>
                    <Form.Control type="date" size="sm" className="border-0 bg-light" value={startDate} max={endDate} onChange={onFilter(setStartDate)} />
                    <RiArrowLeftRightLine size={16} className="text-muted mx-1" />
                    <Form.Control type="date" size="sm" className="border-0 bg-light" value={endDate} min={startDate} onChange={onFilter(setEndDate)} />
                    <Button variant="outline-secondary" size="sm" className="ms-2 border-0" onClick={fetchAudit}>
                        <RiRefreshLine size={18} />
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="ms-2 border-0" onClick={handleResetFilters}>
                        <RiRefreshLine size={16} className="me-1" /> Clear Filters
                    </Button>
                </div>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <Row className="g-3 mb-4">
                <Col md={4}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiFileListLine size={20} className="me-2 text-primary" />
                            <span className="fw-medium text-muted small">Total Entries</span>
                        </div>
                        <div className="fs-4 fw-bold text-primary">{total.toLocaleString()}</div>
                        <div className="small text-muted">Matching the selected filters</div>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="border rounded p-3 h-100 shadow-none">
                        <div className="d-flex align-items-center mb-2">
                            <RiHistoryLine size={20} className="me-2 text-success" />
                            <span className="fw-medium text-muted small">Page</span>
                        </div>
                        <div className="fs-4 fw-bold text-success">{page} / {pages}</div>
                        <div className="small text-muted">{PAGE_SIZE} entries per page</div>
                    </div>
                </Col>
            </Row>

            <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                {isLoading ? <Loader /> : (
                    <>
                        <PrimeTable
                            column={columns}
                            data={rows}
                            filtering={false}
                            serverSideFiltering={false}
                            handleSeverSideProcessing={null}
                        />
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="small text-muted">{total.toLocaleString()} total entries</span>
                            <div className="d-flex gap-2 align-items-center">
                                <Button variant="outline-secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                                <span className="small">Page {page} of {pages}</span>
                                <Button variant="outline-secondary" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
