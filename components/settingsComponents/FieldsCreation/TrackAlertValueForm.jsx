import { useState } from "react";
import { Add } from "@mui/icons-material";
import SingleFieldMultipleSingleConstraintsComponent from "./MultiConditionComponents/singleFieldMultipleSingleConstraintsComponent";
import { defaultConstaints } from './data/testUtil'

export default function TrackAlertLevelValueForm({ field, setField }) {
    const { isValueTracked } = field;
    const showTrack = !isNaN(isValueTracked) && parseInt(isValueTracked) === 1;
    const [createdConstraints, setCreatedConstraints] = useState([]);

    const updateFieldTrack = (ev) => {
        const { checked } = ev.target;
        setField({ ...field, isValueTracked: checked ? 1 : 0 });
    }

    const createConstraints = () => {
        setCreatedConstraints([...createdConstraints, defaultConstaints]);
    }

    const handleChangeWithState = (index, target, event) => {
        const { value } = event.target;
        setCreatedConstraints(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [target]: value };
            }
            return updated;
        });
    }

    return (
        <div className="my-4">
            <div id="trackalertlevelvalue" className="pointer">
                <div className="form-row d-flex justify-content-between">
                    <div>
                        <input
                            checked={field?.isValueTracked === 1}
                            onChange={(ev) => updateFieldTrack(ev)}
                            type="checkbox"
                        />
                        Track value(es) of parameter
                    </div>
                    <button
                        type="button"
                        className="btn btn-light text-primary text-capitalize"
                        onClick={createConstraints}
                    >
                        <Add /> add new constraint
                    </button>
                </div>
                {showTrack && createdConstraints.length > 0 && createdConstraints.map((item, index) =>
                    <SingleFieldMultipleSingleConstraintsComponent
                        key={index}
                        index={index}
                        field={item}
                        handleChangeWithState={handleChangeWithState}
                    />
                )}
            </div>
        </div>
    )
}
