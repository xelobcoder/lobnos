'use client';

import React from 'react';
import Link from 'next/link';
import {
     RiMoneyDollarCircleLine,
     RiCalendarLine,
     RiUserLine,
     RiBankCardLine,
     RiArrowRightLine,
     RiFileListLine,
     RiCheckboxCircleLine,
     RiHistoryLine
} from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface QuickAccessCard {
     title: string;
     description: string;
     link: string;
     icon: React.ReactNode;
     color: string;
}

const quickAccessCards: QuickAccessCard[] = [
     {
          title: "Payroll Periods",
          description: "Manage monthly payroll cycles",
          link: "/human-resource/payroll/periods",
          icon: <RiCalendarLine size={32} />,
          color: "#2563eb"
     },
     {
          title: "Process Payroll",
          description: "Calculate and approve payroll",
          link: "/human-resource/payroll/periods/process",
          icon: <RiCheckboxCircleLine size={32} />,
          color: "#16a34a"
     },
     {
          title: "Compensation",
          description: "Employee salary & benefits",
          link: "/human-resource/payroll/compensation",
          icon: <RiBankCardLine size={32} />,
          color: "#ea580c"
     },
     {
          title: "Payroll History",
          description: "View employee payment records",
          link: "/human-resource/payroll/employee/history",
          icon: <RiHistoryLine size={32} />,
          color: "#8b5cf6"
     }
];

export default function PayrollOverviewPage() {
     return (
          <div className="container-fluid px-4 py-3">
               {/* Page Header */}
               <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                         <RiMoneyDollarCircleLine size={32} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h3 mb-0 fw-bold">Payroll Management</h1>
                              <p className="text-muted mb-0">Manage employee compensation and payroll processing</p>
                         </div>
                    </div>
               </div>

               {/* Quick Stats */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCalendarLine size={20} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">Current Period</span>
                              </div>
                              <div className="fs-5 fw-bold">December 2024</div>
                              <div className="small text-success">In Progress</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiUserLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Active Employees</span>
                              </div>
                              <div className="fs-5 fw-bold">0</div>
                              <div className="small text-muted">With compensation</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">Total Gross</span>
                              </div>
                              <div className="fs-5 fw-bold">GHS 0.00</div>
                              <div className="small text-muted">This period</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Status</span>
                              </div>
                              <div className="fs-5 fw-bold">Draft</div>
                              <div className="small text-muted">Not processed</div>
                         </div>
                    </div>
               </div>

               {/* Quick Access Cards */}
               <div className="mb-4">
                    <h5 className="mb-3 fw-semibold">Quick Access</h5>
                    <div className="row g-3">
                         {quickAccessCards.map((card, index) => (
                              <div key={index} className="col-md-6 col-lg-3">
                                   <Link href={card.link} className="text-decoration-none">
                                        <div
                                             className="border rounded p-4 h-100 position-relative overflow-hidden"
                                             style={{
                                                  backgroundColor: 'var(--bs-body-bg)',
                                                  transition: 'all 0.2s',
                                                  cursor: 'pointer'
                                             }}
                                             onMouseEnter={(e) => {
                                                  e.currentTarget.style.borderColor = card.color;
                                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                             }}
                                             onMouseLeave={(e) => {
                                                  e.currentTarget.style.borderColor = COLOR_BORDER;
                                                  e.currentTarget.style.transform = 'translateY(0)';
                                                  e.currentTarget.style.boxShadow = 'none';
                                             }}
                                        >
                                             <div className="mb-3" style={{ color: card.color }}>
                                                  {card.icon}
                                             </div>
                                             <h6 className="fw-bold mb-2 text-body-emphasis">{card.title}</h6>
                                             <p className="small text-muted mb-3">{card.description}</p>
                                             <div className="d-flex align-items-center small" style={{ color: card.color }}>
                                                  <span className="me-1">Access</span>
                                                  <RiArrowRightLine size={16} />
                                             </div>
                                        </div>
                                   </Link>
                              </div>
                         ))}
                    </div>
               </div>

               {/* Recent Activity */}
               <div className="row g-4">
                    <div className="col-12">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">Getting Started</h5>
                              <div className="row g-3">
                                   <div className="col-md-4">
                                        <div className="d-flex align-items-start">
                                             <div className="me-3 mt-1">
                                                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                       1
                                                  </div>
                                             </div>
                                             <div>
                                                  <h6 className="mb-1">Set Up Compensation</h6>
                                                  <p className="small text-muted mb-2">Add employee salary and payment details</p>
                                                  <Link href="/human-resource/payroll/compensation/create" className="small">
                                                       Add Compensation →
                                                  </Link>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-md-4">
                                        <div className="d-flex align-items-start">
                                             <div className="me-3 mt-1">
                                                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                       2
                                                  </div>
                                             </div>
                                             <div>
                                                  <h6 className="mb-1">Create Payroll Period</h6>
                                                  <p className="small text-muted mb-2">Define monthly payroll cycle</p>
                                                  <Link href="/human-resource/payroll/periods/create" className="small">
                                                       Create Period →
                                                  </Link>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-md-4">
                                        <div className="d-flex align-items-start">
                                             <div className="me-3 mt-1">
                                                  <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                                                       3
                                                  </div>
                                             </div>
                                             <div>
                                                  <h6 className="mb-1">Process Payroll</h6>
                                                  <p className="small text-muted mb-2">Calculate and approve payments</p>
                                                  <Link href="/human-resource/payroll/periods/process" className="small">
                                                       Process Now →
                                                  </Link>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
