import type { Metadata } from "next";
import { BookingTracker } from "../../../website/components/marketplace/BookingTracker";
import { PageIntro } from "../../../website/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Private booking request status",
  description: "Check a marketplace booking request with its private tracking code.",
  alternates: { canonical: "/booking-status" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function BookingStatusPage() {
  return <>
    <PageIntro eyebrow="PRIVATE BOOKING LOOKUP" title="Check your request status." description="Use the private tracking code provided after submitting a request. This page checks the request only; it does not confirm a booking, payment or laboratory order." action={false} />
    <section className="section booking-status-section"><div className="wrap booking-status-wrap"><BookingTracker /></div></section>
  </>;
}
