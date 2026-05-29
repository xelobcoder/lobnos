"use client";
import { useEffect, useState } from 'react';
import { customPost, customFetch, validatePin, generateRandomTextAndNumbers } from '../../../../../../components/Auth/customFetch';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Loader from '../../../../../../components/accessories/Loader';
import { toast } from 'react-toastify';
import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../../../../components/Auth/customFetch';
import { RiFileTextLine, RiImageLine, RiHistoryLine, RiFileList2Line } from '@remixicon/react';
import AccessHistoryTab from './AccessHistoryTab';
import AccessRequestForm from './AccessRequestForm';
import ImageUploadTab from './ImageUploadTab';
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../../components/accessories/markdownEditor'), { ssr: false });


interface Field {
	name: string;
	value: string;
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
	const scan = useSearchParams()?.get("scan") ?? null;
	const testid = useSearchParams()?.get("testid") ?? null;
	const update = useSearchParams()?.get("update") ?? null;
	const urlpatientid = useSearchParams()?.get("ptid") ?? null;
	const patientid = urlpatientid ? urlpatientid.slice(50) : urlpatientid;
	const urlbillingid = useSearchParams()?.get("csvid") ?? null;
	const billingid = urlbillingid ? urlbillingid.slice(70) : urlbillingid;
	const ascensionid = useSearchParams()?.get("ascensionid") ?? null;
	const [isLoading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [viewAllTemplates, setViewAllTemplates] = useState(false);
	const [entered, setEnteredResult] = useState(false);
	const [activeSection, setActiveSection] = useState<'result' | 'clinical' | 'images' | 'access' | 'access-history'>('result');

	// PIN state
	const [isPinUsed, setIsPinUsed] = useState(true);
	const [pin, setPin] = useState('');

	// Template loading state
	const [isTemplateLoading, setIsTemplateLoading] = useState(false);

	const fetchTemplates = async () => {
		try {

			const url = viewAllTemplates ?
				`result/entry/ultrasound/templates/list?page=1&count=1000&employeeid=${employeeid}`
				:
				`result/entry/ultrasound/templates/list?page=1&count=100&employeeid=${employeeid}&&testid=${testid}`;
			const response = await customFetch(url);
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
		setIsTemplateLoading(true);

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
				toast.error("Failed to load template");
			} finally {
				setIsTemplateLoading(false);
			}
		} else {
			setFields([]);
			setImpression("");
			setIsTemplateLoading(false);
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
				if (validation?.status !== true) {
					toast.error(validation?.message || "Invalid PIN");
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

				if (statusCode == 500 && message == "Edit window period has elapsed, you can no longer edit this result") {
					const confimation = window.confirm("Your edit window has elapsed. Do you want to request access to edit this result?");
					if (confimation) {
						// redirect to request access page
						window.open(`/operations/imaging/ultrasound/access-request?ascensionid=${ascensionid}${patientid ? `&patientid=${generateRandomTextAndNumbers(50) + patientid}` : ''}`, '_blank');
					}
				}
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
		}
		fetchTemplates();
	}, [urlbillingid, urlpatientid, ascensionid, scan]);

	const handleFieldChange = (data, index: number) => {
		const previous = [...fields];
		previous[index].value = data;
		setFields(previous);
	};

	if (isLoading) return <Loader />;

