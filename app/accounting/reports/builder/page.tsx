"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
     DatasetColumnMeta,
     DatasetMeta,
     ReportDefinition,
     ReportFilter,
     ReportOperator,
     ReportResult,
     downloadReportExport,
     fetchReportDatasets,
     previewReport,
     saveReport,
} from "../../../../lib/reports/reportApi";

type FilterRow = { id: string; column: string; operator: ReportOperator; value: string; value2: string };

const OPERATORS_BY_TYPE: Record<string, Array<{ value: ReportOperator; label: string }>> = {
     string: [
          { value: "eq", label: "equals" },
          { value: "neq", label: "does not equal" },
          { value: "contains", label: "contains" },
          { value: "in", label: "is one of" },
     ],
     number: [
          { value: "eq", label: "=" },
          { value: "neq", label: "≠" },
          { value: "gte", label: "≥" },
          { value: "lte", label: "≤" },
          { value: "between", label: "between" },
     ],
     money: [
          { value: "eq", label: "=" },
          { value: "neq", label: "≠" },
          { value: "gte", label: "≥" },
          { value: "lte", label: "≤" },
          { value: "between", label: "between" },
     ],
     date: [
          { value: "eq", label: "on" },
          { value: "between", label: "between" },
          { value: "gte", label: "on or after" },
          { value: "lte", label: "on or before" },
     ],
};

let filterSequence = 0;
const nextFilterId = () => `filter-${++filterSequence}`;

function formatCell(value: unknown): string {
     if (value === null || value === undefined || value === "") return "—";
     if (typeof value === "number") return value.toLocaleString("en-GB", { maximumFractionDigits: 2 });
     if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
     return String(value);
}

function typeBadge(type: string) {
     const tone = type === "money" ? "text-bg-success" : type === "number" || type === "count" ? "text-bg-primary" : type === "date" ? "text-bg-warning" : "text-bg-light";
     return <span className={`badge ${tone} fw-normal`}>{type}</span>;
}

