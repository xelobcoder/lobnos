"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import { SECTION_CONFIGS, loadSectionDraft, saveSectionDraft } from "../../sectionDraft";
import { Button } from "react-bootstrap";
import { RiContactsBookLine, RiDeleteBinLine } from "@remixicon/react";
import SectionPageShell, { SectionEmptyState, SectionField, SectionRecordCard } from "../SectionPageShell";

type DraftRow = Record<string, string> & { __id?: string };

const SECTION_KEY = "emergency-contacts" as const;
const SECTION_FIELD_KEYS = SECTION_CONFIGS[SECTION_KEY].fields.map((field) => field.key);

function createEmptyRow(): DraftRow {
     const row: DraftRow = {};
     SECTION_FIELD_KEYS.forEach((fieldKey) => {
          row[fieldKey] = "";
     });
     return row;
}

function toQuerySuffix(employeeid: string | null): string {
     return employeeid ? `?employeeid=${employeeid}` : "";
}

function filterNonEmptyRows(rows: DraftRow[]): DraftRow[] {
     return rows.filter((row) => SECTION_FIELD_KEYS.some((key) => String(row[key] || "").trim()));
}

function normalizeRowsFromBackend(records: any[]): DraftRow[] {
     return records.map((record) => {
          const normalized: DraftRow = {};
          SECTION_FIELD_KEYS.forEach((key) => {
               normalized[key] = record?.[key] != null ? String(record[key]) : "";
          });
          const rowId = record?.id ?? record?.contactId ?? record?.emergencyContactId;
          if (rowId != null) {
               normalized.__id = String(rowId);
          }
          return normalized;
     });
}

export default function EmergencyContactsSectionPage() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const employeeid = searchParams ? searchParams.get("employeeid") : null;
     const sectionScope = employeeid || "new";

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

     useEffect(() => {
          const loaded = loadSectionDraft(sectionScope, SECTION_KEY);
          setRows(loaded.length > 0 ? loaded : [createEmptyRow()]);
     }, [sectionScope]);

     useEffect(() => {
          if (rows.length === 0) {
               return;
          }
          saveSectionDraft(sectionScope, SECTION_KEY, rows);
     }, [rows, sectionScope]);

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
               const response = await customFetch(`employees/${employeeid}/emergency-contacts`);
               const records = Array.isArray(response?.result) ? response.result : Array.isArray(response) ? response : [];
               const normalizedRows = normalizeRowsFromBackend(records);
               if (normalizedRows.length === 0) {
                    setRows([createEmptyRow()]);
                    setIsEditing(true);
                    if (!silent) {
                         toast.info("No emergency contact records found.");
                    }
                    return;
               }

               setRows(normalizedRows);
               setIsEditing(false);
          } catch {
               if (!silent) {
                    toast.error("Failed to load emergency contacts.");
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

          const nonEmptyRows = filterNonEmptyRows(rows);
          if (nonEmptyRows.length === 0) {
               toast.info("Add at least one contact record before saving.");
               return;
          }

          try {
               setSavingServer(true);
               for (const row of nonEmptyRows) {
                    const payload: Record<string, string | number> = {
                         employeeId: Number(employeeid),
                    };
                    SECTION_FIELD_KEYS.forEach((key) => {
                         payload[key] = row[key] || "";
                    });

                    await customPost("employees/emergency-contacts", "POST", payload);
               }
               setIsEditing(false);
               toast.success("Emergency contacts saved successfully.");
          } catch {
               toast.error("Failed to save emergency contacts.");
          } finally {
               setSavingServer(false);
          }
     };

     const updateField = (rowIndex: number, fieldKey: string, value: string) => {
          setRows((prev) =>
               prev.map((row, index) => (index === rowIndex ? { ...row, [fieldKey]: value } : row)),
          );
     };

     const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

     const removeRow = async (rowIndex: number) => {
          const row = rows[rowIndex];
          const rowId = row?.__id;

          if (rowId && employeeid) {
               try {
                    const response = await customPost(`employees/emergency-contacts/${rowId}`, "DELETE", {});
                    const { status, statusCode, message } = response;
                    if (statusCode == 200 && status == "success") {
                         toast.success(message || "Emergency contact removed successfully.");
                    } else {
                         toast.error(message || "Failed to remove emergency contact.");
                         return;
                    }
               } catch {
                    toast.error("Failed to remove emergency contact.");
                    return;
               }
          }

          setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((_, index) => index !== rowIndex)));
     };

     const nonEmptyRows = rows.filter((row) => SECTION_FIELD_KEYS.some((key) => String(row[key] || "").trim()));

     return (
          <SectionPageShell
               title={config.title}
               itemLabel={config.itemLabel}
               icon={<RiContactsBookLine size={16} />}
               badge="Employee Profile"
               backHref={`/authentication/register${querySuffix}`}
               isEditing={isEditing}
               loadingServer={loadingServer}
               savingServer={savingServer}
               recordCount={nonEmptyRows.length}
               onEdit={() => setIsEditing(true)}
               onCancel={() => setIsEditing(false)}
               onSave={saveToBackend}
               onAdd={addRow}
          >
               {!isEditing && (
                    <>
                         {nonEmptyRows.length === 0 && (
                              <SectionEmptyState message="No emergency contact records yet." />
                         )}
                         {nonEmptyRows.map((row, rowIndex) => (
                              <SectionRecordCard
                                   key={`view-row-${rowIndex}`}
                                   title={row.fullName || `Contact #${rowIndex + 1}`}
                              >
                                   <div className="row g-3">
                                        <SectionField label="Relationship" value={row.relationship} />
                                        <SectionField label="Mobile" value={row.mobile} />
                                        <SectionField label="Address" value={row.address} />
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
                                        {config.fields.map((field) => (
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
