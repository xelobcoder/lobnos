import ReportValidationRules,{ReportValidationDraft} from './ReportValidationRules';
import { useTestPanelBasePath } from '../TestPanelWorkspace';
import { useEffect, useState, useCallback, useRef, ChangeEvent, FormEvent, ReactNode, FC } from "react";
import { ToastContainer, toast } from 'react-toastify';
import TestEditorLoading from "./TestEditorLoading";
import {testEditorArray, testEditorDetail} from '../../../lib/testEditorData';
import ui from '../../Billing/billing-strategy/StrategyWorkspace.module.css';
import {
	defaultTestEditValues,
	handleChangeWithState,
	customPost,
	customFetch,
	customFetchMutation
} from "../../Auth/customFetch";
import { RiAddLine } from '@remixicon/react';
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import TestBasicForm from "./TestBasicForm"
import ConfigurationForm from "./ConfigurationForm";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import TatForm from "./TatForm";

interface TestFormProps {
	method: 'POST' | 'PUT';
	customtest: number;
	testid?: number;
	router: AppRouterInstance;
	onNavigateTab?: (tab: 'fields' | 'outsourcing') => void;
	canManageOutsourcing?: boolean;
}

interface TestData {
	id: number;
	name: string;
	category: number;
	price: number;
	created_on: string;
	sample: number;
	description: string;
	post_TatEvaluation: string;
	pre_TatEvaluation: string;
	tatEvaluation: string;
	sample_container: string | number;
	unit: string;
	hasDrugs: number;
	qty_required: string;
	shorttext: string;
	useLiterature: string;
	testid: string;
	testcost: string;
	testprice: string;
	hasManual: string;
	procedureCode: string;
	deviceId: number;
	includeDeviceInResult: boolean;
	pre_Tat: string;
	tat: string;
	post_Tat: string;
	tatCount: string;
	updatedon: string;
	updatedby: string;
	showtrend: number;
	isoutsourced: number;
	iscustom: number;
	hasGenderVariation: number;
	hasChildrenLimit: number;
	deviceInterfaceMapping: string | null;
	reportitle: string;
	method: string | null;
	requires_qc: number | boolean;
}

