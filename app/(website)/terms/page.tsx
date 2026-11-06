import type { Metadata } from "next";
import { PageIntro } from "../../../website/components/ui/PageIntro";

export const metadata: Metadata = { title: "Terms of use", description: "Draft terms of use for the public Prime Laboratory Software website.", alternates: { canonical: "/terms" }, robots: { index: false, follow: true } };

export default function TermsPage() {
  return <>
    <PageIntro eyebrow="WEBSITE TERMS" title="Terms for using this public information site." description="This draft is provided for review and does not constitute approved legal terms or a customer software agreement." action={false} />
    <article className="section article-section legal-page"><div className="article-wrap"><div className="draft-banner"><b>DRAFT — REQUIRES BUSINESS AND LEGAL REVIEW BEFORE PUBLICATION</b><span>Confirm the legal entity, governing law, jurisdiction, liability terms, intellectual property position and support contacts.</span></div>
      <section><h2>Purpose and accuracy</h2><p>This website provides general information about Prime Laboratory Software and its laboratory workflow software. Product availability, configurations, integrations and deployment scope vary and should be confirmed in a written assessment or agreement.</p></section>
      <section><h2>No clinical advice or patient portal</h2><p>Website content is not medical advice and does not provide patient results. Do not submit patient information or access credentials through this website. Patient access is provided only by an approved facility portal.</p></section>
      <section><h2>External destinations</h2><p>Links to facility or patient portals direct visitors to separately operated or configured applications. Users should verify that they are accessing the correct portal and follow that facility’s terms and authentication process.</p></section>
      <section><h2>Enquiries and service commitments</h2><p>An enquiry form is not a service-level commitment. Enquiries are acknowledged as delivered only when the configured business delivery service confirms successful acceptance. The website makes no uptime, certification or implementation-timeline guarantee.</p></section>
      <section><h2>Publication requirements</h2><p>Before publication, add the approved legal business name, registered details if required, governing jurisdiction, effective date, complaint/contact mechanism and reviewed commercial terms.</p></section>
      <p className="section-footnote">Draft prepared for business review. It must not be presented as legal approval.</p>
    </div></article>
  </>;
}
