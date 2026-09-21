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
        completed: { bg: '#166534', icon: '#22c55e' },
        initiated: { bg: '#1d4ed8', icon: '#60a5fa' },
        uninitiated: { bg: '#c2410c', icon: '#fb923c' },
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
            className="h-100 border-0 shadow-sm"
            style={{
                background: bgColor,
                borderRadius: '8px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                height: '140px',
                color: 'white',
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
            <Card.Body className="p-3 d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-2">
                    <div
                        style={{
                            backgroundColor: iconColor,
                            padding: '5px',
                            borderRadius: '6px',
                            width: '34px',
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon style={{ fontSize: '1rem', color: 'white' }} />
                    </div>
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                        {title}
                    </h6>
                </div>
                <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                <div style={{ fontSize: '1.8rem' }} className="fw-bold mt-auto">
                    {formatAsCurrency ? value : value}
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="mb-3">
            <h2 className="fs-6 fw-semibold mb-3">
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
