"use client"
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

export function QCDashboard() {
    return (
        <div>
            <Row className="g-4">
                <Col md={6} lg={3}>
                    <Card>
                        <Card.Body>
                            <h6>Active Devices</h6>
                            <h2>12</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card>
                        <Card.Body>
                            <h6>QC Tests Today</h6>
                            <h2>24</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card>
                        <Card.Body>
                            <h6>Out of Range</h6>
                            <h2>2</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card>
                        <Card.Body>
                            <h6>Pending Reviews</h6>
                            <h2>3</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <h5>Recent QC Activities</h5>
                            {/* Add activity table here */}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Body>
                            <h5>Alerts</h5>
                            {/* Add alerts list here */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}