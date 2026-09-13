"use client"
import React, { useEffect, useState } from "react";
import Spinner from 'react-bootstrap/Spinner';
import { currencyFormatter, customFetch, customPost } from "../../Auth/customFetch";
import { RefundAdminViewType } from "../../sms/type";
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { RiSearchLine, RiEyeLine, RiFilter3Line } from '@remixicon/react';
import { filteringRefundsUsingServiceId, handleRefundServerSideProcessing } from "../../serverActions/ActionFiltering";
import { useRouter } from "next/navigation";
import { useApplication } from "../../Auth/useApplicationContext";


interface Witness {
	witness: string;
	name: string | null;
	message: string;
}

export default function RefundAdmin({ initData = [], currentStatus }) {
	const [status, setStatus] = useState<"pending" | "completed">(currentStatus || "pending");
	const [data, setData] = useState<RefundAdminViewType[]>(initData);
	const [search, setSearch] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const employeeid = useApplication()?.user?.employeeid;
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [selectedMessage, setSelectedMessage] = useState<string>("");
	const [confirmModal, setConfirmModal] = useState<{ show: boolean, item: RefundAdminViewType | null, action: 'approve' | 'revoke' | null }>({ show: false, item: null, action: null });
	const [actionLoading, setActionLoading] = useState(false);
	const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
	const router = useRouter();

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newStatus = e.target.value;
		router.push(`/billing/refund/refundAdmin/${employeeid}?status=${newStatus}`);
	};

	const handleApprove = async (item: RefundAdminViewType, isApprove = 0) => {
		setActionLoading(true);
		const { serviceid } = item;
		const requestData = { serviceid, employeeid, isApprove };
		try {
			const response = await customPost(
				`billing/previous/refund/update/approve?employeeid=${employeeid}`,
				"POST",
				requestData
			);
			const { status: success, message } = response;
			setActionLoading(false);
			setConfirmModal({ show: false, item: null, action: null });
			if (success) {
				toast.success(isApprove == 1 ? "Refund Approved successfully" : "Refund Revoked successfully");
				setData((prev) => prev.filter((entry) => entry !== item));
			} else {
				toast.error(message || "Action failed");
			}
		} catch {
			setActionLoading(false);
			setConfirmModal({ show: false, item: null, action: null });
			toast.error("Error processing approval");
		}
	};

	const handleConfirmAction = () => {
		if (!confirmModal.item || !confirmModal.action) return;
		handleApprove(confirmModal.item, confirmModal.action === 'approve' ? 1 : 0);
	};


	useEffect(() => {
		const getStatusChangeData = async (status: "pending" | "completed", orderDirection: 'ASC' | 'DESC' = 'DESC') => {
			setLoading(true);
			try {
				const response = await customFetch(
					`billing/refund/details/status?status=${status}&employeeid=${employeeid}&page=1&count=10&orderDirection=${orderDirection}`
				);
				if (response && Array.isArray(response?.result)) {
					setData(response.result);
				} else {
					toast.error("No data found");
				}
			} catch (error) {
				toast.error("Error fetching data");
			} finally {
				setLoading(false);
			}
		}


		if (status) getStatusChangeData(status, orderDirection);

	}, [status, orderDirection]);

	const columns = [
		{
			Header: "Category",
			accessor: "serviceCategory",
			width: 200,
			Cell: ({ value, row }) => (
				<div>
					<span>{row.original.serviceName}</span>
					<span> ({value})</span>
				</div>
			)
		},
		{
			Header: "View Witnesses",
			accessor: "witnesses",
			width: 160,
			disableSortBy: true,
			Cell: ({ row }) => (
				<button
					className="btn btn-outline-info btn-sm"
					onClick={() => handleViewWitnesses(row.original.witnesses)}
				>
					View Witnesses
				</button>
			),
		},
		{
			Header: "Cost",
			accessor: "cost",
			Cell: ({ value }: { value: string }) => currencyFormatter.format(parseFloat(value)),
		},
		{
			Header: "Tax",
			accessor: "amountIncurredDueTax",
			Cell: ({ value }: { value: string }) => currencyFormatter.format(parseFloat(value)),
		},
		{
			Header: "Amount Refunded",
			accessor: "amountRefunded",
			Cell: ({ value }: { value: string }) => currencyFormatter.format(parseFloat(value)),
		},
		{
			Header: "Billed By",
			accessor: "billedby",
		},
		{
			Header: 'Refunded By',
			accessor: 'refundedby',
		},
		{
			Header: "Status",
			accessor: "isRefundApproved",
			Cell: ({ value }) => {
				return (
					<span className={`${value == 1 ? "text-success" : "text-danger"}`}>
						{value == 1 ? 'Approved' : "Pending Approval"}
					</span>
				);
			},
		},
		{
			Header: "Approve",
			Cell: ({ row }: { row: any }) => (
				<div>
					<button
						disabled={row.original.isRefundApproved}
						className="btn btn-sm btn-primary"
						onClick={() => setConfirmModal({ show: true, item: row.original, action: 'approve' })}
					>
						Approve
					</button>
					{
						(row.original.isRefundCompleted == 0 && row.original.isRefundApproved == 1) &&
						<button
							onClick={() => setConfirmModal({ show: true, item: row.original, action: 'revoke' })}
							className="btn btn-danger btn-sm">Revoke </button>
					}
				</div>
			),
		},
	];



	// Witness Modal State
	const [witnessModalShow, setWitnessModalShow] = useState(false);
	const [witnessesToShow, setWitnessesToShow] = useState<Witness[]>([]);

	const handleViewWitnesses = (witnesses: Witness[]) => {
		setWitnessesToShow(witnesses);
		setWitnessModalShow(true);
	};

	const handleViewMessage = (message: string) => {
		setSelectedMessage(message);
		setModalShow(true);
	};

	const handleCloseModal = () => {
		setModalShow(false);
	};


	const handleGetRefundServiceWithId = async (value: number | string) => {
		const result = await filteringRefundsUsingServiceId(value, employeeid);
		setData(result)
	}

	return (
		<div>
			<section
				className="border rounded-2 p-3 p-lg-4 mb-4"
				style={{
					backgroundColor: "var(--theme-card-bg, var(--bs-body-bg))",
					borderColor: "var(--bs-border-color)",
				}}
			>
				<div className="d-flex align-items-center gap-2 mb-3">
					<span
						className="d-inline-flex align-items-center justify-content-center text-primary"
						style={{ width: "32px", height: "32px", backgroundColor: "var(--bs-primary-bg-subtle)", borderRadius: "6px" }}
					>
						<RiFilter3Line size={18} />
					</span>
					<div>
						<h2 className="fs-6 fw-semibold mb-0">Refund Filters</h2>
						<p className="small text-body-secondary mb-0">Refine the refund list</p>
					</div>
				</div>
				<div className="row g-3 align-items-end">
					<div className="col-12 col-md-6 col-xl-3">
						<label className="form-label small mb-2">Refund Status</label>
						<select className="form-select" value={status} onChange={(ev) => { setStatus(ev.target.value as "pending" | "completed") }}>
							<option value="pending">Pending Refund</option>
							<option value="completed">Completed Refund</option>
						</select>
					</div>
					<div className="col-12 col-md-6 col-xl-3">
						<label className="form-label small mb-2">Order Direction</label>
						<select className="form-select" value={orderDirection} onChange={e => setOrderDirection(e.target.value as 'ASC' | 'DESC')}>
							<option value="DESC">Newest First</option>
							<option value="ASC">Oldest First</option>
						</select>
					</div>
					<div className="col-12 col-xl-6">
						<label className="form-label small mb-2">Service ID</label>
						<div className="input-group">
							<input className="form-control" type="number" value={search} onChange={(ev) => { setSearch(ev.target.value) }} placeholder="Search by service ID" />
							<button
								type="button"
								onClick={() => handleGetRefundServiceWithId(search)}
								className="btn btn-primary d-inline-flex align-items-center justify-content-center"
								aria-label="Search refunds by service ID"
								title="Search"
							>
								<RiSearchLine size={18} />
							</button>
						</div>
					</div>
				</div>
			</section>

			<div>
				<h4>{status.charAt(0).toUpperCase() + status.slice(1)} List</h4>
				{loading && <div className="p-3 bg-secondary-subtle">Loading...</div>}
				{data.length > 0 && (
					<div style={{ width: '100%', overflowX: 'auto' }}>
						<PrimeTable
							column={columns}
							data={data}
							filtering={false}
							urlparams={{ employeeid, status }}
							serverSideFiltering={true}
							handleSeverSideProcessing={handleRefundServerSideProcessing}
						/>
					</div>
				)}
			</div>


			{/* Witnesses Modal */}
			<Modal show={witnessModalShow} onHide={() => setWitnessModalShow(false)} backdrop="static" >
				<Modal.Header className="bg-secondary-subtle" closeButton>
					<Modal.Title>Witnesses</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
					{witnessesToShow && witnessesToShow.length > 0 ? (
						<div>
							{witnessesToShow.map((wit, idx) => (
								<div key={idx} className="mb-3 p-2 border rounded bg-body-tertiary">
									<div><b>Name:</b> {wit.name || 'N/A'}</div>
									<div><b>Message:</b> {wit.message ? wit.message : 'N/A'}</div>
								</div>
							))}
						</div>
					) : <div>No witnesses available.</div>}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setWitnessModalShow(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Message Modal */}
			<Modal show={modalShow} onHide={handleCloseModal} backdrop="static" size="lg">
				<Modal.Header className="bg-secondary-subtle" closeButton>
					<Modal.Title>Full Message</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
					<div className="p-3 text-sm" style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", lineHeight: "2 rem" }}>
						{selectedMessage}
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseModal}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Confirm Approve/Revoke Modal */}
			<Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, item: null, action: null })} backdrop="static" centered>
				<Modal.Header closeButton>
					<Modal.Title>{confirmModal.action === 'approve' ? 'Approve Refund' : 'Revoke Refund'}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{confirmModal.action === 'approve' ? (
						<p>Are you sure you want to <b>approve</b> this refund?</p>
					) : (
						<p>Are you sure you want to <b>revoke</b> this refund approval?</p>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setConfirmModal({ show: false, item: null, action: null })} disabled={actionLoading}>
						Cancel
					</Button>
					<Button variant={confirmModal.action === 'approve' ? 'primary' : 'danger'} onClick={handleConfirmAction} disabled={actionLoading}>
						{actionLoading ? <Spinner size="sm" animation="border" /> : (confirmModal.action === 'approve' ? 'Approve' : 'Revoke')}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export function MessageCell({ value, onView }: { value: string | null, onView: (message: string) => void }) {
	if (!value) return "N/A";
	if (value.length <= 100) return value;

	return (
		<div>
			<span style={{ cursor: "pointer" }} onClick={() => onView(value)}>
				{value.substring(0, 100)}
				<RiEyeLine color="primary" onClick={() => onView(value)} style={{ marginLeft: "8px" }} />
			</span>
		</div>
	);
};


