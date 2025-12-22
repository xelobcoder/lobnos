import React from 'react';
import { Form } from 'react-bootstrap';

const PersonalRegistrationForms = ({ fields, designation, setFormData, handleAgeCalculations, data }) => {


    const designationOptions = designation.map(item => ({
        value: item,
        label: item
    }));


    return (
        <div className="registration-form-container">
            {fields.designation.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className='pls-label required fs-6 me-3' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Designation</label>
                    <div className="flex-grow-1">
                        <select
                            className="form-control form-control-sm"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                            value={data?.designation || ''}
                            onChange={(ev) => setFormData('designation', ev.target.value)}
                        >
                            <option value="">Select designation</option>
                            {designationOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {fields.firstname.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className='pls-label required fs-6 me-3' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>First Name</label>
                    <div className="flex-grow-1">
                        <input type="text" placeholder="First Name" value={data.firstname || ''} onChange={(ev) => { setFormData('firstname', ev.target.value) }} className="form-control form-control-sm" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} required />
                    </div>
                </div>
            )}

            {fields.lastname.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className='pls-label required fs-6 me-3' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Last Name</label>
                    <div className="flex-grow-1">
                        <input type="text" placeholder="Last Name" className="form-control form-control-sm" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.lastname || ''} onChange={(ev) => { setFormData('lastname', ev.target.value) }} required />
                    </div>
                </div>
            )}

            {fields.middlename.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className='pls-label fs-6 me-3' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Middle Name</label>
                    <div className="flex-grow-1">
                        <input type="text" placeholder="Middle Name" className="form-control form-control-sm" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.middlename || ''} onChange={(ev) => { setFormData('middlename', ev.target.value) }} />
                    </div>
                </div>
            )}

            {fields.days.visible && fields.months.visible && fields.years.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3">
                    <label className={`pls-label ${fields.days.compulsory || fields.months.compulsory || fields.years.compulsory ? 'required' : ''} fs-6 me-3`} style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Date Of Birth</label>
                    <div className="flex-grow-1">
                        <div className='row '>
                            <div className="col-lg-2 col-md-4 col-sm-12">
                                <input type="number" className="form-control form-control-sm" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.days || ''} onChange={(ev) => { setFormData('days', ev.target.value) }} min={1} max={31} placeholder="DD" />
                            </div>
                            <div className="col-lg-2 col-md-4 col-sm-12">
                                <input type="number" className="form-control form-control-sm" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} min={1} max={12} value={data.months || ''} onChange={(ev) => { setFormData('months', ev.target.value) }} placeholder="MM" />
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-12">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                                    min={1900}
                                    max={new Date().getFullYear()}
                                    placeholder="Years"
                                    value={data.years || ''}
                                    onChange={(ev) => { setFormData('years', ev.target.value) }}
                                    onBlur={() => {
                                        handleAgeCalculations({ days: data.days, months: data.months, years: data.years }, setFormData);
                                    }}
                                />
                            </div>
                            {fields.age.visible && (
                                <div className="col-lg-2 col-md-4 col-sm-12">
                                    <input type="number" className="form-control form-control-sm" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} min={0} max={150} placeholder="Age" value={data.age || ''} onChange={(ev) => { setFormData('age', ev.target.value) }} />
                                </div>
                            )}
                            {fields.ageType.visible && (
                                <div className="col-lg-3 col-md-4 col-sm-12">
                                    <select
                                        className="form-control form-control-sm"
                                        style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                                        value={data.ageType || ''}
                                        onChange={(ev) => setFormData('ageType', ev.target.value)}
                                    >
                                        <option value="">Type</option>
                                        <option value="years">Years</option>
                                        <option value="months">Months</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}



            {fields.gender.visible && (
                <div className="form-group mb-1 d-flex align-items-center mt-3" >
                    <label className='pls-label required fs-6 me-3' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Gender</label>
                    <div className="flex-grow-1 d-flex gap-4">
                        <Form.Check type="radio" label="Female" value="female"
                            checked={data.gender === 'female'}
                            onChange={(ev) => { setFormData('gender', 'female') }}
                            className="custom-radio" />
                        <Form.Check type="radio" label="Male" value="male"
                            checked={data.gender === 'male'}
                            onChange={(ev) => { setFormData('gender', 'male') }}
                            className="custom-radio" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalRegistrationForms;
