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
        <div>
            <div className="row g-3">
                {fields.mobile.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Mobile Number</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            value={data.mobile || ''}
                            onChange={ev => setFormData('mobile', ev.target.value)}
                            onBlur={ev => checkIFNumberisAvailable(ev.target.value, setIsNumberExist)}
                            maxLength={10}
                            minLength={10}
                            placeholder="Mobile contact"
                            className="form-control"
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
                    <div className="col-md-4">
                        <label className="form-label pls-label">WhatsApp Contact</label>
                        <input
                            type="tel"
                            inputMode="tel"
                            value={data.whatAppcontact || ''}
                            onChange={ev => setFormData('whatAppcontact', ev.target.value)}
                            maxLength={10}
                            minLength={10}
                            placeholder="WhatsApp contact"
                            className="form-control"
                            required={fields.whatAppcontact.compulsory}
                        />
                    </div>
                )}

                {fields.email.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Email</label>
                        <input
                            type="email"
                            value={data.email || ''}
                            onChange={ev => setFormData('email', ev.target.value)}
                            placeholder="Email"
                            className="form-control"
                            required={fields.email.compulsory}
                        />
                    </div>
                )}

                {fields.occupation.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Occupation</label>
                        <input
                            type="text"
                            value={data.occupation || ''}
                            onChange={ev => setFormData('occupation', ev.target.value)}
                            placeholder="Occupation"
                            className="form-control"
                            required={fields.occupation.compulsory}
                        />
                    </div>
                )}

                {fields.patientOrganization.visible && (
                    <div className="col-md-4">
                        <label className="form-label pls-label">Organization</label>
                        <input
                            type="text"
                            value={data.patientOrganization || ''}
                            onChange={ev => setFormData('patientOrganization', ev.target.value)}
                            placeholder="Patient Organization"
                            className="form-control"
                            required={fields.patientOrganization.compulsory}
                        />
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
                                checked={data.maritalstatus === 'single'}
                                onChange={ev => setFormData('maritalstatus', 'single')}
                                className="mb-2"
                                required={fields.maritalstatus.compulsory}
                            />
                            <Form.Check
                                type="radio"
                                label="Married"
                                value="married"
                                checked={data.maritalstatus === 'married'}
                                onChange={ev => setFormData('maritalstatus', 'married')}
                                required={fields.maritalstatus.compulsory}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdditionalPersonalInformation;
