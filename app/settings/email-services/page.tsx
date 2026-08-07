'use client';

import Link from 'next/link';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
     RiFileList3Line,
     RiMailCheckLine,
     RiMailLine,
     RiMailSendLine,
     RiSettings4Line,
} from '@remixicon/react';

const sections = [
     {
          title: 'Templates',
          description: 'Create and manage reusable email templates and variables.',
          href: '/settings/email-services/templates',
          icon: RiMailLine,
     },
     {
          title: 'Providers',
          description: 'Configure SMTP providers, defaults, and connection details.',
          href: '/settings/email-services/providers',
          icon: RiMailCheckLine,
     },
     {
          title: 'Settings',
          description: 'Set retries, attachment limits, and delivery behavior.',
          href: '/settings/email-services/settings',
          icon: RiSettings4Line,
     },
     {
          title: 'Queue',
          description: 'Queue outbound emails and process or retry delivery jobs.',
          href: '/settings/email-services/queue',
          icon: RiMailSendLine,
     },
     {
          title: 'Logs',
          description: 'Review delivery outcomes, response payloads, and failures.',
          href: '/settings/email-services/logs',
          icon: RiFileList3Line,
     },
     {
          title: 'Notifications',
          description: 'Manage event settings, templates, triggers, queue, and logs.',
          href: '/settings/email-services/notifications',
          icon: RiMailSendLine,
     },
];

export default function EmailServicesHubPage() {
     const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

     return (
          <div className="container-fluid px-3 py-3">
               <Card className="border rounded mb-3" style={{ borderColor: 'var(--bs-border-color)' }}>
                    <Card.Header className="bg-body-tertiary d-flex align-items-center justify-content-between">
                         <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                              <span
                                   className="d-inline-flex align-items-center justify-content-center rounded"
                                   style={{
                                        width: 30,
                                        height: 30,
                                        color: COLOR_ACCENT,
                                        backgroundColor: 'var(--bs-body-bg)',
                                        border: '1px solid var(--bs-border-color)',
                                   }}
                              >
                                   <RiMailLine size={16} />
                              </span>
                              Email Services
                         </h5>
                    </Card.Header>
                    <Card.Body>
                         <p className="mb-0 text-muted">
                              Manage templates, providers, queue operations, delivery settings, and logs from one place.
                         </p>
                    </Card.Body>
               </Card>

               <Row className="g-3">
                    {sections.map((section) => {
                         const Icon = section.icon;
                         return (
                              <Col key={section.href} md={6} xl={4}>
                                   <Link href={section.href} className="text-decoration-none text-body">
                                        <Card className="border rounded h-100" style={{ borderColor: 'var(--bs-border-color)' }}>
                                             <Card.Body className="d-flex flex-column gap-2 p-4">
                                                  <div className="d-flex align-items-center gap-2">
                                                       <span
                                                            className="d-inline-flex align-items-center justify-content-center rounded"
                                                            style={{
                                                                 width: 32,
                                                                 height: 32,
                                                                 color: COLOR_ACCENT,
                                                                 backgroundColor: 'var(--bs-tertiary-bg)',
                                                                 border: '1px solid var(--bs-border-color)',
                                                            }}
                                                       >
                                                            <Icon size={18} />
                                                       </span>
                                                       <h6 className="mb-0 fw-bold">{section.title}</h6>
                                                  </div>
                                                  <p className="mb-0 text-muted small">{section.description}</p>
                                             </Card.Body>
                                        </Card>
                                   </Link>
                              </Col>
                         );
                    })}
               </Row>
          </div>
     );
}
