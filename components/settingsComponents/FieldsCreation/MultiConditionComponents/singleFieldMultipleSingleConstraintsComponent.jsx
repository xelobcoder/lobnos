import { ALERT_OPTIONS, CONSTRAINTSLEVEL } from "../data/testUtil"

export default function SingleFieldMultipleSingleConstraintsComponent({ field, index, handleChangeWithState }) {
    console.log(field)
    return (
        <div className="form-row grid-5 alert my-2 alert-secondary">
            <div className="form-group mx-2">
                <label>constraints</label>
                <select
                    onChange={(ev) => handleChangeWithState(index, 'constraint', ev)}
                    value={field.constraint || ''}
                    className="custom-select"
                >
                    {CONSTRAINTSLEVEL.map(({ value, description }) => (
                        <option key={value} value={value}>
                            {description}
                        </option>
                    ))}
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
                    {Object.entries(ALERT_OPTIONS).map(([value, description]) => (
                        <option key={value} value={value}>
                            {description}
                        </option>
                    ))}
                </select>
            </div>


            {field?.alert == 3 && (
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
