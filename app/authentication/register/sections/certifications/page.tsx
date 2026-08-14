"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import { SECTION_CONFIGS } from "../../sectionDraft";
import { Button } from "react-bootstrap";
import { RiAwardLine, RiDeleteBinLine } from "@remixicon/react";
import SectionPageShell, { SectionEmptyState, SectionField, SectionRecordCard } from "../SectionPageShell";

type DraftRow = Record<string, string> & { __id?: string };
const SECTION_KEY = "certifications" as const;
const ENDPOINT_SLUG = "certifications";
const FIELD_CONFIGS = SECTION_CONFIGS[SECTION_KEY].fields;

function createEmptyRow(): DraftRow {
     const row: DraftRow = {};
     FIELD_CONFIGS.forEach((field) => {
          row[field.key] = "";
     });
     return row;
}

function toQuerySuffix(employeeid: string | null): string {
     return employeeid ? `?employeeid=${employeeid}` : "";
}

function inferRecordId(record: any): string | undefined {
     const candidates = [
          record?.id,
          record?.employmentHistoryId,
          record?.certificationId,
          record?.educationId,
          record?.licenseId,
          record?.bankAccountId,
          record?.attendanceId,
     ];
     const picked = candidates.find((value) => value != null && String(value).trim() !== "");
     return picked != null ? String(picked) : undefined;
}

function normalizeValueByType(value: any, fieldType: string): string {
     if (value == null) {
          return "";
     }

     const raw = String(value);
     if (!raw) {
          return "";
     }

     if (fieldType === "date") {
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
               return raw;
          }
          const parsed = new Date(raw);
          if (!Number.isNaN(parsed.getTime())) {
               return parsed.toISOString().slice(0, 10);
          }
          return raw.length >= 10 ? raw.slice(0, 10) : raw;
     }

     if (fieldType === "time") {
          const match = raw.match(/(\d{2}):(\d{2})/);
          if (match) {
               return `${match[1]}:${match[2]}`;
          }
          return raw;
     }

     return raw;
}

function normalizeRowsFromBackend(records: any[]): DraftRow[] {
     return records.map((record) => {
          const normalized: DraftRow = {};
          FIELD_CONFIGS.forEach((field) => {
               normalized[field.key] = normalizeValueByType(record?.[field.key], field.type);
          });
          const rowId = inferRecordId(record);
          if (rowId) {
               normalized.__id = rowId;
          }
          return normalized;
     });
}

function filterNonEmptyRows(rows: DraftRow[]): DraftRow[] {
     return rows.filter((row) => FIELD_CONFIGS.some((field) => String(row[field.key] || "").trim()));
}

function buildPayload(row: DraftRow, employeeid: string): Record<string, string | number> {
     const payload: Record<string, string | number> = {
          employeeId: Number(employeeid),
     };
     FIELD_CONFIGS.forEach((field) => {
          payload[field.key] = row[field.key] || "";
     });
     return payload;
}

