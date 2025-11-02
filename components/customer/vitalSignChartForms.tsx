import { RiAddLine } from '@remixicon/react';
import { useState, useEffect } from "react";
import { handleChangeWithState } from "../Auth/customFetch";
import { uploadVitalSign } from "./dataActions/vitalsigns";
import PatientFiltered from "../accessories/SectorFileringComponents/CustomerFiltering";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Modal, Button } from 'react-bootstrap';

interface VitalSignData {
    blood_pressure_lowerLimit: string;
    blood_pressure_upperLimit: string;
    temperature: string;
    pulse: string;
    respiration: string;
    spo2: string;
}

interface ValidationErrors {
    blood_pressure_lowerLimit?: string;
    blood_pressure_upperLimit?: string;
    temperature?: string;
    pulse?: string;
    respiration?: string;
    spo2?: string;
}

export default function RecordVitalSignsChartForm({ searchParams }) {
    const { patientid } = searchParams;
    const { applicationsettings } = useApplicationSettings();
    const { employeeid } = applicationsettings.user;
    const [formData, setFormData] = useState<VitalSignData>({
        blood_pressure_lowerLimit: "",
        blood_pressure_upperLimit: "",
        temperature: "",
        pulse: "",
        respiration: "",
        spo2: ""
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const getFilteredPatient = (options) => {
        if (typeof options === "object" && options.hasOwnProperty("patientid")) {
            const { patientid } = options;
            router.push(`/operations/laboratory/vitals/record-vital-sign?patientid=${patientid}&&iNewChart=0`);
        }
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        let isValid = true;

        // Blood Pressure validation
        const systolic = parseFloat(formData.blood_pressure_upperLimit);
        const diastolic = parseFloat(formData.blood_pressure_lowerLimit);

        if (!formData.blood_pressure_upperLimit || systolic < 1 || systolic > 300) {
            errors.blood_pressure_upperLimit = "Systolic pressure must be between 1-300 mmHg";
            isValid = false;
        }

        if (!formData.blood_pressure_lowerLimit || diastolic < 1 || diastolic > 300) {
            errors.blood_pressure_lowerLimit = "Diastolic pressure must be between 1-300 mmHg";
            isValid = false;
        }

        if (systolic && diastolic && systolic <= diastolic) {
            errors.blood_pressure_upperLimit = "Systolic must be higher than diastolic";
            isValid = false;
        }

        // Temperature validation
        const temp = parseFloat(formData.temperature);
        if (!formData.temperature || temp < 30 || temp > 45) {
            errors.temperature = "Temperature must be between 30-45°C";
            isValid = false;
        }

        // Pulse validation
        const pulse = parseFloat(formData.pulse);
        if (!formData.pulse || pulse < 30 || pulse > 250) {
            errors.pulse = "Pulse rate must be between 30-250 bpm";
            isValid = false;
        }

        // Respiration validation
        const resp = parseFloat(formData.respiration);
        if (!formData.respiration || resp < 1 || resp > 60) {
            errors.respiration = "Respiration rate must be between 1-60 breaths/min";
            isValid = false;
        }

        // SPO2 validation
        const spo2 = parseFloat(formData.spo2);
        if (!formData.spo2 || spo2 < 0 || spo2 > 100) {
            errors.spo2 = "SpO2 must be between 0-100%";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        if (!validateForm()) {
            toast.error("Please correct the validation errors");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await uploadVitalSign({ ...formData, patientid, employeeid }, "POST", undefined);
            // Check for successful response format {"status":true}
            console.log('RESP', response);
            if (response && response.status && Boolean(response.status) === true) {
                // Reset form on success (uploadVitalSign handles success/error toasts internally)
                setFormData({
                    blood_pressure_lowerLimit: "",
                    blood_pressure_upperLimit: "",
                    temperature: "",
                    pulse: "",
                    respiration: "",
                    spo2: ""
                });
                setValidationErrors({});
                setShowModal(false); 
                toast.success("Vital signs saved successfully");
            } else {
                toast.error("Failed to save vital signs. Please try again.");
            }
        } catch (error) {
            console.error("Error saving vital signs:", error);
            toast.error("An error occurred while saving vital signs");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (ev, fieldName) => {
        // Clear validation error for this field when user starts typing
        if (validationErrors[fieldName]) {
            setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }));
        }
        handleChangeWithState(ev, fieldName, setFormData, formData);
    };

    return (
        <div>
            <ToastContainer position="top-center" className="text-sm" theme="colored" />

            <div className="mx-2 d-flex justify-content-between mb-4">
                <h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5">
                    Vital Signs Recording
                </h5>

                {patientid && (
                    <div>
                        <button
                            className="btn btn-primary mb-1 btn-sm"
                            onClick={() => setShowModal(true)}
                        >
                            <RiAddLine /> Add New Vitals
                        </button>
                    </div>
                )}
            </div>

            {/* Patient Selection */}
            <div className="mx-2 mb-4 col-5">
                <PatientFiltered
                    isDisabled={false}
                    getSelectedPatient={getFilteredPatient}
                    placeholder='Search and select patient'
                />
            </div>

            {/* Vital Signs Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                style={{ zIndex: 9999 }}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Record Vital Signs</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12">
                                {/* Blood Pressure */}
                                <div className="d-flex align-items-center mb-3">
                                    <label className="pls-label fw-semibold me-3" style={{ minWidth: '200px' }}>
                                        Blood Pressure (mmHg):
                                    </label>
                                    <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                                        <div style={{ maxWidth: '120px' }}>
                                            <input
                                                value={formData.blood_pressure_upperLimit}
                                                onChange={(ev) => handleInputChange(ev, "blood_pressure_upperLimit")}
                                                className={`form-control w-100 ${validationErrors.blood_pressure_upperLimit ? 'is-invalid' : ''}`}
                                                placeholder="120"
                                                type="number"
                                                min="1"
                                                max="300"
                                                required
                                            />
                                            {validationErrors.blood_pressure_upperLimit && (
                                                <div className="invalid-feedback">{validationErrors.blood_pressure_upperLimit}</div>
                                            )}
                                        </div>
                                        <span className="text-muted">/</span>
                                        <div style={{ maxWidth: '120px' }}>
                                            <input
                                                value={formData.blood_pressure_lowerLimit}
                                                onChange={(ev) => handleInputChange(ev, "blood_pressure_lowerLimit")}
                                                className={`form-control w-100 ${validationErrors.blood_pressure_lowerLimit ? 'is-invalid' : ''}`}
                                                placeholder="80"
                                                type="number"
                                                min="1"
                                                max="300"
                                                required
                                            />
                                            {validationErrors.blood_pressure_lowerLimit && (
                                                <div className="invalid-feedback">{validationErrors.blood_pressure_lowerLimit}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Diastolic Blood Pressure */}

                                {/* Body Temperature */}
                                <div className="d-flex align-items-center mb-3">
                                    <label className="pls-label fw-semibold me-3" style={{ minWidth: '200px' }}>
                                        Body Temperature (°C):
                                    </label>
                                    <div style={{ maxWidth: '150px' }}>
                                        <input
                                            min={30}
                                            max={45}
                                            step="0.1"
                                            value={formData.temperature}
                                            onChange={(ev) => handleInputChange(ev, "temperature")}
                                            className={`form-control w-100 ${validationErrors.temperature ? 'is-invalid' : ''}`}
                                            placeholder="36.5"
                                            type="number"
                                            required
                                        />
                                        {validationErrors.temperature && (
                                            <div className="invalid-feedback">{validationErrors.temperature}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Heart Rate / Pulse */}
                                <div className="d-flex align-items-center mb-3">
                                    <label className="pls-label fw-semibold me-3" style={{ minWidth: '200px' }}>
                                        Heart Rate / Pulse (bpm):
                                    </label>
                                    <div style={{ maxWidth: '150px' }}>
                                        <input
                                            min={30}
                                            max={250}
                                            value={formData.pulse}
                                            onChange={(ev) => handleInputChange(ev, "pulse")}
                                            className={`form-control w-100 ${validationErrors.pulse ? 'is-invalid' : ''}`}
                                            placeholder="72"
                                            type="number"
                                            required
                                        />
                                        {validationErrors.pulse && (
                                            <div className="invalid-feedback">{validationErrors.pulse}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Respiratory Rate */}
                                <div className="d-flex align-items-center mb-3">
                                    <label className="pls-label fw-semibold me-3" style={{ minWidth: '200px' }}>
                                        Respiratory Rate (breaths/min):
                                    </label>
                                    <div style={{ maxWidth: '150px' }}>
                                        <input
                                            min={1}
                                            max={60}
                                            value={formData.respiration}
                                            onChange={(ev) => handleInputChange(ev, "respiration")}
                                            className={`form-control w-100 ${validationErrors.respiration ? 'is-invalid' : ''}`}
                                            placeholder="16"
                                            type="number"
                                            required
                                        />
                                        {validationErrors.respiration && (
                                            <div className="invalid-feedback">{validationErrors.respiration}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Oxygen Saturation */}
                                <div className="d-flex align-items-center mb-3">
                                    <label className="pls-label fw-semibold me-3" style={{ minWidth: '200px' }}>
                                        Oxygen Saturation (SpO2 %):
                                    </label>
                                    <div style={{ maxWidth: '150px' }}>
                                        <input
                                            min={0}
                                            max={100}
                                            value={formData.spo2}
                                            onChange={(ev) => handleInputChange(ev, "spo2")}
                                            className={`form-control w-100 ${validationErrors.spo2 ? 'is-invalid' : ''}`}
                                            placeholder="98"
                                            type="number"
                                            required
                                        />
                                        {validationErrors.spo2 && (
                                            <div className="invalid-feedback">{validationErrors.spo2}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer className="justify-content-end">
                    <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <RiAddLine className="me-2" />
                                Save
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
