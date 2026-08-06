import React, { useEffect, useState } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { RiUserStarLine, RiImageAddLine, RiImageLine, RiCameraLine, RiUploadCloud2Line } from '@remixicon/react';


// we need to add the emotico of the country flag
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

const PhoneInputGroup = React.memo(({ label, value, countryCode, setCountryCode, onChange, onBlur, placeholder, maxLength = 10, minLength, required = false, error = null, fieldId, errorId, describedBy, ariaInvalid = false }) => (
    <div className="form-group mb-3 mt-3 form-group-responsive phone-input-row">
        <label htmlFor={fieldId} style={{ color: 'var(--bs-body-color)' }}>{label}</label>
        <div>
            <div className="input-group" style={{ width: '100%', minWidth: 0, alignItems: 'center', flexWrap: 'nowrap' }}>
                <select
                    className="form-select form-select-sm custom-select phone-code-select"
                    style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
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
                    id={fieldId}
                    type="tel"
                    inputMode="tel"
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    maxLength={maxLength}
                    minLength={minLength}
                    aria-invalid={ariaInvalid ? 'true' : 'false'}
                    aria-describedby={describedBy}
                    placeholder={placeholder}
                    className={`form-control form-control-sm custom-input phone-number-input ${error ? 'is-invalid' : ''}`}
                    style={{
                        backgroundColor: 'var(--bs-body-bg)',
                        color: 'var(--bs-body-color)',
                        borderColor: error ? '#dc3545' : 'var(--bs-border-color)'
                    }}
                    required={required}
                />
            </div>
            {error && <small id={errorId} role="alert" className="d-block text-danger mt-1">{error}</small>}
        </div>
    </div>
));

PhoneInputGroup.displayName = 'PhoneInputGroup';

