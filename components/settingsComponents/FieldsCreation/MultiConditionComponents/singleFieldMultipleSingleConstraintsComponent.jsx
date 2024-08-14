export default function SingleFieldMultipleSingleConstraintsComponent({ field, index }) {
    return (
        <div className="form-row grid-5">
            <div className="form-group mx-2">
                <label>constraits</label>
                <select onChange={(ev) => { handleChangeWithState(ev, 'constraint', setField, field) }} value={field.constraint} className="custom-select">
                    <option value={0}>select an option here</option>
                    <option value={1}>less than value</option>
                    <option value={2}>greater than value</option>
                    <option value={3}>match value</option>
                    <option value={4}>does not match value</option>
                </select>
            </div>
            <div className="form-group">
                <label>value</label>
                <input type="text"
                    onChange={(ev) => { handleChangeWithState(ev, 'valueAlert', setField, field) }}
                    className="custom-input" value={field.valueAlert} />
            </div>

            <div className="form-group mx-2">
                <label>action</label>
                <select onChange={(ev) => { handleChangeWithState(ev, 'alert', setField, field) }} value={field.alert} className="custom-select">
                    <option>select an option below</option>
                    <option value={1}>alert</option>
                    <option value={2}>do not alert</option>
                    <option value={3}>replace value with custom text</option>
                </select>
            </div>
            {field?.alert && field.alert == 3 && <div className="form-row">
                <label>Replace value </label>
                <input type="text" className="custom-input" />
            </div>}
        </div>
    )
}