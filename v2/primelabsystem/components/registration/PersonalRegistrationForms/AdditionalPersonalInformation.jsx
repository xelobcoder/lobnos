import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';
import { Money } from '@mui/icons-material';

const AdditionalPersonalInformation = ({ fields, checkIFNumberisAvailable }) => {
    const {
        register,
        getValues,
        formState: { errors, isSubmitting },
    } = useFormContext();

    const [isNumberExist, setIsNumberExist] = useState(false);


    useEffect(() => {
        const { contactpointer } = getValues();
        setIsNumberExist(contactpointer == "relative" ? true : false);
    }, [])

    return (
        <div>
            {fields.mobile.visible && (
                <div className="form-row grid-reg my-1">
                    <label className="pls-label">Mobile Number</label>
                    <div>
                        <input
                            {...register('mobile')}
                            type="tel"
                            inputMode="tel"
                            onBlur={(ev) => {
                                checkIFNumberisAvailable(ev.target.value, setIsNumberExist);
                            }}
                            maxLength={10}
                            minLength={10}
                            placeholder="Mobile contact"
                            className="custom-input"
                        />
                        {errors.mobile && (
                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                {errors.mobile.message}
                            </p>
                        )}
                        {isNumberExist && (
                            <div className="mt-2">
                                <p className="text-danger">
                                    Number is associated with a different client
                                </p>
                                <Form.Check
                                    type="switch"
                                    id="contactpointer"
                                    label="Is this person a relative? Use this contact for communication."
                                    {...register('contactpointer')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {fields.whatAppcontact.visible && (
                <div className="form-row grid-reg my-1">
                    <label className="pls-label">WhatsApp Contact</label>
                    <div>
                        <input
                            {...register('whatAppcontact')}
                            type="tel"
                            inputMode="tel"
                            maxLength={10}
                            minLength={10}
                            placeholder="WhatsApp contact"
                            className="custom-input"
                        />
                        {errors.whatAppcontact && (
                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                {errors.whatAppcontact.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {fields.email.visible && (
                <div className="form-row grid-reg my-1">
                    <label className="pls-label">Email</label>
                    <div>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="custom-input"
                        />
                        {errors.email && (
                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {fields.occupation.visible && (
                <div className="form-row grid-reg my-1">
                    <label className="pls-label">Occupation</label>
                    <div>
                        <input
                            {...register('occupation')}
                            type="text"
                            placeholder="Occupation"
                            className="custom-input"
                        />
                        {errors.occupation && (
                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                {errors.occupation.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {fields.patientOrganization.visible && (
                <div className="form-row grid-reg my-1">
                    <label className="pls-label">Organization</label>
                    <div>
                        <input
                            {...register('patientOrganization')}
                            type="text"
                            placeholder="Patient Organization"
                            className="custom-input h-40"
                        />
                        {errors.patientOrganization && (
                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                {errors.patientOrganization.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {fields.maritalstatus.visible && (
                <div className="form-row grid-reg my-1">
                    <label className="pls-label">Marital Status</label>
                    <div>
                        <Form.Check
                            type="radio"
                            label="Single"
                            value="single"
                            {...register('maritalstatus')}
                            style={{ marginBottom: '10px', fontSize: '16px' }}
                        />
                        <Form.Check
                            type="radio"
                            label="Married"
                            value="married"
                            {...register('maritalstatus')}
                            style={{ fontSize: '16px' }}
                        />
                        {errors.maritalstatus && (
                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                {errors.maritalstatus.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    className="btn mt-3 btn-success btn-sm text-capitalize"
                    disabled={isSubmitting}
                >
                    {isSubmitting && (
                        <span
                            className="spinner-border spinner-border-sm mr-2"
                            role="status"
                            aria-hidden="true"
                        ></span>
                    )}
                    Save current progress
                </button>

                <Button variant="light" className="mt-3 btn-sm mx-2" type="button">
                    <Money /> Register and Bill Client
                </Button>
            </div>
        </div>
    );
};

export default AdditionalPersonalInformation;
