import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

const COUNTRY_CODES_GROUPED = {
    'West Africa': [
        { code: '+233', abbreviation: 'GH', name: 'Ghana' },
        { code: '+234', abbreviation: 'NG', name: 'Nigeria' },
        { code: '+221', abbreviation: 'SN', name: 'Senegal' },
        { code: '+225', abbreviation: 'CI', name: 'Ivory Coast' },
        { code: '+223', abbreviation: 'ML', name: 'Mali' },
        { code: '+231', abbreviation: 'LR', name: 'Liberia' },
        { code: '+232', abbreviation: 'SL', name: 'Sierra Leone' },
        { code: '+228', abbreviation: 'TG', name: 'Togo' },
        { code: '+229', abbreviation: 'BJ', name: 'Benin' },
        { code: '+226', abbreviation: 'BF', name: 'Burkina Faso' },
        { code: '+227', abbreviation: 'NE', name: 'Niger' },
        { code: '+245', abbreviation: 'GW', name: 'Guinea-Bissau' },
        { code: '+224', abbreviation: 'GN', name: 'Guinea' },
    ],
    'North Africa': [
        { code: '+212', abbreviation: 'MA', name: 'Morocco' },
        { code: '+249', abbreviation: 'SD', name: 'Sudan' },
        { code: '+251', abbreviation: 'ET', name: 'Ethiopia' },
    ],
    'East Africa': [
        { code: '+254', abbreviation: 'KE', name: 'Kenya' },
        { code: '+256', abbreviation: 'UG', name: 'Uganda' },
        { code: '+255', abbreviation: 'TZ', name: 'Tanzania' },
        { code: '+250', abbreviation: 'RW', name: 'Rwanda' },
        { code: '+257', abbreviation: 'BI', name: 'Burundi' },
    ],
    'Central Africa': [
        { code: '+237', abbreviation: 'CM', name: 'Cameroon' },
        { code: '+243', abbreviation: 'CD', name: 'Congo (DR)' },
        { code: '+241', abbreviation: 'GA', name: 'Gabon' },
    ],
    'Southern Africa': [
        { code: '+27', abbreviation: 'ZA', name: 'South Africa' },
        { code: '+266', abbreviation: 'LS', name: 'Lesotho' },
        { code: '+268', abbreviation: 'SZ', name: 'Eswatini' },
        { code: '+265', abbreviation: 'MW', name: 'Malawi' },
        { code: '+260', abbreviation: 'ZM', name: 'Zambia' },
        { code: '+263', abbreviation: 'ZW', name: 'Zimbabwe' },
        { code: '+267', abbreviation: 'BW', name: 'Botswana' },
    ],
    'International': [
        { code: '+44', abbreviation: 'GB', name: 'UK' },
        { code: '+1', abbreviation: 'US', name: 'USA/Canada' },
        { code: '+358', abbreviation: 'FI', name: 'Finland' },
        { code: '+33', abbreviation: 'FR', name: 'France' },
        { code: '+49', abbreviation: 'DE', name: 'Germany' },
        { code: '+39', abbreviation: 'IT', name: 'Italy' },
        { code: '+34', abbreviation: 'ES', name: 'Spain' },
    ],
};

