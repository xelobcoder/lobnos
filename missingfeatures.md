================================================================================
  LOBNOS LIMS — PHARMACY MODULE: MISSING FEATURES ANALYSIS
  Prepared: March 2026
  Scope: Pharmacy POS & Inventory Management
================================================================================

This document catalogues every feature that is absent or incomplete in the
current pharmacy module when measured against a production-ready pharmacy
point-of-sale system. For each feature, a concise implementation path is
provided. Features are grouped by functional domain and ranked by priority.

Priority Key:
  [P1] Critical — system unusable without this in production
  [P2] Essential — high-value, expected by pharmacy staff daily
  [P3] Important — differentiates a professional system
  [P4] Nice-to-have — phase 3+ features


================================================================================
 1. PRESCRIPTION & PATIENT LINKAGE
================================================================================

STATUS: Not implemented. Orders are anonymous; no patient, no prescriber.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P1] 1.1 Patient Lookup on Dispensing
  What: Before dispensing, search for the patient by name, ID, or phone
        number. Link the order to a patient record.
  Why:  Traceability, medication history, repeat dispensing prevention.
  How:
    - Add a patient search bar at the top of /pharmacy/sell
    - Call customFetch('patients?search=...') to query existing patients
    - Store patientId and patientName on the order (patientRef field exists in
      DB but is unused)
    - Show patient's known allergies and current medications as a warning strip
    - Allow "walk-in" (anonymous) sales with a checkbox, skipping patient link

[P1] 1.2 Prescription Recording
  What: Record who prescribed the drugs (doctor name, ID, or link to the
        in-system clinician).
  Why:  Regulatory requirement. Controlled substances need a prescriber.
  How:
    - Add a "Prescriber" field to the dispense cart sidebar
    - Dropdown populated from GET clinicians/ (already exists in LIMS)
    - If the patient has arrived via a doctor order, auto-fill prescriber
    - Store prescriberId on pharmacy_orders table (add column)
    - Print prescriber name on the dispense slip and receipt

[P2] 1.3 Prescription Tracking Status
  What: A prescription can be fully dispensed, partially dispensed, or
        pending. Allow dispensing in multiple instalments.
  Why:  Patients pick up 1 week of a 1-month prescription at a time.
  How:
    - Add prescription_status ENUM('pending','partial','complete') to
      pharmacy_orders
    - Add dispensed_qty vs prescribed_qty per line item
    - In /pharmacy/sell, show "Top-up" button for partially filled orders
    - Track each dispense event linked to the same prescription_id

[P2] 1.4 Patient Medication History
  What: View all drugs dispensed to a patient across all visits.
  Why:  Pharmacist verifies they are not duplicating ongoing treatment.
  How:
    - New page: /pharmacy/patient/[patientId]
    - GET pharmacy/orders?patientId=X returns all historic orders
    - Display timeline of drugs, quantities, dates, prescribers
    - Flag any drug dispensed in the last N days to prevent double-dispensing

[P3] 1.5 Drug Interaction / Allergy Checking
  What: When a drug is added to the cart, check the patient's allergy list
        and flag interactions with drugs already in the cart.
  Why:  Clinical safety. Mandatory in regulated systems.
  How:
    - Maintain a drug_interactions table: (drug_a_id, drug_b_id, severity,
      description)
    - When adding a drug to cart, POST pharmacy/check-interactions with
      {newDrugId, cartDrugIds[], patientAllergies[]}
    - Show a modal warning: "⚠ Interaction: Paracetamol + Warfarin — risk of
      bleeding. Proceed?"
    - Flag known allergies: if patient is allergic to penicillin, warn when
      amoxicillin is added


================================================================================
 2. INVENTORY & STOCK MANAGEMENT
================================================================================

