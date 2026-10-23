import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { currencyFormatter, customFetch, customFetchMutation } from '../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiCheckDoubleFill, RiCloseCircleFill, RiFileList2Line, RiInboxArchiveLine, RiCalendarEventLine, RiFilter3Line, RiRefreshLine, RiSearchLine, RiAddBoxLine } from '@remixicon/react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { Button, ButtonGroup, Modal } from 'react-bootstrap';

const statusMap = {
	0: { label: 'Pending', color: 'warning', icon: <RiFileList2Line className="me-1" /> },
	1: { label: 'Approved', color: 'success', icon: <RiCheckDoubleFill className="me-1" /> },
	2: { label: 'Rejected', color: 'danger', icon: <RiCloseCircleFill className="me-1" /> },
};

const ExpenseList = ({ expenses, setSelected, selected, employeeid, filter, setFilter, handleFilters, branchid, setExpenses }) => {
	const [localFilter, setLocalFilter] = useState({ ...filter });
	const [selectedExpenses, setSelectedExpenses] = useState([]);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [bulkDecisions, setBulkDecisions] = useState({});
	const [individualRejectReasons, setIndividualRejectReasons] = useState({});
	const [individualSelectedReasons, setIndividualSelectedReasons] = useState({});
	const [paymentFollowUp, setPaymentFollowUp] = useState(null);
	const router = useRouter();

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
	};

	const handleClear = () => {
		const cleared = { from: '', to: '', status: '' };
		setLocalFilter(cleared);
		setFilter(cleared);
		handleFilters();
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

			const response = await customFetchMutation("expense/pending/decision", "POST", bulkPayload);

			if (!response || response.success === false || response.status === 'error') {
				throw new Error(response?.message || response?.error?.message || 'Expense decisions were not processed');
			}

			let message = '';
			let processedSuccessfully = false;

			// Current workflow response: { success, count, decisions, invoices, invoiceErrors }
			if (response.success === true && Array.isArray(response.decisions)) {
				processedSuccessfully = response.decisions.length === decisionsToSubmit.length;
				const approvedDecisions = response.decisions.filter((decision) => decision.status === 'approved');
				const approvedCount = approvedDecisions.length;
				const rejectedCount = response.decisions.filter((decision) => decision.status === 'rejected').length;
				const parts = [];
				if (approvedCount) parts.push(`${approvedCount} approved`);
				if (rejectedCount) parts.push(`${rejectedCount} rejected`);
				message = `${parts.join(', ') || `${response.count || response.decisions.length} processed`} successfully.`;

				if (Array.isArray(response.invoices) && response.invoices.length > 0) {
					message += ` ${response.invoices.length} invoice(s) created.`;
				}
				if (Array.isArray(response.invoiceErrors) && response.invoiceErrors.length > 0) {
					message += ` Approval succeeded, but ${response.invoiceErrors.length} invoice operation(s) require retry.`;
				}
				if (approvedCount > 0) {
					const approvedIds = new Set(approvedDecisions.map((decision) => Number(decision.expenseid)));
					const paymentTargets = (response.invoices || []).flatMap((invoice) => {
						const expenseIds = (invoice.expenseIds || []).map(Number).filter((id) => approvedIds.has(id));
						return expenseIds.length ? [{ invoiceId: Number(invoice.invoiceId), invoiceNumber: invoice.invoiceNumber, expenseIds }] : [];
					});
					setPaymentFollowUp({ approvedCount, paymentTargets, invoiceErrors: response.invoiceErrors || [] });
				}
			} else if (response.results && Array.isArray(response.results)) {
				// Legacy grouped response retained for compatibility with older servers.
				const successfulResults = response.results.filter(result => result.success === true);
				const failedResults = response.results.filter(result => result.success !== true);

				if (successfulResults.length > 0) {
					const totalProcessed = successfulResults.reduce((sum, result) => sum + result.count, 0);
					processedSuccessfully = totalProcessed === decisionsToSubmit.length && failedResults.length === 0;
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
			} else {
				throw new Error(response.message || 'Unexpected approval response from the server');
			}

			alert(message);
			if (processedSuccessfully) {
				setSelectedExpenses([]);
				setShowBulkModal(false);
				setBulkDecisions({});
				setIndividualRejectReasons({});
				setIndividualSelectedReasons({});
				handleFilters();
			}
		} catch (error) {
			console.error('Error processing bulk decisions:', error);
			alert(error?.message || 'Failed to process expenses');
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
						<span className="fw-bold text-capitalize" style={{ fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', maxWidth: '200px' }}>
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
				<span className="d-flex flex-column" style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', maxWidth: '200px' }}>
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
				<span className="text-secondary" style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', maxWidth: '200px' }}>
					{value ? value.toString().slice(0, 100) : 'No description provided'}
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
			<div
				className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3"
				style={{
					padding: "2px 2px",
				}}
			>
				{/* Title */}
				<div>
					<h5
						className="mb-1"
						style={{
							fontSize: "18px",
							fontWeight: 600,
							color: "#212529",
							letterSpacing: "-0.2px",
						}}
					>
						Expense Management
					</h5>

					<div
						style={{
							fontSize: "12px",
							color: "#6c757d",
						}}
					>
						Manage, create and process expenses
					</div>
				</div>

				{/* Action Buttons */}
				<div
					className="d-flex align-items-center flex-wrap gap-2"
				>
					<Button
						variant="outline-primary"
						size="sm"
						onClick={(ev) => {
							handleSelectAllExpenses(ev)
						}}
						className="d-flex align-items-center justify-content-center"
						style={{
							height: "38px",
							borderRadius: "7px",
							padding: "0 14px",
							fontSize: "13px",
							fontWeight: 500,
						}}
					>
						Select All
					</Button>

					<Button
						variant="primary"
						size="sm"
						onClick={() =>
							window.location.href =
							"/billing/expenses/create-new-expense"
						}
						className="d-flex align-items-center justify-content-center"
						style={{
							height: "38px",
							borderRadius: "7px",
							padding: "0 15px",
							fontSize: "13px",
							fontWeight: 500,
							boxShadow: "0 2px 4px rgba(13, 110, 253, 0.15)",
						}}
					>
						<RiAddBoxLine
							size={16}
							style={{ marginRight: "6px" }}
						/>
						Add Expense
					</Button>

					<Button
						variant="outline-success"
						size="sm"
						onClick={() =>
							window.location.href =
							"/billing/expenses/create-multiple-expenses"
						}
						className="d-flex align-items-center justify-content-center"
						style={{
							height: "38px",
							borderRadius: "7px",
							padding: "0 15px",
							fontSize: "13px",
							fontWeight: 500,
						}}
					>
						<RiFileList2Line
							size={16}
							style={{ marginRight: "6px" }}
						/>
						Bulk Upload
					</Button>

					{selectedExpenses.length > 0 && (
						<Button
							variant="outline-warning"
							size="sm"
							onClick={handleBulkActions}
							className="d-flex align-items-center justify-content-center"
							style={{
								height: "38px",
								borderRadius: "7px",
								padding: "0 15px",
								fontSize: "13px",
								fontWeight: 500,
							}}
						>
							Bulk Actions
							<span
								style={{
									marginLeft: "6px",
									fontSize: "12px",
									fontWeight: 600,
									backgroundColor: "rgba(255, 193, 7, 0.15)",
									padding: "2px 7px",
									borderRadius: "10px",
								}}
							>
								{selectedExpenses.length}
							</span>
						</Button>
					)}
				</div>
			</div>
			<div
				className="mb-3"
				style={{
					background: "#fff",
					border: "1px solid #e9ecef",
					borderRadius: "10px",
					padding: "18px",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
				}}
			>
				<div className="row g-3 align-items-end">

					{/* From Date */}
					<div className="col-12 col-md-6 col-xl-3">
						<label
							htmlFor="from-date"
							className="form-label"
							style={{
								fontSize: "13px",
								fontWeight: 600,
								color: "#495057",
								marginBottom: "7px",
							}}
						>
							From Date
						</label>

						<input
							id="from-date"
							name="from"
							value={localFilter.from}
							onChange={handleInputChange}
							type="date"
							className="form-control"
							style={{
								height: "40px",
								borderRadius: "7px",
								border: "1px solid #dee2e6",
								fontSize: "14px",
								color: "#343a40",
								backgroundColor: "#fff",
								boxShadow: "none",
							}}
						/>
					</div>

					{/* To Date */}
					<div className="col-12 col-md-6 col-xl-3">
						<label
							htmlFor="to-date"
							className="form-label"
							style={{
								fontSize: "13px",
								fontWeight: 600,
								color: "#495057",
								marginBottom: "7px",
							}}
						>
							To Date
						</label>

						<input
							id="to-date"
							name="to"
							value={localFilter.to}
							onChange={handleInputChange}
							type="date"
							className="form-control"
							style={{
								height: "40px",
								borderRadius: "7px",
								border: "1px solid #dee2e6",
								fontSize: "14px",
								color: "#343a40",
								backgroundColor: "#fff",
								boxShadow: "none",
							}}
						/>
					</div>

					{/* Status */}
					<div className="col-12 col-md-6 col-xl-2">
						<label
							htmlFor="status-select"
							className="form-label"
							style={{
								fontSize: "13px",
								fontWeight: 600,
								color: "#495057",
								marginBottom: "7px",
							}}
						>
							Status
						</label>

						<select
							id="status-select"
							className="form-select"
							onChange={handleStatusChange}
							value={localFilter.status || "all"}
							style={{
								height: "40px",
								borderRadius: "7px",
								border: "1px solid #dee2e6",
								fontSize: "14px",
								color: "#343a40",
								backgroundColor: "#fff",
								boxShadow: "none",
								cursor: "pointer",
							}}
						>
							<option value="all">All Statuses</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
							<option value="pending">Pending</option>
						</select>
					</div>

					{/* Actions */}
					<div className="col-12 col-md-6 col-xl-4">
						<div
							className="d-flex gap-2"
							style={{
								height: "40px",
							}}
						>
							<button
								type="button"
								onClick={handleSearch}
								className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
								style={{
									height: "40px",
									borderRadius: "7px",
									padding: "0 18px",
									fontSize: "14px",
									fontWeight: 500,
									boxShadow: "0 2px 4px rgba(13, 110, 253, 0.15)",
								}}
							>
								<RiSearchLine size={17} />
								<span>Search</span>
							</button>

							<button
								type="button"
								onClick={handleClear}
								className="btn btn-light border d-flex align-items-center justify-content-center gap-2"
								style={{
									height: "40px",
									borderRadius: "7px",
									padding: "0 18px",
									fontSize: "14px",
									fontWeight: 500,
									color: "#495057",
									backgroundColor: "#f8f9fa",
								}}
							>
								<RiRefreshLine size={17} />
								<span>Clear</span>
							</button>
						</div>
					</div>

				</div>
			</div>

			{/* Bulk Actions Modal */}
			<Modal fullscreen="sm-down" scrollable data-expense-dialog="true" show={showBulkModal} onHide={() => { setShowBulkModal(false); setBulkDecisions({}); setIndividualRejectReasons({}); setIndividualSelectedReasons({}); }} size="lg">
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

			<Modal fullscreen="sm-down" scrollable data-expense-dialog="true" show={!!paymentFollowUp} onHide={() => setPaymentFollowUp(null)} animation={false} dialogClassName="topSheetDialog">
				<Modal.Header closeButton>
					<Modal.Title>Expenses approved</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-2">{paymentFollowUp?.approvedCount === 1 ? 'The expense was approved.' : `${paymentFollowUp?.approvedCount} expenses were approved.`} Would you like to continue to payment?</p>
					{paymentFollowUp?.invoiceErrors?.length > 0 && <div className="alert alert-warning mb-0">Some invoice operations need retry. You can review available invoices now.</div>}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={() => setPaymentFollowUp(null)}>Not now</Button>
					<Button variant="success" onClick={() => {
						const targets = paymentFollowUp?.paymentTargets || [];
						if (targets.length === 1 && targets[0].expenseIds.length === 1) {
							const target = targets[0];
							router.push(`/billing/expenses/invoices?payInvoice=${target.invoiceId}&payExpense=${target.expenseIds[0]}`);
						} else {
							router.push('/billing/expenses/invoices');
						}
						setPaymentFollowUp(null);
					}}>Make payment</Button>
				</Modal.Footer>
			</Modal>

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
		</div >
	);

};


export default ExpenseList;
