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
};

export default function CashFlowPage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [statement, setStatement] = useState<any>(null);
     const [loading, setLoading] = useState(false);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          try {
               const response = await accountingApi.cashFlow(from, to);
               if (requestId === latestRequest.current) setStatement(response?.result || null);
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [from, to]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));
     const totals = statement?.totals;

     return (
          <ReportShell
               title="Cash Flow Statement"
               subtitle="Direct method, built from entries that actually moved cash or bank"
               reportTitle="Cash Flow Statement"
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
               <div className="table-responsive">
                    <table className="table align-middle mb-0">
                         <tbody>
                              {["operating", "investing", "financing"].map((category) => {
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
                                        {money(totals?.netMovement || 0)}
                                   </td>
                              </tr>
                              <tr>
                                   <td>Cash at start of period</td>
                                   <td className="text-end">{money(totals?.openingCash || 0)}</td>
                              </tr>
                              <tr className="table-light">
                                   <td className="fw-semibold">Cash at end of period</td>
                                   <td className="text-end fw-semibold">{money(totals?.closingCash || 0)}</td>
                              </tr>
                         </tbody>
                    </table>
               </div>
          </ReportShell>
     );
}
