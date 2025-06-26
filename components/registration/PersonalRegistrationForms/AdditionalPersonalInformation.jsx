import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';
import { RiMoneyDollarCircleLine } from '@remixicon/react';

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
            <div className="row g-3">
                {fields.mobile.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Mobile Number</label>
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
                            className="form-control"
                        />
                        {errors.mobile && (
                            <p className="text-small-danger small">{errors.mobile.message}</p>
                        )}
                        {isNumberExist && (
                            <div className="mt-2">
                                <p className="text-small-danger small">Number is associated with a different client</p>
                                <Form.Check
                                    type="switch"
                                    id="contactpointer"
                                    label="Is this person a relative?"
                                    {...register('contactpointer')}
                                />
                            </div>
                        )}
                    </div>
                )}

                {fields.whatAppcontact.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">WhatsApp Contact</label>
                        <input
                            {...register('whatAppcontact')}
                            type="tel"
                            inputMode="tel"
                            maxLength={10}
                            minLength={10}
                            placeholder="WhatsApp contact"
                            className="form-control"
                        />
                        {errors.whatAppcontact && (
                            <p className="text-small-danger small">{errors.whatAppcontact.message}</p>
                        )}
                    </div>
                )}

                {fields.email.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="form-control"
                        />
                        {errors.email && (
                            <p className="text-small-danger small">{errors.email.message}</p>
                        )}
                    </div>
                )}

                {fields.occupation.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Occupation</label>
                        <input
                            {...register('occupation')}
                            type="text"
                            placeholder="Occupation"
                            className="form-control"
                        />
                        {errors.occupation && (
                            <p className="text-small-danger small">{errors.occupation.message}</p>
                        )}
                    </div>
                )}

                {fields.patientOrganization.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Organization</label>
                        <input
                            {...register('patientOrganization')}
                            type="text"
                            placeholder="Patient Organization"
                            className="form-control"
                        />
                        {errors.patientOrganization && (
                            <p className="text-small-danger small">{errors.patientOrganization.message}</p>
                        )}
                    </div>
                )}

                {fields.maritalstatus.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Marital Status</label>
                        <div>
                            <Form.Check
                                type="radio"
                                label="Single"
                                value="single"
                                {...register('maritalstatus')}
                                className="mb-2"
                            />
                            <Form.Check
                                type="radio"
                                label="Married"
                                value="married"
                                {...register('maritalstatus')}
                            />
                        </div>
                        {errors.maritalstatus && (
                            <p className="text-small-danger small">{errors.maritalstatus.message}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <button
                    type="submit"
                    className="btn btn-success btn-sm"
                    disabled={isSubmitting}
                >
                    {isSubmitting && (
                        <span className="spinner-border spinner-border-sm me-2" />
                    )}
                    Save current progress
                </button>
            </div>
        </div>
    );
};

export default AdditionalPersonalInformation;
