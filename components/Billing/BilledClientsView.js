"use client";
import { Dropdown } from "react-bootstrap";
import { RiEdit2Line, RiFileAddLine, RiDeleteBinLine, RiPrinterLine, RiRefund2Line, RiFileList2Line } from '@remixicon/react';
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { currencyFormatter } from "../Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { handleDatePicker, handleSeverSideProcessing } from "../serverActions/ActionFiltering";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { RiSearchLine } from "@remixicon/react";


export default function BilledClientsView({ data = [], branchid }) {
	const [datequery, setDatequery] = useState({ from: '', to: '' });
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

	// Generate a random string (6 chars)
	function generateRandString() {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	function openAdjustModal(billingid) {
		setModalType('adjust');
		setModalBillingId(billingid);
		setModalPatientId(null);
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
		const encPatientId = plsEncryption(modalPatientId?.toString());
		const encReason = encodeURIComponent(modalReason);
		const adjustmentType = modalType === 'update' ? 'addition' : 'correction';
		const url = `/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=${adjustmentType}`;
		if (modalType === 'adjust') {
			router.push(url);
		} else if (modalType === 'update') {
			router.push(`/billing/patientid/${encPatientId}/multi?billingid=${modalBillingId}&isNewTransaction=0&&isRelatedBilling=1&&adjustmentReason=${encReason}&&adjustmentType=addition`);
		}
	}
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
		{ Header: 'Amt Refunded', accessor: 'totalRefunded', Cell: ({ row }) => <div>{currencyFormatter.format(row.original.totalRefunded)}</div> },
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
					<>
						<Dropdown>
							<Dropdown.Toggle variant="light" id="archives-dropdown">
								show
							</Dropdown.Toggle>
							<Dropdown.Menu className="m-0 p-0 bg-white">
								<Dropdown.Item
									className="m-0 p-2 border-top text-sm border-top-1 d-flex align-items-center gap-2"
									onClick={() => openAdjustModal(row.original.billingid)}
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
								{outstandingBill > 0 && (
									<Dropdown.Item
										className="text-sm m-0 px-2 border-top border-top-1"
										href={`/billing/patientid/${plsEncryption(row.original.patientid.toString())}/outstanding-debt`}
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
				column={columns}
				styling="ttable table"
				urlparams={datequery}
				data={data || []}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleSeverSideProcessing}
			/>
		</div>
	);
}