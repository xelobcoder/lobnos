import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import MainSettingsLayoutView from '../settingsComponents/MainSettingsLayoutView';
export default function OutSourcingOrganizationForm() {
    const [formData, setFormData] = useState({
        organizationID: '',
        organizationName: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        faxNumber: '',
        address: '',
        billingAddress: '',
        websiteURL: '',
        typeOfOrganization: ''
    });

    const [errors, setErrors] = useState({});

    const validationSchema = Yup.object().shape({
        organizationName: Yup.string().required('Organization Name is required'),
        contactPerson: Yup.string().required('Contact Person is required'),
        phoneNumber: Yup.string().required('Phone number is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        faxNumber: Yup.string().nullable(),
        address: Yup.string().required('Address is required'),
        billingAddress: Yup.string().nullable(),
        websiteURL: Yup.string().url('Invalid URL').nullable(),
        typeOfOrganization: Yup.string().required('Type of Organization is required')
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
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
        <Row>
            <Col md="12">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className='grid-20-80 my-2 reg-grid' controlId="organizationName">
                        <Form.Label className='text-sm'>Organization Name</Form.Label>
                        <Form.Control
                            type="text"
                            className='custom-input r-3'
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            isInvalid={!!errors.organizationName}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.organizationName}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="contactPerson">
                        <Form.Label className='text-sm'>Contact Person</Form.Label>
                        <Form.Control
                            type="text"
                            className='custom-input'
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            isInvalid={!!errors.contactPerson}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.contactPerson}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="phoneNumber">
                        <Form.Label className='text-sm'>Phone Number</Form.Label>
                        <Form.Control
                            type="tell"
                            minLength={10}
                            maxLength={10}
                            className='custom-input'
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            isInvalid={!!errors.phoneNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.phoneNumber}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="email">
                        <Form.Label className='text-sm'>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            className='custom-input'
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="faxNumber">
                        <Form.Label className='text-sm'>Fax Number</Form.Label>
                        <Form.Control
                            type="text"
                            className='custom-input'
                            name="faxNumber"
                            value={formData.faxNumber}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="address">
                        <Form.Label className='text-sm'>Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            className='custom-textarea'
                            value={formData.address}
                            onChange={handleChange}
                            isInvalid={!!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.address}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="billingAddress">
                        <Form.Label className='text-sm'>Billing Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            className='custom-textarea'
                            rows={3}
                            name="billingAddress"
                            value={formData.billingAddress}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="websiteURL">
                        <Form.Label className='text-sm'>Website URL</Form.Label>
                        <Form.Control
                            type="text"
                            className='custom-input'
                            name="websiteURL"
                            value={formData.websiteURL}
                            onChange={handleChange}
                            isInvalid={!!errors.websiteURL}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.websiteURL}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='grid-20-80 my-2' controlId="typeOfOrganization">
                        <Form.Label className='text-sm'>Type of Organization</Form.Label>
                        <Form.Control
                            as="select"
                            className='custom-select'
                            name="typeOfOrganization"
                            value={formData.typeOfOrganization}
                            onChange={handleChange}
                            isInvalid={!!errors.typeOfOrganization}
                        >
                            <option value="">Select...</option>
                            <option value="hospital">Hospital</option>
                            <option value="clinic">Clinic</option>
                            <option value="research">Research Facility</option>
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            {errors.typeOfOrganization}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit information
                    </Button>
                </Form>
            </Col>
        </Row>
    );
};


