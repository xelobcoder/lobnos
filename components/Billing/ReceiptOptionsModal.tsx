import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { customFetch } from '../Auth/customFetch';
import { toast } from 'react-toastify';
import { useApplication } from '../Auth/useApplicationContext';
import { useRouter } from 'next/navigation';

interface ReceiptModalProps {
    open: boolean;
    close: () => void;
    patientid: number;
    billingid: number;
}

export default function ReceiptOptionsModal({ open, close, billingid, patientid }: ReceiptModalProps) {
    const [isEmailLoading, setIsEmailLoading] = useState(false); 
    const [isEmailSent, setIsEmailSent] = useState(false);
    const employeeid = useApplication()?.user?.employeeid;
    const branchid = useApplication()?.branchid;
    const router = useRouter();
    const cardStyle = {
        width: '75px',
        height: '50px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        backgroundColor: '#f8f9fa',
    };

    const handlePrintClick = (ispos: boolean = false) => {
        if (!billingid) return;
        window.open(`${process.env.PLS_PDF_GENERATOR}generate/receipt/invoice?billingid=${billingid}&&is_pos=${ispos}`);
    };

    const handleEmailClick = async () => {
        if (!billingid) return;

        setIsEmailLoading(true); // Start loading
        setIsEmailSent(false); // Reset success state

        try {
            const response = await customFetch(`billing/send/receipt/email/${patientid}/${billingid}`);
            const { status } = response;

            if (status && status === true) {
                toast.success('Receipt delivered via email successfully');
                setIsEmailSent(true); 
                setTimeout(() => {
                    close();
                    // Navigate back to multi billing page
                    router.push(`/billing/patientid/${patientid}/multi/1`);
                }, 2000);
            } else {
                toast.error('Receipt via email failed');
            }
        } catch (error) {
            toast.error('An error occurred while sending the email');
        } finally {
            setIsEmailLoading(false);
        }
    };

    const [isSMSLoading, setIsSMSLoading] = useState(false);
    const handleSMSClick = async () => {
        if (!billingid) return;
        setIsSMSLoading(true);
        try {
          if (!employeeid || !billingid) return 
             const response = await customFetch(`sms/events/trigger/payment-made?billingid=${billingid}&&employeeid=${employeeid}`);
            const { status } = response;
            if (status &&( status === true || status === 'success')) {
                toast.success('Receipt sent via SMS successfully');
                setTimeout(() => {
                    close();
                    // Navigate back to multi billing page
                    router.push(`/billing/patientid/${patientid}/multi/1`);
                }, 2000);
            } else {
                toast.error('Receipt via SMS failed');
            }
        } catch (error) {
            toast.error('An error occurred while sending the SMS');
        } finally {
            setIsSMSLoading(false);
        }
    };

    return (
        <>
            <Modal backdrop="static" show={open} onHide={close} size={"md" as any}>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-5">Send Receipt via</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        {/* <Col md={3}>
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
                                    {isEmailLoading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : isEmailSent ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="green"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    ) : (
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
                                    )}
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>Email</div>
                                </Card.Body>
                            </Card>
                        </Col> */}
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onClick={isSMSLoading ? undefined : handleSMSClick}
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
                                    {isSMSLoading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
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
                                    )}
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>SMS</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onClick={() => handlePrintClick(true)}
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
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>Print Out Pos</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card
                                className="h-100 text-center pls-color"
                                style={cardStyle}
                                onClick={() => handlePrintClick(false)}
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
                                    <div className="mb-0" style={{ fontSize: '0.7rem' }}>Print Out A4</div>
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