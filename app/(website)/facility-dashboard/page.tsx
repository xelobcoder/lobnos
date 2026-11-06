import type { Metadata } from "next";
import { FacilityDashboard } from "../../../website/components/marketplace/FacilityDashboard";

export const metadata: Metadata = {
  title: "Facility dashboard",
  description: "Private operations dashboard for approved independent marketplace facilities.",
  alternates: { canonical: "/facility-dashboard" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function FacilityDashboardPage() {
  return <main className="section facility-dashboard-section"><div className="wrap"><FacilityDashboard /></div></main>;
}
