import { RiMoneyDollarCircleLine, RiFileList3Line, RiMessage2Line, RiStethoscopeLine, RiBarChartBoxLine, RiFileTextLine, RiSyringeLine, RiTestTubeLine, RiMicroscopeLine, RiPulseLine, RiDashboardLine, RiUserLine, RiSettingsLine, RiShieldCheckLine, RiShoppingCartLine, RiBookletLine, RiMedicineBottleLine } from "@remixicon/react";

export const AdminRoleLinks = [
     {
          href: '/crm/registration',
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Process patient registrations and manage billing workflows efficiently",
          label: "CRM & Billing",
          category: 'Core Operations',
          description: 'Patient registration, billing management, and payment processing'
     },
     {
          href: "/billing/sales/branches",
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Manage sales and billing across multiple branches",
          label: 'Daily Sales',
          category: 'Core Operations',
          description: 'Sales and billing management for multiple branches'
     },
     {
          href: '/operations/laboratory/main/dailyRequest',
          icon: <RiTestTubeLine size={24} />,
          text: "Streamline laboratory test processing and result management",
          label: 'Operations',
          category: 'Core Operations',
          description: 'Complete laboratory workflow management'
     },
     {
          href: '/operations/imaging/ultrasound',
          icon: <RiPulseLine size={24} />,
          text: "Manage medical imaging procedures and reports efficiently",
          label: 'Imaging',
          category: 'Core Operations',
          description: 'Medical imaging and radiology management'
     },
     {
          href: '/operations/phelobotomy',
          icon: <RiSyringeLine size={24} />,
          text: "Organize and track sample collection procedures",
          label: 'Phelobotomy',
          category: 'Core Operations',
          description: 'Sample collection and management'
     },
     {
          href: '/analytics',
          icon: <RiDashboardLine size={24} />,
          text: "Monitor key performance metrics and financial analytics",
          label: 'Analytics',
          category: 'Analytics',
          description: 'Business intelligence and reporting'
     },
     {
          href: '/settings/applicationsettings',
          icon: <RiSettingsLine size={24} />,
          text: "Configure system settings and preferences",
          label: 'Application Settings',
          category: 'Administration',
          description: 'System configuration and settings'
     },
     {
          href: '/billing/expenses',
          icon: <RiFileList3Line size={24} />,
          text: "Track and manage laboratory expenses and costs",
          label: 'Expenses',
          category: 'Finance',
          description: 'Expense tracking and management'
     },


     {
          href: '/communications/sms/dashboard',
          icon: <RiMessage2Line size={24} />,
          text: "Configure and manage SMS notifications",
          label: 'SMS Services',
          category: 'Communication',
          description: 'SMS configuration and management'
     },
     {
          href: '/doctor/consultation',
          icon: <RiStethoscopeLine size={24} />,
          text: "Access and manage doctor consultations",
          label: "Consultation Portal",
          category: 'Healthcare',
          description: 'Doctor consultation management'
     },
     {
          href: '/appointments',
          icon: <RiBarChartBoxLine size={24} />,
          text: "Schedule and manage patient appointments efficiently",
          label: 'Appointments',
          category: 'Core Operations',
          description: 'Patient appointment scheduling and management'
     },
     {
          href: '/inventory',
          icon: <RiFileTextLine size={24} />,
          text: "Access inventory management",
          label: 'Inventory',
          category: 'Support',
          description: 'Inventory management'
     },

     {
          href: "/human-resource/payroll",
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Manage payroll and employee compensation",
          label: 'Payroll',
          category: 'Human Resources',
          description: 'Employee payroll management'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     },
     {
          href: '/commissions',
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Manage sales commissions and compensation",
          label: 'Commissions',
          category: 'Finance',
          description: 'Sales commission management'
     },
     {
          href: '/accounting',
          icon: <RiBookletLine size={24} />,
          text: "General ledger, financial statements and period close",
          label: 'Accounting',
          category: 'Finance',
          description: 'Double-entry ledger, trial balance, P&L, balance sheet and journals',
          roles: ['admin', 'super_admin', 'accountant']
     },
     {
          href: "/email-services",
          icon: <RiMessage2Line size={24} />,
          text: "Configure and manage email notifications",
          label: 'Email Services',
          category: 'Communication',
          description: 'Email configuration and management'
     },
     {
          href: '/pharmacy',
          icon: <RiMedicineBottleLine size={24} />,
          text: "Access pharmacy management",
          label: 'Pharmacy',
          category: 'Support',
          description: 'Pharmacy management',
          roles: ['admin','super_admin','pharmacy_manager','pharmacy_cashier','pharmacy_storekeeper','pharmacy_dispensary_officer','pharmacy_accountant']
     }
];


