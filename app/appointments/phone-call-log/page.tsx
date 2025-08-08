'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Form, Button, Container, Row, Col, Card, Modal, Table, Badge } from 'react-bootstrap';
import { customPost, customFetch } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { RiAddLine, RiPhoneFill, RiEditLine } from '@remixicon/react';

interface PhoneCallLogForm {
    patientid: number;
    appointment_refid: number;
    call_direction: 'outbound' | 'inbound';
    purpose: string;
    scheduled_at?: string;
    started_at?: string;
    ended_at?: string;
    outcome?: 'answered' | 'no_answer' | 'voicemail' | 'failed' | 'busy' | 'declined' | 'left_message';
    status?: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
    call_reference_id?: string;
    recording_url?: string;
    notes?: string;
    retry_count?: number;
    next_followup_at?: string;
}

interface PhoneCallLog extends PhoneCallLogForm {
    id: number;
    duration_seconds: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export default function PhoneCallLogPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get appointment data from URL parameters
    const patientid = parseInt(searchParams?.get('patientid') ?? '');
    const appointment_refid = parseInt(searchParams?.get('refid') || '0');
    const patientName = searchParams?.get('patientName') || '';
    const appointmentDate = searchParams?.get('appointmentDate') || '';
    const appointmentTime = searchParams?.get('appointmentTime') || '';
    const appointmentPurpose = searchParams?.get('appointmentPurpose') || '';

