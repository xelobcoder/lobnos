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
import { Tabs, Tab } from 'react-bootstrap';
import { RiFileTextLine, RiImageLine, RiHistoryLine } from '@remixicon/react';
import AccessHistoryTab from './AccessHistoryTab';
import AccessRequestForm from './AccessRequestForm';
import ImageUploadTab from './ImageUploadTab';
import { plsEncryption } from '../../../../../../lib/encryption';
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
	const [entered, setEnteredResult] = useState(false);
	const [activeTab, setActiveTab] = useState('result');

	// PIN state
	const [isPinUsed, setIsPinUsed] = useState(true);
	const [pin, setPin] = useState('');

	// Template loading state
	const [isTemplateLoading, setIsTemplateLoading] = useState(false);

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
									<h5 className="d-flex my-2 mx-4 text-uppercase">{testname} </h5>
								</div>
								<div>
									<div className="d-flex align-items-center">
										<Select
											options={templateOptions}
											onChange={handleTemplateChange}
											styles={reactSelectCustomStyles}
											placeholder="Select a Template"
											className='pls-color'
											isClearable
											isDisabled={isTemplateLoading}
										/>
										{isTemplateLoading && (
											<div className="ms-2">
												<div className="spinner-border spinner-border-sm" role="status">
													<span className="visually-hidden">Loading...</span>
												</div>
											</div>
										)}
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
											disabled={submitting || isTemplateLoading}
										>
											{submitting ? "Submitting..." : "Save Result"}
										</button>
									</div>
								</div>
							</div>
						</div>
					</Tab>
					<Tab eventKey="images" title={<span><RiImageLine className="me-2" />Image Upload</span>}>
						<ImageUploadTab ascensionid={ascensionid} testid={testid} patientid={patientid} />
					</Tab>
					<Tab eventKey="access" title={<span><RiFileTextLine className="me-2" />Access Request</span>}>
						<AccessRequestForm
							ascensionid={ascensionid as string}
							testid={testid as string}
							patientid={patientid as string}
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
