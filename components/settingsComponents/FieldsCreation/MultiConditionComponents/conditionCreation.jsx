import { useEffect, useState } from "react";
import SingleMultipleCreationFormComponent from "./singleConditition";

export default function MultiConditionCreationFormChildren({ fields = [], conditionName = '', constraints = [], addingConstraints }) {
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
            <h4>{conditionName}</h4>
            <div className="alert alert-secondary">
                <SingleMultipleCreationFormComponent conditionName={conditionName} parameters={parameters}
                    addingConstraints={addingConstraints} constraintField={constraints} />
            </div>
        </div>
    )
} 