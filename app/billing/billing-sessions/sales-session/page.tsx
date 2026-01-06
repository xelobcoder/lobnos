"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Spinner, Alert, Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { currencyFormatter, customFetch, customPost } from '../../../../components/Auth/customFetch';
import styles from './SessionTable.module.css';
import { RiAddBoxFill, RiDeleteBinLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import EndSessionModal from './EndSessionModal';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { handleSessionGatheringServer } from '../../../../components/serverActions/ActionFiltering';

interface SessionData {
	sessionid: number;
	sessiondate: string;
	session_started_by: number;
	sessionendedon: string | null;
	openingamount: string;
	amountreceivedby: number;
	branchid: number;
	started_by_username: string | null;
	received_by_username: string | null;
	validated_by_username: string | null;
	validatedby: string | null;
	handingoveramount: number | null;
	branchname: string;
	start_time: string | null;
	end_time: string | null;
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
	const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
	const [showBulkDelete, setShowBulkDelete] = useState(false);
	const router = useRouter();

	const fetchSessions = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response: SessionsApiResponse = await customFetch(
				`billing/sales/session/list?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
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
		fetchSessions();
		fetchEmployees();
	}, [fetchSessions, fetchEmployees]);

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

	const handleDeleteSession = async (sessionId: number) => {
		if (!confirm('Are you sure you want to delete this sales session? This action cannot be undone.')) {
			return;
		}

		try {
			setIsLoading(true);
			const result = await customPost(`billing/sales/session/${sessionId}`, 'DELETE', {});

			if (result.status === true || result.statusCode === 200) {
				alert('Sales session deleted successfully!');
				fetchSessions();
			} else {
				throw new Error(result.message || 'Failed to delete session');
			}
		} catch (err: any) {
			setError(err.message || 'Failed to delete sales session');
		} finally {
			setIsLoading(false);
		}
	};

	const handleBulkDeleteSessions = async () => {
		if (selectedSessions.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedSessions.length} sales session(s)? This action cannot be undone.`)) {
			return;
		}

		try {
			setIsLoading(true);
			let successCount = 0;
			let errorCount = 0;

			for (const sessionId of selectedSessions) {
				try {
					const result = await customPost(`billing/sales/session/${sessionId}`, 'DELETE', {});
					if (result.status === true || result.statusCode === 200) {
						successCount++;
					} else {
						errorCount++;
					}
				} catch (err) {
					errorCount++;
				}
			}

			if (successCount > 0) {
				alert(`${successCount} session(s) deleted successfully!${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
				setSelectedSessions([]); // Clear selection
				setShowBulkDelete(false); // Exit bulk delete mode
				fetchSessions(); // Refresh the sessions list
			} else {
				throw new Error('Failed to delete any sessions');
			}
		} catch (err: any) {
			setError(err.message || 'Failed to delete sales sessions');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelBulkDelete = () => {
		setSelectedSessions([]);
		setShowBulkDelete(false);
	};

	const handleSelectSession = (sessionId: number, checked: boolean) => {
		if (checked) {
			setSelectedSessions(prev => [...prev, sessionId]);
		} else {
			setSelectedSessions(prev => prev.filter(id => id !== sessionId));
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			// Only select active sessions (not ended)
			const activeSessionIds = sessions
				.filter(session => !session.sessionendedon)
				.map(session => session.sessionid);
			setSelectedSessions(activeSessionIds);
		} else {
			setSelectedSessions([]);
		}
	};

	const isAllSelected = sessions.filter(session => !session.sessionendedon).length > 0 &&
		selectedSessions.length === sessions.filter(session => !session.sessionendedon).length;

	const columns = useMemo(() => {
		const cols: any[] = [];

		// Add checkbox column only when bulk delete is active
		if (showBulkDelete) {
			cols.push({
				Header: ({ getToggleAllRowsSelectedProps }: any) => (
					<input
						type="checkbox"
						checked={isAllSelected}
						onChange={(e) => handleSelectAll(e.target.checked)}
						disabled={isLoading || sessions.filter(session => !session.sessionendedon).length === 0}
					/>
				),
				accessor: 'select',
				Cell: ({ row }: { row: { original: SessionData } }) => (
					<input
						type="checkbox"
						checked={selectedSessions.includes(row.original.sessionid)}
						onChange={(e) => handleSelectSession(row.original.sessionid, e.target.checked)}
						disabled={isLoading || !!row.original.sessionendedon} // Disable for ended sessions
					/>
				),
				id: 'select',
				width: 50,
			});
		}

		// Add the rest of the columns
		cols.push(
			{
				Header: 'Branch',
				accessor: 'branchname',
			},
			{
				Header: 'Session Date',
				accessor: 'sessiondate',
				Cell: ({ value }: { value: string }) => formatDate(value),
			},
			{
				Header: 'Time Range',
				accessor: (row: SessionData) => `${row.start_time || 'N/A'} - ${row.end_time || 'N/A'}`,
				Cell: ({ row }: { row: { original: SessionData } }) => {
					const startTime = row.original.start_time;
					const endTime = row.original.end_time;
					if (startTime && endTime) {
						return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
					}
					return <span className="text-muted">N/A</span>;
				},
			},
			{
				Header: 'Started By',
				accessor: 'started_by_username',
				Cell: ({ value }: { value: string | null }) => value || <span className="text-muted">-</span>,
			},
			{
				Header: 'Cashier',
				accessor: 'received_by_username',
				Cell: ({ value }: { value: string | null }) => value || <span className="text-muted">-</span>,
			},
			{
				Header: 'Opening Amt.',
				accessor: 'openingamount',
				Cell: ({ row, value }: { row: { original: SessionData }, value: string }) => (
					<span className={`border ${row.original.sessionendedon ? 'bg-success' : 'bg-danger'} text-white px-2 py-1 rounded`}>
						{currencyFormatter.format(parseFloat(value) || 0)}
					</span>
				),
			},
			{
				Header: 'Ended On',
				accessor: 'sessionendedon',
				Cell: ({ value }: { value: string | null }) =>
					value ? formatDate(value) : <span>-</span>,
			},
			{
				Header: 'Validated By',
				accessor: 'validated_by_username',
				Cell: ({ value }: { value: string | null }) => value || <span className="text-muted">-</span>,
			},
			{
				Header: 'Handover Amt.',
				accessor: 'handingoveramount',
				Cell: ({ value }: { value: number }) =>
					value ? currencyFormatter.format(value) : '-',
			},
			{
				Header: 'Status',
				accessor: 'sessionendedon',
				Cell: ({ value }: { value: string | null }) =>
					value ? (
						<Badge pill className={styles.statusBadgeEnded}>Ended</Badge>
					) : (
						<Badge pill className={styles.statusBadgeActive}>Active</Badge>
					),
				id: 'status',
			},
			{
				Header: 'Actions',
				accessor: 'sessionid',
				Cell: ({ row }: { row: { original: SessionData } }) => (
					<div className="d-flex gap-2">
						<Button
							variant={row.original.sessionendedon ? "outline-primary" : "outline-danger"}
							size="sm"
							onClick={() => handleEndSessionClick(row.original.sessionid)}
							disabled={isLoading}
							title={row.original.sessionendedon ? "View Details" : "End Session"}
						>
							{row.original.sessionendedon ? ' Details' : 'End Session'}
						</Button>
						{!row.original.sessionendedon && (
							<Button
								variant="outline-danger"
								size="sm"
								onClick={() => handleDeleteSession(row.original.sessionid)}
								disabled={isLoading}
								title="Delete Session"
							>
								<RiDeleteBinLine size={16} className="me-1" />
								Delete
							</Button>
						)}
					</div>
				),
				id: 'actions',
			}
		);

		return cols;
	}, [isLoading, selectedSessions, sessions, isAllSelected, showBulkDelete]);


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
				<Col>
					<div className={styles.tableContainer}>
						<div className="d-flex justify-content-between align-items-center mb-3">
							<div>
								<h2 className={styles.tableTitle}>Billing Sessions</h2>
								{showBulkDelete && selectedSessions.length > 0 && (
									<small className="text-muted">
										{selectedSessions.length} session(s) selected
									</small>
								)}
								{showBulkDelete && (
									<div className="mt-2">
										<small className="text-info">
											Select sessions to delete. Only active sessions can be selected.
										</small>
									</div>
								)}
							</div>
							<div className="d-flex align-items-center gap-3">
								{isLoading && <Spinner animation="border" size="sm" variant="primary" />}
								{showBulkDelete ? (
									<>
										<Button
											variant="outline-danger"
											size="sm"
											onClick={handleBulkDeleteSessions}
											disabled={isLoading || selectedSessions.length === 0}
										>
											<RiDeleteBinLine size={16} className="me-1" />
											Delete Selected ({selectedSessions.length})
										</Button>
										<Button
											variant="outline-secondary"
											size="sm"
											onClick={handleCancelBulkDelete}
											disabled={isLoading}
										>
											Cancel
										</Button>
									</>
								) : (
									<>
										<Button
											variant="outline-danger"
											size="sm"
											onClick={() => setShowBulkDelete(true)}
											disabled={isLoading}
										>
											<RiDeleteBinLine size={16} className="me-1" />
											Delete Multiple
										</Button>
										<button onClick={() => { router.push(`/billing/billing-sessions/create-new-sales-session`) }} className='btn btn-primary btn-sm'>
											<RiAddBoxFill />
											Create Sales Session
										</button>
									</>
								)}
							</div>
						</div>

						{error && (
							<Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-3">
								<Alert.Heading as="h5" style={{ fontSize: '1rem' }}>Error</Alert.Heading>
								<p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{error}</p>
								<Button onClick={() => fetchSessions()} variant="outline-danger" size="sm">
									Try Again
								</Button>
							</Alert>
						)}

						<PrimeTable
							column={columns}
							data={sessions}
							isExpoerted={false}
							filtering={true}
							serverSideFiltering={true}
							handleSeverSideProcessing={handleSessionGatheringServer}
						/>
					</div>
				</Col>
			</Row>
			<EndSessionModal
				show={showEndModal}
				onHide={() => {
					setShowEndModal(false);
					fetchSessions();
				}}
				sessionId={selectedSessionId || 0}
				openingAmount={sessions.find(s => s.sessionid === selectedSessionId)?.openingamount || ''}
				isLoading={isLoading}
				onConfirm={fetchSessions}
				employeesList={employeesList}
				isSessionEnded={!!sessions.find(s => s.sessionid === selectedSessionId)?.sessionendedon}
			/>
		</div>
	);
}