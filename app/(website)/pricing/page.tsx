import type { Metadata } from "next";
import Link from "next/link";
import { pricingFaqs, pricingOptions, quoteFactors } from "../../../website/data/pricing";

export const metadata: Metadata = {
  title: "PLS pricing & implementation options",
  description: "Request a tailored Prime Laboratory Software quotation. Explore laboratory, complete operations and multi-site requirements, implementation scope and pricing FAQs.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <section className="pricing-hero">
        <div className="wrap">
          <span className="pricing-kicker"><span aria-hidden="true" /> PLS PRICING &amp; IMPLEMENTATION</span>
          <h1>The right scope for your lab.<br /><span>A clear quote before you commit.</span></h1>
          <p>Start with the workflows you need. We&apos;ll discuss your facility, configuration and rollout so you can evaluate a quotation with a clearly defined scope.</p>
          <div className="pricing-hero-actions"><Link className="button" href="/request-demo">Request a quotation <span aria-hidden="true">↗</span></Link><a className="text-link" href="#pricing-options">Explore your options <span aria-hidden="true">↓</span></a></div>
          <p className="pricing-disclosure">Custom quotations · No published fixed rates · Modules and commercial terms confirmed in writing</p>
        </div>
      </section>
      <section className="section pricing-options" id="pricing-options" aria-labelledby="pricing-options-title">
        <div className="wrap">
          <div className="pricing-section-heading"><div><span className="eyebrow">START WITH YOUR REQUIREMENTS</span><h2 id="pricing-options-title">What would you like to bring together?</h2></div><p>Three ways to start a conversation—not fixed packages or license tiers.</p></div>
          <div className="pricing-grid">
            {pricingOptions.map((option, index) => (
              <article className={`pricing-card${index === 1 ? " pricing-card-featured" : ""}`} key={option.id} aria-labelledby={`pricing-${option.id}-title`}>
                <span className="pricing-card-label">{option.label}</span>
                <h3 id={`pricing-${option.id}-title`}>{option.title}</h3>
                <p className="pricing-card-description">{option.description}</p>
                <div className="pricing-card-price"><strong>Custom quote</strong><span>Based on your agreed requirements</span></div>
                <Link className={`button${index === 1 ? "" : " button-outline"}`} href={`/request-demo?focus=${encodeURIComponent(option.focus)}`}>Discuss this scope <span aria-hidden="true">↗</span></Link>
                <h4>Workflows to discuss</h4>
                <ul>{option.workflows.map(workflow => <li key={workflow}><span aria-hidden="true">✓</span>{workflow}</li>)}</ul>
                <p className="pricing-card-note">Final module availability, license terms and setup are confirmed in your quotation.</p>
              </article>
            ))}
          </div>
          <div className="pricing-catalog-link"><span>Want to check a specific workflow?</span><Link className="text-link" href="/features#software-capabilities">Explore all 100 capabilities <span aria-hidden="true">→</span></Link><Link className="text-link" href="/product-tour">See the real interface <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>
      <section className="section pricing-factors" aria-labelledby="quote-factors-title">
        <div className="wrap">
          <div className="pricing-section-heading"><div><span className="eyebrow">NO GUESSWORK</span><h2 id="quote-factors-title">What shapes your quotation?</h2></div><p>Review the software scope and implementation costs together, before making a decision.</p></div>
          <div className="quote-factor-grid">{quoteFactors.map((factor, index) => <article key={factor.title}><span className="quote-factor-number">{String(index + 1).padStart(2, "0")}</span><h3>{factor.title}</h3><p>{factor.detail}</p></article>)}</div>
        </div>
      </section>
      <section className="section pricing-onboarding" aria-labelledby="pricing-onboarding-title">
        <div className="wrap">
          <div className="pricing-section-heading"><div><span className="eyebrow">FROM DEMONSTRATION TO GO-LIVE</span><h2 id="pricing-onboarding-title">A practical path to getting started.</h2></div></div>
          <ol className="pricing-steps">{[
            ["Review your workflows", "Show us your current processes and see the relevant PLS capabilities in a demonstration."],
            ["Agree scope & quotation", "Confirm modules, licenses, setup, commercial terms and implementation responsibilities."],
            ["Configure, validate & launch", "Prepare the facility, validate agreed integrations and train teams against rollout milestones."],
          ].map(([title, detail], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{detail}</p></li>)}</ol>
        </div>
      </section>
      <section className="section pricing-faq" aria-labelledby="pricing-faq-title">
        <div className="wrap pricing-faq-layout">
          <div><span className="eyebrow">BEFORE YOU DECIDE</span><h2 id="pricing-faq-title">Pricing questions,<br />answered clearly.</h2><p>Need to discuss your own facility?</p><Link className="text-link" href="/contact">Speak with us <span aria-hidden="true">→</span></Link></div>
          <div className="pricing-faq-list">{pricingFaqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
        </div>
      </section>
      <section className="pricing-final-cta"><div className="wrap"><div><span className="eyebrow">LET&apos;S TALK ABOUT YOUR LAB</span><h2>See the workflows. Understand the scope.</h2><p>Get a demonstration and a quotation tailored to your requirements.</p></div><Link className="button button-white" href="/request-demo">Request a demo &amp; quote <span aria-hidden="true">↗</span></Link></div></section>
    </>
  );
}
