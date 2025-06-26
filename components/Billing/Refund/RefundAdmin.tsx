"use client"
import React, { useEffect, useState } from "react";
import { currencyFormatter, customFetch, customPost } from "../../Auth/customFetch";
import { RefundAdminViewType } from "../../sms/type";
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { RiSearchLine, RiEyeLine } from '@remixicon/react';
import { filteringRefundsUsingServiceId, handleRefundServerSideProcessing } from "../../serverActions/ActionFiltering";
import { useRouter } from "next/navigation";


interface Witness {
	witness: string;
	name: string | null;
	message: string;
}

export default function RefundAdmin({ initData = [], employeeid, currentStatus }) {
	const [status, setStatus] = useState<"pending" | "completed">(currentStatus || "pending");
	const [data, setData] = useState<RefundAdminViewType[]>(initData);
	const [search, setSearch] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [selectedMessage, setSelectedMessage] = useState<string>("");
	const router = useRouter();


	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newStatus = e.target.value;
		router.push(`/billing/refund/refundAdmin/${employeeid}?status=${newStatus}`);
	};

	const handleApprove = async (item: RefundAdminViewType, isApprove = 0) => {
		const { serviceid } = item;
		const requestData = { serviceid, employeeid, isApprove };
		try {
			const response = await customPost(
				`billing/previous/refund/update/approve?employeeid=${employeeid}`,
				"POST",
				requestData
			);
			const { status: success, message } = response;
			if (success) {
				toast.success(isApprove == 1 ? "Refund Approved successfully" : "Refund Revoked successfully");
				setData((prev) => prev.filter((entry) => entry !== item));
			} else {
				toast.error(message || "Action failed");
			}
		} catch {
			toast.error("Error processing approval");
		}
	};


	useEffect(() => {
		const getStatusChangeData = async (status: "pending" | "completed") => {
			setLoading(true);
			try {
				const response = await customFetch(
					`billing/refund/details/status?status=${status}&employeeid=${employeeid}&page=1&count=10`
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


		if (status ) getStatusChangeData(status);

	}, [ status]);

	const columns = [
		{
			Header: 'serviceid',
			accessor: 'serviceid',
			width: 120
		},
		{
			Header: "Category",
			accessor: "serviceCategory",
			width: 200,
			Cell: ({ value, row }) => (
				<div>
					<span>{row.original.serviceName}</span>
					<span>({value})</span>
				</div>
			)
		},
		// Witness 1
		{
			Header: "Wit.. 1",
			accessor: "witnesses[0].name",
			width: 150,
			Cell: ({ value }: { value: string | null }) => value || "N/A",
		},
		{
			Header: "Wit.. 1 Message",
			accessor: "witnesses[0].message",
			width: 250,
			Cell: ({ value }: { value: string | null }) => (
				<MessageCell value={value} onView={handleViewMessage} />
			),
		},
		// Witness 2
		{
			Header: "Wit.. 2",
			accessor: "witnesses[1].name",
			width: 150,
			Cell: ({ value }: { value: string | null }) => value || "N/A",
		},
		{
			Header: "Wit.. 2 Message",
			accessor: "witnesses[1].message",
			width: 250,
			Cell: ({ value }: { value: string | null }) => (
				<MessageCell value={value} onView={handleViewMessage} />
			),
		},
		{
			Header: "Cost",
			accessor: "cost",
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value),
		},
		{
			Header: "Tax",
			accessor: "amountIncurredDueTax",
			Cell: ({ value }: { value: number }) => currencyFormatter.format(value),
		},
		{
			Header: "Billed By",
			accessor: "billedby",
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
						onClick={() => handleApprove(row.original, 1)}
					>
						Approve
					</button>
					{
						(row.original.isRefundCompleted == 0 && row.original.isRefundApproved == 1) &&
						<button
							onClick={(ev) => { handleApprove(row.original, 0) }}
							className="btn btn-danger btn-sm">Revoke </button>
					}
				</div>
			),
		},
	];



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
			<section className="d-flex justify-content-between mb-3">
				<div className="col-2">
					<select className="custom-select" value={status} onChange={(ev) =>  {setStatus(ev.target.value as "pending" | "completed")}}>
						<option value="pending">Pending Refund</option>
						<option value="completed">Completed Refund</option>
					</select>
				</div>
				<div className="col-1 d-flex">
					<input className="custom-input" type="number" onChange={(ev) => { setSearch(ev.target.value) }} placeholder="serviceid" />
					<button type="button" onClick={(ev) => { handleGetRefundServiceWithId(search) }} className="btn btn-secondary-outline btn-sm">
						<RiSearchLine />
					</button>
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


