"use client"
import React, { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import { customFetch, customPost } from "../Auth/customFetch";
import { designation } from "./fields/Util";
import PersonalRegistrationForms from "./PersonalRegistrationForms/PersonalRegistrationForms";
import { handleAgeCalculations } from "../Auth/registerclient";
import { plsEncryption } from "../../lib/encryption";
import { useApplication } from "../Auth/useApplicationContext";


export default function PersonalInformationRegistration({
	defaultData,
	fields,
	toast,
	patientid,
	redirect = false,
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [showDecisionModal, setShowDecisionModal] = useState(false);
	const [redirectUrl, setRedirectUrl] = useState("");
	const employeeid = useApplication()?.user?.employeeid || null;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState(defaultData);


	const validateCompulsoryFields = (data) => {
		const compulsoryFields = Object.entries(fields)
			.filter(([fieldName, config]) => config.visible && config.compulsory && fieldName !== 'occupation' && fieldName !== 'patientOrganization')
			.map(([fieldName]) => fieldName);
		const missingFields = compulsoryFields.filter(field => {
			const value = data[field];
			if (typeof value === 'string') return value.trim() === '';
			if (typeof value === 'number') {
				return isNaN(value);
			}
			return value === null || value === undefined;
		});
		return missingFields;
	};

	const onSubmit = async (ev) => {
		ev.preventDefault();

		const missingFields = validateCompulsoryFields(formData);

		if (missingFields.length > 0) return toast.error(`Please fill all required fields: ${missingFields.join(", ")}`);

		try {
			setIsSubmitting(true);
			const method = patientid ? "PUT" : "POST";
			const endpoint =
				method === "POST"
					? `register?employeeid=${employeeid}`
					: `register/personalinformation?patientid=${formData?.patientid}&&employeeid=${employeeid}`;

			// Format phone numbers with country codes
			const dataToSubmit = {
				...formData,
				mobileownership: formData?.contactpointer == true ? "relative" : "self",
				mobile: formData.mobile && formData.mobileCountryCode ? `${formData.mobileCountryCode}${formData.mobile}` : formData.mobile,
				whatAppcontact: formData.whatAppcontact && formData.whatsappCountryCode ? `${formData.whatsappCountryCode}${formData.whatAppcontact}` : formData.whatAppcontact,
				relativecontactnumber: formData.relativecontactnumber && formData.relativeCountryCode ? `${formData.relativeCountryCode}${formData.relativecontactnumber}` : formData.relativecontactnumber,
				employeeid,
			};

			const response = await customPost(endpoint, method, {
				data: dataToSubmit
			});
			const { message, patientid: newPatientId } = response;
			if (response?.status == true || response?.status === "success") {
				const toastMessage = redirect
					? `${message}. Registration successful.`
					: message;
				toast.success(toastMessage || "updating record sucessfully");
				if (response.patientid && redirect) {
					setRedirectUrl(`/billing/patientid/${plsEncryption(response.patientid.toString())}/multi`);
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
		return <div>Loading data...</div>;
	}

	return (
		<>
			<section className="col-lg-12 col-sm-12">
				<form
					autoComplete="off"
					noValidate
					autoCorrect="false"
				>
					<div className="registration-form-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 15px' }}>
						<PersonalRegistrationForms
							toast={toast}
							handleAgeCalculations={handleAgeCalculations}
							fields={fields}
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
					<Button variant="secondary" onClick={() => { setShowDecisionModal(false); setFormData(defaultData); }}>
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
