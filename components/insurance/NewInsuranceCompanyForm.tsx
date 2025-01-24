'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast, ToastContainer } from 'react-toastify';
import { customFetch, customPost } from '../Auth/customFetch';

interface FormData {
    insuranceName: string;
    insuranceCode: string;
    insuranceType: string;
    searchCode: string;
    network?: string;
    tags?: string;
    mailingAddress?: string;
    city?: string;
    state?: string;
    county?: string;
    zipCode?: string;
    comments?: string;
}

const schema = yup.object().shape({
    insuranceName: yup.string().required('Insurance Name is required'),
    insuranceCode: yup.string().required('Insurance Code is required'),
    insuranceType: yup.string().required('Insurance Type is required'),
    searchCode: yup.string().required('Search Code is required'),
    network: yup.string().nullable(),
    tags: yup.string().nullable(),
    mailingAddress: yup.string().nullable(),
    city: yup.string().nullable(),
    state: yup.string().nullable(),
    county: yup.string().nullable(),
    zipCode: yup
        .string()
        .matches(/^\d{5}$/, 'Invalid Zip Code format')
        .nullable(),
    comments: yup.string().nullable(),
});

const NewInsuranceCompanyForm: React.FC<{ onSubmit: (data: FormData) => void, clinicianid: number | null }> = ({
    onSubmit,
    clinicianid
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const submitForm = async (data: FormData) => {
        setIsLoading(true);
        try {
            const method = clinicianid ? 'PUT' : 'POST';
            const url = clinicianid ? `insurances/${clinicianid}` : `insurances`;
            const response = await customPost(url, method, data);
            const { error, message } = response;
            if (error) {
                toast.error(message || error);
            } else {
                toast.success(message);
            }
        } catch (error) {
            toast.error('Error sending data to the server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clinicianid) {
            customFetch(`insurances/${clinicianid}`)
                .then((data) => {
                    if (data?.message) return;
                    reset(data);
                }).catch((err) => { console.log(err) });
        }
    }, [clinicianid, reset]);

    return (
        <>
            <ToastContainer position='top-center' className={'text-sm'} theme='colored' />
            <Form onSubmit={handleSubmit(submitForm)}>
                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Insurance Name*</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('insuranceName')}
                                isInvalid={!!errors.insuranceName}
                                className="custom-input"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.insuranceName?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Insurance Code*</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('insuranceCode')}
                                isInvalid={!!errors.insuranceCode}
                                className="custom-input"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.insuranceCode?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Insurance Type*</Form.Label>
                            <Form.Control
                                as="select"
                                {...register('insuranceType')}
                                isInvalid={!!errors.insuranceType}
                                className="custom-input"
                            >
                                <option value="">Select Insurance Type</option>
                                <option value="Government">Government</option>
                                <option value="Medicare">Medicare</option>
                                <option value="Private">Private</option>
                                <option value="HMO">HMO</option>
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {errors.insuranceType?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Search Code*</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('searchCode')}
                                isInvalid={!!errors.searchCode}
                                className="custom-input"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.searchCode?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Network</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('network')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Tags</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('tags')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Mailing Address</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('mailingAddress')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>City</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('city')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>State</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('state')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>County</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('county')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <Form.Group>
                            <Form.Label>Zip Code</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('zipCode')}
                                isInvalid={!!errors.zipCode}
                                className="custom-input"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.zipCode?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12}>
                        <Form.Group>
                            <Form.Label>Comments</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                {...register('comments')}
                                className="custom-input"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Button type="submit" variant="primary" className='mt-2' disabled={isLoading}>
                    {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : null}
                    {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
            </Form>
        </>
    );
};

export default NewInsuranceCompanyForm;
