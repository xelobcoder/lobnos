"use client";
import { useEffect, useState } from 'react';
import { customPost, customFetch, validatePin } from '../../../../../../components/Auth/customFetch';
import dynamic from 'next/dynamic';
import Indicator from '../../../../../../components/accessories/Reports/indicator';
import { useSearchParams } from 'next/navigation';
import Loader from '../../../../../../components/accessories/Loader';
import { toast } from 'react-toastify';
import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../../../../components/Auth/customFetch';
import { Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { RiFileTextLine, RiImageLine, RiUploadLine, RiDeleteBinLine, RiEyeLine, RiHistoryLine } from '@remixicon/react';
import AccessHistoryTab from './AccessHistoryTab';
import AccessRequestForm from './AccessRequestForm';
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../../components/accessories/markdownEditor'), { ssr: false });


interface Field {
	name: string;
	value: string;
}

interface SelectedFile {
	id: string;
	file: File;
	preview: string;
	name: string;
	size: number;
	type: string;
}

interface UploadedImage {
	id: number;
	name: string;
	size: number;
	url: string;
	uploadedAt: string;
}

interface ClinicalHistoryResponse {
	clinical_history: string;
	ascensionid: string;
}

export default function EnterResultUltrasound() {
	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const [fields, setFields] = useState<Field[]>([]);
	const [impression, setImpression] = useState("");
	const [clinicalHistory, setClinicalHistory] = useState("");
	const [testname, setTestName] = useState("");
	const [templateOptions, setTemplateOptions] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const scan = useSearchParams()?.get("scan");
	const testid = useSearchParams()?.get("testid");
	const update = useSearchParams()?.get("update");
	const urlpatientid = useSearchParams()?.get("ptid");
	const patientid = urlpatientid ? urlpatientid.slice(50) : urlpatientid;
	const urlbillingid = useSearchParams()?.get("csvid");
	const billingid = urlbillingid ? urlbillingid.slice(70) : urlbillingid;
	const ascensionid = useSearchParams()?.get("ascensionid");
	const [isLoading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [entered, setEnteredResult] = useState(false);
	const [activeTab, setActiveTab] = useState('result');

	// PIN state
	const [isPinUsed, setIsPinUsed] = useState(true);
	const [pin, setPin] = useState('');

	// Image upload state
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const fetchTemplates = async () => {
		try {
			const response = await customFetch(
				`result/entry/ultrasound/templates/list?page=1&count=10&employeeid=${employeeid}&testid=${testid}`
			);
			const options = response.map((item) => ({
				value: item.keyid,
				label: item.name,
				details: item,
			}));
			setTemplateOptions(options);
		} catch (error) {
			console.error('Failed to fetch templates:', error);
		}
	};

	const handleTemplateChange = async (selectedOption) => {
		setSelectedTemplate(selectedOption);

		if (selectedOption) {
			try {
				const response = await customFetch(
					`testpanel/list/ultrasound/get/template?templateid=${selectedOption.value}`
				);

				const updatedFields = response.fields.map((field) => ({
					name: field.field,
					value: field.value || "",
				}));

				setFields(updatedFields);

				const impressionField = response.fields.find((field) => field.field.toLowerCase() === "impression");
				if (impressionField) {
					setImpression(impressionField.value || "");
				}
			} catch (error) {
				console.error("Failed to fetch template details:", error);
			}
		} else {
			setFields([]);
			setImpression("");
		}
	};

	const handleResult = async () => {
		setSubmitting(true);
		try {
			const isUpdate = update === 'true';

			if (isUpdate && fields && Array.isArray(fields)) {
				const _one = fields[0]['employeeid'];
				if (_one !== user?.employeeid || user?.role != 'admin') {
					return toast.error("You are not authorized to update this result.");
				}
			}

			// Validate PIN if required
			if (isPinUsed) {
				const validation = await validatePin(user?.employeeid, pin);
				if (!validation.status) {
					toast.error(validation.message || "Invalid PIN");
					return;
				}
			}

			const myFields = fields.map((item: { name: string, value: string, id?: number, fieldid?: string }) => {
				const fieldid = item?.fieldid ? item.fieldid : item.id;
				return { field: item.name, value: item.value, fieldid: fieldid, originalvalue: item.value }
			});

			const pushContent = await customPost(`result/entry/customtest`, 'POST', {
				csvid: urlbillingid,
				testid,
				patientid: parseInt(patientid as string),
				test: scan,
				ptid: urlpatientid,
				comments: impression,
				fields: myFields,
				ascensionid,
				employeeid: user?.employeeid,
				isScan: true,
				target: "70,50",
				...(isPinUsed ? { pin } : {}),
			});

			const { status, statusCode, message } = pushContent;
			if (status === 'success' && statusCode === 200) {
				setEnteredResult(true);
				toast.success(message, { autoClose: 3000 });
			} else {
				toast.error(message, { autoClose: 3000 });
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};


	const handleSaveClinicalHistory = async () => {
		if (!clinicalHistory.trim() || clinicalHistory.trim().length < 5) {
			toast.error('Please enter at least 5 characters for clinical history');
			return;
		}

		const response = await customPost('ultrasound/chx', 'POST', { ascensionid, clinical_history: clinicalHistory });
		const { status, message } = response
		return status ? toast.success(message) : toast.error(message);
	}

	// Image upload functions
	const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		const filePromises = Array.from(files).map(async (file) => {
			const preview = URL.createObjectURL(file);
			return {
				id: `${Date.now()}-${Math.random()}`,
				file,
				preview,
				name: file.name,
				size: file.size,
				type: file.type,
			};
		});

		const newSelectedFiles = await Promise.all(filePromises);
		setSelectedFiles(prev => [...prev, ...newSelectedFiles]);

		// Clear the input
		event.target.value = '';
	};

	const handleRemoveSelectedFile = (fileId: string) => {
		setSelectedFiles(prev => {
			const fileToRemove = prev.find(f => f.id === fileId);
			if (fileToRemove) {
				URL.revokeObjectURL(fileToRemove.preview);
			}
			return prev.filter(f => f.id !== fileId);
		});
	};

	const handleUploadSelectedFiles = async () => {
		if (selectedFiles.length === 0) return;

		setUploadingImages(true);
		setUploadProgress(0);

		try {
			const uploadPromises = selectedFiles.map(async (selectedFile, index) => {
				const formData = new FormData();
				formData.append('image', selectedFile.file);
				formData.append('ascensionid', ascensionid || '');
				formData.append('testid', testid || '');
				formData.append('patientid', patientid || '');

				const response = await customPost('ultrasound/images/upload', 'POST', formData);

				return {
					id: Date.now() + index,
					name: selectedFile.name,
					size: selectedFile.size,
					url: response.url || selectedFile.preview,
					uploadedAt: new Date().toISOString(),
				};
			});

			// Update progress
			const totalFiles = selectedFiles.length;
			let completedUploads = 0;

			const progressPromises = uploadPromises.map(async (promise) => {
				const result = await promise;
				completedUploads++;
				setUploadProgress(Math.round((completedUploads / totalFiles) * 100));
				return result;
			});

			const uploadedFiles = await Promise.all(progressPromises);

			// Clean up previews
			selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));

			setUploadedImages(prev => [...prev, ...uploadedFiles]);
			setSelectedFiles([]);
			toast.success(`${uploadedFiles.length} image(s) uploaded successfully`);
		} catch (error) {
			console.error('Upload failed:', error);
			toast.error('Failed to upload images');
		} finally {
			setUploadingImages(false);
			setUploadProgress(0);
		}
	};

	const handleDeleteImage = async (imageId) => {
		try {
			await customPost('ultrasound/images/delete', 'DELETE', { imageId });
			setUploadedImages(prev => prev.filter(img => img.id !== imageId));
			toast.success('Image deleted successfully');
		} catch (error) {
			console.error('Delete failed:', error);
			toast.error('Failed to delete image');
		}
	};

	const fetchUploadedImages = async () => {
		try {
			const response = await customFetch(`ultrasound/images/${ascensionid}`);
			if (response && Array.isArray(response)) {
				setUploadedImages(response);
			}
		} catch (error) {
			console.error('Failed to fetch images:', error);
		}
	};



	useEffect(() => {
		setLoading(true);
		const gettingFields = async () => {
			try {
				const commentsFetch = customFetch(
					`testpanel/list/customtestrule/previous/comments?testid=${testid}&&csvid=${urlbillingid}&&ptid=${urlpatientid}`
				);

				const testResultFetch = customFetch(
					`testpanel/list/customtestrule/previous?testid=${testid}&&ptid=${urlpatientid}&&csvid=${urlbillingid}`
				);


				const clinicalHistoryFetch = customFetch(`ultrasound/chx/ascension/${ascensionid}`);

				const [resultResponse, commentsResponse, clinicalHistoryResponse] = await Promise.all([testResultFetch, commentsFetch, clinicalHistoryFetch]);

				const updatesResultForm = (data: { testname: string; result: Field[] }) => {
					const { testname, result } = data;
					if (result && Array.isArray(result)) {
						setFields(result);
						const hasAnyValueEntered = result.some((item) => item?.value !== "");
						setEnteredResult(hasAnyValueEntered);
					}
					testname && setTestName(testname);
				};

				const updatesCommentsForm = (data) => {
					setImpression(data.comments);
				};

				const updatesClinicalHistoryForm = (data: ClinicalHistoryResponse) => {
					if (data && data.clinical_history && data.ascensionid) {
						setClinicalHistory(data.clinical_history);
					}
				};

				updatesResultForm(resultResponse);
				updatesCommentsForm(commentsResponse);
				updatesClinicalHistoryForm(clinicalHistoryResponse);
				setLoading(false);
			} catch (err) {
				console.log(err);
				setFields([]);
				setImpression("");
			}
		};
		if (urlbillingid && urlpatientid && ascensionid) {
			gettingFields();
			fetchUploadedImages();
		}
		fetchTemplates();
	}, [urlbillingid, urlpatientid, ascensionid, scan]);

	useEffect(() => {
		return () => {
			// Cleanup object URLs on unmount
			selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
		};
	}, [selectedFiles]);

	const handleFieldChange = (data, index: number) => {
		const previous = [...fields];
		previous[index].value = data;
		setFields(previous);
	};

	if (isLoading) return <Loader />;

	return (
		<div className="d-flex justify-content-between">
			<div className="mt-2 col-2 px-2">
				<PreviewPatientInformation patientid={patientid} />
				<div className="list-group pls-color br-5 mt-3">
					<div className="list-group-item fw-bold text-uppercase bg-body-secondary pls-color">Clinical History</div>
					<div className="list-group-item">
						<textarea
							className="form-control"
							rows={5}
							value={clinicalHistory}
							onChange={(e) => setClinicalHistory(e.target.value)}
							placeholder="Enter clinical history here"
						/>
					</div>
					<div className="list-group-item">
						<button
							onClick={handleSaveClinicalHistory}
							className="btn btn-primary btn-sm"
							disabled={submitting}
						>
							{submitting ? "Saving..." : "Save Clinical History"}
						</button>
					</div>
				</div>
			</div>
			<div className="col-10 px-2">
				<Tabs activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)} id="ultrasound-tabs" className="mb-3">
					<Tab eventKey="result" title={<span><RiFileTextLine className="me-2" />Result Entry</span>}>
						<div>
							<div className="d-flex justify-content-between bg-secondary-subtle br-5 my-2 p-2">
								<div>
									<h5 className="d-flex my-2 mx-4 text-uppercase">{testname}</h5>
								</div>
								<div>
									<div>
										<Select
											options={templateOptions}
											onChange={handleTemplateChange}
											styles={reactSelectCustomStyles}
											placeholder="Select a Template"
											className='pls-color'
											isClearable
										/>
									</div>
								</div>
							</div>
							<div>
								{Array.isArray(fields) && fields.length > 0 && fields.map((item, index) => (
									<div className="my-3 list-group" key={index}>
										<div className="fw-bold pls-color list-group-item bg-secondary-subtle">{item.name}</div>
										<div className="list-group-item">
											<MARKDOWN_EDITOR updatedata={(ev, data) => handleFieldChange(data, index)} initialData={item.value} />
										</div>
									</div>
								))}
								<div className="list-group pls-color br-5">
									<div className="list-group-item fw-bold text-uppercase bg-body-secondary pls-color">Impression</div>
									<div className="list-group-item">
										<MARKDOWN_EDITOR updatedata={(ev, data) => setImpression(data)} initialData={impression || "Impression Here"} />
									</div>
								</div>
								<div className="d-flex flex-column flex-md-row justify-content-between mt-2">
									{isPinUsed && (
										<div className="mb-2 mb-md-0">
											<input
												className="custom-input"
												type="password"
												placeholder="Enter pin here"
												style={{ fontSize: '0.85rem', height: 28, padding: '2px 6px' }}
												value={pin}
												autoComplete="off"
												autoCorrect="off"
												onChange={e => setPin(e.target.value)}
											/>
										</div>
									)}
									<div>
										<button
											onClick={handleResult}
											className="btn btn-primary btn-sm"
											disabled={submitting}
										>
											{submitting ? "Submitting..." : "Save Result"}
										</button>
									</div>
								</div>
							</div>
						</div>
					</Tab>
					<Tab eventKey="images" title={<span><RiImageLine className="me-2" />Image Upload</span>}>
						<div>
							{/* File Selection Area */}
							<div className="list-group pls-color br-5 mb-3">
								<div className="list-group-item fw-bold text-uppercase bg-body-secondary pls-color d-flex justify-content-between align-items-center">
									<span><RiUploadLine className="me-2" />Select Images to Upload</span>
									{selectedFiles.length > 0 && (
										<button
											className="btn btn-light btn-sm"
											onClick={handleUploadSelectedFiles}
											disabled={uploadingImages}
										>
											<RiUploadLine className="me-1" />
											Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}
										</button>
									)}
								</div>
								<div className="list-group-item">
									<div className="mb-3">
										<label className="form-label fw-bold">Choose Images</label>
										<input
											type="file"
											className="form-control"
											multiple
											accept="image/*"
											onChange={handleFileSelection}
											disabled={uploadingImages}
										/>
										<div className="form-text">
											Select multiple images at once. You can preview and remove them before uploading.
										</div>
									</div>

									{uploadingImages && (
										<div className="mb-3">
											<div className="d-flex justify-content-between mb-1">
												<small>Uploading {selectedFiles.length} images...</small>
												<small>{uploadProgress}%</small>
											</div>
											<ProgressBar now={uploadProgress} animated />
										</div>
									)}
								</div>
							</div>

							{/* Selected Files Preview */}
							{selectedFiles.length > 0 && (
								<div className="list-group pls-color br-5 mb-3">
									<div className="list-group-item fw-bold text-uppercase bg-info text-white">
										<RiImageLine className="me-2" />Selected Images ({selectedFiles.length})
									</div>
									<div className="list-group-item">
										<div className="row">
											{selectedFiles.map((file) => (
												<div className="col-md-3 mb-3" key={file.id}>
													<div className="position-relative" style={{ border: '1px solid #dee2e6', borderRadius: '5px', overflow: 'hidden' }}>
														<button
															className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
															style={{ zIndex: 10 }}
															onClick={() => handleRemoveSelectedFile(file.id)}
														>
															×
														</button>
														<img
															src={file.preview}
															alt={file.name}
															className="img-fluid"
															style={{ height: '120px', width: '100%', objectFit: 'cover' }}
														/>
														<div className="p-2">
															<div className="small fw-bold text-truncate mb-1" title={file.name}>
																{file.name}
															</div>
															<div className="small text-muted">
																{(file.size / 1024 / 1024).toFixed(2)} MB
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Uploaded Images */}
							<div className="list-group pls-color br-5">
								<div className="list-group-item fw-bold text-uppercase bg-secondary text-white">
									<RiImageLine className="me-2" />Uploaded Images ({uploadedImages.length})
								</div>
								<div className="list-group-item">
									{uploadedImages.length === 0 ? (
										<p className="text-muted text-center mb-0">No images uploaded yet.</p>
									) : (
										<div className="row">
											{uploadedImages.map((image) => (
												<div className="col-md-3 mb-3" key={image.id}>
													<div style={{ border: '1px solid #dee2e6', borderRadius: '5px', overflow: 'hidden' }}>
														<img
															src={image.url}
															alt={image.name}
															className="img-fluid"
															style={{ height: '120px', width: '100%', objectFit: 'cover' }}
														/>
														<div className="p-2">
															<div className="small fw-bold text-truncate mb-2" title={image.name}>
																{image.name}
															</div>
															<div className="small text-muted mb-2">
																{(image.size / 1024 / 1024).toFixed(2)} MB
															</div>
															<div className="d-flex justify-content-between">
																<button
																	className="btn btn-outline-primary btn-sm"
																	onClick={() => window.open(image.url, '_blank')}
																>
																	<RiEyeLine />
																</button>
																<button
																	className="btn btn-outline-danger btn-sm"
																	onClick={() => handleDeleteImage(image.id)}
																>
																	<RiDeleteBinLine />
																</button>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</Tab>
					<Tab eventKey="access" title={<span><RiFileTextLine className="me-2" />Access Request</span>}>
						<AccessRequestForm
							ascensionid={ascensionid}
							testid={testid}
							patientid={patientid}
							employeeid={employeeid}
						/>
					</Tab>
					<Tab eventKey="access-history" title={<span><RiHistoryLine className="me-2" />Access History</span>}>
						<AccessHistoryTab employeeid={employeeid} ascensionid={ascensionid} shouldLoad={activeTab === 'access-history'} />
					</Tab>
				</Tabs>
			</div>
		</div>
	);
}
