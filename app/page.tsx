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
               <section className="hero-section position-relative overflow-hidden py-5">
                    <div className="hero-background"></div>
                    <div className="container position-relative" style={{ zIndex: 2 }}>
                         <div className="row align-items-center py-4">
                              <div className="col-lg-6 mb-4 mb-lg-0">
                                   <div className="hero-content">
                                        <div className="d-flex align-items-center mb-4 animate-fade-in">
                                             <div className="logo-wrapper">
                                                  <RiFlaskLine size={56} className="text-warning pulse-animation" />
                                             </div>
                                             <div className="ms-3">
                                                  <h1 className="display-3 fw-bold mb-0 text-white">Prime Laboratory System</h1>
                                                  <div className="d-flex align-items-center mt-2">
                                                       <span className="badge bg-warning text-dark fs-6 fw-bold px-3 py-2">PLS</span>
                                                       <span className="text-white-50 ms-3 small">Version 2.0</span>
                                                  </div>
                                             </div>
                                        </div>
                                        <p className="lead mb-4 text-white fw-normal">
                                             Next-Generation Laboratory Information Management System
                                        </p>
                                        <p className="mb-4 text-white-50 fs-6">
                                             Streamline your laboratory operations with AI-powered workflows, real-time analytics,
                                             and comprehensive patient management—all in one integrated platform.
                                        </p>
                                        <div className="d-flex flex-wrap gap-3 mb-3">
                                             <Link href="/authentications/login" className="btn btn-warning btn-lg px-5 py-3 shadow-lg fw-bold">
                                                  <RiUserLine className="me-2" size={20} />
                                                  Login to PLS
                                             </Link>
                                        </div>
                                        <Link href="/crm/registration" className="btn btn-link text-warning text-decoration-none fw-semibold">
                                             <RiArrowRightLine className="me-2" size={18} />
                                             Quick Access
                                        </Link>
                                   </div>
                              </div>
                              <div className="col-lg-6">
                                   <div className="hero-image-wrapper">
                                        <img
                                             src="/lab.jfif"
                                             alt="Modern Laboratory"
                                             className="img-fluid rounded-4 shadow-2xl hero-image"
                                        />
                                        <div className="floating-badge badge-1">
                                             <RiTestTubeLine size={24} className="text-success" />
                                             <span className="ms-2 fw-bold">1000+ Tests</span>
                                        </div>
                                        <div className="floating-badge badge-2">
                                             <RiBarChartBoxLine size={24} className="text-success" />
                                             <span className="ms-2 fw-bold">Real-time Analytics</span>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* Key Features Section */}
               <section className="py-5 bg-white">
                    <div className="container py-4">
                         <div className="text-center mb-5">
                              <span className="badge bg-success-subtle text-success px-3 py-2 mb-3 rounded-pill">Core Features</span>
                              <h2 className="display-5 fw-bold text-dark mb-3">Comprehensive Laboratory Solutions</h2>
                              <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
                                   Everything you need to run a modern, efficient laboratory—from patient intake to results delivery
                              </p>
                         </div>

                         <div className="row g-4">
                              <div className="col-md-6 col-lg-3">
                                   <div className="feature-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="feature-icon-wrapper mb-4">
                                                  <div className="feature-icon bg-success">
                                                       <RiTestTubeLine size={32} className="text-white" />
                                                  </div>
                                             </div>
                                             <h5 className="card-title fw-bold mb-3">Laboratory Operations</h5>
                                             <p className="card-text text-muted small">Complete test processing, result management, and quality control with automated workflows</p>
                                             <ul className="list-unstyled text-start mt-3 small text-muted">
                                                  <li className="mb-2">✓ Test catalog management</li>
                                                  <li className="mb-2">✓ Sample tracking</li>
                                                  <li>✓ Quality assurance</li>
                                             </ul>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="feature-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="feature-icon-wrapper mb-4">
                                                  <div className="feature-icon bg-warning">
                                                       <RiMoneyDollarCircleLine size={32} className="text-white" />
                                                  </div>
                                             </div>
                                             <h5 className="card-title fw-bold mb-3">CRM & Billing</h5>
                                             <p className="card-text text-muted small">Comprehensive patient management with integrated billing and payment processing</p>
                                             <ul className="list-unstyled text-start mt-3 small text-muted">
                                                  <li className="mb-2">✓ Patient registration</li>
                                                  <li className="mb-2">✓ Invoice generation</li>
                                                  <li>✓ Payment tracking</li>
                                             </ul>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="feature-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="feature-icon-wrapper mb-4">
                                                  <div className="feature-icon bg-info">
                                                       <RiPulseLine size={32} className="text-white" />
                                                  </div>
                                             </div>
                                             <h5 className="card-title fw-bold mb-3">Medical Imaging</h5>
                                             <p className="card-text text-muted small">Advanced ultrasound and imaging procedure management with DICOM support</p>
                                             <ul className="list-unstyled text-start mt-3 small text-muted">
                                                  <li className="mb-2">✓ Ultrasound reports</li>
                                                  <li className="mb-2">✓ Image archiving</li>
                                                  <li>✓ Template library</li>
                                             </ul>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="feature-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="feature-icon-wrapper mb-4">
                                                  <div className="feature-icon bg-danger">
                                                       <RiBarChartBoxLine size={32} className="text-white" />
                                                  </div>
                                             </div>
                                             <h5 className="card-title fw-bold mb-3">Analytics & Reports</h5>
                                             <p className="card-text text-muted small">Real-time performance metrics and comprehensive business intelligence</p>
                                             <ul className="list-unstyled text-start mt-3 small text-muted">
                                                  <li className="mb-2">✓ Dashboard analytics</li>
                                                  <li className="mb-2">✓ Custom reports</li>
                                                  <li>✓ Revenue insights</li>
                                             </ul>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* User Roles Section */}
               <section className="py-5 position-relative">
                    <div className="roles-background"></div>
                    <div className="container position-relative py-4" style={{ zIndex: 2 }}>
                         <div className="text-center mb-5">
                              <span className="badge bg-success-subtle text-success px-3 py-2 mb-3 rounded-pill">Team Access</span>
                              <h2 className="display-5 fw-bold text-dark mb-3">Role-Based Access Control</h2>
                              <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
                                   Secure, customizable permissions for every member of your laboratory team
                              </p>
                         </div>

                         <div className="row g-4">
                              <div className="col-md-6 col-lg-3">
                                   <div className="role-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="role-icon-wrapper mb-3">
                                                  <div className="role-icon bg-gradient-success">
                                                       <RiSettingsLine size={28} />
                                                  </div>
                                             </div>
                                             <h6 className="card-title fw-bold mb-2">Administrator</h6>
                                             <p className="card-text small text-muted mb-3">Complete system control and configuration</p>
                                             <div className="role-features">
                                                  <span className="badge bg-success-subtle text-success small mb-1">User Management</span>
                                                  <span className="badge bg-success-subtle text-success small mb-1">Settings</span>
                                                  <span className="badge bg-success-subtle text-success small">Reports</span>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="role-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="role-icon-wrapper mb-3">
                                                  <div className="role-icon bg-gradient-warning">
                                                       <RiUserLine size={28} />
                                                  </div>
                                             </div>
                                             <h6 className="card-title fw-bold mb-2">Front Desk</h6>
                                             <p className="card-text small text-muted mb-3">Patient intake and scheduling</p>
                                             <div className="role-features">
                                                  <span className="badge bg-warning-subtle text-warning small mb-1">Registration</span>
                                                  <span className="badge bg-warning-subtle text-warning small mb-1">Billing</span>
                                                  <span className="badge bg-warning-subtle text-warning small">Appointments</span>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="role-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="role-icon-wrapper mb-3">
                                                  <div className="role-icon bg-gradient-info">
                                                       <RiTestTubeLine size={28} />
                                                  </div>
                                             </div>
                                             <h6 className="card-title fw-bold mb-2">Lab Scientist</h6>
                                             <p className="card-text small text-muted mb-3">Test processing and analysis</p>
                                             <div className="role-features">
                                                  <span className="badge bg-info-subtle text-info small mb-1">Result Entry</span>
                                                  <span className="badge bg-info-subtle text-info small mb-1">QC</span>
                                                  <span className="badge bg-info-subtle text-info small">Approval</span>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              <div className="col-md-6 col-lg-3">
                                   <div className="role-card card h-100 border-0 shadow-sm">
                                        <div className="card-body text-center p-4">
                                             <div className="role-icon-wrapper mb-3">
                                                  <div className="role-icon bg-gradient-danger">
                                                       <RiSyringeLine size={28} />
                                                  </div>
                                             </div>
                                             <h6 className="card-title fw-bold mb-2">Phlebotomist</h6>
                                             <p className="card-text small text-muted mb-3">Sample collection management</p>
                                             <div className="role-features">
                                                  <span className="badge bg-danger-subtle text-danger small mb-1">Collection</span>
                                                  <span className="badge bg-danger-subtle text-danger small mb-1">Labeling</span>
                                                  <span className="badge bg-danger-subtle text-danger small">Tracking</span>
                                             </div>
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
                                   <h2 className="display-5 fw-bold text-success mb-4">Advanced Laboratory Management</h2>
                                   <div className="mb-4">
                                        <div className="d-flex align-items-start mb-3">
                                             <RiHospitalLine size={24} className="text-success me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Integrated Lab Workflow</h5>
                                                  <p className="text-muted mb-0">Seamlessly connect sample collection to final result reporting</p>
                                             </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                             <RiDashboardLine size={24} className="text-success me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Real-time Lab Analytics</h5>
                                                  <p className="text-muted mb-0">Monitor test turnaround times and laboratory performance metrics</p>
                                             </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                             <RiMessage2Line size={24} className="text-success me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Automated Notifications</h5>
                                                  <p className="text-muted mb-0">SMS alerts for critical results and patient notifications</p>
                                             </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                             <RiFileTextLine size={24} className="text-success me-3 mt-1" />
                                             <div>
                                                  <h5 className="fw-bold mb-1">Compliance Reporting</h5>
                                                  <p className="text-muted mb-0">Generate detailed reports for laboratory accreditation and quality control</p>
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
               <section className="cta-section position-relative overflow-hidden py-5">
                    <div className="cta-background"></div>
                    <div className="container position-relative text-center py-5" style={{ zIndex: 2 }}>
                         <div className="mx-auto" style={{ maxWidth: '800px' }}>
                              <h2 className="display-4 fw-bold mb-4 text-white">Ready to Modernize Your Laboratory?</h2>
                              <p className="lead mb-5 text-white-50">
                                   Join thousands of healthcare facilities worldwide using Prime Laboratory System
                                   for efficient, accurate, and compliant laboratory operations
                              </p>
                              <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
                                   <Link href="/authentication/login" className="btn btn-warning btn-lg px-5 py-3 shadow-lg fw-bold">
                                        <RiUserLine className="me-2" size={20} />
                                        Access PLS Now
                                   </Link>
                                   <Link href="/onboarding" className="btn btn-outline-light btn-lg px-5 py-3 border-2 fw-semibold">
                                        <RiFlaskLine className="me-2" size={20} />
                                        Setup Your Lab
                                   </Link>
                              </div>
                              <div className="d-flex justify-content-center gap-4 text-white-50 small mt-4">
                                   <div>
                                        <RiTestTubeLine className="me-1" size={16} />
                                        <span>1000+ Tests</span>
                                   </div>
                                   <div>
                                        <RiUserLine className="me-1" size={16} />
                                        <span>Multi-user Access</span>
                                   </div>
                                   <div>
                                        <RiBarChartBoxLine className="me-1" size={16} />
                                        <span>Real-time Reports</span>
                                   </div>
                              </div>
                         </div>
                    </div>
               </section>

               {/* Footer */}
               <footer className="footer-section py-5">
                    <div className="container">
                         <div className="row">
                              <div className="col-lg-4 mb-4 mb-lg-0">
                                   <div className="d-flex align-items-center mb-3">
                                        <RiFlaskLine size={32} className="text-warning me-2" />
                                        <div>
                                             <h5 className="fw-bold text-white mb-0">Prime Laboratory System</h5>
                                             <small className="text-warning">PLS v2.0</small>
                                        </div>
                                   </div>
                                   <p className="text-white-50 small">
                                        Professional Laboratory Information Management System designed for modern healthcare facilities
                                   </p>
                                   <div className="d-flex gap-2 mt-3">
                                        <span className="badge bg-success-subtle text-success">LIMS Certified</span>
                                        <span className="badge bg-success-subtle text-success">ISO Compliant</span>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-md-4 mb-4 mb-lg-0">
                                   <h6 className="fw-bold text-white mb-3">Quick Links</h6>
                                   <ul className="list-unstyled">
                                        <li className="mb-2">
                                             <Link href="/authentication/login" className="text-white-50 text-decoration-none small hover-link">Login</Link>
                                        </li>
                                        <li className="mb-2">
                                             <Link href="/onboarding" className="text-white-50 text-decoration-none small hover-link">Setup Lab</Link>
                                        </li>
                                        <li className="mb-2">
                                             <Link href="/crm/registration" className="text-white-50 text-decoration-none small hover-link">Register Patient</Link>
                                        </li>
                                   </ul>
                              </div>
                              <div className="col-lg-3 col-md-4 mb-4 mb-lg-0">
                                   <h6 className="fw-bold text-white mb-3">Features</h6>
                                   <ul className="list-unstyled small text-white-50">
                                        <li className="mb-2">• Laboratory Operations</li>
                                        <li className="mb-2">• Patient Management</li>
                                        <li className="mb-2">• Billing & Invoicing</li>
                                        <li className="mb-2">• Analytics Dashboard</li>
                                   </ul>
                              </div>
                              <div className="col-lg-3 col-md-4">
                                   <h6 className="fw-bold text-white mb-3">Support</h6>
                                   <p className="text-white-50 small mb-2">24/7 Technical Support</p>
                                   <p className="text-white-50 small mb-2">Documentation Available</p>
                                   <p className="text-white-50 small">Regular Updates & Maintenance</p>
                              </div>
                         </div>
                         <hr className="border-secondary my-4" />
                         <div className="text-center">
                              <p className="mb-0 text-white-50 small">
                                   © 2025 Prime Laboratory System. All rights reserved. | Professional Laboratory Management Software
                              </p>
                         </div>
                    </div>
               </footer>

               <style jsx>{`
        /* Hero Section Styles */
        .hero-section {
          min-height: 90vh;
          background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #4caf50 100%);
        }
        
        .hero-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top right, rgba(255, 193, 7, 0.2), transparent 50%),
                      radial-gradient(circle at bottom left, rgba(33, 150, 243, 0.2), transparent 50%);
        }
        
        .logo-wrapper {
          background: rgba(255, 193, 7, 0.1);
          padding: 15px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hero-image-wrapper {
          position: relative;
        }
        
        .hero-image {
          border: 4px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease;
        }
        
        .hero-image:hover {
          transform: scale(1.02);
        }
        
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .floating-badge {
          position: absolute;
          background: white;
          padding: 12px 20px;
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          animation: float 3s ease-in-out infinite;
        }
        
        .badge-1 {
          top: 20px;
          right: -20px;
        }
        
        .badge-2 {
          bottom: 20px;
          left: -20px;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        /* Feature Cards */
        .feature-card {
          transition: all 0.3s ease;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        }
        
        .feature-icon-wrapper {
          position: relative;
        }
        
        .feature-icon {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Roles Section */
        .roles-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
        }
        
        .role-card {
          transition: all 0.3s ease;
          border-radius: 16px;
        }
        
        .role-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12) !important;
        }
        
        .role-icon-wrapper {
          display: inline-block;
        }
        
        .role-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
        }
        
        .bg-gradient-success {
          background: linear-gradient(135deg, #198754 0%, #146c43 100%);
        }
        
        .bg-gradient-info {
          background: linear-gradient(135deg, #0dcaf0 0%, #0aa2c0 100%);
        }
        
        .bg-gradient-warning {
          background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }
        
        .role-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        
        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
        }
        
        .cta-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        /* Footer */
        .footer-section {
          background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);
        }
        
        .hover-link:hover {
          color: #ffc107 !important;
          transition: color 0.2s ease;
        }
        
        /* Button Enhancements */
        .btn {
          transition: all 0.3s ease;
          font-weight: 600;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .btn-warning {
          background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
          border: none;
        }
        
        .btn-warning:hover {
          background: linear-gradient(135deg, #ffb300 0%, #ffa000 100%);
        }
        
        /* Utility Classes */
        .text-white-50 {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .border-2 {
          border-width: 2px !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 991px) {
          .hero-section {
            min-height: auto;
          }
          
          .floating-badge {
            display: none;
          }
          
          .display-3 {
            font-size: 2.5rem;
          }
          
          .display-4 {
            font-size: 2rem;
          }
        }
      `}</style>
          </div>
     )
}
