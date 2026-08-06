"use client";
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { customFetch, customPost } from "../Auth/customFetch";
import { designation, PatientPersonalInformationFields } from "./fields/Util";
import PersonalRegistrationForms from "./PersonalRegistrationForms/PersonalRegistrationForms";
import { handleAgeCalculations } from "../Auth/registerclient";
import { plsEncryption } from "../../lib/encryption";
import { useApplication } from "../Auth/useApplicationContext";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
	RiCalendarLine,
	RiCashFill,
	RiGenderlessLine,
	RiPhoneLine,
	RiRecordCircleFill,
	RiSearchLine,
	RiStethoscopeLine,
	RiUser3Line,
} from "@remixicon/react";

export default function PersonalInformationRegistration() {
	const [isLoading, setIsLoading] = useState(false);
	const [showDecisionModal, setShowDecisionModal] = useState(false);
	const [showPatientFoundModal, setShowPatientFoundModal] = useState(false);
	const [redirectUrl, setRedirectUrl] = useState("");
	const [foundPatients, setFoundPatients] = useState([]);
	const employeeid = useApplication()?.user?.employeeid || null;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSearchingPatient, setIsSearchingPatient] = useState(false);
	const [formData, setFormData] = useState(PatientPersonalInformationFields);
	const { patientid = null } = useParams();
	const [searchQuery, setSearchQuery] = useState("");

	const hydratePatientFormData = (patientInfo = {}) => {
		if (!patientInfo || Object.keys(patientInfo).length === 0) return;
		const hydrated = { ...patientInfo };
		if (hydrated?.dob) {
			const dob = new Date(hydrated.dob);
			hydrated.years = dob.getFullYear();
			hydrated.months = dob.getMonth() + 1;
			hydrated.days = dob.getDate();
		}
		setFormData((prev) => ({
			...prev,
			...hydrated,
		}));
	};

	const openPatientDecisionModal = (patientInfo) => {
		const normalized = Array.isArray(patientInfo) ? patientInfo.filter(Boolean) : patientInfo ? [patientInfo] : [];
		setFoundPatients(normalized);
		setShowPatientFoundModal(true);
	};

	const loadPatientData = async (patientIdValue) => {
		try {
			setIsLoading(true);
			const response = await customFetch(`register/personalinformation?patientid=${patientIdValue}`);
			if (response?.statusCode === 200 && response.result && Object.keys(response.result).length > 0) {
				hydratePatientFormData(response.result);
			}
		} catch (error) {
			console.error("Error loading patient data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (patientid) {
			loadPatientData(patientid);
		}
	}, [patientid]);

	const onSubmit = async (ev) => {
		ev.preventDefault();
		try {
			setIsSubmitting(true);
			const method = patientid ? "PUT" : "POST";
			const endpoint =
				method === "POST"
					? `register?employeeid=${employeeid}`
					: `register/personalinformation?patientid=${patientid}&&employeeid=${employeeid}`;

			const finalData = {
				firstname: formData.firstname,
				middlename: formData.middlename,
				lastname: formData.lastname,
				designation: formData.designation,
				age: formData.age ? parseInt(formData.age, 10) : 0,
				agetype: formData.ageType,
				gender: formData.gender,
				mobile_number: formData.mobile_number,
				contact_pointer: formData?.contact_pointer === "relative" ? "relative" : "self",
				mobile_country_code: formData.mobileCountryCode,
				whatsapp_country_code: formData.whatsappCountryCode,
				registeredby: employeeid,
			};

			if (formData?.relativecontactnumber && formData?.relativeCountryCode) {
				finalData.relativecontactnumber = formData.relativecontactnumber;
			}
			if (formData?.whatAppcontact && formData?.whatsappCountryCode) {
				finalData.whatAppcontact = formData.whatAppcontact;
			}
			if (formData?.email && formData.email.trim() !== "") {
				finalData.email = formData.email;
			}
			if (formData.years && formData.months && formData.days) {
				const parsedYears = parseInt(formData.years, 10) || 0;
				const parsedMonths = parseInt(formData.months, 10) || 0;
				const parsedDays = parseInt(formData.days, 10) || 0;
				const newDate = new Date().setFullYear(parsedYears, parsedMonths - 1, parsedDays);
				finalData.dob = new Date(newDate).toISOString();
			}
			if (formData?.marital_status && formData.marital_status.trim() !== "") {
				finalData.marital_status = formData.marital_status;
			}
			if (formData.contact_pointer == "relative") formData.mobile_number = "";

			const response = await customPost(endpoint, method, finalData);
			const { message, patientid: responsePatientId } = response;
			if (response?.status == true || response?.status === "success") {
				toast.success(`${message}. Registration successful.` || "updating record sucessfully");
				if (responsePatientId) {
					setRedirectUrl(`/billing/patientid/${plsEncryption(responsePatientId.toString())}/multi`);
					setShowDecisionModal(true);
				}
			} else {
				toast.error(message, { autoClose: 1000 });
			}
		} catch (error) {
			toast.error("An error occurred while submitting the form");
			console.error("Submission error", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const checkIFNumberisAvailable = async (value, setState) => {
		try {
			const checking = await customFetch(`register/checkmobile?mobileno=${value}&&isGetData=true`);
			setState(checking?.exist);
		} catch (err) {
			setState(false);
		}
	};

	const handlePatientSearch = async () => {
		const query = searchQuery.trim();
		if (!query) return;

		setIsSearchingPatient(true);
		try {
			const response = await customFetch(`register/checkmobile?mobileno=${encodeURIComponent(query)}&&isGetData=true`);
			const patientRecords = Array.isArray(response?.result)
				? response.result.filter(Boolean)
				: response?.result
					? [response.result]
					: [];

			if (response?.statusCode === 200 && response?.exist && patientRecords.length > 0) {
				openPatientDecisionModal(patientRecords);
				return;
			}

			toast.info("No matching patient found. You can register a new patient.");
		} catch (error) {
			toast.error("Unable to search patient right now.");
		} finally {
			setIsSearchingPatient(false);
		}
	};

	const handleOpenUpdateRecord = (patientInfo) => {
		if (patientInfo?.patientid) {
			window.location.href = `/crm/registration/${patientInfo.patientid}/personal-information`;
		}
	};

	const handleGoBillingFromExisting = (patientInfo) => {
		if (patientInfo?.patientid) {
			const billingUrl = `/billing/patientid/${plsEncryption(patientInfo.patientid.toString())}/multi`;
			setRedirectUrl(billingUrl);
			setShowPatientFoundModal(false);
			window.location.href = billingUrl;
		}
	};

	const getFullName = (patient = {}) => {
		return [patient.firstname, patient.middlename, patient.lastname].filter(Boolean).join(" ").replace(/\s+/g, " ").trim() || "Unnamed patient";
	};

	const getInitials = (name = "") => {
		return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";
	};

	if (isLoading) {
		return <div>Loading Patient Information...</div>;
	}

	return (
		<>
			<section className="col-lg-12 col-sm-12 registration-page-shell">
				<div className="registration-search-block mb-3">
					<div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
						<div className="d-flex align-items-start gap-3">
							<div className="registration-search-icon">
								<RiSearchLine size={20} />
							</div>
							<div>
								<h6 className="mb-1 fw-semibold">Search Existing Patient</h6>
								<p className="mb-0 text-muted small">Type a mobile number to load an existing record and choose whether to update it or go straight to billing.</p>
							</div>
						</div>
						<div className="text-lg-end small text-muted">Matches open in a detailed patient chooser</div>
					</div>
					<div className="input-group input-group-lg registration-search-input">
						<span className="input-group-text bg-transparent border-end-0">
							<RiPhoneLine size={18} className="text-muted" />
						</span>
						<input
							type="text"
							className="form-control shadow-none border-start-0"
							placeholder="Type mobile number"
							value={searchQuery}
							onChange={(ev) => setSearchQuery(ev.target.value)}
							onKeyDown={(ev) => {
								if (ev.key === "Enter") {
									ev.preventDefault();
									handlePatientSearch();
								}
							}}
						/>
						<button type="button" className="btn btn-primary px-4" disabled={!searchQuery.trim() || isSearchingPatient} onClick={handlePatientSearch}>
							{isSearchingPatient ? "Searching..." : "Search"}
						</button>
					</div>
				</div>

				<form autoComplete="off" noValidate autoCorrect="false">
					<div className="card card-body border-0 registration-form-card">
						<PersonalRegistrationForms
							handleAgeCalculations={handleAgeCalculations}
							setFormData={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
							data={formData}
							designation={designation}
							checkIFNumberisAvailable={checkIFNumberisAvailable}
							isSearchingPatient={isSearchingPatient}
							onSearchPatient={handlePatientSearch}
						/>

						<div className="mt-4 mx-4">
							<button type="button" className="btn btn-success" disabled={isSubmitting} onClick={(ev) => { onSubmit(ev); }}>
								{isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
								Save current progress
							</button>
						</div>
					</div>
				</form>
			</section>

			<Modal
				show={showPatientFoundModal}
				onHide={() => setShowPatientFoundModal(false)}
				backdrop="static"
				size="xl"
				dialogClassName="patient-found-modal patient-found-modal-top"
				contentClassName="patient-found-modal-content"
			>
				<Modal.Header closeButton className="patient-found-modal-header">
					<div className="patient-found-modal-title-wrap">
						<div className="patient-found-modal-icon" aria-hidden="true">
							<RiSearchLine size={18} />
						</div>
						<div>
							<Modal.Title as="h5" className="patient-found-modal-title mb-0">
								Matching patients found
							</Modal.Title>
							<p className="patient-found-modal-subtitle mb-0">
								<span className="patient-found-count-chip">
									{foundPatients.length} record{foundPatients.length === 1 ? "" : "s"}
								</span>
								{" "}for <strong>{searchQuery || foundPatients[0]?.mobile_number || "this search"}</strong>
								. Select a patient to update or bill.
							</p>
						</div>
					</div>
				</Modal.Header>

				<Modal.Body className="patient-found-modal-body">
					{foundPatients.length > 0 ? (
						<div className="patient-found-table-wrap">
							<div className="patient-found-table-head d-none d-lg-grid">
								<span>Patient</span>
								<span>Phone</span>
								<span>Demography</span>
								<span>Clinical</span>
								<span>Activation Status</span>
								<span className="text-end">Action</span>
							</div>
							<ul className="patient-found-table list-unstyled mb-0">
								{foundPatients.map((patient, index) => {
									const fullName = getFullName(patient);
									const patientIdLabel = patient.fullpatientid || `Patient #${patient.patientid || index + 1}`;
									const ageLabel = [patient.age ?? null, patient.agetype].filter(Boolean).join(" ") || "N/A";
									const dobLabel = patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A";
									const registeredLabel = patient.date ? new Date(patient.date).toLocaleDateString() : "N/A";

									return (
										<li key={patient.patientid || index} className="patient-found-row">
											<div className="patient-found-col patient-found-col-patient">
												<div className="patient-found-name" title={fullName}>{fullName?.toUpperCase()}</div>
												<div className="patient-found-id">{patientIdLabel}</div>
											</div>
											<div className="patient-found-col" title={patient.mobile_number || "N/A"}>
												<span className="patient-found-mobile d-inline-flex align-items-center gap-1">
													<RiPhoneLine size={13} className="patient-found-detail-icon" />
													{patient.mobile_number || "N/A"}
												</span>
											</div>
											<div className="patient-found-col text-capitalize">
												<div>{patient.gender || "N/A"} · {ageLabel}</div>
												<div className="patient-found-subline">DOB: {dobLabel}</div>
											</div>
											<div className="patient-found-col" title={patient.designation || "N/A"}>
												<div className="d-inline-flex align-items-center gap-1">
													<RiStethoscopeLine size={13} className="patient-found-detail-icon" />
													{patient.designation || "N/A"}
												</div>
												<div className="patient-found-subline text-capitalize">{patient.contactpointer || "self"} · {registeredLabel}</div>
											</div>
											<div className="patient-found-col">
												<span className="badge rounded-pill text-bg-success text-capitalize">
													{patient.activation_status || "N/A"}
												</span>
											</div>
											<div className="patient-found-col patient-found-actions">
												<button
													type="button"
													className="btn  btn-outline-secondary"
													onClick={() => handleOpenUpdateRecord(patient)}
												>
												Update
												</button>
												<button
													type="button"
													className="btn btn-success"
													onClick={() => handleGoBillingFromExisting(patient)}
												>
													Billing
												</button>
											</div>
										</li>
									);
								})}
							</ul>
						</div>
					) : (
						<div className="patient-found-empty text-muted">No matching patient records to display.</div>
					)}
				</Modal.Body>

				<Modal.Footer className="patient-found-modal-footer">
					<button type="button" className="btn btn-outline-secondary" onClick={() => setShowPatientFoundModal(false)}>
						Close
					</button>
				</Modal.Footer>
			</Modal>

			<Modal show={showDecisionModal} onHide={() => setShowDecisionModal(false)} backdrop="static" centered contentClassName="bg-dark text-light" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Modal.Header closeButton className="border-secondary">
					<Modal.Title>Registration Complete</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Do you want to proceed to billing for this patient?</p>
				</Modal.Body>
				<Modal.Footer className="border-secondary">
					<Button variant="secondary" onClick={() => { setShowDecisionModal(false); setFormData(PatientPersonalInformationFields); }}>Stay on this page</Button>
					<Button variant="primary" onClick={() => { window.location.href = redirectUrl; }}>Go to Billing</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
