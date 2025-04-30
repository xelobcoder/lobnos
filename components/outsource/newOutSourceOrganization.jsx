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
    const employeeid = applicationsettings.user.employeeid;
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
      <div>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-gradient py-3">
                <div className="d-flex align-items-center">
                    <RiBuilding2Line size={24} className="me-2" />
                    <h5 className="mb-0 fw-semibold">
                        {outsourceid ? 'Update Organization' : 'Add New Organization'}
                    </h5>
                </div>
            </Card.Header>
            <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiBuilding2Line className="me-1" /> Organization Name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-lg border-0 bg-light"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    isInvalid={!!errors.name}
                                    placeholder="Enter organization name"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="contactPerson">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiUserLine className="me-1" /> Contact Person
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-lg border-0 bg-light"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    isInvalid={!!errors.contactPerson}
                                    placeholder="Enter contact person name"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.contactPerson}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="contactNumber">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiPhoneLine className="me-1" /> Phone Number
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    minLength={10}
                                    maxLength={10}
                                    className="form-control-lg border-0 bg-light"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    isInvalid={!!errors.contactNumber}
                                    placeholder="Enter 10-digit phone number"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.contactNumber}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiMailLine className="me-1" /> Email Address
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    className="form-control-lg border-0 bg-light"
                                    value={formData.email}
                                    onChange={handleChange}
                                    isInvalid={!!errors.email}
                                    placeholder="Enter email address"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="faxNumber">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiFileTextLine className="me-1" /> Fax Number
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-lg border-0 bg-light"
                                    name="faxNumber"
                                    value={formData.faxNumber}
                                    onChange={handleChange}
                                    placeholder="Enter fax number (optional)"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="address">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiMapPinLine className="me-1" /> Address
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="address"
                                    className="border-0 bg-light"
                                    value={formData.address}
                                    onChange={handleChange}
                                    isInvalid={!!errors.address}
                                    placeholder="Enter complete address"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.address}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="billingAddress">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiMapPinLine className="me-1" /> Billing Address
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    className="border-0 bg-light"
                                    rows={3}
                                    name="billingAddress"
                                    value={formData.billingAddress}
                                    onChange={handleChange}
                                    placeholder="Enter billing address (if different)"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="websiteURL">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiGlobalLine className="me-1" /> Website URL
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-lg border-0 bg-light"
                                    name="websiteURL"
                                    value={formData.websiteURL}
                                    onChange={handleChange}
                                    isInvalid={!!errors.websiteURL}
                                    placeholder="Enter website URL (optional)"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.websiteURL}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="organizationType">
                                <Form.Label className="text-secondary fw-medium">
                                    <RiBuilding2Line className="me-1" /> Type of Organization
                                </Form.Label>
                                <Form.Select
                                    className="form-select-lg border-0 bg-light"
                                    name="organizationType"
                                    value={formData.organizationType}
                                    onChange={handleChange}
                                    isInvalid={!!errors.organizationType}
                                >
                                    <option value="">Select organization type...</option>
                                    <option value="hospital">Hospital</option>
                                    <option value="clinic">Clinic</option>
                                    <option value="research">Research Facility</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.organizationType}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => router.push('/settings/outsource')}
                            className="d-flex align-items-center"
                        >
                            <RiArrowGoBackLine className="me-1" /> Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading}
                            className="d-flex align-items-center"
                        >
                            <RiSave3Line className="me-1" /> {loading ? 'Saving...' : 'Save Organization'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
      </div>
    );
}