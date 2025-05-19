"use client"
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { 
    RiCalendarLine, 
    RiFileListLine, 
    RiMoneyDollarCircleLine, 
    RiPercentLine, 
    RiUpload2Line, 
    RiFileTextLine,
    RiCloseLine,
    RiCheckLine
} from '@remixicon/react';

// Define interfaces for our data types
interface FormData {
    startDate: string;
    endDate: string;
    servicesCovered: string;
    billingTerms: string;
    discountsAgreements: string;
    file: File | null;
}

interface FormErrors {
    [key: string]: string;
}

const ContractForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        startDate: '',
        endDate: '',
        servicesCovered: '',
        billingTerms: '',
        discountsAgreements: '',
        file: null
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

    const validationSchema = Yup.object().shape({
        startDate: Yup.date().required('Start Date is required'),
        endDate: Yup.date().required('End Date is required'),
        servicesCovered: Yup.string().required('Services Covered is required'),
        billingTerms: Yup.string().required('Billing Terms is required'),
        discountsAgreements: Yup.string().nullable()
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                setFormData({
                    ...formData,
                    file: acceptedFiles[0]
                });
            }
        }
    });

    const removeFile = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        setFormData({
            ...formData,
            file: null
        });
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitSuccess(false);
        
        validationSchema.validate(formData, { abortEarly: false })
            .then(() => {
                console.log(formData);
                setErrors({});
                // Simulate API call
                setTimeout(() => {
                    setIsSubmitting(false);
                    setSubmitSuccess(true);
                }, 1000);
            })
            .catch((validationErrors: Yup.ValidationError) => {
                const errors: FormErrors = validationErrors.inner.reduce((allErrors, currentError) => {
                    return {
                        ...allErrors,
                        [currentError.path as string]: currentError.message,
                    };
                }, {});
                setErrors(errors);
                setIsSubmitting(false);
            });
    };

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary bg-opacity-10 border-0">
                <h5 className="mb-0 d-flex align-items-center">
                    <RiFileTextLine className="me-2" size={20} />
                    Contract Information
                </h5>
            </Card.Header>
            <Card.Body>
                {submitSuccess && (
                    <Alert variant="success" className="d-flex align-items-center">
                        <RiCheckLine className="me-2" size={20} />
                        Contract information has been successfully updated!
                    </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="startDate">
                                <Form.Label className="d-flex align-items-center text-secondary">
                                    <RiCalendarLine className="me-2" />
                                    Start Date
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.startDate}
                                    className="form-control-lg"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.startDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="endDate">
                                <Form.Label className="d-flex align-items-center text-secondary">
                                    <RiCalendarLine className="me-2" />
                                    End Date
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.endDate}
                                    className="form-control-lg"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.endDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="servicesCovered">
                        <Form.Label className="d-flex align-items-center text-secondary">
                            <RiFileListLine className="me-2" />
                            Services Covered
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="servicesCovered"
                            value={formData.servicesCovered}
                            onChange={handleInputChange}
                            isInvalid={!!errors.servicesCovered}
                            placeholder="List all services covered by this contract..."
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.servicesCovered}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="billingTerms">
                        <Form.Label className="d-flex align-items-center text-secondary">
                            <RiMoneyDollarCircleLine className="me-2" />
                            Billing Terms
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="billingTerms"
                            value={formData.billingTerms}
                            onChange={(e) => setFormData({ ...formData, billingTerms: e.target.value })}
                            isInvalid={!!errors.billingTerms}
                            placeholder="Specify payment schedule, methods, and other billing details..."
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.billingTerms}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="discountsAgreements">
                        <Form.Label className="d-flex align-items-center text-secondary">
                            <RiPercentLine className="me-2" />
                            Discounts/Agreements
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="discountsAgreements"
                            value={formData.discountsAgreements}
                            onChange={(e) => setFormData({ ...formData, discountsAgreements: e.target.value })}
                            placeholder="Enter any special discounts or additional agreements (optional)..."
                        />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="fileUpload">
                        <Form.Label className="d-flex align-items-center text-secondary">
                            <RiUpload2Line className="me-2" />
                            Upload Contract PDF
                        </Form.Label>
                        <div 
                            {...getRootProps()} 
                            className={`dropzone p-4 rounded ${isDragActive ? 'bg-light' : ''}`}
                            style={{ 
                                border: isDragActive ? '2px dashed #0d6efd' : '2px dashed #dee2e6',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                        >
                            <input {...getInputProps()} />
                            {!formData.file ? (
                                <div className="text-center py-3">
                                    <RiFileTextLine size={40} className="text-primary mb-2" />
                                    <p className="mb-1">Drag and drop a PDF file here, or click to select one</p>
                                    <small className="text-muted">Only PDF files are accepted</small>
                                </div>
                            ) : (
                                <div className="file-preview p-3 bg-light rounded d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <RiFileTextLine size={24} className="text-primary me-2" />
                                        <div>
                                            <p className="mb-0 fw-medium">{formData.file.name}</p>
                                            <small className="text-muted">{(formData.file.size / 1024).toFixed(2)} KB</small>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(e);
                                        }}
                                        className="d-flex align-items-center"
                                    >
                                        <RiCloseLine className="me-1" /> Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Form.Group>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <Button 
                            variant="primary" 
                            type="submit" 
                            size="lg"
                            disabled={isSubmitting}
                            className="px-4 d-flex align-items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <RiCheckLine className="me-2" /> Update Contract
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ContractForm;
