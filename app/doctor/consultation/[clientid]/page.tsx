"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import PreviewPatientInformation from "../../../../components/petientsComponent/PreviewPatientInformation";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import PreviousConsulation from "../../../../components/doctors/PreviousConsulation";
import { useSearchParams, useRouter } from "next/navigation";
import VitalSignCustomerListInformation from '../../../../components/customer/vitalSignCustomerList'
import styles from './ConsultationPanel.module.css'
import { plsDecryption } from "../../../../lib/encryption";

type RecordType = 'Old Record' | 'In-Process (Today)' | 'IPD Review' | 'OPD New Cases';

interface FormData {
	consultation_notes: string;
	record_type: RecordType;
}

const CATEGORIES = [
	{ label: "Patient Complaints", key: "Complaints" },
	{ label: "History of Presenting Complaint (HPC)", key: "HPC" },
	{ label: "Past Medical History (PMH)", key: "PMH" },
	{ label: "Social History (SH)", key: "SH" },
	{ label: "On Direct Questions (ODQ)", key: "ODQ" },
	{ label: "Drug History (DHx)", key: "DHx" },
	{ label: "Systemic Enquiries (SE)", key: "SE" },
	{ label: "Family History (FH)", key: "FH" },
	{ label: "Obs./Gynecological History", key: "Obs./Gynec History" },
	{ label: "On Examination (OE)", key: "OE" },
];

const ConsulationPanel = ({ params }: { params: { clientid: number } }) => {
	const router = useRouter();
	const { clientid } = params
	const patientid = plsDecryption(clientid.toString());
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;
	const [formData, setFormData] = useState<FormData>({
		consultation_notes: "",
		record_type: "OPD New Cases",
	});
	const [selectedCategory, setSelectedCategory] = useState<string>("Complaints");
	const [currentInput, setCurrentInput] = useState<string>("");
	const [editingMode, setEditingMode] = useState<boolean>(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPostSubmitModal, setShowPostSubmitModal] = useState(false);
	const [openVitalSign, setCloseVital] = useState<boolean>(false);

	const searchParams = useSearchParams();
	const consultationid = searchParams?.get("consultationid");

	const handleAddEntry = () => {
		if (currentInput.trim()) {
			const entry = `${selectedCategory}: ${currentInput}\n`;
			setFormData((prevFormData) => ({
				...prevFormData,
				consultation_notes: prevFormData.consultation_notes + entry,
			}));
			setCurrentInput("");
		}
	};

	const handleClearNotes = () => {
		setFormData({ ...formData, consultation_notes: "" });
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!formData.consultation_notes.trim()) {
			newErrors["consultation_notes"] = "At least one entry must be added.";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			setIsSubmitting(true);
			const method = consultationid ? 'PUT' : 'POST';
			const requestUrl = consultationid ? `records/consulation/update?consultationid=${consultationid}` : 'records/consulation';
			const payload = {
				...formData,
				patientid,
				consulationby: employeeid,
			};
			console.log("Submitting payload:", payload);
			const response = await customPost(requestUrl, method, payload);
			if (response?.message) {
				toast.success(response.message);
			}
			if ((response?.recordId && !consultationid) || (method === 'PUT' && response?.status)) {
				if (!consultationid) {
					setFormData({
						consultation_notes: "",
						record_type: "OPD New Cases",
					});
					setCurrentInput("");
				}
				setShowPostSubmitModal(true);
			}
			setIsSubmitting(false);
		} else {
			setIsSubmitting(false);
		}
	};

	const handleCloseVitalsingModal = () => {
		setCloseVital(false);
	};





	useEffect(() => {
		if (consultationid) {
			const fetchConsultationData = async () => {
				if (!consultationid) return;
				setEditingMode(true);
				try {
					const data = await customFetch(`records/consultation/get/consultation?consultationid=${consultationid}`);
					if (data) {
						setFormData((prevFormData) => ({
							...prevFormData,
							consultation_notes: data.consultation_notes || "",
							record_type: data.record_type || "OPD New Cases",
						}));
					}
					setEditingMode(false);
				} catch (error) {
					console.error("Error fetching consultation data:", error);
					setEditingMode(false);
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
									consultation_notes: "",
									record_type: "OPD New Cases",
								});
								setCurrentInput("");
								setEditingMode(false);
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
				<div>
					<PreviewPatientInformation patientid={patientid} />
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
					<Col>
						<Form onSubmit={handleSubmit}>
							<div style={{ marginBottom: "16px" }}>
								<label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem" }}>Category</label>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									style={{ width: "100%", padding: "8px", fontSize: "0.9rem", border: "1px solid #ccc", borderRadius: "4px" }}
									disabled={editingMode}
								>
									{CATEGORIES.map((cat) => (
										<option key={cat.key} value={cat.key}>{cat.label}</option>
									))}
								</select>
							</div>

							<div style={{ marginBottom: "16px" }}>
								<label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem" }}>Add Entry</label>
								<textarea
									value={currentInput}
									onChange={(e) => setCurrentInput(e.target.value)}
									placeholder="Enter consultation notes..."
									rows={4}
									style={{ width: "100%", padding: "8px", fontSize: "0.9rem", border: "1px solid #ccc", borderRadius: "4px", resize: "none" }}
									disabled={editingMode}
								/>
								<button
									type="button"
									onClick={handleAddEntry}
									disabled={editingMode || !currentInput.trim()}
									style={{
										marginTop: "8px",
										padding: "6px 12px",
										backgroundColor: "#28a745",
										color: "white",
										border: "none",
										borderRadius: "4px",
										cursor: editingMode || !currentInput.trim() ? "not-allowed" : "pointer",
										fontSize: "0.9rem",
										opacity: editingMode || !currentInput.trim() ? 0.5 : 1,
									}}
								>
									+ Add Entry
								</button>
							</div>

							<div style={{ marginBottom: "16px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
									<label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Consultation Notes</label>
									{!editingMode && formData.consultation_notes && (
										<button
											type="button"
											onClick={handleClearNotes}
											style={{
												padding: "4px 8px",
												backgroundColor: "#dc3545",
												color: "white",
												border: "none",
												borderRadius: "4px",
												cursor: "pointer",
												fontSize: "0.85rem",
											}}
										>
											Clear
										</button>
									)}
								</div>
								<textarea
									value={formData.consultation_notes}
									onChange={(e) => setFormData({ ...formData, consultation_notes: e.target.value })}
									placeholder="Your consultation notes will appear here..."
									rows={6}
									style={{
										width: "100%",
										padding: "8px",
										fontSize: "0.9rem",
										border: "1px solid #ccc",
										borderRadius: "4px",
										resize: "none",
										fontFamily: "monospace",
									}}
									readOnly={editingMode}
								/>
								{errors["consultation_notes"] && (
									<div style={{ color: "#dc3545", marginTop: "4px", fontSize: "0.85rem" }}>{errors["consultation_notes"]}</div>
								)}
							</div>

							<div style={{ marginTop: "16px", textAlign: "right" }}>
								<button disabled={isSubmitting} type="submit" style={{ padding: "6px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}>
									{isSubmitting ? "submitting...." : "submit"}
								</button>
							</div>
						</Form>
					</Col>

					<Col>
						<div className="bg-white p-3 border rounded mt-3">
							<h6 className="mb-3 fw-bold">Previous Consultations</h6>
							<PreviousConsulation patientid={clientid} />
						</div>
					</Col>
				</Row>

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
