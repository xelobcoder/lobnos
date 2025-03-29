import React from 'react';
import { Button } from 'react-bootstrap';
import { ControlParameterType } from '../types/ControlParameter';
import { ParameterForm } from './ParameterForm';

interface ParameterFormSectionProps {
    formMode: 'add' | 'edit' | 'hidden';
    currentParameter: ControlParameterType | null;
    setCurrentParameter: (param: ControlParameterType | null) => void;
    onCancel: () => void;
    onSave: () => void;
    onAddParameter: () => void;
}

export function ParameterFormSection({
    formMode,
    currentParameter,
    setCurrentParameter,
    onCancel,
    onSave,
    onAddParameter
}: ParameterFormSectionProps) {
    return (
        <div className="card h-100">
            <div className="card-header">
                <h5 className="mb-0">
                    {formMode === 'hidden' ? 'Add New Parameter' : 
                     formMode === 'add' ? 'Add New Parameter' : 'Edit Parameter'}
                </h5>
            </div>
            <div className="card-body">
                {formMode !== 'hidden' ? (
                    <ParameterForm
                        formMode={formMode as 'add' | 'edit'}
                        currentParameter={currentParameter}
                        setCurrentParameter={setCurrentParameter}
                        onCancel={onCancel}
                        onSave={onSave}
                    />
                ) : (
                    <div className="text-center p-4">
                        <p className="text-muted mb-3">Click the button below to add a new parameter</p>
                        <Button
                            variant="outline-primary"
                            onClick={onAddParameter}
                        >
                            Add Parameter
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}