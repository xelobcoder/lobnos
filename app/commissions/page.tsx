"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding4Line,
  RiFileList3Line,
  RiHistoryLine,
  RiMoneyDollarCircleLine,
  RiStethoscopeLine,
  RiTeamLine,
  RiTimeLine,
  RiWallet3Line,
} from "@remixicon/react";

const commissionCards = [
  {
    title: "Organization Pending",
    description:
      "Review pending organization commission records, monitor outstanding balances, and follow up on unpaid organization payouts.",
    href: "/commissions/organizations/pending-commissions",
    icon: RiBuilding4Line,
    color: "#2563eb",
    buttonClass: "btn btn-primary",
    action: "Open organization pending",
  },
  {
    title: "Clinician Pending",
    description:
      "Track clinician commission amounts, outstanding balances, and pending settlements across services and tests.",
    href: "/commissions/clinicians/commissions-information",
    icon: RiStethoscopeLine,
    color: "#ea580c",
    buttonClass: "btn btn-outline-primary",
    action: "Open clinician pending",
  },
  {
    title: "General Commissions Analytics",
    description:
      "View summarized commission trends, payment activity, and report-based analytics for the commission portfolio.",
    href: "/commissions/clinicians/commissions-payments-made",
    icon: RiHistoryLine,
    color: "#7c3aed",
    buttonClass: "btn btn-outline-secondary",
    action: "View analytics",
  },
  {
    title: "Commissions Payments",
    description:
      "Manage completed commission settlements, payment batches, and payment history across recipients.",
    href: "/commissions/commission-payments",
    icon: RiWallet3Line,
    color: "#0f766e",
    buttonClass: "btn btn-primary",
    action: "Manage payments",
  },
  {
    title: "Untracked Commissions",
    description:
      "Identify service records that have not yet been assigned or tracked for commission processing.",
    href: "/commissions/untracked-commission-records",
    icon: RiTimeLine,
    color: "#b45309",
    buttonClass: "btn btn-outline-secondary",
    action: "Review untracked",
  },
];

export default function Page() {
  return (
    <div className="container-fluid px-4 py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="border rounded p-4 bg-body shadow-sm">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <p className="text-primary fw-semibold mb-2 d-flex align-items-center gap-2">
                  <RiMoneyDollarCircleLine size={18} />
                  Commissions Overview
                </p>
                <h1 className="fs-4 fw-bold mb-2 d-flex align-items-center gap-2">
                  <RiTeamLine size={26} style={{ color: "#2563eb" }} />
                  Commissions Center
                </h1>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
                <RiFileList3Line size={16} />
                Organization + Clinician + Analytics + Payments
              </div>
            </div>
            <p className="text-muted mb-0 mt-3">
              Access the full commission workflow for organization pending records, clinician pending records, analytics, payment processing, and untracked commission entries.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {commissionCards.map(({ title, description, href, icon: Icon, color, buttonClass, action }) => (
          <div key={title} className="col-12 col-md-6 col-xl-4">
            <div className="border rounded h-100 bg-body p-4 d-flex flex-column justify-content-between shadow-sm">
              <div>
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle me-3"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: `${color}1A`,
                    }}
                  >
                    <Icon size={24} style={{ color }} />
                  </div>
                  <h2 className="fs-5 fw-semibold mb-0">{title}</h2>
                </div>
                <p className="text-muted mb-0">{description}</p>
              </div>

              <Link href={href} className={`${buttonClass} d-flex align-items-center justify-content-center mt-4`}>
                {action}
                <RiArrowRightLine size={18} className="ms-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
