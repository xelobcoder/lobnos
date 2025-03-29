"use client"
import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { customFetch, reactSelectCustomStyles } from '../../../Auth/customFetch';
import { toast } from 'react-toastify';

interface ControlParameter {
    name: string;
    unit: string;
    targetValue: number;
    standardDeviation: number;
    warningLimit: number;
    actionLimit: number;
}

interface Reading {
    value: number;
    isValid: boolean;
    status: 'normal' | 'warning' | 'critical' | null;
}

interface DeviceOption {
    value: string;
    label: string;
    device: {
        id: string;
        deviceName: string;
        model: string;
    };
}

interface ControlMaterialOption {
    value: string;
    label: string;
    control: {
        id: string;
        name: string;
        lotNumber: string;
    };
}

export function QCRecordingManager() {
    const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
    const [selectedControl, setSelectedControl] = useState<ControlMaterialOption | null>(null);
    const [showReadingForm, setShowReadingForm] = useState(false);
    const [readings, setReadings] = useState<Record<string, Reading>>({});
    const [comments, setComments] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [devices, setDevices] = useState<DeviceOption[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [controlMaterials, setControlMaterials] = useState<ControlMaterialOption[]>([]);
    const [loadingControls, setLoadingControls] = useState(false);

    const fetchControlMaterials = async (deviceId: string) => {
        try {
            setLoadingControls(true);
            const response = await customFetch(`controlmaterials/device/${deviceId}`);
            if (!response) throw new Error('Failed to fetch control materials');
            
            const controlOptions = response.map((control: any) => ({
                value: control.id,
                label: `${control.name} (${control.lotNumber})`,
                control: control
            }));
            
            setControlMaterials(controlOptions);
        } catch (error) {
            console.error('Failed to load control materials:', error);
            toast.error('Failed to load control materials');
        } finally {
            setLoadingControls(false);
        }
    };

    const handleDeviceChange = (selected: DeviceOption | null) => {
        setSelectedDevice(selected);
        setSelectedControl(null);
        if (selected?.value) {
            fetchControlMaterials(selected.value);
        }
    };

    // Remove standalone Select components and keep them in the return statement
    const handleContinue = () => {
        setShowReadingForm(true);
    };

    // Mock data - replace with API call
    const controlParameters: ControlParameter[] = [
        {
            name: 'Glucose',
            unit: 'mmol/L',
            targetValue: 5.5,
            standardDeviation: 0.2,
            warningLimit: 2,
            actionLimit: 3
        },
        {
            name: 'Creatinine',
            unit: 'µmol/L',
            targetValue: 90,
            standardDeviation: 5,
            warningLimit: 2,
            actionLimit: 3
        }
    ];

    const validateReading = (value: number, parameter: ControlParameter): Reading => {
        const deviation = Math.abs(value - parameter.targetValue) / parameter.standardDeviation;
        let status: Reading['status'] = 'normal';
        
        if (deviation > parameter.actionLimit) {
            status = 'critical';
        } else if (deviation > parameter.warningLimit) {
            status = 'warning';
        }

        return {
            value,
            isValid: !isNaN(value) && value > 0,
            status
        };
    };

    const handleReadingChange = (parameterName: string, value: string) => {
        const numValue = parseFloat(value);
        const parameter = controlParameters.find(p => p.name === parameterName);
        
        if (parameter) {
            const reading = validateReading(numValue, parameter);
            setReadings(prev => ({
                ...prev,
                [parameterName]: reading
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: string[] = [];

        // Validate all readings
        controlParameters.forEach(param => {
            if (!readings[param.name]?.isValid) {
                errors.push(`Invalid value for ${param.name}`);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        // TODO: Implement API call to save readings
        console.log('Saving readings:', { readings, comments });
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            setLoadingDevices(true);
            const response = await customFetch('devices');
            if (!response.data) throw new Error('Failed to fetch devices');
            
            const deviceOptions = response.data.map(device => ({
                value: device.id,
                label: `${device.deviceName} (${device.model})`,
                device: device
            }));
            
            setDevices(deviceOptions);
        } catch (error) {
            console.error('Failed to load devices:', error);
            toast.error('Failed to load devices');
        } finally {
            setLoadingDevices(false);
        }
    };

    return (
        <div>
            {!showReadingForm ? (
                <Row className="mb-4">
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Device</Form.Label>
                                        <Select
                                            value={selectedDevice}
                                            onChange={setSelectedDevice}
                                            styles={reactSelectCustomStyles}
                                            options={devices}
                                            placeholder={loadingDevices ? "Loading devices..." : "Select Device"}
                                            isLoading={loadingDevices}
                                            isDisabled={loadingDevices}
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Control Material</Form.Label>
                                        <Select
                                            value={selectedControl}
                                            onChange={setSelectedControl}
                                            options={controlMaterials}
                                            styles={reactSelectCustomStyles}
                                            placeholder={loadingControls ? "Loading controls..." : "Select Control Material"}
                                            isLoading={loadingControls}
                                            isDisabled={!selectedDevice || loadingControls}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Date and Time</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            defaultValue={new Date().toISOString().slice(0, 16)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Operator</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter operator name"
                                        />
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button 
                                            variant="primary"
                                            disabled={!selectedDevice || !selectedControl}
                                            onClick={handleContinue}
                                        >
                                            Continue to Results Entry
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <h5 className="mb-3">Recent Records</h5>
                                <div className="text-muted">
                                    Select a device and control material to view recent QC records
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                // Reading Entry Form
                <Card>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5>Enter Control Readings</h5>
                            <Button variant="outline-secondary" onClick={() => setShowReadingForm(false)}>
                                Back to Selection
                            </Button>
                        </div>

                        {validationErrors.length > 0 && (
                            <Alert variant="danger">
                                <ul className="mb-0">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </Alert>
                        )}
                        
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                {controlParameters.map(parameter => (
                                    <Col md={6} key={parameter.name}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {parameter.name} ({parameter.unit})
                                                <small className="text-muted ms-2">
                                                    Target: {parameter.targetValue} ± {parameter.standardDeviation}
                                                </small>
                                            </Form.Label>
                                            <Form.Control 
                                                type="number" 
                                                step="0.01"
                                                onChange={(e) => handleReadingChange(parameter.name, e.target.value)}
                                                className={readings[parameter.name]?.status ? `border-${readings[parameter.name].status}` : ''}
                                            />
                                            {readings[parameter.name]?.status === 'warning' && (
                                                <Form.Text className="text-warning">
                                                    Warning: Value outside warning limits
                                                </Form.Text>
                                            )}
                                            {readings[parameter.name]?.status === 'critical' && (
                                                <Form.Text className="text-danger">
                                                    Critical: Value outside action limits
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                    </Col>
                                ))}
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Comments</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Enter any observations or comments"
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <Button variant="primary" type="submit">
                                    Save Readings
                                </Button>
                                <Button variant="outline-secondary" onClick={() => setShowReadingForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}