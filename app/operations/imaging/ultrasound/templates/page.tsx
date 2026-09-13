"use client";
import { useEffect, useState, useCallback } from "react";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import RulesLoadingTempleteCreation from "../../../../../components/operations/Ultrasound/RulesLoadingTempleteCreation";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import Loader from "../../../../../components/accessories/Loader";
import { RiFileList3Line, RiSave3Line, RiSettings3Line } from "@remixicon/react";

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
		<div className="container-fluid px-3 py-4" style={{ maxWidth: 1440 }}>
			<div className="d-flex flex-column bg-white rounded-1 p-3 flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
				<div>
					<div className="text-uppercase text-muted small fw-semibold mb-1">Ultrasound reporting</div>
					<h1 className="h4 fw-semibold mb-1 d-flex align-items-center gap-2">
						<span className="d-inline-flex align-items-center justify-content-center rounded bg-primary-subtle text-primary" style={{ width: 38, height: 38 }}>
							<RiFileList3Line size={21} />
						</span>
						{isEdit ? "Edit Ultrasound Template" : "Create Ultrasound Template"}
					</h1>
					<p className="text-muted mb-0">Set the clinical scope, then shape the report fields your sonographers will use.</p>
				</div>
				<div className="d-flex align-items-center gap-2 small text-muted">
					<span className="rounded-circle bg-success" style={{ width: 8, height: 8 }} />
					{isEdit ? 'Editing saved template' : 'New template draft'}
				</div>
			</div>

			<div className="row g-4 align-items-start">
				<div className="card border-0">
						<form className="card-body d-flex flex-column gap-3">
							
							<div className="col-12">
								<label htmlFor="template-name" className="form-label small fw-semibold">Template Name</label>
								<input
									id="template-name"
									value={name}
									onChange={(ev) => setName(ev.target.value)}
									className="form-control"
									type="text"
									placeholder="Enter the pathology or template name"
								/>
							</div>
							<div className="col-12">
								<label htmlFor="ultrasound-scan" className="form-label small fw-semibold">Ultrasound Scan</label>
								<select
									id="ultrasound-scan"
									className="form-select text-capitalize"
									value={selectedTest || ''}
									disabled={!!templateid}
									onChange={(ev) => setSelectedTest(ev.target.value)}
								>
									<option value="">Select an option here</option>
									{ultrasoundList.map((item) => (
										<option key={item.id} value={item.id}>{item.name}</option>
									))}
								</select>
							</div>
							<div className="col-12">
								<label htmlFor="associated-body-part" className="form-label small fw-semibold">Associated Body Part</label>
								<select
									id="associated-body-part"
									value={associatedbodypart}
									onChange={(ev) => setBodyPart(ev.target.value)}
									className="form-select text-capitalize"
								>
									<option value="">select body part</option>
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
							<div className="col-12">
								<label htmlFor="template-visibility" className="form-label small fw-semibold">Visible to All Sonographers</label>
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
						</form>
					</div>
				<div >
					<div >
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
									className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2"
									onClick={createTemplateHandler}
									disabled={!isReadyToSave}
								>
									<RiSave3Line size={18} />
									{isEdit ? "Save Template Changes" : "Save Template"}
								</button>
							</div>
						)}
					</div>


				</div>
			</div>
		</div>
	);
}