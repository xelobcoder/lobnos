import { Button, Form, Modal } from "react-bootstrap";
import React, { useState } from "react";

interface SMSBillingReceiptModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (phoneNumber: string) => void;
    title: string;
}

const SMSBillingReceiptModal: React.FC<SMSBillingReceiptModalProps> = ({ show, onHide, onSubmit, title }) => {
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(phoneNumber);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="form-modal-title">
            <Modal.Header closeButton>
                <Modal.Title id="form-modal-title">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} id="form-modal">
                    <Form.Group controlId="smsInput">
                        <Form.Label>Phone Number:</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="123-456-7890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            aria-required="true"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} aria-label="Close">
                    Close
                </Button>
                <Button variant="primary" type="submit" form="form-modal" aria-label="Submit">
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SMSBillingReceiptModal;