STATUS: Stock view page (app/pharmacy/stock/page.tsx) is implemented but
        many advanced inventory features are missing.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P1] 2.1 Batch / Lot Number Tracking
  What: Each stock receipt gets a batch number and its own expiry date.
        Multiple batches of the same drug coexist in inventory.
  Why:  Regulatory requirement. Enables FIFO dispensing and targeted recalls.
  How:
    - Add pharmacy_drug_batches table:
        id, drug_id, tenant_id, batch_number, lot_number,
        quantity, cost_price (per batch), expiry_date,
        received_date, supplier_id, grn_id, created_by
    - Modify stock_qty on pharmacy_drugs to be computed SUM of batch quantities
    - Restock modal uses batch form (batch #, expiry, qty, cost)
    - Dispensing deducts from earliest-expiry batch first (FEFO rule)
    - Stock page shows per-batch breakdown in expandable row

[P1] 2.2 Goods Received Note (GRN) / Purchase Receiving Workflow
  What: A formal process to receive stock from a supplier: raise a GRN,
        enter quantities received, verify against purchase order.
  Why:  Without this there is no audit trail for stock arriving.
  How:
    - New page: /pharmacy/stock/receive
    - GRN form: Supplier (dropdown from suppliers table), delivery note #,
      date received, lines table (drug, ordered qty, received qty, batch #,
      expiry date, cost price per unit)
    - On save: increments stock_qty in pharmacy_drugs, creates batch record,
      logs pharmacy_stock_movements with type='restock', stores GRN record
    - New table: pharmacy_grn (id, grn_number, supplier_id, received_by,
      received_at, status, notes)
    - New table: pharmacy_grn_items (grn_id, drug_id, ordered_qty,
      received_qty, batch_number, expiry_date, cost_price)

[P1] 2.3 Purchase Orders to Suppliers
  What: Create a formal purchase order (PO) to a supplier listing drugs
        needed and quantities. Supplier fulfils it; GRN is raised against PO.
  Why:  Formalises procurement; enables tracking of pending deliveries.
  How:
    - New page: /pharmacy/stock/orders (purchase orders, not sales orders)
    - PO form: Supplier, expected delivery date, drugs table with qty & price
    - Statuses: draft → sent → partial → received → closed
    - "Auto-suggest PO" button: pre-fills all drugs below reorder level
    - New table: pharmacy_purchase_orders
    - New table: pharmacy_po_items
    - API: POST pharmacy/purchase-orders, GET pharmacy/purchase-orders

[P2] 2.4 Stock Take / Physical Count
  What: Periodically, staff count actual physical stock and compare to
        system qty. Discrepancies are recorded and adjusted.
  Why:  Catches theft, breakage, unrecorded usage.
  How:
    - New page: /pharmacy/stock/stocktake
    - Start stocktake: system records snapshot of all current_qty
    - Staff enter counted_qty for each drug (or scan barcode)
    - System shows variance = counted_qty - system_qty
    - Approve adjustments: each variance creates a stock_movement with
      type='adjustment', note documents reason
    - New table: pharmacy_stocktakes and pharmacy_stocktake_items

[P2] 2.5 Stock Adjustment / Write-Off
  What: Record stock changes not from sales: damaged goods, expired
        drugs, theft, correction, sample usage.
  Why:  Without this, stock figures become inaccurate over time.
  How:
    - Add "Adjust Stock" button per drug on stock page
    - Modal: adjustment type (Expired Write-off, Damaged, Theft, Correction,
      Sample), quantity (positive or negative), note (required)
    - Creates pharmacy_stock_movements record with appropriate type
    - Updates pharmacy_drugs.stock_qty

[P2] 2.6 Expiry Date Management & Alerts
  What: Proactively flag drugs expiring within configurable windows
        (e.g. 30, 60, 90 days). Support write-off workflow for expired stock.
  Why:  Dispensing expired drugs is a serious safety & legal violation.
  How:
    - Expiry Alerts widget on /pharmacy overview dashboard
    - Colour tiers: Red = expired, Orange = <30 days, Yellow = <90 days
    - Dedicated section on stock page: "Expiry Watch" tab
    - Batch-level expiry when batches are tracked (feature 2.1)
    - "Write Off Expired" button triggers stock adjustment (feature 2.5)
    - Configurable alert thresholds in /pharmacy/settings

[P2] 2.7 Automatic Reorder Alerts & Reorder Suggestions
  What: When stock_qty falls below min_qty, generate a visible alert and
        optionally auto-create a draft purchase order.
  Why:  Prevents stockouts. Currently min_qty exists in DB but nothing acts on it.
  How:
    - Reorder alerts section on overview dashboard (currently shows 0)
    - Badge count on "Low Stock Alerts" nav link
    - One-click "Create PO for all low-stock items" on the low-stock page
    - Email/SMS notification to pharmacy manager when stock crosses threshold
      (use existing SMS/email services in the codebase)

[P3] 2.8 Inter-Branch / Warehouse Transfers
  What: Transfer stock from a central warehouse or another branch to this
        pharmacy, or loan drugs to another branch.
  Why:  Multi-branch facilities need stock balancing.
  How:
    - New table: pharmacy_transfers
    - Transfer request form: from_branch, to_branch, drugs + quantities
    - Workflow: request → approve → dispatch → receive
    - Deducts from sender, adds to receiver on confirmation
    - pharmacy_stock_movements logged at both branches

[P3] 2.9 Barcode / QR Code Support
  What: Scan drug barcode to add it to POS cart, or to look up stock.
  Why:  Speed and accuracy. Eliminates typing errors in a busy pharmacy.
  How:
    - Add barcode field to pharmacy_drugs table
    - Settings: import barcode from drug packaging (manual entry or camera scan)
    - In /pharmacy/sell: barcode input box at top of drug grid
      (many barcode scanners act as keyboard input ending in Enter)
    - Listen for rapid key sequences terminating in Enter within the search field
    - Match scanned code to drug, add to cart automatically
    - Generate printable barcode labels from /pharmacy/settings


================================================================================
 3. PAYMENT & FINANCIAL FEATURES
================================================================================

STATUS: Cash, MoMo, and Insurance payments are implemented. Critical gaps
        remain around split payments, refunds, and financial reconciliation.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P1] 3.1 Split Payment
  What: A customer pays part in cash and part via MoMo (or any two methods).
  Why:  Very common. A GHS 120 bill: patient pays GHS 80 cash + GHS 40 MoMo.
  How:
    - Cashier page: add "Add Another Payment Method" button
    - State: array of {method, amount, reference}
    - Validation: sum of all payment amounts >= total
    - Record multiple rows in pharmacy_payments (change UNIQUE constraint on
      order_id to allow multiple rows OR add a pharmacy_payment_lines table)
    - Receipt prints each payment line: "Cash GHS 80.00 / MoMo GHS 40.00"

