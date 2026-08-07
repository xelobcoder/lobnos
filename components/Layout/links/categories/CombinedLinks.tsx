import { plsEncryption } from '../../../../lib/encryption';
import { Link } from '../types';

import {
     RiDashboardLine,
     RiUserAddLine,
     RiUserStarLine,
     RiCalendarLine,
     RiBuildingLine,
     RiTeamLine,
     RiPriceTag3Line,
     RiCalendarTodoLine,
     RiBarChartBoxLine,
     RiTestTubeLine,
     RiErrorWarningLine,
     RiFileTextLine,
     RiFileList3Line,
     RiStethoscopeLine,
     RiUserHeartLine,
     RiMedicineBottleLine,
     RiFileChartLine,
     RiSettings3Line,
     RiTruckLine,
     RiWalletLine,
     RiShoppingBagLine,
     RiAddBoxLine,
     RiAddCircleLine,
     RiAddLine,
     RiAlarmWarningLine,
     RiAlertLine,
     RiBankCardLine,
     RiBarChart2Line,
     RiBarChartLine,
     RiBillFill,
     RiBox3Line,
     RiBuilding2Line,
     RiBuildingFill,
     RiCalculatorLine,
     RiCalendarCheckLine,
     RiCalendarEventFill,
     RiCalendarEventLine,
     RiCalendarScheduleLine,
     RiCheckboxCircleLine,
     RiCheckLine,
     RiClipboardLine,
     RiCloseCircleLine,
     RiCustomerService2Line,
     RiDeleteBinLine,
     RiExchangeDollarLine,
     RiExternalLinkLine,
     RiEyeLine,
     RiFileAddLine,
     RiFileListLine,
     RiFolderChartLine,
     RiGift2Line,
     RiGitRepositoryFill,
     RiGovernmentLine,
     RiGroupLine,
     RiHeartPulseLine,
     RiHistoryLine,
     RiHome2Line,
     RiLineChartLine,
     RiListCheck2,
     RiLoader4Line,
     RiMailSettingsLine,
     RiMapPinLine,
     RiMedicineBottleFill,
     RiMoneyDollarCircleLine,
     RiMoonLine,
     RiOrganizationChart,
     RiPagesLine,
     RiPercentLine,
     RiPhoneLine,
     RiPriceTagLine,
     RiQuestionMark,
     RiRefundLine,
     RiRulerLine,
     RiScales2Fill,
     RiSearchLine,
     RiSettings2Line,
     RiShieldCheckLine,
     RiShieldLine,
     RiShoppingCartLine,
     RiStarHalfLine,
     RiSteamLine,
     RiStore2Line,
     RiStoreLine,
     RiSubtractLine,
     RiSyringeLine,
     RiTaskLine,
     RiTimeLine,
     RiTrophyLine,
     RiUserFollowLine,
     RiUserLine,
     RiUserSearchLine,
     RiUserSettingsLine
} from '@remixicon/react';

// Dashboard Links
const DoashBoardMainLinks: Link[] = [
     { title: 'Clinician', link: '/dashboard/analytics/clinicians', icon: <RiFileListLine /> },
     { title: "Clients", link: '/dashboard/analytics/patients', icon: <RiFileTextLine /> },
     { title: 'Leads', link: '/dashboard/leads', icon: <RiUserAddLine /> },
     { title: 'Result Analysis', link: "/dashboard/resultanalysis/alltest", icon: <RiTimeLine /> }
];

