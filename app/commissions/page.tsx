"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding4Line,
  RiHistoryLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiWallet3Line,
} from "@remixicon/react";
import styles from "./commissions.module.css";

const workflowSections = [
  {
    id: "pending-commissions",
    title: "Review pending commissions",
    description: "Find outstanding commissions by recipient, or review untracked records.",
    links: [
      {
        title: "Organization pending",
        description: "Review organization commissions and outstanding balances.",
        href: "/commissions/organizations/pending-commissions",
        icon: RiBuilding4Line,
        action: "Review organizations",
      },
      {
        title: "Clinician pending",
        description: "Review clinician commissions and pending settlements.",
        href: "/commissions/clinicians/commissions-information",
        icon: RiStethoscopeLine,
        action: "Review clinicians",
      },
      {
        title: "Untracked commissions",
        description: "Find service records not yet tracked for commission processing.",
        href: "/commissions/untracked-commission-records",
        icon: RiTimeLine,
        action: "Review untracked records",
      },
    ],
  },
  {
    id: "commission-reporting",
    title: "Payments and reporting",
    description: "Review settlements and explore commission payment activity.",
    links: [
      {
        title: "Commission payments",
        description: "Review commission settlements, payment batches, and history.",
        href: "/commissions/commission-payments",
        icon: RiWallet3Line,
        action: "Open payments",
      },
      {
        title: "Commission analytics",
        description: "Explore commission trends and payment reports.",
        href: "/commissions/clinicians/commissions-payments-made",
        icon: RiHistoryLine,
        action: "View analytics",
      },
    ],
  },
];

export default function Page() {
  return (
    <div className={`container-fluid px-3 px-md-4 py-3 ${styles.page}`}>
      <header className={`${styles.header} mb-4`}>
        <h1 className="fs-4 fw-bold mb-1">Commissions</h1>
        <p className="text-body-secondary mb-0">
          Review outstanding commissions, manage settlements, and track payment activity.
        </p>
      </header>

      {workflowSections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="mb-4">
          <div className="mb-3">
            <h2 id={section.id} className="fs-6 fw-semibold mb-1">{section.title}</h2>
            <p className="small text-body-secondary mb-0">{section.description}</p>
          </div>
          <div className="row g-3">
            {section.links.map(({ title, description, href, icon: Icon, action }) => (
              <div key={href} className={`col-12 col-md-6 ${section.links.length === 3 ? "col-xl-4" : ""}`}>
                <Link href={href} className={styles.destination}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Icon size={22} className={styles.icon} aria-hidden="true" />
                    <h3 className="fs-6 fw-semibold mb-0">{title}</h3>
                  </div>
                  <p className="small text-body-secondary mb-3">{description}</p>
                  <span className={styles.action}>
                    {action}
                    <RiArrowRightLine size={18} aria-hidden="true" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