[P1] 3.2 Returns & Refunds
  What: A patient returns unused drugs. Pharmacist processes the return,
        stock is restocked, and a refund is issued.
  Why:  Legal requirement in most jurisdictions. Unavoidable in practice.
  How:
    - New page: /pharmacy/returns
    - Look up original order by order number
    - Select which line items (and quantity) are being returned
    - Reason dropdown: Patient changed mind, Adverse reaction, Wrong drug
      dispensed, Damaged in transit
    - Refund method: Cash, MoMo reversal, Credit note
    - Creates pharmacy_return record linked to original order
    - Restocks pharmacy_drugs.stock_qty, logs pharmacy_stock_movements
      type='return'
    - Prints a return receipt

[P1] 3.3 Order Cancellation / Void
  What: A pharmacist or cashier can void an order before/after payment.
  Why:  Mistakes happen. An order must be cancellable with a reason.
  How:
    - "Cancel Order" button on cashier page (for pending orders)
    - "Void" button in sales history (for paid orders, within same day/shift)
    - Requires manager PIN or supervisor approval for voids after payment
    - Void restores stock (reverse sale entries in stock_movements)
    - Stores void_reason and voided_by on the order record

[P2] 3.4 Credit Sales / Customer Account (Deferred Payment)
  What: A patient or institution takes drugs now, pays later (on account).
  Why:  Very common for corporate clients, VIP patients, NHIS facility members.
  How:
    - New payment method "On Account" in cashier payment panel
    - Select customer account (linked to patient or company)
    - Order status becomes 'credit' instead of 'paid'
    - New page: /pharmacy/accounts — list receivables per debtor
    - "Settle Account" workflow: pay against multiple outstanding orders
    - New tables: pharmacy_credit_accounts, pharmacy_credit_payments

[P2] 3.5 Cashier Shift Management (Open/Close Till)
  What: At start of shift, cashier declares opening float. At end, counts
        cash in drawer. System reconciles with expected cash sales.
  Why:  Standard retail cash control. Detects shortages and overages.
  How:
    - New page: /pharmacy/cashier/shift
    - "Open Shift": cashier enters opening float amount
    - "Close Shift": cashier enters closing cash count
    - System calculates: Opening float + Cash sales - Payouts = Expected
    - Variance shown: Overage / Shortage
    - Shift report printable
    - New table: pharmacy_shifts

[P2] 3.6 Daily Cash Reconciliation Report
  What: End-of-day report showing all transactions, payment method totals,
        discounts given, voids, and net revenue.
  Why:  Accounting requirement. Manager signs off each day.
  How:
    - New page: /pharmacy/reconciliation
    - Default to today, filterable by date
    - Sections: Opening balance, Cash sales, MoMo sales, Insurance,
      Credit sales, Refunds, Voids, Discounts, Closing balance
    - Printable A4 format

