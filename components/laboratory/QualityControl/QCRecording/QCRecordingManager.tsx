"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { customFetch, reactSelectCustomStyles } from '../../../Auth/customFetch';
import { ControlParameter, Reading, DeviceOption, ControlMaterialOption } from './types';
import { QCParameterForm } from './QCParameterForm';
import { QCReadingForm } from './QCReadingForm';
import styles from './QCRecordingManager.module.css';
import { fetchDevices } from '../lib';

interface Device {
    id: string;
    deviceName: string;
    model: string;
}

interface Control {
    id: string;
    name: string;
    lotNumber: string;
}

interface QCReading {
    deviceId: string;
    controlMaterialId: string;
    readings: Record<string, Reading>;
    comments: string;
}

const validateReading = (value: number, parameter: ControlParameter): Reading => {
    if (isNaN(value) || value <= 0) {
        return {
            value,
            isValid: false,
            status: null
        };
    }

    const deviation = Math.abs(value - parameter.targetValue) / parameter.standardDeviation;
    let status: Reading['status'] = 'normal';
    
    if (deviation > parameter.actionLimit) {
        status = 'critical';
    } else if (deviation > parameter.warningLimit) {
        status = 'warning';
    }

    return {
        value,
        isValid: true,
        status
    };
};

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
    const [controlParameters, setControlParameters] = useState<ControlParameter[]>([]);
    const [loadingParameters, setLoadingParameters] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getUserDevices();
    }, []);

    const getUserDevices = async () => {
        try {
            setLoadingDevices(true);
            const response = await fetchDevices();
            if (!response) throw new Error('Failed to fetch devices');
            
            const deviceOptions = response.map((device: Device) => ({
                value: device.id,
                label: `${device.deviceName} (${device.model})`,
                device: device
            }));
            setDevices(deviceOptions);
        } catch (error: any) {
            console.error('Failed to load devices:', error);
            toast.error(error.message || 'Failed to load devices');
        } finally {
            setLoadingDevices(false);
        }
    };

    const fetchControlMaterials = async (deviceId: string) => {
        try {
            setLoadingControls(true);
            const response = await customFetch(`controlmaterials/device/${deviceId}`);
            if (!response) throw new Error('Failed to fetch control materials');
            
            const controlOptions = response.map((control: Control) => ({
                value: control.id,
                label: `${control.name} (${control.lotNumber})`,
                control: control
            }));
            
            setControlMaterials(controlOptions);
        } catch (error: any) {
            console.error('Failed to load control materials:', error);
            toast.error(error.message || 'Failed to load control materials');
        } finally {
            setLoadingControls(false);
        }
    };

    const handleDeviceChange = (selected: DeviceOption | null) => {
        setSelectedDevice(selected);
        setSelectedControl(null);
        setControlMaterials([]);
        setControlParameters([]);
        setReadings({});
        if (selected?.value) {
            fetchControlMaterials(selected.value);
        }
    };

    const handleControlChange = (selected: ControlMaterialOption | null) => {
        setSelectedControl(selected);
        setReadings({});
        setControlParameters([]);
        if (selected?.value) {
            handleControlParameters(selected.value);
        }
    };

    const handleControlParameters = async (controlId: string) => {
        try {
            setLoadingParameters(true);
            const response = await customFetch(`controlparameters/material/${controlId}`);
            if (!response) throw new Error('Failed to fetch control parameters');
            
            setControlParameters(response);
        } catch (error: any) {
            console.error('Failed to load control parameters:', error);
            toast.error(error.message || 'Failed to load control parameters');
        } finally {
            setLoadingParameters(false);
        }
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

        if (!selectedDevice || !selectedControl) {
            errors.push('Device and Control Material must be selected');
            setValidationErrors(errors);
            return;
        }

        controlParameters.forEach(param => {
            if (!readings[param.name]?.isValid) {
                errors.push(`Invalid value for ${param.name}`);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setIsSubmitting(true);
            const qcReading: QCReading = {
                deviceId: selectedDevice.value,
                controlMaterialId: selectedControl.value,
                readings,
                comments
            };

            const response = await customFetch('qc-readings');

            if (response.success) {
                toast.success('QC readings saved successfully');
                resetForm();
            } else {
                throw new Error('Failed to save QC readings');
            }
        } catch (error: any) {
            console.error('Error saving QC readings:', error);
            toast.error(error.message || 'Failed to save QC readings');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setShowReadingForm(false);
        setReadings({});
        setComments('');
        setValidationErrors([]);
        setSelectedControl(null);
        setControlParameters([]);
    };

    return (
        <div>
            {!showReadingForm ? (
                <QCReadingForm
                    selectedDevice={selectedDevice}
                    selectedControl={selectedControl}
                    devices={devices}
                    controlMaterials={controlMaterials}
                    loadingDevices={loadingDevices}
                    loadingControls={loadingControls}
                    loadingParameters={loadingParameters}
                    onDeviceChange={handleDeviceChange}
                    onControlChange={handleControlChange}
                    onContinue={() => setShowReadingForm(true)}
                />
            ) : (
                <QCParameterForm
                    controlParameters={controlParameters}
                    readings={readings}
                    comments={comments}
                    validationErrors={validationErrors}
                    isSubmitting={isSubmitting}
                    onReadingChange={handleReadingChange}
                    onCommentsChange={(value) => setComments(value)}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowReadingForm(false)}
                />
            )}
        </div>
    );
}