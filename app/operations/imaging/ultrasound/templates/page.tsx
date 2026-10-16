"use client";
import { useEffect, useState, useCallback } from "react";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import RulesLoadingTempleteCreation from "../../../../../components/operations/Ultrasound/RulesLoadingTempleteCreation";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import Loader from "../../../../../components/accessories/Loader";
import { RiSave3Line } from "@remixicon/react";

interface UltrasoundTest {
	id: number;
	name: string;
}

interface TemplateField {
	field: string;
	value: string;
	fieldid: number;
	[key: string]: any;
}

interface TemplateDetails {
	employeeid?: string;
	testid: number;
	associatedbodypart: string;
	visibleToAll: number;
	fields: TemplateField[];
	keyid?: number | null;
	name: string;
}

export default function CreateUltrasonographyTemplates() {
	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const [ultrasoundList, setUltrasoundList] = useState<UltrasoundTest[]>([]);
	const [name, setName] = useState<string>('');
	const [associatedbodypart, setBodyPart] = useState<string>('');
	const [visible, setVisible] = useState<number>(1);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [rulesLoading, setRulesLoading] = useState<boolean>(true);
	const [rule, setRule] = useState<TemplateField[]>([]);
	const [impression, setImpression] = useState<string>('');
	const [selectedTest, setSelectedTest] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const searchParams = useSearchParams();
	const isEdit = searchParams?.get("isEdit");
	const templateid = searchParams?.get("templateid");

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const data = await customFetch(`testpanel/list/ultrasound`);
			setUltrasoundList(data);
		} catch (err) {
			console.error("Failed to fetch ultrasound list:", err);
			setUltrasoundList([]);
			toast.error("Failed to load ultrasound tests");
		} finally {
			setLoading(false);
		}
	}, []);

	const getCreationRule = useCallback(async () => {
		if (!selectedTest) return;

		try {
			setRulesLoading(true);
			const rules = await customFetch(`testpanel/list/customtestrule?testid=${selectedTest}`);
			if (Array.isArray(rules) && rules.length > 0) {
				setRule(rules);
			}
		} catch (err) {
			console.error("Failed to fetch creation rules:", err);
			setRule([]);
			toast.error("Failed to load template rules");
		} finally {
			setRulesLoading(false);
		}
	}, [selectedTest]);

	const getTemplateDetails = useCallback(async () => {
		if (!templateid || !isEdit) return;

		try {
			setRulesLoading(true);
			const response = await customFetch(`testpanel/list/ultrasound/get/template?templateid=${templateid}`);

			const { fields, name, visibletoAll, associatedbodypart, testid } = response;
			setRule(fields);
			setName(name);
			setSelectedTest(testid);
			setVisible(visibletoAll);
			setBodyPart(associatedbodypart);

			const impressionField = fields.find(item => item.field === "impression");
			setImpression(impressionField?.value || "");
		} catch (err) {
			console.error("Failed to fetch template details:", err);
			setRule([]);
			toast.error("Failed to load template details");
		} finally {
			setRulesLoading(false);
		}
	}, [isEdit, templateid]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (selectedTest && (!templateid || !isEdit)) {
			getCreationRule();
		}
	}, [selectedTest, templateid, isEdit, getCreationRule]);

	useEffect(() => {
		if (isEdit && templateid) {
			getTemplateDetails();
		}
	}, [isEdit, templateid, getTemplateDetails]);

	const handleFieldChange = (data: string, index: number) => {
		setRule(prev => prev.map((item, i) =>
			i === index ? { ...item, value: data } : item
		));
	};

	const createTemplateHandler = async () => {
		if (!selectedTest || !name || !employeeid) {
			toast.error("Please fill all required fields");
			return;
		}

		setIsSaving(true);
		try {
			const templateDetails: TemplateDetails = {
				employeeid,
				testid: parseInt(selectedTest),
				associatedbodypart,
				visibleToAll: visible,
				fields: [
					...rule,
				],
				keyid: templateid ? parseInt(templateid) : null,
				name
			};

			const method = templateid && isEdit ? 'PUT' : 'POST';
			const response = await customPost(
				`result/entry/ultrasound/templates/creation`,
				method,
				templateDetails
			);

			const message = templateid ? "updated" : "created";
			if (response.status) {
				toast.success(`Template ${message} successfully`);
			} else {
				toast.error(`Template ${message} failed`);
			}
		} catch (err) {
			console.error("Template operation failed:", err);
			toast.error("An error occurred while processing your request");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	const isReadyToSave = Boolean(selectedTest && associatedbodypart && name.trim() && rule.length > 0 && !rulesLoading);
	const completionItems = [
		{ label: 'Template name', complete: Boolean(name.trim()) },
		{ label: 'Ultrasound scan', complete: Boolean(selectedTest) },
		{ label: 'Body part', complete: Boolean(associatedbodypart) },
		{ label: 'Report fields', complete: rule.length > 0 },
	];

	return (
		<main className="container-fluid px-3 py-3">
			<header className="border-bottom pb-3 mb-4">
				<div>
					<div className="text-uppercase text-muted small fw-semibold mb-1">Ultrasound reporting</div>
					<h1 className="h4 fw-semibold mb-1">{isEdit ? "Edit Ultrasound Template" : "Create Ultrasound Template"}</h1>
					<p className="text-muted mb-0">Set the clinical scope, then shape the report fields your sonographers will use.</p>
				</div>
			</header>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					void createTemplateHandler();
				}}
				aria-busy={isSaving}
			>
				<section aria-labelledby="template-details-heading" className="mb-4">
					<h2 id="template-details-heading" className="h5 fw-semibold border-bottom pb-2 mb-3">Template details</h2>
					<div className="row g-3">
						<div className="col-12 col-md-6">
							<label htmlFor="template-name" className="form-label fw-semibold">Template name</label>
							<input
								id="template-name"
								value={name}
								onChange={(ev) => setName(ev.target.value)}
								className="form-control"
								type="text"
								placeholder="Enter the template name"
								required
							/>
						</div>
						<div className="col-12 col-md-6">
							<label htmlFor="ultrasound-scan" className="form-label fw-semibold">Ultrasound scan</label>
							<select
								id="ultrasound-scan"
								className="form-select text-capitalize"
								value={selectedTest || ''}
								disabled={!!templateid}
								onChange={(ev) => setSelectedTest(ev.target.value)}
								required
							>
								<option value="">Select an ultrasound scan</option>
								{ultrasoundList.map((item) => (
									<option key={item.id} value={item.id}>{item.name}</option>
								))}
							</select>
						</div>
						<div className="col-12 col-md-6">
							<label htmlFor="associated-body-part" className="form-label fw-semibold">Associated body part</label>
							<select
								id="associated-body-part"
								value={associatedbodypart}
								onChange={(ev) => setBodyPart(ev.target.value)}
								className="form-select text-capitalize"
								required
							>
								<option value="">Select a body part</option>
								<option value="Kidney">Kidney</option>
								<option value="Uterus">Uterus</option>
								<option value="Ovary">Ovary</option>
								<option value="Liver">Liver</option>
								<option value="Gallbladder">Gallbladder</option>
								<option value="Pancreas">Pancreas</option>
								<option value="Spleen">Spleen</option>
								<option value="Bladder">Bladder</option>
								<option value="Prostate">Prostate</option>
								<option value="Thyroid">Thyroid</option>
								<option value="Scrotum">Scrotum</option>
								<option value="Soft Tissue">Soft Tissue</option>
								<option value="Other">Other</option>
							</select>
						</div>
						<div className="col-12 col-md-6">
							<label htmlFor="template-visibility" className="form-label fw-semibold">Visible to all sonographers</label>
							<select
								id="template-visibility"
								value={visible}
								onChange={(ev) => setVisible(Number(ev.target.value))}
								className="form-select text-capitalize"
							>
								<option value={1}>Yes</option>
								<option value={0}>No</option>
							</select>
						</div>
					</div>
				</section>

				<section aria-labelledby="report-fields-heading">
					<h2 id="report-fields-heading" className="h5 fw-semibold border-bottom pb-2 mb-3">Report fields</h2>
						<RulesLoadingTempleteCreation
							rule={rule}
							impression={impression}
							setImpression={setImpression}
							selected={selectedTest}
							handleFieldChange={handleFieldChange}
							rulesLoading={rulesLoading}
						/>


						{rule.length > 0 && (
							<div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4 pt-3 border-top">
								<div className="small text-muted">{isReadyToSave ? 'All required template settings are complete.' : 'Complete the required settings before saving.'}</div>
								<button
									type="submit"
									className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
									disabled={!isReadyToSave || isSaving}
								>
									<RiSave3Line size={18} />
									{isSaving ? "Saving template..." : isEdit ? "Save Template Changes" : "Save Template"}
								</button>
							</div>
						)}
				</section>
			</form>
		</main>
	);
}