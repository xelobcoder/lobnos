import React, { useCallback, useEffect, useState } from "react";
import { regions, organizationDefaultBasicInfo, customFetch, customFile, customPost, validateFormData } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { toast, ToastContainer } from 'react-toastify';
import { 
	RiBuildingLine, 
	RiMapPinLine, 
	RiPhoneLine, 
	RiMailLine, 
	RiGlobalLine, 
	RiSaveLine,
	RiUploadLine,
	RiFileExcel2Line,
	RiEditLine
} from '@remixicon/react';
import { Modal, Button } from 'react-bootstrap';

const customStyles = `
  .image-upload-area {

  border: 2px dashed #dee2e6;
	border-radius: 8px;
	background: #f8f9fa;
	transition: border-color 0.3s ease;
  }
  
  .image-upload-area:hover {
	border-color: #0d6efd;
  }
  
  .image-upload-area.dragging {
	border-color: #0d6efd;
	background: #f0f8ff;
  }
`;


export default function OrganizationBasicForm({ organizationid }) {
	const [data, setData] = useState(organizationDefaultBasicInfo);
	const [message, setMessage] = useState("Add new organization");
	const [isloading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [dragging, setDragging] = useState(false);
	const [formValues, setFormValues] = useState(organizationDefaultBasicInfo);
	const [formErrors, setFormErrors] = useState({});
	const [excelFile, setExcelFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [showExcelModal, setShowExcelModal] = useState(false);
	const [excelPreview, setExcelPreview] = useState(null);
	const [selectedRows, setSelectedRows] = useState([]);

	useEffect(() => {
		if (organizationid) {
			setMessage("Update organization basic information");
			getOrganizationData();
			loadOrganizationImage();
		}
	}, [organizationid]);

	const getOrganizationData = useCallback(() => {
		setLoading(true);
		customFetch(`organization/basic?id=${organizationid}`)
			.then((response) => {
				const { statusCode, status, result } = response;
				if (statusCode === 200 && status === "success") {
					setData(result[0]);
					setFormValues(result[0]);
				}
				setLoading(false);
			})
			.catch(() => {
				setData(organizationDefaultBasicInfo);
				alert("Error getting data;");
				setLoading(false);
			});
	}, [organizationid]);

	const loadOrganizationImage = useCallback(() => {
		const imageUrl = `${process.env.BASEURL}/organization/profile/image?id=${organizationid}`;
		setSelectedImage(imageUrl);
	}, [organizationid]);

	const validateFields = (formData) => {
		const errors = {};
		if (!formData.name) {
			errors.name = "Organization name is required";
		}
		if (!formData.mobile) {
			errors.mobile = "Mobile number is required";
		} else if (!/^[0-9]{10}$/.test(formData.mobile)) {
			errors.mobile = "Mobile number must be 10 digits";
		}
		if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = "Invalid email address";
		}
		if (formData.website && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(formData.website)) {
			errors.website = "Invalid URL";
		}
		return errors;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validateFields(formValues);
		if (Object.keys(validationErrors).length) {
			setFormErrors(validationErrors);
			return;
		}

		// Pad mobile with 0 if it doesn't start with 0
		let updatedFormValues = { ...formValues };
		const mobileValue = updatedFormValues.mobile ? updatedFormValues.mobile.trim().toString() : '';
		if (mobileValue && mobileValue.length === 9 && !mobileValue.startsWith('0')) {
			updatedFormValues.mobile = mobileValue.padStart(10, '0');
		}

		const handleResponseCallBack = (response) => {
			const { status, message } = response;
			if (status === "exist") return toast.warning(message);
			toast.success(message)
		}
		try {
			if (!organizationid) {
				validateFormData(updatedFormValues, false, ["name", "mobile"], "new/organizations", handleResponseCallBack);
			} else {
				const updateInfo = await customPost("organization/update/basic", "PUT", updatedFormValues);
				toast.success(updateInfo?.message);
			}
		} catch (err) {
			toast.error('Something wrong occurred');
		}
	};

	const uploadImageCall = async (file) => {
		if (!file) return;
		try {
			const formData = new FormData();
			formData.append('organizations', file);

			console.log('Uploading image...');
			const response = await fetch(`http://localhost:5000/api/v1/organization/profile/image?id=${organizationid}`, {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();
				console.log('Upload successful:', result);
				return result;
			} else {
				console.error('Upload failed:', response.statusText);
				return null;
			}
		} catch (error) {
			console.error('Error during upload:', error);
			return null;
		}
	}

	const handleImageUpload = async (event) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedImage(URL.createObjectURL(file));
			await uploadImageCall(file);
		}
	};

	const handleDrop = async (event) => {
		event.preventDefault();
		setDragging(false);
		const file = event.dataTransfer.files[0];
		if (file) {
			setSelectedImage(URL.createObjectURL(file));
			await uploadImageCall(file);
		}
	};

	const handleDragOver = (event) => {
		event.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = (event) => {
		event.preventDefault();
		setDragging(false);
	};

	const handleExcelImport = () => {
		setShowExcelModal(true);
	};

	const handleExcelFileSelect = (event) => {
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
		formData.append('target', 'organization');
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
		
		// Filter out selected rows from the data
		const filteredData = excelPreview.data.filter((_, index) => !selectedRows.includes(index));
		
		if (filteredData.length === 0) {
			toast.error('No data to import. Please unselect some rows or upload a different file.', {
				position: 'top-right',
				autoClose: 3000,
			});
			return;
		}
		
		setUploading(true);
		try {
			// Send the filtered data to the backend for saving
			const saveResponse = await customPost('organizations/import', 'POST', {
				header: excelPreview.header,
				data: filteredData,
				target: 'organization',
			});
			if (saveResponse && saveResponse.status === 'success') {
				toast.success('Organizations imported successfully!', {
					position: 'top-right',
					autoClose: 3000,
				});
				setShowExcelModal(false);
				setExcelPreview(null);
				setExcelFile(null);
				setSelectedRows([]);
			} else {
				toast.error(saveResponse?.message || 'Failed to save organizations', {
					position: 'top-right',
					autoClose: 3000,
				});
			}
		} catch (err) {
			toast.error('Error saving organizations. Please try again.', {
				position: 'top-right',
				autoClose: 3000,
			});
		} finally {
			setUploading(false);
		}
	};

	const handleRowSelect = (rowIndex) => {
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

	if (isloading) return (
		<div className="container-fluid py-4">
			<style>{customStyles}</style>
			<div className="card">
				<div className="card-body p-4 text-center">
					<div className="spinner-border text-primary mb-3" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<h6 className="text-muted">Loading organization data...</h6>
				</div>
			</div>
		</div>
	);

	return (
		<div className="container-fluid py-4">
			<style>{customStyles}</style>
			
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h4 className="d-flex align-items-center gap-2 mb-0">
					<RiBuildingLine size={20} />
					{message}
				</h4>
				{!organizationid && (
					<button
						type="button"
						className="btn btn-outline-primary d-flex align-items-center gap-2"
						onClick={handleExcelImport}
					>
						<RiFileExcel2Line size={16} />
						Import Excel
					</button>
				)}
			</div>

			<div className="card">
				<div className="card-body">
					<form onSubmit={onSubmit} autoComplete="off">
						<div className="row">
							{organizationid && (
								<div className="col-md-4 mb-4">
									<h6 className="mb-3">Organization Logo</h6>
									<div
										className={`image-upload-area d-flex flex-column align-items-center justify-content-center${dragging ? ' dragging' : ''}`}
										style={{ minHeight: 180, cursor: 'pointer' }}
										onClick={() => document.getElementById('fileInput').click()}
										onDrop={handleDrop}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
									>
										{selectedImage ? (
											<div className="text-center">
												<img 
													src={selectedImage} 
													alt="Organization Logo" 
													className="img-thumbnail mb-2" 
													style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 4 }} 
												/>
												<div className="d-flex align-items-center justify-content-center gap-1 text-primary">
													<RiEditLine size={14} />
													<small>Click to change</small>
												</div>
											</div>
										) : (
											<div className="text-center">
												<RiUploadLine className="text-muted mb-2" size={24} />
												<p className="text-muted mb-1">Click to upload logo</p>
												<small className="text-muted">PNG, JPG up to 5MB</small>
											</div>
										)}
									</div>
									<input
										type="file"
										id="fileInput"
										accept="image/*"
										onChange={handleImageUpload}
										style={{ display: 'none' }}
									/>
								</div>
							)}
							<div className={`col-md-${organizationid ? '8' : '12'}`}>
								<h6 className="mb-3">Basic Information</h6>
								<div className="mb-3">
									<label className="form-label">Organization Name *</label>
									<div className="input-group">
										<span className="input-group-text">
											<RiBuildingLine size={16} />
										</span>
										<input
											type="text"
											className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
											autoComplete="off"
											placeholder="Enter organization name"
											name="name"
											value={formValues.name}
											onChange={handleChange}
										/>
										{formErrors.name && (
											<div className="invalid-feedback">
												{formErrors.name}
											</div>
										)}
									</div>
								</div>
								<div className="mb-3">
									<label className="form-label">Location</label>
									<div className="input-group">
										<span className="input-group-text">
											<RiMapPinLine size={16} />
										</span>
										<input
											type="text"
											className="form-control"
											autoComplete="off"
											placeholder="City or district"
											name="location"
											value={formValues.location}
											onChange={handleChange}
										/>
									</div>
								</div>
								<div className="mb-3">
									<label className="form-label">Street Address</label>
									<input
										type="text"
										className="form-control"
										autoComplete="off"
										placeholder="Street name and number"
										name="street"
										value={formValues.street}
										onChange={handleChange}
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">Mobile Number *</label>
									<div className="input-group">
										<span className="input-group-text">
											<RiPhoneLine size={16} />
										</span>
										<input
											type="tel"
											className={`form-control ${formErrors.mobile ? 'is-invalid' : ''}`}
											autoComplete="off"
											minLength={10}
											maxLength={10}
											inputMode="tel"
											placeholder="0595964565"
											name="mobile"
											value={formValues.mobile}
											onChange={handleChange}
										/>
										{formErrors.mobile && (
											<div className="invalid-feedback">
												{formErrors.mobile}
											</div>
										)}
									</div>
								</div>
				<div className="mb-3">
					<label className="form-label">Full Address</label>
					<textarea
						className="form-control"
						rows={3}
						autoComplete="off"
						placeholder="Complete address"
						name="address"
						value={formValues.address}
						onChange={handleChange}
					/>
				</div>
								<div className="mb-3">
									<label className="form-label">Email Address</label>
									<div className="input-group">
										<span className="input-group-text">
											<RiMailLine size={16} />
										</span>
										<input
											type="email"
											className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
											autoComplete="off"
											placeholder="contact@organization.com"
											name="email"
											value={formValues.email}
											onChange={handleChange}
										/>
										{formErrors.email && (
											<div className="invalid-feedback">
												{formErrors.email}
											</div>
										)}
									</div>
								</div>
								<div className="mb-3">
									<label className="form-label">Website</label>
									<div className="input-group">
										<span className="input-group-text">
											<RiGlobalLine size={16} />
										</span>
										<input
											type="url"
											className={`form-control ${formErrors.website ? 'is-invalid' : ''}`}
											autoComplete="off"
											placeholder="https://www.organization.com"
											name="website"
											value={formValues.website}
											onChange={handleChange}
										/>
										{formErrors.website && (
											<div className="invalid-feedback">
												{formErrors.website}
											</div>
										)}
									</div>
								</div>
								<div className="mb-3">
									<label className="form-label">GPS Coordinates</label>
									<input
										type="text"
										className="form-control"
										autoComplete="off"
										placeholder="GPS coordinates"
										name="gpsmapping"
										value={formValues.gpsmapping}
										onChange={handleChange}
									/>
								</div>
								<div className="mb-3">
									<label className="form-label">Region</label>
									<select
										className="form-select"
										name="region"
										autoComplete="off"
										value={formValues.region}
										onChange={handleChange}
									>
										<option value="">Select Region</option>
										{regions.map((region, index) => (
											<option key={index} value={region}>
												{region}
											</option>
										))}
									</select>
								</div>
								<div className="mb-3">
									<label className="form-label">Organization Type</label>
									<select
										className="form-select"
										name="type"
										autoComplete="off"
										value={formValues.type}
										onChange={handleChange}
									>
										<option value="">Select Type</option>
										<option value="hospital">Hospital</option>
										<option value="clinic">Clinic</option>
										<option value="research">Research Facility</option>
										<option value="laboratory">Laboratory</option>
										<option value="pharmacy">Pharmacy</option>
									</select>
								</div>
								<div className="d-flex justify-content-center mt-4 pt-3 border-top border-secondary-subtle">
									<button 
										type="submit"
										className="btn btn-primary btn-lg px-5 py-3 d-flex align-items-center gap-2"
									>
										<RiSaveLine size={20} />
										{organizationid ? "Update Organization" : "Add Organization"}
									</button>
								</div>
							</div>
						</div>
					</form>

					{/* Excel Import Modal */}
					<Modal show={showExcelModal} onHide={() => setShowExcelModal(false)} backdrop="static" keyboard={false} fullscreen>
						<Modal.Header closeButton>
							<Modal.Title className="d-flex align-items-center gap-2">
								<RiFileExcel2Line size={20} />
								{excelPreview ? "Preview Imported Data" : "Import Organizations from Excel"}
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
											onChange={handleExcelFileSelect}
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
											<li>Mobile</li>
											<li>Location</li>
											<li>Address</li>
											<li>Region</li>
											<li>Type</li>
										</ul>
									</div>
								</>
							) : (
								<>
									<div className="mb-3">
										<strong>Review the data below. Click 'Confirm & Save' to import, or 'Back' to select a different file.</strong>
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

					<ToastContainer theme="colored" position="top-center" className={'text-sm'} />
				</div>
			</div>
		</div>
	);
}
