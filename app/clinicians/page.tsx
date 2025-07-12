'use client'



import { useEffect, useState } from "react";
import { customFetch, customFile, customPost } from "../../components/Auth/customFetch";
import { toast } from 'react-toastify';
import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiMoreFill, RiAddLine, RiInfoI, RiFileExcel2Line } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { Button, Dropdown, Modal } from "react-bootstrap";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import Link from "next/link";
import { useApplication } from "../../components/Auth/useApplicationContext";
import styles from '../../styles/SmsTemplateList.module.css'

const customStyles = `
  .bg-gradient-primary {
	background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%) !important;
  }
  

  
  .dropdown-menu {
	border: none !important;
	box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
  }
  
  .dropdown-item:hover {
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
	transform: translateX(3px);
	transition: all 0.2s ease;
  }
  
  .table-responsive table {
	border-collapse: separate;
	border-spacing: 0;
  }
  
  .table-responsive th {
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
	border: none !important;
	font-weight: 600 !important;
	letter-spacing: 0.5px;
  }
`;

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
			<Dropdown.Menu align="end" className="shadow border-0 rounded-3 overflow-hidden">
				<Dropdown.Item
					onClick={() => onEdit(original)}
					className="d-flex align-items-center gap-2 py-2 border-0"
				>
					<RiEditLine className="text-primary" size={16} />
					<span className="fw-medium">Edit Details</span>
				</Dropdown.Item>
				<Dropdown.Item
					onClick={() => onView(original)}
					className="d-flex align-items-center gap-2 py-2 border-0"
				>
					<RiEyeLine className="text-success" size={16} />
					<span className="fw-medium">View Profile</span>
				</Dropdown.Item>
				<Dropdown.Divider className="my-1" />
				<Dropdown.Item
					className="d-flex align-items-center gap-2 py-2 border-0"
				>
					<Link href={`/clinicians/payment-information/${original.id}`} className="text-decoration-none text-dark d-flex align-items-center gap-2 w-100">
						<RiInfoI className="text-info" size={16} />
						<span className="fw-medium">Payment Info</span>
					</Link>
				</Dropdown.Item>
				<Dropdown.Item
					as="div"
					className="d-flex align-items-center gap-2 py-2 border-0"
				>
					<Link
						href={`/billing/billing-strategy/clinician/${original.id}/check`}
						className="text-decoration-none text-dark d-flex align-items-center gap-2 w-100"
					>
						<RiAddLine className="text-warning" size={16} />
						<span className="fw-medium">Special Billing</span>
					</Link>
				</Dropdown.Item>
				<Dropdown.Divider className="my-1" />
				<Dropdown.Item
					onClick={() => onDelete(original)}
					className="d-flex align-items-center gap-2 py-2 border-0 text-danger"
				>
					<RiDeleteBinLine size={16} />
					<span className="fw-medium">Delete</span>
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
	_showFinancialModal?: (row: any) => void;
};

const FinancialInfoModal = ({ show, onHide, data }) => (
	<Modal show={show} onHide={onHide}>
		<Modal.Header closeButton>
			<Modal.Title>Financial Information</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			{data ? (
				<div className="d-flex flex-column gap-2 text-sm">
					<div><strong>Identifier:</strong> {data.identifier || 'N/A'}</div>
					<div><strong>Module:</strong> {data.module || 'N/A'}</div>
					<div><strong>Momo Number:</strong> {data.momo || 'N/A'}</div>
					<div><strong>Momo Name:</strong> {data.momoname || 'N/A'}</div>
					<div><strong>Bank Name:</strong> {data.bankname || 'N/A'}</div>
					<div><strong>Bank Branch:</strong> {data.bankbranch || 'N/A'}</div>
					<div><strong>Account Number:</strong> {data.accountnumber || 'N/A'}</div>
					<div><strong>Account Name:</strong> {data.accountname || 'N/A'}</div>
					<div><strong>Commission Rate:</strong> {data.commission != null ? `${data.commission}%` : 'N/A'}</div>
				</div>
			) : <div>No data</div>}
		</Modal.Body>
		<Modal.Footer>
			<Button variant="secondary" onClick={onHide}>Close</Button>
		</Modal.Footer>
	</Modal>
);

