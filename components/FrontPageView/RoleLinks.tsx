import { RiMoneyDollarCircleLine, RiFileList3Line, RiMessage2Line, RiStethoscopeLine, RiBarChartBoxLine, RiFileTextLine, RiSyringeLine, RiTestTubeLine, RiMicroscopeLine, RiPulseLine, RiDashboardLine, RiUserLine, RiSettingsLine, RiShieldCheckLine } from "@remixicon/react";

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
          href: '/operations/laboratory',
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
          href: '/authentication/users',
          icon: <RiUserLine size={24} />,
          text: "Manage user accounts, roles, and permissions",
          label: 'Users',
          category: 'Administration',
          description: 'User management and access control'
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
          description: 'Expense tracking and management',
          disabled: true
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
          href: '/doctor',
          icon: <RiStethoscopeLine size={24} />,
          text: "Access doctor portal",
          label: 'Doctor',
          category: 'Healthcare',
          description: 'Doctor portal'
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
     }
];


export const FrontdeskRoleLinks = [
     {
          href: '/crm/registration',
          icon: <RiMoneyDollarCircleLine size={24} />,
          text: "Process patient registrations and manage billing workflows efficiently",
          label: 'Registration & Billing',
          category: 'Core Operations',
          description: 'Patient registration and payment processing'
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
          href: '/operations/laboratory',
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


