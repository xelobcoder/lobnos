import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketplaceCatalog } from "../../../../website/components/marketplace/MarketplaceCatalog";
import { PageIntro } from "../../../../website/components/ui/PageIntro";
import { getMarketplaceCatalog } from "../../../../website/lib/marketplace";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMarketplaceCatalog(slug);
  if (result.status !== "ok") return { title: "Laboratory catalog" };
  return {
    title: `${result.data.facility.name} catalog`,
    description: `Explore published tests and panels from ${result.data.facility.name}.`,
    alternates: { canonical: `/facilities/${encodeURIComponent(slug)}` },
    robots: { index: true, follow: true },
  };
}

export default async function FacilityCatalogPage({ params }: Props) {
  const { slug } = await params;
  const result = await getMarketplaceCatalog(slug);
  if (result.status === "not-found") notFound();

  if (result.status !== "ok") return <>
    <PageIntro eyebrow="PUBLIC CATALOG" title="Catalog temporarily unavailable." description="The facility catalog could not be loaded. We do not display sample facilities, tests or prices when the live service is unavailable." action={false} />
    <section className="section"><div className="wrap"><Link className="button button-outline" href="/facilities">Back to participating laboratories</Link></div></section>
  </>;

  const { facility, source, tests } = result.data;
  const availableTests = tests.filter((item) => item.available);
  const openingHours = Object.entries(facility.openingHours).filter(([, hours]) => hours).map(([day, hours]) => ({ day, hours }));
  return <>
    <PageIntro eyebrow={facility.facilityType === "pls-integrated" ? "PLS-CONNECTED FACILITY" : "INDEPENDENT FACILITY"} title={facility.name} description={facility.description || "Browse this facility’s currently published laboratory catalog."} action={false} />
    <section className="section facility-profile-section">
      <div className="wrap">
      <nav className="facility-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/facilities">Laboratories</Link><span aria-hidden="true">/</span><span aria-current="page">{facility.name}</span></nav>
      <div className="facility-profile-summary" aria-label="Facility catalog summary">
        <div><span className="facility-summary-icon" aria-hidden="true">▤</span><span><b>{availableTests.length}</b><small>published services</small></span></div>
        <div><span className="facility-summary-icon" aria-hidden="true">◎</span><span><b>{facility.facilityType === "pls-integrated" ? "PLS-connected" : "Independent"}</b><small>catalog type</small></span></div>
        <div><span className="facility-summary-icon" aria-hidden="true">{facility.bookingSupported ? "↗" : "☎"}</span><span><b>{facility.bookingSupported ? "Request online" : "Contact to arrange"}</b><small>{facility.bookingSupported ? "facility review required" : "online booking unavailable"}</small></span></div>
        <a className="facility-summary-link" href="#facility-catalog">Browse services <span aria-hidden="true">↓</span></a>
      </div>
      </div>
      <div className="wrap facility-profile-grid">
      <div className="facility-profile-main" id="facility-catalog">
        <div className="facility-detail-head"><div><span className="facility-type-label">{source === "pls-live" ? "LIVE PLS CATALOG" : "FACILITY-PUBLISHED CATALOG"}</span><h2>Explore tests &amp; panels</h2></div><p>Search the published list, then confirm availability, price and timing directly with the laboratory.</p></div>
        <MarketplaceCatalog slug={facility.slug} items={tests} currency={facility.currency} source={source} paymentInstructions={facility.paymentInstructions} bookingSupported={facility.bookingSupported} />
      </div>
      <aside className="facility-profile-aside">
      <span className="eyebrow">CONTACT &amp; LOCATION</span>
      <h3>{facility.name}</h3>
      {facility.address && <p className="facility-address">{facility.address}</p>}
      {(facility.phone || facility.contactEmail) && <div className="facility-contact-actions">
        {facility.phone && <a className="facility-contact-button" href={`tel:${facility.phone}`}><span aria-hidden="true">☎</span>Call facility</a>}
        {facility.contactEmail && <a className="facility-contact-button" href={`mailto:${facility.contactEmail}`}><span aria-hidden="true">✉</span>Email facility</a>}
      </div>}
      {facility.facilityLoginUrl && <a className="text-link facility-client-login" href={facility.facilityLoginUrl} rel="noopener noreferrer">Client login <span aria-hidden="true">↗</span></a>}
      {openingHours.length > 0 && <div className="facility-hours"><b>Opening hours</b><dl>{openingHours.map(({ day, hours }) => <div key={day}><dt>{day}</dt><dd>{hours}</dd></div>)}</dl></div>}
      <div className="facility-profile-notice"><b>{facility.bookingSupported ? "Request, not appointment" : "Confirm arrangements directly"}</b><p>{facility.bookingSupported ? "Submitting a booking request does not confirm a time or service. The facility must review and respond." : "Contact the facility to confirm the service, current price, availability and any appointment details."}</p></div>
      {facility.paymentInstructions && <div className="facility-profile-notice"><b>Payment instructions</b><p>{facility.paymentInstructions}</p><p>A reference remains a claim until facility staff verify it.</p></div>}
      <Link className="text-link" href="/facilities">← All participating laboratories</Link>
      </aside>
      </div>
    </section>
  </>;
}