export const SuperAdminRoleLinks = [
     ...AdminRoleLinks,
     {
          href: '/settings/facilities',
          icon: <RiShieldCheckLine size={24} />,
          label: 'Platform Administration',
          category: 'Administration',
          description: 'Client provisioning, payments, subscriptions and audit logs'
     }
];

export const FrontdeskRoleLinks = [
     {
          href: "/crm/overview",
          icon: <RiDashboardLine size={24} />,
          text: "Overview of CRM activities and metrics",
          label: 'CRM Overview',
          category: 'Core Operations',
          description: 'Dashboard for CRM overview'
     },
     {
          href: '/crm/registration',
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Process patient registrations and manage billing workflows efficiently",
          label: 'Registration & Billing',
          category: 'Core Operations',
          description: 'Patient registration and payment processing'
     },
     {
          href: "/billing/sales/branches",
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Manage sales and billing across multiple branches",
          label: 'Daily Sales',
          category: 'Core Operations',
          description: 'Sales and billing management for multiple branches'
     },
     {
          href: '/appointments',
          icon: <RiFileTextLine size={24} />,
          text: "Schedule and manage patient appointments efficiently",
          label: 'Appointments',
          category: 'Core Operations',
          description: 'Patient appointment scheduling and management'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     },
];



export const LaboratoryScientistRoleLinks = [
     {
          href: '/operations/phelobotomy',
          icon: <RiSyringeLine size={24} />,
          text: "Manage sample collection and phlebotomy procedures",
          label: 'Phlebotomy',
          category: 'Laboratory Operations',
          description: 'Sample collection management'
     },
     {
          href: '/operations/laboratory/main/dailyRequest',
          icon: <RiTestTubeLine size={24} />,
          text: "Process and manage laboratory tests and results",
          label: 'Laboratory',
          category: 'Laboratory Operations',
          description: 'Laboratory test processing'
     },
     {
          href: '/instructions',
          icon: <RiFileTextLine size={24} />,
          text: "Access laboratory procedures and documentation",
          label: 'Instructions',
          category: 'Support',
          description: 'System documentation and procedures'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     }
];


export const PhelobotomyRoleLinks = [
     {
          href: '/phelobotomy',
          icon: <RiSyringeLine size={24} />,
          text: "Manage sample collection procedures and patient records",
          label: 'Phlebotomy',
          category: 'Sample Collection',
          description: 'Blood sample collection management'
     },
     {
          href: '/instructions',
          icon: <RiFileTextLine size={24} />,
          text: "Access phlebotomy procedures and guidelines",
          label: 'Instructions',
          category: 'Support',
          description: 'Documentation and procedures'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     }
];



export const SonographerRoleLinks = [
     {
          href: '/operations/imaging/ultrasound',
          icon: <RiMicroscopeLine size={24} />,
          text: "Manage ultrasound examinations and imaging procedures",
          label: 'Imaging',
          category: 'Medical Imaging',
          description: 'Ultrasound and imaging management'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     }
];



export const procurementRoleLinks = [
     {
          href: '/inventory',
          icon: <RiShoppingCartLine size={24} />,
          text: "Manage procurement and inventory",
          label: 'Inventory',
          category: 'Procurement & Inventory',
          description: 'Procurement and inventory management'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     }
];


export const AccountantRoleLinks = [
     {
          href: '/accounting',
          icon: <RiBookletLine size={24} />,
          text: "Access accounting features including general ledger, financial statements, and period close",
          label: 'Accounting',
          category: 'Finance',
          description: 'Double-entry ledger, trial balance, P&L, balance sheet and journals'
     },
     {
          href: '/compliance/incident-reporting',
          icon: <RiShieldCheckLine size={24} />,
          text: "Report and manage incidents for quality and compliance tracking",
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          description: 'Incident reporting and management system'
     },
     {
          href: '/billing/expenses',
          icon: <RiFileList3Line size={24} />,
          text: "Track and manage laboratory expenses and costs",
          label: 'Expenses',
          category: 'Finance',
          description: 'Expense tracking and management'
     },
     {
          href: "/human-resource/payroll",
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Manage payroll and employee compensation",
          label: 'Payroll',
          category: 'Human Resources',
          description: 'Employee payroll management'
     },
     {
          labwl:"Inventory",
          href: '/inventory',
          icon: <RiShoppingCartLine size={24} />,
          text: "Access inventory management",
          label: 'Inventory',
          category: 'Support',
          description: 'Inventory management'
     }
];