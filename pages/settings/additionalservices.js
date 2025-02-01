import { currencyFormatter, customPost } from "../../components/Auth/customFetch";
import MainSettingsLayoutView from "../../components/settingsComponents/MainSettingsLayoutView";
import { useEffect, useState } from "react";
import { fetchServices } from "../../lib/billingLib";
import TableDisplay from "../../components/accessories/TableDisplay";
import { useApplicationSettings } from "../../components/Auth/useApplicationContext";
import { toast, ToastContainer } from "react-toastify";
import { Spinner } from 'react-bootstrap';
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import PrimeLayout from "../../components/Layout/PrimeLayout";

const defaultValues = {
	name: "",
	price: ""
};

export default function AdditionalServicesPage() {
	const [servicesList, setServicesList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { applicationsettings } = useApplicationSettings();
	const { employeeid, role } = applicationsettings.user;
	const [service, setService] = useState(defaultValues);
	const [isEditing, setIsEditing] = useState(false);
	const [editServiceId, setEditServiceId] = useState(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setService({
			...service,
			[name]: value
		});
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			setSubmitting(true);

			if (service.name && parseFloat(service.price) >= 0) {
				const method = isEditing ? 'PUT' : 'POST';
				const response = await customPost(
					`billing/services`,
					method,
					{ ...service, employeeid, ...(isEditing && { serviceid: editServiceId }) }
				);

				if (response.status) {
					toast.success(`Service ${isEditing ? "updated" : "created"} successfully`);
					setLoading(true);
					await fetchServices(setServicesList).finally(() => setLoading(false));
					setService(defaultValues);
					setIsEditing(false);
					setEditServiceId(null);
				} else {
					toast.error(response.message || `${isEditing ? "Update" : "Creation"} failed`);
				}
			} else {
				toast.info("Please provide valid service name and price.");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (service) => {
		setIsEditing(true);
		setEditServiceId(service.keyid);
		setService({
			name: service.serviceName,
			price: service.servicePrice
		});
	};

	const handleDelete = async (serviceId) => {
		if (!role || role !== "admin") {
			return toast.warning('Authorization to delete Denied!!!!!!');
		}
		const confirmation = confirm('Do you want to delete service? It might be associated with transactions and cause errors or inconsistencies in your journal.');

		if (confirmation) {
			const prompt_answer = prompt('Enter your password to confirm');
			if (prompt_answer) {
				const response = await customPost(`billing/services?serviceid=${serviceId}`, 'DELETE');
				if (response.status) {
					setServicesList((prevList) => prevList.filter((item) => item.keyid !== serviceId));
					toast.success('Service Deleted successfully');
				}
			}
		}
	};

	const columns = [
		{ Header: 'Name', accessor: 'serviceName' },
		{
			Header: 'Price',
			accessor: 'servicePrice',
			Cell: ({ value }) => <div>{currencyFormatter.format(value)}</div>
		},
		{ Header: 'Created By', accessor: 'username' },
		{
			Header: 'Actions',
			accessor: '',
			Cell: (row) => (
				<div>
					<button
						className="btn btn-info btn-sm"
						onClick={() => handleEdit(row.row.original)}
					>
						Edit
					</button>
					{
						row.row.original.issystem == 0 && (
							<button
								className="btn btn-danger btn-sm mx-2"
								onClick={() => handleDelete(row.row.original.keyid)}
							>
								Delete
							</button>
						)
					}
				</div>
			)
		}
	];

	useEffect(() => {
		setLoading(true);
		fetchServices(setServicesList)
			.finally(() => setLoading(false));
	}, []);

	return (
		<PrimeLayout>
			<ToastContainer position="top-center" className={'text-sm'} theme="colored" />
			<div className="p-2">
				<form onSubmit={handleSubmit} className="d-flex ">
					<div className="form-group col-4">
						<input
							className="custom-input "
							name="name"
							value={service.name}
							onChange={handleInputChange}
							placeholder="Service name"
							required
						/>
					</div>

					<div className="form-group mx-2 col-4">
						<input
							className="custom-input"
							name="price"
							type="number"
							value={service.price}
							onChange={handleInputChange}
							placeholder="Price"
							min="0"
							step="0.01"
							required
						/>
					</div>

					<div className="form-group">
						<button type="submit" className="btn btn-sm btn-primary">
							{submitting ? (
								<Spinner animation="border" size="sm" />
							) : (
								isEditing ? "Update Service" : "Add Service"
							)}
						</button>
					</div>
				</form>
				<div style={{ overflowX: 'auto' }}>
					{loading ? <Spinner animation="border" /> : (servicesList.length > 0 && <PrimeTable column={columns} data={servicesList} serverSideFiltering={false} handleSeverSideProcessing={false} />)}
				</div>
			</div>
		</PrimeLayout>
	);
}