export default function ReportBuilderPage() {
     const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
     const [datasetId, setDatasetId] = useState("");
     const [selected, setSelected] = useState<string[]>([]);
     const [groupBy, setGroupBy] = useState<string[]>([]);
     const [filters, setFilters] = useState<FilterRow[]>([]);
     const [sortColumn, setSortColumn] = useState("");
     const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
     const [limit, setLimit] = useState(200);
     const [preview, setPreview] = useState<ReportResult | null>(null);
     const [lastRun, setLastRun] = useState("");
     const [loading, setLoading] = useState(false);
     const [datasetsLoading, setDatasetsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [notice, setNotice] = useState<string | null>(null);
     const [saveOpen, setSaveOpen] = useState(false);
     const [saveName, setSaveName] = useState("");
     const [saveDescription, setSaveDescription] = useState("");
     const [saveVisibility, setSaveVisibility] = useState<"private" | "facility">("private");
     const [saving, setSaving] = useState(false);

     const dataset = useMemo(() => datasets.find((entry) => entry.id === datasetId) ?? null, [datasets, datasetId]);
     const columnMap = useMemo(() => new Map((dataset?.columns ?? []).map((column) => [column.key, column])), [dataset]);
     const selectedColumns = useMemo(() => selected.map((key) => columnMap.get(key)).filter(Boolean) as DatasetColumnMeta[], [selected, columnMap]);
     const dimensions = useMemo(() => (dataset?.columns ?? []).filter((column) => column.groupable), [dataset]);
     const measures = useMemo(() => (dataset?.columns ?? []).filter((column) => !column.groupable && column.aggregate), [dataset]);
     const details = useMemo(() => (dataset?.columns ?? []).filter((column) => !column.groupable && !column.aggregate), [dataset]);

     const loadDatasets = useCallback(async () => {
          setDatasetsLoading(true);
          setError(null);
          try {
               const loaded = await fetchReportDatasets();
               setDatasets(loaded);
               if (loaded.length && !datasetId) {
                    setDatasetId(loaded[0].id);
                    setSelected(loaded[0].defaultColumns);
               }
          } catch (loadError: any) {
               setError(loadError?.message || "Unable to load report datasets.");
          } finally {
               setDatasetsLoading(false);
          }
     }, [datasetId]);

     useEffect(() => {
          let active = true;
          fetchReportDatasets()
               .then((loaded) => {
                    if (!active) return;
                    setDatasets(loaded);
                    if (loaded.length) {
                         setDatasetId(loaded[0].id);
                         setSelected(loaded[0].defaultColumns);
                    }
               })
               .catch((loadError: any) => {
                    if (active) setError(loadError?.message || "Unable to load report datasets.");
               })
               .finally(() => {
                    if (active) setDatasetsLoading(false);
               });
          return () => { active = false; };
     }, []);

     const chooseDataset = (id: string) => {
          const next = datasets.find((entry) => entry.id === id);
          setDatasetId(id);
          setSelected(next?.defaultColumns ?? []);
          setGroupBy([]);
          setFilters([]);
          setSortColumn("");
          setPreview(null);
          setLastRun("");
          setError(null);
          setNotice(null);
     };

     const toggleColumn = (key: string, checked: boolean) => {
          setSelected((current) => {
               if (checked) return current.includes(key) ? current : [...current, key];
               setGroupBy((groups) => groups.filter((group) => group !== key));
               return current.filter((entry) => entry !== key);
          });
          if (!checked && sortColumn === key) setSortColumn("");
     };

     const toggleGroup = (key: string, checked: boolean) => {
          setGroupBy((current) => (checked ? [...current, key] : current.filter((entry) => entry !== key)));
          if (checked) setSelected((current) => (current.includes(key) ? current : [...current, key]));
     };

     const addFilter = () => {
          const column = dataset?.columns.find((entry) => entry.filterable);
          if (!column) return;
          const operator = OPERATORS_BY_TYPE[column.type][0].value;
          setFilters((current) => [...current, { id: nextFilterId(), column: column.key, operator, value: "", value2: "" }]);
     };

     const updateFilter = (id: string, patch: Partial<FilterRow>) => {
          setFilters((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
     };

     const removeFilter = (id: string) => setFilters((current) => current.filter((row) => row.id !== id));

     const changeFilterColumn = (id: string, key: string) => {
          const column = columnMap.get(key);
          const operator = OPERATORS_BY_TYPE[column?.type ?? "string"][0].value;
          updateFilter(id, { column: key, operator, value: "", value2: "" });
     };

     const buildDefinition = (): ReportDefinition => {
          const parsedFilters: ReportFilter[] = filters.reduce<ReportFilter[]>((result, row) => {
               if (!row.column) return result;
               if (row.operator === "between") {
                    if (!row.value || !row.value2) return result;
                    result.push({ column: row.column, operator: row.operator, value: [row.value, row.value2] });
                    return result;
               }
               if (row.operator === "in") {
                    const values = row.value.split(",").map((entry) => entry.trim()).filter(Boolean);
                    if (!values.length) return result;
                    const column = columnMap.get(row.column);
                    result.push({
                         column: row.column,
                         operator: row.operator,
                         value: column && (column.type === "number" || column.type === "money") ? values.map((entry) => Number(entry)) : values,
                    });
                    return result;
               }
               if (!row.value) return result;
               result.push({ column: row.column, operator: row.operator, value: row.value });
               return result;
          }, []);

          return {
               dataset: datasetId,
               columns: selected,
               groupBy,
               filters: parsedFilters,
               sort: sortColumn ? [{ column: sortColumn, direction: sortDirection }] : [],
               limit,
          };
     };

     const definitionSignature = (definition: ReportDefinition) => JSON.stringify(definition);

     const runPreview = async () => {
          if (!datasetId) return;
          if (!selected.length) {
               setError("Select at least one column.");
               return;
          }
          const definition = buildDefinition();
          setLoading(true);
          setError(null);
          setNotice(null);
          try {
               const result = await previewReport(definition);
               setPreview(result);
               setLastRun(definitionSignature(definition));
          } catch (runError: any) {
               setError(runError?.message || "Unable to run the report.");
          } finally {
               setLoading(false);
          }
     };

     const exportNow = async (format: "csv" | "xlsx") => {
          if (!selected.length) {
               setError("Select at least one column before exporting.");
               return;
          }
          setLoading(true);
          setError(null);
          try {
               await downloadReportExport(buildDefinition(), format);
          } catch (exportError: any) {
               setError(exportError?.message || "The export could not be created.");
          } finally {
               setLoading(false);
          }
     };

     const openSave = () => {
          if (!preview) {
               setError("Run the report once before saving it.");
               return;
          }
          setSaveName(`${dataset?.label ?? "Report"} — ${new Date().toLocaleDateString("en-GB")}`);
          setSaveDescription("");
          setSaveVisibility("private");
          setSaveOpen(true);
     };

     const confirmSave = async () => {
          if (!saveName.trim()) {
               setError("Give the report a name.");
               return;
          }
          setSaving(true);
          setError(null);
          try {
               const saved = await saveReport({
                    name: saveName.trim(),
                    description: saveDescription.trim() || null,
                    visibility: saveVisibility,
                    definition: buildDefinition(),
               });
               setSaveOpen(false);
               setNotice(`Saved “${saved.name}”. You can find it in Saved reports.`);
          } catch (saveError: any) {
               setError(saveError?.message || "Unable to save the report.");
          } finally {
               setSaving(false);
          }
     };

     const isStale = preview !== null && lastRun !== definitionSignature(buildDefinition());

     return (
          <div className="container-fluid py-4">
               <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                         <h1 className="h3 mb-1">Report builder</h1>
                         <p className="text-muted mb-0">Choose a dataset, columns and filters, then run, export or save the report.</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Link className="btn btn-outline-secondary btn-sm" href="/accounting/reports">Reports centre</Link>
                         <Link className="btn btn-outline-primary btn-sm" href="/accounting/reports/saved">Saved reports</Link>
                    </div>
               </div>

               {error && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                         <span>{error}</span>
                         <div className="d-flex gap-2">
                              {datasets.length === 0 && (
                                   <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void loadDatasets()} disabled={datasetsLoading}>Retry</button>
                              )}
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setError(null)}>Dismiss</button>
                         </div>
                    </div>
               )}
               {notice && (
                    <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
                         <span>{notice}</span>
                         <button type="button" className="btn btn-sm btn-outline-success" onClick={() => setNotice(null)}>Dismiss</button>
                    </div>
               )}

               <div className="row g-3">
                    <div className="col-12 col-xl-4">
                         <div className="card h-100">
                              <div className="card-body">
                                   <label className="form-label fw-semibold" htmlFor="report-dataset">Dataset</label>
                                   <select
                                        id="report-dataset"
                                        className="form-select mb-2"
                                        value={datasetId}
                                        disabled={datasetsLoading}
                                        onChange={(event) => chooseDataset(event.target.value)}
                                   >
                                        {datasets.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
                                   </select>
                                   <p className="text-muted small mb-3">{dataset?.description ?? (datasetsLoading ? "Loading datasets…" : "No datasets available.")}</p>

                                   <fieldset className="mb-3">
                                        <legend className="form-label fw-semibold fs-6">Columns</legend>
                                        {[["Dimensions", dimensions], ["Measures", measures], ["Details", details]].map(([title, columns]) => (
                                             (columns as DatasetColumnMeta[]).length > 0 && (
                                                  <div key={String(title)} className="mb-2">
                                                       <div className="text-uppercase text-muted small fw-semibold mb-1">{String(title)}</div>
                                                       {(columns as DatasetColumnMeta[]).map((column) => (
                                                            <div className="form-check" key={column.key}>
                                                                 <input
                                                                      className="form-check-input"
                                                                      type="checkbox"
                                                                      id={`column-${column.key}`}
                                                                      checked={selected.includes(column.key)}
                                                                      onChange={(event) => toggleColumn(column.key, event.target.checked)}
                                                                 />
                                                                 <label className="form-check-label" htmlFor={`column-${column.key}`}>
                                                                      {column.label} <span className="ms-1">{typeBadge(column.type)}</span>
                                                                 </label>
                                                            </div>
                                                       ))}
                                                  </div>
                                             )
                                        ))}
                                   </fieldset>

                                   <fieldset className="mb-3">
                                        <legend className="form-label fw-semibold fs-6">Group by</legend>
                                        {dimensions.length === 0 && <p className="text-muted small mb-0">This dataset has no grouping columns.</p>}
                                        {dimensions.map((column) => (
                                             <div className="form-check form-check-inline" key={`group-${column.key}`}>
                                                  <input
                                                       className="form-check-input"
                                                       type="checkbox"
                                                       id={`group-${column.key}`}
                                                       checked={groupBy.includes(column.key)}
                                                       onChange={(event) => toggleGroup(column.key, event.target.checked)}
                                                  />
                                                  <label className="form-check-label" htmlFor={`group-${column.key}`}>{column.label}</label>
                                             </div>
                                        ))}
                                        {groupBy.length > 0 && <p className="text-muted small mb-0 mt-1">Measures are totalled or averaged for each group.</p>}
                                   </fieldset>

                                   <fieldset className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                             <legend className="form-label fw-semibold fs-6 mb-0">Filters</legend>
                                             <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addFilter} disabled={!dataset}>Add filter</button>
                                        </div>
                                        {filters.length === 0 && <p className="text-muted small mb-0">No filters. The report will use the first {limit} rows.</p>}
                                        {filters.map((row) => {
                                             const column = columnMap.get(row.column);
                                             const operators = OPERATORS_BY_TYPE[column?.type ?? "string"];
                                             return (
                                                  <div className="border rounded p-2 mb-2" key={row.id}>
                                                       <div className="row g-1 align-items-center">
                                                            <div className="col-12">
                                                                 <label className="form-label small mb-0" htmlFor={`filter-column-${row.id}`}>Column</label>
                                                                 <select id={`filter-column-${row.id}`} className="form-select form-select-sm" value={row.column}
                                                                      onChange={(event) => changeFilterColumn(row.id, event.target.value)}>
                                                                      {(dataset?.columns ?? []).filter((entry) => entry.filterable).map((entry) => (
                                                                           <option key={entry.key} value={entry.key}>{entry.label}</option>
                                                                      ))}
                                                                 </select>
                                                            </div>
                                                            <div className="col-12">
                                                                 <label className="form-label small mb-0" htmlFor={`filter-operator-${row.id}`}>Condition</label>
                                                                 <select id={`filter-operator-${row.id}`} className="form-select form-select-sm" value={row.operator}
                                                                      onChange={(event) => updateFilter(row.id, { operator: event.target.value as ReportOperator, value: "", value2: "" })}>
                                                                      {operators.map((operator) => <option key={operator.value} value={operator.value}>{operator.label}</option>)}
                                                                 </select>
                                                            </div>
                                                            <div className="col-12">
                                                                 <label className="form-label small mb-0" htmlFor={`filter-value-${row.id}`}>
                                                                      {row.operator === "between" ? "From" : row.operator === "in" ? "Values (comma separated)" : "Value"}
                                                                 </label>
                                                                 <input
                                                                      id={`filter-value-${row.id}`}
                                                                      className="form-control form-control-sm"
                                                                      type={column?.type === "date" ? "date" : column?.type === "number" || column?.type === "money" ? "number" : "text"}
                                                                      value={row.value}
                                                                      onChange={(event) => updateFilter(row.id, { value: event.target.value })}
                                                                 />
                                                            </div>
                                                            {row.operator === "between" && (
                                                                 <div className="col-12">
                                                                      <label className="form-label small mb-0" htmlFor={`filter-value2-${row.id}`}>To</label>
                                                                      <input
                                                                           id={`filter-value2-${row.id}`}
                                                                           className="form-control form-control-sm"
                                                                           type={column?.type === "date" ? "date" : "number"}
                                                                           value={row.value2}
                                                                           onChange={(event) => updateFilter(row.id, { value2: event.target.value })}
                                                                      />
                                                                 </div>
                                                            )}
                                                            <div className="col-12 text-end">
                                                                 <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => removeFilter(row.id)}>Remove</button>
                                                            </div>
                                                       </div>
                                                  </div>
                                             );
                                        })}
                                   </fieldset>

                                   <div className="row g-2 mb-3">
                                        <div className="col-7">
                                             <label className="form-label fw-semibold" htmlFor="report-sort">Sort by</label>
                                             <select id="report-sort" className="form-select form-select-sm" value={sortColumn} onChange={(event) => setSortColumn(event.target.value)}>
                                                  <option value="">Default</option>
                                                  {selectedColumns.map((column) => <option key={column.key} value={column.key}>{column.label}</option>)}
                                             </select>
                                        </div>
                                        <div className="col-5">
                                             <label className="form-label fw-semibold" htmlFor="report-direction">Direction</label>
                                             <select id="report-direction" className="form-select form-select-sm" value={sortDirection}
                                                  onChange={(event) => setSortDirection(event.target.value === "asc" ? "asc" : "desc")} disabled={!sortColumn}>
                                                  <option value="desc">Descending</option>
                                                  <option value="asc">Ascending</option>
                                             </select>
                                        </div>
                                        <div className="col-5">
                                             <label className="form-label fw-semibold" htmlFor="report-limit">Rows</label>
                                             <input id="report-limit" className="form-control form-control-sm" type="number" min={1} max={5000} value={limit}
                                                  onChange={(event) => setLimit(Math.max(1, Math.min(5000, Number(event.target.value) || 200)))} />
                                        </div>
                                   </div>

                                   <button type="button" className="btn btn-primary w-100" onClick={runPreview} disabled={loading || !datasetId}>
                                        {loading ? "Running…" : "Run report"}
                                   </button>
                              </div>
                         </div>
                    </div>

                    <div className="col-12 col-xl-8">
                         <div className="card h-100">
                              <div className="card-body">
                                   <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                                        <div>
                                             <h2 className="h5 mb-0">{preview ? (preview.datasetLabel ?? "Preview") : "Preview"}</h2>
                                             {preview && (
                                                  <p className="text-muted small mb-0">
                                                       {preview.rows.length} row{preview.rows.length === 1 ? "" : "s"} · limit {preview.limit} · {preview.grouped ? "grouped" : "row level"}
                                                       {isStale && <span className="text-warning ms-2">Definition changed — run again.</span>}
                                                  </p>
                                             )}
                                        </div>
                                        <div className="d-flex gap-2">
                                             <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exportNow("csv")} disabled={!preview || loading}>CSV</button>
                                             <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => exportNow("xlsx")} disabled={!preview || loading}>Excel</button>
                                             <button type="button" className="btn btn-sm btn-success" onClick={openSave} disabled={!preview || loading}>Save report</button>
                                        </div>
                                   </div>

                                   {!preview && !loading && (
                                        <div className="text-center text-muted py-5" role="status">
                                             <p className="mb-1">Choose columns and filters, then select <strong>Run report</strong>.</p>
                                             <p className="small mb-0">Nothing is saved until you choose <strong>Save report</strong>.</p>
                                        </div>
                                   )}
                                   {loading && <div className="text-center text-muted py-5" role="status">Running the report…</div>}

                                   {preview && (
                                        <div className="table-responsive" style={{ maxHeight: "65vh" }}>
                                             <table className="table table-sm table-striped align-middle mb-0">
                                                  <caption className="visually-hidden">Report preview</caption>
                                                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                                       <tr>
                                                            {preview.columns.map((column) => (
                                                                 <th key={column.key} scope="col" className="text-nowrap">
                                                                      {column.label} {typeBadge(column.type)}
                                                                 </th>
                                                            ))}
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {preview.rows.map((row, index) => (
                                                            <tr key={index}>
                                                                 {preview.columns.map((column) => (
                                                                      <td key={column.key} className={column.type === "money" || column.type === "number" || column.type === "count" ? "text-end text-nowrap" : ""}>
                                                                           {formatCell(row[column.key])}
                                                                      </td>
                                                                 ))}
                                                            </tr>
                                                       ))}
                                                       {preview.rows.length === 0 && (
                                                            <tr><td colSpan={preview.columns.length} className="text-center text-muted py-3">No rows match these filters.</td></tr>
                                                       )}
                                                  </tbody>
                                             </table>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {saveOpen && (
                    <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="save-report-title">
                         <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h2 className="modal-title h5" id="save-report-title">Save report</h2>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setSaveOpen(false)} />
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label" htmlFor="save-report-name">Name</label>
                                             <input id="save-report-name" className="form-control" value={saveName} maxLength={160}
                                                  onChange={(event) => setSaveName(event.target.value)} />
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label" htmlFor="save-report-description">Description (optional)</label>
                                             <textarea id="save-report-description" className="form-control" rows={2} maxLength={500}
                                                  value={saveDescription} onChange={(event) => setSaveDescription(event.target.value)} />
                                        </div>
                                        <div className="mb-0">
                                             <label className="form-label" htmlFor="save-report-visibility">Who can see it</label>
                                             <select id="save-report-visibility" className="form-select" value={saveVisibility}
                                                  onChange={(event) => setSaveVisibility(event.target.value === "facility" ? "facility" : "private")}>
                                                  <option value="private">Only me</option>
                                                  <option value="facility">Everyone with report access</option>
                                             </select>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setSaveOpen(false)} disabled={saving}>Cancel</button>
                                        <button type="button" className="btn btn-primary" onClick={confirmSave} disabled={saving}>
                                             {saving ? "Saving…" : "Save report"}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
