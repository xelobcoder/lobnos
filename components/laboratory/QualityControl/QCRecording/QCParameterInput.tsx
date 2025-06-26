import React from 'react';
import { Form } from 'react-bootstrap';
import { ControlParameter, Reading, ReadingStatus } from './types';
import styles from './QCRecordingManager.module.css';

interface QCParameterInputProps {
    parameter: ControlParameter;
    reading: Reading | undefined;
    onReadingChange: (parameterId: string,paramter:string, value: string) => void;
}

export function QCParameterInput({ parameter, reading, onReadingChange }: QCParameterInputProps) {
    const getReadingStatusClass = (status: ReadingStatus) => {
        switch (status) {
            case 'normal': return styles.statusNormal;
            case 'warning': return styles.statusWarning;
            case 'critical': return styles.statusCritical;
            case 'unmonitored': return styles.statusUnmonitored;
            default: return '';
        }
    };

    const renderTargetValue = () => {
        if (!parameter.standardDeviation || parameter.standardDeviation === '0') {
            return (
                <div className={styles.targetValue}>
                    Target: {parameter.value} {parameter.unit} (Unmonitored)
                </div>
            );
        }
        return (
            <div className={styles.targetValue}>
                Target: {parameter.value} ± {parameter.standardDeviation} {parameter.unit}
                <br />
                Warning Limit: {parameter.warningLimit}
                <br />
                Action Limit: {parameter.actionLimit}
            </div>
        );
    };

    const getStatusClass = () => {
        if (!parameter.standardDeviation || parameter.standardDeviation === '0') {
            return getReadingStatusClass('unmonitored');
        }
        return reading?.status ? getReadingStatusClass(reading.status) : '';
    };

    return (
        <div className={`${styles.parameterInput} ${getStatusClass()}`} data-parameter={parameter.parameter}>
            <Form.Group>
                <Form.Label>{parameter.parameter}</Form.Label>
                {renderTargetValue()}
                <Form.Control 
                    type="number" 
                    step="0.0001"
                    key={parameter.id}
                    defaultValue={reading?.value || ''}
                    onChange={(e) => onReadingChange(parameter.id,parameter.parameter, e.target.value)}
                    required
                />
                {parameter.standardDeviation && parameter.standardDeviation !== '0' && reading?.status && (
                    <Form.Text className={`text-${reading.status}`}>
                        {reading.status === 'warning' ? 'Warning: ' : 'Critical: '}
                        Value outside limits
                    </Form.Text>
                )}
            </Form.Group>
        </div>
    );
}