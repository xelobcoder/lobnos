"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../../lib/accounting/accountingApi";

const CATEGORY_LABELS: Record<string, string> = {
     operating: "Operating Activities",
     investing: "Investing Activities",
     financing: "Financing Activities",
     unclassified: "Awaiting classification",
};

export default function CashFlowPage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [method,setMethod]=useState<'direct'|'indirect'>('indirect');
     const [error,setError]=useState('');
     const [statement, setStatement] = useState<any>(null);
     const [loading, setLoading] = useState(false);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);setError('');setStatement(null);
          try {
               const response = await accountingApi.cashFlow(from, to, method);
               if(response?.status!=='success')throw new Error(response?.message||'Unable to load cash flow');
               if (requestId === latestRequest.current) setStatement(response.result);
          } catch(error:any) { if(requestId===latestRequest.current)setError(error.message); } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [from, to, method]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));
     const totals = statement?.totals;

     return (
          <ReportShell basis="cash-flow"
               title="Cash Flow Statement"
               subtitle={method==='indirect'?"Net income reconciled to operating cash, with investing and financing activities":"Direct method, built from entries that actually moved cash or bank"}
               reportTitle="Cash Flow Statement"
               range={formatRange(from, to)}
               filters={
                    <>
                         <div className="col-12 col-md-4"><label className="form-label" htmlFor="cash-method">Presentation</label><select id="cash-method" className="form-select" value={method} onChange={e=>setMethod(e.target.value as 'direct'|'indirect')}><option value="indirect">Indirect — reconcile net income</option><option value="direct">Direct — cash receipts & payments</option></select></div>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }}
                                   label="Period"
                                   className="w-100"
                              />
                         </div>
                    </>
               }
          >
               {error&&<div className="alert alert-danger" role="alert">{error}<button className="btn btn-sm btn-outline-danger ms-3" onClick={load}>Retry report</button></div>}
               {loading&&<p role="status">Loading cash flow statement…</p>}
               {(statement?.classificationIssues || []).map((issue: any) => <CashFlowClassification key={issue.journalEntryId} issue={issue} onSaved={load} />)}
               {statement?.reconciliation?.balanced === false && <div role="alert" className="alert alert-danger">Cash flow does not reconcile to the ledger. Difference: {money(statement.reconciliation.difference)}. Resolve the underlying journals before finalizing financial reports.</div>}
               {statement&&<div className="table-responsive">
                    <table className="table align-middle mb-0">
                         <tbody>
                              <tr className="table-light"><th>Beginning cash balance</th><th className="text-end">{loading||!statement?'—':money(totals?.openingCash)}</th></tr>
                              {method==='indirect'&&statement?.indirect&&<IndirectOperating statement={statement.indirect} total={totals?.operating||0} from={from} to={to}/>}

                              {(method==='indirect'?["investing", "financing",...(totals?.unclassified?["unclassified"]:[])]:["operating", "investing", "financing",...(totals?.unclassified?["unclassified"]:[])]).map((category) => {
                                   const lines = (statement?.lines || []).filter((line: any) => line.category === category);
                                   const subtotal = totals?.[category] || 0;

                                   return (
                                        <React.Fragment key={category}>
                                             <tr className="table-secondary">
                                                  <td colSpan={2} className="fw-semibold">{CATEGORY_LABELS[category]}</td>
                                             </tr>
                                             {lines.length === 0 && (
                                                  <tr>
                                                       <td className="text-muted small ps-4">No movement</td>
                                                       <td />
                                                  </tr>
                                             )}
                                             {lines.map((line: any) => (
                                                  <tr key={`${category}-${line.accountCode}`}>
                                                       <td className="ps-4">
                                                            <span className="text-muted me-2">{line.accountCode}</span>
                                                            {line.accountName}
                                                       </td>
                                                       <td className={`text-end ${line.amount < 0 ? "text-danger" : ""}`}>{money(line.amount)}</td>
                                                  </tr>
                                             ))}
                                             <tr className="border-top">
                                                  <td className="fw-semibold ps-4">Net cash from {CATEGORY_LABELS[category].toLowerCase()}</td>
                                                  <td className={`text-end fw-semibold ${subtotal < 0 ? "text-danger" : ""}`}>{money(subtotal)}</td>
                                             </tr>
                                        </React.Fragment>
                                   );
                              })}

                              <tr className="table-light">
                                   <td className="fw-semibold">Net movement in cash</td>
                                   <td className={`text-end fw-semibold ${(totals?.netMovement || 0) < 0 ? "text-danger" : ""}`}>
                                        {statement?money(totals?.netMovement || 0):'—'}
                                   </td>
                              </tr>
                              <tr className="table-light">
                                   <td className="fw-semibold">Cash at end of period</td>
                                   <td className="text-end fw-semibold">{statement?money(totals?.closingCash || 0):'—'}</td>
                              </tr>
                         </tbody>
                    </table>
               </div>}
               <p className="small text-muted mt-3">Amounts in {currencyFormatter.resolvedOptions().currency}. Based on posted journals; unclassified movements and reconciliation differences remain visible.</p>
          </ReportShell>
     );
}

