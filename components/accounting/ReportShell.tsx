"use client";
import dayjs from "dayjs";
import React from "react";
import { RiPrinterLine } from "@remixicon/react";

interface Props {
     title: string;
     subtitle?: string;
     /** Rendered centred above the data, the way a printed statement is headed. */
     reportTitle?: string;
     range?: string;
     filters?: React.ReactNode;
     actions?: React.ReactNode;
     children: React.ReactNode;
}

export default function ReportShell({ title, subtitle, reportTitle, range, filters, actions, children }: Props) {
     return (
          <div className="container-fluid py-3">
               <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div>
                         <h4 className="mb-1">{title}</h4>
                         {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                         {actions}
                         <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={() => window.print()}>
                              <RiPrinterLine size={16} /> Print
                         </button>
                    </div>
               </div>

               {filters && (
                    <div className="card border-0 shadow-sm mb-3">
                         <div className="card-body py-3">
                              <div className="row g-2 align-items-end">{filters}</div>
                         </div>
                    </div>
               )}

               <div className="card border-0 shadow-sm">
                    <div className="card-body">
                         {reportTitle && (
                              <div className="text-center mb-3">
                                   <div className="fw-semibold">{reportTitle}</div>
                                   {range && <small className="text-muted">{range}</small>}
                              </div>
                         )}
                         {children}
                    </div>
               </div>
          </div>
     );
}

export function formatRange(from: string, to: string): string {
     return `${dayjs(from).format("D MMM YYYY")} to ${dayjs(to).format("D MMM YYYY")}`;
}
