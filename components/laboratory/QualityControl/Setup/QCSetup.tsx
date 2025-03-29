"use client"
import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';

export function QCSetup() {
    return (
        <Row>
            <Col md={6}>
                <Card className="mb-4">
                    <Card.Body>
                        <h5>QC Rules Configuration</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Default Warning Limits (SD)</Form.Label>
                                <Form.Control type="number" defaultValue={2} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Default Action Limits (SD)</Form.Label>
                                <Form.Control type="number" defaultValue={3} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox"
                                    label="Enable Westgard Rules"
                                    defaultChecked
                                />
                            </Form.Group>
                            <Button variant="primary">Save Rules</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card>
                    <Card.Body>
                        <h5>Notification Settings</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox"
                                    label="Email Notifications"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox"
                                    label="System Notifications"
                                    defaultChecked
                                />
                            </Form.Group>
                            <Button variant="primary">Save Settings</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}