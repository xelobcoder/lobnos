import { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Loader from "../../accessories/Loader";
import {
	getDepartment,
	getSampleTypeList,
	defaultTestEditValues,
	handleChangeWithState,
	customPost,
	getSingleEditTest
} from "../../Auth/customFetch";
import { Add } from "@mui/icons-material";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import TestBasicForm from "./TestBasicForm"
import ConfigurationForm from "./ConfigurationForm";
import TatForm from "./TatForm";

export default function TestForm({ method, customtest, testid, router }) {
	const { employeeid } = useApplicationSettings().applicationsettings.user;
	const [sampleType, setSample] = useState([]);
	const [category, setCategory] = useState([]);
	const [data, setTestData] = useState({ ...defaultTestEditValues, iscustom: customtest });
	const [FieldDisabledDueNone, setFieldDisabledDueNone] = useState(false);
	const [isLoading, setLoading] = useState(true);

	const getTestParams = useCallback(async () => {
		getSingleEditTest(testid, setTestData, setLoading);
	}, [testid]);

	useEffect(() => {
		if (testid) {
			getTestParams();
		}
	}, [getTestParams, testid]);

	useEffect(() => {
		getDepartment(setCategory);
		getSampleTypeList(setSample);
	}, []);

	const handleSwitch = (event, target) => {
		if (!target) return;
		setTestData({ ...data, [target]: event.target.checked === true ? 1 : 0 });
	};

	const handleForm = async (ev) => {
		ev.preventDefault();
		const { category, sample_container, sample, name, testprice } = data;
		if (sample === "" || (sample_container === "" && sample != 8) || name === "" || category === 0 || sample === 0) {
			toast.error("Sample type, container, and category are required", { autoClose: 2000 });
			return;
		}

		if (parseInt(testprice) < 0) {
			toast.error("Test price must be 0 or more", { autoClose: 2000 });
			return;
		}

		const response = await customPost(`testpanel/list`, method, { ...data, employeeid });

		if (response.status === "success") {
			toast.success("Test panel updated successfully", { autoClose: 500 });
		} else {
			toast.error("Test panel not updated", { autoClose: 500 });
		}
	};

	const handleSampleTypeChange = (ev) => {
		const { value } = ev.target;
		if (value == 8) {
			setTestData({ ...data, sample: value, sample_container: "", unit: "", qty_required: "" });
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

	if (isLoading) return <Loader />;

	return (
		<div>
			<ToastContainer  className={'text-sm'} position="top-center" theme="colored"/>
			<>
				<div className="mx-2 d-flex justify-content-between">
					<h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5">{data?.name}</h5>
					<div>
						<button
							onClick={(ev) => {
								router.push(`/settings/testpanel/testlist/${testid}/outsourcingList?testname=${data.name}`);
							}}
							className="btn btn-primary mb-1 btn-sm"
						>
							<Add /> Add outsourcing Organizations
						</button>
						<button
							onClick={(ev) => {
								router.push(`/settings/testpanel/testlist/createfields?testid=${testid}&&testname=${data.name}`);
							}}
							className="btn btn-light btn-sm mb-1 mx-2"
						>
							Test Fields
						</button>
					</div>
				</div>

				<div className="border bg-white border-secondary-subtle mx-2 p-2">
					<form className="mx-4">
						<TestBasicForm
							data={data}
							handleChangeWithState={handleChangeWithState}
							handleSampleTypeChange={handleSampleTypeChange}
							FieldDisabledDueNone={FieldDisabledDueNone}
							category={category}
							sampleType={sampleType}
						/>
						<hr />
						<ConfigurationForm data={data} handleSwitch={handleSwitch} />
						<hr />
						<TatForm data={data} handleChangeWithState={handleChangeWithState} />
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