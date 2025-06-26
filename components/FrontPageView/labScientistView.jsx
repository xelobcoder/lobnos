import React from 'react';
import Link from 'next/link';
import { RiTestTubeLine, RiSyringeLine, RiFileTextLine } from '@remixicon/react';
import styles from './adminView.module.css';

const links = [
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
  }
];

export default function FrontPageLabScientistView() {
  const categories = [...new Set(links.map(link => link.category))];

  return (
    <div className={`${styles.adminDashboard} min-vh-100`}>
      <div className="container-fluid py-5">
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-3" >
              <div className="card-body d-flex flex-column flex-md-row align-items-center justify-content-between py-4 px-4 px-md-5">
                <div className="d-flex align-items-center mb-3 mb-md-0">
                  <img src="/frontpage/lab.jfif" alt="Lab Scientist" width={56} height={56} className="rounded-circle shadow-sm me-3" style={{objectFit:'cover', background:'#fff'}} />
                  <div>
                    <h1 className="h3 mb-1 fw-bold" style={{ color: '#3bb75e', letterSpacing: '1px' }}>Laboratory Scientist Portal</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '1.08rem' }}>Manage laboratory operations and test processing</p>
                  </div>
                </div>
                <div className="d-none d-md-block">
                  <span className="badge rounded-pill bg-success px-4 py-2 fs-6 shadow-sm" style={{ background: '#0ba4db', color: '#fff', letterSpacing: '0.5px' }}>Healthcare Suite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Cluster links in a compact grid, similar to adminView/frontdeskView */}
        <div className="row g-3">
          {links.map((link, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className={`card h-100 border-0 ${styles.appCard}`}>
                <div className="card-body p-3 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center mb-2">
                    <div className={`${styles.appIcon} me-2`}>
                      {link.icon}
                    </div>
                    <h3 className="h6 mb-0">{link.label}</h3>
                  </div>
                  <p className="text-muted small mb-2">{link.text}</p>
                  <div className="mt-auto pt-2 border-top">
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
    </div>
  );
}
