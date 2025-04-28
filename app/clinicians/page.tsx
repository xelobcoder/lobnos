"use client"
import { useCallback, useEffect, useState } from "react";
import { customFetch, customPost, getDataAndUpdateState } from "../../components/Auth/customFetch";
import { toast } from 'react-toastify';
import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiMoreFill, RiAddLine } from '@remixicon/react';
import { useRouter } from "next/navigation";
import Loader from "../../components/accessories/Loader";
import { Button } from "react-bootstrap";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import Link from "next/link";


const CustomIconButton = ({ children, onClick, style }) => (
    <button onClick={onClick} style={{ ...style, background: 'none', border: 'none', cursor: 'pointer' }}>
        {children}
    </button>
);

const CustomMenu = ({ anchorEl, open, onClose, children }) => (
    open ? (
        <div style={{ position: 'absolute', top: anchorEl?.offsetTop, left: anchorEl?.offsetLeft, background: '#fff', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '8px', minWidth: '200px' }}>
            {children}
        </div>
    ) : null
);

const CustomMenuItem = ({ onClick, children }) => (
    <div onClick={onClick} style={{ padding: '8px 16px', cursor: 'pointer' }}>
        {children}
    </div>
);

const CustomTypography = ({ children, style }) => (
    <span style={style}>{children}</span>
);

const ActionButtons = ({ original, onEdit, onView, onDelete }) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div>
			<CustomIconButton onClick={handleClick} style={{ padding: '8px' }}>
				<RiMoreFill style={{ color: '#666' }} />
			</CustomIconButton>
			<CustomMenu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				<CustomMenuItem onClick={() => { onEdit(original); handleClose(); }}>
					<RiEditLine style={{ fontSize: '18px', color: '#2196F3' }} />
					<CustomTypography style={{ color: '#333' }}>Edit</CustomTypography>
				</CustomMenuItem>
				<CustomMenuItem onClick={() => { onView(original); handleClose(); }}>
					<RiEyeLine style={{ fontSize: '18px', color: '#4CAF50' }} />
					<CustomTypography style={{ color: '#333' }}>View</CustomTypography>
				</CustomMenuItem>
				<CustomMenuItem onClick={() => { onDelete(original); handleClose(); }}>
					<RiDeleteBinLine style={{ fontSize: '18px', color: '#F44336' }} />
					<CustomTypography style={{ color: '#333' }}>Delete</CustomTypography>
				</CustomMenuItem>
				<CustomMenuItem onClick={() => { handleClose(); }}>
					<RiAddLine />
					<Link href={`/clinicians/billing-strategy/${original.id}?strategy=clinicians`}>
						<CustomTypography style={{ color: '#333' }}>Create Special Billing</CustomTypography>
					</Link>
				</CustomMenuItem>
			</CustomMenu>
		</div>
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
	const [ClinicianList, setClinician] = useState<Clinician[]>([]);
	const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const getClinicianData = useCallback(async () => {
		try {
			setLoading(true);
			await getDataAndUpdateState(setClinician, `clinicians?count=${pagination.count}&&page=${pagination.page}`);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			alert(err || 'Error connecting to server');
		}
	}, [pagination.count, pagination.page]);

	useEffect(() => {
		getClinicianData();
	}, [getClinicianData]);

	const handleEdit = (original) => {
		const { id } = original;
		if (!id) return;
		router.push(`/clinician/new?clinicianid=${id}`);
	};

	const handleView = (original) => {
		const { id } = original;
		if (!id) return;
		router.push(`/clinician/clinicianview?clinicianid=${id}`);
	};

	const handleDelete = async (original: Clinician) => {
		const confirmation = confirm('Do you want to delete the clinician?');
		if (!confirmation) return;

		const { id } = original;
		if (!id) return;

		try {
			const deleteResponse = await customPost('clinicians', 'DELETE', { id });
			const { statusCode, status, message } = deleteResponse;

			if (statusCode === 200 && status === 'success') {
				toast.success(message, { position: 'top-right', autoClose: 1000 });
				setClinician((prev) => prev.filter((item) => item.id !== id));
			} else {
				toast.error(message, { position: 'top-right', autoClose: 1000 });
			}
		} catch (err) {
			toast.error(err.message || 'Error connecting to server', { position: 'top-right', autoClose: 1000 });
		}
	};

	const updatePage = async (pagination) => {
		const { count, page } = pagination;
		if (!count || !page) return;

		try {
			const response = await customFetch(`clinicians?count=${count}&&page=${page}`);
			const { result } = response;

			if (result && Array.isArray(result)) {
				return { result, error: false };
			}
		} catch (err) {
			return { result: [], error: err };
		}
	};

	const columns = [
		{ Header: 'Name', accessor: 'name' },
		{ Header: 'Email', accessor: 'email' },
		{ Header: 'Location', accessor: 'location' },
		{
			Header: 'Commission rate',
			accessor: 'commission',
			Cell: ({ row }) => <div >{row.original?.commission}%</div>,
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

	const renderingView = () => {
		if (loading) return <Loader  h={20} w={20}/>;

		return (
			<div>
				<PrimeTable
					column={columns}
					data={ClinicianList}
					filtering={false}
					serverSideFiltering={true}
					handleSeverSideProcessing={updatePage}
				/>
			</div>
		);
	};

	return (
	<div>
			<div className="d-flex justify-content-between">
				<h5>Registered Clinician List</h5>
				<Button variant="primary" className="btn btn-sm" onClick={() => router.push("/clinician/new")}>
					Add New Clinician
				</Button>
			</div>
			<div className="card-body">
				{renderingView()}
			</div>
	</div>
	);
}