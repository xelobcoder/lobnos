"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../../lib/accounting/accountingApi";

const MODULES = ["billing", "expense", "inventory", "supplier", "payroll", "commission", "manual"];

export default function GeneralLedgerPage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [accountCode, setAccountCode] = useState("");
     const [sourceModule, setSourceModule] = useState("");
     const [rows, setRows] = useState<any[]>([]);
     const [total, setTotal] = useState(0);

     // PrimeTable drives paging: it hands back page/count and expects { result }.
     const handleSeverSideProcessing = useCallback(
          async ({ page, count }: { page: number; count: number }) => {
               const response = await accountingApi.generalLedger({
                    from,
                    to,
                    accountCode: accountCode || undefined,
                    sourceModule: sourceModule || undefined,
                    page: page || 1,
                    count: count || 25,
               });

               const data = response?.result?.data || [];
               setTotal(response?.result?.total || 0);
               setRows(data);
               return { result: data };
          },
          [from, to, accountCode, sourceModule]
     );

     useEffect(() => {
          handleSeverSideProcessing({ page: 1, count: 25 });
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

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
                         <div className="fw-semibold">#{row.original.journal_entry_id}</div>
                         <span className="badge bg-light text-dark text-capitalize">{row.original.transaction_type}</span>
                    </div>
               ),
          },
          {
               Header: "Account",
               accessor: "account_code",
               Cell: ({ row }: any) => (
                    <div>
                         <div className="text-muted small">{row.original.account_code}</div>
                         {row.original.account_name}
                    </div>
               ),
          },
          {
               Header: "Source",
               accessor: "source_module",
               Cell: ({ row }: any) => (
                    <div>
                         <div className="text-capitalize">{row.original.source_module}</div>
                         <small className="text-muted">
                              {row.original.source_table}#{row.original.source_ref || row.original.source_pk}
                         </small>
                    </div>
               ),
          },
          { Header: "Description", accessor: "description", Cell: ({ value }: any) => value || "-" },
          {
               Header: "Debit",
               accessor: "amount",
               Cell: ({ row }: any) => (
                    <span className="d-block text-end">
                         {row.original.direction === "debit" ? currencyFormatter.format(Number(row.original.amount)) : "-"}
                    </span>
               ),
          },
          {
               Header: "Credit",
               accessor: "direction",
               Cell: ({ row }: any) => (
                    <span className="d-block text-end">
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
                                   className="form-control form-control-sm"
                                   placeholder="e.g. acc-1002"
                                   value={accountCode}
                                   onChange={(e) => setAccountCode(e.target.value.trim())}
                              />
                         </div>
                         <div className="col-6 col-md-3">
                              <label className="form-label mb-1 small text-muted">Module</label>
                              <select className="form-select form-select-sm" value={sourceModule} onChange={(e) => setSourceModule(e.target.value)}>
                                   <option value="">All modules</option>
                                   {MODULES.map((module) => (
                                        <option key={module} value={module}>{module}</option>
                                   ))}
                              </select>
                         </div>
                         <div className="col-12 col-md-2">
                              <button
                                   className="btn btn-sm btn-primary w-100"
                                   onClick={() => handleSeverSideProcessing({ page: 1, count: 25 })}
                              >
                                   Apply
                              </button>
                         </div>
                    </>
               }
          >
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
