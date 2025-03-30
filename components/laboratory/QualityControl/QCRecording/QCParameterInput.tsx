import React from 'react';
import { Form } from 'react-bootstrap';
import { ControlParameter, Reading, ReadingStatus } from './types';
import styles from './QCRecordingManager.module.css';

interface QCParameterInputProps {
    parameter: ControlParameter;
    reading: Reading | undefined;
    onReadingChange: (parameterName: string, value: string) => void;
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
        if (!parameter.standardDeviation || parameter.standardDeviation === 0) {
            return (
                <div className={styles.targetValue}>
                    Target: {parameter.targetValue} {parameter.unit} (Unmonitored)
                </div>
            );
        }
        return (
            <div className={styles.targetValue}>
                Target: {parameter.targetValue} ± {parameter.standardDeviation} {parameter.unit}
            </div>
        );
    };

    const getStatusClass = () => {
        if (!parameter.standardDeviation || parameter.standardDeviation === 0) {
            return getReadingStatusClass('unmonitored');
        }
        return reading?.status ? getReadingStatusClass(reading.status) : '';
    };

    return (
        <div className={`${styles.parameterInput} ${getStatusClass()}`} data-parameter={parameter.name}>
            <Form.Group>
                <Form.Label>{parameter.name}</Form.Label>
                {renderTargetValue()}
                <Form.Control 
                    type="number" 
                    step="0.01"
                    key={parameter.name}
                    defaultValue={reading?.value || ''}
                    onChange={(e) => onReadingChange(parameter.name, e.target.value)}
                    required
                />
                {parameter.standardDeviation && parameter.standardDeviation !== 0 && reading?.status && (
                    <Form.Text className={`text-${reading.status}`}>
                        {reading.status === 'warning' ? 'Warning: ' : 'Critical: '}
                        Value outside limits
                    </Form.Text>
                )}
            </Form.Group>
        </div>
    );
}