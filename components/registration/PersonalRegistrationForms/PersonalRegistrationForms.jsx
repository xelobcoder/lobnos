import React from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../Auth/customFetch';

const PersonalRegistrationForms = ({ fields, designation, setFormData, handleAgeCalculations, data }) => {


    const designationOptions = designation.map(item => ({
        value: item,
        label: item
    }));


    return (
        <div className="registration-form-container">
            {fields.designation.visible && (
                <div className="form-group mb-1">
                    <label className='pls-label required fs-6'>Designation</label>
                    <div>
                        <Select
                            options={designationOptions}
                            styles={reactSelectCustomStyles}
                            placeholder="Select designation"
                            isClearable
                            className="col-lg-4 col-md-6 col-sm-12"
                            value={designationOptions.find(option => option.value === (data?.designation || ''))}
                            onChange={(option) => {
                                setFormData('designation', option?.value || '')
                            }}
                        />
                    </div>
                </div>
            )}

            <div className='form-group mb-1'>
                <label className='pls-label required fs-6'>Patient Name</label>
                <div className='row g-3'>
                    {fields.firstname.visible && (
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input type="text" placeholder="First Name" value={data.firstname || ''} onChange={(ev) => { setFormData('firstname', ev.target.value) }} className="form-control" required />
                        </div>
                    )}

                    {fields.lastname.visible && (
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input type="text" placeholder="Last Name" className="form-control" value={data.lastname || ''} onChange={(ev) => { setFormData('lastname', ev.target.value) }} required />
                        </div>
                    )}

                    {fields.middlename.visible && (
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input type="text" placeholder="Middle Name" className="form-control" value={data.middlename || ''} onChange={(ev) => { setFormData('middlename', ev.target.value) }} />
                        </div>
                    )}
                </div>
            </div>

            {fields.days.visible && fields.months.visible && fields.years.visible && (
                <div className="form-group mb-1">
                    <label className={`pls-label ${fields.days.compulsory || fields.months.compulsory || fields.years.compulsory ? 'required' : ''} fs-6`}>Date Of Birth</label>
                    <div className='row g-3'>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input type="number" className="form-control" value={data.days || ''} onChange={(ev) => { setFormData('days', ev.target.value) }} min={1} max={31} placeholder="Days" />
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input type="number" className="form-control" min={1} max={12} value={data.months || ''} onChange={(ev) => { setFormData('months', ev.target.value) }} placeholder="Months" />
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input
                                type="number"
                                className="form-control"
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
                    </div>
                </div>
            )}

            {fields.age.visible && fields.ageType.visible && (
                <div className="form-group mb-1">
                    <label className='pls-label required fs-6'>Age</label>
                    <div className='row g-3'>
                        <div className="col-lg-6 col-md-6 col-sm-12">
                            <input type="number" className="form-control" min={0} max={150} placeholder="Age" value={data.age || ''} onChange={(ev) => { setFormData('age', ev.target.value) }} />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12">
                            <Select
                                options={[
                                    { value: 'years', label: 'Years' },
                                    { value: 'months', label: 'Months' },
                                    { value: 'days', label: 'Days' }
                                ]}
                                styles={reactSelectCustomStyles}
                                placeholder="Select age type"
                                isClearable
                                value={data.ageType ? { value: data.ageType, label: data.ageType.charAt(0).toUpperCase() + data.ageType.slice(1) } : null}
                                onChange={(option) => setFormData('ageType', option?.value || '')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {fields.gender.visible && (
                <div className="form-group mb-1">
                    <label className='pls-label required fs-6'>Gender</label>
                    <div className="d-flex gap-4">
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
