'use client';

import Link from 'next/link';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import styles from '../email-standard.module.css';
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
     return (
          <div className={`container-fluid ${styles.pageRoot}`}>
               <Card className={styles.heroCard}>
                    <Card.Body className={styles.heroBody}>
                         <div className={styles.heroTitleRow}>
                              <h5 className={styles.heroTitle}>
                                   <span className={styles.heroIcon}>
                                        <RiMailSettingsLine size={16} />
                                   </span>
                                   Notifications
                              </h5>
                         </div>
                         <p className={styles.heroDescription}>
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
                                        <Card className={styles.navCard}>
                                             <Card.Body className={styles.navCardBody}>
                                                  <div className={styles.navTitleRow}>
                                                       <span className={styles.heroIcon}>
                                                            <Icon size={18} />
                                                       </span>
                                                       <h6 className={styles.navTitle}>{section.title}</h6>
                                                  </div>
                                                  <p className={styles.navDescription}>{section.description}</p>
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
