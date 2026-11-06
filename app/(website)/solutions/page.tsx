import type { Metadata } from "next";
import { headers } from "next/headers";
import { FeatureGrid } from "../../../website/components/ui/FeatureGrid";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { SectionHeading } from "../../../website/components/ui/SectionHeading";
import { solutions } from "../../../website/data/content";

export const metadata: Metadata = { title: "Laboratory management solutions", description: "Explore PLS solutions for test and report templates, clinician and organization tariffs, billing, commissions, analyzers, audit history and laboratory operations.", alternates: { canonical: "/solutions" } };

export default async function SolutionsPage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const structuredData = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "PLS Laboratory Management Platform", applicationCategory: "BusinessApplication", operatingSystem: "Web browser", description: "Laboratory software for test and report configuration, clinician and organization tariffs, billing, commissions, supported analyzer interfaces, specimens, audit history and operational reporting." };
  return <>
    <PageIntro eyebrow="PLS SOLUTIONS" title="Bring your laboratory's services and business rules together." description="Create tests and report templates, manage clinician and organization relationships, configure tariffs, connect supported instruments and follow operational and financial records." />
    <section className="section"><div className="wrap"><div className="solution-overview"><div><SectionHeading eyebrow="A CONNECTED OPERATING MODEL" title="From the first request to the management view." copy="PLS supports connected workflows across operational, financial and business functions. Explore the areas relevant to your facility." /></div><div className="overview-art" aria-hidden="true"><span>REGISTER</span><b>→</b><span>PROCESS</span><b>→</b><span>REVIEW</span><b>→</b><span>REPORT</span></div></div><FeatureGrid items={solutions} /><p className="section-footnote">Availability depends on facility configuration, deployment and agreed scope. No universal equipment compatibility or regulatory certification is implied.</p></div></section>
    <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </>;
}
