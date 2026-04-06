"use client";

import { useState } from "react";
import { MasterFormLookupData, MasterTestPanel } from "../lib/types";

type TestPanelFormProps = {
     title: string;
     initialData?: Partial<MasterTestPanel>;
     lookupData: MasterFormLookupData;
     onSubmit: (payload: Record<string, unknown>) => Promise<void>;
};

type SwitchField = "hasManual" | "showtrend" | "hasGenderVariation" | "hasChildrenLimit" | "isoutsourced" | "hasDrugs" | "useLiterature";
type TatUnit = "tatEvaluation" | "pre_TatEvaluation" | "post_TatEvaluation";

type FormState = {
     name: string;
     shorttext: string;
     category: string;
     sample: string;
     sample_container: string;
     qty_required: string;
     unit: string;
     testprice: string;
     testcost: string;
     reportitle: string;
     method: string;
     instrumentation: string;
     description: string;
     hasManual: number;
     showtrend: number;
     hasGenderVariation: number;
     hasChildrenLimit: number;
     isoutsourced: number;
     hasDrugs: number;
     useLiterature: number;
     procedureCode: string;
     tatCount: string;
     tatEvaluation: string;
     pre_Tat: string;
     pre_TatEvaluation: string;
     tat: string;
     post_Tat: string;
     post_TatEvaluation: string;
};

const hasOption = (options: Array<{ id: number; name: string }>, value: string): boolean => {
     const parsed = Number(value);
     return Number.isInteger(parsed) && options.some((option) => option.id === parsed);
};

const toBit = (v: unknown): number => (v === 1 || v === true || v === "1" ? 1 : 0);

