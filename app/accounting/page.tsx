"use client";
import {
     RiArrowRightLine,
     RiCheckboxCircleLine,
     RiErrorWarningLine,
     RiBookletLine,
     RiCalendarCheckLine,
     RiFileList3Line,
     RiPulseLine,
     RiQuillPenLine,
     RiScales3Line,
     RiWallet3Line,
     RiStackLine,
     RiLineChartLine,
} from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AccountingSummary from "../../components/accounting/AccountingSummary";
import { currencyFormatter } from "../../components/Auth/customFetch";
import { accountingApi, FinancialOverview, OutboxHealth } from "../../lib/accounting/accountingApi";
import styles from "./page.module.css";

export default function AccountingOverviewPage() {
     const today = dayjs().format("YYYY-MM-DD");
     const yearStart = dayjs(`${dayjs().year()}-01-01`).format("YYYY-MM-DD");

     const [health, setHealth] = useState<OutboxHealth | null>(null);
     const [overview, setOverview] = useState<FinancialOverview | null>(null);
     const [balanced, setBalanced] = useState(true);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          let cancelled = false;

          (async () => {
               try {
                    const [healthRes, overviewRes] = await Promise.all([
                         accountingApi.outboxHealth(),
                         accountingApi.financialOverview(today),
                    ]);

                    if (cancelled) return;

                    setHealth(healthRes?.result || null);
                    setOverview(overviewRes?.result || null);
                    setBalanced(Math.abs(overviewRes?.result?.position?.balanceDifference || 0) < 0.01);
               } finally {
                    if (!cancelled) setLoading(false);
               }
          })();

          return () => {
               cancelled = true;
          };
     }, [today, yearStart]);

     const performance = overview?.performance;
     const position = overview?.position;
     const money = (value?: number) => loading ? "..." : currencyFormatter.format(value || 0);

     const needsAttention = (health?.failed || 0) + (health?.deadLetter || 0) > 0 || !balanced;

     return (
          <div className={styles.page}>
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
                    <div>
                         <div className={styles.eyebrow}><RiBookletLine size={15} /> Financial workspace</div>
                         <h1 className="mb-1">Accounting overview</h1>
                         <p className="text-muted mb-0">A live view of this year&apos;s financial position and posting activity.</p>
                    </div>
                    <div className={styles.period}><RiCalendarCheckLine size={16} /> As at {dayjs(today).format("D MMM YYYY")} · {overview?.period.code || dayjs(today).format("YYYY-MM")}</div>
               </div>

               {needsAttention && (
                    <div className={`${styles.attention} d-flex align-items-center justify-content-between gap-3`}>
                         <span className="d-flex align-items-center gap-2">
                              <RiErrorWarningLine size={20} />
                              {!balanced
                                   ? "The ledger is out of balance for this range."
                                   : "Some postings have not reached the ledger."}
                         </span>
                         <Link href="/accounting/posting-health" className="btn btn-sm btn-outline-dark">
                              Posting health
                         </Link>
                    </div>
               )}

               <AccountingSummary
                    rowClassName="row g-3 mb-4"
                    columnClassName="col-12 col-sm-6 col-xl-3"
                    metrics={[
                         { label: "Today's revenue", value: money(performance?.today.revenue), Icon: RiLineChartLine, variant: "primary", subtitle: "Click to drill down", href: "/accounting/income-statement" },
                         { label: "Today's expenses", value: money(performance?.today.expenses), Icon: RiWallet3Line, variant: "warning", subtitle: "Click to drill down", href: "/accounting/income-statement" },
                         { label: "Today's profit", value: money(performance?.today.profit), Icon: RiScales3Line, variant: (performance?.today.profit || 0) < 0 ? "danger" : "success", subtitle: "Click to drill down", href: "/accounting/income-statement" },
                         { label: "Cash & bank", value: money(position?.cashAndBank), Icon: RiWallet3Line, variant: "info", subtitle: "Click to drill down", href: "/accounting/balance-sheet" },
                    ]}
               />

               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className={styles.panel}>
                              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Trend</span><h2>Revenue, expenses and profit by month</h2></div><RiLineChartLine size={23} /></div>
                              <div className="p-4">
                                   {(overview?.trend.periods || []).length === 0 ? <span className="text-muted">No monthly activity recorded yet.</span> : overview?.trend.periods.map((period, index) => {
                                        const revenue = overview.trend.revenue[index] || 0;
                                        const expenses = overview.trend.expenses[index] || 0;
                                        const profit = overview.trend.profit[index] || 0;
                                        const scale = Math.max(revenue, expenses, Math.abs(profit), 1);
                                        return <div className="row align-items-center g-2 mb-3" key={period}><div className="col-2 col-md-1 small text-muted">{dayjs(`${period}-01`).format("MMM")}</div><div className="col-10 col-md-11"><div className="small">Revenue {money(revenue)} · Expenses {money(expenses)} · Profit {money(profit)}</div><div className="progress" style={{ height: 7 }}><div className="progress-bar bg-success" style={{ width: `${Math.min(100, revenue / scale * 100)}%` }} /></div><div className="progress mt-1" style={{ height: 7 }}><div className="progress-bar bg-warning" style={{ width: `${Math.min(100, expenses / scale * 100)}%` }} /></div></div></div>;
                                   })}
                                   <small className="text-muted">Green shows revenue; amber shows expenses. Profit is shown in the line above each month.</small>
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row g-3 mb-4">
                    {[
                         ["Month to date", performance?.monthToDate, "/accounting/income-statement"],
                         ["Year to date", performance?.yearToDate, "/accounting/income-statement"],
                    ].map(([label, values, href]: any) => (
                         <div className="col-12 col-lg-6" key={label}>
                              <div className={styles.panel}>
                                   <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Financial performance</span><h2>{label}</h2></div><RiLineChartLine size={23} /></div>
                                   <div className="row g-3 p-4">
                                        {[['Revenue', values?.revenue], ['Expenses', values?.expenses], ['Net profit', values?.profit]].map(([name, value]: any) => <Link href={href} className="col-4 text-decoration-none text-reset" key={name}><div className={styles.queueValue}>{money(value)}</div><div className={styles.queueLabel}>{name}</div></Link>)}
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>

               <div className="row g-3 mb-4">
                    <div className="col-12 col-lg-7">
                         <div className={styles.panel}>
                              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Financial position</span><h2>What the company has and owes</h2></div><RiWallet3Line size={23} /></div>
                              <div className="p-4">
                                   {[['Cash', position?.cash, '/accounting/balance-sheet'], ['Bank', position?.bank, '/accounting/bank-accounts'], ['Accounts receivable', position?.receivables, '/accounting/receivables'], ['Inventory', position?.inventory, '/accounting/inventory/valuation'], ['Fixed assets', position?.fixedAssets, '/accounting/balance-sheet'], ['Total assets', position?.totalAssets, '/accounting/balance-sheet'], ['Total liabilities', position?.totalLiabilities, '/accounting/balance-sheet'], ['Equity', position?.equity, '/accounting/balance-sheet'], ['Net assets', position?.netAssets, '/accounting/balance-sheet']].map(([label, value, href]: any) => <Link href={href} key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom text-decoration-none text-reset"><span>{label}</span><strong>{money(value)}</strong></Link>)}
                              </div>
                         </div>
                    </div>
                    <div className="col-12 col-lg-5">
                         <div className={styles.panel}>
                              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Working capital</span><h2>Amounts still to settle</h2></div><RiStackLine size={23} /></div>
                              <div className="p-4">
                                   {[['Receivables', position?.receivables, position?.overdueReceivables, '/accounting/receivables'], ['Payables', position?.payables, position?.overduePayables, '/accounting/payables']].map(([label, value, overdue, href]: any) => <Link href={href} key={label} className="d-block py-3 border-bottom text-decoration-none text-reset"><div className="d-flex justify-content-between"><span>{label}</span><strong>{money(value)}</strong></div><small className="text-muted">{money(overdue)} overdue</small></Link>)}
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row g-3">
                    <div className="col-12 col-lg-6">
                         <div className={styles.panel}>
                              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Explore</span><h2>Financial reports</h2></div><RiScales3Line size={23} /></div>
                              <div className={styles.reportList}>
                                   {[
                                        { label: "Trial Balance", description: "Verify debits and credits", href: "/accounting/trial-balance" },
                                        { label: "Profit & Loss", description: "Review income and expenses", href: "/accounting/income-statement" },
                                        { label: "Balance Sheet", description: "See assets and liabilities", href: "/accounting/balance-sheet" },
                                        { label: "General Ledger", description: "Trace every posted entry", href: "/accounting/general-ledger" },
                                   ].map((item) => (
                                        <Link
                                             key={item.href}
                                             href={item.href}
                                             className={styles.reportItem}
                                        >
                                             <span><strong>{item.label}</strong><small>{item.description}</small></span>
                                             <RiArrowRightLine size={18} />
                                        </Link>
                                   ))}
                              </div>
                         </div>
                    </div>

                    <div className="col-12 col-lg-6">
                         <div className={styles.panel}>
                              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>System control</span><h2>Posting queue</h2></div><RiPulseLine size={23} /></div>
                              <div className="p-4">
                                   {loading || !health ? (
                                        <div className="text-muted">Loading posting activity...</div>
                                   ) : (
                                        <div className="row g-3">
                                             <div className="col-4">
                                                  <div className={styles.queueValue}>{health.pending}</div>
                                                  <div className={styles.queueLabel}>Pending</div>
                                             </div>
                                             <div className="col-4">
                                                  <div className={`${styles.queueValue} ${health.failed ? "text-warning" : ""}`}>{health.failed}</div>
                                                  <div className={styles.queueLabel}>Failed</div>
                                             </div>
                                             <div className="col-4">
                                                  <div className={`${styles.queueValue} ${health.deadLetter ? "text-danger" : ""}`}>{health.deadLetter}</div>
                                                  <div className={styles.queueLabel}>Dead letter</div>
                                             </div>
                                             <div className={`${styles.queueStatus} col-12`}>
                                                  <span className="d-inline-flex align-items-center gap-2 text-muted small">
                                                       {health.deadLetter === 0 && health.failed === 0 ? (
                                                            <RiCheckboxCircleLine size={16} />
                                                       ) : (
                                                            <RiErrorWarningLine size={16} />
                                                       )}
                                                       {health.oldestPendingMinutes === null
                                                            ? "Queue is empty"
                                                            : `Oldest waiting ${health.oldestPendingMinutes} min`}
                                                  </span>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>
               <div className="d-flex flex-wrap gap-2 mt-4">
                    <Link href="/accounting/manual-journals/new" className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2"><RiQuillPenLine size={16} /> New journal</Link>
                    <Link href="/accounting/periods" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"><RiFileList3Line size={16} /> Manage periods</Link>
               </div>
          </div>
     );
}
