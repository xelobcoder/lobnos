'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Modal, Spinner } from 'react-bootstrap';
import { RiCheckboxCircleLine, RiCloseCircleLine, RiFileListLine, RiMailLine, RiRefreshLine, RiSearchLine, RiTestTubeLine, RiTimeLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch } from '../Auth/customFetch';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { roleAllowed } from '../Auth/roles';
import DateFilterReusable from '../operations/Laboratory/ResuableFilter/DateFilterReusable';

type ReportMode = 'samples' | 'reviews' | 'communications';
type Props = { mode: ReportMode };
type ReportResponse = { summary: Record<string, number>; items: any[]; pagination: { page: number; count: number; total: number; totalPages: number } };

const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : 'Not recorded';
const statusLabel = (value?: string) => String(value || 'unknown').replace(/_/g, ' ');
const parseChannels = (value: unknown) => {
     if (Array.isArray(value)) return value.join(', ');
     try { return JSON.parse(String(value || '[]')).join(', '); } catch { return String(value || 'None'); }
};

const modeConfig = {
     samples: { title: 'Physical Sample Summary', subtitle: 'Every container collected or received, its current decision, and complete audit history.', endpoint: 'physical-samples/worklists/samples' },
     reviews: { title: 'Sample Review Requests', subtitle: 'Independent scientist review requests and their decisions.', endpoint: 'physical-samples/worklists/reviews' },
     communications: { title: 'Rejection Communications', subtitle: 'Patient messages requested after rejection and their delivery attempts.', endpoint: 'physical-samples/worklists/communications' },
};

const statusClasses: Record<string, string> = {
     planned: 'text-secondary', collection_started: 'text-primary', collected: 'text-warning', received: 'text-info', accepted: 'text-success', rejected: 'text-danger', recollection_required: 'text-danger',
     pending: 'text-warning', usable: 'text-success', rejection_upheld: 'text-danger', queued: 'text-primary', partial: 'text-warning', sent: 'text-success', failed: 'text-danger', none: 'text-secondary',
};

const summaryVariants = ['primary', 'success', 'warning', 'danger', 'info', 'secondary'];

function StatusText({ value }: { value?: string }) {
     return <span className={`fw-semibold text-capitalize ${statusClasses[String(value)] || 'text-secondary'}`}>{statusLabel(value)}</span>;
}

