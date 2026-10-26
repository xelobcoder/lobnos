'use client';

import Link from 'next/link';
import React from 'react';
import ui from "../../components/Billing/billing-strategy/StrategyWorkspace.module.css";
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
          href: '/email-services/templates',
          icon: RiMailLine,
     },
     {
          title: 'Providers',
          description: 'Configure SMTP providers, defaults, and connection details.',
          href: '/email-services/providers',
          icon: RiMailCheckLine,
     },
     {
          title: 'Settings',
          description: 'Set retries, attachment limits, and delivery behavior.',
          href: '/email-services/settings',
          icon: RiSettings4Line,
     },
     {
          title: 'Queue',
          description: 'Queue outbound emails and process or retry delivery jobs.',
          href: '/email-services/queue',
          icon: RiMailSendLine,
     },
     {
          title: 'Logs',
          description: 'Review delivery outcomes, response payloads, and failures.',
          href: '/email-services/logs',
          icon: RiFileList3Line,
     },
     {
          title: 'Notifications',
          description: 'Manage event settings, templates, triggers, queue, and logs.',
          href: '/email-services/notifications',
          icon: RiMailSendLine,
     },
];

export default function EmailServicesHubPage() {
     return (
          <div className={`${ui.workspace} ${styles.pageRoot}`}>
               <header className={ui.header}><div className={ui.heading}><span className={ui.icon} aria-hidden="true"><RiMailLine size={24}/></span><div><span className={ui.eyebrow}>Communications</span><h1>Email Services</h1><p>Configure delivery, manage templates and review outbound messages.</p></div></div></header>
               <Row className="g-3">
                    {sections.map((section) => {
                         const Icon = section.icon;
                         return (
                              <Col key={section.href} md={6} xl={4}>
                                   <Link href={section.href} className="text-decoration-none text-body">
                                        <Card className={styles.navCard}>
                                             <Card.Body className={styles.navCardBody}>
                                                  <div className={styles.navTitleRow}>
                                                       <span className={ui.icon}>
                                                            <Icon size={18} />
                                                       </span>
                                                       <h2 className={styles.navTitle}>{section.title}</h2>
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
