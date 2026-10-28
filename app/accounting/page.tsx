"use client";
import {
     RiArrowRightLine,
     RiErrorWarningLine,
     RiBookletLine,
     RiCalendarCheckLine,
     RiPulseLine,
     RiQuillPenLine,
     RiScales3Line,
     RiWallet3Line,
     RiLineChartLine,
} from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AccountingExpenseChart from '../../components/accounting/AccountingExpenseChart';
import AccountingTrendChart from '../../components/accounting/AccountingTrendChart';
import AccountingBalanceChart from '../../components/accounting/AccountingBalanceChart';
import CompanySnapshot from '../../components/accounting/CompanySnapshot';
import AccountingAccountAnalysis from '../../components/accounting/AccountingAccountAnalysis';
import ExportPdfButton from "../../components/reports/ExportPdfButton";
import { currencyFormatter } from "../../components/Auth/customFetch";
import { accountingApi, FinancialOverview, OutboxHealth } from "../../lib/accounting/accountingApi";
import styles from "./page.module.css";

export default function AccountingOverviewPage() {
     const today = dayjs().format("YYYY-MM-DD");
     const yearStart = dayjs(`${dayjs().year()}-01-01`).format("YYYY-MM-DD");

     const [performancePeriod,setPerformancePeriod]=useState<'today'|'monthToDate'|'yearToDate'>('monthToDate');
     const [error, setError] = useState("");
     const [reload, setReload] = useState(0);
     const [health, setHealth] = useState<OutboxHealth | null>(null);
     const [overview, setOverview] = useState<FinancialOverview | null>(null);
     const [balanced, setBalanced] = useState(true);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          let cancelled = false;
          setLoading(true); setError("");

          (async () => {
               try {
                    const [healthRes, overviewRes] = await Promise.all([
                         accountingApi.outboxHealth(),
                         accountingApi.financialOverview(today),
                    ]);

                    if (cancelled) return;

                    if (!overviewRes?.result || overviewRes.status !== "success") throw new Error("Unable to load the accounting overview.");
                    setHealth(healthRes?.result || null);
                    setOverview(overviewRes?.result || null);
                    setBalanced(Math.abs(overviewRes?.result?.position?.balanceDifference || 0) < 0.01);
               } catch { if (!cancelled) { setError("The accounting overview could not be loaded. Retry to see the latest balances."); setOverview(null); } } finally {
                    if (!cancelled) setLoading(false);
               }
          })();

          return () => {
               cancelled = true;
          };
     }, [today, yearStart, reload]);

     const performance = overview?.performance;
     const position = overview?.position;
     const money = (value?: number) => loading ? "…" : !overview ? "—" : currencyFormatter.format(value || 0);

     const needsAttention = (health?.pending || 0) + (health?.failed || 0) + (health?.deadLetter || 0) > 0 || !balanced;

     return (
          <div className={styles.page} aria-busy={loading}>
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
                    <div>
                         <div className={styles.eyebrow}><RiBookletLine size={15} /> Financial workspace</div>
                         <h1 className="mb-1">Accounting overview</h1>
                         <p className="text-muted mb-0">A live view of this year&apos;s financial position and posting activity.</p>
                    </div>
                    <div className="d-flex flex-column align-items-lg-end gap-2">
                         <ExportPdfButton
                              title="Accounting Overview"
                              subtitle="Financial performance and position"
                              period={`As at ${dayjs(today).format("D MMM YYYY")} · ${overview?.period.code || dayjs(today).format("YYYY-MM")}`}
                              getSpec={() => {
                                   if (!overview) throw new Error("Overview not loaded");
                                   const m = (v?: number) => currencyFormatter.format(v || 0);
                                   const perf = overview.performance;
                                   const pos = overview.position;
                                   return {
                                        notes: [balanced ? "Ledger balance check: PASS" : `Ledger balance check: FAIL (difference ${m(pos.balanceDifference)})`],
                                        tables: [
                                             {
                                                  heading: "Financial performance",
                                                  head: ["Period", "Revenue", "Expenses", "Net profit"],
                                                  body: [
                                                       ["Today", m(perf.today.revenue), m(perf.today.expenses), m(perf.today.profit)],
                                                       ["Month to date", m(perf.monthToDate.revenue), m(perf.monthToDate.expenses), m(perf.monthToDate.profit)],
                                                       ["Year to date", m(perf.yearToDate.revenue), m(perf.yearToDate.expenses), m(perf.yearToDate.profit)],
                                                  ],
                                             },
                                             {
                                                  heading: "Monthly trend",
                                                  head: ["Month", "Revenue", "Expenses", "Profit"],
                                                  body: overview.trend.periods.map((p, i) => [dayjs(`${p}-01`).format("MMM YYYY"), m(overview.trend.revenue[i]), m(overview.trend.expenses[i]), m(overview.trend.profit[i])]),
                                             },
                                             {
                                                  heading: "Financial position",
                                                  head: ["Item", "Amount"],
                                                  body: [
                                                       ["Cash", m(pos.cash)], ["Bank", m(pos.bank)], ["Accounts receivable", m(pos.receivables)], ["Inventory", m(pos.inventory)], ["Fixed assets", m(pos.fixedAssets)],
                                                       [{ content: "Total assets", bold: true }, { content: m(pos.totalAssets), bold: true }],
                                                       [{ content: "Total liabilities", bold: true }, { content: m(pos.totalLiabilities), bold: true }],
                                                       ["Equity", m(pos.equity)],
                                                       [{ content: "Net assets", bold: true }, { content: m(pos.netAssets), bold: true }],
                                                  ],
                                             },
                                             {
                                                  heading: "Working capital",
                                                  head: ["Item", "Outstanding", "Overdue"],
                                                  body: [["Receivables", m(pos.receivables), m(pos.overdueReceivables)], ["Payables", m(pos.payables), m(pos.overduePayables)]],
                                             },
                                             ...(health ? [{
                                                  heading: "Posting queue",
                                                  head: ["Pending", "Failed", "Dead letter", "Oldest waiting"],
                                                  body: [[String(health.pending), String(health.failed), String(health.deadLetter), health.oldestPendingMinutes === null ? "Queue is empty" : `${health.oldestPendingMinutes} min`]],
                                             }] : []),
                                        ],
                                   };
                              }}
                         />
                         <div className={styles.period}><RiCalendarCheckLine size={16} /> As at {dayjs(today).format("D MMM YYYY")} · {overview?.period.code || dayjs(today).format("YYYY-MM")}</div>
                    </div>
               </div>

               {error && <div role="alert" className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2"><span>{error}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setReload(value=>value+1)}>Retry overview</button></div>}
               <div className={styles.quickActions}><Link href="/accounting/manual-journals/new" className="btn btn-primary btn-sm"><RiQuillPenLine size={16} aria-hidden="true" /> New journal</Link><Link href="/accounting/bank-reconciliation" className="btn btn-outline-secondary btn-sm">Reconcile bank</Link><Link href="/accounting/reports" className="btn btn-outline-secondary btn-sm">Reports centre</Link><Link href="/accounting/cash-flow-forecast" className="btn btn-outline-secondary btn-sm">Forecast cash flow</Link><Link href="/accounting/periods" className="btn btn-outline-secondary btn-sm">Review periods</Link></div>
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

               <CompanySnapshot overview={overview} loading={loading}/>
               <div className="row g-3 mb-3">{[['Total receivables',position?.receivables,position?.overdueReceivables,'/accounting/receivables'],['Total payables',position?.payables,position?.overduePayables,'/accounting/payables']].map(([label,value,overdue,href]:any)=><div className="col-12 col-md-6" key={label}><Link href={href} className={styles.commitmentCard}><div><span>{label}</span><strong>{money(value)}</strong></div><small>{money(overdue)} overdue · Posted company balances</small></Link></div>)}</div>

               <div className="row g-3 mb-4">
                    <div className="col-12 col-xl-8">
                         <div className={styles.panel}>
                              <div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Trend</span><h2>Revenue, expenses and profit by month</h2></div><RiLineChartLine size={23} /></div>
                              {loading?<p className="p-4 text-muted" role="status">Loading monthly activity…</p>:overview?.trend.periods.length?<AccountingTrendChart trend={overview.trend}/>:<p className="p-4 text-muted">{error?'Monthly activity is unavailable.':'No monthly activity recorded yet.'}</p>}

                         </div>
                    </div>
                    <div className="col-12 col-xl-4"><section className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.sectionKicker}>Spending</span><h2>Where expenses go</h2></div><RiWallet3Line size={23}/></div>{loading?<p className="p-4 text-muted">Loading expenses…</p>:overview?<AccountingExpenseChart rows={overview.expenseBreakdown||[]} from={yearStart} to={today}/>:<p className="p-4 text-muted">Expense breakdown is unavailable.</p>}</section></div>
               </div>

               <div className={styles.financialGrid}>
                    <section className={styles.panel} aria-labelledby="performance-title">
                         <div className={styles.compactHeader}>
                              <div><h2 id="performance-title">Financial performance</h2><p>Income and costs compared across periods</p></div>
                              <div><label className="visually-hidden" htmlFor="performance-period">Performance period</label><select id="performance-period" className={`form-select form-select-sm ${styles.periodSelect}`} value={performancePeriod} onChange={event=>setPerformancePeriod(event.target.value as 'today'|'monthToDate'|'yearToDate')}><option value="today">Today</option><option value="monthToDate">Month to date</option><option value="yearToDate">Year to date</option></select></div>
                         </div>
                         <AccountingBalanceChart label="Profit and loss chart" available={!loading&&!!overview} rows={[
                              {label:'Revenue',value:performance?.[performancePeriod].revenue,href:`/accounting/income-statement?from=${performancePeriod==='today'?today:performancePeriod==='monthToDate'?dayjs(today).startOf('month').format('YYYY-MM-DD'):yearStart}&to=${today}`,color:'var(--accounting-accent,var(--theme-accent,#18866a))'},
                              {label:'Expenses',value:performance?.[performancePeriod].expenses,href:`/accounting/income-statement?from=${performancePeriod==='today'?today:performancePeriod==='monthToDate'?dayjs(today).startOf('month').format('YYYY-MM-DD'):yearStart}&to=${today}`,color:'#d29625'},
                              {label:'Net profit',value:performance?.[performancePeriod].profit,href:`/accounting/income-statement?from=${performancePeriod==='today'?today:performancePeriod==='monthToDate'?dayjs(today).startOf('month').format('YYYY-MM-DD'):yearStart}&to=${today}`,color:'#276eb7'},
                         ]}/>
                         <details className={styles.periodComparison}><summary>Compare month and year figures</summary>
                         <div className={styles.comparisonWrap}>
                              <table className={styles.comparison}>
                                   <caption className="visually-hidden">Month-to-date and year-to-date financial performance, accrual basis</caption>
                                   <thead><tr><th scope="col">Accrual basis</th><th scope="col">Month to date<small>{dayjs(today).format("MMM YYYY")}</small></th><th scope="col">Year to date<small>{dayjs(today).format("YYYY")}</small></th></tr></thead>
                                   <tbody>{[
                                        {label:'Revenue',key:'revenue'},
                                        {label:'Expenses',key:'expenses'},
                                        {label:'Net profit',key:'profit'},
                                   ].map(({label,key})=><tr key={key} className={key==='profit'?styles.profitRow:undefined}>
                                        <th scope="row">{label}</th>
                                        {[performance?.monthToDate,performance?.yearToDate].map((values,index)=><td key={index}><Link
                                             href={`/accounting/income-statement?from=${index===0?dayjs(today).startOf('month').format('YYYY-MM-DD'):yearStart}&to=${today}`}
                                             aria-label={`${label}, ${index===0?'month':'year'} to date: ${money(values?.[key as 'revenue'|'expenses'|'profit'])}. View profit and loss.`}
                                             className={Number(values?.[key as 'revenue'|'expenses'|'profit'])<0?styles.negative:undefined}
                                        >{money(values?.[key as 'revenue'|'expenses'|'profit'])}</Link></td>)}
                                   </tr>)}</tbody>
                              </table>
                         </div></details>
                    </section>

                    <section className={styles.panel} aria-labelledby="position-title">
                         <div className={styles.compactHeader}>
                              <div><h2 id="position-title">Financial position</h2><p>Posted balances as at {dayjs(today).format('D MMM YYYY')}</p></div>
                              <Link href="/accounting/balance-sheet" className={styles.textAction}>Balance sheet <RiArrowRightLine size={16} aria-hidden="true" /></Link>
                         </div>
                         <AccountingBalanceChart label="Financial position chart" available={!loading&&!!overview} rows={[
                              {label:'Total assets',value:position?.totalAssets,href:'/accounting/balance-sheet',color:'#276eb7'},
                              {label:'Total liabilities',value:position?.totalLiabilities,href:'/accounting/balance-sheet',color:'#d29625'},
                              {label:'Net assets',value:position?.netAssets,href:'/accounting/balance-sheet',color:'var(--accounting-accent,var(--theme-accent,#18866a))'},
                         ]}/>
                         <div className={styles.positionDetails}>{[
                              {label:'Cash',value:position?.cash,href:'/accounting/balance-sheet'},
                              {label:'Bank',value:position?.bank,href:'/accounting/bank-accounts'},
                              {label:'Receivables',value:position?.receivables,href:'/accounting/receivables'},
                              {label:'Inventory',value:position?.inventory,href:'/accounting/inventory/valuation'},
                              {label:'Fixed assets',value:position?.fixedAssets,href:'/accounting/balance-sheet'},
                              {label:'Equity',value:position?.equity,href:'/accounting/balance-sheet'},
                         ].map(({label,value,href})=><Link key={label} href={href}><span>{label}</span><strong className={Number(value)<0?styles.negative:undefined}>{money(value)}</strong></Link>)}</div>
                    </section>
               </div>

               {overview&&<AccountingAccountAnalysis overview={overview}/>}
               <section className={`${styles.panel} ${styles.toolsPanel}`} aria-labelledby="tools-title">
                    <div className={styles.compactHeader}><div><h2 id="tools-title">Reports & planning</h2><p>Go straight to the task you need</p></div><Link href="/accounting/reports" className={styles.textAction}>All reports <RiArrowRightLine size={16} aria-hidden="true" /></Link></div>
                    <div className={styles.toolGroups}>{[
                         {title:'Financial reports',links:[['Trial balance','/accounting/trial-balance'],['Profit & loss','/accounting/income-statement'],['Balance sheet','/accounting/balance-sheet'],['General ledger','/accounting/general-ledger']]},
                         {title:'Planning & payments',links:[['Budgets versus actuals','/accounting/budgets'],['Recurring expenses','/accounting/recurring-expenses'],['Bills & payments','/accounting/bills'],['Cash-flow forecast','/accounting/cash-flow-forecast']]},
                    ].map(group=><nav key={group.title} aria-label={group.title}><h3>{group.title}</h3><div className={styles.toolLinks}>{group.links.map(([label,href])=><Link key={href} href={href}>{label}<RiArrowRightLine size={15} aria-hidden="true" /></Link>)}</div></nav>)}</div>
               </section>

               <div className={styles.postingStrip} role="status">
                    <div><RiPulseLine size={18} aria-hidden="true" /><strong>Posting status</strong><span>{loading?'Checking…':!health?'Unavailable':(health.pending+health.failed+health.deadLetter)===0?'All entries posted':`${health.pending} pending · ${health.failed} failed · ${health.deadLetter} dead letter`}</span></div>
                    <Link href="/accounting/posting-health">{health&&(health.pending+health.failed+health.deadLetter)===0?'View posting history':'Review posting queue'} <RiArrowRightLine size={15} aria-hidden="true" /></Link>
               </div>

          </div>
     );
}