export default function SampleReportsWorkspace({ mode }: Props) {
     const config = modeConfig[mode];
     const { applicationsettings } = useApplicationSettings();
     const canHandleStorage = roleAllowed(applicationsettings?.user?.role, ['admin', 'manager', 'scientist', 'phelobotomist', 'phlebotomist']);
     const [report, setReport] = useState<ReportResponse>({ summary: {}, items: [], pagination: { page: 1, count: 10, total: 0, totalPages: 0 } });
     const [loading, setLoading] = useState(false);
     const [dateFilter, setDateFilter] = useState('Today');
     const [dates, setDates] = useState({ startDate: today(), endDate: today() });
     const [status, setStatus] = useState('all');
     const [search, setSearch] = useState('');
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(10);
     const [audit, setAudit] = useState<any | null>(null);
     const [auditLoading, setAuditLoading] = useState(false);

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const params = new URLSearchParams({ startDate: dates.startDate, endDate: dates.endDate, status, search, page: String(page), count: String(count) });
               const response = await customFetch(`${config.endpoint}?${params.toString()}`);
               if (!response?.success) throw new Error(response?.message || 'Unable to load sample report.');
               setReport(response.data || { summary: {}, items: [], pagination: { page, count, total: 0, totalPages: 0 } });
          } catch (error: any) {
               toast.error(error?.message || 'Unable to load sample report.');
               setReport({ summary: {}, items: [], pagination: { page, count, total: 0, totalPages: 0 } });
          } finally { setLoading(false); }
     }, [config.endpoint, count, dates.endDate, dates.startDate, page, search, status]);

     useEffect(() => { load(); }, [load]);

     const openAudit = async (sampleId: number) => {
          setAuditLoading(true);
          try {
               const response = await customFetch(`physical-samples/worklists/samples/${sampleId}`);
               if (!response?.success) throw new Error(response?.message || 'Unable to load sample history.');
               setAudit(response.data);
          } catch (error: any) { toast.error(error?.message || 'Unable to load sample history.'); }
          finally { setAuditLoading(false); }
     };

     const summaryEntries = Object.entries(report.summary).filter(([, value]) => Number(value) > 0 || value === 0);

     return <div className="container-fluid px-3 py-3">
          <div className="border rounded-3 bg-body p-3 mb-3">
               <div className="d-flex align-items-start gap-3"><div className="bg-primary text-white d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 44, height: 44 }}><RiTestTubeLine size={24} /></div><div><h1 className="h4 fw-bold mb-1">{config.title}</h1><p className="text-muted mb-0">{config.subtitle}</p>{mode === 'samples' && <Link className="btn btn-sm btn-outline-primary mt-3" href="/operations/phelobotomy/specimen-storage">Specimen storage, aliquots &amp; retention</Link>}</div></div>
          </div>

          <div className="p-3 border rounded-3 bg-body mb-3"><div className="d-flex justify-content-between align-items-center mb-3"><div><h2 className="h5 fw-bold mb-1 d-flex align-items-center gap-2"><RiFileListLine className="text-primary" size={24} />Summary</h2><span className="small text-muted">{report.pagination.total.toLocaleString()} records in the selected period</span></div></div><div className="row g-3">{summaryEntries.map(([key, value], index) => {
               const Icon = key === 'rejected' || key === 'failed' ? RiCloseCircleLine : key === 'accepted' || key === 'sent' || key === 'usable' ? RiCheckboxCircleLine : key === 'pending' || key === 'collection_started' ? RiTimeLine : key === 'total' ? RiFileListLine : RiTestTubeLine;
               const variant = summaryVariants[index % summaryVariants.length];
               return <div className="col-6 col-lg-3" key={key}><div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}><div className="card-body p-3"><div className="d-flex justify-content-between align-items-center mb-1"><span className="text-xs text-uppercase fw-semibold opacity-75">{statusLabel(key)}</span><Icon size={22} className="opacity-75" /></div><h3 className="fw-bold mb-0">{Number(value).toLocaleString()}</h3><span className="text-xs opacity-75">Selected date range</span></div></div></div>;
          })}</div></div>

          <div className="border bg-body" style={{ borderRadius: 8 }}>
               <div className="p-3 border-bottom"><div className="row g-3 align-items-end"><div className="col-12 col-md-4 col-xl-3"><label className="form-label small fw-semibold mb-1">Date range</label><DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(startDate, endDate) => { setDates({ startDate, endDate }); setPage(1); }} label="Choose date range" className="w-100" /><div className="small text-muted mt-1">{dates.startDate} to {dates.endDate}</div></div>
                    <div className="col-12 col-md-5 col-xl-5"><label className="form-label small fw-semibold" htmlFor="sample-report-search"><RiSearchLine size={16} className="me-1" />Search</label><input id="sample-report-search" className="form-control" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Patient, billing ID, patient ID, or sample ID" /></div>
                    <div className="col-8 col-md-2"><label className="form-label small fw-semibold" htmlFor="sample-report-status">Status</label><select id="sample-report-status" className="form-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option>{Object.keys(statusClasses).map((key) => <option value={key} key={key}>{statusLabel(key)}</option>)}</select></div>
                    <div className="col-4 col-md-1"><button className="btn btn-primary w-100 d-flex align-items-center justify-content-center" title="Refresh report" onClick={load} disabled={loading}><RiRefreshLine size={18} /></button></div></div>
               </div>
               <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr>{mode === 'samples' ? <><th>Sample</th><th>Patient / Billing</th><th>Container / Tests</th><th>Source</th><th>Status / Decision</th><th>Timeline</th><th></th></> : mode === 'reviews' ? <><th>Request</th><th>Sample / Patient</th><th>Reason</th><th>Status</th><th>Decision</th></> : <><th>Message</th><th>Sample / Patient</th><th>Channels</th><th>Status</th><th>Delivery attempts</th></>}</tr></thead><tbody>
                    {loading ? <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" /></td></tr> : report.items.length === 0 ? <tr><td colSpan={7} className="text-center text-muted py-5">No records match these filters.</td></tr> : report.items.map((item) => mode === 'samples' ? <tr key={item.id}><td><strong>{item.sample_uid}</strong><div className="small text-muted">{formatDate(item.created_at)}</div></td><td>{item.patient_name}<div className="small text-muted">{item.fullpatientid} | Billing {item.billingid}</div></td><td>{item.sample_type_name || 'Specimen'} / {item.container_type_name || 'Container'}<div className="small text-muted">{item.test_names || 'No linked tests'}</div></td><td className="text-capitalize">{item.collection_source || 'onsite'}{item.external_facility ? <div className="small text-muted">{item.external_facility}</div> : null}</td><td><StatusText value={item.status} />{item.rejection_reason ? <div className="small text-danger">{item.rejection_reason}</div> : null}<div className="small text-muted">{item.validated_by_name || ''}</div></td><td className="small"><div>Collected: {formatDate(item.collected_at)}</div><div>Received: {formatDate(item.received_at)}</div><div>Validated: {formatDate(item.accepted_at || item.rejected_at)}</div></td><td><button className="btn btn-sm btn-outline-primary" onClick={() => openAudit(item.id)} disabled={auditLoading}>History</button>{canHandleStorage && ['collected', 'received', 'accepted'].includes(item.status) && item.storage_state !== 'disposed' && <Link className="btn btn-sm btn-primary ms-2" href={`/operations/phelobotomy/specimen-storage?sampleId=${item.id}&action=store`}>{item.storage_state === 'stored' ? 'Move sample' : item.storage_state === 'retrieved' ? 'Return to storage' : 'Store sample'}</Link>}{['accepted', 'rejected'].includes(item.status) && <Link className="btn btn-sm btn-outline-secondary ms-2" href={`/operations/phelobotomy/specimen-storage?sampleId=${item.id}`}>Storage / aliquots</Link>}</td></tr>
                    : mode === 'reviews' ? <tr key={item.id}><td>{formatDate(item.requested_at)}<div className="small text-muted">By {item.requested_by_name || item.requested_by}</div></td><td><strong>{item.sample_uid}</strong><div>{item.patient_name}</div><div className="small text-muted">Billing {item.billingid} | {item.test_names}</div></td><td>{item.request_reason || item.rejection_reason || 'No reason recorded'}</td><td><StatusText value={item.status} /></td><td>{item.review_notes || 'Pending decision'}<div className="small text-muted">{item.reviewed_by_name ? `${item.reviewed_by_name} - ${formatDate(item.reviewed_at)}` : ''}</div></td></tr>
                    : <tr key={item.id}><td style={{ minWidth: 260 }}>{item.message}<div className="small text-muted">{formatDate(item.created_at)} by {item.requested_by_name || item.requested_by}</div></td><td><strong>{item.sample_uid}</strong><div>{item.patient_name}</div><div className="small text-muted">Billing {item.billingid}</div></td><td className="text-capitalize">{parseChannels(item.requested_channels)}</td><td><StatusText value={item.status} /></td><td>{item.attempts?.length ? item.attempts.map((attempt: any) => <div key={attempt.id} className="small text-capitalize"><RiMailLine size={14} className="me-1" />{attempt.channel}: <StatusText value={attempt.status} /> {attempt.recipient_masked || ''}</div>) : <span className="text-muted">No delivery attempt</span>}</td></tr>)}</tbody></table></div>
               <div className="p-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2"><div className="d-flex align-items-center gap-2"><label className="small text-muted" htmlFor="sample-report-count">Rows</label><select id="sample-report-count" className="form-select form-select-sm" style={{ width: 80 }} value={count} onChange={(event) => { setCount(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select><span className="small text-muted">of {report.pagination.total.toLocaleString()}</span></div><div className="d-flex align-items-center gap-2"><button className="btn btn-sm btn-outline-secondary" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><span className="small fw-semibold">Page {report.pagination.page} of {Math.max(1, report.pagination.totalPages)}</span><button className="btn btn-sm btn-outline-secondary" disabled={loading || page >= report.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
          </div>

          <Modal show={Boolean(audit)} onHide={() => setAudit(null)} size="lg" animation={false} dialogClassName="mt-3"><Modal.Header closeButton><Modal.Title className="h5">Sample Audit History</Modal.Title></Modal.Header><Modal.Body>{audit && <><div className="border-bottom pb-3 mb-3"><strong>{audit.sample_uid}</strong><div className="text-muted">{audit.tests?.map((test: any) => test.testName).join(', ')}</div></div><h2 className="h6">Lifecycle events</h2>{audit.events?.length ? audit.events.map((event: any) => <div className="border-start border-3 ps-3 py-2 mb-2" key={event.id}><div className="d-flex justify-content-between gap-3"><StatusText value={event.event_type} /><span className="small text-muted">{formatDate(event.created_at)}</span></div><div className="small">{event.actor_name || `Employee ${event.actor_employeeid}`}{event.reason ? `: ${event.reason}` : ''}</div></div>) : <p className="text-muted">No events recorded.</p>}<h2 className="h6 mt-4">Review decisions</h2>{audit.reviews?.length ? audit.reviews.map((review: any) => <div className="border p-3 mb-2" style={{ borderRadius: 6 }} key={review.id}><StatusText value={review.status} /><div className="small mt-1">Requested by {review.requested_by_name || review.requested_by} on {formatDate(review.requested_at)}</div>{review.reviewed_at ? <div className="small">Decided by {review.reviewed_by_name || review.reviewed_by} on {formatDate(review.reviewed_at)}</div> : null}</div>) : <p className="text-muted">No review requests.</p>}</>}</Modal.Body></Modal>
     </div>;
}
