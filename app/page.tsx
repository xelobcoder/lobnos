'use client'
import Link from 'next/link'
import React from 'react'
import {
     RiTestTubeLine,
     RiBarChartBoxLine,
     RiUserLine,
     RiArrowRightLine,
     RiFlaskLine} from '@remixicon/react'

export default function page() {

     return (
          <div className="max-vh-100 bg-light">
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
                                        <Link href="/crm/registration" className="btn px-5 py-3 text-dark text-uppercase btn-warning text-warning text-decoration-none fw-semibold">
                                             <RiArrowRightLine className="me-2" size={20} />
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
