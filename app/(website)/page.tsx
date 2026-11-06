import Link from "next/link";
import { ActualProductGallery } from "../../website/components/marketing/ActualProductGallery";
import { HeroProductAnimation } from "../../website/components/marketing/HeroProductAnimation";
import { ProvisioningNotice } from "../../website/components/marketing/ProvisioningNotice";
import { ImplementationFitFinder } from "../../website/components/marketing/ImplementationFitFinder";
import { ImplementationJourney } from "../../website/components/marketing/ImplementationJourney";
import { SoftwareCoverageOverview } from "../../website/components/marketing/SoftwareCapabilities";
import { AnalyticsShowcase } from "../../website/components/marketing/AnalyticsShowcase";
import { Reveal } from "../../website/components/layout/Reveal";
import { FeatureGrid } from "../../website/components/ui/FeatureGrid";
import { SectionHeading } from "../../website/components/ui/SectionHeading";
import { industries, provisioning, roles, solutions } from "../../website/data/content";
import { getPublicFacilities } from "../../website/lib/public-catalog";

export default async function HomePage() {
  const directory = await getPublicFacilities();
  const publicFacilityCount = directory.status === "ok" ? directory.data.length : null;
  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="wrap hero-layout">
          <div className="hero-copy">
            <span className="hero-kicker"><i /> LABORATORY OPERATIONS, CONNECTED</span>
            <h1>One intelligent platform<br /><em>for modern laboratories.</em></h1>
            <p>Connect patient intake, barcoded specimens and analyzer results with billing, inventory, pharmacy, and financial control. Explore verified workflows and actual interface captures.</p>
            <div className="hero-actions"><Link className="button button-dark" href="/request-demo">Request a demo <span aria-hidden="true">↗</span></Link><Link className="button button-outline" href="/features">Explore features <span aria-hidden="true">→</span></Link></div>
            <div className="hero-access"><span className="access-icon">↗</span><span>Already with PLS?</span><Link href="/facility-login">Go to facility login</Link><span className="access-divider" /><Link href="/patient-portal">Find patient results</Link><span className="access-divider" /><Link href="/marketplace">Explore laboratories &amp; tests</Link></div>
            <ul className="hero-trust-strip" aria-label="Platform assurances">
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>Role-based access control</li>
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>5-minute workspace provisioning</li>
              <li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>Configurable to facility workflow</li>
            </ul>
          </div>
          <Reveal className="hero-visual">
            <HeroProductAnimation />
          </Reveal>
        </div>
        <div className="hero-bottom wrap"><span>Designed around real laboratory work</span><div><span>Registration</span><i /><span>Specimen workflow</span><i /><span>Results</span><i /><span>Financial operations</span></div></div>
      </section>

      <section className="capability-strip">
        <div className="wrap strip-inner"><span className="eyebrow">FROM FIRST VISIT TO CLEARER OVERSIGHT</span><div className="strip-flow"><span>Register</span><b>→</b><span>Process</span><b>→</b><span>Review</span><b>→</b><span>Report</span><b>→</b><span>Understand</span></div></div>
      </section>

      <section className="section section-intro">
        <div className="wrap two-column-intro">
          <SectionHeading eyebrow="A BETTER CONNECTED LAB" title="Laboratory work is a chain. Your systems should see the whole picture." />
          <div className="intro-copy"><p>A clinician&apos;s referral can carry its own test prices and commission agreement. An organization may have a different tariff. A new investigation needs its own result fields and report format. Those details are part of laboratory work—not extras.</p><p>PLS connects those relationships and configurations to patient orders, specimens, results and financial records, so teams can follow the work and the arrangements behind it.</p><Link className="text-link" href="/features">See what the software does <span aria-hidden="true">→</span></Link></div>
        </div>
        <div className="wrap friction-grid">
          {[
            ["01", "Disconnected hand-offs", "Paper trails and separate tools make everyday work harder to follow."],
            ["02", "Limited billing visibility", "Charges, collections and outstanding balances can be difficult to review together."],
            ["03", "Reactive stock decisions", "Without a useful view of stock movement, teams may spot supply issues late."],
            ["04", "Scattered reporting", "Operational questions take longer when the underlying information is spread out."],
          ].map(([n, title, copy], i) => <Reveal key={n} delay={i * 0.05}><article className="friction-card"><span>{n}</span><div><h3>{title}</h3><p>{copy}</p></div><b aria-hidden="true">↗</b></article></Reveal>)}
        </div>
        <div className="wrap compare-split">
          <article className="compare-column compare-before">
            <span className="compare-label">WITHOUT A CONNECTED PLATFORM</span>
            <ul>
              <li><span aria-hidden="true">✕</span>Registration, results and billing live in separate tools or spreadsheets</li>
              <li><span aria-hidden="true">✕</span>Specimen status is tracked by memory, paper logs or phone calls</li>
              <li><span aria-hidden="true">✕</span>Managers assemble figures manually before they can review activity</li>
              <li><span aria-hidden="true">✕</span>Access boundaries depend on informal trust rather than configured roles</li>
            </ul>
          </article>
          <div className="compare-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
          <article className="compare-column compare-after">
            <span className="compare-label">WITH PLS</span>
            <ul>
              <li><span aria-hidden="true">✓</span>Registration, specimens, results, billing and inventory share one workflow</li>
              <li><span aria-hidden="true">✓</span>Barcode lookup, status and audit history follow each specimen</li>
              <li><span aria-hidden="true">✓</span>Configured operational reporting draws from the same underlying records</li>
              <li><span aria-hidden="true">✓</span>Role-based access reflects each facility&apos;s governance requirements</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-solutions">
        <div className="wrap"><div className="section-topline"><SectionHeading eyebrow="THE PLS PLATFORM" title="More than a record. A connected way to work." copy="Explore the building blocks of a laboratory operation—from front desk to finance." /><Link className="text-link" href="/solutions">All solutions <span aria-hidden="true">→</span></Link></div>
          <FeatureGrid items={solutions} limit={6} />
          <div className="section-footnote">Availability depends on configuration, deployment and agreed scope.</div>
        </div>
      </section>

      <AnalyticsShowcase />
      <SoftwareCoverageOverview />

      <section className="section platform-principles">
        <div className="wrap">
          <div className="section-topline"><SectionHeading eyebrow="INTEGRATION, ACCESS & IMPLEMENTATION" title="Start with fit, boundaries and readiness." copy="The right setup depends on your facility's requirements and the systems around it." /><Link className="text-link" href="/request-demo">Discuss your requirements <span aria-hidden="true">→</span></Link></div>
          <div className="principle-grid">
            <article><span>01 / INTEGRATION</span><h3>Map instrument readings to your test fields.</h3><p>PLS includes named MindRay, AgileS20 and BioeLab result-processing adapters. Map device-specific readings to laboratory test fields, then validate the exact instrument, communication bridge and deployment before live use.</p></article>
            <article><span>02 / ACCESS</span><h3>Define roles and boundaries.</h3><p>Access to patient and operational information depends on approved roles, deployment configuration and each facility’s governance requirements.</p></article>
            <article><span>03 / READINESS</span><h3>Plan the work before launch.</h3><p>Requirements review, configuration, training and readiness are part of implementation planning. Scope and timing are agreed with each organization.</p></article>
          </div>
          <div className="protocol-row">
            <span className="protocol-row-label">CONFIGURED CONNECTIONS &amp; DATA EXCHANGE</span>
            <ul>
              <li>HL7-style result payloads</li><li>Analyzer parameter mapping</li><li>Barcode / 2D scan</li><li>CSV &amp; structured export</li><li>REST APIs</li>
            </ul>
            <span className="protocol-row-note">Validated per device, protocol and deployment. No universal analyzer or ASTM support is claimed.</span>
          </div>
        </div>
      </section>

      <section className="section section-showcase">
        <div className="wrap">
          <div className="showcase-heading"><SectionHeading eyebrow="REAL PRODUCT TOUR · NO SIGN-UP NEEDED" title="See the software exactly as it is." copy="Browse full pages from the PLS demo facility. The original application header, navigation, page layout and displayed demo values are retained." /><Link className="text-link" href="/product-tour">Explore every screenshot <span aria-hidden="true">→</span></Link></div>
          <ActualProductGallery id="home-gallery" />
        </div>
      </section>

      <section className="section fit-finder-section">
        <div className="wrap"><ImplementationFitFinder /></div>
      </section>

      <section className="section section-roles">
        <div className="wrap roles-layout"><div><SectionHeading eyebrow="BUILT FOR THE PEOPLE BEHIND THE WORK" title="Different roles. One shared operating picture." copy="Bring clarity to the hand-offs between the people who register, process, review and manage laboratory work." /><Link className="text-link" href="/features">Explore the workflow <span aria-hidden="true">→</span></Link></div><div className="roles-card">{roles.map(([title, copy], i) => <div className="role-line" key={title}><span className={`role-avatar role-avatar-${i}`}>{["LD","ST","RE","BL","FM","IO","CL"][i]}</span><span><b>{title}</b><small>{copy}</small></span><span className="role-check">✓</span></div>)}</div></div>
      </section>

      <section className="section section-industries">
        <div className="wrap"><div className="section-topline"><SectionHeading eyebrow="MADE FOR LABORATORY SETTINGS" title="Designed for the way laboratories operate." copy="Different environments have different priorities. Start with the setting closest to yours." /><Link className="text-link" href="/industries">View industries <span aria-hidden="true">→</span></Link></div>
          <div className="industry-grid">{industries.slice(0, 4).map((industry, i) => <Reveal key={industry.slug} delay={i * 0.06}><Link className="industry-card" href={`/industries/${industry.slug}`}><span className="industry-mark">{["◉","⌂","⊞","⟲"][i]}</span><span className="industry-index">0{i + 1}</span><h3>{industry.title}</h3><p>{industry.summary}</p><span className="text-link">Explore use case <span aria-hidden="true">→</span></span></Link></Reveal>)}</div>
        </div>
      </section>

      <section className="section facility-preview">
        <div className="wrap facility-preview-inner"><div><span className="eyebrow">THE PLS FACILITY NETWORK</span><h2>Find your facility.<br /><em>Find the right portal.</em></h2><p>Explore participating laboratories and their approved public profiles, published tests and services. Catalogs appear only after facility approval and publication.</p><div className="facility-actions"><Link className="button button-light" href="/marketplace">Explore the marketplace <span aria-hidden="true">↗</span></Link><Link className="facility-text-link" href="/patient-portal">Looking for patient results? <span aria-hidden="true">→</span></Link></div></div>
          <div className="facility-map" aria-label="Decorative map-pattern visualization, not a deployment map" role="img"><div className="map-dots" /><div className="map-empty"><span className="map-pulse" /><span>{publicFacilityCount === null ? "Directory unavailable" : publicFacilityCount ? "Verified facilities" : "Public facility directory"}</span><small>{publicFacilityCount === null ? "Live listings are not available right now" : publicFacilityCount ? `${publicFacilityCount} approved public ${publicFacilityCount === 1 ? "listing" : "listings"}` : "No approved public listings are configured"}</small></div><span className="map-caption">PUBLIC DIRECTORY</span></div>
        </div>
      </section>

      <section className="section section-approach">
        <div className="wrap"><div className="section-topline"><SectionHeading eyebrow="FROM DISCOVERY TO GO-LIVE" title="A thoughtful start for every implementation." copy="Get a clear picture of requirements, roles and next steps before making a commitment." /><Link className="text-link" href="/request-demo">Start a conversation <span aria-hidden="true">→</span></Link></div>
          <ImplementationJourney />
          <ProvisioningNotice />
          <p className="section-footnote">Implementation scope and timing are agreed after requirements assessment.</p>
        </div>
      </section>

      <section className="section home-faq">
        <div className="wrap faq-layout"><div><SectionHeading eyebrow="A FEW GOOD QUESTIONS" title="Clear answers, before the next step." copy="We believe useful conversations start with transparent expectations." /><Link className="text-link" href="/contact">Ask us a question <span aria-hidden="true">→</span></Link></div><div className="faq-list">{[
          ["Can PLS connect to our analyzer?", "We assess each instrument individually. Compatibility depends on the exact model, supported protocol, available interface and configuration."],
          ["Can staff and patients use the same portal?", "No. Facility access and patient results are separate journeys, and authentication stays in the approved application—not on this marketing website."],
          ["What does a demo cover?", "A conversation can focus on the workflows most relevant to your facility, using illustrative examples and synthetic values."],
          ["How quickly can we access PLS?", `${provisioning.description} ${provisioning.note}`],
        ].map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></div>
      </section>

      <section className="final-cta"><div className="wrap final-cta-inner"><span className="eyebrow">LET&apos;S TALK LABORATORY OPERATIONS</span><h2>Bring your laboratory<br />workflows into focus.</h2><p>Tell us how your facility works today. We&apos;ll help you explore whether PLS is a fit.</p><div><Link className="button button-white" href="/request-demo">Request a demo <span aria-hidden="true">↗</span></Link><Link className="cta-secondary" href="/contact">Talk to our team <span aria-hidden="true">→</span></Link></div><span className="cta-mark" aria-hidden="true">PLS</span></div></section>
    </>
  );
}
