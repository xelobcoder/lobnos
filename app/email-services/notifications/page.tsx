'use client';

import Link from 'next/link';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
     RiFileList3Line,
     RiMailSettingsLine,
     RiSendPlane2Line,
     RiSettings4Line,
} from '@remixicon/react';

const sections = [
     {
          title: 'Events & Channels',
          description: 'Configure event toggles and default templates per notification event.',
          href: '/email-services/notifications/events',
          icon: RiSettings4Line,
     },
     {
          title: 'Templates',
          description: 'Create, preview, version, and manage event-specific templates.',
          href: '/email-services/notifications/templates',
          icon: RiMailSettingsLine,
     },
     {
          title: 'Trigger',
          description: 'Manually trigger a notification event with custom context and recipients.',
          href: '/email-services/notifications/trigger',
          icon: RiSendPlane2Line,
     },
     {
          title: 'Queue',
          description: 'Monitor notification queue and retry or cancel queued events.',
          href: '/email-services/notifications/queue',
          icon: RiSendPlane2Line,
     },
     {
          title: 'Logs',
          description: 'Review notification log outcomes and message details.',
          href: '/email-services/notifications/logs',
          icon: RiFileList3Line,
     },
];

export default function NotificationsHubPage() {
     const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

     return (
          <div className="container-fluid px-3 py-3">
               <Card className="border rounded mb-3" style={{ borderColor: 'var(--bs-border-color)' }}>
                    <Card.Header className="bg-body-tertiary d-flex align-items-center justify-content-between">
                         <h5 className="mb-0 fw-bold">Notifications</h5>
                    </Card.Header>
                    <Card.Body>
                         <p className="mb-0 text-muted">
                              Manage events, template rendering, manual trigger, queue, and logs from dedicated smaller pages.
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
