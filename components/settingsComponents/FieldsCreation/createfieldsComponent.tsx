"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Spinner, Modal } from "react-bootstrap";
import CustomParameterTypeSelection from "./CustomParameterTypeSelection";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { defaultCreationRule, parseTextToObject, updateFieldsRules } from "./data/testUtil";
import TestFieldsHeader from './TestFieldsHeader';
import ParamCreationGForm from "./ParamCreationForm";

export default function CreateTestFields({ testid, testname, testRules, fieldConstraintsCategorization, testdata }) {
	const [data, setData] = useState(testRules);
	const [reorder, setReorder] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [modalField, setModalField] = useState(defaultCreationRule);
	const [modalError, setModalError] = useState("");
	const [sessionFields, setSessionFields] = useState([] as any[]);

	useEffect(() => {
		setData(testRules);
	}, [testRules]);

	const handleCreateOrUpdateField = async () => {
		let _field = { ...modalField };
		setModalError("");
		if (!_field.name) {
			return setModalError("Parameter or field name is required.");
		}
		if (!_field.plan) {
			return setModalError("Please select an input type.");
		}
		if (_field.plan === "plain") {
			const formattedPlainToObject = parseTextToObject(modalField.plain);
			_field = { ..._field, ...formattedPlainToObject };
		}

		if (isEditing) {
			// For editing, update the field and close
			const existingFieldIndex = data.findIndex(item => item.name === _field.name);
			let updatedData = [...data];
			if (existingFieldIndex > -1) {
				updatedData[existingFieldIndex] = _field;
			}
			setData(updatedData);
			setShowModal(false);
			setModalField(defaultCreationRule);
			toast.success("Field updated successfully!");
		} else {
			// For creating, add to session
			setSessionFields([...sessionFields, _field]);
			setModalField(defaultCreationRule);
			setModalError("");
			toast.success("Field added to session! Add more or save all.");
		}
	};

	const handleSaveSession = () => {
		setData([...data, ...sessionFields]);
		setShowModal(false);
		setSessionFields([]);
		setModalField(defaultCreationRule);
		toast.success(`${sessionFields.length} field(s) added successfully!`);
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
	};

	const changeOrdering = (item, ev) => {
		const { value } = ev.target;
		const { name } = item;
		const updatedData = data.map(d => (d.name === name ? { ...d, ordering: value } : d));
		setData(updatedData);
	};

	const editField = (row) => {
		setModalField(row);
		setModalError("");
		setSessionFields([]);
		setShowModal(true);
	};

	const clearForm = () => {
		setModalField(defaultCreationRule);
		setModalError("");
	};

	const openCreateModal = () => {
		setModalField(defaultCreationRule);
		setModalError("");
		setSessionFields([]);
		setShowModal(true);
	};

	const isEditing = Array.isArray(data) && data.length > 0 && data.some(item => item.name === modalField.name && modalField.name !== defaultCreationRule.name);

	return (
		<div className="container-fluid p-3">
			<TestFieldsHeader testid={testid} testname={testname} />
			<div className="row g-3 mt-2">
				<div className="col-12 d-flex flex-column">
					<div className="card shadow-sm h-100">
						<div className="card-body d-flex flex-column">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h2 className="card-title fs-5 fw-bold text-dark">Current Fields ({data.length})</h2>
								<Button variant="primary" size="sm" onClick={openCreateModal}>
									Create Parameter
								</Button>
							</div>
							<div className="flex-grow-1" style={{ minHeight: '200px' }}>
								{data.length === 0 ? (
									<p className="text-center text-muted p-4 bg-light rounded border border-dashed d-flex align-items-center justify-content-center" style={{ minHeight: '150px' }}>No fields created yet. Click &#39;Create Parameter&#39; to add fields.</p>
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

			<Modal show={showModal} onHide={() => setShowModal(false)} fullscreen={true} backdrop="static" scrollable>
				<Modal.Header closeButton>
					<Modal.Title>{isEditing ? 'Edit Parameter&#39;' : 'Create Parameter&#39;'}</Modal.Title>
				</Modal.Header>
				<Modal.Body >
					<div className="row g-4 h-100">
						<div className="col-md-6 d-flex flex-column" >
							{modalError && <div className="alert alert-danger" role="alert">{modalError}</div>}
							<div className="mb-3">
								<ParamCreationGForm
									field={modalField}
									setField={setModalField}
									fieldConstraintsCategorization={fieldConstraintsCategorization}
								/>
							</div>
							{modalField.plan && (
								<div className="mb-3">
									<CustomParameterTypeSelection
										selection={modalField.plan}
										field={modalField}
										setField={setModalField}
									/>
								</div>
							)}
							<div className="mt-3">
								<Button variant="primary" onClick={handleCreateOrUpdateField}>
									{isEditing ? 'Update Field' : 'Add to Session'}
								</Button>
							</div>
						</div>
						<div className="col-md-6 d-flex flex-column">
							{Array.isArray(sessionFields) && sessionFields.length > 0 && (
								<div className="flex-grow-1">
									<h6 className="mb-3">Fields ready to add ({sessionFields.length}):</h6>
									<div className="list-group flex-grow-1" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
										{sessionFields.map((f, i) => (
											<div key={i} className="list-group-item d-flex justify-content-between align-items-center">
												<div>
													<strong>{f.name}</strong> <small className="text-muted">({f.plan})</small>
												</div>
												<Button
													variant="outline-danger"
													size="sm"
													onClick={() => setSessionFields(sessionFields.filter((_, idx) => idx !== i))}
												>
													Remove
												</Button>
											</div>
										))}
									</div>
								</div>
							)}
							{sessionFields.length === 0 && (
								<div className="text-center text-muted mt-5 flex-grow-1 d-flex align-items-center justify-content-center">
									<div>
										<p className="mb-1">No fields added yet.</p>
										<p className="mb-0 small">Configure a field on the left and click &#34;Add to Session&#34;.</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={clearForm}>
						Clear
					</Button>
					{sessionFields.length > 0 && (
						<Button variant="success" onClick={handleSaveSession}>
							&#34;Save All&#34; ({sessionFields.length})
						</Button>
					)}
				</Modal.Footer>
			</Modal>
		</div>
	);
}