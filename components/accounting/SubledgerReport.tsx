"use client";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PrimeTable from "./AccountingTable";
import ReportShell, { formatRange } from "./ReportShell";
import { currencyFormatter } from "../Auth/customFetch";
import DateFilterReusable from "../operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, OutstandingDocuments } from "../../lib/accounting/accountingApi";
import { RiFileList3Line, RiMoneyDollarCircleLine, RiRefreshLine } from "@remixicon/react";
import AccountingSummary, { AccountingSummaryMetric } from "./AccountingSummary";
import { payerDisplay } from "../../lib/accounting/nhis";

interface Props {
     ledger: "AR" | "AP";
     title: string;
     subtitle: string;
     partyLabel: string;
}

export default function SubledgerReport({ ledger, title, subtitle, partyLabel }: Props) {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [documentFrom, setDocumentFrom] = useState("");
     const [documentTo, setDocumentTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("All");
     const [report, setReport] = useState<OutstandingDocuments | null>(null);
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(25);
     const [searchInput, setSearchInput] = useState("");
     const [search, setSearch] = useState("");
     const [dateOrder, setDateOrder] = useState("desc");
     const [payerType, setPayerType] = useState<"" | "nhis" | "patient" | "mixed">("");
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const latestRequest = useRef(0);
     const context = JSON.stringify([ledger, asOf, documentFrom, documentTo, page, count, search, dateOrder, payerType]);
     const [loadedContext, setLoadedContext] = useState("");
     const ready = !!report && !loading && !error && loadedContext === context;

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          setError(null);
          setReport(null);
          try {
               const filters = { page, count, sortby: `documentDate:${dateOrder}`, search, from: documentFrom, to: documentTo, ...(ledger === "AR" && payerType ? { payerType } : {}) };
               const response = ledger === "AR"
                    ? await accountingApi.outstandingReceivables(filters)
                    : await accountingApi.payableAging(asOf, filters);

               if (requestId !== latestRequest.current) return;
               if (!response?.result || response.status !== "success" || !Array.isArray(response.result.rows) ||
                    !Number.isFinite(Number(response.result.totals?.total)) || !Number.isSafeInteger(Number(response.result.total))) {
                    throw new Error(response?.message || "Unable to load outstanding documents");
               }
               setReport(response.result);
               setLoadedContext(context);
          } catch (requestError: any) {
               if (requestId === latestRequest.current) setError(requestError?.message || "Unable to load outstanding documents");
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [ledger, asOf, documentFrom, documentTo, page, count, search, dateOrder, payerType, context]);

     useEffect(() => {
          void load();
          return () => { latestRequest.current++; };
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     // The screen shows one page; the PDF lists every outstanding document matching the filters.
     const getPdfSpec = async () => {
          if (!ready) throw new Error("Wait for the selected outstanding documents to finish loading.");
          const { fetchAllPages, EXPORT_MAX_ROWS } = await import("../reports/reportPdf");
          let totalOutstanding = 0;
          let totalDocuments = 0;
          const { rows, truncated } = await fetchAllPages<OutstandingDocuments["rows"][number]>(async (p, c) => {
               const filters = { page: p, count: c, sortby: `documentDate:${dateOrder}`, search, from: documentFrom, to: documentTo, ...(ledger === "AR" && payerType ? { payerType } : {}) };
               const response: any = ledger === "AR"
                    ? await accountingApi.outstandingReceivables(filters)
                    : await accountingApi.payableAging(asOf, filters);
               if (!response?.result || response.status !== "success") throw new Error(response?.message || "Unable to load outstanding documents");
               totalOutstanding = Number(response.result.totals?.total || 0);
               totalDocuments = Number(response.result.total || 0);
               return response.result.rows || [];
          });
          const notes = [`Total outstanding ${money(totalOutstanding)} across ${totalDocuments.toLocaleString()} document(s).`];
          if (truncated) notes.push(`Export limited to the first ${EXPORT_MAX_ROWS.toLocaleString()} documents. Narrow the filters to export the rest.`);
          return {
               notes,
               tables: [
                    {
                         head: [partyLabel, "Identifier", "Reference", "Date", "Outstanding"],
                         body: rows.map((row) => [
                              ledger === "AR" ? payerDisplay(row) : row.partyName || `${row.partyType} #${row.partyId ?? "unknown"}`,
                              [row.patientIdentifier, row.partyId ? `Record ${row.partyId}` : null].filter(Boolean).join(" · "),
                              row.reference || "",
                              row.documentDate ? dayjs(row.documentDate).format("DD MMM YYYY") : "",
                              money(row.total),
                         ]),
                         foot: truncated ? [] : [["Total", "", "", "", money(totalOutstanding)]],
                    },
               ],
          };
     };

     const documentColumns = [
          {
               Header: partyLabel,
               accessor: "partyName",
               Cell: ({ row }: any) => {
                    const name = ledger === "AR" ? payerDisplay(row.original) : row.original.partyName || `${row.original.partyType} #${row.original.partyId ?? "unknown"}`;
                    const identity = [row.original.patientIdentifier, row.original.partyId ? `Record ${row.original.partyId}` : null]
                         .filter(Boolean)
                         .join(" · ");
                    const content = (
                         <span className="d-flex flex-column">
                              <span className="fw-semibold">{name}</span>
                              {ledger === "AR" && row.original.patientName && <small className="text-muted">Patient: {row.original.patientName}</small>}
                              {identity && <small className="text-muted">{identity}</small>}
                         </span>
                    );
                    if (ledger === "AR" && (row.original.partyType === "nhis" || row.original.classification === "nhis")) {
                         return <Link className="text-decoration-none" href="/accounting/nhis">{content}<small className="d-block">NHIS workspace / remittance</small></Link>;
                    }
                    if (!row.original.partyId || row.original.classification === "mixed") return content;
                    return (
                         <Link className="text-decoration-none" href={`/accounting/statements/${ledger}/${row.original.partyType}/${row.original.partyId}`}>
                              {content}
                         </Link>
                    );
               },
          },
          { Header: "Reference", accessor: "reference" },
          {
               Header: "Date",
               accessor: "documentDate",
               Cell: ({ value }: any) => <span className="text-nowrap">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          { Header: "Outstanding", accessor: "total", Cell: ({ value }: any) => <span className="d-block text-end fw-semibold">{money(value)}</span> },
     ];
     if (ledger === "AR") documentColumns.splice(3, 0,
          { Header: "Received (cash only)", accessor: "payerPaid", Cell: ({ value }: any) => <span>{value == null ? "—" : money(value)}</span> },
          { Header: "NHIS settled (cash + noncash)", accessor: "nhisSettledAmount", Cell: ({ value }: any) => <span>{value == null ? "—" : money(value)}</span> });

     const tiles: AccountingSummaryMetric[] = [
          { label: "Total Outstanding", value: money(report?.totals.total || 0), Icon: RiMoneyDollarCircleLine, variant: "primary", subtitle: "Matching open balances" },
          { label: "Outstanding Documents", value: Number(report?.total || 0).toLocaleString(), Icon: RiFileList3Line, variant: "info", subtitle: "Matching unpaid documents" },
     ];

     return (
          <ReportShell basis="accrual"
               exportable={ready}
               title={title}
               subtitle={subtitle}
               range={documentFrom ? formatRange(documentFrom, documentTo) : `All open documents through ${dayjs(documentTo).format("D MMM YYYY")}`}
               getPdfSpec={getPdfSpec}
               actions={<button type="button" className="btn btn-sm btn-outline-secondary" onClick={load} title="Refresh outstanding documents" aria-label="Refresh outstanding documents"><RiRefreshLine size={18} /></button>}
               filters={
                    <>
                         {ledger === "AR" && <div className="col-12 col-md-6">
                              <label htmlFor="receivables-payer" className="form-label">Payer classification</label>
                              <select id="receivables-payer" className="form-select" value={payerType} onChange={event => { setPayerType(event.target.value as typeof payerType); setPage(1); }}>
                                   <option value="">All payers</option><option value="patient">Patient</option><option value="nhis">NHIS</option><option value="mixed">Mixed (review required)</option>
                              </select>
                              <Link href="/accounting/nhis" className="d-inline-block mt-2">NHIS remittances, adjustments and audit history</Link>
                         </div>}
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => {
                                        setDocumentFrom(start);
                                        const cutoff = end || dayjs().format("YYYY-MM-DD");
                                        setDocumentTo(cutoff);
                                        setAsOf(cutoff);
                                        setPage(1);
                                   }}
                                   label="Document date"
                                   className="w-100"
                              />
                         </div>
                         <div className="col-6 col-md-3">
                              <label htmlFor="document-date-order" className="form-label mb-1 small text-muted">Date order</label>
                              <select id="document-date-order" className="form-select" value={dateOrder} onChange={(event) => { setDateOrder(event.target.value); setPage(1); }}>
                                   <option value="desc">Newest first</option>
                                   <option value="asc">Oldest first</option>
                              </select>
                         </div>
                         <div className="col-12 col-lg-6">
                              <label htmlFor="subledger-search" className="form-label mb-1 small text-muted">Find {partyLabel.toLowerCase()} or document</label>
                              <div className="input-group">
                                   <input
                                        id="subledger-search"
                                        className="form-control"
                                        type="search"
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        onKeyDown={(event) => {
                                             if (event.key === "Enter") {
                                                  setPage(1);
                                                  setSearch(searchInput.trim());
                                             }
                                        }}
                                        placeholder="Name, record ID, identifier or reference"
                                   />
                                   <button className="btn btn-outline-primary" type="button" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>
                                        Search
                                   </button>
                              </div>
                         </div>
                    </>
               }
          >
               {!ready && !error && <div className="small text-muted mb-2" role="status">Updating outstanding documents...</div>}
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {ready && <>
               {ledger === "AR" && <p className="small text-muted">NHIS is the payer; patient details identify the service recipient. Mixed bills require review. This general report is tenant-scoped; the NHIS workspace rechecks active-branch eligibility. NHIS settled includes noncash adjustments and write-offs, not just receipts.</p>}
               {ledger === "AR" && report?.totals.byPayer && <div className="d-flex flex-wrap gap-3 mb-3" aria-label="All-result outstanding by payer">
                    <span>NHIS: {money(report.totals.byPayer.nhis)}</span><span>Patient: {money(report.totals.byPayer.patient)}</span><span>Mixed: {money(report.totals.byPayer.mixed)}</span>
               </div>}
               <AccountingSummary
                    metrics={tiles}
                    columnClassName="col-12 col-sm-6 col-xl-3"
               />

               <PrimeTable column={documentColumns} data={report?.rows || []} isExpoerted handleSeverSideProcessing={undefined} />
               {(() => {
                    const total = report?.total || 0;
                    const pageCount = Math.max(1, Math.ceil(total / count));
                    const firstRow = total === 0 ? 0 : (page - 1) * count + 1;
                    const lastRow = Math.min(page * count, total);
                    return (
                         <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                              <small className="text-muted">Showing {firstRow}-{lastRow} of {total}</small>
                              <div className="d-flex align-items-center gap-2">
                                   <label htmlFor="subledger-page-size" className="small text-muted mb-0">Rows</label>
                                   <select id="subledger-page-size" className="form-select form-select-sm" style={{ width: 76 }} value={count} onChange={(event) => { setCount(Number(event.target.value)); setPage(1); }}>
                                        {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                                   </select>
                                   <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>Previous</button>
                                   <span className="small text-nowrap">Page {page} of {pageCount}</span>
                                   <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>Next</button>
                              </div>
                         </div>
                    );
               })()}
               </>}
          </ReportShell>
     );
}
