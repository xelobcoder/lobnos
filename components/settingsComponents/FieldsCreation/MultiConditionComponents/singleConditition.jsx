import { useState } from 'react';
import Select from 'react-select';


export default function SingleMultipleCreationFormComponent({ parameters, constraintField }) {
    const [constraint, setConstraint] = useState(constraintField);
    const [selectedOption, setSelectedOption] = useState(null);

    return (
        <div className='grid-4'>
            <div className="form-row">
                <label>Parameter selection</label>
                <Select
                    options={parameters}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    placeholder="Select a field..."
                    isClearable
                />
            </div>
            <div className="form-group mx-2">
                <label>constraits</label>
                <select
                    // onChange={(ev) => { handleChangeWithState(ev, 'constraint', setField, field) }} 
                    // value={field.constraint}
                    className="custom-select">
                    <option value={0}>select an option here</option>
                    <option value={1}>less than value</option>
                    <option value={2}>greater than value</option>
                    <option value={3}>match value</option>
                    <option value={4}>does not match value</option>
                </select>
            </div>
            <div className="form-group mx-2">
                <label>Value to target</label>
                <input type='text' className='custom-input' />
            </div>
            <div className='form-group'>
                <label>action</label>
                <br />
                <button className='btn btn-primary'>create a validator</button>
            </div>
        </div>
    )
}