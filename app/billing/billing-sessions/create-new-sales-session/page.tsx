"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import ttable from '../../../../styles/SmsTemplateList.module.css'
const createDefaultSessionRow = (now) => ({
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

interface FetchResponse<T> {
    status: string;
    result: T[];
    message?: string;
}

export default function BillingSessions() {
    const [sessionMode, setSessionMode] = useState<'today' | 'ahead'>('today');
    const { user } = useApplication();
    const loggedInUserEmployeeId = user?.employeeid;

    const [openingAmount, setOpeningAmount] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    // New state for session start date/time
    const [sessionStartDateTime, setSessionStartDateTime] = useState<string>(() => {
        // Default to now in local ISO format (yyyy-MM-ddTHH:mm)
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    // Batch session creation states
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

    // Calculate min/max for scheduling (today to 7 days ahead)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateTime = maxDate.toISOString().slice(0, 16);

    const [branchesList, setBranchesList] = useState<Branch[]>([]);
    const [employeesList, setEmployeesList] = useState<Employee[]>([]);

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

        } catch (err: any) {
            setError(err.message || 'An error occurred while loading data.');
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        LoadInitData();
    }, []);

    const filteredEmployees = useMemo(() => {
        if (!selectedBranch) return [];
        return employeesList.filter(emp => emp.branch === parseInt(selectedBranch, 10));
    }, [selectedBranch, employeesList]);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>, idx?: number) => {
        if (sessionMode === 'ahead' && typeof idx === 'number') {
            const updated = [...sessionRows];
            updated[idx].branch = e.target.value;
            updated[idx].employee = '';
            setSessionRows(updated);
        } else {
            setSelectedBranch(e.target.value);
            setSelectedEmployee('');
        }
    };

    const handleSessionRowChange = (idx: number, field: string, value: string) => {
        const updated = [...sessionRows];
        updated[idx][field] = value;
        setSessionRows(updated);
    };

    // Allow free typing, clamp on blur or valid entry
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

    // Save a single session row
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
        const amount = parseFloat(row.openingAmount);
        if (isNaN(amount) || amount < 0) {
            setError(`Please enter a valid opening amount for session #${idx + 1}.`);
            return;
        }
        if (!row.dateTime) {
            setError(`Please select a date/time for session #${idx + 1}.`);
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                branchid: parseInt(row.branch, 10),
                session_started_by: loggedInUserEmployeeId,
                amountreceivedby: parseInt(row.employee, 10),
                openingamount: parseFloat(row.openingAmount),
                sessiondate: new Date(row.dateTime).toISOString(),
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

        if (!loggedInUserEmployeeId) {
            setError("Logged-in user information not available. Cannot activate session.");
            return;
        }
        if (!selectedBranch) {
            setError("Please select a branch.");
            return;
        }
        if (!selectedEmployee) {
            setError("Please select an employee for the session.");
            return;
        }

        const amount = parseFloat(openingAmount);
        if (isNaN(amount) || amount < 0) {
            setError("Please enter a valid opening amount (0.0 or greater).");
            return;
        }

        setIsLoading(true);
        try {
            let sessionDateToUse = sessionStartDateTime;
            if (sessionMode === 'today') {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                sessionDateToUse = now.toISOString().slice(0, 16);
            }
            const payload = {
                branchid: parseInt(selectedBranch, 10),
                session_started_by: loggedInUserEmployeeId,
                amountreceivedby: parseInt(selectedEmployee, 10),
                openingamount: amount,
                sessiondate: new Date(sessionDateToUse).toISOString(),
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
                // Reset session start date/time to now
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                setSessionStartDateTime(now.toISOString().slice(0, 16));
            } else {
                throw new Error(response.error || response.message || 'Failed to create session.');
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
                <Col className='bg-white p-4 rounded mx-3 '  xs={12} md={8} lg={11}>
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
                                        disabled={isLoading || isLoadingData}
                                    />
                                    <Form.Check
                                        inline
                                        label="Schedule ahead (max 1 week)"
                                        type="radio"
                                        id="session-ahead"
                                        name="sessionMode"
                                        value="ahead"
                                        checked={sessionMode === 'ahead'}
                                        onChange={() => setSessionMode('ahead')}
                                        disabled={isLoading || isLoadingData}
                                    />
                                </div>
                                <hr style={{ margin: '1rem 0', borderTop: '2px solid #bbb' }} />
                            </Form.Group>
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
                                disabled={isLoading || isLoadingData || !loggedInUserEmployeeId || !selectedBranch || !selectedEmployee || !openingAmount.trim()}
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