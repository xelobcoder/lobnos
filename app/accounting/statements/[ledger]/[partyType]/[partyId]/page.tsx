"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState, use } from "react";
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import ReportShell, { formatRange } from "../../../../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, SubledgerStatementEntry } from "../../../../../../lib/accounting/accountingApi";

export default function SubledgerStatementPage(
     props: {
          params: Promise<{ ledger: string; partyType: string; partyId: string }>;
     }
) {
     const params = use(props.params);
     const ledger = String(params.ledger).toUpperCase() === "AP" ? "AP" : "AR";
     const partyId = Number(params.partyId);
     const currentYear = dayjs().year();

     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [entries, setEntries] = useState<SubledgerStatementEntry[]>([]);
     const [openingBalance, setOpeningBalance] = useState(0);
     const [closingBalance, setClosingBalance] = useState(0);
     const [loading, setLoading] = useState(false);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          try {
               const response = await accountingApi.subledgerStatement(ledger, params.partyType, partyId, from, to, { count: 200 });
               if (requestId !== latestRequest.current) return;
               setEntries(response?.result?.entries || []);
               setOpeningBalance(response?.result?.openingBalance || 0);
               setClosingBalance(response?.result?.closingBalance || 0);
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [ledger, params.partyType, partyId, from, to]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     const column = [
          {
               Header: "Date",
               accessor: "document_date",
               Cell: ({ value }: any) => <span className="text-nowrap">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          { Header: "Reference", accessor: "document_ref" },
          {
               Header: "Type",
               accessor: "document_type",
               Cell: ({ value }: any) => (
                    <span className="badge bg-light text-dark text-capitalize">{String(value).replace("_", " ")}</span>
               ),
          },
          {
               Header: "Charge",
               accessor: "amount",
               Cell: ({ value }: any) => <span className="d-block ">{Number(value) > 0 ? money(value) : "-"}</span>,
          },
          {
               Header: "Settlement",
               accessor: "gross_amount",
               Cell: ({ row }: any) => (
                    <span className="d-block ">
                         {Number(row.original.amount) < 0 ? money(Math.abs(Number(row.original.amount))) : "-"}
                    </span>
               ),
          },
          {
               Header: "Balance",
               accessor: "runningBalance",
               Cell: ({ value }: any) => <span className="d-block  fw-semibold">{money(value)}</span>,
          },
     ];

     const label = ledger === "AR" ? "Customer Statement" : "Supplier Statement";

     return (
          <ReportShell
               title={label}
               subtitle={`${params.partyType} #${partyId}`}
               reportTitle={label}
               range={formatRange(from, to)}
               filters={
                    <>
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
               <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                    <div>
                         <div className="small text-muted">Opening balance</div>
                         <div className="fw-semibold">{money(openingBalance)}</div>
                    </div>
                    <div className="">
                         <div className="small text-muted">Closing balance</div>
                         <div className="fw-semibold">{money(closingBalance)}</div>
                    </div>
               </div>

               <PrimeTable column={column} data={entries} filtering handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
