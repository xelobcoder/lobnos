"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Spinner, Alert, Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { currencyFormatter, customFetch, customPost } from '../../../../components/Auth/customFetch';
import styles from './SessionTable.module.css';
import { RiAddBoxFill } from '@remixicon/react';
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
	started_by_username: string;
	received_by_username: string;
	validated_by_username: string;
	validatedby: string,
	handingoveramount: number;
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

	const columns = useMemo(() => [
		{
			Header: 'ID',
			accessor: (row: SessionData, index: number) => index + 1,
			id: 'id',
		},
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
			Header: 'Started By',
			accessor: 'started_by_username',
		},
		{
			Header: 'Till For',
			accessor: 'received_by_username',
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
			Cell: ({ value }: { value: string }) => value || '-',
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
				!row.original.sessionendedon && (
					<Button
						variant="outline-danger"
						size="sm"
						onClick={() => handleEndSessionClick(row.original.sessionid)}
						disabled={isLoading}
						title="End Session"
					>
						End Session
					</Button>
				)
			),
			id: 'actions',
		},
	], [isLoading]);


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
			/>
		</div>
	);
}