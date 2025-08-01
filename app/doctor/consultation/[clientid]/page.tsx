"use client";

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Row, Col, Form, ListGroup, ListGroupItem, Button, Modal } from "react-bootstrap";
import PreviewPatientInformation from "../../../../components/petientsComponent/PreviewPatientInformation";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import PreviousConsulation from "../../../../components/doctors/PreviousConsulation";
import { useSearchParams, useRouter } from "next/navigation";
import VitalSignCustomerListInformation from '../../../../components/customer/vitalSignCustomerList'
import styles from './ConsultationPanel.module.css'
import { RiBarChart2Fill } from "@remixicon/react";
import { plsDecryption } from "../../../../lib/encryption";
type RecordType = 'Old Record' | 'In-Process (Today)' | 'IPD Review' | 'OPD New Cases';

interface FormData {
	complaints: string;
	hpc: string;
	pmh: string;
	sh: string;
	odq: string;
	dhx: string;
	se: string;
	fh: string;
	obsGynecHistory: string;
	oe: string;
	record_type: RecordType;
}

const ConsulationPanel = ({ params }: { params: { clientid: number } }) => {
	const router = useRouter();
	const { clientid } = params
	const patientid = plsDecryption(clientid.toString());
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;
	const [formData, setFormData] = useState<FormData>({
		complaints: "",
		hpc: "",
		pmh: "",
		sh: "",
		odq: "",
		dhx: "",
		se: "",
		fh: "",
		obsGynecHistory: "",
		oe: "",
		record_type: "OPD New Cases",
	});
	const searchParams = useSearchParams();
	const consultationid = searchParams?.get("consultationid");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [loadingPreviousConsultation, setPrevConsultation] = useState<boolean>(false);
	const [modalContent, setModalContent] = useState<string>("");
	const [modalTitle, setModalTitle] = useState<string>("");
	const [openVitalSign, setCloseVital] = useState<boolean>(false);
	const [showPostSubmitModal, setShowPostSubmitModal] = useState(false);

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		let isFieldFilled = false;

		Object.keys(formData).forEach((field) => {
			if (formData[field as keyof FormData] && !isFieldFilled) {
				isFieldFilled = true;
			}
		});

		if (!isFieldFilled) {
			newErrors["complaints"] = "At least one field must be filled.";
		}

		setErrors(newErrors);
		return isFieldFilled;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			setIsSubmitting(true);
			const method = consultationid ? 'PUT' : 'POST';
			const requestUrl = consultationid ? `records/consulation/update?consultationid=${consultationid}` : 'records/consulation';
			const response = await customPost(requestUrl, method, {
				...formData,
				patientid,
				consulationby: employeeid,
			});
			if (response?.message) {
				toast.success(response.message);
			}
			// Show modal for both new and updated records if response is successful
			if ((response?.recordId && !consultationid) || (method === 'PUT' && response?.status)) {
				if (!consultationid) {
					setFormData({
						complaints: "",
						hpc: "",
						pmh: "",
						sh: "",
						odq: "",
						dhx: "",
						se: "",
						fh: "",
						obsGynecHistory: "",
						oe: "",
						record_type: "OPD New Cases",
					});
				}
				setShowPostSubmitModal(true);
			}
			setIsSubmitting(false);
		} else {
			setIsSubmitting(false);
		}
	};

	const handleOpenModal = (label: string, field: keyof FormData) => {
		setModalContent(formData[field]);
		setModalTitle(label);
		setShowModal(true);
	};

	const handleCloseVitalsingModal = () => {
		setCloseVital(false);
	}



	const handleCloseModal = () => {
		setShowModal(false);
	};





	useEffect(() => {
		if (consultationid) {
			const fetchConsultationData = async () => {
				if (!consultationid) return;
				setPrevConsultation(true);
				try {
					const data = await customFetch(`records/consultation/get/consultation?consultationid=${consultationid}`);
					if (data) {
						setFormData((prevFormData) => ({
							...prevFormData,
							...data,
						}));
					}
					setPrevConsultation(false);
				} catch (error) {
					console.error("Error fetching consultation data:", error);

				}
			};

			fetchConsultationData();
		}
	}, [consultationid])

	return (
		<>
			<Container fluid className={styles.consultationPage} >
				<div className="d-flex justify-content-between align-items-center mb-2">
					<div className="d-flex align-items-center">
						<Button variant="outline-secondary" size="sm" onClick={() => router.push('/doctor/consultation')} className="me-2">
							&larr; Back to Patient Selection

						</Button>
						<Button variant="success"
							className="me-2"
							size="sm"
							onClick={() => {
								router.push(`/billing/patientid/${clientid}/multi`);
							}}>
							Order Laboratory Test
						</Button>
						<Button
							onClick={() => {
								setFormData({
									complaints: "",
									hpc: "",
									pmh: "",
									sh: "",
									odq: "",
									dhx: "",
									se: "",
									fh: "",
									obsGynecHistory: "",
									oe: "",
									record_type: "OPD New Cases",
								});
								router.replace(`/doctor/consultation/${clientid}`);
							}}
							variant="primary"
							className="me-2"
							size="sm"
						>
							New Consultation
						</Button>
					</div>
					<div className="d-flex">
						<button onClick={() => { setCloseVital(true) }} className="btn btn-primary btn-sm me-2">
							vital signs
						</button>
					</div>
				</div>

				{/* Post-submit modal */}
				<Modal show={showPostSubmitModal} onHide={() => setShowPostSubmitModal(false)} centered>
					<Modal.Header closeButton>
						<Modal.Title>Consultation Saved</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>The consultation was saved successfully. What would you like to do next?</p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="success" onClick={() => router.push(`/billing/patientid/${clientid}/multi`)}>
							Order Laboratory Test
						</Button>
						<Button variant="secondary" onClick={() => router.push('/doctor/consultation')}>
							Back to Consultations List
						</Button>
					</Modal.Footer>
				</Modal>
				<hr />
				<Row className="mt-3">
					<Col md={9}>
						<Form onSubmit={handleSubmit}>
							<Row xs={1} md={2} lg={2} className="g-3">
								{[
									["Complaints", "complaints"],
									["History of Presenting Complaint (HPC)", "hpc"],
									["Past Medical History (PMH)", "pmh"],
									["Social History (SH)", "sh"],
									["On Direct Questions (ODQ)", "odq"],
									["Drug History (DHx)", "dhx"],
									["Systemic Enquiries (SE)", "se"],
									["Family History (FH)", "fh"],
									["Obs./Gynecological History", "obsGynecHistory"],
									["On Examination (OE)", "oe"],
								].map(([label, field]) => {
									return (
										<Col key={field} >
											<ListGroup >
												<ListGroupItem className="fw-bold pls-color list-group-item bg-secondary-subtle d-flex justify-content-between align-items-center">
													<span>{label}</span>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														width="24"
														height="24"
														fill="currentColor"
														onClick={() => handleOpenModal(label, field as keyof FormData)}
														style={{ cursor: "pointer" }}
													>
														<path fill="none" d="M0 0h24v24H0z"></path>
														<path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z"></path>
													</svg>
												</ListGroupItem>
												<ListGroupItem className="p-2">
													<Form.Group controlId={field}>
														{loadingPreviousConsultation ? <div className="p-4 bg-secondary-subtle br-5">loading..............</div> :
															<Form.Control
																as="textarea"
																rows={5}
																className={`${styles.mainContentCol}border-0 border-none form`}
																value={formData[field as keyof FormData]}
																onChange={(e) => handleInputChange(field as keyof FormData, e.target.value)}
																style={{ resize: "none" }}
															/>}
														{errors[field] && (
															<div className="text-danger mt-2">{errors[field]}</div>
														)}
													</Form.Group>
												</ListGroupItem>
											</ListGroup>
										</Col>

									)
								})}
							</Row>
							<div className="d-flex justify-content-end mt-3">
								<Button disabled={isSubmitting} type="submit" className="btn btn-sm" variant="primary">
									{isSubmitting ? "submitting...." : "submit"}
								</Button>
							</div>
						</Form>
					</Col>

					<Col md={3}>
						<div>
							<PreviewPatientInformation patientid={patientid} />
						</div>
						<ListGroup className="my-2">
							<ListGroupItem className="fw-bold pls-color list-group-item bg-secondary-subtle d-flex justify-content-between pointer">
								<span>Record Type</span>
							</ListGroupItem>
							<ListGroupItem>
								{[
									{ id: "oldRecord", label: "Old Record", value: "Old Record" },
									{ id: "inProcess", label: "In-Process (Today)", value: "In-Process (Today)" },
									{ id: "ipdReview", label: "IPD Review", value: "IPD Review" },
									{ id: "newCase", label: "New Case", value: "OPD New Cases" },
								].map(({ id, label, value }) => (
									<Form.Check
										key={id}
										type="radio"
										id={id}
										label={label}
										name="recordType"
										className="mt-2"
										checked={formData.record_type === value}
										onChange={() => handleInputChange("record_type", value)}
									/>
								))}
							</ListGroupItem>
						</ListGroup>

						<div>
							<ListGroup>
								<ListGroupItem className=" bg-secondary-subtle pls-color fw-bold">
									Previous Consulation
								</ListGroupItem>
								<ListGroupItem>
									<PreviousConsulation patientid={clientid} />
								</ListGroupItem>
							</ListGroup>
						</div>
					</Col>
				</Row>

				<Modal fullscreen show={showModal} onHide={handleCloseModal}>
					<Modal.Header className="bg-secondary-subtle" closeButton>
						<Modal.Title>{modalTitle}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<pre>{modalContent}</pre>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" className="btn btn-sm" onClick={handleCloseModal}>
							Close
						</Button>
					</Modal.Footer>
				</Modal>

				{
					openVitalSign && <Modal show={openVitalSign} onHide={handleCloseVitalsingModal} size="xl" backdrop='static'>
						<Modal.Header className="bg-secondary-subtle" closeButton>
							<Modal.Title>Vital Sign Chart</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<VitalSignCustomerListInformation searchParams={{ patientid }} size='xl' />
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" className="btn btn-sm" onClick={handleCloseVitalsingModal}>
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				}
			</Container>
		</>
	);
};

export default ConsulationPanel;
