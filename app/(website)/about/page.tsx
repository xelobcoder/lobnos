import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { ProvisioningNotice } from "../../../website/components/marketing/ProvisioningNotice";
import { SectionHeading } from "../../../website/components/ui/SectionHeading";
import { ImplementationJourney } from "../../../website/components/marketing/ImplementationJourney";
import { company } from "../../../website/data/content";

export const metadata: Metadata = { title: "About PLS", description: "Learn about Prime Laboratory Software and its approach to connected laboratory workflows.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return <>
    <PageIntro eyebrow="ABOUT PRIME LABORATORY SOFTWARE (PLS)" title="Technology should make the work clearer." description="PLS brings laboratory operations and business workflows into a more connected view—built around the people who keep diagnostic services moving." />
    <section className="section"><div className="wrap about-story"><div><span className="eyebrow">OUR POINT OF VIEW</span><h2>Understand the workflow before the software.</h2></div><div><p className="large-copy">A laboratory is an ecosystem of people, processes, equipment and decisions. Good software supports that system without pretending every facility works the same way.</p><p>Prime Laboratory Software develops laboratory management technology for teams that want clearer operational workflows across registration, specimens, results, billing, inventory and management reporting. We work with each organization to understand what is implemented, what can be configured, and what needs separate technical assessment.</p></div></div></section>
    <section className="section about-values"><div className="wrap"><SectionHeading eyebrow="HOW WE APPROACH THE WORK" title="Practical principles, not empty promises." /><div className="value-grid">{company.values.map((value, index) => <article key={value}><span>0{index + 1}</span><h3>{value}</h3><p>{["Start from actual roles, hand-offs and daily priorities.", "Make scope, responsibilities and readiness visible.", "Be clear about what is available and what needs validation.", "Keep access boundaries and appropriate information use in focus."][index]}</p></article>)}</div></div></section>
    <section className="section"><div className="wrap"><SectionHeading eyebrow="WORK TOGETHER" title="A considered path to implementation." copy="Every facility starts with its own services, workflows and requirements. A conversation helps establish fit and the right next step." /><ImplementationJourney /><p className="section-footnote">Implementation timing and scope are agreed after requirements assessment.</p></div></section>
    <div className="wrap"><ProvisioningNotice /></div>
    <section className="compact-cta"><div className="wrap"><div><span className="eyebrow">START WITH A CONVERSATION</span><h2>Let&apos;s understand your laboratory&apos;s needs.</h2></div><Link className="button button-dark" href="/request-demo">Talk to PLS <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
