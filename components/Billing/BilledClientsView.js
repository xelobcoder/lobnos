"use client";
import { Dropdown, Modal, Table, Button, Form } from "react-bootstrap";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { currencyFormatter, customPost } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useState } from "react";
import { Search } from "@mui/icons-material";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { fetchPreviousBilledRecords } from "../../lib/billingLib";
import TransactionServicesList from './TransactionServicesList'
import { toast } from "react-toastify";

export default function BilledClientsView({ data = [], branchid }) {
	const [datequery, setDatequery] = useState({ from: '', to: '' });
	const [showModal, setShowModal] = useState(false);
	const [previousTransactions, setPreviousTransactions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedTransactions, setSelectedTransactions] = useState([]);
	const [refundReasons, setRefundReasons] = useState({});

	const handleViewTransactionDetails = async (billingid) => {
		setIsLoading(true);
		setShowModal(true);
		try {
			const transactions = await fetchPreviousBilledRecords(billingid);
			setPreviousTransactions(transactions);
		} catch (error) {
			console.error("Error fetching transaction details:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTransactionCheckboxChange = async (transactionId, item) => {
		const stage = await handleRequestForRefund(item)
		if (!stage) {
			return toast.warning("Determination of test status failed");
		}

		if (stage === "UNINITIATED" || stage.toString().trim() === "billing done") {
			const selectedIndex = selectedTransactions.indexOf(transactionId);
			let newSelected = [];

			if (selectedIndex === -1) {
				newSelected = newSelected.concat(selectedTransactions, transactionId);
			} else if (selectedIndex === 0) {
				newSelected = newSelected.concat(selectedTransactions.slice(1));
			} else if (selectedIndex === selectedTransactions.length - 1) {
				newSelected = newSelected.concat(selectedTransactions.slice(0, -1));
			} else if (selectedIndex > 0) {
				newSelected = newSelected.concat(
					selectedTransactions.slice(0, selectedIndex),
					selectedTransactions.slice(selectedIndex + 1)
				);
			}

			setSelectedTransactions(newSelected);
		}

	};

	const handleRefundReasonChange = (transactionId, reason) => {
		setRefundReasons((prev) => ({
			...prev,
			[transactionId]: reason,
		}));
	};

	const handleRefundSubmit = () => {
		const refundData = selectedTransactions.map((transactionId) => ({
			transactionId,
			refundReason: refundReasons[transactionId] || "",
		}));
		console.log("Refund Data:", refundData);
		alert("Refund requests submitted successfully!");
		setSelectedTransactions([]);
		setRefundReasons({});
	};

	const columns = [
		{
			Header: "Date",
			accessor: "date",
			Cell: ({ value }) => <span>{new Date(value).toLocaleDateString()}</span>,
		},
		{ Header: "Fullname", accessor: "fullname" },
		{
			Header: "Patient ID",
			accessor: "fullpatientid",
		},
		{ Header: "Bill Id", accessor: "billingid" },
		{
			Header: "Amt Payable",
			accessor: "payable",
			Cell: ({ value }) => <div>{currencyFormatter.format(value)}</div>,
		},
		{
			Header: "Amount Paid",
			accessor: "paid",
			Cell: ({ row }) => <div>{currencyFormatter.format(row.original.paid)}</div>,
		},
		{ Header: 'Discount', accessor: 'discount', Cell: ({ row }) => <div>{currencyFormatter.format(row.original.discount)}</div> },
		{
			Header: "Outstanding",
			accessor: "outstanding",
			Cell: ({ row }) => (
				<div>
					<span className={row.original.outstanding > 0 ? "text-danger" : "text-primary"}>
						{currencyFormatter.format(row.original.outstanding)}
					</span>
				</div>
			),
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const outstandingBill = row.original?.outstanding;
				return (
					<Dropdown>
						<Dropdown.Toggle variant="light" id="archives-dropdown">
							<MoreVertIcon />
						</Dropdown.Toggle>
						<Dropdown.Menu className="m-0 p-0 bg-white">
							<Dropdown.Item
								href={`/billing/patientid/${plsEncryption(row.original.patientid.toString())}?billingid=${row.original.billingid}&isNewTransaction=0`}
								className="text-capitalize text-sm m-0 px-2 border-top border-top-1"
							>
								Update Transaction
							</Dropdown.Item>
							<Dropdown.Item
								href={`/billing/print-receipt/${row.original.billingid}`}
								className="m-0 p-2 border-top text-sm border-top-1"
							>
								Print Receipt
							</Dropdown.Item>
							<Dropdown.Item
								className="m-0 p-2 border-top text-sm border-top-1"
								onClick={() => handleViewTransactionDetails(row.original.billingid)}
							>
								View Transactions Details
							</Dropdown.Item>
							{outstandingBill > 0 && (
								<Dropdown.Item
									className="text-sm m-0 px-2 border-top border-top-1"
									href={`/billing/payment/update/${row.original.patientid}`}
								>
									Settle Bill
								</Dropdown.Item>
							)}
						</Dropdown.Menu>
					</Dropdown>
				);
			},
		},
	];



	const handleRequestForRefund = async (serviceItem) => {
		const endpoint = `billing/previous/request/refund`;
		const { billingid, categoryTrackId, employeeid, serviceCategory, serviceid } = serviceItem
		const requestResponse = await customPost(endpoint, 'POST', { billingid, categoryTrackId, employeeid, serviceCategory, serviceid })
		return requestResponse?.stage || null
	}

	return (
		<div>
			<div className="d-flex justify-content-end col-12 my-2">
				<div className="col-2 d-flex">
					<input
						type="date"
						className="custom-input"
						onChange={(ev) => setDatequery({ from: ev.target.value, to: ev.target.value })}
					/>
					<button
						className="btn btn-outline-secondary btn-sm mx-2"
						onClick={() => handleDatePicker({ branchid, date: datequery.from })}
					>
						<Search />
					</button>
				</div>
			</div>
			<PrimeTable
				column={columns}
				styling="ttable table"
				urlparams={datequery}
				data={data || []}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleSeverSideProcessing}
			/>

			<Modal show={showModal} backdrop="static" onHide={() => setShowModal(false)} size="xl">
				<Modal.Header closeButton>
					<div className="d-flex justify-content-between col-10">
						<Modal.Title>Transaction Details</Modal.Title>
						<Button
							size="sm"
							variant="primary"
							onClick={handleRefundSubmit}
							disabled={selectedTransactions.length === 0}
						>
							Submit Refund
						</Button>
					</div>
				</Modal.Header>
				<Modal.Body>
					{isLoading ? (
						<div className="text-center">Loading...</div>
					) : (

						previousTransactions.length > 0 ? (

							<>
								<TransactionServicesList previousTransactions={previousTransactions} selectedTransactions={selectedTransactions} handleTransactionCheckboxChange={handleTransactionCheckboxChange} />
								{selectedTransactions.length > 0 && (
									<div className="mt-3">
										{selectedTransactions.map((transactionId) => (
											<Form.Group key={transactionId} className="mb-3">
												<Form.Label>Refund Reason for Transaction {transactionId}</Form.Label>
												<Form.Control
													as="textarea"
													rows={3}
													placeholder="Enter refund reason"
													value={refundReasons[transactionId] || ""}
													onChange={(e) => handleRefundReasonChange(transactionId, e.target.value)}
												/>
											</Form.Group>
										))}
									</div>
								)}
							</>
						) : (
							<div className="text-center">No previous transactions found.</div>
						)
					)}
				</Modal.Body>
			</Modal>
		</div>
	);
}