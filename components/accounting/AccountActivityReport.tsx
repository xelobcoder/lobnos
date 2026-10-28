"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import PrimeTable from "./AccountingTable";
import ReportShell, { formatRange } from "./ReportShell";
import { currencyFormatter } from "../Auth/customFetch";
import DateFilterReusable from "../operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../lib/accounting/accountingApi";

interface Props {
     accountCode: string;
     title: string;
     subtitle: string;
}

/** Ledger activity for a single account, used by the inventory cost reports. */
export default function AccountActivityReport({ accountCode, title, subtitle }: Props) {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [rows, setRows] = useState<any[]>([]);
     const [total, setTotal] = useState(0);

     const handleSeverSideProcessing = useCallback(
          async ({ page, count }: { page: number; count: number }) => {
               const response = await accountingApi.generalLedger({
                    from,
                    to,
                    accountCode,
                    page: page || 1,
                    count: count || 25,
               });
               const data = response?.result?.data || [];
               setRows(data);
               setTotal(response?.result?.total || 0);
               return { result: data };
          },
          [accountCode, from, to]
     );

     useEffect(() => {
          handleSeverSideProcessing({ page: 1, count: 25 });
     }, [handleSeverSideProcessing]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     const column = [
          {
               Header: "Date",
               accessor: "occurred_at",
               Cell: ({ value }: any) => <span className="text-nowrap">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          {
               Header: "Source",
               accessor: "source_table",
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
               Header: "Amount",
               accessor: "amount",
               Cell: ({ row }: any) => (
                    <span className={`d-block text-end ${row.original.direction === "credit" ? "text-danger" : ""}`}>
                         {row.original.direction === "credit" ? `(${money(row.original.amount)})` : money(row.original.amount)}
                    </span>
               ),
          },
     ];

     return (
          <ReportShell
               title={title}
               subtitle={subtitle}
               reportTitle={title}
               range={formatRange(from, to)}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }} label="Period" className="w-100" />
                         </div>
                         <div className="col-12 col-md-3">
                              <button className="btn btn-sm btn-primary w-100" onClick={() => handleSeverSideProcessing({ page: 1, count: 25 })}>
                                   Run report
                              </button>
                         </div>
                    </>
               }
          >
               <div className="text-muted small mb-2">
                    {total} postings against {accountCode}
               </div>

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
