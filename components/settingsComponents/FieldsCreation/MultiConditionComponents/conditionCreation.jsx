import { useEffect, useState } from "react";
import SingleMultipleCreationFormComponent from "./singleConditition";

export default function MultiConditionCreationFormChildren(
    { fields = [],
        conditionName = '',
        constraints = [],
        conditionIndex,
        addingConstraints,
        removingConstraints
    }
) {

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
                <h4 className=" pls-label bg-secondary-subtle p-2 br-5 text-capitalize ">{conditionName}</h4>
            </div>
            <div>
                <SingleMultipleCreationFormComponent
                    conditionName={conditionName}
                    removingConstraints={removingConstraints}
                    parameters={parameters}
                    conditionIndex={conditionIndex}
                    addingConstraints={addingConstraints}
                    constraintField={constraints} />
            </div>
        </div>
    )
} 