// Analytics Links
const AnalyticsLinks: Link[] = [
     {
          title: 'Patient Analytics', link: '/analytics/patients', icon: <RiUserHeartLine />,
          children: [
               {
                    title: "Patient Dashboards",

                    icon: <RiBarChartBoxLine size={24} />,
                    link: "/analytics/patients/dashboards",

               },
               {
                    title: "Age Distribution",

                    icon: <RiUserLine size={24} />,
                    link: "/analytics/patients/age-distribution",

               },
               {
                    title: "Gender Distribution",

                    icon: <RiCalculatorLine size={24} />,
                    link: "/analytics/patients/gender-distribution",

               },
               {
                    title: "Marital Status",

                    icon: <RiUserLine size={24} />,
                    link: "/analytics/patients/marital-status",

               },
               {
                    title: "Registration Over Time",

                    icon: <RiCalendarEventLine size={24} />,
                    link: "/analytics/patients/patient-registration-over-time",

               },
               {
                    title: "Occupation Distribution",

                    icon: <RiBarChartBoxLine size={24} />,
                    link: "/analytics/patients/occupation-distribution",

               },
               {
                    title: "Missing Data Analysis",

                    icon: <RiErrorWarningLine size={24} />,
                    link: "/analytics/patients/missing-data-analysis",

               },
               {
                    title: "Contact Completeness",

                    icon: <RiPhoneLine size={24} />,
                    link: "/analytics/patients/contact-completeness",

               },
               {
                    title: "Registration by Day",

                    icon: <RiCalendarEventLine size={24} />,
                    link: "/analytics/patients/registration-by-day",

               }
          ]
     },
     { title: 'Leads Analytics', link: "/analytics/leads", icon: <RiUserAddLine /> },
     { title: 'Compliance Analytics', link: "/analytics/compliance", icon: <RiBarChart2Line /> },
     {
          title: 'Sales Analytics',
          link: "/analytics/sales",
          icon: <RiLineChartLine />,
          children: [
               { title: 'Daily Sales Trend', link: '/analytics/sales/dailySalesTrend', icon: <RiCalendarLine /> },
               { title: 'Monthly Sales Trend', link: '/analytics/sales/monthlySalesTrend', icon: <RiCalendarLine /> },
               { title: 'Sales By Week And Branch', link: '/analytics/sales/salesByWeekAndBranch', icon: <RiBuildingLine /> },
               { title: 'Total Sales By Branch', link: '/analytics/sales/totalSalesByBranch', icon: <RiBuildingLine /> },
               { title: 'Total Sales By Employee', link: '/analytics/sales/totalSalesByEmployee', icon: <RiUserLine /> },
               { title: 'Total Sales By Organization', link: '/analytics/sales/totalSalesByOrganization', icon: <RiBuildingLine /> },
               { title: 'Total Sales By Outsourced Status', link: '/analytics/sales/totalSalesByOutsourcedStatus', icon: <RiPriceTag3Line /> },
               { title: 'Total Sales By Service Category', link: '/analytics/sales/totalSalesByServiceCategory', icon: <RiPriceTag3Line /> },
               { title: 'Weekly Sales Trend', link: '/analytics/sales/weeklySalesTrend', icon: <RiCalendarLine /> },
               { title: 'Yearly Sales Trend', link: '/analytics/sales/yearlySalesTrend', icon: <RiCalendarLine /> }
          ]
     },
     {
          title: 'Expenses Analytics',
          link: "/analytics/expenses",
          icon: <RiMoneyDollarCircleLine />,
          children: [
               {
                    title: 'Expense Analytics',
                    link: '/analytics/expenses',
                    icon: <RiMoneyDollarCircleLine />
               },
               {
                    title: 'Monthly Expenses',
                    link: '/analytics/expenses/monthly-expenses',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: 'Branch Monthly Expenses',
                    link: '/analytics/expenses/branch-monthly-expenses',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: 'Daily Expense Summary',
                    link: '/analytics/expenses/daily-expense-summary',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: 'Weekly Expense Summary',
                    link: '/analytics/expenses/weekly-expense-summary',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: 'Yearly Expense Summary',
                    link: '/analytics/expenses/yearly-expense-summary',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: 'Hourly Expense Summary',
                    link: '/analytics/expenses/hourly-expense-summary',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: 'Top Expense Categories',
                    link: '/analytics/expenses/top-expense-categories',
                    icon: <RiMoneyDollarCircleLine />
               },
               {
                    title: 'Comparative Expense Analysis',
                    link: '/analytics/expenses/comparison-by-period',
                    icon: <RiBarChartBoxLine />
               },
               {
                    title: "Top Expense Employees",
                    link: "/analytics/expenses/top-expense-employees",
                    icon: <RiUserLine />
               },
               {
                    title: "Top Expense Merchants",
                    link: "/analytics/expenses/top-expense-merchants",
                    icon: <RiShoppingBagLine />
               },
               {
                    title: 'Expense Payment Status',
                    link: '/analytics/expenses/expense-payment-status',
                    icon: <RiListCheck2 />
               },
               {
                    title: 'Expense Buckets',
                    link: '/analytics/expenses/expense-buckets',
                    icon: <RiBarChartBoxLine />
               },
               {
                    title: 'Expense Approval Timeline',
                    link: '/analytics/expenses/expense-approval-timeline',
                    icon: <RiTimeLine />
               },
               {
                    title: 'Quarterly Expense Summary',
                    link: '/analytics/expenses/quarterly-expense-summary',
                    icon: <RiScales2Fill />
               },
               {
                    title: 'Expense Growth Rate',
                    link: '/analytics/expenses/expense-growth-rate',
                    icon: <RiLineChartLine />
               }
          ]
     },
     {
          title: 'Results Analytics',
          link: "/analytics/resultanalysis/alltest",
          icon: <RiTestTubeLine />,
          children: [
               { title: 'All Test', link: '/analytics/resultanalysis/alltest', icon: <RiTestTubeLine /> }
          ]
     },
     {
          title: 'Outsourcing Analytics',
          link: "/analytics/outsourcing",
          icon: <RiExternalLinkLine />,
          children: [
               { title: 'Overview', link: '/analytics/outsourcing', icon: <RiListCheck2 /> },
               { title: 'Daily Analytics', link: '/analytics/outsourcing/daily', icon: <RiCalendarLine /> },
               { title: 'Monthly Analytics', link: '/analytics/outsourcing/monthly', icon: <RiCalendarEventFill /> },
               { title: 'Weekly Analytics', link: '/analytics/outsourcing/weekly', icon: <RiCalendarScheduleLine /> },
               { title: 'Quarterly Analytics', link: '/analytics/outsourcing/quarterly', icon: <RiCalendarTodoLine /> },
               { title: 'Yearly Analytics', link: '/analytics/outsourcing/yearly', icon: <RiCalendarCheckLine /> },
               { title: 'Top Facilities', link: '/analytics/outsourcing/top-facilities', icon: <RiTrophyLine /> },
               { title: 'Hourly Analytics', link: '/analytics/outsourcing/hourly', icon: <RiTimeLine /> }
          ]
     }
];

const ExpenseAnalyticsLinks: Link[] = [
     {
          title: 'Expense Analytics',
          link: '/analytics/expenses',
          icon: <RiMoneyDollarCircleLine />
     },
     {
          title: 'Monthly Expenses',
          link: '/analytics/expenses/monthly-expenses',
          icon: <RiCalendarEventFill />
     },
     {
          title: 'Branch Monthly Expenses',
          link: '/analytics/expenses/branch-monthly-expenses',
          icon: <RiCalendarEventFill />
     },
     {
          title: 'Daily Expense Summary',
          link: '/analytics/expenses/daily-expense-summary',
          icon: <RiCalendarEventFill />
     },
     {
          title: 'Weekly Expense Summary',
          link: '/analytics/expenses/weekly-expense-summary',
          icon: <RiCalendarEventFill />
     },
     {
          title: 'Yearly Expense Summary',
          link: '/analytics/expenses/yearly-expense-summary',
          icon: <RiCalendarEventFill />
     },
     {
          title: 'Hourly Expense Summary',
          link: '/analytics/expenses/hourly-expense-summary',
          icon: <RiCalendarEventFill />
     },
     {
          title: 'Top Expense Categories',
          link: '/analytics/expenses/top-expense-categories',
          icon: <RiMoneyDollarCircleLine />
     },
     {
          title: 'Pending Expenses',
          link: '/analytics/expenses/pending-expenses-list',
          icon: <RiListCheck2 />
     },
     {
          title: 'Approval Status By Branch',
          link: '/analytics/expenses/approval-status-by-branch',
          icon: <RiScales2Fill />
     },
     {
          title: 'Expense Count By Status',
          link: '/analytics/expenses/expense-count-by-status',
          icon: <RiScales2Fill />
     }
];

