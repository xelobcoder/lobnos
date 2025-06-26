"use client"
import React from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { DeviceType } from './types';

interface DeviceFormModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (e: React.FormEvent) => void;
    register: UseFormRegister<DeviceType>;
    errors: FieldErrors<DeviceType>;
    selectedDevice: DeviceType | null;
}

export function DeviceFormModal({ 
    show, 
    onHide, 
    onSubmit, 
    register, 
    errors, 
    selectedDevice 
}: DeviceFormModalProps) {
    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedDevice ? 'Edit Device' : 'Add New Device'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Device Name</Form.Label>
                                <Form.Control 
                                    {...register('deviceName')}
                                    isInvalid={!!errors.deviceName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.deviceName?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Model</Form.Label>
                                <Form.Control 
                                    {...register('model')}
                                    isInvalid={!!errors.model}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.model?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Serial Number</Form.Label>
                                <Form.Control 
                                    {...register('serialNumber')}
                                    isInvalid={!!errors.serialNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.serialNumber?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Manufacturer</Form.Label>
                                <Form.Control 
                                    {...register('manufacturer')}
                                    isInvalid={!!errors.manufacturer}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.manufacturer?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Installation Date</Form.Label>
                                <Form.Control 
                                    type="date"
                                    {...register('installationDate')}
                                    isInvalid={!!errors.installationDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.installationDate?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Last Calibration Date</Form.Label>
                                <Form.Control 
                                    type="date"
                                    {...register('lastCalibrationDate')}
                                    isInvalid={!!errors.lastCalibrationDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.lastCalibrationDate?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Calibration Frequency (Days)</Form.Label>
                                <Form.Control 
                                    type="number"
                                    min="1"
                                    {...register('calibrationFrequency', {
                                        valueAsNumber: true,
                                        setValueAs: (value) => parseInt(value) || 0
                                    })}
                                    isInvalid={!!errors.calibrationFrequency}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.calibrationFrequency?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Location</Form.Label>
                                <Form.Control 
                                    {...register('location')}
                                    isInvalid={!!errors.location}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.location?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select 
                                    {...register('status')}
                                    isInvalid={!!errors.status}
                                >
                                    <option value="">Select Status</option>
                                    <option value="active">Active</option>
                                    <option value="maintenance">Under Maintenance</option>
                                    <option value="inactive">Inactive</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.status?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                <Form.Control 
                                    as="textarea"
                                    rows={3}
                                    {...register('notes')}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button size='sm' variant="outline-secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button size='sm' variant="outline-primary" type="submit">
                        {selectedDevice ? 'Update' : 'Save'} Device
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}