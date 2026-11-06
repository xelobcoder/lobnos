import type { Metadata } from "next";
import { LeadForm } from "../../../website/components/forms/LeadForm";
import { PageIntro } from "../../../website/components/ui/PageIntro";

export const metadata: Metadata = { title: "Contact PLS", description: "Send a general business enquiry to Prime Laboratory Software.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <>
    <PageIntro eyebrow="CONTACT PRIME LABORATORY SOFTWARE (PLS)" title="Start a conversation with our team." description="Share a little context about your question or organization. We’ll route your enquiry through the configured delivery channel." action={false} />
    <section className="section form-page"><div className="wrap form-page-layout"><div className="form-side-note"><span className="eyebrow">GENERAL ENQUIRIES</span><h2>Tell us what you need.</h2><p>For a product walkthrough, request a personalized demo. For other business questions, use this form.</p><div className="contact-aside"><span>↗</span><p>Please do not include patient information, medical details, passwords or sensitive identifiers.</p></div><p className="contact-no-details">Contact details are not published because no approved public company contact information has been provided.</p></div><div className="form-card"><h2>Send an enquiry</h2><p>Required fields are marked with an asterisk.</p><LeadForm type="contact" /></div></div></section>
  </>;
}
