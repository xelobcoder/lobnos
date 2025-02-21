import { useState } from 'react';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../Auth/customFetch';
import styles from '../../../../styles/SmsTemplateList.module.css'

const constraintOptions = [
    { value: 1, label: "Less than value" },
    { value: 2, label: "Greater than value" },
    { value: 3, label: "Match value" },
    { value: 4, label: "Does not match value" },
    { value: 5, label: 'In range of two values' }
];



export default function MultiConditionCreationFormChildren({ conditionName, constraintField = [], parameters = [], addingConstraints, removingConstraints, conditionIndex }) {
    const [selectedParameter, setSelectedParameter] = useState(null);
    const [selectedConstraint, setSelectedConstraint] = useState(null);
    const [targetValue, setTargetValue] = useState('');

    const handleParameterChange = (option) => {
        setSelectedParameter(option);
    };

    const handleConstraintChange = (option) => {
        setSelectedConstraint(option);
    };

    const handleTargetValueChange = (event) => {
        setTargetValue(event.target.value);
    };

    const validateTargetValue = () => {
        const constraintValue = selectedConstraint?.value;
        if (constraintValue === 1 || constraintValue === 2) {
            return { evaluation: !isNaN(targetValue) && !isNaN(parseFloat(targetValue)), warning: 'Only Numbers allowed' };
        } else if (constraintValue === 3 || constraintValue === 4) {
            return { evaluation: true }
        } else if (constraintValue === 5) {
            if (!targetValue.includes("-")) {
                return {
                    evaluation: false,
                    warning: 'Must include - delimeter'
                }
            };
            const [min, max] = targetValue.split('-');
            return {
                evaluation: !isNaN(min) && !isNaN(max) && targetValue.includes('-'),
                warning: `must be numbers and have a - delimeter`
            };
        }
        return { evaluation: false }
    };

    const handleCreateValidator = () => {
        const status = validateTargetValue();
        if (!selectedParameter || !selectedConstraint || !status.evaluation) {
            alert(status.warning);
            return;
        }

        const newConstraint = {
            parameter: selectedParameter.label,
            conditionConstraint: selectedConstraint.label,
            target: targetValue,
            inRange: selectedConstraint.value === 5
        };

        addingConstraints(conditionName, newConstraint.parameter, newConstraint.conditionConstraint, newConstraint.target, newConstraint.inRange);

        setSelectedParameter(null);
        setSelectedConstraint(null);
        setTargetValue('');
    };

    const handleRemoveConstraint = (constraintIndex) => {
        removingConstraints(constraintIndex, conditionIndex)
    };




    return (
        <div>
            <div className='grid-4'>
                <div className="form-row">
                    <label className=' pls-label'>Parameter selection</label>
                    <Select
                        options={parameters}
                        value={selectedParameter}
                        onChange={handleParameterChange}
                        styles={reactSelectCustomStyles}
                        placeholder="Select a field..."
                        isClearable
                    />
                </div>
                <div className="form-group mx-2">
                    <label>Constraints</label>
                    <Select
                        options={constraintOptions}
                        value={selectedConstraint}
                        styles={reactSelectCustomStyles}
                        onChange={handleConstraintChange}
                        placeholder="Select a constraint..."
                        isClearable
                    />
                </div>
                <div className="form-group mx-2">
                    <label>Value to target</label>
                    <input
                        type='text'
                        className='custom-input'
                        value={targetValue}
                        onChange={handleTargetValueChange}
                    />
                </div>
                <div className='form-group'>
                    <label>Action</label>
                    <br />
                    <button
                        className='btn btn-primary btn-sm'
                        onClick={handleCreateValidator}
                    >
                        Create a Validator
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <h5 className=' pls-label bg-secondary-subtle p-2 br-5 col-2'>Added Constraints</h5>
                <table className={`${styles.table} table-sm pls-label`}>
                    <thead>
                        <tr>
                            <th className=' pls-label'>SR No.</th>
                            <th className='  pls-label'>Parameter</th>
                            <th className='  pls-label'>Constraint</th>
                            <th className='  pls-label'>Value to Target</th>
                            <th className='  pls-label'>Action</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm'>
                        {constraintField.map((constraint, index) => (
                            <tr key={index}>
                                <td><input type='checkbox' style={{ height: 20, width: 20 }} /></td>
                                <td>{constraint.parameter}</td>
                                <td>{constraint.conditionConstraint}</td>
                                <td>{constraint.target}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoveConstraint(index)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
