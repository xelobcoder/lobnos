import React from 'react';
import { Form } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

const PersonalRegistrationForms = ({ fields, designation, handleAgeCalculations }) => {
    const {
        register,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext();

    return (
        <div>
            {fields.designation.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>Designation</label>
                    <div>
                        <select {...register("designation")} className="custom-select col-sm-12 col-lg-3 col-md-6">
                            <option value="">select option</option>
                            {designation.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                        {errors.designation && <p className="text-danger text-sm">{errors.designation.message}</p>}
                    </div>
                </div>
            )}

            {fields.firstname.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>First Name</label>
                    <div>
                        <input {...register("firstname")} type="text" placeholder="First Name" className="custom-input" required />
                        {errors.firstname && <p className="text-danger text-sm">{errors.firstname.message}</p>}
                    </div>
                </div>
            )}

            {fields.lastname.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>Last Name</label>
                    <div>
                        <input {...register("lastname")} type="text" placeholder="Last Name" className="custom-input" required />
                        {errors.lastname && <p className="text-danger text-sm">{errors.lastname.message}</p>}
                    </div>
                </div>
            )}

            {fields.middlename.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>Middle Name</label>
                    <div>
                        <input {...register("middlename")} type="text" placeholder="Middle Name" className="custom-input" />
                        {errors.middlename && <p className="text-danger text-sm">{errors.middlename.message}</p>}
                    </div>
                </div>
            )}

            {fields.days.visible && fields.months.visible && fields.years.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>Date Of Birth</label>
                    <div>
                        <input {...register("days")} type="number" className="custom-input my-1" min={1} max={31} placeholder="Days" />
                        {errors.days && <p className="text-danger text-sm">{errors.days.message}</p>}
                        <input {...register("months")} type="number" className="custom-input my-1" min={1} max={12} placeholder="Months" />
                        {errors.months && <p className="text-danger text-sm">{errors.months.message}</p>}
                        <input {...register("years")} type="number" className="custom-input my-1" min={1900} max={new Date().getFullYear()} placeholder="Years" onBlur={() => {
                            const { days, months, years } = getValues();
                            handleAgeCalculations({ days, months, years }, setValue);
                        }} />
                        {errors.years && <p className="text-danger text-sm">{errors.years.message}</p>}</div>
                </div>
            )}

            {fields.age.visible && fields.ageType.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>Age</label>
                    <div>
                        <input {...register("age")} type="number" className="custom-input" min={0} max={150} placeholder="Age" />
                        {errors.age && <p className="text-danger text-sm">{errors.age.message}</p>}
                        <select {...register("ageType")} className="custom-select my-1">
                            <option value="">select an option</option>
                            <option value="years">Years</option>
                            <option value="months">Months</option>
                            <option value="days">Days</option>
                        </select>
                        {errors.ageType && <p className="text-danger text-sm">{errors.ageType.message}</p>}
                    </div>
                </div>
            )}

            {fields.gender.visible && (
                <div className="form-group grid-reg mt-2">
                    <label className='pls-label'>Gender</label>
                    <div>
                        <Form.Check type="radio" label="Female" value="female" {...register("gender")} className="custom-radio" />
                        <Form.Check type="radio" label="Male" value="male" {...register("gender")} className="custom-radio" />
                        {errors.gender && <p className="text-danger text-sm">{errors.gender.message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalRegistrationForms;
