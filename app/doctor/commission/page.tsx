"use client";

import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RiMoneyDollarCircleLine, RiRefreshLine } from "@remixicon/react";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

type Totals = { earned: number; paid: number; waived: number; pending: number; approved: number; outstanding: number; transactions: number };
type SeriesPoint = Totals & { period: string; periodStart: string };
type Transaction = {
     id: number;
     service_id: number;
     billingid: number;
     test_name: string | null;
     serviceAddedOn: string;
     service_amount: number | string;
     paidamount: number | string | null;
     commission_type: string;
     commission_due: number | string;
     status: string;
     payment_status: string | null;
     amount_allocated: number | string | null;
     batch_reference: string | null;
     payment_date: string | null;
};
type PortalData = { range: { from: string; to: string; period: string }; totals: Totals; series: SeriesPoint[]; transactions: Transaction[]; total: number; totalPages: number };

const money = (value: unknown) => currencyFormatter.format(Number(value || 0));

/** Payment state comes from the facility batch payment when one exists, otherwise from the tracked commission status. */
const paymentLabel = (row: Transaction) => {
     if (row.payment_status) return row.payment_status === "partial" ? "Partially paid" : row.payment_status === "waived" ? "Waived" : "Paid";
     return row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "—";
};

export default function DoctorCommissionPage() {
     const { applicationsettings } = useApplicationSettings();
     const currentUser = applicationsettings?.user?.user || applicationsettings?.user;
     const clinicianid = Number(currentUser?.clinicianid ?? currentUser?.id ?? currentUser?.employeeid ?? 0);

     const [dateFilter, setDateFilter] = useState("This Month");
     const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [page, setPage] = useState(1);
     const [count] = useState(20);
     const [data, setData] = useState<PortalData | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");

     const load = useCallback(async () => {
          if (!clinicianid) return;
          setLoading(true);
          setError("");
          try {
               const params = new URLSearchParams({
                    startDate: from || dayjs().subtract(100, "years").format("YYYY-MM-DD"),
                    endDate: to || dayjs().format("YYYY-MM-DD"),
                    page: String(page),
                    count: String(count),
               });
               const response = await customFetch(`commission-payments/clinician/${clinicianid}/portal?${params}`);
               if (response?.status === "success" && response?.data) setData(response.data);
               else {
                    setData(null);
                    setError(response?.message || "Unable to load your commission.");
               }
          } catch {
               setData(null);
               setError("Unable to load your commission.");
          } finally {
               setLoading(false);
          }
     }, [clinicianid, from, to, page, count]);

     useEffect(() => { setPage(1); }, [from, to]);
     useEffect(() => { load(); }, [load]);

     const totals = data?.totals;
     const cards: Array<[string, string, string]> = [
          ["Earned", money(totals?.earned), "All non-voided commission on services in the period"],
          ["Pending", money(totals?.pending), "Not yet approved or paid"],
          ["Approved", money(totals?.approved), "Approved, awaiting payment"],
          ["Paid", money(totals?.paid), "Allocated in commission payments"],
          ["Outstanding", money(totals?.outstanding), "Not yet included in a payment"],
          ["Transactions", String(totals?.transactions ?? 0), totals?.waived ? `${money(totals.waived)} waived` : "Services with commission"],
     ];

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-4">
                    <div>
                         <h2 className="h5 mb-1 d-flex align-items-center gap-2">
                              <RiMoneyDollarCircleLine size={22} /> Commission
                         </h2>
                         <div className="text-muted small">
                              {currentUser?.username || "Clinician"}
                              {data?.range ? ` · ${data.range.from} to ${data.range.to}` : ""}
                         </div>
                    </div>
                    <div className="d-flex gap-2 align-items-end">
                         <DateFilterReusable
                              id="doctor-commission-date-filter"
                              value={dateFilter}
                              onChange={setDateFilter}
                              onDateRangeChange={(start: string, end: string) => { setFrom(start || ""); setTo(end || ""); }}
                              label="All time"
                              className=""
                         />
                         <button type="button" className="btn btn-sm btn-outline-secondary" onClick={load} disabled={loading} aria-label="Refresh">
                              <RiRefreshLine size={16} />
                         </button>
                    </div>
               </div>

               {!clinicianid && <div className="alert alert-warning small">Your clinician profile could not be identified, so your commission cannot be loaded.</div>}
               {error && <div className="alert alert-danger small">{error}</div>}

               <div className="row g-3 mb-4">
                    {cards.map(([title, value, hint]) => (
                         <div className="col-6 col-md-4 col-xl-2" key={title}>
                              <div className="card border-0 shadow-sm h-100">
                                   <div className="card-body">
                                        <div className="text-muted small">{title}</div>
                                        <div className="h5 fw-semibold mb-0">{loading ? "…" : value}</div>
                                        <div className="text-muted small mt-1">{hint}</div>
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>

               <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                         <h3 className="h6 fw-semibold">Commission trend {data?.range?.period ? <span className="text-muted small text-capitalize">({data.range.period})</span> : null}</h3>
                         {data?.series?.length ? (
                              <div style={{ width: "100%", height: 300 }}>
                                   <ResponsiveContainer>
                                        <ComposedChart data={data.series} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                             <CartesianGrid strokeDasharray="3 3" />
                                             <XAxis dataKey="period" fontSize={12} />
                                             <YAxis fontSize={12} />
                                             <Tooltip formatter={(value: any) => money(value)} />
                                             <Legend />
                                             <Bar dataKey="earned" name="Earned" fill="#0d6efd" />
                                             <Bar dataKey="paid" name="Paid" fill="#198754" />
                                             <Line type="monotone" dataKey="outstanding" name="Outstanding" stroke="#fd7e14" strokeWidth={2} />
                                        </ComposedChart>
                                   </ResponsiveContainer>
                              </div>
                         ) : (
                              <div className="text-muted small">{loading ? "Loading…" : "No commission recorded in this period."}</div>
                         )}
                    </div>
               </div>

               <div className="card border-0 shadow-sm">
                    <div className="card-body">
                         <h3 className="h6 fw-semibold">Transactions</h3>
                         {data?.transactions?.length ? (
                              <>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-striped align-middle mb-2">
                                             <thead>
                                                  <tr>
                                                       <th>Date</th>
                                                       <th>Bill</th>
                                                       <th>Test</th>
                                                       <th className="text-end">Service amount</th>
                                                       <th className="text-end">Paid by patient</th>
                                                       <th className="text-end">Commission</th>
                                                       <th>Status</th>
                                                       <th>Payment</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {data.transactions.map((row) => (
                                                       <tr key={row.id}>
                                                            <td className="small">{row.serviceAddedOn ? dayjs(row.serviceAddedOn).format("YYYY-MM-DD") : "—"}</td>
                                                            <td>#{row.billingid}</td>
                                                            <td className="small">{row.test_name || `Service #${row.service_id}`}</td>
                                                            <td className="text-end">{money(row.service_amount)}</td>
                                                            <td className="text-end">{money(row.paidamount)}</td>
                                                            <td className="text-end fw-semibold">{money(row.commission_due)}</td>
                                                            <td>{paymentLabel(row)}</td>
                                                            <td className="small text-muted">
                                                                 {row.batch_reference ? `${row.batch_reference}${row.payment_date ? ` · ${dayjs(row.payment_date).format("YYYY-MM-DD")}` : ""}` : "—"}
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                                   <div className="d-flex justify-content-between align-items-center small">
                                        <span className="text-muted">{data.total} transaction(s) · page {page} of {data.totalPages}</span>
                                        <div className="btn-group btn-group-sm">
                                             <button type="button" className="btn btn-outline-secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
                                             <button type="button" className="btn btn-outline-secondary" disabled={page >= data.totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
                                        </div>
                                   </div>
                              </>
                         ) : (
                              <div className="text-muted small">{loading ? "Loading…" : "No commission transactions in this period."}</div>
                         )}
                    </div>
               </div>
          </div>
     );
}
