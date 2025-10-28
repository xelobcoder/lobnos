'use client'
import Link from 'next/link'
import React from 'react'
import {
     RiTestTubeLine,
     RiStethoscopeLine,
     RiBarChartBoxLine,
     RiUserLine,
     RiSettingsLine,
     RiDashboardLine,
     RiMoneyDollarCircleLine,
     RiPulseLine,
     RiSyringeLine,
     RiMicroscopeLine,
     RiFileTextLine,
     RiMessage2Line,
     RiArrowRightLine,
     RiFlaskLine,
     RiHospitalLine
} from '@remixicon/react'

export default function page() {
     return (
          <div className="min-vh-100 bg-light">
               {/* Hero Section */}
               <section className="bg-gradient-to-br from-primary to-info text-white py-5">
                    <div className="container">
                         <div className="row align-items-center">
                              <div className="col-lg-6">
                                   <div className="d-flex align-items-center mb-3">
                                        <RiFlaskLine size={48} className="me-3" />
                                        <h1 className="display-4 fw-bold mb-0">Lobnos</h1>
                                   </div>
                                   <p className="lead mb-4">
                                        Comprehensive Laboratory Management System for Modern Healthcare Facilities
                                   </p>
                                   <p className="mb-4 opacity-90">
                                        Streamline patient care, laboratory operations, and administrative workflows
                                        with our integrated healthcare management platform.
                                   </p>
                                   <div className="d-flex gap-3">
                                        <Link href="/authentication/login" className="btn btn-light btn-lg px-4">
                                             <RiUserLine className="me-2" />
                                             Login to System
                                        </Link>
                                        <Link href="/onboarding" className="btn btn-outline-light btn-lg px-4">
                                             <RiFlaskLine className="me-2" />
                                             New Client Onboarding
                                        </Link>
                                        <Link href="/crm/registration" className="btn btn-outline-light btn-lg px-4">
                                             <RiArrowRightLine className="me-2" />
                                             Patient Registration
                                        </Link>
                                   </div>
                              </div>
                              <div className="col-lg-6 text-center">
                                   <img
                                        src="/lab.jfif"
                                        alt="Modern Laboratory"
                                        className="img-fluid rounded-3 shadow-lg"
                                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                                   />
                              </div>
                         </div>
                    </div>
               </section>

               {/* Key Features Section */}
               <section className="py-5">
                    <div className="container">
                         <div className="text-center mb-5">
                              <h2 className="display-5 fw-bold text-primary mb-3">Core Capabilities</h2>
                              <p className="lead text-muted">Everything you need to manage your healthcare facility efficiently</p>
                         </div>

                         <div className="row g-4">
                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm hover-shadow">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                                  <RiTestTubeLine size={32} className="text-primary" />
                                             </div>
                                             <h5 className="card-title fw-bold">Laboratory Operations</h5>
                                             <p className="card-text text-muted">Complete test processing, result management, and quality control</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm hover-shadow">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                                  <RiMoneyDollarCircleLine size={32} className="text-success" />
                                             </div>
                                             <h5 className="card-title fw-bold">CRM & Billing</h5>
                                             <p className="card-text text-muted">Patient registration, billing management, and payment processing</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm hover-shadow">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                                  <RiPulseLine size={32} className="text-info" />
                                             </div>
                                             <h5 className="card-title fw-bold">Medical Imaging</h5>
                                             <p className="card-text text-muted">Ultrasound and imaging procedure management</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm hover-shadow">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                                  <RiBarChartBoxLine size={32} className="text-warning" />
                                             </div>
                                             <h5 className="card-title fw-bold">Analytics & Reports</h5>
                                             <p className="card-text text-muted">Performance metrics and comprehensive reporting</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* User Roles Section */}
               <section className="py-5 bg-light">
                    <div className="container">
                         <div className="text-center mb-5">
                              <h2 className="display-5 fw-bold text-primary mb-3">User Roles & Access</h2>
                              <p className="lead text-muted">Role-based access for different healthcare professionals</p>
                         </div>

                         <div className="row g-4">
                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                                                  <RiSettingsLine size={24} />
                                             </div>
                                             <h6 className="card-title fw-bold">Administrator</h6>
                                             <p className="card-text small text-muted">Full system access, user management, and configuration</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                                                  <RiUserLine size={24} />
                                             </div>
                                             <h6 className="card-title fw-bold">Front Desk</h6>
                                             <p className="card-text small text-muted">Patient registration and appointment scheduling</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                                                  <RiTestTubeLine size={24} />
                                             </div>
                                             <h6 className="card-title fw-bold">Lab Scientist</h6>
                                             <p className="card-text small text-muted">Laboratory test processing and result management</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                                                  <RiSyringeLine size={24} />
                                             </div>
                                             <h6 className="card-title fw-bold">Phlebotomist</h6>
                                             <p className="card-text small text-muted">Sample collection and phlebotomy procedures</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* Additional Features */}
               <section className="py-5">
                    <div className="container">
                         <div className="row align-items-center">
                              <div className="col-lg-6">
                                   <h2 className="display-5 fw-bold text-primary mb-4">Advanced Healthcare Management</h2>
                                   <div className="mb-4">
                                        <div className="d-flex align-items-start mb-3">
                                             <RiHospitalLine size={24} className="text-primary me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Integrated Workflow</h5>
                                                  <p className="text-muted mb-0">Seamlessly connect all departments from patient intake to final reporting</p>
                                             </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                             <RiDashboardLine size={24} className="text-primary me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Real-time Analytics</h5>
                                                  <p className="text-muted mb-0">Monitor performance metrics and make data-driven decisions</p>
                                             </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                             <RiMessage2Line size={24} className="text-primary me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Communication Tools</h5>
                                                  <p className="text-muted mb-0">SMS notifications and integrated messaging system</p>
                                             </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                             <RiFileTextLine size={24} className="text-primary me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Comprehensive Reporting</h5>
                                                  <p className="text-muted mb-0">Generate detailed reports for compliance and analysis</p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-lg-6">
                                   <div className="row g-3">
                                        <div className="col-6">
                                             <img src="/frontpage/dashboard.png" alt="Dashboard" className="img-fluid rounded-3 shadow-sm" />
                                        </div>
                                        <div className="col-6">
                                             <img src="/frontpage/sample.png" alt="Sample Management" className="img-fluid rounded-3 shadow-sm" />
                                        </div>
                                        <div className="col-6">
                                             <img src="/frontpage/users.png" alt="User Management" className="img-fluid rounded-3 shadow-sm" />
                                        </div>
                                        <div className="col-6">
                                             <img src="/frontpage/settings.png" alt="Settings" className="img-fluid rounded-3 shadow-sm" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* CTA Section */}
               <section className="bg-primary text-white py-5">
                    <div className="container text-center">
                         <h2 className="display-5 fw-bold mb-3">Ready to Transform Your Healthcare Operations?</h2>
                         <p className="lead mb-4 opacity-90">
                              Join healthcare facilities worldwide using Lobnos for efficient laboratory management
                         </p>
                         <div className="d-flex justify-content-center gap-3">
                              <Link href="/authentication/login" className="btn btn-light btn-lg px-4">
                                   <RiUserLine className="me-2" />
                                   Access System
                              </Link>
                              <Link href="/onboarding" className="btn btn-outline-light btn-lg px-4">
                                   <RiFlaskLine className="me-2" />
                                   Client Onboarding
                              </Link>
                              <Link href="/crm/registration" className="btn btn-outline-light btn-lg px-4">
                                   <RiArrowRightLine className="me-2" />
                                   New Patient
                              </Link>
                         </div>
                    </div>
               </section>

               {/* Footer */}
               <footer className="bg-dark text-white py-4">
                    <div className="container text-center">
                         <div className="d-flex align-items-center justify-content-center mb-2">
                              <RiFlaskLine size={24} className="me-2" />
                              <span className="fw-bold">Lobnos</span>
                         </div>
                         <p className="mb-0 text-muted">Professional Laboratory Management System</p>
                    </div>
               </footer>

               <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        .bg-gradient-to-br {
          background: linear-gradient(135deg, var(--pls-color) 0%, var(--custom-blue) 100%);
        }
      `}</style>
          </div>
     )
}
