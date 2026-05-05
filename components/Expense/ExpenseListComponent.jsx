import React, { useState } from 'react';
import { currencyFormatter, customFetch, customPost } from '../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiCheckDoubleFill, RiCloseCircleFill, RiFileList2Line, RiInboxArchiveLine, RiCalendarEventLine, RiFilter3Line, RiRefreshLine, RiSearchLine, RiAddBoxLine } from '@remixicon/react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { Offcanvas, Button, ButtonGroup, Modal } from 'react-bootstrap';

const statusMap = {
	0: { label: 'Pending', color: 'warning', icon: <RiFileList2Line className="me-1" /> },
	1: { label: 'Approved', color: 'success', icon: <RiCheckDoubleFill className="me-1" /> },
	2: { label: 'Rejected', color: 'danger', icon: <RiCloseCircleFill className="me-1" /> },
};

const ExpenseList = ({ expenses, setSelected, selected, employeeid, filter, setFilter, handleFilters, branchid, setExpenses }) => {
	const [localFilter, setLocalFilter] = useState({ ...filter });
	const [showOffcanvas, setShowOffcanvas] = useState(false);
	const [selectedExpenses, setSelectedExpenses] = useState([]);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [bulkDecisions, setBulkDecisions] = useState({});
	const [individualRejectReasons, setIndividualRejectReasons] = useState({});
	const [individualSelectedReasons, setIndividualSelectedReasons] = useState({});

	const rejectionReasons = [
		"Insufficient documentation",
		"Amount not justified",
		"Duplicate expense",
		"Policy violation",
		"Missing receipt or attachment",
		"Expense not related to business",
		"Exceeded allowable amount",
		"Expense already reimbursed",
		"Incorrect expense category",
		"Submission after deadline",
		"Lack of prior approval",
		"Personal expense submitted",
		"Unclear or incomplete description",
		"Unsupported vendor or service",
		"Expense outside policy period",
		"Other"
	];


	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLocalFilter((prev) => ({ ...prev, [name]: value }));
	};

	const handleStatusChange = (e) => {
		setLocalFilter((prev) => ({ ...prev, status: e.target.value }));
	};

	const handleSearch = () => {
		setFilter(localFilter);
		handleFilters();
		setShowOffcanvas(false);
	};

	const handleClear = () => {
		const cleared = { from: '', to: '', status: '' };
		setLocalFilter(cleared);
		setFilter(cleared);
		handleFilters();
		setShowOffcanvas(false);
	};

	const handleBulkActions = () => {
		if (selectedExpenses.length === 0) {
			alert('Please select expenses first');
			return;
		}

		const initialDecisions = {};
		const initialRejectReasons = {};
		const initialSelectedReasons = {};
		selectedExpenses.forEach(id => {
			initialDecisions[id] = 'pending';
			initialRejectReasons[id] = '';
			initialSelectedReasons[id] = '';
		});
		setBulkDecisions(initialDecisions);
		setIndividualRejectReasons(initialRejectReasons);
		setIndividualSelectedReasons(initialSelectedReasons);
		setShowBulkModal(true);
	};



	const handleSelectAllExpenses = (e) => {
		const allApprovedExpenseIds = expenses.filter(exp => exp.approved === 0).map(exp => exp.id);
		setSelectedExpenses(allApprovedExpenseIds);
	};

	const handleDecisionChange = (expenseId, status) => {
		setBulkDecisions(prev => ({
			...prev,
			[expenseId]: status
		}));
		if (status === 'rejected') {
			if (!individualSelectedReasons[expenseId]) {
				setIndividualSelectedReasons(prev => ({
					...prev,
					[expenseId]: ''
				}));
				setIndividualRejectReasons(prev => ({
					...prev,
					[expenseId]: ''
				}));
			}
		} else {
			// Clear rejection reason if not rejected
			setIndividualSelectedReasons(prev => ({
				...prev,
				[expenseId]: ''
			}));
			setIndividualRejectReasons(prev => ({
				...prev,
				[expenseId]: ''
			}));
		}
	};

	const handleApproveAll = () => {
		const newDecisions = {};
		const newRejectReasons = {};
		const newSelectedReasons = {};
		selectedExpenses.forEach(id => {
			newDecisions[id] = 'approved';
			newRejectReasons[id] = '';
			newSelectedReasons[id] = '';
		});
		setBulkDecisions(newDecisions);
		setIndividualRejectReasons(newRejectReasons);
		setIndividualSelectedReasons(newSelectedReasons);
	};

	const handleRejectAll = () => {
		const newDecisions = {};
		const newRejectReasons = {};
		const newSelectedReasons = {};
		selectedExpenses.forEach(id => {
			newDecisions[id] = 'rejected';
			newRejectReasons[id] = '';
			newSelectedReasons[id] = '';
		});
		setBulkDecisions(newDecisions);
		setIndividualRejectReasons(newRejectReasons);
		setIndividualSelectedReasons(newSelectedReasons);
	};

	const handleIndividualRejectReasonChange = (expenseId, selectedReason, additionalInfo) => {
		setIndividualSelectedReasons(prev => ({
			...prev,
			[expenseId]: selectedReason
		}));
		setIndividualRejectReasons(prev => ({
			...prev,
			[expenseId]: selectedReason === "Other" ? additionalInfo : selectedReason
		}));
	};

	const handleConfirmRejectAll = () => {
		if (!selectedReason) {
			alert('Please select a rejection reason');
			return;
		}
		if (selectedReason === "Other" && !rejectReason.trim()) {
			alert('Please provide additional information for "Other" reason');
			return;
		}
		const newDecisions = {};
		selectedExpenses.forEach(id => {
			newDecisions[id] = 'rejected';
		});
		setBulkDecisions(newDecisions);
		setBulkRejectReason(rejectReason || selectedReason);
		setShowRejectReason(false);
		setRejectReason("");
		setSelectedReason("");
	};

	const handleSubmitBulkDecisions = async () => {
		const decisionsToSubmit = Object.entries(bulkDecisions).filter(([_, status]) => status !== 'pending');

		if (decisionsToSubmit.length === 0) {
			alert('Please select at least one decision');
			return;
		}

		// Validate rejection reasons for rejected items
		const rejectedItems = decisionsToSubmit.filter(([_, status]) => status === 'rejected');
		for (const [expenseId] of rejectedItems) {
			const selectedReason = individualSelectedReasons[expenseId];
			const rejectReason = individualRejectReasons[expenseId];

			if (!selectedReason) {
				alert(`Please select a rejection reason for expense ID ${expenseId}`);
				return;
			}
			if (selectedReason === "Other" && !rejectReason.trim()) {
				alert(`Please provide additional information for expense ID ${expenseId} when selecting "Other"`);
				return;
			}
		}

		try {
			// Prepare bulk payload as array
			const bulkPayload = decisionsToSubmit.map(([expenseId, status]) => ({
				expenseid: parseInt(expenseId),
				employeeid: employeeid,
				status: status,
				branchid,
				information: status === 'approved' ? 'Approved by admin' : individualRejectReasons[expenseId]
			}));

			// Send single bulk request
			const response = await customPost("expense/pending/decision", "POST", bulkPayload);

			// Process response
			if (response && response.results && Array.isArray(response.results)) {
				const successfulResults = response.results.filter(result => result.success === true);
				const failedResults = response.results.filter(result => result.success !== true);

				let message = '';
				if (successfulResults.length > 0) {
					const totalProcessed = successfulResults.reduce((sum, result) => sum + result.count, 0);
					message += `${totalProcessed} expense(s) processed successfully`;

					// Add invoice information if available
					const invoicesCreated = successfulResults.flatMap(result => result.invoices || []);
					if (invoicesCreated.length > 0) {
						message += ` and ${invoicesCreated.length} invoice(s) created`;
					}
					message += '.';
				}

				if (failedResults.length > 0) {
					message += ` ${failedResults.length} operation(s) failed.`;
				}

				alert(message);
			} else {
				alert('Failed to process expenses');
			}

			setSelectedExpenses([]);
			setShowBulkModal(false);
			setBulkDecisions({});
			setIndividualRejectReasons({});
			setIndividualSelectedReasons({});
			handleFilters(); // Refresh the list
		} catch (error) {
			console.error('Error processing bulk decisions:', error);
			alert('Failed to process some expenses');
		}
	};



	const handleServerSideProcessingForExpenses = async (pagination) => {
		const { count, page, sortby = 'DESC', status, from, to } = pagination;
		const urlString = `expenses/records?branchid=${branchid}&&employeeid=${employeeid}&&count=${count}&&page=${page}&&from=${from}&&to=${to}&&status=${status}&&sortby=${sortby}`;
		try {
			const response = await customFetch(urlString);
			if (response && Array.isArray(response)) {
				setExpenses(response);
				return { result: response, error: false }
			} else {
				return { result: [], error: false }

			}
		} catch (error) {
			console.log("Error fetching expenses:", error);
			return { result: [], error: true }
		}
	}

	const columns = [
		{
			Header: 'Expense Name',
			accessor: 'name',
			Cell: ({ cell: { value }, row }) => {
				const isSelected = selectedExpenses.includes(row.original.id);
				return (
					<div className="d-flex align-items-center">
						<input
							type="checkbox"
							checked={isSelected}
							onChange={(e) => {
								if (e.target.checked) {
									setSelectedExpenses(prev => [...prev, row.original.id]);
								} else {
									setSelectedExpenses(prev => prev.filter(id => id !== row.original.id));
								}
							}}
							className="me-2"
						/>
						<span className="fw-bold text-capitalize">
							{value}<br />
							{row.original.groupId && <span className="text-muted" style={{ fontSize: '0.75rem' }}>({row.original.groupId})</span>}
						</span>
					</div>
				);
			}
		},
		{
			Header: 'Amount',
			accessor: 'amount',
			Cell: ({ cell: { value }, row }) => (
				<span className="d-flex align-items-center text-secondary">
					<RiMoneyDollarCircleLine className="me-1 text-success" />
					{currencyFormatter.format(value)}
				</span>
			)
		},
		{
			Header: 'Status',
			accessor: 'approved',
			Cell: ({ cell: { value }, row }) => {
				const status = statusMap[value] || { label: 'Unknown', color: 'secondary', icon: null };
				return (
					<span
						className={`fw-semibold border rounded px-2 py-1 pls-${status.color}-bg pls-${status.color}-color`}
						style={{
							fontSize: '0.75rem',
							borderColor: '#dee2e6'
						}}
					>
						{status.label}
					</span>
				);
			}
		},
		{
			Header: 'Requested By / Approved By',
			accessor: 'username',
			Cell: ({ row }) => (
				<span className="d-flex flex-column">
					<span className="d-flex align-items-center mb-1">
						<strong className="text-muted" style={{ fontSize: '0.85rem' }}>Requested:</strong>
						<span className="ms-2">{row.original.username}</span>
					</span>
					<span className="d-flex align-items-center">
						<strong className="text-muted" style={{ fontSize: '0.85rem' }}>Approved:</strong>
						<span className="ms-2">{row.original.approvedby || 'N/A'}</span>
					</span>
				</span>
			)
		},
		{
			Header: 'Date',
			accessor: 'date',
			Cell: ({ cell: { value }, row }) => (
				<div>
					<div className="fw-medium">{new Date(value).toLocaleDateString()}</div>
					<small className="text-muted">{new Date(value).toLocaleTimeString()}</small>
				</div>
			)
		},
		{
			Header: 'Description',
			accessor: 'description',
		
			Cell: ({ cell: { value }, row }) => (
				<span className="text-secondary">
					{value}
				</span>
			)
		},
		{
			Header: 'Merchant',
			accessor: 'merchant_name',
			Cell: ({ cell: { value }, row }) => (
				<span className="text-capitalize">
					{value}
				</span>
			)
		},
		{
			Header: 'Actions',
			accessor: 'actions',
			Cell: ({ row }) => (

				<div className='d-flex justify-content-between'>
					<Button
						variant="outline-primary"
						size="sm"
						onClick={() => setSelected(row.original)}
						className="d-flex align-items-center mx-2"
					>
						<RiFileList2Line className="me-1" size={14} />
						View
					</Button>
					{
						row.original.approved === 0 && (
							<Button
								variant="outline-warning"
								size="sm"
								disabled={row.original.approved === 1}
								onClick={() => window.open(`/billing/expenses/edit-expense?id=${row.original.id}`, '_blank')}
								className="d-flex align-items-center"
							>
								{<RiInboxArchiveLine className="me-1" size={14} />}
								Edit
							</Button>
						)
					}
				</div>
			)
		},

	];

	return (
		<div>
			{/* Header with Expense Creation Buttons */}
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h5 className="mb-0 fw-semibold text-body">Expense Management</h5>
				<ButtonGroup>
					<Button variant="outline-primary"
						onClick={(ev) => { handleSelectAllExpenses(ev) }}
						size="sm" className="d-flex align-items-center">
						Select All Expenses
					</Button>

					<Button variant="outline-primary" size="sm" className="d-flex align-items-center"
						onClick={() => window.location.href = '/billing/expenses/create-new-expense'}>
						<RiAddBoxLine className="me-1" size={16} />
						Add Expense
					</Button>
					<Button onClick={() => window.location.href = '/billing/expenses/create-multiple-expenses'}
						variant="outline-success" size="sm" className="d-flex align-items-center">
						<RiFileList2Line className="me-1" size={16} />
						Bulk Upload
					</Button>
					{selectedExpenses.length > 0 && (
						<Button variant="outline-warning" size="sm" onClick={handleBulkActions}>
							Bulk Actions ({selectedExpenses.length})
						</Button>
					)}
				</ButtonGroup>
			</div>

			{/* Filter Button */}
			<div className="mb-3">
				<Button
					variant="outline-secondary"
					size="sm"
					onClick={() => setShowOffcanvas(true)}
					className="d-flex align-items-center"
				>
					<RiFilter3Line className="me-2" size={16} />
					Open Filters
				</Button>
			</div>

			{/* Offcanvas Filters */}
			<Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
				<Offcanvas.Header closeButton>
					<Offcanvas.Title className="d-flex align-items-center">
						<RiFilter3Line className="me-2 text-primary" size={20} />
						Filter Expenses
					</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<div className="row g-3">
						<div className="col-12">
							<label htmlFor="from-date" className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
								<RiCalendarEventLine size={14} className="me-1" />From
							</label>
							<input
								id="from-date"
								name="from"
								value={localFilter.from}
								onChange={handleInputChange}
								type="date"
								className="form-control form-control-sm"
								style={{ fontSize: '0.8rem' }}
							/>
						</div>
						<div className="col-12">
							<label htmlFor="to-date" className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
								<RiCalendarEventLine size={14} className="me-1" />To
							</label>
							<input
								id="to-date"
								name="to"
								value={localFilter.to}
								onChange={handleInputChange}
								type="date"
								className="form-control form-control-sm"
								style={{ fontSize: '0.8rem' }}
							/>
						</div>
						<div className="col-12">
							<label htmlFor="status-select" className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>Status</label>
							<select
								id="status-select"
								className="form-select form-select-sm"
								onChange={handleStatusChange}
								value={localFilter.status || 'all'}
								style={{ fontSize: '0.8rem' }}
							>
								<option value="all">All</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
								<option value="pending">Pending</option>
							</select>
						</div>
						<div className="col-12 d-flex gap-2">
							<button
								type="button"
								onClick={handleSearch}
								className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center"
								style={{ fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
							>
								<RiSearchLine size={14} className="me-1" /> Search
							</button>
							<button
								onClick={handleClear}
								className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center"
								type="button"
								style={{ fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
							>
								<RiRefreshLine size={14} className="me-1" /> Clear
							</button>
						</div>
					</div>
				</Offcanvas.Body>
			</Offcanvas>

			{/* Bulk Actions Modal */}
			<Modal show={showBulkModal} onHide={() => { setShowBulkModal(false); setBulkDecisions({}); setIndividualRejectReasons({}); setIndividualSelectedReasons({}); }} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Bulk Expense Decisions</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="mb-3 d-flex gap-2">
						<Button variant="outline-success" size="sm" onClick={handleApproveAll}>
							Approve All
						</Button>
						<Button variant="outline-danger" size="sm" onClick={handleRejectAll}>
							Reject All
						</Button>
					</div>
					<div className="table-responsive">
						<table className="table table-hover">
							<thead>
								<tr>
									<th>Expense Name</th>
									<th>Amount</th>
									<th>Decision</th>
									<th>Rejection Reason</th>
								</tr>
							</thead>
							<tbody>
								{selectedExpenses.map(expenseId => {
									const expense = expenses.find(exp => exp.id === expenseId);
									if (!expense) return null;
									const isRejected = bulkDecisions[expenseId] === 'rejected';

									return (
										<tr key={expenseId}>
											<td className="fw-semibold">{expense.name}</td>
											<td>{currencyFormatter.format(expense.amount)}</td>
											<td>
												<div className="d-flex gap-3">
													<label className="form-check">
														<input
															type="radio"
															name={`decision-${expenseId}`}
															value="approved"
															checked={bulkDecisions[expenseId] === 'approved'}
															onChange={() => handleDecisionChange(expenseId, 'approved')}
															className="form-check-input"
														/>
														<span className="form-check-label text-success">Approve</span>
													</label>
													<label className="form-check">
														<input
															type="radio"
															name={`decision-${expenseId}`}
															value="rejected"
															checked={bulkDecisions[expenseId] === 'rejected'}
															onChange={() => handleDecisionChange(expenseId, 'rejected')}
															className="form-check-input"
														/>
														<span className="form-check-label text-danger">Reject</span>
													</label>
												</div>
											</td>
											<td style={{ minWidth: '300px' }}>
												{isRejected && (
													<div className="mb-2">
														<select
															className="form-select form-select-sm mb-2"
															value={individualSelectedReasons[expenseId] || ''}
															onChange={(e) => {
																const selectedReason = e.target.value;
																const additionalInfo = selectedReason === "Other" ? '' : selectedReason;
																handleIndividualRejectReasonChange(expenseId, selectedReason, additionalInfo);
															}}
															style={{
																fontSize: '0.75rem',
																borderColor: !individualSelectedReasons[expenseId] ? 'var(--bs-danger)' : 'var(--bs-border-color)'
															}}
														>
															<option value="" disabled>Select reason...</option>
															{rejectionReasons.map(r => (
																<option key={r} value={r}>{r}</option>
															))}
														</select>
														<textarea
															className="form-control form-control-sm"
															rows={2}
															value={individualRejectReasons[expenseId] || ''}
															onChange={(e) => {
																const selectedReason = individualSelectedReasons[expenseId];
																handleIndividualRejectReasonChange(expenseId, selectedReason, e.target.value);
															}}
															placeholder={individualSelectedReasons[expenseId] && individualSelectedReasons[expenseId] !== "Other" ? "Add more details..." : "Enter rejection details..."}
															disabled={individualSelectedReasons[expenseId] && individualSelectedReasons[expenseId] !== "Other"}
															style={{
																fontSize: '0.75rem',
																resize: 'vertical',
																backgroundColor: individualSelectedReasons[expenseId] && individualSelectedReasons[expenseId] !== "Other" ? 'var(--bs-secondary-bg)' : 'var(--bs-body-bg)'
															}}
														/>
														{individualSelectedReasons[expenseId] === "Other" && !individualRejectReasons[expenseId]?.trim() && (
															<small className="text-danger">Required for &quot;Other&quot;</small>
														)}
													</div>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowBulkModal(false)}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleSubmitBulkDecisions}>
						Submit Decisions
					</Button>
				</Modal.Footer>
			</Modal>

			{
				Array.isArray(expenses) && expenses.length === 0 ? (
					<div className="d-flex flex-column align-items-center justify-content-center bg-light-subtle rounded-3 py-5 my-4 border border-0 shadow-sm" style={{ minHeight: 220 }}>
						<RiInboxArchiveLine size={48} className="mb-3 text-secondary" />
						<h4 className="text-secondary mb-1">No Expenses Found</h4>
						<p className="text-muted">Try adjusting your filters or add a new expense.</p>
					</div>
				) : (
					<div>
						<PrimeTable
							column={columns}
							data={expenses}
							urlparams={localFilter}
							filtering={true}
							serverSideFiltering={true}
							handleSeverSideProcessing={handleServerSideProcessingForExpenses}
						/>
					</div>
				)
			}
		</div >
	);

};


export default ExpenseList;
