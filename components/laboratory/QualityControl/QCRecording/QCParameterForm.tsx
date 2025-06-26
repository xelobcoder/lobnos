import React from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { ControlParameter, Reading, ReadingStatus } from './types';
import styles from './QCRecordingManager.module.css';
import { QCParameterInput } from './QCParameterInput';

interface QCParameterFormProps {
    controlParameters: ControlParameter[];
    readings: Record<string, Reading>;
    comments: string;
    validationErrors: string[];
    isSubmitting: boolean;
    onReadingChange: (parameterId: string,parameterName:string, value: string) => void;
    onCommentsChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function QCParameterForm({
    controlParameters,
    readings,
    comments,
    validationErrors,
    isSubmitting,
    onReadingChange,
    onCommentsChange,
    onSubmit,
    onCancel
}: QCParameterFormProps) {
    return (
        <Card className={styles.readingCard}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5>Enter Control Readings</h5>
                    <Button variant="outline-secondary" onClick={onCancel}>
                        Back to Selection
                    </Button>
                </div>

                {validationErrors.length > 0 && (
                    <Alert variant="danger" className="mb-4">
                        <ul className="mb-0">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Form onSubmit={onSubmit}>
                    <Row>
                        {controlParameters.map(parameter => (
                            <Col md={6} key={parameter.id}>
                                <QCParameterInput
                                    parameter={parameter}
                                    reading={readings[parameter.parameter]}
                                    onReadingChange={onReadingChange}
                                />
                            </Col>
                        ))}
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>Comments</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            value={comments}
                            onChange={(e) => onCommentsChange(e.target.value)}
                            placeholder="Enter any observations or comments"
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Readings'}
                        </Button>
                        <Button 
                            variant="outline-secondary" 
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}