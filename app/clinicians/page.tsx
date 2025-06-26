"use client";
import { useEffect, useState } from "react";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import { toast } from 'react-toastify';
import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiMoreFill, RiAddLine, RiInfoI } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { Button, Dropdown } from "react-bootstrap";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import Link from "next/link";
import { useApplication } from "../../components/Auth/useApplicationContext";

// ActionButtons component using Bootstrap Dropdown
const ActionButtons = ({ original, onEdit, onView, onDelete }) => {
	return (
		<Dropdown>
			<Dropdown.Toggle
				variant="light"
				id={`dropdown-${original.id}`}
				className="p-2 border-0 bg-transparent"
				aria-label="More actions"
			>
				<RiMoreFill className="text-muted" />
			</Dropdown.Toggle>
			<Dropdown.Menu align="end" className="shadow-sm border-0 rounded-3">
				<Dropdown.Item
					onClick={() => onEdit(original)}
					className="d-flex align-items-center gap-2 py-2"
				>
					<RiEditLine className="text-primary" size={18} />
					Edit
				</Dropdown.Item>
				<Dropdown.Item
					onClick={() => onView(original)}
					className="d-flex align-items-center gap-2 py-2"
				>
					<RiEyeLine className="text-success" size={18} />
					View
				</Dropdown.Item>
				<Dropdown.Item
					onClick={() => onDelete(original)}
					className="d-flex align-items-center gap-2 py-2"
				>
					<RiDeleteBinLine className="text-danger" size={18} />
					Delete
				</Dropdown.Item>
				<Dropdown.Item

					className="d-flex align-items-center gap-2 py-2"
				>
					<Link href={`/clinicians/payment-information/${original.id}`} className="text-decoration-none text-dark">
						<RiInfoI size={18} />
						Update Payment Information
					</Link>

				</Dropdown.Item>
				<Dropdown.Item
					as="div"
					className="d-flex align-items-center gap-2 py-2"
				>
					<RiAddLine size={18} />
					<Link
						href={`/billing/billing-strategy/clinician/${original.id}/check`}
						className="text-decoration-none text-dark"
					>
						Create Special Billing
					</Link>
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	);
};

type Clinician = {
	id: number;
	name: string;
	email: string;
	location: string;
	commission: number;
	phone: string;
	occupation: string;
	address: string;
};

