export type AnalyticsArea = {
  id: string;
  title: string;
  category: "Clinical" | "Financial" | "Supply" | "People";
  description: string;
  reports: string[];
  route: string;
  evidence: string[];
  screenIds?: string[];
};

export const analyticsAreas: AnalyticsArea[] = [
  {
    id: "results", title: "Test volume & result analysis", category: "Clinical",
    description: "Follow investigation volumes and inspect the recorded values behind the workload.",
    reports: ["Yearly test counts by test and month", "Monthly case totals", "Active case days & average cases per day", "Hourly case drilldowns", "Positive / negative result categories", "Field-value counts & buckets", "Numeric field minimum & maximum"],
    route: "/analytics/resultanalysis/alltest",
    evidence: ["app/analytics/resultanalysis/alltest/page.tsx:112", "app/analytics/resultanalysis/monthcasecount/page.tsx:590", "app/analytics/resultanalysis/fieldvalues/page.tsx:157"],
    screenIds: ["test-volume-analytics"],
  },
  {
    id: "sales", title: "Sales, revenue & collections", category: "Financial",
    description: "Distinguish billed activity, earned revenue and actual collections instead of treating them as one number.",
    reports: ["Daily, weekly, monthly & yearly trends", "Gross & earned revenue", "Cash collected", "Discounts & refunds", "Expenses paid & net operating cash", "Clinician service counts & collection rate", "Employee, organization & service-category breakdowns"],
    route: "/analytics/sales/dailySalesTrend",
    evidence: ["app/analytics/sales/dailySalesTrend/page.tsx:26", "app/analytics/sales/totalSalesByClinician/page.tsx:32"],
    screenIds: ["sales-weekly", "sales-monthly", "sales-daily"],
  },
  {
    id: "outstanding", title: "Outstanding payments & aging", category: "Financial",
    description: "See where unpaid balances sit and drill into the records behind them.",
    reports: ["Total outstanding", "Patient & transaction balances", "Service-category breakdowns", "Branch & organization balances", "Aging buckets", "Top debtors", "Billing-versus-service reconciliation"],
    route: "/analytics/sales/outstanding-payments-breakdown",
    evidence: ["app/analytics/sales/outstanding-payments-breakdown/page.tsx:230"],
    screenIds: ["sales-outstanding"],
  },
  {
    id: "outsourcing", title: "Outsourcing activity & profitability", category: "Financial",
    description: "Review outsourced service volume, recorded outsourcing costs and profit by period or facility.",
    reports: ["Outsourced amounts", "Recorded profit amounts", "Service counts", "Share of total activity", "Facility breakdowns", "Hourly through yearly views"],
    route: "/analytics/outsourcing/hourly",
    evidence: ["app/analytics/outsourcing/hourly/page.tsx:120", "app/analytics/outsourcing/[outsourceid]/page.tsx:641"],
    screenIds: ["outsourcing-monthly", "outsourcing-profitability"],
  },
  {
    id: "expenses", title: "Expense analysis", category: "Financial",
    description: "Inspect recorded spending across periods and the employees, categories and merchants involved.",
    reports: ["Monthly expenses paid", "Expense counts & average amount", "Unique employees", "Share of monthly spend", "Daily through yearly summaries", "Category, employee & merchant reports"],
    route: "/analytics/expenses/monthly-expenses",
    evidence: ["app/analytics/expenses/monthly-expenses/page.tsx:92", "app/analytics/expenses/top-expense-categories/page.tsx:1"],
    screenIds: ["expense-dashboard"],
  },
  {
    id: "patients", title: "Patient demographics & data quality", category: "Clinical",
    description: "Understand the patient population and identify gaps in registration data.",
    reports: ["Age-range counts", "Gender & marital-status distributions", "Registration trends", "Total & active patients", "Missing email, mobile & middle name", "Contact completeness"],
    route: "/analytics/patients/dashboards",
    evidence: ["app/analytics/patients/dashboards/page.tsx:1", "app/analytics/patients/missing-data-analysis/page.tsx:1", "app/analytics/patients/age-distribution/page.tsx:1"],
    screenIds: ["patient-demographics", "patient-dashboard"],
  },
  {
    id: "clinicians", title: "Clinician & referral performance", category: "People",
    description: "Connect clinician activity and referral relationships to recorded financial performance.",
    reports: ["Cases managed", "Service cost & sales", "Withholding tax", "Referral cases & unique patients", "Billed revenue", "Accrued commissions"],
    route: "/analytics/clinicians",
    evidence: ["app/clinicians-analytics/[clinicianid]/page.tsx:1"],
  },
  {
    id: "leads", title: "Acquisition pipeline & follow-ups", category: "People",
    description: "Keep prospect progress and relationship follow-up visible in the current CRM workspace.",
    reports: ["Prospect pipeline stages", "Clinician / organization prospect types", "Follow-ups due today & overdue", "Reminder counts", "First-referral & handover status", "Relationship-attention categories"],
    route: "/crm/acquisition?tab=prospects",
    evidence: ["app/analytics/leads/page.tsx:1"],
  },
  {
    id: "commissions", title: "Commission analytics", category: "Financial",
    description: "Review commission obligations and recorded payments across periods and recipients.",
    reports: ["Total paid, due & waived", "Payment percentage", "Average paid", "Period & status breakdowns", "Recipient payment efficiency"],
    route: "/analytics/commissions",
    evidence: ["app/analytics/commissions/page.tsx:94"],
    screenIds: ["commission-dashboard"],
  },
  {
    id: "inventory", title: "Inventory, custody & procurement", category: "Supply",
    description: "See company-owned stock, where it is held, what it costs to use, and what needs attention.",
    reports: ["Inventory value & stock health", "Low / out-of-stock and active item counts", "Value by custody & category", "Consumption & wastage costs", "Reorder watchlist", "Movement, usage & valuation reports", "Procurement, suppliers & payment timing", "Batch expiry & item histories"],
    route: "/inventory/analytics",
    evidence: ["app/inventory/analytics/page.tsx:9", "components/inventory/InventoryAnalyticsCharts.tsx:12"],
    screenIds: ["inventory-dashboard", "inventory-analytics", "department-stock"],
  },
  {
    id: "payroll", title: "Payroll & workforce analytics", category: "People",
    description: "Bring payroll spending, staffing and compensation distributions into one reporting workspace.",
    reports: ["Financial KPIs & headcount", "Payroll-period metrics", "Compensation & earnings distributions", "Attendance & compliance", "Leave statistics & utilization", "Allowances, bonuses & deductions", "Overtime & top earners"],
    route: "/human-resource/payroll/analytics",
    evidence: ["app/human-resource/payroll/analytics/page.tsx:334", "app/human-resource/payroll/analytics/page.tsx:975"],
    screenIds: ["payroll-dashboard"],
  },
  {
    id: "pharmacy", title: "Pharmacy sales, margins & stock", category: "Supply",
    description: "Review pharmacy-specific sales, profitability and supply reports separately from laboratory operations.",
    reports: ["Net sales & refunds", "Book gross profit & operating profit", "Stock at cost & medicine counts", "Reorder & out-of-stock counts", "Sales & margin reports", "Expiry, purchasing & suppliers", "Stock movements"],
    route: "/pharmacy/analytics",
    evidence: ["app/pharmacy/analytics/page.tsx:8", "app/pharmacy/analytics/page.tsx:33"],
    screenIds: ["pharmacy-dashboard"],
  },
  {
    id: "imaging", title: "Imaging activity", category: "Clinical",
    description: "Review recorded ultrasound and imaging workload by modality, date and staff member.",
    reports: ["Cases with results", "Ultrasound case counts", "Staff involved", "Cases worked by user", "Modality breakdown", "Daily case volume"],
    route: "/analytics/imaging",
    evidence: ["app/analytics/imaging/page.tsx:149", "app/analytics/imaging/page.tsx:221"],
  },
  {
    id: "specimens", title: "Physical samples & specimen reports", category: "Clinical",
    description: "Follow physical samples, review decisions and rejection communication records.",
    reports: ["Physical Sample Summary", "Sample status counts", "Review-request decisions", "Rejection communication & delivery statuses", "Selected-period record counts", "Collection & container details", "Sample audit history"],
    route: "/operations/phelobotomy/sample-summary",
    evidence: ["components/phelobotomy/SampleReportsWorkspace.tsx:15", "components/phelobotomy/SampleReportsWorkspace.tsx:42"],
  },
  {
    id: "compliance", title: "Incident & compliance analytics", category: "Clinical",
    description: "Make incident workload, escalation and resolution patterns easier to inspect.",
    reports: ["Total & open incidents", "Average resolution time", "Escalation rate", "Type, severity & status breakdowns", "Monthly trends", "Location & employee breakdowns", "Regulatory-reporting incidents"],
    route: "/analytics/compliance",
    evidence: ["app/analytics/compliance/page.tsx:120", "app/analytics/compliance/page.tsx:173"],
  },
];

export const analyticsScreenIds = ["sales-weekly", "sales-monthly", "sales-daily", "sales-outstanding", "test-volume-analytics", "patient-demographics", "patient-dashboard", "outsourcing-monthly", "outsourcing-profitability", "expense-dashboard", "payroll-dashboard", "commission-dashboard", "pharmacy-dashboard", "inventory-dashboard", "inventory-analytics", "income-statement", "general-ledger", "sms-dashboard"] as const;