export default function SectionPage() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const employeeid = searchParams ? searchParams.get("employeeid") : null;

     useEffect(() => {
          if (!employeeid) {
               router.replace("/authentication/users");
          }
     }, [employeeid, router]);

     const [rows, setRows] = useState<DraftRow[]>([]);
     const [loadingServer, setLoadingServer] = useState(false);
     const [savingServer, setSavingServer] = useState(false);
     const [hasInitializedServerData, setHasInitializedServerData] = useState(false);
     const [isEditing, setIsEditing] = useState(true);

     const config = SECTION_CONFIGS[SECTION_KEY];
     const querySuffix = toQuerySuffix(employeeid);

     const fetchFromBackend = async (silent = false) => {
          if (!employeeid) {
               if (!silent) {
                    toast.info("Create the employee account first, then open this page with an employeeid to fetch records.");
               }
               return;
          }

          try {
               setLoadingServer(true);
               const response = await customFetch(`employees/${employeeid}/${ENDPOINT_SLUG}`);
               const records = Array.isArray(response?.result) ? response.result : Array.isArray(response) ? response : [];
               const normalizedRows = normalizeRowsFromBackend(records);
               if (normalizedRows.length === 0) {
                    setRows([createEmptyRow()]);
                    setIsEditing(true);
                    if (!silent) {
                         toast.info(`No ${config.title.toLowerCase()} records found.`);
                    }
                    return;
               }

               setRows(normalizedRows);
               setIsEditing(false);
          } catch {
               if (!silent) {
                    toast.error(`Failed to load ${config.title.toLowerCase()}.`);
               }
          } finally {
               setLoadingServer(false);
               setHasInitializedServerData(true);
          }
     };

     useEffect(() => {
          if (!employeeid || hasInitializedServerData) {
               return;
          }
          fetchFromBackend(true);
     }, [employeeid, hasInitializedServerData]);

     const saveToBackend = async () => {
          if (!employeeid) {
               toast.info("Create the employee account first, then open this page with an employeeid to save records.");
               return;
          }

          const actionableRows = filterNonEmptyRows(rows);
          if (actionableRows.length === 0) {
               toast.info(`Add at least one ${config.itemLabel.toLowerCase()} record before saving.`);
               return;
          }

          try {
               setSavingServer(true);

               for (const row of actionableRows) {
                    const payload = buildPayload(row, employeeid);
                    if (row.__id) {
                         await customPost(`employees/${ENDPOINT_SLUG}/${row.__id}`, "PUT", payload);
                    } else {
                         await customPost(`employees/${ENDPOINT_SLUG}`, "POST", payload);
                    }
               }

               await fetchFromBackend(true);
               setIsEditing(false);
               toast.success(`${config.title} saved successfully.`);
          } catch {
               toast.error(`Failed to save ${config.title.toLowerCase()}.`);
          } finally {
               setSavingServer(false);
          }
     };

     const updateField = (rowIndex: number, fieldKey: string, value: string) => {
          setRows((prev) => prev.map((row, index) => (index === rowIndex ? { ...row, [fieldKey]: value } : row)));
     };

     const removeRow = (rowIndex: number) => {
          setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((_, index) => index !== rowIndex)));
     };

     const nonEmptyRows = filterNonEmptyRows(rows);

     return (
          <SectionPageShell
               title={config.title}
               itemLabel={config.itemLabel}
               icon={<RiAwardLine size={16} />}
               badge="Employee Profile"
               backHref={`/authentication/register${querySuffix}`}
               isEditing={isEditing}
               loadingServer={loadingServer}
               savingServer={savingServer}
               recordCount={nonEmptyRows.length}
               onEdit={() => setIsEditing(true)}
               onCancel={() => setIsEditing(false)}
               onSave={saveToBackend}
               onAdd={() => setRows((prev) => [...prev, createEmptyRow()])}
          >
               {!isEditing && (
                    <>
                         {nonEmptyRows.length === 0 && (
                              <SectionEmptyState message={`No ${config.itemLabel.toLowerCase()} records yet.`} />
                         )}

                         {nonEmptyRows.map((row, rowIndex) => (
                              <SectionRecordCard
                                   key={`view-row-${rowIndex}`}
                                   title={`${config.itemLabel} #${rowIndex + 1}`}
                              >
                                   <div className="row g-3">
                                        {FIELD_CONFIGS.map((field) => (
                                             <SectionField
                                                  key={`view-${rowIndex}-${field.key}`}
                                                  label={field.label}
                                                  value={row[field.key]}
                                             />
                                        ))}
                                   </div>
                              </SectionRecordCard>
                         ))}
                    </>
               )}

               {isEditing && (
                    <>
                         {rows.map((row, rowIndex) => (
                              <SectionRecordCard
                                   key={`row-${rowIndex}`}
                                   title={`${config.itemLabel} #${rowIndex + 1}`}
                                   actions={
                                        <Button size="sm" variant="outline-danger" onClick={() => removeRow(rowIndex)}>
                                             <RiDeleteBinLine size={14} className="me-1" />
                                             Remove
                                        </Button>
                                   }
                              >
                                   <div className="row g-3">
                                        {FIELD_CONFIGS.map((field) => (
                                             <div className="col-md-6" key={`${rowIndex}-${field.key}`}>
                                                  <label className="form-label fw-medium">{field.label}</label>
                                                  {field.type === "textarea" ? (
                                                       <textarea
                                                            className="form-control"
                                                            value={row[field.key] || ""}
                                                            onChange={(event) => updateField(rowIndex, field.key, event.target.value)}
                                                            placeholder={field.placeholder || ""}
                                                            rows={3}
                                                       />
                                                  ) : (
                                                       <input
                                                            className="form-control"
                                                            type={field.type}
                                                            value={row[field.key] || ""}
                                                            onChange={(event) => updateField(rowIndex, field.key, event.target.value)}
                                                            placeholder={field.placeholder || ""}
                                                       />
                                                  )}
                                             </div>
                                        ))}
                                   </div>
                              </SectionRecordCard>
                         ))}
                    </>
               )}
          </SectionPageShell>
     );
}
