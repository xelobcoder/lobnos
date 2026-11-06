import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { SectionHeading } from "../../../website/components/ui/SectionHeading";
import { features, featureGroups } from "../../../website/data/content";
import { SoftwareCapabilities } from "../../../website/components/marketing/SoftwareCapabilities";
import { ActualProductGallery } from "../../../website/components/marketing/ActualProductGallery";
import { AnalyticsShowcase } from "../../../website/components/marketing/AnalyticsShowcase";
import { softwareCapabilityGroups } from "../../../website/data/software-capabilities";

export const metadata: Metadata = { title: "Complete PLS software feature catalog", description: "Explore every documented PLS workflow area: laboratory operations, portals, billing, pharmacy, inventory, finance, payroll, communications, reporting and facility administration.", alternates: { canonical: "/features" } };
const capabilityCount = softwareCapabilityGroups.reduce((count, group) => count + group.capabilities.length, 0);

const workflow = [
  ["01", "＋", "Receive", "Register patients and orders, then identify work for the laboratory."],
  ["02", "◉", "Process", "Collect, receive and review physical specimens with traceable hand-offs."],
  ["03", "✓", "Review", "Enter and validate results, handle critical alerts and route for authorization."],
  ["04", "▤", "Report", "Apply facility report preferences and access controls to printing or delivery."],
];

const operationalModules = [
  {
    title: "Accounting & financial control",
    description: "Operational accounting includes a general ledger, trial balance, income statement, balance sheet and cash flow views. It also supports accounts-receivable and accounts-payable aging, inventory valuation, subledger reconciliation, manual journal approval/posting/reversal, accounting periods, daily close, and bank statement import with match/unmatch workflows.",
    note: "Bank statement matching is a workflow for imported statements; it is not a claim of direct bank connectivity or automatic reconciliation. Budget planning and budget-versus-actual are not included in the verified capability set.",
  },
  {
    title: "Payroll & staff operations",
    description: "Configured workflows cover compensation, allowances, bonuses, grades, attendance, leave, tax deductions, payroll periods, processing, approval, locking, paid status, reversals and analytics. Commission capabilities include rates, tracking, batches and payment histories.",
    note: "Payroll rules and deductions must be reviewed for the customer’s applicable jurisdiction and policy.",
  },
  {
    title: "Pharmacy & prescriptions",
    description: "Pharmacy workflows include stock, sales, held sales and reversals. Clinician prescriptions can be supported with fulfillment and referral workflows.",
    note: "Product availability, dispensing controls and clinical processes require facility-specific configuration and review.",
  },
  {
    title: "Home collection & ultrasound",
    description: "Home collection covers service areas, staff and billed orders, assignment, status and checklists. Ultrasound workflows include waiting lists, templates and image uploads.",
    note: "Patient home-collection booking requires configured service areas, available slots and access. Booking/status tracking is not live GPS tracking. Imaging is not a generic DICOM/PACS archive.",
  },
  {
    title: "Communications & delivery",
    description: "Email providers, templates, queued messages, retries, logs and analytics; SMS templates and jobs; and notification inbox, event, template and queue workflows are available.",
    note: "Actual delivery requires configured providers and credentials; no delivery guarantee is made by the marketing website.",
  },
  {
    title: "Tenant & facility administration",
    description: "Provisioning, facility status, subscription records, payment records and voids, audit history, module activation and branch-mode settings support customer onboarding and administration. Separately configured payment gateways support checkout and provider verification.",
    note: "An administration payment record is not itself a provider transaction. Online collection requires configured gateway credentials and verification. Deployment, schema and service prerequisites apply.",
  },
];

export default function FeaturesPage() {
  return <>
    <PageIntro eyebrow="PLATFORM CAPABILITIES" title="See how PLS connects laboratory, finance and facility workflows." description={`Search ${capabilityCount} documented capabilities across ${softwareCapabilityGroups.length} workflow areas, review what depends on configuration, and inspect real product screens.`} />
    <AnalyticsShowcase />
    <SoftwareCapabilities />
    <section className="section section-showcase"><div className="wrap"><SectionHeading eyebrow="REAL SOFTWARE" title="See the interface behind the workflows." copy="Full demo software pages with their original headers and navigation. No replacement dashboards or redesigned page content." /><ActualProductGallery id="features-gallery" /><Link className="text-link" href="/product-tour">Open the full screenshot library <span aria-hidden="true">→</span></Link></div></section>
    <section className="section product-capabilities">
      <div className="wrap">
        <SectionHeading eyebrow="WHAT YOUR TEAMS CAN DO" title="Specific tools for the work inside your laboratory." copy="Explore the workflows, practical benefits and configuration requirements behind each capability." />
        <nav className="capability-jump-links" aria-label="Explore software capabilities">
          {features.map(feature => <a key={feature.number} href={`#capability-${feature.number}`}>{feature.title}</a>)}
        </nav>
        {featureGroups.map(group => (
          <section className="capability-detail-group" key={group.id} aria-labelledby={`capability-group-${group.id}`}>
            <div className="capability-detail-heading"><h2 id={`capability-group-${group.id}`}>{group.title}</h2><p>{group.copy}</p></div>
            <div className="capability-detail-grid">
              {features.filter(feature => group.numbers.includes(feature.number)).map(feature => (
                <article className="capability-detail-card" id={`capability-${feature.number}`} key={feature.number}>
                  <span className="eyebrow">{feature.tag}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                  <ul>{feature.workflows.map(workflow => <li key={workflow}>{workflow}</li>)}</ul>
                  <p className="capability-benefit"><strong>Why it matters</strong>{feature.benefit}</p>
                  {feature.caveat && <p className="capability-scope"><strong>Configuration &amp; scope</strong>{feature.caveat}</p>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
    <section className="section section-workflow"><div className="wrap"><SectionHeading eyebrow="A CONNECTED JOURNEY" title="Follow work through the laboratory." copy="A shared workflow view can help teams understand where a request is and what should happen next." /><div className="workflow-grid">{workflow.map(([number, icon, title, copy]) => <article key={number}><div className="workflow-step-head"><span className="workflow-icon" aria-hidden="true">{icon}</span><span className="workflow-number">{number}</span></div><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="section module-section"><div className="wrap"><SectionHeading eyebrow="OPERATIONAL MODULES" title="Deep functionality, clearly bounded." copy="The following capability groups are present in the current software. Actual availability, access and configuration must be confirmed for each deployment."/><div className="module-grid">{operationalModules.map((module, index) => <article key={module.title}><span className="module-number">0{index + 1}</span><h2>{module.title}</h2><p>{module.description}</p><small>{module.note}</small></article>)}</div></div></section>
    <section className="section"><div className="wrap"><SectionHeading eyebrow="EXTENDED WORKFLOWS" title="Explore home collection, ultrasound and instrument mappings." /><div className="related-grid"><Link href="/solutions/home-collection"><span>FIELD OPERATIONS</span><b>Home collection</b><span aria-hidden="true">↗</span></Link><Link href="/solutions/ultrasound-imaging-workflows"><span>IMAGING OPERATIONS</span><b>Ultrasound workflows</b><span aria-hidden="true">↗</span></Link><Link href="/solutions/analyzer-integration"><span>INTEROPERABILITY</span><b>Analyzer result mapping</b><span aria-hidden="true">↗</span></Link></div><p className="section-footnote">Named MindRay, AgileS20 and BioeLab adapters map device-specific JSON/HL7-style readings into result entry. Bring the exact chemistry, hematology or hormone/immunoassay instrument model and protocol to the integration assessment; live compatibility is not established by assay category alone.</p></div></section>
  </>;
}
