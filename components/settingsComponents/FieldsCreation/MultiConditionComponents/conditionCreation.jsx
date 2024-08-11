import { useEffect, useState } from "react";
import SingleMultipleCreationFormComponent from "./singleConditition";

export default function MultiConditionCreationFormChildren({ fields = [], conditionName = '', constraints = [], addingConstraints, removingConstraints = { removingConstraints } }) {
    const [parameters, setParameters] = useState([]);

    const getParameters = function (fields) {
        if (Array.isArray(fields) && fields.length > 0) {
            const fieldset = fields.map((item) => item?.name ? { value: item.name, label: item.name } : '').filter(Boolean);
            setParameters(fieldset);
        }
        return [];
    }

    useEffect(() => {
        getParameters(fields);
    }, [fields]);


    return (
        <div>
            <div className="d-flex justify-content-between my-2">
                <h4>{conditionName}</h4>
                <button onClick={(ev) => { removingConstraints(conditionName) }} className="btn btn-danger">remove condition</button>
            </div>
            <div className="alert alert-secondary">
                <SingleMultipleCreationFormComponent conditionName={conditionName} parameters={parameters}
                    addingConstraints={addingConstraints} constraintField={constraints} />
            </div>
        </div>
    )
} 