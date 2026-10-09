---
description: "PLS owner UI rules for Lobnos pages, components, forms, dashboards, tables, charts, filters, status displays, responsive layouts and accessibility."
applyTo: "app/**/*.{tsx,jsx},components/**/*.{tsx,jsx}"
---

# PLS UI implementation contract

This is the required UI contract for new and modified Lobnos/PLS interfaces. It applies automatically to React pages and components. Existing code is evidence for individual patterns, not permission to copy every legacy choice.

## 1. Owner rules

### Never use badges

Do not add:

- Bootstrap `.badge`
- `Badge` components
- status pills
- count chips
- rounded colored labels that imitate badges
- icon bubbles used only as decoration

Present status as readable text, for example:

```tsx
<span className="fw-semibold text-success">Active</span>
```

Use restrained semantic text color only as a supplement. The status word must remain understandable without color. Counts belong in prose, table metadata, or a true summary metric—not a chip.

### Never put forms inside cards

No form may have a card or equivalent decorative panel anywhere in its rendered ancestor chain. Check:

- the page
- conditionally rendered parents
- shared wrappers
- layouts
- modal content
- extracted form components

Removing `card` from the `<form>` itself is insufficient if a parent remains a card. Do not evade this rule by replacing the card with an equivalent rounded, shadowed, boxed form.

Group forms with semantic structure:

```tsx
<section aria-labelledby="company-heading">
  <div className="border-bottom pb-2 mb-3">
    <h2 id="company-heading" className="h5 fw-semibold mb-1">
      Company information
    </h2>
    <p className="small text-muted mb-0">
      Enter the organization details used for onboarding.
    </p>
  </div>
  <form>{/* fields */}</form>
</section>
```

Use headings, `fieldset`, `legend`, rows, spacing, helper text, and simple separators.

### Summary metric cards are the explicit exception

Summary metrics follow `CustomerSummaryCard` in `app/crm/customers/page.tsx`. Do not invent another summary-card design:

```tsx
<div
  className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}
>
  <div className="card-body p-3">
    <div className="d-flex justify-content-between align-items-center mb-1">
      <span className="text-xs text-uppercase fw-semibold opacity-75">
        {title}
      </span>
      <Icon size={22} className="opacity-75" aria-hidden="true" />
    </div>
    <h3 className="fw-bold mb-0">{formattedValue}</h3>
    <span className="text-xs opacity-75">{subtitle}</span>
  </div>
</div>
```

Rules:

- Use semantic Bootstrap variants already used by PLS.
- Use `row g-3 mb-3` or the spacing established by the containing feature.
- Use responsive columns based on the number of meaningful metrics. Four metrics use `col-12 col-sm-6 col-xl-3`.
- Do not invent a metric only to fill a row.
- Format counts with `toLocaleString()`.
- Use `currencyFormatter` for financial values.
- Do not show `0` while a value is unknown or failed to load.
- Do not label the current page length as a total.
- Do not put forms or controls inside summary cards.

## 2. Inspect before designing

Before editing:

1. Read the entire target component.
2. Read its page/layout ancestors and relevant shared child components.
3. Find the closest PLS reference for each UI type being changed.
4. Compare component choice, information order, density, typography, controls, states, responsiveness, and behavior—not only class names.
5. Identify legacy violations of the owner rules before copying a pattern.

Use these references for the named concern:

| Concern | Primary reference |
| --- | --- |
| Summary cards and list composition | `app/crm/customers/page.tsx` |
| Financial metrics | `components/Billing/BillingSumamry/BilledSummary.tsx` |
| Page/report header and print action | `components/accounting/ReportShell.tsx` |
| Shared data table | `components/accessories/Datatables/PrimeTable.js` |
| Table styling and responsive overflow | `components/accessories/Datatables/PrimeTable.module.css` |
| Advanced table behavior | `components/accessories/Datatables/PrimeTableV2.tsx` |
| Date range filters | `components/operations/Laboratory/ResuableFilter/DateFilterReusable.tsx` |
| Operational filter placement | `app/operations/phelobotomy/all-pending-requests/page.tsx` |
| Form control sizing and focus | `styles/form-fields.css` |
| Theme tokens and dark mode | `styles/theme.css`, `styles/globaldaktheme.css` |
| Print behavior | `styles/print.css` |
| Shared loader | `components/accessories/Loader.jsx` |
| Responsive application shell | `components/Layout/PrimeLayout.tsx` |
| Architecture and clinical conventions | `.github/copilot-instructions.md` |

