import { useCallback, useEffect, useState } from "react";
import { customFetch, customPost, getDataAndUpdateState } from "../../components/Auth/customFetch";
import { IconButton, Typography, Menu, MenuItem } from "@mui/material";
import { DeleteForeverOutlined, Edit, Visibility, MoreVert, Add } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import Loader from "../../components/accessories/Loader";
import { Button } from "react-bootstrap";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import PrimeLayout from '../../components/Layout/PrimeLayout';
import Link from "next/link";

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
			<IconButton onClick={handleClick} sx={{ padding: '8px' }}>
				<MoreVert sx={{ color: '#666' }} />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
					elevation: 3,
					sx: {
						borderRadius: '8px',
						minWidth: '200px',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem
					className=" pls-label"
					onClick={() => { onEdit(original); handleClose(); }}
				>
					<Edit sx={{ fontSize: '18px', color: '#2196F3' }} />
					<Typography variant="body2" sx={{ color: '#333' }}>Edit</Typography>
				</MenuItem>
				<MenuItem
					className=" pls-label"
					onClick={() => { onView(original); handleClose(); }}
					
				>
					<Visibility sx={{ fontSize: '18px', color: '#4CAF50' }} />
					<Typography variant="body2" sx={{ color: '#333' }}>View</Typography>
				</MenuItem>
				<MenuItem
					className=" pls-label"
					onClick={() => { onDelete(original); handleClose(); }}
					
				>
					<DeleteForeverOutlined sx={{ fontSize: '18px', color: '#F44336' }} />
					<Typography variant="body2" sx={{ color: '#333' }}>Delete</Typography>
				</MenuItem>
				<MenuItem
					className=" pls-label"
					onClick={() => { handleClose(); }}
					
				>
					<Add />
					<Link href={`/clinicians/billing-strategy/${original.id}?strategy=clinicians`}>
						<Typography variant="body2" sx={{ color: '#333' }}>Create Special Billing</Typography>
					</Link>
				</MenuItem>
			</Menu>
		</div>
	);
};

export default function ClinicianList() {
	const [ClinicianList, setClinician] = useState([]);
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

	const handleDelete = async (original) => {
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
			Cell: ({ row }) => <Typography variant="body2">{row.original?.commission}%</Typography>,
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
		if (loading) return <Loader />;

		return (
			<div>
				<PrimeTable
					column={columns}
					data={ClinicianList}
					serverSideFiltering={true}
					handleSeverSideProcessing={updatePage}
				/>
			</div>
		);
	};

	return (
		<PrimeLayout>
			<ToastContainer />
			<div className="d-flex justify-content-between">
				<h5>Registered Clinician List</h5>
				<Button variant="primary" className="btn btn-sm" onClick={() => router.push("/clinician/new")}>
					Add New Clinician
				</Button>
			</div>
			<div className="card-body">
				{renderingView()}
			</div>
		</PrimeLayout>
	);
}