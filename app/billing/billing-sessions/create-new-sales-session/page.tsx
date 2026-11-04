"use client";

import React, { useEffect, useState, useMemo } from 'react';
import ttable from '../../../../styles/SmsTemplateList.module.css'
const createDefaultSessionRow = (now: string) => ({
    branch: '',
    employee: '',
    dateTime: now,
    openingAmount: '',
});
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { Button, Form, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import styles from './BillingSessions.module.css';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useRouter } from 'next/navigation';
import { RiArrowLeftLine } from '@remixicon/react';

interface SalesSession {
    sessionid: number;
    sessiondate: Date;
    session_started_by: number;
    sessionendedon: Date | null;
    openingamount: number;
    amountreceivedby: number;
    branchid: number;
}

interface Employee {
    employeeid: number;
    username: string;
    branch: number;
}

interface Branch {
    branchid: number;
    name: string;
}

interface SalesSessionConfig {
    id?: number;
    branchid: number;
    allow_multiple_sessions: boolean;
    session_count?: number;
    start_time?: string;
    end_time?: string;
    time_ranges?: TimeRange[];
    created_at?: string;
    updated_at?: string;
}

interface TimeRange {
    start: string;
    end: string;
}

interface FetchResponse<T> {
    status: string;
    statusCode: number;
    result: T[];
    message?: string;
}