### Feature-area reference matrix

Choose references from the same domain when behavior matters. Inspect them before use and apply the owner rules even when the legacy page does not.

| Area | References | Use for |
| --- | --- | --- |
| Accounting | `app/accounting/page.tsx`, `components/accounting/AccountingSummary.tsx`, `components/accounting/ReportShell.tsx`, `components/accounting/SubledgerReport.tsx` | Period context, financial totals, report controls, print, ledger tables |
| Analytics | `app/analytics/page.tsx`, `components/Billing/analytics/SalesByHourOfDay.tsx` | Chart states, tooltip/axis formatting, date context, analytic composition |
| Billing | `components/Billing/BillingSumamry/BilledSummary.tsx`, `app/billing/transactions/previous-transaction/[billingid]/page.tsx` | Currency summaries, transaction detail and audit context |
| CRM | `app/crm/customers/page.tsx`, `app/crm/overview/page.tsx` | Customer summaries, compact controls, client lists and CRM overview |
| Settings | `app/settings/records/result-accessible-settings/page.tsx`, `app/settings/records/result-access-requests/page.tsx` | Settings tables, role/access actions and administrative review |
| Inventory and pharmacy | `app/inventory/page.tsx`, `app/pharmacy/stock/page.tsx`, `app/pharmacy/sell/page.tsx` | Stock metrics, batches, item lists, dispensary actions and sales workflow |
| Laboratory | `app/operations/laboratory`, `components/operations/Laboratory/ResuableFilter/DateFilterReusable.tsx` | Clinical workflow context, sample/result states and date filters |
| Phlebotomy | `app/operations/phelobotomy/all-pending-requests/page.tsx`, `app/operations/phelobotomy/sample-summary/page.tsx` | Worklists, operational filters, page count, refresh and sample reports |
| Human resources | `components/HR/Payroll/WorkflowActions.tsx` | Payroll workflow actions and guarded transitions |
| Communications | `app/communications/sms/templates/TemplateFormModal.tsx` | Modal mechanics and pending submission behavior only; keep forms out of card ancestors |
| Compliance | `app/compliance/incident-reporting/page.tsx` | Incident states, investigations, confirmation and audit-sensitive actions |
| Authentication/onboarding | `app/authentication/register/sections/SectionPageShell.tsx`, `app/authentication/register/sections/SectionPageHero.tsx`, `app/authentications/login/page.tsx` | Registration sections, unauthenticated layouts and identity-safe messaging |

Known anti-pattern reference: `components/HR/Payroll/StatusBadges.tsx` exists in legacy code but must not be copied or extended. Replace badge-shaped status presentation with plain status text when touching the relevant surface.

## 3. Page composition

Default information order:

1. Compact page heading and contextual subtitle
2. Actionable warning or error, when present
3. Summary metrics, when they add decision value
4. Filter and action toolbar
5. Primary table, workflow, report, or chart
6. Secondary details through progressive disclosure

Guidance:

- Use the feature layout; do not add a second application shell.
- Keep headings concise and task-oriented.
- Prefer an operationally compact layout over decorative hero content.
- Avoid repeated page titles, redundant descriptions, nested cards, and empty decorative surfaces.
- Primary actions should be obvious without competing with several equally prominent buttons.
- Use `container-fluid`, Bootstrap grids, and wrapping flex rows consistent with the containing feature.
- Do not wrap `PrimeTable` in a decorative table card solely to add another heading.

## 4. Filters, search, and action toolbars

- Place filters after summary context and immediately before the content they affect.
- Use a compact responsive row such as `row g-2 align-items-end`.
- On mobile, stack inputs and actions at full width; on larger screens, align actions to the end.
- Group search, refresh, date range, page count, export, and primary action logically.
- Reuse `DateFilterReusable` for supported date presets and custom ranges.
- Keep date values and callbacks in the format expected by the endpoint.
- Reset dependent values when an upstream selection changes.
- Do not add a second search field when the shared table already provides the required global search.
- Do not claim a client-side filter searches records that have not been loaded.
- Do not add unimplemented export, print, or bulk-action buttons.

## 5. Data tables

### Choose the established table

