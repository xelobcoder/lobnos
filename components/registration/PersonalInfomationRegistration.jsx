"use client"
import React, { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import { customFetch, customPost } from "../Auth/customFetch";
import { designation, PatientPersonalInformationFields } from "./fields/Util";
import PersonalRegistrationForms from "./PersonalRegistrationForms/PersonalRegistrationForms";
import { handleAgeCalculations } from "../Auth/registerclient";
import { plsEncryption } from "../../lib/encryption";
import { useApplication } from "../Auth/useApplicationContext";
import { useParams } from "next/navigation";
import { toast } from 'react-toastify';


export default function PersonalInformationRegistration() {
	const [isLoading, setIsLoading] = useState(false);
	const [showDecisionModal, setShowDecisionModal] = useState(false);
	const [redirectUrl, setRedirectUrl] = useState("");
	const employeeid = useApplication()?.user?.employeeid || null;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState(PatientPersonalInformationFields);
	const { patientid = null } = useParams();




	const loadPatientData = async (patientid) => {
		try {
			setIsLoading(true);
			const response = await customFetch(`register/personalinformation?patientid=${patientid}`);
			if (response?.statusCode && response.statusCode === 200 && response.result && Object.keys(response.result).length > 0) {
				if (response.result?.dob) {
					const dob = new Date(response.result.dob);
					const years = dob.getFullYear();
					const months = dob.getMonth() + 1;
					const days = dob.getDate();
					response.result.years = years;
					response.result.months = months;
					response.result.days = days;
				}
				setFormData({
					...formData,
					...response.result,
				});
			}
		} catch (error) {
			console.error("Error loading patient data:", error);
		}
		finally {
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
				contact_pointer: formData?.contact_pointer === 'relative' ? 'relative' : 'self',
				mobile_country_code: formData.mobileCountryCode,
				whatsapp_country_code: formData.whatsappCountryCode,
				registeredby: employeeid
			}


			if (formData?.relativecontactnumber && formData?.relativeCountryCode) {
				finalData.relativecontactnumber = formData.relativecontactnumber;
			}

			if (formData?.whatAppcontact && formData?.whatsappCountryCode) {
				finalData.whatAppcontact = formData.whatAppcontact;
			}

			if (formData?.email && formData?.email.trim() !== "") {
				finalData.email = formData.email;
			}


			if (formData.years && formData.months && formData.days) {
				const parsedYears = parseInt(formData.years, 10) || 0;
				const parsedMonths = parseInt(formData.months, 10) || 0;
				const parsedDays = parseInt(formData.days, 10) || 0;
				const newDate = new Date().setFullYear(parsedYears, parsedMonths - 1, parsedDays)
				finalData.dob = new Date(newDate).toISOString();
			}

			if (formData?.marital_status && formData?.marital_status.trim() !== "") {
				finalData.marital_status = formData.marital_status;
			}

			const response = await customPost(endpoint, method, finalData);
			const { message, patientid: responsePatientId } = response;
			if (response?.status == true || response?.status === "success") {
				const toastMessage = `${message}. Registration successful.`
				toast.success(toastMessage || "updating record sucessfully");
				if (responsePatientId) {
					setRedirectUrl(`/billing/patientid/${plsEncryption(responsePatientId.toString())}/multi`);
					setShowDecisionModal(true);
				}
			} else {
				toast.error(message, { autoClose: 1000 });
			}
		} catch (error) {
			toast.error("An error occurred while submitting the form")
			console.error("Submission error", error);
		} finally {
			setIsSubmitting(false);
		}
	};


	const checkIFNumberisAvailable = async (value, setState) => {
		try {
			const checking = await customFetch(`register/checkmobile?mobileno=${value}`);
			setState(checking?.exist)
		} catch (err) {
			setState(false);
		}
	}

	if (isLoading) {
		return <div>Loading Patient Information...</div>;
	}

	return (
		<>
			<section className="col-lg-12 col-sm-12">
				<form autoComplete="off" noValidate autoCorrect="false">
					<div className="registration-form-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 15px' }}>
						<PersonalRegistrationForms
							handleAgeCalculations={handleAgeCalculations}
							setFormData={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
							data={formData}
							designation={designation}
							checkIFNumberisAvailable={checkIFNumberisAvailable}
						/>

						<div className="mt-4">
							<button
								type="button"
								className="btn btn-success"
								disabled={isSubmitting}
								onClick={(ev) => { onSubmit(ev) }}
							>
								{isSubmitting && (
									<span className="spinner-border spinner-border-sm me-2" />
								)}
								Save current progress
							</button>
						</div>
					</div>
				</form>
			</section>
			<Modal show={showDecisionModal} onHide={() => setShowDecisionModal(false)} backdrop="static" centered contentClassName="bg-dark text-light" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Modal.Header closeButton className="border-secondary">
					<Modal.Title>Registration Complete</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Do you want to proceed to billing for this patient?</p>
				</Modal.Body>
				<Modal.Footer className="border-secondary">
					<Button variant="secondary" onClick={() => { setShowDecisionModal(false); setFormData(PatientPersonalInformationFields); }}>
						Stay on this page
					</Button>
					<Button variant="primary" onClick={() => { window.location.href = redirectUrl; }}>
						Go to Billing
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
