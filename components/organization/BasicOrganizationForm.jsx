import styles from "./OrganizationWorkspace.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { regions, organizationDefaultBasicInfo, customFetch, customFile, customPost, validateFormData } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from "next/navigation";
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
	border-color: var(--pls-primary, #2e7d32);
  }
  
  .image-upload-area.dragging {
	border-color: #0d6efd;
	background: var(--bs-tertiary-bg, #f5f8f6);
  }
`;


export default function OrganizationBasicForm({ organizationid }) {
	const router = useRouter();
	const [data, setData] = useState(organizationDefaultBasicInfo);
	const [message, setMessage] = useState("Add new organization");
	const [isloading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [dragging, setDragging] = useState(false);
	const [formValues, setFormValues] = useState(organizationDefaultBasicInfo);
	const [formErrors, setFormErrors] = useState({});
	const [saving, setSaving] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);
	const [showPostCreateModal, setShowPostCreateModal] = useState(false);
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
				if (statusCode === 200 && status === "success" && Array.isArray(result) && result.length > 0) {
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
		const imageUrl = `/api/organization-logo?id=${organizationid}&v=${Date.now()}`;
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
		setFormValues(previous => ({...previous, [name]: value}));
		setFormErrors(previous => ({...previous, [name]: undefined}));
	};

	const resetFormForNewOrganization = () => {
		setFormValues(organizationDefaultBasicInfo);
		setFormErrors({});
		setSelectedImage(null);
	};

	const handleAddAnother = () => {
		resetFormForNewOrganization();
		setShowPostCreateModal(false);
	};

	const handleViewOrganizationList = () => {
		setShowPostCreateModal(false);
		router.push("/organization");
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		if (saving) return;
		setFormErrors({});
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
			const { status, message, statusCode } = response || {};
			if (status === "exist") {
				setFormErrors({name: message || 'An organization with this name already exists.'});
				return toast.warning(message);
			}

			const isSuccessfulCreate = status === "success" || status == "created" || status === true || statusCode === 200;
			if (isSuccessfulCreate) {
				toast.success(message || "Organization created successfully");
				setShowPostCreateModal(true);
				return;
			}

			if (response?.field) setFormErrors({[response.field]: message});
			toast.error(message || 'Unable to create organization');
		}
		try {
			setSaving(true);
			if (!organizationid) {
				await validateFormData(updatedFormValues, false, ["name", "mobile"], "new/organizations", handleResponseCallBack);
			} else {
				const updateInfo = await customPost("organization/update/basic", "PUT", updatedFormValues);
				if (updateInfo?.status === true) toast.success(updateInfo.message || 'Organization updated');
				else {
					if (updateInfo?.field) setFormErrors({[updateInfo.field]: updateInfo.message});
					toast.error(updateInfo?.message || updateInfo?.error || 'Unable to save organization');
				}
			}
		} catch (err) {
			toast.error('Unable to save the organization. Please try again.');
		} finally { setSaving(false); }
	};

	const uploadImageCall = async (file) => {
        if (!file || logoUploading) return;
        if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            toast.error('Choose a PNG or JPEG image up to 5 MB.'); return;
        }
        setLogoUploading(true);
        try {
            const body = new FormData(); body.append('organizations', file);
            const response = await customFile(`organization/profile/image?id=${organizationid}`, body);
            if (response?.status !== true) throw new Error(response?.message || 'Unable to upload logo');
            loadOrganizationImage(); toast.success('Organization logo saved');
        } catch (error) { toast.error(error.message || 'Unable to upload logo'); }
        finally { setLogoUploading(false); }
    };
    const handleImageUpload = async (event) => {
        const file = event.target.files[0]; event.target.value = ''; await uploadImageCall(file);
    };
    const handleDrop = async (event) => {
        event.preventDefault(); setDragging(false); await uploadImageCall(event.dataTransfer.files[0]);
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
			if (response && response.header && response.validation) {
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
		const filteredData = excelPreview.validation.filter((_, index) => !selectedRows.includes(index));

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
			const saveResponse = await customPost('organization/bulk/registration', 'POST', {
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

		if (selectedRows.length === excelPreview.validation.length) {
			// If all rows are selected, deselect all
			setSelectedRows([]);
		} else {
			// Select all rows
			setSelectedRows(excelPreview.validation.map((_, index) => index));
		}
	};

	const handleRemoveSelected = () => {
		if (!excelPreview || selectedRows.length === 0) return;

		const newValidation = excelPreview.validation.filter((_, index) => !selectedRows.includes(index));
		setExcelPreview({
			...excelPreview,
			validation: newValidation
		});
		setSelectedRows([]);
	};

    const inputField = (name, label, type, placeholder, required = false) => <div className={styles.field}>
        <label htmlFor={`organization-${name}`}>{label}{required ? ' *' : ''}</label>
        <input id={`organization-${name}`} name={name} type={type} placeholder={placeholder} value={formValues[name] ?? ''} onChange={handleChange}
            aria-required={required} aria-invalid={Boolean(formErrors[name])} aria-describedby={formErrors[name] ? `organization-${name}-error` : undefined}/>
        {formErrors[name] && <span id={`organization-${name}-error`} className={styles.rowError} role="alert">{formErrors[name]}</span>}
    </div>;

	if (isloading) return (
		<div className={styles.form}>
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
		<div className={styles.form}>
			<style>{customStyles}</style>

			<div className={styles.formHeader}>
				<h2 className="d-flex align-items-center gap-2 mb-0">
					<RiBuildingLine size={20} />
					{organizationid ? "Organization details" : "Contact and location details"}
				</h2>
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

            <div className={styles.editorShell}><div>
                <form onSubmit={onSubmit} autoComplete="off" noValidate>
                    <div className={styles.editorGrid}>
                        <div className={styles.formSections}>
                            <section className={styles.panel} aria-labelledby="organization-identity-heading">
                                <h3 id="organization-identity-heading">Identity and contact</h3>
                                <p className={styles.sectionHelp}>Use the organization’s own details. Contact numbers and email addresses must be unique within your facility.</p>
                                <div className={styles.fields}>
                                    {inputField('name', 'Organization name', 'text', 'Enter organization name', true)}
                                    <div className={styles.field}><label htmlFor="organization-type">Organization type</label><select id="organization-type" name="type" value={formValues.type ?? ''} onChange={handleChange}><option value="">Select type</option>{[['hospital','Hospital'],['clinic','Clinic'],['research','Research facility'],['laboratory','Laboratory'],['pharmacy','Pharmacy']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
                                    {inputField('mobile', 'Contact number', 'tel', '0201234567', true)}
                                    {inputField('email', 'Email address', 'email', 'contact@organization.com')}
                                    {inputField('website', 'Website', 'url', 'https://example.com')}
                                </div>
                            </section>
                            <section className={styles.panel} aria-labelledby="organization-location-heading">
                                <h3 id="organization-location-heading">Location</h3><p className={styles.sectionHelp}>Add the details staff need to identify and contact this partner.</p>
                                <div className={styles.fields}>
                                    {inputField('location', 'Location', 'text', 'City or district')}
                                    <div className={styles.field}><label htmlFor="organization-region">Region</label><select id="organization-region" name="region" value={formValues.region ?? ''} onChange={handleChange}><option value="">Select region</option>{regions.map(region=><option key={region} value={region}>{region}</option>)}</select></div>
                                    {inputField('street', 'Street address', 'text', 'Street name and number')}
                                    {inputField('gpsmapping', 'GPS coordinates', 'text', 'GPS coordinates')}
                                    <div className={`${styles.field} ${styles.spanAll}`}><label htmlFor="organization-address">Full address</label><textarea id="organization-address" name="address" rows={2} value={formValues.address ?? ''} onChange={handleChange}/></div>
                                </div>
                            </section>
                        </div>
                        <aside className={`${styles.summary} ${styles.panel}`} aria-label="Organization summary">
                            <div><span className={styles.eyebrow}>PARTNER PROFILE</span><h3>{formValues.name || 'New organization'}</h3></div>
                            {organizationid ? <div>
                                <label className={`${styles.logoDrop} ${dragging ? styles.logoDragging : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
                                    {selectedImage ? <img src={selectedImage} alt="Organization logo" onError={()=>setSelectedImage(null)}/> : <RiBuildingLine size={36} aria-hidden="true"/>}
                                    <span>{logoUploading ? 'Uploading logo…' : 'Choose or drop a logo'}</span>
                                    <input className="visually-hidden" aria-label="Upload organization logo" type="file" accept="image/png,image/jpeg" onChange={handleImageUpload} disabled={logoUploading}/>
                                </label>
                                <p className={styles.help}>PNG or JPEG · up to 5 MB</p>
                            </div> : <p className={styles.help}>Save the organization first to upload its logo and add contact people or payment arrangements.</p>}
                            <dl><div><dt>Contact</dt><dd>{formValues.mobile || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{formValues.email || 'Not provided'}</dd></div><div><dt>Location</dt><dd>{formValues.location || 'Not provided'}</dd></div></dl>
                        </aside>
                    </div>
                    <div className={styles.saveBar}><span className={styles.help}>* Required fields</span><button type="submit" className={styles.primary} disabled={saving || logoUploading}><RiSaveLine size={18} aria-hidden="true"/>{saving ? 'Saving…' : organizationid ? 'Save changes' : 'Create organization'}</button></div>
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
										<strong>Review the data below. Click Confirm & Save to import, or Back to select a different file.</strong>
									</div>

									{excelPreview.validation && excelPreview.validation.length > 0 && (
										<div className="mb-3 d-flex gap-2 align-items-center">
											<button
												type="button"
												className="btn btn-sm btn-outline-primary"
												onClick={handleSelectAll}
											>
												{selectedRows.length === excelPreview.validation.length ? 'Deselect All' : 'Select All'}
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
												{excelPreview.validation.length} total rows
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
															checked={excelPreview.validation && selectedRows.length === excelPreview.validation.length && excelPreview.validation.length > 0}
															onChange={handleSelectAll}
														/>
													</th>
													{excelPreview.header && excelPreview.header.map((header, index) => (
														<th key={index}>{header}</th>
													))}
												</tr>
											</thead>
											<tbody>
												{excelPreview.validation && excelPreview.validation.map((row, rowIndex) => (
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

					<Modal show={showPostCreateModal} onHide={() => setShowPostCreateModal(false)} centered>
						<Modal.Header closeButton>
							<Modal.Title>Organization Created Successfully</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Do you want to add a new organization or view organizations list?
						</Modal.Body>
						<Modal.Footer>
							<Button variant="outline-primary" onClick={handleAddAnother}>
								Add New
							</Button>
							<Button variant="primary" onClick={handleViewOrganizationList}>
								View List
							</Button>
						</Modal.Footer>
					</Modal>

					<ToastContainer theme="colored" position="top-center" className={'text-sm'} />
				</div>
			</div>
		</div>
	);
}
