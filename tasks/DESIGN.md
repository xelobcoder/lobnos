# Lobnos Partner Billing – UI/UX Design Specification

**Status:** Design Reference

**Target Product:** Lobnos LIMS – Partner Workspace, Pharmacy, and Laboratory Extensions

**Last Updated:** 2026-09-01 (rev. 2 — closed gaps against the PRD, flow maps, and subtasks)

**Rev. 2 changes:** added the missing Login/Onboarding, Patients, Results, Team, Settings, and Notifications Center screens (all named in navigation but previously unspecified); added the internal-state-to-tracker mapping table and a Cancelled conditional panel to Order Detail; added the contract-mismatch reviewer banner and the sample quarantine / processing-guard blocker UI (flow map exception paths and sequence diagram §3); added report version history for corrected results; added a Print & Document Output section; added session-expiry/suspension UX; and resolved the dark-mode checklist ambiguity by explicitly scoping it out of Releases 1–3.

---

## 1. Design Principles

1. **One obvious next action:** Each order shows its current owner, blocker, and next action.
2. **Server-enforced safety:** UI locks explain policy; APIs enforce it.
3. **Immutable decisions:** Approval records preserve line items, prices, actor, time, and reason.
4. **Progressive disclosure:** Partners see simple operational language; center staff retain detailed LIMS stages.
5. **Accessible by default:** Keyboard operation, visible focus, semantic labels, and WCAG 2.2 AA contrast.
6. **No hidden stock movement:** Every reservation, issue, reversal, and adjustment is traceable.

---

## 2. Visual Direction

### Character & Aesthetic

- **Character:** Calm clinical operations desk; precise, bright, and document-led.
- **Primary Use Case:** Fast, repeatable order creation and tracking with operational transparency.

### Color Palette

| Color | Hex Value | Usage |
| --- | --- | --- |
| Ink | `#172126` | Primary text, headings |
| Teal | `#087F73` | Primary actions, active states, navigation indicators |
| Signal Green | `#2D7A46` | Success states, approved status |
| Amber | `#B66A09` | Warnings, hold status, attention-required |
| Red | `#B42318` | Error states, rejection, critical alerts |
| Cool Canvas | `#F4F7F6` | Backgrounds, subtle dividers |
| White | `#FFFFFF` | Primary surfaces, card backgrounds |

**Avoid:** Blue/purple-dominant themes; reserved for internal dashboards.

### Typography

- **Interface Text:** "Manrope" (default), with approved fallbacks (System fonts as secondary)
- **Report Titles & Emphasis:** "Source Serif 4" (patient names, result headlines in documents only)
- **Scale:** Follow Bootstrap's scale; use semantic sizing (fs-6, fs-5, fw-semibold, etc.)
- **Line Height:** 1.4 for readability; 1.6 for long passages

### Shape & Borders

- **Border Radius:** 6px for controls, panels, and cards
- **Buttons:** Default rectangular; **no pill-shaped buttons for general actions**
- **Status Badges:** May use pill shapes for visual distinction
- **Border Color:** Use `var(--bs-border-color)` for consistency with Bootstrap theme

### Density

- **Philosophy:** Operationally compact; favor tables, split panes, and timelines over decorative cards
- **Spacing:** Consistent use of Bootstrap spacing utilities (mb-3, p-3, gap-2)
- **Card Usage:** Only for grouped information; avoid redundant card nesting
- **Table Layout:** Text-start aligned for readability; sticky headers on scrollable tables

### Motion & Animation

- **Page Entry:** Short fade-in (200-300ms)
- **Status Updates:** Staged transitions with visual emphasis
- **Accessibility:** Always respect `prefers-reduced-motion` preference
- **Avoid:** Decorative animations, rapid transitions, or hover-only reveals

### Icons

- **Library:** Remix Icon (existing project dependency)
- **Icon-Only Actions:** Always include accessible name (`aria-label` or tooltip)
- **Sizing:** 16px–24px for interface; 48px for empty states
- **Color:** Match text color or use semantic colors (green for success, red for error)

---

## 3. Navigation Architecture

### Route Structure

#### Partner Workspace
```
/partner/login
/partner/dashboard
/partner/patients
/partner/patients/new
/partner/orders
/partner/orders/new
/partner/orders/[orderId]
/partner/results
/partner/team                    (organization administrators only)
/partner/settings
```

**Session Context:** `partnerType: 'organization' | 'clinician'`  
Use session context to apply permissions and wording (e.g., "My referrals" vs. "Our orders")

#### Center Operations
```
/billing/partner-approvals
/billing/partner-approvals/[orderId]
/operations/laboratory/...       (existing workflow, guarded by approval status)
/doctor/consultation/[clientId]
/pharmacy/dispensary
/pharmacy/prescriptions/[prescriptionId]
/inventory/pharmacy/items
/inventory/pharmacy/batches
```

### Desktop Navigation Model

- **Top Bar:** 
  - Slim white bar with partner identity, branch switcher, notifications, help, and profile menu
  - Fixed at viewport top
  - Height: 56px (Bootstrap standard)

- **Left Navigation Rail:**
  - 72px icon-only width; expands to 232px on hover or click
  - Vertical stack of primary sections
  - Active section indicator: 3px teal (`#087F73`) bar on left
  - Icons + labels displayed in expanded state
  - Section icon color changes to teal when active
  - Smooth expand/collapse animation (200ms)

