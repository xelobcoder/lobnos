import { canAccessRolePage, type NavigationSettings } from './roleNavigationPolicy';
import { canAccessFacilityModule } from './facilityModuleAccess';
import { isSuperAdminRole } from '../components/Auth/roles';
export type LearningModule = 'operations' | 'crm' | 'billing' | 'inventory';
export interface WorkspacePilot {
    reviewedAt: string; status: string; checked: string[]; pending: string[]; exercise: string;
    fields: { name: string; rule: string; mistake: string }[];
    screenshots: { file: string; caption: string; callouts: { x: number; y: number; label: string }[] }[];
}
export interface WorkspaceArticle {
    pilot?: WorkspacePilot;
    slug: string;
    title: string;
    category: string;
    route: string;
    entryRoutes?: string[];
    kind: 'page' | 'workflow';
    purpose: string;
    concept: string;
    open: string;
    before: string[];
    controls: { name: string; description: string }[];
    steps: string[];
    after: string;
    verify: string;
    recovery: string;
    example: { situation: string; action: string; expected: string };
    related: string[];
}
export interface WorkspaceLearningModule {
    id: LearningModule;
    title: string;
    description: string;
    articles: WorkspaceArticle[];
    glossary: { term: string; meaning: string }[];
    startPath: string[];
}
export const workspaceLearning: WorkspaceLearningModule[] = [
    {
        "id": "operations",
        "title": "Operations",
        "description": "Samples, results, quality and departmental stock",
        "articles": [
            {
                "slug": "sample-to-report",
                "title": "From sample to delivered result",
                "category": "Clinical workflow",
                "route": "/operations/laboratory/sample/collection",
                "purpose": "Follow one patient visit from specimen collection through result delivery.",
                "kind": "workflow",
                "concept": "Follow one patient visit from specimen collection through result delivery. Each stage is performed by a person with the existing permission for that task.",
                "before": [
                    "Confirm the patient identifier, visit and requested service carried between the clinical stages.",
                    "Agree who is responsible for the next handoff."
                ],
                "controls": [
                    {
                        "name": "Collection team",
                        "description": "Confirm the patient and specimen, then record collection."
                    },
                    {
                        "name": "Sample reviewer",
                        "description": "Review suitability before processing."
                    },
                    {
                        "name": "Result author",
                        "description": "Record measured values against the correct service."
                    },
                    {
                        "name": "Validator",
                        "description": "Review and approve the latest revision."
                    },
                    {
                        "name": "Delivery team",
                        "description": "Deliver an eligible report and record the handoff."
                    }
                ],
                "steps": [
                    "Confirm the patient and specimen, then record collection.",
                    "Review suitability before processing.",
                    "Record measured values against the correct service.",
                    "Review and approve the latest revision.",
                    "Deliver an eligible report and record the handoff."
                ],
                "verify": "Confirm the current revision is approved and the intended report delivery is recorded.",
                "recovery": "If a stage is blocked, review its record status, required information and responsible role before proceeding. For an uncertain save, inspect the recorded history before retrying.",
                "after": "The visit has a reviewed specimen, a recorded current result revision and the required approval and delivery records.",
                "example": {
                    "situation": "A visit needs collection, processing and a released report.",
                    "action": "Move through the required stages using the task guides. The responsible authorized person completes each handoff.",
                    "expected": "Confirm the current revision is approved and the intended report delivery is recorded."
                },
                "related": [
                    "sample-collection",
                    "sample-validation",
                    "result-entry",
                    "result-validation",
                    "result-delivery"
                ],
                "open": "Use the task-page link to open the first stage. Continue through the linked guides using your authorized role.",
                "entryRoutes": [
                    "/operations/laboratory/sample/collection",
                    "/operations/laboratory/sample/validation",
                    "/operations/laboratory/processing",
                    "/operations/laboratory/validation",
                    "/operations/laboratory/undelivered"
                ]
            },
            {
                "slug": "vital-signs",
                "title": "Record patient vital signs",
                "category": "Patient assessment",
                "route": "/operations/laboratory/vitals/record-vital-sign",
                "purpose": "Record measurements against the correct patient.",
                "steps": [
                    "Find the patient using a search field and at least three characters. Select the intended patient and verify the identity banner.",
                    "Enter systolic and diastolic pressure in mmHg, temperature in °C, pulse in bpm, respiratory rate in breaths/min and SpO₂ as a percentage. Enter measured weight in kg and height in cm when available.",
                    "Leave an unmeasured value blank. Enter the reason when a core observation is missing. Do not use zero as a substitute for an unrecorded measurement.",
                    "For a new observation, set Observation date & time when recording an earlier observation. Leave the field blank to use the current time.",
                    "Choose Save observations and wait for the saved confirmation. Check the observation history for the values and observed time.",
                    "To correct an existing record, choose its permitted correction action. Review the loaded values, enter a correction reason and choose Save audited correction.",
                    "Review the available correction history and before-values when investigating an amendment. Use Cancel correction to abandon an unsaved correction.",
                    "Use Observed from / to to review the relevant history period. The laboratory recording page displays history without the optional trend chart."
                ],
                "verify": "The correct patient history displays the measured values and observation time.",
                "recovery": "Review units, numeric input and the missing-observation reason. A correction needs an explanatory reason and the current revision. Confirm the patient before retrying. Change patient discards the unsaved form only after its confirmation.",
                "kind": "page",
                "concept": "A vital-sign observation belongs to a patient and an observation time. The unit beside each field determines how a measurement must be entered.",
                "before": [
                    "Have the patient identity and measured observations ready.",
                    "Check the displayed units before copying values from a device."
                ],
                "controls": [
                    {
                        "name": "Patient search",
                        "description": "Choose a search field and enter at least three characters. Select and confirm the patient. Change patient discards unsaved measurements after confirmation."
                    },
                    {
                        "name": "Systolic and diastolic (mmHg)",
                        "description": "Enter the two blood-pressure components in their separate fields."
                    },
                    {
                        "name": "Temperature (°C)",
                        "description": "Enter the measured temperature in degrees Celsius."
                    },
                    {
                        "name": "Pulse (bpm)",
                        "description": "Enter the measured pulse as a whole-number beats-per-minute value."
                    },
                    {
                        "name": "Respiratory rate (breaths/min)",
                        "description": "Enter the measured whole-number respiratory rate."
                    },
                    {
                        "name": "SpO₂ (%)",
                        "description": "Enter the measured whole-number oxygen saturation percentage."
                    },
                    {
                        "name": "Weight (kg) and height (cm)",
                        "description": "Use kilograms and centimetres, as labelled on the form."
                    },
                    {
                        "name": "Observation date & time",
                        "description": "For a new observation, enter the observation time or leave it blank to use the current time."
                    },
                    {
                        "name": "Reason for measurements not recorded",
                        "description": "Explain missing core observations. A blank value is retained as Not recorded."
                    },
                    {
                        "name": "Correction reason",
                        "description": "An audited correction requires a reason. Existing observation identity and revision are retained for the correction workflow."
                    },
                    {
                        "name": "Observed from / to and history",
                        "description": "Filter observations by observed date and review recorded values, correction options and available history."
                    }
                ],
                "example": {
                    "situation": "A nurse measures a patient before consultation.",
                    "action": "Select the patient, enter only the measurements actually taken and save the observation.",
                    "expected": "Verify the values and observation time in that patient history."
                },
                "after": "The saved observations become part of the selected patient history.",
                "related": [],
                "open": "Use Laboratory Operations Lifecycle → Customers Vital signs in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "sample-collection",
                "title": "Collect and review samples",
                "category": "Samples",
                "route": "/operations/laboratory/sample/collection",
                "purpose": "Identify the patient and requested services before collecting a specimen.",
                "steps": [
                    "Open Operations → Laboratory Operations Lifecycle → Sample Collection. Use Search samples and Load samples, or the date filters, to locate the visit. Compare patient, PatientId/BillID and requested tests, then choose Collect Samples.",
                    "Review Samples to collect. Each card proposes a specimen type and container and lists Tests sharing this physical sample. Check the test selections against the actual container.",
                    "If the plan says Unspecified container, resolve the test/container configuration with the authorized laboratory lead before a real clinical collection. Training screenshots illustrate the interface, not specimen compatibility or clinical approval.",
                    "If the plan is wrong, use Combine / split / change proposed containers and review the corrected grouping before continuing. Use proposed containers returns to the proposed plan.",
                    "Use Start collection when the procedure has begun but is not complete. Use Collect now only after the specimen has actually been collected. Wait for the resulting sample UID.",
                    "For a started specimen, use Complete collection on its existing Physical samples card. Use + Add another container only when a genuinely additional physical container is required.",
                    "Review each Physical samples card: UID, specimen/container, linked tests and collected status. Use Print sample barcode and match the label to the patient and container before handoff.",
                    "Review any collection-supply recording available for the specimen. Keep supply usage separate from specimen status.",
                    "Select Finish after the required collection groups are complete. Then open Sample Validation, locate the intended visit and choose Validate Sample. Scan or enter the saved UID/barcode in Scan or enter sample barcode / ID, then Find sample. Review the linked tests before Accept container or Reject container; a decision applies to the displayed container and all its linked tests. Use Finish validation after the intended review. Storage remains a separate action."
                ],
                "verify": "The visit shows the intended collected sample UID(s), with the correct tests attached and no unintended extra containers. The receiving team can locate the same identifiers.",
                "recovery": "If an action fails or times out, reopen Physical samples before creating another container. If the specimen is unsuitable, use the authorized rejection/recollection workflow and retain the original history. Do not mark a specimen accepted solely to unlock result entry.",
                "kind": "page",
                "concept": "Collection records specimen custody for a particular billed service. A patient can have several services with different specimen requirements.",
                "before": [
                    "Identify the patient and visit using at least the facility’s required identifiers.",
                    "Confirm the requested services and the payment/sample prerequisites enforced by the facility.",
                    "Prepare the correct containers and follow the facility’s specimen collection and infection-control procedures. This manual does not replace those clinical procedures."
                ],
                "controls": [
                    {
                        "name": "Collection list",
                        "description": "Locate the patient visit and service requiring a specimen."
                    },
                    {
                        "name": "Service collection action",
                        "description": "Record collection against the selected service."
                    },
                    {
                        "name": "Collection status",
                        "description": "Check which samples have already been recorded to avoid duplicate collection."
                    }
                ],
                "example": {
                    "situation": "The fictional visit NE-000005-MY has paid Bill #67 with two test requests.",
                    "action": "The live software exercise created S-20261106-52F1C902 with Start collection, completed it, then found and accepted that same UID in Physical Sample Validation. No real patient specimen was involved.",
                    "expected": "The UID remained linked to ascensions 170 and 171. The accepted-container view was displayed. Clinical container suitability and physical printer output still require separate validation."
                },
                "after": "The collection record identifies the service and feeds the sample review and processing stages.",
                "related": [
                    "sample-validation"
                ],
                "open": "Open Operations or Phelobotomy and choose Sample Collection. The laboratory collection entry opens the same collection workspace.",
                "pilot": {
                    "reviewedAt": "6 November 2026",
                    "status": "Live simulated start, collection and specimen acceptance verified",
                    "checked": [
                        "Located paid Bill #67 in Sample Collection and opened Collect Samples.",
                        "Used Start collection to create S-20261106-52F1C902, then Complete collection. Confirmed Collected and linked ascensions 170 and 171.",
                        "Opened Sample Validation → Validate Sample, found the same UID and used Accept container. Verified that it appeared under accepted containers."
                    ],
                    "pending": [
                        "Clinical suitability, actual container configuration, physical barcode printer output, rejection/recollection and storage were not clinically validated.",
                        "The training catalogue proposed Unspecified container. That display is a configuration gap to review before clinical use, not a recommended collection plan."
                    ],
                    "exercise": "With an approved fictional visit, identify the intended tests and containers. Record collection once, note each sample UID and demonstrate that the linked tests and subsequent reception use those same samples.",
                    "fields": [
                        {
                            "name": "Tests sharing this physical sample",
                            "rule": "Keep only tests actually sharing the same specimen/container selected. At least one is required.",
                            "mistake": "Selecting every test can link an incompatible test to the wrong physical sample."
                        },
                        {
                            "name": "Start collection / Collect now",
                            "rule": "Start collection creates an in-progress specimen; Collect now records completed collection.",
                            "mistake": "Do not record collected before the specimen is physically obtained."
                        },
                        {
                            "name": "Combine / split / change proposed containers",
                            "rule": "Use only when the proposed specimen plan needs correction and you are authorized.",
                            "mistake": "Do not create a duplicate container to correct a recoverable planning issue."
                        },
                        {
                            "name": "Physical samples",
                            "rule": "Review sample UID, status, specimen/container type and linked tests.",
                            "mistake": "A printed barcode alone does not prove reception or acceptance."
                        },
                        {
                            "name": "Complete collection",
                            "rule": "Completes an existing collection_started sample.",
                            "mistake": "Do not create a second sample for an already started container."
                        }
                    ],
                    "screenshots": [
                        {
                            "file": "sample-plan.jpg",
                            "caption": "The actual training collection plan. Unspecified container indicates setup to review; this screenshot is not a clinical specimen recommendation.",
                            "callouts": []
                        },
                        {
                            "file": "sample-collected.jpg",
                            "caption": "The same simulated physical sample has Collected status, a UID/barcode and its linked tests. Collection does not itself mean specimen acceptance.",
                            "callouts": []
                        },
                        {
                            "file": "sample-accepted.jpg",
                            "caption": "Sample Validation recorded acceptance of the same UID. Storage is a separate available task.",
                            "callouts": []
                        }
                    ]
                }
            },
            {
                "slug": "sample-validation",
                "title": "Validate collected samples",
                "category": "Samples",
                "route": "/operations/laboratory/sample/validation",
                "purpose": "Review specimen suitability before processing.",
                "steps": [
                    "Open validate collected samples using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Filter the pending samples and identify the patient and service.",
                    "Review specimen details before selecting individual samples or the header selection checkbox.",
                    "Apply the available validation action only to the reviewed samples.",
                    "Selected samples have the intended validation status."
                ],
                "verify": "Selected samples have the intended validation status.",
                "recovery": "Review rejected or unsuitable specimens through the existing sample review workflow.",
                "kind": "page",
                "concept": "Sample validation confirms whether the collected specimen can proceed. It is a different review from approving the final laboratory result.",
                "before": [
                    "Review patient identity and specimen details.",
                    "Confirm your role can perform sample validation."
                ],
                "controls": [
                    {
                        "name": "Row selection",
                        "description": "Select only specimens you have reviewed."
                    },
                    {
                        "name": "Header checkbox",
                        "description": "Select the current list deliberately after checking its contents."
                    },
                    {
                        "name": "Validation action",
                        "description": "Apply the available review action and inspect the resulting status."
                    }
                ],
                "example": {
                    "situation": "Three specimens appear in the list, but only two have been reviewed.",
                    "action": "Select the two reviewed rows individually.",
                    "expected": "Confirm that only those specimens receive the intended validation status."
                },
                "after": "The specimen status controls its progression through the laboratory workflow.",
                "related": [
                    "sample-collection"
                ],
                "open": "Use Laboratory Operations Lifecycle → Sample Validation in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "result-entry",
                "title": "Enter and review results",
                "category": "Results",
                "route": "/operations/laboratory/completed",
                "purpose": "Work on the correct patient visit and test revision.",
                "steps": [
                    "Locate the patient and test by Patient ID, Billing ID or Ascension ID. Laboratory Workbench shows the current eligibility and any payment, sample or QC blockers. Do not assume an older stage-list row proves that a processing action is required.",
                    "Where processing is required, use Start and Stop in Processing stage for the actual test work, then Proceed to Result Entry or Completed stage. If the server reports Processing is already completed or bypassed, review the configured workflow and use the eligible result-entry stage; do not change settings to force processing. In Completed stage choose Enter result and verify the patient, test, units and reference information.",
                    "Enter every required value in the actual test form. Review decimal placement, units, flags and comments. Use fictional values only on the designated training record.",
                    "Use the save action offered by that test form once. Wait for confirmation, reopen the service and compare every saved value with the source worksheet. A blocked unpaid service must remain blocked when its settings require payment.",
                    "For validation, open the current results and select Reload latest results after any stale-revision warning. Review patient, service, values, comments and any revalidation notice.",
                    "Confirm I have reviewed the patient details and current results. If Your secure PIN appears, enter your own PIN and use Verify PIN.",
                    "Select Record approval, or the permitted bulk action only after reviewing each included result. Check whether further validators are required before final release.",
                    "If a result changes after approval, reopen the latest revision and repeat the required review. Previous approvals do not apply to the changed revision.",
                    "Print or deliver only when the configured validation, payment, critical-value and release requirements are satisfied. Review the patient and final version in the preview."
                ],
                "verify": "Reopened values match the saved worksheet. Each approval names the signed-in validator and current revision. A changed result requires the applicable new approvals, and a service blocked by settings cannot be saved, validated or printed through an alternative path.",
                "recovery": "For “The result has changed”, reload and review the latest revision before approving. For a payment, sample or QC block, resolve the underlying prerequisite through the responsible team. If save returns an uncertain error, reopen the current result before resubmitting.",
                "kind": "page",
                "concept": "Results belong to a specific service and revision. Editing a previously approved result can require validation again. Payment and application settings still control whether entry is allowed.",
                "before": [
                    "Confirm patient, visit, test and sample identity. The specimen must satisfy the configured reception/acceptance checks.",
                    "Confirm paid, part-paid or unpaid-service eligibility under the application settings. Do not change the settings merely to complete training.",
                    "Complete any required QC and use your own result-entry or validation permission."
                ],
                "controls": [
                    {
                        "name": "Processing list",
                        "description": "Find the service ready for result work."
                    },
                    {
                        "name": "Result fields",
                        "description": "Review parameter names, units, reference information and calculated values."
                    },
                    {
                        "name": "Save action",
                        "description": "Record the results and wait for the returned status before leaving."
                    }
                ],
                "example": {
                    "situation": "A fictional test result is saved and approved, then an authorized correction changes a value.",
                    "action": "Reopen the result, inspect the changed value and revalidation notice, and have the required validators approve the current revision.",
                    "expected": "The original approval remains historical evidence and does not release the new revision. This lifecycle still requires a successful live pilot."
                },
                "after": "Saving records the result revision. Final release still follows validation and application settings.",
                "related": [
                    "result-validation",
                    "result-delivery"
                ],
                "open": "Open Operations → Laboratory Operations Lifecycle → Completed stage, then Enter result for the intended test. Processing stage is required only when the facility workflow has not configured it to be bypassed.",
                "pilot": {
                    "reviewedAt": "5 November 2026",
                    "status": "Source reviewed — live save and validation pending",
                    "checked": [
                        "Reviewed current-revision validation, payment warnings, review confirmation and conditional secure-PIN controls."
                    ],
                    "pending": [
                        "The training visit has not reached a saved bill and accepted specimen, so live result save, revision invalidation and final release remain unverified."
                    ],
                    "exercise": "Use a fictional test visit with authorized training values. Save a result, reopen it, have an authorized validator review the current revision, then change a value through the permitted correction workflow and demonstrate that earlier approval does not validate the new revision.",
                    "fields": [
                        {
                            "name": "Result fields",
                            "rule": "Use the test’s configured fields, units, reference ranges and required format.",
                            "mistake": "A sample value from a manual is not a patient result."
                        },
                        {
                            "name": "Reload latest results",
                            "rule": "Refresh the current revision before approval after another edit or stale-result warning.",
                            "mistake": "Do not approve an older screen after the result has changed."
                        },
                        {
                            "name": "Review confirmation",
                            "rule": "Select I have reviewed the patient details and current results. only after checking them.",
                            "mistake": "The checkbox is an attestation, not a way around review."
                        },
                        {
                            "name": "Your secure PIN / Verify PIN",
                            "rule": "Shown where the facility requires secure validation. Enter your own PIN only in the software.",
                            "mistake": "Never use another validator’s PIN or include it in training screenshots."
                        },
                        {
                            "name": "Record approval",
                            "rule": "Records your approval of the current revision; final release still needs the configured validators.",
                            "mistake": "Saving and approving are different actions; one approval may not release the result."
                        }
                    ],
                    "screenshots": []
                }
            },
            {
                "slug": "result-validation",
                "title": "Validate the latest result revision",
                "category": "Results",
                "route": "/operations/laboratory/validation",
                "purpose": "Review current values before recording approval.",
                "steps": [
                    "Open validate the latest result revision using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Open a pending result and review its patient, test and current values.",
                    "If the result changed, reload the latest results and review the replacement revision.",
                    "Record your validation through the available approval action.",
                    "The approval belongs to the current revision and the signed-in validator."
                ],
                "verify": "The approval belongs to the current revision and the signed-in validator.",
                "recovery": "A changed result requires another review. Required validators and release settings determine final release.",
                "kind": "page",
                "concept": "An approval applies to the revision the validator reviewed. A later edit makes the old approval insufficient for the changed result.",
                "before": [
                    "Load the latest result values.",
                    "Confirm you are an authorized validator for the service."
                ],
                "controls": [
                    {
                        "name": "Pending results",
                        "description": "Locate results awaiting review."
                    },
                    {
                        "name": "Reload latest results",
                        "description": "Refresh revisions when the displayed result has changed."
                    },
                    {
                        "name": "Validation action",
                        "description": "Record approval as the signed-in validator after reviewing the current values."
                    }
                ],
                "example": {
                    "situation": "Another user updates a result while its validation window is open.",
                    "action": "Reload the latest results and review the changed values.",
                    "expected": "Validate the current revision and check its approval state."
                },
                "after": "The approval is attached to the reviewed revision. Release depends on the required validators and configured rules.",
                "related": [
                    "result-entry",
                    "result-delivery"
                ],
                "open": "Use Laboratory Operations Lifecycle → Validation stage in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "result-delivery",
                "title": "Deliver released results",
                "category": "Results",
                "route": "/operations/laboratory/undelivered",
                "purpose": "Track delivery of eligible reports.",
                "steps": [
                    "Open deliver released results using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Search the undelivered list and confirm the patient and visit.",
                    "Review the released report and available delivery actions.",
                    "Use the authorized delivery action and check the updated record.",
                    "The delivery record matches the intended report and recipient."
                ],
                "verify": "The delivery record matches the intended report and recipient.",
                "recovery": "Check release, payment and delivery permissions when an action is unavailable.",
                "kind": "page",
                "concept": "A result can be complete without having been delivered. Delivery tracking records the report handoff after the relevant release checks.",
                "before": [
                    "Identify the correct patient and visit.",
                    "Check report release and delivery eligibility."
                ],
                "controls": [
                    {
                        "name": "Undelivered list",
                        "description": "Find reports that still need a delivery action."
                    },
                    {
                        "name": "Report review",
                        "description": "Confirm the report identity and released content."
                    },
                    {
                        "name": "Delivery action",
                        "description": "Use the permitted action and check the delivery record afterwards."
                    }
                ],
                "example": {
                    "situation": "A patient returns to collect an available report.",
                    "action": "Find their visit, review the report and confirm the intended recipient.",
                    "expected": "Record the permitted delivery action and check the updated list."
                },
                "after": "The delivery history provides evidence of the report handoff.",
                "related": [
                    "result-entry",
                    "result-validation"
                ],
                "open": "Use Records & Auditing → Laboratory Result Not Delivered in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "quality-control",
                "title": "Create and review a QC session",
                "category": "Quality",
                "route": "/operations/laboratory/quality-control",
                "purpose": "Record control measurements and review quality outcomes.",
                "steps": [
                    "From Quality & Performance > Quality Control, choose New QC session. Wait for New session to finish loading. Select Device first, then its Control material. Create QC session remains disabled while that selection is incomplete. After successful creation, use QC sessions to review and record results.",
                    "Open Quality control and choose New QC session or the New session tab.",
                    "Select the device. Wait for the control materials belonging to that device to load.",
                    "Select the intended control material and lot. If no devices or materials exist, configure them through Devices or Control materials with an authorized user.",
                    "Continue to create one session. Wait for the session reference and recording page. If creation succeeded without returning its reference, inspect QC sessions before creating another.",
                    "Record the control parameter readings and review the session measurements and charts.",
                    "To edit defaults, open Setup. Administrators and managers can enter a positive Warning limit (SD) and a larger Action limit (SD), up to 100 SD.",
                    "Choose Save QC defaults and verify the saved confirmation. These defaults apply when adding new control parameters. Each existing material retains its saved limits.",
                    "When a settings revision conflicts, reload settings, review the current defaults and reapply the intended edit. Review rules and notification preferences are separate from these defaults."
                ],
                "verify": "The session and its measurements appear in the QC history.",
                "recovery": "Use Reload lists for device or control loading failures. If the session was created but its reference is missing, find it under QC sessions before retrying. For Setup, check your administrator/manager role, positive limits, action limit greater than warning limit, and the current revision. Notification preferences are not configured by the QC defaults form.",
                "kind": "page",
                "concept": "A QC session links a device, a control material and recorded measurements. Control limits support review of instrument performance before relying on patient measurements.",
                "before": [
                    "A device must exist in Devices.",
                    "The device needs an appropriate control material and parameter setup."
                ],
                "controls": [
                    {
                        "name": "New QC session",
                        "description": "Start session creation from the workspace header or New session tab."
                    },
                    {
                        "name": "Device and control material",
                        "description": "Choose the device first, then one of its loaded control materials."
                    },
                    {
                        "name": "QC sessions",
                        "description": "Find recorded sessions and review measurements and charts."
                    },
                    {
                        "name": "Setup",
                        "description": "Authorized administrators and managers edit warning and action defaults for new control parameters."
                    },
                    {
                        "name": "Workspace tabs",
                        "description": "Overview, QC sessions, New session, Control materials, Devices and Setup separate monitoring, recording and configuration tasks."
                    }
                ],
                "example": {
                    "situation": "The selected device has no available control material.",
                    "action": "Open Control materials and have an authorized user configure the correct lot and parameters.",
                    "expected": "Return to New session, select the material and create one session before recording readings."
                },
                "after": "Successful creation opens the reading workflow. Recorded readings can be reviewed through QC sessions.",
                "related": [
                    "critical-results",
                    "turnaround"
                ],
                "open": "Use Quality & Performance → Quality Control in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "imaging",
                "title": "Work through imaging cases",
                "category": "Imaging",
                "route": "/operations/imaging/ultrasound",
                "purpose": "Review waiting imaging cases and record authorized reports.",
                "steps": [
                    "Open work through imaging cases using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Locate the patient in the waiting list and confirm the requested examination.",
                    "Open the case and review the available report fields and templates.",
                    "Complete the report using the permitted save or completion action.",
                    "The correct case appears with its updated reporting status."
                ],
                "verify": "The correct case appears with its updated reporting status.",
                "recovery": "Review access and examination status before retrying a blocked action.",
                "kind": "page",
                "concept": "The imaging waiting list contains examinations that need reporting. The selected examination determines the patient, requested service and reporting context.",
                "before": [
                    "Confirm the examination and patient identity.",
                    "Use a role with access to the selected case."
                ],
                "controls": [
                    {
                        "name": "Waiting List",
                        "description": "Find examinations awaiting reporting."
                    },
                    {
                        "name": "Report fields and templates",
                        "description": "Review the selected examination before using a template or entering findings."
                    },
                    {
                        "name": "Processed List",
                        "description": "Review the examination after the permitted completion action."
                    }
                ],
                "example": {
                    "situation": "Two patients have similar names in the waiting list.",
                    "action": "Match the patient identifier and requested examination before opening the report.",
                    "expected": "Complete the intended examination and verify its updated status."
                },
                "after": "The case follows its configured reporting and completion workflow.",
                "related": [
                    "imaging-templates"
                ],
                "open": "Use Imaging → Waiting List in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "lab-stock",
                "title": "Request, receive and consume laboratory stock",
                "category": "Department stock",
                "route": "/operations/laboratory/requisitions",
                "purpose": "Track stock from the storekeeper to laboratory usage.",
                "steps": [
                    "Open this department’s stock workspace using Open task page. Confirm facility, branch and department. Choose Requisitions & stock. Requesting, receiving and consuming require their own existing permissions; a head role is not required when a staff member has the relevant access.",
                    "In Build a requisition, search Inventory item by name or SKU, select the correct item and unit, enter Requested quantity and optionally Request reason. Choose Add item or press Enter. The added line appears in Requisition basket and focus returns to item selection, with quantity reset to 1.",
                    "Continue adding items. Adding the same item again combines its quantity into one line. Edit the basket quantity or reason, or use Remove to correct a line. Review all pages of the basket, then Send requisition once. All basket items are submitted, including those on other pages. Wait for Requisition sent to stores for review.",
                    "Find the saved request in Requisitions and departmental stock. Request status can narrow Awaiting approval, Ready to issue, Awaiting receipt, Delivery shortages, Available to consume or Rejected. Filter department requests finds the item or request. Stores reviews the request, approves its quantity and issues the approved stock; Requested and Approved may differ.",
                    "After issue, filter Awaiting receipt. On the correct item choose Confirm receipt. Enter Quantity physically received, review the unit and Confirm action. A lower receipt requires an explanation and automatically opens a Stock receipt discrepancy incident. Record physical truth rather than forcing Received to equal Issued. Unreceived stock cannot be consumed.",
                    "After receipt, use Available to consume and choose Consume for the intended item. Enter the quantity actually used; it must fit the department’s available balance. A reason is optional for normal consumption. Confirm once and verify the new Available quantity. Use the separate Record wastage, Record loss / theft or Return to stores action when appropriate; those actions require explanations.",
                    "For a Receipt shortage, review the automatically created incident in Incident Reporting and provide the request reference to stores. Stores investigates and uses its authorized return-unreceived or transit-loss action. Stock reconciliation and incident investigation are separate tasks; an unreceived balance reaching zero does not automatically close the incident.",
                    "Open Movement history. Match the item and request to its approval, issue, receipt, consumption and any return/loss events, including quantity, date and staff. Use Department analytics to review balances and movements. Refresh before relying on a balance changed by another user.",
                    "Verify the company/custody relationship: issue and receipt move custody; actual consumption, wastage and loss reduce company stock. For example, 100 Pieces with 8 received in the laboratory and 2 consumed leaves Stores 92, laboratory Available 6 and company stock 98. Investigate differences instead of entering balancing usage without evidence."
                ],
                "verify": "The request history and remaining department quantity reflect the recorded movement.",
                "recovery": "A receipt shortage remains visible for resolution. Record investigation evidence through incident reporting. Loss and wastage require a reason.",
                "kind": "page",
                "concept": "A requisition moves stock custody from stores to the laboratory. Receiving stock makes it available to the department. Consumption records actual usage against that received balance.",
                "before": [
                    "You need the relevant request, receive or consume permission.",
                    "Check item units and the quantities physically needed or received."
                ],
                "controls": [
                    {
                        "name": "Inventory item and Add item",
                        "description": "Search an item, enter a whole quantity and add it to the basket. Focus returns to the item picker."
                    },
                    {
                        "name": "Requisition basket",
                        "description": "Review quantities, remove mistakes and send all basket items together. Duplicate items combine."
                    },
                    {
                        "name": "Confirm receipt",
                        "description": "Enter the actual quantity received after stores issue the request."
                    },
                    {
                        "name": "Consume / Record wastage / Record loss",
                        "description": "Choose the movement matching what actually happened. Wastage and loss require reasons."
                    },
                    {
                        "name": "Finding the next stage",
                        "description": "Request status offers Awaiting approval, Ready to issue, Awaiting receipt, Delivery shortages, Available to consume and Rejected. Filter department requests narrows by item, request or status. Department analytics and Movement history provide separate views."
                    },
                    {
                        "name": "Receipt shortage and incident",
                        "description": "Issued, Received and Unreceived are separate quantities. A short receipt opens a reported incident containing the item, request, difference, department and receiver note. Recording a stores reconciliation does not automatically complete the incident investigation."
                    }
                ],
                "example": {
                    "situation": "A department requests 10 Pieces; the storekeeper approves and issues 8 Pieces.",
                    "action": "The department confirms physical receipt of 8, then records normal consumption of 2 without a mandatory reason.",
                    "expected": "The request shows approved 8, issued 8 and received 8. Department stock available to consume is 6 Pieces. Movement history retains all four actions."
                },
                "after": "Request, approval, issue, receipt and usage remain traceable in the department movement history.",
                "related": [
                    "imaging-stock"
                ],
                "open": "Use Laboratory → Stock requisitions in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "imaging-stock",
                "title": "Request, receive and consume imaging stock",
                "category": "Department stock",
                "route": "/operations/imaging/ultrasound/requisitions",
                "purpose": "Track items held and used by imaging.",
                "steps": [
                    "Open this department’s stock workspace using Open task page. Confirm facility, branch and department. Choose Requisitions & stock. Requesting, receiving and consuming require their own existing permissions; a head role is not required when a staff member has the relevant access.",
                    "In Build a requisition, search Inventory item by name or SKU, select the correct item and unit, enter Requested quantity and optionally Request reason. Choose Add item or press Enter. The added line appears in Requisition basket and focus returns to item selection, with quantity reset to 1.",
                    "Continue adding items. Adding the same item again combines its quantity into one line. Edit the basket quantity or reason, or use Remove to correct a line. Review all pages of the basket, then Send requisition once. All basket items are submitted, including those on other pages. Wait for Requisition sent to stores for review.",
                    "Find the saved request in Requisitions and departmental stock. Request status can narrow Awaiting approval, Ready to issue, Awaiting receipt, Delivery shortages, Available to consume or Rejected. Filter department requests finds the item or request. Stores reviews the request, approves its quantity and issues the approved stock; Requested and Approved may differ.",
                    "After issue, filter Awaiting receipt. On the correct item choose Confirm receipt. Enter Quantity physically received, review the unit and Confirm action. A lower receipt requires an explanation and automatically opens a Stock receipt discrepancy incident. Record physical truth rather than forcing Received to equal Issued. Unreceived stock cannot be consumed.",
                    "After receipt, use Available to consume and choose Consume for the intended item. Enter the quantity actually used; it must fit the department’s available balance. A reason is optional for normal consumption. Confirm once and verify the new Available quantity. Use the separate Record wastage, Record loss / theft or Return to stores action when appropriate; those actions require explanations.",
                    "For a Receipt shortage, review the automatically created incident in Incident Reporting and provide the request reference to stores. Stores investigates and uses its authorized return-unreceived or transit-loss action. Stock reconciliation and incident investigation are separate tasks; an unreceived balance reaching zero does not automatically close the incident.",
                    "Open Movement history. Match the item and request to its approval, issue, receipt, consumption and any return/loss events, including quantity, date and staff. Use Department analytics to review balances and movements. Refresh before relying on a balance changed by another user.",
                    "Verify the company/custody relationship: issue and receipt move custody; actual consumption, wastage and loss reduce company stock. For example, 100 Pieces with 8 received in the laboratory and 2 consumed leaves Stores 92, laboratory Available 6 and company stock 98. Investigate differences instead of entering balancing usage without evidence."
                ],
                "verify": "The imaging stock balance and movement history match physical custody.",
                "recovery": "Ask an administrator to review request, receipt or consumption access if the action is unavailable.",
                "kind": "page",
                "concept": "Imaging has its own custody and consumption history. An issue from stores is followed by a physical receipt confirmation before departmental usage.",
                "before": [
                    "Check imaging stock permissions and item units.",
                    "Count the physical delivery before confirming receipt."
                ],
                "controls": [
                    {
                        "name": "Add item",
                        "description": "Build a multi-item requisition without submitting one request at a time."
                    },
                    {
                        "name": "Approved and issued quantities",
                        "description": "Review what stores approved and sent."
                    },
                    {
                        "name": "Confirm receipt",
                        "description": "Record the quantity actually delivered to imaging."
                    },
                    {
                        "name": "Movement actions",
                        "description": "Record consumption, return, wastage or loss against the available imaging balance."
                    },
                    {
                        "name": "Finding the next stage",
                        "description": "Request status offers Awaiting approval, Ready to issue, Awaiting receipt, Delivery shortages, Available to consume and Rejected. Filter department requests narrows by item, request or status. Department analytics and Movement history provide separate views."
                    },
                    {
                        "name": "Receipt shortage and incident",
                        "description": "Issued, Received and Unreceived are separate quantities. A short receipt opens a reported incident containing the item, request, difference, department and receiver note. Recording a stores reconciliation does not automatically complete the incident investigation."
                    }
                ],
                "example": {
                    "situation": "Imaging requests 4 Pieces. Stores approves and issues 6; imaging physically receives 5.",
                    "action": "Approve 6 with an adjustment explanation. At receipt enter 5 and explain the short delivery. Record normal consumption of 1. Stores investigates the missing Piece and, when confirmed retained at stores, uses Return unreceived stock to stores for 1 with evidence.",
                    "expected": "The request retains requested 4, approved/issued 6 and received 5. Imaging has 4 Pieces available after consumption, Unreceived becomes zero after the stores return, and the reported incident remains available for its separate investigation workflow."
                },
                "after": "Imaging custody, remaining quantities and movements can be reviewed independently of laboratory stock.",
                "related": [
                    "lab-stock"
                ],
                "open": "Use Imaging → Stock requisitions in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "workbench",
                "title": "Use the laboratory workbench",
                "category": "Results",
                "route": "/operations/laboratory/workbench",
                "kind": "page",
                "purpose": "The workbench combines assigned laboratory work, processing status, planning and material use. Assignment, permission to read, and permission to edit are distinct controls.",
                "concept": "The workbench combines assigned laboratory work, processing status, planning and material use. Assignment, permission to read, and permission to edit are distinct controls.",
                "open": "Open Use the laboratory workbench from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "View and search",
                        "description": "Select the available work view, search for the intended service and decide whether completed work should be included."
                    },
                    {
                        "name": "Service stage",
                        "description": "Review whether a service is processing, ready for results, awaiting validation or finalized."
                    },
                    {
                        "name": "Assignment and planning",
                        "description": "Use the permitted record controls to review responsible staff, devices and timing."
                    },
                    {
                        "name": "Materials",
                        "description": "Review the current material plan and available quantities before recording material use."
                    },
                    {
                        "name": "Daily Laboratory Request alternative",
                        "description": "This separate worklist starts with Today and Pending. Choose the relevant date period and Pending, Partial or Paid, then Load or press Enter. Filter by Patient Name, Patient ID, Billing ID or Laboratory Test. Open Selected remains disabled until rows are selected."
                    }
                ],
                "steps": [
                    "Open Laboratory Workspace > Laboratory Workbench. Choose All open work, Assigned to me, Unassigned, Overdue by configured target or Urgent / STAT. Enter an accession reference, patient number, name or test and choose Search. Include finalized results only when reviewing completed work.",
                    "For the intended row, open Manage / history. Review Assigned staff, Priority, Analyzer used for QC clearance and the current deadline. Use the test default target or turn it off to enter an override deadline. Review Work history before any authorized Save assignment or Escalate action.",
                    "Search the workbench for the patient or service reference.",
                    "Confirm the patient, test and displayed stage. Read a blocked reason before opening result work.",
                    "Review the assigned staff, device and timing information. Use the available assignment or planning action only when authorized.",
                    "When recording materials, load the current plan for the selected service and check the intended quantities.",
                    "Review any saved change in the service history. Open result entry only when workflow and payment checks permit it."
                ],
                "after": "The selected service has the intended assignment, planning or material record, and its stage matches the completed work.",
                "verify": "The selected service has the intended assignment, planning or material record, and its stage matches the completed work.",
                "recovery": "Refresh the service after a stale plan or changed record. Restricted staff must use their assigned scope. A supervisor must review access rather than bypassing it. An empty Today/Pending worklist does not mean the patient has no historical records. Use a specific identifier and a narrow date period. All Time can load a very large legacy worklist. If the page becomes unresponsive, reopen the workspace and narrow the query.",
                "example": {
                    "situation": "A scientist sees a service blocked from result entry.",
                    "action": "Review its stage, assignment and blocked reason before changing anything.",
                    "expected": "The missing prerequisite is resolved through its own authorized workflow."
                },
                "related": [
                    "result-entry",
                    "result-validation",
                    "result-delivery",
                    "outsourcing"
                ]
            },
            {
                "slug": "archives",
                "title": "Find a previous patient result",
                "category": "Records",
                "route": "/operations/laboratory/patientarchives",
                "kind": "page",
                "purpose": "Patient archives locate historical cases and their original reports. Search criteria and dates must identify the intended patient and billing record.",
                "concept": "Patient archives locate historical cases and their original reports. Search criteria and dates must identify the intended patient and billing record.",
                "open": "Open Find a previous patient result from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Search field and value",
                        "description": "Choose the identifier field and enter its value."
                    },
                    {
                        "name": "From and to dates",
                        "description": "An end date requires a start date. The end must be on or after the start."
                    },
                    {
                        "name": "Apply, clear and refresh",
                        "description": "Apply draft filters, reset the search or reload the current results."
                    },
                    {
                        "name": "View result",
                        "description": "Open the selected original report in a separate window."
                    }
                ],
                "steps": [
                    "Choose a patient or billing identifier as appropriate for the archive view.",
                    "Enter the value and, if needed, a valid date range. Apply the filters.",
                    "Review the patient, test, bill and validation information in the matching rows.",
                    "Use the selected record view action to open the original report. Confirm the report identity again before printing or sharing.",
                    "Use paging to inspect additional matches. Clear filters when beginning a different search."
                ],
                "after": "The opened report belongs to the selected patient, service and historical visit.",
                "verify": "The opened report belongs to the selected patient, service and historical visit.",
                "recovery": "Allow the report window to open. Check filters when no rows match. A loading failure must be retried before interpreting the archive as empty.",
                "example": {
                    "situation": "A patient needs an older result rather than today’s report.",
                    "action": "Search the relevant identity and service dates, then open the matching record.",
                    "expected": "The report shows the intended historical visit."
                },
                "related": []
            },
            {
                "slug": "critical-results",
                "title": "Handle a critical result event",
                "category": "Quality",
                "route": "/operations/laboratory/criticalvaluesAlert",
                "kind": "page",
                "purpose": "A critical event requires documented review and communication. Acknowledgement, a successful clinician communication and release clearance are separate actions.",
                "concept": "A critical event requires documented review and communication. Acknowledgement, a successful clinician communication and release clearance are separate actions.",
                "open": "Open Handle a critical result event from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Event list",
                        "description": "Select the current critical event and review its evidence and history."
                    },
                    {
                        "name": "Next action",
                        "description": "Choose acknowledgement, clinician communication or resolution from actions available to your role."
                    },
                    {
                        "name": "Communication details",
                        "description": "Record recipient, method, outcome or read-back, and whether the recipient was actually reached."
                    },
                    {
                        "name": "Evidence / reason",
                        "description": "Supply the evidence supporting the recorded action."
                    }
                ],
                "steps": [
                    "Open the critical event and verify the patient, test, value and current status.",
                    "Review previous acknowledgements and communication attempts.",
                    "Use Acknowledge finding when appropriate and record the required evidence.",
                    "For clinician communication, enter the recipient, method and outcome. Confirm successful contact and read-back only when it occurred.",
                    "Use the available resolve or clearance action with supporting evidence when its prerequisites are satisfied.",
                    "Reopen the event history and verify the action and any remaining hold."
                ],
                "after": "The event history records what occurred, who acted and whether communication and clearance requirements remain.",
                "verify": "The event history records what occurred, who acted and whether communication and clearance requirements remain.",
                "recovery": "An unsuccessful contact attempt does not satisfy a successful communication requirement. Review hold and authority requirements before requesting clearance.",
                "example": {
                    "situation": "A clinician could not be reached on the first attempt.",
                    "action": "Record the unsuccessful attempt accurately, then record the later successful contact with its evidence.",
                    "expected": "The history distinguishes failed contact from confirmed communication."
                },
                "related": [
                    "quality-control",
                    "turnaround"
                ]
            },
            {
                "slug": "outsourcing",
                "title": "Dispatch an outsourced test and receive its report",
                "category": "Results",
                "route": "/operations/laboratory/outsourced-cases",
                "kind": "page",
                "purpose": "An outsourced case tracks receiving facility, dispatch, external references and returned source reports. Attaching an external PDF does not itself validate or release the internal result.",
                "concept": "An outsourced case tracks receiving facility, dispatch, external references and returned source reports. Attaching an external PDF does not itself validate or release the internal result.",
                "open": "Open Dispatch an outsourced test and receive its report from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "External laboratory request",
                        "description": "Create or view the request linked to the case."
                    },
                    {
                        "name": "Partner and dispatch",
                        "description": "Review receiving organization, contact, dispatch date, due date and agreed cost."
                    },
                    {
                        "name": "Returned reports",
                        "description": "Attach a PDF up to 2 MB and retrieve recorded source reports."
                    },
                    {
                        "name": "Next action and handover evidence",
                        "description": "Use only available case transitions and record the dispatch or external reference and supporting notes."
                    }
                ],
                "steps": [
                    "Find the outsourced case and confirm the patient and requested service.",
                    "Review the assigned receiving organization and its contact information.",
                    "Open Create / view external laboratory request and verify the request before sending it with the sample.",
                    "Record the available dispatch transition, external reference and handover evidence.",
                    "When the report returns, attach the correct PDF within the 2 MB limit. Review its patient and service identity.",
                    "Complete internal result review and validation through the existing laboratory workflow.",
                    "Use the available completion transition only after result validation and release clearance. Review the case history."
                ],
                "after": "The case history explains dispatch, returned report evidence and the current completion state.",
                "verify": "The case history explains dispatch, returned report evidence and the current completion state.",
                "recovery": "Historical legacy-pending cases may lack detailed dispatch evidence. Review the actual status without inventing dates. Supplier payment is handled separately by finance.",
                "example": {
                    "situation": "A partner facility returns a PDF for a dispatched test.",
                    "action": "Attach it to the matching case, then perform internal result entry and validation as required.",
                    "expected": "The source report is retained and the internal release controls are completed."
                },
                "related": [
                    "result-entry",
                    "result-validation",
                    "result-delivery",
                    "workbench"
                ]
            },
            {
                "slug": "specimen-storage",
                "title": "Store, retrieve and retain a specimen",
                "category": "Samples",
                "route": "/operations/phelobotomy/specimen-storage",
                "kind": "page",
                "purpose": "Specimen lifecycle records track physical location, remaining material, retention and documented disposal. The barcode identifies the physical specimen being moved.",
                "concept": "Specimen lifecycle records track physical location, remaining material, retention and documented disposal. The barcode identifies the physical specimen being moved.",
                "open": "Open Store, retrieve and retain a specimen from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Worklist and specimen detail",
                        "description": "Find the specimen and review its current state and history."
                    },
                    {
                        "name": "Storage position",
                        "description": "Choose an available position when storing a specimen."
                    },
                    {
                        "name": "Lifecycle actions",
                        "description": "Use only the available store, retrieve, aliquot or disposal actions for the current specimen state."
                    },
                    {
                        "name": "Retention and label",
                        "description": "Review retention eligibility and print the specimen label where needed."
                    }
                ],
                "steps": [
                    "Locate the specimen by its identifier and confirm the patient and service.",
                    "Open its detail and review current storage state, remaining quantity and retention date.",
                    "Select the available lifecycle action. For storage, choose an available position and enter the required movement details.",
                    "Review parent and aliquot identities before handling split material.",
                    "Save the action and inspect the updated event history and position.",
                    "For disposal, review retention and required evidence before confirming documented disposal. Early disposal requires the permitted override.",
                    "Print and verify the label when the physical container needs identification."
                ],
                "after": "The specimen identity, lifecycle state, storage position and history match the physical material.",
                "verify": "The specimen identity, lifecycle state, storage position and history match the physical material.",
                "recovery": "A full storage position cannot accept another specimen. Retention restrictions and override authority must be resolved before early disposal. Allow the label print window if blocked.",
                "example": {
                    "situation": "A stored specimen is needed for additional authorized work.",
                    "action": "Find its barcode, review the recorded position and use the permitted retrieval action.",
                    "expected": "The history records retrieval of the intended specimen."
                },
                "related": [
                    "sample-collection",
                    "sample-validation",
                    "rejected-specimens",
                    "review-requests"
                ]
            },
            {
                "slug": "rejected-specimens",
                "title": "Review and recollect a rejected specimen",
                "category": "Samples",
                "route": "/operations/phelobotomy/rejectedsamples",
                "kind": "page",
                "purpose": "Rejected specimens require a traceable decision about independent review or recollection. The replacement remains linked to the original specimen.",
                "concept": "Rejected specimens require a traceable decision about independent review or recollection. The replacement remains linked to the original specimen.",
                "open": "Open Review and recollect a rejected specimen from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Rejected worklist",
                        "description": "Find the rejected specimen and review its rejection history."
                    },
                    {
                        "name": "Independent review",
                        "description": "Request review with a reason and inspect the decision workflow."
                    },
                    {
                        "name": "Recollection",
                        "description": "Use the permitted recollection action when the rejection is upheld or recollection is required."
                    },
                    {
                        "name": "Notifications",
                        "description": "Review messages and delivery attempts associated with the specimen chain."
                    }
                ],
                "steps": [
                    "Select the rejected specimen and confirm its identity and rejection evidence.",
                    "Review whether an independent review is already pending.",
                    "If an independent review is needed, enter the reason and submit the available review request.",
                    "An authorized independent reviewer records whether the sample is usable or the rejection is upheld.",
                    "When recollection is required, start the linked replacement and track it through collection.",
                    "Review patient notifications and attempts rather than assuming a message was delivered."
                ],
                "after": "The original rejection, review decision and any replacement specimen remain linked in history.",
                "verify": "The original rejection, review decision and any replacement specimen remain linked in history.",
                "recovery": "The requester cannot provide the independent decision. A pending review blocks a conflicting duplicate decision. Resolve recollection using the recorded chain.",
                "example": {
                    "situation": "A scientist questions whether a rejected specimen can still be used.",
                    "action": "Request an independent review and wait for the authorized reviewer’s decision.",
                    "expected": "The next action follows the recorded review outcome."
                },
                "related": [
                    "sample-collection",
                    "sample-validation",
                    "specimen-storage",
                    "review-requests"
                ]
            },
            {
                "slug": "review-requests",
                "title": "Review specimen decisions and notifications",
                "category": "Samples",
                "route": "/operations/phelobotomy/review-requests",
                "kind": "page",
                "purpose": "Review reports provide oversight of rejected specimen decisions and related patient communications.",
                "concept": "Review reports provide oversight of rejected specimen decisions and related patient communications.",
                "open": "Open Review specimen decisions and notifications from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Review worklist",
                        "description": "Find the relevant specimen review and current state."
                    },
                    {
                        "name": "Specimen reference",
                        "description": "Match the original specimen, review and replacement where present."
                    },
                    {
                        "name": "Decision history",
                        "description": "Read the recorded evidence and responsible users."
                    }
                ],
                "steps": [
                    "Find the review using the available worklist filters.",
                    "Confirm the specimen and patient before opening related details.",
                    "Read the review request, outcome and any outstanding action.",
                    "Continue the authorized decision or recollection task from the relevant specimen record.",
                    "Review related notification status when communicating with the patient."
                ],
                "after": "The reviewer can explain the decision and current replacement or communication state.",
                "verify": "The reviewer can explain the decision and current replacement or communication state.",
                "recovery": "Do not interpret a requested notification as delivered. Review its actual attempt and failure information.",
                "example": {
                    "situation": "A supervisor needs to explain why a recollection was requested.",
                    "action": "Open the specimen review and read the rejection and independent decision evidence.",
                    "expected": "The explanation is supported by the recorded history."
                },
                "related": [
                    "sample-collection",
                    "sample-validation",
                    "specimen-storage",
                    "rejected-specimens"
                ]
            },
            {
                "slug": "imaging-templates",
                "title": "Create and review imaging report templates",
                "category": "Imaging",
                "route": "/operations/imaging/ultrasound/templates/list",
                "kind": "page",
                "purpose": "Templates provide reusable report structure. Patient-specific findings still need review in the selected examination.",
                "concept": "Templates provide reusable report structure. Patient-specific findings still need review in the selected examination.",
                "open": "Open Create and review imaging report templates from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Template list",
                        "description": "Find the intended ultrasound template."
                    },
                    {
                        "name": "Create Templates",
                        "description": "Open the authorized template creation task."
                    },
                    {
                        "name": "Template content",
                        "description": "Review the reusable report structure before saving or using it."
                    }
                ],
                "steps": [
                    "Search the template list to avoid creating an unnecessary duplicate.",
                    "Open an existing template or use the permitted create task.",
                    "Enter the intended reusable report structure and review its wording.",
                    "Save through the available template action and reopen the saved template.",
                    "When applying it to a case, replace or confirm patient-specific findings before completing the report."
                ],
                "after": "The saved template can be found and its structure is suitable for the intended examination.",
                "verify": "The saved template can be found and its structure is suitable for the intended examination.",
                "recovery": "Template management permissions remain separate from case reporting. Review the saved template before using it on a patient case.",
                "example": {
                    "situation": "A reporting team uses a standard examination structure.",
                    "action": "Save the reusable structure as a template and review it in a new reporting task.",
                    "expected": "The case-specific content is checked before report completion."
                },
                "related": [
                    "imaging"
                ]
            },
            {
                "slug": "turnaround",
                "title": "Review laboratory turnaround time",
                "category": "Quality",
                "route": "/operations/laboratory/turnaroundtime",
                "kind": "page",
                "purpose": "Turnaround reports compare recorded workflow timing. Missing stages or different reporting periods affect interpretation.",
                "concept": "Turnaround reports compare recorded workflow timing. Missing stages or different reporting periods affect interpretation.",
                "open": "Open Review laboratory turnaround time from the Operations navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, visit, specimen or operational event reference before selecting an action."
                ],
                "controls": [
                    {
                        "name": "Period and report filters",
                        "description": "Choose the relevant reporting scope."
                    },
                    {
                        "name": "Timing summaries",
                        "description": "Review the meaning of the displayed start, end and duration measures."
                    },
                    {
                        "name": "Matching records",
                        "description": "Inspect records contributing to an apparent delay."
                    }
                ],
                "steps": [
                    "Choose the period and available scope filters.",
                    "Identify the timing measure being reviewed before comparing totals.",
                    "Review delayed services and their recorded workflow stages.",
                    "Open the relevant service through an authorized worklist when investigation is needed.",
                    "Compare timestamps and missing prerequisites before assigning a cause for delay."
                ],
                "after": "The timing explanation matches the selected period and the recorded service events.",
                "verify": "The timing explanation matches the selected period and the recorded service events.",
                "recovery": "A missing workflow timestamp should be investigated in its original record. Different service types and periods should not be compared as identical measures.",
                "example": {
                    "situation": "A report indicates a delay in result completion.",
                    "action": "Review the affected services and their recorded processing and completion timestamps.",
                    "expected": "The cause is traced to recorded workflow evidence."
                },
                "related": [
                    "quality-control",
                    "critical-results"
                ]
            }
        ],
        "glossary": [
            {
                "term": "Specimen",
                "meaning": "Material collected from a patient for a requested test."
            },
            {
                "term": "Result revision",
                "meaning": "The saved version of a result that an approval must refer to."
            },
            {
                "term": "Validation",
                "meaning": "Review and approval by the required authorized person."
            },
            {
                "term": "QC session",
                "meaning": "A recorded control-material run associated with a device."
            },
            {
                "term": "Receipt shortage",
                "meaning": "Stock issued by stores that the receiving department has not confirmed receiving."
            }
        ],
        "startPath": [
            "sample-to-report",
            "vital-signs",
            "sample-collection",
            "sample-validation"
        ]
    },
    {
        "id": "crm",
        "title": "CRM",
        "description": "Registration, patient service and referring relationships",
        "articles": [
            {
                "slug": "patient-journey",
                "title": "From patient arrival to billing handoff",
                "category": "Patient workflow",
                "route": "/crm/registration",
                "purpose": "Understand how patient identity connects registration, queue tracking and billing.",
                "kind": "workflow",
                "concept": "Understand how patient identity connects registration, queue tracking and billing. Each stage is performed by a person with the existing permission for that task.",
                "before": [
                    "Confirm the patient identity and active visit before handing the reference to billing.",
                    "Agree who is responsible for the next handoff."
                ],
                "controls": [
                    {
                        "name": "Front desk",
                        "description": "Search for an existing patient."
                    },
                    {
                        "name": "Registrar",
                        "description": "Confirm identity and register only when needed."
                    },
                    {
                        "name": "CRM team",
                        "description": "Track the active visit and direct the patient."
                    },
                    {
                        "name": "Billing team",
                        "description": "Prepare the correct services and payer details."
                    }
                ],
                "steps": [
                    "Confirm facility, branch and active role. Ask whether the patient has an existing patient ID and what services are requested.",
                    "Search Customers by the appropriate field and compare the patient identity. Use Registration only after checking that the patient is not already recorded.",
                    "For a new patient, complete the required Basic Info and choose the appropriate registration path. Record the generated patient ID and verify the saved profile.",
                    "Open Bill Client for that patient, or continue directly from registration. Confirm the actual payer and any separate referring clinician/organization.",
                    "Review requested tests/services and their final charges. Follow the configured direct-payment or separate-cashier workflow; pass the saved Bill ID or code to the cashier.",
                    "Direct the patient to the correct next service point. The collection/clinical team uses the same patient and requested-service references. A queue ticket or bill is not proof of clinical completion.",
                    "For later inquiries, locate the original patient, bill and released report or receipt rather than creating another registration or collection."
                ],
                "verify": "Verify that the visit and bill refer to the same intended patient.",
                "recovery": "If a stage is blocked, review its record status, required information and responsible role before proceeding. For an uncertain save, inspect the recorded history before retrying.",
                "after": "The correct patient identity and active visit reference are available for the next billing and service tasks.",
                "example": {
                    "situation": "A returning patient arrives for another service.",
                    "action": "Find their existing identity, confirm the active visit and hand over the correct patient reference for billing.",
                    "expected": "Verify that the visit and bill refer to the same intended patient."
                },
                "related": [
                    "customers",
                    "registration",
                    "queue"
                ],
                "open": "Open CRM & Billing → Customer Management → Customers for a returning patient, or Registration for a new patient.",
                "entryRoutes": [
                    "/crm/customers",
                    "/crm/registration",
                    "/operations/queue"
                ]
            },
            {
                "slug": "registration",
                "title": "Register a patient",
                "category": "Patients",
                "route": "/crm/registration",
                "purpose": "Create a patient record after checking for an existing identity.",
                "steps": [
                    "In Quick Duplicate Check, enter the mobile number in Search by mobile number... and select Check Mobile. Inspect any match and reuse the correct existing patient instead of registering them twice.",
                    "On Basic Info, complete First Name, Last Name, Gender and Primary Mobile Contact. Enter DOB & Age carefully and review its unit. Complete optional fields only when known.",
                    "Review the patient’s spelling, age and contact with them. Save & Proceed to Billing saves the basic registration and goes to billing; Save & Continue to Address continues the longer registration. Choose the path required by your facility.",
                    "For the full registration, select Save & Continue to Address. Choose Region and enter Area. Add District, GPS and street address when available. Select Save & Continue to Emergency Contact.",
                    "On Emergency Contact, enter the contact details available to you, then use the save-and-continue button to reach Photo & Credentials.",
                    "On Photo & Credentials, leave the optional photo and both credentials blank if they are not required. Otherwise follow your facility’s consent and account-creation process. Never share passwords in training material.",
                    "Select Complete Registration & Go to Billing. Confirm the full patient name and generated patient ID on the next screen. Record the identifier before selecting services."
                ],
                "verify": "Reopen the saved patient using the generated patient ID. Verify name, gender, age, mobile and any completed address/emergency details. Confirm billing is for that same patient.",
                "recovery": "If a duplicate appears, stop and inspect it before creating another record. If a save is uncertain, search for the patient before clicking Save again. At Address, complete both Region and Area. If the session is replaced, sign in again; do not keep resubmitting the form.",
                "kind": "page",
                "concept": "Registration creates the patient identity used by billing and clinical services. Searching first prevents histories being split across avoidable duplicate records.",
                "before": [
                    "Confirm the active facility and branch and that you have patient-registration access.",
                    "Ask for existing patient ID and check for an existing registration before creating a new patient.",
                    "Use fictional details only for a training exercise; do not send notifications to a fabricated contact."
                ],
                "controls": [
                    {
                        "name": "Personal Details",
                        "description": "First name, last name and gender are required by the wizard. Review designation, other names, age and age unit, or the entered birth-date fields."
                    },
                    {
                        "name": "Patient search and existing matches",
                        "description": "Review a matching identity before creating another patient. Select the correct existing record where appropriate."
                    },
                    {
                        "name": "Mobile and contact ownership",
                        "description": "Review country codes, mobile and WhatsApp details, and whether the contact belongs to the patient or a relative."
                    },
                    {
                        "name": "Additional personal information",
                        "description": "Review email, marital status, occupation and organization where applicable."
                    },
                    {
                        "name": "Address & Location",
                        "description": "Region and Area are required when saving this step. District, country, GPS location and address are optional additional details."
                    },
                    {
                        "name": "Emergency Contact",
                        "description": "Review emergency contact name, relationship, telephone, address and occupation."
                    },
                    {
                        "name": "Photo & Credentials",
                        "description": "Review or capture/upload the patient photograph. Supported uploads are JPEG, PNG or GIF up to 5 MB. A pending photo needs Save photo or completion."
                    },
                    {
                        "name": "Username and password",
                        "description": "Enter both credential fields or leave both empty. Use the configured patient access workflow and review returned validation."
                    },
                    {
                        "name": "Save / next / go to billing",
                        "description": "Save Personal Details before later steps. The wizard supports continuing registration or moving to billing after the required saved identity."
                    },
                    {
                        "name": "Complete Registration & Go to Billing",
                        "description": "Persist the pending photo and entered credentials, then continue using the saved patient reference."
                    },
                    {
                        "name": "Primary Mobile Contact",
                        "description": "Required. Enter the correct 10-digit local mobile number and review the selected country code. Resolve duplicate matches before creating another patient."
                    }
                ],
                "example": {
                    "situation": "A new fictional adult is being registered for a training exercise.",
                    "action": "The live pilot used TRAINING MANUAL PILOT NOV05, Male, 30 Yrs, a non-routable training phone and TRAINING AREA. It followed all four wizard stages.",
                    "expected": "The application generated NE-000005-MY in the pilot facility and opened billing for the same patient. Your facility generates its own identifier; never type this pilot ID into another facility."
                },
                "after": "The saved patient identifier can be used to locate the patient for billing and subsequent services.",
                "related": [
                    "customers"
                ],
                "open": "Open CRM & Billing from Applications, then Customer Management → Registration. The page heading is Patient Registration Wizard.",
                "pilot": {
                    "reviewedAt": "5 November 2026",
                    "status": "Live registration completed",
                    "checked": [
                        "Created fictional patient TRAINING MANUAL PILOT NOV05; saved Basic Info, Address and Emergency Contact, then completed registration into billing.",
                        "Verified the four wizard stages and both Basic Info save paths in the signed-in application."
                    ],
                    "pending": [
                        "Duplicate-match reuse, optional photo upload and portal credential creation were not performed in this pilot."
                    ],
                    "exercise": "In a designated training facility, register a fictional patient with no real contact details. Record the generated patient ID, reopen the record and compare the saved name, age, gender and address. Pass only when the same patient opens in billing without a second registration.",
                    "fields": [
                        {
                            "name": "First Name / Last Name",
                            "rule": "Required. Enter the patient’s actual names; Middle Name is optional.",
                            "mistake": "Do not enter an identifier in place of the patient name."
                        },
                        {
                            "name": "Gender",
                            "rule": "Required. Choose the appropriate listed option.",
                            "mistake": "Do not leave a default selection unreviewed."
                        },
                        {
                            "name": "DOB & Age",
                            "rule": "Use DD/MM/YYYY for a known birth date, or enter age with Yrs, Mths or Days. Review the calculated value.",
                            "mistake": "An age in months entered as years changes clinical reference ranges."
                        },
                        {
                            "name": "Primary Mobile Contact",
                            "rule": "Required; the local mobile input expects 10 digits. Review the country selection.",
                            "mistake": "Do not publish real phone numbers in training screenshots."
                        },
                        {
                            "name": "Region / Area",
                            "rule": "Required when saving the Address stage, even if the current labels do not show an asterisk.",
                            "mistake": "An empty Area can prevent progression."
                        },
                        {
                            "name": "Photo & Credentials",
                            "rule": "Optional. JPEG, PNG or GIF photo, at most 5 MB. Leave both username and password empty when no portal account is needed.",
                            "mistake": "Do not enter only one credential or capture a password in a screenshot."
                        }
                    ],
                    "screenshots": [
                        {
                            "file": "registration-start.jpg",
                            "caption": "Basic Info: run the duplicate check before creating another patient.",
                            "callouts": [
                                {
                                    "x": 37,
                                    "y": 51,
                                    "label": "Check Mobile: search before registering another patient."
                                },
                                {
                                    "x": 17,
                                    "y": 87,
                                    "label": "Name fields: enter and review the patient identity."
                                }
                            ]
                        }
                    ]
                }
            },
            {
                "slug": "customers",
                "title": "Find and manage a patient",
                "category": "Patients",
                "route": "/crm/customers",
                "purpose": "Open the correct customer record and its permitted actions.",
                "steps": [
                    "In Filter By Field, choose Fullname, Patientid, Fullpatientid, Mobile number or another relevant field. Enter the matching value in Search patient using the selected field. Confirm the identifier in the returned row.",
                    "Use Advanced Filtering when the simple field search is insufficient. Rows per page and Search table control the displayed table. Confirm the returned record before using Actions.",
                    "Open the matching row’s Actions menu. Bill Client prepares a bill; Update Records opens the profile; Record Vital Signs opens the permitted clinical form. Confirm the same patient ID in the destination.",
                    "Use Transactions(Analytics) for the financial history or View Previous Transactions(Test) for clinical case history. These answer different questions.",
                    "Patient Portal, Book Appointment and Consultation open their specific permitted workflows. Opening a menu does not grant access to restricted actions.",
                    "For profile changes, compare existing and intended values, save through the relevant form and reopen the same patient to confirm the update. Do not change one person’s record into another person."
                ],
                "verify": "The task opens for the intended patient and saved changes appear after reload.",
                "recovery": "Use the current role permissions if an action is unavailable. Check the result before retrying an uncertain save.",
                "kind": "page",
                "concept": "The customer register is the starting point for locating an existing patient. Row actions operate on the selected patient record.",
                "before": [
                    "Use a reliable patient identifier when possible.",
                    "Check the patient identity before selecting a record action."
                ],
                "controls": [
                    {
                        "name": "Customer filters",
                        "description": "Narrow the list to the patient you need."
                    },
                    {
                        "name": "Actions menu",
                        "description": "Choose a permitted task for the selected row."
                    },
                    {
                        "name": "Patient record",
                        "description": "Review the identity and existing information before making an authorized update."
                    },
                    {
                        "name": "Patient row Actions",
                        "description": "Available choices include Bill Client, Update Records, Record Vital Signs, Transactions(Analytics), View Previous Transactions(Test), Patient Portal, Book Appointment and Consultation. The exact choices follow current access. Transactions(Analytics) opens financial history. View Previous Transactions(Test) opens laboratory case history."
                    }
                ],
                "example": {
                    "situation": "The customer list contains one matching patient.",
                    "action": "Open that row Actions menu and choose the required task.",
                    "expected": "Confirm the task shows the same patient identifier before saving anything."
                },
                "after": "Authorized updates remain attached to the selected patient record.",
                "related": [
                    "registration"
                ],
                "open": "Use CRM → Customers in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "queue",
                "title": "Track a patient through the queue",
                "category": "Patient service",
                "route": "/operations/queue",
                "purpose": "Review the patient journey and current service stage.",
                "steps": [
                    "Open track a patient through the queue using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Find the patient in the active queue.",
                    "Review the visit and stage before using any available transition action.",
                    "Confirm the new stage and direct the patient to the appropriate service point.",
                    "The queue reflects the intended visit and current stage."
                ],
                "verify": "The queue reflects the intended visit and current stage.",
                "recovery": "Check the visit and service prerequisites when progression is blocked.",
                "kind": "page",
                "concept": "The queue shows a visit moving between service points. A stage update should reflect the patient actual progress.",
                "before": [
                    "Confirm the patient and active visit.",
                    "Review the current stage and any prerequisites before advancing."
                ],
                "controls": [
                    {
                        "name": "Queue filters",
                        "description": "Find the intended visit."
                    },
                    {
                        "name": "Visit stage",
                        "description": "Review where the patient is in the service journey."
                    },
                    {
                        "name": "Transition action",
                        "description": "Use only the action that matches the completed handoff."
                    }
                ],
                "example": {
                    "situation": "A patient has completed registration and needs the next service point.",
                    "action": "Review the visit stage and use the available transition for the completed work.",
                    "expected": "Confirm the updated stage before directing the patient onward."
                },
                "after": "The updated stage helps the next service point identify the patient waiting for them.",
                "related": [
                    "follow-up"
                ],
                "open": "Use Walk-in Queue & Client Tracking in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "organizations",
                "title": "Review referring organizations",
                "category": "Relationships",
                "route": "/organization",
                "purpose": "Find organization details and authorized record actions.",
                "steps": [
                    "Open review referring organizations using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Search the organization list and open the matching record or available row action.",
                    "Review contact information and applicable relationships.",
                    "For an authorized edit, check the unique contact and email before saving.",
                    "The organization details remain associated with the intended record."
                ],
                "verify": "The organization details remain associated with the intended record.",
                "recovery": "Resolve duplicate contact or email warnings. Configuration changes require the appropriate management permissions.",
                "kind": "page",
                "concept": "Organizations group referring or paying relationships. Their contact details and configured applicability affect how staff select them elsewhere.",
                "before": [
                    "Find the existing organization before creating another.",
                    "Editing requires the appropriate organization management permissions."
                ],
                "controls": [
                    {
                        "name": "Organization search",
                        "description": "Find a record by the available list filters."
                    },
                    {
                        "name": "Row actions",
                        "description": "Open the organization or choose an authorized management action."
                    },
                    {
                        "name": "Contact and email",
                        "description": "Review uniqueness and accuracy before saving authorized changes."
                    }
                ],
                "example": {
                    "situation": "A referring facility already exists under an abbreviated name.",
                    "action": "Search and review the matching organization before adding a new one.",
                    "expected": "Use its existing record once the identity and contact information match."
                },
                "after": "The organization remains available to the workflows and configuration where it is applicable.",
                "related": [
                    "practitioners",
                    "acquisition"
                ],
                "open": "Use Organizations → Organization in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "practitioners",
                "title": "Find referring practitioners",
                "category": "Relationships",
                "route": "/clinicians",
                "purpose": "Review practitioner records and available access actions.",
                "steps": [
                    "Open find referring practitioners using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Find the practitioner in the list and confirm their contact details.",
                    "Use the available record action to review their details.",
                    "If authorized to manage access, review the invitation or access result before sending again.",
                    "The intended practitioner record and access state are shown."
                ],
                "verify": "The intended practitioner record and access state are shown.",
                "recovery": "Access management requires its existing permissions. Confirm invitation delivery before repeating it.",
                "kind": "page",
                "concept": "A practitioner record identifies the referring healthcare professional. Portal access and invitations are separate authorized tasks associated with that identity.",
                "before": [
                    "Verify the practitioner identity and contact details.",
                    "Access actions require the applicable practitioner management permissions."
                ],
                "controls": [
                    {
                        "name": "Practitioner list",
                        "description": "Locate the existing practitioner."
                    },
                    {
                        "name": "Record actions",
                        "description": "Open the permitted detail or access task."
                    },
                    {
                        "name": "Access state",
                        "description": "Review existing invitation or access information before repeating an action."
                    }
                ],
                "example": {
                    "situation": "A practitioner says they cannot access their portal.",
                    "action": "Locate the correct record and review its access state through the permitted action.",
                    "expected": "Correct the reported configuration or use the existing invitation workflow when authorized."
                },
                "after": "The saved practitioner identity and access state determine the next appropriate access action.",
                "related": [
                    "organizations",
                    "acquisition"
                ],
                "open": "Use Clinicians → Clinicians in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "follow-up",
                "title": "Review referrer follow-up",
                "category": "Patient service",
                "route": "/crm/acquisition",
                "purpose": "Keep follow-up activity attached to the correct lead.",
                "steps": [
                    "Open Referrer acquisition & performance using Open task page. Confirm the page and active branch match your intended work.",
                    "Find the lead using the list filters.",
                    "Review existing follow-up information and contact details.",
                    "Record the permitted follow-up update and review the saved record.",
                    "The follow-up record reflects the intended lead and outcome."
                ],
                "verify": "The follow-up record reflects the intended lead and outcome.",
                "recovery": "Check existing activity before repeating an update or contacting the same person again.",
                "kind": "page",
                "concept": "Legacy lead and follow-up pages open the unified referrer acquisition workspace. Access is determined by the acquisition workspace permissions.",
                "before": [
                    "Find the correct lead and contact details.",
                    "Review previous follow-up information before adding another outcome."
                ],
                "controls": [
                    {
                        "name": "Follow-up list",
                        "description": "Find the intended lead."
                    },
                    {
                        "name": "Lead details",
                        "description": "Read existing contact and follow-up information."
                    },
                    {
                        "name": "Follow-up update",
                        "description": "Record the permitted outcome for that lead."
                    }
                ],
                "example": {
                    "situation": "A lead was contacted earlier today by another colleague.",
                    "action": "Review the saved activity before making another contact.",
                    "expected": "Record the next appropriate outcome using the available task."
                },
                "after": "The next staff member can review the lead history before taking further action.",
                "related": [
                    "queue"
                ],
                "open": "Open Referrer acquisition & performance. Legacy lead links redirect into this workspace. Use the available tabs and record actions for the selected prospect or follow-up."
            },
            {
                "slug": "acquisition",
                "title": "Review referrer acquisition",
                "category": "Relationships",
                "route": "/crm/acquisition",
                "purpose": "Review assigned referrer acquisition and follow-up.",
                "steps": [
                    "Open review referrer acquisition using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Open the acquisition workspace and review the available filters.",
                    "Select the relevant referrer or acquisition record.",
                    "Record permitted follow-up and review the resulting status.",
                    "The correct acquisition record carries the updated activity."
                ],
                "verify": "The correct acquisition record carries the updated activity.",
                "recovery": "Assignments and record visibility depend on your active role and scope.",
                "kind": "page",
                "concept": "Acquisition activity connects referrer development and follow-up to the records visible in your assigned scope.",
                "before": [
                    "Use your assigned acquisition scope.",
                    "Review the existing activity before recording another follow-up."
                ],
                "controls": [
                    {
                        "name": "Workspace filters",
                        "description": "Narrow records using the available criteria."
                    },
                    {
                        "name": "Acquisition record",
                        "description": "Review the intended referrer and activity."
                    },
                    {
                        "name": "Follow-up controls",
                        "description": "Record authorized progress against that record."
                    }
                ],
                "example": {
                    "situation": "A marketer is following up an assigned referrer.",
                    "action": "Open the matching acquisition record and review the last activity.",
                    "expected": "Record the outcome and confirm it appears on that record."
                },
                "after": "Saved activity supports subsequent acquisition review and follow-up.",
                "related": [
                    "organizations",
                    "practitioners"
                ],
                "open": "Use Referrer acquisition & performance in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "referral-codes",
                "title": "Manage and use referral codes",
                "category": "Relationships",
                "route": "/crm/referral-codes",
                "kind": "page",
                "purpose": "Referral codes identify referral relationships. Review the intended owner and applicability before using a code in a registration or billing context.",
                "concept": "Referral codes identify referral relationships. Review the intended owner and applicability before using a code in a registration or billing context.",
                "open": "Open Manage and use referral codes from the CRM navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient or referrer identity before editing details or contacting the recipient."
                ],
                "controls": [
                    {
                        "name": "Code list",
                        "description": "Find the existing code and owner."
                    },
                    {
                        "name": "Code details",
                        "description": "Review its status and relationship information."
                    },
                    {
                        "name": "Management actions",
                        "description": "Create or update codes only through the actions available to your role."
                    }
                ],
                "steps": [
                    "Search for an existing code belonging to the intended referrer.",
                    "Review the code details and applicable status.",
                    "If authorized, create or update the intended code using required fields.",
                    "Reopen the saved code and verify its owner and status.",
                    "Use the reviewed code in the relevant workflow and check the recorded referral association."
                ],
                "after": "The code identifies the intended referral relationship.",
                "verify": "The code identifies the intended referral relationship.",
                "recovery": "Check status, ownership and management permissions when a code cannot be used or edited.",
                "example": {
                    "situation": "A referrer provides a code for a patient.",
                    "action": "Find and verify the code owner before recording the referral.",
                    "expected": "The saved referral association points to the intended referrer."
                },
                "related": [
                    "organizations",
                    "practitioners",
                    "acquisition"
                ]
            },
            {
                "slug": "birthdays",
                "title": "Review upcoming birthdays and contact details",
                "category": "Patient service",
                "route": "/crm/birthdays/upcoming-birthday",
                "kind": "page",
                "purpose": "Birthday lists support patient relationship activity. The selected period and contact details determine whom staff intend to contact.",
                "concept": "Birthday lists support patient relationship activity. The selected period and contact details determine whom staff intend to contact.",
                "open": "Open Review upcoming birthdays and contact details from the CRM navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient or referrer identity before editing details or contacting the recipient."
                ],
                "controls": [
                    {
                        "name": "Birthday scope",
                        "description": "Review the selected day or upcoming period."
                    },
                    {
                        "name": "Patient list",
                        "description": "Confirm the patient identity and available contact details."
                    },
                    {
                        "name": "Contact actions",
                        "description": "Use the available communication action after checking the recipient."
                    }
                ],
                "steps": [
                    "Choose the relevant birthday period.",
                    "Review the listed patient and contact details.",
                    "Check previous or planned communication before contacting the patient again.",
                    "Use the available communication task under its existing permissions.",
                    "Review any recorded status or communication evidence separately from opening a contact link."
                ],
                "after": "The intended patient and recipient details are used for the birthday communication.",
                "verify": "The intended patient and recipient details are used for the birthday communication.",
                "recovery": "A contact link opening does not prove delivery. Verify delivery in the relevant messaging history when available.",
                "example": {
                    "situation": "A team plans birthday follow-up for the coming week.",
                    "action": "Review the upcoming list and confirm recipient contact information.",
                    "expected": "Communication is directed to the intended patients."
                },
                "related": [
                    "queue",
                    "follow-up",
                    "released-results",
                    "price-list"
                ]
            },
            {
                "slug": "released-results",
                "title": "Find a released patient result",
                "category": "Patient service",
                "route": "/crm/validated",
                "kind": "page",
                "purpose": "The released-results list supports customer service for eligible reports. Result access, payment eligibility and report release are still checked when opening or printing.",
                "concept": "The released-results list supports customer service for eligible reports. Result access, payment eligibility and report release are still checked when opening or printing.",
                "open": "Open Find a released patient result from the CRM navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient or referrer identity before editing details or contacting the recipient."
                ],
                "controls": [
                    {
                        "name": "Released list",
                        "description": "Find the intended patient visit and test."
                    },
                    {
                        "name": "Report action",
                        "description": "Open the available report after confirming its identity."
                    },
                    {
                        "name": "Delivery record",
                        "description": "Use the result delivery workflow when a report handoff needs recording."
                    }
                ],
                "steps": [
                    "Find the patient and visit using the list controls.",
                    "Review the test identity and release information.",
                    "Open the available report and confirm it matches the intended visit.",
                    "Use the permitted print or delivery workflow for the intended recipient.",
                    "Review the recorded delivery state when handing over the result."
                ],
                "after": "The client receives the intended eligible report and the relevant delivery record is updated.",
                "verify": "The client receives the intended eligible report and the relevant delivery record is updated.",
                "recovery": "A visible list entry does not override report-level access or payment settings. Resolve the returned eligibility message before proceeding.",
                "example": {
                    "situation": "A client asks whether their report is ready.",
                    "action": "Find the visit, review the eligible report and its delivery state.",
                    "expected": "The response reflects the actual release and delivery status."
                },
                "related": [
                    "queue",
                    "follow-up",
                    "birthdays",
                    "price-list"
                ]
            },
            {
                "slug": "price-list",
                "title": "Review the test price list",
                "category": "Patient service",
                "route": "/crm/pricelist",
                "kind": "page",
                "purpose": "The price list supports service enquiries. Final patient billing may depend on payer, package, strategy, adjustments and applicable charges.",
                "concept": "The price list supports service enquiries. Final patient billing may depend on payer, package, strategy, adjustments and applicable charges.",
                "open": "Open Review the test price list from the CRM navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient or referrer identity before editing details or contacting the recipient."
                ],
                "controls": [
                    {
                        "name": "Test list",
                        "description": "Find the intended test or service."
                    },
                    {
                        "name": "Displayed price",
                        "description": "Review the listed amount and currency."
                    },
                    {
                        "name": "Billing context",
                        "description": "Use the patient billing workflow to confirm the final applicable charge."
                    }
                ],
                "steps": [
                    "Search for the intended service and verify its exact identity.",
                    "Review the displayed price and relevant service information.",
                    "For a specific patient quote, confirm the payer and applicable pricing through authorized billing.",
                    "Review any package or strategy applicability before explaining the final amount."
                ],
                "after": "The quoted amount is supported by the correct service and patient billing context.",
                "verify": "The quoted amount is supported by the correct service and patient billing context.",
                "recovery": "Do not assume a general list price equals every organization or insurance price. Review the applicable configuration.",
                "example": {
                    "situation": "An organization patient asks for a service price.",
                    "action": "Find the service, then confirm the organization-specific billing context.",
                    "expected": "The quoted amount reflects the applicable payer configuration."
                },
                "related": [
                    "queue",
                    "follow-up",
                    "birthdays",
                    "released-results"
                ]
            }
        ],
        "glossary": [
            {
                "term": "Patient identifier",
                "meaning": "The reference used to distinguish a patient from other people with similar names."
            },
            {
                "term": "Visit",
                "meaning": "A particular attendance or service journey for a patient."
            },
            {
                "term": "Lead",
                "meaning": "A prospective customer record used for follow-up."
            },
            {
                "term": "Referrer",
                "meaning": "A practitioner or organization referring cases to the facility."
            },
            {
                "term": "Applicability",
                "meaning": "The patients or organizations for which a configured offer or package is available."
            }
        ],
        "startPath": [
            "patient-journey",
            "registration",
            "customers",
            "queue"
        ]
    },
    {
        "id": "billing",
        "title": "Billing",
        "description": "Prepare bills, collect payments and review receipts",
        "articles": [
            {
                "slug": "billing-to-receipt",
                "title": "From prepared bill to cashier receipt",
                "category": "Payment workflow",
                "route": "/billing/patientid",
                "purpose": "Understand the separate billing and payment stages, including cashier handoffs.",
                "kind": "workflow",
                "concept": "Understand the separate billing and payment stages, including cashier handoffs. Each stage is performed by a person with the existing permission for that task.",
                "before": [
                    "Confirm facility, branch, patient and payer. Use the sales session required by the facility.",
                    "The registrar prepares charges; the authorized cashier records the actual payment. One person may perform both only where configured and permitted.",
                    "Do not proceed with clinical work when payment, specimen, QC or release settings prohibit it."
                ],
                "controls": [
                    {
                        "name": "Registrar",
                        "description": "Select patient, payer and services."
                    },
                    {
                        "name": "Billing desk",
                        "description": "Review charges and save the bill."
                    },
                    {
                        "name": "Cashier",
                        "description": "Find the bill and allocate the collected payment."
                    },
                    {
                        "name": "Cashier",
                        "description": "Review and print the recorded receipt."
                    }
                ],
                "steps": [
                    "Select the intended patient. On Select Billing Source, choose the actual payer and Continue. Complete payer details for organization or insurance billing.",
                    "In Modern UI Layout, complete Billing setup, Select items, Review charges and Payment in that order. Review Transaction options and Urgency. Load the catalogue when requested.",
                    "Search for each requested test and add it. Review the selected list, remove unintended tests and check applicable package or pricing rules. Select an outsourcing organization if known; an unassigned outsourced test can still be billed.",
                    "At Review charges, compare every service and Bill totals. Add a meaningful Billing note when needed. Continue only after the final payable amount is correct.",
                    "In separate-cashier mode, Payment shows Send this bill to the cashier. Select Save bill & generate cashier code once. Wait for a saved Bill ID and four-character code. If either is missing, check the saved history before trying again.",
                    "Give the cashier the saved code or Bill ID. The payment slip identifies an unpaid bill and must not be described as a receipt. In direct-payment mode, complete the configured payment controls instead.",
                    "The cashier opens Cash Collection. In Find a bill, enter the reference in Cashier code, Patient ID or Bill ID and choose Find bill. Confirm patient identity, services, paid amounts and current balance. Payment status can be set to All or Completed to locate a settled bill.",
                    "For partial payment, enter only the amount actually received against the intended service rows. Select Payment method and, for cash, enter Cash received. Review Current balance, Collecting now and Remaining after payment. Apply a waive-off only with its existing authority.",
                    "Select Collect Payment once. Inspect the recorded collection and remaining balance. For a second instalment, retrieve the same bill and pay only the current balance.",
                    "Use Reprint receipt for a saved collection, or the original bill’s Actions → Print Receipt POS format / Print Receipt A4 format in Daily Sales Report. Reprinting must not create another collection."
                ],
                "verify": "Check the saved bill and payment history, not only a success message. Initial payable minus actual collections minus authorized waivers must equal the remaining balance, with refunds and adjustments reviewed separately.",
                "recovery": "If “The bill was not saved” appears, retain the selections and review the original patient’s saved bills before retrying. If a collection response is uncertain, inspect payment history first. Resolve sales-session, authorization and current-balance warnings through their existing controls.",
                "after": "A successfully saved bill has its own reference. A successfully recorded payment reduces that bill’s balance. The receipt is evidence of that payment; the cashier code is a retrieval reference.",
                "example": {
                    "situation": "The reviewed training quote is GH₵93.50 for WIDAL and FBC ADULT MALE. The client intends to pay GH₵30.00 first.",
                    "action": "Save the bill without collection, retrieve the same reference at Cash Collection, then record GH₵30.00 only in an approved training payment exercise.",
                    "expected": "Live verified: the first GH₵30.00 payment left GH₵63.50. A second GH₵63.50 settled the same Bill #67, with GH₵93.50 paid and zero outstanding. The original receipt was opened for reprinting."
                },
                "related": [
                    "prepare-bill",
                    "collect-payment",
                    "receipts"
                ],
                "open": "Open CRM & Billing → Billing & Sales → Billing, or continue from patient registration. Cashiers use Cash Collection to retrieve the saved bill.",
                "entryRoutes": [
                    "/billing/patientid",
                    "/billing/cash-collection",
                    "/billing/receipts"
                ],
                "pilot": {
                    "reviewedAt": "6 November 2026",
                    "status": "Live save, cashier lookup, partial payment, settlement and reprint verified",
                    "checked": [
                        "Saved fictional Bill #67 for NE-000005-MY with cashier code BBK6 and GH₵93.50 payable.",
                        "Retrieved the original bill by BBK6 in Cash Collection. Recorded GH₵30.00, then reopened and verified GH₵63.50 remaining.",
                        "Recorded the remaining GH₵63.50 against the same bill. Verified GH₵93.50 paid and zero outstanding; opened the existing receipt reprint link."
                    ],
                    "pending": [
                        "Printer output on physical 80 mm/A4 paper, direct-payment mode, staff-benefit approvals, insurance cases and restricted cashier-role acceptance are separate checks.",
                        "The first follow-up lookup was interrupted by a backend restart. Reopening after the server recovered displayed the saved balance; no payment was repeated."
                    ],
                    "exercise": "Prepare two services for a fictional patient. Record the reviewed total and save once. Pass the billing stage only after a saved Bill ID and cashier code are visible. An authorized cashier must retrieve that same bill and demonstrate a partial payment and its remaining balance in the designated training environment.",
                    "fields": [
                        {
                            "name": "Billing source",
                            "rule": "Select the actual payer, then Continue. General Billing is for the private/general example.",
                            "mistake": "NHIS needs configured services and claim/member details; do not substitute General merely to bypass a warning."
                        },
                        {
                            "name": "Urgency",
                            "rule": "Review Routine versus the configured urgent option before loading charges.",
                            "mistake": "The displayed default may be urgent; check it rather than assuming normal pricing."
                        },
                        {
                            "name": "Receiving laboratories",
                            "rule": "An outsourcing organization is optional for billing. Review charges again after changing it.",
                            "mistake": "Do not bill another test just because no organization has been assigned."
                        },
                        {
                            "name": "Bill totals",
                            "rule": "Compare selected services, subtotal, discount, surcharge, tax and Amount payable.",
                            "mistake": "Catalogue prices can differ from the final reviewed quote."
                        },
                        {
                            "name": "Save bill & generate cashier code",
                            "rule": "In separate-cashier mode, saves the bill without collecting payment.",
                            "mistake": "A payment slip or code is not a payment receipt."
                        },
                        {
                            "name": "Payment / Waive-off",
                            "rule": "Enter actual collection separately from any authorized waiver.",
                            "mistake": "Never use a waiver to represent money received."
                        }
                    ],
                    "screenshots": [
                        {
                            "file": "billing-source.jpg",
                            "caption": "Select the payer for the confirmed training patient before building the bill.",
                            "callouts": []
                        },
                        {
                            "file": "billing-review.jpg",
                            "caption": "Reviewed quote in this pilot: 85.00 + 8.50 tax = 93.50. Prices and tax are facility-specific.",
                            "callouts": []
                        },
                        {
                            "file": "billing-handoff.jpg",
                            "caption": "The separate-cashier handoff saves charges first; money is collected against the resulting bill.",
                            "callouts": []
                        },
                        {
                            "file": "billing-saved-code.jpg",
                            "caption": "Live saved bill #67 and cashier code BBK6. The unpaid balance remains GH₵93.50 until the cashier records payment.",
                            "callouts": []
                        },
                        {
                            "file": "billing-settled.jpg",
                            "caption": "After the two recorded collections, Bill #67 is SETTLED. Already paid is GH₵93.50, outstanding is zero and Reprint receipt uses the existing bill.",
                            "callouts": []
                        }
                    ]
                }
            },
            {
                "slug": "prepare-bill",
                "title": "Prepare a patient bill",
                "category": "Billing",
                "route": "/billing/patientid",
                "purpose": "Select the patient before building a bill.",
                "steps": [
                    "Search for and select the intended patient. Confirm the patient identity and active branch.",
                    "On Select Billing Source, review the patient selected. Use Change patient if it is incorrect. Select General Billing, Organizational Billing, Private Health Insurance Scheme(P.H.I.S), National Health Insurance Scheme(N.H.I.S) or Special Health Care Provider Billing to match the payer. Continue remains disabled until a source is selected. Complete the required payer details before loading applicable services.",
                    "Choose the requested tests or packages. Review each selected service, applicable prices, quantities or other available options and the running total.",
                    "For an outsourced service, select a receiving laboratory when known. An unassigned outsourced service can still be billed. Review charges again after a change that affects them.",
                    "Review discount, surcharge, urgent or other applicable adjustments and the final payable amount.",
                    "Continue to the payment stage in the configured billing layout. Choose Full payment, Partial payment, Staff benefit or NHIS claim where offered for that billing context.",
                    "For full payment, review the entered amounts and any supported split across methods. For partial payment, review the selected service items, entered amount and remaining balance.",
                    "For a staff benefit, select the eligible account and reason and review allowance, coverage, patient payable and approval requirements before proceeding.",
                    "If configured for a separate cashier handoff, use the available save-without-payment action and pass the saved bill reference to the cashier.",
                    "Confirm the intended submission and wait for the saved result. Review payment history before retrying an uncertain response.",
                    "For a saved collection, review Receipt & printing. Select POS receipt for 80 mm paper or A4 receipt, then Print receipt. A saved unpaid bill remains outstanding until payment is recorded."
                ],
                "verify": "The saved bill contains the intended patient, services, payer and amounts.",
                "recovery": "An outsourced test can be billed without an assigned receiving organization. Review the latest charges after changing service options.",
                "kind": "page",
                "concept": "A bill records the services and who is responsible for paying. Recording a bill and collecting money can happen at different service points.",
                "before": [
                    "Select the correct patient and payer details.",
                    "Use the sales session and billing layout required by your facility configuration."
                ],
                "controls": [
                    {
                        "name": "Patient selection",
                        "description": "Find the patient before opening the configured billing layout."
                    },
                    {
                        "name": "Select Billing Source",
                        "description": "The setup shows Patient selected, Choose billing source and Build the bill. Select one payer option, then Continue. Change patient returns to patient selection. Billing tools provides Find clinician, Add clinician, Find organization and Add organization in a new tab so the setup remains open."
                    },
                    {
                        "name": "Catalogue and selected services",
                        "description": "Choose tests or packages and review selected prices and adjustments."
                    },
                    {
                        "name": "Receiving laboratories",
                        "description": "Choose an outsourcing organization when known. An unassigned outsourced test can still be billed."
                    },
                    {
                        "name": "Payment step",
                        "description": "Review totals and use the available payment or save-without-payment option for your configured workflow."
                    },
                    {
                        "name": "Full payment",
                        "description": "Allocate the full payable amount using the available payment method or supported split methods."
                    },
                    {
                        "name": "Partial payment",
                        "description": "Select the intended service items and amounts and review what remains outstanding."
                    },
                    {
                        "name": "Staff benefit",
                        "description": "Choose an eligible staff benefit account and reason. Review available allowance, covered amount, patient payable and any approval requirement."
                    },
                    {
                        "name": "NHIS claim",
                        "description": "Review the insurance billing context and submit using the applicable claim option."
                    },
                    {
                        "name": "Receipt & printing",
                        "description": "After a saved collection, review the saved transaction, choose POS receipt for 80 mm paper or A4 receipt, then Print receipt."
                    }
                ],
                "example": {
                    "situation": "The front desk prepares a bill for a patient who will pay at the cashier.",
                    "action": "Review the services and payer, then use the available billing-without-payment action.",
                    "expected": "Give the recorded bill reference to the cashier and verify the bill remains outstanding until collection."
                },
                "after": "The saved bill becomes the service and payment reference. Only a recorded payment reduces the outstanding balance.",
                "related": [
                    "suspended-billing"
                ],
                "open": "Use Billing requests → Prepare billing or Billing & Sales → Billing in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "collect-payment",
                "title": "Collect an outstanding payment",
                "category": "Payments",
                "route": "/billing/cash-collection",
                "purpose": "Record money against the correct outstanding bill.",
                "steps": [
                    "Open Cash Collection and confirm the active facility and branch. Find a bill has separate Cashier code, Patient ID and Bill ID fields. Enter the appropriate reference and choose Payment status, then Find bill. A code lookup resolves the saved patient and bill automatically.",
                    "Choose Find bill. For a cashier-handoff invoice, use the short code supplied by the attendant. Confirm the full patient identity, Bill ID, service names, original charges, paid amounts and current balances. The code retrieves an existing bill; it does not create another bill.",
                    "If lookup returns No billing records found, review the reference and Payment status. Use Outstanding list to return to the list, then Search outstanding bills and Billed date to narrow the records. Use NHIS remittances for eligible NHIS settlement rather than direct cash collection.",
                    "Enter the amount actually being collected against the intended service or services. For final settlement, Use full balance fills the remaining service balances. Enter any waive-off only with existing authorization; a waiver reduces the balance without being money received.",
                    "Select the actual Payment method. For Cash, enter Cash received. Review Current balance, Collecting now and Remaining after payment, including any entered waive-off. Resolve any mismatch before submitting.",
                    "Choose Collect Payment once and wait for confirmation. Confirm the saved paid amount and remaining balance. If the response is uncertain, reload the bill and inspect its payment history before retrying.",
                    "For a later instalment, retrieve the same bill again, review its latest outstanding balance and record only the new money. For example, a GH₵40.00 bill paid GH₵10.00 first must show GH₵30.00 remaining before the final GH₵30.00 payment.",
                    "After collection, use Reprint receipt to preview another copy for the saved bill. Check the patient, bill and payment information before printing. Do not record another collection to obtain a receipt copy."
                ],
                "verify": "The payment appears in the bill history and the outstanding amount reduces correctly.",
                "recovery": "If the response is uncertain, review payment history before resubmitting. Waivers and payment actions retain their authorization checks.",
                "kind": "page",
                "concept": "The payment allocation determines which service balances are settled. A waiver reduces the amount collectible and needs the existing authorization.",
                "before": [
                    "Find the correct patient and bill.",
                    "Review current outstanding values and the amount actually being collected."
                ],
                "controls": [
                    {
                        "name": "Open bills and service rows",
                        "description": "Review each service payable, paid and balance values."
                    },
                    {
                        "name": "Payment and Waive-off fields",
                        "description": "Enter intended amounts and inspect the remaining balance. Review a global waiver across the allocated rows."
                    },
                    {
                        "name": "Payment method and tendered amount",
                        "description": "Choose the actual collection method and review the money received."
                    },
                    {
                        "name": "Collect Payment",
                        "description": "Confirm only after the allocation and totals agree."
                    }
                ],
                "example": {
                    "situation": "An attendant has generated a cashier code for a GH₵40.00 bill. The patient pays GH₵10.00 now.",
                    "action": "Find the existing bill using Cashier code. Enter 10.00 for the service, select Cash, enter Cash received as 10.00 and Collect Payment. Later use the remaining balance of 30.00 for the final collection.",
                    "expected": "The first payment leaves GH₵30.00 outstanding and the bill part-paid. The final GH₵30.00 payment brings the balance to zero. Both payments belong to the original bill."
                },
                "after": "The payment and authorized waiver update the selected balances. A receipt records the collection.",
                "related": [
                    "receipts",
                    "sales-session"
                ],
                "open": "Use Cash Collection in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "receipts",
                "title": "Find a receipt record and reprint from sales",
                "category": "Payments",
                "route": "/billing/receipts",
                "purpose": "Retrieve a recorded receipt for a client.",
                "steps": [
                    "Open Billing & Sales > Receipts to review the receipt audit register. Use Search table and Rows per page to locate the Billing ID or Receipt Number. Review Generated At, Printed At, Status, Generated By and Printed By.",
                    "If you have just collected payment in Cash Collection, use its Reprint receipt link for the same saved bill. Review the patient, bill and paid amounts in the preview. This link is also available after a partial payment; it does not collect another payment.",
                    "The receipt audit register does not expose a reprint action. Note the original Billing ID and billing date, then open Billing & Sales > Daily Sales Report.",
                    "Choose the relevant Period and Search. In Billed Clients, enter the Bill ID in Patient or bill. Review the patient identifier, bill reference and paid amount.",
                    "Open the row Actions dropdown beside View Tests. Select Print Receipt A4 format or Print Receipt POS format according to the paper required. Closed sales retain receipt and transaction-detail access.",
                    "Review the receipt preview against the original recorded transaction before printing. A reprint must use the saved bill rather than recording another collection."
                ],
                "verify": "The print preview matches the original recorded payment.",
                "recovery": "If the audit register has no reprint control, use the saved Billing ID in the Daily Sales Report for the original billing period. Confirm patient identity and payment evidence before selecting a receipt format.",
                "kind": "page",
                "concept": "Reprinting retrieves evidence of a payment already recorded. Check the reference and amount before handing the receipt to the client.",
                "before": [
                    "Locate the original payment reference or patient.",
                    "Verify the receipt is the intended transaction before printing."
                ],
                "controls": [
                    {
                        "name": "Receipts audit register",
                        "description": "Billing IDs, receipt numbers, generation and printing timestamps and staff names provide an audit reference. The register has table search but no direct reprint action."
                    },
                    {
                        "name": "Billed Clients Actions",
                        "description": "Daily Sales Report provides Print Receipt A4 format and Print Receipt POS format for the selected bill."
                    },
                    {
                        "name": "Cash Collection Reprint receipt",
                        "description": "Opens the POS receipt preview for the bill after collection. Use it for another copy without entering or recording another payment."
                    }
                ],
                "example": {
                    "situation": "A client loses a receipt and requests another copy.",
                    "action": "Find the original recorded payment and verify its identity and amount.",
                    "expected": "Use reprint and check the print preview before handing it over."
                },
                "after": "The client receives a copy of the recorded receipt.",
                "related": [
                    "sales",
                    "collect-payment"
                ],
                "open": "Use Receipts & reprints or Receipts in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "sales-session",
                "title": "Review your sales session",
                "category": "Payments",
                "route": "/billing/billing-sessions/sales-session",
                "purpose": "Review the session used for collecting money.",
                "steps": [
                    "Open review your sales session using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Open your sales session and review its status.",
                    "Review the recorded collections and reconciliation information.",
                    "Use the available session action only after checking the cash and required details.",
                    "The session status and totals reflect the recorded collections."
                ],
                "verify": "The session status and totals reflect the recorded collections.",
                "recovery": "Resolve outstanding reconciliation or access requirements before closing a session.",
                "kind": "page",
                "concept": "A sales session groups cashier activity and reconciliation. Session closure depends on the configured cash and financial controls.",
                "before": [
                    "Review the active session and its dates.",
                    "Count the cash and gather reconciliation information before closing."
                ],
                "controls": [
                    {
                        "name": "Session status",
                        "description": "Identify whether the session is open or closed."
                    },
                    {
                        "name": "Collection totals",
                        "description": "Compare recorded collections with the relevant payment evidence."
                    },
                    {
                        "name": "Session action",
                        "description": "Use the permitted action once required reconciliation information is complete."
                    }
                ],
                "example": {
                    "situation": "A cashier finishes a shift with recorded cash collections.",
                    "action": "Compare the physical cash and required reconciliation figures with the session totals.",
                    "expected": "Resolve discrepancies through the existing controls before confirming closure."
                },
                "after": "The updated session status records the completed cashier reconciliation stage.",
                "related": [
                    "collect-payment",
                    "receipts"
                ],
                "open": "Use Cashier sales session or Sales Session in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "packages",
                "title": "Review a package and its applicability",
                "category": "Catalogue",
                "route": "/billing/packages",
                "purpose": "Inspect package tests and applicable organizations.",
                "steps": [
                    "Open review a package and its applicability using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Find the package in the package list.",
                    "Use its view action to inspect included test panels and applicability.",
                    "Use the patient billing workflow to bill the selected package.",
                    "The viewed tests and applicability match the package intended for the patient."
                ],
                "verify": "The viewed tests and applicability match the package intended for the patient.",
                "recovery": "Editing and configuration remain restricted to authorized users.",
                "kind": "page",
                "concept": "A package groups test panels and defines where the package is applicable. Viewing it helps staff select correctly without opening configuration.",
                "before": [
                    "Find the intended package.",
                    "Confirm the patient or organization meets its applicability requirements."
                ],
                "controls": [
                    {
                        "name": "Package list",
                        "description": "Find the package using the available list controls."
                    },
                    {
                        "name": "View action",
                        "description": "Inspect included test panels and applicable organizations."
                    },
                    {
                        "name": "Billing selection",
                        "description": "Use the patient billing workflow to add the applicable package."
                    }
                ],
                "example": {
                    "situation": "A customer asks whether a package includes a particular test.",
                    "action": "Open the package view and inspect its panels and applicability.",
                    "expected": "Confirm those details before selecting the package in patient billing."
                },
                "after": "The package selection follows its saved test membership and applicability.",
                "related": [
                    "strategies"
                ],
                "open": "Use View packages or Packages in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "strategies",
                "title": "Configure billing strategies",
                "category": "Catalogue",
                "route": "/billing/billing-strategy/strategies",
                "purpose": "Review strategy pricing and organization assignments.",
                "steps": [
                    "Open configure billing strategies using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Find or create the intended strategy through the available controls.",
                    "Select the applicable tests and review each configured price.",
                    "Review the organization assignments and save the intended configuration.",
                    "Reload the strategy and confirm its prices and applicable organizations."
                ],
                "verify": "Reload the strategy and confirm its prices and applicable organizations.",
                "recovery": "Check permissions and validation messages. Review existing assignments before changing them.",
                "kind": "page",
                "concept": "A billing strategy defines configured test prices and organization applicability. Review both the selected tests and assignments to avoid an unintended price policy.",
                "before": [
                    "Have the intended test prices and applicable organizations ready.",
                    "Use a role authorized to configure billing strategies."
                ],
                "controls": [
                    {
                        "name": "Test selection",
                        "description": "Select the applicable tests and review the selected set."
                    },
                    {
                        "name": "Test prices",
                        "description": "Set and verify the intended price for each selected test."
                    },
                    {
                        "name": "Organization assignments",
                        "description": "Review which organizations should use the strategy."
                    },
                    {
                        "name": "Save configuration",
                        "description": "Save after reviewing test selection, prices and applicability together."
                    }
                ],
                "example": {
                    "situation": "Two organizations should use the same agreed set of test prices.",
                    "action": "Configure the selected test prices and assign the intended organizations.",
                    "expected": "Reload the saved strategy and verify every selected test and organization."
                },
                "after": "Saved strategy configuration becomes available to applicable billing selections.",
                "related": [
                    "packages"
                ],
                "open": "Use Billing & Sales → Billing Strategies in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "insurance",
                "title": "Review NHIS receivables and remittances",
                "category": "Insurance",
                "route": "/billing/insurance",
                "purpose": "Separate operational outstanding balances from recognized accounting receivables.",
                "steps": [
                    "Open review nhis receivables and remittances using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Choose the branch and service period and review the NHIS summary.",
                    "Check the amount eligible for settlement and review any missing-receivable warning.",
                    "Record a remittance only after the accounting prerequisites and payment details are complete.",
                    "The remittance appears in history and the eligible balance changes by the recorded amount."
                ],
                "verify": "The remittance appears in history and the eligible balance changes by the recorded amount.",
                "recovery": "Legacy bills without receivables require an authorized accounting opening review before settlement.",
                "kind": "page",
                "concept": "Operational NHIS balances and accounting receivables can differ after migration. A remittance needs eligible recognized receivables for the selected branch and service period.",
                "before": [
                    "Confirm the branch and service-period dates.",
                    "Review accounting coverage and the amount eligible for settlement."
                ],
                "controls": [
                    {
                        "name": "Period and branch",
                        "description": "Define which services the remittance covers."
                    },
                    {
                        "name": "Expected, received and outstanding",
                        "description": "Distinguish billed balances from money already recorded."
                    },
                    {
                        "name": "Missing-receivable warning",
                        "description": "Review legacy opening requirements when accounting recognition is absent."
                    },
                    {
                        "name": "Remittance action",
                        "description": "Use the authorized receipt task with eligible balances and complete payment details."
                    }
                ],
                "example": {
                    "situation": "The screen shows legacy outstanding bills but zero eligible receivables.",
                    "action": "Ask an authorized owner/accountant to review the accounting opening requirements with approved evidence.",
                    "expected": "After recognition is confirmed, refresh the period and review eligibility before recording remittance."
                },
                "after": "A recorded remittance updates its payment history and eligible receivable balance.",
                "related": [],
                "open": "Use Billing insurance workspace in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "sales",
                "title": "Review sales and breakdowns",
                "category": "Reports",
                "route": "/billing/sales/branches",
                "purpose": "Review branch sales for the selected period.",
                "steps": [
                    "Select Period and choose Search to load the report. Use Patient or bill to narrow Billed Clients by identifier and Payment status or Transaction status to narrow the loaded bills. Clear filters resets the table criteria.",
                    "View chart breakdown opens the chart view. In each billed row, View Tests opens the test details, while the adjacent Actions dropdown includes receipt formats and other currently permitted actions. Closed sales are read-only and retain receipt and transaction-detail access.",
                    "Open review sales and breakdowns using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Select the branch and reporting period.",
                    "Review billed values, collections and outstanding balances in their respective summaries.",
                    "Use the chart or breakdown controls to inspect the selected period.",
                    "The period and branch match all figures being reviewed."
                ],
                "verify": "The period and branch match all figures being reviewed.",
                "recovery": "Check filters and the distinction between billing and collections before comparing totals.",
                "kind": "page",
                "concept": "Billing totals measure services charged. Collection totals measure money received. Different dates, refunds and outstanding balances can make those values differ.",
                "before": [
                    "Choose the intended branch and date range.",
                    "Identify whether you are reviewing billing or cash collections."
                ],
                "controls": [
                    {
                        "name": "Period filters",
                        "description": "Define the report scope."
                    },
                    {
                        "name": "Sales summaries",
                        "description": "Review billed values, collections and outstanding amounts by their labels."
                    },
                    {
                        "name": "Charts and breakdowns",
                        "description": "Open the available breakdown controls and inspect matching records."
                    }
                ],
                "example": {
                    "situation": "The billed value exceeds collections for the day.",
                    "action": "Review outstanding services and the dates of the payments.",
                    "expected": "Use the breakdown to distinguish unpaid billing from collections against earlier bills."
                },
                "after": "The reviewed report provides a scoped view of billing and collections.",
                "related": [],
                "open": "Use Billing & Sales → Daily Sales Report in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "suspended-billing",
                "title": "Suspend and resume a billing draft",
                "category": "Billing",
                "route": "/billing/suspended-transactions",
                "kind": "page",
                "purpose": "A suspended draft preserves billing work for later review. Resume the intended draft and review its current charges before final submission.",
                "concept": "A suspended draft preserves billing work for later review. Resume the intended draft and review its current charges before final submission.",
                "open": "Open Suspend and resume a billing draft from the Billing navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, payer, bill or invoice reference and the intended amount."
                ],
                "controls": [
                    {
                        "name": "Draft list",
                        "description": "Review patient, payer source and saved draft information."
                    },
                    {
                        "name": "Resume",
                        "description": "Open the selected draft for continued billing."
                    },
                    {
                        "name": "Remove",
                        "description": "Use the authorized deletion action only when the saved draft is no longer needed."
                    }
                ],
                "steps": [
                    "Open Suspended Transactions and locate the intended patient draft.",
                    "Review its payer source and saved context before resuming.",
                    "Resume the selected draft and review patient, services, prices and payment choices.",
                    "Complete the billing workflow or suspend the intended draft again as appropriate.",
                    "Check the resulting saved bill or remaining draft state before resuming another copy."
                ],
                "after": "The intended draft is resumed and its final saved state is clear.",
                "verify": "The intended draft is resumed and its final saved state is clear.",
                "recovery": "Refresh the list after an uncertain action. Check whether billing was already recorded before creating another transaction.",
                "example": {
                    "situation": "Billing is interrupted before the patient confirms all services.",
                    "action": "Suspend the draft and later resume that same patient draft.",
                    "expected": "The selected services can be reviewed before final billing."
                },
                "related": [
                    "prepare-bill"
                ]
            },
            {
                "slug": "organization-invoices",
                "title": "Create an organization invoice and record its payment",
                "category": "Payments",
                "route": "/billing/organization-invoices",
                "kind": "page",
                "purpose": "An organization invoice groups eligible bills for collection from that organization. Review selection, invoice balance and recorded payment separately.",
                "concept": "An organization invoice groups eligible bills for collection from that organization. Review selection, invoice balance and recorded payment separately.",
                "open": "Open Create an organization invoice and record its payment from the Billing navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, payer, bill or invoice reference and the intended amount."
                ],
                "controls": [
                    {
                        "name": "Organization and bill selection",
                        "description": "Choose the intended organization and eligible bills."
                    },
                    {
                        "name": "Generate invoice",
                        "description": "Review selected bill totals before creating the document."
                    },
                    {
                        "name": "Invoice detail",
                        "description": "Review status, included bills and balance; print or download the PDF."
                    },
                    {
                        "name": "Payment and void actions",
                        "description": "Record an authorized payment or use the permitted correction action with its required information."
                    }
                ],
                "steps": [
                    "Choose the intended organization and review eligible bills.",
                    "Select the bills to include and check their patient references, totals and eligibility.",
                    "Generate the invoice and open its detail. Verify organization, included bills, invoice total and balance.",
                    "Print or download the reviewed invoice when required.",
                    "When payment is received, enter the intended amount and required payment information against that invoice.",
                    "Review payment history and the remaining invoice balance. Use a void action only through its authorized correction workflow."
                ],
                "after": "The invoice document, included bill references, recorded payments and balance agree.",
                "verify": "The invoice document, included bill references, recorded payments and balance agree.",
                "recovery": "Do not include a bill merely because it belongs to a similarly named organization. Review eligibility and current invoice status before retrying generation or payment.",
                "example": {
                    "situation": "An organization pays part of an invoice.",
                    "action": "Record the actual payment amount against the correct invoice.",
                    "expected": "The remaining balance stays outstanding and payment history explains the receipt."
                },
                "related": [
                    "collect-payment",
                    "receipts",
                    "sales-session",
                    "refunds"
                ]
            },
            {
                "slug": "refunds",
                "title": "Request and review a billing refund",
                "category": "Payments",
                "route": "/billing/refund",
                "kind": "page",
                "purpose": "Refund actions depend on the active role and the original transaction. Review the financial history and authorization before requesting or approving a correction.",
                "concept": "Refund actions depend on the active role and the original transaction. Review the financial history and authorization before requesting or approving a correction.",
                "open": "Open Request and review a billing refund from the Billing navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the patient, payer, bill or invoice reference and the intended amount."
                ],
                "controls": [
                    {
                        "name": "Role-specific workspace",
                        "description": "The refund entry page directs the active role to its permitted refund task."
                    },
                    {
                        "name": "Original transaction",
                        "description": "Review the patient, bill and recorded payment evidence."
                    },
                    {
                        "name": "Refund decision",
                        "description": "Use the required request or administrative action with supporting evidence."
                    }
                ],
                "steps": [
                    "Open Refund Management using the authorized role.",
                    "Find the original transaction and verify its patient, amounts and prior corrections.",
                    "Review the permitted refund action and enter its required evidence.",
                    "Submit the request or decision through the existing approval workflow.",
                    "Check the resulting refund status and financial history before printing or communicating the outcome."
                ],
                "after": "The refund status and recorded amounts are traceable to the original transaction.",
                "verify": "The refund status and recorded amounts are traceable to the original transaction.",
                "recovery": "Requested, approved and paid/refunded states must be distinguished. Resolve financial-day and approval restrictions through the relevant controls.",
                "example": {
                    "situation": "A client requests return of money for a billed service.",
                    "action": "Review the original bill and payment and follow the available refund request process.",
                    "expected": "The financial correction remains supported by the original transaction and approval evidence."
                },
                "related": [
                    "collect-payment",
                    "receipts",
                    "sales-session",
                    "organization-invoices"
                ]
            },
            {
                "slug": "expense-request",
                "title": "Create an expense request",
                "category": "Expenses",
                "route": "/billing/expenses/create-new-expense",
                "kind": "page",
                "purpose": "An expense request records a cost for review. Approval and recording its actual payment are separate steps.",
                "concept": "An expense request records a cost for review. Approval and recording its actual payment are separate steps.",
                "open": "Open Billing → Expenses and select create an expense request, or use the task-page link in this procedure.",
                "before": [
                    "Confirm the branch, intended expense or invoice and payee.",
                    "Use the role and financial authority required for the requested action."
                ],
                "controls": [
                    {
                        "name": "Expense name and date",
                        "description": "Identify the cost and its intended date/time."
                    },
                    {
                        "name": "Merchant and category",
                        "description": "Choose the intended payee and expense classification from the loaded lists."
                    },
                    {
                        "name": "Amount and description",
                        "description": "Enter the requested amount and the required description."
                    },
                    {
                        "name": "Attachments",
                        "description": "Attach supporting receipts through the available upload workflow and review any upload failure."
                    },
                    {
                        "name": "Save and available next actions",
                        "description": "Review the saved request and the actions returned for the active user."
                    }
                ],
                "steps": [
                    "Open New Expense and wait for categories and merchants to load.",
                    "Enter the expense name, date, merchant, category, amount and description.",
                    "Review the intended payee, classification and amount together before saving.",
                    "Add supporting receipts through the available attachment workflow. Review any upload warning separately from request creation.",
                    "Save the request and note the saved expense reference.",
                    "Review its current approval and payment state and use only the available next action."
                ],
                "after": "The expense exists with the intended payee, amount, description and supporting evidence state.",
                "verify": "The expense exists with the intended payee, amount, description and supporting evidence state.",
                "recovery": "Resolve required fields and unavailable merchant/category lists before submitting. If receipt upload failed after request creation, continue from the saved expense instead of creating another request.",
                "example": {
                    "situation": "Staff incur a routine business cost.",
                    "action": "Create the request with the intended merchant, category, amount and evidence.",
                    "expected": "The expense is available for review with a clear saved reference."
                },
                "related": [
                    "expense-approval",
                    "expense-payment"
                ]
            },
            {
                "slug": "expense-approval",
                "title": "Review expenses awaiting approval",
                "category": "Expenses",
                "route": "/billing/expenses/awaiting-approval",
                "kind": "page",
                "purpose": "The approval queue separates requested costs from approved costs. Available decisions depend on the active user capabilities and approval controls.",
                "concept": "The approval queue separates requested costs from approved costs. Available decisions depend on the active user capabilities and approval controls.",
                "open": "Open Billing → Expenses and select review expenses awaiting approval, or use the task-page link in this procedure.",
                "before": [
                    "Confirm the branch, intended expense or invoice and payee.",
                    "Use the role and financial authority required for the requested action."
                ],
                "controls": [
                    {
                        "name": "Filters and selection",
                        "description": "Locate intended pending requests and select only records you have reviewed."
                    },
                    {
                        "name": "Expense details",
                        "description": "Inspect amount, description, paid/outstanding values, receipts and rejection history."
                    },
                    {
                        "name": "Approve / Reject",
                        "description": "Use the returned permitted decision with the required evidence."
                    },
                    {
                        "name": "View history",
                        "description": "Inspect the recorded expense action history."
                    }
                ],
                "steps": [
                    "Open Awaiting Approval and find the intended pending expense.",
                    "Open its details and confirm payee, amount, category and evidence.",
                    "Review the returned approval actions. Where offered, approve or reject using the required decision information.",
                    "For several requests, review every selected request before applying a bulk action.",
                    "Refresh the list and open history to verify the decision.",
                    "Pass an approved request to its permitted payment task rather than treating approval as payment."
                ],
                "after": "The recorded decision and remaining payment state are visible in the expense record.",
                "verify": "The recorded decision and remaining payment state are visible in the expense record.",
                "recovery": "A missing approval action indicates that its current capability or state does not permit the decision. Check limits and the latest request before retrying.",
                "example": {
                    "situation": "An expense has been submitted but no money has been paid.",
                    "action": "Review the request and record the authorized approval decision.",
                    "expected": "The expense can be approved while its payment remains outstanding."
                },
                "related": [
                    "expense-request",
                    "expense-payment"
                ]
            },
            {
                "slug": "expense-payment",
                "title": "Record an approved expense payment",
                "category": "Expenses",
                "route": "/billing/expenses/invoices",
                "kind": "page",
                "purpose": "Invoice and expense payment work records actual money paid. The selected funding account, amount, date and reference support financial traceability.",
                "concept": "Invoice and expense payment work records actual money paid. The selected funding account, amount, date and reference support financial traceability.",
                "open": "Open Billing → Expenses and select record an approved expense payment, or use the task-page link in this procedure.",
                "before": [
                    "Confirm the branch, intended expense or invoice and payee.",
                    "Use the role and financial authority required for the requested action."
                ],
                "controls": [
                    {
                        "name": "Invoice and expense details",
                        "description": "Confirm the intended payable document and amount still outstanding."
                    },
                    {
                        "name": "Payment account and method",
                        "description": "Choose the eligible funding source and supported payment method available to the user."
                    },
                    {
                        "name": "Payment date and reference",
                        "description": "Record when the payment occurred and its reference."
                    },
                    {
                        "name": "Payment history and reversal",
                        "description": "Review recorded payments and use a permitted financial correction workflow when necessary."
                    }
                ],
                "steps": [
                    "Find the intended invoice or approved expense and review the outstanding amount.",
                    "Open the available Record payment action.",
                    "Select the eligible authorized payment account and method. Review funding and any financial-control messages.",
                    "Enter the actual payment amount, date and reference as required.",
                    "Review the intended amount against the current outstanding balance before confirming.",
                    "Wait for the recorded confirmation and inspect payment history and the remaining amount.",
                    "If a correction is needed, use the available authorized reversal task with its required evidence."
                ],
                "after": "The payment history and remaining payable balance explain the money recorded.",
                "verify": "The payment history and remaining payable balance explain the money recorded.",
                "recovery": "Review approval, payment-account access, funds, financial-day restrictions and current outstanding balance when payment is rejected. Inspect history before retrying an uncertain result.",
                "example": {
                    "situation": "An approved expense is paid in two instalments.",
                    "action": "Record the actual first payment against the intended document and funding source.",
                    "expected": "The payment history shows that amount and the remaining balance stays outstanding."
                },
                "related": [
                    "expense-request",
                    "expense-approval"
                ]
            }
        ],
        "glossary": [
            {
                "term": "Billed value",
                "meaning": "The value charged for recorded services."
            },
            {
                "term": "Collection",
                "meaning": "Money recorded as received against billing."
            },
            {
                "term": "Outstanding",
                "meaning": "The amount still due after relevant payments and adjustments."
            },
            {
                "term": "Waiver",
                "meaning": "An authorized reduction of the amount to be collected."
            },
            {
                "term": "Recognized receivable",
                "meaning": "An accounting balance recorded as money owed to the facility."
            },
            {
                "term": "Remittance",
                "meaning": "A payment received from a payer such as NHIS against eligible balances."
            }
        ],
        "startPath": [
            "billing-to-receipt",
            "prepare-bill",
            "collect-payment",
            "receipts"
        ]
    },
    {
        "id": "inventory",
        "title": "Inventory",
        "description": "Purchasing, funded payments and departmental stock custody",
        "articles": [
            {
                "slug": "department-custody",
                "title": "From departmental request to stock usage",
                "category": "Stock workflow",
                "route": "/inventory/department-stock",
                "purpose": "Understand how stock custody moves between stores and clinical departments.",
                "kind": "workflow",
                "concept": "Understand how stock custody moves between stores and clinical departments. Each stage is performed by a person with the existing permission for that task.",
                "before": [
                    "Confirm the requesting department, stock item unit and requisition reference.",
                    "Agree who is responsible for the next handoff."
                ],
                "controls": [
                    {
                        "name": "Department",
                        "description": "Request items and quantities. Count and confirm physical receipt. Record actual usage, returns or losses."
                    },
                    {
                        "name": "Stores",
                        "description": "Review available stock and approve a quantity. Issue the approved stock."
                    }
                ],
                "steps": [
                    "Request items and quantities.",
                    "Review available stock and approve a quantity.",
                    "Issue the approved stock.",
                    "Count and confirm physical receipt.",
                    "Record actual usage, returns or losses."
                ],
                "verify": "The issued, received, unreceived and consumed figures must be explainable from movement history.",
                "recovery": "If a stage is blocked, review its record status, required information and responsible role before proceeding. For an uncertain save, inspect the recorded history before retrying.",
                "after": "The requisition and movement history explain quantities requested, approved, issued, received and used, including any unresolved shortage.",
                "example": {
                    "situation": "A department requests 10 units, stores issue 8 and only 7 arrive.",
                    "action": "Record the actual receipt of 7, investigate the unreceived unit and consume only from the received balance.",
                    "expected": "The issued, received, unreceived and consumed figures must be explainable from movement history."
                },
                "related": [
                    "department-stock",
                    "history",
                    "analytics"
                ],
                "open": "Use the task-page link to open the first stage. Continue through the linked guides using your authorized role.",
                "entryRoutes": [
                    "/inventory/department-stock",
                    "/inventory/expired-products/consumption-history",
                    "/inventory/analytics"
                ]
            },
            {
                "slug": "items",
                "title": "Find and review inventory items",
                "category": "Catalogue",
                "route": "/inventory/items",
                "purpose": "Review items and their stock definitions.",
                "steps": [
                    "Open find and review inventory items using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Search the items list and select the intended item.",
                    "Review its category, unit and available stock information.",
                    "Use the authorized item action and verify saved changes.",
                    "The correct item and unit are used in subsequent stock transactions."
                ],
                "verify": "The correct item and unit are used in subsequent stock transactions.",
                "recovery": "Check existing items before creating another record for the same product.",
                "kind": "page",
                "concept": "An item definition and unit control how quantities are interpreted in purchasing and stock movements. Review existing items before creating duplicates.",
                "before": [
                    "Know the item identity and intended stock unit.",
                    "Use the appropriate item management permission for edits."
                ],
                "controls": [
                    {
                        "name": "Item search",
                        "description": "Find existing items using available filters."
                    },
                    {
                        "name": "Item details",
                        "description": "Review category, units and stock information."
                    },
                    {
                        "name": "Item actions",
                        "description": "Use the authorized task for the selected item."
                    }
                ],
                "example": {
                    "situation": "A supplier uses a different name for an existing product.",
                    "action": "Search and review the item definition and units before creating another item.",
                    "expected": "Use the correct existing item when the product identity is confirmed."
                },
                "after": "Subsequent stock records use the selected item definition and units.",
                "related": [
                    "categories",
                    "units",
                    "locations",
                    "test-templates"
                ],
                "open": "Use Inventory → Items in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "purchase-orders",
                "title": "Create and review purchase orders",
                "category": "Purchasing",
                "route": "/inventory/orders",
                "purpose": "Prepare an order for the correct supplier and items.",
                "steps": [
                    "Open create and review purchase orders using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Review existing orders before creating a new purchase order.",
                    "Select the supplier and add the required items, quantities and costs.",
                    "Review totals and submit using the available order action.",
                    "The saved order appears with the correct supplier, lines and status."
                ],
                "verify": "The saved order appears with the correct supplier, lines and status.",
                "recovery": "Review approval and order status requirements before attempting receipt or payment.",
                "kind": "page",
                "concept": "A purchase order describes what is being ordered from a supplier. Order, receipt and payment records track different stages of procurement.",
                "before": [
                    "Confirm the supplier and intended items.",
                    "Check quantities, units and agreed costs before submission."
                ],
                "controls": [
                    {
                        "name": "Order list",
                        "description": "Review existing orders and their status."
                    },
                    {
                        "name": "Supplier and item lines",
                        "description": "Associate the order with the correct supplier and quantities."
                    },
                    {
                        "name": "Totals and order action",
                        "description": "Review costs and submit the order through the available workflow."
                    }
                ],
                "example": {
                    "situation": "A supplier is delivering an order for several stock items.",
                    "action": "Create or locate the correct order with the agreed item quantities and costs.",
                    "expected": "Use that order as the reference when reviewing receipt and payment tasks."
                },
                "after": "The saved order provides a reference for subsequent delivery and payment review.",
                "related": [
                    "receive-stock"
                ],
                "open": "Use Inventory → Purchase Orders → All Orders in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "receive-stock",
                "title": "Review goods receipts",
                "category": "Purchasing",
                "route": "/inventory/orders/received-items-history",
                "purpose": "Verify received items against purchasing records.",
                "steps": [
                    "Open review goods receipts using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Find the relevant order or receipt in the received items history.",
                    "Review the quantities, item identity and recorded batch details.",
                    "Compare the received details with the physical delivery and the original order.",
                    "The recorded delivery agrees with the received stock."
                ],
                "verify": "The recorded delivery agrees with the received stock.",
                "recovery": "Investigate discrepancies through the available receipt and incident workflows.",
                "kind": "page",
                "concept": "Goods receipt history records what was received against purchasing activity. Compare received quantities with the actual delivery and intended order.",
                "before": [
                    "Locate the purchase order or receipt reference.",
                    "Have the physical delivery evidence available for comparison."
                ],
                "controls": [
                    {
                        "name": "Receipt filters",
                        "description": "Find the relevant delivery."
                    },
                    {
                        "name": "Received item lines",
                        "description": "Review item identity, quantities and available batch details."
                    },
                    {
                        "name": "Order reference",
                        "description": "Compare the receipt to the intended purchasing record."
                    }
                ],
                "example": {
                    "situation": "The supplier delivery note lists fewer units than ordered.",
                    "action": "Review the received item history against the physical delivery and original order.",
                    "expected": "Use the authorized discrepancy process instead of assuming the full order was delivered."
                },
                "after": "The receipt history supports review of stock received and supplier fulfilment.",
                "related": [
                    "purchase-orders"
                ],
                "open": "Use Inventory → Purchase Orders → Received Items History in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "funded-payments",
                "title": "Pay an inventory supplier",
                "category": "Payments",
                "route": "/inventory/payments",
                "purpose": "Review the funding source before recording supplier payment.",
                "steps": [
                    "Open pay an inventory supplier using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Find the supplier payment or related order and review the amount due.",
                    "Select the payment method and eligible funding account. Review the available balance.",
                    "Enter the payment details, review the totals and confirm the authorized payment.",
                    "The payment history, supplier balance and accounting posting reflect the same amount."
                ],
                "verify": "The payment history, supplier balance and accounting posting reflect the same amount.",
                "recovery": "Insufficient funds and approval requirements must be resolved before payment. Review existing payment history before retrying.",
                "kind": "page",
                "concept": "Supplier payment needs an authorized funding source. Available funds account for posted balances and commitments, and are checked again when payment is confirmed.",
                "before": [
                    "Review the supplier, order and amount due.",
                    "You need payment access to an eligible funding account with sufficient available funds."
                ],
                "controls": [
                    {
                        "name": "Payment list and actions",
                        "description": "Find the intended payment and use its permitted approval or payment task."
                    },
                    {
                        "name": "Pay from account",
                        "description": "Select the cash, bank or mobile-money source funding the payment."
                    },
                    {
                        "name": "Funding review",
                        "description": "Compare posted balance, committed payments, available funds, this payment and remaining funds."
                    },
                    {
                        "name": "Payment method / Refresh account balances",
                        "description": "Use a method supported by the chosen account and refresh balances when necessary."
                    }
                ],
                "example": {
                    "situation": "An account has GH₵500 posted with GH₵100 committed. A new supplier payment is GH₵450.",
                    "action": "Review the GH₵400 available balance and the insufficient-funds warning.",
                    "expected": "Use another authorized funded source or resolve funding before confirming payment."
                },
                "after": "The recorded payment, supplier balance and accounting entries can be traced using their references.",
                "related": [
                    "payment-journal"
                ],
                "open": "Use Inventory → Payments → All Payments in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "payment-journal",
                "title": "Trace inventory payments",
                "category": "Payments",
                "route": "/inventory/payments/journal",
                "purpose": "Review journal information associated with inventory payments.",
                "steps": [
                    "Open Payments > Journal Entries. Use Search for a reference, account or description. Choose Date period or enter From and To. Narrow by Account code, Status, Source and Reference type, then Apply filters.",
                    "Use Reset filters to clear the scope. Loaded entries, Debits on this page and Credits on this page summarize the loaded page. They are not the complete period ledger totals. Review Date / entry, Account, Debit, Credit, Reference, Description and Status before exporting.",
                    "Open trace inventory payments using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Choose the reporting filters and find the relevant payment.",
                    "Review its reference, accounts and posted amounts.",
                    "Compare the entry with the related payment record.",
                    "The journal reference and amounts match the recorded transaction."
                ],
                "verify": "The journal reference and amounts match the recorded transaction.",
                "recovery": "Investigate missing or failed postings through the accounting controls.",
                "kind": "page",
                "concept": "The journal view explains the accounting side of inventory payments. The reference links the amounts and accounts to the operational payment.",
                "before": [
                    "Know the payment or order reference.",
                    "Choose the period and filters covering the transaction."
                ],
                "controls": [
                    {
                        "name": "Report filters",
                        "description": "Narrow the payment journal to the intended scope."
                    },
                    {
                        "name": "Account and amount columns",
                        "description": "Review which accounts received the posted amounts."
                    },
                    {
                        "name": "Transaction reference",
                        "description": "Match journal information with the related inventory payment."
                    },
                    {
                        "name": "Journal status and source",
                        "description": "Status supports draft, posted, cancelled and reversed. Source supports supplier, inventory, billing and accounting. The journal is read-only and active filters apply to exports."
                    }
                ],
                "example": {
                    "situation": "A supplier payment appears in the operational history.",
                    "action": "Find its reference in the payment journal and compare the amount and funding information.",
                    "expected": "Investigate a missing or failed posting through the accounting controls."
                },
                "after": "The reviewed journal information supports reconciliation with payment records.",
                "related": [
                    "funded-payments"
                ],
                "open": "Use Inventory → Payments → Journal Entries in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "department-stock",
                "title": "Approve and issue departmental stock",
                "category": "Department stock",
                "route": "/inventory/department-stock",
                "purpose": "Review laboratory and imaging requisitions and custody.",
                "steps": [
                    "Open Inventory > Department stock to reach Stores requisition desk. Select Receiving department as Laboratory or Imaging and confirm the active branch before reviewing or changing any request.",
                    "In Review & issue, choose the Request status filter: Awaiting approval, Ready to issue, Awaiting receipt, Delivery shortages, Available to consume or Rejected. Use Filter department requests for the item or request reference. An empty result means no rows match the current department and filters.",
                    "For a pending request, choose Approve. Review the item, unit, Requested and Available in stores. Enter Approved quantity: it may be lower or higher than Requested, but must be positive and within available stores stock. Explain an adjustment before Confirm action. To reject instead, use Reject and give the required reason.",
                    "For an approved request, choose Issue. Review Approved and Quantity to issue rather than assuming the original Requested quantity will be issued. Confirm only when handing over the approved goods. Verify Issued and Awaiting receipt afterward. The department must record physical receipt before using its received stock.",
                    "Review Received, Unreceived and Available after the department confirms receipt. A short receipt creates a reported Stock receipt discrepancy incident identifying the item, request and difference. Work with the receiver to investigate it; do not replace the actual receipt with an invented matching quantity.",
                    "When investigation confirms the unreceived goods are back in stores, use Return unreceived stock to stores, enter the reconciled quantity and supporting reason, then Confirm action. For confirmed loss in transit, use Record transit loss with the required explanation instead. Verify the remaining Unreceived quantity.",
                    "Record findings and follow-up in Incident Reporting. Clearing the stock discrepancy does not automatically close the incident’s investigation workflow. Retain the request/incident references and movement history as evidence.",
                    "Use Movement history to verify approval, issue and reconciliation quantities, dates, staff and notes. Use Department analytics for the selected department. If authorized to manage access, Staff permissions reviews independent request, receive, consume/loss/return and approve/issue grants for employees in the current branch and department.",
                    "Reconcile stores, departmental custody and company stock. Starting with 100 Pieces, issuing and receiving 8 leaves Stores 92 and departmental custody 8. Consuming 2 leaves Stores 92, custody 6 and company stock 98. Internal issues are custody transfers, not consumption."
                ],
                "verify": "Issue and receipt history identify the department, quantities and responsible staff.",
                "recovery": "Investigate receipt shortages. Resolve unreceived stock using the authorized return or transit-loss actions with supporting reasons. No requests match this department and filter means there are no matching rows in the current branch and department scope. Review the department, status and search before assuming the requisition was lost.",
                "kind": "page",
                "concept": "Stores control approval and issue. The receiving department confirms actual custody, then records its own consumption. Unreceived stock remains distinct from available department stock.",
                "before": [
                    "Review department, item and available store quantity.",
                    "Use the applicable approve and issue permissions."
                ],
                "controls": [
                    {
                        "name": "Request status",
                        "description": "Filter Awaiting approval, Ready to issue, Awaiting receipt or Delivery shortages."
                    },
                    {
                        "name": "Approved quantity",
                        "description": "Approve above or below the request within available store stock."
                    },
                    {
                        "name": "Issue",
                        "description": "Record issue after approval."
                    },
                    {
                        "name": "Unreceived and available quantities",
                        "description": "Track shortages and received stock separately. Authorized shortage actions resolve unreceived quantities."
                    },
                    {
                        "name": "Staff permissions",
                        "description": "This authorized view is separate from Review & issue, Department analytics and Movement history. Requesting, receiving and consuming access are reviewed independently."
                    },
                    {
                        "name": "Issue confirmation",
                        "description": "Approved and Quantity to issue show the actual amount that will be issued, which can differ from Requested. Verify the item and unit before Confirm action."
                    }
                ],
                "example": {
                    "situation": "A department requests 300 units. Stores decide to approve 500 and have sufficient stock.",
                    "action": "Enter 500 as the approved quantity, confirm approval, then issue it.",
                    "expected": "Review the department actual receipt. Investigate any difference before resolving the unreceived balance."
                },
                "after": "Each handoff and quantity is retained in the department movement history.",
                "related": [],
                "open": "Use Inventory → Department stock in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "consumption",
                "title": "Record inventory consumption",
                "category": "Stock movements",
                "route": "/inventory/consumption",
                "purpose": "Record authorized stock usage.",
                "steps": [
                    "Open record inventory consumption using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Select the intended stock item and review the available quantity and unit.",
                    "Enter the consumed quantity and the available usage details.",
                    "Review and confirm the movement. For department-held stock, use that department requisition workspace.",
                    "The movement history and remaining quantity agree with recorded usage."
                ],
                "verify": "The movement history and remaining quantity agree with recorded usage.",
                "recovery": "Use the separate loss or wastage workflow for those events and supply the required reason.",
                "kind": "page",
                "concept": "Consumption records actual usage. Stock issued to a department is consumed from that department received balance through its own workspace.",
                "before": [
                    "Confirm the item unit and available stock.",
                    "Use the correct general or departmental stock workflow for the custody being consumed."
                ],
                "controls": [
                    {
                        "name": "Item and quantity",
                        "description": "Select the product and quantity actually used."
                    },
                    {
                        "name": "Usage details",
                        "description": "Review the available movement context before confirming."
                    },
                    {
                        "name": "Department workspace",
                        "description": "Use departmental consumption actions for stock held by laboratory or imaging."
                    }
                ],
                "example": {
                    "situation": "An imaging team uses 6 units from its received department stock.",
                    "action": "Record the usage in the imaging requisition workspace against its available received balance.",
                    "expected": "Review the remaining quantity and movement history there."
                },
                "after": "Actual consumption reduces the relevant stock balance and appears in movement history.",
                "related": [
                    "history"
                ],
                "open": "Use Inventory → Stock Consumption in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "history",
                "title": "Review an item consumption history",
                "category": "Stock movements",
                "route": "/inventory/expired-products/consumption-history",
                "purpose": "Trace the movements of a selected inventory item.",
                "steps": [
                    "Open Expired Products > Consumption History. This page reviews recorded usage and wastage involving expired stock. For wider departmental usage, use the department workspace Movement history instead.",
                    "Choose Inventory item to search for one item, or retain All items. Select Date period or From date and To date, then Apply filters. Review Recorded movements and use Reset filters when the scope hides expected records.",
                    "Open review an item consumption history using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Select the item from the item list.",
                    "Review the available history and period filters.",
                    "Compare consumption, wastage, loss and return totals with the listed movements.",
                    "The selected item, unit and reporting period are consistent across the history."
                ],
                "verify": "The selected item, unit and reporting period are consistent across the history.",
                "recovery": "Check the item and date filters before concluding a movement is missing.",
                "kind": "page",
                "concept": "Item history separates consumption, wastage, loss and returns. Select the correct item and reporting period before interpreting the totals.",
                "before": [
                    "Know the item and stock unit.",
                    "Use a period that includes the movement being investigated."
                ],
                "controls": [
                    {
                        "name": "Item list",
                        "description": "Select the item whose history you want to inspect."
                    },
                    {
                        "name": "Period filters",
                        "description": "Set the relevant date scope."
                    },
                    {
                        "name": "Movement totals and history",
                        "description": "Compare totals by movement type with the individual records."
                    },
                    {
                        "name": "Loaded history summary",
                        "description": "Loaded records, Affected items on this page and Expired wastage on this page describe the displayed results. Review Batch / brand, Expiry date, Quantity / recorded date, Recorded by and Reason / notes. Filters also apply to exports."
                    }
                ],
                "example": {
                    "situation": "A team wants to explain why glove stock reduced.",
                    "action": "Select gloves and the relevant period.",
                    "expected": "Review consumption separately from wastage, loss and returns, then inspect the matching movement records."
                },
                "after": "The filtered history identifies the movements contributing to the selected item totals.",
                "related": [
                    "consumption"
                ],
                "open": "Use Inventory → Expired Products → Consumption History in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "analytics",
                "title": "Understand stock analytics",
                "category": "Reports",
                "route": "/inventory/analytics",
                "purpose": "Review purchasing, stock levels and movement trends.",
                "steps": [
                    "Open understand stock analytics using Open task page in this procedure. Confirm the page and active branch match your intended work.",
                    "Select the relevant reporting period and available filters.",
                    "Review the overview charts and open the appropriate stock, cost or movement report.",
                    "Compare report totals with the underlying items and transactions.",
                    "The displayed period, units and scope agree with the records being compared."
                ],
                "verify": "The displayed period, units and scope agree with the records being compared.",
                "recovery": "Different reports measure purchases, custody and consumption separately. Review their labels and filters before comparing totals.",
                "kind": "page",
                "concept": "Inventory reports describe different measures such as purchasing, stock balances, costs and usage. Consistent dates, units and scope are necessary when comparing them.",
                "before": [
                    "Choose the period and relevant branch or scope where available.",
                    "Identify the measure you need before interpreting a chart."
                ],
                "controls": [
                    {
                        "name": "Overview charts",
                        "description": "Review the current reporting summary."
                    },
                    {
                        "name": "Report categories",
                        "description": "Choose stock levels, movement, procurement, costs or usage as needed."
                    },
                    {
                        "name": "Report filters and detail",
                        "description": "Use matching periods and inspect underlying records when reconciling a total."
                    },
                    {
                        "name": "Stock levels",
                        "description": "Current balances and reorder monitoring. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Movement",
                        "description": "Inventory movements and velocity. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Usage",
                        "description": "Consumption and utilization. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Cost valuation",
                        "description": "Inventory valuation detail. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Purchase orders",
                        "description": "Procurement status and orders. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Procurement",
                        "description": "Lead times and fulfilment. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Suppliers",
                        "description": "Supplier performance and spend. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Payments",
                        "description": "Supplier payment analysis. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Payment timing",
                        "description": "Payment timelines and trends. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Batch expiry",
                        "description": "Expiry risk and batch monitoring. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Costs",
                        "description": "Cost trends and comparisons. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Item analytics",
                        "description": "Detailed individual item history. Open from Explore inventory reports. Review the report filters and underlying records before comparing its totals."
                    },
                    {
                        "name": "Company on hand / Department or in transit / Available in stores",
                        "description": "Company on-hand stock includes department custody. The watchlist distinguishes reserved departmental or in-transit quantity from the quantity available in stores."
                    }
                ],
                "example": {
                    "situation": "Purchases increased while usage remained low.",
                    "action": "Compare procurement and usage reports for the same period and relevant scope.",
                    "expected": "Review stock levels and item movement records to explain the difference."
                },
                "after": "The comparison helps explain procurement, holding and consumption activity.",
                "related": [],
                "open": "Use Inventory → Analytics Dashboard → Overview in the workspace navigation. Menu wording depends on your active role. The Open task page button opens the same register or form directly."
            },
            {
                "slug": "categories",
                "title": "Create and maintain inventory categories",
                "category": "Catalogue",
                "route": "/inventory/categories",
                "kind": "page",
                "purpose": "Categories organize inventory items. Review existing category names and item membership before changing the catalogue.",
                "concept": "Categories organize inventory items. Review existing category names and item membership before changing the catalogue.",
                "open": "Open Create and maintain inventory categories from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "Name",
                        "description": "Enter a meaningful category name."
                    },
                    {
                        "name": "Description",
                        "description": "Explain the intended grouping."
                    },
                    {
                        "name": "View, edit and delete",
                        "description": "Use the authorized action for the selected category and review its item count."
                    }
                ],
                "steps": [
                    "Search the category list for an existing suitable group.",
                    "Use the add task to enter the category name and description.",
                    "Review and save the category.",
                    "Reopen it or find it in the list and verify the saved values.",
                    "Before editing or deleting, review the category item count and any returned dependency restrictions."
                ],
                "after": "The category appears with its saved name and description and is used for the intended item grouping.",
                "verify": "The category appears with its saved name and description and is used for the intended item grouping.",
                "recovery": "A category already used by items may be subject to deletion restrictions. Review the server message and item assignments.",
                "example": {
                    "situation": "Two product types need separate catalogue grouping.",
                    "action": "Review existing categories and create only the missing group.",
                    "expected": "Items can be assigned to the intended existing or new category."
                },
                "related": [
                    "items",
                    "units",
                    "locations",
                    "test-templates"
                ]
            },
            {
                "slug": "units",
                "title": "Configure inventory units",
                "category": "Catalogue",
                "route": "/inventory/units",
                "kind": "page",
                "purpose": "Units define the meaning of stock quantities. A box, pack and individual unit must be distinguished when defining an item and interpreting its movements.",
                "concept": "Units define the meaning of stock quantities. A box, pack and individual unit must be distinguished when defining an item and interpreting its movements.",
                "open": "Open Configure inventory units from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "Name and description",
                        "description": "Define a clear unit label and meaning."
                    },
                    {
                        "name": "Standard status",
                        "description": "Review whether the unit is a standard definition."
                    },
                    {
                        "name": "Unit actions",
                        "description": "View or manage the selected unit through the available action."
                    }
                ],
                "steps": [
                    "Find the intended unit before adding another one.",
                    "Create a missing unit using a clear name and description.",
                    "Save and verify the unit in the list.",
                    "When configuring an item, review how its purchase and consumption units are represented.",
                    "Check units again when reviewing quantities on orders, receipts and departmental movements."
                ],
                "after": "Staff can interpret the item quantity using the saved unit definitions.",
                "verify": "Staff can interpret the item quantity using the saved unit definitions.",
                "recovery": "Do not infer a pack-to-unit conversion from the name alone. Review the actual item unit configuration and any standard-unit edit restrictions.",
                "example": {
                    "situation": "A supplier delivers packs but a department reports usage in individual units.",
                    "action": "Review the item unit configuration before interpreting either quantity.",
                    "expected": "Purchase and consumption records use the intended definitions."
                },
                "related": [
                    "items",
                    "categories",
                    "locations",
                    "test-templates"
                ]
            },
            {
                "slug": "suppliers",
                "title": "Create and maintain supplier details",
                "category": "Purchasing",
                "route": "/inventory/suppliers",
                "kind": "page",
                "purpose": "Supplier records identify the organization associated with purchasing and payment. Accurate contact information helps distinguish similar supplier names.",
                "concept": "Supplier records identify the organization associated with purchasing and payment. Accurate contact information helps distinguish similar supplier names.",
                "open": "Open Create and maintain supplier details from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "Name and contact",
                        "description": "Enter the supplier identity and contact person."
                    },
                    {
                        "name": "Email, phone and address",
                        "description": "Review the intended supplier communication details."
                    },
                    {
                        "name": "Supplier actions",
                        "description": "View or manage the selected record through available actions."
                    }
                ],
                "steps": [
                    "Search for the supplier before creating another record.",
                    "Use the add or permitted edit task for the intended supplier.",
                    "Review name, contact, email, phone and address.",
                    "Save and verify the record in the supplier list.",
                    "Confirm the supplier identity again when selecting it for an order or payment."
                ],
                "after": "The intended supplier is available for purchasing and payment references.",
                "verify": "The intended supplier is available for purchasing and payment references.",
                "recovery": "Review dependency and validation messages before editing or deleting a supplier with transaction history.",
                "example": {
                    "situation": "Two suppliers have similar trading names.",
                    "action": "Use contact information and record details to identify the correct one.",
                    "expected": "The purchase order references the intended supplier."
                },
                "related": [
                    "purchase-orders",
                    "receive-stock"
                ]
            },
            {
                "slug": "locations",
                "title": "Configure storage locations",
                "category": "Catalogue",
                "route": "/inventory/locations",
                "kind": "page",
                "purpose": "Storage locations describe where inventory is held and relevant storage conditions. Location settings should reflect the actual storage arrangement.",
                "concept": "Storage locations describe where inventory is held and relevant storage conditions. Location settings should reflect the actual storage arrangement.",
                "open": "Open Configure storage locations from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "Name, description and capacity",
                        "description": "Identify the storage location and its configured capacity."
                    },
                    {
                        "name": "Temperature controlled and range",
                        "description": "Record temperature-control information where applicable."
                    },
                    {
                        "name": "Hazardous materials and active status",
                        "description": "Review the storage classification and whether the location is in use."
                    }
                ],
                "steps": [
                    "Review existing locations before adding another.",
                    "Enter the location name, description and capacity.",
                    "Review temperature-control settings and temperature range when applicable.",
                    "Review hazardous-material and active status fields.",
                    "Save and reopen the location to verify the configured conditions."
                ],
                "after": "The location record reflects its intended physical storage use.",
                "verify": "The location record reflects its intended physical storage use.",
                "recovery": "Review field validation and item dependencies before modifying or deleting a location. Verify physical conditions separately from the saved configuration.",
                "example": {
                    "situation": "A store introduces a temperature-controlled cabinet.",
                    "action": "Record its location and applicable control information.",
                    "expected": "The saved location is identifiable and its settings match the intended cabinet."
                },
                "related": [
                    "items",
                    "categories",
                    "units",
                    "test-templates"
                ]
            },
            {
                "slug": "test-templates",
                "title": "Configure test material templates",
                "category": "Catalogue",
                "route": "/inventory/templates",
                "kind": "page",
                "purpose": "A test material template associates a test with stock items and expected quantities. The saved unit determines how a material requirement is interpreted.",
                "concept": "A test material template associates a test with stock items and expected quantities. The saved unit determines how a material requirement is interpreted.",
                "open": "Open Configure test material templates from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "Template name and test",
                        "description": "Identify the template and associated test."
                    },
                    {
                        "name": "Item selection",
                        "description": "Choose the stock item required by the test."
                    },
                    {
                        "name": "Quantity and unit",
                        "description": "Review each material quantity and unit before saving."
                    }
                ],
                "steps": [
                    "Find an existing template for the intended test.",
                    "Create or edit through the available template action.",
                    "Review the associated test and add the required material items.",
                    "Set each material quantity using its displayed unit.",
                    "Review the full item list and save.",
                    "Reopen the template and verify its test association and material quantities."
                ],
                "after": "The material template records the intended test requirements and quantities.",
                "verify": "The material template records the intended test requirements and quantities.",
                "recovery": "A template does not prove that stock was physically consumed. Review the actual consumption or service material workflow and its recorded movement.",
                "example": {
                    "situation": "A test routinely needs gloves and another consumable.",
                    "action": "Configure the required items and quantities in its template.",
                    "expected": "Subsequent material planning can reference the saved requirements."
                },
                "related": [
                    "items",
                    "categories",
                    "units",
                    "locations"
                ]
            },
            {
                "slug": "wastage",
                "title": "Review stock wastage records",
                "category": "Stock movements",
                "route": "/inventory/wastage",
                "kind": "page",
                "purpose": "Wastage history explains stock removed as waste rather than productive consumption. Review type, quantity, reason and responsible staff.",
                "concept": "Wastage history explains stock removed as waste rather than productive consumption. Review type, quantity, reason and responsible staff.",
                "open": "Open Review stock wastage records from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "History filters",
                        "description": "Find the relevant period, item or transaction."
                    },
                    {
                        "name": "Wasted quantity and type",
                        "description": "Review the movement classification and unit."
                    },
                    {
                        "name": "Reason and responsible staff",
                        "description": "Read the explanation and recorded actor before drawing a conclusion."
                    }
                ],
                "steps": [
                    "Choose the relevant history filters.",
                    "Locate the item or transaction under review.",
                    "Review batch information, wasted quantity, wastage type, reason and notes.",
                    "Compare the event with the item movement history and relevant department custody record.",
                    "Use incident reporting when the evidence requires investigation."
                ],
                "after": "The wastage explanation is supported by the recorded movement and its reason.",
                "verify": "The wastage explanation is supported by the recorded movement and its reason.",
                "recovery": "Do not combine productive consumption with waste or loss when explaining stock use. Check the item, period and classification.",
                "example": {
                    "situation": "An item balance reduced after a damaged batch was discarded.",
                    "action": "Review the wastage history and compare the batch and quantity with the movement record.",
                    "expected": "The stock reduction has a recorded classification and explanation."
                },
                "related": [
                    "consumption",
                    "history",
                    "expiry"
                ]
            },
            {
                "slug": "expiry",
                "title": "Review expired inventory batches",
                "category": "Stock movements",
                "route": "/inventory/expired-products",
                "kind": "page",
                "purpose": "Expiry reporting identifies batches requiring review. An expired-batch listing and a recorded disposal or wastage event represent different stages.",
                "concept": "Expiry reporting identifies batches requiring review. An expired-batch listing and a recorded disposal or wastage event represent different stages.",
                "open": "Open Review expired inventory batches from the Inventory navigation, or use the task-page link in this procedure. Confirm the branch before selecting a record.",
                "before": [
                    "Sign in using the active role authorized for this procedure.",
                    "Confirm the item, unit, supplier or stock document reference used by this procedure."
                ],
                "controls": [
                    {
                        "name": "Batch list and filters",
                        "description": "Find the relevant item and expired batch."
                    },
                    {
                        "name": "Expiry and remaining quantity",
                        "description": "Review the date and stock still associated with the batch."
                    },
                    {
                        "name": "Batch detail and history",
                        "description": "Inspect available recorded movements before determining the next authorized action."
                    }
                ],
                "steps": [
                    "Review the relevant expired-product filters.",
                    "Confirm the item identity, batch number, expiry date and remaining quantity.",
                    "Compare the listed information with the physically held stock.",
                    "Follow the available authorized wastage or disposal workflow when removal is required.",
                    "Review the resulting movement history and batch balance."
                ],
                "after": "The expired batch is identified and any authorized removal is supported by its stock movement record.",
                "verify": "The expired batch is identified and any authorized removal is supported by its stock movement record.",
                "recovery": "A listing does not prove disposal. Verify the actual movement and required evidence before treating expired stock as removed.",
                "example": {
                    "situation": "A store finds an expired batch on a shelf.",
                    "action": "Confirm its identity and quantity and follow the authorized removal process.",
                    "expected": "The physical removal and stock history agree."
                },
                "related": [
                    "consumption",
                    "history",
                    "wastage"
                ]
            },
            {
                "slug": "receive-delivery",
                "title": "Receive an order into stock",
                "category": "Purchasing",
                "route": "/inventory/orders",
                "kind": "page",
                "purpose": "Record the actual delivered quantities, costs and batch information against the selected purchase order.",
                "concept": "Receiving stock records an actual delivery against an order. Partial delivery is recorded using the quantities physically received. Batch, expiry and cost information must be reviewed before confirming.",
                "open": "Open Inventory → Purchase Orders → All Orders and select Create Order. Use Receive Order on the intended eligible order to open Receive stock.",
                "before": [
                    "Confirm the destination facility/branch, supplier, stock item and stock unit.",
                    "Use the existing purchasing, approval and receiving permissions. A job title alone does not grant authority.",
                    "Count the delivered units and inspect condition, batch, expiry and cost documents before receipt."
                ],
                "controls": [
                    {
                        "name": "Quantity received",
                        "description": "Enter the quantity arriving now, using the displayed unit. Review remaining order quantities."
                    },
                    {
                        "name": "Receive all remaining",
                        "description": "Fill outstanding quantities only after confirming all of those items physically arrived."
                    },
                    {
                        "name": "Unit cost",
                        "description": "Review the non-negative cost for each selected item."
                    },
                    {
                        "name": "Expiry date",
                        "description": "Enter the received batch expiry when applicable."
                    },
                    {
                        "name": "Automatic batch / batch number",
                        "description": "Keep automatic generation enabled when a batch number is not supplied. A manually selected batch requires its number."
                    },
                    {
                        "name": "Pricing",
                        "description": "Where the context permits, review wholesale and retail values. The price dialog offers percentage increase, fixed increase or manual prices and shows expected profit per item."
                    },
                    {
                        "name": "Additional receiving details",
                        "description": "Review Received date, Condition and Notes. Condition choices include Good, Acceptable, Damaged and Expired."
                    },
                    {
                        "name": "Receive stock",
                        "description": "Review selected item count and purchase subtotal before confirming receipt."
                    }
                ],
                "steps": [
                    "On Purchase Orders, select Create Order to open Create Purchase Order. Select Supplier and review Supplier Contact. Enter Expected Delivery Date when known.",
                    "Choose Communication Method only as intended. Do not send a supplier email or SMS during a training exercise. Use Communication Notes and General Notes for relevant order context.",
                    "In Order Items, use Add Item. Choose Item, enter Qty and review Unit and Cost. Repeat Add Item for the remaining requested items, then review the totals. Select Create Order to save, or Create & receive only if you intend to continue immediately to receiving.",
                    "Record the saved Order Number and reopen the same order. Review its status and the available Receive Order action. Pending Approvals on this list concerns supplier-payment requests; do not confuse payment approval with stock receipt. Follow any additional facility purchasing approval process.",
                    "Open Receive stock for that same order. Compare the outstanding ordered quantities with the delivery. Enter Quantity received only for items physically accepted; leave other rows at zero.",
                    "Review Unit cost, Expiry date and batch for each received row. Keep Automatic batch selected if no supplier batch is provided; otherwise enter Batch number. Review Pricing only if you are authorized to change it.",
                    "Complete Received date, Condition and Notes. If damaged, expired or missing units exist, stop and follow the relevant rejection/discrepancy procedure; do not assume a descriptive Condition choice adjusts quantities automatically.",
                    "Select Receive stock once. Reopen Received Items History and the order. Confirm quantities, batch, dates, costs and remaining units.",
                    "Compare the item’s stock and valuation before and after receipt. A partial delivery must leave the unreceived quantity outstanding.",
                    "Supplier payment is a separate authorized task. Use an eligible funded account and the actual payment method and amount; receiving stock does not prove payment."
                ],
                "after": "The delivery is recorded against the order and its stock and receipt records can be reviewed.",
                "verify": "The order’s receipt history identifies the actual item, quantity, batch and cost. Stock increases only by accepted received units. Remaining order quantities and valuation reconcile with the recorded receipt.",
                "recovery": "After an uncertain response, inspect Received Items History and stock before trying again. For a disabled receipt action, review order status and receiving permission. Resolve damaged/expired stock through the correct exception workflow; do not inflate Quantity received.",
                "example": {
                    "situation": "An approved training order requests 10 units at GH₵5.00 each; only 6 acceptable units arrive.",
                    "action": "Receive 6 at unit cost 5.00 and record the batch and receipt date. Leave undelivered items at zero.",
                    "expected": "Arithmetic target: 6 units received, 4 outstanding and GH₵30.00 received value before any configured additional costs. This example is illustrative until the live receipt test is completed."
                },
                "related": [
                    "purchase-orders",
                    "receive-stock",
                    "funded-payments"
                ],
                "pilot": {
                    "reviewedAt": "5 November 2026",
                    "status": "Source reviewed — live purchase and receipt pending",
                    "checked": [
                        "Reviewed Create Purchase Order and Receive stock forms, received quantities, costs, automatic batch and receipt metadata.",
                        "Opened Create Order and Add Item in the live application; confirmed Create Order and Create & receive buttons. No order was saved."
                    ],
                    "pending": [
                        "Purchase creation, approval and stock receipt have not yet been performed in the current pilot facility. No stock increase is claimed.",
                        "The purchase-order capture was clipped during browser resizing and was excluded from the manual. A complete screenshot must be captured before this pilot is marked illustrated."
                    ],
                    "exercise": "In the training environment, create an order for 10 units. Receive only 6, reopen its receipt history and demonstrate 4 units remaining. Record the order and receipt references, batch and valuation; do not send supplier messages or record a real payment.",
                    "fields": [
                        {
                            "name": "Supplier",
                            "rule": "Required in Create Purchase Order. Choose the actual approved supplier.",
                            "mistake": "A similarly named supplier is not necessarily the correct payee."
                        },
                        {
                            "name": "Item / Qty / Unit / Cost",
                            "rule": "Select the inventory item and check its stock unit and positive ordered quantity; review the unit cost.",
                            "mistake": "A box and an individual unit are not interchangeable quantities."
                        },
                        {
                            "name": "Quantity received",
                            "rule": "Enter only actual accepted units for this receipt. Zero skips an item; do not exceed the displayed remaining order quantity.",
                            "mistake": "Receive all remaining must not be used for a partial delivery."
                        },
                        {
                            "name": "Unit cost",
                            "rule": "Non-negative, in the item’s displayed unit and company currency.",
                            "mistake": "A zero training cost is not appropriate for a real purchased item."
                        },
                        {
                            "name": "Automatic batch / Batch number",
                            "rule": "Keep automatic generation selected when no supplier batch is available; otherwise enter the genuine batch.",
                            "mistake": "Do not overwrite a genuine manufacturer batch merely for convenience."
                        },
                        {
                            "name": "Received date / Condition / Notes",
                            "rule": "Record the actual delivery context. Review damaged or expired stock through the relevant exception process.",
                            "mistake": "Selecting Condition alone is not proof that rejected units were excluded from stock."
                        }
                    ],
                    "screenshots": []
                }
            }
        ],
        "glossary": [
            {
                "term": "Requisition",
                "meaning": "A request by a department for stock from stores."
            },
            {
                "term": "Approved quantity",
                "meaning": "The quantity stores authorize, which can differ from the request."
            },
            {
                "term": "Issued quantity",
                "meaning": "The quantity recorded as sent by stores."
            },
            {
                "term": "Received quantity",
                "meaning": "The quantity the department confirms it physically received."
            },
            {
                "term": "Consumption",
                "meaning": "Actual use of stock from the relevant available balance."
            },
            {
                "term": "Available funds",
                "meaning": "The amount available for payment after posted balances and commitments are considered."
            }
        ],
        "startPath": [
            "department-custody",
            "items",
            "purchase-orders",
            "receive-stock"
        ]
    }
];
export function availableWorkspaceArticles(module: WorkspaceLearningModule, role: unknown, settings: NavigationSettings & {
    moduleConfiguration?: unknown;
    smsActivated?: number | boolean | null;
} = {}) {
    if (!canAccessRolePage(role, `/${module.id}/guide`, settings) ||
        (!isSuperAdminRole(role) && !canAccessFacilityModule(`/${module.id}/guide`, settings.moduleConfiguration, settings))) return [];
    const permitted = (route: string) => canAccessRolePage(role, route, settings) &&
        (isSuperAdminRole(role) || canAccessFacilityModule(route, settings.moduleConfiguration, settings));
    return module.articles.flatMap(article => {
        const route = (article.entryRoutes || [article.route]).find(permitted);
        return route ? [{ ...article, route }] : [];
    });
}
export function searchWorkspaceArticles(articles: WorkspaceArticle[], query: string) {
    const search = query.trim().toLowerCase();
    return articles.filter(article => [article.title, article.category, article.route, article.purpose, article.concept,
        article.open, ...article.before, ...article.controls.flatMap(control => [control.name, control.description]),
        ...article.steps, article.after, article.verify, article.recovery, ...Object.values(article.example)]
        .join(' ').toLowerCase().includes(search));
}
