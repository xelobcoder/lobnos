"use client";

import { useState } from "react";
import { FieldCategory, MasterFieldRule } from "../lib/types";

// ─── Standard units list (matches client app) ─────────────────────────────────
const STANDARD_UNITS: string[] = [
     "mg/dL", "g/dL", "µg/dL", "ng/dL",
     "mg/L", "g/L", "µg/L", "ng/mL", "pg/mL",
     "mmol/L", "µmol/L", "nmol/L",
     "mEq/L",
     "U/L", "IU/L", "IU/mL", "mIU/mL", "µIU/mL",
     "×10⁹/L", "×10¹²/L",
     "cells/µL", "cells/mm³", "/µL", "/mm³",
     "%",
     "seconds", "sec", "INR",
     "mmHg", "kPa", "pH",
     "µL", "mL", "L", "dL",
     "pg", "ng", "µg", "mg", "g", "kg",
     "µm", "mm", "cm", "m",
     "°C", "°F",
     "minutes", "hours", "days",
     "mOsm/kg", "mOsm/L",
     "mL/min", "L/min", "mL/hr",
     "titer", "ratio", "OD", "AU",
     "CFU/mL", "CFU/g",
     "mg/24h", "mL/24h", "µg/24h", "mmol/24h", "g/24h",
     "index", "S/CO", "AU/mL", "RU/mL",
     "pmol/L", "ppm", "ppb",
     "HPF", "LPF", "cells/HPF", "cells/LPF",
     "beats/min", "breaths/min", "m²", "kg/m²",
     "N/A", "unitless",
];

// ─── Plan options (matches client app exactly) ────────────────────────────────
const PLAN_OPTIONS: Array<{ value: string; label: string }> = [
     { value: "options", label: "Dropdown" },
     { value: "input", label: "Text" },
     { value: "textReference", label: "Reference" },
     { value: "limits", label: "Range (M/F/Child/Neonate)" },
     { value: "fetalBiometry", label: "Fetal Biometry (Hadlock)" },
     { value: "greaterLess", label: "Compare" },
     { value: "greaterLessEqualTo", label: "Compare (<=/>=)" },
     { value: "plain", label: "Text Area" },
     { value: "time", label: "Time" },
     { value: "ultrasoundFields", label: "Ultrasound" },
     { value: "datetime", label: "Date & Time" },
     { value: "date", label: "Date" },
];

