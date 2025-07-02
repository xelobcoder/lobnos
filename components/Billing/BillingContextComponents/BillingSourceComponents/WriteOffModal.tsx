import React from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import { customPost } from '../../../Auth/customFetch';
import { toast } from 'react-toastify';

interface WriteOffModalProps {
    show: boolean;
    onClose: () => void;
    billingid: string;
    employeeid: string;
}


const WRITE_OFF_REASONS = [
    'Duplicate Entry',
    'Patient Request',
    'Billing Error',
    'Service Not Rendered',
    'Insurance Adjustment',
    'Test Cancelled by Physician',
    'Sample Not Received',
    'Sample Rejected (Quality Issue)',
    'Incorrect Patient Demographics',
    'Test Ordered in Error',
    'Test Not Covered by Insurance',
    'Patient Discharged Before Test',
    'Test Performed Externally',
    'Uncollectible Debt',
    'Charity/Compassionate Write-Off',
    'Contractual Adjustment',
    'Duplicate Billing Detected',
    'Test Not Authorized',
    'Patient Deceased',
    'Test Not Medically Necessary',
    'Test Not Approved by Lab Director',
    'Test Not Performed (Equipment Failure)',
    'Test Not Performed (Reagent Outage)',
    'Other',
];

const WriteOffModal: React.FC<WriteOffModalProps> = ({ show, onClose, billingid, employeeid }) => {
    const [reason, setReason] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const isOther = !WRITE_OFF_REASONS.includes(reason) && reason !== '' || reason === 'Other';

    React.useEffect(() => {
        if (!show) {
            setReason('');
        }
    }, [show]);


    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const response = await customPost('billing/write-off/transaction', 'POST', { billingid, reason, employeeid });
            if (response && response.status === false) {
                toast.error(response.message || 'Write-off failed.');
                return;
            }
            toast.success(response && response.message ? response.message : 'Transaction written off successfully.');
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Write Off Transaction</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <Form.Group controlId="writeOffReasonSelect">
                        <Form.Label>Reason for Writing Off</Form.Label>
                        <Form.Select
                            value={WRITE_OFF_REASONS.includes(reason) ? reason : (isOther ? 'Other' : '')}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === 'Other') {
                                    setReason('Other');
                                } else {
                                    setReason(val);
                                }
                            }}
                        >
                            <option value="" disabled>Select a reason...</option>
                            {WRITE_OFF_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
                {isOther && (
                    <div className="mb-3">
                        <Form.Group controlId="writeOffOtherReason">
                            <Form.Label>Please specify the reason</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reason === 'Other' ? '' : reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason for writing off this transaction..."
                            />
                        </Form.Group>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    onClick={handleSubmit}
                    disabled={submitting || (!reason.trim() || (isOther && (reason === 'Other' || !reason.trim())))}
                >
                    {submitting ? <Spinner size="sm" /> : null} Write Off
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default WriteOffModal;
