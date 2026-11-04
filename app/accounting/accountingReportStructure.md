For your PLS accounting section, I would **not present reports as one long flat list**. The accounting UI should be organized around how an accountant actually works: **daily transactions → ledgers → reconciliation → financial statements → management analysis → tax/audit**.

Based on the accounting structure you currently have—GL journals, AR/AP-related postings, inventory, expenses, branches, and the chart of accounts—I'd structure it like this. 

## Recommended Accounting → Reports structure

```text
ACCOUNTING
│
├── Dashboard
│
├── Transactions
│   ├── Journal Entries
│   ├── Payments
│   ├── Receipts
│   ├── Expenses
│   └── Adjustments
│
├── Ledgers
│   ├── General Ledger
│   ├── Account Statement
│   ├── Accounts Receivable
│   ├── Accounts Payable
│   ├── Customer Statements
│   └── Supplier Statements
│
├── Financial Statements
│   ├── Trial Balance
│   ├── Profit & Loss
│   ├── Balance Sheet
│   └── Cash Flow Statement
│
├── Reconciliation
│   ├── Bank Reconciliation
│   ├── AR Reconciliation
│   ├── AP Reconciliation
│   ├── Inventory Reconciliation
│   └── Accounting Exceptions
│
├── Management Reports
│   ├── Revenue Analysis
│   ├── Expense Analysis
│   ├── Profitability
│   ├── Budget vs Actual
│   └── Branch Performance
│
├── Tax
│   ├── Tax Summary
│   ├── Output Tax
│   ├── Input Tax
│   ├── Withholding Tax
│   └── Tax Transactions
│
└── Audit
    ├── Audit Trail
    ├── Posted Journals
    ├── Reversals
    └── Posting Exceptions
```

### 1. Accounting Dashboard

This should be the landing page rather than immediately opening a report.

Show a financial snapshot:

```text
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Revenue        │ Expenses       │ Net Profit     │ Cash & Bank    │
│ GH₵ 450,200    │ GH₵ 280,100    │ GH₵ 170,100    │ GH₵ 320,500    │
└────────────────┴────────────────┴────────────────┴────────────────┘

┌────────────────┬────────────────┬────────────────┐
│ Receivables    │ Payables       │ Inventory      │
│ GH₵ 85,400     │ GH₵ 62,300     │ GH₵ 210,000    │
└────────────────┴────────────────┴────────────────┘
```

Then:

* Revenue trend
* Expense trend
* P&L
* AR aging
* AP aging
* Cash position
* Recent accounting exceptions

The dashboard should answer:

> **"How is the business doing financially right now?"**

---

# 2. Financial Statements should be prominent

I would make **Financial Statements** one of the primary accounting menu items.

### Trial Balance

This is the accountant's fundamental control report.

```text
TRIAL BALANCE
As at 31 August 2026

Account                    Debit          Credit
---------------------------------------------------
Cash                      45,000
Bank                     125,000
Accounts Receivable       85,000
Inventory                210,000
Equipment                100,000
Accounts Payable                         62,000
Loans Payable                            50,000
Owner's Equity                           200,000
Service Revenue                          300,000
COGS                      120,000
Operating Expenses         77,000
---------------------------------------------------
TOTAL                     762,000        612,000
```

Obviously the actual totals must balance.

The UI should prominently display:

**Debits = Credits**

If not, that's an accounting integrity error.

---

# 3. Profit & Loss

This should be a very polished report.

```text
PROFIT & LOSS
1 Aug 2026 – 31 Aug 2026

Revenue
   Laboratory Revenue                    250,000
   Radiology Revenue                      80,000
   Other Revenue                          20,000
                                      ----------
Total Revenue                            350,000

Cost of Goods Sold
   Reagents                               85,000
                                      ----------
Gross Profit                             265,000

Operating Expenses
   Salaries                               70,000
   Rent                                   15,000
   Utilities                               8,000
   Commissions                             5,000
   Other                                   7,000
                                      ----------
Total Operating Expenses                 105,000

NET PROFIT                               160,000
```

And give the user:

**Period**

```text
This Month
Last Month
This Quarter
This Year
Custom
```

plus:

**Compare with**

```text
Previous Period
Previous Year
Budget
```

---

# 4. Balance Sheet

Use the traditional accounting structure:

