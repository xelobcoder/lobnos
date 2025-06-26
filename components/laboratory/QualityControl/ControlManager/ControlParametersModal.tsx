import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ControlParameterType } from '../types/ControlParameter';
import { customFetch, customPost } from '../../../Auth/customFetch';
import { ParametersTable } from './ParametersTable';
import { ParameterForm } from './ParameterForm';
import { useApplicationSettings } from '../../../Auth/useApplicationContext';
import PrimeToast from '../../../accessories/PrimeToast';

interface ControlParametersModalProps {
    show: boolean;
    onHide: () => void;
    materialId: string;
    onSuccess: () => void;
    associatedTests:number;
}

export function ControlParametersModal({
    show,
    onHide,
    materialId,
    associatedTests,
    onSuccess
}: ControlParametersModalProps) {
    const [loading, setLoading] = useState(false);
    const [parameters, setParameters] = useState<ControlParameterType[]>([]);
    const [currentParameter, setCurrentParameter] = useState<ControlParameterType | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit' | 'hidden'>('hidden');
    const employeeid = useApplicationSettings().applicationsettings.user?.employeeid;

    useEffect(() => {
        if (show && materialId) {
            fetchParameters();
        }
    }, [show, materialId]);

    const fetchParameters = async () => {
        try {
            setLoading(true);
            const response = await customFetch(`controlparameters/material/${materialId}`);
            if (response && Array.isArray(response) && response.length > 0) {
                setParameters(response);
            } else {
                const testFields = await customFetch(`testpanel/list/customtestrule?testid=${associatedTests}`);
            if (testFields && Array.isArray(testFields)) {
                const transformedFields = testFields.map(field => ({
                    parameter: field.name,
                    value: 0,
                    unit: field.units || '',
                    standardDeviation: 0,
                    warningLimit: field.upperlimit ? parseFloat(field.upperlimit) : 0,
                    actionLimit: field.lowerlimit ? parseFloat(field.lowerlimit) : 0,
                    controlMaterialId: materialId,
                    validationNotes: ''
                }));
                setParameters(transformedFields);
            }
            }
        } catch (error) {
            toast.error('Failed to load parameters');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!parameters.length) {
                toast.error('At least one parameter is required');
                return;
            }

            setLoading(true);

            const preparedParameters = parameters.map(param => ({
                ...param,
                controlMaterialId: materialId,
                value: param.value,
                standardDeviation: param.standardDeviation || null,
                warningLimit: param.warningLimit || null,
                actionLimit: param.actionLimit || null,
                createdby: employeeid,
                validationNotes: param.validationNotes || null
            }));
            const endpoint = "controlparameters/bulk"
            const result = await customPost(endpoint, 'POST', { parameters: preparedParameters });


            const { status, count } = result;
            if (status === true && count > 0) {
                toast.success('Parameters saved successfully');
            } else {
                throw new Error('Failed to save parameters');
            }
        } catch (error: any) {
            console.error('Error saving parameters:', error);
            toast.error(error.message || 'Failed to save parameters');
        } finally {
            setLoading(false);
        }
    };

    const handleEditParameter = (param: ControlParameterType, index: number) => {
        setCurrentParameter({ ...param });
        setCurrentIndex(index);
        setFormMode('edit');
    };

    const handleAddParameter = () => {
        setCurrentParameter({
            parameter: '',
            value: 0,
            unit: '',
            standardDeviation: 0,
            warningLimit: 0,
            actionLimit: 0,
            controlMaterialId: materialId,
            validationNotes: ''
        });
        setCurrentIndex(null);
        setFormMode('add');
    };

    const saveParameter = () => {
        if (!currentParameter) return;

        if (!currentParameter.parameter || !currentParameter.unit || currentParameter.value === null) {
            toast.error('Please fill in all required fields');
            return;
        }

        setParameters(prev => {
            const newParams = [...prev];
            if (currentIndex !== null) {
                newParams[currentIndex] = currentParameter;
            } else {
                newParams.push(currentParameter);
            }
            return newParams;
        });

        setFormMode('hidden');
        setCurrentParameter(null);
        setCurrentIndex(null);
    };

    return (
        <Modal show={show} onHide={onHide} fullscreen>
            <Modal.Header closeButton>
                <h5>Manage Control Parameters</h5>
            </Modal.Header>
            <Modal.Body>
                <PrimeToast />
                <form onSubmit={handleSubmit}>
                    {loading ? (
                        <div className="text-center p-4">
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Parameters List</h5>
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Saving...
                                        </>
                                    ) : 'Save Parameters'}
                                </Button>
                            </div>
                            <div className="card-body">
                                <ParametersTable
                                    parameters={parameters}
                                    onEdit={(param, index) => {
                                        const newParams = [...parameters];
                                        newParams[index] = param;
                                        setParameters(newParams);
                                    }}
                                    onDelete={(index) => {
                                        const newParams = parameters.filter((_, i) => i !== index);
                                        setParameters(newParams);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button size="sm" variant="secondary" onClick={onHide} className="me-2">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}