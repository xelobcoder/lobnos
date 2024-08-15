import React, { useEffect, useState } from 'react';
import { constraintsFormatting } from '../../settingsComponents/FieldsCreation/data/testUtil';

export default function OptionsViewHtmlGenerator({ fieldItem, statehandler, index }) {
    const { options, name, units, fieldConstraints, entrymode, value } = fieldItem;
    const [dropdownOptions, setOptions] = useState([]);

    useEffect(() => {
        if (typeof options === 'string' && options.includes(',')) {
            setOptions(options.split(',').map(option => option.trim()));
        }
    }, [options]);

    return (
        <tr>
            <td>{name}</td>
            <td>
                <select onChange={(ev) => { statehandler(ev, index) }} className='custom-select' value={value}>
                    <option>select an option below</option>
                    {dropdownOptions.map((option, ind) => (
                        <option key={ind} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </td>
            <td>{units}</td>
            <td></td>
            <td>
                {entrymode}
            </td>
            <td>
                {constraintsFormatting(fieldConstraints)}
            </td>
        </tr>
    );
}
