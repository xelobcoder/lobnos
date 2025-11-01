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
        resolver: yupResolver(schema) as any,
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
            <style>
                {`
                    .new-insurance-form .grid-reg {
                        display: grid;
                        grid-template-columns: 30% 70% !important;
                        grid-gap: 10px 10px !important;
                    }
                `}
            </style>
            <Form onSubmit={handleSubmit(submitForm)} className="new-insurance-form mx-3">
                <h5>Insurance Information</h5>
                <hr />

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Insurance Name*</label>
                    <Form.Control
                        type="text"
                        {...register('insuranceName')}
                        isInvalid={!!errors.insuranceName}

                    />
                    {errors.insuranceName && (
                        <div className="invalid-feedback d-block">{errors.insuranceName.message}</div>
                    )}
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Insurance Code*</label>
                    <Form.Control
                        type="text"
                        {...register('insuranceCode')}
                        isInvalid={!!errors.insuranceCode}

                    />
                    {errors.insuranceCode && (
                        <div className="invalid-feedback d-block">{errors.insuranceCode.message}</div>
                    )}
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Insurance Type*</label>
                    <Form.Control
                        as="select"
                        {...register('insuranceType')}
                        isInvalid={!!errors.insuranceType}

                    >
                        <option value="">Select Insurance Type</option>
                        <option value="Government">Government</option>
                        <option value="Medicare">Medicare</option>
                        <option value="Private">Private</option>
                        <option value="HMO">HMO</option>
                    </Form.Control>
                    {errors.insuranceType && (
                        <div className="invalid-feedback d-block">{errors.insuranceType.message}</div>
                    )}
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Search Code*</label>
                    <Form.Control
                        type="text"
                        {...register('searchCode')}
                        isInvalid={!!errors.searchCode}

                    />
                    {errors.searchCode && (
                        <div className="invalid-feedback d-block">{errors.searchCode.message}</div>
                    )}
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Network</label>
                    <Form.Control
                        type="text"
                        {...register('network')}

                    />
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Tags</label>
                    <Form.Control
                        type="text"
                        {...register('tags')}

                    />
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Mailing Address</label>
                    <Form.Control
                        type="text"
                        {...register('mailingAddress')}

                    />
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">City</label>
                    <Form.Control
                        type="text"
                        {...register('city')}

                    />
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">State</label>
                    <Form.Control
                        type="text"
                        {...register('state')}

                    />
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">County</label>
                    <Form.Control
                        type="text"
                        {...register('county')}

                    />
                </div>

                <div className="form-row grid-reg mt-2">
                    <label className="pls-label">Zip Code</label>
                    <Form.Control
                        type="text"
                        {...register('zipCode')}
                        isInvalid={!!errors.zipCode}

                    />
                    {errors.zipCode && (
                        <div className="invalid-feedback d-block">{errors.zipCode.message}</div>
                    )}
                </div>

                <hr />
                <h5>Additional Information</h5>
                <div className="form-row mt-2">
                    <Form.Control
                        as="textarea"
                        rows={5}
                        {...register('comments')}

                        placeholder="Enter comments here"
                    />
                </div>

                <Button type="submit" variant="success" className='btn-sm mt-3' disabled={isLoading}>
                    {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : null}
                    {isLoading ? ' Saving...' : 'Save Changes'}
                </Button>
            </Form>
        </>
    );
};

export default NewInsuranceCompanyForm;
