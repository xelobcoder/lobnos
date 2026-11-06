import type { Metadata } from "next";
import Link from "next/link";
import { FacilityStaffLoginForm } from "../../../../website/components/marketplace/FacilityStaffLoginForm";

export const metadata: Metadata = {
  title: "Independent facility staff login",
  description: "Private login for approved independent laboratories participating in the marketplace.",
  alternates: { canonical: "/facility-dashboard/login" },
  robots: { index: false, follow: false },
};

export default function FacilityDashboardLoginPage() {
  return <main className="section staff-login-section"><div className="wrap staff-login-layout">
    <div className="staff-login-intro"><span className="eyebrow">FACILITY TEAM · PRIVATE SIGN IN</span><h1>Manage your marketplace facility.</h1><p>Sign in with an approved independent facility account to review booking requests and manage your facility’s marketplace catalog.</p><p>PLS-connected facility teams should use their existing PLS facility portal. These are separate systems and credentials.</p><Link className="text-link" href="/facility-login">Find the PLS facility portal <span aria-hidden="true">↗</span></Link></div>
    <div className="staff-login-card"><FacilityStaffLoginForm /><p>Not registered yet? <Link href="/join-facility">Apply to join the facility network</Link>.</p></div>
  </div></main>;
}
