"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PrimeTable from "../../../../components/accounting/AccountingTable";
import ReportShell from "../../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../../../lib/accounting/accountingApi";

export default function InventoryValuationPage() {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [rows, setRows] = useState<any[]>([]);
     const [totals, setTotals] = useState<any>(null);
     const [loading, setLoading] = useState(false);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          try {
               const response = await accountingApi.inventoryValuation(asOf);
               if (requestId === latestRequest.current) {
                    setRows(response?.result?.rows || []);
                    setTotals(response?.result?.totals || null);
               }
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [asOf]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));
     const outOfBalance = totals && Math.abs(totals.difference) > 0.01;

     const column = [
          { Header: "Item", accessor: "name" },
          { Header: "SKU", accessor: "sku", Cell: ({ value }: any) => value || "-" },
          { Header: "Quantity", accessor: "quantity", Cell: ({ value }: any) => <span className="d-block text-end">{value}</span> },
          { Header: "Unit Cost", accessor: "unitCost", Cell: ({ value }: any) => <span className="d-block text-end">{money(value)}</span> },
          {
               Header: "Value",
               accessor: "value",
               Cell: ({ value }: any) => <span className="d-block text-end fw-semibold">{money(value)}</span>,
          },
     ];

     return (
          <ReportShell
               title="Inventory Valuation"
               subtitle="Stock on hand at its most recent known unit cost, reconciled to the inventory control account"
               reportTitle="Inventory Valuation"
               range={`As at ${dayjs(asOf).format("D MMMM YYYY")}`}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(_, end) => setAsOf(end)} label="Period" className="w-100" />
                         </div>
                    </>
               }
          >
               {totals && (
                    <div className={`alert py-2 ${outOfBalance ? "alert-danger" : "alert-success"}`}>
                         Stock value {money(totals.value)} vs inventory control account {money(totals.generalLedger)}
                         {outOfBalance ? (
                              <strong className="ms-2">out by {money(totals.difference)}</strong>
                         ) : (
                              <span className="ms-2">reconciled</span>
                         )}
                    </div>
               )}

               {outOfBalance && (
                    <p className="text-muted small">
                         Valuation uses the latest unit cost per item rather than costing each layer, so a difference is expected
                         where costs have moved between receipts.
                    </p>
               )}

               <PrimeTable column={column} data={rows} filtering handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
