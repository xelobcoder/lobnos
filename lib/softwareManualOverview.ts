export interface SoftwareManualOverview {
 figures: {file:string;caption:string;callouts:{x:number;y:number;label:string}[]}[];
 title: string; purpose: string; philosophy: [string,string][]; organizationalValue: [string,string][];
 modules: [string,string,string][]; journey: [string,string,string][]; readingOrder: string[]; scope: string;
}
export const softwareManualOverview: SoftwareManualOverview = {
    "title": "Understanding Prime Laboratory Software",
    "purpose": "Prime Laboratory Software (PLS) brings the administrative, diagnostic, stock and financial work of a healthcare facility into connected workspaces. Its purpose is to help staff identify the right patient, record the requested service, account for charges and payments, track clinical work and hand over a traceable outcome to the next responsible person. It supports facilities with different combinations of laboratory, imaging, consultation and pharmacy services; the modules enabled for your facility determine what is available.",
    "philosophy": [
        [
            "One identity, connected records",
            "Start with the correct patient and facility. A visit, bill, service, physical sample, result and receipt are different records connected by their references. Search before creating a second patient; do not create a replacement bill just to recover a lost receipt."
        ],
        [
            "Each stage has a purpose",
            "Registration identifies the patient. Billing records charges. Collection records money received. Sample collection records a specimen. Result entry records findings. Validation approves a particular revision. Delivery records release. Completing one stage does not prove that every later stage is complete."
        ],
        [
            "Responsibility follows the work",
            "The front desk, cashier, collection team, scientist, validator, storekeeper and accountant have different responsibilities. An employee may have several assigned roles, but the active role and current branch determine the actions allowed in the workspace. A manual instruction never grants permission."
        ],
        [
            "Configuration reflects the facility",
            "Direct collection and a separate cashier counter are both supported. Payment, specimen, validation, critical-value and release settings can block a later action. Follow the configured workflow; do not change a control simply to get past a warning."
        ],
        [
            "Verify the saved outcome",
            "A preview, printed slip or entered amount does not establish that a transaction was saved. Record the generated reference and inspect the saved status, amount and history. After a timeout, check for an existing save before repeating it."
        ],
        [
            "Keep clinical and financial evidence traceable",
            "Use the existing correction, refund, revalidation, discrepancy and incident workflows. These preserve who did what and why. Do not replace an old record with a new one to hide an error."
        ]
    ],
    "organizationalValue": [
        [
            "Front desk and patients",
            "A consistent registration and billing sequence reduces duplicate identities, incorrect payer selection and repeated entry. Staff can give a clear next step and pass the correct reference to the cashier or clinical team."
        ],
        [
            "Clinical teams",
            "Linked service and specimen references support a clearer chain from request to collection, processing, current-result review and release. Status checks help the next team distinguish work ready to proceed from work awaiting a prerequisite."
        ],
        [
            "Store and departments",
            "Requisition, approved quantity, issue, acknowledgement and consumption have separate meanings. Department-level records help compare what was supplied, received and used without losing the general stock view."
        ],
        [
            "Finance and management",
            "Billing, receipts, outstanding balances, expenses, supplier payments, payroll and accounting reports answer different questions. Review the correct date, branch, account and report basis rather than treating billed revenue as cash collected."
        ]
    ],
    "modules": [
        [
            "CRM and front desk",
            "Patient registration, customer search, queue, referring practitioners, organizations and follow-up.",
            "Detailed procedures in this manual; begin here."
        ],
        [
            "Billing and collections",
            "Payer selection, services, prices, cashier handoff, partial collections, receipts, refunds and insurance balances.",
            "Detailed procedures in this manual; follows registration."
        ],
        [
            "Laboratory operations",
            "Specimens, result entry, validation, critical results, quality control, outsourcing, archives and delivery.",
            "Procedures in this manual; live verification status is stated per enhanced procedure."
        ],
        [
            "Imaging",
            "Imaging requests, templates, reports and departmental supplies.",
            "Included within Operations; site-specific examination/report training is also required."
        ],
        [
            "Inventory",
            "Purchasing, receipts, funded supplier payments, store and department custody, consumption, loss and analytics.",
            "Procedures in this manual; purchasing is distinct from departmental requisition approval."
        ],
        [
            "Pharmacy",
            "Medicines, prescriptions, dispensing, direct or cashier-counter sales, stock and financial days.",
            "Separate Pharmacy Learning Center and manual. This document does not replace it."
        ],
        [
            "Consultations and practitioner access",
            "Consultation records, practitioner access and case referrals where enabled.",
            "Module overview only here; dedicated practitioner training is outside this edition."
        ],
        [
            "Accounting",
            "Ledger, chart of accounts, financial statements, reconciliation, budgets and forecasts where enabled.",
            "Module overview only here; accounting configuration and closing require separate training."
        ],
        [
            "Payroll and human resources",
            "Employee compensation, salary templates, attendance, deductions and payroll processing/payment.",
            "Module overview only here; payroll procedures are outside this edition."
        ],
        [
            "Communications",
            "SMS/email templates, campaigns, delivery information and contact-group synchronization where enabled.",
            "Module overview only here; sending and provider configuration require their own permissions."
        ],
        [
            "Supporting workspaces",
            "Appointments, expenses, commissions, analytics, incident reporting and administration support the service teams.",
            "Relevant expense and referral procedures are included; remaining specialist configuration is not fully documented in this edition."
        ]
    ],
    "journey": [
        [
            "Front desk",
            "Find the existing patient or register once; confirm branch and requested services.",
            "Patient ID and selected visit."
        ],
        [
            "Billing desk",
            "Confirm payer and current charges; save the reviewed bill through the configured payment flow.",
            "Saved Bill ID; cashier code when separate-counter mode is configured."
        ],
        [
            "Cashier",
            "Retrieve the same bill, verify the current balance and record the actual authorized collection.",
            "Payment history, remaining balance and receipt."
        ],
        [
            "Collection and reception",
            "Identify the patient, record the physical specimen and complete the required reception/suitability checks.",
            "Sample UID/barcode and specimen status linked to the service."
        ],
        [
            "Scientist and validator",
            "Record the measured result, reopen to check it and approve the current revision under the configured controls.",
            "Saved result revision and required approvals."
        ],
        [
            "Delivery team",
            "Check release eligibility and patient/recipient details before handing over the final report.",
            "Released report and delivery record."
        ],
        [
            "Store and finance",
            "Record supporting stock movements and financial transactions in their own authorized workspaces.",
            "Order/receipt/movement references and reconciled financial evidence."
        ]
    ],
    "readingOrder": [
        "Read this introduction and the facility/role checks first.",
        "Complete the CRM/front-desk chapter: patient search, registration, queue and record review.",
        "Complete billing next: payer, selection, charges, save, cashier collection and receipt, then exceptional cases.",
        "Continue to laboratory work only after the patient/service handoff is understood. Follow specimen, result and release prerequisites.",
        "Use inventory and specialist chapters for the duties assigned to you. Do not assume a chapter makes every action available to your role."
    ],
    "scope": "This edition contains detailed task procedures for CRM, billing, Operations and inventory, with enhanced training examples and verification notes. It is not a claim that every application module has a complete manual or that every procedure has passed live acceptance testing. Screenshot captions and verification labels distinguish actual captures and completed checks from illustrative examples and remaining tests. Follow your facility’s clinical SOPs and policies alongside this software manual.",
    "figures": [
        {
            "file": "orientation-registration.png",
            "caption": "Front-desk orientation: the blank Patient Registration Wizard and Customer Management menu. Reused from the website; it is a reference illustration, not evidence of a new saved patient. Menu availability follows the active role.",
            "callouts": []
        },
        {
            "file": "orientation-billing.png",
            "caption": "Billing orientation: find the correct existing patient before building a bill. This website reference image explains the entry point; the live saved-bill walkthrough follows in the billing chapter.",
            "callouts": []
        }
    ]
};
