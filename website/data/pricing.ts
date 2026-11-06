export const pricingOptions = [
  {
    id: "laboratory",
    title: "Laboratory essentials",
    label: "FOR YOUR DAILY LAB WORK",
    description: "Focus your quotation on the patient-to-report journey.",
    focus: "Pricing enquiry: Laboratory essentials",
    workflows: ["Patient registration & test ordering", "Specimen collection & tracking", "Result entry, review & reporting", "Billing, payments & collections", "Staff roles & access controls"],
  },
  {
    id: "operations",
    title: "Complete operations",
    label: "BEYOND THE LABORATORY BENCH",
    description: "Explore clinical workflows alongside your wider business operations.",
    focus: "Pricing enquiry: Complete operations",
    workflows: ["Laboratory workflow requirements", "Inventory & departmental stock", "Accounting & financial oversight", "Payroll & commission workflows", "Pharmacy, CRM & communications"],
  },
  {
    id: "network",
    title: "Multi-site & integrations",
    label: "FOR MORE COMPLEX REQUIREMENTS",
    description: "Discuss facility structure, connected systems and rollout scope.",
    focus: "Pricing enquiry: Multi-site & integrations",
    workflows: ["Facility & branch configuration", "Role-specific workspaces", "Supported analyzer mappings", "Patient & clinician portal access", "Deployment & provider configuration"],
  },
] as const;

export const quoteFactors = [
  { title: "Modules & workflows", detail: "The clinical and operational workflows you want enabled, with their configuration and access requirements." },
  { title: "Facilities & staff", detail: "Your facility structure, branch requirements and staff access. Confirm license scope in the written quotation." },
  { title: "Implementation & migration", detail: "Configuration, training and any data migration, including feasibility, validation and agreed responsibilities." },
  { title: "Instruments & providers", detail: "Supported instrument mappings and payment or messaging provider setup. Third-party charges must be confirmed separately." },
  { title: "Deployment & support", detail: "Hosting arrangements, support scope, maintenance, rollout milestones and any agreed service terms." },
  { title: "Commercial terms", detail: "Currency, taxes, payment schedule, renewal and cancellation terms. These are agreed in your quotation, not assumed here." },
] as const;

export const pricingFaqs = [
  { question: "Where are the monthly or annual prices?", answer: "PLS currently provides custom quotations rather than publishing fixed subscription rates. Request a quotation for your facility so the price, currency, payment schedule and scope are explicit." },
  { question: "Are these fixed packages?", answer: "No. These are starting points for a pricing conversation, not fixed license tiers or guaranteed module bundles. Your written quotation confirms exactly what is included." },
  { question: "Does a quote include every feature in the catalog?", answer: "Not automatically. The catalog describes implemented capabilities. Availability depends on agreed modules, permissions, configuration and deployment prerequisites. Confirm your required workflows during the demonstration." },
  { question: "How are analyzer and provider integrations handled?", answer: "PLS has supported device-specific analyzer mappings and configured payment and messaging integrations. Compatibility and acceptance must be assessed for your devices and providers; setup and third-party costs are confirmed in your quote." },
  { question: "How long does onboarding take?", answer: "Workspace provisioning is separate from full implementation. Data migration, configuration, integration validation, training and go-live milestones are agreed after reviewing your requirements." },
  { question: "Can we see the software before agreeing?", answer: "Yes. Browse the real demo-page screenshots or request a demonstration focused on your workflows before agreeing pricing and implementation scope." },
] as const;
