import { handleChangeWithState } from "../../Auth/customFetch"

export default function ParameterPlainOption({ setField, field }) {
    return <div>
        <label>Reference field</label>
        <textarea
            value={field.plain}
            rows={4}
            cols={5}
            className="form-control"
            onChange={(ev) => handleChangeWithState(ev, "plain", setField, field)}
        />
    </div>
}


