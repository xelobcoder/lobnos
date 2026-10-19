"use client";
import React, { useRef, useState } from "react";
import { RiFilePdf2Line } from "@remixicon/react";
import { collectReport, exportReportPdf, filtersFromElement, type ReportPdfSpec } from "./reportPdf";

interface Props {
     title: string;
     subtitle?: string;
     period?: string;
     filters?: string[];
     /** Element whose tables are exported; defaults to [data-pdf-root] or the page body. */
     targetSelector?: string;
     /** Element holding labelled filter controls whose current values are printed in the header. */
     filtersSelector?: string;
     /** Optional explicit data; any field returned overrides what is read from the page. */
     getSpec?: () => Promise<Partial<ReportPdfSpec>> | Partial<ReportPdfSpec>;
     className?: string;
     label?: string;
}

export default function ExportPdfButton({ title, subtitle, period, filters, targetSelector, filtersSelector, getSpec, className, label = "Export PDF" }: Props) {
     const [busy, setBusy] = useState(false);
     const lock = useRef(false);

     const run = async () => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          try {
               const extra = getSpec ? await getSpec() : {};
               let tables = extra.tables;
               let notes = extra.notes;
               if (!tables) {
                    const root =
                         (targetSelector && document.querySelector<HTMLElement>(targetSelector)) ||
                         document.querySelector<HTMLElement>("[data-pdf-root]") ||
                         document.querySelector<HTMLElement>("main") ||
                         document.body;
                    const collected = await collectReport(root);
                    tables = collected.tables;
                    notes = [...(notes || []), ...collected.notes];
               }
               const activeFilters = filters ?? (filtersSelector ? filtersFromElement(document.querySelector<HTMLElement>(filtersSelector)) : undefined);
               await exportReportPdf({ title, subtitle, period, ...extra, filters: extra.filters ?? activeFilters, notes, tables });
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
               <RiFilePdf2Line size={16} /> {busy ? "Preparing…" : label}
          </button>
     );
}
