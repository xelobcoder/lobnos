'use client';

import Link from 'next/link';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import styles from './email-standard.module.css';
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
     return (
          <div className={`container-fluid ${styles.pageRoot}`}>
               <Card className={styles.heroCard}>
                    <Card.Body className={styles.heroBody}>
                         <div className={styles.heroTitleRow}>
                              <h5 className={styles.heroTitle}>
                                   <span className={styles.heroIcon}>
                                        <RiMailLine size={16} />
                                   </span>
                                   Email Services
                              </h5>
                         </div>
                         <p className={styles.heroDescription}>
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
