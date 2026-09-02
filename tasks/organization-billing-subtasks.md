# Partner Billing and Pharmacy Implementation Subtasks

This backlog is ordered by dependency. Each task ships behind tenant feature flags and includes role/tenant isolation tests.

## Milestone 0: Product Decisions and Technical Design

- [ ] **M0.1 Resolve commercial policy:** partner markup, cancellation, approval thresholds, sample-before-approval, and result acknowledgement.
- [ ] **M0.2 Resolve pharmacy policy:** reservation timing, substitutions, partial fulfilment, returns, controlled-drug scope, and retention.
- [ ] **M0.3 Confirm role matrix:** organization admin, partner biller, clinician, reviewer, receiver, scientist, signatory, dispenser, and storekeeper.
- [ ] **M0.4 Threat-model partner access:** entity isolation, IDOR prevention, session invalidation, CSRF, rate limiting, and PHI logging.
- [ ] **M0.5 Approve state machines:** align backend, frontend, audit, and reporting vocabulary with the PRD.
- [ ] **M0.6 Define API schemas:** requests, responses, errors, pagination, idempotency, and optimistic concurrency.
- [ ] **M0.7 Produce UX prototypes:** mobile order creation, held-order correction, approval queue, consultation orders, and dispensing.

**Exit:** Release 1 product decisions are closed and signed-off schemas exist.

## Milestone 1: Partner Identity and Portal Foundation

### Backend

- [ ] **M1.1 Add partner account model** with tenant, type, billing entity, status, settings, and audit metadata.
- [ ] **M1.2 Add partner user memberships** with entity-scoped roles and uniqueness constraints.
- [ ] **M1.3 Implement invitation lifecycle:** create, expire, revoke, resend, accept, and first-password setup.
- [ ] **M1.4 Add partner session claims** without accepting tenant or billing entity from client input.
- [ ] **M1.5 Add account suspension** that invalidates active sessions.
- [ ] **M1.6 Add authorization policies** and cross-tenant/cross-entity denial tests.

### Frontend

- [ ] **M1.7 Add `/partner` route and layout** with a shell independent of `PrimeLayout`.
- [ ] **M1.8 Build partner login and activation** with generic authentication errors and accessible validation.
- [ ] **M1.9 Build responsive navigation:** expandable desktop rail, mobile bottom navigation, notifications, and profile menu.
- [ ] **M1.10 Establish portal design tokens** for color, type, spacing, focus, statuses, motion, and print.
- [ ] **M1.11 Create shared states** for loading, actionable empty state, recoverable error, forbidden, and suspended account.
- [ ] **M1.12 Extend middleware routing** so partner users stay under `/partner` and internal roles do not enter it accidentally.

### Validation

- [ ] **M1.13 Test authentication boundaries** for missing, expired, suspended, partner, clinician, and internal sessions.
- [ ] **M1.14 Run responsive/accessibility checks** at 360px, tablet, desktop, keyboard-only, and reduced motion.

**Exit:** pilot partner users can authenticate and see an empty, entity-scoped workspace.

## Milestone 2: Contract Catalogue and Patient Workflow

### Backend

- [ ] **M2.1 Add versioned partner price lists** with effective dates, currency, activation, and service availability.
- [ ] **M2.2 Add price-list assignment commands** for authorized center users.
- [ ] **M2.3 Add partner catalogue endpoint** returning only assigned active services and read-only prices.
- [ ] **M2.4 Add partner patient search** with bounded results and entity/tenant privacy policy.
- [ ] **M2.5 Add patient registration** with normalized identifiers and configurable duplicate matching.
- [ ] **M2.6 Audit price assignment and patient creation** without unnecessary PHI in logs.

### Frontend

- [ ] **M2.7 Build center price-list administration** with version history, effective-date checks, preview, and activation confirmation.
- [ ] **M2.8 Build partner patient directory** with search, pagination, and recent patients.
- [ ] **M2.9 Build patient registration** with duplicate warnings and explicit selection of existing matches.
- [ ] **M2.10 Build service catalogue picker** grouped by discipline with search, read-only prices, availability, and preparation notes.

### Validation

- [ ] **M2.11 Test price effective dates and snapshots** across deactivated, changed, future, current, and past cases.
- [ ] **M2.12 Test patient isolation and duplicate behavior** including direct-ID attempts.

