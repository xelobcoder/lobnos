'use client';

import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import Link from 'next/link';
import { RiBarChartLine, RiMoneyDollarCircleLine, RiUserHeartLine, RiFileListLine, RiTeamLine, RiArrowRightLine } from '@remixicon/react';
import { useApplication } from '../../components/Auth/useApplicationContext';
import { isSuperAdminRole } from '../../components/Auth/roles';
import { canAccessRolePage } from '../../lib/roleNavigationPolicy';
import { canAccessFacilityModule } from '../../lib/facilityModuleAccess';

const analyticsSections = [
     {
          title: 'Compliance Analytics',
          description: 'Incident reporting trends, systemic issues detection, and regulatory compliance metrics',
          icon: RiFileListLine,
          path: '/analytics/compliance',
          color: 'primary'
     },
     {
          title: 'Patient Analytics',
          description: 'Patient demographics, visit patterns, and healthcare metrics',
          icon: RiUserHeartLine,
          path: '/analytics/patients',
          color: 'success'
     },
     {
          title: 'Sales Analytics',
          description: 'Revenue trends, sales performance, and business metrics',
          icon: RiMoneyDollarCircleLine,
          path: '/analytics/sales',
          color: 'info'
     },
     {
          title: 'Expense Analytics',
          description: 'Cost analysis, budget tracking, and financial insights',
          icon: RiBarChartLine,
          path: '/analytics/expenses',
          color: 'warning'
     },
     {
          title: 'Result Analysis',
          description: 'Test results analytics and laboratory performance metrics',
          icon: RiBarChartLine,
          path: '/analytics/resultanalysis/alltest',
          color: 'secondary'
     },
     {
          title: 'Lead Analytics',
          description: 'Lead generation, conversion rates, and marketing effectiveness',
          icon: RiTeamLine,
          path: '/analytics/leads',
          color: 'dark'
     },
     {
          title: "Outstanding Analytics",
          description: "Breakdown of all outstanding records",
          path: "/analytics/sales/outstanding-payments-breakdown",
          icon: RiTeamLine,
          color: 'dark'
     },
     {
          title: 'Commission Analytics',
          description: 'Reporting and analysis of paid commissions across time periods and recipients',
          icon: RiMoneyDollarCircleLine,
          path: '/analytics/commissions',
          color: 'primary'
     },
     {
          title: "Clincians Analytics",
          description: "Analysis of clinician performance and activity",
          icon: RiUserHeartLine,
          path: '/analytics/clinicians',
          color: 'info'
     }
];

export default function AnalyticsPage() {
     const application = useApplication();
     const role = application?.user?.role;
     const settings = application?.settings || {};
     const sections = analyticsSections.filter(section =>
          canAccessRolePage(role, section.path, settings) &&
          (isSuperAdminRole(role) || canAccessFacilityModule(section.path, settings.moduleConfiguration))
     );

     return (
          <div className="container-fluid p-3">
               <div className="row g-3 mt-2">
                    <div className="col-12 d-flex flex-column">
                         <div className="card  h-100">
                              <div className="card-body d-flex flex-column">
                                   <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div>
                                             {/* <p className="text-uppercase text-primary fw-semibold small mb-2">Prime Laboratory Software · Insights</p> */}
                                             <h1 className="card-title fs-4 fw-bold text-dark mb-1">Analytics &amp; reports</h1>
                                             <p className="text-muted small mb-0">Open reports available to your role and facility modules.</p>
                                        </div>
                                        <Badge bg="light" text="dark" className="border rounded-pill px-3 py-2">{sections.length} available</Badge>
                                   </div>

                                   <div className="flex-grow-1">
                                        <Row className="g-3">
                                             {sections.map(section => (
                                                  <Col md={6} lg={4} key={section.path}>
                                                       <Card className="h-100  border-1">
                                                            <Card.Body className="d-flex flex-column p-4">
                                                                 <div className="d-flex align-items-center mb-3">
                                                                      <div className={`bg-${section.color} bg-opacity-10 p-2 rounded me-3`}>
                                                                           <section.icon size={24} className={`text-${section.color}`} />
                                                                      </div>
                                                                 </div>
                                                                 <h2 className="h6 fw-semibold mb-2">{section.title}</h2>
                                                                 <p className="text-muted small mb-4 flex-grow-1">{section.description}</p>
                                                                 <Link href={section.path} className={`btn btn-${section.color} btn-sm mt-auto`}>
                                                                      Open report <RiArrowRightLine size={16} className="ms-1" />
                                                                 </Link>
                                                            </Card.Body>
                                                       </Card>
                                                  </Col>
                                             ))}
                                             {!sections.length && <Col><div className="alert alert-info mb-0" role="status">No analytics reports are enabled for your current role and facility modules.</div></Col>}
                                        </Row>
                                   </div>
                                   <p className="small text-muted border-top pt-3 mt-4 mb-0">Executive KPIs are shown only in reports with verified, authorized source data; this page does not substitute sample values.</p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
