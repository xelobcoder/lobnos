'use client'
import Link from 'next/link';
import { RiBarChart2Line, RiMoneyDollarCircleLine, RiTestTubeLine, RiUserHeartLine, RiArrowRightLine, RiDashboardLine } from '@remixicon/react';
import { Navbar } from 'react-bootstrap';

export default function AnalyticsCardSumamry() {

     const ALinks = [
          {
               name: "Clinician Analytics ",
               href: "/analytics/clinicians",
               icon: RiUserHeartLine,
               description: "Track Sales ",
               color: "oklch(0.646 0.222 41.116)",
               bgGradient: "linear-gradient(135deg, oklch(0.646 0.222 41.116) 0%, oklch(0.7 0.15 41.116) 100%)"
          },
            {
               name: "Sales Analytics ",
               href: "/analytics/sales ",
               icon: RiUserHeartLine,
               description: "Track Sales ",
               color: "oklch(0.646 0.222 41.116)",
               bgGradient: "linear-gradient(135deg, oklch(0.646 0.222 41.116) 0%, oklch(0.7 0.15 41.116) 100%)"
          },
          {
               name: 'Expenses Analytics',
               href: '/analytics/expenses',
               icon: RiMoneyDollarCircleLine,
               description: "Monitor operational costs, budget tracking, and financial insights",
               color: "oklch(0.68 0.22 15)",
               bgGradient: "linear-gradient(135deg, oklch(0.68 0.22 15) 0%, oklch(0.72 0.18 15) 100%)"
          },
          {
               name: 'Results Analytics',
               href: '/analytics/resultanalysis/alltest',
               icon: RiTestTubeLine,
               description: "Analyze test results, turnaround times, and quality metrics",
               color: "oklch(0.6 0.118 184.704)",
               bgGradient: "linear-gradient(135deg, oklch(0.6 0.118 184.704) 0%, oklch(0.65 0.1 184.704) 100%)"
          },
          {
               name: 'Patient Analytics',
               href: '/analytics/patients',
               icon: RiBarChart2Line,
               description: "Patient demographics, visit patterns, and satisfaction trends",
               color: "oklch(0.769 0.188 70.08)",
               bgGradient: "linear-gradient(135deg, oklch(0.769 0.188 70.08) 0%, oklch(0.8 0.15 70.08) 100%)"
          },
     ]

     return (
          <div>
               <Navbar bg="white" expand="md" className="shadow-sm border-bottom mb-4 rounded-bottom-3 py-2 px-0">
                    <div className="container-fluid px-3 d-flex align-items-center justify-content-between">
                         <Navbar.Brand className="d-flex align-items-center gap-2 ps-0">
                              <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle me-2" style={{ width: 36, height: 36 }}>
                                   <RiDashboardLine size={20} style={{ color: 'oklch(0.646 0.222 41.116)' }} />
                              </div>
                              <span className="fw-bold text-uppercase text-primary mb-0" style={{ fontSize: '1.08rem', letterSpacing: '0.04em' }}>Analytics Dashboard</span>
                         </Navbar.Brand>
                         <div className="ms-auto d-flex align-items-center gap-2">
                              <Link href="/" className="btn btn-sm btn-outline-primary d-flex align-items-center px-3 fw-semibold">
                                   <span className="me-1">Home</span>
                                   <RiArrowRightLine size={15} />
                              </Link>
                         </div>
                    </div>
               </Navbar>
               <div className="analytics-card-summary">
                    <div className="container px-2 py-4">
                         {/* Header Section */}
                         <div className="row mb-4">
                              <div className="col-12">
                                   <div className="text-center">
                                        <div className="d-flex justify-content-center align-items-center mb-2">
                                             <RiDashboardLine size={32} className="me-2" style={{ color: 'oklch(0.646 0.222 41.116)' }} />
                                             <h1 className="h3 fw-bold text-body-emphasis mb-0">Analytics Dashboard</h1>
                                        </div>
                                        <p className="lead text-body-secondary mb-0" style={{ fontSize: '1rem' }}>
                                             Comprehensive insights and data visualization for your healthcare operations
                                        </p>
                                   </div>
                              </div>
                         </div>

                         {/* Analytics Cards Grid */}
                         <div className="row g-3">
                              {Array.isArray(ALinks) && ALinks.length > 0 &&  ALinks.map((link, index) => {
                                   const IconComponent = link.icon;
                                   return (
                                        <div key={index} className="col-md-6 col-12">
                                             <Link
                                                  href={link.href}
                                                  className="text-decoration-none"
                                             >
                                                  <div
                                                       className="card h-100 border-0 shadow-sm position-relative overflow-hidden analytics-card-hover"
                                                       style={{
                                                            borderRadius: '0.75rem',
                                                            transition: 'all 0.3s ease',
                                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                                            minHeight: '160px'
                                                       }}
                                                  >
                                                       {/* Background Accent */}
                                                       <div
                                                            className="position-absolute top-0 end-0 opacity-10"
                                                            style={{
                                                                 width: '70px',
                                                                 height: '70px',
                                                                 background: link.bgGradient,
                                                                 borderRadius: '50%',
                                                                 transform: 'translate(20px, -20px)'
                                                            }}
                                                       ></div>

                                                       <div className="card-body p-3 d-flex flex-column position-relative">
                                                            {/* Icon and Title */}
                                                            <div className="d-flex align-items-center mb-2">
                                                                 <div
                                                                      className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                                      style={{
                                                                           width: '38px',
                                                                           height: '38px',
                                                                           background: link.bgGradient,
                                                                           boxShadow: `0 2px 6px ${link.color}30`
                                                                      }}
                                                                 >
                                                                      <IconComponent size={18} color="white" />
                                                                 </div>
                                                                 <div>
                                                                      <h3
                                                                           className="fs-6 fw-bold mb-1"
                                                                           style={{ color: link.color }}
                                                                      >
                                                                           {link.name}
                                                                      </h3>
                                                                      <div className="d-flex align-items-center text-body-secondary" style={{ fontSize: '0.95rem' }}>
                                                                           <span className="me-1">Explore insights</span>
                                                                           <RiArrowRightLine size={13} />
                                                                      </div>
                                                                 </div>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-body-secondary mb-3 flex-grow-1" style={{ fontSize: '0.97rem' }}>
                                                                 {link.description}
                                                            </p>

                                                            {/* Action Footer */}
                                                            <div className="d-flex align-items-center justify-content-between mt-auto">
                                                                 <span className="badge px-2 py-1" style={{
                                                                      backgroundColor: `${link.color}18`,
                                                                      color: link.color,
                                                                      borderRadius: '6px',
                                                                      fontSize: '0.92rem'
                                                                 }}>
                                                                      View Analytics
                                                                 </span>
                                                                 <div
                                                                      className="rounded-circle d-flex align-items-center justify-content-center"
                                                                      style={{
                                                                           width: '26px',
                                                                           height: '26px',
                                                                           backgroundColor: `${link.color}10`,
                                                                           color: link.color
                                                                      }}
                                                                 >
                                                                      <RiArrowRightLine size={14} />
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </Link>
                                        </div>
                                   );
                              })}
                         </div>

                         {/* Additional Info Section */}
                         <div className="row mt-4">
                              <div className="col-12">
                                   <div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
                                        <div className="card-body p-3 text-center">
                                             <h4 className="fw-semibold text-body-emphasis mb-2" style={{ fontSize: '1.1rem' }}>
                                                  Real-time Data & Insights
                                             </h4>
                                             <p className="text-body-secondary mb-0" style={{ fontSize: '0.97rem' }}>
                                                  All analytics are updated in real-time to provide you with the most current insights
                                                  for data-driven decision making in your healthcare operations.
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <style jsx>{`
                    .analytics-card-hover:hover {
                         transform: translateY(-5px) !important;
                         box-shadow: 0 10px 24px rgba(0,0,0,0.08) !important;
                    }
                    .analytics-card-hover:hover .card-body {
                         background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    }
               `}</style>
               </div>
          </div>
     );
}