- Preserve the table version already used by the feature unless behavior requires a change.
- Prefer `PrimeTable` for the established sorting, filtering, loading, zebra rows, empty state, and horizontal overflow behavior.
- Use `PrimeTableV2` only when its additional behavior—such as sticky headers, richer column controls, or resizing—is actually required.
- Do not copy V2 badge-like metadata or sort indicators that violate the no-badge rule.

### Column and row rules

- Use stable accessors/IDs.
- Type cell props when working in TypeScript.
- Keep headings and cells text-start aligned.
- Format dates, currency, identifiers, and percentages consistently.
- Use plain status text rather than pills.
- Preserve actions, disabled states, corrections, selection, and audit meaning.
- Keep destructive actions visually secondary until confirmation.
- Tables must scroll horizontally on narrow screens.
- Use semantic headers and accessible action names.
- Empty content must remain distinct from a failed request.

### Pagination rules

Every new unbounded list uses backend `page` and `count`.

- Keep the selected count stable between pages.
- PrimeTable server handlers return `{ result, error }`.
- Do not mutate parent list state inside a server handler as a side effect.
- Validate the response contract before enabling pagination.
- Do not fabricate totals or last pages.
- PrimeTable v1 does not reliably infer the final page from a total; account for its actual behavior.
- A deliberately bounded response window, such as subscription periods around a selected date, is not automatically a paginated endpoint.

## 6. Forms

- Forms live in normal page flow, never in cards.
- Use semantic sections, `fieldset`, `legend`, headings, and separators.
- Use labels for every field; placeholders never replace labels.
- Connect helper/error text with the field when practical.
- Preserve logical field order and responsive stacking.
- Keep field widths proportional to expected content.
- Reuse existing React Hook Form/Yup validation where present; do not introduce a second validation approach without reason.
- Preserve native validation attributes, server constraints, input lengths, patterns, and dependent-select behavior.
- Mark required fields using the feature's established convention.
- On failure, retain entered data unless security requires clearing it, such as a rejected password.
- Disable duplicate submission while pending.
- Button text must reflect pending work, and async regions should expose `aria-busy`.
- Do not silently convert server errors into an empty state or success-shaped response.

## 7. Status, loading, errors, success, and empty states

### Status

- Render a plain status word.
- Use `text-success`, `text-danger`, `text-warning`, or muted text only when contrast is adequate.
- Include a visible non-color cue where the distinction matters.
- Never use a badge or pill.

### Loading

- Use the feature's established loader, normally `components/accessories/Loader.jsx`.
- For inline actions, use a small spinner plus descriptive pending text.
- Do not render valid-looking zero metrics while loading.
- Use `role="status"` and `aria-busy` appropriately.

### Errors

- Use `role="alert"` for errors requiring attention.
- Explain what failed and provide a safe retry when possible.
- Preserve the user's work.
- Distinguish authorization failures, retrieval failures, validation errors, and empty data.

### Success

- Confirm the completed operation in plain language.
- Show identifiers or next steps only when useful.
- Do not imply that email, printing, payment, or another downstream action succeeded unless confirmed.

### Empty states

- State what is empty.
- Explain why when known.
- Offer one safe next action when applicable.
- Do not show “No data” after a failed request.

## 8. Actions, modals, and confirmations

- Use buttons for actions and links for navigation.
- Use Remix Icon from `@remixicon/react`.
- Decorative icons use `aria-hidden="true"`.
- Icon-only controls require `aria-label` and a visible tooltip when helpful.
- Do not rely on hover-only controls.
- Keep general buttons rectangular; do not introduce pill buttons.
- Use modals for focused confirmation or contained tasks, not as a substitute for page structure.
- A modal does not exempt a form from the no-card-ancestor rule.
- Use static backdrops for clinical or financial submissions when accidental dismissal is unsafe.
- Destructive confirmation must name the entity, consequence, and audit/reversibility behavior.
- Disable duplicate destructive submissions while pending.
- Preserve correction/void workflows rather than replacing them with deletion.

## 9. Charts and analytics

