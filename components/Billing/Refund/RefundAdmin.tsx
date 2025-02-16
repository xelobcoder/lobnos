"use client"
import React, { useState } from "react";
import { currencyFormatter, customPost } from "../../Auth/customFetch";
import { RefundAdminViewType } from "../../sms/type";
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Search } from "@mui/icons-material";
import { filteringRefundsUsingServiceId, handleRefundServerSideProcessing } from "../../serverActions/ActionFiltering";

interface Witness {
	witness: string;
	name: string | null;
	message: string;
}

export default function RefundAdmin({ initData = [] ,employeeid}) {
	const [status, setStatus] = useState<"pending" | "completed">("pending");
	const [data, setData] = useState<RefundAdminViewType[]>(initData);
	const [search, setSearch] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [selectedMessage, setSelectedMessage] = useState<string>("");



	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value as any);
	};

	const handleApprove = async (item: RefundAdminViewType, isApprove = 0) => {
		const { serviceid } = item;
		const requestData = { serviceid, employeeid, isApprove };
		try {
			const response = await customPost(
				`billing/previous/refund/update/approve`,
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

	const columns = [
		{ Header: 'serviceid', accessor: 'serviceid' },
		{
			Header: "Category",
			accessor: "serviceCategory",
			Cell: ({ value, row }) => {
				return <div>
					<span>{row.original.serviceName}</span>
					<span>({value})</span>
				</div>
			}
		},
		...Array(3)
			.fill(null)
			.flatMap((_, index) => [
				{
					Header: `Wit.. ${index + 1}`,
					accessor: `witnesses[${index}].name`,
					Cell: ({ value }: { value: string | null }) => value || "N/A",
				},
				{
					Header: `Wit.. ${index + 1} Message`,
					accessor: `witnesses[${index}].message`,
					Cell: ({ value }: { value: string | null }) => {
						if (value && value.length > 100) {
							return (
								<div>
									<span
										style={{ cursor: "pointer" }}
										onClick={() => handleViewMessage(value)}
									>
										{value.substring(0, 100)}...<IconButton
											color="primary"
											onClick={() => handleViewMessage(value)}
											style={{ marginLeft: "8px" }}
										>
											<VisibilityIcon />
										</IconButton>
									</span>
								</div>
							);
						}
						return value || "N/A";
					},
				},
			]),
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
			<ToastContainer position="top-center" className="text-sm" theme="colored" />
			<section className="d-flex justify-content-between mb-3">
				<div className="col-2">
					<select className="custom-select" value={status} onChange={handleStatusChange}>
						<option value="pending">Pending Refund</option>
						<option value="completed">Completed Refund</option>
					</select>
				</div>
				<div className="col-1 d-flex">
					<input className="custom-input" type="number" onChange={(ev) => { setSearch(ev.target.value) }} placeholder="serviceid" />
					<button type="button" onClick={(ev) => { handleGetRefundServiceWithId(search) }} className="btn btn-secondary-outline btn-sm">
						<Search />
					</button>
				</div>
			</section>

			<section>
				<h4>{status.charAt(0).toUpperCase() + status.slice(1)} List</h4>
				{loading && <div className="p-3 bg-secondary-subtle">Loading...</div>}
				{data.length > 0 && (
					<PrimeTable
						column={columns}
						data={data}
						filtering={false}
						urlparams={{employeeid,status}}
						serverSideFiltering={true}
						handleSeverSideProcessing={handleRefundServerSideProcessing}
					/>
				)}
			</section>

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
