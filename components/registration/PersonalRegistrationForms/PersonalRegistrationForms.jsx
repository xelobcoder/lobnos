import React from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../Auth/customFetch';

const PersonalRegistrationForms = ({ fields, designation, handleAgeCalculations }) => {
    const {
        register,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = useFormContext();

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
                        <Controller
                            name="designation"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={designationOptions}
                                    styles={reactSelectCustomStyles}
                                    placeholder="Select designation"
                                    isClearable
                                    className="col-lg-4 col-md-6 col-sm-12"
                                    value={designationOptions.find(option => option.value === field.value)}
                                    onChange={(option) => field.onChange(option?.value)}
                                />
                            )}
                        />
                    </div>
                </div>
            )}

            <div className='form-group mb-1'>
                <label className='pls-label required fs-6'>Patient Name</label>
                <div className='row g-3'>
                    {fields.firstname.visible && (
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input {...register("firstname")} type="text" placeholder="First Name" className="form-control" required />
                        </div>
                    )}

                    {fields.lastname.visible && (
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input {...register("lastname")} type="text" placeholder="Last Name" className="form-control" required />
                        </div>
                    )}

                    {fields.middlename.visible && (
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input {...register("middlename")} type="text" placeholder="Middle Name" className="form-control" />
                        </div>
                    )}
                </div>
            </div>

            {fields.days.visible && fields.months.visible && fields.years.visible && (
                <div className="form-group mb-1">
                    <label className='pls-label required fs-6'>Date Of Birth</label>
                    <div className='row g-3'>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input {...register("days")} type="number" className="form-control" min={1} max={31} placeholder="Days" />
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input {...register("months")} type="number" className="form-control" min={1} max={12} placeholder="Months" />
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-12">
                            <input 
                                {...register("years")} 
                                type="number" 
                                className="form-control" 
                                min={1900} 
                                max={new Date().getFullYear()} 
                                placeholder="Years" 
                                onBlur={() => {
                                    const { days, months, years } = getValues();
                                    handleAgeCalculations({ days, months, years }, setValue);
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
                            <input {...register("age")} type="number" className="form-control" min={0} max={150} placeholder="Age" />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12">
                            <Controller
                                name="ageType"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={[
                                            { value: 'years', label: 'Years' },
                                            { value: 'months', label: 'Months' },
                                            { value: 'days', label: 'Days' }
                                        ]}
                                        styles={reactSelectCustomStyles}
                                        placeholder="Select age type"
                                        isClearable
                                        value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1) } : null}
                                        onChange={(option) => field.onChange(option?.value)}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}

            {fields.gender.visible && (
                <div className="form-group mb-1">
                    <label className='pls-label required fs-6'>Gender</label>
                    <div className="d-flex gap-4">
                        <Form.Check type="radio" label="Female" value="female" {...register("gender")} className="custom-radio" />
                        <Form.Check type="radio" label="Male" value="male" {...register("gender")} className="custom-radio" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalRegistrationForms;
