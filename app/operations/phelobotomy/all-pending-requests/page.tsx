'use client';

import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Spinner } from 'react-bootstrap';
import { RiErrorWarningLine, RiInbox2Line, RiInboxLine, RiRefreshLine, RiTestTubeLine } from '@remixicon/react';
import { customFetch } from '../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

interface PendingRequest {
     fullname: string;
     patientid: number;
     age: string;
     gender: string;
     mobilenumber: string;
     billingid: number;
     date: string;
     clientstatus: string;
}

interface Pagination {
     page: number;
     count: number;
     total: number;
     totalPages: number;
}

const initialStartDate = dayjs().subtract(100, 'years').format('YYYY-MM-DD');
const initialEndDate = dayjs().format('YYYY-MM-DD');

export default function AllPendingRequestsPage() {
     const [data, setData] = useState<PendingRequest[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [dateFilter, setDateFilter] = useState('All');
     const [dates, setDates] = useState({ startDate: initialStartDate, endDate: initialEndDate });
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(10);
     const [pagination, setPagination] = useState<Pagination>({ page: 1, count: 10, total: 0, totalPages: 0 });

     const fetchData = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const params = new URLSearchParams({ page: String(page), count: String(count), start_date: dates.startDate, end_date: dates.endDate });
               const response = await customFetch(`test/ascension/all/pending?${params.toString()}`);
               if (response?.status !== 'success' || !Array.isArray(response.result)) throw new Error(response?.message || 'Failed to fetch pending requests');
               setData(response.result);
               setPagination(response.pagination || { page, count, total: response.result.length, totalPages: response.result.length ? 1 : 0 });
          } catch (requestError: any) {
               setData([]);
               setError(requestError?.message || 'An error occurred while fetching data');
          } finally { setLoading(false); }
     }, [count, dates.endDate, dates.startDate, page]);

     useEffect(() => { fetchData(); }, [fetchData]);

     const handleCollectSample = (billingid: string | number) => {
          window.open(`/operations/phelobotomy/pending-samples-collection?billingid=${billingid}`, '_blank');
     };

     return <div className="container-fluid px-3 py-3">
          <div className="border rounded-3 bg-body p-3 mb-3">
               <div className="d-flex align-items-start gap-3"><div className="bg-primary text-white d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 44, height: 44 }}><RiInboxLine size={24} /></div><div><h1 className="h4 fw-bold mb-1">All Pending Sample Requests</h1><p className="text-muted mb-0">Billing requests with one or more laboratory samples still awaiting collection.</p></div></div>
          </div>

          <div className="border rounded-3 bg-body p-3 mb-3">
               <div className="row g-3 align-items-end"><div className="col-12 col-md-5 col-xl-4"><label className="form-label small fw-semibold mb-1">Request date</label><DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(startDate, endDate) => { setDates({ startDate, endDate }); setPage(1); }} label="Choose date range" className="w-100" /><div className="small text-muted mt-1">{dates.startDate} to {dates.endDate}</div></div><div className="col-8 col-md-3 col-xl-2"><label className="form-label small fw-semibold" htmlFor="pending-request-count">Rows per page</label><select id="pending-request-count" className="form-select" value={count} onChange={(event) => { setCount(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></div><div className="col-4 col-md-auto"><button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={fetchData} disabled={loading}><RiRefreshLine size={18} /><span className="d-none d-lg-inline">Refresh</span></button></div></div>
          </div>

          <div className="border rounded-3 bg-body overflow-hidden">
               <div className="p-3 border-bottom d-flex justify-content-between align-items-center"><h2 className="h6 fw-semibold mb-0">Pending requests</h2><span className="small text-muted">{pagination.total.toLocaleString()} total</span></div>
               {error ? <div className="p-5 text-center"><RiErrorWarningLine size={42} className="text-danger mb-2" /><h3 className="h6">Unable to load pending requests</h3><p className="text-muted mb-0">{error}</p></div>
                    : loading ? <div className="p-5 text-center"><Spinner animation="border" /><p className="text-muted mt-2 mb-0">Loading pending requests...</p></div>
                    : data.length === 0 ? <div className="p-5 text-center"><RiInbox2Line size={42} className="text-muted mb-2" /><h3 className="h6">No pending requests</h3><p className="text-muted mb-0">No requests match the selected date range.</p></div>
                    : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Request Date</th><th>Patient</th><th>Patient ID</th><th>Age / Gender</th><th>Mobile</th><th>Billing ID</th><th>Status</th><th></th></tr></thead><tbody>{data.map((request) => <tr key={request.billingid}><td className="text-nowrap">{dayjs(request.date).format('DD-MM-YYYY HH:mm:ss')}</td><td className="fw-medium">{request.fullname}</td><td>{request.patientid}</td><td className="text-capitalize">{request.age} / {request.gender}</td><td>{request.mobilenumber}</td><td>{request.billingid}</td><td className="text-capitalize">{request.clientstatus}</td><td><button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => handleCollectSample(request.billingid)}><RiTestTubeLine size={16} /><span>Collect Sample</span></button></td></tr>)}</tbody></table></div>}
               <div className="p-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2"><span className="small text-muted">Showing {data.length} of {pagination.total.toLocaleString()} requests</span><div className="d-flex align-items-center gap-2"><button className="btn btn-sm btn-outline-secondary" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><span className="small fw-semibold">Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span><button className="btn btn-sm btn-outline-secondary" disabled={loading || page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
          </div>
     </div>;
}
