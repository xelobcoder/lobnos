'use client'
import Link from 'next/link';
import { RiBarChart2Line, RiMoneyDollarCircleLine, RiTestTubeLine, RiUserHeartLine, RiArrowRightLine, RiDashboardLine, RiUserAddLine, RiDatabase2Line, RiLineChartLine, RiPulseLine } from '@remixicon/react';
import { Navbar } from 'react-bootstrap';

export default function AnalyticsCardSumamry() {
     
     const ALinks = [
          {
               name: "Leads Analytics",
               href: "/analytics/leads",
               icon: RiUserAddLine,
               description: "Lead generation, conversion tracking, and sales pipeline insights",
               color: "oklch(0.55 0.22 142)",
               bgGradient: "linear-gradient(135deg, oklch(0.55 0.22 142) 0%, oklch(0.6 0.18 142) 100%)",
               stats: "245 leads",
               trend: "+12% this month"
          },
          {
               name: "Clinician Analytics",
               href: "/analytics/clinicians",
               icon: RiUserHeartLine,
               description: "Clinician performance, case load analysis, and productivity metrics",
               color: "oklch(0.646 0.222 41.116)",
               bgGradient: "linear-gradient(135deg, oklch(0.646 0.222 41.116) 0%, oklch(0.7 0.15 41.116) 100%)",
               stats: "89 clinicians",
               trend: "+5% efficiency"
          },
          {
               name: "Sales Analytics",
               href: "/analytics/sales",
               icon: RiLineChartLine,
               description: "Revenue tracking, sales trends, and financial performance analysis",
               color: "oklch(0.68 0.22 15)",
               bgGradient: "linear-gradient(135deg, oklch(0.68 0.22 15) 0%, oklch(0.72 0.18 15) 100%)",
               stats: "$125K revenue",
               trend: "+18% growth"
          },
          {
               name: 'Expenses Analytics',
               href: '/analytics/expenses',
               icon: RiMoneyDollarCircleLine,
               description: "Cost monitoring, budget analysis, and operational expense insights",
               color: "oklch(0.7 0.15 25)",
               bgGradient: "linear-gradient(135deg, oklch(0.7 0.15 25) 0%, oklch(0.75 0.12 25) 100%)",
               stats: "$45K spent",
               trend: "-8% reduction"
          },
          {
               name: 'Results Analytics',
               href: '/analytics/resultanalysis/alltest',
               icon: RiTestTubeLine,
               description: "Test performance, turnaround times, and quality assurance metrics",
               color: "oklch(0.6 0.118 184.704)",
               bgGradient: "linear-gradient(135deg, oklch(0.6 0.118 184.704) 0%, oklch(0.65 0.1 184.704) 100%)",
               stats: "2.4K tests",
               trend: "98.5% accuracy"
          },
          {
               name: 'Patient Analytics',
               href: '/analytics/patients',
               icon: RiBarChart2Line,
               description: "Patient demographics, visit patterns, and satisfaction analytics",
               color: "oklch(0.769 0.188 70.08)",
               bgGradient: "linear-gradient(135deg, oklch(0.769 0.188 70.08) 0%, oklch(0.8 0.15 70.08) 100%)",
               stats: "1.2K patients",
               trend: "+15% retention"
          },
     ]

     return (
          <div className="min-vh-100 bg-light">
               <Navbar bg="white" expand="md" className="shadow-sm border-bottom mb-0 py-3 px-0">
                    <div className="container-fluid px-4 d-flex align-items-center justify-content-between">
                         <Navbar.Brand className="d-flex align-items-center gap-3 ps-0">
                              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 me-1" style={{ width: 48, height: 48 }}>
                                   <RiDashboardLine size={24} style={{ color: 'oklch(0.646 0.222 41.116)' }} />
                              </div>
                              <div>
                                   <h4 className="fw-bold text-primary mb-0" style={{ fontSize: '1.25rem', letterSpacing: '0.02em' }}>Analytics Center</h4>
                                   <small className="text-muted">Data-driven insights for healthcare excellence</small>
                              </div>
                         </Navbar.Brand>
                         <div className="ms-auto d-flex align-items-center gap-3">
                              <div className="d-flex align-items-center gap-2 text-muted">
                                   <RiPulseLine size={16} />
                                   <small>Live Data</small>
                              </div>
                              <Link href="/" className="btn btn-primary btn-sm d-flex align-items-center px-3 fw-semibold rounded-pill">
                                   <span className="me-1">Back to Dashboard</span>
                                   <RiArrowRightLine size={14} />
                              </Link>
                         </div>
                    </div>
               </Navbar>

               <div className="analytics-dashboard">
                    <div className="container-fluid px-4 py-5">
                         {/* Hero Section */}
                         <div className="row mb-5">
                              <div className="col-12">
                                   <div className="text-center">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-4" style={{ width: 80, height: 80 }}>
                                             <RiDatabase2Line size={40} className="text-primary" />
                                        </div>
                                        <h1 className="display-5 fw-bold text-dark mb-3">Analytics Dashboard</h1>
                                        <p className="lead text-muted mb-0 fs-5" style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                                             Comprehensive data visualization and insights to drive informed decisions across your healthcare operations
                                        </p>
                                   </div>
                              </div>
                         </div>

                         {/* Quick Stats Row */}
                         <div className="row g-4 mb-5">
                              <div className="col-md-3 col-sm-6">
                                   <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                                                  <RiUserAddLine size={28} className="text-primary" />
                                             </div>
                                             <h2 className="h4 fw-bold text-dark mb-1">245</h2>
                                             <p className="text-muted mb-2 small">Active Leads</p>
                                             <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill">
                                                  <RiLineChartLine size={12} className="me-1" />
                                                  +12% this month
                                             </span>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-sm-6">
                                   <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                                                  <RiLineChartLine size={28} className="text-success" />
                                             </div>
                                             <h2 className="h4 fw-bold text-dark mb-1">$125K</h2>
                                             <p className="text-muted mb-2 small">Monthly Revenue</p>
                                             <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill">
                                                  <RiLineChartLine size={12} className="me-1" />
                                                  +18% growth
                                             </span>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-sm-6">
                                   <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                                                  <RiTestTubeLine size={28} className="text-info" />
                                             </div>
                                             <h2 className="h4 fw-bold text-dark mb-1">2.4K</h2>
                                             <p className="text-muted mb-2 small">Tests Processed</p>
                                             <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill">
                                                  <RiLineChartLine size={12} className="me-1" />
                                                  98.5% accuracy
                                             </span>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-3 col-sm-6">
                                   <div className="card border-0 shadow-sm h-100 rounded-4">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                                                  <RiUserHeartLine size={28} className="text-warning" />
                                             </div>
                                             <h2 className="h4 fw-bold text-dark mb-1">89</h2>
                                             <p className="text-muted mb-2 small">Active Clinicians</p>
                                             <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill">
                                                  <RiLineChartLine size={12} className="me-1" />
                                                  +5% efficiency
                                             </span>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Analytics Modules Grid */}
                         <div className="row g-4">
                              {Array.isArray(ALinks) && ALinks.length > 0 && ALinks.map((link, index) => {
                                   const IconComponent = link.icon;
                                   return (
                                        <div key={index} className="col-xl-4 col-lg-6 col-md-6 col-12">
                                             <Link
                                                  href={link.href}
                                                  className="text-decoration-none"
                                             >
                                                  <div
                                                       className="card h-100 border-0 shadow-sm position-relative overflow-hidden analytics-card-hover rounded-4"
                                                       style={{
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                                                            minHeight: '280px'
                                                       }}
                                                  >
                                                       {/* Background Pattern */}
                                                       <div
                                                            className="position-absolute top-0 end-0 opacity-5"
                                                            style={{
                                                                 width: '120px',
                                                                 height: '120px',
                                                                 background: link.bgGradient,
                                                                 borderRadius: '50%',
                                                                 transform: 'translate(40px, -40px)',
                                                                 filter: 'blur(20px)'
                                                            }}
                                                       ></div>

                                                       {/* Accent Border */}
                                                       <div
                                                            className="position-absolute top-0 start-0 w-100"
                                                            style={{
                                                                 height: '4px',
                                                                 background: link.bgGradient,
                                                                 borderRadius: '0.75rem 0.75rem 0 0'
                                                            }}
                                                       ></div>

                                                       <div className="card-body p-4 d-flex flex-column position-relative h-100">
                                                            {/* Header Section */}
                                                            <div className="d-flex align-items-start justify-content-between mb-3">
                                                                 <div
                                                                      className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                                                      style={{
                                                                           width: '56px',
                                                                           height: '56px',
                                                                           background: link.bgGradient,
                                                                           boxShadow: `0 8px 24px ${link.color}25`
                                                                      }}
                                                                 >
                                                                      <IconComponent size={24} color="white" />
                                                                 </div>
                                                                 <div className="flex-grow-1">
                                                                      <h4
                                                                           className="fw-bold mb-2 lh-sm"
                                                                           style={{ color: link.color, fontSize: '1.1rem' }}
                                                                      >
                                                                           {link.name}
                                                                      </h4>
                                                                 </div>
                                                            </div>

                                                            {/* Stats Section */}
                                                            <div className="mb-3">
                                                                 <div className="d-flex align-items-center justify-content-between mb-2">
                                                                      <span className="fw-bold text-dark fs-5">{link.stats}</span>
                                                                      <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill small">
                                                                           {link.trend}
                                                                      </span>
                                                                 </div>
                                                                 <div className="progress" style={{ height: '4px' }}>
                                                                      <div
                                                                           className="progress-bar"
                                                                           style={{
                                                                                width: '75%',
                                                                                background: link.bgGradient,
                                                                                borderRadius: '2px'
                                                                           }}
                                                                      ></div>
                                                                 </div>
                                                            </div>

                                                            {/* Description */}
                                                            <p className="text-muted mb-4 flex-grow-1 lh-base" style={{ fontSize: '0.95rem' }}>
                                                                 {link.description}
                                                            </p>

                                                            {/* Action Footer */}
                                                            <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light">
                                                                 <div className="d-flex align-items-center text-primary fw-medium">
                                                                      <span className="me-2" style={{ fontSize: '0.9rem' }}>Explore Analytics</span>
                                                                      <RiArrowRightLine size={16} />
                                                                 </div>
                                                                 <div
                                                                      className="rounded-circle d-flex align-items-center justify-content-center transition-all"
                                                                      style={{
                                                                           width: '36px',
                                                                           height: '36px',
                                                                           backgroundColor: `${link.color}15`,
                                                                           color: link.color
                                                                      }}
                                                                 >
                                                                      <RiArrowRightLine size={18} />
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </Link>
                                        </div>
                                   );
                              })}
                         </div>

                         {/* Bottom Info Section */}
                         <div className="row mt-5">
                              <div className="col-12">
                                   <div className="card border-0 shadow-sm rounded-4 bg-primary bg-opacity-5 border-primary border-opacity-10">
                                        <div className="card-body p-4 text-center">
                                             <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: 64, height: 64 }}>
                                                  <RiPulseLine size={32} className="text-primary" />
                                             </div>
                                             <h4 className="fw-bold text-dark mb-3">Real-time Analytics & Insights</h4>
                                             <p className="text-muted mb-4 fs-6 lh-base" style={{ maxWidth: '700px', margin: '0 auto' }}>
                                                  All analytics dashboards are powered by real-time data processing, ensuring you always have
                                                  the most current insights for data-driven decision making across your healthcare operations.
                                                  Monitor performance, track trends, and optimize outcomes with comprehensive analytics.
                                             </p>
                                             <div className="d-flex justify-content-center gap-3">
                                                  <div className="d-flex align-items-center text-success">
                                                       <div className="bg-success bg-opacity-20 rounded-circle p-1 me-2">
                                                            <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                                       </div>
                                                       <small className="fw-medium">Live Data Updates</small>
                                                  </div>
                                                  <div className="d-flex align-items-center text-primary">
                                                       <div className="bg-primary bg-opacity-20 rounded-circle p-1 me-2">
                                                            <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                                       </div>
                                                       <small className="fw-medium">Automated Reports</small>
                                                  </div>
                                                  <div className="d-flex align-items-center text-info">
                                                       <div className="bg-info bg-opacity-20 rounded-circle p-1 me-2">
                                                            <div className="bg-info rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                                                       </div>
                                                       <small className="fw-medium">Custom Dashboards</small>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <style jsx>{`
                    .analytics-card-hover {
                         transform: translateY(0);
                         box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    }

                    .analytics-card-hover:hover {
                         transform: translateY(-8px) !important;
                         box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
                    }

                    .analytics-card-hover:hover .card-body {
                         background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
                    }

                    .transition-all {
                         transition: all 0.3s ease;
                    }

                    .analytics-card-hover:hover .transition-all {
                         transform: translateX(4px);
                    }

                    @media (max-width: 768px) {
                         .display-5 {
                              font-size: 2rem !important;
                         }

                         .lead {
                              font-size: 1rem !important;
                         }
                    }
               `}</style>
               </div>
          </div>
     );
}