[P3] 3.7 Tax / VAT Calculation
  What: Some drugs attract VAT or levy. System should calculate and print
        tax component on receipt.
  Why:  Legal and tax compliance.
  How:
    - Add is_taxable (BOOLEAN) and tax_rate (DECIMAL) to pharmacy_drugs
    - In POS cart, compute tax per taxable line item
    - Total panel: Subtotal, Tax (X%), Discount, Grand Total
    - Receipt shows tax breakdown
    - Tax settings in /pharmacy/settings (default tax rate, exemption list)

[P3] 3.8 Receipt Reprinting
  What: From sales history, reprint any past receipt.
  Why:  Patients lose receipts. Auditors request copies.
  How:
    - "Reprint" button on each row in /pharmacy/sales-history
    - Renders the same 80mm thermal receipt component with stored order data
    - window.print() triggered with that order's data pre-loaded


================================================================================
 4. INSURANCE & NHIS CLAIMS
================================================================================

STATUS: Insurance is a payment method only. No actual insurance workflow exists.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P2] 4.1 Insurance Scheme Configuration
  What: Define the different insurance schemes accepted (NHIS, Enterprise,
        Star Life, etc.) with their covered drug lists and co-payment rules.
  Why:  Each scheme pays differently. Some drugs are not covered.
  How:
    - New settings tab: /pharmacy/settings → "Insurance Schemes"
    - Fields: scheme_name, scheme_type, co-payment (%), covered_categories[]
    - Table: pharmacy_insurance_schemes
    - Per-drug: mark as NHIS-covered (checkbox in formulary)

[P2] 4.2 Insurance Co-Payment Calculation
  What: When paying by insurance, automatically calculate patient co-pay
        (e.g. NHIS pays 70%, patient pays 30%).
  Why:  Prevents staff manually calculating co-pays incorrectly.
  How:
    - When "Insurance" is selected as payment method in cashier:
      - Select scheme from dropdown
      - System separates drug lines into covered / not covered
      - Covered total → insurance pays scheme%
      - Patient pays: co-pay on covered + full price on uncovered
    - Two payment rows printed on receipt: "Billed to NHIS" + "Patient Payment"

[P3] 4.3 Insurance Claims Submission & Tracking
  What: Generate a claims list at end of month for submission to the
        insurance provider. Track claim status (submitted, approved, paid).
  Why:  Insurance revenue is significant. Manual claims are error-prone.
  How:
    - New page: /pharmacy/insurance/claims
    - Filter orders by insurance scheme + date range
    - Export to PDF/Excel in scheme-specific format
    - Record claim submission date, claim reference, expected amount
    - Mark claims as submitted / partially paid / fully paid
    - Alert when claim is overdue for payment


================================================================================
 5. REPORTING & ANALYTICS
================================================================================

STATUS: Sales history exists but has no charts, aggregates, or exports.
        The analytics module exists for other parts of LIMS but pharmacy
        has no analytics page.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P2] 5.1 Pharmacy Analytics Dashboard
  What: A dedicated /pharmacy/analytics page with KPI cards and trend charts.
  Why:  Management needs data to make stocking and pricing decisions.
  How (follow existing analytics pattern using Recharts):
    - Route: /pharmacy/analytics
    - Add "Analytics" link to PharmacyLinks.tsx
    - Metric cards: Revenue (period), Transactions, Avg Order Value,
      Top Drug, Items Sold, Refunds
    - Charts:
        Revenue trend: LineChart by day (last 30 days)
        Payment method split: PieChart (Cash / MoMo / Insurance / Credit)
        Top 10 selling drugs: HorizontalBarChart by qty sold
        Stock value trend: AreaChart
    - Date range filter (consistent with other analytics pages)

[P2] 5.2 Top-Selling Drugs Report
  What: Rank drugs by quantity sold and revenue generated in a period.
  Why:  Guides stocking decisions and supplier negotiations.
  How:
    - Query pharmacy_order_items JOIN pharmacy_orders WHERE status='paid'
      GROUP BY drug_name ORDER BY SUM(quantity) DESC LIMIT 20
    - Show in a bar chart and table with: rank, drug name, qty sold, revenue,
      % of total revenue
    - Filterable by category, date range

[P2] 5.3 Slow-Moving Stock Report
  What: Drugs that have had zero or very few sales in the last N days.
  Why:  Identifies dead stock that ties up capital and risks expiry.
  How:
    - LEFT JOIN pharmacy_drugs with pharmacy_order_items on last 90 days
    - Flag drugs with 0 sales in period
    - Show: drug, stock_qty, stock_value (qty × cost_price), last_sold_date
    - Suggest action: return to supplier, write-off, promotional pricing

