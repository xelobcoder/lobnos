import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../../../website/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Laboratory marketplace",
  description: "Discover participating laboratories and their published investigations, prices and collection services.",
  alternates: { canonical: "/marketplace" },
};

const participationModels = [
  {
    number: "01",
    title: "PLS-connected laboratories",
    copy: "Participating facilities can publish an approved view of their configured tests, services and general cash prices, with booking requests routed through authorized workflows.",
    label: "Catalog sourced from approved facility data",
  },
  {
    number: "02",
    title: "Independent laboratories",
    copy: "Facilities that do not yet use PLS can apply to participate and manage a public catalog and incoming requests through a separate marketplace workflow.",
    label: "Independent marketplace participation",
  },
];

export default function MarketplacePage() {
  return (
    <>
      <PageIntro
        eyebrow="PLS LABORATORY MARKETPLACE"
        title="Discover laboratory services, with clearer next steps."
        description="Explore participating laboratories, published investigations and service options. A booking begins as a request—not a confirmed appointment, payment or laboratory order."
        action={false}
      />
      <section className="section marketplace-overview">
        <div className="wrap">
          <div className="marketplace-intro">
            <div>
              <span className="eyebrow">ONE DISCOVERY EXPERIENCE</span>
              <h2>Choose the laboratory and service that fit your needs.</h2>
            </div>
            <div>
              <p>Published catalogs and prices are supplied by participating laboratories. Availability, preparation, collection timing and final charges must be confirmed by the selected facility.</p>
              <Link className="button button-dark" href="/facilities">Browse participating facilities <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="marketplace-model-grid">
            {participationModels.map((model) => (
              <article className="marketplace-model" key={model.number}>
                <span className="marketplace-model-number">{model.number}</span>
                <span className="eyebrow">{model.label}</span>
                <h3>{model.title}</h3>
                <p>{model.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section marketplace-steps-section">
        <div className="wrap marketplace-steps">
          <div>
            <span className="eyebrow">A REQUEST IS NOT A CONFIRMATION</span>
            <h2>Know what each update means.</h2>
            <p>Facilities review each request and determine whether they can accept it, when collection can happen, and what payment conditions apply.</p>
          </div>
          <ol>
            <li><b>Choose</b><span>Select a facility and published services.</span></li>
            <li><b>Request</b><span>Send a booking request with your preferred collection method.</span></li>
            <li><b>Await review</b><span>The facility reviews availability, timing and any payment conditions.</span></li>
            <li><b>Follow up</b><span>Use the private reference provided for the request to check its status.</span></li>
          </ol>
        </div>
      </section>
      <section className="section marketplace-payment">
        <div className="wrap marketplace-payment-inner">
          <span className="marketplace-payment-mark" aria-hidden="true">!</span>
          <div><span className="eyebrow">PAYMENT CLARITY</span><h2>A reference is a claim—not proof of payment.</h2><p>If a laboratory accepts manual payment references, its authorized staff must review and verify the claim. Never submit banking passwords, PINs, one-time codes or full payment-card details through this website.</p></div>
          <Link className="text-link" href="/booking-status">Check an existing request <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section className="compact-cta">
        <div className="wrap">
          <div><span className="eyebrow">FOR LABORATORIES</span><h2>Bring your facility into the discovery network.</h2></div>
          <Link className="button button-dark" href="/join-facility">Explore facility participation <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
