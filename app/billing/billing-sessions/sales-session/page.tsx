"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Spinner, Alert, Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { customFetch } from '../../../../components/Auth/customFetch';
import styles from './SessionTable.module.css'; 
import { RiAddBoxFill } from '@remixicon/react';
import { useRouter } from 'next/navigation';

interface SessionData {
    sessionid: number;
    sessiondate: string;
    session_started_by: number;
    sessionendedon: string | null;
    openingamount: string;
    amountreceivedby: number;
    branchid: number;
    started_by_username: string;
    received_by_username: string;
    branchname: string;
}

interface SessionsApiResponse {
    data: SessionData[];
    total: number;
    page: number;
    totalPages: number;
    message?: string;
}

const ITEMS_PER_PAGE = 10;

export default function SessionsTable() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchSessions = useCallback(async (page: number, limit: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response: SessionsApiResponse = await customFetch(
                `billing/sales/session/list?page=${page}&limit=${limit}`
            );

            if (response && response.data) {
                setSessions(response.data);
                setCurrentPage(response.page);
                setTotalPages(response.totalPages);
            } else {
                throw new Error(response.message || 'Failed to fetch sessions data.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions(currentPage, ITEMS_PER_PAGE);
    }, [currentPage, fetchSessions]);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return <span className="text-muted">N/A</span>;
        try {
            return new Date(dateString).toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return <span className="text-danger">Invalid Date</span>;
        }
    };

    const formatCurrency = (amountString: string) => {
        const amount = parseFloat(amountString);
        if (isNaN(amount)) return <span className="text-muted">N/A</span>;
        return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleEndSession = async (sessionId: number) => {
        if (!confirm(`Are you sure you want to end session ${sessionId}?`)) return;
        setIsLoading(true);
        try {
            // Replace with actual API call
            // await customFetch(`billing/sales/session/${sessionId}/end`, { method: 'PUT' }); // Or POST
            console.log(`Simulating end session for ID: ${sessionId}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            alert(`Session ${sessionId} would be ended. (This is a simulation)`);
            fetchSessions(currentPage, ITEMS_PER_PAGE);
        } catch (err: any) {
            setError(err.message || 'Failed to end session.');
        } finally {
            // setIsLoading(false); // fetchSessions will set this
        }
    };

    if (isLoading && sessions.length === 0 && !error) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-2 text-muted">Loading sessions...</p>
            </Container>
        );
    }

    return (
        <div >
            <Row >
            <div className='d-flex justify-content-end'>
                            <button onClick={(ev) =>  {router.push(`/billing/billing-sessions/create-new-sales-session`)}} className='btn btn  btn-primary btn-sm'>
                            <RiAddBoxFill/>
                              Create Sales Session
                              </button>
                       </div>
                <Col >
                    <div className={styles.tableContainer}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className={styles.tableTitle}>Billing Sessions</h2>
                            {isLoading && <Spinner animation="border" size="sm" variant="primary" />}
                        </div>

                        {error && (
                            <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
                                <Alert.Heading as="h5" style={{fontSize: '1rem'}}>Error</Alert.Heading>
                                <p style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>{error}</p>
                                <Button onClick={() => fetchSessions(1, ITEMS_PER_PAGE)} variant="outline-danger" size="sm">
                                    Try Again
                                </Button>
                            </Alert>
                        )}
                    

                        <Table responsive hover className="align-middle">
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th className="fw-bold text-nowrap ">ID</th>
                                    <th className="fw-bold text-nowrap ">Branch</th>
                                    <th className="fw-bold text-nowrap ">Session Date</th>
                                    <th className="fw-bold text-nowrap ">Started By</th>
                                    <th className="fw-bold text-nowrap ">Till For</th>
                                    <th className={`fw-bold text-nowrap  ${styles.tableCellCurrency}`}>Opening Amt.</th>
                                    <th className="fw-bold text-nowrap ">Ended On</th>
                                    <th className="fw-bold text-nowrap ">Status</th>
                                    <th className="fw-bold text-nowrap  text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.length > 0 ? (
                                    sessions.map((session,index) => (
                                        <tr key={session.sessionid}>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>{index+1}</td>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>{session.branchname}</td>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>{formatDate(session.sessiondate)}</td>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>{session.started_by_username}</td>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>{session.received_by_username} </td>
                                            <td className={`text-muted ${styles.tableCellCurrency}`} style={{fontSize: '0.8em'}}>{formatCurrency(session.openingamount)}</td>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>{session.sessionendedon ? formatDate(session.sessionendedon) : <span className="text-muted">-</span>}</td>
                                            <td className="text-muted" style={{fontSize: '0.8em'}}>
                                                {session.sessionendedon ? (
                                                    <Badge pill className={styles.statusBadgeEnded}>Ended</Badge>
                                                ) : (
                                                    <Badge pill className={styles.statusBadgeActive}>Active</Badge>
                                                )}
                                            </td>
                                            <td className={`text-muted ${styles.tableCellActions} text-center`} style={{fontSize: '0.8em'}}>
                                                {!session.sessionendedon && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleEndSession(session.sessionid)}
                                                        disabled={isLoading}
                                                        title="End Session"
                                                    >
                                                        End
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="text-muted text-center py-4" style={{fontSize: '0.8em'}} colSpan={9}>
                                            No sessions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {totalPages > 1 && (
                            <div className={`${styles.paginationContainer} d-flex justify-content-end mt-3`}>
                                <Pagination size="sm" className="gap-1">
                                    <Pagination.First
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1 || isLoading}
                                        className="rounded-1"
                                    />
                                    <Pagination.Prev
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || isLoading}
                                        className="rounded-1"
                                    />
                                    {Array.from({length: totalPages}, (_, i) => i + 1).map((pageNumber) => {
                                        const showPage = Math.abs(pageNumber - currentPage) < 2 ||
                                                         pageNumber === 1 || pageNumber === totalPages ||
                                                         (currentPage <= 3 && pageNumber <= 4) ||
                                                         (currentPage >= totalPages - 2 && pageNumber >= totalPages - 3);

                                        if ((pageNumber === 2 && currentPage > 3 && totalPages > 5) ||
                                            (pageNumber === totalPages - 1 && currentPage < totalPages - 2 && totalPages > 5)) {
                                            if ( (pageNumber === 2 && currentPage > 4) || (pageNumber === totalPages -1 && currentPage < totalPages -3) )
                                            return <Pagination.Ellipsis key={`ellipsis-${pageNumber}`} disabled />;
                                        }

                                        if (showPage || totalPages <= 5) {
                                          return (
                                              <Pagination.Item
                                                  key={pageNumber}
                                                  active={pageNumber === currentPage}
                                                  onClick={() => handlePageChange(pageNumber)}
                                                  disabled={isLoading}
                                                  className="rounded-1"
                                              >
                                                  {pageNumber}
                                              </Pagination.Item>
                                          );
                                        }
                                        return null;
                                    })}
                                    <Pagination.Next
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || isLoading}
                                        className="rounded-1"
                                    />
                                    <Pagination.Last
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages || isLoading}
                                        className="rounded-1"
                                    />
                                </Pagination>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}