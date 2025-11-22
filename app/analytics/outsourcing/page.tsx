"use client";

import React from "react";
import Link from "next/link";

const IconChart = () => <span style={{ fontSize: '1.5rem', color: "#3B82F6", marginRight: '0.5rem' }}>🚀</span>;
const IconDaily = () => <span style={{ fontSize: '2rem' }}>📅</span>;
const IconMonthly = () => <span style={{ fontSize: '2rem' }}>📊</span>;
const IconWeekly = () => <span style={{ fontSize: '2rem' }}>📈</span>;
const IconQuarterly = () => <span style={{ fontSize: '2rem' }}>📉</span>;
const IconYearly = () => <span style={{ fontSize: '2rem' }}>🏥</span>;
const IconTopFacilities = () => <span style={{ fontSize: '2rem' }}>🏆</span>;
const IconHourly = () => <span style={{ fontSize: '2rem' }}>⏰</span>;

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';

const analyticsPages = [
     {
          title: "Daily Analytics",
          description: "View outsourcing patterns for the last 30 days with detailed daily breakdowns and trends.",
          icon: <IconDaily />,
          href: "/analytics/outsourcing/daily",
          color: "primary",
          features: ["Last 30 days data", "Branch filtering", "Multiple chart views", "Daily summaries"]
     },
     {
          title: "Monthly Analytics",
          description: "Analyze monthly outsourcing trends with year selection and comprehensive monthly data.",
          icon: <IconMonthly />,
          href: "/analytics/outsourcing/monthly",
          color: "success",
          features: ["Year-based filtering", "Monthly breakdowns", "Trend analysis", "Branch comparison"]
     },
     {
          title: "Weekly Analytics",
          description: "Track weekly outsourcing patterns with detailed weekly summaries and performance metrics.",
          icon: <IconWeekly />,
          href: "/analytics/outsourcing/weekly",
          color: "info",
          features: ["Weekly trends", "Year selection", "Performance metrics", "Branch analytics"]
     },
     {
          title: "Quarterly Analytics",
          description: "Review quarterly outsourcing data with comprehensive quarterly summaries and insights.",
          icon: <IconQuarterly />,
          href: "/analytics/outsourcing/quarterly",
          color: "warning",
          features: ["Quarterly summaries", "Year filtering", "Trend analysis", "Detailed breakdowns"]
     },
     {
          title: "Yearly Analytics",
          description: "Examine yearly outsourcing patterns with facility-based data and long-term trends.",
          icon: <IconYearly />,
          href: "/analytics/outsourcing/yearly",
          color: "secondary",
          features: ["Yearly patterns", "Facility analysis", "Long-term trends", "Branch filtering"]
     },
     {
          title: "Top Facilities",
          description: "Discover the top 20 outsourcing facilities with contact information and performance data.",
          icon: <IconTopFacilities />,
          href: "/analytics/outsourcing/top-facilities",
          color: "danger",
          features: ["Top 20 facilities", "Contact details", "Performance rankings", "Branch filtering"]
     },
     {
          title: "Hourly Analytics",
          description: "Monitor hourly outsourcing patterns with target date selection and detailed hourly breakdowns.",
          icon: <IconHourly />,
          href: "/analytics/outsourcing/hourly",
          color: "dark",
          features: ["Hourly patterns", "Date targeting", "Detailed breakdowns", "Branch analytics"]
     }
];

export default function OutsourcingAnalyticsNavigation() {
     return (
          <div className="container-fluid py-4">
               <div className="row mb-4">
                    <div className="col-12">
                         <div className="d-flex align-items-center mb-4 border border-1 p-4 rounded ">
                              <IconChart />
                              <div>
                                   <h1 className="h3 mb-1 fw-bold text-body-emphasis">General Outsourcing Analytics</h1>
                                   <p className="text-muted mb-0 ">Choose an analytics type to explore detailed outsourcing data and insights</p>
                              </div>
                         </div>
                    </div>
               </div>

               <div className="row g-4">
                    {analyticsPages.map((page, index) => (
                         <div key={index} className="col-lg-6 col-xl-4">
                              <Link href={page.href} className="text-decoration-none">
                                   <div className="card h-100 shadow-sm hover-lift" style={{
                                        borderRadius: '0.75rem',
                                        borderColor: COLOR_BORDER,
                                        backgroundColor: COLOR_TOOLTIP_BG,
                                        transition: 'all 0.2s ease-in-out',
                                        cursor: 'pointer'
                                   }}>
                                        <div className="card-body p-4">
                                             <div className="d-flex align-items-center mb-3">
                                                  <div className={`bg-${page.color} bg-opacity-10 rounded-circle p-3 me-3`}>
                                                       {page.icon}
                                                  </div>
                                                  <div className="flex-grow-1">
                                                       <h5 className="card-title mb-1 fw-semibold text-body-emphasis">
                                                            {page.title}
                                                       </h5>
                                                       <span className={`badge bg-${page.color} bg-opacity-75 text-white small`}>
                                                            Analytics
                                                       </span>
                                                  </div>
                                             </div>

                                             <p className="card-text text-muted small mb-3" style={{ lineHeight: '1.5' }}>
                                                  {page.description}
                                             </p>

                                             <div className="mb-3">
                                                  <h6 className="text-muted small fw-medium mb-2">Features:</h6>
                                                  <div className="d-flex flex-wrap gap-1">
                                                       {page.features.map((feature, idx) => (
                                                            <span key={idx} className="badge bg-light text-muted small border">
                                                                 {feature}
                                                            </span>
                                                       ))}
                                                  </div>
                                             </div>

                                             <div className="d-flex align-items-center justify-content-between">
                                                  <span className="text-primary small fw-medium">
                                                       View Analytics →
                                                  </span>
                                                  <div className="text-muted small">
                                                       <i className="bi bi-arrow-right-circle-fill"></i>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </Link>
                         </div>
                    ))}
               </div>

               <div className="row mt-5">
                    <div className="col-12">
                         <div className="card border-0 bg-light">
                              <div className="card-body text-center py-4">
                                   <h5 className="text-muted mb-2">Need Help?</h5>
                                   <p className="text-muted small mb-0">
                                        Each analytics page provides detailed insights with interactive charts, data tables, and filtering options.
                                        Choose the analytics type that best fits your reporting needs.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}