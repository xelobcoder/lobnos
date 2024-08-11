import { useEffect, useState } from 'react';
import Select from 'react-select';

const constraintOptions = [
    { value: 1, label: "Less than value" },
    { value: 2, label: "Greater than value" },
    { value: 3, label: "Match value" },
    { value: 4, label: "Does not match value" }
];

export default function MultiConditionCreationFormChildren({ fields = [], conditionName = '', constraintField = [], parameters = [], addingConstraints }) {
    const [selectedParameter, setSelectedParameter] = useState(null);
    const [selectedConstraint, setSelectedConstraint] = useState(null);
    const [targetValue, setTargetValue] = useState('');

    useEffect(() => {
        if (fields.length > 0) {
            const fieldOptions = fields.map(item => ({
                value: item.name,
                label: item.name
            }));
        }
    }, [fields]);

    const handleParameterChange = (option) => {
        setSelectedParameter(option);
    };

    const handleConstraintChange = (option) => {
        setSelectedConstraint(option);
    };

    const handleTargetValueChange = (event) => {
        setTargetValue(event.target.value);
    };

    const handleCreateValidator = () => {
        if (!selectedParameter || !selectedConstraint || targetValue.trim() === "") {
            alert("Please fill in all fields.");
            return;
        }
        const newConstraint = {
            parameter: selectedParameter.label,
            condition: selectedConstraint.label,
            target: targetValue
        };
        setSelectedParameter(null);
        setSelectedConstraint(null);
        setTargetValue('');
        addingConstraints(conditionName,newConstraint.parameter,newConstraint.condition, newConstraint.target)
    };

    const handleRemoveConstraint = (index) => {
        setConstraintsList(prevList => prevList.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className='grid-4'>
                <div className="form-row">
                    <label>Parameter selection</label>
                    <Select
                        options={parameters}
                        value={selectedParameter}
                        onChange={handleParameterChange}
                        placeholder="Select a field..."
                        isClearable
                    />
                </div>
                <div className="form-group mx-2">
                    <label>Constraints</label>
                    <Select
                        options={constraintOptions}
                        value={selectedConstraint}
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
                        className='btn btn-primary'
                        onClick={handleCreateValidator}
                    >
                        Create a Validator
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <h5>Added Constraints</h5>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Constraint</th>
                            <th>Value to Target</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {constraintField.map((constraint, index) => (
                            <tr key={index}>
                                <td>{constraint.parameter}</td>
                                <td>{constraint.condition}</td>
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