[P2] 5.4 Stock Valuation Report
  What: Total value of current inventory at cost price and selling price.
  Why:  Balance sheet item. Required for financial reporting.
  How:
    - Simple query: SUM(stock_qty * cost_price) and SUM(stock_qty * selling_price)
    - Breakdown by category
    - Show potential gross profit = sell_value - cost_value
    - Printable / exportable

[P3] 5.5 Drug Expiry Report
  What: All drugs with quantities expiring within a selected horizon (30/60/90/180 days).
  Why:  Proactive management prevents losses.
  How:
    - Filter pharmacy_drugs (or pharmacy_drug_batches) WHERE expiry_date <= NOW + N days
    - Group by expiry month
    - Show qty at risk and value at risk
    - One-click write-off action from report rows

[P3] 5.6 Supplier Purchase History
  What: How much was ordered from each supplier over time; average lead time.
  Why:  Supplier performance management and cost negotiation.
  How:
    - Query pharmacy_grn JOIN suppliers by date range
    - Show per-supplier: total orders, total value, avg lead time (order→GRN),
      on-time delivery %, most supplied categories

[P3] 5.7 Pharmacist / Cashier Performance Report
  What: Sales and dispensing volumes per staff member per shift/day.
  Why:  Staff accountability and payroll incentives.
  How:
    - GROUP BY created_by on pharmacy_orders; processed_by on pharmacy_payments
    - Show: orders created, items dispensed, revenue processed, avg transaction
    - Admin-only view

[P3] 5.8 Data Export (Excel / CSV / PDF)
  What: Export any report or table to Excel/CSV for external analysis.
  Why:  Accountants and managers need to work with data in spreadsheets.
  How:
    - Install xlsx npm package
    - Add "Export to Excel" button on: sales history, stock list, expiry report,
      stock valuation, supplier history tables
    - Server-side: add ?format=csv query param to relevant API routes to return
      CSV instead of JSON (for large datasets)


================================================================================
 6. ROLE-BASED ACCESS CONTROL WITHIN PHARMACY
================================================================================

STATUS: Middleware protects the /pharmacy/ route group but there are no
        role distinctions inside the pharmacy module itself.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P1] 6.1 Pharmacy Role Separation
  What: Different staff see different pages based on their pharmacy role.
  Why:  A cashier should not access the formulary. A pharmacist should not
        process payments (to enforce segregation of duties).
  How:
    - Add pharmacy_roles: pharmacist, pharmacy_cashier, pharmacy_manager,
      pharmacy_storekeeper to the existing RBAC system
    - Middleware: extend existing rules in middleware.ts
        /pharmacy/sell → pharmacist, pharmacy_manager only
        /pharmacy/cashier → pharmacy_cashier, pharmacy_manager only
        /pharmacy/stock → pharmacy_storekeeper, pharmacy_manager only
        /pharmacy/settings → pharmacy_manager, admin only
        /pharmacy/analytics → pharmacy_manager, admin only
    - Use existing <UnauthorizedAccess /> component for blocked routes
    - Existing roles (scientist, sonographer etc.) already follow this pattern

[P2] 6.2 Manager Override / Supervisor Approval
  What: Certain actions (voids, large discounts, returns above threshold)
        require a manager to authenticate.
  Why:  Fraud prevention. Auditors require controlled access to reversals.
  How:
    - Manager override modal: "Enter manager PIN to proceed"
    - POST /api/pharmacy/authorize {action, pin} returns approve/deny
    - Configurable thresholds in /pharmacy/settings (e.g. discount > 20% needs approval)

[P2] 6.3 Audit Trail / Activity Log
  What: Every significant action (add drug, edit price, void order, login)
        is recorded with user, timestamp, before/after values.
  Why:  Regulatory and fraud auditing requirement.
  How:
    - New table: pharmacy_audit_log
        id, tenant_id, user_id, username, action, entity_type,
        entity_id, old_value (JSON), new_value (JSON), ip_address, created_at
    - Log on: drug CRUD, supplier CRUD, order creation, payment, void, return,
      stock adjustment, GRN, settings changes
    - New page: /pharmacy/settings → "Audit Log" tab (admin/manager only)
    - Filterable by user, action, date, entity


================================================================================
 7. SETTINGS & CONFIGURATION
================================================================================

STATUS: Settings has Drug Formulary and Supplier tabs. Many configuration
        options that affect system behaviour are absent.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P2] 7.1 Drug Category Management
  What: Manage the list of drug categories as a master list (not free text).
  Why:  Currently category is a free-text field prone to duplicates
        (e.g. "Antibiotic" vs "Antibiotics" vs "anti-biotic").
  How:
    - New tab in /pharmacy/settings: "Categories"
    - CRUD table: category name, description, default reorder days, active/inactive
    - In drug formulary form, category becomes a dropdown from this master list
    - API: GET/POST/PUT/DELETE pharmacy/categories

