import type { Metadata } from "next";
import Link from "next/link";
import { FacilityRegistrationForm } from "../../../website/components/marketplace/FacilityRegistrationForm";
import { PageIntro } from "../../../website/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Join the facility network",
  description: "Learn how PLS-connected and independent laboratories can participate in the laboratory marketplace.",
  alternates: { canonical: "/join-facility" },
};

export default function JoinFacilityPage() {
  return (
    <>
      <PageIntro
        eyebrow="FOR LABORATORIES"
        title="Make your services easier to discover."
        description="PLS is building a shared laboratory marketplace for connected and independent facilities. Participation is subject to facility review, public-information approval and catalog consent."
        action={false}
      />
      <section className="section marketplace-overview">
        <div className="wrap">
          <div className="marketplace-intro">
            <div><span className="eyebrow">TWO WAYS TO PARTICIPATE</span><h2>Start from the tools your laboratory uses today.</h2></div>
            <div><p>PLS-connected facilities can publish approved catalog information sourced from their core configuration. Independent facilities can apply to manage a separate marketplace profile, catalog and request workflow.</p><a className="button button-dark" href="#facility-application">Apply as an independent facility <span aria-hidden="true">↘</span></a><Link className="text-link marketplace-contact-link" href="/contact">PLS-connected facility? Contact PLS about participation <span aria-hidden="true">↗</span></Link><Link className="text-link marketplace-contact-link" href="/facility-dashboard/login">Already approved? Sign in to facility dashboard <span aria-hidden="true">→</span></Link></div>
          </div>
          <div className="marketplace-model-grid">
            <article className="marketplace-model"><span className="marketplace-model-number">01</span><span className="eyebrow">PLS-CONNECTED</span><h3>Publish from your PLS setup</h3><p>Catalog visibility requires authorized integration, facility approval and consent to publish the selected public information. The core facility configuration remains the source for its published PLS catalog.</p></article>
            <article className="marketplace-model"><span className="marketplace-model-number">02</span><span className="eyebrow">INDEPENDENT PARTICIPATION</span><h3>Join before adopting PLS</h3><p>An independent facility may be considered for its own public profile and marketplace-managed catalog. It is clearly identified as not currently integrated with PLS.</p></article>
          </div>
        </div>
      </section>
      <section className="section marketplace-steps-section">
        <div className="wrap marketplace-steps">
          <div><span className="eyebrow">REVIEW BEFORE PUBLICATION</span><h2>Public profiles are not automatic.</h2><p>Facility identity, authority to represent the laboratory, service details and permission to publish prices and contact information need to be reviewed before a listing can go live.</p></div>
          <ol>
            <li><b>Submit an application</b><span>Share public facility details and create an initial facility administrator account.</span></li>
            <li><b>Verify identity</b><span>Platform reviewers assess authority to represent the laboratory and submitted details.</span></li>
            <li><b>Review catalog</b><span>Approved facility administrators can prepare catalog entries for review and publication.</span></li>
            <li><b>Approve listing</b><span>Login, catalog management and public discovery are enabled only after platform approval.</span></li>
          </ol>
        </div>
      </section>
      <section className="section registration-section" id="facility-application"><div className="wrap"><FacilityRegistrationForm /></div></section>
      <section className="compact-cta"><div className="wrap"><div><span className="eyebrow">A CONVERSATION, NOT AN AUTOMATIC LISTING</span><h2>Ask about marketplace participation.</h2></div><Link className="button button-dark" href="/contact">Contact PLS <span aria-hidden="true">→</span></Link></div></section>
    </>
  );
}
