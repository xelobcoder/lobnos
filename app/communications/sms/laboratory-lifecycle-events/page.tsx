'use client';
import { useState, useCallback, useEffect } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { toast } from 'react-toastify';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import styles from './LaboratorySMSLifecycle.module.css';

interface Event {
    eventid: number;
    code: string;
    description: string;
    category: 'patient' | 'clinician' | 'organization';
    createdat: string;
    content: string;
    active: number;
}


export default function LaboratorySMSLifecycle() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingEvent, setEditingEvent] = useState<{ eventId: number; code: string; content: string; description: string; category: string } | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [placeholders, setPlaceholders] = useState<{ [key: string]: string[] }>({});
    const [selectedPlaceholder, setSelectedPlaceholder] = useState('');
    const [usedPlaceholders, setUsedPlaceholders] = useState<string[]>([]);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await customFetch(`sms/events`);
            if (response && response.success && Array.isArray(response.data)) {
                setEvents(response.data);
            } else {
                setError("Failed to load SMS events");
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const toggleEventStatus = useCallback(async (eventId: number, currentStatus: number) => {
        try {
            const newStatus = currentStatus === 1 ? false : true;
            const response = await customFetch(`sms/events/${eventId}/toggle?toggle=${newStatus}`);

            if (response && response.success) {
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.eventid === eventId
                            ? { ...event, active: newStatus ? 1 : 0 }
                            : event
                    )
                );
                toast.success(`Event ${newStatus ? 'activated' : 'deactivated'} successfully`);
            } else {
                toast.error('Failed to update event status');
            }
        } catch (err) {
            console.error("Error toggling event status:", err);
            toast.error('Failed to update event status');
        }
    }, []);

    const updateEventTemplate = useCallback(async (eventCode: string, newContent: string) => {
        try {
            const response = await customPost(`sms/events/${eventCode}/template`, 'PUT', { content: newContent });

            if (response && response.success) {
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.code === eventCode
                            ? { ...event, content: newContent }
                            : event
                    )
                );
                toast.success('Event template updated successfully');
                setEditingEvent(null);
                setShowEditModal(false);
            } else {
                toast.error('Failed to update event template');
            }
        } catch (err) {
            console.error("Error updating event template:", err);
            toast.error('Failed to update event template');
        }
    }, []);

    const handleEditTemplate = (eventId: number, code: string, content: string, description: string, category: string) => {
        setEditingEvent({ eventId, code, content, description, category });
        setUsedPlaceholders([]);
        setSelectedPlaceholder('');
        setShowEditModal(true);
        
        customFetch('prime/sms-category-mappings-with-placeholders').then((data) => {
            if (data && typeof data === 'object' && data.patient) {
                setPlaceholders(data);
            } else {
                setPlaceholders({});
                console.error('Invalid placeholders data from backend:', data);
            }
        });
    };

    const handleSaveTemplate = () => {
        if (editingEvent) {
            updateEventTemplate(editingEvent.code, editingEvent.content);
        }
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
        setShowEditModal(false);
        setUsedPlaceholders([]);
        setSelectedPlaceholder('');
    };

    const handlePlaceholderClick = (placeholder: string) => {
        if (placeholder && editingEvent) {
            setEditingEvent((prev) => prev ? ({ 
                ...prev, 
                content: prev.content + (prev.content && !prev.content.endsWith(' ') ? ' ' : '') + placeholder 
            }) : null);
            setUsedPlaceholders((prev) => prev.includes(placeholder) ? prev : [...prev, placeholder]);
        }
    };

    const handleRemovePlaceholder = (placeholderToRemove: string) => {
        if (placeholderToRemove && editingEvent) {
            setEditingEvent((prev) => prev ? ({ 
                ...prev, 
                content: prev.content.replace(placeholderToRemove, '').replace(/\s+/g, ' ').trim()
            }) : null);
            
            setUsedPlaceholders((prev) => {
                const updatedContent = editingEvent.content.replace(placeholderToRemove, '').replace(/\s+/g, ' ').trim();
                const stillExists = updatedContent.includes(placeholderToRemove);
                return stillExists ? prev : prev.filter(ph => ph !== placeholderToRemove);
            });
        }
    };

    const handlePlaceholderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const ph = e.target.value;
        setSelectedPlaceholder(ph);
        if (ph) {
            handlePlaceholderClick(ph);
            setSelectedPlaceholder('');
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'patient':
                return 'badge bg-primary';
            case 'clinician':
                return 'badge bg-success';
            case 'organization':
                return 'badge bg-warning';
            default:
                return 'badge bg-secondary';
        }
    };

    const columns = [
        { 
            Header: 'Event Code', 
            accessor: 'code',
            Cell: ({ cell: { value } }) => <code className="text-primary">{value}</code>
        },
        { 
            Header: 'Description', 
            accessor: 'description' 
        },
        { 
            Header: 'Category', 
            accessor: 'category',
            Cell: ({ cell: { value } }) => (
                <span className={getCategoryBadgeClass(value)}>
                    {value}
                </span>
            )
        },
        { 
            Header: 'Content Preview', 
            accessor: 'content',
            Cell: ({ cell: { value } }) => (
                <div
                    className="text-truncate"
                    style={{ maxWidth: '250px' }}
                    title={value}
                >
                    {value}
                </div>
            )
        },
        { 
            Header: 'Created', 
            accessor: 'createdat',
            Cell: ({ cell: { value } }) => (
                <span className="text-muted small">
                    {formatDate(value)}
                </span>
            )
        },
        { 
            Header: 'Status', 
            accessor: 'active',
            Cell: ({ cell: { value } }) => (
                <span className={`badge ${value === 1 ? 'bg-success' : 'bg-secondary'}`}>
                    {value === 1 ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { 
            Header: 'Actions', 
            accessor: 'actions',
            Cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-sm ${event.active === 1 ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => toggleEventStatus(event.eventid, event.active)}
                        >
                            {event.active === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        {editingEvent?.eventId !== event.eventid && (
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditTemplate(event.eventid, event.code, event.content, event.description, event.category)}
                            >
                                Edit Template
                            </button>
                        )}
                    </div>
                );
            },
            disableSortBy: true
        }
    ];

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="ms-3">Loading SMS events...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pageContainer}>
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error</h4>
                    <p>{error}</p>
                    <button className="btn btn-outline-danger" onClick={fetchTemplates}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (events.length === 0 && !isLoading) {
        return (
            <div className="text-center py-4 bg-white" >
                <p className="text-muted">No SMS events configured</p>
            </div>
        )
    }

    return (
        <div className={styles.pageContainer}>
            <div className="card">
                <div className="card-header">
                    <h6 className="card-title mb-0">Laboratory SMS Lifecycle Events</h6>
                    <small className="text-muted mb-0">Manage SMS notifications for various laboratory events</small>
                </div>
                <div className="card-body">
                    <PrimeTable
                        data={events}
                        column={columns}
                        serverSideFiltering={false}
                        handleSeverSideProcessing={null}
                    />
                </div>
            </div>

            {/* Edit Template Modal */}
            <Modal show={showEditModal} onHide={handleCancelEdit} size="lg" backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit SMS Template</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingEvent && (
                        <div className="row">
                            <div className="col-md-6 border-end">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Event:</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <code className="text-primary">{editingEvent.code}</code>
                                        <span className="text-muted">- {editingEvent.description}</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="templateContent" className="form-label fw-bold">
                                        SMS Template Content:
                                    </label>
                                    <textarea
                                        id="templateContent"
                                        className="form-control"
                                        rows={8}
                                        value={editingEvent.content}
                                        onChange={(e) => setEditingEvent({
                                            ...editingEvent,
                                            content: e.target.value
                                        })}
                                        placeholder="Enter your SMS template content here..."
                                    />
                                    <div className="form-text">
                                        You can use placeholders like <code>{'{{firstname}}'}</code>, <code>{'{{companyname}}'}</code>, etc.
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Insert Placeholder (Dropdown)</Form.Label>
                                    <Form.Select
                                        value={selectedPlaceholder}
                                        onChange={handlePlaceholderSelect}
                                    >
                                        <option value="">Select placeholder to insert</option>
                                        {(placeholders[editingEvent.category] || []).map((ph) => (
                                            <option key={ph} value={ph}>{ph}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Available Placeholders (Click to Add)</Form.Label>
                                    <div className="border rounded p-2 bg-light" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                        {(placeholders[editingEvent.category] || []).length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                                {(placeholders[editingEvent.category] || []).map((ph) => (
                                                    <Badge 
                                                        key={ph} 
                                                        bg="primary" 
                                                        className="cursor-pointer user-select-none"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handlePlaceholderClick(ph)}
                                                        title={`Click to add ${ph} to your message`}
                                                    >
                                                        {ph}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted">No placeholders available for this category</span>
                                        )}
                                    </div>
                                    <small className="text-muted">Click any placeholder above to add it to your message body</small>
                                </Form.Group>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Preview:</label>
                                    <div className="border rounded p-3 bg-light">
                                        <small className="text-muted">SMS Preview:</small>
                                        <div className="mt-1">{editingEvent.content || 'No content entered'}</div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <Form.Label>Used Placeholders (Click to Remove)</Form.Label>
                                    <div>
                                        {usedPlaceholders.length > 0 ? (
                                            usedPlaceholders.map((ph) => (
                                                <Badge 
                                                    bg="info" 
                                                    key={ph} 
                                                    className="me-1 mb-1 cursor-pointer user-select-none"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleRemovePlaceholder(ph)}
                                                    title={`Click to remove ${ph} from your message`}
                                                >
                                                    {ph} ×
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted">No placeholders used yet</span>
                                        )}
                                    </div>
                                    <small className="text-muted">
                                        {usedPlaceholders.length > 0 ? 'Click any placeholder above to remove it from your message' : ''}
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelEdit}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveTemplate}>
                        Save Template
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}


