"use client";
import { useEffect, useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { customFetch, customPost } from '../Auth/customFetch';
import { useSearchParams, useRouter } from 'next/navigation';
import Loader from '../accessories/Loader';
import styles from './OutsourceOrganizationForm.module.css';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { RiBuilding2Line, RiUserLine, RiMapPinLine, RiSave3Line } from '@remixicon/react';
import { toast } from 'react-toastify';

const defaultData = {
    outsourceid: '',
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    faxNumber: '',
    address: '',
    billingAddress: '',
    websiteURL: '',
    organizationType: ''
};

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Organization Name is required'),
    contactPerson: Yup.string().required('Contact Person is required'),
    contactNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    faxNumber: Yup.string().nullable(),
    address: Yup.string().required('Address is required'),
    billingAddress: Yup.string().nullable(),
    websiteURL: Yup.string().url('Invalid URL').nullable(),
    organizationType: Yup.string().required('Type of Organization is required')
});

/** @param {{ onSaved?: (organization: any) => void | Promise<void>, onCancel?: () => void, onChanged?: () => void, creating?: boolean }} props */
export default function OutSourcingOrganizationForm({ onSaved, onCancel, onChanged, creating = false } = {}) {
    const { applicationsettings } = useApplicationSettings();
    const employeeid = applicationsettings?.user?.employeeid
    const params = useSearchParams();
    const outsourceid = creating ? null : params.get("orgid");
    const method = outsourceid ? 'PUT' : 'POST';
    const [formData, setFormData] = useState(defaultData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(!!outsourceid);
    const [loadError, setLoadError] = useState('');
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        onChanged?.();
        setSaveError('');
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        setSaveError('');

        try {
            await validationSchema.validate(formData, { abortEarly: false });
            const response = await customPost(
                "outsourcing/organization",
                method,
                { ...formData, employeeid, outsourceid }
            );
            if (response?.status !== true) {
                throw new Error(response?.message || response?.error || (typeof response?.status === 'string' ? response.status : 'Unable to save organization. Please try again.'));
            }
            setErrors({});
            toast.success(`Organization ${outsourceid ? 'updated' : 'added'} successfully!`);
            if (onSaved) await onSaved(formData);
            else router.push('/settings/outsource');
        } catch (validationErrors) {
            if (validationErrors.inner) {
                const formattedErrors = validationErrors.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});
                setErrors(formattedErrors);
                requestAnimationFrame(() => document.getElementById(`outsource-${validationErrors.inner[0]?.path}`)?.focus());
                toast.error('Please correct the highlighted fields');
            } else {
                setSaveError(validationErrors.message || 'Unable to save this organization. Please try again.');
                toast.error(validationErrors.message || 'An error occurred while saving');
            }
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        let active = true;
        if (outsourceid) {
            setLoading(true);
            setLoadError('');
            customFetch(`outsourcing/organization?outsourceid=${outsourceid}`)
                .then((data) => {
                    if (!active) return;
                    if (Array.isArray(data) && data.length > 0) {
                        setFormData({ ...defaultData, ...data[0] });
                    } else throw new Error('This organization could not be found.');
                })
                .catch((err) => {
                    if (active) setLoadError(err?.message || 'Unable to load the organization. Please try again.');
                })
                .finally(() => { if (active) setLoading(false); });
        }
        return () => { active = false; };
    }, [outsourceid, loadAttempt]);

    if (loading) return <Loader />;
    if (loadError) return <div className="alert alert-danger" role="alert"><p>{loadError}</p><Button variant="outline-danger" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Try again</Button></div>;

    const field = (name, label, placeholder, options = {}) => (
        <Form.Group controlId={`outsource-${name}`} className={options.wide ? styles.wide : undefined}>
            <Form.Label className={styles.label}>{label} {options.required ? <span className={styles.required} aria-hidden="true">*</span> : <span className={styles.optional}>Optional</span>}</Form.Label>
            <Form.Control name={name} value={formData[name] ?? ''} onChange={handleChange}
                type={options.type || 'text'} as={options.multiline ? 'textarea' : 'input'} rows={options.multiline ? 3 : undefined}
                autoComplete={options.autoComplete} maxLength={name === 'contactNumber' ? 10 : undefined}
                inputMode={name === 'contactNumber' ? 'tel' : undefined} placeholder={placeholder}
                isInvalid={!!errors[name]} aria-required={!!options.required}
                aria-describedby={errors[name] ? `outsource-${name}-error` : options.hint ? `outsource-${name}-hint` : undefined}/>
            <Form.Control.Feedback type="invalid" id={`outsource-${name}-error`}>{errors[name]}</Form.Control.Feedback>
            {options.hint && <Form.Text id={`outsource-${name}-hint`} className={styles.hint}>{options.hint}</Form.Text>}
        </Form.Group>
    );

    return (
        <div className={`${styles.shell} ${creating ? styles.embedded : ''}`}>
            <header className={styles.header}>
                <span className={styles.headerIcon}><RiBuilding2Line size={26} aria-hidden="true"/></span>
                <div><p className={styles.eyebrow}>OUTSOURCING PARTNERS</p>
                    <h2>{outsourceid ? 'Edit partner organization' : 'Add a partner organization'}</h2>
                    <p>Keep your referral laboratory’s contact and location details in one place.</p>
                </div>
            </header>
            <Form onSubmit={handleSubmit} noValidate>
                {saveError && <div className="alert alert-danger mx-4 mt-3" role="alert">{saveError}</div>}
                {!!Object.keys(errors).length && <div className={styles.errorSummary} role="alert">Please check the highlighted fields before saving.</div>}
                <fieldset disabled={saving} className={styles.fieldset}>
                    <section className={styles.section} aria-labelledby="outsource-identity-heading">
                        <div className={styles.sectionHeading}><RiBuilding2Line size={20} aria-hidden="true"/><div><h3 id="outsource-identity-heading">Organization details</h3><p>Identify the partner that will receive outsourced tests.</p></div></div>
                        <div className={styles.grid}>
                            {field('name', 'Organization name', 'e.g. Central Reference Laboratory', {required:true, autoComplete:'organization'})}
                            <Form.Group controlId="outsource-organizationType">
                                <Form.Label className={styles.label}>Organization type <span className={styles.required} aria-hidden="true">*</span></Form.Label>
                                <Form.Select name="organizationType" value={formData.organizationType || ''} onChange={handleChange} isInvalid={!!errors.organizationType} aria-required="true" aria-describedby={errors.organizationType ? 'outsource-type-error' : undefined}>
                                    <option value="">Choose an organization type</option><option value="laboratory">Laboratory</option><option value="hospital">Hospital</option><option value="clinic">Clinic</option>
                                </Form.Select><Form.Control.Feedback type="invalid" id="outsource-type-error">{errors.organizationType}</Form.Control.Feedback>
                            </Form.Group>
                        </div>
                    </section>
                    <section className={styles.section} aria-labelledby="outsource-contact-heading">
                        <div className={styles.sectionHeading}><RiUserLine size={20} aria-hidden="true"/><div><h3 id="outsource-contact-heading">Primary contact</h3><p>Who should your team contact about referrals and results?</p></div></div>
                        <div className={styles.grid}>
                            {field('contactPerson', 'Contact person', 'Full name', {required:true, autoComplete:'name'})}
                            {field('contactNumber', 'Phone number', 'e.g. 0241234567', {required:true, type:'tel', autoComplete:'tel-national', hint:'Enter a 10-digit phone number.'})}
                            {field('email', 'Email address', 'e.g. referrals@laboratory.com', {required:true, type:'email', autoComplete:'email', wide:true})}
                        </div>
                    </section>
                    <section className={styles.section} aria-labelledby="outsource-address-heading">
                        <div className={styles.sectionHeading}><RiMapPinLine size={20} aria-hidden="true"/><div><h3 id="outsource-address-heading">Location & billing</h3><p>Record where specimens and billing correspondence should go.</p></div></div>
                        <div className={styles.grid}>
                            {field('address', 'Physical address', 'Street address, area and city', {required:true, multiline:true, autoComplete:'street-address'})}
                            {field('billingAddress', 'Billing address', 'Enter if different from the physical address', {multiline:true})}
                        </div>
                        <details className={styles.additional}><summary>Additional contact details <span>Optional</span></summary><div className={styles.grid}>
                            {field('websiteURL', 'Website', 'https://example.com', {type:'url', autoComplete:'url'})}
                            {field('faxNumber', 'Fax number', 'Enter fax number')}
                        </div></details>
                    </section>
                    <footer className={styles.footer}>
                        <p><span className={styles.required}>*</span> Required fields{creating && <span className={styles.nextStep}>Next: configure the test cost and turnaround time.</span>}</p>
                        <div className={styles.actions}><Button type="button" variant="outline-secondary" onClick={() => onCancel ? onCancel() : router.push('/settings/outsource')}>Cancel</Button>
                            <Button type="submit" variant="primary" disabled={saving}>{saving ? <Spinner size="sm" animation="border" aria-hidden="true"/> : <RiSave3Line size={18} aria-hidden="true"/>}{saving ? 'Saving organization…' : outsourceid ? 'Save changes' : 'Create organization'}</Button>
                        </div>
                    </footer>
                </fieldset>
            </Form>
        </div>
    );
}
