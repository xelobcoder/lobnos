import React from 'react';
import Link from 'next/link';
import { RiTestTubeLine, RiSyringeLine, RiFileTextLine } from '@remixicon/react';
import styles from './adminView.module.css';

const links = [
  {
    href: '/phelobotomy',
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
  }
];

export default function FrontPageLabScientistView() {
  const categories = [...new Set(links.map(link => link.category))];

  return (
    <div className={`${styles.adminDashboard} min-vh-100`}>
      <div className="container-fluid py-5">
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="h3 mb-2">Laboratory Scientist Portal</h1>
            <p className="text-muted">Manage laboratory operations and test processing</p>
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
