'use client';

import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import Link from 'next/link';
import { RiBarChartLine, RiMoneyDollarCircleLine, RiUserHeartLine, RiFileListLine, RiShoppingCartLine, RiTeamLine, RiArrowRightLine } from '@remixicon/react';

const analyticsSections = [
     {
          title: 'Compliance Analytics',
          description: 'Incident reporting trends, systemic issues detection, and regulatory compliance metrics',
          icon: RiFileListLine,
          path: '/analytics/compliance',
          color: 'primary',
          badge: 'Active'
     },
     {
          title: 'Patient Analytics',
          description: 'Patient demographics, visit patterns, and healthcare metrics',
          icon: RiUserHeartLine,
          path: '/analytics/patients',
          color: 'success',
          badge: null
     },
     {
          title: 'Sales Analytics',
          description: 'Revenue trends, sales performance, and business metrics',
          icon: RiMoneyDollarCircleLine,
          path: '/analytics/sales',
          color: 'info',
          badge: null
     },
     {
          title: 'Expense Analytics',
          description: 'Cost analysis, budget tracking, and financial insights',
          icon: RiBarChartLine,
          path: '/analytics/expenses',
          color: 'warning',
          badge: null
     },
     {
          title: 'Result Analysis',
          description: 'Test results analytics and laboratory performance metrics',
          icon: RiBarChartLine,
          path: '/analytics/resultanalysis/alltest',
          color: 'secondary',
          badge: null
     },
     {
          title: 'Lead Analytics',
          description: 'Lead generation, conversion rates, and marketing effectiveness',
          icon: RiTeamLine,
          path: '/analytics/leads',
          color: 'dark',
          badge: null
     },
     {
          title: "Outstanding Analytics",
          description: "Breakdown of all outstanding records",
          path: "/analytics/sales/outstanding-payments-breakdown",
          icon: RiTeamLine,
          color: 'dark',
          badge: null
     }
];

export default function AnalyticsPage() {
     return (
          <div className="container-fluid p-3">
               <div className="row g-3 mt-2">
                    <div className="col-12 d-flex flex-column">
                         <div className="card shadow-sm h-100">
                              <div className="card-body d-flex flex-column">
                                   <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="card-title fs-5 fw-bold text-dark">Analytics Dashboard</h2>
                                   </div>

                                   <div className="flex-grow-1">
                                        <Row className="g-3">
                                             {analyticsSections.map((section, index) => (
                                                  <Col md={6} lg={4} key={index}>
                                                       <Card className="h-100 hover-shadow">
                                                            <Card.Body className="d-flex flex-column">
                                                                 <div className="d-flex align-items-center mb-3">
                                                                      <div className={`bg-${section.color} bg-opacity-10 p-2 rounded me-3`}>
                                                                           <section.icon size={24} className={`text-${section.color}`} />
                                                                      </div>
                                                                      {section.badge && (
                                                                           <Badge bg={section.color} className="ms-auto">
                                                                                {section.badge}
                                                                           </Badge>
                                                                      )}
                                                                 </div>
                                                                 <h5 className="card-title fw-semibold mb-2">{section.title}</h5>
                                                                 <p className="text-muted small mb-3 flex-grow-1">{section.description}</p>
                                                                 <Link href={section.path} className={`btn btn-${section.color} btn-sm mt-auto`}>
                                                                      View Analytics <RiArrowRightLine size={16} className="ms-1" />
                                                                 </Link>
                                                            </Card.Body>
                                                       </Card>
                                                  </Col>
                                             ))}
                                        </Row>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