// CRM Links
const CrmLinks: Link[] = [
     {
          title: "Customer Management",
          link: "",
          icon: <RiCustomerService2Line />,
          children: [
               {
                    title: "Customers",
                    link: "/crm/customers",
                    icon: <RiCustomerService2Line />
               },
               {
                    title: "Registration",
                    link: "/crm/registration",
                    icon: <RiUserAddLine />
               },
               {
                    title: "Create Lead",
                    link: "/crm/leads/create-customers-lead",
                    icon: <RiUserAddLine />
               },
               {
                    title: "All Leads",
                    link: "/crm/leads/list",
                    icon: <RiCustomerService2Line />
               },
               {
                    title: "Leads Follow-up",
                    link: "/crm/leads/follow-up",
                    icon: <RiCalendarEventFill />
               },
               {
                    title: "Upcoming Birthdays",
                    link: "/crm/birthdays/upcoming-birthday",
                    icon: <RiCustomerService2Line />
               },
               {
                    title: "Birthday Wishes",
                    link: "/crm/birthdays/wishes",
                    icon: <RiCustomerService2Line />
               }
          ]
     },
     {
          title: "Billing & Sales",
          link: "",
          icon: <RiBillFill />,
          children: [
               {
                    title: "Billing",
                    link: "/billing/patientid",
                    icon: <RiBillFill />
               },
               {
                    title: 'Sales Session',
                    link: '/billing/billing-sessions/sales-session',
                    icon: <RiScales2Fill />
               },
               {
                    title: "Cash Collection",
                    link: "/billing/cash-collection",
                    icon: <RiMoneyDollarCircleLine />
               },
               {
                    title: "Outsourced cases",
                    link: "/billing/outsourced-cases",
                    icon: <RiStoreLine />
               },
               {
                    title: "Test Price List",
                    link: "/crm/pricelist",
                    icon: <RiMoneyDollarCircleLine />
               },
               {
                    title: "Packages",
                    link: "/billing/packages",
                    icon: <RiBox3Line />
               },
               {
                    title: 'Daily Sales Report',
                    link: "/billing/sales/branches",
                    icon: <RiMoneyDollarCircleLine />
               },
               {
                    title: 'Billing Strategies',
                    link: '/billing/billing-strategy/strategies',
                    icon: <RiScales2Fill />
               }
          ]
     },
     {
          title: "Expenses",
          link: "",
          icon: <RiMoneyDollarCircleLine />,
          children: [
               {
                    title: "Expenses",
                    link: "/billing/expenses",
                    icon: <RiMoneyDollarCircleLine />
               },
               {
                    title: "New Expense",
                    link: "/billing/expenses/create-new-expense",
                    icon: <RiAddCircleLine />
               },
               {
                    title: 'Expense Category',
                    link: '/billing/expenses/category',
                    icon: <RiCalendarEventFill />
               },
               {
                    title: "Invoices",
                    link: "/billing/expenses/invoices",
                    icon: <RiBillFill />
               },
               {
                    title: "New Merchants",
                    link: "/billing/expenses/merchants/create",
                    icon: <RiAddBoxLine />
               },

          ]
     },
     {
          title: "Clinicians",
          link: "",
          icon: <RiStethoscopeLine />,
          children: [
               {
                    title: "Clinicians",
                    link: "/clinicians",
                    icon: <RiStethoscopeLine />
               },
               {
                    title: "Add New Clinician",
                    link: "/clinicians/add-new",
                    icon: <RiUserSettingsLine />
               },
               {
                    title: "Select Clinician(Analytics)",
                    link: "/clinicians/selection",
                    icon: <RiUserSettingsLine />
               },
               {
                    title: "Organization",
                    link: "/organization",
                    icon: <RiStethoscopeLine />
               }
          ]
     },
     {
          title: "Financial Operations",
          link: "",
          icon: <RiRefundLine />,
          children: [
               {
                    title: "Refund Management",
                    link: "/billing/refund",
                    icon: <RiRefundLine />
               },
               {
                    title: "Night Adjustments",
                    link: "/billing/settings/night-adjustments",
                    icon: <RiMoonLine />
               }
          ]
     }
];

// Compliance Links
const ComplianceLinks: Link[] = [
     {
          title: "Compliance Management",
          link: "",
          icon: <RiShieldCheckLine />,
          children: [
               {
                    title: "Incident Reporting",
                    link: "/compliance/incident-reporting",
                    icon: <RiAlertLine />
               },
               {
                    title: "Compliance Analytics",
                    link: "/analytics/compliance",
                    icon: <RiBarChartLine />
               }
          ]
     },
     {
          title: "Quality Assurance",
          link: "",
          icon: <RiClipboardLine />,
          children: [
               {
                    title: "Quality Metrics",
                    link: "/compliance/quality-metrics",
                    icon: <RiFileList3Line />
               },
               {
                    title: "Audit Trails",
                    link: "/compliance/audit-trails",
                    icon: <RiGovernmentLine />
               }
          ]
     }
];