**Exit:** a partner selects a permitted patient and sees only its current contract catalogue.

## Milestone 3: Order Drafting and Submission

### Backend

- [ ] **M3.1 Add partner order and line models** with revision, status, source, patient, sample plan, and reference.
- [ ] **M3.2 Add draft CRUD** with ownership checks and optimistic concurrency.
- [ ] **M3.3 Add submission validation** for patient, service, price version, sample plan, and declarations.
- [ ] **M3.4 Snapshot submitted lines and totals** including service name, price, currency, revision, and hash.
- [ ] **M3.5 Make submit idempotent** so retries cannot create duplicate bills.
- [ ] **M3.6 Add order list/detail queries** with filters, paging, activity timeline, and entity scope.

### Frontend

- [ ] **M3.7 Build four-step order workspace** for Patient, Services, Sample Plan, and Review.
- [ ] **M3.8 Add draft autosave and recovery** with saved, saving, and error indicators.
- [ ] **M3.9 Build responsive order summary** with read-only pricing, currency, test count, and total.
- [ ] **M3.10 Build dashboard attention queue** and status metrics from live order data.
- [ ] **M3.11 Build order list** with status, patient, age, total, next action, filters, and mobile rows.
- [ ] **M3.12 Build order detail** with stage tracker, tabs, decision panel, timeline, and documents.

### Validation

- [ ] **M3.13 Test autosave and retries** for stale drafts, refresh, network loss, and double submit.
- [ ] **M3.14 Add end-to-end partner order test** from patient selection through pending approval.

**Exit:** an order reaches `PENDING_APPROVAL` exactly once with an immutable submitted snapshot.

## Milestone 4: Center Approval Workflow

### Backend

- [ ] **M4.1 Add billing decision model** with revision, snapshot hash, action, reason, actor, and time.
- [ ] **M4.2 Implement approve command** with role, revision, transaction, and idempotency checks.
- [ ] **M4.3 Implement hold and reject** with required reason and separate partner-visible/staff-only notes.
- [ ] **M4.4 Implement held-order revision** so edits never mutate the reviewed snapshot.
- [ ] **M4.5 Add approval queue query** with aging, branch, entity, amount, priority, and decision filters.
- [ ] **M4.6 Publish decision notifications** to the partner inbox and optional external channels.

### Frontend

- [ ] **M4.7 Build dense approval queue** with saved filters, aging indicators, and text-start tables.
- [ ] **M4.8 Build split-pane review** with duplicates, contract comparison, test details, total, and timeline.
- [ ] **M4.9 Build approval confirmation** showing the exact revision and total to freeze.
- [ ] **M4.10 Build hold/reject dialogs** with reason, optional note, limits, and focus management.
- [ ] **M4.11 Build held-order correction** with highlighted requests and resubmission summary.
- [ ] **M4.12 Add partner notification center** with unread state and order deep links.

### Validation

- [ ] **M4.13 Test decision races:** duplicate approval, approve-versus-hold, stale revision, mismatch, and unauthorized reviewer.
- [ ] **M4.14 Add end-to-end decision tests** for approve, hold/resubmit, and reject.

**Exit:** every submitted bill gets a traceable decision and approved data cannot be edited in place.

## Milestone 5: Sample Handoff and Processing Guard

### Backend

- [ ] **M5.1 Add specimen plan and identifiers** linked to partner order lines and existing accessions.
- [ ] **M5.2 Add chain-of-custody events** for collect, dispatch, receive, quarantine, reject, and recollect.
- [ ] **M5.3 Implement receipt policy** for approved and policy-permitted pending orders.
- [ ] **M5.4 Add central approval guard service** that verifies order revision and decision snapshot.
- [ ] **M5.5 Apply the guard to every processing entry point** including single, bulk, alternate UI, and direct APIs.
- [ ] **M5.6 Audit blocked processing attempts** with stable reason codes and correlation IDs.
- [ ] **M5.7 Map partner progress states** without exposing draft clinical data.

### Frontend

- [ ] **M5.8 Build partner collection form** for collector, time, specimen IDs, dispatch, and manifest.
- [ ] **M5.9 Build center receiving view** with condition, discrepancies, quarantine, rejection, and custody timeline.
- [ ] **M5.10 Add approval status to laboratory workspaces** with an actionable blocker panel.
- [ ] **M5.11 Disable processing commands consistently** while keeping the API authoritative.
- [ ] **M5.12 Add partner sample timeline** using plain-language states and expected next action.

