"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Table, Pagination, Spinner, Alert, Container, Row, Col, Badge, Button, Form, Modal } from 'react-bootstrap';
import { currencyFormatter, customFetch, customPost } from '../../../../components/Auth/customFetch';
import styles from './SessionTable.module.css';
import { RiAddBoxFill } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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
  validated_by_username:string;
  validatedby:string,
  handingoveramount:number;
  branchname: string;
}

interface SessionsApiResponse {
  data: SessionData[];
  total: number;
  page: number;
  totalPages: number;
  message?: string;
}

interface Employee {
  employeeid: number;
  username: string;
}

const ITEMS_PER_PAGE = 10;

export default function SessionsTable() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
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

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await customFetch('logins');
      if (response && response.status === 'success' && response.result) {
        setEmployeesList(response.result.map((emp: any) => ({
          employeeid: emp.employeeid,
          username: emp.username
        })));
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions(currentPage, ITEMS_PER_PAGE);
    fetchEmployees();
  }, [currentPage, fetchSessions, fetchEmployees]);

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

  const handleEndSessionClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setShowEndModal(true);
  };

  const handleEndSessionConfirm = async (handoverAmount: number, validatedBy: number) => {
    setIsLoading(true);
    try {
      const response = await customPost(`billing/sales/session/${selectedSessionId}/end`, "POST", {
        handover_amount: handoverAmount,
        validated_by: validatedBy
      });

      if (response && response.status === 'success') {
        setShowEndModal(false);
        fetchSessions(currentPage, ITEMS_PER_PAGE);
      } else {
        throw new Error(response?.message || 'Failed to end session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to end session.');
    } finally {
      setIsLoading(false);
    }
  };

  const EndSessionModal = ({ show, onHide, sessionId, onConfirm, isLoading, employeesList }: {
    show: boolean;
    onHide: () => void;
    sessionId: number;
    onConfirm: (handoverAmount: number, validatedBy: number) => void;
    isLoading: boolean;
    employeesList: Employee[];
  }) => {
    const [handoverAmount, setHandoverAmount] = useState('');
    const [validatedBy, setValidatedBy] = useState('');
    const [salesSummary, setSalesSummary] = useState({
      totalSales: 0,
      totalTransactions: 0
    });

    useEffect(() => {
      if (show && sessionId) {
        const fetchSalesSummary = async () => {
          try {
            const response = await customFetch(`billing/sales/session/${sessionId}/summary`);
            if (response && response.data) {
              setSalesSummary(response.data);
            }
          } catch (err) {
            console.error('Failed to fetch sales summary:', err);
          }
        };
        fetchSalesSummary();
      }
    }, [show, sessionId]);

    const handleSubmit = async () => {
      try {
        const amount = parseFloat(handoverAmount);
        const validator = parseInt(validatedBy, 10);
        if (!isNaN(amount) && !isNaN(validator)) {
          onConfirm(amount, validator);
        }

        const responseEndSession = await customPost(`billing/sales/session/endsession`, 'PUT',
          { handingoveramount: amount, validatedby: validator, sessionId })

        if (responseEndSession && responseEndSession.status) {
          toast.success("session Ended Successfully")
        } else {
          toast.error('Ending Session Failed')
        }
      } catch (err) {
        toast.error('Something wrong occured');
      }
    };

    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>End Session #{sessionId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="mb-3">Sales Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Total Sales:</span>
              <strong>{formatCurrency(salesSummary.totalSales.toString())}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Total Transactions:</span>
              <strong>{salesSummary.totalTransactions}</strong>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Handover Amount</Form.Label>
            <Form.Control
              type="number"
              value={handoverAmount}
              onChange={(e) => setHandoverAmount(e.target.value)}
              placeholder="Enter actual amount"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Validated By</Form.Label>
            <Form.Select
              value={validatedBy}
              onChange={(e) => setValidatedBy(e.target.value)}
              required
            >
              <option value="">Select Employee</option>
              {employeesList.map((emp) => (
                <option key={emp.employeeid} value={emp.employeeid}>
                  {emp.username}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !handoverAmount || !validatedBy}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              'Confirm & End Session'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
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
    <div>
      <Row>
        <div className='d-flex justify-content-end'>
          <button onClick={() => { router.push(`/billing/billing-sessions/create-new-sales-session`) }} className='btn btn-primary btn-sm'>
            <RiAddBoxFill />
            Create Sales Session
          </button>
        </div>
        <Col>
          <div className={styles.tableContainer}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className={styles.tableTitle}>Billing Sessions</h2>
              {isLoading && <Spinner animation="border" size="sm" variant="primary" />}
            </div>

            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
                <Alert.Heading as="h5" style={{ fontSize: '1rem' }}>Error</Alert.Heading>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{error}</p>
                <Button onClick={() => fetchSessions(1, ITEMS_PER_PAGE)} variant="outline-danger" size="sm">
                  Try Again
                </Button>
              </Alert>
            )}

            <Table responsive hover className="align-middle">
              <thead className={styles.tableHeader}>
                <tr>
                  <th className="fw-bold text-nowrap">ID</th>
                  <th className="fw-bold text-nowrap">Branch</th>
                  <th className="fw-bold text-nowrap">Session Date</th>
                  <th className="fw-bold text-nowrap">Started By</th>
                  <th className="fw-bold text-nowrap">Till For</th>
                  <th className={`fw-bold text-nowrap`}>Opening Amt.</th>
                  <th className="fw-bold text-nowrap">Ended On</th>
                  <th className="fw-bold text-nowrap">Validated By</th> 
                  <th className="fw-bold text-nowrap">Handover Amt.</th> 
                  <th className="fw-bold text-nowrap">Status</th>
                  <th className="fw-bold text-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <tr key={session.sessionid}>
                      <td style={{ fontSize: '0.8em' }}>{index + 1}</td>
                      <td style={{ fontSize: '0.8em' }}>{session.branchname}</td>
                      <td style={{ fontSize: '0.8em' }}>{formatDate(session.sessiondate)}</td>
                      <td style={{ fontSize: '0.8em' }}>{session.started_by_username}</td>
                      <td style={{ fontSize: '0.8em' }}>{session.received_by_username}</td>
                      <td className={` border ${session.sessionendedon ? 'bg-success' : 'bg-danger'} text-white`} style={{ fontSize: '0.8em' }}>{currencyFormatter.format(parseFloat(session.openingamount) || 0)}</td>
                      <td style={{ fontSize: '0.8em' }}>{session.sessionendedon ? formatDate(session.sessionendedon) : <span >-</span>}</td>
                      <td style={{ fontSize: '0.8em' }}>{session. validated_by_username|| '-'}</td> {/* Added this cell */}
                      <td style={{ fontSize: '0.8em' }}>{session.handingoveramount ? currencyFormatter.format(session.handingoveramount) : '-'}</td> {/* Added this cell */}
                      <td style={{ fontSize: '0.8em' }}>
                        {session.sessionendedon ? (
                          <Badge pill className={styles.statusBadgeEnded}>Ended</Badge>
                        ) : (
                          <Badge pill className={styles.statusBadgeActive}>Active</Badge>
                        )}
                      </td>
                      <td className={`text-muted ${styles.tableCellActions} text-center`} style={{ fontSize: '0.8em' }}>
                        {!session.sessionendedon && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEndSessionClick(session.sessionid)}
                            disabled={isLoading}
                            title="End Session"
                          >
                            End Session
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-muted text-center py-4" style={{ fontSize: '0.8em' }} colSpan={9}>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                    const showPage = Math.abs(pageNumber - currentPage) < 2 ||
                      pageNumber === 1 || pageNumber === totalPages ||
                      (currentPage <= 3 && pageNumber <= 4) ||
                      (currentPage >= totalPages - 2 && pageNumber >= totalPages - 3);

                    if ((pageNumber === 2 && currentPage > 3 && totalPages > 5) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2 && totalPages > 5)) {
                      if ((pageNumber === 2 && currentPage > 4) || (pageNumber === totalPages - 1 && currentPage < totalPages - 3))
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
      <EndSessionModal
        show={showEndModal}
        onHide={() => setShowEndModal(false)}
        sessionId={selectedSessionId || 0}
        onConfirm={handleEndSessionConfirm}
        isLoading={isLoading}
        employeesList={employeesList}
      />
    </div>
  );
}