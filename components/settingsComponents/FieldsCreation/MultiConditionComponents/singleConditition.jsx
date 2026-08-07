import { useState } from 'react';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../Auth/customFetch';
import PrimeTable from '../../../accessories/Datatables/PrimeTable';

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
        const normalizedTarget = typeof targetValue === 'string' ? targetValue.trim() : '';

        if (constraintValue === 1 || constraintValue === 2) {
            return { evaluation: normalizedTarget !== '' && !isNaN(normalizedTarget) && !isNaN(parseFloat(normalizedTarget)), warning: 'Only Numbers allowed' };
        } else if (constraintValue === 3 || constraintValue === 4) {
            return { evaluation: normalizedTarget !== '', warning: 'Target value is required' }
        } else if (constraintValue === 5) {
            if (!normalizedTarget.includes("-")) {
                return {
                    evaluation: false,
                    warning: 'Must include - delimeter'
                }
            };
            const [min, max] = normalizedTarget.split('-').map((item) => item.trim());
            return {
                evaluation: min !== '' && max !== '' && !isNaN(min) && !isNaN(max),
                warning: `must be numbers and have a - delimeter`
            };
        }
        return { evaluation: false }
    };

    const normalizeRangeValue = (value) => {
        const [min, max] = value.split('-').map((item) => item.trim());
        return `${min}-${max}`;
    };

    const handleCreateValidator = () => {
        if (!selectedParameter) {
            alert('Please select a parameter');
            return;
        }

        if (!selectedConstraint) {
            alert('Please select a constraint');
            return;
        }

        const status = validateTargetValue();
        if (!status.evaluation) {
            alert(status.warning);
            return;
        }

        const parsedTarget = selectedConstraint.value === 5 ? normalizeRangeValue(targetValue.trim()) : targetValue.trim();

        const newConstraint = {
            parameter: selectedParameter.label,
            conditionConstraint: selectedConstraint.label,
            target: parsedTarget,
            inRange: selectedConstraint.value === 5
        };

        const addResponse = addingConstraints(conditionName, newConstraint.parameter, newConstraint.conditionConstraint, newConstraint.target, newConstraint.inRange);

        if (addResponse && addResponse.ok === false) {
            alert(addResponse.message || 'Unable to create validator');
            return;
        }

        setSelectedParameter(null);
        setSelectedConstraint(null);
        setTargetValue('');
    };

    const handleRemoveConstraint = (constraintIndex) => {
        removingConstraints(constraintIndex, conditionIndex)
    };

    const constraintColumns = [
        {
            Header: 'SR No.',
            accessor: 'serial',
            Cell: ({ row }) => <span>{row.index + 1}</span>
        },
        {
            Header: 'Parameter',
            accessor: 'parameter',
        },
        {
            Header: 'Constraint',
            accessor: 'conditionConstraint',
        },
        {
            Header: 'Value to Target',
            accessor: 'target',
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveConstraint(row.index)}
                >
                    Remove
                </button>
            )
        }
    ];




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
                <PrimeTable
                    column={constraintColumns}
                    data={constraintField}
                    filtering={false}
                    serverSideProcessing={false}
                    showPagination={false}
                    handleSeverSideProcessing={null}
                />
            </div>
        </div>
    );
}