export default function BillingSessions() {
    const [sessionMode, setSessionMode] = useState<'today' | 'ahead' | 'month' | 'timeRanges'>('today');
    const { user } = useApplication();
    const loggedInUserEmployeeId = user?.employeeid;

    const [openingAmount, setOpeningAmount] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [sessionStartDateTime, setSessionStartDateTime] = useState<string>(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

    const [numSessions, setNumSessions] = useState(1);
    const [numSessionsInput, setNumSessionsInput] = useState('1');
    const [sessionRows, setSessionRows] = useState([
        createDefaultSessionRow(
            (() => {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                return now.toISOString().slice(0, 16);
            })()
        )
    ]);

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateTime = maxDate.toISOString().slice(0, 16);

    const [branchesList, setBranchesList] = useState<Branch[]>([]);
    const [employeesList, setEmployeesList] = useState<Employee[]>([]);
    const [sessionConfig, setSessionConfig] = useState<SalesSessionConfig | null>(null);

    // State for time range based sessions
    const [timeRangeSessions, setTimeRangeSessions] = useState<Array<{
        timeRange: TimeRange;
        employee: string;
        openingAmount: string;
    }>>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const LoadInitData = async () => {
        setIsLoadingData(true);
        setError('');
        try {
            const [branchesResponse, employeesResponse]: [FetchResponse<Branch>, FetchResponse<Employee>] = await Promise.all([
                customFetch('branches'),
                customFetch('logins')
            ]);

            if (branchesResponse && branchesResponse.result && Array.isArray(branchesResponse.result)) {
                setBranchesList(branchesResponse.result);
            } else {
                setError(branchesResponse?.message || 'Failed to load branches.');
            }

            if (employeesResponse && employeesResponse.result && Array.isArray(employeesResponse.result)) {
                setEmployeesList(employeesResponse.result);
            } else {
                setError(prev => `${prev} ${employeesResponse?.message || 'Failed to load employees.'}`.trim());
            }

            // Load session configuration for the user's branch
            if (user?.branchid) {
                await loadSessionConfig(user.branchid);
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred while loading data.');
        } finally {
            setIsLoadingData(false);
        }
    };

    const loadSessionConfig = async (branchId: number) => {
        try {
            const response = await customFetch(`billing/sales/session/config?branchid=${branchId}`);

            if (response?.config !== undefined) {
                setSessionConfig(response.config);

                // Initialize time range sessions if multiple sessions are allowed and time ranges exist
                if (response.config.allow_multiple_sessions && response.config.time_ranges && response.config.time_ranges.length > 0) {
                    const initialTimeRangeSessions = response.config.time_ranges.map((timeRange: {id: number; start_time: string; end_time: string; name?: string}) => ({
                        timeRange,
                        employee: '',
                        openingAmount: ''
                    }));
                    setTimeRangeSessions(initialTimeRangeSessions);
                } else {
                    setTimeRangeSessions([]);
                }
            } else {
                // Set default config if none exists
                setSessionConfig({
                    branchid: branchId,
                    allow_multiple_sessions: false,
                    time_ranges: []
                });
                setTimeRangeSessions([]);
            }
        } catch (err: any) {
            console.error('Failed to load session configuration:', err);
            // Set default config on error
            setSessionConfig({
                branchid: branchId,
                allow_multiple_sessions: false,
                time_ranges: []
            });
            setTimeRangeSessions([]);
        }
    };

    useEffect(() => {
        LoadInitData();
    }, []);

    useEffect(() => {
        if (sessionConfig) {
            if (sessionConfig.allow_multiple_sessions && sessionConfig.time_ranges && sessionConfig.time_ranges.length > 0) {
                if (sessionMode !== 'timeRanges') {
                    setSessionMode('timeRanges');
                }
            } else {
                if (sessionMode === 'timeRanges') {
                    setSessionMode('today');
                }
            }
        }
    }, [sessionConfig]);

    const filteredEmployees = useMemo(() => {
        if (!selectedBranch) return [];
        return employeesList.filter(emp => emp.branch === parseInt(selectedBranch, 10));
    }, [selectedBranch, employeesList]);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>, idx?: number) => {
        const newBranchId = parseInt(e.target.value, 10);

        if (sessionMode === 'ahead' && typeof idx === 'number') {
            const updated = [...sessionRows];
            updated[idx].branch = e.target.value;
            updated[idx].employee = '';
            setSessionRows(updated);
        } else {
            setSelectedBranch(e.target.value);
            setSelectedEmployee('');
            // Reset time range sessions when branch changes
            setTimeRangeSessions([]);
        }

        // Reload session config when branch changes
        if (newBranchId) {
            loadSessionConfig(newBranchId);
        }
    };

    const handleSessionRowChange = (idx: number, field: keyof (typeof sessionRows)[number], value: string) => {
        const updated = [...sessionRows];
        updated[idx][field] = value;
        setSessionRows(updated);
    };

    const handleTimeRangeSessionChange = (idx: number, field: 'employee' | 'openingAmount', value: string) => {
        const updated = [...timeRangeSessions];
        updated[idx][field] = value;
        setTimeRangeSessions(updated);
    };

    const handleNumSessionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNumSessionsInput(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
            setNumSessions(parsed);
            setSessionRows(prev => {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                const defaultRow = createDefaultSessionRow(now.toISOString().slice(0, 16));
                if (parsed > prev.length) {
                    return [...prev, ...Array(parsed - prev.length).fill(null).map(() => ({ ...defaultRow }))];
                } else {
                    return prev.slice(0, parsed);
                }
            });
        }
    };

    const handleNumSessionsBlur = () => {
        let val = parseInt(numSessionsInput, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 10) val = 10;
        setNumSessionsInput(val.toString());
        setNumSessions(val);
        setSessionRows(prev => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            const defaultRow = createDefaultSessionRow(now.toISOString().slice(0, 16));
            if (val > prev.length) {
                return [...prev, ...Array(val - prev.length).fill(null).map(() => ({ ...defaultRow }))];
            } else {
                return prev.slice(0, val);
            }
        });
    };

    const handleSaveSessionRow = async (idx: number) => {
        setError('');
        setSuccessMessage('');
        const row = sessionRows[idx];
        if (!loggedInUserEmployeeId) {
            setError("Logged-in user information not available. Cannot activate session.");
            return;
        }
        if (!row.branch) {
            setError(`Please select a branch for session #${idx + 1}.`);
            return;
        }
        if (!row.employee) {
            setError(`Please select an employee for session #${idx + 1}.`);
            return;
        }
        const amount = parseFloat(row.openingAmount.trim());
        if (isNaN(amount) || amount < 0) {
            setError(`Please enter a valid opening amount for session #${idx + 1}.`);
            return;
        }
        if (!row.dateTime) {
            setError(`Please select a date/time for session #${idx + 1}.`);
            return;
        }

        if (sessionConfig) {
            // Check time range validation if configured
            if (sessionConfig.time_ranges && sessionConfig.time_ranges.length > 0) {
                const sessionTime = new Date(row.dateTime);
                const sessionHour = sessionTime.getHours();
                const sessionMinute = sessionTime.getMinutes();
                const sessionTimeString = `${sessionHour.toString().padStart(2, '0')}:${sessionMinute.toString().padStart(2, '0')}`;

                const isWithinRange = sessionConfig.time_ranges.some(range => {
                    return sessionTimeString >= range.start && sessionTimeString <= range.end;
                });

                if (!isWithinRange) {
                    const allowedRanges = sessionConfig.time_ranges.map(range => `${range.start} - ${range.end}`).join(', ');
                    setError(`Session time ${sessionTimeString} for session #${idx + 1} is not within allowed ranges: ${allowedRanges}`);
                    return;
                }
            }
        }

        setIsLoading(true);
        try {
            const payload = {
                sessiondate: new Date(row.dateTime).toISOString(),
                branchid: parseInt(row.branch, 10),
                session_started_by: loggedInUserEmployeeId,
                openingamount: parseFloat(row.openingAmount),
                amountreceivedby: parseInt(row.employee, 10),
                validatedby: 0,
                handingoveramount: parseFloat(row.openingAmount),
            };
            const response = await customPost('billing/sales/session/create', 'POST', payload);
            if (response && response.status === true) {
                setSuccessMessage(`Sales session #${idx + 1} activated for ${employeesList.find(e => e.employeeid === parseInt(row.employee))?.username || 'employee'} with opening amount: ${parseFloat(row.openingAmount).toFixed(2)}`);
                // Remove the row from sessionRows
                setSessionRows(prev => prev.filter((_, i) => i !== idx));
                // Adjust numSessions and numSessionsInput
                setNumSessions(prev => Math.max(1, prev - 1));
                setNumSessionsInput(prev => {
                    const n = parseInt(prev, 10);
                    if (isNaN(n) || n <= 1) return '1';
                    return (n - 1).toString();
                });
            } else {
                throw new Error(response.error || response.message || 'Failed to create session.');
            }
        } catch (err: any) {
            setError(err.message || `An unexpected error occurred during session #${idx + 1} activation.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        let amount: number = 0;

        // Validate against session configuration
        if (sessionConfig) {
            // Check if multiple sessions are allowed (only for ahead mode)
            if (sessionMode === 'ahead' && !sessionConfig.allow_multiple_sessions && numSessions > 1) {
                setError("Multiple sessions are not allowed for this branch. Please create sessions one at a time.");
                return;
            }

            // For timeRanges mode, validate that configuration allows multiple sessions
            if (sessionMode === 'timeRanges' && !sessionConfig.allow_multiple_sessions) {
                setError("Multiple sessions are not allowed for this branch.");
                return;
            }

            // Check time range validation if configured (only for single sessions)
            if (sessionMode !== 'timeRanges' && sessionConfig.time_ranges && sessionConfig.time_ranges.length > 0) {
                const sessionTime = new Date(sessionStartDateTime);
                const sessionHour = sessionTime.getHours();
                const sessionMinute = sessionTime.getMinutes();
                const sessionTimeString = `${sessionHour.toString().padStart(2, '0')}:${sessionMinute.toString().padStart(2, '0')}`;

                const isWithinRange = sessionConfig.time_ranges.some(range => {
                    return sessionTimeString >= range.start && sessionTimeString <= range.end;
                });

                if (!isWithinRange) {
                    const allowedRanges = sessionConfig.time_ranges.map(range => `${range.start} - ${range.end}`).join(', ');
                    setError(`Session time ${sessionTimeString} is not within allowed ranges: ${allowedRanges}`);
                    return;
                }
            }
        }

        if (!loggedInUserEmployeeId) {
            setError("Logged-in user information not available. Cannot activate session.");
            return;
        }
        if (!selectedBranch) {
            setError("Please select a branch.");
            return;
        }

        if (sessionMode !== 'timeRanges') {
            if (!selectedEmployee) {
                setError("Please select an employee for the session.");
                return;
            }
            amount = parseFloat(openingAmount.trim());
            if (isNaN(amount) || amount < 0) {
                setError("Please enter a valid opening amount (0.0 or greater).");
                return;
            }
        }

        setIsLoading(true);
        try {
            if (sessionMode === 'month') {
                const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

                let successCount = 0;
                let errorMessages: string[] = [];

                for (let day = 1; day <= daysInMonth; day++) {
                    const sessionDate = new Date(selectedYear, selectedMonth, day, 9, 0, 0);
                    const payload = {
                        sessiondate: sessionDate.toISOString(),
                        branchid: parseInt(selectedBranch, 10),
                        session_started_by: loggedInUserEmployeeId,
                        openingamount: amount,
                        amountreceivedby: parseInt(selectedEmployee, 10),
                        validatedby: 0,
                        handingoveramount: amount,
                    };

                    try {
                        const response: { status: boolean; message?: string, error?: string } = await customPost(
                            'billing/sales/session/create', 'POST', payload
                        );

                        if (response && response.status === true) {
                            successCount++;
                        } else {
                            errorMessages.push(`Day ${day}: ${response.error || response.message || 'Failed to create session'}`);
                        }
                    } catch (err: any) {
                        errorMessages.push(`Day ${day}: ${err.message || 'An unexpected error occurred'}`);
                    }
                }

                if (successCount > 0) {
                    setSuccessMessage(`Successfully created ${successCount} sales sessions for ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}`);
                    if (errorMessages.length > 0) {
                        setError(`Some sessions failed to create:\n${errorMessages.join('\n')}`);
                    }
                    setOpeningAmount('');
                    setSelectedBranch('');
                    setSelectedEmployee('');
                    setSessionMode('today');
                } else {
                    setError(`Failed to create any sessions. Errors:\n${errorMessages.join('\n')}`);
                }
            } else if (sessionMode === 'timeRanges') {
                // Validate all time range sessions
                const invalidSessions = timeRangeSessions.filter(session =>
                    !session.employee || !session.openingAmount.trim() || parseFloat(session.openingAmount.trim()) < 0 || isNaN(parseFloat(session.openingAmount.trim()))
                );

                if (invalidSessions.length > 0) {
                    setError("Please fill in all required fields for all time range sessions (employee and valid opening amount).");
                    return;
                }

                let successCount = 0;
                let errorMessages: string[] = [];

                for (let i = 0; i < timeRangeSessions.length; i++) {
                    const session = timeRangeSessions[i];
                    const timeRange = session.timeRange;

                    // Create session date using selected date with the time range start time
                    const selectedDate = new Date(sessionStartDateTime);
                    const [hours, minutes] = timeRange.start.split(':').map(Number);
                    const sessionDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hours, minutes, 0);

                    const payload = {
                        sessiondate: sessionDate.toISOString(),
                        branchid: parseInt(selectedBranch, 10),
                        session_started_by: loggedInUserEmployeeId,
                        openingamount: parseFloat(session.openingAmount),
                        amountreceivedby: parseInt(session.employee, 10),
                        validatedby: 0,
                        handingoveramount: parseFloat(session.openingAmount),
                    };

                    try {
                        const response: { status: boolean; message?: string, error?: string } = await customPost(
                            'billing/sales/session/create', 'POST', payload
                        );

                        if (response && response.status === true) {
                            successCount++;
                        } else {
                            errorMessages.push(`Time range ${timeRange.start}-${timeRange.end}: ${response.error || response.message || 'Failed to create session'}`);
                        }
                    } catch (err: any) {
                        errorMessages.push(`Time range ${timeRange.start}-${timeRange.end}: ${err.message || 'An unexpected error occurred'}`);
                    }
                }

                if (successCount > 0) {
                    setSuccessMessage(`Successfully created ${successCount} time range sales sessions. ${errorMessages.length > 0 ? `Errors: ${errorMessages.length}` : ''}`);
                    setSelectedBranch('');
                    setSessionMode('today');
                    setTimeRangeSessions([]);
                } else {
                    setError(`Failed to create any sessions. Errors:\n${errorMessages.join('\n')}`);
                }
            } else {
                let sessionDateToUse = sessionStartDateTime;
                if (sessionMode === 'today') {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    sessionDateToUse = now.toISOString().slice(0, 16);
                }
                const payload = {
                    sessiondate: new Date(sessionDateToUse).toISOString(),
                    branchid: parseInt(selectedBranch, 10),
                    session_started_by: loggedInUserEmployeeId,
                    openingamount: amount,
                    amountreceivedby: parseInt(selectedEmployee, 10),
                    validatedby: 0,
                    handingoveramount: amount,
                };

                const response: { status: boolean; message?: string, error?: string } = await customPost(
                    'billing/sales/session/create', 'POST', payload
                );

                if (response && response.status === true) {
                    setSuccessMessage(`Sales session activated for ${employeesList.find(e => e.employeeid === parseInt(selectedEmployee))?.username || 'employee'} with opening amount: ${amount.toFixed(2)}`);
                    setOpeningAmount('');
                    setSelectedBranch('');
                    setSelectedEmployee('');
                    setSessionMode('today');
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    setSessionStartDateTime(now.toISOString().slice(0, 16));
                } else {
                    throw new Error(response.error || response.message || 'Failed to create session.');
                }
            }

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during session activation.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading data...</span>
                    </Spinner>
                    <p className="mt-2 text-muted">Loading initial data...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className={styles.pageBackground}>
            <Row className="pt-3 pb-2 mb-3 border-bottom align-items-center sticky-top bg-light">
                <Col xs="auto">
                    <Button variant="link" onClick={() => router.back()} className="p-0 me-2">
                        <RiArrowLeftLine size={24} />
                    </Button>
                </Col>
                <Col>
                    <h4 className={styles.pageHeaderTitle}>Activate New Billing Session</h4>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col className='bg-white p-4 rounded mx-3 ' xs={12} md={8} lg={11}>
                    <div>
                        {error && (
                            <Alert
                                variant="danger"
                                onClose={() => setError('')}
                                dismissible
                                className="mb-3 small"
                            >
                                {error}
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert
                                variant="success"
                                className="mb-3 small"
                            >
                                {successMessage}
                                <div className="mt-2">
                                    <Button variant="outline-success" size="sm" onClick={() => router.push('/billing/billing-sessions/sales-session')}>
                                        View Sessions List
                                    </Button>
                                </div>
                            </Alert>
                        )}

                        {/* Session Configuration Display */}
                        {sessionConfig && (
                            <div className="border rounded p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                                <h6 className="mb-2 fw-semibold">Session Configuration</h6>
                                <Row>
                                    <Col md={6}>
                                        <small className="text-muted">Multiple Sessions Allowed:</small>
                                        <div className="fw-semibold">
                                            {sessionConfig.allow_multiple_sessions ? 'Yes' : 'No'}
                                        </div>
                                    </Col>
                                    {sessionConfig.time_ranges && sessionConfig.time_ranges.length > 0 && (
                                        <Col md={6}>
                                            <small className="text-muted">Configured Time Ranges:</small>
                                            <div>
                                                {sessionConfig.time_ranges.map((range, index) => (
                                                    <div key={index} className="fw-semibold">
                                                        {range.start} - {range.end}
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </div>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="sessionMode" className="mb-3">
                                <Form.Label className={styles.formLabel}>Session Timing</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        label="Create for today"
                                        type="radio"
                                        id="session-today"
                                        name="sessionMode"
                                        value="today"
                                        checked={sessionMode === 'today'}
                                        onChange={() => setSessionMode('today')}
                                        disabled={isLoading || isLoadingData || (sessionConfig?.allow_multiple_sessions && sessionConfig?.time_ranges && sessionConfig.time_ranges.length > 0)}
                                    />
                                    {sessionConfig?.allow_multiple_sessions && sessionConfig?.time_ranges && sessionConfig.time_ranges.length > 0 && (
                                        <Form.Check
                                            inline
                                            label="Create sessions for configured time ranges"
                                            type="radio"
                                            id="session-timeRanges"
                                            name="sessionMode"
                                            value="timeRanges"
                                            checked={sessionMode === 'timeRanges'}
                                            onChange={() => setSessionMode('timeRanges')}
                                            disabled={isLoading || isLoadingData}
                                        />
                                    )}
                                    <Form.Check
                                        inline
                                        label="Schedule ahead (max 1 week)"
                                        type="radio"
                                        id="session-ahead"
                                        name="sessionMode"
                                        value="ahead"
                                        checked={sessionMode === 'ahead'}
                                        onChange={() => setSessionMode('ahead')}
                                        disabled={isLoading || isLoadingData || (sessionConfig?.allow_multiple_sessions && sessionConfig?.time_ranges && sessionConfig.time_ranges.length > 0)}
                                    />
                                    <Form.Check
                                        inline
                                        label="Create for entire month"
                                        type="radio"
                                        id="session-month"
                                        name="sessionMode"
                                        value="month"
                                        checked={sessionMode === 'month'}
                                        onChange={() => setSessionMode('month')}
                                        disabled={isLoading || isLoadingData || (sessionConfig?.allow_multiple_sessions && sessionConfig?.time_ranges && sessionConfig.time_ranges.length > 0)}
                                    />
                                </div>
                                <hr style={{ margin: '1rem 0', borderTop: '2px solid #bbb' }} />
                            </Form.Group>
                            {sessionMode === 'month' && (
                                <Form.Group controlId="monthYearSelect" className="mb-3">
                                    <Form.Label className={styles.formLabel}>Select Month & Year</Form.Label>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                                className={styles.googleFormControl}
                                                disabled={isLoading || isLoadingData}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i} value={i}>
                                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                                className={styles.googleFormControl}
                                                disabled={isLoading || isLoadingData}
                                            >
                                                {Array.from({ length: 5 }, (_, i) => {
                                                    const year = new Date().getFullYear() - 2 + i;
                                                    return (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    );
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Form.Text className={styles.formHelperText}>
                                        Choose the month and year for which you want to create daily sales sessions.
                                    </Form.Text>
                                </Form.Group>
                            )}
                            {sessionMode === 'month' && (
                                <Alert variant="info" className="mb-3">
                                    <strong>Monthly Session Creation:</strong> This will create sales sessions for every day of {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    with the same opening amount and employee. Sessions will be scheduled at 9:00 AM each day.
                                </Alert>
                            )}
                            {sessionMode === 'timeRanges' && (
                                <Alert variant="info" className="mb-3">
                                    <strong>Time Range Sessions:</strong> This will create one sales session for each configured time range ({sessionConfig?.time_ranges?.length || 0} sessions total).
                                    Each session will start at the specified time range for today.
                                </Alert>
                            )}
                            {sessionMode === 'ahead' && (
                                <Form.Group controlId="numSessions" className="mb-3">
                                    <Form.Label className={styles.formLabel}>How many sessions?</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={numSessionsInput}
                                        onChange={handleNumSessionsChange}
                                        onBlur={handleNumSessionsBlur}
                                        disabled={isLoading || isLoadingData}
                                        className={styles.googleFormControl}
                                    />
                                    <Form.Text className={styles.formHelperText}>
                                        Enter a number (1-10). Each session can have its own details.
                                    </Form.Text>
                                </Form.Group>
                            )}

                            {sessionMode === 'ahead' ? (
                                <table className={ttable.table}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Branch</th>
                                            <th>Employee</th>
                                            <th>Session Start Date & Time</th>
                                            <th>Opening Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessionRows.map((row, idx) => {
                                            const filteredEmployeesRow = employeesList.filter(emp => emp.branch === parseInt(row.branch, 10));
                                            return (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>
                                                        <Form.Select
                                                            aria-label="Select Branch"
                                                            value={row.branch}
                                                            onChange={e => handleBranchChange(e, idx)}
                                                            className={styles.googleFormControl}
                                                            disabled={isLoading || isLoadingData || branchesList.length === 0}
                                                            required
                                                        >
                                                            <option value="">Select a Branch</option>
                                                            {branchesList.map((branch) => (
                                                                <option key={branch.branchid} value={branch.branchid}>
                                                                    {branch.name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        {branchesList.length === 0 && !isLoadingData && <Form.Text className="text-danger small mt-1">No branches available.</Form.Text>}
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            aria-label="Select Employee"
                                                            value={row.employee}
                                                            onChange={e => handleSessionRowChange(idx, 'employee', e.target.value)}
                                                            className={styles.googleFormControl}
                                                            disabled={isLoading || isLoadingData || !row.branch || filteredEmployeesRow.length === 0}
                                                            required
                                                        >
                                                            <option value="">Select an Employee</option>
                                                            {filteredEmployeesRow.map((employee) => (
                                                                <option key={employee.employeeid} value={employee.employeeid}>
                                                                    {employee.username}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        {row.branch && filteredEmployeesRow.length === 0 && !isLoadingData && <Form.Text className="text-danger small mt-1">No employees found for this branch.</Form.Text>}
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="datetime-local"
                                                            value={row.dateTime}
                                                            onChange={e => handleSessionRowChange(idx, 'dateTime', e.target.value)}
                                                            required
                                                            disabled={isLoading || isLoadingData}
                                                            min={minDateTime}
                                                            max={maxDateTime}
                                                            className={styles.googleFormControl}
                                                        />
                                                        <Form.Text className={styles.formHelperText}>
                                                            {'Pick a date/time up to 1 week from now.'}
                                                        </Form.Text>
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Enter opening amount"
                                                            value={row.openingAmount}
                                                            onChange={e => handleSessionRowChange(idx, 'openingAmount', e.target.value)}
                                                            min="0.00"
                                                            step="0.01"
                                                            required
                                                            disabled={isLoading || isLoadingData}
                                                            aria-label="Opening Amount"
                                                            className={styles.googleFormControl}
                                                        />
                                                        <Form.Text className={styles.formHelperText}>
                                                            Enter the initial cash amount for this sales session.
                                                        </Form.Text>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            disabled={isLoading || isLoadingData}
                                                            onClick={() => handleSaveSessionRow(idx)}
                                                        >
                                                            Save
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : sessionMode === 'timeRanges' ? (
                                <>
                                    <Form.Group controlId="branchSelectTimeRanges" className="mb-3">
                                        <Form.Label className={styles.formLabel}>Branch</Form.Label>
                                        <Form.Select
                                            aria-label="Select Branch"
                                            value={selectedBranch}
                                            onChange={handleBranchChange}
                                            className={styles.googleFormControl}
                                            disabled={isLoading || isLoadingData || branchesList.length === 0}
                                            required
                                        >
                                            <option value="">Select a Branch</option>
                                            {branchesList.map((branch) => (
                                                <option key={branch.branchid} value={branch.branchid}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {branchesList.length === 0 && !isLoadingData && <Form.Text className="text-danger small mt-1">No branches available.</Form.Text>}
                                    </Form.Group>
                                    <Form.Group controlId="timeRangesStartDate" className="mb-3">
                                        <Form.Label className={styles.formLabel}>Session Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={sessionStartDateTime.split('T')[0]}
                                            onChange={e => {
                                                const currentTime = sessionStartDateTime.split('T')[1] || '09:00';
                                                setSessionStartDateTime(`${e.target.value}T${currentTime}`);
                                            }}
                                            required
                                            disabled={isLoading || isLoadingData}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={styles.googleFormControl}
                                        />
                                        <Form.Text className={styles.formHelperText}>
                                            Choose the date when these time range sessions should start.
                                        </Form.Text>
                                    </Form.Group>
                                    <table className={ttable.table}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Time Range</th>
                                                <th>Employee</th>
                                                <th>Opening Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timeRangeSessions.map((session, idx) => {
                                                const filteredEmployeesRow = employeesList.filter(emp => emp.branch === parseInt(selectedBranch, 10));
                                                return (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>
                                                            <div className="fw-semibold">
                                                                {session.timeRange.start} - {session.timeRange.end}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Form.Select
                                                                aria-label="Select Employee"
                                                                value={session.employee}
                                                                onChange={e => handleTimeRangeSessionChange(idx, 'employee', e.target.value)}
                                                                className={styles.googleFormControl}
                                                                disabled={isLoading || isLoadingData || !selectedBranch || filteredEmployeesRow.length === 0}
                                                                required
                                                            >
                                                                <option value="">Select an Employee</option>
                                                                {filteredEmployeesRow.map((employee) => (
                                                                    <option key={employee.employeeid} value={employee.employeeid}>
                                                                        {employee.username}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                            {selectedBranch && filteredEmployeesRow.length === 0 && !isLoadingData && <Form.Text className="text-danger small mt-1">No employees found for this branch.</Form.Text>}
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                placeholder="0.00"
                                                                value={session.openingAmount}
                                                                onChange={e => handleTimeRangeSessionChange(idx, 'openingAmount', e.target.value)}
                                                                min="0.00"
                                                                step="0.01"
                                                                required
                                                                disabled={isLoading || isLoadingData}
                                                                aria-label="Opening Amount"
                                                                className={styles.googleFormControl}
                                                            />
                                                            <Form.Text className={styles.formHelperText}>
                                                                Enter the initial cash amount for this sales session.
                                                            </Form.Text>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <>
                                    <Form.Group controlId="branchSelect" className="mb-3">
                                        <Form.Label className={styles.formLabel}>Branch</Form.Label>
                                        <Form.Select
                                            aria-label="Select Branch"
                                            value={selectedBranch}
                                            onChange={handleBranchChange}
                                            className={styles.googleFormControl}
                                            disabled={isLoading || isLoadingData || branchesList.length === 0}
                                            required
                                        >
                                            <option value="">Select a Branch</option>
                                            {branchesList.map((branch) => (
                                                <option key={branch.branchid} value={branch.branchid}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {branchesList.length === 0 && !isLoadingData && <Form.Text className="text-danger small mt-1">No branches available.</Form.Text>}
                                    </Form.Group>
                                    <Form.Group controlId="employeeSelect" className="mb-3">
                                        <Form.Label className={styles.formLabel}>Employee for Session</Form.Label>
                                        <Form.Select
                                            aria-label="Select Employee"
                                            value={selectedEmployee}
                                            onChange={(e) => setSelectedEmployee(e.target.value)}
                                            className={styles.googleFormControl}
                                            disabled={isLoading || isLoadingData || !selectedBranch || filteredEmployees.length === 0}
                                            required
                                        >
                                            <option value="">Select an Employee</option>
                                            {filteredEmployees.map((employee) => (
                                                <option key={employee.employeeid} value={employee.employeeid}>
                                                    {employee.username}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {selectedBranch && filteredEmployees.length === 0 && !isLoadingData && <Form.Text className="text-danger small mt-1">No employees found for this branch.</Form.Text>}
                                    </Form.Group>
                                    {(sessionMode === 'today' || sessionMode === 'ahead' as any) && (
                                        <Form.Group controlId="sessionStartDateTime" className="mb-3">
                                            <Form.Label className={styles.formLabel}>Session Start Date & Time</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={sessionStartDateTime}
                                                onChange={e => setSessionStartDateTime(e.target.value)}
                                                required
                                                disabled={isLoading || isLoadingData}
                                                min={minDateTime}
                                                max={maxDateTime}
                                                className={styles.googleFormControl}
                                            />
                                            <Form.Text className={styles.formHelperText}>
                                                {'Pick a date/time up to 1 week from now.'}
                                            </Form.Text>
                                        </Form.Group>
                                    )}
                                    <Form.Group controlId="openingAmountInput" className="mb-3">
                                        <Form.Label className={styles.formLabel}>Opening Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter opening amount"
                                            value={openingAmount}
                                            onChange={(e) => setOpeningAmount(e.target.value)}
                                            min="0.00"
                                            step="0.01"
                                            required
                                            disabled={isLoading || isLoadingData}
                                            aria-label="Opening Amount"
                                            className={styles.googleFormControl}
                                        />
                                        <Form.Text className={styles.formHelperText}>
                                            Enter the initial cash amount for this sales session.
                                        </Form.Text>
                                    </Form.Group>
                                </>
                            )}

                            <Button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    isLoadingData ||
                                    !loggedInUserEmployeeId ||
                                    !selectedBranch ||
                                    (sessionMode === 'timeRanges'
                                        ? timeRangeSessions.some(session => !session.employee || !session.openingAmount.trim())
                                        : !selectedEmployee || !openingAmount.trim()
                                    )
                                }
                                className={`${styles.googleButtonPrimary} w-100 mt-3`}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Activating...
                                    </>
                                ) : sessionMode === 'timeRanges' ? (
                                    `Create ${timeRangeSessions.length} Time Range Sessions`
                                ) : sessionMode === 'month' ? (
                                    `Create ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })} Sessions`
                                ) : (
                                    'Activate Sales Session'
                                )}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}