// ─── Default empty rule (mirrors client defaultCreationRule) ──────────────────
const EMPTY_RULE: MasterFieldRule = {
     name: "",
     field: "",
     value: "",
     options: "",
     category: "",
     categoryid: "",
     undercategory: 0,
     hasunits: false,
     units: "",
     plan: "",
     plain: "",
     textReference: "",
     ordering: 0,
     isValueTracked: 0,
     isRequired: false,
     lowerlimit: "",
     upperlimit: "",
     upperLimitFemale: null,
     lowerLimitFemale: null,
     upperLimitMale: null,
     lowerLimitMale: null,
     upperLimitChildren: null,
     lowerLimitChildren: null,
     upperLimitNeonates: null,
     lowerLimitNeonates: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const str = (v: unknown): string => (v == null ? "" : String(v));

const hasDemographicLimits = (field: MasterFieldRule): boolean => {
     const keys: Array<keyof MasterFieldRule> = [
          "lowerLimitFemale", "upperLimitFemale",
          "lowerLimitMale", "upperLimitMale",
          "lowerLimitChildren", "upperLimitChildren",
          "lowerLimitNeonates", "upperLimitNeonates",
     ];
     return keys.some((k) => {
          const v = field[k];
          return v !== null && v !== undefined && `${v}`.trim() !== "";
     });
};

const normalizeIncoming = (rule: MasterFieldRule, index: number): MasterFieldRule => ({
     ...EMPTY_RULE,
     ...rule,
     hasunits: !!rule.hasunits || (!!rule.units && str(rule.units).length > 0),
     undercategory: rule.undercategory ? 1 : 0,
     isValueTracked: rule.isValueTracked ? 1 : 0,
     options: str(rule.options),
     textReference: str(rule.textReference),
     plain: str(rule.plain),
     units: str(rule.units),
     lowerlimit: str(rule.lowerlimit),
     upperlimit: str(rule.upperlimit),
     lowerLimitFemale: rule.lowerLimitFemale ?? null,
     upperLimitFemale: rule.upperLimitFemale ?? null,
     lowerLimitMale: rule.lowerLimitMale ?? null,
     upperLimitMale: rule.upperLimitMale ?? null,
     lowerLimitChildren: rule.lowerLimitChildren ?? null,
     upperLimitChildren: rule.upperLimitChildren ?? null,
     lowerLimitNeonates: rule.lowerLimitNeonates ?? null,
     upperLimitNeonates: rule.upperLimitNeonates ?? null,
     ordering: Number.isFinite(Number(rule.ordering)) ? Number(rule.ordering) : index,
});

// ─── Preview widget (matches client renderFieldPreview) ───────────────────────
function FieldPreview({ field }: { field: MasterFieldRule }) {
     const plan = field.plan;
     const units = str(field.units);
     const lowerlimit = str(field.lowerlimit);
     const upperlimit = str(field.upperlimit);
     const options = field.options;
     const textReference = str(field.textReference);

     switch (plan) {
          case "input":
               return (
                    <input type="text" className="form-control form-control-sm" value={units ? `120 ${units}` : "120"} readOnly style={{ width: 120, fontSize: "0.75rem" }} />
               );
          case "options": {
               const opts: string[] = Array.isArray(options)
                    ? options
                    : typeof options === "string" && options.length > 0
                         ? options.split(",").map((s) => s.trim())
                         : ["Normal", "Abnormal"];
               return (
                    <select className="form-select form-select-sm" disabled style={{ width: 120, fontSize: "0.75rem" }}>
                         {opts.map((opt, i) => <option key={i}>{opt}</option>)}
                    </select>
               );
          }
          case "plain":
               return <textarea className="form-control form-control-sm" value="Sample text..." readOnly style={{ width: 120, height: 30, fontSize: "0.75rem", resize: "none" }} />;
          case "limits":
               if (hasDemographicLimits(field)) {
                    return (
                         <div style={{ fontSize: "0.65rem", lineHeight: 1.3, minWidth: 140 }}>
                              <div><span className="fw-semibold">M:</span> {str(field.lowerLimitMale) || "–"} – {str(field.upperLimitMale) || "–"}</div>
                              <div><span className="fw-semibold">F:</span> {str(field.lowerLimitFemale) || "–"} – {str(field.upperLimitFemale) || "–"}</div>
                              <div><span className="fw-semibold">C:</span> {str(field.lowerLimitChildren) || "–"} – {str(field.upperLimitChildren) || "–"}</div>
                              <div><span className="fw-semibold">N:</span> {str(field.lowerLimitNeonates) || "–"} – {str(field.upperLimitNeonates) || "–"}</div>
                              {units && <div className="text-secondary mt-1">{units}</div>}
                         </div>
                    );
               }
               return (
                    <div className="d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                         <span className="fw-bold">{lowerlimit || "0"}</span>
                         <span className="text-muted">–</span>
                         <span className="fw-bold">{upperlimit || "100"}</span>
                         {units && <span className="text-secondary ms-1">{units}</span>}
                    </div>
               );
          case "greaterLess":
          case "greaterLessEqualTo":
               return <input type="text" className="form-control form-control-sm" value={`${textReference || "> 50"} ${units}`} readOnly style={{ width: 120, fontSize: "0.75rem" }} />;
          case "textReference":
               return (
                    <div className="p-1 border rounded" style={{ width: 140, fontSize: "0.65rem", minHeight: 45, background: "#f8f9fa" }}>
                         <div className="fw-bold mb-1 border-bottom pb-1 text-muted" style={{ fontSize: "0.55rem", letterSpacing: "0.5px" }}>REFERENCE RANGE</div>
                         <div style={{ whiteSpace: "pre-line", lineHeight: 1.3 }}>
                              {textReference
                                   ? textReference.split(";").map((s) => s.trim()).filter(Boolean).join("\n")
                                   : "Male: 10–20\nFemale: 5–15"}
                         </div>
                    </div>
               );
          case "ultrasoundFields":
               return <input type="text" className="form-control form-control-sm" placeholder="Measurement" readOnly style={{ width: 120, fontSize: "0.75rem" }} />;
          case "fetalBiometry":
               return (
                    <div className="d-flex flex-column" style={{ fontSize: "0.65rem", minWidth: 120 }}>
                         <span className="fw-semibold">BPD, FL, HC, AC</span>
                         <span className="text-muted">Hadlock EFW</span>
                    </div>
               );
          default:
               return <span className="text-muted small">–</span>;
     }
}

// ─── Specific Config input (edit mode) ───────────────────────────────────────
function ConfigInput({ field, setField }: { field: MasterFieldRule; setField: (f: MasterFieldRule) => void }) {
     if (field.plan === "limits") {
          const limitRows: Array<{ label: string; lo: keyof MasterFieldRule; hi: keyof MasterFieldRule }> = [
               { label: "Male", lo: "lowerLimitMale", hi: "upperLimitMale" },
               { label: "Female", lo: "lowerLimitFemale", hi: "upperLimitFemale" },
               { label: "Children", lo: "lowerLimitChildren", hi: "upperLimitChildren" },
               { label: "Neonate", lo: "lowerLimitNeonates", hi: "upperLimitNeonates" },
          ];
          return (
               <div className="d-flex flex-column gap-1" style={{ minWidth: 260 }}>
                    {limitRows.map(({ label, lo, hi }) => (
                         <div key={lo as string} className="d-flex gap-1 align-items-center">
                              <span style={{ width: 56, fontSize: "0.75rem" }}>{label}</span>
                              <input type="number" className="form-control form-control-sm" value={str(field[lo])} onChange={(e) => setField({ ...field, [lo]: e.target.value })} placeholder="Min" style={{ width: 80 }} />
                              <input type="number" className="form-control form-control-sm" value={str(field[hi])} onChange={(e) => setField({ ...field, [hi]: e.target.value })} placeholder="Max" style={{ width: 80 }} />
                         </div>
                    ))}
                    <div className="d-flex gap-1 align-items-center mt-1">
                         <span style={{ width: 56, fontSize: "0.7rem" }} className="text-muted">Legacy</span>
                         <input type="number" className="form-control form-control-sm" value={str(field.lowerlimit)} onChange={(e) => setField({ ...field, lowerlimit: e.target.value })} placeholder="Min" style={{ width: 80 }} />
                         <input type="number" className="form-control form-control-sm" value={str(field.upperlimit)} onChange={(e) => setField({ ...field, upperlimit: e.target.value })} placeholder="Max" style={{ width: 80 }} />
                    </div>
               </div>
          );
     }
     if (field.plan === "options") {
          return (
               <input
                    type="text"
                    className="form-control form-control-sm"
                    value={Array.isArray(field.options) ? (field.options as string[]).join(", ") : str(field.options)}
                    onChange={(e) => setField({ ...field, options: e.target.value })}
                    onBlur={(e) => setField({ ...field, options: e.target.value.split(",").map((s) => s.trim()).join(", ") })}
                    placeholder="Opt1, Opt2, Opt3"
               />
          );
     }
     if (field.plan === "textReference") {
          return (
               <textarea
                    className="form-control form-control-sm"
                    value={str(field.textReference)}
                    onChange={(e) => setField({ ...field, textReference: e.target.value })}
                    placeholder="e.g. Male: 10-20; Female: 5-15"
                    rows={2}
                    style={{ fontSize: "0.8rem" }}
               />
          );
     }
     if (field.plan === "greaterLess" || field.plan === "greaterLessEqualTo") {
          return (
               <input
                    type="text"
                    className="form-control form-control-sm"
                    value={str(field.textReference)}
                    onChange={(e) => setField({ ...field, textReference: e.target.value })}
                    placeholder={field.plan === "greaterLess" ? "e.g. > 10" : "e.g. >= 10"}
               />
          );
     }
     if (field.plan === "time") {
          return (
               <input
                    type="text"
                    className="form-control form-control-sm"
                    value={str(field.textReference)}
                    onChange={(e) => setField({ ...field, textReference: e.target.value })}
                    placeholder="e.g. HH:mm:ss"
               />
          );
     }
     if (field.plan === "fetalBiometry") {
          return <span className="text-muted small">Uses BPD, FL, HC, AC with Hadlock EFW in result entry</span>;
     }
     return <span className="text-muted small">–</span>;
}

// ─── Specific Config display (read mode) ─────────────────────────────────────
function ConfigDisplay({ field }: { field: MasterFieldRule }) {
     const plan = field.plan;
     if (plan === "limits") {
          if (hasDemographicLimits(field)) {
               return (
                    <span style={{ fontSize: "0.78rem" }}>
                         {["M", "F", "C", "N"].map((t, i) => {
                              const [lo, hi] = [
                                   ["lowerLimitMale", "upperLimitMale"],
                                   ["lowerLimitFemale", "upperLimitFemale"],
                                   ["lowerLimitChildren", "upperLimitChildren"],
                                   ["lowerLimitNeonates", "upperLimitNeonates"],
                              ][i] as [keyof MasterFieldRule, keyof MasterFieldRule];
                              return <span key={t}>{t}:{str(field[lo]) || "–"}-{str(field[hi]) || "–"} </span>;
                         })}
                    </span>
               );
          }
          if (field.lowerlimit || field.upperlimit) {
               return <span style={{ fontSize: "0.8rem" }}>{str(field.lowerlimit) || "0"} – {str(field.upperlimit) || "0"}</span>;
          }
          return <span className="text-muted">–</span>;
     }
     if (plan === "fetalBiometry") return <span style={{ fontSize: "0.8rem" }}>BPD, FL, HC, AC (Hadlock)</span>;
     if (plan === "options") {
          const opts = Array.isArray(field.options) ? (field.options as string[]).join(", ") : str(field.options);
          return <span style={{ fontSize: "0.8rem" }}>{opts || "–"}</span>;
     }
     if (["textReference", "greaterLess", "greaterLessEqualTo", "time"].includes(plan || "")) {
          return <span style={{ fontSize: "0.8rem" }}>{str(field.textReference) || "–"}</span>;
     }
     return <span className="text-muted">–</span>;
}

// ─── Units cell: standard dropdown + Other custom input ───────────────────────
function UnitsCell({
     field,
     setField,
     showCustomUnit,
     setShowCustomUnit,
}: {
     field: MasterFieldRule;
     setField: (f: MasterFieldRule) => void;
     showCustomUnit: boolean;
     setShowCustomUnit: (v: boolean) => void;
}) {
     if (showCustomUnit) {
          return (
               <div className="d-flex gap-1">
                    <input
                         type="text"
                         className="form-control form-control-sm"
                         value={field.units === "Other" ? "" : str(field.units)}
                         onChange={(e) => setField({ ...field, units: e.target.value, hasunits: e.target.value.length > 0 })}
                         placeholder="Enter unit"
                         autoFocus
                    />
                    <button
                         type="button"
                         className="btn btn-sm btn-outline-secondary"
                         onClick={() => setShowCustomUnit(false)}
                         title="Back to list"
                    >×</button>
               </div>
          );
     }
     const currentUnits = str(field.units);
     const selectVal = STANDARD_UNITS.includes(currentUnits) ? currentUnits : (currentUnits ? "Other" : "");
     return (
          <select
               className="form-select form-select-sm"
               value={selectVal}
               onChange={(e) => {
                    if (e.target.value === "Other") {
                         setShowCustomUnit(true);
                         setField({ ...field, units: "", hasunits: false });
                    } else {
                         setField({ ...field, units: e.target.value, hasunits: e.target.value.length > 0 });
                    }
               }}
          >
               <option value="">-- Unit --</option>
               {STANDARD_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
               <option value="Other">Other...</option>
               <option value="Order">Order</option>
          </select>
     );
}

// ─── Props ────────────────────────────────────────────────────────────────────
type FieldRulesEditorProps = {
     initialRules: MasterFieldRule[];
     fieldConstraintsCategorization?: FieldCategory[];
     onSave: (rules: MasterFieldRule[]) => Promise<void>;
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function FieldRulesEditor({
     initialRules,
     fieldConstraintsCategorization = [],
     onSave,
}: FieldRulesEditorProps) {
     const [data, setData] = useState<MasterFieldRule[]>(() =>
          initialRules.map(normalizeIncoming)
     );
     const [editingIndex, setEditingIndex] = useState<number | null>(null);
     const [newField, setNewField] = useState<MasterFieldRule>({ ...EMPTY_RULE });
     const [showCustomUnit, setShowCustomUnit] = useState(false);
     const [isSaving, setIsSaving] = useState(false);

     // ── Change ordering ───────────────────────────────────────────────────────
     const changeOrdering = (item: MasterFieldRule, e: React.ChangeEvent<HTMLInputElement>) => {
          setData((prev) =>
               prev.map((d) => (d.name === item.name ? { ...d, ordering: Number(e.target.value) } : d))
          );
     };

     // ── Start editing an existing row ─────────────────────────────────────────
     const startEditing = (index: number) => {
          setEditingIndex(index);
          const field = data[index];
          setNewField({
               ...field,
               lowerlimit: field.lowerlimit ?? "",
               upperlimit: field.upperlimit ?? "",
               lowerLimitFemale: field.lowerLimitFemale ?? null,
               upperLimitFemale: field.upperLimitFemale ?? null,
               lowerLimitMale: field.lowerLimitMale ?? null,
               upperLimitMale: field.upperLimitMale ?? null,
               lowerLimitChildren: field.lowerLimitChildren ?? null,
               upperLimitChildren: field.upperLimitChildren ?? null,
               lowerLimitNeonates: field.lowerLimitNeonates ?? null,
               upperLimitNeonates: field.upperLimitNeonates ?? null,
          });
          setShowCustomUnit(!!field.units && !STANDARD_UNITS.includes(str(field.units)));
     };

     // ── Cancel edit ───────────────────────────────────────────────────────────
     const cancelEditing = () => {
          setEditingIndex(null);
          setNewField({ ...EMPTY_RULE });
          setShowCustomUnit(false);
     };

     // ── Remove field ──────────────────────────────────────────────────────────
     const removeField = (item: MasterFieldRule) => {
          setData((prev) => prev.filter((d) => d.name !== item.name));
          cancelEditing();
     };

     // ── Save field (inline add or update) ────────────────────────────────────
     const saveField = () => {
          if (!newField.name?.trim()) {
               alert("Field name is required.");
               return;
          }
          if (!newField.plan) {
               alert("Please select a field type.");
               return;
          }
          // Normalize options
          let fieldToSave: MasterFieldRule = {
               ...newField,
               options: Array.isArray(newField.options)
                    ? (newField.options as string[]).join(", ")
                    : str(newField.options),
          };
          if (editingIndex !== null) {
               setData((prev) => {
                    const copy = [...prev];
                    copy[editingIndex] = fieldToSave;
                    return copy;
               });
          } else {
               setData((prev) => [...prev, fieldToSave]);
          }
          cancelEditing();
     };

     // ── Prepare new empty row ─────────────────────────────────────────────────
     const addNewRow = () => {
          setEditingIndex(null);
          setNewField({ ...EMPTY_RULE });
          setShowCustomUnit(false);
     };

     // ── Save all to server ────────────────────────────────────────────────────
     const handleSaveAll = async () => {
          if (data.length === 0) {
               alert("No fields to save.");
               return;
          }
          setIsSaving(true);
          try {
               const sorted = [...data].sort(
                    (a, b) => Number(a.ordering ?? 0) - Number(b.ordering ?? 0)
               );
               const payload: MasterFieldRule[] = sorted.map((rule, i) => ({
                    ...rule,
                    plan: rule.plan || "input",
                    hasunits: rule.hasunits ? 1 : 0,
                    undercategory: rule.undercategory ? 1 : 0,
                    isValueTracked: rule.isValueTracked ? 1 : 0,
                    categoryid: rule.undercategory ? (rule.categoryid ?? null) : null,
                    category: rule.undercategory ? str(rule.categoryid) : "",
                    options: str(rule.options),
                    plain: str(rule.plain),
                    textReference: str(rule.textReference),
                    units: str(rule.units),
                    ordering: Number.isFinite(Number(rule.ordering)) ? Number(rule.ordering) : i,
               }));
               await onSave(payload);
          } catch (err: unknown) {
               alert((err as Error)?.message || "Failed to save fields.");
          } finally {
               setIsSaving(false);
          }
     };

     // ── Resolve category name for display ─────────────────────────────────────
     const catName = (catId: string | number | null | undefined): string => {
          if (catId == null || catId === "") return "–";
          const found = fieldConstraintsCategorization.find(
               (c) => String(c.categoryid) === String(catId)
          );
          return found?.categoryname || "–";
     };

     // ─────────────────────────────────────────────────────────────────────────
     return (
          <div className="card shadow-sm h-100">
               <div className="card-body d-flex flex-column">
                    {/* ── Card header ──────────────────────────────────────── */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <h2 className="card-title fs-5 fw-bold text-dark mb-0">
                              Field Configuration ({data.length})
                         </h2>
                         <button type="button" className="btn btn-primary btn-sm" onClick={addNewRow}>
                              + Add Field
                         </button>
                    </div>

                    {/* ── Table ────────────────────────────────────────────── */}
                    <div className="flex-grow-1" style={{ minHeight: "50vh" }}>
                         <div className="table-responsive">
                              <table className="table table-hover table-striped field-creation-table align-middle">
                                   <thead>
                                        <tr>
                                             <th style={{ width: "18%" }}>Field Name</th>
                                             <th style={{ width: "12%" }}>Plan</th>
                                             <th style={{ width: "10%" }}>Units</th>
                                             <th style={{ width: "15%" }}>Specific Config</th>
                                             <th style={{ width: "12%" }}>Preview</th>
                                             <th style={{ width: "10%" }}>Category</th>
                                             <th style={{ width: "6%" }}>Req?</th>
                                             <th style={{ width: "7%" }}>Order</th>
                                             <th style={{ width: "10%" }}>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {/* ── Existing rows ──────────────── */}
                                        {data.map((field, index) => (
                                             <tr key={field.name || index}>
                                                  {/* Name */}
                                                  <td>
                                                       {editingIndex === index ? (
                                                            <input
                                                                 type="text"
                                                                 className="form-control form-control-sm"
                                                                 value={newField.name || ""}
                                                                 onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                                                 placeholder="Field name"
                                                                 autoFocus
                                                            />
                                                       ) : (
                                                            <strong>{field.name}</strong>
                                                       )}
                                                  </td>
                                                  {/* Plan */}
                                                  <td>
                                                       {editingIndex === index ? (
                                                            <select
                                                                 className="form-select form-select-sm"
                                                                 value={newField.plan || ""}
                                                                 onChange={(e) => setNewField({ ...newField, plan: e.target.value })}
                                                            >
                                                                 <option value="">-- Type --</option>
                                                                 {PLAN_OPTIONS.map((p) => (
                                                                      <option key={p.value} value={p.value}>{p.label}</option>
                                                                 ))}
                                                            </select>
                                                       ) : (
                                                            <span className="text-muted">
                                                                 {PLAN_OPTIONS.find((p) => p.value === field.plan)?.label || field.plan || "–"}
                                                            </span>
                                                       )}
                                                  </td>
                                                  {/* Units */}
                                                  <td>
                                                       {editingIndex === index ? (
                                                            <UnitsCell
                                                                 field={newField}
                                                                 setField={setNewField}
                                                                 showCustomUnit={showCustomUnit}
                                                                 setShowCustomUnit={setShowCustomUnit}
                                                            />
                                                       ) : (
                                                            <span>{str(field.units) || "–"}</span>
                                                       )}
                                                  </td>
                                                  {/* Config */}
                                                  <td>
                                                       {editingIndex === index ? (
                                                            <ConfigInput field={newField} setField={setNewField} />
                                                       ) : (
                                                            <ConfigDisplay field={field} />
                                                       )}
                                                  </td>
                                                  {/* Preview */}
                                                  <td>
                                                       {editingIndex === index
                                                            ? (newField.plan ? <FieldPreview field={newField} /> : <span className="text-muted">–</span>)
                                                            : (field.plan ? <FieldPreview field={field} /> : <span className="text-muted">–</span>)
                                                       }
                                                  </td>
                                                  {/* Category */}
                                                  <td>
                                                       {editingIndex === index ? (
                                                            <select
                                                                 className="form-select form-select-sm"
                                                                 value={str(newField.categoryid)}
                                                                 onChange={(e) => setNewField({
                                                                      ...newField,
                                                                      categoryid: e.target.value,
                                                                      category: e.target.value,
                                                                      undercategory: e.target.value ? 1 : 0,
                                                                 })}
                                                            >
                                                                 <option value="">-- Select --</option>
                                                                 {fieldConstraintsCategorization.map((cat) => (
                                                                      <option key={String(cat.categoryid)} value={String(cat.categoryid)}>
                                                                           {cat.categoryname}
                                                                      </option>
                                                                 ))}
                                                            </select>
                                                       ) : (
                                                            <span>{catName(field.categoryid)}</span>
                                                       )}
                                                  </td>
                                                  {/* Required */}
                                                  <td className="text-center">
                                                       {editingIndex === index ? (
                                                            <input
                                                                 type="checkbox"
                                                                 className="form-check-input"
                                                                 checked={!!newField.isRequired}
                                                                 onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                                                            />
                                                       ) : (
                                                            field.isRequired
                                                                 ? <span className="text-success fw-bold">✓</span>
                                                                 : <span className="text-muted">–</span>
                                                       )}
                                                  </td>
                                                  {/* Order */}
                                                  <td>
                                                       <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={field.ordering ?? ""}
                                                            onChange={(e) => changeOrdering(field, e)}
                                                            placeholder="0"
                                                            style={{ width: 60 }}
                                                       />
                                                  </td>
                                                  {/* Actions */}
                                                  <td>
                                                       {editingIndex === index ? (
                                                            <div className="d-flex gap-1">
                                                                 <button type="button" className="btn btn-success btn-sm" onClick={saveField} title="Save">✓</button>
                                                                 <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelEditing} title="Cancel">✕</button>
                                                            </div>
                                                       ) : (
                                                            <div className="d-flex gap-1">
                                                                 <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => startEditing(index)} title="Edit">✎</button>
                                                                 <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeField(field)} title="Remove">✕</button>
                                                            </div>
                                                       )}
                                                  </td>
                                             </tr>
                                        ))}

                                        {/* ── New field row (table-warning, visible when not editing) ── */}
                                        {editingIndex === null && (
                                             <tr className="table-warning">
                                                  <td>
                                                       <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={newField.name || ""}
                                                            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                                            placeholder="Enter field name"
                                                            autoFocus
                                                       />
                                                  </td>
                                                  <td>
                                                       <select
                                                            className="form-select form-select-sm"
                                                            value={newField.plan || ""}
                                                            onChange={(e) => setNewField({ ...newField, plan: e.target.value })}
                                                       >
                                                            <option value="">-- Select Type --</option>
                                                            {PLAN_OPTIONS.map((p) => (
                                                                 <option key={p.value} value={p.value}>{p.label}</option>
                                                            ))}
                                                       </select>
                                                  </td>
                                                  <td>
                                                       <UnitsCell
                                                            field={newField}
                                                            setField={setNewField}
                                                            showCustomUnit={showCustomUnit}
                                                            setShowCustomUnit={setShowCustomUnit}
                                                       />
                                                  </td>
                                                  <td>
                                                       <ConfigInput field={newField} setField={setNewField} />
                                                  </td>
                                                  <td>
                                                       {newField.plan
                                                            ? <FieldPreview field={newField} />
                                                            : <span className="text-muted">–</span>}
                                                  </td>
                                                  <td>
                                                       <select
                                                            className="form-select form-select-sm"
                                                            value={str(newField.categoryid)}
                                                            onChange={(e) => setNewField({
                                                                 ...newField,
                                                                 categoryid: e.target.value,
                                                                 category: e.target.value,
                                                                 undercategory: e.target.value ? 1 : 0,
                                                            })}
                                                       >
                                                            <option value="">-- Select --</option>
                                                            {fieldConstraintsCategorization.map((cat) => (
                                                                 <option key={String(cat.categoryid)} value={String(cat.categoryid)}>
                                                                      {cat.categoryname}
                                                                 </option>
                                                            ))}
                                                       </select>
                                                  </td>
                                                  <td className="text-center">
                                                       <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={!!newField.isRequired}
                                                            onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
                                                       />
                                                  </td>
                                                  <td>
                                                       <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={newField.ordering ?? ""}
                                                            onChange={(e) => setNewField({ ...newField, ordering: Number(e.target.value) })}
                                                            placeholder="0"
                                                            style={{ width: 60 }}
                                                       />
                                                  </td>
                                                  <td>
                                                       <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            onClick={saveField}
                                                            disabled={!newField.name?.trim() || !newField.plan}
                                                       >
                                                            + Add
                                                       </button>
                                                  </td>
                                             </tr>
                                        )}
                                   </tbody>
                              </table>
                         </div>
                    </div>

                    {/* ── Save All Changes ─────────────────────────────────── */}
                    {data.length > 0 && (
                         <div className="d-flex gap-2 mt-auto pt-3 border-top justify-content-end">
                              <button
                                   type="button"
                                   className="btn btn-success btn-sm"
                                   onClick={handleSaveAll}
                                   disabled={isSaving}
                              >
                                   {isSaving ? (
                                        <>
                                             <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                                             Saving Changes...
                                        </>
                                   ) : (
                                        "Save All Changes"
                                   )}
                              </button>
                         </div>
                    )}
               </div>
          </div>
     );
}
