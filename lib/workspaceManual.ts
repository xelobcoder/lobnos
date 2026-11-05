export interface ManualIntroduction {
    overview: string;
    audience: string;
    objectives: string[];
    roles: [string, string][];
    readiness: string[];
    rules: string[];
    daily: string[];
}
export const manualIntroductions: Record<string, ManualIntroduction> = {
    "operations": {
        "overview": "This manual follows a diagnostic case from the patient visit and specimen through processing, result entry, validation and report delivery. It also explains supporting work such as critical-result communication, quality control, outsourcing, specimen retention, imaging and departmental stock. Staff must identify the same patient, visit and service at every handoff. A row in a worklist is a starting point for review. The service status and application rules determine which action can be performed.",
        "audience": "Laboratory scientists, phlebotomy staff, imaging staff, nurses, department heads, supervisors and authorized report-delivery staff.",
        "objectives": [
            "Locate the correct patient visit and identify its current stage.",
            "Record specimen, result and delivery actions against the correct service.",
            "Distinguish result entry, validation, communication and final release.",
            "Investigate rejected samples, missing evidence and outsourced report returns.",
            "Track material custody and usage by the responsible department."
        ],
        "roles": [
            [
                "Collection staff",
                "Confirm patient identity, collect the required specimen and record specimen movements."
            ],
            [
                "Scientist / result author",
                "Work within assigned visibility and editing permissions, record measured values and review material usage."
            ],
            [
                "Validator",
                "Independently review the current result revision under the configured validation requirements."
            ],
            [
                "Nurse",
                "Record measured vital signs for the selected patient using the displayed units."
            ],
            [
                "Imaging practitioner",
                "Review the requested examination and record the permitted imaging report."
            ],
            [
                "Department staff",
                "Request, receive and consume stock according to independently granted permissions."
            ],
            [
                "Supervisor / administrator",
                "Manage the permitted operational settings and review exceptions within branch and tenant scope."
            ]
        ],
        "readiness": [
            "Confirm the active facility, branch and role before opening clinical work.",
            "Have a reliable patient identifier and the intended visit or billing reference.",
            "Review specimen requirements, required workflow stages and payment eligibility.",
            "Check that the relevant device, control material or partner setup exists for the task."
        ],
        "rules": [
            "A changed result must be reviewed as its current revision. A previous approval must not be treated as approval of the changed values.",
            "Unpaid and partially paid services follow the application settings governing entry, validation and printing. A visible worklist row does not override those settings.",
            "Assigned responsibility does not itself grant editing, validation or supervisory authority.",
            "Critical-result acknowledgement, successful clinician communication and release clearance are separate recorded events.",
            "A returned external PDF provides source evidence. Internal validation and report release still follow their own checks.",
            "Receipt of department stock must reflect the physical quantity received. Unreceived quantities require investigation and cannot be consumed."
        ],
        "daily": [
            "Review assigned and pending work and identify missing prerequisites.",
            "Confirm collection and specimen suitability before result processing.",
            "Record results, route the current revisions for required review and resolve communication holds.",
            "Review undelivered reports and document the appropriate recipient handoff.",
            "Record actual stock usage and review unresolved shortages or incidents."
        ]
    },
    "crm": {
        "overview": "This manual explains how front-desk and customer-service work establishes a reliable patient identity and carries it into the visit, billing and report handoff. It also covers referrer relationships, enquiries and follow-up. Patient identity is the connecting reference. Similar names, different spelling or a returning visit are reasons to search carefully before creating another record.",
        "audience": "Registrars, reception and customer-service staff, authorized marketers, managers and administrators.",
        "objectives": [
            "Find an existing patient before creating a new identity.",
            "Review registration and contact information before saving.",
            "Follow the active visit and transfer the correct reference to billing or another service point.",
            "Locate eligible reports and review their delivery state.",
            "Distinguish patient service, referrer acquisition and management tasks."
        ],
        "roles": [
            [
                "Registrar / CRM staff",
                "Search patients, register authorized new records, review the queue and prepare permitted billing requests."
            ],
            [
                "Customer-service staff",
                "Review patient enquiries, eligible reports and result-delivery state within their access."
            ],
            [
                "Marketer",
                "Use assigned referrer acquisition and follow-up records. Patient registration access is separate."
            ],
            [
                "Cashier",
                "Collect payments through the billing workspace. Cashier and CRM page access are distinct."
            ],
            [
                "Manager / administrator",
                "Manage permitted organization, practitioner and configuration tasks and investigate exceptions."
            ]
        ],
        "readiness": [
            "Confirm the active branch and role.",
            "Ask for patient identifiers and review available identity information.",
            "Check contact details with the patient or authorized referrer.",
            "Identify whether the task concerns an existing patient, a new registration, a referrer or a specific visit."
        ],
        "rules": [
            "A patient name alone may not uniquely identify a person. Confirm the intended record before changing details or handing over a report.",
            "Use the saved patient and visit references in subsequent billing and clinical work.",
            "Management actions on organizations, practitioners and portal access retain their own permissions.",
            "Legacy lead and follow-up URLs redirect into referrer acquisition. Access is checked against that destination.",
            "A report enquiry, report opening and recorded delivery represent different stages.",
            "Opening a phone, email or messaging link does not prove that communication was delivered."
        ],
        "daily": [
            "Search and identify the arriving patient.",
            "Register only where a new identity is appropriate and confirm the saved reference.",
            "Review the active visit and direct the patient to the next service point.",
            "Hand the correct patient and payer context to billing.",
            "Review follow-up and report-delivery enquiries against the recorded history."
        ]
    },
    "billing": {
        "overview": "This manual explains how services become a bill, how the payer and price are selected, and how actual money received is allocated and receipted. Preparing a bill and collecting money can be performed by different people. A saved bill records charges. A recorded collection reduces the relevant balance. Keeping those stages distinct is essential for cashier handoffs, partial payment, waivers, organization invoicing and NHIS remittances.",
        "audience": "Registrars preparing bills, cashiers, accountants, billing managers and authorized administrators.",
        "objectives": [
            "Select the correct patient, payer, services and applicable pricing.",
            "Review packages, strategies and outsourcing choices before saving.",
            "Use the configured direct-payment or cashier-handoff workflow.",
            "Allocate payments and authorized waivers without exceeding payable balances.",
            "Find receipts, review collections and understand organization and NHIS balances."
        ],
        "roles": [
            [
                "Registrar / billing desk",
                "Prepare permitted patient bills and hand the recorded reference to the cashier when configured."
            ],
            [
                "Cashier",
                "Review the saved bill, allocate actual collections and print or reprint the recorded receipt."
            ],
            [
                "Accountant",
                "Review permitted collection, invoice, insurance, reconciliation and correction work."
            ],
            [
                "Manager / administrator",
                "Manage authorized pricing configuration and review exceptions. Financial approval limits remain applicable."
            ]
        ],
        "readiness": [
            "Confirm the patient and active branch.",
            "Review the responsible payer and any applicable organization, insurer, package or strategy.",
            "Use the sales session required by the current financial configuration.",
            "Review the selected services, adjustments, payable amount and intended payment choice before submitting."
        ],
        "rules": [
            "A receipt must correspond to a recorded payment. Reprinting uses the original recorded transaction.",
            "A partial payment leaves a remaining balance. An authorized waiver is a separate reduction and needs its own review.",
            "The sum of allocated payments and waivers must agree with the intended bill balances. Review totals before confirming.",
            "Selecting an outsourcing organization is optional for billing. Later organization changes require relevant charges to be reviewed again.",
            "NHIS settlement requires recognized eligible receivables for the selected branch and service period. Legacy billing balances alone do not create accounting recognition.",
            "Review saved payment history before retrying an uncertain collection, so the same money is not recorded twice."
        ],
        "daily": [
            "Review the active sales-session requirements.",
            "Prepare or locate the correct bill and confirm payer and services.",
            "Review the current outstanding amount before entering payment allocations.",
            "Record actual collections using the correct method and verify the receipt.",
            "Review session totals, outstanding balances and any pending corrections."
        ]
    },
    "inventory": {
        "overview": "This manual explains the stock catalogue, procurement, receipt, funded supplier payments, department custody, consumption and movement review. Quantities must be read with their units. Financial payments must identify the account supplying the money. A department requisition, store approval, issue, physical receipt and consumption are separate records that together explain where the stock is and how it has been used.",
        "audience": "Storekeepers, authorized laboratory and imaging stock users, purchasing staff, accountants, managers and administrators.",
        "objectives": [
            "Maintain usable item, supplier, unit and storage definitions.",
            "Trace purchase orders, goods receipts and supplier payment records.",
            "Select an authorized payment account and review available funds.",
            "Approve above or below the requested stock quantity within available stock.",
            "Confirm actual department receipt, record usage and investigate shortages.",
            "Interpret stock, cost, procurement and movement reports using consistent scope."
        ],
        "roles": [
            [
                "Requesting department",
                "Select needed items and submit a requisition when request access is granted."
            ],
            [
                "Storekeeper / authorized issuer",
                "Review requested and available quantities, approve the appropriate quantity and record issue."
            ],
            [
                "Receiving staff",
                "Count the delivery and confirm the quantity physically received."
            ],
            [
                "Consuming staff",
                "Record actual use, wastage, loss or return against the department received balance."
            ],
            [
                "Finance user",
                "Review supplier payment, authorized funding account, available funds and approval requirements."
            ],
            [
                "Manager / administrator",
                "Maintain permitted master data, approve relevant actions and review exceptions and incidents."
            ]
        ],
        "readiness": [
            "Confirm the branch and whether the task concerns stores, laboratory or imaging custody.",
            "Check item identity and purchase or consumption unit.",
            "Review available stock before approving or recording a movement.",
            "For payment, review the supplier, outstanding amount, funding account and available funds."
        ],
        "rules": [
            "Approval may increase or decrease a requested quantity, subject to available stock and the relevant permission.",
            "Issue records stock sent. Receipt records what arrived. Consume only from the appropriate available received balance.",
            "Requisition reasons and ordinary department-consumption reasons are optional. Wastage, loss and specified exception actions require supporting reasons.",
            "A receipt discrepancy remains visible as unreceived stock until resolved through the authorized return or transit-loss process and relevant investigation.",
            "A head role is not the only way to receive department permissions. Request, receipt, consumption and issue capabilities are granted independently.",
            "Supplier payments require an eligible authorized funding account. Posted balance, commitments and available funds must be distinguished."
        ],
        "daily": [
            "Review pending department requests and store availability.",
            "Approve and issue the intended quantities.",
            "Review receipt confirmations and unresolved shortages.",
            "Record actual stock use and exceptions in the appropriate custody workspace.",
            "Review supplier payment and stock reports using consistent dates, units and scope."
        ]
    }
};
