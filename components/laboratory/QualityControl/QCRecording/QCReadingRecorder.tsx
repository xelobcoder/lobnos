"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../Auth/customFetch';
import { ControlParameter, Reading, ReadingStatus } from './types';
import { QCParameterForm } from './QCParameterForm';
import { useApplication } from '../../../Auth/useApplicationContext';

interface QCReadingRecorderProps {
    sessionId: string;
    controlId: string;
}

export function QCReadingRecorder({ sessionId, controlId }: QCReadingRecorderProps) {
    const [readings, setReadings] = useState<Record<string, Reading>>({});
    const [comments, setComments] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [controlParameters, setControlParameters] = useState<ControlParameter[]>([]);
    const [loadingParameters, setLoadingParameters] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const EMPLOYEEID = useApplication().user.employeeid;

    useEffect(() => {
        if (sessionId && controlId) {
            loadExistingReadings();
            handleControlParameters(controlId);
        }
    }, [sessionId, controlId]);

    const loadExistingReadings = async () => {
        try {
            const response = await customFetch(`qc-readings/session/${sessionId}/${controlId}`);
            if (response && Array.isArray(response) && response.length > 0) {
                // Transform the readings into the expected format
                const existingReadings: Record<string, Reading> = {};
                response.forEach(reading => {
                    existingReadings[reading.parameter] = {
                        value: reading.value,
                        status: reading.status as ReadingStatus,
                        parameterId: reading.parameterId,
                        parameterName: reading.parameter
                    };
                });
                setReadings(existingReadings);
                setComments(response[0]?.comments || '');
            }
        } catch (error: any) {
            console.error('Error loading existing readings:', error);
            toast.error(error.message || 'Failed to load existing readings');
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

    const validateReading = (value: number, parameter: ControlParameter): {status: ReadingStatus, value: string} => {
        if (isNaN(value) || value <= 0) {
            return {
                value: value.toString(),
                status: 'unmonitored'
            };
        }

        const targetValue = parseFloat(parameter.value);
        const standardDev = parseFloat(parameter.standardDeviation);
        const warningLimit = parseFloat(parameter.warningLimit);
        const actionLimit = parseFloat(parameter.actionLimit);

        if (isNaN(targetValue) || isNaN(standardDev) || standardDev === 0) {
            return {
                value: value.toString(),
                status: 'unmonitored'
            };
        }

        const deviation = Math.abs(value - targetValue) / standardDev;
        let status: ReadingStatus = 'normal';
        
        if (deviation > actionLimit) {
            status = 'critical';
        } else if (deviation > warningLimit) {
            status = 'warning';
        }

        return {
            value: value.toString(),
            status
        };
    };

    const handleReadingChange = (parameterId: string, parameterName: string, value: string) => {
        const numValue = parseFloat(value);
        const parameter = controlParameters.find(p => p.id === parameterId);
        
        if (parameter) {
            const reading = validateReading(numValue, parameter);
            setReadings(prev => ({
                ...prev,
                [parameterName]: {...reading, parameterId, parameterName}
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: string[] = [];

        controlParameters.forEach(param => {
            const reading = readings[param.parameter];
            if (!reading || reading.status === 'unmonitored') {
                errors.push(`Invalid value for ${param.parameter}`);
            } else if (reading.value === '') {
                errors.push(`Value for ${param.parameter} cannot be empty`);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setIsSubmitting(true);
            const qcReadings = Object.entries(readings).map(([parameterName, reading]) => ({
                sessionId,
                controlMaterialId: controlId,
                parameter: reading.parameterName,
                parameterId: reading.parameterId,
                value: reading.value,
                status: reading.status,
                createdby: EMPLOYEEID,
                updatedby: EMPLOYEEID
            }));

            const finalReadingData = { readings: qcReadings, sessionId, comments };
            const response: { status: boolean } = await customPost('qc-readings/batch', 'POST', finalReadingData);

            if (response.status === true) {
                toast.success('QC readings saved successfully');
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

    return (
        <QCParameterForm
            controlParameters={controlParameters}
            readings={readings}
            comments={comments}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting}
            onReadingChange={handleReadingChange}
            onCommentsChange={(value) => setComments(value)}
            onSubmit={handleSubmit}
            onCancel={() => {/* Handle cancel action */}}
        />
    );
}