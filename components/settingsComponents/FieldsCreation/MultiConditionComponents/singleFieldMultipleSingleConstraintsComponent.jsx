import { ALERT_OPTIONS, CONSTRAINTSLEVEL } from "../data/testUtil"

export default function SingleFieldMultipleSingleConstraintsComponent({ field, index, handleChangeWithState }) {

    return (<tr>
        <td>
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
        </td>
        <td>
            <input
                type="text"
                onChange={(ev) => handleChangeWithState(index, 'valueAlert', ev)}
                className="custom-input"
                value={field.valueAlert || ''}
            />
        </td>
        <td>
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
        </td>
        <td>
            {field?.alert == 3 && (
                <div className="form-group mx-2">
                    <input
                        type="text"
                        className="custom-input"
                        onChange={(ev) => handleChangeWithState(index, 'replacementText', ev)}
                        value={field.replacementText || ''}
                    />
                </div>
            )}
        </td>
        <td>
            <input
                type="text"
                className="custom-input"
                onChange={(ev) => handleChangeWithState(index, 'prefix', ev)}
                value={field.prefix || ''}
            />
        </td>
        <td>
            <input
                type="text"
                className="custom-input"
                onChange={(ev) => handleChangeWithState(index, 'suffix', ev)}
                value={field.suffix || ''}
            />
        </td>
    </tr>
    )
}
