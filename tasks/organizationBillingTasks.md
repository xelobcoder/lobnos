# Partner Billing and Pharmacy Initiative

This folder contains the product and implementation plan for a new partner-facing billing workflow and the pharmacy/dispensary extension.

## Product Goal

Give approved organizations and clinicians a dedicated workspace where they can register patients, create laboratory orders using prices assigned by the center, submit bills for center approval, track samples and results, and receive final reports. Add structured investigation and medication ordering to consultation, with internal dispensing backed by inventory and external prescriptions recorded for the patient.

## Non-Negotiable Rules

1. A partner cannot define or edit the center's contract price.
2. A bill must be approved before sample processing can start.
3. Hold and rejection actions require a reason and create an audit event.
4. Approval freezes the bill lines and prices. Any later edit creates a revision that requires approval again.
5. Only validated and signed results can be submitted to a partner.
6. Internal medication orders reserve and issue tracked stock; external prescriptions never reduce internal stock.
7. Organization and clinician users see only records owned by their billing entity.

## Documents

- [Product requirements](./organization-billing-prd.md)
- [Workflow maps](./flowmap.md)
- [Implementation subtasks](./organization-billing-subtasks.md)

## Recommended Delivery

- **Release 1:** Identity, partner portal, contract pricing, bill submission, and center approval queue.
- **Release 2:** Sample handoff, processing guard, partner tracking, and signed-result delivery.
- **Release 3:** Structured investigation ordering, prescriptions, internal pharmacy inventory, and dispensing.

The detailed acceptance criteria and unresolved policy decisions are maintained in the PRD.