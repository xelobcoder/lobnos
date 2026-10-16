"use client";

import { FormEvent, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import {
     MODULE_LABELS, ModuleName, ModulePricingCatalogEntry, parseModulePricingCatalogEntry,
} from "./provisioningForm";
import FacilityNav from "./FacilityNav";

const emptyModulePrices = (): Record<ModuleName, string> => {
     const prices = {} as Record<ModuleName, string>;
     for (const moduleName of Object.keys(MODULE_LABELS) as ModuleName[]) prices[moduleName] = "0.00";
     return prices;
};
const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Unable to manage universal module prices.";

export default function ModulePricingCatalogEditor() {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     const [catalog, setCatalog] = useState<ModulePricingCatalogEntry[]>([]);
     const [currency, setCurrency] = useState("GHS");
     const [draft, setDraft] = useState<Record<ModuleName, string>>(emptyModulePrices());
     const [newCurrency, setNewCurrency] = useState("");
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");

     useEffect(() => {
          if (!isSuperAdmin) {
               setLoading(false);
               return;
          }
          let active = true;
          setLoading(true);
          setError("");
          void customFetch("platform/facilities/module-pricing?all=true").then(response => {
               if (!active) return;
               if (response?.status !== "success" || !Array.isArray(response.result)) {
                    throw new Error(response?.message || response?.error || "Unable to load universal module prices.");
               }
               const parsedEntries = response.result.map(parseModulePricingCatalogEntry);
               const catalogEntries = parsedEntries.filter((entry): entry is ModulePricingCatalogEntry => entry !== null);
               if (catalogEntries.length !== parsedEntries.length) {
                    throw new Error(response?.message || response?.error || "The server returned invalid universal module prices.");
               }
               setCatalog(catalogEntries);
               const initial = catalogEntries.find(entry => entry.currency === "GHS") || catalogEntries[0];
               if (initial) {
                    setCurrency(initial.currency);
                    setDraft({ ...initial.modules });
               }
          }).catch(failure => {
               if (active) setError(errorMessage(failure));
          }).finally(() => {
               if (active) setLoading(false);
          });
          return () => { active = false; };
     }, [isSuperAdmin]);

     const selectCurrency = (value: string) => {
          const selected = catalog.find(entry => entry.currency === value);
          if (!selected) return;
          setCurrency(value);
          setDraft({ ...selected.modules });
          setError("");
          setNotice("");
     };

     const addCurrency = () => {
          const value = newCurrency.trim().toUpperCase();
          if (!/^[A-Z]{3}$/.test(value)) {
               setError("Enter a valid three-letter currency code.");
               return;
          }
          const existing = catalog.find(entry => entry.currency === value);
          setCurrency(value);
          setDraft(existing ? { ...existing.modules } : emptyModulePrices());
          setNewCurrency("");
          setError("");
          setNotice("");
     };

     const save = async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (busy) return;
          if (!/^[A-Z]{3}$/.test(currency) ||
               Object.values(draft).some(price => !/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(price))) {
               setError("Use a three-letter currency code and nonnegative prices with at most two decimal places.");
               return;
          }
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation("platform/facilities/module-pricing", "PUT", {
                    currency,
                    modules: draft,
               });
               if (response?.status !== "success") {
                    throw new Error(response?.message || response?.error || "Unable to save universal module prices.");
               }
               const saved = parseModulePricingCatalogEntry(response.result);
               if (!saved) {
                    throw new Error(response?.message || response?.error || "The server returned invalid saved module prices.");
               }
               setCatalog(current => [
                    ...current.filter(entry => entry.currency !== saved.currency),
                    saved,
               ].sort((left, right) => left.currency.localeCompare(right.currency)));
               setCurrency(saved.currency);
               setDraft({ ...saved.modules });
               setNotice(`Universal module prices saved for ${saved.currency}.`);
          } catch (failure) {
               setError(errorMessage(failure));
          } finally {
               setBusy(false);
          }
     };

     if (!isSuperAdmin) return <main className="p-2"><div className="alert alert-danger" role="alert">Only an authorized platform super administrator can manage module prices.</div></main>;

     return (
          <main className="p-2" aria-busy={loading || busy}>
               <FacilityNav />
               <h1 className="h4 mb-2">Universal module pricing</h1>
               <p className="text-muted">Set the monthly rate for each module once. Facility provisioning uses these rates to calculate its estimate. Existing facilities keep saved price snapshots until their module configuration is saved again.</p>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               {loading ? <p role="status">Loading the universal price catalog...</p> : (
                    <section className="card border-0 shadow-sm" aria-label="Module price catalog">
                         <form className="card-body" onSubmit={save}>
                              <div className="row g-3 align-items-end mb-3">
                                   <div className="col-md-4">
                                        <label htmlFor="pricing-currency" className="form-label">Pricing currency</label>
                                        <select id="pricing-currency" className="form-select" value={currency} onChange={event => selectCurrency(event.target.value)}>
                                             {catalog.map(entry => <option key={entry.currency} value={entry.currency}>{entry.currency}</option>)}
                                             {!catalog.some(entry => entry.currency === currency) && <option value={currency}>{currency} (new)</option>}
                                        </select>
                                   </div>
                                   <div className="col-md-4">
                                        <label htmlFor="new-pricing-currency" className="form-label">Add another currency</label>
                                        <div className="input-group">
                                             <input id="new-pricing-currency" className="form-control text-uppercase" value={newCurrency} maxLength={3} pattern="[A-Za-z]{3}" placeholder="USD" onChange={event => setNewCurrency(event.target.value.toUpperCase())} />
                                             <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={addCurrency}>Add</button>
                                        </div>
                                   </div>
                                   <div className="col-md-4 text-md-end">
                                        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving prices..." : `Save ${currency} prices`}</button>
                                   </div>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm align-middle mb-0">
                                        <thead><tr><th scope="col">Module</th><th scope="col">Universal monthly price ({currency})</th></tr></thead>
                                        <tbody>{(Object.keys(MODULE_LABELS) as ModuleName[]).map(module => <tr key={module}>
                                             <th scope="row">{MODULE_LABELS[module]}</th>
                                             <td><input className="form-control" aria-label={`${MODULE_LABELS[module]} universal monthly price`} inputMode="decimal" value={draft[module]} pattern="(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?" required disabled={busy} onChange={event => setDraft(current => ({ ...current, [module]: event.target.value }))} /></td>
                                        </tr>)}</tbody>
                                   </table>
                              </div>
                         </form>
                    </section>
               )}
          </main>
     );
}