const TestForm: FC<TestFormProps> = ({ method, customtest, testid, router, onNavigateTab, canManageOutsourcing = true }) => {
 const basePath = useTestPanelBasePath();
	const { employeeid } = useApplicationSettings().applicationsettings.user;
	const [sampleType, setSample] = useState<any[]>([]);
	const [category, setCategory] = useState<any[]>([]);
	const [sampleContainers, setSampleContainers] = useState<any[]>([]);
	const [data, setTestData] = useState<TestData | any>({
		...defaultTestEditValues,
		iscustom: customtest,
		requires_qc: 0,
		deviceInterfaceMapping: null,
		reportitle: '',
		method: null
	});
	const [isSaving,setSaving]=useState(false);
	const saveInFlight=useRef(false);
    const [validationDraft,setValidationDraft]=useState<ReportValidationDraft|null>(null);
    const updateValidationDraft=useCallback((draft:ReportValidationDraft)=>{setValidationDraft(draft);setSaveFeedback(null);},[]);
	const [saveFeedback,setSaveFeedback]=useState<{kind:'success'|'error';message:string}|null>(null);
	const showSaveError=(message:string)=>{setSaveFeedback({kind:'error',message});toast.error(message,{autoClose:5000});};
	const [FieldDisabledDueNone, setFieldDisabledDueNone] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [loadError, setLoadError] = useState('');
	const loadVersion = useRef(0);
	const getTestParams = useCallback(async () => {
		const ticket = ++loadVersion.current;
		setLoading(true);
		setLoadError('');
		try {
			if ((method === 'PUT' || testid != null) && (!Number.isSafeInteger(Number(testid)) || Number(testid) <= 0)) throw new Error('A valid test identifier is required.');
			const [detail, departments, samples, containers] = await Promise.all([
				testid ? customFetch(`gettestpanel/edit?id=${testid}&&withoutdepartment=false`) : Promise.resolve(null),
				customFetch('departments'), customFetch('sampletype'), customFetch('sample/containers'),
			]);
			if (ticket !== loadVersion.current) return;
			const categories = testEditorArray(departments, 'test departments');
			const sampleTypes = testEditorArray(samples, 'sample types');
			const sampleContainerTypes = testEditorArray(containers, 'sample containers');
			if (testid) setTestData({...defaultTestEditValues, ...testEditorDetail(detail)});
			setCategory(categories);
			setSample(sampleTypes);
			setSampleContainers(sampleContainerTypes);
		} catch (error) {
			if (ticket === loadVersion.current) setLoadError(error instanceof Error ? error.message : 'Unable to load test configuration.');
		} finally {
			if (ticket === loadVersion.current) setLoading(false);
		}
	}, [testid, method]);
	useEffect(() => {
		void getTestParams();
		return () => { loadVersion.current++; };
	}, [getTestParams]);

	const handleSwitch = (event: ChangeEvent<HTMLInputElement>, target: string): void => {
		if (!target) return;
		setTestData({ ...data, [target]: event.target.checked ? 1 : 0 });
	};

	const handleForm = async (ev: FormEvent): Promise<void> => {
		ev.preventDefault();
		if(saveInFlight.current)return;
		setSaveFeedback(null);
		const { category, sample_container, sample, name, testprice, reportitle, method: testMethod, deviceInterfaceMapping } = data;
		const resolvedSampleContainerId = sample === 8
			? ""
			: (() => {
				const directValue = Number(sample_container);
				if (!Number.isNaN(directValue) && directValue > 0) {
					return directValue;
				}

				const matched = sampleContainers.find((container) => {
					return (container?.name || '').toString().trim().toLowerCase() ===
						(sample_container || '').toString().trim().toLowerCase();
				});

				return matched?.id || "";
			})();

		if (sample === 0 || (resolvedSampleContainerId === "" && sample !== 8) || name === "" || category === 0) {
			showSaveError("Sample type, container, and category are required");
			return;
		}
		// if (!reportitle || reportitle.trim() === "") {
		// 	toast.error("Report title is required", { autoClose: 2000 });
		// 	return;
		// }


		if (typeof testMethod !== "string" || testMethod.trim() === "") {
			showSaveError("Method is required");
			return;
		}
		if (parseFloat(testprice) < 0) {
			showSaveError("Test price must be 0 or more");
			return;
		}

		if(method==='PUT'&&testid&&(!validationDraft||validationDraft.testid!==testid||validationDraft.loading||validationDraft.error)){showSaveError(validationDraft?.error||'Wait for report validation rules to load before saving.');return;}
		saveInFlight.current=true;
		setSaving(true);
		let detailsSaved=false;
		try {
			const response = await customPost(`testpanel/list`, method, {
				...data,
				...(method==='PUT'&&testid?{reportValidationRules:validationDraft!.rules}:{}),
				sample_container: resolvedSampleContainerId,
				employeeid,
			});
			if (response?.status !== "success") {
				showSaveError(response?.message || "Test panel not updated");
				return;
			}

			detailsSaved=true;
			if (method === 'PUT' && testid) {
				const qcResponse = await customFetchMutation('testpanel/qc-requirement', 'PUT', {
					testid: Number(testid),
					requiresQc: data.requires_qc === 1 || data.requires_qc === true,
					employeeid,
				});
				if (qcResponse?.status !== 'success') {
					showSaveError(`Test details and report validation rules saved, but QC settings were not saved: ${qcResponse?.message || 'Please retry.'}`);
					return;
				}
			}

			setSaveFeedback({kind:"success",message:"Test details and report validation rules saved successfully."});
			toast.success("Test details and report validation rules saved successfully.", { autoClose: 2500 });
		} catch (error) {
			showSaveError(detailsSaved?"Test details and report validation rules saved, but QC settings could not be confirmed. Please retry.":"Unable to confirm the save. Please retry.");
		} finally {
			saveInFlight.current=false;
			setSaving(false);
		}
	};

	const handleSampleTypeChange = (ev: ChangeEvent<HTMLSelectElement>): void => {
		const { value } = ev.target;
		const numericValue = parseInt(value, 10);

		if (numericValue === 8) {
			setTestData({ ...data, sample: numericValue, sample_container: "", unit: "", qty_required: "" });
			return;
		}
		handleChangeWithState(ev, "sample", setTestData, data);
	};

	useEffect(() => {
		if (data && data.sample && data.sample == 8) {
			setFieldDisabledDueNone(true);
		} else {
			setFieldDisabledDueNone(false);
		}
	}, [data.sample]);

	useEffect(() => {
		if (!Array.isArray(sampleContainers) || sampleContainers.length === 0) return;
		const currentValue = data?.sample_container;

		if (currentValue === null || currentValue === undefined || currentValue === "") return;
		const numericCurrent = Number(currentValue);
		if (!Number.isNaN(numericCurrent) && numericCurrent > 0) return;

		const matched = sampleContainers.find((container) => {
			return (container?.name || '').toString().trim().toLowerCase() ===
				currentValue.toString().trim().toLowerCase();
		});

		if (matched?.id) {
			setTestData((prev: TestData) => ({ ...prev, sample_container: matched.id }));
		}
	}, [sampleContainers, data?.sample_container]);

	if (isLoading) return <TestEditorLoading label="Loading test details and sample configuration" />;
	if (loadError) return <div className={ui.error} role="alert"><span>{loadError}</span><button type="button" className={ui.secondary} onClick={() => void getTestParams()}>Retry loading test</button></div>;

	return (
		<div>
			<>
				<div className="mx-2 d-flex justify-content-between">
					<h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5">{data?.name}</h5>
					<div>
						{canManageOutsourcing && <button
							onClick={(ev) => {
								onNavigateTab
									? onNavigateTab('outsourcing')
									: router.push(`${basePath}/testlist/${testid}/outsourcingList?testname=${data.name}`);
							}}
							className="btn btn-primary mb-1 btn-sm"
						>
							<RiAddLine /> Add outsourcing Organizations
						</button>}
						<button
							onClick={(ev) => {
								onNavigateTab
									? onNavigateTab('fields')
									: router.push(`${basePath}/testlist/createfields?testid=${testid}&&testname=${data.name}`);
							}}
							className="btn btn-light btn-sm mb-1 mx-2"
						>
							Test Fields
						</button>
					</div>
				</div>

				<div className="border bg-white border-secondary-subtle mx-2 p-2">
					<form className="mx-4" noValidate onSubmit={handleForm} aria-busy={isSaving} onChangeCapture={()=>setSaveFeedback(null)}>
                        <fieldset disabled={isSaving} style={{minWidth:0}}>
						{/* New fields for reportitle, method, deviceInterfaceMapping */}

						<TestBasicForm
							data={data}
							handleChangeWithState={handleChangeWithState}
							handleSampleTypeChange={handleSampleTypeChange}
							FieldDisabledDueNone={FieldDisabledDueNone}
							category={category}
							sampleType={sampleType}
							setTestData={setTestData}
							sampleContainers={sampleContainers}
						/>
						<hr />
						<ConfigurationForm data={data} handleSwitch={handleSwitch} canManageQc={method === 'PUT' && Boolean(testid)} />
						<hr />
						<TatForm
							data={data}
							handleChangeWithState={handleChangeWithState}
							setTestData={setTestData}
						/>
						<hr />
                        {method === 'PUT' && testid && <ReportValidationRules testid={testid} onStateChange={updateValidationDraft} disabled={isSaving}/> }
						<div>
							<button
								type="submit"
								className="btn btn-success btn-sm mt-2"
                                disabled={isSaving}
							>
								{isSaving ? "Saving..." : "Save Changes"}
							</button>
						</div>

                        {saveFeedback && <div className={`alert mt-3 mb-0 ${saveFeedback.kind === "error" ? "alert-danger" : "alert-success"}`} role={saveFeedback.kind === "error" ? "alert" : "status"}>{saveFeedback.message}</div>}
                        </fieldset>
					</form>

				</div>
			</>
		</div>
	);
}


export default TestForm;