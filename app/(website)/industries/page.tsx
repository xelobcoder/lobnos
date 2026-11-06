import type { Metadata } from "next";
import Link from "next/link";
import { IndustryExplorer } from "../../../website/components/marketing/IndustryExplorer";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { SectionHeading } from "../../../website/components/ui/SectionHeading";
import { industries } from "../../../website/data/content";

export const metadata: Metadata = { title: "Industries and use cases", description: "Explore laboratory workflow use cases for diagnostic laboratories, hospitals, diagnostic centres and laboratory groups.", alternates: { canonical: "/industries" } };

export default function IndustriesPage() {
  return <>
    <PageIntro eyebrow="INDUSTRIES & USE CASES" title="A platform shaped around laboratory settings." description="Different laboratory environments have different processes, roles and boundaries. Explore how PLS may support the work, then validate fit against your requirements." />
    <section className="section setting-library">
      <div className="wrap">
        <div className="section-topline">
          <SectionHeading eyebrow="EXPLORE BY SETTING" title="Start with the way your organization works." copy="These pages describe potential workflow fit—not claims about current customer deployments." />
          <span className="resource-count">{industries.length} laboratory settings</span>
        </div>
        <IndustryExplorer industries={industries} />
        <div className="protocol-row setting-common">
          <span className="protocol-row-label">SHARED ACROSS EVERY SETTING</span>
          <ul>
            <li>Role-based access</li>
            <li>Configured billing &amp; receivables</li>
            <li>Specimen-to-report traceability</li>
            <li>Audit records</li>
            <li>5-minute workspace provisioning</li>
          </ul>
          <p className="protocol-row-note">Which of these apply to your facility—and how they are configured—is agreed during requirements assessment.</p>
        </div>
        <p className="resource-guidance"><span aria-hidden="true">i</span>Each page describes workflows PLS is designed to support. Integration, governance and deployment requirements still need an assessment against your own environment.</p>
      </div>
    </section>
    <section className="compact-cta"><div className="wrap"><div><span className="eyebrow">NOT SURE WHICH SETTING FITS?</span><h2>Describe your facility and we will map it with you.</h2></div><Link className="button button-dark" href="/request-demo">Talk through your workflow <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
