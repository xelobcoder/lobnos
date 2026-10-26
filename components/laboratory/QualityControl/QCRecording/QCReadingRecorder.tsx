"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
    const router=useRouter(),submitLock=useRef(false);

    const [loadError,setLoadError]=useState(''),[revision,setRevision]=useState(0);
    useEffect(()=>{let live=true;setLoadingParameters(true);setLoadError('');setReadings({});setControlParameters([]);
        Promise.all([customFetch(`qc-readings/session/${sessionId}/${controlId}`),customFetch(`controlparameters/material/${controlId}`)]).then(([existing,parameters])=>{
            if(!live)return;if(!Array.isArray(existing)||!Array.isArray(parameters))throw Error('The session readings and control parameters could not be loaded.');
            const next:Record<string,Reading>={};existing.forEach(reading=>{next[reading.parameter]={value:reading.value,status:reading.status as ReadingStatus,parameterId:reading.parameterId,parameterName:reading.parameter}});setReadings(next);setControlParameters(parameters);setComments(existing[0]?.comments||'');
        }).catch(e=>{if(live)setLoadError(e.message||'Unable to load this QC session')}).finally(()=>{if(live)setLoadingParameters(false)});return()=>{live=false}
    },[sessionId,controlId,revision]);

    const parseNumericValue = (value: string) => parseFloat(value);

    const getParameterConfigurationError = (parameter: ControlParameter): string | null => {
        const targetValue = parseNumericValue(parameter.value);
        const standardDev = parseNumericValue(parameter.standardDeviation);

        if (isNaN(targetValue) || targetValue <= 0) {
            return `QC setup incomplete for ${parameter.parameter}: set Expected Value in Control Parameters`;
        }

        if (isNaN(standardDev) || standardDev <= 0) {
            return `QC setup incomplete for ${parameter.parameter}: set Standard Deviation in Control Parameters`;
        }

        return null;
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
        if(submitLock.current||loadingParameters||loadError||!controlParameters.length)return;
        const errors: string[] = [];

        controlParameters.forEach(param => {
            const configurationError = getParameterConfigurationError(param);
            if (configurationError) {
                errors.push(configurationError);
                return;
            }

            const reading = readings[param.parameter];
            const enteredValue = reading ? parseFloat(reading.value) : NaN;

            if (!reading || reading.value === '') {
                errors.push(`Value for ${param.parameter} cannot be empty`);
            } else if (isNaN(enteredValue)) {
                errors.push(`Value for ${param.parameter} must be numeric`);
            } else if (enteredValue <= 0) {
                errors.push(`Value for ${param.parameter} must be greater than 0`);
            } else if (reading.status === 'unmonitored') {
                errors.push(`Unable to evaluate ${param.parameter}. Check the QC setup for this parameter`);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            submitLock.current=true;setIsSubmitting(true);
            const qcReadings = controlParameters.map(parameter => {const reading=readings[parameter.parameter];return ({
                sessionId,
                controlMaterialId: controlId,
                parameter: reading.parameterName,
                parameterId: reading.parameterId,
                value: reading.value,
                status: reading.status,
                createdby: EMPLOYEEID,
                updatedby: EMPLOYEEID
            })});

            const finalReadingData = { readings: qcReadings, sessionId, comments };
            const response: { status: boolean } = await customPost('qc-readings/batch', 'POST', finalReadingData);

            if (response.status === true) {
                toast.success('QC readings saved successfully');
                router.push(`/operations/laboratory/quality-control?tab=sessions`);
            } else {
                throw new Error((response as any)?.error||'Failed to save QC readings');
            }
        } catch (error: any) {
            console.error('Error saving QC readings:', error);
            setValidationErrors([error.message||'Failed to save QC readings']);
        } finally {
            submitLock.current=false;setIsSubmitting(false);
        }
    };

    if(loadingParameters)return <div role="status" className="p-4">Loading session readings and control parameters…</div>;
    if(loadError)return <div role="alert" className="alert alert-danger">{loadError} <button className="btn btn-outline-danger" onClick={()=>setRevision(v=>v+1)}>Retry session</button></div>;
    if(!controlParameters.length)return <div className="alert alert-warning">No control parameters are configured. Configure the material before recording readings. <a href="/operations/laboratory/quality-control?tab=controls">Open control materials</a></div>;
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
            onCancel={() => {if(!isSubmitting)router.push('/operations/laboratory/quality-control?tab=sessions')}}
        />
    );
}
