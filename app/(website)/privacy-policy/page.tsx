import type { Metadata } from "next";
import { PageIntro } from "../../../website/components/ui/PageIntro";

export const metadata: Metadata = { title: "Privacy notice", description: "Draft privacy notice for the public Prime Laboratory Software website.", alternates: { canonical: "/privacy-policy" }, robots: { index: false, follow: true } };

export default function PrivacyPolicyPage() {
  return <>
    <PageIntro eyebrow="PRIVACY & INFORMATION" title="A clear boundary between public discovery and private records." description="This page is a draft privacy notice for business review. It is not a legal approval or a complete jurisdiction-specific privacy statement." action={false} />
    <article className="section article-section legal-page"><div className="article-wrap"><div className="draft-banner"><b>DRAFT — REQUIRES BUSINESS AND LEGAL REVIEW BEFORE PUBLICATION</b><span>Controller identity, contact channel, retention periods, legal bases and jurisdictional disclosures must be confirmed.</span></div>
      <section><h2>What this website is for</h2><p>This independent corporate website provides information about Prime Laboratory Software, product workflows, verified public facility profiles, approved portal destinations and business enquiry forms.</p></section>
      <section><h2>Patient information and facility credentials</h2><p>This marketing website is not a patient record system or facility login. Do not enter patient names, test results, medical records, passwords, authentication codes or other sensitive identifiers in website forms. The site has no public patient-result search form. Authentication and access controls are handled by the approved facility applications.</p></section>
      <section><h2>Enquiry information</h2><p>If configured and delivered successfully, enquiry form data may include a name, work email, optional phone number, organization, selected interests and message. Do not include health information. The business must configure an approved delivery destination and document its service providers, access controls, retention and deletion practices before launch.</p></section>
      <section><h2>Technical data, cookies and analytics</h2><p>The initial site does not include analytics or advertising trackers. Hosting infrastructure may process technical request data needed to deliver and protect the site; the hosting operator and retention period remain to be documented. No non-essential tracking should be added without an appropriate consent review.</p></section>
      <section><h2>Public facility information</h2><p>A facility profile is published only after verification and publication approval. Public directory pages do not expose patient records or facility credentials. External portal links require HTTPS and an approved hostname.</p></section>
      <section><h2>Questions and review</h2><p>Before publication, provide the responsible legal entity, an approved privacy contact, applicable jurisdictions, lawful bases, processors, retention periods and data-subject request process. No contact address is invented in this draft.</p></section>
      <p className="section-footnote">Draft prepared in October 2026. No business or legal approval is implied.</p>
    </div></article>
  </>;
}
