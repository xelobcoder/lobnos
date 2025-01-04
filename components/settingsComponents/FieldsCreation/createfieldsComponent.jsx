import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { customFetch, getSingleEditTest } from "../../Auth/customFetch";
import Loader from "../../accessories/Loader";
import AlertInmportantInformation from "./AlertImportantInformation";
import CustomParameterTypeSelection from "./CustomParameterTypeSelection";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { defaultCreationRule, parseTextToObject, updateFieldsRules } from "./data/testUtil";
import ParamCreationGForm from "./ParamCreationForm";
import MultiFieldSelectConditions from "./MultiFieldConditions";
import TrackAlertLevelValueForm from "./TrackAlertValueForm";
import UltrasoundFieldsCreation from "./UltrasoundFieldsCreation";

export default function CreateTestFields({ testid, testname, minimize = false }) {
	const [generalTestRule, setGeneralTestRule] = useState(defaultCreationRule);
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState([]);
	const [error, setError] = useState("");
	const [field, setField] = useState(defaultCreationRule);
	const [reorder, setReorder] = useState(true);

	const handleCreateField = async () => {
		let _field = { ...field };
		setError("");
		if (!_field.name) {
			return setError("Parameter or field name is required");
		}
		if (_field.plan === "plain") {
			const formatedPlainToObject = parseTextToObject(field.plain);
			_field = { ..._field, ...formatedPlainToObject };
		}
		if (data.length === 0) {
			setData([_field]);
		} else {
			const updatedData = data.filter(item => item.name !== _field.name);
			setData([...updatedData, _field]);
		}
		setField(defaultCreationRule);
	};

	const removeField = async (item) => {
		const { name } = item;
		setData(prevData => prevData.filter(a => a.name !== name));
	};



	const handleUltrasoundChangeType = (ev) => {
		const { value } = ev.target;
		if (!value) return false;
		if (value === "report") {
			const fieldValue = {
				"name": "General",
				"field": "",
				"value": "",
				"options": "",
				"testid": "",
				"hasunits": false,
				"units": "",
				"plan": "ultrasoundFields",
				"plain": "",
				"fieldConstraints": [],
				"ordering": "",
				"isValueTracked": 0,
				"textReference": ""
			}
			setGeneralTestRule({ ...generalTestRule, field: fieldValue, view: value })
			return;
		}
		setGeneralTestRule({ ...generalTestRule, view: value })
	}


	const changeOrdering = (item, ev) => {
		const { value } = ev.target;
		const { name } = item;
		const updatedData = [...data];
		const index = updatedData.findIndex(item => item.name === name);
		updatedData[index]["ordering"] = value;
		setData(updatedData);
	};

	const getSinglePlusRules = useCallback(() => {
		if (testid) {
			getSingleEditTest(testid, setGeneralTestRule, setLoading);
			customFetch(`testpanel/list/customtestrule?testid=${testid}`)
				.then(data => setData(data))
				.catch(err => console.error(err));
		}
	}, [testid]);

	useEffect(() => {
		getSinglePlusRules();
	}, [getSinglePlusRules]);

	const editField = (row) => {
		if (data.length > 0) {
			setField(row);
		}
	};

	const finalRenderingView = () => {
		if (isLoading) {
			return <Loader />
		} else {
			return (
				<div>
					{/* <AlertInmportantInformation /> */}
					<div>
						<div>
							{error && <div className="alert alert-danger">{error}</div>}
						</div>
						{generalTestRule?.department.toLowerCase() == "ultrasound" && (
							<div className="grid-reg my-2 mx-2">
								<label className="my-2"> Result Entry Type</label>
								<select className="custom-select" onChange={(ev) => { handleUltrasoundChangeType(ev) }}>
									<option value=''>Select an option below</option>
									<option value='parameter'>By Parameter</option>
									<option value='report'>
										Full Report View
									</option>
								</select>
							</div>
						)}

						{(generalTestRule.department.toLowerCase() == "ultrasound") && <UltrasoundFieldsCreation generalTestRule={generalTestRule} handleCreateField={handleCreateField} field={field} setField={setField} />}

						{(generalTestRule.department.toLowerCase() != "ultrasound")
							&&
							(<div className="list-group" >
								<div className="p-2  list-group-item bg-secondary-subtle fw-bold">
									Parameter / Field Creation
								</div>
								<div className="text-sm list-group-item">
									<ParamCreationGForm field={field} setField={setField} generalTestRule={generalTestRule} />
									<CustomParameterTypeSelection selection={field.plan} field={field} setField={setField} />
									<TrackAlertLevelValueForm field={field} setField={setField} />
								</div>

								<div className="list-group-item" >
									<button
										type="button"
										onClick={handleCreateField}
										className="btn  btn-sm btn-success mt-2"
									>
										Create Field
									</button>
									<button
										type="button"
										onClick={handleCreateField}
										className="btn  mx-2 btn-sm btn-danger mt-2"
									>
										cancel
									</button>
								</div>
							</div>)
						}


					</div>

					{/* fields card */}
					<div className="list-group mt-3">
						<div className="list-group-item bg-secondary-subtle fw-bold">
							Fields
						</div>
						<div className="list-group-item">
							{data.length === 0 ? (
								<h5 className="mt-4">No fields created</h5>
							) :
								(<RenderTestCreationParameters
									data={data}
									reorder={reorder}
									setReorder={setReorder}
									changeOrdering={changeOrdering}
									editField={editField}
									removeField={removeField}
								/>)}
						</div>
						<div className="list-group-item">
							<button onClick={() => updateFieldsRules(data, toast, testid)}
								className="btn btn-success mt-2">
								Update Fields
							</button>
						</div>
					</div>
					<div className="list-group my-4">
						<div className="list-group-item bg-secondary-subtle fw-bold">
							Multiple Field Conditions
						</div>
						<div className="list-group-item">
							<MultiFieldSelectConditions fields={data} />
						</div>
						<div className="list-group-item">
							<button
								className="btn btn-success btn-sm mt-2">
								Update Fields
							</button>
						</div>
					</div>
				</div>
			);
		}

	};

	return (
		<>
			<ToastContainer theme="colored" className="text-sm" position="top-center" />
			<h5 className="mx-2 text-capitalize">{testname}</h5>
			{finalRenderingView()}
		</>
	);
}