[P2] 7.2 Reorder Level Configuration (Global Defaults)
  What: Set system-wide default minimum quantities by category or form.
  Why:  Currently each drug needs its own min_qty set manually.
  How:
    - Settings tab: "Reorder Rules"
    - Table: category → default_min_qty, reorder_multiple (order in multiples of N)
    - "Apply defaults to all drugs in category" bulk action
    - Low stock alert lead time: "Alert when X days of stock remaining at avg usage rate"

[P3] 7.3 Receipt Customisation
  What: Admin configures what appears on the printed receipt: facility
        name, address, logo, footer message, tax pin, NHIS accreditation #.
  Why:  Each facility has different branding and legal requirements.
  How:
    - Settings tab: "Receipt / Print Settings"
    - Fields: Header line 1 & 2 (facility name / branch), address, phone,
      footer message (e.g. "Prices are inclusive of taxes"),
      show/hide: pharmacist name, cashier name, sig/instructions, barcode
    - Changes persist via customPost('pharmacy/settings', 'POST', config)
    - Receipt component reads these settings at print time

[P3] 7.4 Pricing Rules / Price Lists
  What: Different prices for different customer types: retail, wholesale,
        NHIS, staff, VIP.
  Why:  Dual pricing (NHIS vs retail) is standard in Ghanaian pharmacies.
  How:
    - Add pharmacy_price_lists table: (id, name, description, is_default)
    - Add pharmacy_price_list_items: (list_id, drug_id, price)
    - Settings: manage price lists
    - POS: select active price list at start of transaction or per customer type
    - Drug grid shows price for selected list

[P3] 7.5 Barcode Label Printing
  What: Generate and print barcode/QR labels for drug packages.
  Why:  Supports barcode scanning (feature 2.9) and stock management.
  How:
    - Settings → "Labels" tab
    - Select drugs, choose label template (small shelf label, patient label)
    - Patient label includes: drug name, strength, instructions, expiry, price
    - Use a React-based label renderer + browser print (no third-party dep)

[P4] 7.6 Backup & Restore (Settings Export)
  What: Export all pharmacy settings (formulary, suppliers, categories,
        price lists, insurance schemes) to a JSON file for backup.
  Why:  Disaster recovery. Moving to a new instance.
  How:
    - Settings → "Backup" tab (admin only)
    - "Export Settings" downloads JSON
    - "Import Settings" uploads JSON and merges/replaces records
    - API: GET pharmacy/settings/export, POST pharmacy/settings/import


================================================================================
 8. INTEGRATION WITH THE REST OF LIMS
================================================================================

STATUS: Pharmacy module is entirely standalone. No connections to other LIMS modules.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P2] 8.1 Doctor / Clinician Prescription Integration
  What: A doctor writes a prescription in the LIMS, which appears as a
        pending order in the pharmacy queue.
  Why:  Eliminates hand-written prescriptions. Closes the patient care loop.
  How:
    - Clinician side: a "Send to Pharmacy" button in the doctor's notes/orders
      page POSTs to pharmacy/orders with patient and drug details
    - Pharmacy POS: a "Pending Prescriptions" queue (highlighted on overview)
    - Pharmacist clicks the prescription, it pre-fills the cart
    - Prescription record is marked "dispensed" when order completes

[P2] 8.2 Patient Registration Integration
  What: Patient search in pharmacy POS uses the same patient database as
        other LIMS modules (not a separate pharmacy-only list).
  Why:  Centralised patient data; links pharmacy records to full medical history.
  How:
    - In /pharmacy/sell, patient search calls customFetch('patients?search=...')
      (same endpoint used by lab, imaging, etc.)
    - Patient's demographic data populates from the LIMS patient record
    - Order's patientRef stores the patient ID from the main system

[P3] 8.3 Billing Module Integration
  What: Pharmacy sales appear in the main billing module summary and
        contribute to the overall revenue reports.
  Why:  Unified financial view for management and accounts.
  How:
    - On payment confirmation in pharmacy, POST billing/revenue-entry with
      {source: 'pharmacy', amount, orderId, patientId, paymentMethod}
    - Main billing dashboard totals include pharmacy revenue
    - Or: use a shared revenue table that both modules write to

