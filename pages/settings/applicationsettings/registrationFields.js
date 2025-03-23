import { useState, useEffect } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import { customPost, customFetch } from "../../../components/Auth/customFetch";
import { registrationFields } from "../../../components/registration/fields/Util";
import {  toast } from "react-toastify";
import PrimeToast from "../../../components/accessories/PrimeToast";	
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { RiSearchLine, RiCheckLine, RiEyeLine, RiSave3Line } from '@remixicon/react';

export default function RegistrationFieldsSettings() {
    const { applicationsettings } = useApplicationSettings();
    const employeeid = applicationsettings.user.employeeid;
    const [fields, setFields] = useState(registrationFields);
    const [isErrorLoadingFields, setIsErrorLoadingFields] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSection, setActiveSection] = useState(null);

    useEffect(() => {
        async function getFieldSettings() {
            try {
                const fetchedFields = await customFetch("applicationsettings/registration/fields");
                setFields(fetchedFields);
                setActiveSection(Object.keys(fetchedFields)[0]);
            } catch (err) {
                setIsErrorLoadingFields(true);
            }
        }
        getFieldSettings();
    }, []);

    const handleFieldChange = (section, field, setting) => {
        setFields(prevFields => ({
            ...prevFields,
            [section]: {
                ...prevFields[section],
                [field]: {
                    ...prevFields[section][field],
                    [setting]: !prevFields[section][field][setting],
                }
            }
        }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const response = await customPost("applicationsettings/registration/fields", "POST", { fields, employeeid });
            const { status, message } = response;
            if (status === "success") {
                toast.success("Settings saved successfully", { autoClose: 1500 });
            } else {
                toast.error(message || "Failed to save settings", { autoClose: 3000 });
            }
        } catch (error) {
            toast.error("An error occurred while saving", { autoClose: 3000 });
        }
        setIsSaving(false);
    };

    if (isErrorLoadingFields) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="text-center">
                    <div className="mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12" y2="16" />
                        </svg>
                    </div>
                    <h4>Unable to Load Settings</h4>
                    <p className="text-muted">Please try refreshing the page or contact support if the issue persists.</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    const filteredFields = searchTerm ? 
        Object.entries(fields).reduce((acc, [section, sectionFields]) => {
            const filtered = Object.entries(sectionFields)
                .filter(([field]) => 
                    field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    section.toLowerCase().includes(searchTerm.toLowerCase())
                );
            if (filtered.length > 0) {
                acc[section] = Object.fromEntries(filtered);
            }
            return acc;
        }, {}) : fields;

    return (
        <MainSettingsLayoutView>
            <PrimeToast/>
            <div className="d-flex h-100 vh-100">
                <div className="border-end bg-white" style={{ width: '280px', height: '100%', overflowY: 'auto' }}>
                    <div className="p-3 h-100">
                        <h4 className="h6 mb-3 text-uppercase fw-bold" style={{ fontSize: '14px' }}>Field Categories</h4>
                        <div className="position-relative mb-3">
                            <RiSearchLine className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="form-control form-control-sm ps-4"
                                placeholder="Search fields..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '35px', fontSize: '13.5px' }}
                            />
                        </div>
                        <div className="nav flex-column overflow-auto" style={{ height: 'calc(100% - 100px)' }}>
                            {Object.entries(filteredFields).map(([section, sectionFields]) => (
                                <div key={section} className="mb-2">
                                    <button
                                        className={`btn text-start py-2 px-3 w-100 text-uppercase ${activeSection === section ? 'btn-light fw-semibold' : 'text-muted'}`}
                                        onClick={() => setActiveSection(section)}
                                        style={{ fontSize: '13px' }}
                                    >
                                        {section.replace(/([A-Z])/g, ' $1').trim()}
                                    </button>
                                    {searchTerm && (
                                        <div className="ms-3 mt-1">
                                            {Object.keys(sectionFields).map(field => (
                                                <div 
                                                    key={field}
                                                    className="py-1 px-3 text-muted cursor-pointer"
                                                    style={{ fontSize: '12.5px' }}
                                                    onClick={() => setActiveSection(section)}
                                                >
                                                    {field}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-grow-1 bg-light d-flex flex-column" style={{ height: '100vh', overflowY: 'hidden' }}>
                    <div className="p-3 flex-grow-1 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="h5 mb-0 text-uppercase fw-bold" style={{ fontSize: '15px' }}>Field Configuration</h2>
                            <button
                                className="btn btn-primary btn-sm d-flex align-items-center gap-2 text-uppercase"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                style={{ fontSize: '13px' }}
                            >
                                <RiSave3Line />
                                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>

                        <div className="bg-white rounded-3 shadow-sm flex-grow-1 d-flex flex-column" style={{ overflowY: 'hidden' }}>
                            <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto' }}>
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th className="bg-white position-sticky top-0 px-3 text-uppercase" 
                                                style={{ width: '40%', fontSize: '13px', fontWeight: '600' }}>
                                                Field Name
                                            </th>
                                            <th className="bg-white position-sticky top-0 text-uppercase" 
                                                style={{ width: '60%', fontSize: '13px', fontWeight: '600' }}>
                                                Properties
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(filteredFields[activeSection] || {}).map(field => (
                                            <tr key={`${activeSection}-${field}`}>
                                                <td className="px-3 py-2">
                                                    <div className="fw-medium text-uppercase" style={{ fontSize: '13px' }}>
                                                        {field}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="d-flex align-items-center gap-4">
                                                        <div className="form-check form-switch">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`visible-${activeSection}-${field}`}
                                                                checked={fields[activeSection][field].visible}
                                                                onChange={() => handleFieldChange(activeSection, field, 'visible')}
                                                            />
                                                            <label className="form-check-label d-flex align-items-center gap-2 text-uppercase" 
                                                                style={{ fontSize: '12.5px' }}
                                                                htmlFor={`visible-${activeSection}-${field}`}>
                                                                <RiEyeLine className="text-muted" />
                                                                Visible
                                                            </label>
                                                        </div>
                                                        <div className="form-check form-switch">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`compulsory-${activeSection}-${field}`}
                                                                checked={fields[activeSection][field].compulsory}
                                                                onChange={() => handleFieldChange(activeSection, field, 'compulsory')}
                                                            />
                                                            <label className="form-check-label d-flex align-items-center gap-2 text-uppercase" 
                                                                style={{ fontSize: '12.5px' }}
                                                                htmlFor={`compulsory-${activeSection}-${field}`}>
                                                                <RiCheckLine className="text-muted" />
                                                                Required
                                                            </label>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainSettingsLayoutView>
    );
}
