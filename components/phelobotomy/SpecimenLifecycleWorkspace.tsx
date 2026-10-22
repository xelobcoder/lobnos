'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Barcode from 'react-barcode';
import { Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { RiArchiveLine, RiRefreshLine, RiSearchLine } from '@remixicon/react';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import {
    actionTitles, availableLifecycleActions, emptyLifecycleForm, freeStoragePositions,
    hasUnexpiredRetention, lifecycleMutation, readableEventMetadata, requestIdempotencyKey, storageLabel,
    LifecycleAction, LifecycleForm, Specimen, SpecimenLifecycleDetail, StoragePosition,
} from '../../lib/specimenLifecycle';

type Worklist = { items: Specimen[]; pagination: { page: number; count: number; total: number; totalPages: number } };
const emptyWorklist = (): Worklist => ({ items: [], pagination: { page: 1, count: 25, total: 0, totalPages: 0 } });
const formatDate = (value?: string | null) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString() : 'Not set';
const words = (value?: string | null) => String(value || 'available').replace(/_/g, ' ');

function StorageStatus({ sample }: { sample: Specimen }) {
    const state = sample.storage_state || 'available';
    const color = state === 'disposed' ? 'secondary' : state === 'stored' ? 'success' : state === 'retrieved' ? 'warning' : 'primary';
    return <span className={`badge text-bg-${color} text-capitalize`}>{words(state)}</span>;
}

function Retention({ sample }: { sample: Specimen }) {
    const due = sample.storage_state !== 'disposed' && sample.retention_until && !hasUnexpiredRetention(sample);
    return <><span>{formatDate(sample.retention_until)}</span>{due ? <div><span className="badge text-bg-warning">Due for review</span></div> : null}</>;
}

function printLabel(sample: Specimen) {
    const label = document.getElementById(`specimen-label-${sample.id}`);
    const printWindow = window.open('', '_blank', 'width=560,height=420');
    if (!printWindow || !label) return toast.error('Allow the label print window to open, then try again.');
    printWindow.document.title = `Specimen ${sample.sample_uid}`;
    const style = printWindow.document.createElement('style');
    style.textContent = 'body{font-family:Arial,sans-serif;text-align:center;padding:16px}p{margin:4px 0;font-size:12px}svg{max-width:100%}';
    printWindow.document.head.appendChild(style);
    printWindow.document.body.appendChild(printWindow.document.importNode(label, true));
    printWindow.focus();
    printWindow.print();
}

export default function SpecimenLifecycleWorkspace({ initialSampleId, initialAction }: { initialSampleId?: number; initialAction?: 'store' }) {
    const { applicationsettings } = useApplicationSettings();
    const user = applicationsettings?.user;
    const role = String(user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    const canConfigure = ['admin', 'manager', 'superadmin'].includes(role);
    const canHandleStorage = ['admin', 'manager', 'superadmin', 'scientist', 'phelobotomist', 'phlebotomist'].includes(role);
    const [worklist, setWorklist] = useState<Worklist>(emptyWorklist);
    const [positions, setPositions] = useState<StoragePosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [positionsError, setPositionsError] = useState('');
    const [positionsLoading, setPositionsLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [state, setState] = useState('');
    const [retention, setRetention] = useState('');
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(25);
    const [detail, setDetail] = useState<SpecimenLifecycleDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [historyView, setHistoryView] = useState<'list' | 'table'>('list');
    const [selectedId, setSelectedId] = useState<number | null>(initialSampleId || null);
    const [detailError, setDetailError] = useState('');
    const [action, setAction] = useState<LifecycleAction | null>(null);
    const [form, setForm] = useState<LifecycleForm>(emptyLifecycleForm);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState('');
    const [showLocations, setShowLocations] = useState(false);
    const keys = useRef(new Map<string, string>());
    const listRequest = useRef(0);
    const detailRequest = useRef(0);

    const loadWorklist = useCallback(async () => {
        const request = ++listRequest.current;
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ search, state, retention, page: String(page), count: String(count) });
            const response = await customFetch(`physical-samples/lifecycle/worklist?${params.toString()}`);
            if (!response?.success) throw new Error(response?.message || 'Unable to load specimens.');
            if (request === listRequest.current) setWorklist(response.data || emptyWorklist());
        } catch (failure: any) {
            if (request === listRequest.current) { setError(failure?.message || 'Unable to load specimens.'); setWorklist(emptyWorklist()); }
        } finally { if (request === listRequest.current) setLoading(false); }
    }, [search, state, retention, page, count]);

    const loadPositions = useCallback(async () => {
        setPositionsLoading(true);
        try {
            const response = await customFetch('physical-samples/storage/positions');
            if (!response?.success) throw new Error(response?.message || 'Unable to load storage positions.');
            setPositions(response.data || []);
            setPositionsError('');
        } catch (failure: any) { setPositions([]); setPositionsError(failure?.message || 'Unable to load storage positions.'); }
        finally { setPositionsLoading(false); }
    }, []);

    const openSpecimen = useCallback(async (id: number, requestedAction?: LifecycleAction) => {
        const request = ++detailRequest.current;
        setSelectedId(id);
        setDetail(null);
        setDetailError('');
        setDetailLoading(true);
        setAction(null);
        setActionError('');
        setForm(emptyLifecycleForm());
        try {
            const response = await customFetch(`physical-samples/${id}/lifecycle`);
            if (!response?.success) throw new Error(response?.message || 'Unable to load specimen history.');
            if (request === detailRequest.current) {
                setDetail(response.data);
                if (requestedAction && availableLifecycleActions(response.data).includes(requestedAction)) setAction(requestedAction);
            }
        } catch (failure: any) {
            if (request === detailRequest.current) setDetailError(failure?.message || 'Unable to load specimen history.');
        } finally { if (request === detailRequest.current) setDetailLoading(false); }
    }, []);

    useEffect(() => { void loadWorklist(); }, [loadWorklist]);
    useEffect(() => { void loadPositions(); }, [loadPositions]);
    useEffect(() => { if (initialSampleId) void openSpecimen(initialSampleId, initialAction); }, [initialSampleId, initialAction, openSpecimen]);

    const refresh = () => { void loadWorklist(); void loadPositions(); };
    const chooseAction = (next: LifecycleAction) => { setAction(next); setForm(emptyLifecycleForm()); setActionError(''); };
    const patch = <K extends keyof LifecycleForm>(key: K, value: LifecycleForm[K]) => setForm(current => ({ ...current, [key]: value }));

    const submitAction = async (event: FormEvent) => {
        event.preventDefault();
        if (!detail || !action || busy) return;
        setActionError('');
        setBusy(true);
        try {
            const request = lifecycleMutation(detail, action, form, Number(user?.employeeid));
            const fingerprint = JSON.stringify(request);
            const idempotencyKey = requestIdempotencyKey(keys.current, fingerprint, () => crypto.randomUUID());
            const response = await customFetchMutation(request.endpoint, request.method, { ...request.body, idempotencyKey });
            if (!response?.success) throw new Error(response?.message || 'Unable to update the specimen.');
            keys.current.delete(fingerprint);
            setDetail(response.data);
            setAction(null);
            setForm(emptyLifecycleForm());
            toast.success('Specimen record updated.');
            refresh();
        } catch (failure: any) { setActionError(failure?.message || 'Unable to update the specimen.'); }
        finally { setBusy(false); }
    };

    const closeDetail = () => {
        if (busy) return;
        ++detailRequest.current;
        setSelectedId(null);
        setDetail(null);
        setDetailLoading(false);
        setAction(null);
    };
    const availablePositions = freeStoragePositions(positions);
    const activeActions = detail ? availableLifecycleActions(detail) : [];
    const earlyDisposal = detail ? hasUnexpiredRetention(detail.sample) : false;
    const positionCreated = (position: StoragePosition) => {
        setPositions(current => current.some(existing => existing.id === position.id) ? current : [...current, position]);
        if (selectedId !== null && action === 'store') {
            patch('positionId', String(position.id));
            setShowLocations(false);
        }
    };

    return <div className="container-fluid px-3 py-3">
        <div className="border rounded-3 bg-body p-3 mb-3 d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div className="d-flex align-items-start gap-3"><div className="bg-primary text-white rounded-3 p-2"><RiArchiveLine size={28} /></div><div><h1 className="h4 fw-bold mb-1">Specimen Storage &amp; Retention</h1><p className="text-muted mb-1">Track aliquots, storage positions, retrievals, retention and witnessed disposal.</p><Link href="/operations/phelobotomy/sample-summary" className="small">Back to sample summary</Link></div></div>
            <div className="d-flex gap-2"><button type="button" className="btn btn-outline-secondary" onClick={() => setShowLocations(true)}>Storage positions</button><button type="button" className="btn btn-primary" onClick={refresh} disabled={loading}><RiRefreshLine size={18} className="me-1" />Refresh</button></div>
        </div>

        <div className="border rounded-3 bg-body p-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3" aria-live="polite">
            <div><h2 className="h6 mb-1">Sample storage options</h2>{positionsLoading ? <p className="small text-muted mb-0">Loading storage positions...</p> : positionsError ? <p className="small text-warning mb-0">Storage availability could not be loaded. Retry the lookup below.</p> : <><p className="small mb-1"><strong>{availablePositions.length} available storage positions</strong> out of {positions.length} configured.</p><p className="small text-muted mb-0">{positions.length === 0 ? canConfigure ? 'Add the freezer, rack and position labels used in your laboratory, then select Store sample for a collected, received or accepted container.' : 'No storage positions have been configured. Ask an administrator or manager to add the laboratory\u2019s freezer, rack and position labels.' : availablePositions.length === 0 ? 'All active positions are occupied. Retrieve a stored sample or ask an administrator or manager to add another position.' : 'Select Store sample beside a collected, received or accepted container to choose its freezer, rack and position.'}</p></>}</div>
            {canConfigure && <button type="button" className="btn btn-primary" onClick={() => setShowLocations(true)}>Add storage position</button>}
        </div>

        {error && <div role="alert" className="alert alert-danger">{error}</div>}
        {positionsError && <div role="alert" className="alert alert-warning">{positionsError} <button type="button" className="btn btn-sm btn-outline-dark ms-2" onClick={loadPositions}>Retry storage lookup</button></div>}
        <div className="border rounded-3 bg-body">
            <div className="p-3 border-bottom"><form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); setPage(1); }} className="row g-3 align-items-end">
                <div className="col-lg-5"><label className="form-label small fw-semibold" htmlFor="specimen-search">Find a specimen</label><div className="input-group"><input id="specimen-search" className="form-control" placeholder="Barcode, sample ID, patient or billing ID" value={searchInput} onChange={event => setSearchInput(event.target.value)} /><button type="submit" className="btn btn-outline-primary" aria-label="Search specimens"><RiSearchLine size={18} /></button></div></div>
                <div className="col-sm-6 col-lg-3"><label className="form-label small fw-semibold" htmlFor="specimen-state">Storage state</label><select id="specimen-state" className="form-select" value={state} onChange={event => { setState(event.target.value); setPage(1); }}><option value="">All states</option>{['available', 'stored', 'retrieved', 'disposed'].map(value => <option key={value} value={value}>{words(value)}</option>)}</select></div>
                <div className="col-sm-6 col-lg-4"><label className="form-label small fw-semibold" htmlFor="specimen-retention-filter">Retention</label><select id="specimen-retention-filter" className="form-select" value={retention} onChange={event => { setRetention(event.target.value); setPage(1); }}><option value="">All retention dates</option><option value="due">Retention expired — review for disposal</option></select></div>
            </form><p className="small text-muted mb-0 mt-3">Accepted and rejected specimens, including aliquots. Expired retention creates a review list; disposal is always recorded by a staff member.</p></div>
            <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Specimen / aliquot</th><th>Patient / billing</th><th>Quantity remaining</th><th>State / position</th><th>Retain until</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
                {loading ? <tr><td colSpan={6} className="text-center py-5"><Spinner animation="border" role="status" /><span className="visually-hidden">Loading specimens</span></td></tr> : worklist.items.length ? worklist.items.map(sample => <tr key={sample.id}>
                    <td><strong>{sample.barcode || sample.sample_uid}</strong><div className="small text-muted">{sample.sample_type_name || 'Specimen'} / {sample.container_type_name || 'Container'}</div>{sample.parent_sample_id ? <div className="small">Aliquot of {sample.parent_barcode || `sample ${sample.parent_sample_id}`}</div> : Number(sample.aliquot_count) > 0 ? <div className="small">{sample.aliquot_count} aliquot(s)</div> : null}<div className="small text-capitalize text-muted">{words(sample.status)}</div></td>
                    <td>{sample.patient_name || 'Patient record'}<div className="small text-muted">{sample.fullpatientid || ''}{sample.billingid ? ` · Billing ${sample.billingid}` : ''}</div></td>
                    <td>{sample.remaining_quantity ?? 'Not recorded'} {sample.unit || ''}</td>
                    <td><StorageStatus sample={sample} />{sample.freezer ? <div className="small mt-1">{storageLabel({ freezer: sample.freezer, rack: sample.rack || '', position: sample.position || '' })}</div> : null}</td>
                    <td className="small"><Retention sample={sample} /></td><td><div className="d-flex flex-wrap gap-2">{canHandleStorage && ['collected', 'received', 'accepted'].includes(sample.status) && sample.storage_state !== 'disposed' && <button type="button" className="btn btn-sm btn-primary text-nowrap" onClick={() => openSpecimen(sample.id, 'store')}>{sample.storage_state === 'stored' ? 'Move sample' : sample.storage_state === 'retrieved' ? 'Return to storage' : 'Store sample'}</button>}<button type="button" className="btn btn-sm btn-outline-primary text-nowrap" onClick={() => openSpecimen(sample.id)}>Manage / history</button></div></td>
                </tr>) : <tr><td colSpan={6} className="text-center text-muted py-5">No specimens match these filters.</td></tr>}
            </tbody></table></div>
            <div className="p-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2"><div className="d-flex align-items-center gap-2"><label htmlFor="specimen-count" className="small text-muted">Rows</label><select id="specimen-count" className="form-select form-select-sm" style={{ width: 80 }} value={count} onChange={event => { setCount(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select><span className="small text-muted">{worklist.pagination.total.toLocaleString()} total</span></div><div className="d-flex align-items-center gap-2"><button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))}>Previous</button><span className="small">Page {worklist.pagination.page} of {Math.max(1, worklist.pagination.totalPages)}</span><button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || page >= worklist.pagination.totalPages} onClick={() => setPage(current => current + 1)}>Next</button></div></div>
        </div>

        <Modal show={selectedId !== null && !showLocations} onHide={closeDetail} size="xl" animation={false} backdrop="static" keyboard={!busy} dialogClassName="mt-3">
            <Modal.Header closeButton={!busy}><Modal.Title className="h5">Specimen lifecycle</Modal.Title></Modal.Header>
            <Modal.Body>{detailLoading ? <div className="text-center py-5"><Spinner animation="border" role="status" /><p className="mt-2">Loading specimen...</p></div> : detailError ? <div role="alert" className="alert alert-danger">{detailError}<button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => selectedId && openSpecimen(selectedId)}>Retry</button></div> : detail && <>
                <div className="row g-3 mb-4"><div className="col-lg-8"><h2 className="h5">{detail.sample.sample_uid} <StorageStatus sample={detail.sample} /></h2><div className="text-muted">{detail.sample.sample_type_name || 'Specimen'} / {detail.sample.container_type_name || 'Container'} · {words(detail.sample.status)}</div><dl className="row mt-3 mb-0"><dt className="col-sm-4">Remaining quantity</dt><dd className="col-sm-8">{detail.sample.remaining_quantity ?? 'Not recorded'} {detail.sample.unit || ''}</dd><dt className="col-sm-4">Storage position</dt><dd className="col-sm-8">{storageLabel(detail.storagePosition)}</dd><dt className="col-sm-4">Retention deadline</dt><dd className="col-sm-8"><Retention sample={detail.sample} /></dd>{detail.parent && <><dt className="col-sm-4">Parent specimen</dt><dd className="col-sm-8"><button type="button" className="btn btn-sm btn-link p-0" disabled={busy} onClick={() => openSpecimen(detail.parent!.id)}>{detail.parent.barcode || detail.parent.sample_uid}</button></dd></>}</dl></div><div className="col-lg-4"><div id={`specimen-label-${detail.sample.id}`} className="bg-white text-dark border rounded text-center p-2"><Barcode value={detail.sample.barcode || detail.sample.sample_uid} width={1.3} height={40} fontSize={11} margin={4} /><p className="mb-0 small">{detail.sample.sample_type_name || 'Specimen'} / {detail.sample.container_type_name || 'Container'}</p>{detail.parent && <p className="mb-0 small">Aliquot of {detail.parent.barcode || detail.parent.sample_uid}</p>}</div><button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={() => printLabel(detail.sample)}>Print barcode label</button></div></div>

                {detail.sample.storage_state === 'disposed' ? <div className="alert alert-secondary">This specimen has been disposed of. Its record and history remain available.</div> : activeActions.length ? <div className="d-flex flex-wrap gap-2 mb-3">{activeActions.map(value => <button type="button" key={value} disabled={busy} className={`btn ${action === value ? value === 'dispose' ? 'btn-danger' : 'btn-primary' : value === 'dispose' ? 'btn-outline-danger' : 'btn-outline-primary'}`} onClick={() => chooseAction(value)}>{actionTitles[value]}</button>)}</div> : <div className="alert alert-info">Your role or the current specimen status does not allow changes.</div>}

                {action && activeActions.includes(action) && <form onSubmit={submitAction} className={`border rounded-3 p-3 mb-4 ${action === 'dispose' ? 'border-danger' : ''}`}><h3 className="h6">{actionTitles[action]}</h3>{actionError && <div role="alert" className="alert alert-danger">{actionError} <button type="button" className="btn btn-sm btn-outline-danger ms-2" disabled={busy} onClick={() => openSpecimen(detail.sample.id)}>Refresh specimen</button></div>}
                    <fieldset disabled={busy}>
                        {action === 'aliquot' && <><p className="small text-muted">A separate barcode is assigned to the aliquot. Its quantity is deducted from the parent, and its retention deadline is inherited.</p><div className="row g-3"><div className="col-sm-4"><label className="form-label" htmlFor="aliquot-quantity">Aliquot quantity ({detail.sample.unit || 'parent unit'})</label><input id="aliquot-quantity" className="form-control" type="number" min="0.01" step="0.01" max={detail.sample.remaining_quantity ?? undefined} required value={form.quantity} onChange={event => patch('quantity', event.target.value)} /></div><div className="col-sm-8"><label className="form-label" htmlFor="aliquot-notes">Notes (optional)</label><input id="aliquot-notes" className="form-control" maxLength={1000} value={form.notes} onChange={event => patch('notes', event.target.value)} /></div></div></>}
                        {action === 'store' && <>
                            <label className="form-label" htmlFor="specimen-position">Freezer / rack / position</label>
                            {positionsError && <div role="alert" className="alert alert-warning">{positionsError}</div>}
                            <select id="specimen-position" className="form-select" required disabled={positionsLoading || availablePositions.length === 0} value={form.positionId} onChange={event => patch('positionId', event.target.value)}><option value="">{positionsLoading ? 'Loading storage positions...' : availablePositions.length ? 'Choose an available position' : 'No available storage positions'}</option>{availablePositions.map(position => <option key={position.id} value={position.id}>{storageLabel(position)}{position.temperature_c != null ? ` (${position.temperature_c} °C)` : ''}</option>)}</select>
                            <p className={`small mt-2 mb-0 ${!positionsLoading && !positionsError && availablePositions.length === 0 ? 'text-warning' : 'text-muted'}`}>{positionsLoading ? 'Checking available positions.' : positionsError ? 'Retry the lookup to load available storage options.' : availablePositions.length ? `${availablePositions.length} positions available. Choose the physical location for this container.` : positions.length === 0 ? canConfigure ? 'No storage positions configured yet. Add your freezer, rack and position below to continue.' : 'No storage positions configured yet. Ask an administrator or manager to add your laboratory\u2019s storage locations.' : canConfigure ? 'No free positions. Add another position or retrieve an occupied container.' : 'No free positions. Ask an administrator or manager to add another storage position.'}</p>
                            <div className="d-flex flex-wrap gap-3 mt-3">{canConfigure && <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowLocations(true)}>Add storage position</button>}<button type="button" className="btn btn-sm btn-outline-secondary" disabled={positionsLoading} onClick={loadPositions}>Refresh available positions</button></div>
                        </>}
                        {action === 'retention' && <><div className="row g-3"><div className="col-sm-4"><label className="form-label" htmlFor="retention-mode">Retention deadline</label><select id="retention-mode" className="form-select" value={form.retentionMode} onChange={event => patch('retentionMode', event.target.value as 'days' | 'date')}><option value="days">Days from now</option><option value="date">Specific date and time</option></select></div><div className="col-sm-8">{form.retentionMode === 'days' ? <><label className="form-label" htmlFor="retention-days">Retention period in days</label><input id="retention-days" className="form-control" type="number" min={1} max={36500} step={1} required value={form.retentionDays} onChange={event => patch('retentionDays', event.target.value)} /></> : <><label className="form-label" htmlFor="retention-date">Retain until (your local time)</label><input id="retention-date" className="form-control" type="datetime-local" required value={form.retentionUntil} onChange={event => patch('retentionUntil', event.target.value)} /></>}</div></div><p className="small text-muted mt-2">Set or extend retention for this container. Only administrators and managers can shorten an existing period, with a recorded reason. Set each existing aliquot&apos;s retention separately.</p></>}
                        {action === 'dispose' && <><div className="alert alert-warning py-2">Record disposal after it has been performed. This action is permanent; use the laboratory&apos;s approved disposal procedure.</div>{earlyDisposal && <div className="alert alert-danger py-2">Retention continues until {formatDate(detail.sample.retention_until)}.{detail.capabilities.canOverrideRetention ? <label className="d-flex gap-2 mt-2"><input className="form-check-input flex-shrink-0" type="checkbox" checked={form.overrideRetention} onChange={event => patch('overrideRetention', event.target.checked)} /><span>I authorize early disposal. The reason below explains this exception.</span></label> : <div>An administrator or manager must authorize early disposal.</div>}</div>}<div className="row g-3"><div className="col-sm-7"><label className="form-label" htmlFor="disposal-method">Disposal method</label><input id="disposal-method" className="form-control" maxLength={120} required value={form.method} onChange={event => patch('method', event.target.value)} placeholder="For example, approved clinical waste treatment" /></div><div className="col-sm-5"><label className="form-label" htmlFor="disposal-witness">Witness staff ID</label><input id="disposal-witness" className="form-control" type="number" min={1} step={1} required value={form.witnessEmployeeId} onChange={event => patch('witnessEmployeeId', event.target.value)} /><p className="small text-muted mt-1 mb-0">A different active scientist, administrator or manager. Their identity is checked by the server.</p></div></div></>}
                        {['retrieve', 'retention', 'dispose'].includes(action) && <div className="mt-3"><label className="form-label" htmlFor="lifecycle-reason">{action === 'retrieve' ? 'Retrieval reason / intended use' : action === 'dispose' ? 'Disposal reason / exception justification' : 'Reason for changing retention'}</label><textarea id="lifecycle-reason" className="form-control" rows={2} maxLength={2000} required value={form.reason} onChange={event => patch('reason', event.target.value)} /></div>}
                        {action === 'dispose' && <div className="mt-3"><label className="d-flex align-items-start gap-2 mb-2"><input className="form-check-input flex-shrink-0" type="checkbox" required checked={form.witnessed} onChange={event => patch('witnessed', event.target.checked)} /><span>I attest that the named staff member witnessed this disposal.</span></label><label className="d-flex align-items-start gap-2"><input className="form-check-input flex-shrink-0" type="checkbox" required checked={form.confirmDisposal} onChange={event => patch('confirmDisposal', event.target.checked)} /><span>I confirm this specimen has been disposed of and will no longer be available.</span></label></div>}
                        <div className="d-flex gap-2 mt-3"><button type="submit" className={`btn ${action === 'dispose' ? 'btn-danger' : 'btn-primary'}`} disabled={action === 'store' && availablePositions.length === 0 || action === 'dispose' && earlyDisposal && !detail.capabilities.canOverrideRetention}>{busy ? 'Saving...' : action === 'dispose' ? 'Confirm documented disposal' : 'Save'}</button><button type="button" className="btn btn-outline-secondary" onClick={() => setAction(null)}>Cancel</button></div>
                    </fieldset>
                </form>}

                <h3 className="h6 mt-4">Aliquots ({detail.aliquots?.length || 0})</h3>{detail.aliquots?.length ? <div className="table-responsive mb-4"><table className="table table-sm align-middle"><thead><tr><th>Barcode</th><th>Quantity remaining</th><th>State</th><th>Retention</th><th></th></tr></thead><tbody>{detail.aliquots.map(child => <tr key={child.id}><td>{child.barcode || child.sample_uid}</td><td>{child.remaining_quantity ?? child.quantity ?? 'Not recorded'} {child.unit || ''}</td><td><StorageStatus sample={child} /></td><td className="small"><Retention sample={child} /></td><td><button type="button" className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => openSpecimen(child.id)}>Open aliquot</button></td></tr>)}</tbody></table></div> : <p className="small text-muted">No aliquots created from this specimen.</p>}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <h3 className="h6 mb-0" id="specimen-history-heading">History and disposal record</h3>
                    <div className="btn-group btn-group-sm" role="group" aria-label="History view">
                        <button type="button" className={`btn ${historyView === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={historyView === 'list'} onClick={() => setHistoryView('list')}>List</button>
                        <button type="button" className={`btn ${historyView === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={historyView === 'table'} onClick={() => setHistoryView('table')}>Table</button>
                    </div>
                </div>
                {detail.events?.length ? historyView === 'table' ? <div className="table-responsive">
                    <table className="table table-sm table-bordered align-top mb-0" aria-labelledby="specimen-history-heading">
                        <thead className="table-light"><tr><th scope="col">Event</th><th scope="col">Date and time</th><th scope="col">Staff member</th><th scope="col">Reason</th><th scope="col">Details</th></tr></thead>
                        <tbody>{detail.events.map(event => <tr key={event.id}>
                            <td className="text-capitalize">{words(event.event_type)}</td>
                            <td><time className="small text-nowrap">{formatDate(event.created_at)}</time></td>
                            <td>{event.actor_name || `Staff ${event.actor_employeeid || 'not recorded'}`}</td>
                            <td className="text-break">{event.reason || 'Not recorded'}</td>
                            <td className="small text-muted text-break" style={{ minWidth: 240 }}>{event.metadata != null ? readableEventMetadata(event.metadata) : 'Not recorded'}</td>
                        </tr>)}</tbody>
                    </table>
                </div> : <ol className="list-unstyled mb-0">{detail.events.map(event => <li key={event.id} className="border-start border-3 ps-3 py-2 mb-2"><div className="d-flex flex-wrap justify-content-between gap-2"><strong className="text-capitalize">{words(event.event_type)}</strong><time className="small text-muted">{formatDate(event.created_at)}</time></div><div className="small">{event.actor_name || `Staff ${event.actor_employeeid || 'not recorded'}`}{event.reason ? `: ${event.reason}` : ''}</div>{event.metadata != null && <div className="small text-muted mt-1 text-break">{readableEventMetadata(event.metadata)}</div>}</li>)}</ol> : <p className="small text-muted">No lifecycle events recorded.</p>}
            </>}</Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={closeDetail}>Close</button></Modal.Footer>
        </Modal>

        <StorageLocations show={showLocations} onHide={() => setShowLocations(false)} positions={positions} canConfigure={canConfigure} onChanged={loadPositions} onCreated={positionCreated} returnToSpecimen={selectedId !== null} />
    </div>;
}

