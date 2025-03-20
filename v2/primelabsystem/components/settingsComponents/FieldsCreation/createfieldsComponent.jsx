"use client";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import CustomParameterTypeSelection from "./CustomParameterTypeSelection";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { defaultCreationRule, parseTextToObject, updateFieldsRules } from "./data/testUtil";
import ParamCreationGForm from "./ParamCreationForm";
import TrackAlertLevelValueForm from "./TrackAlertValueForm";
import UltrasoundFieldsCreation from "./UltrasoundFieldsCreation";
import Link from "next/link";

export default function CreateTestFields({ testid, testname, testRules, fieldConstraintsCategorization, testdata }) {
	const [generalTestRule, setGeneralTestRule] = useState(testdata || defaultCreationRule);
	const [data, setData] = useState(testRules || []);
	const [error, setError] = useState("");
	const [field, setField] = useState(defaultCreationRule);
	const [reorder, setReorder] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	const handleCreateField = async () => {
		let _field = { ...field };
		setError("");
		if (!_field.name) {
			return setError("Parameter or field name is required");
		}
		if (_field.plan === "plain") {
			const formattedPlainToObject = parseTextToObject(field.plain);
			_field = { ..._field, ...formattedPlainToObject };
		}
		const updatedData = data.filter(item => item.name !== _field.name);
		setData([...updatedData, _field]);
		setField(defaultCreationRule);
	};

	const handleUpdateFields = async () => {
		setIsLoading(true);
		try {
			await updateFieldsRules(data, toast, testid);
		} catch (error) {
			toast.error("Failed to update fields. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const removeField = (item) => {
		const { name } = item;
		setData(prevData => prevData.filter(a => a.name !== name));
	};

	const handleUltrasoundChangeType = (ev) => {
		const { value } = ev.target;
		if (!value) return;
		if (value === "report") {
			const fieldValue = {
				name: "General",
				field: "",
				value: "",
				options: "",
				testid: "",
				hasunits: false,
				units: "",
				plan: "ultrasound",
				plain: "",
				fieldConstraints: [],
				ordering: "",
				isValueTracked: 0,
				textReference: ""
			};
			setGeneralTestRule({ ...generalTestRule, field: fieldValue, view: value });
			return;
		}
		setGeneralTestRule({ ...generalTestRule, plan: "ultrasound", view: value });
	};

	const changeOrdering = (item, ev) => {
		const { value } = ev.target;
		const { name } = item;
		const updatedData = [...data];
		const index = updatedData.findIndex(item => item.name === name);
		updatedData[index]["ordering"] = value;
		setData(updatedData);
	};

	const editField = (row) => {
		if (data.length > 0) {
			setField(row);
		}
	};

	return (
		<div>
			<ToastContainer theme="colored" className="text-sm" position="top-center" />
			<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center my-2">
				<h5 className="text-capitalize pls-label bg-secondary-subtle p-2 br-5 mb-2 mb-md-0 ">
					{testname}
				</h5>
				<div className="d-flex flex-column flex-md-row gap-2">
					<Link
						className="pls-label pls-color text-decoration-underline"
						href={`/settings/applicationsettings/testpanels/fieldscategory/${testid}`}
					>
						Add Field Constraints Categorization
					</Link>
					<Link
						className="pls-label pls-color text-decoration-underline"
						href={`/settings/applicationsettings/testpanels/multiple-test-conditions/${testid}`}
					>
						Create Multiple Constraints Condition
					</Link>
				</div>
			</div>

			{error && <div className="alert alert-danger pls-color">{error}</div>}

			{generalTestRule?.department.toLowerCase() === "ultrasound" && (
				<div className="grid-reg my-2 mx-2">
					<label className="my-2">Result Entry Type</label>
					<select className="custom-select" onChange={handleUltrasoundChangeType}>
						<option value="">Select an option below</option>
						<option value="parameter">By Parameter</option>
						<option value="report">Full Report View</option>
					</select>
				</div>
			)}

			{generalTestRule?.department.toLowerCase() === "ultrasound" ? (
				<UltrasoundFieldsCreation
					generalTestRule={generalTestRule}
					handleCreateField={handleCreateField}
					field={field}
					setField={setField}
				/>
			) : (
				<div className="list-group">
					<div className="p-2 list-group-item bg-secondary-subtle fw-bold">
						Parameter / Field Creation
					</div>
					<div className="text-sm list-group-item">
						<ParamCreationGForm
							field={field}
							setField={setField}
							generalTestRule={generalTestRule}
							fieldConstraintsCategorization={fieldConstraintsCategorization}
						/>
						<CustomParameterTypeSelection selection={field.plan} field={field} setField={setField} />
						<TrackAlertLevelValueForm field={field} setField={setField} />
					</div>

					<div className="list-group-item">
						<Button variant="success" size="sm" onClick={handleCreateField} className="mt-2">
							Create Field
						</Button>
						<Button variant="danger" size="sm" className="mx-2 mt-2">
							Cancel
						</Button>
					</div>
				</div>
			)}

			<div className="list-group mt-3">
				<div className="list-group-item bg-secondary-subtle fw-bold">Fields</div>
				<div className="list-group-item">
					{data.length === 0 ? (
						<h5 className="mt-4">No fields created</h5>
					) : (
						<RenderTestCreationParameters
							data={data}
							reorder={reorder}
							setReorder={setReorder}
							changeOrdering={changeOrdering}
							editField={editField}
							removeField={removeField}
						/>
					)}
				</div>
				<div className="list-group-item">
					<Button
						variant="success"
						className="mt-2"
						size="sm"
						onClick={handleUpdateFields}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
								Updating...
							</>
						) : (
							"Update Fields"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
