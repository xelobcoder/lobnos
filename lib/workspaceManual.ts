export interface ManualIntroduction {
    sections?: { title: string; paragraphs: string[]; checklist: string[] }[];
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
        "overview": "This manual follows a diagnostic case from the patient visit and specimen through processing, result entry, validation and report delivery. It also explains how authorized staff create test panels and configure their result parameters and reference information, alongside supporting work such as critical-result communication, quality control, outsourcing, specimen retention, imaging and departmental stock. Staff must identify the same patient, visit and service at every handoff. A row in a worklist is a starting point for review. The service status and application rules determine which action can be performed.",
        "audience": "Laboratory scientists, phlebotomy staff, imaging staff, nurses, department heads, supervisors and authorized report-delivery staff.",
        "objectives": [
            "Locate the correct patient visit and identify its current stage.",
            "Create and verify test-panel and result-field configuration when authorized.",
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
                "Work within assigned visibility and editing permissions, record measured values and review material usage. Scientists with test-panel management permission may maintain panel details and result fields."
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
            "Check that the relevant device, control material or partner setup exists for the task.",
            "Confirm that test names, units and reference information come from an approved laboratory specification before configuring a panel."
        ],
        "rules": [
            "A changed result must be reviewed as its current revision. A previous approval must not be treated as approval of the changed values.",
            "Unpaid and partially paid services follow the application settings governing entry, validation and printing. A visible worklist row does not override those settings.",
            "Assigned responsibility does not itself grant editing, validation or supervisory authority.",
            "Test-panel management is a delegated permission. Staff with multiple roles must use an assigned scientist role to manage panels; panel deletion is restricted to super-admins.",
            "Reference information and calculation conditions must match an approved laboratory source and undergo the facility's review before live use. This manual does not supply clinical ranges.",
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
        ],
        "sections": [
            {
                "title": "What the front desk is responsible for",
                "paragraphs": [
                    "The front desk connects a person to the correct identity, requested services and next service point. Registration is not payment, and a patient record is not a laboratory result. Your responsibility is to confirm who the patient is, who is paying and where the patient should go next.",
                    "One person can return for several visits. Keep their existing patient identity and prepare the appropriate new visit/bill instead of registering the person again. A familiar name alone is not enough: compare the patient identifier and other available details before opening an action."
                ],
                "checklist": [
                    "Confirm the facility, branch and active role before the first patient.",
                    "Search the existing register before creating a new patient.",
                    "Use only your permitted patient, billing, consultation and result-delivery actions.",
                    "End each interaction with a clear handoff: destination, record reference and next task."
                ]
            },
            {
                "title": "Understand the identifiers before you begin",
                "paragraphs": [
                    "Patient ID identifies the person. A full patient ID may include facility-specific letters; a numeric internal ID may also be shown. Bill ID identifies one bill for that patient. The short cashier code retrieves that saved bill; it is not a password or proof of payment.",
                    "A service belongs to the bill. Later, a physical sample UID/barcode identifies a container linked to the requested tests. A result revision records a particular saved set of findings. A receipt number identifies recorded financial evidence. Never substitute one identifier for another just because both are numbers."
                ],
                "checklist": [
                    "Read back the patient name and identifier before billing or updating records.",
                    "Carry the saved Bill ID or cashier code to the counter.",
                    "Use the same patient and service references when the clinical team takes over."
                ]
            },
            {
                "title": "New patient or returning patient: choose the right path",
                "paragraphs": [
                    "For a returning patient, use Customers and Filter By Field to search Patientid, Fullpatientid, Mobile number or Fullname. Inspect the returned row, then use its Actions menu. For a new patient, open Registration and use Quick Duplicate Check before completing Basic Info.",
                    "When only basic registration is needed, Save & Proceed to Billing records the identity and moves to payer selection. For the full profile, Save & Continue to Address takes you through Address, Emergency Contact and Photo & Credentials. Follow the patient-registration procedure for required fields and the two paths.",
                    "If you discover a probable duplicate, record the two identifiers and use the facility’s authorized duplicate-review/merge process. Do not delete either history or edit one patient into another person."
                ],
                "checklist": [
                    "Verify age and its Yrs/Mths/Days unit, gender and contact spelling.",
                    "At Address, Region and Area are required even when the label lacks an asterisk.",
                    "Do not create portal credentials merely to complete registration.",
                    "After an uncertain save, search before trying again."
                ]
            },
            {
                "title": "Queue, appointments, referrals and results at reception",
                "paragraphs": [
                    "The queue helps staff track the current service stage. An appointment is a planned service; it is not proof that registration, billing or clinical work has completed. Link the intended patient or saved bill only through the permitted queue/appointment action.",
                    "A referring clinician or organization identifies where the case came from. The paying account identifies who owes the charge. They may be different. Review each independently during billing.",
                    "When a patient asks for results, use the released-result or delivery workflow permitted to you. A saved result may still await validation, payment, critical-value communication or release. Do not enter clinical values or mark delivery complete just to satisfy a reception request."
                ],
                "checklist": [
                    "Confirm the current queue ticket and patient before linking work.",
                    "Distinguish the referrer from the payer.",
                    "Check report release eligibility and recipient identity.",
                    "For a lost receipt, reprint the saved transaction; do not collect the money twice."
                ]
            }
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
        ],
        "sections": [
            {
                "title": "From request to charge: what billing records",
                "paragraphs": [
                    "Billing records the selected services, payer, reviewed prices, adjustments and applicable tax. Cash collection records money actually received. A bill can exist with nothing paid; its unpaid or partial balance remains visible until it is collected or adjusted through an authorized workflow.",
                    "In the Modern layout, the sequence is Billing setup → Select items → Review charges → Payment. Review the patient banner, paying account and Transaction options first. The legacy multi-billing layout follows the same underlying billing rules but arranges the controls differently.",
                    "Catalogue prices are a selection aid. The reviewed server quote is the amount to check before saving, because tax, payer rules, packages and time or urgent adjustments may affect the final payable."
                ],
                "checklist": [
                    "Confirm the intended services, not only their names or search position.",
                    "Review package contents and applicability before adding a package.",
                    "Only authorized staff may enter pricing adjustments.",
                    "Changing an outsourcing organization or other charge-related selection requires a new charge review."
                ]
            },
            {
                "title": "Choose the payer without confusing the referral",
                "paragraphs": [
                    "General Billing normally charges the patient. Organizational Billing, private insurance, NHIS and the special healthcare-provider source require their own configured account/member details and catalogue. The referring organization/clinician can be recorded separately.",
                    "If the chosen insurance catalogue has no configured services, ask the responsible administrator to review that setup. Do not select a different payer simply to make submission succeed. NHIS remittances are settled through recognized eligible receivables; the patient cash counter is not a substitute for that process.",
                    "FOC or staff benefit is not a cash payment. Select the eligible benefit account, reason and coverage where offered, review the remaining patient payable and follow any approval requirement. A waive-off is also distinct from money received and retains its own authority."
                ],
                "checklist": [
                    "Confirm payer and any required membership or claims information.",
                    "Check the service-period and branch for insurer settlement.",
                    "Never represent cash received as a waiver or staff benefit."
                ]
            },
            {
                "title": "Direct payment or a separate cashier: use the configured flow",
                "paragraphs": [
                    "In direct-payment mode, the authorized billing user completes the payment controls for the transaction. In separate-cashier mode, the registrar saves the reviewed charges with Save bill & generate cashier code. The code and unpaid slip pass to the cashier; the registrar has not collected money by generating them.",
                    "At Cash Collection, Find a bill contains separate Cashier code, Patient ID and Bill ID fields. Enter the appropriate reference and choose Find bill. The code lookup resolves the saved patient and bill automatically. Confirm the displayed identity and current balances before entering an amount.",
                    "Payment status affects the search. Pending is useful for outstanding bills. All or Completed may be needed to locate a settled bill for reprinting. A successful code lookup selects the matching bill; it must not create another bill."
                ],
                "checklist": [
                    "Wait for a saved Bill ID and code before sending the patient to the counter.",
                    "An unpaid invoice/payment slip is not a receipt for money received.",
                    "At the counter, use the original reference and verify patient, services and balance.",
                    "After a server interruption, review the saved record before resubmitting."
                ]
            },
            {
                "title": "Partial payment, final settlement and receipt copies",
                "paragraphs": [
                    "Enter the payment against the intended service rows. The Payment overview distinguishes the current saved balance from Collecting now, which is only an entry until Collect Payment succeeds. Remaining after payment is a preview, not proof that the balance has been settled.",
                    "Choose the actual Payment method. For Cash, enter Cash received and review any change. For final settlement, Use full balance fills the remaining amounts; inspect each row before submitting. A payment cannot exceed the current amount collectible.",
                    "After a saved collection, inspect the updated balance and receipt. Reprint receipt, POS and Print receipt retrieve evidence of the saved transaction. Generating another receipt copy must not record another payment. The receipt audit register and Daily Sales Report provide additional record-finding paths described in the receipt procedure."
                ],
                "checklist": [
                    "Initial payable minus actual payments minus authorized waivers must explain the remaining balance.",
                    "Reopen the same bill between instalments.",
                    "After an uncertain payment response, inspect history before retrying.",
                    "Check full patient name, Bill ID, amounts and receipt format before printing."
                ]
            },
            {
                "title": "Corrections and closing the working day",
                "paragraphs": [
                    "For an incorrect service, amount or payment, use the available amendment, void, refund or reversal workflow with the required authorization and evidence. These actions have different financial consequences; do not use a new bill or waiver as a replacement for a proper correction.",
                    "At the end of a shift, review the appropriate sales session, actual collections and handover information. Billed value and cash collected can differ: some services remain unpaid and some collections settle earlier bills. Compare the same branch, date basis and payment methods.",
                    "Do not close a session while unresolved amounts or required handovers remain unexplained. Use the authorized reviewer and reconciliation process rather than entering a balancing number solely to make the screen close."
                ],
                "checklist": [
                    "Record saved bill, payment and correction references for investigation.",
                    "Count physical cash and compare the applicable cash collections.",
                    "Review pending corrections and required handovers before closure."
                ]
            }
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