function StorageLocations({ show, onHide, positions, canConfigure, onChanged, onCreated, returnToSpecimen }: { show: boolean; onHide: () => void; positions: StoragePosition[]; canConfigure: boolean; onChanged: () => Promise<void>; onCreated: (position: StoragePosition) => void; returnToSpecimen: boolean }) {
    const [form, setForm] = useState({ freezer: '', rack: '', position: '', temperatureC: '', notes: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            const temperatureC = form.temperatureC.trim() === '' ? undefined : Number(form.temperatureC);
            if (temperatureC !== undefined && !Number.isFinite(temperatureC)) throw new Error('Enter a valid storage temperature.');
            const response = await customFetchMutation('physical-samples/storage/positions', 'POST', {
                freezer: form.freezer.trim(), rack: form.rack.trim(), position: form.position.trim(), temperatureC, notes: form.notes.trim() || undefined,
            });
            if (!response?.success) throw new Error(response?.message || 'Unable to create the storage position.');
            setForm({ freezer: '', rack: '', position: '', temperatureC: '', notes: '' });
            toast.success('Storage position created.');
            await onChanged();
            onCreated(response.data);
        } catch (failure: any) { setError(failure?.message || 'Unable to create the storage position.'); }
        finally { setBusy(false); }
    };
    return <Modal show={show} onHide={() => !busy && onHide()} size="lg" animation={false} backdrop="static" keyboard={!busy}><Modal.Header closeButton={!busy}><Modal.Title className="h5">Storage positions</Modal.Title></Modal.Header><Modal.Body><p className="small text-muted">One container occupies one position. Configure freezer, rack and position labels to match the physical laboratory.</p>
        {canConfigure && <form onSubmit={submit} className="border rounded p-3 mb-4"><h2 className="h6">Add storage position</h2>{error && <div className="alert alert-danger" role="alert">{error}</div>}<fieldset disabled={busy}><div className="row g-3">{(['freezer', 'rack', 'position'] as const).map(key => <div key={key} className="col-sm-4"><label htmlFor={`storage-${key}`} className="form-label text-capitalize">{key}</label><input id={`storage-${key}`} className="form-control" required maxLength={100} value={form[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} /></div>)}<div className="col-sm-4"><label htmlFor="storage-temperature" className="form-label">Temperature (°C, optional)</label><input id="storage-temperature" className="form-control" type="number" step="0.1" value={form.temperatureC} onChange={event => setForm(current => ({ ...current, temperatureC: event.target.value }))} /></div><div className="col-sm-8"><label htmlFor="storage-notes" className="form-label">Notes (optional)</label><input id="storage-notes" className="form-control" maxLength={1000} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></div></div><button type="submit" className="btn btn-primary mt-3">{busy ? 'Adding...' : 'Add position'}</button></fieldset></form>}
        <div className="d-flex justify-content-between align-items-center gap-2 mb-2"><h2 className="h6 mb-0">{positions.length} configured positions</h2><button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={onChanged}>Refresh</button></div><div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th>Freezer / rack / position</th><th>Temperature</th><th>Occupancy</th></tr></thead><tbody>{positions.length ? positions.map(position => <tr key={position.id}><td>{storageLabel(position)}{position.notes && <div className="small text-muted">{position.notes}</div>}</td><td>{position.temperature_c == null ? 'Not set' : `${position.temperature_c} °C`}</td><td>{!Number(position.is_active) ? <span className="text-muted">Inactive</span> : position.sample_id ? <span className="text-primary">{position.sample_barcode || `Sample ${position.sample_id}`}</span> : <span className="text-success">Available</span>}</td></tr>) : <tr><td colSpan={3} className="text-center text-muted py-4">No storage positions configured.</td></tr>}</tbody></table></div></Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onHide}>{returnToSpecimen ? 'Return to specimen' : 'Close'}</button></Modal.Footer></Modal>;
}
