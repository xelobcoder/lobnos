import React from 'react';
import Link from 'next/link';
import { RiMoneyDollarCircleLine, RiFileTextLine } from '@remixicon/react';
import styles from './adminView.module.css';

const links = [
  {
    href: '/registration',
    icon: <RiMoneyDollarCircleLine size={24} />,
    text: "Process patient registrations and manage billing workflows efficiently",
    label: 'Registration & Billing',
    category: 'Core Operations',
    description: 'Patient registration and payment processing'
  },
  {
    href: '/instructions',
    icon: <RiFileTextLine size={24} />,
    text: "Access system documentation and user guides",
    label: 'Instructions',
    category: 'Support',
    description: 'System documentation and help'
  }
];

export default function FrontPageFrontdeskView() {
  const categories = [...new Set(links.map(link => link.category))];

  return (
    <div className={`${styles.frontdeskDashboard} min-vh-100`}>
      <div className="container-fluid py-5">
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="h3 mb-2">Front Desk Portal</h1>
            <p className="text-muted">Manage patient registration and billing operations</p>
          </div>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-5">
            <h2 className={`h5 mb-4 text-uppercase ${styles.letterSpacing1}`}>{category}</h2>
            <div className="row g-4">
              {links
                .filter(link => link.category === category)
                .map((link, index) => (
                <div key={index} className="col-12 col-md-6">
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
