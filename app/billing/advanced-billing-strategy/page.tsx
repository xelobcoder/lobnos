'use client'
import Link from 'next/link';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  RiBillLine,
  RiUserShared2Line,
  RiPriceTag3Line,
  RiToggleLine,
  RiCoupon3Line,
  RiMegaphoneLine,
  RiFlaskLine,
  RiFileList3Line,
  RiArrowRightSLine
} from '@remixicon/react';

const dashboardItems = [
  {
    icon: RiBillLine,
    title: 'Billing Strategies',
    text: 'Create and manage your core billing strategies.',
    href: '/billing/advanced-billing-strategy/strategies',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  {
    icon: RiUserShared2Line,
    title: 'Strategy Assignments',
    text: 'Assign specific billing strategies to entities.',
    href: '/assignments',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  {
    icon: RiPriceTag3Line,
    title: 'Strategy Prices',
    text: 'Define and manage the price rules for strategies.',
    href: '/prices',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  {
    icon: RiToggleLine,
    title: 'Strategy Conditions',
    text: 'Set the conditions under which strategies apply.',
    href: '/conditions',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  {
    icon: RiCoupon3Line,
    title: 'Promo Codes',
    text: 'Generate and manage promotional codes.',
    href: '/promo-codes',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  {
    icon: RiMegaphoneLine,
    title: 'Campaigns',
    text: 'Organize and run billing-related campaigns.',
    href: '/campaigns',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
  {
    icon: RiFlaskLine,
    title: 'Test Panels',
    text: 'Simulate and test various billing scenarios.',
    href: '/test-panels',
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.1)',
  },
  {
    icon: RiFileList3Line,
    title: 'Audit Log',
    text: 'Review price calculation and system audit logs.',
    href: '/audit',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.1)',
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-container min-vh-100 br-5 bg-secondary-subtle">
      <Container fluid="lg" >
        <div className="text-center mb-5">
          <h4 className="title-gradient fw-bolder display-6 p-2">
            Billing Command Center
          </h4>
          <p className="text-muted fs-5">
            Your central hub for orchestrating all billing operations.
          </p>
        </div>
        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
          {dashboardItems.map((item) => (
            <Col key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <a className="text-decoration-none">
                  <Card className="h-100 border-0 shadow-sm dashboard-card">
                    <Card.Body className="p-3 d-flex flex-column">
                      <div
                        className="icon-wrapper mb-3 p-2 br-5"
                        style={{ backgroundColor: item.bgColor }}
                      >
                        <item.icon size={30} style={{ color: item.color }} />
                      </div>
                      <Card.Title as="h6" className="fw-bold mb-2">{item.title}</Card.Title>
                      <Card.Text className="text-secondary small flex-grow-1">
                        {item.text}
                      </Card.Text>
                      <div className="mt-3">
                        <span className="card-link fw-semibold" style={{ color: item.color }}>
                          Manage
                          <RiArrowRightSLine size={18} className="arrow ms-1" />
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </a>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
      
    </div>
  );
}