	return (
		<div>
			<PreviewPatientInformation patientid={patientid} compact />
			<div className="mt-3 card">
				<div className="card-body p-0">
					<div className="row g-0">
						<div className="col-12 col-lg-3 border-end">
							<div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between bg-body-tertiary">
								<div className="fw-semibold">Sections</div>
								<span className={`badge ${entered ? 'bg-success' : 'bg-secondary'}`}>{entered ? 'Saved' : 'Draft'}</span>
							</div>
							<div className="p-3">
								<div className="list-group">
									<button type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeSection === 'result' ? 'active' : ''}`} onClick={() => setActiveSection('result')}>
										<RiFileTextLine /> Result Entry
									</button>
									<button type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeSection === 'clinical' ? 'active' : ''}`} onClick={() => setActiveSection('clinical')}>
										<RiFileList2Line /> Clinical History
									</button>
									<button type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeSection === 'images' ? 'active' : ''}`} onClick={() => setActiveSection('images')}>
										<RiImageLine /> Image Upload
									</button>
									<button type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeSection === 'access' ? 'active' : ''}`} onClick={() => setActiveSection('access')}>
										<RiFileTextLine /> Access Request
									</button>
									<button type="button" className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeSection === 'access-history' ? 'active' : ''}`} onClick={() => setActiveSection('access-history')}>
										<RiHistoryLine /> Access History
									</button>
								</div>
							</div>
						</div>

						<div className="col-12 col-lg-6 border-end">
							<div className="px-3 py-2 border-bottom bg-body-tertiary d-flex align-items-center justify-content-between">
								<div className="fw-semibold text-uppercase">{testname || scan || 'Ultrasound'}</div>
								<div className="text-muted" style={{ fontSize: '0.85rem' }}>Ascension: {ascensionid || 'N/A'}</div>
							</div>
							<div className="p-3">
								{activeSection === 'clinical' ? (
									<div className="list-group pls-color br-5">
										<div className="list-group-item fw-bold text-uppercase bg-body-secondary pls-color">Clinical History</div>
										<div className="list-group-item">
											<textarea
												className="form-control"
												rows={8}
												value={clinicalHistory}
												onChange={(e) => setClinicalHistory(e.target.value)}
												placeholder="Enter clinical history here"
											/>
										</div>
										<div className="list-group-item d-flex justify-content-end">
											<button
												onClick={handleSaveClinicalHistory}
												className="btn btn-primary btn-sm"
												disabled={submitting}
											>
												{submitting ? "Saving..." : "Save Clinical History"}
											</button>
										</div>
									</div>
								) : activeSection === 'images' ? (
									<ImageUploadTab ascensionid={ascensionid} testid={testid} patientid={patientid} />
								) : activeSection === 'access' ? (
									<AccessRequestForm
										ascensionid={ascensionid as string}
										testid={testid as string}
										patientid={patientid as string}
										employeeid={employeeid}
									/>
								) : activeSection === 'access-history' ? (
									<AccessHistoryTab employeeid={employeeid} ascensionid={ascensionid} shouldLoad={activeSection === 'access-history'} />
								) : (
									<div>
										{Array.isArray(fields) && fields.length > 0 && fields.map((item, index) => (
											<div className="my-3 list-group" key={index}>
												<div className="fw-bold pls-color list-group-item bg-secondary-subtle">{item.name}</div>
												<div className="list-group-item">
													<MARKDOWN_EDITOR updatedata={(ev, data) => handleFieldChange(data, index)} initialData={item.value} />
												</div>
											</div>
										))}

									</div>
								)}
							</div>
						</div>

						<div className="col-12 col-lg-3">
							<div className="px-3 py-2 border-bottom bg-body-tertiary d-flex align-items-center justify-content-between">
								<div className="fw-semibold">Controls</div>

								<button className="btn btn-sm btn-outline-secondary" onClick={fetchTemplates} disabled={isTemplateLoading}>
									Refresh
								</button>

							</div>
							<div className="p-3">
								{activeSection === 'result' ? (
									<>
										<div className="mb-2 fw-semibold">Template</div>
										<div className="d-flex align-items-center gap-2 mb-2">
											<input type='checkbox' checked={viewAllTemplates} onChange={(ev) => { setViewAllTemplates(ev.target.checked) }} />
											<div className="text-muted" style={{ fontSize: '0.85rem' }}>View all templates</div>
										</div>
										<Select
											options={templateOptions}
											onChange={handleTemplateChange}
											styles={reactSelectCustomStyles}
											placeholder="Select a Template"
											defaultInputValue=''

											autoFocus={false}
											className='pls-color'
											value={selectedTemplate || ''}
											isClearable
											tabIndex={4}
											isDisabled={isTemplateLoading}
										/>
										{isTemplateLoading ? (
											<div className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
												Loading template...
											</div>
										) : null}
										<hr />
										<div className="mb-2 fw-semibold">Save</div>
										{isPinUsed && (
											<div className="mb-2">
												<input
													className="custom-input w-100"
													type="password"
													placeholder="Enter pin here"
													style={{ fontSize: '0.9rem', height: 34, padding: '6px 10px' }}
													value={pin}
													autoComplete="off"
													autoCorrect="off"
													onChange={e => setPin(e.target.value)}
												/>
											</div>
										)}
										<button
											onClick={handleResult}
											className="btn btn-primary w-100"
											disabled={submitting || isTemplateLoading}
										>
											{submitting ? "Submitting..." : "Save Result"}
										</button>

										<button
											className="btn btn-primary w-100 mt-3"
											onClick={(ev) => {
												const billing_id = `${generateRandomTextAndNumbers(70)}${billingid}`;
												const patientid_id = `${generateRandomTextAndNumbers(50)}${patientid}`;
												window.open(`/result/labreport/4?isScan=true&&csvid=${billing_id}&&ptid=${patientid_id}&&target=70,50&&ascensionId=${ascensionid}&&testname=${testname}&&testid=${testid}&&isUltrasound=true&&isMultiple=false&&password&&is_password_encrypted=false&isOpenSideBarShow=false`, "_blank");
											}}
										>
											Print Report
										</button>
									</>
								) : (
									<div className="text-muted" style={{ fontSize: '0.9rem' }}>
										Select “Result Entry” to edit and save the report.
									</div>
								)}
								<hr />
								<div className="text-muted" style={{ fontSize: '0.85rem' }}>
									Test ID: {testid || 'N/A'}<br />
									Billing ID: {billingid || 'N/A'}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
