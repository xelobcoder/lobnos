export type ProductScreen = {
  id: string;
  label: string;
  title: string;
  description: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  sourceRoute: string;
  provenance: string;
  workflows: string[];
  solutions: string[];
};

const demoProvenance = "Captured from the current, customer-confirmed PLS demo facility on 1 November 2026. The application header, navigation, page content and displayed demo values are retained. This is a software page capture, not a redesigned illustration.";

function demoScreen(id: string, label: string, title: string, description: string, sourceRoute: string, workflows: string[], solutions: string[] = []): ProductScreen {
  return { id, label, title, description, src: `/website-assets/images/pls-${id}.png`, alt: `Full PLS demo software page: ${label}, including the original application header and navigation`, width: 1440, height: 1000, sourceRoute, provenance: demoProvenance, workflows, solutions };
}

export const productScreens: ProductScreen[] = [
  demoScreen("registration", "Patient registration", "Patient Registration Wizard", "The actual registration page with its four-step workflow, duplicate check and patient information fields.", "/crm/registration", ["Check an existing mobile contact before registering", "Capture patient demographics and contacts", "Follow address, emergency contact and identity steps"], ["laboratory-management-system"]),
  demoScreen("specimen-storage", "Specimen storage", "Specimen Storage & Retention", "The specimen storage workspace with retention, location and specimen lookup controls.", "/operations/phelobotomy/specimen-storage", ["Look up stored specimens", "Review storage and retention records", "Follow configured specimen storage actions"], ["laboratory-management-system"]),
  demoScreen("laboratory-workbench", "Laboratory workbench", "Laboratory workbench", "The laboratory's operational workbench, shown with its own navigation and current demo workspace.", "/operations/laboratory/workbench", ["Review laboratory work in its operational context", "Navigate specimen and processing stages", "Use the configured laboratory workspace"], ["laboratory-management-system"]),
  demoScreen("laboratory-processing", "Laboratory processing", "Processing stage", "The processing page with its real date and record filters, grouped or individual views, and start/stop actions.", "/operations/laboratory/processing", ["Filter the processing queue", "Switch grouped and individual records", "Start or stop selected processing work"], ["laboratory-management-system"]),
  demoScreen("critical-values", "Critical results", "Critical results", "The current critical-result workspace for recorded alerts and follow-up work.", "/operations/laboratory/criticalvaluesAlert", ["Review critical-result records", "Follow recorded critical actions", "Use the configured alert workflow"], ["laboratory-management-system"]),
  demoScreen("laboratory-billing", "Patient billing", "Patient billing", "The actual laboratory billing workspace, including its navigation, patient selection and billing controls.", "/billing/patientid", ["Find the patient billing record", "Review laboratory charges and collections", "Use the facility's configured billing workflow"], ["laboratory-billing"]),
  demoScreen("general-ledger", "General ledger", "General Ledger", "The ledger page with period and account filters, balances, module selection, export and print actions.", "/accounting/general-ledger", ["Review opening and closing account balances", "Filter ledger activity by period and module", "Export or print the displayed report"], ["financial-management"]),
  demoScreen("income-statement", "Income statement", "Profit & Loss", "The financial statement page as it appears in the demo software.", "/accounting/income-statement", ["Review recorded income and expenses", "Use the statement's period controls", "Print or export the financial view"], ["financial-management", "laboratory-analytics"]),
  demoScreen("payroll-periods", "Payroll periods", "Payroll Periods", "The payroll period workspace with the current software's status, navigation and period actions.", "/human-resource/payroll/periods", ["Review payroll cycles and their status", "Navigate period creation and processing", "Follow the configured payroll-period workflow"], ["financial-management"]),
  demoScreen("payroll-compensation", "Staff compensation", "Compensation Management", "The staff compensation workspace, unchanged from the current demo facility.", "/human-resource/payroll/compensation", ["Review staff compensation records", "Manage configured compensation entries", "Keep compensation linked to payroll operations"], ["financial-management"]),
  demoScreen("commissions", "Commissions", "Commissions", "The referral commission workspace and its real links to pending records, information and payments.", "/commissions", ["Review clinician and organization commissions", "Navigate commission records and batches", "Follow recorded commission payments"], ["clinician-organization-management", "financial-management"]),
  demoScreen("quality-control", "Quality control", "Quality control", "The actual quality-control workspace with its current session, control and review surfaces.", "/operations/laboratory/quality-control", ["Review configured control records", "Follow QC sessions and readings", "Use the facility's quality-control review workflow"], ["laboratory-management-system"]),
  demoScreen("incident-reporting", "Incident reporting", "Incident Reporting System", "The current incident reporting page and its original reporting controls.", "/compliance/incident-reporting", ["Record supported incident categories", "Review incident reporting information", "Follow the facility's incident workflow"], ["audit-history-access-controls"]),
  demoScreen("email-templates", "Email templates", "Email Templates", "The email template workspace used to organize the software's configured communications.", "/email-services/templates", ["Review communication templates", "Manage configured email content", "Use the email-service workspace"]),
  demoScreen("sms-dashboard", "SMS dashboard", "SMS dashboard", "The current SMS workspace with its recorded job and delivery indicators.", "/communications/sms/dashboard", ["Review SMS activity", "Navigate message jobs and templates", "Follow configured provider-backed communications"]),
  demoScreen("ultrasound", "Ultrasound", "Ultrasound workflow", "The actual ultrasound operations page, including its original clinical navigation.", "/operations/imaging/ultrasound", ["Review pending ultrasound work", "Navigate configured imaging report workflows", "Use the ultrasound operation's existing controls"], ["ultrasound-imaging-workflows"]),
  demoScreen("home-collection", "Home collection", "Home Collection", "The current home-collection page for coordinating the facility's collection operations.", "/operations/home-collection", ["Review home-collection work", "Coordinate configured assignments and statuses", "Use the existing service-area and order workflow"], ["home-collection"]),
  demoScreen("crm-customers", "Customer management", "Customers", "The real customer workspace with its filters, records and customer-management navigation.", "/crm/customers", ["Find customer records", "Review customer-management activity", "Navigate registration and follow-up workflows"], ["clinician-organization-management"]),
  demoScreen("test-catalog", "Test catalog", "Test catalog", "The actual test-list page used to review the laboratory's configured investigation catalog.", "/settings/applicationsettings/testpanels/testlist", ["Review configured laboratory investigations", "Navigate test and panel settings", "Use the facility's catalog controls"], ["test-creation-report-templates"]),
  demoScreen("report-settings", "Report settings", "Report settings", "The report settings page with the software's real layout and report-presentation controls.", "/settings/applicationsettings/reportSettings", ["Review report presentation settings", "Configure available report preferences", "Use the facility's existing report configuration"], ["test-creation-report-templates"]),
  demoScreen("purchase-orders", "Purchase orders", "Purchase Orders", "The laboratory purchasing page with its actual order list and purchase-order controls.", "/inventory/orders", ["Review purchase orders", "Navigate purchase-order creation and review", "Follow recorded purchasing activity"], ["inventory-management"]),
  demoScreen("inventory-categories", "Inventory categories", "Inventory Categories", "The current inventory category page and its original classification controls.", "/inventory/categories", ["Organize laboratory inventory categories", "Review category records", "Navigate the inventory catalog"], ["inventory-management"]),
  demoScreen("inventory-analytics", "Inventory analytics", "Inventory overview", "The real inventory overview with its current stock and management-reporting surfaces.", "/inventory/analytics", ["Review stock-health indicators", "Explore inventory value and movement views", "Navigate detailed inventory reports"], ["inventory-management", "laboratory-analytics"]),
  demoScreen("pharmacy-settings", "Pharmacy settings", "Pharmacy settings", "The pharmacy's actual configuration workspace, kept separate from laboratory configuration.", "/pharmacy/settings", ["Review pharmacy configuration", "Navigate opening-stock and operating settings", "Use pharmacy-specific controls"]),
  demoScreen("role-workspaces", "Roles & locations", "My roles & locations", "The software's real role-and-location selector, not an invented access-control dashboard.", "/account/roles", ["Review available roles and locations", "Choose an authorized workspace", "Keep role and location context visible"], ["audit-history-access-controls"]),
  {
    id: "department-stock",
    label: "Department stock",
    title: "Follow supplies from a requisition to departmental custody.",
    description: "The stores desk separates review, issue, delivery confirmation, available stock, movement history and staff permissions.",
    src: "/website-assets/images/pls-department-stock.png",
    alt: "Full PLS demo stores requisition desk, including the original application header, sidebar and displayed stock records",
    width: 1440,
    height: 1000,
    sourceRoute: "/inventory/department-stock",
    provenance: demoProvenance,
    workflows: ["Review and approve departmental requisitions", "Issue supplies and confirm deliveries", "Track unreceived and available quantities separately", "Review movement history and staff permissions"],
    solutions: ["inventory-management"],
  },
  {
    id: "pharmacy-inventory",
    label: "Pharmacy purchasing",
    title: "Keep pharmacy stock separate from laboratory supplies.",
    description: "Manage medicines, purchase packs, physical and dispensable stock, received deliveries, purchase orders and suppliers in the pharmacy workspace.",
    src: "/website-assets/images/pls-pharmacy-inventory.png",
    alt: "Full PLS demo pharmacy inventory and purchasing page with the original header, navigation and medicine records",
    width: 1440,
    height: 1000,
    sourceRoute: "/pharmacy/inventory",
    provenance: demoProvenance,
    workflows: ["Maintain medicines and purchase-pack units", "Receive stock into pharmacy inventory", "Review purchase orders and received deliveries", "Follow physical, dispensable and low-stock indicators"],
    solutions: ["inventory-management"],
  },
  {
    id: "pharmacy-pos",
    label: "Pharmacy checkout",
    title: "Bring pharmacy sales and collection into a dedicated checkout.",
    description: "Search the medicine catalog, build a basket and use the pharmacy's financial-day and shift controls rather than mixing dispensary transactions into laboratory stock.",
    src: "/website-assets/images/pls-pharmacy-pos.png",
    alt: "Full PLS demo pharmacy checkout page with its original application header, sidebar, medicine search, basket and payment controls",
    width: 1440,
    height: 1000,
    sourceRoute: "/pharmacy/sell",
    provenance: demoProvenance,
    workflows: ["Search medicines and build a sales basket", "Use configured pharmacy pricing and payment controls", "Operate within the financial-day and cashier-shift workflow", "Keep pharmacy sales independent of laboratory operations"],
    solutions: ["financial-management"],
  },
  { ...demoScreen("inventory-dashboard", "Complete inventory dashboard", "Inventory analytics: stock, custody, costs & reports", "The complete current inventory overview, including stock-health charts, company-owned value by custody, consumption and wastage costs, category valuation, the reorder watchlist and linked reports.", "/inventory/analytics", ["Review inventory value and stock health", "Compare stores and departmental custody", "Inspect consumption, wastage and category valuation", "Explore movement, procurement, supplier, payment and expiry reports"], ["inventory-management", "laboratory-analytics"]), height: 2200 },
  demoScreen("sales-weekly", "Weekly sales analytics", "Weekly Sales Trend", "The actual weekly sales chart and reconciliation table, showing gross revenue, collections, earned revenue, discounts, refunds and expenses in the demo facility.", "/analytics/sales/weeklySalesTrend", ["Compare weekly revenue and collections", "Inspect expenses and net operating cash", "Review the source sales table and period changes"], ["laboratory-analytics", "financial-management", "laboratory-billing"]),
  { ...demoScreen("sales-monthly", "Monthly sales analytics", "Monthly Sales Trend", "Monthly revenue and cash-flow charts, the sales data table and recorded performance summaries.", "/analytics/sales/monthlySalesTrend", ["Switch the displayed sales metrics", "Review monthly revenue, refunds and expenses", "Compare monthly performance and recorded outstanding amounts"], ["laboratory-analytics", "financial-management"]), height: 1600 },
  demoScreen("sales-daily", "Daily sales analytics", "Daily Sales Trend", "The daily sales workspace with its original period filters and metric selectors. The captured default period has no sales records; no values or charts have been fabricated.", "/analytics/sales/dailySalesTrend", ["Select supported reporting periods", "Compare cash collected, earned revenue and expenses", "Use line, bar or area views when the selected period has data"], ["laboratory-analytics", "laboratory-billing"]),
  demoScreen("sales-outstanding", "Outstanding payment analytics", "Outstanding Payments Breakdown", "The current outstanding-payment reporting page and its date filters, retaining the demo facility's zero-balance summary.", "/analytics/sales/outstanding-payments-breakdown", ["Review recorded unpaid balances", "Filter the reporting period", "Inspect available category and debtor breakdowns"], ["laboratory-analytics", "laboratory-billing"]),
  demoScreen("test-volume-analytics", "Yearly test result analytics", "Yearly Test Result Analysis", "The actual year-by-month investigation count matrix, with its test identifiers and monthly, yearly and field-value drilldown controls.", "/analytics/resultanalysis/alltest", ["Review monthly counts by investigation", "Select the reporting year", "Navigate monthly cases and field-value analysis"], ["laboratory-analytics", "laboratory-management-system"]),
  demoScreen("patient-demographics", "Patient age distribution", "Age Distribution of Patients", "The actual patient age-distribution chart and percentage table, showing the demo facility's recorded patients.", "/analytics/patients/age-distribution", ["Review counts by age range", "Change the grouping interval", "Inspect percentages and the underlying distribution table"], ["laboratory-analytics"]),
  demoScreen("patient-dashboard", "Patient analytics summary", "Patient Dashboard Summary", "The current patient summary with total, active, male and female patient indicators.", "/analytics/patients/dashboards", ["Review recorded patient totals", "Inspect active-patient indicators", "Compare the displayed demographic counts"], ["laboratory-analytics"]),
  demoScreen("outsourcing-monthly", "Monthly outsourcing analytics", "Monthly Outsourcing Analytics", "The actual outsourcing chart and report comparing recorded outsourced costs, billed amounts, profit and service counts.", "/analytics/outsourcing/monthly", ["Review outsourced amounts and recorded profit", "Compare monthly outsourcing activity", "Inspect billed amounts and service counts"], ["laboratory-analytics", "financial-management"]),
  demoScreen("outsourcing-profitability", "Hourly outsourcing analytics", "Hourly Outsourcing Pattern", "The hourly outsourcing workspace with its original period and chart controls. The captured day has no outsourcing records.", "/analytics/outsourcing/hourly", ["Select the date for hourly analysis", "Inspect facility outsourcing activity", "Switch chart views when the selected period has data"], ["laboratory-analytics"]),
  demoScreen("expense-dashboard", "Monthly expense analytics", "Monthly Expenses Overview", "The real monthly expense chart and table, including recorded spend, expense counts, average amounts and employee counts.", "/analytics/expenses/monthly-expenses", ["Compare monthly recorded expenses", "Inspect expense counts and average amounts", "Review employee counts and share of spend"], ["laboratory-analytics", "financial-management"]),
  { ...demoScreen("payroll-dashboard", "Payroll analytics dashboard", "Payroll Analytics", "The current payroll dashboard with gross and net pay, employer cost, financial breakdowns, headcount, compensation distributions and period comparisons.", "/human-resource/payroll/analytics", ["Review gross payroll, net payroll and employer cost", "Compare payroll periods and compensation distributions", "Inspect headcount, attendance, leave and processing indicators"], ["laboratory-analytics", "financial-management"]), height: 2200 },
  { ...demoScreen("commission-dashboard", "Commission analytics dashboard", "Commission Analytics Dashboard", "The real commission-payment trend, status chart and recipient-efficiency table, retaining the demo software's original values and layout.", "/analytics/commissions", ["Compare paid, due and waived commission amounts", "Filter periods and recipient types", "Inspect payment trends and recipient efficiency"], ["laboratory-analytics", "financial-management"]), height: 1400 },
  demoScreen("pharmacy-dashboard", "Pharmacy analytics dashboard", "Pharmacy analytics", "The actual pharmacy report workspace, with sales/refund charts, stock health, ledger results and report tabs.", "/pharmacy/analytics", ["Review pharmacy sales and refunds", "Inspect current medicine stock and ledger results", "Explore margins, expiry, suppliers and financial report tabs"], ["laboratory-analytics", "financial-management", "inventory-management"]),
];
