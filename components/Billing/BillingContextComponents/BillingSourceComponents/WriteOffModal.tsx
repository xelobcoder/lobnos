import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

interface WriteOffModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
    reason: string;
    setReason: (v: string) => void;
    isSubmitting: boolean;
}

const WriteOffModal: React.FC<WriteOffModalProps> = ({ show, onClose, onSubmit, reason, setReason, isSubmitting }) => (
    <Modal show={show} onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title>Write Off Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">
                <label htmlFor="writeOffReason" className="form-label">Reason for Writing Off</label>
                <textarea
                    id="writeOffReason"
                    className="form-control"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for writing off this transaction..."
                />
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button variant="danger" onClick={onSubmit} disabled={isSubmitting || !reason.trim()}>
                {isSubmitting ? <Spinner size="sm" /> : null} Write Off
            </Button>
        </Modal.Footer>
    </Modal>
);

export default WriteOffModal;