[P3] 8.4 Lab Test → Drug Auto-Suggestion
  What: When a lab result is validated (e.g. malaria positive), the system
        can suggest standard treatment drugs and quantities.
  Why:  Clinical decision support. Reduces prescribing variability.
  How:
    - Maintain a treatment_protocols table: (diagnosis, drug_id, default_dose,
      default_days, notes)
    - Lab validation page shows "Suggested Treatment" with a button
      "Send to Pharmacy" that pre-fills the POS cart


================================================================================
 9. OFFLINE & RELIABILITY
================================================================================

STATUS: Offline mode exists but is fragile — order numbers generated locally
        are not synced; mock data is always returned on API failure.

MISSING FEATURES:
─────────────────────────────────────────────────────────────────────────────

[P2] 9.1 Proper Offline Queue with Sync
  What: Actions performed offline are queued locally and automatically
        synced when connectivity is restored.
  Why:  Current fallback creates "ghost" orders that never reach the backend.
  How:
    - Use IndexedDB (via idb library or localStorage for small payloads) as
      a local queue
    - Each offline action: {type, payload, timestamp, attempted} stored locally
    - Background sync: on reconnect, process queue in order
    - Show "X items pending sync" badge in pharmacy header when offline
    - Conflict resolution: server-side order numbers replace local ones after sync

[P3] 9.2 Mock Data Removal / Feature Flags
  What: All pages currently return mock data if the API fails. Production
        should show an error, not silently serve stale mock data.
  Why:  Mock data creates false confidence and can cause stock discrepancies.
  How:
    - Add NEXT_PUBLIC_PHARMACY_USE_MOCK=false env var
    - Pages check this flag; if false, show error state instead of mock
    - Keep mock flag as true only in development/demo environments
    - Create a proper seeding script (pharmacy-seed.ts) for dev environments


================================================================================
 10. USER EXPERIENCE & WORKFLOW GAPS
================================================================================

[P2] 10.1 Hold / Park Orders
  What: Pharmacist puts a current order on hold while serving another
        customer, then returns to the held order.
  Why:  Extremely common: a customer says "let me call my doctor" mid-dispensing.
  How:
    - "Hold" button saves cart state to localStorage under a hold_id
    - "Held Orders" indicator shows count of held orders
    - Click held order to restore cart and patient context

[P2] 10.2 Drug Dispensing Queue / Waiting Room Display
  What: After order is created by pharmacist, it appears in a queue.
        Cashier sees the queue and processes next in line.
  Why:  Eliminates the need for the patient to know their order number.
        Makes the cashier workflow systematic.
  How:
    - Cashier page: show a queue panel listing pending orders (order #,
      patient name, total, time waiting) sorted by creation time
    - Click a queue row to load that order into the payment panel
    - Auto-refresh the queue every 10–15 seconds
    - Queue data from GET pharmacy/orders?status=pending

[P2] 10.3 Drug Substitution Suggestions (Generic Alternatives)
  What: If a branded drug is out of stock or not in formulary, suggest a
        bioequivalent generic alternative.
  Why:  Ensures patient gets treatment even if specific brand unavailable.
  How:
    - Add generic_group field to pharmacy_drugs (links equivalents together)
    - When a drug is out of stock and added to cart: show modal
      "Out of stock. Available equivalents: [list]"
    - Pharmacist selects substitute; instructions updated accordingly

[P3] 10.4 Bulk Drug Import from CSV / Excel
  What: Import the entire drug formulary from a spreadsheet instead of
        entering drugs one by one.
  Why:  A pharmacy may have 500+ drugs. Manual entry is impractical.
  How:
    - Settings → Formulary tab → "Import CSV" button
    - Download template CSV with column headers matching DrugForm fields
    - Upload CSV: parse, preview table of drugs to import, validate required fields
    - On confirm: batch-insert via POST pharmacy/drugs/bulk
    - Report: N imported, M failed (with reasons)

[P3] 10.5 Keyboard Shortcuts for POS
  What: Pharmacist can add drugs to cart, adjust qty, and submit order
        entirely from the keyboard.
  Why:  Speed. A busy pharmacy processes dozens of patients per hour.
  How:
    - Cursor lands in search bar on page load (already done ✅)
    - Enter with single search result adds drug to cart
    - Numeric keys adjust quantity of last-added item
    - Ctrl+Enter submits and prints the order
    - Esc clears the cart after confirmation