```text
BALANCE SHEET
As at 31 August 2026

ASSETS

Current Assets
   Cash
   Bank
   Accounts Receivable
   Inventory
   Prepayments

Non-current Assets
   Property & Equipment
   Less: Accumulated Depreciation

TOTAL ASSETS


LIABILITIES

Current Liabilities
   Accounts Payable
   Tax Payable
   Salaries Payable
   Accrued Expenses

Non-current Liabilities
   Loans Payable

TOTAL LIABILITIES


EQUITY
   Owner's Equity
   Retained Earnings
   Current Year Profit

TOTAL EQUITY

TOTAL LIABILITIES + EQUITY
```

And show:

**Balance check: PASS**

```text
Assets = Liabilities + Equity
```

---

# 5. General Ledger

This should be one of the most useful reports.

The user selects:

```text
Account: Bank
Period: 01 Aug – 31 Aug
Branch: All
```

Then:

```text
Date       Reference      Description       Debit    Credit    Balance
----------------------------------------------------------------------
01 Aug     OP-001         Opening Balance             50,000    50,000
02 Aug     INV-1023       Patient payment    2,000              52,000
03 Aug     SUP-004        Supplier payment             1,500    50,500
...
```

Every journal should be clickable.

Clicking a transaction should open:

```text
Journal Entry #JE-000234

Date
Source
Reference
Description

Account              Debit       Credit
-----------------------------------------
Cash                 2,000
Service Revenue                  2,000
```

And then:

**View source transaction**

→ Patient payment
→ Invoice
→ Supplier payment
→ Expense
etc.

This is extremely important for traceability.

---

# 6. Account Statement

Don't confuse this with General Ledger.

A **General Ledger** is primarily an accounting record.

An **Account Statement** should give a clean chronological statement for a specific account/customer/supplier.

For example:

### Supplier Statement

```text
ABC Medical Supplies

Date       Reference      Description       Debit    Credit    Balance
----------------------------------------------------------------------
01 Aug     INV-1001       Invoice                      20,000    20,000
10 Aug     PAY-0021       Payment             10,000             10,000
20 Aug     INV-1030       Invoice                      15,000    25,000
```

---

# 7. Accounts Receivable

For PLS, this should be a major report category.

### AR Aging

```text
CUSTOMER RECEIVABLES

Customer          Current   1-30   31-60   61-90   90+    Total
----------------------------------------------------------------
ABC Clinic         20,000   5,000   2,000   0       0     27,000
XYZ Hospital        5,000   8,000   3,000   1,000   500   17,500
...
```

Summary cards:

```text
Total Receivables
Current
Overdue
90+ Days
```

Then clicking a customer opens the statement.

---

# 8. Accounts Payable

Mirror AR.

```text
SUPPLIER PAYABLES

Supplier           Current   1-30   31-60   61-90   90+   Total
----------------------------------------------------------------
Supplier A          15,000   5,000   0       0       0    20,000
Supplier B           8,000   2,000   3,000   0       0    13,000
```

This should link directly to supplier invoices and payments.

Your current system already recognizes AP when goods are received, which gives you the correct foundation for this report. 

---

# 9. Cash & Bank reports

I would create a dedicated section:

### Cash Book

```text
Opening Cash
+ Receipts
- Payments
= Closing Cash
```

### Bank Book

Same principle.

### Bank Reconciliation

```text
GL Bank Balance                 125,000
Add: Deposits in Transit          5,000
Less: Outstanding Cheques         3,000
Adjusted Bank Balance           127,000

Bank Statement Balance          127,000
Difference                            0
```

---

# 10. Inventory Accounting Reports

Because PLS has inventory integrated into accounting, this deserves its own report group.

```text
Inventory Valuation
Inventory Movement
Inventory by Account
COGS Report
Stock Adjustment Report
Wastage Report
Inventory Reconciliation
```

For example:

### Inventory Valuation

```text
Item             Qty       Unit Cost      Value
------------------------------------------------
Reagent A        100       25.00          2,500
Reagent B        200       12.00          2,400
...
```

Your current accounting flow already distinguishes inventory additions from consumption/wastage and posts consumption to COGS, so these reports can be tied directly to those journal events. 

---

# 11. Management Reports

This is where your accounting system becomes useful to the business owner rather than just the accountant.

I'd include:

### Revenue Analysis

```text
Revenue by:
- Month
- Branch
- Department
- Service
- Customer type
- Payment method
```

### Expense Analysis

```text
Expenses by:
- Account
- Category
- Branch
- Department
- Supplier
- Month
```

### Profitability

```text
Branch
Department
Service
Customer
```

For PLS, something like:

```text
Branch        Revenue     COGS      Expenses    Profit
-------------------------------------------------------
Tamale        500,000    150,000     180,000    170,000
Kumasi        350,000    100,000     130,000    120,000
```

This is where your `branchid` and the dimension architecture become extremely valuable. Your current journal lines already carry `branchid`, although the dimensional model needs to be expanded. 

---

# 12. Audit & Accounting Control Reports

I would definitely have a dedicated section.

### Posting Exceptions

```text
Failed
Pending
Retried
Dead Letter
```

Your current outbox already gives you the basis for this because postings can be `pending`, `posted`, or `failed` and have retry/error information. 

### Other reports

* Reversed journals
* Voided transactions
* Manual journals
* Backdated transactions
* Unbalanced attempts
* Duplicate posting attempts
* Period adjustments
* Audit trail

This gives the accountant confidence that **nothing disappeared behind the automation**.

---

# 13. Don't make every report a separate page

This is important from a UX perspective.

I'd build a **generic report viewer**.

For example:

```text
┌─────────────────────────────────────────────────────────────┐
│ General Ledger                                               │
├─────────────────────────────────────────────────────────────┤
│ Period [Aug 2026 ▼]  Account [All ▼]  Branch [All ▼]       │
│                                                             │
│ [Apply] [Reset]                       [Export PDF] [Excel]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Report                                                      │
│                                                             │
│ Date | Ref | Description | Debit | Credit | Balance         │
│ ...                                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Every accounting report should have consistent:

* Date range
* Branch
* Account
* Department
* Customer
* Supplier
* Status
* Currency
* Export
* Print
* Drill-down

where applicable.

---

# The navigation I'd actually use

For your PLS UI, I'd make the accounting sidebar approximately:

```text
💰 Accounting

   Dashboard

   Transactions
      Journal Entries
      Payments
      Receipts
      Adjustments

   Ledgers
      General Ledger
      Account Statements
      Accounts Receivable
      Accounts Payable
      Customer Statements
      Supplier Statements

   Financial Statements
      Trial Balance
      Profit & Loss
      Balance Sheet
      Cash Flow

   Reconciliation
      Bank Reconciliation
      AR Reconciliation
      AP Reconciliation
      Inventory Reconciliation

   Inventory Accounting
      Inventory Valuation
      COGS
      Stock Adjustments
      Wastage

   Management
      Revenue Analysis
      Expense Analysis
      Profitability
      Budget vs Actual
      Branch Performance

   Tax
      Tax Summary
      Tax Transactions
      Withholding Tax

   Audit
      Audit Trail
      Posting Exceptions
      Reversals
```

## One important design principle

Don't make **Reports** simply a collection of SQL queries.

Every accounting report should have a clear **accounting purpose** and preferably a drill-down path:

```text
Profit & Loss
     ↓
Revenue
     ↓
Laboratory Revenue
     ↓
Journal Entries
     ↓
Patient Invoice
     ↓
Patient Payment
```

Similarly:

```text
Accounts Payable
     ↓
Supplier
     ↓
Supplier Invoice
     ↓
Goods Receipt
     ↓
