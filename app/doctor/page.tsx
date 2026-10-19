"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
     RiFileListLine,
     RiFlaskLine,
     RiMedicineBottleLine,
     RiMoneyDollarCircleLine,
     RiRefreshLine,
     RiShieldUserLine,
     RiStethoscopeLine,
} from "@remixicon/react";
import { useApplicationSettings } from "../../components/Auth/useApplicationContext";
import { currencyFormatter, customFetch } from "../../components/Auth/customFetch";
import DateFilterReusable from "../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

const LAB_STATUSES = ["DRAFT", "PENDING", "ON_HOLD", "APPROVED", "CONVERTED", "REJECTED", "CANCELLED"];
const DRUG_STATUSES = ["pending", "partially_fulfilled", "fulfilled", "referred", "cancelled"];
const OUTSTANDING_LAB = ["DRAFT", "PENDING", "ON_HOLD"];

type StatusSummary = { total: number; byStatus: Record<string, any> };
type CommissionTotals = { earned: number; pending: number; approved: number; paid: number; outstanding: number; transactions: number };

const statusCount = (summary: StatusSummary | null, status: string) => {
     const entry = summary?.byStatus?.[status];
     return Number(typeof entry === "object" ? entry?.count ?? 0 : entry ?? 0);
};
const humanize = (status: string) => status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

function SummaryCard({ title, value, hint, href }: { title: string; value: React.ReactNode; hint?: string; href?: string }) {
     const body = (
          <div className="card border-0 shadow-sm h-100">
               <div className="card-body">
                    <div className="text-muted small">{title}</div>
                    <div className="h4 fw-semibold mb-0">{value}</div>
                    {hint && <div className="text-muted small mt-1">{hint}</div>}
               </div>
          </div>
     );
     return href ? <Link href={href} className="text-decoration-none text-reset">{body}</Link> : body;
}