const PhoneInputGroup = React.memo(({ label, value, countryCode, setCountryCode, onChange, onBlur, placeholder, maxLength = 10, required = false }) => (
    <div className="form-group mb-3 mt-3 d-flex align-items-start">
        <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)', paddingTop: '8px' }}>{label}</label>
        <div className="ms-3 flex-grow-1">
            <div className="input-group ">
                <select
                    className="form-select form-select-sm custom-select"
                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)', maxWidth: '140px' }}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                >
                    {Object.entries(COUNTRY_CODES_GROUPED).map(([region, countries]) => (
                        <optgroup key={region} label={region}>
                            {countries.map(item => (
                                <option key={item.code} value={item.code}>{item.abbreviation} {item.code}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <input
                    type="tel"
                    inputMode="tel"
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className="form-control form-control-sm custom-input"
                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                    required={required}
                />
            </div>
        </div>
    </div>
));

PhoneInputGroup.displayName = 'PhoneInputGroup';

const PersonalRegistrationForms = ({ fields, designation, setFormData, handleAgeCalculations, data, checkIFNumberisAvailable }) => {
    const [isNumberExist, setIsNumberExist] = useState(false);
    const [mobileCountryCode, setMobileCountryCode] = useState(data?.mobileCountryCode || '+233');
    const [whatsappCountryCode, setWhatsappCountryCode] = useState(data?.whatsappCountryCode || '+233');
    const [relativeCountryCode, setRelativeCountryCode] = useState(data?.relativeCountryCode || '+233');

    useEffect(() => {
        setFormData('mobileownership', isNumberExist ? 'relative' : 'self');
    }, [isNumberExist])

    useEffect(() => {
        setFormData('mobileCountryCode', mobileCountryCode);
    }, [mobileCountryCode]);

    useEffect(() => {
        setFormData('whatsappCountryCode', whatsappCountryCode);
    }, [whatsappCountryCode]);

    useEffect(() => {
        setFormData('relativeCountryCode', relativeCountryCode);
    }, [relativeCountryCode]);

    const designationOptions = designation.map(item => ({
        value: item,
        label: item
    }));


    return (
        <div className="registration-form-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 15px' }}>
            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className='required  text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Designation</label>
                <select
                    className="form-control custom-select form-control-sm ms-3"
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

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className='required  text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>First Name</label>
                <input type="text" placeholder="First Name" value={data.firstname || ''} onChange={(ev) => { setFormData('firstname', ev.target.value) }} className="form-control custom-input form-control-sm ms-3" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} required />
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className='required  text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Last Name</label>
                <input type="text" placeholder="Last Name" className="form-control form-control-sm ms-3 custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.lastname || ''} onChange={(ev) => { setFormData('lastname', ev.target.value) }} required />
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Middle Name</label>
                <input type="text" placeholder="Middle Name" className="form-control form-control-sm ms-3 custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.middlename || ''} onChange={(ev) => { setFormData('middlename', ev.target.value) }} />
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-start">
                <label className='  text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)', paddingTop: '8px' }}>Date Of Birth</label>
                <div className='row g-2 ms-3 flex-grow-1'>
                    <div className="col-lg-2 col-md-4 col-sm-12">
                        <input type="number" className="form-control form-control-sm custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.days || ''} onChange={(ev) => { setFormData('days', ev.target.value) }} min={1} max={31} placeholder="DD" />
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-12">
                        <input type="number" className="form-control form-control-sm custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} min={1} max={12} value={data.months || ''} onChange={(ev) => { setFormData('months', ev.target.value) }} placeholder="MM" />
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-12">
                        <input
                            type="number"
                            className="form-control form-control-sm custom-input"
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
                    <div className="col-lg-2 col-md-4 col-sm-12">
                        <input type="number" className="form-control form-control-sm custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} min={0} max={150} placeholder="Age" value={data.age || ''} onChange={(ev) => { setFormData('age', ev.target.value) }} />
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-12">
                        <select
                            className="form-control form-control-sm custom-select"
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
                </div>
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className='required  text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Gender</label>
                <div className="d-flex gap-4 ms-3">
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

            <PhoneInputGroup
                label="Mobile Number"
                value={data.mobile || ''}
                countryCode={mobileCountryCode}
                setCountryCode={setMobileCountryCode}
                onChange={ev => setFormData('mobile', ev.target.value)}
                onBlur={ev => checkIFNumberisAvailable && checkIFNumberisAvailable(ev.target.value, setIsNumberExist)}
                placeholder="Mobile contact"
                maxLength={10}
                minLength={10}
                required={true}
            />
            {isNumberExist && (
                <div style={{ marginLeft: '120px', marginTop: '-15px' }} className="mt-2">
                    <p className="text-small-danger small">Number is associated with a different client</p>
                    <Form.Check
                        type="switch"
                        id="contactpointer"
                        label="Is this person a relative?"
                        checked={data.contactpointer || data.contactpointer == "relative"}
                        onChange={ev => setFormData('contactpointer', ev.target.checked)}
                    />
                </div>
            )}

            <PhoneInputGroup
                label="WhatsApp Contact"
                value={data.whatAppcontact || ''}
                countryCode={whatsappCountryCode}
                setCountryCode={setWhatsappCountryCode}
                onChange={ev => setFormData('whatAppcontact', ev.target.value)}
                placeholder="WhatsApp contact"
                maxLength={10}
                minLength={10}
            />

            {(isNumberExist || data.contactpointer) && (
                <>
                    <div className="form-group mb-3 mt-3 d-flex align-items-center">
                        <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Relative Name</label>
                        <input type="text" placeholder="Relative's Name" className="form-control form-control-sm ms-3 custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.relativecontactname || ''} onChange={(ev) => { setFormData('relativecontactname', ev.target.value) }} />
                    </div>

                    <PhoneInputGroup
                        label="Relative Contact"
                        value={data.relativecontactnumber || ''}
                        countryCode={relativeCountryCode}
                        setCountryCode={setRelativeCountryCode}
                        onChange={ev => setFormData('relativecontactnumber', ev.target.value)}
                        placeholder="Relative's Mobile Number"
                        maxLength={10}
                        minLength={10}
                    />
                </>
            )}

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Email</label>
                <input
                    type="email"
                    value={data.email || ''}
                    onChange={ev => setFormData('email', ev.target.value)}
                    placeholder="Email"
                    className="form-control form-control-sm ms-3 custom-input"
                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                />
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Occupation</label>
                <input
                    type="text"
                    value={data.occupation || ''}
                    onChange={ev => setFormData('occupation', ev.target.value)}
                    placeholder="Occupation"
                    className="form-control form-control-sm ms-3 custom-input"
                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                />
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Organization</label>
                <input
                    type="text"
                    value={data.patientOrganization || ''}
                    onChange={ev => setFormData('patientOrganization', ev.target.value)}
                    placeholder="Patient Organization"
                    className="form-control form-control-sm ms-3 custom-input"
                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                />
            </div>

            <div className="form-group mb-3 mt-3 d-flex align-items-center">
                <label className=' text-end' style={{ minWidth: '120px', color: 'var(--bs-body-color)' }}>Marital Status</label>
                <div className="d-flex gap-4 ms-3">
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
        </div>
    );
};

export default PersonalRegistrationForms;
