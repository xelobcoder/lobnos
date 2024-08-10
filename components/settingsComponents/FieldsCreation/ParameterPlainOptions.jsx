import { handleChangeWithState } from "../../Auth/customFetch"

export default function ParameterPlainOption({ setField, field }) {
    return <div>
        <label>Reference field</label>
        <textarea
            value={field.plain}
            className="custom-input"
            onChange={(ev) => handleChangeWithState(ev, "plain", setField, field)}
        />
    </div>
}


