import React from 'react';
import Link from 'next/link';
import styles from './adminView.module.css';
import {
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiMailLine,
  RiStethoscopeLine,
  RiUserLine,
  RiFileTextLine,
  RiFileListLine,
  RiShoppingBag3Line,
  RiBarChartBoxLine
} from '@remixicon/react';

const links = [
  {
    href: '/registration',
    icon: <RiMoneyDollarCircleLine size={24} />,
    text: "Process patient registrations and manage billing workflows efficiently",
    label: 'Registration & Billing',
    category: 'Core Operations',
    description: 'Patient registration, billing management, and payment processing'
  },
  {
    href: '/operations/laboratory',
    icon: <img width={24} height={24} src='sampletubes.png' />,
    text: "Streamline laboratory test processing and result management",
    label: 'Laboratory Operations',
    category: 'Core Operations',
    description: 'Complete laboratory workflow management'
  },
  {
    href: '/operations/imaging/ultrasound',
    icon: <img width={24} height={24} src='/frontpage/ultrasoundmachine.png' />,
    text: "Manage medical imaging procedures and reports efficiently",
    label: 'Medical Imaging',
    category: 'Core Operations',
    description: 'Medical imaging and radiology management'
  },
  {
    href: '/phelobotomy',
    icon: <img width={24} height={24} src='/frontpage/sample.png' />,
    text: "Organize and track sample collection procedures",
    label: 'Phelobotomy',
    category: 'Core Operations',
    description: 'Sample collection and management'
  },
  {
    href: '/administration/approval',
    icon: <img width={24} height={24} src='/frontpage/approved.png' />,
    text: "Review and approve laboratory results and reports",
    label: 'Result Approval',
    category: 'Administration',
    description: 'Result verification and approval workflow'
  },
  {
    href: '/dashboard/sales',
    icon: <img width={24} height={24} src='/frontpage/dashboard.png' />,
    text: "Monitor key performance metrics and financial analytics",
    label: 'Dashboard',
    category: 'Analytics',
    description: 'Business intelligence and reporting'
  },
  {
    href: '/authentication/users',
    icon: <img width={24} height={24} src='/frontpage/users.png' />,
    text: "Manage user accounts, roles, and permissions",
    label: 'Users',
    category: 'Administration',
    description: 'User management and access control'
  },
  {
    href: '/settings/applicationsettings',
    icon: <img width={24} height={24} src='/frontpage/settings.png' />,
    text: "Configure system settings and preferences",
    label: 'Application Settings',
    category: 'Administration',
    description: 'System configuration and settings'
  },
  {
    href: '/expense/expenseslist',
    icon: <RiFileList3Line size={24} />,
    text: "Track and manage laboratory expenses and costs",
    label: 'Expenses',
    category: 'Finance',
    description: 'Expense tracking and management',
    disabled: true
  },
  {
    href: '/supplier',
    icon: <RiShoppingBag3Line size={24} />,
    text: "Manage suppliers and purchase orders",
    label: 'Purchase Management',
    category: 'Finance',
    description: 'Supplier and purchase order management'
  },
  {
    href: '/dashboard/resultanalysis',
    icon: <RiBarChartBoxLine size={24} />,
    text: "Analyze test results and generate insights",
    label: 'Result Analysis',
    category: 'Analytics',
    description: 'Test result analysis and reporting'
  },
  {
    href: '/email',
    icon: <RiMailLine size={24} />,
    text: "Configure and manage email notifications",
    label: 'Email Services',
    category: 'Communication',
    description: 'Email configuration and management'
  },
  {
    href: '/doctor/consultation',
    icon: <RiStethoscopeLine size={24} />,
    text: "Access and manage doctor consultations",
    label: "Doctor's Portal",
    category: 'Healthcare',
    description: 'Doctor consultation management'
  },
  {
    href: '/clients',
    icon: <RiUserLine size={24} />,
    text: "Access and manage patient information",
    label: "Patient's Portal",
    category: 'Healthcare',
    description: 'Patient information management'
  },
  {
    href: '/instructions',
    icon: <RiFileTextLine size={24} />,
    text: "Access system documentation and guides",
    label: 'Instructions',
    category: 'Support',
    description: 'System documentation and help'
  }
];

export default function FrontPageAdminView() {
  const categories = [...new Set(links.map(link => link.category))];
  
  return (
    <div className={`${styles.adminDashboard} min-vh-100`}>
      <div className="container-fluid br-5">
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="h3 mb-2">Laboratory Management System</h1>
            <p className="text-muted">Access and manage all laboratory operations from a single dashboard</p>
          </div>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-5">
            <h2 className={`h5 mb-4 text-uppercase ${styles.letterSpacing1}`}>{category}</h2>
            <div className="row g-4">
              {links
                .filter(link => link.category === category)
                .map((link, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-4 col-xl-3">
                  <div className={`card h-100 border-0 ${styles.appCard}`}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className={`${styles.appIcon} me-3`}>
                          {link.icon}
                        </div>
                        <h3 className="h6 mb-0">{link.label}</h3>
                      </div>
                      <p className="text-muted small mb-3">{link.text}</p>
                      <div className="mt-auto pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          <Link 
                            href={link.href}
                            className={`btn btn-sm px-3 ${styles.primaryBtn}`}
                          >
                            Open App
                          </Link>
                          <Link 
                            href="/" 
                            className="text-muted small text-decoration-none"
                          >
                            Learn more
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
