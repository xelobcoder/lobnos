import { useEffect, useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import * as Yup from 'yup';
import { customFetch, customPost } from '../Auth/customFetch';
import { useSearchParams } from 'next/navigation';
import Loader from '../accessories/Loader';
import { useApplicationSettings } from '../Auth/useApplicationContext';

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
        } catch (validationErrors) {
            if (validationErrors.inner) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});
                setErrors(formattedErrors);
            } else {
                console.error('Submission error:', validationErrors);
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
        <Row className='card-body p-2'>
            <Col md="12">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className='grid-20-80 my-2 reg-grid' controlId="name">
                        <Form.Label className='text-sm'>Organization Name</Form.Label>
                        <Form.Control
                            type="text"
                            className='custom-input r-3'
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
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

                    <Form.Group className='grid-20-80 my-2' controlId="contactNumber">
                        <Form.Label className='text-sm'>Phone Number</Form.Label>
                        <Form.Control
                            type="tel"
                            minLength={10}
                            maxLength={10}
                            className='custom-input'
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            isInvalid={!!errors.contactNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.contactNumber}
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

                    <Form.Group className='grid-20-80 my-2' controlId="organizationType">
                        <Form.Label className='text-sm'>Type of Organization</Form.Label>
                        <Form.Control
                            as="select"
                            className='custom-select'
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleChange}
                            isInvalid={!!errors.organizationType}
                        >
                            <option value="">Select...</option>
                            <option value="hospital">Hospital</option>
                            <option value="clinic">Clinic</option>
                            <option value="research">Research Facility</option>
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            {errors.organizationType}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Information'}
                    </Button>
                </Form>
            </Col>
        </Row>
    );
}