export default function ClinicianList() {
	const [clinicianList, setClinician] = useState<Clinician[]>([]);
	const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
	const [loading, setLoading] = useState(false);
	const role = useApplication().user.role;
	const isAdmin = role === 'admin' || role === 'superadmin';
	const router = useRouter();

	const getClinicianData = async () => {
		try {
			setLoading(true);
			const response = await customFetch(`clinicians?count=${pagination.count}&page=${pagination.page}&&role=${role}`)
			const { result, statusCode } = response;
			if (statusCode == 200 && result && Array.isArray(result)) {
				setClinician(result);
			} else {
				toast.error('Failed to fetch clinicians', {
					position: 'top-right',
					autoClose: 2000,
				});
			}

		} catch (err) {
			toast.error(err.message || 'Error connecting to server', {
				position: 'top-right',
				autoClose: 2000,
			});
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		role && getClinicianData();
	}, []);

	const handleEdit = (original) => {
		const { id } = original;
		if (!id) return;
		router.push(`/clinicians/add-new?clinicianid=${id}`);
	};

	const handleView = (original) => {
		const { id } = original;
		if (!id) return;
		router.push(`/clinicians/clinicianview?clinicianid=${id}`);
	};

	const handleDelete = async (original: Clinician) => {
		const confirmation = confirm('Are you sure you want to delete this clinician?');
		if (!confirmation) return;

		const { id } = original;
		if (!id) return;

		try {
			const deleteResponse = await customPost('clinicians', 'DELETE', { id });
			const { statusCode, status, message } = deleteResponse;

			if (statusCode === 200 && status === 'success') {
				toast.success(message, { position: 'top-right', autoClose: 2000 });
				setClinician((prev) => prev.filter((item) => item.id !== id));
			} else {
				toast.error(message, { position: 'top-right', autoClose: 2000 });
			}
		} catch (err) {
			toast.error(err.message || 'Error connecting to server', {
				position: 'top-right',
				autoClose: 2000,
			});
		}
	};

	const updatePage = async (pagination) => {
		const { count, page } = pagination;
		if (!count || !page) return;

		try {
			const response = await customFetch(`clinicians?count=${count}&page=${page}`);
			const { result } = response;

			if (result && Array.isArray(result)) {
				return { result, error: false };
			}
		} catch (err) {
			return { result: [], error: err };
		}
	};

	const columnsMini = [
		{ Header: 'Name', accessor: 'name' },
		{ Header: 'Email', accessor: 'email' },
		{ Header: 'Location', accessor: 'location' },
		{
			Header: 'Commission Rate',
			accessor: 'commission',
			Cell: ({ row }) => <div>{row.original?.commission}%</div>,
		},
		{ Header: 'Phone', accessor: 'phone' },
		{ Header: 'Occupation', accessor: 'occupation' },
		{ Header: 'Address', accessor: 'address' },
		{
			Header: 'Actions',
			accessor: '',
			Cell: ({ row }) => (
				<ActionButtons
					original={row.original}
					onEdit={handleEdit}
					onView={handleView}
					onDelete={handleDelete}
				/>
			),
		},
	];

	const extendAdminView = [
		{ Header: 'Name', accessor: 'name' },
		{ Header: 'Email', accessor: 'email' },
		{ Header: 'Phone', accessor: 'phone' },
		{ Header: 'Location', accessor: 'location' },
		{ Header: 'Address', accessor: 'address' },
		{ Header: 'Occupation', accessor: 'occupation' },
		{ Header: 'Identifier', accessor: 'identifier' },
		{ Header: 'Module', accessor: 'module' },
		{
			Header: 'Momo Number',
			accessor: 'momo',
			Cell: ({ row }) => <div>{row.original?.momo || 'N/A'}</div>,
		},
		{
			Header: 'Momo Name',
			accessor: 'momoname',
			Cell: ({ row }) => <div>{row.original?.momoname || 'N/A'}</div>,
		},
		{ Header: 'Bank Name', accessor: 'bankname' },
		{ Header: 'Bank Branch', accessor: 'bankbranch' },
		{ Header: 'Account Number', accessor: 'accountnumber' },
		{ Header: 'Account Name', accessor: 'accountname' },
		{
			Header: 'Commission Rate',
			accessor: 'commission',
			Cell: ({ row }) => (
				<div>{row.original?.commission != null ? `${row.original.commission}%` : 'N/A'}</div>
			),
		},
		{
			Header: 'Actions',
			accessor: 'actions',
			disableSortBy: true,
			Cell: ({ row }) => (
				<ActionButtons
					original={row.original}
					onEdit={handleEdit}
					onView={handleView}
					onDelete={handleDelete}
				/>
			),
		},
	];


	const columns = isAdmin ? extendAdminView : columnsMini;


	return (
		<div className="container-fluid py-4">
			{loading ? (
				<div className="card shadow-sm p-4">

				</div>
			) : (
				<div className="card shadow-sm p-4">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<h5 className="mb-0 text-dark fw-semibold">Registered Clinicians</h5>
						<Button
							variant="primary"
							size="sm"
							onClick={() => router.push("/clinicians/add-new")}
							className="d-flex align-items-center gap-2"
						>
							<RiAddLine size={18} />
							Add New Clinician
						</Button>
					</div>
					<div className="table-responsive">
						<PrimeTable
							column={columns}
							data={clinicianList}
							filtering={false}
							serverSideFiltering={true}
							handleSeverSideProcessing={updatePage}

						/>
					</div>
				</div>
			)}
		</div>
	);
}