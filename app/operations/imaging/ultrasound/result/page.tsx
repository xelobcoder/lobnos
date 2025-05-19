"use client";
import { useEffect, useState } from 'react';
import { customPost, customFetch } from '../../../../../components/Auth/customFetch';
import Indicator from '../../../../../components/accessories/Reports/indicator';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Loader from '../../../../../components/accessories/Loader';
import { toast } from 'react-toastify';
import PreviewPatientInformation from '../../../../../components/petientsComponent/PreviewPatientInformation';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../../../components/Auth/customFetch';

const MARKDOWN_EDITOR = dynamic(() => import('../../../../../components/accessories/markdownEditor'), { ssr: false });

interface Field {
    name: string;
    value: string;
}

export default function EnterResultUltrasound() {
	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const [fields, setFields] = useState<Field[]>([]);
	const [impression, setImpression] = useState("");
	const [testname, setTestName] = useState("");
	const [templateOptions, setTemplateOptions] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const scan = useSearchParams()?.get("scan");
	const testid = useSearchParams()?.get("testid");
	const urlpatientid = useSearchParams()?.get("ptid");
	const patientid = urlpatientid ? urlpatientid.slice(50) : urlpatientid;
	const urlbillingid = useSearchParams()?.get("csvid");
	const billingid = urlbillingid ? urlbillingid.slice(70) : urlbillingid;
	const ascensionid = useSearchParams()?.get("ascensionid");
	const [isLoading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [entered, setEnteredResult] = useState(false);

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
			const myFields = fields.map((item:{name:string,value:string}) => ({ field: item.name, value: item.value }));
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
			});

			const { status, statusCode, message } = pushContent;
			if (status === 'success' && statusCode === 200) {
				setEnteredResult(true);
				toast.success(message, { autoClose: 500 });
			} else {
				toast.error(message, { autoClose: 500 });
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setSubmitting(false);
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

				const [resultResponse, commentsResponse] = await Promise.all([testResultFetch, commentsFetch]);

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

				updatesResultForm(resultResponse);
				updatesCommentsForm(commentsResponse);
				setLoading(false);
			} catch (err) {
				console.log(err);
				setFields([]);
				setImpression("");
			}
		};
		if (urlbillingid && urlpatientid && ascensionid) gettingFields();
		fetchTemplates();
	}, [urlbillingid, urlpatientid, ascensionid, scan]);

	const handleFieldChange = (data, index:number) => {
		const previous = [...fields];
		previous[index].value = data;
		setFields(previous);
	};

	if (isLoading) return <Loader />;

	return (
		<div className="d-flex justify-content-between">
		<div className="mt-2 col-2 px-2">
			<PreviewPatientInformation patientid={patientid} />
		</div>
		<div className="col-10 px-2">
			<div>
				<div className="d-flex  justify-content-between bg-secondary-subtle br-5 my-2 p-2">
					<div >
						<h5 className="d-flex my-2 mx-4 text-uppercase">{testname} <Indicator resultEntered={entered} /></h5>
					</div>
					<div >
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
					<button
						onClick={handleResult}
						className="btn btn-primary btn-sm mt-2"
						disabled={submitting}
					>
						{submitting ? "Submitting..." : "Save Result"}
					</button>
				</div>
			</div>
		</div>
	</div>
	);
}
