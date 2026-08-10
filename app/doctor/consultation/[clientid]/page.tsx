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
import { RiArrowLeftLine, RiClipboardLine, RiFileList3Line, RiFlaskFill, RiHeartPulseFill, RiRefreshLine, RiStethoscopeFill } from '@remixicon/react';

type RecordType = 'Old Record' | 'In-Process (Today)' | 'IPD Review' | 'OPD New Cases';

interface FormData {
	consultation_notes: string;
	record_type: RecordType;
}

type SectionNotes = Record<string, string>;

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

const createEmptySectionNotes = (): SectionNotes =>
	CATEGORIES.reduce((acc, category) => {
		acc[category.key] = "";
		return acc;
	}, {} as SectionNotes);

const findCategoryForLine = (line: string) => {
	const normalized = line.trim().toLowerCase();
	return CATEGORIES.find((category) => {
		const options = [category.key, category.label].map((value) => `${value.toLowerCase()}:`);
		return options.some((option) => normalized.startsWith(option));
	});
};

const parseConsultationNotes = (notes: string): SectionNotes => {
	const parsed = createEmptySectionNotes();
	let currentCategoryKey: string | null = null;

	notes.split(/\r?\n/).forEach((rawLine) => {
		const line = rawLine.trim();
		if (!line) return;

		const matchedCategory = findCategoryForLine(line);
		if (matchedCategory) {
			currentCategoryKey = matchedCategory.key;
			const categoryPrefixes = [matchedCategory.key, matchedCategory.label].map((value) => `${value}:`);
			const value = categoryPrefixes.reduce((result, prefix) => {
				if (result.toLowerCase().startsWith(prefix.toLowerCase())) {
					return result.slice(prefix.length).trim();
				}
				return result;
			}, line);

			if (value) {
				parsed[currentCategoryKey] = parsed[currentCategoryKey]
					? `${parsed[currentCategoryKey]}\n${value}`
					: value;
			}
			return;
		}

		if (!currentCategoryKey) {
			currentCategoryKey = "Complaints";
		}

		parsed[currentCategoryKey] = parsed[currentCategoryKey]
			? `${parsed[currentCategoryKey]}\n${line}`
			: line;
	});

	return parsed;
};

const aggregateConsultationNotes = (sectionNotes: SectionNotes) =>
	CATEGORIES.map((category) => {
		const value = sectionNotes[category.key]?.trim();
		if (!value) return null;
		return `${category.label}:\n${value}`;
	})
		.filter(Boolean)
		.join("\n\n");

