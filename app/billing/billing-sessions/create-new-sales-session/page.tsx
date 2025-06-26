"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
    const { user } = useApplication();
    const loggedInUserEmployeeId = user?.employeeid;

    const [openingAmount, setOpeningAmount] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');

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

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBranch(e.target.value);
        setSelectedEmployee('');
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
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid positive opening amount.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                branchid: parseInt(selectedBranch, 10),
                session_started_by: loggedInUserEmployeeId,
                amountreceivedby: parseInt(selectedEmployee, 10),
                openingamount: amount,
                sessiondate: new Date().toISOString(),
            };

            const response: { status: boolean; message?: string,error?:string } = await customPost(
                'billing/sales/session/create', 'POST', payload
            );

            if (response && response.status === true) {
                setSuccessMessage(`Sales session activated for ${employeesList.find(e => e.employeeid === parseInt(selectedEmployee))?.username || 'employee'} with opening amount: ${amount.toFixed(2)}`);
                setOpeningAmount('');
                setSelectedBranch('');
                setSelectedEmployee('');
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
                <Col xs={12} sm={10} md={8} lg={7} xl={6}>
                    <div className={styles.googleFormContainer}>
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

                            <Form.Group controlId="openingAmountInput" className="mb-3">
                                <Form.Label className={styles.formLabel}>Opening Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter opening amount"
                                    value={openingAmount}
                                    onChange={(e) => setOpeningAmount(e.target.value)}
                                    min="0.01"
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