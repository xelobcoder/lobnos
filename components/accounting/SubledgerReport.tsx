"use client";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import ReportShell from "./ReportShell";
import { currencyFormatter } from "../Auth/customFetch";
import DateFilterReusable from "../operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, Aging, PartyBalance } from "../../lib/accounting/accountingApi";

interface Props {
     ledger: "AR" | "AP";
     title: string;
     subtitle: string;
     partyLabel: string;
}

export default function SubledgerReport({ ledger, title, subtitle, partyLabel }: Props) {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [balances, setBalances] = useState<PartyBalance[]>([]);
     const [aging, setAging] = useState<Aging | null>(null);
     const [reconcile, setReconcile] = useState<{ subledger: number; generalLedger: number; difference: number } | null>(null);
     const [view, setView] = useState<"balances" | "aging">("balances");
     const [loading, setLoading] = useState(false);

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const [balancesRes, agingRes, reconcileRes] = await Promise.all([
                    accountingApi.subledgerBalances(ledger, asOf),
                    ledger === "AR" ? accountingApi.receivableAging(asOf) : accountingApi.payableAging(asOf),
                    accountingApi.subledgerReconcile(ledger, asOf),
               ]);

               setBalances((balancesRes?.result?.data || []).filter((row) => Math.abs(row.balance) > 0.001));
               setAging(agingRes?.result || null);
               setReconcile(reconcileRes?.result || null);
          } finally {
               setLoading(false);
          }
     }, [ledger, asOf]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     const balanceColumns = [
          {
               Header: partyLabel,
               accessor: "partyName",
               Cell: ({ row }: any) => {
                    const name = row.original.partyName || `${row.original.partyType} #${row.original.partyId ?? "unknown"}`;
                    if (!row.original.partyId) return <span>{name}</span>;
                    return (
                         <Link
                              className="text-decoration-none"
                              href={`/accounting/statements/${ledger}/${row.original.partyType}/${row.original.partyId}`}
                         >
                              {name}
                         </Link>
                    );
               },
          },
          { Header: "Documents", accessor: "documents", Cell: ({ value }: any) => <span >{value}</span> },
          { Header: "Charged", accessor: "charged", Cell: ({ value }: any) => <span >{money(value)}</span> },
          { Header: "Settled", accessor: "settled", Cell: ({ value }: any) => <span >{money(value)}</span> },
          {
               Header: "Balance",
               accessor: "balance",
               Cell: ({ value }: any) => (
                    <span className={`w-semibold ${Number(value) < 0 ? "text-danger" : ""}`}>{money(value)}</span>
               ),
          },
          {
               Header: "Oldest",
               accessor: "oldestDocumentDate",
               Cell: ({ value }: any) => <span className="text-nowrap">{value ? dayjs(value).format("DD MMM YYYY") : "-"}</span>,
          },
     ];

     const agingColumns = [
          {
               Header: partyLabel,
               accessor: "partyName",
               Cell: ({ row }: any) => row.original.partyName || `${row.original.partyType} #${row.original.partyId ?? "unknown"}`,
          },
          { Header: "Reference", accessor: "reference" },
          {
               Header: "Date",
               accessor: "documentDate",
               Cell: ({ value }: any) => <span className="text-nowrap">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          { Header: "Age", accessor: "ageDays", Cell: ({ value }: any) => <span className="">{value}d</span> },
          { Header: "Current", accessor: "current", Cell: ({ value }: any) => <span className="">{value ? money(value) : "-"}</span> },
          { Header: "1-30", accessor: "days30", Cell: ({ value }: any) => <span className="">{value ? money(value) : "-"}</span> },
          { Header: "31-60", accessor: "days60", Cell: ({ value }: any) => <span className="">{value ? money(value) : "-"}</span> },
          { Header: "61-90", accessor: "days90", Cell: ({ value }: any) => <span className="">{value ? money(value) : "-"}</span> },
          {
               Header: "90+",
               accessor: "over90",
               Cell: ({ value }: any) => <span className={`d-block text-end ${value ? "text-danger" : ""}`}>{value ? money(value) : "-"}</span>,
          },
          { Header: "Total", accessor: "total", Cell: ({ value }: any) => <span className="d-block text-end fw-semibold">{money(value)}</span> },
     ];

     const tiles = [
          { label: "Total", value: aging?.totals.total || 0 },
          { label: "Current", value: aging?.totals.current || 0 },
          { label: "1-30 days", value: aging?.totals.days30 || 0 },
          { label: "31-60 days", value: aging?.totals.days60 || 0 },
          { label: "61-90 days", value: aging?.totals.days90 || 0 },
          { label: "Over 90 days", value: aging?.totals.over90 || 0 },
     ];

     const outOfBalance = reconcile && Math.abs(reconcile.difference) > 0.01;

     return (
          <ReportShell
               title={title}
               subtitle={subtitle}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(_, end) => setAsOf(end)} label="Period" className="w-100" disabled={loading} />
                         </div>
                         <div className="col-6 col-md-3">
                              <label className="form-label mb-1 small text-muted">View</label>
                              <select className="form-select custom-select" value={view} onChange={(e) => setView(e.target.value as any)}>
                                   <option value="balances">Balances by {partyLabel.toLowerCase()}</option>
                                   <option value="aging">Aging by document</option>
                              </select>
                         </div>
                         
                    </>
               }
          >
               <div className="row g-2 mb-3">
                    {tiles.map((tile) => (
                         <div className="col-6 col-md-2" key={tile.label}>
                              <div className="border rounded p-4">
                                   <h4 >{tile.label}</h4>
                                   <h3 className="fw-bold">{money(tile.value)}</h3>
                              </div>
                         </div>
                    ))}
               </div>

               {reconcile && (
                    <div className={`alert py-2 ${outOfBalance ? "alert-danger" : "alert-success"}`}>
                         Subledger {money(reconcile.subledger)} vs control account {money(reconcile.generalLedger)}
                         {outOfBalance ? (
                              <strong className="ms-2">out by {money(reconcile.difference)}</strong>
                         ) : (
                              <span className="ms-2">reconciled</span>
                         )}
                    </div>
               )}

               {view === "balances" ? (
                    <PrimeTable column={balanceColumns} data={balances} filtering isExpoerted handleSeverSideProcessing={undefined} />
               ) : (
                    <PrimeTable column={agingColumns} data={aging?.rows || []} filtering isExpoerted handleSeverSideProcessing={undefined} />
               )}
          </ReportShell>
     );
}
