"use client";
import { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import * as Yup from 'yup';
import { customFetch, customPost } from '../Auth/customFetch';
import { useSearchParams, useRouter } from 'next/navigation';
import Loader from '../accessories/Loader';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import {
    RiBuilding2Line,
    RiUserLine,
    RiPhoneLine,
    RiMailLine,
    RiFileTextLine,
    RiMapPinLine,
    RiGlobalLine,
    RiSave3Line,
    RiArrowGoBackLine
} from '@remixicon/react';
import { toast } from 'react-toastify';

const defaultData = {
    outsourceid: '',
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    faxNumber: '',
    address: '',
    billingAddress: '',
    websiteURL: '',
    organizationType: ''
};

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Organization Name is required'),
    contactPerson: Yup.string().required('Contact Person is required'),
    contactNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    faxNumber: Yup.string().nullable(),
    address: Yup.string().required('Address is required'),
    billingAddress: Yup.string().nullable(),
    websiteURL: Yup.string().url('Invalid URL').nullable(),
    organizationType: Yup.string().required('Type of Organization is required')
});

export default function OutSourcingOrganizationForm() {
    const { applicationsettings } = useApplicationSettings();
    const employeeid = applicationsettings?.user?.employeeid
    const outsourceid = useSearchParams().get("orgid");
    const method = outsourceid ? 'PUT' : 'POST';
    const [formData, setFormData] = useState(defaultData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await validationSchema.validate(formData, { abortEarly: false });
            const response = await customPost(
                "outsourcing/organization",
                method,
                { ...formData, employeeid, outsourceid }
            );
            console.log('Submission successful:', response);
            setErrors({});
            toast.success(`Organization ${outsourceid ? 'updated' : 'added'} successfully!`);
            router.push('/settings/outsource');
        } catch (validationErrors) {
            if (validationErrors.inner) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});
                setErrors(formattedErrors);
                toast.error('Please correct the errors in the form');
            } else {
                console.error('Submission error:', validationErrors);
                toast.error('An error occurred while saving');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (outsourceid) {
            setLoading(true);
            customFetch(`outsourcing/organization?outsourceid=${outsourceid}`)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setFormData(data[0]);
                    }
                })
                .catch((err) => {
                    console.error('Error fetching organization data:', err);
                    setFormData(defaultData);
                })
                .finally(() => setLoading(false));
        }
    }, [outsourceid]);

    if (loading) return <Loader />;

    return (
        <div className="container-fluid">
            <div className="border border-1 br-5 bg-white p-4">
                <div className="d-flex align-items-center mb-4">
                    <RiBuilding2Line size={24} className="me-2 text-primary" />
                    <h4 className="mb-0 fw-bold">
                        {outsourceid ? 'Update Organization' : 'Add New Organization'}
                    </h4>
                </div>
                <Form onSubmit={handleSubmit}>
                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiBuilding2Line className="me-2" />
                            Organization Name *
                        </label>
                        <div>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                isInvalid={!!errors.name}
                                placeholder="Enter organization name"
                                aria-label="Organization Name"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiUserLine className="me-2" />
                            Contact Person *
                        </label>
                        <div>
                            <Form.Control
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                isInvalid={!!errors.contactPerson}
                                placeholder="Enter contact person name"
                                aria-label="Contact Person"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.contactPerson}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiPhoneLine className="me-2" />
                            Phone Number *
                        </label>
                        <div>
                            <Form.Control
                                type="tel"
                                minLength={10}
                                maxLength={10}
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                isInvalid={!!errors.contactNumber}
                                placeholder="Enter 10-digit phone number"
                                aria-label="Phone Number"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.contactNumber}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiMailLine className="me-2" />
                            Email Address *
                        </label>
                        <div>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!errors.email}
                                placeholder="Enter email address"
                                aria-label="Email Address"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiFileTextLine className="me-2" />
                            Fax Number
                        </label>
                        <div>
                            <Form.Control
                                type="text"
                                name="faxNumber"
                                value={formData.faxNumber}
                                onChange={handleChange}
                                placeholder="Enter fax number (optional)"
                                aria-label="Fax Number"
                            />
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiMapPinLine className="me-2" />
                            Address *
                        </label>
                        <div>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                isInvalid={!!errors.address}
                                placeholder="Enter complete address"
                                aria-label="Address"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.address}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiMapPinLine className="me-2" />
                            Billing Address
                        </label>
                        <div>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleChange}
                                placeholder="Enter billing address (if different)"
                                aria-label="Billing Address"
                            />
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiGlobalLine className="me-2" />
                            Website URL
                        </label>
                        <div>
                            <Form.Control
                                type="text"
                                name="websiteURL"
                                value={formData.websiteURL}
                                onChange={handleChange}
                                isInvalid={!!errors.websiteURL}
                                placeholder="Enter website URL (optional)"
                                aria-label="Website URL"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.websiteURL}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row grid-reg mb-3">
                        <label className="pls-label">
                            <RiBuilding2Line className="me-2" />
                            Type of Organization *
                        </label>
                        <div >
                            <Form.Select
                                name="organizationType"
                                value={formData.organizationType}
                                onChange={handleChange}
                                isInvalid={!!errors.organizationType}
                                aria-label="Type of Organization"
                            >
                                <option value="">Select organization type...</option>
                                <option value="hospital">Hospital</option>
                                <option value="clinic">Clinic</option>
                                <option value="research">Research Facility</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.organizationType}
                            </Form.Control.Feedback>
                        </div>
                    </div>

                    <div className="form-row mt-4">
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => router.push('/settings/outsource')}
                    
                            >
                                <RiArrowGoBackLine className="me-1" /> Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                    size="sm"
                            >
                                <RiSave3Line className="me-1" /> {loading ? 'Saving...' : 'Save Organization'}
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}