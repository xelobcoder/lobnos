import React, { useState, useEffect } from "react";
import FrontDeskLayout from "../../../../components/Layout/FrontDeskLayout";
import { currencyFormatter, customFetch, customPost } from "../../../../components/Auth/customFetch";
import { RefundAdminViewType } from "../../../../components/sms/type";
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Witness {
	witness: string;
	name: string | null;
	message: string;
}

export default function BillingRefundPage() {
	const [status, setStatus] = useState<string>("pending");
	const [data, setData] = useState<RefundAdminViewType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [selectedMessage, setSelectedMessage] = useState<string>("");
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await customFetch(
					`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=1&&count=10`
				);
				setData(response?.result || []);
			} catch (err) {
				toast.error("Error fetching data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [status, employeeid]);

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(e.target.value);
	};

	const handleApprove = async (item: RefundAdminViewType) => {
		const { serviceid } = item;
		const requestData = { serviceid, employeeid, isApprove: 1 };
		try {
			const response = await customPost(
				`billing/previous/refund/update/approve`,
				"POST",
				requestData
			);
			const { status: success, message } = response;
			if (success) {
				toast.success("Refund Approved successfully");
				setData((prev) => prev.filter((entry) => entry !== item));
			} else {
				toast.error(message || "Action failed");
			}
		} catch {
			toast.error("Error processing approval");
		}
	};

	const columns = [
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
						onClick={() => handleApprove(row.original)}
					>
						Approve
					</button>
					{
						row.original.isRefundCompleted == 0 &&
						<button className="btn btn-danger btn-sm">Revoke </button>
					}
				</div>
			),
		},
	];

	const handleServerSideProcessing = async (values: { count: number; page: number }) => {
		const { count, page } = values;
		try {
			const data = await customFetch(
				`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=${page}&&count=${count}`
			);
			return { result: data.result };
		} catch {
			toast.error("Error loading page data");
			return { error: "Error loading page data" };
		}
	};

	const handleViewMessage = (message: string) => {
		setSelectedMessage(message);
		setModalShow(true);
	};

	const handleCloseModal = () => {
		setModalShow(false);
	};

	return (
		<FrontDeskLayout>
			<ToastContainer position="top-center" className="text-sm" theme="colored" />
			<section className="d-flex justify-content-between mb-3">
				<div className="col-2">
					<select className="custom-select" value={status} onChange={handleStatusChange}>
						<option value="pending">Pending Refund</option>
						<option value="completed">Completed Refund</option>
					</select>
				</div>
				<div className="col-3">
					<input className="custom-input" placeholder="Select a billing section here" />
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
						serverSideFiltering={true}
						urlparams={`billing/refund/details/status?status=${status}&&employeeid=${employeeid}`}
						handleSeverSideProcessing={handleServerSideProcessing}
					/>
				)}
			</section>

			<Modal show={modalShow} onHide={handleCloseModal} backdrop='static'>
				<Modal.Header className=" bg-secondary-subtle" closeButton>
					<Modal.Title>Full Message</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{selectedMessage}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseModal}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</FrontDeskLayout>
	);
}