export default function DoctorPortalPage() {
     const { applicationsettings } = useApplicationSettings();
     const currentUser = applicationsettings?.user?.user || applicationsettings?.user;
     const clinicianid = Number(currentUser?.clinicianid ?? currentUser?.id ?? currentUser?.employeeid ?? 0);

     const [dateFilter, setDateFilter] = useState("This Month");
     const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [loading, setLoading] = useState(false);
     const [labSummary, setLabSummary] = useState<StatusSummary & { value?: number } | null>(null);
     const [drugSummary, setDrugSummary] = useState<StatusSummary | null>(null);
     const [commission, setCommission] = useState<CommissionTotals | null>(null);
     const [recentOrders, setRecentOrders] = useState<any[]>([]);
     const [errors, setErrors] = useState<string[]>([]);

     const load = useCallback(async () => {
          if (!clinicianid) return;
          setLoading(true);
          const range = new URLSearchParams({ clinicianId: String(clinicianid) });
          if (from) range.set("from", from);
          if (to) range.set("to", to);
          const commissionRange = new URLSearchParams({
               startDate: from || dayjs().subtract(100, "years").format("YYYY-MM-DD"),
               endDate: to || dayjs().format("YYYY-MM-DD"),
               count: "1",
          });
          const [lab, drug, comm, recent] = await Promise.allSettled([
               customFetch(`entityorders/summary?${range}`),
               customFetch(`prescriptions/summary?${range}`),
               customFetch(`commission-payments/clinician/${clinicianid}/portal?${commissionRange}`),
               customFetch(`entityorders?${range}&page=1&count=5`),
          ]);
          const failed: string[] = [];
          const value = (r: PromiseSettledResult<any>) => (r.status === "fulfilled" ? r.value : null);
          const labData = value(lab)?.data;
          const drugData = value(drug)?.data;
          const commData = value(comm)?.data?.totals;
          if (!labData) failed.push("lab orders");
          if (!drugData) failed.push("drug orders");
          if (!commData) failed.push("commission");
          setLabSummary(labData || null);
          setDrugSummary(drugData || null);
          setCommission(commData || null);
          setRecentOrders(value(recent)?.result || []);
          setErrors(failed);
          setLoading(false);
     }, [clinicianid, from, to]);

     useEffect(() => { load(); }, [load]);

     const outstandingLab = useMemo(() => OUTSTANDING_LAB.reduce((sum, s) => sum + statusCount(labSummary, s), 0), [labSummary]);
     const outstandingDrug = statusCount(drugSummary, "pending") + statusCount(drugSummary, "partially_fulfilled");

     const cards = [
          { title: "Lab Orders", href: "/doctor/orders", icon: RiFlaskLine, description: "Track every lab order you have raised and its review status." },
          { title: "Drug Orders", href: "/doctor/drug-orders", icon: RiMedicineBottleLine, description: "Follow prescriptions sent to the pharmacy." },
          { title: "Tests Sent", href: "/doctor/test-sent", icon: RiFileListLine, description: "View requests assigned to you and read entered results." },
          { title: "Commission", href: "/doctor/commission", icon: RiMoneyDollarCircleLine, description: "View commission and financial summaries." },
          { title: "Permissions", href: "/doctor/permissions", icon: RiShieldUserLine, description: "Review your portal access and allowed actions." },
     ];

     const fmt = (n?: number) => (loading ? "…" : Number(n ?? 0).toLocaleString());
     const money = (n?: number) => (loading ? "…" : currencyFormatter.format(Number(n ?? 0)));

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-4">
                    <div>
                         <h2 className="h5 mb-1 d-flex align-items-center gap-2">
                              <RiStethoscopeLine size={22} /> Doctor Portal Overview
                         </h2>
                         <div className="text-muted small">{currentUser?.username || "Clinician"}{from && to ? ` · ${from} to ${to}` : " · All time"}</div>
                    </div>
                    <div className="d-flex gap-2 align-items-end">
                         <DateFilterReusable
                              id="doctor-overview-date-filter"
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

               {!clinicianid && <div className="alert alert-warning small">Your clinician profile could not be identified, so your summary cannot be loaded.</div>}
               {clinicianid > 0 && errors.length > 0 && !loading && (
                    <div className="alert alert-light border small">Some figures could not be loaded: {errors.join(", ")}.</div>
               )}

               <div className="row g-3 mb-4">
                    <div className="col-6 col-xl-3"><SummaryCard title="Lab orders" value={fmt(labSummary?.total)} hint={`${money(labSummary?.value)} ordered`} href="/doctor/orders" /></div>
                    <div className="col-6 col-xl-3"><SummaryCard title="Outstanding lab orders" value={fmt(outstandingLab)} hint="Draft, pending review or on hold" href="/doctor/orders" /></div>
                    <div className="col-6 col-xl-3"><SummaryCard title="Drug orders" value={fmt(drugSummary?.total)} hint={`${loading ? "…" : outstandingDrug} awaiting pharmacy`} href="/doctor/drug-orders" /></div>
                    <div className="col-6 col-xl-3"><SummaryCard title="Commission earned" value={money(commission?.earned)} hint={`${money(commission?.paid)} paid · ${money(commission?.outstanding)} outstanding`} href="/doctor/commission" /></div>
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-lg-4">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                   <h3 className="h6 fw-semibold">Lab orders by status</h3>
                                   <ul className="list-unstyled small mb-0">
                                        {LAB_STATUSES.map((s) => (
                                             <li key={s} className="d-flex justify-content-between border-bottom py-1">
                                                  <span>{humanize(s)}</span><span className="fw-semibold">{fmt(statusCount(labSummary, s))}</span>
                                             </li>
                                        ))}
                                   </ul>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-4">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                   <h3 className="h6 fw-semibold">Drug orders by status</h3>
                                   <ul className="list-unstyled small mb-0">
                                        {DRUG_STATUSES.map((s) => (
                                             <li key={s} className="d-flex justify-content-between border-bottom py-1">
                                                  <span>{humanize(s)}</span><span className="fw-semibold">{fmt(statusCount(drugSummary, s))}</span>
                                             </li>
                                        ))}
                                   </ul>
                              </div>
                         </div>
                    </div>
                    <div className="col-lg-4">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                   <h3 className="h6 fw-semibold">Commission in period</h3>
                                   <ul className="list-unstyled small mb-0">
                                        {[
                                             ["Earned", commission?.earned],
                                             ["Pending", commission?.pending],
                                             ["Approved", commission?.approved],
                                             ["Paid", commission?.paid],
                                             ["Outstanding", commission?.outstanding],
                                        ].map(([label, amount]) => (
                                             <li key={label as string} className="d-flex justify-content-between border-bottom py-1">
                                                  <span>{label}</span><span className="fw-semibold">{money(amount as number)}</span>
                                             </li>
                                        ))}
                                   </ul>
                              </div>
                         </div>
                    </div>
               </div>

               <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                         <div className="d-flex justify-content-between align-items-center mb-2">
                              <h3 className="h6 fw-semibold mb-0">Recent lab orders</h3>
                              <Link href="/doctor/orders" className="small">View all</Link>
                         </div>
                         {recentOrders.length === 0 ? (
                              <div className="text-muted small">{loading ? "Loading…" : "No lab orders in this period."}</div>
                         ) : (
                              <div className="table-responsive">
                                   <table className="table table-sm align-middle mb-0">
                                        <thead><tr><th>Patient</th><th>Tests</th><th>Status</th><th>Created</th></tr></thead>
                                        <tbody>
                                             {recentOrders.map((order) => (
                                                  <tr key={order.id}>
                                                       <td>{order.patientName || `Patient #${order.patient_id}`}</td>
                                                       <td className="small">{(order.lines || []).map((l: any) => l.test_name).join(", ") || "—"}</td>
                                                       <td>{humanize(String(order.status || ""))}</td>
                                                       <td className="small text-muted">{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
                    </div>
               </div>

               <div className="row g-3">
                    {cards.map((card) => {
                         const Icon = card.icon;
                         return (
                              <div className="col-md-6 col-xl-4" key={card.href}>
                                   <Link href={card.href} className="text-decoration-none text-reset">
                                        <div className="card border-0 shadow-sm h-100">
                                             <div className="card-body">
                                                  <Icon size={28} className="text-primary mb-3" />
                                                  <h3 className="h6 fw-semibold">{card.title}</h3>
                                                  <p className="text-muted small mb-0">{card.description}</p>
                                             </div>
                                        </div>
                                   </Link>
                              </div>
                         );
                    })}
               </div>
          </div>
     );
}