export default function TestPanelForm({ title, initialData, lookupData, onSubmit }: TestPanelFormProps) {
     const [form, setForm] = useState<FormState>({
          name: initialData?.name || "",
          shorttext: initialData?.shorttext || "",
          category: `${initialData?.category || ""}`,
          sample: `${initialData?.sample || ""}`,
          sample_container: `${initialData?.sample_container || ""}`,
          qty_required: `${initialData?.qty_required || ""}`,
          unit: initialData?.unit || "",
          testprice: `${initialData?.testprice ?? initialData?.price ?? ""}`,
          testcost: `${initialData?.testcost || ""}`,
          reportitle: initialData?.reportitle || "",
          method: initialData?.method || "",
          instrumentation: initialData?.instrumentation || "",
          description: initialData?.description || "",
          hasManual: toBit(initialData?.hasManual),
          showtrend: toBit(initialData?.showtrend),
          hasGenderVariation: toBit(initialData?.hasGenderVariation),
          hasChildrenLimit: toBit(initialData?.hasChildrenLimit),
          isoutsourced: toBit(initialData?.isoutsourced),
          hasDrugs: toBit(initialData?.hasDrugs),
          useLiterature: toBit(initialData?.useLiterature),
          procedureCode: initialData?.procedureCode || "",
          tatCount: `${initialData?.tatCount || ""}`,
          tatEvaluation: initialData?.tatEvaluation || "min",
          pre_Tat: `${initialData?.pre_Tat || ""}`,
          pre_TatEvaluation: initialData?.pre_TatEvaluation || "min",
          tat: `${initialData?.tat || ""}`,
          post_Tat: `${initialData?.post_Tat || ""}`,
          post_TatEvaluation: initialData?.post_TatEvaluation || "min",
     });
     const [isSaving, setIsSaving] = useState(false);

     const set = (name: keyof FormState, value: string | number) =>
          setForm((prev) => ({ ...prev, [name]: value }));

     const toggle = (field: SwitchField) =>
          setForm((prev) => ({ ...prev, [field]: prev[field] === 1 ? 0 : 1 }));

     const switchRow = (field: SwitchField, label: string, hint?: string) => (
          <div className="form-row grid-reg mt-2">
               <label className="pls-label">
                    {label}
                    {hint && (
                         <>
                              <br />
                              <small className="text-danger">{hint}</small>
                         </>
                    )}
               </label>
               <div className="form-check form-switch mb-0">
                    <input
                         className="form-check-input"
                         type="checkbox"
                         role="switch"
                         style={{ width: "2.5rem", height: "1.4rem", cursor: "pointer" }}
                         checked={form[field] === 1}
                         onChange={() => toggle(field)}
                    />
               </div>
          </div>
     );

     const tatSelect = (field: TatUnit) => (
          <select
               className="custom-select flex-grow-1"
               value={form[field]}
               onChange={(e) => set(field, e.target.value)}
          >
               <option value="min">min</option>
               <option value="hour">hours</option>
               <option value="seconds">seconds</option>
          </select>
     );

     const submit = async (ev: React.FormEvent) => {
          ev.preventDefault();
          if (!form.name.trim()) {
               alert("Name is required");
               return;
          }
          if (!hasOption(lookupData.departments, form.category)) {
               alert("Category is required");
               return;
          }
          if (!hasOption(lookupData.sampleTypes, form.sample)) {
               alert("Sample type is required");
               return;
          }
          if (!hasOption(lookupData.sampleContainers, form.sample_container)) {
               alert("Sample container is required");
               return;
          }

          setIsSaving(true);
          try {
               await onSubmit({
                    ...form,
                    category: Number(form.category || 0),
                    sample: Number(form.sample || 0),
                    sample_container: Number(form.sample_container || 0),
                    testprice: Number(form.testprice || 0),
                    testcost: Number(form.testcost || 0),
                    tatCount: Number(form.tatCount || 0),
                    pre_Tat: Number(form.pre_Tat || 0),
                    tat: Number(form.tat || 0),
                    post_Tat: Number(form.post_Tat || 0),
                    iscustom: 0,
               });
          } finally {
               setIsSaving(false);
          }
     };

     return (
          <div className="ma-card">
               <div className="ma-card-header">
                    <h5 className="mb-1 fw-semibold">{title}</h5>
                    <p className="text-muted small mb-0">Manage core test setup, pricing, and report configuration.</p>
               </div>

               <div className="ma-card-body">
                    <form onSubmit={submit}>

                         {/* ── Basic ─────────────────────────────────────────── */}
                         <h5>Basic</h5>
                         <hr />

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Name</label>
                              <input
                                   className="custom-input"
                                   value={form.name}
                                   onChange={(e) => set("name", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Category</label>
                              <select
                                   className="custom-select"
                                   value={form.category}
                                   onChange={(e) => set("category", e.target.value)}
                              >
                                   <option value="">Select a category</option>
                                   {lookupData.departments.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                   ))}
                              </select>
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Sample Type</label>
                              <select
                                   className="custom-select"
                                   value={form.sample}
                                   onChange={(e) => set("sample", e.target.value)}
                              >
                                   <option value="">Select a sample type</option>
                                   {lookupData.sampleTypes.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                   ))}
                              </select>
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Sample Container</label>
                              <select
                                   className="custom-select"
                                   value={form.sample_container}
                                   onChange={(e) => set("sample_container", e.target.value)}
                              >
                                   <option value="">Select a container</option>
                                   {lookupData.sampleContainers.map((item) => (
                                        <option key={item.id} value={item.id}>
                                             {item.name}{item.volume_capacity ? ` (${item.volume_capacity}ml)` : ""}
                                        </option>
                                   ))}
                              </select>
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Unit</label>
                              <input
                                   className="custom-input"
                                   value={form.unit}
                                   onChange={(e) => set("unit", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Sample Quantity</label>
                              <input
                                   type="number"
                                   className="custom-input"
                                   value={form.qty_required}
                                   onChange={(e) => set("qty_required", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Short Text</label>
                              <input
                                   className="custom-input"
                                   value={form.shorttext}
                                   onChange={(e) => set("shorttext", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Cost of Test</label>
                              <input
                                   type="number"
                                   className="custom-input"
                                   value={form.testcost}
                                   onChange={(e) => set("testcost", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Test Price</label>
                              <input
                                   type="number"
                                   className="custom-input"
                                   value={form.testprice}
                                   onChange={(e) => set("testprice", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Report Title</label>
                              <input
                                   className="custom-input"
                                   value={form.reportitle}
                                   onChange={(e) => set("reportitle", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Method</label>
                              <input
                                   className="custom-input"
                                   value={form.method}
                                   onChange={(e) => set("method", e.target.value)}
                              />
                         </div>

                         <div className="form-row grid-reg mt-2">
                              <label className="pls-label">Instrumentation</label>
                              <input
                                   className="custom-input"
                                   value={form.instrumentation}
                                   onChange={(e) => set("instrumentation", e.target.value)}
                              />
                         </div>

                         <div className="form-row mt-2">
                              <textarea
                                   className="custom-input"
                                   rows={5}
                                   value={form.description}
                                   onChange={(e) => set("description", e.target.value)}
                                   placeholder="Type test description here"
                              />
                         </div>

                         {/* ── Configurations ────────────────────────────────── */}
                         <hr />
                         <h5>Configurations</h5>
                         <hr />

                         {switchRow("hasManual", "Has Manual")}
                         {switchRow("showtrend", "Show Trend")}
                         {switchRow("hasGenderVariation", "Has Varied Gender")}
                         {switchRow("hasChildrenLimit", "Has Children Limit")}
                         {switchRow("isoutsourced", "Outsourced Test")}
                         {switchRow("hasDrugs", "Use Drugs", "(For culture and sensitivity test)")}
                         {switchRow("useLiterature", "Use Literature")}

                         {form.hasManual === 1 && (
                              <div className="form-row grid-reg mt-2">
                                   <label className="pls-label">Procedure Code</label>
                                   <input
                                        type="text"
                                        className="custom-input"
                                        value={form.procedureCode}
                                        onChange={(e) => set("procedureCode", e.target.value)}
                                   />
                              </div>
                         )}

                         {/* ── TAT ───────────────────────────────────────────── */}
                         <hr />
                         <h5>Tat (Turn Around Time) Set Up</h5>

                         <div className="d-flex flex-column mt-2">
                              <div className="d-flex align-items-center mb-3 gap-2">
                                   <label className="pls-label" style={{ minWidth: "110px" }}>Tat Count:</label>
                                   <input
                                        type="number"
                                        className="custom-input flex-grow-1"
                                        value={form.tatCount}
                                        onChange={(e) => set("tatCount", e.target.value)}
                                        placeholder="Count of tests to use"
                                   />
                                   {tatSelect("tatEvaluation")}
                              </div>

                              <div className="d-flex align-items-center mb-3 gap-2">
                                   <label className="pls-label" style={{ minWidth: "110px" }}>Pre Tat:</label>
                                   <input
                                        type="number"
                                        className="custom-input flex-grow-1"
                                        value={form.pre_Tat}
                                        onChange={(e) => set("pre_Tat", e.target.value)}
                                        placeholder="Pre Tat value"
                                   />
                                   {tatSelect("pre_TatEvaluation")}
                              </div>

                              <div className="d-flex align-items-center mb-3 gap-2">
                                   <label className="pls-label" style={{ minWidth: "110px" }}>Tat:</label>
                                   <input
                                        type="number"
                                        className="custom-input flex-grow-1"
                                        value={form.tat}
                                        onChange={(e) => set("tat", e.target.value)}
                                        placeholder="Tat value"
                                   />
                                   {tatSelect("tatEvaluation")}
                              </div>

                              <div className="d-flex align-items-center mb-3 gap-2">
                                   <label className="pls-label" style={{ minWidth: "110px" }}>Post Tat:</label>
                                   <input
                                        type="number"
                                        className="custom-input flex-grow-1"
                                        value={form.post_Tat}
                                        onChange={(e) => set("post_Tat", e.target.value)}
                                        placeholder="Post Tat value"
                                   />
                                   {tatSelect("post_TatEvaluation")}
                              </div>
                         </div>

                         {/* ── Save ──────────────────────────────────────────── */}
                         <hr />
                         <div>
                              <button
                                   type="submit"
                                   className="btn btn-success btn-sm mt-2"
                                   disabled={isSaving}
                              >
                                   {isSaving ? "Saving..." : "Save Changes"}
                              </button>
                         </div>

                    </form>
               </div>
          </div>
     );
}
