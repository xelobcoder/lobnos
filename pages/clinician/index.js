import { useCallback, useEffect, useState } from "react";
import { customFetch, customPost, getDataAndUpdateState } from "../../components/Auth/customFetch";
import { IconButton, Typography } from "@mui/material";
import { DeleteForeverOutlined, Edit, Visibility } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import Loader from "../../components/accessories/Loader";
import { Button } from "react-bootstrap";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";

export default function ClinicianList() {
	const [ClinicianList, setClinician] = useState([]);
	const [editing, setEditing] = useState({ editing: false, editid: null });
	const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
	const [loading, setLoading] = useState(false);
	const [load, setLoad] = useState(false);
	const router = useRouter();

	const getClinicianData = useCallback(async () => {
		try {
			setLoading(true);
			await getDataAndUpdateState(setClinician, `clinicians?count=${pagination.count}&&page=${pagination.page}`);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			alert(err || 'error connecting to server');
		}
	}, [pagination.count, pagination.page]);

	useEffect(() => {
		getClinicianData();
	}, [getClinicianData]);

	const ForClientEdit = (originaldata) => {
		const { id } = originaldata;
		if (!id) return;
		router.push(`/clinician/new?clinicianid=${id}`);
	};

	const columns = [
		{
			Header: 'Name',
			accessor: 'name'
		},
		{
			Header: 'Email',
			accessor: 'email'
		},
		{
			Header: 'Location',
			accessor: 'location'
		},
		{
			Header: 'Commission rate',
			accessor: 'commission',
			Cell: ({ row }) => {
				const { original } = row;
				return <Typography variant="body2">{original?.commission}%</Typography>;
			}
		},
		{
			Header: 'Phone',
			accessor: 'phone'
		},
		{
			Header: 'Occupation',
			accessor: 'occupation'
		},
		{
			Header: 'Address',
			accessor: 'address'
		},
		{
			Header: 'Actions',
			accessor: '',
			Cell: ({ row }) => {
				const { original } = row;
				return (
					<div>
						<IconButton onClick={() => ForClientEdit(original)}>
							<Edit />
						</IconButton>
						<IconButton size="small" onClick={() => router.push(`/clinician/clinicianview?clinicianid=${original.id}`)}>
							<Visibility sx={{ color: 'green' }} />
						</IconButton>
						<IconButton size="small" onClick={() => handleDelete(original)}>
							<DeleteForeverOutlined sx={{ color: 'red' }} />
						</IconButton>
					</div>
				);
			}
		}
	];

	const handleDelete = async (original) => {
		let confirmation = confirm('Do you want to delete the clinician?');
		if (!confirmation) return;
		const { id } = original;
		if (!id) return;

		try {
			let deletepush = await customPost('clinicians', 'DELETE', { id });
			const { statusCode, status, message } = deletepush;
			if (statusCode === 200 && status === 'success') {
				toast.success(message, { position: 'top-right', autoClose: 1000 });
				setClinician((prev) => prev.filter((item) => item.id !== id));
			} else {
				toast.error(message, { position: 'top-right', autoClose: 1000 });
			}
		} catch (err) {
			toast.error(err.message || 'error connecting to server', { position: 'top-right', autoClose: 1000 });
		}
	};

	const reset = () => {
		setEditing({ editid: null, editing: false });
	};

	const updatePage = async (pagination) => {
		const { count, page } = pagination;
		if (!count || !page) return;
		try {
			const response = await customFetch(`clinicians?count=${count}&&page=${page}`);
			const { result } = response;
			if (result && Array.isArray(result)) {
				return { result, error: false }
			}
		} catch (err) {
			return { result: [], error: err }
		}
	};

	const renderingView = () => {
		if (loading) return <Loader />;
		return (
			<div>
				<PrimeTable column={columns} data={ClinicianList}
					serverSideFiltering={true}
					handleSeverSideProcessing={updatePage}
				/>
			</div>
		);
	};

	return (
		<FrontDeskLayout>
			<ToastContainer />
			<div className="d-flex justify-content-between">
				<h4>Registered Clinician List</h4>
				<Button variant='primary' onClick={(ev) => { router.push("/clinician/new") }} >
					Add new Clinician
				</Button>
			</div>
			<div className="card-body">
				{renderingView()}
			</div>
		</FrontDeskLayout>
	);
}
