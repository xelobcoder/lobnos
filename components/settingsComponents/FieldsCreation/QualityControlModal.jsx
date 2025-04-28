import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { customFetch } from '../../Auth/customFetch';
import { toast } from 'react-toastify';

export default function QualityControlModal({ show, onHide, testId, testName }) {
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTestFields = async () => {
            if (!testId || !show) return;
            
            try {
                setIsLoading(true);
                const response = await customFetch(`test/creation-rules/only/${testId}`);
                if (response.status === true) {
                    setFields(response.data);
                }
            } catch (error) {
                toast.error('Failed to load test fields');
                console.error('Error loading test fields:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestFields();
    }, [testId, show]);

    const handleValueChange = (fieldId, type, value) => {
        setFields(prevFields => prevFields.map(field => {
            if (field.id === fieldId) {
                return { ...field, [type]: parseFloat(value) || '' };
            }
            return field;
        }));
    };

    const handleSaveQC = async (fieldId) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;
    
        try {
            const response = await customFetch('test/quality-control/save', 'POST', {
                fieldId,
                levels: [1, 2, 3].map(level => ({
                    level,
                    expectedValue: field[`expectedValue${level}`],
                    standardDeviation: field[`standardDeviation${level}`]
                }))
            });
    
            if (response.status === true) {
                toast.success('Quality control values saved successfully');
            } else {
                toast.error('Failed to save quality control values');
            }
        } catch (error) {
            toast.error('Error saving quality control values');
            console.error(error);
        }
    };

    return (
        <Modal show={show} onHide={onHide} fullscreen backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Quality Control - {testName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <div className="text-center p-4">Loading test fields...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm pls-label">
                            <thead>
                                <tr>
                                    <th rowSpan="2">Field Name</th>
                                    <th colSpan="3" className="text-center">Expected Value*</th>
                                    <th colSpan="3" className="text-center">Standard Deviation (SD)</th>
                                    <th colSpan="3" className="text-center">Warning Limit (±2SD)</th>
                                    <th colSpan="3" className="text-center">Action Limit (±3SD)</th>
                                    <th rowSpan="2">Actions</th>
                                </tr>
                                <tr>
                                    <th>Level 1</th>
                                    <th>Level 2</th>
                                    <th>Level 3</th>
                                    <th>Level 1</th>
                                    <th>Level 2</th>
                                    <th>Level 3</th>
                                    <th>Level 1</th>
                                    <th>Level 2</th>
                                    <th>Level 3</th>
                                    <th>Level 1</th>
                                    <th>Level 2</th>
                                    <th>Level 3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field) => (
                                    <tr key={field.id}>
                                        <td>{field.name}</td>
                                        {[1, 2, 3].map(level => (
                                            <>
                                                <td key={`ev-${level}`}>
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        value={field[`expectedValue${level}`] || ''}
                                                        onChange={(e) => handleValueChange(field.id, `expectedValue${level}`, e.target.value)}
                                                    />
                                                </td>
                                            </>
                                        ))}
                                        {[1, 2, 3].map(level => (
                                            <td key={`sd-${level}`}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="form-control form-control-sm"
       vvcv                                              onChange={(e) => handleValueChange(field.id, `standardDeviation${level}`, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                        {[1, 2, 3].map(level => (
                                            <td key={`wl-${level}`} className="text-center">
                                                {field[`expectedValue${level}`] && field[`standardDeviation${level}`] ? 
                                                    `${(field[`expectedValue${level}`] - (2 * field[`standardDeviation${level}`])).toFixed(2)} - ${(field[`expectedValue${level}`] + (2 * field[`standardDeviation${level}`])).toFixed(2)}` 
                                                    : 'N/A'}
                                            </td>
                                        ))}
                                        {[1, 2, 3].map(level => (
                                            <td key={`al-${level}`} className="text-center">
                                                {field[`expectedValue${level}`] && field[`standardDeviation${level}`] ? 
                                                    `${(field[`expectedValue${level}`] - (3 * field[`standardDeviation${level}`])).toFixed(2)} - ${(field[`expectedValue${level}`] + (3 * field[`standardDeviation${level}`])).toFixed(2)}` 
                                                    : 'N/A'}
                                            </td>
                                        ))}
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleSaveQC(field.id)}
                                                disabled={!field.expectedValue1 || !field.standardDeviation1}
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <small className="text-muted">* Expected Value must be greater than 0</small>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}