"use client";
import { Dropdown } from "react-bootstrap";
import { RiEdit2Line, RiFileAddLine, RiDeleteBinLine, RiPrinterLine, RiRefund2Line, RiFileList2Line } from '@remixicon/react';
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { currencyFormatter } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { RiSearchLine } from "@remixicon/react";
import styles from './../../styles/SmsTemplateList.module.css'


export default function BilledClientsView({ data = [], branchid}) {
	const searchParams = useSearchParams();
	const pquery = useMemo(() => {
		const from = searchParams.get('from') || '';
		const to = searchParams.get('to') || '';
		return { from, to };
	}, [searchParams]);

	const [datequery, setDatequery] = useState({
		from: pquery.from || '', to: pquery.to || ''
	});
	const [isLoading, setIsLoading] = useState(false);
	const { employeeid } = useApplicationSettings().applicationsettings.user;
	const router = useRouter();

	// Unified modal state
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState(null); // 'adjust' or 'update'
	const [modalBillingId, setModalBillingId] = useState(null);
	const [modalPatientId, setModalPatientId] = useState(null);
	const [modalRandString, setModalRandString] = useState("");
	const [modalUserRandInput, setModalUserRandInput] = useState("");
	const [modalReason, setModalReason] = useState("");

	// State for view more modal
	const [showViewMore, setShowViewMore] = useState(false);
	const [viewMoreData, setViewMoreData] = useState(null);

	// Generate a random string (6 chars)
	function generateRandString() {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	function openAdjustModal(billingid, patientid) {
		setModalType('adjust');
		setModalBillingId(billingid);
		setModalPatientId(patientid);
		const str = generateRandString();
		setModalRandString(str);
		setModalUserRandInput("");
		setModalReason("");
		setShowModal(true);
	}



	function openUpdateModal(billingid, patientid) {
		setModalType('update');
		setModalBillingId(billingid);
		setModalPatientId(patientid);
		const str = generateRandString();
		setModalRandString(str);
		setModalUserRandInput("");
		setModalReason("");
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
	}


	function handleModalSubmit() {
		setShowModal(false);
		if (!modalBillingId || !modalPatientId || !modalReason) {
			alert("Please fill all fields before proceeding.");
			return;
		}
		const encPatientId = plsEncryption(modalPatientId?.toString());
		const encReason = encodeURIComponent(modalReason);
		const adjustmentType = modalType === 'update' ? 'addition' : 'correction';
		const url = `/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=${adjustmentType}&&isAdjustment=1&&employeeid=${employeeid}`;
		if (modalType === 'adjust') {
			router.push(url);
		} else if (modalType === 'update') {
			router.push(`/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=addition&&isAdjustment=1&&employeeid=${employeeid}`);
		}
	}

	// Define which columns are core financials
	const coreColumns = [
		{ Header: "Date", accessor: "billedon", Cell: ({ value }) => value ? <span>{new Date(value).toLocaleDateString()}</span> : '' },
		{ Header: "Fullname", accessor: "fullname" },
		{ Header: "Patient ID", accessor: "fullpatientid" },
		{ Header: "Bill Id", accessor: "billingid" },
		{ Header: "Amt Payable", accessor: "payable", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Amount Paid", accessor: "paid", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Outstanding", accessor: "outstanding", Cell: ({ value }) => (<div><span className={Number(value) > 0 ? "text-danger" : "text-primary"}>{currencyFormatter.format(Number(value) || 0)}</span></div>) },
		{ Header: "Discount", accessor: "discount", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Amt Refunded", accessor: "totalrefunded", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Balance", accessor: "balance", Cell: ({ value }) => <div>{currencyFormatter.format(Number(value) || 0)}</div> },
		{ Header: "Status", accessor: "status", Cell: ({ value }) => value ? <span className={value === 'pending' ? 'text-warning' : 'text-success'}>{value}</span> : <span className="text-muted">-</span> },
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const outstandingBill = Number(row.original?.outstanding);
				return (
					<>
						<Dropdown>
							<Dropdown.Toggle variant="light" id="archives-dropdown">
								show
							</Dropdown.Toggle>
							<Dropdown.Menu className="m-0 p-0 bg-white">
								<Dropdown.Item
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
									onClick={() => openAdjustModal(row.original.billingid, row.original.patientid)}
									as="button"
									style={{ width: "100%", textAlign: "left" }}
								>
									<RiEdit2Line size={16} /> Adjust /correct transaction Transaction
								</Dropdown.Item>
								<Dropdown.Item
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
									href={`/billing/transactions/adjustment/void-transaction/${row.original.billingid}`}
								>
									<RiDeleteBinLine size={16} /> Void Transaction
								</Dropdown.Item>
								<Dropdown.Item
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
									href={`/billing/transactions/adjustment/writeoff-outstanding/${row.original.billingid}`}
								>
									<RiRefund2Line size={16} /> Write Off Outstanding
								</Dropdown.Item>
								<Dropdown.Item
									onClick={() => openUpdateModal(row.original.billingid, row.original.patientid)}
									as="button"
									className="text-capitalize text-sm m-0 px-2 border-top border-top-1 d-flex align-items-center gap-2"
									style={{ width: "100%", textAlign: "left" }}
								>
									<RiFileAddLine size={16} /> Update Transaction (Add New Service/Test)
								</Dropdown.Item>
								<Dropdown.Item
									href={`${process.env.PLS_PDF_GENERATOR}generate/receipt/invoice?billingid=${row.original.billingid}&&is_pos=false`}
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
								>
									<RiPrinterLine size={16} /> Print Receipt A4 format
								</Dropdown.Item>
								<Dropdown.Item
									href={`${process.env.PLS_PDF_GENERATOR}generate/receipt/invoice?billingid=${row.original.billingid}&&is_pos=true`}
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
								>
									<RiPrinterLine size={16} /> Print Receipt POS format
								</Dropdown.Item>
								<Dropdown.Item
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
									href={`/billing/transactions/previous-transaction/${row.original.billingid}`}
								>
									<RiFileList2Line size={16} /> View Transactions Details
								</Dropdown.Item>
								<Dropdown.Item
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
									onClick={() => handleViewMore(row.original)}
									as="button"
									style={{ width: "100%", textAlign: "left" }}
								>
									View More
								</Dropdown.Item>
								{outstandingBill > 0 && (
									<Dropdown.Item
										className="text-sm m-0 px-2 border-top border-top-1"
										href={`/billing/patientid/${plsEncryption(row.original.fullpatientid.toString())}/outstanding-debt`}
									>
										Settle Bill
									</Dropdown.Item>
								)}
							</Dropdown.Menu>
						</Dropdown>
					</>
				);
			},
		},
	];

	function handleViewMore(rowData) {
		setViewMoreData(rowData);
		setShowViewMore(true);
	}

	// List of fields that should be formatted as currency
	const monetaryFields = [
		'payable', 'paid', 'outstanding', 'discount', 'totalrefunded', 'balance', 'totalcost', 'totalTransactionCost', 'amountIncurredDueTax', 'adjustmentamount', 'promoValue', 'currentPayable', 'previousPaid', 'newPayments', 'totalPaid', 'outstandingToWriteOff'
	];


	return (
		<div>
			{/* Unified Modal for Adjust/Update */}
			<Modal show={showModal} onHide={closeModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{modalType === 'adjust' ? 'Adjust/Correct Transaction' : 'Update Transaction (Add New Service/Test)'}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="mb-3">
						<label className="form-label">Type the following code to acknowledge:</label>
						<div className="mb-2"><strong>{modalRandString}</strong></div>
						<Form.Control
							type="text"
							value={modalUserRandInput}
							onChange={e => setModalUserRandInput(e.target.value.toUpperCase())}
							placeholder="Enter the code above"
							autoFocus
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">Reason for {modalType === 'adjust' ? 'adjustment' : 'update'}:</label>
						<Form.Control
							as="textarea"
							rows={3}
							value={modalReason}
							onChange={e => setModalReason(e.target.value)}
							placeholder={`Provide a reason...`}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModal}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleModalSubmit}
						disabled={modalUserRandInput !== modalRandString || modalReason.trim() === ""}
					>
						Continue
					</Button>
				</Modal.Footer>
			</Modal>

			{/* View More Modal */}
			<Modal show={showViewMore} onHide={() => setShowViewMore(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Billing Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{viewMoreData && (
						<div>
							<table className={styles.table}>
								<tbody>
									{Object.entries(viewMoreData).map(([key, value]) => (
										!coreColumns.some(col => col.accessor === key) &&
										key !== 'year' && key !== 'month' && key !== 'day' && (
											<tr key={key}>
												<th style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</th>
												<td>{
													value === null || value === undefined
														? 'None'
														: value === 1
															? 'Yes'
															: value === 0
																? 'No'
																: monetaryFields.includes(key)
																	? currencyFormatter.format(Number(value) || 0)
																	: String(value)
												}</td>
											</tr>
										)
									))}
								</tbody>
							</table>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowViewMore(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			<div className="d-flex justify-content-end col-12 my-2">
				<div className="col-4 d-flex">
					{datequery.from && datequery.to && (
						<button
							className="btn btn-primary btn-sm mx-2"
							onClick={() => router.push(`${plsEncryption(branchid.toString())}/day-transaction-break-down?date=${datequery.from}&&from=${datequery.from}&&end=${datequery.to}`)}
						>
							View
						</button>
					)}
					<input
						type="date"
						className="custom-input"
						onChange={(ev) => setDatequery({ ...datequery, from: ev.target.value })}
					/>
					<input
						type="date"
						className="custom-input mx-2"
						onChange={(ev) => setDatequery({ ...datequery, to: ev.target.value })}
					/>

					<button
						className="btn btn-outline-secondary btn-sm mx-2"
						onClick={() => handleDatePicker({ branchid, from: datequery.from, to: datequery.to })}
					>
						<RiSearchLine />
					</button>
				</div>
			</div>
			<PrimeTable
				column={coreColumns}
				styling="ttable table"
				urlparams={{...datequery,branchid}}
				data={data || []}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleSeverSideProcessing}
			/>
		</div>
	);
}