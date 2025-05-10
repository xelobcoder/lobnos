"use client";
import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import { 
    RiCheckDoubleLine, 
    RiPlayFill, 
    RiHourglassLine 
} from '@remixicon/react';

export default function TestsCompletedVsInitiatedVrsUninitiated({ value = [] }) {
    if (!value.length) {
        return (
            <div className="text-center p-3">
                No data available.
            </div>
        );
    }

    const cardColors = {
        completed: { bg: '#ECF2FF', icon: '#3B82F6' },
        initiated: { bg: '#E8FDF5', icon: '#10B981' },
        uninitiated: { bg: '#FFF4ED', icon: '#F97316' },
    };

    const AnalyticCard = ({
        title,
        value,
        Icon,
        bgColor,
        iconColor,
        formatAsCurrency = false,
    }) => (
        <Card
            className="h-100 border-0"
            style={{
                background: bgColor,
                borderRadius: '12px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                height: '89px',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <Card.Body className="p-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <div
                        style={{
                            backgroundColor: iconColor,
                            padding: '5px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon style={{ fontSize: '1rem', color: 'white' }} />
                    </div>
                    <h6 className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                        {title}
                    </h6>
                </div>
                <div style={{ fontSize: '1.25rem' }} className="fw-bold">
                    {formatAsCurrency ? value : value}
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="mb-3">
            <h2 className="fs-4 fw-bold mb-3 pls-label bg-secondary-subtle p-2 br-5 col-4">
                Tests Summary
            </h2>
            <Row xs={1} md={3} className="g-3">
                <Col>
                    <AnalyticCard
                        title="Completed Tests"
                        value={value[0].completed_tests}
                        Icon={RiCheckDoubleLine}
                        bgColor={cardColors.completed.bg}
                        iconColor={cardColors.completed.icon}
                        formatAsCurrency={false}
                    />
                </Col>
                <Col>
                    <AnalyticCard
                        title="Initiated Tests"
                        value={value[0].initiated_tests}
                        Icon={RiPlayFill}
                        bgColor={cardColors.initiated.bg}
                        iconColor={cardColors.initiated.icon}
                        formatAsCurrency={false}
                    />
                </Col>
                <Col>
                    <AnalyticCard
                        title="Uninitiated"
                        value={value[0].uninitiated}
                        Icon={RiHourglassLine}
                        bgColor={cardColors.uninitiated.bg}
                        iconColor={cardColors.uninitiated.icon}
                        formatAsCurrency={false}
                    />
                </Col>
            </Row>
        </Container>
    );
}
