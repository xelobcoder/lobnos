import { useEffect, useState } from "react";
import { handleChangeWithState } from "../../Auth/customFetch"
import { Add } from "@mui/icons-material";
import SingleFieldMultipleSingleConstraintsComponent from "./MultiConditionComponents/singleFieldMultipleSingleConstraintsComponent";
import { defaultConstaints } from "./data/testUtil";

export default function TrackAlertLevelValueForm({ field, setField }) {
    const { isValueTracked, fieldConstraints } = field;
    const showTrack = !isNaN(isValueTracked) && parseInt(isValueTracked) === 1;
    const [createdContraints, setCreatedConstraints] = useState([]);
    const updateFieldTrack = (ev) => {
        const { checked } = ev.target;
        setField({ ...field, isValueTracked: checked === checked ? 1 : 0 })
    }


    const createContraints = () => {
        setCreatedConstraints([defaultConstaints]);
    }
    

    const renderConstraints = () => {
        if (createdContraints.length > 0) {
            {
                return createdContraints.map((item, index) => {
                    return <SingleFieldMultipleSingleConstraintsComponent key={index} index={index} field={field} />
                })
            }
        }
    }

    console.log(createdContraints,showTrack)

    return (
        <div className="my-4" >
            <form id="trackalertlevelvalue">
                <div className="form-row d-flex justify-content-between">
                    <div>
                        <input checked={field?.isValueTracked === 1} onChange={(ev) => { updateFieldTrack(ev) }} type="checkbox" /> Track value(es) of parameter
                    </div>
                    <button type="button" onClick={createContraints} >
                        <Add />
                    </button>
                </div>
                {showTrack && renderConstraints()}
            </form>
        </div>
    )
}