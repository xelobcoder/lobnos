import React from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { DeviceOption, ControlMaterialOption } from './types';
import styles from './QCRecordingManager.module.css';
import { reactSelectCustomStyles } from '../../../Auth/customFetch';

interface QCReadingFormProps {
    selectedDevice: DeviceOption | null;
    selectedControl: ControlMaterialOption | null;
    devices: DeviceOption[];
    controlMaterials: ControlMaterialOption[];
    loadingDevices: boolean;
    loadingControls: boolean;
    loadingParameters: boolean;
    onDeviceChange: (selected: DeviceOption | null) => void;
    onControlChange: (selected: ControlMaterialOption | null) => void;
    onContinue: () => void;
}

export function QCReadingForm({
    selectedDevice,
    selectedControl,
    devices,
    controlMaterials,
    loadingDevices,
    loadingControls,
    loadingParameters,
    onDeviceChange,
    onControlChange,
    onContinue
}: QCReadingFormProps) {
    return (
        <Row className="mb-4">
            <Col md={6}>
                <Card className={styles.readingCard}>
                    <Card.Body>
                        <h5 className="mb-4">Create a QC session</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="qc-session-device">Device</Form.Label>
                                <Select
                                    value={selectedDevice}
                                    onChange={onDeviceChange}
                                    options={devices}
                                    styles={reactSelectCustomStyles}
                                    placeholder={loadingDevices ? "Loading devices..." : "Select Device"}
                                    isLoading={loadingDevices}
                                    isDisabled={loadingDevices || loadingParameters}
                                    instanceId="device-select"
                                    inputId="qc-session-device"
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="qc-session-control">Control material</Form.Label>
                                <Select
                                    value={selectedControl}
                                    onChange={onControlChange}
                                    options={controlMaterials}
                                    styles={reactSelectCustomStyles}
                                    placeholder={loadingControls ? "Loading controls..." : "Select Control Material"}
                                    isLoading={loadingControls}
                                    isDisabled={!selectedDevice || loadingControls || loadingParameters}
                                    instanceId="control-material-select"
                                    inputId="qc-session-control"
                                />
                            </Form.Group>

                            <div className="d-grid">
                                <Button 
                                    variant="primary"
                                    disabled={!selectedDevice || !selectedControl || loadingParameters}
                                    onClick={onContinue}
                                >
                                    {loadingParameters ? "Creating session…" : "Create QC session"}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>

            <Col md={6}>
                <Card className={`${styles.readingCard} ${styles.recentRecords}`}>
                    <Card.Body>
                        <h5 className="mb-3">Session selection</h5>
                        {selectedDevice && selectedControl ? (
                            <div className={styles.deviceInfo}>
                                <div className={styles.deviceName}>
                                    {selectedDevice.device.deviceName}
                                </div>
                                <div className={styles.controlInfo}>
                                    {selectedControl.control.name} - Lot: {selectedControl.control.lotNumber}
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted">
                                Choose a device first, then select its control material. After creating the session, open QC sessions to review and record its results.
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}