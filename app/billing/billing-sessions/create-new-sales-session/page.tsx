"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { Button, Form, InputGroup, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import styles from './BillingSessions.module.css'; // Ensure this path is correct
import { customFetch, customPost } from '../../../../components/Auth/customFetch'; // Ensure this path is correct

// Interfaces (ensure these match your actual data structures)
interface SalesSession {
    sessionid: number;
    sessiondate: Date;
    session_started_by: number; // Logged-in user who starts the session
    sessionendedon: Date | null;
    openingamount: number;
    amountreceivedby: number; // Employee for whom the till is opened
    branchid: number; // Branch for the session
}

interface Employee {
    employeeid: number;
    username: string;
    branch: number; // Assuming this is the branchid the employee belongs to
    // Add other relevant fields like firstname, lastname if you want to display full name
}

interface Branch {
    branchid: number;
    name: string;
    // Add other fields if needed
}

// Type for customFetch response (adjust if your customFetch returns differently)
interface FetchResponse<T> {
    status: string;
    result: T[];
    message?: string; // Optional error message
}


export default function BillingSessions() {
    const { user } = useApplication();
    const loggedInUserEmployeeId = user?.employeeid; // ID of the user operating the system

    const [openingAmount, setOpeningAmount] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>(''); // Store branchid as string from select
    const [selectedEmployee, setSelectedEmployee] = useState<string>(''); // Store employeeid as string

    const [branchesList, setBranchesList] = useState<Branch[]>([]);
    const [employeesList, setEmployeesList] = useState<Employee[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // For initial data load
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const LoadInitData = async () => {
        setIsLoadingData(true);
        setError('');
        try {
            const [branchesResponse, employeesResponse]: [FetchResponse<Branch>, FetchResponse<Employee>] = await Promise.all([
                customFetch('branches'), // Endpoint to get all branches
                customFetch('logins')    // Endpoint to get all employees
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
            console.error("Failed to load initial data:", err);
            setError(err.message || 'An error occurred while loading data.');
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        LoadInitData();
    }, []);

    // Filter employees based on selected branch
    const filteredEmployees = useMemo(() => {
        if (!selectedBranch) return [];
        return employeesList.filter(emp => emp.branch === parseInt(selectedBranch, 10));
    }, [selectedBranch, employeesList]);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBranch(e.target.value);
        setSelectedEmployee(''); // Reset employee selection when branch changes
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
                sessiondate: new Date().toISOString(), // Send as ISO string
            };

            console.log("Submitting payload:", payload);
            const response: { status: boolean } = await customPost(
                'billing/sales/session/create','POST', payload
            );
            
            if (response && response.status === true) { 
                setSuccessMessage(`Sales session activated for ${employeesList.find(e=>e.employeeid === parseInt(selectedEmployee))?.username || 'employee'} with opening amount: ${amount.toFixed(2)}`);
                setOpeningAmount('');
                setSelectedBranch('');
                setSelectedEmployee('');
            } else {
                throw new Error('Failed to create session.');
            }          

        } catch (err: any) {
            console.error("Session activation failed:", err);
            setError(err.message || 'An unexpected error occurred during session activation.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading data...</span>
                </Spinner>
                <p>Loading initial data...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8} lg={7} xl={6}> {/* Adjusted column size for more fields */}
                    <div className={styles.googleFormContainer}>
                        <h2 className={styles.formTitle}>Activate New Billing Session</h2>

                        {error && (
                            <Alert
                                variant="danger"
                                onClose={() => setError('')}
                                dismissible
                                className="mb-3 small" // Using small for potentially longer error messages
                            >
                                {error}
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert
                                variant="success"
                                onClose={() => setSuccessMessage('')}
                                dismissible
                                className="mb-3 small"
                            >
                                {successMessage}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="branchSelect" className="mb-3">
                                <Form.Label>Branch</Form.Label>
                                <Form.Select
                                    aria-label="Select Branch"
                                    value={selectedBranch}
                                    onChange={handleBranchChange}
                                    className={styles.googleFormControl}
                                    disabled={isLoading || branchesList.length === 0}
                                    required
                                >
                                    <option value="">Select a Branch</option>
                                    {branchesList.map((branch) => (
                                        <option key={branch.branchid} value={branch.branchid}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {branchesList.length === 0 && !isLoadingData && <Form.Text className="text-danger">No branches available.</Form.Text>}
                            </Form.Group>

                            <Form.Group controlId="employeeSelect" className="mb-3">
                                <Form.Label>Employee for Session</Form.Label>
                                <Form.Select
                                    aria-label="Select Employee"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    className={styles.googleFormControl}
                                    disabled={isLoading || !selectedBranch || filteredEmployees.length === 0}
                                    required
                                >
                                    <option value="">Select an Employee</option>
                                    {filteredEmployees.map((employee) => (
                                        <option key={employee.employeeid} value={employee.employeeid}>
                                            {employee.username} {/* Or use a full name if available */}
                                        </option>
                                    ))}
                                </Form.Select>
                                {selectedBranch && filteredEmployees.length === 0 && !isLoadingData && <Form.Text className="text-danger">No employees found for this branch.</Form.Text>}
                            </Form.Group>

                            <Form.Group controlId="openingAmountInput" className="mb-3">
                                <Form.Label>Opening Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter opening amount"
                                    value={openingAmount}
                                    onChange={(e) => setOpeningAmount(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    required
                                    disabled={isLoading}
                                    aria-label="Opening Amount"
                                    className={styles.googleFormControl}
                                />
                                <Form.Text className={styles.formHelperText}>
                                    Enter the initial cash amount for this sales session.
                                </Form.Text>
                            </Form.Group>

                            <Button
                                type="submit"
                                disabled={isLoading || !loggedInUserEmployeeId || !selectedBranch || !selectedEmployee || !openingAmount.trim()}
                                className={`${styles.googleButtonPrimary} w-100 mt-2`}
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