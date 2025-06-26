import React, {  useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import { ControlMaterialType } from '../types/ControlMaterial';
import { reactSelectCustomStyles } from '../../../Auth/customFetch';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import { filteringDatabaseTables } from '../../../serverActions/ActionFiltering';

interface ControlMaterialFormModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (e: React.FormEvent) => void;
    register: any;
    errors: any;
    loadingDevices: boolean;
    devices: any,
    watch: any;
    control: any;
    selectedMaterial: ControlMaterialType | null;
    onDeviceSearch: (query: string) => Promise<void>;
}

export function ControlMaterialFormModal({
    show,
    onHide,
    onSubmit,
    register,
    devices,
    errors,
    loadingDevices,
    watch,
    control,
    onDeviceSearch,
    selectedMaterial
}: ControlMaterialFormModalProps) {
    const sourceType = watch('sourceType');
    const [loadingTests, setLoadingTests] = useState(false);
    const [tests, setTests] = useState<any>([]);



    const sourceTypeOptions = [
        { value: 'manufacturer', label: 'Commercial' },
        { value: 'sister_lab', label: 'Sister Lab' },
        { value: 'trusted_source', label: 'Trusted Source' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
        { value: 'depleted', label: 'Depleted' }
    ];

    const loadDeviceOptions = async (inputValue: string) => {
        if(inputValue.length < 2) return;
        if (onDeviceSearch) {
            await onDeviceSearch(inputValue);
        }
        return devices;
    };

    const fetchAllAvailableTest = async (inputValue: string) => {
        if(inputValue.length < 2) return;
        setLoadingTests(true);
        try {
            const data = await filteringDatabaseTables("test_panels", inputValue, "name", 100);
            const options = data.map((test: any) => ({
                value: test.id,
                label: test.name
            }));
            setTests(options);
            return options;
        } catch (error) {
            toast.error('Failed to fetch available tests');
            return []; 
        } finally {
            setLoadingTests(false);
        }
    }

    return (
        <Modal show={show} onHide={onHide} backdrop="static">
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedMaterial ? 'Edit Control Material' : 'Add New Control Material'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    {...register('name')}
                                    isInvalid={!!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Lot Number</Form.Label>
                                <Form.Control
                                    {...register('lotNumber')}
                                    isInvalid={!!errors.lotNumber}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.lotNumber?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Source Type</Form.Label>
                                <Controller
                                    name="sourceType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            styles={reactSelectCustomStyles}
                                            options={sourceTypeOptions}
                                            className={errors.sourceType ? 'is-invalid' : ''}
                                            value={sourceTypeOptions.find(option => option.value === field.value)}
                                            onChange={(option) => field.onChange(option?.value)}
                                        />
                                    )}
                                />
                                {errors.sourceType && (
                                    <div className="invalid-feedback d-block">
                                        {errors.sourceType.message}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            {sourceType === 'manufacturer' ? (
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
                            ) : (
                                <Form.Group>
                                    <Form.Label>Source Name</Form.Label>
                                    <Form.Control
                                        {...register('sourceName')}
                                        isInvalid={!!errors.sourceName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.sourceName?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Expiry Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    {...register('expiryDate')}
                                    isInvalid={!!errors.expiryDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.expiryDate?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            {sourceType === 'manufacturer' ? null : (
                                <Form.Group>
                                    <Form.Label>Opened Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        {...register('openedDate')}
                                        isInvalid={!!errors.openedDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.openedDate?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Storage Conditions</Form.Label>
                                <Form.Control
                                    {...register('storageConditions')}
                                    isInvalid={!!errors.storageConditions}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.storageConditions?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            styles={reactSelectCustomStyles}
                                            options={statusOptions}
                                            className={errors.status ? 'is-invalid' : ''}
                                            value={statusOptions.find(option => option.value === field.value)}
                                            onChange={(option) => field.onChange(option?.value)}
                                        />
                                    )}
                                />
                                {errors.status && (
                                    <div className="invalid-feedback d-block">
                                        {errors.status.message}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    {...register('notes')}
                                    isInvalid={!!errors.notes}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.notes?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Associated Device</Form.Label>
                        <Controller
                            name="deviceId"
                            control={control}
                            rules={{ required: 'Device is required' }}
                            render={({ field }) => (
                                <AsyncSelect
                                    {...field}
                                    cacheOptions
                                    defaultOptions
                                    styles={reactSelectCustomStyles}
                                    loadOptions={loadDeviceOptions}
                                    isLoading={loadingDevices}
                                    placeholder="Search for a device..."
                                    className={errors.deviceId ? 'is-invalid' : ''}
                                />
                            )}
                        />
                        {errors.deviceId && (
                            <Form.Control.Feedback type="invalid">
                                {errors.deviceId.message}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Associated Test</Form.Label>
                        <Controller
                            name="testId"
                            control={control}
                            render={({ field }) => (
                                <AsyncSelect
                                    {...field}
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={fetchAllAvailableTest}
                                    isLoading={loadingTests}
                                    styles={reactSelectCustomStyles}
                                    placeholder="Select a test..."
                                    className={errors.testId ? 'is-invalid' : ''}
                                    value={tests.find(option => option.value === field.value)}
                                    onChange={(option) => field.onChange(option?.value)}
                                />
                            )}
                        />
                        {errors.testId && (
                            <Form.Control.Feedback type="invalid">
                                {errors.testId.message}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                    <div className="text-muted mb-3">
                        <small>* Parameters and expected values can be added after creating the control material</small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" variant="outline-secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button size="sm" variant="outline-primary" type="submit">
                        {selectedMaterial ? 'Update' : 'Save'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