### Validation

- [ ] **M5.13 Inventory every processing endpoint** and prove each is guarded through integration tests.
- [ ] **M5.14 Add end-to-end handoff tests** for partner collection, center collection, quarantine, and approved processing.

**Exit:** no UI path or direct request starts processing without a valid current approval.

## Milestone 6: Result Validation and Partner Release

### Backend

- [ ] **M6.1 Add report release record** linked to signed report version, order, partner, actor, and time.
- [ ] **M6.2 Enforce signed-and-validated precondition** on release.
- [ ] **M6.3 Add partner report queries/download** limited to released versions and owning entity.
- [ ] **M6.4 Add corrected-report replacement** retaining prior versions and release history.
- [ ] **M6.5 Add report acknowledgement** and notification delivery status.

### Frontend

- [ ] **M6.6 Add Submit to Partner command** with report/version confirmation.
- [ ] **M6.7 Build partner results inbox** with new/corrected state, patient, order, release time, and acknowledgement.
- [ ] **M6.8 Build report viewer/download** with signature metadata and safe print behavior.
- [ ] **M6.9 Show release state in order timeline** without internal validation notes.

### Validation

- [ ] **M6.10 Test unreleased-result denial** through lists, details, guessed IDs, downloads, and corrections.
- [ ] **M6.11 Add end-to-end release test** through partner acknowledgement.

**Exit:** partners access only explicitly released, validated, signed report versions.

## Milestone 7: Structured Consultation and Investigations

### Backend

- [ ] **M7.1 Define structured consultation schema** for notes, diagnoses, plan, follow-up, investigations, and medications.
- [ ] **M7.2 Preserve legacy notes** through a read-only adapter; never parse generated prose as the new source of truth.
- [ ] **M7.3 Add investigation commands** for laboratory and imaging services with indication and priority.
- [ ] **M7.4 Derive billing context from encounter** and validate it on the server.
- [ ] **M7.5 Add narrative renderer** for reports and existing consultation views.
- [ ] **M7.6 Add investigation timeline query** for consultation status.

### Frontend

- [ ] **M7.7 Replace free-text card grid with tabs:** Clinical Note, Investigations, Medications, Plan & Follow-up.
- [ ] **M7.8 Build structured clinical-note editor** with autosave, validation, and narrative preview.
- [ ] **M7.9 Build investigation composer** with service search, indication, priority, summary, and billing confirmation.
- [ ] **M7.10 Embed downstream status timeline** without the generic billing-source chooser.
- [ ] **M7.11 Keep previous consultations accessible** and label legacy narrative records.

### Validation

- [ ] **M7.12 Test legacy display and new record round-trip** without data loss.
- [ ] **M7.13 Add end-to-end investigation test** from consultation to downstream status.

**Exit:** clinicians create structured investigations without re-entering billing context.

## Milestone 8: Pharmacy Catalogue and Inventory

### Backend

- [ ] **M8.1 Create pharmacy medication master** separate from laboratory sensitivity drugs.
- [ ] **M8.2 Add branch/location stock** with batches, expiry, on-hand, reserved, quarantined, and available quantities.
- [ ] **M8.3 Add stock receipt and adjustment** with permissions, reason, and append-only movements.
- [ ] **M8.4 Implement FEFO availability** excluding expired, quarantined, and inactive batches.
- [ ] **M8.5 Add low-stock and near-expiry queries** with configurable thresholds.
- [ ] **M8.6 Add opening-balance import** with validation, dry run, and signed import report.

### Frontend

- [ ] **M8.7 Build pharmacy catalogue** with generic/brand identity, form, strength, unit, barcode, and status.
- [ ] **M8.8 Build batch receiving workspace** with expiry, location, quantity, unit cost, and labels.
- [ ] **M8.9 Build stock ledger** with movement filters and immutable source links.
- [ ] **M8.10 Build low-stock and near-expiry queues** with export and action filters.

### Validation

- [ ] **M8.11 Test stock invariants** so available equals on-hand minus reserved and quantities never become negative.
- [ ] **M8.12 Reconcile opening balances** against signed source totals before enablement.

**Exit:** each pilot branch has trusted pharmacy stock by item, location, batch, and expiry.

