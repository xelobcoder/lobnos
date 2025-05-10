"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import CustomParameterTypeSelection from "./CustomParameterTypeSelection";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { defaultCreationRule, parseTextToObject, updateFieldsRules } from "./data/testUtil";
import UltrasoundFieldsCreation from "./UltrasoundFieldsCreation";
import TestFieldsHeader from './TestFieldsHeader';
import styles from './createfields.module.css';
import ParamCreationGForm from "./ParamCreationForm";

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
		if (!_field.plan) {
			return setError("Please select an input type");
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
		<div className={styles.container}>
			<TestFieldsHeader testid={testid} testname={testname} />
			
			<div className={styles.columnPartitioner}>
				<div className={styles.column1}>
					{error && <div className={`${styles.error} text-sm text-danger`}>{error}</div>}

					{generalTestRule?.department && generalTestRule?.department.toString().toLowerCase() === "ultrasound" && (
						<div className={styles.formGroup}>
							<label>Result Entry Type</label>
							<select className={styles.select} onChange={handleUltrasoundChangeType}>
								<option value="">Select an option below</option>
								<option value="parameter">By Parameter</option>
								<option value="report">Full Report View</option>
							</select>
						</div>
					)}

					{generalTestRule?.department && generalTestRule?.department.toString().toLowerCase() === "ultrasound" ? (
						<UltrasoundFieldsCreation
							generalTestRule={generalTestRule}
							handleCreateField={handleCreateField}
							field={field}
							setField={setField}
						/>
					) : (
						<div className={styles.formSection}>
							<h2 className={'pls-label bg-secondary-subtle p-2 br-5'}>Parameter / Field Creation</h2>
							<div className={styles.formColumns}>
								<div className={styles.formColumnLeft}>
									<ParamCreationGForm
										field={field}
										setField={setField}
										generalTestRule={generalTestRule}
										fieldConstraintsCategorization={fieldConstraintsCategorization}
									/>
								</div>
								<div className={styles.formColumnRight}>
                                    <CustomParameterTypeSelection selection={field.plan} field={field} setField={setField} />
                                </div>
                            </div>
                            <div className={styles.actionButtons}>
                                <Button variant="success" size="sm" onClick={handleCreateField}>
                                    Create Field
                                </Button>
                                <Button variant="danger" size="sm">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.column2}>
                    <div className={styles.formSection}>
                        <h2 className={'pls-label bg-secondary-subtle p-2 br-5'}>Fields</h2>
                        <div className={styles.formContent}>
                            {data.length === 0 ? (
                                <p className={styles.emptyState}>No fields created</p>
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
                        <div className={styles.actionButtons}>
                            <Button
                                variant="success"
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
            </div>
        </div>
    );
}
