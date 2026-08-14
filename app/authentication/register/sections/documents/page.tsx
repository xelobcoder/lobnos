"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, customFile, customPost } from "../../../../../components/Auth/customFetch";
import { SECTION_CONFIGS, loadSectionDraft, saveSectionDraft } from "../../sectionDraft";
import { Button } from "react-bootstrap";
import { RiDeleteBinLine, RiFileTextLine } from "@remixicon/react";
import SectionPageShell, { SectionEmptyState, SectionRecordCard } from "../SectionPageShell";
import styles from "../section-standard.module.css";

type DraftRow = {
     documentType: string;
     filePath: string;
     __id?: string;
};

const SECTION_KEY = "documents" as const;
const ACCEPTED_FILE_TYPES = "image/*,application/pdf,.pdf";
const DOCUMENT_TYPES = [
     { value: "cv", label: "CV" },
     { value: "certificate", label: "Certificate" },
     { value: "license", label: "License" },
     { value: "passport", label: "Passport" },
     { value: "national_id", label: "National ID" },
     { value: "appointment_letter", label: "Appointment Letter" },
     { value: "other", label: "Other" },
] as const;
const DOCUMENT_TYPE_VALUES = DOCUMENT_TYPES.map((type) => type.value);

function isAllowedFile(file: File): boolean {
     const mime = (file.type || "").toLowerCase();
     const name = (file.name || "").toLowerCase();
     const mimeAllowed = mime.startsWith("image/") || mime === "application/pdf";
     const extensionAllowed = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tif|tiff|pdf)$/.test(name);
     return mimeAllowed || extensionAllowed;
}

function createEmptyRow(): DraftRow {
     return { documentType: "", filePath: "" };
}

function toQuerySuffix(employeeid: string | null): string {
     return employeeid ? `?employeeid=${employeeid}` : "";
}

function normalizeRowsFromBackend(records: any[]): DraftRow[] {
     return records.map((record) => {
          const rowId = record?.id ?? record?.documentId ?? record?.employeeDocumentId;
          return {
               documentType: record?.documentType != null ? String(record.documentType) : "other",
               filePath: record?.filePath != null ? String(record.filePath) : "",
               __id: rowId != null ? String(rowId) : undefined,
          };
     });
}

function getDocumentTypeLabel(value: string): string {
     const match = DOCUMENT_TYPES.find((item) => item.value === value);
     return match ? match.label : value;
}

function getDocumentDownloadUrl(documentId?: string): string {
     if (!documentId) {
          return "";
     }

     const baseUrl = process.env.NODE_ENV === "development"
          ? process.env.DEVELOPMENT_BASEURL
          : process.env.PRODUCTION_BASEURL;

     if (!baseUrl) {
          return "";
     }

     const url = new URL(`employees/documents/${documentId}/download`, baseUrl);
     if (process.env.TENANTID) {
          url.searchParams.append("tenantId", process.env.TENANTID);
     }

     return url.toString();
}

function getFileKind(filePath: string): "pdf" | "image" | "other" {
     const normalized = (filePath || "").toLowerCase();
     if (normalized.endsWith(".pdf")) {
          return "pdf";
     }
     if (/\.(jpg|jpeg|png|gif|bmp|webp|svg|tif|tiff)$/.test(normalized)) {
          return "image";
     }
     return "other";
}

