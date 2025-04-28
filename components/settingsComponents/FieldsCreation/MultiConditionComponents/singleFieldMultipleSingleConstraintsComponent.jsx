import { ALERT_OPTIONS, CONSTRAINTSLEVEL } from "../data/testUtil";
import Select from 'react-select';
import { reactSelectCustomStyles } from "../../../Auth/customFetch";

export default function SingleFieldMultipleSingleConstraintsComponent({ field, index, handleChangeWithState }) {
    const constraintOptions = CONSTRAINTSLEVEL.map(({ value, description, shortcut }) => ({
        value: shortcut,
        label: description
    }));

    const alertOptions = ALERT_OPTIONS.map(({ value, label, action }) => ({
        value: action,
        label: label
    }));

    const handleSelectChange = (option, actionMeta) => {
        const ev = { target: { value: option.value } };
        handleChangeWithState(index, actionMeta.name, ev);
    };

    const handleValueChange = (ev) => {
        let value = ev.target.value;
        if (field.constraint_type === 'between') {
            value = value.replace(/[^0-9-]/g, '');
            const hyphenCount = (value.match(/-/g) || []).length;
            if (hyphenCount > 1) {
                value = value.replace(/-/g, (match, offset) => offset === value.indexOf('-') ? match : '');
            }
        }
        handleChangeWithState(index, 'value', { target: { value } });
    };

    return (<tr>
        <td>
            <Select
                options={constraintOptions}
                value={constraintOptions.find(option => option.value === field.constraint_type)}
                onChange={(option) => handleSelectChange(option, { name: 'constraint_type' })}
                styles={reactSelectCustomStyles}
                placeholder="Select constraint"
                name="constraint_type"
            />
        </td>
        <td>
            <input
                type="text"
                onChange={handleValueChange}
                className="custom-input"
                value={field.value || ''}
                placeholder={field.constraint_type === 'between' ? "e.g., 20-40" : "Enter value"}
            />
        </td>
        <td>
            <Select
                options={alertOptions}
                value={alertOptions.find(option => option.value === field.action)}
                onChange={(option) => handleSelectChange(option, { name: 'action' })}
                styles={reactSelectCustomStyles}
                placeholder="Select action"
                name="action"
            />
        </td>
        <td>
            {field.action === 'replace' && (
                <div className="form-group mx-2">
                    <input
                        type="text"
                        className="custom-input"
                        onChange={(ev) => handleChangeWithState(index, 'replacement_text', ev)}
                        value={field.replacement_text || ''}
                        placeholder="Enter replacement text"
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
    );
}