const ConsulationPanel = ({ params }: { params: { clientid: number } }) => {
	const router = useRouter();
	const { clientid } = params
	const patientid = plsDecryption(clientid.toString());
	const employeeid = useApplicationSettings().applicationsettings.user.employeeid;
	const [formData, setFormData] = useState<FormData>({
		consultation_notes: "",
		record_type: "OPD New Cases",
	});
	const [sectionNotes, setSectionNotes] = useState<SectionNotes>(() => createEmptySectionNotes());
	const [editingMode, setEditingMode] = useState<boolean>(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPostSubmitModal, setShowPostSubmitModal] = useState(false);
	const [openVitalSign, setCloseVital] = useState<boolean>(false);
	const [showPreviousConsultationModal, setShowPreviousConsultationModal] = useState(false);

	const searchParams = useSearchParams();
	const consultationid = searchParams?.get("consultationid");
	const serviceid = searchParams?.get("serviceid");
	const aggregatedNotes = aggregateConsultationNotes(sectionNotes);
	const noteEntries = CATEGORIES.filter((category) => sectionNotes[category.key]?.trim());
	const wordCount = aggregatedNotes.trim()
		? aggregatedNotes.trim().split(/\s+/).length
		: 0;
	const isEditingExistingConsultation = Boolean(consultationid);
	const actionTitle = isEditingExistingConsultation ? 'Edit Consultation' : 'New Consultation';
	const actionSubtitle = isEditingExistingConsultation
		? 'Review and refine an existing clinical note before saving changes.'
		: 'Capture the patient story in structured blocks, then submit the complete consultation.';

	const handleClearNotes = () => {
		setSectionNotes(createEmptySectionNotes());
		setFormData((prevFormData) => ({ ...prevFormData, consultation_notes: "" }));
	};

	const resetConsultationForm = () => {
		setFormData({
			consultation_notes: "",
			record_type: "OPD New Cases",
		});
		setSectionNotes(createEmptySectionNotes());
		setEditingMode(false);
		router.replace(`/doctor/consultation/${clientid}`);
	};

	const handleSectionChange = (key: string, value: string) => {
		setSectionNotes((prevSectionNotes) => ({
			...prevSectionNotes,
			[key]: value,
		}));

		if (errors["consultation_notes"]) {
			setErrors((prevErrors) => ({ ...prevErrors, consultation_notes: "" }));
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!aggregateConsultationNotes(sectionNotes).trim()) {
			newErrors["consultation_notes"] = "At least one entry must be added.";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			setIsSubmitting(true);
			const compiledConsultationNotes = aggregateConsultationNotes(sectionNotes);
			const method = consultationid ? 'PUT' : 'POST';
			const requestUrl = consultationid ? `records/consulation/update?consultationid=${consultationid}` : 'records/consulation';
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
			if ((response?.recordId && !consultationid) || (method === 'PUT' && response?.status)) {
				if (!consultationid) {
					setFormData({
						consultation_notes: "",
						record_type: "OPD New Cases",
					});
					setSectionNotes(createEmptySectionNotes());
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
						const parsedNotes = parseConsultationNotes(data.consultation_notes || "");
						setFormData((prevFormData) => ({
							...prevFormData,
							consultation_notes: data.consultation_notes || "",
							record_type: data.record_type || "OPD New Cases",
						}));
						setSectionNotes(parsedNotes);
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
				<section className={styles.heroSection}>
					<div className={styles.heroTopBar}>
						<button type="button" className={styles.ghostAction} onClick={() => router.push('/doctor/consultation')}>
							<RiArrowLeftLine size={18} />
							<span>Back to Patient Selection</span>
						</button>
						<div className={styles.heroTopActions}>
							<button type="button" className={styles.secondaryAction} onClick={() => setShowPreviousConsultationModal(true)}>
								<RiFileList3Line size={18} />
								<span>Previous Consultations</span>
							</button>
							<button type="button" className={styles.secondaryAction} onClick={() => setCloseVital(true)}>
								<RiHeartPulseFill size={18} />
								<span>Vital Signs</span>
							</button>
							<button
								type="button"
								className={styles.successAction}
								onClick={() => {
									router.push(`/billing/patientid/${clientid}/multi`);
								}}
							>
								<RiFlaskFill size={18} />
								<span>Order Laboratory Test</span>
							</button>
							<button type="button" className={styles.primaryAction} onClick={resetConsultationForm}>
								<RiRefreshLine size={18} />
								<span>New Consultation</span>
							</button>
						</div>
					</div>

					<div className="row g-3 align-items-center">
						<div className="col-xl-8 col-lg-8">
							<div className={styles.heroBadge}>Clinical Consultation Workspace</div>
							<h1 className={styles.heroTitle}>{actionTitle}</h1>
							<p className={styles.heroSubtitle}>{actionSubtitle}</p>
							<div className={styles.heroMetaRow}>
								<span className={styles.heroMetaPill}>{formData.record_type}</span>
								<span className={styles.heroMetaPill}>{noteEntries.length} section{noteEntries.length === 1 ? '' : 's'} completed</span>
								<span className={styles.heroMetaPill}>{wordCount} word{wordCount === 1 ? '' : 's'}</span>
							</div>
						</div>
						<div className="col-xl-4 col-lg-4">
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
									<div className={styles.summaryLabel}>Patient Context</div>
									<div className={styles.summaryValue}>Minified header</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className={styles.patientSnapshotCompact}>
					<div className={styles.patientStripHeader}>
						<div className={styles.patientStripTitle}>Patient Context</div>
						<button type="button" className={styles.patientStripAction} onClick={() => setShowPreviousConsultationModal(true)}>
							Open Previous Consultations
						</button>
					</div>
					<div className={styles.patientInfoFrame}>
						<PreviewPatientInformation patientid={patientid} compact />
					</div>
				</section>
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
				<Row className="g-4 mt-1">
					<Col xs={12}>
						<div className={styles.workspaceCard}>
							<div className={styles.sectionHeaderRow}>
								<div>
									<div className={styles.sectionEyebrow}>Consultation Builder</div>
									<h2 className={styles.sectionTitle}>{actionTitle}</h2>
								</div>
								<div className={styles.sectionHint}>{editingMode ? 'Loading consultation data...' : 'Document each clinical block separately. The system will compile a single progress report when you save.'}</div>
							</div>

							<Form onSubmit={handleSubmit}>
								<div className="row g-4">
									<div className="col-12">
										<div className={styles.fieldPanel}>
											<div className={styles.fieldPanelHeader}>
												<RiStethoscopeFill size={18} />
												<span>Record Type</span>
											</div>
											<Form.Select
												value={formData.record_type}
												onChange={(e) => handleInputChange('record_type', e.target.value as RecordType)}
												disabled={editingMode}
												className={styles.selectField}
											>
												<option value="OPD New Cases">OPD New Cases</option>
												<option value="In-Process (Today)">In-Process (Today)</option>
												<option value="IPD Review">IPD Review</option>
												<option value="Old Record">Old Record</option>
											</Form.Select>
										</div>
									</div>

									<div className="col-12">
										<div className={styles.composerPanel}>
											<div className={styles.composerHeader}>
												<div>
													<div className={styles.panelTitle}>Clinical Note Sections</div>
													<div className={styles.panelSubtitle}>Enter each section directly. All completed sections are merged into the final progress report.</div>
												</div>
												<button type="button" className={styles.clearNotesButton} onClick={handleClearNotes} disabled={editingMode || !aggregatedNotes.trim()}>
													Clear All
												</button>
											</div>
											<div className={styles.noteGrid}>
												{CATEGORIES.map((category) => (
													<div key={category.key} className={styles.noteSectionCard}>
														<div className={styles.noteSectionHeader}>
															<span>{category.label}</span>
															<small>{sectionNotes[category.key]?.trim() ? 'Documented' : 'Awaiting entry'}</small>
														</div>
														<Form.Control
															as="textarea"
															value={sectionNotes[category.key] || ''}
															onChange={(e) => handleSectionChange(category.key, e.target.value)}
															placeholder={`Enter ${category.label.toLowerCase()}...`}
															rows={4}
															className={styles.sectionTextarea}
															disabled={editingMode}
														/>
													</div>
												))}
											</div>
										</div>
									</div>

									<div className="col-12">
										<div className={styles.notesPanel}>
											<div className={styles.notesHeader}>
												<div>
													<div className={styles.panelTitle}>Progress Report Preview</div>
													<div className={styles.panelSubtitle}>This is the consolidated consultation note that will be saved.</div>
												</div>
												<div className={styles.noteStats}>
													<span className={styles.noteStat}><RiClipboardLine size={16} /> {noteEntries.length} sections</span>
													<span className={styles.noteStat}><RiFileList3Line size={16} /> {wordCount} words</span>
												</div>
											</div>
											<Form.Control
												as="textarea"
												value={aggregatedNotes}
												placeholder="Completed sections will be merged into a clinical progress report here..."
												rows={12}
												className={styles.notesTextarea}
												readOnly
											/>
											{errors["consultation_notes"] ? <div className={styles.validationError}>{errors["consultation_notes"]}</div> : null}
										</div>
									</div>

									<div className="col-12">
										<div className={styles.submitRow}>
											<div className={styles.submitHint}>Save this record when the clinical note is complete and ready for downstream actions.</div>
											<Button disabled={isSubmitting} type="submit" className={styles.submitButton}>
												{isSubmitting ? 'Submitting...' : isEditingExistingConsultation ? 'Update Consultation' : 'Save Consultation'}
											</Button>
										</div>
									</div>
								</div>
							</Form>
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
