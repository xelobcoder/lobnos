export default function SingleFieldMultipleSingleConstraintsComponent({ field, index, handleChangeWithState }) {
    return (
        <div className="form-row grid-5 alert my-2 alert-secondary">
            <div className="form-group mx-2">
                <label>constraints</label>
                <select
                    onChange={(ev) => handleChangeWithState(index, 'constraint', ev)}
                    value={field.constraint || ''}
                    className="custom-select"
                >
                    <option value={0}>select an option here</option>
                    <option value={1}>less than value</option>
                    <option value={2}>greater than value</option>
                    <option value={3}>match value</option>
                    <option value={4}>does not match value</option>
                </select>
            </div>
            <div className="form-group">
                <label>value</label>
                <input
                    type="text"
                    onChange={(ev) => handleChangeWithState(index, 'valueAlert', ev)}
                    className="custom-input"
                    value={field.valueAlert || ''}
                />
            </div>

            <div className="form-group mx-2">
                <label>action</label>
                <select
                    onChange={(ev) => handleChangeWithState(index, 'alert', ev)}
                    value={field.alert || ''}
                    className="custom-select"
                >
                    <option value={0}>select an option below</option>
                    <option value={1}>alert</option>
                    <option value={2}>do not alert</option>
                    <option value={3}>replace value with custom text</option>
                </select>
            </div>


            {field?.alert === 3 && (
                <div className="form-group mx-2">
                    <label>replace with</label>
                    <input
                        type="text"
                        className="custom-input"
                        onChange={(ev) => handleChangeWithState(index, 'replacementText', ev)}
                        value={field.replacementText || ''}
                    />
                </div>
            )}

            <div className="form-group mx-2">
                <label>prefix</label>
                <input
                    type="text"
                    className="custom-input"
                    onChange={(ev) => handleChangeWithState(index, 'prefix', ev)}
                    value={field.prefix || ''}
                />
            </div>

            <div className="form-group mx-2">
                <label>suffix</label>
                <input
                    type="text"
                    className="custom-input"
                    onChange={(ev) => handleChangeWithState(index, 'suffix', ev)}
                    value={field.suffix || ''}
                />
            </div>
        </div>
    )
}
