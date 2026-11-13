"use client";

import PharmacyReportCharts from "./PharmacyReportCharts";
import Link from "next/link";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import accountingStyles from "../accounting/components/AccountingWorkspace.module.css";
import purchasing from "./PharmacyPurchasing.module.css";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import {
     RiArrowLeftRightLine,
     RiBankLine,
     RiBarChartBoxLine,
     RiCalendarCloseLine,
     RiDashboardLine,
     RiExchangeDollarLine,
     RiFileList3Line,
     RiLineChartLine,
     RiMedicineBottleLine,
     RiPieChart2Line,
     RiScales3Line,
     RiShoppingCart2Line,
     RiTruckLine,
} from "@remixicon/react";
import { customFetch } from "../../../components/Auth/customFetch";
import {
     styles,
     money,
     dateLabel,
     usePharmacyAccess,
     usePharmacyResource,
     Message,
     Empty,
     Tabs,
} from "./PharmacyWorkspace";

const icon = (Icon: typeof RiDashboardLine) => <Icon size={16} />;
const operationalReports = [
     { id: "overview", label: "Overview", icon: icon(RiDashboardLine) },
     { id: "sales", label: "Sales & margins", icon: icon(RiLineChartLine) },
     { id: "inventory", label: "Stock & replenishment", icon: icon(RiMedicineBottleLine) },
     { id: "expiry", label: "Batch expiry", icon: icon(RiCalendarCloseLine) },
     { id: "procurement", label: "Purchase orders", icon: icon(RiShoppingCart2Line) },
     { id: "suppliers", label: "Supplier performance", icon: icon(RiTruckLine) },
     { id: "movements", label: "Stock movements", icon: icon(RiArrowLeftRightLine) },
];
const accountingReports = [
     { id: "finance", label: "Account activity", icon: icon(RiBarChartBoxLine) },
     { id: "profit_loss", label: "Profit & loss", icon: icon(RiPieChart2Line) },
     { id: "balance_sheet", label: "Balance sheet", icon: icon(RiScales3Line) },
     { id: "cash_flow", label: "Cash flow", icon: icon(RiExchangeDollarLine) },
     { id: "trial_balance", label: "Trial balance", icon: icon(RiBankLine) },
     { id: "transactions", label: "Journal transactions", icon: icon(RiFileList3Line) },
];
const stockReports = new Set(["inventory", "expiry", "procurement", "movements"]);
const number = new Intl.NumberFormat("en-GH", { maximumFractionDigits: 3 });

function csvCell(value: unknown) {
     let text = value == null ? "" : String(value);
     if (typeof value === "string" && /^[\s=+\-@]/.test(text)) text = "'" + text;
     return '"' + text.replaceAll('"', '""') + '"';
}

