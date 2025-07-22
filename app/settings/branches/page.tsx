"use client";
import { useState, useEffect } from "react";
import { getBranches, customPost } from "../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import Loader from "../../../components/accessories/Loader";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { Form, Button, Modal } from "react-bootstrap";
import {
	RiEditLine,
	RiDeleteBin6Line,
	RiMapPinLine,
	RiPhoneLine,
	RiCalendarLine,
	RiAddLine,
} from "@remixicon/react";
import AddBranchComponent from "../../../components/settingsComponents/AddBranchComponent";
import { useRouter } from 'next/navigation';

export interface BranchType {
	branchid: number;
	name: string;
	address: string;
	contact: string;
	activation: number;
	date: string;
}



export default function Branches() {
	const [branches, setBranches] = useState<BranchType[]>([]);
	const [isedit, setEdit] = useState<{
		isediting: boolean;
		data: BranchType | null
	}>({ isediting: false, data: null });
	const [isLoading, setLoading] = useState<boolean>(true);
	const [showModal, setShowModal] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		try {
			getBranches(setBranches, null, setLoading);
		} catch (err) {
			toast.error("Failed to fetch branches");
		}
	}, []);

	const deleteData = async (e: React.MouseEvent, index: number) => {
		const confirmation = confirm(
			"Do you want to delete branch? Note this will have consequence on your data integrity hence accounting section. It is much better to deactivate"
		);
		if (confirmation) {
			setLoading(true);
			const branch = branches.find((item) => item.branchid === index);
			if (!branch) return;

			try {
				const response = await customPost("branches", "DELETE", {
					branchid: branch.branchid,
				});
				const { status, message } = response;
				if (status === "success") {
					toast.success(message, { autoClose: 500, position: "top-center" });
					setBranches((prev) => prev.filter((item) => item.branchid !== index));
					setTimeout(() => {
						router.refresh();
					}, 600);
				} else {
					toast.error(message, { autoClose: 1000, position: "top-center" });
				}
			} catch (err) {
				toast.error("Failed to delete branch");
			}
			setLoading(false);
		}
	};

	const activateDeactivateBranch = async (
		e: boolean,
		action: number,
		id: number
	) => {
		const value = e ? 1 : 0;
		const body = { status: value === 1 ? "activate" : "deactivate", id };

		try {
			const response = await customPost(`branches/activation`, "PUT", body);
			const { status, message } = response;

			if (status === "success") {
				setBranches((prev: BranchType[]) =>
					prev.map((branch: BranchType) =>
						branch.branchid === id ? { ...branch, activation: value } : branch
					)
				);
				toast.success(message);
				setTimeout(() => {
					router.refresh();
				}, 600);
			} else {
				toast.error(message || "Failed to update branch status", { autoClose: 1000, position: "top-center" });
			}
		} catch (error) {
			toast.error("Failed to update branch status");
		}
	};

	const onSave = (
		data: BranchType | null,
		message: string,
		status: string,
		isEdit: boolean
	) => {
		if (!data && status === "error" && !isEdit) {
			toast.error(message, { autoClose: 1000, position: "top-center" });
		} else if (data && status === "success" && isEdit) {
			const updateData = {
				...data,
				branchid: isedit.data!.branchid
			};
			setBranches((prev) =>
				prev.map((branch) =>
					branch.branchid === updateData.branchid ? updateData : branch
				)
			);
			toast.success(message, { autoClose: 500, position: "top-center" });
			setShowModal(false);
		} else if (data && !isEdit && status === "success") {
			setBranches((prev) => [...prev, data]);
			toast.success(message, { autoClose: 500, position: "top-center" });
			setShowModal(false);
		} else {
			toast.success(message, { autoClose: 500, position: "top-center" });
		}
	};

	const resetform = () => {
		setEdit({ isediting: false, data: null });
		setShowModal(false);
	};

	const handleAddNew = () => {
		setEdit({ isediting: false, data: null });
		setShowModal(true);
	};

	const handleEdit = (data: BranchType) => {
		setEdit({ isediting: true, data });
		setShowModal(true);
	};

	const columns = [
		{
			Header: "Branch Details",
			accessor: "name",
			Cell: ({ row, value }: { row: any; value: string }) => (
				<div className="d-flex align-items-center">
					<div className="me-3 d-flex justify-content-center align-items-center bg-primary text-white rounded-circle" style={{ width: '40px', height: '40px' }}>
						<RiMapPinLine size={20} />
					</div>
					<div>
						<h6 className="mb-1 fw-semibold">{value}</h6>
						<div className="d-flex align-items-center text-muted small">
							<RiCalendarLine className="me-1" size={14} />
							<span>
								Created:{" "}
								{new Date(row.original?.date).toLocaleDateString() ||
									new Date().toLocaleDateString()}
							</span>
						</div>
					</div>
				</div>
			),
		},
		{
			Header: "Contact Info",
			accessor: "contact",
			Cell: ({ row }: { row: any }) => (
				<div>
					<div className="d-flex align-items-center mb-2">
						<RiMapPinLine className="me-2 text-secondary" size={16} />
						<span className="text-dark">{row.original.address}</span>
					</div>
					<div className="d-flex align-items-center">
						<RiPhoneLine className="me-2 text-secondary" size={16} />
						<span className="text-dark">{row.original.contact}</span>
					</div>
				</div>
			),
		},
		{
			Header: "Status",
			accessor: "activation",
			Cell: ({ row }: { row: any }) => {
				const item = row.original;
				return (
					<div className="d-flex align-items-center">
						<div
							className={`rounded-circle me-2 ${item.activation === 1 ? 'bg-success' : 'bg-danger'}`}
							style={{ width: '10px', height: '10px' }}
						/>
						<span
							className={`${item.activation === 1 ? "text-success" : "text-danger"} fw-medium`}
						>
							{item.activation === 1 ? "Active" : "Inactive"}
						</span>
					</div>
				);
			},
		},
		{
			Header: "Actions",
			accessor: "",
			Cell: ({ row }: { row: any }) => {
				const item = row.original;
				return (
					<div className="d-flex align-items-center gap-2">
						<Form.Check
							className="me-2"
							checked={item.activation === 1}
							type="switch"
							onChange={(e) =>
								activateDeactivateBranch(e.target.checked, item.activation, item.branchid)
							}
						/>
						<Button
							variant="outline-primary"
							size="sm"
							className="d-flex align-items-center"
							onClick={() => handleEdit(row.original)}
						>
							<RiEditLine className="me-1" size={14} /> Edit
						</Button>
						<Button
							variant="outline-danger"
							size="sm"
							className="d-flex align-items-center"
							onClick={(e) => deleteData(e, item.branchid)}
						>
							<RiDeleteBin6Line className="me-1" size={14} /> Delete
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<div className="container-fluid">
			<div className="d-flex justify-content-between align-items-center mb-4 p-3">
				<h4 className="mb-0 text-dark fw-semibold">Branch Management</h4>
				<Button
					variant="primary"
					size="sm"
					onClick={handleAddNew}
					className="d-flex align-items-center"
				>
					<RiAddLine className="me-2" /> Add New Branch
				</Button>
			</div>

			<div className="row">
				<div className="col-12">
					<div className="card-body p-0">
						{isLoading ? (
							<div className="d-flex flex-column justify-content-center align-items-center py-5">
								<Loader />
								<p className="text-muted mt-3 mb-0">Loading branch data...</p>
							</div>
						) : branches.length === 0 ? (
							<div className="d-flex flex-column justify-content-center align-items-center py-5 text-center">
								<RiMapPinLine size={48} className="text-muted mb-3" />
								<h5 className="text-dark">No Branches Found</h5>
								<p className="text-muted mb-0">Add your first branch to get started</p>
							</div>
						) : (
							<PrimeTable
								column={columns}
								data={branches}
								handleSeverSideProcessing={false}
								serverSideFiltering={false}
								filtering={false}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Modal for Add/Edit Branch */}
			<Modal show={showModal} onHide={resetform} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{isedit.isediting ? (
							<>
								<RiEditLine className="me-2" />
								Edit Branch: {isedit.data?.name || ""}
							</>
						) : (
							<>
								<RiAddLine className="me-2" />
								Add New Branch
							</>
						)}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<AddBranchComponent
						resetform={resetform}
						update={onSave}
						isEdit={isedit.isediting}
						editdata={isedit.data || undefined}
					/>
				</Modal.Body>
			</Modal>
		</div>
	);
}

