import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { ControlParameterType } from '../types/ControlParameter';
import { toast } from 'react-toastify';

interface ParameterFormProps {
    formMode: 'add' | 'edit';
    currentParameter: ControlParameterType | null;
    setCurrentParameter: (param: ControlParameterType | null) => void;
    onCancel: () => void;
    onSave: () => void;
}

export function ParameterForm({
    formMode,
    currentParameter,
    setCurrentParameter,
    onCancel,
    onSave
}: ParameterFormProps) {
    const handleNumericChange = (
        field: keyof ControlParameterType, 
        value: string, 
        allowNull: boolean = true
    ) => {
        if (!currentParameter) return;
        
        let parsedValue: number | null = null;
        if (value !== '') {
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue) || (field === 'value' && parsedValue <= 0)) {
                parsedValue = allowNull ? null : 0;
            }
        } else {
            parsedValue = allowNull ? null : 0;
        }
        
        setCurrentParameter({
            ...currentParameter,
            [field]: parsedValue
        });
    };

    const isValidValue = (value: number | null | undefined): boolean => {
        return value !== null && value !== undefined && value > 0;
    };

    const handleSave = () => {
        if (!currentParameter?.parameter || !currentParameter?.unit) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!currentParameter.value || currentParameter.value <= 0) {
            toast.error('Expected value must be greater than 0');
            return;
        }

        onSave();
    };

    return (
        <div>
            <Form.Group className="mb-3">
                <Form.Label>Parameter Name*</Form.Label>
                <Form.Control
                    type="text"
                    value={currentParameter?.parameter || ''}
                    onChange={(e) => {
                        if (currentParameter) {
                            setCurrentParameter({
                                ...currentParameter,
                                parameter: e.target.value
                            });
                        }
                    }}
                    required
                    isInvalid={!currentParameter?.parameter}
                />
                <Form.Control.Feedback type="invalid">
                    Parameter name is required
                </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>Unit*</Form.Label>
                <Form.Control
                    type="text"
                    value={currentParameter?.unit || ''}
                    onChange={(e) => {
                        if (currentParameter) {
                            setCurrentParameter({
                                ...currentParameter,
                                unit: e.target.value
                            });
                        }
                    }}
                    required
                    isInvalid={!currentParameter?.unit}
                />
                <Form.Control.Feedback type="invalid">
                    Unit is required
                </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>Expected Value*</Form.Label>
                <Form.Control
                    type="number"
                    value={currentParameter?.value ?? ''}
                    onChange={(e) => handleNumericChange('value', e.target.value, false)}
                    required
                    min="0.01"
                    step="0.01"
                    isInvalid={!isValidValue(currentParameter?.value)}
                />
                <Form.Control.Feedback type="invalid">
                    Expected value must be greater than 0
                </Form.Control.Feedback>
            </Form.Group>
            
          <div className='d-flex justify-content-between'>
          
            <Form.Group className="mb-3">
                <Form.Label>Standard Deviation</Form.Label>
                <Form.Control
                    type="number"
                    value={currentParameter?.standardDeviation ?? ''}
                    onChange={(e) => handleNumericChange('standardDeviation', e.target.value)}
                />
            </Form.Group>
            
            <Form.Group className="mb-3 mx-2">
                <Form.Label>Warning Limit</Form.Label>
                <Form.Control
                    type="number"
                    value={currentParameter?.warningLimit ?? ''}
                    onChange={(e) => handleNumericChange('warningLimit', e.target.value)}
                />
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>Action Limit</Form.Label>
                <Form.Control
                    type="number"
                    value={currentParameter?.actionLimit ?? ''}
                    onChange={(e) => handleNumericChange('actionLimit', e.target.value)}
                />
            </Form.Group>
            
          </div>
            <Form.Group className="mb-3">
                <Form.Label>Validation Notes</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={currentParameter?.validationNotes || ''}
                    onChange={(e) => {
                        if (currentParameter) {
                            setCurrentParameter({
                                ...currentParameter,
                                validationNotes: e.target.value
                            });
                        }
                    }}
                />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleSave}
                >
                    {formMode === 'add' ? 'Add Parameter' : 'Update Parameter'}
                </Button>
            </div>
        </div>
    );
}