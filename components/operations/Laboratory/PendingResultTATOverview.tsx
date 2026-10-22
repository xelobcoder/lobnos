"use client";

import { useEffect, useState } from 'react';
import { Alert, Button, Spinner, Table } from 'react-bootstrap';
import moment from 'moment';
import { customFetch } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';

type ThresholdSummary = { hours: number; count: number };
type PendingResultCase = {
     ascensionId: number;
     patientNumber: string;
     patientName: string;
     testName: string;
     department: string | null;
     clockStartedAt: string;
     collectedAt: string | null;
     elapsedMinutes: number;
     configuredTat: string | number | null;
};

const THRESHOLDS = [6, 12, 24, 32, 64];
const PAGE_SIZE = 10;

function formatElapsed(minutes: number): string {
     const safeMinutes = Math.max(0, Math.floor(Number(minutes) || 0));
     const days = Math.floor(safeMinutes / 1440);
     const hours = Math.floor((safeMinutes % 1440) / 60);
     const remainder = safeMinutes % 60;
     if (days > 0) return `${days}d ${hours}h`;
     if (hours > 0) return `${hours}h ${remainder}m`;
     return `${remainder}m`;
}

type Props = { view?: 'summary' | 'cases' | 'combined'; initialThreshold?: number; onThresholdSelect?: (hours: number) => void };
export default function PendingResultTATOverview({ view = 'combined', initialThreshold = 6, onThresholdSelect }: Props) {
     const employeeid = useApplicationSettings().applicationsettings?.user?.employeeid;
     const [summary, setSummary] = useState<ThresholdSummary[]>([]);
     const [selectedHours, setSelectedHours] = useState(initialThreshold);
     const [cases, setCases] = useState<PendingResultCase[]>([]);
     const [page, setPage] = useState(1);
     const [total, setTotal] = useState(0);
     const [summaryLoading, setSummaryLoading] = useState(true);
     const [casesLoading, setCasesLoading] = useState(false);
     const [summaryError, setSummaryError] = useState('');
     const [casesError, setCasesError] = useState('');

     useEffect(() => {
          if (view === 'cases') return;
          let cancelled = false;
          setSummaryLoading(true);
          customFetch(`testascension/pending-result-tat/summary?employeeid=${employeeid}`)
               .then((response: any) => {
                    if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Unable to load TAT summary');
                    if (!cancelled) setSummary(response.data);
               })
               .catch((requestError: any) => {
                    if (!cancelled) setSummaryError(requestError?.message || 'Unable to load pending-result TAT summary');
               })
               .finally(() => {
                    if (!cancelled) setSummaryLoading(false);
               });
          return () => { cancelled = true; };
     }, [employeeid, view]);

     useEffect(() => { setSelectedHours(initialThreshold); setPage(1); }, [initialThreshold]);

     useEffect(() => {
          if (view === 'summary') return;
          let cancelled = false;
          setCasesLoading(true);
          customFetch(`testascension/pending-result-tat/cases?employeeid=${employeeid}&thresholdHours=${selectedHours}&page=${page}&count=${PAGE_SIZE}`)
               .then((response: any) => {
                    if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Unable to load pending cases');
                    if (!cancelled) {
                         setCases(response.data);
                         setTotal(Number(response.total) || 0);
                         setCasesError('');
                    }
               })
               .catch((requestError: any) => {
                    if (!cancelled) {
                         setCases([]);
                         setTotal(0);
                         setCasesError(requestError?.message || 'Unable to load pending cases');
                    }
               })
               .finally(() => {
                    if (!cancelled) setCasesLoading(false);
               });
          return () => { cancelled = true; };
     }, [employeeid, page, selectedHours, view]);

     const selectThreshold = (hours: number) => {
          setSelectedHours(hours);
          setPage(1);
          onThresholdSelect?.(hours);
     };

     const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

     return (
          <section className="mb-4" aria-labelledby={view === 'cases' ? 'pending-result-tat-cases-title' : 'pending-result-tat-title'}>
               {view !== 'cases' && <><div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
                    <div>
                         <h2 id="pending-result-tat-title" className="h5 mb-1">Pending results by elapsed time</h2>
                         <p className="text-muted small mb-0">Elapsed time starts at registration, matching the existing total TAT clock. Thresholds are cumulative.</p>
                    </div>
                    {summaryLoading && <Spinner animation="border" size="sm" aria-label="Loading TAT summary" />}
               </div>

               <div className="row g-2 mb-3">
                    {THRESHOLDS.map((hours) => {
                         const count = summary.find((item) => Number(item.hours) === hours)?.count ?? 0;
                         const active = selectedHours === hours;
                         return (
                              <div className="col-6 col-md" key={hours}>
                                   <button
                                        type="button"
                                        className={`w-100 h-100 text-start rounded-1 border p-3 bg-white ${active ? 'border-primary border-2' : 'border-secondary-subtle'}`}
                                        aria-pressed={active}
                                        onClick={() => selectThreshold(hours)}
                                   >
                                        <span className="d-block text-muted small">At least {hours} hours</span>
                                        <span className="d-block fs-4 fw-semibold text-body">{count}</span>
                                        <span className="d-block small text-muted">pending</span>
                                   </button>
                              </div>
                         );
                    })}
               </div>

               {summaryError && <Alert variant="danger" className="py-2">{summaryError}</Alert>}</>}
               {view !== 'summary' && <>
               {view === 'cases' && <div className="mb-3"><label className="form-label small fw-semibold" htmlFor="tat-pending-threshold">Pending for at least</label><select className="form-select" id="tat-pending-threshold" value={selectedHours} onChange={event => selectThreshold(Number(event.target.value))}>{THRESHOLDS.map(hours => <option key={hours} value={hours}>{hours} hours</option>)}</select></div>}
               {casesError && <Alert variant="danger" className="py-2">{casesError}</Alert>}

               <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <h3 className="h6 mb-0" id="pending-result-tat-cases-title">Pending cases with at least {selectedHours} hours elapsed <span className="text-muted fw-normal">({total})</span></h3>
                    <div className="d-flex align-items-center gap-2">
                         <Button variant="outline-secondary" size="sm" disabled={page <= 1 || casesLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                         <span className="small text-muted">Page {page} of {totalPages}</span>
                         <Button variant="outline-secondary" size="sm" disabled={page >= totalPages || casesLoading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
                    </div>
               </div>

               <div className="table-responsive border rounded-1 bg-white">
                    <Table hover responsive={false} size="sm" className="mb-0 align-middle">
                         <thead className="table-light">
                              <tr>
                                   <th>Patient / Lab No.</th>
                                   <th>Test</th>
                                   <th>Section</th>
                                   <th>Registered</th>
                                   <th>Collected</th>
                                   <th>Elapsed</th>
                                   <th>Configured TAT</th>
                                   <th>Status</th>
                              </tr>
                         </thead>
                         <tbody>
                              {casesLoading ? (
                                   <tr><td colSpan={8} className="text-center py-4"><Spinner size="sm" className="me-2" />Loading cases</td></tr>
                              ) : cases.length === 0 ? (
                                   <tr><td colSpan={8} className="text-center text-muted py-4">No pending cases at this threshold.</td></tr>
                              ) : cases.map((item) => (
                                   <tr key={item.ascensionId}>
                                        <td><span className="d-block fw-semibold">{item.patientName || 'Unknown patient'}</span><span className="small text-muted">{item.patientNumber || 'No lab number'} · #{item.ascensionId}</span></td>
                                        <td>{item.testName}</td>
                                        <td>{item.department || '—'}</td>
                                        <td>{item.clockStartedAt ? moment(item.clockStartedAt).format('MMM D, YYYY HH:mm') : '—'}</td>
                                        <td>{item.collectedAt ? moment(item.collectedAt).format('MMM D, YYYY HH:mm') : '—'}</td>
                                        <td className="fw-semibold">{formatElapsed(item.elapsedMinutes)}</td>
                                        <td>{item.configuredTat ? `${item.configuredTat} min` : 'Not set'}</td>
                                        <td>Awaiting result</td>
                                   </tr>
                              ))}
                         </tbody>
                    </Table>
               </div>
               </>}
          </section>
     );
}
