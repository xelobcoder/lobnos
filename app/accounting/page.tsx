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
} from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { currencyFormatter } from "../../components/Auth/customFetch";
import { accountingApi, OutboxHealth } from "../../lib/accounting/accountingApi";
import styles from "./page.module.css";

export default function AccountingOverviewPage() {
     const today = dayjs().format("YYYY-MM-DD");
     const yearStart = dayjs(`${dayjs().year()}-01-01`).format("YYYY-MM-DD");

     const [health, setHealth] = useState<OutboxHealth | null>(null);
     const [netProfit, setNetProfit] = useState(0);
     const [revenue, setRevenue] = useState(0);
     const [receivables, setReceivables] = useState(0);
     const [payables, setPayables] = useState(0);
     const [balanced, setBalanced] = useState(true);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          let cancelled = false;

          (async () => {
               try {
                    const [healthRes, plRes, arRes, apRes, tbRes] = await Promise.all([
                         accountingApi.outboxHealth(),
                         accountingApi.incomeStatement(yearStart, today),
                         accountingApi.receivableAging(today),
                         accountingApi.payableAging(today),
                         accountingApi.trialBalance(yearStart, today),
                    ]);

                    if (cancelled) return;

                    setHealth(healthRes?.result || null);
                    setNetProfit(plRes?.result?.totals?.netProfit || 0);
                    setRevenue(plRes?.result?.totals?.revenue || 0);
                    setReceivables(arRes?.result?.totals?.total || 0);
                    setPayables(apRes?.result?.totals?.total || 0);
                    setBalanced(tbRes?.result?.totals?.balanced ?? true);
               } finally {
                    if (!cancelled) setLoading(false);
               }
          })();

          return () => {
               cancelled = true;
          };
     }, [today, yearStart]);

     const cards = [
          { label: "Revenue", detail: "Year to date", value: revenue, href: "/accounting/income-statement", tone: styles.revenue },
          { label: "Net profit", detail: "Year to date", value: netProfit, href: "/accounting/income-statement", tone: styles.profit },
          { label: "Receivables", detail: "Outstanding", value: receivables, href: "/accounting/receivables", tone: styles.receivables },
          { label: "Payables", detail: "Outstanding", value: payables, href: "/accounting/payables", tone: styles.payables },
     ];

     const needsAttention = (health?.failed || 0) + (health?.deadLetter || 0) > 0 || !balanced;

     return (
          <div className={styles.page}>
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
                    <div>
                         <div className={styles.eyebrow}><RiBookletLine size={15} /> Financial workspace</div>
                         <h1 className="mb-1">Accounting overview</h1>
                         <p className="text-muted mb-0">A live view of this year&apos;s financial position and posting activity.</p>
                    </div>
                    <div className={styles.period}><RiCalendarCheckLine size={16} /> {dayjs(yearStart).format("D MMM YYYY")} - {dayjs(today).format("D MMM YYYY")}</div>
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

               <div className="row g-3 mb-4">
                    {cards.map((card) => (
                         <div className="col-12 col-sm-6 col-xl-3" key={card.label}>
                              <Link href={card.href} className={`${styles.metric} ${card.tone} text-decoration-none h-100`}>
                                   <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                             <div className={styles.metricLabel}>{card.label}</div>
                                             <div className={styles.metricDetail}>{card.detail}</div>
                                        </div>
                                        <RiArrowRightLine size={17} />
                                        <div className="fs-4 fw-bold mt-4">
                                             {loading ? "..." : currencyFormatter.format(card.value)}
                                        </div>
                                   </div>
                              </Link>
                         </div>
                    ))}
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
