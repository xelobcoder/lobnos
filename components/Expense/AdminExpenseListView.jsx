import { useEffect, useState, useRef } from "react";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import ExpenseList from "./ExpenseListComponent";
import ExpenseDetail from "./ExpenseDetailsComponent";
import Modal from 'react-bootstrap/Modal';
import { RiAddBoxLine } from "@remixicon/react";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const defaultFilterState = { from: "", to: "", status: "" };

export default function AdminExpensesList({ branchid, employeeid }) {
	const [detail, setDetails] = useState(true);
	const [selected, setSelected] = useState(null);
	const [expenses, setExpenses] = useState([]);
	const [filter, setFilter] = useState(defaultFilterState);
	const [selectedLoading, setSelectedLoading] = useState(false);
	const [imagefull, setImageFull] = useState(false);
	const [page, setPage] = useState({ count: 10, page: 1 });
	const [showRejectionForm, setShowRejectionForm] = useState(false);
	const [rejectionInfo, setRejectionInfo] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);
	const [toastMsg, setToastMsg] = useState("");
	const toastRef = useRef(null);

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

	const [selectedReason, setSelectedReason] = useState("");

	const getExpenseData = async () => {
		customFetch(`expenses/records?branchid=${branchid}&&employeeid=${employeeid}&&count=${page.count}&&page=${page.page}&&from=${filter.from}&&to=${filter.to}&&status=${filter.status}`)
			.then((data) => {
				setExpenses(data);
			})
			.catch(() => {
				setExpenses([]);
			});
	};

	useEffect(() => {
		if (employeeid && branchid) {
			getExpenseData();
		}
	}, [filter, page, employeeid, branchid]);

	const handleFilters = () => {
		setPage((prev) => ({ ...prev, page: 1 }));
		getExpenseData();
	};


	const handleRejectionBtn = () => {
		setShowRejectionForm(true);
	}

	const handleRejectExpense = async () => {
		if (!selected) return;
		const payload = {
			expenseid: selected.id,
			employeeid: employeeid,
			status: "rejected",
			branchid,
			information: rejectionInfo || selectedReason
		};
		try {
			const response = await customPost("expense/pending/decision", "POST", payload);
			if (response && response.status === true) {
				setToastMsg("Expense rejected successfully.");
				setShowSuccess(true);
				getExpenseData();
				setTimeout(() => setShowSuccess(false), 3000);
			}
		} catch (e) {
			
		}
		setShowRejectionForm(false);
		setSelected(null);
		setRejectionInfo("");
		setSelectedReason("");
	};

	const handleApproveExpense = async () => {
		if (!selected) return;
		const payload = {
			expenseid: selected.id,
			employeeid: employeeid,
			status: "approved",
			branchid,
			information: "Approved by admin"
		};
		try {
			const response = await customPost("expense/pending/decision", "POST", payload);
			if (response && response.status === true) {
				setToastMsg("Expense approved successfully.");
				setShowSuccess(true);
				getExpenseData();
				setTimeout(() => setShowSuccess(false), 3000);
			}
		} catch (e) {}
		setSelected(null);
		setShowRejectionForm(false);
		setRejectionInfo("");
		setSelectedReason("");
	};

	return (
		<div className="container-fluid p-4">
			<div
				className="toast-container position-fixed top-0 end-0 p-3"
				style={{ zIndex: 9999 }}
			>
				<div
					ref={toastRef}
					className={`toast align-items-center text-bg-success border-0 ${showSuccess ? "show" : "hide"}`}
					role="alert"
					aria-live="assertive"
					aria-atomic="true"
				>
					<div className="d-flex">
						<div className="toast-body">
							{toastMsg}
						</div>
						<button
							type="button"
							className="btn-close btn-close-white me-2 m-auto"
							data-bs-dismiss="toast"
							aria-label="Close"
							onClick={() => setShowSuccess(false)}
						></button>
					</div>
				</div>
			</div>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4 className="mb-0">Expense Management</h4>
				<ButtonGroup aria-label="Create expense options" size="sm">
					<Button variant="primary" onClick={() => window.location.href='/billing/expenses/create-new-expense'}>
						<RiAddBoxLine className="me-1"/>
						Single Expense
					</Button>
					<Button variant="outline-primary" onClick={() => window.location.href='/billing/expenses/create-multiple-expenses'}>
						<RiAddBoxLine className="me-1"/>
						Multiple Expenses
					</Button>
				</ButtonGroup>
			</div>
			<ExpenseList 
				expenses={expenses} 
				setSelected={setSelected} 
				selected={selected}
				filter={filter}
				setFilter={setFilter}
				handleFilters={handleFilters}
			/>
			<Modal show={!!selected} onHide={() => { setSelected(null); setShowRejectionForm(false); }} size="lg" backdrop="static">
				<Modal.Header closeButton onHide={() => { setSelected(null); setShowRejectionForm(false); }}>
					<Modal.Title>
						{showRejectionForm ? 'Reject Expense' : 'Expense Details'}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selected && !showRejectionForm && (
						<>
							<ExpenseDetail
								detail={selected}
								imagefull={imagefull}
								setImageFull={setImageFull}
								selectedLoading={selectedLoading}
								onReject={handleRejectionBtn}
							/>
							<div className="d-flex justify-content-end gap-2 mt-3">
								<button
									type="button"
									className="btn btn-success btn-sm"
									onClick={handleApproveExpense}
								>
									Approve Expense
								</button>
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									onClick={handleRejectionBtn}
								>
									Reject Expense
								</button>
							</div>
						</>
					)}
					{selected && showRejectionForm && (
						<main>
							<div className="mb-3">
								<label htmlFor="rejection-reason" className="form-label fw-bold">Select Reason for Rejection</label>
								<select
									id="rejection-reason"
									className="form-select mb-2"
									value={selectedReason}
									onChange={e => {
										const val = e.target.value;
										setSelectedReason(val);
										if (val !== "Other") {
											setRejectionInfo(val);
										} else {
											setRejectionInfo("");
										}
									}}
								>
									<option value="" disabled>Select a reason</option>
									{rejectionReasons.map(r => (
										<option key={r} value={r}>{r}</option>
									))}
								</select>
								<label htmlFor="rejection-info" className="form-label">Additional Information (optional)</label>
								<textarea
									id="rejection-info"
									value={rejectionInfo}
									onChange={ev => setRejectionInfo(ev.target.value)}
									required={selectedReason === "Other"}
									className="form-control"
									rows={4}
									placeholder={selectedReason && selectedReason !== "Other" ? "You may add more details..." : "Please provide a reason..."}
									disabled={selectedReason && selectedReason !== "Other"}
								/>
							</div>
							<div className="d-flex justify-content-end gap-2">
								<button
									type="button"
									disabled={!selectedReason || (selectedReason === "Other" && !rejectionInfo.trim())}
									onClick={handleRejectExpense}
									className="btn btn-secondary btn-sm"
								>
									Reject Expense
								</button>
								<button
									type="button"
									onClick={() => {
										setShowRejectionForm(false);
										setRejectionInfo("");
										setSelectedReason("");
									}}
									className="btn btn-danger btn-sm"
								>
									Close
								</button>
							</div>
						</main>
					)}
				</Modal.Body>
			</Modal>
		</div>
	);
}
