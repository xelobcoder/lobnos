import type { Metadata } from "next";
import { FacilityListings } from "../../../website/components/marketplace/FacilityListings";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { getMarketplaceFacilities } from "../../../website/lib/marketplace";

export const metadata: Metadata = {
  title: "Participating laboratories",
  description: "Find participating laboratories and browse approved, published tests, panels, service options and prices.",
  alternates: { canonical: "/facilities" },
};

export default async function FacilitiesPage() {
  const result = await getMarketplaceFacilities();
  return <>
    <PageIntro eyebrow="PLS LABORATORY MARKETPLACE" title="Explore participating laboratories." description="Compare published tests and panels from approved PLS-connected and independent facilities. Each listing shows its integration model; catalogs and prices are supplied by the facility or its authorized PLS catalog." action={false} />
    <section className="section directory-section"><div className="wrap">
      <div className="directory-intro"><div><span className="eyebrow">PUBLIC FACILITY LISTINGS</span><h2>Find a laboratory to explore.</h2></div><p>Published prices are indicative facility catalog prices. Confirm availability, preparation, final charges and appointment details with the laboratory.</p></div>
      {result.status === "ok" ? <FacilityListings facilities={result.data} /> :
        <div className="directory-error" role="status"><span>!</span><div><b>The public marketplace is temporarily unavailable.</b><p>No sample facilities or prices are shown. Please try again later.</p></div></div>}
      <div className="directory-privacy"><span>↗</span><p>Booking requests are reviewed by the selected laboratory. A submitted request is not a confirmed appointment, payment or lab order.</p></div>
    </div></section>
  </>;
}
