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
                <select onChange={(ev) => { statehandler(ev, index) }} className='custom-select' value={value} style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}>
                    <option style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' }}>select an option below</option>
                    {dropdownOptions.map((option, ind) => (
                        <option key={ind} value={option} style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' }}>
                            {option}
                        </option>
                    ))}
                </select>
            </td>
            <td>{units}</td>
            <td></td>
            <td className='pls-d-none'>
                {entrymode}
            </td>
            <td className='pls-d-none'>
                {constraintsFormatting(fieldConstraints)}
            </td>
        </tr>
    );
}
