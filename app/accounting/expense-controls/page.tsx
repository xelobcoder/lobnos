"use client";

import { RiShieldCheckLine } from "@remixicon/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ReportShell from "../../../components/accounting/ReportShell";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";

const DEFAULTS = { allow_self_approval: false, require_separate_payer: true, allow_approval_override: false };

export default function ExpenseControlsPage() {
     const [controls, setControls] = useState(DEFAULTS);
     const [busy, setBusy] = useState(false);

     const load = useCallback(async () => {
          try {
               const response = await customFetch("expenses/workflow/controls");
               if (!response?.success) throw new Error(response?.message || "Unable to load controls");
               setControls({ ...DEFAULTS, ...(response.data || {}) });
          } catch (error: any) {
               toast.error(error?.message || "Unable to load expense controls");
          }
     }, []);

     useEffect(() => { load(); }, [load]);

     const save = async () => {
          setBusy(true);
          try {
               const response = await customFetchMutation("expenses/workflow/controls", "PUT", controls);
               if (!response?.success) throw new Error(response?.message || "Unable to save controls");
               setControls({ ...DEFAULTS, ...response.data });
               toast.success("Expense controls updated");
          } catch (error: any) {
               toast.error(error?.message || "Unable to save expense controls");
          } finally {
               setBusy(false);
          }
     };

     return (
          <ReportShell title="Expense Controls" subtitle="Configure segregation of duties for this facility">
               <div className="alert alert-info d-flex gap-2 align-items-start"><RiShieldCheckLine size={22} /><div>Administrators can approve expenses by role. Other users require delegated approval authority. Payment authority remains separately delegated, and these controls decide whether one person may perform conflicting steps.</div></div>
               <section className="card border-0 shadow-sm" style={{ maxWidth: 850 }}>
                    <div className="card-body p-4">
                         <div className="d-flex justify-content-between gap-4 border-bottom py-3"><div><h2 className="h6 mb-1">Allow self-approval</h2><p className="text-muted mb-0">Permit an expense creator to approve their own expense. Keep disabled for normal segregation of duties.</p></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={controls.allow_self_approval} onChange={(event) => setControls({ ...controls, allow_self_approval: event.target.checked })} aria-label="Allow self-approval" /></div></div>
                         <div className="d-flex justify-content-between gap-4 border-bottom py-3"><div><h2 className="h6 mb-1">Require a separate payer</h2><p className="text-muted mb-0">Prevent the person who approved an expense from recording its payment.</p></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={controls.require_separate_payer} onChange={(event) => setControls({ ...controls, require_separate_payer: event.target.checked })} aria-label="Require separate payer" /></div></div>
                         <div className="d-flex justify-content-between gap-4 py-3"><div><h2 className="h6 mb-1">Allow explicit approval override</h2><p className="text-muted mb-0">Allow self-approval only when the user also has the dedicated override permission.</p></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={controls.allow_approval_override} onChange={(event) => setControls({ ...controls, allow_approval_override: event.target.checked })} aria-label="Allow explicit approval override" /></div></div>
                         <button className="btn btn-primary mt-3" disabled={busy} onClick={save}>{busy ? "Saving..." : "Save controls"}</button>
                    </div>
               </section>
          </ReportShell>
     );
}