- **Active Section Styling:**
  - Background: `var(--bs-tertiary-bg)`
  - Icon color: Teal `#087F73`
  - Label visibility: Always shown in expanded state
  - Indicator: 3px teal left border

### Mobile Navigation Model

- **Bottom Navigation:**
  - Four primary destinations: Home, Orders, Patients, Results
  - Accessible labels below icons
  - Active destination highlighted in teal
  - Fixed at viewport bottom
  - Height: 64px (touch-friendly)

- **Secondary Actions:**
  - "More" menu as fifth tab or swipeable carousel
  - Team, Settings, and Help accessible from More menu or top-right profile menu

- **Top Bar on Mobile:**
  - Partner name/logo on left
  - Notifications and profile on right
  - No branch switcher (assume current session branch)

---

## 4. Component Specifications

### Login & Onboarding

**Purpose:** Cover the account lifecycle in FR-1 (invitation, first login, password setup, suspension) — the workflow that gets a partner user into the workspace at all.

#### Invitation Acceptance (`/partner/login` deep link)

- A single-column, unbranded-rail layout (no left nav — the person isn't authenticated yet)
- Confirms the invited email and partner entity name; does not reveal whether the invite has already been used
- Password-setup form: password + confirm, strength meter, and the visible complexity rules (not just a tooltip)
- Terms acceptance checkbox (required) per "first login requires... acceptance of terms"
- Expired or revoked invitations show a plain message and a "Request a new invitation" contact path, never a generic 404

#### Standard Login

- Email + password; "Forgot password" link
- Generic error copy on failure ("Incorrect email or password") regardless of whether the account exists, per FR-1's non-enumeration requirement
- After a suspension (entity or individual user), a fresh login attempt shows a plain "This account is no longer active" message — not a stack trace or blank redirect — with a support contact path
- No "remember me" persistence beyond the standard session cookie lifetime; session expiry redirects back to login with the originally-requested page preserved for after re-auth

### Patients

**Purpose:** Browse and manage the partner's own patient list outside the New Order flow (`/partner/patients`, `/partner/patients/new`).

- Search and table share the same fields as New Order Step 1 (Name, ID, Age, Phone) plus a "Last order" column so staff can spot a returning patient at a glance
- Row action opens a read-only patient summary with a "New order for this patient" shortcut that jumps straight to New Order Step 2
- `/partner/patients/new` reuses the exact registration form and duplicate-warning behavior from New Order Step 1, so a patient can be registered without starting an order
- Empty state: "No patients yet" + "Register a patient" button

### Results

**Purpose:** A dedicated, filterable view of released reports (`/partner/results`) — the Order Detail Documents tab is per-order; this is the partner's full history.

- Table columns: Patient, Order #, Test(s), Released date, Acknowledged (yes/no), Actions
- Filter by date range and acknowledgement status
- Row action opens the same Order Detail → Documents tab rather than duplicating the download UI
- Acknowledging a result from this list (per FR-6 audit requirement) uses the same recorded acknowledgement action as Order Detail

### Team (Organization Administrators Only)

**Purpose:** Manage partner users within one billing entity (`/partner/team`), scoped to FR-1's "organization administrators can invite users only within their entity."

- Table: Name, Email, Role, Status (Active/Invited/Suspended), Last login
- "Invite user" opens a form limited to the roles the inviting admin is permitted to assign
- Suspend/reactivate requires a confirmation dialog explaining that suspension invalidates active sessions immediately
- Clinician-type accounts see this route only if their account model supports multiple users (Open Decision #5 in the PRD) — until resolved, single-user clinician accounts do not show Team in navigation at all, rather than showing an empty/disabled screen

### Settings

**Purpose:** Personal and entity-level preferences (`/partner/settings`) — kept deliberately small for Release 1.

- **Profile:** name, phone, password change, notification channel opt-ins (email/SMS, per FR-10 tenant policy)
- **Entity info (organization administrators only):** billing entity name and contact details as read-only display — pricing, contracts, and active-service assignment remain center-controlled and are never editable from Settings, consistent with Non-Negotiable Rule #1
- No branch-level or workflow configuration lives here; that stays a center/admin capability outside the partner workspace

### Notifications Center

**Purpose:** A persistent, reviewable list behind the top-bar bell icon, covering FR-10's in-app notification categories (bill decisions, sample receipt exceptions, released results, prescription readiness) beyond the momentary toasts used for the action that triggered them.

- Bell icon in the top bar shows an unread-count badge; opens a dropdown (desktop) or full-screen list (mobile)
- Each entry: icon by category, one-line summary, relative timestamp, and a link to the relevant order/result
- Unread entries have a subtle left accent bar; "Mark all as read" action
- This list is additive to, not a replacement for, the toasts already specified per-action (e.g., "Order approved") — toasts confirm the action just taken; the Notifications Center is the durable record for anything received asynchronously (e.g., a decision made while the partner was offline)

### Dashboard

**Purpose:** Entry point showing key metrics and recent activity.

#### Layout
- **Section 1: "Needs Your Attention"** (top priority)
  - Returned bills (with amber alert icon)
  - Missing sample details (with amber alert icon)
  - Newly released results (with green success icon)
  - Each item is actionable; clicking navigates to the related order/result

- **Section 2: Quick Metrics** (compact cards)
  - Draft orders count
  - Awaiting decision count (pending approval)
  - Sample in progress count
  - Results ready for review count
  - Layout: Four equal-width cards on desktop; stack on mobile
  - Style: Border + rounded corners (6px), no shadows; light background when applicable
  - Metric value: Large, bold text (fs-5 fw-bold)
  - Metric label: Small, muted text (fs-6 text-muted)

- **Section 3: Recent Orders** (text-start aligned table)
  - Columns: Patient, Order Number, Submitted, Amount, Status, Next Action
  - Sortable by date submitted (descending by default)
  - Status badges use semantic colors (amber for pending, green for approved, teal for in progress)
  - "Next Action" column shows one primary button or instruction text
  - Scrollable on mobile; sticky header on all views
  - Empty state: Icon + message + "New order" button

#### Header
- Persistent **New order** command in top bar or header
- On mobile: Floating action button or top-aligned button that does not cover content
- Loading state: Spinner inside the button with loading text

### New Order Workflow

**Purpose:** Guided four-step process for creating an order with draft autosave.

#### Structure
- **Fixed Summary Rail (Desktop):**
  - Right column (280px); sticky to viewport
  - Shows draft patient, selected services, sample plan, and running total
  - Updates in real-time as user progresses
  - On mobile: Collapsible panel above content or bottom drawer
  - Pricing always visible and read-only (no user edits)

- **Step Indicators:**
  - Horizontal flow on desktop: Step 1 > Step 2 > Step 3 > Step 4
  - Visual: Connected circles with step number; current step filled with teal, completed steps green
  - Mobile: Vertical timeline with step labels
  - Clicking a completed step returns to that step (no "go back" button needed)

#### Step 1: Patient

**Goal:** Select existing patient or register new.

- **Search Area:**
  - Text input with magnifying glass icon; placeholder: "Search by name, ID, phone"
  - Search triggers on input change with debounce (500ms)
  - Results show Name, ID, Age, Phone in a dropdown list
  - Each result is keyboard/screen-reader accessible
  - Show "No results" message if search yields nothing

- **Register New Patient:**
  - Link or button: "Register new patient"
  - Opens inline form below search (not a modal)
  - Required fields: First Name, Last Name, Date of Birth, Phone (if available)
  - Optional fields: Email, National ID, Address
  - **Duplicate Warning:** After entry, show potential matches above the registration form
    - Matches include name similarity and phone number matches
    - User confirms: "This is a new patient" or selects existing match
    - Warning styling: Amber background with warning icon
  
- **Selection State:**
  - Chosen patient appears in the summary rail
  - Cannot proceed to Step 2 without a patient selection
  - Button: "Continue to services" (enabled only when patient selected)

#### Step 2: Services

**Goal:** Select laboratory tests from center-assigned price list.

- **Search & Filter:**
  - Text input: "Search services" (e.g., "CBC", "Glucose")
  - Filter/group by discipline (Hematology, Chemistry, Immunology, etc.)
  - Keyboard navigation supported; autocomplete shows matching services

- **Service List:**
  - Grouped by discipline (collapsible sections)
  - Each service shows:
    - Service name (primary text)
    - Service code (secondary, muted)
    - Price in currency (right-aligned, bold)
    - Checkbox to select
  - Selected services appear in the summary rail with prices updating in real time
  - Sorting: Alphabetical within each group; groups appear in configured order

- **Selection State:**
  - At least one service must be selected
  - Button: "Confirm services" (enabled only when ≥1 service selected)
  - Total cost updates in summary rail

#### Step 3: Sample Plan

**Goal:** Specify collection method and acknowledge preparation requirements.

- **Collection Location:**
  - Radio buttons:
    - "Collected at our facility" (partner collects; show containers and preparation)
    - "Collected at center" (center performs phlebotomy)
  - Selection drives the guidance shown below

- **Container & Preparation Guidance:**
  - If partner collection: Show per-service container type, volume, preparation (fasting, etc.)
  - Table layout:
    - Columns: Service, Container, Volume, Preparation, Notes
    - Rows: One per selected service
  - If center collection: Show message "Center will provide containers; patient should follow standard preparation"

- **Selection State:**
  - Both collection method and acknowledgment required
  - Checkbox: "I understand the sample collection and preparation requirements"
  - Button: "Review order" (enabled when both confirmed)

#### Step 4: Review & Submit

**Goal:** Final validation, total confirmation, and submission with idempotency key.

- **Header:**
  - "Review order" title
  - Validation summary (green checkmark for each completed step)
  - Any validation errors appear in an error panel at top (text-start aligned, red icon)

- **Patient Summary:**
  - Name, ID, Age, contact phone
  - Uneditable (read-only display)
  - Link: "Change patient" (returns to Step 1)

- **Services Summary:**
  - Table: Service, Code, Price, Quantity (all read-only)
  - Subtotal, tax (if applicable), total prominently displayed
  - Currency symbol aligned right
  - Link: "Change services" (returns to Step 2)

- **Sample Plan Summary:**
  - Collection location and any special instructions
  - Link: "Change plan" (returns to Step 3)

- **Partner Reference (Optional):**
  - Text input: "Your reference number or note"
  - Character limit: 100
  - Displayed on all future order communications

- **Clinical Notes (Optional):**
  - Text area: "Clinical indication or special instructions"
  - Character limit: 500
  - Sent to center with order

- **Submission Declaration:**
  - Checkbox (required to proceed):
    - "I confirm that this patient has provided informed consent and that the information provided is accurate."
  - Next to checkbox: Help icon with tooltip explaining consent requirements

- **Submission Actions:**
  - Primary button: "Submit order" (enabled only when all required fields and declarations complete)
  - Secondary button: "Save as draft" (always available; closes the workflow and returns to dashboard)
  
- **Post-Submission:**
  - Show success confirmation: "Order submitted successfully"
  - Display new order number, reference, and amount
  - Button: "View order" (navigates to Order Detail)
  - Button: "Create another order" (resets form, returns to Step 1)

- **Draft Autosave:**
  - Automatically save after each field change (debounce 2 seconds)
  - Toast notification (non-intrusive): "Draft saved" appears in bottom corner for 2 seconds
  - Restore draft on page reload using session/browser storage
  - Clear drafts after successful submission or when user explicitly clears them

### Order Detail Page

**Purpose:** Display single order with status tracking, financial record, and audit history.

#### Header
- **Order Number:** Large, bold text (fs-4)
- **Patient Name:** Bold text, slightly smaller
- **Status Badge:** Semantic color (teal for pending, green for approved, amber for hold, red for rejected)
- **Total Amount:** Currency-formatted, bold
- **Primary Next Action:** One prominent button or call-to-action
  - Examples: "Review feedback", "Edit and resubmit", "View sample", "View results"

#### Status Tracker

**Desktop:** Horizontal connected timeline

- Partner-facing steps: Submitted → Awaiting Review → Approved → Sample in Progress → Results Ready → Complete
- Current step filled with teal; completed steps green; future steps gray
- Each step shows an icon and label
- Clicking a step (if applicable) scrolls to that section's detail

**Mobile:** Vertical timeline

- Same steps as horizontal
- Left-aligned vertical line connecting steps
- Current step highlighted in teal
- Completed steps in green
- May be collapsed to save space; expandable to show detail

**Internal state mapping:** the tracker collapses backend states into partner-friendly language per the progressive-disclosure principle. Every state in the backend model resolves to exactly one tracker position (or an out-of-band panel for terminal exceptions):

| Backend state | Tracker position shown to partner |
| --- | --- |
| `DRAFT`, `DRAFT_REVISION` | (not yet on tracker; order lives in "Drafts") |
| `PENDING_APPROVAL` | Awaiting Review |
| `ON_HOLD` | Awaiting Review, with the Held conditional panel (see below) |
| `APPROVED`, `SAMPLE_EXPECTED` | Approved |
| `SAMPLE_RECEIVED`, `IN_PROCESS` | Sample in Progress |
| `RESULT_ENTERED`, `RESULT_VALIDATED` | Sample in Progress (results are never shown as "ready" before release — draft/unsigned values are never exposed to the partner) |
| `RELEASED_TO_PARTNER` | Results Ready → Complete once acknowledged |
| `REJECTED` | Replaces the tracker with the Rejected conditional panel (terminal) |
| `CANCELLED` | Replaces the tracker with the Cancelled conditional panel (terminal) |

Center-facing screens (Approval Queue, laboratory operations, dispensary) show the underlying backend state name directly rather than the collapsed partner label, per the progressive-disclosure principle.

#### Tabbed Interface

- **Tab 1: Overview**
  - Patient summary (Name, ID, Phone, Email, DOB)
  - Billing entity (if applicable)
  - Partner reference and notes
  - Submitted date and time
  - Current status and owner
  
- **Tab 2: Tests & Samples**
  - Table: Service, Code, Container, Volume, Preparation, Status
  - Each row expandable to show sample tracking events (collected, received, validated, processed)
  - Sticky header on scroll
  
- **Tab 3: Activity**
  - Timeline of all events: submission, approvals, holds, rejections, sample receipts, result entries
  - Each event shows: Timestamp, actor (user name), action, and any note/reason
  - Color-coded by event type (green for approvals, amber for holds, red for rejections)
  
- **Tab 4: Documents**
  - Links to finalized reports, if released
  - Download buttons
  - Date of release and signatory
  - **Version history:** if a report was corrected after release (flow map exception "Report corrected after release"), only the latest signed, released version is presented as the primary download; earlier versions are listed below under a collapsed "Previous versions" disclosure, each labeled with its release date, signatory, and a short "Superseded" tag — never silently replaced with no trace
  - A one-line note explains why more than one version exists (e.g., "A corrected report replaced the version released on [date]") so the partner is not left guessing

#### Conditional Panels

**If Order is HELD (Awaiting Correction):**
- Prominent amber action panel at top of Overview tab
- Shows: "Order held for review"
- Icon: Amber warning symbol
- Center's reason displayed below (read-only, user cannot edit this)
- Button: "Edit and resubmit" (returns to Step 2 or 3 in order editing workflow)
- Creating a resubmission records history; original submission becomes read-only

**If Order is REJECTED (Terminal):**
- Prominent red panel at top of Overview tab
- Shows: "Order rejected" with center's reason
- No edit option available
- Button: "Duplicate as new order" (if policy permits; copies services and patient, starts new draft)

**If Sample Collection Required at Center:**
- Informational panel: "Your sample will be collected by the center on [appointment date if applicable]"
- Instructions for patient preparation

**If Results Released:**
- Green success panel: "Results released on [date] by [validator name]"
- Button: "Download report" (if multi-part) or direct link to PDF

**If Order is CANCELLED (Terminal):**
- Neutral gray panel (not red — cancellation is not a rejection): "Order cancelled on [date]"
- Show who cancelled it (partner or center, per FR-4/state model) and any recorded reason
- No edit option; "Duplicate as new order" available under the same policy as Rejected
- If cancellation occurred after approval but before processing, show a short note on any consumables/sample handling already performed, so the partner understands why a recollection may still be required

#### Mobile-Specific Layout
- Tabs appear as vertical scrollable sections or a select menu (rather than tab bar if space constrained)
- Status tracker is vertical timeline
- Summary rail information incorporated into the main content flow

---

## 5. Center-Facing Screens

### Partner Approval Queue

**Purpose:** Workflow for reviewing and approving submitted orders.

#### Layout
- **Left Panel: Queue List** (350px on desktop, full-width on mobile)
  - Dense table of submitted orders
  - Columns: Partner, Order #, Patient, Submitted, Amount, Priority, Sample Location
  - Each row clickable; selected row highlighted in light teal background
  - Sortable by: Date (descending), Partner, Amount
  - Searchable by: Order #, Patient, Partner
  - Keyboard navigation: Arrow keys to move selection, Enter to open detail

- **Right Panel: Order Detail** (remaining width on desktop, appears below list on mobile)
  - Locked on desktop (split pane stays visible as user navigates)
  - On mobile: Click row to open full-screen order detail, back button to return to list

#### Filters (Collapsible Sidebar or Drawer)
- **Age:** "Last 24 hours", "Last 7 days", "Last 30 days"
- **Partner:** Multi-select checkbox list
- **Amount Range:** Min/Max inputs with currency symbol
- **Branch:** Multi-select (if applicable)
- **Priority:** High, Normal, Low
- **Sample Location:** Collected at partner, Collected at center
- **Buttons:** "Apply filters", "Clear filters"
- On mobile: Filters in a drawer/modal; icon badge shows count of active filters

#### Order Review Panel

**Content Shown:**
- Patient safety banner (allergies, critical notes if visible to center)
- Price breakdown: Item list with unit price, quantity, total
- Test service code and name
- Contract version and effective date
- All details read-only for review
- **Contract mismatch warning (amber banner, above the price breakdown):** shown whenever the submitted price snapshot no longer matches the current active contract price list (e.g., the center updated prices after the partner submitted). Per the exception rule, the submitted snapshot is never silently rewritten — the banner states which lines changed, the snapshot amount vs. current contract amount, and requires the reviewer to explicitly acknowledge it before Approve is enabled. Reviewers can still Hold or Reject without acknowledging.

**Action Buttons:**
- **Approve** (green)
  - Enabled only if all required verifications passed
  - Action: Saves approval record with reviewer name, timestamp, order snapshot
  - Toast: "Order approved" with order #

- **Hold** (amber)
  - Opens dialog (not inline) requiring:
    - Reason (dropdown/select from predefined list: "Missing info", "Price mismatch", "Duplicate", "Other")
    - Note (optional text area, 200 chars)
  - Button: "Hold order" (submits dialog)
  - Toast: "Order held; partner notified"

- **Reject** (red)
  - Opens dialog requiring:
    - Reason (dropdown: "Duplicate", "Not approved partner", "Service unavailable", "Other")
    - Note (optional text area, 200 chars)
  - Warning: "This action cannot be undone; the partner will need to create a new order."
  - Button: "Reject order" (submits dialog)
  - Toast: "Order rejected; partner notified"

**Keyboard Shortcuts (Optional, but Recommended):**
- `A` = Approve (if focused on order detail)
- `H` = Hold (opens Hold dialog)
- `R` = Reject (opens Reject dialog)
- Arrow keys = Navigate queue list

### Sample Receipt, Quarantine, and the Processing Guard

**Purpose:** Give receiving staff and scientists an unambiguous reason whenever the approval guard (flow map §3, §9) blocks a step, instead of a generic error.

#### Receiving a Sample Before Approval

- If tenant policy allows recording receipt while a bill is pending (PRD FR-5), the receiving screen accepts the receipt event normally but immediately shows an amber **"Quarantined — awaiting bill approval"** status on the specimen, distinct from the normal in-process states
- The specimen appears in a filterable "Quarantined" view within the existing laboratory operations screens so staff can see what is sitting blocked rather than losing track of it
- Quarantined specimens cannot be advanced to validation or processing from any screen; the action controls for those steps are disabled (not hidden) with inline text: "Blocked — bill not yet approved"
- Once the current revision is approved, the specimen automatically leaves quarantine and its normal action controls re-enable; an activity-log entry (Order Detail Tab 3) records both the quarantine and its release

#### Processing Blocked (API returns 409 `APPROVAL_REQUIRED`)

- If a scientist attempts to start processing on an order whose approval is missing, stale, held, rejected, or revoked (sequence diagram §3), the UI shows a full-width red inline banner at the top of the processing screen — never a silent disabled button with no explanation
- Banner text names the specific blocking reason returned by the API (e.g., "This revision has not been approved," "A newer revision is pending approval") rather than a generic failure message
- Banner includes a link directly to the order's approval record so authorized staff can see the decision history without leaving the workflow
- The attempt is recorded in the audit log per FR-5/FR-10; this is not surfaced to the scientist, only to authorized center users reviewing Activity

### Consultation Workspace (Tab Structure)

**Purpose:** Replace free-text card grid with structured, repeatable fields.

#### Tab 1: Clinical Note

- Structured history and examination fields
- Generated narrative preview (read-only, auto-updated from fields)
- Standard fields: CC, HPI, PMH, Medications, Allergies, Vitals, Exam findings
- Use semantic labels and help text for consistency
- Option to edit narrative if needed (overrides auto-generation)

#### Tab 2: Investigations

**Purpose:** Order structured investigations (lab, imaging) without exiting consultation.

- **Search & Add:**
  - Text input: "Search investigations" (e.g., "CBC", "Chest X-Ray")
  - Results grouped by type (Laboratory, Imaging, Other)
  - Click to add; opens collapsible panel below

- **Investigation Details:**
  - Service name (readonly)
  - Clinical indication (text area; required)
  - Priority (select: Routine, Urgent)
  - Notes (optional text area)
  - Billing source selector: Auto-populated from encounter context; shown for confirmation
  - Status indicator (icon): Draft (gray), Ordered (teal), Completed (green)

- **Investigation Timeline:**
  - Vertical timeline of added investigations
  - Each entry shows: Service, indication, status, and timestamp of last change
  - Expandable to view full details or remove from order

#### Tab 3: Medications

**Purpose:** Prescribe medications with internal/external fulfilment options.

- **Search & Add:**
  - Text input: "Search medications" (autocomplete from pharmacy catalogue)
  - Results show: Medication name, form/strength, available stock (internal only)
  - Click to add; opens collapsible prescription detail panel

- **Prescription Lines:**
  - Fields (each line):
    - Medication name (readonly after selection)
    - Form/strength (readonly)
    - Dose (numeric input + unit select: mg, mcg, mL, etc.)
    - Route (select: Oral, IV, IM, Topical, etc.)
    - Frequency (select: Once daily, Twice daily, etc.; or custom text)
    - Duration (numeric input + unit: days, weeks, months)
    - Quantity (auto-calculated from frequency × duration; editable)
    - Instructions (text area; optional)
    - Fulfilment source (radio: Internal dispensing, External prescription)

- **Safety Checks (Before Signing):**
  - Drug allergy check: Alert icon if drug matches patient allergies
  - Duplicate check: Alert if same drug already prescribed (active)
  - Completeness: Highlight required empty fields
  - Dosage validation: Warn if dose outside typical range

- **Prescription Timeline:**
  - Vertical list of signed prescriptions
  - Each shows: Medication, dose/route/frequency, status, prescriber, date
  - Actions: View details, Discontinue (with reason), Reorder (creates new prescription copying this)
  - Discontinued prescriptions appear grayed out; audit trail shows discontinuation

#### Tab 4: Plan & Follow-up

- Diagnoses (ICD-10 codes or free text)
- Patient advice (text area)
- Follow-up date (date picker)
- Referrals (reference to other clinicians or facilities)

#### Layout (Desktop & Mobile)

- **Desktop:** Tabs in horizontal row; content area expands below
- **Mobile:** Tabs stacked or in a select dropdown if space-constrained; tab content full-width below
- **Legacy Support:** Old consultations show a "Legacy adapter" tab; data is readable but not editable in new structure

---

## 7. Pharmacy & Dispensary

### Dispensary Queue

**Purpose:** Workflow for fulfilling internal and external medication prescriptions.

#### Layout

- **Work Queue (Left Panel, 350px desktop):**
  - List of active prescriptions awaiting dispensing or review
  - Ordered by: Clinical priority (high → low), then waiting time (longest first)
  - Columns: Patient, Medication, Status, Prescriber, Submitted time
  - Highlight color if high priority or overdue
  - Click to open full prescription detail on right panel or below on mobile

- **Prescription Detail (Right Panel, desktop):**
  - Sticky on desktop; full-width below list on mobile

#### Prescription Detail Panel

**Header:**
- Patient name, age, gender
- Allergies banner (red, always visible)
- Critical flags (e.g., drug interactions, contraindications)

**Content:**
- Prescriber name
- Medication(s) ordered
- Indications (clinical reason)
- Dose, route, frequency, duration
- Quantity to dispense
- Special instructions

**For Internal Lines:**
- Current stock for medication/strength
- Batch selection (if multiple batches available)
- Expiry date displayed for selected batch
- Actions:
  - **Full dispensing:** Quantity = prescribed quantity
  - **Partial dispensing:** Input custom quantity if prescriber allows
  - **Substitution:** (If policy permits) Select alternative strength/form with prescriber approval
  - **Decline:** Reason dropdown (Out of stock, Expired, Other)
- Button: "Dispense" (green)
  - Records: Quantity dispensed, batch used, dispenser name, timestamp
  - Updates stock immediately (immutable transaction)

**For External Lines:**
- Mark as "Issued externally"
- Button: "Generate prescription" (creates printable PDF)
- Prescription format: Standard RX pad layout with prescriber, patient, medication, dose, frequency, refills
- Stock is **never** reduced for external prescriptions

**Post-Action:**
- Toast: "Medication dispensed" or "Prescription issued"
- Remove from active queue; move to completed/dispensing history
- Preserve audit trail of every transaction

---

## 8. Pharmacy Inventory Management

### Pharmacy Items Catalog

**Purpose:** Browse, activate, deactivate pharmacy items.

#### Layout
- **Search & Filter:**
  - Text input: "Search by name or code"
  - Filter: Category, Active status, Stock level
  
- **Items Table:**
  - Columns: Name, Code, Category, Generic name, Unit, Active status, Actions
  - Sortable by any column
  - Sticky header on scroll
  
- **Row Actions:**
  - View detail (click row)
  - Edit (pencil icon; opens modal or inline editor)
  - Deactivate/Reactivate (toggle; requires confirmation for deactivate)

#### Item Detail Modal
- Name, code, generic name
- Category
- Default unit of measurement
- Status toggle (Active/Inactive)
- Strength/form variations (list of available batches or related items)
- Save button

### Pharmacy Batches

**Purpose:** Track medication batches with expiry, stock levels, and reservations.

#### Layout
- **Search:**
  - Filter by item, batch status (Active, Expired, Expiring soon)
  - Date range for expiry
  
- **Batches Table:**
  - Columns: Item, Batch number, Quantity, Unit, Expiry date, Status, Actions
  - Expiry status indicator:
    - Green: >30 days remaining
    - Amber: 7–30 days remaining (highlight row)
    - Red: Expired (strikethrough)
  
- **Row Actions:**
  - View detail
  - Adjust stock (receive, write-off, damage)
  - Mark as expired (if date has passed)

#### Batch Detail Panel
- Item name, code
- Batch number, lot code
- Quantity on hand, unit of measurement
- Expiry date
- Date received
- Supplier (if tracked)
- Reservation history (read-only list of pending prescriptions)
- Transaction history (all adjustments and dispenses)
- Edit button: Opens modal to adjust quantity or expiry date

---

## 9. Print & Document Output

**Purpose:** Cover the printable/downloadable artifacts referenced elsewhere in this spec (external prescriptions, released reports) with their own rules, since screen styling does not translate directly to print.

- **External Prescriptions:** standard RX-pad layout (Section 7) prints on a dedicated print stylesheet — no navigation chrome, top bar, or in-app buttons; prescriber, patient, medication lines, dose/route/frequency, and refill count are laid out for a single page wherever the content fits
- **Released Reports:** the downloadable PDF is generated server-side from the signed result, not from a print-styled version of the on-screen report view, so what a partner downloads exactly matches what was signed
- **Common rules:** ink-only color usage where feasible (status colors on screen degrade to labeled text/pattern in print, consistent with the color-and-contrast accessibility rule); page numbers and a generation timestamp footer on multi-page documents; no interactive elements (buttons, dropdowns) present in print output
- Superseded report versions (Section 4, Documents tab) are watermarked or clearly labeled "Superseded" if printed, so a physical copy can't be mistaken for the current version

---

## 10. Responsive Design Standards

### Breakpoints

- **Mobile:** 360px–767px (portrait phones, small tablets)
- **Tablet:** 768px–1023px (landscape phones, tablets)
- **Desktop:** 1024px and above (desktop, large screens)

### Adaptation Patterns

| Component | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Navigation | Bottom tabs (4 primary) | Bottom tabs or left rail | Left rail (72px→232px) |
| Workspace | Single column, full-width | Single or two-column | Split pane, two-column |
| Tables | Horizontal scroll within region | Horizontal scroll or collapse | Fixed layout, sticky headers |
| Forms | Stacked inputs, full-width | Stacked or two-column | Two-column layout |
| Summary Rail | Collapsible drawer or below content | Sticky column (narrow) | Sticky right column (280px) |
| Dialogs | Full-screen modal | Centered modal (90% width) | Centered modal (500px) |
| Dropdowns | Full-height select on mobile | Standard dropdown | Standard dropdown |

### Touch-Friendly Design

- All touch targets at least 44px × 44px (iOS standard)
- Buttons, links, and clickable rows minimum 44px tall
- Spacing between targets: ≥8px
- Modal close button in top-right, at least 48px × 48px
- Avoid hover-only reveals; use visible focus indicators instead

### Responsive Typography

- Headings: Reduce by 1 step on mobile (h2 → h3, etc.)
- Body text: 14px–16px minimum for readability
- Small text (secondary labels): 12px–13px minimum
- Line height: 1.4 (default); 1.6 for long passages

---

## 11. Accessibility Standards (WCAG 2.2 AA)

### Keyboard Navigation
- All interactive elements (buttons, links, inputs, tabs) reachable via Tab key
- Tab order follows visual reading order (left-to-right, top-to-bottom)
- Shift+Tab to move backward in tab order
- Enter to activate buttons; Space for toggles/checkboxes
- Arrow keys for carousel, list, or multi-select navigation
- Escape to close modals, popovers, and menus
- Focus trap in modals; focus returned on close

### Focus Indicators
- Visible focus outline on all focusable elements (min 2px width)
- Focus outline color: High contrast (e.g., teal on white, white on dark)
- No focus outline removed without replacement
- Focus indicator visible in both light and dark modes

### Color & Contrast
- All text at least 4.5:1 contrast ratio (normal text) or 3:1 (large text, 18px+)
- Status never communicated by color alone (always include icon, text, or pattern)
- Links underlined or otherwise visually distinct from plain text

### Form Labels & Errors
- Every form input has an associated label (`<label for="id">`)
- Labels appear above or adjacent to input (adjacent for small screens if space allows)
- Error messages tied to input with `aria-describedby`
- Error text in red with error icon (not color alone)
- Required fields marked with asterisk and `aria-required="true"`
- Validation appears inline after field blur or on submission; not in tooltip only

### Semantic HTML
- Use `<button>` for buttons, `<a>` for links (not divs styled as clickable)
- Use `<table>` with `<thead>`, `<tbody>`, `<th>` for data tables
- Use semantic headings (h1, h2, h3) in logical order; not skipped
- Use `<nav>`, `<main>`, `<footer>` landmarks
- Use `<fieldset>` and `<legend>` for grouped form inputs

### ARIA Usage
- `aria-label` for icon-only buttons (e.g., close icon)
- `aria-describedby` to link error messages or help text to inputs
- `aria-live="polite"` for non-critical status updates (e.g., "Draft saved")
- `aria-busy="true"` during data loading; set to `false` when complete
- `aria-hidden="true"` for decorative icons or visual-only content
- `role="alert"` for critical errors or warnings
- `aria-expanded` for collapsible sections and menus

### Motion & Animations
- All animations respect `prefers-reduced-motion: reduce`
- Use `@media (prefers-reduced-motion: reduce)` to disable non-essential animations
- Remove or simplify transitions; no auto-play videos

### Session & Suspension Handling

- An expiring session shows a warning toast with a "Stay signed in" action before hard-expiring, rather than silently dropping the user mid-task; unsaved New Order draft fields are autosaved (Section 4) so an expiry cannot lose in-progress work
- A session invalidated mid-use (entity or user suspended, per FR-1) redirects to login on the next request with the plain "no longer active" message specified under Login & Onboarding — never a raw permission error inside the workspace shell

### Loading & Empty States
- **Loading:** Skeleton rows or a contained spinner within the work area (not full-page overlay unless necessary)
- **Empty:** Icon + descriptive message + primary action (e.g., "No orders yet. Create one?" with button)
- **Error:** Icon + message + recovery action (e.g., "Failed to load. Retry?" with button)
- All states remain keyboard accessible

---

## 12. Implementation Checklist

- [ ] Visual direction finalized with design team (colors, typography, shape)
- [ ] Component library created/extended (buttons, cards, tables, forms, modals)
- [ ] Navigation rail component built and tested on desktop and mobile
- [ ] Partner dashboard implemented with metrics and recent orders table
- [ ] New Order workflow (4-step) fully functional with draft autosave
- [ ] Order Detail page with tabs and conditional panels
- [ ] Center Approval Queue with split-pane layout and bulk actions
- [ ] Consultation workspace tabs implemented (Clinical Note, Investigations, Medications, Plan)
- [ ] Dispensary queue and prescription detail panels built
- [ ] Pharmacy inventory (Items, Batches) screens implemented
- [ ] Responsive design tested on 360px, 768px, 1024px+ breakpoints
- [ ] Accessibility audit completed (keyboard nav, focus, color contrast, ARIA)
- [ ] Load testing on tables with large datasets (100+ rows)
- [ ] Icon and button styles verified across all states (default, hover, active, disabled)
- [ ] Print styles tested for reports and prescriptions (Section 9)
- [ ] Login, invitation acceptance, and suspended-account screens implemented (Section 4)
- [ ] Patients, Results, Team, and Notifications Center screens implemented (Section 4)
- [ ] Sample quarantine view and processing-blocked banner implemented (Section 5)
- [ ] Report version history (superseded reports) implemented in Documents tab (Section 4)
- [ ] Dark mode: out of scope for Release 1–3 (Section 13) — do not build against undefined dark tokens
- [ ] Mobile touch testing on actual devices (not just browser DevTools)
- [ ] Help text and error messages reviewed by content/UX team
- [ ] Tooltip triggers tested for keyboard and screen readers
- [ ] Motion and animation tested with `prefers-reduced-motion` enabled

---

## 13. Design Tokens (CSS Variables)

Use Bootstrap 5 custom properties for consistency:

```css
/* Colors */
--bs-primary: #087F73;        /* Teal */
--bs-success: #2D7A46;         /* Signal Green */
--bs-warning: #B66A09;         /* Amber */
--bs-danger: #B42318;          /* Red */
--bs-body-color: #172126;      /* Ink */
--bs-body-bg: #FFFFFF;         /* White */
--bs-secondary-bg: #F4F7F6;    /* Cool Canvas */
--bs-border-color: var(--bs-gray-300);

/* Typography */
--bs-body-font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--bs-font-serif: "Source Serif 4", Georgia, serif;

/* Spacing */
--bs-spacer: 1rem;  /* Bootstrap default */

/* Border Radius */
--bs-border-radius: 0.375rem;  /* 6px equivalent */
```

**Dark mode:** not defined for Releases 1–3 (Section 12, Recommended Delivery). The "calm clinical operations desk" character and status-color palette above were chosen and contrast-checked for light surfaces only; do not infer a dark variant from these tokens. If a future release adds dark mode, it needs its own contrast-checked palette and a dedicated design pass — not a mechanical inversion of the values above.

- [Product Requirements Document (PRD)](./organization-billing-prd.md)
- [Workflow Maps](./flowmap.md)
- [Implementation Subtasks](./organization-billing-subtasks.md)
- Lobnos LIMS: [Chart UI Standard](./chart-ui-standard.md)
- Lobnos LIMS: [Copilot Instructions](../../.github/copilot-instructions.md)