export default function ClinicianList() {
	const [clinicianList, setClinician] = useState<Clinician[]>([]);
	const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
	const [loading, setLoading] = useState(false);
	const [showFinancialModal, setShowFinancialModal] = useState(false);
	const [financialModalData, setFinancialModalData] = useState(null);
	const [showExcelModal, setShowExcelModal] = useState(false);
	const [excelFile, setExcelFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	type ExcelPreview = {
		header: string[];
		data: any[];
		[key: string]: any;
	};
	const [excelPreview, setExcelPreview] = useState<ExcelPreview | null>(null);
	const [selectedRows, setSelectedRows] = useState<number[]>([]);

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

	const handleExcelImport = () => {
		setShowExcelModal(true);
	};

	const handleFileSelect = (event) => {
		const file = event.target.files[0];
		if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
			setExcelFile(file);
		} else {
			toast.error('Please select a valid Excel file (.xlsx or .xls)', {
				position: 'top-right',
				autoClose: 3000,
			});
		}
	};

	const handleExcelUpload = async () => {
		if (!excelFile) {
			toast.error('Please select a file first', {
				position: 'top-right',
				autoClose: 2000,
			});
			return;
		}
		setUploading(true);
		const formData = new FormData();
		formData.append('file', excelFile);
		formData.append('target', 'clinician');
		try {
			const response = await customFile('parse-excel', formData);
			if (response && response.header && response.data) {
				setExcelPreview(response);
				setSelectedRows([]); // Reset selected rows when new data is loaded
			} else {
				toast.error('Failed to parse Excel file', {
					position: 'top-right',
					autoClose: 3000,
				});
			}
		} catch (error) {
			toast.error('Error uploading file. Please try again.', {
				position: 'top-right',
				autoClose: 3000,
			});
		} finally {
			setUploading(false);
		}
	};

	const handleConfirmImport = async () => {
		if (!excelPreview) return;
		const filteredData = excelPreview.data.filter((_, index) => !selectedRows.includes(index));

		if (filteredData.length === 0) {
			return toast.error('No data to import. Please unselect some rows or upload a different file.', {
				position: 'top-right',
				autoClose: 3000,
			});
		}

		setUploading(true);
		try {
			const saveResponse = await customPost('clinicians/bulk', 'POST', {
				data: filteredData,
			});

			if (saveResponse && (saveResponse.success || saveResponse.status === 'success' || saveResponse.status === true)) {
				toast.success(`Bulk registration complete! Success: ${saveResponse.successCount ?? saveResponse.total} / ${saveResponse.total ?? filteredData.length}`, {
					position: 'top-right',
					autoClose: 4000,
				});
				
				setShowExcelModal(false);
				setExcelPreview(null);
				setExcelFile(null);
				setSelectedRows([]);
				getClinicianData();
			} else if (saveResponse && (saveResponse.partialSuccess || saveResponse.failCount > 0)) {
				const errors = Array.isArray(saveResponse.results) ? saveResponse.results.slice(0, 5) : [];
				let msg = `Some records failed. Success: ${saveResponse.successCount ?? 0} / ${saveResponse.total ?? filteredData.length}`;
				if (errors.length > 0) {
					msg += '\nExample errors:';
					errors.forEach((err, i) => { msg += `\n${i + 1}. ${err}`; });
				}
				toast.error(msg, {
					position: 'top-right',
					autoClose: 8000,
				});
			} else {
				const errors = Array.isArray(saveResponse?.results) ? saveResponse.results.slice(0, 5) : [];
				let msg = saveResponse?.message || 'Bulk registration failed.';
				if (errors.length > 0) {
					msg += '\nExample errors:';
					errors.forEach((err, i) => { msg += `\n${i + 1}. ${err}`; });
				}
				toast.error(msg, {
					position: 'top-right',
					autoClose: 8000,
				});
			}
		} catch (err) {
			toast.error('Error saving clinicians. Please try again.', {
				position: 'top-right',
				autoClose: 3000,
			});
		} finally {
			setUploading(false);
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
			Cell: ({ row }) => (
				<div className="d-flex align-items-center gap-2">
					<span className="badge bg-success-subtle text-success-emphasis px-2 py-1">
						{row.original?.commission}%
					</span>
				</div>
			),
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

	const handleShowFinancialModal = (clinician) => {
		setFinancialModalData(clinician);
		setShowFinancialModal(true);
	};

	const extendAdminView = [
		{ Header: 'Name', accessor: 'name' },
		{ Header: 'Email', accessor: 'email' },
		{ Header: 'Phone', accessor: 'phone' },
		{ Header: 'Location', accessor: 'location' },
		{ Header: 'Address', accessor: 'address' },
		{ Header: 'Occupation', accessor: 'occupation' },
		{
			Header: 'Financial Info',
			accessor: 'financial',
			disableSortBy: true,
			Cell: ({ row }) => (
				<Button
					size="sm"
					variant="outline-info"
					onClick={() => handleShowFinancialModal(row.original)}
					className="d-flex align-items-center gap-1 px-2"
				>
					<RiInfoI size={14} />
					Financial Details
				</Button>
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

	const handleRowSelect = (rowIndex: number) => {
		setSelectedRows(prev => 
			prev.includes(rowIndex) 
				? prev.filter(index => index !== rowIndex)
				: [...prev, rowIndex]
		);
	};

	const handleSelectAll = () => {
		if (!excelPreview) return;
		
		if (selectedRows.length === excelPreview.data.length) {
			// If all rows are selected, deselect all
			setSelectedRows([]);
		} else {
			// Select all rows
			setSelectedRows(excelPreview.data.map((_, index) => index));
		}
	};

	const handleRemoveSelected = () => {
		if (!excelPreview || selectedRows.length === 0) return;
		
		const newData = excelPreview.data.filter((_, index) => !selectedRows.includes(index));
		setExcelPreview({
			...excelPreview,
			data: newData
		});
		setSelectedRows([]);
	};

	return (
		<>
			<style>{customStyles}</style>
			<div className="container-fluid py-4">
				{loading ? (
					<div className="card shadow-sm border-0 rounded-3">
						<div className="card-body p-5 text-center">
							<div className="spinner-border text-primary mb-3" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<h6 className="text-muted">Loading clinician data...</h6>
						</div>
					</div>
				) : (
					<div className="card shadow-sm border-0 rounded-3 overflow-hidden">
						<div className="card-header bg-gradient-primary text-white border-0 py-3">
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h5 className="mb-1 fw-semibold">Registered Clinicians</h5>
									<small className="opacity-75">Manage and view all registered healthcare professionals</small>
								</div>
								<div className="d-flex gap-2">
									<Button
										variant="outline-light"
										size="sm"
										onClick={handleExcelImport}
										className="d-flex align-items-center gap-2 fw-semibold"
									>
										<RiFileExcel2Line size={16} />
										Import Excel
									</Button>
									<Button
										variant="light"
										size="sm"
										onClick={() => router.push("/clinicians/add-new")}
										className="d-flex align-items-center gap-2 fw-semibold"
									>
										<RiAddLine size={18} />
										Add New Clinician
									</Button>
								</div>
							</div>
						</div>
						<div className="card-body p-0">
							<div className="table-responsive">
								<PrimeTable
									column={columns}
									data={clinicianList}
									filtering={false}
									serverSideFiltering={true}
									handleSeverSideProcessing={updatePage}
								/>
							</div>
							<FinancialInfoModal
								show={showFinancialModal}
								onHide={() => setShowFinancialModal(false)}
								data={financialModalData}
							/>

							<Modal show={showExcelModal} onHide={() => setShowExcelModal(false)} backdrop="static" keyboard={false} fullscreen>
								<Modal.Header closeButton>
									<Modal.Title className="d-flex align-items-center gap-2">
										<RiFileExcel2Line size={20} />
										{excelPreview ? "Preview Imported Data" : "Import Clinicians from Excel"}
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									{!excelPreview ? (
										<>
											<div className="mb-3">
												<label htmlFor="excelFile" className="form-label fw-semibold">
													Choose Excel File
												</label>
												<input
													type="file"
													className="form-control"
													id="excelFile"
													accept=".xlsx,.xls"
													onChange={handleFileSelect}
												/>
												<div className="form-text">
													Supported formats: .xlsx, .xls
												</div>
											</div>

											{excelFile && (
												<div className="alert alert-info">
													<strong>Selected file:</strong> {excelFile.name}
												</div>
											)}

											<div className="alert alert-warning">
												<strong>Note:</strong> Make sure your Excel file has the following columns:
												<ul className="mb-0 mt-2">
													<li>Name</li>
													<li>Email</li>
													<li>Phone</li>
													<li>Location</li>
													<li>Address</li>
													<li>Occupation</li>
													<li>Commission</li>
												</ul>
											</div>
										</>
									) : (
										<>
											<div className="mb-3">
												<strong>Review the data below. Click Confirm & Save to import, or Back to select a different file.</strong>
											</div>
											
											{excelPreview.data && excelPreview.data.length > 0 && (
												<div className="mb-3 d-flex gap-2 align-items-center">
													<button
														type="button"
														className="btn btn-sm btn-outline-primary"
														onClick={handleSelectAll}
													>
														{selectedRows.length === excelPreview.data.length ? 'Deselect All' : 'Select All'}
													</button>
													{selectedRows.length > 0 && (
														<button
															type="button"
															className="btn btn-sm btn-outline-danger"
															onClick={handleRemoveSelected}
														>
															Remove Selected ({selectedRows.length})
														</button>
													)}
													<small className="text-muted">
														{excelPreview.data.length} total rows
													</small>
												</div>
											)}
											
											<div style={{ overflow: 'auto' }}>
												<table className="table table-bordered table-striped">
													<thead className="table-dark">
														<tr>
															<th>
																<input
																	type="checkbox"
																	className="form-check-input"
																	checked={excelPreview.data && selectedRows.length === excelPreview.data.length && excelPreview.data.length > 0}
																	onChange={handleSelectAll}
																/>
															</th>
															{excelPreview.header && excelPreview.header.map((header, index) => (
																<th key={index}>{header}</th>
															))}
														</tr>
													</thead>
													<tbody>
														{excelPreview.data && excelPreview.data.map((row, rowIndex) => (
															<tr key={rowIndex} className={selectedRows.includes(rowIndex) ? 'table-warning' : ''}>
																<td>
																	<input
																		type="checkbox"
																		className="form-check-input"
																		checked={selectedRows.includes(rowIndex)}
																		onChange={() => handleRowSelect(rowIndex)}
																	/>
																</td>
																{excelPreview.header && excelPreview.header.map((header, colIndex) => (
																	<td key={colIndex} className="fw-medium">
																		{row[header] || '-'}
																	</td>
																))}
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</>
									)}
								</Modal.Body>
								<Modal.Footer>
									<Button
										variant="secondary"
										onClick={() => {
											if (excelPreview) {
												setExcelPreview(null);
												setSelectedRows([]);
											} else {
												setShowExcelModal(false);
											}
										}}
										disabled={uploading}
									>
										{excelPreview ? "Back" : "Cancel"}
									</Button>
									{!excelPreview ? (
										<Button
											variant="primary"
											onClick={handleExcelUpload}
											disabled={!excelFile || uploading}
										>
											{uploading ? (
												<>
													<span className="spinner-border spinner-border-sm me-2" role="status"></span>
													Parsing...
												</>
											) : (
												<>
													<RiFileExcel2Line size={16} className="me-1" />
													Parse & Preview
												</>
											)}
										</Button>
									) : (
										<Button
											variant="primary"
											onClick={handleConfirmImport}
											disabled={uploading}
										>
											{uploading ? (
												<>
													<span className="spinner-border spinner-border-sm me-2" role="status"></span>
													Saving...
												</>
											) : (
												<>
													<RiFileExcel2Line size={16} className="me-1" />
													Confirm & Save
												</>
											)}
										</Button>
									)}
								</Modal.Footer>
							</Modal>
						</div>
					</div>
				)}
			</div>
		</>
	);
}