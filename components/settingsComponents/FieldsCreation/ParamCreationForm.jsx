import { handleChangeWithState } from "../../Auth/customFetch";
import { handleCreationMasterRUle } from "./data/testUtil";

export default function ParamCreationGForm({ field, setField, generalTestRule }) {
    return <form >
        <div className="">
            <div className="grid-reg">
                <label>Field Name</label>
                <input
                    value={field?.name}
                    placeholder="Name"
                    onChange={(ev) => handleChangeWithState(ev, "name", setField, field)}
                    className="custom-input"
                    type="text"
                />
            </div>

            <div className="grid-reg my-2">
                <label>Method</label>
                <select
                    onChange={(ev) => {
                        const updatedField = handleCreationMasterRUle(ev, field);
                        setField(updatedField);
                    }}
                    className="custom-select"
                    value={field.plan}
                >
                    <option>Select an option</option>
                    <option value="options">Dropdown</option>
                    <option disabled={!generalTestRule.hasGenderVariation} value="plain">
                        Use plain text field for reference range
                    </option>
                    <option disabled={generalTestRule.hasGenderVariation} value="limits">
                        Use reference ranges
                    </option>
                    <option value="input">Use a field input for text or numbers</option>
                    <option value="textReference">Use a field input for text or numbers with reference that are text</option>
                </select>
            </div>

            <div className="grid-reg my-2">
                <label>Has Units</label>
                <select
                    value={`${field.hasunits}`}
                    onChange={(ev) => setField({ ...field, hasunits: ev.target.value === "true" })}
                    className="custom-select"
                >
                    <option>Select an option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            {field.hasunits && (
                <div className="grid-reg my-2">
                    <label>Field Units</label>
                    <input
                        onChange={(ev) => handleChangeWithState(ev, "units", setField, field)}
                        value={field.units}
                        className="custom-input"
                    />
                </div>
            )}
        </div>
    </form>
}