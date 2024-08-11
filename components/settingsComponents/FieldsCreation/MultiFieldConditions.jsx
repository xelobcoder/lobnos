import { useState } from "react";
import MultiConditionCreationFormChildren from "./MultiConditionComponents/conditionCreation";

export default function MultiFieldSelectConditions({ fields = [] }) {
    const [conditions, setConditions] = useState([]);
    const [input, setInput] = useState("");


    const hasMatch = function (conditionName) {
        return conditions.filter((item, index) => item.conditionName.trim() === conditionName.trim()).length > 0
    }

    const hasConstraintFieldHasParameter = function (condition_field, parameter) {
        if (!Array.isArray(condition_field) || condition_field.length === 0) return false;
        return condition_field.filter((item, index) => item.parameter.trim() === parameter).length > 0;
    }

    const createCondition = function () {
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
    }

    function updatingConstraints(constraintName) {

    }


    function addingConstraints(constraintName, parameter, condition, target) {
        if (!hasMatch(constraintName)) return;
        let singleConstraints = { parameter, condition, target };

        const constaintPosition = conditions.findIndex((constaint, indexPos) => constaint.name.trim() === constraintName.trim());

        console.log(constaintPosition)
    }


    function removingConstraints(constraintName) {

    }


    return (
        <section className="_multiple-field-condition_field ">
            <div className="col-3">
                <div className="condition-name form-group">
                    <label>condition name</label>
                    <input value={input} onChange={(ev) => { setInput(ev.target.value) }} type="text" className="form-control" />
                    <button onClick={createCondition} className="btn btn-primary btn-sm my-2">create condition</button>
                </div>
            </div>
            <hr />
            <div>
                {conditions.length > 0 && conditions.map((item, index) => <MultiConditionCreationFormChildren conditionName={item.conditionName} constraints={item.fieldConstaints} />)}
            </div>
        </section>
    );
}
