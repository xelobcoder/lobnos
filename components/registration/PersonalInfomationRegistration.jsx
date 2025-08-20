"use client"
import React, { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import { customFetch, customPost } from "../Auth/customFetch";
import { designation } from "./fields/Util";
import PersonalRegistrationForms from "./PersonalRegistrationForms/PersonalRegistrationForms";
import AdditionalPersonalInformation from "./PersonalRegistrationForms/AdditionalPersonalInformation";
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
			.filter(([_, config]) => config.visible && config.compulsory)
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
			const response = await customPost(endpoint, method, {
				data: {
					...formData, mobileownership: formData?.contactpointer == true ? "relative" : "self"
				}
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
					<div>
						<PersonalRegistrationForms
							toast={toast}
							handleAgeCalculations={handleAgeCalculations}
							fields={fields}
							setFormData={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
							data={formData}
							designation={designation}
						/>
						<AdditionalPersonalInformation
							setFormData={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
							data={formData}
							checkIFNumberisAvailable={checkIFNumberisAvailable}
							fields={fields}
							patientid={patientid} />

						<div className="mt-4">
							<button
								type="button"
								className="btn btn-success btn-sm"
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
			<Modal show={showDecisionModal} onHide={() => setShowDecisionModal(false)} backdrop="static" centered>
				<Modal.Header closeButton>
					<Modal.Title>Registration Complete</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Do you want to proceed to billing for this patient?</p>
				</Modal.Body>
				<Modal.Footer>
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
