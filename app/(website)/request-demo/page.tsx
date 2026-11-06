import type { Metadata } from "next";
import { LeadForm } from "../../../website/components/forms/LeadForm";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { ProvisioningNotice } from "../../../website/components/marketing/ProvisioningNotice";
import { pricingOptions } from "../../../website/data/pricing";

export const metadata: Metadata = { title: "Request a PLS demo", description: "Request a conversation about laboratory workflows, product fit and implementation requirements.", alternates: { canonical: "/request-demo" } };

const fitFocuses = new Set([
  "Connected multi-site planning",
  "Integration-ready workflow planning",
  "Operational and financial oversight",
  "Operations and governance foundation",
  "Core laboratory workflow foundation",
]);

export default async function RequestDemoPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const pricingContext = pricingOptions.find(option => option.focus === focus)?.focus;
  const initialContext = pricingContext ?? (focus && fitFocuses.has(focus) ? focus : undefined);
  return <>
    <PageIntro eyebrow="REQUEST A DEMONSTRATION" title="Let's focus on the workflows that matter to your facility." description="Tell us a little about your organization and what you want to explore. We’ll use the information to prepare a relevant conversation." action={false} />
    <section className="section form-page"><div className="wrap form-page-layout"><div className="form-side-note"><span className="eyebrow">A USEFUL FIRST CONVERSATION</span><h2>Start with your operating context.</h2><p>Discuss current processes, facility priorities, integration questions and the next steps to evaluate fit.</p><ol className="conversation-list"><li><span>01</span>Understand your workflows</li><li><span>02</span>Explore relevant capabilities</li><li><span>03</span>Review scope and considerations</li></ol><div className="contact-aside"><span>i</span><p>Implementation scope and timing are agreed after requirements assessment.</p></div></div><div className="form-card"><h2>Request a conversation</h2><p>Required fields are marked with an asterisk. No patient data, please. This form starts a conversation; the five-minute provisioning period begins only after approval and payment.</p>{initialContext && <div className="form-context"><span>{pricingContext ? "PRICING ENQUIRY" : "FIT FINDER RESULT"}</span><b>{initialContext}</b><small>Added to your message so the conversation can start with this context.</small></div>}<LeadForm type="demo" initialContext={initialContext} /></div></div></section>
    <div className="wrap"><ProvisioningNotice /></div>
  </>;
}