Journal Entry
```

That gives you a proper **audit trail from financial statement → ledger → journal → source transaction**.

For the system you're building, I'd consider that drill-down architecture almost as important as the reports themselves.

## Laboratory NHIS accounting frontend

Workspace: `/accounting/nhis`, reached from Accounting workspace navigation,
Accounting → Ledgers → Laboratory NHIS, payer receivables, and cash collection.
Patient billing creation and ordinary patient payment workflows remain unchanged.
Known NHIS/mixed bills are excluded from legacy patient cash-collection staging
when payer metadata is supplied; unknown legacy metadata is protected by the
backend. The legacy response alignment limitation is described below.

### Report meaning

- **Service-period receivables**: current balances for the bill-date cohort,
  never a historical as-of view or an externally approved NHIS claim register.
  Expected, cash received, revenue adjustments, written off, outstanding,
  unverified legacy receipts and reconciliation differences are distinct.
- **Receipt-date cash**: actual signed cash movements during its own date range,
  including receipt reversals/refunds; noncash adjustments are excluded.
- **Audit events**: independent event-date range, expandable signed allocations,
  original references/reasons/creator and reversal links.
- Each report sends `page` and `count`; page-size selection is stable. Summary
  money uses server all-result totals, not sums of the visible page.
- Mixed exclusions and unverified/reconciliation amounts require manual review.
  A rejected claim does not automatically become bad debt.

Generic `/accounting/receivables` supports all/patient/NHIS/mixed classification,
correct payer display and separate service-recipient details. `payerPaid` is
cash-only (including `nhisReceivedAmount`), while `nhisSettledAmount` is all
signed NHIS allocations, including noncash settlement. NHIS links go to the
dedicated workspace, not an unsupported patient statement/collection route.
General reporting is tenant-scoped; dedicated candidates and posting are
active-branch-scoped. The backend rechecks eligibility and balances.

### Posting and correction

The workspace puts service-period balances first: expected, cash received,
outstanding and cash recovery. Summary strips reuse the Pharmacy overview and
analytics styles, including their typography, dividers and responsive grid.
The NHIS overview uses the larger summary values and includes a cash-recovery
percentage bar. Tables inherit the selected page/theme font instead of forcing
the Bootstrap sans-serif font. Narrow mobile screens stack the larger summaries.
The overview labels its service-date range even
while another report is open. Receivables, Cash received and Activity are
separate keyboard-accessible tabs; their independent date filters and pagination
survive tab changes. Bill details reveal noncash adjustments and reconciliation
amounts without widening the main receivables table.

Record remittance defaults to **By service period**. Choose inclusive service
dates, enter the actual remittance, and preview all eligible outstanding NHIS
bills, not only the current report page. Allocation is proportional to current
outstanding balances, using deterministic largest-remainder rounding in pesewas.
For 5,000 bills owing GHS800,000, a GHS600,000 receipt allocates across the entire
cohort and leaves GHS200,000 receivable.

Choose whether the unpaid amount is expected later, under appeal, disputed, or
finally unpaid. The first three leave accounts receivable open; appeals/disputes
require explanatory notes. Final treatment requires an explicit approved
tariff/revenue adjustment or bad-debt write-off, with approval reference/reason.
Cash and noncash postings are atomic but remain separately identifiable.
**Adjust balance** supports later final resolution of the period with zero new
cash. No historical accounting period is automatically closed or reopened.

The reviewed cohort snapshot must still match at posting. Changed balances or
membership require a new preview. Mixed-payer and missing-accrual exclusions are
shown explicitly; historical revenue is not silently re-accrued. New period
settlements and their reversals post on today's UTC date, which must be open.
Successful unchanged retries replay before snapshot/day revalidation.

The advanced **Selected bills** workflow retains individual allocations.
Select bills on the report (including across pages), or add candidates from the
current page inside the dialog. Its allocation summary
shows the exact difference from the entered amount. Neither full-balance nor
allocated-total shortcuts submit a payment automatically.

Manual receipt forms require the explicit actual amount, cash/bank account, effective
date, unique reference, reason and selected bill allocations. Amounts
are parsed and summed in integer pesewas; only exact decimal strings reach the
API. Each positive allocation must fit the candidate balance, and allocations
must sum exactly to the entered amount.

Revenue adjustment and bad-debt write-off require explicit confirmation and
omit paymentAccountCode. Reversal uses its own dialog with separate reference/reason/date and
explicit confirmation; it sends only requestKey/reference/reason/date, creating
an exact signed reversal without deleting history. Period reversal instead calls
`accounting/nhis/period-settlements/:id/reversal` and reverses the receipt and any
linked adjustment together; individual reversal is prohibited. Activity labels
the service-period decision and reversal state and distinguishes original posting
totals from current balances. Expanding an activity row shows the recorded reason,
service-period posting amounts, decision and status together in a full-width,
mobile-friendly audit panel. Signed bill allocations belong to that event, which
may be the receipt, its separate adjustment, or a reversal. Allocation detail
loads only when expanded, using `accounting/nhis/events/:id/allocations?page&count`,
rather than mounting or downloading thousands of allocations for every activity row.

Authority comes from `accounting/authority/mine` using the **full application
session**, with fail-closed controls:

- `accounting.journal.post`: remittances
- `accounting.journal.approve`: tariff/revenue adjustments and write-offs
- `accounting.financial_correction.execute`: reversals

Backend authority remains authoritative. Missing permissions, failed authority
lookup, business errors, malformed responses and network errors are visible,
never converted to successful empty results.

An unchanged explicit retry retains its request key, including after remount,
using the existing hashed browser-session submission identity helper. Only a
hash and request key are stored, scoped to the full application context and
endpoint; no references, reasons or allocations are stored.
After an uncertain result, intentional payload edits require audit-review
acknowledgement and get a new key. Dialog dismissal is also blocked until the
uncertain outcome is retried or audit review is acknowledged. No automatic retries occur, and stale
callbacks cannot resubmit a confirmed success. Before leaving/reloading after
an uncertain result, inspect audit history and reproduce the exact original
payload for an unchanged retry. Reference uniqueness and backend idempotency
remain authoritative. Browser-storage failures block posting with actionable
guidance. Successful posting/reversal refreshes all three reports and clears
candidate selections, so the next allocation uses fresh outstanding balances.

After navigation, if an uncertain remittance was in fact applied and its original
allocation no longer fits the current outstanding balance, inspect the audit
event instead of creating a replacement payment; frontend over-allocation
validation deliberately remains in place.

### Legacy collection metadata alignment

`requiresNhisWorkspace` recognizes per-record `classification`, `partyType`, or
`entityType` equal to `nhis` or `mixed` (case-insensitive), or `source`,
`billingsource`, or `billingSource` equal to numeric/string `4`.
The preferred contract is canonical `classification: 'nhis' | 'patient' | 'mixed'`
plus `partyType: 'nhis' | 'patient'`, resolved from the bill's service payer data.
Canonical classification takes precedence over partyType and legacy flags;
canonical partyType takes precedence over legacy flags when classification is
absent. Thus a canonical patient bill is not excluded by stale `source: 4`.
Patient records must not be marked NHIS merely because the patient has coverage.

The legacy collection endpoints now include canonical payer classification and
projected balances. NHIS allocations reduce `payerOutstanding` without rewriting
the billing header; only cash receipts increase `payerPaid`. Fully settled NHIS
bills are omitted from the pending collection results. The frontend routes
known NHIS and mixed-payer balances to this workspace rather than staging an
ordinary patient collection. Backend guarded-bill rejection remains the final
protection.

### Synthetic verification

See `tests/browser/nhis-harness/README.md` for a production-component browser
fixture without credentials or real patient data. It includes large-money
totals, restricted authority, mutation failures, interrupted-response retries,
noncash settlement and signed reversal interactions. No unprotected Next route
or new dependency is introduced.

```powershell
pnpm exec node --test tests/nhis-accounting.test.cjs tests/accounting-api-paths.test.cjs tests/billing-workflow.test.cjs tests/modern-billing.test.cjs tests/billing-submission.test.cjs
pnpm exec node --test tests/nhis-render-stability.test.cjs
pnpm exec node tests/browser/nhis-harness/build.cjs
```

The render-stability regression uses the already-installed optional JSDOM
utility and the actual bundled production components in a bounded worker. It
checks idle fetch/DOM counts, real bill selection, page-size changes and
explicit refresh without starting a server. It skips rather than installing
anything if JSDOM is unavailable.

Scoped NHIS typecheck (including all task-touched frontend source files):

```powershell
pnpm exec tsc --noEmit --allowJs --skipLibCheck --strict --types 'node,react' --lib 'dom,dom.iterable,esnext' --module esnext --moduleResolution bundler --target ES2017 --jsx react-jsx --esModuleInterop next-env.d.ts app/accounting/nhis/page.tsx app/accounting/receivables/page.tsx app/billing/cash-collection/page.tsx components/accounting/NhisForms.tsx components/accounting/NhisWorkspace.tsx components/accounting/SubledgerReport.tsx components/accounting/AccountingWorkspaceNav.tsx components/Layout/links/categories/AccountingLinks.tsx lib/accounting/nhis.ts lib/accounting/nhisApi.ts lib/accounting/accountingApi.ts tests/browser/nhis-harness/api.ts tests/browser/nhis-harness/context.tsx tests/browser/nhis-harness/entry.tsx
```

Scoped NHIS lint:

```powershell
pnpm exec eslint app/accounting/nhis/page.tsx app/accounting/receivables/page.tsx components/accounting/NhisWorkspace.tsx components/accounting/NhisForms.tsx components/accounting/AccountingWorkspaceNav.tsx components/Layout/links/categories/AccountingLinks.tsx lib/accounting/nhis.ts lib/accounting/nhisApi.ts lib/accounting/accountingApi.ts tests/browser/nhis-harness/api.ts tests/browser/nhis-harness/context.tsx tests/browser/nhis-harness/entry.tsx
```

The broader lint including `components/accounting/SubledgerReport.tsx` and
`app/billing/cash-collection/page.tsx` retains existing legacy effect/dependency
diagnostics; they are not NHIS implementation errors.
