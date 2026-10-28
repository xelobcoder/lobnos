"use client";
import Link from "next/link";
import React from "react";
import styles from "./AccountingSummary.module.css";

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
                         <div className={styles.card} data-tone={variant}>
                              <div className={styles.heading}><span>{label}</span><span className={styles.icon}><Icon size={18} aria-hidden="true" /></span></div>
                              <div className={styles.value}>{value}</div>
                              <div className={styles.detail}>{subtitle}</div>
                         </div>
                    );

                    return (
                         <div className={columnClassName} key={label}>
                              {href ? <Link href={href} className={styles.link}>{content}</Link> : content}
                         </div>
                    );
               })}
          </div>
     );
}