function CashFlowClassification({ issue, onSaved }: { issue: { journalEntryId: number; amount: number }; onSaved: () => Promise<void> }) {
     const [values, setValues] = useState({ operating: "", investing: "", financing: "" });
     const [busy, setBusy] = useState(false), [error, setError] = useState("");
     const total = Object.values(values).reduce((sum, value) => sum + Math.round(Number(value || 0) * 100), 0);
     const valid = Object.values(values).every(value => value === "" || /^-?\d+(?:\.\d{1,2})?$/.test(value)) && total === Math.round(issue.amount * 100);
     const save = async () => {
          setBusy(true);setError("");
          try {
               const response: any = await accountingApi.classifyCashFlow(issue.journalEntryId, { operating: Number(values.operating || 0), investing: Number(values.investing || 0), financing: Number(values.financing || 0) });
               if (response?.status !== "success") throw new Error(response?.message || "Unable to save classification");
               await onSaved();
          } catch (error: any) { setError(error.message || "Unable to save classification"); } finally { setBusy(false); }
     };
     return <details className="alert alert-warning"><summary>Journal #{issue.journalEntryId}: classify {currencyFormatter.format(issue.amount)} of cash movement</summary><p className="mt-2 mb-2">This compound journal includes cash and non-cash entries. Allocate the actual cash movement below; use negative amounts for cash outflows. Saving requires your existing journal posting authority and does not change the journal.</p><div className="row g-2 align-items-end">{(["operating","investing","financing"] as const).map(category=><div className="col-md-3" key={category}><label className="form-label" htmlFor={`cash-${issue.journalEntryId}-${category}`}>{CATEGORY_LABELS[category]}</label><input id={`cash-${issue.journalEntryId}-${category}`} className="form-control" type="number" step="0.01" value={values[category]} onChange={event=>setValues({...values,[category]:event.target.value})}/></div>)}<div className="col-md-3"><button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={save}>{busy?"Saving…":"Save classification"}</button></div></div>{error&&<p className="text-danger mt-2 mb-0" role="alert">{error}</p>}</details>;
}

function IndirectOperating({statement:s,total,from,to}:any){const money=(n:number)=>currencyFormatter.format(n||0);return <><tr className="table-secondary"><th colSpan={2}>Cash flow from operating activities</th></tr><tr><td className="ps-4"><a href={`/accounting/income-statement?from=${from}&to=${to}`}>Net income</a></td><td className="text-end">{money(s.netIncome)}</td></tr>{[['Non-cash adjustments',s.adjustments,s.adjustmentsTotal],['Changes in working capital',s.workingCapital,s.workingCapitalTotal]].map(([label,rows,subtotal]:any)=><React.Fragment key={label}><tr><th colSpan={2} className="ps-4">{label}</th></tr>{rows.map((r:any)=><tr key={r.accountCode}><td className="ps-5"><a href={`/accounting/general-ledger?accountCode=${r.accountCode}&from=${from}&to=${to}`}>{r.accountName}</a></td><td className="text-end">{money(r.amount)}</td></tr>)}<tr><td className="ps-4">{label} total</td><td className="text-end">{money(subtotal)}</td></tr></React.Fragment>)}{!!s.reclassifications.length&&<><tr><th className="ps-4">Investing, financing and other non-cash reclassifications</th><th className="text-end">{money(s.reclassificationsTotal)}</th></tr><tr><td colSpan={2}><details className="ms-4"><summary>Review source journal adjustments ({s.reclassifications.length})</summary><p className="small text-muted">Adjustments remove non-operating or non-cash effects from net income and working capital. Unclassified cash journals require review above.</p>{s.reclassifications.map((r:any)=><div className="d-flex justify-content-between gap-3 border-bottom py-2" key={r.journalEntryId}><a href={`/accounting/general-ledger?view=transactions&from=${String(r.date).slice(0,10)}&to=${String(r.date).slice(0,10)}`}>Journal #{r.journalEntryId} · {r.description||'Journal adjustment'}</a><span>{money(r.amount)}</span></div>)}</details></td></tr></>}<tr className="border-top table-light"><th>Net cash provided by operating activities</th><th className="text-end">{money(total)}</th></tr></>;}
