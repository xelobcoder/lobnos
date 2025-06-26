"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import {
    RiCalendarEventLine,
    RiUserHeartLine,
    RiMoneyDollarCircleLine,
    RiFileList3Line,
    RiAlertLine,
    RiSettings3Line, // Added for general settings/heading
    RiLoader4Line,   // For loading spinner
    RiErrorWarningLine // For error messages
} from '@remixicon/react';
import styles from './LaboratorySMSLifecycle.module.css';
import { toast } from 'react-toastify';

interface Event {
    name: string;
    attachedScheduler: number | ''; // Allow empty string for "Select Scheduler"
    messageHeader: string;
    activated: boolean;
}

type Placeholder = {
    [key: string]: string;
};

interface IScheduler {
    tempateid: number;
    templateName: string;
    placeholders: Placeholder[];
    smscontent: string;
    createdby: number; // Assuming these are present from your interface
    createdon: string; // Assuming these are present from your interface
}

const DefaultEvents: Event[] = [
    { name: "registration", attachedScheduler: 1, messageHeader: "Registration", activated: true },
    { name: "billing-receipt", attachedScheduler: 1, messageHeader: "Billing Receipt", activated: true },
    { name: "appointment-confirmation", attachedScheduler: 1, messageHeader: "Appointment Confirmation", activated: true },
    { name: "appointment-reminder", attachedScheduler: 2, messageHeader: "Appointment Reminder", activated: true },
    { name: "result-ready", attachedScheduler: 2, messageHeader: "Result Ready", activated: true },
    { name: "birthday", attachedScheduler: 2, messageHeader: "Happy Birthday", activated: true }, // Corrected typo
    { name: "New HealhPractioner Registration", attachedScheduler: 2, messageHeader: "New Health Practitioner Registration", activated: true }, // Corrected typo
    { name: "New Outsourcing Organization", attachedScheduler: 2, messageHeader: "New Outsourcing Organization", activated: true },
    { name: "Practioner Commission Alert", attachedScheduler: 2, messageHeader: "Practitioner Commission Alert", activated: true }, // Corrected spelling
];

