import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';


const ContractForm = () => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        servicesCovered: '',
        billingTerms: '',
        discountsAgreements: '',
        file: null
    });

    const [errors, setErrors] = useState({});

    const validationSchema = Yup.object().shape({
        startDate: Yup.date().required('Start Date is required'),
        endDate: Yup.date().required('End Date is required'),
        servicesCovered: Yup.string().required('Services Covered is required'),
        billingTerms: Yup.string().required('Billing Terms is required'),
        discountsAgreements: Yup.string().nullable()
    });

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: 'application/pdf',
        maxFiles: 1,
        onDrop: acceptedFiles => {
            setFormData({
                ...formData,
                file: acceptedFiles[0]
            });
        }
    });

    const removeFile = () => {
        setFormData({
            ...formData,
            file: null
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validationSchema.validate(formData, { abortEarly: false })
            .then(() => {
                console.log(formData);
                setErrors({});
            })
            .catch((validationErrors) => {
                const errors = validationErrors.inner.reduce((allErrors, currentError) => {
                    return {
                        ...allErrors,
                        [currentError.path]: currentError.message,
                    };
                }, {});
                setErrors(errors);
            });
    };

    return (
        <Row className="justify-content-md-center">
            <Col md="12">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className='grid-20-80 my-2' controlId="startDate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            isInvalid={!!errors.startDate}
                            className="custom-input"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.startDate}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="endDate">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            isInvalid={!!errors.endDate}
                            className="custom-input"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.endDate}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="servicesCovered">
                        <Form.Label>Services Covered</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="servicesCovered"
                            value={formData.servicesCovered}
                            onChange={(e) => setFormData({ ...formData, servicesCovered: e.target.value })}
                            isInvalid={!!errors.servicesCovered}
                            className="custom-textarea"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.servicesCovered}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="billingTerms">
                        <Form.Label>Billing Terms</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="billingTerms"
                            value={formData.billingTerms}
                            onChange={(e) => setFormData({ ...formData, billingTerms: e.target.value })}
                            isInvalid={!!errors.billingTerms}
                            className="custom-textarea"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.billingTerms}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="discountsAgreements">
                        <Form.Label>Discounts/Agreements</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="discountsAgreements"
                            value={formData.discountsAgreements}
                            onChange={(e) => setFormData({ ...formData, discountsAgreements: e.target.value })}
                            className="custom-textarea"
                        />
                    </Form.Group>

                    <Form.Group controlId="fileUpload">
                        <Form.Label>Upload Contract PDF</Form.Label>
                        <div style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }} {...getRootProps({ className: 'dropzone   p-5 ui mb-3 br-5 ' })}>
                            <input {...getInputProps()} />
                            {!formData.file ? (
                                <p>Drag  drop a PDF file here, or click to select one</p>
                            ) : (
                                <div className="file-preview">
                                    <p>{formData.file.name}</p>
                                    <Button variant="outline-secondary" onClick={removeFile}>Remove</Button>
                                </div>
                            )}
                        </div>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        update information
                    </Button>
                </Form>
            </Col>
        </Row>
    );
};

export default ContractForm;
