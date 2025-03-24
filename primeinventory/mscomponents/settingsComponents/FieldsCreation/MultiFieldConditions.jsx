import { useState } from "react";
import MultiConditionCreationFormChildren from "./MultiConditionComponents/conditionCreation";


export default function MultiFieldSelectConditions({ fields = [] }) {
    const [conditions, setConditions] = useState([]);
    const [conditionError, setConditionError] = useState({ show: false, error: "" });
    const [input, setInput] = useState("");


    const hasMatch = function (conditionName) {
        return conditions.filter((item, index) => item.conditionName.trim() === conditionName.trim()).length > 0
    }

    const hasConstraintFieldHasParameter = function (condition_field, parameter) {
        if (!Array.isArray(condition_field) || condition_field.length === 0) return false;
        return condition_field.filter((item, index) => item.parameter.trim() === parameter).length > 0;
    }

    const createCondition = function () {
        if (input.trim().length < 3) {
            setConditionError({ show: true, error: 'Condition name must be greater than or equal to 3 in length' })
            return
        };
        const condition = {};
        condition.conditionName = input;
        condition.fieldConstaints = [];
        if (conditions.length === 0) {
            setConditions([...conditions, condition])
        } else {
            if (hasMatch(input)) { setInput(""); return }
            setConditions([...conditions, condition]);
        }
        setInput("");
        if (conditionError.show) {
            setConditionError({ show: false, error: "" })
        }
    }

    function updatingConstraints(constraintName) {

    }


    function addingConstraints(constraintName, parameter, condition, target, inRange) {
        if (!hasMatch(constraintName)) return;
        let singleConstraints = { parameter, condition, target, inRange };

        const constaintPosition = conditions.findIndex((constaint, indexPos) => constaint.conditionName.trim() === constraintName.trim());

        const conditionConstraintField = conditions[constaintPosition]['fieldConstaints'];

        if (hasConstraintFieldHasParameter(conditionConstraintField, parameter)) return;
        const nwfieldConstaints = [...conditionConstraintField, singleConstraints];

        let newConditions = [...conditions];
        newConditions[constaintPosition]['fieldConstaints'] = nwfieldConstaints;
        setConditions(newConditions);
    }



    const handleRemoveConstraintItem = (index, constraintIndex) => {
        setConstraintsList(prevList => prevList.filter((_, i) => i !== index));
    };

    function removingConstraints(constraintName) {
        setConditions(prevList => prevList.filter((_item, i) => _item.conditionName !== constraintName));
    }


    return (
        <section className="_multiple-field-condition_field ">
            <div className="text-danger">
                {conditionError.error}
            </div>
            <div className="col-3">
                <div className="condition-name form-group">
                    <label>condition name</label>
                    <input value={input} onChange={(ev) => { setInput(ev.target.value) }} type="text" className="form-control" />
                    <button onClick={createCondition} className="btn btn-primary btn-sm my-2">create condition</button>
                </div>
            </div>
            <hr />
            <div >
                {conditions.length > 0 && conditions.map((item, index) => <MultiConditionCreationFormChildren
                    removingConstraints={removingConstraints}
                    key={index}
                    addingConstraints={addingConstraints} fields={fields} conditionName={item.conditionName} constraints={item.fieldConstaints} />)}
            </div>
        </section>
    );
}
