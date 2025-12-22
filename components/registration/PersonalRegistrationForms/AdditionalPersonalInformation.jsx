import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

const AdditionalPersonalInformation = ({ fields, setFormData, data, checkIFNumberisAvailable }) => {
    const [isNumberExist, setIsNumberExist] = useState(false);

    useEffect(() => {
        setFormData({
            mobileownership: isNumberExist ? true : false
        });
    }, [isNumberExist])

    return (
        <div className="registration-form-container">
            {(fields.mobile.visible || fields.whatAppcontact.visible) && (
                <div className="form-group mb-1 d-flex align-items-start mt-3">
                    <label className='pls-label fs-6 me-3 fw-bold' style={{ minWidth: '120px', paddingTop: '8px', color: 'var(--bs-body-color)' }}>Contacts</label>
                    <div className="flex-grow-1">
                        <div className='row g-3'>
                            {fields.mobile.visible && (
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={data.mobile || ''}
                                        onChange={ev => setFormData('mobile', ev.target.value)}
                                        onBlur={ev => checkIFNumberisAvailable(ev.target.value, setIsNumberExist)}
                                        maxLength={10}
                                        minLength={10}
                                        placeholder="Mobile contact"
                                        className="form-control form-control-sm"
                                        style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                                        required={fields.mobile.compulsory}
                                    />
                                    {isNumberExist && (
                                        <div className="mt-2">
                                            <p className="text-small-danger small">Number is associated with a different client</p>
                                            <Form.Check
                                                type="switch"
                                                id="contactpointer"
                                                label="Is this person a relative?"
                                                checked={data.contactpointer || data.contactpointer == "relative"}
                                                onChange={ev => setFormData('contactpointer', ev.target.checked)}
                                                required={fields.contactpointer?.compulsory}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {fields.whatAppcontact.visible && (
                                <div className="col-lg-6 col-md-6 col-sm-12">
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={data.whatAppcontact || ''}
                                        onChange={ev => setFormData('whatAppcontact', ev.target.value)}
                                        maxLength={10}
                                        minLength={10}
                                        placeholder="WhatsApp contact"
                                        className="form-control form-control-sm"
                                        style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                                        required={fields.whatAppcontact.compulsory}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {fields.email.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3" >
                    <label className='pls-label fs-6 me-3 fw-bold' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Email</label>
                    <div className="flex-grow-1">
                        <input
                            type="email"
                            value={data.email || ''}
                            onChange={ev => setFormData('email', ev.target.value)}
                            placeholder="Email"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                            required={fields.email.compulsory}
                        />
                    </div>
                </div>
            )}

            {fields.occupation.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className='pls-label fs-6 me-3 fw-bold' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Occupation</label>
                    <div className="flex-grow-1">
                        <input
                            type="text"
                            value={data.occupation || ''}
                            onChange={ev => setFormData('occupation', ev.target.value)}
                            placeholder="Occupation"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                            required={fields.occupation.compulsory}
                        />
                    </div>
                </div>
            )}

            {fields.patientOrganization.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className='pls-label fs-6 me-3 fw-bold' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Organization</label>
                    <div className="flex-grow-1">
                        <input
                            type="text"
                            value={data.patientOrganization || ''}
                            onChange={ev => setFormData('patientOrganization', ev.target.value)}
                            placeholder="Patient Organization"
                            className="form-control form-control-sm"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                            required={fields.patientOrganization.compulsory}
                        />
                    </div>
                </div>
            )}

            {fields.maritalstatus.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3" >
                    <label className='pls-label fs-6 me-3 fw-bold' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Marital Status</label>
                    <div className="flex-grow-1 d-flex gap-4">
                        <Form.Check
                            type="radio"
                            label="Single"
                            value="single"
                            checked={data.maritalstatus === 'single'}
                            onChange={ev => setFormData('maritalstatus', 'single')}
                            className="custom-radio"
                        />
                        <Form.Check
                            type="radio"
                            label="Married"
                            value="married"
                            checked={data.maritalstatus === 'married'}
                            onChange={ev => setFormData('maritalstatus', 'married')}
                            className="custom-radio"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdditionalPersonalInformation;