const PersonalRegistrationForms = ({ designation, setFormData, handleAgeCalculations, data, checkIFNumberisAvailable }) => {
    const [isNumberExist, setIsNumberExist] = useState(false);
    const [mobileCountryCode, setMobileCountryCode] = useState(data?.mobileCountryCode || '+233');
    const [whatsappCountryCode, setWhatsappCountryCode] = useState(data?.whatsappCountryCode || '+233');
    const [relativeCountryCode, setRelativeCountryCode] = useState(data?.relativeCountryCode || '+233');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(data?.profileImage || null);
    const [cameraError, setCameraError] = useState('');
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const fileInputRef = React.useRef(null);
    const cameraInputRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    const { control, formState: { errors }, watch } = useForm({
        mode: 'onChange',
        defaultValues: {
            designation: data?.designation || '',
            firstname: data?.firstname || '',
            lastname: data?.lastname || '',
            gender: data?.gender || '',
            mobile_number: data?.mobile_number || '',
        }
    });

    const watchedValues = watch();

    // Sync form values with parent setFormData
    useEffect(() => {
        Object.keys(watchedValues).forEach(key => {
            if (watchedValues[key] !== undefined && watchedValues[key] !== data[key]) {
                setFormData(key, watchedValues[key]);
            }
        });
    }, [watchedValues]);

    useEffect(() => {
        setFormData('contact_pointer', isNumberExist ? 'relative' : 'self');
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

    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
    const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
    const mobileNumberDescribedBy = [
        errors.mobile_number ? 'mobile-number-error' : '',
        isNumberExist ? 'mobile-number-exists-warning' : ''
    ].filter(Boolean).join(' ') || undefined;

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            processImageFile(file);
        }
    };

    const handleCameraCapture = (event) => {
        const file = event.target.files[0];
        if (file) {
            processImageFile(file);
        }
    };

    const processImageFile = (file) => {
        const fileName = (file?.name || '').toLowerCase();
        const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
        const hasAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);

        if (!hasAllowedType || !hasAllowedExtension) {
            alert('Please upload JPG, PNG, or WEBP images only.');
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            alert('Image is too large. Maximum allowed size is 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            setPreviewImage(imageData);
            setFormData('profileImage', imageData);
            setShowUploadModal(false);
        };
        reader.readAsDataURL(file);
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setCameraReady(false);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = async () => {
        try {
            setCameraError('');
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                // Fallback for devices/browsers without MediaDevices support.
                if (cameraInputRef.current) {
                    cameraInputRef.current.click();
                }
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            });

            setCameraReady(false);
            setCameraStream(stream);
        } catch (error) {
            setCameraError('Unable to access camera. Please allow camera permission and try again.');
        }
    };

    const capturePhotoFromCamera = () => {
        if (!videoRef.current || !canvasRef.current) return;
        if (!cameraReady) {
            setCameraError('Camera is still loading. Please wait a moment and try again.');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
            setCameraError('Camera is not ready yet. Please try again.');
            return;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(imageData);
        setFormData('profileImage', imageData);
        stopCamera();
        setShowUploadModal(false);
    };

    const handleCloseUploadModal = () => {
        stopCamera();
        setCameraError('');
        setShowUploadModal(false);
    };

    useEffect(() => {
        if (!cameraStream || !videoRef.current) return;

        const video = videoRef.current;
        video.srcObject = cameraStream;
        let cancelled = false;

        const handleLoadedData = async () => {
            try {
                await video.play();
            } catch (error) {
                // Ignore autoplay errors; user can still interact and retry.
            }
            if (cancelled) return;
            if (!video.videoWidth || !video.videoHeight) return;
            setCameraReady(true);
            setCameraError('');
        };

        video.addEventListener('loadeddata', handleLoadedData);

        // If metadata is already available, mark ready immediately.
        if (video.readyState >= 1 && video.videoWidth > 0 && video.videoHeight > 0) {
            setCameraReady(true);
            setCameraError('');
        }

        return () => {
            cancelled = true;
            video.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [cameraStream]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [cameraStream]);

    const handleRemoveImage = () => {
        setPreviewImage(null);
        setFormData('profileImage', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };


    return (
        <div className="registration-shell">

            <div className="registration-form-container registration-form-grid-3">
                <div className="registration-profile-column border rounded-3 p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                    <h6 className='fw-semibold mb-3 d-flex align-items-center gap-2' style={{ color: 'var(--bs-body-color)' }}>
                        <RiUserStarLine size={18} />
                        Profile & Identity
                    </h6>

                    <div className="profile-image-card d-flex flex-column align-items-center">
                        {previewImage ? (
                            <div className="position-relative mb-3" style={{ maxWidth: '220px' }}>
                                <img
                                    src={previewImage}
                                    alt="Profile Preview"
                                    className="img-fluid rounded border"
                                    style={{ width: '220px', height: '220px', objectFit: 'cover' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                    onClick={handleRemoveImage}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => setShowUploadModal(true)}
                                className="d-flex flex-column align-items-center justify-content-center rounded p-4 mb-3"
                                style={{
                                    width: '220px',
                                    height: '220px',
                                    border: '2px dashed var(--bs-border-color)',
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--bs-body-bg)',
                                }}
                            >
                                <RiImageAddLine size={40} className="mb-2" style={{ color: 'var(--bs-secondary-color)' }} />
                                <p className="text-center text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                    Click to upload photo
                                </p>
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <span className="d-inline-flex align-items-center gap-1">
                                <RiImageLine size={16} />
                                {previewImage ? 'Change Photo' : 'Upload Photo'}
                            </span>
                        </button>
                    </div>

                    {isNumberExist && (
                        <div className="form-help-text mt-3 ms-0" role="status" aria-live="polite">
                            <p id="mobile-number-exists-warning" className="text-small-danger small mb-2">Number is associated with a different client</p>
                            <Form.Check
                                type="switch"
                                id="contact_pointer"
                                label="Register as relative"
                                checked={data.contact_pointer === 'relative'}
                                onChange={ev => setFormData('contact_pointer', ev.target.checked ? 'relative' : 'self')}
                            />
                        </div>
                    )}
                </div>

                {/* column two  */}
                <div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label htmlFor="designation" className='required' style={{ color: 'var(--bs-body-color)' }}>Designation</label>
                        <select
                            id="designation"
                            className="form-control custom-select form-control-sm"
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

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label htmlFor="firstname" className='required' style={{ color: 'var(--bs-body-color)' }}>First Name</label>
                        <div>
                            <Controller
                                name="firstname"
                                control={control}
                                rules={{
                                    required: 'First name is required',
                                    minLength: { value: 2, message: 'First name must be at least 2 characters' }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        id="firstname"
                                        type="text"
                                        placeholder="First Name"
                                        aria-invalid={errors.firstname ? 'true' : 'false'}
                                        aria-describedby={errors.firstname ? 'firstname-error' : undefined}
                                        className={`form-control custom-input form-control-sm ${errors.firstname ? 'is-invalid' : ''}`}
                                        style={{
                                            backgroundColor: 'var(--bs-body-bg)',
                                            color: 'var(--bs-body-color)',
                                            borderColor: errors.firstname ? '#dc3545' : 'var(--bs-border-color)'
                                        }}
                                    />
                                )}
                            />
                            {errors.firstname && <small id="firstname-error" role="alert" className="d-block text-danger mt-1">{errors.firstname.message}</small>}
                        </div>
                    </div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label htmlFor="lastname" className='required' style={{ color: 'var(--bs-body-color)' }}>Last Name</label>
                        <div>
                            <Controller
                                name="lastname"
                                control={control}
                                rules={{
                                    required: 'Last name is required',
                                    minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        id="lastname"
                                        type="text"
                                        placeholder="Last Name"
                                        aria-invalid={errors.lastname ? 'true' : 'false'}
                                        aria-describedby={errors.lastname ? 'lastname-error' : undefined}
                                        className={`form-control form-control-sm custom-input ${errors.lastname ? 'is-invalid' : ''}`}
                                        style={{
                                            backgroundColor: 'var(--bs-body-bg)',
                                            color: 'var(--bs-body-color)',
                                            borderColor: errors.lastname ? '#dc3545' : 'var(--bs-border-color)'
                                        }}
                                    />
                                )}
                            />
                            {errors.lastname && <small id="lastname-error" role="alert" className="d-block text-danger mt-1">{errors.lastname.message}</small>}
                        </div>
                    </div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label className='text-end' style={{ color: 'var(--bs-body-color)' }}>Middle Name</label>
                        <input type="text" placeholder="Middle Name" className="form-control form-control-sm custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.middlename || ''} onChange={(ev) => { setFormData('middlename', ev.target.value) }} />
                    </div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label style={{ color: 'var(--bs-body-color)' }}>Date Of Birth</label>
                        <div className='row g-2 flex-grow-1'>
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

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label id="gender-group-label" className='required' style={{ color: 'var(--bs-body-color)' }}>Gender</label>
                        <div>
                            <Controller
                                name="gender"
                                control={control}
                                rules={{
                                    required: 'Gender is required',
                                    validate: (value) => ['male', 'female'].includes(value) || 'Gender must be male or female'
                                }}
                                render={({ field }) => (
                                    <div role="radiogroup" aria-labelledby="gender-group-label" aria-invalid={errors.gender ? 'true' : 'false'} aria-describedby={errors.gender ? 'gender-error' : undefined} className={`d-flex flex-wrap gap-3 ${errors.gender ? 'border border-danger rounded p-2' : ''}`}>
                                        <Form.Check
                                            id="gender-female"
                                            type="radio"
                                            name="gender"
                                            label="Female"
                                            value="female"
                                            checked={field.value === 'female'}
                                            onChange={(ev) => field.onChange('female')}
                                            className="custom-radio"
                                        />
                                        <Form.Check
                                            id="gender-male"
                                            type="radio"
                                            name="gender"
                                            label="Male"
                                            value="male"
                                            checked={field.value === 'male'}
                                            onChange={(ev) => field.onChange('male')}
                                            className="custom-radio"
                                        />
                                    </div>
                                )}
                            />
                            {errors.gender && <small id="gender-error" role="alert" className="d-block text-danger mt-1">{errors.gender.message}</small>}
                        </div>
                    </div>


                    <Controller
                        name="mobile_number"
                        control={control}
                        rules={{
                            required: 'Mobile number is required',
                            pattern: {
                                value: /^\d{10}$/,
                                message: 'Mobile number must contain exactly 10 digits'
                            }
                        }}
                        render={({ field }) => (
                            <PhoneInputGroup
                                label="Mobile Number"
                                value={field.value}
                                countryCode={mobileCountryCode}
                                setCountryCode={setMobileCountryCode}
                                onChange={(ev) => field.onChange(ev.target.value)}
                                onBlur={(ev) => {
                                    field.onBlur();
                                    checkIFNumberisAvailable && checkIFNumberisAvailable(ev.target.value, setIsNumberExist);
                                }}
                                placeholder="Mobile contact"
                                maxLength={10}
                                minLength={10}
                                fieldId="mobile_number"
                                errorId="mobile-number-error"
                                describedBy={mobileNumberDescribedBy}
                                ariaInvalid={!!errors.mobile_number}
                                required={true}
                                error={errors.mobile_number?.message}
                            />
                        )}
                    />
                </div>

                {/* column three */}
                <div>




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

                    {(isNumberExist || data.contact_pointer) && (
                        <>
                            <div className="form-group mb-3 mt-3 form-group-responsive">
                                <label style={{ color: 'var(--bs-body-color)' }}>Relative Name</label>
                                <input type="text" placeholder="Relative's Name" className="form-control form-control-sm custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} value={data.relativecontactname || ''} onChange={(ev) => { setFormData('relativecontactname', ev.target.value) }} />
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

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label className='text-end' style={{ color: 'var(--bs-body-color)' }}>Email</label>
                        <input
                            type="email"
                            value={data.email || ''}
                            onChange={ev => setFormData('email', ev.target.value)}
                            placeholder="Email"
                            className="form-control form-control-sm custom-input"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                        />
                    </div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label className='text-end' style={{ color: 'var(--bs-body-color)' }}>Occupation</label>
                        <input
                            type="text"
                            value={data.occupation || ''}
                            onChange={ev => setFormData('occupation', ev.target.value)}
                            placeholder="Occupation"
                            className="form-control form-control-sm custom-input"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                        />
                    </div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label className='text-end' style={{ color: 'var(--bs-body-color)' }}>Organization</label>
                        <input
                            type="text"
                            value={data.organization || ''}
                            onChange={ev => setFormData('organization', ev.target.value)}
                            placeholder="Organization"
                            className="form-control form-control-sm custom-input"
                            style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }}
                        />
                    </div>

                    <div className="form-group mb-3 mt-3 form-group-responsive">
                        <label className='text-end' style={{ color: 'var(--bs-body-color)' }}>Marital Status</label>
                        <div className="d-flex flex-wrap gap-4">
                            <Form.Check
                                type="radio"
                                label="Single"
                                value="single"
                                checked={data.marital_status === 'single'}
                                onChange={ev => setFormData('marital_status', 'single')}
                                className="custom-radio"
                            />
                            <Form.Check
                                type="radio"
                                label="Married"
                                value="married"
                                checked={data.marital_status === 'married'}
                                onChange={ev => setFormData('marital_status', 'married')}
                                className="custom-radio"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Hidden File Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
            <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="user"
                onChange={handleCameraCapture}
                style={{ display: 'none' }}
            />

            {/* Upload Modal */}
            <Modal show={showUploadModal} onHide={handleCloseUploadModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Profile Photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-column gap-3">
                        {cameraStream ? (
                            <>
                                <div className="border rounded p-2" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="primary"
                                        className="flex-grow-1"
                                        onClick={capturePhotoFromCamera}
                                        disabled={!cameraReady}
                                    >
                                        {cameraReady ? 'Take Photo' : 'Loading camera...'}
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        className="flex-grow-1"
                                        onClick={stopCamera}
                                    >
                                        Stop Camera
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center justify-content-center py-3"
                                    onClick={startCamera}
                                >
                                    <RiCameraLine size={18} className="me-2" />
                                    Capture Photo
                                </Button>
                                <Button
                                    variant="outline-success"
                                    className="d-flex align-items-center justify-content-center py-3"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <RiUploadCloud2Line size={18} className="me-2" />
                                    Select from Files
                                </Button>
                            </>
                        )}
                        {cameraError && <small role="alert" className="text-danger">{cameraError}</small>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseUploadModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PersonalRegistrationForms;
