"use client";
import styles from "./ReportShell.module.css";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { accountingApi } from "../../lib/accounting/accountingApi";
import { RiPrinterLine } from "@remixicon/react";
import ExportPdfButton from "../reports/ExportPdfButton";
import type { ReportPdfSpec } from "../reports/reportPdf";

interface Props {
     exportable?: boolean;
     basis?: "accrual" | "cash-flow";
     title: string;
     subtitle?: string;
     reportTitle?: string;
     range?: string;
     filters?: React.ReactNode;
     actions?: React.ReactNode;
     children: React.ReactNode;
     /** Explicit PDF content for reports whose screen layout is not a plain table. */
     getPdfSpec?: () => Promise<Partial<ReportPdfSpec>> | Partial<ReportPdfSpec>;
}

export default function ReportShell({ title, subtitle, reportTitle, range, filters, actions, children, getPdfSpec, basis, exportable = true }: Props) {
     const [health, setHealth] = useState<any>(null);
     useEffect(() => {
          if (!basis) return;
          let active = true;
          accountingApi.outboxHealth().then(response => { if (active) setHealth(response?.status === 'success' && response.result ? response.result : { unavailable: true }); }).catch(() => { if (active) setHealth({ unavailable: true }); });
          return () => { active = false; };
     }, [basis, range]);
     const unresolved = Number(health?.pending || 0) + Number(health?.failed || 0) + Number(health?.deadLetter || 0);
     return (
          <div className={styles.page}>
               <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/accounting">Accounting</Link><span aria-hidden="true"> / </span><span aria-current="page">{title}</span></nav>
               <header className={styles.header}>
                    <div><h1 className={styles.title}>{title}</h1>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>
                    <div className={styles.actions}>
                         {actions}
                         {exportable && <><ExportPdfButton title={title} subtitle={subtitle} period={range} targetSelector="[data-pdf-root]" filtersSelector="[data-pdf-filters]" getSpec={getPdfSpec} />
                         <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={() => window.print()}><RiPrinterLine size={16} aria-hidden="true" /> Print</button></>}
                    </div>
               </header>
               {filters && <section className={styles.filters} aria-label="Report filters" data-pdf-filters><div className="row g-2 align-items-end">{filters}</div></section>}
               <section className={styles.report} data-pdf-root aria-label={reportTitle || title}>
                    {reportTitle && <div className={styles.printTitle}><h2>{reportTitle}</h2>{range && <p>{range}</p>}</div>}
                    {(range || basis) && <div className={styles.meta}>{range && <span>{range}</span>}{basis && <span>{basis === "accrual" ? "Accrual basis · Posted ledger" : "Cash movements · Posted ledger"}</span>}</div>}
                    {basis && (unresolved > 0 || health?.unavailable) && <div role="alert" className="alert alert-warning">{health?.unavailable ? "Posting status could not be verified. Review accounting postings before relying on this report." : `${unresolved} accounting posting(s) remain unresolved. This report includes posted entries only.`} <Link href="/accounting/posting-health">Review postings</Link></div>}
                    {children}
               </section>
          </div>
     );
}

export function formatRange(from: string, to: string): string {
     return `${dayjs(from).format("D MMM YYYY")} to ${dayjs(to).format("D MMM YYYY")}`;
}