export default function DocumentsSectionPage() {
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
     const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
     const [loadingServer, setLoadingServer] = useState(false);
     const [savingServer, setSavingServer] = useState(false);
     const [hasInitializedServerData, setHasInitializedServerData] = useState(false);
     const [isEditing, setIsEditing] = useState(true);

     useEffect(() => {
          const loaded = loadSectionDraft(sectionScope, SECTION_KEY);
          const mapped = loaded.map((row: Record<string, string>) => ({
               documentType: row.documentType || "",
               filePath: row.filePath || "",
          }));
          setRows(mapped.length > 0 ? mapped : [createEmptyRow()]);
          setSelectedFiles({});
     }, [sectionScope]);

     useEffect(() => {
          if (rows.length === 0) {
               return;
          }
          saveSectionDraft(
               sectionScope,
               SECTION_KEY,
               rows.map((row) => ({
                    documentType: row.documentType,
                    filePath: row.filePath,
               })),
          );
     }, [rows, sectionScope]);

     const config = SECTION_CONFIGS[SECTION_KEY];
     const querySuffix = toQuerySuffix(employeeid);

     const fetchFromBackend = async (silent = false) => {
          if (!employeeid) {
               if (!silent) toast.info("Create the employee account first, then open this page with an employeeid to fetch records.");
               return;
          }
          try {
               setLoadingServer(true);
               const response = await customFetch(`employees/${employeeid}/documents`);
               const records = Array.isArray(response?.result) ? response.result : Array.isArray(response) ? response : [];
               const normalizedRows = normalizeRowsFromBackend(records);
               if (normalizedRows.length === 0) {
                    setRows([createEmptyRow()]);
                    setSelectedFiles({});
                    setIsEditing(true);
                    if (!silent) toast.info(`No ${config.title.toLowerCase()} records found.`);
                    return;
               }
               setRows(normalizedRows);
               setSelectedFiles({});
               setIsEditing(false);
          } catch {
               if (!silent) toast.error(`Failed to load ${config.title.toLowerCase()}.`);
          } finally {
               setLoadingServer(false);
               setHasInitializedServerData(true);
          }
     };

     useEffect(() => {
          if (!employeeid || hasInitializedServerData) return;
          fetchFromBackend(true);
     }, [employeeid, hasInitializedServerData]);

     const saveToBackend = async () => {
          if (!employeeid) {
               toast.info("Create the employee account first, then open this page with an employeeid to save records.");
               return;
          }
          const candidates = rows
               .map((row, index) => ({ row, index, file: selectedFiles[index] || null }))
               .filter(({ row, file }) => String(row.documentType || "").trim() || !!file || !!row.__id);

          const createCandidates = candidates.filter(
               ({ row, file }) => !row.__id && (String(row.documentType || "").trim() || !!file),
          );
          const updateCandidates = candidates.filter(({ row, file }) => !!row.__id && !!file);

          if (createCandidates.length === 0 && updateCandidates.length === 0) {
               toast.info("Add a new document with file, or choose a replacement file for an existing document.");
               return;
          }

          const invalidDocType = [...createCandidates, ...updateCandidates].find(
               ({ row }) => !DOCUMENT_TYPE_VALUES.includes((row.documentType || "") as (typeof DOCUMENT_TYPE_VALUES)[number]),
          );
          if (invalidDocType) {
               toast.error("Invalid document type selected.");
               return;
          }

          const createMissingFile = createCandidates.find(({ file }) => !file || !isAllowedFile(file));
          if (createMissingFile) {
               toast.error("New documents must include a valid file (image or PDF).");
               return;
          }

          const updateInvalidFile = updateCandidates.find(({ file }) => !file || !isAllowedFile(file));
          if (updateInvalidFile) {
               toast.error("Updated documents must include a valid file (image or PDF).");
               return;
          }

          try {
               setSavingServer(true);

               for (const entry of createCandidates) {
                    const formData = new FormData();
                    formData.append("employeeId", String(Number(employeeid)));
                    formData.append("documentType", String(entry.row.documentType || "").trim());
                    formData.append("file", entry.file as File);
                    await customFile("employees/documents", formData);
               }

               for (const entry of updateCandidates) {
                    const formData = new FormData();
                    formData.append("employeeId", String(Number(employeeid)));
                    formData.append("documentType", String(entry.row.documentType || "").trim());
                    formData.append("file", entry.file as File);
                    await customFile(`employees/documents/${entry.row.__id}`, formData);
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

     const updateFile = (rowIndex: number, file: File | null) => {
          if (file && !isAllowedFile(file)) {
               toast.error("Only image or PDF files are allowed.");
               return;
          }
          setSelectedFiles((prev) => ({ ...prev, [rowIndex]: file }));
     };

     const removeRow = async (rowIndex: number) => {
          const row = rows[rowIndex];
          const rowId = row?.__id;

          if (rowId && employeeid) {
               try {
                    const response = await customPost(`employees/documents/${rowId}`, "DELETE", {});
                    const { status, statusCode, message } = response || {};
                    if (!(status === "success" && Number(statusCode) === 200)) {
                         toast.error(message || "Failed to remove document.");
                         return;
                    }
                    toast.success(message || "Document removed successfully.");
               } catch {
                    toast.error("Failed to remove document.");
                    return;
               }
          }

          setRows((prev) => (prev.length === 1 ? [createEmptyRow()] : prev.filter((_, index) => index !== rowIndex)));
          setSelectedFiles((prev) => {
               const next: Record<number, File | null> = {};
               Object.entries(prev).forEach(([key, value]) => {
                    const index = Number(key);
                    if (index < rowIndex) {
                         next[index] = value;
                    }
                    if (index > rowIndex) {
                         next[index - 1] = value;
                    }
               });
               return next;
          });
     };

     const nonEmptyRows = rows.filter((row) => String(row.documentType || "").trim() || String(row.filePath || "").trim() || !!row.__id);

     return (
          <SectionPageShell
               title={config.title}
               itemLabel={config.itemLabel}
               icon={<RiFileTextLine size={16} />}
               badge="Employee Profile"
               backHref={`/authentication/register${querySuffix}`}
               isEditing={isEditing}
               loadingServer={loadingServer}
               savingServer={savingServer}
               recordCount={nonEmptyRows.length}
               onEdit={() => setIsEditing(true)}
               onCancel={() => {
                    setIsEditing(false);
                    setSelectedFiles({});
               }}
               onSave={saveToBackend}
               onAdd={() => setRows((prev) => [...prev, createEmptyRow()])}
          >
               {!isEditing && (
                    <>
                         {nonEmptyRows.length === 0 && (
                              <SectionEmptyState message="No document records yet." />
                         )}
                         {nonEmptyRows.map((row, rowIndex) => (
                              <SectionRecordCard
                                   key={`view-row-${rowIndex}`}
                                   title={getDocumentTypeLabel(row.documentType || "other")}
                                   meta={`Type: ${getDocumentTypeLabel(row.documentType || "other")}`}
                              >
                                   {row.__id ? (
                                        <div className={styles.previewFrame}>
                                             {getFileKind(row.filePath) === "image" ? (
                                                  <img
                                                       src={getDocumentDownloadUrl(row.__id)}
                                                       alt={`${getDocumentTypeLabel(row.documentType || "other")} preview`}
                                                       className="img-fluid w-100"
                                                  />
                                             ) : (
                                                  <iframe
                                                       src={getDocumentDownloadUrl(row.__id)}
                                                       title={`${getDocumentTypeLabel(row.documentType || "other")} preview`}
                                                       style={{ width: "100%", height: 380, border: 0 }}
                                                  />
                                             )}
                                        </div>
                                   ) : null}
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
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Document Type</label>
                                             <select
                                                  className="form-control"
                                                  value={row.documentType || ""}
                                                  onChange={(event) => updateField(rowIndex, "documentType", event.target.value)}
                                             >
                                                  <option value="">Select document type</option>
                                                  {DOCUMENT_TYPES.map((type) => (
                                                       <option key={type.value} value={type.value}>{type.label}</option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium">Upload File (Image or PDF)</label>
                                             <input
                                                  className="form-control"
                                                  type="file"
                                                  accept={ACCEPTED_FILE_TYPES}
                                                  onChange={(event) => updateFile(rowIndex, event.target.files?.[0] || null)}
                                             />
                                             {selectedFiles[rowIndex] && (
                                                  <small className="text-muted d-block mt-1">
                                                       Selected: {selectedFiles[rowIndex]?.name}
                                                  </small>
                                             )}
                                             {row.filePath && (
                                                  <small className="text-muted d-block mt-1">
                                                       A file is already attached to this document.
                                                  </small>
                                             )}
                                        </div>
                                   </div>
                              </SectionRecordCard>
                         ))}
                    </>
               )}
          </SectionPageShell>
     );
}
