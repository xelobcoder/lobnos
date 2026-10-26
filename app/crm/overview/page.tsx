'use client';

import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { RiMoneyDollarCircleLine, RiFileTextLine, RiShieldCheckLine, RiBuilding2Line, RiStethoscopeLine, RiRefund2Line, RiCashLine, RiReceiptLine, RiArrowRightLine, RiShoppingCartLine } from '@remixicon/react';
import {canAccessRolePage} from '../../../lib/roleNavigationPolicy';
import {canAccessFacilityModule} from '../../../lib/facilityModuleAccess';
import { useApplication } from '../../../components/Auth/useApplicationContext';

const operationsSections = [
     {
          href: '/crm/registration',
          icon: RiMoneyDollarCircleLine,
          text: 'Process patient registrations and manage billing workflows efficiently',
          label: 'Registration & Billing',
          category: 'Core Operations',
          color: 'primary',
     },
     {
          href: '/billing/sales/branches',
          icon: RiMoneyDollarCircleLine,
          text: 'Manage sales and billing across multiple branches',
          label: 'Daily Sales',
          category: 'Core Operations',
          color: 'success',
     },
     {
          href: '/appointments',
          icon: RiFileTextLine,
          text: 'Schedule and manage patient appointments efficiently',
          label: 'Appointments',
          category: 'Core Operations',
          color: 'info',
     },
     {
          href: '/compliance/incident-reporting',
          icon: RiShieldCheckLine,
          text: 'Report and manage incidents for quality and compliance tracking',
          label: 'Incident Reporting',
          category: 'Quality & Compliance',
          color: 'warning',
     },
     {
          href: '/organization',
          icon: RiBuilding2Line,
          text: 'Manage organization records, contacts, and service arrangements.',
          label: 'Organizations',
          category: 'Administration',
          color: 'secondary',
     },
     {
          href: '/clinicians',
          icon: RiStethoscopeLine,
          text: 'Manage clinician records and their service information.',
          label: 'Clinicians',
          category: 'Administration',
          color: 'success',
     },
     {
          href: '/billing/refund',
          icon: RiRefund2Line,
          text: 'Review and approve patient refund requests.',
          label: 'Refunds',
          category: 'Financial Operations',
          color: 'warning',
          requiresEmployeeId: true,
     },
     {
          href: '/billing/cash-collection',
          icon: RiCashLine,
          text: 'Collect and record payments for outstanding bills.',
          label: 'Cash Collection',
          category: 'Financial Operations',
          color: 'success',
     },
     {
          href: '/billing/expenses',
          icon: RiReceiptLine,
          text: 'Review, approve, and manage expense records.',
          label: 'Expenses',
          category: 'Financial Operations',
          color: 'secondary',
     },
     {
          href: "/billing/entity-orders",
          icon: RiShoppingCartLine,
          text: 'Manage and track entity orders efficiently.',
          label: 'Recommendations',
          category: 'Recommendations',
          color: 'danger',
     }
];

export default function CRMOVERVIEWPAGE() {
     const app=useApplication();
     const employeeid = app?.user?.employeeid;
     const sections=operationsSections.filter(section=>canAccessRolePage(app?.user?.role,section.href,app?.settings||{})&&canAccessFacilityModule(section.href,app?.settings?.moduleConfiguration));

     return (
          <div className="container-fluid p-3">
               <div className="row g-3 mt-2">
                    <div className="col-12 d-flex flex-column">
                         <div className="card shadow-sm h-100">
                              <div className="card-body d-flex flex-column p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="card-title fs-5 fw-bold text-body">Operations Dashboard</h2>
                                   </div>

                                   <div className="flex-grow-1">
                                        <Row className="g-3">
                                             {sections.map((section, index) => {
                                                  const href = section.requiresEmployeeId && employeeid
                                                       ? `${section.href}/${employeeid}`
                                                       : section.href;

                                                  return (
                                                       <Col md={6} lg={4} xl={3} key={index}>
                                                            <Card className="h-100 hover-shadow">
                                                                 <Card.Body className="d-flex flex-column p-4">
                                                                      <div className="d-flex align-items-center mb-3">
                                                                           <div className={`bg-${section.color} bg-opacity-10 p-2 rounded me-2`}>
                                                                                <section.icon size={22} className={`text-${section.color}`} />
                                                                           </div>
                                                                      </div>
                                                                      <div className="small text-body-secondary mb-1">{section.category}</div>
                                                                      <h5 className="card-title fs-6 fw-semibold mb-2">{section.label}</h5>
                                                                      <p className="text-muted small mb-3 flex-grow-1">{section.text}</p>
                                                                      <Link href={href} className={`btn btn-${section.color} btn-sm mt-auto`}>
                                                                           Open <RiArrowRightLine size={16} className="ms-1" />
                                                                      </Link>
                                                                 </Card.Body>
                                                            </Card>
                                                       </Col>
                                                  );
                                             })}
                                        </Row>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
