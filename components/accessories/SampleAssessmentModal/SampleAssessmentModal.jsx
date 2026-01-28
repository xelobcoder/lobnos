import React, { useState, useCallback, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { customFetch, customPost } from "../../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";
import AssessmentRenderingView from "./AssessmentViewSampleValidation";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import {
	RiCheckboxLine,
	RiCheckboxBlankLine,
	RiCheckboxMultipleLine,
	RiSaveLine,
	RiCloseLine,
	RiInformationLine,
	RiErrorWarningLine
} from '@remixicon/react';

const REJECTION_REASONS = [
	{
		id: 'contamination',
		label: 'Sample Contamination',
		description: 'Sample has been contaminated during collection, transport, or processing',
		severity: 'high',
		correctiveActions: [
			'Discard contaminated sample',
			'Recollect sample using proper technique',
			'Review collection procedures with staff',
			'Document incident in quality log'
		]
	},
	{
		id: 'improper_collection',
		label: 'Improper Collection Technique',
		description: 'Sample was not collected according to established protocols',
		severity: 'medium',
		correctiveActions: [
			'Recollect sample with proper technique',
			'Provide additional training to collector',
			'Review collection instructions',
			'Document training completion'
		]
	},
	{
		id: 'labeling_error',
		label: 'Labeling Error',
		description: 'Sample labeling is incorrect or incomplete',
		severity: 'critical',
		correctiveActions: [
			'Relabel sample correctly',
			'Verify patient identification',
			'Review labeling procedures',
			'Implement double-check system'
		]
	},
	{
		id: 'insufficient_volume',
		label: 'Insufficient Sample Volume',
		description: 'Sample volume is inadequate for required testing',
		severity: 'medium',
		correctiveActions: [
			'Recollect adequate volume',
			'Adjust test requirements if possible',
			'Review volume requirements with clinicians',
			'Document volume specifications'
		]
	},
	{
		id: 'hemolysis',
		label: 'Hemolysis',
		description: 'Blood sample shows signs of hemolysis',
		severity: 'high',
		correctiveActions: [
			'Recollect sample with minimal trauma',
			'Use proper collection technique',
			'Review phlebotomy procedures',
			'Consider alternative collection methods'
		]
	},
	{
		id: 'clotted_sample',
		label: 'Clotted Sample',
		description: 'Blood sample has clotted before processing',
		severity: 'high',
		correctiveActions: [
			'Recollect sample immediately',
			'Ensure proper mixing with anticoagulant',
			'Review tube selection and filling',
			'Monitor room temperature during transport'
		]
	},
	{
		id: 'temperature_excursion',
		label: 'Temperature Excursion',
		description: 'Sample was not maintained at proper temperature',
		severity: 'critical',
		correctiveActions: [
			'Discard sample if stability compromised',
			'Review transport and storage procedures',
			'Verify temperature monitoring systems',
			'Implement corrective actions for transport'
		]
	},
	{
		id: 'expired_tube',
		label: 'Expired Collection Tube',
		description: 'Collection tube has exceeded expiration date',
		severity: 'medium',
		correctiveActions: [
			'Replace with fresh collection tube',
			'Review inventory management procedures',
			'Implement tube rotation system',
			'Document expiration dates clearly'
		]
	},
	{
		id: 'wrong_tube_type',
		label: 'Wrong Tube Type',
		description: 'Incorrect tube type used for the requested test',
		severity: 'high',
		correctiveActions: [
			'Recollect in correct tube type',
			'Review test requirements and tube selection',
			'Update collection guides',
			'Provide additional training'
		]
	},
	{
		id: 'other',
		label: 'Other',
		description: 'Other rejection reason not listed above',
		severity: 'medium',
		correctiveActions: [
			'Document specific reason',
			'Determine appropriate corrective action',
			'Review procedures if needed',
			'Prevent recurrence'
		]
	}
];

export default function SampleAssessmentModal({
	show,
	hide,
	billingid,
	removeClient,
	multiMode = false,
	selectedItems = [],
	onMultiProcessComplete = () => { },
	data = []
}) {
	const [loading, setLoading] = useState(true);
	const [testcollection, setTestCollection] = useState([]);
	const [selectedTests, setSelectedTests] = useState([]);
	const [showInstructions, setShowInstructions] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [processedItems, setProcessedItems] = useState([]);
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;
	const employeeid = user?.employeeid;

	const currentBillingId = multiMode ? selectedItems[currentIndex] : billingid;
	const currentItemData = multiMode ? data.find(item => item.billingid === currentBillingId) : null;

	const getClientAscention = useCallback(async (id) => {
		if (id) {
			try {
				setLoading(true);
				const { result } = await customFetch(`phelobotomy/sample/assesment/list?billingid=${id}`);
				setTestCollection(result);
			} catch (err) {
				setTestCollection([]);
			} finally {
				setLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		if (show) {
			setCurrentIndex(0);
			setProcessedItems([]);
			setSelectedTests([]);
			getClientAscention(currentBillingId);
		}
	}, [show, getClientAscention]);

	useEffect(() => {
		if (show && multiMode && currentBillingId) {
			getClientAscention(currentBillingId);
		}
	}, [currentIndex, currentBillingId, getClientAscention, show, multiMode]);

	const validateSample = async (id, sat) => {
		const status = sat === "accept" ? 1 : 0;
		setTestCollection(prev => {
			return prev.map(item => {
				if (item.testid === id) {
					if (status === 1) {
						return {
							...item,
							validatedby: employeeid,
							approvalstatus: status,
							declinemessage: null,
							rejectionDetails: null,
							showRejectionForm: false,
							validatedon: new Date(),
						};
					} else {
						return {
							...item,
							approvalstatus: status,
							showRejectionForm: true,
							validatedby: employeeid,
							validatedon: new Date(),
						};
					}
				}
				return item;
			});
		});
	};

	const handleRejectionDetailsChange = (testId, field, value) => {
		setTestCollection(prev => {
			return prev.map(item => {
				if (item.testid === testId) {
					return {
						...item,
						rejectionDetails: {
							...item.rejectionDetails,
							[field]: value
						}
					};
				}
				return item;
			});
		});
	};

	const handleSelectAll = () => {
		if (selectedTests.length === testcollection.length) {
			setSelectedTests([]);
		} else {
			setSelectedTests(testcollection.map(item => item.testid));
		}
	};

	const handleBulkAction = (action) => {
		selectedTests.forEach(id => validateSample(id, action));
	};

	const handleSubmit = async () => {
		try {
			const hasIncompleteRejections = testcollection.some(
				(item) => item.approvalstatus === 0 && (!item.rejectionDetails || !item.rejectionDetails.reason)
			);

			if (hasIncompleteRejections) {
				return toast.error("Please provide complete rejection details for all rejected samples.");
			}

			setLoading(true);

			const pushResponse = await customPost(`sample/transaction/sample/validation/update`, "PUT", { testcollection });

			const { status, message } = pushResponse;

			if (status == true) {
				toast.success(message);

				if (multiMode) {
					// Add current item to processed items
					const newProcessedItems = [...processedItems, currentBillingId];
					setProcessedItems(newProcessedItems);

					// Move to next item or complete
					if (currentIndex < selectedItems.length - 1) {
						setCurrentIndex(currentIndex + 1);
						setSelectedTests([]); // Reset selected tests for next item
					} else {
						// All items processed
						onMultiProcessComplete(newProcessedItems);
						hide();
					}
				} else {
					removeClient(billingid);
					hide();
				}
			} else {
				toast.error(message);
			}
		} catch (error) {
			toast.error("An error occurred while processing your request.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleSkipCurrent = () => {
		if (multiMode && currentIndex < selectedItems.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setSelectedTests([]); // Reset selected tests for next item
		}
	};

	const handleProcessAll = async () => {
		// Process all remaining items automatically
		const remainingItems = selectedItems.slice(currentIndex);
		const allProcessedItems = [...processedItems, ...remainingItems];

		// You could add logic here to actually process all items via API
		// For now, we'll just mark them as processed
		onMultiProcessComplete(allProcessedItems);
		hide();
	};

	const handleCheckboxChange = (testid) => {
		setSelectedTests(prev => {
			if (prev.includes(testid)) {
				return prev.filter(id => id !== testid);
			} else {
				return [...prev, testid];
			}
		});
	};

	return (
		<>
			<ToastContainer theme="colored" position="top-center" className={'text-sm'} />
			<Modal show={show} backdrop="static" fullscreen onHide={hide}>
				<Modal.Header closeButton className="bg-light">
					<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 gap-2">
						<div>
							<h5 className="mb-0 d-flex align-items-center">
								<RiInformationLine className="me-2" />
								Sample Assessment And Validation
							</h5>
							{multiMode && (
								<div className="mt-1">
									<span className="badge bg-primary me-2">
										Item {currentIndex + 1} of {selectedItems.length}
									</span>
									{currentItemData && (
										<span className="small text-muted">
											{currentItemData.fullname} - {currentBillingId}
										</span>
									)}
								</div>
							)}
						</div>
						<div className="form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								id="toggleInstructions"
								checked={showInstructions}
								onChange={() => setShowInstructions(!showInstructions)}
							/>
							<label className="form-check-label small" htmlFor="toggleInstructions">
								Show Instructions
							</label>
						</div>
					</div>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="d-flex h-100">
						{/* Left Column - Table and Controls */}
						<div className="flex-fill border-end" style={{ width: '70%', overflowY: 'auto' }}>
							<div className="p-4">
								{testcollection.length > 0 && showInstructions && (
									<div className="alert alert-light mb-3 border pls-color p-2 p-md-3">
										<h6 className="mb-2">Instructions:</h6>
										<ol className="mb-0 small">
											<li>Review each test result carefully before validation</li>
											<li>Use the checkbox to select individual tests or &quot;Select All&quot; for bulk actions</li>
											<li>Click &quot;Accept&quot; to approve or &quot;Reject&quot; to decline a test</li>
											<li>For rejected tests, complete the detailed rejection forms on the right</li>
											<li>Click &quot;Save Changes&quot; to finalize your validation</li>
										</ol>
									</div>
								)}

								<div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-3 p-2 p-md-3 bg-light rounded gap-2">
									<div onClick={handleSelectAll} className="d-flex align-items-center cursor-pointer">
										{selectedTests.length === testcollection.length ?
											<RiCheckboxMultipleLine className="text-primary" /> :
											<RiCheckboxBlankLine className="text-muted" />
										}
										<span className="ml-2 font-weight-medium">Select All</span>
									</div>
									<div className="d-flex gap-2">
										<button
											className="btn btn-success btn-sm mr-2 d-flex align-items-center"
											onClick={() => handleBulkAction('accept')}>
											<RiCheckboxLine className="me-1" />
											<span className="d-none d-md-inline">Accept All</span>
										</button>
										<button
											className="btn btn-danger btn-sm d-flex align-items-center"
											onClick={() => handleBulkAction('reject')}>
											<RiCloseLine className="me-1" />
											<span className="d-none d-md-inline">Reject All</span>
										</button>
									</div>
								</div>

								<AssessmentRenderingView
									loading={loading}
									validateSample={validateSample}
									testcollection={testcollection}
									selectedTests={selectedTests}
									setSelectedTests={setSelectedTests}
									handleCheckboxChange={handleCheckboxChange}
									handleRejectionDetailsChange={handleRejectionDetailsChange}
									showRejectionForms={false}
								/>
							</div>
						</div>

						{/* Right Column - Rejection Details */}
						<div className="flex-fill" style={{ width: '30%', overflowY: 'auto' }}>
							<div className="p-4">
								{testcollection.some(item => item.approvalstatus === 0 && item.showRejectionForm) ? (
									<>
										<h6 className="mb-3">
											<RiErrorWarningLine className="me-2" />
											Rejection Details Required
										</h6>
										{testcollection
											.filter(item => item.approvalstatus === 0 && item.showRejectionForm)
											.map((item, index) => (
												<div key={`rejection-${item.testid}`} className="mb-4 p-3 border rounded">
													<h6 className="mb-3 fw-bold">
														{item.name} - {item.patientname || item.fullname}
													</h6>

													<div className="mb-3">
														<label className="form-label fw-bold">Rejection Reason</label>
														<select
															className="form-select"
															value={item.rejectionDetails?.reason || ''}
															onChange={(e) => {
																const selectedReason = REJECTION_REASONS.find(r => r.id === e.target.value);
																handleRejectionDetailsChange(item.testid, 'reason', e.target.value);
																handleRejectionDetailsChange(item.testid, 'reasonLabel', selectedReason?.label);
																handleRejectionDetailsChange(item.testid, 'severity', selectedReason?.severity);
																handleRejectionDetailsChange(item.testid, 'correctiveActions', []);
															}}
														>
															<option value="">Select a reason...</option>
															{REJECTION_REASONS.map(reason => (
																<option key={reason.id} value={reason.id}>
																	{reason.label}
																</option>
															))}
														</select>
													</div>

													{item.rejectionDetails?.reason === 'other' && (
														<div className="mb-3">
															<label className="form-label">Specify Other Reason</label>
															<textarea
																className="form-control"
																rows="2"
																placeholder="Please specify the rejection reason..."
																value={item.rejectionDetails?.customReason || ''}
																onChange={(e) => handleRejectionDetailsChange(item.testid, 'customReason', e.target.value)}
															/>
														</div>
													)}

													<div className="mb-3">
														<label className="form-label">Additional Notes</label>
														<textarea
															className="form-control"
															rows="2"
															placeholder="Any additional information about this rejection..."
															value={item.rejectionDetails?.additionalNotes || ''}
															onChange={(e) => handleRejectionDetailsChange(item.testid, 'additionalNotes', e.target.value)}
														/>
													</div>

													<div className="mb-3">
														<label className="form-label fw-bold">Mode of Communication</label>
														<div className="d-flex gap-2 flex-wrap">
															{['Email', 'SMS', 'Phone', 'In-Person'].map(mode => (
																<div key={mode} className="form-check">
																	<input
																		className="form-check-input"
																		type="checkbox"
																		id={`comm-${item.testid}-${mode}`}
																		checked={item.rejectionDetails?.communicationModes?.includes(mode) || false}
																		onChange={(e) => {
																			const currentModes = item.rejectionDetails?.communicationModes || [];
																			const newModes = e.target.checked
																				? [...currentModes, mode]
																				: currentModes.filter(m => m !== mode);
																			handleRejectionDetailsChange(item.testid, 'communicationModes', newModes);
																		}}
																	/>
																	<label className="form-check-label" htmlFor={`comm-${item.testid}-${mode}`}>
																		{mode}
																	</label>
																</div>
															))}
														</div>
													</div>

													{item.rejectionDetails?.reason && (
														<div>
															<div className="mb-3">
																<label className="form-label fw-bold">Severity</label>
																<div>
																	<span className="badge bg-secondary fs-6 p-2">
																		{REJECTION_REASONS.find(r => r.id === item.rejectionDetails.reason)?.severity?.toUpperCase()}
																	</span>
																</div>
															</div>

															<div className="mb-3">
																<label className="form-label fw-bold">Suggested Corrective Actions</label>
																<div className="border rounded p-2">
																	{REJECTION_REASONS.find(r => r.id === item.rejectionDetails.reason)?.correctiveActions.map((action, idx) => (
																		<div key={idx} className="mb-3">
																			<div className="form-check">
																				<input
																					className="form-check-input"
																					type="checkbox"
																					id={`action-${item.testid}-${idx}`}
																					checked={item.rejectionDetails?.correctiveActions?.includes(action) || false}
																					onChange={(e) => {
																						const currentActions = item.rejectionDetails?.correctiveActions || [];
																						const newActions = e.target.checked
																							? [...currentActions, action]
																							: currentActions.filter(a => a !== action);
																						handleRejectionDetailsChange(item.testid, 'correctiveActions', newActions);
																					}}
																				/>
																				<label className="form-check-label small fw-bold" htmlFor={`action-${item.testid}-${idx}`}>
																					{action}
																				</label>
																			</div>
																			{item.rejectionDetails?.correctiveActions?.includes(action) && (
																				<div className="ms-3 mt-2">
																					<label className="form-label small text-muted">Assign to:</label>
																					<select
																						className="form-select form-select-sm"
																						value={item.rejectionDetails?.actionAssignees?.[action] || ''}
																						onChange={(e) => {
																							const currentAssignees = item.rejectionDetails?.actionAssignees || {};
																							handleRejectionDetailsChange(item.testid, 'actionAssignees', {
																								...currentAssignees,
																								[action]: e.target.value
																							});
																						}}
																					>
																						<option value="">Select assignee...</option>
																						<option value="lab_manager">Lab Manager</option>
																						<option value="quality_officer">Quality Officer</option>
																						<option value="phlebotomist">Phlebotomist</option>
																						<option value="technician">Lab Technician</option>
																						<option value="supervisor">Supervisor</option>
																						<option value="other">Other</option>
																					</select>
																				</div>
																			)}
																		</div>
																	))}
																</div>
															</div>
														</div>
													)}

													<div className="mb-3">
														<label className="form-label">Additional Corrective Actions</label>
														<textarea
															className="form-control"
															rows="3"
															placeholder="Specify any additional corrective actions not listed above..."
															value={item.rejectionDetails?.additionalCorrectiveActions || ''}
															onChange={(e) => handleRejectionDetailsChange(item.testid, 'additionalCorrectiveActions', e.target.value)}
														/>
														{item.rejectionDetails?.additionalCorrectiveActions && (
															<div className="mt-2">
																<label className="form-label small text-muted">Assign to:</label>
																<select
																	className="form-select form-select-sm"
																	value={item.rejectionDetails?.additionalCorrectiveActionsAssignee || ''}
																	onChange={(e) => handleRejectionDetailsChange(item.testid, 'additionalCorrectiveActionsAssignee', e.target.value)}
																>
																	<option value="">Select assignee...</option>
																	<option value="lab_manager">Lab Manager</option>
																	<option value="quality_officer">Quality Officer</option>
																	<option value="phlebotomist">Phlebotomist</option>
																	<option value="technician">Lab Technician</option>
																	<option value="supervisor">Supervisor</option>
																	<option value="other">Other</option>
																</select>
															</div>
														)}
													</div>
												</div>
											))}
									</>
								) : (
									<div className="d-flex align-items-center justify-content-center h-100 text-muted">
										<div className="text-center">
											<RiInformationLine size={48} className="mb-3 opacity-50" />
											<h6>No Rejections to Process</h6>
											<p className="small">Click &quot;Reject&quot; on samples in the table to add rejection details here.</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer className="bg-light">
					<div className="d-flex justify-content-between w-100">
						<div>
							{multiMode && (
								<div className="d-flex gap-2">
									{currentIndex > 0 && (
										<button
											className="btn btn-outline-secondary btn-sm"
											onClick={() => setCurrentIndex(currentIndex - 1)}
											disabled={loading}
										>
											Previous
										</button>
									)}
									{currentIndex < selectedItems.length - 1 && (
										<button
											className="btn btn-outline-warning btn-sm"
											onClick={handleSkipCurrent}
											disabled={loading}
										>
											Skip This Item
										</button>
									)}
									<button
										className="btn btn-warning btn-sm"
										onClick={handleProcessAll}
										disabled={loading}
									>
										Process All Remaining
									</button>
								</div>
							)}
						</div>
						<div className="d-flex gap-2">
							<button
								className="btn btn-primary btn-sm d-flex align-items-center"
								onClick={handleSubmit}
								disabled={loading}>
								<RiSaveLine className="me-1" />
								{multiMode ? (
									currentIndex === selectedItems.length - 1 ? 'Save & Complete' : 'Save & Next'
								) : 'Save Changes'}
							</button>
							<button
								className="btn btn-outline-danger btn-sm d-flex align-items-center"
								onClick={hide}
								disabled={loading}>
								<RiCloseLine className="me-1" />
								Close
							</button>
						</div>
					</div>
				</Modal.Footer>
			</Modal>
		</>
	);
}