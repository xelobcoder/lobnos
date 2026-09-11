"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Container, Row, Col, Form, Button, Modal, Offcanvas } from "react-bootstrap";
import PreviewPatientInformation from "../../../../components/petientsComponent/PreviewPatientInformation";
import { customFetch, customPost, customFetchMutation, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import Select from "react-select";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import PreviousConsulation from "../../../../components/doctors/PreviousConsulation";
import LabOrdersPanel from "../../../../components/doctor/LabOrdersPanel";
import DrugOrderPanel from "../../../../components/doctor/DrugOrderPanel";
import { useSearchParams, useRouter } from "next/navigation";
import VitalSignCustomerListInformation from '../../../../components/customer/vitalSignCustomerList'
import styles from './ConsultationPanel.module.css'
import { plsDecryption } from "../../../../lib/encryption";
import { RiArrowLeftLine, RiFileList3Line, RiFlaskFill, RiHeartPulseFill, RiMedicineBottleLine, RiMenuLine, RiRefreshLine, RiStethoscopeFill } from '@remixicon/react';

type RecordType = 'Old Record' | 'In-Process (Today)' | 'IPD Review' | 'OPD New Cases';

interface FormData {
	consultation_notes: string;
	record_type: RecordType;
}

const isContentEmpty = (text?: string) => !text || text.trim() === '';
const stripHtml = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');

const ConsulationPanel = ({ params }: { params: { clientid: number } }) => {
	const router = useRouter();
	const { clientid } = params
	const patientid = plsDecryption(clientid.toString());
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;
	const [formData, setFormData] = useState<FormData>({
		consultation_notes: "",
		record_type: "OPD New Cases",
	});
	const [consultationNotesHtml, setConsultationNotesHtml] = useState('');
	const [editingMode, setEditingMode] = useState<boolean>(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPostSubmitModal, setShowPostSubmitModal] = useState(false);
	const [openVitalSign, setCloseVital] = useState<boolean>(false);
	const [showPreviousConsultationModal, setShowPreviousConsultationModal] = useState(false);
	const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
	const workspaceCardRef = React.useRef<HTMLDivElement>(null);

	// Refs for table-row navigation and focusing
	const progressNoteRowRef = React.useRef<HTMLTableRowElement>(null);
	const labOrdersRowRef = React.useRef<HTMLTableRowElement>(null);
	const drugRequestRowRef = React.useRef<HTMLTableRowElement>(null);

	const searchParams = useSearchParams();
	const consultationid = searchParams?.get("consultationid");
	const serviceid = searchParams?.get("serviceid");
	// Mirrors `consultationid`, but can be set immediately (via draft creation, or right after a first save,
	// before the URL/searchParams catch up) so orders are always tagged with a real consultation.
	const [activeConsultationId, setActiveConsultationId] = useState<string | null>(consultationid);
	const [pendingLabOrderIds, setPendingLabOrderIds] = useState<number[]>([]);
	const [pendingDrugOrderIds, setPendingDrugOrderIds] = useState<string[]>([]);
	// Captures whether we ARRIVED with a consultationid (truly editing history) vs one we drafted ourselves just now,
	// so the "New Consultation" vs "Edit Consultation" heading doesn't flip once the draft is created.
	const arrivedWithConsultationId = useRef(Boolean(consultationid));
	const draftCreationAttempted = useRef(false);

	useEffect(() => {
		setActiveConsultationId(consultationid);
	}, [consultationid]);

	// Create the consultation record immediately for a brand-new consultation, before any note is typed,
	// so lab/drug orders placed from the very first moment are already tied to a real consultationId.
	const createDraftConsultation = async () => {
		try {
			const response = await customPost('records/consulation', 'POST', {
				consultation_notes: '',
				record_type: 'OPD New Cases',
				patientid,
				consulationby: employeeid,
				associatedTransactionid: serviceid ? Number(serviceid) : undefined,
			});
			if (response?.recordId) {
				setActiveConsultationId(String(response.recordId));
				const query = serviceid ? `?consultationid=${response.recordId}&serviceid=${serviceid}` : `?consultationid=${response.recordId}`;
				router.replace(`/doctor/consultation/${clientid}${query}`);
			}
		} catch (error) {
			console.error('Failed to initialize consultation record', error);
		}
	};

	useEffect(() => {
		if (consultationid || draftCreationAttempted.current) return;
		draftCreationAttempted.current = true;
		createDraftConsultation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const wordCount = stripHtml(consultationNotesHtml).trim()
		? stripHtml(consultationNotesHtml).trim().split(/\s+/).length
		: 0;
	const isEditingExistingConsultation = arrivedWithConsultationId.current;
	const actionTitle = isEditingExistingConsultation ? 'Edit Consultation' : 'New Consultation';
	const actionSubtitle = isEditingExistingConsultation
		? 'Review and refine an existing progress note before saving changes.'
		: 'Capture the patient story in structured blocks, then submit the complete consultation.';

	const handleClearNotes = () => {
		setConsultationNotesHtml('');
		setFormData((prevFormData) => ({ ...prevFormData, consultation_notes: "" }));
	};

	const resetConsultationForm = () => {
		setFormData({
			consultation_notes: "",
			record_type: "OPD New Cases",
		});
		setConsultationNotesHtml('');
		setEditingMode(false);
		setActiveConsultationId(null);
		setPendingLabOrderIds([]);
		setPendingDrugOrderIds([]);
		arrivedWithConsultationId.current = false;
		router.replace(`/doctor/consultation/${clientid}`);
		// Immediately draft a fresh consultation record for this new session too.
		createDraftConsultation();
	};

	const handleNotesChange = (value: string) => {
		setConsultationNotesHtml(value);

		if (errors["consultation_notes"]) {
			setErrors((prevErrors) => ({ ...prevErrors, consultation_notes: "" }));
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (isContentEmpty(consultationNotesHtml)) {
			newErrors["consultation_notes"] = "At least one entry must be added.";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Backfills any lab/drug orders placed before this consultation had an id (i.e. before its first save).
	const linkPendingOrdersToConsultation = async (newConsultationId: number) => {
		if (pendingLabOrderIds.length) {
			await customFetchMutation("entityorders/link-consultation", "PUT", {
				orderIds: pendingLabOrderIds,
				patientId: Number(patientid),
				consultationId: newConsultationId,
			});
			setPendingLabOrderIds([]);
		}
		if (pendingDrugOrderIds.length) {
			await customFetchMutation("prescriptions/link-consultation", "PUT", {
				prescriptionIds: pendingDrugOrderIds,
				patientId: Number(patientid),
				consultationId: newConsultationId,
			});
			setPendingDrugOrderIds([]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			setIsSubmitting(true);
			const compiledConsultationNotes = consultationNotesHtml;
			// Use activeConsultationId (set synchronously by the draft-creation effect) rather than the URL
			// param, which may not have caught up yet right after the draft was created.
			const targetConsultationId = activeConsultationId;
			const method = targetConsultationId ? 'PUT' : 'POST';
			const requestUrl = targetConsultationId ? `records/consulation/update?consultationid=${targetConsultationId}` : 'records/consulation';
			const payload = {
				...formData,
				consultation_notes: compiledConsultationNotes,
				patientid,
				consulationby: employeeid,
				associatedTransactionid: serviceid ? Number(serviceid) : undefined,
			};
			const response = await customPost(requestUrl, method, payload);
			if (response?.message) {
				toast.success(response.message);
			}
			if ((response?.recordId && !targetConsultationId) || (method === 'PUT' && response?.status)) {
				if (!targetConsultationId) {
					if (response?.recordId) {
						setActiveConsultationId(String(response.recordId));
						await linkPendingOrdersToConsultation(Number(response.recordId));
					}
					setFormData({
						consultation_notes: "",
						record_type: "OPD New Cases",
					});
					setConsultationNotesHtml('');
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
		// Only fetch/hydrate from the server when we arrived at an existing consultation link — not for
		// a consultation we just drafted ourselves, which would otherwise overwrite notes being typed.
		if (consultationid && arrivedWithConsultationId.current) {
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
						setConsultationNotesHtml(data.consultation_notes || "");
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
				<div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
					<div className="d-flex align-items-center gap-2">
						<button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={() => router.push('/doctor/consultation')}>
							<RiArrowLeftLine size={16} />
							<span>Back</span>
						</button>
						<div>
							<h1 className="fs-5 fw-bold mb-0 text-dark">{actionTitle}</h1>
							<span className="text-muted small">{formData.record_type} · {wordCount} word{wordCount === 1 ? '' : 's'}</span>
						</div>
					</div>
					<button type="button" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1" onClick={() => setShowWorkspaceMenu(true)} style={{ backgroundColor: '#0f766e', borderColor: '#0f766e' }}>
						<RiMenuLine size={16} />
						<span>Workspace Menu</span>
					</button>
				</div>

				<Offcanvas show={showWorkspaceMenu} onHide={() => setShowWorkspaceMenu(false)} placement="end">
					<Offcanvas.Header closeButton>
						<Offcanvas.Title as="div">
							<div className={styles.heroBadge}>Clinical Consultation Workspace</div>
							<div className="fs-5 fw-bold text-dark mt-2">{actionTitle}</div>
							<div className="text-muted small mt-1">{actionSubtitle}</div>
						</Offcanvas.Title>
					</Offcanvas.Header>
					<Offcanvas.Body className="d-flex flex-column gap-3">
						<div className="d-flex flex-column gap-2">
							<button type="button" className={styles.secondaryAction} onClick={() => { setShowWorkspaceMenu(false); setShowPreviousConsultationModal(true); }}>
								<RiFileList3Line size={18} />
								<span>Previous Consultations</span>
							</button>
							<button type="button" className={styles.secondaryAction} onClick={() => { setShowWorkspaceMenu(false); setCloseVital(true); }}>
								<RiHeartPulseFill size={18} />
								<span>Vital Signs</span>
							</button>
							<button
								type="button"
								className={styles.successAction}
								onClick={() => {
									setShowWorkspaceMenu(false);
									setTimeout(() => { labOrdersRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
								}}
							>
								<RiFlaskFill size={18} />
								<span>Order Laboratory Test</span>
							</button>
							<button
								type="button"
								className={styles.secondaryAction}
								onClick={() => {
									setShowWorkspaceMenu(false);
									setTimeout(() => { drugRequestRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
								}}
							>
								<RiMedicineBottleLine size={18} />
								<span>Order Drugs</span>
							</button>
							<button type="button" className={styles.primaryAction} onClick={() => { setShowWorkspaceMenu(false); resetConsultationForm(); }}>
								<RiRefreshLine size={18} />
								<span>New Progress Note</span>
							</button>
						</div>

						<div className={styles.summaryGrid}>
							<div className={styles.summaryCard}>
								<div className={styles.summaryLabel}>Consultation Mode</div>
								<div className={styles.summaryValue}>{isEditingExistingConsultation ? 'Revision' : 'Fresh note'}</div>
							</div>
							<div className={styles.summaryCard}>
								<div className={styles.summaryLabel}>Recorded By</div>
								<div className={styles.summaryValue}>Employee #{employeeid}</div>
							</div>
							<div className={styles.summaryCard}>
								<div className={styles.summaryLabel}>Note Length</div>
								<div className={styles.summaryValue}>{wordCount} word{wordCount === 1 ? '' : 's'}</div>
							</div>
						</div>
					</Offcanvas.Body>
				</Offcanvas>

				<section className="mb-3">
					<div className="card shadow-sm border rounded-3 p-3 bg-white">
						<div className="d-flex align-items-center mb-2 px-1">
							<span className="fs-6 fw-bold text-teal" style={{ color: '#0f766e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
								Patient Context
							</span>
						</div>
						<div className="bg-light-subtle rounded-3 p-1">
							<PreviewPatientInformation patientid={patientid} compact />
						</div>
					</div>
				</section>

				{/* Post-submit modal */}
				<Modal show={showPostSubmitModal} onHide={() => setShowPostSubmitModal(false)} centered>
					<Modal.Header closeButton>
						<Modal.Title>Consultation Saved</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>The progress note was saved successfully. What would you like to do next?</p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="success" onClick={() => { setShowPostSubmitModal(false); setTimeout(() => { labOrdersRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150); }}>
							Order Laboratory Test
						</Button>
						<Button variant="outline-primary" onClick={() => { setShowPostSubmitModal(false); setTimeout(() => { drugRequestRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150); }}>
							Order Drugs
						</Button>
						<Button variant="secondary" onClick={() => router.push('/doctor/consultation')}>
							Back to Consultations List
						</Button>
					</Modal.Footer>
				</Modal>

				<Row className="g-4 mt-1">
					<Col xs={12}>
						<div className={styles.workspaceCard} ref={workspaceCardRef}>
							<div className={styles.sectionHeaderRow}>
								<div>
									<div className={styles.sectionEyebrow}>Clinician Workstation</div>
									<h2 className={styles.sectionTitle}>Patient Care Dashboard</h2>
								</div>
								<div className={styles.sectionHint}>
									Manage progress notes, laboratory tests, and pharmacy drug prescriptions in a unified table layout.
								</div>
							</div>

							<div className="table-responsive mt-3">
								<table className="table table-bordered align-top" style={{ borderColor: 'var(--bs-border-color-translucent)' }}>
									<thead>
										<tr className="table-light">
											<th style={{ width: '25%', minWidth: '220px' }}>Clinical Section</th>
											<th style={{ width: '75%' }}>Interactive Workspace & Orders</th>
										</tr>
									</thead>
									<tbody>
										{/* ROW 1: PROGRESS NOTE */}
										<tr ref={progressNoteRowRef}>
											<td className="bg-light-subtle">
												<div className="d-flex flex-column gap-2 p-2">
													<div className="d-flex align-items-center gap-2">
														<RiStethoscopeFill size={20} className="text-teal" style={{ color: '#0f766e' }} />
														<h3 className="fs-6 fw-bold mb-0 text-dark">Progress Note</h3>
													</div>
													<p className="text-muted small mb-3">
														Capture the narrative of the patient visit. Select a record type and write your progress note.
													</p>
													<div className="mb-2">
														<label className="form-label small fw-semibold text-secondary">Record Type</label>
														<Select
															options={[
																{ value: 'OPD New Cases', label: 'OPD New Cases' },
																{ value: 'In-Process (Today)', label: 'In-Process (Today)' },
																{ value: 'IPD Review', label: 'IPD Review' },
																{ value: 'Old Record', label: 'Old Record' },
															]}
															value={{ value: formData.record_type, label: formData.record_type }}
															onChange={(selected) => {
																if (selected) {
																	handleInputChange('record_type', selected.value as RecordType);
																}
															}}
															isDisabled={editingMode}
															styles={reactSelectCustomStyles}
															classNamePrefix="react-select"
														/>
													</div>
													<div className="mt-2">
														<span className="badge bg-secondary-subtle text-secondary small">
															{wordCount} words
														</span>
													</div>
												</div>
											</td>
											<td>
												<div className="p-2">
													<Form onSubmit={handleSubmit}>
														<div className="d-flex justify-content-between align-items-center mb-2">
															<span className="small text-muted">Notes body:</span>
															<button
																type="button"
																className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
																onClick={handleClearNotes}
																disabled={editingMode || isContentEmpty(consultationNotesHtml)}
															>
																Clear Text
															</button>
														</div>
														{!editingMode && (
															<Form.Control
																as="textarea"
																rows={8}
																placeholder="Describe patient observations, symptoms, progress, diagnosis or findings..."
																value={consultationNotesHtml}
																onChange={(e) => handleNotesChange(e.target.value)}
																className="mb-2 shadow-none border"
															/>
														)}
														{errors["consultation_notes"] && (
															<div className="text-danger small mb-2">{errors["consultation_notes"]}</div>
														)}
														<div className="d-flex justify-content-end">
															<Button size="sm" disabled={isSubmitting} type="submit" variant="primary" style={{ backgroundColor: '#0f766e', borderColor: '#0f766e' }}>
																{isSubmitting ? 'Saving...' : isEditingExistingConsultation ? 'Update Progress Note' : 'Save Progress Note'}
															</Button>
														</div>
													</Form>
												</div>
											</td>
										</tr>

										{/* ROW 2: LAB ORDERS */}
										<tr ref={labOrdersRowRef}>
											<td className="bg-light-subtle">
												<div className="d-flex flex-column gap-2 p-2">
													<div className="d-flex align-items-center gap-2">
														<RiFlaskFill size={20} className="text-teal" style={{ color: '#0f766e' }} />
														<h3 className="fs-6 fw-bold mb-0 text-dark">Lab Orders</h3>
													</div>
													<p className="text-muted small mb-3">
														Order clinical lab tests mapping billing strategy rules directly.
													</p>
												</div>
											</td>
											<td>
												<div className="p-2">
													<LabOrdersPanel
														patientid={patientid}
														consultationid={activeConsultationId ? Number(activeConsultationId) : null}
														onOrderCreatedWithoutConsultation={(orderId) => setPendingLabOrderIds((prev) => [...prev, orderId])}
													/>
												</div>
											</td>
										</tr>

										{/* ROW 3: DRUG REQUEST */}
										<tr ref={drugRequestRowRef}>
											<td className="bg-light-subtle">
												<div className="d-flex flex-column gap-2 p-2">
													<div className="d-flex align-items-center gap-2">
														<RiMedicineBottleLine size={20} className="text-teal" style={{ color: '#0f766e' }} />
														<h3 className="fs-6 fw-bold mb-0 text-dark">Drug Request</h3>
													</div>
													<p className="text-muted small mb-3">
														Prescribe drugs directly to the pharmacy dispensing queue.
													</p>
												</div>
											</td>
											<td>
												<div className="p-2">
													<DrugOrderPanel
														patientid={patientid}
														consultationid={activeConsultationId ? Number(activeConsultationId) : null}
														onOrderCreatedWithoutConsultation={(prescriptionId) => setPendingDrugOrderIds((prev) => [...prev, prescriptionId])}
													/>
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</Col>
				</Row>

				{
					showPreviousConsultationModal && <Modal show={showPreviousConsultationModal} onHide={() => setShowPreviousConsultationModal(false)} size="xl" scrollable dialogClassName={styles.topSheetDialog} contentClassName={styles.topSheetContent}>
						<Modal.Header closeButton className={styles.topSheetHeader}>
							<Modal.Title as="div">
								<div className={styles.topSheetTitle}>Previous Consultations</div>
								<div className={styles.topSheetSubtitle}>Review earlier progress reports without leaving the active consultation workspace.</div>
							</Modal.Title>
						</Modal.Header>
						<Modal.Body className={styles.topSheetBody}>
							<PreviousConsulation patientid={clientid} />
						</Modal.Body>
						<Modal.Footer className={styles.topSheetFooter}>
							<Button variant="secondary" onClick={() => setShowPreviousConsultationModal(false)}>
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				}

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
