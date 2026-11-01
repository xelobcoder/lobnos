import { useEffect, useState, useCallback, ChangeEvent, FormEvent, ReactNode, FC } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Loader from "../../accessories/Loader";
import {
	getDepartment,
	getSampleTypeList,
	defaultTestEditValues,
	handleChangeWithState,
	customPost,
	getSingleEditTest,
	getSampleContainerList,
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
	const [FieldDisabledDueNone, setFieldDisabledDueNone] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);

	const getTestParams = useCallback(async () => {
		getSingleEditTest(testid!, setTestData, setLoading, false);
	}, [testid]);

	useEffect(() => {
		if (testid) {
			getTestParams();
		}
	}, [getTestParams, testid]);

	useEffect(() => {
		getDepartment(setCategory);
		getSampleTypeList(setSample);
		getSampleContainerList(setSampleContainers);
	}, []);

	const handleSwitch = (event: ChangeEvent<HTMLInputElement>, target: string): void => {
		if (!target) return;
		setTestData({ ...data, [target]: event.target.checked ? 1 : 0 });
	};

	const handleForm = async (ev: FormEvent): Promise<void> => {
		ev.preventDefault();
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
			toast.error("Sample type, container, and category are required", { autoClose: 2000 });
			return;
		}
		// if (!reportitle || reportitle.trim() === "") {
		// 	toast.error("Report title is required", { autoClose: 2000 });
		// 	return;
		// }


		if (!testMethod || testMethod.trim() === "") {
			toast.error("Method is required", { autoClose: 2000 });
			return;
		}
		if (parseFloat(testprice) < 0) {
			toast.error("Test price must be 0 or more", { autoClose: 2000 });
			return;
		}

		try {
			const response = await customPost(`testpanel/list`, method, {
				...data,
				sample_container: resolvedSampleContainerId,
				employeeid,
			});
			if (response.status !== "success") {
				toast.error("Test panel not updated", { autoClose: 500 });
				return;
			}

			if (method === 'PUT' && testid) {
				const qcResponse = await customFetchMutation('testpanel/qc-requirement', 'PUT', {
					testid: Number(testid),
					requiresQc: data.requires_qc === 1 || data.requires_qc === true,
					employeeid,
				});
				if (qcResponse?.status !== 'success') {
					toast.error(qcResponse?.message || 'QC requirement was not saved', { autoClose: 2000 });
					return;
				}
			}

			toast.success("Test panel updated successfully", { autoClose: 500 });
		} catch (error) {
			toast.error("An error occurred during submission", { autoClose: 2000 });
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

	if (isLoading) return <Loader />;

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
									: router.push(`/settings/applicationsettings/testpanels/testlist/${testid}/outsourcingList?testname=${data.name}`);
							}}
							className="btn btn-primary mb-1 btn-sm"
						>
							<RiAddLine /> Add outsourcing Organizations
						</button>}
						<button
							onClick={(ev) => {
								onNavigateTab
									? onNavigateTab('fields')
									: router.push(`/settings/applicationsettings/testpanels/testlist/createfields?testid=${testid}&&testname=${data.name}`);
							}}
							className="btn btn-light btn-sm mb-1 mx-2"
						>
							Test Fields
						</button>
					</div>
				</div>

				<div className="border bg-white border-secondary-subtle mx-2 p-2">
					<form className="mx-4">
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
						<div>
							<button
								type="button"
								className="btn btn-success btn-sm mt-2"
								onClick={handleForm}
							>
								Save Changes
							</button>
						</div>
					</form>
				</div>
			</>
		</div>
	);
}


export default TestForm;