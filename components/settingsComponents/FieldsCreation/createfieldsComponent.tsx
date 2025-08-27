"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import CustomParameterTypeSelection from "./CustomParameterTypeSelection";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { defaultCreationRule, parseTextToObject, updateFieldsRules } from "./data/testUtil";
import TestFieldsHeader from './TestFieldsHeader';
import ParamCreationGForm from "./ParamCreationForm";

export default function CreateTestFields({ testid, testname, testRules, fieldConstraintsCategorization, testdata }) {
	const [data, setData] = useState(testRules);
	const [error, setError] = useState("");
	const [field, setField] = useState(defaultCreationRule);
	const [reorder, setReorder] = useState(true);
	const [isLoading, setIsLoading] = useState(false);


	const handleCreateOrUpdateField = async () => {
		let _field = { ...field };
		setError("");
		if (!_field.name) {
			return setError("Parameter or field name is required.");
		}
		if (!_field.plan) {
			return setError("Please select an input type.");
		}
		if (_field.plan === "plain") {
			const formattedPlainToObject = parseTextToObject(field.plain);
			_field = { ..._field, ...formattedPlainToObject };
		}

		const existingFieldIndex = data.findIndex(item => item.name === _field.name);
		let updatedData;

		if (existingFieldIndex > -1) {
			updatedData = [...data];
			updatedData[existingFieldIndex] = _field;
		} else {
			updatedData = [...data, _field];
		}
		setData(updatedData);
		setField(defaultCreationRule);
	};

	const handleUpdateFields = async () => {
		if (data.length === 0) {
			toast.info("No fields to update.");
			return;
		}
		setIsLoading(true);
		try {
			await updateFieldsRules(data, toast, testid);
			toast.success("Fields updated successfully!");
		} catch (error) {
			toast.error("Failed to update fields. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const removeField = (itemToRemove) => {
		setData(prevData => prevData.filter(item => item.name !== itemToRemove.name));
		if (field.name === itemToRemove.name) {
			setField(defaultCreationRule);
		}
	};

	const changeOrdering = (item, ev) => {
		const { value } = ev.target;
		const { name } = item;
		const updatedData = data.map(d => (d.name === name ? { ...d, ordering: value } : d));
		setData(updatedData);
	};

	const editField = (row) => {
		setField(row);
		setError("");
	};

	const clearForm = () => {
		setField(defaultCreationRule);
		setError("");
	};

	const isEditing = Array.isArray(data) && data.length > 0 && data.some(item => item.name === field.name && field.name !== defaultCreationRule.name);

	return (
		<div className="container-fluid p-3">
			<TestFieldsHeader testid={testid} testname={testname} />
			<div className="row g-3 mt-2">
				<div className="col-lg-4 d-flex flex-column">
					<div className="card shadow-sm">
						<div className="card-body d-flex flex-column">
							<h2 className="card-title fs-5 fw-bold text-dark pb-3 mb-3 border-bottom">Parameter / Field Configuration</h2>
							{error && <div className="alert alert-danger" role="alert">{error}</div>}

							<div  >
								<div>
									<ParamCreationGForm
										field={field}
										setField={setField}
										fieldConstraintsCategorization={fieldConstraintsCategorization}
									/>
								</div>

								<div className="p-3 mx-2" >
									{
										field.plan &&
										<CustomParameterTypeSelection
											selection={field.plan}
											field={field}
											setField={setField}
										/>
									}
								</div>
							</div>

							<div className="d-flex gap-2 mt-auto pt-3 border-top justify-content-end">
								<Button variant="outline-secondary" size="sm" onClick={clearForm}>
									Clear
								</Button>
								<Button variant="primary" size="sm" onClick={handleCreateOrUpdateField}>
									{isEditing ? 'Update Field' : 'Add Field'}
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="col-lg-8 d-flex flex-column">
					<div className="card shadow-sm h-100">
						<div className="card-body d-flex flex-column">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h2 className="card-title fs-5 fw-bold text-dark">Current Fields ({data.length})</h2>
							</div>
							<div className="flex-grow-1" style={{ minHeight: '200px' }}>
								{data.length === 0 ? (
									<p className="text-center text-muted p-4 bg-light rounded border border-dashed d-flex align-items-center justify-content-center" style={{ minHeight: '150px' }}>No fields created yet. Configure and add fields using the form on the left.</p>
								) : (
									<RenderTestCreationParameters
										data={data}
										reorder={reorder}
										testid={testid}
										setReorder={setReorder}
										changeOrdering={changeOrdering}
										editField={editField}
										removeField={removeField}
									/>
								)}
							</div>
							{data.length > 0 && (
								<div className="d-flex gap-2 mt-auto pt-3 border-top justify-content-end">
									<Button
										variant="success"
										size="sm"
										onClick={handleUpdateFields}
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
												Saving Changes...
											</>
										) : (
											"Save All Changes"
										)}
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}