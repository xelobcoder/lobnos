import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Form } from 'react-bootstrap';

interface ReceiptModalProps {
    open: boolean;
    close: () => void;
}




export default function ReceiptOptionsModal({ open, close }: ReceiptModalProps) {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showSMSModal, setShowSMSModal] = useState(false);

    const cardStyle = {
        width: '75px',
        height: '50px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        backgroundColor: '#f8f9fa',
    };

    const handlePrintClick = () => {
        window.open('/invoice', '_blank');
        close();
    };

    const handleEmailClick = () => {
        setShowEmailModal(true);
    };

    const handleSMSClick = () => {
        setShowSMSModal(true);
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        console.log('Email form submitted');
        setShowEmailModal(false);
        close();
    };

    const handleSMSSubmit = (e) => {
        e.preventDefault();
        console.log('SMS form submitted');
        setShowSMSModal(false);
        close();
    };

    return (
        <>
            <Modal backdrop="static" show={open} onHide={close} size={"md" as any}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Send Receipt via</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onClick={handleEmailClick}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>Email</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onClick={handleSMSClick}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                    </svg>
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>SMS</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onClick={handlePrintClick}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2H6z" />
                                        <path d="M4 2h16v16H4z" />
                                        <path d="M10 6h4" />
                                        <path d="M10 10h4" />
                                        <path d="M10 14h4" />
                                    </svg>
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>Print Out</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>
                                        Send to Institution
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="btn-sm" onClick={close}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

         
          
        </>
    );
}