[P4] 10.6 Customer-Facing Display
  What: A secondary screen (or browser tab) shows the patient their
        cart items and totals as the cashier processes payment.
  Why:  Transparency. Customer can verify items and amounts.
  How:
    - /pharmacy/display route (fullscreen, no sidebar)
    - Cashier page broadcasts cart state via BroadcastChannel API to a
      second opened tab/window on the same machine
    - Display shows: pending items, total, payment in progress message,
      "Thank You" screen after payment

[P4] 10.7 Loyalty / Points Programme
  What: Regular patients accumulate points per purchase and can redeem
        them for discounts.
  Why:  Customer retention. Common in retail pharmacy.
  How:
    - New table: pharmacy_loyalty_accounts (patient_id, points_balance, tier)
    - Points earned = floor(total / earn_rate) per transaction
    - Redemption: at cashier, "Use points" deducts points and applies discount
    - Settings: configure earn rate, redemption rate, tier thresholds


================================================================================
 IMPLEMENTATION PRIORITY SUMMARY
================================================================================

PHASE 1 — Production Blockers (Do First):
  1.1  Patient lookup on dispensing
  1.2  Prescription recording (prescriber field)
  2.1  Batch / lot number tracking
  2.2  Goods Received Note (GRN) workflow
  3.1  Split payment support
  3.2  Returns & refunds workflow
  3.3  Order cancellation / void
  6.1  Pharmacy role-based access control (pharmacist vs cashier vs manager)

PHASE 2 — Essential Daily Operations:
  1.3  Prescription tracking (partial dispensing)
  2.4  Stock take / physical count
  2.5  Stock adjustment / write-off
  2.6  Expiry date management and alerts
  2.7  Automatic reorder suggestions
  3.4  Credit sales / customer accounts
  3.5  Cashier shift management
  3.6  Daily cash reconciliation report
  4.1  Insurance scheme configuration
  4.2  Co-payment calculation
  5.1  Pharmacy analytics dashboard
  5.2  Top-selling drugs report
  5.4  Stock valuation report
  6.2  Manager override / supervisor approval
  6.3  Audit trail / activity log
  7.1  Drug category management (master list)
  8.1  Doctor prescription integration
  8.2  Patient registration integration
  10.2 Dispensing queue / cashier waiting list

PHASE 3 — Professional Differentiators:
  2.8  Inter-branch stock transfers
  2.9  Barcode scanning
  3.7  Tax / VAT calculation
  3.8  Receipt reprinting
  4.3  Insurance claims tracking
  5.3  Slow-moving stock report
  5.5  Drug expiry report
  5.6  Supplier purchase history
  5.7  Staff performance report
  5.8  Data export (Excel / CSV)
  7.3  Receipt customisation
  7.4  Pricing rules / price lists
  8.3  Billing module integration
  10.1 Hold / park orders
  10.3 Generic drug substitution suggestions
  10.4 Bulk import from CSV

PHASE 4 — Enhancement Round:
  1.4  Patient medication history view
  1.5  Drug interaction / allergy checking
  2.3  Purchase orders to suppliers
  7.5  Barcode label printing
  8.4  Lab test → drug auto-suggestion
  9.1  Offline queue with sync
  9.2  Mock data removal / feature flags
  10.5 POS keyboard shortcuts
  10.6 Customer-facing display
  10.7 Loyalty / points programme


================================================================================
 BACKEND DATABASE ADDITIONS REQUIRED (SUMMARY)
================================================================================

  pharmacy_suppliers           — Formalise supplier table (currently text only)
  pharmacy_drug_batches        — Per-batch stock with expiry + lot numbers
  pharmacy_grn                 — Goods received notes header
  pharmacy_grn_items           — GRN line items
  pharmacy_purchase_orders     — Purchase order header
  pharmacy_po_items            — PO line items
  pharmacy_stocktakes          — Physical count sessions
  pharmacy_stocktake_items     — Line items of each count
  pharmacy_returns             — Return/refund header
  pharmacy_return_items        — Items being returned
  pharmacy_shifts              — Cashier shift open/close log
  pharmacy_credit_accounts     — Deferred payment accounts
  pharmacy_credit_payments     — Payments against credit accounts
  pharmacy_insurance_schemes   — Insurance configuration
  pharmacy_insurance_claims    — Claim submission tracking
  pharmacy_audit_log           — Action audit trail
  pharmacy_categories          — Master drug category list
  pharmacy_settings            — Key-value configuration store
  pharmacy_loyalty_accounts    — Customer loyalty programme
  pharmacy_price_lists         — Multiple price tiers
  pharmacy_price_list_items    — Drug prices per list
  pharmacy_treatment_protocols — Lab diagnosis → suggested drugs


================================================================================
 END OF DOCUMENT
================================================================================