    const [form, setForm] = useState<PhoneCallLogForm>({
        patientid: patientid || 0,
        appointment_refid: appointment_refid || 0,
        call_direction: 'outbound',
        purpose: '',
        scheduled_at: '',
        started_at: '',
        ended_at: '',
        outcome: 'answered',
        status: 'scheduled',
        call_reference_id: '',
        recording_url: '',
        notes: '',
        retry_count: 0,
        next_followup_at: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [phoneCallLogs, setPhoneCallLogs] = useState<PhoneCallLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingLog, setEditingLog] = useState<PhoneCallLog | null>(null);

    // Load phone call logs for this appointment
    useEffect(() => {
        const loadPhoneCallLogs = async () => {
            if (appointment_refid) {
                try {
                    setIsLoading(true);
                    const response = await customFetch(`appointments/reminder/appointment/phonecalls/${appointment_refid}`);
                    if (Array.isArray(response)) {
                        setPhoneCallLogs(response);
                    } else {
                        setPhoneCallLogs([]);
                    }
                } catch (error) {
                    console.error('Error loading phone call logs:', error);
                    setPhoneCallLogs([]);
                    toast.error('Failed to load phone call logs.');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        loadPhoneCallLogs();
    }, [appointment_refid]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = {
            ...form, retry_count: !isNaN((form.retry_count ?? 0)) ? parseInt((form.retry_count ?? 0).toString()) : 0,
        }
        try {
            const resp = await customPost('appointment/reminder/phonecall', 'POST', formData);
            if (resp && resp.status === 'success') {
                toast.success('Phone call log saved successfully.');
                setShowModal(false);
                // Reset form
                setForm({
                    patientid: patientid || 0,
                    appointment_refid: appointment_refid || 0,
                    call_direction: 'outbound',
                    purpose: '',
                    scheduled_at: '',
                    started_at: '',
                    ended_at: '',
                    outcome: 'answered',
                    status: 'scheduled',
                    call_reference_id: '',
                    recording_url: '',
                    notes: '',
                    retry_count: 0,
                    next_followup_at: '',
                });
                setEditingLog(null);
                // Reload the phone call logs
                if (appointment_refid) {
                    const response = await customFetch(`appointments/reminder/appointment/phonecalls/${appointment_refid}`);
                    if (Array.isArray(response)) {
                        setPhoneCallLogs(response);
                    }
                }
            } else {
                toast.error('Failed to save phone call log.');
            }
        } catch (error) {
            toast.error('Failed to save phone call log.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewCall = () => {
        setForm({
            patientid: patientid || 0,
            appointment_refid: appointment_refid || 0,
            call_direction: 'outbound',
            purpose: '',
            scheduled_at: '',
            started_at: '',
            ended_at: '',
            outcome: 'answered',
            status: 'scheduled',
            call_reference_id: '',
            recording_url: '',
            notes: '',
            retry_count: 0,
            next_followup_at: '',
        });
        setEditingLog(null);
        setShowModal(true);
    };

    const handleEditCall = (log: PhoneCallLog) => {
        setForm({
            patientid: log.patientid,
            appointment_refid: log.appointment_refid,
            call_direction: log.call_direction,
            purpose: log.purpose,
            scheduled_at: log.scheduled_at ? dayjs(log.scheduled_at).format('YYYY-MM-DDTHH:mm') : '',
            started_at: log.started_at ? dayjs(log.started_at).format('YYYY-MM-DDTHH:mm') : '',
            ended_at: log.ended_at ? dayjs(log.ended_at).format('YYYY-MM-DDTHH:mm') : '',
            outcome: log.outcome,
            status: log.status,
            call_reference_id: log.call_reference_id || '',
            recording_url: log.recording_url || '',
            notes: log.notes || '',
            retry_count: log.retry_count ? parseInt((log.retry_count?.toString() ?? '')) || 0 : 0,
            next_followup_at: log.next_followup_at ? dayjs(log.next_followup_at).format('YYYY-MM-DDTHH:mm') : '',
        });
        setEditingLog(log);
        setShowModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'in_progress': return 'warning';
            case 'scheduled': return 'info';
            case 'missed': return 'danger';
            case 'cancelled': return 'secondary';
            default: return 'secondary';
        }
    };

    const getOutcomeColor = (outcome: string) => {
        switch (outcome?.toLowerCase()) {
            case 'answered': return 'success';
            case 'voicemail': return 'warning';
            case 'left_message': return 'info';
            case 'no_answer': case 'failed': case 'busy': case 'declined': return 'danger';
            default: return 'secondary';
        }
    };

    const handleCancel = () => {
        router.push('/appointments/appointment-list');
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Phone Call Logs</h4>
                <div className="d-flex gap-2">
                    <Button
                        variant="success"
                        onClick={handleNewCall}
                        className="d-flex align-items-center gap-2"
                        disabled={!appointment_refid}
                    >
                        <RiAddLine size={16} />
                        Add Phone Call
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleCancel}
                    >
                        Back to Appointments
                    </Button>
                </div>
            </div>

            {/* Appointment Details Section */}
            {(patientName || appointmentDate) && (
                <Card className="mb-4">
                    <Card.Body>
                        <h6 className="text-primary mb-3">Appointment Details</h6>
                        <Row>
                            <Col md={6}>
                                <strong>Patient:</strong> {patientName}<br />
                                <strong>Patient ID:</strong> {patientid}
                            </Col>
                            <Col md={6}>
                                <strong>Date:</strong> {appointmentDate ? dayjs(appointmentDate).format('DD MMM YYYY') : '-'}<br />
                                <strong>Time:</strong> {appointmentTime}
                            </Col>
                        </Row>
                        {appointmentPurpose && (
                            <div className="mt-2">
                                <strong>Appointment Purpose:</strong> {appointmentPurpose}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Phone Call Logs Table */}
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <RiPhoneFill className="me-2" />
                        Phone Call History
                    </h5>
                    {phoneCallLogs.length > 0 && (
                        <small className="text-muted">{phoneCallLogs.length} call(s)</small>
                    )}
                </Card.Header>
                <Card.Body>
                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : phoneCallLogs.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <RiPhoneFill size={48} className="mb-3 opacity-50" />
                            <p className="mb-0">No phone call logs found for this appointment.</p>
                            {appointment_refid && (
                                <Button
                                    variant="outline-primary"
                                    className="mt-3"
                                    onClick={handleNewCall}
                                >
                                    <RiAddLine className="me-1" />
                                    Add First Phone Call
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Date/Time</th>
                                        <th>Direction</th>
                                        <th>Purpose</th>
                                        <th>Outcome</th>
                                        <th>Status</th>
                                        <th>Duration</th>
                                        <th>Next Follow-up</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {phoneCallLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>
                                                <small>
                                                    {log.started_at ? dayjs(log.started_at).format('DD MMM YYYY HH:mm') :
                                                        log.scheduled_at ? dayjs(log.scheduled_at).format('DD MMM YYYY HH:mm') : '-'}
                                                </small>
                                            </td>
                                            <td>
                                                <Badge bg={log.call_direction === 'outbound' ? 'primary' : 'info'}>
                                                    {log.call_direction}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '200px' }}>
                                                    <small className="text-truncate d-block" title={log.purpose}>
                                                        {log.purpose}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={getOutcomeColor(log.outcome || '')}>
                                                    {log.outcome}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={getStatusColor(log.status || '')}>
                                                    {log.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <small>
                                                    {log.duration_seconds ?
                                                        `${Math.floor(log.duration_seconds / 60)}m ${log.duration_seconds % 60}s` :
                                                        '-'
                                                    }
                                                </small>
                                            </td>
                                            <td>
                                                <small>
                                                    {log.next_followup_at ?
                                                        dayjs(log.next_followup_at).format('DD MMM YYYY') :
                                                        '-'
                                                    }
                                                </small>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => handleEditCall(log)}
                                                >
                                                    <RiEditLine size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Phone Call Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingLog ? 'Edit Phone Call Log' : 'Add New Phone Call Log'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Patient ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="patientid"
                                        value={form.patientid || ''}
                                        onChange={handleChange}
                                        disabled={!!patientid}
                                        required
                                        placeholder="Enter patient ID..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Appointment Ref ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="appointment_refid"
                                        value={form.appointment_refid || ''}
                                        onChange={handleChange}
                                        disabled={!!appointment_refid}
                                        placeholder="Enter appointment ref ID..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Call Direction *</Form.Label>
                                    <Form.Select
                                        name="call_direction"
                                        value={form.call_direction}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="outbound">Outbound</option>
                                        <option value="inbound">Inbound</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Outcome</Form.Label>
                                    <Form.Select name="outcome" value={form.outcome} onChange={handleChange}>
                                        <option value="answered">Answered</option>
                                        <option value="no_answer">No Answer</option>
                                        <option value="voicemail">Voicemail</option>
                                        <option value="failed">Failed</option>
                                        <option value="busy">Busy</option>
                                        <option value="declined">Declined</option>
                                        <option value="left_message">Left Message</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Purpose *</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="purpose"
                                value={form.purpose}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="Enter the purpose of this phone call..."
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Scheduled At</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="scheduled_at"
                                        value={form.scheduled_at}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Started At</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="started_at"
                                        value={form.started_at}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ended At</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="ended_at"
                                        value={form.ended_at}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={form.status} onChange={handleChange}>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="missed">Missed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Retry Count</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="retry_count"
                                        value={form.retry_count}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Call Reference ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="call_reference_id"
                                        value={form.call_reference_id}
                                        onChange={handleChange}
                                        placeholder="Enter call system reference ID..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Recording URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="recording_url"
                                        value={form.recording_url}
                                        onChange={handleChange}
                                        placeholder="Enter recording URL..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter any additional notes about this call..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Next Follow-up At</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="next_followup_at"
                                value={form.next_followup_at}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (editingLog ? 'Update Phone Call Log' : 'Save Phone Call Log')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
