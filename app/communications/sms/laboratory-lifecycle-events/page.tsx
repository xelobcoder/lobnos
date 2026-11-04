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
import EditTemplateModal from './EditTemplateModal';

import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { smsCapabilities } from '../../../../lib/sms';

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
    const canConfigure = smsCapabilities(useApplication().user?.role).setup;
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingEvent, setEditingEvent] = useState<(Event & { placeholders?: string[] }) | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [placeholders, setPlaceholders] = useState<{ [key: string]: string[] }>({});
    const [selectedPlaceholder, setSelectedPlaceholder] = useState('');
    const [usedPlaceholders, setUsedPlaceholders] = useState<string[]>([]);
    const [placeholdersLoading, setPlaceholdersLoading] = useState<boolean>(false);

    const extractPlaceholdersFromEvents = useCallback((events: Event[]) => {
        const placeholdersByCategory: { [key: string]: string[] } = {
            patient: [],
            clinician: [],
            organization: []
        };

        events.forEach(event => {
            const placeholderPattern = /\{\{([^}]+)\}\}/g;
            const matches = event.content.match(placeholderPattern) || [];

            matches.forEach(match => {
                if (!placeholdersByCategory[event.category].includes(match)) {
                    placeholdersByCategory[event.category].push(match);
                }
            });
        });

        // Sort placeholders alphabetically for each category
        Object.keys(placeholdersByCategory).forEach(category => {
            placeholdersByCategory[category].sort();
        });

        setPlaceholders(placeholdersByCategory);
    }, []);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await customFetch(`sms/events`);
            if (response && response.success && Array.isArray(response.data)) {
                setEvents(response.data);
                // Extract placeholders from the actual event content
                extractPlaceholdersFromEvents(response.data);
            } else {
                setError("Failed to load SMS events");
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [extractPlaceholdersFromEvents]);

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

    const handleEditTemplate = (eventId: number) => {
        const event = events.find(e => e.eventid === eventId);
        if (!event) return;
        setEditingEvent(event);
        setSelectedPlaceholder('');
        setShowEditModal(true);

        // Extract placeholders already in the content
        const placeholderPattern = /\{\{[^}]+\}\}/g;
        const currentPlaceholders = event.content.match(placeholderPattern) || [];
        const uniquePlaceholders = Array.from(new Set(currentPlaceholders));
        setUsedPlaceholders(uniquePlaceholders);
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
            const wrapped = `{{${placeholder}}}`;
            const newContent = editingEvent.content + (editingEvent.content && !editingEvent.content.endsWith(' ') ? ' ' : '') + wrapped;
            setEditingEvent((prev) => prev ? ({
                ...prev,
                content: newContent
            }) : null);
            // Re-scan content for all placeholders
            const placeholderPattern = /\{\{[^}]+\}\}/g;
            const allPlaceholders = newContent.match(placeholderPattern) || [];
            const uniquePlaceholders = Array.from(new Set(allPlaceholders));
            setUsedPlaceholders(uniquePlaceholders);
        }
    };

    const handleRemovePlaceholder = (placeholderToRemove: string) => {
        if (placeholderToRemove && editingEvent) {
            const updatedContent = editingEvent.content.replace(placeholderToRemove, '').replace(/\s+/g, ' ').trim();

            setEditingEvent((prev) => prev ? ({
                ...prev,
                content: updatedContent
            }) : null);

            // Re-scan content for remaining placeholders
            const placeholderPattern = /\{\{[^}]+\}\}/g;
            const remainingPlaceholders = updatedContent.match(placeholderPattern) || [];
            const uniqueRemaining = Array.from(new Set(remainingPlaceholders));
            setUsedPlaceholders(uniqueRemaining);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setEditingEvent({
            ...editingEvent!,
            content: newContent
        });

        // Re-scan content for placeholders when user types
        const placeholderPattern = /\{\{[^}]+\}\}/g;
        const foundPlaceholders = newContent.match(placeholderPattern) || [];
        const uniquePlaceholders = Array.from(new Set(foundPlaceholders));
        setUsedPlaceholders(uniquePlaceholders);
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
            Cell: ({ cell: { value } }: {cell: {value: string}}) => <code className="text-primary">{value}</code>
        },
        {
            Header: 'Description',
            accessor: 'description'
        },
        {
            Header: 'Category',
            accessor: 'category',
            Cell: ({ cell: { value } }: {cell: {value: string}}) => (
                <span className={getCategoryBadgeClass(value)}>
                    {value}
                </span>
            )
        },
        {
            Header: 'Content Preview',
            accessor: 'content',
            Cell: ({ cell: { value } }: {cell: {value: string}}) => (
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
            Cell: ({ cell: { value } }: {cell: {value: string}}) => (
                <span className="text-muted small">
                    {formatDate(value)}
                </span>
            )
        },
        {
            Header: 'Status',
            accessor: 'active',
            Cell: ({ cell: { value } }: {cell: {value: number}}) => (
                <span className={`badge ${value === 1 ? 'bg-success' : 'bg-secondary'}`}>
                    {value === 1 ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }: {row: {original: Event}}) => {
                const event = row.original;
                return (
                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-sm ${event.active === 1 ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            disabled={!canConfigure} onClick={() => toggleEventStatus(event.eventid, event.active)}
                        >
                            {event.active === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        {editingEvent?.eventid !== event.eventid && (
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={!canConfigure} onClick={() => handleEditTemplate(event.eventid)}
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
                        column={canConfigure ? columns : columns.filter(column => column.accessor !== 'actions')}
                        serverSideFiltering={false}
                        handleSeverSideProcessing={null}
                    />
                </div>
            </div>

            {/* Edit Template Modal */}
            <EditTemplateModal
                showEditModal={showEditModal}
                handleCancelEdit={handleCancelEdit}
                handleSaveTemplate={handleSaveTemplate}
                editingEvent={editingEvent}
                selectedPlaceholder={selectedPlaceholder}
                handlePlaceholderSelect={handlePlaceholderSelect}
                placeholdersLoading={placeholdersLoading}
                usedPlaceholders={usedPlaceholders}
                handlePlaceholderClick={handlePlaceholderClick}
                handleRemovePlaceholder={handleRemovePlaceholder}
                handleContentChange={handleContentChange}
                placeholders={editingEvent?.placeholders || []}
            />
        </div>
    );
}


