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

interface Props {
     ledger: "AR" | "AP";
     title: string;
     subtitle: string;
     partyLabel: string;
}

export default function SubledgerReport({ ledger, title, subtitle, partyLabel }: Props) {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [documentFrom, setDocumentFrom] = useState(dayjs().format("YYYY-MM-DD"));
     const [documentTo, setDocumentTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [report, setReport] = useState<OutstandingDocuments | null>(null);
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(25);
     const [searchInput, setSearchInput] = useState("");
     const [search, setSearch] = useState("");
     const [dateOrder, setDateOrder] = useState("desc");
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          setError(null);
          try {
               const filters = { page, count, sortby: `documentDate:${dateOrder}`, search, from: documentFrom, to: documentTo };
               const response = ledger === "AR"
                    ? await accountingApi.outstandingReceivables(filters)
                    : await accountingApi.payableAging(asOf, filters);

               if (requestId !== latestRequest.current) return;
               if (!response?.result || response.status !== "success") {
                    throw new Error(response?.message || "Unable to load outstanding documents");
               }
               setReport(response.result);
          } catch (requestError: any) {
               if (requestId === latestRequest.current) setError(requestError?.message || "Unable to load outstanding documents");
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [ledger, asOf, documentFrom, documentTo, page, count, search, dateOrder]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     // The screen shows one page; the PDF lists every outstanding document matching the filters.
     const getPdfSpec = async () => {
          const { fetchAllPages, EXPORT_MAX_ROWS } = await import("../reports/reportPdf");
          let totalOutstanding = 0;
          let totalDocuments = 0;
          const { rows, truncated } = await fetchAllPages<OutstandingDocuments["rows"][number]>(async (p, c) => {
               const filters = { page: p, count: c, sortby: `documentDate:${dateOrder}`, search, from: documentFrom, to: documentTo };
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
                              row.partyName || `${row.partyType} #${row.partyId ?? "unknown"}`,
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
                    const name = row.original.partyName || `${row.original.partyType} #${row.original.partyId ?? "unknown"}`;
                    const identity = [row.original.patientIdentifier, row.original.partyId ? `Record ${row.original.partyId}` : null]
                         .filter(Boolean)
                         .join(" · ");
                    const content = (
                         <span className="d-flex flex-column">
                              <span className="fw-semibold">{name}</span>
                              {identity && <small className="text-muted">{identity}</small>}
                         </span>
                    );
                    if (!row.original.partyId) return content;
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

     const tiles: AccountingSummaryMetric[] = [
          { label: "Total Outstanding", value: money(report?.totals.total || 0), Icon: RiMoneyDollarCircleLine, variant: "primary", subtitle: "Matching open balances" },
          { label: "Outstanding Documents", value: Number(report?.total || 0).toLocaleString(), Icon: RiFileList3Line, variant: "info", subtitle: "Matching unpaid documents" },
     ];

     return (
          <ReportShell basis="accrual"
               title={title}
               subtitle={subtitle}
               range={formatRange(documentFrom, documentTo)}
               getPdfSpec={getPdfSpec}
               actions={<button type="button" className="btn btn-sm btn-outline-secondary" onClick={load} title="Refresh outstanding documents" aria-label="Refresh outstanding documents"><RiRefreshLine size={18} /></button>}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => {
                                        setDocumentFrom(start);
                                        setDocumentTo(end);
                                        setAsOf(end);
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
               <AccountingSummary
                    metrics={tiles}
                    columnClassName="col-12 col-sm-6 col-xl-3"
               />
               {loading && <div className="small text-muted mb-2" role="status">Updating outstanding documents...</div>}
               {error && <div className="alert alert-danger" role="alert">{error}</div>}

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
          </ReportShell>
     );
}