- Read the chart convention in `.github/copilot-instructions.md` and a nearby production chart before editing.
- Use Recharts already present in the project.
- Use a line chart for trends, bars for category comparison, and areas for cumulative magnitude.
- Do not add all chart-type toggles unless each view helps interpret the data.
- Reuse Bootstrap/theme variables for grid, text, border, tooltip, and background colors.
- Include loading, error, and empty states.
- Format axes and tooltips using established date/currency helpers.
- Keep legends readable and avoid unnecessary series.
- Provide a text/table alternative when data is operationally important.
- Reports and charts that are printed must include an explicit print action and usable print CSS.

## 10. Theme, spacing, and responsiveness

- Use theme and Bootstrap variables; avoid hard-coded white surfaces and arbitrary colors.
- Check light and dark mode when the surrounding feature supports both.
- Use the established PLS green/Bootstrap palette rather than introducing a new palette.
- Use Bootstrap spacing consistently: commonly `gap-2`, `g-3`, `mb-3`, and `p-3`.
- Keep operational screens compact and document-led.
- Use 6px/Bootstrap-established radii; avoid excessive rounding.
- Do not add decorative animations.
- Respect `prefers-reduced-motion` for necessary motion.
- Validate narrow mobile and wide desktop layouts.
- Ensure tables own horizontal scrolling and controls wrap without overlap.
- Touch targets must remain usable on mobile.

## 11. Accessibility

- Maintain a logical heading hierarchy.
- Use semantic landmarks and sections with accessible names when needed.
- Associate every input with a label.
- Preserve visible focus.
- Provide accessible names for icon-only actions.
- Do not communicate meaning by color alone.
- Use readable contrast in light and dark modes.
- Use `role="alert"` for critical errors and `role="status"` for non-critical async updates.
- Use `aria-busy` on the affected region during async work.
- Use semantic table headings.
- Ensure keyboard access for disclosure controls, menus, dialogs, tables, and actions.

## 12. Print

- Use explicit print actions for reports and document outputs.
- Reuse `styles/print.css` only after inspecting its effect on the target.
- Hide navigation and non-report controls.
- Expand scroll containers for page flow.
- Preserve headings, date range, identifiers, values, and table borders.
- Do not introduce colored print-only row borders or backgrounds that obscure clinical/financial meaning.

## 13. Domain safety

UI cleanup must not weaken domain behavior.

### Authentication and tenancy

- Preserve route protection, role visibility, tenant scope, session behavior, and authenticated fetch helpers.
- Never expose secrets, internal credentials, or protected tenant data in presentation changes.

### Laboratory and phlebotomy

- Preserve collection, reception, validation, processing, result entry, and final validation as distinct workflows.
- Reuse physical-sample collection and assessment components.
- Preserve scanner/typed identifiers, physical-container grouping, printable labels, critical-value warnings, QC, and audit information.
- Do not hide a blocker or make a destructive clinical action easier than its safe alternative.

### Billing, accounting, and subscriptions

- Preserve currency precision and existing formatters.
- Payment status does not implicitly activate or suspend a client.
- Corrections remain void/audit operations rather than deletion.
- Preserve schedule boundaries, earlier obligations, history, references, and approval semantics.
- Do not present a partial or pending financial action as completed.

### Inventory and pharmacy

- Preserve batch, expiry, quantity, stock movement, prescription, approval, and reversal semantics.
- Do not hide traceability fields for visual simplicity.

## 14. Verification before completion

Before claiming the UI is complete:

- [ ] Read the target, its wrappers, and relevant shared components.
- [ ] Compare against real PLS references for every changed UI type.
- [ ] Search all touched surfaces for badges, pills, and chips.
- [ ] Inspect the rendered ancestor chain of every touched form.
- [ ] Confirm summary cards match the customer contract.
- [ ] Confirm table choice, alignment, overflow, actions, and pagination behavior.
- [ ] Confirm loading, error, success, and empty states are honest and distinct.
- [ ] Confirm labels, focus, accessible names, heading order, contrast, and non-color meaning.
- [ ] Check mobile and desktop layout.
- [ ] Check light/dark theme where supported.
- [ ] Check print output for reports.
- [ ] Preserve clinical, financial, tenant, authorization, and audit behavior.
- [ ] Run editor diagnostics and the smallest applicable existing validation command.
- [ ] Use available browser tooling to render UI changes when practical.
- [ ] Report exact checks run. `git diff --check` proves only whitespace cleanliness; it is not visual or behavioral validation.

The specialized workflow is available through [PLS UI Designer](../agents/pls-ui-design.agent.md).