// Settings Links
const ApplicationSettingsLinks: Link[] = [
     {
          title: "User Management",
          link: "",
          icon: <RiUserSettingsLine />,
          children: [
               { title: "Users", link: "/authentication/users", icon: <RiUserSettingsLine /> },
               { title: "Departments", link: "/settings/departments", icon: <RiGroupLine /> }
          ]
     },
     {
          title: "Organization",
          link: "",
          icon: <RiBuildingLine />,
          children: [
               { title: "Company Info", link: "/settings/companyprofile", icon: <RiBuildingLine /> },
               { title: "Branches", link: "/settings/branches", icon: <RiBuilding2Line /> },
               { title: "Taxes", link: "/settings/tax", icon: <RiMoneyDollarCircleLine /> }
          ]
     },
     {
          title: "Laboratory",
          link: "",
          icon: <RiTestTubeLine />,
          children: [
               { title: "Sample Types", link: "/settings/applicationsettings/testpanels/sampletypes", icon: <RiTestTubeLine /> },
               { title: "Test Panels", link: "/settings/applicationsettings/testpanels/testlist", icon: <RiListCheck2 /> },
               { title: 'Sample Container', link: '/settings/applicationsettings/sample-containers', icon: <RiSteamLine /> },
               { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields", icon: <RiFileListLine /> },
               { title: "Result Entry Settings", link: "/settings/applicationsettings/resultentrysettings", icon: <RiAddBoxLine /> },
               { title: "Report Settings", link: "/settings/applicationsettings/reportSettings", icon: <RiAddBoxLine /> }
          ]
     },
     {
          title: "Outsourcing",
          link: "",
          icon: <RiBuildingFill />,
          children: [
               { title: 'New Outsourcing Organization', link: '/settings/outsource/new-outsourcing', icon: <RiBuildingFill /> },
               { title: 'Outsourcing List', link: '/settings/outsource', icon: <RiBuilding2Line /> }
          ]
     },
     {
          title: "Billing & Services",
          link: "",
          icon: <RiMoneyDollarCircleLine />,
          children: [
               { title: "Services", link: "/settings/additionalservices", icon: <RiCustomerService2Line /> },
               { title: 'Billing Strategy', link: '/billing/billing-strategy/strategies', icon: <RiStarHalfLine /> },
               { title: 'Insurance Companies', link: '/billing/insurance', icon: <RiGitRepositoryFill /> }
          ]
     },
     {
          title: "Drugs & Pharmacy",
          link: "",
          icon: <RiMedicineBottleLine />,
          children: [
               { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView', icon: <RiMedicineBottleLine /> },
               { title: 'Drugs List', link: '/settings/applicationsettings/drugs', icon: <RiMedicineBottleFill /> }
          ]
     },
     {
          title: "Marketing",
          link: "",
          icon: <RiGift2Line />,
          children: [
               { title: 'Promo Codes', link: '/settings/promos/promo-code-generation', icon: <RiGift2Line /> },
               { title: 'Campaigns', link: '/settings/promos/campaign-creation', icon: <RiGift2Line /> }
          ]
     },
     {
          title: "Records Settings",
          link: "",
          icon: <RiFileListLine />,
          children: [
               { title: "Record Management", link: "/settings/records", icon: <RiFileListLine /> },
               { title: "Data Retention", link: "/settings/records/retention", icon: <RiAddBoxLine /> },
               { title: "Result Accessibility", link: "/settings/records/result-accessible-settings", icon: <RiEyeLine /> },
               { title: "Result Access Requests", link: "/settings/records/result-access-requests", icon: <RiListCheck2 /> },
               { title: "Data Backup & Restore", link: "/settings/records/data-backup-restore", icon: <RiShieldCheckLine /> },
               { title: "Backup Security", link: "/settings/records/backup-security", icon: <RiShieldLine /> },
               { title: "Audit Logs", link: "/settings/records/audit", icon: <RiListCheck2 /> }
          ]
     },
     {
          title: "Email Management",
          link: "",
          icon: <RiMailSettingsLine />,
          children: [
               { title: "Overview", link: "/settings/email-services", icon: <RiMailSettingsLine /> },
               { title: "Templates", link: "/settings/email-services/templates", icon: <RiFileTextLine /> },
               { title: "Providers", link: "/settings/email-services/providers", icon: <RiSettings2Line /> },
               { title: "Settings", link: "/settings/email-services/settings", icon: <RiSettings3Line /> },
               { title: "Notifications", link: "/settings/email-services/notifications", icon: <RiMailSettingsLine /> },
               { title: "Notification Events", link: "/settings/email-services/notifications/events", icon: <RiSettings3Line /> },
               { title: "Notification Templates", link: "/settings/email-services/notifications/templates", icon: <RiFileTextLine /> },
               { title: "Notification Trigger", link: "/settings/email-services/notifications/trigger", icon: <RiMailSettingsLine /> },
               { title: "Notification Queue", link: "/settings/email-services/notifications/queue", icon: <RiCustomerService2Line /> },
               { title: "Notification Logs", link: "/settings/email-services/notifications/logs", icon: <RiFileListLine /> },
               { title: "Queue", link: "/settings/email-services/queue", icon: <RiCustomerService2Line /> },
               { title: "Logs", link: "/settings/email-services/logs", icon: <RiFileListLine /> }
          ]
     }
];

// Operations Links
const LaboratoryOperationsLinks: Link[] = [
     { title: 'Apps Home', link: "/", icon: <RiHome2Line /> },
     { title: 'Customers Vital signs', link: "/operations/laboratory/vitals/record-vital-sign", icon: <RiHeartPulseLine /> },
     { title: "Sample Validation", link: `/operations/laboratory/sample/validation`, icon: <RiTestTubeLine /> },
     { title: "Processing stage", link: `/operations/laboratory/processing`, icon: <RiLoader4Line /> },
     { title: "Completed stage", link: `/operations/laboratory/completed`, icon: <RiCheckboxCircleLine /> },
     { title: "Validation stage", link: `/operations/laboratory/validation`, icon: <RiShieldCheckLine /> },
     { title: "Validated Result", link: `/operations/laboratory/validated`, icon: <RiFileListLine /> },
     { title: 'Audit Log', link: '/operations/laboratory/auditlogs', icon: <RiFileListLine /> },
     { title: 'Patient Archives', link: '/operations/laboratory/patientarchives', icon: <RiFileListLine /> },
     { title: "Critical Values Alert", link: `/operations/laboratory/criticalvaluesAlert`, icon: <RiAlarmWarningLine /> },
     { title: "Turn around Time", link: `/operations/laboratory/turnaroundtime`, icon: <RiTimeLine /> },
     { title: "Stock Management", link: `/operations/laboratory/stockmanagement`, icon: <RiStore2Line /> },
     { title: 'Quality Control', link: '/operations/laboratory/quality-control', icon: <RiQuestionMark /> },
     { title: 'Incident Reporting', link: '/compliance/incident-reporting', icon: <RiShieldCheckLine /> }
];

const ImagingLinks: Link[] = [
     { title: 'Waiting List', link: '/operations/imaging/ultrasound', icon: <RiUserFollowLine /> },
     { title: 'Processed List', link: '/operations/imaging/ultrasound/processedlist', icon: <RiListCheck2 /> },
     { title: 'Create Templates', link: '/operations/imaging/ultrasound/templates', icon: <RiFileAddLine /> },
     { title: 'Ultrasound Templates', link: '/operations/imaging/ultrasound/templates/list', icon: <RiFileListLine /> },
     { title: 'Incident Reporting', link: '/compliance/incident-reporting', icon: <RiShieldCheckLine /> },
];

const PhlebotomyLinks: Link[] = [
     {
          title: "Summary",
          link: "/operations/phelobotomy",
          icon: <RiSyringeLine />
     },
     {
          title: "Phlebotomy Pending Cases",
          link: "/operations/phelobotomy/pending-samples-collection",
          icon: <RiSyringeLine />
     },
     {
          title: "Rejected Samples",
          link: "/operations/phelobotomy/rejectedsamples",
          icon: <RiCloseCircleLine />
     },
     {
          title: "Analytics",
          link: "/operations/phelobotomy/analytics",
          icon: <RiBarChartBoxLine />
     },
];

const AppointmentsLinks: Link[] = [
     { title: 'Appointments Calender', link: '/appointments', icon: <RiCalendarCheckLine /> },
     { title: 'Appointments List', link: '/appointments/appointment-list', icon: <RiTaskLine /> },
     { title: 'Book Appointment', link: '/appointments/book', icon: <RiFileListLine size={18} /> },
     { title: 'Phone Call Log', link: '/appointments/phone-call-log/all-calls', icon: <RiSearchLine /> },
     { title: 'Create Attendance', link: '/appointments/attendance/create-attendance', icon: <RiUserFollowLine /> },
     { title: "Create Shifts", link: "/appointments/attendance/create-shifts", icon: <RiTimeLine /> },
     { title: "Tasks", link: '/appointments/taskmanagement/task-list', icon: <RiCheckLine /> },
     { title: "Create New Tasks", link: "/appointments/taskmanagement/create-new-tasks", icon: <RiFileAddLine /> }
];

const ConsulationLinks: Link[] = [
     {
          title: "Consultation", link: "/doctor/consultation", icon: <RiDashboardLine />, children: [
               { title: 'Consultation Overview', link: '/doctor/consultation', icon: <RiDashboardLine /> },
               { title: 'All Consultations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
               { title: 'Pending Client Consultations', link: '/doctor/consultation/clients/pending', icon: <RiTimeLine /> },
          ]
     },
     {
          title: 'Ascension', link: '/doctor/ascension', icon: <RiTimeLine />, children: [
               { title: "Ascension Status", link: "/doctor/ascension/ascension-status" },
          ]
     }
];

const DoctorsPortalLinks: Link[] = [
     { title: 'Consulations', link: '/doctor/consultation/allconsultations', icon: <RiFileListLine /> },
     { title: "Consult", link: '/doctor/consultation', icon: <RiAddBoxLine /> },
     { title: 'Pending Consultations', link: "/doctor/consultation/clients/pending", icon: <RiTimeLine /> }
];

// Billing Links
const SalesLinks: Link[] = [
     { title: 'Daily Sales Trend', link: '/analytics/sales/dailySalesTrend', icon: <RiFileListLine size={18} /> },
     { title: 'Monthly Sales Trend', link: '/analytics/sales/monthlySalesTrend', icon: <RiFileListLine size={18} /> },
     { title: 'Sales By Week And Branch', link: '/analytics/sales/salesByWeekAndBranch', icon: <RiBuildingLine /> },
     { title: 'Total Sales By Branch', link: '/analytics/sales/totalSalesByBranch', icon: <RiBuildingLine /> },
     { title: 'Total Sales By Clinician', link: '/analytics/sales/totalSalesByClinician', icon: <RiUserLine /> },
     { title: 'Total Sales By Employee', link: '/analytics/sales/totalSalesByEmployee', icon: <RiUserLine /> },
     { title: 'Total Sales By Organization', link: '/analytics/sales/totalSalesByOrganization', icon: <RiBuildingLine /> },
     { title: 'Total Sales By Outsourced Status', link: '/analytics/sales/totalSalesByOutsourcedStatus', icon: <RiFileListLine size={18} /> },
     { title: 'Total Sales By Service Category', link: '/analytics/sales/totalSalesByServiceCategory', icon: <RiFileListLine size={18} /> },
     { title: 'Weekly Sales Trend', link: '/analytics/sales/weeklySalesTrend', icon: <RiFileListLine size={18} /> },
     { title: 'Yearly Sales Trend', link: '/analytics/sales/yearlySalesTrend', icon: <RiFileListLine size={18} /> }
];

const ExpensesLinks: Link[] = [
     {
          title: "expenses",
          link: "/expense",
          icon: <RiMoneyDollarCircleLine />
     },
     {
          title: "expense category",
          link: "/expense/category",
          icon: <RiFolderChartLine />
     },
     {
          title: "new Expense",
          link: "/expense/newExpense",
          icon: <RiFileAddLine />
     },
     {
          title: "New Expense Request",
          link: "/expense/request",
          icon: <RiAddLine />
     }
];

const ServiceCostsLinks: Link[] = [
     {
          title: "Max and Min Service Costs",
          link: "/sales/maxAndMinServiceCosts?targetKey=37",
          icon: <RiBarChartBoxLine />
     },
     {
          title: "Service Cost by Category",
          link: "/sales/serviceCostByCategory?targetKey=38",
          icon: <RiFileListLine size={18} />
     },
     {
          title: "Cost Breakdown by Clinician",
          link: "/sales/costBreakdownByClinician?targetKey=39",
          icon: <RiUserLine />
     },
     {
          title: "Number of Transactions by Branch",
          link: "/sales/numberOfTransactionsByBranch?targetKey=40",
          icon: <RiBuildingLine />
     },
     {
          title: "Total Sales by Transaction ID",
          link: "/sales/totalSalesByTransactionId?targetKey=41",
          icon: <RiMoneyDollarCircleLine />
     },
     {
          title: "Transaction Count by Employee",
          link: "/sales/transactionCountByEmployee?targetKey=42",
          icon: <RiUserLine />
     },
     {
          title: "Total Sales and Transactions by Date",
          link: "/sales/totalSalesAndTransactionsByDate?targetKey=43",
          icon: <RiFileListLine size={18} />,
     }
];

const BillingSalesLink: Link[] = [
     {
          title: "Customers",
          link: "/crm/customers",
          icon: <RiCustomerService2Line />
     },
     {
          title: "Registration",
          link: "/crm/registration",
          icon: <RiUserAddLine />
     },
     {
          title: "Add New Customer",
          link: "/customers/new",
          icon: <RiUserAddLine />
     },
     {
          title: "Billing ",
          link: "/billing/patientid",
          icon: <RiBillFill />
     },

     {
          title: "Expenses",
          link: "/billing/expenses",
          icon: <RiMoneyDollarCircleLine />
     },
     {
          title: "New Expense",
          link: "/billing/expenses/create-new-expense",
          icon: <RiAddCircleLine />
     },

     {
          title: "New Merchants",
          link: "/billing/expenses/merchants/create",
          icon: <RiAddBoxLine />
     },
     {
          title: "Test Price List",
          link: "/crm/pricelist",
          icon: <RiMoneyDollarCircleLine />
     },
     {
          title: "Packages",
          link: "/billing/packages/create-new-package",
          icon: <RiBox3Line />
     },
     {
          title: "Clinicians",
          link: "/clinician",
          icon: <RiStethoscopeLine />
     },
     {
          title: "Add New Clinician",
          link: "/clinician/new",
          icon: <RiUserSettingsLine />
     },
     {
          title: "Refund Management",
          link: "/billing/refund",
          icon: <RiRefundLine />
     },
     {
          title: "Night Adjustments",
          link: "/billing/settings/night-adjustments",
          icon: <RiMoonLine />
     }
];

// Inventory Links
const InventoryLinks: Link[] = [
     {
          title: "Analytics Dashboard",
          link: "/inventory/analytics",
          icon: <RiDashboardLine />,
          children: [
               { title: "Overview", link: "/inventory/analytics", icon: <RiBarChartBoxLine /> },
               { title: "Purchase Orders", link: "/inventory/analytics/purchase-orders", icon: <RiShoppingCartLine /> },
               { title: "Transactions", link: "/inventory/analytics/transactions", icon: <RiHistoryLine /> },
               { title: "Payments", link: "/inventory/analytics/payments", icon: <RiMoneyDollarCircleLine /> },
               { title: "Costs", link: "/inventory/analytics/costs", icon: <RiCalculatorLine /> },
               { title: "Suppliers", link: "/inventory/analytics/suppliers", icon: <RiTruckLine /> },
               { title: "Stock Levels", link: "/inventory/analytics/stock-levels", icon: <RiBarChartBoxLine /> },
               { title: "Movement", link: "/inventory/analytics/movement", icon: <RiHistoryLine /> },
               { title: "Batch Expiry", link: "/inventory/analytics/batch-expiry", icon: <RiAlertLine /> },
               { title: "Procurement", link: "/inventory/analytics/procurement", icon: <RiShoppingCartLine /> },
               { title: "Cost Valuation", link: "/inventory/analytics/cost-valuation", icon: <RiCalculatorLine /> },
               { title: "Usage", link: "/inventory/analytics/usage", icon: <RiBarChartBoxLine /> }
          ]
     },
     {
          title: "Overview",
          link: "/inventory",
          icon: <RiBarChartBoxLine />
     },
     {
          title: "Items",
          link: "/inventory/items",
          icon: <RiBox3Line />
     },
     {
          title: "Categories",
          link: "/inventory/categories",
          icon: <RiPriceTagLine />
     },
     {
          title: "Units",
          link: "/inventory/units",
          icon: <RiRulerLine />
     },
     {
          title: "Suppliers",
          link: "/inventory/suppliers",
          icon: <RiTruckLine />
     },
     {
          title: "Purchase Orders",
          link: "/inventory/orders",
          icon: <RiShoppingCartLine />,
          children: [
               { title: "All Orders", link: "/inventory/orders", icon: <RiFileListLine /> },
               { title: "Received Items History", link: "/inventory/orders/received-items-history", icon: <RiHistoryLine /> }
          ]
     },
     {
          title: "Payments",
          link: "/inventory/payments",
          icon: <RiMoneyDollarCircleLine />,
          children: [
               { title: "All Payments", link: "/inventory/payments", icon: <RiWalletLine /> },
               { title: "Journal Entries", link: "/inventory/payments/journal", icon: <RiFileChartLine /> }
          ]
     },
     {
          title: "Storage Locations",
          link: "/inventory/locations",
          icon: <RiMapPinLine />
     },
     {
          title: "Test Templates",
          link: "/inventory/templates",
          icon: <RiTestTubeLine />
     },
     {
          title: "Stock Consumption",
          link: "/inventory/consumption",
          icon: <RiSubtractLine />
     },
     {
          title: "Stock Wastage",
          link: "/inventory/wastage",
          icon: <RiDeleteBinLine />
     },
     {
          title: "Expired Products",
          link: "/inventory/expired-products",
          icon: <RiAlertLine />,
          children: [
               { title: "Expired Batches", link: "/inventory/expired-products", icon: <RiAlertLine /> },
               { title: "Consumption History", link: "/inventory/expired-products/consumption-history", icon: <RiHistoryLine /> }
          ]
     },
];

// Payroll Links
const PayrollLinks: Link[] = [
     {
          title: "Overview",
          link: "/human-resource/payroll",
          icon: <RiFileListLine size={18} />
     },
     {
          title: "Payroll Periods",
          link: "/human-resource/payroll/periods",
          icon: <RiFileListLine size={18} />,
          children: [
               {
                    title: "All Periods",
                    link: "/human-resource/payroll/periods",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Create Period",
                    link: "/human-resource/payroll/periods/create",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Process Payroll",
                    link: "/human-resource/payroll/periods/process",
                    icon: <RiCheckboxCircleLine size={18} />
               }
          ]
     },
     {
          title: "Compensation",
          link: "/human-resource/payroll/compensation",
          icon: <RiBankCardLine size={20} />,
          children: [
               {
                    title: "All Compensations",
                    link: "/human-resource/payroll/compensation",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Create Compensation",
                    link: "/human-resource/payroll/compensation/create",
                    icon: <RiBankCardLine size={18} />
               },
               {
                    title: "Active Compensations",
                    link: "/human-resource/payroll/compensation/active",
                    icon: <RiCheckboxCircleLine size={18} />
               }
          ]
     },
     {
          title: "Attendance",
          link: "/human-resource/payroll/attendance",
          icon: <RiFileListLine size={18} />,
          children: [
               {
                    title: "All Records",
                    link: "/human-resource/payroll/attendance",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Record Attendance",
                    link: "/human-resource/payroll/attendance/create",
                    icon: <RiTimeLine size={18} />
               },
               {
                    title: "Attendance Summary",
                    link: "/human-resource/payroll/attendance/summary",
                    icon: <RiCheckboxCircleLine size={18} />
               }
          ]
     },
     {
          title: "Salary Grades",
          link: "/human-resource/payroll/salary-grades",
          icon: <RiFileListLine size={18} />,
          children: [
               {
                    title: "All Grades",
                    link: "/human-resource/payroll/salary-grades",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Create Grade",
                    link: "/human-resource/payroll/salary-grades/create",
                    icon: <RiFileListLine size={18} />
               }
          ]
     },
     {
          title: "Tax Configurations",
          link: "/human-resource/payroll/tax-configurations",
          icon: <RiSettings3Line size={20} />,
          children: [
               {
                    title: "All Configurations",
                    link: "/human-resource/payroll/tax-configurations",
                    icon: <RiFileListLine size={18} />
               },
               {
                    title: "Create Configuration",
                    link: "/human-resource/payroll/tax-configurations/create",
                    icon: <RiSettings3Line size={18} />
               }
          ]
     },
     {
          title: "Employee Payroll",
          link: "/human-resource/payroll/employee",
          icon: <RiUserLine size={20} />,
          children: [
               {
                    title: "Payroll History",
                    link: "/human-resource/payroll/employee/history",
                    icon: <RiHistoryLine size={18} />
               },
               {
                    title: "YTD Reports",
                    link: "/human-resource/payroll/employee/ytd",
                    icon: <RiFileListLine size={18} />
               }
          ]
     },
     {
          title: "Settings",
          link: "/human-resource/payroll/settings",
          icon: <RiSettings3Line size={20} />
     }
];

// SMS Links
const SmsLinks: Link[] = [
     { title: "SMS Dashboard", link: "/communications/sms/dashboard", icon: <RiDashboardLine /> },
     { title: "SMS Jobs", link: "/communications/sms/jobs/list", icon: <RiFileListLine /> },
     { title: 'Create SMS Job', link: '/communications/sms/jobs', icon: <RiFileAddLine /> },
     { title: "Laboratory Lifecycle Events", link: "/communications/sms/laboratory-lifecycle-events", icon: <RiHistoryLine /> },
     { title: "SMS Templates", link: "/communications/sms/templates", icon: <RiFileAddLine /> },
];

// Organization Links
const OrganizationMainLinks: Link[] = [
     { title: 'New Organization', link: '/organization/new', icon: <RiUserHeartLine /> },
     { title: 'Organizations', link: "/organization", icon: <RiUserStarLine /> },
     {
          title: 'outsourcing',
          link: '/settings/outsource',
          icon: <RiUserStarLine />
     },
     { title: 'Outsourcing Services', link: '/organization/outsource', icon: <RiUserStarLine /> },
     { title: 'Outsourced Cases Tracking', link: '/organization/outsource/outsourced-cases-tracking', icon: <RiUserStarLine /> }
];

// Clinician Links
const ClinicianLinks: Link[] = [
     { title: 'Clinicians List', link: '/clinicians', icon: <RiTeamLine /> },
     { title: 'New Clinician ', link: '/clinicians/add-new', icon: <RiUserSettingsLine /> },
     { title: 'Commission Information', link: '/clinicians/commision-information', icon: <RiFileListLine size={18} /> },
     { title: 'Commissions Payments Made', link: '/clinicians/commissions-payments-made', icon: <RiFileListLine size={18} /> }
];

export const CombinedLinks = {
     dashboard: DoashBoardMainLinks,
     operations: [...LaboratoryOperationsLinks],
     imaging: ImagingLinks,
     phlebotomy: PhlebotomyLinks,
     appointments: AppointmentsLinks,
     doctorportal: DoctorsPortalLinks,
     consultation: ConsulationLinks,
     analytics: [...AnalyticsLinks, ...ExpenseAnalyticsLinks],
     billing: [...SalesLinks, ...ExpensesLinks, ...ServiceCostsLinks, ...BillingSalesLink],
     crm: CrmLinks,
     compliance: ComplianceLinks,
     settings: ApplicationSettingsLinks,
     inventory: InventoryLinks,
     payroll: PayrollLinks,
     sms: SmsLinks,
     organization: OrganizationMainLinks,
     clinician: ClinicianLinks
};

// Function-based links
export const ApplicationBillingLinks = function (branchid: number, employeeid: number): Link[] {
     return [
          { title: 'Filter Client', link: '/billing/patientid', icon: <RiUserSearchLine /> },
          { title: 'packages', link: '/billing/packages/create-new-package', icon: <RiPagesLine /> },
          { title: 'Bill settings Night Adjustment', link: '/billing/settings/night-adjustments', icon: <RiMoonLine /> },
          { title: 'Daily Transactions', link: '/billing/sales/branches', icon: <RiExchangeDollarLine /> },
          { title: "Refund Admin", link: `/billing/refund/refundAdmin/${employeeid}`, icon: <RiRefundLine /> },
          { title: "Refund FrontDesk Representative", link: `/billing/refund/${employeeid}`, icon: <RiRefundLine /> },
          { title: "Sales", link: "/billing/salessummary", icon: <RiMoneyDollarCircleLine /> },
          { title: "Application UI customization", link: "/settings/applicationsettings/customization", icon: <RiSettings2Line /> }
     ];
};

export const OutSourcingAnalyticsLinks = function (branchid: number, employeeid: number): Link[] {
     const branchId = plsEncryption(branchid.toString());
     return [
          {
               title: "Total Sales from Outsourced Services",
               link: "/sales/totalSalesFromOutsourcedServices?targetKey=34",
               icon: <RiExternalLinkLine />
          },
          {
               title: "Sales from Outsourced by Branch",
               link: "/sales/salesFromOutsourcedByBranch?targetKey=35",
               icon: <RiBuildingLine />
          },
          {
               title: "Number of Outsourced Services by Org",
               link: "/sales/numberOfOutsourcedServicesByOrg?targetKey=36",
               icon: <RiOrganizationChart />
          }
     ];
};

export const SalesOverViewLinks = function (branchid: number, employeeid: number): Link[] {
     const branchId = plsEncryption(branchid.toString());
     return [
          {
               title: "Total Sales by Service Category",
               link: "/sales/totalSalesByServiceCategory?targetKey=0",
               icon: <RiBarChartBoxLine />
          },
          {
               title: "Average Cost per Service",
               link: "/sales/averageCostPerService?targetKey=1",
               icon: <RiMoneyDollarCircleLine />
          },
          {
               title: "Total Tax by Service Category",
               link: "/sales/totalTaxByServiceCategory?targetKey=15",
               icon: <RiPercentLine />
          },
          {
               title: "Sales with Highest Tax Included",
               link: "/sales/salesWithHighestTaxIncluded?targetKey=18",
               icon: <RiFileListLine size={18} />,
          },
          {
               title: "Total Discount by Branch",
               link: "/sales/totalDiscountByBranch?targetKey=20",
               icon: <RiBuildingLine />
          },
          {
               title: "Average Discount per Service",
               link: "/sales/averageDiscountPerService?targetKey=21",
               icon: <RiPercentLine />
          },
          {
               title: "Total Discount by Clinician",
               link: "/sales/totalDiscountByClinician?targetKey=22",
               icon: <RiUserLine />
          },
          {
               title: "Total Sales by Branch",
               link: "/sales/totalSalesByBranch?targetKey=2",
               icon: <RiBuildingFill />
          },
          {
               title: "Total Sales by Clinician",
               link: "/sales/totalSalesByClinician?targetKey=3",
               icon: <RiUserLine />
          },
          {
               title: "Total Sales by Employee",
               link: "/sales/totalSalesByEmployee?targetKey=4",
               icon: <RiUserLine />
          },
          {
               title: "Total Sales by Organization",
               link: "/sales/totalSalesByOrganization?targetKey=5",
               icon: <RiBuildingLine />
          },
          {
               title: "Total Sales by Outsourced Status",
               link: "/sales/totalSalesByOutsourcedStatus?targetKey=6",

          },
          {
               title: "Total Sales by Service Category",
               link: "/sales/totalSalesByServiceCategory?targetKey=7",

          },
          {
               title: "Daily Sales Trend",
               link: "/sales/dailySalesTrend?targetKey=8",
               icon: <RiFileListLine size={18} />,
          },
          {
               title: "Weekly Sales Trend",
               link: "/sales/weeklySalesTrend?targetKey=9",
               icon: <RiFileListLine size={18} />,
          },
          {
               title: "Monthly Sales Trend",
               link: "/sales/monthlySalesTrend?targetKey=10",
               icon: <RiFileListLine size={18} />,
          },
          {
               title: "Yearly Sales Trend",
               link: "/sales/yearlySalesTrend?targetKey=11",
               icon: <RiFileListLine size={18} />,
          },
          {
               title: "Sales by Week and Branch",
               link: "/sales/salesByWeekAndBranch?targetKey=12",
               icon: <RiBuildingLine />
          },
          {
               title: "Total Transactions",
               link: "/sales/totalTransactions?targetKey=13",
               icon: <RiBarChartBoxLine />
          },
          {
               title: "Total Revenue",
               link: "/sales/totalRevenue?targetKey=14",
               icon: <RiMoneyDollarCircleLine />
          }
     ];
};