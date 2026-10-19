"use client";
import React, { useRef, useState } from "react";
import { RiFilePdf2Line } from "@remixicon/react";
import { exportReportPdf, tablesFromElement, type ReportPdfSpec } from "./reportPdf";

interface Props {
     title: string;
     subtitle?: string;
     period?: string;
     filters?: string[];
     /** Element whose visible tables are exported; defaults to [data-pdf-root] or the page body. */
     targetSelector?: string;
     /** Optional explicit data; overrides reading the tables from the page. */
     getSpec?: () => Promise<Partial<ReportPdfSpec>> | Partial<ReportPdfSpec>;
     className?: string;
}

export default function ExportPdfButton({ title, subtitle, period, filters, targetSelector, getSpec, className }: Props) {
     const [busy, setBusy] = useState(false);
     const lock = useRef(false);

     const run = async () => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          try {
               const extra = getSpec ? await getSpec() : {};
               let tables = extra.tables;
               if (!tables) {
                    const root = (targetSelector && document.querySelector<HTMLElement>(targetSelector)) || document.querySelector<HTMLElement>("[data-pdf-root]") || document.body;
                    tables = tablesFromElement(root);
               }
               await exportReportPdf({ title, subtitle, period, filters, ...extra, tables });
          } catch (e) {
               console.error("PDF export failed", e);
               alert("Unable to generate the PDF. Please try again.");
          } finally {
               lock.current = false;
               setBusy(false);
          }
     };

     return (
          <button type="button" className={className || "btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"} onClick={run} disabled={busy} data-pdf-ignore>
               <RiFilePdf2Line size={16} /> {busy ? "Preparing…" : "Export PDF"}
          </button>
     );
}
