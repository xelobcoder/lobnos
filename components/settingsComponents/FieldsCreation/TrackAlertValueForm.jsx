import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import SingleFieldMultipleSingleConstraintsComponent from "./MultiConditionComponents/singleFieldMultipleSingleConstraintsComponent";
import { defaultConstaints } from './data/testUtil';

export default function TrackAlertLevelValueForm({ field, setField }) {
    const { isValueTracked } = field;
    const showTrack = !isNaN(isValueTracked) && parseInt(isValueTracked) === 1;
    const [createdConstraints, setCreatedConstraints] = useState([]);

    const updateFieldTrack = (ev) => {
        const { checked } = ev.target;
        setField({ ...field, isValueTracked: checked ? 1 : 0 });
    };

    const createConstraints = () => {
        setCreatedConstraints(prev => [...prev, defaultConstaints]);
    };

    const handleChangeWithState = (index, target, event) => {
        const { value } = event.target;
        setCreatedConstraints(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [target]: value };
            }
            return updated;
        });
    };

    const updateFieldConstraints = () => {
        setField(prevField => ({ ...prevField, fieldConstraints: createdConstraints }));
    };

    useEffect(() => {
        if (field.fieldConstraints && field.fieldConstraints.length > 0) {
            setCreatedConstraints(field.fieldConstraints);
        }
    }, [field.fieldConstraints]);

    useEffect(() => {
        updateFieldConstraints();
    }, [createdConstraints]);

    return (
        <div className="my-4">
            <div id="trackalertlevelvalue" className="pointer">
                <div className="form-row d-flex justify-content-between">
                    <div>
                        <input
                            checked={field?.isValueTracked === 1}
                            onChange={updateFieldTrack}
                            type="checkbox"
                        />
                        Track value(s) of parameter
                    </div>
                    {showTrack && <button
                        type="button"
                        className="btn btn-light btn-sm text-primary text-capitalize"
                        onClick={createConstraints}
                    >
                        <Add /> add new constraint
                    </button>}
                </div>
                {showTrack && createdConstraints.length > 0 && (
                    <table className="billing-cart-table my-2">
                        <thead>
                            <tr>
                                <th>constraints</th>
                                <th>value</th>
                                <th>action</th>
                                <th>replacing value</th>
                                <th>prefix</th>
                                <th>suffix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {createdConstraints.map((item, index) => (
                                <SingleFieldMultipleSingleConstraintsComponent
                                    key={index}
                                    index={index}
                                    field={item}
                                    handleChangeWithState={handleChangeWithState}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