export default function LaboratorySMSLifecycle() {
    const [events, setEvents] = useState<Event[]>(DefaultEvents);
    const [schedulers, setSchedulers] = useState<IScheduler[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await customFetch(`sms/sms-templates/all`);
            // Assuming customFetch throws on network error or returns a specific error structure
            if (response && response.templates && Array.isArray(response.templates)) {
                setSchedulers(response.templates);
            } else {
                console.error("Invalid response format for templates:", response);
                setSchedulers([]);
                setError("Failed to load scheduler templates due to invalid format.");
            }
        } catch (err) {
            console.error("Error fetching templates:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching templates.");
            setSchedulers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const onChangeMessageHeader = useCallback((event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setEvents(prevEvents =>
            prevEvents.map((e, i) =>
                i === index ? { ...e, messageHeader: event.target.value } : e
            )
        );
    }, []);

    const onChangeAttachedScheduler = useCallback((e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const value = e.target.value === "" ? "" : Number(e.target.value);
        setEvents(prevEvents =>
            prevEvents.map((ev, i) =>
                i === index ? { ...ev, attachedScheduler: value } : ev
            )
        );
    }, []);
    
    const onToggleActivated = useCallback((index: number) => {
        setEvents(prevEvents =>
            prevEvents.map((e, i) =>
                i === index ? { ...e, activated: !e.activated } : e
            )
        );
    }, []);



    const saveEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (events.length === 0) {
                setError('No events to save. Please configure at least one event.');
                return;
            }

            const hasEmptyHeader = events.some(event => !event.messageHeader.trim());

            if (hasEmptyHeader) {
                setError('Please fill in all message headers before saving.');
                return;
            }

            const parsedEvents = events.map(event => ({
                name: event.name,
                attachedscheduler: event.attachedScheduler,
                messageHeader: event.messageHeader.trim()
            }));

            const response = await customPost('sms/events','POST', { events: parsedEvents });
            
            if (response.success) {
                toast.success('Events saved successfully!');
            } else {
                setError('Failed to save events');
            }
        } catch (err) {
            console.error('Error saving events:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while saving events');
        } finally {
            setIsLoading(false);
        }
    }, [events]);

    const eventIcons: { [key: string]: React.ReactNode } = {
        registration: <RiUserHeartLine size={20} />,
        "billing-receipt": <RiMoneyDollarCircleLine size={20} />,
        "appointment-confirmation": <RiCalendarEventLine size={20} />,
        "appointment-reminder": <RiCalendarEventLine size={20} />,
        "result-ready": <RiFileList3Line size={20} />,
        birthday: <RiUserHeartLine size={20} />, // Consider a Gift icon or Cake icon
        "New HealhPractioner Registration": <RiUserHeartLine size={20} />,
        "New Outsourcing Organization": <RiUserHeartLine size={20} />,
        "Practioner Commission Alert": <RiAlertLine size={20} />,
    };

    const getEventDisplayName = (name: string) => {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <div className={styles.headerRow}>
                    <RiSettings3Line size={28} className={styles.headingIcon} />
                    <h2 className={styles.heading}>Laboratory SMS Lifecycle Events</h2>
                </div>

                {isLoading && (
                    <div className={styles.loadingState}>
                        <RiLoader4Line size={32} className={`remixicon-spin ${styles.spinnerIcon}`} />
                        <p>Loading Scheduler Templates...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className={styles.errorState}>
                        <RiErrorWarningLine size={32} className={styles.errorIcon} />
                        <p>Error: {error}</p>
                        <button onClick={fetchTemplates} className={styles.retryButton}>Try Again</button>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.iconCol}></th>
                                    <th className={styles.nameCol}>Event Name</th>
                                    <th className={styles.headerCol}>Message Header</th>
                                    <th className={styles.schedulerCol}>Attached SMS Template</th>
                                    <th className={styles.smsCol}>SMS Content Preview</th>
                                    <th className={styles.actionCol}>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event, index) => {
                                    const selectedScheduler = schedulers.find(s => s.tempateid === event.attachedScheduler);
                                    return (
                                        <tr key={event.name} className={styles.tableRow}>
                                            <td className={`${styles.tableCell} ${styles.iconCell}`}>
                                                <span className={styles.eventIconWrapper} title={getEventDisplayName(event.name)}>
                                                    {eventIcons[event.name] || <RiAlertLine size={20} color="#757575" />}
                                                </span>
                                            </td>
                                            <td className={`${styles.tableCell} ${styles.nameCell}`}>
                                                {getEventDisplayName(event.name)}
                                            </td>
                                            <td className={styles.tableCell}>
                                                <input
                                                    type="text"
                                                    className={styles.inputField}
                                                    onChange={(ev) => onChangeMessageHeader(ev, index)}
                                                    value={event.messageHeader}
                                                    placeholder="Enter message header"
                                                />
                                            </td>
                                            <td className={styles.tableCell}>
                                                <select
                                                    className={styles.selectField}
                                                    value={event.attachedScheduler}
                                                    onChange={(e) => onChangeAttachedScheduler(e, index)}
                                                >
                                                    <option value="">Select Template</option>
                                                    {schedulers.map((scheduler) => (
                                                        <option key={scheduler.tempateid} value={scheduler.tempateid}>
                                                            {scheduler.templateName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={`${styles.tableCell} ${styles.smsCell}`}>
                                                {selectedScheduler ? (
                                                    <div className={styles.smsContentPreview} title={selectedScheduler.smscontent}>
                                                        {selectedScheduler.smscontent}
                                                    </div>
                                                ) : (
                                                    <span className={styles.noContent}>No template selected</span>
                                                )}
                                            </td>
                                            <td className={`${styles.tableCell} ${styles.actionCell}`}>
                                                <label className={styles.switch}>
                                                    <input
                                                        type="checkbox"
                                                        checked={event.activated}
                                                        onChange={() => onToggleActivated(index)}
                                                    />
                                                    <span className={`${styles.slider} ${styles.round}`}></span>
                                                </label>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                         {events.length === 0 && <p className={styles.noEventsMessage}>No lifecycle events configured.</p>}
                    </div>
                )}
                 {/* Add a save button if changes need to be persisted */}
                 {!isLoading && !error && (
                    <div className={styles.actionBar}>
                        <button 
                            className={styles.saveButton}
                            onClick={saveEvents}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}