export default function PharmacyReportsWorkspace({ accounting = false }: { accounting?: boolean }) {
     const access = usePharmacyAccess();
     const params = useSearchParams();
     const reports = accounting ? accountingReports : operationalReports;
     const defaultReport = accounting ? "profit_loss" : access.finance ? "overview" : "inventory";
     const requestedReport = params.get("report");
     const [report, setReport] = useState(
          reports.some((item) => item.id === requestedReport) ? requestedReport! : defaultReport,
     );
     const [page, setPage] = useState(1);
     const [count, setCount] = useState(25);
     const today = new Date().toISOString().slice(0, 10);
     const [from, setFrom] = useState(() => new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
     const [to, setTo] = useState(today);
     const [datePreset, setDatePreset] = useState("Custom Range");
     const [search, setSearch] = useState(params.get("search") || "");
     const [filters, setFilters] = useState({ from, to, search: params.get("search") || "" });
     const [error, setError] = useState("");
     const [exporting, setExporting] = useState(false);
     const [printing, setPrinting] = useState(false);
     const endpoint = accounting ? "pharmacy/accounting/reports" : "pharmacy/analytics";
     const query = new URLSearchParams({ ...filters, report, page: String(page), count: String(count) });
     const resource = usePharmacyResource(`${endpoint}?${query.toString()}`);
     const data = resource.data;
     const format = (value: any, type?: string) =>
          value == null
               ? "—"
               : type === "money"
                 ? money(Number(value))
                 : type === "number"
                   ? number.format(Number(value))
                   : type === "date"
                     ? dateLabel(value)
                     : String(value);

     const apply = (event: FormEvent) => {
          event.preventDefault();
          if (!from || !to || from > to) {
               setError("Choose a complete date range with the start date on or before the end date");
               return;
          }
          setError("");
          setFilters({ from, to, search: search.trim() });
          setPage(1);
     };

     const download = async () => {
          if (exporting) return;
          setExporting(true);
          setError("");
          try {
               const exportQuery = new URLSearchParams({ ...filters, report, all: "true" });
               const response = await customFetch(`${endpoint}?${exportQuery.toString()}`);
               if (!response?.success) throw new Error(response?.error?.message || "Unable to export this report");
               const result = response.data;
               const csv = [
                    result.columns.map((column: any) => csvCell(column.label)).join(","),
                    ...result.rows.map((row: any) =>
                         result.columns.map((column: any) => csvCell(row[column.key])).join(","),
                    ),
                    ...(result.totals
                         ? [
                                "",
                                ...Object.entries(result.totals).map(
                                     ([key, value]) => csvCell(key) + "," + csvCell(value),
                                ),
                           ]
                         : []),
               ].join("\r\n");
               const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
               const link = document.createElement("a");
               link.href = url;
               link.download = `${accounting ? "pharmacy-accounting" : "pharmacy"}-${report}-${filters.from}-${filters.to}.csv`;
               link.click();
               URL.revokeObjectURL(url);
          } catch (caught) {
               setError(caught instanceof Error ? caught.message : "Export failed");
          } finally {
               setExporting(false);
          }
     };

     const printReport = async () => {
          if (printing) return;
          const viewer = window.open("", "_blank");
          if (!viewer) {
               setError("Allow popups to print this report.");
               return;
          }
          setPrinting(true);
          setError("");
          try {
               const exportQuery = new URLSearchParams({ ...filters, report, all: "true" });
               const response = await customFetch(`${endpoint}?${exportQuery.toString()}`);
               if (!response?.success) throw new Error(response?.error?.message || "Unable to generate report");
               const result = response.data;
               const { default: jsPDF } = await import("jspdf");
               const { default: autoTable } = await import("jspdf-autotable");
               const pdf = new jsPDF({ orientation: "landscape" });
               const reportName = reports.find((item) => item.id === report)?.label || report;
               pdf.setFontSize(16);
               pdf.text(`${accounting ? "Pharmacy Accounting" : "Pharmacy"} - ${reportName}`, 14, 16);
               pdf.setFontSize(9);
               pdf.text(
                    `Branch ${result.branchId} | ${["balance_sheet", "trial_balance"].includes(report) ? `As at ${filters.to}` : `${filters.from} to ${filters.to}`}`,
                    14,
                    23,
               );
               const totals = result.totals
                    ? Object.entries(result.totals)
                           .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1")}: ${money(value)}`)
                           .join(" | ")
                    : "";
               const lines = pdf.splitTextToSize(totals, 265);
               if (totals) pdf.text(lines, 14, 29);
               autoTable(pdf, {
                    startY: totals ? 32 + lines.length * 4 : 28,
                    head: [result.columns.map((column: any) => column.label)],
                    body: result.rows.map((row: any) =>
                         result.columns.map((column: any) => format(row[column.key], column.format)),
                    ),
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [25, 60, 78] },
                    margin: { bottom: 15 },
               });
               for (let currentPage = 1; currentPage <= pdf.getNumberOfPages(); currentPage++) {
                    pdf.setPage(currentPage);
                    pdf.text(`Page ${currentPage} of ${pdf.getNumberOfPages()}`, 280, 202, { align: "right" });
               }
               pdf.autoPrint();
               const url = URL.createObjectURL(pdf.output("blob"));
               viewer.location.href = url;
               setTimeout(() => URL.revokeObjectURL(url), 60000);
          } catch (caught) {
               viewer.close();
               setError(caught instanceof Error ? caught.message : "Unable to print report");
          } finally {
               setPrinting(false);
          }
     };

     const metrics = data?.summary
          ? [
                 ...(access.finance && !accounting
                      ? [
                             { label: "Net sales", value: data.summary.netSales, currency: true },
                             {
                                  label: "Gross profit",
                                  value: Number(data.summary.bookRevenue) - Number(data.summary.costOfSales),
                                  currency: true,
                             },
                             { label: "Operating profit", value: data.summary.profit, currency: true },
                             { label: "Refunds", value: data.summary.refunds, currency: true },
                        ]
                      : []),
                 { label: "Stock at cost", value: data.summary.stockValue, currency: true },
                 { label: "Medicines to reorder", value: data.summary.reorderItems, currency: false },
                 { label: "Out of stock", value: data.summary.outOfStock, currency: false },
                 { label: "Medicines", value: data.summary.medicines, currency: false },
            ]
          : [];

     if (accounting && !access.finance) {
          return (
               <main className={styles.page}>
                    <h1>Pharmacy Accounting</h1>
                    <Empty>A pharmacy manager or pharmacy accountant role is required.</Empty>
               </main>
          );
     }

     return (
          <main className={`${styles.page} ${accountingStyles.page} ${purchasing.theme}`}>
               <header className={styles.header}>
                    <div>
                         <h1>{accounting ? "Pharmacy Accounting" : "Pharmacy analytics"}</h1>
                         <p>
                              {accounting
                                   ? "Financial statements, account activity and pharmacy journal transactions for the current branch."
                                   : "Operational sales, stock, purchasing and expiry insights for the current branch."}
                         </p>
                    </div>
                    <div className={styles.actions}>
                         <button
                              className="btn btn-outline-secondary"
                              disabled={resource.loading}
                              onClick={resource.refresh}
                         >
                              Refresh
                         </button>
                         <button
                              className="btn btn-outline-primary"
                              disabled={resource.loading || printing || !data}
                              onClick={printReport}
                         >
                              {printing ? "Generating..." : "Print / save PDF"}
                         </button>
                         <button
                              className="btn btn-primary"
                              disabled={resource.loading || exporting || !data}
                              onClick={download}
                         >
                              {exporting ? "Preparing export…" : "Export full report"}
                         </button>
                    </div>
               </header>
               <Message error={error || resource.error} />
               <form className={styles.card} onSubmit={apply}>
                    <div className="row g-3 align-items-end">
                         <div className="col-sm-6">
                              <label className="form-label" htmlFor="pharmacy-report-period">Date range</label>
                              <DateFilterReusable id="pharmacy-report-period" className="" label="Report date period" value={datePreset} startDate={from} endDate={to} onChange={setDatePreset} onDateRangeChange={(start,end)=>{setFrom(start);setTo(end);}}/>
                              <small className="text-muted">{from} to {to}</small>
                         </div>
                         <div className="col-sm-4">
                              <label className="form-label w-100">
                                   {accounting
                                        ? "Search reference, description or account"
                                        : "Find medicine, batch or supplier"}
                                   <input
                                        className="form-control"
                                        value={search}
                                        maxLength={100}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search report rows"
                                   />
                              </label>
                         </div>
                         <div className="col-sm-2">
                              <button className="btn btn-primary mb-2 w-100">Apply filters</button>
                         </div>
                    </div>
                    <p className={styles.muted + " mb-0 mt-2"}>
                         {accounting
                              ? "Financial statements use the current branch ledger. Balance sheet and trial balance are cumulative through the selected end date."
                              : "Stock and expiry show current balances. Sales, movements and purchasing use the selected dates; text search filters report rows."}
                    </p>
               </form>
               {metrics.length > 0 && (
                    <dl className={`${accountingStyles.summaryStrip} ${accountingStyles.compactStrip}`} aria-label="Report summary">
                         {metrics.map((metric) => (
                              <div key={metric.label}>
                                   <dt>{metric.label}</dt>
                                   <dd>
                                        {metric.currency
                                             ? money(Number(metric.value))
                                             : number.format(Number(metric.value))}
                                   </dd>
                              </div>
                         ))}
                    </dl>
               )}
               <Tabs
                    active={report}
                    onChange={(id) => {
                         setReport(id);
                         setPage(1);
                    }}
                    tabs={reports.filter((item) => accounting || access.finance || stockReports.has(item.id))}
               />
               {resource.loading ? (
                    <Empty>Loading report…</Empty>
               ) : (
                    data && (
                         <>
                              {data.totals && (
                                   <section className={styles.card}>
                                        <h2>{accounting ? "Statement totals" : "Report totals"}</h2>
                                        <dl className={`${accountingStyles.summaryStrip} ${accountingStyles.compactStrip} mb-2`} aria-label="Report totals">
                                             {Object.entries(data.totals).map(([key, value]) => (
                                                  <div key={key}>
                                                       <dt className="text-capitalize">{key.replace(/([A-Z])/g, " $1")}</dt>
                                                       <dd>{money(value)}</dd>
                                                  </div>
                                             ))}
                                        </dl>
                                        {accounting && (
                                             <p className={styles.muted}>
                                                  {["balance_sheet", "trial_balance"].includes(report)
                                                       ? `Cumulative pharmacy ledger through ${filters.to}. Opening balances are included; the start date does not limit this statement.`
                                                       : report === "cash_flow"
                                                         ? "Direct movements in pharmacy collection accounts. Internal transfers appear on both sides."
                                                         : "Pharmacy journal activity for the selected period."}
                                             </p>
                                        )}
                                        {accounting &&
                                             Object.entries(data.totals).some(
                                                  ([key, value]) =>
                                                       /difference|unclassified/i.test(key) &&
                                                       Math.abs(Number(value)) > 0.005,
                                             ) && (
                                                  <div className="alert alert-warning">
                                                       This statement contains an unreconciled difference or
                                                       unclassified account. Review the trial balance and journal
                                                       transactions before relying on these totals.
                                                  </div>
                                             )}
                                   </section>
                              )}
                              <PharmacyReportCharts report={report} data={data} />
                              <section className={styles.card}>
                                   <div className={styles.toolbar}>
                                        <h2>{reports.find((item) => item.id === report)?.label}</h2>
                                        <span className={styles.muted}>
                                             {data.total} row(s) · Updated {new Date(data.asOf).toLocaleString("en-GH")}
                                        </span>
                                   </div>
                                   {data.rows.length ? (
                                        <div className="table-responsive">
                                             <table className={styles.table}>
                                                  <thead>
                                                       <tr>
                                                            {data.columns.map((column: any) => (
                                                                 <th
                                                                      key={column.key}
                                                                      className={
                                                                           ["money", "number"].includes(column.format)
                                                                                ? styles.number
                                                                                : undefined
                                                                      }
                                                                 >
                                                                      {column.label}
                                                                 </th>
                                                            ))}
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {data.rows.map((row: any, index: number) => (
                                                            <tr key={index}>
                                                                 {data.columns.map((column: any) => (
                                                                      <td
                                                                           key={column.key}
                                                                           className={
                                                                                ["money", "number"].includes(
                                                                                     column.format,
                                                                                )
                                                                                     ? styles.number
                                                                                     : undefined
                                                                           }
                                                                      >
                                                                           {!accounting && report === "inventory" && column.key === "name" ? (
                                                                                <Link href={`/pharmacy/analytics/items/${encodeURIComponent(row.id)}`}>{row.name}</Link>
                                                                           ) : column.key === "status" ? (
                                                                                <span
                                                                                     className={
                                                                                          "badge " +
                                                                                          (row.status === "Expired"
                                                                                               ? "text-bg-danger"
                                                                                               : row.status ===
                                                                                                   "Expires within 90 days"
                                                                                                 ? "text-bg-warning"
                                                                                                 : "text-bg-light border")
                                                                                     }
                                                                                >
                                                                                     {row.status}
                                                                                </span>
                                                                           ) : (
                                                                                format(row[column.key], column.format)
                                                                           )}
                                                                      </td>
                                                                 ))}
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <Empty>No activity matches these filters.</Empty>
                                   )}
                                   {report !== "overview" && (
                                        <div className={styles.toolbar + " mt-3 mb-0"}>
                                             <label>
                                                  Rows{" "}
                                                  <select
                                                       className="form-select d-inline-block w-auto"
                                                       value={count}
                                                       onChange={(event) => {
                                                            setCount(Number(event.target.value));
                                                            setPage(1);
                                                       }}
                                                  >
                                                       {[25, 50, 100, 200].map((value) => (
                                                            <option key={value}>{value}</option>
                                                       ))}
                                                  </select>
                                             </label>
                                             <div className={styles.actions}>
                                                  <button
                                                       className="btn btn-outline-secondary"
                                                       disabled={page <= 1}
                                                       onClick={() => setPage((value) => value - 1)}
                                                  >
                                                       Previous
                                                  </button>
                                                  <span>
                                                       Page {page} of {data.totalPages}
                                                  </span>
                                                  <button
                                                       className="btn btn-outline-secondary"
                                                       disabled={page >= data.totalPages}
                                                       onClick={() => setPage((value) => value + 1)}
                                                  >
                                                       Next
                                                  </button>
                                             </div>
                                        </div>
                                   )}
                              </section>
                         </>
                    )
               )}
          </main>
     );
}
