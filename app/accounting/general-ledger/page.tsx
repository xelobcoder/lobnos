"use client";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PrimeTable from "../../../components/accounting/AccountingTable";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../../lib/accounting/accountingApi";

const MODULES = ["billing", "expense", "inventory", "supplier", "payroll", "commission", "manual"];

export default function GeneralLedgerPage() {
     const searchParams = useSearchParams();
     const currentYear = dayjs().year();

     // drill-through links from the statements arrive as ?accountCode=&from=&to=
     const [from, setFrom] = useState(searchParams.get("from") || dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(searchParams.get("to") || dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState(searchParams.get("from") ? "Custom Range" : "This Year");
     const [accountCode, setAccountCode] = useState(searchParams.get("accountCode") || "");
     const [sourceModule, setSourceModule] = useState(searchParams.get("sourceModule") || "");
     const [rows, setRows] = useState<any[]>([]);
     const [total, setTotal] = useState(0);
     const latestRequest = useRef(0);
     const [view,setView]=useState(searchParams.get('view')==='summary'?'summary':(searchParams.get('accountCode')||searchParams.get('view')==='transactions')?'transactions':'summary');
     const [summary,setSummary]=useState<any>(null),[summaryError,setSummaryError]=useState('');
     useEffect(()=>{let cancelled=false;setSummary(null);setSummaryError('');accountingApi.generalLedgerSummary({from,to,accountCode:accountCode||undefined,sourceModule:sourceModule||undefined}).then(response=>{if(response.status!=='success')throw new Error(response.message||'Unable to load account totals');if(!cancelled)setSummary(response.result);}).catch(error=>{if(!cancelled)setSummaryError(error.message);});return()=>{cancelled=true;};},[from,to,accountCode,sourceModule]);

     const handleSeverSideProcessing =
          async ({
               page,
               count,
               sortby,
               overrides,
          }: {
               page: number;
               count: number;
               sortby?: string;
               overrides?: { accountCode?: string; sourceModule?: string };
          }) => {
               try {
                    const response = await accountingApi.generalLedger({
                         from,
                         to,
                         accountCode: (overrides?.accountCode ?? accountCode) || undefined,
                         sourceModule: (overrides?.sourceModule ?? sourceModule) || undefined,
                         page: page,
                         count: count,
                         sortby,
                    });

                    const data = response?.result?.data || [];
                    return { result: data, total: response?.result?.total || 0, error: false };
               } catch (error: any) {
                    console.error("Error fetching general ledger data:", error);
                    return { result: [], total: 0, error: true };
               }
          }



     const clientSideProcessing =
          async ({
               page,
               count,
               sortby,
               overrides,
          }: {
               page: number;
               count: number;
               sortby?: string;
               overrides?: { accountCode?: string; sourceModule?: string };
          }) => {
               const requestId = ++latestRequest.current;
               try {
                    const response = await accountingApi.generalLedger({
                         from,
                         to,
                         accountCode: (overrides?.accountCode ?? accountCode) || undefined,
                         sourceModule: (overrides?.sourceModule ?? sourceModule) || undefined,
                         page: page || 1,
                         count: count || 10,
                         sortby,
                    });

                    const data = response?.result?.data || [];
                    if (requestId !== latestRequest.current) return;
                    setTotal(response?.result?.total || 0);
                    setRows(data);
               } catch (error: any) {
                    console.error("Error fetching general ledger data:", error);
                    return { result: [], total: 0 };
               }
          };


     useEffect(() => {
          clientSideProcessing({ page: 1, count: 10 });
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [from, to, accountCode, sourceModule]);

     const column = [
          {
               Header: "Date",
               accessor: "occurred_at",
               Cell: ({ value }: any) => <span className="text-nowrap">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          {
               Header: "Entry",
               accessor: "journal_entry_id",
               Cell: ({ row }: any) => (
                    <div>

                         <span className="badge bg-light text-dark text-capitalize fw-bold">{row.original.transaction_type}</span>
                    </div>
               ),
          },
          {
               Header: "Account",
               accessor: "account_code",
               Cell: ({ row }: any) => (
                    <div className="text-uppercase fw-bold">
                         <div >{row.original.account_code}</div>
                         {row.original.account_name}
                    </div>
               ),
          },
          {
               Header: "Source",
               accessor: "source_module",
               Cell: ({ row }: any) => (
                    <div className="text-uppercase fw-bold">
                         <div >{row.original.source_module}</div>
                         <small className="text-muted">
                              {row.original.source_ref || row.original.source_pk}
                         </small>
                    </div>
               ),
          },
          { Header: "Description", accessor: "description", Cell: ({ value }: any) => value || "-" },
          {
               Header: "Debit",
               accessor: "amount",
               Cell: ({ row }: any) => (
                    <span className="bg-light text-dark px-2 py-1 rounded d-inline-block">
                         {row.original.direction === "debit" ? currencyFormatter.format(Number(row.original.amount)) : "-"}
                    </span>
               ),
          },
          {
               Header: "Credit",
               accessor: "direction",
               Cell: ({ row }: any) => (
                    <span className="bg-light text-dark px-2 py-1 rounded d-inline-block">
                         {row.original.direction === "credit" ? currencyFormatter.format(Number(row.original.amount)) : "-"}
                    </span>
               ),
          },
     ];

     return (
          <ReportShell
               title="General Ledger"
               subtitle={view==='summary'?"Opening balances, period activity and closing balances by account":`${total} posted journal lines`}
               range={formatRange(from, to)}
               filters={
                    <>
                         <div className="col-12 col-md-4">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }}
                                   label="Period"
                                   className="w-100"
                                   disabled={false}
                              />
                         </div>
                         <div className="col-6 col-md-3">
                              <label className="form-label mb-1 small text-muted">Account</label>
                              <input
                                   type="text"
                                   className="form-control custom-input"
                                   placeholder="e.g. acc-1002"
                                   value={accountCode}
                                   onChange={(e) => setAccountCode(e.target.value.trim())}
                              />
                         </div>
                         <div className="col-6 col-md-3">
                              <label className="form-label mb-1 small text-muted">Module</label>
                              <select className="form-select custom-select" value={sourceModule} onChange={(e) => setSourceModule(e.target.value)}>
                                   <option value="">All modules</option>
                                   {MODULES.map((module) => (
                                        <option key={module} value={module}>{module}</option>
                                   ))}
                              </select>
                         </div>
                         {/* <div className="col-12 col-md-2">
                              <button
                                   className="btn btn-sm btn-primary w-100"
                                   onClick={() => handleSeverSideProcessing({ page: 1, count: 25 })}
                              >
                                   Apply
                              </button>
                         </div> */}
                    </>
               }
          >
               {(accountCode || sourceModule) && (
                    <div className="alert alert-info py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                         <span>
                              Filtered to
                              {accountCode && <strong className="ms-1">account {accountCode}</strong>}
                              {accountCode && sourceModule && <span> and</span>}
                              {sourceModule && <strong className="ms-1 text-capitalize">{sourceModule}</strong>}
                              <span className="ms-1">
                                   between {dayjs(from).format("D MMM YYYY")} and {dayjs(to).format("D MMM YYYY")}.
                              </span>
                         </span>
                         <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                   setAccountCode("");
                                   setSourceModule("");
                                   handleSeverSideProcessing({ page: 1, count: 25, overrides: { accountCode: "", sourceModule: "" } });
                              }}
                         >
                              Clear filters
                         </button>
                    </div>
               )}

               <div className="d-flex gap-2 mb-3" role="group" aria-label="Ledger view"><button className={`btn btn-sm ${view==='summary'?'btn-primary':'btn-outline-secondary'}`} aria-pressed={view==='summary'} onClick={()=>setView('summary')}>Account summary</button><button className={`btn btn-sm ${view==='transactions'?'btn-primary':'btn-outline-secondary'}`} aria-pressed={view==='transactions'} onClick={()=>setView('transactions')}>Transactions</button></div>
               {view==='summary'?<>{summaryError?<div role="alert" className="alert alert-danger">{summaryError}</div>:!summary?<p role="status">Loading account balances…</p>:<div className="table-responsive"><table className="table align-middle"><caption>Balances follow each account’s normal debit or credit side. Select an account to review its transactions.</caption><thead><tr><th>Account</th><th>Normal side</th><th className="text-end">Opening balance</th><th className="text-end">Debit</th><th className="text-end">Credit</th><th className="text-end">Closing balance</th></tr></thead><tbody>{summary.rows.map((row:any)=><tr key={row.accountCode}><td><button className="btn btn-link text-start p-0" onClick={()=>{setAccountCode(row.accountCode);setView('transactions');}}>{row.accountName}</button><small className="d-block text-muted">{row.accountCode}</small></td><td>{row.normalBalance}</td>{[row.openingBalance,row.debits,row.credits,row.closingBalance].map((amount,index)=><td className="text-end text-nowrap" key={index}>{currencyFormatter.format(amount)}</td>)}</tr>)}{!summary.rows.length&&<tr><td colSpan={6}>No posted activity or opening balances in this selection.</td></tr>}</tbody><tfoot><tr><th colSpan={3}>Period totals</th><th className="text-end">{currencyFormatter.format(summary.totals.debits)}</th><th className="text-end">{currencyFormatter.format(summary.totals.credits)}</th><td/></tr></tfoot></table></div>}</>:<PrimeTable
                    column={column}
                    data={rows}
                    filtering
                    isExpoerted
                    serverSideFiltering
                    handleSeverSideProcessing={handleSeverSideProcessing}
               />}
          </ReportShell>
     );
}