## Milestone 9: Prescribing and Dispensing

### Backend

- [ ] **M9.1 Add prescription and line models** with dose instructions, source, status, and signature.
- [ ] **M9.2 Validate prescriptions** for required fields, allergies, duplicates, active item, and permissions.
- [ ] **M9.3 Implement immutable signing** plus discontinue/reorder for changes.
- [ ] **M9.4 Implement internal reservation** with transactional FEFO batch allocation.
- [ ] **M9.5 Implement full and partial dispense** with identity check, batches, movement, and remainder.
- [ ] **M9.6 Implement cancellation and release** plus authorized return movements.
- [ ] **M9.7 Implement external issue** that creates a document and never calls inventory commands.
- [ ] **M9.8 Add concurrency controls** preventing over-reservation and over-dispensing.

### Frontend

- [ ] **M9.9 Build medication composer** for drug, strength, dose, route, frequency, duration, quantity, instructions, and source.
- [ ] **M9.10 Show safety warnings** for allergies, duplicates, unavailable items, and incomplete dosing.
- [ ] **M9.11 Build dispensary queue** ordered by priority and waiting time with branch filters.
- [ ] **M9.12 Build dispense workspace** with patient banner, safety context, batches, partial fulfilment, and confirmation.
- [ ] **M9.13 Build external prescription document** with prescriber, patient, instructions, signature, and print layout.
- [ ] **M9.14 Add patient/consultation status** for reserved, ready, partial, dispensed, unavailable, and external.

### Validation

- [ ] **M9.15 Add concurrency tests** for reserve, dispense, cancel, and adjustment operations.
- [ ] **M9.16 Add end-to-end internal test** from signed prescription to stock movement.
- [ ] **M9.17 Add end-to-end external test** proving no reservation or stock movement occurs.

**Exit:** internal dispensing is auditable and stock-safe; external prescriptions are inventory-neutral.

## Milestone 10: Reporting, Hardening, and Rollout

- [ ] **M10.1 Build dashboards** for approval aging, partner volume, rejection reasons, TAT, acknowledgement, stock, expiry, and dispensing.
- [ ] **M10.2 Add audit explorer** with actor, subject, action, date, and correlation filters.
- [ ] **M10.3 Add monitoring and alerts** for failed decisions, guard conflicts, notification failures, stock errors, and release failures.
- [ ] **M10.4 Complete performance testing** for search, queues, order detail, report download, and dispense transactions.
- [ ] **M10.5 Complete accessibility audit** for core desktop/mobile workflows and remediate WCAG 2.2 AA failures.
- [ ] **M10.6 Complete penetration/privacy review** including entity access, IDOR, sessions, and sensitive logs.
- [ ] **M10.7 Create runbooks** for recovery, stuck orders, reversal policy, report correction, reconciliation, and rollback.
- [ ] **M10.8 Train pilot users** and capture completion time, errors, and support questions.
- [ ] **M10.9 Run pilot reconciliation** across bills, samples, reports, and stock movements.
- [ ] **M10.10 Roll out by feature flag** with checkpoints and a named rollback decision owner.

**Exit:** operational owners approve production rollout and monitoring confirms data integrity.

## Cross-Cutting Test Matrix

Each applicable milestone covers:

- [ ] Happy path and empty state.
- [ ] Validation and recoverable API errors.
- [ ] Unauthorized role, wrong tenant, and wrong partner entity.
- [ ] Direct URL and guessed resource ID access.
- [ ] Duplicate requests and idempotent retry.
- [ ] Stale version and concurrent command conflict.
- [ ] Audit contents without secret or unnecessary PHI leakage.
- [ ] Desktop, tablet, and 360px mobile layouts.
- [ ] Keyboard navigation, focus restoration, labels, errors, and contrast.
- [ ] Loading, slow network, interruption, and refresh recovery where relevant.

## Suggested Release Slices

| Release | Milestones | User value |
| --- | --- | --- |
| Release 1 | M0-M4 | Partners create bills; center reviews and decides |
| Release 2 | M5-M6 | Approved orders move through samples to released results |
| Release 3 | M7 | Consultation creates structured investigations |
| Release 4 | M8-M9 | Prescriptions support internal dispensing and external issue |
| Hardening | M10 throughout | Secure, accessible, observable production rollout |