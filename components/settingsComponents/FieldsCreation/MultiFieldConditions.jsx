'use client'
import { useState } from "react";
import MultiConditionCreationFormChildren from "./MultiConditionComponents/conditionCreation";
import { customPost } from "../../Auth/customFetch";
import { toast } from "react-toastify";
import PrimeToast from '../../../components/accessories/PrimeToast'
import { Spinner } from "react-bootstrap";
import { useApplicationSettings } from "../../Auth/useApplicationContext";


export default function MultiFieldSelectConditions({ fields = [], testid, conditionInitData }) {
	const [conditions, setConditions] = useState([conditionInitData]);
	const [conditionError, setConditionError] = useState({ show: false, error: "" });
	const [pending, setPending] = useState(false);
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;


	const hasMatch = function (conditionName) {
		return conditions.filter((item, index) => item.conditionName.trim() === conditionName.trim()).length > 0
	}

	const hasConstraintFieldHasParameter = function (condition_field, parameter) {
		if (!Array.isArray(condition_field) || condition_field.length === 0) return false;
		return condition_field.filter((item, index) => item.parameter.trim() === parameter).length > 0;
	}




	function addingConstraints(constraintName, parameter, conditionConstraint, target, inRange) {
		if (!hasMatch(constraintName)) return;
		let singleConstraints = { parameter, conditionConstraint, target, inRange };

		const constaintPosition = conditions.findIndex((constaint, indexPos) => constaint.conditionName.trim() === constraintName.trim());

		const conditionConstraintField = conditions[constaintPosition]['fieldConstraints'];

		if (hasConstraintFieldHasParameter(conditionConstraintField, parameter)) return;
		const nwfieldConstraints = [...conditionConstraintField, singleConstraints];

		let newConditions = [...conditions];
		newConditions[constaintPosition]['fieldConstraints'] = nwfieldConstraints;
		setConditions(newConditions);
	}



	const handleRemoveConstraintItem = (index, constraintIndex) => {
		setConstraintsList(prevList => prevList.filter((_, i) => i !== index));
	};

	function removingConstraints(constraintIndex, conditionIndex) {
		setConditions(prevConditions => {
			return prevConditions.map((cond, i) => {
				if (i !== conditionIndex) return cond;
				const updatedConstraints = cond.fieldConstraints.filter((_, index) => index !== constraintIndex);
				return { ...cond, fieldConstraints: updatedConstraints };
			});
		});
	}


	const handleSubmitContraints = async () => {
		if (conditions.length > 0) {
			const condition = conditions[0];

			if (!condition?.fieldConstraints || condition?.fieldConstraints.length <= 0) {
				setConditionError({ show: true, error: 'Condition constraints not found' });
				return;
			}

			setPending(true);

			try {
				const response = await customPost(`multi/condition`, 'POST', { ...condition, createdBy: employeeid });
				const { status } = response;

				if (status && status === true) {
					toast.success("Conditions Updated Successfully");
				} else {
					toast.error("Conditions Update Failed");
				}
			} catch (error) {
				console.error('Error updating conditions:', error);
				toast.error("An error occurred while updating conditions");
			} finally {
				setPending(false);
			}
		}
	};

	return (
		<section className="_multiple-field-condition_field ">
			<PrimeToast />
			{
				conditionError.show && <div className="text-danger pls-label bg-danger-subtle col-4 p-2">
					{conditionError.error}
				</div>
			}
			<div >
				{conditions.length > 0 && conditions.map((item, index) => <MultiConditionCreationFormChildren
					removingConstraints={removingConstraints}
					key={index}
					conditionIndex={index}
					addingConstraints={addingConstraints} fields={fields}

					conditionName={item.conditionName} constraints={item.fieldConstraints} />)}
			</div>
			<div>
				<button
					disabled={pending}
					onClick={handleSubmitContraints}
					className="btn btn-primary btn-sm">
					{pending && <Spinner size="sm" />}	update Information
				</button>
			</div>
		</section>
	);
}