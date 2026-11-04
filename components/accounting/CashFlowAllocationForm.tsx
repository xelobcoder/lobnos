"use client";
import { useRef, useState } from "react";
import { currencyFormatter } from "../Auth/customFetch";
import type { CashFlowAllocation } from "../../lib/accounting/accountingApi";

const categories = ["operating", "investing", "financing"] as const;
export default function CashFlowAllocationForm({ netAmount, idPrefix, requireReason = false, onSave }: {
     netAmount: number;
     idPrefix: string;
     requireReason?: boolean;
     onSave: (allocations: CashFlowAllocation[], reason: string, idempotencyKey: string) => Promise<void>;
}) {
     const [values, setValues] = useState({ operating: { inflow: "", outflow: "" }, investing: { inflow: "", outflow: "" }, financing: { inflow: "", outflow: "" } });
     const [reason, setReason] = useState("");
     const [busy, setBusy] = useState(false), [error, setError] = useState("");
     const lock = useRef(false), keys = useRef(new Map<string, string>());
     const amounts = Object.values(values).flatMap(value => [value.inflow, value.outflow]);
     const allocations = categories.map(category => ({ category, inflow: Number(values[category].inflow || 0), outflow: Number(values[category].outflow || 0) }));
     const netCents = allocations.reduce((sum, allocation) => sum + Math.round(allocation.inflow * 100) - Math.round(allocation.outflow * 100), 0);
     const valid = amounts.every(value => value === "" || /^\d+(?:\.\d{1,2})?$/.test(value) && Number.isSafeInteger(Math.round(Number(value) * 100))) &&
          amounts.some(value => Number(value) > 0) && netCents === Math.round(netAmount * 100) &&
          (!requireReason || reason.trim().length >= 3 && reason.trim().length <= 500);
     return <form className="mt-2 d-print-none" onSubmit={async event => {
          event.preventDefault();
          if (!valid || lock.current) return;
          lock.current = true; setBusy(true); setError("");
          try {
               const signature = JSON.stringify([allocations, reason.trim()]);
               const key = keys.current.get(signature) || crypto.randomUUID();
               keys.current.set(signature, key);
               await onSave(allocations, reason.trim(), key);
               keys.current.delete(signature);
          } catch (error) {
               setError(error instanceof Error ? error.message : "Unable to save cash-flow classification.");
          } finally { lock.current = false; setBusy(false); }
     }}>
          <p>Allocate actual cash receipts and payments separately. This changes reporting classification, not the posted journal.</p>
          {netAmount === 0 && <p className="fw-semibold">Net movement is zero. Include both receipts and payments; offsetting cash flows must not disappear.</p>}
          <fieldset disabled={busy}>
               {categories.map(category => <div className="row g-2 align-items-end mb-2" key={category}><div className="col-md-2 text-capitalize fw-semibold">{category}</div>{(["inflow", "outflow"] as const).map(direction => <div className="col-6 col-md-4" key={direction}>
                         <label className="form-label text-capitalize" htmlFor={`${idPrefix}-${category}-${direction}`}>{category} cash {direction}</label>
                         <input id={`${idPrefix}-${category}-${direction}`} className="form-control" inputMode="decimal" value={values[category][direction]} onChange={event => setValues({ ...values, [category]: { ...values[category], [direction]: event.target.value } })}/>
                    </div>)}</div>)}
               <p>Allocated net: {Number.isFinite(netCents) ? currencyFormatter.format(netCents / 100) : "Enter valid amounts"}; required net: {currencyFormatter.format(netAmount)}.</p>
               {requireReason && <div className="mb-2"><label htmlFor={`${idPrefix}-reason`} className="form-label">Review reason / evidence</label><textarea id={`${idPrefix}-reason`} required minLength={3} maxLength={500} className="form-control" value={reason} onChange={event => setReason(event.target.value)}/></div>}
               <button type="submit" className="btn btn-primary" disabled={!valid || busy}>{busy ? "Saving..." : "Save classification"}</button>
          </fieldset>
          {error && <p role="alert" className="text-danger mt-2">{error}</p>}
     </form>;
}
