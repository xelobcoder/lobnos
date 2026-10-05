"use client";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell from "../../../components/accounting/ReportShell";
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
               subtitle={`${total} posted journal lines`}
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

               <PrimeTable
                    column={column}
                    data={rows}
                    filtering
                    isExpoerted
                    serverSideFiltering
                    handleSeverSideProcessing={handleSeverSideProcessing}
               />
          </ReportShell>
     );
}
