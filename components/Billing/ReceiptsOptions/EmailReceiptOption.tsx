import { Button, Form, Modal } from "react-bootstrap";
import { useState } from "react";

interface EmailReceiptModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (e: React.FormEvent, email: string) => void;
}

const EmailReceiptModal: React.FC<EmailReceiptModalProps> = ({ show, onHide, onSubmit }) => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e, email);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Enter Email Address</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} id="emailForm">
                    <Form.Group controlId="emailInput">
                        <Form.Label>Email:</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" type="submit" form="emailForm">
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EmailReceiptModal;
