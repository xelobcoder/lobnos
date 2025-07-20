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
    RiInformationLine  
} from '@remixicon/react';

export default function SampleAssessmentModal({ 
	show, 
	hide, 
	billingid, 
	removeClient, 
	multiMode = false, 
	selectedItems = [], 
	onMultiProcessComplete = () => {},
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
							validatedon: new Date(),
						};
					} else {
						const { rejectionmessage } = item;
						if (!rejectionmessage || (typeof rejectionmessage === "string" && rejectionmessage.length <= 5)) {
							toast.error('Warning!! Kindly Provide Reason for Sample Rejection');
							return item;
						}
						return {
							...item,
							approvalstatus: status,
							validatedby: employeeid,
							validatedon: new Date(),
						};
					}
				}
				return item;
			});
		});
	};

	const handleDeclineMessage = async (ev, id) => {
		const message = ev.target.value;
		setTestCollection((prev) => {
			return prev.map((item) => {
				if (item.testid == id) {
					return { ...item, rejectionmessage: message };
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
			const hasEmptyDeclineMessage = testcollection.some(
				(item) => item.approvalstatus === 0 && !item.rejectionmessage
			);

			if (hasEmptyDeclineMessage) {
				return toast.error("Decline message is required for rejected samples.");
			}

			setLoading(true);

			const pushResponse = await customPost(`sample/transaction/sample/validation/update`, "PUT", { testcollection });

			const { status, message } = pushResponse;

			if (status === true) {
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
			<Modal show={show} backdrop="static" size="xl" onHide={hide} scrollable>
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
				<Modal.Body className="p-4">
					{testcollection.length > 0 && showInstructions && (
					    <div className="alert alert-light mb-3 border pls-color p-2 p-md-3">
					        <h6 className="mb-2">Instructions:</h6>
					        <ol className="mb-0 small">
					            <li>Review each test result carefully before validation</li>
					            <li>Use the checkbox to select individual tests or &quot;Select All&quot; for bulk actions</li>
					            <li>Click &quot;Accept&quot; to approve or &quot;Reject&quot; to decline a test</li>
					            <li>For rejected tests, provide a clear reason in the decline message field</li>
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
						handleDeclineMessage={handleDeclineMessage}
						validateSample={validateSample}
						testcollection={testcollection}
						selectedTests={selectedTests}
						setSelectedTests={setSelectedTests}
						handleCheckboxChange={handleCheckboxChange}
					/>
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