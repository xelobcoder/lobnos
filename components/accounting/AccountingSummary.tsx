"use client";
import Link from "next/link";
import React from "react";

export type AccountingSummaryMetric = {
     label: string;
     value: React.ReactNode;
     Icon: React.ElementType;
     variant: "primary" | "success" | "info" | "warning" | "danger" | "secondary";
     subtitle: string;
     href?: string;
};

interface Props {
     metrics: AccountingSummaryMetric[];
     columnClassName?: string;
     rowClassName?: string;
}

export default function AccountingSummary({
     metrics,
     columnClassName = "col-12 col-sm-6 col-xl-3",
     rowClassName = "row g-3 mb-3",
}: Props) {
     return (
          <div className={rowClassName}>
               {metrics.map(({ label, value, Icon, variant, subtitle, href }) => {
                    const content = (
                         <div className={`border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
                              <div className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small text-uppercase fw-semibold opacity-75">{label}</span>
                                        <Icon size={22} className="opacity-75" />
                                   </div>
                                   <h3 className="fw-bold mb-0">{value}</h3>
                                   <span className="small opacity-75">{subtitle}</span>
                              </div>
                         </div>
                    );

                    return (
                         <div className={columnClassName} key={label}>
                              {href ? <Link href={href} className="d-block h-100 text-decoration-none">{content}</Link> : content}
                         </div>
                    );
               })}
          </div>
     );
}
